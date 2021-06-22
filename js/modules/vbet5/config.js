angular.module('vbet5').constant('Config', {
    'main': {
        prefetchLeftMenuHoveredLivesGames: {
            enabled: false,
            prefetchAfter: 250
        },
        siteTitle: {
            'arm': '',
            'rus': '',
            'eng': ''
        },
        header: {
            version: 2,
            showHelpIcon: true,
            showFavoriteIcon: true,
            haveFaq: false,
            openFaqAsPopup: false,
            hideClock: false,
            enableTimeZoneSelect: false, // show time zone switcher or not
            hideTopMenu: false,
            disableRegistrationAndLogin: false,
            customTemplate: false,
            messageIcon: {
                enabled: true,
                alwaysShow: false
            },
            statisticsLink: false,
            enableSettings: {
                authorized: true,
                notAuthorized: true
            }
        },
        footer: {
            disable: false,
            ageRestriction: false, // false to disable, number, to display that number with plus sign in footer.  e.g. 18
            disableCopyrightBlock: false,
            copyrightSince: 2003,
            poweredBy: true,  // 0 - don't show,  1 -show with link,  2 - show without link, 3 - show only all right reserved
            feedbackButton: {
                enabledLogin: false,
                enabledLogOut: false
            },
            showPaymentSystems: true,
            enableToTopButton: true,
            enableLicenseRowVersion: false
            //license_logos: [], // {href: "", img: "", height: "", width: "", target: "", show_on: "", hide_on: "", iframe: "link", css: ""}
        },
        promotionShare: {
            'facebook': false,
            'twitter': false
        },
        homepage: [
            {
                /*
                 fullWidth: true,
                 maxWidth: 1310px,
                 items {
                     {
                         'class': "",
                         templateUrl: "",
                         maxHeight: "300px".
                         height: "300px".
                         mediaHeight: "300px".
                     }
                 }*/
                items: [
                    {
                        'class': "size-7",
                        templateUrl: "templates/homepage/mainSlider.html"
                    },
                    {
                        'class': "size-5",
                        sliderSlug: "homepageRightBanners"
                    }
                ]
            },
            {
                items: [
                    {
                        'class': "size-12",
                        templateUrl: "templates/homepage/productsSlider.html"
                    }
                ]
            },
            {
                items: [
                    {
                        'class': "size-12",
                        templateUrl: "templates/homepage/featuredGamesSlider.html"
                    }
                ]
            },
            {
                items: [
                    {
                        'class': "size-7 size-m-12",
                        height: "360px",
                        templateUrl: "templates/homepage/newsWidget.html"
                    },
                    {
                        'class': "size-5 size-m-12",
                        height: "360px",
                        templateUrl: "templates/homepage/lastMinuteBets.html"
                    }
                ]
            }
        ],
        suggestionsInLiveSection: {
            enabled: false,
            title: "Live Casino Games",
            suggestions: [
                {
                    title: "Live Bet on Poker",
                    iconClass: "vgs113",
                    url: "#/livedealer/?page=home&game=598",
                },
                {
                    title: "Bet on Teen Patti",
                    iconClass: "vgs2001",
                    url: "#/livedealer/?page=home&game=12868",
                }
            ]
        },
        recaptcha: {
            title: "",
            name: "g_recaptcha_response",
            type: "recaptcha",
            placeholder: "",
            required: true,
            classes: "",
            validation: [{"name": "required", "message": "This field is required"}, {"name": "notmatching", "message": "This field is required"}]
        },
        asianShowTeamNames: true,
        matchKey: {
            descriptionHref: "https://www.sportify.direct/real-sport"
        },
        asianLoadDays: 1, //   asianview# loads first loadDays for default, for the first time , when localstorage is not set yet
        skin: 'vbet.com',
        kievAnimationSettings: {
            score: true,
            statistic: false,
            team_names: true,
            timer: false
        },
        logo: {
            url: "#/",
            // image: "skins/vbet.com/logo.png",
            // imageFix: "skins/vbet.com/logo2.png",

            // width: 100,
            // widthFix: 200,

            // height: 300,
            // heightFix: 400,

            // secondImage: "skins/vbet.com/logo.png",

            // paddingMenu: 80,
            favicon: "favicon.ico"
        },
        priceChangesSettingMode: {},
        disableTeamPlayersLogo: true, // disables team players logos : implemented for russia 2018 cup
        appPokeristUrl: false,
        defaultTransLang: 'eng',  //default translation language: // translator will translate strings to default language if translation is not available for selected language
        site_id: '13', //13 is test id
        source: 42,
        showQuizForAuthorized: true,
        customFramePage: {
            url: null,
            authorized: false
        },
        depositLimits: {
           editable: true
        },
        managePassportOptions: {
            download: true,
            view: true
        },
        PMUId: 181,
        sportTournaments: {
            enabled: false,
            showInLive: true,
            filters: [
                {
                    name: 'Status',
                    field: 'Stage',
                    okButton: true,
                    noRefresh: true,
                    filters: [
                        {name: 'All', all: true, active: false},
                        {name: 'Upcoming', value: 3, active: true, stageList: 3},
                        {name: 'tournament_live', value: 2, active: true, stageList: 2},
                        {name: 'Finished', value: 1, active: false, stageList: 1},
                        {name: 'Canceled', value: -1, active: false, stageList: -1}
                    ]
                },
                {
                    name: 'Registration status',
                    field: 'registrationStatus',
                    filters: [
                        {name: 'Registration Started', value: 1},
                        {name: 'Registration Finished', value: 2}
                    ]
                },
                {
                    name: 'Entry type',
                    field: 'buyInStatus',
                    filters: [
                        {name: 'Buy-in', value: 2},
                        {name: 'Free Entry', value: 1}
                    ]
                }
            ]
        },
        maximumNumberOfLinesInPayments: 3,  // 0 to not show read more in payments
        calendarPrematchSelection: false,
        esportsOutrightEventsLimit: 8,
        enableShowPassword: false,  // enable/disable show password icon
        geoIPLangSwitch: {
            enabled: false
        },
        nonActivityAction: {
            action: 'disconnect', // 'reload', 'logout'
            actionDelay: 300000, // milliseconds
            nonActivityInterval: 1800, // seconds //must be 1800
            checkingInterval: 5000, // miliseconds
            showNonActivityActionPopUp : true // show non Activity popup
        },
        liveCalendarSelectAllSports: true,

        sportsWithAnimations: {
            'Soccer':'VBET5',
            'Tennis':'VBET5',
            'Basketball':'VBET5',
            'AmericanFootball': 'external',
            'Badminton': 'external',
            'Baseball': 'external',
            'BeachVolleyball': 'external',
            'Bowls': 'external',
            'Formula 1': 'external',
            'Futsal': 'external',
            'Handball': 'external',
            'IceHockey': 'external',
            'SkiJumping': 'external',
            'Snooker': 'external',
            'Speedway': 'external',
            'TableTennis': 'external',
            'Volleyball' : 'external'
        },
        collapseMenuInLive: false,
        defaultTimeFormat: null,
        enableDownloadPDFInHelpPages: true,
        layoutTimeFormat: {asian: 'MM/DD'},
        enableMenuSearch: true,
        allowSiteIdOverride: false,
        googleAnalyticsId: false,
        classicViewDefaultType: 1,
        cegSealId: false,
        googleAnalyticsEnableDisplayFeatures: false, // enable GA display features plugin
        yandexMetricaId: false,
        redirectOnTablets: false, //  if URL is provided will redirect to that URL on tablet devices
        sportsLeftMenuSortingFunctionName: 'orderSorting', // the name of sorting function 'orderSorting' or 'alphabeticalSorting'
        enableNewPoker: false,
        promotionalBonuses: {
            enable: true,
            sportsbook: true,
            casino: true,
            showApplyButton: false,
            showClaimableInfoBeforeDeposit: false,
            disableColumns: {}
            /*bonusRequestURL: "iframe/URL" append iframe in profile>bonus section*/
        },
        enableBonusSectionInWallet: true,
        enablePointsSectionInWallet: true,
        electronicSportAlias: ['CyberFootball', 'EBasketball', 'CounterStrike', 'Dota2', 'LeagueofLegends', 'Hearthstone', 'HeroesoftheStorm', 'StarCraft2', 'WorldofWarcraft', 'WorldofTanks', 'Smite', 'Overwatch'],
        homePageLastMinuteBets: {
            enable: false,
            timeOptions: [15, 30, 60]
        },
        idToken: {
            enabled: false,
            refreshPeriod: 2000,
            apiUrl: 'https://qrlogin.fasttoken.com'
        },
        homework: {
            enabled: false,
            loggedInPopupLifetime: 86400000,
            loggedOutPopupLifetime: 86400000
        },
        gdpr: {
            enabled: false,
            popup: true,
            profile: true,
            options: {
                subscribe_to_internal_message: 'Internal Messages',
                subscribe_to_push_notification: 'Push Notifications',
                subscribe_to_phone_call: 'Phone Call',
                subscribe_to_email: 'Email',
                subscribe_to_sms: 'SMS'
            }
        },
        betStatus: {
            enabled: false
        },
        drawDataUrl: 'https://cptca.betconstruct.com/niva/json.php',
        drawStreamUrl: 'rtmp://stream-eu2hz.betconstruct.com:1935/livedealer1/shanttv',
        gamesEnabled: true,
        betBuilderSports: {},
        hidePointsForCompetitions: {},
        virtualBettingEnabled: true,
        visibleItemsInTopMenu: 7, // visible items quantity in Top Menu in small view
        sportSavedGamesEnabled: true, //enable sports saved games slider tab
        casinoSavedGamesEnabled: true, //enable casino saved games slider tab
        enableBonusCancellation: false, // enable canceling bonus
        balanceSeparateDepositBanners: true,
        freeBet: {
            offsetDays: [0, 1, 2, 3, 4, 5, 6],
            disableDaysFilter: false
        },
        betOnPolitics: 'https://bop1.betconstruct.me/',
        teamLogosPath: 'https://statistics.bcapps.org/images/',
        disableAsianBetSlipTooltip: false,
        hideLiveCalendarNumber: false,
        betslipInputFieldCustomValue: 'Stake...',  //custom value for betslip input placeholder
        enableSystemCalculator: false,
        bettingCalculator: {
            enabled: false,
            type: 'system', //if no config betting
            deadHeat: false,
            rule4: false
        },
        betHistory: { // the entire bet-history configuration should be moved here
            enableRecalculationNoteColumn: false,
            showPayoutInsteadOutcome: false,
            enableReturnedFilter: true
        },
        betHistoryEnabled: true,  //enable bet history in top menu
        enableCasinoBalanceHistory: false, //enable casino balance history in top menu
        enableCasinoBetHistory: false, //enable casino balance history in top menu
        enableMixedView: true,
        enableMixedViewBalance: true,
        enableCommaSeparateNumber: false, // enable comma in input field
        bonusesEnabled: false, //enable bonuses (will show bonus amounts in bet/balance histories)
        openProfileMenuByHover: true,
        promoVersion:1,
        poolBettingPointsAmount: 10,
        disableDecimalSubMenu: false,
        disableDepositPage: false,
        disableWithdrawPage: false,
        recentBetsInSettings: false,
        forceNumpadAttr: false,
        showWithdrawRequestsTab: false,
        sportsAlwaysOnTop: false,
        competitionsOrderByTimeInAsianView: false, //for order competitions by time in Asian view, default value false
        customSelectedSequenceInAsianSportsbook: false,
        ukLicense: false, // Config for UK skins
        asian: {
            competitionsPerPage: 10,
            separateMatchEventsOnHDP: [
                {
                    index: '',
                    all: true
                }
            ],
            storageFilterData: 86400000,
            asianLeftMenuDefaultType: 1,
            asianDefaultTheme: false, //'black' or 'white'
            showOddEvenMarketsInOverview: false,
            showAllHandicapSigns: true,
            optimalMarkets: [1],
            countdown: {
                enabled: false,
                '0': 60, // seconds
                '1': 20, //seconds
                '2': 40 // seconds
            },
            daysToSelectByDefault: [1]
        },
        homepagePageType: 'sport',  // the type of home page (sport, casino, poker)
        disableEditingPersonalInfo: false,
        userTimeOut: { // uset timeout settings
            enabled: true,
            type: 6,
            options: [
                {
                    name: "24 hours",
                    limit: {
                        period: 1,
                        type: 'days'
                    }
                },
                {
                    name: "One week",
                    limit: {
                        period: 7,
                        type: 'days'
                    }
                },
                {
                    name: "One month",
                    limit: {
                        period: 1,
                        type: 'months'
                    }
                },
                {
                    name: "Two months",
                    limit: {
                        period: 2,
                        type: 'months'
                    }
                }
            ]
        },
        selfExclusion: { // uset self exclusion settings
            enabled: false,
            type: 2,
            confirmationText: "Do you confirm that you wish to self-exclude?",
            options: [
                {
                    name: "6 months",
                    limit: {
                        period: 6,
                        type: 'months'
                    }
                },
                {
                    name: "1 year",
                    limit: {
                        period: 1,
                        type: 'years'
                    }
                },
                {
                    name: "2 years",
                    limit: {
                        period: 2,
                        type: 'years'
                    }
                },
                {
                    name: "5 years",
                    limit: {
                        period: 5,
                        type: 'years'
                    }
                }
            ]
        },
        realityCheck: { // type of value is seconds
            enabled: false,
            options: [
                {
                    name: "no limit",
                    value: 0
                },
                {
                    name: "10 mins",
                    value: 600
                },
                {
                    name: "20 mins",
                    value: 1200
                },
                {
                    name: "30 mins",
                    value: 1800
                },
                {
                    name: "1 hour",
                    value: 3600
                },
                {
                    name: "2 hours",
                    value: 7200
                },
                {
                    name: "4 hours",
                    value: 14400
                },
                {
                    name: "6 hours",
                    value: 21600
                },
                {
                    name: "8 hours",
                    value: 28800
                }
            ]
        },
        "loginLimit": {
            enabled: false,
            options: [
                {
                    name: "no limit",
                    value: 0
                },
                {
                    name: "30 mins",
                    value: 30
                },
                {
                    name: "1 hour",
                    value: 60
                },
                {
                    name: "2 hours",
                    value: 120
                },
                {
                    name: "4 hours",
                    value: 240
                },
                {
                    name: "6 hours",
                    value: 360
                },
                {
                    name: "8 hours",
                    value: 480
                }
            ]
        },
        sportListColumnNumber: 6,    //number of columns in Sports  "more" dropdown block
        regionsListColumnNumber: 5,  //number of columns in Regions  "more" dropdown block
        sportListMaxVisibleItems: 7,  //maximum number of sports visible in explorer (the rest will go in "more" block)
        regionsListMaxVisibleItems: 6,  //maximum number of regions visible in explorer (the rest will go in "more" block)
        sportListMaxVisibleItemsWide: 13,  //maximum number of sports visible in explorer in wide screen mode (the rest will go in "more" block)
        regionsListMaxVisibleItemsWide: 11,  //maximum number of regions visible in explorer in wide screen mode (the rest will go in "more" block)
        authSessionLifetime: 600000, // in milliseconds,
        saveLoginDataLifeTime: 31540000000, // 1 year in milliseconds,
        showFavoriteGamesInSportList: false,
        showVirtualsInSportList: false,   // false to hide,  any number to show (number is used as 'order' field to define it's position among sports)
        todayBets: {
            enabled: false, // false to disable
            order: null, // to show (number is used as 'order' field to define it's position among sports)
                         // if order number is 'null', on the pre-match section, it will not opened as default
                         // when order is '1' or '0' and `expandFirstSportByDefault: true` pre-match section will open Today'sBets as default section

            timeShift: 0, // can change day shift starting from current time
            additionalItems: []
        },
        boostedBets: {
            enabled: false,
            order: null
        },
        recommendedGames: {
            enabled: false,
            order: null
        },
        couponGames: {
            enabled: false,
            order: null
        },
        expressOfDay: {
            enabled: false,
            maxVisibleItems: 4,
            order: null,
            showBetCount: false
        },
        showOutright: false,    // false to hide,  any number to show (number is used as 'order' field to define it's position among sports)
        showMapSection: false,   // false to hide,  any true to show Map Section in About Page
        showFavoriteCompetitions: false,
        favoriteCompetitionSportSorting: {
            enabled: false,
            sportsOrderList: {
                /*sport alias lowercase: order
                example:
               'icehockey': 1*/
            }
        },
        expandOnlyOneSport: false,
        expandMoreSportsByDefault: true,
        expandFirstSportByDefault: true,
        showPrematchLimit: 10, // 0 if disabled
        selectRegionsByDefault: false, // will filter by region
        forgetFiltersSettings: false, // when true untoggles video and regional filters on route change/page refresh
        hideP1XP2FromOpenGame: false,
        enableSportsbookLayoutSwitcher: false, //enable layout switcher
        enableSettingHideLabels: true,
        classicScrollToggleDefaultState: false,
        enableLiveSectionPin: true,
        friendReferral: { //{month: < functional start month >, year: < functional start year > } e.g. {month: 1, year: 2016}
            enabled: false,
            month: 1,
            year: 2016
        },
        availableSportsbookViews: {modern: true, asian: false, external: false, classic: true},
        availableAsianViewThemes: [],
        sportsbookLayoutSwitcherTooltipTimeout: 3000, // number of milliseconds to show the hint
        loadNotificationsFromWP: false,
        hideExpressIds: false,  // hide chain icon and express ids in game view
        replaceP1P2WithTeamNames: true,
        enableNewHorseRacingTemplate: true,
        showEachWay: false,
        hideGmsMarketBase: false, //hides market base when new backend is on
        GmsPlatform: false,
        virtualSportIds: {
            virtualsports: [54, 55, 56, 57, 118, 150, 173, 174, 188, 209],
            insvirtualsports: [132, 133, 134, 135, 136, 137, 138]
        },
        enableBetPrint: false,
        downloadPDFButtons: false,
        sportsLayout: "classic",
        customSportIds: {
            cyber: [43,71,73,74,75,76,77,78,79,80,81,82,83,84,85,120,123,139,140,141,142,144,145,146,149,156,157,158,169,175,185,187,189]
        },
        openHelpAsPopup: 'OnlyHeaderPopup',
        messagesPageMenu: ['inbox', 'sent', 'new'],
        openFaqAsPopup: false,
        localStorageKeyNamePrefix: false,  // set a string to store all values in local storage with key prefixed with that string
        enableBetBooking: false,  //enable booking bets (get booking id instead of placing bet)
        enableBetBookingPopup: false,  //enable booking popup showing booking id
        bookingLogoUrl: 'logo.png', //booking print page logo
        bookingBetPrint: {
            showPrintButton: true,
            viewType: 1, // 1: for id only print view, 2: for full betslip print view
            message: 'This booking number does not determine the the  final odds of the betslip but only the exact selections of the bet. The odds of the betslip can constantly change and may only be confirmed by the cashier after the final acceptance of the bet.'
        },
        enableAccountVerification: false,
        accountVerificationMessage: false,
        enableDepositLimits: false,
        newMenuItems: {},
        displayEventsMaxBet: false, //  display event max bet on hover
        classicMarkets2ColSorting: false,  //sort markets of game by order in 2 columns ( 1-2, 3-4, 5-6  instead of  1-4, 2-5, 3-6)
        rememberMeCheckbox: {
            enabled: true,
            checked: false
        },
        showOfficeView: false,  // false for hide 360 Office View (or another url) on About Page
        liveModule: {
            enabled: false  //external (Gaspar's) sportsbook
        },
        headerNavigation: {},
        multiLevelMenu: {},
        defaultAvailablePaths: ['/news', '/promos', '/cas-promos', '/about','/first_deposit_bonus', '/first_deposit_bonus_and_20_free_spins', '/404', '/draw', '/exchange-shop', '/registration', '/vrlivedealer', '/help', '/ogwil', '/quiz'],
        disableLiveChatPaths: ['/popup', '/widget'],
        'rfid': {
            loginWIthRFID: false,
            promptRFIDPassword: false,
            allowAccessWithoutRfid: false
        },
        enableSubHeader: false,  // show 2nd level menu
        hideSubHeaderByPath : {'/': true, '/virtualsports/': true, '/esports/': false, '/pmu/': true},
        showResultsTabInSportsbook: false, //show results tab in sportsbook top tab
        showResultsMaxDays: 2, // current max is 2 days. This config doesn't function now, as "get_active_competitions" request can't show results for more than two days. May change in the future
        allowHidingUsernameAndBalance: true,
        allowTimeFormatChange: false,
        balanceDefaultPage: 'deposit', // balanceHistory, deposit, withdraw, cashier
        balanceHistoryDisabledOperations: [], // see available values in  js/modules/vbet5/controllers/balance.js
        balanceHistoryMonthCount: 1,
        countOfRecentBetsToShow: 4,
        casinoBalanceDefaultPage: 'cashier',
        buddyTransfer: {
            enabled: false,
            iconInPayments: false,
            iconInTab: true,
            options: {
              userId: false,
              friendName: false,
              username:true
            },
            simple: true
        },
        enableLoyaltyPoints: false,
        loyaltyPointsShowAlwaysNextLevel: false,
        settingsDefaultPage: 'details', // details, changepassword
        passwordNewResetMode: false,
        enableForgotPassword: true,
        enableFreeRenew: false,  //  'renew' for getting free money (available in free.vbet.com)
       //statsHostname: 'http://statistics.betconstruct.com/#/en/external/page/',  // hostname for statistics. when clicking on game statistics icon, popup on this hostname is open,
        statsHostname: {
            prefixUrl: 'https://statistics.betcoapps.com/#/',

            subUrl: '/external/page/'
        },
        enableH2HStat: false,
        matchLineupStatistics: {
            prefixUrl: 'https://krosstats.betcoapps.com/api/{lang}/900/93f428d0-6591-48da-859d-b6c326db2448/Match/GetMatchByIdMobile?matchId='
        },
        enableTeamLogosOnHomepage: true,
        enableVisibleInPrematchGames: false,
        poolBettingResultsUrlPrefix: 'http://www.vbet.com/results/',
        horceRacingXmlUrl: 'https://data.vbet.com/horseracing-tmp/',
        horseRacingUrlPrefix: 'https://horseracing.betcoapps.com/',
        virtualBettingUrl: '#/casino/?category=35',
        beloteUrl: '#/games/?game=547',
        backgammonUrl: '#/games/?game=599',
        monthNames: [{name: 'Jan', val: '01'}, {name: 'Feb', val: '02'}, {name: 'Mar', val: '03'}, {name: 'Apr', val: '04'}, {name: 'May', val: '05'}, {name: 'Jun', val: '06'}, {name: 'Jul', val: '07'}, {name: 'Aug', val: '08'}, {name: 'Sep', val: '09'}, {name: 'Oct', val: '10'}, {name: 'Nov', val: '11'}, {name: 'Dec', val: '12'}],
        showGameIds: false,  //show game ids
        trackingScripts: [],
        deleteInboxMessages: false,
        deleteSentMessages: false,
        maxMessageLength: 4000,
        offlineMessage: false,
        smsVerification: {
            timer: 120, // seconds
            allowResend: 5 // seconds
        },
        convertCurrencyName: {},
        search: {   //limits of search results
            limitGames: 15,
            limitCompetitions: 15,
            enableSearchByGameNumber: true
        },
        results: {
            version: 1
        },
        preventPuttingInIFrame: false, //if true, app will check if it's inside iframe and will redirect top window to iframe url
        liveChat: null,
        availableLanguages: {
            'eng': { 'short': 'EN', 'full': "English"},
            'arm': { 'short': 'HY', 'full': "Հայերեն"},
            'rus': { 'short': 'RU', 'full': "Русский"}
        },
        disableBracketsForLanguages: ['heb'],
        timeZonePerLanguage: {
//            'rus' : '+04:00',
//            'tur' : '+03:00'
        },
        allowCustomHtml: false, // allow custom html scripts and html tags
        customLanguageCss: [],
        poolBettingCurrencyName: 'EUR', //currency in which jackpot will be displayed in top menu
        balanceFractionSize: 2, //number of decimal places to round the balance value to(when displaying)
        showPointsBalance: false, // show points balance in user dropdown menu
        registration: {
            enable: true,
            enableSignIn: true,
            enableRegisterByPhoneNumber: false,
            simplified: false, //simplified 2-step registration
            promoCodeLifetime: 1296000000, //(in milliseconds)  15 days
            defaultPromoCode: null,
            deaultPromocodePerDomain: null,  // see bt848.com skin for options
            minimumAllowedAge: 18,
            suggestPokerRegistration: false,
            phoneNumberPattern: '^[0-9 ]+$',
            phoneNumberLength: '20',
            replacePhoneNumberAreaCode: false,
            RegTimeSmsValidation: false,
            loginRightAfterRegistration: true,
            enablePassportValidation: true,
            termsLink: false,
            defaultCountryCode: null,
            loadExternalScriptAfterRegistration: null, //  script that will be loaded after registration is complete
            sliderPageAfterRegistration: 'deposit', // will open this page after completing registration and clicking "ok"
            autoSetCurrency: {   //automatically sets currency in registration form based on selected country (only for selected country-currency pairs)
                enabled: true,
               // disableChangeAfterSelect: false,   //will not let user change another currency for selected country
                availableList: {}
            },
            securityQuestion: {
                enabled: false,
                questions: ['What was the name of your first pet?', 'What age were you when you went to school?', 'What was the name of the city you were born in?', 'What was the number of your school?', 'What was the name of your first love?', 'What was the make and model of your first car?']
            },
            enableNotifySms: false,
            enableNotifyEmail: false,
            removeRestrictedCountries: true,
            defaults: {}
        },
        finbet: {
            topTab: false,
            pages: [
                {
                    css: 'finbet-version-1-t',
                    name: 'Version 1',
                    url: '#/financials/'
                    //iframeUrl: '//casino.vbet.com/global/betconstructGames.php?gameid=Financials&table_id=0&lan=eng&isNewSite=1&mode=fun&partnerid=4&fromstage=0&homeaction=&loginaction=&playerID='
                },
                {
                    css: 'finbet-version-2-t',
                    name: 'Version 2',
                    url: '#/game/TLCTLC/provider/TLC/exid/14000'
                    //iframeUrl: '//casino.vbet.com/global/integration/tradologic/index1.php?mode=fun&gameId=TLC&token={token}&lang=eng&currency=&userid={userId}'
                }
            ]
        },
        personalDetails: {
            readOnlyFields: ['user_id', 'first_name', 'sur_name', 'birth_date', 'gender'],
            editableFields: ['country_code', 'city', 'address', 'email', 'phone_number', 'subscribed_to_news'],
            requiredEditableFields: ['country_code', 'city', 'address', 'email'],
            disabledFields: [],
            patterns:  {
                email: "^([a-zA-Z0-9]+([_+\.-]?[a-zA-Z0-9]+)*)@([a-zA-Z0-9]+)([a-zA-Z0-9\\-\.]+)([\.])([a-z]+)([^~@!#$%^&*()_+|{}:<>?,/;'-=\\[\\]\\`\"\.\\\\])$",
                userName: "^[^0-9\\[\\]\\\\`~!@#$%^&*()_+={};:<>|./?,\"'-\\s]+$",
                docNumber: "^[A-Za-z\\u0400-\\u04FF0-9]*[0-9]+[A-Za-z\\u0400-\\u04FF0-9]*$",
                personalId: "^[A-Za-z0-9\u0400-\u04FF]+$",
                address: "^[^~!@$%^&*()_+={};:<>|?\\[\\]\\'\\\"]*$",
                phoneNumber: "^00[0-9]+$"
            },
            validation: {
                email: "Invalid email",
                userName: "Please enter a valid last name: only letters - no space, no digits and/or symbols.",
                docNumber: "This field can contain only digits and English or Russian letters",
                personalId: "Please enter only Latin or Cyrillic letters and numbers"
            },
            limits: {
                city: {
                    minlength: 2,
                    maxlength: 50
                },
                phone_number: {
                    minlength: 5,
                    maxlength: 20
                },
                first_name:{
                    maxlength: 50
                },
                sur_name:{
                    maxlength: 50
                }
            }
        },
        remindToRenewBalance: {
            enabled: false,
            page: 'renew', // renew or deposit or any other slider page
            threshold: 10,
            dialog: {
                "title": "Warning",
                "content": "Your balance is low, you can make a deposit to proceed.",
                "type": "dialog",
                "template": "templates/popup/recharge.html",
                "tag": "low-balance",
                "showTransferButton": false,
                "hideButtons": true

            },
            interval: 14400000 //4 hours
        },
        // custom sports book builder enable/disable parts
        customSportsBook: {
            enabled: false,
            modern: {
                showPrematch: true,
                showLive: true
            },
            combo: {
                showPrematch: true,
                showLive: true
            },
            external: {
                showPrematch: true,
                showLive: true
            },
            asian: {
                showPrematch: true,
                showLive: true
            },
            classic: {
                showPrematch: true,
                showLive: true
            }
        },
        betTypes: [
            {name: 'single', value: 1},
            {name: 'express', value: 2},
            {name: 'system', 'value': 3},
            {'name': 'chain', 'value': 4}
            //{'name': 'Trixie', 'value': 10},
            //{'name': 'Patent', 'value': 11},
            //{'name': 'Yankee', 'value': 12},
            //{'name': 'Lucky 15', 'value': 13},
            //{'name': 'Canadian', 'value': 14},
            //{'name': 'Lucky 31', 'value': 15},
            //{'name': 'Heinz', 'value': 16},
            //{'name': 'Lucky 63', 'value': 17},
            //{'name': 'Super Heinz', 'value': 18},
            //{'name': 'Goliath', 'value': 19}
        ],
        multiColumnMarketFilterTypes: {
            P1XP2: {key: 'WINNER', subKey: 'MATCH'},
            Handicap: {key: 'HANDICAP', subKey: 'MATCH', eventTypes: ['Home', 'Away'], optimalMarkets: [1]},
            OverUnder: {key: 'TOTALS', subKey: 'MATCH', eventTypes: ['Over', 'Under'], optimalMarkets: [1]}
        },
        oddFormats: [
            {name: 'Decimal', format: 'decimal'},
            {name: 'Fractional', format: 'fractional'},
            {name: 'American', format: 'american'},
            {name: 'HongKong', format: 'hongkong'},
            {name: 'Malay', format: 'malay'},
            {name: 'Indo', format: 'indo'}
        ],
        upcomingGamesPeriods: [1, 2, 3, 6, 12, 24, 48, 72],  //periods available for user to select for upcoming games (hours)
        defaultBetHistoryPeriodIndex: 5,
        disableBetSlip: false, //disable news block on homepage
        enableLoginHistory: false, //enable login history page in section my profile
        enableNews: false, // enable news on sport page
        autoLoadNews: true,
        transferEnabled: true, //enable "transfer" tab
        enableBannerUnderBetslip: true, // enable banner under the betslip
        enableNewsInModernView: false,
        expandedRightInfoBlock: {
            live: true,
            prematch: false
        },
        showNewsInClassicView: false,  //show news block under betslip in classic view
        sportNewsLink: '',
        sportNewsBlockNewWindow: false,
        combo: {
            showMoreOdds: false
        },
        enableBSEventReplacingForSports: [3], // try to replace deleted event with another from same game with same market and event type using base
        enableMiniGameUnderBetslip: false, // enable mini casino game under the betslip
        enableBannersInsideSportsbookGames: false, // enable banners under sportsbook game(classic view)
        showPromotedGames: {}, //  retrieve(from swarm) and show promoted games in specified location(s).   see bonanzawin config for example
        showPopularGames: false, //show "popular" games selector (as region)
        availableVideoProviderIds: [1, 3, 5, 7, 8, 11, 12, 15, 16, 19, 999999, 31], //list of available providers
        videoProvidersThatWorkWithIframe: {
            6: 1,
            21: 1,
            22: 1,
            23: 1,
            24: 1,
            26: 1,
            29: 1,
            30: 1,
            31: 1,
            32: 1
        },
        videoEnabled: true, //enable game videos
        video: {
            enableOptimization: true,
            autoPlay: true, //disable autoplaying implemented only for classic view
            providersThatSupportHls: {
                15: true,
                1: true,
                5: true,
                25: true,
                35: true}
        },
        availableVideoProviderCountryFilters: { 1: ['AM'], 3: ['AM'], 5: ['AM'], 7: ['AM'], 8: ['AM'], 11: ['AM'], 12: ['AM'], 15: ['AM'], 16: ['AM']},
        availableVideoProviderCountryFiltersActive: false,
        detachedVideoSizes: {
            3: {
                maxWidth: 500,
                maxHeight: 400
            },
            25: {
                maxWidth: 800,
                maxHeight: 453
            }
        },
        featuredGames: {
            rotationPeriod: 5000,  // each featured game on homepage will be shown for this amount of time (in milliseconds)
            limitation: 9,
            backgroundsCompetitionsPath: 'images/featured-games-backgrounds/',
            backgroundsCompetitionsMaps: {
                '541': 'competitions-bg-bundesliga.png',
                '566': 'competitions-bg-champions-league.png',
                '1961901776': 'competitions-bg-champions-league.png',
                '2991': 'competitions-bg-copa-del-rey.png',
                '572': 'competitions-bg-coppa-italia.png',
                '545': 'competitions-bg-la-liga.png',
                '565': 'competitions-bg-coupe-de-france.png',
                '1876': 'competitions-bg-dfb-pokal-germany.png',
                '1861': 'competitions-bg-europa-league.png',
                '1963328565': 'competitions-bg-europa-league.png',
                '548': 'competitions-bg-league-1.png',
                '538': 'competitions-bg-premier-league.png',
                '543': 'competitions-bg-seria.png',
                '1840': 'competitions-bg-fa-cup-england.png',
                '3013': 'competitions-bg-super-league.png',
                '1792': 'competitions-bg-brazilian-seria-a.png',
                '2988': 'competitions-bg-copa-libertadores.png',
                '3015': 'competitions-bg-turkish-cup.png',
                '1129': 'competitions-bg-autstralian-open.png',
                '1130': 'competitions-bg-autstralian-open.png',
                '686': 'competitions-bg-basket-europaleague.png',
                '1732': 'competitions-bg-nhl.png',
                '1738': 'competitions-bg-kxl.png',
                '756': 'competitions-bg-nba.png',
                '3014': 'competitions-bg-tff.png',
                '807': 'competitions-bg-tbsl.png',
                '1855': 'competitions-bg-euro2020.png',
                '4736': 'competitions-bg-roland-garos.png',
                '4737': 'competitions-bg-roland-garos.png',
                '10149': 'competitions-bg-roland-garos.png',
                '10150': 'competitions-bg-roland-garos.png',
                '1780': 'competitions-bg-ice-hockey-world-championship.png',
                '1781': 'competitions-bg-australia-a-league1.png',
                '3020': 'competitions-bg-ukraine-premier-league1.png',
                '2985': 'competitions-bg-copa-sudamericana1.png',
                '9275': 'competition-bg-copa-americana.png'
            }
        },
        beloteSlidesRotationPeriod: 6000,  // each belote banner will be shown for this amount of time (in milliseconds)
        backgammonSlidesRotationPeriod: 4000,  // each backgammon banner will be shown for this amount of time (in milliseconds)
        underBetslipBannersRotationPeriod: null,   // period in milliseconds or null to disable rotation and show all at once

        enableFormUrl: false,
        showSearchInsideSportsbook: false, // will show search box inside sportsbook, under regions (needed for skins without menu)
        showSurveyPopup: false,
        loadLiveWidgetGamesFrom: {
            type: 'favorite' // promoted or favorite
        },
        showPromotedGamesOnHomepage: {
            enabled: false,
            level: 'game',  // game or competition
            type: 'promoted' // promoted or favorite
        },
        showPromotedGamesOnWidget: {
            enabled: false,
            quantity: 10,
            type: 'promoted', // promoted or favorite
            timeFormat: false   // if false by default will be 'LT' or assign custom format ( 'full' )
        },
        loadPopularGamesForSportsBook: {
            enabled: false
        },
        dateFormat: {
            hour: {
                '12h': 'hh:mm A',
                '24h': 'HH:mm'
            },
            unixDate: 'DD.MM.YY',
            noLocaleTranslate: {
                '12h': 'DD/MM/YYYY hh:mm A',
                '24h': 'DD/MM/YYYY HH:mm'
            },
            noLocaleTime: {
                '12h': 'hh:mm A',
                '24h': 'HH:mm'
            },
            datepicker: 'dd/MM/yyyy',
            historyBalanceFormatDate: 'MM/dd/yyyy',
            newsDataFormat: {
                'tur': 'DD MMMM YYYY',
                'fre': 'DD MMMM YYYY',
                'default': 'MMMM DD YYYY',
                'newsDate': 'LT - ll'
            },
            liveCalendarDataFormat: 'D.MM',
            jpn: {
                'default': 'YYYY年 MMM DD日 HH:mm',
                'unixDate': 'YYYY年 MMM DD日',
                'noLocaleTranslate': {
                    '12h': 'MM月 DD日 LT',
                    '24h': 'MM月 DD日 HH:mm'
                }
            }
        },
        marketStats: {
            'HalfTimeFullTime': "GetHalfTimeFullTimePerformance?matchId=",
            'HalfTimeResult':  "GetStatsForMatch?matchId=",
            'P1XP2': "GetStatsForMatch?matchId=",
            'CorrectScore': "GetStatsForMatch?matchId=",
            'To Qualify': "GetGeneralStatsInfo?matchId=",
            'ToQualify': "GetGeneralStatsInfo?matchId=",
            '1stHalfBothTeamsToScore': 'GetScoredGoalsStatistics?type=3&matchId=',
            '2ndHalfBothTeamsToScore': 'GetScoredGoalsStatistics?type=3&matchId=',
            '1stHalf-2ndHalfBothToScore': 'GetScoredGoalsStatistics?type=3&matchId=',
            'BothTeamsToScore': 'GetScoredGoalsStatistics?type=1&matchId=',
            'Team1ScoreYes/no': 'GetScoredGoalsStatistics?type=2&matchId=',
            'Team2ScoreYes/No': 'GetScoredGoalsStatistics?type=2&matchId=',
            'Team1TotalGoalsExact': 'GetScoredGoalsStatistics?type=3&matchId=',
            'Team2TotalGoalsExact': 'GetScoredGoalsStatistics?type=3&matchId=',
            'Team1TotalGoals': 'GetScoredGoalsStatistics?type=3&matchId=',
            'Team2TotalGoals': 'GetScoredGoalsStatistics?type=3&matchId=',
            'HomeTeamGoals': 'GetScoredGoalsStatistics?type=3&matchId=',
            'AwayTeamGoals': 'GetScoredGoalsStatistics?type=3&matchId=',
            'Team1OverUnder': 'GetScoredGoalsStatistics?type=1&matchId=',
            'Team2OverUnder': 'GetScoredGoalsStatistics?type=1&matchId=',
            'Team1TotalOverUnderAsian': 'GetScoredGoalsStatistics?type=1&matchId=',
            'Team2TotalOverUnderAsian': 'GetScoredGoalsStatistics?type=1&matchId=',
            'SecondHalfHomeTeamTotalGoalsOverUnder': 'GetScoredGoalsStatistics?type=1&matchId=',
            'SecondHalfAwayTeamTotalGoalsOverUnder': 'GetScoredGoalsStatistics?type=1&matchId=',
            'OverUnder': 'GetScoredGoalsStatistics?type=2&matchId=',
            'TotalGoals': 'GetScoredGoalsStatistics?type=2&matchId=',
            'EvenOddTotal': 'GetScoredGoalsStatistics?type=2&matchId=',
            '2ndHalfTotalOver/Under': 'GetScoredGoalsStatistics?type=2&matchId=',
            'HalfTimeOverUnder': 'GetScoredGoalsStatistics?type=2&matchId=',
            'HalfTimeOverUnderAsian': 'GetScoredGoalsStatistics?type=2&matchId=',
            'SecondHalfAwayTeamTotalGoalsInterval': 'GetScoredGoalsStatistics?type=2&matchId=',
            'SecondHalfTotalGoalsExact': 'GetScoredGoalsStatistics?type=2&matchId=',
            'SecondHalfHomeTeamTotalGoalsExact': 'GetScoredGoalsStatistics?type=2&matchId=',
            'SecondHalfAwayTeamTotalGoalsExact': 'GetScoredGoalsStatistics?type=2&matchId=',
            'SecondHalfEvenOddTotal': 'GetScoredGoalsStatistics?type=2&matchId='

    },
        facebookIntegration: {
            enable: false
        },
        odnoklassnikiIntegration: {
            enable: false,
            settings: {
                clientId: '1107409152',
                scopeType: 'VALUABLE_ACCESS',
                responseType: 'token',
                redirectUri: 'http://localhost:63342/vbet5/app/trunk/odnoklassniki.html'
            }
        },
        enableInvites: false,  //enable invite functionality
        paymentsDepositCompletedPopup: false,
        logoutTimeout: 1500,  // timeout to wait for logout command to complete after which logout actions(cleanup, etc) will be performed anyway
        buyVc: {     // enable buying virtual credit from renew tab (key) => VC amount
            enabled: false,
            points: {
                1000: '$9.99',
                5000: '$24.99',
                10000: '$24.99'
            }
        },
        subHeaderItems: [
            {
                alias: "sport",
                displayName: "Event View",
                enabled: true
            },
            {
                alias: "dashboard",
                displayName: "Dashboard",
                enabledConfig: "dashboardEnabled"
            },
            {
                alias: "overview",
                displayName: "Live Overview",
                enabledConfig: "liveOverviewEnabled",
                exceptViews: ["modern", "classic"]
            },
            {
                alias: "multiview",
                displayName: "Live MultiView",
                enabledConfig: 'liveMultiViewEnabled',
                exceptViews: "modern"
            },
            {
                alias: "livecalendar",
                displayName: "Live Calendar",
                enabledConfig: "liveCalendarEnabled"
            },
            {
                alias: "results",
                displayName: "Results",
                enabledConfig: "showResultsTabInSportsbook"
            },
            {
                alias: "statistics",
                displayName: "Statistics",
                enabledConfig: "statisticsInsportsbookTab"
            }
        ],
        dashboard: {
            enabled: false,
            leftMenuPrematch: false,
            showLeftDashboard: true,
            version: 1,
            v2LastMinuteBets: true,
            v2WidgetGamesCount: 2,
            sliders: [false, false, true, false],
            sportsBanners: {
                'default': 'images/featured-games-backgrounds/default.png',
                'Baseball': 'images/featured-games-backgrounds/baseball.png',
                'Basketball': 'images/featured-games-backgrounds/basketball.png',
                'EBasketball': 'images/featured-games-backgrounds/basketball.png',
                'Boxing': 'images/featured-games-backgrounds/boxing.png',
                'Chess': 'images/featured-games-backgrounds/chess.png',
                'Golf': 'images/featured-games-backgrounds/golf.png',
                'Handball': 'images/featured-games-backgrounds/handball.png',
                'Horse-Racing': 'images/featured-games-backgrounds/horseracing.png',
                'HorseRacing': 'images/featured-games-backgrounds/horseracing.png',
                'Ice-Hockey': 'images/featured-games-backgrounds/icehockey.png',
                'IceHockey': 'images/featured-games-backgrounds/icehockey.png',
                'Rugby': 'images/featured-games-backgrounds/rugby.png',
                'Tennis': 'images/featured-games-backgrounds/tennis.png',
                'Volleyball': 'images/featured-games-backgrounds/volleyball.png',
                'Soccer': 'images/featured-games-backgrounds/soccer.png'
            }
        },
        liveCalendarEnabled: false,
        liveOverviewEnabled: false,
        liveMultiViewEnabled: false,
        prematchMultiColumnEnabled: false,
        liveMultiViewItemsAmount: 6,
        liveCalendarInLeftMenu: true,
        enableLiveCalendarPrinting: false,
        enableLiveCalendarUpcomingGamesFilter: false,
        numberOfExpandedMarkets: 'all',
        loadLibsLocally: false, //  load libs (angular, swfobject) locally instead of Google CDN (needed for users in China, where Google is blocked)
        resourcePathPrefix: '', // adds prefix path for resources : app.min.js, app.min.css. etc
        addToFavouritesOnBet: false,

	esportsGames: {'StarCraft': 1, 'StarCraft2': 1, 'Hearthstone': 1, 'CallofDuty': 1, 'Overwatch': 1, 'HeroesOfTheStorm': 1},
	// numberOfExpandedMarkets: 8
    expandAllInBetHistory: false,
    stakeAmountPreventInput: "[^\\d\\.\\,]",
    enableRuntimePopup: true,
    promoCodeFieldName: 'promo_code',
    imageTypes: [
            {id: 1, name: 'Bank Slip'},
            {id: 2, name: 'Document'},
            {id: 3, name: 'Passport'},
            {id: 4, name: 'Driver License'},
            {id: 5, name: 'IBAN'},
            {id: 6, name: 'Social Card ID'},
            {id: 7, name: 'Other'}
        ],

        jackpot: { //jackpotSocket
            socketUrl: "wss://rgs-wss.betconstructapps.com/jackpot",
            sportsbook: {
                enabled: true,
                sourceId: 5,
                intensity: 0 // (Low(5000ms)=0, Medium(3000ms)=1, High=2(1000ms), Intensive(500ms)=3)
            },
            liveCasino: {
                enabled: true,
                sourceId: 2,
                intensity: 0 // (Low(5000ms)=0, Medium(3000ms)=1, High=2(1000ms), Intensive(500ms)=3)
            },
            casino: {
                enabled: true,
                sourceId: 0,
                intensity: 0, // (Low(5000ms)=0, Medium(3000ms)=1, High=2(1000ms), Intensive(500ms)=3)
                externalJackpots :false,
                externalJackpotsDefaultProvider : 'ALL'
            }
        },
    hideGameSoonLabel: false
    },
    iovation: {
        enabled: false
    },
    enableSnowEffect:false,
    betIntelligentAPIUrl: 'https://cms-api-stag.bcapps.org/betting/pushbet',
    partner: {
        // section for partner config
        allowNoUserId: false, // make user id optional
        allowStringUserId: false, //don't convert userId to number
        notifyOnResize: false, //if enabled, will call partner's provided callback function on every resize, passing it the frame size
        enableSigninRegisterCallbacks: false, // log in and register buttons will be shown and when clicked callback function with corresponding parameters will be called
        inactivityCallbackTime: 0 // Time in seconds to send callback command once user is inactive
    },
    customTemplates: false, // skin specific templates , e.g. ["sport/main.html"]
    'env': {
        lang: 'eng',
        authorized: false,
        showSlider: false,
        live: false,
        selectedTimeZone: null, //
        oddFormat: 'decimal', // possible values:  decimal, fractional, american
        sound: 0.75,//'on',
        timeFormat: '24h',
        longTimeFormats: {
            HALF: '12h',
            FULL: '24h'
        },
        preMatchMultiSelection: false,
        liveStatsFlipMode: 0,
        hideLiveStats: false,
        showSportsbookToolTip: false
    },
    'betting': {
        enabled: true,
        bet_source: '42',
        storedBetslipLifetime: 3600000, // in milliseconds
        maxWinLimit: false,
        disableMaxBet: false,
        disableNumpad: true,
        enableSuperBet: false,
        showSuperBetNotificationsViaPopup: false,
        enableHorseRacingBetSlip: true, // SP, new bet types, etc.
        enableNewGreyhoundRacingTemplate: true,
        enableEachWayBetting: false,
        enableBankerBet: false,
        enableShowBetSettings: false,
        allowManualSuperBet: false,
        superBetCheckingIntervalTime: 5000,
        betAcceptedMessageTime: 5000,
        autoSuperBetLimit: {}, // {'GEL': 400, 'AMD': 50000, 'USD': 1000} //if not false then set limit for each currency if stake is greater then Limit superbet is enabling automaticaly
        resetAmountAfterBet: false,
        enableLimitExceededNotifications: true,
        enableBetterOddSelectingFunctyionality: false,
        clearOnLogout: false,
        quickBet: {
            hideQuickBet: false,
            enableQuickBetStakes: false,
            visibleForPaths: ['sport', 'overview'],
            quickBetStakeCoeffs: {'USD': 5, 'AMD': 50, 'EUR': 3},
            quickBetStakeBases: [1, 2, 5, 10],
            quickBetBaseMultipliers: [1, 10, 100]
        },
        disableClearAllInBetProgress: false,
        disableMaxButtonInBetProgress: false,
        sections: {
            enableMyGamesIcon: false,
            enableMyBetsIcon: false,
            enableCashoutButton: false,
            betRulesLink: ''
        },
        defaultPriceChangeSetting: "1",
        fullCoverBetTypes: {
            enabled: false,
            expanded: false
        },
        favoriteStakesMultipliers: [10, 50, 100],
        disableConflictEventReplacement: false
    },
    poker: {
        disableChinesePoker: true,
        balanceTimeout: 30000 // the period of requesting poker balance (in milliseconds),
    },
    backgammon: {
        tournamentScheduleUrl: '//skillgamesadmin.betconstruct.int:6446/request/get_tournaments_schedule'
    },
    belote: {
    },
    blast: {},
    deberc: {
        redirectOnGame: false
    },
    vrlivedealer: {
        "redirectOnGame": false,
        "showDownloadSection": true,
        "showPromotionsInVRCasino": false
    },
    geoIP: {
        callbackUrl: 'https://geoapi.bcapps.org/?type=json',
        callbackUrlCity: 'https://geoapi.bcapps.org/?type=json'
    },
    'swarm': {
        debugging: false, //enable websocket debugging
        languageMapGms: { 'pt-br' : 'por_2', fre: 'fra', chi: 'zho', mac: 'mkd', fas: 'far', dut: 'nld', vnm: 'vie'},
        sendSourceInRequestSession: false,
        sendTerminalIdlInRequestSession: false,
        webSocketTimeout: 5000,
        url: [{ url: "ws://10.32.5.83:8282/", weight: 10}],
        websocket: [{ url: "ws://10.32.5.83:8282/", weight: 10}],
//        url: "https://10.32.5.83:8080/", // bob
//        url: "https://www.vbet.com:8080/", //production
//        websocket: "ws://10.32.5.83:8080/", //bob
//        websocket: "ws://192.168.253.223:8080/", //stable

        useWebSocket: true,
        maxWebsocketRetries: 5,  // maximum number of websocket reconnect attempts after which it will give up
        webSocketRetryInterval: 2000 // retry interval, in milliseconds (will be increased after each unsuccessful retry by itself)
    },
    serverToServerTracking: false,
    xDomainSlaves: '{"https://www.vbet.com:8080" : "/xdomain-proxy.html"}', //has to be JSON string
    "everCookie": {
        "enabled": true,
        "afecUrl": "https://afec.betconstruct.com/topics/client-activity-v2",
        "options": {
            history: false,
            baseurl: 'https://init-ec.betconstruct.com',
            asseturi: "/assets",
            swfFileName: '/ec.swf',
            xapFileName: '/ec.xap',
            jnlpFileName: '/ec.jnlp',
            pngCookieName: 'ec_png',
            pngPath: 'ec_png.php',
            etagCookieName: 'ec_etag',
            etagPath: 'ec_etag.php',
            cacheCookieName: 'ec_cache',
            cachePath: 'ec_cache.php',
            phpuri: "/",
            java: false,
            silverlight: false
        }
    },
    affiliateNetworkKeys: [ //ordered keys
        "Unique-Id",
        "unique-id",
        "uniqueid",
        "clickId",
        "clickid",
        "click-id",
        "Transaction-Id",
        "transaction-id",
        "transactionid",
        "campaign-id",
        "campaignid",
        "campaignId",
        "Hit-Id",
        "hitid",
        "hit-id",
        "A-Id",
        "a-id",
        "aid"
    ],
    pmu: {
        name: "pmu"
    },
    virtualSport: {
        name: "vs"
    },
    euro2020: {
        url: "https://euro2020.betcoapps.com/?integrationMode=1",
        langMap: {
            "fre": "fra"
        }
    }
});
