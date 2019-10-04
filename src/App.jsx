import React, { useEffect, useState, Suspense } from "react";

import { makeStyles } from "@material-ui/core";
import Loading from "./Loading";
import { useStates, useDb } from "./hooks";
import ErrorBoundary from "./ErrorBoundery";
const StatesView = React.lazy(() => import("./StatesView"));

const useStyles = makeStyles(theme => {
  return {
    root: {}
  };
});

const App = React.memo(() => {
  const classes = useStyles();
  const db = useDb();
  let states = useStates(null);
  const [nav, setNav] = useState(null);
  useEffect(() => {
    if (!states) setNav(null);
  });

  if (!db) return null;
  return (
    <div className={classes.root}>
      <ErrorBoundary>
        <Loading test={!!states}>
          {nav || (
            <Suspense fallback={<div></div>}>
              <StatesView states={states} setNav={setNav} db={db} />
            </Suspense>
          )}
        </Loading>
      </ErrorBoundary>
    </div>
  );
});

export default App;
