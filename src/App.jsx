import React, { useState, useEffect } from "react";
import {
    Stitch,
    AnonymousCredential,
    RemoteMongoClient
} from "mongodb-stitch-browser-sdk";
import { withStyles } from "@material-ui/core/styles";
import Loading from "./Loading";
import StatesView from "./StatesView";

import "./styles.css";

const App = ({ classes }) => {
    const [db, setDb] = useState(null);
    const [states, setStates] = useState(null);
    const [nav, setNav] = useState(null);

    useEffect(() => {
        var client = Stitch.initializeDefaultAppClient("rend-app-nczgz");
        const mongodb = client.getServiceClient(
            RemoteMongoClient.factory,
            "mongodb-atlas"
        );
        client.auth
            .loginWithCredential(new AnonymousCredential())
            .then(user => {
                console.log("settingdb");
                setDb(mongodb.db("rend"));
            });
        return () => {
            client.auth.logout();
        };
    }, []);

    useEffect(() => {
        if (!db) return;

        console.log("getting states");
        getStates(db)
            .then(res => setStates(res))
            .catch(e => console.log(e));
    }, [db]);

    return (
        <div className={classes.container}>
            <Loading test={!!states}>
                {nav || <StatesView states={states} setNav={setNav} db={db} />}
            </Loading>
        </div>
    );
};

export default withStyles(theme => {
    return {
        container: {
            background: theme.palette.background.default
        }
    };
})(App);

async function getStates(db) {
    var [err, res] = await new Promise(async res => {
        var r = await db
            .collection("images")
            .aggregate([{ $group: { _id: "$datetime" } }])
            .toArray()
            .catch(e => res[(e, null)]);
        res([
            null,
            r
                .map(v => {
                    return v._id;
                })
                .filter(v => v)
        ]);
    });

    if (err) throw err;
    return res.sort((a, b) => (a >= b ? 1 : -1));
}
