angular.module('voda')

.factory('Voda', [
  function() {
    var config = {};
    var _set = function(key, val) {
      config[key] = val;
      return config[key];
    };
    var _get = function(key) {
      if(typeof key != 'undefined') {
        if(config[key])
          return config[key];
        else
          return false;
      } else {
        return config;
      }
    };
    return {
      set: _set,
      get: _get,
      auth: {
        userIs: function(roles) {
          var user = _get('user');
          if(user) {
            if(typeof roles == 'string')
              roles = [roles];
            return roles.indexOf(user.role) !== -1;
          } else {
            return false;
          }
        }
      }
    }
  }
]);
