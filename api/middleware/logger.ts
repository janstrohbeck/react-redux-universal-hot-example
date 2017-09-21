import * as PrettyError from 'pretty-error';
import { Application } from 'feathers';

const pretty = new PrettyError();

export default function logger(app: Application) {
  // Add a logger to our app object for convenience
  (app as any).logger = pretty;

  return (error: any, req: any, res: any, next: any) => {
    if (error && error.code !== 404) {
      console.error('API ERROR:', pretty.render(error));
    }

    next(error);
  };
}
