/*
 * @license
 * Your First PWA Codelab (https://g.co/codelabs/pwa)
 * Copyright 2019 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License
 */



// CODELAB: Update cache names any time any of the cached files change.
const CACHE_NAME = 'static-cache-v1';

// CODELAB: Add list of files to cache here.
const FILES_TO_CACHE = [
  '/offline.html',
];

self.addEventListener('install', (evt) => {
  console.log('[ServiceWorker] Install');
  // CODELAB: Precache static resources here.
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching offline page');
      return cache.addAll(FILES_TO_CACHE);
    })
  );

  self.skipWaiting();
});

self.addEventListener('activate', (evt) => {
  console.log('[ServiceWorker] Activate');
  // CODELAB: Remove previous cached data from disk.
  evt.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );

  self.clients.claim();
});

self.addEventListener('fetch', (evt) => {
  console.log('[ServiceWorker] Fetch', evt.request.url);
  // CODELAB: Add fetch event handler here.
  if (evt.request.mode !== 'navigate') {
    // Not a page navigation, bail.
    return;
  }
  evt.respondWith(
    fetch(evt.request)
      .catch(() => {
        return caches.open(CACHE_NAME)
          .then((cache) => {
            return cache.match('offline.html');
          });
      })
  );
});

importScripts('./worker-reducer.js');

const initialState = {
  hello: 'world'
};

const store = createStore((state = {}, action) => {
  switch (action.type) {
    case 'result':
      return { ...state, result: action.result };
    default:
      return state;
  }
}, initialState);
self.addEventListener('message', async e => {

  //console.log(e.data);

  const state = store.dispatch(e.data);
  console.log(window);

  // const allClients = await clients.matchAll({ includeUncontrolled: true })
  // for (const c of allClients)
  //   c.postMessage('hello back 2');


})

////////////////////////
//var m=new MessageChannel(); m.port1.onmessage=e=>console.log(e); navigator.serviceWorker.controller.postMessage('hello', [m.port2])

//e.ports[0].postMessage('hello back');

///////////////////////
//navigator.serviceWorker.addEventListener('message', m=>console.log(m)); navigator.serviceWorker.controller.postMessage('hi');

// const allClients = await clients.matchAll({ includeUncontrolled: true })
//   for (const c of allClients)
//     c.postMessage('hello back 2');