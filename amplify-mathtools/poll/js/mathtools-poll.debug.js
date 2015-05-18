(function () {
    'use strict';

    if (!window.mt) {
        window.mt = {};
    }

    if (!window.mt.poll) {
        window.mt.poll = {};
    }

    angular.module('mtPoll', ['mt.common', 'ui.bootstrap'])

        .config(function (toolRegistryServiceProvider) {
            var template = {
                id: 'pollToolbarItem',
                type: mt.common.TYPE_POLL,
                displayName: 'Poll',
                available: mt.common.TOOL_ACCESS_RESTRICTED,
                htmlTemplate: '<mt-poll-tool tool-id="toolId" container-api="containerApi" id="tool-{{toolId}}"></mt-poll-tool>'
            };
            toolRegistryServiceProvider.addTemplate(template);
        });

    window.mt.loadModules.push('mtPoll');
})();

(function (ns) {
    'use strict';

    ns.Poll = (function () {

        //constructor function

        function Poll(title, questions) {
            if (!(this instanceof Poll)) {
                return new Poll();
            }

            this.title = title || '';
            this.questions = questions || [];
        }

        Poll.prototype.serialize = function () {
            var questions = [];
            _(this.questions).each(function (question) {
                var serializedQuestion = {
                    text: question.text,
                    userSelection: question.userSelection,
                    options: []
                };
                _(question.options).each(function (option) {
                    var serializedOption = {
                        text: option.text,
                        image: option.image
                    };
                    serializedQuestion.options.push(serializedOption);
                });
                questions.push(serializedQuestion);
            });

            return {
                title: this.title,
                questions: questions
            };
        };

        Poll.prototype.deserialize = function (data) {
            this.title = data.title;

            var questions = [];
            _(data.questions).each(function (serializedQuestion) {
                var question = new ns.PollQuestion();
                question.text = serializedQuestion.text;
                question.userSelection = serializedQuestion.userSelection;

                var options = [];
                _(serializedQuestion.options).each(function (serializedOption) {
                    var option = new ns.PollOption();
                    option.text = serializedOption.text;
                    option.image = serializedOption.image;
                    options.push(option);
                });
                question.options = options;

                questions.push(question);
            });

            this.questions = questions;
        };


        return Poll;
    })();
})(window.mt.poll);

(function (ns) {
    'use strict';

    ns.PollEventineer = (function (eventManager) {

        function PollEventineer(eventManager, timeout) {
            if (!(this instanceof PollEventineer)) {
                return new PollEventineer(eventManager);
            }

            function removePoll(toolId) {
                //remove poll
                var removeEvent = new mt.common.Event();
                removeEvent.toolId = toolId;
                eventManager.publish(mt.common.EVENT_REMOVE_TOOL, removeEvent);
            }

            this.exportToNewResultsTables = function (pollModel, toolId) {
                removePoll(toolId);

                //create results tables
                for(var i in pollModel.questions) {
                    var question = pollModel.questions[i];

                    var createEvent = new mt.common.Event();
                    createEvent.type = mt.common.TYPE_RESULTS_TABLE;
                    createEvent.toolId = question.id;

                    eventManager.publish(mt.common.EVENT_CREATE_TOOL, createEvent);
                }
                //apply the quesiton names
                timeout(function() {
                    for(var i in pollModel.questions) {
                        var question = pollModel.questions[i];

                        var toolLoadEvent = new mt.common.Event();
                        toolLoadEvent.toolId = question.id;
                        toolLoadEvent.name = question.text;

                        eventManager.publish(mt.common.TOOL_LOAD_TOPIC, toolLoadEvent);

                        //init data
                        var initData = [];
                        var options = pollModel.questions[i].options;
                        for(var iOpt in options) {
                            initData.push([new mt.common.MtValue(options[iOpt].text)]);
                        }
                        var initEvent = new mt.common.Event(initData);
                        initEvent.targetId = question.id;
                        eventManager.publish(mt.common.EVENT_EXPORT_POLL_TO_TABLE, initEvent);
                    }
                });
            };

            this.exportToNewContingencyTables = function (pollModel, toolId) {
                removePoll(toolId);

                //create results tables
                for(var i in pollModel.contingencyTables) {
                    var createEvent = new mt.common.Event();
                    createEvent.type = mt.common.TYPE_CONTINGENCY_TABLE;
                    createEvent.toolId = pollModel.contingencyTables[i].id;

                    eventManager.publish(mt.common.EVENT_CREATE_TOOL, createEvent);
                }
                //apply the quesiton names
                timeout(function() {
                    for(var i in pollModel.contingencyTables) {
                        var questionA = pollModel.questions[pollModel.contingencyTables[i].indices[0]];
                        var questionB = pollModel.questions[pollModel.contingencyTables[i].indices[1]];

                        var toolLoadEvent = new mt.common.Event();
                        toolLoadEvent.toolId = pollModel.contingencyTables[i].id;
                        toolLoadEvent.name = questionA.text + ' Vs. ' + questionB.text;
                        eventManager.publish(mt.common.TOOL_LOAD_TOPIC, toolLoadEvent);

                        var contingencyInitData = {
                            columnHeaders: [questionA.options[0].text, questionA.options[1].text],
                            rowHeaders: [questionB.options[0].text, questionB.options[1].text],
                        };

                        //init data
                        var initEvent = new mt.common.Event(contingencyInitData);
                        initEvent.targetId = pollModel.contingencyTables[i].id;
                        eventManager.publish(mt.common.EVENT_EXPORT_POLL_TO_TABLE, initEvent);
                    }
                });
            };
        }

        return PollEventineer;
    })();
})(window.mt.poll);

