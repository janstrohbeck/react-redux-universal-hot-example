import * as auth from 'feathers-authentication';
import { validateHook } from '../../hooks';
import { required, email, match, unique } from '../../utils/validation';

const local = require('feathers-authentication-local');
const errors = require('feathers-errors');
const { discard, iff, isProvider } = require('feathers-hooks-common');
const { restrictToOwner } = require('feathers-authentication-hooks');

const schemaValidator = {
  email: [required, email, unique('email')],
  password: required,
  password_confirmation: [required, match('password')]
};

function validate() {
  return (hook: any) => {
    if (hook.data.facebook && !hook.data.email) {
      throw new errors.BadRequest('Incomplete oauth registration', hook.data);
    }
    return validateHook(schemaValidator)(hook);
  };
}

const userHooks = {
  before: {
    find: auth.hooks.authenticate('jwt'),
    get: auth.hooks.authenticate('jwt'),
    create: [validate(), discard('password_confirmation'), local.hooks.hashPassword()],
    update: [auth.hooks.authenticate('jwt'), restrictToOwner({ ownerField: '_id' })],
    patch: [auth.hooks.authenticate('jwt'), restrictToOwner({ ownerField: '_id' })],
    remove: [auth.hooks.authenticate('jwt'), restrictToOwner({ ownerField: '_id' })]
  },
  after: {
    all: iff(isProvider('external'), discard('password')),
    find: [] as any[],
    get: [] as any[],
    create: [] as any[],
    update: [] as any[],
    patch: [] as any[],
    remove: [] as any[]
  }
};

export default userHooks;
