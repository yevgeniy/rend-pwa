import React, { useEffect } from "react";
import { withStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import BackIcon from "@material-ui/icons/Reply";
import panzoom from "panzoom";

const ImgView = ({ classes, img, db, setSelectedImage }) => {
  const back = () => {
    setSelectedImage(null);
  };

  useEffect(() => {
    panzoom(document.querySelector("#panthis"));
  }, []);

  return (
    <div className={classes.container}>
      <div id="panthis" className={classes.imgContainer}>
        <img className={classes.img} src={img.reg} alt="" />
      </div>
      <IconButton className={classes.menuButton}>
        <MenuIcon />
      </IconButton>
      <IconButton className={classes.backButton} onClick={back}>
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
      "&:hover": {
        background: theme.palette.primary.light
      }
    }
  };
})(ImgView);
