/* global VBET5 */

/**
 * @ngdoc controller
 * @name vbet5.controller:exchangeShopCtrl
 * @description
 * Exchange shop controller
 */
angular.module('vbet5.betting').controller('exchangeShopCtrl', ['$scope', '$rootScope', '$http', '$location', 'content', 'Translator', 'Utils', 'CountryCodes', 'Moment', 'Zergling', function ($scope, $rootScope, $http, $location, content, Translator, Utils, CountryCodes, Moment, Zergling) {
    'use strict';
    $scope.shop = {
        details: null,
        order: {}

    };

    $scope.countryCodesByKey = Utils.getAvailableCountries(CountryCodes);
    $scope.countryCodes = Utils.objectToArray($scope.countryCodesByKey, 'key');

    /**
     * @ngdoc method
     * @name showItemDetails
     * @methodOf vbet5.controller:exchangeShopCtrl
     * @description Open item details
     * @param {Object} item data
     */
    $scope.showItemDetails = function showItemDetails(item) {
        $scope.shop.details = item;
        $scope.shop.sliderIndex = 0;
    };

    /**
     * @ngdoc method
     * @name shopConfirm
     * @methodOf vbet5.controller:exchangeShopCtrl
     * @description do exchange
     */
    $scope.shopConfirm = function shopConfirm() {
        if ($scope.shop.details.price > $rootScope.profile.loyalty_point) {
            return;
        }
        $scope.shop.order.transactionInProgress = true;

        var request = {
            created_ts: Moment.get().unix(),
            shop_order_items: [{
                item_id: parseInt($scope.shop.details.id, 10),
                count: 1
            }]
        };

        Zergling.get(request, 'create_shop_order').then(function (response) {
            if (response && parseInt(response.result, 10) === 0) {
                exchangeResponse(true);
            } else {
                exchangeResponse(false);
            }
        }, function () {
            exchangeResponse(false);
        })['finally'](function() {
            $scope.shop.order.transactionInProgress = false;
        });
    };

    /**
     * @ngdoc method
     * @name shopBack
     * @methodOf vbet5.controller:exchangeShopCtrl
     * @description Action when you press "not now" or back
     */
    $scope.shopBack = function shopBack () {
        $scope.shop.details = null;
    };


    /**
     * @ngdoc method
     * @name exchangeResponse
     * @methodOf vbet5.controller:exchangeShopCtrl
     * @description Show response dialog
     * @param {Boolean} success , true if success
     */
    function exchangeResponse (success) {
        if (success) {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'info',
                title: 'Success',
                content: 'Point Exchange was successful.'
            });
        } else {
            $rootScope.$broadcast("globalDialogs.addDialog", {
                type: 'error',
                title: 'Error',
                content: 'There was an error processing your request'
            });
        }
        $scope.shop.details = null;
    }


    /**
     * @ngdoc method
     * @name initExchangeShop
     * @methodOf vbet5.controller:exchangeShopCtrl
     * @description initialization
     */
    function initExchangeShop() {
        $scope.shop.loading = true;
        content.getExchangeShopData().then(function (response) {
            $scope.shop.loading = false;
            if (response.data && response.data.products) {

                angular.forEach(response.data.products, function (product) {
                    product.price = parseFloat(product.price);
                    if (!product.images || !product.images.length) {
                        product.images = product.images || [];
                        product.images.push({
                            image: 'images/loyalty-points/DefaultProduct.png'
                        });
                    }
                });
                $scope.shop.products = Utils.orderByField(response.data.products, "price");
            } else {
                $location.path('#/');
            }
        }, function () {
            $location.path('#/');
        });
    }

    initExchangeShop();
}]);
