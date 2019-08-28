import React, { useState, useEffect } from "react";
import { withStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Renew from "@material-ui/icons/Autorenew";
import Done from "@material-ui/icons/Done";
import Create from "@material-ui/icons/Create";
import Drawer from "@material-ui/core/Drawer";
import Loading from "./Loading";
import StatesView from "./StatesView";
import ImgView from "./ImgView";
import {useImages} from './hooks';

const ImgList = ({ classes, state, db, states, setNav }) => {
  const {images:imgs, updateImage, setImages} = useImages(db, state);
  const [selectedImage, setSelectedImage] = useState(null);
  const [open, setOpen] = useState(false);
  const openDrawer = () => {
    setOpen(true);
  };
  const selectImg = img => {
    setSelectedImage(img);
  };
  const renderIconsContainer = img => {
    if (img.marked || img.drawing || img.drawn) {
      return (
        <div
          className={classnames(
            classes.iconsContainer,
            img.drawing ? classes.drawingIconsContainer : null
          )}
        >
          {img.marked ? (
            <Done
              className={classnames(
                classes.icon,
                img.drawing ? classes.drawingIcon : null
              )}
            />
          ) : null}
          {img.drawn ? (
            <Create
              className={classnames(
                classes.icon,
                img.drawing ? classes.drawingIcon : null
              )}
            />
          ) : null}
        </div>
      );
    }
    return null;
  };
  return (
    <div>
      <Drawer open={open} onClose={() => setOpen(false)}>
        <StatesView db={db} states={states} setNav={setNav} />
      </Drawer>
      <IconButton className={classes.menuButton} onClick={openDrawer}>
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

      <Loading test={!!imgs}>
        <div
          className={classes.imgsContainer}
          style={{
            // display: selectedImage ? "none" : ""
            overflow: selectedImage ? "hidden" : "",
            pointerEvents: selectedImage ? "none" : ""
          }}
        >
          {(imgs || []).map(img => {
            return (
              <div
                key={img.id}
                className={classes.imgContainer}
                onClick={() => selectImg(img)}
              >
                {renderIconsContainer(img)}
                <img key={img.thumb} src={img.thumb} alt="" />
              </div>
            );
          })}
        </div>
      </Loading>
      {selectedImage ? (
        <ImgView {...{ img: selectedImage, updateImage, setSelectedImage }} />
      ) : null}
    </div>
  );
};

export default withStyles(theme => {
  return {
    iconsContainer: {
      background: "#4f4f4f",
      textAlign: "left"
    },
    icon: {
      color: theme.palette.common.white,
      margin: [[1, 5]]
    },
    drawingIconsContainer: {
      background: theme.palette.primary.dark
    },
    drawingIcon: {
      color: theme.palette.primary.dark.contrastText
    },
    imgsContainer: {
      textAlign: "center"
    },
    imgContainer: {
      display: "inline-block",
      margin: 2,
      verticalAlign: "top",
      "& img": {
        maxWidth: "100%"
      }
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
    }
  };
})(ImgList);


