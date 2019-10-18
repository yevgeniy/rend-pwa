import React, { useEffect, useRef } from "react";
import clsx from "clsx";
import Done from "@material-ui/icons/Done";
import Create from "@material-ui/icons/Create";
import BrockenImage from "@material-ui/icons/BrokenImage";
import orange from "@material-ui/core/colors/orange";

import { makeStyles } from "@material-ui/core";
import { useImageSrc } from "../hooksImages";

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
      drawnIconsContainer: {
        background: orange[600]
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
          [classes.drawingIconsContainer]: img.drawing,
          [classes.drawnIconsContainer]: img.drawn
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

export default Img;
