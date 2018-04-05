/* global VBET5 */
/**
 * @ngdoc controller
 * @name vbet5.controller:mainHeaderCtrl
 * @description
 * Main header controller
 */
VBET5.controller('mainHeaderCtrl', ['$rootScope', '$scope', '$interval', '$filter', '$route', '$q', '$window', '$location', '$document', '$http', '$cookies', 'Geoip', 'CountryCodes', 'Config', 'ConnectionService', 'Zergling', 'Storage', 'DomHelper', 'Utils', 'smoothScroll', 'Translator', 'analytics', 'AuthData', 'Script', 'liveChat', 'GameInfo', 'partner', 'TopMenu', 'TimezoneService', 'TimeoutWrapper', 'Moment', 'content', 'UserAgent', '$timeout', 'RegConfig',function ($rootScope, $scope, $interval, $filter, $route, $q, $window, $location, $document, $http, $cookies, Geoip, CountryCodes, Config, ConnectionService, Zergling, Storage, DomHelper, Utils, smoothScroll, Translator, analytics, AuthData, Script, liveChat, GameInfo, partner, TopMenu, TimezoneService, TimeoutWrapper, Moment, content, UserAgent, $timeout, RegConfig) {
    'use strict';
    var intergratedHtmlHelperAvailable = null;
    var connectionService = new ConnectionService($scope);

    $scope.env.showSignInForm = false;
    $scope.env.showRegistrationForm = false;
    $scope.timezonesExpanded = false;
    $scope.isCssLoading = false;
    //$scope.StartDemoTour = DemoTour.startTour;
    $scope.logoUrl = Config.main.logo.url;
    TimeoutWrapper = TimeoutWrapper($scope);
    $rootScope.timezoneIsAvailable = $q.defer();

    if (Config.env.selectedTimeZone) {
        $rootScope.timezoneIsAvailable.resolve(Config.env.selectedTimeZone);
    } else {
        var timeZonePromise = $rootScope.$watch('env.selectedTimeZone', function () {
            if ($rootScope.env.selectedTimeZone) {
                timeZonePromise();
                $rootScope.timezoneIsAvailable.resolve(Config.env.selectedTimeZone);
            }
        });
    }

    Utils.setBodyClass(Config.main.bodyWrapperClass, 'body');

    Config.env.sliderAsPopup = { 'register': Config.main.registration.simplified, 'login': Config.main.registration.simplified, 'forgotPasswordForm': Config.main.registration.simplified, 'idToken': true}; //show popup instead of slider

    /**
     * @ngdoc object
     * @name setCurrentPath
     * @description sets current path in rootScope
     */
    function setCurrentPath() {
        if(Config.main.customSportsBook[Config.main.sportsLayout] && $location.search().type){
            if(Config.main.customSportsBook[Config.main.sportsLayout] && Config.main.customSportsBook[Config.main.sportsLayout].showPrematch === false){
                $location.search().type = 1;
            }
            if(Config.main.customSportsBook[Config.main.sportsLayout] && Config.main.customSportsBook[Config.main.sportsLayout].showLive === false){
                $location.search().type = 0;
            }
        }
        $rootScope.currentPath = $location.path().split("/").slice(0, 2).join("/");
    }
    setCurrentPath();

    /**
     * @ngdoc object
     * @name setCurrentPath
     * @description sets account message if mail set
     */
    function setAccountVerificationMessage () {
        if (Config.main.accountVerificationEmail) {
            Config.main.accountVerificationMessage = Translator.get('In order to verify your details, please send a copy of the document you registered with. If you did not register any document, please send a copy of either your Passport or ID Card.<br/>We will also require a copy of a document verifying your registered address (a utility bill or similar) in your name.<br/><br/>Once you have these files, please send them, from your registered email address to {1} along with your Customer ID and with "Scan for Verification" as the subject.', ['<a href="mailto:' + Config.main.accountVerificationEmail + '">' + Config.main.accountVerificationEmail + '</a>']);
        }
    }
    setAccountVerificationMessage();

    function checkActions() {
        if ($location.search() && $location.search().action && !needLogin2Continue()) {
            $scope.toggleSliderTab($location.search().action, true);
        }
    }

    $scope.$on('$locationChangeSuccess', function () {
        setCurrentPath();
        checkActions();
    });

    var pathTypes = {
        'casino': ['/casino', '/games', '/poker', '/game', '/livedealer', '/keno', '/fantasy', '/ogwil', '/jackpot', '/financials', '/backgammon', '/belote', '/pokerklas', '/ggpoker', '/gameslanding', '/vrcasino', '/csbpoolbetting', '/tournaments'],
        'sport': ['/sport', '/freebet', '/poolbetting', '/livecalendar', '/results', '/virtualsports', '/overview', '/multiview', '/dashboard', '/exchange', '/statistics', '/customsport'],
        'poker': ['/poker']
    };
    pathTypes[Config.main.homepagePageType].push('/');

    /**
     * @ngdoc object
     * @name isInCasino
     * @description returns true if we are in casino
     */
    function isInCasino() {
        if (!$rootScope.calculatedConfigs.sportEnabled) {
            return true;
        }
        return pathTypes.casino.indexOf($rootScope.currentPath) !== -1;
    }

    /**
     * @ngdoc object
     * @name isInSports
     * @description returns true if we are in sportsbook
     */
    function isInSports() {
        return pathTypes.sport.indexOf($rootScope.currentPath) !== -1;
    }

    /**
     * @ngdoc object
     * @name isInPoker
     * @description returns true if we are in poker
     */
    function isInPoker() {
        return pathTypes.poker.indexOf($rootScope.currentPath) !== -1;
    }

    /**
     * @ngdoc object
     * @name currentPageHasSubHeader
     * @description returns true if current section should have a subheader
     */
    function currentPageHasSubHeader() {
        return (Config.main.enableSubHeader && isInSports() && $rootScope.currentPath !== '/' && $rootScope.currentPath !== '/poolbetting' && $rootScope.currentPath !== '/virtualsports') || ($scope.subMenuItems && $scope.subMenuItems.length);
    }

    $rootScope.casinoPaths = pathTypes.casino;
    $rootScope.isInCasino = isInCasino;
    $rootScope.isInSports = isInSports;
    $rootScope.isInPoker = isInPoker;
    $rootScope.currentPageHasSubHeader = currentPageHasSubHeader;

    if (Config.main.favoriteTeam && Config.main.favoriteTeam.deleteFavoritesOnReload) {
        Storage.remove('myGames');
    }

    if (!Config.main.menuCountryFilter) {
        TopMenu.init($scope); //pass current scope to TomMenu service
    }

    $rootScope.geoDataAvailable =  $rootScope.geoDataAvailable || Geoip.getGeoData(false);

    /**
     * @ngdoc object
     * @name geoDataAvailable
     * @description Gets country info based on user IP
     */
    $rootScope.geoDataAvailable.then(
        function (data) {
            $rootScope.geoCountryInfo = data;
            if ($rootScope.geoCountryInfo.countryCode && Config.main.registration.restrictedCountriesByIp && Config.main.registration.restrictedCountriesByIp.indexOf($rootScope.geoCountryInfo.countryCode) !== -1) {
                if(Config.main.registration.restrictedCountriesLoginAndRegistration) {
                    //disable register and login for specific countries by ip
                    Config.main.header.disableRegistrationAndLogin = true;
                }else{
                    //disable registration for specific countries by ip
                    Config.main.registration.registrationBlocked = true;
                }
            }
        },
        function () {
            $rootScope.geoCountryInfo = false;
        }
    )['finally'](function () {
        if (Config.main.menuCountryFilter) {
            TopMenu.init($scope, $rootScope.geoCountryInfo && $rootScope.geoCountryInfo.countryCode);
        }
    });

    $rootScope.casinoEnabled = $rootScope.calculatedConfigs.casinoEnabled || $rootScope.calculatedConfigs.livedealerEnabled || $rootScope.calculatedConfigs.skillgamesEnabled || $rootScope.calculatedConfigs.financialsEnabled || $rootScope.calculatedConfigs.fantasyEnabled;

    /**
     * @ngdoc object
     * @name balanceSlider
     * @propertyOf vbet5.controller:mainHeaderCtrl
     * @description toggles balance slider
     */
    $scope.balanceSlider = {
        status: true,
        toggle: function () {
            if (this.status === false) {
                $scope.closeSlider();
            } else {
                $scope.openBalancePage();
                this.status = false;
            }
        }
    };

    var connectionLost = false;

    $scope.$watch('[myGames.length, myCasinoGames.length]', function () {
        if ($scope.myGames && $scope.myCasinoGames) {
            partner.call('favoriteGamesCount', $scope.myGames.length + $scope.myCasinoGames.length);
        }
        $scope.favGamesChange = true;
        TimeoutWrapper(function () { $scope.favGamesChange = false; }, 350);
    }, true);

    /**
     * @ngdoc method
     * @name detectAppVersion
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description checks the app version and set appHasBeenUpdated = true browser will be updated afterwards
     */
    function detectAppVersion() {
        $http({
            method: 'GET',
            url: 'appVersion.json?anticache=' + Math.floor(Math.random() * 1000)
        }).then(function(data) {
            if (data.data && data.data.appVersion) {
                if ($rootScope.env.appVersion && $rootScope.env.appVersion !== data.data.appVersion) {
                    Config.env.appHasBeenUpdated = true;
                }
                $rootScope.env.appVersion = data.data.appVersion;
            }

        });
    }

    // getAppVersion initialization
    $interval(function () {
        detectAppVersion();
    }, 1800000); // 30 minutes

    TimeoutWrapper(function () {
        detectAppVersion();
    }, 60000); // 1 minute

    /**
     * @ngdoc method
     * @name toggleSliderTab
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description toggles slider and switches to specified "tab"
     *
     * @param {string} name block name to switch to
     * @param {boolean} dontClose optional. if true, tab will not be closed if it's open
     * @returns {boolean} block state if after toggling (true: visible, false: hidden)
     */
    $scope.toggleSliderTab = function toggleSliderTab(name, dontClose) {
        if ($scope.env.sliderContent === name && $scope.env.showSlider && !dontClose) {
            $scope.env.showSlider = false;
            $scope.env.sliderContent = '';
            return false;
        } else {
            switch (name) {
                case 'register':
                    if (!Config.main.registration.enable) {
                        return;
                    }
                    break;
                case 'login':
                    if (!Config.main.registration.enableSignIn) {
                        return;
                    }
                    break;
            }
            $scope.env.showSlider = true;
            $scope.env.sliderContent = name;
            analytics.gaSend('send', 'event', 'slider', 'open slider',  {'page': $location.path(), 'eventLabel': name});
            return true;
        }
    };

    $scope.$on('toggleSliderTab', function (event, data) { $scope.toggleSliderTab(data); });

    /**
     * @ngdoc method
     * @name openSigninForm
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Shows the sign-in block
     *
     */
    function openSigninForm(action) {
        if (!Config.main.registration.enableSignIn || $scope.openCustomDialog('loginiframe')) {
            return;
        }

        if (!Config.main.integrationMode) {
            $scope.env.showSlider = true;
            $scope.env.sliderContent = 'login';
            if (action) {
                var sliderWatcherPromise = $scope.$watch('env.showSlider', function (newValue, oldValue) {
                    if (!newValue && oldValue) {
                        sliderWatcherPromise();
                        $scope.env.authorized && $rootScope.$broadcast(action.key, action.data);
                    }
                })
            }
        } else if (Config.partner.enableSigninRegisterCallbacks) {
            partner.call('login');
        }
    }

    $scope.$on("openLoginForm", function(event, action) {
        openSigninForm(action);
    });

    $scope.$on("window.openPopup", function (event, data) {
        $scope.openPopup(data.url, data.title, data.params);
    });

    /* Server To Server Passing Track Id */
    if ($location.search().track_id) {
        Storage.set('trackId', $location.search().track_id);
        $location.search('track_id', undefined);
    }

    /**
     * listen to messages from other windows to open slider tab when needed
     */
    DomHelper.onMessage(function (message) {
        console.log('got message', message.data);
        if (message.data) {
            if (message.data.action) {
                switch (message.data.action) {
                    case 'openSlider':
                        if (message.data.tab === 'settings' && message.data.page) {
                            $location.search('settingspage', message.data.page);
                        }
                        if ($scope.env.authorized) {
                            if (message.data.tab === 'login' || message.data.tab === 'register' || message.data.tab === 'signInForm') return;
                        } else if (message.data.tab === 'deposit' || message.data.tab === 'balanceHistory' || message.data.tab === 'login' || message.data.tab === 'settings' || message.data.tab === 'signInForm') {
                            openSigninForm();
                            //$location.search('action', message.data.tab);
                            return;
                        }
                        $scope.toggleSliderTab(message.data.tab, true);
                        break;
                    case 'openHelp':
                        if (message.data.page) {
                            $location.search('help', message.data.page);
                            $rootScope.$broadcast('openDeepLinkedHelpPage');
                        }
                        break;
                    case 'closeSlider':
                        $scope.env.showSlider = false;
                        $scope.env.sliderContent = null;
                        break;
                    case 'login':
                        if (message.data.user_id && message.data.auth_token) {
                            AuthData.set({user_id: message.data.user_id, auth_token: message.data.auth_token });
                            $scope.restoreLogin();
                        }
                        break;
                    case 'logout':
                        logOutUser(false);
                        break;
                    case 'closeCasinoGame':
                        $rootScope.$broadcast('casino.action', {action: 'closeGame', gameId: message.data.gameId});
                        break;
                    case 'openLiveCasinoHelp':
                        $rootScope.globalDialog = {type:'gamerules',title: '',iframeURL:message.data.url};
                        break;
                    case 'setUrlData':
                        $rootScope.$broadcast('casino.action', message.data);
                        break;
                    case 'closeDialog':
                        $rootScope.globalDialog = null;
                        break;
                    case 'showAlert':
                        $rootScope.globalDialog = message.data;
                        break;
                    case 'switchLayout':
                        $scope.switchSportsbookLayout(message.data.layout);
                        break;
                    case 'addCss':
                        message.data.cssUrl && DomHelper.addCss(message.data.cssUrl, null, 'externalCss');
                        break;
                    case 'doBet':
                        message.data.bet && $rootScope.$broadcast('bet', message.data.bet);
                        break;
                    case 'betSlipBottomOffset':
                        if (message.data.offset) {$rootScope.env.betSlipBottomOffset = message.data.offset;}
                        break;
                    case 'openGame':
                        if (message.data.game) {$location.path('/game/' + message.data.game);}
                        break;
                }
            } else if (Config.main.nemIDAuthentication && message.origin === Config.main.nemIDAuthentication.source) {
                    $rootScope.broadcast('handleNemIDMessage', message);
                }
            }
    });

    /**
     * @ngdoc method
     * @name closeSlider
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description as the name says, closes the slider
     */
    $scope.closeSlider = function closeSlider() {
        $location.search('action', undefined);
        $location.search('help', undefined);
        $scope.env.sliderContent = '';
        $scope.env.selectedHelpPageSlug = undefined;
        $scope.balanceSlider.status = true;
        $scope.env.showSlider = false;
        $scope.verytopMenuExpanded = false;
    };

    $rootScope.$on('slider.close', $scope.closeSlider);

    /**
     * @ngdoc method
     * @name openCustomContent
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description as the name says
     */
    function openCustomContent(event, data) {
        $scope.env.showSlider = true;
        $scope.env.sliderContent = 'customContent';
        $scope.env.sliderCustomContent = data;
    }

    $rootScope.$on('slider.openCustomContent', openCustomContent);

    // Return form logic
    if (Config.main.enableFormUrl && $location.search().formUrl) {
        $http.get($location.search().formUrl).then(
            function (response) {
                $scope.env.showSlider = true;
                $scope.env.sliderContent = 'customContent';
                $scope.env.sliderCustomContent = {type: 'return_form', html: response.data};
            },
            function () {
                console.log('http call failed');
            }
        );
        $location.search('formUrl', undefined); //remove it after displaying
    }

    /**
     * @ngdoc method
     * @name openCustomDialog
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Opens custom dialog return false id dialog config doesnt exist
     */
    $scope.openCustomDialog = function openCustomDialog(type) {
        if (Config.dialog && Config.dialog[type]) {

            //add params in iframe
            var dialog = angular.copy(Config.dialog[type]);
            if (dialog.iframeURL && dialog.params) {
                var sep = '?';
                for (var i = 0; i < dialog.params.length; i += 1) {
                    switch (dialog.params[i].key) {
                        case 'lang':
                            dialog.iframeURL += sep + dialog.params[i].value +  "=" + Config.env.lang;
                            sep = '&';
                            break;
                    }
                }
            }

            $rootScope.globalDialog = dialog;
            return true;
        } else {
            return false;
        }
    };

    /**
     * @ngdoc method
     * @name signin
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Shows/hides the sign-in block
     */
    $scope.signin = function signin() {
        if ($scope.openCustomDialog('loginiframe')) {
            return;
        }

        $scope.toggleSliderTab('login');
    };

    /**
     * @ngdoc method
     * @name register
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Shows/hides the registration form
     */
    $scope.register = function register() {
        if (!Config.main.registration.enable) {
            return;
        }

        if(Config.main.showPopupBeforeRegistration) {
            $rootScope.$broadcast('showPopupBySlug', 'registration-popup');
        }

        if (Config.main.registration.registrationBlocked) {
            if (!Config.main.showPopupBeforeRegistration) {
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'info',
                    title: 'Warning',
                    content: Translator.get('Registration on this site is not permitted in selected country.') + ' <b>(' + Translator.get($rootScope.geoCountryInfo.countryName) + ')</b>'
                });
            }
            return;
        }

        if (Config.main.registration.customUrl) {
            $window.location = Config.main.registration.customUrl;
            $scope.env.showSlider = false;
            $scope.env.sliderContent = '';
            return;
        }

        if ($scope.openCustomDialog('regframe')) {
            $scope.env.showSlider = false;
            $scope.env.sliderContent = '';
            return;
        }
        $scope.toggleSliderTab('register');
    };

    /**
     * @ngdoc method
     * @name openForgotPasswordForm
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Shows/hides the registration form
     */
    $scope.openForgotPasswordForm = function openForgotPasswordForm() {
        if ($scope.openCustomDialog('resetpassword')) {
            $scope.env.showSlider = false;
            $scope.env.sliderContent = '';
            return;
        }
        $scope.toggleSliderTab('forgotPasswordForm');
    };

    $scope.$on("openRegForm", function () {
        if (!Config.main.integrationMode) {
            if ($scope.env.sliderContent !== 'register') {
                $scope.goToTop();
                $scope.register();
            }
        } else if (Config.partner.enableSigninRegisterCallbacks) {
            partner.call('register');
        }
    });

    /**
     * @ngdoc method
     * @name myGamesToggle
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Shows/hides saved games block
     *
     * @param {Boolean} open optional. if true, will only open tab (won't close if it's already open)
     */
    $scope.myGamesToggle = function myGamesToggle(open) {
        var myGamesTabName = $rootScope.isInCasino() || !Config.main.sportSavedGamesEnabled || !$rootScope.calculatedConfigs.sportEnabled ? 'casinoSavedGames' : 'savedGames';
        $scope.toggleSliderTab(myGamesTabName, open);
    };

    /**
     * @ngdoc method
     * @name myBetsToggle
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Shows/hides myBets
     *
     * @param {Boolean} open optional. if true, will only open tab (won't close if it's already open)
     */
    $scope.myBetsToggle = function myBetsToggle(open) {
        var sliderContent;

        if (open === undefined && $rootScope.conf.enableCasinoBetHistory && ($rootScope.isInCasino() || !$rootScope.calculatedConfigs.sportEnabled)) {
            sliderContent = 'casinoBetHistory';
        } else {
            sliderContent = 'recentBets';
        }

        $scope.toggleSliderTab(sliderContent, open);
    };

    $scope.$on('open.mygames', function () {$scope.myGamesToggle(true); });
    $scope.$on('open.history', function () {$scope.myBetsToggle(true); });

    /**
     * @ngdoc method
     * @name clock
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description controls the clock in top left corner
     */
    function clock() {
        $scope.env.clock = (new Date().getTime() / 1000);

        if (Config.main.showLoginTimer) {
            if (Config.env.authorized) {
                if ($scope.loginTime === undefined) {
                    $scope.loginTime = 0;
                } else {
                    ++$scope.loginTime;
                }
            } else {
                $scope.loginTime = undefined;
            }
        }
    }

    clock();
    $interval(clock, 1000);


    /**
     * @ngdoc function
     * @name removeAllFavorites
     * @methodOf vbet5.controller:gamesCtrl
     * @description Clean all favorites competitions/games
     */
    function removeAllFavorites() {
        var myGames = angular.copy($rootScope.myGames),
            myCompetitions = angular.copy($rootScope.myCompetitions);

        $scope.$emit('game.removeGameFromMyGames', myGames);
        $scope.$emit('game.removeGameFromMyCompetition', myCompetitions);

    }
    $scope.$on('game.removeAllFavorites', removeAllFavorites);

    /**
     * @ngdoc method
     * @name logOutUser
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Logs user out
     * @param {Boolean} dontClearAllData don't clear local storage data
     */
    function logOutUser(dontClearAllData) {
        dontClearAllData = dontClearAllData || false;
        var logoutDone = false;
        var doLogoutStuff = function () {
            if (!logoutDone && $scope.env.authorized !== false) {
                logoutDone = true;
                $rootScope.profile = null;
                $scope.env.authorized = false;
                $rootScope.currency_name = null;
                $rootScope.fbLoggedIn = false;
                $rootScope.cannotLoginWIthFbId = false;
                if ($rootScope.odnoModel) {
                    $rootScope.odnoModel.currentAction = null;
                    $rootScope.odnoModel.cannotLoginWIthOdno = null;
                    $rootScope.odnoModel.loggedIn = false;
                }
                AuthData.clear();
                $rootScope.loginRestored = $q.reject();
                if (!dontClearAllData) {
                    if (Config.betting.clearOnLogout) {
                        Storage.remove('betslip');
                    }
                    Storage.remove('myGames');
                    removeAllFavorites();
                    Storage.remove('prematchMultiViewGames');
                    Storage.remove('prematchMultiViewCompetitions');
                    Storage.remove('timezone');
                }
                $rootScope.$broadcast('login.loggedOut');
                //DemoTour.endCurrentTour();
                /*TimeoutWrapper(function() {
                 DemoTour.startTour(['demo', 'header']);
                 }, 2000);*/
                $scope.closeSlider();
                liveChat.initSFChat();
                if (Config.main.liveModule.enabled) {
                    intergratedHtmlHelperAvailable.then(function () {
                        $window.htmlHelper.logout();
                    });
                }
            }
        };
        Zergling.logout()['finally'](doLogoutStuff);
        TimeoutWrapper(doLogoutStuff, Config.main.logoutTimeout); //in case logout fails for some reason (no network, etc.)
    }
    $scope.$on('doLogOut', logOutUser);

    /**
     * @ngdoc method
     * @name logOut
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Logs out
     */
    $scope.logOut = function logOut() {
        if ($rootScope.fbLoggedIn) {
            $rootScope.yesNoDialog = Translator.get("Do you want to log out from Facebook as well? If you don't log out from Facebook, you will be automatically logged in next time you open this page.");
            $scope.$on('dialog.yes', function () {
                logOutUser();
                $rootScope.$broadcast('facebook.logout');
            });
            $scope.$on('dialog.no', logOutUser);

        } else {
            logOutUser();
        }
    };

    /**
     * @ngdoc method
     * @name goToTop
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Scrolls to beginning of page on small screen resolutions (defined by MIN_HEIGHT_FOR_STICKY_SLIDER)
     * Returns $scope, so it can be chained with scope methods
     * @param {Boolean} [onSmallScreensOnly] optional. if set to true will scroll only on small screens
     * @returns {Object} $scope
     */
    $scope.goToTop = function goToTop(onSmallScreensOnly) {
        DomHelper.goToTop(onSmallScreensOnly);
        return $scope;
    };

    /**
     * @ngdoc method
     * @name updateProfileBalance
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Update profile balance
     *
     */
    function updateProfileBalance () {
        if ($rootScope.profile) {
            $rootScope.profile.calculatedBalance = Math.max($rootScope.profile.balance - ($rootScope.profile.frozen_balance !== undefined ? $rootScope.profile.frozen_balance : 0), 0); //  balance cannot be negative
            $rootScope.profile.calculatedBonus = $rootScope.profile.bonus_balance || 0; // in some cases profile.bonus_balance is undefined
        }
    }

    /**
     * @ngdoc method
     * @name updateProfile
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Receives profile update messages broadcasted by other controllers and updates profile in $scope
     *
     * @param {Object} event event
     * @param {Object} data profile data
     */
    function updateProfile(event, data) {
        if (!data || Utils.isObjectEmpty(data.profile)) {
            return;
        }

        if ($rootScope.profile) {
            Utils.MergeRecursive($rootScope.profile, $filter('firstElement')(data.profile));
        } else {
            $rootScope.profile = $filter('firstElement')(data.profile);
        }

        if (!Config.main.GmsPlatform && $rootScope.profile && $rootScope.profile.super_bet && $rootScope.profile.super_bet !== -1) {
            $rootScope.$broadcast('checkSuperBet', $rootScope.profile.super_bet);
        }
        if ($rootScope.profile) {
            if ($rootScope.profile.last_name) {
                $rootScope.profile.sur_name = $rootScope.profile.last_name;
            }
            if ($rootScope.profile.first_name && $rootScope.profile.last_name) {
                $rootScope.profile.full_name = $rootScope.profile.first_name + " " + $rootScope.profile.last_name;
            } else if ($rootScope.profile.first_name) {
                $rootScope.profile.full_name = $rootScope.profile.first_name;
            } else if ($rootScope.profile.last_name) {
                $rootScope.profile.full_name = $rootScope.profile.last_name;
            } else {
                $rootScope.profile.full_name = "";
            }
            if (Config.main.balanceUpdateDelay && $rootScope.profile.calculatedBalance && $rootScope.casinoGameOpened) {
                TimeoutWrapper(updateProfileBalance, Config.main.balanceUpdateDelay);
            } else {
                updateProfileBalance();
            }

            if ($rootScope.profile.bonus_win_balance !== undefined) {
                $rootScope.profile.calculatedBonus += $rootScope.profile.bonus_win_balance;
            }
            if ($rootScope.profile.frozen_balance !== undefined) {
                $rootScope.profile.calculatedBonus += $rootScope.profile.frozen_balance;
            }
        }
        $rootScope.currency_name = $scope.profile.currency_name;
        console.log('profile', $scope.profile);
        if (($rootScope.calculatedConfigs.sportEnabled || Config.main.remindToRenewBalance.casino) && Config.main.remindToRenewBalance.enabled && $rootScope.profile && $rootScope.profile.balance !== undefined) {
            if (Storage.get('renewReminded') === undefined && $rootScope.profile.calculatedBalance + $rootScope.profile.calculatedBonus < Config.main.remindToRenewBalance.threshold  && $scope.env.sliderContent !== 'cashier') {

                if (Config.main.remindToRenewBalance.dialog) {
                    $rootScope.$broadcast("globalDialogs.addDialog", Config.main.remindToRenewBalance.dialog);
                } else {
                    $scope.env.showSlider = true;
                    $scope.env.sliderContent = 'warning';
                }

                Storage.set('renewReminded', $rootScope.profile.balance, Config.main.remindToRenewBalance.interval);
            } else { // on balance increase clear the reminder state to remind again when balance is low again
                if ($rootScope.profile.calculatedBalance > Storage.get('renewReminded')) {
                    Storage.remove('renewReminded');
                }
            }
        }

        if (!$rootScope.env.unreadCountOld) {
            $rootScope.env.unreadCountOld = $rootScope.profile.unread_count;
        }

        $rootScope.env.isNewMessage = $rootScope.profile.unread_count !== $rootScope.profile.unreadCountOld;

        if ($rootScope.liveAgentProfileUpdate) {
            $rootScope.liveAgentProfileUpdate();
        }
    }

    $scope.$on('profile', function (event, data) {
        updateProfile(event, data);
        if ($rootScope.profile) {
            if (Config.main.liveChat && (Config.main.liveChat.isSfChat || Config.main.liveChat.isDeskChat || (Config.main.liveChat.siteId && Config.main.liveChat.getUserId))) {
                if ($rootScope.env.authorized && $scope.lastUserId !== $rootScope.profile.unique_id) {
                    $scope.lastUserId = $scope.profile.unique_id;
                    Zergling.get({}, 'get_user').then(Config.main.liveChat.isSfChat ? liveChat.setSFChatData : liveChat.setChatData);
                }
            }
        }
    });

    $scope.$on('login.loggedIn', function() {
        getAllowedPaymentSystems();
    });
    $scope.$on('loggedIn', function() {
        getAllowedPaymentSystems();
    });

    $scope.$on('profile.refresh', function () {
        Zergling.get({}, 'get_user').then(function (data) {
            if (data && data.user_id) {
                var profileData = {
                    profile: {}
                };
                profileData.profile[data.user_id] = data;
                updateProfile(null, profileData);
            }
        });
    });

    /**
     * @ngdoc method
     * @name restoreLogin
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Restores login from saved auth session and subscribes to profile updates
     */
    $scope.restoreLogin = function restoreLogin() {
        var deferred = $q.defer();
        if (AuthData.getAuthToken()) {
            console.log('restoring login');
            //$rootScope.loginInProgress = true;
            Zergling.login(null).then(
                function (data) {
                    console.log('login restore ok', data);
                    //$scope.env.authorized = true;
                    //$rootScope.loginInProgress = false;
                    Zergling
                        .subscribe({'source': 'user', 'what': {'profile': []}, 'subscribe': true}, function (data) {updateProfile(null, data); })
                        .then(function (result) {
                            var lastLogin = Storage.get('loginFlow');
                            if (lastLogin === 'ODNO') {
                                $rootScope.odnoModel.loggedIn = true;
                            }
                            $rootScope.$broadcast('profile', result.data);
                            $rootScope.$broadcast('loggedIn');
                            deferred.resolve(true);
                        });
                },
                function (response) {
                    console.log('login with stored auth token failed');
                    //$rootScope.loginInProgress = false;
                    return deferred.reject(response);
                }
            );
        } else {
            console.log('no saved auth token');
            return $q.reject(null);
        }
        return deferred.promise;
    };


    /**
     * @ngdoc method
     * @name scrollToElement
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description  smoothly scrolls page to element with specified id
     */
    $scope.$on('scrollTo', function (event, elementId) {
        if (UserAgent.IEVersion()) {
            $window.scroll(0, 0);
        } else {
            smoothScroll(elementId);
        }
    });


    /**
     * @ngdoc method
     * @name selectLanguage
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description  changes site language
     *
     *
     * @param {String} code language code
     */
    $scope.selectLanguage = function selectLanguage(code) {

        $scope.showLangSelector = false;

        if (code === $scope.env.lang) return;
        //Config.env.lang = code;
        $location.search('lang', code);
        $location.search('page', undefined); //clear pages slugs, because
        $location.search('help', undefined); //they are different for different languages
        Storage.set('lang', code);

        checkAndSetCookie('lang', code);

        TimeoutWrapper(function () {$window.location.reload(); }, 100);
    };

    if (Config.main.geoIPLangSwitch && Config.main.geoIPLangSwitch.enabled) {
        $rootScope.geoDataAvailable = $rootScope.geoDataAvailable || Geoip.getGeoData(false);
        $rootScope.geoDataAvailable.then(function (data) {
            var country = data && data.countryCode && data.countryCode.toUpperCase();
            var switchTo = CountryCodes[country];
            var langs = Config.main.availableLanguages;
            var langToSelect;

            // Change odds format depending on the country
            if (!Storage.get('oddFormat') && country && Config.main.geoIPLangSwitch.oddsByCountry && Config.main.geoIPLangSwitch.oddsByCountry[country]) {
                $scope.setOddFormat(Config.main.geoIPLangSwitch.oddsByCountry[country]);
            }

            // Change view depending on the country
            if (!Storage.get('sportsBookLayout') && country && Config.main.geoIPLangSwitch.layoutByCountry && Config.main.geoIPLangSwitch.layoutByCountry[country]) {
                $scope.switchSportsbookLayout(Config.main.geoIPLangSwitch.layoutByCountry[country]);
            }

            if (!$location.search().lang && !$location.search().action) {
                if (!Storage.get('languageHasBeenSwitched')) {
                    if (Config.main.geoIPLangSwitch[country] && langs[Config.main.geoIPLangSwitch[country]]) {
                        langToSelect = Config.main.geoIPLangSwitch[country];
                    } else if (switchTo && switchTo.lang && langs[switchTo.lang]) {
                        langToSelect = switchTo.lang;
                    } else if (Config.main.geoIPLangSwitch.default) {
                        langToSelect = Config.main.geoIPLangSwitch.default;
                    }
                    if (langToSelect) {
                        $scope.selectLanguage(langToSelect);
                        TimeoutWrapper(function () {Storage.set('runtimePopupShowed', false); }, 100);
                    }
                }
                Storage.set('languageHasBeenSwitched', true);
            }
        });
    }

    /**
     * @ngdoc method
     * @name switchSportsbookLayout
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description  changes site language
     *
     * @param {String} type classic , modern, asian
     */
    $scope.switchSportsbookLayout = function switchSportsbookLayout(type) {
        if (Config.main.sportsLayout === type) {
            return;
        }
        Storage.set('sportsBookLayout', type);

        checkAndSetCookie('sportsBookLayout', type);

        partner.call('switchSportsbookLayout', type);
        $location.search('classic', type === "classic" ? 'yes' : undefined);

        // https://betconstruct.atlassian.net/browse/WEB-4701 ;)
        if ($location.path().indexOf('multiview') > -1 && type === 'modern') {
            $location.url('/sport/?type=1');
        }

        if (AuthData.integrationMode && AuthData.partnerAuthData) { // need to write data in location for  restoring login after layout switching
            if (AuthData.partnerAuthData.auth_token) {
                $location.search('AuthToken', AuthData.partnerAuthData.auth_token)
            }
            if (AuthData.partnerAuthData.user_id) {
                $location.search('UserId', AuthData.partnerAuthData.user_id)
            }
        }
        $rootScope.broadcast("changingSportsbookLayout");
        TimeoutWrapper(function () {
            $window.document.location.reload();
        }, 500);
    };

    $rootScope.switchSportsbookLayout = $scope.switchSportsbookLayout;

    $scope.$on('switchSportsbookLayout', function (event, layout) {$scope.switchSportsbookLayout(layout); });

    $scope.$on('sportsbook.setLayout', function (event, data) {
        $scope.switchSportsbookLayout(data);
    });

    $scope.dontShowLayoutSwitcherHintAgain = false;

    /**
     * @ngdoc method
     * @name settingsInit
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description  initializes settings. Checks if odds format was set before and loads it from local storage
     *
     */
    function settingsInit() {
        if (Config.main.oddFormats && Config.main.oddFormats.length === 1) {
            $scope.setOddFormat(Config.main.oddFormats[0].format);
        } else if (Storage.get('oddFormat') !== undefined) {
            $scope.setOddFormat(Storage.get('oddFormat'));
        }
        if (Storage.get('hideUsername') !== undefined) {
            $scope.setHideUsername(Storage.get('hideUsername'));
        }
        if (Storage.get('hideBalance') !== undefined) {
            $scope.setHideBalance(Storage.get('hideBalance'));
        }
        if (Storage.get('timeFormat') !== undefined) {
            $scope.setTimeFormat(Storage.get('timeFormat'));
        }
    }

    /**
     * @ngdoc method
     * @name setTimeFormat
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description  sets the time format
     *
     * @param {String} value time format (24 hour format or 12 hour AM/PM format)
     */
    $scope.setTimeFormat = function setTimeFormat(value) {
        Config.env.timeFormat = value;
        Storage.set('timeFormat', value);
    };

    $scope.$on('setTimeFormat', function (event, format) {$scope.setTimeFormat(format); });
    /**
     * @ngdoc method
     * @name setHideUsername
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description  show/hide username
     *
     * @param {Boolean} value username state (true, false)
     */
    $scope.setHideUsername = function setHideUsername(value) {
        Config.env.hideUsername = value;
        Storage.set('hideUsername', value);
    };

    /**
     * @ngdoc method
     * @name setHideBalance
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description  show/hide balance
     *
     * @param {Boolean} value balance state (true, false)
     */
    $scope.setHideBalance = function setHideBalance(value) {
        Config.env.hideBalance = value;
        Storage.set('hideBalance', value);
    };

    /**
     * @ngdoc method
     * @name setOddFormat
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description  sets the odds format
     *
     * @param {String} format odd format (decimal, fractional or american)
     */
    $scope.setOddFormat = function setOddFormat(format) {
        Config.env.oddFormat = format;
        Storage.set('oddFormat', format);
    };

    $scope.setSound = GameInfo.setSound;

    $scope.$on('setOddsFormat', function (event, format) {$scope.setOddFormat(format); });

    $scope.$on('zergling.lostWSConnection', function () {
        connectionLost = true;
        $scope.topMessage = Translator.get('Connection lost. Reconnecting.');
    });

    $scope.$on('zergling.gotSession', function () {
        if (connectionLost) {
            connectionLost = false;
            $scope.topMessage = null;
            Utils.setJustForMoment($scope, 'topMessage', Translator.get('Connection restored'), 5000);
        }

    });

    /**
     * @ngdoc method
     * @name check4DeepLinkedAction
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description  checks if corresponding slider section has to be opened(if action is speciified in url) and returns its state
     * @param {String} actionPage action section name, e.g. 'deposit', 'cashier', etc.
     * @param {Boolean} andOpenIt if true, corresponding page will be opened, if not specified will just return the state
     *@return {Boolean} if cashier action is specified
     */
    function check4DeepLinkedAction(actionPage, andOpenIt) {
        var action = $location.search().action;
        if(!Config.main.transferEnabled && action === 'cashier') {
            $location.search('action', undefined);
            return false;
        }
        if(action && action.length && action.toLowerCase() === actionPage.toLowerCase()){
            if(actionPage === 'payments' && $scope.env.sliderContent !== 'deposit'){
                if (andOpenIt) {
                    $scope.env.paymentListShown = true;
                    $scope.toggleSliderTab('deposit');
                    $location.search('action', undefined);
                }
            }else if(actionPage === 'forgotPassword' &&  $scope.env.sliderContent !== 'forgotPasswordForm'){
                if (andOpenIt) {
                    if(!$scope.env.authorized){
                        $scope.openForgotPasswordForm();
                    }
                    $location.search('action', undefined);
                }
            }else if(actionPage !== 'payments' && actionPage !== 'forgotPassword' && $scope.env.sliderContent !== actionPage){
                if(actionPage === 'promotionalBonuses' && (!Config.main.GmsPlatform || !Config.main.promotionalBonuses.enable)){
                    return false;
                }
                if (andOpenIt) {
                    $scope.toggleSliderTab(actionPage);
                    $location.search('action', undefined);
                }
                return true;
            }

        }
        return false;
    }

    /**
     * @ngdoc method
     * @name updatePoolBettingData
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description  calculates and updates scope's poolbetting jackpot value
     *
     * @param {Object} response  draw response ibject
     */
    function updatePoolBettingData(response) {
        var draw = response.data && $filter('firstElement')(response.data.draw);
        if (!draw) {
            console.warn('cannot get pool betting draw', response);
            return;
        }
        if (!draw.jackpot || draw.jackpot <= draw.min_jackpot) {
            draw.jackpot = draw.min_jackpot;
        }
        $rootScope.poolBettingJackpot = draw.jackpot;
        console.log('Pool betting jackpot:', response);
    }

    /**
     * @ngdoc method
     * @name performDeepLinkedAction
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Handles different actions from url and opens corresponding slider section
     */
    function performDeepLinkedAction() {
        check4DeepLinkedAction('cashier', true);
        check4DeepLinkedAction('deposit', true);
        check4DeepLinkedAction('withdraw', true);
        check4DeepLinkedAction('settings', true);
        check4DeepLinkedAction('betHistory', true);
        check4DeepLinkedAction('balanceHistory', true);
        check4DeepLinkedAction('casinoBalanceHistory', true);
        check4DeepLinkedAction('recentBets', true);
        check4DeepLinkedAction('payments', true);
        check4DeepLinkedAction('forgotPassword', true);
        check4DeepLinkedAction('promotionalBonuses', true);

    }

    /**
     * @ngdoc method
     * @name needLogin2Continue
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Returns true if section requires a login first
     */
    function needLogin2Continue() {
        return check4DeepLinkedAction('cashier') || check4DeepLinkedAction('betHistory') || check4DeepLinkedAction('deposit') || check4DeepLinkedAction('withdraw') || check4DeepLinkedAction('settings') || check4DeepLinkedAction('balanceHistory') || check4DeepLinkedAction('casinoBalanceHistory') ||check4DeepLinkedAction('recentBets') || check4DeepLinkedAction('promotionalBonuses') ;
    }

    /**
     * @ngdoc method
     * @name mainHeaderInit
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description  main header initialization.
     * restores login, checks if actions are specified in url (like register, cashier) and performs them
     */
    $scope.mainHeaderInit = function mainHeaderInit() {
        var locationData = $location.search();
        if (locationData.auth_token && locationData.user_id) {
            AuthData.set({user_id: locationData.user_id, auth_token: locationData.auth_token});
        }
        $rootScope.loginRestored = $scope.restoreLogin();
        $rootScope.loginRestored.then(
            performDeepLinkedAction,  //login done
            function () { //login failed
                if (needLogin2Continue()) {
                    openSigninForm();
                }else{
                    TimeoutWrapper(function () {
                        performDeepLinkedAction();
                    });
                }
                if ($location.search().action) {
                    Storage.set('ref', $location.search().ref);
                    if ($location.search().action.toLowerCase() === 'register' && $scope.env.sliderContent !== 'register') {
                        TimeoutWrapper(function () {
                            $scope.register();
                        }, 1200);
                        $location.search('action', undefined);
                    } else if ($location.search().action.toLowerCase() === 'login' && $scope.env.sliderContent !== 'login') {
                        openSigninForm();
                        $location.search('action', undefined);
                    }  else if ($location.search().action.toLowerCase() === 'fblead' && $scope.env.sliderContent !== 'register') {
                        $scope.goToTop();
                        $scope.env.showSlider = true;
                        $scope.env.sliderContent = 'register';
                        Storage.set('fbRequestIds', $location.search().request_ids);
                        Storage.remove('ref'); //
//                            $location.search('action', undefined);
                    }
                }
            }
        )['finally'](function () {
            $location.search('auth_token', undefined);
            $location.search('user_id', undefined);
        });
        if ($location.search().action && $location.search().action.toLowerCase() === 'livechat') {
            $scope.startLiveAgent();
            $location.search('action', undefined);
        }

        $scope.$on('liveAgent.start', function () {
            $scope.startLiveAgent();
        });

        $scope.$on('zopim.start', function () {
            $window.showZopimChat();
        });

        if ($location.search().tablet) {
            $scope.isTablet = true;
        }

        if ($rootScope.calculatedConfigs.poolBettingEnabled|| Config.main.poolBettingJackpotOnHomepage) {
            Zergling.get({
                'source': 'config.currency',
                'what': {'currency': ['name', 'rounding', 'toto_rate'] },
                'where': { 'currency': { 'name': Config.main.poolBettingCurrencyName}}
            }).then(function (response) {
                if (response.data && response.data.currency) {
                    $rootScope.poolBettingCurrency = $filter('firstElement')(response.data.currency);
                    connectionService.subscribe(
                        {
                            'source': 'pool.betting',
                            'what': { 'draw': ['jackpot', 'min_jackpot']},
                            'where': { 'draw': {'status': 1}}
                        },
                        updatePoolBettingData
                    );
                }
            });
        }

        $scope.sortedAvailableLanguages = Utils.objectToArray(Config.main.availableLanguages, 'code').sort(Utils.orderSorting);

        if ($rootScope.calculatedConfigs.virtualSportsEnabled) { // virtual sport case
            if ($location.path() === '/sport/' && $location.search().sport === "-3") {
                $location.path('/virtualsports/');
            }
        }

        settingsInit();
        loadPasswordRules();
        Utils.sortItemsArray(Config.main.theVeryTopMenu && (Config.main.theVeryTopMenu[$rootScope.env.lang] || Config.main.theVeryTopMenu.default || Config.main.theVeryTopMenu));
        Utils.sortItemsArray(Config.main.homepage);
    };

    $scope.$on('$routeUpdate',   function () {
        if (Config.env.authorized) {
            performDeepLinkedAction();
        } else if (needLogin2Continue()) {
            openSigninForm();
        }else{
            performDeepLinkedAction();
        }

        if (Config.partner && Config.partner.routeUpdateCallback) {
            var routeParams = {
                route: $location.path()
            };

            angular.forEach($location.search(), function (param, name) {
                routeParams[name] = routeParams;
            });

            partner.call('routeUpdate', routeParams);
        }

        if (Config.env.appHasBeenUpdated) {
            TimeoutWrapper(function () {$window.location.reload(); }, 100);
        }

        if ($location.search().reload) {
            $location.search('reload', undefined);
            TimeoutWrapper(function () {$window.location.reload(); }, 100);
        }
    });
    /**
     * @ngdoc method
     * @name checkAndCorrectPath
     * @description  checking path is not enabled redirects to home page
     */
    var checkAndCorrectPath = function checkAndCorrectPath() {
        var path = $location.path();
        var lastCharacter = path.substr(path.length - 1);
        if (path !== '/' && lastCharacter === '/') {
            path = path.substr(0, path.length - 1);
        }
        var defaultAvailability = path === '/' || path.indexOf('/game/') !== -1 || path.indexOf('/skinning') !== -1 || path.indexOf('/widget/') !== -1 || Config.main.defaultAvailablePaths.indexOf(path) !== -1;
        path = "#" + path;

        if(defaultAvailability && defaultAvailability[defaultAvailability.length - 1] !== '/') {
            defaultAvailability += '/'
        }

        if(!defaultAvailability && !$rootScope.ignorePathValidation  && !$rootScope.validPaths[path] && !$rootScope.validPaths[path + "/"]) {
            $location.url("/");
        }
        if($rootScope.ignorePathValidation){
            $rootScope.ignorePathValidation = undefined;
            $rootScope.findAndChangeConfig(path);
        }
    };

    checkAndCorrectPath();

    $scope.$on('$routeChangeStart', function () {
        $rootScope.casinoGameOpened = 0;
        $rootScope.footerMovable = false;
        checkAndCorrectPath();
    });

    $scope.$on('root.checkAndCorrectPath', function () {
        checkAndCorrectPath();
    });

    /**
     * @ngdoc method
     * @name setGamesType
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description  sets game type(live or pre-match) by sending a broadcast message to controller
     */
    $scope.setGamesType = function setGamesType(type) {
        if ($rootScope.env.live !== type) {
            $rootScope.$broadcast('toggleLive');
            Config.env.live = !!type;
            if (Config.main.sportsLayout === 'asian') {
                $rootScope.$broadcast('asianMenu');
            }
        }
        if (Config.main.liveModule.enabled && Config.main.sportsLayout === 'external') {
            Config.env.live = !!type;
            if ($location.path() === '/sport/') {
                $scope.switchIntegratedTo(type ? 'live' : 'prematch');
            } else {
                $location.path('/sport/');
                $location.search('type', type ? 1 : 0);
                TimeoutWrapper(function () {$window.location.reload(); });
            }
        }
    };

    /**
     * @ngdoc method
     * @name setGamesType
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description detects spring id and converts it to basalt game id and opens a sportsbook with this id.
     */
    function detectGameExternalId () {
        if ($location.search().gameexternal) {

            if (Config.main.GmsPlatform) {
                $location.search('game', $location.search().gameexternal);
                $location.search('gameexternal', undefined);
                return;
            }

            var request = {
                'source': 'betting',
                'what': {
                    'game': [
                        'id', 'type'
                    ]
                },
                'where': {
                    'game': {
                        'game_external_id': parseInt($location.search().gameexternal, 10)
                    }
                }
            };

            Zergling.get(request).then(function (response) {
                console.log('External game ids:', response);
                var selectedGame;
                if (response && response.data && response.data.game) {
                    angular.forEach(response.data.game, function (game) {
                        if (!selectedGame || game.type == 1 || (selectedGame.type == 2 && game.type != 2)) {
                            selectedGame = game;
                        }
                    });
                }

                if (selectedGame) {
                    selectedGame.type = selectedGame.type == 2 ? 1 : selectedGame.type;

                    $location.search('game', selectedGame.id);
                    $location.search('type', selectedGame.type);
                    $location.search('sport', undefined);
                    $location.search('competition', undefined);
                    $location.search('region', undefined);
                }

                $location.search('gameexternal', undefined);
                $location.path('/sport/');
                $route.reload();
            });
        }
    }

    detectGameExternalId();

    /**
     * @ngdoc method
     * @name refreshExternalSportsbook
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description  refresh external sportsbook type after page reload
     */
    function refreshExternalSportsbook() {
        if (Config.main.liveModule.enabled && Config.main.sportsLayout === 'external' && $location.path() === '/sport/' && $location.search() && $location.search().type) {
            Config.env.live = !!( $location.search().type);
            intergratedHtmlHelperAvailable.then(function () {
                $scope.switchIntegratedTo($location.search().type ? 'live' : 'prematch');
            });
        }
    }

    /**
     * @ngdoc method
     * @name setDefaultIfVirtual
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description  sets game type(pre-match) to difault if virtual sport is selected
     */
    $scope.setDefaultIfVirtual = function setDefaultIfVirtual() {
        if ($location.search().sport === -3 && $rootScope.calculatedConfigs.sportEnabled) {
            TimeoutWrapper(function () { $route.reload(); }, 100);
        }
    };

    $scope.$on('setGamesType', function (event, type) {$scope.setGamesType(type); });

    $scope.startSFChat = liveChat.startSFChat;
    $scope.startDeskChat = liveChat.startDeskChat;
    $window.startSFChat = $scope.startSFChat; //to use it on wordpress pages

    if (Config.main.liveChat && Config.main.liveChat.isLiveAgent) {
        liveChat.initLiveAgent();
        $scope.isLiveAgent = true;
    }

    /**
     * @ngdoc method
     * @name startLiveAgent
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description opens a LiveAgent chat
     */
    $scope.startLiveAgent = function () {
        var chat = Config.main.liveChat && (Config.main.liveChat[Config.env.lang] || Config.main.liveChat);
        if ($rootScope.liveAgentButton && $rootScope.liveAgentButton.onClick && ($rootScope.liveAgentButton.chat || chat.liveAgentVersion === 2)) {
            $rootScope.liveAgentButton.onClick();
            return;
        }
        TimeoutWrapper($scope.startLiveAgent, 500);
    };

    $window.startLiveAgent = $scope.startLiveAgent;
    /**
     * @ngdoc method
     * @name openFaq
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description  opens FAQ popup window
     */
    $scope.openFaq = function openFaq() {
        //$rootScope.$broadcast('openHelpPage', {slug: '#/popup/?action=help'});
        $rootScope.$broadcast('openHelpPage', {slug: 'faq'});
    };

    /**
     * @ngdoc method
     * @name getAllowedPaymentSystems
     * @description  Retrieve from swarm allowed payment systems
     */
    function getAllowedPaymentSystems() {

        if (Config.main.integrationMode) {
            return;
        }

        Zergling.get({}, 'payment_services').then(function (response) {
            $rootScope.profile.paymentSystems = response;
            $rootScope.$broadcast('slider.processUserAuthorization');
        }, function (err) {
            console.log('Payments methods not loaded: ', err);
        });
    }

    /**
     * @ngdoc method
     * @name openPopup
     * @description  openas a popup window
     * @param {String} url page url
     * @param {String} title page title
     * @param {String} params page additional parameters
     */
    $scope.openPopup = function openPopup(url, title, params) {
        $window.open(url, title, params);
    };

    /**
     * @ngdoc method
     * @name openUrl
     * @description  openas a url
     * @param {String} url page url
     */
    $scope.openUrl = function openUrl(url) {
        $window.location = url;
    };

    /**
     * @ngdoc method
     * @name switchIntegratedTo
     * @description  switches integrated sportsbook mode
     * @param {String} type "live" or "prematch"
     */
    $scope.switchIntegratedTo = function switchIntegratedTo(type) {
        //if ($location.path() !== '/sb/') {
        //    $location.path('/sb/');
        //    $window.location.reload();
        //}
        $window.htmlHelper.switchTo(type);
    };

    /**
     * @ngdoc method
     * @name setTheme
     * @description  sets color scheme
     * @param {Object} theme them object
     */
    $scope.setTheme = function setTheme(theme) {
        $rootScope.theme = theme;
        Storage.set('theme', theme.id);

        DomHelper.clearCss();
        if (theme.css) {
            var css = DomHelper.addCss(theme.css);
            $scope.isCssLoading = true;
            css.onload = function () {
                $scope.isCssLoading = false;
                $scope.$apply();
            };
        }
    };

    // load saved or default theme
    if (Config.main.themes && Config.main.themes.length) {
        var savedTheme = Storage.get('theme') ? Utils.getArrayObjectElementHavingFieldValue(Config.main.themes, 'id', Storage.get('theme')) : null;
        $scope.setTheme(savedTheme || Config.main.themes[0]);
    }

    // custom css
    if ($location.search().css) {
        DomHelper.addCss($location.search().css, null, 'externalCss');
    }

    /**
     * Event listener to make bridge between registration ctrl and login ctrl
     * Redirect login request to login controller
     */
    $scope.$on('login.withUserPass', function (event, data) {
        $scope.$broadcast('login.withUsernamePassword', data);
    });

    $scope.openBalancePage = function openBalancePage() {
        $scope.env.showSlider = true;
        $scope.env.sliderContent = $scope.isInSports() ? Config.main.balanceDefaultPage : (Config.main.casinoBalanceDefaultPage || 'cashier');
    };

    /**
     *  Stuff for integrated sportsbook
     *  makes sure htmlHelper object of integrated sportsbook is available before doing some stuff with it
     *  intergratedHtmlHelperAvailable is used for that
     * */
    var d = $q.defer();
    intergratedHtmlHelperAvailable = d.promise;
    function updateHtmlHelperPromise() {
        if (!$window.htmlHelper) {
            $window.setTimeout(updateHtmlHelperPromise, 500);
            return;
        }
        d.resolve($window.htmlHelper);
    }
    if (Config.main.liveModule.enabled) {
        updateHtmlHelperPromise();
    }

    /**
     * @ngdoc method
     * @name sendLoginEventToIntegratedApp
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Send login event to integrated app
     */
    function sendLoginEventToIntegratedApp() {
        if (Config.main.liveModule.enabled) {
            intergratedHtmlHelperAvailable.then(function () {
                $window.htmlHelper.login({ loginType: 2 });
            });
        }
    }

    /**
     * @ngdoc method
     * @name watchAuthData
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Authorization token watcher and performs logout if changed
     */
    function watchAuthData() {
        var authDataWatcher = $scope.$watch(function () { return Storage.get("auth_data") && Storage.get("auth_data").auth_token || $cookies.getObject('auth_data') && $cookies.getObject('auth_data').auth_token || AuthData.partnerAuthData || null; }, function (newVal, oldVal) {
            if (!newVal && $rootScope.env.authorized) {
                logOutUser();
                authDataWatcher();
            }
        });
    }

    /**
     * @ngdoc method
     * @name checkAndAddUserReport
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Check config and add external report scripts
     */
    function checkAndAddUserReport() {
        if (Config.main.userReportScripts) {
            angular.forEach(Config.main.userReportScripts, function(reportScript) {
                Script(reportScript + '?userid=' + AuthData.get().user_id);
            });
        }
    }

    $scope.$on('login.loggedIn', function () {
        performDeepLinkedAction();
        if ($location.path() === '/landing/') {
            $location.path("/");
        }
        sendLoginEventToIntegratedApp();
        checkAndAddUserReport();
        watchAuthData();
        loginTermsCheck();
        TopMenu.refresh();
        partner.call('loggedIn');
        $rootScope.$broadcast('globalDialogs.removeDialogsByTag', 'rfid');

        Config.main.domainSpecificPrefixes &&  domainSpecificCheck('#' + $location.path());
    });
    //normal login
    $scope.$on('login.loggedOut', function () {
        TopMenu.refresh();
    });
    $scope.$on('loggedOut', function () {
        partner.call('loggedOut');
        TopMenu.refresh();
    });     // logged out
    $scope.$on('loggedIn', function () {
        sendLoginEventToIntegratedApp();
        checkAndAddUserReport();
        watchAuthData();
        loginTermsCheck();
        TopMenu.refresh();
        partner.call('loginRestored');
        $rootScope.$broadcast('globalDialogs.removeDialogsByTag', 'rfid');

        Config.main.domainSpecificPrefixes &&  domainSpecificCheck('#' + $location.path());
    });     // restoring login

    $scope.$on('analytics.button', function (event, name) {
        console.log('button clicked',  name);
        analytics.gaSend('send', 'event', 'button', 'click',  {'page': $location.path(), 'eventLabel': name});
    });

    $scope.$on('header.register', function () {
        $scope.register();
    });

    //for handle non activiy action
    var nonActivityInterval, actionDelay, checkingInterval, mousemoveCounter = 0;

    /**
     * @ngdoc method
     * @name mousemove
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Handles mouse move events used to detect inactive users
     */
    function mousemove() {
        mousemoveCounter++;
        if (mousemoveCounter > 20) {
            nonActivityInterval = 0;
            mousemoveCounter = 0;
        }
    }

    /**
     * @ngdoc method
     * @name mousemove
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Handles mouse click events used to detect inactive users
     */
    function mouseup() {
        nonActivityInterval = 0;
        mousemoveCounter = 0;
    }

    /**
     * @ngdoc method
     * @name nonActivityAction
     * @description  Non Activity Action
     */
    function nonActivityAction() {
        if(Storage.get('rememberMe')=== true || $rootScope.casinoGameOpened) {
            return;
        }

        actionDelay = actionDelay + checkingInterval / 1000;
        nonActivityInterval = nonActivityInterval + checkingInterval / 1000;
        if (Config.main.nonActivityAction && (nonActivityInterval > Config.main.nonActivityAction.nonActivityInterval) && (actionDelay > Config.main.nonActivityAction.actionDelay)) {
            nonActivityInterval = 0;
            actionDelay = 0;
            switch (Config.main.nonActivityAction.action) {
                case 'logout':
                    if(Config.env.authorized) {
                        logOutUser(true);
                    }
                    return;
                case 'reload':
                    $route.reload();
                    return;
            }
        }
    }

    if (Config.main.nonActivityAction) {
        nonActivityInterval = 0;
        actionDelay = 0;
        checkingInterval = Config.main.nonActivityAction.checkingInterval || 1000;

        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
        setInterval(nonActivityAction, checkingInterval);
    }

    refreshExternalSportsbook();


    $scope.sportsbookAvailableViews = Utils.checkForAvailableSportsbookViews(Config);


    $scope.timezones = TimezoneService.data;
    $scope.setTimezoneSwitcherValue = TimezoneService.setTimezoneSwitcherValue;

    $scope.setTimezoneSwitcherValue(TimezoneService.getTimezoneSwitcherInitialValue(), true);

    /**
     * @ngdoc method
     * @name checkAndSetCookie
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Adds cookie
     */
    function checkAndSetCookie(key, value) {
        if (Config.main.useAuthCookies) {
            var cookieOptions = {
                domain: $window.location.hostname.split(/\./).slice(-2).join("."),
                path: "/",
                expires: new Date((new Date()).getTime() + Config.main.authSessionLifetime)
            };
            $cookies.put(key, value, cookieOptions);
        }
    }

    /**
     * @ngdoc method
     * @name showCouponDetails
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Does a broadcast to show Cupon details
     */
    $scope.showCouponDetails = function showCouponDetails(betId) {
        $rootScope.$broadcast('couponCheck.showDetails', betId);
    };

    $rootScope.Math = Math;

    var routChangePromise;

    /**
     * @ngdoc method
     * @name domainSpecificCheck
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Domain check for specifix prefixes and change url if needed
     */
    function domainSpecificCheck(path, event) {
        if (Config.main.domainSpecificPrefixes[$window.location.hostname]) {

            if (path === '#/' && !$rootScope.casinoEnabled && $window.location.hostname === 'gaming.vivarobet.am') {
                $window.location = "//www.vivarobet.am/";
            } else {
                var hostName = Config.main.domainSpecificPrefixes[$window.location.hostname][path] || Config.main.domainSpecificPrefixes[$window.location.hostname][path.slice(0, -1)] || Config.main.domainSpecificPrefixes[$window.location.hostname][path + '/'];
                if (hostName) {
                    routChangePromise();
                    if (event) {
                        event.preventDefault();
                    }
                    $window.location = hostName + $location.$$absUrl.substr($location.$$absUrl.indexOf('#/'));
                }
            }
        }
    }

    if (!Utils.isObjectEmpty(Config.main.domainSpecificPrefixes)) {
        routChangePromise = $scope.$on('$routeChangeStart', function(event, next) {
            var nextPath = '#' + next.$$route.originalPath;
            domainSpecificCheck(nextPath, event);
        });

        domainSpecificCheck('#' + $location.path()); //initial state
    }

    /**
     * @ngdoc method
     * @name loginTermsCheck
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Check if terms has been changed after login
     */
    function loginTermsCheck() {
        var termsDate = Storage.get('terms_accept_date') || {};
        var lastLoginDate = termsDate[$rootScope.profile.id] || $rootScope.profile.last_login_date;
        if (Config.main.registration.termsUpdateConfirmation && lastLoginDate) {

            var verifyTerms = function (termsData) {
                if (termsData.modified) {
                    var modified = Moment.moment(termsData.modified, 'YYYY-MM-DD HH:mm:ss').unix();
                    if (modified > lastLoginDate) {

                        $rootScope.$broadcast("globalDialogs.addDialog", {
                            type: 'terms-dialog',
                            title: 'Terms &amp; Conditions',
                            content: '<a>Please note that our {1} have been revised.<br>To proceed you must confirm that you agree to the changes in our {1}. Click below to agree</a>',
                            scrollContent: termsData.content,
                            contentPlaceholders: ['<i>' + Translator.get('Terms &amp; Conditions') + '</i>'],
                            hideCloseButton: true,
                            buttons: [
                                {
                                    title: 'I have read & Accept',
                                    callback: function () {
                                        termsDate[$rootScope.profile.id] = modified;
                                        Storage.set('terms_accept_date', termsDate);
                                    }
                                }
                            ]
                        });
                    }
                }
            };

            if ($rootScope.helpPages && $rootScope.helpPages['general-terms-and-conditions']) {
                verifyTerms($rootScope.helpPages['general-terms-and-conditions']);
            } else {
                content.getTermsAndConditions().then(function (data) {
                    data && data.data && data.data.page && verifyTerms(data.data.page);
                });
            }
        }
    }
    /**
     * @ngdoc method
     * @name loadPasswordRules
     * @methodOf vbet5.controller:mainHeaderCtrl
     * @description Load password rules from registration config
     */
    function loadPasswordRules() {
        var passwordContainingObject;
        $rootScope.passwordRules = {};
        if (Config.main.registration.simplified) {
            if (RegConfig.step1.leftCol !== undefined) {
                passwordContainingObject = RegConfig.step1.leftCol.concat(RegConfig.step1.rightCol || []);
            } else {
                passwordContainingObject = RegConfig.step1;
            }
        } else {
            passwordContainingObject = RegConfig.leftCol.concat(RegConfig.rightCol || []);
        }
        var passwordContainingObjectLength = passwordContainingObject.length;
        for(var i = 0; i < passwordContainingObjectLength; ++i) {
            var field = passwordContainingObject[i];
            if (field.name === "password") {
                $rootScope.passwordRules["placeholder"] = field.placeholder;
                var customAttrsLength =  field.customAttrs.length;
                for(var j = 0; j < customAttrsLength; ++j){
                    var attribute = field.customAttrs[j];
                    for(var key in attribute){
                        if (attribute.hasOwnProperty(key)){
                            $rootScope.passwordRules[key] = attribute[key];
                            break;
                        }
                    }
                }
                $rootScope.passwordRules.validationMessages = field.validation;
                break;
            }
        }
        var pattern = $rootScope.passwordRules['ng-pattern'];
        if (pattern !== undefined && pattern.charAt(0) === '/') {
            pattern = pattern.substr(1, pattern.length - 2);
            $rootScope.passwordRules['ng-pattern'] = pattern;
        }
    }


    //Chrome extension check
    if (window.chrome && window.chrome.app && !window.chrome.app.isInstalled) {
        $scope.showChromeExtensionButton = true;
    }

    partner.call('applicationReady');
}]);

