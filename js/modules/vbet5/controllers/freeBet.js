/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:freeBetCtrl
 * @description
 *  freeBet controller.
 */
VBET5.controller('freeBetCtrl', ['$scope', '$rootScope', 'Config', 'Utils', 'Zergling', 'Moment', 'Translator', function ($scope, $rootScope, Config, Utils, Zergling, Moment, Translator) {
    'use strict';

    $scope.victorinaModel = {};
    $scope.filter = {
        day: 0
    };
    $scope.enablePartnerSigninRegisterCallbacks = Config.partner.enableSigninRegisterCallbacks;
    $scope.statuses = {
        'Waiting'   : Translator.get("unsettled"),
        'Lose'      : Translator.get("lost"),
        'Win'       : Translator.get("Won")
    };

    /**
     * @ngdoc method
     * @name creatDays
     * @methodOf vbet5.controller:freeBetCtrl
     * @description create days which have victorina data
     */
    $scope.creatDays = function () {
        $scope.days = [];
        var today;
        angular.forEach(Config.main.freeBet.offsetDays, function (offset) {
            Zergling.get({day: offset}, 'get_victorina_info').then(function (response) {
                if (response.victorinas) {
                    today = Moment.get();
                    $scope.days.push({text: today.subtract(offset, 'days').format("DD MMMM YYYY"), offset: offset});
                }
            });
        });
    };

    /**
     * @ngdoc method
     * @name loadVictorinas
     * @methodOf vbet5.controller:freeBetCtrl
     * @description loads pool betting data
     */
    $scope.loadVictorinas = function loadVictorinas(day) {
        day = day || 0;
        $scope.loading = true;
        Zergling.get({day: day}, 'get_victorina_info').then(function (response) {
            var victorinas = response.victorinas;
            angular.forEach(victorinas, function (victorina, victorinaId) {
                victorinas[victorinaId] = Utils.objectToArray(victorinas[victorinaId], "id");
                $scope.victorinaModel[victorinaId] = {};
                angular.forEach(victorinas[victorinaId], function (game) {
                    $scope.victorinaModel[victorinaId][game.id] = null;
                });
            });
            $scope.loading = false;
            $scope.victorinas = victorinas;
            console.log('get_victorina_info', victorinas, $scope.victorinaModel);
        });
    };

    $scope.changeDay = function updateDay () {
        var dayObj;
        angular.forEach($scope.days, function (dayData) {
            if (dayData.offset === $scope.filter.day) {
                dayObj = dayData;
            }
        });

        if (!dayObj) {
            return;
        }
        $scope.loadVictorinas(dayObj.offset);
    };

    /**
     * @ngdoc method
     * @name checkCompleteness
     * @methodOf vbet5.controller:freeBetCtrl
     * @description
     * collects picks from **victorinaModel** and sets **$scope.complete** accordingly
     * (true if picks are selected for all games, false otherwise)
     */
    function checkCompleteness() {
        $scope.complete = {};

        angular.forEach($scope.victorinaModel, function (singleVictorina, singleVictorinaId) {
            $scope.complete[singleVictorinaId] = true;
            angular.forEach(singleVictorina, function (game) {
                if (game === null) {
                    $scope.complete[singleVictorinaId] = false;
                }
            });
        });
    }

    $scope.$watch('victorinaModel', checkCompleteness, true);

    /**
     * @ngdoc method
     * @name randomChoice
     * @methodOf vbet5.controller:freeBetCtrl
     * @param {Number} victorinaId id
     * @param {Number} index
     * @description
     */
    $scope.randomChoice = function randomChoice(victorinaId, index) {
        if (Config.main.googleTagManagerId) {
            $rootScope.$emit('gtagEvent', {
                category: 'FreeBet',
                label: 'Random_choice_' + (index + 1)
            });
        }

        angular.forEach($scope.victorinas[victorinaId], function (game) {
            var availableKeys = [];
            angular.forEach(['p1', 'p2', 'x'], function (type) {
                if (game.events[type] !== undefined) {
                    availableKeys.push(type);
                }
            });
            var key = availableKeys[Math.floor((Math.random() * availableKeys.length))];
            console.log(victorinaId, game.id, game.events, key);
            $scope.victorinaModel[victorinaId][game.id] = game.events[key].event_id;
        });
    };

    /**
     * @ngdoc method
     * @name favouriteChoice
     * @methodOf vbet5.controller:freeBetCtrl
     * @param {Number} victorinaId id
     * @param {Number} index
     * @description
     */
    $scope.favouriteChoice = function favouriteChoice(victorinaId, index) {
        if (Config.main.googleTagManagerId) {
            $rootScope.$emit('gtagEvent', {
                category: 'FreeBet',
                label: 'Favourites_' + (index + 1)
            });
        }

        angular.forEach($scope.victorinas[victorinaId], function (game) {
            var selections = {};
            angular.forEach(['p1', 'p2', 'x'], function (type) {
                if (game.events[type] !== undefined) {
                    selections[type] = game.events[type].k;
                }
            });
            var minKey = Utils.getKeyOfMinValue(selections);
            $scope.victorinaModel[victorinaId][game.id] = game.events[minKey].event_id;
        });
    };

    /**
     * @ngdoc method
     * @name doFreeBet
     * @methodOf vbet5.controller:freeBetCtrl
     * @param {Number} victorinaId id
     * @param {MouseEvent} $event
     * @param {Number} index
     * @description
     */
    $scope.doFreeBet = function doFreeBet(victorinaId, $event, index) {
        if(!Config.env.authorized ) {
            $rootScope.$broadcast("openLoginForm");
            $event.stopPropagation();
            return;
        }

        if (Config.main.googleTagManagerId) {
            $rootScope.$emit('gtagEvent', {
                category: 'FreeBet',
                label: 'Place Bet_' + (index + 1)
            });
        }

        var selections = [];
        angular.forEach($scope.victorinaModel[victorinaId], function (eventId, gameId){
            var selection = {};
            selection[gameId] = parseInt(eventId, 10);
            selections.push(selection);
        });
        var request = {
            'victorina_id': victorinaId,
            'selections': selections
        };

        Zergling.get(request, 'do_bet_victorina').then(
            function (result) {
                console.log("request =", request);
                $scope.freeBetResultType = (result.result !== 0) ? 'Error' : 'Success';
                if (result.result === 0) {
                    $scope.freeBetResult = Translator.get("Your bet is accepted.");
                    $scope.filter.day = 0;
                    $scope.loadVictorinas(0);
                } else if (('message_' + result.result) !== Translator.get('message_' + result.result)) {
                    $scope.freeBetResult = Translator.get('message_' + result.result);
                } else {
                    $scope.freeBetResult = Translator.get("Sorry we can't accept your bets now, please try later") + ' (' + result.result + ')';
                }

                console.log('do_bet_victorina', result);
            }
        )['catch'](
            function (reason) {
                $scope.freeBetResultType = 'Error';
                $scope.freeBetResult = Translator.get("Sorry we can't accept your bets now, please try later") + ' (' + reason.code + ')';
                console.log('Error:', reason);
            }
        )['finally'](function () {
            $rootScope.$broadcast("globalDialogs.addDialog",{
                type: $scope.freeBetResultType.toLowerCase(),
                title: $scope.freeBetResultType,
                content: $scope.freeBetResult
            });
        });
    };

    /**
     * reload victorina's data  if the user logged in or logged out
     */
    $scope.$watch('env.authorized', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            $scope.filter.day = $rootScope.env.authorized ? $scope.filter.day : 0;
            $scope.loadVictorinas($scope.filter.day);
        }
    });
}]);
