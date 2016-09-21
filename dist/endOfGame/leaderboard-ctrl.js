angular.module('independence-day')
  .controller('ModalInstanceCtrl', function($scope, $uibModalInstance, scores, level1ScoresArray, currentCompletedTime, currentTime) {

    $scope.scores = scores;

    $scope.level1ScoresArray = level1ScoresArray;

    $scope.currentCompletedTime = currentCompletedTime;

    $scope.currentTime = currentTime;

    $scope.ok = function() {
      $uibModalInstance.close();
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  })
