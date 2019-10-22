/* global VBET5 */
/**
 * @ngdoc controller
 * @name VBET5.controller:BasketBallCtrl
 * @description

 */
VBET5.controller('BasketBallCtrl', ['$rootScope', '$scope', 'basketballAnimation', 'Translator', '$filter', 'numConstants', function ($rootScope, $scope, basketballAnimation, Translator, $filter, numConstants) {
    'use strict';

    var swarmConstants = {
        'FirstQuarter': numConstants.QuarterStart,
        'FirstQuarterEnded': numConstants.QuarterEnd,
        'SecondQuarter': numConstants.QuarterStart,
        'SecondQuarterEnded': numConstants.QuarterEnd,
        'ThirdQuarter': numConstants.QuarterStart,
        'ThirdQuarterEnded': numConstants.QuarterEnd,
        'FourthQuarter': numConstants.QuarterStart,
        'FourthQuarterEnded': numConstants.QuarterEnd,
        'Overtime':numConstants.Overtime,
        'OvertimeEnded':numConstants.OvertimeEnd,
        'Foul': numConstants.Foul,
        'FreeThrow':numConstants.FreeThrows,
        'Free1Throw':numConstants.FreeThrows,
        'Free2Throws':numConstants.FreeThrows,
        'Free3Throws':numConstants.FreeThrows,
        'MissedFreeThrow':numConstants.FTMissed,
        'Attack':numConstants.Attack,
        'OnePoint':numConstants.OnePoint,
        'TwoPoints':numConstants.TwoPoint,
        'ThreePoints': numConstants.ThreePoint,
        'Timeout':numConstants.TimeoutStart,
        'Finished':numConstants.EndGame
    };

    $scope.$watch('openGame', function () {
        basketballAnimation.startAnimate();
    });


    $scope.animateReady = function () {
        basketballAnimation.startAnimate();
    };

    /*testing*/
        // var index = 0;
        // basketballAnimation.startAnimate();
        //
        // var test = function test() {
        //     console.log('****************',index);
        //     var id = Object.values(swarmConstants)[index];
        //     if (id) {
        //         basketballAnimation.animate(id, $scope.openGame.team1_name, null, 1, null, null, null, null);
        //         setTimeout(function () {
        //             basketballAnimation.animate(id, $scope.openGame.team2_name, null, 2, null, null, null, null);
        //         }, 2000);
        //     }
        //     if(index <= Object.values(swarmConstants).length + 1){
        //         index++;
        //         setTimeout(test, 4000);
        //     }
        //
        // };
        //
        // test();
    //return;
    /*end testing*/

    $scope.$watch('openGame.last_event.time_utc', function () {
        var new_event = $scope.openGame.last_event;
        var team = $filter('rtlConvert')(new_event, 'side');
        var team_name = team === '1' ? $scope.openGame.team1_name : $scope.openGame.team2_name;
        var event_value = new_event.event_value;
        var name = Translator.get(new_event.type);
        basketballAnimation.animate(swarmConstants[new_event.type], team_name, null, team, null, name, event_value, name);
    });

}]);