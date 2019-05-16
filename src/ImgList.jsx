import React, { useState, useEffect } from "react";
import { withStyles } from "@material-ui/core/styles";
import classnames from "classnames";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Done from "@material-ui/icons/Done";
import Create from "@material-ui/icons/Create";
import Drawer from "@material-ui/core/Drawer";
import Loading from "./Loading";
import StatesView from "./StatesView";

const ImgList = ({ classes, state, db, states, setNav }) => {
  const imgs = useImages(db, state);
  const [open, setOpen] = useState(false);
  const openDrawer = () => {
    setOpen(true);
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
          {img.done ? (
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
      <Loading test={!!imgs}>
        <div className={classes.imgsContainer}>
          {(imgs || []).map(img => {
            console.log(img);
            return (
              <div key={img.id} className={classes.imgContainer}>
                {renderIconsContainer(img)}
                <img key={img.thumb} src={img.thumb} alt="" />
              </div>
            );
          })}
        </div>
      </Loading>
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
      top: 8,
      left: 8,
      background: theme.palette.secondary.dark,
      opacity: 0.8,
      color: theme.palette.secondary.contrastText,
      "&:hover": {
        background: theme.palette.secondary.light
      }
    }
  };
})(ImgList);

function useImages(db, state) {
  const [images, setImages] = useState(null);

  useEffect(() => {
    if (state === "__MARKED__") {
      getMarkedImages(db)
        .then(res => setImages(res))
        .catch(err => {
          throw err;
        });
    } else
      getStateImages(db, state)
        .then(res => setImages(res))
        .catch(err => {
          throw err;
        });
  }, [db, state]);

  return images;
}
async function getStateImages(db, state) {
  let images = await db
    .collection("images")
    .find({ datetime: state })
    .toArray();
  return images;
}
async function getMarkedImages(db) {
  let images = await db
    .collection("images")
    .aggregate([{ $match: { marked: true } }, { $sample: { size: 10 } }])
    .toArray();
  let drawing = await db
    .collection("images")
    .find({ drawing: true })
    .toArray();
  images.unshift(...drawing);
  return images;
}
