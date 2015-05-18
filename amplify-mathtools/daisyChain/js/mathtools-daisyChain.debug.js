(function () {
    'use strict';

    if (!window.mt) {
        window.mt = {};
    }

    if (!window.mt.daisychain) {
        window.mt.daisychain = {};
    }

    angular.module('mtDaisyChain', ['mt.common', 'ui.bootstrap'])

        .config(function (toolRegistryServiceProvider) {
            var template = {
                id: 'daisyChainToolbarItem',
                type: mt.common.TYPE_DAISY_CHAIN,
                displayName: 'Daisy Chain',
                available: true,
                htmlTemplate: '<mt-daisy-chain-tool tool-id="toolId" container-api="containerApi" id="tool-{{toolId}}"></mt-daisy-chain-tool>',
                applet: true
            };
            toolRegistryServiceProvider.addTemplate(template);
        });

    window.mt.loadModules.push('mtDaisyChain');
})();


(function (ns) {
    'use strict';

    ns.Chain = (function () {

        //constructor function
        function Chain(spec) {
            if (!(this instanceof Chain)) {
                return new Chain(spec);
            }

            spec = spec || {};
            this.tokens = getSpec(spec.tokens, []);
            this.head = getSpec(spec.head, 1);
            this.tail = getSpec(spec.tail, 1);
            this.total = getSpec(spec.total, 1);
            if (this.tokens.length === 0) {
                this.addNewToken();
            }
        }

        function getSpec(val, defaultVal) {
            return (val !== undefined) ? val : defaultVal;
        }

        Chain.prototype.serialize = function() {
            var data = {
                head : this.head,
                tail : this.tail,
                total : this.total,
                tokens : []
            };
            for (var t in this.tokens) {
                data.tokens.push(this.tokens[t].serialize());
            }
            return data;
        };

        Chain.prototype.deserialize = function(data) {
            this.head = data.head;
            this.tail = data.tail;
            this.total = data.total;
            this.tokens = [];
            for (var t in data.tokens) {
                var token = new ns.Token();
                token.deserialize(data.tokens[t]);
                this.tokens.push(token);
            }
        };

        Chain.prototype.isComplete = function() {
            this.recalculateIntermediates();
            return (this.tail === this.total);
        };

        Chain.prototype.recalculateIntermediates = function() {
            var currentValue = mt.common.MtValue(this.head, 1, true);
            var t = 0;
            for (; t < this.tokens.length; t++) {
                var token = this.tokens[t];
                if (!token.isFilledIn()) {
                    break;
                }
                if (token.value === undefined || token.value === '') {
                    break;
                }
                if (token.operator === ns.DAISY_CHAIN_OPERATOR_MULTIPLY) {
                    currentValue.multiplyByNum(token.value);
                } else if (token.operator === ns.DAISY_CHAIN_OPERATOR_DIVIDE) {
                    currentValue.divideByNum(token.value);
                }
                token.intermediate = currentValue.toString();
            }
            this.tokens = this.tokens.splice(0, t + 1);
            this.total = currentValue.val();
        };
        Chain.prototype.getLastToken = function() {
            if (this.tokens.length === 0) {
                return undefined;
            }
            return this.tokens[this.tokens.length - 1];
        };

        Chain.prototype.deselectAllTokens = function() {
            for (var i = 0; i < this.tokens.length; i++){
                this.tokens[i].selected = false;
            }
        };
        Chain.prototype.selectToken = function(token) {
            var tokens = [];

            for (var t in this.tokens) {
                this.tokens[t].selected = false;
                tokens.push(this.tokens[t]);
                if (this.tokens[t] === token) {
                    break;
                }
            }
            token.selected = true;
            this.tokens = tokens;
            this.recalculateIntermediates();
        };

        Chain.prototype.addNewToken = function() {
            var token = new ns.Token();
            this.tokens.push(token);
        };

        return Chain;
    })();

})(window.mt.daisychain);
(function (ns) {
    'use strict';

    ns.Lesson = (function () {

        //constructor function
        function Lesson(spec) {
            if (!(this instanceof Lesson)) {
                return new Lesson(spec);
            }

            spec = spec || {};
            this.tasks = getSpec(spec.tasks, []);
            if (this.tasks.length === 0) {
                this.createTask(1, 1);
            }
            this.currentTask = this.tasks[0];
        }

        function getSpec(val, defaultVal) {
            return (val !== undefined) ? val : defaultVal;
        }

        Lesson.prototype.serialize = function() {
            var data = {
                tasks : []
            };
            for (var t in this.tasks) {
                data.tasks.push(this.tasks[t].serialize());
            }
            return data;
        };

        Lesson.prototype.deserialize = function(data) {
            this.tasks = [];
            for (var t in data.tasks) {
                var task = new ns.Task();
                task.deserialize(data.tasks[t]);
                this.tasks.push(task);
            }
            this.currentTask = this.tasks[0];
        };

        Lesson.prototype.createTask = function(head, tail) {
            var task = new ns.Task({
                head: head,
                tail: tail
            });
            this.tasks.push(task);
        };

        return Lesson;
    })();

})(window.mt.daisychain);
(function (ns) {
    'use strict';

    ns.Task = (function () {

        //constructor function
        function Task(spec) {
            if (!(this instanceof Task)) {
                return new Task(spec);
            }

            spec = spec || {};
            this.chains = getSpec(spec.chains, []);
            this.head = getSpec(spec.head, 1);
            this.tail = getSpec(spec.tail, 1);
            if (this.chains.length === 0) {
                this.newChain();
            }
        }

        function getSpec(val, defaultVal) {
            return (val !== undefined) ? val : defaultVal;
        }

        Task.prototype.serialize = function() {
            var data = {
                head: this.head,
                tail: this.tail,
                chains: []
            };
            for (var c in this.chains) {
                data.chains.push(this.chains[c].serialize());
            }
            return data;
        };

        Task.prototype.deserialize = function(data) {
            this.head = data.head;
            this.tail = data.tail;
            this.chains = [];
            for (var c in data.chains) {
                var chain = new ns.Chain();
                chain.deserialize(data.chains[c]);
                this.chains.push(chain);
            }
        };

        Task.prototype.needsNewChain = function() {
            return this.chains.length === 0 || this.getLastChain().isComplete();
        };

        Task.prototype.newChain = function() {
            var chain = new ns.Chain({
                head: this.head,
                tail: this.tail
            });
            this.chains.push(chain);
        };

        Task.prototype.getLastChain = function() {
            if (this.chains.length === 0) {
                return undefined;
            }
            return this.chains[this.chains.length - 1];
        };
        return Task;
    })();

})(window.mt.daisychain);
(function (ns) {
    'use strict';

    ns.Token = (function () {

        //constructor function
        function Token(spec) {
            if (!(this instanceof Token)) {
                return new Token(spec);
            }

            spec = spec || {};
            this.operator = spec.operator;
            this.value = getSpec(spec.value, '');
            this.intermediate = getSpec(spec.intermediate, 0);
            this.selected = false;
        }

        function getSpec(val, defaultVal) {
            return (val !== undefined) ? val : defaultVal;
        }

        Token.prototype.serialize = function() {
            return {
                operator: this.operator,
                value: this.value,
                intermediate: this.intermediate
            };
        };

        Token.prototype.deserialize = function(data) {
            this.operator = data.operator;
            this.value = data.value;
            this.intermediate = data.intermediate;
        };

        Token.prototype.isFilledIn = function() {
            return ((this.operatorIsMultiply() ||
                this.operatorIsDivide()) &&
                (this.value !== 0 && this.hasValue()));
        };

        Token.prototype.hasOperator = function() {
            return (this.operatorIsMultiply() ||
                this.operatorIsDivide());
        };

        Token.prototype.hasValue = function() {
            return (this.value !== undefined &&
                ('' + this.value).length > 0);
        };

        Token.prototype.operatorIsMultiply = function() {
            return this.operator === ns.DAISY_CHAIN_OPERATOR_MULTIPLY;
        };

        Token.prototype.operatorIsDivide = function() {
            return this.operator === ns.DAISY_CHAIN_OPERATOR_DIVIDE;
        };

        Token.prototype.toggleMultiply = function() {
            if (this.operator === ns.DAISY_CHAIN_OPERATOR_MULTIPLY) {
                this.operator = undefined;
                this.value = '';
            } else {
                this.operator = ns.DAISY_CHAIN_OPERATOR_MULTIPLY;
            }
        };

        Token.prototype.toggleDivide = function() {
            if (this.operator === ns.DAISY_CHAIN_OPERATOR_DIVIDE) {
                this.operator = undefined;
                this.value = '';
            } else {
                this.operator = ns.DAISY_CHAIN_OPERATOR_DIVIDE;
            }
        };


        return Token;
    })();

})(window.mt.daisychain);
(function (ns) {
    'use strict';
    ns.BACKSPACE = '\u2190';
    ns.OK = 'ok';

    ns.TOKEN_WIDTH = 60;
    ns.TOKEN_PAD = 10;
    ns.TOKEN_HEIGHT = 60;
    ns.SHAKE_AMPLITUDE = 30;
    ns.SHAKE_DURATION_MILLISECONDS = 1000;

    ns.TIMES = '\u00D7';
    ns.DIVIDE = '\u00F7';


    ns.DAISY_CHAIN_TOKEN_WIDTH = 48;
    ns.DAISY_CHAIN_TOKEN_PAD = 8;
    ns.DAISY_CHAIN_TOKEN_HEIGHT = 48;

    ns.DAISY_CHAIN_OPERATOR_MULTIPLY = '\u00D7';
    ns.DAISY_CHAIN_OPERATOR_DIVIDE = '\u00F7';

    ns.DAISY_CHAIN_START_SCREEN = 'startScreen';
    ns.DAISY_CHAIN_TASK_SCREEN = 'taskScreen';

})(window.mt.daisychain);

