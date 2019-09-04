import React, { useRef, useState, useCallback, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Renew from "@material-ui/icons/Autorenew";
import Done from "@material-ui/icons/Done";
import Create from "@material-ui/icons/Create";
import BrockenImage from "@material-ui/icons/BrokenImage";
import orange from "@material-ui/core/colors/orange";
import Drawer from "@material-ui/core/Drawer";
import Loading from "./Loading";
import StatesView from "./StatesView";
import ImgView from "./ImgView";
import { useImages, useSelectedImage } from "./hooks";
import cats from "./cats";

const useStyles = makeStyles(
  theme => {
    return {
      root: {},

      imgsContainer: {
        textAlign: "center"
      },
      isImgSelected: {
        overflow: "hidden",
        pointerEvents: "none"
      },

      menuButton: {
        position: "fixed",
        top: 5,
        left: 5,
        background: theme.palette.secondary.dark,
        opacity: 0.8,
        color: theme.palette.secondary.contrastText,
        "&:hover": {
          background: theme.palette.secondary.light
        }
      },
      renewButton: {
        position: "fixed",
        top: 5,
        left: 65,
        background: "blue",
        opacity: 0.8,
        color: "#dfdfdf",
        transition: "ease all 300ms",
        "&:hover": {
          background: "lightblue",
          color: "darkblue"
        }
      },
      purgeButton: {
        position: "fixed",
        top: 5,
        left: 125,
        background: orange[600],
        opacity: 0.8,
        color: "#dfdfdf",
        transition: "ease all 300ms",
        "&:hover": {
          background: orange[400],
          color: "white"
        }
      }
    };
  },
  { name: "ImgList" }
);
const ImgList = React.memo(({ state, db, states, setNav }) => {
  const classes = useStyles();
  const brokenLinksRef = useRef(new Set());
  let { images: imgs, updateImage, setImages } = useImages(db, state);
  const {
    selectedImage: selectedImageId,
    setSelectedImage
  } = useSelectedImage();
  const [open, setOpen] = useState(false);

  const selectedImage = (imgs || []).find(v => v.id === selectedImageId);

  const doOpenDrawer = () => {
    setOpen(true);
  };
  const doSelectImage = useCallback(img => {
    setSelectedImage(img.id);
  }, []);
  const doPurge = () => {
    console.log(Array.from(brokenLinksRef.current));
  };

  if (window.location.href.match("localhost"))
    if (imgs)
      imgs.forEach((v, i) => {
        v.thumb = cats[i % cats.length].thumb;
        v.reg = cats[i % cats.length].reg;
      });

  return (
    <div>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <StatesView db={db} states={states} setNav={setNav} />
      </Drawer>
      <IconButton className={classes.menuButton} onClick={doOpenDrawer}>
        <MenuIcon />
      </IconButton>
      {state === "__MARKED__" ? (
        <IconButton
          className={classes.renewButton}
          onClick={() => setImages(null)}
        >
          <Renew />
        </IconButton>
      ) : null}
      <IconButton className={classes.purgeButton} onClick={doPurge}>
        <BrockenImage />
      </IconButton>

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
  const [isBroken, setIsBroken] = useState(false);

  useEffect(() => {
    setIsBroken(false);
  }, [img.thumb]);

  return (
    <div className={classes.root} onClick={() => doSelectImage(img)}>
      <IconsContainer {...img} />
      {isBroken ? (
        <BrockenImage className={classes.brokenImg} />
      ) : (
        <img src={img.thumb} onError={() => setIsBroken(true)} alt="" />
      )}
    </div>
  );
});

export default ImgList;