(function (ns) {
    'use strict';

    ns.PollOption = (function () {

        //constructor function

        function PollOption(text, image) {
            if (!(this instanceof PollOption)) {
                return new PollOption();
            }

            this.text = text || '';
            this.image = image || '';
        }
        return PollOption;
    })();
})(window.mt.poll);

(function (ns) {
    'use strict';

    ns.PollQuestion = (function () {

        //constructor function

        function PollQuestion(text, options, id) {
            if (!(this instanceof PollQuestion)) {
                return new PollQuestion();
            }

            this.text = text || '';
            this.id = id || '';
            this.options = options || [];
            this.userSelection = -1;
        }

        return PollQuestion;
    })();
})(window.mt.poll);

(function (ns) {
    'use strict';

    /* Controllers */

    angular.module('mtPoll').controller('PollButtonCtrl', function($scope) {
        // since 'selected' comes through as a string,
        // create a boolean to which to bind ng-class
        $scope.showAsSelected = false;

        $scope.$watch('selected', function(newValue) {
            $scope.showAsSelected = (newValue === 'true') ? true : false;
        });
    });

})(window.mt.poll);

(function (ns) {
    'use strict';

    /* Controllers */

    angular.module('mtPoll').controller('PollToolCtrl', function($scope, eventingService, roleService, broadcastService, $timeout, realtimeService, environmentService, preconfiguredToolService, modalAlertService, toolPersistorService) {
        $scope.poll = {};

        $scope.eventineer = new ns.PollEventineer(eventingService, $timeout);

        $scope.selectedIndex = 0;

        var previewMode = roleService.getRole() !== mt.common.STUDENT_ROLE;

        $scope.loadModel = function(model) {
            var newPoll = new ns.Poll(model.name);
            for (var i = 0; i < model.questions.length; i++) {
                var modelQuestion = model.questions[i];
                newPoll.questions.push(new ns.PollQuestion(modelQuestion.question));
                newPoll.questions[i].id = modelQuestion.id;
                switch (modelQuestion.type) {
                case 'true-false':
                    newPoll.questions[i].options.push(new ns.PollOption('true'));
                    newPoll.questions[i].options.push(new ns.PollOption('false'));
                    break;
                case 'yes-no':
                    newPoll.questions[i].options.push(new ns.PollOption('yes'));
                    newPoll.questions[i].options.push(new ns.PollOption('no'));
                    break;
                case 'multiple-choice':
                    for (var c = 0; c < modelQuestion.choices.length; c++) {
                        newPoll.questions[i].options.push(new ns.PollOption(modelQuestion.choices[c]));
                    }
                    break;
                case 'linkert':
                    newPoll.questions[i].options.push(new ns.PollOption('Strongly Agree'));
                    newPoll.questions[i].options.push(new ns.PollOption('Agree'));
                    newPoll.questions[i].options.push(new ns.PollOption('Neutral'));
                    newPoll.questions[i].options.push(new ns.PollOption('Disagree'));
                    newPoll.questions[i].options.push(new ns.PollOption('Strongly Disagree'));
                    break;
                }
            }
            //copying target question data over for convenience of having everything in one place
            newPoll.contingencyTables = model.contingencyTables;

            $scope.poll = newPoll;

            $scope.isTargetContingency = $scope.model.contingencyTables !== undefined;

            updateNavLabels();
            updateButtonStates();
        };

        //model to base template on (will eventually be generated by )
        // $scope.model = {
        //     name: 'Sample Poll',
        //     questions: [
        //         {
        //             id: mt.common.createGuid(),
        //             question: 'Are you male?',
        //             type: 'yes-no'
        //         },
        //         {
        //             id: mt.common.createGuid(),
        //             question: 'What is your favorite color?',
        //             type: 'multiple-choice',
        //             choices: ['red', 'blue', 'green', 'yellow']
        //         },
        //         {
        //             id: mt.common.createGuid(),
        //             question: 'This is an excellent poll.',
        //             type: 'linkert'
        //         }
        //     ]
        // };

        //sample model for contingency targetting poll
        $scope.model = {
            name: 'Sample Contingency Poll',
            questions: [
                {
                    id: mt.common.createGuid(),
                    question: 'Which video do you prefer?',
                    type: 'multiple-choice',
                    choices: ['Video A', 'Video B']
                },
                {
                    id: mt.common.createGuid(),
                    question: 'Which best describes you?',
                    type: 'multiple-choice',
                    choices: ['Patient', 'Impatient']
                },
                {
                    id: mt.common.createGuid(),
                    question: 'Which best describes you?',
                    type: 'multiple-choice',
                    choices: ['Funny', 'Serious']
                },
                {
                    id: mt.common.createGuid(),
                    question: 'How often do you watch comedy?',
                    type: 'multiple-choice',
                    choices: ['Frequently', 'Infrequently']
                }
            ],
            //optional contingency field idicates that we should send the results to a
            //set of contingency tables rather than a results table
            contingencyTables: [
                {
                    id: mt.common.createGuid(),
                    indices: [0,1]
                },
                {
                    id: mt.common.createGuid(),
                    indices: [0,2]
                },
                {
                    id: mt.common.createGuid(),
                    indices: [0,3]
                }
            ]
        };

        $scope.loadModel($scope.model);

        $scope.isSelected = function(index) {
            return $scope.selectedIndex === index;
        };

        $scope.clickFirstButton = function() {
            if ($scope.selectedIndex > 0) {
                $scope.selectedIndex -= 1;
            }
        };

        $scope.clickSecondButton = function() {
            if (previewMode !== true && $scope.secondButtonDisabled) {
                return;
            }

            if ($scope.selectedIndex === $scope.poll.questions.length - 1) {
                if(previewMode !== true) {
                    $scope.submitPoll();
                }
            }
            else {
                $scope.selectedIndex += 1;
            }
        };

        $scope.selectOption = function(question, index) {
            if(previewMode) {
                return;
            }
            question.userSelection = index;
        };

        $scope.isOptionSelected = function(question, index) {
            return question.userSelection === index;

        };

        function updateNavLabels() {
            $scope.firstActionLabel = 'Back';

            if ($scope.selectedIndex === $scope.poll.questions.length - 1) {
                $scope.secondActionLabel = 'Submit';
            }
            else {
                $scope.secondActionLabel = 'Next';
            }
        }

        function updateButtonStates() {
            $scope.firstButtonDisabled = $scope.selectedIndex === 0;
            if(previewMode) {
                $scope.secondButtonDisabled = $scope.selectedIndex === $scope.poll.questions.length - 1;
            } else {
                $scope.secondButtonDisabled = $scope.poll.questions[$scope.selectedIndex].userSelection < 0;
            }
        }

        $scope.$watch('selectedIndex', function() {
            updateNavLabels();
            updateButtonStates();
        });

        $scope.$watch('poll.questions[selectedIndex].userSelection', function() {
            updateButtonStates();
        });


        updateNavLabels();
        updateButtonStates();

        $scope.serialize = function () {
            return $scope.model;
        };

        $scope.deserialize = function (data) {
            $scope.model = data;
            $scope.loadModel(data);
        };

        $scope.broadcastPoll = function () {
            var target = broadcastService.getTarget();
            //broadcast tool to students
            broadcastService.broadcastTool(toolPackageFn, {target: target});
            //open tables for poll results
            if($scope.isTargetContingency) {
                $scope.eventineer.exportToNewContingencyTables($scope.poll, $scope.toolId);
            } else {
                $scope.eventineer.exportToNewResultsTables($scope.poll, $scope.toolId);
            }

            return target;
        };

        $scope.submitPoll = function () {
            //for each question send a result
            if($scope.isTargetContingency) {
                submitPollToContingencyTables();
            } else {
                submitPollToResultTables();
            }

            //remove poll
            var removeEvent = new mt.common.Event();
            removeEvent.toolId = $scope.toolId;
            eventingService.publish(mt.common.EVENT_REMOVE_TOOL, removeEvent);

            modalAlertService.showModalAlert('Poll sent to teacher.');
        };

        function submitPollToContingencyTables() {
            for(var i in $scope.poll.contingencyTables) {
                var questionA = $scope.poll.questions[$scope.poll.contingencyTables[i].indices[0]];
                var questionB = $scope.poll.questions[$scope.poll.contingencyTables[i].indices[1]];
                var targetId = $scope.poll.contingencyTables[i].id;
                var selectionData = {row: questionB.userSelection, column: questionA.userSelection};

                var dataPacket = new realtimeService.Packet(mt.common.TEACHER_ROLE, targetId, $scope.toolId, selectionData);
                realtimeService.sendTool(dataPacket);
            }
        }

        function submitPollToResultTables() {
            for(var i  in $scope.poll.questions) {
                var selectionIndex = $scope.poll.questions[i].userSelection;
                var selectionText = $scope.poll.questions[i].options[selectionIndex].text;
                var toolData = [[new mt.common.MtValue(selectionText)]];

                var targetId = $scope.poll.questions[i].id;
                var dataPacket = new realtimeService.Packet(mt.common.TEACHER_ROLE, targetId, $scope.toolId, toolData);
                realtimeService.sendTool(dataPacket);
            }
        }

        var toolPackageFn = toolPersistorService.registerTool($scope.toolId, mt.common.TYPE_POLL, $scope.containerApi, $scope.serialize, $scope.deserialize);

        $scope.containerApi.hasControls = false;

        //override generic broadcast
        $scope.containerApi.registerBroadcast($scope.broadcastPoll);
    });

})(window.mt.poll);

