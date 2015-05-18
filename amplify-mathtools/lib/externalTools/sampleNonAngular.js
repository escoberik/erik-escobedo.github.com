(function() {
    'use strict';

    var htmlTemplate =
        '<div style="padding:30px;">' +
            '<h3>Non-Angular sample tool</h3>' +
            '<input class="myInput"></input>' +
        '</div>';

    //fn to be executed on tool instantiation
    function init(element) {
        //3rd party code goes here
        var inputField = element.find('.myInput');

        //return a toolApi fn with callbacks to hook into the mathTools app
        return {
            serializeFn: function() {
                return inputField.val();
            },
            deserializeFn: function(data) {
                inputField.val(data);
            },
            exportFn: function() {
                return {
                    headers: [''],
                    rows: [[inputField.val()]]
                };
            },
            importFn: function(data) {
                if(data.rows[0] !== undefined && data.rows[0][0] !== undefined) {
                    inputField.val(data.rows[0][0]);
                }
            }
        };
    }

    var template = {
        type: 'nonAngularSampleTool',
        displayName: 'non-angular tool',
        htmlTemplate: htmlTemplate,
        initFn: init,
        exportTargets: ['table']
    };

    //register with mt.API
    mt.API.registerExternalTool(template);
})();
