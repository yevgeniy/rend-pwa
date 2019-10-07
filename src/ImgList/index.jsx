import React, { useRef, useState, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "classnames";

import ImgView from "../ImgView";
import { useImagesSystem, useSelectedImage } from "../hooksImages";
import cats from "../cats";
import Header from "./Header";
import StateSelectMenu from "./StateSelectMenu";
import ControlMenu from "./ControlMenu";
import Img from "./Img";

const useStyles = makeStyles(
  theme => {
    return {
      root: {},

      imgsContainer: {
        textAlign: "center",
        marginTop: theme.spacing(8)
      },
      isImgSelected: {
        overflow: "hidden",
        pointerEvents: "none"
      },
      markingButton: {
        "& svg": {
          marginRight: theme.spacing(1)
        }
      },
      isMarking: {
        color: "green"
      }
    };
  },
  { name: "ImgList" }
);
const ImgList = React.memo(({ state, db, states, setSelectedState }) => {
  const classes = useStyles();
  const brokenLinksRef = useRef(new Set());
  let {
    images: imgs,
    updateImage,
    deleteImage,
    totalPages,
    currentPage,
    setPage
  } = useImagesSystem(db, state);
  const {
    selectedImage: selectedImageId,
    setSelectedImage
  } = useSelectedImage();
  const [open, setOpen] = useState(false);
  const [isFunctionsOpen, setIsFunctionOpen] = useState(false);
  const [isMarking, setIsMarking] = useState(false);

  const selectedImage = (imgs || []).find(v => v && v.id === selectedImageId);

  const doSelectImage = useCallback(
    img => {
      isMarking
        ? updateImage(img.id, { marked: !img.marked })
        : setSelectedImage(img.id);
    },
    [isMarking]
  );
  const doPurge = () => {
    Array.from(brokenLinksRef.current).forEach(deleteImage);
    brokenLinksRef.current = new Set();
  };

  // /* show safe cats :D */
  // if (window.location.href.match("localhost"))
  //   if (imgs)
  //     imgs.forEach((v, i) => {
  //       v.thumb = cats[i % cats.length].thumb;
  //       v.reg = cats[i % cats.length].reg;
  //     });

  if (!imgs) return <div>loading images</div>;

  return (
    <div className={classes.root}>
      <Header
        {...{
          selectedImage,
          doOpenDrawer: () => setOpen(true),
          doPurge,
          currentPage,
          totalPages,
          setIsFunctionOpen,
          setPage
        }}
      />

      <div
        className={clsx(classes.imgsContainer, {
          [classes.isImgSelected]: selectedImage
        })}
      >
        {(imgs || []).map(img => {
          return (
            <Img
              key={img.id}
              doSelectImage={doSelectImage}
              brokenLinksRef={brokenLinksRef}
              {...img}
            />
          );
        })}
      </div>

      {selectedImage && (
        <ImgView {...{ img: selectedImage, updateImage, setSelectedImage }} />
      )}
      <StateSelectMenu
        {...{
          db,
          states,
          setSelectedState,
          open,
          setOpen
        }}
      />

      <ControlMenu
        {...{
          isFunctionsOpen,
          setIsFunctionOpen,
          setPage,
          currentPage,
          totalPages,
          isMarking,
          setIsMarking
        }}
      />
    </div>
  );
});

export default ImgList;
