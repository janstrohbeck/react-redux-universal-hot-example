import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Store } from 'redux';
import { Application } from 'feathers';

let didWarnAboutReceivingStore = false;

function warning(message: string) {
  /* eslint-disable no-console */
  if (typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error(message);
  }
  /* eslint-enable no-console */
  try {
    // This error was thrown as a convenience so that if you enable
    // "break on all exceptions" in your console,
    // it would pause the execution at this line.
    throw new Error(message);
    /* eslint-disable no-empty */
  } catch (e) {}
  /* eslint-enable no-empty */
}

function warnAboutReceivingStore() {
  if (didWarnAboutReceivingStore) {
    return;
  }
  didWarnAboutReceivingStore = true;

  warning(
    '<Provider> does not support changing `store` on the fly. ' +
      'It is most likely that you see this error because you updated to ' +
      'Redux 2.x and React Redux 2.x which no longer hot reload reducers ' +
      'automatically. See https://github.com/reactjs/react-redux/releases/' +
      'tag/v2.0.0 for the migration instructions.'
  );
}

interface Props {
  app?: Application;
  restApp?: Application;
  store: Store<any>;
  children: React.ReactElement<any>;
}

interface ChildProps {
  app?: Application;
  restApp?: Application;
  store: Store<any>;
  storeSubscription: {
    trySubscribe: () => any;
    tryUnsubscribe: () => any;
    notifyNestedSubs: () => any;
    isSubscribed: () => boolean;
  };
}

export default class Provider extends React.Component<Props, any> {
  static childContextTypes = {
    app: PropTypes.shape({
      service: PropTypes.func
    }).isRequired,
    restApp: PropTypes.object.isRequired,
    store: PropTypes.shape({
      subscribe: PropTypes.func.isRequired,
      dispatch: PropTypes.func.isRequired,
      getState: PropTypes.func.isRequired
    }).isRequired,
    storeSubscription: PropTypes.shape({
      trySubscribe: PropTypes.func.isRequired,
      tryUnsubscribe: PropTypes.func.isRequired,
      notifyNestedSubs: PropTypes.func.isRequired,
      isSubscribed: PropTypes.func.isRequired
    })
  };

  constructor(props: Props, context: any) {
    super(props, context);
    this.store = props.store;
    this.app = props.app;
    this.restApp = props.restApp;
  }

  getChildContext(): ChildProps {
    return {
      store: this.store,
      storeSubscription: null,
      app: this.app,
      restApp: this.restApp
    };
  }

  componentWillReceiveProps(nextProps: Props) {
    if (process.env.NODE_ENV !== 'production') {
      const { store } = this;
      const { store: nextStore } = nextProps;

      if (store !== nextStore) {
        warnAboutReceivingStore();
      }
    }
  }

  app: Application;
  restApp: Application;
  store: Store<any>;

  render() {
    return React.Children.only(this.props.children);
  }
}
