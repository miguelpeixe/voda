// Initializes the `videos` service on path `/videos`
const createService = require('feathers-sequelize');
const createModel = require('../../models/videos.model');
const hooks = require('./videos.hooks');
const filters = require('./videos.filters');
const url = require('url');

module.exports = function () {
  const app = this;
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    name: 'videos',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/videos', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('videos');

  // Control video privacy settings
  app.use('/videos/control/connect', (req, res, next) => {
    res.sendStatus(200);
  });
  app.use('/videos/control/play', (req, res, next) => {
    var path = req.body.name.split(':')[1];
    var token = req.body.token;
    console.log(req.body);
    service.find({
      query: {
        path: path
      }
    }).then(queryRes => {
      var videoData = queryRes.data[0].dataValues;
      if(videoData.privacy == 'private') {
        // Authenticate
        if(token) {
          // console.log(token);
          app.passport.verifyJWT(token).then(payload => {
            console.log(payload);
          });
        } else {
          res.sendStatus(401);
        }
      } else {
        res.sendStatus(200);
      }
    }, () => {
      res.sendStatus(404);
    });
  });

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
