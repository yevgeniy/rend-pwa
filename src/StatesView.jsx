import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import { List, ListItem, ListItemText, Divider } from "@material-ui/core";
import ImgList from "./ImgList";

const useStyles = makeStyles(
  theme => {
    return {
      root: {
        width: "100%",
        transition: "ease all 500ms"
      }
    };
  },
  { name: "StatesView" }
);

const StatesView = React.memo(({ states, setSelectedState, db }) => {
  const classes = useStyles();

  if (!states) return null;

  return (
    <div className={classes.root}>
      <List component="nav">
        <ListItem button onClick={() => setSelectedState("__MARKED__")}>
          <ListItemText primary="Marked" />
        </ListItem>
      </List>
      <Divider />
      <List component="nav">
        {states.map(v => {
          return (
            <ListItem key={v} button onClick={() => setSelectedState(v)}>
              <ListItemText primary={v} />
            </ListItem>
          );
        })}
      </List>
    </div>
  );
});

export default StatesView;
