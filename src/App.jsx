import React, { useEffect, useState, Suspense } from "react";

import { makeStyles } from "@material-ui/core";
import Loading from "./Loading";
import {
  useStates,
  useUsers,
  useDb,
  useSelectedState,
  useSelectedUser
} from "./hooks";
import ErrorBoundary from "./ErrorBoundery";
import ImgList from "./ImgList";
const SelectedSrcView = React.lazy(() => import("./SelectSrcView"));

const useStyles = makeStyles(theme => {
  return {
    root: {}
  };
});

const App = React.memo(() => {
  const classes = useStyles();
  const db = useDb();
  const states = useStates(null);
  const users = useUsers(null);
  const { selectedState, setSelectedState } = useSelectedState();
  const { selectedUser, setSelectedUser } = useSelectedUser();

  if (!db) return null;
  if (!states) return <div>loading states</div>;
  if (!users) return <div>loading users</div>;

  console.log("AAAAA", users);

  return (
    <div className={classes.root}>
      <ErrorBoundary>
        {!selectedState && !selectedUser ? (
          <Suspense fallback={<div></div>}>
            <SelectedSrcView
              {...{
                states,
                setSelectedState,
                selectedState,
                users,
                selectedUser,
                setSelectedUser,
                db
              }}
            />
          </Suspense>
        ) : (
          <ImgList
            {...{
              setSelectedState,
              selectedState,
              db,
              states,
              users,
              selectedUser,
              setSelectedUser
            }}
          />
        )}
      </ErrorBoundary>
    </div>
  );
});

export default App;
