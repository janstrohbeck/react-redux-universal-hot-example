import {
  createStore as _createStore,
  applyMiddleware,
  compose,
  combineReducers,
  Store,
  Reducer,
  StoreEnhancer
} from 'redux';
import { History } from 'history';
import { Application } from 'feathers';
import { routerMiddleware } from 'react-router-redux';
import { createPersistor } from 'redux-persist';
import createMiddleware from './middleware/clientMiddleware';
import createReducers from './reducer';
import ApiClient from '../helpers/ApiClient';

export interface ReducerMap {
  [key: string]: Reducer<any>;
}

export function inject(store: Store<any> & AsyncStore, name: string, asyncReducer: Reducer<any>) {
  if (store.asyncReducers[name]) return;
  store.asyncReducers[name] = asyncReducer;
  store.replaceReducer(combineReducers(createReducers(store.asyncReducers)));
}

export interface AsyncStore {
  asyncReducers?: ReducerMap;
  inject: (name: string, asyncReducer: Reducer<any>) => void;
}

function getMissingReducers(reducers: ReducerMap, data: ReducerMap) {
  if (!data) return {};
  return Object.keys(data).reduce(
    (prev, next) => (reducers[next] ? prev : { ...prev, [next]: (state = {}) => state }),
    {}
  );
}

interface Params {
  client: ApiClient;
  app?: Application;
  restApp?: Application;
}

declare global {
  interface Window {
    devToolsExtension?: () => StoreEnhancer<any>;
  }
}

export default function createStore(
  history: History,
  { client, app, restApp }: Params,
  data?: ReducerMap,
  persistConfig?: Object
) {
  const middleware = [createMiddleware({ client, app, restApp }), routerMiddleware(history as any)];

  let enhancers = [applyMiddleware(...middleware)];
  if (__CLIENT__ && __DEVTOOLS__) {
    const { persistState } = require('redux-devtools');
    const DevTools = require('../containers/DevTools/DevTools').default;
    enhancers = [
      ...enhancers,
      window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument(),
      persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
    ];
  }

  const finalCreateStore = compose(...enhancers)(_createStore);
  const missingReducers = getMissingReducers(createReducers(), data);
  const store1 = finalCreateStore(combineReducers(createReducers(missingReducers)), data);
  const store: Store<any> & AsyncStore = {
    ...store1,
    asyncReducers: {},
    inject: null
  };
  store.inject = inject.bind(null, store);

  if (persistConfig) {
    createPersistor(store, persistConfig);
    store.dispatch({ type: 'PERSIST' });
  }

  if (__DEVELOPMENT__ && module.hot) {
    module.hot.accept('./reducer', () => {
      const reducer = require('./reducer').default;
      store.replaceReducer(combineReducers((reducer.default || reducer)(store.asyncReducers)));
    });
  }

  return store;
}
