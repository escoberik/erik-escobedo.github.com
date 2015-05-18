(function () {
    'use strict';

    if (!window.mt) {
        window.mt = {};
    }

    if (!window.mt.ratioTable) {
        window.mt.ratioTable = {};
    }

    angular.module('mtRatioTable', ['mt.common']);

        // .config(function (toolRegistryServiceProvider) {
        //     var ratioTableTemplate = {
        //         id: 'ratioTableToolbarItem',
        //         type: mt.common.TYPE_RATIOTABLE,
        //         displayName: 'Ratio Table',
        //         available: true,
        //         htmlTemplate: '<mt-ratio-table-tool tool-id="toolId" container-api="containerApi" id="tool-{{toolId}}"></mt-ratio-table-tool>',
        //         applet: true
        //     };
        //     toolRegistryServiceProvider.addTemplate(ratioTableTemplate);
        // });

    window.mt.loadModules.push('mtRatioTable');
})();


(function (ns) {
    'use strict';

    angular.module('mtRatioTable').controller(
        'RatioTableCtrl',
        ['$scope', 'RatioData', 'ConfigData', 'eventingService', 'preconfiguredToolService', 'toolPersistorService',
            function ($scope, RatioData, ConfigData, eventingService, preconfiguredToolService, toolPersistorService) {


                // load up data for the table
                $scope.dataModel = {};
                $scope.dataModel.leftCellArray = [];
                $scope.dataModel.rightCellArray = [];
                var ratioData = RatioData.ratioData.getData();

                // data for the input cells
                $scope.leftInputModel = {};
                $scope.rightInputModel = {};

                $scope.viewModel = {
                    inputVisible: '',
                    correctness: [],
                    selected: '',
                    height: '0px',
                    sideInput: {
                        svgWidth: 0,
                        arrowFromY: 0,
                        arrowToY: 0,
                        inputY: 0
                    }
                };


                var selectedCell = null; // data model for selected cell
                var outputCell = null; // data  model for the target cell for calulated data

                // array to hold diagnostic events
                var diagnosticResults = [];
                var diagnosticSequence = 0; // simple sequential counter for diagnostic events

                $scope.cellReadonly = function (index) {
                    if (index === 0) {
                        return true;
                    }
                    return false;
                };

                var TableCell = function (index, value, isLeftCell, selectable, readonly) {
                    this.index = index;
                    this.value = value;
                    this.isLeftCell = isLeftCell;
                    this.selectable = selectable;
                    this.readonly = readonly;
                };
                var InputCell = function (index, value, isLeftCell) {
                    // input box
                    this.index = index;
                    this.value = value;
                    this.isLeftCell = isLeftCell;
                };
                var DiagnosticResultRow = function (leftSideData, rightSideData) {
                    this.leftSideData = leftSideData;
                    this.rightSideData = rightSideData;
                };
                var DiagnosticResult = function (inputOperand, selectedOperand, operator, result, sequence) {
                    this.inputOperand = inputOperand;
                    this.selectedOperand = selectedOperand;
                    this.operator = operator;
                    this.result = result;
                    this.sequence = sequence;
                };

                var qualitativeActions = new mt.common.QualitativeData();

                var addQualitativeAction = function (operations, result, rowIndex, columnIndex, sourceRow) {
                    //since strategy correctness is determined by checking the cells in the row against each other, make the row index the type of the action
                    qualitativeActions.addAction(rowIndex, {'operations': operations, 'result': result, 'rowIndex': rowIndex, 'columnIndex': columnIndex, 'sourceRow': sourceRow});
                };

                $scope.getQualitativeActions = function() {
                    return qualitativeActions;
                };

                // create the initial data structures and layout the widgets - append empty row at end
                (function () {
                    var index;
                    var len = ratioData.length + 1;
                    for (index = 0; index < len; index++) {
                        // left column of data, first row is header, second is problem set
                        var left = new TableCell(
                            index,
                            (index === ratioData.length) ? '' : ratioData[index].lv,
                            true,
                            index !== 0,
                            $scope.cellReadonly(index)
                        );
                        $scope.dataModel.leftCellArray.push(left);
                        // right column of data, first row is header, second is problem set
                        var right = new TableCell(
                            index,
                            (index === ratioData.length) ? '' : ratioData[index].rv,
                            false,
                            index !== 0,
                            $scope.cellReadonly(index)
                        );
                        $scope.dataModel.rightCellArray.push(right);
                    }
                    // layout the data input boxes
                    // left side data for input box
                    $scope.leftInputModel = new InputCell(
                        0,
                        '',
                        true
                    );
                    // right side data for input box
                    $scope.rightInputModel = new InputCell(
                        0,
                        '',
                        false
                    );
                }());

                $scope.highlightSelectedCell = function (cell) {
                    for (var i = 0; i < $scope.dataModel.leftCellArray.length; i++) {
                        $scope.viewModel.correctness = [];

                        var lcell = $scope.dataModel.leftCellArray[i];
                        var rcell = $scope.dataModel.rightCellArray[i];
                        if (lcell) {
                            if (cell.isLeftCell && cell.index === lcell.index) {
                                $scope.viewModel.selected = cell.index;
                            }
                        }
                        if (rcell) {
                            if (!cell.isLeftCell && cell.index === rcell.index) {
                                $scope.viewModel.selected = cell.index;
                            }
                        }
                    }
                };

                var findOutputCell = function (cell) {
                    var i, c;
                    if (cell.isLeftCell) {
                        for (i = 0; i < $scope.dataModel.leftCellArray.length; i++) {
                            c = $scope.dataModel.leftCellArray[i];
                            if (0 !== c.value && !c.value) {
                                outputCell = c;
                                break;
                            }
                        }
                    } else {
                        for (i = 0; i < $scope.dataModel.rightCellArray.length; i++) {
                            c = $scope.dataModel.rightCellArray[i];
                            if (0 !== c.value && !c.value) {
                                outputCell = c;
                                break;
                            }
                        }
                    }
                    return outputCell;
                };

                var drawline = function (x1, y1, x2, y2) {
                    if($scope.viewModel.svg) {
                        $scope.viewModel.svg.append('line')
                            .attr('x1', x1)
                            .attr('y1', y1)
                            .attr('x2', x2)
                            .attr('y2', y2);
                    }
                };
                // respond to user selecting a cell in the ratio table
                $scope.cellSelected = function (cell) {
                    // return if cells aren't selectable or if the cell is already selected
                    var svgRightX;
                    var svgLeftX;
                    if (!cell.selectable || 0 !== cell.value && !cell.value) {
                        clearSideInputs();
                        return;
                    } // || cell === selectedCell

                    // a new selectable cell has been selected
                    selectedCell = cell;
                    $scope.leftInputModel.value = '';
                    $scope.rightInputModel.value = '';
                    // highlight the cell
                    $scope.highlightSelectedCell(cell);
                    // draw the appropriate input and arrows
                    outputCell = findOutputCell(cell);
                    // erase old arrow (which is a collection of svg lines) first
                    d3.selectAll('line').remove();

                    if (cell.isLeftCell) {
                        svgLeftX = 0;
                        svgRightX = $scope.viewModel.sideInput.svgWidth;
                        $scope.viewModel.inputVisible = 'left';
                    } else {
                        svgRightX = 0;
                        svgLeftX = $scope.viewModel.sideInput.svgWidth;
                        $scope.viewModel.inputVisible = 'right';
                    }

                    drawline(svgRightX, $scope.viewModel.sideInput.arrowFromY, svgLeftX, $scope.viewModel.sideInput.inputY);
                    drawline(svgLeftX, $scope.viewModel.sideInput.inputY, svgRightX, $scope.viewModel.sideInput.arrowToY);
                };

                $scope.checkForNewText = function(index, isLeftCell) {
                    var cell;
                    if(isLeftCell) {
                        cell = $scope.dataModel.leftCellArray[index];
                    } else {
                        cell = $scope.dataModel.rightCellArray[index];
                    }
                    if (cell.value !== '' && !cell.readonly) {
                        console.log('New cell entered manually, value is ' + cell.value + ' and is left ' + isLeftCell);
                        addQualitativeAction(undefined, cell.value, index, isLeftCell ? 0 : 1, undefined);
                        cell.readonly = true;

                        if (index === $scope.dataModel.leftCellArray.length - 1) {
                            addNewRow($scope.dataModel.leftCellArray.length);
                        }
                    }

                };

                $scope.rowType = function(index) {
                    if (index === 0) {
                        return 'text';
                    } else {
                        return 'number';
                    }
                };


                    // TODO - need to clean up regex and check bad data + submit event
                var addNewRow = function (index) {
                    var left = new TableCell(
                        index,
                        '',
                        true,
                        index !== 0,
                        $scope.cellReadonly(index)
                    );
                    $scope.dataModel.leftCellArray.push(left);
                    // right column of data, first row is header, second is problem set
                    var right = new TableCell(
                        index,
                        '',
                        false,
                        index !== 0,
                        $scope.cellReadonly(index)
                    );
                    $scope.dataModel.rightCellArray.push(right);
                };
                var parseAndCalculate = function (input, outputCell) {
                    var cdata = selectedCell.value;
                    var daisyChain = new mt.common.DaisyChain(input);

                    if (!daisyChain.isValid(true)) {
                        window.alert('The equation is formatted incorrectly.');
                        return;
                    }

                    // Store this interaction for diagnostic assessment
                    var index = outputCell.index;
                    var isLeft = outputCell.isLeftCell;

                    var x = daisyChain.evaluate(parseFloat(cdata));

                    //TODO: handle multiple operators - only applies to DiagnosticResults
                    var n = daisyChain.operations[0].number;
                    var op = daisyChain.operations[0].operator;

                    addQualitativeAction(daisyChain, x, index, isLeft? 0 : 1, selectedCell.index);
                    diagnosticSequence++;
                    // create the diagnostic data
                    var dresult = new DiagnosticResult(n, cdata, op, x, diagnosticSequence);
                    var drow = diagnosticResults[index];
                    if (!drow) {
                        diagnosticResults[index] = new DiagnosticResultRow(null, null);
                        drow = diagnosticResults[index];
                    }
                    if (isLeft) {
                        drow.leftSideData = dresult;
                    } else {
                        drow.rightSideData = dresult;
                    }
                    console.log(diagnosticResults);
                    return x;
                };
                $scope.calculateTargetValue = function () {
                    var input;
                    if (!selectedCell || !outputCell) {
                        return;
                    }
                    var increment;
                    if (selectedCell.isLeftCell) {
                        input = $scope.leftInputModel.value;
                        // if we were on the last cell in the column we need to make a new row
                        increment = outputCell.index === $scope.dataModel.leftCellArray.length - 1;
                    } else {
                        input = $scope.rightInputModel.value;
                       // if we were on the last cell in the column we need to make a new row
                        increment = outputCell.index === $scope.dataModel.rightCellArray.length - 1;
                    }
                    outputCell.value = parseAndCalculate(input, outputCell);
                    outputCell.readonly = true;
                    if (!outputCell.value) {
                        return;
                    }
                    if (increment) {
                        // add a new row
                        addNewRow(outputCell.index + 1);
                    }
                };

                var clearSideInputs = function() {
                    if($scope.viewModel.svg) {
                        $scope.viewModel.svg.selectAll('line').remove();
                    }
                    $scope.viewModel.inputVisible = '';
                    $scope.viewModel.selected = undefined;
                };

                // Submit the diagnostic data to server - TEMP just run in browser
                $scope.submit = function () {
                    console.log('Submit was called');
                    var tiny = 0.000001;
                    var solutionArray = [];
                    clearSideInputs();

                    for (var i = 2; i < diagnosticResults.length; i++) {
                        var row = diagnosticResults[i];
                        var solutionObj = {};
                        var bstrat = false;
                        var bsoln = false;
                        if (!row) {
                            break;
                        }
                        if (!(row.leftSideData && row.rightSideData)) {
                            break;
                        }
                        var x = row.leftSideData.result;
                        var y = row.rightSideData.result;
                        var index = i;
                        var resultText = '';
                        var ratio = x / y;
                        if (Math.abs(ratio - RatioData.SolutionRatio) < tiny) {
                            bsoln = true;
                            resultText = 'correct solution, ratio = ' + ratio;
                        } else {
                            resultText = 'incorrect solution, ratio = ' + ratio;
                        }
                        solutionObj.resultText = resultText;
                        solutionObj.row = index;
                        var strategyText = '';
                        if (
                            (row.leftSideData.operator === row.rightSideData.operator) &&
                                (row.leftSideData.operator === RatioData.SolutionOperator)
                            ) {
                            bstrat = true;
                            strategyText = 'Correct strategy used: ' + RatioData.SolutionOperator;
                        } else {
                            strategyText = 'Incorrect strategy used: ' + row.leftSideData.operator;
                        }
                        solutionObj.strategyText = strategyText;
                        solutionArray.push(solutionObj);
                        // color the cells
                        if (bsoln && bstrat) {
                            $scope.viewModel.correctness[i] = 'correct';
                        } else if (bsoln || bstrat) {
                            $scope.viewModel.correctness[i] = 'close';
                        } else {
                            $scope.viewModel.correctness[i] = 'wrong';
                        }

                    }
                    console.log(solutionArray);
                };

                $scope.serialize = function () {
                    return {'dataModel': $scope.dataModel, 'rightInputModel': $scope.rightInputModel, 'leftInputModel': $scope.leftInputModel, 'diagnosticResults': diagnosticResults, 'qualitativeActions': qualitativeActions};
                };

                $scope.deserialize = function (data) {
                    $scope.dataModel = data.dataModel;
                    $scope.rightInputModel = data.rightInputModel;
                    $scope.leftInputModel = data.leftInputModel;
                    diagnosticResults = data.diagnosticResults;
                    if (undefined !== data.qualitativeActions) {
                        qualitativeActions.deserialize(data.qualitativeActions);
                    }

                    makeDataNumeric($scope.dataModel.leftCellArray);
                    makeDataNumeric($scope.dataModel.rightCellArray);
                };

                function makeDataNumeric(data) {
                    _.forEach(data, function(cell) {
                        if (cell.index !== 0 && cell.value !== ''){
                            cell.value = parseFloat(cell.value);
                        }
                    });
                }

                toolPersistorService.registerTool($scope.toolId, mt.common.TYPE_RATIOTABLE, $scope.containerApi, $scope.serialize, $scope.deserialize);

                clearSideInputs();
            }
        ]);
})(window.mt.ratioTable);

