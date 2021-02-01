import React from "react";
import clsx from "clsx";
import {
  Drawer,
  Toolbar,
  IconButton,
  Typography,
  Divider,
  Button,
  makeStyles
} from "@material-ui/core";
import NavigateNext from "@material-ui/icons/NavigateNext";
import NavigateBefore from "@material-ui/icons/NavigateBefore";
import LastPage from "@material-ui/icons/LastPage";
import FirstPage from "@material-ui/icons/FirstPage";
import Flag from "@material-ui/icons/Flag";

const useStyles = makeStyles(theme => {
  return {
    functionButton: {
      color: theme.palette.primary.dark
    },
    markingButton: {
      "& svg": {
        marginRight: theme.spacing(1)
      }
    },
    isMarking: {
      color: "green"
    }
  };
});

const ControlMenu = React.memo(
  ({
    isFunctionsOpen,
    setIsFunctionOpen,
    name,
    setPage,
    currentPage,
    totalPages,
    isMarking,
    setIsMarking
  }) => {
    const classes = useStyles();
    return (
      <Drawer
        open={isFunctionsOpen}
        onClose={() => setIsFunctionOpen(false)}
        anchor="top"
      >
        <Toolbar>
          <Typography variant="h6">{name}</Typography>
        </Toolbar>
        <Divider />
        <Toolbar>
          <IconButton
            className={classes.functionButton}
            onClick={() => setPage(0)}
          >
            <FirstPage />
          </IconButton>
          <IconButton
            className={classes.functionButton}
            onClick={() => setPage(Math.max(0, currentPage - 1))}
          >
            <NavigateBefore />
          </IconButton>
          <Typography color="primary">
            {currentPage + 1} / {totalPages}
          </Typography>
          <IconButton
            className={classes.functionButton}
            onClick={() => setPage(Math.min(currentPage + 1, totalPages - 1))}
          >
            <NavigateNext />
          </IconButton>
          <IconButton
            className={classes.functionButton}
            onClick={() => setPage(totalPages - 1)}
          >
            <LastPage />
          </IconButton>
        </Toolbar>
        <Divider />
        <Toolbar>
          <Button
            className={clsx(classes.markingButton, {
              [classes.isMarking]: isMarking
            })}
            onClick={() => setIsMarking(!isMarking)}
          >
            <Flag />
            {isMarking ? "End Marking" : "Start Marking"}
          </Button>
        </Toolbar>
      </Drawer>
    );
  }
);

export default ControlMenu;
