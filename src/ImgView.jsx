import React, { useEffect, useRef, useState } from "react";
import { withStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import BackIcon from "@material-ui/icons/Reply";
import panzoom from "panzoom";

const ImgView = ({ classes, img, db, setSelectedImage }) => {
  const imgRef = useRef();
  const [zoom, setZoom] = useState(1);
  const back = () => {
    setSelectedImage(null);
  };

  useEffect(() => {
    const loaded = () => {
      const instance = panzoom(document.querySelector("#panthis"), {
        minZoom: 1
      });

      const origWidth = imgRef.current.getBoundingClientRect().width;
      instance.on("zoom", function(e) {
        setTimeout(() => {
          setZoom(imgRef.current.getBoundingClientRect().width / origWidth);
        }, 100);
      });
    };
    imgRef.current.addEventListener("load", loaded);
    return () => {
      imgRef.current.removeEventListener("load", loaded);
    };
  }, []);

  const opacity = zoom == 1 ? 1 : 0;

  return (
    <div className={classes.container}>
      <div id="panthis" className={classes.imgContainer}>
        <img ref={imgRef} className={classes.img} src={img.reg} alt="" />
      </div>
      <IconButton className={classes.menuButton} style={{ opacity }}>
        <MenuIcon />
      </IconButton>
      <IconButton
        className={classes.backButton}
        style={{ opacity }}
        onClick={back}
      >
        <BackIcon />
      </IconButton>
    </div>
  );
};

export default withStyles(theme => {
  return {
    container: {
      top: 0,
      left: 0,
      position: "fixed",
      height: "100vh",
      width: "100%",
      background: theme.palette.background.default
    },
    imgContainer: {
      position: "relative",
      height: "100vh",
      width: "100%"
    },
    img: {
      maxWidth: "98%",
      maxHeight: "98%",
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      margin: "auto"
    },
    backButton: {
      position: "absolute",
      left: 5,
      top: 5,
      background: theme.palette.secondary.dark,
      opacity: 0.8,
      color: theme.palette.secondary.contrastText,
      transition: "ease all 300ms",
      "&:hover": {
        background: theme.palette.secondary.light
      }
    },
    menuButton: {
      position: "absolute",
      right: 5,
      top: 5,
      background: theme.palette.primary.dark,
      opacity: 0.8,
      color: theme.palette.primary.contrastText,
      transition: "ease all 300ms",
      "&:hover": {
        background: theme.palette.primary.light
      }
    }
  };
})(ImgView);
