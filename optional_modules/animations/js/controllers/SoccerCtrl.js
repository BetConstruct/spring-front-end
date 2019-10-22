VBET5.controller('SoccerCtrl', ['$rootScope', '$scope', 'soccerAnimation', 'Translator', '$filter', 'numConstants', function ($rootScope, $scope, soccerAnimation, Translator, $filter, numConstants) {
    'use strict';
    var teamName = [$scope.openGame.team1_name, $scope.openGame.team2_name];

    var swarmConstants = {
        'Attack': numConstants.Attack,
        'BallSafe': numConstants.BallSafe,
        'Corner': numConstants.Corner,
        'DangerousAttack': numConstants.DangAttack,
        'ExtraTimeFirstHalf': '',
        'ExtraTimeHalfTime': '',
        'ExtraTimeSecondHalf': '',
        'Finished': numConstants.EndGame,
        'FirstHalf': '',
        'FreeKick': numConstants.FreeKick,
        'Goal': numConstants.Goal,
        'GoalKick': numConstants.GoalKick,
        'HalfTime': numConstants.HalfStart,
        'NotStarted': numConstants.NotStarted,
        'Offside': numConstants.Offside,
        'Penalty': numConstants.Penalty,
        'PreExtraHalf': '',
        'RedCard': numConstants.RedCard,
        'SecondHalf': numConstants.HalfStop,
        'Substitution': numConstants.Substitution,
        'ThrowIn': numConstants.ThrowIn,
        'YellowCard': numConstants.YellowCard,
        'GoalkeeperSave': '',
        'ShotOffTarget': numConstants.ShotOff,
        'ShotOnTarget': numConstants.ShotOn
    };


    $scope.$watch('openGame', function () {
        soccerAnimation.startAnimate();
    });


    $scope.animateReady = function () {
        soccerAnimation.startAnimate();
    };

    /*testing*/
    // var index = 0;
    // soccerAnimation.startAnimate();
    //
    // var test = function test() {
    //     console.log('****************',index);
    //     var id = Object.values(swarmConstants)[index];
    //     if (id) {
    //         var new_event = $scope.openGame.last_event;
    //         var event_value = new_event.event_value;
    //         var name = Translator.get(new_event.type);
    //         soccerAnimation.animate(id, $scope.openGame.team1_name, '{"x":50,"y":0,"reason":"aaaa"}', 1, event_value, name, teamName, $scope.counts || 3);
    //
    //         setTimeout(function () {
    //             soccerAnimation.animate(id, $scope.openGame.team2_name, '{"x":50,"y":0,"reason":"aaaa"}', 2, event_value, name, teamName, $scope.counts || 3);
    //         }, 2000);
    //
    //     }
    //     if(index <= Object.values(swarmConstants).length + 1){
    //         index++;
    //         setTimeout(test, 4000);
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
        var throw_in = '{"x":50,"y":0,"reason":""}';

        if (swarmConstants[new_event.type] === numConstants.FreeKick || true) {
            throw_in = '{"x":50,"y":50,"reason":""}';
        }

        var event_value = new_event.event_value;
        var name = Translator.get(new_event.type);
        soccerAnimation.animate(swarmConstants[new_event.type], team_name, throw_in, team, event_value, name, teamName, null);

    });

}]);