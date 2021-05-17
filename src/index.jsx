import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { login, logout } from "./hooks";
import * as serviceWorker from "./serviceWorker";
import "./install";

const HttpsApp = () => {
  useEffect(() => {
    login();
    return () => logout();
  }, []);

  return <App />;
};

const rootElement = document.getElementById("root");
ReactDOM.render(<HttpsApp />, rootElement);

serviceWorker.register();
