VBET5.service('casinoRealityCheck', ['$rootScope', '$timeout', '$location', '$filter', 'Translator', 'Config', 'Zergling',
    function ($rootScope, $timeout, $location, $filter, Translator, Config, Zergling) {
        'use strict';

        var timeoutPromise;
        var t = this;
        var profileActiveTimePromise;


        function formatWithCurrency(num)  {
            return  $filter("number")(num, $rootScope.conf.balanceFractionSize) + " " + $filter("currency")($rootScope.profile.currency);
        }

        function clearTimeoutPromise () {
            if (timeoutPromise) {
                $timeout.cancel(timeoutPromise);
                timeoutPromise = null;
            }
        }
        function continueCallback() {
            t.listen();
        }
        function endCallback() {
            if (!$rootScope.env.showSlider || $rootScope.env.sliderContent !== "balanceHistory") {
                $rootScope.$broadcast('toggleSliderTab', 'balanceHistory');
            }
            continueCallback();
        }

        /**
         * @ngdoc method
         * @name constructRealityCheckContent
         * @description Construct reality check content
         */
        function constructRealityCheckContent(data) {
            var details = data.details;
            var content = "<div class=\"reality-info\">";
            content += "<h4>" + Translator.get("Your Casino Activity") + "</h4>";
            content += "<span class=\"reality-title ellipsis-text\">" + Translator.get("Your have played for") + ": </span><span class=\"reality-value\">" + details.SessionDuration + " " + Translator.get("minutes") + "</span>";
            content += "<span class=\"reality-title ellipsis-text\">" + Translator.get("You have bet") + ": </span><span class=\"reality-value\">" + formatWithCurrency(details.CasinoBetTotal) + "</span>";
            content += "<span class=\"reality-title ellipsis-text\">" + Translator.get("You have won") + ": </span><span class=\"reality-value under-line\">" + formatWithCurrency(details.CasinoWinTotal) + "</span>";
            content += "<span class=\"reality-title ellipsis-text\">" + Translator.get("Profit") + ": </span><span class=\"reality-value\">" + formatWithCurrency(details.Profitness) + "</span>";
            content += "</div>";
            return content;

        }

        this.listen = function listen() {
            clearTimeoutPromise();
            if ($rootScope.profile && $rootScope.profile.active_time_in_casino) {
                var durationInMillisecond = $rootScope.profile.active_time_in_casino * 1000;
                timeoutPromise = $timeout(function (){
                    Zergling.get({}, "get_client_current_session_slot_pl").then(function (data) {
                        $rootScope.$broadcast("globalDialogs.addDialog", {
                            type: 'confirm',
                            title: 'Alert',
                            tag: 'reality-check-popup',
                            content: constructRealityCheckContent(data),
                            hideCloseButton: true,
                            buttons: [
                                {title: 'Continue', callback: continueCallback},
                                {title: 'Open Account History', callback: endCallback}
                            ]
                        });
                    });
                }, durationInMillisecond);
            }
            if (!profileActiveTimePromise) {
                profileActiveTimePromise = $rootScope.$watch('profile.active_time_in_casino', function () {
                    clearTimeoutPromise();
                    if ($rootScope.profile && $rootScope.profile.active_time_in_casino) {
                        t.listen();
                    }
                });
            }
        };

        this.ignore = function ignore() {
            clearTimeoutPromise();
            if (profileActiveTimePromise) {
                profileActiveTimePromise();
                profileActiveTimePromise = undefined;
            }
        };
    }]);
