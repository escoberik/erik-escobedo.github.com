

window.mt.numberline = {};

angular.module('mtNumberLine', ['mt.common', 'ui.bootstrap']);

(function () {
    'use strict';

    if (!window.mt) {
        window.mt = {};
    }

    if (!window.mt.numberline) {
        window.mt.numberline = {};
    }

    angular.module('mtNumberLine', ['mt.common', 'ui.bootstrap'])

        .config(function (toolRegistryServiceProvider) {
            var template = {
                id: 'numberLineToolbarItem',
                type: mt.common.TYPE_NUMBER_LINE,
                displayName: 'Number Line',
                available: true,
                htmlTemplate: '<mt-number-line-tool tool-id="toolId" container-api="containerApi" id="tool-{{toolId}}"></mt-number-line-tool>'
            };
            toolRegistryServiceProvider.addTemplate(template);
            
            template = {
                id: 'percentBarToolbarItem',
                type: mt.common.TYPE_PERCENT_BAR,
                displayName: 'Percent Bar',
                available: true,
                htmlTemplate: '<mt-percent-bar-tool tool-id="toolId" container-api="containerApi" id="tool-{{toolId}}"></mt-percent-bar-tool>',
                applet: true
            };
            toolRegistryServiceProvider.addTemplate(template);

            template = {
                id: 'numberHuntToolbarItem',
                type: mt.common.TYPE_NUMBER_HUNT,
                displayName: 'Number Hunt',
                available: true,
                htmlTemplate: '<mt-number-hunt-tool tool-id="toolId" container-api="containerApi" id="tool-{{toolId}}"></mt-number-hunt-tool>',
                applet: true
            };
            toolRegistryServiceProvider.addTemplate(template);

            template = {
                id: 'micDropToolbarItem',
                type: mt.common.TYPE_MIC_DROP,
                displayName: 'Mic Drop',
                available: true,
                htmlTemplate: '<mt-mic-drop-tool tool-id="toolId" container-api="containerApi" id="tool-{{toolId}}"></mt-mic-drop-tool>',
                applet: true
            };
            toolRegistryServiceProvider.addTemplate(template);
        });

    window.mt.loadModules.push('mtNumberLine');
})();


(function (ns)
{
    'use strict';

    // CONSTANTS
    ns.DECIMAL_PRECISION = 2;

    // Internally triggered events (not from the DOM)
    ns.I_EVENT_DATA_CHANGED = 'data-changed';

    //the vertical tolerance for selecting an object on the numberline
    ns.POINT_SELECTION_TOLERANCE = 20;

    //constant settings
    ns.DEFAULT_WIDTH = 512;
    ns.DEFAULT_HEIGHT = 200;
    ns.DEFAULT_MARGIN = 40;

    ns.NUMBERHUNT_WIDTH = 700;
    ns.NUMBERHUNT_HEIGHT = 300;

    ns.MICDROP_WIDTH = 730;
    ns.MICDROP_HEIGHT = 1022;

    ns.DEFAULT_Y_BASE = Math.round(ns.DEFAULTS_HEIGHT / 2);

    ns.TICK_MARK_SIZE = 20;
    ns.POINT_LINE_COLOR = 'black';
    ns.POINT_FILL_COLOR = 'steelblue';
    ns.POINT_STROKE_WIDTH = 1;
    ns.LINE_WIDTH = 2;
    ns.POINT_RADIUS = 5;
    ns.SELECTED_POINT_RADIUS = 10;
    ns.END_RADIUS = 8;

    ns.DEFAULT_PARTITION_RANGE_END = 5.0;
    ns.DEFAULT_PARTITION_RANGE_START = -5.0;
    ns.DEFAULT_NUM_PARTITIONS = 5;

    ns.TOUCH_SIZE = 40;
    ns.PINCH_SCALE_FACTOR = 1;
    ns.MAX_SCALE_FACTOR = 1.1;
    ns.MIN_SCALE_FACTOR = 0.9;
    ns.SCALE_TOLERANCE = 0.03;

    ns.DEFAULT_MAX = 4;
    ns.DEFAULT_MIN = -4;
    ns.DEFAULT_TICK = 1;

    ns.ARROW_LENGTH = 5;

    ns.ADD_POINT_MODE = 'addPointMode';

    ns.DEFAULT_PARTITION_FRACTION = 0.2;

    //numberhunt
    ns.ZOOM_IN_MODE = 'zoomInMode';
    ns.ZOOM_OUT_MODE = 'zoomOutMode';

    //percentbar
    ns.PERCENT_BAR_DUPLICATE = 'percentBarDuplicate';
    ns.PERCENT_BAR_ZOOM = 'percentBarZoom';

    //drop the mic
    ns.MIC_DROP_RANGE_LOW                        = -7;
    ns.MIC_DROP_RANGE_HIGH                       = 4;
    ns.MIC_DROP_TICK_INTERVAL                    = 1;
    ns.MIC_DROP_SHOW_DOUBLE                      = false;

})(window.mt.numberline);

(function (ns) {
    'use strict';

    ns.Drone = (function () {

        //constructor function

        function Drone(spec) {
            if (!(this instanceof Drone)) {
                return new Drone(spec);
            }
            spec = spec || {};
            this.startX = getSpec(spec.startX, 0);
            this.x = getSpec(spec.x, 0);
            this.y = getSpec(spec.y, 0);
            this.speed = getSpec(spec.speed, 1);
            this.height = getSpec(spec.height, 5);
        }

        function getSpec(val, defaultVal) {
            return (val !== undefined) ? val : defaultVal;
        }

        Drone.prototype.serialize = function() {
            var data = {
                startX : this.startX,
                x : this.x,
                y : this.y,
                speed : this.speed,
                height : this.height
            };
            return data;
        };

        Drone.prototype.deserialize = function(data) {
            this.startX = data.startX;
            this.x = data.x;
            this.y = data.y;
            this.speed = data.speed;
            this.height = data.height;
        };

        Drone.prototype.setTime = function(delta) {
            var pos = this.getPositionAtTime(delta);
            this.x = pos[0];
            this.y = pos[1];
        };

        Drone.prototype.getPositionAtTime = function(delta) {
            var x = delta * this.speed;
            var y = this.height;
            x += this.startX;
            return [x, y];
        };

        return Drone;
    })();
})(window.mt.numberline);

(function (ns) {
    'use strict';

    ns.Mic = (function () {

        //constructor function

        function Mic(spec) {
            if (!(this instanceof Mic)) {
                return new Mic(spec);
            }
            spec = spec || {};
            this.startX = getSpec(spec.startX, 0);
            this.x = getSpec(spec.x, 0);
            this.y = getSpec(spec.y, 0);
            this.speed = getSpec(spec.speed, 1);
            this.gravity = getSpec(spec.gravity, 2.6);
            this.startHeight = getSpec(spec.startHeight, 5);
            this.groundHeight = getSpec(spec.groundHeight, 0);
            this.dropped = getSpec(spec.dropped, false);
            this.droppedAtTime = getSpec(spec.droppedAtTime, 0);
            this.hitGround = getSpec(spec.hitGround, false);
            this.color = getSpec(spec.color, 'black');
            this.windSpeed = getSpec(spec.windSpeed, 0);
        }

        function getSpec(val, defaultVal) {
            return (val !== undefined) ? val : defaultVal;
        }

        Mic.prototype.serialize = function() {
            var data = {
                startX : this.startX,
                x : this.x,
                y : this.y,
                speed : this.speed,
                gravity : this.gravity,
                startHeight : this.startHeight,
                groundHeight : this.groundHeight,
                dropped : this.dropped,
                droppedAtTime : this.droppedAtTime,
                hitGround : this.hitGround,
                color : this.color
            };
            return data;
        };

        Mic.prototype.deserialize = function(data) {
            this.startX = data.startX;
            this.x = data.x;
            this.y = data.y;
            this.speed = data.speed;
            this.gravity = data.gravity;
            this.startHeight = data.startHeight;
            this.groundHeight = data.groundHeight;
            this.dropped = data.dropped;
            this.droppedAtTime = data.droppedAtTime;
            this.hitGround = data.hitGround;
            this.color = data.color;
        };

        Mic.prototype.dropAt = function(delta) {
            this.dropped = true;
            this.droppedAtTime = delta;
        };

        Mic.prototype.setTime = function(delta) {
            var pos = this.getPositionAtTime(delta);
            this.x = pos[0];
            this.y = pos[1];
            if (this.y <= this.groundHeight) {
                this.y = this.groundHeight;
                this.hitGround = true;
            }
        };

        Mic.prototype.getPositionAtTime = function(delta) {
            var x = delta * this.speed;
            var y = this.startHeight;
            if (this.dropped === true && delta > this.droppedAtTime) {
                var deltaFromDrop = delta - this.droppedAtTime;
                y = this.startHeight - (this.gravity * Math.pow(deltaFromDrop, 2) / 2);
                if (y < this.groundHeight) {
                    y = this.groundHeight;

                    var newDelta = Math.sqrt(((this.startHeight - y) * 2) / this.gravity);
                    x = (newDelta + this.droppedAtTime) * this.speed;
                }
            }
            x += this.startX;
            return [x, y];
        };

        Mic.prototype.getWhereMicHitGround = function() {
            if (this.dropped !== true) {
                return undefined;
            }
            var t = Math.sqrt(2 * (this.startHeight / this.gravity));
            return ((t + this.droppedAtTime) * this.speed) + this.startX;
        };

        return Mic;
    })();
})(window.mt.numberline);

(function(ns){
    
    'use strict';

    ns.MicDropGestureHandler = (function(){
        function MicDropGestureHandler(graphModel, viewConfig, updateCallback, selectionApi){
            // var touchSize = mt.common.TOUCH_SIZE;
            this.graphModel = graphModel;
            this.viewConfig = viewConfig;
            this.update = updateCallback;

            this.pointSetId = undefined;
            this.snappingMode = mt.common.GRAPH_SNAP_MODE;
            //call the base gesture handler
            mt.common.GestureHandler.call(this, graphModel, updateCallback, selectionApi);

            var self = this;


            //register taps

            this.registerTap(function(posX, posY) {
                var height = viewConfig.height * 3 / 4;
                self.pinchAtPos([posX, height], 0.75, [posX, height]);
            }, ns.ZOOM_IN_MODE);
            this.registerTap(function(posX, posY) {
                var height = viewConfig.height * 3 / 4;
                self.pinchAtPos([posX, height], (1 / 0.75), [posX, height]);
            }, ns.ZOOM_OUT_MODE);

            var panCenter;
            //panning
            this.registerDrag(function dragStart(posX) {
                if (graphModel.gameFinished !== true) {
                    return false;
                }
                //only pan when there is no selected object
                panCenter = posX;
                return true;
            }, function drag(posX) {
                if(panCenter === undefined) {
                    return false;
                }
                //use a fixed height to hit the x-axis
                var height = viewConfig.height * 3 / 4;
                var centerVal = viewConfig.transformToGraph(panCenter, height)[0];
                var translationVal = viewConfig.transformToGraph(posX, height)[0];

                graphModel.axes.x.translateRange(centerVal - translationVal);
                graphModel.axes.y.translateRange(centerVal - translationVal);

                updateCallback(true);

                panCenter = posX;
                return true;
            }, function dragEnd() {
                panCenter = undefined;
                return false;
            });


            this.pinchAtPos = function (dragCenter, scale, translationPos) {
                var centerVal = self.viewConfig.transformToGraph(dragCenter[0], dragCenter[1]);
                var translationVal = self.viewConfig.transformToGraph(translationPos[0], translationPos[1]);

                self.graphModel.axes.x.scaleRange(centerVal[0], scale);
                self.graphModel.axes.x.translateRange(centerVal[0] - translationVal[0]);
                self.graphModel.axes.y.scaleRange(centerVal[0], scale);
                self.graphModel.axes.y.translateRange(centerVal[0] - translationVal[0]);

                self.update();
            };

            this.toggleZoomIn = function (val) {
                if(val === false || self.mode === ns.ZOOM_IN_MODE) {
                    self.setMode();
                } else {
                    self.setMode(ns.ZOOM_IN_MODE);
                }
            };

            this.toggleZoomOut = function (val) {
                if(val === false || self.mode === ns.ZOOM_OUT_MODE) {
                    self.setMode();
                } else {
                    self.setMode(ns.ZOOM_OUT_MODE);
                }
            };
        }

        return MicDropGestureHandler;
    }());
})(window.mt.numberline);

(function (ns) {

    'use strict';

    //numberline specfic d3 (svg) renderer
    ns.MicDropRenderer = (function () {
        function MicDropRenderer(containerElement, graphModel, viewConfig, toolId) {
             //call the base renderer
            mt.common.BaseRenderer.call(this, containerElement, viewConfig, toolId);

            //create the groups
            var axisGroup = this.appendGroup();
            var tickLabelGroup = this.appendGroup();
            var axisLabelGroup = this.appendGroup();
            var pointGroup = this.appendGroup();
            this.graphModel = graphModel;

            //main render function
            this.render = function (updateAxes) {
                this.graphModel.resetPercentBarTextCalc();
                if(updateAxes !== false) {
                    viewConfig.update(graphModel.axes.x.min.x.val(), graphModel.axes.x.max.x.val(),
                        graphModel.axes.y.min.y.val(), graphModel.axes.y.max.y.val());
                    this.renderAxis(graphModel.axes.y, false);
                    this.renderArrows();
                }

                if (graphModel.gameFinished === true) {
                    var pointsToRender = [];
                    for (var gp in graphModel.points) {
                        var graphPoint = graphModel.points[gp];
                        if (graphModel.axes.y.min.y.val() <= graphPoint.y.val() && graphPoint.y.val() <= graphModel.axes.y.max.y.val()) {
                            pointsToRender.push(graphPoint);
                        }
                    }

                    this.renderPoints(pointsToRender);

                    this.drawPercentTickLabelsTop(true, pointsToRender, mt.common.MIC_DROP_LABEL, [0, 20], false, false, viewConfig.offset);
                    var newPoints = [];
                    if (graphModel.showValues === true) {
                        for (var p in pointsToRender) {
                            var point = pointsToRender[p];
                            var inList = false;
                            for (var np in newPoints) {
                                var newPoint = newPoints[np];
                                if (newPoint.y.val() === point.y.val()) {
                                    inList = true;
                                    break;
                                }
                            }
                            if (!inList) {
                                newPoints.push(point);
                            }
                        }
                    }
                    this.drawPercentTickLabelsTop(false, newPoints, mt.common.MIC_DROP_LABEL, [0, 20], false, false, viewConfig.offset);

                    this.renderMics([]);
                    this.renderDrone([]);
                } else  {
                    if (graphModel.currentMic !== undefined) {
                        var mics = [];
                        var drone = [];
                        if (graphModel.currentMic.x <= graphModel.axes.y.max.y.val()) {
                            mics.push(graphModel.currentMic);
                            drone.push(graphModel.currentDrone);
                        }
                        this.renderMics(mics);
                        this.renderDrone(drone);
                    }
                }
                if (this.showFPS) {
                    this.renderFPS();
                }
            };

            this.renderFPS = function() {
                var time = {
                    fps: this.calculatedFPS
                };
                this.renderItem(axisGroup, [time], 'calculatedFPS', 'svg:text', function (elements, xPos, yPos) {

                    elements.text(function (d) { return ('fps: ' + parseInt(d.fps,10)); })
                        .attr('x', 20)
                        .attr('y', 20)
                        .attr('fill', 'red');
                });
            };

            // render pointers to offscreen points and/or target
            this.renderArrows = function() {
                var arrows = [];
                if (graphModel.gameFinished === true) {
                    var pointsToLeft = false;
                    var pointsToRight = false;
                    for (var gp in graphModel.points) {
                        var graphPoint = graphModel.points[gp];
                        if (graphPoint.y.val() < graphModel.axes.y.min.y.val()) {
                            pointsToLeft = true;
                        } else if (graphModel.axes.y.max.y.val() < graphPoint.y.val()) {
                            pointsToRight = true;
                        }
                    }
                    // offscreen points
                    if (pointsToLeft === true) {
                        var leftArrow = {
                            img: 'img/micdrop/dtm-target-arrow-left-offscreen.png',
                            x: graphModel.axes.y.min.y.val(),
                            y: 0,
                            clazz: 'pointLeftArrow',
                            xOffset: 0,
                            yOffset: -105
                        };
                        arrows.push(leftArrow);
                    }
                    if (pointsToRight === true) {
                        var rightArrow = {
                            x: graphModel.axes.y.max.y.val(),
                            y: 0,
                            img: 'img/micdrop/dtm-target-arrow-right-offscreen.png',
                            clazz: 'pointRightArrow',
                            xOffset: -125,
                            yOffset: -105
                        };
                        arrows.push(rightArrow);
                    }
                    // offscreen targets
                    if (0 < graphModel.axes.y.min.y.val()) {
                        var leftTargetArrow = {
                            x: graphModel.axes.y.min.y.val(),
                            y: 0,
                            img: 'img/micdrop/dtm-target-arrow-left.png',
                            clazz: 'targetLeftArrow',
                            xOffset: 0,
                            yOffset: -167
                        };
                        arrows.push(leftTargetArrow);
                    } else if (graphModel.axes.y.max.y.val() < 0) {
                        var rightTargetArrow = {
                            x: graphModel.axes.y.max.y.val(),
                            y: 0,
                            img: 'img/micdrop/dtm-target-arrow-right.png',
                            clazz: 'targetRightArrow',
                            xOffset: -125,
                            yOffset: -167
                        };
                        arrows.push(rightTargetArrow);
                    }
                } else {
                    if (graphModel.currentMic !== undefined) {
                        if (graphModel.currentMic.x > graphModel.axes.y.max.y.val()) {
                            var micArrow = {
                                x: graphModel.axes.y.max.y.val(),
                                y: 0,
                                img: 'img/micdrop/dtm-target-arrow-right-offscreen.png',
                                xOffset: -125,
                                yOffset: -105
                            };
                            arrows.push(micArrow);
                        }
                    }
                }
                this.renderItem(pointGroup, arrows, 'arrow', 'svg:image', function (elements, xPos, yPos) {
                    elements.attr('x', function(d) {
                        var x = xPos(d.y, d.x, false);
                        x += viewConfig.offset[0];
                        if (d.xOffset !== undefined) {
                            x += d.xOffset;
                        }
                        return x;
                    })
                        .attr('y', function(d) {
                            var y = yPos(d.y, d.x, false);
                            y += viewConfig.offset[1];
                            if (d.yOffset !== undefined) {
                                y += d.yOffset;
                            }
                            return y;
                        })
                        .attr('class', function(d) {return (d.clazz !== undefined) ? 'arrow ' + d.clazz : 'arrow'; })
                        .attr('width', 125)
                        .attr('height', 53)
                        .attr('xlink:href', function(d) {return d.img;});
                });
            };

            this.renderAxis = function (axis, isXAxis) {

                //render the line from axis min to axis max - graph space coordinates
                var axisName = isXAxis? mt.common.GRAPH_X_AXIS_CLASS: mt.common.GRAPH_Y_AXIS_CLASS;
                var showAxes = graphModel.showAxes;

                var min = viewConfig.transformToPos(axis.min.x.val(), axis.min.y.val(), isXAxis);
                var max = viewConfig.transformToPos(axis.max.x.val(), axis.max.y.val(), isXAxis);

                this.renderItem(axisGroup, [axis], axisName, 'svg:line', function(elements, xPos, yPos) {
                    elements.attr('x1', function (d) { return min[0] + viewConfig.offset[0]; })
                        .attr('y1', function (d) { return min[1] + viewConfig.offset[1]; })
                        .attr('x2', function (d) { return max[0] + viewConfig.offset[0]; })
                        .attr('y2', function (d) { return max[1] + viewConfig.offset[1]; })
                        .attr('class', function(d) { return showAxes ? axisName : axisName + ' ' + mt.common.GRAPH_HIDDEN_CLASS;});
                });
                this.renderTarget();

                this.renderEndCaps(min, max, axisName);

                this.renderItem(axisLabelGroup, [axis], axisName + 'Label', 'svg:text', function (elements, xPos, yPos) {
                    var halfMargin = viewConfig.margin / 2;
                    var x = isXAxis === true ? viewConfig.width - viewConfig.margin : halfMargin;
                    var y = isXAxis === true ? viewConfig.height - halfMargin : halfMargin;
                    var transform = isXAxis === true ? '' : 'rotate(-90 ' + halfMargin + ' ' + halfMargin + ')';

                    elements.text(function (d) { return d.label !== undefined ? d.label.val() : undefined; })
                        .attr('x', x)
                        .attr('y', y)
                        .attr('transform', transform)
                        .attr('text-anchor', 'end');
                });
            };

            this.renderEndCaps = function(min, max, axisName){
                var capHeight = 36/2;
                var capMinX = min[0] + viewConfig.offset[0];
                var capMinY = min[1] + viewConfig.offset[1];
                var capMaxX = max[0] + viewConfig.offset[0];
                var capMaxY = max[1] + viewConfig.offset[1];

                var leftEnd = [
                    [ capMinX, capMinY - capHeight ],
                    [ capMinX, capMinY + capHeight ]
                ];
                var rightEnd = [
                    [ capMaxX, capMaxY - capHeight ],
                    [ capMaxX, capMaxY + capHeight ]
                ];
                var endcaps = [leftEnd, rightEnd];

                var line = d3.svg.line()
                    .x(function(d) { return d[0]; })
                    .y(function(d) { return d[1]; });

                this.renderItem(axisGroup, endcaps, axisName + '-endcap', 'svg:path', function(elements) {
                    elements.attr('d', line);
                });
            };


            this.renderTarget = function(posX) {
                if (posX === undefined) {
                    posX = 0;
                }
                var clazz = 'mt-micdrop-target';
                var targetCircles = [],
                    targetTriangle = [];
                if (graphModel.axes.y.min.y.val() <= 0 && 0 <= graphModel.axes.y.max.y.val()) {
                    targetCircles = [
                        {color: 'white', r: 22.5}
                    ];
                    targetTriangle = [{
                        x: posX,
                        y: posX,
                        color: '#FF7E0B',
                        outline: 'white'
                    }];
                }
                this.renderItem(axisGroup, targetCircles, clazz, 'svg:circle', function(elements, xPos, yPos) {
                    elements.attr('cy', function (d) { return yPos(posX, 0, false) + viewConfig.offset[1]; })
                        .attr('cx', function (d) { return xPos(posX, 0, false); })
                        .attr('r', function (d) {
                            return d.r;
                        })
                        .attr('fill', function (d) {
                            return d.color;
                        });
                });

                this.renderItem(axisGroup, targetTriangle, 'mt-micdrop-target-triangle', 'svg:polygon', function (elements, xPos, yPos){
                    elements.attr('points', function (d){
                        var x = xPos(posX, 0, false);
                        var y = yPos(posX, 0, false) + viewConfig.offset[1] - 3;
                        var triLength = 11;
                        var points = x + ',' + (y - triLength + 2) + ' ' + (x+triLength) + ',' + (y+triLength) + ' ' + (x-triLength) + ',' + (y+triLength);
                        return points;
                    })
                        .attr('fill', function (d) { return d.color; })
                        .attr('stroke', function (d) { return d.outline; })
                        .attr('stroke-width', 3);
                });
            };

            this.renderMics = function(mics) {
                var clazz = 'mic';
                this.renderItem(pointGroup, mics, clazz, 'svg:image', function(elements, xPos, yPos){
                    elements.attr('width', 30)
                        .attr('height', 54)
                        .attr('xlink:href', 'img/micdrop/dtm-mic-large.png')
                        .attr('x', function (d) { return xPos(d.y, d.x, false); })
                        .attr('y', function (d) { return yPos(d.y, d.x, false) - (xPos(d.x, d.y, false) - xPos(d.x, 0, false)) + viewConfig.offset[1] - 29; })
                        .attr('data-player-color', function(d){ return (d.color !== undefined) ? d.color : 'black'; });
                });
            };

            this.renderDrone = function(drone) {
                var clazz = 'mt-dm-drone';
                this.renderItem(pointGroup, drone, clazz, 'svg:image', function(elements, xPos, yPos){
                    elements.attr('width', 173)
                        .attr('height', 102)
                        .attr('xlink:href', 'img/micdrop/dtm-drone.png')
                        .attr('x', function (d) { return xPos(d.y, d.x, false) - 69; })
                        .attr('y', function (d) { return yPos(d.y, d.x, false) - (xPos(d.x, d.y, false) - xPos(d.x, 0, false)) + viewConfig.offset[1] - 114; })
                        .attr('data-player-color', function(d){ return (d.color !== undefined) ? d.color : 'black'; });
                });
            };
            this.renderPoints = function (points) {
                points = _(points).filter(function (point) {
                    return !point.isHidden;
                });

                var clazz = mt.common.GRAPH_POINT_CLASS + 'mic';
                this.renderItem(pointGroup, points, clazz, 'svg:circle', function(elements, xPos, yPos) {
                    elements.attr('cy', function (d) { return yPos(d.x.val(), d.y.val(), d.xAxis) + viewConfig.offset[1]; })
                        .attr('cx', function (d) { return xPos(d.x.val(), d.y.val(), d.xAxis); })
                        .attr('r', function (d) {
                            return mt.common.GRAPH_POINT_RADIUS;
                        })
                        .attr('fill', function (d) {
                            return (d.color !== undefined) ? d.color : 'black';
                        })
                        .attr('stroke-width', 3)
                        .attr('stroke', 'white');
                });
            };

            this.drawPercentTickLabelsTop = function (isTop, ticks, className, originOffset, isXAxis, forceDecimal, offset) {
                var showAxes = graphModel.showAxes;
                var clazz = className + '_top';
                var classHighlight = className + 'highlight_top';
                if(!isTop) {
                    clazz = className + '_bottom';
                    classHighlight = className + 'highlight_bottom';
                }

                this.renderItem(tickLabelGroup, ticks, clazz, 'svg:text', function (elements, xPos, yPos) {
                    function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                    function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                    elements.text(function (d) {
                            var label = d.numberLinePointLabel;
                            if (!isTop) {
                                label = '' + d.y.val();
                            }
                            return label; 
                        })
                        .attr('x', function (d) {
                            // offset zero label to avoid y axis
                            return tickXPos(d.y.val()) + offset[0] - originOffset[0];
                        })
                        .attr('y', function (d) {
                            var newX = tickXPos(d.y.val()) + offset[0] - originOffset[0];
                            var topWidth = 20;
                            var newY = graphModel.getYPosOfPercentBarText(newX, topWidth, isTop, d);
                            if (!isTop) {
                                newY = -newY  - (mt.common.PERCENT_BAR_HEIGHT + 10);
                            }
                            return tickYPos(d.y.val()) + offset[1] - originOffset[1] - newY;
                        })
                        .attr('class', function(d) { return className + ' ' + clazz + (showAxes ? '' : ' ' + mt.common.GRAPH_HIDDEN_CLASS);})
                        .attr('text-anchor', 'middle');
                });
            };

        }

        return MicDropRenderer;
    }());
})(window.mt.numberline);

