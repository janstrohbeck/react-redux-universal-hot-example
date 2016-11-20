/**
 * THIS IS THE ENTRY POINT FOR THE CLIENT, JUST LIKE server.js IS THE ENTRY POINT FOR THE SERVER.
 */
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { applyRouterMiddleware, Router, browserHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { ReduxAsyncConnect } from 'redux-connect';
import { AppContainer as HotEnabler } from 'react-hot-loader';
import { useScroll } from 'react-router-scroll';<% if(offline) { %>
import { getStoredState } from 'redux-persist';
import localForage from 'localforage';<% } %><% if(realtime) { %>
import { socket } from 'app';<% } %>
import createStore from './redux/create';
import ApiClient from './helpers/ApiClient';
import getRoutes from './routes';<% if(offline) { %>
import checkNet from './utils/checkNet';

const offlinePersistConfig = {
  storage: localForage,
  whitelist: [<% if(auth) { %>'auth', <% } %>'info'<% if(examples.indexOf('chatFeathers') !== -1) { %>, 'chat'<% } %>]
};<% } %>

const client = new ApiClient();
const dest = document.getElementById('content');<% if(offline) { %><% if (realtime) { %>

function initSocket() {
  socket.on('news', data => {
    console.log(data);
    socket.emit('my other event', { my: 'data from client' });
  });
  socket.on('msg', data => {
    console.log(data);
  });

  return socket;
}

global.socket = initSocket();<% } %>

Promise.all([window.__data ? true : checkNet(), getStoredState(offlinePersistConfig)])
  .then(([online, storedData]) => {<% if (realtime) { %>
    if (online) socket.open();
<% } %>
    const data = !online ? { ...storedData, ...window.__data } : window.__data;
    const store = createStore(browserHistory, client, data, offlinePersistConfig);
    const history = syncHistoryWithStore(browserHistory, store);

    const renderRouter = props => <ReduxAsyncConnect
      {...props}
      helpers={{ client }}
      filter={item => !item.deferred}
      render={applyRouterMiddleware(useScroll())}
    />;

    const render = routes => {
      ReactDOM.render(
        <HotEnabler>
          <Provider store={store} key="provider">
            <Router history={history} render={renderRouter}>
              {routes}
            </Router>
          </Provider>
        </HotEnabler>,
        dest
      );
    };

    render(getRoutes(store));

    if (module.hot) {
      module.hot.accept('./routes', () => {
        const nextRoutes = require('./routes')(store);
        render(nextRoutes);
      });
    }

    if (process.env.NODE_ENV !== 'production') {
      window.React = React; // enable debugger

      if (!dest || !dest.firstChild || !dest.firstChild.attributes
        || !dest.firstChild.attributes['data-react-checksum']) {
        console.error('Server-side React render was discarded.' +
          'Make sure that your initial render does not contain any client-side code.');
      }
    }

    if (online && __DEVTOOLS__ && !window.devToolsExtension) {
      const devToolsDest = document.createElement('div');
      window.document.body.insertBefore(devToolsDest, null);
      const DevTools = require('./containers/DevTools/DevTools');
      ReactDOM.render(
        <Provider store={store} key="provider">
          <DevTools />
        </Provider>,
        devToolsDest
      );
    }

    if (!__DEVELOPMENT__ && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
        .then(() => {
          console.log('Service worker registered!');
        })
        .catch(error => {
          console.log('Error registering service worker: ', error);
        });

      navigator.serviceWorker.ready.then((/* registration */) => {
        console.log('Service Worker Ready');
      });
    }
  });<% } else { %>
const store = createStore(browserHistory, client, window.__data);
const history = syncHistoryWithStore(browserHistory, store);

<% if (realtime) { %>function initSocket() {
  socket.on('news', data => {
    console.log(data);
    socket.emit('my other event', { my: 'data from client' });
  });
  socket.on('msg', data => {
    console.log(data);
  });

  return socket;
}

global.socket = initSocket();

<% } %>const renderRouter = props => <ReduxAsyncConnect
  {...props}
  helpers={{ client }}
  filter={item => !item.deferred}
  render={applyRouterMiddleware(useScroll())}
/>;

const render = routes => {
  ReactDOM.render(
    <HotEnabler>
      <Provider store={store} key="provider">
        <Router history={history} render={renderRouter}>
          {routes}
        </Router>
      </Provider>
    </HotEnabler>,
    dest
  );
};

init();<% if (realtime) { %>
if (online) socket.open();<% } %>
render(getRoutes(store));

if (module.hot) {
  module.hot.accept('./routes', () => {
    const nextRoutes = require('./routes')(store);
    render(nextRoutes);
  });
}

if (process.env.NODE_ENV !== 'production') {
  window.React = React; // enable debugger

  if (!dest || !dest.firstChild || !dest.firstChild.attributes
    || !dest.firstChild.attributes['data-react-checksum']) {
    console.error('Server-side React render was discarded.' +
      'Make sure that your initial render does not contain any client-side code.');
  }
}

if (__DEVTOOLS__ && !window.devToolsExtension) {
  const devToolsDest = document.createElement('div');
  window.document.body.insertBefore(devToolsDest, null);
  const DevTools = require('./containers/DevTools/DevTools');
  ReactDOM.render(
    <Provider store={store} key="provider">
      <DevTools />
    </Provider>,
    devToolsDest
  );
}<% } %>