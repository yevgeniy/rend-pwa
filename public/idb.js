const request = self.indexedDB.open('react-rend', 5);
const db$ = new Promise(res => {
    request.onsuccess = function (event) {
        console.log('[onsuccess]', request.result);
        db = event.target.result;
        res(db);
    };
});

request.onerror = function (event) {
    console.log('[onerror]', request.error);
};

request.onupgradeneeded = function (event) {
    console.log('[onupgradeneeded]', event);
    db = event.target.result;
    db.createObjectStore('state', { keyPath: '_id' });
};
async function getState() {
    const db = await db$;
    const transaction = db.transaction('state');
    const store = transaction.objectStore('state');
    return new Promise(res => {
        store.count().onsuccess = countevent => {
            if (!countevent.target.result) {
                res(null)
                return;
            }
            store.get(1).onsuccess = e => res(e.target.result)
        }
    });
}
function saveState(state) {
    state._id = 1;
    state._created = +new Date();
    return db$.then(db => {
        const transaction = db.transaction('state', 'readwrite');
        return new Promise(res => {
            transaction.oncomplete = e => {
                // console.log('[transaction] done');
                res(state);
            };
            const store = transaction.objectStore('state');
            store.clear()
            // .onsuccess = e => console.log('cleared')
            store.add(state)
            // .onsuccess = e => console.log('added');
        })

    });
}
async function updateState(update) {
    let state = await getState();
    state = { ...state, ...update };
    return saveState(state);

}