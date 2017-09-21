import * as validation from '../../src/utils/validation';

export * from '../../src/utils/validation';
const isPromise = require('is-promise');

export function createAsyncValidator(rules: any, params: any) {
  return (data = {}) => {
    const errors = validation.createValidator(rules, params)(data);

    const promises = Object.keys(errors).map(name => {
      const error = errors[name];
      const myResolve = () => ({ status: 'resolved', name });
      const myReject = (err?: any) => ({ status: 'rejected', name, error: err });

      if (isPromise(error)) {
        return (error as Promise<any>).then(myResolve).catch(myReject);
      }

      return error ? myReject() : myResolve();
    });

    return Promise.all(promises).then(results => {
      const finalErrors = results
        .filter(x => x.status === 'rejected')
        .reduce((prev, next) => ({ ...prev, [next.name]: (next as any).error }), {});

      return Object.keys(finalErrors).length ? Promise.reject(finalErrors) : Promise.resolve(data);
    });
  };
}

export function unique(field: any) {
  return (value: any, data: any, { hook }: any) =>
    hook.service.find({ query: { [field]: value } }).then((result: any) => {
      if (result.total !== 0) {
        return Promise.reject('Already exist');
      }
    });
}
