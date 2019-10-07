import React, { useEffect, useState, Suspense } from "react";

import { makeStyles } from "@material-ui/core";
import Loading from "./Loading";
import { useStates, useDb, useSelectedState } from "./hooks";
import ErrorBoundary from "./ErrorBoundery";
import ImgList from "./ImgList";
const StatesView = React.lazy(() => import("./StatesView"));

const useStyles = makeStyles(theme => {
  return {
    root: {}
  };
});

const App = React.memo(() => {
  const classes = useStyles();
  const db = useDb();
  const states = useStates(null);
  const { selectedState, setSelectedState } = useSelectedState();

  if (!db) return null;
  if (!states) return <div>loading states</div>;

  return (
    <div className={classes.root}>
      <ErrorBoundary>
        {!selectedState ? (
          <Suspense fallback={<div></div>}>
            <StatesView {...{ states, setSelectedState, db }} />
          </Suspense>
        ) : (
          <ImgList {...{ setSelectedState, selectedState, db, states }} />
        )}
      </ErrorBoundary>
    </div>
  );
});

export default App;
