import * as React from 'react';
import * as feathers from 'feathers/client';
import * as hooks from 'feathers-hooks';
import * as rest from 'feathers-rest/client';
import * as socketio from 'feathers-socketio/client';
import * as authentication from 'feathers-authentication-client';
import * as io from 'socket.io-client';
import * as superagent from 'superagent';
import * as PropTypes from 'prop-types';
import { Request } from 'express';
import config from './config';

const storage = __SERVER__ ? null : require('localforage');

const host = (clientUrl: string) => (__SERVER__ ? `http://${config.apiHost}:${config.apiPort}` : clientUrl);

const configureApp = (transport: any) =>
  feathers()
    .configure(transport)
    .configure(hooks())
    .configure(authentication({ storage }));

export const socket = io('', { path: host('/ws'), autoConnect: false });

export function createApp(req?: Request | string) {
  if (req === 'rest') {
    return configureApp(rest(host('/api')).superagent(superagent));
  }

  if (__SERVER__ && req) {
    const r = req as Request;
    const app = configureApp(
      rest(host('/api')).superagent(superagent, {
        headers: {
          Cookie: r.get('cookie'),
          authorization: r.header('authorization') || ''
        }
      })
    );

    const accessToken = r.header('authorization') || (r.cookies && r.cookies['feathers-jwt']);
    app.set('accessToken', accessToken);

    return app;
  }

  return configureApp(socketio(socket));
}

interface Props {
  app: Object;
  restApp: Object;
}

export function withApp(WrappedComponent: new () => React.Component<Props, any>) {
  // eslint-disable-next-line react/prefer-stateless-function
  class WithAppComponent extends React.Component<Props, any> {
    static contextTypes = {
      app: PropTypes.object.isRequired,
      restApp: PropTypes.object.isRequired
    };

    render() {
      const { app, restApp } = this.context;
      return <WrappedComponent {...this.props} app={app} restApp={restApp} />;
    }
  }

  return WithAppComponent;
}
