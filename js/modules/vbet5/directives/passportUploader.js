/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:passportUploader
 * @description Upload passport image to server
 */
VBET5.directive('passportUploader', ['$sce', 'Zergling', 'Config', '$rootScope','Translator', function ($sce, Zergling, Config, $rootScope, Translator) {
    'use strict';
    var INPUT_ID = 'passportImage';
    return {
        restrict: 'E',
        replace: false,
        templateUrl: 'templates/directive/passport-uploader.html',
        scope: {
            forms: '=forms' // Connecting account verification form to the object which stores all forms (settings.js)
        },
        link: function ($scope) {

            $scope.imageTypes = [
                {name: "Bank Slip", value: 1},
                {name: "Document", value: 2},
                {name: "Passport", value: 3},
                {name: "Driving License", value: 4},
                {name: "IBAN", value: 5},
                {name: "Social Card ID", value: 6},
                {name: "Other", value: 7}
            ];

            $scope.accountVerificationData = {};

            if (window.File && window.FileReader && window.FileList) {
                $scope.inputId = INPUT_ID;
            } else {
                $scope.notSupported = true;
            }
            $scope.filePicked = false;
            $scope.disablePassportVerificationSubmitButton = Config.main.disablePassportVerificationSubmitButton;
            function doUpload(imageData, imageName) {
                var imageType = $scope.accountVerificationData.selectedImageType ? Number($scope.accountVerificationData.selectedImageType) : "";
                Zergling.get({image_data: imageData, name: imageName, image_type: imageType}, 'upload_image').then(function (response) {
                    if (response.result !== 0) { // There was an error
                        $scope.uploadError = true;
                        $rootScope.$broadcast("globalDialogs.addDialog", {
                            type: "error",
                            title: 'Error',
                            content: 'message_3008'
                        });
                    } else {
                        $scope.fileUploaded = true;
                        $rootScope.$broadcast("globalDialogs.addDialog", {
                            type: "success",
                            title: 'Success',
                            content: 'Your file successfully uploaded.'
                        });
                        // Resetting the form after successful submission
                        $scope.accountVerificationData = {};
                        document.getElementById(INPUT_ID).value = null;
                        $scope.forms.passportImageForm.$setPristine();
                        $scope.forms.passportImageForm.$setUntouched();
                    }
                    $scope.loadingProgress = false;
                }, function (err) {
                    $scope.uploadError = true;
                    $scope.loadingProgress = false;
                });
            }

            $scope.submitForm = function () {
                var file = document.getElementById(INPUT_ID).files[0],
                    fileReader = new FileReader();
                if (!file || !$scope.accountVerificationData.selectedImageType) {
                    $scope.showRequiredMessage = true;
                    $scope.fileUploaded = false;
                    return;
                }
                // Resetting all messages
                $scope.showRequiredMessage = false;
                $scope.uploadError = false;
                $scope.fileUploaded = false;

                $scope.loadingProgress = true;
                fileReader.onloadend = function fileLoaded(e) {
                    $scope.filePicked = true;
                    doUpload(e.target.result, file.name);
                };
                fileReader.readAsDataURL(file);
            };
            setTimeout(function(){
                document.getElementById(INPUT_ID).onchange = function () {
                    document.getElementById("uploadFilePassport").value = (this.value || '').replace('C:\\fakepath\\', '');
                };
            }, 200);
        }
    };
}]);