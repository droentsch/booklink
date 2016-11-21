(function () {
    var ebookApp = angular.module('ebookConfigApp', ['ngRoute', 'ui.bootstrap', 'angularFileUpload']);

    var loader = function (state) {
        if (!window.opener || !window.opener.ebookWindowOpener || !window.opener.ebookWindowOpener.getEbookData) {
            window.location.href = '/';
        }
        state.setEbookData(window.opener.ebookWindowOpener.getEbookData());
    };

    ebookApp.run(['state', loader]);
}());