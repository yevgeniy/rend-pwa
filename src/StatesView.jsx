import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import { List, ListItem, ListItemText, Divider } from "@material-ui/core";
import ImgList from "./ImgList";
import { useSelectedState } from "./hooks";

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

const StatesView = React.memo(({ states, setNav, db }) => {
  const classes = useStyles();
  const [opacity, setOpacity] = useState(0);
  const { selectedState, setSelectedState } = useSelectedState();
  useEffect(() => {
    const t = setTimeout(() => setOpacity(1), 100);
    return () => clearTimeout(t);
  });
  useEffect(() => {
    if (!selectedState) return;
    setNav(
      <ImgList state={selectedState} db={db} setNav={setNav} states={states} />
    );
  }, [selectedState, setNav]);

  return (
    <div className={classes.root} style={{ opacity: opacity }}>
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
