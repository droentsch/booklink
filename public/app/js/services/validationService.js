(function() {

    var validation = function(ebGlobals, server, $q) {
        var exceptions = [];
        var messages = {
            NO_TYPE: 'You must select a book type',
            ISBN: 'ISBN',
            EXTERNAL_ID: 'External Product Id',
            NO_ISBN: function(isbnOrExternalId) {
                return 'You must provide an ' + isbnOrExternalId;
            },
            NO_TYPE: 'You must select a book type',
            ISBN_TOO_LONG: function(isbnOrExternalId) {
                return 'The ' + isbnOrExternalId + ' cannot have more than ' + ebGlobals.fieldSpecs.ISBN_LENGTH + ' characters';
            },
            ISBN_NO_NUMBERS: function(isbnOrExternalId) {
                return 'The ' + isbnOrExternalId + ' must contain a number';
            },
            ISBN_BAD_CHARS: function(isbnOrExternalId) {
                return 'The ' + isbnOrExternalId + ' can contain only letters and numbers';
            },
            NO_TITLE: 'The book must have a title',
            NO_EDITION: 'The book must have an edition',
            NO_IMAGE: 'You must upload a cover image for this book',
            NO_AUTHOR: 'The book must have at least one author',
            TOO_MANY_AUTHORS: 'The book can have no more than ' + ebGlobals.fieldSpecs.MAX_AUTHORS + ' authors',
            TITLE_TOO_LONG: 'The book title can have no more than ' + ebGlobals.fieldSpecs.TITLE_LENGTH + ' characters',
            TITLE_BAD_CHARS: 'The title can contain only letters, numbers, and spaces',
            EDITION_TOO_LONG: 'The edition can have no more than ' + ebGlobals.fieldSpecs.EDITION_LENGTH + ' characters',
            EDITION_BAD_CHARS: 'The edition can contain only letters, numbers, and spaces',
            NO_AUTHOR_FIRST_NAME: 'Authors must have a first name',
            NO_AUTHOR_LAST_NAME: 'Authors must have a last name',
            AUTHOR_FIRST_NAME_TOO_LONG: 'Author first names can have no more than ' + ebGlobals.fieldSpecs.AUTHOR_FIRST_NAME_LENGTH + ' characters',
            AUTHOR_LAST_NAME_TOO_LONG: 'Author last names can have no more than ' + ebGlobals.fieldSpecs.AUTHOR_LAST_NAME_LENGTH + ' characters',
            AUTHOR_NAME_BAD_CHARS: 'Author names can consist of only: letters, accented letters, spaces, and periods',
            DUPLICATE_ISBNS: 'Ebooks cannot have duplicate External Product IDs',
            INVALID_EPID: 'Invalid external product ID',
            NO_MATCH: 'No match found',
            NO_DATA: 'No data was returned from the server',
            NO_SERVER: 'Validation error at server'
        };

        var isEbookCollectionAccepted = function(isbns) {
            var i = 0;
            var j = 0;
            var times = 0;
            exceptions = [];
            for (i = 0; i < isbns.length; i++) {
                times = 0;
                for (j = 0; j < isbns.length; j++) {
                    if (isbns[j] === isbns[i]) {
                        times++;
                        if (times > 1) {
                            exceptions.push(Exception(ebGlobals.errorLevel.ERROR, messages.DUPLICATE_ISBNS));
                            return false;
                        }
                    }
                }
            }
            return true;
        };
        var isTfnAccepted = function(data, level) {
            exceptions = [];
            exists(data.tfNovellaType, level, messages.NO_TYPE, ebGlobals.type.STRING);
            exists(data.tfNovellaIsbn, level, messages.NO_ISBN('ISBN'), ebGlobals.type.STRING);

            if (exceptions.length > 0) return false;

            if (!isIsbnAccepted(data.tfNovellaIsbn, level, messages.ISBN)) return false;

            return true;
        };
        var isEbookAccepted = function(data, level) {
            exceptions = [];
            exists(data.productId, level, messages.NO_TYPE, ebGlobals.type.NUMBER);
            exists(data.externalId, level, messages.NO_ISBN(messages.EXTERNAL_ID), ebGlobals.type.STRING);

            if (exceptions.length > 0) return false;

            if (data.productType !== ebGlobals.ebookJsonConstants.READER17) {
                exists(data.title, level, messages.NO_TITLE, ebGlobals.type.STRING);
                exists(data.edition, level, messages.NO_EDITION, ebGlobals.type.STRING);

                if (exceptions.length > 0) return false;

                if (!exists(data.imageId, level, messages.NO_IMAGE, ebGlobals.type.STRING)) return false;

                if (!exists(data.authors, level, messages.NO_AUTHOR, ebGlobals.type.ARRAY)) return false;

                if (!isIsbnAccepted(data.externalId, level, messages.EXTERNAL_ID)) return false;

                isTitleAccepted(data.title, level);
                isEditionAccepted(data.edition, level);

                if (exceptions.length > 0) return false;

                if (!isAuthorsAccepted(data.authors)) return false;
            }

            return true;
        };
        var exists = function(data, level, message, type) {
            if (type === ebGlobals.type.STRING || type === ebGlobals.type.ARRAY) {
                if (angular.isUndefined(data) || data === null || angular.isUndefined(data.length) || data.length === 0) {
                    exceptions.push(Exception(level, message));
                    return false;
                }
            }
            if (type === ebGlobals.type.NUMBER) {
                if (typeof data === undefined || data === null || isNaN(parseInt(data)) || data === 0) {
                    exceptions.push(Exception(level, message));
                    return false;
                }
            }
            return true;
        };
        var isIsbnAccepted = function(isbn, level, isbnOrExternalId) {
            if (isbn.length > ebGlobals.fieldSpecs.ISBN_LENGTH) {
                exceptions.push(Exception(level, messages.ISBN_TOO_LONG(isbnOrExternalId)));
            }
            var numPatt = /\d/;
            if (!numPatt.test(isbn)) {
                exceptions.push(Exception(level, messages.ISBN_NO_NUMBERS(isbnOrExternalId)));
                return false;
            }

            return true;
        };
        var searchMatch = function(data) {
            exceptions = [];
            if (!data) {
                exceptions.push(Exception(ebGlobals.errorLevel.ERROR, messages.NO_DATA));
                return false;
            }
            if (!data.match) {
                exceptions.push(Exception(ebGlobals.errorLevel.WARNING, messages.NO_MATCH));
                return false;
            }
            return true;
        };
        var handleEpidCheck = function(data) {
            exceptions = [];
            if (!angular.isUndefined(data) && !angular.isUndefined(data.response)) {
                if (data.response === false) {
                    exceptions.push(Exception(ebGlobals.errorLevel.ERROR, messages.INVALID_EPID));
                    return false;
                }
            } else {
                exceptions.push(Exception(ebGlobals.errorLevel.ERROR, messages.NO_SERVER));
                return false;
            }
            return true;
        };
        var isTfnPostAccepted = function(scope) {
            var data = {};
            data = stripTfnScope(scope);
            if (isTfnAccepted(data, ebGlobals.errorLevel.ERROR)) {
                if (data.hasLooseLeaf === true) {
                    isIsbnAccepted(data.looseLeafIsbn, ebGlobals.errorLevel.ERROR, messages.ISBN);
                }
            }
            if (exceptions.length > 0) return false;
            return true;
        };
        var isTfnScopeAccepted = function(scope) {
            var data = {};
            data = stripTfnScope(scope);

            if (data.hasLooseLeaf === true) {
                return isTfnAccepted(data, ebGlobals.errorLevel.WARNING);
            }
            return true;
        };
        var isEbookPostAccepted = function(data) {
            if (isEbookAccepted(data, ebGlobals.errorLevel.ERROR)) {
                if (data.looseLeaf === true) {
                    isIsbnAccepted(data.looseLeafIsbn, ebGlobals.errorLevel.ERROR, messages.ISBN);
                }
            }
            if (exceptions.length > 0) return false;
            return true;
        };
        var isEbookScopeAccepted = function(data) {
            if (data.looseLeaf === true) {
                exceptions = [];
                exists(data.productId, ebGlobals.errorLevel.WARNING, messages.NO_TYPE, ebGlobals.type.NUMBER);
                exists(data.externalId, ebGlobals.errorLevel.WARNING, messages.NO_ISBN(messages.EXTERNAL_ID), ebGlobals.type.STRING);

                if (exceptions.length > 0) return false;

                if (!isIsbnAccepted(data.externalId, ebGlobals.errorLevel.WARNING, messages.EXTERNAL_ID)) return false;
            }
            return true;
        };
        var isAuthorsAccepted = function(authors) {
            var i = 0;
            if (authors.length > ebGlobals.fieldSpecs.MAX_AUTHORS) {
                exceptions.push(Exception(ebGlobals.errorLevel.ERROR, messages.TOO_MANY_AUTHORS));
                return false;
            }
            return true;
        };
        var isAuthorAccepted = function(firstName, lastName, authors) {
            exceptions = [];
            var i = 0;
            if (!angular.isUndefined(authors) && authors !== null && !angular.isUndefined(authors.length) && authors.length > 0) {
                if (authors.length >= ebGlobals.fieldSpecs.MAX_AUTHORS) {
                    exceptions.push(Exception(ebGlobals.errorLevel.WARNING, messages.TOO_MANY_AUTHORS));
                    return false;
                }
            }
            if (!exists(firstName, ebGlobals.errorLevel.WARNING, messages.NO_AUTHOR_FIRST_NAME, ebGlobals.type.STRING)) return false;
            if (!exists(lastName, ebGlobals.errorLevel.WARNING, messages.NO_AUTHOR_LAST_NAME, ebGlobals.type.STRING)) return false;
            if (!isAuthorFirstNameAccepted(firstName, ebGlobals.errorLevel.WARNING)) return false;
            if (!isAuthorLastNameAccepted(lastName, ebGlobals.errorLevel.WARNING)) return false;
            return true;
        };
        var isAuthorFirstNameAccepted = function(name, level) {
            if (name.length > ebGlobals.fieldSpecs.AUTHOR_FIRST_NAME_LENGTH) {
                exceptions.push(Exception(level, messages.AUTHOR_FIRST_NAME_TOO_LONG));
                return false;
            }
            return isAuthorNameAccepted(name, level);
        };
        var isAuthorLastNameAccepted = function(name, level) {
            if (name.length > ebGlobals.fieldSpecs.AUTHOR_LAST_NAME_LENGTH) {
                exceptions.push(Exception(level, messages.AUTHOR_LAST_NAME_TOO_LONG));
                return false;
            }
            return isAuthorNameAccepted(name, level);
        };
        var isAuthorNameAccepted = function(name, level) {
            var pattern = /^[a-z\u00C0-\u00FF \.]+$/i;
            if (!pattern.test(name)) {
                exceptions.push(Exception(level, messages.AUTHOR_NAME_BAD_CHARS));
                return false;
            }
            return true;
        };
        var isTitleAccepted = function(title, level) {
            if (title.length > ebGlobals.fieldSpecs.TITLE_LENGTH) {
                exceptions.push(Exception(level, messages.TITLE_TOO_LONG));
                return false;
            }

            return true;
        };
        var isEditionAccepted = function(edition, level) {
            if (edition.length > ebGlobals.fieldSpecs.EDITION_LENGTH) {
                exceptions.push(Exception(level, messages.EDITION_TOO_LONG));
                return false;
            }
            var patt = /^[a-z0-9 ]+$/i;
            if (!patt.test(edition)) {
                exceptions.push(Exception(level, messages.EDITION_BAD_CHARS));
            }

            return true;
        };
        var stripTfnScope = function(scope) {
            var data = {};
            data.tfNovellaIsbn = scope.tfNovellaIsbn;
            data.tfNovellaType = scope.tfNovellaType;
            data.hasLooseLeaf = scope.hasLooseLeaf;
            data.looseLeafIsbn = scope.looseLeafIsbn;

            return data;
        };
        var getExceptions = function() {
            return exceptions;
        };
        return {
            isTfnPostAccepted: isTfnPostAccepted,
            isTfnScopeAccepted: isTfnScopeAccepted,
            isEbookPostAccepted: isEbookPostAccepted,
            isEbookScopeAccepted: isEbookScopeAccepted,
            isAuthorsAccepted: isAuthorsAccepted,
            isAuthorAccepted: isAuthorAccepted,
            isEbookCollectionAccepted: isEbookCollectionAccepted,
            getExceptions: getExceptions,
            searchMatch: searchMatch
        };
    };

    var app = angular.module('ebookConfigApp');
    app.factory('validation', ['ebGlobals', 'server', '$q', validation]);

    var Exception = function(level, message) {
        return {
            level: level,
            message: message
        };
    }
}());