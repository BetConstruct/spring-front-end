angular.module('vbet5.betting').controller('euroCompetitionCtrl', ['$scope', '$rootScope', '$http', '$location', 'EuroCupService', 'NgMap', '$filter', function ($scope, $rootScope, $http, $location, EuroCupService, NgMap, $filter) {
    'use strict';
    var competitionId = 1855;
    //euro real stId
    var playOffStId = 13732;
    //mockup id
    //var playOffStId = 11990;
    // var ltStId = 811;
    var ltStId = 13727;
    var round = 0; //last lt
    var date_order = "asc";
    var BeginDate = "2016-06-10T00:00:00";
    var EndDate = "2016-07-12T00:00:00";
    $scope.now = new Date();
    $scope.marginedTime = new Date();
    $scope.marginedTime.setHours($scope.now.getHours() - 2);

    /*
    * 1) matchDate > now -> prematch
    * 2) matchdDate < now && matchDate > = now - 2 ->live
    * 3) now-2 > matchDate
    * */

    NgMap.getMap();
    $scope.showMap = function (id) {
        EuroCupService.GetStadiumById(id).then(function (data) {
            $scope.map = data;
        });
    };

    $scope.closeMap = function () {
        $scope.map = [];
    };

    $scope.betting = {
        typePrematch: 0,
        typeLive: 1,
        sport: 1,
        competition: 1855,
        region: 2001
    };
    //betting url in
    //ng-click="openStatistics(prematchGame);$event.stopPropagation();"
    $scope.tabs = ["MATCHES", "STANDINGS", "PLAY-OFFS", "TEAMS"];
    $scope.changeTab = function changeTab(tab) {
        switch (tab) {
            case 0:
            case 1:
                if (!$scope.groups) {
                    $scope.loading = true;
                    getGroupStageData();
                }
                break;
            case 2:
                if (!$scope.playOff) {
                    $scope.loading = true;
                    getPlayOff();
                }
                break;
            case 3:
                getTeamListWithMembers();
                break;
            default:
                tab = 1;
                if (!$scope.groups) {
                    $scope.loading = true;
                    getGroupStageData();
                }
                break;
        }

        $scope.currentTab = tab;
        $location.search('tabId', $scope.currentTab);
    };

    $scope.changeTab(+$location.search().tabId);   //Set default tab
    /*
     * by group = 0
     * by date = 1
     * */
    $scope.matchOrder = 0;
    $scope.setOrder = function (order) {
        initExpandedTabs();
        $scope.matchOrder = order;
        if ($scope.matchOrder === 1) {
            $scope.dateOrderedMatches = $scope.dateOrderedMatches || EuroCupService.dateOrder($scope.groups);
        }
    };
    $scope.expandTeam = function(id,name){
        $scope.activeTeam = {'Id':id,'Name':name};
        $scope.currentTab = 3;
        getTeamListWithMembers();
        $location.search('tabId', $scope.currentTab );
    };
    function initExpandedTabs() {
        $scope.matchExbandedBlock = [true]; //opened first block
    }

    initExpandedTabs();

    $scope.expandBlock = function (index) {
        $scope.matchExbandedBlock[index] = !$scope.matchExbandedBlock[index];
    };

    function getGroupStageData() {
        EuroCupService.getLeagueTablesByParentSeazon(competitionId, ltStId, round).then(function (data) {
            $scope.groups = data;
            angular.forEach($scope.groups, function (value) {
                EuroCupService.getMatches(competitionId, value.Item.Id, date_order).then(function successCallback(response) {
                    value.Item.WebMatches.push(addConvertedDate(response));
                    value.Item.tokenized = getTokenizedMatches(response);
                });
            });
            $scope.loading = false;
        });
    }

    function getPlayOff() {
        EuroCupService.getPlayOff(playOffStId).then(function successCallback(response) {
            $scope.columns = [{class: "column-1-8-b", count: 8},
                {class: "column-1-4-b", count: 4},
                {class: "column-1-2-b", count: 2},
                {class: "", count: 1}];
            var columns = [];
            var sibling = [];
            angular.forEach(response, function (value, key) {
                if (value.Item.WebMatches === undefined || value.Item.WebMatches.length === 0) {
                    value.Item.WebMatches = addEmptyMatches(key);
                    if ($scope.columns.length == key + 1) {
                        sibling = addEmptyMatches(key);
                    }
                }
                //3 place game
                if (value.Children.length > 0) {
                    angular.forEach(value.Children, function (childVal, k) {
                        sibling.push({
                            'Name': childVal.Item.Name,
                            'Series': childVal.Item.WebMatches
                        });
                    });
                }
                columns.push({
                    'Name': value.Item.Name,
                    'Matches': value.Item.WebMatches,
                    'Sibling': sibling
                });
                sibling = [];
            });
            $scope.playOff = EuroCupService.groupPlayoff(columns);
            $scope.loading = false;
        });
    }

    function getTeamListWithMembers() {
        EuroCupService.getTeamList(ltStId, competitionId).then(function successCallback(response) {
            $scope.teamList = response;
            $scope.activeTeam = $scope.activeTeam || $scope.teamList[0];
            getTeamMembers();
            $scope.loading = false;
        });
    }

    $scope.changeTeam = function (team) {
        $scope.activeTeam = team;
        getTeamMembers();
    };
    $scope.getPlayer = function (playerId) {
        EuroCupService.GetPlayerById(BeginDate, EndDate, $scope.activeTeam.Id, playerId).then(function successCallback(response) {
            $scope.selectedPlayer = response;
        });
    };

    $scope.closePlayerPopup = function () {
        $scope.selectedPlayer = false;
    };

    function getTeamMembers() {
        EuroCupService.getTeamWithDetail(BeginDate, EndDate, $scope.activeTeam.Id).then(function successCallback(response) {
            $scope.teamMembers = response.TeamMembers;
        });
    }

    function getTokenizedMatches(matches) {
        var data = [];
        var token = '';
        angular.forEach(matches, function (value) {
            token = (value.HomeTeam[0].id || 0 ) + '_' + (value.AwayTeam[0].id || 0);
            data[token] = value;
        });
        return data;
    }
    function addConvertedDate(arr){
        angular.forEach(arr, function (value,key) {
             arr[key].DateConverted = $filter('date')(new Date(value.Date),'dd.MM.yyyy HH:mm');
             arr[key].DateObject = new Date(value.Date);
        });
        return arr;
    }

    function addEmptyMatches(key) {
        var count = $scope.columns[key].count;
        var arr = [];
        for (var i = 0; i < count; i++) {
            arr.push([]);
        }
        return arr;
    }
}]);
