/**
 * Created by arman on 8/25/15.
 */
angular.module('exchange').service('exchange', [ '$rootScope', 'Zergling', function ( $rootScope, Zergling) {

    var Exchange = {};
    // $rootScope.$on('RouteChange', function (events, args) {

    // //    console.log(events,args,"market");
    //     //game(args.gameId);

    // });
     Exchange.getGames = function () {

      return  "sd";
     };

    Exchange.getSportList = function () {

        var request = {
            'source': 'betting',
            'what': {
                'sport': ['id', 'name', 'alias', 'order', 'active'],
                'game': '@count'
            },
            where: {
                "game": {"is_fair": 1, "is_started": 0}
            }
        };

        var gameCount = function (sports) {
            var gamesCount = 0;
            var sportCount = 0;
            for (var sport in sports) {
                gamesCount += sports[sport].game;
                sportCount++;
            }
            if (!$scope.sports.gamesCount) {
                $scope.gamesCount = gamesCount;
                $scope.sportCount = sportCount
            }
            // console.log($scope.sports.length);

        };
        Zergling.get(request)
            .then(function (result) {
                if (result) {
                    $scope.sports = result.data.sport;
                    gameCount($scope.sports);
                }
            })['catch'](function (reason) {
            console.log('Error:', reason);
        });


    };

    //console.log("exchange factory");

    return Exchange;

}]);
