const users = require('./users/users.service.js');
const videoActivities = require('./videoActivities/videoActivities.service.js');
const videos = require('./videos/videos.service.js');
module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(users);
  app.configure(videoActivities);
  app.configure(videos);
};
