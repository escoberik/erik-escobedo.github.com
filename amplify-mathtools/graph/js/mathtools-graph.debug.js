(function () {
    'use strict';

    if (!window.mt) {
        window.mt = {};
    }

    if (!window.mt.graph) {
        window.mt.graph = {};
    }

    angular.module('mtGraph', ['mt.common', 'ui.bootstrap'])

        .config(function (toolRegistryServiceProvider) {
            var template = {
                id: 'graphToolbarItem',
                type: mt.common.TYPE_GRAPH,
                displayName: 'Graph',
                available: true,
                htmlTemplate: '<mt-graph-tool tool-id="toolId" container-api="containerApi" id="tool-{{toolId}}"></mt-graph-tool>'
            };
            toolRegistryServiceProvider.addTemplate(template);
        });

    window.mt.loadModules.push('mtGraph');
})();


(function (ns) {
    'use strict';

    ns.DY_X_LABEL = '0';
    ns.DY_Y_LABEL = '4';

    var i = 0;
    ns.MENU_REMOVE_POINT = 'Delete Point';
    ns.MENU_INDEX_REMOVE_POINT = i++;
    ns.MENU_TOTAL_ITEMS = i;
})(window.mt.graph);

(function (ns) {
    'use strict';

    ns.GraphEventineer = (function () {

        //constructor function

        function GraphEventineer(eventManager, toolId, errorCallback) {
            if (!(this instanceof GraphEventineer)) {
                return new GraphEventineer(eventManager, toolId);
            }

            //callback functions - to be registered
            var updateLinkFromTable = function () {};
            var unlink = function () {};

            var link;

            //public interface

            this.registerUpdateLinkFromTable = function (updateFn) {
                updateLinkFromTable = updateFn;
            };

            this.registerUnlink = function (unlinkFn) {
                unlink = unlinkFn;
            };

            //function called on every update
            this.updateLinks = function(graphModel, forceUpdate) {
                if(link !== undefined) {
                    link.update(graphModel, forceUpdate);
                }
            };

            function createTable(id) {
                var createEvent = new mt.common.Event({});

                createEvent.type = mt.common.TYPE_TABLE;
                createEvent.toolId = id;

                eventManager.publish(mt.common.EVENT_CREATE_TOOL, createEvent);
            }

            this.linkToNewTable = function (graphModel, linkCol) {
                if(link !== undefined) {
                    console.log('tool is already linked');
                    return;
                }

                var tableId = mt.common.createGuid();
                createTable(tableId);

                link = {color: linkCol};

                function registerTableFns(updateFn, unlinkFn) {
                    link.update = updateFn;
                    link.unlink = unlinkFn;
                }
                var linkEvent = new mt.common.Event({});
                linkEvent.targetId = tableId;
                linkEvent.data.updateCallback = updateLinkFromTable;
                linkEvent.data.unlinkCallback = this.unlink;
                linkEvent.data.registerCallback = registerTableFns;
                linkEvent.data.linkColor = linkCol;

                var self = this;
                setTimeout(function() {
                    eventManager.publish(mt.common.EVENT_LINK_TABLE_FROM_GRAPH, linkEvent);
                    self.updateLinks(graphModel, true);
                });
            };

            this.unlink = function (noPropagation) {
                if(link === undefined) {
                    return;
                }

                unlink();
                if(noPropagation !== true){
                    link.unlink(true);
                }

                link = undefined;
            };

            this.getLinkStyle = function () {
                var style = {};
                if(link === undefined) {
                    style.display = 'none';
                } else {
                    style['background-color'] = link.color;
                }
                return style;
            };

            //generic error handling for events
            //TODO - should id targetting go into event manager
            function canHandle(event) {
                var handle = true;
                if (event && event.data) {
                    if(event.targetId !== toolId) {
                        handle = false;
                    } else if (event.data.error) {
                        errorCallback(event.data.error);
                        handle = false;
                    }
                } else {
                    handle = false;
                }
                return handle;
            }

            var self = this;

            //subscribe to link request from table
            eventManager.subscribe(toolId, mt.common.EVENT_LINK_GRAPH_FROM_TABLE, function(event) {
                if(canHandle(event) === true) {
                    event.data.registerCallback(updateLinkFromTable, self.unlink);
                    link = {color: event.data.linkColor, update: event.data.updateCallback, unlink: event.data.unlinkCallback};

                }
            });
        }

        return GraphEventineer;
    })();
})(window.mt.graph);

(function (ns) {
    'use strict';

    angular.module('mtGraph').controller('EquationExpressionCtrl', function($scope) {

        $scope.expressionApi.checkEmptyExpression = function () {
            if ($scope.model.editText === undefined || $scope.model.editText === '') {
                $scope.expressionListApi.deleteExpression($scope.model);
            }
        };

        $scope.expressionApi.isActive = function () {
            return $scope.model.isSelected;
        };

        $scope.expressionApi.getTypeLabel = function () {
            return 'E';
        };

    });

})(window.mt.graph);

