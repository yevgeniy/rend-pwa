import { useState, useEffect } from "react";
import { useUpdate, useStore, useSelectedState } from "./hooks";
import {
  getStateImageIds,
  getMarkedImageIds,
  getImagesByIds
} from "./services";

function useImageIds(db) {
  const { selectedState } = useSelectedState();
  const [imageIds, setImageIds] = useState(null);
  const [drawingIds, setDrawingIds] = useState(null);

  useEffect(() => {
    if (!selectedState) {
      setImageIds(null);
      setDrawingIds(null);
      return;
    }
    if (selectedState === "__MARKED__")
      getMarkedImageIds(db)
        .then(({ imageIds, drawingIds }) => {
          setDrawingIds(drawingIds);
          setImageIds(imageIds);
        })
        .catch(err => {
          throw err;
        });
    else {
      setDrawingIds(null);
      getStateImageIds(db, selectedState)
        .then(images => setImageIds(images))
        .catch(err => {
          throw err;
        });
    }
  }, [selectedState, db]);

  const deleteImage = async id => {
    await db.collection("images").deleteOne({ id });
    imageIds && setImageIds(imageIds.filter(v => v !== id));
    drawingIds && setDrawingIds(drawingIds.filter(v => v !== id));
  };

  return { imageIds, drawingIds, deleteImage };
}
function shuffle(a, rand) {
  for (let i = a.length - 1; i > 0; i--) {
    let r = rand[i] % rand.length;
    const j = Math.floor(r * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function useRandomImageIds(db) {
  const [rand, updateState] = useStore(s => s.rand);
  const { selectedState } = useSelectedState();
  const { imageIds, drawingIds, deleteImage } = useImageIds(db);
  const [imgs, setImgs] = useState(imageIds);

  useEffect(() => {
    if (rand) return;
    updateState({ rand: new Array(10).fill(0, 0, 10).map(v => Math.random()) });
  }, []);
  useUpdate(() => {
    updateState({ rand: new Array(10).fill(0, 0, 10).map(v => Math.random()) });
  }, [selectedState]);
  useEffect(() => {
    if (!rand || !imageIds) return;
    let imgs = shuffle(imageIds, rand);
    imgs = drawingIds ? [...drawingIds, ...imgs] : imgs;
    setImgs(imgs);
  }, [rand, imageIds, drawingIds]);

  return { imageIds: imgs, deleteImage };
}
function usePages(db) {
  const { imageIds, deleteImage } = useRandomImageIds(db);
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
    images: images.filter(v => !!v),
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
