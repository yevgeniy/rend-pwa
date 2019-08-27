import { useState, useEffect } from 'react';
import {
    Stitch,
    RemoteMongoClient,
    UserApiKeyCredential
} from "mongodb-stitch-browser-sdk";

let State = null;
let process$ = Promise.resolve();
function useWorkerState() {
    const [state, setState] = useState(State);
    State = state;
    useEffect(() => {
        if (state)
            return;
        const messageGot = m => {
            navigator.serviceWorker.removeEventListener('message', messageGot);
            if (!m.data.success)
                throw new Error(m.data.message);

            setState(m.data.state || {});
        }
        navigator.serviceWorker.addEventListener('message', messageGot);
        navigator.serviceWorker.controller.postMessage({ command: 'initial-state-get' });

    }, []);
    const updateState = async st => {
        process$ = process$.then(() => new Promise(res => {

            const messageGot = m => {
                navigator.serviceWorker.removeEventListener('message', messageGot);
                if (!m.data.success)
                    throw new Error(m.data.message);

                setState(m.data.state);
                res();
            }
            navigator.serviceWorker.addEventListener('message', messageGot);
            navigator.serviceWorker.controller.postMessage({ command: 'state-update', state: st });
        }))
    }
    return {
        state, updateState
    }
}
var Client = Stitch.initializeDefaultAppClient("rend-app-nczgz");
const Mongodb = Client.getServiceClient(
    RemoteMongoClient.factory,
    "mongodb-atlas"
);

const credential = new UserApiKeyCredential(
    "vw2VXfikom72Czi3pyUHjoMXvmjTUEEuh5aNJ6rPgAVGd2Da9u9XTHc3BFguxcBe"
);
export function useDb() {
    const [db, setDb] = useState(null);

    useEffect(() => {
        Client.auth.loginWithCredential(credential).then(user => {
            setDb(Mongodb.db("rend"));
        });
        return () => {
            Client.auth.logout();
        };
    }, []);

    return db;
}
export function useStates() {
    const db = useDb();
    const { state, updateState } = useWorkerState();
    useEffect(() => {
        if (!db) return;

        console.log("getting states");
        getStates(db)
            .then(data => updateState({ states: { created: +new Date(), data } }))
            .catch(e => console.log(e));
    }, [db]);

    const { states: { data, created } = {} } = state || {};
    if (created && time(created).within(3).hours()) {
        return data;
    }
    return null;
}
const Hour1 = 3.6e+6;
function time(ti) {
    return {
        within: n => {
            return {
                hours: h => {
                    const test = Hour1 * n;
                    return +new Date() - ti < test
                }
            }
        }
    }
}
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