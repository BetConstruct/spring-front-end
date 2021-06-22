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
            loadJackpotData: "=",
            loadExternal: "=",
            providers: "=",
            hideTournaments: "=",
            hideInfo: "="
        },
        link: function (scope) {
            if (!scope.tab) {
                scope.tab = {selected: 'tournaments'};
            }

            if (scope.hideTournaments) {
                scope.tab = {selected: 'jackpots'};
            }

            scope.jackpotWidgets = {
                widgetIndex: 0
            };

            function subscribeForExternalJackpotDataCallback(data) {
                data = angular.copy(data);
                scope.jackpotData = [];
                if (scope.providers) {
                    for (var index in scope.providers) {
                        if (data && data[scope.providers[index]]) {
                            var provider = scope.providers[index];
                            var jackpot = data[provider];
                            jackpot.Provider = provider;
                            scope.jackpotData.push(jackpot);
                        }
                    }
                } else {
                    angular.forEach(data, function (jackpot, provider) {
                        if (jackpot) {
                            jackpot.Provider = provider;
                            scope.jackpotData.push(jackpot);

                        }
                    });
                }
            }

            function subscribeForJackpotDataCallback(data) {
                scope.jackpotData = Utils.objectToArray(data);
            }

            function subscribeForJackpotData() {
                if (scope.loadExternal) {
                    jackpotManager.subscribeForExternalJackpotData(subscribeForExternalJackpotDataCallback, scope.providers);
                } else {
                    jackpotManager.subscribeForJackpotData(-1, subscribeForJackpotDataCallback, null, 'casino');  // -1 all games ,  casino
                }

            }

            if (scope.loadJackpotData) {

                if (!scope.hideTournaments) {
                    casinoData.getOptions().then(function (response) {
                        if (response && response.data && response.data.status !== -1 && response.data.hasTournaments) {
                            scope.hasTournaments = true;
                        }
                    });

                    var jackpotDataWatcher = scope.$watch('jackpotData', function (data) {
                        if (data && data.length > 0) {
                            jackpotDataWatcher();
                            scope.tab.selected = 'jackpots';
                            scope.hasJackpots = true;
                        }
                    });
                }

                scope.jackpotData = [];
                subscribeForJackpotData();


                scope.$on('$destroy', function () {
                    if (scope.loadExternal) {
                        jackpotManager.unsubscribeFromAllExternalJackpotData(subscribeForExternalJackpotDataCallback);
                    } else {
                        jackpotManager.unsubscribeFromJackpotData(null, -1, subscribeForJackpotDataCallback);
                    }
                });
            }

            scope.changeJackpotSlider = function (index) {
                scope.jackpotWidgets.widgetIndex = index < 0 ? scope.jackpotData.length - 1 : index > scope.jackpotData.length - 1 ? 0 : index;
            };
        }
    };
}]);
