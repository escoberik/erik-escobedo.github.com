

if (!window.mt) {
    window.mt = {};
}

window.mt.workspace = {};

var workspaceModules = [
    'ngResource',
    'mt.common'
].concat(window.mt.loadModules);

angular.module('mtWorkspace', workspaceModules);

//bootstrap external tools
(function() {
    'use strict';
    var externalTools = [];

    //expose API for registering tools
    window.mt.API = {
        registerExternalTool: function(template) {
            externalTools.push(template);
        }
    };

    //note config step gets executed after all js has loaded
    angular.module('mtWorkspace').config(function (toolRegistryServiceProvider) {
        for(var i in externalTools) {
            toolRegistryServiceProvider.addTemplate(externalTools[i]);
        }
    });

    angular.module('mtWorkspace').run(function (mtTourService) {
        var tourName = 'workspace';

        var tour = new Shepherd.Tour({
            defaults: {
                classes: 'shepherd-theme-arrows',
                scrollTo: false
            }
        });

        tour.addStep('welcome', {
            title: 'Amplify Math Workspace',
            text: 'Welcome to the Amplify Math Workspace. We\'ll walk you through some basics.',
            attachTo: '.mt-global-toolbar bottom',
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [
                {
                    text: 'Exit',
                    classes: 'shepherd-button-secondary',
                    action: function() {
                        mtTourService.finishTour(tourName);
                    }
                },
                {
                    text: 'Next',
                    classes: 'shepherd-button-primary',
                    action: function () {
                        mtTourService.nextStep(tourName, 'welcome');
                    }
                }
            ]
        });

        tour.addStep('openTool', {
            title: 'Open a Tool',
            text: 'Click this button to open the tool ribbon.',
            attachTo: '.mt-global-icon-tools bottom',
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [
                {
                    text: 'Exit',
                    classes: 'shepherd-button-secondary',
                    action: function () {
                        mtTourService.finishTour(tourName);
                    }
                }
            ]
        });

        tour.addStep('openTable', {
            title: 'Open a Table',
            text: 'Click this button to bring up a Table.',
            attachTo: '.mt-ribbon-image-table bottom',
            classes: 'shepherd shepherd-open shepherd-theme-arrows shepherd-transparent-text',
            buttons: [
                {
                    text: 'Exit',
                    classes: 'shepherd-button-secondary',
                    action: function () {
                        mtTourService.finishTour(tourName);
                    }
                }
            ]
        });

        mtTourService.setTour(tourName, tour);
    });
})();

