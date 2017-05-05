angular.module('voda')

.factory('Voda', [
  function() {
    var config = {};
    return {
      set: function(key, val) {
        config[key] = val;
        return config[key];
      },
      get: function(key) {
        if(typeof key != 'undefined') {
          if(config[key])
            return config[key];
          else
            return false;
        } else {
          return config;
        }
      }
    }
  }
]);
