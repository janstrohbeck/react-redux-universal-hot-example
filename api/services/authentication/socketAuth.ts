import { Application } from 'feathers';

export default function socketAuth(app: Application) {
  return (socket: any, next: any) => {
    const { cookie } = socket.request.headers;
    const cookies =
      cookie &&
      cookie.split('; ').reduce((prev: any, nextCookie: any) => {
        const [name, value] = nextCookie.split('=');
        return {
          ...prev,
          [name]: value
        };
      }, {});

    const accessToken = cookies && cookies['feathers-jwt'];

    socket._feathers = {}; // TODO remove this when possible...

    if (!accessToken) return next();

    (app as any).passport
      .verifyJWT(accessToken, app.get('auth'))
      .then((payload: any) => app.service('users').get(payload.userId))
      .then((user: any) => {
        Object.assign(socket.feathers, {
          accessToken,
          user,
          authenticated: true
        });
        next();
      })
      .catch(() => next());
  };
}
