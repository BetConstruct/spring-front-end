/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:odd
 * @description odd service
 *
 */
VBET5.service('OddService', ['Config', 'Storage', 'Moment', function (Config, Storage, Moment) {
    'use strict';

    var OddService = {};

    OddService.getOddSwitcherInitialValue = function getOddSwitcherInitialValue () {
        if (Storage.get('oddFormat')) {
            return Storage.get('oddFormat');
        }

        return Config.env.oddFormat;
    };

    /**
     * @description Handle clicks on time zone and set value to $scope and set in storage then update config.env.selectedTimezone
     * @param {String} value timezone
     */
    OddService.setOddSwitcherValue = function setOddSwitcherValue (value, dontEmit) {
        // 1 - days, 2 - hours, 3 - minutes, 4 - seconds, 5 - milliseconds
        var storageExpireTime = 1 * 24 * 60 * 60 * 1000;

        if (Config.env.oddFormat === value) {
            return;
        }

        Config.env.oddFormat = value;

        Storage.set('oddFormat', value, storageExpireTime);

    };

    OddService.data = Config.main.oddFormats;

    return OddService;    
}]);