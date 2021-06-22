CASINO.constant('CConfig', {
    //
    version: 2,
    cUrl: '/global/casinoGamesLoad.php',
    iconsUrl: '/global/img/games/gameIcons/gameIcons2/',
    bigIconsUrl: '/global/img/games/gameIcons/gameIcons3/',
    backGroundUrl: '/global/img/games/gameIcons/background/',
    winnersIconsUrl: '/global/img/extimg/',
    gamesUrl: '/authorization.php',
    cUrlPrefix: 'http://casino.vbet.com',
    dataUrl: 'https://www.cmsbetconstruct.com/casino/',
    casinoDomain: 'http://games.vivarobet.am',
    bonusPopUpUrl: '', //for example: 'http://www.youtube.com/embed/ft6pQz_9S6M?rel=0&autoplay=1&controls=1'
    deviceTypeId: 1,
    platformType: 0,
    main: {
        jackpotSliderVisibleGamesCount: 3, // min 1 - max 10
        enableGameInfoButton: false,
        categoriesLimit: 10, //number of categories visible in casino page
        moreColumnNumber: 6, //number of columns in categories  "more" dropdown block
        numberOfRecentGames: 20, //initial number of recent games to show.  When newCasinoDesign is enabled change this value to be 3X
        numberOfRecentGamesWide: 28, //initial number of recent games to show in wide screen mode.  When newCasinoDesign is enabled change this value to be 5X
        loadMoreCount: 24, // load this number of additional games when clicking "load more"
        partnerID: '13', // partner ID
        popularGamesID: 'PopularGames', // popular games ID
        topSlotsID: 'TopSlots', // top slots ID
        showAllGamesOnHomepage: false,
        multiViewEnabled: false,
        fourGameViewEnable: true,
        filterByProviderEnabled: true,
        licenseLogo: { // shows license logo on the opposite side of the deposit button
            enabled: false,
            href: ''
        },
        gameIframeInitialTab: 'jackpots',
        enableConfirmationBeforeCloseGame: false, // Popup while closing the game(slots, skill games, games, backgammon, belote.... etc )
        funModeEnabled: 1,// enable/disable fun mode.  0 - disable for all users, 1 - enable for all users, 2 - enable for logged in users, 3 - enable for verified users
        realModeEnabled: true, // enable/disable real playing mode
        providersThatHaveNotFunMode: ['MTG'],
        providersThatWorkWithSwarm: ['KLG', 'VGS'],
        providersCustomMessages: {
            NET: {
                showForCountries: ['FR', 'IT', 'DZ', 'EC', 'ID', 'IR', 'MM', 'AF', 'AL', 'AO', 'KH', 'GY', 'IQ', 'KW', 'LA', 'NA', 'NI', 'KP', 'PK', 'PA', 'PG', 'SD', 'SY', 'UG', 'YE', 'ZW'],
                message: '(NET) Please be informed that some IP addresses are blocked.',
                timeDelay: 604800000
            }
        },
        myGamesToShow: {
            wideScreenOn: 6,
            wideScreenOff: 6
        },
        categoriesThatHaveNotFunMode: ['Progressive'],
        downloadEnabled: true,// enable/disable client download option
        storedbonusPopUpLifetime: 86400000, // 1 day: timestamp in milisecond
        filterByProvider: [],
        biggestWinners: {
            topWinners: true,
            lastWinners: true,
            defaultMode: 'fun'
        },
        topBanners: {
            showSlider: true,
            showPopularGameBanner: true,
            showPopularGameBannerDoubleSize: false,
            showBannerInsteadWinners: false,
            showBannerInsteadOfBiggestWinners: true,
            showBiggestWinners: false
        }
    },
    disableMenuCollapsingInSpecialGames: false,
    bonusBalanceUnderGame: {
        enabled: false
    },
    login: {
        enable: true,
        url: '/global/partners/rml.php',
        timeout: 60000, // in milliseconds,
        retries: 10, //number of retries in case of fail
        retryTimeout: 1000 // in milliseconds, will be increased by itself on each retry
    },
    balance: {
        url: '/global/cashier/cashier.php',
        timeout: 10000 // in milliseconds
    },
    homepage: [

        {  // row
            order: 0,
            // class: "",
            // height: "",
            items: [
                {  // row item
                    order: 1,
                    // height: "",
                    class: "size-9",
                    // sliderSlug: "",
                    widgetName: "casinoMainSlider"
                },
                {
                    order: 1,
                    // height: "",
                    class: "size-3",
                    // sliderSlug: "",
                    widgetName: "jackpotTournamentWidget"
                }
            ]
        },
        {  // row
            order: 1,
            // class: "",
            // height: "",
            items: [
                {  // row item
                    order: 0,
                    class: "size-9",
                    subRows: [
                        {  // item sub row
                            order: 1,
                            // height: "",
                            // class: "",
                            // sliderSlug: "",
                            widgetName: "casinoJackpotSlider"
                        }, {
                            order: 2,
                            // height: "",
                            // class: "",
                            // sliderSlug: "",
                            widgetName: "casinoJackpotGamesSlider"
                        }]
                },
                {
                    order: 1,
                    // height: "",
                    class: "size-3",
                    // sliderSlug: "",
                    widgetName: "winnersWidget"
                }
            ]
        },
        {  // row
            order: 2,
            // class: "",
            // height: "",
            items: [
                {  // row item
                    order: 0,
                    // height: "",
                    class: "size-12",
                    // sliderSlug: "",
                    widgetName: "categoriesWidget"
                }

            ]
        },
        {  // row
            order: 3,
            // class: "",
            // height: "",
            items: [
                {  // row item
                    order: 0,
                    // height: "",
                    class: "size-12",
                    // sliderSlug: "",
                    widgetName: "providersWidget"
                }

            ]
        },
        {  // row
            order: 4,
            // class: "",
            // height: "",
            items: [
                {  // row item
                    order: 0,
                    // height: "",
                    class: "size-12",
                    // sliderSlug: "",
                    widgetName: "gamesWidget"
                }

            ]
        }
    ],
    tournaments: {
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
    jackpot: {
        url_prefix: 'http://casino.vivarobet.am',
        url: '/jackpot/getJackpotData.php',
        partner_id: '1'
    },
    liveCasino: {
        categoryId: "28",
        categoryName: "LiveDealer",
        //viewStyle: '3DView', // 3DView / ClassicView / SliderView
        view3DEnabled: false,  // the old config for liva casino view (if view3DEnabled = true then page has 3D view if view3DEnabled = false then page has viewStyle view)
        view3DBannersRotationPeriod: 5000,
        hiddenGamesIds: ['4015', '4821'],
        lcGameUrlPrefix: '//rgs-livedealerwebclient.',
        provider: "VGS",
        lobbyGroupsMap: {
            '102': 1,
            '101': 2,
            '103': 3,
            '104': 4,
            '105': 3,
            '106': 4,
            '107': 1,
            '108': 3,
            '110': 1,
            '112': 2,
            '113': 4,
            '114': 9,
            '118': 5,
            '119': 5,
            '121': 13,
            '123': 3,
            '125': 6,
            '126': 3,
            '129': 7,
            '130': 10,
            '131': 8,
            '132': 11,
            '133': 1,
            '134': 12,
            '138': 13,
            '141': 7,
            '3001056': 11,
            '3001057':1,
            '10412121': 9,
            '10412122': 10
        },
        liveDealersPhotosUrl: "http://websitelivegames-am.betconstruct.com/Content/Images/DealerPhotos/",
        liveDealersPhotosUrlVersion2: "http://rgs-livedealerwebserver.betconstruct.int/content/dealers/",
        games: {
            roulette: {id: "558", externalID: "102"},
            blackjack: {id: "504", externalID: "101"},
            baccarat: {id: "678", externalID: "103"},
            betOnPoker: {id: "598", externalID: "104"},
            betOnBaccarat: {id: "1637", externalID: "105"},
            russianPoker: {id: "2855", externalID: "106"},
            fortuna: {id: "2863", externalID: "107"},
            draw: {id: "1291", externalID: "8004"},
            keno: {id: "1541", externalID: "8006"}
        },
        jackpot: {
            showPopUp: true,
            url: 43622, //TEMPORARY
            storedPopUpLifetime: 432000 // = 2h
        }
    },
    virtualBetting: {
        categoryId: "35",
        categoryName: "VirtualBetting"
    },
    skillGames: {
        categoryId: "36",
        categoryName: "SkillGames",
        hideTopSlider: true
    },
    popularGames: {
        categoryId: '179',
        categoryName: 'Popular Games'
    },
    topSlots: {
        categoryId: '178',
        categoryName: ''
    },
    fantasySports: {
        gameID: "VGSFantasySport",
        externalID: '55',
        provider: "VGS"
    },
    ogwil: {
        id: "1314",
        gameID: "ASG1000",
        externalID: '116',
        provider: "ASG"
    },
    financials: {
        gameID: "VGSFinancials",
        externalID: '15',
        provider: "VGS"
    },
    belote: {
        id: "547",
        gameID: "VGSBELOTE",
        externalID: '10',
        provider: 'VGS',
        initialSize: {
            width: '975',
            height: '645'
        }
    },
    deberc: {
        id: "595",
        gameID: "VGSDeberc",
        externalID: '24',
        provider: 'VGS',
        initialSize: {
            width: '975',
            height: '645'
        }
    },
    backgammon: {
        id: "599",
        gameID: "VGSnardi",
        externalID: '11',
        provider: 'VGS',
        initialSize: {
            width: '1600',
            height: '900'
        }
    },
    checkers: {
        id: "3991",
        gameID: "VGSshashki",
        externalID: '88',
        provider: 'VGS',
        initialSize: {
            width: '1600',
            height: '900'
        }
    },
    csbPoolBetting: {
        gameID: "CSB1",
        provider: "CSB",
        externalID: "152000"
    },
    pokerklas: {
        id: "",
        gameID: "",
        externalID: '3100002',
        provider: 'KLG',
        downloadLink: "http://qtupdate.klasnetwork.com/windows/installers/268/2d/setup.exe",
        downloadLinkMac: "http://qtupdate.klasnetwork.com/mac/installers/268/2d/MarsBet.pkg"
    },
    ggpoker: {
        id: "",
        gameID: "",
        externalID: '154000',
        provider: 'GG Network',
        downloadLink: "http://dlportal.sdock.net/installer/ggpokersite?btag1=betc",
        downloadLinkMac: "http://dlportal.sdock.net/installer/osx/ggpokersite/en?btag1=betc"
    },
    poker: {
        front_game_id: 'VGSPoker',
        id: "5639",
        provider: 'VGS',
        gameCategory: 'SkillGames',
        gameID: "VGSPoker",
        externalID: '28',
        gameProvider: 'VGS',
        gameName: 'Poker',
        name: 'Poker',
        initialSize: {
            height: 1,
            width: 2
        },
        gameType: {
            isDownloadClient: 1,
            realPlay: 0,
            playForFun: 0
        }
    },
    chinesePoker: {
        id: "1540",
        gameID: "VGSchPoker",
        provider: 'VGS',
        externalID: "44"
    },
    miniGames: {
        rotationPeriod: 15000,
        games: [
            {id: "ASG22", provider: "ASG", externalID: '3035'}
        ]
    },
    vrcasino: {
        id: "6490"
    },
    vrlivedealer: {
        id: "8013"
    },
    blast: {
        externalID: "5000000",
        id: "11870"
    },
    wonderWheel: {}
});
