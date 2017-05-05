angular.module('voda', [
  'ui.router',
  'ngFeathers',
  'vjs.video'
]);

angular.element(document).ready(function() {
  if(self != top) {
    angular.element('body').addClass('iframe');
  }
  angular.bootstrap(document, ['voda']);
  angular.element(document.body).css({display:'block'});
});
