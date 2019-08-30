import React, { useState } from "react";

import { makeStyles } from '@material-ui/core';
import Loading from "./Loading";
import StatesView from "./StatesView";
import { useStates, useDb } from './hooks';


const useStyles = makeStyles(theme => {
    return {
        root: {
            background: theme.palette.background.default
        }
    }
})

const App = React.memo(() => {
    const classes = useStyles()
    const db = useDb();
    const states = useStates(null);
    const [nav, setNav] = useState(null);

    if (!db)
        return null;
    return (
        <div className={classes.root}>
            <Loading test={!!states}>
                {nav || <StatesView states={states} setNav={setNav} db={db} />}
            </Loading>
        </div>
    );
});

export default App;