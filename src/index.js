import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import "./install";

const HttpsApp = () => {
  return <App />;
};

const rootElement = document.getElementById("root");
ReactDOM.render(<HttpsApp />, rootElement);

serviceWorker.register();