(function(ns){

    'use strict';

    ns.NumberHuntGestureHandler = (function(){
        function NumberHuntGestureHandler(graphModel, viewConfig, updateCallback, selectionApi){
            var touchSize = mt.common.TOUCH_SIZE;
            this.graphModel = graphModel;
            this.viewConfig = viewConfig;
            this.update = updateCallback;

            this.pointSetId = undefined;
            this.snappingMode = mt.common.GRAPH_SNAP_MODE;
            //call the base gesture handler
            mt.common.GestureHandler.call(this, graphModel, updateCallback, selectionApi);

            var self = this;

            //register selectors
            this.registerSelection(function(posX, posY) {
                var lineY = self.viewConfig.transformToPos(self.graphModel.axes.y.min.x.val(), self.graphModel.axes.y.min.y.val(), false)[1];
                var numberHuntFoundObj = self.graphModel.getPercentTextObj(posX, posY, lineY);
                if (numberHuntFoundObj !== undefined) {
                    self.setKeypadVisible(true, numberHuntFoundObj);
                }
                return numberHuntFoundObj;
            });

            this.registerSelection(function(posX, posY) {
                return self.getPointAtPos(posX, posY);
            });

            this.registerSelection(function(posX, posY) {
                var val = viewConfig.transformToGraph(posX, posY);
                var isXAxis = viewConfig.isXAxis(posY);
                var axisVal = isXAxis? val[0]: val[1];
                return graphModel.getPartionedRangeAtPoint(axisVal, isXAxis, true);
            });

            //register taps
            this.registerTap(function(posX, posY) {
                var point = self.createPointAtPos(posX, posY);
                //go back to default mode
                self.setMode();
                return point;
            }, ns.ADD_POINT_MODE);

            this.registerTap(function(posX, posY) {
                var height = viewConfig.height * 3 / 4;
                self.pinchAtPos([posX, height], 0.75, [posX, height]);
            }, ns.ZOOM_IN_MODE);
            this.registerTap(function(posX, posY) {
                var height = viewConfig.height * 3 / 4;
                self.pinchAtPos([posX, height], (1 / 0.75), [posX, height]);
            }, ns.ZOOM_OUT_MODE);

            function getYPos(point) {
                return point.xAxis ? viewConfig.height * 3 / 4 : viewConfig.height * 1/4;
            }

            //register drags
            //point drag
            var draggingPoint;
            this.registerDrag(function dragStart(posX, posY) {
                draggingPoint = self.getPointAtPos(posX, posY);
                if(draggingPoint !== undefined) {
                    if(draggingPoint.isSelected !== true) {
                        draggingPoint = undefined;
                        return false;
                    }
                    updateCallback(false);
                    return true;
                }
                return false;
            }, function drag(posX) {
                if(draggingPoint === undefined) {
                    return false;
                }
                var posY = getYPos(draggingPoint);

                var prevVal = [draggingPoint.x.val(), draggingPoint.y.val()];
                var newVal = viewConfig.transformToGraph(posX, posY);

                if(draggingPoint.xAxis === true) {
                    draggingPoint.x.setVal(newVal[0]);
                } else {
                    draggingPoint.y.setVal(newVal[1]);
                }

                //update if the point moved
                if (prevVal[0] !== newVal[0] || prevVal[1] !== newVal[1]) {
                    updateCallback(false);
                }
                return true;
            }, function dragEnd() {
                if(draggingPoint === undefined) {
                    return false;
                }
                //snap point to ticks
                if (draggingPoint.xAxis === true) {
                    var tickX = self.getNearestTick(draggingPoint.x.val(), true);
                    draggingPoint.x.setVal(tickX.val());
                } else {
                    var tickY = self.getNearestTick(draggingPoint.y.val(), false);
                    draggingPoint.y.setVal(tickY.val());
                }
                draggingPoint = undefined;
                updateCallback(false);
                return true;
            });

            var partitionMax;
            var partitionMin;
            //partition creation
            this.registerDrag(function dragStart(posX, posY) {
                partitionMax = self.addPartitionedRangeAtPos(posX, posY);
                self.selectObject(partitionMax);
                return true;
            }, function drag(posX, posY) {
                dragPartition(partitionMax, posX, posY, true);
                return true;
            }, function dragEnd() {
                self.togglePartitioning();
                snapPartition(partitionMax, true);
                partitionMax.checkMinMax();
                updateCallback(false);
                partitionMax = undefined;
                return true;
            }, mt.common.GESTURE_MODE_PARTITION);

            //partition drag max
            this.registerDrag(function dragStart(posX, posY) {
                partitionMax = self.getPartitionedRangeHandleAtPos(posX, posY, true);
                if(partitionMax === undefined) {
                    return false;
                }
                return true;
            }, function drag(posX, posY) {
                if(partitionMax === undefined) {
                    return false;
                }
                dragPartition(partitionMax, posX, posY, true);
                return true;
            }, function dragEnd() {
                if(partitionMax === undefined) {
                    return false;
                }
                snapPartition(partitionMax, true);
                partitionMax = undefined;
                return true;
            });

            //partition drag min
            this.registerDrag(function dragStart(posX, posY) {
                partitionMin = self.getPartitionedRangeHandleAtPos(posX, posY, false);
                if(partitionMin === undefined) {
                    return false;
                }
                return true;
            }, function drag(posX, posY) {
                if(partitionMin === undefined) {
                    return false;
                }
                dragPartition(partitionMin, posX, posY, false);
                return true;
            }, function dragEnd() {
                if(partitionMin === undefined) {
                    return false;
                }
                snapPartition(partitionMin, false);
                partitionMin = undefined;
                return true;
            });

            this.togglePartitioning = function (val) {
                if(val === false || self.mode === mt.common.GESTURE_MODE_PARTITION) {
                    self.setMode();
                } else {
                    self.setMode(mt.common.GESTURE_MODE_PARTITION);
                }
            };

            this.toggleZoomIn = function (val) {
                if(val === false || self.mode === ns.ZOOM_IN_MODE) {
                    self.setMode();
                } else {
                    self.setMode(ns.ZOOM_IN_MODE);
                }
            };

            this.toggleZoomOut = function (val) {
                if(val === false || self.mode === ns.ZOOM_OUT_MODE) {
                    self.setMode();
                } else {
                    self.setMode(ns.ZOOM_OUT_MODE);
                }
            };

            this.toggleAddPointMode = function (val) {
                if(val === false || self.mode === ns.ADD_POINT_MODE) {
                    self.setMode();
                } else {
                    self.setMode(ns.ADD_POINT_MODE);
                }
            };

            this.createPointAtPos = function(posX, posY) {
                var val = viewConfig.transformToGraph(posX, posY);
                var tickValX = self.getNearestTick(val[0], true);
                var tickValY = self.getNearestTick(val[1], false);

                var isXAxis = viewConfig.isXAxis(posY);
                if (isXAxis === true) {
                    tickValY = new mt.common.MtValue(0, 1, false);
                } else if (isXAxis === false) {
                    tickValX = new mt.common.MtValue(0, 1, false);
                }
                var point = new mt.common.Point({x: tickValX, y: tickValY, xAxis: isXAxis});
                this.graphModel.points = [];
                graphModel.addPoint(point);
                updateCallback(false);
                return point;
            };

            function dragPartition(partition, posX, posY, isMax) {
                var newVal = viewConfig.transformToGraph(posX, posY);
                var newAxisVal = partition.isXAxis ? newVal[0]: newVal[1];
                setPartitionVal(partition, newAxisVal, isMax);
            }

            function snapPartition(partition, isMax) {
                var curVal = isMax? partition.max.val(): partition.min.val();
                var snappedVal = self.getNearestTick(curVal, partition.isXAxis, partition);
                setPartitionVal(partition, snappedVal.val(), isMax);
            }

            function setPartitionVal(partition, newVal, isMax) {
                if(isMax) {
                    partition.setMax(newVal);
                } else {
                    partition.setMin(newVal);
                }
                if (partition.getRange() === 0) {
                    self.graphModel.removePartitionedRange(partition);

                    self.deselect();
                    self.togglePartitioning(false);
                }
                updateCallback(false);
            }

            var panCenter;
            //panning
            this.registerDrag(function dragStart(posX) {
                //only pan when there is no selected object
                if(selectionApi.getSelection() !== undefined) {
                    return false;
                }
                panCenter = posX;
                return true;
            }, function drag(posX) {
                if(panCenter === undefined) {
                    return false;
                }
                //use a fixed height to hit the x-axis
                var height = viewConfig.height * 3 / 4;
                var centerVal = viewConfig.transformToGraph(panCenter, height)[0];
                var translationVal = viewConfig.transformToGraph(posX, height)[0];

                graphModel.axes.x.translateRange(centerVal - translationVal);
                graphModel.axes.y.translateRange(centerVal - translationVal);

                updateCallback(true);

                panCenter = posX;
                return true;
            }, function dragEnd() {
                panCenter = undefined;
                return false;
            });

            this.getPointAtPos = function (posX, posY, touchSize) {
                if (touchSize === undefined) {
                    touchSize = mt.common.TOUCH_SIZE;
                }
                var val = self.viewConfig.transformToGraph(posX, posY);
                var isXAxis = self.viewConfig.isXAxis(posY);

                var points = self.graphModel.findNearestPoints(val[0], val[1], isXAxis);

                var clickedPoint;
                if (points.length >= 1) {
                    var point = points[0];
                    //get point position in screen coords to check the point is within the selection range
                    var pointPos = self.viewConfig.transformToPos(point.x.val(), point.y.val(), isXAxis);
                    var distSq = (pointPos[0] - posX) * (pointPos[0] - posX) + (pointPos[1] - posY) * (pointPos[1] - posY);
                    if (distSq < touchSize * touchSize / 4) {
                        clickedPoint = point;
                    }
                }

                return clickedPoint;
            };
            this.pinchAtPos = function (dragCenter, scale, translationPos) {
                dragCenter[1] = viewConfig.height * 3 / 4;
                translationPos[1] = viewConfig.height * 3 / 4;
                var centerVal = viewConfig.transformToGraph(dragCenter[0], dragCenter[1]);
                var translationVal = viewConfig.transformToGraph(translationPos[0], translationPos[1]);

                self.graphModel.axes.x.scaleRange(centerVal[0], scale);
                self.graphModel.axes.x.translateRange(centerVal[0] - translationVal[0]);
                self.graphModel.axes.y.scaleRange(centerVal[0], scale);
                self.graphModel.axes.y.translateRange(centerVal[0] - translationVal[0]);

                self.update();
            };

            this.addPartitionedRangeAtPos = function (posX, posY) {
                var val = self.viewConfig.transformToGraph(posX, posY);

                var startVal;
                var isXAxis = self.viewConfig.isXAxis(posY);
                if (isXAxis === true) {
                    startVal = self.getNearestTick(val[0], true);
                } else if (isXAxis === false) {
                    startVal = self.getNearestTick(val[1], false);
                }

                //create and add the partition
                var partition = self.graphModel.addPartitionedRange(isXAxis, startVal, startVal, 1);
                return partition;
            };

            this.getNearestTick = function (val, isXAxis, excludedPartition) {
                var axis;
                if(isXAxis) {
                    axis = self.graphModel.axes.x;
                } else {
                    axis = self.graphModel.axes.y;
                }
                var tickVal = axis.getNearestTick(val, self.snappingMode, excludedPartition);

                if(self.snappingMode === mt.common.GRAPH_PROXIMITY_SNAP) {
                    var tickPos, valPos;
                    //compare 1d position of tick and value to determine whether to snap;
                    if(isXAxis) {
                        tickPos = self.viewConfig.transformToPos(tickVal.val(), 0, isXAxis);
                        valPos = self.viewConfig.transformToPos(val, 0, isXAxis);
                    } else {
                        tickPos = self.viewConfig.transformToPos(0, tickVal.val(), isXAxis);
                        valPos = self.viewConfig.transformToPos(0, val, isXAxis);
                    }
                    var snapDistSq = (tickPos[0]-valPos[0])*(tickPos[0]-valPos[0]) + (tickPos[1]-valPos[1])*(tickPos[1]-valPos[1]);
                    if(snapDistSq > mt.common.GRAPH_SNAP_THRESHOLD*mt.common.GRAPH_SNAP_THRESHOLD) {
                        tickVal = new mt.common.MtValue(val);
                    }
                }

                return tickVal;
            };
            this.getPartitionedRangeHandleAtPos = function(posX, posY, max) {
                var val = viewConfig.transformToGraph(posX, posY);

                var isXAxis = viewConfig.isXAxis(posY);
                var axisVal = isXAxis? val[0]: val[1];

                var partition = graphModel.findNearestPartitionedRange(axisVal, isXAxis, max);
                if(partition !== undefined && partition.isSelected !== true) {
                    partition = undefined;
                }
                var clickedPartition;
                if (partition !== undefined) {
                    var handleVal = max? partition.max: partition.min;
                    var pointVal = isXAxis? [handleVal.val(), 0]: [0, handleVal.val()];
                    //get point position in screen coords to check the point is within the selection range
                    var pointPos = viewConfig.transformToPos(pointVal[0], pointVal[1], isXAxis);
                    var distSq = (pointPos[0] - posX) * (pointPos[0] - posX);// JMT only test x dist?? + (pointPos[1] - posY) * (pointPos[1] - posY);
                    if (distSq < touchSize * touchSize / 4) {
                        clickedPartition = partition;
                    }
                }
                return clickedPartition;
            };
        }

        return NumberHuntGestureHandler;
    }());
})(window.mt.numberline);

(function(ns){

    'use strict';

    // number hunt specific d3 (svg) renderer
    ns.NumberHuntRenderer = (function(){
        function NumberHuntRenderer(containerElement, graphModel, viewConfig, toolId){
            // call the base renderer
            mt.common.BaseRenderer.call(this, containerElement, viewConfig, toolId);

            //create the groups
            var gridGroup = this.appendGroup();
            var axisGroup = this.appendGroup();
            var tickLabelGroup = this.appendGroup();
            var pointGroup = this.appendGroup();
            var gliderGroup = this.appendGroup();
            var axisLabelGroup = this.appendGroup();
            this.graphModel = graphModel;

            // main render function
            this.render = function(updateAxes){
                // sets graphModel.percentLabelRenderZones which is used to set label position
                this.graphModel.resetPercentBarTextCalc();

                if(updateAxes !== false) {
                    viewConfig.update(graphModel.axes.x.min.x.val(), graphModel.axes.x.max.x.val(),
                        graphModel.axes.y.min.y.val(), graphModel.axes.y.max.y.val());
                    
                    this.renderAxis(graphModel.axes.y, false);
                }

                var axis = graphModel.axes.y;
                var huntLowPoint = mt.common.Point({
                    x: new mt.common.MtValue(0),
                    y: graphModel.lowNum
                });
                var huntHighPoint = mt.common.Point({
                    x: new mt.common.MtValue(0),
                    y: graphModel.highNum
                });
                var offset = [0, - (mt.common.PERCENT_BAR_HEIGHT / 2)];
                if (graphModel.huntOptions.isIdentify) {
                    this.renderPoints([graphModel.huntPoint], {isIdentify: true});
                    this.drawPercentTickLabelsTop(false, [graphModel.huntPoint], mt.common.NUMBER_HUNT_LABEL, [0, 0], axis.isXAxis, false, offset);
                } else {
                    this.renderPoints([], {isIdentify: true});
                    this.drawPercentTickLabelsTop(false, [], mt.common.NUMBER_HUNT_LABEL, [0, 0], axis.isXAxis, false, offset);
                }
                this.renderPoints(graphModel.errorPoints, {errorPoint: true});
                this.renderPoints([huntLowPoint, huntHighPoint], {huntMarker: true});

                var allPoints = graphModel.points;
                _(graphModel.pointSets).each(function (pointSet) {
                    allPoints = allPoints.concat(pointSet.points);
                });

                var options = {};

                options.huntPoint = true;

                this.renderPoints(allPoints, options);

                this.renderGliders(graphModel.gliders);

                this.drawPartitions(graphModel.axes.y);
            };

            this.renderAxis = function(axis, isXAxis){
                //render the line from axis min to axis max - graph space coordinates
                var axisName = isXAxis? mt.common.GRAPH_X_AXIS_CLASS: mt.common.GRAPH_Y_AXIS_CLASS;

                var showAxes = graphModel.showAxes;

                var min = viewConfig.transformToPos(axis.min.x.val(), axis.min.y.val(), isXAxis);
                var max = viewConfig.transformToPos(axis.max.x.val(), axis.max.y.val(), isXAxis);
                
                this.renderItem(axisGroup, [axis], axisName, 'svg:line', function(elements, xPos, yPos) {
                    elements.attr('x1', function (d) { return min[0]; })
                        .attr('y1', function (d) { return min[1]; })
                        .attr('x2', function (d) { return max[0]; })
                        .attr('y2', function (d) { return max[1]; })
                        .attr('class', function(d) { return showAxes ? axisName : axisName + ' ' + mt.common.GRAPH_HIDDEN_CLASS;})
                        .style('stroke', mt.common.GRAPH_AXIS_COLOR)
                        .style('stroke-width', mt.common.GRAPH_AXIS_WIDTH);
                });

                //get ticks as an array of fractions
                var minorTicks = axis.getTicks(viewConfig.mode);

                //+ve offset
                var offsetA, offsetB;

                var originOffset = [0, 0];

                offsetA = {x:0, y:0};
                offsetB = {x:0, y:mt.common.GRAPH_TICK_LENGTH};

                this.drawTicks(gridGroup, minorTicks, axisName + '-minor-grid-line', offsetA, offsetB, isXAxis);

                this.renderAxisArrows(min, max, axisName, isXAxis);

                //in numberline mode render the minor tick marks too
                var labeledTicks;
                labeledTicks = _(minorTicks).filter(function (tick) {
                    return tick.drawLabel === true;
                });

                if(labeledTicks.length > 0 && labeledTicks[0].isFraction) {
                    //filter out ticks with unit denominator
                    var fracTicks = _(labeledTicks).filter(function (tick) {
                        return tick.denom !== 1;
                    });

                    this.drawTickLabelDividers(fracTicks, axisName + '-tick-label-divider', originOffset, isXAxis);
                    this.drawTickLabelDenom(fracTicks, axisName + '-tick-label-denom', originOffset, isXAxis);
                } else {
                    this.drawTickLabelDividers([], axisName + '-tick-label-divider', originOffset, isXAxis);
                    this.drawTickLabelDenom([], axisName + '-tick-label-denom', originOffset, isXAxis);
                }

                this.renderItem(axisLabelGroup, [axis], axisName + '-label', 'svg:text', function (elements, xPos, yPos) {
                    var halfMargin = viewConfig.margin / 2;
                    var x = isXAxis === true ? viewConfig.width - viewConfig.margin : halfMargin;
                    var y = isXAxis === true ? viewConfig.height - halfMargin : halfMargin;
                    var transform = isXAxis === true ? '' : 'rotate(-90 ' + halfMargin + ' ' + halfMargin + ')';

                    elements.text(function (d) { return d.label !== undefined ? d.label.val() : undefined; })
                        .attr('x', x)
                        .attr('y', y)
                        .attr('transform', transform)
                        .attr('text-anchor', 'end');
                });
                
            };

            this.drawTicks = function (group, ticks, className, offsetA, offsetB, isXAxis) {
                var showGridLines = graphModel.showGridLines;
                this.renderItem(group, ticks, className, 'svg:line', function (elements, xPos, yPos) {
                    function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                    function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                    elements.attr('x1', function (d) { return tickXPos(d.val()) + offsetA.x; })
                        .attr('y1', function (d) { return  tickYPos(d.val()) + offsetA.y; })
                        .attr('x2', function (d) { return tickXPos(d.val()) + offsetB.x; })
                        .attr('y2', function (d) { return tickYPos(d.val()) + offsetB.y; })
                        .attr('class', function(d) { return showGridLines ? className : className + ' ' + mt.common.GRAPH_HIDDEN_CLASS; })
                        .attr('stroke', function(d) { return d.drawLabel? '#A8A8A8': (d.color? d.color: '#CDCDCD'); });
                });
            };

            this.drawPartitions = function(axis) {
                var axisName = axis.isXAxis? mt.common.GRAPH_X_AXIS_CLASS: mt.common.GRAPH_Y_AXIS_CLASS;

                var partitionTicks = [];

                var yOffset = mt.common.GRAPH_TICK_LENGTH*4;

                for(var iPartition in axis.partitions) {
                    var partition = axis.partitions[iPartition];
                    var ticks = [];
                    ticks = partition.getVisibleTicks(partition.min, partition.max);
                    
                    for(var iTick in ticks) {
                        ticks[iTick].color = partition.color;
                    }
                    partitionTicks = partitionTicks.concat(ticks);
                }
                this.drawTicks(gridGroup, partitionTicks, axisName + '-partition-ticks', {x:0, y:-mt.common.GRAPH_TICK_LENGTH*2}, {x:0, y:0}, axis.isXAxis);
                this.drawPartitionBlocks(gridGroup, axis.partitions, axisName + '-partition-block', {x:0, y:-yOffset}, {x:0, y:yOffset}, axis.isXAxis);
                this.drawPartitionHandles(axis);

                _.each(graphModel.tickLabels, function(labelPoint) {
                    labelPoint.found = false;
                });
                for (var pt in partitionTicks) {
                    var val = partitionTicks[pt].val();
                    if (Math.abs(graphModel.lowNum - val) < (1e-14) ||
                        Math.abs(graphModel.highNum - val) < (1e-14) ||
                        (graphModel.huntOptions.isIdentify && Math.abs(graphModel.huntNum.val() - val) < (1e-14))) {
                        continue;
                    }
                    var found = false;
                    for (var t in graphModel.tickLabels) {
                        if (Math.abs(graphModel.tickLabels[t].y.val() - val) < (1e-14)) {
                            graphModel.tickLabels[t].found = true;
                            found = true;
                            break;
                        }
                    }
                    if (found) {
                        continue;
                    }

                    var tickLabel = mt.common.Point({
                        x: 0,
                        y: val,
                        numberLinePointLabel: ''
                    });
                    tickLabel.found = true;
                    graphModel.tickLabels.push(tickLabel);
                }
                graphModel.tickLabels = _.where(graphModel.tickLabels, {found: true});

                var offset = [0, - (mt.common.PERCENT_BAR_HEIGHT / 2)];
                this.drawPercentTickLabelsTop(false, graphModel.tickLabels, mt.common.NUMBER_HUNT_PARTITION_LABEL, [0, 0], axis.isXAxis, false, offset);
            };

            this.drawPartitionHandles = function (axis) {
                var axisName = axis.isXAxis? mt.common.GRAPH_X_AXIS_CLASS: mt.common.GRAPH_Y_AXIS_CLASS;

                var className = axisName + '-partition-handles';

                var handles = [];
                for(var i in axis.partitions) {
                    var partition = axis.partitions[i];
                    if(axis.isXAxis) {
                        handles.push({x:partition.getMin().val(), y:0, color: partition.color, xAxis: partition.isXAxis});
                        handles.push({x:partition.getMax().val(), y:0, color: partition.color, xAxis: partition.isXAxis});
                    } else {
                        handles.push({x:0, y:partition.getMin().val(), color: partition.color, xAxis: partition.isXAxis});
                        handles.push({x:0, y:partition.getMax().val(), color: partition.color, xAxis: partition.isXAxis});
                    }
                }

                this.renderItem(gridGroup, handles, className, 'svg:circle', function(elements, xPos, yPos) {
                    elements.attr('cy', function (d) { return yPos(d.x, d.y, d.xAxis); })
                        .attr('cx', function (d) { return xPos(d.x, d.y, d.xAxis); })
                        .attr('r', function (d) { return mt.common.GRAPH_POINT_RADIUS;})
                        .attr('fill', function (d) { return d.color;})
                        .attr('stroke', function(d) { return d.color; });
                });
            };

            this.drawPartitionBlocks = function (group, partitions, className, offsetA, offsetB, isXAxis) {
                var rx = 5;
                var ry = 5;
                this.renderItem(group, partitions, className, 'svg:rect', function (elements, xPos, yPos) {
                    function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                    function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                    elements.attr('x', function (d) { return tickXPos(d.getMin().val()); })
                        .attr('y', function (d) { return tickYPos(d.getMin().val()) + offsetA.y; })
                        .attr('width', function (d) { return tickXPos(d.getMax().val()) - tickXPos(d.getMin().val()); })
                        .attr('height', offsetB.y - offsetA.y)
                        .attr('fill', function (d) { return d.color;})
                        .attr('id', function (d) { return d.id; })
                        .style('stroke', function (d) { return d.color;})
                        .style('stroke-width', function (d) { return d.isSelected? 2: 0;})
                        .attr('rx', rx)
                        .attr('ry', ry);
                });
            };

            function toFixedDown(val) {
                var returnVal = val.toFixed(2) + ' ';
                while (returnVal.indexOf('0 ') !== -1) {
                    returnVal = returnVal.replace('0 ', ' ');
                }
                return returnVal.replace('. ', ' ').replace(' ', '');
            }

            function getPercentOfValue(val, hundredPercentValue, withPercentSymbol) {
                var returnVal = (((val.val() / hundredPercentValue) * 100).toFixed(2) + '%');
                while (returnVal.indexOf('0%') !== -1) {
                    returnVal = returnVal.replace('0%', '%');
                }
                returnVal = returnVal.replace('.%', '%');
                return returnVal;
            }

            function percentLabel(point, label, percentMode, top, hundredPercentValue) {
                if (top) {
                    if (percentMode === mt.common.PERCENT_BAR_MODE_ALL || percentMode === mt.common.PERCENT_BAR_MODE_VALUE) {
                        return toFixedDown(point.val());
                    }
                } else {
                    if (percentMode === mt.common.PERCENT_BAR_MODE_ALL || percentMode === mt.common.PERCENT_BAR_MODE_PERCENT) {
                        return getPercentOfValue(point, hundredPercentValue);
                    }
                }
                return label;
            }

            this.drawPercentTickLabelsTop = function (isTop, ticks, className, originOffset, isXAxis, forceDecimal, offset) {
                var showAxes = graphModel.showAxes;
                var clazz = className + '-top';
                var classHighlight = className + '-highlight-top';
                if(!isTop) {
                    clazz = className + '-bottom';
                    classHighlight = className + '-highlight-bottom';
                }

                var self = this;
                this.renderItem(tickLabelGroup, ticks, clazz, 'svg:text', function (elements, xPos, yPos) {
                    function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                    function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                    elements.text(function (d) { return percentLabel(d.y, d.numberLinePointLabel, graphModel.percentBarMode, isTop, graphModel.hundredPercentValue); })
                        .attr('x', function (d) {
                            // offset zero label to avoid y axis
                            return tickXPos(d.y.val()) + offset[0] - originOffset[0];
                        })
                        .attr('y', function (d) {
                            var newX = tickXPos(d.y.val()) + offset[0] - originOffset[0];
                            var topWidth = self.getSVGTextWidth(percentLabel(d.y, d.numberLinePointLabel, graphModel.percentBarMode, isTop, graphModel.hundredPercentValue));
                            var newY = graphModel.getYPosOfPercentBarText(newX, topWidth, isTop, d);
                            if (!isTop) {
                                newY =  -newY - (mt.common.PERCENT_BAR_HEIGHT + 20);
                            }
                            return tickYPos(d.y.val()) + offset[1] - originOffset[1] - newY;
                        })
                        .attr('class', function(d) { return className + ' ' + clazz + (showAxes ? '' : ' ' + mt.common.GRAPH_HIDDEN_CLASS);})
                        .attr('text-anchor', 'middle');
                });
                this.renderItem(tickLabelGroup, ticks, classHighlight, 'svg:rect', function (elements, xPos, yPos){
                    function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}
                    elements.attr('x', function(d) {
                        var highlightObjX = graphModel.getPercentZoneByObj(d, isTop);
                        var XW = (highlightObjX.width > 10) ? highlightObjX.width : 10;
                        return highlightObjX.x - XW / 2;
                    })
                        .attr('y', function (d) {
                            var highlightObjY = graphModel.getPercentZoneByObj(d, isTop);
                            var highlightOffset = -15 - highlightObjY.y;
                            if (!isTop) {
                                highlightOffset = mt.common.PERCENT_BAR_HEIGHT + 5 + highlightObjY.y;
                            }
                            return tickYPos(d.y.val()) + offset[1] - originOffset[1] + highlightOffset;
                        })
                        .attr('width', function (d){
                            var highlightObjW = graphModel.getPercentZoneByObj(d, isTop);
                            var hightlightW = (highlightObjW.width > 10) ? highlightObjW.width : 10;
                            return hightlightW;
                        })
                        .attr('height', 20)
                        .style('fill', function (d) {
                            var hightlightString = percentLabel(d.y, d.numberLinePointLabel, graphModel.percentBarMode, isTop, graphModel.hundredPercentValue);
                            var shouldBeMode = mt.common.PERCENT_BAR_MODE_PERCENT;
                            if (!isTop) {
                                shouldBeMode = mt.common.PERCENT_BAR_MODE_VALUE;
                            }
                            if (((!isTop && viewConfig.isNumberhunt)) &&
                                (hightlightString === undefined || hightlightString.length === 0)) {
                                var highlightColor = 'lightblue';
                                if (clazz.indexOf('mt-hunt-label') !== -1) {
                                    highlightColor = 'blue';
                                }
                                return highlightColor;
                            }
                            return 'none';
                        })
                        .style('stroke-width', function(d){ return d.isSelected ? '3px' : '1px'; })
                        .style('stroke', function(d){ return d.isSelected ? 'rgba(82, 168, 236, 0.8)' : ''; })
                        .classed('mt-selected', function(d){ return d.isSelected === true;});
                });
            };

            this.drawTickLabelDividers = function (ticks, className, originPos, isXAxis) {
                
                var length = 14;
                var vertOffset = 3;

                var offset;
                if(isXAxis) {
                    offset = [0, mt.common.GRAPH_TICK_LENGTH*3 + vertOffset];
                } else {
                    offset = [mt.common.GRAPH_TICK_LENGTH*2, 5 + vertOffset];
                }

                this.renderItem(tickLabelGroup, ticks, className, 'svg:line', function (elements, xPos, yPos) {
                    function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                    function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                    elements.attr('x1', function (d) { return tickXPos(d.val()) + offset[0] - length/2; })
                        .attr('y1', function (d) { return tickYPos(d.val()) + offset[1]; })
                        .attr('x2', function (d) { return tickXPos(d.val()) + offset[0] + length/2; })
                        .attr('y2', function (d) { return tickYPos(d.val()) + offset[1]; })
                        .style('stroke', mt.common.GRAPH_AXIS_COLOR);
                });
            };

            this.drawTickLabelDenom = function (ticks, className, originPos, isXAxis) {

                var denomOffset = 17;

                var offset;
                if(isXAxis) {
                    offset = [0, mt.common.GRAPH_TICK_LENGTH*3 + denomOffset];
                } else {
                    offset = [mt.common.GRAPH_TICK_LENGTH*2, 5 + denomOffset];
                }

                this.renderItem(tickLabelGroup, ticks, className, 'svg:text', function (elements, xPos, yPos) {
                    function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                    function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                    elements.text(function (d) { return d.denom; })
                        .attr('x', function (d) {
                            return tickXPos(d.val()) + offset[0];
                        })
                        .attr('y', function (d) {
                            return tickYPos(d.val()) + offset[1];
                        })
                        .attr('text-anchor', 'middle');
                });
            };

            this.renderPoints = function(points, options){
                var self = this;
                if (options === undefined) {
                    options = {};
                }
                points = _(points).filter(function (point) {
                    return !point.isHidden;
                });
                var clipId = '';

                var clazz = mt.common.GRAPH_POINT_CLASS;
                if (options.huntPoint === true) {
                    clazz = mt.common.NUMBER_HUNT_POINT_CLASS;
                } else if (options.huntMarker === true) {
                    clazz = mt.common.NUMBER_HUNT_MARKER_CLASS;
                } else if (options.errorPoint === true) {
                    clazz = mt.common.NUMBER_HUNT_ERROR_CLASS;
                } else if (options.isIdentify === true) {
                    clazz = mt.common.NUMBER_HUNT_LABEL_POINT;
                }
                
                this.renderItem(pointGroup, points, clazz, 'svg:circle', function(elements, xPos, yPos) {
                    elements.attr('cy', function (d) { return yPos(d.x.val(), d.y.val(), d.xAxis); })
                        .attr('cx', function (d) { return xPos(d.x.val(), d.y.val(), d.xAxis); })
                        .attr('r', function (d) {
                            var pointRadius = mt.common.GRAPH_POINT_RADIUS;
                            if (viewConfig.isNumberhunt) {
                                pointRadius = mt.common.NUMBER_HUNT_POINT_RADIUS;
                            } else if (d.isSelected) {
                                pointRadius = mt.common.GRAPH_SELECTED_POINT_RADIUS;
                            }
                            return pointRadius;
                        })
                        .attr('clip-path', 'url(#' + clipId + ')');
                });

                var mode = viewConfig.mode;
                var showPointLabels = (options.showLabels !== undefined)? options.showLabels: graphModel.showPointLabels;
                var textClazz = mt.common.GRAPH_POINT_LABEL_CLASS;

                if (options.huntMarker === true) {
                    showPointLabels = true;
                    textClazz += '-hunt-marker';
                } else if (options.huntPoint === true){
                    showPointLabels = false;
                } else if (options.errorPoint === true) {
                    textClazz += '-error-point';
                } else if (options.isIdentify === true) {
                    textClazz += '-identify';
                }

                this.renderItem(pointGroup, points, textClazz, 'svg:text', function(elements, xPos, yPos) {
                    elements.attr('text-anchor', 'middle')
                        .attr('x', function (d) {
                            return xPos(d.x.val(), d.y.val(), d.xAxis);
                        })
                        .attr('y', function (d) {
                            var baseY = yPos(d.x.val(), d.y.val(), d.xAxis);
                            return baseY + 25;
                        })
                        .attr('class', function (d) {
                            return (d.isSelected === true && !viewConfig.isNumberhunt) || showPointLabels === true || options.errorPoint ? textClazz : textClazz + ' ' + mt.common.GRAPH_HIDDEN_CLASS;
                        })
                        .attr('clip-path', 'url(#' + clipId + ')')
                        .text(function (d) {
                            return d.coordinateLabel(mode, {
                                displayMixedFraction: (self.graphModel.huntOptions !== undefined && self.graphModel.huntOptions.displayMixedFraction === true),
                                forceFraction: self.graphModel.huntNum && self.graphModel.huntNum.isFraction
                            });
                        });
                });
            };

            this.renderGliders = function (gliders) {
                var clipId = this.clipId;
                this.renderItem(gliderGroup, gliders, mt.common.GRAPH_GLIDER_CLASS, 'svg:circle', function(elements, xPos, yPos) {
                    elements.attr('cy', function (d) { return yPos(d.getPos()[0], d.getPos()[1]); })
                        .attr('cx', function (d) { return xPos(d.getPos()[0], d.getPos()[1]); })
                        .attr('r', function (d) { return d.isSelected === true ? mt.common.GRAPH_SELECTED_POINT_RADIUS : mt.common.GRAPH_POINT_RADIUS;})
                        .attr('clip-path', 'url(#' + clipId + ')');
                });

                var selectedGlider = _(gliders).findWhere({isSelected: true});
                if (!selectedGlider) {
                    return;
                }

                var pos = selectedGlider.getPos();
                var text = selectedGlider.toString();

                this.renderItem(pointGroup, [selectedGlider], mt.common.GRAPH_POINT_LABEL_CLASS, 'svg:text', function(elements, xPos, yPos) {
                    elements.attr('text-anchor', 'middle')
                        .attr('x', function () {
                            return xPos(pos[0], pos[1], true);
                        })
                        .attr('y', function () {
                            var baseY = yPos(pos[0], pos[1], false);
                            return baseY - 25;
                        })
                        .attr('class', mt.common.GRAPH_POINT_LABEL_CLASS)
                        .attr('clip-path', 'url(#' + clipId + ')')
                        .text(text);
                });
            };

            this.renderAxisArrows = function (startPos, endPos, axisName, isXAxis) {
                //render the line from axis min to axis max - graph space coordinates
                var arrowName = axisName + '-arrow';
                var showAxes = graphModel.showAxes;

                var arrowLines = getArrowData(startPos, endPos);
                arrowLines = arrowLines.concat(getArrowData(endPos, startPos));

                this.renderItem(axisGroup, arrowLines, arrowName, 'svg:line', function(elements) {
                    elements.attr('x1', function (d) { return d[0][0]; })
                        .attr('y1', function (d) { return d[0][1]; })
                        .attr('x2', function (d) { return d[1][0]; })
                        .attr('y2', function (d) { return d[1][1]; })
                        .attr('class', function (d) { return showAxes ? arrowName : arrowName + ' ' + mt.common.GRAPH_HIDDEN_CLASS;})
                        .style('stroke', mt.common.GRAPH_AXIS_COLOR)
                        .style('stroke-width', mt.common.GRAPH_AXIS_WIDTH);
                });
            };

            function getArrowData(startPos, endPos) {
                var lengthSq = (endPos[0] - startPos[0])*(endPos[0]- startPos[0]) + (endPos[1] - startPos[1])*(endPos[1] - startPos[1]);
                //divide by arrow length below to scale everything to correct size
                var length = Math.sqrt(lengthSq) / mt.common.GRAPH_ARROW_LENGTH;
                var norm = [(endPos[0] - startPos[0])/length, (endPos[1] - startPos[1])/length];
                var normPerp = [norm[1], -norm[0]];

                //arrow arm to stem ratio
                var ratio = mt.common.GRAPH_ARROW_RATIO;

                //arrow data containing 3 lines
                var arrowData = [];
                //stem
                arrowData.push([endPos, [endPos[0] + norm[0], endPos[1] + norm[1]]]);
                //upper angle
                arrowData.push([[endPos[0] + norm[0], endPos[1] + norm[1]], [endPos[0] + norm[0] + (-norm[0]+normPerp[0])*ratio, endPos[1] + norm[1] + (-norm[1] + normPerp[1])*ratio]]);
                //lower angle
                arrowData.push([[endPos[0] + norm[0], endPos[1] + norm[1]], [endPos[0] + norm[0] + (-norm[0]-normPerp[0])*ratio, endPos[1] + norm[1] + (-norm[1] - normPerp[1])*ratio]]);
                return arrowData;
            }

            //TODO: this is hacky, but I can't seem to precalculate the text
            this.getSVGTextWidth = function(string) {
                if (string === undefined || string.length === 0) {
                    return 20;
                }
                var margin = 2;
                string = '' + string;
                var size = 0;
                var textSizes = {
                    '0': 10,
                    '1': 5,
                    '2': 9,
                    '3': 9,
                    '4': 9,
                    '5': 9,
                    '6': 9,
                    '7': 8,
                    '8': 9,
                    '9': 9,
                    '.': 4,
                    '%': 12,
                    '-': 5
                };
                for (var i = 0; i < string.length; i++) {
                    size += (textSizes[string.charAt(i)] !== undefined) ? textSizes[string.charAt(i)] : 9; //giving it an average size if we don't have the letter
                }

                return size + ((size > 0 ) ? margin : 0);
            };
        }

        return NumberHuntRenderer;
    }());
})(window.mt.numberline);

