/*
 *   All config values specified here will be merged with main config and will override its values
 *
 */
/* global VBET5 */
VBET5.constant('SkinConfig', {
    loadConfigFromCMS: true, // ignore this config and don't generate/upload it during release, conf.json will be created by CMS
    additionalModules: ['casino'],
    'main': {
        siteTitle: {
            "eng": "vbet1000.com - Sport Betting & Gaming",
            "spa": "vbet1000.com - Sport Betting & Gaming",
            "por": "vbet1000.com - Sport Betting & Gaming"
        },
        site_name: "vbet",
        skin: 'vbet.com',
        geoIPLangSwitch: {
            enabled: true
        },
        //enableGsportsbook: true,  //enable gaspar's sportsbook
        enableLandingPage: false,
        disableITFGamesInfo: true,
        disableChangePassword: true,
        enableAccountVerification: false,
        messagesPageMenu: ['inbox'],
        hideGmsMarketBase: false,
        GmsPlatform:true,
        transferEnabled: false, //enable "transfer" tab
        htmlMetaTags: "<meta name=\"ahrefs-site-verification\" content=\"cb555e0f05de657484ea9bbd93144b2f0164a5ffc5e2217ece10a3587f6c2db1\">\n<meta name=\"google-site-verification\" content=\"Asg-2YiFaUKr_F2JpkHzGX-5ywN1CyvN4Megi2WZy7A\" />",
        enableSportsbookLayoutSwitcher: true,
        passwordNewResetMode: true,
        htmlScripts: "<script src=\"https://static.betconstruct.me/fs/userFiles/vbetcom-updated/zadarma/detectWebRTC.min.js\"></script><script src=\"https://static.betconstruct.me/fs/userFiles/vbetcom-updated/zadarma/jssip.min.js\"></script><script src=\"https://static.betconstruct.me/fs/userFiles/vbetcom-updated/zadarma/widget.min.js\"></script><link rel=\"stylesheet\" href=\"https://static.betconstruct.me/fs/userFiles/vbetcom-updated/zadarma/style.min.css\" />",
        dashboard: {
            enabled: true,
            leftMenuPrematch: true
        },

        "homepage": [
            {
                "items": [
                    {
                        "class": "size-7",
                        "templateUrl": "templates\/homepage\/mainSlider.html"
                    },
                    {
                        "class": "size-5",
                        "sliderSlug": "homepageRightBanners"
                    }
                ],
                "order": 10
            },
            {
                "items": [
                    {
                        "class": "size-12",
                        "templateUrl": "templates\/homepage\/productsSlider.html"
                    }
                ],
                "order": 20
            },
            {
                "items": [
                    {
                        "class": "size-12",
                        "templateUrl": "templates\/homepage\/featuredGamesSlider.html"
                    }
                ],
                "order": 30
            },
            {
                "items": [
                    {
                        "class": "size-10",
                        "templateUrl": "templates\/homepage\/lastMinuteBets.html"
                    },
                    {
                        "class": "size-5",
                        "sliderSlug": "homepageBottomBanners"
                    }
                ],
                "order": 40
            }
        ],
        sportsLayout: "classic",
        availableSportsbookViews: {modern: false, classic: true, asian: true, external: false},
        enableBetBooking: true,
        enableBetPrint: true,

        gdpr: {
            enabled: false,
            profile: false
        },
        liveMultiViewEnabled: true,
        liveOverviewEnabled: true,
        newMenuItems: {poker: true, virtualSport:true},
        showResultsTabInSportsbook: true,
        enableSubHeader: true,
        displayEventsMaxBet: true,
        showFavoriteCompetitions: true, // show "popular competitions" in classic view
        liveCalendarEnabled: true,
        enableMixedView: true,
        enableMixedViewBalance: true,
        enableNewPoker: true,
        enableMiniGameUnderBetslip: false,
        homePageLastMinuteBets: {
            enable: true,
            timeOptions: [15, 30, 60]
        },
        //statsHostname: 'http://statistics.betcoapps.com/#/en/external/page/h2h',  // hostname for statistics. when clicking on game statistics icon, popup on this hostname is open,
        enableH2HStat: false,
        showFavoriteGamesInSportList: true,

        showEachWay: true,
        nonActivityAction: {
            action: 'logout', // 'reload'
            actionDelay: 0, // milliseconds
            nonActivityInterval: 900, // seconds
            checkingInterval: 5000 // seconds
        },
        showVirtualsInSportList: 0,
        enableCasinoBalanceHistory: true, //enable casino balance history in top menu
        enableCasinoBetHistory: true, //enable casino balance history in top menu
        enableBonusCancellation: true, // enable canceling bonus
        googleAnalyticsId: '',
        showWithdrawRequestsTab: false,
        deleteInboxMessages: true,
        deleteSentMessages: true,
        header: {
            version: 2,
            haveFaq: true,
            messageIcon: {
                enabled: true,
                alwaysShow: true
            }
        },
        footer: {
            poweredBy: 3,  // 0 - don't show,  1 -show with link,  2 - show without link, 3 - show only all right reserved
            about_company_text: {
                eng : ""
            },
            copyrightSince: 2000,
            feedbackButton: {
                enabledLogin: true,
                enabledLogOut: true
            },
            "enableLicenseRowVersion": true

        },
        aocEnabled: true, // enable AOC link in main menu
        availableVideoProviderIds: [15,19, 21, 22, 23, 31],
        aocLink: "#/section/aoc",
        theVeryTopMenu: [{href: "#/promos/", label: "Promotions"}, {href: "#/freebet/", label: "Free Quiz"}, {help: 'payments', label: 'Payments'}],
        enableDepositLimits: false,
        balanceDefaultPage: 'deposit',
        showPointsBalance: true,
        allowTimeFormatChange: true,
        copyrightSince: 2000,
        allowCustomHtml: true,
        logo: {
            "height": 45,
            "heightFix": 30,
            "image": "_logo.png",
            imageByLang: {
                eng: "skins/vbet.com/images/eng.png",
                fre: "skins/vbet.com/images/fr.png",
                geo: "skins/vbet.com/images/ge.png",
                rus: "skins/vbet.com/images/ru.png",
                ukr: "skins/vbet.com/images/ua.png"
            },

            favicon: '_favicon.ico'
        },
        virtualSportsEnabled: true,
        "multiLevelMenu": {
            "@replace": true,
            "live": {
                "order": 10
            },
            "sport": {
                "order": 20
            },
            "casino": {
                "order": 40,
                "subMenu": [
                    {
                        "name": "casino",
                        "displayName": "Home",
                        "href": "#/casino"
                    },
                    {
                        "displayName": "Tournaments",
                        "href": "#/tournaments",
                        "activeLink": "#/tournaments",
                        "excludeParam": true
                    }
                ]
            },
            "livedealer": {
                "order": 45
            },
            "poker": {
                "order": 50
            },
            "games": {
                "order": 60
            },
            "promotions": {
                "title": "Promotions",
                "link": "#/promos/",
                "cssclass": "",
                "order": 70
            }
        },
        betTypes: [
            {name: 'single', value: 1},
            {name: 'express', value: 2}
        ],
        availableLanguages: {
            '@replace': true, // this means that object won't be merged with 'parent object', but will replace it
            "eng": {
                "short": "EN",
                "full": "English",
                "order": 1
            },
            "tur": {
                "short": "TR",
                "full": "Türkçe",
                "order": 2
            },
            'ger': {
                'short': 'DE',
                'full': "Deutsch",
                order: 3
            },
            "rus": {
                "short": "RU",
                "full": "Русский",
                "order": 4
            },
            "ukr": {
                "short": "UK",
                "full": "Українська",
                "order": 5
            },
            "spa": {
                "short": "ES",
                "full": "Español",
                "order": 6
            },
            'pt-br' : { 'short': 'PT-BR', 'full': "Português do Brasil"},
            "fre": {
                "short": "FR",
                "full": "Français",
                "order": 7
            },
            "fas": {
                "short": "FA",
                "full": "Farsi",
                "order": 8
            }
        },
        remindToRenewBalance: {
            enabled: true,
            page: 'deposit',
            threshold: 0.5,
            interval: 14400000 //4 hours
        },
        redirectOnTablets: 'http://mobile.vbet.com/',
        liveChat: null,
        site_id: "4",
        registration: {
            defaultCurrency: 'CFA',
            type: 'partial',
            simplified: true,
            dontFillCityByIp: true,
            securityQuestion: {
                enabled: true
            },
            headerTitle: 'Remember that information entered on the registration form must be real; thanks to this we can confirm your identity and you will be able to proceed with normality.'
        },
        loadPopularGamesForSportsBook: {
            enabled: true,
            level: 'competition',  // game or competition
            type: 'promoted' // promoted or favorite
            //testSiteId: 23 // for debug purpose set to false by default
        },
        "userTimeOut": {
            "enabled": true
        },
        selfExclusion: {
            enabled: true
        },
        realityCheck: {
            enabled: true
        },
        personalDetails: {
            "readOnlyFields": [
                "username",
                "password",
                "user_id",
                "country_code",
                "currency_name",
                "doc_number",
                "first_name",
                "sur_name",
                "email",
                "gender",
                "birth_date"
            ],
            "editableFields": [
                "first_name",
                "sur_name",
                "birth_date",
                "doc_number",
                "city",
                "gender",
                "phone_number"
            ],
            "requiredEditableFields": [
            ],
            patterns:  {
                docNumber: "^[\\d]+$"
            },
            validation: {
                docNumber: "This field can contain only digits"
            },
            limits: {
                doc_number: {
                    minlength: 0,
                    maxlength: 15
                }
            }
        }
    },
    regConfig: {
        step1: [
            {
                "title": "",
                "name": "username",
                "placeholder": "Username",
                "type": "text",
                "required": false,
                "classes": "",
                "customAttrs": [{"required": "required"}, {"ng-pattern": "/^[a-zA-Z0-9\\_\\-]+$/"}],
                "validation": [{"name": "required", "message": "This field is required"}, {
                    "name": "exists",
                    "message": "Sorry, this username has been used already"
                }, {
                    "name": "pattern",
                    "message": "Please, enter valid Username: only English letters, digits and symbols - _ no space is allowed"
                }]
            },{
                "title": "",
                "name": "email",
                "type": "email",
                "placeholder": "Email Address",
                "required": false,
                "classes": "",
                "customAttrs": [{"required": "required"}, {"ng-pattern": "/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+([\.])[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/"}, {"prevent-input": "/^[\\S ]+$/"}, {"ng-maxlength": 50}, {"ng-minlength": 5}],
                "validation": [
                    {"name": "required", "message": "This field is required"},
                    {"name": "pattern", "message": "Please enter a valid email address"},
                    {"name": "exists", "message": "This email already exists in our database, please enter another"},
                    {"name": "maxlength", "message": "Too long"},
                    {"name": "minlength", "message": "Too short"},
                    {"name": "email", "message": 'This is not a valid email address'}
                ]
            }, {
                "title": "",
                "name": "password",
                "placeholder": "Password should contain at least 8 characters",
                "type": "password",
                "required": false,
                "classes": "",
                "customAttrs": [{"type": "{{regItem.inputType}}"}, {"ng-minlength": "8"}, {"required": "required"}, {"ng-maxlength": "14"}, {"ng-keypress": "passwordKeyPress($event, 'password')"}],
                "validation": [{"name": "required", "message": "This field is required"}, {
                    "name": "minlength",
                    "message": "Password should contain at least 8 characters"
                }, {"name": "sameAsLogin", "message": "Password cannot be same as login"}, {
                    "name": "tooShort",
                    "message": "Password is too short"
                }, {
                    "name": "maxlength",
                    "message": "Password is too long"
                }]
            },
            {
                "title": "",
                "name": "country_id",
                "type": "select",
                "required": false,
                "classes": "",
                "customAttrs": [{"ng-options":"item as item.name for item in countryCodes track by item.key"}, {"ng-init": "preFillRegionalData()"}, {"ng-change": "checkIfCountryIsRestricted();"}, {"required": "required"}],
                "validation": [{"name": "required", "message": "This field is required"}],
                "customValidation": "<div  ng-class=\"{error: countryIsRestricted}\"> <div class=\"tooltip-j\"> <p trans ng-show=\"countryIsRestricted\">Registration on this site is not permitted in selected country.</p><p ng-show=\"altUrl4RestrictedCountry\"><span trans>You can register here:</span> <a href=\"{{altUrl4RestrictedCountry}}\">{{altUrl4RestrictedCountry}}</a></p></div>"
            },
            {
                "title": "",
                "name": "currency_name",
                "type": "select",
                "required": false,
                "classes": "",
                "customAttrs": [{"ng-options": "c for c in  conf.availableCurrencies track by c"}, {"ng-disabled": "currencyDisabled"}],
                "validation": []
            }]
    },
    'env': {
        showFifaCountdown: false,
        lang: 'tur',
        preMatchMultiSelection: false
    },
    'betting': {
        totalOddsMax: 3000,
        enableEachWayBetting: true,
        allowManualSuperBet: false,
        enableSuperBet: false,
        enableHorseRacingBetSlip: true // SP, new bet types, etc.
    },

    backgammon: {
        downloadLink: {
            windows: 'http://casino.vbet.com/nardi/VGammon-1.1.25-Setup.exe'
        }
    },
    "swarm": {
        url: [{ url: "https://as-swarm-ws-re.betconstruct.com/"}],
        websocket: [{ url: "wss://eu-swarm-ws-re.betcoswarm.com/"}]
    },
    xDomainSlaves: '{"https://swarm5.betconstruct.com" : "/xdomain-proxy.html", "http://casino.vbet.com" : "/global/partners/xdomain/xDomainProxy.html"}',
    "payments": [

    ]
});
CMS.constant('SkinWPConfig', {
    wpUrl: 'https://cmsbetconstruct.com/json',  // WordpResss instance serving pages, banners
    wpNewsUrl: {
        main: 'https://cmsbetconstruct.com/json'
    },  // WordpResss instance serving news
    "wpBaseHost": {
        "default": "vbet"
    },  // this parameter will be passed to JSON api and all links in response(e.g. images) will have this host
    wpNewsBaseHost: 'vbet'  // this parameter will be passed to JSON api and all links in NEWS response(e.g. images) will have this host
});
CASINO.constant('SkinCConfig', {
    cUrlPrefix: '//games.vbet.com',
    cGamesUrl: '/global/play.php',
    cUrl: '/global/casinoGamesLoad.php',
    main: {
        partnerID: '4',
        multiViewEnabled: true,
        filterByProviderEnabled: true,
        storedbonusPopUpLifetime: 259200000 // 3days
    },
    liveCasino: {
        view3DEnabled: false,
        viewStyle: 'SliderView' // 3DView / ClassicView / SliderView
    },
    login: {
        url: '/global/partners/rml.php'
    },
    balance: {
        url: '/global/cashier/cashier.php'
    },
    jackpot: {
        url: '/jackpot/getJackpotData.php'
    },
    bonusPopUpUrl: false
});
