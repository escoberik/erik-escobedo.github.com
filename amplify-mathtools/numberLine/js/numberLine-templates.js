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
