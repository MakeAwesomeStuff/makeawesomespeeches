'use strict';

/**
 * @ngdoc function
 * @name makeawesomespeechesApp.controller:AccountCtrl
 * @description
 * # AccountCtrl
 * Controller of the makeawesomespeechesApp
 */
angular.module('makeawesomespeechesApp')
  .controller('AccountCtrl', ['$scope', '$location', '$routeParams', 'fbutil', 'user',
                    function ($scope, $location, $routeParams, fbutil, user) {

    $scope.syncLatestSpeech = function() {
      var storyKey = $scope.speechList[$scope.speechList.length-1].key;
      $scope.syncSpeech(storyKey);
    };

    $scope.syncSpeech = function(storyKey) {
      if ($scope.syncedObject) {
        // Otherwise we overwrite the previous one if not a hard refresh
        $scope.syncedObject.$destroy();
      }
      $scope.syncedObject = fbutil.syncObject('speeches/'+user.uid+'/'+storyKey);
      $scope.syncedObject.$bindTo($scope, 'currentSpeech');
    };

    $scope.createSpeech = function() {
      var newSpeech = {
        content: 'Brand new speech! CLICK HERE AND EDIT ME :)',
        createdOn: new Date().toJSON(),
        title: 'Speech ' + ($scope.speechList.length+1)
      };
      fbutil.pushObject('speeches/'+user.uid, newSpeech).then(function(ref) {
        var newSpeechListItem = {
            createdOn: newSpeech.createdOn,
            key: ref.key(),
            title: newSpeech.title
        };
        $scope.speechList.$add(newSpeechListItem).then(function() {
          $scope.syncLatestSpeech();
        });
      });
    };

    $scope.user = user;

    // Determine wether we show the latest, or a specific story
    var needToLoadLatestSpeech = true;
    if ($routeParams.speechId) {
      needToLoadLatestSpeech = false;
      $scope.syncSpeech($routeParams.speechId);
    }


    // Get list of stories and use that to find the latest
    // Note: Remember not to use push(), splice(), etc on this 'array'
    $scope.speechList = fbutil.syncArray('userSpeechesList/'+user.uid);
    $scope.speechList.$loaded(function() {
      if ($scope.speechList.length === 0) {
        $scope.createSpeech();
      } else if (needToLoadLatestSpeech) {
        $scope.syncLatestSpeech();
      }
    });

  }]);
