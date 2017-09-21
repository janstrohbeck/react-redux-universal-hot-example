import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as authActions from '../../redux/modules/auth';

interface Props {
  user: {
    email?: string;
  };
  logout: () => void;
}

class LoginSuccess extends React.Component<Props, any> {
  render() {
    const { user, logout } = this.props;
    return (
      user && (
        <div className="container">
          <h1>Login Success</h1>

          <div>
            <p>
              Hi, {user.email}. You have just successfully logged in, and were forwarded here by{' '}
              <code>componentWillReceiveProps()</code> in <code>App.js</code>, which is listening to the auth reducer
              via redux <code>@connect</code>. How exciting!
            </p>

            <p>
              The same function will forward you to <code>/</code> should you chose to log out. The choice is yours...
            </p>

            <div>
              <button className="btn btn-danger" onClick={logout}>
                <i className="fa fa-sign-out" /> Log Out
              </button>
            </div>
          </div>
        </div>
      )
    );
  }
}

export default connect(state => ({ user: state.auth.user }), authActions)(LoginSuccess as any);
