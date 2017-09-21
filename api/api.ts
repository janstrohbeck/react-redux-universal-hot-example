import * as feathers from 'feathers';
import * as morgan from 'morgan';
import * as session from 'express-session';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as hooks from 'feathers-hooks';
import * as rest from 'feathers-rest';
import * as socketio from 'feathers-socketio';
import * as PrettyError from 'pretty-error';
import config from './config';
import middleware from './middleware';
import services from './services';
import * as actions from './actions';
import mapUrl from './utils/url';
import auth, { socketAuth } from './services/authentication';

const isPromise = require('is-promise');

process.on('unhandledRejection', error => console.error(error));

const pretty = new PrettyError();
const app = feathers();

app
  .set('config', config)
  .use(morgan('dev'))
  .use(cookieParser())
  .use(
    session({
      secret: 'react and redux rule!!!!',
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 60000 }
    })
  )
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json());

const actionsHandler = (req: any, res: any, next: any) => {
  const splittedUrlPath = req.url
    .split('?')[0]
    .split('/')
    .slice(1);
  const { action, params } = mapUrl(actions, splittedUrlPath);

  req.app = app;

  const catchError = (error: any) => {
    console.error('API ERROR:', pretty.render(error));
    res.status(error.status || 500).json(error);
  };

  if (action) {
    try {
      const handle = action(req, params);
      ((isPromise(handle) ? handle : Promise.resolve(handle)) as Promise<any>)
        .then(result => {
          if (result instanceof Function) {
            result(res);
          } else {
            res.json(result);
          }
        })
        .catch(reason => {
          if (reason && reason.redirect) {
            res.redirect(reason.redirect);
          } else {
            catchError(reason);
          }
        });
    } catch (error) {
      catchError(error);
    }
  } else {
    next();
  }
};

const bufferSize = 100;
const messageBuffer = new Array(bufferSize);
let messageIndex = 0;

app
  .configure(hooks())
  .configure(rest())
  .configure(
    socketio({ path: '/ws' }, io => {
      io.use(socketAuth(app));

      io.on('connection', (socket: any) => {
        const user = socket.feathers.user ? { ...socket.feathers.user, password: undefined } : undefined;
        socket.emit('news', { msg: "'Hello World!' from server", user });

        socket.on('history', () => {
          for (let index = 0; index < bufferSize; index += 1) {
            const msgNo = (messageIndex + index) % bufferSize;
            const msg = messageBuffer[msgNo];
            if (msg) {
              socket.emit('msg', msg);
            }
          }
        });

        socket.on('msg', (data: any) => {
          const message = { ...data, id: messageIndex };
          messageBuffer[messageIndex % bufferSize] = message;
          messageIndex += 1;
          io.emit('msg', message);
        });
      });
    })
  )
  .configure(auth)
  .use(actionsHandler)
  .configure(services)
  .configure(middleware);

if (process.env.APIPORT) {
  app.listen(process.env.APIPORT, (err: any) => {
    if (err) {
      console.error(err);
    }
    console.info('----\n==> 🌎  API is running on port %s', process.env.APIPORT);
    console.info('==> 💻  Send requests to http://localhost:%s', process.env.APIPORT);
  });
} else {
  console.error('==>     ERROR: No APIPORT environment variable has been specified');
}
