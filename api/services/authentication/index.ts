import * as auth from 'feathers-authentication';
import * as FacebookTokenStrategy from 'passport-facebook-token';
import { Application } from 'feathers';

const jwt = require('feathers-authentication-jwt');
const local = require('feathers-authentication-local');
// import oauth1 from 'feathers-authentication-oauth1';
const oauth2 = require('feathers-authentication-oauth2');
const { discard } = require('feathers-hooks-common');

export { default as socketAuth } from './socketAuth';

function populateUser(authConfig: any) {
  return (hook: any) =>
    hook.app.passport
      .verifyJWT(hook.result.accessToken, authConfig)
      .then((payload: any) => hook.app.service('users').get(payload.userId))
      .then((user: any) => {
        hook.result.user = user;
      });
}

function restToSocketAuth() {
  return (hook: any) => {
    if (hook.params.provider !== 'rest') return hook;
    const { accessToken, user } = hook.result;
    const { socketId } = hook.data;
    if (socketId && hook.app.io && accessToken) {
      const userSocket = Object.keys(hook.app.io.sockets.connected)
        .map(key => hook.app.io.sockets.connected[key])
        .find(socket => socket.client.id === socketId);
      if (userSocket) {
        Object.assign(userSocket.feathers, {
          accessToken,
          user,
          authenticated: true
        });
      }
    }
    return hook;
  };
}

export default function authenticationService() {
  const app: Application = this;

  const config = app.get('config').auth;

  app
    .configure(auth(config))
    .configure(jwt())
    .configure(local()) // .configure(oauth1()) // TODO twitter example
    .configure(
      oauth2({
        name: 'facebook', // if the name differs from your config key you need to pass your config options explicitly
        Strategy: FacebookTokenStrategy
      })
    );

  app.service('authentication').hooks({
    before: {
      // You can chain multiple strategies on create method
      create: auth.hooks.authenticate(['jwt', 'local', 'facebook']),
      remove: auth.hooks.authenticate('jwt')
    },
    after: {
      create: [populateUser(config), discard('user.password'), restToSocketAuth()]
    }
  });
}
