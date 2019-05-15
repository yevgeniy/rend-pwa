import React, { useState, useEffect } from "react";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
// import InboxIcon from '@material-ui/icons/Inbox';
// import DraftsIcon from '@material-ui/icons/Drafts';
import ImgList from "./ImgList";

const StatesView = ({ classes, states, setNav, db }) => {
  const [opacity, setOpacity] = useState(0);
  const [selectedState, setSelectedState] = useState(null);
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
    <div className={classes.container} style={{ opacity: opacity }}>
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
};

export default withStyles(theme => {
  return {
    container: {
      width: "100%",
      transition: "ease all 500ms"
    }
  };
})(StatesView);
