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
  const controlResponse = (res, status, action, userid, videoid, ip) => {
    activityService.create({
      statusCode: status,
      action: action,
      userId: userid,
      videoId: videoid,
      ip: ip
    }, () => {
      res.sendStatus(status);
    });
  };
  app.use('/videos/control/connect', (req, res, next) => {
    res.sendStatus(200);
  });
  app.use('/videos/control/update', (req, res, next) => {
    let path = req.body.name.split(':')[1];
    let userid = parseInt(req.body.userid);
    let videoid = parseInt(req.body.videoid);
    activityService.find({
      query: {
        status: 'open',
        userId: userid,
        videoId: videoid,
        $sort: {
          updatedAt: -1
        }
      }
    }).then(activities => {
      let activity = activities.data[0];
      if(!activity.data) {
        activity.data = {};
      }
      let timestamps = activity.data.timestamps || [];
      timestamps.push({
        time: req.body.time,
        timestamp: req.body.timestamp,
      });
      activity.data.timestamps = timestamps;
      activityService.patch(activity.id, {data: activity.data}).then(() => {
        res.sendStatus(200);
      });
    }, () => {
      res.sendStatus(200);
    });
  });
  app.use('/videos/control/done', (req, res, next) => {
    let path = req.body.name.split(':')[1];
    let userid = parseInt(req.body.userid);
    let videoid = parseInt(req.body.videoid);
    activityService.find({
      query: {
        status: 'open',
        userId: userid,
        videoId: videoid,
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
  app.use('/videos/control/connect', (req, res, next) => {
    res.sendStatus(200);
  });
  app.use('/videos/control/play', (req, res, next) => {
    let path = req.body.name.split(':')[1];
    let userid = parseInt(req.body.userid);
    let videoid = parseInt(req.body.videoid);
    service.get(req.body.videoid).then(video => {
      if(video.path == path) {
        if(video.privacy == 'private') {
          if(userid) {
            userService.get(userid).then(user => {
              if(user.status == 'active') {
                controlResponse(res, 200, 'play', userid, video.id, req.body.addr);
              } else {
                controlResponse(res, 401, 'play', userid, video.id, req.body.addr);
              }
            }, () => {
              controlResponse(res, 401, 'play', userid, video.id, req.body.addr);
            });
          } else {
            controlResponse(res, 401, 'play', userid, video.id, req.body.addr);
          }
        } else {
          controlResponse(res, 200, 'play', userid, video.id, req.body.addr);
        }
      } else {
        controlResponse(res, 404, 'play', userid, video.id, req.body.addr);
      }
    }, () => {
      controlResponse(res, 404, 'play', userid, video.id, req.body.addr);
    });
  });

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }

};
