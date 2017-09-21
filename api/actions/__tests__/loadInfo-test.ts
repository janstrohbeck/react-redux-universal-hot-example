import { expect } from 'chai';
import loadInfo from '../loadInfo';

const timekeeper = require('timekeeper');

describe('loadInfo', () => {
  it('loads the current date', () => {
    const now = Date.now();
    (timekeeper as any).freeze(now);

    expect(loadInfo()).to.deep.equal({ time: now, message: 'This came from the api server' });
  });
});
