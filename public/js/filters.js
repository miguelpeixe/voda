angular.module('voda')

.filter('activityAction', [
  function() {
    return function(input) {
      var text = '';
      switch(input) {
        case 'play':
          text = 'Assistir vídeo';
          break;
      }
      return text;
    }
  }
])
.filter('statusCode', [
  function() {
    return function(input) {
      var text = '';
      switch(input) {
        case '200':
          text = 'Ok';
          break;
        case '404':
          text = 'Não encontrado';
          break;
        case '401':
          text = 'Não autorizado';
          break;
        case '400':
          text = 'Pedido não pode ser entendido';
          break;
      }
      return text;
    }
  }
])
.filter('formatDate', [
  function() {
    return function(input, format) {
      if(input) {
        input = moment(input).format(format || 'LLLL');
      }
      return input;
    }
  }
])
.filter('fromNow', [
  function() {
    return function(input, format) {
      if(input) {
        input = moment(input).fromNow();
      }
      return input;
    }
  }
])
.filter('duration', [
  function() {
    return function(input, format) {
      if(input) {
        input = moment.duration(parseInt(input), 'seconds').humanize();
      }
      return input;
    }
  }
]);
