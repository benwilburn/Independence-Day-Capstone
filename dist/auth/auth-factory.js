
angular.module('independence-day')
  .factory('AuthFactory', function($timeout, $location, $http, $q, FIREBASE_URL) {
    var userInfo = null;
    firebase.auth().onAuthStateChanged((user) => {
      if(user) {
        // var users = null;
        $http.get(`${FIREBASE_URL}/auth.json`)
        .then((res) => {
          var users = res.data;
          return users;
        })
        .then((users) => {
          for(var key in users) {
            // var currUser = users[key];
            if(user.uid === users[key].uid) {
              userInfo = users[key];
            }
          }
        });
      } else {
        $location.path('/');
        $timeout();
      }
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

      currentUser: function() {
        return {
          uid: userInfo.id,
          email: userInfo.email,
          username: user.username
        };
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
