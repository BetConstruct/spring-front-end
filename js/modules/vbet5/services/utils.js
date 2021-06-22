/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:Utils
 * @description
 * Utility functions
 */

VBET5.service('Utils', ['$rootScope', '$timeout', '$filter', '$location', '$route', '$window', '$cookies', '$q', 'Config', function ($rootScope, $timeout, $filter, $location, $route, $window, $cookies, $q, Config) {
    'use strict';
    var Utils = {};
    var bodyWrapperClasses = {};
    var previouseRequests = [];

    /**
     * @ngdoc method
     * @name objectToArray
     * @methodOf vbet5.service:Utils
     * @description Converts object to array.
     *
     * Needed mainly because data from swarm is Object but angular needs Arrays for ng-repeat, sorting, etc.
     *
     * @param {Object} obj  object to convert
     * @param {String} [addKeyNameAsProperty]  optional. if set, the object key name will be added to array item under this name
     * @returns {Array} array
     */
    Utils.objectToArray = function objectToArray(obj, addKeyNameAsProperty, objectKeysToInclude) {

        if (!(obj instanceof  Object)) {
            console.warn('Utils.objectToArray - not an object:', obj);
            return obj;
        }
        var ret = [];

        angular.forEach(obj, function (value, key) {
            var item = value;

            if (addKeyNameAsProperty) {
                value[addKeyNameAsProperty] = key;
            }

            if (objectKeysToInclude && objectKeysToInclude.length) {
                item = {};

                angular.forEach(objectKeysToInclude, function (keyName) {
                    item[keyName] = value[keyName];
                });
            }

            ret.push(item);
        });

        return ret;
    };

    /**
     * @ngdoc method
     * @name createMapFromObjItems
     * @methodOf vbet5.service:Utils
     * @description Converts object map, using specified item property value as key
     *
     *
     * @param {Object} obj the object
     * @param {String} itemPropertyNameToUseAsKey property name to use as key
     * @returns {Object} created map object
     */
    Utils.createMapFromObjItems = function createMapFromObjItems(obj, itemPropertyNameToUseAsKey) {
        if (!(obj instanceof  Object)) {
            console.warn('Utils.createMapFromObjItems - not an object:', obj);
            return obj;
        }
        var ret = {};
        angular.forEach(obj, function (item) {
            ret[item[itemPropertyNameToUseAsKey]] = item;
        });
        return ret;
    };

    /**
     * @ngdoc method
     * @name getItemBySubItemProperty
     * @methodOf vbet5.service:Utils
     * @description returns object's items which have property with specified name and one of specified values
     *
     * e.g. if we have:
     *
     *      obj =  {
     *              1: {type:'a', data: 'foo'},
     *              2: {type:'b', data: 'bar'}
     *              3: {type:'c', data: 'baz'}
     *      }
     *
     * if we need to get the {type:'b', data: 'bar'} object, we can do it
     * by calling
     *
     *      getItemBySubArrayProperty(obj, 'type', ['b']);
     *      or
     *      getItemBySubArrayProperty(obj, 'type', {'b':true});
     *
     * which will return
     *
     *      {b: {type:'b', data: 'bar'}}
     *
     * if we need to get the objects with types 'b' or 'c' , we can do it
     * by calling
     *
     *      getItemBySubArrayProperty(obj, 'type', ['b','c']);
     *      or
     *      getItemBySubArrayProperty(obj, 'type', {'b':true,'c':true});
     * which will return
     *
     *      {'b': {type:'b', data: 'bar'}, 'c': {type:'c', data: 'baz'}}
     *
     * @param {Object} obj object containing needed item
     * @param {String} propertyName  name of property(field)
     * @param {Array|Object} propertyValues desired values of property.
     * Can be array or hashmap. Hashmap is faster on large objects, while array is more readable.
     *
     * @returns {Object} map of items having 'propertyName' with value 'propertyValue' or null if nothing was found
     */
    Utils.getItemBySubItemProperty = function getItemBySubItemProperty(obj, propertyName, propertyValues) {
        var ret = {};
        if (propertyValues instanceof Array) {
            angular.forEach(obj, function (item) {
                if (!item) {
                    return;
                }
                var pos = propertyValues.indexOf(item[propertyName]);
                if (pos !== -1) {
                    ret[propertyValues[pos]] = item;
                }
            });
        } else if (propertyValues instanceof Object) {
            angular.forEach(obj, function (item) {
                if (!item) {
                    return;
                }
                if (propertyValues[item[propertyName]] !== undefined) {
                    ret[item[propertyName]] = item;
                }
            });
        }


        return Utils.isObjectEmpty(ret) ? null : ret;
    };


    /**
     * @ngdoc method
     * @name groupByItemProperty
     * @methodOf vbet5.service:Utils
     * @description returns object's items grouped by item's property values
     *
     * e.g. if we have:
     *
     *      obj =  {
     *              1: {type:'a', data: 'foo'},
     *              2: {type:'b', data: 'bar'}
     *              3: {type:'c', data: 'foo'}
     *              4: {type:'a', data: 'baz'}
     *      }
     *
     *
     * **groupByItemProperty(obj, 'type');**
     *
     * will return
     *
     *      {
     *          a: [{type:'a', data: 'foo'}, {type:'a', data: 'baz'}],
     *          b: [{type:'b', data: 'bar'}],
     *      }   c: [{type:'c', data: 'foo'}]
     *
     *
     *  **groupByItemProperty(obj, 'data');**
     *
     * will return
     *
     *      {
     *          foo: [{type:'a', data: 'foo'}, {type:'c', data: 'foo'}],
     *          bar: [{type:'b', data: 'bar'}],
     *          baz: [{type:'a', data: 'baz'}]
     *      }
     *
     *
     * @param {Object} obj object containing needed items
     * @param {String} propertyName  name of property(field) to group by
     * @param {String} [setMissingPropertyValue]  if set, for items not having the property it will be added with this value
     * @returns {Object} array of groups
     */
    Utils.groupByItemProperty = function groupByItemProperty(obj, propertyName, setMissingPropertyValue) {
        var groups = {},
            defaultGroupName = setMissingPropertyValue || '_';
        angular.forEach(obj, function (item) {
            if (!item) {
                return;
            }
            if (item[propertyName] !== undefined) {
                if (groups[item[propertyName]] === undefined) {
                    groups[item[propertyName]] = [];
                }
                groups[item[propertyName]].push(item);
            } else {
                if (groups[defaultGroupName] === undefined) {
                    groups[defaultGroupName] = [];
                }
                if (setMissingPropertyValue) {
                    item[propertyName] = setMissingPropertyValue;
                }
                groups[defaultGroupName].push(item);
            }
        });
        return Utils.isObjectEmpty(groups) ? null : groups;
    };

    /**
     * @ngdoc method
     * @name groupByItemProperties
     * @methodOf vbet5.service:Utils
     * @description returns object's items grouped by several of item's property values
     *
     * e.g. if we have:
     *
     *      obj =  {
     *              1: {type1:'a', type2: '1', data: 'foo'},
     *              2: {type1:'b', type2: '2', data: 'bar'}
     *              3: {type1:'c', type2: '3', data: 'foo'}
     *              4: {type1:'a', type2: '2', data: 'bazbaz'}
     *              5: {type1:'a', type2: '1', data: 'baz'}
     *              6: {type1:'a', type2: '2', data: 'baz'}
     *      }
     *
     *
     * **groupByItemProperty(obj, ['type1'. 'type2']);**
     *
     * will return
     *
     *      {
     *          '_a1': [{type1:'a', type2: '1', data: 'foo'}, {type1:'a', type2: '1', data: 'baz'}],
     *          '_a2': [{type1:'a', type2: '2', data: 'baz'}, {type1:'a', type2: '2', data: 'bazbaz'}],
     *          '_b2': [{type1:'b', type2: '2', data: 'bar'}],
     *         '_c3': [{type1:'c', type2: '3', data: 'foo'}]
     *      }
     *
     *
     * @param {Object} obj object containing needed items
     * @param {Array} propertyNames  name of property(field) to group by
     * @returns {Object} array of groups
     */
    Utils.groupByItemProperties = function groupByItemProperties(obj, propertyNames) {
        var groups = {};
        angular.forEach(obj, function (item) {
            if (!item) {
                return;
            }
            var key = '_';
            angular.forEach(propertyNames, function (propertyName) {
                if (item[propertyName] !== undefined) {
                    key = key + item[propertyName];
                }
            });

            if (groups[key] === undefined) {
                groups[key] = [];
            }
            groups[key].push(item);

        });
        return Utils.isObjectEmpty(groups) ? null : groups;
    };

    /**
     * @ngdoc method
     * @name isObjectEmpty
     * @methodOf vbet5.service:Utils
     * @description checks if item is an object
     *
     * @param {Object} obj object to check
     * @returns {boolean} true if empty, false otherwise
     */
    Utils.isObject = function isObject(obj) {
        return Object.prototype.toString.call(obj) === '[object Object]'
    };

    /**
     * @ngdoc method
     * @name isObjectEmpty
     * @methodOf vbet5.service:Utils
     * @description checks if object is empty
     *
     * @param {Object} obj object to check
     * @returns {boolean} true if empty, false otherwise
     */
    Utils.isObjectEmpty = function isObjectEmpty(obj) {
        var prop;
        for (prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return false;
            }
        }
        return true;
    };

    /**
     * @ngdoc method
     * @name getPartToShowInColumns
     * @methodOf vbet5.service:Utils
     * @description
     * Gets the remaining items(which don't fit in list and should be shown at "more" dropdown block)
     * of array and groups them by columns.  Each column is an array, containing array of lettergroups.
     * Lettergroup is and array containing items grouped by letter.
     *
     * Method is used to construct list from Sports and Regions dropdown blocks, as it cannot be done with CSS
     *
     * @param {Array} initialList list of items to group by columns/letters (sports list or regions list)
     * @param {Number} startFrom index of **initialList** to start from
     * @param {Number} columnNumber number of columns to divide to
     * @param {String} fieldToUseForLetter name of filed which will be used to divide by letter and sort. Default is 'name'
     *
     * @returns {Array} array of columns(array of lettergroups(array of items staring with letter))
     */
    Utils.getPartToShowInColumns = function getPartToShowInColumns(initialList, startFrom, columnNumber, fieldToUseForLetter) {
        fieldToUseForLetter = fieldToUseForLetter || 'name';
        var i, j, sortedByLetter = [], columns = [], moreGames = [],  maxColumnHight;
        var compare = function (a, b) {
            if (a[fieldToUseForLetter] < b[fieldToUseForLetter]) {
                return -1;
            }
            if (a[fieldToUseForLetter]  > b[fieldToUseForLetter]) {
                return 1;
            }
            return 0;
        };
        if (initialList) {
            if (initialList.length > startFrom) {
                moreGames = initialList.slice(startFrom).sort(compare);
            } else {
                return null;
            }

            sortedByLetter[0] = [];
            sortedByLetter[0].push(moreGames[0]);
            for (i = 1, j = 0; i < moreGames.length; i++) {
                if (moreGames[i][fieldToUseForLetter].charAt(0).toLowerCase() === moreGames[i - 1][fieldToUseForLetter].charAt(0).toLowerCase()) {
                    sortedByLetter[j].push(moreGames[i]);
                } else {
                    sortedByLetter[++j] = [];
                    sortedByLetter[j].push(moreGames[i]);
                }
            }
            columns[0] = [];
            maxColumnHight = Math.floor(moreGames.length / columnNumber);
            var currentColLength = 0;
            var residualLength = moreGames.length;
            for (i = 0, j = 0; i < sortedByLetter.length; i++) {
                if (columns[j].length === 0 || currentColLength + sortedByLetter[i].length <= maxColumnHight || ((i !== sortedByLetter.length - 1) && (currentColLength + sortedByLetter[i].length < sortedByLetter[i].length + sortedByLetter[i + 1].length))) {
                    columns[j].push(sortedByLetter[i]);
                    currentColLength += sortedByLetter[i].length;
                } else {
                    residualLength -= currentColLength;
                    columns[++j] = [];
                    columns[j].push(sortedByLetter[i]);
                    currentColLength = sortedByLetter[i].length;
                    maxColumnHight = Math.floor(residualLength / (columnNumber - j));
                }
            }
            return columns;
        }
        return null;
    };

    /**
     * @ngdoc method
     * @name arrayMove
     * @methodOf vbet5.service:Utils
     * @description Move array element from "from" position to "to" position
     *
     * @param {Array} array the array
     * @param {Number} from source index
     * @param {Number} to target index
     *
     * @returns {Array} array
     */

    Utils.arrayMove = function arrayMove(array, from, to) {
        array.splice(to, 0, array.splice(from, 1)[0]);

        return array;
    };


    /**
     * @ngdoc method
     * @name setJustForMoment
     * @methodOf vbet5.service:Utils
     * @description sets **scope**'s variable value to provided one for some time, then changes it back
     *
     * @param {Object} scope the scope
     * @param {string} name scope variable name
     * @param {mixed} value value to set
     * @param {number} [time] optional. time in milliseconds, default is 500
     */
    Utils.setJustForMoment = function setJustForMoment(scope, name, value, time) {
        time = time || 500;
        var prevValue = scope[name];
        scope[name] = value;
        $timeout(function () {
            scope[name] = prevValue;
        }, time);
    };


    /**
     * @ngdoc method
     * @name MergeRecursive
     * @methodOf vbet5.service:Utils
     * @description merges 2 objects recursively
     * @param {Object} to destination object
     * @param {Object} from source object
     * @return {Object} returns changed destination object
     */
    Utils.MergeRecursive = function MergeRecursive(to, from) {
        var p;
        for (p in from) {
            if (from.hasOwnProperty(p)) {
                try {
                    if (from[p].constructor === Object) {
                        if (from[p]['@replace'] === true) {  //replace field instead of merging if specified
                            to[p] = from[p];
                            delete to[p]['@replace'];
                        } else {
                            to[p] = Utils.MergeRecursive(to[p], from[p]);
                        }

                    } else {
                        to[p] = from[p];
                    }
                } catch (e) {
                    to[p] = from[p];
                }
            }
        }
        return to;
    };

    /**
     * @ngdoc method
     * @name createPaginationArray
     * @methodOf vbet5.service:Utils
     * @description
     * creates array for pagination
     * (list of pages arount the selected one to fit into some amount + first and last)
     * like   1 2 3 ... 10 11 12 13 14
     * or 1 ... 5 6 7 8 ... 20
     *
     * the '...' items are just negative numbers
     *
     * @param {Number} totalPages  total amount of pages
     * @param {Number} selectedPage  selected page number
     * @param {Number} visibleAmount amount of pages that will be visible
     *
     * @return {Array} array of page numbers (negative numbers instead of '...'s)
     */
    Utils.createPaginationArray = function createPaginationArray(totalPages, selectedPage, visibleAmount) {
        visibleAmount = visibleAmount || 10;
        var visibleAmountHalf = parseInt(visibleAmount / 2, 10);
        var i, startPage, endPage, diff, visiblePages = [];
        startPage = (selectedPage < visibleAmountHalf + 1) ? 1 : selectedPage - visibleAmountHalf;
        endPage = startPage + visibleAmount;
        endPage = (endPage > totalPages) ? totalPages : endPage;
        diff = startPage - endPage + visibleAmount - 1;
        startPage -= (startPage - diff > 0) ? diff : 0;
        if (startPage > 1) {
            visiblePages.push(1);
        }
        if (startPage > 2) {
            visiblePages.push(-1);
        }
        for (i = startPage; i <= endPage; i++) {
            visiblePages.push(i);
        }
        if (endPage < totalPages - 1) {
            visiblePages.push(-2);
        }
        if (endPage < totalPages) {
            visiblePages.push(totalPages);
        }
        if (totalPages === visiblePages.length) {  // a quick dirty fix, actually this whole function has to be rewritten
            visiblePages.map(function (current, i, arr) { arr[i] = current > 0 ? current : arr[i - 1] + 1; });
        }
        return visiblePages;
    };

    /**
     * @ngdoc method
     * @name nl2br
     * @methodOf vbet5.service:Utils
     * @description converts newlines to <br> in goven string
     * @param {String} str string to convert
     *
     * @return {String} string with <br>s instead of new lines
     */
    Utils.nl2br = function nl2br(str) {
        return str.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
    };

    /**
     * @ngdoc method
     * @name getKeyOfMinValue
     * @methodOf vbet5.service:Utils
     * @description returns key ob object having minimal value
     * @param {Object} obj the object
     *
     * @return {String} key (name of property) with minimal value
     */
    Utils.getKeyOfMinValue = function getKeyOfMinValue(obj) {
        var min = Infinity, keyOfMin = null;
        angular.forEach(obj, function (val, key) {
            if (val < min) {
                min = val;
                keyOfMin = key;
            }
        });
        return keyOfMin;
    };

    /**
     * @ngdoc method
     * @name getWeightedRandom
     * @methodOf vbet5.service:Utils
     * @description returns "weighted" random element of array
     * @param {Array} array the array
     * @param {String} weightFieldName aray's objects' field name that contains it's weight
     *
     * @return {Object} random weighted array item
     */
    Utils.getWeightedRandom = function getWeightedRandom(array, weightFieldName) {
        weightFieldName = weightFieldName || 'weight';
        var variants = [], i;
        angular.forEach(array, function (item) {
            if (item.ignore) {
                return;
            }
            for (i = 0; i < (item[weightFieldName] || 1); i++) {
                variants.push(item);
            }
        });

        var index = Math.floor(Math.random() * variants.length);

        return variants[index];
    };

    /**
     * @ngdoc method
     * @name getAdditionalItems
     * @methodOf vbet5.service:Utils
     * @description returns array of menu items that don't fit in main section, each group preceded by it's first letter item
     * @param {Array} allItems the array
     * @param {Number} startFrom start index
     * @param {String} groupBy field name to group by
     * @param {String} type items type(name of field in result objects)
     *
     * @return {Array} additional items
     */
    Utils.getAdditionalItems = function getAdditionalItems(allItems, startFrom, groupBy, type) {
        if (!allItems || !allItems.length || allItems.length <= startFrom) {
            return;
        }
        var letterClasses = {}, i = 0, ret = [], currentLetter;
        angular.forEach($filter('orderBy')(allItems.slice(startFrom), groupBy), function (item) {
            var sportFirstLetter = item[groupBy].charAt(0);
            letterClasses[sportFirstLetter] = letterClasses[sportFirstLetter] || 'letter-' + i++;
            if (currentLetter !== sportFirstLetter) {
                currentLetter = sportFirstLetter;
                ret.push({type: 'letter', letter: currentLetter, cssClass: letterClasses[sportFirstLetter]});
            }
            var obj = {type: type, cssClass: letterClasses[sportFirstLetter]};
            obj[type] = item;
            ret.push(obj);
        });
        return ret;
    };

    /**
     * @ngdoc method
     * @name groupToGroups
     * @methodOf vbet5.service:Utils
     * @description returns an array of objects. every object has the id and array of [groupName].
     * @param {Array} group the array
     * @param {int} perGroup the int
     * @param {String} groupName the string
     *
     * @return {Array} groups the array
     */
    Utils.groupToGroups = function groupToGroups(group, perGroup, groupName) {
        groupName = groupName || 'group';
        var i, g = 0, length = group.length, groups = [];
        for (i = 0; i < length; i += 1) {
            if (groups[g] === undefined) {
                groups[g] = {id: g};
                groups[g][groupName] = [];
            }
            groups[g][groupName].push(group[i]);
            if (groups[g][groupName].length === perGroup) {
                g++;
            }
        }
        return groups;
    };


    /**
     * @ngdoc method
     * @name makeSelectedVisible
     * @methodOf vbet5.service:Utils
     * @description  Resorts **arr** array(which is sports or regions list) in a way
     * that item specified by **selector** is made visible by moving it to tail of visible block from 'more'
     *
     * @param {Array} arr array of objects (sports or regions)
     * @param {Object} selector selector object. e.g. {id: 1} will select element having field id=1
     * @param {Number} visibleItemsCount count of visible items after which rest is hidden in 'more' block
     * @returns {Array} resorted array
     */
    Utils.makeSelectedVisible = function makeSelectedVisible(arr, selector, visibleItemsCount) {

        var i, removed, field, value, found = false;
        if (!arr || !arr.length) {
            return arr;
        }

        // get field and value from selector
        for (i in selector) {
            if (selector.hasOwnProperty(i)) {
                field = i;
                value = selector[field];
                break;
            }
        }

        // get index of selected item
        for (i = 0; i < arr.length; i++) {
            if (arr[i][field] === value) {
                found = true;
                break;
            }
        }

        if (i < visibleItemsCount || !found) { // selected item is already visible
            return arr;
        }
        removed = arr.splice(i, 1);                         // remove selected element from it's place
        arr.splice(visibleItemsCount - 1, 0, removed[0]);   // and put as last visible one

        return arr.slice(0); //need to return a copy, otherwise $watch will think that arr haven't changed
    };

    /**
     * @ngdoc method
     * @name clone
     * @methodOf vbet5.service:Utils
     * @description  returns object clone
     *
     * @param {Object} obj object to clone
     * @returns {Object} clone of object
     */
    Utils.clone = function clone(obj) {

        if (null === obj || "object" !== typeof obj) {
            return obj;
        }
        var copy = obj.constructor();
        var attr;
        for (attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                copy[attr] = obj[attr];
            }
        }
        return copy;
    };

    /**
     * Deep clones object
     * @param {*} item
     * @returns {*} cloned object
     */
    Utils.cloneDeep = function cloneDeep(item) {
        if (!item) {
            return item;
        } // null, undefined values check

        var types = [Number, String, Boolean],
            result;

        // normalizing primitives if someone did new String('aaa'), or new Number('444');
        angular.forEach(types, function(type) {
            if (item instanceof type) {
                result = type(item);
            }
        });

        if (typeof result == "undefined") {
            if (Object.prototype.toString.call(item) === "[object Array]") {
                result = [];
                angular.forEach(item, function (child, index) {
                    result[index] = Utils.cloneDeep(child);
                });
            } else if (typeof item == "object") {
                // testing that this is DOM
                if (item.nodeType && typeof item.cloneNode == "function") {
                    result = item.cloneNode(true);
                } else if (!item.prototype) { // check that this is a literal
                    if (item instanceof Date) {
                        result = new Date(item);
                    } else {
                        // it is an object literal
                        result = {};
                        for (var i in item) {
                            result[i] = Utils.cloneDeep(item[i]);
                        }
                    }
                } else {
                    // depending what you would like here,
                    // just keep the reference, or create new object
                    if (false && item.constructor) {
                        // would not advice to do that, reason? Read below
                        result = new item.constructor();
                    } else {
                        result = item;
                    }
                }
            } else {
                result = item;
            }
        }
        return result;
    };


    /**
     * @ngdoc method
     * @name gamesArrayToObjectArray
     * @methodOf vbet5.service:Utils
     * @description  returns array with objects depended on games array
     * for example if you pass game array [12321,45687789,656211] output will be [[id:12321},[id:45687789},[id:656211}]
     * @param {Array} gamesArray games array
     * @returns {Array} array
     */
    Utils.gamesArrayToObjectArray = function (gamesArray) {
        if (!angular.isArray(gamesArray)) {
            return;
        }
        var output = [], i,
            length = gamesArray.length;
        for (i = 0; i < length; i++) {
            output.push({id: gamesArray[i]});
        }
        return output;

    };

    /**
     * @ngdoc method
     * @name arrayEquals
     * @methodOf vbet5.service:Utils
     * @description  returns true if array and array2 is equals
     * @param {Array} array 1st array
     * @param {Array} array2 2nd array
     * @returns {Boolean} equals
     */

    Utils.arrayEquals = function (array, array2) {
        // if the other array is a falsy value, return
        if (!array2) {
            return false;
        }
        var i, l;
        for (i = 0, l = array2.length; i < l; i++) {
            // Check if we have nested arrays
            if (array2[i] instanceof Array && array[i] instanceof Array) {
                // recurse into the nested arrays
                if (!Utils.arrayEquals(array2[i], array[i])) {
                    return false;
                }
            } else if (array2[i] !== array[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    };


    /**
     * @ngdoc method
     * @name removeElementFromArray
     * @methodOf vbet5.service:Utils
     * @description  removes element from given array
     * @param {Array} array array
     * @param {Number/String} el element
     */
    Utils.removeElementFromArray = function (array, el) {
        var index = array.indexOf(el);
        if (index > -1) {
            array.splice(index, 1);
        }
    };

    /**
     * @ngdoc method
     * @name isInArray
     * @methodOf vbet5.service:Utils
     * @description  checks if given element exist in given array, same jQuery.inArray
     * @param {Array} array An array through which to search.
     * @param {Number/String} elem The value to search for.
     * @param {Number} fromIndex index of the array at which to begin the search. The default is 0, which will search the whole array
     * @return {Number}  element index (or -1 if not found).
     */
    Utils.isInArray = function isInArray(array, elem, fromIndex) {
        var len, arr = array;
        if (arr) {
            if (arr.indexOf(elem)) {
                return arr.indexOf.call(arr, elem, fromIndex);
            }

            len = arr.length;
            fromIndex = fromIndex ? fromIndex < 0 ? Math.max(0, len + fromIndex) : fromIndex : 0;

            for (null; fromIndex < len; fromIndex++) {
                // Skip accessing in sparse arrays
                if (fromIndex in arr && arr[fromIndex] === elem) {
                    return fromIndex;
                }
            }
        }
        return -1;
    };

    /**
     * @ngdoc method
     * @name getArrayObjectElementHavingFieldValue
     * @methodOf vbet5.service:Utils
     * @description  returns array element object having field with specified value
     * @param {Array} array array of objects
     * @param {String} field the field name
     * @param {Object|String|Number} value field value
     * @param {Boolean|String|Number} true if you need boolean answer
     * @return {Object|null}  object or null if not found
     */
    Utils.getArrayObjectElementHavingFieldValue = function getArrayObjectElementHavingFieldValue(array, field, value, getBool) {
        if (array) {
            var i;
            for (i = 0; i < array.length; i++) {
                if (array[i][field] === value) {
                    return getBool ? true : array[i];
                }
            }
        }
        return null;
    };

    /**
     * @ngdoc method
     * @name orderSorting
     * @methodOf vbet5.service:Utils
     * @description  compares 2 items based on their "order" field
     * @param {Object} a first item
     * @param {Object} b second item
     */
    Utils.orderSorting = function orderSorting(a, b) {
        return a.order - b.order;
    };

    /**
     * @ngdoc method
     * @name orderByStartTs
     * @methodOf vbet5.service:Utils
     * @description  compares 2 items based on their "start_ts" field
     * @param {Object} a first item
     * @param {Object} b second item
     */
    Utils.orderByStartTs = function orderByStartTs(a, b) {
        return a.start_ts - b.start_ts;
    };


    /**
     * @ngdoc method
     * @name orderByField
     * @methodOf vbet5.service:Utils
     * @description  compares 2 elements based on any "field"
     * @param {Array} arrayToOrder array
     * @param {string} field  string
     */
    Utils.orderByField = function orderByField (arrayToOrder, field) {
        return arrayToOrder.sort(function (a, b) {
            return a[field] - b[field];
        });
    };

    /**
     *@ngdoc method
     * @name alphabeticalSorting
     * @methodOf vbet5.service:Utils
     * @description the name is self descriptive
     * @param a{Object} a first item
     * @param {Object} b second item
     */
    Utils.alphabeticalSorting = function(a, b) {
        return a.name.localeCompare(b.name);
    };
    /**
     * @ngdoc method
     * @name orderSortingReverse
     * @methodOf vbet5.service:Utils
     * @description  compares 2 items based on their "order" field
     * @param {Object} a first item
     * @param {Object} b second item
     */
    Utils.orderSortingReverse = function orderSortingReverse(a, b) {
        return b.order - a.order;
    };

    /**
     * @ngdoc method
     * @name twoParamsSorting
     * @methodOf vbet5.service:Utils
     * @description sorts array based on two params
     * @param array array to be sorted
     * @param params list of params (must be numeric)
     * @returns {*}
     */
    Utils.twoParamsSorting = function twoParamsSorting(array, params) {
        array.sort(function(a, b) {
            if(a[params[0]] - b[params[0]] === 0) {
                return a[params[1]] - b[params[1]];
            } else {
                return a[params[0]] - b[params[0]];
            }
        });
        return array;
    };


    /**
     * @ngdoc method
     * @name sortByIndex
     * @methodOf vbet5.service:Utils
     * @description  Capitalises first letter of string
     * @param {Array} arrayToOrder array to be sorted
     * @param {Array} arrayWithOrderingData array containing order data
     * @returns {String} sorted array
     */
    Utils.sortByIndex = function sortByIndex (arrayToOrder, arrayWithOrderingData) {
        arrayToOrder.sort(function (a, b) {
            return arrayWithOrderingData.indexOf(a.name) - arrayWithOrderingData.indexOf(b.name);
        });
    };

    /**
     * @ngdoc method
     * @name sortByField
     * @methodOf vbet5.service:Utils
     * @description  Capitalises first letter of string
     * @param {Array} arrayToOrder array to be sorted
     * @param {Array} arrayWithOrderingData array containing order data
     * @returns {String} sorted array
     */
    Utils.sortByField = function sortByField (arrayToOrder, arrayWithOrderingData) {
        arrayToOrder.sort(function (a, b) {
            return arrayWithOrderingData[a.name].order - arrayWithOrderingData[b.name].order;
        });
    };

    /**
     * @ngdoc method
     * @name ucfirst
     * @methodOf vbet5.service:Utils
     * @description  Capitalises first letter of string
     * @param {String} str string
     * @returns {String} Capitalised string
     */
    Utils.ucfirst = function ucfirst(str) {
        str += '';
        var f = str.charAt(0)
            .toUpperCase();
        return f + str.substr(1);
    };


    /**
     * @ngdoc method
     * @name objectToArrayFromProperty
     * @methodOf vbet5.service:Utils
     * @description  Makes array from the object by the given property
     * @param {object} obj - the object from wich the array should be made
     * @param {String} property property name
     * @returns {String} property - the property of the object
     */
    Utils.objectToArrayFromProperty = function objectToArrayFromProperty(obj, property) {
        if (!(obj instanceof  Object)) {
            return obj;
        }
        var key, arr = [];
        for (key in obj) {
            if (obj[key][property]) {
                arr.push(obj[key][property]);
            }
        }
        return arr;
    };

    Array.prototype.selectMany = function (fn) {
        return this.map(fn).reduce(function (x, y) { return x.concat(y); }, []);
    };

    Array.prototype.clean = function(deleteValue) {
        for (var i = 0; i < this.length; i++) {
            if (this[i] === deleteValue) {
                this.splice(i, 1);
                i--;
            }
        }
        return this;
    };


    /**
     * @ngdoc method
     * @name replaceAll
     * @methodOf vbet5.service:Utils
     * @description  does replacements in string according to given replacement map
     * @param {String} str  string to do replacement in
     * @param {object} mapObj map object of replacements, e.g.  {"from":"to", "from2":"to2"}
     * @returns {String} string with replacements
     */
    Utils.replaceAll = function replaceAll(str, mapObj) {
        if (!str) {
            return str;
        }
        var re = new RegExp(Object.keys(mapObj).join("|"), "gi");
        return str.replace(re, function (matched) {
            return mapObj[matched.toLowerCase()];
        });
    };

    /**
     * @ngdoc method
     * @name convertHtmlEntitiesToSymbols
     * @methodOf vbet5.service:Utils
     * @description  replaces html entities in string with symbols (e.g. &lt; becomes < )
     * @param {String} str  string to do replacement in
     * @returns {String} converted string
     */
    Utils.convertHtmlEntitiesToSymbols = function convertHtmlEntitiesToSymbols(str) {
        var entities = {"&lt;": "<", "&gt;": ">", "&amp;": "&"};
        return Utils.replaceAll(str, entities);
    };

    /**
     * @ngdoc function
     * @name getDefaultSelectedMarketBase
     * @methodOf vbet5.service:utils
     * @description
     * returns the market base of market for which the 2 event price difference is minimal
     *
     * @param {Object} markets markets
     * @returns {number} base market base
     */
    Utils.getDefaultSelectedMarketBase = function getDefaultSelectedMarketBase (markets) {
        var minDiff,
            defaultBase = markets[0].base;

        angular.forEach(markets, function (market) {
            var currDiff,
                events = Utils.objectToArray(market.event);
            if (events.length === 2 && (((currDiff = Math.abs(events[0].price - events[1].price)) < minDiff) || minDiff === undefined)) {
                minDiff = currDiff;
                defaultBase = market.base;
            }
        });

        return defaultBase;
    };

    Utils.emptyObject = function emptyObject (object) {
        angular.forEach(object, function (value, key) {
            delete object[key];
        });
    };

    /**
     * @ngdoc method
     * @name factorial
     * @methodOf vbet5.service:utils
     * @param {Number} x x
     * @returns {Number} factorial
     * @description calculate factorial
     */
    Utils.factorial = function factorial(x) {
        if (x !== undefined && !isNaN(x) && x >= 0) {
            return x === 0 ? 1 : (x * factorial(x - 1));
        }
    };

    /**
     * @ngdoc method
     * @name combineArrays
     * @methodOf vbet5.service:utils
     * @param {Array} arrays array
     * @returns {Array} combined array
     * @description combine arrays or objects into 1 array
     */
    Utils.combineArrays = function combineArrays(arraysData) {
        var combinedArray = [];
        angular.forEach(arraysData, function (arrayData) {
            if (arrayData) {
                angular.forEach(arrayData, function (value) {
                    combinedArray.push(value);
                });
            }
        });
        return combinedArray;
    };

    /**
     * @ngdoc function
     * @name getLanguageCode
     * @methodOf vbet5.service:Utils
     * @description Returns language that should be provided to Swarm (some languages should be mapped to other if they don't exist in swarm(backend))
     * @param {String} lng 3 letter language code
     * @returns {String} language code
     */
    Utils.getLanguageCode = function getLanguageCode(lng) {
        if (Config.swarm.languageMapGms && Config.swarm.languageMapGms[lng]) {
            return Config.swarm.languageMapGms[lng];
        }
        return lng;
    };

    /**
     * @ngdoc method
     * @name goToUrl
     * @methodOf CMS.directive:vbetLastMinuteBets
     * @description set minutes filter
     *
     * @param {object} game
     * @param {string} widgetMode
     */
    Utils.goToUrl = function goToUrl(game, widgetMode) {
        if (widgetMode !== 'iframe') {
            $location.search({
                'type': game.type === 2 ? 0 : game.type,
                'sport': game.sport.id,
                'region': game.region.id,
                'competition': game.competition.id,
                'game': game.id
            });

            var neededPath = Utils.getPathAccordintToAlias(game.sport.alias);
            if ($location.path() !== neededPath + '/') {
                $location.path(neededPath);
            } else {
                $route.reload();
            }
        } else {
            $window.parent.postMessage(
                {
                    action: 'open_game',
                    data: {
                        'type': game.type===1? 1: 0,
                        'sportId': game.sport.id,
                        'regionId': game.region.id,
                        'competitionId': game.competition.id,
                        'gameId': game.id
                    }
                },
                '*'
            );
        }
    };

    /**
     * @ngdoc method
     * @name checkForAvailableSportsbookViews
     * @methodOf vbet5.service:utils
     * @description checks for available views for particular skin
     * @param config skin config
     * @returns available views
     */
    Utils.checkForAvailableSportsbookViews = function checkForAvailableSportsbookViews(config) {
        var availableSportsbookViews = config.main.availableSportsbookViews || {};
        var index, currentView;

        if (config.additionalModules) {
            for (var i = 0; i < config.additionalModules.length; i++) {
                index = config.additionalModules[i].indexOf('View');
                if (-1 !== index) {
                    currentView = config.additionalModules[i].substr(0, index);
                    availableSportsbookViews[currentView] = true;
                }
            }
        }
        angular.forEach(availableSportsbookViews, function(value, key) {

            if (value && key === 'euro2016') {
                availableSportsbookViews['classic'] = true;
                delete availableSportsbookViews[key];
            }
            if(!value) {
                delete availableSportsbookViews[key];
            }

        });
        !config.main.availableSportsbookViews && (config.main.availableSportsbookViews = availableSportsbookViews);
        config.main.sportsLayout === 'euro2016' && (config.main.sportsLayout = 'classic');
        return availableSportsbookViews;
    };

    /**
     * @ngdoc method
     * @name getCustomSportAliasFilter
     * @methodOf vbet5.service:Utils
     * @description gets sports alias list
     */
    Utils.getCustomSportAliasFilter = function getCustomSportAliasFilter() {
        var locationPath = $location.path();
        if (Config.main.customSportIds && locationPath.indexOf('customsport') !== -1) {
            for (var sportAlias in Config.main.customSportIds) {
                if (locationPath === '/customsport/' + sportAlias + '/') {
                    return Config.main.customSportIds[sportAlias];
                }
            }
        }

        return null;
    };

    /**
     * @ngdoc method
     * @name getPathAccordintToAlias
     * @methodOf vbet5.service:Utils
     * @description Get path accordint to alias
     * @param {String} alias
     * @param {Number} type
     */
    Utils.getPathAccordintToAlias = function getPathAccordintToAlias (alias, type) {
        var result = "/sport";
        if ($location.path() === "/esports/" && type === 0) {
            result = "/esports";
        } else if (Config.main.customSportIds) {
            angular.forEach(Config.main.customSportIds, function (aliases, key) {
                if (aliases.indexOf(alias) !== -1) {
                    result =  "/customsport/" + key;
                }
            });
        }

        return result;
    };

    /**
     * @description gets all countries available for skin
     * @param allCountries
     * @returns {*}
     */
    Utils.getAvailableCountries = function getAvailableCountries(allCountries) {
        allCountries = Utils.clone(allCountries);
        var resultCountries = {}, availableCountries = Config.main.personalDetails.availableCountriesList;
        var restrictedCountries = Config.main.personalDetails.restrictedCountriesList;
        if(availableCountries && availableCountries.length) {
            var availableCountriesLength = availableCountries.length,
                i = 0;
            for (; i < availableCountriesLength; i++) {
                if(allCountries[availableCountries[i]]) {
                    resultCountries[availableCountries[i]] = allCountries[availableCountries[i]];
                }
            }
            allCountries = resultCountries;
        }
        if (restrictedCountries && restrictedCountries.length) {
            i = 0;
            var restrictedCountriesLength = restrictedCountries.length;
            for (; i < restrictedCountriesLength; i++) {
                if (allCountries[restrictedCountries[i]]) {
                    delete allCountries[restrictedCountries[i]];
                }
            }
        }
        return allCountries;
    };

    /**
     * @ngdoc method
     * @name setCustomSportAliasesFilter
     * @methodOf vbet5.service:Utils
     * @description Set custom sport aliases filter (Used mainly for CyberSports)
     * @param {Object} Input request
     * @param {Number} Custom sport ID
     */
    Utils.setCustomSportAliasesFilter = function setCustomSportAliasesFilter(request, customIds) {
        if (Config.main.cyberSkin) {
            customIds = Config.main.customSportIds && Config.main.customSportIds.cyber;
        } else {
            customIds = customIds || Utils.getCustomSportAliasFilter();
        }

        if (customIds){
            request.where = request.where || {};
            request.where.sport = request.where.sport || {};
            request.where.sport.id = {'@in': customIds};
        }
        var pmuIdArray = [Config.main.PMUId];
        if (request.where.sport) {
            if (request.where.sport.id && request.where.sport.id['@nin']) {
                request.where.sport.id['@nin'].push(Config.main.PMUId);
            } else if(!request.where.sport.id) {
                request.where.sport.id =  {'@nin': pmuIdArray};
            }
        } else {
            request.where.sport =  {'id': {'@nin': [Config.main.PMUId]}};
        }
    };

    /**
     * Calculates string hash
     * @param {String} str
     * @returns {number}
     */
    Utils.stringHash = function stringHash(str) {
        var hash = 0, i, chr, len;
        if (str.length === 0) return hash;
        for (i = 0, len = str.length; i < len; i++) {
            chr   = str.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    };

    /**
     * Adds memoization to function (returns function that will cache it's results and
     * return results from cache if called again with same arguments)
     * @param {Function} func
     * @returns {Function}
     */
    Utils.memoize = function memoize(func) {
        var cache = {};
        return function() {
            var key = [];
            for(var i = 0; i < arguments.length; i++) {
                key.push(typeof arguments[i] === 'object' ? Utils.stringHash(JSON.stringify(arguments[i])): arguments[i]);
            }
            key = key.join("-");
            cache[func] = cache[func] || {};
            if (!cache[func][key]) {
                cache[func][key] = func.apply(null, arguments);
            }
            // console.log(cache);
            return cache[func][key];
        }
    };

    /**
     * Creates dummy events if there are gaps in the order
     * @param {Array} array
     */
    Utils.createDummyEvents = function createDummyEvents(market) {
        if (market && market.col_count === 2 && market.type && market.type.indexOf("OutcomeTotal") !== -1) {
            var orderList = {}, events = market.events, i, eventsLength = events.length, maxOrder = 0, order, doInsert = false;
            for (i = 0; i < eventsLength; i++) {
                order = events[i].order || 0;
                orderList[order] = order;
                if (order > maxOrder) {
                    maxOrder = order;
                }
            }

            for (i = eventsLength - 1; i >= 0; i--) {
                order = events[i].order || 0;
                if (!orderList[order + 1] && order + 1 <= maxOrder) {
                    events.splice(i, 0, {
                        id: -1 - maxOrder + order,
                        is_empty: true,
                        order: order + 1
                    })
                }
            }
        }
    };

    /**
     * @ngdoc method
     * @name getFirstMarket
     * @methodOf vbet5.service:Utils
     * @description Returns P1XP2 or P1P2 market if they exist or the first market
     * @param {Object} markets market object from backend
     */
    Utils.getFirstMarket = function getFirstMarket(markets) {
        function searchForMarket(markets, marketType) {
            var marketFound;
            for (var market in markets) {
                if (markets[market].type  === marketType) {
                    marketFound = markets[market];
                    break;
                }
            }
            return marketFound;
        }

        var firstMarket = searchForMarket(markets, 'P1XP2');
        if (firstMarket === undefined) {
            firstMarket = searchForMarket(markets, 'P1P2');
        }
        return firstMarket || $filter("firstElement")(markets);
    };

    /**
     * Split array into chunks
     * return converted array
     * @param {Array} arr input array
     * @param {Int} colCount chunks count
     * @returns {Array}
     */
    Utils.splitArrayChunks = function splitArrayChunks (arr, colCount) {
        var chunks = [], len = Math.ceil(arr.length / colCount),
            i = 0,
            n = arr.length;
        while (i < n) {
            chunks.push(arr.slice(i, i += len));
        }
        return chunks;
    };

    /**
     * @ngdoc method
     * @name checkIfDocumentIsValid
     * @methodOf vbet5.controller:RegistrationController
     * @description
     *  checks if document is valid in (TR for now)
     */
    Utils.checkNationalId = function checkNationalId(docNumber, isRequired) {
        if(!isRequired && docNumber.length === 0) {
            return true;
        }
        if (!docNumber || !docNumber.length || docNumber.length !== 11) {
            return false;
        }
        var t = [], i, ilk, son;
        for (i = 0; i < docNumber.length; i++) {
            t[i + 1] = parseInt(docNumber[i], 10);
        }

        ilk = ( (t[1] + t[3] + t[5] + t[7] + t[9]) * 7 - (t[2] + t[4] + t[6] + t[8]) ) % 10;
        son = (t[1] + t[2] + t[3] + t[4] + t[5] + t[6] + t[7] + t[8] + t[9] + t[10]) % 10;

        if (t[1] === 0) {
            return false;
        }

        if (ilk === t[10] && son === t[11]) {
            console.log('Document Valid');
            return true;
        }

        return false;
    };

    /**
     * @ngdoc method
     * @name fixDomainChanges
     * @methodOf vbet5.controller:RegistrationController
     * @description
     *  Fix domain changes
     */
    Utils.fixDomainChanges = function fixDomainChanges(config, product) {
        if ({"localhost":1, "staging.betconstruct.int":1}[$window.location.hostname] || Config.disableAutofixDomainChanges) {return;}

        var locationHost = $window.location.hostname.split(/\./);
        var existedDomain, currentDomain = (locationHost.length === 4) ? locationHost.slice(-3).join(".") : locationHost.slice(-2).join(".");
        var oldDomain;
        switch (product) {
            case 'sportsbook': {
                oldDomain = config.main.redirectOnTablets && config.main.redirectOnTablets.split(/\./);
                if (oldDomain) {
                    existedDomain = (oldDomain.length === 4) ? (oldDomain.slice(-3).join(".")).replace(/\/$/, '') : (oldDomain.slice(-2).join(".")).replace(/\/$/, '');
                    if (existedDomain !== currentDomain) {
                        var fixMenu = function (menu) {
                            if (menu) {
                                for (var i = menu.length; i--;) {
                                    if (menu[i].href) {
                                        menu[i].href = menu[i].href.replace(existedDomain, currentDomain);
                                    }
                                }
                            }
                        };
                        config.main.redirectOnTablets = config.main.redirectOnTablets.replace(existedDomain, currentDomain);
                        config.main.footer.mobileVersionLink && (config.main.footer.mobileVersionLink = config.main.footer.mobileVersionLink.replace(existedDomain, currentDomain));
                        config.main.header.statisticsLink && (config.main.header.statisticsLink = config.main.header.statisticsLink.replace(existedDomain, currentDomain));
                        config.main.statsHostname && config.main.statsHostname.prefixUrl && (config.main.statsHostname.prefixUrl = config.main.statsHostname.prefixUrl.replace(existedDomain, currentDomain));
                        config.main.htmlMetaTags && (config.main.htmlMetaTags = config.main.htmlMetaTags.replace(existedDomain, currentDomain));

                        fixMenu(config.main.headerNavigation.aboveLogo);
                        fixMenu(config.main.headerNavigation.nearLogo);

                        //add case for multiLevelMenu if it contain domain specific urls
                    }
                    return;
                }
                break;
            }
            case 'casino': {
                oldDomain = config.cUrlPrefix && config.cUrlPrefix.split(/\./);
                if (oldDomain) {
                    existedDomain = (oldDomain.length === 4) ? oldDomain.slice(-3).join(".") : oldDomain.slice(-2).join(".");
                    if (existedDomain !== currentDomain) {
                        config.cUrlPrefix = config.cUrlPrefix.replace(existedDomain, currentDomain);
                    }
                    return;
                }
            }
        }
    };

    /**
     * @ngdoc method
     * @name setBodyClass
     * @methodOf vbet5.controller:RegistrationController
     * @description
     *  fixDomainChanges
     */
    Utils.setBodyClass = function setBodyClass(cssClass, group) {
        if (cssClass && group) {
            bodyWrapperClasses[group] = cssClass;
        } else if (group) {
            delete bodyWrapperClasses[group];
        }
        Config.env.bodyWrapperClass = Utils.objectToArray(bodyWrapperClasses).join(' ');
    };

    /**
     * @ngdoc method
     * @name sortItemsArray
     * @methodOf vbet5.service:Utils
     * @param {Array} items
     * @description If order of array items not have give them order index and sort given array by that order
     */
    Utils.sortItemsArray = function sortItemsArray(items) {
        if (items && items.length > 0) {
            var itemsLength = items.length;
            for(var i = 0; i < itemsLength; ++i) {
                var item = items[i];
                if(item.order === undefined){
                    item.order = i;
                }
            }
            items.sort(Utils.orderSorting);
        }
    };


    /**
     * @ngdoc method
     * @name formatEventData
     * @methodOf vbet5.service:Utils
     * @param {Object} data object from SWARM
     * @description Formats SWARM response so that we can add events to the betslip
     */
    Utils.formatEventData = function formatEventData(data) {
        var formattedData = [];

        angular.forEach(data.sport, function(sport) {
            angular.forEach(sport.region, function (region) {
                angular.forEach(region.competition, function (competition) {
                    angular.forEach(competition.game, function (game) {
                        var gameInfo = game;
                        gameInfo.competition = competition;
                        gameInfo.region = region;
                        gameInfo.sport = sport;
                        gameInfo.title = game.team1_name + (game.team2_name ? ' - ' + game.team2_name : '');
                        angular.forEach(game.market, function(market) {
                            var bet = {};
                            bet.gameInfo = gameInfo;
                            bet.marketInfo = market;
                            bet.marketInfo.name = $filter('improveName')(market.name, game);

                            angular.forEach(market.event, function(event) {
                                bet.eventInfo = event;
                                formattedData.push(bet);
                            });
                        });
                    });
                });
            });
        });

        return formattedData;
    };


    /**
     * @ngdoc method
     * @name uniqueNum
     * @methodOf vbet5.service:Utils
     * @param {Array} arr - array of numbers (can be a String)
     * @description Removes duplicate numbers in array
     */
    Utils.uniqueNum = function uniqueNum(arr) {
        if (!arr.length) { return []; }
        return arr.reduce(function(acc, curr) {
            if (curr !== '' && !isNaN(Number(curr)) && acc.indexOf(Number(curr)) === -1) {
                acc.push(Number(curr));
            }
            return acc;
        }, []);
    };

    /**
     * @ngdoc method
     * @name copyObj
     * @methodOf vbet5.service:Utils
     * @description Deep copies object (faster then angular.copy)
     */
    Utils.copyObj = function copyObj(o) {
        var newO,
            i;

        if (typeof o !== 'object') {
            return o;
        }
        if (!o) {
            return o;
        }

        if ('[object Array]' === Object.prototype.toString.apply(o)) {
            newO = [];
            for (i = 0; i < o.length; i += 1) {
                newO[i] = Utils.copyObj(o[i]);
            }
            return newO;
        }

        newO = {};
        for (i in o) {
            if (o.hasOwnProperty(i)) {
                newO[i] = Utils.copyObj(o[i]);
            }
        }
        return newO;
    };

    /**
     * @ngdoc method
     * @name getPrefixLink
     * @methodOf vbet5.service:Utils
     * @description prefixes given link with hostname depending on config
     *
     * @param {String} link relative link
     * @returns {String} absolute or relative link depending on match in config
     */
    Utils.getPrefixLink = function getPrefixLink(link) {
        if (Config.main.domainSpecificPrefixes && Config.main.domainSpecificPrefixes[$window.location.hostname] && (Config.main.domainSpecificPrefixes[$window.location.hostname][link] || Config.main.domainSpecificPrefixes[$window.location.hostname][link + '/'])) {
            return (Config.main.domainSpecificPrefixes[$window.location.hostname][link] || Config.main.domainSpecificPrefixes[$window.location.hostname][link + '/']) + link;
        }
        return null;
    };

    /**
     * @ngdoc method
     * @name checkAndSetCookie
     * @methodOf vbet5.service:Utils
     * @description  Sets cookie if enabled in config
     * @param {String} key's of cookie
     * @param {Object} value's of cookie
     * @param {Number} expirationDate
     */
    Utils.checkAndSetCookie = function checkAndSetCookie(key, value, expirationDate) {
        if (value && Config.main.useAuthCookies) {
            var cookieOptions = {
                domain: $window.location.hostname.split(/\./).slice(-2).join("."),
                path: "/",
                expires: new Date((new Date()).getTime() + expirationDate),
                samesite: 'None',
                secure: true,
            };
            var cookieMethod = value instanceof Object ? 'putObject' : 'put';
            $cookies[cookieMethod](key, value, cookieOptions);
        }
    };

    /**
     * @ngdoc method
     * @name compare
     * @methodOf vbet5.service:Utils
     * @description Comparator function. Used for comparing multiple parameters in one step
     */
    Utils.compare = function compare(a, b) {
        if (a > b) { return 1; }
        if (a < b) { return -1; }
        return 0;
    };

    /**
     * @ngdoc method
     * @name getIndexOf
     * @methodOf vbet5.service:Utils
     * @description finds index of target value in an array of objects
     * @param {Array} source - source array
     * @param {String} prop - property name
     * @param {Number|String|Boolean} target - target value
     * @returns {Number} index
     */
    Utils.getIndex = function getIndex(source, prop, target) {
        var i = 0, l = source.length;
        for (; i < l; i++) {
            if (source[i][prop] === target) {
                return i;
            }
        }
        return -1;
    };

    /**
     * /**
     * @ngdoc method
     * @name guid
     * @methodOf vbet5.service:Utils
     * @description The function generates uid. It can be used as `key`-s needed for
     * @returns {String} uid
     */

    Utils.guid = function guid() {
        return Math.random().toString(36).substr(2, 9);
    };

    /**
     * @ngdoc method
     * @name copyToClipboard
     * @methodOf vbet5.service:Utils
     * @description Copy to clipboard given text
     * @param {String} str
     */
    Utils.copyToClipboard = function copyToClipboard(str) {
        var el = document.createElement('textarea');
        el.value = str;
        el.setAttribute('readonly', '');
        el.style = {position: 'absolute', left: '-9999px'};
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    };


    /**
     * @ngdoc method
     * @name getAllUrlParams
     * @methodOf vbet5.service:Utils
     * @description parsing url string
     * @param {String} href
     */
    Utils.getAllUrlParams = function getAllUrlParams(href) {
        var params = {};
        var path = '';
        var host = '';
        var url = '';
        if(href && typeof href === 'string'){
            var a = href.split('#');

            if (a[0] && typeof a[0] === 'string') {
                host = a[0];
            }

            if(a[1] && typeof a[1] === 'string'){
                url = a[1];
                var b = a[1].split('?');

                if (b[0] && typeof b[0] === 'string') {
                    path = b[0];
                }

                if (b[1] && typeof b[1] === 'string') {
                    var c = b[1].split('&');
                    angular.forEach(c, function (d) {
                        if(d && typeof d === 'string'){
                            d = d.split('=');
                            params[d[0]] = d[1];
                        }
                    });
                }
            }
        }

        return {params: params, path: path, host: host, url: url};
    };


    /**
     * @ngdoc method
     * @name sortMarketGroupsWithNestedEvents
     * @methodOf vbet5.service:Utils
     * @description Sort lists deeply with all levels
     * @param {Array} markets
     */
    Utils.sortMarketGroupsWithNestedEvents = function sortMarketGroupsWithNestedEvents(markets) {
        markets.sort(function (a, b) {
            return a[0].order - b[0].order;
        });
        for (var i = markets.length; i--;) {
            markets[i].sort(Utils.orderSorting);
            for (var j = markets[i].length; j--;) {
                markets[i][j].events.sort(Utils.orderSorting);
            }
        }
    };

    /**
     * @ngdoc method
     * @name convertPascalStrToSnake
     * @methodOf vbet5.service:Utils
     * @description Convert string from pascal case to snake case
     * @param {String} str
     */
    Utils.convertPascalStrToSnake = function convertPascalStrToSnake(str) {
        return str.split(/(?=[A-Z])/).join('_').toLowerCase();
    };

    /**
     * @ngdoc method
     * @name convertPascalArrayToSnakeCase
     * @methodOf vbet5.service:Utils
     * @description Convert in array objects keys from pascal case to snake case.
     * @param {array} array
     */
    Utils.convertPascalArrayToSnakeCase = function convertPascalArrayToSnakeCase(array) {
        array.forEach(function(v) {
            if (v) {
                if (v.constructor === Object) {
                    Utils.convertPascalObjectToSnakeCase(v);
                } else if (v.constructor === Array) {
                    Utils.convertPascalArrayToSnakeCase(v);
                }
            }
        });
    };

    /**
     * @ngdoc method
     * @name convertPascalObjectToSnakeCase
     * @methodOf vbet5.service:Utils
     * @description Convert object keys from pascal case to snake case
     * @param {object} obj
     */
    Utils.convertPascalObjectToSnakeCase = function convertPascalObjectToSnakeCase(obj) {
        Object.keys(obj).forEach(function(k){
            if (obj[k]) {
                if (obj[k].constructor === Object) {
                    Utils.convertPascalObjectToSnakeCase(obj[k]);
                } else if (obj[k].constructor === Array) {
                    Utils.convertPascalArrayToSnakeCase(obj[k]);
                }
            }

            var sck = Utils.convertPascalStrToSnake(k);
            if (sck !== k) {
                obj[sck] = obj[k];
                delete obj[k];
            }
        });
    };

    /**
     * @ngdoc method
     * @name cutDecimalNumberAfterPlace
     * @methodOf vbet5.service:Utils
     * @description Cut number to after point place
     * @param {number} num
     * @param {number} place
     */
    Utils.cutDecimalNumberAfterPlace = function cutDecimalNumberAfterPlace(num, place) {
        var re = new RegExp('^-?\\d+(?:\.\\d{0,' + (place || -1) + '})?');
        return num.toString().match(re)[0];
    };
    /**
     * @ngdoc method
     * @name cutDecimalNumberAfterPlace
     * @methodOf vbet5.service:Utils
     * @description Format decimal number with given mode
     * @param {number} num
     * @param {number} mode 0 or 1
     * @param {number} decimalPrice

     */
    Utils.formatDecimal = function formatDecimal(num, mode, decimalPrice) {
        num = Utils.fixFloatError(num);
        if (mode === 0) {
            return Utils.cuttingDecimals(num, decimalPrice);
        } else  {
            var multiplier = Math.pow(10, decimalPrice);
            return Math.round(num * multiplier) / multiplier;
        }

    };

    /**
     * @ngdoc method
     * @name bankersRounding
     * @methodOf vbet5.service:Utils
     * @description Bankers round with decimal places
     * @param {number} num
     * @param {number} decimalPlaces

     */
    Utils.bankersRounding = function bankersRounding(num, decimalPlaces) {
        num = Utils.fixFloatError(num);
        var m = Math.pow(10, decimalPlaces);
        var n = +(decimalPlaces ? num * m : num).toFixed(8); // Avoid rounding errors
        var i = Math.floor(n),
            f = n - i;
        var e = 1e-8; // Allow for rounding errors in f
        var r = f > 0.5 - e && f < 0.5 + e ? (i % 2 === 0 ? i : i + 1) : Math.round(n);
        return decimalPlaces ? r / m : r;
    };

    /**
     * @ngdoc method
     * @name bankersRounding
     * @methodOf vbet5.service:Utils
     * @description Bankers round with decimal places
     * @param {number} num
     * @param {number} decimalPlaces
     */
    Utils.fixFloatError = function fixFloatError(num) {
        return parseFloat(num.toPrecision(12));
    };


    /**
     * @ngdoc method
     * @name cuttingDecimals
     * @methodOf vbet5.service:Utils
     * @description cutting decimals without rounding
     * @param {number} num
     * @param {number} decimalPlaces
     */
   Utils.cuttingDecimals = function cuttingDecimals(num, decimalPlaces) {
       num = Utils.fixFloatError(num);
       var m = Math.pow(10, decimalPlaces);
        var n = +(decimalPlaces ? num * m : num).toFixed(8); // Avoid rounding errors
        var r = Math.floor(n);
        return decimalPlaces ? r / m : r;
    };

    /**
     * @ngdoc method
     * @name numberWithCommas
     * @methodOf vbet5.service:Utils
     * @description showing number 3 characters separated with commas
     * @param {number} num
     */
    Utils.numberWithCommas = function numberWithCommas(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };


    /**
     * @ngdoc method
     * @name replaceTextPlaceholdersByObjectValues
     * @methodOf vbet5.service:Utils
     * @description replaceing text placeholders to object value
     * @param {String} text
     * @param {Object} object
     */
    Utils.replaceTextPlaceholdersByObjectValues = function replaceTextPlaceholdersByObjectValues(text, object) {

        var result = text;

        if (result && typeof result === 'string') {
            var regex = /{(.*?)}/gm;
            var placeholders = result.match(regex);

            if (placeholders) {
                placeholders.forEach(function (placeholder) {
                    var fieldName = placeholder.replace('{', '').replace('}', '');
                    if (fieldName && object && object[fieldName]) {
                        result = result.replace(placeholder, object[fieldName]);
                    }
                });
            }
        }

        return result;
    };

    Utils.debounce = function debounce(func, wait, immediate) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    /**
     * @ngdoc method
     * @name calculatePermutationCount
     * @methodOf vbet5.service:Utils
     * @description calculate permutation count
     * @param {number} n
     * @param {number} k
     */
    Utils.calculatePermutationCount = function calculatePermutationCount(n, k) {
        return Utils.factorial(n) / Utils.factorial(n - k);
    };

    /**
     * @ngdoc method
     * @name calculateTax
     * @methodOf vbet5.service:Utils
     * @description Calculate tax for given possible win and stake
     * @param {Number} possibleWin
     * @param {Number} stake
     */
    Utils.calculateTax =  Utils.memoize(function calculateTax(possibleWin, stake) {
        var tax = 0;
        var taxPercent = $rootScope.partnerConfig.tax_percent;
        if ($rootScope.partnerConfig.tax_type === 20 && taxPercent) {
            tax =  possibleWin  * (taxPercent / 100);
        } else if ({1: 1, 2:1}[$rootScope.partnerConfig.tax_type]) {
            var ranges = $rootScope.partnerConfig.tax_amount_ranges;
            var netWin = possibleWin - ($rootScope.partnerConfig.tax_type === 1? stake : 0);
            var isContains = false;
            if (ranges && ranges.length) {
                for (var i = ranges.length; i--;) {
                    var range = ranges[i];
                    if (range.entire_amount?(netWin >= range.from && netWin < range.to):(netWin > range.from && netWin <= range.to)) {
                        isContains = true;
                        break;
                    }
                }
            }
            if (!isContains) {
                tax =  netWin * (taxPercent / 100);
            } else {
                var length = ranges.length;
                var remain = netWin;
                for (var i = 0; i < length; ++i) {
                    var range = ranges[i];
                    if (range.entire_amount?remain > range.to:remain >= range.to) {
                        tax += range.to * (range.percent / 100);
                        remain -= range.to;
                    } else {
                        tax += remain * (range.percent / 100);
                        break;
                    }

                }
            }
        }
        return tax;
    });

    /**
     * @ngdoc method
     * @name getFirstKeyValue
     * @methodOf vbet5.service:Utils
     * @description get first key value of object
     * @param {Object} obj
     * @param {Function} callback
     * */
     Utils.getFirstKeyValue = function getFirstKeyValue(obj, callback) {
            if (!obj) {
                return;
            }
            var keys = Object.keys(obj);
            if (keys.length > 0) {
                callback(obj[keys[0]]);
            }
     };

    /**
     * @ngdoc method
     * @name getSMSCode
     * @methodOf vbet5.service:Utils
     *
     * @description open popup to get sms confirmation code
     * @param {int} type the  possible values: 1 - registration, 2 - login,  3 - passwordChange,  4 - profileUpdate, 5 - passwordReset, 13 - withdraw
     * @param {string} userIdentifier the user identifier
     * @param {string} [confirmationCode] the  predefined confirmation code
     * @param {string} [error] - the predefined error
     *
     * @returns {Object} promise
     * */
    Utils.getSMSCode = function getSMSCode(type, userIdentifier, confirmationCode, error) {
        var defer = $q.defer();
        var result = defer.promise;

        $rootScope.broadcast('globalDialogs.addDialog', {
            template: 'templates/popup/sms-verification.html',
            type: 'template',
            tag: "SMS_VERIFICATION_POPUP",
            state: {
                type: type,
                userIdentifier: userIdentifier,
                confirmationCode: confirmationCode || "",
                error: error || "",
                successCallBack: function(code) {
                    if (code) {
                        defer.resolve(code);
                    } else {
                        defer.reject(code);
                    }
                }
            },
            hideButtons: true,
            hideCloseButton: true
        });
        return result;
    };

    Utils.getPaymentIcons = function getPaymentIcons(payments) {
       return payments.sort(Utils.orderSorting).reduce(function (accumulator, current) {
            if (!current.isTransferToLinkedService && (current.canDeposit || current.canWithdraw) && !current.hidePaymentInFooter) {
                accumulator.push({
                    name: current.name,
                    image: current.image
                });
            }
            return accumulator;
        }, []);
    };

    Utils.getSpriteUrl = function getSpriteUrl(Config, WPConfig) {
        return (Config.main.cmsDataDomain ||  WPConfig.wpUrl.split("/json")[0]) +  Config.main.footer.imageInsteadPayments + "?v=" + Config.releaseDate;
    };

    var SLUG_RE = /\s|&|%\//g;
    Utils.generateSlugFromName = function generateSlugFromName(name)  {
        return name.toLowerCase().replace(SLUG_RE, "-");
    };

    Utils.addPrematchExpressId = function addPrematchExpressId(request) {
        var jsonRequestWhat = JSON.stringify(request.what);
        if (!$rootScope.partnerConfig || $rootScope.partnerConfig._not_loaded || $rootScope.partnerConfig.prematch_multiple_disabled === false || previouseRequests.indexOf(jsonRequestWhat) > -1) {
            request.what.market.push('prematch_express_id');
        }
        if (!$rootScope.partnerConfig  || $rootScope.partnerConfig._not_loaded) {
            previouseRequests.push(jsonRequestWhat);
        }
        return request;
    };

    Utils.calculateExpressId = function calculateExpressId(market, type) {
        if (type !== 1  &&
            $rootScope.partnerConfig.prematch_multiple_disabled === false &&
            market.prematch_express_id !== undefined
        ) {
            return market.prematch_express_id;
        }
        return market.express_id;
    };

    Utils.validateRecaptchaBeforeAction = function validateRecaptchaBeforeAction(RecaptchaService, actionName, getToken) {
        var promiseHandler = $q.defer();
        if (Config.main.validateRecaptchaBeforeAction) {
            RecaptchaService.execute(actionName, { debounce: false, check:getToken }).then(function (response) {
                if (getToken) {
                    promiseHandler.resolve(response);
                } else if (response && response.data && response.data.code === 0) {
                    promiseHandler.resolve(true);
                } else {
                    promiseHandler.resolve(false);
                    throw new Error(response);
                }
            }, function (reject) {
                promiseHandler.resolve(false);

                throw new Error(reject);
            });
        } else {
            promiseHandler.resolve(false);
        }
        return promiseHandler.promise;
    };

    return Utils;
}]);
