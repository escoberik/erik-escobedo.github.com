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
