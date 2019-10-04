import React, { useState, Suspense } from "react";

import { makeStyles } from "@material-ui/core";
import Loading from "./Loading";
import { useStates, useDb } from "./hooks";
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
  if (!db) return null;
  return (
    <div className={classes.root}>
      <Loading test={!!states}>
        {nav || (
          <Suspense fallback={<div>loading</div>}>
            <StatesView states={states} setNav={setNav} db={db} />
          </Suspense>
        )}
      </Loading>
    </div>
  );
});

export default App;
