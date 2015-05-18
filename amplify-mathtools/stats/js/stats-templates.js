angular.module('mtStats').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/mtDataSamplerTemplate.html',
    "<div class=mt-probs-tool><mt-sampler-marb tool-id=toolId probability-service=probabilityService speed=speed skipani=skipAnimations></mt-sampler-marb></div>"
  );


  $templateCache.put('templates/mtSamplerMarbTemplate.html',
    "<div class=mt-col><div class=mt-left-col><fieldset ng-disabled=running><form><div class=mt-repeater>Sample Size: <input class=mt-single-input min=1 type=number ng-model=\"numRepetitons\"><br><br><hr><input type=button ng-click=run() class=\"btn btn-small\" value=Draw ng-disabled=\"totalMarbles < numDraw\"> <input type=checkbox ng-model=preserveResults ng-disabled=!preserveEnabled>Preserve Results<br></div></form></fieldset></div><div id=marblejar class=mt-right-col>Number of cases: {{totalMarbles}}<br><canvas id=marblecanvas class=mt-throwing-canvas></canvas><div class=mt-bin-area><a ng-click=clearBalls()>Clear Bin</a><div class=mt-bin-div><span class=mt-ball-holder ng-repeat=\"ball in binnedBalls track by $index\"><div class=mt-circle style=\"{{'background-color:'+ball.color+';'+ball.gradient}}\"><div style=font-size:12px;font-weight:bold;font-family:Arial;position:relative;top:4px;left:7px>{{ball.name}}</div></div></span></div></div></div></div>"
  );


  $templateCache.put('templates/mtStatsAttributeTargetTemplate.html',
    "<div class=mt-stats-graph-target ng-class=\"{\n" +
    "        'mt-active': active,\n" +
    "        'mt-stats-graph-target-case': isTarget('case'),\n" +
    "        'mt-stats-graph-target-x': isTarget('x'),\n" +
    "        'mt-stats-graph-target-y': isTarget('y')\n" +
    "     }\"><div class=mt-message>{{text}}</div></div>"
  );


  $templateCache.put('templates/mtStatsCaseDataTemplate.html',
    "<div class=\"mt-stats-case-data mt-allow-scroll\"><div class=mt-stats-header-row ng-style=\"{'margin-left': marginLeft}\"><div class=mt-stats-index-header ng-model=indexHeader ng-click=indexHeader.sort()>{{indexHeader.display}}</div><mt-stats-header ng-repeat=\"attribute in caseData.attributeHeaders\" model=attribute headers=caseData.attributeHeaders></mt-stats-header></div><div class=mt-stats-data-rows><mt-stats-case ng-repeat=\"caseDatum in caseData.cases\" model=caseDatum attributes=caseData.attributeHeaders update-fn=updateCell select-fn=select validate-fn=validate></mt-stats-case></div><div class=mt-stats-draggable-attribute ng-show=draggableAttribute.visible>{{ draggableAttribute.text }}</div></div>"
  );


  $templateCache.put('templates/mtStatsCaseTemplate.html',
    "<div class=mt-stats-case ng-class=\"{'mt-active': model.active, 'mt-even': isEven()}\"><div class=\"mt-stats-cell mt-stats-index-cell\" ng-bind=model.index hm-tap=selectFn(model)></div><input class=mt-stats-cell ng-class=\"{'mt-invalid': !validateFn(model,attribute)}\" ng-repeat=\"attribute in attributes\" ng-model=model.attributes[attribute.display] ng-keypress=\"handleKeyPress($event, attribute)\" ng-blur=onBlur(attribute) ng-change=onChange(attribute) data-attr-name={{attribute.display}}></div>"
  );


  $templateCache.put('templates/mtStatsDraggableAttributeTemplate.html',
    "<div class=mt-stats-draggable-attribute>{{ text }}</div>"
  );


  $templateCache.put('templates/mtStatsGraphBinDialogTemplate.html',
    ""
  );


  $templateCache.put('templates/mtStatsGraphLegendDialogTemplate.html',
    "<div><div style=\"white-space: nowrap\"><div style=padding-right:70px;padding-left:10px;padding-bottom:10px;display:inline-block;color:#4A1350 ng-if=caseData.colorAttributeHeader>{{caseData.colorAttributeName}}<div ng-if=\"caseData.colorAttributeHeader.type && caseData.colorAttributeHeader.type === 'categorical'\"><span ng-repeat=\"cat in caseData.colorAttributeHeader.attributeValues.sortedCategories\"><span class=mt-legend-color-icon style=\"background-color: rgb({{cat.color[0]}}, {{cat.color[1]}}, {{cat.color[2]}})\"></span>{{cat.name}}<br></span></div><div ng-if=\"caseData.colorAttributeHeader.type && caseData.colorAttributeHeader.type === 'numeric'\">{{caseData.getMinMax(caseData.colorAttributeName).min}}<div class=mt-legend-color-range-icon ng-style=caseData.colorAttributeHeader.colorRange.getGradientStyle()></div>{{caseData.getMinMax(caseData.colorAttributeName).max}}</div></div></div></div>"
  );


  $templateCache.put('templates/mtStatsGraphLegendTemplate.html',
    "<div class=mt-legend><style>.mt-toolbar-center {\n" +
    "            padding-left: 10px;\n" +
    "        }\n" +
    "        .mt-triangle-left {\n" +
    "            left: -10px;\n" +
    "            width: 0;\n" +
    "            height: 0;\n" +
    "            border-top: 18px solid transparent;\n" +
    "            border-bottom: 18px solid transparent;\n" +
    "            position: absolute;\n" +
    "            border-right: 10px solid #D4D4D4;\n" +
    "        }\n" +
    "        .mt-toolbar-button {\n" +
    "            height: 36px;\n" +
    "            line-height: 36px;\n" +
    "            color: white;\n" +
    "            position: relative;\n" +
    "            font-size: large;\n" +
    "            display: inline;\n" +
    "            float: left;\n" +
    "        }\n" +
    "        .mt-toolbar-marker-button {\n" +
    "            background-color: #686D78;\n" +
    "            width: 100px;\n" +
    "        }\n" +
    "        .mt-toolbar-icon-button {\n" +
    "            width: 30px;\n" +
    "            position: relative;\n" +
    "            display: inline;\n" +
    "            float: left;\n" +
    "            text-align: center;\n" +
    "        }\n" +
    "        .mt-toolbar-marker-icon-button {\n" +
    "            background-color: #50555B;\n" +
    "        }\n" +
    "        .mt-menu-button-text {\n" +
    "            position:static;\n" +
    "            display:block;\n" +
    "            padding-left:35px;\n" +
    "        }\n" +
    "\n" +
    "        .mt-legend {\n" +
    "            background-color: #D4D4D4;\n" +
    "            width: 120px;\n" +
    "            height: 36px;\n" +
    "            position: absolute;\n" +
    "            -ms-transform: rotate(90deg);\n" +
    "            -webkit-transform: rotate(90deg);\n" +
    "            transform: rotate(90deg);\n" +
    "            left: 445px;\n" +
    "            top: 40px;\n" +
    "        }\n" +
    "\n" +
    "        .mt-legend-triangle-right {\n" +
    "            left: 120px;\n" +
    "            top: 0px;\n" +
    "            width: 0;\n" +
    "            height: 0;\n" +
    "            border-top: 18px solid transparent;\n" +
    "            border-bottom: 18px solid transparent;\n" +
    "            position: absolute;\n" +
    "            border-left: 10px solid #D4D4D4;\n" +
    "        }\n" +
    "\n" +
    "        .mt-legend-dialog {\n" +
    "            border: solid 1px #D4D4D4;\n" +
    "            position: absolute;\n" +
    "            -ms-transform: rotate(-90deg) translateX(5px) translateY(115px);\n" +
    "            -webkit-transform: rotate(-90deg) translateX(5px) translateY(115px);\n" +
    "            transform: rotate(-90deg) translateX(5px) translateY(115px);\n" +
    "            transform-origin: 0% 0%;\n" +
    "            -ms-transform-origin: 0% 0%;\n" +
    "            -webkit-transform-origin: 0% 0%;\n" +
    "            padding: 0px;\n" +
    "            width: auto;\n" +
    "            height: auto;\n" +
    "            background-color: #FFFFFF;\n" +
    "            margin: 5px;\n" +
    "        }\n" +
    "\n" +
    "        .mt-legend-color-icon {\n" +
    "            display:inline-block;\n" +
    "            width: 12px;\n" +
    "            height: 12px;\n" +
    "            margin: 0px 6px;\n" +
    "        }\n" +
    "\n" +
    "        .mt-legend-color-range-icon {\n" +
    "            /* position: relative; */\n" +
    "            display:inline-block;\n" +
    "            height: 12px;\n" +
    "            width: 50%;\n" +
    "            bottom: 2px;\n" +
    "            margin: 10px 10px 0px 10px;\n" +
    "        }</style><div class=mt-triangle-left></div><div class=mt-toolbar-center><mt-stats-graph-menu-button class=\"mt-toolbar-button mt-toolbar-marker-button\"><div hm-tap=handleTap()><div class=\"mt-toolbar-icon-button mt-toolbar-marker-icon-button\">+</div><span class=mt-menu-button-text>Key</span></div><mt-stats-graph-legend-dialog class=mt-legend-dialog ng-show=showDialog></mt-stats-graph-legend-dialog></mt-stats-graph-menu-button></div><div class=mt-legend-triangle-right></div></div>"
  );


  $templateCache.put('templates/mtStatsGraphMarkerDialogTemplate.html',
    ""
  );


  $templateCache.put('templates/mtStatsGraphMenuButtonTemplate.html',
    "<div class=mt-button ng-transclude></div>"
  );


  $templateCache.put('templates/mtStatsGraphTemplate.html',
    "<div class=mt-stats-graph style=position:relative><div class=mt-graph-container hm-hold=hold($event) hm-tap=tap($event) hm-doubletap=doubletap($event) hm-drag=drag($event) hm-dragend=dragEnd($event) hm-dragstart=dragStart($event) style=height:415px><svg class=mt-graph-svg width=100% height=415></svg></div><div class=mt-stats-graph-axis-targets ng-show=!showAttributeTargets><div class=mt-stats-axis-x hm-tap=\"setAxisMenu('x')\" ng-show=graphModel.attributes.x ng-class=\"{'mt-active': graphModel.axes.x.isSelected}\"></div><div class=mt-stats-axis-y hm-tap=\"setAxisMenu('y')\" ng-show=graphModel.attributes.y ng-class=\"{'mt-active': graphModel.axes.y.isSelected}\"></div></div><mt-stats-graph-legend axis=y class=mt-legend></mt-stats-graph-legend><div class=mt-stats-graph-targets ng-show=showAttributeTargets><mt-stats-attribute-target type=y active=activeTarget.y text=\"getDropTargetText('y')\"></mt-stats-attribute-target><mt-stats-attribute-target type=case active=activeTarget.case text=\"getDropTargetText('case')\"></mt-stats-attribute-target><mt-stats-attribute-target type=x active=activeTarget.x text=\"getDropTargetText('x')\"></mt-stats-attribute-target></div></div>"
  );


  $templateCache.put('templates/mtStatsGraphToolbarTemplate.html',
    "<style>.mt-toolbar {\n" +
    "            background-color: #D4D4D4;\n" +
    "            width: 420px;\n" +
    "            height: 36px;\n" +
    "            position: absolute;\n" +
    "        }\n" +
    "        .mt-toolbar-center {\n" +
    "            padding-left: 10px;\n" +
    "        }\n" +
    "        .mt-triangle-left {\n" +
    "            left: -10px;\n" +
    "            width: 0;\n" +
    "            height: 0;\n" +
    "            border-top: 18px solid transparent;\n" +
    "            border-bottom: 18px solid transparent;\n" +
    "            position: absolute;\n" +
    "            border-right: 10px solid #D4D4D4;\n" +
    "        }\n" +
    "        .mt-triangle-right {\n" +
    "            left: 420px;\n" +
    "            top: 0px;\n" +
    "            width: 0;\n" +
    "            height: 0;\n" +
    "            border-top: 18px solid transparent;\n" +
    "            border-bottom: 18px solid transparent;\n" +
    "            position: absolute;\n" +
    "            border-left: 10px solid #D4D4D4;\n" +
    "        }\n" +
    "        .mt-toolbar-button {\n" +
    "            height: 36px;\n" +
    "            line-height: 36px;\n" +
    "            color: white;\n" +
    "            position: relative;\n" +
    "            font-size: large;\n" +
    "            display: inline;\n" +
    "            float: left;\n" +
    "        }\n" +
    "        .mt-dialog-button {\n" +
    "            height: 24px;\n" +
    "            width: 20px;\n" +
    "            line-height: 24px;\n" +
    "            position: relative;\n" +
    "            font-size: large;\n" +
    "            display: inline-block;\n" +
    "            text-align: center;\n" +
    "        }\n" +
    "        .mt-dialog-button div, .mt-checkbox-label {\n" +
    "            height:24px;\n" +
    "            line-height:24px;\n" +
    "        }\n" +
    "\n" +
    "        .mt-toolbar-divider-button {\n" +
    "            background-color: #FB3A11;\n" +
    "            width: 100px;\n" +
    "        }\n" +
    "        .mt-toolbar-divider-icon-button {\n" +
    "            background-color: #DA2A04;\n" +
    "        }\n" +
    "        .mt-toolbar-marker-button {\n" +
    "            background-color: #686D78;\n" +
    "            width: 100px;\n" +
    "        }\n" +
    "        .mt-toolbar-icon-button {\n" +
    "            width: 30px;\n" +
    "            position: relative;\n" +
    "            display: inline;\n" +
    "            float: left;\n" +
    "            text-align: center;\n" +
    "        }\n" +
    "        .mt-toolbar-marker-icon-button {\n" +
    "            background-color: #50555B;\n" +
    "        }\n" +
    "        .mt-toolbar-ruler-button {\n" +
    "            background-color: #33CC66;\n" +
    "            width: 100px;\n" +
    "        }\n" +
    "        .mt-toolbar-ruler-icon-button {\n" +
    "            background-color: #26B653;\n" +
    "        }\n" +
    "        .mt-toolbar-bins-button {\n" +
    "            background-color: #49A1FE;\n" +
    "            width: 100px;\n" +
    "            position: relative;\n" +
    "            float: left;\n" +
    "        }\n" +
    "        .mt-bins-icon-button {\n" +
    "            background-color: #328FFF;\n" +
    "            vertical-align:top;\n" +
    "        }\n" +
    "        .mt-menu-button-text {\n" +
    "            position:static;\n" +
    "            display:block;\n" +
    "            padding-left:35px;\n" +
    "        }\n" +
    "        .mt-vertical-toolbar {\n" +
    "            -ms-transform: rotate(270deg);\n" +
    "            -webkit-transform: rotate(270deg);\n" +
    "            transform: rotate(270deg);\n" +
    "            left: -240px;\n" +
    "            top: 190px;\n" +
    "        }\n" +
    "        .mt-horizontal-toolbar {\n" +
    "            left: 0px;\n" +
    "            top: 428px;\n" +
    "        }\n" +
    "        .mt-dialog {\n" +
    "            border: solid 1px #D4D4D4;\n" +
    "            top: 36px;\n" +
    "            position: absolute;\n" +
    "            padding: 0px;\n" +
    "            width: auto;\n" +
    "            height: auto;\n" +
    "            background-color: #FFFFFF;\n" +
    "        }\n" +
    "\n" +
    "        .mt-vertical-toolbar .mt-dialog {\n" +
    "            -ms-transform: rotate(90deg) translateX(-36px);\n" +
    "            -webkit-transform: rotate(90deg) translateX(-36px);\n" +
    "            transform: rotate(90deg) translateX(-36px);\n" +
    "            transform-origin: 0% 0%;\n" +
    "            -ms-transform-origin: 0% 0%;\n" +
    "            -webkit-transform-origin: 0% 0%;\n" +
    "        }\n" +
    "        .mt-bin-dialog-num-of-bins {\n" +
    "            color: #063B72;\n" +
    "            background-color: #49A1FE;\n" +
    "            margin: 5px;\n" +
    "            white-space: nowrap;\n" +
    "        }\n" +
    "        .mt-bin-dialog-bin-width {\n" +
    "            color: #063B72;\n" +
    "            background-color: #83C2FF;\n" +
    "            margin: 5px;\n" +
    "        }\n" +
    "        .mt-marker-dialog-show-mad {\n" +
    "            color: #063B72;\n" +
    "            background-color: #83C2FF;\n" +
    "            margin: 5px;\n" +
    "        }\n" +
    "        .mt-marker-dialog-show-median {\n" +
    "            color: #063B72;\n" +
    "            background-color: #83C2FF;\n" +
    "            margin: 5px;\n" +
    "        }\n" +
    "        .mt-marker-dialog-show-mean {\n" +
    "            color: #063B72;\n" +
    "            background-color: #83C2FF;\n" +
    "            margin: 5px;\n" +
    "        }\n" +
    "        .mt-number-input {\n" +
    "            box-sizing: border-box;\n" +
    "            text-align: center !important ;\n" +
    "            line-height: 24px;\n" +
    "            width: 50px;\n" +
    "            height: 20px;\n" +
    "            border: 0px !important;\n" +
    "            padding: 0px !important;\n" +
    "            margin-right: 4px;\n" +
    "            margin-left: 4px;\n" +
    "            margin-top: 2px !important;\n" +
    "            margin-bottom: 2px !important;\n" +
    "            -webkit-border-radius: 4px;\n" +
    "            -moz-border-radius: 4px;\n" +
    "            border-radius: 4px;\n" +
    "            background-color: #A7D4EF !important;\n" +
    "        }\n" +
    "\n" +
    "        .mt-bin-width-dialog-label {\n" +
    "            text-align:right;\n" +
    "            padding-left:28px;\n" +
    "            white-space: nowrap;\n" +
    "            display:inline-block;\n" +
    "            float:right\n" +
    "        }\n" +
    "\n" +
    "        .mt-bin-num-dialog-label {\n" +
    "            padding-left:5px;\n" +
    "            white-space: nowrap;\n" +
    "            display:inline-block;\n" +
    "            vertical-align:top\n" +
    "        }</style>"
  );


  $templateCache.put('templates/mtStatsHeaderTemplate.html',
    "<div class=\"mt-stats-cell mt-stats-cell-header\" ng-class=\"{'mt-dragging': model.dragging||model.active}\" hm-touch=touch($event) hm-release=release() hm-dragstart=dragStart($event) hm-drag=drag($event) hm-dragend=dragEnd($event) data-attr-name={{model.display}}>{{model.display}}<div class=mt-color-icon-list ng-if=\"model.type === 'categorical'\"><span ng-repeat=\"color in model.attributeValues.topColors\" class=mt-color-icon style=\"background-color: rgb({{color[0]}}, {{color[1]}}, {{color[2]}})\"></span></div><div class=mt-color-range-icon ng-if=\"model.type === 'numeric' || model.type === 'integer'\" ng-style=model.colorRange.getGradientStyle()></div></div>"
  );


  $templateCache.put('templates/mtStatsProbabilityTemplate.html',
    "<div class=mt-probs-tool ng-switch on=activeSim><mt-probs-card probability-service=probabilityService ribbon-props=ribbonProperties ng-switch-when=cards></mt-probs-card><mt-probs-coin probability-service=probabilityService ribbon-props=ribbonProperties ng-switch-when=coins></mt-probs-coin><mt-probs-dice probability-service=probabilityService ribbon-props=ribbonProperties ng-switch-when=dice></mt-probs-dice><mt-probs-marb probability-service=probabilityService ribbon-props=ribbonProperties ng-switch-when=marbles></mt-probs-marb><mt-probs-spin probability-service=probabilityService ribbon-props=ribbonProperties ng-switch-when=spinner></mt-probs-spin></div>"
  );


  $templateCache.put('templates/mtStatsToolTemplate.html',
    "<div class=mt-stats-tool><div class=\"mt-spinner mt-stats-waiting\" ng-if=!ready></div><div ng-show=\"ready && !wizardActive\"><mt-stats-case-data></mt-stats-case-data></div><div ng-if=wizardActive><mt-stats-wizard wizard-api=wizardApi></mt-stats-wizard></div></div>"
  );


  $templateCache.put('templates/mtStatsWizardTemplate.html',
    "<div class=mt-stats-wizard><div class=mt-stats-wizard-main ng-if=mainPageActive><div class=mt-stats-wizard-back ng-click=wizardApi.toggle(false) ng-show=wizardApi.backBtn></div><div class=mt-stats-wizard-opts-container><h3 class=mt-stats-wizard-msg>Select a data source</h3><div class=mt-stats-wizard-opt ng-click=\"wizardApi.toggle(false, true)\"><svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=64px height=64px xml:space=preserve class=mt-wizard-opts-svg><rect stroke=#FFF stroke-width=2 fill=none x=2 y=2 width=60 height=60></rect><rect stroke=#FFF stroke-width=2 fill=none x=2 y=2 width=10 height=10></rect><rect stroke=#FFF stroke-width=2 fill=none x=12 y=2 width=25 height=10></rect><rect stroke=#FFF stroke-width=2 fill=none x=37 y=2 width=25 height=10></rect><line x1=12 y1=12 x2=12 y2=62 stroke-width=2 stroke=white></line><line x1=37 y1=12 x2=37 y2=62 stroke-width=2 stroke=white></line></svg><h5>Empty table</h5></div><div class=mt-stats-wizard-opt ng-click=toggleDataView(false)><svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=64px height=64px xml:space=preserve class=mt-wizard-opts-svg><rect stroke=#FFF stroke-width=2 fill=none x=2 y=2 width=60 height=60></rect><rect stroke=#FFF stroke-width=2 fill=none x=2 y=2 width=10 height=10></rect><rect stroke=#FFF stroke-width=2 fill=none x=12 y=2 width=25 height=10></rect><rect stroke=#FFF stroke-width=2 fill=none x=37 y=2 width=25 height=10></rect><line x1=12 y1=12 x2=12 y2=62 stroke-width=2 stroke=white></line><line x1=37 y1=12 x2=37 y2=62 stroke-width=2 stroke=white></line><line x1=2 y1=30 x2=62 y2=30 stroke-width=2 stroke=white></line><line x1=2 y1=50 x2=62 y2=50 stroke-width=2 stroke=white></line><text x=21 y=25 font-size=12 fill=white font-family=arial>1</text><text x=46 y=25 font-size=12 fill=white font-family=arial>2</text><text x=21 y=45 font-size=12 fill=white font-family=arial>2</text><text x=46 y=45 font-size=12 fill=white font-family=arial>4</text></svg><h5>Load a data set</h5></div><div class=mt-stats-wizard-opt ng-click=wizardApi.openWithProbabilityTool()><svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=64px height=64px xml:space=preserve class=mt-wizard-opts-svg><rect stroke=#FFF stroke-width=2 fill=none x=2 y=2 width=60 height=60></rect><circle cx=15 cy=15 r=6 fill=white></circle><circle cx=50 cy=15 r=6 fill=white></circle><circle cx=15 cy=50 r=6 fill=white></circle><circle cx=50 cy=50 r=6 fill=white></circle><circle cx=32 cy=32 r=6 fill=white></circle></svg><h5>Probability tools</h5></div></div></div><div class=mt-stats-wizard-data ng-if=!mainPageActive><div class=mt-stats-wizard-back ng-click=toggleDataView(true)></div><div class=mt-stats-wizard-file-container><h3 class=mt-stats-wizard-msg>Data sets</h3><div class=mt-stats-wizard-files ng-repeat=\"file in dataSetFiles\" ng-click=wizardApi.loadFileData(file) ng-bind=file><h5>{{file}}</h5></div></div></div></div>"
  );

}]);
