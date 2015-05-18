

if (!window.mt) {
    window.mt = {};
}

window.mt.gamebuilder = {};
angular.module('mtGameBuilder', ['mt.common']);


(function () {
    'use strict';

    if (!window.mt) {
        window.mt = {};
    }

    if (!window.mt.gamebuilder) {
        window.mt.gamebuilder = {};
    }

    angular.module('mtGameBuilder', ['mt.common', 'ui.bootstrap'])

        .config(function (toolRegistryServiceProvider) {
            var template = {
                id: 'gameBuilderToolbarItem',
                type: mt.common.TYPE_GAME_BUILDER,
                displayName: 'Game Builder',
                available: true,
                htmlTemplate: '<mt-game-builder-tool tool-id="toolId" container-api="containerApi" id="tool-{{toolId}}"></mt-game-builder-tool>',
                applet: true
            };
            toolRegistryServiceProvider.addTemplate(template);
        });

    window.mt.loadModules.push('mtGameBuilder');
})();

(function (ns) {
    'use strict';

    ns.ADD_MONSTER_MODE = 'addMonsterMode';
    ns.ADD_POLYGON_MODE = 'addPolygonMode';
    ns.ADD_PORTAL_MODE = 'addPortalMode';

    ns.GAME_MONSTER = 'gameMonster';
    ns.GAME_POLYGON = 'gamePolygon';
    ns.GAME_PORTAL = 'gamePortal';
    ns.GAME_PLAYER = 'gamePlayer';
    ns.GAME_RIVER = 'gameRiver';
    ns.GAME_BRIDGE = 'gameBridge';
    ns.GAME_MESSAGE = 'gameMessage';

    ns.NORTH = 'N';
    ns.SOUTH = 'S';
    ns.EAST = 'E';
    ns.WEST = 'W';

    ns.GAME_POLYGON_TYPE_HOUSE ='house';
    ns.GAME_POLYGON_TYPE_FENCE_CLOSED ='fenceClosed';
    ns.GAME_POLYGON_TYPE_FENCE ='fence';
    ns.GAME_POLYGON_TYPE_DOOR ='door';
    ns.GAME_POLYGON_TYPE_PATH ='path';

    ns.GAME_PATH_X = 'X';
    ns.GAME_PATH_Y = 'Y';
    ns.GAME_PATH_XY = ns.GAME_PATH_X + ns.GAME_PATH_Y;

    ns.GAME_MODAL_MODE_NONE = 'none';
    ns.GAME_MODAL_MODE_POLYGON = 'polygon';
    ns.GAME_MODAL_MODE_MONSTER = 'monster';

    ns.GAME_STATE_NONE = 'none';
    ns.GAME_STATE_WIN = 'win';
    ns.GAME_STATE_LOSE = 'lose';

    ns.GAME_PORTAL_REFLECT_OVER_X = 'X Axis';
    ns.GAME_PORTAL_REFLECT_OVER_Y = 'Y Axis';

})(window.mt.gamebuilder);
(function (ns) {
    'use strict';

    ns.Bridge = (function (spec) {

        function Bridge(spec) {
            if (!(this instanceof Bridge)) {
                return new Bridge(spec);
            }

            spec = spec || {};

            this.id = getSpec(spec.id, mt.common.createGuid());
            this.startPosition = new ns.GamePoint(spec.startX, spec.startY);
            this.endPosition = new ns.GamePoint(spec.endX, spec.endY);

            this.path = [];

            this.isSelected = !!spec.isSelected;
        }

        function getSpec(val, defaultVal) {
            return (val !== undefined) ? val : defaultVal;
        }

        Bridge.prototype.type = function () {
            return ns.GAME_BRIDGE;
        };

        Bridge.prototype.isValid = function() {
            return (this.startPosition.x === this.endPosition.x || this.startPosition.y === this.endPosition.y);
        };


        return Bridge;
    })();
})(window.mt.gamebuilder);

