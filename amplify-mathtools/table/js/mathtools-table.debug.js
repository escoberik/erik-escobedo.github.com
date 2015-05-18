(function () {
    'use strict';

    if (!window.mt) {
        window.mt = {};
    }

    if (!window.mt.grid) {
        window.mt.grid = {};
    }

    angular.module('mtFunctionGrid', ['mt.common', 'ui.bootstrap']);

    window.mt.loadModules.push('mtFunctionGrid');

    if (!window.mt.table) {
        window.mt.table = {};
    }

    angular.module('mtTable', ['mt.common'])
        .config(function (toolRegistryServiceProvider) {
            var template = {
                id: 'tableToolbarItem',
                type: mt.common.TYPE_TABLE,
                displayName: 'Table',
                available: true,
                htmlTemplate: '<mt-default-table tool-id="toolId" id="tool-{{toolId}}" container-api="containerApi"></mt-default-table>'
            };
            toolRegistryServiceProvider.addTemplate(template);

            template = {
                id: 'contingencyTableToolbarItem',
                type: mt.common.TYPE_CONTINGENCY_TABLE,
                displayName: 'Contingency Table',
                available: true,
                htmlTemplate: '<mt-contingency-table tool-id="toolId" id="tool-{{toolId}}" container-api="containerApi"></mt-contingency-table>',
                applet: true
            };
            toolRegistryServiceProvider.addTemplate(template);

            template = {
                id: 'ratioBoxToolbarItem',
                type: mt.common.TYPE_RATIO_BOX,
                displayName: 'Ratio Box',
                available: true,
                htmlTemplate: '<mt-ratio-box tool-id="toolId" id="tool-{{toolId}}" container-api="containerApi"></mt-ratio-box>'
            };
            toolRegistryServiceProvider.addTemplate(template);

            template = {
                id: 'resultsTableToolbarItem',
                type: mt.common.TYPE_RESULTS_TABLE,
                displayName: 'Results Table',
                available: mt.common.TOOL_ACCESS_RESTRICTED,
                htmlTemplate: '<mt-results-table tool-id="toolId" id="tool-{{toolId}}" container-api="containerApi"></mt-results-table>'
            };
            toolRegistryServiceProvider.addTemplate(template);
        });

    window.mt.loadModules.push('mtTable');
})();



(function (ns) {
    'use strict';

    ns.Cell = (function () {

        function Cell(val, type) {
            if (!(this instanceof Cell)) {
                return new Cell(val, type);
            }

            if(val === undefined) {
                val = '';
            }

            if (type === undefined) {
                type = ns.CELL_TYPE_DEFAULT;
            }


            // initialize empty observer lists
            var observers = [];

            this.locked = false;
            //transient variable - not persisted
            this.isAggregateNew = false;

            this.value = new mt.common.MtValue(val);

            this.type = type === undefined ? ns.CELL_TYPE_DEFAULT : type;
            this.lastEditor = undefined;

            function notify() {
                _(observers).each(function (callback) {
                    callback();
                });
            }

            this.getValue = function () {
                return this.value.val();
            };
            this.setValue = function (value) {
                if(value instanceof mt.common.MtValue) {
                    this.value = value.copy();
                } else {
                    this.value.setVal(value);
                }
                notify();
            };

            this.setPrecision = function (precision) {
                this.value.setPrecision(precision);
            };

            this.updateValueFromEdit = function () {
                this.value.updateFromEdit();
                notify();
            };

            this.registerObserver = function (callback) {
                observers.push(callback);
            };

            this.deserialize = function (data) {
                this.locked = data.locked;
                this.readonly = data.readonly;
                this.type = data.type;
                this.lastEditor = data.lastEditor;
                this.value = new mt.common.MtValue(data.value.num, data.value.denom,
                        data.value.isFraction, data.value.whole, data.value.postfix);
            };
        }
        return Cell;
    })();
})(window.mt.table);

(function (ns) {
    'use strict';

    ns.Column = (function () {

        //note numRows needs to be the number of rows already initialized on the table
        function Column(numRows, type) {
            if (!(this instanceof Column)) {
                return new Column(numRows, type);
            }

            var aggregateFn,
                self = this;

            this.id = mt.common.createGuid();

            this.width = ns.DEF_COL_WIDTH;

            this.upperHeader = new ns.Cell();
            this.header = new ns.Cell();
            this.cells = [];
            this.type = type;
            this.isXAxis = false;
            this.isYAxis = false;
            this.isHidden = false;

            this.linkColor = undefined;

            //placeholder for child dependent column
            this.dependentColumn = undefined;

            //takes a function that aggregates pairs of parent variables, e.g. arithmetic mean fn
            this.addDependentColumn = function (type) {
                console.log('adding dependent column of type', type);
                //cache the last aggregateFn for
                var aggFn = ns.DERIVED_TYPE_FUNCTIONS[type];
                aggregateFn = angular.isFunction(aggFn) ? aggFn : angular.noop;
                this.dependentColumn = new ns.Column(this.cells.length-1, type);
                this.dependentColumn.header.readonly = true;
                this.updateDependentColumn();
            };

            this.removeDependentColumn = function () {
                this.dependentColumn = undefined;
            };

            this.updateDependentColumn = function() {
                if(this.dependentColumn === undefined) {
                    return;
                }

                var newLength = this.cells.length-1;
                //note this overrides the old object, including id, probably fine
                this.dependentColumn.cells = [];
                for(var iRow = 0; iRow < newLength; iRow++) {
                    this.dependentColumn.addCell();
                    //aggregate pairs of values
                    var aggregateVal = aggregateFn(this.cells[iRow].value.val(), this.cells[iRow+1].value.val());
                    this.dependentColumn.cells[iRow].setValue(aggregateVal);
                }

                //go down hierarchy updating all dependent columns
                this.dependentColumn.updateDependentColumn();
            };

            //WARNING: this function is for internal table use only
            // - it doesn't make sense to add cells to a column only to add rows to a table
            this.addCell = function(index) {
                if(index === undefined) {
                    index = this.cells.length;
                }
                var newCell = new ns.Cell();
                this.cells.splice(index, 0, newCell);

                if (_(ns.READONLY_COLUMN_TYPES).contains(this.type)) {
                    newCell.readonly = true;
                }

                newCell.registerObserver(function () {
                    self.updateDependentColumn();
                });
            };

            this.deserialize = function (data) {
                this.id = data.id;
                this.width = data.width ? data.width : ns.DEF_COL_WIDTH;
                this.type = data.type;
                this.linkColor = data.linkColor;
                this.isXAxis = data.isXAxis;
                this.isYAxis = data.isYAxis;
                if(data.isHidden !== undefined) {
                    this.isHidden = data.isHidden;
                }

                this.upperHeader.deserialize(data.upperHeader);
                this.header.deserialize(data.header);
                this.cells = [];
                for(var iRow in data.cells) {
                    this.addCell();
                    this.cells[iRow].deserialize(data.cells[iRow]);
                }

                if (data.dependentColumn) {
                    this.addDependentColumn(data.dependentColumn.type);
                }
            };

            //init
            for(var i = 0; i < numRows; i++) {
                this.addCell();
            }
        }

        return Column;
    })();
})(window.mt.table);


(function (ns) {
    'use strict';

    ns.RatioBox = (function () {


        var DEFAULTS = {};
        DEFAULTS.northVisible               = true;
        DEFAULTS.southVisible               = true;
        DEFAULTS.eastVisible                = true;
        DEFAULTS.westVisible                = true;
        DEFAULTS.width                      = 400;
        DEFAULTS.height                     = 400;

        //constructor function
        function RatioBox(colA, colB) {
            if (!(this instanceof RatioBox)) {
                return new RatioBox(colA, colB);
            }

            //initialise the columns
            this.columns = [[], []];

            //set default data
            this.columns[0].push(new ns.Cell());
            this.columns[0].push(new ns.Cell());
            this.columns[1].push(new ns.Cell());
            this.columns[1].push(new ns.Cell());

            this.columnHeaders = [];
            this.columnHeaders.push('Column 1');
            this.columnHeaders.push('Column 2');

            this.rowHeaders = [];
            this.rowHeaders.push('Row 1');
            this.rowHeaders.push('Row 2');

            //if data was provided add it
            if(colA !== undefined && colA.length === 2) {
                this.cellAt(0,0).setValue(colA[0]);
                this.cellAt(0,1).setValue(colA[1]);
            }

            if(colB !== undefined && colB.length === 2) {
                this.cellAt(1,0).setValue(colB[0]);
                this.cellAt(1,1).setValue(colB[1]);
            }

            this.setDefaultConfig();
        }

        RatioBox.prototype.cellAt = function(c, r) {
            return this.columns[c][r];
        };

        RatioBox.prototype.setDefaultConfig = function (config) {
            for (var prop in DEFAULTS) {
                if (DEFAULTS.hasOwnProperty(prop)) {
                    this[prop] = DEFAULTS[prop];
                }
            }

            this.setConfig(config);
        };

        RatioBox.prototype.setConfig = function (config) {
            if (config) {
                for (var prop in config) {
                    if (config.hasOwnProperty(prop)) {
                        if (!DEFAULTS[prop] && DEFAULTS[prop] !== '0' && DEFAULTS[prop] !== 0 && DEFAULTS[prop] !== false) {
                            throw new Error('Unknown config options: ' + prop);
                        }
                        if (config[prop] !== undefined) {
                            this[prop] = config[prop];
                        }
                    }
                }
            }
        };

        RatioBox.prototype.reload = function (data)
        {
            for (var iCol = 0; iCol < 2; ++iCol)
            {
                this.columnHeaders[iCol] = data.columnHeaders[iCol];
                //note this is a shortcut since same number of rows and columns
                this.rowHeaders[iCol] = data.rowHeaders[iCol];

                console.log('deserializing col header ', data.columnHeaders, data.rowHeaders);
                for (var iRow = 0; iRow < 2; ++iRow)
                {
                    this.cellAt(iCol, iRow).deserialize(data.columns[iCol][iRow]);
                }
            }
        };

        RatioBox.prototype.isGridCorrect = function () {
            //check the values are all numeric
            for (var iCol = 0; iCol < 2; ++iCol)
            {
                for (var iRow = 0; iRow < 2; ++iRow)
                {
                    if(mt.common.isNumeric(this.cellAt(iCol, iRow).getValue()) === false) {
                        return false;
                    }
                }
            }

            //check row ratio
            if(mt.common.approxEquals(this.getRatio(ns.N), this.getRatio(ns.S)) === false) {
                return false;
            }

            //check column ratio
            if(mt.common.approxEquals(this.getRatio(ns.E), this.getRatio(ns.W)) === false) {
                return false;
            }

            return true;
        };

        RatioBox.prototype.getRatio = function(dir) {
            var ratio;
            if(dir === ns.N) {
                ratio = this.cellAt(1, 0).getValue() / this.cellAt(0, 0).getValue();
            } else if (dir === ns.S) {
                ratio = this.cellAt(1, 1).getValue() / this.cellAt(0, 1).getValue();
            } else if (dir === ns.E) {
                ratio = this.cellAt(1, 1).getValue() / this.cellAt(1, 0).getValue();
            } else if (dir === ns.W) {
                ratio = this.cellAt(0, 1).getValue() / this.cellAt(0, 0).getValue();
            }
            return ratio;
        };

        RatioBox.prototype.isComplete = function() {
            for (var iCol = 0; iCol < 2; ++iCol)
            {
                for (var iRow = 0; iRow < 2; ++iRow)
                {
                    if(this.cellAt(iCol, iRow).value.editText === '') {
                        return false;
                    }
                }
            }
            return true;
        };

        return RatioBox;
    })();
})(window.mt.table);


(function (ns) {
    'use strict';

    ns.RatioBoxEquation = (function ($scope) {

        //constructor function
        function RatioBoxEquation(equationLabel, direction) {
            this.equationLabel = equationLabel;
            this.direction = direction;
            this.update();
            this.editStrokes = [];
            this.mirrored = false;
        }

        function replaceOperator(inputString, oldOperator, newOperator) {
            var divValues = String(inputString).split(oldOperator);

            var outputString = '';

            if(divValues.length > 0) {
                outputString = divValues[0];
            }

            if(divValues.length > 1) {
                for(var i = 1 ; i < divValues.length; i++) {
                    outputString += newOperator;
                    outputString += divValues[i];
                }
            }
            return outputString;
        }

        RatioBoxEquation.prototype.update = function() {
            var texString = replaceOperator(this.equationLabel, '/', ns.DIV_CHAR_HUMAN);
            texString = replaceOperator(texString, '÷', ns.DIV_CHAR);
            texString = replaceOperator(texString, '*', ns.MUL_CHAR);
            texString = replaceOperator(texString, 'x', ns.MUL_CHAR);
            texString = replaceOperator(texString, 'X', ns.MUL_CHAR);
            texString = replaceOperator(texString, '\\times', ns.MUL_CHAR);
            texString = replaceOperator(texString, '_', '');
            texString = replaceOperator(texString, '^', '');
            texString = replaceOperator(texString, '{', '');
            texString = replaceOperator(texString, '}', '');

            this.equationLabel = texString;
        };

        RatioBoxEquation.prototype.isCorrect = function (expectedRatio) {
            //split the equation into dividors and multipliers coefficients
            var dividers = [];
            var multipliers = [];

            var iDiv, iMul;

            var multSplit = this.equationLabel.split(ns.MUL_CHAR);

            if(multSplit.length === 0) {
                return false;
            }

            for(iMul in multSplit) {
                if(multSplit[iMul] === '') {
                    continue;
                }

                //split by dividor
                var divSplit = multSplit[iMul].split(ns.DIV_CHAR);

                //check for and evaluate mixed numbers and fractions
                for (iDiv in divSplit) {
                    var fractionSplit;
                    if (divSplit[iDiv].indexOf(' ') !== -1 && divSplit[iDiv].indexOf(ns.DIV_CHAR_HUMAN) !== -1) {
                        var mixedNumSplit = divSplit[iDiv].split(' ');
                        fractionSplit = mixedNumSplit.splice(1, 1);
                        fractionSplit = fractionSplit[0].split(ns.DIV_CHAR_HUMAN);
                        mixedNumSplit.push(fractionSplit[0] / fractionSplit[1]);
                        mixedNumSplit = parseInt(mixedNumSplit[0]) + mixedNumSplit[1];
                        divSplit.splice(iDiv, 1, mixedNumSplit);
                    } else if (divSplit[iDiv].indexOf(ns.DIV_CHAR_HUMAN) !== -1) {
                        fractionSplit = divSplit[iDiv].split(ns.DIV_CHAR_HUMAN);
                        fractionSplit = fractionSplit[0] / fractionSplit[1];
                        divSplit.splice(iDiv, 1, fractionSplit);
                    }
                }

                //first item must either be a multiplier or the first dividor of a label with no multipliers
                if(divSplit[0] !== '') {
                    if(mt.common.isNumeric(divSplit[0]) === false) {
                        return false;
                    }
                    if(this.equationLabel.indexOf(ns.MUL_CHAR) === -1) {
                        dividers.push(divSplit[0]);
                    } else {
                        multipliers.push(divSplit[0]);
                    }
                }

                //the rest must be dividors
                for(iDiv = 1; iDiv < divSplit.length; iDiv++) {
                    if(divSplit[iDiv] !== '') {
                        if(mt.common.isNumeric(divSplit[iDiv]) === false) {
                            return false;
                        }

                        dividers.push(divSplit[iDiv]);
                    }
                }
            }

            if(multipliers.length === 0 && dividers.length === 0) {
                return false;
            }

            //calc the ratio
            var ratio = 1;
            for(iDiv in dividers) {
                ratio /= dividers[iDiv];
            }
            for(iMul in multipliers) {
                ratio *= multipliers[iMul];
            }

            //do an approx equals on the result
            return mt.common.approxEquals(expectedRatio, ratio);
        };

        RatioBoxEquation.prototype.isEmpty = function() {
            return this.equationLabel === '';
        };

        return RatioBoxEquation;
    })();
})(window.mt.table);

(function (ns) {
    'use strict';

    ns.Row = (function () {

        function Row() {
            if (!(this instanceof Row)) {
                return new Row();
            }

            this.id = mt.common.createGuid();

            this.height = ns.DEF_ROW_HEIGHT;
            this.header = new ns.Cell('');

            this.deserialize = function (data) {
                this.id = data.id;
                this.height = data.height ? data.height : ns.DEF_ROW_HEIGHT;
                this.header.deserialize(data.header);
            };
        }
        return Row;
    })();
})(window.mt.table);