(function (ns) {
    'use strict';
    angular.module('mtRatioTable').directive(
        'mtRatioTableTool',
        function ($timeout) {
            return {
                scope: {
                    toolId: '=',
                    containerApi: '='
                },
                restrict: 'E',
                controller: 'RatioTableCtrl',
                templateUrl: 'templates/mtRatioTool.html',
                replace: false,
            };
        }
    );
})(window.mt.ratioTable);

(function (ns) {
    'use strict';

    angular.module('mtRatioTable').directive(
        'mtRatioToolColumn',
        function () {
            var parent;

            return {
                restrict: 'E',
                require: '^mtRatioTableTool',
                templateUrl: 'templates/mtRatioToolColumn.html',
                replace: true,
                link: function (scope, element, attrs, rdtctrl) {

                    //cache parent element
                    parent = element.parent();

                    scope.selectCell = function (cell) {
                        var svgSelector = '';
                        if(cell.isLeftCell) {
                            svgSelector = 'mt-left-input-container';
                        } else {
                            svgSelector = 'mt-right-input-container';
                        }
                        svgSelector = '#tool-' + scope.toolId + ' .' + svgSelector + ' svg';

                        //find last elements
                        scope.viewModel.svg = d3.select(svgSelector);
                        var svg = $(svgSelector);
                        var lastInColumn = parent.find(':last-child');

                        var parentOffset = element.offsetParent().offset();
                        var lastInColumnOffset = lastInColumn[0].offsetTop;
                        var offset = element.offset();
                        var cellHeight = element.outerHeight();

                        var arrowFromY = offset.top - parentOffset.top + cellHeight / 2;
                        var arrowToY = lastInColumnOffset + cellHeight / 2;
                        var inputY = (arrowFromY + arrowToY) / 2;

                        scope.viewModel.sideInput = {
                            svgWidth: svg.outerWidth(),
                            arrowFromY: arrowFromY + 'px',
                            arrowToY: arrowToY + 'px',
                            inputY: inputY + 'px'
                        };

                        scope.cellSelected(cell);
                    };
                }
            };
        });
})(window.mt.ratioTable);


