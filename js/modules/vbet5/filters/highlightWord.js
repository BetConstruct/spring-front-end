VBET5.filter('highlightWord', function() {
    'use strict';

    function replace(match) {
        return '<mark>' + match + '</mark>';
    }
    return function(text, selectedWord) {
        if(selectedWord && text) {
            var pattern = new RegExp(selectedWord, "ig");
            return text.replace(pattern, replace);
        }
        else {
            return text;
        }
    };
});
