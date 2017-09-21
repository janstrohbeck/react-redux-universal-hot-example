import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import RegisterForm from '../../components/RegisterForm/RegisterForm';
import * as authActions from '../../redux/modules/auth';
/* eslint-disable import/no-duplicates */
import * as notifActions from '../../redux/modules/notifs';
import { Notif } from '../../redux/modules/notifs';
/* eslint-enable */

interface Props {
  location: {
    state?: any;
  };
  register: (data: any) => Promise<any>;
  notifSend: (notif: Notif) => void;
}

class Register extends React.Component<Props, any> {
  getInitialValues = () => {
    const { location } = this.props;
    return location.state && location.state.oauth;
  };

  register = (data: any) => this.props.register(data).then(this.successRegister);

  successRegister = (result: any) => {
    this.props.notifSend({
      message: "You're now registered!",
      kind: 'success',
      dismissAfter: 2000
    });
    return result;
  };

  render() {
    return (
      <div className="container">
        <Helmet title="Register" />
        <h1>Register</h1>
        <RegisterForm onSubmit={this.register} initialValues={this.getInitialValues()} />
      </div>
    );
  }
}

export default connect(() => ({}), { ...notifActions, ...authActions })(Register as any);
