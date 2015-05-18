

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

(function (ns) {

    'use strict';

    ns.GridHandler = (function () {
        function GridHandler(options) {
            this.padding = options.padding;
            this.gap     = options.gap;
        }

        GridHandler.prototype.normalizePoint = function(pos) {
            var x = parseInt(((pos.x - this.padding) + this.gap/2)/this.gap) * this.gap;
            var y = parseInt(((pos.y - this.padding) + this.gap/2)/this.gap) * this.gap; 

            var point = {
                x: x,
                y: y
            };

            return point;
        };

        return GridHandler;
    }());
})(window.mt.slicenmove);

(function (ns) {
    'use strict';

    // A Line Segment is defined by an origin, a direction and a legnth.
    // The constructor takes two points and set the variables necessary.
    ns.Line = (function () {

        //constructor function
        function Line(points) {
            this.origin = {
                x: points[0],
                y: points[1]
            };

            this.vector = {
                x: points[2] - points[0],
                y: points[3] - points[1]
            };

            this.length = Math.sqrt(Math.pow(this.vector.x, 2) + Math.pow(this.vector.y, 2));

            this.vector.x /= this.length;
            this.vector.y /= this.length;
        }

        Line.prototype.getCrossPointWith = function(anotherLine) {
            var determinant = - this.vector.x * anotherLine.vector.y + this.vector.y * anotherLine.vector.x;
            if (determinant == 0) return false;

            var xDiff = anotherLine.origin.x - this.origin.x;
            var yDiff = anotherLine.origin.y - this.origin.y;

            var t1 = (- anotherLine.vector.y * xDiff + anotherLine.vector.x * yDiff) / determinant;
            if (t1 < -1 || t1 > this.length + 1) return false;

            var t2 = (this.vector.x * yDiff - this.vector.y * xDiff) / determinant;
            if (t2 < -1 || t2 > anotherLine.length + 1) return false;

            return {
                x: this.origin.x + t1 * this.vector.x,
                y: this.origin.y + t1 * this.vector.y
            };
        };

        Line.prototype.isCollinearWith = function(anotherLine) {
            if (this.isParallelTo(anotherLine)) {
                var xDiff = anotherLine.origin.x - this.origin.x;
                var yDiff = anotherLine.origin.y - this.origin.y;

                return Math.abs(this.vector.x * yDiff - this.vector.y * xDiff) < 0.1;
            } else {
                return false;
            }
        };

        Line.prototype.isParallelTo = function(anotherLine) {
            return Math.abs(this.vector.x * anotherLine.vector.y - this.vector.y * anotherLine.vector.x) < 0.1;
        };

        Line.prototype.midpoint = function() {
            return {
                x: this.origin.x + 0.5 * this.length * this.vector.x,
                y: this.origin.y + 0.5 * this.length * this.vector.y
            };
        };

        return Line;
    })();
})(window.mt.slicenmove);

