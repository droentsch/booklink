(function() {


    var ebookAuthorsInputController = function($scope, validation) {

        var closeAuthorPanel = function() {
            if (!isValidForDone()) return;
            storeAuthor();
            resetFields();
            $scope.ui.hideAuthorPanel = true;
        };
        var storeAuthor = function() {
            if ($scope.ui.authorFirstName || $scope.ui.authorLastName) {
                $scope.data.authors.push({
                    firstName: $scope.ui.authorFirstName,
                    lastName: $scope.ui.authorLastName,
                    isPrimary: ($scope.data.authors.length === 0),
                    id: -1
                });

            }
        };
        var addAnotherAuthor = function() {
            if (!isValidForAddAnother()) return;
            storeAuthor();
            resetFields();
        };

        var resetFields = function() {
            $scope.ui.authorFirstName = null;
            $scope.ui.authorLastName = null;
        };

        var isValidForAddAnother = function() {
            $scope.showAuthorValidationAlert = false;
            if (!validation.isAuthorAccepted($scope.ui.authorFirstName, $scope.ui.authorLastName, $scope.data.authors)) {
                $scope.authorExceptions = validation.getExceptions();
                $scope.showAuthorValidationAlert = true;
                return false;
            }
            return true;
        };

        var isValidForDone = function() {
            $scope.showAuthorValidationAlert = false;
            if ($scope.ui.authorFirstName || $scope.ui.authorLastName) {
                if (!validation.isAuthorAccepted($scope.ui.authorFirstName, $scope.ui.authorLastName, $scope.data.authors)) {
                    $scope.authorExceptions = validation.getExceptions();
                    $scope.showAuthorValidationAlert = true;
                    return false;
                }
            }
            return true;
        };
        $scope.formInvalid = false;
        $scope.closeAuthorPanel = closeAuthorPanel;
        $scope.addAnotherAuthor = addAnotherAuthor;
        $scope.authorExceptions = null;
        $scope.showAuthorValidationAlert = false;

    };

    var ebookAuthorsListController = function($scope) {
        var updateAuthors = function(selectedIndex) {
            angular.forEach($scope.data.authors, function(author, index) {
                $scope.data.authors[index].isPrimary = (index == selectedIndex);
            });
        };
        var deleteAuthor = function(selectedIndex) {
            var deferredPrimary = false;

            deferredPrimary = ($scope.data.authors[selectedIndex].isPrimary === true)

            $scope.data.authors.splice(selectedIndex, 1);
            if (deferredPrimary === true && $scope.data.authors.length > 0) {
                $scope.data.authors[0].isPrimary = true;
            }
        };


        $scope.updateAuthors = updateAuthors;
        $scope.deleteAuthor = deleteAuthor;
    };
    //Hook it up to the application
    var app = angular.module('ebookConfigApp');

    app.directive('ebookAuthorsInput', function() {
        return {
            restrict: 'AEC',
            scope: true,
            templateUrl: 'app/view/ebookAuthorsInput.html?_=date-param',
            controller: ['$scope', 'validation', ebookAuthorsInputController]
        };
    });
    app.directive('ebookAuthorsList', function() {
        return {
            restrict: 'AEC',
            scope: {
                editable: '=editable'
            },
            templateUrl: 'app/view/ebookAuthorsList.html?_=date-param',
            controller: ['$scope', ebookAuthorsListController]
        };
    });
}());