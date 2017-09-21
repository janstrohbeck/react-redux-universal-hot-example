import { Dispatch } from 'redux';
import { Application } from 'feathers';
import ApiClient from '../../helpers/ApiClient';
import Action from '../action';

export default function clientMiddleware({
  client,
  app,
  restApp
}: {
  client: ApiClient;
  app: Application;
  restApp: Application;
  }) {
  return ({ dispatch, getState }: { dispatch: Dispatch<any>; getState: () => Object }) => (
    next: (action: any) => void
  ) => (action: any) => {
    if (typeof action === 'function') {
      return action(dispatch, getState);
    }

    const { promise, types, ...rest } = action; // eslint-disable-line no-redeclare
    if (!promise) {
      return next(action);
    }

    const [REQUEST, SUCCESS, FAILURE] = types;
    next({ ...rest, type: REQUEST });

    const actionPromise = promise({ client, app, restApp }, dispatch);
    actionPromise
      .then(
        (result: any) => next({ ...rest, result, type: SUCCESS }),
        (error: Error) => next({ ...rest, error, type: FAILURE })
      )
      .catch((error: Error) => {
        console.error('MIDDLEWARE ERROR:', error);
        next({ ...rest, error, type: FAILURE });
      });

    return actionPromise;
  };
}
