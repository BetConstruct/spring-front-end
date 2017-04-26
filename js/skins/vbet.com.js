/*
 *   All config values specified here will be merged with main config and will override its values
 *
 */
/* global VBET5 */
VBET5.constant('SkinConfig', {
    loadConfigFromCMS: false, // ignore this config and don't generate/upload it during release, conf.json will be created by CMS
    additionalModules: ['exchange', 'casino', 'comboView'],
    'main': {
        prefetchLeftMenuHoveredLivesGames: {
            enabled: false,
            prefetchAfter: 250
        },
        betterSportsbook: true, // temporary, @TODO: remove after refactoring
        siteTitle: {
            "eng": "Vbet - Sports betting, Poker, Casino, Online Games",
            "jpn": "Vbet - Sports betting, Poker, Casino, Online Games",
            "kor": "Vbet - Sports betting, Poker, Casino, Online Games",
            "chi": "Vbet - Sports betting, Poker, Casino, Online Games",
            "tur": "Vbet - Sports betting, Poker, Casino, Online Games",
            "spa": "Vbet - Sports betting, Poker, Casino, Online Games",
            "por": "Vbet - Sports betting, Poker, Casino, Online Games",
            "geo": "Vbet - Sports betting, Poker, Casino, Online Games",
            "rus": "Букмекерская контора Vbet - Онлайн ставки, покер, казино, онлайн игры",
            "arm": "Vbet բուքմեյքերական ընկերություն - Օնլայն խաղադրույքներ, պոկեր, կազինո, նարդի, օնլայն խաղեր"
        },
        header: {
            version: 2
        },
        selfExclusion: {
            enabled: true
        },
        realityCheck: {
            enabled: true
        },
        site_name: "VBET",
        skin: 'vbet.com',
        geoIPLangSwitch: true,
        resultMenuOrdering: [844, 848, 850, 852, 858],
        showResultsMaxDays: 7,
        enableOlympicGames: false,
        enableDepositLimits: true,
        liveMultiViewEnabled: true,
        htmlMetaTags: '<script src="//cdn.letreach.com/js/main/8f9c087cd9926c903fa9dac01fcbdebf.js"></script>',
        show3LettersLanguageCode: true,
        enableLoyaltyPoints: true,
        appPokeristUrl: '//vbet-app.pokerist.com/index_vbet.php',
        enableMenuSearch: true,
        enableBannerUnderBetslip: true,
        enableLandingPage: false,
        liveCalendarView: 'oneDaySelectionView',
        enableSystemCalculator: true,
        enableAccountVerification: true,
        showNewBelotePage: true,
        visibleItemsInTopMenu: 9, // visible items quantity in Top Menu in small view
        showOfficeView:false,
        exchangeEnabled:false,
        enableResetError: true,
        showNewBackgammonPage: true,
        newPoolBettingPage: false,
        poweredByInFooter: false,  // false - don't show,  true -show with link,  -1 - show without link
        hideGmsMarketBase: false,
        sportNewsLink: 'http://www.vbetnews.com/',
        GmsPlatform:true,
        expandFavoriteCompetitions:true,
        expandFavoriteCompetitionsFirst:true,
        enableSportsbookLayoutSwitcher: true,
        enableBonuses: false,
        promotionalBonuses: {
            enable: true,
            sportsbook: true,
            casino: true
        },
        showCapsLockHint: true,
        dashboard: {
            enabled: true,
            leftMenuPrematch: true
        },
        statisticsOnHover: {
            enabled: true,
            prefixUrl: 'https://krosstats.betconstruct.com/api/en/900/93f428d0-6591-48da-859d-b6c326db2448/Match/GetFullMatchInfo?matchId='
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
                enabled: true
            },
            {
                alias: "overview",
                displayName: "Live Overview",
                enabledConfig: "liveOverviewEnabled",
                exceptViews: "modern, combo, asian, euro2016"
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
                alias: "statistics",
                displayName: "Statistics",
                enabledConfig: "statisticsInsportsbookTab"
            },
            {
                alias: "results",
                displayName: "Results",
                enabledConfig: "showResultsTabInSportsbook"
            }
        ],
        betterHomepage: true,
        homepage: [
            {
                items: [
                    {
                        class: "size-7",
                        templateUrl: "templates/betterHomepage/mainSlider.html"
                    },
                    {
                        class: "size-5",
                        sliderSlug: "homepageRightBanners"
                    }
                ]
            },
            {
                items: [
                    {
                        class: "size-12",
                        templateUrl: "templates/betterHomepage/productsSlider.html"
                    }
                ]
            },
            {
                items: [
                    {
                        class: "size-5 size-m-12 top",
                        height: "360px",
                        templateUrl: "templates/betterHomepage/newsWidget.html"
                    },
                    {
                        class: "size-5",
                        templateUrl: "templates/betterHomepage/lastMinuteBets.html"
                    },
                    {
                        class: "size-2",
                        sliderSlug: "homepageBottomBanners"
                    }
                ]
            }
        ],
        enableLayoutSwitcherInSportsbook: true,
        homePageLastMinuteBets: {
            enable: true,
            timeOptions: [15, 30, 60]
        },
        featuredGamesLimitation: 9,
        results: {
            version: 1
        },
        enableVisibleInPrematchGames: true,
        customSelectedSequenceInAsianSportsbook: "MATCH",
        enableLiveSectionPin: true,
        mobileVersionLink: false,
        liveModule: {
            newWay: false, // load through .php (the old way)
            enabled: true,
            url: "http://livemodule.vbet.com",
            skin: "vbet.com"
        },
        showNewsInClassicView: false,
        sportsLayout: "euro2016",
        availableSportsbookViews: {modern: true, classic: false, asian: true, external: false, euro2016: true},
        asianLoadDays: 0,
        sportsClassicLayout: false,
        showFavoriteCompetitions: true, // show "popular competitions" in classic view
        googleAnalyticsId: 'UA-29242337-7',
        yandexMetricaId: '',
        fantasyEnabled: true,
        defaultTimeFormat: 'DD/MM/YYYY LT',
        ogwilEnabled: true,
        casinoEnabled: true,
        casinoVersion: 2,
        transferEnabled: false,
        liveCalendarEnabled: true,
        liveCalendarInLeftMenu: false,
        betTypes: [
            {name: 'single', value: 1},
            {name: 'express', value: 2},
            {name: 'system', 'value': 3},
            {name: 'chain', 'value': 4}
        ],
        liveOverviewEnabled: true,
        enableLiveCalendarPrinting: true,
        exchangeBetHistoryEnabled: false,
        getPokerLeaderboardDataFromSwarm: true, // in home page
        downloadPDFButtons: true,
        pokerEnabled: true,
        hidePokerLeaderboardAllButton: true,
        gameMenuSpecialText: '',
        enableNewPoker: true,
        rememberMeCheckbox: false,
        enableNewSkillGame: true,
        livedealerEnabled: true,
        financialsEnabled: true,
        countOfRecentBetsToShow: 3,
        //statsHostname: 'http://statistics.betcoapps.com/#/en/external/page/',  // hostname for statistics. when clicking on game statistics icon, popup on this hostname is open,
        statsHostname: {
            prefixUrl: 'https://statistics.vbet.com/#/',
            defaultLang: 'en',
            subUrl: '/external/page/'
        },
        headerStatisticsLink: 'https://statistics.vbet.com',
        enableH2HStat: true,
        jackpotEnabled: false,
        newMenuItems: {virtualSport:true, games:false, liveCasino:false, fantasy: true},
        poolBettingEnabled: false, //enable/disable pool betting
        enableHeaderAnnouncement: false,
        showFavoriteGamesInSportList: true,
        showFinancialsInSportList: 222,   // false to hide,  any number to show (number is used as 'order' field to define it's position among sports)
        freeBetEnabled: true,
        displayEventsMaxBet: true,
        showEachWay: true,
        nonActivityAction: {
            action: 'logout', // 'reload'
            actionDelay: 0, // milliseconds
            nonActivityInterval: 900, // seconds
            checkingInterval: 5000 // seconds
        },
        showVirtualsInSportList: false,
        showOutright: false,//200,
        casinoBalanceDefaultPage: 'deposit',
        enableCasinoBalanceHistory: true, //enable casino balance history in top menu
        enableCasinoBetHistory: false, //enable casino balance history in top menu
        enableMixedView: true,
        enableMiniGameUnderBetslip: true,
        enableBonusCancellation: true, // enable canceling bonus
        enableSubHeader: true,
        virtualBettingEnabledInTopMenu: false,
        virtualSportEnabledInTopMenu: true,
        showResultsTabInSportsbook: true,
        statisticsInsportsbookTab: true,
        classicMarkets2ColSorting: false,
        balanceHistoryDefaultItemsCount: 20,
        balanceHistoryDisabledOperations: [2, 5, 6, 7, 8, 13, 16, 17, 37, 39, 40],
        trackingScripts: [
            {
                event: 'NUV',
                param: 'btag',
                alias: 'poker',
                dialog: {
                    title: 'Our Promotions',
                    content: 'RAKEBACK',
                    type: 'dialog',
                    image: 'images/dialog/version-2.png',
                    buttonText: 'Join Now',
                    buttonBroadcast: 'openRegForm'
                    //buttonURL: 'http://affiliates.vbet.com'
                }
            },
            {
                event: 'NUV',
                param: 'btag',
                alias: 'freebet',
                dialog: {
                    title: 'Our Promotions',
                    content: 'FREE<br />QUIZ',
                    type: 'dialog',
                    image: 'images/dialog/version-1.png',
                    buttonText: 'Join Now',
                    buttonBroadcast: 'openRegForm'
                    //buttonURL: 'http://affiliates.vbet.com'
                }
            },
            {
                event: 'NUV',
                param: 'btag',
                alias: 'jackpot',
                dialog: {
                    title: 'Our Promotions',
                    content: 'JACKPOT',
                    type: 'dialog',
                    image: 'images/dialog/version-3.png',
                    buttonText: 'Join Now',
                    buttonBroadcast: 'openRegForm'
                    //buttonURL: 'http://affiliates.vbet.com'
                }
            },
            {
                event: 'mail_confirmed',
                param: 'click_id',
                paramRequired: true,
                url: 'http://cityads.ru/service/postback/?order_id={user.unique_id}&click_id={click_id}'
            },
            {
                event: 'runtime',
                url: 'https://www.facebook.com/tr?id=1677021112574000&ev=PageView&noscript=1'
            }
        ],
        backGammonEnabledInTopMenu: true,
        beloteEnabledInTopMenu: true,
        showWithdrawRequestsTab: false,
        enableNewCashier: false,
        runtimePopupCount: 2,
        showPopupBeforeRegistration: true,
        headerMessageIcon: {
            enabled: true,
            alwaysShow: true
        },
        ageRestrictionInFooter: 18,
        haveFaq: true,
        openHelpAsPopup: true,
        enablePromotions: true,
        aocEnabled: true, // enable AOC link in main menu
        feedbackButton: {
            enabledLogin: true,
            enabledLogOut: true
        },
        availableVideoProviderIds: [1, 3, 5, 7, 8, 11, 12, 15, 16, 19, 21, 22, 23, 999999],
        aocLink: "#/section/aoc",
        theVeryTopMenu: [{href: "#/promos/", label: "Promotions"}, {href: "#/freebet/", label: "Free Quiz"}, {href: "http://www.vbetnews.com/", label: "VbetNews", target: '_blank'}, {help: 'payments', label: 'Payments'},{href: "https://free.vbet.com", label: 'Free Vbet',target: '_blank'},{href: "http://new.vbet.com/", label: 'New VBet',target: '_blank'}],
        balanceDefaultPage: 'deposit',
        showPromotedGamesOnWidget: {
            enabled: true,
            level: 'competition',  // game or competition
            type: 'promoted', // promoted or favorite
            gameLimit: 30
        },
        showPointsBalance: true,
        passwordNewResetMode: false,
        allowTimeFormatChange: true,
        passwordValidationLength: 8,
        availableLanguages: {
            '@replace': true, // this means that object won't be merged with 'parent object', but will replace it
            'eng': {'short': 'EN', 'full': "English", order: 1},
            'spa': {'short': 'ES', 'full': "Español", order: 2},
            'arm': {'short': 'HY', 'full': "Հայերեն", order: 4},
            'rus': {'short': 'RU', 'full': "Русский", order: 3},
            'por': {'short': 'PT', 'full': "Português", order: 5},
            'pt-br' : { 'short': 'PT-BR', 'full': "Português do Brasil", order: 6},
            'tur': {'short': 'TR', 'full': "Türkçe", order: 7},
            'kor': { 'short': 'KO', 'full': "한국어", order: 8},
            'jpn': { 'short': 'JP', 'full': "日本語", order: 9},
            'chi': { 'short': 'CH', 'full': "繁體中文", order: 10},
            'zhh': {'short': 'ZH', 'full': "简体中文", order: 11},
            'geo': {'short': 'KA', 'full': "ქართული", order: 12},
            'swe': {'short': 'SE', 'full': "Swedish", order: 13},
            'ger' : { 'short': 'DE', 'full': "Deutsch", order: 14},
            'nor': {'short': 'NO', 'full': "Norwegian", order: 15},
            'arb' : { 'short': 'AR', 'full': "العربية", order: 16},
            'fas' : { 'short': 'FA', 'full': "Farsi", order: 17}
        },
        twitterFeed: {
            enabled: false,
            refreshInterval: 300000, //5min
            hashTag: 'live', //only tweets having this hashtag will be shown
            count: 20, //count of tweets to load (before filtering with hashtag)
            user: {
                'arm': 'vivaro_bet',
                'eng': 'vbet_com',
                'spa': 'vbet_com',
                'geo': 'vbet_com',
                'por': 'vbet_com',
                'tur': 'vbet_com',
                'kor': 'vbet_com',
                'jpn': 'vbet_com',
                'chi': 'vbet_com',
                'rus': 'livebettingru'
            }
        },
        remindToRenewBalance: {
            enabled: true,
            page: 'deposit',
            threshold: 0.5,
            interval: 14400000 //4 hours
        },
        redirectOnTablets: 'http://tablet.vbet.com/',
        poolBettingResultsUrlPrefix: 'http://www.vbet.com/results/',
        about_company_text: {
            'eng': "Vbet sportsbook is operated by Vivaro Limited (Company Registration № C45929, Malta, 23.12.2008), having its registered address at Luxe Pavilion, 2nd level, Diamonds International Building, Portomaso, St. Julians STJ 4010, Malta, and is licensed and regulated by the Malta Gaming Authority as the regulatory body responsible (Class 2 Licence № MGA/CL2/1079/2015, granted 23.06.2015). The other products are operated by Radon B.V. (Commercial register of Curacao no.126922) under a sublicense CIL pursuant to Master gaming License №5536/JAZ.<br />Play responsibly. For further information contact <a href='http://responsiblegamblingtrust.org.uk' target='_blank'>http://responsiblegamblingtrust.org.uk</a>",
            'chi': "Vbet體育博彩遊戲由Vivaro有限公司負責運營,Vivaro有限公司根據馬耳他相關法律於2008年12月23日正式註冊成立,公司註冊號 NC45929. 業界領先的博彩公司 Vbet體育博彩遊戲由Vivaro有限公司負責運營,Vivaro有限公司根據馬耳他相關法律於2008年12月23日正式註冊成立,公司註冊號 NC45929.    Vbet體育博彩遊戲由Vivaro有限公司負責運營,Vivaro有限公司根據馬耳他相關法律於2008年12月23日正式註冊成立,公司註冊號NC45929. 公司註冊地址為Luxe Pavilion, 2nd level, Diamonds International Building, Portomaso, St Julian's STJ 4010, Malt,公司由馬耳他博彩委員會發放博彩牌照並受委員會監管.Vbet的體育博彩使用馬耳他博彩委員會於2015年6月23日發放的2類牌照合法運營，牌照號為MGA/CL2/ 1079/2015.Vbet的其他產品由Radon BV公司負責運營,此公司為庫拉索合法註冊的商業公司，註冊號為126922,此公司有根據相關法律附屬於主牌照的子牌照,註冊號為5536 /JAZ. Radon Limited DSLR Notaries (Suite 750), Ftieh St. Birkirkara Bypass, Birkirkara BKR 2940, Malta, 為Radon BV的子公司. Vbet是一個不斷發展擁有超過十年經驗的公司,將給玩家帶來最好的博彩體驗.我們以能為全球各地的玩家提供服務感到十分榮幸. <a href='http://responsiblegamblingtrust.org.uk' target='_blank'>http://responsiblegamblingtrust.org.uk</a>",
            'jpn': "Vbet sportsbook is operated by Vivaro Limited (Company Registration № C45929, Malta, 23.12.2008), having its registered address at Luxe Pavilion, 2nd level, Diamonds International Building, Portomaso, St. Julians STJ 4010, Malta, and is licensed and regulated by the Malta Gaming Authority as the regulatory body responsible (Class 2 Licence № MGA/CL2/1079/2015, granted 23.06.2015). The other products are operated by Radon B.V. (Commercial register of Curacao no.126922) under a sublicense CIL pursuant to Master gaming License №5536/JAZ.<br />Play responsibly. For further information contact <a href='http://responsiblegamblingtrust.org.uk' target='_blank'>http://responsiblegamblingtrust.org.uk</a>",
            'spa': "Vbet sportsbook is operated by Vivaro Limited (Company Registration № C45929, Malta, 23.12.2008), having its registered address at Luxe Pavilion, 2nd level, Diamonds International Building, Portomaso, St. Julians STJ 4010, Malta, and is licensed and regulated by the Malta Gaming Authority as the regulatory body responsible (Class 2 Licence № MGA/CL2/1079/2015, granted 23.06.2015). The other products are operated by Radon B.V. (Commercial register of Curacao no.126922) under a sublicense CIL pursuant to Master gaming License №5536/JAZ.<br />Play responsibly. For further information contact <a href='http://responsiblegamblingtrust.org.uk' target='_blank'>http://responsiblegamblingtrust.org.uk</a>",
            'geo': "Vbet-ის დანარჩენი პროდუქცია მართულია Radon B.V-ით, რომელიც დარეგისტრირებულია კიურასაოს კომერციულ რეგისტრში 126922 ნომრის ქვეშ და ფლობს CIL სუბლიცენზიას Master gaming ლიცენზიის თანხმობით 5536/JAZ ნომრით.<br />ითამაშეთ საპასუხისმგებლად. დამატებითი ინფორმაციისათვის დაგვიკავშირდით  <a href='http://responsiblegamblingtrust.org.uk' target='_blank'>http://responsiblegamblingtrust.org.uk</a>",
            'por': "Vbet sportsbook is operated by Vivaro Limited (Company Registration № C45929, Malta, 23.12.2008), having its registered address at Luxe Pavilion, 2nd level, Diamonds International Building, Portomaso, St. Julians STJ 4010, Malta, and is licensed and regulated by the Malta Gaming Authority as the regulatory body responsible (Class 2 Licence № MGA/CL2/1079/2015, granted 23.06.2015). The other products are operated by Radon B.V. (Commercial register of Curacao no.126922) under a sublicense CIL pursuant to Master gaming License №5536/JAZ.<br />Play responsibly. For further information contact <a href='http://responsiblegamblingtrust.org.uk' target='_blank'>http://responsiblegamblingtrust.org.uk</a>",
            'tur': "Vbet sportsbook is operated by Vivaro Limited (Company Registration № C45929, Malta, 23.12.2008), having its registered address at Luxe Pavilion, 2nd level, Diamonds International Building, Portomaso, St. Julians STJ 4010, Malta, and is licensed and regulated by the Malta Gaming Authority as the regulatory body responsible (Class 2 Licence № MGA/CL2/1079/2015, granted 23.06.2015). The other products are operated by Radon B.V. (Commercial register of Curacao no.126922) under a sublicense CIL pursuant to Master gaming License №5536/JAZ.<br />Play responsibly. For further information contact <a href='http://responsiblegamblingtrust.org.uk' target='_blank'>http://responsiblegamblingtrust.org.uk</a>",
            'kor': "Vbet sportsbook is operated by Vivaro Limited (Company Registration № C45929, Malta, 23.12.2008), having its registered address at Luxe Pavilion, 2nd level, Diamonds International Building, Portomaso, St. Julians STJ 4010, Malta, and is licensed and regulated by the Malta Gaming Authority as the regulatory body responsible (Class 2 Licence № MGA/CL2/1079/2015, granted 23.06.2015). The other products are operated by Radon B.V. (Commercial register of Curacao no.126922) under a sublicense CIL pursuant to Master gaming License №5536/JAZ.<br />Play responsibly. For further information contact <a href='http://responsiblegamblingtrust.org.uk' target='_blank'>http://responsiblegamblingtrust.org.uk</a>",
            'rus': "Vbet sportsbook is operated by Vivaro Limited (Company Registration № C45929, Malta, 23.12.2008), having its registered address at Luxe Pavilion, 2nd level, Diamonds International Building, Portomaso, St. Julians STJ 4010, Malta, and is licensed and regulated by the Malta Gaming Authority as the regulatory body responsible (Class 2 Licence № MGA/CL2/1079/2015, granted 23.06.2015). The other products are operated by Radon B.V. (Commercial register of Curacao no.126922) under a sublicense CIL pursuant to Master gaming License №5536/JAZ.<br />Play responsibly. For further information contact <a href='http://responsiblegamblingtrust.org.uk' target='_blank'>http://responsiblegamblingtrust.org.uk</a>",
            'arm': "Vbet sportsbook is operated by Vivaro Limited (Company Registration № C45929, Malta, 23.12.2008), having its registered address at Luxe Pavilion, 2nd level, Diamonds International Building, Portomaso, St. Julians STJ 4010, Malta, and is licensed and regulated by the Malta Gaming Authority as the regulatory body responsible (Class 2 Licence № MGA/CL2/1079/2015, granted 23.06.2015). The other products are operated by Radon B.V. (Commercial register of Curacao no.126922) under a sublicense CIL pursuant to Master gaming License №5536/JAZ.<br />Play responsibly. For further information contact <a href='http://responsiblegamblingtrust.org.uk' target='_blank'>http://responsiblegamblingtrust.org.uk</a>",
            'swe': "Vbet sportsbook is operated by Vivaro Limited (Company Registration № C45929, Malta, 23.12.2008), having its registered address at Luxe Pavilion, 2nd level, Diamonds International Building, Portomaso, St. Julians STJ 4010, Malta, and is licensed and regulated by the Malta Gaming Authority as the regulatory body responsible (Class 2 Licence № MGA/CL2/1079/2015, granted 23.06.2015). The other products are operated by Radon B.V. (Commercial register of Curacao no.126922) under a sublicense CIL pursuant to Master gaming License №5536/JAZ.<br />Play responsibly. For further information contact <a href='http://responsiblegamblingtrust.org.uk' target='_blank'>http://responsiblegamblingtrust.org.uk</a>",
            'ger': "Vbet sportsbook is operated by Vivaro Limited (Company Registration № C45929, Malta, 23.12.2008), having its registered address at Luxe Pavilion, 2nd level, Diamonds International Building, Portomaso, St. Julians STJ 4010, Malta, and is licensed and regulated by the Malta Gaming Authority as the regulatory body responsible (Class 2 Licence № MGA/CL2/1079/2015, granted 23.06.2015). The other products are operated by Radon B.V. (Commercial register of Curacao no.126922) under a sublicense CIL pursuant to Master gaming License №5536/JAZ.<br />Play responsibly. For further information contact <a href='http://responsiblegamblingtrust.org.uk' target='_blank'>http://responsiblegamblingtrust.org.uk</a>",
            'nor': "Vbet sportsbook is operated by Vivaro Limited (Company Registration № C45929, Malta, 23.12.2008), having its registered address at Luxe Pavilion, 2nd level, Diamonds International Building, Portomaso, St. Julians STJ 4010, Malta, and is licensed and regulated by the Malta Gaming Authority as the regulatory body responsible (Class 2 Licence № MGA/CL2/1079/2015, granted 23.06.2015). The other products are operated by Radon B.V. (Commercial register of Curacao no.126922) under a sublicense CIL pursuant to Master gaming License №5536/JAZ.<br />Play responsibly. For further information contact <a href='http://responsiblegamblingtrust.org.uk' target='_blank'>http://responsiblegamblingtrust.org.uk</a>"
        },
        footer_license_logos: [
            [
                {href: "http://responsiblegamblingtrust.org.uk", img: "images/VBET/gamblelogo2.png", height: "36px"},
                {href: "https://www.authorisation.mga.org.mt/verification.aspx?lang=EN&company=d10daec7-dde7-441a-b9ef-2666667bf4fc&details=1", img: "images/VBET/mga_logo.png", height: "36px"}
            ],
            [
                {img: "images/VBET/iso.png", height: "66px"},
                {img: "images/VBET/gamblelogo1.png", height: "56px"}
            ]
        ],
        oldVersionLink: false,
        multiLevelMenu: {
            "@replace": true,
            "live": null,
            "sport": null,
            "virtual-sports": {
                "order": 5,
                "subMenu": [
                    {
                        "name": "virtual-sports",
                        "displayName": "BetConstruct",
                        "href": "#/virtualsports"
                    },
                    {
                        "displayName": "Golden Race",
                        "href": "#/game/GDRdog6/provider/GDR/exid/400002",
                        "activeLink": "/game/GDRdog6/provider/GDR/exid/400002"
                    },
                    {
                        "displayName": "Edge Gaming",
                        "href": "#/game/EDGcockfight/provider/EDG/exid/155000",
                        "activeLink": "/game/EDGcockfight/provider/EDG/exid/155000"
                    }
                ]
            },
            "games": null,
            "casino": null,
            "livedealer": null,
            "FastGame": null,
            "virtual-betting": null,
            "fantasy": null,
            "exchange": null,
            "financials": {
                "subMenu": [
                    {
                        "displayName": "Version 1",
                        "href": "#/financials"
                    },
                    {
                        "displayName": "Version 2",
                        "href": "#/game/TLCTLC/provider/TLC/exid/14000",
                        "activeLink": "/game/TLCTLC/provider/TLC/exid/14000"
                    }
                ]
            },
            "menuItem2": {
                "title": "Pools Betting",
                "link": "#/game/CSB1/provider/CSB/exid/152000",
                "cssclass": "",
                "dynamicClass": "new-top-nav",
                "activeLink": "/game/CSB1/provider/CSB/exid/152000",
                "order": 20
            }
        },
        additionalLink: {
            eng: {link: 'http://free.vbet.com/#/?lang=eng', text: 'Free Vbet'},
            chi: {link: 'http://free.vbet.com/#/?lang=eng', text: 'Free Vbet'},
            jpn: {link: 'http://free.vbet.com/#/?lang=eng', text: 'Free Vbet'},
            tur: {link: 'http://free.vbet.com/#/?lang=eng', text: 'Free Vbet'},
            kor: {link: 'http://free.vbet.com/#/?lang=eng', text: 'Free Vbet'},
            spa: {link: 'http://free.vbet.com/#/?lang=spa', text: 'Free Vbet'},
            geo: {link: 'http://free.vbet.com/#/?lang=geo', text: 'Free Vbet'},
            por: {link: 'http://free.vbet.com/#/?lang=por', text: 'Free Vbet'},
            rus: {link: 'http://free.vbet.com/#/?lang=rus', text: 'Free Vbet'},
            arm: {link: 'http://free.vbet.com/#/?lang=arm', text: 'Free Vbet'}
        },
        liveChat: {
            isLiveAgent: true,
            liveAgentID: 'b0170f5a'
        },
        site_id: "4",
        registration: {
            restrictedCountriesByIp: ['GB'],
            simplified: true, //not ready yet
            enableRegisterByPhoneNumber: false,
            phoneNumberPattern: "^[0-9 ]{6,12}$",
            defaultCurrency: 'USD',
            disableTermsLink: false,
            type: 'partial', // will replace registration.simplified: WEB-5288
            hideLabels: false,
            mailIsSentAfterRegistration: 'Please check your email.',
            loginRightAfterRegistration: true,
            securityQuestion: {
                enabled: true
            }
        },
        /*loadPopularGamesForSportsBook: {
         enabled: true,
         level: 'competition',  // game or competition
         type: 'promoted' // promoted or favorite
         //testSiteId: 23 // for debug purpose set to false by default
         },*/
        personalDetails: {
            availableCountriesList:['AU', 'AD', 'AE', 'AF', 'AG', 'AL', 'AM', 'AO', 'AR', 'AS', 'AT', 'AW', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BM', 'BN', 'BO', 'BR', 'BS', 'BT', 'BW', 'BY', 'BZ', 'CA', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CY', 'DJ', 'DM', 'DO', 'DZ', 'EC', 'EG', 'ER', 'ET', 'FI', 'FJ', 'FO', 'GA', 'GD', 'GE', 'GH', 'GM', 'GN', 'GQ', 'GR', 'GT', 'GU', 'GW', 'GY', 'HK', 'HN', 'HR', 'HT', 'ID', 'IL', 'IN', 'IQ', 'IR', 'IS', 'IT', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LY', 'MA', 'MC', 'MD', 'ME', 'MG', 'MK', 'ML', 'MM', 'MN', 'MR', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NE', 'NG', 'NI', 'NO', 'NP', 'NR', 'NZ', 'OM', 'PA', 'PE', 'PG', 'PH', 'PK', 'PL', 'PR', 'PS', 'PW', 'PY', 'QA', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SI', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'ST', 'SV', 'SY', 'SZ', 'TD', 'TG', 'TH', 'TJ', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UY', 'UZ', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WS', 'YE', 'ZA', 'ZM', 'ZW'],
            readOnlyFields: ['user_id', 'email','gender', 'birth_date', 'country_code'],
            editableFields: [ 'phone_number', 'doc_number','first_name', 'sur_name','city', 'address'],
            requiredEditableFields: [ 'phone_number', 'doc_number','first_name', 'sur_name','city', 'address'],
            patterns:  {
                docNumber: "^[A-Za-z\\u0400-\\u04FF0-9]*[0-9]+[A-Za-z\\u0400-\\u04FF0-9]*$"
            },
            limits: {
                address: {
                    minlength: 5,
                    maxlength: 100
                }
            }
        },
        availableCurrencies: ['USD', 'EUR', 'RUB', 'UAH', 'CNY','KZT','PLN','SEK','MXN','GEL','TRY'],
        facebookUrl: "https://www.facebook.com/vbetcom",
        googlePlusUrl: "https://plus.google.com/u/1/+Vbetlivebetting/",
        youtubeUrl: "https://www.youtube.com/user/VIVARObetting",
        vkontakteUrl: "https://vk.com/vbet_official",
        instagramUserName: "vbet_official",
        twitterAccount: 'Vbet_com',
        twitterHashTag: 'vbet',
        favoriteTeam: {
            enabled: false,
            sport: {
                'alias': 'Soccer'
            }
        },
        betHistoryBalanceTypes: {
            '-1': 'All',
            '0': 'New Bets',
            '1': 'Winning Bets',
            '2': 'Returned Bet',
            '3': 'Deposit',
            '4': 'Card Deposit',
            '5': 'Bonus',
            '6': 'Bonus Bet',
            '7': 'Commission',
            '8': 'Withdrawal',
            '9': 'Correction Up',
            '302': 'Correction Down',
            '10': 'Deposit by payment system',
            '12': 'Withdrawal request',
            '13': 'Authorized Withdrawal',
            '14': 'Withdrawal denied',
            '15': 'Withdrawal paid',
            '16': 'Pool Bet',
            '17': 'Pool Bet Win',
            '18': 'Pool Bet Return',
            '23': 'In the process of revision',
            '24': 'Removed for recalculation',
            '29': 'Free Bet Bonus received',
            '30': 'Wagering Bonus received',
            '31': 'Transfer from Gaming Wallet',
            '32': 'Transfer to Gaming Wallet',
            '37': 'Declined Superbet',
            '39': 'Bet on hold',
            '40': 'Bet cashout',
            '19': 'Fair',
            '20': 'Fair Win',
            '21': 'Fair Commission'
        },
        recentbetsSharing: [
            {
                provider: 'facebook',
                availableTypes: [1, 2]
            }
        ]
    },
    regConfig: {
        step1: [
            {
                "title": "Name",
                "name": "first_name",
                "type": "text",
                "required": true,
                "placeholder": "First",
                "classes": "",
                "customAttrs": [{"ng-pattern": "/^[^0-9\\[\\]\\\\`~!@#$%^&*()_+={};:<>|./?,\"'-\\s]+$/"}, {"capitaliseinput": ""},{"required": "required"} ],
                "validation": [{"name": "required", "message": "This field is required"}, {"name": "pattern", "message": "Please enter a valid  name: only letters - no space, no digits and/or symbols"}]
            },
            {
                "title": "Last",
                "name": "last_name",
                "placeholder": "Last",
                "type": "text",
                "required": true,
                "classes": "",
                "customAttrs": [{"ng-pattern": "/^[^0-9\\[\\]\\\\`~!@#$%^&*()_+={};:<>|./?,\"'-\\s]+$/"}, {"capitaliseinput": ""},{"required": "required"} ],
                "validation": [{"name": "required", "message": "This field is required"}, {"name": "pattern", "message": "Please enter a valid  last name: only letters - no space, no digits and/or symbols"}]
            },
            {
                "title": "Birth date",
                "name": "birth_day",
                "type": "select",
                "required": true,
                "classes": "",
                "customAttrs": [{"required": "required"}, {"ng-options": "d for d in days"}, {"day-selector": ""}, {"month-model": "registrationData.birth_month"}, {"year-model": "registrationData.birth_year"}, {"options": "days"}, {"ng-change": "calculateAge()"}],
                "validation": [{"name": "required", "message": "This field is required"}]
            }, {
                "title": "",
                "name": "birth_month",
                "type": "select",
                "required": true,
                "classes": "",
                "customAttrs": [{"required": "required"}, {"ng-change": "calculateAge()"}],
                "optionsData": "<option ng-repeat=\"month in monthNames\" value=\"{{month.val}}\">{{month.name| translate}}</option>",
                "validation": [{"name": "required", "message": "This field is required"}]
            }, {
                "title": "",
                "name": "birth_year",
                "type": "select",
                "required": true,
                "classes": "",
                "customAttrs": [{"required": "required"}, {"ng-options": "y for y in registrationData.years track by y"}, {"ng-change": "calculateAge()"}],
                "onChange": ["calculateAge"],
                "validation": [{"name": "required", "message": "This field is required"}],
                "customValidation": "<div  ng-class=\"{error: userAge < 18}\"> <div class=\"tooltip-j\"> <p trans ng-show=\"userAge < 18 \">Registration on this site is not permitted for people under 18.</p></div>"
            },
            {
                "title": "Country",
                "name": "country_id",
                "type": "select",
                "required": true,
                "classes": "",
                "customAttrs": [{"ng-options":"item as item.name for item in countryCodes track by item.key"}, {"ng-init": "preFillRegionalData()"}, {"ng-change": "checkIfCountryIsRestricted();"}, {"required": "required"}],
                "validation": [{"name": "required", "message": "This field is required"}],
                "customValidation": "<div  ng-class=\"{error: countryIsRestricted}\"> <div class=\"tooltip-j\"> <p trans ng-show=\"countryIsRestricted\">Registration on this site is not permitted in selected country.</p><p ng-show=\"altUrl4RestrictedCountry\"><span trans>You can register here:</span> <a href=\"{{altUrl4RestrictedCountry}}\">{{altUrl4RestrictedCountry}}</a></p></div>"
            },
            {
                "title": "Email Address",
                "name": "email",
                "type": "email",
                "placeholder": "Enter your email address",
                "required": true,
                "classes": "",
                "customAttrs": [{"required": "required"}, {"ng-pattern": "/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+([\.])[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/"}, {"prevent-input": "/^[\\S ]+$/"}],
                "validation": [{"name": "required", "message": "This field is required"},
                    {"name": "email", "message": 'This is not a valid email address'},
                    {"name": "pattern", "message": 'Please enter a valid email address'},
                    {"name": "exists", "message": "This email already exists in our database, please enter another"}
                ]
            },
            {
                "title": "Gender",
                "name": "gender",
                "type": "select",
                "required": true,
                "classes": "",
                "customAttrs": [{"ng-pattern": "/^[M,F]$/"}, {"ng-change": "calculateAge()"}],
                "optionsData": "<option ng-repeat=\"gender in genders\" value=\"{{gender.val}}\">{{gender.name| translate}}</option>",
                "validation": []
            }, {
                "title": "Password",
                "name": "password",
                "placeholder": "Password should contain at least 8 characters",
                "type": "password",
                "required": true,
                "classes": "",
                "customAttrs": [{"ng-minlength": "8"}, {"type": "password"}, {"required": "required"}, {"ng-pattern": "/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d\\[\\]\\\\`~!@#$%^&*()_+={};:<>|./?,\"'-]+$/"}, {"ng-keypress": "passwordKeyPress($event, 'password')"}],
                "validation": [{"name": "required", "message": "This field is required"}, {
                    "name": "minlength",
                    "message": "Password should contain at least 8 characters"
                }, {"name": "sameAsLogin", "message": "Password cannot be same as login"}, {
                    "name": "tooShort",
                    "message": "Password is too short"
                }, {
                    "name": "pattern",
                    "message": "Password should contain upper and lower-case English letters, at least one digit and no spaces."
                }]
            },

            {
                "title": "Confirm Password",
                "name": "password2",
                "type": "password",
                "placeholder": "Confirm Password",
                "required": true,
                "classes": "",
                "customAttrs": [{"match": "registrationData.password"}, {"required": "required"}, {"ng-disabled": "registerform.password.$invalid"}, {"ng-keypress": "passwordKeyPress($event, 'password2')"}],
                "validation": [{"name": "required", "message": "This field is required"}, {
                    "name": "match",
                    "message": "Passwords don't match"
                }]
            },{
                "title": "Address",
                "name": "address",
                "type": "text",
                "placeholder": "Enter here",
                "required": true,
                "classes": "",
                "customAttrs": [{"required": "required"}],
                "validation": [{"name": "required", "message": "This field is required"}]
            },
            {
                "title": "Currency",
                "hoverBlock":"Attention: Once you choose your currency, you will not be able to change it later in your profile.",
                "name": "currency_name",
                "type": "select",
                "required": true,
                "classes": "",
                "customAttrs": [{"ng-options": "c for c in  conf.availableCurrencies track by c"}, {"ng-value": "c"}, {"ng-disabled": "currencyDisabled"}],
                "validation": []
            },
            {
                "title": "Promo code",
                "name": "promo_code",
                "type": "text",
                "required": false,
                "placeholder": "Enter here",
                "classes": "",
                "customAttrs": [{"ng-disabled": "hasPromoCode"}],
                "validation": []
            },
            {
                "title": "Please enter the text shown on image",
                "name": "captcha_text",
                "type": "captcha",
                "placeholder": "",
                "required": true,
                "classes": "",
                "customAttrs": [{"required": "required"}],
                "validation": [{"name": "required", "message": "This field is required"}, {"name": "notmatching", "message": "Text you've entered doesn't match text on image."}]
            }
        ]
    },
    'env': {
        live: true,
        lang: 'eng',
        showFifaCountdown: false,
        preMatchMultiSelection: false,
        showSportsbookToolTip: true
    },
    'betting': {
        enableExpressBonus: true,
        expressBonusVisibilityQty: 2,
        expressBonusType: 20, //1: regular bonus 2,3,4,5..% ; 2: 2-5,10,15,20,25,30,30..30 %;: regular bonus 2,3,4,5..% ; 2: 2-5,10,15,20,25,30,30..30 %;
        enableEachWayBetting: true,
        enableHorseRacingBetSlip: true, // SP, new bet types, etc.
        enableSuperBet: true,
        expressBonusMinOdd: 1.3,
        defaultPriceChangeSetting: 1,
        allowManualSuperBet: true,
        quickBet: {
            enableQuickBetStakes: true,
            quickBetStakeCoeffs: {'USD': 5, 'AMD': 50, 'EUR': 3},
            quickBetStakeBases: [1, 2, 5, 10],
            quickBetBaseMultipliers: [1, 10, 100]
        },
        blockSingleGameBets: true,
        disableClearAllInBetProgress: true,
        disableMaxButtonInBetProgress: true,
        showSuperBetNotificationsViaPopup: true,
        enableRetainSelectionAfterPlacment: true
    },
    'swarm': {
        url: [{ url: "https://swarm-spring-cloud.betconstruct.com"}],
        websocket: [{ url: "wss://swarm-spring-cloud.betconstruct.com"}]
        /* url: [{ url: "http://192.168.250.189:8095"}],
         websocket: [{ url: "ws://192.168.250.189:8095"}]*/
    },
    poker: {
        rakeRaceEnabled: true,
        tournamentListEnabled: true,
        hideDownloadLinkSectionInPokerPage: true,
        instantPlayAvailable: false,
        instantPlayLink: '',
        instantPlayTarget: '',
        downloadLink: {
            '@replace': true,
            windows: 'https://casino.vbet.com/nardi/VbetSkillGames-2.2.2-Setup.exe',
            windowsXp: 'https://casino.vbet.com/nardi/VbetSkillGames-2.2.2-XP-Setup.exe',
            mac: 'http://vbet-poker.betconstruct.com/downloadFile.php?do=mac',
            android: 'javascript:alert("Coming soon")'
        }
    },
    chinesePoker: {
        hideDownloadLinkSection: false,
        instantPlayAvailable: false,
        downloadLink: {
            '@replace': true,
            windows: 'http://casino.vbet.com/nardi/VGames-1.1.11-Setup.exe',
            mac: 'http://casino.vbet.com/nardi/VGames-1.1.3.dmg'
        }
    },
    belote: {
        instantPlayTarget: '',
        redirectOnGame: true
        //instantPlayTarget: '_self',
        //redirectOnInstantPlay: true,
        //instantPlayLink: "http://www.vbet.com/#/games/?game=599&type=real"
    },
    backgammon: {
        instantPlayTarget: '',
        downloadLink: {
            windows: 'http://casino.vbet.com/nardi/VGammon-1.1.27-Setup.exe'
        }
    },
    'payments': [
        {
            name: 'skrill1tap',
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 24, minDeposit: 5, maxDeposit: 1000, minWithdraw: 1, maxWithdraw: null},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 24, minDeposit: 5, maxDeposit: 1000, minWithdraw: 1, maxWithdraw: null},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 24, minDeposit: 0.1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 24, minDeposit: 0.1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null}
            },
            displayName: 'Skrill 1 Tap',
            canDeposit: false,
            canWithdraw: false,
            order: 2,
            depositInfoTextKey: 'deposit_info_skrill_1tap', // translate##deposit_info_skrill_1tap##
            stayInSameTabOnDeposit: true, //will submit external "confirm" form in same tab
            depositFormFields: [
            ],
            predefinedFields: {
                '1tap' : true
            }
        },
        {
            name: 'skrill',
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 24, minDeposit: 5, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 24, minDeposit: 5, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "PLN" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 24, minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "SEK" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 24, minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null}
            },
            displayName: 'Skrill',
            canDeposit: true,
            canWithdraw: true,
            order: 1,
            // translate##deposit_info_skrill##   <--- these are special comments that tell translation
            // generation script that key inside hashes has to be included in translation table
            depositInfoTextKey: 'deposit_info_skrill',
            withdrawInfoTextKey: 'withdraw_info_skrill', // translate##withdraw_info_skrill##
            //stayInSameTabOnDeposit: true, //will submit external "confirm" form in same tab
            //these external form field values will be set to current URL in app,
            // so when user makes or cancels payment, he'll return to our page
            depositFormFields: [
                {name: 'email', type: 'email', label: 'Email'}  // translate##Email##
            ],
            withdrawFormFields: [
                {name: 'email', type: 'email', label: 'Email', required: true},  // translate##Email##
                {name: 'name', type: 'text', label: 'Name'} // translate##Name##
            ]
        },
        {
            name: 'webmoney',
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 72, minDeposit: null, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 72, minDeposit: null, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 72, minDeposit: 0.1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null}
            },
            displayName: 'WebMoney',
            canDeposit: true,
            canWithdraw: true,
            order: 3,
            depositInfoTextKey: 'deposit_info_webmoney',     // translate##deposit_info_webmoney##
            withdrawInfoTextKey: 'withdraw_info_webmoney',     // translate##withdraw_info_webmoney##
            withdrawFormFields: [
                {name: 'name', type: 'text', label: 'Name'}, // translate##Name##
                {name: 'purse', type: 'text', label: 'Purse'} // translate##Purse##
            ]
        },
        {
            name: 'qiwi',
            info: {
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 24,  minDeposit: 5, maxDeposit: null, minWithdraw: 10, maxWithdraw: 14500}
            },
            displayName: 'Qiwi',
            canDeposit: true,
            canWithdraw: true,
            order: 4,
            depositInfoTextKey: 'deposit_info_qiwi', // translate##deposit_info_qiwi##
            withdrawInfoTextKey: 'withdraw_info_qiwi', // translate##withdraw_info_qiwi##
            depositFormFields: [{name: 'wallet_id', type: 'text', label: 'Wallet id'}],// translate##Wallet id##
            withdrawFormFields: [{name: 'wallet_id', type: 'text', label: 'Wallet id'}] // translate##Wallet id##
        },
        {
            name: 'netellernew',
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 24,  minDeposit: 15, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 24,  minDeposit: 12, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "PLN" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 24,  minDeposit: 62, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
            },
            displayName: 'Neteller',
            canDeposit: true,
            canWithdraw: true,
            order: 5,
            depositInfoTextKey: 'deposit_info_neteller', // translate##deposit_info_neteller##
            withdrawInfoTextKey: 'withdraw_info_neteller', // translate##withdraw_info_neteller##
            depositFormFields: [
                {name: 'email', type: 'text', label: 'Email/Account Id '}, // translate##Account Id##
                {name: 'secure_id', type: 'text', label: 'Secure Id/Authentication code'}   // translate##Secure Id##
            ],
            withdrawFormFields: [
                {name: 'email', type: 'text', label: 'Email'} // translate##Account Id##
            ]
        },
        {
            name: 'moneta',
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null}
            },
            displayName: 'Moneta.ru',
            canDeposit: true,
            canWithdraw: true,
            order: 7,
            depositInfoTextKey: 'deposit_info_moneta', // translate##deposit_info_moneta##
            withdrawInfoTextKey: 'withdraw_info_moneta', // translate##withdraw_info_moneta##
            depositFormFields: [],
            withdrawFormFields: [
                {name: 'email', type: 'text', label: 'Email'}, // translate##Email##
                {name: 'name', type: 'text', label: 'Name'}, // translate##Name##
                {name: 'id', type: 'text', label: 'Wallet id'} // translate##Wallet id##
            ]
        },
        {
            name: 'ecocard',
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 24,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 24,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 24,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null}
            },
            displayName: 'EcoCard',
            canDeposit: true,
            canWithdraw: true,
            order: 21,
            depositInfoTextKey: 'deposit_info_ecocard', // translate##deposit_info_ecocard##
            withdrawInfoTextKey: 'withdraw_info_ecocard', // translate##withdraw_info_ecocard##
            depositFormFields: [],
            withdrawFormFields: [
                {name: 'account', type: 'text', label: 'Account Id'} // translate##Account Id##
            ]
        },
        {
            name: 'centili',
            info: {
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 0.1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null}
            },
            displayName: 'Beeline',
            canDeposit: true,
            canWithdraw: false,
            order: 8,
            depositInfoTextKey: 'deposit_info_centili' // translate##deposit_info_cash##
        },
        {
            name: 'wirecard',
            displayName: "WireCard",
            canDeposit: true,
            canWithdraw: false,
            order: 9,
            depositInfoTextKey: 'deposit_info_wirecard',
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 5, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 5, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 100, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 100, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "PLN" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null}
            }
        },
        {
            name: 'wirecardnew',
            displayName: "WireCard",
            canDeposit: false,
            canWithdraw: true,
            order: 1,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 5, maxDeposit: null, minWithdraw: 10, maxWithdraw: 10000},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 5, maxDeposit: null, minWithdraw: 10, maxWithdraw: 10000},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 100, maxDeposit: null, minWithdraw: 50, maxWithdraw: 15000},
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 100, maxDeposit: null, minWithdraw: 50, maxWithdraw: 10000},
                "PLN" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: 10000}
            },
            withdrawInfoTextKey: 'withdraw_info_wirecardnew',
            withdrawFormFields: [
                {name: 'CreditCardNumber', type: 'text', label: 'Credit Card Number', required: true},  // translate##Credit Card Number##
                {name: 'ExpirationYear', type: 'text', label: 'Expiration Year', required: true},  // translate##Expiration Year##
                {name: 'ExpirationMonth', type: 'text', label: 'Expiration Month', required: true},  // translate##Expiration Month##
                {name: 'CardHolderName', type: 'text', label: 'Card Holder Name', required: true}  // translate##Card Holder Name##
            ]
        },
        {
            name: 'yandex',
            displayName: "Yandex Money",
            canDeposit: true,
            canWithdraw: true,
            order: 10,
            depositInfoTextKey: 'deposit_info_yandex',
            withdrawInfoTextKey: 'withdraw_info_yandex',
            withdrawFormFields: [
                {name: 'account', type: 'text', label: 'Account Id', required: true}
            ],
            //onlyInfoTextOnWithdraw: true, // this means that we won't show any form or button on deposit  page, including amount selection, only text
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 5, maxDeposit: 5000, minWithdraw: null, maxWithdraw: null},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 5, maxDeposit: 5000, minWithdraw: null, maxWithdraw: null},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 10, maxDeposit: 50000, minWithdraw: 1, maxWithdraw: 15000},
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 10, maxDeposit: 50000, minWithdraw: null, maxWithdraw: null}
            }
        },
        {
            name: 'yandexinvois',
            displayName: "Yandex Invoice",
            canDeposit: true,
            canWithdraw: false,
            order: 11,
            depositInfoTextKey: 'deposit_info_yandex',
            withdrawInfoTextKey: 'withdraw_info_yandex',
            onlyInfoTextOnWithdraw: true, // this means that we won't show any form or button on deposit  page, including amount selection, only text
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 5, maxDeposit: 5000, minWithdraw: null, maxWithdraw: null},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 5, maxDeposit: 5000, minWithdraw: null, maxWithdraw: null},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 10, maxDeposit: 50000, minWithdraw: null, maxWithdraw: null},
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 10, maxDeposit: 50000, minWithdraw: null, maxWithdraw: null}
            }
        },
        {
            name: 'yandexbank',
            displayName: "Yandex Bank",
            canDeposit: true,
            canWithdraw: false,
            order: 12,
            depositInfoTextKey: 'deposit_info_yandex',
            withdrawInfoTextKey: 'withdraw_info_yandex',
            onlyInfoTextOnWithdraw: true, // this means that we won't show any form or button on deposit  page, including amount selection, only text
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 5, maxDeposit: 5000, minWithdraw: null, maxWithdraw: null},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 5, maxDeposit: 5000, minWithdraw: null, maxWithdraw: null},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 10, maxDeposit: 50000, minWithdraw: null, maxWithdraw: null},
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 10, maxDeposit: 50000, minWithdraw: null, maxWithdraw: null}
            }
        },
        {
            name: 'yandexcash',
            displayName: "Yandex Cash",
            canDeposit: true,
            canWithdraw: false,
            order: 13,
            depositInfoTextKey: 'deposit_info_yandex',
            withdrawInfoTextKey: 'withdraw_info_yandex',
            onlyInfoTextOnWithdraw: true, // this means that we won't show any form or button on deposit  page, including amount selection, only text
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 5, maxDeposit: 5000, minWithdraw: null, maxWithdraw: null},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 5, maxDeposit: 5000, minWithdraw: null, maxWithdraw: null},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 10, maxDeposit: 50000, minWithdraw: null, maxWithdraw: null},
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 10, maxDeposit: 50000, minWithdraw: null, maxWithdraw: null}
            }
        },
        {
            name: 'yandexprbank',
            displayName: "Yandex Promsvyazbank ",
            canDeposit: true,
            canWithdraw: false,
            order: 14,
            depositInfoTextKey: 'deposit_info_yandex',
            withdrawInfoTextKey: 'withdraw_info_yandex',
            onlyInfoTextOnWithdraw: true, // this means that we won't show any form or button on deposit  page, including amount selection, only text
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 5, maxDeposit: 5000, minWithdraw: null, maxWithdraw: null},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 5, maxDeposit: 5000, minWithdraw: null, maxWithdraw: null},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 10, maxDeposit: 50000, minWithdraw: null, maxWithdraw: null},
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 10, maxDeposit: 50000, minWithdraw: null, maxWithdraw: null}
            }
        },
        {
            name: 'card',
            canDeposit: false,
            canWithdraw: false,
            displayName: "Card",
            order: 12,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: null, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: null, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: null, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: null, maxDeposit: null, minWithdraw: 1, maxWithdraw: null}
            },
            depositInfoText : {
                'arm': "Մուտքագրի՛ր ծածկագիրը և ստացի՛ր բոնուս",
                'rus': "Введите код и получите Ваш бонус",
                'eng': "Enter the code and get Your bonus",
                'tur': "Enter the code and get Your bonus",
                'kor': "Enter the code and get Your bonus",
                'spa': "Ingrese el código y obtine la bono",
                'por': "Ingrese el código y obtine la bono"
            },
            depositFormFields: [
                {name: 'pin_code', type: 'text', label: 'PinCode', required: true} // translate##PinCode##
            ],
            depositPrefilledAmount: 1 //amount field won't be shown, instead will send this number
        },
        {
            name: 'astropay',
            canDeposit: true,
            canWithdraw: true,
            displayName: "AstroPay",
            order: 13,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 0.1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 0.1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 0.1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null}
            },
            depositFormFields: [
                {name: 'x_card_num', type: 'text', maxlength: 16, label: 'Card Number'},  // translate##Card Number##
                {name: 'x_card_code', type: 'text', maxlength: 4, label: 'Card code'},  // translate##Card code##
                {name: 'x_exp_date_mm', type: 'text', maxlength: 2, label: 'Expiry date (mm)'},  // translate##Expiry date (mm)##
                {name: 'x_exp_date_yy', type: 'text', maxlength: 4, label: 'Expiry date (yyyy)'}  // translate##Expiry date (yyyy)##
            ],
            depositInfoText: {
                'eng': 'AstroPay Card - our anonymous, virtual prepaid card and e-wallet, for customers who dont want to expose their personal information when making online transactions. Register for free, choose the value of the card you want to purchase and pay in local currency using the most popular payment methods in your country.It is an immediate solution. Simply purchase your card, make your payment and receive an e-mail with your AstroPay Card details ready for use.',
                'rus': 'AstroPay Card - наша анонимная, предоплаченная виртуальная карточка и электронный кошелек для пользователей, которые не хотят вскрывать свои личные данные при онлайн транзакциях.  Регистрируйтесь бесплатно, выбирайте величину карточки, которую хотите купить и платите местной валютой самыми популярными платежными методами в Вашей стране. Это быстрое решение. Просто купите карточку, осуществите платеж и получайте электронное письмо с готовыми к использованию данными Вашей карточки AstroPay.',
                'arm': 'AstroPay Card-ը մեր անանուն վիրտուալ նախօրոք վճարված քարտն ու էլեկտրոնային դրամապանակն է այն հաճախորդների համար, որոնք չեն ցանկանում բացահայտել իրենց ինքնությունը առցանց գործարքներ կատարելիս: Գրանցվեք անվճար, ընտրեք քարտի արժեքը և վճարեք տեղական տարադրամով Ձեր երկրում ամենատարածված վճարային տարբերակներով:  Քարտը գործում է անմիջապես: Պարզապես գնեք այն և կատարեք վճարումը, որպեսզի ստանաք AstroPay քարտի տվյալներով էլեկտրոնային նամակը:'
            },
            withdrawInfoText: {
                'eng': 'AstroPay Card - our anonymous, virtual prepaid card and e-wallet, for customers who dont want to expose their personal information when making online transactions. Register for free, choose the value of the card you want to purchase and pay in local currency using the most popular payment methods in your country.It is an immediate solution. Simply purchase your card, make your payment and receive an e-mail with your AstroPay Card details ready for use.',
                'rus': 'AstroPay Card - наша анонимная, предоплаченная виртуальная карточка и электронный кошелек для пользователей, которые не хотят вскрывать свои личные данные при онлайн транзакциях.  Регистрируйтесь бесплатно, выбирайте величину карточки, которую хотите купить и платите местной валютой самыми популярными платежными методами в Вашей стране. Это быстрое решение. Просто купите карточку, осуществите платеж и получайте электронное письмо с готовыми к использованию данными Вашей карточки AstroPay.',
                'arm': 'AstroPay Card-ը մեր անանուն վիրտուալ նախօրոք վճարված քարտն ու էլեկտրոնային դրամապանակն է այն հաճախորդների համար, որոնք չեն ցանկանում բացահայտել իրենց ինքնությունը առցանց գործարքներ կատարելիս: Գրանցվեք անվճար, ընտրեք քարտի արժեքը և վճարեք տեղական տարադրամով Ձեր երկրում ամենատարածված վճարային տարբերակներով:  Քարտը գործում է անմիջապես: Պարզապես գնեք այն և կատարեք վճարումը, որպեսզի ստանաք AstroPay քարտի տվյալներով էլեկտրոնային նամակը:'
            },
            //withdrawInfoTextKey: 'withdraw_info_astropay', // translate##withdraw_info_astropay##
            withdrawFormFields: [
                {name: 'x_name', type: 'text', label: 'Full Name'},
                {name: 'email', type: 'text', label: 'Email'},
                {name: 'x_document', type: 'text', label: 'Document Number'}
            ]
        },
        {
            name: 'DengiOnline_LiqPay',
            canDeposit: false,
            canWithdraw: false,
            order: 14,
            depositInfoText:  {
                eng : "",
                rus : "Liqpay - это электронная платежная система, которая представляет собой универсальный платежный инструмент для расчетов за товары и услуги в интернет-магазинах. Это платежная система, которая позволяет легко и быстро отправлять деньги с пластиковых карт VISA или MasterCard на виртуальный счет в системе «LiqPAY». Виртуальный счет в системе «LiqPAY» - это номер мобильного телефона в международном формате. Вывод денег с виртуального счета в системе «LiqPAY» возможен только на пластиковые карты VISA."
            }
        },
        {
            name: 'DengiOnline_EasyPay',
            canDeposit: false,
            canWithdraw: false,
            order: 15,
            depositInfoText:  {
                eng : "",
                rus : "Как оплачивать услуги за EasyPay: 1. Пользователь на сайте выбирает оплата при помощи EasyPay. 2. Заполняет предлагаемый счет. 3. Входит в свой электронный кошелек EasyPay и оплачивает счет в разделе 'Оплата'.<br />Минимальная сумма пополнения: 50 RUR"
            }
        },
        {
            name: 'unionpay',
            canDeposit: false,
            canWithdraw: false,
            displayName: "UnionPay",
            order: 16,
            info: {
                "CNY" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 0.1, maxDeposit: null, minWithdraw: null, maxWithdraw: null}
            },
            depositFormFields: [
                {name: 'bank_id', type: 'select', label: 'Bank Name', options: [{value: "1", text: "ICBC 中國工商銀行"}, {value: "2", text: "ABC China中國農業銀行"}, {value: "3", text: "Bank Of China中國銀行"}, {value: "4", text: "China Construction Bank 中國建設銀行"}, {value: "5", text: "Bank of Communications交通銀行"}, {value: "6", text: "China Everbright Bank中國光大銀行"}, {value: "7", text: "SPD Bank上海浦東發展銀行"}, {value: "8", text: "Bank of Beijing 北京銀行"}, {value: "9", text: "CGB china廣東發展銀行"}, {value: "10", text: "Ping An bank平安銀行"},
                    {value: "11", text: "Industrial Bank 興業銀行"}, {value: "12", text: "CMB China招商銀行"}, {value: "13", text: "Shenzhen Development Bank 深圳發展銀行"}, {value: "14", text: "POSTAL SAVINGS BANK OF CHINA中國郵政儲蓄銀行"}, {value: "15", text: "HUAXIA BANK華夏銀行"}, {value: "16", text: "China Minsheng Banking民生銀行"}]}  // translate##Email##
            ]
        },
        {
            name: 'pugglepay',
            canDeposit: true,
            canWithdraw: false,
            displayName: "PugglePay",
            countryAllow: ['SZ', 'FI'],
            order: 17,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositFormFields: [
                {name: 'email', type: 'text', label: 'Email Address'},
                {name: 'mobile_phone', type: 'text', label: 'mobile_phone'}
            ],
            depositInfoText: {
            }
        },
        {
            name: 'dotpay',
            canDeposit: true,
            canWithdraw: false,
            displayName: "Dotpay",
            depositInfoTextKey: 'deposit_info_dotpay',
            withdrawInfoTextKey: 'withdraw_info_dotpay',
            order: 18,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null},
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            }
        },
        {
            name: 'safecharge',
            displayName: "Safe Charge",
            canDeposit: true,
            canWithdraw: false,
            order: 6,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null},
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null},
                "CNY" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null},
                "KZT" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null},
                "PLN" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null},
                "SEK" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositFormFields: [
            ]
        },
        {
            name: 'otopay',
            canDeposit: true,
            canWithdraw: false,
            order: 19,
            info: {
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositInfoText: {
                eng: "",
                tur: ""
            },
            depositFormFields: [
                {name: 'card_number', type: 'text', label: 'Card Number'},
                {name: 'cvv', type: 'text', label: 'CVV'}
            ]
        },
        {
            name: 'toditocash',
            canDeposit: true,
            canWithdraw: false,
            displayName: "ToditoPagos",
            depositInfoText: {
                eng: "Todito Cash is a popular, safe and easy way to top up your Vbet account. Todito Cash is a payment method using an online rechargeable account. You can also buy reloadable Todito Cash pre-paid cards at several retail stores like 7-Eleven. Your Todito account can be funded at these convenience stores and then used to fund your Vbet player account. Easy, secure and no bank details needed!"
            },
            order: 20,
            info: {
                "MXN" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: null, maxDeposit: null, minWithdraw: null, maxWithdraw: null}
            },
            depositFormFields: [
                {name: 'numTarjeta', type: 'text', label: 'Card Number'},
                {name: 'nip', type: 'text', label: 'NIP'}
            ]
        },
        {
            name: 'astropaystreamline1',
            displayName: "Itau",
            countryAllow: ['BR'],
            canDeposit: true,
            canWithdraw: false,
            order: 23,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositInfoText:  {},
            withdrawInfoText:  {},
            depositFormFields: [
                {name: 'cpf', type: 'text', label: 'CPF'}
            ],
            withdrawFormFields:[]
        },
        {
            name: 'astropaystreamline2',
            displayName: "Banco do Brasil",
            countryAllow: ['BR'],
            canDeposit: true,
            canWithdraw: false,
            order: 24,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositInfoText:  {},
            withdrawInfoText:  {},
            depositFormFields: [
                {name: 'cpf', type: 'text', label: 'CPF'}
            ],
            withdrawFormFields:[]
        },
        {
            name: 'astropaystreamline3',
            displayName: "Bradesco",
            countryAllow: ['BR'],
            canDeposit: true,
            canWithdraw: false,
            order: 25,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositInfoText:  {},
            withdrawInfoText:  {},
            depositFormFields: [
                {name: 'cpf', type: 'text', label: 'CPF'}
            ],
            withdrawFormFields:[]
        },
        {
            name: 'astropaystreamline4',
            displayName: "HSBC",
            countryAllow: ['BR'],
            canDeposit: true,
            canWithdraw: false,
            order: 26,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositInfoText:  {},
            withdrawInfoText:  {},
            depositFormFields: [
                {name: 'cpf', type: 'text', label: 'CPF'}
            ],
            withdrawFormFields:[]
        },
        {
            name: 'astropaystreamline5',
            displayName: "Caixa",
            countryAllow: ['BR'],
            canDeposit: true,
            canWithdraw: false,
            order: 27,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositInfoText:  {},
            withdrawInfoText:  {},
            depositFormFields: [
                {name: 'cpf', type: 'text', label: 'CPF'}
            ],
            withdrawFormFields:[]
        },
        {
            name: 'astropaystreamline6',
            displayName: "Santander",
            countryAllow: ['BR'],
            canDeposit: true,
            canWithdraw: false,
            order: 28,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositInfoText:  {},
            withdrawInfoText:  {},
            depositFormFields: [
                {name: 'cpf', type: 'text', label: 'CPF'}
            ],
            withdrawFormFields:[]
        },
        {
            name: 'astropaystreamline7',
            displayName: "Boleto",
            countryAllow: ['BR'],
            canDeposit: true,
            canWithdraw: false,
            order: 29,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositInfoText:  {},
            withdrawInfoText:  {},
            depositFormFields: [
                {name: 'cpf', type: 'text', label: 'CPF'}
            ],
            withdrawFormFields:[]
        },
        {
            name: 'astropaystreamline8',
            displayName: "Aura",
            countryAllow: ['BR'],
            canDeposit: true,
            canWithdraw: false,
            order: 30,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositInfoText:  {},
            withdrawInfoText:  {},
            depositFormFields: [
                {name: 'cpf', type: 'text', label: 'CPF'}
            ],
            withdrawFormFields:[]
        },
        {
            name: 'astropaystreamline9',
            displayName: "JCB",
            countryAllow: ['BR'],
            canDeposit: true,
            canWithdraw: false,
            order: 31,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositInfoText:  {},
            withdrawInfoText:  {},
            depositFormFields: [
                {name: 'cpf', type: 'text', label: 'CPF'}
            ],
            withdrawFormFields:[]
        },
        {
            name: 'astropaystreamline10',
            displayName: "Discover",
            countryAllow: ['BR'],
            canDeposit: true,
            canWithdraw: false,
            order: 32,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositInfoText:  {},
            withdrawInfoText:  {},
            depositFormFields: [
                {name: 'cpf', type: 'text', label: 'CPF'}
            ],
            withdrawFormFields:[]
        },
        {
            name: 'astropaystreamline11',
            displayName: "Bancomer",
            countryAllow: ['MX'],
            canDeposit: true,
            canWithdraw: false,
            order: 33,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null},
                "MXN" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositInfoText:  {},
            withdrawInfoText:  {},
            depositFormFields: [
                {name: 'cpf', type: 'text', label: 'CPF'}
            ],
            withdrawFormFields:[]
        },
        {
            name: 'astropaystreamline12',
            displayName: "Banamex",
            countryAllow: ['MX'],
            canDeposit: true,
            canWithdraw: false,
            order: 34,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null},
                "MXN" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositInfoText:  {},
            withdrawInfoText:  {},
            depositFormFields: [
                {name: 'cpf', type: 'text', label: 'CPF'}
            ],
            withdrawFormFields:[]
        },
        {
            name: 'astropaystreamline13',
            displayName: "Santander",
            countryAllow: ['MX'],
            canDeposit: true,
            canWithdraw: false,
            order: 35,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null},
                "MXN" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositInfoText:  {},
            withdrawInfoText:  {},
            depositFormFields: [
                {name: 'cpf', type: 'text', label: 'CPF'}
            ],
            withdrawFormFields:[]
        },
        {
            name: 'astropaystreamline14',
            displayName: "OXXO",
            countryAllow: ['MX'],
            canDeposit: true,
            canWithdraw: false,
            order: 36,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null},
                "MXN" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositInfoText:  {},
            withdrawInfoText:  {},
            depositFormFields: [
                {name: 'cpf', type: 'text', label: 'CPF'}
            ],
            withdrawFormFields:[]
        },
        {
            name: 'apcopay',
            canDeposit: true,
            canWithdraw: false,
            displayName: "IDEAL",
            depositInfoText: {
            },
            order: 37,
            info: {
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositFormFields: [
                {name: 'email', type: 'text', label: 'Email'}
            ]
        },
        {
            name: 'apcopay2',
            canDeposit: true,
            canWithdraw: false,
            displayName: "GiroPay",
            depositInfoText: {
            },
            order: 38,
            info: {
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositFormFields: [
                {name: 'email', type: 'text', label: 'Email'}
            ]
        },
        {
            name: 'apcopay3',
            canDeposit: true,
            canWithdraw: false,
            displayName: "Trust Pay",
            depositInfoText: {
            },
            order: 39,
            info: {
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositFormFields: [
                {name: 'email', type: 'text', label: 'Email'}
            ]
        },
        {
            name: 'interkassa',
            canDeposit: true,
            canWithdraw: false,
            order: 40,
            displayName: "Interkassa",
            depositFormFields: [
            ]
        },
        {
            name: 'interkassa_visa',
            displayName: 'Visa',
            canDeposit: true,
            canWithdraw: true,
            order: 41,
            depositInfoText: {
            },
            withdrawInfoText: {
            },
            depositFormFields: [],
            withdrawFormFields: [
                {name: 'lastname', type: 'text', label: 'Last name'},
                {name: 'firstname', type: 'text', label: 'First name'},
                {name: 'middlename', type: 'text', label: 'Middle name'},
                {name: 'phone', type: 'text', label: 'Phone'},
                {name: 'card_num', type: 'text', label: 'Card number', restrict: '[^0-9]'},
                {name: 'isPrivat', type: 'select', label: 'Bank', options: [{value: "", text: ""}, {value: "privat", text: "CB PrivatBank"}, {value: "notprivat", text: "Other Bank"}]}
            ]
        },
        {
            name: 'interkassa_master',
            displayName: 'Master',
            canDeposit: true,
            canWithdraw: true,
            order: 42,
            depositInfoText: {
            },
            withdrawInfoText: {
            },
            depositFormFields: [],
            withdrawFormFields: [
                {name: 'lastname', type: 'text', label: 'Last name'},
                {name: 'firstname', type: 'text', label: 'First name'},
                {name: 'middlename', type: 'text', label: 'Middle name'},
                {name: 'phone', type: 'text', label: 'Phone'},
                {name: 'card_num', type: 'text', label: 'Card number', restrict: '[^0-9]'},
                {name: 'isPrivat', type: 'select', label: 'Bank', options: [{value: "", text: ""}, {value: "privat", text: "CB PrivatBank"}, {value: "notprivat", text: "Other Bank"}]}
            ]
        },
        {
            name: 'interkassa_w1',
            displayName: 'W1',
            canDeposit: true,
            canWithdraw: true,
            order: 43,
            depositInfoText: {
            },
            withdrawInfoText: {
            },
            depositFormFields: [],
            withdrawFormFields: [
                {name: 'lastname', type: 'text', label: 'Last name'},
                {name: 'firstname', type: 'text', label: 'First name'},
                {name: 'middlename', type: 'text', label: 'Middle name'},
                {name: 'purse', type: 'text', label: 'Purse', restrict: '[\\s]'}
            ]
        },{
            name: 'interkassa_webmoney',
            displayName: 'Webmoney',
            canDeposit: true,
            canWithdraw: true,
            order: 44,
            depositInfoText: {
            },
            withdrawInfoText: {
            },
            depositFormFields: [],
            withdrawFormFields: [
                {name: 'purse', type: 'text', label: 'Purse', restrict: '[\\s]'}
            ]
        }
    ],
    paymentByCurrency: {
        deposit: {
            'USD': ["skrill", "netellernew", "moneta", "ecocard", "wirecard", "yandex",  "yandexinvois", "yandexcash", "yandexbank", "yandexprbank", "astropay", "dotpay",
                "safecharge", 'astropaystreamline1', 'astropaystreamline2', 'astropaystreamline3', 'astropaystreamline4', 'astropaystreamline5',
                'astropaystreamline6', 'astropaystreamline7', 'astropaystreamline8', 'astropaystreamline9', 'astropaystreamline10', 'astropaystreamline11',
                'astropaystreamline12', 'astropaystreamline13', 'astropaystreamline14'],
            'EUR': ["skrill", "netellernew", "moneta", "ecocard", "wirecard", "yandex", "yandexinvois", "yandexcash", "yandexbank", "yandexprbank", "dotpay",
                "safecharge", "otopay", "apcopay1", "apcopay2", "apcopay3"],
            'RUB': ["webmoney", "qiwi", "moneta", "ecocard", "centili", "wirecard", "yandex", "yandexinvois", "yandexcash", "yandexbank", "yandexprbank", "safecharge"],
            'UAH': ["wirecard", "yandex", "yandexinvois", "yandexcash", "yandexbank", "yandexprbank", "safecharge"],
            'CNY': ["unionpay", "safecharge"],
            'SEK': ["pugglepay", "safecharge"],
            'MXN': ["toditocash", 'astropaystreamline11', 'astropaystreamline12', 'astropaystreamline13', 'astropaystreamline14']
        },
        withdraw: {
            'USD': ["skrill", "webmoney", "moneta", "ecocard", "astropay", "wirecardnew", "netellernew"],
            'EUR': ["skrill", "webmoney", "moneta", "ecocard", "astropay", "wirecardnew", "netellernew"],
            'RUB': ["webmoney", "qiwi", "moneta", "ecocard", "astropay", "wirecardnew"],
            'UAH': ["webmoney", "wirecardnew", "astropay"],
            'CNY': [],
            'SEK': [],
            'MXN': []
        }
    }
});
CMS.constant('SkinWPConfig', {
    hiddenNewsCategoryIds: [],
    wpUrl: 'https://cmsbetconstruct.com/json',  // WordpResss instance serving pages, banners
    wpNewsUrl:  {
        main: 'https://cmsbetconstruct.com/json'
    },  // WordpResss instance serving news
    wpBaseHost: 'vbet',  // this parameter will be passed to JSON api and all links in response(e.g. images) will have this host
    wpNewsBaseHost: 'vbet', // this parameter will be passed to JSON api and all links in NEWS response(e.g. images) will have this host
    seoFilesGenerationActive: true,
    additionalSections: {
        tournament: {
            name: 'Tournaments',
            placement: 'other',   // if 'topmenu' top menu subitem will be added
            rootPageSlug: {
                'eng': 'tournament-eng',
                'rus': 'tournament-ru',
                'geo': 'tournament-geo',
                'chi': 'tournament-eng',
                'jpn': 'tournament-eng',
                'spa': 'tournament-spa',
                'por': 'tournament-por',
                'tur': 'tournament-eng',
                'kor': 'tournament-eng',
                'arm': 'tournament-arm'
            }
        },
        casinopromotions: {
            name: 'Promotion',
            placement: 'other',   // if 'topmenu' top menu subitem will be added
            rootPageSlug: {
                'eng': 'casinopromotions-eng',
                'chi': 'casinopromotions-eng',
                'jpn': 'casinopromotions-eng',
                'tur': 'casinopromotions-eng',
                'kor': 'casinopromotions-eng',
                'geo': 'casinopromotions-geo',
                'spa': 'casinopromotions-spa',
                'por': 'casinopromotions-por',
                'rus': 'casinopromotions-rus',
                'arm': 'casinopromotions-arm'
            }
        },
        aoc: {
            name: 'AOC',
            placement: 'other',   // if 'topmenu' top menu subitem will be added
            enableCustomTemplate: {
                'poker': 'optional_modules/casino/templates/poker/calculator.html'
            },
            rootPageSlug: {
                'eng': 'aoc-eng',
                'chi': 'aoc-eng',
                'jpn': 'aoc-eng',
                'tur': 'aoc-eng',
                'kor': 'aoc-eng',
                'spa': 'aoc-spa',
                'por': 'aoc-por',
                'geo': 'aoc-geo',
                'rus': 'aoc-rus',
                'arm': 'aoc-arm'
            },
            bannersOnPages: {
                'get-started': {
                    'eng': 'aoc-start-eng',
                    'chi': 'aoc-start-eng',
                    'jpn': 'aoc-start-eng',
                    'tur': 'aoc-start-eng',
                    'kor': 'aoc-start-eng',
                    'spa': 'aoc-start-spa',
                    'geo': 'aoc-start-geo',
                    'rus': 'aoc-start-rus',
                    'arm': 'aoc-start-arm'
                },
                backgammon: {
                    'eng': 'aoc-backgammon-eng',
                    'chi': 'aoc-backgammon-eng',
                    'jpn': 'aoc-backgammon-eng',
                    'tur': 'aoc-backgammon-eng',
                    'kor': 'aoc-backgammon-eng',
                    'spa': 'aoc-backgammon-spa',
                    'geo': 'aoc-backgammon-geo',
                    'rus': 'aoc-backgammon-rus',
                    'arm': 'aoc-backgammon-arm'
                },
                belote: {
                    'eng': 'aoc-belote-eng',
                    'chi': 'aoc-belote-eng',
                    'jpn': 'aoc-belote-eng',
                    'tur': 'aoc-belote-eng',
                    'kor': 'aoc-belote-eng',
                    'spa': 'aoc-belote-spa',
                    'geo': 'aoc-belote-geo',
                    'rus': 'aoc-belote-rus',
                    'arm': 'aoc-belote-arm'
                },
                poker: {
                    'eng': 'aoc-poker-eng',
                    'chi': 'aoc-poker-eng',
                    'jpn': 'aoc-poker-eng',
                    'tur': 'aoc-poker-eng',
                    'kor': 'aoc-poker-eng',
                    'geo': 'aoc-poker-geo',
                    'spa': 'aoc-poker-spa',
                    'rus': 'aoc-poker-rus',
                    'arm': 'aoc-poker-arm'
                }
            }
        }
    },
    help: {
        pageSlugs: {
            'spa': 'help-root-eng',
            'chi': 'help-root-eng',
            'jpn': 'help-root-eng',
            'por': 'help-root-eng',
            'tur': 'help-root-eng',
            'kor': 'help-root-eng',
            'geo': 'help-root-eng'
        },
        popupPageSlugs: {
            'spa': 'help-popup-eng',
            'chi': 'help-popup-eng',
            'jpn': 'help-popup-eng',
            'por': 'help-popup-eng',
            'tur': 'help-popup-eng',
            'kor': 'help-popup-eng',
            'geo': 'help-popup-eng'
        }
    },
    bannerSlugs: {
        homepageRotatingBanners: {
            'spa': 'homepage-selected-game-eng',
            'chi': 'homepage-selected-game-eng',
            'jpn': 'homepage-selected-game-eng',
            'por': 'homepage-selected-game-eng',
            'tur': 'homepage-selected-game-eng',
            'kor': 'homepage-selected-game-eng',
            'geo': 'homepage-selected-game-eng'
        },
        homepageBanners: {
            'spa': 'homepage-banners-eng',
            'chi': 'homepage-banners-eng',
            'jpn': 'homepage-banners-eng',
            'por': 'homepage-banners-eng',
            'tur': 'homepage-banners-eng',
            'kor': 'homepage-banners-eng',
            'geo': 'homepage-banners-eng'
        },
        homepageRightBanners: {
            'spa': 'homepage-banners-right-eng',
            'chi': 'homepage-banners-right-eng',
            'jpn': 'homepage-banners-right-eng',
            'por': 'homepage-banners-right-eng',
            'tur': 'homepage-banners-right-eng',
            'kor': 'homepage-banners-right-eng',
            'geo': 'homepage-banners-right-eng'
        },
        homepageBottomBanners: {
            'spa': 'homepage-banners-bottom-eng',
            'chi': 'homepage-banners-bottom-eng',
            'jpn': 'homepage-banners-bottom-eng',
            'por': 'homepage-banners-bottom-eng',
            'tur': 'homepage-banners-bottom-eng',
            'kor': 'homepage-banners-bottom-eng',
            'geo': 'homepage-banners-bottom-eng'
        },
        poker: {
            'spa' : 'poker-eng',
            'chi' : 'poker-eng',
            'jpn' : 'poker-eng',
            'por' : 'poker-eng',
            'tur' : 'poker-eng',
            'kor' : 'poker-eng',
            'geo' : 'poker-eng'
        },
        backgammon: {
            'spa' : 'backgammon-eng',
            'chi' : 'backgammon-eng',
            'jpn' : 'backgammon-eng',
            'por' : 'backgammon-eng',
            'tur' : 'backgammon-eng',
            'kor' : 'backgammon-eng',
            'geo' : 'backgammon-eng'
        },
        belote: {
            'spa' : 'belote-eng',
            'chi' : 'belote-eng',
            'jpn' : 'belote-eng',
            'por' : 'belote-eng',
            'tur' : 'belote-eng',
            'kor' : 'belote-eng',
            'geo' : 'belote-eng'
        },
        casino: {
            'spa' : 'casino-eng',
            'chi' : 'casino-eng',
            'jpn' : 'casino-eng',
            'por' : 'casino-eng',
            'tur' : 'casino-eng',
            'kor' : 'casino-eng',
            'geo' : 'casino-eng'
        },
        livecasino: {
            'spa' : 'livedealer-banners-eng',
            'chi' : 'livedealer-banners-eng',
            'jpn' : 'livedealer-banners-eng',
            'por' : 'livedealer-banners-eng',
            'tur' : 'livedealer-banners-eng',
            'kor' : 'livedealer-banners-eng',
            'geo' : 'livedealer-banners-eng'
        }
    },
    poker: {
        mainPageSlugs: {
            'spa': 'poker-eng',
            'chi': 'poker-eng',
            'jpn': 'poker-eng',
            'por': 'poker-eng',
            'tur': 'poker-eng',
            'kor': 'poker-eng',
            'geo': 'poker-eng'
        },
        leaderboardWidget: {        //leaderboard block on homepage
            'spa': 'homepage-poker-leaderboard-eng',
            'chi': 'homepage-poker-leaderboard-eng',
            'jpn': 'homepage-poker-leaderboard-eng',
            'por': 'homepage-poker-leaderboard-eng',
            'tur': 'homepage-poker-leaderboard-eng',
            'kor': 'homepage-poker-leaderboard-eng',
            'geo': 'homepage-poker-leaderboard-eng'
        },
        newsCategorySlugs: {
            'spa': 'poker-eng',
            'chi': 'poker-eng',
            'jpn': 'poker-eng',
            'por': 'poker-eng',
            'tur': 'poker-eng',
            'kor': 'poker-eng',
            'geo': 'poker-eng'
        },
        tournamentCategorySlugs: {
            'spa': 'poker-tournament-eng',
            'chi': 'poker-tournament-eng',
            'jpn': 'poker-tournament-eng',
            'por': 'poker-tournament-eng',
            'tur': 'poker-tournament-eng',
            'kor': 'poker-tournament-eng',
            'geo': 'poker-tournament-eng'
        }
    },
    backgammon: {
        mainPageSlugs: {
            'spa': 'backgammon-eng',
            'chi': 'backgammon-eng',
            'jpn': 'backgammon-eng',
            'por': 'backgammon-eng',
            'tur': 'backgammon-eng',
            'kor': 'backgammon-eng',
            'geo': 'backgammon-eng'
        }
    },
    belote: {
        mainPageSlugs: {
            'spa': 'belote-eng',
            'chi': 'belote-eng',
            'jpn': 'belote-eng',
            'por': 'belote-eng',
            'tur': 'belote-eng',
            'kor': 'belote-eng',
            'geo': 'belote-eng'
        }
    },
    promotions: {
        newsCategorySlugs: {
            'spa': 'promotions-eng',
            'chi': 'promotions-eng',
            'jpn': 'promotions-eng',
            'tur': 'promotions-eng',
            'kor': 'promotions-eng',
            'por': 'promotions-eng'
        }
    },
    'chinese-poker': {
        newsCategorySlugs: {
            'spa': 'chinese-poker-eng',
            'chi': 'chinese-poker-eng',
            'jpn': 'chinese-poker-eng',
            'por': 'chinese-poker-eng',
            'tur': 'chinese-poker-eng',
            'kor': 'chinese-poker-eng',
            'geo': 'chinese-poker-eng'
        }
    }
});
CASINO.constant('SkinCConfig', {
    cUrlPrefix: 'https://casino.vbet.com',
    cGamesUrl: '/global/play.php',
    cUrl: '/global/casinoGamesLoad.php',
    main : {
        newCasinoDesign: {
            enabled: true
        },
        enableGameInfoButton: false, //implemented only for casinoVersion:2
        showAllGamesOnHomepage: true,
        partnerID: '4',
        multiViewEnabled: true,
        providersThatWorkWithSwarm: ['KLG', 'VGS'],
        providersThatWorkWithCasinoBackend: {
            providers: [
                'GDR',
                'EDG',
                'RTG',
                'BCS',
                'NET',
                'EZG',
                'BSG',
                'TWB',
                'NYX',
                'PSN',
                'ISB',
                'EVL',
                'TPG',
                'EDP',
                'WMG',
                'EGT',
                'BGB',
                'PTG',
                'MLS',
                'GNI',
                'GAT',
                'OMG',
                'MRS',
                'PPY',
                'HBN',
                'JGS',
                'SPG',
                'ASG',
                'BMG',
                'ORX',
                'ORZ',
                'RDR',
                'MGS',
                'DLV',
                'WZN',
                'RLG'
            ],
            url: "https://launchgames.vbet.com/global/play.php"
        },
        filterByProvider: [
            'IGG','LBX','EVL','TLC','CSB'
        ],
        filterByProviderEnabled: true,
        numberOfRecentGames: 30, //initial number of recent games to show.  When newCasinoDesign is enabled change this value to be 3X
        numberOfRecentGamesWide: 30, //initial number of recent games to show in wide screen mode.  When newCasinoDesign is enabled change this value to be 5X
        increaseBy: 15, // load this number of additional games when clicking "load more".   When newCasinoDesign is enabled change this value to be 3X
        increaseByWide: 15, // load this number of additional games when clicking "load more".  When newCasinoDesign is enabled change this value to be 5X
        favourtieGamesCategoryEnabled: true,
        categories: [
            -1,
            59,
            65,
            40,
            4,
            51,
            1,
            35,
            40,
            19,
            63,
            52
        ],
        storedbonusPopUpLifetime: 259200000 // 3days
    },
    liveCasino: {
        viewStyle: 'SliderView',
        lobby: {
            getDataViaSwarm: true,
            updateInterval: 10000,
            provider: "VGS"
        },
        jackpot: {
            url: {
                'eng': 55440,
                'rus': 55428,
                'arm': 55438
            }
        }
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
    fantasySports: {
        externalURL: 'https://fantasysport.vbet.com'
    },
    bonusPopUpUrl: false
});
EXCHANGE.constant('SkinExchangeConfig', {});