import * as React from 'react';
import {
  renderIntoDocument,
  findRenderedDOMComponentWithTag,
  findRenderedDOMComponentWithClass
} from 'react-dom/test-utils';
import { expect } from 'chai';
import { Provider } from 'react-redux';
import { browserHistory } from 'react-router';
import { InfoBar } from '../';
import createStore from '../../redux/create';
import ApiClient from '../../helpers/ApiClient';

const client = new ApiClient();

describe('InfoBar', () => {
  const mockStore = {
    info: {
      load: () => {},
      loaded: true,
      loading: false,
      data: {
        message: 'This came from the api server',
        time: Date.now()
      }
    }
  };
  const store = createStore(browserHistory, { client } as any, mockStore as any);
  const renderer = renderIntoDocument(
    <Provider store={store} key="provider">
      <InfoBar />
    </Provider>
  );

  it('should render correctly', () => expect(renderer).to.be.ok);

  it('should render with correct value', () => {
    const text = findRenderedDOMComponentWithTag(renderer as any, 'strong').textContent;
    expect(text).to.equal(mockStore.info.data.message);
  });

  it('should render with a reload button', () => {
    const text = findRenderedDOMComponentWithTag(renderer as any, 'button').textContent;
    expect(text).to.be.a('string');
  });

  it('should render the correct className', () => {
    const styles = require('components/InfoBar/InfoBar.scss');
    const component = findRenderedDOMComponentWithClass(renderer as any, styles.infoBar);
    expect(styles.infoBar).to.be.a('string');
    expect(component.className).to.include(styles.infoBar);
  });
});
