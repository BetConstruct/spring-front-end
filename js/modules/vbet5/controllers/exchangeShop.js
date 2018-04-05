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
        order: {},
        fields: [
            {name: 'contact_number', label: 'Contact number', required: true},
            {name: 'additional_number', label: 'Additional number'},
            {name: 'country_code', label: 'Country', required: true, country: true},
            {name: 'city', label: 'City', required: true},
            {name: 'address', label: 'Address', required: true},
            {name: 'agree', label: 'Agree', required: true, hidden: true, error: 'You need to confirm the agreements.'}
        ]
    };

    $scope.countryCodesByKey = Utils.getAvailableCountries(CountryCodes);
    $scope.countryCodes = Utils.objectToArray($scope.countryCodesByKey, 'key');

    /**
     * @ngdoc method
     * @name showItemDetails
     * @methodOf vbet5.controller:exchangeShopCtrl
     * @description Open item details
     * @param {Object} Item data
     */
    $scope.showItemDetails = function showItemDetails(item) {

        setFormData();
        $scope.shop.order.color = '';
        $scope.shop.order.valid = true;

        $scope.shop.details = item;

        //$scope.shop.details.availableColors = ['#FF0000', '#00FF00', '#0000FF'];
        $scope.shop.details.availableCounts = [];
        if ($rootScope.profile && $rootScope.profile.loyalty_earned_points && $scope.shop.details.price && $scope.shop.details.price > 0) {
            var counts = $rootScope.profile.loyalty_earned_points / $scope.shop.details.price, i;
            counts = counts > 10 ? 10 : counts;
            if (counts >= 2) {
                for (i = 1; i <= counts; i++) {
                    $scope.shop.details.availableCounts.push(i);
                }
            }
        }

        $scope.shop.order.count = 1;
        $scope.shop.order.agree = false;
        $scope.shop.step = 0;
        $scope.shop.sliderIndex = 0;
    };

    /**
     * @ngdoc method
     * @name shopConfirm
     * @methodOf vbet5.controller:exchangeShopCtrl
     * @description Action when you press next or confirm
     */
    $scope.shopConfirm = function shopConfirm () {
        switch ($scope.shop.step) {
            case 0:

                if ($scope.shop.details.simple) {
                    doExchange();
                    break;
                }

                setFormData();

                $scope.shop.order.itemId = $scope.shop.details.id;

                $scope.shop.step = 1;

                break;
            case 1:

                $scope.shop.step = 2;
                validateData();
                break;
            case 2:
                doExchange();
                break;
        }
    };

    /**
     * @ngdoc method
     * @name shopBack
     * @methodOf vbet5.controller:exchangeShopCtrl
     * @description Action when you press "not now" or back
     */
    $scope.shopBack = function shopBack () {
        switch ($scope.shop.step) {
            case 0:
                $scope.shop.details = null;
                break;
            default:
                $scope.shop.step --;
                break;
        }
    };

    /**
     * @ngdoc method
     * @name setFormData
     * @methodOf vbet5.controller:exchangeShopCtrl
     * @description Fix form data from profile if needed
     */
    function setFormData () {
        if ($rootScope.profile) {
            $scope.shop.order.contact_number = $scope.shop.order.contact_number || $rootScope.profile.phone || '';
            $scope.shop.order.additional_number = $scope.shop.order.additional_number || '';
            $scope.shop.order.country_code = $scope.shop.order.country_code || $rootScope.profile.country_code || '';
            $scope.shop.order.city = $scope.shop.order.city || $rootScope.profile.city || '';
            $scope.shop.order.address = $scope.shop.order.address || $rootScope.profile.address || '';
        }
    }

    /**
     * @ngdoc method
     * @name doExchange
     * @methodOf vbet5.controller:exchangeShopCtrl
     * @description Send exchange request
     */
    function doExchange() {
        if (!$scope.shop.order.valid) {
            return;
        }
        $scope.shop.order.translactionInProgress = true;

        var request = {
            address: $scope.shop.order.country_code + ' ' + $scope.shop.order.city + ' ' + $scope.shop.order.address,
            note: 'Contact Number:' + $scope.shop.order.contact_number + ($scope.shop.order.additional_number ? ', ' + $scope.shop.order.additional_number : '') + ($scope.shop.order.color ? ' Color:' + $scope.shop.order.color : ''),
            created_ts: Moment.get().unix(),
            shop_order_items: [{
                item_id: parseInt($scope.shop.details.id, 10),
                count: $scope.shop.order.count
            }]
        };

        console.log('Exchange shop', request);

        Zergling.get(request, 'create_shop_order').then(function (response) {
            if (response && parseInt(response.result, 10) === 0) {
                exchangeReponse(true);
            } else {
                exchangeReponse(false);
            }
        }, function (failResponse) {
            exchangeReponse(false);
        })['finally'](function() {
            $scope.shop.order.translactionInProgress = false;
        });
    }

    /**
     * @ngdoc method
     * @name exchangeReponse
     * @methodOf vbet5.controller:exchangeShopCtrl
     * @description Show reponse dialog
     * @param {Boolean} true if success
     */
    function exchangeReponse (success) {
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
     * @name validateData
     * @methodOf vbet5.controller:exchangeShopCtrl
     * @description Validate form data
     */
    function validateData() {
        $scope.shop.order.valid = true;
        $scope.shop.order.error = {};
        angular.forEach($scope.shop.fields, function (field) {
            if (field.required) {
                if (angular.isString($scope.shop.order[field.name]) ? $scope.shop.order[field.name].trim() === '' : !$scope.shop.order[field.name]) {
                    $scope.shop.order.valid = false;
                    $scope.shop.order.error[field.name] = field.error || true;
                }
            }
        });
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

                $scope.shop.products = response.data.products;

                console.log('Shop products', $scope.shop.products);

            } else {
                $location.path('#/');
            }
        }, function () {
            $location.path('#/');
        });
    }

    initExchangeShop();
}]);
