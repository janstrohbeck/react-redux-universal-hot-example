const errors = require('feathers-errors');

export default function notFoundHandler() {
  return (req: any, res: any, next: any) => {
    next(new errors.NotFound('Page not found'));
  };
}
