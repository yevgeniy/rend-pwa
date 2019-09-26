import { useState, useEffect } from "react";
import { useUpdate, useStore, useSelectedState } from "./hooks";
import {
  getStateImageIds,
  getMarkedImageIds,
  getImagesByIds,
  shuffle
} from "./services";

function useImageIds(db, selectedState) {
  const [imageIds, setImageIds] = useState(null);
  const rand = useRand(selectedState);

  useEffect(() => {
    if (!selectedState || !rand) {
      setImageIds(null);
      return;
    }
    if (selectedState === "__MARKED__")
      getMarkedImageIds(db)
        .then(({ imageIds, drawingIds }) => {
          setImageIds(
            Array.from(
              new Set([...drawingIds, ...shuffle(imageIds, rand)])
            ).filter(v => !!v)
          );
        })
        .catch(err => {
          throw err;
        });
    else
      getStateImageIds(db, selectedState)
        .then(images => setImageIds(images.filter(v => !!v)))
        .catch(err => {
          throw err;
        });
  }, [selectedState, db]);

  const deleteImage = async id => {
    await db.collection("images").deleteOne({ id });
    imageIds && setImageIds(imageIds.filter(v => v !== id));
  };

  return { imageIds, deleteImage };
}

function useRand(selectedState) {
  const [rand, updateState] = useStore(s => s.rand);

  useEffect(() => {
    if (rand) return;
    if (selectedState)
      updateState({
        rand: new Array(10).fill(0, 0, 10).map(v => Math.random())
      });
  }, []);
  useUpdate(() => {
    updateState({
      rand: !selectedState
        ? null
        : new Array(10).fill(0, 0, 10).map(v => Math.random())
    });
  }, [selectedState]);

  return rand;
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
  const [images, updateState] = useStore(({ images }) => {
    if (images && images.constructor === Array) return images;
    return null;
  });

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
  const { imageIds: allimageids, deleteImage } = useImageIds(db, selectedState);
  const {
    imageIds: pageimageids,
    currentPage,
    totalPages,
    pageSize,
    setPage
  } = usePages(allimageids, selectedState);
  const { images, updateImage } = useImages(pageimageids, db, selectedState);

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
