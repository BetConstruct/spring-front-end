/* global VBET5 */
/**
 * @ngdoc service
 * @name vbet5.service:odd
 * @description odd service
 *
 */
VBET5.service('LadderLoader', ['Zergling', function (Zergling) {
    var _callback = null;
    var result = null;

    this.setCallback = function(callback) {
      if (result) {
        callback(result);
      } else {
        _callback = callback;
      }
    };

  /**
   *  Load ladder data from back end and convert to map
   */
  this.loadLadderData = function (callback) {
    var _this = this;
    Zergling.get({}, "get_permissible_odds").then(function (data) {
      if (data.result === 0 && data.details && data.details.length) {
        result = {};
        var details = data.details;
        for (var i = details.length; i--;) {
          var detail = details[i];
          result[detail.Price] = detail.Numerator + "/" + detail.Denominator;
        }
        _this.isLoaded = true;
        _callback && _callback(result);
        callback && callback();
      }
    });
  }


}]);
