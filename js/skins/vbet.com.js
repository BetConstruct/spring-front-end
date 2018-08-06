/*
 *   All config values specified here will be merged with main config and will override its values
 *
 */
/* global VBET5 */
VBET5.constant('SkinConfig', {
    loadConfigFromCMS: true, // ignore this config and don't generate/upload it during release, conf.json will be created by CMS
    additionalModules: ['casino', 'comboView'],
    'main': {
        enableBigBet: true,
        prefetchLeftMenuHoveredLivesGames: {
            enabled: false,
            prefetchAfter: 250
        },
        logo: {
            paddingMenu: 60
        },
        openBetsAndEditBet: true,
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
        themes: [
            {
                id: "dark",
                name: "Dark Theme"
            },
            {
                id: "light",
                name: "Light Theme",
                css: "skins\/vbet.com\/css\/skin-second.css"
            }
        ],
        balanceSeparateDepositBanners: true,
        header: {
            version: 2,
            haveFaq: false,
            messageIcon: {
                enabled: true,
                alwaysShow: true
            },
            showHelpIcon: false,
            statisticsLink: 'https://statistics.vbet.com',
            customButtons: [
                {
                    text: 'Deposit',
                    authorized: true,
                    slider: 'deposit',
                    class: 'brand-color cms-jcon-deposit'
                }
            ],
            customIcons: [
                {
                    title: 'Contact us',
                    icon: 'cms-jcon-phone',
                    action: 'openHelpPage',
                    data: {
                        slug: 'contact-us',
                        from: 'footer'
                    }
                },
                {
                    title: 'Live Chat',
                    icon: 'cms-jcon-customer-support',
                    action: 'liveAgent.start'
                }
            ]
        },
        footer: {
            mobileVersionLink: "https://m.vbet.com",
            ageRestriction: 18,
            showPaymentSystems: false,
            poweredBy: false,  // 0 - don't show,  1 -show with link,  2 - show without link, 3 - show only all right reserved
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
            license_logos: [
                [
                    {href: "http://responsiblegamblingtrust.org.uk", img: "images/VBET/gamblelogo2.png", height: "36px"},
                    {href: "https://www.authorisation.mga.org.mt/verification.aspx?lang=EN&company=d10daec7-dde7-441a-b9ef-2666667bf4fc&details=1", img: "images/VBET/mga_logo.png", height: "36px"}
                ],
                [
                    {img: "images/VBET/iso.png", height: "66px"},
                    {img: "images/VBET/gamblelogo1.png", height: "56px"}
                ]
            ],
            feedbackButton: {
                enabledLogin: true,
                enabledLogOut: true
            },
            socialLinks: {
                instagram: {url: {default: "http://instagram.com/vbet_official?ref=badge"}},
                twitter: {url: {default: "https://twitter.com/Vbet_com"}},
                facebook: {url: {default: "https://www.facebook.com/vbetcom"}},
                googlePlus: {url: {default: "https://plus.google.com/u/1/+Vbetlivebetting/"}},
                youtube: {url: {default: "https://www.youtube.com/user/VIVARObetting"}},
                vkontakte: {url: {default: "https://vk.com/vbet_official"}}
            }
        },
        selfExclusion: {
            enabled: true
        },
        realityCheck: {
            enabled: true
        },
        site_name: "VBET",
        skin: 'vbet.com',
        geoIPLangSwitch: {
            enabled: true,
            default: 'eng',
            'MX': 'spa',
            'ES': 'spa',
            'CO': 'spa',
            'AR': 'spa',
            'PE': 'spa',
            'VE': 'spa',
            'CL': 'spa',
            'CU': 'spa',
            'EC': 'spa',
            'DO': 'spa',
            'GT': 'spa',
            'HN': 'spa',
            'BO': 'spa',
            'SV': 'spa',
            'NI': 'spa',
            'PY': 'spa',
            'CR': 'spa',
            'PR': 'spa',
            'UY': 'spa',
            'PA': 'spa',
            'GQ': 'spa',
            'RU': 'rus',
            'UA': 'rus',
            'KZ': 'rus',
            'UZ': 'rus',
            'BY': 'rus',
            'AZ': 'rus',
            'KG': 'rus',
            'TJ': 'rus',
            'LV': 'rus',
            'LT': 'rus',
            'MD': 'rus',
            'EE': 'rus',
            'TM': 'rus',
            'AM': 'arm',
            'PT': 'por',
            'AO': 'por',
            'MZ': 'por',
            'CV': 'por',
            'GW': 'por',
            'ST': 'por',
            'TL': 'por',
            'BR': 'pt-br',
            'TR': 'tur',
            'KR': 'kor',
            'KP': 'kor',
            'JP': 'jpn',
            'CN': 'zhh',
            'HK': 'chi',
            'MO': 'chi',
            'TW': 'chi',
            'GE': 'geo',
            'GR': 'gre',
            'SE': 'swe',
            'DE': 'ger',
            'AT': 'ger',
            'LI': 'ger',
            'CH': 'ger',
            'LU': 'ger',
            'NO': 'nor',
            'DZ': 'arb',
            'BH': 'arb',
            'DJ': 'arb',
            'EG': 'arb',
            'JO': 'arb',
            'IQ': 'arb',
            'YE': 'arb',
            'QA': 'arb',
            'KW': 'arb',
            'LB': 'arb',
            'LY': 'arb',
            'MR': 'arb',
            'MA': 'arb',
            'AE': 'arb',
            'OM': 'arb',
            'SA': 'arb',
            'SY': 'arb',
            'SD': 'arb',
            'TN': 'arb',
            'KM': 'arb',
            'SO': 'arb',
            'SN': 'arb',
            'TD': 'arb',
            'PS': 'arb',
            'IR': 'fas',
            'AF': 'fas'
        },
        resultMenuOrdering: [844, 848, 850, 852, 858],
        showResultsMaxDays: 7,
        enableOlympicGames: false,
        enableDepositLimits: true,
        liveMultiViewEnabled: true,
        prematchMultiColumnEnabled: true,
        htmlMetaTags: '<script src="https://my.hellobar.com/09df6853a04aabdc0c0ed5e7b9b116fde686359b.js" type="text/javascript" charset="utf-8" async="async"></script>',
        show3LettersLanguageCode: true,
        enableLoyaltyPoints: true,
        appPokeristUrl: '//vbet-app.pokerist.com/index_vbet.php',
        enableMenuSearch: true,
        enableBannerUnderBetslip: true,
        enableLandingPage: false,
        liveCalendarView: 'oneDaySelectionView',
        enableSystemCalculator: true,

        accountVerificationMessage: 'account-verification-text', // value used as key for getting translation from translation tool
        visibleItemsInTopMenu: 9, // visible items quantity in Top Menu in small view
        showOfficeView:false,
        useLadderForFractionalFormat: true,
        newPoolBettingPage: false,
        hideGmsMarketBase: false,
        sportNewsLink: 'http://www.vbetnews.com/',
        GmsPlatform:true,
        expandOnlyOneSport: true,
        enableSuggestedBets: true,
        enableSportsbookLayoutSwitcher: true,
        enableBonuses: false,
        promoCodeFieldName: 'loyalty_code',
        promotionalBonuses: {
            enable: true,
            sportsbook: true,
            casino: true,
            showApplyButton: true
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
        sliderArrows: true,
        homepage: [
            {
                items: [
                    {
                        class: "size-7",
                        templateUrl: "templates/homepage/mainSlider.html"
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
                        templateUrl: "templates/homepage/productsSlider.html"
                    }
                ]
            },
            {
                items: [
                    {
                        class: "size-12",
                        templateUrl: "templates/homepage/wcCountdown.html"
                    }
                ]
            },
            {
                items: [
                    {
                        class: "size-12",
                        templateUrl: "templates/homepage/featuredGamesSlider.html"
                    }
                ]
            },
            {
                items: [
                    {
                        class: "size-10",
                        templateUrl: "templates/homepage/lastMinuteBets.html"
                    },
                    {
                        class: "size-2",
                        sliderSlug: "homepageBottomBanners"
                    }
                ]
            }
        ],

        homePageLastMinuteBets: {
            enable: true,
            timeOptions: [15, 30, 60]
        },
        featuredGamesLimitation: 9,
        results: {
            version: 1
        },
        search: {   //limits of search results
            limitGames: 25,
            limitCompetitions: 25
        },
        disableCashOut: {
            partial: false,
            auto: false
        },
        enableVisibleInPrematchGames: true,
        customSelectedSequenceInAsianSportsbook: "MATCH",
        enableLiveSectionPin: true,
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
        showFavoriteCompetitions: true, // show "popular competitions" in classic view
        popularMatches: {
            enabled: true
        },
        googleAnalyticsId: 'UA-29242337-7',
        hotjarAnalyticsId: '617073',
        oneSignalId: '8e6410e4-1f52-4260-8ef9-c874a0a2057b',
        facebookPixelId: '1152941148075259',
        yandexMetricaId: '',
        defaultTimeFormat: 'DD/MM/YYYY LT',

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
        downloadPDFButtons: true,
        gameMenuSpecialText: '',
        enableNewPoker: true,
        rememberMeCheckbox: {
            enabled: false
        },
        countOfRecentBetsToShow: 3,
        //statsHostname: 'http://statistics.betcoapps.com/#/en/external/page/',  // hostname for statistics. when clicking on game statistics icon, popup on this hostname is open,
        statsHostname: {
            prefixUrl: 'https://statistics.vbet.com/#/',

            subUrl: '/external/page/'
        },
        enableH2HStat: true,
        newMenuItems: {virtualSport:false, games:false, liveCasino:false, fantasy: false,  poker: 'web'},
        showFavoriteGamesInSportList: true,
        displayEventsMaxBet: true,
        showEachWay: true,
        nonActivityAction: {
            action: 'logout', // 'reload'
            actionDelay: 0, // milliseconds
            nonActivityInterval: 900, // seconds
            checkingInterval: 5000 // seconds
        },
        showVirtualsInSportList: false,
        virtualSportIds: {
            virtualsports: [54, 55, 56, 57, 118, 150, 174],
            insvirtualsports: [132, 133, 134, 135, 136, 137, 138]
        },
        showOutright: false,//200,
        casinoBalanceDefaultPage: 'deposit',
        enableCasinoBalanceHistory: true, //enable casino balance history in top menu
        enableCasinoBetHistory: false, //enable casino balance history in top menu
        enableMixedView: true,
        enableMiniGameUnderBetslip: true,
        minimizeMiniGamesUnderBetslip: false,
        enableBonusCancellation: true, // enable canceling bonus
        enableSubHeader: true,
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
        showWithdrawRequestsTab: false,
        enableNewCashier: false,
        runtimePopupCount: 2,
        showPopupBeforeRegistration: false,
        aocEnabled: true, // enable AOC link in main menu
        availableVideoProviderIds: [1, 3, 5, 7, 8, 11, 12, 15, 16, 19, 21, 22, 23, 29, 999999],
        aocLink: "#/section/aoc",
        theVeryTopMenu: [{href: "#/promos/", label: "Promotions"}, {href: "http://www.vbetnews.com/", label: "VbetNews", target: '_blank'}, {help: 'payments', label: 'Payments'}, {href: "https://free.vbet.com", label: 'Free Vbet',target: '_blank'},{href: "http://new.vbet.com/", label: 'New VBet',target: '_blank'}],
        balanceDefaultPage: 'deposit',
        showPromotedGamesOnWidget: {
            enabled: true,
            level: 'competition',  // game or competition
            type: 'promoted', // promoted or favorite
            gameLimit: 100
        },
        disableITFGamesInfo: true,
        showPointsBalance: true,
        passwordNewResetMode: false,
        allowTimeFormatChange: true,
        availableLanguages: {
            '@replace': true, // this means that object won't be merged with 'parent object', but will replace it
            'eng': {'short': 'EN', 'full': "English", order: 1},
            'spa': {'short': 'ES', 'full': "Español", order: 5},
            'arm': {'short': 'HY', 'full': "Հայերեն", order: 13},
            'rus': {'short': 'RU', 'full': "Русский", order: 4},
            'por': {'short': 'PT', 'full': "Português", order: 6},
            'pt-br' : { 'short': 'PT-BR', 'full': "Português do Brasil", order: 7},
            'tur': {'short': 'TR', 'full': "Türkçe", order: 19},
            'kor': { 'short': 'KO', 'full': "한국어", order: 8},
            'jpn': { 'short': 'JP', 'full': "日本語", order: 9},
            'chi': { 'short': 'CH', 'full': "繁體中文", order: 10},
            'zhh': {'short': 'ZH', 'full': "简体中文", order: 11},
            'geo': {'short': 'KA', 'full': "ქართული", order: 12},
            'swe': {'short': 'SE', 'full': "Swedish", order: 3},
            'arb' : { 'short': 'AR', 'full': "العربية", order: 16, rtl: true},
            'fas' : { 'short': 'FA', 'full': "فارسی", order: 17, rtl: true},
            'ukr': {'short': 'UK', 'full': "Українська", order: 18},
            'ger': {'short': 'DE', 'full': "Deutsch", order: 2},
            'pol' : { 'short': 'PL', 'full': "Polski", order: 20}
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
        defaultAvailablePaths: ['/news', '/promos', '/cas-promos', '/about','/first_deposit_bonus', '/first_deposit_bonus_and_20_free_spins', '/404', '/draw', '/exchange-shop', '/registration','/fantasy'],
        multiLevelMenu: {
            "@replace": true,
            "live": null,
            "sport": null,
            "poker": null,
            "chinga-choong": {
                "title": "ChingaChoong",
                "link": "#/games/?pageid=-1&game=5589",
                "cssclass": "",
                "dynamicClass": "new-top-nav",
                "broadcast": "games.openGame",
                "broadcastData": {
                    id: '5589'
                },
                "activeLink": "#/games/?pageid=-1&game=5589",
                "order": 4
            },
            "virtual-sports": {
                order: 5,
                "subMenu": [
                    {
                        "name": "virtual-sports",
                        "displayName": "BetConstruct",
                        "href": "#/virtualsports"
                    },
                    {
                        "displayName": "Inspired",
                        "href": "#/insvirtualsports"
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
            "casino": {
                subMenu: [
                    {
                        name: "casino",
                        displayName: "Home",
                        href: "#/casino"
                    },
                    {
                        displayName: "Tournaments",
                        href: "#/tournaments",
                        activeLink: '#/tournaments',
                        excludeParam: true
                    }
                ]
            },
            "livedealer": null,
            "vr-casino": {
                title: "VR Casino",
                link: "#/vrcasino",
                activeLink: '/vrcasino/',
                "dynamicClass": "new-top-nav"
            },
            "pools-betting": {
                "title": "Pools Betting",
                "link": "#/game/CSB1/provider/CSB/exid/152000",
                "cssclass": "",
                "activeLink": "/game/CSB1/provider/CSB/exid/152000",
                "order": 20
            },
            tournaments: {
                order: 100
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
            liveAgentID: 'b0170f5a',
            liveAgentAsTooltip: true,
            disableFromHeader: true,
            "rus": {
                isLiveAgent: true,
                liveAgentID: '93d5959a',
                liveAgentAsTooltip: true,
                disableFromHeader: true
            },
            "arm": {
                isLiveAgent: true,
                liveAgentID: 'd54d0ccf',
                liveAgentAsTooltip: true,
                disableFromHeader: true
            },
            "por": {
                isLiveAgent: true,
                liveAgentID: '1d3eae3a',
                liveAgentAsTooltip: true,
                disableFromHeader: true
            },
            "pt-br": {
                isLiveAgent: true,
                liveAgentID: '1d3eae3a',
                liveAgentAsTooltip: true,
                disableFromHeader: true
            },
            "tur": {
                isLiveAgent: true,
                liveAgentID: '1cfc21f1',
                liveAgentAsTooltip: true,
                disableFromHeader: true
            },
            "geo": {
                isLiveAgent: true,
                liveAgentID: '19db0523',
                liveAgentAsTooltip: true,
                disableFromHeader: true
            },
            "arb": {
                isLiveAgent: true,
                liveAgentID: 'ba535c2c',
                liveAgentAsTooltip: true,
                disableFromHeader: true
            },
            "fas": {
                isLiveAgent: true,
                liveAgentID: 'b3acc539',
                liveAgentAsTooltip: true,
                disableFromHeader: true
            },
            "ukr": {
                isLiveAgent: true,
                liveAgentID: '93d5959a',
                liveAgentAsTooltip: true,
                disableFromHeader: true
            },
            "ger": {
                isLiveAgent: true,
                liveAgentID: '8219a563',
                liveAgentAsTooltip: true,
                disableFromHeader: true
            }
        },
        site_id: "4",
        registration: {
            restrictedCountriesLoginAndRegistration:true,
            restrictedCountriesByIp: ['GB', 'GP', 'GF', 'MQ', 'YT', 'RE', 'US'],
            simplified: true, //not ready yet
            enableRegisterByPhoneNumber: false,
            phoneNumberPattern: "^[0-9 ]{6,12}$",
            defaultCurrency: 'USD',
            disableTermsLink: false,
            mailIsSentAfterRegistration: 'Please check your email.',
            loginRightAfterRegistration: true,
            sliderPageAfterRegistration: "deposit",
            closeSliderAfterRegistration: true,
           //
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
            availableCountriesList:[ 'AD', 'AE', 'AL', 'AM', 'AO', 'AR', 'AS', 'AT', 'AW', 'AZ', 'BA', 'BB', 'BD', 'BF', 'BH', 'BI', 'BJ', 'BM', 'BN', 'BO', 'BR', 'BS', 'BT', 'BW', 'BY', 'BZ', 'CA', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CV', 'DJ', 'DM', 'DO', 'DZ', 'EC', 'EG', 'ER', 'ET', 'FI', 'FJ', 'FO', 'GA', 'GD', 'GE', 'GH', 'GM', 'GN', 'GQ', 'GR', 'GT', 'GU', 'GW', 'GY', 'HN', 'HR', 'HT', 'ID', 'IN', 'IS', 'JM', 'JO', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'MA', 'MC', 'MD', 'ME', 'MG', 'MK', 'ML', 'MN', 'MR', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NE', 'NG', 'NI', 'NO', 'NP', 'NR', 'NZ', 'OM', 'PA', 'PE', 'PG', 'PK', 'PR', 'PS', 'PW', 'PY', 'QA', 'RO', 'RW',  'SB', 'SC', 'SE', 'SI', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'ST', 'SV', 'SZ', 'TD', 'TG', 'TH', 'TJ', 'TL', 'TM', 'TN', 'TO', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UY', 'UZ', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WS', 'ZA', 'ZM', 'ZW'],
            readOnlyFields: ['user_id', 'email', 'country_code'],
            editableFields: [ 'phone_number', 'doc_number','first_name', 'sur_name','city', 'address', 'subscribed_to_news', 'subscribe_to_email', 'subscribe_to_sms', 'gender', 'birth_date'],
            requiredEditableFields: [ 'phone_number', 'doc_number','first_name', 'sur_name','city', 'address', 'gender', 'birth_date'],
            patterns:  {
                email: "^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+([\.])[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$",
                docNumber: "^[A-Za-z\\u0400-\\u04FF0-9]*[0-9]+[A-Za-z\\u0400-\\u04FF0-9]*$"
            },
            limits: {
                address: {
                    minlength: 5,
                    maxlength: 100
                }
            },
            requiredFieldsForPayments: ['birth_date', 'doc_number', 'gender'],
            requiredFieldsFor: {
                deposit: false,
                withdraw: true
            }
        },
        availableCurrencies: ['USD', 'EUR', 'RUB', 'UAH', 'CNY','KZT','PLN','SEK','MXN','GEL','TRY'],
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
                "title": "Password",
                "name": "password",
                "placeholder": "Password should contain at least 6 characters",
                "type": "password",
                "required": true,
                "classes": "",
                "enableShowPassword": true,
                "customAttrs": [{"type": "{{regItem.inputType}}"},{"ng-minlength": "6"},  {"required": "required"}, {"ng-maxlength": "14"}, {"ng-keypress": "passwordKeyPress($event, 'password')"}],
                "validation": [{"name": "required", "message": "This field is required"}, {
                    "name": "minlength",
                    "message": "Password should contain at least 6 characters"
                }, {"name": "sameAsLogin", "message": "Password cannot be same as login"}, {
                    "name": "tooShort",
                    "message": "Minimum length – 8 characters, without spaces."
                }, {
                    "name": "pattern",
                    "message": "Allowed characters are A-Z, a-z, 0-9 and these special characters ! @ # $ % ? ^ & * ( ) - = _ + \ / | ; : , . < > [ ] { } ` ' ~"
                }, {
                    "name": "maxlength",
                    "message": "Password is too long"
                }]
            }
        ],
        step2: {
            "leftCol":[
                {
                    "title": "First Name",
                    "name": "first_name",
                    "type": "text",
                    "required": true,
                    "placeholder": "Enter here",
                    "classes": "",
                    "customAttrs": [{"ng-pattern": "/^[^0-9\\[\\]\\\\`~!@#$%^&*()_+={};:<>|./?,\"'-\\s]+$/"}, {"capitaliseinput": ""},{"required": "required"} ],
                    "validation": [{"name": "required", "message": "This field is required"}, {"name": "pattern", "message": "Please enter a valid  name: only letters - no space, no digits and/or symbols"}]
                },
                {
                    "title": "Last Name",
                    "name": "last_name",
                    "placeholder": "Enter here",
                    "type": "text",
                    "required": true,
                    "classes": "",
                    "customAttrs": [{"ng-pattern": "/^[^0-9\\[\\]\\\\`~!@#$%^&*()_+={};:<>|./?,\"'-\\s]+$/"}, {"capitaliseinput": ""},{"required": "required"} ],
                    "validation": [{"name": "required", "message": "This field is required"}, {"name": "pattern", "message": "Please enter a valid  last name: only letters - no space, no digits and/or symbols"}]
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
                    "title": "Mobile",
                    "name": "phone_code",
                    "type": "text",
                    "required": true,
                    "classes": "",
                    "customAttrs": [{"country-code-validate": ""}, {"deValidate": ""}, {"ng-maxlength": "5"}, {"required": "required"}, {"prevent-input": "[^0-9]+"}],
                    "validation": [{"name": "countryCode", "message": "Country code is not correct"}, {
                        "name": "required",
                        "message": "Country code is not correct"
                    }]
                },
                {
                    "title": "",
                    "name": "phone_number",
                    "type": "text",
                    "required": true,
                    "placeholder": "Enter number",
                    "hasCustomHtml": true,
                    "classes": "",
                    "customAttrs": [{"ng-pattern": "/^[0-9 ]+$/"}, {"required": "required"}, {"prevent-input": "[^0-9]+"}, {"ng-maxlength": "15"}],
                    "validation": [{"name": "maxlength", "message": 'Too long'},{"name": "invalid", "message": "Invalid phone number"}, {
                        "name": "duplicate",
                        "message": "Duplicate phone number"
                    }, {"name": "failedsms", "message": "Failed to send sms"}, {
                        "name": "required",
                        "message": "This field is required"
                    }, {"name": "pattern", "message": "Please, enter valid phone number: only digits are allowed - no spaces, letters and/or symbols"}]
                }, {
                    "title": "Promo code",
                    "name": "loyalty_code",
                    "type": "text",
                    "required": false,
                    "placeholder": "Enter here",
                    "classes": "",
                    "customAttrs": [],
                    "validation": []
                },
                {
                    "title": "",
                    "name": "g_recaptcha_response",
                    "type": "recaptcha",
                    "placeholder": "",
                    "required": true,
                    "classes": "",
                    "validation": [{"name": "required", "message": "This field is required"}, {"name": "notmatching", "message": "This field is required"}]
                }
            ],
            rightCol: []
        }
    },
    'env': {
        live: true,
        lang: 'eng',
        showFifaCountdown: false,
        preMatchMultiSelection: false,
        showSportsbookToolTip: true
    },
    'betting': {
        enableExpressBonus: false,
        expressBonusVisibilityQty: 2,
        expressBonusMap: {
            '0': 0,
            '1': 0,
            '2': 0,
            '3': 3,
            '4': 4,
            '5': 5,
            '6': 5,
            '7': 7,
            '8': 7,
            '9': 7,
            '10': 15,
            '11': 20,
            '12': 20,
            '13': 20,
            '14': 20,
            '15': 20,
            '16': 35,
            '17': 35,
            '18': 35,
            '19': 35,
            '20': 35,
            default: 50
        }, //1: regular bonus 2,3,4,5..% ; 2: 2-5,10,15,20,25,30,30..30 %;: regular bonus 2,3,4,5..% ; 2: 2-5,10,15,20,25,30,30..30 %;
        enableEachWayBetting: true,
        enableHorseRacingBetSlip: true, // SP, new bet types, etc.
        enableSuperBet: true,
        expressBonusMinOdd: 1.3,
        defaultPriceChangeSetting: 1,
        allowManualSuperBet: true,
        clearOnLogout: false,
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
        totalOddsMax : 10000,
        enableRetainSelectionAfterPlacment: true,
        enableFullCoverBetTypes: false
    },
    "everCookie": {
        "enabled": true
    },
    'swarm': {
        url: [{ url: "https://eu-swarm-lp.betconstruct.com/"}],
        websocket: [{ url: "wss://eu-swarm-ws.betconstruct.com/"}]
        //url: [{ url: "http://10.25.57.76:8091"}],
        //websocket: [{ url: "ws://10.25.57.76:8091"}]
    },
    poker: {
        rakeRaceEnabled: true,
        tournamentListEnabled: true,
        hideDownloadLinkSectionInPokerPage: true
    },
    chinesePoker: {
        hideDownloadLinkSection: false
    },
    belote: {
        instantPlayTarget: '',
        redirectOnGame: true
        //instantPlayTarget: '_self',
        //redirectOnInstantPlay: true,
        //instantPlayLink: "http://www.vbet.com/#/games/?game=599&type=real"
    },
    vrcasino:{
        redirectOnGame: false,
        showDownloadSection: true,
        showPromotionsInVRCasino: false
    },
    backgammon: {
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
            countryRestrict: ['DE', 'PL'],
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
            countryRestrict: ['DE', 'PL'],
            order: 5,
            depositInfoTextKey: 'deposit_info_neteller', // translate##deposit_info_neteller##
            withdrawInfoTextKey: 'withdraw_info_neteller', // translate##withdraw_info_neteller##
            depositFormFields: [
                {name: 'email', type: 'text', label: 'Email/Account Id'}, // translate##Account Id##
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
            name: 'wirecard',
            displayName: "WireCard",
            canDeposit: true,
            countryRestrict: ['TR', 'NO', 'US'],

            canWithdraw: false,
            order: 9,
            depositInfoTextKey: 'deposit_info_wirecard',
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 5, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 10, maxDeposit: 5000, minWithdraw: 10, maxWithdraw: 10000},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 100, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 100, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "PLN" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null}
            }
        },
        {
            name: 'wirecardnew',
            countryRestrict: ['TR', 'NO', 'US'],
            displayName: "WireCard",
            canDeposit: false,
            canWithdraw: true,
            order: 1,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 5, maxDeposit: null, minWithdraw: 10, maxWithdraw: 10000},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 10, maxDeposit: 5000, minWithdraw: 10, maxWithdraw: 10000},
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
        },{
            name: 'yandexsberbank',
            displayName: "Yandex Sberbank",
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
            name: 'astropaymobile',
            canDeposit: false,
            canWithdraw: true,
            displayName: "AstroPayCardMobile",
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
            },
            withdrawInfoText: {
            },
            //withdrawInfoTextKey: 'withdraw_info_astropay', // translate##withdraw_info_astropay##
            withdrawFormFields: [
                {name: 'x_name', type: 'text', label: 'Full Name'},
                {name: 'mobile_number', type: 'text', label: 'Mobile Number'},
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
            countryAllow: ['NL'],

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
            countryAllow: ['DE'],

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
            countryAllow: ['CZ'],

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
            order: 7,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: 10000, minWithdraw: 1, maxWithdraw: 10000},
            },

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
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: 10000, minWithdraw: 1, maxWithdraw: 10000},
            },

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
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: 10000, minWithdraw: 1, maxWithdraw: 10000},
            },

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
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: 10000, minWithdraw: 1, maxWithdraw: 10000},
            },

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
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: 10000, minWithdraw: 1, maxWithdraw: 10000},
            },

            depositInfoText: {
            },
            withdrawInfoText: {
            },
            depositFormFields: [],
            withdrawFormFields: [
                {name: 'purse', type: 'text', label: 'Purse', restrict: '[\\s]'}
            ]
        },
        {
            name: 'interkassa_qiwi',
            displayName: 'Qiwi',
            canDeposit: true,
            canWithdraw: true,
            order: 5,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "RUB" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: 10000, minWithdraw: 1, maxWithdraw: 10000},
            },

            depositInfoText: {
            },
            withdrawInfoText: {
            },
            depositFormFields: [],
            withdrawFormFields: [
                {name: 'phone', type: 'text', label: 'Phone'}
            ]
        },
        {
            name: 'entercash',
            countryAllow: ['GR', 'FI', 'NL', 'AT', 'SE', 'NO'],
            canDeposit: true,
            canWithdraw: true,
            order: 33,
            info: {
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 10, maxDeposit: 5000, minWithdraw: 1, maxWithdraw: null},
                "SEK" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 100, maxDeposit: 50000, minWithdraw: 10, maxWithdraw: 10000},
            },

            depositFormFields: [],
            withdrawFormFields: [
                {name: 'accountNumber', type: 'text', label: 'Account number', required: true},
                {name: 'clearingNumber', type: 'text', label: 'Clearing number', required: true},
                {name: 'zip', type: 'text', label: 'Zip code'},
            ],
            depositInfoText: {},
            withdrawInfoText: {}
        },
        {
            name: 'hipay',
            canDeposit: true,
            canWithdraw: false,
            displayName: "Hipay",
            countryAllow: ['NO', 'CA'],
            order: 34,
            info: {
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null}
            },
            depositFormFields: [
            ],
            depositInfoText: {
            }
        },
        {
            name: 'paykasa',
            canDeposit: true,
            displayName: "Paykasa",
            info: {
                "TRY" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: null, maxWithdraw: null},
            },
            canWithdraw: false,
            order: 15,
            depositPrefilledAmount: 1,
            depositFormFields: [
                {name: 'voucher', type: 'text', label: 'Voucher'}
            ],
            depositInfoText: ''
        },
        {
            name: 'gpaysafe',
            canDeposit: true,
            canWithdraw: true,
            order: 25,
            info: {
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
                "TRY" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: null, minWithdraw: 1, maxWithdraw: null},
            },

            depositInfoText: {
            },
            withdrawFormFields: [
                {name: 'bankCode', type: 'text', label: 'Bank Code'},
                {name: 'bankAccount', type: 'text', label: 'Bank Account'},
                {name: 'branchCode', type: 'text', label: 'Branch Code'},
            ],
            depositFormFields: [
            ]
        },
        {
            name: 'paymastercards',
            displayName: 'MatsterCard',
            canDeposit: true,
            canWithdraw: true,
            order: 2,
            info: {
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: 150000, minWithdraw: 50, maxWithdraw: 10000},
            },

            depositInfoText: {
            },
            withdrawInfoText: {
            },
            depositFormFields: [],
            withdrawFormFields: [
                {name: 'account', type: 'text', label: 'Account'}
            ]
        },
        {
            name: 'paymastervisa',
            displayName: 'Visa',
            canDeposit: true,
            canWithdraw: true,
            order: 1,
            info: {
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: 150000, minWithdraw: 50, maxWithdraw: 10000},
            },

            depositInfoText: {
            },
            withdrawInfoText: {
            },
            depositFormFields: [],
            withdrawFormFields: [
                {name: 'account', type: 'text', label: 'Account'}
            ]
        },
        {
            name: 'paymasterprivat24',
            displayName: 'Privat24',
            canDeposit: true,
            canWithdraw: true,
            order: 3,
            info: {
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: 150000, minWithdraw: 50, maxWithdraw: 10000},
            },

            depositInfoText: {
            },
            withdrawInfoText: {
            },
            depositFormFields: [],
            withdrawFormFields: [
                {name: 'account', type: 'text', label: 'Account'}
            ]
        },
        {
            name: 'paymasterqiwi',
            displayName: 'Qiwi',
            canDeposit: false,
            canWithdraw: false,
            order: 5,
            info: {
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: 150000, minWithdraw: 50, maxWithdraw: 10000},
            },

            depositInfoText: {
            },
            withdrawInfoText: {
            },
            depositFormFields: [],
            withdrawFormFields: [
                {name: 'account', type: 'text', label: 'Account'}
            ]
        },
        {
            name: 'paymasterwebmoney',
            displayName: 'Webmoney',
            canDeposit: true,
            canWithdraw: true,
            order: 4,
            info: {
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 1,  minDeposit: 1, maxDeposit: 150000, minWithdraw: 50, maxWithdraw: 10000},
            },

            depositInfoText: {
            },
            withdrawInfoText: {
            },
            depositFormFields: [],
            withdrawFormFields: [
                {name: 'account', type: 'text', label: 'Account'}
            ]
        },
        {
            name: 'interkassa_bitcoin',
            displayName: "BitCoin",
            order: 6,
            canDeposit: true,
            canWithdraw: false,
            info: {
                "USD" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, depositProcessTimeType: 'minutes', withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: 1, maxWithdraw: 10000},
                "EUR" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, depositProcessTimeType: 'minutes', withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: 1, maxWithdraw: 10000},
                "UAH" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, depositProcessTimeType: 'minutes', withdrawProcessTime: 12,  minDeposit: 1, maxDeposit: 10000, minWithdraw: 1, maxWithdraw: 10000},
            },
            depositFormFields: [
            ]
        },
        {
            name: 'paysafecard',
            displayName: 'PaySafeCard',
            canDeposit: true,
            canWithdraw: true,
            order: 16,
            depositInfoText: {
                eng: "",
                ger: "",
                por: ""
            },
            withdrawInfoText : {
                eng: "",
                ger: "",
                por: ""
            },
            depositFormFields: [],
            withdrawFormFields: [
                {name: 'email', type: 'email', label: 'Email', required: true}
            ]
        },
        {
            name: 'cubits',
            displayName: 'Cubits',
            canDeposit: false,
            canWithdraw: true,
            order: 1,
            info: {
                "MBT" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 24, minDeposit: 1, maxDeposit: 10000, minWithdraw: 1, maxWithdraw: 10000}
            },
            depositInfoText : {
            },
            withdrawFormFields: [
                {name: 'address', type: 'text', label: 'BitCoin Address'}
            ]
        },
        {
            name: 'cubits_channel',
            displayName: 'Cubits',
            canDeposit: true,
            canWithdraw: false,
            depositPrefilledAmount: 1,
            order: 1,
            info: {
                "MBT" : { depositFee: 0, withdrawFee: 0, depositProcessTime: 0, withdrawProcessTime: 24, minDeposit: 1, maxDeposit: 10000, minWithdraw: 1, maxWithdraw: 10000}
            },
            depositInfoText : {
            }
        },
        {
            name: 'persianpay',
            displayName: 'Persian Pay',
            canDeposit: true,
            canWithdraw: true,
            order: 1,
            info: {
            },
            depositInfoText : {
            },
            withdrawFormFields: [
                {name: 'card_number', type: 'text', label: 'Card Number'},
                {name: 'shaba_number', type: 'text', label: 'SHABA NUMBER'},
                {name: 'bank_account_number', type: 'text', label: 'BANK ACCOUNT NUMBER'},
                {name: 'user', type: 'text', label: 'User'},
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
                "safecharge", "otopay", "apcopay1", "apcopay2", "apcopay3", "paykasa"],
            'RUB': ["webmoney", "qiwi", "moneta", "ecocard", "wirecard", "yandex", "yandexinvois", "yandexcash", "yandexbank", "yandexprbank", "safecharge"],
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
    wpNewsUrl: {
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
    cUrlPrefix: 'https://games.vbet.com',
    cGamesUrl: '/authorization.php',
    cUrl: '/global/casinoGamesLoad.php',
    main : {
        enableGameInfoButton: false,
        showAllGamesOnHomepage: true,
        partnerID: '4',
        multiViewEnabled: true,
        filterByProvider: [
            'IGG','LBX','EVL','TLC','CSB'
        ],
        restrictProvidersInCountries: {
            'LSS': ['AM']
        },
        filterByProviderEnabled: true,
        numberOfRecentGames: 30, //initial number of recent games to show.  When newCasinoDesign is enabled change this value to be 3X
        numberOfRecentGamesWide: 30, //initial number of recent games to show in wide screen mode.  When newCasinoDesign is enabled change this value to be 5X
        favourtieGamesCategoryEnabled: true,
        storedbonusPopUpLifetime: 259200000 // 3days
    },
    liveCasino: {
        viewStyle: 'SliderView',

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
VBET5.config(['$routeProvider', function ($routeProvider) {
    'use strict';
    $routeProvider.when('/draw/', {
        templateUrl: 'skins/vbet.com/templates/draw/main.html',
        reloadOnSearch: false
    });
}]);
