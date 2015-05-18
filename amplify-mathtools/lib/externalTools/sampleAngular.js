(function() {
    'use strict';
    //math tools template for registering the tool
    var template = {
        type: 'AngularSampleTool',
        displayName: 'angular tool',
        htmlTemplate: '<my-external-tool tool-id="toolId" container-api="containerApi" id="tool-{{toolId}}"></my-external-tool>',
        exportTargets: ['table']
    };

    //add the module as a math tool dependency
    window.mt.loadModules.push('myExternalToolModule');

    angular.module('myExternalToolModule', ['mt.common'])
        .config(function (toolRegistryServiceProvider) {
            toolRegistryServiceProvider.addTemplate(template);
        })
        .directive('myExternalTool', function() {
            return {
                scope: {
                    toolId: '=',
                    containerApi: '='
                },
                replace: true,
                restrict: 'E',
                controller: 'myToolController',
                template:
                    '<div style="padding:30px;">' +
                        '<h3>Angular sample tool</h3>' +
                        '<input class="myInput" ng-model="textState"></input>' +
                    '</div>'
            };
        })
        .controller('myToolController', function($scope, toolPersistorService, dataExchangeService) {
            var serializeFn = function() {
                return $scope.textState;
            };
            var deserializeFn = function(data) {
                $scope.textState = data;
            };

            toolPersistorService.registerTool($scope.toolId, template.type, $scope.containerApi, serializeFn, deserializeFn);

            var exportFn = function() {
                return {
                    headers: [''],
                    rows: [[$scope.textState]]
                };
            };
            var importFn = function(data) {
                if(data.rows[0] !== undefined && data.rows[0][0] !== undefined) {
                    $scope.textState = data.rows[0][0];
                }
            };

            dataExchangeService.registerTool($scope.toolId, template.type, exportFn, importFn, $scope.containerApi, template.exportTargets);
        });
})();
