function createStore(reducer, initialState) {
    let state = initialState;

    const store = {
        dispatch: action => {
            state = reducer(state, action);
            return state;
        }
    }
    store.dispatch({ type: "SUPER_INIT" });

    return store;
}