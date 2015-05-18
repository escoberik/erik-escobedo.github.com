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
