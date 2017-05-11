// Initializes the `videos` service on path `/videos`
const createService = require('feathers-sequelize');
const createModel = require('../../models/videoActivities.model');
const hooks = require('./videoActivities.hooks');
const filters = require('./videoActivities.filters');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  // doesnt affect anything
  const query = {
    $sort: { createdAt: -1 }
  };

  const options = {
    name: 'videoActivities',
    Model,
    paginate,
    query
  };

  // Initialize our service with any options it requires
  app.use('videoActivities', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('videoActivities');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }

};
