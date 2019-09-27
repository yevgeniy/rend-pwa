import { useState, useEffect, useMemo } from "react";
import { useMemoState, useUpdate, useStore, useSelectedState } from "./hooks";
import {
  getStateImageIds,
  getMarkedImageIds,
  getImagesByIds,
  getDrawingImageIds,
  shuffle
} from "./services";

function useDrawingImageIds(db, selectedState) {
  const [imageIds] = useMemoState(() => {
    if (!selectedState) return null;
    if (selectedState === "__MARKED__") return getDrawingImageIds(db);

    return null;
  }, [selectedState, db]);

  return imageIds;
}

function useImageIds(db, selectedState) {
  const [imageIds] = useMemoState(() => {
    if (!selectedState) return;
    if (selectedState === "__MARKED__") return getMarkedImageIds(db);
    else return getStateImageIds(db, selectedState);
  }, [selectedState, db]);

  const shuffledImageIds = useShuffledImageIds(
    imageIds,
    selectedState === "__MARKED__"
  );

  return shuffledImageIds;
}

function useShuffledImageIds(imageIds, doShuffle) {
  const [rand, updateState] = useStore(s => s.rand);

  const imgs = useMemo(() => {
    return rand && imageIds ? shuffle([...imageIds], rand) : imageIds;
  }, [rand]);

  useUpdate(() => {
    updateState({
      rand: !doShuffle
        ? null
        : new Array(10).fill(0, 0, 10).map(v => Math.random())
    });
  }, [imageIds, doShuffle]);

  return imgs;
}
function usePages(imageIds, selectedState) {
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
  const { images, updateImage } = useImages(pageimageids, db, selectedState);

  const deleteImage = async id => {
    await db.collection("images").deleteOne({ id });
    imageIds && setImageIds(imageIds.filter(v => v !== id));
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