(function (ns) {

    'use strict';

    //view config responsible for mapping between graph and view space for both graph and numberline
    ns.NumberlineGestureHandler = (function () {
        function NumberlineGestureHandler(graphModel, viewConfig, updateCallback, selectionApi) {
            //need to think about this - 40 px is probably too big now that selection is also bound to tap
            var touchSize = mt.common.TOUCH_SIZE;
            this.snappingMode = mt.common.GRAPH_SNAP_MODE;
            var self = this;

            //call the base gesture handler
            mt.common.GestureHandler.call(this, graphModel, updateCallback, selectionApi);

            this.toggleSnapping = function (mode) {
                this.snappingMode = mode;
            };

            this.getPointAtPos = function(posX, posY) {
                var val = viewConfig.transformToGraph(posX, posY);
                var isXAxis = viewConfig.isXAxis(posY);

                var points = graphModel.findNearestPoints(val[0], val[1], isXAxis);

                var clickedPoint;
                if (points.length >= 1) {
                    var point = points[0];
                    //get point position in screen coords to check the point is within the selection range
                    var pointPos = viewConfig.transformToPos(point.x.val(), point.y.val(), isXAxis);
                    var distSq = (pointPos[0] - posX) * (pointPos[0] - posX) + (pointPos[1] - posY) * (pointPos[1] - posY);
                    if (distSq < touchSize * touchSize / 4) {
                        clickedPoint = point;
                    }
                }
                return clickedPoint;
            };

            this.getNearestTick = function(val, isXAxis, excludedPartition) {
                var axis;
                if(isXAxis) {
                    axis = graphModel.axes.x;
                } else {
                    axis = graphModel.axes.y;
                }
                var tickVal = axis.getNearestTick(val, self.snappingMode, excludedPartition);

                if(self.snappingMode === mt.common.GRAPH_PROXIMITY_SNAP) {
                    var tickPos, valPos;
                    //compare 1d position of tick and value to determine whether to snap;
                    if(isXAxis) {
                        tickPos = viewConfig.transformToPos(tickVal.val(), 0, isXAxis);
                        valPos = viewConfig.transformToPos(val, 0, isXAxis);
                    } else {
                        tickPos = viewConfig.transformToPos(0, tickVal.val(), isXAxis);
                        valPos = viewConfig.transformToPos(0, val, isXAxis);
                    }
                    console.log('tick pos = ' + JSON.stringify(tickPos) + ' vs ' + JSON.stringify(valPos));
                    var snapDistSq = (tickPos[0]-valPos[0])*(tickPos[0]-valPos[0]) + (tickPos[1]-valPos[1])*(tickPos[1]-valPos[1]);
                    console.log('snap dist = ' + snapDistSq + ' vs ' + mt.common.GRAPH_SNAP_THRESHOLD*mt.common.GRAPH_SNAP_THRESHOLD);
                    if(snapDistSq > mt.common.GRAPH_SNAP_THRESHOLD*mt.common.GRAPH_SNAP_THRESHOLD) {
                        tickVal = new mt.common.MtValue(val);
                    }
                }

                return tickVal;
            };

            this.togglePartitioning = function (val) {
                if(val === false || this.mode === mt.common.GESTURE_MODE_PARTITION) {
                    this.setMode();
                } else {
                    this.setMode(mt.common.GESTURE_MODE_PARTITION);
                }
            };

            this.toggleAddPointMode = function (val) {
                if(val === false || this.mode === ns.ADD_POINT_MODE) {
                    this.setMode();
                } else {
                    this.setMode(ns.ADD_POINT_MODE);
                }
            };

            this.getPartitionedRangeHandleAtPos = function(posX, posY, max) {
                var val = viewConfig.transformToGraph(posX, posY);

                var isXAxis = viewConfig.isXAxis(posY);
                var axisVal = isXAxis? val[0]: val[1];

                var partition = graphModel.findNearestPartitionedRange(axisVal, isXAxis, max);
                if(partition !== undefined && partition.isSelected !== true) {
                    partition = undefined;
                }
                var clickedPartition;
                if (partition !== undefined) {
                    var handleVal = max? partition.max: partition.min;
                    var pointVal = isXAxis? [handleVal.val(), 0]: [0, handleVal.val()];
                    //get point position in screen coords to check the point is within the selection range
                    var pointPos = viewConfig.transformToPos(pointVal[0], pointVal[1], isXAxis);
                    var distSq = (pointPos[0] - posX) * (pointPos[0] - posX);// JMT only test x dist?? + (pointPos[1] - posY) * (pointPos[1] - posY);
                    if (distSq < touchSize * touchSize / 4) {
                        clickedPartition = partition;
                    }
                }
                return clickedPartition;
            };


            this.createPointAtPos = function(posX, posY) {
                var val = viewConfig.transformToGraph(posX, posY);
                var tickValX = self.getNearestTick(val[0], true);
                var tickValY = self.getNearestTick(val[1], false);

                var isXAxis = viewConfig.isXAxis(posY);
                if (isXAxis === true) {
                    tickValY = new mt.common.MtValue(0, 1, false);
                } else if (isXAxis === false) {
                    tickValX = new mt.common.MtValue(0, 1, false);
                }
                var point = new mt.common.Point({x: tickValX, y: tickValY, xAxis: isXAxis});
                graphModel.addPoint(point);
                updateCallback(false);
                return point;
            };

            //register selectors
            this.registerSelection(function(posX, posY) {
                return self.getPointAtPos(posX, posY);
            });
            this.registerSelection(function(posX, posY) {
                var val = viewConfig.transformToGraph(posX, posY);
                var isXAxis = viewConfig.isXAxis(posY);
                var axisVal = isXAxis? val[0]: val[1];
                return graphModel.getPartionedRangeAtPoint(axisVal, isXAxis, true);
            });


            //register taps
            this.registerTap(function(posX, posY) {
                var point = self.createPointAtPos(posX, posY);
                //go back to default mode
                self.setMode();
                return point;
            }, ns.ADD_POINT_MODE);

            var lineStart;
            //adding lines
            this.registerTap(function(posX, posY) {
                if(lineStart !== undefined) {
                    return false;
                }
                lineStart = self.getPointAtPos(posX, posY);
                if(lineStart === undefined) {
                    lineStart = self.createPointAtPos(posX, posY);
                }
                lineStart.isSelected = true;
                updateCallback(false);
                return true;
            }, mt.common.TYPE_LINE_SEGMENT);

            this.registerTap(function(posX, posY) {
                if(lineStart === undefined) {
                    return false;
                }
                var lineEnd = self.getPointAtPos(posX, posY);
                if(lineEnd === undefined) {
                    lineEnd = self.createPointAtPos(posX, posY);
                }
                if(lineEnd !== lineStart) {
                    var line = new mt.common.Line({
                        start: lineStart,
                        end: lineEnd,
                        innerType: mt.common.LINE_INNER_TYPE_LINE_SEGMENT
                    });
                    graphModel.addLine(line);
                }

                lineStart = undefined;
                self.deselect();

                updateCallback(false);
                return true;
            }, mt.common.TYPE_LINE_SEGMENT);

            function getYPos(point) {
                return point.xAxis ? viewConfig.height * 3 / 4 : viewConfig.height * 1/4;
            }

            //register drags
            //point drag
            var draggingPoint;
            this.registerDrag(function dragStart(posX, posY) {
                draggingPoint = self.getPointAtPos(posX, posY);
                if(draggingPoint !== undefined) {
                    if(draggingPoint.isSelected !== true) {
                        draggingPoint = undefined;
                        return false;
                    }
                    updateCallback(false);
                    return true;
                }
                return false;
            }, function drag(posX) {
                if(draggingPoint === undefined) {
                    return false;
                }
                var posY = getYPos(draggingPoint);

                var prevVal = [draggingPoint.x.val(), draggingPoint.y.val()];
                var newVal = viewConfig.transformToGraph(posX, posY);

                if(draggingPoint.xAxis === true) {
                    draggingPoint.x.setVal(newVal[0]);
                } else {
                    draggingPoint.y.setVal(newVal[1]);
                }

                //update if the point moved
                if (prevVal[0] !== newVal[0] || prevVal[1] !== newVal[1]) {
                    updateCallback(false);
                }
                return true;
            }, function dragEnd() {
                if(draggingPoint === undefined) {
                    return false;
                }
                //snap point to ticks
                if (draggingPoint.xAxis === true) {
                    var tickX = self.getNearestTick(draggingPoint.x.val(), true);
                    draggingPoint.x.setVal(tickX.val());
                } else {
                    var tickY = self.getNearestTick(draggingPoint.y.val(), false);
                    draggingPoint.y.setVal(tickY.val());
                }
                draggingPoint = undefined;
                updateCallback(false);
                return true;
            });


            function dragPartition(partition, posX, posY, isMax) {
                var newVal = viewConfig.transformToGraph(posX, posY);
                var newAxisVal = partition.isXAxis ? newVal[0]: newVal[1];
                setPartitionVal(partition, newAxisVal, isMax);
            }

            function snapPartition(partition, isMax) {
                var curVal = isMax? partition.max.val(): partition.min.val();
                var snappedVal = self.getNearestTick(curVal, partition.isXAxis, partition);
                setPartitionVal(partition, snappedVal.val(), isMax);
            }

            function setPartitionVal(partition, newVal, isMax) {
                if(isMax) {
                    partition.setMax(newVal);
                } else {
                    partition.setMin(newVal);
                }
                updateCallback(false);
            }

            this.addPartitionedRangeAtPos = function (posX, posY) {
                var val = viewConfig.transformToGraph(posX, posY);

                var startVal;
                var isXAxis = viewConfig.isXAxis(posY);
                if (isXAxis === true) {
                    startVal = self.getNearestTick(val[0], true);
                } else {
                    startVal = self.getNearestTick(val[1], false);
                }

                //create and add the partition
                var partition = graphModel.addPartitionedRange(isXAxis, startVal, startVal, 1);
                return partition;
            };


            this.registerTap(function(posX, posY) {
                var partition = self.addPartitionedRangeAtPos(posX, posY);
                self.selectObject(partition);
                //place the max edge of partition
                dragPartition(partition, posX + ns.DEFAULT_PARTITION_FRACTION*ns.DEFAULT_WIDTH, posY, true);
                //snap to a tick
                snapPartition(partition, true);
                self.togglePartitioning();
                return true;
            }, mt.common.GESTURE_MODE_PARTITION);

            var partitionMax;
            var partitionMin;
            //partition creation
            this.registerDrag(function dragStart(posX, posY) {
                partitionMax = self.addPartitionedRangeAtPos(posX, posY);
                self.selectObject(partitionMax);
                return true;
            }, function drag(posX, posY) {
                dragPartition(partitionMax, posX, posY, true);
                return true;
            }, function dragEnd() {
                snapPartition(partitionMax, true);
                updateCallback(false);
                partitionMax = undefined;
                self.togglePartitioning();
                return true;
            }, mt.common.GESTURE_MODE_PARTITION);

            //partition drag max
            this.registerDrag(function dragStart(posX, posY) {
                partitionMax = self.getPartitionedRangeHandleAtPos(posX, posY, true);
                if(partitionMax === undefined) {
                    return false;
                }
                return true;
            }, function drag(posX, posY) {
                if(partitionMax === undefined) {
                    return false;
                }
                dragPartition(partitionMax, posX, posY, true);
                return true;
            }, function dragEnd() {
                if(partitionMax === undefined) {
                    return false;
                }
                snapPartition(partitionMax, true);
                partitionMax = undefined;
                return true;
            });

            //partition drag min
            this.registerDrag(function dragStart(posX, posY) {
                partitionMin = self.getPartitionedRangeHandleAtPos(posX, posY, false);
                if(partitionMin === undefined) {
                    return false;
                }
                return true;
            }, function drag(posX, posY) {
                if(partitionMin === undefined) {
                    return false;
                }
                dragPartition(partitionMin, posX, posY, false);
                return true;
            }, function dragEnd() {
                if(partitionMin === undefined) {
                    return false;
                }
                snapPartition(partitionMin, false);
                partitionMin = undefined;
                return true;
            });

            //other gestures
            this.pinchAtPos = function (dragCenter, scale, translationPos) {
                dragCenter[1] = viewConfig.height * 3 / 4;
                translationPos[1] = viewConfig.height * 3 / 4;

                var centerVal = viewConfig.transformToGraph(dragCenter[0], dragCenter[1]);
                var translationVal = viewConfig.transformToGraph(translationPos[0], translationPos[1]);

                graphModel.axes.x.scaleRange(centerVal[0], scale);
                graphModel.axes.x.translateRange(centerVal[0] - translationVal[0]);

                graphModel.axes.y.scaleRange(centerVal[0], scale);
                graphModel.axes.y.translateRange(centerVal[0] - translationVal[0]);

                updateCallback(true);
            };

            var panCenter;
            //panning
            this.registerDrag(function dragStart(posX) {
                //only pan when there is no selected object
                if(selectionApi.getSelection() !== undefined) {
                    return false;
                }
                panCenter = posX;
                return true;
            }, function drag(posX) {
                if(panCenter === undefined) {
                    return false;
                }
                //use a fixed height to hit the x-axis
                var height = viewConfig.height * 3 / 4;
                var centerVal = viewConfig.transformToGraph(panCenter, height)[0];
                var translationVal = viewConfig.transformToGraph(posX, height)[0];

                graphModel.axes.x.translateRange(centerVal - translationVal);
                graphModel.axes.y.translateRange(centerVal - translationVal);

                updateCallback(true);

                panCenter = posX;
                return true;
            }, function dragEnd() {
                panCenter = undefined;
                return true;
            });
        }

        return NumberlineGestureHandler;
    }());
})(window.mt.numberline);

(function (ns) {

    'use strict';

    //numberline specfic d3 (svg) renderer
    ns.NumberlineRenderer = (function () {
        function NumberlineRenderer(containerElement, graphModel, viewConfig, toolId) {
             //call the base renderer
            mt.common.BaseRenderer.call(this, containerElement, viewConfig, toolId);

            //create the groups
            var gridGroup = this.appendGroup();
            var pointLabelStemGroup = this.appendGroup();
            var axisGroup = this.appendGroup();
            var tickLabelGroup = this.appendGroup();
            var axisLabelGroup = this.appendGroup();
            var lineGroup = this.appendGroup();
            var pointGroup = this.appendGroup();

            //main render function
            this.render = function (updateAxes) {
                if(updateAxes !== false) {
                    viewConfig.update(graphModel.axes.x.min.x.val(), graphModel.axes.x.max.x.val(),
                        graphModel.axes.y.min.y.val(), graphModel.axes.y.max.y.val());
                    if(viewConfig.isDouble === true) {
                        this.renderAxis(graphModel.axes.x, true);
                    }
                    this.renderAxis(graphModel.axes.y, false);
                }

                var allPoints = graphModel.points;
                this.renderPoints(allPoints);
                this.renderLines(graphModel.lines);

                if(viewConfig.isDouble === true) {
                    this.drawPartitions(graphModel.axes.x);
                }
                this.drawPartitions(graphModel.axes.y);
            };

            this.renderAxis = function (axis, isXAxis) {
                //render the line from axis min to axis max - graph space coordinates
                var axisName = isXAxis? mt.common.GRAPH_X_AXIS_CLASS: mt.common.GRAPH_Y_AXIS_CLASS;
                var showAxes = graphModel.showAxes;

                var min = viewConfig.transformToPos(axis.min.x.val(), axis.min.y.val(), isXAxis);
                var max = viewConfig.transformToPos(axis.max.x.val(), axis.max.y.val(), isXAxis);

                this.renderItem(axisGroup, [axis], axisName, 'svg:line', function(elements, xPos, yPos) {
                    elements.attr('x1', function (d) { return min[0]; })
                        .attr('y1', function (d) { return min[1]; })
                        .attr('x2', function (d) { return max[0]; })
                        .attr('y2', function (d) { return max[1]; })
                        .attr('class', function(d) { return showAxes ? axisName : axisName + ' ' + mt.common.GRAPH_HIDDEN_CLASS;});
                });

                //get ticks as an array of fractions
                var minorTicks = axis.getTicks(viewConfig.mode);
                var originOffset = [0, 0];

                var offsetA = {x:0, y:-mt.common.GRAPH_TICK_LENGTH};
                var offsetB = {x:0, y:mt.common.GRAPH_TICK_LENGTH};

                this.drawTicks(gridGroup, minorTicks, axisName + '-minor-grid-line', offsetA, offsetB, isXAxis);
                this.renderAxisArrows(min, max, axisName, isXAxis);

                //in numberline mode render the minor tick marks too
                var labeledTicks = _(minorTicks).filter(function (tick) {
                    return tick.drawLabel === true;
                });

                this.drawTickLabels(labeledTicks, axisName + '-tick-label', originOffset, isXAxis);

                if(axis.fractionMode === mt.common.NUMBERLINE_FRAC_DEC_MODE) {
                    this.drawTickLabels(labeledTicks, axisName + '-tick-label-dec', [0, -40], isXAxis, true);
                } else {
                    this.drawTickLabels([], axisName + '-tick-label-dec', [0, -40], isXAxis, true);
                }

                if(labeledTicks.length > 0 && labeledTicks[0].isFraction) {
                    //filter out ticks with unit denominator
                    var fracTicks = _(labeledTicks).filter(function (tick) {
                        return tick.denom !== 1;
                    });

                    this.drawTickLabelDividers(fracTicks, axisName + '-tick-label-divider', originOffset, isXAxis);
                    this.drawTickLabelDenom(fracTicks, axisName + '-tick-label-denom', originOffset, isXAxis);
                } else {
                    this.drawTickLabelDividers([], axisName + '-tick-label-divider', originOffset, isXAxis);
                    this.drawTickLabelDenom([], axisName + '-tick-label-denom', originOffset, isXAxis);
                }


                this.renderItem(axisLabelGroup, [axis], axisName + '-label', 'svg:text', function (elements, xPos, yPos) {
                    var halfMargin = viewConfig.margin / 2;
                    var x = isXAxis === true ? viewConfig.width - viewConfig.margin : halfMargin;
                    var y = isXAxis === true ? viewConfig.height - halfMargin : halfMargin;
                    var transform = isXAxis === true ? '' : 'rotate(-90 ' + halfMargin + ' ' + halfMargin + ')';

                    elements.text(function (d) { return d.label !== undefined ? d.label.val() : undefined; })
                        .attr('x', x)
                        .attr('y', y)
                        .attr('transform', transform)
                        .attr('text-anchor', 'end');
                });
            };

            this.drawTicks = function (group, ticks, className, offsetA, offsetB, isXAxis) {
                var showGridLines = graphModel.showGridLines;
                this.renderItem(group, ticks, className, 'svg:line', function (elements, xPos, yPos) {
                    function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                    function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                    function getTickClass(d) {
                        var clazz = className;
                        if(showGridLines === false) {
                            clazz += ' ' + mt.common.GRAPH_HIDDEN_CLASS;
                        }
                        if(mt.common.approxEquals(d.val(), 0)) {
                            clazz += ' ' + mt.common.GRAPH_ORIGIN_CLASS;
                        }
                        return clazz;
                    }

                    elements.attr('x1', function (d) { return tickXPos(d.val()) + offsetA.x; })
                        .attr('y1', function (d) { return  tickYPos(d.val()) + offsetA.y; })
                        .attr('x2', function (d) { return tickXPos(d.val()) + offsetB.x; })
                        .attr('y2', function (d) { return tickYPos(d.val()) + offsetB.y; })
                        .attr('class', getTickClass)
                        .attr('stroke', function(d) { return d.drawLabel? '#A8A8A8': (d.color? d.color: '#CDCDCD'); });
                });
            };

            this.drawPartitions = function (axis) {
                var axisName = axis.isXAxis? mt.common.GRAPH_X_AXIS_CLASS: mt.common.GRAPH_Y_AXIS_CLASS;

                var min = axis.isXAxis === true ? axis.min.x: axis.min.y;
                var max = axis.isXAxis === true ? axis.max.x: axis.max.y;

                var partitionTicks = [];

                var verticalOffsets = [-mt.common.GRAPH_TICK_LENGTH*4, mt.common.GRAPH_TICK_LENGTH*3/2];

                for(var iPartition in axis.partitions) {
                    var partition = axis.partitions[iPartition];
                    var ticks = partition.getVisibleTicks(min, max);
                    for(var iTick in ticks) {
                        ticks[iTick].color = partition.color;
                    }
                    partitionTicks = partitionTicks.concat(ticks);
                }

                this.drawTicks(gridGroup, partitionTicks, axisName + '-partition-ticks', {x:0, y:verticalOffsets[1]}, {x:0, y:verticalOffsets[0]}, axis.isXAxis);

                this.drawPartitionBlocks(gridGroup, axis.partitions, axisName + '-partition-block', {x:0, y:verticalOffsets[0]}, {x:0, y:verticalOffsets[1]}, axis.isXAxis);
                this.drawPartitionHandles(axis);
            };

            this.drawPartitionHandles = function (axis) {
                var axisName = axis.isXAxis? mt.common.GRAPH_X_AXIS_CLASS: mt.common.GRAPH_Y_AXIS_CLASS;
                var handles = [];
                for(var i in axis.partitions) {
                    var partition = axis.partitions[i];
                    if(partition.isSelected !== true) {
                        continue;
                    }
                    if(axis.isXAxis) {
                        handles.push({x:partition.getMin().val(), y:0, color: partition.color, xAxis: partition.isXAxis, isMin: true});
                        handles.push({x:partition.getMax().val(), y:0, color: partition.color, xAxis: partition.isXAxis, isMin: false});
                    } else {
                        handles.push({x:0, y:partition.getMin().val(), color: partition.color, xAxis: partition.isXAxis, isMin:true});
                        handles.push({x:0, y:partition.getMax().val(), color: partition.color, xAxis: partition.isXAxis, isMin:false});
                    }
                }

                var height = mt.common.GRAPH_TICK_LENGTH*11/2;
                var width = 10;
                var offset = -mt.common.GRAPH_TICK_LENGTH*5/4;

                var className = axisName + '-partition-handles-round';

                this.renderItem(gridGroup, handles, className, 'svg:rect', function(elements, xPos, yPos) {
                    elements.attr('y', function (d) { return yPos(d.x, d.y, d.xAxis) + offset - height/2; })
                        .attr('x', function (d) {
                            var x = xPos(d.x, d.y, d.xAxis);
                            return d.isMin? x - width: x;
                        })
                        .attr('width', width)
                        .attr('height', height)
                        .attr('fill', function (d) { return d.color;})
                        .attr('rx', 10)
                        .attr('ry', 10)
                        .style('stroke', function (d) { return d.color;})
                        .style('stroke-width', 1);
                });

                className = axisName + '-partition-handles-sqr';

                this.renderItem(gridGroup, handles, className, 'svg:rect', function(elements, xPos, yPos) {
                    elements.attr('y', function (d) { return yPos(d.x, d.y, d.xAxis) + offset - height/2; })
                        .attr('x', function (d) {
                            var x = xPos(d.x, d.y, d.xAxis);
                            return d.isMin? x - width/2: x;
                        })
                        .attr('width', width/2)
                        .attr('height', height)
                        .attr('fill', function (d) { return d.color;})
                        .style('stroke', function (d) { return d.color;})
                        .style('stroke-width', 1);
                });

                className = axisName + '-partition-handles-circle';
                this.renderItem(gridGroup, handles, className, 'svg:circle', function(elements, xPos, yPos) {
                    elements.attr('cy', function (d) { return yPos(d.x, d.y, d.xAxis) + offset; })
                        .attr('cx', function (d) {
                            var x = xPos(d.x, d.y, d.xAxis);
                            return d.isMin? x - width/2: x + width/2;
                        })
                        .attr('r', 3)
                        .attr('fill', 'white');
                });
            };

            this.drawPartitionBlocks = function (group, partitions, className, offsetA, offsetB, isXAxis) {
                this.renderItem(group, partitions, className, 'svg:rect', function (elements, xPos, yPos) {
                    function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                    function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                    elements.attr('x', function (d) { return tickXPos(d.getMin().val()); })
                        .attr('y', function (d) { return tickYPos(d.getMin().val()) + offsetA.y; })
                        .attr('width', function (d) { return tickXPos(d.getMax().val()) - tickXPos(d.getMin().val()); })
                        .attr('height', offsetB.y - offsetA.y)
                        .attr('fill', function (d) { return d.color;})
                        .attr('id', function (d) { return d.id; })
                        .style('stroke', function (d) { return d.color;})
                        .style('stroke-width', 1);
                });
            };

            this.drawTickLabels = function (ticks, className, originOffset, isXAxis, forceDecimal) {
                var showAxes = graphModel.showAxes;
                var offset = [0, mt.common.GRAPH_TICK_LENGTH*3];

                this.renderItem(tickLabelGroup, ticks, className, 'svg:text', function (elements, xPos, yPos) {
                    function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                    function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                    elements.text(function (d) { return (forceDecimal !== true && d.isFraction)? d.num: d.toString({forceDecimal:forceDecimal}); })
                        .attr('x', function (d) {
                            return tickXPos(d.val()) + offset[0] - originOffset[0];
                        })
                        .attr('y', function (d) {
                            return tickYPos(d.val()) + offset[1] - originOffset[1];
                        })
                        .attr('class', function(d) { return showAxes ? className : className + ' ' + mt.common.GRAPH_HIDDEN_CLASS;})
                        .attr('text-anchor', 'middle');
                });
            };

            this.drawTickLabelDividers = function (ticks, className, originPos, isXAxis) {
                var length = 10;
                var vertOffset = 2;

                var offset = [0, mt.common.GRAPH_TICK_LENGTH*3 + vertOffset];

                this.renderItem(tickLabelGroup, ticks, className, 'svg:line', function (elements, xPos, yPos) {
                    function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                    function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                    elements.attr('x1', function (d) { return tickXPos(d.val()) + offset[0] - length/2;})
                        .attr('y1', function (d) { return tickYPos(d.val()) + offset[1];})
                        .attr('x2', function (d) { return tickXPos(d.val()) + offset[0] + length/2;})
                        .attr('y2', function (d) { return tickYPos(d.val()) + offset[1];});
                });
            };

            this.drawTickLabelDenom = function (ticks, className, originPos, isXAxis) {
                var offset = [0, mt.common.GRAPH_TICK_LENGTH*3 + 15];

                this.renderItem(tickLabelGroup, ticks, className, 'svg:text', function (elements, xPos, yPos) {
                    function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                    function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                    elements.text(function (d) { return d.denom; })
                        .attr('x', function (d) {
                            return tickXPos(d.val()) + offset[0];
                        })
                        .attr('y', function (d) {
                            return tickYPos(d.val()) + offset[1];
                        })
                        .attr('text-anchor', 'middle');
                });
            };

            this.renderPoints = function (points) {
                points = _(points).filter(function (point) {
                    return !point.isHidden;
                });

                var showPointLabels = graphModel.showPointLabels;
                this.renderPointLabels(points, showPointLabels);

                var clazz = mt.common.GRAPH_POINT_CLASS;
                this.renderItem(pointGroup, points, clazz, 'svg:circle', function(elements, xPos, yPos) {
                    elements.attr('cy', function (d) { return yPos(d.x.val(), d.y.val(), d.xAxis); })
                        .attr('cx', function (d) { return xPos(d.x.val(), d.y.val(), d.xAxis); })
                        .attr('r', function (d) {
                            var pointRadius = mt.common.GRAPH_POINT_RADIUS;
                            if (d.isSelected) {
                                pointRadius = mt.common.GRAPH_SELECTED_POINT_RADIUS;
                            }
                            return pointRadius;
                        })
                        .attr('class', function (d) {
                            return d.isSelected? mt.common.GRAPH_POINT_CLASS + ' ' + mt.common.GRAPH_SELECTED_CLASS: mt.common.GRAPH_POINT_CLASS;
                        });
                }, true);

                //inner point (for selected points only)
                var innerPointClass = mt.common.GRAPH_POINT_CLASS + '-inner';
                this.renderItem(pointGroup, points, innerPointClass, 'svg:circle', function(elements, xPos, yPos) {
                    elements.attr('cy', function (d) { return yPos(d.x.val(), d.y.val(), d.xAxis); })
                        .attr('cx', function (d) { return xPos(d.x.val(), d.y.val(), d.xAxis); })
                        .attr('class', function (d) {
                            return d.isSelected? innerPointClass: innerPointClass + ' ' + mt.common.GRAPH_HIDDEN_CLASS;
                        })
                        .attr('r', 8);
                }, true);
            };

            this.renderPointLabels = function (points, showLabels) {
                var mode = viewConfig.mode;
                var labelOffset =  -24;

                var textClazz = mt.common.GRAPH_POINT_LABEL_CLASS;

                this.renderItem(pointGroup, points, textClazz, 'svg:text', function(elements, xPos, yPos) {
                    elements.attr('text-anchor', 'middle')
                        .attr('x', function (d) {
                            return xPos(d.x.val(), d.y.val(), d.xAxis);
                        })
                        .attr('y', function (d) {
                            return yPos(d.x.val(), d.y.val(), d.xAxis) + labelOffset;
                        })
                        .attr('class', function (d) {
                            return d.isSelected === true || showLabels === true ? mt.common.GRAPH_POINT_LABEL_CLASS : mt.common.GRAPH_POINT_LABEL_CLASS + ' ' + mt.common.GRAPH_HIDDEN_CLASS;
                        })
                        .text(function (d) {
                            return d.coordinateLabel(mode, {displayMixedFraction: false, forceFraction: false});
                        });
                }, true);

                //point label stem and box rendering
                var stemHeight = 3;
                var stemWidth = 8;
                var stemOffset = -18;
                var stemClass = mt.common.GRAPH_POINT_LABEL_CLASS + '-stem';
                var boxClass = mt.common.GRAPH_POINT_LABEL_CLASS + '-box';
                var pointsWithLabels = showLabels? _.filter(points, function(point) { return point.coordinateLabel(mode) !== '';}) : [];
                var charWidth = 10;

                this.renderItem(pointLabelStemGroup, pointsWithLabels, stemClass, 'svg:rect', function(elements, xPos, yPos) {
                    elements.attr('x', function (d) {
                        return xPos(d.x.val(), d.y.val(), d.xAxis) - stemWidth/2;
                    })
                    .attr('y', function (d) {
                        return yPos(d.x.val(), d.y.val(), d.xAxis) + stemOffset;
                    })
                    .attr('width', stemWidth)
                    .attr('height', stemHeight)
                    .attr('class', function (d) {
                        return d.isSelected === true ? stemClass + ' ' + mt.common.GRAPH_SELECTED_CLASS: stemClass;
                    });
                }, true);

                var boxHeight = 20;
                var boxMargin = 5;
                var boxOffset = labelOffset - 15;
                this.renderItem(pointLabelStemGroup, pointsWithLabels, boxClass, 'svg:rect', function(elements, xPos, yPos) {
                    elements.attr('x', function (d) {
                        return xPos(d.x.val(), d.y.val(), d.xAxis) - d.coordinateLabel(mode).length*charWidth/2 - boxMargin;
                    })
                    .attr('y', function (d) {
                        return yPos(d.x.val(), d.y.val(), d.xAxis) + boxOffset;
                    })
                    .attr('width', function(d) {return d.coordinateLabel(mode).length*charWidth + boxMargin*2;})
                    .attr('height', boxHeight)
                    .attr('rx', 2)
                    .attr('ry', 2)
                    .attr('class', function (d) {
                        return d.isSelected === true ? boxClass + ' ' + mt.common.GRAPH_SELECTED_CLASS: boxClass;
                    });
                }, true);
            };

            this.renderLines = function (lines) {
                //don't draw lines in single numberline mode
                if(viewConfig.isDouble === false) {
                    lines = [];
                }
                lines = _(lines).filter(function (line) {
                    return !line.isHidden();
                });
                this.drawLines(lineGroup, lines, 'mt-line-segment');
            };

            this.renderAxisArrows = function (startPos, endPos, axisName, isXAxis) {
                //render the line from axis min to axis max - graph space coordinates
                var arrowName = axisName + '-arrow';
                var showAxes = graphModel.showAxes;
                var arrowLines = this.getArrowData(startPos, endPos);
                arrowLines = arrowLines.concat(this.getArrowData(endPos, startPos));

                var line = d3.svg.line()
                    .x(function(d) { return d[0]; })
                    .y(function(d) { return d[1]; });

                this.renderItem(axisGroup, arrowLines, arrowName, 'svg:path', function(elements) {
                    elements.attr('d', line).attr('fill', 'none')
                        .attr('class', function (d) { return showAxes ? arrowName : arrowName + ' ' + mt.common.GRAPH_HIDDEN_CLASS;});
                });
            };
        }

        return NumberlineRenderer;
    }());
})(window.mt.numberline);

