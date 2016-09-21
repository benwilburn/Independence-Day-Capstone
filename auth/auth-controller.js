angular.module('independence-day')
  .controller('auth-ctrl', function($location, AuthFactory) {
    const auth = this;

    auth.login = function () {
      AuthFactory.verifyLogin(auth.user)
      .then(() => {$location.path('/controls')})
      .catch((error) => console.log(error));
    };

    auth.register = function() {
      AuthFactory.registerNew(auth.user)
      .then((res) => (AuthFactory.createUserObject(res, auth.user)))
      .then(() => (AuthFactory.verifyLogin(auth.user)))
      .then(() => {$location.path('/controls')})
      .catch((error) => console.log(error));
    };

    auth.goTo = function(path) {
      $location.path(path)
    }

  });
