VBET5.service('facebookPixel', ['$rootScope', '$window', '$location', 'Config', function ($rootScope, $window, $location, Config) {
    'use strict';

    var facebookPixel = {};

    facebookPixel.init = function init() {

        function initFacebook(pixelId) {
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function()
            {n.callMethod? n.callMethod.apply(n,arguments):n.queue.push(arguments)}
            ;if(!f._fbq)f._fbq=n;
                n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
                document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', pixelId ); // Insert your pixel ID here.
            fbq('track', 'PageView');
        }

        if(Config.main.facebookPixelId) {
            initFacebook(Config.main.facebookPixelId);
        }
    };

    return facebookPixel;

}]);
