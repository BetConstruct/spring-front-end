/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:timezone
 * @description timezone service
 *
 */
VBET5.service('TimezoneService', ['Config', 'Storage', 'Moment', function (Config, Storage, Moment) {
    'use strict';

    var TimezoneService = {};

    /**
     * @description Set initial values for the switcher
     * the timeZonePerLanguage has highest priority to select current timezone.
     * the second priority has storage .
     */
    TimezoneService.getTimezoneSwitcherInitialValue = function getTimezoneSwitcherInitialValue () {
        // try to get through lang if it enabled
        if (Config.main.timeZonePerLanguage[Config.env.lang]) {
            return Config.main.timeZonePerLanguage[Config.env.lang];
        }
        if (Config.main.header.enableTimeZoneSelect && Storage.get('selectedTimeZone')) {
            return Storage.get('selectedTimeZone');
        }

        // return default time zone from navigator
        return Config.env.selectedTimeZone || Moment.get().lang('en').format('Z');
    };

    /**
     * @description Handle clicks on time zone and set value to $scope and set in storage then update config.env.selectedTimezone
     * @param {String} value timezone
     */
    TimezoneService.setTimezoneSwitcherValue = function setTimezoneSwitcherValue (value) {
        // 1 - days, 2 - hours, 3 - minutes, 4 - seconds, 5 - milliseconds
        var storageExpireTime = 1 * 24 * 60 * 60 * 1000;

        if (Config.env.selectedTimeZone === value) {
            return;
        }
        if(Config.main.header.enableTimeZoneSelect || !Config.env.selectedTimeZone) {
            Config.env.selectedTimeZone = value;
        }

        if (Config.main.header.enableTimeZoneSelect) {
            Storage.set('selectedTimeZone', Config.env.selectedTimeZone, storageExpireTime);
        }
    };

    TimezoneService.data = [
        {"value": "-12:00", "name": "GMT -12:00"},
        {"value": "-11:00", "name": "GMT -11:00"},
        {"value": "-10:00", "name": "GMT -10:00"},
        {"value": "-09:00", "name": "GMT -09:00"},
        {"value": "-08:00", "name": "GMT -08:00"},
        {"value": "-07:00", "name": "GMT -07:00"},
        {"value": "-06:00", "name": "GMT -06:00"},
        {"value": "-05:00", "name": "GMT -05:00"},
        {"value": "-04:00", "name": "GMT -04:00"},
        {"value": "-03:00", "name": "GMT -03:00"},
        {"value": "-02:00", "name": "GMT -02:00"},
        {"value": "-01:00", "name": "GMT -01:00"},
        {"value": "+00:00", "name": "GMT +00:00"},
        {"value": "+01:00", "name": "GMT +01:00"},
        {"value": "+02:00", "name": "GMT +02:00"},
        {"value": "+03:00", "name": "GMT +03:00"},
        {"value": "+04:00", "name": "GMT +04:00"},
        {"value": "+05:00", "name": "GMT +05:00"},
        {"value": "+06:00", "name": "GMT +06:00"},
        {"value": "+07:00", "name": "GMT +07:00"},
        {"value": "+08:00", "name": "GMT +08:00"},
        {"value": "+09:00", "name": "GMT +09:00"},
        {"value": "+10:00", "name": "GMT +10:00"},
        {"value": "+11:00", "name": "GMT +11:00"},
        {"value": "+12:00", "name": "GMT +12:00"},
        {"value": "+13:00", "name": "GMT +13:00"},
        {"value": "+14:00", "name": "GMT +14:00"}
    ];

    return TimezoneService;
}]);
