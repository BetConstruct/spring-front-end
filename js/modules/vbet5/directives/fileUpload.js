VBET5.directive('fileUpload', function () {
   'use strict';
    return {
        require:"ngModel",
        restrict: 'A',
        link: function($scope, el, attrs, ngModel){
            el.bind('change', function(event){
                var file =  event.target.files[0];
                var result = {Name: file.name};
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
});
