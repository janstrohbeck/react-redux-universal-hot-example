import * as React from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { Router } from 'react-router';
import * as PropTypes from 'prop-types';
import LoginForm from '../../components/LoginForm/LoginForm';
import FacebookLogin from '../../components/FacebookLogin/FacebookLogin';
import * as authActions from '../../redux/modules/auth';
import * as notifActions from '../../redux/modules/notifs';

interface Props {
  login: (method: string, data: any, verify?: boolean) => Promise<any>;
  logout: () => void;
  notifSend: (msg: { message: string; kind: string; dismissAfter?: number }) => void;
}

interface OwnProps {
  user?: {
    email: string;
  };
}

class Login extends React.Component<Props & OwnProps, any> {
  static defaultProps: OwnProps = {
    user: null
  };
  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  onFacebookLogin = (err: any, data?: any) => {
    if (err) return;
    this.props
      .login('facebook', data, false)
      .then(this.successLogin)
      .catch(error => {
        if (error.message === 'Incomplete oauth registration') {
          this.context.router.push({
            pathname: '/register',
            state: { oauth: error.data }
          });
        }
      });
  };

  login = (data: any) => this.props.login('local', data).then(this.successLogin);

  successLogin = (data: any) => {
    this.props.notifSend({
      message: "You'r logged !",
      kind: 'success',
      dismissAfter: 2000
    });
    return data;
  };

  FacebookLoginButton = ({ facebookLogin }: { facebookLogin: (err: any, data?: any) => void }) => (
    <button className="btn btn-primary" onClick={facebookLogin}>
      Login with <i className="fa fa-facebook-f" />
    </button>
  );

  render() {
    const { user, logout } = this.props;
    return (
      <div className="container">
        <Helmet title="Login" />
        <h1>Login</h1>
        {!user && (
          <div>
            <LoginForm onSubmit={this.login} />
            <p>This will "log you in" as this user, storing the username in the session of the API server.</p>
            <FacebookLogin
              appId="635147529978862"
              /* autoLoad={true} */
              fields="name,email,picture"
              onLogin={this.onFacebookLogin}
              component={this.FacebookLoginButton as any}
            />
          </div>
        )}
        {user && (
          <div>
            <p>You are currently logged in as {user.email}.</p>

            <div>
              <button className="btn btn-danger" onClick={logout}>
                <i className="fa fa-sign-out" /> Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default connect(state => ({ user: state.auth.user }), { ...notifActions, ...authActions })(Login as any);