(function (ns) {
    'use strict';

    ns.WorkspaceEventineer = (function () {
        //constructor function
        function WorkspaceEventineer(id, eventManager, callbacks) {
            if (!(this instanceof WorkspaceEventineer)) {
                return new WorkspaceEventineer(id, eventManager, callbacks);
            }

            function getCallback(eventName) {
                return angular.isFunction(callbacks[eventName]) ? callbacks[eventName] : angular.noop;
            }

            var addToolCallback = getCallback(mt.common.EVENT_CREATE_TOOL),
                removeToolCallback = getCallback(mt.common.EVENT_REMOVE_TOOL),
                toggleNetworkCallback = getCallback(mt.common.EVENT_NETWORK_CONNECTION_STATUS);

            //is this space the target of the event?
            function isSpaceTarget(event) {
                //handle events for this space or untargeted events in default space
                return event.spaceId === id || (event.spaceId === undefined && id === mt.common.DEFAULT_SPACE_ID);
            }

            //subscribe to create tool
            eventManager.subscribe(id, mt.common.EVENT_CREATE_TOOL, function(event) {
                if (isSpaceTarget(event)) {
                    addToolCallback(event.type, event.toolId, event.phase, event.hidden);
                }
            });

            //subscribe to tool removal

            eventManager.subscribe(id, mt.common.EVENT_REMOVE_TOOL, function (event) {
                if (isSpaceTarget(event)) {
                    removeToolCallback(event.toolId);
                }
            });

            //subscribe to network connection status
            eventManager.subscribe(id, mt.common.EVENT_NETWORK_CONNECTION_STATUS, function (event) {
                toggleNetworkCallback(event.data.connected);
            });
        }

        return WorkspaceEventineer;
    })();
})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mtWorkspace').controller('mtToolContainerController', function ($scope, $timeout, workspaceNavService, activeToolService) {
        $scope.init = function() {
            if(angular.equals($scope.toolPos, mt.common.TOOL_INIT_POS)) {
                $scope.toolPos = workspaceNavService.getNextToolPos($scope.contentElement);
            }
            registerNavTool();

            $scope.fitToolPos(false);
            if($scope.isActive()) {
                $scope.centerViewOnTool();
            }

            $scope.applyStyle();
        };

        $scope.fitToolPos = function(animate) {
            var toolPosStart = angular.copy($scope.toolPos);
            $scope.toolPos = workspaceNavService.findToolPosition($scope.toolTemplate.toolId, $scope.toolPos, $scope.contentElement);
            if(animate === true && mt.common.getDistSq($scope.toolPos, toolPosStart) > mt.common.TOOL_ANIMATE_DISTSQ) {
                $scope.setToolAnimate();
                $scope.centerViewOnTool();
            }
            updateNavTool();
            $scope.applyStyle();
        };

        function getCenterPos() {
            var width = $scope.contentElement.width();
            var height = $scope.contentElement.height();
            return [$scope.toolPos[0]+width/2, $scope.toolPos[1]+height/2];
        }

        $scope.centerViewOnTool = function() {
            workspaceNavService.moveViewport(getCenterPos(), true);
        };

        function registerNavTool() {
            workspaceNavService.registerTool($scope.toolTemplate.toolId, $scope.toolPos, $scope.contentElement);
        }

        function updateNavTool() {
            workspaceNavService.updateTool($scope.toolTemplate.toolId, $scope.toolPos, $scope.contentElement);
        }

        //move tool position during a drag
        $scope.moveToolPos = function(delta) {
            var scale = workspaceNavService.getScale();
            $scope.toolPos[0] += delta[0]/scale;
            $scope.toolPos[1] += delta[1]/scale;
            $scope.applyStyle();
            updateNavTool();
        };

        $scope.onMinTouch = function(event) {
            if($scope.isMinimized()) {
                workspaceNavService.zoom(getCenterPos(), true);
            }
            $scope.bringToFront();
            if(event !== undefined) {
                event.stopPropagation();
                event.gesture.stopPropagation();
                event.preventDefault();
                event.gesture.preventDefault();
            }
        };

        $scope.bringToFront = function () {
            activeToolService.setActiveTool($scope.toolTemplate.toolId);
        };

        $scope.isActive = function() {
            return activeToolService.getActiveId() === $scope.toolTemplate.toolId;
        };

        $scope.isInactive = function() {
            return ($scope.isActive() === false) || $scope.isMinimized();
        };

        $scope.isMinimized = function () {
            return workspaceNavService.isZoomedOut();
        };
    });

})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mtWorkspace').controller('PenSurfaceCtrl', function ($scope, annotationService, toolPersistorService, containerApiFactory) {
        function initDataModel() {
            $scope.penData =
            [
                //GROUP object - eventually we will have a group for each tool to which we can apply separate transforms
                {
                    groupId: mt.common.PEN_WORKSPACE_GROUP,
                    lines:[]
                }
            ];
        }
        initDataModel();

        $scope.isInactive = function() {
            return annotationService.isActive() === false;
        };

        $scope.createActiveLine = function(pos, isPoint, groupId) {
            annotationService.togglePenMenu(false);

            if(groupId === undefined) {
                groupId = mt.common.PEN_WORKSPACE_GROUP;
            }

            $scope.activeLine = {
                color: annotationService.getPenColor(),
                width: annotationService.getPenSize(),
                points: [
                    {x:pos[0], y: pos[1]},
                ],
                bounds:{
                    min: {x:pos[0], y: pos[1]},
                    max: {x:pos[0], y: pos[1]}
                }
            };

            if(isPoint === true) {
                $scope.activeLine.points.push({x:pos[0]+1, y: pos[1]});
                $scope.activeLine.points.push({x:pos[0]+1, y: pos[1]+1});
                $scope.activeLine.points.push({x:pos[0], y: pos[1]+1});
            }

            //add to the main data model
            var group = _.findWhere($scope.penData, {groupId:groupId});
            group.lines.push($scope.activeLine);
        };

        function updateBoundsForPos(bounds, pos) {
            if(pos.x < bounds.min.x) {
                bounds.min.x = pos.x;
            } else if(pos.x > bounds.max.x) {
                bounds.max.x = pos.x;
            }

            if(pos.y < bounds.min.y) {
                bounds.min.y = pos.y;
            } else if(pos.y > bounds.max.y) {
                bounds.max.y = pos.y;
            }
        }

        $scope.addPointToActiveLine = function(pos) {
            $scope.activeLine.points.push({x:pos[0], y: pos[1]});

            updateBoundsForPos($scope.activeLine.bounds, {x: pos[0], y: pos[1]});
        };


        $scope.getWorkspaceLines = function () {
            return _.findWhere($scope.penData, {groupId: mt.common.PEN_WORKSPACE_GROUP}).lines;
        };

        //eraser is effectively a square with length twice this size
        var eraserSize = 35;
        var minPoints = 2;

        $scope.erasePoints = function(pos) {
            var allLines = $scope.getWorkspaceLines();

            var intersections = getLineIntersections(pos);
            var linesToAdd = [];

            _.each(intersections, function(line, index) {
                linesToAdd = linesToAdd.concat(applyErase(line, pos));
                var curIndex = allLines.indexOf(line);
                //remove original line
                allLines.splice(curIndex, 1);
            });

            _.each(linesToAdd, function(line) {
                //need at least 4 points for the spline
                if(line.points.length >= minPoints) {
                    updateLineBounds(line);
                    allLines.push(line);
                }
            });
        };

        //find all lines that intersect have a point in their bounds
        function getLineIntersections(pos) {
            var allLines = $scope.getWorkspaceLines();
            return _.filter(allLines, function(line) {

                var res =  line.bounds.min.x - eraserSize < pos[0] && line.bounds.min.y - eraserSize < pos[1] &&
                    line.bounds.max.x + eraserSize > pos[0] && line.bounds.max.y + eraserSize > pos[1];
                return res;
            });
        }

        function updateLineBounds(line) {
            if(line.points.length < 1) {
                return;
            }
            var p0 = line.points[0];

            line.bounds = {
                min: {x: p0.x, y: p0.y},
                max: {x: p0.x, y: p0.y}
            };

            for(var i = 1; i < line.points.length; i++) {
                updateBoundsForPos(line.bounds, line.points[i]);
            }
        }

        function applyErase(line, pos) {
            var newLines = [];
            splitLine(line, pos, newLines);

            return newLines;
        }

        //recursive funtion to split the lines from start to finish
        function splitLine(line, pos, newLines) {
            var splitIndex, inBounds, p;
            var splitLength = 1;
            for(var i = 0; i < line.points.length; i++) {
                p = line.points[i];
                inBounds = Math.abs(p.x - pos[0]) < eraserSize && Math.abs(p.y - pos[1]) < eraserSize;
                if(splitIndex === undefined) {
                    if(inBounds) {
                        splitIndex = i;
                    }
                } else {
                    if(inBounds) {
                        splitLength++;
                    } else {
                        //found the end of the split
                        break;
                    }
                }
            }

            //add the split lines to the array
            if(splitIndex === undefined) {
                newLines.push(line);
            } else {
                var splitLines = applySplit(line, splitIndex, splitLength);
                //add the first split line
                newLines.push(splitLines[0]);

                //continue to split the second part of line
                if(splitLines.length > 1) {
                    splitLine(splitLines[1], pos, newLines);
                }
            }
        }

        function applySplit(line, splitIndex, splitLength) {
            var newLines = [];
            var curLine;
            curLine = angular.copy(line);
            curLine.points = curLine.points.splice(0, splitIndex);
            newLines.push(curLine);

            if(line.points.length > splitIndex + splitLength) {
                curLine = angular.copy(line);
                curLine.points.splice(0, splitIndex + splitLength);
                newLines.push(curLine);
            }

            return newLines;
        }

        $scope.finishLine = function() {
            $scope.activeLine = undefined;
        };

        $scope.clear = function () {
            annotationService.togglePenMenu(false);
            initDataModel();
            $scope.render();
        };
        annotationService.registerClearFunction($scope.clear);
    });

})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mtWorkspace').controller('ToolPaletteCtrl', function ($scope, $timeout, dataExchangeService) {
        $timeout(function() {

            function genericExport(target) {
                var exportData = $scope.containerApi.exportData();
                dataExchangeService.exportToNewTool(target, undefined, exportData);
            }

            $scope.globalPaletteItems = [
                {
                    inactiveClass: 'icon-lock',
                    activeClass: 'icon-lock-hl',
                    toggledClass: 'icon-lock-hl',
                    toggledBackgroundClass: 'active-button',
                    backgroundClass: 'global-button',
                    idClass: 'lockBtn',
                    showFn: $scope.containerApi.canToggleLockMode,
                    callbackFn: $scope.containerApi.toggleLockMode
                },
                {
                    options: $scope.containerApi.exportTargets,
                    activeClass: 'icon-export',
                    inactiveClass: 'icon-export',
                    backgroundClass: 'global-button',
                    idClass: 'exportBtn',
                    showFn: $scope.containerApi.canExportData,
                    callbackFn: genericExport,
                    getOptionStateFn: angular.noop
                },
                {
                    inactiveClass: 'icon-clear',
                    activeClass: 'icon-clear-hl',
                    backgroundClass: 'global-button',
                    idClass: 'clearBtn',
                    showFn: $scope.containerApi.canClear,
                    callbackFn: $scope.containerApi.clear
                },
                {
                    inactiveClass: 'icon-duplicate',
                    activeClass: 'icon-dupicate-hl',
                    backgroundClass: 'global-button',
                    idClass: 'duplicateBtn',
                    showFn: $scope.containerApi.canDuplicate,
                    callbackFn: $scope.containerApi.duplicate
                },
                {
                    inactiveClass: 'icon-link',
                    activeClass: 'icon-link-hl',
                    backgroundClass: 'global-button',
                    idClass: 'linkBtn',
                    showFn: $scope.containerApi.canLink,
                    callbackFn: $scope.containerApi.link
                },
                {
                    inactiveClass: 'icon-broadcast',
                    activeClass: 'icon-broadcast-hl',
                    backgroundClass: 'global-button',
                    idClass: 'broadcastBtn',
                    showFn: $scope.containerApi.canBroadcast,
                    callbackFn: $scope.containerApi.broadcast
                }
            ];
        });

        $scope.localPaletteItems = [];
        $scope.containerApi.registerAddLocalPaletteItem(function(item) {
            var foundOldItem = false;

            if (item.name !== undefined) {
                _($scope.localPaletteItems).forEach(function(curItem, index) {
                    if (curItem.name === item.name) {
                        $scope.localPaletteItems[index] = item;
                        foundOldItem = true;
                    }
                });
            }
            if(!foundOldItem) {
                $scope.localPaletteItems.push(item);
            }
        });

        $scope.showToolPalette = function () {
            return $scope.containerApi.canName ||
                $scope.containerApi.canToggleLockMode() ||
                $scope.containerApi.canExportData() ||
                $scope.containerApi.canBroadcast() ||
                $scope.containerApi.canClear() ||
                $scope.containerApi.canLink() ||
                $scope.containerApi.canDuplicate();
        };
    });

})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mtWorkspace').controller('WorkspaceCtrl', function ($scope, $location, $attrs, $interval, eventingService, realtimeService,
                                                 roleService, safeApply, $timeout,
                                                 broadcastService, handwritingService,
                                                 toolRegistryService, environmentService, preconfiguredToolService, modalAlertService, workspaceNavService,
                                                 postMessageService, dataExchangeService, localStorageService, sessionService, activeToolService, configService, mtTourService,
                                                 workspaceAbstractService, persistorService, toolMenuService, workspacePageService) {

        setTimeout(function(){
            $(window).scrollTop(0);
        });
        setTimeout(function () {
            mtTourService.startTour('workspace');
        }, 0);


        var spaceId = mt.common.DEFAULT_SPACE_ID;
        $scope.workspaceApi = environmentService.createSpaceApi(spaceId);

        // roleType -> Role Type Workspace
        $scope.workspaceHeader = _.chain(roleService.getRole()).humanize().titleize().value() + ' Workspace';

        $scope.tools = [];

        $scope.isIpadHomescreen = function() {
            return window.navigator.standalone;
        };

        $scope.addTool = function (type, id, template, hidden) {
            if (id) {
                //don't recreate the tool if it already exists
                if(_.findWhere($scope.tools, {toolId: id}) !== undefined) {
                    return;
                }
            } else {
                id = mt.common.createGuid();
            }

            if (undefined === template) {
                template = toolRegistryService.getTemplate(type);
                if (template === undefined) {
                    console.log('type:', type, 'id:', id, ' could not load');
                    return;
                }
            }

            //copy template properties into a new tool def instance
            var tool = {
                type: template.type,
                displayName: template.displayName,
                toolId: id,
                htmlTemplate: template.htmlTemplate,
                hidden: hidden
            };

            $scope.tools.push(tool);

            safeApply($scope, angular.noop);
        };

        // remove the tool from the list
        $scope.removeTool = function (id) {
            var item = _.findWhere($scope.tools, {toolId: id});

            if (!item) {
                return;
            }

            //remove the subscriber from all eventing by its tool id
            eventingService.removeSubscriber(id);

            if (item.type === mt.common.TYPE_RESULTS_TABLE) {
                toolRegistryService.getTemplate(mt.common.TYPE_RESULTS_TABLE).disabled = false;
            }

            var index = $scope.tools.indexOf(item);
            $scope.tools.splice(index, 1);

            workspaceNavService.unregisterTool(id);

            if(activeToolService.getActiveId() === id) {
                activeToolService.setActiveTool(undefined);
            }

            var container = _.findWhere($scope.workspaceApi.containers, {toolId: id});
            var containerIndex = $scope.workspaceApi.containers.indexOf(container);
            if (containerIndex >= 0) {
                $scope.workspaceApi.containers.splice(containerIndex, 1);
            }
        };

        $scope.removeAllTools = function () {
            var idsToRemove = [];
            var i;
            for (i in $scope.tools) {
                idsToRemove.push($scope.tools[i].toolId);
            }
            for (i in idsToRemove) {
                $scope.removeTool(idsToRemove[i]);
            }
            $scope.workspaceApi.containers = [];
        };

        $scope.clear = function () {
            $scope.removeAllTools();
        };

        $scope.killFocus = function () {
            if (!$scope.workspaceApi.selecting) {
                //set the active tool to undefined
                activeToolService.setActiveTool(undefined);

                //closes tool list menu
                toolMenuService.toggleToolListMenu(false);
            }
        };

        var externalToolMap = {};
        $scope.addPreconfiguredTool = function (packet) {
            //only handle events for this space
            if(packet.data.data.spaceId !== spaceId) {
                return;
            }

            safeApply($scope, function () {
                var event = packet.data;
                var data = event.data;
                var sourceToolId = data.toolId;

                if (event.preserveId) {
                    // remove tools with same guid
                    $scope.removeTool(data.toolId);
                } else {
                    data.toolId = mt.common.createGuid();
                }

                //for students open a resultsTable as a table
                if (data.type === mt.common.TYPE_RESULTS_TABLE && roleService.getRole() !== mt.common.TEACHER_ROLE) {
                    data.type = mt.common.TYPE_TABLE;
                }
                var preconfiguredTool = {
                    type: data.type,
                    spaceId: spaceId,
                    data: data.data,
                    name: data.name,
                    toolId: data.toolId
                };
                preconfiguredToolService.addToolWithData(preconfiguredTool);

                //check whether the tool has already been sent, in which case override
                if (externalToolMap[sourceToolId]) {
                    $scope.removeTool(externalToolMap[sourceToolId]);
                }
                externalToolMap[sourceToolId] = data.toolId;
            });
        };
        $scope.sendToolSubId = realtimeService.onSendTool($scope.addPreconfiguredTool);
        $scope.$on('$destroy', function() {
            realtimeService.unregisterCallback($scope.sendToolSubId);
        });

        // persistence
        $scope.persistor = new mt.common.WorkSpacePersistor(spaceId, localStorageService, sessionService.getSessionId(), configService, workspacePageService);

        //exposing sessionId on the scope for now to allow it to be injected in tests
        $scope.setSessionId = function (id) {
            $scope.persistor.setSessionId(id);
        };

        $scope.load = function () {
            $scope.removeAllTools();
            $scope.persistor.loadTools();
            $scope.currentWorkspaceName = $scope.persistor.workspaceName;
        };

        $scope.save = function () {
            $scope.persistor.workspaceName = $scope.currentWorkspaceName;
            $scope.persistor.templates = toolRegistryService.getTemplates();
            $scope.persistor.saveTools();
        };

        // offline mode
        $scope.offlineMode = false;
        $scope.toggleOfflineMode = function (offline) {
            if ($scope.offlineMode !== offline) {
                $scope.offlineMode = offline;
                realtimeService.toggleOfflineMode(offline);
            }
        };

        // overwrite default noops
        $scope.workspaceApi.removeTool = $scope.removeTool;
        $scope.workspaceApi.clear = $scope.clear; // this should really go through the space persistor and be based on eventing
        workspacePageService.registerClearFn($scope.clear);
        $scope.workspaceApi.containers = [];

        // Workspace broadcasting
        $scope.broadcastWorkspace = function (config) {
            if (undefined === config) {
                config = {};
            }
            if (undefined === config.target) {
                config.target = mt.common.STUDENT_ROLE;
            }
            _($scope.workspaceApi.containers).each(function (container) {
                if (angular.isFunction(container.broadcast)) {
                    container.broadcast(config);
                }
            });

            var target = config.target;
            if (mt.common.isRole(config.target)) {
                target += 's';
            }
            modalAlertService.showModalAlert('Workspace sent to ' + target);
        };

        $scope.networkConnected = false;
        function toggleNetwork(isConnected) {
            $scope.networkConnected = isConnected;
            safeApply($scope, function () {});
        }

        // eventineer
        var eventineerCallbacks = {};
        eventineerCallbacks[mt.common.EVENT_CREATE_TOOL] = $scope.addTool;
        eventineerCallbacks[mt.common.EVENT_REMOVE_TOOL] = $scope.removeTool;
        eventineerCallbacks[mt.common.EVENT_NETWORK_CONNECTION_STATUS] = toggleNetwork;
        $scope.eventineer = new ns.WorkspaceEventineer(spaceId, eventingService, eventineerCallbacks);

        var saveInterval;

        //load up session data on startup
        if(configService.localStoragePersistence) {
            $scope.load();
        }

        //save data every 30s
        saveInterval = $interval($scope.save, mt.common.SAVE_INTERVAL, 0, false);

        $scope.$on('$destroy', function() {
            if(saveInterval !== undefined) {
                $interval.cancel(saveInterval);
            }
        });

        //get rid of scrolling in workspace
        $(document).bind('touchmove', function(e) {
            if (e.originalEvent.touches === undefined || e.originalEvent.touches.length !== 2) {
                return false;
            }
            if ($(e.target).parents('.mt-allow-scroll').length === 0) {
                return false;
            }
        });


        // don't allow backspace on non input elements
        $(document).bind('keydown keypress', function(e){
            if( e.which === 8 ){ // 8 == backspace
                if(!(/SELECT|INPUT|TEXTAREA/i).test(e.target.tagName) ){
                    e.preventDefault();
                }
            }
        });

        $scope.API = function() {
            return {
                addTable: function() {
                    var guid = mt.common.createGuid();
                    $scope.addTool(mt.common.TYPE_TABLE, guid);
                    return mt.common.getToolApi('tool-' + guid);
                },

                //template should be in the format of toolRegistryService.templates, but should include htmlTemplate
                addExternalTool: function(type, template) {
                    $scope.addTool(type, undefined, template);
                    return this;
                },

                getToolsDescriptors: function() {
                    var tools = [];
                    for (var i = 0; i < $scope.tools.length; ++i)
                    {
                        tools.push({
                            'type': $scope.tools[i].type,
                            'displayName': $scope.tools[i].displayName,
                            'toolId': $scope.tools[i].toolId
                        });
                    }
                    return tools;
                },
                eventing:
                {
                    getEventManager: function() {
                        return eventingService;
                    }
                },

                broadcast:
                {
                    broadcastWorkspace: function(config) {
                        return $scope.broadcastWorkspace(config);
                    },
                    getTarget: function() {
                        return broadcastService.getTarget();
                    }
                },
                handwriting:
                {
                    openPanelForElement: function(element, strokes, recognizerMode, updateCallback, closeCallback)
                    {
                        return handwritingService.openPanelForElement(element, strokes, recognizerMode, updateCallback, closeCallback);
                    }
                },
                role:
                {
                    getRole: function()
                    {
                        return roleService.getRole();
                    }
                }
            };
        };

        //load tool data form URL params if available
        $timeout(function initFromEncodedUrl() {
            var encodedData = $location.search().toolData;
            if(encodedData !== undefined && encodedData !== '') {
                var toolData = mt.common.fromBase64(decodeURIComponent(encodedData));

                //clear
                var workspaceApi = environmentService.getSpaceApi(mt.common.DEFAULT_SPACE_ID);
                workspaceApi.clear();
                //open new tools
                dataExchangeService.importAll(JSON.parse(toolData));
                return true;
            }
        });

        $scope.isSubmissionActive = function() {
            return workspaceAbstractService.isSubmissionDisplayed();
        };
    });

})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mtWorkspace').controller('WorkspaceNavbarCtrl', function ($scope, $location, roleService) {
        // Set original url for convenience refresh div
        $scope.originalUrl = $location.absUrl();

        $scope.isTeacher = function () {
            return roleService.getRole() === mt.common.TEACHER_ROLE;
        };
    });
})(window.mt.workspace);
(function (ns) {
    'use strict';

    angular.module('mtWorkspace').directive('mtCanvas', function ($timeout, workspaceNavService, workspaceSelectionService, toolRegistryService, activeToolService) {
        return {
            restrict: 'E',
            templateUrl: 'templates/mtCanvasTemplate.html',
            replace: true,
            transclude: true,
            link: function(scope, element, attrs) {
                var toolSpaceElement;
                setTimeout(function() {
                    toolSpaceElement = element.find('#toolSpace');
                });
                function applyViewportStyle()  {
                    if (toolSpaceElement !== undefined) {
                        toolSpaceElement.css(workspaceNavService.getNavStyle());
                    }
                }
                workspaceNavService.registerUpdateCallback(applyViewportStyle, 'canvas');

                scope.pinch = function (event) {
                    if(isEventOnActiveTool(event) === false) {
                        workspaceNavService.pinch(event.gesture.center.pageX, event.gesture.center.pageY, event.gesture.scale);
                    }
                    return false;
                };

                //determine whether an event was initiated on the active tool
                function isEventOnActiveTool(event) {
                    var activeToolTarget = $(event.target).closest('.mt-active-tool-instance');
                    return activeToolTarget.length !== 0;
                }

                workspaceNavService.setViewPort($('#toolViewPort'));
                scope.nav = workspaceNavService;

                //update on init and change of route state
                scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    //restore all query string parameters back to $location.search
                    workspaceNavService.update();
                });
                // //once everything is done - apply the nav styles
                setTimeout(function () {
                    workspaceNavService.update();
                });

                //selection
                function applySelections() {
                    workspaceSelectionService.deselectAll();
                    for (var i in scope.tools) {
                        var toolId = scope.tools[i].toolId;
                        var elem = $('#' + toolId);

                        if (overlapsSelection(elem)) {
                            workspaceSelectionService.select(toolId);
                        }
                    }
                }

                function overlapsSelection(elem) {
                    function getBounds (elem) {
                        var pos = $(elem).position();
                        var width = $(elem).width();
                        var height = $(elem).height();
                        return [ [ pos.left, pos.left + width ], [ pos.top, pos.top + height ] ];
                    }

                    function compareBounds (b1, b2) {
                        var r1, r2;
                        r1 = b1[0] < b2[0] ? b1 : b2;
                        r2 = b1[0] < b2[0] ? b2 : b1;
                        return r1[1] > r2[0] || r1[0] === r2[0];
                    }

                    var toolBounds = getBounds(elem),
                        topOffset =  $(element).offset().top;

                    var selectorBounds = [
                        [Math.min(selectorPos[0], selectorPos[0] + selectorSize[0]), Math.max(selectorPos[0] + selectorSize[0], selectorPos[0])],
                        [Math.min(selectorPos[1], selectorPos[1] + selectorSize[1]) - topOffset, Math.max(selectorPos[1] + selectorSize[1], selectorPos[1]) - topOffset]
                    ];

                    return compareBounds(selectorBounds[0], toolBounds[0]) && compareBounds(selectorBounds[1], toolBounds[1]);
                }

                var selectorPos;
                var selectorSize;

                function styleSelector() {
                    var style = {};
                    if(selectorPos === undefined || selectorSize === undefined) {
                        style.display = 'none';
                    } else {
                        style.display = 'block';
                        style.left = Math.min(selectorPos[0], selectorPos[0]+selectorSize[0]);
                        style.top = Math.min(selectorPos[1], selectorPos[1]+selectorSize[1]) - $(element).offset().top;
                        style.width = Math.abs(selectorSize[0]);
                        style.height = Math.abs(selectorSize[1]);
                    }
                    $('.selector').css(style);
                }

                scope.drag = function (event) {
                    var pageX = event.gesture.center.pageX,
                        pageY = event.gesture.center.pageY;

                    if (workspaceSelectionService.isSelectorActive()) {
                        if (selectorPos === undefined) {
                            selectorPos = [pageX, pageY];
                            selectorSize = [0,0];
                        } else {
                            selectorSize[0] = pageX - selectorPos[0];
                            selectorSize[1] = pageY - selectorPos[1];
                            applySelections();
                        }

                        styleSelector();
                    } else if (isEventOnActiveTool(event) === false) {
                        workspaceNavService.drag(pageX, pageY);
                    }

                    return false;
                };

                scope.release = function (event) {
                    if (workspaceSelectionService.isSelectorActive()) {
                        selectorPos = undefined;
                        selectorSize = undefined;
                        $('.selector').hide();
                    } else if (isEventOnActiveTool(event) === false) {
                        workspaceNavService.release();
                    }
                };

                scope.tap = function(event) {
                    if (isEventOnActiveTool(event) === false) {
                        scope.killFocus();
                    }
                };
            }
        };
    });
})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mtWorkspace').directive('mtDdToolbar', function (roleService, toolRegistryService, preconfiguredToolService) {
        return {
            restrict: 'E',
            templateUrl: 'templates/mtDdToolbarTemplate.html',
            replace: true,
            scope: {},
            link: function(scope, element, attrs) {

                scope.activeSubSections = [];

                scope.addTool = function (type) {
                    preconfiguredToolService.addTool(type, mt.common.DEFAULT_SPACE_ID);
                };

                //helper function for creating tool creation button data structure
                function createButton(icon, name, type) {
                    return {
                        icon: icon,
                        name: name,
                        btnName: type + '-btn',
                        callback: angular.bind(scope, scope.addTool, type)
                    };
                }

                scope.toolItems = [];
                function resetMenu() {
                    scope.toolItems = [];

                    _(toolRegistryService.getTemplates()).chain()
                        .filter(function (template) {
                            return true === template.available || (mt.common.TOOL_ACCESS_RESTRICTED === template.available && roleService.hasAccessToAllTools());
                        })
                        .each(function (template) {
                            scope.toolItems.push(createButton(template.id, template.displayName, template.type));
                        });
                }

                scope.$watch(function () {
                    return toolRegistryService.getTemplates();
                }, function () {
                    resetMenu(); // allows tools to be disabled dynamically
                }, true);

            }
        };
    });
})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mtWorkspace').directive('mtFloatingToolContainer', function (
            popupMenuService,
            workspaceSelectionService,
            containerApiFactory,
            toolMenuService,
            configService,
            toolRegistryService,
            undoService,
            $timeout
        ) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                toolTemplate: '=',
                workspaceApi: '='
            },
            templateUrl: 'templates/mtFloatingToolContainerTemplate.html',
            controller: 'mtToolContainerController',
            link: {
                pre: function preLink(scope, element, attrs) {
                    scope.showClose = configService.closeButtonInTitleBar;
                    scope.localPaletteItems = [];

                    scope.containerApi = containerApiFactory.createApi(scope.toolTemplate.toolId, scope.workspaceApi.spaceId, {isHidden: scope.toolTemplate.isHidden});
                    scope.containerApi.name.value = toolRegistryService.getNextName(scope.toolTemplate.type);
                    scope.workspaceApi.containers.push(scope.containerApi);

                    scope.hasPalette = (
                        scope.toolTemplate.type === mt.common.TYPE_DAISY_CHAIN ||
                        scope.toolTemplate.type === mt.common.TYPE_RESULTS_TABLE ||
                        scope.toolTemplate.type === mt.common.TYPE_POLL ||
                        scope.toolTemplate.type === mt.common.TYPE_CONTINGENCY_TABLE ||
                        scope.toolTemplate.type === mt.common.TYPE_GRAPH ||
                        // scope.toolTemplate.type === mt.common.TYPE_PROBABILITY_TOOL ||
                        scope.toolTemplate.type === mt.common.TYPE_DATA_SAMPLER
                    );

                    scope.$on('$destroy', function() {
                        scope.containerApi.close();
                    });

                    scope.tapHeader = function() {
                        //clear out any context
                        toolMenuService.setContext();
                    };
                },
                post: function postLink(scope, element, attrs) {
                    scope.contentElement = $(element);
                    //set the initial constrained tool position
                    scope.toolPos = mt.common.TOOL_INIT_POS;

                    function closeTool(event) {
                        if (event) {
                            event.stopPropagation();
                        }
                        undoService.save();
                        scope.containerApi.close();
                        scope.workspaceApi.removeTool(scope.toolTemplate.toolId);
                    }
                    scope.containerApi.closeTool = closeTool;

                    var popupOpen = false,
                        popupMenuItems = [

                        {
                            text: 'Close',
                            func: function () {
                                scope.$evalAsync(function () {
                                    closeTool();
                                }, 0, true);
                            }
                        }
                    ];

                    if(scope.containerApi.canShowControls) {
                        popupMenuItems.push({
                            text: 'Show Controls',
                            func: function () {
                                scope.containerApi.showControls();
                                popupOpen = false;
                            }
                        });
                    }

                    scope.holdMoveIcon = function (event) {
                        popupOpen = true;
                        popupMenuService.openPopup(popupMenuItems, event);
                    };

                    var dragStartPos;
                    scope.dragToolStart = function (event) {
                        if (popupOpen === true) {
                            popupMenuService.closePopup(true);
                        }

                        scope.bringToFront();
                        dragStartPos = [event.gesture.center.pageX, event.gesture.center.pageY];
                    };

                    //update the style outside of digest for performance
                    scope.applyStyle = function () {
                        element.css(scope.getContainerStyle());
                    };

                    scope.dragTool = function (event) {
                        if(dragStartPos === undefined) {
                            return false;
                        }
                        // don't drag tool if in selection mode
                        if (workspaceSelectionService.isSelectorActive()) {
                            return false;
                        }
                        var pos = [event.gesture.center.pageX, event.gesture.center.pageY];
                        //controller fn
                        scope.moveToolPos([pos[0] - dragStartPos[0], pos[1] - dragStartPos[1]]);
                        dragStartPos = pos;
                        return false;
                    };

                    scope.release = function () {
                        if(dragStartPos !== undefined) {
                            scope.fitToolPos(true);
                            dragStartPos = undefined;
                        }
                    };

                    //need precise control of exactly when the animation class gets applied so using jquery
                    var animateClass = 'mt-tool-container-animation';
                       //animation time in ms, linked to css
                    var animationTime = 300;
                    scope.setToolAnimate = function () {
                        $(element).addClass(animateClass);
                        setTimeout(cancelToolAnimate, animationTime);
                    };
                    function cancelToolAnimate() {
                        $(element).removeClass(animateClass);
                    }

                    scope.getContainerStyle = function () {
                        return {
                            '-webkit-transform': 'translate3d(' + scope.toolPos[0] + 'px, ' + scope.toolPos[1] + 'px, 0px)'
                        };
                    };

                    scope.containerApi.registerSetPos(function(pos) {
                        scope.toolPos = pos;
                        scope.applyStyle();
                    });

                    scope.containerApi.registerGetPos(function() {
                        return scope.toolPos;
                    });

                    function createDefaultRibbon() {
                        if(toolMenuService.getToolMenu(scope.toolTemplate.toolId) === undefined) {
                            var emptyRibbon = {items: {left:[], center: [], right: []}};
                            toolMenuService.setToolMenu(scope.toolTemplate.toolId, emptyRibbon, {containerApi: scope.containerApi});
                        }
                    }
                    scope.applyStyle();

                    scope.stopTap = function(event) {
                        event.stopPropagation();
                        event.gesture.stopPropagation();
                    };

                    $timeout(function() {
                        createDefaultRibbon();
                        //controller initialization function
                        scope.init();
                    });
                }
            }
        };
    });
})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mtWorkspace').directive('mtHelpOverlay', function (mtHelpService) {
        var tethers = {};
        var setupTethers = function() {
            tethers.title = new Tether({
                element: '.mt-help-title',
                target: '.mt-nav-text',
                attachment: 'top center',
                targetAttachment: 'bottom center',
                classPrefix: 'mt-overlay'
            });
            tethers.annotations = new Tether({
                element: '.mt-help-annotations',
                target: '.mt-global-icon-pen',
                attachment: 'top center',
                targetAttachment: 'bottom center',
                classPrefix: 'mt-overlay'
            });
            tethers.tools = new Tether({
                element: '.mt-help-tools',
                target: '.mt-global-icon-tools',
                attachment: 'top center',
                targetAttachment: 'bottom center',
                classPrefix: 'mt-overlay'
            });
            tethers.settings = new Tether({
                element: '.mt-help-settings',
                target: '.mt-global-icon-settings',
                attachment: 'top center',
                targetAttachment: 'bottom center',
                classPrefix: 'mt-overlay'
            });
            tethers.nav = new Tether({
                element: '.mt-help-nav',
                target: '.mt-page-indicator',
                attachment: 'bottom middle',
                targetAttachment: 'top middle',
                classPrefix: 'mt-overlay'
            });
        };

        return {
            scope: {},
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/mtHelpOverlayTemplate.html',
            link: function (scope) {
                scope.showHelp = mtHelpService.isActive();
                setTimeout(setupTethers, 1);
                scope.$watch(
                        function () {
                            return mtHelpService.isActive();
                        },
                        function (
                                newVal,
                                oldVal
                        ) {
                            if (angular.isDefined(newVal)) {
                                scope.showHelp = newVal;
                                setTimeout(setupTethers, 1);
                            }
                        }
                );
                scope.hideHelp = function () {
                    mtHelpService.setActive(false);
                };

            }
        };
    });
})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mtWorkspace').directive('mtInlineToolContainer', function ($timeout, eventingService, roleService, toolRegistryService, modalAlertService, containerApiFactory) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                type: '=',
                toolId: '=?',
                workspaceApi: '=?'
            },
            templateUrl: 'templates/mtInlineToolContainerTemplate.html',
            link: {
                pre: function preLink(scope, element, attrs) {
                    if(scope.workspaceApi === undefined) {
                        scope.workspaceApi = {
                            spaceId: mt.common.DEFAULT_SPACE_ID,
                            containers: []
                        };
                    }

                    if(scope.toolId === undefined) {
                        scope.toolId = mt.common.createGuid();
                    }


                    var disabledCallbacks = ['exportData', 'broadcast', 'duplicate', 'clear', 'link', 'toggleLockMode'];

                    scope.containerApi = containerApiFactory.createApi(scope.toolId, scope.workspaceApi.spaceId, {}, disabledCallbacks);
                    scope.containerApi.isActive = true;
                    scope.workspaceApi.containers.push(scope.containerApi);

                    scope.$on('$destroy', function() {
                        scope.containerApi.close();
                    });
                }
            }
        };
    });
})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mtWorkspace').directive('mtNavIndicator', function (workspaceNavService, workspacePageService) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                bounds: '=',
                pageIndex: '='
            },
            templateUrl: 'templates/mtNavIndicatorTemplate.html',
            link: function(scope, element, attrs) {
                scope.isActivePage = function() {
                    return workspacePageService.getActivePageIndex() === scope.pageIndex;
                };

                scope.activeBounds = [];
                scope.getBounds = function() {
                    if(scope.isActivePage()) {
                        return scope.activeBounds;
                    } else {
                        return scope.bounds;
                    }
                };

                scope.innerStyle = {};
                function updateInnerNavWindowStyle() {
                    var wsBounds = workspaceNavService.getFractionalBounds();
                    //not sure why borders are overlapping - subtracting 1% for now which looks better
                    var widthPercent = (wsBounds[1][0] - wsBounds[0][0])*100;
                    var heightPercent = (wsBounds[1][1] - wsBounds[0][1])*100;
                    var left = wsBounds[0][0]*100;
                    var top = wsBounds[0][1]*100;

                    //set property to be used with ng-style for the inner div
                    scope.innerStyle = {
                        left: left + '%',
                        top: top + '%',
                        width: widthPercent + '%',
                        height: heightPercent + '%'
                    };
                }

                function update() {
                    setTimeout(function() {
                        updateInnerNavWindowStyle();
                        scope.activeBounds = workspaceNavService.getMappedToolBounds(true);
                        scope.$digest();
                    });
                }

                //put this in a watch and register against singleton id
                scope.$watch('isActivePage()', function(val) {
                    if(val === true) {
                        workspaceNavService.registerUpdateCallback(update, 'workspaceNav');
                        update();
                    }
                });
            }
        };
    });
})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mtWorkspace').directive('mtNavPosition', function (workspaceNavService) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {

                var X = 0,
                    Y = 1;

                $(element).hide();

                function move(pos) {
                    $(element).css({display: 'visible', position: 'absolute', top: pos[Y], left: pos[X]});
                }

                var position = attrs.mtNavPosition,
                    height = $(element).height(),
                    width = $(element).width(),
                    canvasCenter = workspaceNavService.getCanvasCenter(),
                    center = [canvasCenter[X] - (width / 2), canvasCenter[Y] - (height / 2)],
                    min = [0, 0],
                    max = [canvasCenter[X] * 2 - width, canvasCenter[Y] * 2 - height];

                switch (position) {
                case 'N':
                    move([center[X], min[Y]]);
                    break;
                case 'NE':
                    move([max[X], min[Y]]);
                    break;
                case 'E':
                    move([max[X], center[Y]]);
                    break;
                case 'SE':
                    move([max[X], max[Y]]);
                    break;
                case 'S':
                    move([center[X], max[Y]]);
                    break;
                case 'SW':
                    move([min[X], max[Y]]);
                    break;
                case 'W':
                    move([min[X], center[Y]]);
                    break;
                case 'NW':
                    move([min[X], min[Y]]);
                    break;
                case 'C':
                    move([center[X], center[Y]]);
                    break;
                default:
                    console.log('do nothing');
                    break;
                }

                $(element).show();

            }
        };
    });
})(window.mt.workspace);
(function (ns) {
    'use strict';

    angular.module('mtWorkspace').directive('mtNavigator', function (workspaceNavService) {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template: '<div class="mt-navigator" hm-tap="tap()"><div ng-transclude></div></div>',
            scope: {
                to: '@'
            },
            link: function (scope, element, attrs) {

                var X = 0,
                    Y = 1;

                var center = workspaceNavService.getCanvasCenter();
                var min = [0, 0];
                var max = [center[X] * 2, center[Y] * 2];

                scope.tap = function () {
                    switch (scope.to) {
                    case 'N':
                        workspaceNavService.moveViewport([center[X], min[Y]]);
                        break;
                    case 'NE':
                        workspaceNavService.moveViewport([max[X], min[Y]]);
                        break;
                    case 'E':
                        workspaceNavService.moveViewport([max[X], center[Y]]);
                        break;
                    case 'SE':
                        workspaceNavService.moveViewport([max[X], max[Y]]);
                        break;
                    case 'S':
                        workspaceNavService.moveViewport([center[X], max[Y]]);
                        break;
                    case 'SW':
                        workspaceNavService.moveViewport([min[X], max[Y]]);
                        break;
                    case 'W':
                        workspaceNavService.moveViewport([min[X], center[Y]]);
                        break;
                    case 'NW':
                        workspaceNavService.moveViewport([min[X], min[Y]]);
                        break;
                    case 'C':
                        workspaceNavService.moveViewport([center[X], center[Y]]);
                        break;
                    default:
                        console.log('do nothing');
                        break;
                    }
                };
            }
        };
    });
})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mtWorkspace').directive('mtPageIndicator', function (workspacePageService) {
        return {
            restrict: 'E',
            replace: true,
            scope: {},
            templateUrl: 'templates/mtPageIndicatorTemplate.html',
            link: function(scope, element, attrs) {
                function stopPropagation(event) {
                    if(event !== undefined) {
                        event.stopPropagation();
                    }
                }

                scope.getPages = function() {
                    return workspacePageService.getPages();
                };

                scope.getNumPages = function() {
                    return scope.getPages().length;
                };

                scope.isActivePage = function(index) {
                    return workspacePageService.getActivePageIndex() === index;
                };

                scope.setActivePage = function(index, event) {
                    stopPropagation(event);
                    if(workspacePageService.getActivePageIndex() !== index) {
                        workspacePageService.setActivePage(index, true);
                    }
                };

                scope.addPage = function(event) {
                    stopPropagation(event);
                    workspacePageService.addPage();
                };

                scope.getActivePageIndex = function() {
                    return workspacePageService.getActivePageIndex()+1;
                };

                //pixel width of each page
                var pageWidth = 122;
                scope.isPageViewOn = function() {
                    return workspacePageService.showPages();
                };

                scope.togglePageView = function(event) {
                    stopPropagation(event);
                    workspacePageService.toggleShowPages();
                };

                //viewport for pages - changes width and offset
                scope.getViewportStyle = function() {
                    var width = scope.isPageViewOn()? pageWidth*scope.getNumPages(): pageWidth;
                    return {
                        width:width+'px'
                    };
                };

                scope.getContainerStyle = function() {
                    var left = scope.isPageViewOn()? 0: pageWidth*workspacePageService.getActivePageIndex()*-1;
                    var width = pageWidth*scope.getNumPages();
                    return {
                        width:width+'px',
                        left:left+'px'
                    };
                };

                //prevent the pinch gestures (used for scroll) from propagating
                scope.stopPinch = function (event) {
                    stopPropagation(event);
                };
            }
        };
    });
})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mtWorkspace').directive('mtPenSurface', function (workspaceNavService, persistorService, annotationService) {
        return {
            restrict: 'E',
            replace: true,
            scope: {},
            controller: 'PenSurfaceCtrl',
            template: '<div class="mt-pen-surface" ng-class="{\'mt-pen-surface-inactive\': isInactive()}" hm-tap="tap($event)" hm-dragstart="dragStart($event)" hm-drag="drag($event)" hm-dragend="dragEnd($event)">' +
                            '<svg class="mt-pen-surface-svg" width="100%" height="100%"></svg>' +
                        '</div>',
            link: function(scope, element, attrs) {
                scope.tap = function (event) {
                    if(scope.isInactive()) {
                        return false;
                    }
                    var pos = getPos(event);

                    if(annotationService.getMode() === annotationService.PEN_MODE) {
                        scope.createActiveLine(pos, true);
                        scope.finishLine();
                    } else if(annotationService.getMode() === annotationService.ERASER_MODE) {
                        scope.erasePoints(pos);
                    }

                    scope.render();
                };

                scope.dragStart = function (event) {
                    if(event.stopPropagation !== undefined) {
                        event.stopPropagation();
                    }

                    if(annotationService.getMode() === annotationService.PEN_MODE) {
                        scope.createActiveLine(getPos(event));
                    }


                };

                scope.drag = function (event) {
                    if(event.stopPropagation !== undefined) {
                        event.stopPropagation();
                    }

                    var pos = getPos(event);

                    if(annotationService.getMode() === annotationService.PEN_MODE) {
                        scope.addPointToActiveLine(pos);
                    } else if(annotationService.getMode() === annotationService.ERASER_MODE) {
                        scope.erasePoints(pos);
                    }

                    throttledRender();

                    return false;
                };

                scope.dragEnd = function(event) {
                    if(event.stopPropagation !== undefined) {
                        event.stopPropagation();
                    }

                    scope.render();

                    if(annotationService.getMode() === annotationService.PEN_MODE) {
                        scope.finishLine();
                    }

                    return false;
                };

                //map event position to a toopspace position
                function getPos(event) {
                    var offset = element.offset();
                    var scale = workspaceNavService.getScale();
                    return [(event.gesture.center.pageX - offset.left)/scale, (event.gesture.center.pageY - offset.top)/scale];
                }

                //RENDERING CODE
                var svg;
                var width;
                var height;
                var debugGroup;
                function init() {
                    width = element.width();
                    height = element.height();
                    svg = d3.select(element.find('svg')[0]);

                    debugGroup = svg.append('svg:g');
                    //scope.render();
                }
                setTimeout(init);

                var groupPrefix = 'pen-group-';

                var lineFunction = d3.svg.line()
                                    .x(function(d) {return d.x;})
                                    .y(function(d) {return d.y;})
                                    .tension(0) // Catmull–Rom - go through every point
                                    .interpolate('basis');


                scope.render = function() {
                    var groups = svg
                        .selectAll('g')
                        .data(scope.penData);

                    groups.enter().append('g')
                        .attr('class', function(d) {return groupPrefix + d.group;});

                    groups.each(function(groupData) {
                        //will this select the paths within a group??
                        var lines = d3.select(this).selectAll('path')
                            .data(groupData.lines);

                        lines.enter().append('path');

                        lines.each(function(lineData) {
                            //will this select the line within the group
                            d3.select(this)
                                .attr('d', lineFunction(lineData.points))
                                .attr('stroke-width', function(d) {return d.width;})
                                .attr('stroke', function(d) {return d.color;})
                                .attr('fill', 'none')
                                .attr('stroke-linecap', 'round');
                        });
                        lines.exit().remove();
                    });
                    groups.exit().remove();

                    //debugRender();
                };

                //uncomment to render sample points
                // function debugRender() {
                //     var lines = scope.getWorkspaceLines();
                //     var points = [];
                //     _.each(lines, function(line){
                //         points = points.concat(line.points);
                //     });
                //     //flatter workspaceLines
                //     var className = 'debugPoints';

                //     var elements = debugGroup
                //         .selectAll('.' + className)
                //         .data(points);

                //     elements.enter().append('svg:circle').attr('class', className);

                //     elements.attr('cy', function (d) { return d.y; })
                //         .attr('cx', function (d) { return d.x; })
                //         .attr('r', 5)
                //         .attr('fill', 'steelblue')
                //         .attr('stroke', 'black');

                //     elements.exit().remove();
                // }

                var throttledRender = _.throttle(scope.render, 30);

                persistorService.register('penSurfaceSingleton', mt.common.GLOBAL_TOOL_CATEGORY, mt.common.DEFAULT_SPACE_ID, function() {
                    //serialize
                    var event = {};
                    event.data = scope.penData;
                    return event;

                }, function(event) {
                    //deserialize
                    scope.penData = event.data;

                    setTimeout(function() {
                        scope.render(true);
                    });

                });
            }
        };
    });
})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mtWorkspace').directive('mtSingleToolWorkspace', function ($compile, $timeout, eventingService, postMessageService, localStorageService, sessionService, preconfiguredToolService) {
        var toolHtmlTemplate = '<mt-inline-tool-container type="toolType" tool-id="toolId"></mt-inline-tool-container>';
        return {
            restrict: 'E',
            template: '<div></div>',
            link: function(scope, element) {
                var container;

                scope.createTool = function (type, id) {
                    scope.toolType = type;
                    scope.toolId = id;

                    element.empty();
                    var el = $compile(toolHtmlTemplate)(scope);
                    element.append(el);

                    $timeout(function () {
                        container = $(element).find('.mt-workspace-component');
                    });

                    //clean up the old tool
                    if(prevId !== undefined) {
                        eventingService.removeSubscriber(prevId);
                    }
                    //cache the previous id so we can remove it from eventing
                    prevId = scope.toolId;
                };

                var prevId;

                //register with eventing system for EVENT_CREATE_TOOL
                eventingService.subscribe(mt.common.DEFAULT_SPACE_ID, mt.common.EVENT_CREATE_TOOL, function(event) {
                    scope.createTool(event.type, event.toolId);
                });

                scope.getSize = function() {
                    if(container !== undefined) {
                        return [container.width(), container.height()];
                    }
                };

                scope.$watch('getSize()', function(newSize) {
                    if(newSize !== undefined) {
                        postMessageService.sendSizeNotification(newSize);
                    }
                }, true);
            }
        };
    });
})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mtWorkspace').directive('mtToolPaletteItem', function ($compile) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                item: '='
            },
            template: '<div class="mt-palette-button" ng-show="isShown()"><mt-button config="item"></mt-button></div>',
            link: function(scope, element, attrs) {
                scope.isTemplated = scope.item.html === undefined;

                if(scope.isTemplated === false) {
                    element.html(scope.item.html).show();
                    $compile(element.contents())(scope.item.targetScope);
                }

                scope.isShown = function () {
                    return scope.isTemplated === false || scope.item.showFn === undefined || scope.item.showFn() === true;
                };
            }
        };
    });
})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mtWorkspace').directive('mtToolPalette', function () {
        return {
            restrict: 'E',
            replace: true,
            controller: 'ToolPaletteCtrl',
            templateUrl: 'templates/mtToolPaletteTemplate.html',
            scope: {
                containerApi: '='
            },
            link: function(scope, element, attrs) {
                $(element).find('.mt-palette').draggable({
                    handle: '.mt-palette-handle',
                    axis: 'x',
                    containment: 'parent'
                });
            }
        };
    });
})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mtWorkspace').directive('mtWorkspaceNavbar', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/mtWorkspaceNavbarTemplate.html',
            controller: 'WorkspaceNavbarCtrl',
            link: function(scope, element, attrs) {

            }
        };
    });
})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mtWorkspace').directive('mtWorkspace', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/mtWorkspaceTemplate.html',
            controller: 'WorkspaceCtrl'
        };
    });
})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mtWorkspace').factory('mtHelpService', function (configService) {
        var active = true;
        return {
            isActive: function() {
                return !configService.disableOverlays && active;
            },
            setActive: function(isActive) {
                active = isActive;
            }
        };
    });
})(window.mt.workspace);

