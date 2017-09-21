import * as React from 'react';
import { IndexRoute, Route } from 'react-router';
import { routerActions } from 'react-router-redux';
import { UserAuthWrapper } from 'redux-auth-wrapper';
import { Store } from 'redux';
import { App, Home, NotFound } from './containers';
import getRoutesUtils from './utils/routes';
import { AsyncStore } from './redux/create';

// Define server-side System.import()
if (typeof System === 'undefined') {
  (global as any).System = {
    // eslint-disable-next-line import/no-dynamic-require
    import: (module: string) => new Promise((resolve, reject) => resolve(require(module)))
  };
}

export default (store: Store<any> & AsyncStore) => {
  const { injectReducerAndRender, permissionsComponent } = getRoutesUtils(store);

  /* Permissions */

  const isAuthenticated = UserAuthWrapper({
    authSelector: (state: any) => state.auth.user,
    redirectAction: routerActions.replace,
    wrapperDisplayName: 'UserIsAuthenticated'
  });

  const isNotAuthenticated = UserAuthWrapper({
    authSelector: (state: any) => state.auth.user,
    redirectAction: routerActions.replace,
    wrapperDisplayName: 'UserIsNotAuthenticated',
    predicate: (user?: Object) => !user,
    failureRedirectPath: '/',
    allowRedirectBack: false
  });

  /**
   * Please keep routes in alphabetical order
   */
  return (
    <Route path="/" component={App}>
      {/* Home (main) route */}
      <IndexRoute component={Home} />

      {/* Routes requiring login */}
      {/*
        You can also protect a route like this:
        <Route path="protected-route" {...permissionsComponent(isAuthenticated)(Component)}>
      */}
      <Route {...permissionsComponent(isAuthenticated)()}>
        <Route
          path="loginSuccess"
          getComponent={() =>
            System.import('./containers/LoginSuccess/LoginSuccess').then((module: any) => module.default)}
        />
        <Route
          path="chatFeathers"
          getComponent={() =>
            injectReducerAndRender(
              { chat: System.import('./redux/modules/chat').then((module: any) => module.default) },
              System.import('./containers/ChatFeathers/ChatFeathers').then((module: any) => module.default)
            )}
        />
      </Route>

      {/* Routes disallow login */}
      <Route {...permissionsComponent(isNotAuthenticated)()}>
        <Route
          path="register"
          getComponent={() => System.import('./containers/Register/Register').then((module: any) => module.default)}
        />
      </Route>

      {/* Routes */}
      <Route
        path="login"
        getComponent={() => System.import('./containers/Login/Login').then((module: any) => module.default)}
      />
      <Route
        path="about"
        getComponent={() => System.import('./containers/About/About').then((module: any) => module.default)}
      />
      <Route
        path="survey"
        getComponent={() =>
          injectReducerAndRender(
            { survey: System.import('./redux/modules/survey').then((module: any) => module.default) },
            System.import('./containers/Survey/Survey').then((module: any) => module.default)
          )}
      />
      <Route
        path="widgets"
        getComponent={() =>
          injectReducerAndRender(
            { widgets: System.import('./redux/modules/widgets').then((module: any) => module.default) },
            System.import('./containers/Widgets/Widgets').then((module: any) => module.default)
          )}
      />
      <Route
        path="chat"
        getComponent={() => System.import('./containers/Chat/Chat').then((module: any) => module.default)}
      />

      {/* Catch all route */}
      <Route path="*" component={NotFound} />
    </Route>
  );
};
