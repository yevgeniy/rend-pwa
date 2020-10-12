import React from "react";
import { Drawer } from "@material-ui/core";
import SelectSrcView from "../SelectSrcView";

const StateSelectMenu = React.memo(
  ({
    open,
    db,
    states,
    setSelectedState,
    selectedState,
    setOpen,
    users,
    selectedUser,
    setSelectedUser
  }) => {
    return (
      <Drawer open={open} onClose={() => setOpen(false)}>
        <React.Suspense fallback={<div></div>}>
          <SelectSrcView
            db={db}
            states={states}
            selectedState={selectedState}
            setSelectedState={setSelectedState}
            users={users}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
          />
        </React.Suspense>
      </Drawer>
    );
  }
);

export default StateSelectMenu;
