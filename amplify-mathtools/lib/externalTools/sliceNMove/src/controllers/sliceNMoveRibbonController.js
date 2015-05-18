(function(ns) {
    'use strict';

    angular.module('mtSliceNMove').controller('SliceNMoveRibbonController', [
        '$scope', 'toolMenuService', 'roleService', function($scope, toolMenuService, roleService) {
            // Add Shape
            var riAddShapeSet = function(toggle) {
                $scope.toggleAddShapeLayer(toggle);
            };

            var riAddShapeGet = function() {
                return $scope.addShape;
            };

            var riAddShape = toolMenuService.newItem.toggle('Add Shape', riAddShapeSet, {
                showName: true
            }, riAddShapeGet);

            // Toggle Grid
            var riGridSet = function(toggle) {
                $scope.showGrid = toggle;
                $scope.toggleGrid();
            };

            var riGridGet = function() {
                return $scope.showGrid;
            };

            var riGrid = toolMenuService.newItem.toggle('Grid', riGridSet, {
                showName: true
            }, riGridGet);

            // Toggle Measurements
            var riMeasurements = toolMenuService.newItem.toggle('Measurements',
                function(toggle) {
                    $scope.showMeasurements = toggle;
                }, {
                    showName: true
                },
                function() {
                    return $scope.showMeasurements
                }
            );

            var neutralRibbon = {
                toolId: $scope.toolId,
                items: {
                    left: [],
                    center: [],
                    right: [riAddShape, riGrid, riMeasurements]
                }
            };

            // Clear Segments
            var riClearSegments = toolMenuService.newItem.button('Clear Segments', function() {
                alert('Clear Segments');
            });

            // Draw Segments
            var riDrawSegments = toolMenuService.newItem.toggle('Draw Segments',
                function(toggle) {
                    var shape = $scope.selectionApi.getSelection().modelObject;
                    shape.showDrawingStartPoints = toggle;

                    if (toggle) {
                        shape.showVertices();
                        shape.showMidpoints();
                    } else {
                        shape.hideVertices();
                        shape.hideMidpoints();
                    }

                    $scope.$broadcast('update:canvas');
                }, {
                    showName: true
                },
                function() {
                    var selection = $scope.selectionApi.getSelection();
                    return selection && selection.modelObject.showDrawingStartPoints;
                }
            );

            // Cut along Segments
            var riCutSegments = toolMenuService.newItem.button('Cut Segments', function() {
                alert('Cut along Segments');
            });

            var separator = toolMenuService.newItem.seperator();

            // Reflect Horizontally
            var riReflectHorizontally = toolMenuService.newItem.button('Reflect Horizontally', function() {
                alert('Reflect Horizontally');
            });

            // Reflect Vertically
            var riReflectVertically = toolMenuService.newItem.button('Reflect Vertically', function() {
                alert('Reflect Vertically');
            });

            // Rotate
            var riRotate = toolMenuService.newItem.toggle('Rotate',
                function(toggle) {
                    $scope.shapeRotating = toggle;
                }, {
                    showName: true
                },
                function() {
                    return $scope.shapeRotating;
                }
            );

            var shapeSelectedRibbon = {
                toolId: $scope.toolId,
                items: {
                    left: [],
                    center: [],
                    right: [
                        riClearSegments, riDrawSegments, riCutSegments,
                        separator,
                        riReflectHorizontally, riReflectVertically, riRotate
                    ]
                }
            };

            this.register = function() {
                toolMenuService.setToolMenu($scope.toolId, neutralRibbon, {
                    containerApi: $scope.containerApi
                });
                toolMenuService.setToolMenu($scope.toolId, shapeSelectedRibbon, {
                    contextId: 'slicenmove shape', selectionApi: $scope.selectionApi
                });

            };
        }
    ]);
})(window.mt.slicenmove);
