;
(function() {
    var ImageWatch = function(scope, state, q, globals) {
        scope.$watch('files', function() {
            scope.uploadReady = false
            if (scope.files && scope.files.length > 0) {
                checkValidImage(scope.files[0])
                    .then(function() {
                        if (!scope.badImage) {
                            scope.uploadReady = true
                        } else {
                            scope.uploadReady = false
                        }
                    })
            }
        })
        var upload = function() {
            var files = scope.files
            var file = null
            if (files && files.length > 0) {
                file = files[0]
                state.setImage(file, scope.info.index)
                    .then(successfulImageUpload, errorImageUpload)
            }
        }
        var successfulImageUpload = function(data) {
            if (data.status && (data.status === 204)) {
                errorImageUpload()
            } else {
                scope.serverErrorOnImageUpload = false
                scope.data.imageUrl = data.data.resourceURL
                scope.data.imageId = data.data.resourceId
                scope.uploadReady = false
            }
        }
        var errorImageUpload = function(reason) {
            scope.serverErrorOnImageUpload = true
        }
        var checkValidImage = function(file) {
            return q(function(resolve, reject) {
                var fr = new FileReader()
                fr.readAsDataURL(file)
                fr.onload = function() {
                    var img = new Image()
                    img.src = fr.result

                    img.onload = function() {
                        if (img.width > globals.image.WIDTH || img.height > globals.image.HEIGHT || file.size > globals.image.SIZE) {
                            scope.badImage = true
                        } else {
                            scope.badImage = false
                        }
                        resolve(scope.badImage)
                    }
                }
            })
        }
        var closeServerError = function() {
            scope.serverErrorOnImageUpload = false
        }

        return {
            closeServerError: closeServerError,
            upload: upload
        }
    }
    var ScopeData = function(index, image) {
        return {
            productId: '',
            editable: true,
            productType: '',
            externalId: '',
            isPrimary: index === 0 ? true : false,
            looseLeaf: false,
            looseLeafIsbn: '',
            edition: '',
            title: '',
            imageUrl: image,
            imageId: 0,
            authors: []
        }
    }
    var ebookPanelController = function($scope, state, $q, ebGlobals, validation) {
        var originalType = null;
        var searchData = null;
        var bookSearchComplete = false;
        var uploader = ImageWatch($scope, state, $q, ebGlobals);
        $scope.authors = [];
        $scope.ui = {
            hideAuthorPanel: true,
            authorFirstName: null,
            authorLastName: null
        }
        var mapServerValues = function(data) {
            var canEdit = true;
            if (data.editable === false) {
                canEdit = false;
            }
            return {
                productId: data.productId,
                editable: canEdit,
                productType: data.productType,
                externalId: data.externalProductId,
                looseLeaf: data.isLooseleafEnabled,
                looseLeafIsbn: data.looseleafISBN,
                isPrimary: data.isPrimary,
                title: data.title,
                edition: data.edition,
                authors: angular.copy(data.authors),
                imageId: data.imageId,
                imageUrl: data.imageId === '0' ? ebGlobals.image.PLACEHOLDER : data.imageUrl
            }
        }
        var mapSearchValues = function(data) {
            return {
                editable: false,
                isPrimary: $scope.info.index === 0 ? true : false,
                productId: $scope.type.productId,
                productType: $scope.type.productType,
                externalId: data.epid,
                title: data.title,
                edition: data.edition,
                authors: data.authors,
                imageId: null,
                imageUrl: data.thumbnail
            }
        }
        if ($scope.info.data) {
            $scope.data = mapServerValues($scope.info.data);
        } else {
            $scope.data = ScopeData($scope.info.index, ebGlobals.image.PLACEHOLDER);
        }
        var setDropdownData = function(data) {
            $scope.productTypes = data;
            $scope.type = getSelectedProductType($scope.productTypes, $scope.data.productId, 'productId');
            originalType = $scope.type;
        }
        var getSelectedProductType = function(products, typeId, prop) {
            var i = null;
            if (products && products.length > 0) {
                for (i = 0; i < products.length; i++) {
                    if (products[i][prop] == typeId) {
                        return products[i];
                    }
                }
            }
            return '';
        };
        var toggleAuthorPanel = function() {
            $scope.ui.hideAuthorPanel = !$scope.ui.hideAuthorPanel
        };

        var validateSearchMatch = function() {
            if (!validation.searchMatch(searchData)) {
                $scope.exceptions = validation.getExceptions();
                $scope.showValidationAlert = true;
                return false;
            }
            $scope.showValidationAlert = false;
            return true;
        };
        var getScopeData = function() {
            try {
                $scope.$digest();
            } catch (e) {}
            var d = serverPrep();
            return d;
        };
        var serverPrep = function() {
            var d = $scope.data;
            if (d.imageId === 0) {
                d.imageId = '';
            }
            if ($scope.type) {
                d.productId = $scope.type.productId;
                d.productType = $scope.type.productType;
            } else {
                d.productId = 0;
                d.productType = '';
            }
            return d;
        };
        var setValidationMessage = function(clear, exceptions) {
            if (clear === true) {
                $scope.showValidationAlert = false;
                return;
            }
            $scope.exceptions = exceptions;
            $scope.showValidationAlert = true;
        };
        var looseleafChecked = function() {
            if (!validation.isEbookScopeAccepted(serverPrep())) {
                $scope.data.looseLeaf = false;
                $scope.exceptions = validation.getExceptions();
                $scope.showValidationAlert = true;
            } else {
                $scope.showValidationAlert = false;
            }
        }
        var displaySearchResults = function(data) {
            searchData = data;
            $scope.searchData = searchData;
            if (validateSearchMatch()) {
                $scope.data = mapSearchValues(searchData);
                bookSearchComplete = true;
            }
        };
        var search = function() {
            return $scope.type.productType === ebGlobals.ebookJsonConstants.READER17
        };
        var searchService = function() {
            state.searchService($scope.searchId)
                .then(displaySearchResults);
        };
        // event handlers
        var onTypeChange = function() {
            if (!originalType) {
                if (bookSearchComplete) {
                    $scope.type = getSelectedProductType($scope.productTypes, ebGlobals.ebookJsonConstants.READER17, 'productType')
                }
                if ($scope.type.productType === ebGlobals.ebookJsonConstants.READER17) {
                    $scope.data.editable = false;
                } else {
                    $scope.data.editable = true;
                }
            } else {
                if ($scope.type.productType === ebGlobals.ebookJsonConstants.READER17) {
                    $scope.type = originalType;
                }
            }
        };

        var promise = null
        promise = state.getDropdownData()
        promise.then(setDropdownData)

        state.registerPanel($scope.info.index, getScopeData, setValidationMessage)
        $scope.$parent.addPanel($scope.info.index)

        $scope.files = null;
        $scope.type = '';
        $scope.uploadReady = ($scope.files && $scope.files.length > 0);
        $scope.uploadInProgress = false;
        $scope.max = state.getMaxAdditionalBooks();
        $scope.maxIsReached = ($scope.max === state.getAdditionalBooksAdded() - 1);
        $scope.elementName = $scope.data.isPrimary ? 'Textbook' : 'Additional Book';
        $scope.addButtonText = 'Setup Additional Book';
        $scope.uploadImageText = 'Upload image';
        $scope.uploadButtonDisabled = true;
        $scope.toggleAuthorPanel = toggleAuthorPanel;
        $scope.upload = uploader.upload;
        $scope.badImage = false;
        $scope.acceptableWidth = ebGlobals.image.WIDTH;
        $scope.acceptableHeight = ebGlobals.image.HEIGHT;
        $scope.acceptableWeight = ebGlobals.image.SIZE / ebGlobals.constants.BYTES_PER_MEGABYTE;
        $scope.serverErrorOnImageUpload = false;
        $scope.closeServerError = uploader.closeServerError;
        $scope.unregisterPanel = state.unregisterPanel;
        $scope.getAdditionalBooksAdded = state.getAdditionalBooksAdded;
        $scope.showValidationAlert = false;
        $scope.exceptions = null;
        $scope.looseleafChecked = looseleafChecked;
        $scope.searchId = null;
        $scope.onTypeChange = onTypeChange;
        $scope.search = search;
        $scope.searchService = searchService;
    }
    var ebookPanelLink = function(scope, element, attrs, controller) {
        var addNewPanel = function() {
            controller.showNextPanel(scope.info.index + 1)
            controller.broadcastPanelAdded()
        }
        var deletePanel = function() {
            scope.unregisterPanel(scope.info.index)
            controller.removePanel(scope.info.index)
            element.remove()
            controller.broadcastPanelDeleted()
        }
        var updateScopeOnPanelDelete = function() {
            scope.maxIsReached = (scope.max === scope.getAdditionalBooksAdded() - 1) || (controller.getLastPanelIndex() !== scope.info.index)
        }

        var updateScopeOnPanelAdd = function() {
            scope.maxIsReached = (scope.max >= scope.getAdditionalBooksAdded() - 2) || (controller.getLastPanelIndex() !== scope.info.index)
        }

        scope.$on('panel-deleted', updateScopeOnPanelDelete)
        scope.$on('panel-added', updateScopeOnPanelAdd)

        scope.addNewPanel = addNewPanel
        scope.deletePanel = deletePanel
    }
    var app = angular.module('ebookConfigApp')

    app.directive('ebookPanel', function() {
        var scopes = []
        return {
            restrict: 'AEC',
            templateUrl: 'app/view/ebookTemplate.html?_=date-param',
            scope: {
                info: '=info'
            },
            replace: false,
            require: '^ebookPanels',
            controller: ['$scope', 'state', '$q', 'ebGlobals', 'validation', ebookPanelController],
            link: ebookPanelLink
        }
    })
}())