(function () {
    var App = angular.module('ebookConfigApp');

    App.config(function ($routeProvider, $locationProvider) {
        $routeProvider.when('public/', {
            templateUrl: 'app/view/main.html?_=date-param',
            controller: 'configController'
        }).otherwise({
            templateUrl: 'app/view/main.html?_=date-param',
            controller: 'configController'
        });
    });
}());