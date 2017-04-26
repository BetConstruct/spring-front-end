/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:fbLike
 * @description directive for social sharing
 *
 */
VBET5.directive('socialShare',  ['$rootScope', '$window', '$http', 'Config', function ($rootScope, $window, $http, Config) {
    return {
        restrict: 'E',
        template: '<div class="mini-{{ provider }}"></div>',
        scope: {
            provider: '@',
            shareLink: '@',
            shareData: '='
        },
        link: function (scope, element, attrs) {
            var serverUrl = 'https://share.betcoapps.com/generateTicketImage';
            var sharer = {
                facebook: 'https://www.facebook.com/sharer/sharer.php?u=',
                google: 'https://plus.google.com/share?url=',
                odnoklassniki: 'https://www.odnoklassniki.ru/dk?st.cmd=addShare&st.s=1&st._surl='
            };
            element.bind("click", function (event) {
                event.stopPropagation();
                var shareWindow = $window.open('', Config.main.skin + 'share.popup', "scrollbars=1,width=1000,height=600,resizable=yes");
                if (scope.shareLink) {
                    openSharePopUp(scope.shareLink, shareWindow);
                } else if (scope.shareData) {
                    var data = {
                        ticket: scope.shareData,
                        lang: $rootScope.env.lang,
                        site_id: Config.main.site_id
                    };
                    $http({
                        method: 'POST',
                        url: serverUrl,
                        data: data,
                        paramSerializer: '$httpParamSerializerJQLike',
                        headers: {'Content-Type': 'application/x-www-form-urlencoded'}

                    }).success(function (response) {
                        if (response && response.status && response.status === 'ok' && response.link) {
                            openSharePopUp(response.link, shareWindow);
                        } else {
                            shareWindow.close();
                            openErrorPopUp();
                        }
                    }).error(function(){
                        shareWindow.close();
                        openErrorPopUp();
                    })
                }
            });

            function openSharePopUp(data, shareWindow) {
                shareWindow.location.href = sharer[scope.provider] + data;
            }

            function openErrorPopUp() {
                $rootScope.$broadcast("globalDialogs.addDialog", {
                    type: 'error',
                    title: 'Error',
                    content: 'casino_auth_error'
                });
            }
        }
    };
}
]);