(function (ns) {
    'use strict';

    ns.GameModel = (function (spec) {

        function GameModel(spec) {
            if (!(this instanceof GameModel)) {
                return new GameModel(spec);
            }

            spec = spec || {};

            this.monsters = attributeValueForKey(spec, 'monsters ', []);
            this.player = new ns.Player({x: -8, y: -8});
            this.message = new ns.Message();
            this.polygons = attributeValueForKey(spec, 'polygons ', []);
            this.portals = attributeValueForKey(spec, 'portals ', []);
            this.gameRunning = false;
            this.createLevel();
            initializeRegistry(this);
            this.playerMoveSpeed = getSpec(spec.playerMoveSpeed, 0.5);
        }

        function getSpec(val, defaultVal) {
            return (val !== undefined) ? val : defaultVal;
        }

        function attributeValueForKey(attributes, key, defaultVal) {
            return attributes[key] === undefined ? defaultVal : attributes[key];
        }

        function register(gameModel, newObject) {
            gameModel.registry[newObject.id] = newObject;
        }

        // function unregister(gameModel, oldObject) {
        //     delete gameModel.registry[oldObject.id];
        // }

        function initializeRegistry(gameModel) {
            gameModel.registry = {};

            var registerObj = _(register).partial(gameModel);

            _([gameModel.player]).each(registerObj);
            _([gameModel.message]).each(registerObj);
            _(gameModel.monsters).each(registerObj);
            _(gameModel.polygons).each(registerObj);
            _(gameModel.portals).each(registerObj);
        }

        GameModel.prototype.serialize = function() {
            var data = {
                monsters: [],
                player: this.player.serialize(),
                polygons: [],
                portals: []
            };
            for (var m in this.monsters) {
                var monster = this.monsters[m];
                var monsterData = monster.serialize();
                data.monsters.push(monsterData);
            }
            for (var po in this.polygons) {
                var polygon = this.polygons[po];
                var polygonData = polygon.serialize();
                data.polygons.push(polygonData);
            }
            for (var p in this.portals) {
                var portal = this.portals[p];
                var portalData = portal.serialize();
                data.portals.push(portalData);
            }
            return data;
        };

        GameModel.prototype.deserialize = function(data) {
            this.registry = {};

            this.monsters = [];
            this.player = new ns.Player();
            this.player.deserialize(data.player);
            this.polygons = [];
            this.portals = [];

            for (var m in data.monsters) {
                var monsterData = data.monsters[m];
                var monster = new ns.Monster();
                monster.deserialize(monsterData);
                this.monsters.push(monster);
            }
            for (var po in data.polygons) {
                var polygonData = data.polygons[po];
                var polygon = new ns.Polygon();
                polygon.deserialize(polygonData);
                this.polygons.push(polygon);
            }
            for (var p in data.portals) {
                var portalData = data.portals[p];
                var portal = new ns.Portal();
                portal.deserialize(portalData);
                this.portals.push(portal);
            }
            initializeRegistry(this);
        };

        GameModel.prototype.update = function() {
            if (this.gameRunning === false) {
                return ns.GAME_STATE_NONE;
            }
            var player = this.player;
            for (var poly in this.polygons) {
                var polygon = this.polygons[poly];
                var length = polygon.points.length;
                if (polygon.polyType === ns.GAME_POLYGON_TYPE_FENCE || polygon.polyType === ns.GAME_POLYGON_TYPE_PATH) {
                    length = polygon.points.length - 1;
                }
                for (var pp = 0; pp < length; pp++) {
                    var polyPoint1 = polygon.points[pp];
                    var polyPoint2 = polygon.points[(pp + 1) % polygon.points.length];

                    if (this.lineSegmentsIntersects(player.currentPosition, player.previousPosition, polyPoint1, polyPoint2)) {
                        player.collidedWith(polygon);
                        if (polygon.polyType === ns.GAME_POLYGON_TYPE_DOOR) {
                            return ns.GAME_STATE_WIN;
                        }
                        return ns.GAME_STATE_NONE;
                    }
                }
            }
            for (var mon in this.monsters) {
                var monster = this.monsters[mon];
                if (!monster.isPathValid()) {
                    continue;
                }
                var monsterDist = getDistance(player.currentPosition, monster.currentPosition);
                if (monsterDist < 0.5) {
                    player.collidedWith(monster);
                    return ns.GAME_STATE_LOSE;
                }
            }
            for (var port in this.portals) {
                var portal = this.portals[port];
                if (portal.isValid() === false) {
                    continue;
                }
                var portalDistance = getDistance(player.currentPosition, portal.start);
                if (portalDistance < 0.5) {
                    player.collidedWith(portal);
                    return ns.GAME_STATE_NONE;
                }
            }
            player.collidedWith();
            return ns.GAME_STATE_NONE;
        };

        GameModel.prototype.getObject = function (id) {
            return this.registry[id];
        };
        
        GameModel.prototype.select = function (gameObject) {
            // return if the object isn't registered in the model
            if (!this.getObject(gameObject.id)) {
                return;
            }
            this.deselectAll();
            gameObject.isSelected = true;
        };

        GameModel.prototype.deselectAll = function () {
            var deselectObject = function (object) {
                object.isSelected = false;
            };

            _(this.monsters).each(deselectObject);
            this.player.isSelected = false;
            _(this.polygons).each(deselectObject);
            _(this.portals).each(deselectObject);
        };

        GameModel.prototype.addMonster = function(monster) {
            this.deselectAll();
            this.monsters.push(monster);
            register(this, monster);
        };

        GameModel.prototype.addPolygon = function(polygon) {
            this.deselectAll();
            this.polygons.push(polygon);
            register(this, polygon);
        };

        GameModel.prototype.addPortal = function(portal) {
            this.deselectAll();
            this.portals.push(portal);
            register(this, portal);
        };

        GameModel.prototype.addPlayer = function(player) {
            this.deselectAll();
            this.player = player;
            register(this, player);
        };

        GameModel.prototype.startGame = function(start) {
            if (start === undefined) {
                start = true;
            }
            if (start === true) {
                this.player.startGame();
                for (var m in this.monsters) {
                    var monster = this.monsters[m];
                    monster.startGame();
                }
            }
            this.gameRunning = start;
        };

        GameModel.prototype.restartGame = function() {
            this.startGame(false);
            this.startGame(true);
        };



        GameModel.prototype.moveUp = function() {
            this.player.movePlayerBy(0, this.playerMoveSpeed);
        };

        GameModel.prototype.moveLeft = function() {
            this.player.movePlayerBy(-this.playerMoveSpeed, 0);
        };

        GameModel.prototype.moveRight = function() {
            this.player.movePlayerBy(this.playerMoveSpeed, 0);
        };

        GameModel.prototype.moveDown = function() {
            this.player.movePlayerBy(0, -this.playerMoveSpeed);
        };

        function getDistance(first, second) {
            var distX = second.getX() - first.getX();
            var distY = second.getY() - first.getY();
            return Math.sqrt((distX * distX) + (distY * distY));
        }

        function newDistIsCloser(newDist, oldDist) {
            return (oldDist === undefined || newDist < oldDist);
        }

        function distanceToLineSeqment(point, lineStart, lineEnd) {
            var length = getDistance(lineStart, lineEnd);
            if (length === 0) {
                return getDistance(point, lineStart);
            }
            var t = ((point.getX() - lineStart.getX()) * (lineEnd.getX() - lineStart.getX()) +
                (point.getY() - lineStart.getY()) * (lineEnd.getY() - lineStart.getY())) /
                (length * length);
            if (t < 0) {
                return getDistance(point, lineStart);
            }
            if (t > 1){
                return getDistance(point, lineEnd);
            }
            var newPoint = new ns.GamePoint(lineStart.getX() + t * (lineEnd.getX() - lineStart.getX()),
                lineStart.getY() + t * (lineEnd.getY() - lineStart.getY()));
            return getDistance(point, newPoint);
        }

        GameModel.prototype.getClosestObject = function(point) {
            var closestObj = {};
            for (var m in this.monsters) {
                var monster = this.monsters[m];
                if (monster.selectable === false) {
                    continue;
                }
                var distToMonster = getDistance(monster.position, point);
                if (newDistIsCloser(distToMonster, closestObj.dist)) {
                    closestObj.dist = distToMonster;
                    closestObj.obj = monster;
                }
            }
            for (var port in this.portals) {
                var portal = this.portals[port];
                if (portal.selectable === false) {
                    continue;
                }
                var distToPortal = getDistance(portal.start, point);
                if (newDistIsCloser(distToPortal, closestObj.dist)) {
                    closestObj.dist = distToPortal;
                    closestObj.obj = portal;
                }
            }
            for (var poly in this.polygons) {
                var polygon = this.polygons[poly];
                if (polygon.selectable === false) {
                    continue;
                }
                var length = polygon.points.length;
                if (polygon.polyType === ns.GAME_POLYGON_TYPE_FENCE || polygon.polyType === ns.GAME_POLYGON_TYPE_PATH) {
                    length = polygon.points.length - 1;
                }
                for (var p = 0; p < length; p++) {
                    var point1 = polygon.points[p];
                    var point2 = polygon.points[(p + 1) % polygon.points.length];
                    var distanceToPolygonLine = distanceToLineSeqment(point, point1, point2);
                    if (newDistIsCloser(distanceToPolygonLine, closestObj.dist)) {
                        closestObj.dist = distanceToPolygonLine;
                        closestObj.obj = polygon;
                    }
                }
            }
            return closestObj;
        };

        //check if c is between a and b
        GameModel.prototype.pointOnLine = function(a, b, c) {
            var EPSILON = 2.220446049250313e-16;
            var crossproduct = (c.y - a.y) * (b.x - a.x) - (c.x - a.x) * (b.y - a.y);
            if (Math.abs(crossproduct) > EPSILON) {
                return false;
            }

            var dotproduct = (c.x - a.x) * (b.x - a.x) + (c.y - a.y)*(b.y - a.y);
            if (dotproduct < 0) {
                return false;
            }

            var squaredlengthba = (b.x - a.x)*(b.x - a.x) + (b.y - a.y)*(b.y - a.y);
            if (dotproduct > squaredlengthba) {
                return false;
            }

            return true;
        };

        GameModel.prototype.lineSegmentsIntersects = function(aStart, aEnd, bStart, bEnd) {
            if ((aStart.x === aEnd.x && aStart.y === aEnd.y) ||
                (bStart.x === bEnd.x && bStart.y === bEnd.y)) {
                return false;
            }
            var p0_x = aStart.getX();
            var p0_y = aStart.getY();
            var p1_x = aEnd.getX();
            var p1_y = aEnd.getY();
            var p2_x = bStart.getX();
            var p2_y = bStart.getY();
            var p3_x = bEnd.getX();
            var p3_y = bEnd.getY();

            var s1_x = p1_x - p0_x;
            var s1_y = p1_y - p0_y;
            var s2_x = p3_x - p2_x;
            var s2_y = p3_y - p2_y;
            var delta = -s2_x * s1_y + s1_x * s2_y;
            if (delta === 0) {
                return (this.pointOnLine(aStart, aEnd, bStart) ||
                    this.pointOnLine(aStart, aEnd, bEnd) ||
                    this.pointOnLine(bStart, bEnd, aStart) ||
                    this.pointOnLine(bStart, bEnd, aEnd));
            }
            var s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / delta;
            var t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / delta;
            return (s >= 0 && s <= 1 && t >= 0 && t <= 1);
        };

        GameModel.prototype.moveToward = function(startPoint, toPoint, delta, speed) {
            var endPoint = new ns.GamePoint(startPoint.x, startPoint.y);
            var distance = getDistance(startPoint, toPoint);

            var deltaLeft = 0;

            if (distance !== 0) {
                var xDiff = toPoint.x - startPoint.x;
                var yDiff = toPoint.y - startPoint.y;
                var moveDist = delta * speed;

                endPoint.x += (moveDist / distance) * xDiff;
                endPoint.y += (moveDist / distance) * yDiff;

                if (getDistance(startPoint, endPoint) >= distance) {
                    deltaLeft = getDistance(toPoint, endPoint) / speed;
                    endPoint.x = toPoint.x;
                    endPoint.y = toPoint.y;
                }
            }
            return {
                endPoint: endPoint,
                deltaLeft: deltaLeft
            };
        };

        GameModel.prototype.gameCycle = function(delta){
            for (var m in this.monsters) {
                var monster = this.monsters[m];
                var nextPoint = monster.getCurrentPathPoint();
                var moveToObj = {
                    endPoint: nextPoint,
                    deltaLeft: delta
                };
                var moves = 3; //some sanity checking
                while (moveToObj.deltaLeft !== 0 && moves > 0) {
                    moveToObj = this.moveToward(monster.currentPosition, nextPoint, moveToObj.deltaLeft, 1);
                    if (moveToObj.deltaLeft !== 0) {
                        monster.setNextPath();
                        nextPoint = monster.getCurrentPathPoint();
                    }
                    moves--;
                }

                monster.currentPosition.x = moveToObj.endPoint.getX();
                monster.currentPosition.y = moveToObj.endPoint.getY();
            }
        };

        GameModel.prototype.createLevel = function() {
            //TERRAIN
            var topWallPolygon = new ns.Polygon({
                polyType: ns.GAME_POLYGON_TYPE_FENCE_CLOSED,
                points: [
                    {x: -10, y: 10},
                    {x: 10, y: 10},
                    {x: 10, y: 9.5},
                    {x: -10, y: 9.5}
                ],
                selectable: false,
                visible: true
            });
            this.polygons.push(topWallPolygon);
            var bottomWallPolygon = new ns.Polygon({
                polyType: ns.GAME_POLYGON_TYPE_FENCE_CLOSED,
                points: [
                    {x: -10, y: -10},
                    {x: 10, y: -10},
                    {x: 10, y: -9.5},
                    {x: -10, y: -9.5}
                ],
                selectable: false,
                visible: true
            });
            this.polygons.push(bottomWallPolygon);
            var topLeftWallPolygon = new ns.Polygon({
                polyType: ns.GAME_POLYGON_TYPE_FENCE_CLOSED,
                points: [
                    {x: -10, y: 9.5},
                    {x: -9.5, y: 9.5},
                    {x: -9.5, y: 5.5},
                    {x: -10, y: 5.5}
                ],
                selectable: false,
                visible: true
            });
            this.polygons.push(topLeftWallPolygon);
            var topRightWallPolygon = new ns.Polygon({
                polyType: ns.GAME_POLYGON_TYPE_FENCE_CLOSED,
                points: [
                    {x: 10, y: 9.5},
                    {x: 9.5, y: 9.5},
                    {x: 9.5, y: 5.5},
                    {x: 10, y: 5.5}
                ],
                selectable: false,
                visible: true
            });
            this.polygons.push(topRightWallPolygon);
            var bottomLeftWallPolygon = new ns.Polygon({
                polyType: ns.GAME_POLYGON_TYPE_FENCE_CLOSED,
                points: [
                    {x: -10, y: -9.5},
                    {x: -9.5, y: -9.5},
                    {x: -9.5, y: -3},
                    {x: -10, y: -3}
                ],
                selectable: false,
                visible: true
            });
            this.polygons.push(bottomLeftWallPolygon);
            var bottomRightWallPolygon = new ns.Polygon({
                polyType: ns.GAME_POLYGON_TYPE_FENCE_CLOSED,
                points: [
                    {x: 10, y: -9.5},
                    {x: 9.5, y: -9.5},
                    {x: 9.5, y: -3},
                    {x: 10, y: -3}
                ],
                selectable: false,
                visible: true
            });
            this.polygons.push(bottomRightWallPolygon);

            var leftWallPolygon = new ns.Polygon({
                polyType: ns.GAME_POLYGON_TYPE_FENCE_CLOSED,
                points: [
                    {x: -10, y: -2},
                    {x: -9.5, y: -2},
                    {x: -9.5, y: 4.5},
                    {x: -10, y: 4.5}
                ],
                selectable: false,
                visible: true
            });
            this.polygons.push(leftWallPolygon);
            var rightWallPolygon = new ns.Polygon({
                polyType: ns.GAME_POLYGON_TYPE_FENCE_CLOSED,
                points: [
                    {x: 10, y: -2},
                    {x: 9.5, y: -2},
                    {x: 9.5, y: 4.5},
                    {x: 10, y: 4.5}
                ],
                selectable: false,
                visible: true
            });
            this.polygons.push(rightWallPolygon);

            //RIVER
            var riverPoly1 = new ns.Polygon({
                polyType: ns.GAME_POLYGON_TYPE_FENCE_CLOSED,
                points: [
                    {x: -9.5, y: 0.5},
                    {x: 0.5, y: 0.5},
                    {x: 0.5, y: -0.5},
                    {x: -9.5, y: -0.5}
                ],
                selectable: false,
                visible: true
            });
            this.polygons.push(riverPoly1);
            var riverPoly2 = new ns.Polygon({
                polyType: ns.GAME_POLYGON_TYPE_FENCE_CLOSED,
                points: [
                    {x: -0.5, y: -0.5},
                    {x: 0.5, y: -0.5},
                    {x: 0.5, y: -3},
                    {x: -0.5, y: -3}
                ],
                selectable: false,
                visible: true
            });
            this.polygons.push(riverPoly2);
            var riverPoly3 = new ns.Polygon({
                polyType: ns.GAME_POLYGON_TYPE_FENCE_CLOSED,
                points: [
                    {x: -0.5, y: -4},
                    {x: 0.5, y: -4},
                    {x: 0.5, y: -9.5},
                    {x: -0.5, y: -9.5}
                ],
                selectable: false,
                visible: true
            });
            this.polygons.push(riverPoly3);
            var outerWall = new ns.Polygon({
                polyType: ns.GAME_POLYGON_TYPE_FENCE_CLOSED,
                points: [
                    {x: -10, y: -10},
                    {x: 10, y: -10},
                    {x: 10, y: 10},
                    {x: -10, y: 10}
                ],
                selectable: false,
                visible: true
            });
            this.polygons.push(outerWall);

            //BRIDGE
            var topBridge = new ns.Polygon({
                polyType: ns.GAME_POLYGON_TYPE_FENCE,
                points: [
                    {x: -1.5, y: -3},
                    {x: 1.5, y: -3}
                ],
                selectable: false,
                visible: true
            });
            this.polygons.push(topBridge);
            var bottomBridge = new ns.Polygon({
                polyType: ns.GAME_POLYGON_TYPE_FENCE,
                points: [
                    {x: -1.5, y: -4},
                    {x: 1.5, y: -4}
                ],
                selectable: false,
                visible: true
            });
            this.polygons.push(bottomBridge);

            //PORTALS --- for testing purposes
            // var portalTopLeft = new ns.Portal({
            //     startX: -9.5,
            //     startY: 5,
            //     endX: 9.5,
            //     endY: 5,
            //     selectable: false,
            //     visible: true
            // });
            // this.portals.push(portalTopLeft);
            // var portalTopRight = new ns.Portal({
            //     startX: 9.5,
            //     startY: 5,
            //     endX: -9.5,
            //     endY: 5,
            //     selectable: false,
            //     visible: true
            // });
            // this.portals.push(portalTopRight);
            // var portalBottomLeft = new ns.Portal({
            //     startX: -9.5,
            //     startY: -2.5,
            //     endX: 9.5,
            //     endY: -2.5,
            //     selectable: false,
            //     visible: true
            // });
            // this.portals.push(portalBottomLeft);
            // var portalBottomRight = new ns.Portal({
            //     startX: 9.5,
            //     startY: -2.5,
            //     endX: -9.5,
            //     endY: -2.5,
            //     selectable: false,
            //     visible: true
            // });
            // this.portals.push(portalBottomRight);
        };

        return GameModel;
    })();
})(window.mt.gamebuilder);

