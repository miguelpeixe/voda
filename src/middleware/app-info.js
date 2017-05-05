'use strict';

const appInfo = {
  active: true
};

const hasUsers = (app) => new Promise((resolve, reject) => {
  let userService = app.service('users');
  userService.find({$limit: 1}).then(users => {
    if(users.total === 0) {
      appInfo.active = false;
    } else {
      appInfo.active = true;
    }
    resolve();
  });
});

const getHost = (app) => new Promise((resolve, reject) => {
  appInfo.host = app.get('host');
  appInfo.rtmp = app.get('rtmp');
  resolve();
});

const send = res => () => {
  res.send(appInfo);
};

module.exports = app => (req, res) => {
  hasUsers(app)
    .then(getHost(app))
    .then(send(res))
    .catch(send(res));
};
