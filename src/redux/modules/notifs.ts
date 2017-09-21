import { Dispatch } from 'redux';
import Action from '../action';

const NOTIF_SEND = 'redux-example/notifs/NOTIF_SEND';
const NOTIF_DISMISS = 'redux-example/notifs/NOTIF_DISMISS';
const NOTIF_CLEAR = 'redux-example/notifs/NOTIF_CLEAR';
const NOTIF_CLEAR_ALL = 'redux-example/notifs/NOTIF_CLEAR_ALL';

export interface Notif {
  id?: number;
  message: string;
  kind?: string;
  dismissAfter?: number;
}

interface State {
  [key: string]: Notif[];
}

const initialState: State = {};

export default function reducer(state: State = initialState, action: Action & { namespace?: string }): State {
  switch (action.type) {
    case NOTIF_SEND:
      return { ...state, [action.namespace]: [action.payload, ...(state[action.namespace] || [])] };
    case NOTIF_DISMISS:
      return {
        ...state,
        [action.namespace]: (state[action.namespace] || []).filter(notif => notif.id !== action.payload)
      };
    case NOTIF_CLEAR:
      return { ...state, [action.namespace]: [] };
    case NOTIF_CLEAR_ALL:
      return {};
    default:
      return state;
  }
}

export function notifSend(notif: Notif, namespace = 'global') {
  if (!notif.id) {
    notif.id = new Date().getTime() * Math.random();
  }
  return (dispatch: Dispatch<any>) => {
    dispatch({ type: NOTIF_SEND, namespace, payload: notif });

    if (notif.dismissAfter) {
      setTimeout(() => dispatch({ type: NOTIF_DISMISS, namespace, payload: notif.id }), notif.dismissAfter);
    }
  };
}

export function notifDismiss(id: number, namespace = 'global') {
  return { type: NOTIF_DISMISS, namespace, payload: id };
}

export function notifClear(namespace = 'global') {
  return { type: NOTIF_CLEAR, namespace };
}

export function notifClearAll() {
  return { type: NOTIF_CLEAR_ALL };
}