(function (ns) {
    'use strict';
    angular.module('mtRatioTable').factory('ConfigData', function () {
        var configData = {};
        configData.hcells = 40;
        configData.htool = 500;
        configData.wcontainers = 280;
        configData.distanceTableToInput = 55;
        configData.widthInput = 110;
        return configData;
    });
})(window.mt.ratioTable);

(function (ns) {
    'use strict';
    angular.module('mtRatioTable').factory('RatioData', function () {
        var problemSet = {};
        problemSet.stimulus = 'The lemonade recipe used by the Sourpuss Juice Company' +
            ' is shown in the table by the ratio of cups of sugar water to whole lemons.';
        problemSet.stem = 'Use the table to determine three other recipes that tastes the' +
            ' same using more cups of sugar water and whole lemons.';
        problemSet.difficulty = 'Easy';
        problemSet.LTName = 'Ratio and Proportion, and Percents';
        problemSet.MatrixID = 'RPP';
        problemSet.StrandName = 'Ratio';
        problemSet.LevelName = 'Ratio Relationships';
        problemSet.Strand = 'A1';
        problemSet.Step = 1;
        problemSet.NumberSteps = 5;
        problemSet.SolutionRatio = 12 / 20;
        problemSet.SolutionOperator = '*';
        problemSet.ratioData = [
            {lv: 'lemons', rv: 'cups'}
        ];
        problemSet.ratioData.getData = function () {
            return problemSet.ratioData;
        };
        return problemSet;
    });
})(window.mt.ratioTable);