(function (ns) {
    'use strict';

    angular.module('mtGraph').controller('ExpressionEntryCtrl', function ($scope, handwritingService, safeApply) {

        var RECOGNITION_TYPES = {
            point: mt.common.HW_MODE_EQN_EXPRESSION_LIST,
            equation: mt.common.HW_MODE_EQN_EXPRESSION_LIST_EQN,
            text: mt.common.HW_MODE_TEXT
        };

        // if active, track whether active by using expression list (true) or graph (false)
        $scope.selfActivated = false;

        $scope.showDelete = false;

        $scope.expressionApi = {
            checkEmptyExpression: angular.noop,
            isActive: angular.noop,
            getTypeLabel: angular.noop,
            onDeselect: angular.noop,
            deleteEmptyPoints: function (pointList) {
                _(pointList).chain()
                    .filter(function (point) {
                        return point.editText === undefined || point.editText === '' || point.editText === '(, )';
                    }).each(function (point) {
                        $scope.expressionListApi.deleteExpression(point);
                    });
            }
        };

        $scope.isReadOnly = function () {
            return handwritingService.useHandwriting();
        };

        $scope.selectExpression = function () {
            $scope.expressionListApi.setActive($scope.model);
            $scope.selfActivated = true;
        };

        $scope.selectIndicator = function () {
            if ($scope.showDelete) {
                $scope.expressionListApi.deleteExpression($scope.model);
            } else {
                $scope.selectExpression();
            }
        };

        $scope.inputInit = function (model, type, grammar) {
            if ($scope.expressionListApi.newInput) {
                var input = $scope.findNewInput();
                $scope.selectObject({target: input}, model, type, grammar);
                $scope.expressionListApi.newInput = false;
            }
            $scope.clearNewInputFlag();
        };

        $scope.selectObject = function (event, selectedModel, type, grammar) {
            $scope.toggleDelete(false);

            $scope.selectedObject = selectedModel;
            $scope.selectedObject.isEditing = true;

            // initialize editStrokes
            var origEditStrokes = $scope.selectedObject.editStrokes;
            $scope.selectedObject.editStrokes = origEditStrokes ? origEditStrokes : {};
            var origEditStrokesForType = $scope.selectedObject.editStrokes[type];
            $scope.selectedObject.editStrokes[type] = origEditStrokesForType ? origEditStrokesForType : [];

//            $scope.expressionListApi.setActive(selectedModel); // this needs a little work yet
            $scope.expressionListApi.setActive($scope.model);
            $scope.selectInput(event, type, grammar);
        };

        $scope.selectInput = function (event, type, grammar) {
            $scope.addInputSelectedHighlighting(event.target);

            if (handwritingService.useHandwriting()) {
                var strokesForType = $scope.selectedObject.editStrokes[type];
                var callback = _(handwritingUpdateCallback).partial(type);
                var mode = RECOGNITION_TYPES[grammar];
                handwritingService.openPanelForElement(event.target, strokesForType, mode, callback, $scope.deselectInput);
            } else {
                $scope.focusInput(event.target);
            }
        };

        function handwritingUpdateCallback(type, latex, strokes) {
            safeApply($scope, function () {
                $scope.selectedObject.editStrokes[type] = strokes;
                $scope.selectedObject[type] = latex;

                if (type === 'editText') {
                    $scope.updateFromEditText();
                } else if (type === 'name') {
                    $scope.updateName();
                }
            });
        }

        $scope.deselectIfKeyboard = function () {
            if (!handwritingService.useHandwriting()) {
                var tmp = $scope.selectedObject;
                $scope.deselectInput();

                //keep the selectedObject so that if we tap from an input to the PS icon of a given item,
                //the + icon will show up
                $scope.selectedObject = tmp;
            }
        };

        function deselectPoint() {
            if ($scope.selectedObject) {
                $scope.selectedObject.isSelected = false;
                $scope.selectedObject.isEditing = false;
                $scope.expressionListApi.renameIfEmpty($scope.selectedObject);
                $scope.selectedObject = undefined;
                $scope.expressionApi.onDeselect();
            }
        }

        $scope.deselectInput = function () {
            deselectPoint();

            $scope.removeInputSelectedHighlighting();

            $scope.expressionApi.checkEmptyExpression();
            safeApply($scope, function () {});
        };

        $scope.updateName = function () {
            $scope.selectedObject.name = $scope.selectedObject.name.substring(0, 3);
            $scope.expressionListApi.validateNames();
        };

        $scope.updateFromEditText = function () {
            $scope.selectedObject.updateFromExpression($scope.selectedObject.editText);
        };

        $scope.onExpressionSwipe = function (event) {
            if (event.gesture.direction === 'right' || event.gesture.direction === 'left') {
                event.gesture.preventDefault();
                $scope.blurInputs();

                $scope.expressionListApi.setActive($scope.model);
                $scope.toggleDelete(true);
            }
        };

        $scope.toggleDelete = function(showDelete) {
            safeApply($scope, function () {
                $scope.showDelete = showDelete;
            });
        };

        $scope.getTypeLabel = function () {
            if ($scope.showDelete) {
                return 'X';
            }

            var type = $scope.expressionApi.getTypeLabel();
            return type === undefined ? 'UND' : type;
        };

        $scope.objectIsSelected = function () {
            return $scope.selectedObject !== undefined;
        };

        $scope.isSelectedObject = function (model) {
            return $scope.selectedObject === model;
        };

        $scope.addPoint = function () {
            $scope.expressionListApi.addPointToPointSet($scope.model);
        };

        $scope.$watch('model.isSelected', function (isActive) {
            // expression can't be in delete mode if it is not active
            if (isActive === false) {
                $scope.blurInputs();
                $scope.toggleDelete(false);
                $scope.selfActivated = false;

                deselectPoint();
            }
        });

        $scope.$on('graphToolIdBroadcast', function (event, id) {
            $scope.toolId = id;
        });
        $scope.$emit('graphToolIdRequest');
    });

})(window.mt.graph);

(function (ns) {
    'use strict';

    angular.module('mtGraph').controller('ExpressionListCtrl', function($scope, pointNameService) {

        // whether the pane is visible/hidden
        $scope.visible = true;

        $scope.drag = function (event) {
            // keep whole panel from moving
            event.gesture.preventDefault();
            return false;
        };

        $scope.addPoint = function () {
            $scope.graphModel.addPoint(new mt.common.Point());
            $scope.graphModel.deselectAll();
            $scope.expressionListApi.newInput = true;
        };

        $scope.addPointSet = function () {
            var pointSet = new mt.common.PointSet();
            $scope.graphModel.addPointSet(pointSet);
            $scope.graphModel.addPoint(new mt.common.Point(), pointSet.id);
            $scope.graphModel.deselectAll();
            $scope.expressionListApi.newInput = true;
        };

        $scope.addPointToPointSet = function (model) {
            $scope.graphModel.addPoint(new mt.common.Point(), model.id);
            $scope.expressionListApi.newInput = true;
        };

        $scope.addEquation = function () {
            $scope.graphModel.addEquation(new mt.common.Equation());
            $scope.graphModel.deselectAll();
            $scope.expressionListApi.newInput = true;
        };

        $scope.findGlidersForLine = function (model) {
            return $scope.graphModel.findGlidersForLine(model);
        };

        $scope.deleteExpression = function (model) {
            $scope.graphModel.removeObject(model);
            pointNameService.validateNames($scope.graphModel.getAllPoints());
        };

        $scope.hide = function() {
            $scope.visible = false;
        };

        $scope.show = function() {
            $scope.visible = true;
        };

        $scope.setActive = function (model) {
            $scope.graphModel.select(model);
        };

        $scope.validateNames = function () {
            pointNameService.validateNames($scope.graphModel.getAllPoints());
        };

        $scope.renameIfEmpty = function (model) {
            pointNameService.renameIfEmpty(model, $scope.graphModel.getAllPoints());
        };

        $scope.expressionListApi = {
            setActive: $scope.setActive,
            deleteExpression: $scope.deleteExpression,
            addPointToPointSet: $scope.addPointToPointSet,
            findGlidersForLine: $scope.findGlidersForLine,
            validateNames: $scope.validateNames,
            renameIfEmpty: $scope.renameIfEmpty,
            newInput: false
        };

    });

})(window.mt.graph);

(function (ns) {
    'use strict';

    angular.module('mtGraph').controller('GraphCtrl', function($scope, lineRectIntersectionFactory, safeApply) {
        $scope.init = function () {
            $scope.viewConfig = new mt.common.GraphViewConfig(width, height, 30, mt.common.GRAPH_MODE_STANDARD, true);
            $scope.renderer = new mt.common.GraphRenderer($scope.containerElement, $scope.graphModel, $scope.viewConfig, lineRectIntersectionFactory, $scope.toolId);
            $scope.gestureHandler = new mt.common.GraphGestureHandler($scope.graphModel, $scope.viewConfig, update);
            update();
        };

        $scope.$on('graphModelChanged', function (e, renderAxis) {
            update(renderAxis);
        });

        function update(renderAxis) {
            if(renderAxis === undefined) {
                renderAxis = true;
            }
            $scope.renderer.render(renderAxis);
        }

        var width = 500;
        var height = 500;

        $scope.getHeight = function () {
            return height;
        };

        $scope.getWidth = function () {
            return width;
        };
    });

})(window.mt.graph);

