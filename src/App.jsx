import React, { useState, useEffect } from "react";
import {
  Stitch,
  AnonymousCredential,
  RemoteMongoClient
} from "mongodb-stitch-browser-sdk";
import { withStyles } from "@material-ui/core/styles";
import Loading from "./Loading";
import "./styles.css";

const App = ({ classes }) => {
  const [db, setDb] = useState(null);

  useEffect(() => {
    var client = Stitch.initializeDefaultAppClient("rend-app-nczgz");
    console.log(client);
    const mongodb = client.getServiceClient(
      RemoteMongoClient.factory,
      "mongodb-atlas"
    );
    setDb(mongodb.db("rend"));
  }, []);

  return (
    <div className={classes.container}>
      <Loading test={!!db}>
        <div>LOADED!</div>
      </Loading>
    </div>
  );
};

export default withStyles(theme => {
  return {
    container: {
      display: "flex",
      height: "90vh",
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      background: theme.palette.background.default
    }
  };
})(App);
