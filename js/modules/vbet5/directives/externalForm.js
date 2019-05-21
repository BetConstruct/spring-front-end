/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:externalForm
 * @description creates external form (that will be submitted to external URL in new window)
 *
 * @param {Expression} params params model (object containing form options and fields)
 * Example:
 *
 *          {
 *           action: 'https://www.moneybookers.com/app/payment.pl',
 *           method: 'post',
 *           fields: [
 *               { name: "pay_to_email", value: "usd@betconstruct.com"},
 *               { name: "recipient_description", value: "Vbet.com"}
 *           ]
 *          }
 * @param {Expression} [additional-fields] optional. Array of additional form fields
 * @param {Expression} [target] optional. Form target
 * @param {String} [button-captionform submit button label
 * @param {Function} [on-submit] optional. Callback function that will be called when form submit button clicked.
 * A callback function that submits the form will be passed to this function as parameter
 */
VBET5.directive('externalForm', ['$sce', '$window', function ($sce, $window) {
    'use strict';

    return {
        restrict: 'E',
        replace: true,
        scope: {
            params: '=',
            additionalFields: '=',  //optional
            onSubmit: '=',
            buttonCaption: '@',
            formTarget: "@formTarget"
        },

        // translate##Confirm## this template is not parsed by translation generation script
        template:
            '<form ng-model="externalFormModel" ng-submit="onSubmit(submitFunc)"  target="{{formTarget}}" novalidate id="{{formId}}" action="{{action}}" method="{{params.method || \'post\'}}">' +
            '<input ng-repeat="field in params.fields" name="{{field.name}}" type="hidden" value="{{field.value}}" ng-if="field.type == undefined || field.type == \'hidden\' ">' +
            '<qrcode ng-repeat="field in params.fields" data="{{field.value}}" size="{{field.size || 150}}" ng-if="field.type == \'qrcode\'"></qrcode>' +
            '<input ng-repeat="field in additionalFields" name="{{field.name}}" type="hidden" value="{{field.value}}">' +
            '<button type="submit"  class="button-confirm {{buttonCaption}}" id="external-form-confirm-btn" ng-bind="buttonCaption|translate"></button>' +
            '</form>',
        link: function (scope) {
            scope.formId = 'form' + new Date().getTime();
            scope.submitFunc = function () {
                $window.document.getElementById(scope.formId).submit();
            };
            scope.formTarget = scope.formTarget && scope.formTarget.length ? scope.formTarget : '_blank';
            scope.action = $sce.trustAsResourceUrl(scope.params.action);
        }
    };
}]);
