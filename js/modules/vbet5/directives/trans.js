/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:trans
 * @description Translates element inner html or attributes (placeholder, title) using  {@link vbet5.service:Translator Translator} service
 *
 * @param {String} trans
 * if value is 'attr-only', only attributes will be translated
 * (this is needed when element contains other tags inside and we don't want to break it by trying to translate)
 * @param {String} [context].  Optional.  Does nothing on JS side.
 * When generating translation PO files value of this attribute will be written as string comment
 * to help translators understand the context of string being translated
 */
VBET5.directive('trans', [ 'Translator', function (Translator) {
    'use strict';
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {

            var hasInnerHtml = !(element[0].nodeName && ['input', 'img', 'br', 'hr', 'link', 'meta'].indexOf(element[0].nodeName.toLowerCase()) !== -1);

            var placeholders;
            if (attrs.placeholders) {
                placeholders = attrs.placeholders.split('|');
            }

            if (attrs.trans !== 'attr-only' && hasInnerHtml) {
                element.html(Translator.get(element.html(), placeholders));
            }

            // Translate attributes as well
            angular.forEach(['placeholder', 'title', 'data-intro'], function (attrName) {
                var attrValue = element.attr(attrName);
                if (attrValue && attrValue.length > 0) {
                    element.attr(attrName, Translator.get(attrValue, placeholders));
                }
            });


        }
    };
}]);
