import * as auth from 'feathers-authentication';
import { required } from '../../utils/validation';
import { validateHook as validate } from '../../hooks';

const { disallow, discard, populate } = require('feathers-hooks-common');
const { restrictToOwner } = require('feathers-authentication-hooks');

const schemaValidator = {
  text: required
};

function populateUser() {
  return populate({
    schema: {
      include: [
        {
          nameAs: 'sentBy',
          service: 'users',
          parentField: 'sentBy',
          childField: '_id'
        }
      ]
    }
  });
}

const messagesHooks = {
  before: {
    all: auth.hooks.authenticate('jwt'),
    find: [] as any[],
    get: [] as any[],
    create: [
      validate(schemaValidator),
      (hook: any) => {
        hook.data = {
          text: hook.data.text,
          sentBy: hook.params.user._id, // Set the id of current user
          createdAt: new Date()
        };
      }
    ],
    update: disallow(),
    patch: disallow(),
    remove: disallow()
  },
  after: {
    all: [] as any[],
    find: [populateUser(), discard('sentBy.password')],
    get: [populateUser(), discard('sentBy.password')],
    create: [populateUser(), discard('sentBy.password')],
    update: [] as any[],
    patch: [] as any[],
    remove: [] as any[]
  }
};

export default messagesHooks;
