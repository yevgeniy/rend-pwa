import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import * as serviceWorker from "./serviceWorker";
import {
  Stitch,
  AnonymousCredential,
  RemoteMongoClient
} from "mongodb-stitch-browser-sdk";
import icon from "../public/favicon.ico";

import "./styles.css";

function App() {
  const [db, setDb] = useState(null);

  useEffect(() => {
    var client = Stitch.initializeDefaultAppClient("rend-app-nczgz");
    console.log(client);
    const mongodb = client.getServiceClient(
      RemoteMongoClient.factory,
      "mongodb-atlas"
    );
    let mdb = mongodb.db("rend");
    setDb(mdb);
  }, []);

  console.log(icon);

  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
      <img src={icon} alt="" style={{ width: "50px" }} />
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

//serviceWorker.register();
