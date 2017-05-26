angular.module('voda')

.controller('AppCtrl', [
  '$scope',
  '$state',
  '$feathers',
  'App',
  'Voda',
  function($scope, $state, $feathers, App, Voda) {
    if(!swfobject.hasFlashPlayerVersion("1")) {
      $scope.flashWarning = true;
    }
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
  '$stateParams',
  '$feathers',
  'Voda',
  'Videos',
  function($scope, $state, $stateParams, $feathers, Voda, Videos) {

    $scope.$watch(function() {
      return $stateParams.page;
    }, function(page) {
      $scope.page = parseInt(page) || 1;
    });
    $scope.prevPage = function() {
      return $scope.page - 1;
    };
    $scope.nextPage = function() {
      return $scope.page + 1;
    };
    $scope.hasPrevPage = function() {
      return $scope.page > 1;
    };
    $scope.hasNextPage = function() {
      return Videos.limit * $scope.page < Videos.total;
    };

    $scope.search = '';
    var videoService = $feathers.service('videos');
    $scope.videos = angular.copy(Videos.data);
    if(!$scope.videos.length && !Voda.get('user')) {
      $state.go('main.auth');
    }
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
  '$feathers',
  '$state',
  '$stateParams',
  'Users',
  function($scope, $feathers, $state, $stateParams, Users) {

    $scope.userSearch = $stateParams.s || '';
    $scope.searchUser = function() {
      $state.go('main.users', {s: $scope.userSearch, page: null});
    };

    $scope.$watch(function() {
      return $stateParams.page;
    }, function(page) {
      $scope.page = parseInt(page) || 1;
    });
    $scope.prevPage = function() {
      return $scope.page - 1;
    };
    $scope.nextPage = function() {
      return $scope.page + 1;
    };
    $scope.hasPrevPage = function() {
      return $scope.page > 1;
    };
    $scope.hasNextPage = function() {
      return Users.limit * $scope.page < Users.total;
    };

    var service = $feathers.service('users');
    $scope.users = Users.data;
    service.on('created', function(data) {
      $scope.$apply(function() {
        $scope.users.unshift(data);
      });
    });
    service.on('removed', function(data) {
      $scope.$apply(function() {
        $scope.users = _.filter($scope.users, function(user) {
          return user.id !== data.id;
        });
      });
    });
    service.on('updated', function(data) {
      $scope.$apply(function() {
        $scope.users.forEach(function(user, i) {
          if(user.id == data.id) {
            $scope.users[i] = data;
          }
        });
      });
    });
    service.on('patched', function(data) {
      $scope.$apply(function() {
        $scope.users.forEach(function(user, i) {
          if(user.id == data.id) {
            $scope.users[i] = data;
          }
        });
      });
    });
    $scope.deleteUser = function(user) {
      if(confirm('Are you sure?'))
        service.remove(user.id);
    };
  }
])

.controller('SingleUserCtrl', [
  '$scope',
  '$stateParams',
  '$feathers',
  'User',
  'Activities',
  function($scope, $stateParams, $feathers, User, Activities) {

    $scope.activitiesCount = Activities.total;

    $scope.$watch(function() {
      return $stateParams.report_page;
    }, function(page) {
      $scope.page = parseInt(page) || 1;
    });
    $scope.prevPage = function() {
      return $scope.page - 1;
    };
    $scope.nextPage = function() {
      return $scope.page + 1;
    };
    $scope.hasPrevPage = function() {
      return $scope.page > 1;
    };
    $scope.hasNextPage = function() {
      return Activities.limit * $scope.page < Activities.total;
    };

    var service = $feathers.service('users');
    $scope.u = angular.copy(User);
    $scope.activities = angular.copy(Activities.data);
    $scope.getTime = function(activity) {
      var time = 0;
      if(activity.data && activity.data.lastTimestamp) {
        time = activity.data.lastTimestamp.time;
      } else {
        time = -1;
      }
      return parseInt(time);
    };
    $scope.deleteUser = function(user) {
      if(confirm('Are you sure?'))
        service.remove(user.id);
    };
  }
])
.controller('EditUserCtrl', [
  '$scope',
  '$state',
  '$feathers',
  'User',
  function($scope, $state, $feathers, User) {
    var service = $feathers.service('users');
    $scope.user = angular.copy(User);
    $scope.save = function() {
      if(User.id) {
        delete $scope.user.password;
        service.patch(User.id, $scope.user).then(function(user) {
          $scope.user = user;
          $state.go('main.users');
        });
      } else {
        service.create($scope.user).then(function(res) {
          $state.go('main.users');
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
  '$stateParams',
  'Activities',
  function($scope, $feathers, $stateParams, Activities) {
    $scope.$watch(function() {
      return $stateParams.page;
    }, function(page) {
      $scope.page = parseInt(page) || 1;
    });
    $scope.prevPage = function() {
      return $scope.page - 1;
    };
    $scope.nextPage = function() {
      return $scope.page + 1;
    };
    $scope.hasPrevPage = function() {
      return $scope.page > 1;
    };
    $scope.hasNextPage = function() {
      return Activities.limit * $scope.page < Activities.total;
    };

    $scope.activities = Activities.data;
    var activityService = $feathers.service('videoActivities');

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
          $state.go('main.home');
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
