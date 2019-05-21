(function () {
    'use strict';
    try {
        document.domain = window.location.hostname.split(/\./).slice(1).join(".");
    } catch (e) {
        console.log(e);
    }
    function qs(where, key) {
        key = key.replace(/[*+?^$.\[\]{}()|\\\/]/g, "\\$&"); // escape RegEx meta chars
        var match = where.match(new RegExp("[?&]" + key + "=([^&]+)(&|$)"));
        return match && decodeURIComponent(match[1].replace(/\+/g, " "));
    }

    function bindEvent(element, type, handler) {
        if (element.addEventListener) {
            element.addEventListener(type, handler, false);
        } else {
            element.attachEvent('on' + type, handler);
        }
    }
    var src;
    try {
        src = document.getElementById('bcsportsbook').src;
    } catch (e) {
        var matches = e.stack.match(/.*(http.*):\d+:\d+/);
        if (matches && matches[1]) {
            src = matches[1]
        } else {
            return console.error('%cNo <script> element with id "bcsportsbook", please check integration document.', "font-size: x-large")
        }
    }
    var parsed_src = src.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)(\/[^?#]*)(\?[^#]*|)(#.*|)$/);
    var domain = parsed_src ? parsed_src[2] : '';
    var query = parsed_src ? parsed_src[6] : '';
    var path = parsed_src ? parsed_src[5] : '';
    path = path.length ? path.substr(1, path.indexOf('/js/partnerinit.js')) : "";
    var container = qs(src, 'containerID');
    var skinName = qs(src, 'skinName');
    var pathPrefix = qs(src, 'pathPrefix') || "";
    var page = qs(src, 'page') || '/sport';
    var url = (domain ? ("//" + domain) : "") + pathPrefix + "/" + path + (skinName ? (skinName + ".html") : "") + "#" + (page === '/' ? '' : page) + '/' + query;
    var frame = document.createElement("iframe");
    frame.setAttribute("src", url);
    frame.setAttribute("id", "bcsportsbookiframe");
    function fixHeight() {
        try {
            frame.height = frame.contentWindow.document.body.scrollHeight;
        } catch (e) {
            setTimeout(fixHeight, 500);
        }
    }
    frame.setAttribute("width", "100%");
    if (qs(src, 'dynamicheight')) {
        bindEvent(frame, "load", fixHeight);
        bindEvent(window, "resize", fixHeight);
    } else {
        frame.setAttribute("height", "100%");
    }

    document.getElementById(container).appendChild(frame);
}());
