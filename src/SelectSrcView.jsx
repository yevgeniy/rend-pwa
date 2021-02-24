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
        color: theme.palette.primary.dark,
        "& span": {
          fontWeight: "bold"
        }
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

    users,
    selectedUser,
    setSelectedUser,

    categories,
    selectedCategory,
    setSelectedCategory,
    db
  }) => {
    const classes = useStyles();
    const { src, labels, doSelect, toggle, selected } = useSrc(
      selectedState,
      selectedUser,
      selectedCategory,
      users,
      states,
      categories,
      setSelectedState,
      setSelectedUser,
      setSelectedCategory
    );

    if (!states) return null;

    return (
      <div className={classes.root}>
        <List component="nav">
          <ListItem button onClick={toggle}>
            <ListItemText primary={src} />
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
          {labels.map(v => {
            return (
              <ListItem
                key={v}
                button
                onClick={() => {
                  doSelect(v);
                }}
              >
                <ListItemText
                  className={clsx({
                    [classes.selectedState]: selected === v
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

function useSrc(
  selectedState,
  selectedUser,
  selectedCategory,
  users,
  states,
  categories,
  setSelectedState,
  setSelectedUser,
  setSelectedCategory
) {
  const [data, setdata] = useState({
    src: selectedState ? "states" : selectedUser ? "users" : "categories",
    labels: selectedState ? states : selectedUser ? users : categories,
    doSelect: selectedState
      ? setSelectedState
      : selectedUser
      ? setSelectedUser
      : setSelectedCategory
  });

  const toggle = () => {
    setdata(data => {
      const { src } = data;
      if (src === "states")
        return {
          src: "users",
          labels: users,
          doSelect: setSelectedUser
        };
      else if (src === "users")
        return {
          src: "categories",
          labels: categories,
          doSelect: setSelectedCategory
        };
      else if (src === "categories")
        return {
          src: "states",
          labels: states,
          doSelect: setSelectedState
        };
    });
  };

  return {
    ...data,
    toggle,
    selected: selectedState || selectedUser || selectedCategory
  };
}

export default SelectSrcView;
