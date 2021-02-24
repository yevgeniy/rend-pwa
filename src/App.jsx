import React, { Suspense } from "react";

import { makeStyles } from "@material-ui/core";
import {
  useStates,
  useUsers,
  useCategories,
  useDb,
  useSelectedState,
  useSelectedUser,
  useSelectedCategory
} from "./hooks";
import ErrorBoundary from "./ErrorBoundery";
import ImgList from "./ImgList";
const SelectSrcView = React.lazy(() => import("./SelectSrcView"));

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
  const categories = useCategories(null);

  const { selectedState, setSelectedState } = useSelectedState();
  const { selectedUser, setSelectedUser } = useSelectedUser();
  const { selectedCategory, setSelectedCategory } = useSelectedCategory();

  if (!db) return null;
  if (!states) return <div>loading states</div>;
  if (!users) return <div>loading users</div>;
  if (!categories) return <div>loading categories</div>;

  return (
    <div className={classes.root}>
      <ErrorBoundary>
        {!selectedState && !selectedUser && !selectedCategory ? (
          <Suspense fallback={<div></div>}>
            <SelectSrcView
              {...{
                states,
                setSelectedState,
                selectedState,

                users,
                selectedUser,
                setSelectedUser,

                categories,
                setSelectedCategory,
                selectedCategory,

                db
              }}
            />
          </Suspense>
        ) : (
          <ImgList
            {...{
              setSelectedState,
              selectedState,
              states,

              db,

              users,
              selectedUser,
              setSelectedUser,

              categories,
              setSelectedCategory,
              selectedCategory
            }}
          />
        )}
      </ErrorBoundary>
    </div>
  );
});

export default App;
