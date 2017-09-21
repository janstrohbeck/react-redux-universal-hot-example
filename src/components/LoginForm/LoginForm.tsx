import * as React from 'react';
import { reduxForm, Field, FormProps, WrappedFieldProps } from 'redux-form';
import loginValidation from './loginValidation';

interface InputProps {
  label: string;
  type: string;
}

const Input = ({ input, label, type, meta: { touched, error } }: InputProps & WrappedFieldProps<any>) => (
  <div className={`form-group ${error && touched ? 'has-error' : ''}`}>
    <label htmlFor={input.name} className="col-sm-2">
      {label}
    </label>
    <div className="col-sm-10">
      <input {...input} type={type} className="form-control" />
      {error && touched && <span className="glyphicon glyphicon-remove form-control-feedback" />}
      {error &&
        touched && (
          <div className="text-danger">
            <strong>{error}</strong>
          </div>
        )}
    </div>
  </div>
);

interface Props {
  onSubmit: (data: any) => Promise<any>;
}

const LoginForm = ({ handleSubmit, error }: FormProps<any, any, any> & Props) => (
  <form className="form-horizontal" onSubmit={handleSubmit}>
    <Field name="email" type="text" component={Input} label="Email" />
    <Field name="password" type="password" component={Input} label="Password" />
    {error && (
      <p className="text-danger">
        <strong>{error}</strong>
      </p>
    )}
    <button className="btn btn-success" type="submit">
      <i className="fa fa-sign-in" /> Log In
    </button>
  </form>
);

export default reduxForm({
  form: 'login',
  validate: loginValidation
})(LoginForm);
