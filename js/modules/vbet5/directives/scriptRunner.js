'use strict';

/**
 * @ngdoc directive
 * @name VBET5.directive:scriptRunner
 * @description Run and execute script and and other html tags
 * # scriptRunner
 */
VBET5.directive('scriptRunner', function () {
    var MATCH_TAGS = /\<\s*(\w+)\s*([^\>]*)\>([^\<]*)\<\s*\/\w+\s*\>/gm,
        MATCH_SRC = /src\s*=\s*["']*([^"']+)["']*/,
        MATCH_SCRIPT = new RegExp(/<script/);
    return {
      restrict: 'E',
      replace: false,
      scope: {
        scriptData: '='
      },
      link: function postLink(scope, element, attrs) {
        var str = scope.scriptData || '',
            matchedTags = str.match(MATCH_TAGS),
            isScript;

        if (matchedTags) {

          element.append(str);
          matchedTags.forEach(function (tagString) {
            isScript = MATCH_SCRIPT.test(tagString);  // tagString contain <script> tag or not
            if (isScript) {
              executeScript(tagString);
            }

          });
        }

        function executeScript(tagString) {
          var src = tagString.match(MATCH_SRC);
          (src) ? loadScript(src[1]) : evalScript(tagString);
        }

        function evalScript(scriptStr) {
          var matched = scriptStr.match(/\<\s*\w+\s*[^\>]*\>([^\<]*)\<\s*\/\w+\s*\>/);
          if (!matched[1]) {
            return;
          }
          var script = document.createElement('script');
          script.innerHTML = matched[1];
          document.getElementsByTagName('head')[0].appendChild(script);
        }

        function loadScript(src) {
          if (!src) {
            return
          }
          var script = document.createElement('script');
          script.src = src;
          document.getElementsByTagName('head')[0].appendChild(script);
        }

      }
    };
  });