(function (ns) {
    'use strict';

    ns.Table = (function () {

        function Table(numRows, numCols, type) {
            if (!(this instanceof Table)) {
                return new Table(numRows, numCols, type);
            }
            //allow private functions to manipulate table
            var self = this,
                observers = {},
                precision;

            // initialize empty observer lists
            _(ns.NOTIFICATION_TYPES).each(function (type) {
                observers[type] = [];
            });

            this.id = mt.common.createGuid();
            this.version = ns.VERSION;

            this.columns = [];
            this.rows = [];

            this.type = (type === undefined)? mt.common.TYPE_TABLE : type;
            this.headersVisible = true;
            this.upperHeadersVisible = false;
            this.rowHeadersVisible = false;

            function notify(notificationType) {
                _(observers[notificationType]).each(function (callback) {
                    callback();
                });
            }

            function updateDependentColumns() {
                _(self.columns).each(function (column) {
                    column.updateDependentColumn();
                });
            }

            function setPrecisionOnCells(cells) {
                _(cells).each(function (cell) {
                    cell.setPrecision(precision);
                });
            }

            //############################
            // START Core Table API
            // all table modifications should go through this
            //############################

            this.addRow = function (index) {
                //default to adding to end
                if(index === undefined) {
                    index = this.rows.length;
                }
                var newRow = new ns.Row();
                this.rows.splice(index, 0, newRow);

                newRow.header.setValue('');

                //add associated cells
                for(var iCol in this.columns) {
                    this.columns[iCol].addCell(index);
                    this.columns[iCol].cells[index].setPrecision(precision);
                }

                updateDependentColumns();
            };

            this.removeRow = function (index) {
                if (this.rows.length === 1) {
                    return false;
                }

                //default to removing from the end
                if(index === undefined) {
                    index = this.rows.length - 1;
                }
                this.rows.splice(index, 1);

                //remove associated cells
                for(var iCol in this.columns) {
                    this.columns[iCol].cells.splice(index, 1);
                }

                updateDependentColumns();
            };

            this.moveRow = function (startIndex, endIndex) {
                var moveRow = this.rows[startIndex];
                //remove from columns
                this.rows.splice(startIndex, 1);
                //insert at new index
                this.rows.splice(endIndex, 0, moveRow);

                //move associated cells
                var moveCell;
                for(var iCol in this.columns) {
                    moveCell = this.columns[iCol].cells[startIndex];
                    this.columns[iCol].cells.splice(startIndex, 1);
                    this.columns[iCol].cells.splice(endIndex, 0, moveCell);
                }

                updateDependentColumns();
            };

            this.addColumn = function(index) {
                //default to adding to end
                if(index === undefined) {
                    index = this.columns.length;
                }

                var col = new ns.Column(this.rows.length);
                col.header.setValue(ns.DEFAULT_COLUMN_HEADER);
                col.upperHeader.registerObserver(
                    _(notify).partial(ns.NOTIFICATION_UPPER_HEADER_CELL_CHANGED));
                this.columns.splice(index, 0, col);

                setPrecisionOnCells(col.cells);

                notify(ns.NOTIFICATION_COLUMN_ADDED);
            };

            this.removeColumn = function(index) {
                if (this.columns.length === 1) {
                    return false;
                }

                //default to removing from end
                if(index === undefined) {
                    index = this.columns.length - 1;
                }
                this.columns.splice(index, 1);
                this.removeSingleLinks();

                notify(ns.NOTIFICATION_COLUMN_REMOVED);
            };

            this.moveColumn = function(startIndex, endIndex) {
                var moveCol = this.columns[startIndex];
                //remove from columnSets
                this.columns.splice(startIndex, 1);
                //insert at new index
                this.columns.splice(endIndex, 0, moveCol);
            };

            this.setPrecision = function (newPrecision) {
                precision = newPrecision;

                _(this.columns).each(function (column) {
                    setPrecisionOnCells(column.cells);
                });
            };

            //############################
            // END Core Table API
            // all table modifications should go through this
            //############################

            this.registerObserver = function (type, callback) {
                if (observers[type].indexOf(callback) < 0) {
                    observers[type].push(callback);
                }
            };

            this.deserialize = function(data) {
                this.id = data.id;
                this.version = ns.VERSION; // old tables get versioned-up

                // simple version of table versioning, needs work to support more versions
                if (!data.version || data.version !== ns.VERSION) {
                    data = modernize(data);
                }

                initData(data.rows.length, data.columns.length);

                var i;
                for(i in data.columns) {
                    this.columns[i].deserialize(data.columns[i]);
                }
                for(i in data.rows) {
                    this.rows[i].deserialize(data.rows[i]);
                }

                this.type = data.type === undefined ? mt.common.TYPE_TABLE : data.type;
                this.headersVisible = data.headersVisible;
                this.upperHeadersVisible = data.upperHeadersVisible;

                notify(ns.NOTIFICATION_TABLE_DESERIALIZED);
            };

            function modernize(oldData) {
                var data = {
                    headersVisible: oldData.headersVisible,
                    upperHeadersVisible: oldData.upperHeadersVisible,
                    columns: [],
                    rows: []
                };

                _(oldData.columns).each(function (oldColumn) {
                    var header = modernizeCell(oldColumn.header);
                    header.locked = oldColumn.headerIsLocked;

                    var upperHeader = modernizeCell(oldColumn.upperHeader);
                    upperHeader.locked = oldColumn.upperHeaderIsLocked;

                    var cells = [];
                    _(oldColumn.cells).each(function (cell) {
                        cells.push(modernizeCell(cell));
                    });

                    var newColumn = {
                        type: oldColumn.columnType,
                        header: header,
                        upperHeader: upperHeader,
                        cells: cells
                    };

                    data.columns.push(newColumn);
                });

                // old row headers appear to be duplicated in the persisted model, can't rely on them, so base off of first column's cells
                _(data.columns[0].cells).each(function (cell, i) {
                    var rowHeader = oldData.rowHeaders[i];
                    data.rows.push({header: modernizeCell(rowHeader)});
                });

                return data;
            }

            function modernizeCell(cell) {
                return {
                    type: cell.cellType,
                    locked: cell.isLocked,
                    value: {
                        num: cell.num,
                        denom: cell.denom,
                        editStrokes: cell.editStrokes,
                        isFraction: cell.isFraction
                    }
                };
            }

            function initData(numRows, numCols) {
                self.columns = [];
                self.rows = [];
                for(var iCol = 0; iCol < numCols; iCol++) {
                    self.addColumn();
                }
                for(var iRow = 0; iRow < numRows; iRow++) {
                    self.addRow();
                }
            }


            initData(numRows, numCols);

            //############################
            // TABLE helper functions
            // everything here uses core table API calls
            //############################

            //add and remove rows and cols from end to get table to a target size
            this.setSize = function(numRows, numCols) {
                var rowsToAdd = Math.max(0, numRows - this.rows.length);
                var rowsToRemove = Math.max(0, this.rows.length - numRows);
                var colsToAdd = Math.max(0, numCols - this.columns.length);
                var colsToRemove = Math.max(0, this.columns.length - numCols);

                var i;
                for(i = 0; i < rowsToAdd; i++) {
                    this.addRow();
                }
                for(i = 0; i < rowsToRemove; i++) {
                    this.removeRow();
                }
                for(i = 0; i < colsToAdd; i++) {
                    this.addColumn();
                }
                for(i = 0; i < colsToRemove; i++) {
                    this.removeColumn();
                }
            };

            //getters - extract arrays of values
            this.getRowData = function (index) {
                var row = [];
                for(var iCol in this.columns) {
                    row.push(this.columns[iCol].cells[index].value.copy());
                }
                return row;
            };
            this.getColumnData = function (index) {
                var col = [];
                var column = this.columns[index];
                for(var iRow in column.cells) {
                    col.push(column.cells[iRow].value.copy());
                }
                return col;
            };

            // find position of cell (no model updates)
            this.getCellPosition = function (cell) {
                var c, r, column,
                    position = {
                        row: -1,
                        column: -1,
                        isHeader: false,
                        isRowHeader: false
                    };
                for (c = 0; c < this.columns.length; ++c) {
                    column = this.columns[c];
                    if (cell === column.header) {
                        position.isHeader = true;
                        position.column = c;
                        break;
                    }
                    for (r = 0; r < column.cells.length; ++r) {
                        if (cell === column.cells[r]) {
                            position.row = r;
                            position.column = c;
                            break;
                        }
                    }
                }

                // check if row header
                if (position.row === -1 && position.column === -1) {
                    for (r = 0; r < this.rows.length; ++r) {
                        if (cell === this.rows[r].header) {
                            position.isRowHeader = true;
                            position.row = r;
                            break;
                        }
                    }
                }

                return position;
            };

            //setters - set data in the current table bounds
            this.setRowData = function(rowIndex, data, startColIndex) {
                if(startColIndex === undefined) {
                    startColIndex = 0;
                }
                if(rowIndex >= this.rows.length) {
                    return;
                }
                var numRows = Math.min(data.length + startColIndex, this.columns.length) - startColIndex;
                for(var iCol = 0; iCol < numRows; iCol++) {
                    var index = iCol + startColIndex;
                    this.columns[index].cells[rowIndex].setValue(data[iCol]);
                }
            };

            this.setColumnData = function(colIndex, data, startRowIndex) {
                if(startRowIndex === undefined) {
                    startRowIndex = 0;
                }
                if(colIndex >= this.columns.length) {
                    return;
                }
                var column = this.columns[colIndex];
                var numRows = Math.min(data.length + startRowIndex, column.cells.length) - startRowIndex;
                for(var iRow = 0; iRow < numRows; iRow++) {
                    var index = iRow + startRowIndex;
                    column.cells[index].setValue(data[iRow]);
                }
            };

            this.removeSingleLinks = function() {
                var colorCounts = _.countBy(this.columns, function(column) {
                    return column.linkColor;
                });
                for(var i in this.columns) {
                    var color = this.columns[i].linkColor;
                    if(color !== undefined && colorCounts[color] === 1) {
                        this.columns[i].linkColor = undefined;
                    }
                }
            };

            this.removeLinks = function () {
                _(this.columns).each(function (column) {
                    column.linkColor = undefined;
                });
            };

            this.setXAxis = function(index) {
                _.each(this.columns, function(column) {
                    column.isXAxis = false;
                });
                this.columns[index].isXAxis = true;
            };

            this.setYAxis = function(index) {
                _.each(this.columns, function(column) {
                    column.isYAxis = false;
                });
                this.columns[index].isYAxis = true;
            };

            this.exportRowData = function() {
                var rows = [];
                for(var i in this.rows) {
                    rows.push(this.getRowData(i));
                }
                return rows;
            };

            this.importRowData = function(rowData) {
                if(rowData.length === 0) {
                    return;
                }
                var numRows = rowData.length;
                var numCols = 0;
                _.each(rowData, function(row) {
                    numCols = Math.max(row.length, numCols);
                });
                this.setSize(numRows, numCols);
                for(var i in rowData) {
                    this.setRowData(i, rowData[i]);
                }
            };
        }

        return Table;
    })();
})(window.mt.table);


(function (ns) {
    'use strict';

    //class to aggregate t
    ns.TableAggregator = (function () {

        //constructor function
        function TableAggregator() {
            if (!(this instanceof TableAggregator)) {
                return new TableAggregator();
            }
            this.toolIds = [];
        }

        //aggregates row data of format [[MtValue]] into a table
        TableAggregator.prototype.aggregate = function(table, newRowData, toolId, init) {
            var iRow, iCol, data;

            //deserialize rowData
            for(iRow in newRowData) {
                for(iCol in newRowData[iRow]) {
                    data = newRowData[iRow][iCol];
                    newRowData[iRow][iCol] = new mt.common.MtValue(data.num, data.denom,
                        data.isFraction, data.whole, data.postfix);
                }
            }


            //was originally using a map here but gave some inconsistencies
            var rowInstances = [];
            if(init !== true && this.toolIds.indexOf(toolId) === -1) {
                this.toolIds.push(toolId);
            }

            //init row instances of the table
            var numRowsA = 0;
            if(table.columns.length > 0) {
                numRowsA = table.columns[0].cells.length;
            }
            var numRowsB = 0;
            if(newRowData.length > 0) {
                numRowsB = newRowData.length;
            }

            var row, matchedRow;

            if(init !== true) {
                for(iRow = 0; iRow < numRowsA; iRow++) {
                    row = getRow(table, iRow, true);
                    matchedRow = matchRow(rowInstances, row);
                    if(isEmptyRow(row)) {
                        continue;
                    }

                    if(matchedRow === undefined) {
                        rowInstances.push(row);
                    } else {
                        matchedRow.count++;
                    }
                }
            }

            for(iRow = 0; iRow < numRowsB; iRow++) {
                row = {rowData: trimRow(newRowData[iRow]), count: 1};
                matchedRow = matchRow(rowInstances, row);
                if(isEmptyRow(row)) {
                    continue;
                }

                if(matchedRow === undefined) {
                    row.isAggregateNew = true;
                    rowInstances.push(row);
                } else {
                    matchedRow.count++;
                    matchedRow.isAggregateNew = true;
                }

                if(init === true) {
                    row.count = 0;
                    row.isAggregateNew = false;
                }
            }

            return updateTableFromRows(table, rowInstances);
        };

        function matchRow(rows, newRow) {
            for(var iRow in rows) {
                //deep equals on arrays of MtValue objects
                if(angular.equals(rows[iRow].rowData, newRow.rowData)) {

                    return rows[iRow];
                }
            }
            return undefined;
        }

        function isEmptyRow(row) {
            for(var iCol in row.rowData) {
                var cellVal = row.rowData[iCol];
                if(cellVal !== undefined && cellVal.val() !== ''){
                    return false;
                }
            }
            return true;
        }

        //remove empty cells from the end of a row
        function trimRow(rowData) {
            var numCells = rowData.length;
            var emptyCells = 0;
            var iCol, cellVal;

            //iterate backwards through array looking for rightmost empty rows
            for(iCol = numCells-1; iCol > -1; iCol--) {
                cellVal = rowData[iCol];

                if(cellVal !== undefined && cellVal.val() !== '') {
                    break;
                } else {
                    emptyCells++;
                }
            }

            //splice out the empty cells
            rowData.splice(numCells-emptyCells, emptyCells);
            return rowData;
        }

        function getRow(table, iRow, hasCountColumn) {
            var row = {
                rowData: table.getRowData(iRow),
                count: 1
            };

            var numColumns = table.columns.length;
            if(hasCountColumn === true) {
                row.rowData.splice(numColumns-1, 1);
                row.count = parseInt(table.columns[numColumns-1].cells[iRow].getValue(), 10);
            }

            trimRow(row.rowData);

            return row;
        }

        //normalize the length of the row data
        function normalizeRowData(rows) {
            var iRow;
            //get max num Cols
            var maxNumCols = 0;
            for(iRow in rows) {
                maxNumCols = Math.max(rows[iRow].rowData.length, maxNumCols);
            }
            //make all rows the same length
            for(iRow in rows) {
                var numCols = rows[iRow].rowData.length;
                for(var i = 0; i < maxNumCols - numCols; i++) {
                    rows[iRow].rowData.push(new mt.common.MtValue(''));
                }
            }
        }

        function updateTableFromRows(table, rows) {
            var iRow, iCol;

            normalizeRowData(rows);

            //fill out the full row data to put into the table
            var importData = [];
            for(iRow in rows) {
                //add the final count to the rowData
                rows[iRow].rowData.push(new mt.common.MtValue(rows[iRow].count));
                importData.push(rows[iRow].rowData);
            }
            table.importRowData(importData);
            //set the column upper headers
            var numCols = table.columns.length-1;
            for(iCol = 0; iCol < numCols; iCol++) {
                table.columns[iCol].upperHeader.setValue('Answers');
            }

            //apply the newAggregate flags
            var isAggregateNew;
            for(iRow in rows) {
                isAggregateNew = rows[iRow].isAggregateNew === true;
                for(iCol = 0; iCol < numCols + 1; iCol++) {
                    table.columns[iCol].cells[iRow].isAggregateNew = isAggregateNew;
                }
            }

            table.columns[numCols].upperHeader.setValue('Results');
        }

        TableAggregator.prototype.getNumSubmissions = function() {
            return this.toolIds.length;
        };

        return TableAggregator;
    })();
})(window.mt.table);


(function (ns) {
    'use strict';

    ns.TableEventineer = (function (eventManager) {
        function TableEventineer(toolId, eventManager, timeout) {
            if (!(this instanceof TableEventineer)) {
                return new TableEventineer(toolId, eventManager);
            }

            //callback functions - to be registered
            var updateLinkFromGraph = function () {};
            var unlink = function () {};
            var importFromPoll = function () {};

            var link;

            //public interface
            this.registerUpdateLinkFromGraph = function (updateFn) {
                updateLinkFromGraph = updateFn;
            };

            this.registerUnlink = function (unlinkFn) {
                unlink = unlinkFn;
            };

            this.registerImportFromPoll = function (importFn) {
                importFromPoll = importFn;
            };

            this.updateLinks = function(tableModel, forceUpdate) {
                if(link !== undefined) {
                    link.update(tableModel, forceUpdate);
                }
            };

            this.isLinked = function() {
                return link !== undefined;
            };

            this.linkToNewGraph = function (tableModel, linkCol) {
                if(this.isLinked()) {
                    console.log('tool is already linked');
                    return;
                }

                var graphId = mt.common.createGuid();
                createNewGraph(graphId);

                link = {color: linkCol};

                function registerGraphFns (updateFn, unlinkFn) {
                    link.update = updateFn;
                    link.unlink = unlinkFn;
                }
                var linkEvent = new mt.common.Event({});
                linkEvent.targetId = graphId;
                linkEvent.data.updateCallback = updateLinkFromGraph;
                linkEvent.data.unlinkCallback = this.unlink;
                linkEvent.data.registerCallback = registerGraphFns;
                linkEvent.data.linkColor = linkCol;

                var self = this;
                setTimeout(function() {
                    eventManager.publish(mt.common.EVENT_LINK_GRAPH_FROM_TABLE, linkEvent);
                    self.updateLinks(tableModel, true);
                });
            };

            this.unlink = function (noPropagation) {
                if(link === undefined) {
                    return;
                }

                unlink();
                if(noPropagation !== true){
                    link.unlink(true);
                }

                link = undefined;
            };

            this.getLinkStyle = function () {
                var style = {};
                if(link === undefined) {
                    style.display = 'none';
                } else {
                    style['background-color'] = link.color;
                }
                return style;
            };

            function createNewGraph(id) {
                var createEvent = new mt.common.Event();

                createEvent.type = mt.common.TYPE_GRAPH;
                createEvent.toolId = id;
                eventManager.publish(mt.common.EVENT_CREATE_TOOL, createEvent);
            }

            function canHandle(event) {
                var handle = true;
                if (event && event.data) {
                    if(event.targetId && event.targetId !== toolId) {
                        handle = false;
                    } else if (event.data.error) {
                        handle = false;
                    }
                } else {
                    handle = false;
                }
                return handle;
            }

            var self = this;

            //subscribe to link request from graph
            eventManager.subscribe(toolId, mt.common.EVENT_LINK_TABLE_FROM_GRAPH, function(event) {
                if(canHandle(event) === true) {
                    event.data.registerCallback(updateLinkFromGraph, self.unlink);
                    link = {color: event.data.linkColor, update: event.data.updateCallback, unlink: event.data.unlinkCallback};
                }
            });

            eventManager.subscribe(toolId, mt.common.EVENT_EXPORT_POLL_TO_TABLE, function(event) {
                if(canHandle(event) === true) {
                    importFromPoll(event.data);
                }
            });
        }

        return TableEventineer;
    })();
})(window.mt.table);

