CASINO.constant('CConfig', {
    //
    cUrl: '/global/casinoGamesLoad.php',
    iconsUrl: '/global/img/games/gameIcons/gameIcons2/',
    bigIconsUrl: '/global/img/games/gameIcons/gameIcons3/',
    backGroundUrl: '/global/img/games/gameIcons/background/',
    winnersIconsUrl: '/global/img/extimg/',
    cGamesUrl: '/global/v-play.php',
    cUrlPrefix: 'http://casino.vbet.com',
    dataUrl: 'https://www.cmsbetconstruct.com/casino/',
    casinoDomain: 'http://games.vivarobet.am',
    bonusPopUpUrl: '', //for example: 'http://www.youtube.com/embed/ft6pQz_9S6M?rel=0&autoplay=1&controls=1'

    main: {
        newCasinoDesign: {
            enabled: false
        },
        enableGameInfoButton: false, //implemented only for casinoVersion:2
        maxVisibleCategories: 5, //maximum number of categories visible in explorer (the rest will go in "more" block)
        maxVisibleCategoriesWide: 10,//maximum number of categories visible in explorer in wide screen mode (the rest will go in "more" block)
        moreColumnNumber: 6, //number of columns in categories  "more" dropdown block
        numberOfRecentGames: 20, //initial number of recent games to show.  When newCasinoDesign is enabled change this value to be 3X
        numberOfRecentGamesWide: 28, //initial number of recent games to show in wide screen mode.  When newCasinoDesign is enabled change this value to be 5X
        increaseBy: 15, // load this number of additional games when clicking "load more".   When newCasinoDesign is enabled change this value to be 3X
        increaseByWide: 15, // load this number of additional games when clicking "load more".  When newCasinoDesign is enabled change this value to be 5X
        partnerID: '13', // partner ID
        popularGamesID: 'PopularGames', // popular games ID
        topSlotsID: 'TopSlots', // top slots ID
        showAllGamesOnHomepage: false,
        multiViewEnabled: false,
        fourGameViewEnable: true,
        filterByProviderEnabled: true,
        funModeEnabled: true,// enable/disable fun mode
        realModeEnabled: true, // enable/disable real playing mode
        providersThatHaveNotFunMode: ['MTG'],
        providersThatWorkWithSwarm: ['GNI', 'HBN', 'PTG', 'PSN', 'NYX', 'ASG', 'MGS', 'KLG', 'VGS'],
        providersCustomMessages: {
            NET: {
                message: '(NET) Please be informed that some IP addresses are blocked.',
                timeDelay: 604800000
            }
        },
        categoriesThatHaveNotFunMode: ['Progressive'],
        downloadEnabled: true,// enable/disable client download option
        storedbonusPopUpLifetime: 86400000, // 1 day: timestamp in milisecond
        categories: [
            51, //videoslot
            65, //New
            39, //FilmSlot
            46, //InstantWin
            28, //LiveDealer
            35, //VirtualBetting
            4,  //PopularGames
            36, //SkillGames
            17, //TableGames
            1,  //TopSlots
            40, //VideoPoker
            44  //OtherGames
        ],
        filterByCategory: ["28", "36", "23"],
        filterByProvider: [],
        biggestWinners: {
            topWinners: true,
            lastWinners: true,
            defaultMode: 'fun'
        },
        topBanners: {
            showSlider: true,
            showPopularGameBanner: true,
            showBannerInsteadWinners: false,
            showBannerInsteadOfBiggestWinners: true,
            showBiggestWinners: false
        }
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
        lcGameUrlPrefix: '//rgs-livedealerwebserver.',
        provider: "VGS",
        lobbyGroupsMap: {
            '102': 1,
            '101': 2,
            '103': 3,
            '104': 4,
            '105': 3,
            '106': 4,
            '107': 1
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
        categoryName: "SkillGames"
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
    shashki: {
        id: "3991",
        gameID: "VGSshashki",
        externalID: '88',
        provider: 'VGS',
        redirectOnGame: true,
        initialSize: {
            width: '1600',
            height: '900'
        }
    },
    pokerklas: {
        id: "",
        gameID: "",
        externalID: '2',
        provider: 'KLG',
        downloadLink: "http://qtupdate.klasnetwork.com/windows/installers/268/2d/setup.exe",
        downloadLinkMac: "http://qtupdate.klasnetwork.com/mac/installers/268/2d/MarsBet.pkg"
    },
    poker: {
        front_game_id: 'VGSPoker',
        id: "VGSPoker",
        gameCategory: 'SkillGames',
        gameID: "VGSPoker",
        externalID: '',
        gameProvider: 'VGS',
        gameName: 'Poker',
        name: 'Poker',
        gameType: {
            isDownloadClient: 1,
            realPlay: 0,
            ratio: "16:9",
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
    }
});
