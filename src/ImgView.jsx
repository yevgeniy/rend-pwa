import React, { useEffect, useRef, useState } from "react";
import { useUpdate, useCategories } from "./hooks";
import { makeStyles, Divider } from "@material-ui/core";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import Done from "@material-ui/icons/Done";
import Create from "@material-ui/icons/Create";
import Flag from "@material-ui/icons/Flag";
import MenuIcon from "@material-ui/icons/Menu";
import BackIcon from "@material-ui/icons/Reply";
import panzoom from "panzoom";
import AutoComplete from "./AutoComplete";

const useStyles = makeStyles(
  theme => {
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
  },
  { name: "imgview" }
);

const useDrawerStyles = makeStyles(() => ({
  paperAnchorRight: {
    width: 200
  }
}));

const ImgView = React.memo(({ img, updateImage, setSelectedImage }) => {
  const classes = useStyles();
  const drawerClasses = useDrawerStyles();
  const imgRef = useRef();
  const [zoom, setZoom] = useState(1);
  const [open, setOpen] = useState(false);
  const [marked, setMarked] = useMarked(img, updateImage);
  const [drawn, setDrawn] = useDrawn(img, updateImage);
  const [drawing, setDrawing] = useDrawing(img, updateImage);
  const back = () => {
    setSelectedImage(null);
  };

  useEffect(() => {
    const work = e => e.preventDefault();
    document.addEventListener("touchmove", work);
    document.body.style.touchAction = "none";
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("touchmove", work);
      document.body.style.touchAction = "";
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    let instance;
    let zoom = 1;
    let t;
    const loaded = () => {
      instance = panzoom(document.querySelector("#panthis"), {
        onTouch: function(e) {
          let paths = [...e.composedPath()].map(v => v.id);
          if (paths.some(v => v === "backButton" || v === "menuButton"))
            return false;
          return true;
        },
        minZoom: 1,
        smoothScroll: false
      });
      const origWidth = imgRef.current.getBoundingClientRect().width;
      const work = e => {
        t = setTimeout(() => {
          zoom = imgRef.current.getBoundingClientRect().width / origWidth;
          setZoom(zoom);
          if (1.05 > zoom && zoom >= 1) e.moveTo(0, 0);
        }, 100);
      };
      instance.on("zoom", work);
      instance.on("panend", work);
    };
    imgRef.current.addEventListener("load", loaded);
    return () => {
      clearTimeout(t);
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
        onClick={() => setOpen(true)}
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

      <Drawer
        classes={drawerClasses}
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
      >
        <List component="nav">
          <ListItem button onClick={() => setMarked(!marked)}>
            <ListItemIcon>
              <Done style={{ color: marked ? "green" : "" }} />
            </ListItemIcon>
            <ListItemText primary="Mark" />
          </ListItem>
          <ListItem button onClick={() => setDrawn(!drawn)}>
            <ListItemIcon>
              <Create style={{ color: drawn ? "orange" : "" }} />
            </ListItemIcon>
            <ListItemText primary="Drawn" />
          </ListItem>
          <ListItem button onClick={() => setDrawing(!drawing)}>
            <ListItemIcon>
              <Flag style={{ color: drawing ? "blue" : "" }} />
            </ListItemIcon>
            <ListItemText primary="Drawing" />
          </ListItem>
        </List>

        <Divider />

        <AutoCompleteSection img={img} updateImage={updateImage} />
      </Drawer>
    </div>
  );
});

function AutoCompleteSection({ img, updateImage }) {
  const [allKeyWords, updateAllKeyWords] = useCategories();
  const doUpdate = v => {
    updateAllKeyWords(v);
    updateImage(img.id, { keywords: v });
  };
  return (
    <div>
      <Divider />
      <AutoComplete
        keywords={img.keywords || []}
        allKeywords={allKeyWords || []}
        onUpdate={doUpdate}
      />
    </div>
  );
}

function useMarked(img, updateImage) {
  const [marked, setMarked] = useState(img.marked);

  useUpdate(() => {
    updateImage(img.id, { marked });
  }, [marked]);

  return [marked, setMarked];
}
function useDrawn(img, updateImage) {
  const [drawn, setDrawn] = useState(img.drawn);

  useUpdate(() => {
    updateImage(img.id, { drawn });
  }, [drawn]);
  return [drawn, setDrawn];
}
function useDrawing(img, updateImage) {
  const [drawing, setDrawing] = useState(img.drawing);

  useUpdate(() => {
    updateImage(img.id, { drawing });
  }, [drawing]);
  return [drawing, setDrawing];
}

export default ImgView;
