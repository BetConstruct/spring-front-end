


(function(moment) {
    moment.fn.preciseDiff = function(d2) {
        return moment.preciseDiff(this, d2);
    };
    moment.preciseDiff = function(d1, d2) {
        var m1 = moment(d1), m2 = moment(d2);
        if (m1.isSame(m2)) {
            return '';
        }
        if (m1.isAfter(m2)) {
            var tmp = m1;
            m1 = m2;
            m2 = tmp;
        }

        var yDiff = m2.year() - m1.year();
        var mDiff = m2.month() - m1.month();
        var dDiff = m2.date() - m1.date();
        var hourDiff = m2.hour() - m1.hour();
        var minDiff = m2.minute() - m1.minute();
        var secDiff = m2.second() - m1.second();
        var msecDiff = m2.millisecond() - m1.millisecond();

        if (msecDiff < 0) {
            msecDiff = 1000 + msecDiff;
            secDiff--;
        }
        if (secDiff < 0) {
            secDiff = 60 + secDiff;
            minDiff--;
        }
        if (minDiff < 0) {
            minDiff = 60 + minDiff;
            hourDiff--;
        }
        if (hourDiff < 0) {
            hourDiff = 24 + hourDiff;
            dDiff--;
        }
        if (dDiff < 0) {
            var daysInLastFullMonth = moment(m2.year() + '-' + (m2.month() + 1), "YYYY-MM").subtract('months', 1).daysInMonth();
            if (daysInLastFullMonth < m1.date()) { // 31/01 -> 2/03
                dDiff = daysInLastFullMonth + dDiff + (m1.date() - daysInLastFullMonth);
            } else {
                dDiff = daysInLastFullMonth + dDiff;
            }
            mDiff--;
        }
        if (mDiff < 0) {
            mDiff = 12 + mDiff;
            yDiff--;
        }

        function pluralize(num) {
            return {value: num, plural: num > 1};
        }
        var result = {};

        if (yDiff) {
            result.years = (pluralize(yDiff));
        }
        if (mDiff) {
            result.months = (pluralize(mDiff));
        }
        if (dDiff) {
            result.days = (pluralize(dDiff));
        }
        if (hourDiff) {
            result.hours = (pluralize(hourDiff));
        }
        if (minDiff) {
            result.minutes = (pluralize(minDiff));
        }
        if (secDiff) {
            result.seconds = (pluralize(secDiff));
        }
        if (msecDiff) {
            result.mseconds = (pluralize(msecDiff));
        }

        return result;
    };
}(moment));