(function (ns) {
    'use strict';

    /* Controllers */

    angular.module('mtDaisyChain').controller('DaisyChainCtrl', function ($scope, toolPersistorService, safeApply) {

        // UI ELEMENTS -----------------------------------------------------------------------------------------

        $scope.init = function(spec) {
            spec = spec || {};
            $scope.currentScreen = ns.DAISY_CHAIN_START_SCREEN;
            $scope.head = '';
            $scope.tail = '';
            $scope.currentTask = undefined;
            $scope.showIntermediates = false;
        };

        $scope.startTask = function(start, end) {
            $scope.head = start;
            $scope.tail = end;
            var head = Number($scope.head);
            var tail = Number($scope.tail);
            if (head !== undefined && tail !== undefined &&
                !isNaN(head) && !isNaN(tail) && head !== 0 && tail !== 0) {
                $scope.currentScreen = ns.DAISY_CHAIN_TASK_SCREEN;
                $scope.currentTask = new ns.Task({
                    head: head,
                    tail: tail
                });
            }
        };

        $scope.canMakeNewChain = function() {
            if ($scope.currentTask) {
                return $scope.currentTask.getLastChain().isComplete();
            }
            return false;
        };

        $scope.makeNewChain = function() {
            $scope.currentTask.newChain();
        };


        $scope.containerApi.addLocalPaletteItem({
            activeClass: 'mt-active-text',
            inactiveClass: 'mt-inactive-text',
            text: 'No Intermediate',
            toggledText: 'Intermediate',
            name: 'Intermediate',
            backgroundClass: 'mt-tool-button',
            idClass: 'mt-intermediates-toggle-btn',
            callbackFn: function() {
                $scope.showIntermediates = !$scope.showIntermediates;
            },
            getToggleStateFn: function() {
                return $scope.showIntermediates;
            }
        });

        /****************
        Keypad
        *****************/

        $scope.isKeypadVisible = function () {
            return $scope.keypad.keypadVisible;
        };

        $scope.keypad = new mt.common.Keypad();

        function setCustomKeys(){
            var keys = [];
            var r;
            for (r = 0; r < 3; r++) {
                keys[r] = [];
                for (var c = 0; c < 3; c++) {
                    var value = '' + ((r * 3) + c + 1);
                    var key = new mt.common.Key(value, $scope.keypad.sendKeyToCurrentInput, value, value);
                    keys[r][c] = key;
                }
            }
            keys[3] = [];

            keys[3][1] = new mt.common.Key('0', $scope.keypad.sendKeyToCurrentInput, '0', '0');
            keys[3][2] = new mt.common.Key('-', $scope.keypad.sendKeyToCurrentInput, '-', '-'); //negative? subtract?
            keys[4] = [];
            keys[4][0] = new mt.common.Key('←', $scope.keypad.backSpaceFromCurrentInput, false, 'bs');
            //keys[4][0] = new mt.common.Key('.', $scope.keypad.sendKeyToCurrentInput, '.', 'decimal');
            keys[4][1] = new mt.common.Key('Clr', $scope.keypad.backSpaceFromCurrentInput, true, 'Clr');
            keys[4][2] = new mt.common.Key('Ok', $scope.confirmKey, undefined, 'ok');
            $scope.keypad.setKeys(keys);
        }
        $scope.confirmKey = function(updateFor) {
            $scope.setKeypadVisible(false);
            $scope.currentTask.getLastChain().deselectAllTokens();
            $scope.currentTask.getLastChain().recalculateIntermediates();
            if (!$scope.currentTask.getLastChain().isComplete()) {
                $scope.currentTask.getLastChain().addNewToken();
            }
        };

        setCustomKeys();

        $scope.selectInput = function(element, target) {
            $scope.keypad.keypadInput = {
                element : element,
                setValue : function (value) {
                    $scope.currentTask.getLastChain().getLastToken().value = value;
                },
                getValue : function () {
                    return $scope.currentTask.getLastChain().getLastToken().value;
                },
                update : function () {}
            };
            var tapOutFn = function() {
                safeApply($scope, function(){});
            };
            $scope.keypad.setKeypadVisible(true, target, tapOutFn);
        };

        //persistence
        $scope.serialize = function () {
            var data = {
                head: $scope.head,
                tail: $scope.tail,
                currentScreen: $scope.currentScreen,
                showIntermediates: $scope.showIntermediates,
                currentTask: ($scope.currentTask) ? $scope.currentTask.serialize() : undefined
            };
            return data;
        };

        $scope.deserialize = function (data) {
            $scope.head = data.head;
            $scope.tail = data.tail;
            $scope.currentScreen = data.currentScreen;
            $scope.showIntermediates = data.showIntermediates;
            $scope.currentTask = undefined;
            if (data.currentTask) {
                $scope.currentTask = new ns.Task();
                $scope.currentTask.deserialize(data.currentTask);
            }
        };

        toolPersistorService.registerTool($scope.toolId, mt.common.TYPE_DAISY_CHAIN, $scope.containerApi, $scope.serialize, $scope.deserialize);
    });
})(window.mt.daisychain);