(function (ns) {
    'use strict';

    /* Directives */

    angular.module('mtPoll').directive('mtPollTool', function () {
        return {
            restrict            : 'E',
            templateUrl         : 'templates/pollToolTemplate.html',
            scope               : {
                toolId: '=',
                containerApi: '='
            },
            controller          : 'PollToolCtrl',
            link                : function linkFn(scope, element, attr) {
            }
        };
    });

    angular.module('mtPoll').directive('mtPollRadioButton', function () {
        return {
            restrict            : 'E',
            template            :   '<div>' +
                                    '    <svg class="mt-custom-radio" ng-click="clicked()">' +
                                    '        <circle cx="23" cy="23" r="15" stroke="black" stroke-width="0" fill="white"></circle>' +
                                    '        <path class="mt-custom-radio-color" ng-class="showAsSelected ? \'mt-custom-radio-color\' : \'mt-custom-radio-color-inactive\'" stroke="none" d="M 22.81,0.39 C 10.64,0.39 0.77,10.26 0.77,22.43 0.77,34.61 10.64,44.48 22.81,44.48 34.99,44.48 44.86,34.61 44.86,22.43 44.86,10.26 34.99,0.39 22.81,0.39 Z M 20.7,31.8 L 13.66,24.76 16.48,21.94 20.7,26.17 29.15,17.72 31.96,20.53 20.7,31.8 Z M 20.7,31.8" />' +
                                    '    </svg>' +
                                    '</div>',
            scope               : {
                selected: '@selectedanswer',
                clicked: '&'
            },
            controller          : 'PollButtonCtrl'
        };
    });


})(window.mt.poll);

