import React, { useState, useEffect, useContext } from 'react';
import {
    Stitch,
    RemoteMongoClient,
    UserApiKeyCredential
} from "mongodb-stitch-browser-sdk";
var Client = Stitch.initializeDefaultAppClient("rend-app-nczgz");
const Mongodb = Client.getServiceClient(
    RemoteMongoClient.factory,
    "mongodb-atlas"
);

const credential = new UserApiKeyCredential(
    "vw2VXfikom72Czi3pyUHjoMXvmjTUEEuh5aNJ6rPgAVGd2Da9u9XTHc3BFguxcBe"
);


export const StateContext = React.createContext();

let process$ = Promise.resolve();
const Store={
    runOnUpdates:[],
    subscribe:function(fn) {
        this.runOnUpdates.push(fn)
        return {
            destroy:()=>{
                this.runOnUpdates=this.runOnUpdates.filter(v=>v!=fn);
            }
        }
    },
    state:null,
    init:function() {
        const messageGot = m => {
            navigator.serviceWorker.removeEventListener('message', messageGot);
            if (!m.data.success)
                throw new Error(m.data.message);

            this.state=m.data.state||{};
            this.broadcast();
        }
        navigator.serviceWorker.addEventListener('message', messageGot);
        navigator.serviceWorker.controller.postMessage({ command: 'initial-state-get' });
    },
    broadcast:function() {
        this.runOnUpdates.forEach(v=> {
            v(this.state)  
        });
    },
    updateState:function(st) {
        process$ = process$.then(() => new Promise(res => {

            const messageGot = m => {
                navigator.serviceWorker.removeEventListener('message', messageGot);
                if (!m.data.success)
                    throw new Error(m.data.message);

                this.state=m.data.state||{};
                this.broadcast();
                res();
            }
            navigator.serviceWorker.addEventListener('message', messageGot);
            navigator.serviceWorker.controller.postMessage({ command: 'state-update', state: st });
        }))
    }
}
Store.init();


export function useCreateStore() {
    const [state, setState] = useState(Store.state);    
    useEffect(() => {
        const b=Store.subscribe(setState)
        return ()=>b.destroy();
    },[]);
    
    return state;
}
export function useStore() {
    const state=useContext(StateContext);
console.log('rerun', state)
    const updateState = st => {
console.log('update', st)        
        Store.updateState(st);
    }

    return {state,updateState};
}

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
    const { state, updateState } = useStore();
    useEffect(() => {
        if (!db) return;
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
export function useSelectedState() {
    const { state, updateState } = useStore();


    let selectedState = null;
    const { selectedState: { data, created } = {} } = state || {};
    if (created && time(created).within(3).hours()) {
        selectedState = data;
    }
    const setSelectedState = (data) => {
        updateState({
            selectedState: { data, created: +new Date() },
            images: null
        })
    }
    return { selectedState, setSelectedState };
}
export function useImages(db) {
    let { state, updateState } = useStore();
    //const {selectedState}=useSelectedState();
    
    let selectedState = null;
    const { selectedState: { data:selectedStateData, created:selectedStateCreated } = {} } = state || {};
    if (selectedStateCreated && time(selectedStateCreated).within(3).hours()) {
        selectedState = selectedStateData;
    }

    let images = null;
    state = state || {};
    let data = (state.images || {}).data
    let created = (state.images || {}).created;
    if (created && time(created).within(3).hours()) {
        images = data;
    }
    const setImages = data => {
        updateState({ images: { data, created: +new Date() } })
    }
    useEffect(() => {
        if (images) return;
 
        if (selectedState === "__MARKED__")
            getMarkedImages(db)
                .then(res => setImages(res))
                .catch(err => {
                    throw err;
                });
        else
            getStateImages(db, state)
                .then(res => setImages(res))
                .catch(err => {
                    throw err;
                });
    }, [db, selectedState, images]);

    const updateImage = async (id, props) => {

        await db.collection("images").updateOne({ id: id }, { $set: props });
        var i = images.findIndex(v => v.id === id);
        images[i] = { ...images[i], ...props };              
        updateState({ images: { data: [...images], created: +new Date() } })
    };

    return { images, updateImage, setImages };
}
export function useSelectedImage() {
    let { state, updateState } = useStore();

    let selectedImage = null;
    state = state || {};
    let data = (state.selectedImage || {}).data;
    let created = (state.selectedImage || {}).created;
    if (created && time(created).within(3).hours()) {
        selectedImage = data;
    }

    const setSelectedImage = data => {
        updateState({ selectedImage: { data, created: +new Date() } })
    }
    return { selectedImage, setSelectedImage };
}

async function getStateImages(db, state) {
    let images = await db
        .collection("images")
        .find({ datetime: state })
        .toArray();
    return images;
}
async function getMarkedImages(db) {
    let images = await db
        .collection("images")
        .aggregate([{ $match: { marked: true } }, { $sample: { size: 10 } }])
        .toArray();
    let drawing = await db
        .collection("images")
        .find({ drawing: true })
        .toArray();
    images.unshift(...drawing);
    return images;
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