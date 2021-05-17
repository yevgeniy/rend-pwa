import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { login, logout } from "./hooks";
import * as serviceWorker from "./serviceWorker";
import "./install";

const HttpsApp = () => {
  const [a, seta] = useState(false);
  const [b, setb] = useState(false);
  const access = a && b;
  useEffect(() => {
    login();
    return () => logout();
  }, []);

  if (!access) {
    return (
      <>
        <button
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "50px",
            opacity: 0
          }}
          onClick={e => seta(true)}
        >
          let none but
        </button>
        <button
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            height: "50px",
            opacity: 0
          }}
          onClick={e => setb(true)}
        >
          beauty enter
        </button>
      </>
    );
  }

  return <App />;
};

const rootElement = document.getElementById("root");
ReactDOM.render(<HttpsApp />, rootElement);

serviceWorker.register();
