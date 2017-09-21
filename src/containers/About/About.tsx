import * as React from 'react';
import Helmet from 'react-helmet';
import { asyncConnect } from 'redux-connect';
import { Store } from 'redux';
import MiniInfoBar from '../../components/MiniInfoBar/MiniInfoBar';
import { isLoaded as isInfoLoaded, load as loadInfo } from '../../redux/modules/info';

class About extends React.Component {
  state = {
    showKitten: false
  };

  handleToggleKitten = () => this.setState({ showKitten: !this.state.showKitten });

  render() {
    const { showKitten } = this.state;
    const kitten = require('./kitten.jpg');
    console.log('render about');
    return (
      <div className="container">
        <h1>About Us</h1>
        <Helmet title="About Us" />

        <p>
          This project was originally created by Erik Rasmussen (<a
            href="https://twitter.com/erikras"
            target="_blank"
            rel="noopener noreferrer"
          >
            @erikras
          </a>), but has since seen many contributions from the open source community. Thank you to{' '}
          <a
            href="https://github.com/erikras/react-redux-universal-hot-example/graphs/contributors"
            target="_blank"
            rel="noopener noreferrer"
          >
            all the contributors
          </a>.
        </p>

        <h3>
          Mini Bar <span style={{ color: '#aaa' }}>(not that kind)</span>
        </h3>

        <p>
          Hey! You found the mini info bar! The following component is display-only. Note that it shows the same time as
          the info bar.
        </p>

        <MiniInfoBar />

        <h3>Images</h3>

        <p>
          Psst! Would you like to see a kitten?
          <button
            className={`btn btn-${showKitten ? 'danger' : 'success'}`}
            style={{ marginLeft: 50 }}
            onClick={this.handleToggleKitten}
          >
            {showKitten ? 'No! Take it away!' : 'Yes! Please!'}
          </button>
        </p>

        {showKitten && (
          <div>
            <img src={kitten} alt="kitchen" />
          </div>
        )}
      </div>
    );
  }
}

export default asyncConnect([
  {
    promise: ({ store: { dispatch, getState } }: { store: Store<any> }) =>
      !isInfoLoaded(getState()) ? dispatch(loadInfo() as any) : Promise.resolve()
  }
])(About);