(function (ns) {
    'use strict';

    ns.GamePoint = (function (x, y) {

        function GamePoint(x, y) {
            if (!(this instanceof GamePoint)) {
                return new GamePoint(x, y);
            }

            this.x = getSpec(x, 0);
            this.y = getSpec(y, 0);
        }

        function getSpec(val, defaultVal) {
            return (val !== undefined) ? val : defaultVal;
        }

        GamePoint.prototype.serialize = function() {
            var data = {
                x: this.x,
                y: this.y
            };
            return data;
        };

        GamePoint.prototype.deserialize = function(data) {
            this.x = data.x;
            this.y = data.y;
        };

        GamePoint.prototype.getX = function() {
            return (isNaN(this.x)) ? 0 : Number(this.x);
        };

        GamePoint.prototype.getY = function() {
            return (isNaN(this.y)) ? 0 : Number(this.y);
        };

        return GamePoint;
    })();
})(window.mt.gamebuilder);

(function (ns) {
    'use strict';

    ns.GameRenderer = (function (gameModel) {

        function GameRenderer(gameModel) {
            if (!(this instanceof GameRenderer)) {
                return new GameRenderer(gameModel);
            }

            this.gameModel = gameModel;
            this.oldExpressions = [];
        }

        function getCorner(i) {
            switch (i) {
                case 0:
                    return [-1, 1];
                case 2:
                    return [1, -1];
                case 3:
                    return [-1, -1];
            }
            return [1, 1];
        }

        function getLineExpressionFromPoints(point1, point2) {
            return getLineExpression(point1.getX(), point1.getY(), point2.getX(), point2.getY());
        }

        function getLineExpression(point1x, point1y, point2x, point2y) {
            return '((1-t)*' + point1x + ' + t*' + point2x + ',(1-t)*' + point1y + ' + t*' + point2y + ')';
        }

        GameRenderer.prototype.getPlayerExpression = function() {
            var player = this.gameModel.player;
            if (player !== undefined) {
                var position = player.position;
                if (this.gameModel.gameRunning === true) {
                    position = player.currentPosition;
                }
                var playerExpression = {
                    id: '' + player.id,
                    latex: '(' + position.getX() + ',' + position.getY() + ')',
                    color: '#FF0000'
                };
                return [playerExpression];
            }
            return [];
        };

        GameRenderer.prototype.getMonsterExpressions = function() {
            var expressions = [];
            for (var m in this.gameModel.monsters) {
                var monster = this.gameModel.monsters[m];
                if (this.gameModel.gameRunning &&
                    !monster.isPathValid()) {
                    continue;
                }
                var position = monster.position;
                if (this.gameModel.gameRunning === true) {
                    position = monster.currentPosition;
                }
                var monsterExpression = {
                    id: '' + monster.id,
                    latex: '(' + position.getX() + ',' + position.getY() + ')',
                    color: '#006400'
                };
                expressions.push(monsterExpression);
            }
            return expressions;
        };

        GameRenderer.prototype.getPolygonExpressions = function() {
            var expressions = [];
            var polygons = this.gameModel.polygons.slice(0);
            if (this.gameModel.gameRunning !== true) {
                for (var m in this.gameModel.monsters) {
                    var monster = this.gameModel.monsters[m];
                    var monsterPathPolygon = monster.getPolygonFromPath();
                    monsterPathPolygon.id = monster.id + 'path';
                    if (monster.isPathValid() === false) {
                        monsterPathPolygon.isInvalid = true;
                    }
                    polygons.push(monsterPathPolygon);
                }
            }
            for (var poly in polygons) {
                var polygon = polygons[poly];
                if (this.gameModel.gameRunning && polygon.visible === false) {
                    continue;
                }

                var length = polygon.points.length;
                var color = '#640000';
                switch(polygon.polyType) {
                    case ns.GAME_POLYGON_TYPE_FENCE_CLOSED:
                        color = '#640000';
                        break;
                    case ns.GAME_POLYGON_TYPE_FENCE:
                        length = polygon.points.length - 1;
                        color = '#640000';
                        break;
                    case ns.GAME_POLYGON_TYPE_DOOR:
                        color = '#006400';
                        break;
                    case ns.GAME_POLYGON_TYPE_HOUSE:
                        color = '#000064';
                        break;
                    case ns.GAME_POLYGON_TYPE_PATH:
                        color = '#0000FF';
                        length = polygon.points.length - 1;
                        if (polygon.isInvalid === true) {
                            color = '#FF0000';
                        }
                        break;
                }
                for (var pp = 0; pp < length; pp++) {
                    var polyPoint1 = polygon.points[pp];
                    var polyPoint2 = polygon.points[(pp + 1) % polygon.points.length];

                    var polyExpression = {
                        id: '' + polygon.id + '_line' + pp,
                        latex: getLineExpressionFromPoints(polyPoint1, polyPoint2),
                        color: color,
                        visible: false
                    };
                    expressions.push(polyExpression);
                }
            }
            return expressions;
        };

        GameRenderer.prototype.getPortalExpressions = function() {
            var expressions = [];
            for (var port in this.gameModel.portals) {
                var portal = this.gameModel.portals[port];
                if (this.gameModel.gameRunning && (portal.visible === false || !portal.isValid())) {
                    continue;
                }
                var isValid = portal.isValid();
                for (var i = 0; i < 4; i++) {
                    var firstCorner = getCorner(i);
                    var secondCorner = getCorner((i + 1) % 4);
                    var width = 1;
                    var height = 1;
                    if (portal.isReflectedOverY() === true) {
                        width /= 2;
                    }
                    if (this.gameModel.gameRunning === false) {
                        var endInnerExpression = {
                            id: '' + portal.id + '_end_inner_' + i,
                            latex: getLineExpression(portal.end.getX() + (firstCorner[0] * width / 4), portal.end.getY() + (firstCorner[1] * height / 4), portal.end.getX() + (secondCorner[0] * width / 4), portal.end.getY() + (secondCorner[1] * height / 4)),
                            color: (isValid) ? '#AAAAFF' : '#FFAAAA'
                        };
                        var endOuterExpression = {
                            id: '' + portal.id + '_end_outer_' + i,
                            latex: getLineExpression(portal.end.getX() + (firstCorner[0] * width / 2), portal.end.getY() + (firstCorner[1] * height / 2), portal.end.getX() + (secondCorner[0] * width / 2), portal.end.getY() + (secondCorner[1] * height / 2)),
                            color: (isValid) ? '#FFFFAA' : '#FFAAAA'
                        };
                        expressions.push(endInnerExpression);
                        expressions.push(endOuterExpression);
                    }
                    var startInnerExpression = {
                        id: '' + portal.id + '_start_inner_' + i,
                        latex: getLineExpression(portal.start.getX() + (firstCorner[0] * width / 4), portal.start.getY() + (firstCorner[1] * height / 4), portal.start.getX() + (secondCorner[0] * width / 4), portal.start.getY() + (secondCorner[1] * height / 4)),
                        color: (isValid) ? '#0000FF' : '#FF0000'
                    };
                    var startOuterExpression = {
                        id: '' + portal.id + '_start_outer_' + i,
                        latex: getLineExpression(portal.start.getX() + (firstCorner[0] * width / 2), portal.start.getY() + (firstCorner[1] * height / 2), portal.start.getX() + (secondCorner[0] * width / 2), portal.start.getY() + (secondCorner[1] * height / 2)),
                        color: (isValid) ? '#FFFF00' : '#FF0000'
                    };
                    expressions.push(startInnerExpression);
                    expressions.push(startOuterExpression);
                }
            }
            return expressions;
        };
        GameRenderer.prototype.drawDesmos = function(calculator, quickUpdate) {
            if (calculator === undefined) {
                return;
            }
            var expressions = [];

            expressions = expressions.concat(this.getMonsterExpressions());
            expressions = expressions.concat(this.getPlayerExpression());
            if (quickUpdate !== true) {
                expressions = expressions.concat(this.getPolygonExpressions());
                expressions = expressions.concat(this.getPortalExpressions());
                calculator.removeExpressions(this.oldExpressions);
            }
            this.oldExpressions = expressions;
            calculator.setExpressions(expressions);
        };

        return GameRenderer;
    })();
})(window.mt.gamebuilder);

