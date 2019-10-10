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
  const [pageIds, updateState_pageIds] = useStore(s => s.pageIds);
  const [currentPage, updateState_currentPage] = useStore(s =>
    Math.max(0, s.currentPage || 0)
  );
  const [totalPages, updateState_totalPages] = useStore(s => s.totalPages);
  const [pageSize, updateState_pageSize] = useStore(s => s.pageSize || 20);

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
      updateState_pageIds({ pageIds: null });
      return;
    }
    const pi = imageIds.slice(currentPage * pageSize).slice(0, pageSize);
    updateState_pageIds({ pageIds: pi });
  }, [pageSize, totalPages, currentPage, imageIds]);

  const setPage = p => {
    updateState_currentPage({ currentPage: p });
  };

  return {
    imageIds: pageIds,
    currentPage,
    totalPages,
    pageSize,
    setPage
  };
}
function useImages(imageIds, db, selectedState) {
  const [images, updateState] = useStore(s => s.images);

  useEffect(() => {
    if (!selectedState) updateState({ images: null });
  }, [selectedState]);

  useEffect(() => {
    if (!imageIds) return;

    getImagesByIds(db, imageIds)
      .then(async res => {
        res = await removeDuplicates(res, db);
        updateState({
          images: imageIds
            .map(id => res.find(v => id === v.id))
            .filter(v => !!v)
        });
      })
      .catch(err => {
        throw err;
      });
  }, [db, imageIds]);

  const updateImage = async (id, props) => {
    const i = images.findIndex(v => v.id === id);
    images[i] = { ...images[i], ...props };
    updateState({ images: [...images] });

    await db
      .collection("images")
      .updateOne({ id: id }, { $set: props })
      .catch(e => alert("failed to update image"));
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

  const { images, updateImage } = useImages(pageimageids, db, selectedState);
  console.log("a", images);

  const deleteImage = async id => {
    if (!imageIds) return;
    imageIds &&
      setImageIds(imageIds => {
        return imageIds.filter(v => v !== id);
      });
    await db
      .collection("images")
      .deleteOne({ id })
      .catch(() => alert("problem deleting image"));
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
  let [selectedImage, updateState] = useStore(
    ({ selectedImage }) => selectedImage
  );

  const setSelectedImage = selectedImage => {
    updateState({ selectedImage });
  };
  return { selectedImage, setSelectedImage };
}
export const useImageSrc = (img, ref) => {
  const [src, setSrc] = useState(img.thumb);
  const [isError, setIsError] = useState(null);
  const [diag, setDiag] = useState({ attempt: `thumb`, src: img.thumb });

  useEffect(() => {
    if (isError !== null) return;

    let c = 0;
    const t = setInterval(() => {
      setDiag(diag => ({ ...diag, counter: ++c }));
      if (ref.current && ref.current.complete) {
        setDiag(diag => ({
          ...diag,
          complete: true,
          width: ref.current.width,
          height: ref.current.height
        }));
        if (ref.current.width <= 20 || ref.current.height <= 20) {
          const newsrc = getsrc(src);
          if (newsrc === null) {
            setDiag(diag => ({ ...diag, src: null }));
            setIsError(true);
          } else {
            setSrc(newsrc);
          }
        } else {
          setDiag(null);
          setIsError(false);
        }
      } else
        setDiag(diag => ({
          ...diag,
          complete: false,
          width: null,
          height: null
        }));
    }, 1000);

    return () => clearInterval(t);
  }, [isError, src]);

  function getsrc(src) {
    if (src === img.large) {
      setDiag(null);
      return null;
    } else if (src === img.reg) {
      setDiag({
        ...diag,
        attempt: "reg",
        src: img.reg
      });
      return img.reg;
    } else if (src === img.thumb) {
      setDiag({
        ...diag,
        attempt: "large",
        src: img.large
      });
      return img.large;
    }
  }

  return { src, isError, diag };
};