(function(ns){
    
    'use strict';

    ns.PercentBarGestureHandler = (function(){
        function PercentBarGestureHandler(graphModel, viewConfig, updateCallback, selectionApi){
            var touchSize = mt.common.TOUCH_SIZE;
            this.graphModel = graphModel;
            this.viewConfig = viewConfig;
            this.update = updateCallback;

            this.pointSetId = undefined;
            this.partitioningMode = false;
            this.snappingMode = mt.common.GRAPH_SNAP_MODE;
            mt.common.GestureHandler.call(this, graphModel, updateCallback, selectionApi);
            var self = this;

            //register selectors
            this.registerSelection(function(posX, posY) {
                var lineY = self.viewConfig.transformToPos(self.graphModel.axes.y.min.x.val(), self.graphModel.axes.y.min.y.val(), false)[1];
                var foundObj = self.graphModel.getPercentTextObj(posX, posY, lineY);
                self.percentMathMenuPoint = foundObj;
                if (foundObj !== undefined && foundObj.partition !== undefined) {
                    foundObj = foundObj.partition;
                    self.percentMathMenuPartition = foundObj;
                    self.percentMathMenuPoint = undefined;
                }
                var top = posY < lineY;
                var percentMode = self.graphModel.percentBarMode;
                if (foundObj !== undefined) {
                    var positionVal = 0;
                    if (foundObj.y !== undefined) {
                        positionVal = foundObj.y.val();
                    } else if (foundObj.max !== undefined) {
                        positionVal = foundObj.max.val();
                    }
                    if (positionVal === 100) {
                        percentMode = mt.common.PERCENT_BAR_MODE_PERCENT;
                    }
                    if ((top && (percentMode === mt.common.PERCENT_BAR_MODE_PERCENT || percentMode === mt.common.PERCENT_BAR_MODE_NONE)) ||
                        (!top && (percentMode === mt.common.PERCENT_BAR_MODE_VALUE || percentMode === mt.common.PERCENT_BAR_MODE_NONE))) {
                        self.setKeypadVisible(true, foundObj, top);
                    } else {
                        if(self.selectedIsPrime(foundObj)) {
                            self.togglePercentMath(posX);
                        }
                    }
                }
                return foundObj;
            });

            this.registerSelection(function(posX, posY) {
                return self.getPointAtPos(posX, posY);
            });

            this.registerSelection(function(posX, posY) {
                var val = viewConfig.transformToGraph(posX, posY);
                var isXAxis = viewConfig.isXAxis(posY);
                var axisVal = isXAxis? val[0]: val[1];
                return graphModel.getPartionedRangeAtPoint(axisVal, isXAxis, true);
            });

            //register taps
            this.registerTap(function(posX, posY) {
                var point = self.createPointAtPos(posX, posY);
                //go back to default mode
                self.setMode();
                return point;
            }, ns.ADD_POINT_MODE);

            this.registerTap(function(posX, posY) {
                var stackObj;
                if (self.stackMode.type === mt.common.GRAPH_TYPE_POINT) {
                    stackObj = new mt.common.Point({
                        x: new mt.common.MtValue(0, 1, false),
                        y: self.stackMode.end.copy(),
                        xAxis: false
                    });
                    graphModel.addPoint(stackObj);
                } else if (self.stackMode.type === mt.common.GRAPH_TYPE_PARTITION) {
                    stackObj = graphModel.addPartitionedRange(false, new mt.common.MtValue(0, 1, false), self.stackMode.end.copy(), 1);
                    orderPartitionRanges();
                }
                var copyDiff = self.stackMode.end.copy().subtract(self.stackMode.start);
                self.stackMode.start.add(copyDiff);
                self.stackMode.end.add(copyDiff);
                self.resizePercentBarByVal(self.stackMode.start.val());
                self.update(true, true);
                return stackObj;
            }, ns.PERCENT_BAR_DUPLICATE);

            function getYPos(point) {
                return point.xAxis ? viewConfig.height * 3 / 4 : viewConfig.height * 1/4;
            }

            //register drags
            //point drag
            var draggingPoint;
            this.registerDrag(function dragStart(posX, posY) {
                draggingPoint = self.getPointAtPos(posX, posY);
                if(draggingPoint !== undefined) {
                    if(draggingPoint.isSelected !== true) {
                        draggingPoint = undefined;
                        return false;
                    }
                    updateCallback(false);
                    return true;
                }
                return false;
            }, function drag(posX) {
                if(draggingPoint === undefined) {
                    return false;
                }
                var posY = getYPos(draggingPoint);

                var prevVal = [draggingPoint.x.val(), draggingPoint.y.val()];
                var newVal = viewConfig.transformToGraph(posX, posY);

                if(draggingPoint.xAxis === true) {
                    draggingPoint.x.setVal(newVal[0]);
                } else {
                    draggingPoint.y.setVal(newVal[1]);
                }

                //update if the point moved
                if (prevVal[0] !== newVal[0] || prevVal[1] !== newVal[1]) {
                    updateCallback(false);
                }
                draggingPoint.numberLinePointLabel = '';
                draggingPoint.numberLinePercentLabel = '';
                if (draggingPoint.partition !== undefined) {
                    draggingPoint.partition.numberLinePointLabel = '';
                    draggingPoint.partition.numberLinePercentLabel = '';
                }
                self.resizePercentBarByVal(self.viewConfig.xScale.invert(posX));
                return true;
            }, function dragEnd() {
                if(draggingPoint === undefined) {
                    return false;
                }
                //snap point to ticks
                if (draggingPoint.xAxis === true) {
                    var tickX = self.getNearestTick(draggingPoint.x.val(), true);
                    draggingPoint.x.setVal(tickX.val());
                } else {
                    var tickY = self.getNearestTick(draggingPoint.y.val(), false);
                    draggingPoint.y.setVal(tickY.val());
                }
                self.resizePercentBarByVal(Math.ceil(self.graphModel.axes.y.max.y.val()));
                draggedObject();
                draggingPoint = undefined;
                updateCallback(false);
                updateCallback(false);//double for overlayed numbers
                return true;
            });

            var partitionMax;
            //partition creation
            this.registerDrag(function dragStart(posX, posY) {
                partitionMax = self.addPartitionedRangeAtPos(posX, posY);
                partitionMax.setMin(0);
                self.selectObject(partitionMax);
                return true;
            }, function drag(posX, posY) {
                dragPartition(partitionMax, posX, posY, true);
                self.resizePercentBarByVal(self.viewConfig.xScale.invert(posX));
                return true;
            }, function dragEnd() {
                self.resizePercentBarByVal(Math.ceil(self.graphModel.axes.y.max.y.val()));
                self.togglePartitioning();
                snapPartition(partitionMax, true);
                partitionMax.checkMinMax();
                updateCallback(false);
                draggedObject();
                partitionMax = undefined;
                return true;
            }, mt.common.GESTURE_MODE_PARTITION);

            //partition drag max
            this.registerDrag(function dragStart(posX, posY) {
                partitionMax = self.getPartitionedRangeHandleAtPos(posX, posY, true);
                if(partitionMax === undefined) {
                    return false;
                }
                return true;
            }, function drag(posX, posY) {
                if(partitionMax === undefined) {
                    return false;
                }
                dragPartition(partitionMax, posX, posY, true);
                self.resizePercentBarByVal(self.viewConfig.xScale.invert(posX));
                return true;
            }, function dragEnd() {
                self.resizePercentBarByVal(Math.ceil(self.graphModel.axes.y.max.y.val()));
                if(partitionMax === undefined) {
                    return false;
                }
                snapPartition(partitionMax, true);
                draggedObject();
                partitionMax = undefined;
                return true;
            });


            var viewResizing = false;
            this.registerDrag(function dragStart(posX, posY) {
                if (posX > self.viewConfig.width - self.viewConfig.margin) {
                    viewResizing = true;
                    return true;
                }
                return false;
            }, function drag(posX, posY) {
                if (viewResizing) {
                    self.viewConfig.width = posX + (self.viewConfig.margin / 2);
                    if (self.viewConfig.width < mt.common.PERCENT_BAR_MIN_WIDTH) {
                        self.viewConfig.width = mt.common.PERCENT_BAR_MIN_WIDTH;
                    }
                    self.update(true, true);
                    return true;
                }
                return false;
            }, function dragEnd() {
                if (viewResizing) {
                    if (self.viewConfig.width < mt.common.PERCENT_BAR_MIN_WIDTH) {
                        self.viewConfig.width = mt.common.PERCENT_BAR_MIN_WIDTH;
                    }
                    viewResizing = false;
                    self.update(true);
                    return true;
                }
                return false;
            });


            this.registerDrag(function dragStart(posX, posY) {
                return self.zoomPercentBarFromDrag(posX);
            }, function drag(posX, posY) {
                return self.zoomPercentBarFromDrag(posX);
            }, function dragEnd() {
                self.setMode();
                return true;
            }, ns.PERCENT_BAR_ZOOM);


            this.togglePartitioning = function (val) {
                if(val === false || self.mode === mt.common.GESTURE_MODE_PARTITION) {
                    self.setMode();
                } else {
                    self.setMode(mt.common.GESTURE_MODE_PARTITION);
                }
            };

            this.toggleAddPointMode = function (val) {
                if(val === false || self.mode === ns.ADD_POINT_MODE) {
                    self.setMode();
                } else {
                    self.setMode(ns.ADD_POINT_MODE);
                }
            };

            this.toggleDuplicate = function (val) {
                if(val === false || self.mode === ns.PERCENT_BAR_DUPLICATE) {
                    self.setMode();
                    self.stackMode = undefined;
                } else {
                    self.startStacking();
                    self.setMode(ns.PERCENT_BAR_DUPLICATE);
                }
            };

            this.toggleZoom = function (val) {
                if(val === false || self.mode === ns.PERCENT_BAR_ZOOM) {
                    self.setMode();
                } else {
                    self.setMode(ns.PERCENT_BAR_ZOOM);
                }
            };

            this.startStacking = function() {
                var selected = selectionApi.getSelection();
                if (selected === undefined) {
                    return;
                }
                var selectedObj = selected.modelObject;
                if (selected.type === 'point type') {
                    this.stackMode = {
                        type: mt.common.GRAPH_TYPE_POINT,
                        start: new mt.common.MtValue(selectedObj.y.val(), 1, false),
                        end: new mt.common.MtValue(selectedObj.y.val() * 2, 1, false)
                    };
                } else if (selected.type === 'partition type') {
                    this.stackMode = {
                        type: mt.common.GRAPH_TYPE_PARTITION,
                        start: new mt.common.MtValue(selectedObj.max.val(), 1, false),
                        end: new mt.common.MtValue(selectedObj.max.val() * 2, 1, false)
                    };
                }
            };

            this.createPointAtPos = function(posX, posY) {
                var val = viewConfig.transformToGraph(posX, posY);
                var tickValX = self.getNearestTick(val[0], true);
                var tickValY = self.getNearestTick(val[1], false);

                var isXAxis = viewConfig.isXAxis(posY);
                if (isXAxis === true) {
                    tickValY = new mt.common.MtValue(0, 1, false);
                } else if (isXAxis === false) {
                    tickValX = new mt.common.MtValue(0, 1, false);
                }
                var point = new mt.common.Point({x: tickValX, y: tickValY, xAxis: isXAxis});
                graphModel.addPoint(point);
                updateCallback(false);
                return point;
            };

            function dragPartition(partition, posX, posY, isMax) {
                var newVal = viewConfig.transformToGraph(posX, posY);
                var newAxisVal = partition.isXAxis ? newVal[0]: newVal[1];
                partition.numberLinePointLabel = '';
                partition.numberLinePercentLabel = '';
                setPartitionVal(partition, newAxisVal, isMax);
                orderPartitionRanges();
            }

            function draggedObject() {
                if (partitionMax !== undefined) {
                    partitionMax.numberLinePointLabel = '';
                    partitionMax.numberLinePercentLabel = '';
                }
                if (draggingPoint !== undefined) {
                    draggingPoint.numberLinePointLabel = '';
                    draggingPoint.numberLinePercentLabel = '';
                }
            }

            function snapPartition(partition, isMax) {
                var curVal = isMax? partition.max.val(): partition.min.val();
                var snappedVal = self.getNearestTick(curVal, partition.isXAxis, partition);
                setPartitionVal(partition, snappedVal.val(), isMax);
            }

            function setPartitionVal(partition, newVal, isMax) {
                if(isMax) {
                    partition.setMax(newVal);
                } else {
                    partition.setMin(newVal);
                }
                if (partition.getRange() === 0) {
                    self.graphModel.removePartitionedRange(partition);

                    self.deselect();
                    self.togglePartitioning(false);
                }
                updateCallback(false);
            }

            this.hideShading = function (partition) {
                if(partition === undefined) {
                    partition = self.selectedPartition;
                }
                self.selectedPartition = partition;
                var newPoint = new mt.common.Point({
                    x: 0,
                    y: partition.max.val(),
                    xAxis: partition.isXAxis,
                    numberLinePointLabel: partition.numberLinePointLabel,
                    numberLinePercentLabel: partition.numberLinePercentLabel
                });
                //calculate partition position in numberline pos space
                self.deleteSelectedPartition();
                self.graphModel.addPoint(newPoint);
                self.selectedPartition = undefined;
                self.deselect();
                self.update(false);
            };

            this.deleteSelectedPartition = function () {
                self.graphModel.removePartitionedRange(this.selectedPartition);
                self.setMode();
                self.update(false);
            };

            this.getPointAtPos = function (posX, posY, touchSize) {
                if (touchSize === undefined) {
                    touchSize = mt.common.TOUCH_SIZE;
                }
                var val = self.viewConfig.transformToGraph(posX, posY);
                var isXAxis = self.viewConfig.isXAxis(posY);

                var points = self.graphModel.findNearestPoints(val[0], val[1], isXAxis);

                var clickedPoint;
                if (points.length >= 1) {
                    var point = points[0];
                    //get point position in screen coords to check the point is within the selection range
                    var pointPos = self.viewConfig.transformToPos(point.x.val(), point.y.val(), isXAxis);
                    var distSq = (pointPos[0] - posX) * (pointPos[0] - posX) + (pointPos[1] - posY) * (pointPos[1] - posY);
                    if (distSq < touchSize * touchSize / 4) {
                        clickedPoint = point;
                    }
                }

                return clickedPoint;
            };

            this.addPartitionedRangeAtPos = function (posX, posY) {
                var val = self.viewConfig.transformToGraph(posX, posY);

                var startVal;
                var isXAxis = self.viewConfig.isXAxis(posY);
                if (isXAxis === true) {
                    startVal = self.getNearestTick(val[0], true);
                } else if (isXAxis === false) {
                    startVal = self.getNearestTick(val[1], false);
                }

                //create and add the partition
                var partition = self.graphModel.addPartitionedRange(isXAxis, startVal, startVal, 1);
                partition.isPrime = true;
                orderPartitionRanges();
                return partition;
            };

            this.getNearestTick = function (val, isXAxis, excludedPartition) {
                var axis;
                if(isXAxis) {
                    axis = self.graphModel.axes.x;
                } else {
                    axis = self.graphModel.axes.y;
                }
                var tickVal = axis.getNearestTick(val, self.snappingMode, excludedPartition);

                if(self.snappingMode === mt.common.GRAPH_PROXIMITY_SNAP) {
                    var tickPos, valPos;
                    //compare 1d position of tick and value to determine whether to snap;
                    if(isXAxis) {
                        tickPos = self.viewConfig.transformToPos(tickVal.val(), 0, isXAxis);
                        valPos = self.viewConfig.transformToPos(val, 0, isXAxis);
                    } else {
                        tickPos = self.viewConfig.transformToPos(0, tickVal.val(), isXAxis);
                        valPos = self.viewConfig.transformToPos(0, val, isXAxis);
                    }
                    var snapDistSq = (tickPos[0]-valPos[0])*(tickPos[0]-valPos[0]) + (tickPos[1]-valPos[1])*(tickPos[1]-valPos[1]);
                    if(snapDistSq > mt.common.GRAPH_SNAP_THRESHOLD*mt.common.GRAPH_SNAP_THRESHOLD) {
                        tickVal = new mt.common.MtValue(val);
                    }
                }

                return tickVal;
            };

            this.resizePercentBarByVal = function (val) {
                if (val > self.graphModel.axes.y.max.y.val()) {
                    self.viewConfig.width = self.viewConfig.xScale(val) + self.viewConfig.margin;
                    self.graphModel.setPercentZoom(val);
                    self.graphModel.maxPercentLabel = '';
                    self.update(true, true);
                }
            };

            this.togglePercentBarTransparentMode = function() {
                if (self.graphModel.transparentMode === undefined) {
                    self.graphModel.transparentMode = false;
                }
                self.graphModel.transparentMode = !self.graphModel.transparentMode;
            };


            this.unzoomPercentBar = function() {
                self.graphModel.setPercentZoom(self.graphModel.hundredPercentValue);
                if (self.viewConfig.realWidth !== undefined) {
                    self.viewConfig.width = self.viewConfig.realWidth;
                }
                self.update();
            };

            this.resetPercentBar = function() {
                self.graphModel.points.length = 0;
                self.graphModel.axes.y.partitions.length = 0;
                self.graphModel.hundredPercentLabel = '';
                self.unzoomPercentBar();
            };


            this.zoomPercentBarFromDrag = function(newX) {
                var oldX;

                var selected = selectionApi.getSelection();
                if (selected === undefined) {
                    return false;
                }
                var selectedObj = selected.modelObject;
                if (selected.type === 'point type') {
                    oldX = self.viewConfig.xScale(selectedObj.y.val());
                } else if (selected.type === 'partition type') {
                    oldX = self.viewConfig.xScale(selectedObj.max.val());
                } else {
                    self.setMode();
                    return;
                }
                self.viewConfig.width = ((newX - self.viewConfig.margin) / (oldX - self.viewConfig.margin)) * self.viewConfig.width;
                if (self.viewConfig.width < mt.common.PERCENT_BAR_MIN_WIDTH) {
                    self.viewConfig.width = mt.common.PERCENT_BAR_MIN_WIDTH;
                }
                self.update(true, true);
                return true;
            };

            function orderPartitionRanges() {
                var partitions = self.graphModel.axes.y.partitions;
                partitions.sort(function(a, b){
                    return b.getRange() - a.getRange();
                });
            }

            this.operatorPercentBar = function(fromValue, byAmount, multiply) {
                for (var i = 1; i < byAmount; i++) {
                    var divideBy = (multiply) ? 1 : byAmount;
                    var multiplyBy = (multiply) ? i + 1 : i;
                    var point = new mt.common.Point({
                        x: new mt.common.MtValue(0, 1, false),
                        y: new mt.common.MtValue((fromValue / divideBy) * multiplyBy, 1, false),
                        xAxis: false
                    });
                    this.graphModel.addPoint(point);
                    this.resizePercentBarByVal(point.y.val());
                }
                this.update();
            };
            this.getPartitionedRangeHandleAtPos = function(posX, posY, max) {
                var val = viewConfig.transformToGraph(posX, posY);

                var isXAxis = viewConfig.isXAxis(posY);
                var axisVal = isXAxis? val[0]: val[1];

                var partition = graphModel.findNearestPartitionedRange(axisVal, isXAxis, max);
                if(partition !== undefined && partition.isSelected !== true) {
                    partition = undefined;
                }
                var clickedPartition;
                if (partition !== undefined) {
                    var handleVal = max? partition.max: partition.min;
                    var pointVal = isXAxis? [handleVal.val(), 0]: [0, handleVal.val()];
                    //get point position in screen coords to check the point is within the selection range
                    var pointPos = viewConfig.transformToPos(pointVal[0], pointVal[1], isXAxis);
                    var distSq = (pointPos[0] - posX) * (pointPos[0] - posX);// JMT only test x dist?? + (pointPos[1] - posY) * (pointPos[1] - posY);
                    if (distSq < touchSize * touchSize / 4) {
                        clickedPartition = partition;
                    }
                }
                return clickedPartition;
            };
            this.selectedIsPrime = function (obj) {
                if (obj === undefined) {
                    var selection = selectionApi.getSelection();
                    if (selection === undefined) {
                        return false;
                    }
                    obj = selection.modelObject;
                }
                if (obj.y !== undefined) {
                    if (obj.y.val() === 100 || obj.y.val() === this.graphModel.axes.y.max.y.val()) {
                        return true;
                    }
                }
                return this.isAPoint(obj) || obj.isPrime === true;
            };
            this.isAPoint = function(obj) {
                return this.graphModel.points.indexOf(obj) !== -1;
            };
        }
        return PercentBarGestureHandler;
    }());
})(window.mt.numberline);

 (function(ns){

    'use strict';

    //percentbar specific d3 (svg) renderer
    ns.PercentBarRenderer = (function(){
        function PercentBarRenderer(containerElement, graphModel, viewConfig, toolId){
            //call the base renderer
            mt.common.BaseRenderer.call(this, containerElement, viewConfig, toolId);

            //create the groups
            var gridGroup = this.appendGroup();
            var axisGroup = this.appendGroup();
            var tickLabelGroup = this.appendGroup();
            var pointGroup = this.appendGroup();
            this.graphModel = graphModel;

            // main render function
            this.render = function(updateAxes){
                this.renderedPoints = [];
                if (updateAxes) {
                    this.removeFromSVG(gridGroup);
                    this.removeFromSVG(axisGroup);
                    this.removeFromSVG(tickLabelGroup);
                    this.removeFromSVG(pointGroup);
                }
                graphModel.resetPercentBarTextCalc();
                viewConfig.update(graphModel.axes.x.min.x.val(), graphModel.axes.x.max.x.val(),
                    graphModel.axes.y.min.y.val(), graphModel.axes.y.max.y.val());

                this.renderPercentBar(graphModel.axes.y, false);

                var allPoints = graphModel.points;

                var options = {};

                this.renderPoints(allPoints, options);

                this.drawPartitions(graphModel.axes.y);
            };

            this.addPointToRenderedPointList = function(point) {
                if (this.renderedPoints === undefined) {
                    this.renderedPoints = [];
                }
                for(var p in this.renderedPoints) {
                    var renderedPoint = this.renderedPoints[p];
                    if (Math.abs(renderedPoint.y.val() - point.y.val()) < 1e-14) {
                        var pointLabel = renderedPoint.numberLinePointLabel;
                        if ((pointLabel === undefined || pointLabel === '') && renderedPoint.partition !== undefined) {
                            pointLabel = renderedPoint.partition.numberLinePointLabel;
                        }
                        if (pointLabel === undefined || pointLabel === '') {
                            pointLabel = point.numberLinePointLabel;
                        }
                        if ((pointLabel === undefined || pointLabel === '') && point.partition !== undefined) {
                            pointLabel = point.partition.numberLinePointLabel;
                        }
                        point.numberLinePointLabel = pointLabel;
                        renderedPoint.numberLinePointLabel = pointLabel;
                        if (renderedPoint.partition !== undefined) {
                            renderedPoint.partition.numberLinePointLabel = pointLabel;
                        }
                        if (point.partition !== undefined) {
                            point.partition.numberLinePointLabel = pointLabel;
                        }

                        pointLabel = renderedPoint.numberLinePercentLabel;
                        if ((pointLabel === undefined || pointLabel === '') && renderedPoint.partition !== undefined) {
                            pointLabel = renderedPoint.partition.numberLinePercentLabel;
                        }
                        if (pointLabel === undefined || pointLabel === '') {
                            pointLabel = point.numberLinePercentLabel;
                        }
                        if ((pointLabel === undefined || pointLabel === '') && point.partition !== undefined) {
                            pointLabel = point.partition.numberLinePercentLabel;
                        }
                        point.numberLinePercentLabel = pointLabel;
                        renderedPoint.numberLinePercentLabel = pointLabel;
                        if (renderedPoint.partition !== undefined) {
                            renderedPoint.partition.numberLinePercentLabel = pointLabel;
                        }
                        if (point.partition !== undefined) {
                            point.partition.numberLinePercentLabel = pointLabel;
                        }
                        return false;
                    }
                }
                this.renderedPoints.push(point);
                return true;
            };

            this.renderPercentBar = function (axis, isXAxis){
                //render the line from axis min to axis max - graph space coordinates
                var axisName = mt.common.GRAPH_Y_AXIS_CLASS;

                var showAxes = graphModel.showAxes;

                var min = viewConfig.transformToPos(axis.min.x.val(), axis.min.y.val(), isXAxis);
                var max = viewConfig.transformToPos(axis.max.x.val(), axis.max.y.val(), isXAxis);
                this.renderItem(axisGroup, [axis], axisName, 'svg:rect', function(elements, xPos, yPos) {
                    elements.attr('x', function (d) { return min[0]; })
                        .attr('y', function (d) { return min[1] - (mt.common.PERCENT_BAR_HEIGHT / 2); })
                        .attr('width', function (d) { return max[0] - min[0]; })
                        .attr('height', function (d) { return mt.common.PERCENT_BAR_HEIGHT; })
                        .attr('class', function(d) { return showAxes ? axisName : axisName + ' ' + mt.common.GRAPH_HIDDEN_CLASS;})
                        .style('stroke', mt.common.GRAPH_AXIS_COLOR)
                        .style('fill', 'none')
                        .style('stroke-width', mt.common.GRAPH_AXIS_WIDTH);
                }, false);

                var originOffset = [0, 0];
                var percentBarTicks = [
                    new mt.common.Point({
                        x: 0,
                        y: 0,
                        numberLinePointLabel: '0',
                        numberLinePercentLabel: '0%'
                    }),
                    new mt.common.Point({
                        x: 0,
                        y: axis.max.y.val(),
                        numberLinePointLabel: ((graphModel.maxPercentLabel !== undefined) ? graphModel.maxPercentLabel : ''),
                        numberLinePercentLabel: toFixedDown(axis.max.y.val()) + '%'
                    })
                ];
                percentBarTicks[1].isMaxPercentLabel = true;

                var pointsToRender = [];
                for (var p in percentBarTicks) {
                    var point = percentBarTicks[p];
                    if (point.y.val() !== 100 && this.addPointToRenderedPointList(point) === true) {
                        pointsToRender.push(point);
                    }
                }

                this.drawPercentTickLabels(pointsToRender, axisName + '-tick-label', originOffset, isXAxis);

                this.renderHundredPercentPoint();
            };

            this.renderHundredPercentPoint = function(){
                var clipId = '';
                var originOffset = [0, 0];
                var points = [];
                var hundredPoint = new mt.common.Point({
                    x: 0,
                    y: 100,
                    xAxis: false,
                    numberLinePointLabel: ((graphModel.hundredPercentLabel !== undefined) ? graphModel.hundredPercentLabel : ''),
                    numberLinePercentLabel: '100%'
                });
                hundredPoint.isHundredLabel = true;
                points.push(hundredPoint);

                this.renderItem(pointGroup, points, 'mt-perm-point', 'svg:line', function(elements, xPos, yPos) {
                    elements.attr('y1', function (d) { return yPos(d.x.val(), d.y.val(), d.xAxis) - (mt.common.PERCENT_BAR_HEIGHT / 2); })
                        .attr('y2', function (d) { return yPos(d.x.val(), d.y.val(), d.xAxis) + (mt.common.PERCENT_BAR_HEIGHT / 2); })
                        .attr('x1', function (d) { return xPos(d.x.val(), d.y.val(), d.xAxis); })
                        .attr('x2', function (d) { return xPos(d.x.val(), d.y.val(), d.xAxis); })
                        .style('stroke', 'rgb(0,0,0)')
                        .style('stroke-width', function (d) { return d.isSelected === true ? mt.common.PERCENT_BAR_POINT_WIDTH_SELECTED : mt.common.PERCENT_BAR_POINT_WIDTH;})
                        .attr('clip-path', 'url(#' + clipId + ')');
                });
                
                var pointsToRender = [];
                for (var p in points) {
                    var point = points[p];
                    if (this.addPointToRenderedPointList(point) === true) {
                        pointsToRender.push(point);
                    }
                }

                this.drawPercentTickLabels(pointsToRender, mt.common.GRAPH_POINT_LABEL_CLASS + '-perm-percent', originOffset, false, undefined, mt.common.PERCENT_BAR_MODE_PERCENT);
            };

            this.drawTicks = function (group, ticks, className, offsetA, offsetB, isXAxis) {
                var showGridLines = graphModel.showGridLines;
                this.renderItem(group, ticks, className, 'svg:line', function (elements, xPos, yPos) {
                    function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                    function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                    elements.attr('x1', function (d) { return tickXPos(d.val()) + offsetA.x; })
                        .attr('y1', function (d) { return  tickYPos(d.val()) + offsetA.y; })
                        .attr('x2', function (d) { return tickXPos(d.val()) + offsetB.x; })
                        .attr('y2', function (d) { return tickYPos(d.val()) + offsetB.y; })
                        .attr('class', function(d) { return showGridLines ? className : className + ' ' + mt.common.GRAPH_HIDDEN_CLASS; })
                        .attr('stroke', function(d) { return d.drawLabel? '#A8A8A8': (d.color? d.color: '#CDCDCD'); });
                });
            };

            this.drawPartitions = function (axis) {
                var axisName = axis.isXAxis? mt.common.GRAPH_X_AXIS_CLASS: mt.common.GRAPH_Y_AXIS_CLASS;

                var min = axis.isXAxis === true ? axis.min.x: axis.min.y;
                var max = axis.isXAxis === true ? axis.max.x: axis.max.y;

                var partitionTicks = [];

                var yOffset = mt.common.GRAPH_TICK_LENGTH*4;

                for(var iPartition in axis.partitions) {
                    var partition = axis.partitions[iPartition];
                    var ticks = [];
                    
                    ticks = partition.getVisibleTicks(min, max);
                    for(var iTick in ticks) {
                        ticks[iTick].color = partition.color;
                    }
                    partitionTicks = partitionTicks.concat(ticks);
                }
                
                partitionTicks.shift(); //remove the first tick
                this.drawTicks(gridGroup, partitionTicks, axisName + '-partition-ticks', {x:0, y:-mt.common.GRAPH_TICK_LENGTH*2}, {x:0, y:0}, axis.isXAxis);
                yOffset = 20;
                this.drawPartitionBlocks(gridGroup, axis.partitions, axisName + '-partition-block', {x:0, y:-yOffset}, {x:0, y:yOffset}, axis.isXAxis);
                this.drawPartitionHandles(axis);

                var labelPoints = [];

                for (var p in axis.partitions) {
                    var newPoint = new mt.common.Point({
                        x: 0,
                        y: axis.partitions[p].max.val(),
                        numberLinePointLabel: ((axis.partitions[p].numberLinePointLabel !== undefined) ? axis.partitions[p].numberLinePointLabel : ''),
                        numberLinePercentLabel: ((axis.partitions[p].numberLinePercentLabel !== undefined) ? axis.partitions[p].numberLinePercentLabel : '')
                    });
                    newPoint.partition = axis.partitions[p];
                    labelPoints.push(newPoint);
                }
                var originOffset = [0, 0];

                var pointsToRender = [];
                for (var lp in labelPoints) {
                    var point = labelPoints[lp];
                    if (this.addPointToRenderedPointList(point) === true) {
                        pointsToRender.push(point);
                    }
                }
                this.drawPercentTickLabels(pointsToRender, axisName + '-partition-percent', originOffset, false);

            };

            this.drawPartitionHandles = function (axis) {
                var axisName = axis.isXAxis? mt.common.GRAPH_X_AXIS_CLASS: mt.common.GRAPH_Y_AXIS_CLASS;

                var className = axisName + '-partition-handles';

                var handles = [];
                for(var i in axis.partitions) {
                    var partition = axis.partitions[i];
                    if(axis.isXAxis) {
                        handles.push({x:partition.getMin().val(), y:0, color: partition.color, xAxis: partition.isXAxis});
                        handles.push({x:partition.getMax().val(), y:0, color: partition.color, xAxis: partition.isXAxis});
                    } else {
                        handles.push({x:0, y:partition.getMax().val(), color: partition.color, xAxis: partition.isXAxis});
                    }
                }

                this.renderItem(gridGroup, handles, className, 'svg:circle', function(elements, xPos, yPos) {
                    elements.attr('cy', function (d) { return yPos(d.x, d.y, d.xAxis); })
                        .attr('cx', function (d) { return xPos(d.x, d.y, d.xAxis); })
                        .attr('r', function (d) { return mt.common.GRAPH_POINT_RADIUS;})
                        .attr('fill', function (d) { return d.color;})
                        .attr('stroke', function(d) { return d.color; });
                });
            };

            this.drawPartitionBlocks = function (group, partitions, className, offsetA, offsetB, isXAxis) {
                var rx = 0;
                var ry = 0;
                this.renderItem(group, partitions, className, 'svg:rect', function (elements, xPos, yPos) {
                    function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                    function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                    elements.attr('x', function (d) { return tickXPos(d.getMin().val()); })
                        .attr('y', function (d) { return tickYPos(d.getMin().val()) + offsetA.y; })
                        .attr('width', function (d) { return tickXPos(d.getMax().val()) - tickXPos(d.getMin().val()); })
                        .attr('height', offsetB.y - offsetA.y)
                        .attr('fill', function (d) { return d.color;})
                        .attr('id', function (d) { return d.id; })
                        .style('stroke', function (d) { return d.color;})
                        .style('stroke-width', function (d) { return d.isSelected? 2: 0;})
                        .attr('rx', rx)
                        .attr('ry', ry);
                });
            };

            function toFixedDown(val) {
                var returnVal = val.toFixed(2) + ' ';
                while (returnVal.indexOf('0 ') !== -1) {
                    returnVal = returnVal.replace('0 ', ' ');
                }
                return returnVal.replace('. ', ' ').replace(' ', '');
            }

            function getPercentOfValue(val, hundredPercentValue, withPercentSymbol) {
                var returnVal = (((val.val() / hundredPercentValue) * 100).toFixed(2) + '%');
                while (returnVal.indexOf('0%') !== -1) {
                    returnVal = returnVal.replace('0%', '%');
                }
                returnVal = returnVal.replace('.%', '%');
                return returnVal;
            }

            function percentLabel(point, label, percentMode, top, hundredPercentValue, hundredPercentLabel) {
                if (top) {
                    if (percentMode === mt.common.PERCENT_BAR_MODE_ALL || percentMode === mt.common.PERCENT_BAR_MODE_VALUE) {
                        var val = point.val() * Number(hundredPercentLabel) / 100;
                        if (isNaN(val)) {
                            val = 0;
                        }
                        return toFixedDown(val);
                    }
                } else {
                    if (percentMode === mt.common.PERCENT_BAR_MODE_ALL || percentMode === mt.common.PERCENT_BAR_MODE_PERCENT) {
                        return getPercentOfValue(point, hundredPercentValue);
                    }
                }
                return label;
            }

            this.drawPercentTickLabels = function (ticks, className, originOffset, isXAxis, forceDecimal, forceMode) {

                var offset = [0, - (mt.common.PERCENT_BAR_HEIGHT / 2) - 5];

                this.drawPercentTickLabelsTop(true, ticks, className, originOffset, isXAxis, forceDecimal, offset, forceMode);
                this.drawPercentTickLabelsTop(false, ticks, className, originOffset, isXAxis, forceDecimal, offset, forceMode);
            };

            this.drawPercentTickLabelsTop = function (isTop, ticks, className, originOffset, isXAxis, forceDecimal, offset, forceMode) {
                var showAxes = graphModel.showAxes;
                var clazz = className + '-top';
                var classHighlight = className + '-highlight-top';
                if(!isTop) {
                    clazz = className + '-bottom';
                    classHighlight = className + '-highlight-bottom';
                }

                // var graphModel = graphModel;
                var self = this;
                var percentMode = graphModel.percentBarMode;
                if (forceMode !== undefined) {
                    percentMode = forceMode;
                }

                this.renderItem(tickLabelGroup, ticks, clazz, 'svg:text', function (elements, xPos, yPos) {
                    function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                    function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                    elements.text(function (d) { return percentLabel(d.y, (isTop) ? d.numberLinePointLabel : d.numberLinePercentLabel, percentMode, isTop, graphModel.hundredPercentValue, graphModel.hundredPercentLabel); })
                        .attr('x', function (d) {
                            // offset zero label to avoid y axis
                            return tickXPos(d.y.val()) + offset[0] - originOffset[0];
                        })
                        .attr('y', function (d) {
                            var newX = tickXPos(d.y.val()) + offset[0] - originOffset[0];
                            var topWidth = self.getSVGTextWidth(percentLabel(d.y, (isTop) ? d.numberLinePointLabel : d.numberLinePercentLabel, percentMode, isTop, graphModel.hundredPercentValue, graphModel.hundredPercentLabel));
                            var newY = graphModel.getYPosOfPercentBarText(newX, topWidth, isTop, d);
                            if (!isTop) {
                                newY =  -newY - (mt.common.PERCENT_BAR_HEIGHT + 20);
                            }
                            return tickYPos(d.y.val()) + offset[1] - originOffset[1] - newY;
                        })
                        .attr('class', function(d) { return className + ' ' + clazz + (showAxes ? '' : ' ' + mt.common.GRAPH_HIDDEN_CLASS);})
                        .attr('text-anchor', 'middle');
                });
                this.renderItem(tickLabelGroup, ticks, classHighlight, 'svg:rect', function (elements, xPos, yPos){
                    function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}
                    elements.attr('x', function(d) {
                        var highlightObjX = graphModel.getPercentZoneByObj(d, isTop);
                        var XW = (highlightObjX.width > 10) ? highlightObjX.width : 10;
                        return highlightObjX.x - XW / 2;
                    })
                        .attr('y', function (d) {
                            var highlightObjY = graphModel.getPercentZoneByObj(d, isTop);
                            var highlightOffset = -15 - highlightObjY.y;
                            if (!isTop) {
                                highlightOffset = mt.common.PERCENT_BAR_HEIGHT + 5 + highlightObjY.y;
                            }
                            return tickYPos(d.y.val()) + offset[1] - originOffset[1] + highlightOffset;
                        })
                        .attr('width', function (d){
                            var highlightObjW = graphModel.getPercentZoneByObj(d, isTop);
                            var hightlightW = (highlightObjW.width > 10) ? highlightObjW.width : 10;
                            return hightlightW;
                        })
                        .attr('height', 20)
                        .style('fill', function (d) {
                            var hightlightString = percentLabel(d.y, (isTop) ? d.numberLinePointLabel : d.numberLinePercentLabel, percentMode, isTop, graphModel.hundredPercentValue, graphModel.hundredPercentLabel);
                            var shouldBeMode = mt.common.PERCENT_BAR_MODE_PERCENT;
                            if (!isTop) {
                                shouldBeMode = mt.common.PERCENT_BAR_MODE_VALUE;
                            }
                            if ((percentMode === shouldBeMode || percentMode === mt.common.PERCENT_BAR_MODE_NONE) &&
                                (hightlightString === undefined || hightlightString.length === 0)) {
                                var highlightColor = 'lightgray';
                                return highlightColor;
                            }
                            return 'none';
                        })
                        .style('stroke-width', '1px')
                        .classed('mt-is-percent-bar-selected', function (d) {
                            return (graphModel.highlightTarget !== undefined &&
                                ((d.isMaxPercentLabel === true && graphModel.highlightTarget.isMaxPercentLabel === true) ||
                                    (d.isHundredLabel === true && graphModel.highlightTarget.isHundredLabel === true) ||
                                    d === graphModel.highlightTarget || d.partition === graphModel.highlightTarget) &&
                                percentMode === mt.common.PERCENT_BAR_MODE_PERCENT);
                        });
                });
            };

            this.drawTickLabels = function (ticks, className, originOffset, isXAxis, forceDecimal) {
                var showAxes = graphModel.showAxes;

                var offset = [0, - (mt.common.PERCENT_BAR_HEIGHT / 2) - 5];

                this.renderItem(tickLabelGroup, ticks, className, 'svg:text', function (elements, xPos, yPos) {
                    function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                    function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                    elements.text(function (d) { return (forceDecimal !== true && d.isFraction)? d.num: d.toString({forceDecimal:forceDecimal}); })
                        .attr('x', function (d) {
                            // offset zero label to avoid y axis
                            return tickXPos(d.val()) + offset[0] - originOffset[0];
                        })
                        .attr('y', function (d) {
                            return tickYPos(d.val()) + offset[1] - originOffset[1];
                        })
                        .attr('class', function(d) { return showAxes ? className : className + ' ' + mt.common.GRAPH_HIDDEN_CLASS;})
                        .attr('text-anchor', 'middle');
                });
            };

            this.drawTickLabelDenom = function (ticks, className, originPos, isXAxis) {

                var denomOffset = 17;

                var offset;
                offset = [0, mt.common.GRAPH_TICK_LENGTH*3 + denomOffset];

                this.renderItem(tickLabelGroup, ticks, className, 'svg:text', function (elements, xPos, yPos) {
                    function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                    function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                    elements.text(function (d) { return d.denom; })
                        .attr('x', function (d) {
                            // offset zero label to avoid y axis
                            return tickXPos(d.val()) + offset[0];
                        })
                        .attr('y', function (d) {
                            return tickYPos(d.val()) + offset[1];
                        })
                        .attr('text-anchor', 'middle');
                });
            };

            this.renderPoints = function (points, options) {
                if (options === undefined) {
                    options = {};
                }
                points = _(points).filter(function (point) {
                    return !point.isHidden;
                });

                var clipId = '';

                this.renderItem(pointGroup, points, mt.common.GRAPH_POINT_CLASS, 'svg:line', function(elements, xPos, yPos) {
                    elements.attr('y1', function (d) { return yPos(d.x.val(), d.y.val(), d.xAxis) - (mt.common.PERCENT_BAR_HEIGHT / 2); })
                        .attr('y2', function (d) { return yPos(d.x.val(), d.y.val(), d.xAxis) + (mt.common.PERCENT_BAR_HEIGHT / 2); })
                        .attr('x1', function (d) { return xPos(d.x.val(), d.y.val(), d.xAxis); })
                        .attr('x2', function (d) { return xPos(d.x.val(), d.y.val(), d.xAxis); })
                        .style('stroke', mt.common.GRAPH_POINT_COLOR)
                        .style('stroke-width', function (d) { return d.isSelected === true ? mt.common.PERCENT_BAR_POINT_WIDTH_SELECTED : mt.common.PERCENT_BAR_POINT_WIDTH;})
                        .attr('clip-path', 'url(#' + clipId + ')');
                });

                var pointsToRender = [];
                for (var p in points) {
                    var point = points[p];
                    if (this.addPointToRenderedPointList(point) === true) {
                        pointsToRender.push(point);
                    }
                }

                var originOffset = [0, 0];
                this.drawPercentTickLabels(pointsToRender, mt.common.GRAPH_POINT_LABEL_CLASS + '-percent', originOffset, false);
                return;
            };

            //TODO: this is hacky, but I can't seem to precalculate the text
            this.getSVGTextWidth = function(string) {
                if (string === undefined || string.length === 0) {
                    return 20;
                }
                var margin = 2;
                string = '' + string;
                var size = 0;
                var textSizes = {
                    '0': 10,
                    '1': 5,
                    '2': 9,
                    '3': 9,
                    '4': 9,
                    '5': 9,
                    '6': 9,
                    '7': 8,
                    '8': 9,
                    '9': 9,
                    '.': 4,
                    '%': 12,
                    '-': 5
                };
                for (var i = 0; i < string.length; i++) {
                    size += (textSizes[string.charAt(i)] !== undefined) ? textSizes[string.charAt(i)] : 9; //giving it an average size if we don't have the letter
                }

                return size + ((size > 0 ) ? margin : 0);
            };
        }

        return PercentBarRenderer;
    }());
})(window.mt.numberline);

