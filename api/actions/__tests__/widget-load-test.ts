import { expect } from 'chai';
import load from '../widget/load';

const mockMath = Object.create(global.Math);
const oldMath = global.Math;

describe('widget load', () => {
  afterEach(() => {
    global.Math = oldMath;
  });

  describe('successful', () => {
    beforeEach(() => {
      mockMath.random = () => 0.4;
      global.Math = mockMath;
    });

    it('uses the widgets from the session', () =>
      load({ session: { user: {}, widgets: ['a', 'b', 'c'] } }).then(widgets => {
        expect(widgets.length).to.equal(3);
      }));

    it('initializes the widgets ', () =>
      load({ session: { user: {} } }).then(widgets => {
        expect(widgets.length).to.equal(4);
        expect(widgets[0].color).to.equal('Red');
      }));
  });

  describe('unsuccessful', () => {
    beforeEach(() => {
      mockMath.random = () => 0.2;
      global.Math = mockMath;
    });

    it('rejects the call', () =>
      load({ session: { user: {} } }).then(
        () => {},
        err => {
          expect(err).to.equal('Widget load fails 33% of the time. You were unlucky.');
        }
      ));
  });
});
