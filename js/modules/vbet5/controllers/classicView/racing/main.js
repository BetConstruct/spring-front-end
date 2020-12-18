/**
 * @ngdoc controller
 * @name vbet5.controller:classicViewRacingHomepageCtrl
 * @description
 * Classic view racing main controller
 */
angular.module('vbet5.betting').controller('classicViewRacingMainCtrl', ['$rootScope', '$scope', '$location',
    function ($rootScope, $scope, $location) {
        'use strict';

        (function  init() {
            var location = $location.search();



            if (!location.game) {
                $scope.data = {
                    page: location.racingPage || 'home',
                    sportId: $scope.selectedSport.id
                };
            } else {
                $scope.data = {
                    page: 'game',
                    sportId: $scope.selectedSport.id,
                    state: {
                        gameId: + location.game
                    }
                };
            }

            if (location.racingPage === 'game') {
                $scope.data.state = {
                    fromDate: +location.fromDate,
                    toDate: +location.toDate
                };
                if (location.game) {
                    $scope.data.state.gameId = +location.game;
                } else {
                    $scope.data.state.competitionId = +location.competition;
                }
            } else {
                $location.search('racingPage', $scope.data.page);
            }

            function handleNavigation(fromDate, toDate) {
                $location.search('fromDate', fromDate);
                $location.search('toDate', toDate);
                $rootScope.broadcast("racingNavigatedToGame");
            }
            $scope.navigation = {
                goTo: function goTo(page, gameId, fromDate, toDate, competitionId) {
                    $scope.data.page = page;
                    $location.search('racingPage', page);
                    var previousGameId = $scope.data.state && $scope.data.state.gameId;
                    if (gameId  && previousGameId !== gameId) {
                        $scope.data.state = {
                            gameId: gameId,
                            fromDate: fromDate,
                            toDate: toDate
                        };
                        $location.search('game', gameId);
                        $location.search('competition', undefined);
                        handleNavigation(fromDate, toDate);
                        return;
                    }
                    var previousCompetitionId = $scope.data.state && $scope.data.state.competitionId;
                    if (competitionId && previousCompetitionId !== competitionId) {
                        $scope.data.state = {
                            competitionId: competitionId,
                            fromDate: fromDate,
                            toDate: toDate
                        };
                        $location.search('competition', competitionId);
                        $location.search('game', undefined);
                        handleNavigation(fromDate, toDate);
                        return;
                    }
                    if (page === 'home') {
                        $location.search('competition', undefined);
                        $location.search('game', undefined);
                        $location.search('fromDate', undefined);
                        $location.search('toDate', undefined);
                        $scope.data.state = {};
                    }

                },
                selectRacingDate: function (data) {
                    $scope.data.state.fromDate = data.start;
                    $scope.data.state.endDate = data.end;
                    $location.search("fromDate", data.start);
                    $location.search("toDate", data.end);
                }
            };


            $scope.$on("prematch.expandCompetition", function (event, data) {
                if (data.fromLeft) {
                    if (data.sport.id !== $scope.data.sportId) {
                        $scope.data.sportId = data.sport.id;
                        if ($scope.data.page !== 'home') {
                            $scope.navigation.goTo("home");
                            return;
                        }
                        $scope.broadcast("reloadHomePage");
                        return;
                    }
                    if ($scope.data.page !== 'home') {
                        $scope.navigation.goTo("home");
                        return;
                    }
                    $scope.broadcast("expandRegion", data.competition.region.id);
                    return;
                }
                var gameId = $location.search().game;
                if (gameId) {
                    $scope.data.page = 'game';
                    $scope.data.state = {
                        gameId: +gameId
                    };
                    $rootScope.broadcast("racingNavigatedToGame");
                }

            });
            $scope.$on("$destroy", function () {
                $rootScope.broadcast("removePrematchStream");
            });
        })();



    }
]);
