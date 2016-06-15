angular.module('independence-day')
  .config(($routeProvider) => {
  $routeProvider
  .when('/', {
    templateUrl: 'game.html',
    controller: 'gameplay-ctrl',
    controllerAs: 'gameplay',
  });
});
