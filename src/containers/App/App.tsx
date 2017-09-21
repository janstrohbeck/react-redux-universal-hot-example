import * as React from 'react';
import { connect } from 'react-redux';
import { IndexLink } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import { Alert, Navbar, Nav, NavItem } from 'react-bootstrap';
import Helmet from 'react-helmet';
import { Store, Dispatch } from 'redux';
import { push } from 'react-router-redux';
import { asyncConnect } from 'redux-connect';
import * as PropTypes from 'prop-types';
import { isLoaded as isInfoLoaded, load as loadInfo } from '../../redux/modules/info';
import { isLoaded as isAuthLoaded, load as loadAuth, logout } from '../../redux/modules/auth';
import { Notifs, InfoBar } from '../../components';
import config from '../../config';

interface Props {
  children: React.ReactElement<any>;
  router: {
    location?: {
      query?: {
        redirect?: string;
      };
    };
  };
  notifs: {
    global: Object[];
  };
  logout: () => void;
  pushState: (path: string) => void;
}
interface OwnProps {
  user: {
    email?: string;
  };
}

class App extends React.Component<Props & OwnProps, any> {
  static defaultProps: OwnProps = {
    user: null
  };
  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  componentWillReceiveProps(nextProps: Props & OwnProps) {
    if (!this.props.user && nextProps.user) {
      // login
      const redirect = this.props.router.location.query && this.props.router.location.query.redirect;
      this.props.pushState(redirect || '/loginSuccess');
    } else if (this.props.user && !nextProps.user) {
      // logout
      this.props.pushState('/');
    }
  }

  handleLogout = (event: React.MouseEvent<NavItem>) => {
    event.preventDefault();
    this.props.logout();
  };

  render() {
    const { user, notifs, children } = this.props;
    const styles = require('./App.scss');

    return (
      <div className={styles.app}>
        <Helmet {...config.app.head} />
        <Navbar fixedTop>
          <Navbar.Header>
            <Navbar.Brand>
              <IndexLink to="/" activeStyle={{ color: '#33e0ff' }}>
                <div className={styles.brand} />
                <span>{config.app.title}</span>
              </IndexLink>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>

          <Navbar.Collapse>
            <Nav navbar>
              {user && (
                <LinkContainer to="/chatFeathers">
                  <NavItem>Chat with Feathers</NavItem>
                </LinkContainer>
              )}

              <LinkContainer to="/chat">
                <NavItem>Chat</NavItem>
              </LinkContainer>
              <LinkContainer to="/widgets">
                <NavItem>Widgets</NavItem>
              </LinkContainer>
              <LinkContainer to="/survey">
                <NavItem>Survey</NavItem>
              </LinkContainer>
              <LinkContainer to="/about">
                <NavItem>About Us</NavItem>
              </LinkContainer>

              {!user && (
                <LinkContainer to="/login">
                  <NavItem>Login</NavItem>
                </LinkContainer>
              )}
              {!user && (
                <LinkContainer to="/register">
                  <NavItem>Register</NavItem>
                </LinkContainer>
              )}
              {user && (
                <LinkContainer to="/logout">
                  <NavItem className="logout-link" onClick={this.handleLogout}>
                    Logout
                  </NavItem>
                </LinkContainer>
              )}
            </Nav>
            {user && (
              <p className="navbar-text">
                Logged in as <strong>{user.email}</strong>.
              </p>
            )}
            <Nav navbar pullRight>
              <NavItem
                target="_blank"
                title="View on Github"
                href="https://github.com/erikras/react-redux-universal-hot-example"
              >
                <i className="fa fa-github" />
              </NavItem>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <div className={styles.appContent}>
          {notifs.global && (
            <div className="container">
              <Notifs
                className={styles.notifs}
                namespace="global"
                NotifComponent={(props: any) => <Alert bsStyle={props.kind}>{props.message}</Alert>}
              />
            </div>
          )}

          {children}
        </div>
        <InfoBar />

        <div className="well text-center">
          Have questions? Ask for help{' '}
          <a
            href="https://github.com/erikras/react-redux-universal-hot-example/issues"
            target="_blank"
            rel="noopener noreferrer"
          >
            on Github
          </a>{' '}
          or in the{' '}
          <a href="https://discord.gg/0ZcbPKXt5bZZb1Ko" target="_blank" rel="noopener noreferrer">
            #react-redux-universal
          </a>{' '}
          Discord channel.
        </div>
      </div>
    );
  }
}

export default asyncConnect([
  {
    promise: ({ store: { dispatch, getState } }: { store: { dispatch: Dispatch<any>; getState: () => any } }) => {
      const promises = [];

      if (!isAuthLoaded(getState())) {
        promises.push(dispatch(loadAuth() as any));
      }
      if (!isInfoLoaded(getState())) {
        promises.push(dispatch(loadInfo() as any));
      }
      return Promise.all(promises);
    }
  }
])(
  connect(
    state => ({
      notifs: state.notifs,
      user: state.auth.user
    }),
    { logout, pushState: push }
  )(App as any)
);
