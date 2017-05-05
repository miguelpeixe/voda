const users = require('./users/users.service.js');
const videos = require('./videos/videos.service.js');
module.exports = function () {
  const app = this; // eslint-disable-line no-unused-vars
  app.configure(users);
  app.configure(videos);
};
