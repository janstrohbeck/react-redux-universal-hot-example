import { expect } from 'chai';

const mockMath = Object.create(global.Math);
const oldMath = global.Math;
const mockLoad = jest.fn();
jest.mock('../widget/load', () => ({ default: mockLoad }));
// eslint-disable-next-line import/first
import update from '../widget/update';

describe('widget update', () => {
  afterEach(() => {
    global.Math = oldMath;
  });

  describe('randomly successful', () => {
    const mockWidgets = [{}, { id: 2, color: 'Red' }];

    beforeEach(() => {
      mockMath.random = () => 0.3;
      global.Math = mockMath;
      jest.resetAllMocks();
    });

    it('does not accept green widgets', () => {
      mockLoad.mockReturnValue(new Promise(resolve => resolve(mockWidgets)));
      return update({ session: {}, body: { color: 'Green' } }).then(
        () => {},
        err => {
          expect(err.color).to.equal('We do not accept green widgets');
        }
      );
    });

    it('fails to load widgets', () => {
      mockLoad.mockReturnValue(new Promise((resolve, reject) => reject('Widget fail to load.')));
      return update({ session: {}, body: { color: 'Blue' } }).then(
        () => {},
        err => {
          expect(err).to.equal('Widget fail to load.');
        }
      );
    });

    it('updates a widget', () => {
      mockLoad.mockReturnValue(new Promise(resolve => resolve(mockWidgets)));
      const widget = { id: 2, color: 'Blue' };
      return update({ session: {}, body: widget }).then(res => {
        expect(res).to.deep.equal(widget);
        expect(mockWidgets[1]).to.deep.equal(widget);
      });
    });
  });

  describe('randomly unsuccessful', () => {
    beforeEach(() => {
      mockMath.random = () => 0.1;
      global.Math = mockMath;
    });

    it('rejects the call in 20% of the time', () =>
      update().then(
        () => {},
        err => {
          expect(err).to.equal('Oh no! Widget save fails 20% of the time. Try again.');
        }
      ));
  });
});
