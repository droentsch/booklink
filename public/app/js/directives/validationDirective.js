(function () {
    var app = angular.module('ebookConfigApp');
    var validationController = function ($scope, ebGlobals) {
        var closeAlert = function () {
            $scope.show = false;
        };
        var getStyle = function (exception) {
            if (exception.level === ebGlobals.errorLevel.WARNING) {
                return 'alert-warning';
            }
            if (exception.level === ebGlobals.errorLevel.ERROR) {
                return 'alert-danger';
            }
        };
        $scope.dimensions = {};
        $scope.dimensions.width = 'col-sm-4 col-sm-offset-4';
        if (!angular.isUndefined($scope.width) && $scope.width !== null && $scope.width != "") {
            if ($scope.width.toUpperCase() === ebGlobals.dimensions.WIDEST) {
                $scope.dimensions.width = 'col-sm-12';
            }
        }

        $scope.closeAlert = closeAlert;
        $scope.getStyle = getStyle;
    };
    app.directive('ebookValidation', function () {

        var scopes = [];
        return {
            restrict: 'AEC',
            templateUrl: 'app/view/validation.html?_=date-param',
            scope: {
                exceptions: '=',
                show: '=',
                width: '='
            },
            replace: false,
            controller: ['$scope', 'ebGlobals', validationController]
        };
    });
}());