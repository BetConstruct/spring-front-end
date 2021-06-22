VBET5.directive('kievAnimation', ['$rootScope', 'DomHelper', 'Config', function ($rootScope, DomHelper, Config) {
    'use strict';

    return {
        restrict: 'E',
        replace: true,
        scope: {
            sound: '=',
            id: '=',
            team1: '=',
            team2: '='
        },
        templateUrl: "templates/directive/kiev-animations.html",
        link: function (scope , elem) {
            var element = elem[0];
            var settings = Config.main.kievAnimationSettings;
            function sendMessage() {
                var data ={
                    sound: scope.sound,
                    score: settings.score,
                    statistic: settings.statistic,
                    team_names: settings.team_names,
                    timer: settings.timer,
                    lang: $rootScope.env.lang,
                    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb21wYW55X25hbWUiOiJiZXRjb25zdHJ1Y3RfZGV2IiwiaXNzIjoibWxwcm94eSIsInNwb3J0IjpbImFsbCJdLCJmZWVkX3R5cGUiOlsiYWxsIl0sInByb3ZpZGVycyI6WyJhbGwiXX0.XrRZDu-SYt4yOKTuW8_8XoF5Y0R8K5wPsSvh01g5-d0",
                    id: "" + scope.id,
                    isLinked: false,
                    provider: 5,
                    rtl: !!Config.main.availableLanguages[$rootScope.env.lang].rtl,
                    partner: +Config.main.site_id,
                    teamNames: [scope.team1, scope.team2]

                };
                if (element.contentWindow) {
                    element.contentWindow.postMessage(data, '*');
                }
            }


            function listenMessages(event) {
               if (event.origin === Config.main.customAnimationURL && event.data === 'ready') {
                   scope.$watch('sound', sendMessage);
                   window.removeEventListener('message', listenMessages);
               }
            }

            window.addEventListener('message', listenMessages);
            angular.element(element).on('$destroy', function onDestroy() {
                window.removeEventListener('message', listenMessages);
            });


        }
    };
}]);