(function (ns) {
    'use strict';

    angular.module('mtNumberLine').controller('MicDropCtrl', function ($scope, $controller, toolPersistorService, selectionApiFactory, safeApply) {
        $scope.init = function () {
            $scope.graphModel = new mt.common.GraphModel();
            $scope.viewConfig = new mt.common.GraphViewConfig(ns.MICDROP_WIDTH, ns.MICDROP_HEIGHT, ns.DEFAULT_MARGIN, mt.common.GRAPH_MODE_MICDROP, false);

            $scope.viewConfig.offset = [0, 162];

            $scope.renderer = new ns.MicDropRenderer($scope.targetElement, $scope.graphModel, $scope.viewConfig, $scope.toolId);
            $scope.gestureHandler = new ns.MicDropGestureHandler($scope.graphModel, $scope.viewConfig, $scope.update, $scope.selectionApi);

            var xAxis = $scope.graphModel.axes.x;
            var yAxis = $scope.graphModel.axes.y;

            xAxis.min.x = new mt.common.MtValue(ns.MIC_DROP_RANGE_LOW, 1.0, false);
            xAxis.max.x = new mt.common.MtValue(ns.MIC_DROP_RANGE_HIGH, 1.0, false);
            yAxis.min.y = new mt.common.MtValue(ns.MIC_DROP_RANGE_LOW, 1.0, false);
            yAxis.max.y = new mt.common.MtValue(ns.MIC_DROP_RANGE_HIGH, 1.0, false);

            $scope.viewConfig.isDouble = false;//properties.getBooleanUserProperty('PERCENT_BAR_SHOW_DOUBLE');

            $scope.update();

            $scope.players = 4;
            $scope.numberOfTurns = 12;
            $scope.setPlayersScreen = true;
            $scope.playerColors = ['blue', 'red', 'green', 'black'];
            $scope.currentPlayer = 1;
            $scope.currentTurn = 1;
            $scope.gameOver = false;
            $scope.graphModel.gameFinished = false;
            $scope.controlTime = false;
            $scope.gameRunning = false;
            $scope.graphModel.showValues = false;
            $scope.fps = 60;
            $scope.renderer.calculatedFPS = 0;
            $scope.renderer.showFPS = false;
            $scope.lastTimeUpdatedFPS = 0;

            $scope.ribbon = $controller('MicDropRibbonCtrl', {
                $scope: $scope
            });
            $scope.ribbon.register();

            toolPersistorService.registerTool($scope.toolId, mt.common.TYPE_MIC_DROP, $scope.containerApi, $scope.serialize, $scope.deserialize);
        };

        $scope.update = function (renderAxis) {
            if(renderAxis === undefined) {
                renderAxis = true;
            }
            $scope.renderer.render(renderAxis);
        };
        
        $scope.startGame = function(){
            $scope.splitTurns();
            $scope.setPlayersScreen = false;
        };

        $scope.splitTurns = function(){
            $scope.playerSet = {};
            var turnSet = [];
            for (var i = 0; i < $scope.players; i++){
                turnSet = [];
                for (var j = 0; j < $scope.numberOfTurns/$scope.players; j++){
                    turnSet.push((i*$scope.numberOfTurns/$scope.players) + (j+1));
                }
                $scope.playerSet[i] = {
                    'color' : $scope.playerColors[i],
                    'turnSet': turnSet
                };
            }
        };
        $scope.calculateFPS = function() {
            if ($scope.currentTime !== undefined) {
                var time = Date.now() - $scope.currentTime;
                var timeSinceLast = Date.now() - $scope.lastTimeUpdatedFPS;
                if (timeSinceLast > 250) {
                    $scope.renderer.calculatedFPS = 1000 / time;
                    $scope.lastTimeUpdatedFPS = Date.now();
                }
            }
            $scope.currentTime = Date.now();
        };

        $scope.run = function() {
            if ($scope.controlTime === true || $scope.gameRunning === false) {
                return;
            }
            if ($scope.gameUpdate() === true) {
                $scope.deltaTime = (Date.now() - $scope.startTime) / 1000;
                if ($scope.renderer.showFPS === true) {
                    $scope.calculateFPS();
                }
                window.requestAnimationFrame($scope.run);
            }
            $scope.update(false);
        };

        $scope.gameUpdate = function() {
            if ($scope.micExists() && $scope.gameRunning) {
                var time = $scope.deltaTime;
                if (time === undefined || time === null) {
                    time = 0;
                }
                $scope.graphModel.currentMic.setTime($scope.deltaTime);
                $scope.graphModel.currentDrone.setTime($scope.deltaTime);
                if ($scope.graphModel.currentMic.hitGround === true) {
                    $scope.addCurrentMicToList();
                    if ($scope.graphModel.points.length >= $scope.numberOfTurns) {
                        $scope.gameOver = true;
                    }
                    safeApply($scope, function () {});
                    return false;
                }
            }
            return true;
        };

        $scope.micExists = function() {
            return $scope.graphModel.currentMic !== undefined;
        };

        $scope.startMic = function() {
            if ($scope.gameRunning) {
                return;
            }
            var color = $scope.playerColors[$scope.currentPlayer - 1];
            $scope.graphModel.currentMic = new ns.Mic({
                color: color,
                startX: $scope.graphModel.axes.y.min.y.val()
            });
            $scope.graphModel.currentDrone = new ns.Drone({
                startX: $scope.graphModel.axes.y.min.y.val()
            });
            $scope.startTime = Date.now();
            $scope.deltaTime = 0;
            $scope.gameRunning = true;
            $scope.run();
        };

        $scope.setNextPlayer = function() {
            $scope.nextPlayer = false;
        };

        $scope.finishGame = function() {
            $scope.graphModel.gameFinished = true;
            $scope.zoomToPoints();
            $scope.update();
        };

        $scope.dropMic = function() {
            if ($scope.graphModel.currentMic !== undefined && !($scope.graphModel.currentMic.dropped) ) {
                $scope.graphModel.currentMic.dropAt($scope.deltaTime);
            }
        };

        $scope.addCurrentMicToList = function() {
            var x = $scope.graphModel.currentMic.getWhereMicHitGround();
            if (x === undefined) {
                return;
            }
            x = x.toFixed(1);
            var micPos = new mt.common.MtValue(x);
            if ($scope.graphModel.points === undefined) {
                $scope.graphModel.points = [];
            }
            var pointName = String.fromCharCode('A'.charCodeAt(0) + $scope.graphModel.points.length);
            var micPoint = new mt.common.Point({
                x: 0,
                y: micPos,
                isAxis: false,
                name: pointName,
                numberLinePointLabel: pointName,
                color: $scope.graphModel.currentMic.color
            });
            $scope.graphModel.points.push(micPoint);
            var currentPlayer = $scope.currentPlayer;
            $scope.currentPlayer = parseInt($scope.graphModel.points.length / ($scope.numberOfTurns / $scope.players), 10) + 1;
            $scope.nextPlayer = currentPlayer < $scope.currentPlayer;
            $scope.currentTurn = parseInt($scope.graphModel.points.length + 1);
            $scope.gameRunning = false;
        };

        $scope.serialize = function () {
            var data = $scope.graphModel.serialize();
            data.isDouble = $scope.viewConfig.isDouble;
            data.setPlayersScreen = $scope.setPlayersScreen;
            data.currentPlayer = $scope.currentPlayer;
            data.currentTurn = $scope.currentTurn;
            data.gameOver = $scope.gameOver;
            data.gameFinished = $scope.graphModel.gameFinished;
            data.players = $scope.players;
            return data;
        };

        $scope.deserialize = function (data) {
            $scope.viewConfig.isDouble = data.isDouble;
            $scope.graphModel.deserialize(data);
            if (data.setPlayersScreen !== undefined){
                $scope.setPlayersScreen = data.setPlayersScreen;
            }
            if (data.currentPlayer !== undefined){
                $scope.currentPlayer = data.currentPlayer;
            }
            if (data.currentTurn !== undefined){
                $scope.currentTurn = data.currentTurn;
            }
            if (data.gameOver !== undefined){
                $scope.gameOver = data.gameOver;
            }
            if (data.gameFinished !== undefined){
                $scope.graphModel.gameFinished = data.gameFinished;
            }
            if (data.players !== undefined){
                $scope.players = data.players;
            }
            $scope.splitTurns();
            $scope.update();
        };

        $scope.deltaChanged = function() {
            $scope.gameUpdate();
            $scope.update(false);
        };

        $scope.zoomToPoints = function() {
            var leftMost = new mt.common.MtValue(0);
            var rightMost = new mt.common.MtValue(0);
            for (var p in $scope.graphModel.points) {
                var pointY = $scope.graphModel.points[p].y;
                if (pointY.val() < leftMost) {
                    leftMost = pointY.copy();
                }
                if (pointY.val() > rightMost) {
                    rightMost = pointY.copy();
                }
            }
            $scope.graphModel.axes.x.min.x = leftMost.copy().subtractByNum(1/4);
            $scope.graphModel.axes.x.max.x = rightMost.copy().addByNum(1/4);
            $scope.graphModel.axes.y.min.y = leftMost.copy().subtractByNum(1/4);
            $scope.graphModel.axes.y.max.y = rightMost.copy().addByNum(1/4);
        };

        $scope.toggleShowValues = function() {
            $scope.graphModel.showValues = !$scope.graphModel.showValues;
        };
    });

})(window.mt.numberline);

(function (ns) {
    'use strict';

    var MicDropRibbonCtrl = [
        '$scope', 'toolMenuService',
        function(
            $scope,
            toolMenuService
            ) {

        //Make tools visible inside tasks
        var riOptionsVisible = function() {
            return $scope.graphModel.gameFinished === true;
        };

        //Zoom
        var riZoomInCb = function(toggle) {
            $scope.gestureHandler.toggleZoomIn();
        };
        var riZoomInGet = function() {
            return $scope.gestureHandler.mode === ns.ZOOM_IN_MODE;
        };
        var riZoomIn = toolMenuService.newItem.toggle('Zoom In', riZoomInCb, {isVisible: riOptionsVisible, cssClass: 'mt-ribbon-toggle-md-zoomin', showName: true}, riZoomInGet);

        var riZoomOutCb = function(toggle) {
            $scope.gestureHandler.toggleZoomOut();
        };
        var riZoomOutGet = function() {
            return $scope.gestureHandler.mode === ns.ZOOM_OUT_MODE;
        };
        var riZoomOut = toolMenuService.newItem.toggle('Zoom Out', riZoomOutCb, {isVisible: riOptionsVisible, cssClass: 'mt-ribbon-toggle-md-zoomout', showName: true}, riZoomOutGet);

        var riZoomResetCb = function() {
            $scope.gestureHandler.setMode();
            $scope.zoomToPoints();
            $scope.update();
        };
        var riZoomReset = toolMenuService.newItem.button('Zoom Reset', riZoomResetCb, {isVisible: riOptionsVisible, cssClass: 'mt-ribbon-button-md-zoomreset', showName: true});

        var riShowValuesCb = function(toggle) {
            $scope.toggleShowValues();
            $scope.update();
        };
        var riShowValuesGet = function() {
            return $scope.graphModel.showValues === true;
        };
        var riShowValues = toolMenuService.newItem.toggle('Show Values', riShowValuesCb, {isVisible: riOptionsVisible, cssClass: 'mt-ribbon-toggle-md-showvalues', showName: true}, riShowValuesGet);

        //Ribbon object
        var ribbon = {
            toolId: $scope.toolId,
            items: {
                left: [],
                center: [],
                right: [riZoomIn, riZoomOut, riZoomReset, riShowValues]
            }
        };

        //register the tool's menu with toolMenuService
        this.register = function () {
            toolMenuService.setToolMenu($scope.toolId, ribbon, {containerApi: $scope.containerApi});
        };
    }];

    angular.module('mtNumberLine')
            .controller('MicDropRibbonCtrl', MicDropRibbonCtrl);

})(window.mt.numberline);

