angular.module('mt.common').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/mtAbstractPanelTemplate.html',
    "<div class=mt-abstract-panel ng-class=\"{'mt-abstract-panel-open': isOpen()}\"><div class=mt-abstract-close></div><h2 class=mt-abstract-title ng-bind=curAbstract.title></h2><div class=mt-abstract-text ng-bind=curAbstract.text></div><div class=mt-abstract-tools><div class=mt-abstract-tool-icon ng-repeat=\"tool in curAbstract.tools\" ng-bind=tool.name ng-click=openTool($index)></div></div><div class=mt-abstract-submissions><h4>Tool submissions</h4><div class=mt-abstract-submission ng-repeat=\"tool in curAbstract.submittedTools\"><div class=mt-abstract-submission-cancel ng-click=removeToolSubmission($index)>X</div><div class=mt-abstract-submission-icon ng-click=\"openTool($index, true)\">{{tool.name}}</div></div><br><h4>Workspace submission</h4><div class=mt-abstract-submission ng-if=\"curAbstract.submittedWorkspace && curAbstract.submittedWorkspace.length !== 0\"><div class=mt-abstract-submission-cancel ng-click=removeWorkspaceSubmission()>X</div><div class=mt-abstract-submission-icon ng-class={toggled:isSubmittedActive()} ng-click=toggleWorkspace()>Workspace</div></div></div></div>"
  );


  $templateCache.put('templates/mtButtonTemplate.html',
    "<div class=mt-button ng-class=\"[backgroundClass, config.idClass]\"><div class=mt-button-touch hm-touch=touch() hm-release=release()><div class=mt-icon ng-class=iconClass><div class=mt-button-text ng-show=hasText>{{text}}</div></div></div><div class=mt-button-options><div ng-repeat=\"option in config.options\" class=\"mt-option-button mt-icon\" ng-click=\"optionSelect($event, $index)\"><div class=mt-option-text>{{option}}</div></div></div><div class=mt-button-input-container ng-show=inputVisible><input class=mt-button-input ng-model=inputText><div class=mt-button-input-types ng-show=hasInputTypes><div ng-repeat=\"type in config.inputTypes\" class=mt-button-input-type ng-class=\"{'mt-active': inputType === type.value}\" hm-touch=\"inputTypeSelect($event, '{{type.value}}')\">{{type.text}}</div></div><div class=mt-button-text-submit hm-touch=inputSubmit()>OK</div></div><div class=mt-button-arrow-right ng-show=hasOption></div></div>"
  );


  $templateCache.put('templates/mtDrawerTemplate.html',
    "<div class=\"mt-drawer mt-no-select\" ng-class=\"{open: isOpen, bottom: isBottom, top: isTop, left: isLeft, disabled: isDisabled()}\"><div class=mt-handle hm-drag=drag($event) hm-release=release()>{{handleText}}</div><div class=mt-body><div ng-transclude></div></div></div>"
  );


  $templateCache.put('templates/mtGlobalMenuTemplate.html',
    "<div class=mt-global-dropdown><div ng-repeat=\"link in globalMenuService.getLinks()\" class=mt-global-link hm-tap=followLink(link)>{{link.displayText}}</div></div>"
  );


  $templateCache.put('templates/mtGlobalNavbarTemplate.html',
    "<nav id=global-navbar class=\"navbar navbar-default\" role=navigation><a class=brand href=#>{{header}}</a><mt-global-menu class=\"nav pull-right\"></mt-global-menu><ul class=\"nav pull-right\"><mt-input-switch></mt-input-switch></ul></nav>"
  );


  $templateCache.put('templates/mtGlobalSettingsTemplate.html',
    "<div class=mt-global-dropdown><div class=mt-settings-clear-workspace><div class=\"btn btn-default mt-clear-workspace-btn\" ng-click=clearWorkspace()>Clear tools</div></div></div>"
  );


  $templateCache.put('templates/mtInputSwitchTemplate.html',
    "<li class=\"dropdown mt-input-menu\"><a href=# class=\"dropdown-toggle mt-navbar-icon mt-show-menu-controls\" data-toggle=dropdown></a><ul class=dropdown-menu><li class=nav-header>Select Input</li><li ng-repeat=\"inputType in inputTypes\"><a href=# ng-click=switchInput(inputType.type) ng-style={color:inputType.color} id={{inputType.type}}><i class=\"icon-ok mt-icon-color\" ng-show=currentInputType(inputType.type)></i>{{inputType.displayName}}</a></li></ul></li>"
  );


  $templateCache.put('templates/mtKeypadTemplate.html',
    "<div class=mt-keypad-menu ng-show=keypadService.isVisible()><div class=mt-popup-menu-style><div class=modal-header>Keypad<div class=mt-keypad-exit-button ng-click=close()>X</div></div><div class=modal-body><div ng-repeat=\"r in [] | range:keypad.getNumRows()\"><div class=\"mt-key-button-border mt-keypad_{{keypad.getKeyAt(r, c).getTitle()}}\" ng-repeat=\"c in [] | range:keypad.getNumKeys(r)\"><button class=mt-key-button hm-tap=\"keyTapped(keypad.getKeyAt(r, c))\">{{keypad.getKeyAt(r, c).getName()}}</button></div></div></div></div></div>"
  );


  $templateCache.put('templates/mtModalPanelTemplate.html',
    "<div class=mt-modal-panel hm-tap=tap($event)><button type=button class=mt-modal-panel-close data-dismiss=modal aria-hidden=true hm-tap=dismiss()>X</button><div class=mt-modal-panel-content ng-transclude></div></div>"
  );


  $templateCache.put('templates/mtNavigationButtonTemplate.html',
    "<div class=mt-navigation-holder style=\"background-color: {{getPhaseColor($index)}}\"><div class=mt-navigation-descriptor ng-show=nav.isCurrentPhase($index)>{{phase.title}}</div><div hm-tap=\"nav.goToPhasePart($parent.$index, $index)\" class=mt-navigation-buttonHolder ng-repeat=\"part in phase.parts\"><div class=mt-navigation-button ng-class=\"{checked : part.finished, expanded : nav.isCurrentPhasePart($parent.$index, $index)}\"></div><div class=mt-navigation-buttonArrow ng-show=\"nav.isCurrentPhasePart($parent.$index, $index)\"></div></div></div>"
  );


  $templateCache.put('templates/mtPanelTemplate.html',
    "<div class=mt-panel><div class=mt-panel-icon hm-tap=closeCallback()></div><div class=mt-panel-content ng-transclude></div></div>"
  );


  $templateCache.put('templates/mtPenMenuTemplate.html',
    "<div class=mt-pen-menu ng-show=penService.isPenMenuOpen()><div class=mt-pen-menu-arrow></div><div class=mt-pen-menu-label>Color</div><div class=mt-color-container><div class=mt-pen-option-container ng-repeat=\"color in colors\" hm-tap=penService.setPenColor(color)><div class=mt-color-circle ng-style=\"{'background-color':color}\" ng-class=\"{'mt-selected-circle': isActiveColor(color)}\"></div></div></div><div class=mt-pen-menu-seperator></div><div class=mt-pen-menu-label>Brush size</div><div class=mt-brush-container><div class=mt-pen-option-container ng-repeat=\"size in penSizes\" hm-tap=penService.setPenSize(size)><div class=mt-brush-size ng-style=getPenSizeStyle(size) ng-class=\"{'mt-selected-circle': isActivePenSize(size)}\"></div></div></div></div>"
  );


  $templateCache.put('templates/mtPopoverTemplate.html',
    "<div class=mt-popover-container><div class=mt-popover-arrow></div><div class=mt-popover-header ng-show=!item.opts.showName>{{item.name}}</div><div class=mt-popover-section ng-repeat=\"section in item.popover\"><div class=mt-popover-option-header>{{section[0]}}</div><div class=mt-popover-option-header-divider></div><div class=mt-popover-option ng-repeat=\"option in section\" ng-if=!$first><div mt-ribbon-item item=option>{{option}}</div><div class=mt-popover-option-check ng-show=option.getValue()><svg version=1.1 xmlns=http://www.w3.org/2000/svg width=20px height=40px viewbox=\"0 0 20 40\"><g><path fill=white d=\"M18.62,15.092l-1.437-0.948c-0.396-0.26-0.939-0.16-1.207,0.223L8.942,24.445L5.71,21.305 c-0.338-0.327-0.889-0.327-1.227,0l-1.229,1.194c-0.339,0.329-0.339,0.863,0,1.191l4.971,4.831C8.505,28.791,8.941,29,9.335,29 c0.394,0,0.792-0.241,1.045-0.603l8.471-12.135C19.119,15.879,19.016,15.353,18.62,15.092z\"></path></g></svg></div></div></div></div>"
  );


  $templateCache.put('templates/mtRibbonMenuTmpl.html',
    "<div class=mt-ribbon-menu ng-show=\"menu != undefined\" hm-tap=tap($event)><div class=mt-ribbon-menu-left><div ng-repeat=\"item in menu.items.left\" class=mt-ribbon-item><div mt-ribbon-item item=item></div></div></div><div class=mt-ribbon-menu-center><div ng-repeat=\"item in menu.items.center\" class=mt-ribbon-item><div mt-ribbon-item item=item></div></div></div><div class=mt-ribbon-menu-right><div ng-repeat=\"item in menu.items.right\" class=mt-ribbon-item><div mt-ribbon-item item=item></div></div></div></div>"
  );


  $templateCache.put('templates/mtTrayTemplate.html',
    "<div class=mt-tray ng-class=\"{minimized: minimized}\"><div class=mt-tray-hide-nav ng-class=\"{navMinimized: navMinimized}\" hm-tap=toggleNav()></div><div class=mt-tray-icon ng-class=\"{rotated: minimized}\" hm-tap=tap()></div><div class=mt-tray-content ng-transclude></div></div>"
  );

}]);
