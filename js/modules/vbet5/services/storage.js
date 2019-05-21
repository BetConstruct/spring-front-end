/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:Storage
 * @description  Storage lib wrapper
 */
VBET5.service('Storage', function () {
    'use strict';
    var Storage = {}, keyNamePrefix = "", data = {}, storageEnabled = true;

    try {
        amplify.store('storage_initialization_ok', null);
    } catch (e) {
        storageEnabled = false;
    }

    /**
     * @ngdoc method
     * @name set
     * @methodOf vbet5.service:Storage
     * @description Stores object in local storage
     *
     * @param {String} key key name
     * @param {Object} value object to store
     * @param {number} [expireAfter] expires after this time (milliseconds)
     */
    Storage.set = function set(key, value, expireAfter) {
        if (storageEnabled) {
            return amplify.store(keyNamePrefix + key, value, {expires: expireAfter});
        } else {
            data[key] = value.toString();
            return true;
        }
    };

    /**
     * @ngdoc method
     * @name get
     * @methodOf vbet5.service:Storage
     * @description Returns stored object by key
     *
     * @param {String} key key name
     * @returns {Object} stored object
     */
    Storage.get = function get(key) {
        if (storageEnabled) {
            return amplify.store(keyNamePrefix + key);
        } else {
            return data[key];
        }
    };

    /**
     * @ngdoc method
     * @name remove
     * @methodOf vbet5.service:Storage
     * @description removes object specified by key
     *
     * @param {String} key key name
     * @returns {Object} stored object
     */
    Storage.remove = function remove(key) {
        if (storageEnabled) {
            return amplify.store(keyNamePrefix + key, null);
        } else {
            delete data[key];
        }
    };

    /**
     * @ngdoc method
     * @name setKeyNamePrefix
     * @methodOf vbet5.service:Storage
     * @description sets key name prefix. All keys  will have it prefixed to their name
     *
     * @param {String} prefix the prefix
     */
    Storage.setKeyNamePrefix = function setKeyNamePrefix(prefix) {
        keyNamePrefix = prefix;
    };

    return Storage;

});
