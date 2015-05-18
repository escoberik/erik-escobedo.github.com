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
