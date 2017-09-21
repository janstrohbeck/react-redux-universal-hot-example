import * as superagent from 'superagent';
import { Request } from 'express';
import config from '../config';

function formatUrl(path: string) {
  const adjustedPath = path[0] !== '/' ? `/${path}` : path;
  if (__SERVER__) {
    // Prepend host and port of the API server to the path.
    return `http://${config.apiHost}:${config.apiPort + adjustedPath}`;
  }
  // Prepend `/api` to relative URL, to proxy to API server.
  return `/api${adjustedPath}`;
}

interface Field {
  key: string;
  value: string;
}

interface Params {
  params?: Object;
  data?: Object;
  headers?: Object;
  files?: Field[];
  fields?: Field[];
}

export default class ApiClient {
  token?: string;
  get: (path: string, params?: Params) => void;
  post: (path: string, params?: Params) => void;
  put: (path: string, params?: Params) => void;
  patch: (path: string, params?: Params) => void;
  del: (path: string, params?: Params) => void;

  constructor(req?: Request) {
    const generator = (requester: (url: string) => superagent.SuperAgentRequest) => (
      path: string,
      params: Params = {}
    ) =>
      new Promise((resolve, reject) => {
        const request = requester(formatUrl(path));

        if (params) {
          request.query(params);
        }

        if (__SERVER__ && req.get('cookie')) {
          request.set('cookie', req.get('cookie'));
        }

        if (params.headers) {
          request.set(params.headers);
        }

        if (this.token) {
          request.set('Authorization', `Bearer ${this.token}`);
        }

        if (params.files) {
          params.files.forEach(file => request.attach(file.key, file.value));
        }

        if (params.fields) {
          params.fields.forEach(item => request.field(item.key, item.value));
        }

        if (params.data) {
          request.send(params.data);
        }

        request.end((err, response) => (err ? reject((response && response.body) || err) : resolve(response.body)));
      });

    this.get = generator(superagent.get);
    this.post = generator(superagent.post);
    this.put = generator(superagent.put);
    this.patch = generator(superagent.patch);
    this.del = generator(superagent.del);
  }

  setJwtToken(token: string) {
    this.token = token;
  }
}
