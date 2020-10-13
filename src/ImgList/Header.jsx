import React from "react";
import { AppBar, Toolbar, IconButton, makeStyles } from "@material-ui/core";
import clsx from "clsx";
import MenuIcon from "@material-ui/icons/Menu";
import More from "@material-ui/icons/More";
//import Renew from "@material-ui/icons/Autorenew";
import NavigateNext from "@material-ui/icons/NavigateNext";
import BrockenImage from "@material-ui/icons/BrokenImage";

const useStyles = makeStyles(theme => {
  return {
    appBar: {
      transition: "all ease 500ms",
      opacity: 1
    },
    hidden: {
      opacity: 0,
      pointerEvents: "none"
    },
    toolButton: {
      marginRight: theme.spacing(1),
      fontSize: 12,
      color: theme.palette.common.white
    },
    moreButton: {
      position: "absolute",
      right: 0
    }
  };
});

const Header = ({
  selectedImage,
  doOpenDrawer,
  doPurge,
  currentPage,
  totalPages,
  setIsFunctionOpen,
  setPage
}) => {
  const classes = useStyles();
  return (
    <AppBar
      position="fixed"
      className={clsx(classes.appBar, {
        [classes.hidden]: !!selectedImage
      })}
    >
      <Toolbar>
        <IconButton
          edge="start"
          className={classes.toolButton}
          color="inherit"
          onClick={doOpenDrawer}
        >
          <MenuIcon />
        </IconButton>
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
          onClick={() => setPage(Math.min(currentPage + 1, totalPages - 1))}
        >
          {currentPage + 1} / {totalPages}
          <NavigateNext />
        </IconButton>
        <IconButton
          className={clsx(classes.toolButton, classes.moreButton)}
          edge="end"
          onClick={() => setIsFunctionOpen(true)}
        >
          <More />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};
export default Header;
