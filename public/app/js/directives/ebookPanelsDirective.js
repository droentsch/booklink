(function () {
    var ebookPanelsController = function ($scope, $element, $compile, state) {
        var panels = [];
        var showNextPanel = function (newIndex) {
            if (state.getMaxAdditionalBooks() !== state.getAdditionalBooksAdded() - 1) {
                $element.append($compile('<ebook-panel info=\'{index:' + newIndex + ', data:null}\'></ebook-panel>')($scope));
            }
        };
        $scope.$watch('masterUi.showEbooks', function () {
            if ($scope.masterUi.showEbooks && $scope.editMode === false) {
                state.getDropdownData()
                    .then(function () {
                        if (!panels || panels.length === 0) {
                            $element.append($compile('<ebook-panel info=\'{index:0, data:null}\'></ebook-panel>')($scope));
                        }
                    });
            }
        });
        var broadcastPanelDeleted = function () {
            $scope.$broadcast('panel-deleted');
        };
        var broadcastPanelAdded = function () {
            $scope.$broadcast('panel-added');
        };
        var addPanel = function (index) {
            panels.push(index);
        };
        var removePanel = function (id) {
            var index = getPanelIndexById(panels, id);
            panels.splice(index, 1);
        };
        var getLastPanelIndex = function () {
            return panels[panels.length - 1];
        };
        this.showNextPanel = showNextPanel;
        this.broadcastPanelDeleted = broadcastPanelDeleted;
        this.broadcastPanelAdded = broadcastPanelAdded;
        $scope.addPanel = addPanel;
        this.removePanel = removePanel;
        this.getLastPanelIndex = getLastPanelIndex;

    };

    var app = angular.module('ebookConfigApp');
    app.directive('ebookPanels', function () {
        return {
            restrict: 'AEC',
            scope: true,
            controller: ['$scope', '$element', '$compile', 'state', ebookPanelsController]
        };
    });

    var getPanelIndexById = function (panels, id) {
        var i = 0;
        if (panels && panels.length > 0) {
            for (i = 0; i < panels.length; i++) {
                if (panels[i] === id) {
                    return i;
                }
            }
        }
        return null;
    };
}());