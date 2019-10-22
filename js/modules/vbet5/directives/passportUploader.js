/* global VBET5 */
/**
 * @ngdoc directive
 * @name vbet5.directive:passportUploader
 * @description Upload passport image to server
 */
VBET5.directive('passportUploader', ['Zergling', 'Config', '$rootScope', function (Zergling, Config, $rootScope) {
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
             $scope.accountVerificationData = {};

            (function init() {
                getUploadedImages();
            })();

            if (window.File && window.FileReader && window.FileList) {
                $scope.inputId = INPUT_ID;
            } else {
                $scope.notSupported = true;
            }
            $scope.filePicked = false;
            $scope.disablePassportVerificationSubmitButton = Config.main.disablePassportVerificationSubmitButton;

            function doUpload(imageData, imageName) {
                var imageType = $scope.accountVerificationData.selectedImageType ? Number($scope.accountVerificationData.selectedImageType) : "";
                Zergling.get({image_data: imageData, name: imageName, image_type: imageType}, 'upload_image')
                    .then(
                        function success(response) {
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
                                getUploadedImages();
                            }
                        },
                        function error() {
                            $scope.uploadError = true;
                        }
                    )['finally'](function closeLoader() { $scope.loadingProgress = false; });
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

            function getUploadedImages() {
                $scope.loadingProgress = true;
                Zergling.get({}, 'get_images')
                    .then(
                        function success(response) {
                            if (response.code === 0 && response.data.length) {
                                $scope.documentImages = response.data.map(function processImgData(image) {
                                    // Mutating the original image
                                    image.FileType = image.Name.substring(image.Name.indexOf('.')+1);
                                    switch (image.FileType) {
                                        case 'pdf':
                                            image.Src = 'data:application/pdf' + ';base64,' + image.ImageData;
                                            break;
                                        default:
                                            image.Src = 'data:image/' + image.FileType +  ';base64,' + image.ImageData;
                                    }
                                    return image;
                                });
                            }
                        }
                    )
                    ['finally'](function hideLoader() { $scope.loadingProgress = false; });
            }

            $scope.openImage = function openImage(image) {
                var newWindow = window.open('', '', 'status=0'),
                    d = newWindow.document;
                switch (image.FileType) {
                    case 'pdf':
                        var byteCharacters = atob(image.ImageData);
                        var byteNumbers = [];
                        for (var i = 0; i < byteCharacters.length; i++) {
                            byteNumbers[i] = byteCharacters.charCodeAt(i);
                        }
                        var byteArray = new Uint8Array(byteNumbers);
                        var blob = new Blob([byteArray], { type: 'application/pdf' });
                        var fileUrl = URL.createObjectURL(blob);
                        d.write('<iframe src="' + fileUrl + '" frameborder="0" style="border:0; top:0; left:0; bottom:0; right:0; width:100%; height:100%;" allowfullscreen></iframe>');
                        d.title = image.Name;
                        break;
                    default:
                        d.write('<style>* {padding: 0;margin: 0;}</style><img src="' + image.Src + '" />');
                        d.title = image.Name;
                        angular.element(d).ready(function() {
                            var content = d.getElementsByTagName('img')[0];
                            newWindow.resizeTo(content.offsetWidth + 20, content.offsetHeight + 70);
                        });
                }
            };

        }
    };
}]);
