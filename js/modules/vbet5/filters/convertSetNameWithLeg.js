/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:convertSetName
 * @description changes set name according to sport type
 *
 */
VBET5.filter('convertSetNameWithLeg', function () {
    'use strict';
    var replacements = {

        "set1": "Set 1",
        "set2": "Set 2",
        "set3": "Set 3",
        "set4": "Set 4",
        "set5": "Set 5",
        "set6": "Set 6",
        "set7": "Set 7",
        "set8": "Set 8",
        "set9": "Set 9",
        "set10": "Set 10",
        "set11": "Set 11",
        "set12": "Set 12",
        "set13": "Set 13"
    };
    return function (rawName, info ) {
        if (info.set_count === 1) {
            return 'Leg ' + info.current_leg;
        } else {
            if (replacements[rawName]) {
                return replacements[rawName] + ": Leg " + info.current_leg;
            }
        }
        return rawName;
    };
});

