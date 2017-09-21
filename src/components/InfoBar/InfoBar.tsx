import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { load } from '../../redux/modules/info';

interface Props {
  load: () => void;
}
interface OwnProps {
  info?: {
    message?: string;
    time?: number;
  };
}

class InfoBar extends React.Component<Props & OwnProps, any> {
  static defaultProps: OwnProps = {
    info: null
  };

  render() {
    const { info, load } = this.props; // eslint-disable-line no-shadow
    const styles = require('./InfoBar.scss');
    return (
      <div className={`${styles.infoBar} well`}>
        <div className="container">
          This is an info bar <strong>{info ? info.message : 'no info!'}</strong>
          <span className={styles.time}>{info && new Date(info.time).toString()}</span>
          <button className="btn btn-primary" onClick={load}>
            Reload from server
          </button>
        </div>
      </div>
    );
  }
}

export default connect(state => ({ info: state.info.data }), { load })(InfoBar as any);
