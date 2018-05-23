/**
 * @ngdoc controller
 * @name CASINO.controller:casinoSpecialGamesCtrl
 * @description
 * special games pages controller
 */

angular.module('casino').controller('casinoSpecialGamesCtrl', ['$rootScope', '$scope', '$sce', '$location', '$window', 'CConfig', 'Config', 'DomHelper', 'Translator', 'Zergling', 'AuthData', 'casinoManager', '$timeout', 'LanguageCodes', function ($rootScope, $scope, $sce, $location, $window, CConfig, Config, DomHelper, Translator, Zergling, AuthData, casinoManager, $timeout, LanguageCodes) {
    'use strict';

    var gameName;
    var demo_id;
    $rootScope.footerMovable = true; // make footer movable
    /**
     * @ngdoc method
     * @name loadGame
     * @methodOf CASINO.controller:casinoSpecialGamesCtrl
     * @description depending on  product,  prepares URL and open the game
     * @param {String} product name of product
     * @param {String} gameDemoId game demo id received from CMS
     */
    $scope.loadGame = function loadGame (product, gameDemoId) {
        gameName = product;
        demo_id = gameDemoId;
        var title;
        switch (product) {
            case 'ogwil':
                title = 'OGWIL';
                break;
            case 'financials':
                title = 'Financials';
                break;
            case 'fantasy':
                title = 'Fantasy Sports';
                break;
            case 'game':
                title = 'Casino';
                break;
            case 'deberc':
                title = 'Deberc';
                break;
            case 'pokerklas':
                title = 'Poker Klas';
                break;
            case 'ggpoker':
                title = 'GG Poker';
                break;
        }
        if (title) {
            $rootScope.setTitle(title);
        }

        getUrl();
    };

    function getUrl() {
        $scope.frameUrl = null;
        var game;

        switch (gameName) {
        case 'poker':
            game = CConfig.poker;
            $scope.initialFrameSize = CConfig.poker.initialSize;
            break;
        case 'fantasy':
            game = CConfig.fantasySports;
            break;
        case 'ogwil':
            game = CConfig.ogwil;
            break;
        case 'financials':
            game = CConfig.financials;
            break;
            case 'csbpoolbetting':
                game = CConfig.csbPoolBetting;
                break;
        case 'game':
            var pathContent = $location.path().split('/');
            game = {
                gameID: pathContent[2],
                provider: pathContent[4],
                externalID: pathContent[6],
                tableID: pathContent[8]
            };
            if ((game.gameID === 'TLCTLC' || game.gameID === 'GDRdog6') && !$rootScope.env.authorized) { //it must be reverted after changing finbet's page
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
            break;
        case 'belote':
            game = CConfig.belote;
            $scope.initialFrameSize = CConfig.belote.initialSize;
            break;
        case 'deberc':
            game = CConfig.deberc;
            $scope.initialFrameSize = CConfig.deberc.initialSize;
            break;
        case 'backgammon':
            game = CConfig.backgammon;
            $scope.initialFrameSize = CConfig.backgammon.initialSize;
            break;
        case 'checkers':
            game = CConfig.checkers;
            $scope.initialFrameSize = CConfig.checkers.initialSize;
            break;
        case 'pokerklas':
            game = $scope.game = CConfig.pokerklas;
            break;
        case 'ggpoker':
            game = $scope.game = CConfig.ggpoker;
            break;
        }
        if (game) {
            var gameUrl;

            if (game.tableID && game.provider === CConfig.liveCasino.provider) {
                var urlPrefix = $window.location.protocol + CConfig.liveCasino.lcGameUrlPrefix + (CConfig.liveCasino.staticDomain || CConfig.cUrlPrefix.substring(CConfig.cUrlPrefix.indexOf('.') + 1));
                var tableInfo = '/table/table/'  + game.tableID + ($location.search().limit ? ('/' + $location.search().limit) : '');
                gameUrl = urlPrefix + '/web/' + (LanguageCodes[$rootScope.env.lang] || 'en') + '/' + Config.main.site_id + tableInfo + '?activeGroupId=' + (CConfig.liveCasino.lobbyGroupsMap[game.externalID] || 0) + ($location.search().room ? ('&roomNumber=' + $location.search().room) : '');
            } else {
                gameUrl = CConfig.cUrlPrefix + CConfig.gamesUrl + '?partnerId=' + Config.main.site_id + '&gameId=' + (demo_id || game.externalID) + '&language=' + LanguageCodes[$rootScope.env.lang] + '&openType=' + ($rootScope.env.authorized ? 'real' : 'fun');
                $location.search().studio && (gameUrl += '&studio=' + $location.search().studio);
            }

            gameUrl += "&devicetypeid=" + CConfig.deviceTypeId;

            $rootScope.env.authorized && (gameUrl += '&token=' + AuthData.getAuthToken() + (!Config.main.GmsPlatform ? '&username=' + $rootScope.profile.username : ''));

            if (gameName === 'pokerklas') {
                var popup = $window.open(gameUrl, 'PokerKlas', 'width=800,height=800,menubar=yes,toolbar=yes,location=yes,scrollbars=yes,resizable=yes');
                casinoManager.checkIfPopupIsBlocked(popup);
                $scope.showTransferPopUp = true;
            } else {
                $timeout(function () {
                    $scope.frameUrl = $sce.trustAsResourceUrl(gameUrl);
                }, 20);
            }
        }
    }

    $scope.$watch('env.authorized', function (newValue, oldValue) {
        if (newValue === oldValue || gameName === 'pokerklas' || (!newValue && gameName === 'backgammon')) return;

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

        if ($scope.initialFrameSize) {
            scaleWidth = percent * screenResolution.x / $scope.initialFrameSize.width;
            scaleHeight = percent * screenResolution.y / $scope.initialFrameSize.height;
            scale = Math.min(scaleWidth, scaleHeight);
            windowWidth = scale * $scope.initialFrameSize.width;
            windowHeight = scale * $scope.initialFrameSize.height;
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


    $scope.$on("$destroy", function () {
        $scope.frameUrl = null;
        $rootScope.footerMovable = false;
    });
}]);
