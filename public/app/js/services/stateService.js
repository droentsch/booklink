(function() {
    var state = function(server, $q, ebGlobals, validation) {
        var dropdownData = null;
        var additionalBooksAdded = 0;
        var courseISBN = null;
        var ebookData = null;
        var tfNovellaData = null;
        var eBooksExceptions = null;
        var panels = [];
        var books = [];
        var application = null;

        var getDropdownData = function(isbn) {
            if (dropdownData === null) {
                application.runThrobber();
                return server.getDropdownData(isbn)
                    .then(function(data) {
                        dropdownData = data;
                        application.stopThrobber();
                        return data;
                    }, function(reason) {
                        return reason;
                    });
            } else {
                return $q.when(dropdownData);
            }
        };
        var searchService = function(id) {
            return server.searchService(id)
                .then(function(data) {
                    return data;
                }, function(reason) {
                    return reason;
                });
        };
        var registerPanel = function(panelId, getScope, setValidation) {
            panel = Panel(server, application);
            panel.setId(panelId);
            panel.getScopeData = getScope;
            panel.setValidationMessage = setValidation;
            panels.push(panel);
            additionalBooksAdded += 1;
            return panel;
        };
        var unregisterPanel = function(panelId) {
            var idx = getPanelIndexById(panelId);
            if (idx !== null) {
                panels.splice(idx, 1);
                additionalBooksAdded -= 1;
            }
        };
        var registerMasterView = function(properties) {
            application = properties;
        };
        var setImage = function(image, panelId) {
            var panel = getPanelById(panelId);
            return panel.setImage(image);
        };

        var getMaxAdditionalBooks = function() {
            return 2; //hard-coded for now
        };
        var getAdditionalBooksAdded = function() {
            return additionalBooksAdded;
        };
        var getPanelById = function(id) {
            var i = null;
            for (i = 0; i < panels.length; i++) {
                if (panels[i].getId() === id) {
                    return panels[i];
                }
            }
        };
        var savePanelData = function() {
            books = [];
            var readyForJson = null;
            var preppedData = null;
            angular.forEach(panels, function(panel) {
                if (isReader17(panel)) {
                    preppedData = prepReader17PanelDataForServer(panel);
                } else {
                    preppedData = prepEbookPanelDataForServer(panel);
                }
                if (preppedData !== null) {
                    books.push(preppedData);
                }
            });
            readyForJson = compileEbooksData();
            application.runThrobber();
            return server.saveEbooks(readyForJson)
                .then(function(data) {
                    application.stopThrobber();
                    return data;
                }, function(reason) {
                    application.stopThrobber();
                    return reason;
                });

        };
        var isReader17 = function(panel) {
            var data = panel.getScopeData();
            return (data.productType === ebGlobals.ebookJsonConstants.READER17);
        };

        var isEbookCollectionConfirmed = function() {
            var isbns = [];
            angular.forEach(panels, function(panel) {
                var scopeData = panel.getScopeData();
                isbns.push(scopeData.externalId);
            });
            return validation.isEbookCollectionAccepted(isbns);
        };
        var isEbookPanelDataConfirmed = function() {
            var isConfirmed = true;
            angular.forEach(panels, function(panel) {
                var scopeData = panel.getScopeData();
                if (!validation.isEbookPostAccepted(scopeData)) {
                    var exceptions = validation.getExceptions();
                    panel.setValidationMessage(false, exceptions);
                    isConfirmed = false;
                } else {
                    panel.setValidationMessage(true);
                }
            });
            return isConfirmed;
        };
        var prepReader17PanelDataForServer = function(panel) {
            var scopeData = panel.getScopeData();
            return {
                isPrimary: scopeData.isPrimary,
                productId: scopeData.productId,
                productType: scopeData.productType,
                externalProductId: scopeData.externalId,
                isLooseleafEnabled: scopeData.looseLeaf,
                looseleafISBN: scopeData.looseLeafIsbn,
            };
            return null;
        };
        var prepEbookPanelDataForServer = function(panel) {
            var scopeData = panel.getScopeData();
            return {
                isPrimary: scopeData.isPrimary,
                productId: scopeData.productId,
                productType: scopeData.productType,
                externalProductId: scopeData.externalId,
                isLooseleafEnabled: scopeData.looseLeaf,
                looseleafISBN: scopeData.looseLeafIsbn,
                imageId: scopeData.imageId,
                imageUrl: scopeData.imageUrl,
                title: scopeData.title,
                edition: scopeData.edition,
                authors: scopeData.authors
            };
            return null;
        };
        var saveTfNovella = function(scopeGetter) {
            tfNovellaData = scopeGetter();
            if (tfNovellaData) {
                var readyForJson = prepTfNScopeDataForServer();
                application.runThrobber();
                return server.saveTfNovella(readyForJson)
                    .then(function(data) {
                        application.stopThrobber();
                        return data;
                    }, function(reason) {
                        application.stopThrobber();
                        return reason;
                    });
            }
        };
        var deleteAll = function() {
            var data = {
                type: ebGlobals.ebookJsonConstants.NO_TYPE,
                courseISBN: ebookData.courseIsbn,
                ebooks: []
            };

            application.runThrobber();
            return server.deleteAll(data)
                .then(function() {
                    application.stopThrobber()
                }, function(reason) {
                    application.stopThrobber();
                    return reason;
                });
        };
        var setEbookData = function(data) {
            ebookData = data;
        };
        var getPanelIndexById = function(id) {
            var i = 0;
            if (panels && panels.length > 0) {
                for (i = 0; i < panels.length; i++) {
                    if (panels[i].getId() === id) {
                        return i;
                    }
                }
            }
            return null;
        };
        var compileEbooksData = function() {
            if (books && books.length > 0) {
                return {
                    type: ebGlobals.ebookJsonConstants.EBOOK_TYPE,
                    courseISBN: ebookData.courseISBN,
                    ebooks: books
                };
            }
            return null;
        };
        var getCurrentEbookInfo = function() {
            return ebookData;
        };
        var prepTfNScopeDataForServer = function() {
            var data = {};
            data.type = ebGlobals.ebookJsonConstants.TFNOVELLA_TYPE;
            data.courseISBN = ebookData.courseIsbn;

            eb = {};
            eb.url = {};
            if (tfNovellaData.tfNovellaType === ebGlobals.ebookJsonConstants.NOVELLA) {
                eb.url.student = ebookData.url.studentNovellaUrl;
                eb.url.instructor = ebookData.url.instructorNovellaUrl;
            } else {
                eb.url.student = ebookData.url.textflowUrl;
                eb.url.instructor = ebookData.url.textflowUrl;
            }
            eb.externalProductId = tfNovellaData.tfNovellaIsbn;
            eb.providerName = tfNovellaData.tfNovellaType;
            eb.isLooseleafEnabled = tfNovellaData.hasLooseLeaf;
            eb.looseleafISBN = tfNovellaData.looseLeafIsbn;

            data.ebooks = [];

            data.ebooks.push(eb);

            return data;
        };
        return {
            getDropdownData: getDropdownData,
            getMaxAdditionalBooks: getMaxAdditionalBooks,
            getAdditionalBooksAdded: getAdditionalBooksAdded,
            setImage: setImage,
            setEbookData: setEbookData,
            registerPanel: registerPanel,
            registerMasterView: registerMasterView,
            savePanelData: savePanelData,
            unregisterPanel: unregisterPanel,
            getCurrentEbookInfo: getCurrentEbookInfo,
            saveTfNovella: saveTfNovella,
            deleteAll: deleteAll,
            isEbookPanelDataConfirmed: isEbookPanelDataConfirmed,
            isEbookCollectionConfirmed: isEbookCollectionConfirmed,
            searchService: searchService
        };
    };
    var Panel = function(server, application) {
        var id = null;

        var setImage = function(image) {
            application.runThrobber();
            return server.setImage(image)
                .then(function(data) {
                    application.stopThrobber();
                    return data;
                });

        };
        var getId = function() {
            return id;
        };

        var setId = function(panelId) {
            id = panelId;
        };

        return {
            setImage: setImage,
            getId: getId,
            setId: setId
        };
    };

    var app = angular.module('ebookConfigApp');
    app.factory('state', ['server', '$q', 'ebGlobals', 'validation', state]);

}());