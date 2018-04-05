/**
 * @ngdoc property
 * @name vbet5.constant:AsianMarkets
 * @description Asian market config
 */
angular.module('vbet5').constant('AsianMarkets', {
    Soccer: [
        {key: 'HDP', name: 'HDP & OU'},
        {key: 'MODDS', name: 'FT & HT 1X2'},
        {key: 'FHTCS', name: 'FT & HT Correct Score'},
        {key: 'FHTOE', name: 'FT & HT Odd/Even'},
        {key: 'FHTG', name: 'FT & HT Total Goal'},
        {key: 'HTFT', name: 'HT/FT'},
        {key: 'FLG', name: 'First/Last Goal'},
        {key: 'FTDC', name: 'FT & HT Double Chance'},
        {key: 'OUR', name: 'Outright'}
    ],
    OTHER: [{key: 'HDP', name: 'HDP & OU'}, {key: 'OUR', name: 'Outright'}],
    ignoreMainOrderFor: {
        'WINNER': true,
        'ODD/EVEN': true,
        'CORNERWINNER': true,
        'CORNERHANDICAP': true,
        'CORNERODD/EVEN': true
    },
    marketsBySportGms: {
        Soccer: {
            HDP: ['ODD/EVEN', 'WINNER', 'HANDICAP', 'TOTALS'],
           // HDP: ['WINNER', 'HANDICAP', 'TOTALS'],
            MODDS: ['WINNER'],
            FHTCS: ['CORRECT SCORE'],
           // FHTOE: ['ODD/EVEN'],
            FHTG: ['GOALGROUP'],
            HTFT: ['HALFTIME/FULLTIME'],
            FLG: ['FIRST GOAL', 'LAST GOAL'],
            FTDC: ['DOUBLE CHANCE'],
            OUR: ['OUTRIGHT']
        },
        All: {
            HDP: ['ODD/EVEN', 'WINNER', 'HANDICAP', 'CORNERWINNER', 'CORNERHANDICAP', 'CORNERTOTALS', 'CORNERODD/EVEN', 'TOTALS']
        },
        'Default': {
            HDP: ['ODD/EVEN', 'WINNER', 'HANDICAP', 'TOTALS'],
            //HDP: ['WINNER', 'HANDICAP', 'TOTALS'],
            OUR: ['OUTRIGHT']
        }
    },
    marketsBySportBazalt: {
        Soccer: {
            HDP: ['WINNER', 'HANDICAP', 'GOALS'],
            MODDS: ['WINNER'],
            FHTCS: ['CORRECTSCORE'],
            FHTOE: ['ODDEVEN'],
            FHTG: ['GOALGROUP'],
            HTFT: ['HTFT'],
            FLG: ['FGLG'],
            FTDC: ['DOUBLECHANCE'],
            OUR: ['OUTRIGHT']
        },
        Tennis: {
            HDP: ['WINNER', 'HANDICAP', 'GAMES'],
            OUR: ['OUTRIGHT']
        },
        Basketball: {
            HDP: ['WINNER', 'HANDICAP', 'POINTS'],
            OUR: ['OUTRIGHT']
        },
        Volleyball: {
            HDP: ['WINNER', 'HANDICAP', 'POINTS'],
            OUR: ['OUTRIGHT']
        },
        IceHockey: {
            HDP: ['WINNER', 'HANDICAP', 'GOALS'],
            OUR: ['OUTRIGHT']
        },
        Baseball: {
            HDP: ['WINNER', 'HANDICAP', 'RUNS'],
            OUR: ['OUTRIGHT']
        },
        Handball: {
            HDP: ['WINNER', 'HANDICAP', 'GOALS'],
            OUR: ['OUTRIGHT']
        },
        BeachVolleyball: {
            HDP: ['WINNER', 'HANDICAP', 'POINTS'],
            OUR: ['OUTRIGHT']
        },
        Boxing: {
            HDP: ['WINNER', 'HANDICAP', 'ROUNDS'],
            OUR: ['OUTRIGHT']
        },
        WaterPolo: {
            HDP: ['WINNER', 'HANDICAP', 'GOALS'],
            OUR: ['OUTRIGHT']
        },
        TableTennis: {
            HDP: ['WINNER', 'HANDICAP', 'POINTS'],
            OUR: ['OUTRIGHT']
        },
        Badminton: {
            HDP: ['WINNER', 'HANDICAP', 'POINTS'],
            OUR: ['OUTRIGHT']
        },
        AmericanFootball: {
            HDP: ['WINNER', 'HANDICAP', 'POINTS'],
            OUR: ['OUTRIGHT']
        },
        Golf: {
            HDP: ['WINNER', 'HANDICAP', 'HOLES'],
            OUR: ['OUTRIGHT']
        },
        Darts: {
            HDP: ['WINNER', 'HANDICAP', 'LEGS'],
            OUR: ['OUTRIGHT']
        },
        Cricket: {
            HDP: ['WINNER', 'HANDICAP', 'RUNS'],
            OUR: ['OUTRIGHT']
        },
        Rugby: {
            HDP: ['WINNER', 'HANDICAP', 'POINTS'],
            OUR: ['OUTRIGHT']
        },
        'Electronic sports': {
            HDP: ['WINNER', 'HANDICAP', 'POINTS'],
            OUR: ['OUTRIGHT']
        },
        'Default': {
            HDP: ['WINNER', 'HANDICAP', 'POINTS'],
            OUR: ['OUTRIGHT']
        }
    },
    sequenceNames: {
        '90MINS': '90 mins',
        '1STHALF': '1H',
        '1HALF': '1H',
        '2NDHALF': '2H',
        '4QUARTER': '4Q',
        '3QUARTER': '3Q',
        '2QUARTER': '2Q',
        '1QUARTER': '1Q',
        '2HALF': '2H',
        'MATCH': 'Match',
        '5SET': 'Set 5',
        '4SET': 'Set 4',
        '3SET': 'Set 3',
        '2SET': 'Set 2',
        '1SET': 'Set 1'
    },
    totalTypeNameBySport: {
        Soccer: "Total Goals",
        Tennis: "Total Games",
        Basketball: "Total Points",
        Volleyball: "Total Points",
        IceHockey: "Total Goals",
        Baseball: "Total Runs",
        Handball: "Total Goals",
        BeachVolleyball: "Total Points",
        Boxing: "Total Rounds",
        WaterPolo: "Total Goals",
        TableTennis: "Total Points",
        Badminton: "Total Points",
        AmericanFootball: "Total Points",
        Golf: "Total Holes",
        Darts: "Total Legs",
        Cricket: "Total Runs",
        Rugby: "Total Points",
        'Electronic sports': "Total Points",
        'Default': "Total Points"
    },
    periodsBySports:{
        'Soccer': "Half",
        'CyberFootball': 'Half',
        'Socceradditional_time': 'Additional Time',
        'Soccerpenalty': "Penalty",
        'Soccerfinished': 'Finished',
        'Boxing': "Round",
        'Tennis': "Set",
        'IceHockey': "Period",
        'EBasketball': "Quarter",
        'Basketball': "Quarter",
        'Volleyball': "Set",
        'Handball': "Half",
        'Baseball': "Inning",
        'BeachVolleyball': "Set",
        'BeachSoccer': "Period",
        'Rugby': "Time",
        'Snooker': "Frame",
        'AmericanFootball': "Quarter",
        'AustralianFootball': "Quarter",
        'WaterPolo': "Period",
        'MiniSoccer': "Time",
        'BallHockey': "Period",
        'TableTennis': "Set",
        'Badminton': "Game",
        'Squash': "Game",
        'Netball': "Quarter",
        'Dota': "Game",
        'Dota2': "Game",
        'CounterStrike': "Map",
        'Hearthstone': "Game",
        'LeagueOfLegendsset': "Game",
        'StarCraft': "Map",
        'set': "Set",
        'RugbySevens': "Half",
        'RugbyLeague': "Half",
        'RugbyUnion': "Half"

    }
});
