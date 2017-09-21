import * as React from 'react';
import * as PropTypes from 'prop-types';
import { reduxForm, Field, FormProps, WrappedFieldProps } from 'redux-form';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { isValidEmail } from '../../redux/modules/survey';
import surveyValidation from './surveyValidation';

function asyncValidate(data: any, dispatch: Dispatch<any>) {
  if (!data.email) return Promise.resolve();
  return dispatch(isValidEmail(data) as any);
}

interface InputProps {
  label: string;
  type: string;
  showAsyncValidating: boolean;
  className: string;
  styles: any;
}

/* eslint-disable react/prop-types */
const Input = ({
  input,
  label,
  type,
  showAsyncValidating,
  className,
  styles,
  meta: { touched, error, dirty, active, visited, asyncValidating }
}: InputProps & WrappedFieldProps<any>) => (
  <div className={`form-group ${error && touched ? 'has-error' : ''}`}>
    <label htmlFor={input.name} className="col-sm-2">
      {label}
    </label>
    <div className={`col-sm-8 ${styles.inputGroup}`}>
      {showAsyncValidating && asyncValidating && <i className={`fa fa-cog fa-spin ${styles.cog}`} />}
      <input {...input} type={type} className={className} id={input.name} />
      {error && touched && <div className="text-danger">{error}</div>}
      <div className={styles.flags}>
        {dirty && (
          <span className={styles.dirty} title="Dirty">
            D
          </span>
        )}
        {active && (
          <span className={styles.active} title="Active">
            A
          </span>
        )}
        {visited && (
          <span className={styles.visited} title="Visited">
            V
          </span>
        )}
        {touched && (
          <span className={styles.touched} title="Touched">
            T
          </span>
        )}
      </div>
    </div>
  </div>
);
/* eslint-enable react/prop-types */

interface Props {
  onSubmit: (data: any) => void;
}

interface DefaultProps {
  active: boolean;
}

class SurveyForm extends React.Component<FormProps<any, any, any> & Props & DefaultProps, any> {
  static defaultProps: DefaultProps = {
    active: null
  };

  render() {
    const { asyncValidating, dirty, active, handleSubmit, invalid, reset, pristine, valid } = this.props;
    const styles = require('./SurveyForm.scss');

    return (
      <div>
        <form className="form-horizontal" onSubmit={handleSubmit}>
          <Field name="name" type="text" component={Input} label="Full Name" className="form-control" styles={styles} />

          <Field
            name="email"
            type="text"
            component={Input}
            label="Email"
            className="form-control"
            styles={styles}
            asyncValidating={asyncValidating}
          />

          <Field
            name="occupation"
            type="text"
            component={Input}
            label="Occupation"
            className="form-control"
            styles={styles}
          />

          <Field
            name="currentlyEmployed"
            type="checkbox"
            component={Input}
            label="Currently Employed?"
            styles={styles}
          />

          <div className="form-group">
            <label className="col-sm-2" htmlFor="sex">
              Sex
            </label>
            <div className="col-sm-8">
              <label htmlFor="sex-male" className={styles.radioLabel}>
                <Field name="sex" component="input" type="radio" id="sex-male" value="male" /> Male
              </label>
              <label htmlFor="sex-female" className={styles.radioLabel}>
                <Field name="sex" component="input" type="radio" id="sex-female" value="female" /> Female
              </label>
            </div>
          </div>

          <div className="form-group">
            <div className="col-sm-offset-2 col-sm-10">
              <button className="btn btn-success" onClick={handleSubmit}>
                <i className="fa fa-paper-plane" /> Submit
              </button>
              <button className="btn btn-warning" type="button" onClick={reset} style={{ marginLeft: 15 }}>
                <i className="fa fa-undo" /> Reset
              </button>
            </div>
          </div>
        </form>

        <h4>Props from redux-form</h4>

        <table className="table table-striped">
          <tbody>
            <tr>
              <th>Active Field</th>
              <td>{active}</td>
            </tr>
            <tr>
              <th>Dirty</th>
              <td className={dirty ? 'success' : 'danger'}>{dirty ? 'true' : 'false'}</td>
            </tr>
            <tr>
              <th>Pristine</th>
              <td className={pristine ? 'success' : 'danger'}>{pristine ? 'true' : 'false'}</td>
            </tr>
            <tr>
              <th>Valid</th>
              <td className={valid ? 'success' : 'danger'}>{valid ? 'true' : 'false'}</td>
            </tr>
            <tr>
              <th>Invalid</th>
              <td className={invalid ? 'success' : 'danger'}>{invalid ? 'true' : 'false'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default reduxForm({
  form: 'survey',
  validate: surveyValidation,
  asyncValidate,
  asyncBlurFields: ['email']
})(
  connect(state => ({
    active: state.form.survey.active
  }))(SurveyForm)
);