(function (ns) {
    'use strict';

    ns.VERSION = '0.0.0';

    // the # of rows we want to add to the top and bottom of the rendered grid rows
    ns.ASC = 'asc';
    // constant for sorting direction
    ns.DESC = 'desc';
    ns.TEMPLATE_REGEXP = /<.+>/;
    ns.MAX_ROWS = 20;

    ns.FILL_WARNING_CELLS = 20;

    ns.MAX_COLS = 5;

    ns.LINK_COLORS = ['blue','green','red','yellow','purple','pink'];

    ns.USER_COLORS = ['darkblue','green','maroon','olive','orange','purple'];

    ns.CELL_TYPE_DEFAULT = 'default';
    ns.CELL_TYPE_SUMMATOR = 'summator';
    ns.CELL_TYPE_SUMMATOR_HEADER = 'summatorHeader';

    ns.COLUMN_TYPE_STATIC = 'static';

    ns.ERROR_STRING = 'No Value';
    ns.TOTAL_STRING = 'Total';

    ns.DIV_CHAR = '\xF7';
    ns.MUL_CHAR = '\u00D7';

    ns.DIV_CHAR_HUMAN = '/';
    ns.MUL_CHAR_HUMAN = '*';

    ns.SETTING_ARROWS = 'show arrows';
    ns.SETTING_COLUMN_HEADERS = 'show column headers';
    ns.SETTING_ROW_HEADERS = 'show row headers';
    ns.SETTING_SYNC_EQUATIONS = 'synchronize equations';

    //also hard coded in mtNewTableGridTemplate.html and mt-ratiobox.js
    ns.N = 'N';
    ns.S = 'S';
    ns.E = 'E';
    ns.W = 'W';

    ns.DEF_COL_WIDTH = 72;
    ns.DEF_ROW_HEIGHT = 35;
    ns.DEF_HEADER_ROW_HEIGHT = 40;

    ns.TABLE_BORDER_WIDTH = 1;
    ns.COLUMN_BORDER_WIDTH = 1;

    ns.DEPENDENT_COLUMN = 'dependentColumn';
    ns.SUMMATOR_COLUMN = 'summatorColumn';

    ns.CELL_TYPE_DEFAULT = 'cellTypeDefault';
    ns.CELL_TYPE_HEADER = 'cellTypeHeader';
    ns.CELL_TYPE_UPPER_HEADER = 'cellTypeUpperHeader';
    ns.CELL_TYPE_SUMMATOR = 'cellTypeSummator';

    ns.NOTIFICATION_GENERAL = 'notificationGeneral';
    ns.NOTIFICATION_CELL_CHANGED = 'notificationCellChanged';
    ns.NOTIFICATION_HEADER_CELL_CHANGED = 'notificationHeaderCellChanged';
    ns.NOTIFICATION_UPPER_HEADER_CELL_CHANGED = 'notificationUpperCellChanged';
    ns.NOTIFICATION_SUMMATOR_CELL_CHANGED = 'notificationSummatorCellChanged';
    ns.NOTIFICATION_COLUMN_ADDED = 'notificationColumnAdded';
    ns.NOTIFICATION_COLUMN_REMOVED = 'notificationColumnRemoved';
    ns.NOTIFICATION_ROW_ADDED = 'notificationRowAdded';
    ns.NOTIFICATION_ROW_REMOVED = 'notificationRowRemoved';
    ns.NOTIFICATION_TABLE_DESERIALIZED = 'notificationTableDeserialized';

    ns.NOTIFICATION_TYPES = [
        ns.NOTIFICATION_GENERAL,
        ns.NOTIFICATION_CELL_CHANGED,
        ns.NOTIFICATION_HEADER_CELL_CHANGED,
        ns.NOTIFICATION_UPPER_HEADER_CELL_CHANGED,
        ns.NOTIFICATION_SUMMATOR_CELL_CHANGED,
        ns.NOTIFICATION_COLUMN_ADDED,
        ns.NOTIFICATION_COLUMN_REMOVED,
        ns.NOTIFICATION_ROW_ADDED,
        ns.NOTIFICATION_ROW_REMOVED,
        ns.NOTIFICATION_TABLE_DESERIALIZED
    ];

    ns.DERIVED_TYPE_GEOMETRIC_MEAN = 'derivedTypeGeometricMean';
    ns.DERIVED_TYPE_ARITHMETIC_MEAN = 'derivedTypeArithmeticMean';

    ns.DERIVED_TYPE_FUNCTIONS = {};
    ns.DERIVED_TYPE_FUNCTIONS[ns.DERIVED_TYPE_GEOMETRIC_MEAN] = mt.common.calculateGeometricMean;
    ns.DERIVED_TYPE_FUNCTIONS[ns.DERIVED_TYPE_ARITHMETIC_MEAN] = mt.common.calculateArithmeticMean;

    ns.READONLY_COLUMN_TYPES = [
        ns.DERIVED_TYPE_GEOMETRIC_MEAN,
        ns.DERIVED_TYPE_ARITHMETIC_MEAN
    ];

    ns.TOGGLE_LOCK_EVENT = 'toggleLockEvent';
    ns.CELL_TAPPED_EVENT = 'cellTappedEvent';
    ns.CELL_BLURRED_EVENT = 'cellBlurredEvent';
    ns.CELL_CHANGED_EVENT = 'cellChangedEvent';
    ns.CELL_HELD_EVENT = 'cellHeldEvent';
    ns.SET_PRECISION_EVENT = 'setPrecisionEvent';

    ns.TYPE_ROW = 'row';
    ns.TYPE_COLUMN = 'column';

    ns.MAX_PRECISION = 10;

    ns.DEFAULT_COLUMN_HEADER = 'New Column';

})(window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').controller('CellSelectorCtrl', function ($scope, cellPositionService) {
        //model used for rendering
        $scope.model = {
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            handles: {}
        };

        //dragging the selection
        var curDragBounds;
        $scope.updateDragBounds = function (handle) {
            if(handle === 'nw') {
                curDragBounds = {
                    min: [0, cellPositionService.getHeaderHeight($scope.table)],
                    max: [$scope.model.left + $scope.model.width, $scope.model.top + $scope.model.height]
                };
            } else {
                curDragBounds = {
                    min: [$scope.model.left, $scope.model.top],
                    max: [cellPositionService.getTableWidth($scope.table), cellPositionService.getTableHeight($scope.table)]
                };
            }
        };

        function constrainByBounds(position) {
            var x = Math.max(curDragBounds.min[0], Math.min(curDragBounds.max[0], position[0]));
            var y = Math.max(curDragBounds.min[1], Math.min(curDragBounds.max[1], position[1]));
            return [x, y];
        }

        function dragNW(settings, dx, dy) {
            //constrained position of handle
            var newPos = constrainByBounds([settings.left + dx, settings.top + dy]);

            $scope.model.left = newPos[0];
            $scope.model.top = newPos[1];
            $scope.model.width = settings.width + settings.left - newPos[0];
            $scope.model.height = settings.height + settings.top - newPos[1];
        }

        function dragSE(settings, dx, dy) {
            //constrained position of handle
            var newPos = constrainByBounds([settings.left + settings.width + dx, settings.top + settings.height + dy]);

            $scope.model.width = newPos[0] - settings.left;
            $scope.model.height = newPos[1] - settings.top;
        }

        $scope.handleDragFns = {
            nw: dragNW,
            se: dragSE
        };

        //setting and snapping the selection
        $scope.selectionApi.setSelectorOverColumn = function (index) {
            var bounds = cellPositionService.getColumnBounds($scope.table, index);
            $scope.setSelectorHandlesVisible([]);

            $scope.adjustBoundsForTableBorders(bounds, $scope.table.rows.length-1, index);
            $scope.setModelFromBounds(bounds);
        };

        $scope.selectionApi.setSelectorOverRow = function (index) {
            var bounds = cellPositionService.getRowBounds($scope.table, index);
            $scope.setSelectorHandlesVisible([]);

            $scope.adjustBoundsForTableBorders(bounds, index, $scope.table.columns.length-1);
            $scope.setModelFromBounds(bounds);
        };

        $scope.selectionApi.setSelectorOverCell = function (column, row) {
            var bounds = cellPositionService.getCellBounds($scope.table, row, column);
            $scope.setSelectorHandlesVisible([mt.common.NW, mt.common.SE]);

            $scope.adjustBoundsForTableBorders(bounds, row, column);
            $scope.setModelFromBounds(bounds);
        };


        $scope.snapSelection = function() {
            //top left bounds
            var colIndexTL = cellPositionService.getClosestColumnIndex($scope.table, $scope.model.left);
            var rowIndexTL = cellPositionService.getClosestRowIndex($scope.table, $scope.model.top);
            var colIndexBR = cellPositionService.getClosestColumnIndex($scope.table, $scope.model.left + $scope.model.width);
            var rowIndexBR = cellPositionService.getClosestRowIndex($scope.table, $scope.model.top + $scope.model.height);

            $scope.selectionApi.setSelection({
                type: 'cellGroup',
                position: {colTL: colIndexTL, rowTL: rowIndexTL, colBR: colIndexBR, rowBR: rowIndexBR}
            });

            var bounds = {
                //-1s here account for top and elft table borders
                min: [cellPositionService.getColumnLeftOffset($scope.table, colIndexTL), cellPositionService.getRowTopOffset($scope.table, rowIndexTL)],
                max: [cellPositionService.getColumnLeftOffset($scope.table, colIndexBR), cellPositionService.getRowTopOffset($scope.table, rowIndexBR)]
            };

            $scope.adjustBoundsForTableBorders(bounds, rowIndexBR-1, colIndexBR-1);

            $scope.setModelFromBounds(bounds);
        };

        $scope.setSelectorHandlesVisible = function (visibleHandles) {
            _(mt.common.DIRECTIONS).each(function (handle) {
                $scope.model.handles[handle] = visibleHandles.indexOf(handle) >= 0;
            });
        };

        var borderOffset = 0;
        $scope.setModelFromBounds = function (bounds) {
            //account for top and left table borders
            $scope.selectionApi.show = true;
            $scope.model.left = bounds.min[0] - borderOffset;
            $scope.model.top = bounds.min[1] - borderOffset;
            $scope.model.width = bounds.max[0] - bounds.min[0] + 2*borderOffset;
            $scope.model.height = bounds.max[1] - bounds.min[1] + 2*borderOffset;

            if($scope.model.width <= 2*borderOffset+2 || $scope.model.height <= 2*borderOffset+2) {
                $scope.selectionApi.show = false;
                $scope.setSelectorHandlesVisible([]);
            }
        };

        //account for bottom and right table borders
        $scope.adjustBoundsForTableBorders = function (bounds, rowIndexBR, colIndexBR) {
            bounds.min[0]--;
            bounds.min[1]--;
            //account for bottom and right table borders
            if(cellPositionService.isLastColumn($scope.table, colIndexBR)) {
                bounds.max[0]++;
            }
            if(cellPositionService.isLastRow($scope.table, rowIndexBR)) {
                bounds.max[1]++;
            }
        };
    });
})(window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').controller('ColumnCtrl', function ($scope) {

    });
})(window.mt.table);
(function (ns) {
    'use strict';

    angular.module('mtTable').controller('ContingencyTableCtrl', function ($scope, popupMenuService, eventingService, realtimeService, safeApply, roleService) {

        $scope.type = mt.common.TYPE_CONTINGENCY_TABLE;

        //init model
        $scope.model = new ns.Table(3, 3, $scope.type);

        //contingency table specific controller code
        $scope.model.rowHeadersVisible = true;

        $scope.postInit = function () {
            $scope.selectionApi.isDisabled = true;
        };

        function showHeaderPopupMenu(position, event) {
            var menuItems = [],
                index = position.isHeader ? position.column : position.row,
                isTotalCellHeader = totalsHidden === false && ((position.isHeader && index === $scope.model.columns.length - 1) ||
                                    (position.isRowHeader && index === $scope.model.rows.length - 1)),
                isOnlyHeader = (position.isHeader && $scope.model.columns.length === 2) ||
                                (position.isRowHeader && $scope.model.rows.length === 2);

            if (!isTotalCellHeader && !isOnlyHeader) {
                menuItems.push({
                    text: 'Delete',
                    func: function () {
                        if (position.isHeader) {
                            $scope.model.removeColumn(index);
                        } else {
                            $scope.model.removeRow(index);
                        }
                        calculateTotals();
                    }
                });
            }

            menuItems.push({
                text: 'Add Before',
                func: function () {
                    if (position.isHeader) {
                        $scope.model.addColumn(index);
                    } else {
                        $scope.model.addRow(index);
                    }
                    calculateTotals();
                }
            });

            popupMenuService.openPopup(menuItems, event);
        }

        function initCellCollections(cellCollections, headerPrefix) {
            _(cellCollections).each(function (cellCollection, i) {
                if (i !== cellCollections.length - 1) {
                    cellCollection.header.setValue(headerPrefix + ' ' + (i + 1));
                }
            });
        }

        function initTotalCells() {
            if(totalsHidden === true) {
                return;
            }

            var readonly = roleService.getRole() !== mt.common.STUDENT_ROLE;

            _($scope.model.columns).last().header.setValue('Total');
            _($scope.model.columns).last().header.readonly = true;
            _($scope.model.rows).last().header.setValue('Total');
            _($scope.model.rows).last().header.readonly = true;

            _(_($scope.model.columns).last().cells).each(function (cell) {
                cell.readonly = readonly;
            });

            _($scope.model.columns).each(function (column) {
                _(column.cells).last().readonly = readonly;
            });
        }

        function getSum(values) {
            var i, currentValue, numericValue, sum = 0;

            for (i in values) {
                currentValue = values[i].val();
                numericValue = Number(currentValue);
                if (isNaN(numericValue) || _(String(currentValue)).isEmpty()) {
                    sum = 'No Value';
                    break;
                } else {
                    sum += numericValue;
                }
            }
            return sum;
        }

        function calculateTotals() {
            if(totalsHidden || roleService.getRole() === mt.common.STUDENT_ROLE) {
                return;
            }

            var i, data;

            // skip last column
            for (i = 0; i < $scope.model.columns.length - 1; ++i) {
                // don't include last row
                data = $scope.model.getColumnData(i).slice(0, $scope.model.rows.length - 1);
                _($scope.model.columns[i].cells).last().setValue(getSum(data));
            }

            for (i = 0; i < $scope.model.rows.length; ++i) {
                // don't include last column
                data = $scope.model.getRowData(i).slice(0, $scope.model.columns.length - 1);
                _($scope.model.columns).last().cells[i].setValue(getSum(data));
            }
        }

        initCellCollections($scope.model.columns, 'Column');
        initCellCollections($scope.model.rows, 'Row');
        initTotalCells();
        calculateTotals();

        $scope.model.registerObserver(ns.NOTIFICATION_TABLE_DESERIALIZED, function() {
            //determine whether the totals are visible
            totalsHidden = _($scope.model.columns).last().header.readonly !== true;
            if(roleService.getRole() === mt.common.STUDENT_ROLE) {
                $scope.toggleTotals('Show');
            }

            initTotalCells();
            // NOT calculating totals on deserialize so that we keep submitted student totals
            // calculateTotals();
        });

        $scope.$on(ns.CELL_CHANGED_EVENT, calculateTotals);
        $scope.$on(ns.CELL_HELD_EVENT, function (event, cell, holdEvent) {
            var position = $scope.model.getCellPosition(cell);

            if (position.isHeader || position.isRowHeader) { // column header
                showHeaderPopupMenu(position, holdEvent);
            }
        });


        //poll submissions and import
        $scope.importFromPoll = function(data) {
            $scope.model.rows[0].header.setValue(data.rowHeaders[0]);
            $scope.model.rows[1].header.setValue(data.rowHeaders[1]);
            $scope.model.columns[0].header.setValue(data.columnHeaders[0]);
            $scope.model.columns[1].header.setValue(data.columnHeaders[1]);
            $scope.model.columns[0].cells[0].setValue(0);
            $scope.model.columns[0].cells[1].setValue(0);
            $scope.model.columns[1].cells[0].setValue(0);
            $scope.model.columns[1].cells[1].setValue(0);

            calculateTotals();

            applyCounter();
        };

        function applyCounter() {
            $scope.containerApi.addLocalPaletteItem({
                text: submissions + ' Submissions',
                name: 'submissions',
                activeClass: 'mt-inactive-text',
                inactiveClass: 'mt-inactive-text'
            });
        }

        $scope.eventineer = new ns.TableEventineer($scope.toolId, eventingService);
        $scope.eventineer.registerImportFromPoll($scope.importFromPoll);

        var submissions = 0;
        //receive contingency table results
        $scope.onReceiveResult = function(packet) {
            submissions++;

            var selectionData = packet.data;
            var selectionCell = $scope.model.columns[selectionData.column].cells[selectionData.row];
            selectionCell.setValue(selectionCell.getValue() + 1);

            applyCounter();
            calculateTotals();
            safeApply($scope);
        };

        var totalsHidden = false;
        $scope.toggleTotals = function(option) {
            var hide = option === 'Hide';
            if(hide === totalsHidden) {
                return;
            }
            totalsHidden = hide;

            if(totalsHidden === false) {
                $scope.model.addColumn();
                $scope.model.addRow();
                initTotalCells();
                calculateTotals();
            } else {
                $scope.model.removeColumn();
                $scope.model.removeRow();
            }
        };

        if(roleService.getRole() !== mt.common.STUDENT_ROLE) {
            $scope.containerApi.addLocalPaletteItem({
                options: ['Show', 'Hide'],
                activeClass: 'mt-active-text',
                inactiveClass: 'mt-inactive-text',
                backgroundClass: 'mt-tool-button',
                idClass: 'showResultsOptionBtn',
                callbackFn: $scope.toggleTotals,
                getOptionStateFn: function() {
                    return 'Totals';
                }
            });
        }

        //default for a teacher is hidden totals
        if(roleService.getRole() !== mt.common.STUDENT_ROLE) {
            $scope.toggleTotals('Hide');
        }

        //register this tool to accept and aggregate student table
        $scope.sendToolSubId = realtimeService.onSendTool($scope.onReceiveResult, $scope.toolId);
        $scope.$on('$destroy', function() {
            realtimeService.unregisterCallback($scope.sendToolSubId);
        });

        $scope.showCorrectness = roleService.getRole() === mt.common.STUDENT_ROLE;

        //returns undefined for incomplete
        $scope.isCorrect = function () {
            var userValue, data, i;
            var total = 0;
            //check column totals
            for (i = 0; i < $scope.model.columns.length - 1; ++i) {
                data = $scope.model.getColumnData(i).slice(0, $scope.model.rows.length - 1);
                userValue = _($scope.model.columns[i].cells).last().getValue();
                var columnTotal = getSum(data);
                if(userValue === '') {
                    return;
                } else if (mt.common.approxEquals(userValue, columnTotal) === false) {
                    return false;
                }
                total += columnTotal;
            }

            //check rows
            for (i = 0; i < $scope.model.rows.length; ++i) {
                // don't include last column
                data = $scope.model.getRowData(i).slice(0, $scope.model.columns.length - 1);
                userValue = _($scope.model.columns).last().cells[i].getValue();
                if(userValue === '') {
                    return;
                } else if (mt.common.approxEquals(userValue, getSum(data)) === false) {
                    return false;
                }
            }

            //checkTotal
            userValue = _(_($scope.model.columns).last().cells).last().getValue();

            if(userValue === '') {
                return;
            }

            return mt.common.approxEquals(userValue, total);
        };
    });
})(window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').controller('DefaultTableCtrl', function ($scope, roleService, eventingService, realtimeService, modalAlertService, safeApply, $timeout, $controller) {
        $scope.type = mt.common.TYPE_TABLE;

        //init model
        var numRows = 5;
        var numCols = 2;

        $scope.model = new ns.Table(numRows, numCols, $scope.type);

        for(var iCol = 0; iCol < numCols; iCol++) {
            $scope.model.columns[iCol].header.setValue('Column ' + (iCol + 1));
        }
        //default table specific controller code

        //############################
        // cell locking
        //############################
        if(roleService.getRole() === mt.common.TEACHER_ROLE) {
            $scope.containerApi.registerToggleLockMode(function () {
                $scope.containerApi.locking = !$scope.containerApi.locking;
                //send locking event out to cells
                $scope.$broadcast(ns.TOGGLE_LOCK_EVENT, $scope.containerApi.locking);
            });
        }

        //############################
        // controls
        //############################
        function setControlsOpen(open) {
            $scope.controlsOpen = open;
            $scope.selectionApi.clear();
        }

        $scope.closeControls = _(setControlsOpen).partial(false);

        $scope.containerApi.registerShowControls(_(setControlsOpen).partial(true));

        $scope.eventineer = new ns.TableEventineer($scope.toolId, eventingService, $timeout);
        // ###########################
        // Submit table result
        // ###########################
        $scope.submitActive = false;
        $scope.setSubmissionActive = function (active, data) {
            if (active) {
                $scope.submitId = data.sourceToolId;
            }
            $scope.submitActive = active;
            safeApply($scope);
        };

        //register toggle submission with the realtimeService
        $scope.regResTableSubId = realtimeService.onRegisterResultTable(_.partial($scope.setSubmissionActive, true));
        $scope.regUnResTableSubId = realtimeService.onUnregisterResultTable(_.partial($scope.setSubmissionActive, false));
        $scope.$on('$destroy', function() {
            realtimeService.unregisterCallback($scope.regResTableSubId);
            realtimeService.unregisterCallback($scope.regUnResTableSubId);
        });


        $scope.onResultSubmit = function() {
            var toolData = $scope.model.exportRowData();

            var dataPacket = new realtimeService.Packet(mt.common.TEACHER_ROLE, $scope.submitId, $scope.toolId, toolData);

            realtimeService.sendTool(dataPacket);

            modalAlertService.showModalAlert('Table sent to teacher');
        };

        
        $scope.postInit = function() {
            $scope.ribbon = $controller('TableRibbonCtrl', {
                $scope: $scope
            });
            $scope.ribbon.register();
        };
    });
})(window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtFunctionGrid').controller('FractionCellCtrl', function ($scope, tableUserService) {
        $scope.editMode = false;
        $scope.keypadEnabled = false;

        $scope.setKeypadEnabled = function () {
            $scope.keypadEnabled = ($scope.useKeypad !== undefined && $scope.useKeypad) && mt.common.EDIT_MODE === mt.common.EDIT_MODE_CUSTOM;
        };

        $scope.setKeypadEnabled();

        $scope.toggleMode = function (editMode) {
            if(mt.common.EDIT_MODE !== mt.common.EDIT_MODE_HWR) {
                if(editMode === undefined) {
                    $scope.editMode = !$scope.editMode;
                } else {
                    $scope.editMode = editMode;
                }
            }
            if ($scope.toggleChanged !== undefined) {
                $scope.toggleChanged();
            }
        };

        $scope.onChange = function() {
            var newVal = $scope.getCell().value.editText + '';
            if(newVal !== $scope.prevVal) {
                $scope.getCell().lastEditor = tableUserService.getUserId();
                $scope.getCell().value.updateFromEdit();
                $scope.updateCallback($scope.column, $scope.row, $scope.getCell().value.editText);
            }
            $scope.prevVal = newVal;
        };

        $scope.update = function() {
            if(mt.common.EDIT_MODE === mt.common.EDIT_MODE_HWR) {
                if($scope.updated !== undefined) {
                    $scope.updated();
                }
                return;
            }
            var cell = $scope.getCell();
            cell.value.updateFromEdit();
            if(cell.value.isFraction) {
                $scope.toggleMode(false);
            }
            if($scope.updated !== undefined) {
                $scope.updated();
            }
        };

        $scope.getCell = function () {
            return $scope.gridConfig.cellAt($scope.column, $scope.row);
        };

        $scope.toggleCellLock = function () {
            $scope.getCell().setLocked(!$scope.getCell().isLocked());
        };
    });

})(window.mt.grid);

