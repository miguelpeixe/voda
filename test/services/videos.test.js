const assert = require('assert');
const app = require('../../src/app');

describe('\'videos\' service', () => {
  it('registered the service', () => {
    const service = app.service('videos');

    assert.ok(service, 'Registered the service');
  });
});
