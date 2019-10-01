import { useState, useEffect, useMemo, useRef } from "react";
import { useMemoState, useUpdate, useStore, useSelectedState } from "./hooks";
import {
  getStateImageIds,
  getMarkedImageIds,
  getImagesByIds,
  getDrawingImageIds,
  shuffle,
  removeDuplicates
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
    console.log("RERUNNING RAND: ", !!rand);
    const res = rand && imageIds ? shuffle([...imageIds], rand) : imageIds;
    return res;
  }, [rand, imageIds]);

  useUpdate(() => {
    if (selectedState === "__MARKED__") {
      console.log("NEW RAND");
      updateState({
        rand: new Array(10).fill(0, 0, 10).map(v => Math.random())
      });
    } else
      updateState({
        rand: null
      });
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

    if (currentPage > tp - 1) updateState_currentPage({ currentPage: tp - 1 });
    updateState_totalPages({ totalPages: tp });
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
      .then(async res => {
        res = await removeDuplicates(res, db);
        updateState({ images: imageIds.map(id => res.find(v => id === v.id)) });
      })
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
  console.log("a", (pageimageids || []).slice(0, 20));

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
export const useImageSrc = (img, ref) => {
  let [src, setSrc] = useState(img.thumb);
  let [isError, setIsError] = useState(null);

  useEffect(() => {
    if (isError !== null) return;

    const t = setInterval(() => {
      if (ref.current && ref.current.complete) {
        if (ref.current.width === 0 || ref.current.height === 0) {
          const newsrc = getsrc(src);
          if (newsrc === null) setIsError(true);
          else setSrc(newsrc);
        } else setIsError(false);
      }
    }, 1000);

    return () => clearInterval(t);
  }, [isError, src]);

  function getsrc(src) {
    if (src === img.large) return null;
    else if (src === img.reg) return img.reg;
    else if (src === img.thumb) return img.large;
  }

  return { src, isError };
};
