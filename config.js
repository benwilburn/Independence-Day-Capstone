angular.module('independence-day')
  .config(($routeProvider) => {
  $routeProvider
  .when('/', {
    templateUrl: 'auth/login.html',
    controller: 'auth-ctrl',
    controllerAs: 'auth',
  })
  .when('/independence-day', {
    templateUrl: 'game/game.html',
    controller: 'gameplay-ctrl',
    controllerAs: 'gameplay',
  })
  .when('/register', {
    templateUrl: 'auth/register.html',
    controller: 'auth-ctrl',
    controllerAs: 'auth',
  })
  .when('/controls', {
    templateUrl: 'controls/controls.html',
    controller: 'auth-ctrl',
    controllerAs: 'auth',
  })
});
