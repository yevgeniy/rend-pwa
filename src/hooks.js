import React, { useRef, useState, useEffect, useContext } from "react";
import localforage from "localforage";
import {
  Stitch,
  RemoteMongoClient,
  UserApiKeyCredential
} from "mongodb-stitch-browser-sdk";
import {
  getStates,
  getStateImageIds,
  getMarkedImageIds,
  getImagesByIds
} from "./services";
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
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function useImageIds(db) {
  const { selectedState } = useSelectedState();
  const [imageIds, setImageIds] = useState(null);

  useEffect(() => {
    if (!selectedState) {
      setImageIds(null);
      return;
    }
    if (selectedState === "__MARKED__")
      getMarkedImageIds(db)
        .then(({ imageIds, drawingIds }) => {
          setImageIds(
            Array.from(new Set([...drawingIds, ...shuffle(imageIds)]))
          );
        })
        .catch(err => {
          throw err;
        });
    else
      getStateImageIds(db, selectedState)
        .then(images => setImageIds(images))
        .catch(err => {
          throw err;
        });
  }, [selectedState, db]);

  const deleteImage = async id => {
    await db.collection("images").deleteOne({ id });
    setImageIds(imageIds.filter(v => v !== id));
  };

  return { imageIds, deleteImage };
}
function usePages(db) {
  const { imageIds, deleteImage } = useImageIds(db);
  const { selectedState } = useSelectedState();

  const [currentPage, updateState_currentPage] = useStore(
    ({ currentPage }) => currentPage || 0
  );
  const [totalPages, updateState_totalPages] = useStore(
    ({ totalPages }) => totalPages
  );
  const [pageSize, updateState_pageSize] = useStore(
    ({ pageSize }) => pageSize || 20
  );
  const [idsForPage, setIdsForPage] = useState(null);

  useUpdate(() => {
    if (!selectedState) return;
    updateState_currentPage({ currentPage: 0 });
  }, [selectedState]);
  useEffect(() => {
    if (!imageIds) {
      return;
    }
    const tlen = (imageIds || []).length;
    const ps = Math.max(1, Math.min(pageSize, 1000));
    const tp = Math.ceil(tlen / ps);

    updateState_totalPages({ totalPages: tp });
    updateState_currentPage({ currentPage: Math.min(tp - 1, currentPage) });
  }, [imageIds && imageIds.length]);

  useEffect(() => {
    if (!imageIds) {
      setIdsForPage(null);
      return;
    }
    const pi = imageIds.slice(currentPage * pageSize).slice(0, pageSize);
    setIdsForPage(pi);
  }, [pageSize, totalPages, currentPage, imageIds]);

  const setPage = p => {
    updateState_currentPage({ currentPage: p });
  };

  return {
    imageIds: idsForPage,
    currentPage,
    totalPages,
    pageSize,
    deleteImage,
    setPage
  };
}
export function useImages(db) {
  const [images, updateState] = useStore(({ images }) => {
    if (images && images.constructor === Array) return images;
    return null;
  });
  const { selectedState } = useSelectedState();
  const {
    imageIds,
    currentPage,
    totalPages,
    pageSize,
    deleteImage,
    setPage
  } = usePages(db);

  const setImages = images => {
    updateState({ images });
  };
  useEffect(() => {
    if (!selectedState) setImages(null);
  }, [selectedState]);
  useEffect(() => {
    if (!imageIds) return;

    getImagesByIds(db, imageIds)
      .then(res => setImages(imageIds.map(v => res.find(vv => vv.id == v))))
      .catch(err => {
        throw err;
      });
  }, [db, imageIds]);

  const updateImage = async (id, props) => {
    await db.collection("images").updateOne({ id: id }, { $set: props });
    var i = images.findIndex(v => v.id === id);
    images[i] = { ...images[i], ...props };
    updateState({ images: [...images] });
  };

  return {
    images,
    updateImage,
    setImages,
    deleteImage,
    totalPages,
    currentPage,
    pageSize,
    setPage
  };
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
export const useImageSrc = img => {
  const [src, setSrc] = useState(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    setSrc(img.thumb);
  }, [img.id]);

  const didError = () => {
    if (src === img.thumb) setSrc(img.reg);
    else if (src === img.reg) setSrc(img.large);
    else if (src === img.large) setIsError(true);
  };

  return { src, isError, didError };
};
