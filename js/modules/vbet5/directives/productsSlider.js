/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:productsSlider
 * @description products sliders
 */
VBET5.directive('productsSlider', ['$rootScope', '$sce', 'Translator', 'content', function ($rootScope, $sce, Translator, content) {
    'use strict';
    return {
        restrict: 'E',
        templateUrl: 'templates/directive/productsSlider.html',
        scope: {},
        link: function (scope, e, attr) {
            scope.banners = [];
            /**
             * @ngdoc method
             * @methodOf CMS.directive:productsSlider
             * @description   populates scope's **banner** variable with banner information got from cms
             *
             */

            scope.loading = true;
            var slugProcessed = (attr.slug || 'products-banners') + '-' + $rootScope.env.lang;
            slugProcessed = slugProcessed.replace('{lang}', $rootScope.env.lang);

            content.getWidget(slugProcessed).then(function (response) {
                if (response.data && response.data.widgets && response.data.widgets[0]) {
                    var banners = [];
                    angular.forEach(response.data.widgets, function (widget) {
                        widget.instance.custom_fields.label && (widget.instance.custom_fields.label[0] = $sce.trustAsHtml(Translator.get(widget.instance.custom_fields.label[0])));
                        widget.instance.trustedTitle = $sce.trustAsHtml(widget.instance.title);
                        banners.push(widget.instance);
                    });

                    scope.banners = banners;
                }
            })['finally'](function () {
                scope.loading = false;
            });
        }
    };
}]);