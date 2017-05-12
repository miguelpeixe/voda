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
  const activityService = app.service('videoActivities');
  const controlResponse = (res, status, action, clientId, userId, videoId, ip) => {
    activityService.create({
      statusCode: status,
      action: action,
      clientId: clientId,
      userId: userId,
      videoId: videoId,
      ip: ip
    }, () => {
      res.sendStatus(status);
    });
  };
  app.use('/videos/control/update', (req, res, next) => {
    let path = req.body.name.split(':')[1];
    let clientId = parseInt(req.body.clientid);
    let videoId = parseInt(req.body.videoid);
    activityService.find({
      query: {
        status: 'open',
        clientId: clientId,
        videoId: videoId,
        $sort: {
          updatedAt: -1
        }
      }
    }).then(activities => {
      let activity = activities.data[0];
      if(!activity.data) {
        activity.data = {};
      }
      let timestamp = {
        time: req.body.time,
        timestamp: req.body.timestamp,
      };
      activity.data.lastTimestamp = timestamp;
      // let timestamps = activity.data.timestamps || [];
      // timestamps.push(timestamp);
      // activity.data.timestamps = timestamps;
      activityService.patch(activity.id, {data: activity.data}).then(() => {
        res.sendStatus(200);
      });
    }, () => {
      res.sendStatus(200);
    });
  });
  app.use('/videos/control/done', (req, res, next) => {
    let path = req.body.name.split(':')[1];
    let clientId = parseInt(req.body.clientid);
    let videoId = parseInt(req.body.videoid);
    activityService.find({
      query: {
        status: 'open',
        clientId: clientId,
        videoId: videoId,
        $sort: {
          updatedAt: -1
        }
      }
    }).then(activities => {
      let activity = activities.data[0];
      activityService.patch(activity.id, {status: 'closed'}).then(() => {
        res.sendStatus(200);
      });
    }, () => {
      res.sendStatus(200);
    });
  });
  app.use('/videos/control/play', (req, res, next) => {
    console.log('play', req.body);
    let path = req.body.name.split(':')[1];
    let clientId = parseInt(req.body.clientid);
    let userId = parseInt(req.body.userid);
    let videoId = parseInt(req.body.videoid);
    service.get(req.body.videoid).then(video => {
      if(video.path == path) {
        if(video.privacy == 'private') {
          if(!isNaN(userId)) {
            userService.get(userid).then(user => {
              if(user.status == 'active') {
                controlResponse(res, 200, 'play', clientId, userId, video.id, req.body.addr);
              } else {
                controlResponse(res, 401, 'play', clientId, userId, video.id, req.body.addr);
              }
            }, () => {
              controlResponse(res, 401, 'play', clientId, userId, video.id, req.body.addr);
            });
          } else {
            controlResponse(res, 401, 'play', clientId, null, video.id, req.body.addr);
          }
        } else {
          controlResponse(res, 200, 'play', clientId, null, video.id, req.body.addr);
        }
      } else {
        controlResponse(res, 404, 'play', clientId, null, video.id, req.body.addr);
      }
    }, () => {
      controlResponse(res, 404, 'play', clientId, null, video.id, req.body.addr);
    });
  });

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }

};
