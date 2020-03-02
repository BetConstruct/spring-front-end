/* global VBET5 */
/*
 *   Configuration for local development and testing
 *
 */
VBET5.constant('SkinConfig', {
    additionalModules: ['casino'],
    'main': {
        siteTitle: {
            "eng": "Vbet - Sport betting, Poker, Casino, Online Games",
            "spa": "Vbet - Sport betting, Poker, Casino, Online Games",
            "geo": "Vbet - Sport betting, Poker, Casino, Online Games",
            "rus": "Букмекерская контора Vbet - Онлайн ставки, покер, казино, онлайн игры",
            "arm": "Vbet բուքմեյքերական ընկերություն - Օնլայն խաղադրույքներ, պոկեր, կազինո, նարդի, օնլայն խաղեր"
        },
        site_name: "VBET",
        alternativeClassicGamesLayout: true,
        showEventsCountInMoreLink: true,
        skin: 'vbet.com',
        header: {
            version: 2,
            haveFaq: true,
        },
        footer: {
            ageRestriction: 18,
            about_company_text: {
                'eng' : "Vbet is operated by Radon B.V. registered in the Commercial register of Curacao no. 126922 and has a sublicense CIL pursuant to Master gaming License №5536/JAZ.",
                'spa' : "Vbet is operated by Radon B.V. registered in the Commercial register of Curacao no. 126922 and has a sublicense CIL pursuant to Master gaming License №5536/JAZ.",
                'geo' : "Vbet is operated by Radon B.V. registered in the Commercial register of Curacao no. 126922 and has a sublicense CIL pursuant to Master gaming License №5536/JAZ.",
                'rus' : "Vbet управляется со стороны Radon B.V., который зарегистрирован в Коммерческом регистре Кюрасао под номером 126922 и имеет сублицензию CIL в соответствии с Master gaming License #5536/JAZ.",
                'arm' : "Vbet –ը գործում է Radon BV-ի անունից, որը գրանցված է Կյուրասաոի առեւտրային ռեգիստրում 126922 համարով և ունի CIL ենթաարտոնագիր՝ համաձայն Master gaming License #5536/JAZ:"
            },
            feedbackButton: {
                enabledLogin: true,
                enabledLogOut: false
            },
            socialLinks: {
                instagram: {url: {default: "http://instagram.com/vbet_official?ref=badge"}},
                twitter: {url: {default: "https://twitter.com/Vbet_com"}},
                facebook: {url: {default: "https://www.facebook.com/vbetcom"}},
                googlePlus: {url: {default: "https://plus.google.com/u/1/+Vbetlivebetting/"}},
                youtube: {url: {default: "https://www.youtube.com/user/VIVARObetting"}},
                vkontakte: {url: {default: "http://vk.com/vbetcom"}}
            }
        },
        liveCalendarEnabled: true,
        liveModule: {
            enabled: true,
            url: "http://html5demo.betconstruct.com",
            skin: "betsat.com"
        },
        enableScrollToggle: true,
        enableSportsbookLayoutSwitcher: true,
        googleAnalyticsId: 'UA-29242337-7',
        yandexMetricaId: '24705809',

        enableNewPoker: true,
        showFavoriteGamesInSportList: true,
        showEachWay: true,
        showVirtualsInSportList: 1,
        enableCasinoBalanceHistory: true, //enable casino balance history in top menu
        enableCasinoBetHistory: true, //enable casino balance history in top menu
        aocEnabled: true, // enable AOC link in main menu
        availableVideoProviderIds: [1, 3, 5, 7, 8, 11, 12, 15, 21, 22, 23, 999999, 31],
        aocLink: "#/section/aoc",
        theVeryTopMenu: [{href: "#/fantasy/", label: "Fantasy Sports"}, {href: '`', label: "Financials"}, {href: "#/section/aoc", label: "AOC"}, {href: "#/freebet/", label: "Free Quiz"}, {href: "#/jackpot/", label: "Jackpot"}, {href: "#/promos/", label: "Promotions"}],
        multiLevelMenu: {
            "@replace": true,
           "live": {
                "order": 10
            },
            "sport": {
                "order": 20
            },
            "livemodule-sport": {
                "order": 30
            },
            "livemodule-live": {
                "order": 40
            },
            "livecalendar": {
                "order": 50
            },
            "virtual-sports": {
                "order": 60
            },
            "belote": {
                "order": 70
            },
            "backgammon": {
                "order": 80
            },
            "games": {
                "order": 90
            },
            "virtual-betting": {
                "order": 100
            },
            "casino": {
                "order": 110
            },
            "poolbetting": {
                "order": 120
            },
            "poker": {
                "order": 130
            },
            "livedealer": {
                "order": 140
            },
            "ogwil": {
                "order": 150
            },
            "freebet": {
                "order": 160
            },
            "fantasy": {
                "order": 170
            },
            "jackpot": {
                "order": 180
            },
            "financials": {
                "order": 190
            }
        },
        newMenuItems: {liveCasino: true},
        useAuthCookies: true,
        enableBetBooking: true,
        bookingBetPrint: {
            viewType: 2, // 1: for id only print view, 2: for full betslip print view
            message: 'This booking number does not determine the the  final odds of the betslip but only the exact selections of the bet. The odds of the betslip can constantly change and may only be confirmed by the cashier after the final acceptance of the bet.'
        },
        //domainSpecificPrefixes: {
        //    'casino.testvivarobet.am': {
        //        '#/' : '//vivarobet.am/',
        //        '#/sport' : '//vivarobet.am/',
        //        '#/sport/?type=0' : '//vivarobet.am/',
        //        '#/sport/?type=1' : '//vivarobet.am/',
        //        '#/sport/?type=0&sport=-3' : '//vivarobet.am/',
        //        '#/freebet' : '//vivarobet.am/',
        //        '#/poolbetting' : '//vivarobet.am/'
        //    },
        //    'testvivarobet.am': {
        //        '#/casino': '//casino.vivarobet.am/',
        //        '#/games': '//casino.vivarobet.am/',
        //        '#/livedealer': '//casino.vivarobet.am/',
        //        '#/fantasy': '//casino.vivarobet.am/',
        //        '#/ogwil': '//casino.vivarobet.am/',
        //        '#/jackpot': '//casino.vivarobet.am/',
        //        '#/financials': '//casino.vivarobet.am/',
        //        '#/backgammon': '//casino.vivarobet.am/',
        //        '#/belote': '//casino.vivarobet.am/'
        //    }
        //},
        availableLanguages: {
            '@replace': true, // this means that object won't be merged with 'parent object', but will replace it
            'eng' : { 'short': 'EN', 'full': "English", order: 1},
            'spa' : { 'short': 'ES', 'full': "Español", order: 2},
            'arm' : { 'short': 'HY', 'full': "Հայերեն", order: 4},
            'rus' : { 'short': 'RU', 'full': "Русский", order: 3}
            //'geo' : { 'short': 'KA', 'full': "ქართული", order: 5}
        },
        twitterFeed: {
            enabled: true,
            refreshInterval: 300000, //5min
            hashTag: 'live', //only tweets having this hashtag will be shown
            count: 20, //count of tweets to load (before filtering with hashtag)
            user: {
                'arm' : 'vivaro_bet',
                'eng' : 'vbet_com',
                'spa' : 'vbet_com',
                'geo' : 'vbet_com',
                'rus' : 'livebettingru'
            }
        },
        remindToRenewBalance: {
            enabled: true,
            page: 'deposit',
            threshold: 0.5,
            interval: 14400000 //4 hours
        },
        redirectOnTablets: 'http://tablet.vbet.com/',
        poolBettingResultsUrlPrefix : 'http://www.vbet.com/results/',
        additionalLink: {
            eng:  { link: 'http://free.vbet.com/#/?lang=eng', text: 'Free Vbet'},
            spa:  { link: 'http://free.vbet.com/#/?lang=spa', text: 'Free Vbet'},
            geo:  { link: 'http://free.vbet.com/#/?lang=geo', text: 'Free Vbet'},
            rus:  { link: 'http://free.vbet.com/#/?lang=rus', text: 'Free Vbet'},
            arm:  { link: 'http://free.vbet.com/#/?lang=arm', text: 'Free Vbet'}
        },
        liveChat: {
            isSfChat: false,
            siteId: 32814,
            codePlan: 357,
            comm100Src: 'https://chatserver.comm100.com/livechat.ashx?siteId='
        },
        site_id: "4",
        registration: {
            defaultCurrency: 'USD',
            requireSmsValidation: true,
            mailIsSentAfterRegistration: 'Please check your email.',
            securityQuestion: {
                enabled: true
            }
        },
        personalDetails: {
            restrictedCountriesList: ['AM','GB'],
            readOnlyFields: ['user_id', 'first_name', 'sur_name', 'birth_date', 'gender', 'email'],
            editableFields: ['country_code', 'city', 'address', 'phone_number'],
            requiredEditableFields: ['country_code', 'city', 'address']
        },
        availableCurrencies: ['USD', 'EUR', 'RUB', 'UAH', 'AMD'],
        twitterHashTag: 'vbet'
    },
    partner: {
        // section for partner config
        documentDomain: true,
        allowStringUserId: true, //don't convert userId to number
        notifyOnResize: true, //if enabled, will call partner's provided callback function on every resize, passing it the frame size
        enableSigninRegisterCallbacks: true, // log in and register buttons will be shown and when clicked callback function with corresponding parameters will be called
        inactivityCallbackTime: 5
    },
    env : {
        showFifaCountdown: false,
        preMatchMultiSelection: false
    },
    betting: {
        enableHorseRacingBetSlip: true, // SP, new bet types, etc.
        enableEachWayBetting: true
    },
    'swarm': {
        url: [{url: "https://eu-swarm-lp.betconstruct.com"}],
        websocket: [{url: "wss://swarm5.betconstruct.com/"}]
        //url: [{url: "http://10.32.5.211:8080"}],
        //websocket: [{url: "ws://10.32.5.211:8080"}] //TEMPORARY
    },
    regConfig:  {
        "leftCol": [{
            "title": "Name",
            "name": "first_name",
            "type": "text",
            "required": true,
            "placeholder": "First",
            "classes": "",
            "customAttrs": [{"required": "required"}],
            "validation": [{"name": "required", "message": "Please enter a valid  name"}]
        }]
    },
    belote: {
        redirectOnGame: true,
        instantPlayTarget: ''
    },
    backgammon: {
        redirectOnGame: true,
        instantPlayTarget: '',
        downloadLink: {
            windows: 'http://casino.vbet.com/nardi/VGammon-1.1.27-Setup.exe'
        }
    },
    'payments': [
        {
            name: 'skrill',
            canDeposit: true,
            canWithdraw: true,
            order: 1,
            // translate##deposit_info_skrill##   <--- these are special comments that tell translation
            // generation script that key inside hashes has to be included in translation table
            depositInfoTextKey: 'deposit_info_skrill',
            withdrawInfoTextKey: 'withdraw_info_skrill', // translate##withdraw_info_skrill##
            stayInSameTabOnDeposit: true, //will submit external "confirm" form in same tab
            //these external form field values will be set to current URL in app,
            // so when user makes or cancels payment, he'll return to our page
            depositFormFields: [
                {name: 'email', type: 'email', label: 'Email'}  // translate##Email##
            ],
            withdrawFormFields: [
                {name: 'email', type: 'email', label: 'Email', required: true},  // translate##Email##
                {name: 'name', type: 'select', label: 'Name', options: [{value: 1, text: "111"}, {value: 2, text: "211"}]} // translate##Name##
            ]
        },
        {
            name: 'webmoney',
            canDeposit: true,
            canWithdraw: true,
            order: 2,
            depositInfoTextKey: 'deposit_info_webmoney',     // translate##deposit_info_webmoney##
            withdrawInfoTextKey: 'withdraw_info_webmoney',     // translate##withdraw_info_webmoney##
            withdrawFormFields: [
                {name: 'name', type: 'text', label: 'Name'}, // translate##Name##
                {name: 'purse', type: 'text', label: 'Purse'} // translate##Purse##
            ]
        },
        {
            name: 'qiwi',
            canDeposit: true,
            canWithdraw: true,
            order: 3,
            depositInfoTextKey: 'deposit_info_qiwi', // translate##deposit_info_qiwi##
            withdrawInfoTextKey: 'withdraw_info_qiwi', // translate##withdraw_info_qiwi##
            depositFormFields: [{name: 'wallet_id', type: 'text', label: 'Wallet id'}],// translate##Wallet id##
            withdrawFormFields: [{name: 'wallet_id', type: 'text', label: 'Wallet id'}] // translate##Wallet id##
        },
        {
            name: 'neteller',
            canDeposit: true,
            canWithdraw: true,
            order: 4,
            depositInfoTextKey: 'deposit_info_neteller', // translate##deposit_info_neteller##
            withdrawInfoTextKey: 'withdraw_info_neteller', // translate##withdraw_info_neteller##
            depositFormFields: [
                {name: 'account_id', type: 'text', label: 'Account Id'}, // translate##Account Id##
                {name: 'secure_id', type: 'text', label: 'Secure Id'}   // translate##Secure Id##
            ],
            withdrawFormFields: [
                {name: 'id', type: 'text', label: 'Account Id'} // translate##Account Id##
            ]
        },
        {
            name: 'moneta',
            canDeposit: true,
            canWithdraw: true,
            order: 5,
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
            canDeposit: true,
            canWithdraw: true,
            order: 6,
            depositInfoTextKey: 'deposit_info_ecocard', // translate##deposit_info_ecocard##
            withdrawInfoTextKey: 'withdraw_info_ecocard', // translate##withdraw_info_ecocard##
            depositFormFields: [],
            withdrawFormFields: [
                {name: 'account', type: 'text', label: 'Account Id'} // translate##Account Id##
            ]
        },
        {
            name: 'ukash',
            canDeposit: false,
            canWithdraw: false,
            order: 5,
            depositInfoTextKey: 'deposit_info_ukash', // translate##deposit_info_ukash##
            withdrawInfoTextKey: 'withdraw_info_ukash' // translate##withdraw_info_ukash##
        },
        {
            name: 'cash',
            canDeposit: false,
            canWithdraw: false,
            hideDepositButton: true,
            order: 6,
            hasBetShops: true,
            depositInfoTextKey: 'deposit_info_cash', // translate##deposit_info_cash##
            withdrawInfoTextKey: 'withdraw_info_cash' // translate##withdraw_info_cash##
        },
        {
            name: 'telcell',
            canDeposit: false,
            canWithdraw: false,
            order: 100,
            depositInfoTextKey: 'deposit_info_telcell',
            withdrawInfoTextKey: 'deposit_info_telcell',
            onlyInfoTextOnDeposit: true, // this means that we won't show any form or button on deposit  page, including amount selection, only text
            onlyInfoTextOnWithdraw: true // this means that we won't show any form or button on withdraw page, including amount selection, only text
        },
        {
            name: 'vivaropoker',
            canDeposit: false,
            canWithdraw: true,
            order: 200,
            isTransferToLinkedService: true,
            withdrawInfoTextKey: 'withdraw_info_topoker'
        },
        {
            name: 'vivarobet',
            canDeposit: false,
            canWithdraw: true,
            order: 201,
            isTransferToLinkedService: true,
            withdrawInfoTextKey: 'withdraw_info_tovivaro'
        },
        {
            name: 'wirecard',
            canDeposit: true,
            canWithdraw: false,
            order: 1,
            depositInfoTextKey: 'deposit_info_wirecard', // translate##deposit_info_wirecard##
            depositFormFields: [
                {name: 'credit_card_number', type: 'text', label: 'CardNumber'},  // translate##CardNumber##
                {name: 'card_holder_name', type: 'text', label: 'CardHolderName'},  // translate##CardHolderName##
                {name: 'expiration_year', type: 'text', label: 'ExpirationYear', maxlength: 4},  // translate##ExpirationYear##
                {name: 'expiration_month', type: 'text', label: 'ExpirationMonth', maxlength: 2 },  // translate##ExpirationMonth##
                {name: 'cvc2', type: 'text', label: 'Cvc2', maxlength: 4}  // translate##Cvc2##
            ]
        }
    ]
});
CMS.constant('SkinWPConfig', {
    hiddenNewsCategoryIds: [113, 119],
    additionalSections: {
        tournament: {
            name: 'Tournaments', // translate##Tournaments##
            placement: 'other',   // if 'topmenu' top menu subitem will be added
            rootPageSlug: {
                'eng': 'tournament-eng',
                'rus': 'tournament-ru',
                'arm': 'tournament-arm'
            }
        }
    },
    poker: {
        newsPageSlug: {             // "News" page slug where news(posts) will be shown
            'rus': 'rules' //@TODO: remove after testing
        }
    },
    wpUrl: 'http://www.vbet.com/json',  // WordpResss instance serving pages, banners
    wpNewsUrl: {
        main: 'http://www.vbet.com/json'
    },  // WordpResss instance serving news
    wpBaseHost: 'www.vbet.com',  // this parameter will be passed to JSON api and all links in response(e.g. images) will have this host
    wpNewsBaseHost: 'www.vbet.com', // this parameter will be passed to JSON api and all links in NEWS response(e.g. images) will have this host
    seoFilesGenerationActive: true
});
CASINO.constant('SkinCConfig', {
    cUrlPrefix: 'https://casino.vbet.com',
    cGamesUrl: '/global/v-play.php',
    cUrl: '/global/casinoGamesLoad.php',
    main : {
        partnerID: '4',
        multiViewEnabled: true,
        filterByProviderEnabled: true,
        storedbonusPopUpLifetime: 259200000 // 3days
    },
    liveCasino: {
        viewStyle: 'SliderView'
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
