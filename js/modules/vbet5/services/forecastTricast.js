/* global VBET5, JSON */

/**
 * @ngdoc service
 * @name vbet5.service:forecastTricast
 */
VBET5.factory('forecastTricast', ['$rootScope', function forecastTricastService($rootScope) {
    'use strict';

    var container = {};

    container.init = function init(scope) {
       var $scope = scope;

        function filterItems(items, rowIndex, colIndex) {
            return items.filter(function (item) {
                return item.row !== rowIndex || item.col !== colIndex;
            });
        }

        function filterColumn(items, colIndex) {
            return items.filter(function (item) {
                return item.col === colIndex;
            });
        }
        function checkIsExist(index, type) {
            return scope.racingData.selectedItems.filter(function (item) {
                return item[type] === index;
            }).length > 0;
        }



        function fillRowAndColumn(rowIndex, colIndex, rowCount, colCount, value) {

            if (value === 0){ //if not selected select
                scope.racingData.selectedItems.push({row: rowIndex, col: colIndex, event: $scope.getEvent(rowIndex)});
            } else {
                scope.racingData.selectedItems = filterItems(scope.racingData.selectedItems, rowIndex, colIndex); // remove selected item with rowIndex and colIndex
            }
            for(var i = 0; i < colCount; i++) {
                if (i !== colIndex && (value === 0 || !checkIsExist(i, 'col'))) {
                    $scope.racingData.selectionStatusMap[rowIndex + '-' + i] = value;
                }
            }
            for(var j = 0; j < rowCount; j++) {
                if (j !== rowIndex && (value === 0 || !checkIsExist(j, 'row'))) {
                    $scope.racingData.selectionStatusMap[j + '-' + colIndex] = value;
                }
            }

            $scope.racingData.selectionStatusMap[rowIndex + '-' + colIndex] = value === 0? 1: undefined;
        }

        function fillOtherColumns(rowCount, colCount, value) {
            for (var i = 0; i < rowCount; ++i) {
                for (var j = 0; j < colCount; ++j) {
                    $scope.racingData.selectionStatusMap[i + '-' + j] = value;
                }
            }
        }

        function enableColumnOtherRows(rowCount, colIndex, rowIndex) {
            for (var i = 0; i < rowCount; ++i) {
                if(i !== rowIndex && $scope.racingData.selectionStatusMap[i + '-' + colIndex] === 0) {
                    $scope.racingData.selectionStatusMap[i + '-' + colIndex] = undefined;
                }
            }
        }

        $scope.selectRacingItem = function selectRacingItem(rowIndex, colIndex) {
            var rowCount = $scope.getItemsCount();
            var colCount = $scope.racingData.columns.length;
            var currentStatus = $scope.racingData.selectionStatusMap[rowIndex + '-' + colIndex];
            var lastIndex = colCount - 1;
            if (currentStatus === 0) { //if disabled return
                return;
            }

            if (colIndex < lastIndex) { //handle not any column case
                fillRowAndColumn(rowIndex, colIndex, rowCount, colCount, (currentStatus === 1? undefined: 0));
                return;
            }
            if (currentStatus === undefined) {
                //select any column
                fillOtherColumns(rowCount, lastIndex, 0); //disable other columns
                $scope.racingData.selectionStatusMap[rowIndex + '-' + colIndex] = 1;
                scope.racingData.selectedItems = filterColumn($scope.racingData.selectedItems, lastIndex); // filter other column selected items
                scope.racingData.selectedItems.push({row: rowIndex, col: colIndex, event: $scope.getEvent(rowIndex)});
                enableColumnOtherRows(rowCount, lastIndex, rowIndex); // if first time any selected enable other rows
                ++$scope.racingData.selectedAnyCount;
                return;
            }
            $scope.racingData.selectionStatusMap[rowIndex + '-' + colIndex] = undefined; //deselect any column
            scope.racingData.selectedItems = filterItems(scope.racingData.selectedItems, rowIndex, colIndex); //remove selected item with rowIndex and colIndex

            $scope.racingData.selectedAnyCount -= 1;
            if ($scope.racingData.selectedAnyCount === 0) { //check if removed all any items enable other columns
                fillOtherColumns(rowCount, lastIndex, undefined);
            }
        };

        $scope.resetRacingData = function resetRacingData() {
            $scope.racingData.selectionStatusMap = {};
            $scope.racingData.selectedItems = [];
            $scope.racingData.selectedAnyCount = 0;
        };

        $scope.openPopup = function openPopup(game, popupTag) {
            $scope.racingData.selectedItems.sort(function (item1, item2) {
                return item1.col - item2.col;
            });
            $rootScope.broadcast('globalDialogs.addDialog', {
                template: 'templates/popup/forecast-tricast-bet.html',
                type: 'template',
                title: 'Betslip',
                tag: popupTag,
                state: {
                    sportId: $scope.sportId,
                    selectedItems: $scope.racingData.selectedItems,
                    selectedAnyCount: $scope.racingData.selectedAnyCount,
                    type: $scope.selectedTab,
                    gameId: game.id,
                    start_ts: game.start_ts,
                    name: game.team1_name
                },
                hideButtons: true
            });
        };

        container.restoreSelectedRaces =  function restoreSelectedRaces() {
            //restore selected items when games are updated
            var selectedItems = scope.racingData.selectedItems;
            if (!selectedItems || !selectedItems.length) {
                return;
            }
            $scope.racingData.selectionStatusMap = {};
            $scope.racingData.selectedItems = [];
            $scope.racingData.selectedAnyCount = 0;
            selectedItems.forEach(function(item) {
                var rowIndex = $scope.getEventRowIndex(item.event);
                if (rowIndex !== undefined) {
                    $scope.selectRacingItem(rowIndex, item.col);
                }
            });
        };
    };

    return container;


}]);
