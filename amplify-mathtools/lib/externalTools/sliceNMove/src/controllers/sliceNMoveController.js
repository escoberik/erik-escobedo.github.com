(function(ns) {
    'use strict';

    angular.module('mtSliceNMove').
        controller('SliceNMoveController', function($scope, $controller, safeApply, toolPersistorService, selectionApiFactory) {
            var serializeFn = function() {
                return $scope.textState;
            };
            var deserializeFn = function(data) {
                $scope.textState = data;
            };

            toolPersistorService.registerTool($scope.toolId, 'SliceNMove', $scope.containerApi, serializeFn, deserializeFn);

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

            // dataExchangeService.registerTool($scope.toolId, 'SliceNMove', exportFn, importFn, $scope.containerApi, template.exportTargets);

            $scope.init = function() {
                $scope.gridHandler = new ns.GridHandler({
                    padding: $scope.grid.padding,
                    gap:     $scope.grid.gap
                });
                $scope.shapes = [];

                $scope.ribbon = $controller('SliceNMoveRibbonController', {
                    $scope: $scope
                });
                $scope.ribbon.register();

                $scope.newShape = null;
                $scope.kineticAddShapeLayer.on('touchstart mousedown', function() {
                    var point = $scope.gridHandler.normalizePoint($scope.kineticStage.getPointerPosition());

                    if ($scope.newShape) {
                        $scope.newShape.addPoint(point)

                        if ($scope.newShape.closed) {
                            $scope.toggleAddShapeLayer(false);
                        }
                    } else {
                        $scope.newShape = new ns.Shape(point);
                        $scope.newShape.drawOn($scope.kineticAddShapeLayer);
                    }

                    $scope.kineticAddShapeLayer.draw();
                });

                $scope.$on('update:canvas', function() {
                    $scope.kineticShapesLayer.draw()
                });

                $scope.kineticShapesBg.on('touchstart mousedown', function() {
                    $scope.selectionApi.clear();
                });
            };

            $scope.selectionApi = selectionApiFactory.createApi(function(oldSelection) {
                _.invoke($scope.shapes, 'unselect');
                $scope.$broadcast('update:canvas');
            });

            $scope.toggleGrid = function() {
                if ($scope.showGrid || $scope.addShape) {
                    $scope.kineticGridLayer.show();
                } else {
                    $scope.kineticGridLayer.hide();
                }
                $scope.kineticStage.draw();
            };

            $scope.toggleAddShapeLayer = function(toggle) {
                if (toggle) {
                    $scope.kineticAddShapeLayer.show();
                }  else {
                    $scope.kineticAddShapeLayer.hide();

                    if ($scope.newShape) {
                        if ($scope.newShape.closed) {
                            $scope.addNewShape($scope.newShape);
                        } else {
                            $scope.newShape.remove();
                        }

                        $scope.newShape = null;
                    }
                }

                $scope.addShape = toggle;
                $scope.toggleGrid();
            };

            $scope.addNewShape = function(newShape) {
                // Save the new Shape
                $scope.shapes.push(newShape);

                // Move it to the Shapes Layer
                newShape.moveTo($scope.kineticShapesLayer);

                // Auto select it
                $scope.selectShape(newShape);

                // Bind events on new Shape
                $(newShape)
                    .on('shape:touchstart', function(evt) {
                        $scope.selectShape(evt.target);
                    })
                    .on('updated', function() {
                        $scope.$broadcast('update:canvas');
                    });
            };

            $scope.selectShape = function(shape) {
                if (shape.selected) return;
                // Unselect previous selected Shapes
                _.invoke($scope.shapes, 'unselect');

                // Select the passed Shape
                // PLEASE NOTICE: selectionApi.setSelection() automatically calls
                // selectionApi.clear() first, therefore, triggering its
                // clearCallback function (it unselects everything).
                $scope.selectionApi.setSelection({
                    type: 'slicenmove shape',
                    modelObject: shape
                });
                shape.select();

                // Update the canvas
                $scope.$broadcast('update:canvas');
            };
        });
})(window.mt.slicenmove);