(function (ns) {
    'use strict';

    ns.Message = (function (spec) {

        function Message(spec) {
            if (!(this instanceof Message)) {
                return new Message(spec);
            }

            spec = spec || {};

            this.id = getSpec(spec.id, mt.common.createGuid());
            this.text = getSpec(spec.text, '');

            this.isSelected = !!spec.isSelected;
        }

        function getSpec(val, defaultVal) {
            return (val !== undefined) ? val : defaultVal;
        }

        Message.prototype.serialize = function() {
            var data = {
                id: this.id,
                text: this.text
            };
            return data;
        };

        Message.prototype.deserialize = function(data) {
            this.id = data.id;
            this.text = data.text;
        };

        Message.prototype.type = function () {
            return ns.GAME_MESSAGE;
        };

        Message.prototype.setText = function(text) {
            this.text = text;
        };

        Message.prototype.getText = function() {
            return this.text;
        };


        return Message;
    })();
})(window.mt.gamebuilder);

(function (ns) {
    'use strict';

    ns.Monster = (function (spec) {

        function Monster(spec) {
            if (!(this instanceof Monster)) {
                return new Monster(spec);
            }

            spec = spec || {};

            this.id = getSpec(spec.id, mt.common.createGuid());
            this.currentPosition = new ns.GamePoint(spec.x, spec.y);
            this.position = new ns.GamePoint(spec.x, spec.y);
            this.maxPaths = getSpec(spec.maxPaths, 4);
            this.name = getSpec(spec.name, 'Monster');
            this.currentPath = 0;

            this.paths = [];

            this.isSelected = !!spec.isSelected;
        }

        function getSpec(val, defaultVal) {
            return (val !== undefined) ? val : defaultVal;
        }

        Monster.prototype.serialize = function() {
            var data = {
                id: this.id,
                position: this.position.serialize(),
                paths: []
            };
            for (var p in this.paths) {
                var point = this.paths[p];
                data.paths.push(point.serialize());
            }
            return data;
        };

        Monster.prototype.deserialize = function(data) {
            this.id = data.id;
            this.position = new ns.GamePoint();
            this.position.deserialize(data.position);
            this.paths = [];
            for (var p in data.paths) {
                var pathData = data.paths[p];
                var path = new ns.Path();
                path.deserialize(pathData);
                this.paths.push(path);
            }
        };

        Monster.prototype.type = function () {
            return ns.GAME_MONSTER;
        };

        Monster.prototype.canMakeMorePath = function() {
            return this.paths.length < this.maxPaths;
        };

        Monster.prototype.addPath = function() {
            var path = new ns.Path();
            this.paths.push(path);
            if (this.paths.length > this.maxPaths) {
                this.paths.length = this.maxPaths;
            }
        };

        Monster.prototype.removePath = function(index) {
            this.paths.splice(index, 1);
        };

        Monster.prototype.isPathValid = function() {
            var x = 0;
            var y = 0;
            for (var p in this.paths) {
                var path = this.paths[p];
                if (path.moveX()) {
                    x += path.direction.getX();
                }
                if (path.moveY()) {
                    y += path.direction.getY();
                }
            }
            return x === 0 && y === 0;
        };



        Monster.prototype.getPolygonFromPath = function() {
            var polygon = new ns.Polygon({
                    visible: false,
                    selectable: false,
                    polyType: ns.GAME_POLYGON_TYPE_PATH,
                    isOpen: true
                });
            polygon.points = [];
            if (this.paths.length > 0) {
                var x = this.position.getX();
                var y = this.position.getY();
                var startPoint = new ns.GamePoint(x, y);
                polygon.points.push(startPoint);
                for (var p in this.paths) {
                    var path = this.paths[p];
                    if (path.moveX()) {
                        x += path.direction.getX();
                    }
                    if (path.moveY()) {
                        y += path.direction.getY();
                    }
                    var point = new ns.GamePoint(x, y);
                    polygon.points.push(point);
                }
            }
            return polygon;
        };

        Monster.prototype.startGame = function() {
            this.currentPath = 0;
            this.currentPosition.x = this.position.getX();
            this.currentPosition.y = this.position.getY();
        };

        Monster.prototype.setNextPath = function() {
            this.currentPath = (this.currentPath + 1) % this.paths.length;
        };

        Monster.prototype.getCurrentPathPoint = function() {
            var newPoint = new ns.GamePoint(this.position.getX(), this.position.getY());
            for (var p = 0; p <= this.currentPath && p < this.paths.length; p++) {
                var path = this.paths[p];
                if (path.moveX() === true) {
                    newPoint.x += path.direction.getX();
                }
                if (path.moveY() === true) {
                    newPoint.y += path.direction.getY();
                }
            }
            return newPoint;
        };

        return Monster;
    })();
})(window.mt.gamebuilder);

