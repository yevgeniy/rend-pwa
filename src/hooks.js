import React, { useState, useEffect, useContext } from "react";
import localforage from "localforage";
import {
  Stitch,
  RemoteMongoClient,
  UserApiKeyCredential
} from "mongodb-stitch-browser-sdk";
import { getStates, getStateImages, getMarkedImages } from "./services";
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
          this.state = { ...this.state, ...st };
          console.log(this.state);
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
  const [selectedState, updateState] = useStore(({ selectedState }) => {
    if (
      selectedState &&
      (selectedState.constructor === Number ||
        selectedState.constructor === String)
    )
      return selectedState;
    return null;
  });

  const setSelectedState = selectedState => {
    updateState({
      selectedState
    });
  };
  return { selectedState, setSelectedState };
}
export function useImages(db) {
  const [images, updateState] = useStore(({ images }) => {
    if (images && images.constructor === Array) return images;
    return null;
  });
  const { selectedState } = useSelectedState();

  const setImages = images => {
    updateState({ images });
  };
  useEffect(() => {
    if (!selectedState) setImages(null);
  }, [selectedState]);
  useEffect(() => {
    if (images) return;
    if (!selectedState) return;

    if (selectedState === "__MARKED__")
      getMarkedImages(db)
        .then(res => setImages(res))
        .catch(err => {
          throw err;
        });
    else
      getStateImages(db, selectedState)
        .then(res => setImages(res))
        .catch(err => {
          throw err;
        });
  }, [db, selectedState, images]);

  const updateImage = async (id, props) => {
    await db.collection("images").updateOne({ id: id }, { $set: props });
    var i = images.findIndex(v => v.id === id);
    images[i] = { ...images[i], ...props };
    updateState({ images: [...images] });
  };

  return { images, updateImage, setImages };
}
export function useSelectedImage() {
  let [selectedImage, updateState] = useStore(({ selectedImage }) => {
    if (selectedImage && selectedImage.constructor === Number)
      return selectedImage;
    return null;
  });

  const setSelectedImage = selectedImage => {
    updateState({ selectedImage });
  };
  return { selectedImage, setSelectedImage };
}
