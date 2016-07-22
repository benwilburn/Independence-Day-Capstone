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
  // .when('/leaderboards', {
  //   templateUrl: 'endOfGame/leaderboard.html',
  //   controller: 'leaderboard-ctrl',
  //   controllerAs: 'leaderboard',
  // })
});