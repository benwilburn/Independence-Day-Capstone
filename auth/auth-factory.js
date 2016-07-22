
angular.module('independence-day')
  .factory('AuthFactory', function($timeout, $location, $http, $q, FIREBASE_URL) {
    var currentUser = null;
    firebase.auth().onAuthStateChanged((user) => {
      if(user) {
        var users = null;
        $http.get(`${FIREBASE_URL}/auth.json`)
        .then((res) => {
          users = res.data;
          return users;
        })
        .then((users) => {
          for(var key in users) {
            var currUser = users[key];
              if(currUser.uid === users[key].uid) {
                currentUser = users[key];
                return currentUser;
            }
          }
        })
        // .then(() => $location.path('/independence-day'))
        // .then($timeout);
      }
      //  else {
      //   $location.path('/');
      //   $timeout();
      // }
    });

    return {
      verifyLogin: function(user) {
        return firebase.auth()
          .signInWithEmailAndPassword(user.email, user.password);
      },

      registerNew: function(user){
        return firebase.auth()
        .createUserWithEmailAndPassword(user.email, user.password);
      },

      createUserObject: function(res, user) {
        // console.log('user', user);
        user.uid = res.uid;
        $http.post(`${FIREBASE_URL}/auth.json`, user);
      },

      currentUser: function(user) {
        return {
          uid: user.id,
          email: user.email,
          username: user.username
        }
      },

      // getUser: function(param) {
      //   if (param) {
      //     return currentUser[param];
      //   } else {
      //     return currentUser;
      //   }
      // },

      getUserAuth: function() {
        return $q.when(firebase.auth.currentUser);
      }
    };
  });
