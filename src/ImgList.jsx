import React, { useRef, useState, useCallback, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import MenuIcon from "@material-ui/icons/Menu";
import NavigateNext from "@material-ui/icons/NavigateNext";
import NavigateBefore from "@material-ui/icons/NavigateBefore";
import LastPage from "@material-ui/icons/LastPage";
import FirstPage from "@material-ui/icons/FirstPage";
import More from "@material-ui/icons/More";
import Renew from "@material-ui/icons/Autorenew";
import Done from "@material-ui/icons/Done";
import Create from "@material-ui/icons/Create";
import BrockenImage from "@material-ui/icons/BrokenImage";
import Drawer from "@material-ui/core/Drawer";
import { AppBar, Toolbar, IconButton, Typography } from "@material-ui/core";
import Loading from "./Loading";
import StatesView from "./StatesView";
import ImgView from "./ImgView";
import { useImages, useSelectedImage, useImageSrc } from "./hooks";
import cats from "./cats";

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

      toolButton: {
        marginRight: theme.spacing(1),
        fontSize: 12,
        color: theme.palette.common.white
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
    setImages,
    deleteImage,
    totalPages,
    currentPage,
    setPage
  } = useImages(db, state);
  const {
    selectedImage: selectedImageId,
    setSelectedImage
  } = useSelectedImage();
  const [open, setOpen] = useState(false);
  const [isFunctionsOpen, setIsFunctionOpen] = useState(false);

  const selectedImage = (imgs || []).find(v => v.id === selectedImageId);

  const doOpenDrawer = () => {
    setOpen(true);
  };
  const doSelectImage = useCallback(img => {
    setSelectedImage(img.id);
  }, []);
  const doPurge = () => {
    Array.from(brokenLinksRef.current).forEach(deleteImage);
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
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.toolButton}
            color="inherit"
            onClick={doOpenDrawer}
          >
            <MenuIcon />
          </IconButton>
          {state === "__MARKED__" ? (
            <IconButton
              edge="start"
              color="inherit"
              className={classes.toolButton}
              onClick={() => setImages(null)}
            >
              <Renew />
            </IconButton>
          ) : null}
          <IconButton
            edge="start"
            color="inherit"
            className={classes.toolButton}
            onClick={doPurge}
          >
            <BrockenImage />
          </IconButton>
          <IconButton
            className={classes.toolButton}
            edge="start"
            color="inherit"
            onClick={() => setPage(currentPage + 1)}
          >
            {currentPage + 1} / {totalPages}
            <NavigateNext />
          </IconButton>
          <IconButton
            className={classes.toolButton}
            edge="end"
            onClick={() => setIsFunctionOpen(true)}
          >
            <More />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Loading test={!!imgs}>
        <div
          className={classnames(classes.imgsContainer, {
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
          <IconButton className={classes.functionButton}>
            <FirstPage />
          </IconButton>
          <IconButton className={classes.functionButton}>
            <NavigateBefore />
          </IconButton>
          <Typography color="primary">
            {currentPage + 1} / {totalPages}
          </Typography>
          <IconButton className={classes.functionButton}>
            <NavigateNext />
          </IconButton>
          <IconButton className={classes.functionButton}>
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
        className={classnames(classes.root, {
          [classes.drawingIconsContainer]: img.drawing
        })}
      >
        {img.marked ? (
          <Done
            className={classnames(classes.icon, {
              [classes.drawingIcon]: img.drawing
            })}
          />
        ) : null}
        {img.drawn ? (
          <Create
            className={classnames(classes.icon, {
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

  const { src, isError, didError } = useImageSrc(img);

  useEffect(() => {
    if (isError) brokenLinksRef.current.add(img.id);
  }, [isError]);

  return (
    <div className={classes.root} onClick={() => doSelectImage(img)}>
      <IconsContainer {...img} />
      {isError ? (
        <BrockenImage className={classes.brokenImg} />
      ) : (
        <img src={src} onError={didError} alt="" />
      )}
    </div>
  );
});

export default ImgList;
