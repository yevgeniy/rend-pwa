import React, { useState, useEffect } from "react";
import { withStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Drawer from "@material-ui/core/Drawer";
import Loading from "./Loading";
import StatesView from "./StatesView";

const ImgList = ({ classes, state, db, states, setNav }) => {
  const imgs = useImages(db, state);
  const [open, setOpen] = useState(false);
  const openDrawer = () => {
    setOpen(true);
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
        {(imgs || []).map(img => {
          return (
            <div className={classes.imgContainer}>
              <img key={img.thumb} src={img.thumb} alt="" />
            </div>
          );
        })}
      </Loading>
    </div>
  );
};

export default withStyles(theme => {
  return {
    imgContainer: {
      display: "inline-block",
      verticalAlign: "top"
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
