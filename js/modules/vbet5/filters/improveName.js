/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:improveName
 * @description makes replacement in provided string using information from provided game
 * e.g. replaces "Team 1" with actual team name from game.team1_name
 *
 */
VBET5.filter('improveName', [function () {
    'use strict';
    var cache = {};

    var REPLACEMENTS = {
        "Player 1": "team1_name",
        "Player 2": "team2_name",
        "player 1": "team1_name",
        "player 2": "team2_name",
        "Team 1": "team1_name",
        "team 1": "team1_name",
        "Team 2": "team2_name",
        "team 2": "team2_name",
        team1: "team1_name",
        team2: "team2_name",
        W1: "team1_name",
        W2: "team2_name",
        "W 1": "team1_name",
        "W 2": "team2_name",
        Team1: "team1_name",
        Team2: "team2_name",
        Home: "team1_name",
        Away: "team2_name",
        "Ком. 1": "team1_name",
        Ком1: "team1_name",
        "Ком. 2": "team2_name",
        Ком2: "team2_name",
        П1: "team1_name",
        П2: "team2_name",
        "Игрок 1": "team1_name",
        "Игрок 2": "team2_name",
        "Թիմ 1": "team1_name",
        "Թիմ 2": "team2_name",
        Հ1: "team1_name",
        Հ2: "team2_name",
        G1: "team1_name",
        G2: "team2_name",
        "Ev Sahibi": "team1_name",
        Deplasman: "team2_name",
        "第 1 隊": "team1_name",
        "第 2 隊": "team2_name",
        "主場 ": "team1_name",
        "客場 ": "team2_name",
        主場: "team1_name",
        客場: "team2_name",
        "Home ": "team1_name",
        "Away ": "team2_name",
        選手1: "team1_name",
        選手2: "team2_name",
        "球員 1": "team1_name",
        "球員 2": "team2_name",
        主隊: "team1_name",
        客隊: "team2_name",
        选手1: "team1_name",
        选手2: "team2_name",
        "主队 ": "team1_name",
        "客队 ": "team2_name",
        主队: "team1_name",
        客队: "team2_name",
        "选手 1": "team1_name",
        "选手 2": "team2_name",
        球队1: "team1_name",
        球队2: "team2_name",
        "球队 1": "team1_name",
        "球队 2": "team2_name",
        プレーヤー1: "team1_name",
        プレーヤー2: "team2_name",
        "선수 1": "team1_name",
        "선수 2": "team2_name",
        "Jugador 1": "team1_name",
        "Jugador 2": "team2_name",
        "jugador 1": "team1_name",
        "jugador 2": "team2_name",
        "Spieler 1": "team1_name",
        "Spieler 2": "team2_name",
        S1: "team1_name",
        S2: "team2_name",
        "Joueur 1": "team1_name",
        "Joueur 2": "team2_name"
    };

    var DISABLED_KEYS = {
        'First Home Run Of Game Will Be': 1,
        'Solo Home Run': 1,
        '2-run Home Run': 1,
        '3-run Home Run': 1,
        'No Home Run Scored': 1
    };

    var re = new RegExp(Object.keys(REPLACEMENTS).join("|"), "gi");

    return function (rawName, game) {
        if (!rawName || DISABLED_KEYS[rawName]) {
            return rawName;
        }

        var cacheKey = rawName + game.id;
        if (cache[cacheKey] === undefined) {
            cache[cacheKey] = rawName.replace(re, function(matched) {
                return game[REPLACEMENTS[matched]];
            });
        }
        return cache[cacheKey];
    };
}]);
