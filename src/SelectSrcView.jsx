import React, { useState } from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core";
import { List, ListItem, ListItemText, Divider } from "@material-ui/core";

const useStyles = makeStyles(
  theme => {
    return {
      root: {
        width: "100%",
        transition: "ease all 500ms"
      },
      selectedState: {
        color: theme.palette.primary.dark
      }
    };
  },
  { name: "SelectSrcView" }
);

const SelectSrcView = React.memo(
  ({
    states,
    setSelectedState,
    selectedState,
    selectedUser,
    users,
    setSelectedUser,
    db
  }) => {
    const classes = useStyles();
    const [src, setsrc] = useState(selectedState ? "states" : "users");

    if (!states) return null;

    return (
      <div className={classes.root}>
        <List component="nav">
          <ListItem
            button
            onClick={() => setsrc(src === "states" ? "users" : "states")}
          >
            <ListItemText primary={src === "states" ? "states" : "users"} />
          </ListItem>
        </List>
        <Divider />
        <List component="nav">
          <ListItem button onClick={() => setSelectedState("__MARKED__")}>
            <ListItemText
              className={clsx({
                [classes.selectedState]: selectedState === "__MARKED__"
              })}
              primary="Marked"
            />
          </ListItem>
        </List>
        <Divider />

        <List component="nav">
          {(src === "states" ? states : users).map(v => {
            return (
              <ListItem
                key={v}
                button
                onClick={() =>
                  src === "states" ? setSelectedState(v) : setSelectedUser(v)
                }
              >
                <ListItemText
                  className={clsx({
                    [classes.selectedState]:
                      (v === src) === "states" ? selectedState : selectedUser
                  })}
                  primary={v}
                />
              </ListItem>
            );
          })}
        </List>
      </div>
    );
  }
);

export default SelectSrcView;
