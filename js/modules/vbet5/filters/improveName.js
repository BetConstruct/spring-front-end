/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:improveName
 * @description makes replacement in provided string using information from provided game
 * e.g. replaces "Team 1" with actual team name from game.team1_name
 *
 */
VBET5.filter('improveName', ['Config', function (Config) {
    'use strict';
    var cache = {},
        replacements = {
            'eng': {
                'Player 1': 'team1_name',
                'Player 2': 'team2_name',
                'player 1': 'team1_name',
                'player 2': 'team2_name',
                'Team 1': 'team1_name',
                'team 1': 'team1_name',
                'Team 2': 'team2_name',
                'team 2': 'team2_name',
                'W1': 'team1_name',
                'W2': 'team2_name',
                'W 1': 'team1_name',
                'W 2': 'team2_name',
                'Team1': 'team1_name',
                'Team2': 'team2_name',
                'Home': 'team1_name',
                'Away': 'team2_name'
            },
            'rus': {
                'Ком. 1': 'team1_name',
                'Ком1': 'team1_name',
                'Ком. 2': 'team2_name',
                'Ком2': 'team2_name',
                'П1': 'team1_name',
                'П2': 'team2_name',
                'W1': 'team1_name',
                'W2': 'team2_name',
                'Home': 'team1_name',
                'Away': 'team2_name',
                'Игрок 1': 'team1_name',
                'Игрок 2': 'team2_name'
            },
            'arm': {
                'Թիմ 1': 'team1_name',
                'Թիմ 2': 'team2_name',
                'Հ1': 'team1_name',
                'Հ2': 'team2_name'
            },
            'tur': {
                'G1': 'team1_name',
                'G2': 'team2_name',
                'Home': 'team1_name',
                'Away': 'team2_name',
                'Ev Sahibi': 'team1_name',
                'Deplasman': 'team2_name'
            },
            'chi': {
                '第 1 隊': 'team1_name',
                '第 2 隊': 'team2_name',
                'W1': 'team1_name',
                'W2': 'team2_name',
                '主場 ': 'team1_name',
                '客場 ': 'team2_name',
                '主場': 'team1_name',
                '客場': 'team2_name',
                'Team1': 'team1_name',
                'Team2': 'team2_name',
                'Team 1': 'team1_name',
                'Team 2': 'team2_name',
                'Home ': 'team1_name',
                'Away ': 'team2_name',
                '選手1': 'team1_name',
                '選手2': 'team2_name',
                '球員 1': 'team1_name',
                '球員 2': 'team2_name',
                '主隊': 'team1_name',
                '客隊': 'team2_name'
            },
            'zhh': {
                '选手1': 'team1_name',
                '选手2': 'team2_name',
                'W1': 'team1_name',
                'W2': 'team2_name',
                '主队 ': 'team1_name',
                '客队 ': 'team2_name',
                '主队': 'team1_name',
                '客队': 'team2_name',
                'Team1': 'team1_name',
                'Team2': 'team2_name',
                'Team 1': 'team1_name',
                'Team 2': 'team2_name',
                'Home ': 'team1_name',
                'Away ': 'team2_name',
                '选手 1': 'team1_name',
                '选手 2': 'team2_name',
                '球队1': 'team1_name',
                '球队2': 'team2_name',
                '球队 1': 'team1_name',
                '球队 2': 'team2_name'
            },
            'jpn': {
                'プレーヤー1': 'team1_name',
                'プレーヤー2': 'team2_name'
            },
            'kor': {
                '선수 1': 'team1_name',
                '선수 2': 'team2_name',
                'Home': 'team1_name',
                'Away': 'team2_name'
            },
            'spa': {
                'Jugador 1': 'team1_name',
                'Jugador 2': 'team2_name'
            },
            'ger': {
                'Spieler 1': 'team1_name',
                'Spieler 2': 'team2_name'
            },
            'fre': {
                'Joueur 1': 'team1_name',
                'Joueur 2': 'team2_name'
            }
        },
        exactReplacements = {
//            '1' : 'team1_name',
            ' 1': 'team1_name',
            '1 ': 'team1_name',
//            '2' : 'team2_name',
            '2 ': 'team2_name',
            ' 2': 'team2_name'
        },
        notToReplace = {
            'First Home Run Of Game Will Be': 'First Home Run Of Game Will Be',
            'Solo Home Run': 'Solo Home Run',
            '2-run Home Run': '2-run Home Run',
            '3-run Home Run': '3-run Home Run',
            'No Home Run Scored': 'No Home Run Scored'
        };

    if (Config.env.lang && Config.env.lang !== 'eng' && replacements[Config.env.lang]) {
        angular.forEach(replacements.eng, function (value, key) {
            if (!replacements[Config.env.lang][key]) {
                replacements[Config.env.lang][key] = value;
            }
        });
    }

    return function (rawName, game) {
        if (!rawName) {
            return;
        }
        if (notToReplace[rawName]) {
            return rawName;
        }
        var cacheKey = rawName + (game && (game.id || ''));
        if (cache[cacheKey] === undefined) {
            cache[cacheKey] = rawName;
            var lang = replacements[Config.env.lang] === undefined ? 'eng' : Config.env.lang;
            if (exactReplacements[cache[cacheKey]]) {
                cache[cacheKey] = game[exactReplacements[cache[cacheKey]]];
            } else if (replacements[lang]) {
                angular.forEach(replacements[lang], function (fieldName, term) {
                    if (game && game[fieldName]) {
                        while ((game[fieldName].lastIndexOf(term) === -1) && (cache[cacheKey] != cache[cacheKey].replace(term, game[fieldName] + ' '))) {
                            cache[cacheKey] = cache[cacheKey].replace(term, game[fieldName] + ' ');
                        }
                    }
                });

            }
        }
        return cache[cacheKey];
    };
}]);