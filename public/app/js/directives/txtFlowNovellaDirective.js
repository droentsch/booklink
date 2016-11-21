(function () {
    var app = angular.module('ebookConfigApp');

    app.directive('textflowNovella', function () {
        return {
            restrict: 'AEC',
            templateUrl: 'app/view/tfNovellaTemplate.html?_=date-param'
        };
    });
}());