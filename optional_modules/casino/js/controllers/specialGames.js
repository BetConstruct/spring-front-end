/**
 * @ngdoc controller
 * @name CASINO.controller:casinoSpecialGamesCtrl
 * @description
 * special games pages controller
 */

angular.module('casino').controller('casinoSpecialGamesCtrl', ['$rootScope', '$scope', '$sce', '$location', '$window', 'CConfig', 'Config', 'DomHelper', 'Translator', 'Zergling', 'AuthData', 'casinoManager', 'casinoData', '$timeout', 'LanguageCodes', 'Utils', 'casinoMultiviewValues','jackpotManager', function ($rootScope, $scope, $sce, $location, $window, CConfig, Config, DomHelper, Translator, Zergling, AuthData, casinoManager, casinoData, $timeout, LanguageCodes, Utils, casinoMultiviewValues,jackpotManager) {
    'use strict';

    var tableId;
    var demo_id;

    if (!CConfig.disableMenuCollapsingInSpecialGames) {
        $rootScope.footerMovable = true; // make footer movable
        $rootScope.casinoGameOpened = 1;
    }
    $scope.confData = CConfig;
    $scope.viewCount = 1;
    $scope.$on('widescreen.on', function () { $scope.wideMode = true; });
    $scope.$on('widescreen.off', function () { $scope.wideMode = false; });
    $scope.$on('middlescreen.on', function () { $scope.middleMode = true; });
    $scope.$on('middlescreen.off', function () { $scope.middleMode = false; });
    casinoMultiviewValues.init($scope);

    $scope.$on('casino.action', function (event, data) {
        switch (data.action) {
            case 'setUrlData':
                data.url && data.frameId && casinoManager.setCurrentFrameUrlSuffix([$scope.gameInfo], data);
                break;
            case 'closeGame':
                casinoManager.findAndCloseGame($scope, data.gameId);
                break;
            case 'togglePlayMode':
                if ($scope.gameInfo && $scope.gameInfo.externalId === data.gameId) {
                    casinoManager.togglePlayMode($scope, $scope.gameInfo);
                }
                break;
        }
    });



    function processToOpenGame() {
        $scope.loadingUserData = false;
        $scope.showLoginWarningPopup = false;


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
        }

        $rootScope.env.authorized && (gameUrl += '&token=' + AuthData.getAuthToken());

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

    function handlingLoginProgressComplete() {
        if (!$rootScope.env.authorized) {
            if (!$scope.game.types.viewMode) {
                $rootScope.$broadcast('openLoginForm', {
                    broadcastOnClose: "showSpecialGameWarningPopup"
                });
            } else {
                processToOpenGame();
            }
        }
    }

    function getUrl() {
        $scope.frameUrl = null;

        if (!$rootScope.env.authorized && !$scope.game.types.funMode) {
            $timeout(function () {
                if (!$rootScope.loginInProgress) {
                    handlingLoginProgressComplete();
                } else {
                    var loginProccesWatcher = $scope.$watch('loginInProgress', function () {
                        if (!$rootScope.loginInProgress) {
                            loginProccesWatcher();
                            handlingLoginProgressComplete();
                        }
                    });
                }
            }, 100);
            return;
        }

        processToOpenGame();
    }

    $scope.$watch('env.authorized', function (newValue, oldValue) {
        if (!$scope.game || newValue === oldValue || $scope.game.extearnal_game_id === CConfig.pokerklas.externalID || (!newValue && $scope.game.extearnal_game_id === CConfig.backgammon.externalID)) return;

        getUrl();

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
            case 'blast':
                exId = CConfig.blast.externalID;
                break;
            case 'game':
                var pathContent = $location.path().split('/');
                exId = pathContent[6];
                tableId = pathContent[8];
                break;
        }
        $scope.loadingUserData = true;
        casinoData.getGames({external_id : [exId]}).then(function (response) {
            if (response.data && response.data.games && response.data.games[0]) {
                $scope.game = response.data.games[0];
                $scope.gameInfo = {gameUrl: '', id: Utils.guid(), toAdd: false, game : $scope.game, externalId: $scope.game.extearnal_game_id };
                $rootScope.setTitle($scope.game.name);
                getUrl();
            } else {
                $scope.loadingUserData = false;
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: "warning",
                    title: "Warning",
                    content: 'The game is not available'
                });
            }
        });
    };

    /**
     * @ngdoc method
     * @name closeGame
     * @methodOf CASINO.controller:casinoSpecialGamesCtrl
     * @description close nested opened game after confirmation from user (if enabled from configuration)
     *
     * @param {String} target the target of close action
     */
    $scope.closeGame = function closeGame(target) {
        if(target === 'closeButton' && CConfig.main.enableConfirmationBeforeCloseGame) {
            $rootScope.$broadcast('globalDialogs.addDialog', {
                type: "warning",
                title: "Warning",
                hideCloseButton: true,
                content: "Do you want to close the game?",
                buttons: [
                    {
                        title: 'Yes',
                        callback: function () {
                           $scope.$emit('closeNestedFrame');
                        }
                    },
                    {
                        title: 'No'
                    }]
            });
        } else {
            $scope.$emit('closeNestedFrame');
        }
    };
    $scope.$on("showSpecialGameWarningPopup", function () {
        $scope.loadingUserData = false;
        $scope.showLoginWarningPopup = true;
    });

    $scope.$on("$destroy", function () {
        $scope.frameUrl = null;
        $rootScope.footerMovable = false;
    });


}]);
