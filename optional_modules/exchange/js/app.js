// 'use strict';
// var app = angular
//   .module('exchange', [
//     'ngAnimate',
//     'ngRoute',
//     'ui.router'
//   ]);
// app.config(function ($stateProvider, $urlRouterProvider) {
//   $stateProvider
//     .state('exchange', {
//       url: "/exchange",
//       views: {
//         "leftMenu": {
//           controller: "leftMenu",
//           templateUrl: "../views/exchange.leftMenu.html"
//         },
//         "markets": {
//           controller: "markets",
//           templateUrl: "../views/exchange.markets.html"
//         },
//         "betSlip": {
//           controller: "betSlip",
//           templateUrl: "../views/exchange.betSlip.html"
//         }
//       }
//     })
//     .state('exchange.market', {
//       url: "/:sportId/:regionId/:competitionId/:gameId/",
//       views: {
//         "leftMenu": {
//           controller: "leftMenu",
//           templateUrl: "views/exchange.leftMenu.html"
//         },
//         "markets": {
//           controller: "markets",
//           templateUrl: "views/exchange.markets.html"
//         },
//         "betSlip": {
//           controller: "betSlip",
//           templateUrl: "views/exchange.betSlip.html"
//         }
//       }
//     });
//       $urlRouterProvider.otherwise("/exchange");
//   });
