angular.module('independence-day')
  .factory('AuthFactory', function($http, $q, FIREBASE_URL) {
    let currentUser = null;

    firebase.auth().onAuthStateChanged((user) => {
      console.log('auth state changed');
      if(user) {
        console.log('auth object found');
        var users = null;
        $http.get(`${FIREBASE_URL}/auth.json`)
        .then((res) => {
          users = res.data;
          console.log(users);
          return users;
        })
        .then((users) => {
          for(var key in users) {
            if(users[key].uid === user.id) {
              currentUser = users[key];
              console.log('currentUser: ', currentUser);
            }
          }
        });
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
        console.log('user', user);
        user.uid = res.uid;
        $http.post(`${FIREBASE_URL}/auth.json`, user);
      },

      getUser: function(param) {
        if (param) {
          return currentUser[param];
        } else {
          return currentUser;
        }
      },

      getUserAuth: function() {
        return $q.when(firebase.auth.currentUser);
      }
    };
  });
