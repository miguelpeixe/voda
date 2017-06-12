angular.module('voda')

.directive('videoItem', [
  '$feathers',
  'Voda',
  function($feathers, Voda) {
    return {
      restrict: 'A',
      scope: {
        'video': '=videoItem'
      },
      templateUrl: '/views/video/list-item.html',
      link: function(scope, element, attrs) {
        scope.userIs = Voda.auth.userIs;
        scope.$watch(function() {
          return $feathers.get('user');
        }, function(user) {
          scope.user = user;
        });
        var service = $feathers.service('videos');
        scope.deleteVideo = function(video) {
          if(confirm('Are you sure?'))
            service.remove(video.id);
        };
        scope.goLive = function(video) {
          service.patch(video.id, {status: 'live'});
        };
      }
    }
  }
])

.directive('ratio', [
  function() {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var ratio = attrs.ratio ? attrs.ratio.split(':') : false;
        function applyRatio() {
          if(ratio) {
            element.css({
              height: (element[0].offsetWidth * parseInt(ratio[1]) / parseInt(ratio[0])) + 'px'
            });
          } else {
            element.css({height: null});
          }
        }
        applyRatio();
        window.addEventListener('resize', applyRatio);
        scope.$on('$destroy', function() {
          window.removeEventListener('resize', applyRatio);
        });
      }
    }
  }
])

.directive('vodaMedia', [
  'Voda',
  function(Voda) {
    return {
      restrict: 'A',
      scope: {
        'video': '=vodaMedia'
      },
      templateUrl: '/views/video/media.html',
      link: function(scope, element, attrs) {
        scope.streamUrl = '';
        scope.$watch('video.liveKey', function(liveKey) {
          var rtmp = Voda.get('rtmp');
          if(liveKey)
            scope.streamUrl = 'rtmp://' + rtmp.host + ':' + rtmp.port + '/live?key=' + liveKey;
        });
      }
    };
  }
])

.directive('vodaPlayer', [
  'Voda',
  function(Voda) {
    return {
      restrict: 'AC',
      scope: {
        'video': '='
      },
      templateUrl: '/views/video/player.html',
      link: function(scope, element, attrs) {
        scope.options = {
          'techorder': ['flash']
        };
        scope.media = {};
        scope.$watch('video', function(video) {
          var rtmp = Voda.get('rtmp');
          var user = Voda.get('user');
          var client = Voda.get('client'); // temporary unsafe client addr
          scope.srcUrl = 'rtmp://' + rtmp.host + ':' + rtmp.port + '/archive/&mp4:' + video.path + '?videoid=' + video.id + '&userid=' + user.id + '&clientaddr=' + client.addr;
          scope.srcType = 'rtmp/mp4';
          scope.media = {
            sources: [
              {
                src: scope.srcUrl,
                type: scope.srcType
              }
            ]
          };
        });
        // listen for when the vjs-media object changes
        // scope.$on('vjsVideoReady', function (e, data) {
        //   console.log('video id:' + data.id);
        //   console.log('video.js player instance:' + data.player);
        //   console.log('video.js controlBar instance:' + data.controlBar);
        // });
        // scope.$on('vjsVideoMediaChanged', function (e, data) {
        //   console.log('vjsVideoMediaChanged event was fired', data);
        // });
      }
    }
  }
])

.directive('matchHeight', [
  '$document',
  '$window',
  function($document, $window) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        var matchHeight = function() {
          var height = document.getElementById(attrs.matchHeight).offsetHeight;
          element.css({
            height: height + 'px'
          });
        };
        element.css({
          height: '0px'
        });
        setTimeout(function() {
          matchHeight();
        }, 100);
        window.addEventListener('resize', matchHeight);
        scope.$on('$destroy', function() {
          window.removeEventListener('resize', matchHeight);
        });
      }
    }
  }
])

.directive('scrollToBottom', [
  function() {
    return {
      restrict: 'AC',
      link: function(scope, element, attrs) {
        setTimeout(function() {
          element[0].scrollTop = element[0].scrollHeight;
        }, 150);
      }
    }
  }
])

.directive('vodaComments', [
  '$feathers',
  '$document',
  function($feathers, $document) {
    return {
      restrict: 'A',
      scope: {
        'video': '=vodaComments'
      },
      templateUrl: '/views/video/comments.html',
      link: function(scope, element, attrs) {
        var commentList = element[0].querySelector('.comment-list');
        var service = $feathers.service('comments');
        scope.newComment = {
          videoId: scope.video.id
        };
        scope.comments = [];
        service.find({
          query: {
            videoId: scope.video.id.toString(),
            $sort: { createdAt: -1 },
            $limit: 10
          }
        }).then(function(res) {
          scope.$apply(function() {
            scope.comments = res.data;
          });
        }).catch(function(err) {
          console.error('Could not retrieve comments', err);
        });
        service.on('created', function(data) {
          var scrollToBottom = false;
          scope.$apply(function() {
            if(data.videoId == scope.video.id) {
              var totalScroll = commentList.clientHeight + commentList.scrollTop;
              if(commentList.scrollHeight - totalScroll < 60)
                scrollToBottom = true;
              scope.comments.push(data);
              setTimeout(function() {
                if(scrollToBottom) {
                  commentList.scrollTop = commentList.scrollHeight;
                }
              }, 50);
            }
          });
        });
        scope.sendComment = function() {
          service.create(scope.newComment).then(function() {
            scope.newComment.comment = '';
            document.getElementById('comment-field').focus();
          });
        }
      }
    };
  }
]);
