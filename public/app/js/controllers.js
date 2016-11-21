(function() {
    var ebookConfigApp = angular.module('ebookConfigApp');


    var configController = function($scope, $modal, $log, ebGlobals, state, validation) {
        var runThrobber = function() {
            $scope.showThrobber = true;
        };
        var stopThrobber = function() {
            $scope.showThrobber = false;
        };

        state.registerMasterView({
            runThrobber: runThrobber,
            stopThrobber: stopThrobber
        });

        var ebookData = null;
        var ui = {
            showEbooks: false,
            showTextFlowNovella: false
        };
        var toggleTextFlowNovella = function() {
            if ($scope.masterUi.showEbooks === true) {
                $scope.masterUi.showEbooks = false;
            }
        };
        var toggleEbook = function() {
            if ($scope.masterUi.showTextFlowNovella === true) {
                $scope.masterUi.showTextFlowNovella = false;
            }
        };
        var closeApp = function() {
            window.close();
        };
        var save = function() {
            $scope.showValidationAlert = false;

            if ($scope.masterUi.showEbooks === true) {
                if (!state.isEbookPanelDataConfirmed()) return;
                if (!state.isEbookCollectionConfirmed()) {
                    $scope.exceptions = validation.getExceptions();
                    $scope.showValidationAlert = true;
                    return;
                }
                openConfirm(ebGlobals.ebookJsonConstants.EBOOK_TYPE);
            } else if ($scope.masterUi.showTextFlowNovella === true) {
                if (!validation.isTfnPostAccepted($scope)) {
                    $scope.exceptions = validation.getExceptions();
                    $scope.showValidationAlert = true;
                    return;
                }
                openConfirm(ebGlobals.ebookJsonConstants.TFNOVELLA_TYPE);
            } else {
                openConfirm(ebGlobals.ebookJsonConstants.NO_TYPE);
            }
        };
        var openConfirm = function(type) {

            $scope.modalInstance = $modal.open({
                templateUrl: 'app/view/confirmation.html?_=date-param',
                controller: 'confirmationController',
                size: 'lg',
                resolve: {
                    msg: function() {
                        return ebGlobals.getConfirmMsg();
                    }
                }
            });

            $scope.modalInstance.result.then(function() {
                if (type === ebGlobals.ebookJsonConstants.EBOOK_TYPE) {
                    state.savePanelData()
                        .then(goodSave, badSave);
                } else if (type === ebGlobals.ebookJsonConstants.TFNOVELLA_TYPE) {
                    state.saveTfNovella(getScope)
                        .then(goodSave, badSave);
                } else if (type === ebGlobals.ebookJsonConstants.NO_TYPE) {
                    state.deleteAll()
                        .then(goodSave, badSave);
                }
            }, function() {});
        };
        var getScope = function() {
            return {
                tfNovellaType: $scope.tfNovellaType,
                tfNovellaIsbn: $scope.tfNovellaIsbn,
                hasLooseLeaf: $scope.hasLooseLeaf,
                looseLeafIsbn: $scope.looseLeafIsbn
            };
        };
        var goodSave = function(data) {
            $scope.showValidationAlert = false;
            if (data && data.errorLevel) {
                $scope.exceptions = validation.getExceptions();
                $scope.showValidationAlert = true;
                return;
            }
            if (data && (data.response || data.response === false) && data.isError === true) {
                badSave(data.msg);
                return;
            }
            if (data && typeof data.response === undefined && data.status && data.status !== 200) {
                badSave();
                return;
            }
            if (window.opener && window.opener.ebookWindowOpener && window.opener.ebookWindowOpener.refreshEbookData) {
                window.opener.ebookWindowOpener.refreshEbookData(ebookData.courseISBN);
            }
            //closeApp();
        };
        var badSave = function(msg) {
            $scope.serverError = ebGlobals.messages.onSaveError;
            if (msg) {
                $scope.serverError = msg;
            }
            $scope.showServerError = true;
            return this;
        };
        var closeServerError = function() {
            $scope.showServerError = false;
        };
        var looseleafChecked = function() {
            if (!validation.isTfnScopeAccepted($scope)) {
                $scope.hasLooseLeaf = false;
                $scope.exceptions = validation.getExceptions();
                $scope.showValidationAlert = true;
            } else {
                $scope.showValidationAlert = false;
            }
        };
        $scope.showThrobber = false;
        $scope.modalInstance = null;
        $scope.masterUi = ui;
        $scope.toggleTextFlowNovella = toggleTextFlowNovella;
        $scope.toggleEbook = toggleEbook;
        $scope.openConfirm = openConfirm;
        $scope.closeApp = closeApp;
        $scope.tfNovellaType = '';
        $scope.tfNovellaIsbn = '';
        $scope.hasLooseLeaf = false;
        $scope.editMode = false;
        $scope.looseLeafIsbn = '';
        $scope.orderedBooks = [];
        $scope.save = save;
        $scope.serverError = ebGlobals.messages.onSaveError;
        $scope.showServerError = false;
        $scope.closeServerError = closeServerError;
        $scope.looseleafChecked = looseleafChecked;
        $scope.exceptions = null;
        $scope.showValidationAlert = false;

        //UI drivers
        var driveUI = function() {
            if (ebookData.type === ebGlobals.ebookJsonConstants.TFNOVELLA_TYPE) {
                driveTfNovella();
            } else if (ebookData.type === ebGlobals.ebookJsonConstants.EBOOK_TYPE) {
                driveEbook();
            }
        };
        var driveTfNovella = function() {
            $scope.masterUi.showTextFlowNovella = true;
            var theBook = null;
            if (!ebookData.ebooks || ebookData.ebooks.length === 0) return;
            theBook = ebookData.ebooks[0];
            $scope.tfNovellaType = theBook.providerName.toUpperCase();
            $scope.tfNovellaIsbn = theBook.externalProductId;
            if (theBook.isLooseleafEnabled) {
                $scope.hasLooseLeaf = true;
                $scope.looseLeafIsbn = theBook.looseleafISBN;
            }
        };
        var driveEbook = function() {
            state.getDropdownData()
                .then(function() {
                    $scope.editMode = true;
                    $scope.masterUi.showEbooks = true;
                    $scope.orderedBooks = orderBooksByPrimary();
                });
        };
        var orderBooksByPrimary = function() {
            var books = ebookData.ebooks;
            var orderedBooks = [];
            var primaryBooks = [];
            var nonPrimaryBooks = [];
            if (books && books.length > 0) {
                for (i = 0; i < books.length; i++) {
                    if (!books[i].isPrimary) nonPrimaryBooks.push(books[i]);
                    else if (books[i].isPrimary) primaryBooks.push(books[i]);
                }
                orderedBooks = primaryBooks.concat(nonPrimaryBooks);
            }
            return orderedBooks;
        };
        var load = function() {
            ebookData = state.getCurrentEbookInfo();

            if (ebookData.courseISBN) {
                state.getDropdownData(ebookData.courseISBN)
                    .then(function() {
                        if (ebookData && ebookData.type !== ebGlobals.ebookJsonConstants.NO_TYPE) {
                            driveUI();
                        }
                    });
            }
        };

        $scope.load = load;
        $scope.load();
    };

    var confirmationController = function($scope, $modalInstance, msg) {
        var showError = function() {
            $scope.isInvalidSave = true;
        };
        var hideError = function() {
            $scope.isInvalidSave = false;
        };
        $scope.ok = function() {
            if (!$scope.isAgreementSelected) {
                showError();
            } else {
                $modalInstance.close();
            }
        };

        $scope.cancel = function() {
            $modalInstance.dismiss();
        };
        $scope.msg = msg;
        $scope.isAgreementSelected = false;
        $scope.isInvalidSave = false;
        $scope.hideError = hideError;

    };
    ebookConfigApp.controller('configController', ['$scope', '$modal', '$log', 'ebGlobals', 'state', 'validation', configController]);
    ebookConfigApp.controller('confirmationController', ['$scope', '$modalInstance', 'msg', confirmationController]);

}());