(function (ns) {
    'use strict';

    var directions = [ns.N, ns.S, ns.E, ns.W];
    var oppositeDirections = {};
    oppositeDirections[ns.N] =  ns.S;
    oppositeDirections[ns.S] = ns.N;
    oppositeDirections[ns.E] = ns.W;
    oppositeDirections[ns.W] = ns.E;

    angular.module('mtTable').controller('RatioBoxController', function ($scope, $timeout, eventingService, safeApply, broadcastService, tableUserService, handwritingService, preconfiguredToolService, roleService, keypadService, toolPersistorService, dataExchangeService, $controller) {

        //init
        $scope.ratioBox = new ns.RatioBox();

        $scope.equations = {};
        _.each(directions, function(dir) {
            $scope.equations[dir] = new ns.RatioBoxEquation('', dir);
        });

        $scope.settings = {
            showArrows: true,
            showRowHeaders: false,
            showColumnHeaders: true,
            syncEquations: true
        };

        /****************
        Keypad
        *****************/
        $scope.openKeypadForEquation = function (inputElement, direction) {
            $scope.keypad.keypadInput = {
                setValue : function (value) {
                    $scope.equations[direction].equationLabel = value;
                },
                getValue : function () {
                    console.log($scope.equations[direction]);
                    return $scope.equations[direction].equationLabel;
                },
                update : function () {
                    $scope.equations[direction].update();
                },
                element : inputElement
            };

            var tapOutFn = function() {
                safeApply($scope, function(){});
            };
            $scope.setKeypadVisible(true, tapOutFn);
            setCustomKeypad(inputElement);
        };

        $scope.openKeypadForCell = function (inputElement, cell) {
            $scope.keypad.keypadInput = {
                element : inputElement,
                setValue : function (value) {
                    this.element.value = value;
                },
                getValue : function () {
                    return this.element.value;
                },
                update : function () {
                    cell.value.updateFromEdit(this.getValue());
                }
            };

            var tapOutFn = function() {
                $scope.keypad.keypadInput.element.blur();
                safeApply($scope, function(){});
            };
            $scope.setKeypadVisible(true, tapOutFn);
            setCustomKeypad(inputElement);
        };

        $scope.setKeypadVisible = function (visible, tapOutFn) {
            if (visible && tapOutFn === undefined) {
                tapOutFn = function() {
                    safeApply($scope, function(){});
                };
            }

            $scope.keypad.setKeypadVisible(visible, document.activeElement, tapOutFn);
            if (visible) {
                keypadService.showKeypad($scope.keypad, function () {
                    $scope.keypad.keypadInput.element.blur();
                });

                if ($scope.selectedEquationInput) {
                    $scope.selectedEquationInput.blur();
                }
            }
        };

        $scope.isKeypadVisible = function (visible) {
            if (!$scope.keypad.keypadVisible && $scope.selectedEquationInput) {
                $scope.selectedEquationInput.blur();
            }
            return $scope.keypad.keypadVisible;
        };

        $scope.keypad = new mt.common.Keypad();

        function setCustomKeypad(inputElement){
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

            console.log(inputElement);

            keys[3] = [];
            keys[3][0] = new mt.common.Key('←', $scope.keypad.backSpaceFromCurrentInput, false, 'bs');
            keys[3][1] = new mt.common.Key('0', $scope.keypad.sendKeyToCurrentInput, '0', '0');
            keys[3][2] = new mt.common.Key('a/b', $scope.keypad.sendKeyToCurrentInput, '/', 'fraction');

            keys[4] = [];
            keys[4][0] = new mt.common.Key('Clr', $scope.keypad.backSpaceFromCurrentInput, true, 'Clr');
            keys[4][1] = new mt.common.Key('\u2423', $scope.keypad.sendKeyToCurrentInput, ' ', 'space'); //will eventually be an extension of the Clr button
            keys[4][2] = new mt.common.Key('.', $scope.keypad.sendKeyToCurrentInput, '.', 'decimal');

            if($(inputElement).hasClass('mt-ratio-box-eqn-input')) {

                keys[0][3] = new mt.common.Key('÷', $scope.keypad.sendKeyToCurrentInput, ns.DIV_CHAR, 'divide');
                keys[1][3] = new mt.common.Key('×', $scope.keypad.sendKeyToCurrentInput, '*', 'multiply');
                keys[2][3] = '';

                keys[3][3] = '';

                keys[4][3] = new mt.common.Key('Ok', $scope.confirmKey, undefined, 'ok');

                $scope.keypad.setKeys(keys);

            } else if($(inputElement).hasClass('mt-fraction-cell-input')) {

                keys[5] = [];
                keys[5][2] = new mt.common.Key('Ok', $scope.confirmKey, undefined, 'ok');

                $scope.keypad.setKeys(keys);
            }
        }

        $scope.confirmKey = function() {
            $scope.setKeypadVisible(false);
        };

        $scope.keypad.setKeypadVisible(false);

        /****************
        /Keypad
        *****************/

        //HANDWRITING

        function handwritingUpdateCallback(latex, strokes) {
            if ($scope.selectedEquation) {
                $scope.selectedEquation.update();
                $scope.selectedEquation.equationLabel = latex;
                $scope.selectedEquation.editStrokes = strokes;
            } else if($scope.selectedCell) {
                $scope.selectedCell.value.updateFromLatex(latex);
                $scope.selectedCell.editStrokes = strokes;
                $scope.selectedCell.lastEditor = tableUserService.getUserId();
            }
            safeApply($scope, function() {});
        }

        $scope.selectEquation = function(element, direction) {
            if (mt.common.EDIT_MODE === mt.common.EDIT_MODE_SYSTEM) {
                return;
            }
            $scope.selectedEquation = $scope.equations[direction];
            handwritingService.openPanelForElement(element, $scope.selectedEquation.editStrokes, mt.common.HW_MODE_EQN, handwritingUpdateCallback);
            $scope.selectedCell = undefined;
            if (mt.common.EDIT_MODE === mt.common.EDIT_MODE_CUSTOM) {
                $scope.openKeypadForEquation(element, direction);
            }
        };

        $scope.selectCell = function(element, cell, mode, useDefault) {
            if (mt.common.EDIT_MODE === mt.common.EDIT_MODE_SYSTEM) {
                return;
            }

            if (useDefault === undefined) {
                useDefault = false;
            }
            $scope.selectedCell = cell;
            $scope.selectedEquation = undefined;
            handwritingService.openPanelForElement(element, $scope.selectedCell.editStrokes, mode, handwritingUpdateCallback);
            if (!useDefault && mt.common.EDIT_MODE === mt.common.EDIT_MODE_CUSTOM) {
                $(document.activeElement).blur(); //need this for keypad so it will pop up
                $scope.openKeypadForCell(element, cell);
            }
        };

        //correctness checking
        $scope.isComplete = function () {
            if($scope.ratioBox.isComplete() === false) {
                return false;
            }

            if($scope.settings.showArrows === true) {
                for(var iEqn in $scope.equations) {
                    if($scope.equations[iEqn].isEmpty() === true) {
                        return false;
                    }
                }
            }
            return true;
        };

        $scope.isCorrect = function () {
            if($scope.isComplete() === false) {
                return undefined;
            }

            if($scope.ratioBox.isGridCorrect() === false) {
                return false;
            }

            if($scope.settings.showArrows === true) {
                for(var iEqn in $scope.equations) {
                    var eqn = $scope.equations[iEqn];
                    var dir = eqn.direction;
                    var ratio = $scope.ratioBox.getRatio(dir);

                    //adjust for arrow direction - south and west are mirrored by default
                    var defaultMirrored = false;
                    if(dir === ns.E || dir === ns.W) {
                        defaultMirrored = true;
                    }
                    if($scope.equations[dir].mirrored !== defaultMirrored) {
                        ratio = 1/ratio;
                    }

                    if(eqn.isCorrect(ratio) === false) {
                        return false;
                    }
                }
            }
            return true;
        };

        $scope.serialize = function ()
        {
            var json = {
                'config': $scope.ratioBox,
                'settings': $scope.settings
            };
            //equations
            _.each(directions, function(dir) {
                json[dir] = {text: $scope.equations[dir].equationLabel, strokes: $scope.equations[dir].editStrokes, mirrored: $scope.equations[dir].mirrored};
            });
            return json;
        };

        //callback function called from an update of mt-fraction-cell
        $scope.onCellUpdate = function(col, row, editText) {
        };

        $scope.load = function (data)
        {
            $scope.ratioBox.reload(data.config);
            $scope.settings = data.settings;

            _.each(directions, function(dir) {
                $scope.equations[dir].equationLabel = data[dir].text;
                $scope.equations[dir].editStrokes = data[dir].strokes;
                $scope.equations[dir].mirrored = data[dir].mirrored;
            });
        };

        toolPersistorService.registerTool($scope.toolId, mt.common.TYPE_RATIO_BOX, $scope.containerApi, $scope.serialize, $scope.load);

        $scope.importFn = function(data) {
            var iRow, iCol;
            var numRows = Math.min(2, data.rows.length);
            var numCols = 0;
            if(numRows !== 0) {
                numCols = Math.min(2, data.rows[0].values.length);
            }
            for(iCol = 0; iCol < numCols; iCol++) {
                var col = $scope.ratioBox.columns[iCol];
                $scope.ratioBox.columnHeaders[iCol] = data.headers[iCol];
                for(iRow = 0; iRow < numRows; iRow++) {
                    col[iRow].setValue(data.rows[iRow].values[iCol]);
                }
            }
            for(iRow = 0; iRow < numRows; iRow++) {
                if(data.rows[iRow].label !== undefined && data.rows[iRow].label !== '') {
                    $scope.settings.showRowHeaders = true;
                    $scope.ratioBox.rowHeaders[iRow] = data.rows[iRow].label;
                }
            }
        };

        $scope.exportFn = function() {
            var colA = $scope.ratioBox.columns[0];
            var colB = $scope.ratioBox.columns[1];

            var data = {
                headers: [$scope.ratioBox.columnHeaders[0], $scope.ratioBox.columnHeaders[1]],
                rows: [
                    {values: [colA[0].getValue(), colB[0].getValue()]},
                    {values: [colA[1].getValue(), colB[1].getValue()]}
                ]
            };
            if($scope.settings.showRowHeaders === true) {
                data.rows[0].label = $scope.ratioBox.rowHeaders[0];
                data.rows[1].label = $scope.ratioBox.rowHeaders[1];
            }
            return data;
        };

        dataExchangeService.registerTool($scope.toolId, mt.common.TYPE_RATIO_BOX, $scope.exportFn, $scope.importFn, $scope.containerApi, [mt.common.TYPE_TABLE]);

        $scope.getEditMode = function () {
            return mt.common.EDIT_MODE;
        };
        var setReadOnly = function () {
            $scope.readOnlyTextInputs = mt.common.EDIT_MODE === mt.common.EDIT_MODE_HWR;
            $scope.readOnlyNumberInputs = mt.common.EDIT_MODE !== mt.common.EDIT_MODE_SYSTEM;
        };
        $scope.$watch('getEditMode()', function() {
            setReadOnly();
        });

        setReadOnly();

        $scope.syncEquation = function(from, to) {
            if ($scope.settings.syncEquations === true &&
                $scope.equations.hasOwnProperty(from) &&
                $scope.equations.hasOwnProperty(to)) {
                $scope.equations[to].equationLabel = $scope.equations[from].equationLabel;
                $scope.equations[to].mirrored = $scope.equations[from].mirrored;
                $scope.equations[to].update();
            }
        };
        _.forEach(oppositeDirections, function(value, key) {
            $scope.$watch('equations[\'' + value + '\'].equationLabel', function() {
                safeApply($scope, function() {
                    $scope.syncEquation(value, key);
                });
            });
            $scope.$watch('equations[\'' + value + '\'].mirrored', function() {
                safeApply($scope, function() {
                    $scope.syncEquation(value, key);
                });
            });
        });

        $scope.ribbon = $controller('RatioBoxRibbonCtrl', {
            $scope: $scope
        });
        $scope.ribbon.register();
    });
})(window.mt.table);

(function (ns) {
    'use strict';
    angular.module('mtTable').controller('RatioBoxRibbonCtrl', function ($scope, toolMenuService) {
        var leftItems = [];

        var rightItems = [
            toolMenuService.newItem.toggle('Arrows', function () {
                $scope.settings.showArrows = !$scope.settings.showArrows;
            }, {cssClass: 'mt-ribbon-image-rb-arrows'}, function () {
                return $scope.settings.showArrows;
            }),
            toolMenuService.newItem.toggle('Column Headers', function () {
                $scope.settings.showColumnHeaders = !$scope.settings.showColumnHeaders;
            }, {cssClass: 'mt-ribbon-image-rb-cols'}, function () {
                return $scope.settings.showColumnHeaders;
            }),
            toolMenuService.newItem.toggle('Row Headers', function () {
                $scope.settings.showRowHeaders = !$scope.settings.showRowHeaders;
            }, {cssClass: 'mt-ribbon-image-rb-rows'}, function () {
                return $scope.settings.showRowHeaders;
            }),
            toolMenuService.newItem.toggle('Sync', function () {
                $scope.settings.syncEquations = !$scope.settings.syncEquations;
            }, {cssClass: 'mt-ribbon-image-rb-sync'}, function () {
                return $scope.settings.syncEquations;
            })
        ];

        var ribbon = {items: {
            right: rightItems,
            left: leftItems
        }};

        this.register = function() {
            toolMenuService.setToolMenu($scope.toolId, ribbon, {containerApi: $scope.containerApi});
        };
    });
})(window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').controller('ResultsTableCtrl', function ($scope, safeApply, realtimeService, eventingService) {
        $scope.type = mt.common.TYPE_RESULTS_TABLE;

        //init model
        $scope.model = new ns.Table(1, 2, $scope.type);

        $scope.disableSelectionApi = true;

        $scope.postInit = function() {
            $scope.model.columns[0].upperHeader.setValue('Answers');
            $scope.model.columns[1].upperHeader.setValue('Results');
            $scope.model.headersVisible = false;
            $scope.model.upperHeadersVisible = true;

            $scope.buildUpperHeaderDefinitions();

            $scope.setPrecision(ns.MAX_PRECISION);
        };

        $scope.resultsAggregator = new ns.TableAggregator();

        //results table specific controller code

        //callback for receiving a table event
        $scope.onReceiveResult = function(packet) {
            var resultData = packet.data;

            $scope.resultsAggregator.aggregate($scope.model, resultData, packet.sourceToolId);
            $scope.containerApi.addLocalPaletteItem({
                text: $scope.resultsAggregator.getNumSubmissions() + ' Submissions',
                name: 'submissions',
                activeClass: 'mt-inactive-text',
                inactiveClass: 'mt-inactive-text'
            });

            $scope.setPrecision(ns.MAX_PRECISION);
            $scope.buildUpperHeaderDefinitions();

            safeApply($scope);
        };

        $scope.onReceiveResultsInit = function(data) {
            $scope.resultsAggregator.aggregate($scope.model, data, undefined, true);

            safeApply($scope);
        };

        $scope.eventineer = new ns.TableEventineer($scope.toolId, eventingService);
        $scope.eventineer.registerImportFromPoll($scope.onReceiveResultsInit);

        //register this tool to accept and aggregate student table
        $scope.sendToolSubId = realtimeService.onSendTool($scope.onReceiveResult, $scope.toolId);
        $scope.$on('$destroy', function() {
            realtimeService.unregisterCallback($scope.sendToolSubId);
        });

        //notify student table that they can submit
        var dataPacket = new realtimeService.Packet(mt.common.STUDENT_ROLE, undefined, $scope.toolId);
        realtimeService.registerResultTable(dataPacket);

        $scope.toggleResults = function(mode) {
            var hide = mode === 'Hide';
            //apply hide state to the last column
            $scope.model.columns[$scope.model.columns.length-1].isHidden = hide;
            $scope.buildUpperHeaderDefinitions();
        };

        $scope.containerApi.addLocalPaletteItem({
            options: ['Show', 'Hide'],
            activeClass: 'mt-active-text',
            inactiveClass: 'mt-inactive-text',
            backgroundClass: 'mt-tool-button',
            idClass: 'mt-show-results-option-btn',
            callbackFn: $scope.toggleResults,
            getOptionStateFn: function() {
                return 'Results';
            }
        });

        $scope.containerApi.addLocalPaletteItem({
            text: '0 Submissions',
            name: 'submissions',
            activeClass: 'mt-inactive-text',
            inactiveClass: 'mt-inactive-text'
        });

        //register close listener
        $scope.closeResultsTable = function () {
            var dataPacket = new realtimeService.Packet(mt.common.STUDENT_ROLE, undefined, $scope.toolId);
            realtimeService.unregisterResultTable(dataPacket);
        };
        $scope.containerApi.registerClose($scope.closeResultsTable);
    });
})(window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').controller('SelectorBarCtrl', function ($scope) {

        $scope.isSelected = function () {
            var curSelection = $scope.selectionApi.getSelection();
            return curSelection !== undefined &&
                curSelection.type === $scope.lccType;
        };

        $scope.getNumParts = function () {
            var parts;
            if($scope.row) {
                parts = $scope.table.rows.length;
                if($scope.table.headersVisible) {
                    parts++;
                }
                if($scope.table.upperHeadersVisible) {
                    parts++;
                }
            } else {
                parts = _.filter($scope.table.columns, function(column) {return !column.isHidden;}).length;
                if($scope.table.rowHeadersVisible) {
                    parts++;
                }
            }
            return parts;
        };

        function correctIndex(index) {
            if($scope.row) {
                index = index - ($scope.table.upperHeadersVisible ? 1 : 0) - ($scope.table.headersVisible ? 1 : 0);
            } else {
                index = index - ($scope.table.rowHeadersVisible ? 1 : 0);
            }
            return index;
        }
        var lastIndex;
        $scope.clickSelectorBar = function(index) {
            if(index === undefined) {
                index = lastIndex;
            } else {
                index = correctIndex(index);
            }
            lastIndex = index;

            if (index < 0) { // header or upper header
                return;
            }

            if(index === undefined) {
                index = $scope.selectionApi.getSelection.position;
            } else {
                $scope.selectionApi.clear();
                $scope.selectionApi.setSelection({type: $scope.lccType, position: index});
            }

            if($scope.row) {
                $scope.selectionApi.setSelectorOverRow(index);
            } else {
                $scope.selectionApi.setSelectorOverColumn(index);
            }
        };

        $scope.clickSelectorHandle = function() {
            if($scope.row) {
                $scope.table.addRow();
            } else {
                $scope.table.addColumn();
            }
        };

        //column width resize
        var startDragOffset;
        var startWidth;
        $scope.resizeDrag = function(event) {
            if($scope.row) {
                return false;
            }

            var offset = event.gesture.center.pageX;
            var index = $scope.selectionApi.getSelection().position;
            correctIndex(index);

            var selectedColumn = $scope.table.columns[index];

            if(startDragOffset === undefined) {
                //don't show the cell selection
                $scope.selectionApi.show = false;

                startDragOffset = offset;
                startWidth = selectedColumn.width;
            } else {
                selectedColumn.width = startWidth + offset - startDragOffset;
            }

            $scope.updateFn();
            return false;
        };

        $scope.resizeDragEnd = function() {
            if($scope.row) {
                return false;
            }
            startDragOffset = undefined;
            startWidth = undefined;
            return false;
        };

    });
})(window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').controller('TableControlsCtrl', function ($scope, fillService) {

        var completeFill;

        $scope.controls = {};

        $scope.controls.close = function () {
            $scope.closeControls();
            reset();
        };

        function reset() {
            $scope.controls.precisionPlace = {};
            $scope.controls.newRowIndex = {};
            $scope.controls.newColIndex = {};
            $scope.controls.arithmeticMeanIndex = {};
            $scope.controls.geometricMeanIndex = {};

            $scope.controls.fillSettings = {
                fillStartCellRow: {},
                fillStartCellColumn: {},
                fillStartValue: {},
                fillInterval: {},
                fillRange: {}
            };
            $scope.controls.fillWarning = {};
        }

        function closeAfter(fn) {
            return function () {
                fn.apply(this, arguments);
                $scope.controls.close();
            };
        }

        //WDS IMENU DONE
        $scope.controls.setPrecision = closeAfter(function (precision) {
            $scope.setPrecision(precision);
        });

        //WDS IMENU DONE
        $scope.controls.columnArithmeticMean = closeAfter(function (index) {
            var sourceColumn = $scope.model.columns[index - 1];
            if (sourceColumn) {
                sourceColumn.addDependentColumn(ns.DERIVED_TYPE_ARITHMETIC_MEAN);
            }
        });

        //WDS IMENU DONE
        $scope.controls.columnGeometricMean = closeAfter(function (index) {
            var sourceColumn = $scope.model.columns[index - 1];
            if (sourceColumn) {
                sourceColumn.addDependentColumn(ns.DERIVED_TYPE_GEOMETRIC_MEAN);
            }
        });

        //WDS IMENU DONE
        $scope.controls.toggleHeaders = closeAfter(function () {
            $scope.model.headersVisible = !$scope.model.headersVisible;
        });

        //WDS IMENU DONE
        $scope.controls.toggleUpperHeaders = closeAfter(function () {
            $scope.model.upperHeadersVisible = !$scope.model.upperHeadersVisible;

            if ($scope.model.upperHeadersVisible) {
                $scope.buildUpperHeaderDefinitions();
            }
        });

//        $scope.controls.linkToGraph = closeAfter(function () {
//            console.log('linkToGraph');
//        });
//
//        $scope.controls.unlink = closeAfter(function () {
//            console.log('unlink');
//        });

        //WDS IMENU DONE
        $scope.controls.clearLinks = closeAfter(function () {
            $scope.model.removeLinks();
        });

        $scope.controls.openFillMenu = closeAfter(function () {
            $scope.controls.isFillMenuOpen = true;
        });

        $scope.controls.closeFillMenu = function () {
            $scope.controls.isFillMenuOpen = false;
        };

        $scope.controls.openFillError = function (message) {
            $scope.controls.isFillMenuOpen = false;
            $scope.controls.isFillErrorOpen = true;
            $scope.controls.fillMenuErrorMessage = message;
        };

        $scope.controls.closeFillError = function () {
            $scope.controls.isFillMenuOpen = true;
            $scope.controls.isFillErrorOpen = false;
            $scope.controls.fillMenuErrorMessage = undefined;
        };

        $scope.controls.openFillWarning = function (message, continueCallback) {
            $scope.controls.isFillMenuOpen = false;
            $scope.controls.isFillWarningOpen = true;
            $scope.controls.fillMenuWarningMessage = message;

            completeFill = continueCallback;
        };

        $scope.controls.closeFillWarning = function () {
            $scope.controls.isFillMenuOpen = true;
            $scope.controls.isFillWarningOpen = false;
            $scope.controls.fillMenuWarningMessage = undefined;
        };

        $scope.controls.dismissFillWarning = function () {
            $scope.controls.closeFillWarning();

            if (angular.isFunction(completeFill)) {
                completeFill();
            }

            $scope.controls.closeFillMenu();
        };

        function fill(settings) {
            var valueRange = settings.fillRangeType === 'value',
                down = settings.fillDirection === 'down',
                fillData = fillService.getFillData(settings.startValue, settings.endValue, settings.interval, settings.operator, valueRange),
                row = settings.row,
                col = settings.col,
                overwriteWarningMessage = getFillOverwriteWarning(fillData, col, row, down),
                rangeWarningMessage = getFillLargeRangeWarning(fillData),
                warningMessage;

            warningMessage = overwriteWarningMessage ? overwriteWarningMessage : '';
            warningMessage += rangeWarningMessage ? rangeWarningMessage : '';

            if (_(warningMessage).isEmpty()) {
                insertColumnData(fillData, col, row, down);
            } else {
                // pass function to complete fill if warning is dismissed
                $scope.controls.openFillWarning(warningMessage, _(insertColumnData).partial(fillData, col, row, down));
            }
        }

        function isColumnRangeEmpty(colRange, col, startRow, fillDown) {
            var column = $scope.model.columns[col],
                colSize = column.cells.length,
                rowIncrement = fillDown ? 1 : -1,
                value, iRow;

            for (iRow = startRow;  Math.abs(iRow - startRow) < colRange; iRow += rowIncrement) {
                if (iRow < 0 || iRow >= colSize) {
                    break;
                }

                value = String(column.cells[iRow].getValue());
                if (!_(value).isEmpty()) {
                    return false;
                }
            }
            return true;
        }

        function getFillOverwriteWarning(data, col, row, down) {
            if (isColumnRangeEmpty(data.length, col, row, down) === false) {
                return 'This operation will overwrite existing data. ';
            }
            return undefined;
        }

        function getFillLargeRangeWarning(data) {
            if (data.length > ns.FILL_WARNING_CELLS) {
                return 'This operation will fill a large number of cells. ';
            }
            return undefined;
        }

        function insertColumnData(fillData, col, row, down) {
            var column = $scope.model.columns[col],
                colSize = column.cells.length,
                dataSize = fillData.length,
                iRow = row,
                rowIncrement = 1,
                newRows = 0;

            if (down) {
                newRows = row + dataSize - colSize;
                for (var i = 0; i < newRows; i++) {
                    $scope.model.addRow();
                }
            } else {
                newRows = dataSize - row - 1;
                for (var j = 0; j < newRows; j++) {
                    $scope.model.addRow(0);
                }
                iRow += newRows;
                rowIncrement = -1;
            }

            for (var iData in fillData) {
                if (iRow < 0 || iRow >= column.cells.length) {
                    continue;
                }

                column.cells[iRow].setValue(fillData[iData]);
//                column.cellAt(iRow).lastEditor = editorId;
                iRow += rowIncrement;
            }
        }

        $scope.controls.fillAction = function () {
            var settings = $scope.controls.fillSettings,
                parsedSettings = {
                    fillDirection: settings.fillDirection,
                    row: parseInt(settings.fillStartCellRow.value, 10) - 1, // 1-based index for user
                    col: parseInt(settings.fillStartCellColumn.value, 10) - 1,  // 1-based index for user
                    startValue: parseInt(settings.fillStartValue.value, 10),
                    endValue: parseInt(settings.fillRange.value, 10),
                    interval: parseInt(settings.fillInterval.value, 10),
                    operator: settings.fillOperator,
                    fillRangeType: settings.fillRangeType
                };

            var message = fillService.getFillError(parsedSettings, $scope.model.rows.length, $scope.model.columns.length);

            if (message) {
                $scope.controls.openFillError(message);
            } else {
                fill(parsedSettings);
                $scope.controls.closeFillMenu();
            }
        };

        reset();
    });
})(window.mt.table);

