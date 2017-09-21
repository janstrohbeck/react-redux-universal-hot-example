import * as errors from 'feathers-errors';
import { createAsyncValidator as validator } from '../utils/validation';

export default function validateHook(schema: any) {
  return (hook: any) =>
    validator(schema, { hook })(hook.data)
      .then(() => hook)
      .catch(errorsValidation => {
        if (Object.keys(errorsValidation).length) {
          throw new errors.BadRequest('Validation failed', errorsValidation);
        }
      });
}
