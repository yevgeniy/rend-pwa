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
    let instance;
    const loaded = () => {
      instance = panzoom(document.querySelector("#panthis"), {
        onTouch: function(e) {
          // if (e.path.some(v => v.id === "menuButton" || v.id === "backButton"))
          //   return false;
          // `e` - is current touch event.
          //if (1.05 > zoom && zoom >= 1) return false; // tells the library to not preventDefault.
          return true;
        },
        minZoom: 1,
        smoothScroll: false
      });
      const origWidth = imgRef.current.getBoundingClientRect().width;
      const work = e => {
        setTimeout(() => {
          const z = imgRef.current.getBoundingClientRect().width / origWidth;
          setZoom(z);
          if (1.05 > z && z >= 1) e.moveTo(0, 0);
        }, 100);
      };
      instance.on("zoom", work);
      instance.on("panend", work);
    };
    imgRef.current.addEventListener("load", loaded);
    return () => {
      imgRef.current.removeEventListener("load", loaded);
      instance && instance.dispose();
    };
  }, []);

  const opacity = zoom === 1 ? 1 : 0;
  const pointerEvents = zoom === 1 ? "all" : "none";

  return (
    <div className={classes.container}>
      <div id="panthis" className={classes.imgContainer}>
        <img ref={imgRef} className={classes.img} src={img.reg} alt="" />
      </div>
      <IconButton
        id="menuButton"
        className={classes.menuButton}
        style={{ opacity, pointerEvents }}
      >
        <MenuIcon />
      </IconButton>
      <IconButton
        id="backButton"
        className={classes.backButton}
        style={{ opacity, pointerEvents }}
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
      margin: "auto",
      transition: "ease all 300ms"
    },
    backButton: {
      position: "fixed",
      zIndex: 9999999,
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
      position: "fixed",
      zIndex: 9999999,
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
