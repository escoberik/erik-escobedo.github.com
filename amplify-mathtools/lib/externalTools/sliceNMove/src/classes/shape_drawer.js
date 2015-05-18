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
