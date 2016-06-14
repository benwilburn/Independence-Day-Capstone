angular.module('independence-day')
  .config(($routeProvider) => {
  $routeProvider
  .when('/', {
    templateUrl: 'game.html',
    controller: 'game-ctrl',
    controllerAs: 'game',
  })
});
