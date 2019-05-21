/**
 * @ngdoc controller
 * @name CMS.controller:twitterController
 * @description
 * Static pages controller
 */
angular.module('CMS').controller('twitterController', ['$location', '$scope', '$http', 'WPConfig', 'Config', 'Translator', 'TimeoutWrapper', function ($location, $scope, $http, WPConfig, Config, Translator, TimeoutWrapper) {
    'use strict';

    $scope.globalConfig = Config;
    $scope.WPConfig = WPConfig;
    TimeoutWrapper = TimeoutWrapper($scope);

    function getActiveConfigForTwitterFeed () {
        var config = {};

        Config.main.twitterFeed.tabs.forEach(function (tabConfig) {
            if (tabConfig['active']) {
                config = tabConfig;
                return;
            }
        });

        return config;
    }

    /**
     * @ngdoc method
     * @name getTwitterFeed
     * @methodOf CMS.service:content
     * @description returns promise which will be resolved with object containing twitter feeds
     *
     * @param {String} username twitter screen name of user to get tweets of
     * @param {Number} [count] count of tweets to get
     * @returns {Object} promise
     */
    function getTwitterFeed(data) {
        var countParam = data.count ? '&count=' + data.count : '';
        var hashtagParam = data.hashtag ? '&hashtag=' + data.hashtag : '';
        var usernameParam = data.username ? '&username=' + data.username : '';
        var geocodeParam = data.geocode ? '&geocode=' + data.geocode : '';
        var noCacheParam = '&r=' + new Date().getTime() + Math.random() * 10;
        var slug = '&slug=' + data.slug;
        var wpUrl = Config.main.cmsDataDomain ? Config.main.cmsDataDomain + '/json' : WPConfig.wpUrl;
        return $http.get(
            WPConfig.twitterUrl +
            '?json=get-twitter-feed' + 
            (wpUrl.split(":/")[0].toLowerCase() === 'https' ? "&ssl=1" : "") +
            countParam + 
            hashtagParam +
            usernameParam +
            geocodeParam +
            noCacheParam +
            slug
        );
    }

    /**
     * @ngdoc method
     * @name loadTwitterFeed
     * @methodOf CMS.controller:twitterController
     * @description loads tweets in **tweets** scope array
     * @param {Number} [count] number of tweets to load, if not specified default number will be loaded
     */
    $scope.loadTwitterFeed = function loadTwitterFeed(data) {
        var requestData = {};
        data = data || getActiveConfigForTwitterFeed();

        $scope.tweeterFeedLoadComplete = false;
        $scope.tabs = Config.main.twitterFeed.tabs;

//         if ($location.path() !== '/') {
//             $timeout(function () {
//                 $scope.loadTwitterFeed(data);
//             }, Config.main.twitterFeed.refreshInterval);
//             return;
//         }

        requestData = {
            'hashtag': Config.main.twitterFeed.hashTag,
            'count': data['count'] || Config.main.twitterFeed.count,
            'slug': data['slug']
        };

        if (data['geocode']) {
            requestData['geocode'] = data['geocode'];
        }

        getTwitterFeed(requestData).then(function (response) {
            $scope.tweets = [];
            angular.forEach(response.data, function (tweet) {
                if (tweet.created_at && tweet.created_at.split) {
                    var v = tweet.created_at.split(' ');
                    var parseDate = new Date(Date.parse(v[1] + " " + v[2] + ", " + v[5] + " " + v[3] + " UTC"));
                    var pieces = moment(parseDate).fromNow(true).split(' ');
                    tweet.created_at = (isNaN(parseInt(pieces[0])) ? Translator.get('now') : pieces[0] + pieces[1][0]);
                    $scope.tweets.push(tweet);
                }
            });

            $scope.activeTweetIndex = 0;
            $scope.tweeterFeedLoadComplete = true;

            TimeoutWrapper(function () {
                $scope.loadTwitterFeed(data);
            }, Config.main.twitterFeed.refreshInterval);
        });
    };

    /**
     * @ngdoc method
     * @name nextTweet
     * @methodOf CMS.controller:twitterController
     * @description selects next tweet to display
     * @param {Number} direction direction in which to select news feed. if positive=newer, negative=older
     */
    $scope.nextTweet = function nextTweet(direction) {
        $scope.activeTweetIndex += (1 - (direction < 0) * 2);
        $scope.activeTweetIndex = $scope.activeTweetIndex < 0 || $scope.activeTweetIndex >= $scope.tweets.length ? 0 : $scope.activeTweetIndex;
    };

    $scope.selectTab = function selectTab(tabToSelect) {
        var params = {};

        $scope.tabs.forEach(function (tab) {
            tab.active = false;

            if (tab.title === tabToSelect.title) {
                tab.active = true;
            }
        });

        if (tabToSelect['geocode']) {
            params['geocode'] = tabToSelect['geocode'];
        }

        if (tabToSelect['slug']) {
            params['slug'] = tabToSelect['slug'];
        }

        $scope.loadTwitterFeed(params);
    };
}]);