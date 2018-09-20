/**
 * @ngdoc controller
 * @name CASINO.controller:casinoSpecialGamesCtrl
 * @description
 * special games pages controller
 */

angular.module('casino').controller('casinoSpecialGamesCtrl', ['$rootScope', '$scope', '$sce', '$location', '$window', 'CConfig', 'Config', 'DomHelper', 'Translator', 'Zergling', 'AuthData', 'casinoManager', 'casinoData', '$timeout', 'LanguageCodes', 'Utils', function ($rootScope, $scope, $sce, $location, $window, CConfig, Config, DomHelper, Translator, Zergling, AuthData, casinoManager, casinoData, $timeout, LanguageCodes, Utils) {
    'use strict';

    var tableId;
    var demo_id;
    $rootScope.footerMovable = true; // make footer movable

    function getUrl() {
        $scope.frameUrl = null;

        if (!$rootScope.env.authorized && !$scope.game.types.viewMode && !$scope.game.types.funMode) {
            $timeout(function () {
                if (!$rootScope.loginInProgress) {
                    $rootScope.$broadcast('openLoginForm');
                } else {
                    var loginProccesWatcher = $scope.$watch('loginInProgress', function () {
                        if (!$rootScope.loginInProgress) {
                            loginProccesWatcher();
                            if (!$rootScope.env.authorized) {
                                $rootScope.$broadcast('openLoginForm');
                            }
                        }
                    });
                }
            }, 100);
            return;
        }

        var gameUrl;

        if (tableId && $scope.game.provider === CConfig.liveCasino.provider) {
            var urlPrefix = $window.location.protocol + CConfig.liveCasino.lcGameUrlPrefix + (CConfig.liveCasino.staticDomain || CConfig.cUrlPrefix.substring(CConfig.cUrlPrefix.indexOf('.') + 1));
            var tableInfo = '/table/table/'  + tableId + ($location.search().limit ? ('/' + $location.search().limit) : '');
            gameUrl = urlPrefix + '/web/' + (LanguageCodes[$rootScope.env.lang] || 'en') + '/' + Config.main.site_id + tableInfo + '?activeGroupId=' + (CConfig.liveCasino.lobbyGroupsMap[$scope.game.extearnal_game_id] || 0) + ($location.search().room ? ('&roomNumber=' + $location.search().room) : '');
        } else {
            gameUrl = CConfig.cUrlPrefix + CConfig.gamesUrl + '?partnerId=' + Config.main.site_id + '&gameId=' + (demo_id || $scope.game.extearnal_game_id) + '&language=' + LanguageCodes[$rootScope.env.lang] + '&openType=' + ($rootScope.env.authorized ? 'real' : 'fun');
            $location.search().studio && (gameUrl += '&studio=' + $location.search().studio);
        }

        gameUrl += "&devicetypeid=" + CConfig.deviceTypeId + "&platformType=" + CConfig.platformType;

        //receives location parameters and adds as additional parameters to the game URL
        var locationObject = $location.search();
        if (locationObject.lang) {
            delete locationObject.lang;
        }
        if (!Utils.isObjectEmpty(locationObject)) {
            gameUrl += "&additionalparams=" + JSON.stringify(locationObject);
            $location.search({});
        }

        $rootScope.env.authorized && (gameUrl += '&token=' + AuthData.getAuthToken() + (!Config.main.GmsPlatform ? '&username=' + $rootScope.profile.username : ''));

        if ($scope.game.extearnal_game_id === CConfig.pokerklas.externalID) {
            var popup = $window.open(gameUrl, 'PokerKlas', 'width=800,height=800,menubar=yes,toolbar=yes,location=yes,scrollbars=yes,resizable=yes');
            casinoManager.checkIfPopupIsBlocked(popup);
            $scope.showTransferPopUp = true;
        } else {
            $timeout(function () {
                $scope.frameUrl = $sce.trustAsResourceUrl(gameUrl);
            }, 20);
        }
    }

    $scope.$watch('env.authorized', function (newValue, oldValue) {
        if (!$scope.game || newValue === oldValue || $scope.game.extearnal_game_id === CConfig.pokerklas.externalID || (!newValue && $scope.game.extearnal_game_id === CConfig.backgammon.externalID)) return;

        if (!newValue || $rootScope.profile || Config.main.GmsPlatform) {
            getUrl();
        } else {
            var profileWatcherPromise = $scope.$watch('profile', function (newValue) {
                if (newValue) {
                    profileWatcherPromise();
                    getUrl();
                }
            });
        }

        if ($rootScope.env.authorized && $rootScope.env.sliderContent === 'login') {
            $rootScope.env.showSlider = false;
            $rootScope.env.sliderContent = '';
        }
    });


    /*
     * calculates the possible sizes of the popup window and opens game in there
     */
    function popUpGame() {
        var scale, scaleWidth, scaleHeight;
        var percent = 0.85, windowWidth = 900, windowHeight = 900; // initial size of popUp
        var screenResolution = DomHelper.getScreenResolution();


        if ($scope.game.width && $scope.game.height) {
            scaleWidth = percent * screenResolution.x / $scope.game.width;
            scaleHeight = percent *  screenResolution.y / $scope.game.height;
            scale = Math.min(scaleWidth, scaleHeight);
            windowWidth = scale * $scope.game.width;
            windowHeight = scale * $scope.game.height;
        } else if ($scope.game.ratio) {
            var ratios =  $scope.game.ratio.split(':');
            var initialWidth = percent * screenResolution.y * ratios[0] / ratios[1];
            scaleWidth = percent *  screenResolution.x / initialWidth;
            scale = Math.min(scaleWidth, 1);
            windowWidth = scale * initialWidth;
            windowHeight = scale * screenResolution.y * percent;
        }

        var popup = $window.open($scope.frameUrl, '', 'width=' + windowWidth + ',height=' + windowHeight + ',menubar=no,toolbar=no,location=no,scrollbars=no,resizable=yes');
        casinoManager.checkIfPopupIsBlocked(popup);
    }

    /**
     * @ngdoc method
     * @name frameControll
     * @methodOf CASINO.controller:casinoSpecialGamesCtrl
     * @description depends on action, opened game refreshed or opened it in popup window
     * @param {String} action 'refresh' or 'popup'
     */
    $scope.frameControll = function frameControll(action) {
        if (action === 'refresh') {
            getUrl();
        } else if (action === 'popup') {
            popUpGame();
        }
    };

    $scope.$on('profile', function () {
        $window.postMessage({userData: AuthData.get()}, "*");
    });

    /**
     * @ngdoc method
     * @name amountTransfer
     * @methodOf CASINO.controller:casinoSpecialGamesCtrl
     * @description enable transfer functionality for transfer amount from/to casino to to/from current game
     *
     * @param {String} category the category of request
     */
    $scope.amountTransfer = function amountTransfer(method, from, to, externalGameId) {
        $scope.amountTransferModel = $scope.amountTransferModel || {};
        $scope.amountTransferModel.method = method;
        $scope.amountTransferModel.from = from;
        $scope.amountTransferModel.to = to;
        $scope.amountTransferModel.showTransferPopUp = false;
        $scope.amountTransferModel.messageType = '';
        $scope.amountTransferModel.gpAmount = null;
        $scope.amountTransferModel.externalGameId = externalGameId;

        casinoManager.gpTransfer($scope.amountTransferModel);
    };


    /**
     * @ngdoc method
     * @name loadGame
     * @methodOf CASINO.controller:casinoSpecialGamesCtrl
     * @description depending on  product,  prepares URL and open the game
     * @param {String} product name of product
     * @param {String} gameDemoId game demo id received from CMS
     */
    $scope.loadGame = function loadGame (product, gameDemoId) {
        demo_id = gameDemoId;

        var exId;
        switch (product) {
            case 'poker':
                exId = CConfig.poker.externalID;
                break;
            case 'fantasy':
                exId = CConfig.fantasySports.externalID;
                break;
            case 'ogwil':
                exId = CConfig.ogwil.externalID;
                break;
            case 'financials':
                exId = CConfig.financials.externalID;
                break;
            case 'csbpoolbetting':
                exId = CConfig.csbPoolBetting.externalID;
                break;
            case 'belote':
                exId = CConfig.belote.externalID;
                break;
            case 'deberc':
                exId = CConfig.deberc.externalID;
                break;
            case 'backgammon':
                exId = CConfig.backgammon.externalID;
                break;
            case 'checkers':
                exId = CConfig.checkers.externalID;
                break;
            case 'pokerklas':
                exId = CConfig.pokerklas.externalID;
                break;
            case 'ggpoker':
                exId = CConfig.ggpoker.externalID;
                break;
            case 'game':
                var pathContent = $location.path().split('/');
                exId = pathContent[6];
                tableId = pathContent[8];
                break;
        }
        $scope.loadingUserData = true;
        casinoData.getGames(null, null, null, null, null, null, null, null, [exId]).then(function (response) {
            if (response && response.data && response.data.games[0]) {
                $scope.game = response.data.games[0];

                $rootScope.setTitle($scope.game.name);

                getUrl();
            }
        })['finally'](function () {
            $scope.loadingUserData = false;
        });
    };

    $scope.$on("$destroy", function () {
        $scope.frameUrl = null;
        $rootScope.footerMovable = false;
    });
}]);
