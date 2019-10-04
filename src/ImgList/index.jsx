import React, { useRef, useState, useCallback, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import clsx from "classnames";

import NavigateNext from "@material-ui/icons/NavigateNext";
import NavigateBefore from "@material-ui/icons/NavigateBefore";
import LastPage from "@material-ui/icons/LastPage";
import FirstPage from "@material-ui/icons/FirstPage";

import Done from "@material-ui/icons/Done";
import Create from "@material-ui/icons/Create";
import BrockenImage from "@material-ui/icons/BrokenImage";
import Drawer from "@material-ui/core/Drawer";
import { Toolbar, IconButton, Typography } from "@material-ui/core";
import Loading from "../Loading";
import StatesView from "../StatesView";
import ImgView from "../ImgView";
import { useImagesSystem, useSelectedImage, useImageSrc } from "../hooksImages";
import cats from "../cats";
import Header from "./Header";

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

      functionButton: {
        color: theme.palette.primary.dark
      }
    };
  },
  { name: "ImgList" }
);
const ImgList = React.memo(({ state, db, states, setNav }) => {
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

  const selectedImage = (imgs || []).find(v => v && v.id === selectedImageId);

  const doOpenDrawer = () => {
    setOpen(true);
  };
  const doSelectImage = useCallback(img => {
    setSelectedImage(img.id);
  }, []);
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
  return (
    <div>
      <Header
        {...{
          selectedImage,
          doOpenDrawer,
          doPurge,
          currentPage,
          totalPages,
          setIsFunctionOpen,
          setPage
        }}
      />

      <Loading test={!!imgs}>
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
      </Loading>
      {selectedImage ? (
        <ImgView {...{ img: selectedImage, updateImage, setSelectedImage }} />
      ) : null}
      <Drawer open={open} onClose={() => setOpen(false)}>
        <StatesView db={db} states={states} setNav={setNav} />
      </Drawer>
      <Drawer
        open={isFunctionsOpen}
        onClose={() => setIsFunctionOpen(false)}
        anchor="top"
      >
        <Toolbar>
          <IconButton
            className={classes.functionButton}
            onClick={() => setPage(0)}
          >
            <FirstPage />
          </IconButton>
          <IconButton
            className={classes.functionButton}
            onClick={() => setPage(Math.max(0, currentPage - 1))}
          >
            <NavigateBefore />
          </IconButton>
          <Typography color="primary">
            {currentPage + 1} / {totalPages}
          </Typography>
          <IconButton
            className={classes.functionButton}
            onClick={() => setPage(Math.min(currentPage + 1, totalPages - 1))}
          >
            <NavigateNext />
          </IconButton>
          <IconButton
            className={classes.functionButton}
            onClick={() => setPage(totalPages - 1)}
          >
            <LastPage />
          </IconButton>
        </Toolbar>
      </Drawer>
    </div>
  );
});

const useIconsContainerStyles = makeStyles(
  theme => {
    return {
      root: {
        background: "#4f4f4f",
        textAlign: "left"
      },
      drawingIconsContainer: {
        background: theme.palette.primary.dark
      },
      drawingIcon: {
        color: theme.palette.primary.dark.contrastText
      },
      icon: {
        color: theme.palette.common.white,
        margin: [[1, 5]]
      }
    };
  },
  { name: "IconsContainer" }
);

const IconsContainer = React.memo(img => {
  const classes = useIconsContainerStyles();
  if (img.marked || img.drawing || img.drawn) {
    return (
      <div
        className={clsx(classes.root, {
          [classes.drawingIconsContainer]: img.drawing
        })}
      >
        {img.marked ? (
          <Done
            className={clsx(classes.icon, {
              [classes.drawingIcon]: img.drawing
            })}
          />
        ) : null}
        {img.drawn ? (
          <Create
            className={clsx(classes.icon, {
              [classes.drawingIcon]: img.drawing
            })}
          />
        ) : null}
      </div>
    );
  }
  return null;
});

const useImgStyles = makeStyles(
  theme => {
    return {
      root: {
        display: "inline-block",
        margin: 2,
        verticalAlign: "top",
        "& img": {
          maxWidth: "100%"
        }
      },
      brokenImg: {
        width: "100%",
        height: 200,
        color: "#efefef",
        background: "gray"
      }
    };
  },
  { name: "Img" }
);
const Img = React.memo(({ doSelectImage, brokenLinksRef, ...img }) => {
  const classes = useImgStyles();
  const imgref = useRef();

  const { src, isError, diag } = useImageSrc(img, imgref);

  useEffect(() => {
    if (isError) brokenLinksRef.current.add(img.id);
  }, [isError]);

  return (
    <div className={classes.root} onClick={() => doSelectImage(img)}>
      <IconsContainer {...img} />
      {isError ? (
        <BrockenImage className={classes.brokenImg} />
      ) : (
        <div>
          {diag ? (
            <>
              <div>{diag.attempt}</div>
              <div>{diag.src}</div>
              <div>
                {(!!diag.complete).toString()} {diag.counter}
              </div>
              <div>
                {diag.width} {diag.height}
              </div>
            </>
          ) : null}

          <img ref={imgref} src={src} alt="" />
        </div>
      )}
    </div>
  );
});

export default ImgList;
