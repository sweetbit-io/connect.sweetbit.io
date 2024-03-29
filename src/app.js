import React, { useState, useCallback, useEffect } from 'react';
import { Route, useHistory } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';
import QRCode from 'qrcode.react';
import { useForwardNavigationBlocker } from './hooks/forward-navigation-blocker';
import { useInterval } from './hooks/interval';
import Button from './components/button';
import Spinner from './components/spinner';
import { useBluetooth } from './hooks/bluetooth';
import { ReactComponent as CheckmarkIcon } from './icons/checkmark.svg';
import { ReactComponent as WifiIcon } from './icons/wifi.svg';
import { ReactComponent as SecureWifiIcon } from './icons/wifi-secure.svg';
import { ReactComponent as DispenserImage } from './icons/dispenser.svg';

function App() {
  const history = useHistory();

  useEffect(() => {
    if (history.location.pathname !== '/') {
      history.replace('/');
    }
  }, [history]);

  const {
    supported,
    connecting,
    connect,
    // disconnect,
    dispenser,
    availableWifis,
    // forceUpdate,
    scanWifi,
    connectWifi,
  } = useBluetooth();

  const handleStart = useCallback(() => {
    if (supported) {
      history.push('/pair');
    } else {
      history.push('/select');
    }
  }, [supported, history]);

  const handleSearchWifi = useCallback(() => {
    history.push('/wifis');
    scanWifi();
  }, [scanWifi, history]);

  const handleWebChoice = useCallback(() => {
    history.push('/pair');
  }, [history]);

  const [selectedWifi, setSelectedWifi] = useState(null);

  const createHandleSelectWifi = useCallback((wifi) => {
    return (e) => {
      e.preventDefault();

      setSelectedWifi(wifi);

      if (wifi.encryption !== 'none') {
        history.push('/auth');
      } else {
        connectWifi(wifi.ssid, '');
      }
    };
  }, [history, connectWifi]);

  const handleConnectWifi = useCallback((e) => {
    e.preventDefault();
    connectWifi('', '');
    history.push('/connected');
  }, [history, connectWifi]);

  const handlePair = useCallback(() => {
    const pair = async () => {
      await connect();
      // TODO: only proceed when data is loaded
      history.push('/paired');
    };
    pair();
  }, [connect, history]);

  useForwardNavigationBlocker(history);

  const scanWifiCondition = useCallback(() => {
    return history.location.pathname === '/wifis';
  }, [history]);

  useInterval(scanWifi, 3000, scanWifiCondition);

  return (
    <div className="container">
      <div className="dispenser">
        <DispenserImage className="image" />
      </div>
      <div className="content">
        <Route exact path="/">
          {({ match, history }) => (
            <CSSTransition in={match !== null} timeout={200} classNames={!!match === (history.action === 'PUSH') ? 'right' : 'left'} unmountOnExit>
              <div className="page">
                <p>
                  Let's pair your Bitcoin Lightning Candy Dispenser
                  and connect it to your local Wi-Fi to get it up and running.
                </p>
                <div className="action">
                  <Button onClick={handleStart}>Start setup</Button>
                  <a className="secondary" href="https://sweetbit.io">Get a Bitcoin Lightning Candy Dispenser</a>
                </div>
              </div>
            </CSSTransition>
          )}
        </Route>
        <Route path="/select">
          {({ match, history }) => (
            <CSSTransition in={match !== null} timeout={200} classNames={!!match === (history.action === 'PUSH') ? 'right' : 'left'} unmountOnExit>
              <div className="page">
                <p>
                  Here are some options how your can pair and connect your
                  Bitcoin Lightning Candy Dispenser.
                </p>
                <ul className="items">
                  <li className="item">
                    <button onClick={handleWebChoice} disabled={!supported} className="option">
                      <strong className="title">connect.sweetbit.io</strong>
                      <span className="separator"> – </span>
                      <span className="description">Pair and connect without having to install an app, control through the Candy Dispenser's own web app.</span>
                      <span className="separator"> (</span>
                      <em className={classNames('label', { alert: !supported })}>Chrome Desktop only</em>
                      <span className="separator">)</span>
                    </button>
                  </li>
                  <li className="item">
                    <button disabled className="option">
                      <strong className="title">iOS app</strong>
                      <span className="separator"> – </span>
                      <span className="description">Pair, connect and control your Candy Dispenser through its official iOS app.</span>
                      <span className="separator"> (</span>
                      <em className="label">from October</em>
                      <span className="separator">)</span>
                    </button>
                  </li>
                  <li className="item">
                    <button disabled className="option">
                      <strong className="title">Android app</strong>
                      <span className="separator"> – </span>
                      <span className="description">Pair, connect and control your Candy Dispenser through its official Android app.</span>
                      <span className="separator"> (</span>
                      <em className="label">from December</em>
                      <span className="separator">)</span>
                    </button>
                  </li>
                </ul>
              </div>
            </CSSTransition>
          )}
        </Route>
        <Route path="/pair">
          {({ match, history }) => (
            <CSSTransition in={match !== null} timeout={200} classNames={!!match === (history.action === 'PUSH') ? 'right' : 'left'} unmountOnExit>
              <div className="page">
                <p>
                  Plug your Candy Dispenser into a power outlet
                  and wait for it to buzz before you start pairing.
                </p>
                <div className="action">
                  <Button onClick={handlePair} loading={connecting}>Pair Candy Dispenser</Button>
                </div>
              </div>
            </CSSTransition>
          )}
        </Route>
        <Route path="/unpaired">
          {({ match, history }) => (
            <CSSTransition in={match !== null} timeout={200} classNames={!!match === (history.action === 'PUSH') ? 'right' : 'left'} unmountOnExit>
              <div className="page">
                <p>
                  Whoops, no Candy Dispenser could be found. Make sure
                  it's close to your device and that you waited for it to buzz
                  before pairing.
                </p>
                <div className="action">
                  <Button>Retry</Button>
                </div>
              </div>
            </CSSTransition>
          )}
        </Route>
        <Route path="/paired">
          {({ match, history }) => (
            <CSSTransition in={match !== null} timeout={200} classNames={!!match === (history.action === 'PUSH') ? 'right' : 'left'} unmountOnExit>
              <div className="page">
                <p>
                  Congratulations, you've successfully paired your
                  Candy Dispenser. Now let's find a Wi-Fi to connect to.
                </p>
                <div className={`info ${!dispenser ? 'loading' : ''}`}>
                  {dispenser && dispenser.deviceName}
                </div>
                <div className="action">
                  <Button onClick={handleSearchWifi}>Search Wi-Fi</Button>
                </div>
              </div>
            </CSSTransition>
          )}
        </Route>
        <Route path="/wifis">
          {({ match, history }) => (
            <CSSTransition in={match !== null} timeout={200} classNames={!!match === (history.action === 'PUSH') ? 'right' : 'left'} unmountOnExit>
              <div className="page">
                <p>
                  Select a Wi-Fi to connect to.
                </p>
                <ul className="items">
                  {availableWifis.map(wifi => (
                    <li className="item" key={wifi.ssid}>
                      <button onClick={createHandleSelectWifi(wifi)} className={classNames('wifi', {
                        selected: dispenser && dispenser.ssid === wifi.ssid,
                        connecting: false,
                      })}>
                        {wifi.encryption === 'none' ?  (
                          <WifiIcon className="icon" />
                        ) : (
                          <SecureWifiIcon className="icon" />
                        )}
                        <span className="ssid">{wifi.ssid}</span>
                        <span className="indicator">
                          <CheckmarkIcon className="check" />
                          <Spinner className="spinner" />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </CSSTransition>
          )}
        </Route>
        <Route path="/auth">
          {({ match, history }) => (
            <CSSTransition in={match !== null} timeout={200} classNames={!!match === (history.action === 'PUSH') ? 'right' : 'left'} unmountOnExit>
              <div className="page">
                <p>
                  Enter the Wi-Fi password.
                </p>
                <form onSubmit={handleConnectWifi}>
                  {selectedWifi && (
                    <input
                      type="hidden"
                      name={selectedWifi.encryption !== 'enterprise' ? 'username' : 'ssid'}
                      autoComplete={selectedWifi.encryption !== 'enterprise' && 'username'}
                      value={selectedWifi.ssid}
                    />
                  )}
                  {selectedWifi && selectedWifi.encryption === 'enterprise' && (
                    <div className="username">
                      <div className="group centered">
                        <input
                          placeholder="Username"
                          required
                          name="username"
                          type="text"
                          autoComplete="username"
                        />
                        <label htmlFor="username">Username</label>
                      </div>
                    </div>
                  )}
                  <div className="password">
                    <div className="group centered">
                      <input
                        placeholder="Password"
                        required
                        name="password"
                        type="password"
                        autoComplete="current-password"
                      />
                      <label htmlFor="password">Password</label>
                    </div>
                  </div>
                  <div className="action">
                    <Button type="submit">Connect Wi-Fi</Button>
                  </div>
                </form>
              </div>
            </CSSTransition>
          )}
        </Route>
        <Route path="/unconnected">
          {({ match, history }) => (
            <CSSTransition in={match !== null} timeout={300} classNames={!!match === (history.action === 'PUSH') ? 'right' : 'left'} unmountOnExit>
              <div className="page">
                <p>
                  Oh no, the selected Wi-Fi couldn't be connected to.
                </p>
                <div className="action">
                  <Button>Retry</Button>
                </div>
              </div>
            </CSSTransition>
          )}
        </Route>
        <Route path="/connected">
          {({ match, history }) => (
            <CSSTransition in={match !== null} timeout={300} classNames={!!match === (history.action === 'PUSH') ? 'right' : 'left'} unmountOnExit>
              <div className="page">
                <p>
                  Fantastic, the Candy Dispenser is connected.
                  Give it a moment until it's ready for you.
                </p>
                <p>
                  <QRCode
                    className="qrcode"
                    size={null}
                    renderAs="svg"
                    value="http://lyub345d556faxlt.onion"
                  />
                </p>
                <p>
                  <Spinner />
                </p>
              </div>
            </CSSTransition>
          )}
        </Route>
      </div>
      <style jsx>{`
        * {
          box-sizing: border-box;
        }
        .content {
          position: relative;
        }
        .page {
          position: absolute;
          top: 0;
          width: 100%;
        }
        .page.left-enter {
          opacity: 0;
          transform: translateX(-100px);
        }
        .page.left-enter-active {
          opacity: 1;
          transform: translateX(0);
          transition: opacity 300ms, transform 300ms;
        }
        .page.left-exit {
        }
        .page.left-exit-active {
          opacity: 0;
          transform: translateX(-100px);
          transition: opacity 300ms, transform 300ms;
        }
        .page.right-enter {
          opacity: 0;
          transform: translateX(100px);
        }
        .page.right-enter-active {
          opacity: 1;
          transform: translateX(0);
          transition: opacity 300ms, transform 300ms;
        }
        .page.right-exit {
        }
        .page.right-exit-active {
          opacity: 0;
          transform: translateX(100px);
          transition: opacity 300ms, transform 300ms;
        }
        .dispenser {
          padding-bottom: 40px;
        }
        .dispenser > :global(.image) {
          width: 160px;
        }
        .container {
          max-width: 768px;
          margin: 0 auto;
          padding: 0 20px;
          width: 100%;
          text-align: center;
          min-height: 100vh;
          padding: 80px 0;
          display: flex;
          flex-direction: column;
        }
        p {
          max-width: 420px;
          font-size: 18px;
          width: 100%;
          margin: 0 auto;
          line-height: 1.4;
        }
        p + p {
          padding-top: 16px;
        }
        .screen {
          text-align: center;
        }
        .image {
          display: inline-block;
          width: 80px;
          height: 80px;
          background-color: gray;
        }
        :global(.icon) {
          width: 24px;
          height: 24px;
          fill: currentColor;
        }
        .action {
          padding-top: 60px;
        }
        .action .secondary {
          padding-top: 16px;
          display: inline-block;
        }
        .action > :global(button) {
          display: block;
          margin: 0 auto;
        }
        .group {
          position: relative;
          margin-top: 45px;
        }
        .group.centered input {
          text-align: center;
        }
        .group input {
          font-size: 18px;
          padding: 10px 10px 10px 5px;
          display: block;
          width: 100%;
          border: none;
          border-bottom: 3px solid #ccc;
          background: transparent;
          border-radius: 0;
        }
        .group input:focus {
          outline: none;
        }
        .group input::placeholder {
          color: transparent;
        }
        .group label {
          color: #999;
          font-size: 18px;
          font-weight: normal;
          position: absolute;
          pointer-events: none;
          left: 5px;
          top: 10px;
          transition: 0.2s ease all;
        }
        .group.centered label {
          left: 50%;
          transform: translateX(-50%);
        }
        .group input:focus ~ label,
        .group input:not(:placeholder-shown) ~ label,
        .group input:valid ~ label {
          top: -20px;
          font-size: 14px;
          color: #5264AE;
        }
        .items {
          list-style: none;
          padding: 0;
          max-width: 360px;
          width: 100%;
          margin: 0 auto;
          padding-top: 30px;
        }
        .item {
        }
        .option {
          position: relative;
          display: block;
          width: 100%;
          padding: 20px;
          text-align: left;
          background: white;
          box-shadow: 0 3px 8px #efefef;
          color: #333;
          text-decoration: none;
          font-size: inherit;
          border: none;
        }
        .option:disabled {
          color: #999;
        }
        .option:hover {
        }
        .option:focus {
          z-index: 1;
        }
        .option .title {
          display: block;
        }
        .option .separator {
          display: none;
        }
        .option .description {
          display: block;
          padding-top: 5px;
        }
        .option .label {
          display: inline-block;
          font-size: 11px;
          font-style: normal;
          background: #5335B8;
          color: white;
          padding: 3px 8px;
          border-radius: 6px;
          position: absolute;
          top: 12px;
          right: 15px;
        }
        .option:disabled .label {
          background: #333;
        }
        .option .label.alert {
          background: #914146;
        }
        .wifi {
          display: flex;
          align-items: center;
          position: relative;
          width: 100%;
          padding: 10px 20px;
          text-align: left;
          background: white;
          box-shadow: 0 3px 8px #efefef;
          color: #333;
          text-decoration: none;
          font-size: inherit;
          border: none;
        }
        .wifi:focus {
          z-index: 1;
        }
        .wifi :global(.icon) {
          display: inline-block;
          padding-right: 10px;
        }
        .wifi .ssid {
          flex: 1 1 auto;
        }
        .wifi .indicator {
          display: inline-block;
          position: relative;
          flex: 0 0 auto;
          padding-left: 10px;
        }
        .wifi .indicator :global(.check) {
          width: 24px;
          height: 24px;
          opacity: 0;
        }
        .wifi.selected .indicator :global(.check) {
          opacity: 1;
        }
        .wifi .indicator :global(.spinner) {
          position: absolute;
          top: 0;
          left: 0;
          opacity: 0;
        }
        .wifi.connecting .indicator :global(.spinner) {
          opacity: 1;
        }
        .username, .password {
          max-width: 320px;
          width: 100%;
          margin: 0 auto;
        }
        .info {
          max-width: 200px;
          margin: 0 auto;
          margin-top: 30px;
          display: block;
          width: 100%;
          padding: 20px;
          text-align: center;
          background: white;
          box-shadow: 0 3px 8px #efefef;
          color: #333;
        }
        :global(.qrcode) {
          display: inline-block;
          padding: 25px;
          background: white;
          max-width: 220px;
          box-shadow: 0 3px 8px #efefef;
        }
      `}</style>
      <style jsx global>{`
        body {
          background-color: #f2f2f2;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        code {
          font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace;
        }
        @keyframes fadein {
          0% {
            transform: scale(1.2);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        #root {
          animation: 0.3s ease fadein;
        }
      `}</style>
    </div>
  );
}

export default App;
