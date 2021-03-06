angular.module('voda')

.config([
  '$feathersProvider',
  function($feathersProvider) {
    $feathersProvider.setAuthStorage(window.localStorage);
    $feathersProvider.setEndpoint('');
    $feathersProvider.useSocket(true);
  }
])

.config([
  '$stateProvider',
  '$urlRouterProvider',
  '$locationProvider',
  '$httpProvider',
  function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

    var auth = [
      '$q',
      'Voda',
      '$feathers',
      function($q, Voda, $feathers) {
        var deferred = $q.defer();
        $feathers.authenticate().then(function(res) {
          Voda.set('accessToken', res.accessToken);
          return $feathers.passport.verifyJWT(res.accessToken);
        }).then(function(payload) {
          Voda.set('payload', payload);
          return $feathers.service('users').get(payload.userId);
        }).then(function(user) {
          $feathers.set('user', user);
          Voda.set('user', user);
          deferred.resolve(user);
        }).catch(function(err) {
          deferred.resolve(false);
        })
        return deferred.promise;
      }
    ];

    var isAuth = [
      '$q',
      'Auth',
      function($q, Auth) {
        if(Auth) {
          return true;
        } else {
          return $q.reject('Not logged in');
        }
      }
    ];

    $locationProvider.html5Mode({
      enabled: false,
      requireBase: false
    });
    $locationProvider.hashPrefix('!');

    $stateProvider
    .state('main', {
      abstract: true,
      templateUrl: '/views/main.html',
      controller: 'AppCtrl',
      resolve: {
        App: [
          '$http',
          function($http) {
            return $http.get('/app');
          }
        ],
        Auth: auth
      }
    })
    .state('main.home', {
      url: '/?page&s',
      templateUrl: '/views/home.html',
      controller: 'HomeCtrl',
      resolve: {
        Videos: [
          '$feathers',
          '$stateParams',
          'Auth',
          function($feathers, $stateParams) {
            var limit = 10;
            var search = $stateParams.s;
            var query = {
              $limit: limit,
              $skip: $stateParams.page ? limit*($stateParams.page-1) : 0,
              $sort: { recordedAt: -1 }
            };
            if(search) {
              query['$or'] = [
                { title: { $iLike: '%' + search + '%' } },
                { description: { $iLike: '%' + search + '%' } }
              ];
            }
            return $feathers.service('videos').find({
              query: query
            });
          }
        ]
      }
    })
    .state('main.auth', {
      url: '/auth/?register',
      controller: 'AuthCtrl',
      templateUrl: '/views/auth.html'
    })
    .state('main.users', {
      url: '/users/?page&s',
      controller: 'UsersCtrl',
      templateUrl: '/views/users/index.html',
      resolve: {
        isAuth: isAuth,
        Users: [
          '$stateParams',
          '$feathers',
          'isAuth',
          function($stateParams, $feathers) {
            var limit = 10;
            var s = $stateParams.s || '';
            return $feathers.service('users').find({
              query: {
                name: {
                  $iLike: '%' + s + '%'
                },
                $limit: limit,
                $skip: $stateParams.page ? limit*($stateParams.page-1) : 0,
                $sort: { name: 1 }
              }
            });
          }
        ]
      }
    })
    .state('main.users.edit', {
      url: 'edit/?id',
      controller: 'EditUserCtrl',
      templateUrl: '/views/users/edit.html',
      resolve: {
        User: [
          'isAuth',
          '$feathers',
          '$stateParams',
          function(isAuth, $feathers, $stateParams) {
            if($stateParams.id)
              return $feathers.service('users').get($stateParams.id);
            else
              return {
                role: 'subscriber',
                status: 'active' // temporary
              };
          }
        ]
      }
    })
    .state('main.users.single', {
      url: ':id/?report_page',
      controller: 'SingleUserCtrl',
      templateUrl: '/views/users/single.html',
      resolve: {
        User: [
          '$feathers',
          '$stateParams',
          'isAuth',
          function($feathers, $stateParams) {
            if($stateParams.id)
              return $feathers.service('users').get($stateParams.id);
            else
              return {
                role: 'subscriber',
                status: 'active' // temporary
              };
          }
        ],
        Activities: [
          '$feathers',
          '$stateParams',
          'isAuth',
          function($feathers, $stateParams) {
            var limit = 10;
            return $feathers.service('videoActivities').find({
              query: {
                userId: $stateParams.id,
                $limit: limit,
                $skip: $stateParams.report_page ? limit*($stateParams.report_page-1) : 0,
                $sort: { createdAt: -1 }
              }
            });
          }
        ]
      }
    })
    .state('main.reports', {
      url: '/reports/?page',
      controller: 'ReportsCtrl',
      templateUrl: '/views/reports/index.html',
      resolve: {
        isAuth: isAuth,
        Activities: [
          'isAuth',
          '$feathers',
          '$stateParams',
          function(isAuth, $feathers, $stateParams) {
            var limit = 10;
            return $feathers.service('videoActivities').find({
              query: {
                $limit: limit,
                $skip: $stateParams.page ? limit*($stateParams.page-1) : 0,
                $sort: { createdAt: -1 }
              }
            });
          }
        ]
      }
    })
    .state('main.videoEdit', {
      url: '/videos/edit/?id',
      controller: 'VideoCtrl',
      templateUrl: '/views/video/edit.html',
      resolve: {
        isAuth: isAuth,
        Video: [
          'isAuth',
          '$feathers',
          '$stateParams',
          function(isAuth, $feathers, $stateParams) {
            if($stateParams.id)
              return $feathers.service('videos').get($stateParams.id);
            else
              return {
                privacy: 'public',
                recordedAt: new Date(),
                status: 'uploaded' // temporary
              };
          }
        ]
      }
    })
    .state('main.video', {
      url: '/videos/:id/',
      controller: 'VideoCtrl',
      templateUrl: '/views/video/single.html',
      resolve: {
        Video: [
          '$feathers',
          '$stateParams',
          'Auth',
          function($feathers, $stateParams) {
            return $feathers.service('videos').get($stateParams.id);
          }
        ]
      }
    });

    /*
     * Trailing slash rule
     */
    $urlRouterProvider.rule(function($injector, $location) {
      var path = $location.path(),
      search = $location.search(),
      params;
      // check to see if the path already ends in '/'
      if (path[path.length - 1] === '/') {
        return;
      }
      // If there was no search string / query params, return with a `/`
      if (Object.keys(search).length === 0) {
        return path + '/';
      }
      // Otherwise build the search string and return a `/?` prefix
      params = [];
      angular.forEach(search, function(v, k){
        params.push(k + '=' + v);
      });
      return path + '/?' + params.join('&');
    });

  }
]);