(function (ns) {
    'use strict';

    angular.module('mtGraph').controller('GraphSettingsCtrl', function($scope, toolLinkManagerService) {

        $scope.toggleControls = function (open) {
            if (open === true) {
                //need to wrap the bound values in objects
                var xAxis = $scope.graphModel.axes.x;
                var yAxis = $scope.graphModel.axes.y;
                $scope.settings.tickXMinor = modelForObject(xAxis.minorInterval);
                $scope.settings.tickYMinor = modelForObject(yAxis.minorInterval);
                $scope.settings.tickXMajor = modelForObject(xAxis.majorInterval);
                $scope.settings.tickYMajor = modelForObject(yAxis.majorInterval);
                $scope.settings.maxX = modelForObject(xAxis.max.x);
                $scope.settings.maxY = modelForObject(yAxis.max.y);
                $scope.settings.minX = modelForObject(xAxis.min.x);
                $scope.settings.minY = modelForObject(yAxis.min.y);
                $scope.settings.xAxisLabel = modelForObject(xAxis.label);
                $scope.settings.yAxisLabel = modelForObject(yAxis.label);
                $scope.settings.showPointLabels = $scope.graphModel.showPointLabels;
            } else {
                $scope.updateSettings();
            }
            $scope.controlsOpen = open;
        };

        function modelForObject(obj) {
            if (obj === undefined) {
                return {
                    value: ''
                };
            }

            return {
                value: obj === undefined ? undefined : obj.val(),
                editStrokes: obj.editStrokes
            };
        }

        $scope.exportToTable = function() {
            $scope.eventineer.exportToNewTable($scope.graphModel);
            $scope.controlsOpen = false;
        };

        $scope.linkToTable = function() {
            $scope.eventineer.linkToNewTable($scope.graphModel, toolLinkManagerService.getLinkColor());
            $scope.controlsOpen = false;
        };

        $scope.unlink = function() {
            $scope.eventineer.unlink();
            $scope.controlsOpen = false;
        };

        $scope.toggleShowPointLabels = function() {
            $scope.settings.showPointLabels = !$scope.settings.showPointLabels;
        };

        $scope.updateSettings = function () {
            var xAxis = $scope.graphModel.axes.x;
            var yAxis = $scope.graphModel.axes.y;

            updateObjectFromModel(xAxis.minorInterval, $scope.settings.tickXMinor);
            updateObjectFromModel(yAxis.minorInterval, $scope.settings.tickYMinor);
            updateObjectFromModel(xAxis.majorInterval, $scope.settings.tickXMajor);
            updateObjectFromModel(yAxis.majorInterval, $scope.settings.tickYMajor);
            updateObjectFromModel(xAxis.max.x, $scope.settings.maxX);
            updateObjectFromModel(yAxis.max.y, $scope.settings.maxY);
            updateObjectFromModel(xAxis.min.x, $scope.settings.minX);
            updateObjectFromModel(yAxis.min.y, $scope.settings.minY);

            updateObjectFromModelNaN(xAxis.label, $scope.settings.xAxisLabel);
            updateObjectFromModelNaN(yAxis.label, $scope.settings.yAxisLabel);

            $scope.graphModel.showPointLabels = $scope.settings.showPointLabels;

            // call parent update
            $scope.update();
        };

        function updateObjectFromModel(obj, model) {
            if (mt.common.isNumeric(model.value))
            {
                var floatVal = parseFloat(model.value);
                obj.setVal(isNaN(floatVal) ? model.value : floatVal);
                obj.editStrokes = model.editStrokes;
            } else
            {
                model.value = obj.val();
            }
        }

        function updateObjectFromModelNaN(obj, model) {
            obj.setVal(model.value);
            obj.editStrokes = model.editStrokes;
        }

        $scope.settings = {};
        $scope.controlsOpen = false;
        $scope.containerApi.registerShowControls(_.partial($scope.toggleControls, true));
        $scope.containerApi.registerClose($scope.unlink);
    });

})(window.mt.graph);

