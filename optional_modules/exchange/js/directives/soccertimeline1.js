angular.module('exchange').directive('soccertimeline1', function () {
    'use strict';
    return {
        restrict: 'E',
        replace: 'true',
        templateUrl: 'templates/directive/sport/soccer-timeline.html',
        scope: {
            matchLength: '@',
            game: '='
        },
        link: function (scope) {
            scope.tlEvents = [];
            
            scope.isExtraTime = false;
            scope.tlCurrentMinute = {};
            scope.tlCurrentPosition = {};

            /**
             * checks if extra time of the game is played
             */
            function checkExtraTime(gameInfo) {
                return (
                    gameInfo && (
                        gameInfo.current_game_state === 'additional_time1' ||
                        gameInfo.current_game_state === 'additional_time2' ||
                        (gameInfo.current_game_state === 'timeout' && gameInfo.currMinute > 100)
                    )
                );
            }

            /* returns current time position on timeline */
            function getTLCurrentMinutePosition(game) {
                var curentMinute;
                var currentMinutePosition = '';
                if (game.info && game.info.current_game_time) {
                    curentMinute = parseInt(game.info.current_game_time, 10);

                    if (checkExtraTime(game.info)) {
                        currentMinutePosition = (curentMinute - 90) <= 30 ? ((curentMinute - 90) * 10 / 3) + '%' : '100%';
                    } else if (game.last_event && game.last_event.match_length === '80') {
                        currentMinutePosition = curentMinute <= 80 ? (curentMinute * 10 / 8) + '%' : '100%';
                    } else {
                        currentMinutePosition = curentMinute <= 90 ? (curentMinute * 10 / 9) + '%' : '100%';
                    }
                    return currentMinutePosition;
                }
            };
            
            /*returns position of timeline event */
            function getTimelinePosition (timelineEvent) {
                var theMinute = parseInt(timelineEvent.minute, 10);
                var multiplier = 9;
                if (timelineEvent.matchLength === "80") {
                    multiplier = 8;
                }
                if (!timelineEvent.extraTime) {
                    if (theMinute > (multiplier-5) && theMinute < multiplier*10) {
                        return { right: (102 - theMinute * 10 / multiplier) + '%' };
                    }
                    if (theMinute >= multiplier*10) {
                        return { right: '0%' };
                    }
                    return { left: theMinute * 10 / multiplier + '%' };
                }
            };

            /* generates timeline events */
            function generateTimeLineEvents() {
                scope.game.tlEvents = [];
                angular.forEach(scope.game.live_events, function (tlEvent) {
                    var currentEvent = {};
                    var eventName = tlEvent.event_type.split('_');
                    var i;
                    currentEvent.minute = parseInt(tlEvent.add_info, 10);
                    currentEvent.type = 'tl-' + tlEvent.event_type;
                    currentEvent.shirtColor = tlEvent.team === 'team1' ? scope.game.info.shirt1_color : scope.game.info.shirt2_color;
                    currentEvent.team = tlEvent.team;
                    currentEvent.matchLength = scope.game.last_event ? scope.game.last_event.match_length : "90";                   
                    
                    currentEvent.details = {};
                    currentEvent.details.type = '';
                    for (i = 0; i < eventName.length; i++) {
                        currentEvent.details.type += currentEvent.details.length > 0 ? ' ' + eventName[i] : eventName[i];
                    }
                    currentEvent.details.add_info = tlEvent.add_info + " " + scope.game[tlEvent.team + '_name'];
                    var timelinePosition = getTimelinePosition(currentEvent);
                    currentEvent.timelinePosition = timelinePosition;
                    currentEvent.extraTime = false;
                    if (checkExtraTime(scope.game.info)) {
                        currentEvent.extraTime = true;
                        //if extra time push only tl events after 90th minute
                        if (currEvent.minute > 90) {
                            scope.game.tlEvents.push(currentEvent);
                        }
                    } else {
                        scope.game.tlEvents.push(currentEvent);
                    }
                });
            }           
            
            
            //need to watch game.info.current_game_time change to update timeline
            scope.$watch('game.info.current_game_time', function() {                
                var currentMinuteStyle = getTLCurrentMinutePosition(scope.game);                
                scope.tlCurrentMinute = {width: currentMinuteStyle };
                scope.tlCurrentPosition = { left: currentMinuteStyle };
                
                scope.isExtraTime = checkExtraTime(scope.game.info);
                
                
                console.log("Watching Current Game Time", scope.game.info.current_game_time);                
                
            });
            
            scope.$watch('game.live_events.length', function(newVal, oldVal) {
                generateTimeLineEvents();
             //   console.log("Watching GAME EVENTS", scope.game.live_events);
            },true);
        }
    };
});

/*
+ isExtraTime(game.info)
+ getTlCurrentMinute(game)
+ game.tlEvents !!!  
getTimelinePosition(tlEvent)
+ getTlCurrentPosition(game) 

*/