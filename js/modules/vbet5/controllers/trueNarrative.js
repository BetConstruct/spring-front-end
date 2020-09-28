/**
 * @ngdoc controller
 * @name vbet5.controller:trueNarrativeCtrl
 */
VBET5.controller('trueNarrativeCtrl', ['$rootScope', '$scope', 'Geoip', 'Config', 'Utils', 'CountryCodes', 'Zergling', function($rootScope, $scope, Geoip, Config, Utils, CountryCodes, Zergling) {
    'use strict';

    function selectCurrentCountry() {
        var countryCode = $scope.countryCodes[0].key;
        Geoip.getGeoData(false).then(function (data) {
            if ((!Config.main.personalDetails.availableCountriesList || Config.main.personalDetails.availableCountriesList.indexOf(data.countryCode) !== -1) && (!Config.main.personalDetails.restrictedCountriesList || Config.main.personalDetails.restrictedCountriesList.indexOf(data.countryCode) === -1)) {
               countryCode = data.countryCode;
            }
        })['finally'](function () {
            $scope.data.countryCode = countryCode;
        });
    }

    (function init() {
        $scope.imageTypes = [
            {id: 2, name: 'Document'},
            {id: 3, name: 'Passport'},
            {id: 4, name: 'Driver License'}
        ];

        $scope.data = {
            imageType: ""
        };

        $scope.countryCodes = Utils.objectToArray(CountryCodes, 'key');
        $scope.countryCodes.sort(Utils.alphabeticalSorting);
        selectCurrentCountry();
    })();

    $scope.submitForm = function submitForm(e) {
        e.preventDefault();
        if (!$scope.data.image.ImageData || !$scope.data.imageType) {
            return;
        }
        $scope.data.loading = true;
        var request = {
            doc_country: $scope.data.countryCode,
            doc_tag:"FRONT",
            "image_info":{
                "image_data": $scope.data.image.ImageData,
                "image_type": +$scope.data.imageType,
                "name": $scope.data.image.Name
            }
        };
        Zergling.get(request, "add_tru_narrative_client_docs").then(function (response) {
            $scope.data.status = response.result === 0 ? 'success' : "fail";
        },function () {
            $scope.data.status = 'fail';

        })['finally'](function () {
            $scope.data.loading = false;
        });
    };

    $scope.close =  function () {
        $rootScope.$broadcast("globalDialogs.removeDialogsByTag", "gift-bet-popup");
    };

}]);
