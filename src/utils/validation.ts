const isEmpty = (value: any) => value === undefined || value === null || value === '';
const join = (rules: any) => (value: any, data: any, params: any) =>
  rules.map((rule: any) => rule(value, data, params)).filter((error: any) => !!error)[0];

export function email(value: string) {
  // Let's not start a debate on email regex. This is just for an example app!
  if (!isEmpty(value) && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
    return 'Invalid email address';
  }
}

export function required(value: string) {
  if (isEmpty(value)) {
    return 'Required';
  }
}

export function minLength(min: number) {
  return (value?: string) => {
    if (!isEmpty(value) && value.length < min) {
      return `Must be at least ${min} characters`;
    }
  };
}

export function maxLength(max: number) {
  return (value?: string) => {
    if (!isEmpty(value) && value.length > max) {
      return `Must be no more than ${max} characters`;
    }
  };
}

export function integer(value: any) {
  if (!isEmpty(value) && !Number.isInteger(Number(value))) {
    return 'Must be an integer';
  }
}

export function oneOf(enumeration: any[]) {
  return (value: any) => {
    if (!enumeration.find(val => value === val)) {
      return `Must be one of: ${enumeration.join(', ')}`;
    }
  };
}

export function match(field: string) {
  return (value: any, data: any) => {
    if (data) {
      if (value !== data[field]) {
        return 'Do not match';
      }
    }
  };
}

export function createValidator(rules: any, params?: Object) {
  return (data: any = {}) => {
    const errors: any = {};
    Object.keys(rules).forEach(key => {
      const rule = join([].concat(rules[key])); // concat enables both functions and arrays of functions
      const error = rule(data[key], data, { key, ...params });
      if (error) {
        errors[key] = error;
      }
    });
    return errors;
  };
}
