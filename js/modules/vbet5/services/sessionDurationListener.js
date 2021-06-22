VBET5.service('sessionDurationListener', ['$rootScope', '$timeout', '$location', '$interval', 'Moment', 'Translator', 'Config', 'Zergling',
    function ($rootScope, $timeout, $location, $interval, Moment, Translator, Config, Zergling) {
    'use strict';

   var timeoutPromise;
   var dateInterval;
   var t = this;
   var TAG = "session-reality-check";

   function clearDateInterval() {
        if (dateInterval) {
            $interval.cancel(dateInterval);
            dateInterval = null;
        }
    }

   function continueListening(paramName, paramValue) {
       $rootScope.broadcast("globalDialogs.removeDialogsByTag", TAG);
       clearDateInterval();
       Zergling.get({session_duration: $rootScope.profile.session_duration}, 'set_session_duration').then(function () {
           t.listen($rootScope.profile.session_duration);
       });
       if (paramName && paramValue) {
           $timeout(function () {
               $location.search(paramName, paramValue);
           }, 50);
       }
   }
    function getSessionTime() {
        return Moment.moment.utc(Date.now() - t.startDate).format("HH:mm:ss");
    }

   function getTimeState() {
       var state = {};
       state.date = getSessionTime();
       clearDateInterval();
       dateInterval = $interval(function () {
           state.date = getSessionTime();
       }, 1000);
       return state;
   }
   this.ignore = function ignore () {
       if (timeoutPromise) {
           $timeout.cancel(timeoutPromise);
           timeoutPromise = null;
       }
   };

   this.listen = function listen(duration, initial) {
        this.ignore();
       if (initial) {
           this.startDate = new Date();
       }
       var durationInMillisecond = duration * 60*1000;

       timeoutPromise =  $timeout(function (){
           if (!$rootScope.profile) {
               return;
           }
           $rootScope.$broadcast("globalDialogs.addDialog", {
               title: '*Reality Check*',
               tag: TAG,
               type: 'template',
               linkListener: continueListening,
               template: "templates/popup/session-reality-check.html",
               hideCloseButton: true,
               state: getTimeState(),
               hideButtons: true,
               buttons: [
                   {title: 'Log out', callback: function () {
                           $rootScope.broadcast('doLogOut', {source: 4});
                           $rootScope.broadcast("globalDialogs.removeDialogsByTag", TAG);
                           clearDateInterval();
                       }},
                   {title: 'Remain Logged In', callback: continueListening }

               ]
           });
       }, durationInMillisecond);

   };

}]);
