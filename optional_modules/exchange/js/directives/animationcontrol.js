angular.module('exchange').directive('animationControl', function () {
    'use strict';
    return {
	
        restrict: 'AE',
        replace: true,
        templateUrl: 'templates/directive/sport/animation-control.html',
        scope: {
            layout: '@',
            openGame: '=',
            soundOn: '=',
            volume: '='

        },
        link: function (scope) {
		
			

            scope.animationSoundsMap = {
                //'Goal': 'audio/soccer/Goal',
                //'RedCard': 'audio/soccer/RedCard',
                //'YellowCard': 'audio/soccer/YellowCard',
                //'BallInPlay': 'audio/tennis/BallInPlay',
                //'Ace': 'audio/tennis/Ace',
                //'ServiceFault': 'audio/tennis/ServiceFault'
            };

            //tennis side detection function
            scope.setTennisCourtSide = function setTennisCourtSide(gameScoreTeam1, gameScoreTeam2, setScore) {
                var courtSide = '';
                var score1 = parseInt(gameScoreTeam1, 10);
                var score2 = parseInt(gameScoreTeam2, 10);
                var scoreSum = score1 + score2;
                if (setScore === "6:6" && scoreSum !== 0) {
                    courtSide = (scoreSum % 2) === 0 ? "left" : "right";
                } else {
                    if (score1 === score2 || scoreSum === 30 || scoreSum === 55) {
                        courtSide = "right";
                    } else {
                        courtSide = "left";
                    }
                }

                console.log('-----------: ', courtSide);

                return courtSide;
            };


            scope.$watch('volume', function(newVal, oldVal) {
                changeVolume(newVal);
            });

             function changeVolume(newVolume) {
                if(!isNaN(newVolume)) {
                    var audioMp3 = document.getElementById("audio-animation-mp3");
                    var audioOgg = document.getElementById("audio-animation-ogg");
                    audioMp3.volume = newVolume;
                    audioOgg.volume = newVolume;
                }
            }


        }
    };
});