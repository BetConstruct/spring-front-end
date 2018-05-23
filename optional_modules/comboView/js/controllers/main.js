/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:comboViewMainController
 * @description
 *  comboView Main controller
 */
VBET5.controller('comboViewMainController', ['$rootScope', '$scope', 'Config', 'Utils', '$location', 'TimezoneService', 'Storage', 'GameInfo', function ($rootScope, $scope, Config, Utils, $location, TimezoneService, Storage, GameInfo) {
    'use strict';

    $scope.timezones = TimezoneService.data;
    $scope.setTimezoneSwitcherValue = TimezoneService.setTimezoneSwitcherValue;
    $scope.timezoneSwitcherValue = TimezoneService.getTimezoneSwitcherInitialValue();
    $scope.setTimezoneSwitcherValue($scope.timezoneSwitcherValue, true);

    $scope.upcomingPeriods = Utils.clone(Config.main.upcomingGamesPeriods);
    $scope.upcomingPeriods.unshift(0);
    $scope.selectedUpcomingPeriod = $scope.upcomingPeriods[Config.env.defaultUpcomingPeriodIndex + 1 || 0];
    $scope.getVideoData = GameInfo.getVideoData;
    $scope.mainView = '';

    if ($location.path().indexOf('overview') >= 0) {
        $scope.mainView = 'overview';
    }

    $scope.bet = function bet(event, game, sport_id, region_id, competition_id, market, sport_alias) {
        if (!event.name) {
            return;
        }

        game.sport = {id: sport_id, alias: sport_alias};
        game.region = {id: region_id};
        game.competition = {id: competition_id};

        $rootScope.$broadcast('bet', {event: event, market: market, game: game, oddType: 'odd'});
    };

    $scope.$on('animation.video.available', function (event, game) {
        $scope.openGame = game;
        $scope.withVideoAnimation = game.has_animation;
    });

    $scope.$on('comboView.leftMenu.sportSelected', function () {
        $scope.openGame = {};
    });

    $scope.$on('comboView.leftMenu.competitionSelected', function () {
        $scope.openGame = {};
    });

    $scope.$on('comboView.leftMenu.regionSelected', function () {
        $scope.openGame = {};
    });

    /**
     * @ngdoc method
     * @name liveTodaySelected
     * @methodOf vbet5.controller:comboViewMainController
     * @description Broadcast when live today selected
     */
    $scope.liveTodaySelected = function liveTodaySelected () {
        $scope.openGame = {};
        $scope.$broadcast(
            'comboView.leftMenu.liveTodaySelected'
        );
    };

    /**
     * @ngdoc method
     * @name popularEventsSelected
     * @methodOf vbet5.controller:comboViewMainController
     * @description Broadcast when popular events are selected
     */
    $scope.popularEventsSelected = function popularEventsSelected () {
        $scope.openGame = {};
        $scope.$broadcast(
            'comboView.leftMenu.popularEventsSelected'
        );
    };

    /**
     * @ngdoc method
     * @name selectPrematchTimePeriod
     * @methodOf vbet5.controller:comboViewMainController
     * @description Broadcast when select prematch time period is for different hour
     * @param {Number} Hour
     */
    $scope.selectPrematchTimePeriod = function selectPrematchTimePeriod(hour) {
        if ($scope.selectedUpcomingPeriod === hour) {
            return;
        }

        $scope.selectedUpcomingPeriod = hour;
        $scope.$broadcast('comboView.timeFilter.changed');
    };

    /**
     * @ngdoc method
     * @name updatePathInComboView
     * @methodOf vbet5.controller:comboViewMainController
     * @description Update path in combo view
     * @param {Object} sport object
     * @param {Object} region object
     * @param {Object} competition object
     * @param {Object} game object
     */
    $scope.updatePathInComboView = function updatePathInComboView (sport, region, competition, game) {
        $scope.selectedSport = sport;
        $scope.selectedRegion = region;
        $scope.selectedCompetition = competition;
        $scope.selectedGame = game;

        $location.search('sport', sport ? sport.id : undefined);
        $location.search('region', region ? region.id : undefined);
        $location.search('competition', competition ? competition.id : undefined);
        $location.search('game', game ? game.id : undefined);
        $location.search('type', game && game.type && game.type === 1 ? 1 : 0);

        if ($scope.selectedCentralView === 'gameView') {
            var selectedGame = {
                game: game.id,
                sport:  sport.id,
                region: region.id,
                competition: competition.id
            };
            Storage.set('comboViewSelectedGame', selectedGame, 3600000); // 1 hour
        } else {
            Storage.remove('comboViewSelectedGame');
        }

    };
}]);