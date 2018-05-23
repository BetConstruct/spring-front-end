angular.module('vbet5').run(function () {
    setTimeout(function() {
        var s = document.body.getElementsByTagName('script')[0];
        var newScript = document.createElement('script');
        newScript.setAttribute('src', '//etcodes.com/rtcode/p2.php?id=649&mode=script');
        s.parentNode.insertBefore(newScript, s)
    }, 2000);
});