(function (ns) {
    'use strict';

    angular.module('mtNumberLine').controller('NumberHuntCtrl', function ($scope, $controller, toolPersistorService, selectionApiFactory) {
        $scope.init = function () {
            $scope.selectionApi = selectionApiFactory.createApi(function(oldSelection) {
                if(oldSelection !== undefined && oldSelection.modelObject !== undefined) {
                    oldSelection.modelObject.isSelected = false;
                }
                $scope.update(false);
            });

            $scope.graphModel = new mt.common.GraphModel();
            $scope.viewConfig = new mt.common.GraphViewConfig(ns.NUMBERHUNT_WIDTH, ns.NUMBERHUNT_HEIGHT, ns.DEFAULT_MARGIN, mt.common.GRAPH_MODE_NUMBERHUNT, false);
            $scope.renderer = new ns.NumberHuntRenderer($scope.targetElement, $scope.graphModel, $scope.viewConfig, $scope.toolId);
            $scope.gestureHandler = new ns.NumberHuntGestureHandler($scope.graphModel, $scope.viewConfig, $scope.update, $scope.selectionApi);

            var properties = new mt.common.Properties();
            var xAxis = $scope.graphModel.axes.x;
            var yAxis = $scope.graphModel.axes.y;

            xAxis.min.x = new mt.common.MtValue(properties.getUserProperty('NUMBER_HUNT_RANGE_LOW'), 1.0, false);
            xAxis.max.x = new mt.common.MtValue(properties.getUserProperty('NUMBER_HUNT_RANGE_HIGH'), 1.0, false);
            yAxis.min.y = new mt.common.MtValue(properties.getUserProperty('NUMBER_HUNT_RANGE_LOW'), 1.0, false);
            yAxis.max.y = new mt.common.MtValue(properties.getUserProperty('NUMBER_HUNT_RANGE_HIGH'), 1.0, false);

            xAxis.minorInterval = new mt.common.MtValue(properties.getUserProperty('NUMBER_HUNT_TICK_INTERVAL'), 1.0, false);
            xAxis.majorInterval = new mt.common.MtValue(properties.getUserProperty('NUMBER_HUNT_TICK_INTERVAL'), 1.0, false);
            yAxis.minorInterval = new mt.common.MtValue(properties.getUserProperty('NUMBER_HUNT_TICK_INTERVAL'), 1.0, false);
            yAxis.majorInterval = new mt.common.MtValue(properties.getUserProperty('NUMBER_HUNT_TICK_INTERVAL'), 1.0, false);

            $scope.setNumberHunt(1, 9, 7);

            var partitionSet = [];
            for (var p = 0; p < 12; p++) {
                partitionSet.push(p + 1);
            }
            $scope.graphModel.setCustomPartitionSet(partitionSet);

            $scope.levelMap = true;

            $scope.viewConfig.isDouble = false;//properties.getBooleanUserProperty('PERCENT_BAR_SHOW_DOUBLE');
            $scope.currentTask = -1;
            $scope.currentLevel = 0;
            $scope.update();
            $scope.graphModel.errorPoints = [];

            $scope.tasks = [];
            for (var i = 0; i < tasks.length; i++) {
                $scope.tasks.push(angular.copy(tasks[i]));
                $scope.tasks[$scope.tasks.length - 1].taskId = $scope.tasks.length - 1;
                $scope.tasks[$scope.tasks.length - 1].identifyMode = false;
                $scope.tasks.push(angular.copy(tasks[i]));
                $scope.tasks[$scope.tasks.length - 1].taskId = $scope.tasks.length - 1;
                $scope.tasks[$scope.tasks.length - 1].identifyMode = true;
            }

            $scope.levels = $scope.createMap($scope.tasks);
            $scope.updateMap();

            $scope.ribbon = $controller('NumberHuntRibbonCtrl', {
                $scope: $scope
            });
            $scope.ribbon.register();
            toolPersistorService.registerTool($scope.toolId, mt.common.TYPE_NUMBER_HUNT, $scope.containerApi, $scope.serialize, $scope.deserialize);
        };

        function diffArrays(firstList, secondList) {
            return firstList.filter(function(i) {return secondList.indexOf(i) < 0;});
        }

        function areTheyNumbers(arr) {
            for (var a in arr) {
                if (arr[a] instanceof mt.common.MtValue) {
                    if (isNaN(arr[a].val())) {
                        return false;
                    }
                } else if (isNaN(arr[a])) {
                    return false;
                }
            }
            return true;
        }

        function areTheyTooClose(low, high, diff) {
            return (low.val() + (diff.val() * 2) > high.val());
        }

        function outOfRange(min, max, center) {
            var numberBuffer = 1e-14;
            var minNum = min;
            var maxNum = max;
            var centerNum = center;
            if (min instanceof mt.common.MtValue) {
                minNum = min.val();
            }
            if (max instanceof mt.common.MtValue) {
                maxNum = max.val();
            }
            if (center instanceof mt.common.MtValue) {
                centerNum = center.val();
            }
            return (centerNum <= minNum - numberBuffer || maxNum + numberBuffer <= centerNum);
        }

        function doesTargetFitTask(target, task, currDenom) {
            var isFraction = (task.fractionMode)? task.fractionMode : false;
            if (isFraction && target.val() % 1 === 0) {
                return false;
            }
            if (task.notMultipleOf !== undefined) {
                var tempTargetVal = target.val();
                var tempNotMultipleOf = task.notMultipleOf;
                while (tempTargetVal % 1 !== 0 || tempNotMultipleOf % 1 !== 0) {
                    tempTargetVal *= 10;
                    tempNotMultipleOf *= 10;
                }
                if (tempTargetVal % tempNotMultipleOf === 0){
                    return false;
                }
            }
            if (task.useFirstDenomForPartition === true) {
                if (currDenom % task.addPartitionNum !== 0) {
                    return false;
                }
            }
            return true;
        }

        function keepLookingFromRandomNumberHunt (low, high, target, diff, minLow, maxLow, minHigh, maxHigh, task, currDenom, maxDenomLimit) {
            return !areTheyNumbers([low, high, target, diff], 'a') ||
                    areTheyTooClose(low, high, diff, 'b') ||
                    outOfRange(minLow, maxLow, low, 'c') ||
                    outOfRange(minHigh, maxHigh, high, 'd') ||
                    outOfRange(low.val() + diff.val(), high.val() - diff.val(), target, 'e') ||
                    outOfRange(task.minRange, task.maxRange, high.val() - low.val(), 'f') ||
                    !doesTargetFitTask(target, task, currDenom, 'g') || 
                    currDenom > maxDenomLimit;
        }

        $scope.createRandomNumberHunt = function(task) {
            var isFraction = (task.fractionMode)? task.fractionMode : false;
            var low, high, target;
            var minLow = new mt.common.MtValueFromString(task.minLow);
            var maxLow = new mt.common.MtValueFromString(task.maxLow);
            var minHigh = new mt.common.MtValueFromString(task.minHigh);
            var maxHigh = new mt.common.MtValueFromString(task.maxHigh);

            var decimalPlace = (task.decimalPlace) ? task.decimalPlace : 0;
            if (decimalPlace > 5) {
                decimalPlace = 5;
            }
            var endCapDecimalPlace = (task.endCapDecimalPlace !== undefined) ? task.endCapDecimalPlace : 0;
            var endCapPrecision = Math.pow(10, endCapDecimalPlace);

            var maxDenom = (task.maxDenom !== undefined) ? task.maxDenom : 1;
            if (!(maxDenom instanceof Array)) {
                maxDenom = [maxDenom];
            }
            var maxDenomLimit = task.maxDenomLimit;
            if (maxDenomLimit === undefined) {
                maxDenomLimit = 1;
                for (var md in maxDenom) {
                    maxDenomLimit *= maxDenom[md];
                }
            }

            var attempts = 0;
            var precision = Math.pow(10, decimalPlace);
            if (task.minRange === undefined || task.minRange < 0) {
                task.minRange = 0;
            }
            if (task.maxRange === undefined || task.maxRange > (task.maxHigh - task.minLow)) {
                task.maxRange = task.maxHigh - task.minLow;
            }

            if (isFraction) {
                precision = 1;
            } else {
                maxDenom = [1];
            }

            var currDenom = 1;
            var tempPrecision = precision;
            var diff;
            while ((attempts < 10) &&
                keepLookingFromRandomNumberHunt(low, high, target, diff, minLow, maxLow, minHigh, maxHigh, task, currDenom, maxDenomLimit)) {
                currDenom = 1;
                for (var d = 0; d < maxDenom.length; d++) {
                    var denom = maxDenom[d];
                    if (currDenom * denom > maxDenomLimit) {
                        denom = parseInt(maxDenomLimit / currDenom, 10);
                    }
                    if (denom > 1) {
                        currDenom *= (parseInt(Math.random() * (denom - 1), 10) + 2);
                    }
                    if (d === 0 && task.useFirstDenomForPartition === true) {
                        task.addPartitionNum = currDenom;
                    }
                }
                tempPrecision = precision;
                diff = new mt.common.MtValue(1, (isFraction) ? currDenom : tempPrecision, true);

                var tempMinLow = minLow.copy();
                var tempMaxLow = maxLow.copy();
                var tempMinHigh = minHigh.copy();
                var tempMaxHigh = maxHigh.copy();
                tempPrecision = precision;

                if (isFraction && (task.targetNumerators !== undefined || task.targetNumeratorsExclude !== undefined)) {
                    var acceptableList = [];
                    if (task.targetNumerators !== undefined) {
                        if (task.targetNumerators instanceof Array) {
                            acceptableList = task.targetNumerators;
                        } else {
                            acceptableList = [task.targetNumerators];
                        }
                    } else {
                        for (var n = 1; n <= currDenom; n++) {
                            acceptableList.push(n);
                        }
                        var unacceptableList = [];
                        if (task.targetNumeratorsExclude instanceof Array) {
                            unacceptableList = task.targetNumeratorsExclude;
                        } else {
                            unacceptableList = [task.targetNumeratorsExclude];
                        }
                        acceptableList = diffArrays(acceptableList, unacceptableList);
                    }
                    var whole = parseInt(Math.random() * ((tempMaxHigh.val() - diff.val() - 1) - (tempMinLow.val() + diff.val())) + (tempMinLow.val() + diff.val()), 10);
                    if (whole === 0 && acceptableList[acceptableList.length - 1] === currDenom) {
                        acceptableList.pop();
                    }
                    var targetNumerator = acceptableList[parseInt(Math.random() * acceptableList.length)];

                    target = mt.common.MtValue((whole * currDenom) + targetNumerator, currDenom, isFraction);
                } else {
                    target = mt.common.MtValue((parseInt(Math.random() * currDenom * ((tempMaxHigh.val() - diff.val()) - (tempMinLow.val() + diff.val())) * tempPrecision, 10) / tempPrecision) + ((tempMinLow.val() + diff.val()) * currDenom), currDenom, isFraction).reduce();
                }
                if (target.val() - diff.val() < tempMaxLow.val()) {
                    tempMaxLow = target.copy().subtract(diff);
                }

                if (target.val() + diff.val() - task.maxRange > tempMinLow.val()) {
                    tempMinLow = target.copy().add(diff).subtractByNum(task.maxRange);
                }
                if (tempMinLow.val() > tempMaxLow.val()) {
                    tempMaxLow = tempMinLow.copy();
                }

                var currDenomForEndCaps = currDenom;

                currDenomForEndCaps = endCapPrecision;
                tempMinLow.setVal(Math.ceil(tempMinLow.val() * endCapPrecision) / endCapPrecision);
                tempMaxLow.setVal(Math.floor(tempMaxLow.val() * endCapPrecision) / endCapPrecision);
                tempPrecision = endCapPrecision;

                low = mt.common.MtValue((parseInt(Math.random() * currDenomForEndCaps * (diff.val() + tempMaxLow.val() - tempMinLow.val()) * tempPrecision, 10) / tempPrecision) + (tempMinLow.val() * currDenomForEndCaps), currDenomForEndCaps, isFraction).reduce();
                if (tempMinHigh.val() < target.val() + diff.val()) {
                    tempMinHigh = target.copy().add(diff);
                }

                if (low.val() + task.minRange > tempMinHigh.val()) {
                    tempMinHigh = low.copy().addByNum(task.minRange);
                }
                if (low.val() + task.maxRange < tempMaxHigh.val()) {
                    tempMaxHigh = low.copy().addByNum(task.maxRange);
                }

                tempMinHigh.setVal(Math.ceil(tempMinHigh.val() * endCapPrecision) / endCapPrecision);
                tempMaxHigh.setVal(Math.floor(tempMaxHigh.val() * endCapPrecision) / endCapPrecision);

                high = mt.common.MtValue((parseInt(Math.random() * currDenomForEndCaps * (diff.val() + tempMaxHigh.val() - tempMinHigh.val()) * tempPrecision, 10) / tempPrecision) + (tempMinHigh.val() * currDenomForEndCaps), currDenomForEndCaps, isFraction).reduce();

                if (task.targetNumEqualsHighNum === true) {
                    target.num = high.val();
                } else if (task.targetNumMultipleOfHighNum === true) {
                    if (task.addPartitionNum !== undefined) {
                        target.num = (parseInt(Math.random() * task.addPartitionNum, 10) + 1) * high.val();
                        target.denom = task.addPartitionNum;
                    } else {
                        console.log('when targetNumMultipleOfHighNum is true useFirstDenomForPartition needs to be true too');
                    }
                }
                attempts++;
            }
            if (attempts > 2) {
                console.log('createRandomNumberHunt attempts', attempts);
            }
            var option = (isFraction)? {} : {forceDecimal: true};
            low.precision = endCapDecimalPlace;
            high.precision = endCapDecimalPlace;
            target.precision = decimalPlace;
            if (task.useHighForPartition === true) {
                task.addPartitionNum = parseInt(high.val(), 10);
            }
            task.lo = low.toString(option);
            task.hi = high.toString(option);
            task.target = target.toString(option);
        };

        $scope.setNumberHunt = function(lowNum, highNum, huntNum, options) {
            options = (options !== undefined) ? options : {};
            lowNum = new mt.common.MtValueFromString(lowNum, options.isFraction);
            highNum = new mt.common.MtValueFromString(highNum, options.isFraction);
            huntNum = new mt.common.MtValueFromString(huntNum, options.isFraction);
            $scope.graphModel.axes.x.min.x = lowNum.copy().subtractByNum(1/4);
            $scope.graphModel.axes.x.max.x = highNum.copy().addByNum(1/4);
            $scope.graphModel.axes.y.min.y = lowNum.copy().subtractByNum(1/4);
            $scope.graphModel.axes.y.max.y = highNum.copy().addByNum(1/4);
            $scope.graphModel.axes.x.huntLow = lowNum.copy();
            $scope.graphModel.axes.x.huntHigh = highNum.copy();
            $scope.graphModel.axes.y.huntLow = lowNum.copy();
            $scope.graphModel.axes.y.huntHigh = highNum.copy();
            $scope.graphModel.axes.y.huntMode = true;
            //$scope.viewConfig.update(0, 1, 0, 1);
            //$scope.viewConfig.update($scope.graphModel.axes.x.min.x.val(), $scope.graphModel.axes.x.max.x.val(), $scope.graphModel.axes.y.min.y.val(), $scope.graphModel.axes.y.max.y.val());
            $scope.graphModel.setNumberHunt(lowNum, highNum, huntNum, options);
            if (options.addPartitionNum !== undefined) {
                $scope.graphModel.addPartitionedRange(false, lowNum, highNum, options.addPartitionNum);
            }
        };

        $scope.update = function (renderAxis) {
            if(renderAxis === undefined) {
                renderAxis = true;
            }
            $scope.renderer.render(renderAxis);
        };

        $scope.serialize = function () {
            var data = $scope.graphModel.serialize();
            data.tasks = $scope.tasks;
            data.isDouble = $scope.viewConfig.isDouble;
            return data;
        };

        $scope.deserialize = function (data) {
            $scope.viewConfig.isDouble = data.isDouble;
            $scope.graphModel.deserialize(data);
            if (data.tasks !== undefined) {
                $scope.tasks = data.tasks;
                $scope.levels = $scope.createMap($scope.tasks);
                $scope.updateMap();
            }
            $scope.update();
        };

        $scope.retryTask = function() {
            var taskId = $scope.currentTask;
            $scope.tasks[taskId].attempted = false;
            $scope.currentTask = -1;
            $scope.goToNextTask(taskId-1);
        };

        $scope.selectTask = function(task) {
            if (!($scope.levelMap)) {
                return;
            }
            $scope.goToTask(task);
        };

        $scope.goToTask = function(task){
            var targetViewType;
            if ($scope.currentTask === task.taskId) {
                return;
            }
            if (task.attempted !== true) {
                clearAttempts(task);
                $scope.createRandomNumberHunt(task);
            }

            if (task.fractionMode){
                targetViewType = task.displayMixedFraction ? 'mixed number' : 'fraction';
            }
            else {
                targetViewType = task.decimalPlace > 0 ? 'decimal' : 'whole number';
            }
            $scope.setNumberHunt(task.lo, task.hi, task.target,
                {
                    isFraction: task.fractionMode,
                    isIdentify: task.identifyMode,
                    addPartitionNum: task.addPartitionNum,
                    displayMixedFraction: task.displayMixedFraction,
                    decimalPlace: task.decimalPlace,
                    targetViewType: targetViewType
                }
            );
            $scope.currentTask = task.taskId;
            $scope.currentLevel = task.level;
            task.attempts = 0;
            $scope.levelMap = false;
            $scope.answerSubmitted = false;
            $scope.submissionCorrect = undefined;
            $scope.isFraction = task.fractionMode;
            if (task.attempted === true) {
                loadAttemptsFromTask(task);
            }
            $scope.update();
        };

        $scope.hasNextTask = function() {
            return $scope.tasks.length > $scope.currentTask + 1 && !$scope.nextTaskIsLocked();
        };

        $scope.nextTaskIsLocked = function () {
            var tasksSoFar = 0;
            for (var l in $scope.levels) {
                var level = $scope.levels[l];
                for (var s in level.stages) {
                    var stage = level.stages[s];
                    for (var t = 0; t < stage.tasks.length; t++) {
                        if (tasksSoFar === $scope.currentTask + 1) {
                            return level.locked;
                        }
                        tasksSoFar++;
                    }
                }
            }
            return false;
        };

        $scope.goToNextTask = function(currentTask){
            $scope.goToTask($scope.tasks[currentTask + 1]);
        };

        $scope.goToLevel = function(previous){
            var task;
            if (previous){
                task = _.find($scope.tasks, function(task) { return task.level === $scope.currentLevel-1; });
            }
            else {
                task = _.find($scope.tasks, function(task) { return task.level === $scope.currentLevel+1; });
            }
            $scope.goToNextTask(task.taskId);
        };

        $scope.isCurrentTask = function(taskId){
            return taskId === $scope.currentTask;
        };

        $scope.isFirstLevel = function(){
            return _.first($scope.tasks).level === $scope.currentLevel;
        };

        $scope.isLastLevel = function(){
            return _.last($scope.tasks).level === $scope.currentLevel;
        };

        $scope.isCurrentLevel = function(levelId){
            return levelId === $scope.currentLevel;
        };

        $scope.goToMap = function(){
            $scope.answerSubmitted = false;
            $scope.levelMap = true;
            $scope.currentTask = -1;
        };

        $scope.answerPresent = function() {
            if (this.graphModel.huntOptions.isIdentify) {
                var label = this.graphModel.huntPoint.numberLinePointLabel;
                return label !== undefined && label !== '';
            }
            return $scope.graphModel.points[0] !== undefined;
        };

        $scope.isCorrectAnswer = function() {
            var answer;
            if (this.graphModel.huntOptions.isIdentify) {
                answer = mt.common.MtValueFromString(this.graphModel.huntPoint.numberLinePointLabel).val();
            } else {
                var firstPoint = $scope.graphModel.points[0];
                if (firstPoint) {
                    answer = firstPoint.y.val();
                }
            }
            return answer !== undefined && (Math.abs($scope.graphModel.huntNum.val() - answer) < 1e-14);
        };

        $scope.submit = function() {
            var firstPoint = $scope.graphModel.points[0],
                taskId = $scope.currentTask;
            var task = $scope.tasks[taskId];
            if ($scope.answerPresent()) {
                if ($scope.isCorrectAnswer()) {
                    $scope.submissionCorrect = true;
                    // update task
                    $scope.tasks[taskId].completed = true;
                    // update map
                    $scope.updateMap();
                } else {
                    task.attempts += 1;
                    var newPosition;
                    if (this.graphModel.huntOptions.isIdentify) {
                        newPosition = new mt.common.MtValueFromString(this.graphModel.huntPoint.numberLinePointLabel);
                    } else {
                        newPosition = firstPoint.y.copy();
                    }
                    var newPoint = mt.common.Point({
                        x: 0,
                        y: newPosition,
                        xAxis: false
                    });
                    if ($scope.graphModel.huntNum.isFraction) {
                        newPoint.y.convertDecimalToFraction();
                        newPoint.x.convertDecimalToFraction();
                    }

                    $scope.graphModel.errorPoints.push(newPoint);
                    $scope.submissionCorrect = false;
                }
                $scope.answerSubmitted = true;
                addAttemptToTask(task);
            }
            $scope.update();
        };

        function addAttemptToTask(task) {
            ///numberLinePointLabel
            var errors = [];
            for (var e in $scope.graphModel.errorPoints) {
                var error = $scope.graphModel.errorPoints[e].y;
                errors.push(error);
            }
            var partitions = [];
            var axis = $scope.graphModel.axes.y;
            for (var p in axis.partitions) {
                var partition = axis.partitions[p];
                var taskParition = {
                    min: partition.min.val(),
                    max: partition.max.val(),
                    partitions: partition.partitions
                };
                partitions.push(taskParition);
            }
            task.attempted = true;
            task.partitions = partitions;
            task.errors = errors;
            task.submissionCorrect = $scope.submissionCorrect;
            if ($scope.graphModel.huntPoint !== undefined) {
                task.numberLinePointLabel = $scope.graphModel.huntPoint.numberLinePointLabel;
            }
            var labels = [];
            for (var l in $scope.graphModel.tickLabels) {
                var label = $scope.graphModel.tickLabels[l].numberLinePointLabel;
                labels.push(label);
            }
            task.labels = labels;
        }

        function clearAttempts(task) {
            task.errors = [];
            $scope.graphModel.errorPoints = [];
            task.partitions = [];
            $scope.graphModel.axes.y.partitions = [];
        }

        function loadAttemptsFromTask(task) {
            if (task === undefined) {
                return;
            }
            $scope.graphModel.errorPoints = [];
            for (var e in task.errors) {
                var newError = new mt.common.Point({
                    x: 0,
                    y: new mt.common.MtValueFromString(task.errors[e]),
                    xAxis: false
                });
                $scope.graphModel.errorPoints.push(newError);
            }
            $scope.graphModel.axes.y.partitions = [];
            for (var p in task.partitions) {
                var partition = task.partitions[p];
                $scope.graphModel.addPartitionedRange(false, new mt.common.MtValue(partition.min), new mt.common.MtValue(partition.max), partition.partitions);
            }
            task.attempts = (task.errors !== undefined) ? task.errors.length : 0;
            if (task.attempts > 0) {
                $scope.answerSubmitted = true;
            }
            $scope.submissionCorrect = task.submissionCorrect;
            if ($scope.graphModel.huntPoint !== undefined) {
                $scope.graphModel.huntPoint.numberLinePointLabel = task.numberLinePointLabel;
            }
            $scope.update(); //needed for getting ticklabels
            for (var l = 0; l < task.labels.length; l++) {
                if ($scope.graphModel.tickLabels[l] !== undefined) {
                    $scope.graphModel.tickLabels[l].numberLinePointLabel = task.labels[l];
                }
            }
        }

        $scope.tryAgain = function(){
            $scope.answerSubmitted = false;
            $scope.submissionCorrect = undefined;
            if (this.graphModel.huntOptions.isIdentify) {
                $scope.graphModel.huntPoint.numberLinePointLabel = '';
            }
            $scope.update();
        };

        $scope.attemptLimitReached = function(){
            var task = $scope.tasks[$scope.currentTask];
            if (task === undefined) {
                return false;
            }
            return task.attempts >= 3;
        };

        $scope.showRetry = function() {
            return $scope.attemptLimitReached() || $scope.submissionCorrect;
        };

        $scope.checkSubmission = function(){
            return $scope.submissionCorrect;
        };

        // Map create and update functions
        $scope.createMap = function(tasks){
            var levels = [];
            var levelsObj = _.groupBy(tasks, 'level');
            var tasksObj;

            _.each(levelsObj, function(element, index, list){
                var j = parseInt(index)-1;
                levels[j] = {
                    'id': parseInt(index),
                    'stages': [],
                    'locked': false
                };

                tasksObj = _.groupBy(element, 'stage');

                _.each(tasksObj, function(elem, index, list){
                    var stage = {
                        'id': parseInt(index),
                        'tasks': elem,
                        'required': false,
                        'completed': false
                    };
                    stage.required = $scope.stageRequired(stage);
                    levels[j].stages.push(stage);
                });
            });
            return levels;
        };

        $scope.stageRequired = function(stage) {
            var tasks = stage.tasks;
            for (var i = 0, len = tasks.length; i < len; i++){
                if (!(tasks[i].required)) {
                    return false;
                }
            }
            return true;
        };

        $scope.stageCompleted = function(stage){
            var tasks = stage.tasks;
            for (var i = 0, len = tasks.length; i < len; i++){
                if (tasks[i].completed) {
                    return true;
                }
            }
            return false;
        };

        $scope.markStagesComplete = function(stages){
            for (var i = 0, len = stages.length; i < len; i++){
                stages[i].completed = $scope.stageCompleted(stages[i]);
            }
        };

        $scope.updateMap = function(){
            for (var i = 0, len = $scope.levels.length; i < len; i++){
                // for each stage, mark complete
                $scope.markStagesComplete($scope.levels[i].stages);
                // set locks
                $scope.levelLocked($scope.levels[i], i);
            }

        };

        $scope.levelLocked = function(level, index){
            if (index > 0) {
                var parentLevel = $scope.levels[index - 1],
                stageComplete,
                stageRequired;
                if (parentLevel.locked){
                    $scope.levels[index].locked = true;
                    return;
                }
                for (var i = 0, lenStages = parentLevel.stages.length; i < lenStages; i++){
                    stageComplete = $scope.stageCompleted(parentLevel.stages[i]);
                    stageRequired = $scope.stageRequired(parentLevel.stages[i]);
                    if (!stageComplete && stageRequired) {
                        $scope.levels[index].locked = true;
                        break;
                    }
                    else {
                        $scope.levels[index].locked = false;
                    }
                }
            }
        };

        var tasks = [
            {
                //101,
                'level': 1,
                'stage': 1,
                'minLow': 0,
                'maxLow': 15,
                'minHigh': 5,
                'maxHigh': 20,
                'minRange': 6, //>5
                'maxRange': 12, // <= 12
                'fractionMode': false,
                'required': false,
                'completed': false,
                'identifyMode': false
            },
            {
                //102,
                'level': 1,
                'stage': 2,
                'minLow': 0,
                'maxLow': 0,
                'minHigh': 1,
                'maxHigh': 1,
                'maxDenom': 12,
                'targetNumerators': 1,
                'fractionMode': true,
                'required': false,
                'completed': false,
                'identifyMode': false
            },
            {
                //103,
                'level': 1,
                'stage': 3,
                'minLow': 0,
                'maxLow': 0,
                'minHigh': 1,
                'maxHigh': 1,
                'maxDenom': 12,
                'targetNumeratorsExclude': 1,
                'fractionMode': true,
                'required': true,
                'completed': false,
                'identifyMode': false
            },
            {
                //104,
                'level': 1,
                'stage': 4,
                'minLow': 1,
                'maxLow': 19,
                'minHigh': 2,
                'maxHigh': 20,
                'fractionMode': true,
                'maxDenom': 12,
                'maxRange': 1,
                'minRange': 1,
                'required': false,
                'completed': false,
                'identifyMode': false,
                'displayMixedFraction': true
            },
            {
                //105,
                'level': 1,
                'stage': 5,
                'minLow': 1,
                'maxLow': 19,
                'minHigh': 2,
                'maxHigh': 20,
                'fractionMode': false,
                'decimalPlace': 1,
                'maxRange': 1,
                'minRange': 1,
                'required': true,
                'completed': false,
                'identifyMode': false
            },
            // {
            //     //201,
            //     'level': 2,
            //     'stage': 1,
            //     'minLow': 0,
            //     'maxLow': 0,
            //     'minHigh': 3,
            //     'maxHigh': 9,
            //     'fractionMode': true,
            //     'maxDenom': 12,
            //     'required': false,
            //     'completed': false,
            //     'identifyMode': false
            // },
            // {
            //     //202,
            //     'level': 2,
            //     'stage': 2,
            //     'minLow': 0,
            //     'maxLow': 0,
            //     'minHigh': 3,
            //     'maxHigh': 9,
            //     'targetNumEqualsHighNum': true,
            //     'fractionMode': true,
            //     'maxDenom': 12,
            //     'required': false,
            //     'completed': false,
            //     'identifyMode': false
            // },
            {
                //301,
                'level': 2,
                'stage': 6,
                'minLow': 0,
                'maxLow': 0,
                'minHigh': 100,
                'maxHigh': 100,
                'notMultipleOf':10,
                'fractionMode': false,
                'required': false,
                'completed': false,
                'identifyMode': false
            },
            {
                //302,
                'level': 2,
                'stage': 7,
                'minLow': 0,
                'maxLow': 0,
                'minHigh': 3,
                'maxHigh': 9,
                'fractionMode': true,
                'maxDenom': 12,
                'required': false,
                'completed': false,
                'identifyMode': false,
                'displayMixedFraction': true
            },
            {
                //303,
                'level': 2,
                'stage': 8,
                'minLow': 0,
                'maxLow': 0,
                'minHigh': 3,
                'maxHigh': 9,
                'fractionMode': false,
                'decimalPlace': 1,
                'required': false,
                'completed': false,
                'identifyMode': false
            },
            {
                //304,
                'level': 2,
                'stage': 9,
                'minLow': 0,
                'maxLow': 0,
                'minHigh': 1,
                'maxHigh': 1,
                'fractionMode': true,
                'maxDenom': [12, 12],
                'maxDenomLimit': 72,
                'useFirstDenomForPartition': true,
                'targetNumerators': 1,
                'required': true,
                'completed': false,
                'identifyMode': false
            },
            {
                //305,
                'level': 2,
                'stage': 10,
                'minLow': 0,
                'maxLow': 0,
                'minHigh': 1,
                'maxHigh': 1,
                'fractionMode': true,
                'maxDenom': [12, 12],
                'maxDenomLimit': 72,
                'useFirstDenomForPartition': true,
                'targetNumeratorsExclude': 1,
                'required': true,
                'completed': false,
                'identifyMode': false
            },
            {
                'level': 2,
                'stage': 11,
                'minLow': 0,
                'maxLow': 0,
                'minHigh': 1,
                'maxHigh': 1,
                'fractionMode': false,
                'decimalPlace': 2, //target parameter: The tenths place should not be zero. In other words, target should not be a multiple of 1.
                'notMultipleOf': 0.1,
                'required': false,
                'completed': false,
                'identifyMode': false
            },
            {
                'level': 2,
                'stage': 12,
                'minLow': 0.1,
                'maxLow': 0.8,
                'minHigh': 0.2,
                'maxHigh': 0.9, // relationship between Low and High: High = Low + 0.1
                'maxRange': 0.1,
                'minRange': 0.1,
                'endCapDecimalPlace': 1,
                'fractionMode': false,
                'decimalPlace': 3, //target parameter: The hundreds place should not be zero. In other words, target should not be a multiple of 0.01.
                'notMultipleOf': 0.01,
                'required': false,
                'completed': false,
                'identifyMode': false
            },
            {
                'level': 3,
                'stage': 13,
                'minLow': 0,
                'maxLow': 0,
                'minHigh': 3,
                'maxHigh': 9, 
                'fractionMode': true,
                'maxDenom': 12, // necessary partition #  for name task: denominator of target
                'required': false,
                'completed': false,
                'identifyMode': false
            },
            {
                'level': 3,
                'stage': 14,
                'minLow': 0,
                'maxLow': 0,
                'minHigh': 3,
                'maxHigh': 9,
                'fractionMode': true,
                'maxDenom': 12,
                'minRange': 3, //High > low + 2
                'useFirstDenomForPartition': true,
                'targetNumerators': 1,
                //target parameter: target must equal High/# of partitions.  (In other words, the target needs to be on the first tick mark after the student partitions the segment)
                //necessary partitoin #  for name task: denominator of target
                'required': true,
                'completed': false,
                'identifyMode': false,
                'targetNumEqualsHighNum': true
            },
            {
                'level': 3,
                'stage': 15,
                'minLow': 0,
                'maxLow': 0,
                'minHigh': 3,
                'maxHigh': 9,
                'fractionMode': true,
                'maxDenom': 12, //target parameter: Numerator must be a multiple of High. 
                'minRange': 3, //High > low + 2
                'useFirstDenomForPartition': true,
                //Pre-configured partition tool for the “Name” task: there should be an existing partition tool between the Low and HIgh.  Number of partitions should be the same as the denominator. 
                //necessary partition # for name task: denominator of target
                'required': false,
                'completed': false,
                'identifyMode': false,
                'targetNumMultipleOfHighNum': true //requires useFirstDenomForPartition
            }

            // {
            //     'taskId' : 313,
            //     'level': 3,
            //     'stage': 6,
            //     'minLow': 0,
            //     'maxLow': 0,
            //     'minHigh': 1,
            //     'maxHigh': 1,
            //     'fractionMode': false,
            //     'decimalPlace': 2,
            //     'required': true,
            //     'completed': false,
            //     'identifyMode': false
            // },
            // {
            //     'taskId' : 1,
            //     'lo': 1,
            //     'hi': 9,
            //     'target': 7,
            //     'minLow': 1,
            //     'maxLow': 1,
            //     'minHigh': 9,
            //     'maxHigh': 9,
            //     'stage': 1,
            //     'level': 1,
            //     'attempts': 0,
            //     'required': false,
            //     'completed': true
            // },
        ];

    });

})(window.mt.numberline);

(function (ns) {
    'use strict';

    var NumberHuntRibbonCtrl = [
        '$scope', 'toolMenuService',
        function(
            $scope,
            toolMenuService
            ) {

        //Make tools visible inside tasks
        var riOptionsVisible = function() {
            return !$scope.levelMap;
        };

        //Partitioning
        var riPartitionCb = function (toggle) {
            $scope.gestureHandler.togglePartitioning();
        };
        var riPartitionGet = function () {
            return $scope.gestureHandler.mode === mt.common.GESTURE_MODE_PARTITION;
        };
        var riPartition = toolMenuService.newItem.toggle('Partition', riPartitionCb, {cssClass: 'mt-ribbon-image-partition', isVisible: riOptionsVisible}, riPartitionGet);

        //Zoom
        var riZoomInCb = function(toggle) {
            $scope.gestureHandler.toggleZoomIn();
        };
        var riZoomInGet = function() {
            return $scope.gestureHandler.mode === ns.ZOOM_IN_MODE;
        };
        var riZoomIn = toolMenuService.newItem.toggle('Zoom In', riZoomInCb, {isVisible: riOptionsVisible}, riZoomInGet);

        var riZoomOutCb = function(toggle) {
            $scope.gestureHandler.toggleZoomOut();
        };
        var riZoomOutGet = function() {
            return $scope.gestureHandler.mode === ns.ZOOM_OUT_MODE;
        };
        var riZoomOut = toolMenuService.newItem.toggle('Zoom Out', riZoomOutCb, {isVisible: riOptionsVisible}, riZoomOutGet);

        var riZoomResetCb = function() {
            $scope.gestureHandler.setMode();
            $scope.graphModel.axes.x.min.x = $scope.graphModel.lowNum.copy().subtractByNum(1/4);
            $scope.graphModel.axes.x.max.x = $scope.graphModel.highNum.copy().addByNum(1/4);
            $scope.graphModel.axes.y.min.y = $scope.graphModel.lowNum.copy().subtractByNum(1/4);
            $scope.graphModel.axes.y.max.y = $scope.graphModel.highNum.copy().addByNum(1/4);
            $scope.update();
        };
        var riZoomReset = toolMenuService.newItem.button('Zoom Reset', riZoomResetCb, {isVisible: riOptionsVisible});

        //add point mode toggleAddPointMode
        var riAddPointCb = function (toggle) {
            $scope.gestureHandler.toggleAddPointMode();
            $scope.update();
        };
        var riAddPointGet = function () {
            return $scope.gestureHandler.mode === ns.ADD_POINT_MODE;
        };
        var riAddPoint = toolMenuService.newItem.toggle('AddPoint', riAddPointCb, {cssClass: 'mt-ribbon-image-add-point', isVisible: riOptionsVisible}, riAddPointGet);

        //Ribbon object
        var ribbon = {
            toolId: $scope.toolId,
            items: {
                left: [],
                center: [],
                right: [riAddPoint, riPartition, riZoomIn, riZoomOut, riZoomReset]
            }
        };

        var pointRibbon = {items: {
            left: [
                toolMenuService.newItem.button('Delete', function () {
                    var selection = $scope.selectionApi.getSelection();
                    if (selection === undefined) {
                        return;
                    }
                    var point = selection.modelObject;
                    $scope.graphModel.removePoint(point);
                    $scope.selectionApi.clear();
                    $scope.update(false);
                }, {cssClass: 'mt-ribbon-image-remove-point'})
            ],
            right: [],
            center: [],
        }};

        var partitionRibbon = {items: {
            left: [
                toolMenuService.newItem.button('Delete', function () {
                    var selection = $scope.selectionApi.getSelection();
                    if (selection === undefined) {
                        return;
                    }
                    var partition = selection.modelObject;
                    $scope.graphModel.removePartitionedRange(partition);
                    $scope.selectionApi.clear();
                    $scope.update(false);
                }, {cssClass: 'mt-ribbon-image-remove-partition'}),
                toolMenuService.newItem.seperator(),
                toolMenuService.newItem.label('Partition', {})
            ],
            center: [],
            right: [
                toolMenuService.newItem.input('partitions', function (input) {
                    var selection = $scope.selectionApi.getSelection();
                    if (selection === undefined) {
                        return;
                    }
                    var partition = selection.modelObject;
                    var intVal = parseInt(input);
                    if (isNaN(intVal) === false && intVal > 0 && intVal <= 12) {
                        partition.setNumPartitions(intVal);
                        $scope.update(false);
                    }
                }, {updateOnChange: false}, function () {
                    var selection = $scope.selectionApi.getSelection();
                    if (selection === undefined) {
                        return;
                    }
                    var partition = selection.modelObject;
                    return partition.partitions;
                })
            ]
        }};

        //register the tool's menu with toolMenuService
        this.register = function () {
            toolMenuService.setToolMenu($scope.toolId, ribbon, {containerApi: $scope.containerApi});
            toolMenuService.setToolMenu($scope.toolId, partitionRibbon, {contextId: mt.common.GRAPH_TYPE_PARTITION, selectionApi: $scope.selectionApi});
            toolMenuService.setToolMenu($scope.toolId, pointRibbon, {contextId: mt.common.GRAPH_TYPE_POINT, selectionApi: $scope.selectionApi});
        };
    }];

    angular.module('mtNumberLine')
            .controller('NumberHuntRibbonCtrl', NumberHuntRibbonCtrl);

})(window.mt.numberline);

(function (ns) {
    'use strict';

    angular.module('mtNumberLine').controller('NumberHuntSettingsCtrl', function ($scope) {
        
    });
})(window.mt.numberline);

(function (ns) {
    'use strict';

    angular.module('mtNumberLine').controller('NumberLineCtrl', function ($scope, $timeout, eventingService, safeApply, lineRectIntersectionFactory, preconfiguredToolService, toolPersistorService, dataExchangeService, $controller, toolMenuService, selectionApiFactory) {
        $scope.init = function () {
            $scope.selectionApi = selectionApiFactory.createApi(function(oldSelection) {
                if(oldSelection !== undefined && oldSelection.modelObject !== undefined) {
                    oldSelection.modelObject.isSelected = false;
                }
                $scope.update(false);
            });

            $scope.graphModel = new mt.common.GraphModel();
            $scope.graphModel.showPointLabels = true;
            $scope.viewConfig = new mt.common.GraphViewConfig(ns.DEFAULT_WIDTH, ns.DEFAULT_HEIGHT, ns.DEFAULT_MARGIN, mt.common.GRAPH_MODE_NUMBERLINE, false);
            $scope.renderer = new ns.NumberlineRenderer($scope.targetElement, $scope.graphModel, $scope.viewConfig, $scope.toolId);

            $scope.gestureHandler = new ns.NumberlineGestureHandler($scope.graphModel, $scope.viewConfig, $scope.update, $scope.selectionApi);

            var xAxis = $scope.graphModel.axes.x;
            var yAxis = $scope.graphModel.axes.y;

            xAxis.min.x = new mt.common.MtValue(ns.DEFAULT_MIN, 1.0, false);
            xAxis.max.x = new mt.common.MtValue(ns.DEFAULT_MAX, 1.0, false);
            yAxis.min.y = new mt.common.MtValue(ns.DEFAULT_MIN, 1.0, false);
            yAxis.max.y = new mt.common.MtValue(ns.DEFAULT_MAX, 1.0, false);

            xAxis.minorInterval = new mt.common.MtValue(ns.DEFAULT_TICK, 1.0, false);
            xAxis.majorInterval = new mt.common.MtValue(ns.DEFAULT_TICK, 1.0, false);
            yAxis.minorInterval = new mt.common.MtValue(ns.DEFAULT_TICK, 1.0, false);
            yAxis.majorInterval = new mt.common.MtValue(ns.DEFAULT_TICK, 1.0, false);

            $scope.viewConfig.isDouble = false;

            $scope.ribbon = $controller('NumberLineRibbonCtrl', {
                $scope: $scope
            });
            $scope.ribbon.register();

            $scope.update();

            dataExchangeService.registerTool($scope.toolId, mt.common.TYPE_NUMBER_LINE, $scope.export, $scope.import,
                $scope.containerApi, [mt.common.TYPE_TABLE, mt.common.TYPE_GRAPH]);

            toolPersistorService.registerTool($scope.toolId, mt.common.TYPE_NUMBER_LINE, $scope.containerApi, $scope.serialize, $scope.deserialize);
        };

        $scope.update = function (renderAxis) {
            if(renderAxis === undefined) {
                renderAxis = true;
            }
            $scope.renderer.render(renderAxis);
        };

        $scope.serialize = function () {
            var data = $scope.graphModel.serialize();
            data.isDouble = $scope.viewConfig.isDouble;
            return data;
        };

        $scope.deserialize = function (data) {
            $scope.selectionApi.clear();
            $scope.viewConfig.isDouble = data.isDouble;
            data.showPointLabels = true;
            $scope.graphModel.deserialize(data);
            $scope.update();
        };

        $scope.import = function(data) {
            $scope.graphModel.importPoints(data, true);

            //check whether there are any points on the xAxis
            var isDouble = false;
            _.each($scope.graphModel.points, function(point) {
                if(point.xAxis === true) {
                    isDouble = true;
                }
            });
            $scope.viewConfig.isDouble = isDouble;

            $scope.update();
        };

        $scope.export = function() {
            return $scope.graphModel.exportPoints();
        };
    });
})(window.mt.numberline);

(function (ns) {
    'use strict';

    angular.module('mtNumberLine').controller('NumberLineSettingsCtrl', function ($scope) {
        var editStrokes = {};
        var boundObjects = [];

        //bind the data model into the setting fields
        $scope.bindModel = function () {
            var axis = $scope.graphModel.axes.y;

            $scope.settings = {};

            bindObject('startX', axis.min.y.toString());
            bindObject('endX', axis.max.y.toString());
            bindObject('anchorX', axis.anchor.toString());
            bindObject('tickDelta', axis.majorInterval.toString());

            $scope.settings.fractionMode = axis.fractionMode;

            $scope.settings.isDouble = $scope.viewConfig.isDouble;
        };

        function bindObject(key, val) {
            $scope[key] = {
                value: val,
                editStrokes: editStrokes[key]
            };
            boundObjects.push(key);
        }

        //TODO - maybe we should have individual getters and setters for all of these
        //update the data model based on the setting fields
        $scope.updateModel = function (updateFor) {
            //create settings
            var settings = getSettings($scope.graphModel.axes);
            settings.fractionMode = $scope.settings.fractionMode;

            if (updateFor !== undefined) {
                //handle case where start and end vals coincide
                if (updateFor.indexOf('rangeEnd') !== -1 && settings.rangeStart.toString() === $scope.endX.value) {
                    $scope.endX.value = settings.rangeEnd.toString();
                    return;
                }
                if (updateFor.indexOf('rangeStart') !== -1 && settings.rangeEnd.toString() === $scope.startX.value) {
                    $scope.startX.value = settings.rangeStart.toString();
                    return;
                }

                if(angular.isArray(updateFor) === false) {
                    updateFor = [updateFor];
                }

                if (updateFor.indexOf('rangeStart') === -1) {
                    $scope.startX.value = settings.rangeStart.toString();
                }
                if (updateFor.indexOf('rangeEnd') === -1) {
                    $scope.endX.value = settings.rangeEnd.toString();
                }
                if (updateFor.indexOf('interval') === -1) {
                    $scope.tickDelta.value = settings.tickDelta.toString();
                }
                if (updateFor.indexOf('anchor') === -1) {
                    $scope.anchorX.value = settings.anchorX.toString();
                }
            }

            settings.rangeStart = new mt.common.MtValue(0);
            settings.rangeStart.updateFromEdit($scope.startX.value);

            settings.rangeEnd = new mt.common.MtValue(0);
            settings.rangeEnd.updateFromEdit($scope.endX.value);

            settings.tickDelta = new mt.common.MtValue(0);
            settings.tickDelta.updateFromEdit($scope.tickDelta.value);

            settings.anchorX = new mt.common.MtValue(0);
            settings.anchorX.updateFromEdit($scope.anchorX.value);

            //convert and parse settings from wrapper objects

            //fix and apply the settings to the model
            fixProperties(settings);
            applySettings($scope.graphModel.axes.x, settings);
            applySettings($scope.graphModel.axes.y, settings);
            $scope.viewConfig.isDouble = $scope.settings.isDouble;

            $scope.toggleControls(false);
            $scope.update();

            _(boundObjects).each(function (key) {
                editStrokes[key] = $scope[key].editStrokes;
            });
            boundObjects = [];
        };

        function getSettings(axes){
            var settings = {};

            settings.rangeStart = axes.x.min.x.copy();
            settings.rangeEnd = axes.x.max.x.copy();
            settings.rangeStart = axes.y.min.y.copy();
            settings.rangeEnd = axes.y.max.y.copy();

            settings.fractionMode = axes.x.fractionMode;
            settings.tickDelta = axes.x.majorInterval.copy();
            settings.anchorX = axes.x.anchor.copy();
            return settings;
        }

        function applySettings(axis, settings) {
            if(axis.isXAxis === true) {
                axis.min.x = settings.rangeStart.copy();
                axis.max.x = settings.rangeEnd.copy();
            } else {
                axis.min.y = settings.rangeStart.copy();
                axis.max.y = settings.rangeEnd.copy();
            }

            axis.fractionMode = settings.fractionMode;

            axis.majorInterval = settings.tickDelta.copy();
            axis.minorInterval = settings.tickDelta.copy();
            axis.anchor = settings.anchorX.copy();
        }

        function fixProperties(settings) {
            var temp;
            if (settings.rangeEnd.val() < settings.rangeStart.val()) {
                temp = settings.rangeEnd;
                settings.rangeEnd = settings.rangeStart;
                settings.rangeStart = temp;
                $scope.startX.value = settings.rangeStart.toString();
                $scope.endX.value = settings.rangeEnd.toString();

            }
            if (settings.tickDelta.val() < 0) {
                settings.tickDelta.multiplyByNum(-1);
            }
        }
    });
})(window.mt.numberline);

