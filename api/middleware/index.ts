import * as errorHandler from 'feathers-errors/handler';
import { Application } from 'feathers';
import notFound from './notFound';
import logger from './logger';

export default function middleware() {
  const app: Application = this;

  app.use(notFound());
  app.use(logger(app));
  app.use(
    errorHandler({
      json: (error: any, req: any, res: any) => {
        res.json(error);
      },
      html: (error: any, req: any, res: any) => {
        res.json(error);
        // render your error view with the error object
        // res.render('error', error); // set view engine of express if you want to use res.render
      }
    })
  );
}
