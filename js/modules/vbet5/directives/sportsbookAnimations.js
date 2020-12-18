/* global VBET5, SportAnimation */

VBET5.directive('sportsbookAnimations', [function () {
    'use strict';

    return {
        restrict: "E",
        replace: true,
        template: '<div id="sport-animation"></div>',
        scope: {
            language: "=",
            sportAlias: "=",
            field: "=",
            typeId: "=",
            side: "=",
            team1Name: "=",
            team2Name: "=",
            team1Score: "=",
            team2Score: "=",
            team1Points: "=",
            team2Points: "="
        },
        link: function (scope, element) {
            var sportAnimation = null;

            scope.$watchGroup(["sportAlias", "field", "language"], function (newValues) {
                var sportAlias = newValues[0];
                var field = newValues[1];
                var language = newValues[2];

                if (sportAnimation) {
                    sportAnimation.destroy();
                }

                sportAnimation = SportAnimation.createSportAnimation({
                    container: element[0],
                    sportAlias: sportAlias,
                    field: field,
                    language: language
                });
            });

            scope.$watchGroup(["side", "typeId", "team1Name", "team2Name", "team1Score", "team2Score", "team1Points", "team2Points"], function (newValues) {
                var side = newValues[0];
                var typeId = newValues[1];
                var team1Name = newValues[2];
                var team2Name = newValues[3];
                var team1Score = newValues[4];
                var team2Score = newValues[5];
                var team1Points = newValues[6];
                var team2Points = newValues[7];

                if (sportAnimation) {
                    sportAnimation.setAnimationSide(side);
                    sportAnimation.setAnimationType(typeId);
                    sportAnimation.setTeamsInfo([{name: team1Name, score: team1Score, points: team1Points}, {
                        name: team2Name,
                        score: team2Score,
                        points: team2Points
                    }]);
                }
            });

            scope.$on('$destroy', function () {
                sportAnimation.destroy();
                sportAnimation = null;
            });
        }
    };
}]);