angular.module('mtPoll').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/pollToolTemplate.html',
    "<div><div class=modal-body><div class=\"mt-poll-container tab-content\" ng-repeat=\"question in poll.questions\"><div class=tab-pane ng-class=\"{'active':isSelected($index)}\"><div class=mt-question-text><h3 style=text-align:center>{{question.text}}</h3></div><div class=mt-poll-options><div class=mt-poll-option-span ng-repeat=\"option in question.options\"><img class=mt-icon-position ng-src=\"{{option.image}}\"><p class=\"mt-poll-font mt-poll-question mt-poll-question{{$index}}\">{{option.text}}</p></div></div><br><div class=mt-poll-options><div class=mt-poll-option-span ng-repeat=\"option in question.options\"><div class=mt-radio-button-holder><mt-poll-radio-button selectedanswer=\"{{isOptionSelected(question, $index)}}\" clicked=\"selectOption(question, $index)\"></div></div></div></div></div></div><div class=modal-footer><button class=\"btn mt-poll-first-button\" ng-class=\"{'disabled': firstButtonDisabled}\" ng-click=clickFirstButton()>{{firstActionLabel}}</button> <button class=\"btn btn-primary mt-poll-second-button\" ng-class=\"{'disabled': secondButtonDisabled}\" ng-click=clickSecondButton()>{{secondActionLabel}}</button></div></div>"
  );

}]);
