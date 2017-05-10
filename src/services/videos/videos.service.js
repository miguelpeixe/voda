// Initializes the `videos` service on path `/videos`
const createService = require('feathers-sequelize');
const createModel = require('../../models/videos.model');
const hooks = require('./videos.hooks');
const filters = require('./videos.filters');
const url = require('url');
const authentication = require('feathers-authentication');

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
  const userService = app.service('users');
  app.use('/videos/control/connect', (req, res, next) => {
    res.sendStatus(200);
  });
  app.use('/videos/control/play', (req, res, next) => {
    const path = req.body.name.split(':')[1];
    const userid = parseInt(req.body.userid);
    service.get(req.body.videoid).then(videoRes => {
      const video = videoRes.dataValues;
      if(video.path == path) {
        if(video.privacy == 'private') {
          if(userid) {
            userService.get(userid).then(userRes => {
              const user = userRes.dataValues;
              if(user.status == 'active') {
                res.sendStatus(200);
              } else {
                res.sendStatus(401);
              }
            }, () => {
              res.sendStatus(401);
            });
          } else {
            res.sendStatus(401);
          }
        } else {
          res.sendStatus(200);
        }
      } else {
        res.sendStatus(404);
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