(function (ns) {
    'use strict';
    angular.module('mtTable').controller('TableRibbonCtrl', function ($scope, toolMenuService, tableSortService, dataExchangeService, roleService) {

        var decimalPrecision = 2;
        var riDecimalPrecision = function(precision) {
            var parsedPrecision = parseInt(precision, 10);
            if(isNaN(parsedPrecision) === false) {
                decimalPrecision = parsedPrecision;
                $scope.setPrecision(parsedPrecision);
            }
        };

        var leftItems = [];

        var rightItems = [
            toolMenuService.newItem.input('precision', riDecimalPrecision, {label: ' Precision', updateOnChange: false}, function () {
                return decimalPrecision;
            }),

            toolMenuService.newItem.toggle('Headers', function () {
                $scope.model.headersVisible = !$scope.model.headersVisible;
                $scope.selectionApi.clear();
            }, {cssClass: 'mt-ribbon-image-headers'}, function () {
                return $scope.model.headersVisible;
            }),

            toolMenuService.newItem.toggle('Upper Headers', function () {
                $scope.model.upperHeadersVisible = !$scope.model.upperHeadersVisible;
                $scope.selectionApi.clear();
                if ($scope.model.upperHeadersVisible) {
                    $scope.buildUpperHeaderDefinitions();
                }
            }, {cssClass: 'mt-ribbon-image-upper-headers'}, function () {
                return $scope.model.upperHeadersVisible;
            }),
            toolMenuService.newItem.button(
                    'Export',
                    function () {
                        dataExchangeService.exportToNewTool('graph', undefined, $scope.exportFn());
                    },
                    {cssClass: 'mt-ribbon-image-export'})
        ];

        //cell locking for teacher and content authors only
        if(roleService.getRole() === mt.common.TEACHER_ROLE || roleService.getRole() === mt.common.CONTENT_AUTHOR_ROLE) {
            var locking = false;
            //send locking event out to cells
            rightItems.push(toolMenuService.newItem.toggle('Locking',
                function () {
                    locking = !locking;
                    $scope.$broadcast(ns.TOGGLE_LOCK_EVENT, locking);
                }, {cssClass: 'mt-ribbon-image-lock-cell'},
                function () {return locking;}
            ));
        }

        var ribbon = {items: {
            right: rightItems,
            left: leftItems
        }};

        function getSelectionText(selection) {
            var text = selection.type + ' ';
            if(selection.type === 'cell') {
                text += (selection.position.column+1) + ':' + (selection.position.row+1);
            } else {
                text += (selection.position+1);
            }
            return text;
        }

        //generic row/col operations - uses addFn

        function getLccIndex() {
            if($scope.selectionApi.getSelection() === undefined) { return; }
            return $scope.selectionApi.getSelection().position;
        }

        function getLCCMenu(copyFn, pasteFn, addFn, removeFn, classPostfix) {
            var menuItems = {left:[], right: []};

            menuItems.left.push(toolMenuService.newItem.button('Delete', function() {
                removeFn(getLccIndex());
                $scope.selectionApi.clear();
            }, {cssClass: 'mt-ribbon-image-remove-' + classPostfix}));

            menuItems.left.push(toolMenuService.newItem.seperator());

            menuItems.left.push(selectionLabel);

            menuItems.right.push(toolMenuService.newItem.button('Cut', function () {
                copyFn(getLccIndex());
                removeFn(getLccIndex());
                $scope.selectionApi.clear();
            }, {cssClass: 'mt-ribbon-image-cut'}));

            menuItems.right.push(toolMenuService.newItem.button('Copy', function() {
                copyFn(getLccIndex());
                $scope.selectionApi.clear();
            }, {cssClass: 'mt-ribbon-image-copy'}));
            menuItems.right.push(toolMenuService.newItem.button('Paste', function() {
                pasteFn(getLccIndex());
                $scope.selectionApi.clear();
            }, {cssClass: 'mt-ribbon-image-paste'}));

            menuItems.right.push(toolMenuService.newItem.button('Insert', function() {
                addFn(getLccIndex());
                $scope.selectionApi.clear();
            }, {cssClass: 'mt-ribbon-image-add-' + classPostfix}));

            return menuItems;
        }

        function makeRowMenu() {
            return getLCCMenu(copyRow, pasteRow,
                function(index) {$scope.model.addRow(index);}, function(index){$scope.model.removeRow(index);}, 'row');
        }

        function makeColumnMenu() {
            var menuItems = getLCCMenu(copyColumn, pasteColumn,
                    function(index) {$scope.model.addColumn(index);}, function(index){$scope.model.removeColumn(index);}, 'col');

            // //axis assignment
            menuItems.right.push(toolMenuService.newItem.button('Remove X Axis', function() {
                $scope.model.columns[getLccIndex()].isXAxis = false;
            }, {isVisible: function() {
                if(getLccIndex() !== undefined) {
                    return $scope.model.columns[getLccIndex()].isXAxis;
                }
            }}));
            menuItems.right.push(toolMenuService.newItem.button('X Axis', function() {
                $scope.model.setXAxis(getLccIndex());
            }, {isVisible: function() {
                if(getLccIndex() !== undefined) {
                    return $scope.model.columns[getLccIndex()].isXAxis === false;
                }
            }}));

            menuItems.right.push(toolMenuService.newItem.button('Remove Y Axis', function() {
                $scope.model.columns[getLccIndex()].isYAxis = false;
            }, {isVisible: function() {
                if(getLccIndex() !== undefined) {
                    return $scope.model.columns[getLccIndex()].isYAxis;
                }
            }}));
            menuItems.right.push(toolMenuService.newItem.button('Y Axis', function() {
                $scope.model.setYAxis(getLccIndex());
            }, {isVisible: function() {
                if(getLccIndex() !== undefined) {
                    return $scope.model.columns[getLccIndex()].isYAxis === false;
                }
            }}));

            //sorting
            menuItems.right.push(toolMenuService.newItem.button('Sort Up', function() {
                tableSortService.sortColumn($scope.model, getLccIndex(), true);
            }, {cssClass: 'mt-ribbon-image-sort-up'}));
            menuItems.right.push(toolMenuService.newItem.button('Sort Down', function() {
                tableSortService.sortColumn($scope.model, getLccIndex(), false);
            }, {cssClass: 'mt-ribbon-image-sort-down'}));

            return menuItems;
        }

        var columnClipboard;
        function copyColumn(index) {
            columnClipboard = $scope.model.getColumnData(index);
        }

        function pasteColumn(index) {
            if (columnClipboard !== undefined) {
                $scope.model.setColumnData(index, columnClipboard);
            }
        }

        var rowClipboard;
        function copyRow(index) {
            rowClipboard = $scope.model.getRowData(index);
        }

        function pasteRow (index) {
            if (rowClipboard !== undefined) {
                $scope.model.setRowData(index, rowClipboard);
            }
        }

        var selectionText = '';
        $scope.$watch('selectionApi.getSelection()', function(selection) {
            if(selection !== undefined) {
                selectionLabel.name = getSelectionText(selection);
            }
        });

        var selectionLabel = toolMenuService.newItem.label(selectionText, {});

        var rowRibbon = {items: makeRowMenu()};

        var colRibbon = {items: makeColumnMenu()};
        this.register = function() {
            toolMenuService.setToolMenu($scope.toolId, ribbon, {containerApi: $scope.containerApi});
            toolMenuService.setToolMenu($scope.toolId, rowRibbon, {contextId: 'row', selectionApi: $scope.selectionApi});
            toolMenuService.setToolMenu($scope.toolId, colRibbon, {contextId: 'column', selectionApi: $scope.selectionApi});
            //toolMenuService.setToolMenu($scope.toolId, cellRibbon, 'cell');
        };
    });
})(window.mt.table);

(function (ns) {
    'use strict';

    //controller for common table functionality
    angular.module('mtTable').controller('TableToolCtrl', function ($scope, $timeout, eventingService, preconfiguredToolService, toolPersistorService, dataExchangeService, toolMenuService, selectionApiFactory) {


        //############################
        // Row Headers
        //############################
        $scope.headerPlaceholder = new ns.Cell();
        $scope.headerPlaceholder.readonly = true;

        $scope.getRowHeaders = function () {
            return _($scope.model.rows).pluck('header');
        };

        //############################
        // Upper Headers
        //############################

        // first upper header in group of shared upper headers was the one updated, need to copy value across
        function synchronizeUpperHeaders() {
            _($scope.upperHeaderDefinitions).each(function (headerDef) {
                var i, goodValue,
                    column = headerDef.columns[0];

                if (!column || !column.upperHeader) {
                    return;
                }

                goodValue = column.upperHeader.getValue();

                for(i in headerDef.columns)  {
                    headerDef.columns[i].upperHeader.value.setVal(goodValue);
                }
            });
        }

        $scope.buildUpperHeaderDefinitions = function (updateModelFromHeaders) {
            if (updateModelFromHeaders) {
                synchronizeUpperHeaders();
            }

            //filter for columns that aren't hidden
            var visibleColumns = _.filter($scope.model.columns, function(column) {return !column.isHidden;});
            var upperHeaders = _.pluck(visibleColumns, 'upperHeader');

            var lastHeader,
                lastDefinition = {
                    columns: [visibleColumns[0]],
                    value: upperHeaders[0]
                };

            $scope.upperHeaderDefinitions = [lastDefinition];

            _(upperHeaders).each(function (header, index) {
                if (index === 0) { // skip first header
                    lastHeader = header;
                    return;
                }

                var currentValue = header.getValue();

                // empty upper headers don't merge
                if (!_(String(currentValue)).isEmpty() && currentValue === lastHeader.getValue()) {
                    lastDefinition.columns.push(visibleColumns[index]);
                } else {
                    lastDefinition = {
                        columns: [visibleColumns[index]],
                        value: header
                    };
                    $scope.upperHeaderDefinitions.push(lastDefinition);
                }

                lastHeader = header;
            });
        };

        $scope.getUpperHeaderStyle = function (headerDef) {
            var i;
            var accumulatedWidth = 0;

            for(i in headerDef.columns) {
                accumulatedWidth += headerDef.columns[i].width;
                if (headerDef.columns[i].dependentColumn) {
                    accumulatedWidth += headerDef.columns[i].dependentColumn.width;
                }
            }

            return { width: accumulatedWidth };
        };

        $scope.$on(ns.CELL_BLURRED_EVENT, _($scope.buildUpperHeaderDefinitions).partial(true));
        $scope.model.registerObserver(ns.NOTIFICATION_COLUMN_ADDED, $scope.buildUpperHeaderDefinitions);
        $scope.model.registerObserver(ns.NOTIFICATION_COLUMN_REMOVED, $scope.buildUpperHeaderDefinitions);
        $scope.model.registerObserver(ns.NOTIFICATION_TABLE_DESERIALIZED, $scope.buildUpperHeaderDefinitions);


        //############################
        // Selection
        //############################

        //selectionApi - also controls menu system
        $scope.selectionApi = selectionApiFactory.createApi(function() {
            $scope.selectionApi.show = false;
        });
        $scope.selectionApi.show = false;
        $scope.selectionApi.isDisabled = false;

        $scope.$on(ns.CELL_TAPPED_EVENT, function (event, cell) {
            $scope.selectionApi.clear();

            var position = $scope.model.getCellPosition(cell);
            $scope.selectionApi.setSelection({type: 'cell', position:position});

            if (position.column >= 0 && position.row >= 0) {
                $scope.selectionApi.setSelectorOverCell(position.column, position.row);
            } else if (position.isHeader) {
                $scope.selectionApi.setSelectorOverColumn(position.column);
            }
        });


        //############################
        // Controls
        //############################

        $scope.closeControls = function () {
            console.log('scope.closeControls');
            $scope.controlsOpen = false;
        };

        //############################
        // Persistence
        //############################
        toolPersistorService.registerTool($scope.toolId, $scope.type, $scope.containerApi, function() {
            return $scope.model;
        }, function(data) {
            $scope.selectionApi.clear();
            $scope.model.deserialize(data);
        });

        function getColAxisIndex(xAxis) {
            var axisIndex;
            _.each($scope.model.columns, function(col, index) {
                if((xAxis === true && col.isXAxis === true)  || (xAxis === false && col.isYAxis === true)) {
                    axisIndex = index;
                    return;
                }
            });
            return axisIndex;
        }

        function arrangeArrayForAxes(oldArray, xIndex, yIndex) {
            var xVal, yVal;
            if(xIndex !== undefined) {
                xVal = oldArray[xIndex];
            }
            if(yIndex !== undefined) {
                yVal = oldArray[yIndex];
            }

            var newArray = [];
            _.each(oldArray, function(val, index) {
                if(index !== xIndex && index !== yIndex) {
                    newArray.push(val);
                }
            });

            //add in the x and y vals
            if(xIndex !== undefined) {
                newArray.splice(0, 0, xVal);
            }
            if(yIndex !== undefined) {
                newArray.splice(1, 0, yVal);
            }
            return newArray;
        }

        //transform
        function moveAxisColumns(data, xIndex, yIndex) {
            data.headers = arrangeArrayForAxes(data.headers, xIndex, yIndex);

            _.each(data.rows, function(row) {
                row.values = arrangeArrayForAxes(row.values, xIndex, yIndex);
            });
        }

        $scope.exportFn = function() {
            var data = {
                headers: [],
                rows: []
            };
            var exportRows = $scope.model.exportRowData();

            //strip out mtValues into primitives
            for(var iRow in exportRows) {
                var emptyRow = true;
                for(var iCol in exportRows[iRow]) {
                    exportRows[iRow][iCol] = exportRows[iRow][iCol].val();
                    if(exportRows[iRow][iCol] !== '') {
                        emptyRow = false;
                    }
                }
                if(emptyRow === false) {
                    var newRow = {values: exportRows[iRow], id: $scope.model.rows[iRow].id};
                    var label = $scope.model.rows[iRow].header.getValue();
                    if($scope.model.rowHeadersVisible && label !== undefined && label !== '') {
                        newRow.label = label;
                    }
                    data.rows.push(newRow);
                }
            }

            if($scope.model.upperHeadersVisible) {
                data.upperHeaders = [];
                _.each($scope.model.columns, function(column) {
                    data.upperHeaders.push(column.upperHeader.getValue());
                });
            }

            _.each($scope.model.columns, function(column) {
                data.headers.push(column.header.getValue());
            });

            //make sure x and y assignments are in the right positions
            moveAxisColumns(data, getColAxisIndex(true), getColAxisIndex(false));

            return data;
        };

        //maps row data in primitive form to MtValues (which are used by the table)
        function mapRowData(rowData) {
            for(var iRow in rowData) {
                var rowVals = [];
                for(var iCol in rowData[iRow].values) {
                    rowVals.push(new mt.common.MtValue(rowData[iRow].values[iCol]));
                }
                rowData[iRow] = rowVals;
            }
        }

        //table aggregator use
        var tableAggregator = new ns.TableAggregator();

        function getRowIndexById(targetId) {
            var rowIndex;
            _.find($scope.model.rows, function(row, index) {
                if(row.id === targetId) {
                    rowIndex = index;
                    return true;
                }
            });
            return rowIndex;
        }

        function mergeRows(rowData) {
            var numRows = rowData.length;
            var numCols = 0;

            if(numRows !== 0) {
                numCols = _.max(rowData, function(row){ return row.values.length; }).values.length;
            }
            //adjust the number of columns - keep num rows the same
            $scope.model.setSize($scope.model.rows.length, numCols);

            //delete any rows that aren't in the new id map
            var newIds = _.pluck(rowData, 'id');
            var idsToDelete = [];
            _.each($scope.model.rows, function(row) {
                if(newIds.indexOf(row.id) === -1) {
                    idsToDelete.push(row.id);
                }
            });

            //overwrite data for existing rows or add a row for new row
            _.each(rowData, function(row) {
                var rowIndex = getRowIndexById(row.id);
                if(rowIndex === undefined) {
                    $scope.model.addRow();
                    rowIndex = $scope.model.rows.length-1;
                    if(row.id !== undefined) {
                        $scope.model.rows[rowIndex].id = row.id;
                    }
                }
                for(var iCol = 0; iCol < numCols; iCol++) {
                    $scope.model.columns[iCol].cells[rowIndex].setValue(row.values[iCol]);
                }
                if(row.label !== undefined  && row.label !== '') {
                    $scope.model.rowHeadersVisible = true;
                    $scope.model.rows[rowIndex].header.setValue(row.label);
                }
            });

            _.each(idsToDelete, function(id) {
                $scope.model.removeRow(getRowIndexById(id));
            });
        }

        $scope.importFn = function(data, updateType) {
            data = angular.copy(data);
            if(updateType === 'append') {
                var oldRows = $scope.exportFn().rows;
                data.rows = oldRows.concat(data.rows);
            }

            var rowLabels = [];
            _.each(data.rows, function(row) {
                rowLabels.push(row.label);
            });

            if(updateType === 'aggregate') {
                mapRowData(data.rows);
                tableAggregator.aggregate($scope.model, data.rows);
            } else {
                mergeRows(data.rows);
            }

            //only update headers for default import
            if(updateType === undefined) {
                _.each(data.headers, function(header, iCol) {
                    $scope.model.columns[iCol].header.setValue(header);
                });
            }

            if(data.upperHeaders !== undefined) {
                _.each(data.upperHeaders, function(header, iCol) {
                    $scope.model.columns[iCol].upperHeader.setValue(header);
                });
                $scope.model.upperHeadersVisible = true;
                $scope.buildUpperHeaderDefinitions(true);
            }
        };

        // Data import/export
        dataExchangeService.registerTool($scope.toolId, $scope.type, $scope.exportFn, $scope.importFn,
            $scope.containerApi, [mt.common.TYPE_GRAPH, mt.common.TYPE_RATIO_BOX, mt.common.TYPE_NUMBER_LINE]);

        //############################
        // Precision
        //############################

        $scope.setPrecision = function (precision) {
            $scope.model.setPrecision(precision);

            // existing cells need to update display for new precision
            $scope.$broadcast(ns.SET_PRECISION_EVENT);
        };

        //############################
        // Post Init
        //############################

        if ($scope.postInit) {
            $scope.postInit();
        }

        $scope.updateFn = function () {
            $scope.$digest();
        };

        //############################
        // External API
        //############################

        $scope.API = function () {

            function apply(fn) {
                return function () {
                    var retVal = fn.apply(this, arguments);
                    $timeout(angular.noop);
                    return retVal;
                };
            }

            return {
                addRow: apply(function (index) {
                    return $scope.model.addRow(index);
                }),

                removeRow: apply(function (index) {
                    return $scope.model.removeRow(index);
                }),

                moveRow: apply(function (startIndex, endIndex) {
                    return $scope.model.moveRow(startIndex, endIndex);
                }),

                addColumn: apply(function (index) {
                    return $scope.model.addColumn(index);
                }),

                removeColumn: apply(function (index) {
                    return $scope.model.removeColumn(index);
                }),

                moveColumn: apply(function (startIndex, endIndex) {
                    return $scope.model.moveColumn(startIndex, endIndex);
                }),

                setPrecision: apply(function (precision) {
                    return $scope.setPrecision(precision);
                }),

                setData: apply(function (data) {
                    return $scope.model.deserialize(data);
                }),

                setSize: apply(function (numRows, numColumns) {
                    return $scope.model.setSize(numRows, numColumns);
                }),

                // no apply needed
                getRowData: function (index) {
                    return $scope.model.getRowData(index);
                },

                // no apply needed
                getColumnData: function (index) {
                    return $scope.model.getColumnData(index);
                },

                setRowData: apply(function (rowIndex, data, startColIndex) {
                    return $scope.model.setRowData(rowIndex, data, startColIndex);
                }),

                setColumnData: apply(function (colIndex, data, startRowIndex) {
                    return $scope.model.setColumnData(colIndex, data, startRowIndex);
                }),

                setXAxis: apply(function (index) {
                    return $scope.model.setXAxis(index);
                }),

                setYAxis: apply(function (index) {
                    return $scope.model.setYAxis(index);
                }),

                clearSelection: apply(function () {
                    return $scope.selectionApi.clear();
                })
            };
        };
    });
})(window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').directive('mtCellSelectorHandle', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/cellSelectorHandleTemplate.html',
            scope: {
                handle: '@',
                dragStart: '=dragstart',
                drag: '=',
                dragEnd: '=dragend',
                show: '='
            }
        };
    });

})(window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').directive('mtCellSelector', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/cellSelectorTemplate.html',
            controller: 'CellSelectorCtrl',
            scope: {
                table: '=',
                selectionApi: '='
            },
            link: function (scope, element, attrs) {
                var settings;

                function captureSettings() {
                    settings = {
                        width: scope.model.width,
                        height: scope.model.height,
                        top: scope.model.top,
                        left: scope.model.left
                    };
                }

                scope.dragHandleStart = function (handle) {
                    captureSettings();
                    scope.updateDragBounds(handle);
                    // this doesn't belong here
                    $('input:focus').blur();

                    scope.$digest();
                    return false;
                };

                scope.dragHandle = function (event, handle) {
                    console.log(handle, event);
                    scope.handleDragFns[handle](settings, event.gesture.deltaX, event.gesture.deltaY);
                    scope.$digest();
                    return false;
                };

                scope.dragHandleEnd = function (handle) {
                    scope.snapSelection();
                    scope.$digest();
                    return false;
                };
            }
        };
    });
}) (window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').directive('mtCell', function ($timeout) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/mtCellTemplate.html',
            scope: {
                model: '='
            },
            link: function (scope, element, attrs) {
                var input = $(element).find('.mt-cell-input');
                var mathElement = $(element).find('.mt-cell-display');
                var lockingMode = false;

                function focusInput() {
                    input.focus();
                }

                function updateMathQuill() {
                    mathElement.mathquill('latex', scope.model.value.toLatexString());
                }

                scope.tap = function () {
                    if(lockingMode === true) {
                        scope.model.locked = !scope.model.locked;
                        return;
                    }

                    scope.$emit(ns.CELL_TAPPED_EVENT, scope.model);

                    if (scope.model.readonly || scope.model.locked) {
                        return;
                    }

                    scope.model.isEditing = true;
                    $timeout(focusInput);
                };

                scope.hold = function ($event) {
                    scope.$emit(ns.CELL_HELD_EVENT, scope.model, $event);
                };

                scope.change = function () {
                    scope.model.updateValueFromEdit();
                    scope.$emit(ns.CELL_CHANGED_EVENT);
                };

                scope.blur = function () {
                    scope.model.isEditing = false;
                    scope.model.updateValueFromEdit();
                    updateMathQuill();

                    scope.$emit(ns.CELL_BLURRED_EVENT, scope.model);
                };

                //when the model changes re-render display
                scope.model.registerObserver(function() {
                    updateMathQuill();
                });

                //register to listen for locking changes coming from table
                scope.$on(ns.TOGGLE_LOCK_EVENT, function(event, isEnabled) {
                    lockingMode = isEnabled;
                });

                scope.$on(ns.SET_PRECISION_EVENT, function () {
                    updateMathQuill();
                });

                mathElement.mathquill();
                if (scope.model.value) {
                    updateMathQuill();
                }
            }
        };
    });
})(window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').directive('mtColumn', function (tableColumnLinkService) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/mtColumnTemplate.html',
            scope: {
                model: '=',
                headerVisible: '=',
                colIndex: '='
            },
            link: function (scope, element, attrs) {
                scope.onHeaderTap = function (event) {
                    var handled = tableColumnLinkService.addToCurrentLink(scope.model);
                    if(handled === true) {
                        event.stopPropagation();
                    } else {
                        return false;
                    }
                };
            }
        };
    });
})(window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').directive('mtContingencyTable', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/mtContingencyTableTemplate.html',
            controller: 'ContingencyTableCtrl',
            scope: {
                toolId: '=',
                containerApi: '='
            }
        };
    });
})(window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').directive('mtDefaultTable', function () {
        return {
            restrict: 'E',
            replace: true,
            template: '<div class="mt-default-table"><mt-table-tool></mt-table-tool></div>',
            controller: 'DefaultTableCtrl',
            scope: {
                toolId: '=',
                containerApi: '='
            }
        };
    });
})(window.mt.table);