angular.module('mtRatioTable').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/mtRatioTool.html',
    "<div class=mt-wrapper-ratio-table><div class=mt-left-input-container ng-show=\"viewModel.inputVisible == 'left'\"><svg xmlns=http://www.w3.org/2000/svg version=1.1 id=wdsleft></svg><div class=mt-rt-side-input ng-style=\"{top: viewModel.sideInput.inputY}\"><input ng-model=leftInputModel.value class=\"mt-input-cell\"> <button ng-click=calculateTargetValue() class=mt-input-button>&#9654;</button></div></div><div class=mt-right-input-container ng-show=\"viewModel.inputVisible == 'right'\"><svg xmlns=http://www.w3.org/2000/svg version=1.1 id=wdsright></svg><div class=mt-rtSide-input ng-style=\"{top: viewModel.sideInput.inputY}\"><button ng-click=calculateTargetValue() class=mt-input-button>&#X25C0;</button> <input ng-model=rightInputModel.value class=\"mt-input-cell\"></div></div><div class=mt-rt-table><div class=mt-rt-column><mt-ratio-tool-column ng-repeat=\"row in dataModel.leftCellArray\"></mt-ratio-tool-column></div><div class=mt-rt-column><mt-ratio-tool-column ng-repeat=\"row in dataModel.rightCellArray\"></mt-ratio-tool-column></div></div></div>"
  );


  $templateCache.put('templates/mtRatioToolColumn.html',
    "<input ng-readonly=row.readonly ng-model=row.value class=mt-rt-cell ng-click=selectCell(row) ng-blur=\"checkForNewText(row.index, row.isLeftCell)\" type={{rowType(row.index)}} ng-class=\"{\n" +
    "            'mt-cell-selected': (viewModel.selected == $index),\n" +
    "            'mt-cell-correct': (viewModel.correctness[$index] == 'correct'),\n" +
    "            'mt-cell-close': (viewModel.correctness[$index] == 'close'),\n" +
    "            'mt-cell-wrong': (viewModel.correctness[$index] == 'wrong')\n" +
    "        }\">"
  );

}]);
