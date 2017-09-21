import * as async from 'async';
import { Store } from 'redux';
import { isLoaded as isAuthLoaded, load as loadAuth } from '../redux/modules/auth';
import { AsyncStore } from '../redux/create';

const isPromise = require('is-promise');

export default function getRoutesUtils(store: Store<any> & AsyncStore) {
  function injectReducerAndRender(reducerPromises: any, containerPromise: any) {
    const reducerNames = Object.keys(reducerPromises);
    const promises = reducerNames.map(name => reducerPromises[name]);
    return Promise.all(promises).then(reducers => {
      reducers.map((reducer, i) => store.inject(reducerNames[i], reducer.default || reducer));
      if (!isPromise(containerPromise) && typeof containerPromise === 'object') {
        const containerNames = Object.keys(containerPromise);
        return Promise.all(promises).then(containers =>
          containers.reduce(
            (prev, next, i) => ({
              ...prev,
              [containerNames[i]]: next.default || next
            }),
            {}
          )
        );
      }
      return containerPromise;
    });
  }

  function onEnterChain(...listOfOnEnters: any[]) {
    return (nextState: any, replace: any, onEnterCb: any) => {
      let redirected = false;
      const wrappedReplace = (...args: any[]) => {
        replace(...args);
        redirected = true;
      };
      async.eachSeries(
        listOfOnEnters,
        (onEnter, callback) => {
          if (!redirected) {
            const result = onEnter(store, nextState, wrappedReplace);
            if (isPromise(result)) return result.then(() => callback(), callback);
          }
          callback();
        },
        err => {
          if (err) onEnterCb(err);
          onEnterCb();
        }
      );
    };
  }

  function loadAuthIfNeeded() {
    if (!isAuthLoaded(store.getState())) {
      return store.dispatch(loadAuth() as any).catch(() => {});
    }
    return Promise.resolve();
  }

  function checkPermissions(chainedPermissions: any[]) {
    return loadAuthIfNeeded().then(() => chainedPermissions);
  }

  function enterPermissions(...listOfPermissions: any[]) {
    const permissions = [loadAuthIfNeeded].concat(listOfPermissions.map(perm => perm.onEnter || perm));
    return onEnterChain(...permissions);
  }

  function permissionsComponent(...listOfPermissions: any[]) {
    return (component = (props: any) => props.children) => ({
      onEnter: enterPermissions(...listOfPermissions),
      getComponent: () => checkPermissions(listOfPermissions.reduceRight((prev, next) => next(prev), component))
    });
  }

  return {
    injectReducerAndRender,
    permissionsComponent
  };
}
