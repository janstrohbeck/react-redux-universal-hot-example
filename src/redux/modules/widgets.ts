import ApiClient from '../../helpers/ApiClient';
import Action from '../action';

const LOAD = 'redux-example/widgets/LOAD';
const LOAD_SUCCESS = 'redux-example/widgets/LOAD_SUCCESS';
const LOAD_FAIL = 'redux-example/widgets/LOAD_FAIL';
const EDIT_START = 'redux-example/widgets/EDIT_START';
const EDIT_STOP = 'redux-example/widgets/EDIT_STOP';
const SAVE = 'redux-example/widgets/SAVE';
const SAVE_SUCCESS = 'redux-example/widgets/SAVE_SUCCESS';
const SAVE_FAIL = 'redux-example/widgets/SAVE_FAIL';

export interface Widget {
  id: number;
  color: string;
  sprocketCount: number;
  owner: number;
}

interface State {
  loaded: boolean;
  editing?: {
    [key: string]: boolean;
  };
  saveError?: Object;
  loading?: boolean;
  data?: Widget[];
  error?: string;
}

const initialState: State = {
  loaded: false,
  editing: {},
  saveError: {}
};

export default function reducer(state: State = initialState, action: Action & { id: number }): State {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        data: action.result,
        error: null
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        data: null,
        error: typeof action.error === 'string' ? action.error : 'Error'
      };
    case EDIT_START:
      return {
        ...state,
        editing: {
          ...state.editing,
          [action.id]: true
        }
      };
    case EDIT_STOP:
      return {
        ...state,
        editing: {
          ...state.editing,
          [action.id]: false
        }
      };
    case SAVE:
      return state; // 'saving' flag handled by redux-form
    case SAVE_SUCCESS: {
      const data = [...state.data];
      data[action.result.id - 1] = action.result;
      return {
        ...state,
        data,
        editing: {
          ...state.editing,
          [action.id]: false
        },
        saveError: {
          ...state.saveError,
          [action.id]: null
        }
      };
    }
    case SAVE_FAIL:
      return typeof action.error === 'string'
        ? {
          ...state,
          saveError: {
            ...state.saveError,
            [action.id]: action.error
          }
        }
        : state;
    default:
      return state;
  }
}

export function isLoaded(globalState: any) {
  return globalState.widgets && globalState.widgets.loaded;
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    // params not used, just shown as demonstration
    promise: ({ client }: { client: ApiClient }) => client.get('/widget/load/param1/param2')
  };
}

export function save(widget: Widget) {
  return {
    types: [SAVE, SAVE_SUCCESS, SAVE_FAIL],
    id: widget.id,
    promise: ({ client }: { client: ApiClient }) =>
      client.post('/widget/update', {
        data: widget
      })
  };
}

export function editStart(id: number) {
  return { type: EDIT_START, id };
}

export function editStop(id: number) {
  return { type: EDIT_STOP, id };
}
