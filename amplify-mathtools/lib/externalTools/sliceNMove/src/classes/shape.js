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
