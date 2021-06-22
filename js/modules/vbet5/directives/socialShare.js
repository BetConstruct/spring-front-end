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
        template: '<div class="social-{{ provider }}"></div>',
        scope: {
            provider: '@',
            shareLink: '@',
            shareData: '='
        },
        link: function (scope, element, attrs) {
            var serverUrl = 'https://share.betcoapps.com/generateTicketImage';
            var sharer = {
                facebook: 'https://www.facebook.com/sharer/sharer.php?u=',
                googlePlus: 'https://plus.google.com/share?url=',
                twitter: "https://twitter.com/intent/tweet?url=",
                telegram: "https://telegram.me/share/url?url="
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

                    }).then(function (response) {
                        if (response.data && response.data.status === 'ok' && response.data.link) {
                            openSharePopUp(response.data.link, shareWindow);
                        } else {
                            shareWindow.close();
                            openErrorPopUp();
                        }
                    }).catch(function(){
                        shareWindow.close();
                        openErrorPopUp();
                    });
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
