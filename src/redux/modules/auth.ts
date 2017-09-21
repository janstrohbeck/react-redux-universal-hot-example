import { SubmissionError } from 'redux-form';
import * as cookie from 'js-cookie';
import { Application } from 'feathers';
import { socket } from '../../app';
import ApiClient from '../../helpers/ApiClient';
import Action from '../action';

const LOAD = 'redux-example/auth/LOAD';
const LOAD_SUCCESS = 'redux-example/auth/LOAD_SUCCESS';
const LOAD_FAIL = 'redux-example/auth/LOAD_FAIL';
const LOGIN = 'redux-example/auth/LOGIN';
const LOGIN_SUCCESS = 'redux-example/auth/LOGIN_SUCCESS';
const LOGIN_FAIL = 'redux-example/auth/LOGIN_FAIL';
const REGISTER = 'redux-example/auth/REGISTER';
const REGISTER_SUCCESS = 'redux-example/auth/REGISTER_SUCCESS';
const REGISTER_FAIL = 'redux-example/auth/REGISTER_FAIL';
const LOGOUT = 'redux-example/auth/LOGOUT';
const LOGOUT_SUCCESS = 'redux-example/auth/LOGOUT_SUCCESS';
const LOGOUT_FAIL = 'redux-example/auth/LOGOUT_FAIL';

interface State {
  loading?: boolean;
  loaded: boolean;
  accessToken?: string;
  user?: string;
  error?: string;
  loggingIn?: boolean;
  loginError?: string;
  registeringIn?: boolean;
  registerError?: string;
  loggingOut?: boolean;
  logoutError?: string;
}

const initialState: State = {
  loaded: false
};

export default function reducer(state: State = initialState, action: Action): State {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        accessToken: action.result.accessToken,
        user: action.result.user
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.error
      };
    case LOGIN:
      return {
        ...state,
        loggingIn: true
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        loggingIn: false,
        accessToken: action.result.accessToken,
        user: action.result.user
      };
    case LOGIN_FAIL:
      return {
        ...state,
        loggingIn: false,
        loginError: action.error
      };
    case REGISTER:
      return {
        ...state,
        registeringIn: true
      };
    case REGISTER_SUCCESS:
      return {
        ...state,
        registeringIn: false
      };
    case REGISTER_FAIL:
      return {
        ...state,
        registeringIn: false,
        registerError: action.error
      };
    case LOGOUT:
      return {
        ...state,
        loggingOut: true
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        loggingOut: false,
        accessToken: null,
        user: null
      };
    case LOGOUT_FAIL:
      return {
        ...state,
        loggingOut: false,
        logoutError: action.error
      };
    default:
      return state;
  }
}

const catchValidation = (error: Error & { data: any }) => {
  if (error.message) {
    if (error.message === 'Validation failed' && error.data) {
      throw new SubmissionError(error.data);
    }
    throw new SubmissionError({ _error: error.message });
  }
  return Promise.reject(error);
};

function setToken({ client, app, restApp }: { client: ApiClient; app: Application; restApp: Application }) {
  return (response: any) => {
    const { accessToken } = response;

    app.set('accessToken', accessToken);
    restApp.set('accessToken', accessToken);
    client.setJwtToken(accessToken);

    return response;
  };
}

function setCookie({ app }: { app: Application }) {
  return (response: any) =>
    app.passport.verifyJWT(response.accessToken).then(payload => {
      const options = (payload as any).exp ? { expires: new Date((payload as any).exp * 1000) } : undefined;
      cookie.set('feathers-jwt', app.get('accessToken'), options);
      return response;
    });
}

function setUser({ app, restApp }: { app: Application; restApp: Application }) {
  return (response: any) => {
    app.set('user', response.user);
    restApp.set('user', response.user);
    return response;
  };
}

/*
* Actions
* * * * */

export function isLoaded(globalState: any) {
  return globalState.auth && globalState.auth.loaded;
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: ({ app, restApp, client }: { app: Application; restApp: Application; client: ApiClient }) =>
      restApp
        .authenticate(undefined)
        .then(setToken({ client, app, restApp }))
        .then(setCookie({ app }))
        .then(setUser({ app, restApp }))
  };
}

export function register(data: any) {
  return {
    types: [REGISTER, REGISTER_SUCCESS, REGISTER_FAIL],
    promise: ({ app }: { app: Application }) =>
      app
        .service('users')
        .create(data)
        .catch(catchValidation)
  };
}

export function login(strategy: string, data: any, validation = true) {
  const socketId = (socket.io as any).engine.id;
  return {
    types: [LOGIN, LOGIN_SUCCESS, LOGIN_FAIL],
    promise: ({ client, restApp, app }: { client: ApiClient; restApp: Application; app: Application }) =>
      restApp
        .authenticate({
          ...data,
          strategy,
          socketId
        })
        .then(setToken({ client, app, restApp }))
        .then(setCookie({ app }))
        .then(setUser({ app, restApp }))
        .catch(validation ? catchValidation : error => Promise.reject(error))
  };
}

export function logout() {
  return {
    types: [LOGOUT, LOGOUT_SUCCESS, LOGOUT_FAIL],
    promise: ({ client, app, restApp }: { client: ApiClient; restApp: Application; app: Application }) =>
      app.logout().then(() => setToken({ client, app, restApp })({ accessToken: null }))
  };
}
