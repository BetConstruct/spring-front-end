VBET5.directive('additionalGameInfo', ['$rootScope', 'GameInfo', 'Config', 'Translator', function ($rootScope, GameInfo, Config, Translator) {
    "use strict";

    return {
        restrict: "A",
        scope: {
            game: "="
        },
        link: function (scope) {
            var whitSpace = ' ';
            var isRtl = Config.main.availableLanguages[$rootScope.env.lang].rtl;
            var comma = isRtl? '،':',';
            var firstIndex = isRtl ? 2 : 1;
            var secondIndex = firstIndex === 1 ? 2 : 1;
            var star = "*";

            function createAdditionalTextInfo(game) {
                if (!game.info || game && game.sport && (game.sport.alias === 'BasketballShots' || game.sport.alias === 'Archery')) {
                    return game.text_info || '';
                }

                var result = [];

                var scoresArray = GameInfo.framesCount(game.stats);
                if (game.info && game.info.score1 && game.info.score2 && (game.info.current_leg === undefined || game.info.set_count !== 1) ) {
                    result.push(game.info['score' + firstIndex] + whitSpace + ":" + whitSpace + game.info['score' + secondIndex]);
                }
                var scoresLength = scoresArray.length;
                var stats = game.stats;
                var prefix = '';
                var suffix = '';
                if (game.info.set_count !== 1 || game.info.current_leg === undefined) {
                    prefix = '(';
                    suffix = ')';
                }
                for (var i = 0; i < scoresLength; ++i) {
                    if (result.length > 0) {
                        result.push(comma, whitSpace);
                    }
                    var key = 'score_set' + scoresArray[i];
                    var score = stats[key]['team$1_value'.replace('$1', firstIndex)] + ':' + stats[key][['team$1_value'.replace('$1', secondIndex)]];
                    result.push(prefix+ score + suffix);
                }
                if (game.info.current_game_state === 'notstarted' && game.info.current_game_time == 0) {
                    result = [Translator.get('notstarted')];
                } else if (game.info.current_game_time) {
                    result.push(whitSpace);
                    var endTime = "";
                    if (game.info.add_minutes && game.info.add_minutes !== '0') {
                        endTime = '+' + game.info.add_minutes;
                    }
                    if (game.info.current_game_time.indexOf(':') === -1) {
                       endTime += '`';
                    }
                    result.push(game.info.current_game_time + endTime);


                }
                if (game.sport.alias === 'Tennis' || game.sport.alias === 'ETennis') {
                    result.push(whitSpace);
                   var passes =  stats.passes;
                   var passTeamIndex = game.info.pass_team === 'team1'? 1: 2;
                   result.push(passes.team1_value);
                   if (passTeamIndex === 1) {
                       result.push(star);
                   }
                   result.push(":");
                   result.push(passes.team2_value);
                   if (passTeamIndex === 2) {
                        result.push(star);
                    }
                }

                if (isRtl) {
                    return result.reverse().join('');
                }

                return result.join('');
            }
           if (scope.game && (!Config.main.disableITFGamesInfo || !scope.game.is_itf)) {
               scope.$watch('game', function (newValue) {
                   if (newValue) {
                       scope.$parent.additionalInfo = createAdditionalTextInfo(newValue);
                   }
               }, true);
           }
        }
    };
}
]);
