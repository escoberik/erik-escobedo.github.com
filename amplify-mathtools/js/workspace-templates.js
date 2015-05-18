angular.module('mtWorkspace').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/mtCanvasTemplate.html',
    "<div id=toolViewPort class=mt-tool-view-port hm-drag=drag($event) hm-pinch=pinch($event) hm-release=release($event) hm-tap=tap($event)><mt-page-indicator></mt-page-indicator><mt-abstract-panel></mt-abstract-panel><div class=selector></div><div id=toolSpace class=\"mt-no-select mt-zoomable-tool-space\"><mt-pen-surface></mt-pen-surface><div ng-repeat=\"tool in tools\"><mt-floating-tool-container workspace-api=workspaceApi tool-template=tool></mt-floating-tool-container></div><div ng-transclude></div></div><div ng-if=isSubmissionActive() class=mt-submission-viewport><div class=mt-submission-viewport-text>Viewing submission<div><div></div></div></div></div></div>"
  );


  $templateCache.put('templates/mtDdToolbarTemplate.html',
    "<div id=toolbar class=mt-dd-toolbar><div ng-repeat=\"item in toolItems\"><div class=\"mt-tool-dd-item mt-dd-item\" ng-class=item.btnName hm-tap=item.callback() ng-bind=item.name></div></div></div>"
  );


  $templateCache.put('templates/mtFloatingToolContainerTemplate.html',
    "<div class=\"mt-floating-tool-container mt-workspace-component\" id={{toolTemplate.toolId}} ng-class=\"{'mt-active-tool-instance': isActive()}\" ng-hide=containerApi.isHidden hm-tap=stopTap($event)><div class=mt-component-disabler hm-tap=onMinTouch($event) ng-show=isInactive()></div><mt-tool-palette container-api=containerApi ng-if=hasPalette></mt-tool-palette><div class=mt-floating-tool-container-move ng-class=\"{'mt-floating-tool-container-move-inactive': !isActive()}\" hm-dragstart=dragToolStart($event) hm-tap=tapHeader() hm-drag=dragTool($event) hm-release=release() hm-hold=holdMoveIcon($event)><div class=mt-close-tool ng-if=\"isActive() && showClose\" hm-tap=containerApi.closeTool($event)></div><div class=mt-tool-name>{{containerApi.name.value}}</div></div><div class=mt-floating-tool-wrapper><mt-external-tool tool-id=toolTemplate.toolId id=tool-{{toolTemplate.toolId}} container-api=containerApi type=toolTemplate.type></mt-external-tool></div></div>"
  );


  $templateCache.put('templates/mtHelpOverlayTemplate.html',
    "<div class=mt-help-overlay ng-show=showHelp ng-click=hideHelp()><div ng-show=showHelp class=\"mt-help-item mt-help-title\"><div class=mt-help-itemtext style=\"top: 100px; left: 10px\">Lesson Title</div><svg width=2 height=100 viewport=\"0 0 2 100\" version=1.1 xmlns=http://www.w3.org/2000/svg><line x1=0 y1=0 x2=0 y2=100 stroke=white stroke-width=\"2\"></svg></div><div ng-show=showHelp class=\"mt-help-item mt-help-annotations\"><div class=mt-help-itemtext style=\"top: 140px; left: 10px\">Annotation Tools</div><svg width=2 height=140 viewport=\"0 0 2 140\" version=1.1 xmlns=http://www.w3.org/2000/svg><line x1=0 y1=0 x2=0 y2=140 stroke=white stroke-width=\"2\"></svg></div><div ng-show=showHelp class=\"mt-help-item mt-help-tools\"><div class=mt-help-itemtext style=\"top: 100px; right: 10px\">Math Tools Menu</div><svg width=2 height=100 viewport=\"0 0 2 100\" version=1.1 xmlns=http://www.w3.org/2000/svg><line x1=0 y1=0 x2=0 y2=100 stroke=white stroke-width=\"2\"></svg></div><div ng-show=showHelp class=\"mt-help-item mt-help-settings\"><div class=mt-help-itemtext style=\"top: 100px; right: 10px\">Settings</div><svg width=2 height=100 viewport=\"0 0 2 100\" version=1.1 xmlns=http://www.w3.org/2000/svg><line x1=0 y1=0 x2=0 y2=100 stroke=white stroke-width=\"2\"></svg></div><div ng-show=showHelp class=\"mt-help-item mt-help-nav\"><div class=mt-help-itemtext style=\"top: 0; right: 10px\">Navigator Panel</div><svg width=2 height=100 viewport=\"0 0 2 100\" version=1.1 xmlns=http://www.w3.org/2000/svg><line x1=0 y1=0 x2=0 y2=100 stroke=white stroke-width=\"2\"></svg></div></div>"
  );


  $templateCache.put('templates/mtInlineToolContainerTemplate.html',
    "<div class=\"mt-workspace-component mt-inline\" id={{toolId}} ng-hide=isHidden><mt-external-tool tool-id=toolId id=tool-{{toolId}} container-api=containerApi type=type></mt-external-tool></div>"
  );


  $templateCache.put('templates/mtNavIndicatorTemplate.html',
    "<div class=mt-nav-indicator><div class=mt-nav-indicator-inner ng-show=isActivePage() ng-style=innerStyle></div><div ng-repeat=\"tool in getBounds()\" class=mt-nav-indicator-tool ng-class=\"{'mt-active-tool': tool.isActive}\" style=\"left: {{tool.leftPercentage}}%; top: {{tool.topPercentage}}%; width: {{tool.widthPercentage}}%; height: {{tool.heightPercentage}}%\"></div></div>"
  );


  $templateCache.put('templates/mtPageIndicatorTemplate.html',
    "<div class=mt-page-indicator ng-class=\"{'mt-page-view-on': isPageViewOn()}\" hm-pinch=stopPinch($event)><div class=mt-page-view-toggle hm-tap=togglePageView($event)><svg width=20px height=100% viewbox=\"0 0 20 19\" xmlns=http://www.w3.org/2000/svg><path ng-show=!isPageViewOn() fill=#66B0EF d=\"M13,15.998c-0.242,0-0.484-0.087-0.676-0.263l-6-5.5C6.117,10.046,6,9.778,6,9.498S6.117,8.95,6.324,8.761 l6-5.5c0.408-0.374,1.041-0.345,1.413,0.062c0.373,0.407,0.346,1.039-0.062,1.413L8.48,9.498l5.195,4.763 c0.407,0.374,0.435,1.006,0.062,1.413C13.54,15.889,13.27,15.998,13,15.998z\"></path><path ng-show=isPageViewOn() fill=#66B0EF d=\"M7,3c0.242,0,0.484,0.087,0.676,0.263l6,5.5C13.883,8.952,14,9.22,14,9.5s-0.117,0.548-0.324,0.737l-6,5.5 c-0.408,0.374-1.041,0.345-1.413-0.062c-0.373-0.407-0.346-1.039,0.062-1.413L11.52,9.5L6.324,4.737 C5.917,4.363,5.89,3.731,6.263,3.324C6.46,3.109,6.73,3,7,3z\"></path></svg></div><div class=mt-page-view-port ng-style=getViewportStyle()><div class=mt-page-container ng-style=getContainerStyle()><div ng-repeat=\"page in getPages() track by $index\" class=mt-page-indicator-page ng-class=\"{'mt-active-page': isActivePage($index)}\" hm-tap=\"setActivePage($index, $event)\"><mt-nav-indicator page-index=$index bounds=page.toolBounds></mt-nav-indicator></div></div></div><div class=mt-add-page-btn><div class=mt-page-num>{{getActivePageIndex()}}</div><div class=mt-page-num-of>of {{getNumPages()}}</div><div class=mt-add-icon><svg hm-tap=addPage($event) xmlns=http://www.w3.org/2000/svg width=40px height=30px viewbox=\"0 0 40 30\"><rect class=mt-add-page-container-rect stroke=#A1B9B5 fill=none width=40px height=30px></rect><path class=mt-add-page-icon-path fill=#66B0EF d=\"M27,14h-6V8c0-0.553-0.447-1-1-1s-1,0.447-1,1v6h-6c-0.553,0-1,0.447-1,1s0.447,1,1,1h6v6 c0,0.553,0.447,1,1,1s1-0.447,1-1v-6h6c0.553,0,1-0.447,1-1S27.553,14,27,14z\"></path></svg></div></div></div>"
  );


  $templateCache.put('templates/mtToolPaletteItemTemplate.html',
    "<div class=mt-palette-button ng-show=isShown()><mt-button config=item></mt-button></div>"
  );


  $templateCache.put('templates/mtToolPaletteTemplate.html',
    "<div class=mt-palette-holder ng-show=showToolPalette()><div class=mt-palette><div class=\"mt-palette-button mt-palette-handle\" ng-hide=containerApi.isInline><b class=\"mt-icon mt-icon-handle\"></b></div><mt-tool-palette-item ng-repeat=\"item in localPaletteItems\" item=item></mt-tool-palette-item><mt-tool-palette-item ng-repeat=\"item in globalPaletteItems\" item=item></mt-tool-palette-item><mt-input model=containerApi.name class=\"mt-tool-name mt-palette-input\" placeholder=Name></mt-input></div></div>"
  );


  $templateCache.put('templates/mtWorkspaceNavbarTemplate.html',
    "<div id=workspaceNav class=\"navbar navbar-inverse mt-workspace-nav\"><div class=navbar-inner><div><a class=\"btn btn-navbar\" data-toggle=collapse data-target=.navbar-responsive-collapse><span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></a> <a id=workspaceHeader class=\"brand mt-workspace-title\" ng-href={{originalUrl}}>{{workspaceHeader}}</a><div class=\"nav-collapse collapse navbar-responsive-collapse mt-no-select\"><ul class=nav><mt-workspace-content-menu></mt-workspace-content-menu><button class=\"mt-temp-ui mt-show-controls btn mt-clear-btn mt-no-select\" ng-click=clear()>Clear</button><div class=\"mt-temp-ui mt-show-controls btn-group mt-no-select\" data-toggle=buttons-radio ng-show=isTeacher()><button type=button class=\"btn active btn-inverse mt-no-select\" ng-click=toggleOfflineMode(false)>Online</button> <button type=button class=\"btn btn-inverse mt-no-select\" ng-click=toggleOfflineMode(true)>Offline</button></div></ul><mt-global-menu class=\"nav pull-right\" container-type=workspace></mt-global-menu><ul class=\"nav pull-right\"><li class=\"brand mt-workspace-name\">{{currentWorkspaceName}}</li><li><div class=\"mt-navbar-icon mt-broadcast-workspace\" ng-click=broadcastWorkspace() ng-show=isTeacher()></div></li><mt-input-switch></mt-input-switch><li><div class=\"mt-navbar-icon mt-comm-indicator\" ng-class=\"{on: networkConnected}\"></div></li></ul></div></div></div></div>"
  );


  $templateCache.put('templates/mtWorkspaceTemplate.html',
    "<div id=workspace class=mt-no-select><mt-help-overlay show-help=showHelp></mt-help-overlay><mt-global-ribbon-menu></mt-global-ribbon-menu><mt-canvas></mt-canvas><hand-writing-menu class=mt-hand-writing-menu></hand-writing-menu></div>"
  );


  $templateCache.put('templates/workspacePartial.html',
    "<mt-workspace space-id=workspace></mt-workspace>"
  );

}]);