(function (ns) {
    'use strict';

    var NumberLineRibbonCtrl = [
        '$scope', 'toolMenuService', 'dataExchangeService',
        function (
                $scope,
                toolMenuService,
                dataExchangeService
                ) {

        //checks selection and selection type, workaround for $timeout bug in ribbon animation
        function hasSelection(selectionType) {
            if($scope.selectionApi.getSelection() === undefined ||
                $scope.selectionApi.getSelection().type !== selectionType) {
                return false;
            } else {
                return true;
            }
        }

        //Toggle Double Numberline
        var riDoubleCb = function (toggle) {
            $scope.viewConfig.isDouble = toggle;
            $scope.update();
        };
        var riDoubleGet = function () {
            return $scope.viewConfig.isDouble;
        };
        var riDouble = toolMenuService.newItem.toggle('Double', riDoubleCb, {cssClass: 'mt-ribbon-image-double'}, riDoubleGet);

        //Toggle Line Segment Mode
        var riSegmentCb = function () {
            if ($scope.gestureHandler.mode === mt.common.GESTURE_MODE_LINE) {
                $scope.gestureHandler.setMode();
            } else {
                $scope.gestureHandler.setMode(mt.common.GESTURE_MODE_LINE);
            }
        };
        var riSegmentGet = function () {
            return $scope.gestureHandler.mode === mt.common.GESTURE_MODE_LINE;
        };
        var riSegmentVisible = function () {
            return $scope.viewConfig.isDouble;
        };
        var riSegment = toolMenuService.newItem.toggle('Segment', riSegmentCb, {isVisible: riSegmentVisible, cssClass: 'mt-ribbon-image-vector'}, riSegmentGet);

        //Partitioning
        var partitionType = 'partition type';
        var riPartitionCb = function (toggle) {
            $scope.gestureHandler.togglePartitioning();
            $scope.update();
        };
        var riPartitionGet = function () {
            return $scope.gestureHandler.mode === mt.common.GESTURE_MODE_PARTITION;
        };
        var riPartition = toolMenuService.newItem.toggle('Partition', riPartitionCb, {cssClass: 'mt-ribbon-image-partition'}, riPartitionGet);

        //Partition settings
        var riPartitionMinCb = function(input) {
            if(hasSelection(partitionType)) {
                var partition = $scope.selectionApi.getSelection().modelObject;
                
                var intVal = parseFloat(input);
                if (isNaN(intVal) === false) {
                    partition.setMin(intVal);
                    $scope.update(false);
                }
            } 
        };
        var riPartitionMaxCb = function(input) {
            if(hasSelection(partitionType)) {
                var partition = $scope.selectionApi.getSelection().modelObject;
             
                var intVal = parseFloat(input);
                if (isNaN(intVal) === false) {
                    partition.setMax(intVal);
                    $scope.update(false);
                }
            } 
        };
        var riPartitionNumCb = function(input) {
            if(hasSelection(partitionType)) {
                var partition = $scope.selectionApi.getSelection().modelObject;
             
                var intVal = parseInt(input);
                if (isNaN(intVal) === false) {
                    partition.setNumPartitions(intVal);
                    $scope.update(false);
                }
            }
        };
        var riPartitionMinGet = function() {
            if(hasSelection(partitionType)) {
                var partition = $scope.selectionApi.getSelection().modelObject;
         
                return partition.min.toString({forceDecimal:true});
            }
        };
        var riPartitionMaxGet = function() {
            if(hasSelection(partitionType)) {
                var partition = $scope.selectionApi.getSelection().modelObject;
               
                return partition.max.toString({forceDecimal:true});
            }
        };
        var riPartitionNumGet = function() {
            if(hasSelection(partitionType)) {
                var partition = $scope.selectionApi.getSelection().modelObject;
             
                return partition.partitions;
            }
        };

        var riPartitionMin = toolMenuService.newItem.input('partition-min', riPartitionMinCb, {}, riPartitionMinGet);
        var riPartitionMax = toolMenuService.newItem.input('partition-max', riPartitionMaxCb, {}, riPartitionMaxGet);
        var riPartitionNum = toolMenuService.newItem.input('partitions', riPartitionNumCb, {label:' Divisions', updateOnChange: false}, riPartitionNumGet);

        //add point mode toggleAddPointMode
        var riAddPointCb = function (toggle) {
            $scope.gestureHandler.toggleAddPointMode();
            $scope.update();
        };
        var riAddPointGet = function () {
            return $scope.gestureHandler.mode === ns.ADD_POINT_MODE;
        };
        var riAddPoint = toolMenuService.newItem.toggle('AddPoint', riAddPointCb, {cssClass: 'mt-ribbon-image-add-point'}, riAddPointGet);

        //Snapping Mode
        var snap = mt.common.GRAPH_SNAP_MODE;
        var snapProx = mt.common.GRAPH_PROXIMITY_SNAP;
        var snapNever = mt.common.GRAPH_NO_SNAP_MODE;

        var riSnapCb = function () {
            $scope.gestureHandler.toggleSnapping(snap);
            $scope.update();
        };
        var riSnapGet = function () {
            return $scope.gestureHandler.snappingMode === snap ? true : false;
        };
        var riSnapNeverCb = function () {
            $scope.gestureHandler.toggleSnapping(snapNever);
            $scope.update();
        };
        var riSnapNeverGet = function () {
            return $scope.gestureHandler.snappingMode === snapNever ? true : false;
        };
        var riSnapProxCb = function () {
            $scope.gestureHandler.toggleSnapping(snapProx);
            $scope.update();
        };
        var riSnapProxGet = function () {
            return $scope.gestureHandler.snappingMode === snapProx ? true : false;
        };

        //Fraction Mode
        var decimals = mt.common.NUMBERLINE_DEC_MODE;
        var fractions = mt.common.NUMBERLINE_FRAC_MODE;
        var numberlineValueMode = decimals;
        
        var riFractionCb = function () {
            numberlineValueMode = fractions;
            $scope.graphModel.axes.x.fractionMode = numberlineValueMode;
            $scope.graphModel.axes.y.fractionMode = numberlineValueMode;
            $scope.update();
        };
        var riFractionGet = function () {
            return $scope.graphModel.axes.x.fractionMode === fractions;
        };

        var riDecimalCb = function () {
            numberlineValueMode = decimals;
            $scope.graphModel.axes.x.fractionMode = numberlineValueMode;
            $scope.graphModel.axes.y.fractionMode = numberlineValueMode;
            $scope.update();
        };
        var riDecimalGet = function () {
            return $scope.graphModel.axes.x.fractionMode === decimals;
        };

        var riFracDecHead = 'Non-Integer Format';
        var riDecimalOpt = toolMenuService.newItem.toggle('Decimals', riDecimalCb, {}, riDecimalGet);
        var riFracOpt = toolMenuService.newItem.toggle('Fractions', riFractionCb, {}, riFractionGet);

        var riFracModeSection = [riFracDecHead, riDecimalOpt, riFracOpt];

        var riSnapHead = 'Snap to Tick Marks';
        var riSnapProx = toolMenuService.newItem.toggle('Snap when close', riSnapProxCb, {}, riSnapProxGet);
        var riSnapAlways = toolMenuService.newItem.toggle('Always snap', riSnapCb, {}, riSnapGet);
        var riSnapNever = toolMenuService.newItem.toggle('Never snap', riSnapNeverCb, {}, riSnapNeverGet);

        var riSnapModeSection = [riSnapHead, riSnapProx, riSnapAlways, riSnapNever];

        var riExtMenu = toolMenuService.newItem.popover('Numberline Settings', [riFracModeSection, riSnapModeSection], {cssClass:'mt-numberline-ext-menu'});

        var riExport = toolMenuService.newItem.button('Export',
                    function () { dataExchangeService.exportToNewTool('graph', undefined, $scope.export());},
                    {cssClass: 'mt-ribbon-image-export'});

        //Ribbon object
        var ribbon = {
            toolId: $scope.toolId,
            items: {
                left: [],
                center: [],
                right: [riSegment, riDouble, riAddPoint, riPartition, riExtMenu, riExport]
            }
        };

        var pointType = 'point type';
        var pointRibbon = {items: {
            left: [
                toolMenuService.newItem.button('Delete', function () {
                    if(hasSelection(pointType)) {
                        var point = $scope.selectionApi.getSelection().modelObject;
                        $scope.graphModel.removePoint(point);
                        $scope.selectionApi.clear();
                        $scope.update(false);
                    }
                }, {cssClass: 'mt-ribbon-image-remove-point'}),
                toolMenuService.newItem.seperator(),
                toolMenuService.newItem.label('point', {}, function() {
                    if(hasSelection(pointType)) {
                        var point = $scope.selectionApi.getSelection().modelObject;
                        var val = point.xAxis? point.x: point.y;
                        return val.toString({forceDecimal: true});
                    }
                }),
                toolMenuService.newItem.seperator(),
                toolMenuService.newItem.input('label', function (input) {
                    if(hasSelection(pointType)) {
                        var point = $scope.selectionApi.getSelection().modelObject;
                        if (input !== point.numberLinePointLabel) {
                            point.setPointLabel(input);
                            $scope.update(false);
                        }
                    }
                }, {cssClass:'mt-ribbon-name-input', placeHolder: 'unlabeled', updateOnChange: false}, function () {
                    if(hasSelection(pointType)) {
                        var point = $scope.selectionApi.getSelection().modelObject;
                        return point.numberLinePointLabel;
                    }
                })
            ],
            center: [],
            right: []
        }};

        var partitionRibbon = {items: {
            left: [
                toolMenuService.newItem.button('Delete', function () {
                    var selection = $scope.selectionApi.getSelection();
                    if (selection === undefined) {
                        return;
                    }
                    var partition = selection.modelObject;
                    $scope.graphModel.removePartitionedRange(partition);
                    $scope.selectionApi.clear();
                    $scope.update(false);
                }, {cssClass: 'mt-ribbon-image-remove-partition'}),
                toolMenuService.newItem.seperator(),
                toolMenuService.newItem.label('Partition', {})
            ],
            center: [],
            right: [riPartitionMin,
             toolMenuService.newItem.label('Min - Max', {cssClass:'mt-ribbon-image-end-points'}),
             riPartitionMax, riPartitionNum]
        }};

        //register the tool's menu with toolMenuService
        //opts = {contextId, containerApi, selectionApi}
        this.register = function () {
            toolMenuService.setToolMenu($scope.toolId, ribbon, {containerApi: $scope.containerApi});
            toolMenuService.setToolMenu($scope.toolId, partitionRibbon, {contextId: mt.common.GRAPH_TYPE_PARTITION, selectionApi: $scope.selectionApi});
            toolMenuService.setToolMenu($scope.toolId, pointRibbon, {contextId: mt.common.GRAPH_TYPE_POINT, selectionApi: $scope.selectionApi});
        };
    }];

    angular.module('mtNumberLine')
            .controller('NumberLineRibbonCtrl', NumberLineRibbonCtrl);

})(window.mt.numberline);

(function (ns) {
    'use strict';

    angular.module('mtNumberLine').controller('PercentBarCtrl', function ($scope, $controller, safeApply, toolPersistorService, selectionApiFactory) {
        $scope.init = function () {
            $scope.selectionApi = selectionApiFactory.createApi(function(oldSelection) {
                if(oldSelection !== undefined && oldSelection.modelObject !== undefined) {
                    oldSelection.modelObject.isSelected = false;
                }
                $scope.update(false);
            });
            $scope.graphModel = new mt.common.GraphModel();
            $scope.graphModel.showPointLabels = true;
            $scope.viewConfig = new mt.common.GraphViewConfig(ns.NUMBERHUNT_WIDTH, ns.NUMBERHUNT_HEIGHT, ns.DEFAULT_MARGIN, mt.common.GRAPH_MODE_PERCENTBAR, false);
            $scope.renderer = new ns.PercentBarRenderer($scope.targetElement, $scope.graphModel, $scope.viewConfig, $scope.toolId);
            $scope.gestureHandler = new ns.PercentBarGestureHandler($scope.graphModel, $scope.viewConfig, $scope.update, $scope.selectionApi);
            //apply custom properties
            var properties = new mt.common.Properties();
            var xAxis = $scope.graphModel.axes.x;
            var yAxis = $scope.graphModel.axes.y;

            xAxis.min.x = new mt.common.MtValue(properties.getUserProperty('PERCENT_BAR_RANGE_LOW'), 1.0, false);
            xAxis.max.x = new mt.common.MtValue(properties.getUserProperty('PERCENT_BAR_RANGE_HIGH'), 1.0, false);
            yAxis.min.y = new mt.common.MtValue(properties.getUserProperty('PERCENT_BAR_RANGE_LOW'), 1.0, false);
            yAxis.max.y = new mt.common.MtValue(properties.getUserProperty('PERCENT_BAR_RANGE_HIGH'), 1.0, false);

            xAxis.minorInterval = new mt.common.MtValue(properties.getUserProperty('PERCENT_BAR_TICK_INTERVAL'), 1.0, false);
            xAxis.majorInterval = new mt.common.MtValue(properties.getUserProperty('PERCENT_BAR_TICK_INTERVAL'), 1.0, false);
            yAxis.minorInterval = new mt.common.MtValue(properties.getUserProperty('PERCENT_BAR_TICK_INTERVAL'), 1.0, false);
            yAxis.majorInterval = new mt.common.MtValue(properties.getUserProperty('PERCENT_BAR_TICK_INTERVAL'), 1.0, false);

            $scope.viewConfig.isDouble = false;//properties.getBooleanUserProperty('PERCENT_BAR_SHOW_DOUBLE');


            $scope.ribbon = $controller('PercentBarRibbonCtrl', {
                $scope: $scope
            });
            $scope.ribbon.register();

            $scope.viewConfig.realWidth = ns.NUMBERHUNT_WIDTH;
            $scope.graphModel.setHundredPercentValue(properties.getUserProperty('PERCENT_BAR_RANGE_HIGH'));
            $scope.graphModel.percentBarMode = mt.common.PERCENT_BAR_MODE_PERCENT;
            $scope.update();

            toolPersistorService.registerTool($scope.toolId, mt.common.TYPE_PERCENT_BAR, $scope.containerApi, $scope.serialize, $scope.deserialize);
        };

        $scope.update = function (renderAxis, useSafeApply) {
            if(renderAxis === undefined) {
                renderAxis = true;
            }
            $scope.renderer.render(renderAxis);
            if (useSafeApply === true) {
                safeApply($scope, function () {});
            }
        };

        $scope.serialize = function () {
            var data = $scope.graphModel.serialize();
            data.isDouble = $scope.viewConfig.isDouble;
            data.realWidth = $scope.viewConfig.realWidth;
            data.width = $scope.viewConfig.width;
            return data;
        };

        $scope.deserialize = function (data) {
            $scope.viewConfig.isDouble = data.isDouble;
            $scope.viewConfig.realWidth = data.realWidth;
            $scope.viewConfig.width = data.width;
            data.showPointLabels = true;
            $scope.graphModel.deserialize(data);
            $scope.update();
        };
    });
})(window.mt.numberline);

(function (ns) {
    'use strict';

    var PercentBarRibbonCtrl = [
        '$scope', 'toolMenuService', 'roleService',
        function (
                $scope,
                toolMenuService,
                roleService
                ) {

        var isTeacher = function () {
            return roleService.getRole() === mt.common.TEACHER_ROLE;
        };

        //Partitioning
        var riPartitionCb = function (toggle) {
            $scope.gestureHandler.togglePartitioning();
            $scope.update();
        };
        var riPartitionGet = function () {
            return $scope.gestureHandler.mode === mt.common.GESTURE_MODE_PARTITION;
        };
        var riPartitionVisible = function() {
            return $scope.graphModel.axes.y.partitions.length === 0;
        };
        var riPartition = toolMenuService.newItem.toggle('Partition', riPartitionCb, {cssClass: 'mt-ribbon-image-partition', isVisible: riPartitionVisible}, riPartitionGet);

        //add point mode toggleAddPointMode
        var riAddPointCb = function (toggle) {
            $scope.gestureHandler.toggleAddPointMode();
            $scope.update();
        };
        var riAddPointGet = function () {
            return $scope.gestureHandler.mode === ns.ADD_POINT_MODE;
        };
        var riAddPoint = toolMenuService.newItem.toggle('AddPoint', riAddPointCb, {cssClass: 'mt-ribbon-image-add-point'}, riAddPointGet);

        //Reset Bar
        var riResetCb = function () {
            $scope.gestureHandler.resetPercentBar();
        };
        var riReset = toolMenuService.newItem.button('Reset Bar', riResetCb, {cssClass: 'mt-ribbon-reset-bar', showName: true});

        //Transparency
        var riTransparencyCb = function (toggle) {
            $scope.gestureHandler.togglePercentBarTransparentMode();
        };
        var riTransparencyGet = function () {
            return $scope.graphModel.transparentMode === true;
        };
        var riTransparency = toolMenuService.newItem.toggle('Transparent', riTransparencyCb, {cssClass: 'mt-ribbon-transparent', showName: true}, riTransparencyGet);

        //Toggle Percent Bar
        var riPercentModeCb = function (mode) {
            $scope.graphModel.percentBarMode = mode;
            $scope.update();
        };

        var riPercentModeVisible = function() {
            return isTeacher();
        };
        var riPercentModeGet = function () {
            return $scope.graphModel.percentBarMode;
        };
        var riPercentModeList = [
            {name: mt.common.PERCENT_BAR_MODE_PERCENT},
            {name: mt.common.PERCENT_BAR_MODE_VALUE},
            {name: mt.common.PERCENT_BAR_MODE_ALL},
            {name: mt.common.PERCENT_BAR_MODE_NONE}
        ];

        var riPercentMode = toolMenuService.newItem.option('Percent Mode', riPercentModeCb, {isVisible: riPercentModeVisible}, riPercentModeGet, riPercentModeList);

        //duplicate
        var riDuplicateCb = function (toggle) {
            $scope.gestureHandler.toggleDuplicate();
            $scope.update();
        };
        var riDuplicateGet = function () {
            return $scope.gestureHandler.mode === ns.PERCENT_BAR_DUPLICATE;
        };
        var riDuplicateVisible = function () {
            return $scope.gestureHandler.selectedIsPrime();
        };
        var riDuplicate = toolMenuService.newItem.toggle('Duplicate', riDuplicateCb, {cssClass: 'mt-ribbon-duplicate', showName: true, isVisible: riDuplicateVisible}, riDuplicateGet);

        var riDuplicateOff = toolMenuService.newItem.button('Duplicate Off', riDuplicateCb, {isVisible: riDuplicateGet}, riDuplicateGet);

        //zoom
        var riZoomCb = function (toggle) {
            $scope.gestureHandler.toggleZoom();
            $scope.update();
        };
        var riZoomGet = function () {
            return $scope.gestureHandler.mode === ns.PERCENT_BAR_ZOOM;
        };
        var riZoom = toolMenuService.newItem.toggle('Zoom', riZoomCb, {cssClass: 'mt-ribbon-zoom', showName: true}, riZoomGet);

        var riZoomOff = toolMenuService.newItem.button('Zoom Off', riZoomCb, {isVisible: riZoomGet}, riZoomGet);

        //Ribbon object
        var ribbon = {
            toolId: $scope.toolId,
            items: {
                left: [],
                center: [],
                right: [riAddPoint, riPartition, riReset, riTransparency, riPercentMode, riDuplicateOff, riZoomOff]
            }
        };

        var pointRibbon = {items: {
            left: [
                toolMenuService.newItem.button('Delete', function () {
                    var selection = $scope.selectionApi.getSelection();
                    if (selection === undefined) {
                        return;
                    }
                    var point = selection.modelObject;
                    $scope.graphModel.removePoint(point);
                    $scope.selectionApi.clear();
                    $scope.update(false);
                }, {cssClass: 'mt-ribbon-image-remove-point'})
            ],
            right: [
                riDuplicate,
                toolMenuService.newItem.seperator(),
                riZoom
            ],
            center: [],
        }};

        var partitionRibbon = {items: {
            left: [
                toolMenuService.newItem.button('Delete', function () {
                    var selection = $scope.selectionApi.getSelection();
                    if (selection === undefined) {
                        return;
                    }
                    var partition = selection.modelObject;
                    $scope.graphModel.removePartitionedRange(partition);
                    $scope.selectionApi.clear();
                    $scope.update(false);
                }, {cssClass: 'mt-ribbon-image-remove-partition'}),
                toolMenuService.newItem.seperator(),
                toolMenuService.newItem.label('Partition', {})
            ],
            center: [],
            right: [
                riDuplicate,
                toolMenuService.newItem.seperator(),
                riZoom,
                toolMenuService.newItem.seperator(),
                toolMenuService.newItem.button('Hide Shading', function () {
                    var selection = $scope.selectionApi.getSelection();
                    if (selection === undefined) {
                        return;
                    }
                    var partition = selection.modelObject;

                    $scope.gestureHandler.hideShading(partition);
                    $scope.update(false);
                }, {cssClass: 'mt-ribbon-hide-shading', showName: true})
            ]
        }};

        //register the tool's menu with toolMenuService
        this.register = function () {
            toolMenuService.setToolMenu($scope.toolId, ribbon, {containerApi: $scope.containerApi});
            toolMenuService.setToolMenu($scope.toolId, partitionRibbon, {contextId: mt.common.GRAPH_TYPE_PARTITION, selectionApi: $scope.selectionApi});
            toolMenuService.setToolMenu($scope.toolId, pointRibbon, {contextId: mt.common.GRAPH_TYPE_POINT, selectionApi: $scope.selectionApi});
        };
    }];

    angular.module('mtNumberLine')
            .controller('PercentBarRibbonCtrl', PercentBarRibbonCtrl);

})(window.mt.numberline);

(function (ns) {
    'use strict';

    angular.module('mtNumberLine').controller('PercentBarSettingsCtrl', function ($scope) {

    });
})(window.mt.numberline);

(function (ns) {
    'use strict';

    angular.module('mtNumberLine').directive('mtMicDropControls', function ($timeout) {
        return {
            restrict: 'E',
            templateUrl: 'templates/micdropControlsTemplate.html',
            link: function(scope, element, attr){
                scope.micReady = true;  // used to delay the button switch
                scope.disableControl = false;

                scope.$watch('gameRunning', function(){
                    if (scope.gameRunning){
                        scope.micReady = !scope.gameRunning;
                    }
                    else if (!scope.gameRunning && scope.micExists() && scope.graphModel.currentMic.hitGround){
                        $timeout(resetControls, 2000);
                    }
                });

                scope.$watch('graphModel.currentMic.dropped', function(){
                    scope.disableControl = micDropping();
                });

                var micDropping = function() {
                    return scope.micExists() && scope.graphModel.currentMic.dropped;
                };

                var resetControls = function(){
                    scope.micReady = !scope.gameRunning;
                };
            }
        };
    });
})(window.mt.numberline);

(function (ns) {
    'use strict';

    angular.module('mtNumberLine').directive('mtMicDropIntro', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/micdropIntroTemplate.html',
            controller: 'MicDropCtrl'
        };
    });
})(window.mt.numberline);

(function (ns) {
    'use strict';

    angular.module('mtNumberLine').directive('mtMicDropMessages', function ($timeout) {
        return {
            restrict: 'E',
            templateUrl: 'templates/micdropMessagesTemplate.html',
            link: function(scope, element, attr){
                
                scope.playerMessage = '';
                scope.micdropped = false;

                scope.$watch('graphModel.currentMic.hitGround', function(){
                    if (scope.graphModel.currentMic && scope.graphModel.currentMic.hitGround){
                        scope.playerMessage = 'Mic Dropped!';
                        scope.micdropped = true;
                        $timeout(scope.nextTurn, 2000);
                    }
                    else {
                        scope.playerMessage = '';
                    }
                });

                scope.nextTurn = function(){
                    scope.micdropped = false;
                    if (scope.gameOver) {
                        scope.playerMessage = 'Game over.';
                    }
                    else if (scope.nextPlayer){
                        scope.playerMessage = 'Next player, ready?';
                    }
                    else {
                        scope.playerMessage = 'Next turn.';
                    }
                };
            },
        };
    });
})(window.mt.numberline);

(function (ns) {
    'use strict';

    angular.module('mtNumberLine').directive('mtMicDropTool', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/micdropToolTemplate.html',
            controller: 'MicDropCtrl',
            scope: {
                toolId: '=',
                containerApi: '='
            },
            link: function (scope, element) {
                scope.targetElement = $(element[0]).find('.mt-numberline-svg-container')[0];
                scope.init();
            }
        };
    });
})(window.mt.numberline);

(function (ns) {
    'use strict';

    angular.module('mtNumberLine').directive('mtMicDropTurns', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/micdropTurnsTemplate.html',
            link: function(scope, element, attr){
                scope.isCurrentTurn = function(turn){
                    return scope.currentTurn === turn;
                };

                scope.isPastTurn = function(turn){
                    return scope.currentTurn > turn;
                };
            }
        };
    });
})(window.mt.numberline);

(function (ns) {
    'use strict';

    angular.module('mtNumberLine').directive('mtNumberHuntMap', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/numberhuntMapTemplate.html',
            controller: 'NumberHuntCtrl'
        };
    });
})(window.mt.numberline);

(function (ns) {
    'use strict';

    angular.module('mtNumberLine').directive('mtNumberHuntMenu', function ($timeout, keypadService) {
        return {
            restrict            : 'E',
            templateUrl         : 'templates/numberhuntMenuTemplate.html',
            controller          : 'NumberHuntSettingsCtrl',
            scope: {
                exportToGraph: '=',
                update: '=',
                graphModel: '=',
                viewConfig: '=',
                gestureHandler: '=',
                containerApi: '=',
                isFraction: '='
            },
            link: function (scope, element, safeApply) {
                // remove the popup explicitly since it is in a different DOM position
                scope.$on('$destroy', function() {
                    $(element).remove();
                });

                scope.containerApi.addLocalPaletteItem({
                    inactiveClass: 'mt-icon-snl-icon-partitions',
                    activeClass: 'mt-icon-snl-icon-partitions-hl',
                    toggledClass: 'mt-icon-snl-icon-partitions-hl',
                    toggledBackgroundClass: 'mt-active-button',
                    backgroundClass: 'mt-tool-button',
                    idClass: 'mt-partition-toggle-btn',
                    callbackFn: function() {
                        scope.gestureHandler.togglePartitioning();
                    },
                    getToggleStateFn: function() {
                        return scope.gestureHandler.partitioningMode;
                    }
                });

                /****************
                Keypad
                *****************/
                scope.setKeypadVisible = function (visible, point) {
                    if (point !== undefined) {
                        scope.currentKeypadPoint = point;
                        if (scope.currentKeypadPoint !== undefined && scope.currentKeypadPoint.numberLinePointLabel === undefined) {
                            scope.currentKeypadPoint.numberLinePointLabel = '';
                        }
                        scope.keypad.setKeypadVisible(visible, $(element).find('.mt-hidden-keypad-element')[0]);
                        if (visible) {
                            scope.selectInput($(element).find('.mt-hidden-keypad-element')[0], scope.currentKeypadPoint);
                            keypadService.showKeypad(scope.keypad, function () {
                                scope.keypad.keypadInput.element.blur();
                            });
                        }
                    } else {
                        scope.keypad.setKeypadVisible(visible, document.activeElement);
                    }
                };

                scope.gestureHandler.setKeypadVisible = scope.setKeypadVisible;

                scope.isKeypadVisible = function () {
                    return scope.keypad.keypadVisible;
                };

                scope.keypad = new mt.common.Keypad();

                function setCustomKeys(fractionMode){
                    var keys = [];
                    var r;
                    for (r = 0; r < 3; r++) {
                        keys[r] = [];
                        for (var c = 0; c < 3; c++) {
                            var value = '' + ((r * 3) + c + 1);
                            var key = new mt.common.Key(value, scope.keypad.sendKeyToCurrentInput, value, value);
                            keys[r][c] = key;
                        }
                    }
                    keys[3] = [];
                    keys[3][1] = new mt.common.Key('0', scope.keypad.sendKeyToCurrentInput, '0', '0');
                    keys[3][2] = new mt.common.Key('-', scope.keypad.sendKeyToCurrentInput, '-', '-'); //negative? subtract?
                    keys[4] = [];
                    keys[4][1] = new mt.common.Key('Clr', scope.keypad.backSpaceFromCurrentInput, true, 'Clr');
                    keys[4][2] = new mt.common.Key('Ok', scope.confirmKey, undefined, 'ok');
                    if (fractionMode === true) {
                        keys[3][0] = new mt.common.Key('/', scope.keypad.sendKeyToCurrentInput, '/', 'fraction');
                        keys[4][0] = new mt.common.Key('␣', scope.addSpaceForWholeNumber, undefined, 'space');
                    } else {
                        keys[3][0] = new mt.common.Key('.', scope.keypad.sendKeyToCurrentInput, '.', 'decimal');
                    }

                    scope.keypad.setKeys(keys);
                }

                scope.addSpaceForWholeNumber = function() {

                    var keypadValue = scope.keypad.keypadInput.getValue();
                    if (keypadValue.indexOf(' ') !== -1 || keypadValue.indexOf('.') !== -1 || keypadValue.indexOf('/') !== -1 || keypadValue.length <= 0) {
                        return;
                    }
                    scope.keypad.sendKeyToCurrentInput_static(' ');
                };
                scope.confirmKey = function(updateFor) {
                    scope.keypad.keypadInput.setValue(scope.keypad.keypadInput.getValue().trim());
                    scope.setKeypadVisible(false);
                };

                setCustomKeys();
                scope.$watch('isFraction', function(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        setCustomKeys(newVal);
                    }
                });
                scope.setKeypadVisible(false);

                scope.selectInput = function(element, target) {
                    scope.graphModel.highlightTarget = target;
                    scope.keypad.keypadInput = {
                        element : element,
                        setValue : function (value) {
                            if (target.isMaxPercentLabel) {
                                scope.graphModel.maxPercentLabel = value;
                            } else {
                                target.numberLinePointLabel = value;
                            }
                            scope.update();
                        },
                        getValue : function () {
                            var valueToReturn = target.numberLinePointLabel;
                            if (target.isMaxPercentLabel) {
                                valueToReturn = scope.graphModel.maxPercentLabel;
                            }
                            if (valueToReturn === undefined) {
                                valueToReturn = '';
                            }
                            return valueToReturn;
                        },
                        update : function () {}
                    };
                    $(scope.keypad.keypadInput.element).on('blur', function() {
                        scope.setKeypadVisible(false);
                        scope.graphModel.highlightTarget = undefined;
                        scope.update();
                    });

                    scope.keypad.keypadVisible = true;

                    scope.update();
                };
            }
        };
    });
})(window.mt.numberline);

(function (ns) {
    'use strict';

    angular.module('mtNumberLine').directive('mtNumberHuntMessage', function(){
        return {
            restrict: 'E',
            templateUrl: 'templates/numberhuntMessageTemplate.html',
            controller: 'NumberHuntCtrl',
            link: function(scope, element){
                
            }
        };
    });

})(window.mt.numberline);


(function (ns) {
    'use strict';

    angular.module('mtNumberLine').directive('mtNumberHuntTool', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/numberhuntToolTemplate.html',
            controller: 'NumberHuntCtrl',
            scope: {
                toolId: '=',
                containerApi: '='
            },
            link: function (scope, element) {
                scope.targetElement = $(element[0]).find('.mt-numberline-svg-container')[0];
                scope.init();
            }
        };
    });
})(window.mt.numberline);