(function (ns) {
    'use strict';
    angular.module('mtTable').directive('mtFractionInput', function ($timeout, tableUserService, safeApply) {
        function linkFn(scope, element, attr) {
            scope.mathElement = $(element).find('.mt-fraction-cell-display');
            scope.mathElement.mathquill();

            scope.input = $(element).find('input');

            scope.isReadOnly = function() {
                var readOnly = scope.getCell().type === 'summator';
                var isLocked = scope.getCell().locked;
                if(scope.gridConfig.getColumn !== undefined) {
                    readOnly = readOnly || scope.gridConfig.getColumn(scope.column).columnType === ns.COLUMN_TYPE_STATIC;
                }
                return scope.lockMode || isLocked || readOnly || scope.keypadEnabled;
            };
            scope.getFractionCellContainerStyle = function () {
                if (Object.getPrototypeOf(scope.gridConfig).constructor.name === 'RatioBox') { return; }
                var height = element.height();
                if (height <= 30) {
                    height = 30;
                }
                return {
                    height: height + 'px',  // this keeps the fraction cell container from being resized too small,
                    position: 'absolute'    // or being shifted out of alignment during vertical cell resize
                };
            };
            scope.getLastEditorStyle = function () {
                var style = {};
                if (scope.getCell().lastEditor !== undefined) {
                    var userCol = tableUserService.getUserColor(scope.getCell().lastEditor);
                    if (userCol !== undefined) {
                        style.color = userCol;
                    }
                }
                return style;
            };

            function focusInput() {
                setTimeout(function() {
                    scope.input.focus();
                });
            }
            scope.toggleChanged = function () {
                if(scope.editMode === true) {
                    if (scope.keypadEnabled) {
                        scope.clickFn(element, scope.getCell());
                        focusInput();
                    }
                    scope.input.on('blur.switchBack', function () {
                        scope.mathElement.mathquill('latex', scope.getCell().value.toLatexString());
                        scope.toggleMode(false);
                        scope.input.off('blur.switchBack');
                    });
                } else {
                    scope.input.off('blur.switchBack');
                }
                safeApply(scope, function () {});
            };
            scope.updated = function () {
                scope.mathElement.mathquill('latex', scope.getCell().value.toLatexString());
            };
            scope.$watch('getCell().value.toLatexString()', function(new_val, old_val) {
                if(mt.common.EDIT_MODE !== mt.common.EDIT_MODE_HWR && scope.editMode) {
                    return;
                }
                if(new_val === old_val) {
                    return;
                }
                scope.mathElement.mathquill('latex', scope.getCell().value.toLatexString());
            }, true);
            scope.getFractionCellClass = function (column, row) {
                var fractionCellClass = 'mt-fraction-cell';
                fractionCellClass += column;
                fractionCellClass += '_';
                fractionCellClass += row;
                var lockClass = scope.getCell().locked? ' mt-locked-table-cell' : '';
                return fractionCellClass + lockClass;
            };
            //cell selection - call out to handwriting editing
            scope.onCellTap = function () {
                console.log('cell tap');
                if(scope.editMode === false) {
                    scope.toggleMode();
                }
                if (scope.lockMode) {
                    scope.toggleCellLock();
                } else {
                    if(scope.isReadOnly() !== true) {
                        scope.clickFn(element, scope.getCell());
                        focusInput();
                        // setTimeout(function() {
                        //     scope.input.focus();
                        // }, 0);
                    }
                }
            };
            scope.getEditMode = function () {
                return mt.common.EDIT_MODE;
            };
            scope.$watch('getEditMode()', function(new_val, old_val) {
                if (new_val === old_val) {
                    return;
                }
                scope.setKeypadEnabled();
            });
            scope.$watch('input.value', function(new_val, old_val) {
                if (new_val === old_val || !scope.keypadEnabled) {
                    return;
                }
                scope.onChange();
            });
            scope.$watch('precision.value', function(new_val, old_val) {
                if (new_val === old_val) {
                    return;
                }
                scope.getCell().value.setPrecision(new_val);
            });
            scope.update();
        }

        return {
            restrict: 'E',
            replace: true,
            template:
                '<div class="mt-fraction-cell" ng-click="onCellTap()" ng-class="getFractionCellClass(column, row)">' +
                    '<div class="mt-fraction-cell-display-container">' +
                        '<div class="mt-fraction-cell-display" ng-show="!editMode" ng-style="getLastEditorStyle()">' +
                            '<span class="mathquill-embedded-latex"></span>' +
                        '</div>' +
                    '</div>' +
                    '<div ng-show="editMode" class="mt-fraction-cell-input" ng-style="getFractionCellContainerStyle()" >' +
                        '<input class="mt-fraction-cell-input mt-table-cell-input mt-input{{column}}_{{row}}" type="text" ng-change="onChange()" '+
                        'ng-model="getCell().value.editText" ng-model-onblur' +
                        ' ng-blur="update()" ng-style="getLastEditorStyle()" ng-readonly="isReadOnly()"/>' +
                    '</div>' +
                '</div>',
            transclude : true,
            scope : {
                precision:'=precision',
                column:'=column',
                row:'=row',
                gridConfig:'=gridConfig',
                updateCallback:'=updateCallback',
                clickFn: '=clickFn',
                useKeypad: '=useKeypad',
                lockMode: '=lockMode'
            },
            controller: 'FractionCellCtrl',
            link: linkFn
        };
    });

})(window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').directive('mtRatioBox', function ($timeout, safeApply) {

        return {
            restrict: 'E',
            controller: 'RatioBoxController',
            replace: true,
            scope               : {
                toolId: '=',
                containerApi: '='
            },
            templateUrl: 'templates/mtRatioBoxTemplate.html',
            link: function (scope, element, attrs) {
                //these must be kept in sync with the corresponding values in ratiobox.less
                var baseMargin = 25; // keeps correctness indicator visible
                var cellWidth = 100;
                var cellHeight = 74;
                var eqnHeight = 50;
                var eqnWidth = 80;
                scope.getMarginStyle = function() {
                    var top = baseMargin;
                    var bottom = baseMargin;
                    var right = baseMargin;
                    var left = baseMargin;
                    if(scope.settings.showArrows === true) {
                        top += eqnHeight;
                        bottom += eqnHeight;
                        right += eqnWidth;
                        left += eqnWidth;
                    }
                    if(scope.settings.showRowHeaders === true) {
                        left += cellWidth;
                    }
                    if(scope.settings.showColumnHeaders === true) {
                        top += cellHeight;
                    }
                    return {margin: top +'px ' + right + 'px ' + bottom + 'px ' + left + 'px'};
                };
            }
        };
    });

    angular.module('mtTable').directive('mtRatioBoxGrid', function () {

        return {
            restrict: 'E',
            replace: true,
            template:
                '<div class="mt-ratio-box-grid" >' +
                    '<mt-ratio-box-column ng-repeat="c in [0,1]"></mt-ratio-box-column>' +
                '</div>'
        };
    });

    angular.module('mtTable').directive('mtRatioBoxColumn', function () {
        return {
            restrict: 'E',
            replace: true,
            template:
                '<div class="mt-table-vertical-col mt-ratio-box-column mt-column-index{{c}}">' +
                    '<mt-ratio-box-cell ng-repeat="r in [0,1]" > </mt-ratio-box-cell>'+
                '</div>'
        };
    });

    angular.module('mtTable').directive('mtRatioBoxCell', function () {

        return {
            restrict: 'E',
            replace: true,
            template:
                '<div class="mt-ratio-box-cell mt-cell{{c}}_{{r}} mt-resizable-cell">' +
                    '<mt-fraction-input column="c" row="r" grid-config="ratioBox" update-callback="onCellUpdate" click-fn="selectFractionCell" use-keypad="true"></mt-fraction-input>' +
                '</div>',
            link: function (scope, element) {
                scope.selectFractionCell = function(event) {
                    var targetElement = element;
                    if(mt.common.EDIT_MODE === mt.common.EDIT_MODE_CUSTOM) {
                        targetElement = $(element).find('input')[0];
                    }
                    scope.selectCell(targetElement, scope.ratioBox.columns[scope.c][scope.r], mt.common.HW_MODE_EQN);
                };
            }
        };
    });

    angular.module('mtTable').directive('mtRatioBoxColumnHeader', function () {

        return {
            restrict: 'E',
            replace: true,
            template:
                '<div class="mt-ratio-box-column-header mt-resizable-cell" hm-tap="selectHeader(c)">' +
                    '<input class="mt-ratio-box-column-header-input mt-table-cell-input mt-column-header{{c}}" type="text" ' +
                    'ng-model="ratioBox.columnHeaders[c]" ng-readonly="readOnlyTextInputs"/>' +
                '</div>',
            link: function (scope, element) {
                var inputElement = $(element).find('.mt-ratio-box-column-header-input')[0];
                scope.selectHeader = function(col) {
                    var targetElement = element;
                    if(mt.common.EDIT_MODE === mt.common.EDIT_MODE_CUSTOM) {
                        targetElement = inputElement;
                    }
                    scope.selectCell(targetElement, scope.ratioBox.columnHeaders[col], mt.common.HW_MODE_TEXT, true);
                };
            }
        };
    });

    angular.module('mtTable').directive('mtRatioBoxRowHeader', function () {

        return {
            restrict: 'E',
            replace: true,
            template:
                '<div class="mt-ratio-box-row-header mt-resizable-cell" hm-tap="selectRowHeader(r)">' +
                    '<input class="mt-ratio-box-row-header-input mt-table-cell-input mt-row-header{{r}}" type="text" ' +
                    'ng-model="ratioBox.rowHeaders[r]" ng-readonly="readOnlyTextInputs"/>' +
                '</div>',
            link: function (scope, element) {
                var inputElement = $(element).find('.mt-ratio-box-row-header-input')[0];
                scope.selectRowHeader = function(row) {
                    scope.selectCell(inputElement, scope.ratioBox.rowHeaders[row], mt.common.HW_MODE_TEXT, true);
                };
            }
        };

    });

    angular.module('mtTable').directive('mtRatioBoxEquation', function () {
        function linkFn(scope, element) {
            var inputElement;
            setTimeout(function() {
                inputElement = element.find('.mt-ratio-box-eqn-input')[0];
            });

            scope.clickEquation = function (e) {
                e.preventDefault();
                scope.selectEquation(inputElement, scope.equation.direction);
            };

            scope.flipArrow = function() {
                scope.equation.mirrored = !scope.equation.mirrored;
            };

            //watch for change in column upper headers
            scope.$watch('equation.equationLabel', function() {
                scope.equation.update();
            }, true);
        }

        return {
            restrict: 'E',
            replace: false,
            template:
                '<div class="mt-ratio-box-eqn" ng-if="settings.showArrows">' +
                    '<div class="mt-rb-arrow-before" hm-tap="flipArrow()" ng-class="{\'mt-mirrored\': equation.mirrored, \'mt-not-mirrored\': !equation.mirrored}"></div>' +
                    '<div class="mt-ratio-box-eqn-label">' +
                        '<input ng-click="clickEquation($event)" class="mt-ratio-box-eqn-input mt-table-cell-input" type="text" ng-model="equation.equationLabel" ng-readonly="$parent.$parent.readOnlyNumberInputs" />' +
                    '</div>'+
                    '<div class="mt-rb-arrow-after" hm-tap="flipArrow()" ng-class="{\'mt-mirrored\': equation.mirrored, \'mt-not-mirrored\': !equation.mirrored}"></div>' +
                '</div>',
            scope : {
                settings:'=',
                selectEquation: '=',
                equation: '='
            },
            link: linkFn
        };
    });
})(window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').directive('mtResultsTable', function () {
        return {
            restrict: 'E',
            replace: true,
            template: '<div class="resultsTable"><mt-table-tool></mt-table-tool></div>',
            controller: 'ResultsTableCtrl',
            scope: {
                toolId: '=',
                containerApi: '='
            }
        };
    });
})(window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').directive('mtSelectorBar', function (tableColumnLinkService, cellPositionService) {
        return {
            restrict: 'E',
            templateUrl: 'templates/selectorBarTemplate.html',
            controller: 'SelectorBarCtrl',
            scope: {
                table: '=',
                selectionApi: '=',
                updateFn: '='
            },
            //TODO - this should probably have an isolate scope once api is defined
            //right now we're using a lot of the grid controller scope functions
            link: function (scope, element, attrs) {
                var defaultHandlePos = 7;
                var defaultCellWidth = 72;
                var defaultCellHeight = 35;
                var headerCellHeight = 40;

                scope.row = attrs.row === 'true';
                scope.lccType = scope.row? ns.TYPE_ROW: ns.TYPE_COLUMN;

                scope.getSelectorPartStyle = function (index) {
                    var style = {};
                    if(scope.row) {
                        if(scope.table.headersVisible) {
                            index--;
                        }
                        if(scope.table.upperHeadersVisible) {
                            index--;
                        }
                        if(index < 0) {
                            style.height = headerCellHeight;
                        } else {
                            style.height = scope.table.rows[index].height;
                        }
                    } else {
                        if(scope.table.rowHeadersVisible) {
                            index--;
                        }
                        if(index < 0) {
                            style.width = ns.DEF_COL_WIDTH;
                        } else {
                            var visibleColumns = _.filter(scope.table.columns, function(column) {return !column.isHidden;});
                            style.width = visibleColumns[index].width;
                            if (visibleColumns[index].dependentColumn) {
                                style.width += visibleColumns[index].dependentColumn.width;
                            }
                        }
                    }
                    return style;
                };

                scope.getLccSelectionStyle = function () {
                    var style = {};

                    var curSelection = scope.selectionApi.getSelection();
                    if(curSelection === undefined || curSelection.type !== scope.lccType) {
                        return style;
                    }

                    var index = curSelection.position;

                    if(scope.row) {
                        style.height = scope.table.rows[index].height + 'px';
                        style.top = cellPositionService.getRowTopOffset(scope.table, index) + 'px';
                    } else {
                        style.width = scope.table.columns[index].width + 'px';
                        style.left = cellPositionService.getColumnLeftOffset(scope.table, index) + 'px';
                    }
                    return style;
                };

                //cache elements
                var dragSpacerElement;
                var dragAreaElement;
                setTimeout(function () {
                    dragSpacerElement = element.find('.mt-selector-handle-drag-area');
                    dragAreaElement = element.find('.mt-drag-area');
                });

                var dragStartPos;
                var lastDeletedColWidth;
                scope.drag = function(event) {
                    var dragPos = [event.gesture.center.pageX, event.gesture.center.pageY];
                    if(dragStartPos === undefined) {
                        scope.selectionApi.clear();
                        tableColumnLinkService.cancelLink();
                        dragStartPos = dragPos;
                        dragSpacerElement.css('visibility', 'visible');
                        dragAreaElement.css('visibility', 'visible');
                    } else if(scope.row) {
                        var newHeight = defaultHandlePos + dragPos[1] - dragStartPos[1];
                        if(newHeight >= defaultCellHeight) {
                            scope.table.addRow();
                            scope.$apply();
                            dragStartPos = dragPos;
                            dragSpacerElement.css('height', '0px');
                            dragAreaElement.css('height', '0px');
                        } else if(newHeight <= 0) {
                            if(scope.table.removeRow() !== false) {
                                scope.$apply();
                                dragStartPos = [dragPos[0], dragPos[1] - defaultCellHeight + defaultHandlePos];
                                dragSpacerElement.css('height', (defaultCellHeight - newHeight) +'px');
                                dragAreaElement.css('height', (defaultCellHeight - newHeight) + 'px');
                            }
                        } else {
                            dragSpacerElement.css('height', newHeight + 'px');
                            dragAreaElement.css('height', newHeight + 'px');
                        }
                    } else {
                        //some logic here with last deleted column width to make things continuous
                        var newWidth = defaultHandlePos + dragPos[0] - dragStartPos[0];
                        var addColWidth = (lastDeletedColWidth === undefined)? defaultCellWidth: lastDeletedColWidth;
                        if(newWidth >= addColWidth) {
                            scope.table.addColumn();
                            _.last(scope.table.columns).width = addColWidth;
                            scope.$apply();
                            dragStartPos = dragPos;
                            dragSpacerElement.css('width', '0px');
                            dragAreaElement.css('width', '0px');

                            lastDeletedColWidth = undefined;
                        } else if(newWidth <= 0) {
                            lastDeletedColWidth = _.last(scope.table.columns).width;

                            if(scope.table.removeColumn() !== false) {
                                scope.$apply();
                                dragStartPos = [dragPos[0] - lastDeletedColWidth + defaultHandlePos, dragPos[1]];
                                dragSpacerElement.css('width', (lastDeletedColWidth - newWidth) +'px');
                                dragAreaElement.css('width', (lastDeletedColWidth - newWidth) + 'px');
                            } else {
                                lastDeletedColWidth = undefined;
                            }
                        } else {
                            dragSpacerElement.css('width', newWidth + 'px');
                            dragAreaElement.css('width', newWidth + 'px');
                        }
                    }

                    return false;
                };

                scope.dragEnd = function(event) {
                    lastDeletedColWidth = undefined;
                    dragStartPos = undefined;
                    dragSpacerElement.css('visibility', 'hidden');
                    dragAreaElement.css('visibility', 'hidden');
                    if(scope.row) {
                        dragSpacerElement.css('height', defaultHandlePos + 'px');
                        dragAreaElement.css('height', defaultHandlePos + 'px');
                    } else {
                        dragSpacerElement.css('width', defaultHandlePos + 'px');
                        dragAreaElement.css('width', defaultHandlePos + 'px');
                    }

                    return false;
                };
            }
        };
    });
}) (window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').directive('mtTableControls', function (safeApply) {

        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/mtTableControlsTemplate.html',
            link: function(scope, element, attrs) {
                // move the popup to the body, so the that z-index layering works correctly
                $(element).appendTo($('body'));
                // remove the popup explicitly since it is in a different DOM position
                scope.$on('$destroy', function() {
                    $(element).remove();
                });

                /****************
                 Keypad
                 *****************/
                scope.setKeypadVisible = function (visible) {
                    var tapOutFn = function() {
                        safeApply(scope, function(){});
                    };
                    scope.keypad.setKeypadVisible(visible, document.activeElement, tapOutFn);
                };

                scope.isKeypadVisible = function (visible) {
                    return scope.keypad.keypadVisible;
                };

                scope.keypad = new mt.common.Keypad();
                scope.keypad.setKeypadVisible(false);

                scope.selectInput = function(event, target) {
                    scope.keypad.selectInput(event, target);
                };

            }
        };
    });
})(window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').directive('mtTableFillError', function () {

        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/mtTableFillErrorTemplate.html',
            link: function(scope, element) {
                // move the popup to the body, so the that z-index layering works correctly
                $(element).appendTo($('body'));
                // remove the popup explicitly since it is in a different DOM position
                scope.$on('$destroy', function() {
                    $(element).remove();
                });
            }
        };
    });
})(window.mt.table);
(function (ns) {
    'use strict';

    angular.module('mtTable').directive('mtTableFillMenu', function () {

        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/mtTableFillMenuTemplate.html',
            link: function(scope, element) {
                // move the popup to the body, so the that z-index layering works correctly
                $(element).appendTo($('body'));
                // remove the popup explicitly since it is in a different DOM position
                scope.$on('$destroy', function() {
                    $(element).remove();
                });
            }
        };
    });
})(window.mt.table);
(function (ns) {
    'use strict';

    angular.module('mtTable').directive('mtTableFillWarning', function () {

        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/mtTableFillWarningTemplate.html',
            link: function(scope, element) {
                // move the popup to the body, so the that z-index layering works correctly
                $(element).appendTo($('body'));
                // remove the popup explicitly since it is in a different DOM position
                scope.$on('$destroy', function() {
                    $(element).remove();
                });
            }
        };
    });
})(window.mt.table);
(function (ns) {
    'use strict';

    //NOTE: this is a generic table directive that should be wrapped in one of the specific table directives:
    //  mtDefaultTableTool
    //  mtContingencyTableTool
    //  mtResultsTableTool
    angular.module('mtTable').directive('mtTableTool', function (tableColumnLinkService) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/mtTableToolTemplate.html',
            controller: 'TableToolCtrl',
            scope: false,
            link: function (scope, element, attrs) {
                scope.onTableTap = function() {
                    tableColumnLinkService.cancelLink();
                    return false;
                };
            }
        };
    });
})(window.mt.table);

