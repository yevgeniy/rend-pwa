import React from "react";
import { Drawer } from "@material-ui/core";
import StatesView from "../StatesView";

const StateSelectMenu = React.memo(
  ({ open, db, states, setSelectedState, setOpen }) => {
    return (
      <Drawer open={open} onClose={() => setOpen(false)}>
        <React.Suspense fallback={<div></div>}>
          <StatesView
            db={db}
            states={states}
            setSelectedState={setSelectedState}
          />
        </React.Suspense>
      </Drawer>
    );
  }
);

export default StateSelectMenu;
