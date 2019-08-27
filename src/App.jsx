import React, { useState } from "react";

import { withStyles } from "@material-ui/core/styles";
import Loading from "./Loading";
import StatesView from "./StatesView";
import { useStates, useDb } from './hooks';

const App = ({ classes }) => {
    const db = useDb();
    const states = useStates(null);
    const [nav, setNav] = useState(null);

    if (!db)
        return null;

    return (
        <div className={classes.container}>
            <Loading test={!!states}>
                {nav || <StatesView states={states} setNav={setNav} db={db} />}
            </Loading>
        </div>
    );
};

export default withStyles(theme => {
    return {
        container: {
            background: theme.palette.background.default
        }
    };
})(App);


