(function () {
    'use strict';

    if (!window.mt) {
        window.mt = {};
    }

    if (!window.mt.numbermachine) {
        window.mt.numbermachine = {};
    }

    angular.module('mtNumberMachine', ['mt.common', 'ui.bootstrap'])

        .config(function (toolRegistryServiceProvider) {
            var template = {
                id: 'numberMachineToolbarItem',
                type: mt.common.TYPE_NUMBER_MACHINE,
                displayName: 'Number Factory',
                available: true,
                htmlTemplate: '<mt-number-machine-tool tool-id="toolId" container-api="containerApi" id="tool-{{toolId}}"></mt-number-machine-tool>',
                applet: true
            };
            toolRegistryServiceProvider.addTemplate(template);
        });

    window.mt.loadModules.push('mtNumberMachine');
})();


(function (ns) {
    'use strict';

    ns.Machine = (function () {


        //constructor function
        function Machine(spec) {
            if (!(this instanceof Machine)) {
                return new Machine(spec);
            }

            spec = spec || {};
            this.value = spec.value || 1;
            this.parts = spec.parts || [];
            this.orderedGroup = [];
            this.color = spec.color || '#ff0000';
            this.status = spec.status || ns.STATUS_NONE;
        }

        Machine.prototype.serialize = function() {
            var data = {};
            data.value = this.value;
            data.parts = [];
            for (var p in this.parts) {
                var machine = {
                    value: this.parts[p].value,
                    color: this.parts[p].color,
                    status: this.parts[p].status
                };
                data.parts.push(machine);
            }
            data.color = this.color;
            data.status = this.status;

            return data;
        };

        Machine.prototype.deserialize = function(data) {
            this.value = data.value;
            this.parts = [];
            for (var p in data.parts) {
                var machine = new ns.Machine();
                machine.deserialize(data.parts[p]);
                this.parts.push(machine);
            }
            this.color = data.color;
            this.status = data.status;
            this.recalculate();
        };

        Machine.prototype.addPart = function(machine) {
            if (machine.value <= 1) {
                return;
            }
            this.parts.push(machine);
            this.recalculate();
        };

        Machine.prototype.removePartAtIndex = function(index) {
            if (index < 0 || index >= this.parts.length) {
                return;
            }
            this.parts.splice(index, 1);
            this.recalculate();
        };

        Machine.prototype.tuneUpParts = function(machine) {
            var newParts = [];
            for (var p in this.parts) {
                if (this.parts[p].value === machine.value) {
                    for (var mp in machine.parts) {
                        newParts.push(machine.parts[mp]);
                    }
                } else {
                    newParts.push(this.parts[p]);
                }
            }
            this.parts = newParts;
            this.recalculate();
        };

        Machine.prototype.getTotalValue = function() {
            var totalValue = 1;
            for (var i in this.parts) {
                totalValue *= this.parts[i].value;
            }
            return totalValue;
        };

        Machine.prototype.recalculate = function() {
            this.findStatus();
            this.orderOrderedGroup();
        };

        Machine.prototype.findStatus = function() {
            if (this.parts.length === 0) {
                this.status = ns.STATUS_NONE;
            } else if (this.value === this.getTotalValue()) {
                this.status = ns.STATUS_CORRECT;
            } else if (this.value % this.getTotalValue() === 0) {
                this.status = ns.STATUS_INCOMPLETE;
            } else {
                this.status = ns.STATUS_ERROR;
            }
        };

        Machine.prototype.orderOrderedGroup = function() {
            this.orderedGroup = [];

            for (var i = 0; i < this.parts.length; i++) {
                if (i === 5 && this.parts.length > 6) {
                    this.orderedGroup[i] = {
                        machine: undefined,
                        isPlus: true
                    };
                    break;
                } else {
                    this.orderedGroup[i] = {
                        machine: this.parts[i],
                        isPlus: false
                    };
                }
            }
        };

        Machine.prototype.getPartsInOrderedGroup = function() {
            return this.orderedGroup;
        };

        Machine.prototype.containsValue = function(value) {
            for (var p in this.parts) {
                if (this.parts[p].value === value) {
                    return true;
                }
            }
            return false;
        };

        Machine.prototype.getValueUpTo = function(index) {
            var value = 1;
            for (var i = 0; i <= index && i < this.parts.length; i++) {
                value *= this.parts[i].value;
            }
            return value;
        };

        return Machine;
    })();

})(window.mt.numbermachine);
(function (ns) {
    'use strict';

    ns.NumberMachine = (function () {


        //constructor function
        function NumberMachine(spec) {
            if (!(this instanceof NumberMachine)) {
                return new NumberMachine(spec);
            }

            spec = spec || {};
            this.machines = [];
            this.inventory = [];
            this.numOfMachines = spec.numOfMachines || 50;
            this.initNumberMachine();
        }

        function newRandomColor() {
            var colorMin = 128;
            var colors = [colorMin, colorMin, colorMin];
            var maxColorIndex = parseInt(Math.random() * 3, 10);
            var randColorIndex = (maxColorIndex + 1 + (parseInt(Math.random() * 2, 10))) % 3;
            colors[maxColorIndex] = 255;
            colors[randColorIndex] = parseInt(Math.random() * (256 - colorMin), 10) + colorMin;
            var hexColor = '#';
            for (var c in colors) {
                var hexString = (colors[c]).toString(16);
                if (hexString.length === 1) {
                    hexString = '0' + hexString;
                }
                hexColor += hexString;
            }
            return hexColor;
        }

        NumberMachine.prototype.serialize = function() {
            var data = {};
            data.numOfMachines = this.numOfMachines;
            data.machines = [];
            for (var m in this.machines) {
                data.machines.push(this.machines[m].serialize());
            }
            data.inventory = [];
            for (var i in this.inventory) {
                data.inventory.push(this.inventory[i].serialize());
            }
            return data;
        };

        NumberMachine.prototype.deserialize = function(data) {
            this.numOfMachines = data.numOfMachines;
            this.machines = [];
            for (var m in data.machines) {
                var machine = new ns.Machine();
                machine.deserialize(data.machines[m]);
                this.machines.push(machine);
            }
            this.inventory = [];
            for (var o in data.inventory) {
                var item = new ns.Machine();
                item.deserialize(data.inventory[o]);
                this.inventory.push(item);
            }
        };

        NumberMachine.prototype.initNumberMachine = function() {
            this.machines = [];
            for (var i = 2; i <= this.numOfMachines; i++) {
                this.machines.push(new ns.Machine({
                        value: i
                    }));
            }
        };

        NumberMachine.prototype.tuneUpMachines = function(machine) {
            for (var m in this.machines) {
                this.machines[m].tuneUpParts(machine);
            }
            this.removeFromInventory(machine);
            for (var p in machine.parts) {
                this.addToInventory(machine.parts[p]);
            }
        };

        NumberMachine.prototype.addToInventory = function(machine) {
            if (machine.value <= 1) {
                return;
            }
            for (var i = 0; i < this.inventory.length; i++) {
                if (machine.value === this.inventory[i].value) {
                    return;
                } else if (machine.value < this.inventory[i].value) {
                    this.inventory.splice(i, 0, machine);
                    machine.color = newRandomColor();
                    return;
                }
            }
            machine.color = newRandomColor();
            this.inventory.push(machine);
        };

        NumberMachine.prototype.removeFromInventory = function(machine) {
            for (var i = 0; i < this.inventory.length; i++) {
                if (machine.value === this.inventory[i].value) {
                    this.inventory.splice(i, 1);
                    return;
                }
            }
        };

        NumberMachine.prototype.updateInventory = function(tuneUpMachine) {
            var newInventory = [];
            for (var i in this.inventory) {
                if (this.containsValue(this.inventory[i].value, tuneUpMachine)) {
                    newInventory.push(this.inventory[i]);
                }
            }
            this.inventory = newInventory;
        };

        NumberMachine.prototype.containsValue = function(value, tuneUpMachine) {
            for (var m in this.machines) {
                if (this.machines[m].containsValue(value)) {
                    return true;
                }
            }
            if (tuneUpMachine !== undefined) {
                if (tuneUpMachine.containsValue(value)) {
                    return true;
                }
            }
            return false;
        };

        NumberMachine.prototype.getColor = function(machine) {
            for (var i in this.inventory) {
                if (machine.value === this.inventory[i].value) {
                    return this.inventory[i].color;
                }
            }
            return '#000000';
        };

        NumberMachine.prototype.massProduce = function(machine, column, offset) {
            if (offset === undefined) {
                offset = 0;
            }
            var i = offset - 2;
            for (; i < this.machines.length; i += column) {
                if (i < 0) {
                    continue;
                }
                if (this.machines[i].status !== ns.STATUS_CORRECT) {
                    this.machines[i].addPart(machine);
                }
            }
        };




        return NumberMachine;
    })();

})(window.mt.numbermachine);