(function (ns) {
    'use strict';

    angular.module('mtGraph').controller('GraphToolCtrl', function($scope, $timeout, eventingService, safeApply, $dialog, broadcastService, pointNameService, preconfiguredToolService, toolPersistorService, dataExchangeService) {
        $scope.graphModel = new mt.common.GraphModel({}, pointNameService);

        $scope.eventineer = new ns.GraphEventineer(eventingService, $scope.toolId, function (error) {
            $scope.importError = error;
            $scope.showImportError = true;
        });

        $scope.loadCustomProperties = function () {
            var properties = new mt.common.Properties();
            var xAxis = $scope.graphModel.axes.x;
            var yAxis = $scope.graphModel.axes.y;
            xAxis.minorInterval.setVal(parseFloat(properties.getUserProperty('GRAPH_MINOR_TICK_INTERVAL_X')));
            yAxis.minorInterval.setVal(parseFloat(properties.getUserProperty('GRAPH_MINOR_TICK_INTERVAL_Y')));
            xAxis.majorInterval.setVal(parseFloat(properties.getUserProperty('GRAPH_MAJOR_TICK_INTERVAL_X')));
            yAxis.majorInterval.setVal(parseFloat(properties.getUserProperty('GRAPH_MAJOR_TICK_INTERVAL_Y')));
            xAxis.min.x.setVal(parseFloat(properties.getUserProperty('GRAPH_MIN_X')));
            xAxis.max.x.setVal(parseFloat(properties.getUserProperty('GRAPH_MAX_X')));
            yAxis.min.y.setVal(parseFloat(properties.getUserProperty('GRAPH_MIN_Y')));
            yAxis.max.y.setVal(parseFloat(properties.getUserProperty('GRAPH_MAX_Y')));
            xAxis.label.setVal(properties.getUserProperty('LABEL_X_AXIS'));
            yAxis.label.setVal(properties.getUserProperty('LABEL_Y_AXIS'));
        };

        $scope.update = function (updateAxes) {
            $scope.$broadcast('graphModelChanged', updateAxes);
        };

        //update from table with bound data
        $scope.updateLinkFromTable = function (tableModel, forceUpdate) {
            if(forceUpdate === true) {
                if(!tableModel.xColumnId) {
                    tableModel.assignXAxis(0);
                }
                if(!tableModel.yColumnId) {
                    tableModel.assignYAxis(1);
                }
            }

            var xAxisId = tableModel.xColumnId;
            var yAxisId = tableModel.yColumnId;
            var xCol = tableModel.getColumnByGuid(xAxisId);
            var yCol = tableModel.getColumnByGuid(yAxisId);

            //bind header values
            if(forceUpdate === true) {
                $scope.graphModel.axes.x.label = xCol.getHeader().value;
                $scope.graphModel.axes.y.label = yCol.getHeader().value;
            }

            var points = $scope.graphModel.getVisiblePoints();
            var numPoints = points.length;
            var numRows = tableModel.getNumGraphRows();

            //add or remove points
            if(numRows === numPoints && forceUpdate !== true) {
                return;
            }

            //keep track of the row indices that are bound to points
            var boundRows = [];

            //check that all points have a bound row - remove any that don't
            var iRow;
            _(points).each(function (point) {
                var xCell = _.find(xCol.cells, function(cell, iRow) {return cell.value === point.x && !tableModel.isGraphRowEmpty(iRow);});
                var yCell = _.find(yCol.cells, function(cell, iRow) {return cell.value === point.y && !tableModel.isGraphRowEmpty(iRow);});
                if(xCell === undefined || yCell === undefined) {
                    if(numRows < numPoints) {
                        $scope.graphModel.removePoint(point);
                    }
                } else {
                    boundRows.push(xCol.cells.indexOf(xCell));
                }
            });

            //find any unbound rows that should create new points
            var newRowIndices = [];
            for(iRow = 0; iRow < tableModel.numRows(); iRow++) {
                if(boundRows.indexOf(iRow) === -1 && tableModel.isGraphRowEmpty(iRow) === false) {
                    newRowIndices.push(iRow);
                }
            }

            //add points for any new rows and bind their values
            for(var i = 0; i < numRows - numPoints; i++) {
                var point = new mt.common.Point();
                point.x = xCol.cells[newRowIndices[i]].value;
                point.y = yCol.cells[newRowIndices[i]].value;
                point.isHidden = false;
                $scope.graphModel.addPoint(point);
            }

            var updateAxes = false;
            if (undefined === this.isLinked) {
                $scope.graphModel.expandToFitPoints();
                $scope.graphModel.expandToSquare();
                this.isLinked = true;
                updateAxes = true;
            }

            $scope.update(updateAxes);
        };

        $scope.closeTableImportError = function () {
            $scope.showImportError = false;
        };

        $scope.load = function (data) {
            $scope.graphModel.deserialize(data);
            $scope.update(true);
        };

        $scope.eventineer.registerUpdateLinkFromTable($scope.updateLinkFromTable);
        $scope.eventineer.registerUnlink(function() {
            //quick way of unbinding data - deserialize with copied data
            $scope.load(angular.copy($scope.graphModel.serialize()));
        });

        function axisLabelChanged(axis, newVal, oldVal) {
            $scope.update(true);
        }

        $scope.$watch('graphModel.axes.x.label.val()', function (newVal, oldVal) {
            if (oldVal !== newVal) {
                axisLabelChanged('x', newVal, oldVal);
            }
        });

        $scope.$watch('graphModel.axes.y.label.val()', function (newVal, oldVal) {
            if (oldVal !== newVal) {
                axisLabelChanged('y', newVal, oldVal);
            }
        });

        $scope.$watch('graphModel.points', function (newVal, oldVal) {
            if (newVal === oldVal) {
                return;
            }

            $scope.eventineer.updateLinks($scope.graphModel);

            $scope.update(false);

            //for every point, this gets hit twice: once to put the point, once to set the editText
            //unfinished point is most likely at the end
            for (var i = $scope.graphModel.points.length - 1; 0 <= i; --i)
            {
                if (undefined === $scope.graphModel.points[i].editText)
                {
                    return; //don't want to be able to undo to this state
                }
            }
        }, true);

        $scope.$watch('graphModel.lines', function(newVal, oldVal) {
            if (newVal === oldVal) {
                return;
            }
            $scope.update(false);
        }, true);

        $scope.$watch('graphModel.equations', function(newVal, oldVal) {
            if (newVal === oldVal) {
                return;
            }
            $scope.update(false);
        }, true);

        $scope.$watch(function (scope) {
            // return some representation of point sets
            return _(scope.graphModel.pointSets).map(function(pointSet) {
                return pointSet.toString();
            });
        }, function () {
            $scope.update(false);
        }, true);

        $scope.$on('graphToolIdRequest', function () {
            $scope.$broadcast('graphToolIdBroadcast', $scope.toolId);
        });

        dataExchangeService.registerTool($scope.toolId, mt.common.TYPE_GRAPH,
            function() {
                return $scope.graphModel.exportPoints();
            },
            function(data) {
                $scope.graphModel.importPoints(data);
                $scope.update(true);
            }, $scope.containerApi, [mt.common.TYPE_TABLE, mt.common.TYPE_NUMBER_LINE]);

        toolPersistorService.registerTool($scope.toolId, mt.common.TYPE_GRAPH, $scope.containerApi, _($scope.graphModel.serialize).bind($scope.graphModel), $scope.load);

        $scope.loadCustomProperties();

        $scope.callbacks = {};

        $scope.$watch('graphModel', function() {
            if ($scope.callbacks[mt.common.GRAPH_EVENT_DATA_MODEL_UPDATED]) {
                ($scope.callbacks[mt.common.GRAPH_EVENT_DATA_MODEL_UPDATED])();
            }
        }, true);

        $scope.registerHandler = function(event, callback) {
            $scope.callbacks[event] = callback;
        };
        $scope.unregisterHandler = function(event) {
            delete $scope.callbacks[event];
        };

        $scope.API = function() {
            function update() {
                $scope.$digest();
                $scope.update();
            }
            return {

                registerHandler: function(event, callback) {
                    $scope.registerHandler(event, callback);
                    return this;
                },
                unregisterHandler: function(event) {
                    $scope.unregisterHandler(event);
                    return this;
                },

                getToolId: function() {
                    return $scope.toolId;
                },

                removePoint: function(point) {
                    $scope.graphModel.removePoint(point);
                    update();
                    return this;
                },

                removeLine: function(line) {
                    $scope.graphModel.removeLine(line);
                    update();
                    return this;
                },

                removeAllLines: function() {
                    $scope.graphModel.removeAllLines();
                    update();
                    return this;
                },

                createPoint: function(point) {
                    $scope.graphModel.addPoint(point, undefined);
                    update();
                    return this;
                },

                createPointSet: function(pointSet) {
                    $scope.graphModel.addPointSet(pointSet);
                    update();
                    return this;
                },

                createLine: function(line) {
                    $scope.graphModel.addLine(line);
                    update();
                    return this;
                },

                setXMin: function(min) {
                    $scope.graphModel.axes.x.min.x.setVal(min);
                    update();
                    return this;
                },

                getXMin: function() {
                    return $scope.graphModel.axes.x.min.x.val();
                },

                setXMax: function(val) {
                    $scope.graphModel.axes.x.max.x.setVal(val);
                    update();
                    return this;
                },

                getXMax: function() {
                    return $scope.graphModel.axes.x.max.x.val();
                },

                setYMin: function(min) {
                    $scope.graphModel.axes.y.min.y.setVal(min);
                    update();
                    return this;
                },

                getYMin: function() {
                    return $scope.graphModel.axes.y.min.y.val();
                },

                setYMax: function(val) {
                    $scope.graphModel.axes.y.max.y.setVal(val);
                    update();
                    return this;
                },

                getYMax: function() {
                    return $scope.graphModel.axes.y.max.y.val();
                },

                setXMinorInterval: function(val) {
                    $scope.graphModel.axes.x.minorInterval.setVal(val);
                    update();
                    return this;
                },

                getXMinorInterval: function() {
                    return $scope.graphModel.axes.x.minorInterval.val();
                },

                setXMajorInterval: function(val) {
                    $scope.graphModel.axes.x.majorInterval.setVal(val);
                    update();
                    return this;
                },

                getXMajorInterval: function() {
                    return $scope.graphModel.axes.x.majorInterval.val();
                },

                setYMinorInterval: function(val) {
                    $scope.graphModel.axes.y.minorInterval.setVal(val);
                    update();
                    return this;
                },

                getYMinorInterval: function() {
                    return $scope.graphModel.axes.y.minorInterval.val();
                },

                setYMajorInterval: function(val) {
                    $scope.graphModel.axes.y.majorInterval.setVal(val);
                    update();
                    return this;
                },

                getYMajorInterval: function() {
                    return $scope.graphModel.axes.y.majorInterval.val();
                },

                //newLabel is primitive
                setXAxisLabel: function(newLabel) {
                    $scope.graphModel.axes.x.label.setVal(newLabel);
                    update();
                    return this;
                },

                //newLabel is primitive
                setYAxisLabel: function(newLabel) {
                    $scope.graphModel.axes.y.label.setVal(newLabel);
                    update();
                    return this;
                },

                togglePointLabels: function(beOn) {
                    $scope.graphModel.showPointLabels = beOn;
                    update();
                    return this;
                },

                getModel: function() {
                    return $scope.graphModel;
                },

                showAxes: function(isOn) {
                    $scope.graphModel.showAxes = isOn;
                    update();
                    return this;
                },

                showGridLines: function(show) {
                    $scope.graphModel.showGridLines = show;
                    update();
                    return this;
                }

            };
        };
    });

})(window.mt.graph);

