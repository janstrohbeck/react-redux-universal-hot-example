/**
 * THIS IS THE ENTRY POINT FOR THE CLIENT, JUST LIKE server.js IS THE ENTRY POINT FOR THE SERVER.
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { applyRouterMiddleware, Router, browserHistory, match } from 'react-router';
import { bindActionCreators } from 'redux';
import { syncHistoryWithStore, replace } from 'react-router-redux';
import { ReduxAsyncConnect } from 'redux-connect';
import { AppContainer as HotEnabler } from 'react-hot-loader';
import { useScroll } from 'react-router-scroll';
import { getStoredState } from 'redux-persist';
import * as localForage from 'localforage';
import { socket, createApp } from './app';
import { Provider } from './components';
import createStore from './redux/create';
import ApiClient from './helpers/ApiClient';
import getRoutes from './routes';
import isOnline from './utils/isOnline';

const offlinePersistConfig = {
  storage: localForage,
  whitelist: ['auth', 'info', 'chat']
};

const client = new ApiClient();
const app = createApp();
const restApp = createApp('rest');
const dest = document.getElementById('content');

function initSocket() {
  socket.on('news', (data: any) => {
    console.log(data);
    socket.emit('my other event', { my: 'data from client' });
  });
  socket.on('msg', (data: any) => {
    console.log(data);
  });

  return socket;
}

(global as any).socket = initSocket();

declare global {
  interface Window {
    __data?: any;
  }
}

Promise.all([window.__data ? true : isOnline(), getStoredState(offlinePersistConfig)]).then(([online, storedData]) => {
  if (online) socket.open();

  // if your server doesn't authenticate socket connexion by cookie
  // if (online) app.authenticate().catch(() => null);

  const data = !online ? { ...storedData, ...window.__data, online } : { ...window.__data, online };
  const store = createStore(browserHistory, { client, app, restApp }, data, offlinePersistConfig);
  const history = syncHistoryWithStore(browserHistory, store);

  const redirect = bindActionCreators(replace, store.dispatch);

  const renderRouter = (props: Object) => (
    <ReduxAsyncConnect
      {...props}
      helpers={{ client, app, restApp, redirect }}
      filter={(item: any) => !item.deferred}
      render={applyRouterMiddleware(useScroll())}
    />
  );

  const render = (routes: any) => {
    match({ history, routes }, (error, redirectLocation, renderProps) => {
      ReactDOM.render(
        <HotEnabler>
          <Provider store={store} app={app} restApp={restApp} key="provider">
            <Router {...renderProps} render={renderRouter} history={history}>
              {routes}
            </Router>
          </Provider>
        </HotEnabler>,
        dest
      );
    });
  };

  render(getRoutes(store));

  if (module.hot) {
    module.hot.accept('./routes', () => {
      const nextRoutes = require('./routes').default(store);
      render(nextRoutes);
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    (window as any).React = React; // enable debugger

    if (
      !dest ||
      !dest.firstChild ||
      !dest.firstChild.attributes ||
      !dest.firstChild.attributes.getNamedItem('data-react-checksum')
    ) {
      console.error(
        'Server-side React render was discarded.' +
          'Make sure that your initial render does not contain any client-side code.'
      );
    }
  }

  if (__DEVTOOLS__ && !window.devToolsExtension) {
    const devToolsDest = document.createElement('div');
    window.document.body.insertBefore(devToolsDest, null);
    const DevTools = require('./containers/DevTools/DevTools').default;
    ReactDOM.render(
      <Provider store={store} key="provider">
        <DevTools />
      </Provider>,
      devToolsDest
    );
  }

  if (online && !__DEVELOPMENT__ && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/dist/service-worker.js', { scope: '/' })
        .then(() => {
          console.log('Service worker registered!');
        })
        .catch(error => {
          console.log('Error registering service worker: ', error);
        });

      navigator.serviceWorker.ready.then((/* registration */) => {
        console.log('Service Worker Ready');
      });
    });
  }
});
