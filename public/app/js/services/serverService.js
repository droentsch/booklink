(function() {

    var server = function($http, ebGlobals, $q, $upload) {
        var getDropdownData = function(isbn) {
            return $http.get(ebGlobals.restServices.PRODUCT_LIST(isbn))
                .then(function(response) {
                    return response.data;
                }, function(reason) {
                    return reason;
                });
        };
        var searchService = function(id) {
            return $http.get(ebGlobals.restServices.BENTO_SERVICE(id))
                .then(function(response) {
                    return response.data;
                }, function(reason) {
                    return reason;
                });
        };
        var getCurrentEbookInfo = function(courseIsbn) {
            return $http.get(ebGlobals.restServices.EBOOK_DATA_RETRIEVAL + '?isbn=' + courseIsbn)
                .then(function(response) {
                    return response.data;
                }, function(reason) {
                    return reason;
                });
        };
        var validateEpid = function(productType, epid) {};
        var setImage = function(image, progressFunc, successFunc, errorFunc) {
            if (image) {
                return $upload.upload({
                    url: ebGlobals.restServices.FILE_UPLOAD,
                    file: image
                });
            } else
                $q.reject('bad image argument');
        };

        var saveTfNovella = function(data) {
            return save(data);
        };
        var saveEbooks = function(data) {
            return save(data);
        };
        var deleteAll = function(data) {
            return save(data);
        };
        var save = function(data) {
            return $http.post(ebGlobals.restServices.EBOOKS_SAVE_DATA, data)
                .then(function(response) {
                    return response.data;
                }, function(reason) {
                    return reason;
                });
        };
        return {
            getDropdownData: getDropdownData,
            setImage: setImage,
            getCurrentEbookInfo: getCurrentEbookInfo,
            saveTfNovella: saveTfNovella,
            saveEbooks: saveEbooks,
            validateEpid: validateEpid,
            deleteAll: deleteAll,
            searchService: searchService
        };
    };

    var app = angular.module('ebookConfigApp');
    app.factory('server', ['$http', 'ebGlobals', '$q', '$upload', server]);
}());