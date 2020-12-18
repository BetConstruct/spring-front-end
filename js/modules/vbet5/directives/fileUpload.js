VBET5.directive('fileUpload', [function () {
   'use strict';
    return {
        require:"ngModel",
        restrict: 'A',
        link: function($scope, el, attrs, ngModel){
            el.bind('change', function(event){
                var file =  event.target.files[0];
                var result = {Name: file.name};

                if (attrs.fileExtensions){
                    var re = /(?:\.([^.]+))?$/;
                    var extension = re.exec(file.name)[0];
                    if (attrs.fileExtensions.indexOf(extension.toLowerCase()) === -1) {
                        ngModel.$setViewValue({
                            error: true
                        });
                        return;
                    }
                }

                var fileReader = new FileReader();
                fileReader.onloadend = function fileLoaded(e) {
                    result.ImageData = e.target.result;
                    ngModel.$setViewValue(result);
                    $scope.$apply();
                };
                fileReader.readAsDataURL(file);

            });
        }
    };
}]);
