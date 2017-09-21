import * as React from 'react';
import * as PropTypes from 'prop-types';
import { asyncConnect } from 'redux-connect';
import { connect } from 'react-redux';
import { Store } from 'redux';
import { Application } from 'feathers';
import { withApp } from '../../app';
/* eslint-disable import/no-duplicates */
import * as chatActions from '../../redux/modules/chat';
import { Message } from '../../redux/modules/chat';
/* eslint-enable */

interface Props {
  app: Application;
  user: {
    email?: string;
  };
  addMessage: (data: Message) => void;
  messages: Message[];
}

interface State {
  message: string;
  error?: boolean;
}

class ChatFeathers extends React.Component<Props, State> {
  state: State = {
    message: '',
    error: null
  };

  componentDidMount() {
    this.props.app.service('messages').on('created', this.props.addMessage);
  }

  componentWillUnmount() {
    this.props.app.service('messages').removeListener('created', this.props.addMessage);
  }

  handleSubmit = (event: React.FormEvent<any> | React.MouseEvent<any>) => {
    event.preventDefault();
    this.props.app
      .service('messages')
      .create({ text: this.state.message })
      .then(() => this.setState({ message: '', error: false }))
      .catch(error => {
        console.log(error);
        this.setState({ error: error.message || false });
      });
  };

  render() {
    const { user, messages } = this.props;
    const { error } = this.state;

    return (
      <div className="container">
        <h1>Chat</h1>

        {user && (
          <div>
            <ul>
              {messages.map(msg => (
                <li key={`chat.msg.${msg._id}`}>
                  {msg.sentBy.email}: {msg.text}
                </li>
              ))}
            </ul>
            <form onSubmit={this.handleSubmit}>
              <input
                type="text"
                placeholder="Enter your message"
                value={this.state.message}
                onChange={event => this.setState({ message: event.target.value })}
              />
              <button className="btn" onClick={this.handleSubmit}>
                Send
              </button>
              {error && <div className="text-danger">{error}</div>}
            </form>
          </div>
        )}
      </div>
    );
  }
}

export default asyncConnect([
  {
    promise: ({ store: { dispatch, getState } }: { store: Store<any> }) => {
      const state = getState();

      if (state.online) {
        return dispatch(chatActions.load() as any);
      }
    }
  }
])(
  connect(
    state => ({
      user: state.auth.user,
      messages: state.chat.messages
    }),
    { ...chatActions }
  )(withApp(ChatFeathers as any) as any)
);