(function (ns) {
    'use strict';

    ns.Path = (function (spec) {

        function Path(spec) {
            if (!(this instanceof Path)) {
                return new Path(spec);
            }

            spec = spec || {};
            this.direction = new ns.GamePoint(spec.x, spec.y);
            this.moveTo = new ns.GamePoint(0, 0);
            this.move = getSpec(spec.move, ns.GAME_PATH_X);
            this.options = [
                ns.GAME_PATH_X,
                ns.GAME_PATH_Y
            ];
        }

        function getSpec(val, defaultVal) {
            return (val !== undefined) ? val : defaultVal;
        }

        Path.prototype.serialize = function() {
            var data = {
                direction: this.direction.serialize(),
                moveTo: this.moveTo.serialize(),
                move: this.move
            };
            return data;
        };

        Path.prototype.deserialize = function(data) {
            this.direction = new ns.GamePoint();
            this.direction.deserialize(data.direction);
            this.moveTo = new ns.GamePoint();
            this.moveTo.deserialize(data.moveTo);
            this.move = data.move;
        };

        Path.prototype.moveX = function() {
            return this.move.indexOf(ns.GAME_PATH_X) > -1;
        };

        Path.prototype.moveY = function() {
            return this.move.indexOf(ns.GAME_PATH_Y) > -1;
        };

        return Path;
    })();
})(window.mt.gamebuilder);

(function (ns) {
    'use strict';

    ns.Player = (function (spec) {

        function Player(spec) {
            if (!(this instanceof Player)) {
                return new Player(spec);
            }

            spec = spec || {};

            this.id = getSpec(spec.id, mt.common.createGuid());
            this.previousPosition = new ns.GamePoint(spec.x, spec.y);
            this.currentPosition = new ns.GamePoint(spec.x, spec.y);
            this.position = new ns.GamePoint(spec.x, spec.y);
            this.isSelected = !!spec.isSelected;
            this.hasWarped = false;
        }

        function getSpec(val, defaultVal) {
            return (val !== undefined) ? val : defaultVal;
        }

        Player.prototype.serialize = function() {
            var data = {
                id: this.id,
                position: this.position.serialize()
            };
            return data;
        };

        Player.prototype.deserialize = function(data) {
            this.id = data.id;
            this.position = new ns.GamePoint();
            this.position.deserialize(data.position);
        };

        Player.prototype.type = function () {
            return ns.GAME_PLAYER;
        };

        Player.prototype.startGame = function () {
            this.currentPosition.x = this.position.getX();
            this.currentPosition.y = this.position.getY();
            this.previousPosition.x = this.position.getX();
            this.previousPosition.y = this.position.getY();
        };

        Player.prototype.movePlayerBy = function(x, y) {
            this.previousPosition.x = this.currentPosition.getX();
            this.previousPosition.y = this.currentPosition.getY();
            this.currentPosition.x = this.currentPosition.getX() + x;
            this.currentPosition.y = this.currentPosition.getY() + y;
        };

        Player.prototype.collidedWith = function(obj) {
            if (obj === undefined) {
                this.hasWarped = false;
                return;
            }
            switch(obj.type()) {
                case ns.GAME_POLYGON:
                    if(obj.polyType === ns.GAME_POLYGON_TYPE_FENCE ||
                        obj.polyType === ns.GAME_POLYGON_TYPE_FENCE_CLOSED) {
                        this.currentPosition.x = this.previousPosition.getX();
                        this.currentPosition.y = this.previousPosition.getY();
                    } else if (obj.polyType === ns.GAME_POLYGON_TYPE_DOOR) {
                        this.startGame();
                    }
                break;
                case ns.GAME_PORTAL:
                    if (this.hasWarped === false) {
                        this.currentPosition.x = obj.end.getX();
                        this.currentPosition.y = obj.end.getY();
                        this.previousPosition.x = obj.end.getX();
                        this.previousPosition.y = obj.end.getY();
                    }
                    this.hasWarped = true;
                break;
                case ns.GAME_MONSTER:
                    this.startGame();
                break;
            }
            return;
        };

        return Player;
    })();
})(window.mt.gamebuilder);

(function (ns) {
    'use strict';

    ns.Polygon = (function (spec) {

        function Polygon(spec) {
            if (!(this instanceof Polygon)) {
                return new Polygon(spec);
            }

            spec = spec || {};

            this.id = getSpec(spec.id, mt.common.createGuid());
            this.points = [];
            if (spec.points === undefined) {
                this.points.push(new ns.GamePoint(-1, 1));
                this.points.push(new ns.GamePoint(1, 1));
                this.points.push(new ns.GamePoint(1, -1));
                this.points.push(new ns.GamePoint(-1, -1));
            } else {
                for (var p in spec.points) {
                    var point = spec.points[p];
                    this.points.push(new ns.GamePoint(point.x, point.y));
                }
            }
            this.isSelected = !!spec.isSelected;

            this.visible = getSpec(spec.visible, true);
            this.selectable = getSpec(spec.selectable, true);

            this.polyType = getSpec(spec.polyType, ns.GAME_POLYGON_TYPE_HOUSE);
        }

        function getSpec(val, defaultVal) {
            return (val !== undefined) ? val : defaultVal;
        }

        Polygon.prototype.serialize = function() {
            var data = {
                id: this.id,
                points: [],
                visible: this.visible,
                selectable: this.selectable,
                polyType: this.polyType
            };
            for (var p in this.points) {
                var point = this.points[p];
                data.points.push(point.serialize());
            }
            return data;
        };

        Polygon.prototype.deserialize = function(data) {
            this.id = data.id;
            this.points = [];
            for (var p in data.points) {
                var pointData = data.points[p];
                var point = new ns.GamePoint();
                point.deserialize(pointData);
                this.points.push(point);
            }
            this.visible = data.visible;
            this.selectable = data.selectable;
            this.polyType = data.polyType;
        };


        Polygon.prototype.setPolyType = function(polyType) {
            this.polyType = polyType;
        };

        Polygon.prototype.getPolyType = function() {
            return this.polyType;
        };

        Polygon.prototype.type = function () {
            return ns.GAME_POLYGON;
        };

        return Polygon;
    })();
})(window.mt.gamebuilder);

