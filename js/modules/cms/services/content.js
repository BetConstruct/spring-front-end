/* global CMS */
/**
 * @ngdoc service
 * @name CMS.service:content
 * @description
 *  provides methods for getting content from CMS.  Currnetly it's WordPress with JSON API plugin
 */
CMS.service('content', ['WPConfig', 'Config', '$http', '$rootScope', '$location', 'Geoip', function (WPConfig, Config, $http, $rootScope, $location, Geoip) {
    'use strict';
    var content = {};

    var lang = $rootScope.env.lang;
    var newsLang = WPConfig.wpNewsLanguageMap && WPConfig.wpNewsLanguageMap[lang] || $rootScope.env.lang;

    var excludedFields = '&exclude=author,excerpt,comments,comment_status,comment_count,tags,attachments';
    var tags = WPConfig.wpNewsUrl[lang] ? '' : '&tag=global,' + (WPConfig.newsTag || $rootScope.conf.skin.replace('.', '-')); // this filters posts not to get posts for other skins

    var WP_URL = Config.main.cmsDataDomain ? Config.main.cmsDataDomain + '/json' : WPConfig.wpUrl;
    var newsUrl = Config.main.cmsDataDomain ? Config.main.cmsDataDomain + '/json' : WPConfig.wpNewsUrl[lang] || WPConfig.wpNewsUrl.main;
    var newsBaseHost = WPConfig.wpNewsUrl[lang] ? WPConfig.wpNewsUrl[lang].match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/)[2] : WPConfig.wpNewsBaseHost[Config.env.lang] || WPConfig.wpNewsBaseHost['main'] || WPConfig.wpNewsBaseHost;
    var wpBaseHost = WPConfig.wpBaseHost[$location.host()] || WPConfig.wpBaseHost['default'] || WPConfig.wpBaseHost;

    var countryQuery = '';
    $rootScope.geoDataAvailable = $rootScope.geoDataAvailable || Geoip.getGeoData(false);
    $rootScope.geoDataAvailable.then(function (data) {
        if (data && data.countryCode) {
            countryQuery = '&country=' + data.countryCode;
        }
    });

    /**
     * @ngdoc method
     * @name addHttpsFlag
     * @methodOf CMS.service:content
     * @description returns ssl=1& string if URL is https, empty string otherwise
     *
     * @returns {String}
     */
    function addHttpsFlag(url) {
        return url.split(":/")[0].toLowerCase() === 'https' ? "&ssl=1" : "";
    }

    /**
     * @ngdoc method
     * @name getSports
     * @methodOf CMS.service:content
     * @description returns promise which will be resolved  with list of sports for which we have news
     *
     * @returns {Object} promise
     */
    content.getSports = function getSports() {

        return $http.get(newsUrl + '?base_host=' + newsBaseHost + addHttpsFlag(newsUrl) + '&json=get_category_index&lang=' + newsLang + '&parent=' + (WPConfig.news.langRootCategories[lang] ||  WPConfig.news.langRootCategories.eng) + countryQuery);
    };


    /**
     * @ngdoc method
     * @name getRecentNews
     * @methodOf CMS.service:content
     * @description returns promise which will be resolved with object containing recent news
     *
     * @param {Number} offset start
     * @param {Number} count number of news to request
     * @param {String} categoryName category slug
     * @param {String} [customNewsUrl] optional.  json interface URL to use
     *
     * @returns {Object} promise
     */
    content.getRecentNews = function getRecentNews(offset, count, categoryName, customNewsUrl) {
        var customNewsBaseHost;
        if (customNewsUrl) {
            customNewsBaseHost = customNewsUrl.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/)[2];
        }
        var rootCategory = WPConfig.news.langRootCategories[lang] ||  WPConfig.news.langRootCategories.eng; //select english if we don't have category for news in selected language
        var offsetStr = offset === undefined ? '' : '&offset=' + parseInt(offset, 10),
            countStr = count === undefined ? '' : '&limit=' + parseInt(offset + count, 10),
            categoryStr = categoryName === undefined ? '&cat=' + rootCategory : '&tag=' + categoryName;
        var requestUrl = customNewsUrl || newsUrl;
        return $http.get(requestUrl + '?base_host=' + (customNewsBaseHost || newsBaseHost) + addHttpsFlag(requestUrl) + '&json=get_recent_posts&lang=' + newsLang +  offsetStr + countStr + categoryStr + countryQuery + excludedFields);
    };


    /**
     * @ngdoc method
     * @name getPostsByCategorySlug
     * @methodOf CMS.service:content
     * @description returns promise which will be resolved with object containing posts of specified category
     *
     * @param {String} categorySlug category slug
     * @param {Number} [count] optional. number of posts. if not specified , all will be loaded
     * @param {Boolean} [includeTagInRequest] optional. default is true. whether to include post tag in request(to filter by skin)
     * @param {String} [customNewsUrl] optional.  json interface URL to use
     * @param {String} [customBaseHost] optional.  json interface
     * @returns {Object} promise
     */
    content.getPostsByCategorySlug = function getPostsByCategorySlug(categorySlug, categoryJsonType, count, includeTagInRequest, customNewsUrl, customBaseHost) {
        var customNewsBaseHost;
        if (customNewsUrl) {
            customNewsBaseHost = customNewsUrl.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/)[2];
        }
        parseInt(Config.main.site_id) === 1 && (customBaseHost = wpBaseHost); //@TODO it must be revert after wp cleanup
        includeTagInRequest = includeTagInRequest === undefined ? true : includeTagInRequest;
        var countStr = count === undefined ? '' : '&count=' + (parseInt(count, 10) || count);
        var requestUrl = customNewsUrl || newsUrl;
        var jsonCategoryType = categoryJsonType || 'get_category_posts';
        return $http.get(requestUrl + '?base_host=' + (customBaseHost || customNewsBaseHost || newsBaseHost) + addHttpsFlag(requestUrl) + '&json=' + jsonCategoryType + '&lang=' + Config.env.lang + '&category_slug=' + categorySlug + countStr + countryQuery + excludedFields + (includeTagInRequest ? tags : ''));
    };
    /**
     * @ngdoc method
     * @name getNewsById
     * @methodOf CMS.service:content
     * @description returns promise which will be resolved with object containing news
     *
     * @param {string} id  news id
     * @param {string} [secret]  optional. a secret to get post content if it's draft (used for preview by editors)
     * @returns {Object} promise
     */
    content.getNewsById = function getNewsById(id, secret) {
        return $http.get(newsUrl + '?base_host=' + newsBaseHost + addHttpsFlag(newsUrl) + '&json=get_post&lang=' + newsLang + '&id=' + id + (secret ? '&secret=' + secret : '')  + excludedFields);
    };

    /**
     * @ngdoc method
     * @name getWidget
     * @methodOf CMS.service:content
     * @description returns promise which will be resolved with object containing banner parameters
     *
     * @param {string} sidebarId  optional. id of sidebar to get banner for
     * @returns {Object} promise
     */
    content.getWidget = function getWidget(sidebarId) {
        sidebarId = content.getSlug(sidebarId);
        sidebarId = sidebarId || 'sidebar-1';
        var url = WP_URL + '?base_host=' + wpBaseHost +  addHttpsFlag(WP_URL) + '&lang=' + Config.env.lang + '&json=widgets/get_sidebar&sidebar_id=' + sidebarId + countryQuery;
        return $http.get(url, {cache: true});
    };

    content.getWidgetData = function getWidgetData (sidebarId) { // All CMS widget calls should be done through this function instead of getWidget after CMS part is ready
        sidebarId = content.getSlug(sidebarId);
        sidebarId = sidebarId || 'sidebar-1';
        var url = WP_URL + '?base_host=' + wpBaseHost +  addHttpsFlag(WP_URL) + '&lang=' + Config.env.lang + '&json=' + sidebarId + countryQuery;
        return $http.get(url, {cache: true});
    };

    /**
     * @ngdoc method
     * @name getPage
     * @methodOf CMS.service:content
     * @description returns promise which will be resolved with object containing page data
     *
     * @param {string} slug  page slug
     * @param {boolean} withChildren  true to include page children
     * @param {boolean} cache  whether to cache response
     * @returns {Object} promise
     */
    content.getPage = function getPage(slug, withChildren, cache) {
        slug = content.getSlug(slug);
        withChildren = withChildren || false;
        cache = cache || false;
        var childrenParam = withChildren ? '&children=1' : '';
        var url = WP_URL + '?base_host=' + wpBaseHost +  addHttpsFlag(WP_URL) + '&lang=' + Config.env.lang + '&json=get_page&slug=' + slug + childrenParam + countryQuery + excludedFields;
        return cache ? $http.get(url, {cache: true}) : $http.get(url);
    };

    /**
     * @ngdoc method
     * @name getPopups
     * @methodOf CMS.service:content
     * @description returns promise which will be resolved with object containing page data
     *
     * @param {string} slug  page slug
     * @param {boolean} withChildren  true to include page children
     *
     * @returns {Object} promise
     */
    content.getPopups = function getPopups() {
        var url = WP_URL + '?base_host=' + wpBaseHost +  addHttpsFlag(WP_URL) + '&lang=' + Config.env.lang + '&json=get_popup' + countryQuery + excludedFields;
        return $http.get(url);
    };

    /**
     * @ngdoc method
     * @name getJSON
     * @methodOf CMS.service:content
     * @description returns promise which will be resolved with object containing json data
     *
     * @param {string} url
     * @param {Object} data if not set its a get request
     * @returns {Object} promise
     */
    content.getJSON = function getJSON(url, data) {
        return $http({
            method: data ? 'POST' : 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            url: url,
            data: data

        });
    };

    /**
     * @ngdoc method
     * @name getSlug
     * @methodOf CMS.service:content
     * @description returns promise which will be resolved with object containing json data
     *
     * @param {string} slug name Example: "help.popupPageSlugs"
     * @returns {string} posible slug name
     * @returns {string} empty slug returned if not found
     */
    content.getSlug = function getSlug (slugName, emptySlug) {
        if (emptySlug === undefined) {
            emptySlug = slugName;
        }
        if (!slugName) {
            return emptySlug;
        }
        var nameParts = slugName.split('.'), slugObj;
        if (nameParts.length <= 1) {
            return emptySlug;
        }
        if (!WPConfig[nameParts[0]]) {
            return emptySlug;
        }
        slugObj = WPConfig[nameParts[0]][nameParts[1]];
        if (!slugObj) {
            return emptySlug;
        }
        return slugObj[Config.env.lang] || (slugObj.default && slugObj.default + '-' + Config.env.lang) || slugObj.eng || emptySlug;
    };

    /**
     * @ngdoc method
     * @name getPromotionCategories
     * @methodOf CMS.service:content
     * @description returns promotion menu categories
     */
    content.getPromotionCategories = function getPromotionCategories(){
        var url = WP_URL + '?base_host=' + wpBaseHost +  addHttpsFlag(WP_URL) + '&lang=' + Config.env.lang + '&ssl=1&json=promo' + countryQuery;
        return $http.get(url);

    };

    /**
     * @ngdoc method
     * @name getPromotionCategories
     * @methodOf CMS.service:content
     * @description returns promotion menu categories
     */
    content.getExchangeShopData = function getExchangeShopData(){
        var url = WPConfig.exchangeShopUrl + '?lang=' + Config.env.lang + '&partner_id=' + Config.main.site_id + countryQuery;
        return $http.get(url);

    };

    /**
     * @ngdoc method
     * @name getTermsAndConditions
     * @methodOf CMS.service:content
     * @description returns terms and conditions
     */
    content.getTermsAndConditions = function getTermsAndConditions(){
        var url = WPConfig.wpDirectUrl + '?base_host=' + wpBaseHost +  addHttpsFlag(WP_URL) + '&lang=' + Config.env.lang + '&json=general-terms-and-conditions' + countryQuery;
        return $http.get(url);

    };

    return content;
}]);