(function (ns) {
    'use strict';

    angular.module('mtGraph').controller('LineExpressionCtrl', function($scope) {

        var INDICATOR_TYPES = {};
        INDICATOR_TYPES[mt.common.LINE_INNER_TYPE_LINE] = 'L';
        INDICATOR_TYPES[mt.common.LINE_INNER_TYPE_LINE_SEGMENT] = 'LS';
        INDICATOR_TYPES[mt.common.LINE_INNER_TYPE_RAY] = 'R';
        INDICATOR_TYPES[mt.common.LINE_INNER_TYPE_DROP_LINE_X] = 'DLX';
        INDICATOR_TYPES[mt.common.LINE_INNER_TYPE_DROP_LINE_Y] = 'DLY';

        $scope.hasGliders = function () {
            return $scope.getGliders().length > 0;
        };

        $scope.getGliders = function () {
            return $scope.expressionListApi.findGlidersForLine($scope.model);
        };

        $scope.expressionApi.checkEmptyExpression = function () {
            $scope.expressionApi.deleteEmptyPoints([$scope.model.start, $scope.model.end]);
        };

        $scope.expressionApi.isActive = function () {
            var gliders = $scope.expressionListApi.findGlidersForLine($scope.model);
            var activeGlider = _(gliders).findWhere({isSelected: true});
            return $scope.model.isSelected || activeGlider !== undefined;
        };

        $scope.expressionApi.getTypeLabel = function () {
            return INDICATOR_TYPES[$scope.model.innerType];
        };

        $scope.disableNameInput = function (point) {
            return point === $scope.model.end &&
                _([mt.common.LINE_INNER_TYPE_DROP_LINE_X, mt.common.LINE_INNER_TYPE_DROP_LINE_Y]).contains($scope.model.innerType);
        };

        $scope.$watch('[model.start, model.end]', function (newVal) {
            _(newVal).each(function (point) {
                if (!point.isEditing) {
                    point.editText = point.toString();
                }
            });
        }, true);
    });

})(window.mt.graph);

(function (ns) {
    'use strict';

    angular.module('mtGraph').controller('PointExpressionCtrl', function($scope) {

        $scope.expressionApi.checkEmptyExpression = function () {
            if ($scope.model.editText === undefined || $scope.model.editText === '' || $scope.model.editText === '(, )') {
                $scope.expressionListApi.deleteExpression($scope.model);
            }
        };

        $scope.expressionApi.isActive = function () {
            return $scope.model.isSelected;
        };

        $scope.expressionApi.getTypeLabel = function () {
            return 'P';
        };

        $scope.$watch('model.toString()', function (newVal) {
            // don't update editText programmatically while user is editing
            if (!$scope.model.isEditing) {
                $scope.model.editText = newVal;
            }
        });
    });

})(window.mt.graph);

(function (ns) {
    'use strict';

    angular.module('mtGraph').controller('PointSetExpressionCtrl', function($scope) {

        $scope.showAddPoint = function () {
            return $scope.model.isSelected && $scope.selfActivated && !$scope.objectIsSelected();
        };

        $scope.expressionApi.checkEmptyExpression = function () {
            $scope.expressionApi.deleteEmptyPoints($scope.model.points);
            if ($scope.model.points.length === 0) {
                $scope.expressionListApi.deleteExpression($scope.model);
            }
        };

        $scope.expressionApi.isActive = function () {
            var pointIsSelected = _($scope.model.points).findWhere({isSelected: true}) !== undefined;
            return $scope.model.isSelected || pointIsSelected;
        };

        $scope.expressionApi.getTypeLabel = function () {
            return 'PS';
        };

        $scope.expressionApi.onDeselect = function () {
            _($scope.model.points).each(function (point) {
                point.isSelected = false;
            });
            $scope.model.isSelected = false;
        };

        // remove expression if no points in point set
        $scope.$watch('model.points.length', function (newVal) {
            if (newVal === 0) {
                $scope.expressionApi.checkEmptyExpression();
            }
        });

        $scope.$watch('model.points', function (newVal) {
            _(newVal).each(function (point) {
                if (!point.isEditing && point.toString() !== '(, )') {
                    point.editText = point.toString();
                }
            });
        }, true);
    });

})(window.mt.graph);

(function (ns) {
    'use strict';

    /* Directives */

    angular.module('mtGraph').directive('mtGraphTool', function () {
        return {
            restrict            : 'E',
            templateUrl         : 'templates/graphToolTemplate.html',
            scope               : {
                toolId: '=',
                containerApi: '=',
                isOldGraph: '='
            },
            controller          : 'GraphToolCtrl'
        };
    });

})(window.mt.graph);

(function (ns) {
    'use strict';

    /* Directives */

    angular.module('mtGraph').directive('mtExpressionListPanel', function () {
        return {
            restrict            : 'E',
            replace             : true,
            templateUrl         : 'templates/expressionListPanelTemplate.html',
            controller          : 'ExpressionListCtrl',
            scope: {
                expressionList: '=',
                graphModel: '='
            }
        };
    });

})(window.mt.graph);

(function (ns) {
    'use strict';

    angular.module('mtGraph').directive('mtEquationExpression', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/equationExpressionTemplate.html',
            controller: 'EquationExpressionCtrl',
            link: function(scope, element, attrs) {
            }
        };
    });
})(window.mt.graph);

(function (ns) {
    'use strict';

    angular.module('mtGraph').directive('mtExpressionEntry', function () {
        return {
            restrict: 'E',
            scope: {
                model: '=',
                expressionListApi: '='
            },
            templateUrl: 'templates/expressionEntryTemplate.html',
            controller: 'ExpressionEntryCtrl',
            link: function(scope, element, attrs) {

                scope.blurInputs = function () {
                    scope.removeInputSelectedHighlighting();
                    //JMT this is throwing an exception on point dragend because it hits an ng-blur
                    // - this was causing a bug and it's dangerous to call blur directly when we have an ng-blur on it
                    //  removing for now
                    //$(element).find('input').blur();
                };

                scope.findNewInput = function () {
                    return $(element).find('.mt-new-input')[0];
                };

                scope.focusInput = function (input) {
                    $(input).focus();
                };

                scope.clearNewInputFlag = function () {
                    $('.mt-new-input').removeClass('mt-new-input');
                };

                scope.addInputSelectedHighlighting = function (input) {
                    scope.removeInputSelectedHighlighting();
                    $(input).addClass('mt-point-selected-input');
                };

                scope.removeInputSelectedHighlighting = function () {
                    $('#' + scope.toolId).find('.mt-point-selected-input').removeClass('mt-point-selected-input');
                };
            }
        };
    });
})(window.mt.graph);

