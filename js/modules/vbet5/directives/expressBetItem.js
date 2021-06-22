VBET5.directive('expressBetItem', ['$rootScope', '$filter', '$location', '$route', 'ConnectionService', 'MarketService', 'Utils', 'Config', 'Zergling', 'partner', 'Translator',
    function ($rootScope, $filter, $location, $route, ConnectionService, MarketService, Utils, Config, Zergling, partner, Translator) {
    'use strict';
        var ODD_TYPE_MAP = {
            'decimal': 0,
            'fractional': 1,
            'american': 2,
            'hongkong': 3,
            'malay': 4,
            'indo': 5
        };
       function getDisplayBase(base, marketType){
            if (!base) {
                return "";
            }

            if (marketType.indexOf("Handicap") > -1 && base > 0) {
                return  "+" + base;
            }

            return base;
        }
    return {
        restrict: 'E',
        templateUrl: 'templates/directive/express-bet-item.html',
        scope:{
            item: '=',
            notVisibleContainer: '='
        },
        link: function (scope) {
            scope.enableSigninRegisterLinks =  Config.partner.enableSigninRegisterCallbacks;
            scope.containsBlockedEvents = false;
            scope.maximumVisibleItems = Config.main.expressOfDay.maxVisibleItems;
            var connectionService = new ConnectionService(scope);
            var isCalculateTax = $rootScope.partnerConfig && {1:1, 0:1}[$rootScope.partnerConfig.tax_integration_type]&& ($rootScope.partnerConfig.tax_percent || ($rootScope.partnerConfig.tax_amount_ranges && $rootScope.partnerConfig.tax_amount_ranges.length)) && {1:1, 2:1, 20:1}[$rootScope.partnerConfig.tax_type];
            scope.taxOnStake = {};

            scope.taxOnStake.enabled = $rootScope.partnerConfig && $rootScope.partnerConfig.tax_percent && $rootScope.partnerConfig.tax_type === 4 && {0: true, 1:true}[$rootScope.partnerConfig.tax_integration_type];

            var subId = null;
            var matchIds = scope.item.Selections.map(function (item) {
                return item.MatchId;
            });
            var eventIds = scope.item.Selections.map(function (item) {
                return item.SelectionId;
            });
            var competitionIds = Utils.uniqueNum(scope.item.Selections.map(function (item) {
                return item.CompetitionId;
            }));
            var marketIds =  Utils.uniqueNum(scope.item.Selections.map(function (item) {
                return item.MarketId;
            }));
           var initialPriceMap = {};
            var request = {
                source: 'betting',
                what: {
                    sport: ['id'],
                    region: ['id'],
                    competition: ['id'],
                    game: ['id', 'team1_name', 'team2_name', 'sport_alias', 'region_alias', 'start_ts', 'is_live', 'is_blocked'],
                    market: ['id', 'name', 'display_key', 'base', 'type', 'home_score', 'away_score'],
                    event: ['id', 'name', 'price', 'sp_enabled', 'base', 'type_1']
                },
                where: {
                    game: {id: {'@in': matchIds}},
                    event: {id: {'@in': eventIds}},
                    competition: {id: {'@in': competitionIds}},
                    market: {id: {'@in': marketIds}}
                }
            };

            function formatMultipleOdd(value) {
                return Utils.formatDecimal(value, $rootScope.partnerConfig.price_round_method, ($rootScope.partnerConfig.multiple_price_decimals || 3));
            }

            function calculateExpressBonus(win, stake) {
                switch(scope.item.BonusType){
                    case 2:
                        return Utils.fixFloatError((win - stake) * scope.item.BonusPercent *  0.01);
                    case 1:
                        return Utils.fixFloatError(win * scope.item.BonusPercent *  0.01);

                }
            }

            scope.calculatePossibleWin = function calculatePossibleWin(){
                var stake = parseFloat(scope.stake);
                if (!stake) {
                    return;
                }
                if(scope.taxOnStake.enabled) {
                    var winAmount = scope.totalOdd * stake - stake;

                    scope.taxOnStake.tax = stake * ($rootScope.partnerConfig.tax_percent) / 100;
                    stake = stake - scope.taxOnStake.tax;
                    scope.taxOnStake.total = stake;
                    scope.taxOnStake.posWin = winAmount - (winAmount * $rootScope.partnerConfig.tax_percent)/100;
                    scope.taxOnStake.secondTax = 0; // resetting tax in case it's not in range anymore
                }
                var possibleWin = scope.totalOdd * stake;
                scope.possibleWin = possibleWin;
                if (scope.item.BonusPercent) {
                    scope.bonus = calculateExpressBonus(possibleWin, stake);
                    possibleWin += scope.bonus;
                }
                if (isCalculateTax) { // calculate only for tax_type 1,2,20
                    scope.tax = Utils.calculateTax(possibleWin, stake);
                    scope.tax = Utils.fixFloatError(scope.tax);
                    possibleWin = possibleWin  - ({1: 1, 2: 1}[$rootScope.partnerConfig.tax_type] ? scope.tax : 0);
                } else if (scope.taxOnStake.enabled && $rootScope.partnerConfig.tax_amount_ranges && $rootScope.partnerConfig.tax_amount_ranges.length === 1) {
                    // Double taxation case; Made for African partners
                    var range = $rootScope.partnerConfig.tax_amount_ranges[0];
                    var taxableAmount = range.type === 1 ? scope.taxOnStake.posWin - scope.taxOnStake.total : scope.taxOnStake.posWin;

                    if (taxableAmount > 0) {
                        var inRange = range.entire_amount ? taxableAmount >= range.from && taxableAmount < range.to : taxableAmount > range.from && taxableAmount <= range.to;
                        if (inRange) {
                            scope.taxOnStake.secondTax = taxableAmount * range.percent / 100;

                            if (scope.bonus > 0) {
                              possibleWin -= scope.taxOnStake.secondTax;
                            }
                        }
                    }
                }
                scope.finalPayout = possibleWin;
            };
            function handleUpdate(data) {
                scope.isTherePriceChange = false;
                var bets = [];
                angular.forEach(data.sport, function (sport) {
                    angular.forEach(sport.region, function (region) {
                        angular.forEach(region.competition, function (competition) {
                            angular.forEach(competition.game, function (gameData) {
                                var game = {
                                    gameId: gameData.id,
                                    sportId: sport.id,
                                    regionId: region.id,
                                    competitionId: competition.id,
                                    isLive: gameData.is_live,
                                    startTime: gameData.start_ts,
                                    team1Name: gameData.team1_name,
                                    team2Name: gameData.team2_name,
                                    sportAlias: gameData.sport_alias,
                                    regionAlias: gameData.region_alias
                                };
                                angular.forEach(gameData.market, function (market) {
                                    angular.forEach(market.event, function (event) {
                                        var bet = {
                                            game: game,
                                            market: {
                                                id: market.id,
                                                name: $filter('improveName')(market.name, gameData),
                                                displayKey: market.display_key,
                                                homeScore: market.home_score,
                                                awayScore: market.away_score
                                            },
                                            event: {
                                                id: event.id,
                                                price: event.price,
                                                blocked: gameData.is_blocked || $filter('oddConvert')(event.price, 'decimal') == 1,
                                                sp_enabled: event.sp_enabled,
                                                price_change: event.price_change,
                                                type1: event.type_1,
                                                base: getDisplayBase(event.base || market.base, market.type),
                                                name: MarketService.getEventName(event.name, market.type, market.name, gameData)
                                            }
                                        };
                                        scope.containsBlockedEvents = scope.containsBlockedEvents || bet.event.blocked;
                                        if (!initialPriceMap[event.id]) {
                                          initialPriceMap[event.id] = event.price;
                                        } else if(initialPriceMap[event.id] !== event.price) {
                                            scope.isTherePriceChange = true;
                                        }
                                        bets.push(bet);
                                    });
                                });


                            });
                        });
                    });
                });

                if (bets.length < scope.item.Selections.length) {
                    connectionService.unsubscribe(subId);
                    scope.notVisibleContainer.increaseCount(scope.item.Id);
                    return;
                }
                bets.sort(function (bet1, bet2){
                    return eventIds.indexOf(bet1.event.id) - eventIds.indexOf(bet2.event.id);
                });
                scope.allBets = bets;
                scope.bets = scope.allBets.slice(0, scope.maximumVisibleItems);
                scope.totalOdd = formatMultipleOdd(scope.allBets.reduce(function (result, bet){
                    return result * bet.event.price;
                }, 1));
                if ($rootScope.partnerConfig.max_odd_for_multiple_bet &&  scope.totalOdd > $rootScope.partnerConfig.max_odd_for_multiple_bet) {
                    scope.totalOdd = $rootScope.partnerConfig.max_odd_for_multiple_bet;
                    if (Config.betting.enableLimitExceededNotifications) {
                        scope.maxOddsWarningAmount = $rootScope.partnerConfig.max_odd_for_multiple_bet;
                    }
                }
                scope.calculatePossibleWin();


            }
            scope.loading = true;
            connectionService.subscribe(request, handleUpdate,  {
                'thenCallback': function (res) {
                    subId = res.subid;
                    scope.loading = false;
                },
                'failureCallback': function () {
                    scope.loading = false;
                }
            });

            scope.placeBet = function placeBet() {
               scope.errorMessage = undefined;
               scope.allBets.forEach(function (bet) {
                  initialPriceMap[bet.event.id] = bet.event.price;
              });
              scope.betInProgress = true;
              var request = {
                  bets: [
                      {
                          'Source': Config.betting.bet_source,
                          'Type': scope.item.BetType,
                          'Amount': parseFloat(scope.stake),
                          "AcceptTypeId":0,
                          "OddType": ODD_TYPE_MAP[Config.env.oddFormat],
                          "EachWay": false,
                          "PredefinedMultipleId": scope.item.Id,
                          "Events": scope.allBets.map(function (bet) {
                              return {
                                  "SelectionId": bet.event.id,
                                  "Coeficient": bet.event.sp_enabled? -1:bet.event.price
                              };
                          }),
                          "IsSuperBet":false

                      }
                  ]
              };
              Zergling.get(request, "create_bets").then(function (data) {
                  if (data.StatusCode === "0") {
                      Utils.setJustForMoment(scope, "successMessage", Translator.get("Your bet is accepted."), 2000);
                      scope.stake = undefined;
                  } else {
                      scope.errorMessage = Translator.get(data.Data.Message);
                  }
              })['finally'](function () {
                  scope.betInProgress = false;
              });
            };

            scope.getMaxBet = function getMaxBet() {
              scope.maxBetLoading = true;
              var request = {
                  type:2,
                  events: eventIds,
                  each_way: false
              };
              Zergling.get(request, 'get_max_bet').then(function (result) {
                  var maxResult =  result.details.amount;
                  maxResult = Config.main.onlyDecimalStakeAmount ? Math.floor(maxResult) : Utils.cuttingDecimals(maxResult, $rootScope.conf.balanceFractionSize);
                  scope.stake = maxResult;
                  scope.calculatePossibleWin();
              })['finally'](function () {
                  scope.maxBetLoading = false;
              });
            };


            scope.openPartnerDeposit = function openPartnerDeposit() {
                partner.call('deposit', 'betslip');
            };

            scope.openForm = function openForm($event, action) {
                $rootScope.$broadcast(action);
                $event.stopPropagation();
            };

            scope.toggleBets = function toggleBets() {
                if (scope.bets === scope.allBets) {
                    scope.bets = scope.allBets.slice(0, scope.maximumVisibleItems);
                } else  {
                    scope.bets = scope.allBets;
                }
            };


            /**
             * @ngdoc method
             * @name gotoBetGame
             * @methodOf betting.controller:betSlipController
             * @description  Navigates to Events game
             *
             * @param {Object} gamePointer game object
             */
            scope.gotoBetGame = function gotoBetGame(gamePointer) {
                if(gamePointer.gameId === $location.search().game) {
                    return;
                }

                var search = {
                    'type': gamePointer.isLive,
                    'sport': gamePointer.sportId,
                    'region': gamePointer.regionId,
                    'competition': gamePointer.competitionId,
                    'game': gamePointer.gameId
                };

                $location.search(search);

                var neededPath = Utils.getPathAccordintToAlias();

                if ($location.path() !== neededPath + '/') {
                    $location.path(neededPath);
                } else {
                    $route.reload();
                }
            };

        }

    };
}]);