(function (ns) {
    'use strict';

    ns.Portal = (function (spec) {

        function Portal(spec) {
            if (!(this instanceof Portal)) {
                return new Portal(spec);
            }

            spec = spec || {};

            this.id = getSpec(spec.id, mt.common.createGuid());
            this.start = new ns.GamePoint(spec.startX, spec.startY);
            this.end = new ns.GamePoint(spec.endX, spec.endY);
            this.visible = getSpec(spec.visible, true);
            this.selectable = getSpec(spec.selectable, true);
            this.isSelected = !!spec.isSelected;
            this.reflectOver = getSpec(spec.reflectOver, ns.GAME_PORTAL_REFLECT_OVER_X);
        }

        function getSpec(val, defaultVal) {
            return (val !== undefined) ? val : defaultVal;
        }

        Portal.prototype.serialize = function() {
            var data = {
                id: this.id,
                start: this.start.serialize(),
                end: this.end.serialize(),
                visible: this.visible,
                selectable: this.selectable,
                reflectOver: this.reflectOver
            };
            return data;
        };

        Portal.prototype.deserialize = function(data) {
            this.id = data.id;
            this.start = new ns.GamePoint();
            this.start.deserialize(data.start);
            this.end = new ns.GamePoint();
            this.end.deserialize(data.end);
            this.visible = data.visible;
            this.selectable = data.selectable;
            this.reflectOver = data.reflectOver;
        };

        Portal.prototype.type = function () {
            return ns.GAME_PORTAL;
        };

        Portal.prototype.getStart = function() {
            return this.start;
        };

        Portal.prototype.getEnd = function() {
            return this.end;
        };

        Portal.prototype.isSameSpot = function() {
            return this.start.getX() === this.end.getX() && this.start.getY() === this.end.getY();
        };

        Portal.prototype.setReflectOver = function(reflectOver) {
            this.reflectOver = reflectOver;
        };

        Portal.prototype.getReflectOver = function() {
            return this.reflectOver;
        };

        Portal.prototype.isReflectedOverX = function() {
            return this.reflectOver === ns.GAME_PORTAL_REFLECT_OVER_X;
        };
        Portal.prototype.isReflectedOverY = function() {
            return this.reflectOver === ns.GAME_PORTAL_REFLECT_OVER_Y;
        };

        Portal.prototype.isMirrored = function() {
            if (this.reflectOver === ns.GAME_PORTAL_REFLECT_OVER_X) {
                return (this.start.getX() === this.end.getX() && this.start.getY() === -(this.end.getY()));
            } else if (this.reflectOver === ns.GAME_PORTAL_REFLECT_OVER_Y) {
                return (this.start.getX() === -(this.end.getX()) && this.start.getY() === this.end.getY());
            }
            return false;
            // return (this.start.getX() === this.end.getX() && this.start.getY() === -(this.end.getY()))||
            // (this.start.getX() === -(this.end.getX()) && this.start.getY() === this.end.getY());
        };

        Portal.prototype.isValid = function() {
            return !this.isSameSpot() && this.isMirrored();
        };

        return Portal;
    })();
})(window.mt.gamebuilder);

(function (ns) {
    'use strict';

    ns.River = (function (spec) {

        function River(spec) {
            if (!(this instanceof River)) {
                return new River(spec);
            }

            spec = spec || {};

            this.id = getSpec(spec.id, mt.common.createGuid());
            this.position = new ns.GamePoint(spec.x, spec.y);
            this.direction = getSpec(spec.direction, ns.NORTH);
            this.isSelected = !!spec.isSelected;
        }

        function getSpec(val, defaultVal) {
            return (val !== undefined) ? val : defaultVal;
        }

        River.prototype.type = function () {
            return ns.GAME_RIVER;
        };

        River.prototype.getDirection = function() {
            return this.direction;
        };


        return River;
    })();
})(window.mt.gamebuilder);

