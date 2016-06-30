angular.module('independence-day')
  .factory('LeaderboardFactory', function($http, FIREBASE_URL) {
    return {
      getLeaderboard: function() {
        return $http.get(`${FIREBASE_URL}/leaderboard.json`)
          .then((res) => {
            leaderboard = res;
            console.log('leaderboard', leaderboard);
            return leaderboard;
          });
      },

      postToLeaderboard: function() {
        return $http.post(`${FIREBASE_URL}/leaderboard.json`)
          .then((res) => {
            console.log(res);
          });
      }
    };
  });
