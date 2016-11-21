(function() {
    var app = angular.module('ebookConfigApp');
    app.factory('ebGlobals', function() {
        var confirmMsg = {
            header: "Warning",
            lead: "By clicking \"Ok\" below, you are confirming the following:",
            bullet1: "You are about to change the reading experience for this ISBN",
            bullet2: "The change will be immediate, and students and instructors will see whatever you have configured",
            bullet3: "If the IDs for the eBooks have not been validated then users will likely go to either an error page or the wrong eBook",
            bullet4: "Problems that arise from the changes you make can be undone by coming back and correcting mistakes in the tool",
            bullet5: "If you are switching from textflow to the new eBook please note that all existing assigned readings in that ISBN will be deleted (and not recoverable)",
            checkboxText: "I understand the impact of the change and I still want to do this"
        };
        var getConfirmMsg = function() {
            return confirmMsg;
        };
        var restServices = {
            PRODUCT_LIST: function(isbn) {
                return '/connectconfig/restservices/controller/ebook/action/products?courseISBN=' + isbn;
            },
            BENTO_SERVICE: function(id) {
                return '/connectconfig/restservices/controller/ebook/action/bentoLookup?epid=' + id;
            },
            EBOOKS_SAVE_DATA: '/connectconfig/restservices/controller/ebook/action/saveEbook',
            FILE_UPLOAD: '/connectconfig/restservices/controller/ebook/action/uploadResource'
        };

        var image = {
            WIDTH: 200,
            HEIGHT: 260,
            SIZE: 5242880,
            PLACEHOLDER: 'app/img/no_image.png'
        };
        var constants = {
            BYTES_PER_MEGABYTE: 1048576,
        };
        var messages = {
            onSaveError: 'An error occurred at the server.  Please try again later or contact your administrator.'
        };
        var ebookJsonConstants = {
            NO_TYPE: 'NONE',
            TFNOVELLA_TYPE: 'PROVIDER',
            EBOOK_TYPE: 'PRODUCTS',
            TEXTFLOW: 'TEXTFLOW',
            NOVELLA: 'NOVELLA',
            READER17: 'READER17'
        };
        var errorLevel = {
            WARNING: 'warning',
            ERROR: 'error'
        };
        var type = {
            STRING: 0,
            NUMBER: 1,
            ARRAY: 2
        };
        var fieldSpecs = {
            TITLE_LENGTH: 125,
            EDITION_LENGTH: 10,
            ISBN_LENGTH: 15,
            MAX_AUTHORS: 5,
            AUTHOR_FIRST_NAME_LENGTH: 20,
            AUTHOR_LAST_NAME_LENGTH: 20
        };
        var dimensions = {
            WIDE: 'WIDE',
            WIDER: 'WIDER',
            WIDEST: 'WIDEST',
            NARROW: 'NARROW',
            NARROWER: 'NARROWER',
            NARROWEST: 'NARROWEST'
        };
        return {
            getConfirmMsg: getConfirmMsg,
            restServices: restServices,
            image: image,
            constants: constants,
            messages: messages,
            ebookJsonConstants: ebookJsonConstants,
            errorLevel: errorLevel,
            type: type,
            fieldSpecs: fieldSpecs,
            dimensions: dimensions
        };
    });
}());