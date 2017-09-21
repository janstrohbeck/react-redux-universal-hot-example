import * as React from 'react';
import { connect } from 'react-redux';

interface Props {
  notifs: any[];
  NotifComponent: (props: any) => React.ReactElement<any>;
  className: string;
}

const Notifs = ({ notifs, className, NotifComponent }: Props) => (
  <div className={`notif-container ${className}`}>
    {notifs.map(notif => <NotifComponent key={notif.id} message={notif.message} kind={notif.kind} />)}
  </div>
);

export default connect((state: any, props: any) => ({ notifs: state.notifs[props.namespace] || [] }))(Notifs);
