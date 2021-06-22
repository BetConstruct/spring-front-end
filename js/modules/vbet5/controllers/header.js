/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:headerCtrl
 * @description
 * header controller
 */
VBET5.controller('headerCtrl', ['$scope', '$rootScope', '$sce', '$window', '$location', '$filter', 'Zergling', 'Utils', '$route', 'Storage', 'Config', function ($scope, $rootScope, $sce, $window, $location, $filter, Zergling, Utils, $route, Storage, Config) {
    'use strict';

    /**
     * @ngdoc method
     * @name setCurrencyConfig
     * @methodOf vbet5.controller:headerCtrl
     * @description
     * retrieves currency config from swarm and if successful overrides main config **balanceFractionSize** and
     * sets $rootScope **currency** variable with retrieved data
     * currency name sent to swarm is taken from config(default for site) or from user profile if user is logged in
     */
    function setCurrencyConfig() {
        var currencyName;

        if ($rootScope.profile && $rootScope.profile.currency_name) {
            currencyName = $rootScope.profile.currency_name;
        } else {
            currencyName = $rootScope.conf.registration.defaultCurrency;
        }
        if (!currencyName) {
            return;
        }
        Zergling.get({
            'source': 'config.currency',
            'what': {
                'currency': []
            },
            'where': {
                'currency': {
                    'name': currencyName
                }
            }
        }).then(function (response) {
            if (response.data && response.data.currency) {
                console.log('currency:', response);
                $rootScope.currency = $filter('firstElement')(response.data.currency);
                if ($rootScope.currency && $rootScope.currency.rounding !== undefined) {
                    $rootScope.conf.balanceFractionSize = Math.abs($rootScope.currency.rounding);
                    console.log('balanceFractionSize', $rootScope.conf.balanceFractionSize);
                }
            }
        });
    }

    /**
     * @ngdoc method
     * @name getPartnerConfig
     * @methodOf vbet5.controller:headerCtrl
     * @description get partner Config
     */
    function getPartnerConfig() {
        $rootScope.partnerConfig = {_not_loaded: true};
        function updatePartnerConfig(data) {
            if (data && data.partner) {
                $rootScope.partnerConfig = data.partner[Config.main.site_id] || {};

                if ($rootScope.partnerConfig.tax_amount_ranges && $rootScope.partnerConfig.tax_amount_ranges.length) {
                    $rootScope.partnerConfig.tax_amount_ranges = Utils.orderByField($rootScope.partnerConfig.tax_amount_ranges, 'from');

                    if ($rootScope.partnerConfig.tax_type && $rootScope.partnerConfig.tax_type !== 4) {
                        $rootScope.partnerConfig.tax_amount_ranges = $rootScope.partnerConfig.tax_amount_ranges.filter(function (item) {
                            return item.type === $rootScope.partnerConfig.tax_type;
                        });
                    }
                }

                Config.main.availableCurrencies = $rootScope.partnerConfig.supported_currencies;

                if ($rootScope.partnerConfig.supported_currencies.indexOf($rootScope.partnerConfig.currency) > -1 ) {
                    Config.main.registration.defaultCurrency = $rootScope.partnerConfig.currency;
                } else {
                    Config.main.registration.defaultCurrency = $rootScope.partnerConfig.supported_currencies[0];
                }

                $rootScope.partnerConfig.smsVerification = {};
               // $rootScope.partnerConfig.sms_restrictions = [1,2,4,13,3,5]; // todo

                if ($rootScope.partnerConfig.sms_restrictions && $rootScope.partnerConfig.sms_restrictions.length) {
                    $rootScope.partnerConfig.smsVerification.registration = $rootScope.partnerConfig.sms_restrictions.indexOf(1) !== -1;
                    $rootScope.partnerConfig.smsVerification.login = $rootScope.partnerConfig.sms_restrictions.indexOf(2) !== -1;
                    $rootScope.partnerConfig.smsVerification.changePassword = $rootScope.partnerConfig.sms_restrictions.indexOf(3) !== -1;
                    $rootScope.partnerConfig.smsVerification.updateProfile = $rootScope.partnerConfig.sms_restrictions.indexOf(4) !== -1;
                    $rootScope.partnerConfig.smsVerification.resetPassword = $rootScope.partnerConfig.sms_restrictions.indexOf(5) !== -1;
                    $rootScope.partnerConfig.smsVerification.withdrawal = $rootScope.partnerConfig.sms_restrictions.indexOf(13) !== -1;
                }

                $rootScope.$broadcast('partnerConfig.updated');
            }
            if(Config.partner && Config.partner.profileNotAvailable && $rootScope.partnerConfig) {
                $rootScope.partnerConfig.profileNotAvailable = Config.partner.profileNotAvailable;
            }
        }
        Zergling.subscribe({
            "source": "partner.config",
            'what': {'partner': []}
            //'where': {}
        }, updatePartnerConfig).then(function(response) {
            if (response) {
                updatePartnerConfig(response.data);
            }
        });
    }

    if ($rootScope.partnerConfig === undefined) {
        if (!Config.main.availableCurrencies) {
            Config.main.availableCurrencies = []; // initial
        }
        getPartnerConfig();
    }

    $scope.gotoUrl = function gotoUrl (url, target) {
        if (target) {
            window.open(url, target);
        } else {
            $window.location = url;
        }
    };

    /**
     * @ngdoc method
     * @name answer
     * @methodOf vbet5.controller:headerCtrl
     * @description closes yes/no dialog and broadcasts user's answer
     * @param {String} usersAnswer user's answer
     */
    $scope.answer = function answer(usersAnswer) {
        console.log('answer', usersAnswer);
        $rootScope.$broadcast('dialog.' + usersAnswer);
        $rootScope.yesNoDialog = null;
    };

    function gotoSelectedGame(event, data) {
        $location.search({
            'type': parseInt(data.type) === 1 ? 1 : 0,
            'sport': data.sport.id !== undefined ? data.sport.id : data.sport,
            'region': data.region,
            'competition': data.competition,
            'game': data.game
        });

        var neededPath = Utils.getPathAccordintToAlias(data.sport.alias);
        if ($location.path() !== neededPath + '/') {
            $location.path(neededPath);
        }

        $route.reload();
        $rootScope.$broadcast('slider.close');
    }

    /**
     * @ngdoc method
     * @name handleVideoUrl
     * @methodOf vbet5.controller:headerCtrl
     * @description Converts youtube URL to trusted
     */
    function handleVideoUrl(event, url) {
        url = url.replace('watch?v=', 'embed/');
        $scope.youtubeVideoUrl = $sce.trustAsResourceUrl(url);
    }

    /**
     * @ngdoc method
     * @name showGoogleMap
     * @methodOf vbet5.controller:headerCtrl
     * @description handles map data
     */
   /* function showGoogleMap(event, data) {
        $scope.mapData = {
            name: data.name || 'Stadium',
            coords: '[' + data.latitude + ', ' + data.longitude + ']'
        };
    }*/

    /**
     * @ngdoc method
     * @name routeChangeSuccess
     * @methodOf vbet5.controller:headerCtrl
     * @description Sets env value on route change
     */
    function routeChangeSuccess() {
        if ($location.path() === '/dashboard/') {
            $rootScope.env.preMatchMultiSelection = false;
        } else {
            $rootScope.env.preMatchMultiSelection = Storage.get('preMatchMultiSelection') !== undefined ? Storage.get('preMatchMultiSelection') : $rootScope.env.preMatchMultiSelection;
        }

        console.log("$routeChangeSuccess:", $location.path());
    }

    /**
     * @ngdoc method
     * @name headerInit
     * @methodOf vbet5.controller:headerCtrl
     * @description  header initialization.
     * starts to listen needed events
     */
    $scope.headerInit = function headerInit(){
        $scope.$on('loggedIn', setCurrencyConfig);
        $scope.$on('partnerConfig.updated', setCurrencyConfig);
        $scope.$on('login.loggedOut', setCurrencyConfig);
        $scope.$on('gotoSelectedGame', gotoSelectedGame);
        //this isn't really the best place for this listener
        $scope.$on('$routeChangeSuccess', routeChangeSuccess);
        $scope.$on('youtube.videourl', handleVideoUrl);
       /* $scope.$on('google.map', showGoogleMap);*/
    };
}]);
