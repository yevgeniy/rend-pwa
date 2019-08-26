import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import "./install";

if (!('indexedDB' in window)) {
  alert('This browser doesn\'t support IndexedDB');
} else
  alert('has db');

const HttpsApp = () => {
  return <App />;
};

const rootElement = document.getElementById("root");
ReactDOM.render(<HttpsApp />, rootElement);

serviceWorker.register();
