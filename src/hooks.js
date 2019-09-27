import React, { useMemo, useRef, useState, useEffect, useContext } from "react";
import localforage from "localforage";
import {
  Stitch,
  RemoteMongoClient,
  UserApiKeyCredential
} from "mongodb-stitch-browser-sdk";
import { getStates } from "./services";
var Client = Stitch.initializeDefaultAppClient("rend-app-nczgz");
const Mongodb = Client.getServiceClient(
  RemoteMongoClient.factory,
  "mongodb-atlas"
);

const credential = new UserApiKeyCredential(
  "vw2VXfikom72Czi3pyUHjoMXvmjTUEEuh5aNJ6rPgAVGd2Da9u9XTHc3BFguxcBe"
);

let process$ = Promise.resolve();
const Store = {
  runOnUpdates: [],
  subscribe: function(fn) {
    this.runOnUpdates.push(fn);
    return () => {
      this.runOnUpdates = this.runOnUpdates.filter(v => v !== fn);
    };
  },
  state: null,
  init: async function() {
    const data = await localforage.getItem("state-db");
    this.state = data || {};
    this.broadcast();
  },
  broadcast: function() {
    this.runOnUpdates.forEach(v => {
      v(this.state);
    });
  },
  updateState: function(st) {
    process$ = process$.then(
      () =>
        new Promise(res => {
          st = st && st.constructor === Function ? st(this.state) : st;
          this.state = { ...this.state, ...st };

          localforage.setItem("state-db", this.state);
          this.broadcast();
          res(this.state);
        })
    );
  }
};
Store.init();

export function useStore(extractor) {
  const [val, setVal] = useState(Store.state ? extractor(Store.state) : null);

  useEffect(() => {
    return Store.subscribe(s => {
      s && setVal(extractor(s));
    });
  }, []);

  const updateState = st => {
    Store.updateState(st);
  };

  return [val, updateState];
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
  const [states, updateState] = useStore(({ states }) => {
    if (states && states.constructor === Array) return states;
    return null;
  });
  useEffect(() => {
    if (!db) return;
    getStates(db)
      .then(states => updateState({ states }))
      .catch(e => console.log(e));
  }, [db]);

  return states;
}

export function useSelectedState() {
  const [selectedState, updateState] = useStore(
    ({ selectedState }) => selectedState
  );

  const setSelectedState = selectedState => {
    updateState({
      selectedState
    });
  };
  return { selectedState, setSelectedState };
}

export function useUpdate(fn, args) {
  const f = useRef(true);
  useEffect(() => {
    if (f.current) {
      f.current = false;
      return;
    }
    fn();
  }, args);
}
export function useMemoState(fn, args) {
  const r = useMemo(fn, args);
  const [val, setVal] = useState(null);

  useEffect(() => {
    if (r && r.then)
      r.then(setVal).catch(e => {
        throw e;
      });
  }, [r]);

  return [r && r.then ? val : r, setVal];
}
