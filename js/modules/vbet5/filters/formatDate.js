/* global VBET5 */
/**
 * @ngdoc filter
 * @name vbet5.filter:formatDate
 * @description
 * formats date
 *
 * @param {Number|String} unix timestamp in seconds or ISO date string
 * @param {String} [format] optional.
 * @param {Number} [calendarDays] optional. Closeness to now(in days) after which date will be displayed in default format instead of .calendar()
 * Date format to use (see {@link http://momentjs.com/docs/#/displaying/format/ moment.js docs})
 * If 'full' default full format will be used
 * If not specified 'relative' format will be used
 */
VBET5.filter('formatDate', ['Moment', 'Config', 'Utils', function (Moment, Config, Utils) {
    'use strict';
    var DEFAULT_FORMAT = Config.main.defaultTimeFormat || (Config.env.lang === 'tur' ? "DD MMM YYYY LT" : "ll LT");

    return Utils.memoize(function (timestamp, format, calendarDays, longDateFormat) {
        var localeIsFixed = false;
        calendarDays = calendarDays || 1;
        if (typeof timestamp === 'string' && timestamp.indexOf(':') !== -1 && timestamp.indexOf('-') !== -1) {
            timestamp = Moment.get(timestamp);
        } else {
            timestamp = Moment.moment.unix(timestamp);
        }
        Moment.setLongDateFormat(longDateFormat || Config.env.timeFormat);
        if (format) {
            var localeLang = Config.env.lang === 'arb' ? Moment.getLangMap() : 'en';
            switch (format) {
                case 'full':
                    format = DEFAULT_FORMAT;
                    break;
                case 'hour':
                    format = longDateFormat === '12h' ? 'hh:mm A' : 'HH:mm';
                    break;
                case 'fullHour':
                    format = longDateFormat === '12h' ? 'hh:mm:ss A' : 'HH:mm:ss';
                    break;
                case 'fullHourWithoutAmPm':
                    format = longDateFormat === '12h' ? 'hh:mm:ss' : 'HH:mm:ss';
                    break;
                case 'fullDate':
                    format = longDateFormat === '12h' ? 'DD/MM/YYYY-hh:mm:ss' : 'DD/MM/YYYY-HH:mm:ss';
                    break;
                case 'onlyAmPm':
                    format = longDateFormat === '12h' ? 'A' : ' ';
                    localeIsFixed = true; // TODO see below
                    break;
                case 'noLocaleTranslate':
                    format = Config.main.dateFormat.noLocaleTranslate[Config.env.timeFormat];
                    localeIsFixed = true; // TODO see below
                    break;
                case 'noLocaleTime':
                    format = Config.env.timeFormat === '12h' ? 'LT' : 'HH:mm';
                    localeIsFixed = true;
                    break;
                case 'unixDate':
                    if (Config.env.lang === 'arb') {
                        return Moment.moment.utc(timestamp).locale(localeLang).format(Config.main.dateFormat.unixDate);
                    }
                    return Moment.moment.utc(timestamp).format(Config.main.dateFormat.unixDate);
                case 'edition':
                    var edition = Moment.get(timestamp).locale(localeLang);
                    return parseInt(edition.format('DDD'), 10) + ((Config.main.edition && Config.main.edition.offset) || 0);
                case 'duration':
                    return Moment.moment.utc(timestamp).format("HH:mm:ss");
            }

            // TODO: we'll refactor this later, to have more correct solution
            if (localeIsFixed) {
                return  Moment.get(timestamp).locale(localeLang).format(format);
            }

            return Moment.get(timestamp).format(format);
        }
        if (Math.abs(Moment.get().diff(timestamp, 'days')) < calendarDays) {
            return timestamp.calendar();
        }
        return timestamp.format(DEFAULT_FORMAT);
    });
}]);