(function(ns) {
    'use strict';

    // A Shape consist in a set of edges and a pivotal point if it's "on construction".
    // A finished Shape won't have a pivotal point and the `closed` attribute will be `true`.
    ns.Shape = (function() {
        function Shape(origin) {
            this.closed = false;
            this.pivotal = origin;
            this.edges = [];

            this.drawer = new ns.ShapeDrawer(origin);

            this.bindEvents();
        }

        Shape.prototype.bindEvents = function() {
            $(this.drawer).on('shape:touchstart', function() {
                $(this).trigger('shape:touchstart');
            }.bind(this));

            $(this.drawer).on('startpoint:touchstart', function(evt, point) {
                this.hideMidpoints();
                this.hideVertices();

                this.showEndpointsFor(point);

                $(this).trigger('updated');
            }.bind(this));
        };

        Shape.prototype.addPoint = function(point) {
            if (this.closed) return false;
            var newEdge = new ns.Line([this.pivotal.x, this.pivotal.y, point.x, point.y]);
            if (newEdge.length == 0) return false;

            if (this.edges.length > 0) {
                if (newEdge.isCollinearWith(this.edges[this.edges.length - 1])) {
                    return false;
                }
            }

            var intersections = [];
            for (var i = 0; i < this.edges.length - 1; i++) {
                var intersection = newEdge.getCrossPointWith(this.edges[i]);
                if (intersection) intersections.push(intersection);
            }

            if (intersections.length > 0) {
                if (intersections.length == 1) {
                    var intersection = intersections[0];
                    var origin = this.getVertices()[0];

                    if (origin.x == intersection.x && origin.y == intersection.y) {
                        this.edges.push(newEdge);
                        this.close();
                    }
                } else {
                    return false;
                }
            } else {
                this.edges.push(newEdge);
                this.pivotal = point;
                this.drawer.addVertex(point);

                return true;
            }
        };

        Shape.prototype.drawOn = function(node) {
            this.drawer.drawOn(node);
        };

        Shape.prototype.remove = function() {
            this.drawer.remove();
        };

        Shape.prototype.moveTo = function(node) {
            this.drawer.moveTo(node);
        };

        Shape.prototype.close = function() {
            this.closed = true;
            this.pivotal = null;

            this.addMidpoints();

            this.drawer.close();
        };

        Shape.prototype.getVertices = function() {
            return _.map(this.edges, function(edge) {
                return edge.origin;
            });
        };

        Shape.prototype.getPoints = function() {
            var points = _.map(this.getVertices(), function(vertex) {
                return [vertex.x, vertex.y];
            });

            if (!closed) {
                points.push(this.pivotal.x);
                points.push(this.pivotal.y);
            }

            return _.flatten(points);
        };

        Shape.prototype.hasVertex = function(vertex) {
            return _.find(this.getVertices(), function(vertexIterator) {
                return vertexIterator.x == vertex.x &&
                       vertexIterator.y == vertex.y;
            });
        };

        Shape.prototype.addMidpoints = function() {
            _.each(this.edges, function(edge) {
                this.drawer.addMidpoint(edge.midpoint());
            }.bind(this));
        };

        Shape.prototype.select = function() {
            if (!this.selected) {
                this.drawer.select();
                this.selected = true;
            }
        };

        Shape.prototype.unselect = function() {
            if (this.selected) {
                this.drawer.unselect();

                this.selected = false;
                this.showDrawingStartPoints = false;
            }
        };

        Shape.prototype.showVertices = function() {
            this.drawer.showVertices();
        };

        Shape.prototype.hideVertices = function() {
            this.drawer.hideVertices();
        };

        Shape.prototype.showMidpoints = function() {
            this.drawer.showMidpoints();
        };

        Shape.prototype.hideMidpoints = function() {
            this.drawer.hideMidpoints();
        };

        Shape.prototype.showEndpointsFor = function(point) {
            var endpoints = [];

            _.each(this.edges, function(edge) {
                var vertex = edge.origin;
                var segment = new ns.Line([point.x, point.y, vertex.x, vertex.y]);
                if (this.isValidSegment(segment)) {
                    endpoints.push(vertex);
                }

                var midpoint = edge.midpoint();
                segment = new ns.Line([point.x, point.y, midpoint.x, midpoint.y]);
                if (this.isValidSegment(segment)) {
                    endpoints.push(midpoint);
                }

            }.bind(this));

            this.drawer.showEndpoints(endpoints, { for: point });
        };

        Shape.prototype.isValidSegment = function(segment) {
            if (segment.length == 0) return false;

            var collinear = _.find(this.edges, function(edge) {
                return edge.isCollinearWith(segment);
            });

            return !collinear;
        };

        return Shape;
    })();

})(window.mt.slicenmove);

