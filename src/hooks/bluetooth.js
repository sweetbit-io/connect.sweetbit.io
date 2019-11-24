import { useEffect, useReducer, useState }  from 'react';

const SERVICE_ID = 'ca000000-75dd-4a0e-b688-66b7df342cc6';
const STATUS = 'ca001000-75dd-4a0e-b688-66b7df342cc6';
const SCAN_WIFI = 'ca002000-75dd-4a0e-b688-66b7df342cc6';
const DISCOVERED_WIFI = 'ca003000-75dd-4a0e-b688-66b7df342cc6';
const CONNECT_WIFI = 'ca004000-75dd-4a0e-b688-66b7df342cc6';
const ONION_API = 'ca005000-75dd-4a0e-b688-66b7df342cc6';

const supported = 'bluetooth' in navigator;

async function characteristicByte(characteristic) {
  const value = await characteristic.readValue();
  return byte(value);
}

async function characteristicText(characteristic) {
  const value = await characteristic.readValue();
  return text(value);
}

async function byte(value) {
  return value.getUint8(0);
}

function text(value) {
  return new TextDecoder('utf-8').decode(value);
}

function json(value) {
  return JSON.parse(new TextDecoder('utf-8').decode(value));
}

function dispenserReducer(state = null, patch) {
  if (!patch) {
    return null;
  }

  return {
    ...(state || {}),
    ...patch,
  };
}

function availableWifisReducer(state = [], action) {
  const existingIndex = state.findIndex(e => e.ssid === action.ssid)
  if (existingIndex >= 0) {
    state[existingIndex] = action;
  } else {
    state.push(action);
  }

  return [...state];
}

export function useBluetooth() {
  const [dispenser, setDispenser] = useReducer(dispenserReducer, null);
  const [connecting, setConnecting] = useState(false);
  const [server, setServer] = useState(false);
  const [force, forceUpdate] = useReducer(x => x + 1, 0);
  const [availableWifis, dispatchAvailableWifisAction] = useReducer(availableWifisReducer, []);

  async function connect() {
    setConnecting(true);

    let device;
    try {
      device = await navigator.bluetooth.requestDevice({
        filters: [{
          services: [SERVICE_ID],
        }],
      });
    } catch (e) {
      console.log('failed');
    }

    const server = await device.gatt.connect();

    device.ongattserverdisconnected = disconnected;

    setServer(server);

    setConnecting(false);
  }

  function disconnected(event) {
    const device = event.target;

    setServer(null);
  }

  async function disconnect() {
    await server.disconnect();
  }

  async function scanWifi() {
    try {
      const service = await server.getPrimaryService(SERVICE_ID);
      const scanWifiCharacteristic = await service.getCharacteristic(SCAN_WIFI);
      await scanWifiCharacteristic.writeValue(Uint8Array.of(1));
    } catch (e) {
      console.log(`unable to scan wifis: ${e}`);
    }
  }

  async function connectWifi(ssid, psk) {
    try {
      const service = await server.getPrimaryService(SERVICE_ID);

      const [
        connectWifiCharacteristic,
      ] = await Promise.all([
        await service.getCharacteristic(CONNECT_WIFI),
      ]);

      await connectWifiCharacteristic.writeValue(new TextEncoder('utf-8').encode(ssid));
    } catch (e) {
      console.log(`unable to connect wifi: ${e}`);
    }
  }

  useEffect(() => {
    const subscriptions = [];

    async function update() {
      if (!server) {
        setDispenser(null);
        return;
      }

      try {
        const service = await server.getPrimaryService(SERVICE_ID);

        const [
          statusCharacteristic,
          discoveredWifiCharacteristic,
          onionApiCharacteristic,
        ] = await Promise.all([
          await service.getCharacteristic(STATUS),
          await service.getCharacteristic(DISCOVERED_WIFI),
          await service.getCharacteristic(ONION_API),
        ]);

        const [
          status,
          onionApi,
        ] = await Promise.all([
          characteristicText(statusCharacteristic),
          characteristicText(onionApiCharacteristic),
        ]);

        await discoveredWifiCharacteristic.startNotifications();
        discoveredWifiCharacteristic.oncharacteristicvaluechanged = async (event) => {
          dispatchAvailableWifisAction(json(event.target.value));
        };
        subscriptions.push(discoveredWifiCharacteristic);

        setDispenser({
          status,
          onionApi,
        });
      } catch (e) {
        console.error(`unable to read: ${e}`);
      }
    }
    update();

    return function cleanup() {
      Promise.all(subscriptions.map(subscription => async () => {
        subscription.oncharacteristicvaluechanged = null;
        await subscription.stopNotifications();
      }));
    };
  }, [server, force]);

  return {
    supported,
    connecting,
    dispenser,
    availableWifis,
    connect,
    disconnect,
    forceUpdate,
    scanWifi,
    connectWifi,
  };
}
