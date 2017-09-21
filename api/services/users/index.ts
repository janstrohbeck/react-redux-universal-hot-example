import * as NeDB from 'nedb';
import hooks from './hooks';

const feathersNedb = require('feathers-nedb');

export default function userService() {
  const app = this;

  const options = {
    Model: new NeDB({
      filename: `${__dirname}/users.nedb`,
      autoload: true
    }),
    paginate: {
      default: 5,
      max: 25
    }
  };

  app.use('/users', feathersNedb(options));

  app.service('users').hooks(hooks);
}