(function (ns) {
    'use strict';

    angular.module('mtGraph').directive('mtGraphControls', function (safeApply) {
        return {
            controller: 'GraphSettingsCtrl',
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/graphControlsTemplate.html',
            scope: true,
            link: function(scope, element) {
                // move the popup to the body, so the that z-index layering works correctly
                $(element).appendTo($('body'));

                // remove the popup explicitly since it is in a different DOM position
                scope.$on('$destroy', function() {
                    $(element).remove();
                });

                /****************
                Keypad
                *****************/
                scope.setKeypadVisible = function (visible) {
                    var tapOutFn = function() {
                        safeApply(scope, function(){});
                    };
                    scope.keypad.setKeypadVisible(visible, document.activeElement, tapOutFn);
                };

                scope.isKeypadVisible = function (visible) {
                    return scope.keypad.keypadVisible;
                };

                scope.keypad = new mt.common.Keypad();
                scope.keypad.setKeypadVisible(false);

                scope.selectInput = function(event, target) {
                    scope.keypad.selectInput(event, target);
                };
            }
        };
    });
})(window.mt.graph);

(function (ns) {
    'use strict';

    angular.module('mtGraph').directive('mtGraph', function ($timeout, safeApply, popupMenuService) {
        return {
            restrict: 'E',
            template: '' +
                '<div class="mt-graph">' +
                    '<div class="mt-graph-container"' +
                        ' hm-drag="drag($event)"' +
                        ' hm-dragstart="dragStart($event)"' +
                        ' hm-dragend="dragEnd($event)"' +
                        ' hm-tap="tap($event)"' +
                        ' hm-hold="hold($event)"' +
                        ' hm-pinch="pinch($event)"' +
                        ' hm-release="release($event)">' +
                        '<svg class="mt-graph-svg" width="100%" height="100%"> </svg>' +
                    '</div>' +
                    '<div class="mt-shapes-toolbar">' +      // TODO the shapes toolbar doesn't belong here
                        '<div class="btn-group dropup">' +
                            '<button class="btn dropdown-toggle mt-add-shape-button mt-add-line-button" data-toggle="dropdown" ng-class="{\'mt-graph-selected-mode\': toolbarCategory==\'line\'}">{{toolbarText.line}}</button>' +
                            '<ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">' +
                                '<li>' +
                                '<div ng-click="addLine()" class="mt-add-line">{{modeDisplayMap.line}}</div>' +
                                '<div ng-click="addLineSegment()" class="mt-add-segment">{{modeDisplayMap.lineSegment}}</div>' +
                                '<div ng-click="addRay()" class="mt-add-ray">{{modeDisplayMap.ray}}</div>' +
                                '<div ng-click="addDropLineX()" class="mt-add-drop-x">{{modeDisplayMap.dropLineX}}</div>' +
                                '<div ng-click="addDropLineY()" class="mt-add-drop-y">{{modeDisplayMap.dropLineY}}</div>' +
                                '</li>' +
                            '</ul>' +
                        '</div>' +
                        '<div class="btn-group dropup">' +
                            '<button class="btn dropdown-toggle mt-add-shape-button mt-add-point-button" data-toggle="dropdown" ng-class="{\'mt-graph-selected-mode\': toolbarCategory==\'point\'}">{{toolbarText.point}}</button>' +
                            '<ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">' +
                            '<li>' +
                            '<div ng-click="pointMode()" class="mt-add-point">{{modeDisplayMap.point}}</div>' +
                            '<div ng-click="pointSetMode()" class="mt-add-point-set">{{modeDisplayMap.pointSetMode}}</div>' +
                            '</li>' +
                            '</ul>' +
                            '</div>' +
                '</div>',
            controller: 'GraphCtrl',
            scope: true,
            link: function(scope, element, attrs) {
                scope.modeDisplayMap = {
                    'point': 'Point',
                    'pointSetMode': 'Point Set',
                    'lineSegment': 'Line Segment',
                    'line': 'Line',
                    'ray': 'Ray',
                    'dropLineX': 'Drop X',
                    'dropLineY': 'Drop Y'
                };
                scope.modes = {
                    line: ['lineSegment', 'line', 'ray', 'dropLineX', 'dropLineY'],
                    point: ['', 'point', 'pointSetMode']
                };
                scope.toolbarText = {
                    line: 'Line',
                    point: 'Point'
                };
                scope.toolbarCategory = 'point';

                scope.$watch('gestureHandler.drawingMode', function(val) {
                    if (!val) {
                        val = 'point';
                    }
                    var displayText = scope.modeDisplayMap[val];

                    if (scope.modes.line.indexOf(val) > -1) {
                        scope.toolbarText.line = displayText;
                        scope.toolbarCategory = 'line';
                    } else {
                        scope.toolbarText.point = displayText;
                        scope.toolbarCategory = 'point';
                    }
                });

                scope.containerElement = $(element).find('.mt-graph-container')[0];

                function getEventPos(e) {
                    return [e.gesture.center.pageX-$(scope.containerElement).offset().left, e.gesture.center.pageY-$(scope.containerElement).offset().top];
                }

                scope.addLineSegment = function() {
                    scope.gestureHandler.setMode('lineSegment');
                };

                scope.addLine = function() {
                    scope.gestureHandler.setMode('line');
                };

                scope.addRay = function() {
                    scope.gestureHandler.setMode('ray');
                };

                scope.addDropLineX = function() {
                    scope.gestureHandler.setMode('dropLineX');
                };

                scope.addDropLineY = function() {
                    scope.gestureHandler.setMode('dropLineY');
                };

                scope.pointMode = function () {
                    scope.gestureHandler.setMode('');
                };

                scope.pointSetMode = function () {
                    scope.gestureHandler.setMode('pointSetMode');
                };

                var lastUpdate;
                var throttleThreshold = 50; //ms
                function throttleUpdate() {
                    var time = new Date().getTime();
                    if(lastUpdate === undefined || time - lastUpdate > throttleThreshold) {
                        lastUpdate = time;
                        return false;
                    }
                    return true;
                }

                var lastDigest;
                var throttleDigestThreshold = 150; //ms
                function throttleDigest() {
                    var time = new Date().getTime();
                    if(lastDigest === undefined || time - lastDigest > throttleDigestThreshold) {
                        lastDigest = time;
                        return false;
                    }
                    return true;
                }

                scope.drag = function (e) {
                    if(throttleUpdate()) {
                        return false;
                    }

                    var pos = getEventPos(e);
                    e.gesture.preventDefault();
                    scope.gestureHandler.dragAtPos(pos[0], pos[1]);

                    //only need to call digest to update expression list - don't need this every frame
                    if(throttleDigest() === false) {
                        scope.$apply();
                    }
                    return false;
                };


                scope.dragStart = function (e) {
                    var pos = getEventPos(e);
                    scope.gestureHandler.dragStartAtPos(pos[0], pos[1]);
                    if (scope.popUpOpen === true) {
                        popupMenuService.closePopup(true);
                    }
                };

                scope.dragEnd = function (e) {
                    scope.gestureHandler.dragEnd();
                };

                scope.tap = function (e) {
                    var el = document.elementFromPoint(e.gesture.center.pageX - document.body.scrollLeft,
                        e.gesture.center.pageY - document.body.scrollTop);

                    var pos = getEventPos(e);
                    scope.gestureHandler.tapAtPos(pos[0], pos[1], el.getAttribute('id'));
                };

                scope.hold = function (e) {
                    //e.gesture.preventDefault();
                    var el = document.elementFromPoint(e.gesture.center.pageX - document.body.scrollLeft,
                        e.gesture.center.pageY - document.body.scrollTop);

                    var pos = getEventPos(e);
                    var selected = scope.gestureHandler.holdAtPos(pos[0], pos[1], el.getAttribute('id'));

                    if(selected !== undefined) {
                        showPopupMenu(e, selected);
                    }
                };

                scope.release = function () {
                    firstPinch = true;
                    lastScale = 1;
                    scope.gestureHandler.release();

                    return false;
                };

                var firstPinch = true;
                var lastScale = 1;
                var dragCenter;
                scope.pinch = function(e) {
                    e.gesture.preventDefault();

                    if(throttleUpdate()) {
                        return false;
                    }

                    var pos = getEventPos(e);

                    if(firstPinch) {
                        lastScale = 1;
                        dragCenter = [pos[0], pos[1]];
                        firstPinch = false;
                    }
                    else {
                        var scale = 1 / e.gesture.scale;
                        var adjustedScale = scale/lastScale;//1 + (scale/lastScale - 1)*ns.PINCH_SCALE_FACTOR;
                        adjustedScale = Math.max(mt.common.MIN_SCALE_FACTOR, Math.min(mt.common.MAX_SCALE_FACTOR, adjustedScale));
                        lastScale = scale;

                        //ignore any scaling that is less than scale tolerance
                        if(Math.abs(adjustedScale - 1.0) < ns.SCALE_TOLERANCE) {
                            adjustedScale = 1;
                        }

                        scope.gestureHandler.pinchAtPos(dragCenter, adjustedScale, [pos[0], pos[1]]);
                        dragCenter = [pos[0], pos[1]];
                    }

                    return false;
                };

                function showPopupMenu(e, type) {
                    var menuItems = popupMenuItems[type];

                    // show the popup menu
                    popupMenuService.openPopup(menuItems, e, dismissAfterPopup);
                    scope.popUpOpen = true;
                }

                function popupClosed() {
                    scope.popUpOpen = false;
                }

                function dismissAfterPopup(actionTriggered){
                    if (!actionTriggered) {
                        scope.gestureHandler.deselectAll();
                    }
                    popupClosed();
                }

                //controller init
                scope.init();

                var popupMenuItems = {};
                popupMenuItems[mt.common.GRAPH_TYPE_POINT] = [
                    {
                        text: mt.common.POINT_MENU_REMOVE_POINT,
                        func: _(scope.gestureHandler.deleteSelectedPoint).bind(scope.gestureHandler)
                    }
                ];
                popupMenuItems[mt.common.GRAPH_TYPE_LINE] = [
                    {
                        text: mt.common.LINE_MENU_REMOVE_LINE,
                        func: _(scope.gestureHandler.deleteSelectedLine).bind(scope.gestureHandler)
                    },
                    {
                        text: mt.common.LINE_MENU_REMOVE_ALL_LINES,
                        func: _(scope.gestureHandler.deleteAllLines).bind(scope.gestureHandler)
                    },
                    {
                        text: mt.common.LINE_MENU_ADD_GLIDER,
                        func: _(scope.gestureHandler.addGliderToSelectedLine).bind(scope.gestureHandler)
                    }
                ];
                popupMenuItems[mt.common.GRAPH_TYPE_EQUATION] = [
                    {
                        text: mt.common.LINE_MENU_REMOVE_LINE,
                        func: _(scope.gestureHandler.deleteSelectedEquation).bind(scope.gestureHandler)
                    },
                    {
                        text: mt.common.LINE_MENU_REMOVE_ALL_LINES,
                        func: _(scope.gestureHandler.deleteAllLines).bind(scope.gestureHandler)
                    }
                ];
                popupMenuItems[mt.common.GRAPH_TYPE_GLIDER] = [
                    {
                        text: mt.common.LINE_MENU_REMOVE_GLIDER,
                        func: _(scope.gestureHandler.deleteSelectedGlider).bind(scope.gestureHandler)
                    }
                ];
            }
        };
    });
})(window.mt.graph);

