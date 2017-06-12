module.exports = {
  bundle: {
    main: {
      scripts: [
        './public/js/**/*.js'
      ]
    },
    vendor: {
      scripts: [
        './node_modules/underscore/underscore.js',
        './node_modules/moment/min/moment-with-locales.js',
        './node_modules/socket.io-client/dist/socket.io.js',
        './node_modules/angular/angular.js',
        './node_modules/angular-ui-router/release/angular-ui-router.js',
        './node_modules/feathers-client/dist/feathers.js',
        './node_modules/ng-feathers/src/ng-feathers.js',
        './node_modules/vjs-video/dist/vjs-video.js'
      ],
      styles: [
        './node_modules/font-awesome/css/font-awesome.min.css',
        './node_modules/skeleton-css/css/normalize.css',
        './node_modules/skeleton-css/css/skeleton.css',
        './node_modules/video.js/dist/video-js.min.css'
      ]
    }
  },
  copy: [
    {
      src: './node_modules/font-awesome/fonts/**/*',
      base: './node_modules/font-awesome'
    }
  ]
};