// initialization of services into the main module
//angular.module('mtGrid', ['mtGrid.controllers','mtGrid.services', 'mtGrid.directives', 'mtGrid.filters']);

(function (ns) {
    'use strict';

    //service for mapping positions of cells (and groups of cells) to a table object
    angular.module('mtTable').service('cellPositionService', function () {

        var self = this;
        function getColumnWidth(column) {
            return column.isHidden? 0: ((column.dependentColumn === undefined)? column.width: column.width + column.dependentColumn.width);
        }

        this.getHeaderHeight = function (table) {
            var headerHeight = ns.DEF_HEADER_ROW_HEIGHT;
            return (table.upperHeadersVisible ? headerHeight: 0) + (table.headersVisible ? headerHeight: 0);
        };

        this.getRowHeaderWidth = function(table) {
            return table.rowHeadersVisible? ns.DEF_COL_WIDTH: 0;
        };

        //get the cumulative vertical distance from the top to a certain row (not including the row itself)
        this.getRowTopOffset = function (table, rowIndex) {
            var offset = self.getHeaderHeight(table);
            for(var i = 0; i < rowIndex; i++) {
                offset += table.rows[i].height;
            }
            return offset;
        };

        //get the cumulative horizontal distance from the left to a certain column (not including the column itself)
        this.getColumnLeftOffset = function (table, colIndex) {
            var offset = self.getRowHeaderWidth(table);
            for(var i = 0; i < colIndex; i++) {
                offset += getColumnWidth(table.columns[i]);
            }
            return offset;
        };

        this.getTableWidth = function(table) {
            return self.getRowHeaderWidth(table) + _.reduce(table.columns, function(sum, column) {
                return sum + getColumnWidth(column);
            }, 0);
        };

        this.getTableHeight = function(table) {
            return self.getHeaderHeight(table) + _.reduce(table.rows, function(sum, row){
                return sum + row.height;
            }, 0);
        };

        // get bounds functions return
        // {min:[leftX, topY], max=[rightX, bottomY]}
        this.getCellBounds = function (table, rowIndex, colIndex) {
            var min = [this.getColumnLeftOffset(table, colIndex), this.getRowTopOffset(table, rowIndex)];
            var width = table.columns[colIndex].width;
            var height = table.rows[rowIndex].height;
            return {min: min, max: [min[0] + width, min[1] + height]};
        };

        this.getColumnBounds = function (table, colIndex) {
            var min = [this.getColumnLeftOffset(table, colIndex), 0];
            var max = [min[0] + table.columns[colIndex].width, this.getTableHeight(table)];
            return {min: min, max: max};
        };

        this.getRowBounds = function (table, rowIndex) {
            var min = [0, this.getRowTopOffset(table, rowIndex)];
            var max = [min[0] + this.getTableWidth(table), min[1] + table.rows[rowIndex].height];
            return {min: min, max: max};
        };

        //find the closest column index to a given x position relative to the left edge of the column
        this.getClosestColumnIndex = function (table, posX) {
            var curPos, i;
            var lastPos = 0;
            var lastIndex = 0;
            for(i = 0; i < table.columns.length; i++) {
                if(table.columns[i].isHidden) {
                    continue;
                }
                curPos = lastPos + getColumnWidth(table.columns[i]);
                if(curPos > posX) {
                    if(lastIndex === undefined || Math.abs(curPos - posX) < Math.abs(lastPos - posX)) {
                        return i+1;
                    } else {
                        return lastIndex;
                    }
                }
                lastIndex = i+1;
                lastPos = curPos;
            }
            return lastIndex;
        };

        //find the closest row index to a given y position relative to the top edge of the row
        this.getClosestRowIndex = function (table, posY) {
            var curPos, i;
            var lastPos = this.getHeaderHeight(table);
            var lastIndex = 0;
            for(i = 0; i < table.rows.length; i++) {
                curPos = lastPos + table.rows[i].height;
                if(curPos > posY) {
                    if(Math.abs(curPos - posY) < Math.abs(lastPos - posY)) {
                        return i+1;
                    } else {
                        return lastIndex;
                    }
                }
                lastIndex = i+1;
                lastPos = curPos;
            }
            return lastIndex;
        };

        //is a given column index the left most column, taking into account dependent and hidden columns and
        this.isLastColumn = function(table, columnIndex) {
            //loop from end of columns down to column itself
            for(var i = table.columns.length-1; i > columnIndex-1; i--) {
                if(!table.columns[i].isHidden && table.columns[i].dependentColumn !== undefined) {
                    return false; //if an outer column is shown and has a dependent then the column is not the outermost
                }
                if(i === columnIndex) {
                    return true;
                }
                if(!table.columns[i].isHidden) {
                    return false;
                }
            }
            //should never get here
        };

        this.isLastRow = function(table, rowIndex) {
            return rowIndex === table.rows.length-1;
        };
    });
})(window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').service('fillService', function () {

        // TODO refactor to take generic settings object
        this.getFillData = function (startVal, endVal, interval, operator, valueRange) {
            var data = [];

            //var range = Math.abs(startVal - endVal);

            var curVal = startVal;
            var breakAfterSet = false;

            var oldDiff = Number.MAX_VALUE;

            while (true) {
                data.push(curVal);

                if (data.length > ns.MAX_ROWS) {
                    break;
                }

                if (breakAfterSet) {
                    break;
                }

                switch (operator)
                {
                case 'subtract':
                    curVal -= interval;
                    break;
                case 'multiply':
                    curVal *= interval;
                    break;
                case 'divide':
                    curVal /= interval;
                    break;
                //case 'add':
                default:
                    curVal += interval;
                    break;
                }
                var diff = Math.abs(endVal - curVal);

                // going nowhere
                if (curVal === startVal) {
                    break;
                }

                if (valueRange) {
                    if (curVal === endVal || (endVal - curVal < 0) !== (endVal - startVal < 0) || oldDiff <= diff) {
                        breakAfterSet = true;
                    }
                } else {
                    if (data.length === endVal) {
                        break;
                    }
                }

                oldDiff = diff;
            }

            return data;
        };

        this.getFillError = function (settings, numRows, numColumns) {
            if (!settings.fillDirection) {
                return 'Must select fill direction';
            }

            if (isNaN(settings.row) || settings.row < 0 || settings.row >= numRows) {
                return 'Starting cell row must be a number between 1 and ' + numRows + ' (inclusive)';
            }

            if (isNaN(settings.col) || settings.col < 0 || settings.col >= numColumns) {
                return 'Starting cell column must be a number between 1 and ' + numColumns + ' (inclusive)';
            }

            if (isNaN(settings.startValue)) {
                return 'Starting value must be a number';
            }

            if (!settings.operator) {
                return 'Must select fill operator';
            }

            if (isNaN(settings.interval)) {
                return 'Interval amount must be a number';
            }

            if (!settings.fillRangeType) {
                return 'Must select to apply range to a value or number of cells';
            }

            if (isNaN(settings.endValue)) {
                return 'Range amount must be a number';
            }

            //MT-1340
            function checkMultDivInterval() {
                return !(settings.interval < 0 && (settings.operator === 'multiply' || settings.operator === 'divide'));
            }
            if (!checkMultDivInterval()) {
                return 'Interval must be positive using multiple or divide.';
            }

            // not strictly necessary, but for clarity
            return undefined;
        };
    });
})(window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').service('tableColumnLinkService', function () {
        var curLinkColor;
        var curLinkTable;

        this.addToCurrentLink = function(column) {
            if(curLinkColor === undefined) {
                return false;
            }
            var oldLinkColor = column.linkColor;
            column.linkColor = curLinkColor;

            //merge any existing links involving this column
            if(oldLinkColor !== undefined) {
                _.each(curLinkTable.columns, function(column) {
                    if(column.linkColor === oldLinkColor) {
                        column.linkColor = curLinkColor;
                    }
                });
            }

            //for now only do one link per menu selection
            this.cancelLink();

            return true;
        };

        this.startLink = function(table, index) {
            curLinkTable = table;
            if(table.columns[index].linkColor !== undefined) {
                curLinkColor = table.columns[index].linkColor;
            } else {
                curLinkColor = this.getNextLinkColor(curLinkTable);
                table.columns[index].linkColor = curLinkColor;
            }
        };

        this.unlink = function(table, index) {
            curLinkTable = table;
            table.columns[index].linkColor = undefined;
            table.removeSingleLinks();
        };

        this.cancelLink = function() {
            if(curLinkTable !== undefined) {
                curLinkTable.removeSingleLinks();
                curLinkColor = undefined;
                curLinkTable = undefined;
            }
        };

        this.getNextLinkColor = function(table) {
            for(var i in ns.LINK_COLORS) {
                var color = ns.LINK_COLORS[i];
                if(_.findWhere(table.columns, {linkColor: color}) === undefined) {
                    return color;
                }
            }
            //if we have exceeded the maximum number of links - don't do any more
            return undefined;
        };
    });

})(window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').service('tableSortService', function () {

        //JMT Note - this was originally designed to work based on column linkings which we no longer support.
        //We could streamline the code here, but I'm not sure it's worth it, and perhaps linking will come back.
        this.sortColumn = function(table, index, ascending) {
            var sortColumn = table.columns[index];
            //get column orderMapping
            var orderMapping = this.getSortMapping(sortColumn, ascending);

            //JMT - all columns are now linked by default
            //get all linked columns
            // var linkColor = sortColumn.linkColor;
            // var linkColumns;
            // if(linkColor === undefined) {
            //     linkColumns = [sortColumn];
            // } else {
            //     linkColumns = _.where(table.columns, {linkColor: linkColor});
            // }

            var self = this;
            //apply column orderMapping to all columns
            _.each(table.columns, function(column) {
                self.applyCellOrderMapping(column, orderMapping);
            });
        };

        //get an order map as an array of indices
        this.getSortMapping = function(column, ascending) {
            var unsortedCells = column.cells;
            //shallow copy the cells array
            var sortedCells = unsortedCells.slice();
            sortedCells.sort(sortFn);
            if(ascending === false) {
                sortedCells.reverse();
            }

            var orderMap = [];
            for(var i in unsortedCells) {
                var dataIndex = sortedCells.indexOf(unsortedCells[i]);
                orderMap.push(dataIndex);
            }
            return orderMap;
        };

        //reorder the cells according to
        this.applyCellOrderMapping = function(column, mapping) {
            if(mapping.length !== column.cells.length) {
                console.log('sort service::applyCellOrderMapping - incompatible data lengths');
                return;
            }

            //copy the cell values into a new array
            var oldCellValues = _.map(column.cells, function(cell) {
                return cell.value.copy();
            });
            for(var i in mapping) {
                //apply with setValue to hit the notify
                column.cells[mapping[i]].setValue(oldCellValues[i]);
            }
        };

        //sort function for cells
        function sortFn(a, b) {
            var aNaN = mt.common.isEmptyString(a.getValue()) || isNaN(a.getValue());
            var bNaN = mt.common.isEmptyString(b.getValue()) || isNaN(b.getValue());
            if (aNaN && bNaN) {
                var aComp = a.getValue().toUpperCase();
                var bComp = b.getValue().toUpperCase();
                if (aComp < bComp) {
                    return -1;
                }
                if (aComp > bComp) {
                    return 1;
                }

                // case-insensitive values are equal here, compare by case for consistent sorting
                aComp = a.getValue();
                bComp = b.getValue();
                if (aComp < bComp) {
                    return -1;
                }
                if (aComp > bComp) {
                    return 1;
                }

                return 0;
            }
            if (aNaN) {
                return 1;
            }
            if (bNaN) {
                return -1;
            }
            return parseFloat(a.getValue()) - parseFloat(b.getValue());
        }
    });
})(window.mt.table);

(function (ns) {
    'use strict';

    angular.module('mtTable').service('tableUserService', function () {

        //return the user id for this client - eventually this can calculate
        this.getUserId = function () {
            return 1;
        };

        //the following code will eventually live on or call out to the collaboration server
        var userMap = {};

        //get the color associated with the userId
        this.getUserColor = function(id) {
            return userMap[id];
        };

        //registerUser
        this.registerUser =  function(id) {
            if(userMap[id] === undefined) {
                var color = getNextUserColor();
                if(color === undefined) {
                    console.log('max number of users already registered');
                } else {
                    userMap[id] = color;
                }
            }
        };

        function getIdFromColor(color) {
            var id;
            for(var curId in userMap) {
                if(userMap[curId] === color) {
                    id = curId;
                }
            }
            return id;
        }

        function getNextUserColor() {
            var col;
            for(var i in ns.USER_COLORS) {
                var curCol = ns.USER_COLORS[i];
                if(getIdFromColor(curCol) === undefined) {
                    col = curCol;
                    break;
                }
            }
            return col;
        }

        //register the current user on startup
        this.registerUser(this.getUserId());
    });

})(window.mt.table);