(function (ns) {
    'use strict';

    angular.module('mtGameBuilder').controller('GameBuilderCtrl', function ($scope, toolPersistorService, $controller, selectionApiFactory) {

        $scope.init = function () {
            $scope.selectionApi = selectionApiFactory.createApi(function(oldSelection) {
                if(oldSelection !== undefined && oldSelection.modelObject !== undefined) {
                    oldSelection.modelObject.isSelected = false;
                }
            });
            $scope.ribbon = $controller('GameBuilderRibbonCtrl', {
                $scope: $scope
            });
            $scope.ribbon.register();
            if ($scope.gameModel === undefined) {
                $scope.gameModel = new ns.GameModel();
            }
            $scope.gameRenderer = new ns.GameRenderer($scope.gameModel);
            $scope.modalMode = ns.GAME_MODAL_MODE_NONE;
            setTimeout($scope.update);
        };

        $scope.serialize = function () {
            var data = {
                gameModel: $scope.gameModel.serialize()
            };
            return data;
        };

        $scope.deserialize = function (data) {
            $scope.gameModel = new ns.GameModel();
            $scope.gameModel.deserialize(data.gameModel);
        };

        $scope.update = function(started) {
            if ($scope.gameModel !== undefined) {
                var gameState = $scope.gameModel.update();
                switch(gameState) {
                    case ns.GAME_STATE_WIN:
                        $scope.broadcastMessage('You Win!!!');
                        $scope.gameModel.restartGame();
                        break;
                    case ns.GAME_STATE_LOSE:
                        $scope.broadcastMessage('You Lost :(');
                        $scope.gameModel.restartGame();
                        break;
                }
            }
            var quickUpdate = false;
            if ($scope.gameModel.gameRunning === true) {
                quickUpdate = true;
            }
            if (started) {
                $scope.gameRenderer.drawDesmos($scope.calculator); //erase all the invisible stuff while the game is running
            }
            $scope.gameRenderer.drawDesmos($scope.calculator, quickUpdate);
        };

        $scope.createMonster = function() {
            var monster = new ns.Monster({
                name: 'Monster' + (this.gameModel.monsters.length + 1)
            });
            $scope.gameModel.addMonster(monster);
            $scope.selectObject(monster);
            $scope.update();
        };

        $scope.createPolygon = function() {
            var polygon = new ns.Polygon();
            $scope.gameModel.addPolygon(polygon);
            $scope.selectObject(polygon);
            $scope.update();
        };

        $scope.createPortal = function() {
            var portal = new ns.Portal();
            $scope.gameModel.addPortal(portal);
            $scope.selectObject(portal);
            $scope.update();
        };

        $scope.selectObject = function(modelObject, forceSelect) {
            if ((forceSelect !== true) && ($scope.gameModel.gameRunning === true || modelObject.selectable === false)) {
                return;
            }
            modelObject.isSelected = true;
            if($scope.selectionApi !== undefined) {
                $scope.selectionApi.setSelection({type: modelObject.type(), modelObject: modelObject});
            }
            switch(modelObject.type()) {
                case ns.GAME_MONSTER:
                    $scope.currentMonster = modelObject;
                    break;
                case ns.GAME_POLYGON:
                    $scope.currentPolygon = modelObject;
                    break;
                case ns.GAME_PORTAL:
                    $scope.currentPortal = modelObject;
                    break;
                case ns.GAME_MESSAGE:
                    $scope.currentMessage = modelObject;
                    break;
            }
        };

        $scope.startGameToggle = function(start) {
            if (start === undefined) {
                start = $scope.gameModel.gameRunning === false;
            }
            $scope.gameModel.startGame(start);
            $scope.update(start);
            if (start === true) {
                $scope.lastUpdateTime = Date.now();
                $scope.gameRunningTimer = setInterval(function() {
                    var time = Date.now();
                    var delta = time - $scope.lastUpdateTime;
                    $scope.lastUpdateTime = time;
                    $scope.gameModel.gameCycle(delta / 1000);
                    $scope.update();
                }, 1000 / 60);
            } else {
                clearInterval($scope.gameRunningTimer);
            }
        };

        $scope.moveUp = function() {
            $scope.gameModel.moveUp();
            $scope.update();
        };

        $scope.moveLeft = function() {
            $scope.gameModel.moveLeft();
            $scope.update();
        };

        $scope.moveRight = function() {
            $scope.gameModel.moveRight();
            $scope.update();
        };

        $scope.moveDown = function() {
            $scope.gameModel.moveDown();
            $scope.update();
        };

        function getEventPos(e) {
            return [e.gesture.center.pageX-$($scope.containerElement).offset().left, e.gesture.center.pageY-$($scope.containerElement).offset().top];
        }

        $scope.getPointOnGraph = function(x, y) {
            var state = $scope.calculator.getState();
            var width = $($scope.containerElement).width();
            var height = $($scope.containerElement).height();
            var xmax = state.graph.viewport.xmax;
            var xmin = state.graph.viewport.xmin;
            var ymax = state.graph.viewport.ymax;
            var ymin = state.graph.viewport.ymin;
            var newX = ((x/width) * (xmax - xmin)) + xmin;
            var newY = ((y/height) * (ymin - ymax)) + ymax;

            return new ns.GamePoint(newX, newY);
        };

        $scope.distanceToPixels = function(dist) {
            var state = $scope.calculator.getState();
            var xmax = state.graph.viewport.xmax;
            var xmin = state.graph.viewport.xmin;
            return (dist / (xmax - xmin)) * $($scope.containerElement).width();
        };

        $scope.tapScreen = function(e) {
            var position = getEventPos(e);
            var point = $scope.getPointOnGraph(position[0], position[1]);

            var closestObj = this.gameModel.getClosestObject(point);
            if (closestObj.obj !== undefined && closestObj.dist !== undefined) {
                var distInPx = $scope.distanceToPixels(closestObj.dist);
                if (distInPx < 20) {
                    $scope.selectObject(closestObj.obj);
                }
            }
        };

        $scope.openMonsterPath = function() {
            $scope.modalMode = ns.GAME_MODAL_MODE_MONSTER;
        };

        $scope.modalIsMonsterPath = function() {
            return $scope.modalMode === ns.GAME_MODAL_MODE_MONSTER;
        };

        $scope.openPolygonSetting = function() {
            $scope.modalMode = ns.GAME_MODAL_MODE_POLYGON;
        };

        $scope.modalIsPolygonSetting = function() {
            return $scope.modalMode === ns.GAME_MODAL_MODE_POLYGON;
        };

        $scope.modalOpen = function() {
            return $scope.modalMode !== ns.GAME_MODAL_MODE_NONE;
        };

        $scope.closeModalMonster = function() {
            $scope.broadcastMessage('You\'ve set the monster\'s path.');
            $scope.closeModal();
        };

        $scope.closeModal = function() {
            $scope.modalMode = ns.GAME_MODAL_MODE_NONE;
            $scope.update();
        };

        $scope.broadcastMessage = function(msg) {
            $scope.gameModel.message.setText(msg);
            $scope.selectObject($scope.gameModel.message, true);
        };

        toolPersistorService.registerTool($scope.toolId, mt.common.TYPE_GAME_BUILDER, $scope.containerApi, $scope.serialize, $scope.deserialize);

    });
})(window.mt.gamebuilder);
(function (ns) {
    'use strict';

    var GameBuilderRibbonCtrl = [
        '$scope', 'toolMenuService',
        function(
            $scope,
            toolMenuService
            ) {

        var riToggleGameCb = function (toggle) {
            $scope.startGameToggle();
            $scope.update();
        };
        var riGameRunningGet = function () {
            return $scope.gameModel.gameRunning === true;
        };
        var riStartGame = toolMenuService.newItem.toggle('Play', riToggleGameCb, {cssClass: 'mt-ribbon-game-running', showName: true}, riGameRunningGet);

        var riEditMode = function () {
            return $scope.gameModel.gameRunning === false;
        };

        var riMonsterCb = function () {
            $scope.createMonster();
        };
        var riMonster = toolMenuService.newItem.button('+Monster', riMonsterCb, {cssClass: 'mt-ribbon-add-monster', showName: true, isVisible: riEditMode});

        var riPolygonCb = function () {
            $scope.createPolygon();
        };
        var riPolygon = toolMenuService.newItem.button('+Landmark', riPolygonCb, {cssClass: 'mt-ribbon-add-polygon', showName: true, isVisible: riEditMode});

        var riPortalCb = function () {
            $scope.createPortal();
        };
        var riPortal = toolMenuService.newItem.button('+Portal', riPortalCb, {cssClass: 'mt-ribbon-add-portal', showName: true, isVisible: riEditMode});

        //Ribbon object
        var ribbon = {
            toolId: $scope.toolId,
            items: {
                left: [],
                center: [],
                right: [riStartGame, riMonster, riPolygon, riPortal]
            }
        };


        //PORTAL STUFF
        var getPortalValidFn = function() {
            return ($scope.currentPortal.isValid())? 'Is Valid' : 'Not Valid';
        };
        var riPortalValidLabel = toolMenuService.newItem.label('PortalValid', {}, getPortalValidFn);

        var portalFn = function(isSetter, isStart, isX) {
            if (isSetter) {
                return function(val) {
                    $scope.currentPortal[(isStart)?'start':'end'][(isX)?'x':'y'] = val;
                    $scope.update();
                };
            } else {
                return function() {
                    return $scope.currentPortal[(isStart)?'start':'end'][(isX)?'x':'y'];
                };
            }
        };
        var getPortalItems = function() {
            var items = [];
            for (var a = 0; a < 2; a++) {
                var isStart = (a === 0);
                for (var b = 0; b < 2; b++) {
                    var isX = (b === 0);
                    var name = 'Portal' + ((isStart) ? 'Start' : 'End') + ((isX) ? 'X' : 'Y');
                    if (isX) {
                        items.push(toolMenuService.newItem.label(((isStart) ? 'Start' : 'End') + ' (', {}));
                    } else {
                        items.push(toolMenuService.newItem.label(','), {});
                    }
                    items.push(toolMenuService.newItem.input(name, portalFn(true, isStart, isX), {inputType: 'number'}, portalFn(false, isStart, isX), {}));
                    if (!isX) {
                        items.push(toolMenuService.newItem.label(')'), {});
                    }
                    if (!isX && a !== 1) {
                        items.push(toolMenuService.newItem.seperator());
                    }
                }
            }
            return items;
        };

        var riPortalReflectionCb = function (option) {
            $scope.currentPortal.setReflectOver(option);
            $scope.update();
        };
        var riPortalReflectionGet = function () {
            return $scope.currentPortal.getReflectOver();
        };
        var riPortalReflectionOptions = [
            {name: ns.GAME_PORTAL_REFLECT_OVER_X},
            {name: ns.GAME_PORTAL_REFLECT_OVER_Y}
        ];
        var riPortalReflectionType = toolMenuService.newItem.option('Reflection', riPortalReflectionCb,  {cssClass: 'mt-ribbon-game-portal-reflection', showName: true}, riPortalReflectionGet, riPortalReflectionOptions);

        var riPortalReflectOverLabel = toolMenuService.newItem.label('Reflect Over');

        var portalRibbon = {
            items: {
                left: [toolMenuService.newItem.label('Portal')],
                center: [],
                right: [riPortalReflectOverLabel, riPortalReflectionType, riPortalValidLabel, toolMenuService.newItem.seperator()].concat(getPortalItems())
            }
        };

        //POLYGON STUFF

        var riPolygonCollisionCb = function (option) {
            $scope.currentPolygon.setPolyType(option);
            $scope.update();
        };
        var riPolygonCollisionGet = function () {
            return $scope.currentPolygon.getPolyType();
        };
        var riPolygonCollisionOptions = [
            {name: ns.GAME_POLYGON_TYPE_HOUSE},
            {name: ns.GAME_POLYGON_TYPE_FENCE},
            {name: ns.GAME_POLYGON_TYPE_DOOR}
        ];
        var riPolygonCollisionType = toolMenuService.newItem.option('Type', riPolygonCollisionCb,  {cssClass: 'mt-ribbon-game-polygon-collisions', showName: true}, riPolygonCollisionGet, riPolygonCollisionOptions);

        var riPolygonCollisionLabel = toolMenuService.newItem.label('Type');

        var riPolygonSettingsCb = function () {
            $scope.openPolygonSetting();
        };
        var riPolygonSetting = toolMenuService.newItem.button('Set Points', riPolygonSettingsCb, {cssClass: 'mt-ribbon-polygon-settings', showName: true});

        var polygonRibbon = {
            items: {
                left: [toolMenuService.newItem.label('Landmark')],
                center: [],
                right: [riPolygonCollisionLabel, riPolygonCollisionType, riPolygonSetting]
            }
        };

        //MONSTER STUFF
        var riMonsterLabel = toolMenuService.newItem.label('Position (', {});
        var setMonsterXFn = function(x) {
            $scope.currentMonster.position.x = x;
            $scope.update();
        };
        var getMonsterXFn = function() {
            return $scope.currentMonster.position.getX();
        };
        var riMonsterX = toolMenuService.newItem.input('monsterX', setMonsterXFn, {inputType: 'number'}, getMonsterXFn, {});

        var riMonsterCommaLabel = toolMenuService.newItem.label(',', {});
        var setMonsterYFn = function(y) {
            $scope.currentMonster.position.y = y;
            $scope.update();
        };
        var getMonsterYFn = function() {
            return $scope.currentMonster.position.getY();
        };
        var riMonsterY = toolMenuService.newItem.input('monsterY', setMonsterYFn, {inputType: 'number'}, getMonsterYFn, {});

        var riMonsterPathCb = function () {
            $scope.openMonsterPath();
        };
        var riMonsterPath = toolMenuService.newItem.button('Monster Path', riMonsterPathCb, {cssClass: 'mt-ribbon-monster-path', showName: true});
        var riMonsterEndLabel = toolMenuService.newItem.label(')', {});

        //Monster Ribbon object
        var monsterRibbon = {
            items: {
                left: [toolMenuService.newItem.label('Monster')],
                center: [],
                right: [riMonsterLabel, riMonsterX, riMonsterCommaLabel, riMonsterY, riMonsterEndLabel, riMonsterPath]
            }
        };

        //MESSAGE STUFF
        var getMessageFn = function() {
            return '' + $scope.currentMessage.getText();
        };
        var riMessageLabel = toolMenuService.newItem.label('Message', {}, getMessageFn);


        //Message Ribbon object
        var messageRibbon = {
            items: {
                left: [],
                center: [riMessageLabel],
                right: []
            }
        };

        //register the tool's menu with toolMenuService
        this.register = function () {
            toolMenuService.setToolMenu($scope.toolId, ribbon, {containerApi: $scope.containerApi});
            toolMenuService.setToolMenu($scope.toolId, monsterRibbon, {contextId: ns.GAME_MONSTER, selectionApi: $scope.selectionApi});
            toolMenuService.setToolMenu($scope.toolId, portalRibbon, {contextId: ns.GAME_PORTAL, selectionApi: $scope.selectionApi});
            toolMenuService.setToolMenu($scope.toolId, polygonRibbon, {contextId: ns.GAME_POLYGON, selectionApi: $scope.selectionApi});
            toolMenuService.setToolMenu($scope.toolId, messageRibbon, {contextId: ns.GAME_MESSAGE, selectionApi: $scope.selectionApi});
        };
    }];

    angular.module('mtGameBuilder')
            .controller('GameBuilderRibbonCtrl', GameBuilderRibbonCtrl);

})(window.mt.gamebuilder);

