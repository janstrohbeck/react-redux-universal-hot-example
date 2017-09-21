import * as NeDB from 'nedb';
import hooks from './hooks';

const feathersNedb = require('feathers-nedb');

export default function messagesService() {
  const app = this;

  const options = {
    Model: new NeDB({
      filename: `${__dirname}/messages.nedb`,
      autoload: true
    }),
    paginate: {
      default: 25,
      max: 100
    }
  };

  app.use('/messages', feathersNedb(options));

  app.service('messages').hooks(hooks);
}
