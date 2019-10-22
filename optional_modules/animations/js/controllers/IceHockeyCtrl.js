/* global VBET5 */
/**
 * @ngdoc controller
 * @name VBET5.controller:IceHockeyCtrl
 * @description

 */
VBET5.controller('IceHockeyCtrl', ['$rootScope', '$scope', 'iceHockeyAnimation', 'Translator', '$filter', 'numConstants', function ($rootScope, $scope, iceHockeyAnimation, Translator, $filter, numConstants) {
    'use strict';

    var swarmConstants = {
        'Goal': numConstants.Goal,
        // 'Period':numConstants.PeriodStart,// 373,
        'Finished':numConstants.EndGame,
        'TimerStatus':numConstants.TimerStarted,
        'Suspension':numConstants.Suspension,
        'SuspensionOver':numConstants.SuspensionOver,
        'FirstPeriod':numConstants.PeriodStart,
        'FirstPeriodEnded':numConstants.PeriodEnd,
        'SecondPeriod':numConstants.PeriodStart,
        'SecondPeriodEnded':numConstants.PeriodEnd,
        'ThirdPeriod':numConstants.PeriodStart,
        'ThirdPeriodEnded':numConstants.PeriodEnd
    };

    $scope.$watch('openGame', function () {
        iceHockeyAnimation.startAnimate();
    });


    $scope.animateReady = function () {
        iceHockeyAnimation.startAnimate();
    };

    /*testing*/
    // var index = 0;
    // iceHockeyAnimation.startAnimate();
    //
    // var test = function test() {
    //     console.log('****************',index);
    //     var id = Object.values(swarmConstants)[index];
    //     if (id) {
    //         var new_event = $scope.openGame.last_event;
    //         var team_name = new_event.side == 1 ? $scope.openGame.team1_name : $scope.openGame.team2_name;
    //         var team = new_event.side;
    //         var event_value = new_event.event_value;
    //         var name = Translator.get(new_event.type);
    //         iceHockeyAnimation.animate(id, team_name, team_name , team, event_value, name, teamName, $scope.counts || 3);
    //
    //     }
    //     if(index <= Object.values(
    // ).length + 1){
    //         index++;
    //         setTimeout(test, 2000);
    //     }
    // };
    //
    // test();
    // return;
    /*end testing*/

    $scope.$watch('openGame.last_event.time_utc', function () {
        var new_event = $scope.openGame.last_event;
        var team = $filter('rtlConvert')(new_event, 'side');
        var team_name = team === '1' ? $scope.openGame.team1_name : $scope.openGame.team2_name;
        var event_value = new_event.event_value;
        var name = Translator.get(new_event.type);
        iceHockeyAnimation.animate(swarmConstants[new_event.type], team_name, team, event_value, null, null, name);

    });

}]);