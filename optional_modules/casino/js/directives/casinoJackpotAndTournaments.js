/**
 * @ngdoc directive
 * @name CASINO.directive:casinoJackpotAndTournaments
 * @element ANY
 * @param {Boolean} hasJackpots
 * @param {Object} jackpotData jackpot data
 * @param {Boolean} loadJackpotData
 * param {Object} tab
 *
 * @description Casino jackpot and tournament widget
 */
CASINO.directive('casinoJackpotAndTournaments', ['Utils', 'casinoData', 'jackpotManager', function (Utils, casinoData, jackpotManager) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    template: '<div ng-include="::\'optional_modules/casino/templates/jackpot/casinoWidget.html\'|fixPath"></div>',
    scope: {
      jackpotData: '=?',
      hasJackpots: '=?',
      hasTournaments: '=?',
      tab: '=?',
      loadJackpotData: "="
    },
    link: function (scope) {
      if (!scope.tab) {
        scope.tab = {selected: 'tournaments'};
      }
      scope.jackpotWidgets = {
        widgetIndex: 0
      };


      function subscribeForJackpotData() {
        jackpotManager.unsubscribeFromJackpotData();
        jackpotManager.subscribeForJackpotData(-1, function subscribeForJackpotDataCallback(data) {
          scope.jackpotData = Utils.objectToArray(data);
        },null,'casino');  // -1 all games ,  casino
      }

      if (scope.loadJackpotData) {
        casinoData.getOptions().then(function (response) {
          if (response && response.data && response.data.status !== -1 && response.data.hasTournaments) {
            scope.hasTournaments = true;
          }
        });
        scope.jackpotData = [];
        subscribeForJackpotData();

        var jackpotDataWatcher = scope.$watch('jackpotData', function (data) {
          if (data && data.length > 0) {
            jackpotDataWatcher();
            scope.tab.selected = 'jackpots';
            scope.hasJackpots = true;
          }
        });
        scope.$on('$destroy', function() {
            jackpotManager.unsubscribeFromJackpotData(true);
        });
      }

      scope.changeJackpotSlider = function (index) {
        scope.jackpotWidgets.widgetIndex = index < 0 ? scope.jackpotData.length - 1 : index > scope.jackpotData.length - 1 ? 0 : index;
      };
    }
  };
}]);
