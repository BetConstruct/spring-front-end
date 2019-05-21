VBET5.controller('mixedWinnersCtrl', ['$scope', '$rootScope', '$location', 'Zergling', 'Utils', 'Config', 'CConfig', 'content', 'casinoData', function ($scope, $rootScope, $location, Zergling, Utils, Config, CConfig, content, casinoData) {
    'use strict';
    $scope.casinoImagesPath = CConfig.cUrlPrefix + CConfig.winnersIconsUrl;
    $scope.winners = {
        sport: [],
        casino: []
    };
    $scope.winnersLoading = false;

    function initScope() {
        getPage('banner-favorite-game1-' + Config.env.lang, 'getWidget', 'topFavoriteData');
        getPage('banner-favorite-game2-' + Config.env.lang, 'getWidget', 'bottomFavoriteData');
    }

    /**
     * @ngdoc method
     * @name getBetWinners
     * @methodOf vbet5.controller:mixedWinnersCtrl
     * @description  get winners data
     */
    $scope.getBetWinners = function getBetWinners() {
        if (!$scope.winners.sport.length) {
            $scope.winnersLoading = true;
            var request = {};
            Zergling.get(request, 'get_biggest_winners').then(function (result) {
                // data can be in both cases
                if (result.details && result.details.bets && result.details.bets.bet) {
                    $scope.standardMode = true;
                    $scope.winners.sport = Utils.objectToArray(result.details.bets.bet);
                } else if (result.details && result.details.bets) {
                    $scope.standardMode = false;
                    $scope.winners.sport = Utils.objectToArray(result.details.bets);
                }

            })['catch'](function (reason) {
                console.log('Error:'); console.log(reason);
            })['finally'](function () {
                $scope.winnersLoading = false;
            });
        }
    };

    /**
     * @ngdoc method
     * @name getCasinoWinners
     * @methodOf vbet5.controller:mixedWinnersCtrl
     * @description  get winners data
     */
    $scope.getCasinoWinners = function getCasinoWinners() {
        if (!$scope.winners.casino.length) {
            $scope.winnersLoading = true;

            casinoData.getGameWinners().then(function (response) {
                if (response && response.data && response.data.status !== -1) {
                    $scope.winners.casino = response.data.gameSkinWinners;
                }
            })['finally'](function () {
                $scope.winnersLoading = false;
            });
        }
    };

    /**
     * @ngdoc method
     * @name getPage
     * @methodOf vbet5.controller:mixedWinnersCtrl
     * @description  get winners page
     * @param {String} Slug name
     * @param {String} getWidget or empty
     * @param {String} Scope property name to put data
     */
    function getPage (slug, type, property) {
        content.getPage(slug, true).then(function (data) {
            if (type === 'getWidget') {
                $scope[property] = data && data.data && data.data.widgets && data.data.widgets[0] && data.data.widgets[0].instance;
            } else {
                $scope[property] = data && data.data && data.data.page && data.data.page.children && data.data.page.children[0];
            }
        });
    }

    initScope();
}]);
