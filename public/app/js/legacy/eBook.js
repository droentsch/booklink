(function () {
    var ebookUi = function () {
        var PRODUCTS = 'PRODUCTS';
        var PROVIDER = 'PROVIDER';
        var checkboxSelector = '[data-role-ebook-checkbox]';
        var statusSelector = '[data-role-ebook-status]';
        var $checkbox = null;
        var $status = null;

        var init = function () {
            mapObjects();
        };
        var mapObjects = function () {
            $checkbox = $(checkboxSelector);
            $status = $(statusSelector);
        };

        var setUi = function (data) {
            init();
            var status = "";
            if (!data || !data.ebooks || data.ebooks.length === 0) {
                $checkbox.prop('checked', false);
                $status.html('');
                return;
            }
            $checkbox.prop('checked', true);
            if (data.type === PROVIDER) {
                status = '(' + data.ebooks[0].providerName + ')';
            }
            if (data.type === PRODUCTS) {
                status = '(' + data.ebooks.length + ' - New EBook)';
            }
            $status.html(status);
            $status.show();
        };

        return {
            setUi: setUi
        };
    }();
    var urlData = function () {
        var studentNovellaSelector = 'input[name="student_url_novella"]';
        var textflowSelector = 'input[name="textflow_url"]';
        var instructorNovellaSelector = 'input[name="instructor_url_novella"]';
        var $studentNovella = null;
        var $instructorNovella = null;
        var $textflow = null;

        var init = function () {
            mapObjects();
        };
        var mapObjects = function () {
            $studentNovella = $(studentNovellaSelector);
            $textflow = $(textflowSelector);
            $instructorNovella = $(instructorNovellaSelector);
        };
        var getData = function () {
            init();
            var data = {};
            data.textflowUrl = $textflow.val();
            data.studentNovellaUrl = $studentNovella.val();
            data.instructorNovellaUrl = $instructorNovella.val();

            return data;
        };

        return {
            getData: getData
        };

    }();
    var ebookWindowOpener = function (ui, ud) {

        var CHILD_LOCATION = '/productconfig/ebookConfigApp/index.html?_=1234567';
        var DATA_RETRIEVAL_SERVICE = '/connectconfig/restservices/controller/ebook/action/ebookConfig?courseISBN=';
        var WINDOW_SETTINGS = 'left = 0, top = 0, toolbar = 0, status = 0, location=no, scrollbars=yes';
        var WINDOW_NAME = 'Ebook Configuration';

        var ebookButtonSelector = '#btnEbookSetup';
        var inputSelector = '#action_create_edit';
        var $body = null;
        var $input = null;
        var ebookData = null;
        var courseIsbn = null;
        var disciplineId = 0;
        var ISBNInputMappedAndBound = false;

        var init = function () {
            mapObjects();
            bindEvents();
        };
        var mapObjects = function () {
            $body = $(document.body);
        };
        var bindEvents = function () {
            $body.on('click', ebookButtonSelector, openWindow);
        };

        var openWindow = function () {
            if (ebookData !== null && courseIsbn !== null) {
                window.open(CHILD_LOCATION, WINDOW_NAME, WINDOW_SETTINGS);
            }
        };

        var setDisciplineId = function (id) {
            mapBindISBNInput();
            disciplineId = id;
            initEbookData();
        };

        var setEbookData = function (isbn) {
            mapBindISBNInput();
            courseIsbn = isbn;
            initEbookData();
        };

        var initEbookData = function () {
            if (courseIsbn != null && disciplineId != 0) {
                $.getJSON(DATA_RETRIEVAL_SERVICE + courseIsbn).then(populateEbookData);
            }
        };
        var refreshEbookData = function (isbn) {
            $.getJSON(DATA_RETRIEVAL_SERVICE + isbn).then(populateEbookData);
            return;
        };
        var populateEbookData = function (data) {
            if (!data) {
                ebookData = null;
            } else {
                ebookData = data;
            }
            ui.setUi(data);
            ebookData.courseIsbn = courseIsbn;
            ebookData.url = ud.getData();
        };
        var mapBindISBNInput = function () {
            if (!ISBNInputMappedAndBound) {
                $input = $(inputSelector);
                $input.change(function () {
                    disciplineId = 0;
                    ebookData = null;
                    ui.setUi(null);
                });
            }

            ISBNInputMappedAndBound = true;

        };
        var getEbookData = function () {
            return ebookData;
        };

        var getIsbn = function () {
            return courseIsbn;
        };
        var getDisciplineId = function () {
            return disciplineId;
        };
        return {
            init: init,
            setEbookData: setEbookData,
            getEbookData: getEbookData,
            refreshEbookData: refreshEbookData,
            setDisciplineId: setDisciplineId,
            getIsbn: getIsbn,
            getDisciplineId: getDisciplineId
        };
    }(ebookUi, urlData);

    window.ebookWindowOpener = ebookWindowOpener;
    $(ebookWindowOpener.init);
}());

/*
<input type="hidden" name="instructor_url" id="instructor_url" value="<c:out value="${instructor_url}"/>" />
<input type="hidden" name="student_url" id="student_url" value="<c:out value="${student_url}"/>" />
<input type="hidden" name="textflow_url" id="textflow_url" value="<c:out value="${textflow_url}"/>" />
<input type="hidden" name="student_url_novella" id="student_url_novella" value="<c:out value="${student_url_novella}"/>" />
<input type="hidden" name="instructor_url_novella" id="instructor_url_novella" value="<c:out value="${instructor_url_novella}"/>" />
*/