

window.mt.slicenmove = {};

angular.module('mtSliceNMove', ['mt.common']);

(function() {
    'use strict';
    //math tools template for registering the tool
    var template = {
        id: 'SliceNMoveToolbarItem',
        type: 'SliceNMove',
        displayName: 'Slice N Move',
        available: true,
        htmlTemplate: '<mt-slice-n-move-tool tool-id="toolId" container-api="containerApi" id="tool-{{toolId}}"></mt-slice-n-move-tool>',
        applet: true
    };

    //add the module as a math tool dependency
    window.mt.loadModules.push('mtSliceNMove');

    angular.module('mtSliceNMove', ['mt.common'])
        .config(function (toolRegistryServiceProvider) {
            toolRegistryServiceProvider.addTemplate(template);
        });
})();