(function (ns) {
    'use strict';

    angular.module('mtGameBuilder').directive('mtGameBuilderMonsterModal', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/gameBuilderMonsterModalTemplate.html',
            replace: true,
            link: function (scope, element, attrs) {
                // move the popup to the body, so the that z-index layering works correctly
                $(element).appendTo($('body'));

                // remove the popup explicitly since it is in a different DOM position
                scope.$on('$destroy', function() {
                    $(element).remove();
                });
            }
        };
    });
})(window.mt.gamebuilder);
(function (ns) {
    'use strict';

    angular.module('mtGameBuilder').directive('mtGameBuilderPolygonModal', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/gameBuilderPolygonModalTemplate.html',
            replace: true,
            link: function (scope, element, attrs) {
                // move the popup to the body, so the that z-index layering works correctly
                $(element).appendTo($('body'));

                // remove the popup explicitly since it is in a different DOM position
                scope.$on('$destroy', function() {
                    $(element).remove();
                });
            }
        };
    });
})(window.mt.gamebuilder);
(function (ns) {
    'use strict';
    /* global 
        Desmos: false
    */
    /* Directives */

    angular.module('mtGameBuilder').directive('mtGameBuilderDesmos', function ($timeout, toolPersistorService, $controller) {
        return {
            restrict            : 'E',
            replace             : true,
            template            : '<div hm-tap="tapScreen($event)" class="desmosContainer"></div>',
            link: function (scope, element) {
                var desmosOptions = {
                    keypad: false,
                    settingsMenu: false,
                    border: false,
                    expressions: false
                };

                function init() {
                    scope.calculator = Desmos.Calculator(element, desmosOptions);
                }
                $timeout(init);
            }
        };
    });

})(window.mt.gamebuilder);

(function (ns) {
    'use strict';

    /* Directives */

    angular.module('mtGameBuilder').directive('mtGameBuilderTool', function () {
        return {
            restrict            : 'E',
            templateUrl         : 'templates/gameBuilderToolTemplate.html',
            scope               : {
                toolId: '=',
                containerApi: '='
            },
            controller          : 'GameBuilderCtrl',
            link: function (scope, element) {

                scope.containerElement = $(element).find('.desmosContainer')[0];

                scope.$on('$destroy', function() {
                });

                scope.init();
            }
        };
    });

})(window.mt.gamebuilder);
angular.module('mtGameBuilder').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/gameBuilderMonsterModalTemplate.html',
    "<div modal=modalIsMonsterPath() class=\"mt-game-builder-dialog mt-game-builder-monster-dialog\"><div class=modal-header><h3>Monster Path</h3></div><div class=modal-body><p>You can move the monster up to four times. Your last move should end at the starting location of the monster.</p><div class=mt-game-builder-monster><h4>{{currentMonster.name}}</h4><div class=monster-starting-path>Starting Location ({{currentMonster.position.getX()}}, {{currentMonster.position.getY()}})</div></div><ul class=mt-game-builder-monster-paths><li class=\"pathSetting dataSetting\" ng-repeat=\"path in currentMonster.paths\"><div class=\"pathData data\">Move {{$index + 1}}</div><div class=\"pathData data\">Change<select class=xyOptions ng-model=path.move ng-options=\"o for o in path.options\"></select><div ng-show=path.moveX() class=\"pathData data\">by <input ng-model=path.direction.x>&nbsp;units.</div><div ng-show=path.moveY() class=\"pathData data\">by <input ng-model=path.direction.y>&nbsp;units.</div></div><div class=\"pathData data\">Move To (<input ng-model=path.moveTo.x>,<input ng-model=path.moveTo.y>)</div></li></ul><div ng-show=currentMonster.canMakeMorePath()><button class=\"btn btn-success addPath\" hm-tap=currentMonster.addPath()>Add Path</button></div><div class=mt-game-builder-path-validation ng-class=\"{'text-success': currentMonster.isPathValid()}\">Path is&nbsp;<span ng-hide=currentMonster.isPathValid()>not&nbsp;</span>valid</div></div><div class=modal-footer><button class=\"btn btn-primary mt-modal-ok\" hm-tap=closeModalMonster()>Set</button></div></div>"
  );


  $templateCache.put('templates/gameBuilderPolygonModalTemplate.html',
    "<div modal=modalIsPolygonSetting() class=\"mt-game-builder-dialog mt-game-builder-monster-dialog\"><div class=modal-header><h3>Landmark</h3></div><div class=modal-body><div><div class=\"pointSetting dataSetting\" ng-repeat=\"point in currentPolygon.points\"><div class=\"pointData data\">Point {{$index}}</div><div class=\"pointData data\"><div class=\"pointData data\">( <input ng-model=point.x>,<input ng-model=point.y>)</div></div></div></div></div><div class=modal-footer><button class=\"btn btn-primary mt-modal-ok\" hm-tap=closeModal()>Set</button></div></div>"
  );


  $templateCache.put('templates/gameBuilderToolTemplate.html',
    "<div class=mt-game-builder><div class=top><div class=menu></div><div class=desmos><mt-game-builder-desmos></mt-game-builder-desmos></div></div><div class=controls ng-show=gameModel.gameRunning><div class=\"control-button up\" hm-tap=moveUp()></div><div class=leftRight><div class=\"control-button left\" hm-tap=moveLeft()></div><div class=\"control-button right\" hm-tap=moveRight()></div></div><div class=\"control-button down\" hm-tap=moveDown()></div></div><mt-game-builder-monster-modal></mt-game-builder-monster-modal><mt-game-builder-polygon-modal></mt-game-builder-polygon-modal></div>"
  );

}]);
