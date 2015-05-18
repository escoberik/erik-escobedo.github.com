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
