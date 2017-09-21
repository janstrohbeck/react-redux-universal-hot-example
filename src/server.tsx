import * as express from 'express';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';
import * as favicon from 'serve-favicon';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import * as httpProxy from 'http-proxy';
import * as path from 'path';
import * as VError from 'verror';
import * as PrettyError from 'pretty-error';
import * as http from 'http';
import { match, createMemoryHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import { ReduxAsyncConnect, loadOnServer } from 'redux-connect';
import { Provider } from './components';
import config from './config';
import createStore from './redux/create';
import ApiClient from './helpers/ApiClient';
import Html from './helpers/Html';
import getRoutes from './routes';
import { createApp } from './app';

process.on('unhandledRejection', error => console.error(error));

const targetUrl = `http://${config.apiHost}:${config.apiPort}`;
const pretty = new PrettyError();
const app = express();
const server = new http.Server(app);
const proxy = httpProxy.createProxyServer({
  target: targetUrl,
  ws: true
});

app.use(cookieParser());
app.use(compression());
app.use(favicon(path.join(__dirname, '..', 'static', 'favicon.ico')));
app.get('/manifest.json', (req, res) => res.sendFile(path.join(__dirname, '..', 'static', 'manifest.json')));

app.use('/dist/service-worker.js', (req, res, next) => {
  res.setHeader('Service-Worker-Allowed', '/');
  return next();
});

app.use(express.static(path.join(__dirname, '..', 'static')));

app.use((req, res, next) => {
  res.setHeader('X-Forwarded-For', req.ip);
  return next();
});

// Proxy to API server
app.use('/api', (req, res) => {
  proxy.web(req, res, { target: targetUrl });
});

app.use('/ws', (req, res) => {
  proxy.web(req, res, { target: `${targetUrl}/ws` });
});

server.on('upgrade', (req, socket, head) => {
  proxy.ws(req, socket, head);
});

interface WithErrorCode {
  code: string;
}

// added the error handling to avoid https://github.com/nodejitsu/node-http-proxy/issues/527
proxy.on('error', (error, req, res) => {
  if (((error as any) as WithErrorCode).code !== 'ECONNRESET') {
    console.error('proxy error', error);
  }
  if (!res.headersSent) {
    res.writeHead(500, { 'content-type': 'application/json' });
  }

  const json = { error: 'proxy_error', reason: error.message };
  res.end(JSON.stringify(json));
});

app.use((req, res) => {
  if (__DEVELOPMENT__) {
    // Do not cache webpack stats: the script file would change since
    // hot module replacement is enabled in the development env
    webpackIsomorphicTools.refresh();
  }
  const providers = {
    client: new ApiClient(req),
    app: createApp(req),
    restApp: createApp(req)
  };
  const memoryHistory = createMemoryHistory(req.originalUrl as any);
  const store = createStore(memoryHistory, providers);
  const history = syncHistoryWithStore(memoryHistory, store);

  function hydrateOnClient() {
    res.send(
      `<!doctype html>${ReactDOM.renderToString(
        <Html assets={webpackIsomorphicTools.assets() as any} store={store} />
      )}`
    );
  }

  if (__DISABLE_SSR__) {
    return hydrateOnClient();
  }

  match(
    {
      history,
      routes: getRoutes(store),
      location: req.originalUrl
    },
    (error, redirectLocation, renderProps) => {
      if (redirectLocation) {
        res.redirect(redirectLocation.pathname + redirectLocation.search);
      } else if (error) {
        console.error('ROUTER ERROR:', pretty.render(error));
        res.status(500);
        hydrateOnClient();
      } else if (renderProps) {
        const redirect = (to: string) => {
          throw new VError({ name: 'RedirectError', info: { to } }, 'Redirecting');
        };
        loadOnServer({ ...renderProps, store, helpers: { ...providers, redirect } })
          .then(() => {
            const component = (
              <Provider store={store} app={providers.app} restApp={providers.restApp} key="provider">
                <ReduxAsyncConnect {...renderProps} />
              </Provider>
            );
            const html = <Html assets={webpackIsomorphicTools.assets() as any} component={component} store={store} />;

            res.status(200);

            (global as any).navigator = { userAgent: req.headers['user-agent'] };

            res.send(`<!doctype html>${ReactDOM.renderToString(html)}`);
          })
          .catch((mountError: Error) => {
            if (mountError.name === 'RedirectError') {
              return res.redirect(VError.info(mountError).to);
            }
            console.error('MOUNT ERROR:', pretty.render(mountError));
            res.status(500);
            hydrateOnClient();
          });
      } else {
        res.status(404).send('Not found');
      }
    }
  );
});

if (config.port) {
  server.listen(config.port, (err: Error) => {
    if (err) {
      console.error(err);
    }
    console.info('----\n==> ✅  %s is running, talking to API server on %s.', config.app.title, config.apiPort);
    console.info('==> 💻  Open http://%s:%s in a browser to view the app.', config.host, config.port);
  });
} else {
  console.error('==>     ERROR: No PORT environment variable has been specified');
}
