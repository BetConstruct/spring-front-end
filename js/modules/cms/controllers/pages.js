/**
 * @ngdoc controller
 * @name CMS.controller:cmsPagesCtrl
 * @description
 * Static pages controller
 */
angular.module('CMS').controller('cmsPagesCtrl', ['$location', '$rootScope', '$scope', '$sce', '$routeParams', '$window', '$q', '$filter', '$interval', 'smoothScroll', 'content', 'Utils', 'WPConfig', 'Config', 'Translator', 'Storage', 'analytics', 'liveChat', 'TimeoutWrapper', function ($location, $rootScope, $scope, $sce, $routeParams, $window, $q, $filter, $interval, smoothScroll, content, Utils, WPConfig, Config, Translator, Storage, analytics, liveChat, TimeoutWrapper) {
    'use strict';

    $scope.bannerObjects = {};
    $scope.globalConfig = Config;
    $scope.currentPage = {
        topLevel: parseInt($location.search().pageIndex, 10) || 0,
        secondLevel: 0
    };
    $scope.WPConfig =  WPConfig;
    $scope.showDownloadLinks = false;
    $scope.location = $location.search();
    $scope.setLocation = $location;
    $scope.slider = {
        index: 0
    };
    TimeoutWrapper = TimeoutWrapper($scope);
    $scope.env = $rootScope.env;

    var sliderIntervalPromise;
    var allPaymanets;

    /**
     * @ngdoc method
     * @name setDefaultDownloadOS
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description Set default OS
     * @param {String} Product name
     */
    $scope.setDefaultDownloadOS = function setDefaultDownloadOS(product) {
        $scope.selectedOS = $rootScope.userOS && Config[product].downloadLink && Config[product].downloadLink[$rootScope.userOS] ? $rootScope.userOS : ($filter('count')(Config[product].downloadLink) > 1 ? 'All' : null);
    };

    /**
     * @ngdoc method
     * @name getPageContent
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description loads page content and sets to scope variables **content** and **title**
     */
    $scope.getPageContent = function getPageContent() {
        $scope.loaded = false;
        var slugLength = $routeParams.slug.length;
        var pageSlug = $routeParams.slug.charAt(slugLength - 4) === '-' ? $routeParams.slug.substring(0, slugLength - 3) : $routeParams.slug.substring(0, slugLength - 5);
        $scope.pageSlug = pageSlug + Config.env.lang;

        content.getPage($scope.pageSlug).then(function (data) {
            $scope.pageIsOk = data.data.status === 'ok';
            if ($scope.pageIsOk) {
                $scope.content = $sce.trustAsHtml(data.data.page.content);
                $scope.title = $sce.trustAsHtml(data.data.page.title);
            }
            $scope.loaded = true;
        });
    };

    /**
     * @ngdoc method
     * @name getPromotions
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description loads promotions from CMS, filters already shown ones and shows the first one
     */
    $scope.getPromotions = function getPromotions() {
        content.getPage('promotions-' + Config.env.lang, true).then(function (data) {
            console.log('promotions:', data);
            var alreadyShownPromotions = Storage.get('shownPromotions') || [], notShownPromotions = [];
            if (data.data && data.data.page && data.data.page.children && data.data.page.children.length) {
                angular.forEach(data.data.page.children, function (promotion) {
                    if (alreadyShownPromotions.indexOf(promotion.slug) === -1) {
                        promotion.link = promotion.custom_fields && promotion.custom_fields.link && promotion.custom_fields.link.length ? promotion.custom_fields.link[0] : '';
                        notShownPromotions.push(promotion);
                    }
                });
                $scope.promotion = notShownPromotions[0]; //can choose promotions by some rule later
            }
        });
    };

    /**
     * @ngdoc method
     * @name printSelectedPage
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description Print selectd page
     */
    $scope.printSelectedPage = function printSelectedPage() {
        $window.open('#/popup/?action=pageprint&rootPageSlug=' + (WPConfig.help.pageSlugs[Config.env.lang] || WPConfig.help.pageSlugs['eng'] || 'help-root-eng') + '&pageSlug=' + $scope.selectedPage.slug, Config.main.skin + 'pageprint.popup', "scrollbars=1,width=1000,height=600,resizable=yes");
    };

    /**
     * @ngdoc method
     * @name closePromotion
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description closes the active promotion popup and marks it as read in local storage
     */
    $scope.closePromotion = function closePromotion(promotion) {
        console.log('closePromotion');
        var alreadyShownPromotions = Storage.get('shownPromotions') || [];
        if (promotion.slug && alreadyShownPromotions.indexOf(promotion.slug) === -1) {
            alreadyShownPromotions.push(promotion.slug);
        }
        Storage.set("shownPromotions", alreadyShownPromotions);
        $scope.promotion = null;
    };

    // maybe it's not a good idea keeping this in rootScope, but it's needed in different scopes
    $rootScope.helpPages = $rootScope.helpPages || {};

    /**
     * @ngdoc method
     * @name generateNavObject
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description Generate navigation object
     */
    function generateNavObject(children) {
        return children.map(function (page) {
            $rootScope.helpPages[page.id] = page;
            $rootScope.helpPages[page.id].content = $sce.trustAsHtml($rootScope.helpPages[page.id].content);
            return {
                id: page.id,
                slug: page.slug,
                custom_fields: page.custom_fields,
                linktarget: page.linktarget,
                title: page.title,
                content: $rootScope.helpPages[page.id].content,
                parent: page.parent,
                children: page.children.length ? generateNavObject(page.children) : []
            };
        });
    }

    /**
     * @ngdoc method
     * @name openPage
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description opens page in corresponding view
     */
    $scope.openPage = function openPage(page) {
        if (!page) {
            return;
        }
        if (page.children && page.children.length > 0) {
            $scope.selectedPage = $rootScope.helpPages[page.id].children[0];
            $scope.selectedPageParent = page.id;
        } else {
            $scope.selectedPage = $rootScope.helpPages[page.id];
            $scope.selectedPageParent = page.parent;
        }

        $scope.downloadPDFLink = Config.main.enableDownloadPDFInHelpPages && ((Config.main.cmsDataDomain ? Config.main.cmsDataDomain + '/json' : WPConfig.wpUrl) + '?json=pdf&pdf=' +  (WPConfig.wpBaseHost[$location.host()] || WPConfig.wpBaseHost['default'] || WPConfig.wpBaseHost) + '&page_id=' + page.id);
        var contentContainer = document.getElementsByClassName('general-text-list');
        if (contentContainer && contentContainer[0]) {
            contentContainer[0].scrollTop = 0; // Resetting scroll
        }
    };

    function getHelpPageByField(value) {
        var parsedValue = parseInt(value, 10), field, data;
        if (parsedValue) {
            field = 'id';
            data = parsedValue;
        } else {
            field = 'slug';
            data = value;
        }
        var helpPage = {};
        angular.forEach($rootScope.helpPages, function (page) {
            if (page[field] === data) {
                helpPage = page;
            }
        });

        return helpPage;
    }

    var helpPagesLoaded = null;
    /**
     * @ngdoc method
     * @name loadHelpPages
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description loads help pages from cms, generates navigation tree and stores them in rootScope
     * @param {Boolean} [forPopup]  optional. if true will help section for popup
     */
    $scope.loadHelpPages = function loadHelpPages(forPopup) {
        if (helpPagesLoaded) {
            return helpPagesLoaded;
        }
        var loadingHelpPages = $q.defer();
        helpPagesLoaded = loadingHelpPages.promise;
        if (Utils.isObjectEmpty($rootScope.helpPages)) {
            content.getPage('help.' + (forPopup ? 'popupPageSlugs' : 'pageSlugs'), true, true).then(function (data) {
                if (!data.data.page) {
                    return;
                }
                $rootScope.navigation = generateNavObject(data.data.page.children);
                console.log('navigation', $rootScope.navigation);
                $scope.selectedPage = data.data.page;
                $scope.selectedPage.content = $sce.trustAsHtml($scope.selectedPage.content);
                loadingHelpPages.resolve(true);
            });
        } else {
            loadingHelpPages.resolve(true);
        }
        if ($scope.env.selectedHelpPageSlug) {
            var pageToOpen = getHelpPageByField($scope.env.selectedHelpPageSlug);
            $scope.openPage(pageToOpen);
        }
        return helpPagesLoaded;
    };

    //------------------------------------------------------ Popup help ------------------------------------------------
    /**
     * @ngdoc method
     * @name startSFChat
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description opens salesforce chat page
     */
    $scope.startSFChat = function startSFChat() {
        if ($location.search().u) {
            liveChat.setSFChatData({
                user_id: $location.search().u,
                first_name: " ",
                sur_name: " ",
                sex: " ",
                address: " ",
                email: " ",
                balance: " ",
                name: " "
            });
        }
        liveChat.startSFChat();
    };

    /**
     * @ngdoc method
     * @name selectDefaultPage
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description
     * selects default top page for popup help:
     *  first one if page slug is not provided in url, or corresponding deeplinked page
     */
    $scope.selectDefaultPage = function selectDefaultPage() {
        $scope.loadHelpPages(true).then(function () {
            $scope.popupHelpContentLoaded = true;
            var page2select = $scope.getPageBySlug($rootScope.navigation, $location.search().page);
            $scope.selectPopupTopPage(page2select || $rootScope.navigation[0]);
        });
        $window.startSFChat = $scope.startSFChat; //to use from within Wordpress pages
    };

    if (Config.payments && Config.payments.length) {
        allPaymanets = Config.payments.reduce(function (accumulator, current) {
            if (!current.isTransferToLinkedService && (current.canDeposit || current.canWithdraw)) {
                accumulator.push(current);
            }
            return accumulator;
        }, []);
    }

    $scope.selectPaymentType = function selectPaymentType(newType) {
        var product = $location.search().product;

        if ($scope.selectedPaymentsType !== newType) {
            $scope.selectedPaymentsType = newType;
            if (product && {'deposit' : 1, 'withdraw': 1}[$scope.selectedPaymentsType] && allPaymanets) {
                $scope.paymentSystems = allPaymanets.filter(function (item) {
                    return !item[$scope.selectedPaymentsType + 'Products'] || item[$scope.selectedPaymentsType + 'Products'].indexOf(product) > -1;
                });
            } else {
                $scope.paymentSystems = allPaymanets;
            }
        }
    };

    $scope.selectPaymentType('deposit');



    /**
     * @ngdoc method
     * @name selectPopupTopPage
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description selects provided top level page and default second level page:
     *   first one if page slug is not provided in url, or corresponding deeplinked page
     * @param {Object} page page object
     */
    $scope.selectPopupTopPage = function selectPopupTopPage(page, dontSelectDefaultSubPage) {
        if (!page) return;
        if (page.slug === 'payments') { // payments is a special page
            dontSelectDefaultSubPage = true;
            page.systems = {};
            angular.forEach(page.children, function (child) {
                page.systems[child.slug] = child.content;
            });
        }

        $scope.selectedTopPage = page;
        $location.search('page', page.slug);
        if (page.children.length && !dontSelectDefaultSubPage) {
            var page2select = $scope.getPageBySlug(page.children, $location.search().sub);
            $scope.selectPopupSecondLevelPage(page2select || page.children[0]);
        } else {
            $scope.selectPopupSecondLevelPage(null);
            $scope.displayPage = page;
        }
    };

    /**
     * @ngdoc method
     * @name selectPopupSecondLevelPage
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description selects provided second level page and default third level page:
     *   first one if page slug is not provided in url, or corresponding deeplinked page
     */
    $scope.selectPopupSecondLevelPage = function selectPopupSecondLevelPage(page) {
        console.log('selectPopupSecondLevelPage', page);
        $scope.selectedSecondLevelPage = page;
        if (!page) {
            $location.search('sub', undefined);
            $scope.selectPopupThirdLevelPage(null);
            return;
        }
        if (page.children.length) {
            var page2select = $scope.getPageBySlug(page.children, $location.search().subsub);
            $scope.selectPopupThirdLevelPage(page2select || page.children[0]);
        } else {
            $scope.selectPopupThirdLevelPage(null);
            $scope.displayPage = page;
        }
        $location.search('sub', page.slug);
    };

    /**
     * @ngdoc method
     * @name selectPopupThirdLevelPage
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description selects provided third level page and toggles  it's 'expanded' property
     */
    $scope.selectPopupThirdLevelPage = function selectPopupThirdLevelPage(page) {
        console.log('selectPopupThirdLevelPage', page);
        if (page) {
            page.expanded = ($scope.selectedThirdLevelPage !== page || page.expanded === false);
        }

        $scope.selectedThirdLevelPage = page;
        if (!page) {
            $location.search('subsub', undefined);
            return;
        }
        $scope.displayPage = page;
        $location.search('subsub', page.slug);
    };

    /**
     * @ngdoc method
     * @name openParentPaymentsPage
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description opens deposit or withdraw page in opener window or in same window if there's no opener
     * @param {String} system payment system name
     * @param {String} type payment type , 'deposit' or 'withdraw'
     */
    $scope.openParentPaymentsPage = function openParentPaymentsPage(system, type) {
        console.log('openParentPaymentsPage', system, type, $window.opener);
        var hash, target = $window.opener || $window;
        system = system ? '&system=' + system : '';
        if (target.document.location.hash.indexOf('/popup/') !== -1) {
            hash = '#/?action=' + type + system;
        } else {
            hash = target.document.location.hash + (target.document.location.hash.indexOf('?') === -1 ? '?' : '&') + 'action=' + type + system;
        }
        target.location = target.document.location.origin + target.document.location.pathname + hash;
        if ($window.opener) {
            $window.close();
        }
    };
//------------------------------------------------------                ------------------------------------------------

    /**
     * @ngdoc method
     * @name openHelpPage
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description opens help page specified by **slug** after loading help pages
     *
     * @param {String} slug page slug
     * @param {String} from source
     */
    $scope.openHelpPage = function openHelpPage(slug, from, topLevelPage, childPage) {
        if (topLevelPage && childPage && Config.main.newHelpPage) {
            $scope.openMultilevelHelpPage(topLevelPage, childPage);
            return;
        }
        if (Config.main.openHelpAsPopup === 'popup') {
            $window.open('#/popup/?action=helpPopup' + '&currencies=' + encodeURIComponent(JSON.stringify(Config.main.availableCurrencies))  + '&defaultCurrency=' + Config.main.registration.defaultCurrency + '&product=' + ($rootScope.currentPage.isInSports? 'sport': 'casino') + '&help=' + slug, Config.main.skin + 'help.popup', "scrollbars=1,width=1000,height=500,resizable=yes");
        } else if (Config.main.openHelpAsPopup === 'all' || (Config.main.openHelpAsPopup === 'OnlyHeaderPopup' && from !== 'footer')) {
            var userId = $rootScope.profile && $rootScope.profile.unique_id ? $rootScope.profile.unique_id : '';
            $window.open('#/popup/?u=' + userId + '&action=help&currencies=' + encodeURIComponent(JSON.stringify(Config.main.availableCurrencies)) + '&defaultCurrency=' + Config.main.registration.defaultCurrency + '&product=' + ($rootScope.currentPage.isInSports? 'sport': 'casino')  + '&page=' + slug, Config.main.skin + 'help.popup', "scrollbars=1,width=1000,height=600,resizable=yes");
        } else {
            $scope.loadHelpPages().then(function () {
                $rootScope.env.sliderContent = 'help';

                if ($rootScope.env.selectedHelpPageSlug === slug) {
                    $rootScope.env.showSlider = true;
                    return;
                }

                $rootScope.env.showSlider = false;
                $rootScope.env.selectedHelpPageSlug = '';
                TimeoutWrapper(function () {
                    $rootScope.env.sliderContent = 'help';
                    $rootScope.env.showSlider = true;
                    $rootScope.env.selectedHelpPageSlug = slug;
                }, 100);

                $location.search('help', slug);
                $location.search('lang', $rootScope.env.lang);
            });
        }
    };

    $scope.openMultilevelHelpPage = function openMultilevelHelpPage(topPage, childPage) {
        $location.path('/help/' + (topPage.slug || topPage.id) + '/' + (childPage.slug || childPage.id));
    };

    $scope.$on('openHelpPage', function (event, obj) {
        $scope.openHelpPage(obj.slug, obj.from);
    });

    $scope.$on('$locationChangeSuccess', function () {
        if ($location.search().help !== undefined) {
            $scope.openHelpPage($location.search().help, "footer");
        }
    });

    $scope.$watch('env.selectedHelpPageSlug', function () {
        if ($scope.env.selectedHelpPageSlug) {
            var pageToOpen = getHelpPageByField($scope.env.selectedHelpPageSlug);
            $scope.openPage(pageToOpen);
        }
    });

    /**
     * @ngdoc method
     * @name openDeepLinkedHelpPage
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description Open deep linked help page as slider
     */
    function openDeepLinkedHelpPage() {
        if ($location.search().help) {
            var help = $location.search().help;
            $scope.loadHelpPages().then(function () {
                var page = getHelpPageByField(help);
                if (page) {
                    $rootScope.env.showSlider = true;
                    $rootScope.env.sliderContent = 'help';
                    $rootScope.env.selectedHelpPageSlug = help;
                    $location.search('help', undefined);
                    $location.search('lang', undefined);
                }
            });
        }
    }

    openDeepLinkedHelpPage();
    $scope.$on('openDeepLinkedHelpPage', openDeepLinkedHelpPage);

    /**
     * @ngdoc method
     * @name gePageBanners
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description   populates $scope's **<product>TopBanners** variable with banner information got from cms
     *
     * @param {string} product the product name
     * @param {string} [containerId] optional. id of container to get banner for
     */
    $scope.gePageBanners = function gePageBanners(product, containerId) {
        var type = $routeParams.type ? $routeParams.type + "-" : "";
        containerId = containerId || (type + content.getSlug('bannerSlugs.' + product));
        content.getWidget(containerId).then(function (response) {
            $scope[product + 'TopBanners'] = [];
            if (response.data && response.data.widgets && response.data.widgets[0]) {
                angular.forEach(response.data.widgets, function (widget) {
                    $scope[product + 'TopBanners'].push(widget.instance);
                });
            }
        });
    };

    /**
     * @ngdoc method
     * @name loadBanners
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description
     *
     * @param {string} containerId id of container to get banner for
     */
    $scope.loadBanners = function loadBanners(containerId, addLang) {
        content.getWidget(containerId + (addLang ? '-' + Config.env.lang : '')).then(function (response) {
            if (response.data && response.data.widgets && response.data.widgets[0]) {
                $scope.bannerObjects[containerId] = {
                    true: [],
                    false: []
                };
                var bannersContainer = $scope.bannerObjects[containerId];
                angular.forEach(response.data.widgets, function (widget) {
                    if (widget.instance.show_for === '1' || widget.instance.show_for === '0' || !widget.instance.show_for) {
                        bannersContainer.true.push(widget.instance);
                    }
                    if (widget.instance.show_for === '2' || widget.instance.show_for === '0' || !widget.instance.show_for) {
                        bannersContainer.false.push(widget.instance);
                    }
                });
            }
        });
    };

    /**
     * @ngdoc method
     * @name loadFeatureGamesBackgrounds
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description
     *
     * @param {string} containerId id of container to get backgrounds for
     */
    $scope.loadFeatureGamesBackgrounds = function loadFeatureGamesBackgrounds(containerId) {
        console.log('LFGB');
        content.getWidgetData(containerId).then(function (response) {
            $scope.featureGamesBackgrounds = {};
            angular.forEach(response.data && (response.data.categories || (response.data.page && response.data.page.children)), function (category) {
                category.image = (category.thumbnail_images && category.thumbnail_images.full.url) || category.image || category.thumbnail;
                $scope.featureGamesBackgrounds[category.slug || category.name] = category;
            });
        });
    };

    /**
     * @ngdoc method
     * @name getCasinoBanners
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description   populates $scope's **casinoTopBanners** variable with banner information got from cms
     *
     * @param {string} [containerId] optional. id of container to get banner for
     *
     * @param {boolean} [separate] optional. separate banners by login status
     */
    $scope.getCasinoBanners = function getCasinoBanners(containerId, separate) {
        containerId = containerId || content.getSlug('bannerSlugs.casino');
        content.getWidget(containerId).then(function (response) {
            if (response.data && response.data.widgets && response.data.widgets[0]) {
                if (separate) {
                    $scope.casinoTopBanners = {
                        true: [], /*authorized*/
                        false: [] /*not authorized*/
                    };
                } else {
                    $scope.casinoTopBanners = [];
                }

                var regexp = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
                angular.forEach(response.data.widgets, function (widget) {
                    if (widget.instance){
                        if (widget.instance.link && widget.instance.link.match(regexp)) {
                            widget.instance.isYouTubeVideo = true;
                        }
                        if (separate) {
                            if (widget.instance.show_for === '1' || widget.instance.show_for === '0' || !widget.instance.show_for) {
                                $scope.casinoTopBanners.true.push(widget.instance);
                            }
                            if (widget.instance.show_for === '2' || widget.instance.show_for === '0' || !widget.instance.show_for) {
                                $scope.casinoTopBanners.false.push(widget.instance);
                            }
                        }else {
                            $scope.casinoTopBanners.push(widget.instance);
                        }
                    }
                });
            }
        });
    };

    /**
     * @ngdoc method
     * @name loadSportsBookBanners
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description   populates $scope's **sportsBookBanners** variable with banner information got from cms
     *
     * @param {string} [containerId] optional. id of container to get banner for
     */
    $scope.loadSportsBookBanners = function loadSportsBookBanners(containerId) {
        containerId = containerId || 'sportsbook-banners-' + $rootScope.env.lang;
        content.getWidget(containerId).then(function (response) {
            if (response.data && response.data.widgets && response.data.widgets[0]) {
                $scope.sportsBookBanners = [];
                angular.forEach(response.data.widgets, function (widget) {
                    $scope.sportsBookBanners.push(widget.instance);
                });
            }
        });
    };

    /**
     * @ngdoc method
     * @name checkForPageDeepLink
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description checks if page is deeplinked and selects it
     * @param {String} product the product name ('poker', 'belote', 'backgammon', etc)
     */
    $scope.checkForPageDeepLink = function checkForPageDeepLink(product) {
        TimeoutWrapper(function () {
            if ($location.search().page) {
                $scope['selected' + Utils.ucfirst(product) + 'Page'] = $scope.getPageBySlug($scope[product + 'Pages'], $location.search().page);
            }
            if ($location.search().subpage && $scope['selected' + Utils.ucfirst(product) + 'Page']) {
                $scope['selected' + Utils.ucfirst(product) + 'Page']['selected' + Utils.ucfirst(product) + 'Subpage'] = $scope.getPageBySlug($scope['selected' + Utils.ucfirst(product) + 'Page'].children, $location.search().subpage);
            }
        }, 10);
    };

    /**
     * @ngdoc method
     * @name loadPages
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description loads product pages from cms and selects first one
     * @param {String} product the product name ('poker', 'belote', 'backgammon', etc)
     */
    $scope.loadPages = function loadPages(product) {
        $scope.pokerType = $routeParams.type ? $routeParams.type + "-" : "";
        $scope[product + 'PagesLoaded'] = false;
        $scope.newsPageSlug = content.getSlug(product + '.newsPageSlug', null); //slug of page where news will be shown
        if (Utils.isObjectEmpty($scope[product + 'Pages'])) {
            var slug = (Config.main.enableNewPoker && product === 'poker' ? 'new-' : '') + product + '.mainPageSlugs';
            content.getPage(slug, true).then(function (data) {
                $scope[product + 'Pages'] = data.data.page ? data.data.page.children : [];
                var i, j;
                for (i = 0; i < $scope[product + 'Pages'].length; i++) {
                    $scope[product + 'Pages'][i].title = $sce.trustAsHtml($scope[product + 'Pages'][i].title);
                    $scope[product + 'Pages'][i].content = $sce.trustAsHtml($scope[product + 'Pages'][i].content);
                    for (j = 0; j < $scope[product + 'Pages'][i].children.length; j++) {
                        $scope[product + 'Pages'][i].children[j].title = $sce.trustAsHtml($scope[product + 'Pages'][i].children[j].title);
                        $scope[product + 'Pages'][i].children[j].content = $sce.trustAsHtml($scope[product + 'Pages'][i].children[j].content);
                    }
                }
                $scope.checkForPageDeepLink(product);
                $scope['selected' + Utils.ucfirst(product) + 'Page'] = $scope['selected' + Utils.ucfirst(product) + 'Page'] || $scope[product + 'Pages'][0];

                $scope['selected' + Utils.ucfirst(product) + 'Subpage'] = null;

                $scope[product + 'PagesLoaded'] = true;

            });
        }
    };

    /**
     * @ngdoc method
     * @name selectPage
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description selects given page
     *
     * @param {Object} page page to select
     */
    $scope.selectPage = function selectPage(page, product) {
        $scope['selected' + Utils.ucfirst(product) + 'Page'] = page;
        $scope['selected' + Utils.ucfirst(product) + 'Page']['selected' + Utils.ucfirst(product) + 'Subpage'] = $scope['selected' + Utils.ucfirst(product) + 'Page']['selected' + Utils.ucfirst(product) + 'Subpage'] || page.children[0];
        $location.search('page', page.slug);
    };

    /**
     * @ngdoc method
     * @name selectSubPage
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description selects given page
     *
     * @param {Object} page page to select
     */
    $scope.selectSubPage = function selectSubPage(page, subpage, product) {
        page['selected' + Utils.ucfirst(product) + 'Subpage'] = subpage;
        $location.search('subpage', subpage.slug);
    };

    /**
     * @ngdoc method
     * @name getPageBySlug
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description selects page from given page array by slug
     * @param {Array} pages pages array
     * @param {String} slug page slug
     * @returns {Object} page having specified slug
     */
    $scope.getPageBySlug = function getPageBySlug(pages, slug) {
        if (!pages || !slug) {
            return;
        }
        var i, length = pages.length;
        for (i = 0; i < length; i++) {
            if (pages[i].slug === slug) {
                return pages[i];
            }
        }
    };

    /**
     * @ngdoc method
     * @name getPageByTitle
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description selects page from given page array by title
     * @param {Array} pages pages array
     * @param {String} title page title
     * @returns {Object} page having specified title
     */
    $scope.getPageByTitle = function getPageByTitle(pages, title) {
        if (!pages || !title) {
            return;
        }
        var i, length = pages.length;
        for (i = 0; i < length; i++) {
            if (pages[i].title === title) {
                return pages[i];
            }
        }
    };

    /**
     * @ngdoc method
     * @name getPageByField
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description selects page from given page array by custom field
     * @param {Array} pages pages array
     * @param {String} title page title
     * @param {String} custom field name
     * @returns {Object} page having specified title
     */
    $scope.getPageByField = function getPageByField(pages, value, field) {
        if (!pages || !value || !field) {
            return;
        }
        var i, length = pages.length;
        for (i = 0; i < length; i++) {
            if (pages[i].custom_fields[field][0].toString() === value.toString()) {
                return pages[i];
            }
        }
    };

    /**
     * @ngdoc method
     * @name loadSection
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description loads section's pages from CMS
     */
    $scope.loadSection = function loadSection() {
        $scope.sectionLoaded = false;
        $scope.sectionSlug = $routeParams.slug;
        if (WPConfig.additionalSections[$scope.sectionSlug] === undefined) {
            $scope.pageNotFound = true;
            return;
        }
        $scope.sectionConfig = WPConfig.additionalSections[$scope.sectionSlug];
        $scope.rootPageSlug = $scope.sectionConfig.rootPageSlug[$rootScope.env.lang]; //slug of page where news will be shown
        if (Utils.isObjectEmpty($scope.sectionPages)) {
            content.getPage($scope.rootPageSlug, true, true).then(function (data) {
                $scope.sectionPages = data.data.page ? data.data.page.children : [];
                var i;
                for (i = 0; i < $scope.sectionPages.length; i++) {
                    $scope.sectionPages[i].title = $sce.trustAsHtml($scope.sectionPages[i].title);
                    $scope.sectionPages[i].content = $sce.trustAsHtml($scope.sectionPages[i].content);
                }
                // check if we have a deep link
                var selectedPage = $location.search().selected;
                if (selectedPage && selectedPage.length !== 0) {
                    var selectedPageObj = Utils.getItemBySubItemProperty($scope.sectionPages, 'slug', [selectedPage]);
                    $scope.selectedSectionPage = selectedPageObj ? selectedPageObj[selectedPage] : $scope.sectionPages[0];
                    console.log($scope.selectedSectionPage);
                } else {
                    $scope.selectedSectionPage = $scope.sectionPages[0];
                }
                $scope.sectionLoaded = true;
            });
        }
    };

    /**
     * @ngdoc method
     * @name getPageChild
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description loads page with childs and populates $scope's pageContent variable with corresponding child page's content
     *
     * @param {Object} page page slug
     * @param {Object} child page's child slug
     */
    $scope.getPageChild = function getPageChild(page, child) {
        content.getPage(page, true, true).then(function (data) {
            //TODO: implement
            console.log(data, child);
        });
    };

    /**
     * @ngdoc method
     * @name selectSectionPage
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description selects section's page and sets it's slug in location
     *
     * @param {Object} page page object
     */
    $scope.selectSectionPage = function selectSectionPage(page) {
        $scope.selectedSectionPage = page;
        $location.search('selected', page.slug);
    };

    /**
     * @ngdoc method
     * @name loadPage
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description loads page(s) from CMS
     *
     * @param {String} slug page slug
     * @param {Boolean} withChildren whether to load page children or not, if set to 'lang' overwrites mainPage from child
     */
    $scope.loadPage = function loadPage(slug, withChildren) {
        $scope.pageLoaded = false;
        if (Utils.isObjectEmpty($scope.pages)) {
            content.getPage(slug, !!withChildren).then(function (data) {
                console.log('loadPage', data);
                $scope.mainPage = data.data.page;
                $scope.pages = data.data.page && data.data.page.children ? data.data.page.children : [];
                $scope.widgets = data.data.widgets;
                var i, length = $scope.pages.length;
                for (i = 0; i < length; i++) {
                    $scope.pages[i].title = $sce.trustAsHtml($scope.pages[i].title);
                    $scope.pages[i].content = $sce.trustAsHtml($scope.pages[i].content);
                    if (withChildren && withChildren === 'lang' && $scope.pages[i].slug === Config.env.lang) {
                        $scope.mainPage = $scope.pages[i];
                    }
                }
                console.log('loaded pages:', $scope.pages);
                $scope.selectedPage = $scope.pages[0];
                $scope.pagesLoaded = true;
            });
        }
    };

    /**
     * @ngdoc method
     * @name loadFooterLinks
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description loads footer links from CMS and stores in **footerLinks** scope array
     */
    $scope.loadFooterLinks = function loadFooterLinks() {
        content.getWidget('footer-' + $rootScope.env.lang).then(function (response) {
            if (response.data && response.data.widgets) {
                $scope.footerLinks = [];
                angular.forEach(response.data.widgets, function (widget) {
                    var links = [];
                    if (widget.instance) {
                        var i, length = parseInt(widget.instance.numB, 10);
                        for (i = 1; i <= length; i++) {
                            links.push({
                                link: widget.instance['iLink' + i],
                                title: widget.instance['iName' + i],
                                newWindow: widget.instance['iT' + i] !== undefined
                            });
                        }
                        $scope.footerLinks.push({title: widget.instance.title, links: links});
                    }
                });
            }
        });
    };

    /**
     * @ngdoc method
     * @name openRegForm
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description sends a message to corresponding controller to open registration form
     */
    $scope.openRegForm = function openRegForm() {
        $rootScope.$broadcast('openRegForm');
    };

    /**
     * @ngdoc method
     * @name toggleDownloadLink
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description toggles download block and if it's open scrolls to it
     * @param {String} elementIdToScrollOnOpen element id to scroll to
     */
    $scope.toggleDownloadLink = function toggleDownloadLink(elementIdToScrollOnOpen) {
        $scope.showDownloadLinks = !$scope.showDownloadLinks;
        if ($scope.showDownloadLinks) {
            smoothScroll(elementIdToScrollOnOpen);
        }
    };

    /**
     * @ngdoc method
     * @name getPokerLeaderboard
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description loads poker leaderboards from cms
     */
    $scope.getPokerLeaderboard = function getPokerLeaderboard() {
        content.getPage('poker.leaderboardWidget', true).then(function (response) {
            if (response.data && response.data.page && response.data.page.content) {
                $scope.pokerLeaderboard = $sce.trustAsHtml(response.data.page.content);
            }
        });
    };


    /**
     * @ngdoc method
     * @name getCustomPage
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description get custom page type from cms
     */
    $scope.getCustomPage = function getCustomPage(srcSection, srcKey, destKey) {
        $scope.customPageLoading = true;
        content.getPage(srcSection + '.' + srcKey, true).then(function (response) {
            $scope.customPageLoading = false;
            if (response.data && response.data.page && response.data.page.content) {
                $scope[destKey] = $sce.trustAsHtml(response.data.page.content);
            }
        }, function (reason) {
            $scope.customPageLoading = false;
        });
    };

    /**
     * @ngdoc method
     * @name openNestedFrame
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description As a result opens game in nested frame
     */
    $scope.openNestedFrame = function openNestedFrame() {
        $location.search('showNestedFrame','true');
        $scope.showNestedFrame = true;
        $rootScope.casinoGameOpened = 1;
    };

    /**
     * Called when getting 'closeNestedFrame' message from child scope.
     *  As a result closes game and enable footer
     */

    $scope.$on('closeNestedFrame', function () {
        if ($scope.showNestedFrame) {
            $location.search('showNestedFrame',undefined);
            $scope.showNestedFrame = false;
            $rootScope.casinoGameOpened = 0;
        }
    });


    $scope.scrollToSelectedItem = function scrollToSelectedItem(itemId){
        smoothScroll(itemId);
    };

    /**
     * @ngdoc method
     * @name initProductBanners
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description getting data for new Backgammon Banner
     *
     * @param {String} [product] name of product
     */
    $scope.initProductBanners = function initProductBanners(product) {
        var slides = $scope.getPageBySlug($scope.pages, product + '-slider');
        if (slides) {
            $scope.productSlides = slides.children;
            $scope.selectedSlideIndex = 0;
        }
    };

    $scope.winnerSlides = [];

    /**
     * @ngdoc method
     * @name winnerSliderSet
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description Set winners slider index
     * @param {Number} Slider index
     */
    $scope.winnerSliderSet = function winnerSliderSet(num) {

        $scope.winnerSliderInfo = {};
        $scope.winnerSliderInfo.count = Math.floor($scope.winnerSlides.length  / 3);
        $scope.winnerSliderInfo.dots = new Array($scope.winnerSliderInfo.count);

        if (num < 0) {
            num = $scope.winnerSliderInfo.count - 1;
        }

        if (num >$scope.winnerSliderInfo.count - 1) {
            num = 0;
        }

        $scope.winnerSliderInfo.dots[num] = true;
        $scope.winnerSliderInfo.slide = num;

        var r;
        $scope.winnerSliderInfo.slides = [];
        for (r = 0; r < 3; r++) {
            $scope.winnerSliderInfo.slides.push($scope.winnerSlides[num * 3 + r]);
        }
    };

    /**
     * @ngdoc method
     * @name winnerSliderPrev
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description Move slider to prev position
     * @param {Number} Slider index
     */
    $scope.winnerSliderPrev = function winnerSliderPrev(num) {
        return new Array(num);
    };

    /**
     * @ngdoc method
     * @name winnerSliderNext
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description Move slider to next position
     * @param {Number} Slider index
     */
    $scope.winnerSliderNext = function winnerSliderNext(num) {
        return new Array(num);
    };

    /**
     * @ngdoc method
     * @name sliderClamp
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description universal slider clamp script
     *
     * @param {Number} current number
     * @param {Number} total slides
     * @param {Boolean} flip
     */
    $scope.sliderClamp = function sliderClamp(current, count, flipNum) {
        if (!current) {
            current = 0;
        }

        if (flipNum) {
            if (current < 0) {
                current = count - 1;
            }

            if (current > count - 1) {
                current = 0;
            }
        } else {
            if (current < 0) {
                current = 0;
            }

            if (current > count - 1) {
                current = count - 1;
            }
        }

        return current;
    };

    /**
     * @ngdoc method
     * @name sliderRotate
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description universal slider rotation script
     *
     * @param {Number} interval
     */
    $scope.sliderRotate = function sliderRotate(interval, items) {
        items = items || $scope.pages;

        sliderIntervalPromise  = $interval(function () {
            if (items && !$scope.slider.over) {
                $scope.slider.index++;
                if ($scope.slider.index > items.length - 1) {
                    $scope.slider.index = 0;
                }
            }
        }, interval * 1000);
    };

    $scope.$on('$destroy',function() {
        if (sliderIntervalPromise) {
            $interval.cancel(sliderIntervalPromise);
        }
    });

    /**
     * @ngdoc method
     * @name getData
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description get custom json data
     * @param {string} url
     * @param {Object} data if not set its a get request
     */
    $scope.getData = function getData(param, url, data) {
        if (!$scope[param]) {
            content.getJSON(url, data).then(function(response) {
                if (response.data) {
                    $scope[param] = Utils.objectToArray(response.data);
                }
            });
        } else {
            console.error('scope parameter exists');
            return;
        }
    };

    /**
     * @ngdoc method
     * @name openPopUp
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description open appropriate pop up
     * @param contacts slug
     */
    $scope.openPopUp = function openPopUp(slug) {
        switch (slug) {
            case "support":
                if (Config.main.liveChat && Config.main.liveChat.isLiveAgent) {
                    $window.startLiveAgent();
                } else if (Config.main.liveChat && Config.main.liveChat.liveChatLicense) {
                    $rootScope.broadcast("licenseChat.start");
                }
                break;
            case "office-mail":
                $scope.broadcast('feedback.toggle');
                break;
        }
    };

    /**
     * @ngdoc method
     * @name getSlug
     * @methodOf CMS.service:content
     * @description returns promise which will be resolved with object containing json data
     *
     * @param {string} slug name Example: "help.popupPageSlugs"
     * @returns {string} posible slug name
     * @returns {string} empty slug returned if not found
     */
    $scope.getSlug = function getSlug (slug, emptySlug) {
        emptySlug = emptySlug || false;
        return content.getSlug(slug, emptySlug);
    };

    /**
     * @ngdoc method
     * @name getPokerPopup
     * @methodOf CMS.controller:cmsPagesCtrl
     * @description Get poker popup data
     * @param {String} page slug
     */
    $scope.getPokerPopup = function getPokerPopup(page) {
        content.getPage(page, false).then(function (data) {
            $scope.pokerPopup = data.data.page;
        });
    };


    (function init() {
        var currencies = $location.search().currencies;
        if (currencies && currencies !== 'undefined') {
            Config.main.availableCurrencies = JSON.parse(decodeURIComponent(currencies));

        }
        var defaultCurrency = $location.search().defaultCurrency;
        if (defaultCurrency) {
            Config.main.registration.defaultCurrency = defaultCurrency;
        }
        $scope.currencyHolder = {};
        $scope.currencyHolder.selectedCurrency = Config.main.registration.defaultCurrency;
    })();

}]);
