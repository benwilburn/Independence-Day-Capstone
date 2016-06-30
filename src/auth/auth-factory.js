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
          // console.log('users', users);
          return users;
        })
        .then((users) => {
          // console.log('users', users);
          for(var key in users) {
            var currUser = users[key];
            console.log('users[key]', users[key]);
            console.log('users', users)
            // console.log('key.username', key.username);
            // console.log('currUser.username', currUser.username);
            // for(var info in currUser){
            //   // console.log('key', key);
            //   console.log('info', currUser[info]);
            if(currUser.uid === users[key].uid) {
              currentUser = users[key].username;
              console.log('currentUser: ', currentUser);
              return currentUser;
            }
          }
        })
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
          return $scope.currentUser[param];
        } else {
          return $scope.currentUser;
        }
      },

      getUserAuth: function() {
        return $q.when(firebase.auth.currentUser);
      }
    };
  });
