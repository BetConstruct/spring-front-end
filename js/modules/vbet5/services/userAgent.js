/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:UserAgent
 * @description
 *
 * detects user agent
 *
 */
VBET5.service('UserAgent', function () {
    'use strict';
    return {
        /**
         * @ngdoc method
         * @name ifTablet
         * @methodOf vbet5.service:UserAgent
         * @description if user agent is tablet, calls the provided callback function
         *
         * @param {Function} callback the callback function to call  if tablet device is detected
         */
        ifTablet: function ifTablet(callback) {
            var a = navigator.userAgent || navigator.vendor || window.opera;
            if (
                /android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od|ad)|iris|kindle|lge |maemo|midp|mmp|netfro`nt|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))
            ) {
                callback();
            }
        },
        /**
         * @ngdoc method
         * @name isIE8orOlder
         * @methodOf vbet5.service:UserAgent
         * @description checks if browser is IE8 or older
         *
         * @returns {Boolean} is IE8 or older or not
         */
        isIE8orOlder: function isIE8orOlder() {
            return (document.all && !document.addEventListener);
        },

        isChrome: function isChrome() {
            return (/chrome/i).test(navigator.userAgent);
        },

        /**
         * @ngdoc method
         * @name IEVersion
         * @methodOf vbet5.service:UserAgent
         * @description checks IE version
         *
         * @returns {Number} IE version if IE, false if other browser
         */
        IEVersion: function IEVersion() {
            var ua = window.navigator.userAgent;
            var msie = ua.indexOf('MSIE ');
            var trident = ua.indexOf('Trident/');
            if (msie > 0) {
                // IE 10 or older => return version number
                return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
            }
            if (trident > 0) {
                // IE 11 (or newer) => return version number
                var rv = ua.indexOf('rv:');
                return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
            }
            // other browser
            return false;
        },
        /**
         * @ngdoc method
         * @name getOS
         * @methodOf vbet5.service:UserAgent
         * @description detects user operating system
         *
         * @returns {String} OS name
         */
        getOS: function getOS() {
            var name;
            if (navigator.appVersion.indexOf("Win") !== -1) {
                name = "Windows";
            }
            if (navigator.appVersion.indexOf("Mac") !== -1) {
                name = "MacOS";
            }
            if (navigator.appVersion.indexOf("X11") !== -1) {
                name = "UNIX";
            }
            if (navigator.appVersion.indexOf("Linux") !== -1 || (navigator.platform && navigator.platform.indexOf("Linux") !== -1)) {
                name = "Linux";
            }

            return name;
        },
        /**
         * @ngdoc method
         * @name getOSVersion
         * @methodOf vbet5.service:UserAgent
         * @description detects user operating system's version
         *
         * @returns {String} OS name
         */
        getOSVersion: function getOSVersion() {
            var name;
            switch (true) {
                case navigator.userAgent.indexOf("Windows NT 10.0") !== -1:
                    name = "Windows10";
                    break;
                case navigator.userAgent.indexOf("Windows NT 6.2") !== -1:
                case navigator.userAgent.indexOf("Windows NT 6.3") !== -1:
                    name = "Windows8";
                    break;
                case navigator.userAgent.indexOf("Windows NT 6.1") !== -1:
                    name = "Windows7";
                    break;
                case navigator.userAgent.indexOf("Windows NT 6.0") !== -1:
                    name = "WindowsVista";
                    break;
                case navigator.userAgent.indexOf("Windows NT 5.1") !== -1:
                case navigator.userAgent.indexOf("Windows NT 5.2") !== -1:
                    name = "WindowsXP";
                    break;
                case navigator.userAgent.indexOf("Windows NT 5.0") !== -1:
                    name = "Windows2000";
                    break;
            }

            return name;
        }
    };
});