(function (ns) {
    'use strict';

    angular.module('mtNumberLine').directive('mtNumberLineMenu', function ($timeout) {
        return {
            restrict            : 'E',
            templateUrl         : 'templates/numberlineMenuTemplate.html',
            controller          : 'NumberLineSettingsCtrl',
            scope: {
                exportToGraph: '=',
                update: '=',
                graphModel: '=',
                viewConfig: '=',
                gestureHandler: '=',
                containerApi: '='
            },
            link: function (scope, element, safeApply) {
                scope.showPartitionMenu = false;
                scope.updateFor = undefined;
                // remove the popup explicitly since it is in a different DOM position
                scope.$on('$destroy', function() {
                    $(element).remove();
                });

                scope.controlsOpen = false;
                scope.toggleControls = function (open) {
                    if (open === undefined) {
                        open = !scope.controlsOpen;
                    }

                    if (open !== true) {
                        scope.menuOption = undefined;
                        scope.updateFor = undefined;
                    } else {
                        scope.toggleRange();
                        scope.updateFor = ['interval', 'anchor'];
                    }
                    scope.controlsOpen = open;
                };
                scope.containerApi.registerShowControls(_(scope.toggleControls).partial());

                scope.exportDataToGraph = function () {
                    scope.toggleControls(false);
                    scope.exportToGraph();
                };

                /****************
                Keypad
                *****************/
                scope.setKeypadVisible = function (visible) {
                    var tapOutFn = function(){
                        safeApply(scope, function(){});
                    };
                    scope.keypad.setKeypadVisible(visible, document.activeElement, tapOutFn);
                };

                scope.isKeypadVisible = function (visible) {
                    return scope.keypad.keypadVisible;
                };

                scope.keypad = new mt.common.Keypad();

                function setCustomKeys(){
                    var keys = [];
                    var r;
                    for (r = 0; r < 3; r++) {
                        keys[r] = [];
                        for (var c = 0; c < 3; c++) {
                            var value = '' + ((r * 3) + c + 1);
                            var key = new mt.common.Key(value, scope.keypad.sendKeyToCurrentInput, value, value);
                            keys[r][c] = key;
                        }
                    }
                    keys[3] = [];
                    keys[3][0] = new mt.common.Key('/', scope.keypad.sendKeyToCurrentInput, '/', 'fraction');
                    keys[3][1] = new mt.common.Key('0', scope.keypad.sendKeyToCurrentInput, '0', '0');
                    keys[3][2] = new mt.common.Key('-', scope.keypad.sendKeyToCurrentInput, '-', '-'); //negative? subtract?
                    keys[4] = [];
                    keys[4][0] = new mt.common.Key('.', scope.keypad.sendKeyToCurrentInput, '.', 'decimal');
                    keys[4][1] = new mt.common.Key('Clr', scope.keypad.backSpaceFromCurrentInput, true, 'Clr');
                    keys[4][2] = new mt.common.Key('Ok', scope.confirmKey, undefined, 'ok');
                    scope.keypad.setKeys(keys);
                }
                scope.confirmKey = function(updateFor) {
                    scope.updateModel((updateFor)?updateFor:scope.updateFor);
                    scope.setKeypadVisible(false);
                    scope.toggleControls(false);
                    scope.toggleRange();
                };

                scope.applyTickSettings = function() {
                    scope.confirmKey(['interval', 'anchor']);
                };

                setCustomKeys();
                scope.setKeypadVisible(false);

                scope.selectInput = function(event, target) {
                    scope.keypad.keypadInput = {
                        element : (event.target ? event.target : event.srcElement),
                        setValue : function (value) {
                            this.element.value = value;
                            target.value = value;
                            safeApply(scope, function () {});
                        },
                        getValue : function () {
                            return this.element.value;
                        },
                        update : function () {}
                    };

                    var tapOutFn = function(){
                        safeApply(scope, function(){});
                    };
                    scope.keypad.setKeypadVisible(true, undefined, tapOutFn);
                };
                scope.toggleMenuOption = function(option, open) {
                    if (open === undefined) {
                        open = (scope.menuOption !== option);
                    }
                    if (open === true) {
                        scope.updateFor = option;
                        scope.toggleRange();
                    }
                    scope.menuOption = (open ? option : undefined);
                };
                scope.toggleRange = function(side, open) {
                    if (side === 'left' || side === 'right') {
                        if (open === undefined) {
                            if (scope.rangeSide === side) {
                                scope.rangeSide = undefined;
                            } else {
                                open = true;
                                scope.rangeSide = side;
                            }
                        } else if (open === true) {
                            scope.rangeSide = side;
                        } else {
                            scope.rangeSide = undefined;
                        }
                    } else {
                        scope.rangeSide = undefined;
                    }
                    if (open === true) {
                        scope.bindModel();

                        if (scope.rangeSide === 'left') {
                            scope.updateFor = 'rangeStart';
                        } else if (scope.rangeSide === 'right') {
                            scope.updateFor = 'rangeEnd';
                        }
                        scope.toggleControls(false);
                    }
                };

                scope.toggleFraction = function (mode) {
                    scope.settings.fractionMode = mode;
                    scope.confirmKey('fraction');
                };

                scope.toggleDouble = function (on) {
                    if (on === undefined) {
                        on = !scope.settings.isDouble;
                    }
                    scope.settings.isDouble = on;
                    scope.confirmKey('double');
                };

                scope.isTeacher = function () {
                    return scope.containerApi.role === mt.common.TEACHER_ROLE;
                };

                setTimeout(function(){
                    scope.bindModel();
                });

                scope.toggleLineMode = function () {
                    scope.gestureHandler.toggleLineSegmentMode();
                };

                scope.containerApi.addLocalPaletteItem({
                    inactiveClass: 'mt-icon-snl-icon-double',
                    activeClass: 'mt-icon-snl-icon-double-hl',
                    toggledClass: 'mt-icon-snl-icon-single',
                    backgroundClass: 'mt-tool-button',
                    idClass: 'mt-snl-double-toggle-btn',
                    callbackFn: scope.toggleDouble,
                    getToggleStateFn: function() {
                        return scope.viewConfig.isDouble;
                    }
                });

                scope.containerApi.addLocalPaletteItem({
                    inactiveClass: 'mt-icon-snl-icon-draw',
                    activeClass: 'mt-icon-snl-icon-draw-hl',
                    toggledClass: 'mt-icon-snl-icon-draw-hl',
                    toggledBackgroundClass: 'mt-active-button',
                    backgroundClass: 'mt-tool-button',
                    idClass: 'mt-snl-draw-toggle-btn',
                    callbackFn: scope.toggleLineMode,
                    showFn: function() {
                        return scope.viewConfig.isDouble;
                    },
                    getToggleStateFn: function() {
                        return scope.gestureHandler.drawingMode;
                    }
                });

                scope.containerApi.addLocalPaletteItem({
                    inactiveClass: 'mt-icon-snl-icon-partitions',
                    activeClass: 'mt-icon-snl-icon-partitions-hl',
                    toggledClass: 'mt-icon-snl-icon-partitions-hl',
                    toggledBackgroundClass: 'mt-active-button',
                    backgroundClass: 'mt-tool-button',
                    idClass: 'mt-partition-toggle-btn',
                    callbackFn: function() {
                        scope.gestureHandler.togglePartitioning();
                    },
                    getToggleStateFn: function() {
                        return scope.gestureHandler.partitioningMode;
                    }
                });

                scope.containerApi.addLocalPaletteItem({
                    options: [mt.common.NUMBERLINE_FRAC_MODE, mt.common.NUMBERLINE_DEC_MODE, mt.common.NUMBERLINE_FRAC_DEC_MODE],
                    activeClass: 'mt-active-text',
                    inactiveClass: 'mt-inactive-text',
                    backgroundClass: 'mt-tool-button',
                    idClass: 'mt-frac-option-btn',
                    callbackFn: scope.toggleFraction,
                    getOptionStateFn: function() {
                        if(scope.settings !== undefined) {
                            return scope.settings.fractionMode;
                        } else {
                            return mt.common.NUMBERLINE_DEC_MODE;
                        }
                    }
                });

                scope.containerApi.addLocalPaletteItem({
                    options: [mt.common.GRAPH_SNAP_MODE, mt.common.GRAPH_NO_SNAP_MODE, mt.common.GRAPH_PROXIMITY_SNAP],
                    activeClass: 'mt-active-text',
                    inactiveClass: 'mt-inactive-text',
                    backgroundClass: 'mt-tool-button',
                    idClass: 'mt-snap-toggle-btn',
                    callbackFn: function(mode) {
                        scope.gestureHandler.toggleSnapping(mode);
                    },
                    getOptionStateFn: function() {
                        return scope.gestureHandler.snappingMode;
                    }
                });

            }
        };
    });
})(window.mt.numberline);

(function (ns) {
    'use strict';

    angular.module('mtNumberLine').directive('mtNumberLineTool', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/numberlineToolTemplate.html',
            controller: 'NumberLineCtrl',
            scope: {
                toolId: '=',
                containerApi: '='
            },
            link: function (scope, element) {
                scope.targetElement = $(element[0]).find('.mt-numberline-svg-container')[0];
                scope.init();
            }
        };
    });
})(window.mt.numberline);

(function (ns) {
    'use strict';

    angular.module('mtNumberLine').directive('mtNumberLine', function ($timeout) {

        var linkFn = function (scope, element, attrs) {
            function getEventPos(e) {
                return [e.gesture.center.pageX-$(scope.targetElement).offset().left, e.gesture.center.pageY-$(scope.targetElement).offset().top];
            }

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

            scope.drag = function (e) {
                if(throttleUpdate()) {
                    return false;
                }

                var pos = getEventPos(e);
                e.gesture.preventDefault();
                scope.gestureHandler.dragAtPos(pos[0], pos[1]);

                return false;
            };

            scope.dragStart = function (e) {
                var pos = getEventPos(e);
                scope.gestureHandler.dragStartAtPos(pos[0], pos[1]);

                return false;
            };

            scope.dragEnd = function (e) {
                scope.gestureHandler.dragEnd();
                return false;
            };

            scope.tap = function (e) {
                var pos = getEventPos(e);
                if(scope.gestureHandler.selectAtPos === undefined || scope.gestureHandler.selectAtPos(pos[0], pos[1]) === false) {
                    scope.gestureHandler.tapAtPos(pos[0], pos[1]);
                }
            };

            scope.hold = function (e) {
                var pos = getEventPos(e);
                if(scope.gestureHandler.selectAtPos !== undefined) {
                    scope.gestureHandler.selectAtPos(pos[0], pos[1], undefined, 50);
                }
            };

            scope.release = function () {
                firstPinch = true;
                lastScale = 1;
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
                    dragCenter = [pos[0], 0];
                    firstPinch = false;
                }
                else {
                    var scale = 1 / e.gesture.scale;
                    var adjustedScale = scale/lastScale;//1 + (scale/lastScale - 1)*ns.PINCH_SCALE_FACTOR;
                    adjustedScale = Math.max(ns.MIN_SCALE_FACTOR, Math.min(ns.MAX_SCALE_FACTOR, adjustedScale));
                    lastScale = scale;

                    //ignore any scaling that is less than scale tolerance
                    if(Math.abs(adjustedScale - 1.0) < ns.SCALE_TOLERANCE) {
                        adjustedScale = 1;
                    }

                    scope.gestureHandler.pinchAtPos(dragCenter, adjustedScale, [pos[0], 0]);
                    dragCenter = [pos[0], 0];
                }

                return false;
            };

        };

        return {
            template:
                '<div class="mt-numberline" ng-style="{width: viewConfig.getWidth(), height: viewConfig.getHeight()}">' +
                    '<div class="mt-numberline-svg-container"' +
                    ' hm-drag="drag($event)"' +
                    ' hm-dragstart="dragStart($event)"' +
                    ' hm-dragend="dragEnd($event)"' +
                    ' hm-tap="tap($event)" hm-options="{tap_max_touchtime : 500}"' +
                    ' hm-hold="hold($event)"' +
                    ' hm-pinch="pinch($event)"' +
                    ' hm-release="release($event)"' +
                    '>' +
                        '<svg class="mt-numberline-svg" width="100%" height="100%"></svg>' +
                    '</div>' +
                '</div>',
            replace               : true,
            restrict              : 'E',
            scope                 : true,
            link                  : linkFn
        };
    });

})(window.mt.numberline);

(function (ns) {
    'use strict';

    angular.module('mtNumberLine').directive('mtPercentBarMenu', function ($timeout, keypadService, roleService, safeApply) {
        return {
            restrict            : 'E',
            templateUrl         : 'templates/percentbarMenuTemplate.html',
            controller          : 'PercentBarSettingsCtrl',
            scope: {
                exportToGraph: '=',
                update: '=',
                graphModel: '=',
                viewConfig: '=',
                gestureHandler: '=',
                containerApi: '='
            },
            link: function (scope, element) {
                scope.showPartitionMenu = false;
                scope.updateFor = undefined;
                // remove the popup explicitly since it is in a different DOM position
                scope.$on('$destroy', function() {
                    $(element).remove();
                });

                scope.controlsOpen = false;
                scope.hundredPercentValue = 90;
                scope.toggleControls = function (open) {
                    if (open === undefined) {
                        open = !scope.controlsOpen;
                    }
                    if (open){
                        if(!scope.isTeacher()) {
                            open = false;
                        } else {
                            scope.hundredPercentValue = {
                                value: scope.graphModel.hundredPercentValue
                            };
                        }
                    }
                    scope.controlsOpen = open;
                };
                scope.containerApi.registerShowControls(_(scope.toggleControls).partial());

                scope.applyMaxInput = function () {
                    scope.graphModel.setHundredPercentValue(scope.hundredPercentValue.value);
                    scope.toggleControls(false);
                    scope.update();
                };

                /****************
                Keypad
                *****************/
                scope.setKeypadVisible = function (visible, point, isTop) {
                    var tapOutFn = function() {
                        safeApply(scope, function(){});
                    };
                    var elementClass = 'mt-value-keypad-element';
                    if (isTop === false) {
                        elementClass = 'mt-percent-keypad-element';
                    }
                    if (point !== undefined) {
                        scope.currentKeypadPoint = point;
                        if (scope.currentKeypadPoint !== undefined) {
                            if (scope.currentKeypadPoint.numberLinePointLabel === undefined) {
                                scope.currentKeypadPoint.numberLinePointLabel = '';
                            }
                            if (scope.currentKeypadPoint.numberLinePercentLabel === undefined) {
                                scope.currentKeypadPoint.numberLinePercentLabel = '';
                            }
                        }
                        
                        scope.keypad.setKeypadVisible(visible, $(element).find('.' + elementClass)[0], tapOutFn);
                        if (visible) {
                            scope.selectInput($(element).find('.' + elementClass)[0], scope.currentKeypadPoint);
                            keypadService.showKeypad(scope.keypad, function () {
                                scope.keypad.keypadInput.element.blur();
                            });
                        }
                    } else {
                        scope.keypad.setKeypadVisible(visible, document.activeElement,tapOutFn);
                    }
                };

                scope.gestureHandler.setKeypadVisible = scope.setKeypadVisible;

                scope.isKeypadVisible = function () {
                    return scope.keypad.keypadVisible;
                };

                scope.keypad = new mt.common.Keypad();

                function setCustomKeys(){
                    var keys = [];
                    var r;
                    for (r = 0; r < 3; r++) {
                        keys[r] = [];
                        for (var c = 0; c < 3; c++) {
                            var value = '' + ((r * 3) + c + 1);
                            var key = new mt.common.Key(value, scope.keypad.sendKeyToCurrentInput, value, value);
                            keys[r][c] = key;
                        }
                    }
                    keys[3] = [];
                    keys[3][0] = new mt.common.Key('%', scope.keypad.sendKeyToCurrentInput, '%', 'percent');
                    keys[3][1] = new mt.common.Key('0', scope.keypad.sendKeyToCurrentInput, '0', '0');
                    keys[3][2] = new mt.common.Key('-', scope.keypad.sendKeyToCurrentInput, '-', '-'); //negative? subtract?
                    keys[4] = [];
                    keys[4][0] = new mt.common.Key('.', scope.keypad.sendKeyToCurrentInput, '.', 'decimal');
                    keys[4][1] = new mt.common.Key('Clr', scope.keypad.backSpaceFromCurrentInput, true, 'Clr');
                    keys[4][2] = new mt.common.Key('Ok', scope.confirmKey, undefined, 'ok');
                    scope.keypad.setKeys(keys);
                }
                scope.confirmKey = function(updateFor) {

                    scope.setKeypadVisible(false);
                };

                setCustomKeys();
                scope.setKeypadVisible(false);

                scope.selectInput = function(element, target) {
                    scope.graphModel.highlightTarget = target;
                    scope.keypad.keypadInput = {
                        element : element,
                        setValue : function (value) {
                            var isTop = ($(element).hasClass('mt-percent-keypad-element')) ? false : true;
                            if (target.isMaxPercentLabel) {
                                scope.graphModel.maxPercentLabel = value;
                            } else if (target.isHundredLabel){
                                scope.graphModel.hundredPercentLabel = value;
                            } else {
                                if (isTop === true) {
                                    target.numberLinePointLabel = value;
                                } else {
                                    target.numberLinePercentLabel = value;
                                }
                            }
                            scope.update(false);
                        },
                        getValue : function () {
                            var isTop = ($(element).hasClass('mt-percent-keypad-element')) ? false : true;
                            var valueToReturn = target.numberLinePointLabel;
                            if (isTop === false) {
                                valueToReturn = target.numberLinePercentLabel;
                            }
                            if (target.isMaxPercentLabel) {
                                valueToReturn = scope.graphModel.maxPercentLabel;
                            }
                            if (target.isHundredLabel) {
                                valueToReturn = scope.graphModel.hundredPercentLabel;
                            }
                            if (valueToReturn === undefined) {
                                valueToReturn = '';
                            }
                            return valueToReturn;
                        },
                        update : function () {}
                    };

                    scope.keypad.setKeypadVisible(true);

                    scope.update(false);
                };

                scope.isTeacher = function () {
                    return roleService.getRole() === mt.common.TEACHER_ROLE;
                };

                scope.operatorValue = 2;
                scope.operatorMultiply = true;
                scope.increaseOperatorValue = function(up) {
                    scope.operatorValue += (up) ? 1 : -1;
                    scope.fixOperatorValue();
                };
                scope.fixOperatorValue = function() {
                    if (scope.operatorValue < 2)  {
                        scope.operatorValue = 2;
                    }
                };

                scope.toggleMultiplyOperator = function(multiply) {
                    if (multiply === undefined) {
                        multiply = !scope.operatorMultiply;
                    }
                    scope.operatorMultiply = multiply;
                };

                scope.togglePercentMath = function(posX){
                    scope.gestureHandler.percentMathMenu = !scope.gestureHandler.percentMathMenu;
                    if (!scope.gestureHandler.percentMathMenu) {
                        scope.gestureHandler.percentMathMenuPoint = undefined;
                        scope.gestureHandler.percentMathMenuPartition = undefined;
                    } else {
                        $('.mt-percent-bar-math').css('left', posX-160);
                    }
                    scope.gestureHandler.stackMode = undefined;
                };
                scope.gestureHandler.togglePercentMath = scope.togglePercentMath;

                scope.$watch('gestureHandler.percentMathMenu', function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        var hasTouch = !!('ontouchstart' in window) || !!('onmsgesturechange' in window);
                        var dismissOperator = hasTouch ? 'touchstart.popupDismissOperatorTouch' : 'mousedown.popupDismissOperator';
                        if (newVal) {
                            $(document).on(dismissOperator, function (e) {
                                if ($(element).find('.mt-percent-bar-math').has(e.target).length === 0) {
                                    scope.gestureHandler.percentMathMenu = false;
                                    $(document).off(dismissOperator);
                                    scope.update();
                                }
                            });
                        } else {
                            $(document).off(dismissOperator);
                        }
                    }
                });


                scope.useOperatorPercentBar = function() {
                    if (scope.gestureHandler.percentMathMenuPoint !== undefined) {
                        scope.gestureHandler.operatorPercentBar(scope.gestureHandler.percentMathMenuPoint.y.val(), scope.operatorValue, scope.operatorMultiply);
                    } else if (scope.gestureHandler.percentMathMenuPartition !== undefined) {
                        scope.gestureHandler.operatorPercentBar(scope.gestureHandler.percentMathMenuPartition.max.val(), scope.operatorValue, scope.operatorMultiply);
                    }
                    scope.togglePercentMath();
                };
            }
        };
    });
})(window.mt.numberline);

(function (ns) {
    'use strict';

    angular.module('mtNumberLine').directive('mtPercentBarTool', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/percentbarToolTemplate.html',
            controller: 'PercentBarCtrl',
            scope: {
                toolId: '=',
                containerApi: '='
            },
            link: function (scope, element) {
                scope.targetElement = $(element[0]).find('.mt-numberline-svg-container')[0];
                scope.init();

                scope.$watch('graphModel.transparentMode', function(newVal, oldVal) {
                    if (newVal !== oldVal) {
                        if (newVal) {
                            $(element).parents('.mt-workspace-component').addClass('mt-transparent-mode');
                        } else {
                            $(element).parents('.mt-workspace-component').removeClass('mt-transparent-mode');
                        }
                    }
                }, true);
            }
        };
    });
})(window.mt.numberline);

angular.module('mtNumberLine').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/micdropControlsTemplate.html',
    "<div class=micdrop-controls ng-hide=setPlayersScreen><div class=micdrop-control ng-hide=gameOver><button class=startButton ng-show=\"micReady && !nextPlayer\" hm-tap=startMic()>Start</button> <button class=dropButton ng-hide=micReady hm-tap=dropMic() ng-disabled=disableControl>Drop the Mic!</button> <button class=mt-micdrop-nextPlayerButton ng-show=\"micReady && nextPlayer\" hm-tap=setNextPlayer()>OK</button></div><div class=micdrop-control ng-show=\"gameOver && !graphModel.gameFinished\"><button class=finishButton hm-tap=finishGame()>Finish</button></div></div>"
  );


  $templateCache.put('templates/micdropIntroTemplate.html',
    "<div class=micdrop-intro-overlay ng-show=setPlayersScreen><div class=micdrop-intro><div class=micdrop-intro-drone><div class=micdrop-intro-mic></div></div><div class=micdrop-intro-info><p>Drop the mic so it lands closest to the target.</p><div><label for=micdrop-players>Number of Players?</label><select name=micdrop-players id=micdrop-players ng-model=players><option value=4>4</option><option value=3>3</option><option value=2>2</option></select></div><div>Each player will have <span class=micdrop-attempts>{{numberOfTurns/players}}</span> attempts to hit the target.</div><button class=micdrop-start-game ng-click=startGame()>Continue</button></div></div></div>"
  );


  $templateCache.put('templates/micdropMessagesTemplate.html',
    "<div class=micdrop-message-overlay><div class=micdrop-message-wrapper ng-class=\"{'micdropped' : micdropped}\"><div class=micdrop-message>{{playerMessage}}</div></div></div>"
  );


  $templateCache.put('templates/micdropToolTemplate.html',
    "<div class=\"row-fluid micDrop\"><mt-mic-drop-intro></mt-mic-drop-intro><mt-mic-drop-turns></mt-mic-drop-turns><mt-mic-drop-messages ng-hide=setPlayersScreen></mt-mic-drop-messages><mt-number-line ng-hide=setPlayersScreen></mt-number-line><mt-mic-drop-controls></mt-mic-drop-controls><div class=micDropTest><input class=testControlTime type=checkbox ng-model=controlTime><input class=testDeltaTime type=number step=any ng-model=deltaTime ng-change=deltaChanged()></div></div>"
  );


  $templateCache.put('templates/micdropTurnsTemplate.html',
    "<div class=micdrop-turns ng-hide=setPlayersScreen>Players:<div class=micdrop-turn-set ng-repeat=\"player in playerSet\" ng-class=player.color><div class=\"micdrop-turn micdrop-turn-{{turn}}\" ng-class=\"{ 'micdrop-current-turn' : isCurrentTurn(turn), 'micdrop-turn-over' : isPastTurn(turn) }\" ng-repeat=\"turn in player.turnSet\"></div></div></div>"
  );


  $templateCache.put('templates/numberhuntMapTemplate.html',
    "<div class=\"mt-number-hunt-map mt-allow-scroll\" ng-show=levelMap><div class=mt-level ng-repeat=\"level in levels\" ng-class=\"{'mt-locked': level.locked, 'mt-current-level': isCurrentLevel(level.id)}\"><h4 class=mt-level-label>Level {{level.id}}</h4><div id=stage{{stage.id}} class=mt-stage ng-repeat=\"stage in level.stages\" ng-class=\"{'mt-required': stage.required, 'mt-completed': stage.completed}\"><div class=mt-stage-label>Stage {{stage.id}}</div><div id=task{{task.taskId}} class=mt-task-box ng-repeat=\"task in stage.tasks\" hm-tap=selectTask(task) ng-class=\"{'mt-current-task': isCurrentTask(task.taskId), 'mt-completed': task.completed, 'mt-task-mode-identify': task.identifyMode}\"><span class=mt-task-mode>{{task.identifyMode ? \"Name\" : \"Locate\"}}</span></div></div><div class=\"btn btn-link mt-prev-level\" hm-tap=goToLevel(true) ng-hide=isFirstLevel()>« level {{$index}}</div><div class=\"btn btn-link mt-next-level\" hm-tap=goToLevel() ng-hide=\"isLastLevel() || $parent.levels[$index+1].locked\">level {{$index+2}} »</div></div></div>"
  );


  $templateCache.put('templates/numberhuntMenuTemplate.html',
    "<div><input class=mt-hidden-keypad-element type=hidden ng-model=currentKeypadPoint.numberLinePointLabel></div>"
  );


  $templateCache.put('templates/numberhuntMessageTemplate.html',
    "<div class=\"mt-hunt-message alert alert-block\" ng-class=\"submissionCorrect ? 'alert-success' : 'alert-error'\" ng-show=answerSubmitted ng-switch=checkSubmission()><p ng-switch-when=true><strong>Well Done!</strong></p><p ng-switch-when=false><strong>Not Quite...</strong> can you see how you might improve?</p></div>"
  );


  $templateCache.put('templates/numberhuntToolTemplate.html',
    "<div class=\"row-fluid mt-number-hunt\"><mt-number-hunt-map></mt-number-hunt-map><div ng-hide=levelMap><div class=mt-hunt-task-nav><div class=\"btn mt-back-btn mt-back-to-map\" hm-tap=goToMap()>BACK TO MAP</div><div class=mt-task-title><h4>Level {{currentLevel}}</h4><div ng-hide=graphModel.huntOptions.isIdentify class=mt-number-hunt-target>Locate the Target: <span class=mt-hunt-num>{{graphModel.huntNum.toString(graphModel.huntOptions)}}</span></div><div ng-show=graphModel.huntOptions.isIdentify class=mt-number-hunt-target ng-class=\"{'mt-identify-mode': graphModel.huntOptions.isIdentify}\">Name the <strong>{{graphModel.huntOptions.targetViewType}}</strong></div></div><div class=mt-task-progress></div></div><mt-number-line></mt-number-line><div class=mt-number-hunt-task-info ng-class=\"{'mt-identify-mode': graphModel.huntOptions.isIdentify}\"><mt-number-hunt-message></mt-number-hunt-message><div class=mt-check-task ng-hide=answerSubmitted><button class=\"mt-number-hunt-submit btn btn-large\" hm-tap=submit() ng-disabled=!answerPresent()>Check ({{3 - tasks[currentTask].attempts}} attempts left)</button></div><div class=mt-hunt-result ng-show=answerSubmitted ng-switch=checkSubmission()><button class=\"mt-back-level-btn btn btn-large\" hm-tap=goToMap()>« back level map</button> <button class=\"mt-try-again-btn btn btn-large btn-warning\" ng-switch-when=false ng-hide=attemptLimitReached() hm-tap=tryAgain()>Try again</button> <button class=\"mt-new-problem-btn btn btn-large btn-warning\" ng-show=showRetry() hm-tap=retryTask()>Try a new problem</button> <button ng-switch-when=true ng-show=hasNextTask() class=\"mt-next-task-btn btn btn-large btn-success\" hm-tap=goToNextTask(currentTask)>next task »</button></div></div></div><mt-number-hunt-menu update=update export-to-graph=exportToGraph graph-model=graphModel view-config=viewConfig gesture-handler=gestureHandler container-api=containerApi is-fraction=isFraction></mt-number-hunt-menu></div>"
  );


  $templateCache.put('templates/numberlineItemDoubleTemplate.html',
    "<div><b class=\"mt-double-nl-toggle icon mt-icon-double-nl\" ng-class=\"{'mt-icon-single-nl':settings.isDouble}\" ng-click=toggleDouble()></b></div>"
  );


  $templateCache.put('templates/numberlineItemFractionTemplate.html',
    "<div class=\"mt-fraction-toggle icon\" ng-click=toggleFraction()><span class=mt-whole ng-class=\"{'mt-unselected':!settings.useFraction}\">1</span> <span class=mt-half ng-class=\"{'mt-unselected':settings.useFraction}\">½</span></div>"
  );


  $templateCache.put('templates/numberlineItemLineTemplate.html',
    "<div><b class=\"icon mt-icon-draw-line\" ng-class=\"{'mt-icon-draw-line-hl':gestureHandler.drawingMode}\" ng-click=toggleLineMode()></b></div>"
  );


  $templateCache.put('templates/numberlineMenuTemplate.html',
    "<div><div class=mt-interval-menu ng-show=controlsOpen><div>Set tick marks every:</div><mt-input keypad=keypad model=tickDelta class=\"input-small mt-numberline-tick-input\" placeholder=value required></mt-input><div>from:</div><mt-input keypad=keypad model=anchorX class=\"input-small mt-numberline-anchor-input\" placeholder=value required></mt-input><div class=mt-interval-menu-ok><div class=\"mt-interval-ok-btn mt-ok-btn mt-center\" ng-click=applyTickSettings()>Ok</div></div></div><div class=\"mt-range-touch mt-range-touch-top mt-range-touch-left\" ng-click=\"toggleRange('left')\"><div class=mt-range-touch-inner></div></div><div class=\"mt-range-touch mt-range-touch-bottom mt-range-touch-left\" ng-click=\"toggleRange('left')\" ng-show=viewConfig.isDouble><div class=mt-range-touch-inner></div></div><div class=\"mt-range-touch mt-range-touch-top mt-range-touch-right\" ng-click=\"toggleRange('right')\"><div class=mt-range-touch-inner></div></div><div class=\"mt-range-touch mt-range-touch-bottom mt-range-touch-right\" ng-click=\"toggleRange('right')\" ng-show=viewConfig.isDouble><div class=mt-range-touch-inner></div></div><div class=\"mt-range-menu mt-left\" ng-show=\"rangeSide == 'left'\"><div><mt-input keypad=keypad model=startX class=\"input-small mt-numberline-min-input\" placeholder=value required></mt-input></div><div class=mt-button-holder><div class=\"mt-range-start-ok-btn mt-ok-btn mt-center\" ng-click=\"confirmKey('rangeStart')\">Ok</div></div></div><div class=\"mt-range-menu mt-right\" ng-show=\"rangeSide == 'right'\"><div><mt-input keypad=keypad model=endX class=\"input-small mt-numberline-max-input\" placeholder=value required></mt-input></div><div class=mt-button-holder><div class=\"mt-range-end-ok-btn mt-ok-btn mt-center\" ng-click=\"confirmKey('rangeEnd')\">Ok</div></div></div></div>"
  );


  $templateCache.put('templates/numberlineToolTemplate.html',
    "<div class=\"row-fluid mt-numberline\"><h3 ng-show=conversionWarning style=\"color:red; position: absolute\">Input value was rounded while converting to fractions</h3><div class=mt-numberline-container><mt-number-line></mt-number-line><mt-number-line-menu update=update export-to-graph=exportToGraph graph-model=graphModel view-config=viewConfig gesture-handler=gestureHandler container-api=containerApi></mt-number-line-menu></div></div>"
  );


  $templateCache.put('templates/percentbarMenuTemplate.html',
    "<div><input class=\"mt-hidden-keypad-element mt-value-keypad-element\" type=hidden ng-model=currentKeypadPoint.numberLinePointLabel><input class=\"mt-hidden-keypad-element mt-percent-keypad-element\" type=hidden ng-model=currentKeypadPoint.numberLinePercentLabel><div class=mt-percent-bar-math ng-show=gestureHandler.percentMathMenu><div class=mt-percent-constant><div class=\"mt-constant-control mt-constant-control-up\" hm-tap=increaseOperatorValue(true)>▲</div><input type=number ng-change=fixOperatorValue() ng-model=operatorValue><div class=\"mt-constant-control mt-constant-control-down\" hm-tap=increaseOperatorValue(false)>▼</div></div><div class=\"mt-percent-operator mt-percent-multiply\" ng-class=\"{'mt-active': operatorMultiply}\" hm-tap=toggleMultiplyOperator(true)>X</div><div class=\"mt-percent-operator mt-percent-divide\" ng-class=\"{'mt-active': !operatorMultiply}\" hm-tap=toggleMultiplyOperator(false)>÷</div><div class=mt-percent-bar-confirm><div class=mt-percent-bar-cancel hm-tap=togglePercentMath()>✗</div><div class=mt-percent-bar-ok hm-tap=useOperatorPercentBar()>✓</div></div></div><div class=mt-interval-menu ng-show=controlsOpen><div>Set 100% value:</div><mt-input keypad=keypad model=hundredPercentValue class=\"input-small mt-percent-bar-max-input\" placeholder=value required></mt-input><div class=mt-interval-menu-ok><div class=\"mt-percent-bar-max-ok-btn mt-ok-btn center\" ng-click=applyMaxInput()>Ok</div></div></div></div>"
  );


  $templateCache.put('templates/percentbarToolTemplate.html',
    "<div class=\"row-fluid mt-percent-bar\"><div class=mt-percent-bar-container><mt-number-line></mt-number-line><mt-percent-bar-menu update=update export-to-graph=exportToGraph graph-model=graphModel view-config=viewConfig gesture-handler=gestureHandler container-api=containerApi></mt-percent-bar-menu></div></div>"
  );

}]);