(function (ns) {
    'use strict';

    ns.STATE_MACHINE_SELECT = 'machineSelectScreen';
    ns.STATE_MACHINE_EDIT = 'machineEdit';
    ns.STATE_MACHINE_TUNE_UP = 'machineTuneUp';

    ns.STATUS_INCOMPLETE = 'incomplete';
    ns.STATUS_CORRECT = 'correct';
    ns.STATUS_ERROR = 'error';
    ns.STATUS_NONE = 'none';

})(window.mt.numbermachine);

(function (ns) {
    'use strict';

    /* Controllers */

    angular.module('mtNumberMachine').controller('NumberMachineCtrl', function ($scope, toolPersistorService, $timeout) {

        $scope.init = function() {
            if (!$scope.numberMachine) {
                $scope.numberMachine = new ns.NumberMachine();
            }
            $scope.editMachine = undefined;
            $scope.tuneUpMachine = undefined;

            $scope.selectTuneUpMode = false;
            $scope.selectDeleteMode = false;
            $scope.resizeDialogOpen = false;
            $scope.massProduceMode = false;

            $scope.numOfColumns = 10;
            $scope.massProduceOffset = 0;
            $scope.tryAgain = false;

            $scope.gameState = ns.STATE_MACHINE_SELECT;

            //persistence
            $scope.serialize = function () {
                return $scope.numberMachine.serialize();
            };

            $scope.deserialize = function (data) {
                $scope.numberMachine.deserialize(data);
            };

            toolPersistorService.registerTool($scope.toolId, mt.common.TYPE_NUMBER_MACHINE, $scope.containerApi, $scope.serialize, $scope.deserialize);
        };

        function turnOffAllSelectModes(){
            $scope.selectTuneUpMode = false;
            $scope.selectDeleteMode = false;
            $scope.newPartBoxVisible = false;
            $scope.massProduceMode = false;
            $scope.displayTotalMode = false;
            $scope.currentDisplayIndex = 0;
        }

        function toggleDisplayTotal(index) {
            if (index === $scope.currentDisplayIndex) {
                $scope.displayTotalMode = !$scope.displayTotalMode;
            } else {
                $scope.displayTotalMode = true;
                $scope.currentDisplayIndex = index;
            }
        }

        $scope.toggleAddNewPart = function(on) {
            if (on === undefined) {
                on = !$scope.newPartBoxVisible;
            }
            $scope.addEditValue = '';
            $scope.newPartBoxVisible = on;
        };

        $scope.openResizeDialog = function(open) {
            $scope.resizeDialogOpen = open;
        };

        $scope.setNumOfColumns = function(col) {
            $scope.numOfColumns = col;
            $scope.resetViewPortPosition();
        };

        $scope.setTryAgain = function(on) {
            var mode = !$scope.tryAgain;
            if (on !== undefined) {
                mode = on;
            }
            $scope.tryAgain = on;
        };

        $scope.goToSelectScreen = function() {
            this.gameState = ns.STATE_MACHINE_SELECT;
            turnOffAllSelectModes();
        };

        $scope.isSelectScreen = function() {
            return this.gameState === ns.STATE_MACHINE_SELECT;
        };

        $scope.goToEditScreen = function(machine) {
            if (machine !== undefined) {
                $scope.editMachine = machine;
                $scope.editMachine.showStatus = false;
            }
            this.gameState = ns.STATE_MACHINE_EDIT;
            turnOffAllSelectModes();
        };

        $scope.isEditScreen = function() {
            return this.gameState === ns.STATE_MACHINE_EDIT;
        };

        $scope.goToTuneUpScreen = function(machine) {
            if (machine !== undefined) {
                $scope.tuneUpMachine = machine;
            }
            this.gameState = ns.STATE_MACHINE_TUNE_UP;
            turnOffAllSelectModes();
        };

        $scope.isTuneUpScreen = function() {
            return this.gameState === ns.STATE_MACHINE_TUNE_UP;
        };

        $scope.getCurrentMachine = function() {
            var machine;
            if ($scope.isEditScreen()) {
                machine = $scope.editMachine;
            } else if ($scope.isTuneUpScreen()) {
                machine = $scope.tuneUpMachine;
            }
            return machine;
        };

        //edit screen
        $scope.finishWithCurrentScreen = function() {
            turnOffAllSelectModes();
            if ($scope.isEditScreen()) {
                $scope.editMachine.recalculate();
                $scope.editMachine.statusMessage = '';
                if ($scope.editMachine.status === ns.STATUS_ERROR) {
                    $scope.editMachine.statusMessage = 'Machine Error. Try Again.';
                }
                else if ($scope.editMachine.status === ns.STATUS_CORRECT) {
                    $scope.editMachine.statusMessage = 'Correct';
                }
                else if ($scope.editMachine.status === ns.STATUS_INCOMPLETE) {
                    $scope.editMachine.statusMessage = 'Incomplete';
                }

                $scope.editMachine.showStatus = true;
                $timeout(function(){
                    $scope.editMachine.showStatus = false;
                    if ($scope.editMachine.status === ns.STATUS_CORRECT){
                        $scope.goToSelectScreen();
                    }
                    else {
                        toggleDisplayTotal($scope.editMachine.parts.length - 1);
                    }
                }, 2000);
            } else if ($scope.isTuneUpScreen()) {
                $scope.numberMachine.tuneUpMachines($scope.tuneUpMachine);
                $scope.goToSelectScreen();
            }
        };

        $scope.toggleDeleteSelectMode = function(mode) {
            var selectMode = !$scope.selectDeleteMode;
            if (mode !== undefined) {
                selectMode = mode;
            }
            turnOffAllSelectModes();
            $scope.selectDeleteMode = selectMode;
        };

        $scope.selectPartAtIndex = function(index) {
            if ($scope.selectDeleteMode) {
                var machine = $scope.getCurrentMachine();
                if (machine !== undefined) {
                    machine.removePartAtIndex(index);
                }
                $scope.toggleDeleteSelectMode(false);
            } else {
                toggleDisplayTotal(index);
            }
            if ($scope.isTuneUpScreen()) {
                $scope.numberMachine.updateInventory($scope.tuneUpMachine);
            } else {
                $scope.numberMachine.updateInventory();
            }
        };

        $scope.getCurrentModeValue = function() {
            var machine = $scope.getCurrentMachine();
            if (machine === undefined) {
                return 0;
            }
            return machine.value;
        };

        $scope.canDisplayValue = function(index) {
            return ($scope.displayTotalMode && index === $scope.currentDisplayIndex);
        };

        $scope.canDisplayValueHighlight = function(index) {
            return ($scope.displayTotalMode && index <= $scope.currentDisplayIndex);
        };

        //keypad
        $scope.tapNewPartButton = function(value) {
            $scope.addEditValue += '' + value;
        };

        $scope.addNewPartFromEditValue = function() {
            var value = parseInt($scope.addEditValue, 10);
            if (isNaN($scope.addEditValue) || (value + '' !== $scope.addEditValue) ||
            value <= 0) {
                return;
            }

            var machine = new ns.Machine({value: value});
            if ($scope.massProduceMode) {
                $scope.numberMachine.massProduce(machine, $scope.numOfColumns, $scope.massProduceOffset);
                $scope.setMassProduceMode(false);
            } else {
                $scope.selectItemFromInventory(machine);
            }
            $scope.numberMachine.addToInventory(machine);
            $scope.toggleAddNewPart(false);
        };

        //inventory
        $scope.toggleTuneUpSelectMode = function() {
            var selectMode = !$scope.selectTuneUpMode;
            turnOffAllSelectModes();
            $scope.selectTuneUpMode = selectMode;
        };

        $scope.selectItemFromInventory = function(item) {
            if ($scope.selectTuneUpMode) {
                $scope.goToTuneUpScreen(item);
            } else if ($scope.massProduceMode) {
                $scope.numberMachine.massProduce(item, $scope.numOfColumns, $scope.massProduceOffset);
                $scope.setMassProduceMode(false);
            } else {
                var machine = $scope.getCurrentMachine();
                if (machine !== undefined) {
                    machine.addPart(item);
                }
            }
        };

        //table
        $scope.setMassProduceMode = function(mode) {
            $scope.massProduceOffset = 0;
            var selectMode = !$scope.massProduceMode;
            if (mode !== undefined) {
                selectMode = mode;
            }
            turnOffAllSelectModes();
            $scope.massProduceMode = selectMode;
            if (selectMode) {
                $scope.resetViewPortPosition(true);
            }
        };

        $scope.tapMachineCube = function(item) {
            if ($scope.massProduceMode) {
                $scope.massProduceOffset = item.value % $scope.numOfColumns;
            } else {
                $scope.goToEditScreen(item);
            }
        };

        $scope.resetViewPortSize = function() {
            $scope.setNumOfColumns(10);
        };

        $scope.getNumOfStatus = function(status) {
            var total = 0;
            for (var i in $scope.numberMachine.machines) {
                total += ($scope.numberMachine.machines[i].status === status)? 1 : 0;
            }
            return total;
        };

        $scope.getNumOfInventory = function() {
            return $scope.numberMachine.inventory.length;
        };

        $scope.isMassProduceColumn = function(item) {
            return ($scope.massProduceMode &&
                ((item.value % $scope.numOfColumns) === $scope.massProduceOffset));
        };

        $scope.isMassProduceItem = function(item) {
            return ($scope.isMassProduceColumn(item) &&
                item.status !== ns.STATUS_CORRECT);
        };

        $scope.hasStatus = function(machine) {
            return machine.status !== 'none';
        };

    });
})(window.mt.numbermachine);

