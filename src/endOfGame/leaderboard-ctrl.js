angular.module('independence-day')
  .controller('ModalInstanceCtrl', function($scope, $uibModalInstance, scores) {

    $scope.scores = scores;

    $scope.ok = function() {
      $uibModalInstance.close();
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };


  })
