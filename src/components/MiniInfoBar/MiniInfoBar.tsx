import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';

interface Props {
  time: number;
}

const MiniInfoBar = ({ time }: Props) => (
  <div className="mini-info-bar">
    The info bar was last loaded at <span>{time && new Date(time).toString()}</span>
  </div>
);

export default connect(state => ({ time: state.info.data.time }))(MiniInfoBar);
