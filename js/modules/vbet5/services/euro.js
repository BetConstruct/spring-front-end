/**
 * Created by hayk.avagyan on 19/05/2016.
 */
/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:DomHelper
 * @description
 * Euro cup service
 */
VBET5.service('EuroCupService', [ '$http','$filter','$rootScope', function ( $http,$filter,$rootScope) {
    'use strict';

    var EuroCupService = {};
    var lngMapper = {
        eng:'en',
        spa:'es',
        rus:'ru',
        arm:'hy',
        tur:'tr',
        kor:'ko',
        chi:'zh'
    };
    var debug = "turn_on";
    var lng = $rootScope.env.lang || 'eng';

    var statLng = lngMapper[lng] || 'en';
    var leaguesUrl = "https://krosstats.betconstruct.com/api/"+statLng+"/900/League/GetSeasonTreeWithLegueTableList";
    var matchUrl = "https://krosstats.betconstruct.com/api/"+statLng+"/900/Match/GetMatchesByCompetitionId";
    var playoffUrl = "https://krosstats.betconstruct.com/api/"+statLng+"/900/Competition/GetSeasonTreeWithMatchList";
    var stadionUrl = "https://krosstats.betconstruct.com/api/"+statLng+"/900/Entity/GetStadiumById";
    var teamListUrl = "https://krosstats.betconstruct.com/api/"+statLng+"/900/Entity/GetTeamListByCompetitionId";
    var teamWithDetailUrl = "https://krosstats.betconstruct.com/api/"+statLng+"/900/Entity/GetTeamWithDetail";
    var playerUrl = "https://krosstats.betconstruct.com/api/"+statLng+"/900/Entity/GetPlayerById";

    /**
     * @ngdoc method
     * @name getLeagueTablesByParentSeazon
     * @methodOf vbet5.service:EuroCupService
     * @description Get league tables by parent seazon
     * @param {Number} Cup ID
     * @param {Number} Site ID
     * @param {String} Rounding
     */
    EuroCupService.getLeagueTablesByParentSeazon = function (cId, stId, round) {
        return $http({
            method: 'GET',
            url: leaguesUrl,
            params: {
                cId: cId,
                stId: stId,
                debug: debug,
                round: round
            }
        }).then(function (response) {
            return response.data;
        })
    };

    /**
     * @ngdoc method
     * @name GetStadiumById
     * @methodOf vbet5.service:EuroCupService
     * @description Get stadium data bu ID
     * @param {Number} Stadium ID
     * @returns HTTP request promise
     */
    EuroCupService.GetStadiumById = function (id) {
        return $http({
            method: 'GET',
            url: stadionUrl,
            params: {
                sId: id,
                debug: debug
            }
        }).then(function (response) {
            return response.data;
        });
    };

    /**
     * @ngdoc method
     * @name getLeagueTable
     * @methodOf vbet5.service:EuroCupService
     * @description Get stadium data bu ID
     * @param {Number} Cup ID
     * @param {Number} Site ID
     * @param {String} Rounding
     * @returns HTTP request promise
     */
    EuroCupService.getLeagueTable = function (cId, stId, round) {
        return $http({
            method: 'GET',
            url: leagueUrl,
            params: {
                cId: cId,
                stId: stId,
                debug: debug,
                r: round
            }
        }).then(function (response) {
            return response.data;
        });
    };

    /**
     * @ngdoc method
     * @name getMatches
     * @methodOf vbet5.service:EuroCupService
     * @description Get matches
     * @param {Number} Cup ID
     * @param {Number} Site ID
     * @param {String} Rounding
     * @returns HTTP request promise
     */
    EuroCupService.getMatches = function (cId, stId,order) {
        return $http({
            method: 'GET',
            url: matchUrl,
            params: {
                competitionId: cId,
                seasonTreeId: stId,
                debug: debug,
                sortType:order
            }
        }).then(function (response) {
            return response.data;
        });
    };

    /**
     * @ngdoc method
     * @name getPlayOff
     * @methodOf vbet5.service:EuroCupService
     * @description Get play Off
     * @param {Number} Site ID
     * @returns HTTP request promise
     */
    EuroCupService.getPlayOff = function (stId) {
        return $http({
            method: 'GET',
            url: playoffUrl,
            params: {
                stId: stId,
                debug: debug
            }
        }).then(function (response) {
            return response.data;
        });
    };

    /**
     * @ngdoc method
     * @name getTeamList
     * @methodOf vbet5.service:EuroCupService
     * @description Get team list
     * @param {Number} Site ID
     * @param {Number} Cup ID
     * @returns HTTP request promise
     */
    EuroCupService.getTeamList = function(stId,cId){
        return $http({
            method: 'GET',
            url: teamListUrl,
            params: {
                stId: stId,
                cId: cId,
                debug: debug
            }
        }).then(function (response) {
            return response.data;
        });

    };

    /**
     * @ngdoc method
     * @name getTeamWithDetail
     * @methodOf vbet5.service:EuroCupService
     * @description Get detaild team info
     * @param {String} Begin date
     * @param {String} End date
     * @param {Number} Team ID
     * @returns HTTP request promise
     */
    EuroCupService.getTeamWithDetail = function(BeginDate,EndDate,tId){
        return $http({
            method: 'GET',
            url: teamWithDetailUrl,
            params: {
                BeginDate: BeginDate,
                EndDate: EndDate,
                tId: tId,
                debug: debug
            }
        }).then(function (response) {
            return response.data;
        });
    };

    /**
     * @ngdoc method
     * @name GetPlayerById
     * @methodOf vbet5.service:EuroCupService
     * @description Get player info by id
     * @param {String} Begin date
     * @param {String} End date
     * @param {Number} Team ID
     * @param {Number} Play ID
     * @returns HTTP request promise
     */
    EuroCupService.GetPlayerById = function(BeginDate,EndDate,tId,pId){
        return $http({
            method: 'GET',
            url:playerUrl,
            params: {
                BeginDate: BeginDate,
                EndDate: EndDate,
                tId:tId,
                pId: pId,
                debug: debug
            }
        }).then(function (response) {
            return response.data;
        });
    };

    /**
     * @ngdoc method
     * @name groupPlayoff
     * @methodOf vbet5.service:EuroCupService
     * @description Group play off data for the template
     * @param {Number} Columns count
     * @returns {Object} Processeded data
     */
    EuroCupService.groupPlayoff = function (columns) {
        var seriesCount = 1;
        var cols = angular.forEach(columns, function (stage) {
            stage.Series = {};
            for (var i in stage.Matches) {
                stage.Matches[i].DateObject = new Date( stage.Matches[i].Date);

                if (  typeof stage.Matches[i] === 'undefined' ||   stage.Matches[i].length === 0 ){
                    stage.Series[i] = stage.Matches[i];
                    continue;
                } else
                 if (!stage.Matches[i].HomeTeam || !stage.Matches[i].AwayTeam) continue;
                var tkn = [stage.Matches[i].HomeTeam[0].id | 0, stage.Matches[i].AwayTeam[0].id | 0].sort(function (a, b) {
                    return a - b;
                }).join('_');
                if (angular.isUndefined(stage.Series[tkn])) {
                    stage.Series[tkn] = [];
                }
                stage.Series[tkn].push(stage.Matches[i]);
                /*
                 * Stages group into  1
                 * */
                if (stage.Series[tkn].length > 2) {
                    var team1 = stage.Series[tkn][0].HomeTeam[0];
                    var win1 = 0;
                    var win2 = 0;
                    angular.forEach(stage.Series[tkn], function (value) {
                        if (value.HomeTeam[0].id == team1.id) {
                            if (value.HomeScore - value.AwayScore > 0) {
                                win1++;
                            } else if (value.HomeScore - value.AwayScore < 0) {
                                win2++;
                            }
                        } else if (value.AwayTeam[0].id == team1.id) {
                            if (value.AwayScore - value.HomeScore > 0) {
                                win1++;
                            } else if (value.AwayScore - value.HomeScore < 0) {
                                win2++;
                            }
                        }
                    });
                    stage.Series[tkn].overviewResult = {'win1': win1, 'win2': win2};
                }
            }
        });
        //if (cols.length > 1) {
        //
        //    var i = cols.length - 1;
        //    var stageGamesSeq = [];
        //    var stageGamesSeqTmp = [];
        //    while (i >= 0) {
        //        if (stageGamesSeq.length > 0) {
        //            for (var k in stageGamesSeq) {
        //                var tkn = findInCol(cols[i].Series, stageGamesSeq[k] | 0);
        //                var series = cols[i].Series[tkn];
        //                if (series) {
        //                    delete cols[i].Series[tkn];
        //                    cols[i].Series[(parseInt(k) + 1000) + '_' + tkn] = series;
        //                    stageGamesSeqTmp.push(series[0].HomeTeam[0].id);
        //                    stageGamesSeqTmp.push(series[0].AwayTeam[0].id);
        //                    seriesCount = series.length;
        //                }
        //            }
        //            stageGamesSeq = stageGamesSeqTmp;
        //            stageGamesSeqTmp = [];
        //        } else {
        //
        //            var counter = 0;
        //            for (var k in cols[i].Series) {
        //                var series = cols[i].Series[k];
        //                if (series) {
        //                    delete (cols[i].Series[k]);
        //                    cols[i].Series[(100 + parseInt(counter)) + '_' + k] = series
        //                    if(series[0] && series[0]){
        //                    stageGamesSeq.push(series[0].HomeTeam[0].id | 0);
        //                    stageGamesSeq.push(series[0].AwayTeam[0].id | 0);
        //                    }
        //                }
        //                counter++;
        //            }
        //        }
        //        i--;
        //    }
        //}
        return cols;
    };

    /**
     * @ngdoc method
     * @name dateOrder
     * @methodOf vbet5.service:EuroCupService
     * @description Date ordering
     * @param {Object} Input data
     * @returns {Object} Processeded data
     */
    EuroCupService.dateOrder = function(groups) {
        var allMatches = [];
        angular.forEach(groups, function (value, key) {
            angular.forEach(value.Item.WebMatches, function (val, key) {
                angular.forEach(val,function(match){
                    match.group = value.Item.Name;
                    allMatches.push(match);
                });
            });
        });
        allMatches = $filter('orderBy')(allMatches, '-Date', true)
        var groupedMatches = [];
        angular.forEach(allMatches, function (value, key) {
            if (groupedMatches[groupedMatches.length - 1] && groupedMatches[groupedMatches.length - 1].Name === $filter('date')(value.Date, 'dd.MM.yyyy')) {
                groupedMatches[groupedMatches.length - 1].WebMatches[0].push(value);
            } else {
                 groupedMatches.push({
                    Name: $filter('date')(value.Date, 'dd.MM.yyyy'),
                    WebMatches: [[value]]
                });
            }
        });
        return groupedMatches;
    };
    var findInCol = function (col, id) {
        for (var i in col) {
            if (col[i][0].AwayTeam[0].id == id || col[i][0].HomeTeam[0].id == id) {
                return i;
            }
        }
    };
    return EuroCupService;
}]);