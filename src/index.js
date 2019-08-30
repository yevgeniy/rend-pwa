import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import {StateContext, useCreateStore} from './hooks'
import "./install";

const HttpsApp = () => {
  const store=useCreateStore();
  return (
    <StateContext.Provider value={store}>
<App />
    </StateContext.Provider>
  )
};

const rootElement = document.getElementById("root");
ReactDOM.render(<HttpsApp />, rootElement);

serviceWorker.register();
