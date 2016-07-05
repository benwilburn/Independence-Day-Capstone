angular.module('independence-day')
  .factory('LeaderboardFactory', function($http, FIREBASE_URL) {
    return {
      getLeaderboard: function() {
        return $http.get(`${FIREBASE_URL}/leaderboard/level1.json`)
          .then((res) => {
            leaderboard = res;
            console.log('leaderboard', leaderboard);
            return leaderboard;
          });
      },

      postToLevel1Leaderboard: function(currentUser, time) {

        return $http.post(`${FIREBASE_URL}/leaderboard/level1.json`, {
          player: currentUser,
          timeCompleted: time
        });
      }
    };
  });