(function(ns) {
    'use strict';

    ns.ShapeDrawer = (function() {
        function ShapeDrawer(origin) {
            this.origin = origin;

            this.group = new Kinetic.Group({
                x: origin.x,
                y: origin.y
            });
            this.vertices = new Kinetic.Group();
            this.midpoints = new Kinetic.Group();
            this.shape = new Kinetic.Line({
                points: [],
                stroke: 'black',
                strokeWidth: 2,

                fillRed: 100 + Math.random() * 100,
                fillGreen: 100 + Math.random() * 100,
                fillBlue: 100 + Math.random() * 100
            });

            this.group.add(this.shape, this.vertices, this.midpoints);

            this.addVertex(origin);

            this.bindEvents();
        };

        ShapeDrawer.prototype.bindEvents = function() {
            this.shape.on('touchstart mousedown', function() {
                $(this).trigger('shape:touchstart');
            }.bind(this));
        };

        ShapeDrawer.prototype.addVertex = function(point) {
            this.vertices.add(new Kinetic.Circle({
                name: 'startpoint',
                x: point.x - this.origin.x,
                y: point.y - this.origin.y,
                fill: 'black', radius: 3.5
            }));

            this.shape.points(this.shape.points().concat(
                point.x - this.origin.x,
                point.y - this.origin.y
            ));
        };

        ShapeDrawer.prototype.drawOn = function(node) {
            node.add(this.group);
        };

        ShapeDrawer.prototype.remove = function() {
            this.group.remove();
        };

        ShapeDrawer.prototype.moveTo = function(node) {
            this.vertices.hide();
            this.midpoints.hide();
            this.group.moveTo(node);
        };

        ShapeDrawer.prototype.close = function() {
            this.shape.closed(true);

            this.group.find('.startpoint').on('mousedown touchstart', function(evt) {
                $(this).trigger('startpoint:touchstart', {
                    x: evt.target.x() + this.origin.x,
                    y: evt.target.y() + this.origin.y
                });
            }.bind(this));
        };

        ShapeDrawer.prototype.addMidpoint = function(point) {
            this.midpoints.add(new Kinetic.Circle({
                name: 'startpoint',
                x: point.x - this.origin.x,
                y: point.y - this.origin.y,
                fill: 'black', radius: 3.5
            }));
        };

        ShapeDrawer.prototype.select = function() {
            this.shape.opacity(1.0);
            this.shape.strokeWidth(2);

            this.group.moveToTop();
        };

        ShapeDrawer.prototype.unselect = function() {
            this.shape.opacity(0.5);
            this.shape.strokeWidth(1);
            this.vertices.hide();
            this.midpoints.hide();

            this.hideEndpoints();
        };

        ShapeDrawer.prototype.showVertices = function() {
            this.vertices.show();
        };

        ShapeDrawer.prototype.hideVertices = function() {
            this.vertices.hide();

            this.hideEndpoints();
        };

        ShapeDrawer.prototype.showMidpoints = function() {
            this.midpoints.show();
        };

        ShapeDrawer.prototype.hideMidpoints = function() {
            this.midpoints.hide();
        };

        ShapeDrawer.prototype.showEndpoints = function(points, data) {
            this.endpoints = new Kinetic.Group();
            this.endpoints.add(new Kinetic.Circle({
                x: data.for.x - this.origin.x,
                y: data.for.y - this.origin.y,
                fill: 'black', radius: 7
            }));

            _.each(points, function(point) {
                this.endpoints.add(new Kinetic.Circle({
                    x: point.x - this.origin.x,
                    y: point.y - this.origin.y,
                    fill: 'gray', radius: 3.5,
                    stroke: 'black', strokeWidth: 1
                }));
            }.bind(this));

            this.group.add(this.endpoints);
        };

        ShapeDrawer.prototype.hideEndpoints = function() {
            if (this.endpoints) {
                this.endpoints.remove();
                this.endpoints = null;
            }
        };

        return ShapeDrawer;
    })();
})(window.mt.slicenmove);

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

(function (ns) {
    'use strict';

    angular.module('mtSliceNMove').directive('mtSliceNMoveTool', function () {
        return {
          replace: true,
          restrict: 'E',
          controller: 'SliceNMoveController',
          template:
              '<div class="row-fluid mt-slice-n-move">' +
                  '<div id="mt-slice-n-move-canvas">' +
                  '</div>' +
              '</div>',
          link: function(scope, element) {
              var canvas = $(element[0]).find('#mt-slice-n-move-canvas');
              scope.targetElement = canvas[0];

              setTimeout(function() {
                  scope.grid = {
                      stroke: 'blue',
                      strokeWidth: 0.5,
                      gap: 25,
                      padding: 4.5
                  };

                  scope.kineticStage = new Kinetic.Stage({
                      container: 'mt-slice-n-move-canvas',
                      width: canvas.width(),
                      height: canvas.height(),
                      x: scope.grid.padding, y: scope.grid.padding
                  });

                  scope.kineticGridLayer = new Kinetic.Layer();

                  for (var i = 0; i < canvas.width(); i += scope.grid.gap) {
                      scope.kineticGridLayer.add(new Kinetic.Line({
                          points: [i, 0, i, canvas.height()],
                          stroke: scope.grid.stroke, strokeWidth: scope.grid.strokeWidth
                      }));
                  }
                  for (var j = 0; j < canvas.height(); j += scope.grid.gap) {
                      scope.kineticGridLayer.add(new Kinetic.Line({
                          points: [0, j, canvas.width(), j],
                          stroke: scope.grid.stroke, strokeWidth: scope.grid.strokeWidth
                      }));
                  }

                  scope.showGrid = false;
                  scope.kineticGridLayer.hide();

                  scope.kineticShapesLayer = new Kinetic.Layer();

                  scope.kineticShapesBg = new Kinetic.Rect({
                      width: canvas.width(),
                      height: canvas.height()
                  });
                  scope.kineticShapesLayer.add(scope.kineticShapesBg);

                  scope.kineticAddShapeLayer = new Kinetic.Layer();
                  scope.kineticAddShapeLayer.add(new Kinetic.Rect({
                      width: canvas.width(),
                      height: canvas.height()
                  }));
                  scope.kineticAddShapeLayer.hide();

                  scope.kineticStage.add(
                      scope.kineticGridLayer,
                      scope.kineticShapesLayer,
                      scope.kineticAddShapeLayer
                  );


                  scope.init();
              }, 0);
          }
        };
    });
})(window.mt.slicenmove);