(function (ns) {
    'use strict';

    angular.module('mtGraph').directive('mtLineExpression', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/lineExpressionTemplate.html',
            controller: 'LineExpressionCtrl',
            link: function(scope, element, attrs) {
            }
        };
    });
})(window.mt.graph);

(function (ns) {
    'use strict';

    angular.module('mtGraph').directive('mtPointExpression', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/pointExpressionTemplate.html',
            controller: 'PointExpressionCtrl',
            link: function(scope, element, attrs) {
            }
        };
    });
})(window.mt.graph);

(function (ns) {
    'use strict';

    angular.module('mtGraph').directive('mtPointSetExpression', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/pointSetExpressionTemplate.html',
            controller: 'PointSetExpressionCtrl',
            link: function(scope, element, attrs) {
            }
        };
    });
})(window.mt.graph);

angular.module('mtGraph').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/equationExpressionTemplate.html',
    "<div class=mt-equation-expression><input class=\"mt-equation-expression-input mt-new-input\" ng-readonly=isReadOnly() ng-init=\"inputInit(model, 'editText', 'equation')\" ng-model=model.editText ng-click=\"selectObject($event, model, 'editText', 'equation')\" ng-change=updateFromEditText() ng-blur=\"deselectIfKeyboard()\"></div>"
  );


  $templateCache.put('templates/expressionEntryTemplate.html',
    "<div id={{model.id}}Expression class=mt-expression hm-swipe=onExpressionSwipe($event) hm-tap=selectExpression()><div class=mt-expression-type ng-class=\"{'mt-expression-selected': expressionApi.isActive(), 'mt-expression-delete': showDelete}\" ng-bind=getTypeLabel() hm-tap=selectIndicator()></div><div class=mt-expression-inputs ng-switch on=model.type()><mt-point-expression ng-switch-when=\"point type\"></mt-point-expression><mt-point-set-expression ng-switch-when=\"point set type\"></mt-point-set-expression><mt-line-expression ng-switch-when=\"line type\"></mt-line-expression><mt-equation-expression ng-switch-when=\"equation type\"></mt-equation-expression></div></div>"
  );


  $templateCache.put('templates/expressionListPanelTemplate.html',
    "<div class=mt-expression-container ng-class=\"{'mt-minimized': !visible}\"><button type=button class=\"btn mt-maximize-expression-list\" ng-click=show() ng-class=\"{'mt-minimized': visible}\"></button><div class=mt-expression-list-pane ng-class=\"{'mt-minimized': !visible}\"><div class=mt-expression-list-toolbar><div class=btn-group><button class=\"btn dropdown-toggle mt-add-shape-button\" data-toggle=dropdown></button><ul class=dropdown-menu role=menu aria-labelledby=dLabel><li><div class=mt-add-point-expression ng-click=addPoint()>Point</div><div class=mt-add-point-set-expression ng-click=addPointSet()>Point Set</div><div class=mt-add-eqn-expression ng-click=addEquation()>Equation</div></li></ul></div>Expression List <button type=button class=\"btn mt-minimize-expression-list\" ng-click=hide()></button></div><div class=mt-expression-list hm-drag=handleDrag($event)><div ng-repeat=\"modelId in graphModel.uniqueObjects() | reverse\"><mt-expression-entry model=graphModel.getObject(modelId) expression-list-api=expressionListApi></mt-expression-entry></div></div></div></div>"
  );


  $templateCache.put('templates/graphControlsTemplate.html',
    "<div modal=controlsOpen><div class=modal-header><h4>Graph Controls</h4></div><div class=modal-body><div class=row><div class=span3><form class=mt-form-horizontal><fieldset><div class=control-group><label class=\"mt-graph-label control-label\">Minor tick interval X:</label><div class=mt-controls><mt-input keypad=keypad model=settings.tickXMinor class=\"input-mini mt-id-input-tick-x-minor\" placeholder=interval required></mt-input><br></div></div><div class=control-group><label class=\"mt-graph-label control-label\">Minor tick interval Y:</label><div class=controls><mt-input keypad=keypad model=settings.tickYMinor class=\"input-mini mt-id-input-tick-y-minor\" placeholder=interval required><br></mt-input></div></div><div class=control-group><label class=\"mt-graph-label control-label\">Major tick interval X:</label><div class=controls><mt-input keypad=keypad model=settings.tickXMajor class=\"input-mini mt-id-input-tick-x-major\" placeholder=interval required><br></mt-input></div></div><div class=control-group><label class=\"mt-graph-label control-label\">Major tick interval Y:</label><div class=controls><mt-input keypad=keypad model=settings.tickYMajor class=\"input-mini mt-id-input-tick-y-major\" placeholder=interval required><br></mt-input></div></div></fieldset></form></div><div class=span3><form class=mt-form-horizontal><fieldset><div class=control-group><label class=\"mt-graph-label control-label\">Max X:</label><div class=controls><mt-input keypad=keypad model=settings.maxX class=\"input-mini mt-id-input-max-x\" placeholder=value required><br></mt-input></div></div><div class=control-group><label class=\"mt-graph-label control-label\">Max Y:</label><div class=controls><mt-input keypad=keypad model=settings.maxY class=\"input-mini mt-id-input-max-y\" placeholder=value required><br></mt-input></div></div><div class=control-group><label class=\"mt-graph-label control-label\">Min X:</label><div class=controls><mt-input keypad=keypad model=settings.minX class=\"input-mini mt-id-input-min-x\" placeholder=value required><br></mt-input></div></div><div class=control-group><label class=\"mt-graph-label control-label\">Min Y:</label><div class=controls><mt-input keypad=keypad model=settings.minY class=\"input-mini mt-id-input-min-y\" placeholder=value required><br></mt-input></div></div></fieldset></form></div><div class=span6><fieldset><div class=control-group><div id=labelControls><button id=onPointLabelsButton class=btn ng-click=toggleShowPointLabels()><label ng-show=!settings.showPointLabels>Turn On Point Labels</label><label ng-show=settings.showPointLabels>Turn Off Point Labels</label></button></div></div><div class=control-group><label class=control-label>Label X - Axis:</label><div class=controls><mt-input model=settings.xAxisLabel class=\"input-xlarge mt-id-input-x-axis-label\" placeholder=value required><br></mt-input></div></div><div class=control-group><label class=control-label>Label Y - Axis:</label><div class=controls><mt-input model=settings.yAxisLabel class=\"input-xlarge mt-id-input-y-axis-label\" placeholder=value required><br></mt-input></div></div></fieldset></div></div></div><div class=modal-footer><button class=\"btn btn-warning mt-cancel mt-cancel-graph-controls-button\" ng-click=toggleControls(false)>Close</button></div></div>"
  );


  $templateCache.put('templates/graphToolTemplate.html',
    "<div class=mt-graph-wrapper><div class=row><mt-expression-list-panel expression-list=expressionList graph-model=graphModel></mt-expression-list-panel><mt-graph graph-model=graphModel tool-id=toolId container-api=containerApi></mt-graph></div><br><mt-graph-controls></mt-graph-controls><mt-link-indicator eventineer=eventineer></mt-link-indicator></div>"
  );


  $templateCache.put('templates/lineExpressionTemplate.html',
    "<div><div class=mt-point-expression ng-repeat=\"point in [model.start, model.end] track by $index\"><span class=mt-point-name-container ng-class=\"{'mt-point-invalid-input': !point.hasValidName}\"><input class=mt-point-name ng-readonly=isReadOnly() ng-model=point.name ng-change=updateName() ng-click=\"selectObject($event, point, 'name', 'text')\" ng-blur=deselectIfKeyboard() ng-disabled=\"disableNameInput(point)\"></span> <input class=mt-point-expression-input ng-readonly=isReadOnly() ng-model=point.editText ng-click=\"selectObject($event, point, 'editText', 'point')\" ng-change=updateFromEditText() ng-blur=\"deselectIfKeyboard()\"></div><div class=mt-expression-glider-container ng-show=hasGliders()><span>Gliders</span><div class=\"mt-point-expression mt-point-expression-display mt-glider-expression-display\" ng-repeat=\"glider in getGliders()\" ng-bind=glider.toString()></div></div></div>"
  );


  $templateCache.put('templates/pointExpressionTemplate.html',
    "<div class=mt-point-expression><span class=mt-point-name-container ng-class=\"{'mt-point-invalid-input': !model.hasValidName}\"><input class=mt-point-name ng-readonly=isReadOnly() ng-model=model.name ng-change=updateName() ng-click=\"selectObject($event, model, 'name', 'text')\" ng-blur=\"deselectIfKeyboard()\"></span> <input class=\"mt-point-expression-input mt-new-input\" ng-readonly=isReadOnly() ng-init=\"inputInit(model, 'editText', 'point')\" ng-model=model.editText ng-click=\"selectObject($event, model, 'editText', 'point')\" ng-change=updateFromEditText() ng-blur=\"deselectIfKeyboard()\"></div>"
  );


  $templateCache.put('templates/pointSetExpressionTemplate.html',
    "<div><div class=mt-point-expression ng-repeat=\"point in model.points\"><span class=mt-point-name-container ng-class=\"{'mt-point-invalid-input': !point.hasValidName}\"><input class=mt-point-name ng-readonly=isReadOnly() ng-model=point.name ng-change=updateName() ng-click=\"selectObject($event, point, 'name', 'text')\" ng-blur=\"deselectIfKeyboard()\"></span> <input class=\"mt-point-expression-input mt-new-input\" ng-readonly=isReadOnly() ng-init=\"inputInit(point, 'editText', 'point')\" ng-model=point.editText ng-click=\"selectObject($event, point, 'editText', 'point')\" ng-change=updateFromEditText() ng-blur=\"deselectIfKeyboard()\"></div><input type=button class=mt-btn-add-point ng-show=showAddPoint() ng-click=\"addPoint()\"></div>"
  );

}]);