(function (ns) {
    'use strict';

    angular.module('mtNumberMachine').directive('mtNumberMachineEditScreen', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/numberMachineEditScreenTemplate.html',
            replace: true,
            link: function (scope, element, attrs) {
            }
        };
    });
})(window.mt.numbermachine);
(function (ns) {
    'use strict';

    angular.module('mtNumberMachine').directive('mtNumberMachineInventory', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/numberMachineInventoryTemplate.html',
            replace: true,
            link: function (scope, element, attrs) {
            }
        };
    });
})(window.mt.numbermachine);
(function (ns) {
    'use strict';

    angular.module('mtNumberMachine').directive('mtNumberMachineKeypad', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/numberMachineKeypadTemplate.html',
            replace: true,
            link: function (scope, element, attrs) {
            }
        };
    });
})(window.mt.numbermachine);
(function (ns) {
    'use strict';

    angular.module('mtNumberMachine').directive('mtNumberMachineTable', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/numberMachineTableTemplate.html',
            replace: true,
            link: function (scope, element, attrs) {
            }
        };
    });
})(window.mt.numbermachine);
(function (ns) {
    'use strict';

    angular.module('mtNumberMachine').directive('mtNumberMachineResizeModal', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/numberMachineResizeModalTemplate.html',
            replace: true,
            link: function (scope, element, attrs) {
                // move the popup to the body, so the that z-index layering works correctly
                $(element).appendTo($('body'));
                function getNumOfColumns(currElement) {
                    var width = $(currElement).width();
                    var child = $(currElement).find(':first-child');
                    var childWidth = $(child).width() + (2 * parseInt($(child).css('margin'), 10));
                    var numOfColumns = parseInt(width / childWidth, 10);
                    if (numOfColumns < 1) {
                        numOfColumns = 1;
                    } else if (numOfColumns > 50) {
                        numOfColumns = 50;
                    }
                    return numOfColumns;
                }

                $(element).find('.mt-machine-table-viewport').on('touchstart', function(event){});

                $(element).find('.mt-resizable').resizable({
                    stop: function (event, ui) {
                        scope.tempNumOfColumns = getNumOfColumns($(this));
                    },
                    resize: function(event, ui) {
                        scope.tempNumOfColumns = getNumOfColumns($(this));
                    }
                });

                // remove the popup explicitly since it is in a different DOM position
                scope.$on('$destroy', function() {
                    $(element).remove();
                });

                scope.resizeTable = function() {
                    scope.openResizeDialog(false);
                    scope.setNumOfColumns(scope.tempNumOfColumns);
                };

                scope.$watch('resizeDialogOpen', function(newVal, oldVal) {
                    if (newVal) {
                        var parent = $(element).find('.mt-resizable');
                        $(parent).width(142);
                        scope.tempNumOfColumns = getNumOfColumns($(parent));
                    }
                });
            }
        };
    });
})(window.mt.numbermachine);
(function (ns) {
    'use strict';

    angular.module('mtNumberMachine').directive('mtNumberMachineTryAgain', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/numberMachineTryAgainModalTemplate.html',
            replace: true,
            link: function (scope, element, attrs) {
                // move the popup to the body, so the that z-index layering works correctly
                $(element).appendTo($('body'));
                // remove the popup explicitly since it is in a different DOM position
                scope.$on('$destroy', function() {
                    $(element).remove();
                });

                scope.$watch('tryAgain', function(newVal) {
                    if (newVal) {
                        $('.modal-backdrop').css('background-color', 'transparent');
                    } else {
                        $('.modal-backdrop').css('background-color', '#000');
                        scope.goToSelectScreen();
                    }
                });
            }
        };
    });
})(window.mt.numbermachine);
(function (ns) {
    'use strict';

    /* Directives */

    angular.module('mtNumberMachine').directive('mtNumberMachineTool', function () {
        return {
            restrict            : 'E',
            templateUrl         : 'templates/numberMachineToolTemplate.html',
            scope               : {
                toolId: '=',
                containerApi: '='
            },
            controller          : 'NumberMachineCtrl',
            link: function (scope, element) {
                scope.targetElement = $(element).find('.mt-number-machine-container')[0];
                scope.init();

                scope.panViewPort = function(event) {
                    var lastCenter = scope.panCenter;
                    scope.panCenter = event.gesture.center;
                    if (lastCenter === undefined){
                        return;
                    }

                    var parent = $(event.srcElement).parents('.mt-pan-viewport')[0];
                    var child = $(parent).children().first();
                    var moveHor = scope.panCenter.pageX - lastCenter.pageX;
                    var moveVert = scope.panCenter.pageY - lastCenter.pageY;
                    var left = parseInt($(child).css('left'), 10);
                    var top = parseInt($(child).css('top'), 10);
                    var childWidth = $(child).width();
                    var parentWidth = $(parent).width();
                    var childHeight = $(child).height();
                    var parentHeight = $(parent).height();
                    if (childWidth <= parentWidth) {
                        moveHor = 0;
                    }
                    if (childHeight <= parentHeight) {
                        moveVert = 0;
                    }
                    var newLeft = (left + moveHor);
                    var newTop = (top + moveVert);
                    if (newLeft + childWidth < parentWidth) {
                        newLeft = parentWidth - childWidth;
                    }
                    if (newLeft > 0) {
                        newLeft = 0;
                    }
                    if (newTop + childHeight < parentHeight) {
                        newTop = parentHeight - childHeight;
                    }
                    if (newTop > 0) {
                        newTop = 0;
                    }
                    $(child).css('left', newLeft);
                    $(child).css('top', newTop);
                };

                scope.resetViewPortPosition = function(right) {
                    var left = 0;
                    var parent = $(element).find('.mt-machine-table-viewport')[0];
                    var child = $(parent).children().first();
                    if (right === true) {
                        left = $(parent).width() - $(child).width();
                    }
                    $(child).css('left', left);
                    $(child).css('top', 0);
                };

                scope.panViewPortEnd = function(event) {
                    scope.panCenter = undefined;
                };
            }
        };
    });

    angular.module('mtNumberMachine').directive('ngEnter', function() {
        return function (scope, element, attrs) {
            element.bind('keydown keypress', function(event) {
                if(event.which === 13) {
                    scope.$apply(function(){
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    });



})(window.mt.numbermachine);

angular.module('mtNumberMachine').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/numberMachineEditScreenTemplate.html',
    "<div class=mt-number-machine-container ng-class=\"{'mt-selected': isTuneUpScreen()}\"><mt-number-machine-try-again></mt-number-machine-try-again><div class=mt-conveyor-belt></div><div class=\"mt-new-machine-button mt-add-part-keypad\" ng-hide=newPartBoxVisible hm-tap=toggleAddNewPart(true)><div>Add New Machine</div></div><div class=mt-back-button hm-tap=goToSelectScreen()></div><div class=mt-delete-button hm-tap=toggleDeleteSelectMode() ng-class=\"{'mt-selected': selectDeleteMode}\"></div><div class=mt-build-button hm-tap=finishWithCurrentScreen()></div><div class=\"mt-machine-totals mt-machine-correct\">Targets Completed <span>{{getNumOfStatus('correct')}}</span></div><div class=mt-machine-number>{{getCurrentModeValue()}}</div><div class=mt-parts-holder><div class=mt-current-part><div class=mt-part-click><div class=mt-machine-part>x 1</div><div class=mt-machine-part-arrow></div></div></div><div class=mt-current-part ng-repeat=\"part in getCurrentMachine().parts track by $index\"><div class=mt-part-click hm-tap=selectPartAtIndex($index)><div class=mt-machine-part-highlight ng-show=canDisplayValueHighlight($index)><div class=mt-machine-part></div><div class=mt-machine-part-arrow></div></div><div class=\"mt-machine-part mt-machine-part{{$index}}\" style=\"background-color: {{numberMachine.getColor(part)}}\">x {{part.value}}</div><div class=mt-machine-part-arrow style=\"border-left-color: {{numberMachine.getColor(part)}}\"></div><div class=mt-current-value-holder ng-if=canDisplayValue($index)><div class=mt-current-value>{{getCurrentMachine().getValueUpTo($index)}}</div><div class=mt-current-value-arrow></div></div></div></div><div class=\"mt-new-machine-part mt-current-part mt-machine-part\" ng-show=newPartBoxVisible>{{addEditValue}}</div><div class=\"mt-machine-status {{editMachine.status}}\" ng-show=editMachine.showStatus>{{editMachine.statusMessage}}</div></div></div>"
  );


  $templateCache.put('templates/numberMachineInventoryTemplate.html',
    "<div class=mt-inv-wrap><div class=mt-inventory><div class=\"mt-machine-inventory-viewport mt-pan-viewport mt-allow-scroll\"><div class=mt-machine-inventory-content><div class=mt-total-value-inventory-text>Inventory</div><div class=\"mt-total-value-inventory mt-total-value-inventory-text\">Total : {{getNumOfInventory()}}</div><div style=background-color:{{numberMachine.getColor(item)}} class=\"mt-inventory-item mt-inventory-item-index{{$index}} mt-inventory-item-value{{item.value}}\" hm-tap=selectItemFromInventory(item) ng-repeat=\"item in numberMachine.inventory track by $index\">{{item.value}}</div><div ng-show=massProduceMode class=\"mt-inventory-item mt-new-machine-inventory-button\" hm-tap=toggleAddNewPart(true)><div ng-show=newPartBoxVisible>{{addEditValue}}</div><div ng-hide=newPartBoxVisible>+</div></div><div class=mt-resize-fix></div></div></div></div><div class=mt-tune-up-button hm-tap=toggleTuneUpSelectMode() ng-hide=isTuneUpScreen() ng-class=\"{'mt-selected': selectTuneUpMode}\"></div></div>"
  );


  $templateCache.put('templates/numberMachineKeypadTemplate.html',
    "<div class=mt-add-part-keypad ng-show=newPartBoxVisible><div ng-repeat=\"n in [] | range: 10\" class=\"mt-add-part-button mt-add-part-keypad-button{{($index + 1) % 10}}\" hm-tap=\"tapNewPartButton(($index + 1) % 10)\">{{($index + 1) % 10}}</div><div class=\"mt-add-part-button mt-add-part-enter-button\" hm-tap=addNewPartFromEditValue()>ENTER</div><div class=\"mt-add-part-button mt-add-part-cancel-button\" hm-tap=toggleAddNewPart(false)>CANCEL</div></div>"
  );


  $templateCache.put('templates/numberMachineResizeModalTemplate.html',
    "<div modal=resizeDialogOpen class=mt-resize-dialog><div class=modal-header><h3>Resize Table</h3></div><div class=modal-body><div class=mt-resizable><div class=mt-resizable-cubes>1</div><div class=mt-resizable-cubes ng-repeat=\"machine in numberMachine.machines\">{{machine.value}}</div><div class=mt-handle></div></div></div><div class=modal-footer><button class=\"btn btn-warning mt-resize-cancel\" hm-tap=openResizeDialog(false)>Cancel</button> <button class=\"btn btn-primary mt-resize-ok\" hm-tap=resizeTable()>Resize</button></div></div>"
  );


  $templateCache.put('templates/numberMachineTableTemplate.html',
    "<div class=mt-machine-cube-table><div class=mt-machine-title>Number Factory</div><div class=mt-machine-cube-buttons><div class=\"mt-button-holder mt-resize-btn\" hm-tap=openResizeDialog(true)><div class=\"mt-resize-button mt-button\"></div><div class=\"mt-button-text mt-one-line-text-middle\">RESIZE</div></div><div class=\"mt-button-holder mt-full-display-btn\" hm-tap=resetViewPortSize()><div class=\"mt-fit-button mt-button\"></div><div class=\"mt-button-text mt-two-line-text-middle\">FULL DISPLAY</div></div><div class=\"mt-button-holder mt-right-button-holder mt-mass-produce-btn\" ng-class=\"{'mt-selected': massProduceMode}\" hm-tap=setMassProduceMode()><div class=\"mt-mass-produce-button mt-button\"></div><div class=\"mt-button-text mt-two-line-text-middle\">MASS PRODUCE</div></div></div><div class=\"mt-machine-table-viewport mt-pan-viewport\" hm-dragstart=panViewPort($event) hm-drag=panViewPort($event) hm-dragend=panViewPortEnd($event)><div class=mt-machine-table-content style=\"width:{{numOfColumns * 67}}px\" ng-style=getMachineTableContent()><div><div class=\"mt-machine-cube mt-number-one\"><div class=mt-machine-cube-click><div class=\"mt-machine-value mt-number-one\">1</div></div></div><div class=mt-machine-cube ng-class=\"{'mt-highlight': isMassProduceItem(machine), 'mt-outline': isMassProduceColumn(machine), 'mt-no-status': !(hasStatus(machine) || isMassProduceItem(machine))}\" ng-repeat=\"machine in numberMachine.machines track by $index\"><div class=\"mt-machine-cube-click mt-machine-cube-click{{machine.value}}\" hm-tap=tapMachineCube(machine)><div class=mt-machine-value>{{machine.value}}</div><div class=mt-machine-status ng-switch=machine.status><div ng-switch-when=correct class=mt-correct>✓</div><div ng-switch-when=incomplete class=mt-incomplete>–</div><div ng-switch-when=error class=mt-error>X</div></div><div class=mt-machine-parts><div class=mt-part ng-repeat=\"item in machine.getPartsInOrderedGroup() track by $index\" ng-switch=item.isPlus><div class=\"mt-part{{$index}} mt-plus\" ng-switch-when=true>+</div><div class=mt-part{{$index}} style=background-color:{{numberMachine.getColor(item.machine)}} ng-switch-when=false>{{item.machine.value}}</div></div></div></div></div></div></div></div><div class=\"mt-total-value mt-correct mt-total-value-correct\">Targets Completed <span>{{getNumOfStatus('correct')}}</span></div><div class=\"mt-total-value mt-error mt-total-value-error\">Upgrades Required <span>{{getNumOfStatus('error')}}</span></div></div>"
  );


  $templateCache.put('templates/numberMachineToolTemplate.html',
    "<div class=mt-number-machine><mt-number-machine-keypad></mt-number-machine-keypad><mt-number-machine-inventory></mt-number-machine-inventory><mt-number-machine-table ng-show=isSelectScreen()></mt-number-machine-table><mt-number-machine-edit-screen ng-show=\"isEditScreen() || isTuneUpScreen()\"></mt-number-machine-edit-screen><mt-number-machine-resize-modal></mt-number-machine-resize-modal></div>"
  );


  $templateCache.put('templates/numberMachineTryAgainModalTemplate.html',
    "<div modal=tryAgain class=mt-try-again><div class=modal-header>Sorry</div><div class=modal-body><div class=mt-try-again-message>Please Try Again</div></div><div class=modal-footer><div class=\"btn btn-primary mt-try-again-button\" hm-tap=setTryAgain(false)>Ok</div></div></div>"
  );

}]);
