describe('configController', function () {
    'use strict';

    var scope = null;
    var $controllerConstructor = null;
    var modal = null;
    var log = null;
    var globalsService = null;
    var stateService = null;
    var oldOpener = null;

    beforeEach(function () {
        oldOpener = window.opener;
        window.opener = {};
        window.opener.ebookWindowOpener = {};
        window.opener.ebookWindowOpener.getEbookData = function () {};
        module("ebookConfigApp");
    });
    beforeEach(inject(function ($controller, $rootScope, $log, $modal, ebGlobals, state, $q) {
        scope = $rootScope.$new();
        $controllerConstructor = $controller;
        modal = $modal;
        globalsService = ebGlobals;
        stateService = state;
    
        stateService.getDropdownData = function () {
            return $q.when({});
        };
        log = $log;
        var ctrl = $controllerConstructor("configController", {
            $scope: scope,
            $modal: modal,
            $log: log,
            ebGlobals: globalsService,
            state: stateService
        });

    }));

    afterEach(function () {
        window.opener = oldOpener;
    });
    it('should set common ui elements on scope', function () {
        expect(scope.masterUi.showEbooks).toBe(false);
    });
    it('should toggle textFlow/Novella', function () {
        scope.masterUi.showEbooks = true;

        scope.toggleTextFlowNovella();
        expect(scope.masterUi.showEbooks).toBe(false);
    });
    it('should toggle Ebooks', function () {
        scope.masterUi.showTextFlowNovella = true;

        scope.toggleEbook();
        expect(scope.masterUi.showTextFlowNovella).toBe(false);
    });
    it('should open the confirm dialog', function () {
        scope.modalInstance = null;

        scope.openConfirm();
        expect(scope.modalInstance).not.toBe(null);
    });
    it('should drive TF/Novella UI from existing data', function () {
        scope.masterUi.showTextFlowNovella = false;
        stateService.getCurrentEbookInfo = function () {
            var x = {
                type: globalsService.ebookJsonConstants.TFNOVELLA_TYPE
            };
            return x;
        };
        scope.load();
        expect(scope.masterUi.showTextFlowNovella).toBe(true);
    });
})