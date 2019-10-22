VBET5.filter('handicapBaseFormat',['Config', function(Config) {
    'use strict';

    return function(base, filterCondition, hideSign, showOrdered, homeScore, awayScore, type) {
        if (base === undefined) {
            return;
        }
        var value = parseFloat(base);
        var sign = value <= 0 ? '' : ( ('' + base).indexOf('+') > -1 ? '+' : '');
        if (Config.main.asian.homeAwayBaseRecalculationEnabled && homeScore !== undefined && awayScore !== undefined) {
            var delta = homeScore - awayScore;
            switch (type) {
                case "Home":
                    value += delta;
                    break;
                case "Away":
                    value -= delta;
                    break;
            }
        }

        if (Config.main.fractionalBaseFormat && (filterCondition || filterCondition === undefined)) {
            sign = value < 0 ? '-' : ''; // There might be some error here. Most likely the correct sign calculations are value <= 0 ? '' : (base.indexOf('+') > -1 ? '+' : '');

            if ((value / 0.25) % 2 === 0) {
                return hideSign ? Math.abs(value) : value;
            }

            if (showOrdered) {
                var value1 =  Math.abs(value - 0.25);
                var value2 = Math.abs(value + 0.25);
                var result;
                if (value1 <= value2) {
                    result = value1 + ' / ' + value2;
                } else {
                    result = value2 + ' / ' + value1;
                }
                return hideSign ? result : sign + result;
            }

            return (value - 0.25) + ' / ' + Math.abs((value + 0.25));
        }

        return hideSign ? Math.abs(value) : sign + value;
    };
}]);
