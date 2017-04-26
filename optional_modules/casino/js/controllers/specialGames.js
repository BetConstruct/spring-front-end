/**
 * @ngdoc controller
 * @name CASINO.controller:casinoSpecialGamesCtrl
 * @description
 * special games pages controller
 */

angular.module('casino').controller('casinoSpecialGamesCtrl', ['$rootScope', '$scope', '$sce', '$location', '$window', 'CConfig', 'Config', 'DomHelper', 'Translator', 'Zergling', 'AuthData', 'casinoManager', 'TimeoutWrapper', 'LanguageCodes', function ($rootScope, $scope, $sce, $location, $window, CConfig, Config, DomHelper, Translator, Zergling, AuthData, casinoManager, TimeoutWrapper, LanguageCodes) {
    'use strict';

    var gameName;
    TimeoutWrapper = TimeoutWrapper($scope);
    $rootScope.footerMovable = true; // make footer movable
    /**
     * @ngdoc method
     * @name loadGame
     * @methodOf CASINO.controller:casinoSpecialGamesCtrl
     * @description depending on  product,  prepares URL and open the game
     * @param {String} product name of product
     */
    $scope.loadGame = function loadGame (product) {
        gameName = product;
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
        }
        if (title) {
            $rootScope.setTitle(title);
        }

        getUrl();
    };

    function getUrl() {
        $scope.frameUrl = null;
        var game, prefix, additionalAttrs = '';

        switch (gameName) {
        case 'poker':
            TimeoutWrapper(function () { $scope.frameUrl = $sce.trustAsResourceUrl(Config.poker.instantPlayLink) }, 50);
            return;
        case 'fantasy':
            game = CConfig.fantasySports;
            if (CConfig.fantasySports.externalURL) {
                prefix = CConfig.fantasySports.externalURL + '?partnerid=' + CConfig.main.partnerID + '&lan=' + Config.env.lang;
                if ($rootScope.env.authorized) {
                    var authData = AuthData.get();
                    prefix += '&sport_token=' + authData.auth_token + '&sport_userid=' + authData.user_id;
                }
            } else {
                additionalAttrs = '&gmtShift=' + Config.env.selectedTimeZone.split(':')[0];
            }
            break;
        case 'ogwil':
            game = CConfig.ogwil;
            break;
        case 'financials':
            game = CConfig.financials;
            break;
        case 'game':
            var pathContent = $location.path().split('/');
            game = {
                gameID: pathContent[2],
                provider: pathContent[4],
                externalID: pathContent[6],
                tableID: pathContent[8]
            };
            if (game.gameID === 'TLCTLC' && !$rootScope.env.authorized) { //it must be reverted after changing finbet's page
                TimeoutWrapper(function () {
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
                        })
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
        case 'pokerklas':
            game = $scope.game = CConfig.pokerklas;
            break;
        }
        if (game) {
            $scope.loadingUserData = true;
            var isVGSLiveGame = game.tableID && CConfig.liveCasino.provider === game.provider;
            if (!isVGSLiveGame && CConfig.main.providersThatWorkWithSwarm.indexOf(game.provider) !== -1 && !prefix) {
                var request = {
                    provider: game.provider,
                    game_id: game.gameID,
                    external_game_id: game.externalID,
                    mode: $rootScope.env.authorized ? 'real' : 'fun',
                    skin_host: CConfig.cUrlPrefix
                };

                Zergling.get(request, 'casino_game_url')
                    .then(function (data) {
                        if (data && data.url) {
                            if (gameName === 'pokerklas') {
                                var popup = $window.open(data.url, 'PokerKlas', 'width=800,height=800,menubar=yes,toolbar=yes,location=yes,scrollbars=yes,resizable=yes');
                                casinoManager.checkIfPopupIsBlocked(popup);
                                $scope.showTransferPopUp = true;
                            } else {
                                $scope.frameUrl = $sce.trustAsResourceUrl(data.url);
                            }
                        }
                    })['finally'](function () {
                        $scope.loadingUserData = false;
                    });
            } else {
                if (isVGSLiveGame) { //betconstruct live casino tables state
                    var subDomain = CConfig.cUrlPrefix.substring(CConfig.cUrlPrefix.indexOf('.') + 1);
                    prefix = CConfig.liveCasino.lcGameUrlPrefix + subDomain + '/web/' + LanguageCodes[$rootScope.env.lang] + '/' + Config.main.site_id + '/table/table/' + game.tableID + '/1'; // last part is limit id and it must be detect dynamically
                    $rootScope.casinoGameOpened = 1; // In this cases the header will be less

                    //@TODO after testing need to remove
                    if (game.tableID && game.tableID == '701') {
                        prefix = 'http://192.168.10.173:8083/web/en/4/table';
                    }
                } else {
                    var urlPrefix = CConfig.main.providersThatWorkWithCasinoBackend && CConfig.main.providersThatWorkWithCasinoBackend.providers.indexOf(game.provider) !== -1 ? CConfig.main.providersThatWorkWithCasinoBackend.url : CConfig.cUrlPrefix + CConfig.cGamesUrl;
                    prefix = prefix || (urlPrefix + '?gameid=' + game.gameID + '&provider=' + game.provider + '&lan=' + Config.env.lang + additionalAttrs + '&partnerid=' + CConfig.main.partnerID);
                }
                if ($rootScope.env.authorized) {
                    Zergling.get({'game_id': parseInt(game.externalID)}, 'casino_auth').then(function (response) {
                        if (response && response.result && response.result.has_error == "False") {
                            if (isVGSLiveGame) {
                                $scope.frameUrl = $sce.trustAsResourceUrl(prefix + '?token=' + response.result.token);
                            } else {
                                var userInfo = ('&token=' + response.result.token + '&username=' + response.result.username + '&balance=' + response.result.balance + '&currency=' + response.result.currency + '&userid=' + response.result.id + '&nickname=' + response.result.nickname + '&firstname=' + $rootScope.profile.first_name + '&lastname=' + $rootScope.profile.last_name).replace('#', '%23'); //in some cases user data contains '#' character
                                $scope.frameUrl = $sce.trustAsResourceUrl(prefix + userInfo + '&mode=real');
                            }
                        }
                    })['finally'](function () {
                        $scope.loadingUserData = false;
                    });
                } else {
                    $scope.loadingUserData = false;
                    TimeoutWrapper(function () {
                        $scope.frameUrl = $sce.trustAsResourceUrl(prefix + (isVGSLiveGame ? '' : '&mode=fun'));
                    }, 20);
                }
            }
        }
    }

    $scope.$watch('env.authorized', function (newValue, oldValue) {
        if (newValue !== oldValue && gameName !== 'pokerklas' && (newValue || gameName !== 'backgammon')) {
            getUrl();
        }
        if ($rootScope.env.authorized && $rootScope.env.sliderContent === 'signInForm') {
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
        $scope.amountTransferModel.showTransferPopUp = true;
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