angular.module('mtTable').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/cellSelectorHandleTemplate.html',
    "<div class=\"mt-selector-handle mt-{{handle}}\" ng-show=show hm-dragstart=dragStart(handle) hm-drag=\"drag($event, handle)\" hm-dragend=dragEnd(handle)><div class=mt-grip></div></div>"
  );


  $templateCache.put('templates/cellSelectorTemplate.html',
    "<div class=\"mt-cell-selector mt-active-tool-only\" ng-show=selectionApi.show ng-style=\"{width: model.width, height: model.height, top: model.top, left: model.left}\"><mt-cell-selector-handle show=model.handles.nw handle=nw dragstart=dragHandleStart drag=dragHandle dragend=dragHandleEnd></mt-cell-selector-handle><mt-cell-selector-handle show=model.handles.n handle=n dragstart=dragHandleStart drag=dragHandle dragend=dragHandleEnd></mt-cell-selector-handle><mt-cell-selector-handle show=model.handles.ne handle=ne dragstart=dragHandleStart drag=dragHandle dragend=dragHandleEnd></mt-cell-selector-handle><mt-cell-selector-handle show=model.handles.e handle=e dragstart=dragHandleStart drag=dragHandle dragend=dragHandleEnd></mt-cell-selector-handle><mt-cell-selector-handle show=model.handles.se handle=se dragstart=dragHandleStart drag=dragHandle dragend=dragHandleEnd></mt-cell-selector-handle><mt-cell-selector-handle show=model.handles.s handle=s dragstart=dragHandleStart drag=dragHandle dragend=dragHandleEnd></mt-cell-selector-handle><mt-cell-selector-handle show=model.handles.sw handle=sw dragstart=dragHandleStart drag=dragHandle dragend=dragHandleEnd></mt-cell-selector-handle><mt-cell-selector-handle show=model.handles.w handle=w dragstart=dragHandleStart drag=dragHandle dragend=dragHandleEnd></mt-cell-selector-handle></div>"
  );


  $templateCache.put('templates/controlsTemplate.html',
    "<div modal=controlsOpen class=mt-controls-dialog><div class=modal-header><h3>Table Controls</h3></div><div class=modal-body><div class=mt-controls-cell-left>Set Decimal Place:</div><div class=mt-controls-cell-right><mt-input keypad=keypad model=precisionPlace class=\"mt-precision-place-input mt-controls-input\" placeholder=decimal></mt-input><button class=\"mt-precision-place-go btn mt-controls-button\" ng-click=setPrecision(precisionPlace.value)>Set</button></div><div class=row-fluid><h4>Row and Column Operations</h4></div><div class=row-fluid><div class=row-fluid><div class=mt-controls-cell-left>Add Row At:</div><div class=mt-controls-cell-right><mt-input keypad=keypad model=newRowIndex class=mt-controls-input placeholder=index required></mt-input><button ng-click=addRow(newRowIndex.value) class=\"btn mt-controls-button\">Go!</button></div></div><div class=row-fluid><div class=mt-controls-cell-left>Add Column At:</div><div class=mt-controls-cell-right><mt-input keypad=keypad model=newColIndex class=\"mt-controls-input mt-new-column-index-input\" placeholder=index required></mt-input><button class=\"mt-new-column-button btn mt-controls-button\" ng-click=addColumn(newColIndex.value)>Go!</button></div></div><div class=row-fluid><div class=mt-controls-cell-left>Column Arithmetic Mean:</div><div class=mt-controls-cell-right><mt-input keypad=keypad model=arithmeticMeanIndex class=\"mt-column-arithmetic-mean-input mt-controls-input\" placeholder=index required></mt-input><button class=\"mt-column-arithmetic-mean-go btn mt-controls-button\" ng-click=arithmeticMean(arithmeticMeanIndex.value)>Go!</button></div></div><div class=row-fluid><div class=mt-controls-cell-left>Column Geometric Mean:</div><div class=mt-controls-cell-right><mt-input keypad=keypad model=geometricMeanIndex class=\"mt-column-geometric-mean-input mt-controls-input\" placeholder=index required></mt-input><button class=\"mt-column-geometric-mean-go btn mt-controls-button\" ng-click=geometricMean(geometricMeanIndex.value)>Go!</button></div></div></div><div class=row-fluid><h4>Table Operations</h4></div><div class=row-fluid><button ng-click=toggleHeaders() class=\"mt-temp-ui mt-show-hide-headers btn mt-controls-button\">Toggle Headers</button> <button ng-click=toggleUpperHeaders() class=\"mt-temp-ui mt-show-hideUpper-headers btn mt-controls-button\">Toggle Upper Headers</button></div><div class=row-fluid><button ng-click=exportToGraph() class=\"mt-temp-ui mt-export-to-graph btn mt-controls-button\">Export To Graph</button> <button ng-click=linkToGraph() class=\"mt-temp-ui mt-id-link-button mt-link-to-graph btn mt-controls-button\">Link To Graph</button> <button ng-click=unlink() class=\"mt-temp-ui mt-id-unlink-button mt-unlink btn mt-controls-button\">Unlink</button></div><div class=row-fluid><button ng-click=openFillMenu(true) class=\"mt-temp-ui mt-show-fill-menu btn mt-controls-button\">Fill</button> <button ng-click=clearLinks() class=\"mt-temp-ui mt-clear-links-button btn mt-controls-button\">Clear Column Links</button></div></div><div class=modal-footer><button class=\"btn btn-warning mt-cancel mt-cancel-controls-button\" ng-click=openControls(false)>Cancel</button></div></div>"
  );


  $templateCache.put('templates/fillErrorTemplate.html',
    "<div modal=isFillErrorOpen><div><div class=modal-header><h4>Error</h4></div><div class=\"modal-body mt-fill-error-message\">{{fillMenuErrorMessage}}</div><div class=modal-footer><button ng-click=openFillError(false) class=\"btn btn-warning mt-cancel mt-continue-fill-error-button\">Continue</button></div></div></div>"
  );


  $templateCache.put('templates/fillMenuTemplate.html',
    "<div modal=isFillMenuOpen><div><div class=modal-header><h3>Fill Menu {{fillMenu.ErrorMessage}}</h3></div><div class=modal-body><form id=fillForm ng-submit=fillAction()><div class=\"row-fluid mt-control-group mt-radio-buttons\"><div class=\"row-fluid mt-controls-row\"><label class=\"radio inline\"><b>Fill Direction:</b></label><label class=\"radio inline\"><input class=\"mt-radio-buttons mt-up-fill-radio required\" name=FillDirection type=radio value=up ng-model=fillDirection> {{fillMenu.upLabel}}</label><label class=\"radio inline\"><input class=\"mt-radio-buttons mt-down-fill-radio\" name=FillDirection type=radio value=down checked ng-model=fillDirection> {{fillMenu.downLabel}}</label></div><div class=\"row-fluid mt-control-elements-row\"><div class=mt-controls-cell-left>Starting Cell Row:</div><mt-input name=FillStartingCellRow keypad=keypad model=fillStartCellRow class=\"mt-row-fill-input mt-controls-input\" placeholder=index required readonly></mt-input></div><div class=\"row-fluid mt-control-elements-row\"><div class=mt-controls-cell-left>Starting Cell Column:</div><mt-input name=FillStartingCellColumn keypad=keypad model=fillStartCellColumn class=\"mt-col-fill-input mt-controls-input\" placeholder=index required readonly></mt-input></div><div class=\"row-fluid mt-control-elements-row\"><div class=mt-controls-cell-left>Starting Value:</div><mt-input name=FillStartingValue keypad=keypad model=fillStartValue class=\"mt-start-fill-input mt-controls-input\" placeholder=index required readonly></mt-input></div><br><div class=\"row-fluid mt-control-group mt-radio-buttons\"><div class=\"row-fluid mt-controls-row\"><label class=\"radio inline\"><b>Fill Operator:</b></label><label class=\"radio inline\"><input class=\"mt-radio-buttons mt-add-fill-radio\" name=FillOperator type=radio value=add ng-model=fillOperator checked> Add</label><label class=\"radio inline\"><input class=\"mt-radio-buttons mt-subtract-fill-radio\" name=FillOperator type=radio value=subtract ng-model=fillOperator> Subtract</label><label class=\"radio inline\"><input class=\"mt-radio-buttons mt-multiply-fill-radio\" name=FillOperator type=radio value=multiply ng-model=fillOperator> Multiply</label><label class=\"radio inline\"><input class=\"mt-radio-buttons mt-divide-fill-radio\" name=FillOperator type=radio value=divide ng-model=fillOperator> Divide</label></div><div class=\"row-fluid mt-control-elements-row\"><div class=\"mt-controls-cell-left mt-control-elements-row\">Interval Amount:</div><mt-input name=FillInterval keypad=keypad model=fillInterval class=\"mt-interval-fill-input mt-controls-input\" placeholder=index required readonly></mt-input></div><br><div class=\"row-fluid mt-controls-row\"><label class=\"radio inline\"><b>Apply Range to:</b></label><label class=\"radio inline\"><input class=\"mt-radio-buttons vmt-alue-fill-radio\" name=FillRangeType type=radio value=value checked ng-model=fillRangeType> Value</label><label class=\"radio inline\"><input class=\"mt-radio-buttons mt-cells-fill-radio\" name=FillRangeType type=radio value=cells ng-model=fillRangeType> Cells</label></div><div class=\"row-fluid mt-control-elements-row\"><div class=mt-controls-cell-left>Range Amount:</div><mt-input name=FillRange keypad=keypad model=fillRange class=\"mt-range-fill-input mt-controls-input\" placeholder=index required readonly></mt-input></div></div></div></form></div><div class=modal-footer><input form=fillForm type=submit class=\"btn btn-primary mt-ok mt-ok-fill-button\" value=\"Fill\"> <button class=\"btn btn-warning mt-cancel mt-cancel-fill-button\" ng-click=openFillMenu(false)>Cancel</button></div></div></div>"
  );


  $templateCache.put('templates/fillWarningTemplate.html',
    "<div modal=isFillWarningOpen><div><div class=modal-header><h4>Warning</h4></div><div class=\"modal-body mt-fill-warning-message\">{{fillWarning.warningMessage}}</div><div class=modal-footer><button ng-click=dismissFillWarning() class=\"btn btn-primary mt-ok mt-continue-fill-warning-button\">Continue</button> <button ng-click=openFillWarning(false) class=\"btn btn-warning mt-cancel mt-cancel-fill-warning-button\">Cancel</button></div></div></div>"
  );


  $templateCache.put('templates/gridToolTemplate.html',
    "<div class=mt-grid-tool-container><div class=mt-main-content><mt-table-controls></mt-table-controls><mt-new-table-grid grid-id=v tool-id=toolId container-api=containerApi role=role controls-open=controlsOpen last-sort-index=lastSortIndex last-sort-dir=lastSortDir></mt-new-table-grid></div></div>"
  );


  $templateCache.put('templates/mtCellTemplate.html',
    "<div><div class=mt-cell ng-class=\"{'mt-locked-cell': model.locked, 'mt-aggregate-new': model.isAggregateNew}\" hm-tap=tap() hm-hold=hold($event)><div class=mt-cell-display ng-hide=model.isEditing hm-hold=hold()><span class=mathquill-embedded-latex></span></div><input class=mt-cell-input ng-model=model.value.editText ng-show=model.isEditing ng-change=change() ng-blur=blur()></div></div>"
  );


  $templateCache.put('templates/mtColumnTemplate.html',
    "<div class=mt-column-wrapper><div class=mt-column ng-hide=model.isHidden ng-style=\"{width: model.width}\"><div class=\"mt-header-cell-container mt-header{{colIndex}}\" hm-tap=onHeaderTap($event) ng-show=headerVisible><div class=\"mt-column-link-label mt-link-label{{colIndex}}\" ng-style=\"{'background-color': model.linkColor}\"></div><div class=mt-axis-labels><div class=\"mt-axis-label mt-x-axis\" ng-show=model.isXAxis>x</div><div class=\"mt-axis-label mt-y-axis\" ng-show=model.isYAxis>y</div></div><mt-cell class=mt-header-cell model=model.header></mt-cell></div><mt-cell ng-repeat=\"cell in model.cells\" class=\"mt-table-cell mt-cell{{colIndex}}_{{$index}}\" ng-class=\"{'mt-last-cell-in-column': $last}\" model=cell></mt-cell></div><div class=\"mt-column mt-dependent-column\" ng-if=model.dependentColumn><mt-cell class=mt-header-cell model=model.dependentColumn.header ng-show=headerVisible></mt-cell><div class=mt-dependent-column-spacer></div><mt-cell ng-repeat=\"cell in model.dependentColumn.cells\" class=\"mt-table-cell mt-dependent-cell{{colIndex}}_{{$index}}\" ng-class=\"{'mt-last-cell-in-column': $last}\" model=cell></mt-cell><div class=mt-dependent-column-completer></div></div></div>"
  );


  $templateCache.put('templates/mtContingencyTableTemplate.html',
    "<div class=mt-contingency-table><div class=mt-correctness-indicator ng-if=showCorrectness ng-switch on=isCorrect()><div class=\"mt-incorrect-indicator alert alert-error\" ng-switch-when=false>Your answer is incorrect. Try again.</div><div class=\"mt-correct-indicator alert alert-success\" ng-switch-when=true>Your answer is correct.</div><div class=\"mt-incomplete-indicator alert alert-info\" ng-switch-default>Your answer is incomplete.</div></div><mt-table-tool></mt-table-tool></div>"
  );


  $templateCache.put('templates/mtNewTableGridTemplate.html',
    "<div class=mt-table-grid ng-style=getTableStyle()><div class=mt-test-tl-corner></div><div class=mt-table-frame><div class=\"mt-selector-bars mt-active-tool-only\"><mt-selector-bar row=true api=selectorBarApi></mt-selector-bar><div class=mt-row-selector-bar-selection ng-show=rowIsSelected() hm-tap=clickRowSelectorBar($event) ng-style=getRowSelectionStyle()><div class=mt-grip></div></div><mt-selector-bar row=false api=selectorBarApi></mt-selector-bar><div class=mt-column-selector-bar-selection ng-show=columnIsSelected() hm-tap=clickColumnSelectorBar($event) ng-style=getColumnSelectionStyle()><div class=mt-grip></div></div></div><div class=mt-upper-header-block><div class=mt-upper-header ng-show=\"upperHeadersVisible && (!$last || !styleService.hideResults)\" ng-repeat=\"c in [] | range:gridConfig.getAggregateColumnHeaders().length\"><mt-new-table-upper-header lock-mode={{containerApi.locking}}></mt-new-table-upper-header></div></div><div class=mt-table-block mt-sortable mt-sort-begin=sortStart mt-sort-end=sortStop><mt-new-table-column ng-repeat=\"c in [] | range:gridConfig.numColumns()\" ng-show=\"(!$last || !styleService.hideResults)\"></mt-new-table-column></div></div><br><div class=mt-submit-table ng-show=submitActive><button ng-click=onResultSubmit() class=\"mt-submit-table-result btn btn-success\">Submit Results</button></div><mt-cell-selector model=cellSelectorModel></mt-cell-selector><mt-table-fill-menu></mt-table-fill-menu><mt-table-fill-warning></mt-table-fill-warning><mt-table-fill-error></mt-table-fill-error><mt-link-indicator eventineer=eventineer class=mt-table-link-indicator></mt-link-indicator></div>"
  );


  $templateCache.put('templates/mtRatioBoxTemplate.html',
    "<div class=mt-ratio-box-wrapped><div class=mt-ratio-box ng-style=getMarginStyle()><mt-ratio-box-grid></mt-ratio-box-grid><div class=mt-n-container><mt-ratio-box-equation settings=settings equation=\"equations['N']\" select-equation=selectEquation></mt-ratio-box-equation><mt-ratio-box-column-header ng-repeat=\"c in [0,1]\" ng-if=settings.showColumnHeaders></mt-ratio-box-column-header></div><div class=mt-s-container><mt-ratio-box-equation settings=settings equation=\"equations['S']\" select-equation=selectEquation></mt-ratio-box-equation></div><div class=mt-e-container><mt-ratio-box-equation settings=settings equation=\"equations['E']\" select-equation=selectEquation></mt-ratio-box-equation><div class=mt-rb-row-header-col ng-if=settings.showRowHeaders><mt-ratio-box-row-header ng-repeat=\"r in [0,1]\"></mt-ratio-box-row-header></div></div><div class=mt-w-container><mt-ratio-box-equation settings=settings equation=\"equations['W']\" select-equation=selectEquation></mt-ratio-box-equation></div><div class=mt-correctness-indicator ng-switch on=isCorrect()><div class=\"mt-incorrect-indicator alert alert-error\" ng-switch-when=false><i class=icon-remove><span>Your answer is incorrect. Try again.</span></i></div><div class=\"mt-correct-indicator alert alert-success\" ng-switch-when=true><i class=icon-ok><span>Your answer is correct.</span></i></div><div class=\"mt-incomplete-indicator alert alert-info\" ng-switch-default><i class=icon-minus><span>Your answer is incomplete.</span></i></div></div></div></div>"
  );


  $templateCache.put('templates/mtTableControlsTemplate.html',
    "<div modal=controlsOpen class=mt-controls-dialog><div class=modal-header><h3>Table Controls</h3></div><div class=modal-body><div class=mt-controls-cell-left>Set Decimal Place:</div><div class=mt-controls-cell-right><mt-input keypad=keypad model=controls.precisionPlace class=\"mt-precision-place-input mt-controls-input\" placeholder=decimal></mt-input><button class=\"mt-precision-place-go btn mt-controls-button\" ng-click=controls.setPrecision(controls.precisionPlace.value)>Set</button></div><div class=row-fluid><h4>Row and Column Operations</h4></div><div class=row-fluid><div class=row-fluid><div class=mt-controls-cell-left>Column Arithmetic Mean:</div><div class=mt-controls-cell-right><mt-input keypad=keypad model=controls.arithmeticMeanIndex class=\"mt-column-arithmetic-mean-input mt-controls-input\" placeholder=index required></mt-input><button class=\"mt-column-arithmetic-mean-go btn mt-controls-button\" ng-click=controls.columnArithmeticMean(controls.arithmeticMeanIndex.value)>Go!</button></div></div><div class=row-fluid><div class=mt-controls-cell-left>Column Geometric Mean:</div><div class=mt-controls-cell-right><mt-input keypad=keypad model=controls.geometricMeanIndex class=\"mt-column-geometric-mean-input mt-controls-input\" placeholder=index required></mt-input><button class=\"mt-column-geometric-mean-go btn mt-controls-button\" ng-click=controls.columnGeometricMean(controls.geometricMeanIndex.value)>Go!</button></div></div></div><div class=row-fluid><h4>Table Operations</h4></div><div class=row-fluid><button ng-click=controls.toggleHeaders() class=\"mt-temp-ui mt-show-hide-headers btn mt-controls-button\">Toggle Headers</button> <button ng-click=controls.toggleUpperHeaders() class=\"mt-temp-ui mt-show-hide-upper-headers btn mt-controls-button\">Toggle Upper Headers</button></div><div class=row-fluid><button ng-click=controls.openFillMenu() class=\"mt-temp-ui mt-show-fill-menu btn mt-controls-button\">Fill</button> <button ng-click=controls.clearLinks() class=\"mt-temp-ui mt-clear-links-button btn mt-controls-button\">Clear Column Links</button></div></div><div class=modal-footer><button class=\"btn btn-warning mt-cancel mt-cancel-controls-button\" ng-click=controls.close()>Cancel</button></div></div>"
  );


  $templateCache.put('templates/mtTableControlsTemplate.html.save.html',
    "<div modal=controlsOpen class=mt-controls-dialog><div class=modal-header><h3>Table Controls</h3></div><div class=modal-body><div class=mt-controls-cell-left>Set Decimal Place:</div><div class=mt-controls-cell-right><mt-input keypad=keypad model=controls.precisionPlace class=\"mt-precision-place-input mt-controls-input\" placeholder=decimal></mt-input><button class=\"mt-precision-place-go btn mt-controls-button\" ng-click=controls.setPrecision(controls.precisionPlace.value)>Set</button></div><div class=row-fluid><h4>Row and Column Operations</h4></div><div class=row-fluid><div class=row-fluid><div class=mt-controls-cell-left>Column Arithmetic Mean:</div><div class=mt-controls-cell-right><mt-input keypad=keypad model=controls.arithmeticMeanIndex class=\"mt-column-arithmetic-mean-input mt-controls-input\" placeholder=index required></mt-input><button class=\"mt-column-arithmetic-mean-go btn mt-controls-button\" ng-click=controls.columnArithmeticMean(controls.arithmeticMeanIndex.value)>Go!</button></div></div><div class=row-fluid><div class=mt-controls-cell-left>Column Geometric Mean:</div><div class=mt-controls-cell-right><mt-input keypad=keypad model=controls.geometricMeanIndex class=\"mt-column-geometric-mean-input mt-controls-input\" placeholder=index required></mt-input><button class=\"mt-column-geometric-mean-go btn mt-controls-button\" ng-click=controls.columnGeometricMean(controls.geometricMeanIndex.value)>Go!</button></div></div></div><div class=row-fluid><h4>Table Operations</h4></div><div class=row-fluid><button ng-click=controls.toggleHeaders() class=\"mt-temp-ui mt-show-hide-headers btn mt-controls-button\">Toggle Headers</button> <button ng-click=controls.toggleUpperHeaders() class=\"mt-temp-ui mt-show-hideUpper-headers btn mt-controls-button\">Toggle Upper Headers</button></div><div class=row-fluid><button ng-click=controls.linkToGraph() class=\"mt-temp-ui mt-id-link-button mt-link-to-graph btn mt-controls-button\">Link To Graph</button> <button ng-click=controls.unlink() class=\"mt-temp-ui mt-id-unlink-button mt-unlink btn mt-controls-button\">Unlink</button></div><div class=row-fluid><button ng-click=controls.openFillMenu() class=\"mt-temp-ui mt-show-fill-menu btn mt-controls-button\">Fill</button> <button ng-click=controls.clearLinks() class=\"mt-temp-ui mt-clear-links-button btn mt-controls-button\">Clear Column Links</button></div></div><div class=modal-footer><button class=\"btn btn-warning mt-cancel mt-cancel-controls-button\" ng-click=controls.close()>Cancel</button></div></div>"
  );


  $templateCache.put('templates/mtTableFillErrorTemplate.html',
    "<div modal=controls.isFillErrorOpen><div><div class=modal-header><h4>Error</h4></div><div class=\"modal-body mt-fill-error-message\">{{controls.fillMenuErrorMessage}}</div><div class=modal-footer><button ng-click=controls.closeFillError() class=\"btn btn-warning mt-cancel mt-continue-fill-error-button\">Continue</button></div></div></div>"
  );


  $templateCache.put('templates/mtTableFillMenuTemplate.html',
    "<div modal=controls.isFillMenuOpen><div><div class=modal-header><h3>Fill Menu</h3></div><div class=modal-body><form id=fillForm ng-submit=controls.fillAction()><div class=\"row-fluid control-group mt-radio-buttons\"><div class=\"row-fluid mt-controls-row\"><label class=\"radio inline\"><b>Fill Direction:</b></label><label class=\"radio inline\"><input class=\"mt-radio-buttons mt-up-fill-radio required\" name=FillDirection type=radio value=up ng-model=controls.fillSettings.fillDirection> Up</label><label class=\"radio inline\"><input class=\"mt-radio-buttons mt-down-fill-radio\" name=FillDirection type=radio value=down checked ng-model=controls.fillSettings.fillDirection> Down</label></div><div class=\"row-fluid mt-control-elements-row\"><div class=mt-controls-cell-left>Starting Cell Row:</div><mt-input name=FillStartingCellRow keypad=keypad model=controls.fillSettings.fillStartCellRow class=\"mt-row-fill-input mt-controls-input\" placeholder=index required readonly></mt-input></div><div class=\"row-fluid mt-control-elements-row\"><div class=mt-controls-cell-left>Starting Cell Column:</div><mt-input name=FillStartingCellColumn keypad=keypad model=controls.fillSettings.fillStartCellColumn class=\"mt-col-fill-input mt-controls-input\" placeholder=index required readonly></mt-input></div><div class=\"row-fluid mt-control-elements-row\"><div class=mt-controls-cell-left>Starting Value:</div><mt-input name=FillStartingValue keypad=keypad model=controls.fillSettings.fillStartValue class=\"mt-start-fill-input mt-controls-input\" placeholder=index required readonly></mt-input></div><br><div class=\"row-fluid control-group mt-radio-buttons\"><div class=\"row-fluid mt-controls-row\"><label class=\"radio inline\"><b>Fill Operator:</b></label><label class=\"radio inline\"><input class=\"mt-radio-buttons mt-add-fill-radio\" name=FillOperator type=radio value=add ng-model=controls.fillSettings.fillOperator checked> Add</label><label class=\"radio inline\"><input class=\"mt-radio-buttons mt-subtract-fill-radio\" name=FillOperator type=radio value=subtract ng-model=controls.fillSettings.fillOperator> Subtract</label><label class=\"radio inline\"><input class=\"mt-radio-buttons mt-multiply-fill-radio\" name=FillOperator type=radio value=multiply ng-model=controls.fillSettings.fillOperator> Multiply</label><label class=\"radio inline\"><input class=\"mt-radio-buttons mt-divide-fill-radio\" name=FillOperator type=radio value=divide ng-model=controls.fillSettings.fillOperator> Divide</label></div><div class=\"row-fluid mt-control-elements-row\"><div class=\"mt-controls-cell-left mt-control-elements-row\">Interval Amount:</div><mt-input name=FillInterval keypad=keypad model=controls.fillSettings.fillInterval class=\"mt-interval-fill-input mt-controls-input\" placeholder=index required readonly></mt-input></div><br><div class=\"row-fluid mt-controls-row\"><label class=\"radio inline\"><b>Apply Range to:</b></label><label class=\"radio inline\"><input class=\"mt-radio-buttons mt-value-fill-radio\" name=FillRangeType type=radio value=value checked ng-model=controls.fillSettings.fillRangeType> Value</label><label class=\"radio inline\"><input class=\"mt-radio-buttons mt-cells-fill-radio\" name=FillRangeType type=radio value=cells ng-model=controls.fillSettings.fillRangeType> Cells</label></div><div class=\"row-fluid mt-control-elements-row\"><div class=mt-controls-cell-left>Range Amount:</div><mt-input name=FillRange keypad=keypad model=controls.fillSettings.fillRange class=\"mt-range-fill-input mt-controls-input\" placeholder=index required readonly></mt-input></div></div></div></form></div><div class=modal-footer><input form=fillForm type=submit class=\"btn btn-primary mt-ok mt-ok-fill-button\" value=\"Fill\"> <button class=\"btn btn-warning mt-cancel mt-cancel-fill-button\" ng-click=controls.closeFillMenu()>Cancel</button></div></div></div>"
  );


  $templateCache.put('templates/mtTableFillWarningTemplate.html',
    "<div modal=controls.isFillWarningOpen><div><div class=modal-header><h4>Warning</h4></div><div class=\"modal-body mt-fill-warning-message\">{{controls.fillMenuWarningMessage}}</div><div class=modal-footer><button ng-click=controls.dismissFillWarning() class=\"btn btn-primary mt-ok mt-continue-fill-warning-button\">Continue</button> <button ng-click=controls.closeFillWarning() class=\"btn btn-warning mt-cancel mt-cancel-fill-warning-button\">Cancel</button></div></div></div>"
  );


  $templateCache.put('templates/mtTableToolTemplate.html',
    "<div class=mt-table hm-tap=onTableTap()><div class=mt-table-frame><div class=mt-submit-table ng-show=submitActive><button ng-click=onResultSubmit() class=\"mt-submit-table-result btn btn-success\">Submit Results</button></div><mt-cell-selector ng-hide=selectionApi.isDisabled selection-api=selectionApi table=model></mt-cell-selector><div class=\"mt-selector-bars mt-active-tool-only\" ng-hide=selectionApi.isDisabled><mt-selector-bar row=true table=model selection-api=selectionApi update-fn=updateFn></mt-selector-bar><mt-selector-bar row=false table=model selection-api=selectionApi update-fn=updateFn></mt-selector-bar></div><div class=\"mt-row-header-block mt-column\" ng-show=model.rowHeadersVisible><mt-cell class=\"mt-header-cell mt-header-placeholder\" model=headerPlaceholder></mt-cell><mt-cell ng-repeat=\"rowHeader in getRowHeaders()\" class=\"mt-row-header mt-row-header{{$index}}\" ng-class=\"{'mt-last-cell-in-column': $last}\" model=rowHeader></mt-cell></div><div class=mt-upper-header-block ng-show=model.upperHeadersVisible><mt-cell ng-repeat=\"headerDef in upperHeaderDefinitions\" ng-style=getUpperHeaderStyle(headerDef) class=\"mt-upper-header-cell mt-upper-header{{$index}}\" model=headerDef.value></mt-cell></div><mt-column ng-repeat=\"column in model.columns | filter:{isHidden:false}\" ng-class=\"{'mt-last-column-wrapper': $last}\" model=column header-visible=model.headersVisible col-index=$index></mt-column></div><div ng-controller=TableControlsCtrl><mt-table-controls></mt-table-controls><mt-table-fill-menu></mt-table-fill-menu><mt-table-fill-warning></mt-table-fill-warning><mt-table-fill-error></mt-table-fill-error></div></div>"
  );


  $templateCache.put('templates/selectorBarTemplate.html',
    "<div><div ng-class=\"{'mt-grid-row-selector-bar': row, 'mt-grid-column-selector-bar': !row}\"><div class=mt-selector-bar-parts><div class=mt-selector-bar-part ng-repeat=\"c in [] | range:getNumParts()\" ng-style=getSelectorPartStyle($index) hm-tap=clickSelectorBar($index)></div></div><div class=mt-selector-handle-drag-area></div><div class=mt-selector-bar-handle hm-drag=drag($event) hm-dragend=dragEnd($event) hm-tap=clickSelectorHandle()></div></div><div class=mt-drag-area ng-class=\"{'mt-row-drag-area': row, 'mt-col-drag-area': !row}\"></div><div ng-class=\"{'mt-row-selector-bar-selection': row, 'mt-column-selector-bar-selection': !row}\" ng-if=isSelected() hm-tap=clickSelectorBar() ng-style=getLccSelectionStyle()><div class=mt-grip hm-drag=resizeDrag($event) hm-dragend=resizeDragEnd()></div></div></div>"
  );

}]);
