import React, { useCallback } from 'react';
import { Route, Switch, Redirect } from "react-router-dom";
import { withRouter } from "react-router";
import Button from './components/button';
import Spinner from './components/spinner';
import { useBluetooth } from './bluetooth';
import { ReactComponent as CheckmarkIcon } from './checkmark.svg';
import { ReactComponent as WifiIcon } from './wifi.svg';
import { ReactComponent as SecureWifiIcon } from './wifi-secure.svg';
import { ReactComponent as DispenserImage } from './dispenser.svg';

function App({ history }) {
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

  const handleSelectWifi = useCallback(() => {
    connectWifi('onion', 'noo');
  }, [connectWifi]);

  const handlePair = useCallback(() => {
    const pair = async () => {
      await connect();
      history.push('/paired');
    };
    pair();
  }, [connect, history]);

  return (
    <div className="container">
      <div className="dispenser">
        <DispenserImage className="image" />
      </div>
      <Switch>
        <Route exact path="/" render={() => (
          <>
            <p>
              Let's pair your Bitcoin Lightning Candy Dispenser
              and connect it to your local Wi-Fi to get it up and running.
            </p>
            <div className="action">
              <Button onClick={handleStart}>Start setup</Button>
              <a href="https://sweetbit.io">Get a Bitcoin Lightning Candy Dispenser</a>
            </div>
          </>
        )} />
        <Route path="/select" render={() => (
          <>
            <p>
              Here are some options how your can pair and connect your
              Bitcoin Lightning Candy Dispenser.
            </p>
            <ul>
              <li>
                <a href="#desktop" disabled={!supported}>
                  <strong>Web app</strong>
                  <span> – </span>
                  <span>Pair and connect without having to install an app, control through the Candy Dispenser's own web app.</span>
                  <span> (</span>
                  <em>Chrome Desktop only</em>
                  <span>)</span>
                </a>
              </li>
              <li>
                <a href="#ios">
                  <strong>iOS app</strong>
                  <span> – </span>
                  <span>Pair, connect and control your Candy Dispenser through its official iOS app.</span>
                  <span> (</span>
                  <em>from October</em>
                  <span>)</span>
                </a>
              </li>
              <li>
                <a href="#android">
                  <strong>Android app</strong>
                  <span> – </span>
                  <span>Pair, connect and control your Candy Dispenser through its official Android app.</span>
                  <span> (</span>
                  <em>from December</em>
                  <span>)</span>
                </a>
              </li>
            </ul>
          </>
        )} />
        <Route path="/pair" render={() => (
          <>
            <p>
              Plug your Candy Dispenser into a power outlet
              and wait for it to buzz before you start pairing.
            </p>
            <div className="action">
              <Button onClick={handlePair} loading={connecting}>Pair Candy Dispenser</Button>
            </div>
          </>
        )} />
        <Route path="/unpaired" render={() => (
          <>
            <p>
              Whoops, no Candy Dispenser could be found. Make sure
              it's close to your device and that you waited for it to buzz
              before pairing.
            </p>
            <Button>Retry</Button>
          </>
        )} />
        <Route path="/paired" render={() => (
          <>
            <p>
              Congratulations, you've successfully paired your
              Candy Dispenser. Now let's find a Wi-Fi to connect to.
            </p>
            <div className="card">
              {JSON.stringify(dispenser)}
            </div>
            <Button onClick={scanWifi}>Search Wi-Fi</Button>
          </>
        )} />
        <Route path="/wifis" render={() => (
          <>
            <p>
              Select a Wi-Fi to connect to.
            </p>
            <ul>
              {availableWifis.map(wifi => (
                <li>
                  <button onClick={wifi} className="wifi">
                    <CheckmarkIcon className="icon" />
                    <WifiIcon className="icon" />
                    <span>{wifi}</span>
                  </button>
                </li>
              ))}
              <li>
                <button className="wifi">
                  <SecureWifiIcon className="icon" />
                  <span>olive</span>
                </button>
              </li>
            </ul>
          </>
        )} />
        <Route path="/auth" render={() => (
          <>
            <p>
              Enter the Wi-Fi password.
            </p>
            <div className="password">
              <div className="group centered">
                <input
                  placeholder="Password"
                  // onChange={this.handleEmailChanged}
                  required
                  name="password"
                  type="password"
                />
                <label htmlFor="password">Password</label>
              </div>
            </div>
            <Button onClick={handleSelectWifi}>Connect Wi-Fi</Button>
          </>
        )} />
        <Route path="/unconnected" render={() => (
          <>
            <p>
              Oh no, the selected Wi-Fi couldn't be connected to.
            </p>
            <Button>Retry</Button>
          </>
        )} />
        <Route path="/connected" render={() => (
          <>
            <p>
              Fantastic, the Candy Dispenser is connected.
              Give it a moment until it's ready for you.
            </p>
            <Spinner />
            <p>
              Congratulations, your Candy Dispenser is up and running.
              Use any of the below options to configure it to your needs.
            </p>
          </>
        )} />
        <Route path="/failed" render={() => (
          <>
            <p>
              Oh shoot, the Candy Dispenser wasn't able to establish a connection
              to the internet.
            </p>
            <Button>Retry</Button>
          </>
        )} />
        <Route path="/completed" render={() => (
          <>
            <p>
              Congratulations, your Candy Dispenser is up and running.
              Use any of the below options to configure it to your needs.
            </p>
          </>
        )} />
        <Redirect to="/" />
      </Switch>
      <style jsx>{`
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
        }
        p {
          max-width: 420px;
          font-size: 18px;
          width: 100%;
          margin: 0 auto;
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
        button {
          padding: 20px;
        }
        button.wifi {
          display: block;
          border: none;
          background: none;
          font-size: inherit;
          text-align: left;
          width: 100%;
          color: red;
        }
        :global(.icon) {
          width: 24px;
          height: 24px;
          fill: currentColor;
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
      `}</style>
      <style jsx global>{`
        body {
          background-color: #f2f2f2;
          margin: 0;
          padding: 80px 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        code {
          font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace;
        }
      `}</style>
    </div>
  );
}

export default withRouter(App);
