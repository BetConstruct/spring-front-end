/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:odd
 * @description market type loader service
 *
 */
VBET5.service('MarketTypes', ['$q', 'Zergling', 'Utils', function ($q, Zergling, Utils) {

    this.load = function loadMarketTypes() {
        var promiseContainer =$q.defer();
        if (this.data) {
            promiseContainer.resolve();
        } else {
            var t = this;
            Zergling.get({}, "get_market_type").then(function processMarketTypes(data) {
                t.data = Utils.groupByItemProperty(data.details, 'SportId');
                promiseContainer.resolve();
            });
        }
        return promiseContainer.promise;
    };

    this.get = function getMarketBySport(sportId) {
        return this.data && this.data[sportId] && this.data[sportId].map(function (item) {
            item.MarketTypeName = item.MarketTypeName.replace(/\{sw\}|\{s\}/g, '1');
            return item;
        });
    };
}]);
