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
