import * as React from 'react';
import * as PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-connect';
import { Store } from 'redux';
import WidgetForm from '../../components/WidgetForm/WidgetForm';
/* eslint-disable import/no-duplicates */
import * as widgetActions from '../../redux/modules/widgets';
import { Widget } from '../../redux/modules/widgets';
/* eslint-enable */

const { isLoaded, load: loadWidgets } = widgetActions;
interface EditMap {
  [key: string]: boolean;
}

interface Props {
  editing: EditMap;
  load: () => void;
  editStart: (id: string) => void;
}
interface DefaultProps {
  widgets: Widget[];
  error?: string;
  loading: boolean;
}

class Widgets extends React.Component<Props & DefaultProps, any> {
  static defaultProps: DefaultProps = {
    widgets: null,
    error: null,
    loading: false
  };

  render() {
    const handleEdit = (widget: Widget) => {
      const { editStart } = this.props;
      return () => editStart(String(widget.id));
    };
    const { widgets, error, editing, loading, load } = this.props;
    const styles = require('./Widgets.scss');
    return (
      <div className={`${styles.widgets} container`}>
        <h1>
          Widgets
          <button className={`${styles.refreshBtn} btn btn-success`} onClick={load}>
            <i className={`fa fa-refresh ${loading ? ' fa-spin' : ''}`} /> Reload Widgets
          </button>
        </h1>
        <Helmet title="Widgets" />
        <p>
          If you hit refresh on your browser, the data loading will take place on the server before the page is
          returned. If you navigated here from another page, the data was fetched from the client after the route
          transition. This uses the decorator method <code>@asyncConnect</code> with the{' '}
          <code>deferred: !!__SERVER__</code> flag. To block a route transition until some data is loaded, remove the{' '}
          <code>deferred:!!__SERVER__</code> flag. To always render before loading data, even on the server, use{' '}
          <code>componentDidMount</code>.
        </p>
        <p>This widgets are stored in your session, so feel free to edit it and refresh.</p>
        {error && (
          <div className="alert alert-danger" role="alert">
            <span className="glyphicon glyphicon-exclamation-sign" aria-hidden="true" /> {error}
          </div>
        )}
        {widgets &&
          widgets.length && (
            <table className="table table-striped">
              <thead>
                <tr>
                  <th className={styles.idCol}>ID</th>
                  <th className={styles.colorCol}>Color</th>
                  <th className={styles.sprocketsCol}>Sprockets</th>
                  <th className={styles.ownerCol}>Owner</th>
                  <th className={styles.buttonCol} />
                </tr>
              </thead>
              <tbody>
                {widgets.map(
                  widget =>
                    editing[widget.id] ? (
                      <WidgetForm form={String(widget.id)} key={String(widget.id)} initialValues={widget} />
                    ) : (
                      <tr key={widget.id}>
                        <td className={styles.idCol}>{widget.id}</td>
                        <td className={styles.colorCol}>{widget.color}</td>
                        <td className={styles.sprocketsCol}>{widget.sprocketCount}</td>
                        <td className={styles.ownerCol}>{widget.owner}</td>
                        <td className={styles.buttonCol}>
                          <button className="btn btn-primary" onClick={handleEdit(widget)}>
                            <i className="fa fa-pencil" /> Edit
                          </button>
                        </td>
                      </tr>
                    )
                )}
              </tbody>
            </table>
          )}
      </div>
    );
  }
}

export default asyncConnect([
  {
    deferred: !!__SERVER__,
    promise: ({ store: { dispatch, getState } }: { store: Store<any> }) => {
      if (!isLoaded(getState())) {
        return dispatch(loadWidgets() as any);
      }
    }
  }
])(
  connect(
    state => ({
      widgets: state.widgets.data,
      editing: state.widgets.editing,
      error: state.widgets.error,
      loading: state.widgets.loading
    }),
    { ...widgetActions }
  )(Widgets as any)
);
