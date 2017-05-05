const handler = require('feathers-errors/handler');
const notFound = require('feathers-errors/not-found');
const serveStatic = require('feathers').static;
const expressLess = require('express-less');
const appInfo = require('./app-info');

module.exports = function () {
  // Add your custom middleware here. Remember, that
  // in Express the order matters, `notFound` and
  // the error handler have to go last.
  const app = this;

  app.use('/styles', expressLess( 'public/styles', {compress: true}));
  app.use('/assets', serveStatic( 'bower_components', {maxAge: 31536000} ));
  app.use('/app', appInfo(app));

  app.use(notFound());
  app.use(handler());
};