angular.module('mtWorkspace').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/mtCanvasTemplate.html',
    "<div id=toolViewPort class=mt-tool-view-port hm-drag=drag($event) hm-pinch=pinch($event) hm-release=release($event) hm-tap=tap($event)><mt-page-indicator></mt-page-indicator><mt-abstract-panel></mt-abstract-panel><div class=selector></div><div id=toolSpace class=\"mt-no-select mt-zoomable-tool-space\"><mt-pen-surface></mt-pen-surface><div ng-repeat=\"tool in tools\"><mt-floating-tool-container workspace-api=workspaceApi tool-template=tool></mt-floating-tool-container></div><div ng-transclude></div></div><div ng-if=isSubmissionActive() class=mt-submission-viewport><div class=mt-submission-viewport-text>Viewing submission<div><div></div></div></div></div></div>"
  );


  $templateCache.put('templates/mtDdToolbarTemplate.html',
    "<div id=toolbar class=mt-dd-toolbar><div ng-repeat=\"item in toolItems\"><div class=\"mt-tool-dd-item mt-dd-item\" ng-class=item.btnName hm-tap=item.callback() ng-bind=item.name></div></div></div>"
  );


  $templateCache.put('templates/mtFloatingToolContainerTemplate.html',
    "<div class=\"mt-floating-tool-container mt-workspace-component\" id={{toolTemplate.toolId}} ng-class=\"{'mt-active-tool-instance': isActive()}\" ng-hide=containerApi.isHidden hm-tap=stopTap($event)><div class=mt-component-disabler hm-tap=onMinTouch($event) ng-show=isInactive()></div><mt-tool-palette container-api=containerApi ng-if=hasPalette></mt-tool-palette><div class=mt-floating-tool-container-move ng-class=\"{'mt-floating-tool-container-move-inactive': !isActive()}\" hm-dragstart=dragToolStart($event) hm-tap=tapHeader() hm-drag=dragTool($event) hm-release=release() hm-hold=holdMoveIcon($event)><div class=mt-close-tool ng-if=\"isActive() && showClose\" hm-tap=containerApi.closeTool($event)></div><div class=mt-tool-name>{{containerApi.name.value}}</div></div><div class=mt-floating-tool-wrapper><mt-external-tool tool-id=toolTemplate.toolId id=tool-{{toolTemplate.toolId}} container-api=containerApi type=toolTemplate.type></mt-external-tool></div></div>"
  );


  $templateCache.put('templates/mtHelpOverlayTemplate.html',
    "<div class=mt-help-overlay ng-show=showHelp ng-click=hideHelp()><div ng-show=showHelp class=\"mt-help-item mt-help-title\"><div class=mt-help-itemtext style=\"top: 100px; left: 10px\">Lesson Title</div><svg width=2 height=100 viewport=\"0 0 2 100\" version=1.1 xmlns=http://www.w3.org/2000/svg><line x1=0 y1=0 x2=0 y2=100 stroke=white stroke-width=\"2\"></svg></div><div ng-show=showHelp class=\"mt-help-item mt-help-annotations\"><div class=mt-help-itemtext style=\"top: 140px; left: 10px\">Annotation Tools</div><svg width=2 height=140 viewport=\"0 0 2 140\" version=1.1 xmlns=http://www.w3.org/2000/svg><line x1=0 y1=0 x2=0 y2=140 stroke=white stroke-width=\"2\"></svg></div><div ng-show=showHelp class=\"mt-help-item mt-help-tools\"><div class=mt-help-itemtext style=\"top: 100px; right: 10px\">Math Tools Menu</div><svg width=2 height=100 viewport=\"0 0 2 100\" version=1.1 xmlns=http://www.w3.org/2000/svg><line x1=0 y1=0 x2=0 y2=100 stroke=white stroke-width=\"2\"></svg></div><div ng-show=showHelp class=\"mt-help-item mt-help-settings\"><div class=mt-help-itemtext style=\"top: 100px; right: 10px\">Settings</div><svg width=2 height=100 viewport=\"0 0 2 100\" version=1.1 xmlns=http://www.w3.org/2000/svg><line x1=0 y1=0 x2=0 y2=100 stroke=white stroke-width=\"2\"></svg></div><div ng-show=showHelp class=\"mt-help-item mt-help-nav\"><div class=mt-help-itemtext style=\"top: 0; right: 10px\">Navigator Panel</div><svg width=2 height=100 viewport=\"0 0 2 100\" version=1.1 xmlns=http://www.w3.org/2000/svg><line x1=0 y1=0 x2=0 y2=100 stroke=white stroke-width=\"2\"></svg></div></div>"
  );


  $templateCache.put('templates/mtInlineToolContainerTemplate.html',
    "<div class=\"mt-workspace-component mt-inline\" id={{toolId}} ng-hide=isHidden><mt-external-tool tool-id=toolId id=tool-{{toolId}} container-api=containerApi type=type></mt-external-tool></div>"
  );


  $templateCache.put('templates/mtNavIndicatorTemplate.html',
    "<div class=mt-nav-indicator><div class=mt-nav-indicator-inner ng-show=isActivePage() ng-style=innerStyle></div><div ng-repeat=\"tool in getBounds()\" class=mt-nav-indicator-tool ng-class=\"{'mt-active-tool': tool.isActive}\" style=\"left: {{tool.leftPercentage}}%; top: {{tool.topPercentage}}%; width: {{tool.widthPercentage}}%; height: {{tool.heightPercentage}}%\"></div></div>"
  );


  $templateCache.put('templates/mtPageIndicatorTemplate.html',
    "<div class=mt-page-indicator ng-class=\"{'mt-page-view-on': isPageViewOn()}\" hm-pinch=stopPinch($event)><div class=mt-page-view-toggle hm-tap=togglePageView($event)><svg width=20px height=100% viewbox=\"0 0 20 19\" xmlns=http://www.w3.org/2000/svg><path ng-show=!isPageViewOn() fill=#66B0EF d=\"M13,15.998c-0.242,0-0.484-0.087-0.676-0.263l-6-5.5C6.117,10.046,6,9.778,6,9.498S6.117,8.95,6.324,8.761 l6-5.5c0.408-0.374,1.041-0.345,1.413,0.062c0.373,0.407,0.346,1.039-0.062,1.413L8.48,9.498l5.195,4.763 c0.407,0.374,0.435,1.006,0.062,1.413C13.54,15.889,13.27,15.998,13,15.998z\"></path><path ng-show=isPageViewOn() fill=#66B0EF d=\"M7,3c0.242,0,0.484,0.087,0.676,0.263l6,5.5C13.883,8.952,14,9.22,14,9.5s-0.117,0.548-0.324,0.737l-6,5.5 c-0.408,0.374-1.041,0.345-1.413-0.062c-0.373-0.407-0.346-1.039,0.062-1.413L11.52,9.5L6.324,4.737 C5.917,4.363,5.89,3.731,6.263,3.324C6.46,3.109,6.73,3,7,3z\"></path></svg></div><div class=mt-page-view-port ng-style=getViewportStyle()><div class=mt-page-container ng-style=getContainerStyle()><div ng-repeat=\"page in getPages() track by $index\" class=mt-page-indicator-page ng-class=\"{'mt-active-page': isActivePage($index)}\" hm-tap=\"setActivePage($index, $event)\"><mt-nav-indicator page-index=$index bounds=page.toolBounds></mt-nav-indicator></div></div></div><div class=mt-add-page-btn><div class=mt-page-num>{{getActivePageIndex()}}</div><div class=mt-page-num-of>of {{getNumPages()}}</div><div class=mt-add-icon><svg hm-tap=addPage($event) xmlns=http://www.w3.org/2000/svg width=40px height=30px viewbox=\"0 0 40 30\"><rect class=mt-add-page-container-rect stroke=#A1B9B5 fill=none width=40px height=30px></rect><path class=mt-add-page-icon-path fill=#66B0EF d=\"M27,14h-6V8c0-0.553-0.447-1-1-1s-1,0.447-1,1v6h-6c-0.553,0-1,0.447-1,1s0.447,1,1,1h6v6 c0,0.553,0.447,1,1,1s1-0.447,1-1v-6h6c0.553,0,1-0.447,1-1S27.553,14,27,14z\"></path></svg></div></div></div>"
  );


  $templateCache.put('templates/mtToolPaletteItemTemplate.html',
    "<div class=mt-palette-button ng-show=isShown()><mt-button config=item></mt-button></div>"
  );


  $templateCache.put('templates/mtToolPaletteTemplate.html',
    "<div class=mt-palette-holder ng-show=showToolPalette()><div class=mt-palette><div class=\"mt-palette-button mt-palette-handle\" ng-hide=containerApi.isInline><b class=\"mt-icon mt-icon-handle\"></b></div><mt-tool-palette-item ng-repeat=\"item in localPaletteItems\" item=item></mt-tool-palette-item><mt-tool-palette-item ng-repeat=\"item in globalPaletteItems\" item=item></mt-tool-palette-item><mt-input model=containerApi.name class=\"mt-tool-name mt-palette-input\" placeholder=Name></mt-input></div></div>"
  );


  $templateCache.put('templates/mtWorkspaceNavbarTemplate.html',
    "<div id=workspaceNav class=\"navbar navbar-inverse mt-workspace-nav\"><div class=navbar-inner><div><a class=\"btn btn-navbar\" data-toggle=collapse data-target=.navbar-responsive-collapse><span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></a> <a id=workspaceHeader class=\"brand mt-workspace-title\" ng-href={{originalUrl}}>{{workspaceHeader}}</a><div class=\"nav-collapse collapse navbar-responsive-collapse mt-no-select\"><ul class=nav><mt-workspace-content-menu></mt-workspace-content-menu><button class=\"mt-temp-ui mt-show-controls btn mt-clear-btn mt-no-select\" ng-click=clear()>Clear</button><div class=\"mt-temp-ui mt-show-controls btn-group mt-no-select\" data-toggle=buttons-radio ng-show=isTeacher()><button type=button class=\"btn active btn-inverse mt-no-select\" ng-click=toggleOfflineMode(false)>Online</button> <button type=button class=\"btn btn-inverse mt-no-select\" ng-click=toggleOfflineMode(true)>Offline</button></div></ul><mt-global-menu class=\"nav pull-right\" container-type=workspace></mt-global-menu><ul class=\"nav pull-right\"><li class=\"brand mt-workspace-name\">{{currentWorkspaceName}}</li><li><div class=\"mt-navbar-icon mt-broadcast-workspace\" ng-click=broadcastWorkspace() ng-show=isTeacher()></div></li><mt-input-switch></mt-input-switch><li><div class=\"mt-navbar-icon mt-comm-indicator\" ng-class=\"{on: networkConnected}\"></div></li></ul></div></div></div></div>"
  );


  $templateCache.put('templates/mtWorkspaceTemplate.html',
    "<div id=workspace class=mt-no-select><mt-help-overlay show-help=showHelp></mt-help-overlay><mt-global-ribbon-menu></mt-global-ribbon-menu><mt-canvas></mt-canvas><hand-writing-menu class=mt-hand-writing-menu></hand-writing-menu></div>"
  );


  $templateCache.put('templates/workspacePartial.html',
    "<mt-workspace space-id=workspace></mt-workspace>"
  );

}]);