(function (ns) {
    'use strict';

    /* Directives */

    angular.module('mtDaisyChain').directive('mtDaisyChainTool', function (keypadService, safeApply) {
        return {
            restrict            : 'E',
            templateUrl         : 'templates/daisyChainToolTemplate.html',
            scope               : {
                toolId: '=',
                containerApi: '='
            },
            controller          : 'DaisyChainCtrl',
            link: function (scope, element) {
                scope.init();
                scope.$on('$destroy', function() {
                    scope.running = false;
                    $(element).remove();
                });

                scope.selectToken = function(chain, token) {
                    if (scope.currentTask.getLastChain() !== chain ||
                        scope.currentTask.getLastChain().isComplete()) {
                        return;
                    }
                    scope.currentTask.getLastChain().selectToken(token);
                    scope.setKeypadVisible(true);
                };

                scope.selectOperator = function(chain, token, multiply) {
                    if (scope.currentTask.getLastChain() !== chain ||
                        scope.currentTask.getLastChain().isComplete()) {
                        return;
                    }
                    if (!token.operatorIsMultiply() && !token.operatorIsDivide()) {
                        scope.selectToken(chain, token);
                    }
                    if (multiply) {
                        token.toggleMultiply();
                    } else {
                        token.toggleDivide();
                    }
                };

                scope.setKeypadVisible = function (visible) {
                    console.log('setKeypadVisible', visible);
                    var tapOutFn = function() {
                        safeApply(scope, function(){});
                    };
                    if (visible) {
                        scope.selectInput($(element).find('.mt-hidden-keypad-element')[0]);
                        keypadService.showKeypad(scope.keypad, function () {
                            scope.keypad.keypadInput.element.blur();
                        });
                    } else {
                        scope.keypad.setKeypadVisible(visible, $(element).find('.mt-hidden-keypad-element')[0], tapOutFn);
                    }
                };

                scope.setKeypadVisible(false);
            }
        };
    });

})(window.mt.daisychain);
angular.module('mtDaisyChain').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/daisyChainToolTemplate.html',
    "<div class=mt-daisy-chain-group><input class=mt-hidden-keypad-element type=hidden><div class=mt-task-screen ng-switch on=currentScreen><h3 class=mt-daisy-header ng-switch-when=startScreen>Get from <input class=mt-input-head ng-model=head>to <input class=mt-input-tail ng-model=tail><span hm-tap=\"startTask(head, tail)\" class=\"btn btn-success mt-daisy-start\">start</span></h3><h3 class=mt-daisy-header ng-switch-when=taskScreen>Get from {{head}} to {{tail}}. {{chains.length}}</h3><div class=mt-chain ng-repeat=\"chain in currentTask.chains\"><div class=\"mt-daisy-chain-item mt-head\">{{head}}</div><div ng-repeat=\"token in chain.tokens\" class=mt-token><div class=mt-operators ng-class=\"{'mt-selected': !token.operatorIsDivide() && !token.operatorIsMultiply()}\"><div class=\"mt-daisy-chain-item mt-operator mt-operator-multiply\" hm-tap=\"selectOperator(chain, token, true)\" ng-hide=token.operatorIsDivide()>&#215;</div><div class=\"mt-daisy-chain-item mt-operator mt-operator-divide\" hm-tap=\"selectOperator(chain, token, false)\" ng-hide=token.operatorIsMultiply()>&#247;</div></div><div class=\"mt-daisy-chain-item mt-value\" hm-tap=\"selectToken(chain, token)\" ng-class=\"{'mt-selected':token.selected}\" ng-show=token.hasOperator()>{{token.value}}</div><div class=mt-intermediate ng-show=\"(showIntermediates && token.hasOperator() && token.hasValue()) || ($last && chain.isComplete())\"><div class=\"mt-daisy-chain-item mt-intermediate-arrow\">&rarr;</div><div class=\"mt-daisy-chain-item mt-intermediate-value\" ng-class=\"{'mt-answer':$last && chain.isComplete()}\">{{token.intermediate}}</div></div></div></div><div class=\"mt-daisy-new btn btn-info\" ng-show=canMakeNewChain() hm-tap=makeNewChain()>new chain</div></div></div>"
  );

}]);
