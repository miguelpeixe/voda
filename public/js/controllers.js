angular.module('voda')

.controller('AppCtrl', [
  '$scope',
  '$state',
  '$feathers',
  'App',
  'Voda',
  function($scope, $state, $feathers, App, Voda) {
    console.log(App);
    $scope.user = false;
    $scope.$watch(function() {
      return $feathers.get('user');
    }, function(user) {
      $scope.user = user;
      Voda.set('user', user);
    });
    $scope.logout = $feathers.logout;
    $feathers.on('logout', function() {
      location.reload();
    });
    // Store app data in global service
    for(var key in App.data) {
      Voda.set(key, App.data[key]);
    }
    // Redirect to registration if app not active (no users found in db)
    if(!Voda.get('active')) {
      $state.go('main.auth', {register: true});
    }
    $scope.userIs = Voda.auth.userIs;
  }
])

.controller('HomeCtrl', [
  '$scope',
  '$state',
  '$feathers',
  'Voda',
  'Videos',
  function($scope, $state, $feathers, Voda, Videos) {
    var videoService = $feathers.service('videos');
    $scope.videos = Videos.data;
    videoService.on('created', function(data) {
      $scope.$apply(function() {
        $scope.videos.unshift(data);
      });
    });
    videoService.on('removed', function(data) {
      $scope.$apply(function() {
        $scope.videos = _.filter($scope.videos, function(video) {
          return video.id !== data.id;
        });
      });
    });
    videoService.on('updated', function(data) {
      $scope.$apply(function() {
        $scope.videos.forEach(function(video, i) {
          if(video.id == data.id) {
            $scope.videos[i] = data;
          }
        });
      });
    });
    videoService.on('patched', function(data) {
      $scope.$apply(function() {
        $scope.videos.forEach(function(video, i) {
          if(video.id == data.id) {
            $scope.videos[i] = data;
          }
        });
      });
    });
  }
])

.controller('AuthCtrl', [
  '$scope',
  '$feathers',
  '$state',
  '$stateParams',
  'Voda',
  function($scope, $feathers, $state, $stateParams, Voda) {
    var userService = $feathers.service('users');
    $scope.active = Voda.get('active');
    if($stateParams.register) {
      $scope.registration = true;
    }
    $scope.credentials = {};
    var auth = function() {
      $feathers.authenticate({
        strategy: 'local',
        email: $scope.credentials.email,
        password: $scope.credentials.password
      }).then(function(res) {
        return $feathers.passport.verifyJWT(res.accessToken);
      }).then(function(payload) {
        $state.go('main.home', {}, {reload:true});
      }).catch(function(err) {
        console.error('Error authenticating', err);
      });
    };
    $scope.auth = function() {
      if($scope.registration) {
        userService.create($scope.credentials)
          .then(auth)
          .catch(function(err) {
            console.error('Error creating user', err);
          });
      } else {
        auth();
      }
    }
  }
])

.controller('UsersCtrl', [
  '$scope',
  'Users',
  function($scope, Users) {
    $scope.users = Users.data;
  }
])

.controller('SingleUserCtrl', [
  '$scope',
  '$state',
  '$feathers',
  'User',
  function($scope, $state, $feathers, User) {
    var service = $feathers.service('users');
    $scope.user = angular.copy(User);
    console.log(User);
    $scope.save = function() {
      if(User.id) {
        delete $scope.user.password;
        service.patch(User.id, $scope.user).then(function(user) {
          $scope.user = user;
        });
      } else {
        service.create($scope.user).then(function(res) {
          $state.go('main.home');
        }).catch(function(err) {
          console.error('Error creating user', err);
        });
      }
    };
  }
])

.controller('ReportsCtrl', [
  '$scope',
  '$feathers',
  'Activities',
  function($scope, $feathers, Activities) {
    $scope.activities = Activities.data;
    var activityService = $feathers.service('videoActivities');
    console.log($scope.activities);
    activityService.on('created', function(data) {
      $scope.$apply(function() {
        $scope.activities.unshift(data);
      });
    });
    activityService.on('removed', function(data) {
      $scope.$apply(function() {
        $scope.activities = _.filter($scope.activities, function(activity) {
          return activity.id !== data.id;
        });
      });
    });
    activityService.on('updated', function(data) {
      $scope.$apply(function() {
        $scope.activities.forEach(function(activity, i) {
          if(activity.id == data.id) {
            $scope.activities[i] = data;
          }
        });
      });
    });
    activityService.on('patched', function(data) {
      $scope.$apply(function() {
        $scope.activities.forEach(function(activity, i) {
          if(activity.id == data.id) {
            $scope.activities[i] = data;
          }
        });
      });
    });
    $scope.getTime = function(activity) {
      var time = 0;
      if(activity.data && activity.data.lastTimestamp) {
        time = activity.data.lastTimestamp.time;
      } else {
        time = -1;
      }
      return parseInt(time);
    };
  }
])

.controller('VideoCtrl', [
  '$scope',
  '$state',
  '$feathers',
  'Video',
  function($scope, $state, $feathers, Video) {
    var service = $feathers.service('videos');
    $scope.video = angular.copy(Video);
    $scope.video.recordedAt = new Date($scope.video.recordedAt);
    $scope.save = function() {
      if(Video.id) {
        service.patch(Video.id, $scope.video).then(function(video) {
          $scope.video = video;
        });
      } else {
        service.create($scope.video).then(function(res) {
          $state.go('main.home');
        }).catch(function(err) {
          console.error('Error creating video', err);
        });
      }
    };
  }
]);
