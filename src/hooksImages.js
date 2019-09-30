import { useState, useEffect, useMemo, useRef } from "react";
import { useMemoState, useUpdate, useStore, useSelectedState } from "./hooks";
import {
  getStateImageIds,
  getMarkedImageIds,
  getImagesByIds,
  getDrawingImageIds,
  shuffle
} from "./services";
import { dim } from "ansi-colors";

function useDrawingImageIds(db, selectedState) {
  const [imageIds] = useMemoState(() => {
    if (!selectedState) return null;
    if (selectedState === "__MARKED__")
      return getDrawingImageIds(db).then(v => v.sort());

    return null;
  }, [selectedState, db]);

  return imageIds;
}

function useImageIds(db, selectedState) {
  const [imageIds] = useMemoState(() => {
    if (!selectedState) return;
    if (selectedState === "__MARKED__")
      return getMarkedImageIds(db).then(v => v.sort());
    else return getStateImageIds(db, selectedState).then(v => v.sort());
  }, [selectedState, db]);

  const shuffledImageIds = useShuffledImageIds(imageIds, selectedState);
  return shuffledImageIds;
}

function useShuffledImageIds(imageIds, selectedState) {
  const [rand, updateState] = useStore(s => s.rand);

  const imgs = useMemo(() => {
    const res = rand && imageIds ? shuffle([...imageIds], rand) : imageIds;
    return res;
  }, [rand, imageIds]);

  useUpdate(() => {
    selectedState === "__MARKED__"
      ? updateState({
          rand: new Array(10).fill(0, 0, 10).map(v => Math.random())
        })
      : updateState({ rand: null });
  }, [selectedState]);
  return imgs;
}
function usePages(imageIds, selectedState) {
  const [currentPage, updateState_currentPage] = useStore(({ currentPage }) =>
    Math.max(0, currentPage || 0)
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

    const cp = Math.min(tp - 1, currentPage);

    updateState_totalPages({ totalPages: tp });
    updateState_currentPage({ currentPage: cp });
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
    setPage
  };
}
function useImages(imageIds, db, selectedState) {
  const [images, updateState] = useStore(({ images }) => images);

  useEffect(() => {
    if (!selectedState) updateState({ images: null });
  }, [selectedState]);

  useEffect(() => {
    if (!imageIds) return;

    getImagesByIds(db, imageIds)
      .then(res => updateState({ images: res }))
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

  return { images, updateImage };
}
export function useImagesSystem(db) {
  const { selectedState } = useSelectedState();
  const allimageids = useImageIds(db, selectedState);
  const drawingimageids = useDrawingImageIds(db, selectedState);

  const [imageIds, setImageIds] = useMemoState(() => {
    if (!allimageids) return null;
    return Array.from(
      new Set([...(drawingimageids || []), ...(allimageids || [])])
    ).filter(v => !!v);
  }, [allimageids, drawingimageids]);

  const {
    imageIds: pageimageids,
    currentPage,
    totalPages,
    pageSize,
    setPage
  } = usePages(imageIds, selectedState);
  console.log("a", pageimageids);

  const { images, updateImage } = useImages(pageimageids, db, selectedState);
  const deleteImage = async id => {
    if (!imageIds) return;
    await db.collection("images").deleteOne({ id });

    imageIds &&
      setImageIds(imageIds => {
        return imageIds.filter(v => v !== id);
      });
  };
  return {
    images,
    updateImage,
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
export const useImageSrc = img => {
  let [src, setSrc] = useState(null);
  let [isError, setIsError] = useState(false);

  // useEffect(() => {
  //   return () => {
  //     setSrc = function() {};
  //     setIsError = function() {};
  //   };
  // });

  const getsrc = src => {
    if (src === img.large) return null;
    else if (src === img.reg) return img.reg;
    else if (src === img.thumb) return img.large;
  };
  const test = elm => {
    if (elm.width === 0 || elm.height === 0) return false;
    return true;
  };
  const newtry = src => {
    if (src === null) {
      setIsError(true);
      return;
    }
    const elm = new Image();
    elm.onload = () => {
      if (!test(elm)) newtry(getsrc(src));
      else setSrc(src);
    };
    elm.onerror = () => {
      newtry(getsrc(src));
    };
    elm.src = src;

    if (elm.complete) {
      if (!test(elm)) newtry(getsrc(src));
      else setSrc(src);
    }
  };
  useEffect(() => {
    setIsError(null);
    newtry(img.thumb);
  }, [img.id]);

  return { src, isError };
};
