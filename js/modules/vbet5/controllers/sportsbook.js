/**
 * @ngdoc controller
 * @name CASINO.controller:casinoSpecialGamesCtrl
 * @description
 * special games pages controller
 */
VBET5.controller('sportsbookCtrl', ['$rootScope', '$scope', '$location', '$window', 'Script', 'Config', function ($rootScope, $scope, $location, $window, Script, Config) {
    'use strict';

    $rootScope.footerMovable = true; // make footer movable

    /**
     * @ngdoc method
     * @name loadExternalSportsbook
     * @methodOf vbet5.controller:sportsbookCtrl
     * @description Prepares external sportsbook iframe container
     */
    $scope.loadExternalSportsbook = function loadExternalSportsbook() {
        console.log('loadScript');
        $window.betConstructCallbackHandler = function (params) {
            console.log('betConstructCallbackHandler', params);
        };
        var deepLink = "";
        if ($location.search().type !== undefined) {
            if ($location.search().game !== undefined) {
                deepLink = "&deeplink=" + ($location.search().type == "1" ? "live/" : "line/game/") + $location.search().game;
                console.log("deepLink: ", deepLink, $location.search().type);
            } else if ($location.search().type) {
                deepLink = "&page=" + ($location.search().type ? 'live' : 'prematch');
            }
        }
        $rootScope.timezoneIsAvailable.promise.then(function (tz) {

            var externalLanguage = ($scope.liveModuleLangMapping[Config.env.lang] || 'eng');
            var gmt = tz.split(':')[0];

            if (!Config.main.liveModule.newWay) {
                var liveModuleUrl = Config.main.liveModule.url.length ? Config.main.liveModule.url : ($window.location.protocol + '//' + "livemodule." + $window.location.host.split('.').slice(-2).join('.'));

                var url = liveModuleUrl + '/partner_api/initHtmlWidget.js.php?containerID=BetConstructObject&lang=' + externalLanguage +
                    '&callbackName=betConstructCallbackHandler&AuthToken=anonymous&widget=widget_embed&skinName=' +
                    Config.main.liveModule.skin + deepLink + '&gmt=' + gmt + '&beforeInit=getZergling';

                Script('https://code.jquery.com/jquery-1.11.2.min.js', function () {
                    console.log('loading sportsbook script', url);
                    $scope.sportsbookLoading = false;
                    Script(url);
                });
            } else {
                Script('https://code.jquery.com/jquery-1.9.0.js', function () {
                    Script('eastern-view/htmlHelper.js?' + Date.now(), function () {
                        console.log('eastern sportsbook loaded');
                        $scope.sportsbookLoading = false;
                        var widgetInit = function () {
                            var _htmlAppHelper = {
                                wrapper: '#BetConstructObject',
                                openPage: 'widget_embed',
                                oddsType: {'decimal': 1, 'fractional': 2, 'american': 3, 'hongkong': 4, 'malay': 5, 'indo': 6}[Config.env.oddFormat],
                                gmt: gmt,
                                htmlDir: '',
                                deeplink: deepLink,
                                lang: externalLanguage,
                                skinName: Config.main.liveModule.skin,
                                siteId: parseInt(Config.main.site_id, 10)
                            };

                            _htmlAppHelper.htmlHelperUserData = null;
                            var initSettings = {
                                beforeInitFun: $window.getZergling,
                                lang: _htmlAppHelper.lang,
                                odds: _htmlAppHelper.oddsType,
                                gmt: _htmlAppHelper.gmt,
                                htmlDir: _htmlAppHelper.htmlDir,
                                wrapper: _htmlAppHelper.wrapper,
                                openPage: _htmlAppHelper.openPage,
                                deeplink: _htmlAppHelper.deeplink,
                                siteId: _htmlAppHelper.siteId
                            };

                            if (_htmlAppHelper.skinName != '') {
                                initSettings.skinName = _htmlAppHelper.skinName;
                            }
                            var htmlObj = $window.htmlHelper.init(initSettings) || $window.htmlHelper;
                            htmlObj.login(_htmlAppHelper.htmlHelperUserData);
                            // htmlObj.setDeeplinkCallback();
                        };
                        widgetInit();
                    });
                });
            }

        });
    };


    $scope.liveModuleLangMapping = {
        "rus": 'rus',
        "eng": 'eng',
        "lit": 'lit',
        "geo": 'geo',
        "chi": 'chn',
        "tur": 'tur',
        "fre": 'fra',
        "spa": 'spa',
        "srp": 'srp',
        "est": 'est',
        "lav": 'lav',
        "mne": 'mne',
        "kor": 'kor',
        "ger": 'ger'
    };

    $scope.$on("$destroy", function () {
        $rootScope.footerMovable = false;
    });
}]);
