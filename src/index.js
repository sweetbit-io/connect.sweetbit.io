import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ModalProvider } from "react-modal-hook";
import { TransitionGroup } from "react-transition-group";
import App from './app';
import * as serviceWorker from './serviceWorker';

function getConfirmation(message, callback) {
  callback(false);
}

ReactDOM.render(
  <BrowserRouter getUserConfirmation={getConfirmation}>
    <ModalProvider container={TransitionGroup}>
      <App />
    </ModalProvider>
  </BrowserRouter>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
