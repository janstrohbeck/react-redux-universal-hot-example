import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'multireducer';
import { Dispatch } from 'redux';
import { increment } from '../../redux/modules/counter';

interface Props {
  count: number;
  increment: () => void;
  className: string;
}

const mapStateToProps = (state: any, { multireducerKey: key }: { multireducerKey: string }) => ({
  count: state.counter[key].count
});
const mapDispatchToProps = (dispatch: Dispatch<any>, { multireducerKey: key }: { multireducerKey: string }) =>
  bindActionCreators({ increment }, dispatch, key);

class CounterButton extends React.Component<Props, any> {
  defaultProps = {
    className: ''
  };

  render() {
    const { count, increment } = this.props; // eslint-disable-line no-shadow
    let { className } = this.props;
    className += ' btn btn-default';
    return (
      <button className={className} onClick={increment}>
        You have clicked me {count} time{count === 1 ? '' : 's'}.
      </button>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CounterButton);
