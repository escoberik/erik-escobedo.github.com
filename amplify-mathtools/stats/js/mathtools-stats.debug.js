(function () {
    'use strict';

    if (!window.mt) {
        window.mt = {};
    }

    if (!window.mt.stats) {
        window.mt.stats = {};
    }

    angular.module('mtStats', ['mt.common', 'ui.bootstrap'])
        .config(function (toolRegistryServiceProvider) {
            var template = {
                id: 'statsToolbarItem',
                type: mt.common.TYPE_STATS,
                displayName: 'Statistics',
                available: true,
                htmlTemplate: '<mt-stats-tool tool-id="toolId" container-api="containerApi" id="tool-{{toolId}}"></mt-stats-tool>'
            };
            toolRegistryServiceProvider.addTemplate(template);

            template = {
                id: 'statsGraph',
                type: mt.common.TYPE_STATS_GRAPH,
                displayName: 'Statistics Graph',
                available: false,
                htmlTemplate: '<mt-stats-graph tool-id="toolId" container-api="containerApi" id="tool-{{toolId}}"></mt-stats-graph>'
            };
            toolRegistryServiceProvider.addTemplate(template);

            template = {
                id: 'probabilityTool',
                type: mt.common.TYPE_PROBABILITY_TOOL,
                displayName: 'Probability Tool',
                available: false,
                htmlTemplate:'<mt-probs-tools tool-id="toolId" container-api="containerApi" id="tool-{{toolId}}"></mt-probs-tools>'
            };
            toolRegistryServiceProvider.addTemplate(template);

            template = {
                id: 'dataSampler',
                type: mt.common.TYPE_DATA_SAMPLER,
                displayName: 'Data Sampler',
                available: false,
                htmlTemplate:'<mt-data-sampler tool-id="toolId" container-api="containerApi" id="tool-{{toolId}}"></mt-data-sampler>'
            };
            toolRegistryServiceProvider.addTemplate(template);

        });
    window.mt.loadModules.push('mtStats');
})();



(function (ns) {
    'use strict';

    ns.AttributeValues = (function () {

        function AttributeValues(attributeHeader, colorDispenser) {
            if (!(this instanceof AttributeValues)) {
                return new AttributeValues();
            }

            this.reset = function() {
                var av = this;

                _(_(av.distinctValues).keys().reverse()).each(function(key) {
                    if(av.distinctValues[key].color!==undefined) {
                        colorDispenser.stash(av.distinctValues[key].color);
                    }
                });
                av.distinctValues = {};
                av.sortedCategories = [];

                _(av.attributeHeader.caseData.cases).each(function (c, i) {
                    var val = c.attributes[av.attributeHeader.display];
                    av.put(val);
                });

            };

            this.put = function(val) {
                if(val) {
                    val = cleanVal(val, this.attributeHeader.type);
                    if (this.distinctValues[val] !== undefined) {
                        this.distinctValues[val].count += 1;
                    }
                    else {
                        var color;
                        var colorObj = {color: color, count: 1};
                        this.distinctValues[val] = colorObj;
                        if (this.attributeHeader.type === ns.STATS_FIELD_TYPE_CATEGORICAL) {
                            colorObj.color = colorDispenser.next();
                            this.topColors = calcTopColors(this.distinctValues);
                        }
                    }
                }
            };

            this.setType = function(newType) {
                var av = this;
                if (newType === ns.STATS_FIELD_TYPE_CATEGORICAL) {
                    var keys = _(av.distinctValues).keys();
                    _(keys).each(function(dv, i) {
                        var colorObj = av.distinctValues[dv];
                        if(colorObj.color === undefined) {
                            colorObj.color = colorDispenser.next();
                        }
                    });
                    av.topColors = calcTopColors(av.distinctValues);
                }
            };

            function cleanVal(val, type) {
                var retval = val;
                if (type === ns.STATS_FIELD_TYPE_CATEGORICAL) {
                    if (val) {
                        retval = val.toString().trim();
                    }
                    else {
                        retval = '';
                    }
                }
                return retval;
            }

            function calcTopColors(vals) {
                var colors = _.map(vals, function(v) {
                    return v;
                });
                colors = _.sortBy(colors, 'count').reverse();

                var retval = _.map(colors, function(w) {
                    return w.color;
                });
                if(retval.length > 4) {
                    retval = retval.slice(0, 4);
                }
                return retval;
            }

            this.getColor = function(caseObj) {
                var val = cleanVal(caseObj.attributes[this.attributeHeader.display], this.attributeHeader.type);
                var entry = this.distinctValues[val];
                if(entry) {
                    return entry.color;
                }
            };

            this.sortCategories = function(range) {
                this.sortedCategories = [];
                if(range) {
                    for(var i = 0; i < range.length; i++) {
                        var elem = range[i];
                        for(var j = 0; j < elem.length; j++) {
                            this.sortedCategories.push({
                                name: elem[j],
                                color: this.distinctValues[elem[j]].color
                            });
                        }
                    }
                }
                else {
                    _.each(this.distinctValues, function (value, key) {
                        this.sortedCategories.push({
                            name: key,
                            color: value.color
                        });
                    }, this);
                }
            };


            this.attributeHeader = attributeHeader;
            this.distinctValues = {};
            this.topColors = [];
            this.sortedCategories = [];

            AttributeValues.prototype.serialize = function() {
                var data = [ this.distinctValues, this.topColors, this.sortedCategories ];
                return data;
            };


        }

        return AttributeValues;
    })();

    mt.stats.AttributeValues.deserialize = function(data, attributeHeader, colorDispenser ) {

        var attributeValues = new mt.stats.AttributeValues( attributeHeader, colorDispenser );

        attributeValues.distinctValues = data[0];
        attributeValues.topColors = data[1];
        attributeValues.sortedCategories = data[2];

        return attributeValues;
    };

})(window.mt.stats);

(function (ns) {
    'use strict';

    ns.Case = (function () {

        function Case(index) {
            if (!(this instanceof Case)) {
                return new Case(index);
            }
            this.index = index;
            this.id = mt.common.createGuid();

            this.attributes = {};
            this.invalidAttributes = {};

            var clean = {};

            this.setClean = function(attribute, bool) {
                clean[attribute.display] = bool;
            };

            this.getClean = function(attribute) {
                return clean[attribute.display];
            };

            this.validateNumeric = function (attribute) {
                var val = this.attributes[attribute];
                if(val !== undefined && val.toString() !== undefined &&
                    (!(/^\s*\-?\d*(\.\d+)?\s*$/).test(val.toString()))) {
                    this.invalidAttributes[attribute] = true;
                } else {
                    this.invalidAttributes[attribute] = false;
                }
                return !this.invalidAttributes[attribute];
            };

            // Handles conversion of type when user changes column
            // type from/to numerical/categorical.  invalidAttributes
            // array is central to numeric data validation, but is
            // always false for categorical data since all data is valid
            this.validateCategorical = function (attribute) {
                var val = this.attributes[attribute];
                if(val !== undefined) {
                    if(!angular.isString(val)) {
                        this.attributes[attribute] = String(val);
                    }
                }
                else {
                    this.attributes[attribute] = '';
                }
                this.invalidAttributes[attribute] = false;
            };

            //graph render position - derived for each graph update
            this.renderPos = [0, 0];

            Case.prototype.serialize = function() {
                var caze = this;
                var data = [ caze.index, caze.id, caze.attributes, caze.invalidAttributes, caze.clean ];
                return data;
            };
        }

        return Case;
    })();

    mt.stats.Case.deserialize = function(data) {
        var caze = new mt.stats.Case( data[0] );

        caze.id = data[1];
        caze.attributes = data[2];
        caze.invalidAttributes = data[3];
        caze.clean = data[4];

        return caze;
    };

})(window.mt.stats);

(function (ns) {
    'use strict';

    ns.CaseData = (function () {

        function resetAttributeValues(caseData) {
            _(caseData.attributeHeaders).each(function (h) { h.attributeValues.reset();});
        }

        function CaseData() {
            if (!(this instanceof CaseData)) {
                return new CaseData();
            }

            CaseData.prototype.addAttribute = function(attributeName, attributeType, index) {
                console.log('adding attr: ', attributeName, attributeType, index);

                attributeName = attributeName.trim();
                if (_.find(this.attributeHeaders, function(h) {
                    return h.display === attributeName;
                })) {
                    return;
                }

                _.each(this.cases, function(c) {
                    c.attributes[attributeName] = undefined;
                });
                var next =  this.cases[0] !== undefined ? this.cases[0].attributes.length : 0;
                var colorRange = this.getColorRange(next);
                return this.addAttributeHeader(attributeName, attributeType, colorRange, index);
            };
            CaseData.prototype.addAttributeHeader = function(attr, type, colorRange, index) {
                return new mt.stats.AttributeHeader(this, attr, type, colorRange, index);
            };
            CaseData.prototype.addCase = function(index) {
                var newCase = new ns.Case(this.cases.length+1);
                if(index !== undefined) {
                    this.cases.splice(index, 0, newCase);
                } else {
                    this.cases.push(newCase);
                }

                _(this.attributeHeaders).each(function (attributeHeader) {
                    if(attributeHeader.getter!==undefined && typeof attributeHeader.getter === 'function') {
                        Object.defineProperty(newCase.attributes, attributeHeader.display, {
                            get: attributeHeader.getter().bind(newCase),
                            set: function() {}
                        });
                    }
                });
                return newCase;
            };
            CaseData.prototype.clear = function() {
                this.cases = [];
                this.attributeHeaders = [];
                this.categoricalColorDispenser = new ns.ColorDispenser(ns.COLORS_CATEGORICAL, false);
                this.numericColorDispenser = new ns.ColorDispenser(ns.COLORS_NUMERIC, true);
            };
            CaseData.prototype.serialize = function() {
                var caseData = this;

                var serializedCases = _.map( caseData.cases, function(c) { return c.serialize(); });
                var serializedAttributeHeaders = _.map( caseData.attributeHeaders, function(h) {return h.serialize(); });
                var data = {};

                data.display = caseData.display;
                data.type = caseData.type;
                data.cases = serializedCases;
                data.attributeHeaders = serializedAttributeHeaders;
                data.categoricalColorDispenser = this.categoricalColorDispenser.serialize();
                data.numericColorDispenser = this.numericColorDispenser.serialize();
                return data;
            };
            CaseData.prototype.deserialize = function(data) {

                var caseData = this;

                caseData.display = data.display;
                caseData.type = data.type;
                caseData.cases =  _.map( data.cases, function(d) { return mt.stats.Case.deserialize( d ); } );

                caseData.attributeHeaders = _.map( data.attributeHeaders, function(d) { return mt.stats.AttributeHeader.deserialize( d, caseData ); } );

                if( data.categoricalColorDispenser ) {
                    caseData.categoricalColorDispenser = mt.stats.ColorDispenser.deserialize(data.categoricalColorDispenser);
                }
                if( data.numericColorDispenser ) {
                    caseData.numericalColorDispenser = mt.stats.ColorDispenser.deserialize(data.numericColorDispenser);
                }

                return this;

            };
            CaseData.prototype.getActiveCase = function () {
                    return _.find(this.cases, function (c) {return c.active === true;});
            };
            CaseData.prototype.getActiveHeader = function () {
                return _.find(this.attributeHeaders, function (a) {return a.active === true;});
            };
            CaseData.prototype.getAttributeHeaders = function() {
                return this.attributeHeaders;
            };
            CaseData.prototype.getCase = function (index) {
                return _(this.cases).findWhere({index: index});
            };
            CaseData.prototype.getColorRange = function(i) {
                return this.numericColorDispenser.next();
            };
            CaseData.prototype.getHeaderIndex = function (name) {
                var retval;
                for(var i = 0; i < this.attributeHeaders.length; i++) {
                    if(this.attributeHeaders[i].display === name) {
                        retval = i;
                        break;
                    }
                }
                return retval;
            };
            CaseData.prototype.getMinMax = function(attributeName) {
                var min, max;
                _.each(this.cases, function(curCase) {
                    var val = parseFloat(curCase.attributes[attributeName]);
                    if(val !== undefined && !isNaN(val)) {
                        if (min === undefined || val < min) {
                            min = val;
                        }
                        if (max === undefined || val > max) {
                            max = val;
                        }
                    }
                });
                var retval = { min: min, max: max };
                return retval;
            };
            CaseData.prototype.getRange = function (attributeName, noOffset) {
                if(this.getType(attributeName) === ns.STATS_FIELD_TYPE_CATEGORICAL ) {
                    return _.filter(_.uniq(_.map(this.cases, function(kase) {
                        if(kase.attributes[attributeName] !== undefined &&
                            kase.attributes[attributeName] !== null &&
                            kase.attributes[attributeName].toString().trim() !== '') {
                            return kase.attributes[attributeName];
                        }
                    })), function (c) { return c !==undefined; }).sort();
                } else {
                    var minMax = this.getMinMax(attributeName);
                    if(minMax.max === minMax.min) {
                        //TODO: is this really what we want?
                        return [Math.floor(minMax.min * 0.5), Math.ceil(minMax.min * 1.5)];
                    } else {
                        //add 10% of range to each end
                        var offset = (minMax.max - minMax.min) / 10;
                        if (noOffset === true) {
                            offset = 0;
                        }
                        return [minMax.min - offset, minMax.max + offset];
                    }
                }
            };
            CaseData.prototype.getType = function(attributeName) {
                var attributeHeader = _.find(this.attributeHeaders, function (curHeader) {
                    return curHeader.display === attributeName;
                });
                if(attributeHeader) {
                    return attributeHeader.type;
                }
            };
            CaseData.prototype.importFromFile = function (jsonDataFile, callback) {
                var caseData = this;
                $.getJSON(jsonDataFile, function (json) {
                    caseData.loadFromJson(json);

                    if (angular.isFunction(callback)) {
                        callback();
                    }
                });
            };
            CaseData.prototype.isInteger = function(attributeName) {
                if(this.getType(attributeName) !== ns.STATS_FIELD_TYPE_NUMERIC) {
                    return false;
                } else {
                    var floats = _(this.cases).find(function (kase) {
                        var float = parseFloat(kase.attributes[attributeName]);
                        return float !== Math.round(float);
                    });
                    return !floats;
                }
            };
            CaseData.prototype.loadFromJson = function (json) {
                var caseData = this;
                caseData.cases.length = 0;
                caseData.attributeHeaders.length = 0;

                _(json).each(function (c, i) {
                    var newCase = caseData.addCase();
                    newCase.attributes = c;
                });

                if (caseData.cases.length > 0) {
                    var attributes = _(caseData.cases[0].attributes).keys();
                    _(attributes).each(function (attr, i) {
                        var type = getHeaderType(attr, caseData.cases);

                        var colorRange;
                        if (type === ns.STATS_FIELD_TYPE_NUMERIC) {
                            colorRange = caseData.getColorRange(i);
                        }

                        var attributeHeader = caseData.addAttributeHeader(attr, type, colorRange);

                        _(caseData.cases).each(function (c, i) {
                            var val = c.attributes[attr];
                            attributeHeader.attributeValues.put(val);
                        });
                    });
                }
            };
            CaseData.prototype.order = function (attributeName) {

                var filtered;

                if(attributeName === 'index') {
                    return this.cases;
                } else if (this.getType(attributeName) === ns.STATS_FIELD_TYPE_CATEGORICAL) {
                    filtered = _.filter(this.cases, function(curCase) {
                        return (curCase.attributes[attributeName] !== null &&
                            curCase.attributes[attributeName] !== undefined &&
                            !curCase.attributes[attributeName].toString().match(/^\s*$/));
                    });
                    return _.sortBy(filtered, function (curCase) {
                        return curCase.attributes[attributeName];
                    });
                } else {
                    //filter any NaNs out before the sort
                    filtered = _.filter(this.cases, function(curCase) {
                        var isValid = (isNaN(curCase.attributes[attributeName]) === false &&
                            curCase.attributes[attributeName] !== null) &&
                            !curCase.attributes[attributeName].toString().match(/^\s*$/);
                        if(isValid === false) {
                            //quick fix to stop filtered points rendering - consider refactoring
                            curCase.renderPos = [undefined, undefined];
                        }
                        return isValid;
                    });


                    var sorted = _.sortBy(filtered, function(curCase) {
                        return parseFloat(curCase.attributes[attributeName]);
                    });

                    return sorted;
                }
            };
            CaseData.prototype.removeCase = function(kase) {
                this.cases.splice(this.cases.indexOf(kase),1);
                // we need case index values to start at 1, not 0 like arrays.
                _.each(this.cases, function (c, i) {
                    c.index = i + 1;
                });
            };

            //select a header or case such that only one is ever selected at a time
            CaseData.prototype.select = function (activeObject) {
                if (activeObject && activeObject.active) {
                    return;
                }
                var objectList = this.cases.concat(this.attributeHeaders);

                _(objectList).each(function (curObject) {
                    curObject.active = curObject === activeObject;
                });
            };
            CaseData.prototype.setActiveHeaderType = function (newType) {
                var retval = false;
                var activeHeader = this.getActiveHeader();
                if(activeHeader !== undefined && activeHeader.type !== newType) {
                    if (activeHeader.type === ns.STATS_FIELD_TYPE_CATEGORICAL) {
                        _(this.cases).each(function (c) {
                            c.validateCategorical(activeHeader.display);
                        });
                    }
                    else {
                        _(this.cases).each(function (c) {
                            if(c.validateNumeric(activeHeader.display)) {
                                c.attributes[activeHeader.display] = parseFloat(c.attributes[activeHeader.display]);
                            }
                        });
                    }
                    activeHeader.attributeValues.setType(newType);
                    activeHeader.type = newType;
                    retval = true;
                }
                return retval;
            };
            CaseData.prototype.updateCase = function() {
                resetAttributeValues(this);
            };

            function getHeaderType(attribute, cases) {
                // for now if 0th case is not a number, then categorical, otherwise numeric
                var testValue = cases[0].attributes[attribute];
                if(isNaN(parseFloat(testValue))&& testValue!==null && testValue.toString().trim()!=='') {
                    return ns.STATS_FIELD_TYPE_CATEGORICAL;
                } else {
                    return ns.STATS_FIELD_TYPE_NUMERIC;
                }
            }

            CaseData.prototype.getIndexFromCase = function(caseObj) {
                var index = this.cases.indexOf(caseObj);
                if(index < 0) {
                    index= undefined;
                }
                return index;
            };

            CaseData.prototype.getIndexFromAttr = function(attrObj) {
                var index = this.attributeHeaders.indexOf(attrObj);
                if(index < 0) {
                    index= undefined;
                }
                return index;
            };

            this.clear();
        }

        return CaseData;
    })();
})(window.mt.stats);

(function (ns) {
    'use strict';

    ns.CaseDataEventineer = (function (toolId, eventingService) {
        function CaseDataEventineer(toolId, eventingService) {
            if (!(this instanceof CaseDataEventineer)) {
                return new CaseDataEventineer(toolId, eventingService);
            }

            //public interface
            this.broadcastToGraphs = function (e) {
                e.sourceId = toolId;
                eventingService.publish(ns.TOPIC_STATS_NOTIFY_GRAPHS, e);
            };

            this.exportToNewGraph = function (caseData) {
                //analyticsService.sendDataExported(caseData, mt.common.TYPE_STATS, toolId);

                var graphId = mt.common.createGuid();
                createNewGraph(graphId);

                var exportEvent = new mt.common.Event(caseData);
                exportEvent.sourceId = toolId;
                setTimeout(function() {
                    eventingService.publishToSubscriber(mt.stats.EVENT_EXPORT_CASE_DATA_TO_STATS_GRAPH, exportEvent, graphId);
                });

                return graphId;
            };

            this.launchProbabilityTool = function(caseData, sampler){
                var createEvent = new mt.common.Event(),
                    linkDataEvent = new mt.common.Event(caseData);

                if(sampler) {
                    createEvent.type = mt.common.TYPE_DATA_SAMPLER;
                } else {
                    createEvent.type = mt.common.TYPE_PROBABILITY_TOOL;
                }
                createEvent.toolId = mt.common.createGuid();
                linkDataEvent.sampler = sampler;
                linkDataEvent.sourceId = toolId;
                eventingService.publish(mt.common.EVENT_CREATE_TOOL, createEvent);

                setTimeout(function() {
                    console.log('sampler send data ', linkDataEvent, createEvent.toolId);

                    eventingService.publishToSubscriber(mt.stats.EVENT_PROB_TOOL_SOURCE, linkDataEvent, createEvent.toolId);
                });
                return createEvent.toolId;
            };

            function createNewGraph(id) {
                var createEvent = new mt.common.Event();

                createEvent.type = mt.common.TYPE_STATS_GRAPH;
                createEvent.toolId = id;
                eventingService.publish(mt.common.EVENT_CREATE_TOOL, createEvent);
            }
        }

        return CaseDataEventineer;
    })();
})(window.mt.stats);

(function (ns) {
    'use strict';

    ns.CaseView = (function () {

        function CaseView(kase) {
            if (!(this instanceof CaseView)) {
                return new CaseView(kase);
            }
            this.case = kase;
            this.id = mt.common.createGuid();

            // when displaying as a circle, we need center coordinates (set with each update)
            this.pos = [0, 0];

            // for now radius is a constant
            this.radius = mt.common.GRAPH_CASE_RADIUS;
            this.diameter = 2 * this.radius;

            // define a function for determining rect coordinates based on circle coordinates.
            CaseView.prototype.squarePos = function() {
                return [this.pos[0] - this.radius, this.pos[1] - this.radius];
            };

            // rectangle position is set with each update
            this.rectPos = [0,0];
        }
        return CaseView;
    })();
})(window.mt.stats);

(function (ns) {
    'use strict';

    ns.ColorDispenser = (function () {

        function ColorDispenser(colorsArray, rangeMode) {
            if (!(this instanceof ColorDispenser)) {
                return new ColorDispenser();
            }

            ColorDispenser.prototype.stash = function(c) {
                if(c !== undefined) {
                    this.buffer.push(c);
                }
            };

            ColorDispenser.prototype.next = function() {
                var nextValue;
                var fromBuffer = false;
                if(this.buffer.length > 0) {
                    nextValue = this.buffer.pop();
                    fromBuffer = true;
                }
                else {
                    nextValue = this.values[this.index];
                }
                if(this.rangeMode) {
                    if(!angular.isArray(nextValue[0])) {
                        nextValue[0] = mt.common.hexToRgb(nextValue[0]);
                    }
                    if(!angular.isArray(nextValue[1])) {
                        nextValue[1] = mt.common.hexToRgb(nextValue[1]);
                    }
                }
                else {
                    if(!angular.isArray(nextValue)) {
                        nextValue = mt.common.hexToRgb(nextValue);
                    }
                }

                if(!fromBuffer) {
                    if (this.index === (this.values.length - 1)) {
                        this.index = 0;
                    }
                    else {
                        this.index += 1;
                    }
                }
                var retval = nextValue;
                if(this.rangeMode) {
                    retval = ns.ColorRange(nextValue[0], nextValue[1]);
                }
                return retval;
            };

            this.buffer = [];
            this.values = colorsArray.slice(0);
            this.index = 0;
            this.rangeMode = rangeMode;

            ColorDispenser.prototype.serialize = function() {
                var colorDispenser = this;

                var data = [ colorDispenser.buffer, colorDispenser.values, colorDispenser.index, colorDispenser.rangeMode ];
                return data;
            };
        }

        return ColorDispenser;
    })();

    mt.stats.ColorDispenser.deserialize = function(data ) {
        var colorDispenser = new mt.stats.ColorDispenser( data[1], data[3] );

        colorDispenser.buffer = data[0];
        colorDispenser.index = data[2];

        return colorDispenser;
    };

})(window.mt.stats);

(function (ns) {
    'use strict';

    ns.ColorRange = (function () {

        function ColorRange(startColor, endColor) {

            var startColorRgb = startColor;
            var endColorRgb = endColor;
            if (!angular.isArray(startColor)) {
                startColorRgb = mt.common.hexToRgb(startColor);
            }
            if (!angular.isArray(endColor)) {
                endColorRgb = mt.common.hexToRgb(endColor);
            }

            if (!(this instanceof ColorRange)) {
                return new ColorRange(startColorRgb, endColorRgb);
            }

            this.getGradientStyle = function () {
                var style = {'background': '-webkit-linear-gradient(left, ' +
                    ' rgb(' + startColorRgb[0] + ',' + startColorRgb[1] + ',' + startColorRgb[2] + '),' +
                    ' rgb(' + endColorRgb[0] + ',' + endColorRgb[1] + ',' + endColorRgb[2] + '))'};
                return style;
            };

            this.getColorRGB = function (mixParam) {
                var color = this.getColor(mixParam);
                return 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
            };

            this.getColor = function (mixParam) {
                //clamp onto [0,1]
                mixParam = Math.min(1, Math.max(0, mixParam));
                var newCol = [];
                for (var i = 0; i < 3; i++) {
                    newCol.push(parseInt((1 - mixParam) * startColorRgb[i] + mixParam * endColorRgb[i], 10));
                }
                return newCol;
            };

            this.serialize = function () {
                var data = [startColor, endColor];
                return data;
            };
        }

        return ColorRange;
    })();

    mt.stats.ColorRange.deserialize = function (data) {
        var colorRange = null;
        if (data.length === 2) {
            colorRange = new mt.stats.ColorRange(data[0], data[1]);
        }
        return colorRange;
    };
})(window.mt.stats);

(function (ns) {
    'use strict';

    ns.STATS_GRAPH_STATE_EMPTY = 'emptyPlot';
    ns.STATS_GRAPH_STATE_DOT_ON_X = 'dotPlotOnX';
    ns.STATS_GRAPH_STATE_DOT_ON_Y = 'dotPlotOnY';
    ns.STATS_GRAPH_STATE_SCATTER = 'scatterPlot';

    ns.STATS_GRAPH_DROP_AREA_X = 'x';
    ns.STATS_GRAPH_DROP_AREA_Y = 'y';
    ns.STATS_GRAPH_DROP_AREA_CASE = 'case';

    ns.STATS_GRAPH_RENDER_MIN_X = 65;
    ns.STATS_GRAPH_RENDER_MIN_Y = 340;
    ns.STATS_GRAPH_RENDER_MAX_X = 425;
    ns.STATS_GRAPH_RENDER_MAX_Y = 25;

    ns.STATS_GRAPH_MESSAGE_DROP_FOR_DOT = 'Drop here for dot plot';
    ns.STATS_GRAPH_MESSAGE_DROP_FOR_CASE = 'Drop here for case plot';
    ns.STATS_GRAPH_MESSAGE_DROP_FOR_SCATTER = 'Drop here for scatter plot';
    ns.STATS_GRAPH_MESSAGE_DROP_TO_REPLACE_X = 'Drop here to replace x-attribute';
    ns.STATS_GRAPH_MESSAGE_DROP_TO_REPLACE_Y = 'Drop here to replace y-attribute';
    ns.STATS_GRAPH_MESSAGE_DROP_TO_COLOR = 'Drop here to color by attribute';

    ns.EVENT_EXPORT_CASE_DATA_TO_STATS_GRAPH = 'eventExportCaseDataToStatsGraph';
    ns.EVENT_EXPORT_STATS_GRAPH_TO_CASE_DATA = 'eventExportStatsGraphToCaseData';
    ns.EVENT_PROB_TOOL_RESULTS = 'eventProbsToolResults';
    ns.EVENT_PROB_TOOL_SOURCE = 'eventProbsToolSource';
    ns.EVENT_ATTRIBUTE_DRAG_START = 'eventAttributeDragStart';
    ns.EVENT_ATTRIBUTE_DRAG = 'eventAttributeDrag';
    ns.EVENT_ATTRIBUTE_DRAG_END = 'eventAttributeDragEnd';
    ns.EVENT_DATA_UPDATE = 'eventDataUpdate';
    ns.EVENT_DATA_DELETE = 'eventDataDelete';
    ns.EVENT_DATA_ADD = 'eventDataAdd';
    ns.EVENT_CLEAR_TABLE = 'eventClearTable';
    ns.EVENT_ATTRIBUTE_DELETE = 'eventAttributeDelete';
    ns.EVENT_ATTRIBUTE_UPDATE = 'eventAttributeUpdate';
    ns.EVENT_RESET_GRAPH = 'eventResetGraph';
    ns.EVENT_ATTRIBUTE_RENAME = 'eventAttributeRename';
    ns.EVENT_ATTRIBUTE_TYPE_CHANGE = 'eventAttributeTypeChange';
    ns.EVENT_RERENDER = 'rerender';

    ns.TOPIC_STATS_NOTIFY_GRAPHS = 'topicStatsNotifyGraphs';
    ns.TOPIC_STATS_NOTIFY_TABLE = 'topicStatsNotifyTable';
    ns.GESTURE_MODE_DEFAULT = 'gestureModeDefault';
    ns.GESTURE_MODE_XHAT = 'gestureModeXHat';
    ns.GESTURE_MODE_YHAT = 'gestureModeYHat';
    ns.STATS_FIELD_TYPE_NUMERIC = 'numeric';
    ns.STATS_FIELD_TYPE_CATEGORICAL = 'categorical';

    // light->dark gradients
    ns.COLORS_NUMERIC =
        [
            [ 'e4e3ff', '918fff' ],
            [ 'fed3cc', 'fa4f32' ],
            [ 'cff5eb', '40d6ae' ],
            [ 'd4efff', '51bdff' ],
            [ 'ffe1eb', 'ff85ad' ],
            [ 'fef7cc', 'fbdd32' ],
            [ 'ffebd1', 'ffad46' ],
            [ 'c5ecda', '16b36c' ],
            [ 'e7f0f9', '9dc4e7' ],
            [ 'f2e5e7', 'cc959e' ],
            [ 'e5ccc3', '97320e' ],
            [ 'c0c3f5', '020fd6' ],
            [ 'ecf6da', 'b3db6c' ],
            [ 'ffddcd', 'ff7537' ],
            [ 'ffffd0', 'fffd42' ],
            [ 'f3dcf9', 'cd74e5' ],
            [ 'd9cbe4', '662d91' ],
            [ 'eadcd7', 'ac725e' ],
            [ 'fef4d9', 'fad165' ],
            [ 'e7bfd7', '9e005d' ],
            [ 'e4f8ef', '92e1c0' ]
        ];

    ns.COLORS_CATEGORICAL =
        [
    // dense
        '918fff',
        'fa4f32',
        '40d6ae',
        '51bdff',
        'ff85ad',
        'fbdd32',
        'ffad46',
        '16b36c',
        '9dc4e7',
        'cc959e',
        '97320e',
        '020fd6',
        'b3db6c',
        'ff7537',
        'fffd42',
        'cd74e5',
        '662d91',
        'ac725e',
        'fad165',
        '9e005d',
        '92e1c0',
    // light
        'b3b5ff',
        'faa596',
        'a1e6d4',
        '99c1ff',
        'ffb3cc',
        'fbf0b0',
        'ffd199',
        '92eb9f',
        'c0d9f0',
        'ebb3bd',
        'd99c87',
        '878ef5',
        'd8f2a9',
        'ffb491',
        'fffeb0',
        'e2abf0',
        'a668d4',
        'c99a89',
        'fae1a0',
        'c7599b',
        'c5eddc'
    ];
    ns.STATS_DROP_TARGET_MESSAGES = [
        {
            state: ns.STATS_GRAPH_STATE_EMPTY,
            messages: [
                {
                    type: ns.STATS_GRAPH_DROP_AREA_X,
                    text: ns.STATS_GRAPH_MESSAGE_DROP_FOR_DOT
                }, {
                    type: ns.STATS_GRAPH_DROP_AREA_Y,
                    text: ns.STATS_GRAPH_MESSAGE_DROP_FOR_DOT
                }, {
                    type: ns.STATS_GRAPH_DROP_AREA_CASE,
                    text: ns.STATS_GRAPH_MESSAGE_DROP_FOR_CASE
                }
            ]
        }, {
            state: ns.STATS_GRAPH_STATE_DOT_ON_X,
            messages: [
                {
                    type: ns.STATS_GRAPH_DROP_AREA_X,
                    text: ns.STATS_GRAPH_MESSAGE_DROP_TO_REPLACE_X
                }, {
                    type: ns.STATS_GRAPH_DROP_AREA_Y,
                    text: ns.STATS_GRAPH_MESSAGE_DROP_FOR_SCATTER
                }, {
                    type: ns.STATS_GRAPH_DROP_AREA_CASE,
                    text: ns.STATS_GRAPH_MESSAGE_DROP_TO_COLOR
                }
            ]
        }, {
            state: ns.STATS_GRAPH_STATE_DOT_ON_Y,
            messages: [
                {
                    type: ns.STATS_GRAPH_DROP_AREA_X,
                    text: ns.STATS_GRAPH_MESSAGE_DROP_FOR_SCATTER
                }, {
                    type: ns.STATS_GRAPH_DROP_AREA_Y,
                    text: ns.STATS_GRAPH_MESSAGE_DROP_TO_REPLACE_Y
                }, {
                    type: ns.STATS_GRAPH_DROP_AREA_CASE,
                    text: ns.STATS_GRAPH_MESSAGE_DROP_TO_COLOR
                }
            ]
        },
        {
            state: ns.STATS_GRAPH_STATE_SCATTER,
            messages: [
                {
                    type: ns.STATS_GRAPH_DROP_AREA_X,
                    text: ns.STATS_GRAPH_MESSAGE_DROP_TO_REPLACE_X
                }, {
                    type: ns.STATS_GRAPH_DROP_AREA_Y,
                    text: ns.STATS_GRAPH_MESSAGE_DROP_TO_REPLACE_Y
                }, {
                    type: ns.STATS_GRAPH_DROP_AREA_CASE,
                    text: ns.STATS_GRAPH_MESSAGE_DROP_TO_COLOR
                }
            ]
        }
    ];

    ns.STATS_CASE_TYPE = 'stats_case_type';
    ns.STATS_HEADER_TYPE = 'stats_header_type';
})(window.mt.stats);

(function (ns) {
    'use strict';

    ns.Divider = (function (axis) {

        function Divider(axis) {
            if (!(this instanceof Divider)) {
                return new Divider(axis);
            }
            this.axis = axis;
            this.id = mt.common.createGuid();
            this.isSelected = !!axis.isSelected;

            // for now, new dividers start in center..
            var initValue = (axis.max[axis.axisId].val() +  axis.min[axis.axisId].val()) / 2;
            var self = this;
            this.destroy = function() {
                axis.dividers =  _.filter(axis.dividers, function(divider) {
                    return divider.id !== self.id ;
                });
            };

            this.setValue = function(value) {
                if(value !== undefined) {
                    this.value = value;
                }
                this.position =  this.axis.scale(this.value);
                this.min = axis.orthogonal.renderMin[this.axis.orthogonal.axisId];
                this.max = axis.orthogonal.renderMax[this.axis.orthogonal.axisId];
                this.handle = {
                    color: ns.GRAPH_BIN_COLOR,
                    divider: this
                };
                this.handle.x = axis.swap([this.position, this.max])[0];
                this.handle.y = axis.swap([this.position, this.max])[1];
            };
            this.active = true;
            this.setValue(initValue);

            this.type = function() {
                return 'divider';
            };
        }
        
        return Divider;
    })();
})(window.mt.stats);

(function (ns) {
    'use strict';

    ns.Ruler = (function (axis) {

        function Ruler(axis) {
            if (!(this instanceof Ruler)) {
                return new Ruler(axis);
            }

            var ruler = this;
            this.axis = axis;
            this.handles = [];
            this.thickness = 50;
            this.isSelected = false;
            this.orthogonalCenterPosition = this.axis.orthogonal.getPixMax();
            this.orthogonalCoordinate = this.orthogonalCenterPosition - (this.thickness / 2);
            var initVal = (axis.getMin() + axis.getMax()) / 2;
            _([initVal, initVal]).each(function (value) {
                ruler.handles.push(new Handle(value, ruler.handles.length));
            });

            function Handle(value, index) {
                if (!(this instanceof Handle)) {
                    return new Handle(value, index);
                }
                this.dataValue = value;
                this.pixelValue = ruler.axis.scale(this.dataValue);
                this.index = index;
                this.ruler = ruler;
                if (this.ruler.axis.isXAxis) {
                    this.startAngle = [1, 0][index];
                    this.endAngle = [2, 1][index];
                } else {
                    this.startAngle = [1.5, 0.5][index];
                    this.endAngle = [2.5, 1.5][index];
                }
                this.getCenterPoint = function () {
                    return ruler.axis.swap([this.pixelValue, ruler.orthogonalCenterPosition]);
                };
                this.setPixelValue = function (position) {
                    var min = ruler.axis.swap([ruler.axis.getPixMin(), ruler.axis.getPixMax()])[0];
                    var max = ruler.axis.swap([ruler.axis.getPixMin(), ruler.axis.getPixMax()])[1];
                    if (position < min) {
                        this.setDataValue(ruler.axis.swap([ruler.axis.getMin(), ruler.axis.getMax()])[0]);
                        return;
                    }
                    if (position > max) {
                        this.setDataValue(ruler.axis.swap([ruler.axis.getMin(), ruler.axis.getMax()])[1]);
                        return;
                    }
                    this.pixelValue = position;
                    this.dataValue = ruler.axis.invert(this.pixelValue);
                };
                this.setDataValue = function (value) {
                    this.dataValue = value;
                    this.pixelValue = ruler.axis.scale(this.dataValue);
                };
                this.getDataValue = function () {return this.dataValue;};
                this.getPixelValue = function () {
                    return this.pixelValue;
                };
                this.isPastTheOther = function (position) {
                    return (this.index === 0 && position > ruler.handles[1].getPixelValue() ||
                        this.index === 1 && position < ruler.handles[0].getPixelValue());
                };

                this.switchHandles = function () {
                    if (this.index === 0) {
                        this.setDataValue(ruler.handles[1].getDataValue());
                        return ruler.handles[1];
                    } else {
                        this.setDataValue(ruler.handles[0].getDataValue());
                        return ruler.handles[0];
                    }
                };
            }
        }

        Ruler.prototype.switchHandles = function() {
            var oldValues = [this.handles[0].getDataValue(),this.handles[1].getDataValue()];
            this.handles[1].setDataValue(oldValues[0]);
            this.handles[0].setDataValue(oldValues);

        };
        Ruler.prototype.destroy = function() {
            this.axis.ruler = undefined;
        };
        Ruler.prototype.getLength = function() {
            return this.handles[1].getPixelValue() -this.handles[0].getPixelValue();
        };

        Ruler.prototype.getDataLength = function() {
            return Math.abs(this.handles[1].getDataValue() - this.handles[0].getDataValue());
        };

        Ruler.prototype.type = function() {
            return 'ruler';
        };

        return Ruler;
    })();
})(window.mt.stats);

(function (ns) {
    'use strict';

    var index = 1;
    ns.AttributeHeader = (function (caseData, display, type, colorRange, insertIndex) {

        function AttributeHeader(caseData, display, type, colorRange, insertIndex) {
            if (!(this instanceof AttributeHeader)) {
                return new AttributeHeader(caseData,display, type, colorRange, insertIndex);
            }

            this.display = display;
            this.active = false;
            this.type = type;
            this.colorRange = colorRange;
            this.caseData = caseData;
            this.id = index++;
            this.attributeValues = new mt.stats.AttributeValues(this, caseData.categoricalColorDispenser);

            if(insertIndex !== undefined) {
                caseData.attributeHeaders.splice(insertIndex, 0, this);
            } else {
                caseData.attributeHeaders.push(this);
            }

            AttributeHeader.prototype.serialize = function() {
                var header = this;

                var data = {
                    display: header.display,
                    type: header.type,
                    id: header.id,
                    attributeValues: header.attributeValues.serialize()
                };
                if(header.type === ns.STATS_FIELD_TYPE_NUMERIC && header.colorRange !== undefined) {
                    data.colorRange = header.colorRange.serialize();
                }
                return data;
            };
        }


        return AttributeHeader;
    })();


    mt.stats.AttributeHeader.deserialize = function(data, caseData) {
        var colorRange;
        if(data.type === ns.STATS_FIELD_TYPE_NUMERIC && data.colorRange !== undefined) {
            colorRange = mt.stats.ColorRange.deserialize(data.colorRange);
        } else {
            colorRange = caseData.categoricalColorDispenser.next();
        }

        var attributeHeader = new mt.stats.AttributeHeader(caseData, data.display, data.type, colorRange);
        attributeHeader.id = data.id;
        attributeHeader.attributeValues =  mt.stats.AttributeValues.deserialize(data.attributeValues, attributeHeader, caseData.categoricalColorDispenser);

        return attributeHeader;
    };
})(window.mt.stats);


(function (ns) {

    'use strict';

    ns.StatsAxis = (function (spec) {

        function StatsAxis(axisId) {
            this.axisId = axisId;
            this.isXAxis = axisId === 'x';
            this.multiplier = this.isXAxis ? 1 : -1;
            this.resetFunctions = [];
            this.isSelected = false;

            this.renderMin = {
                x:mt.stats.STATS_GRAPH_RENDER_MIN_X,
                y:mt.stats.STATS_GRAPH_RENDER_MIN_Y
            };
            if (this.isXAxis === true) {
                this.renderMax = {
                    x:mt.stats.STATS_GRAPH_RENDER_MAX_X,
                    y:mt.stats.STATS_GRAPH_RENDER_MIN_Y
                };
                this.min = {
                    x: new mt.common.MtValue(-10, 1, false),
                    y: new mt.common.MtValue(0, 1, false)
                };
                this.max = {
                    x: new mt.common.MtValue(10, 1, false),
                    y: new mt.common.MtValue(0, 1, false)
                };
            } else {
                this.renderMax = {
                    x:mt.stats.STATS_GRAPH_RENDER_MIN_X,
                    y:mt.stats.STATS_GRAPH_RENDER_MAX_Y
                };
                this.min = {
                    x: new mt.common.MtValue(0, 1, false),
                    y: new mt.common.MtValue(-10, 1, false)
                };
                this.max = {
                    x: new mt.common.MtValue(0, 1, false),
                    y: new mt.common.MtValue(10, 1, false)
                };
            }
            this.partitions = [];
            this.reset();
        }

        StatsAxis.prototype.reset = function() {
            this.adjuster = {};
            this.anchor = new mt.common.MtValue(0, 1, false);
            this.attribute = undefined;
            this.bins = [];
            this.binned = false;
            this.binBoundaries = [];
            this.binCount = 0;
            this.boxes = [];
            this.categoryBoundaries = [];
            this.categoryGroups = [];
            this.dividers = [];
            this.hats = [];
            this.histograms = [];
            this.label = undefined;
            this.min[this.axisId].setVal(0);
            this.minorInterval = new mt.common.MtValue(1, 1, false);
            this.majorInterval = new mt.common.MtValue(1, 1, false);
            this.max[this.axisId].setVal(1);
            this.sections = [];
            this.showBarChart = false;
            this.showBoxes = false;
            this.showHistograms = false;
            this.showMADs = false;
            this.showMeans = false;
            this.showMedians = false;
            this.ruler = undefined;
            this.type = undefined;
            this.userSetAxes = false;
            this.userBinRange = undefined;
            this.visible = false;
            this.binThresholds = undefined;
            this.isInteger = false;

            _.each(this.resetFunctions, function(fn) {
                fn();
            });
        };

        StatsAxis.prototype.swap = function (coordinateArray) {
            if (this.isXAxis) {
                return coordinateArray;
            } else {
                return [ coordinateArray[1], coordinateArray[0] ];
            }
        };

        // for categorical data only
        StatsAxis.prototype.setCategoryGroups = function(categoryGroups) {
            this.categoryGroups = categoryGroups;
        };

        // createEqualSizeBins is used for binning data and creating histograms
        // TODO: this should really live somewhere else
        StatsAxis.prototype.createEqualSizeBins = function (caseViews, numOfBins, attr, width) {
            caseViews = _.filter(caseViews, function(c) {
                return c.case.attributes[attr] !== undefined && c.case.attributes[attr] !== null;
            });
            var max = this.getMax();
            var min = this.getMin();
            var rangeMax = max;
            if(this.isXAxis) {
                this.min.x.setVal(min);
            } else {
                this.min.y.setVal(min);
            }

            var getCaseVal = function (c) { return c.case.attributes[attr]; };

            this.histogram = d3.layout.histogram();
            this.histogram.range([min,max]);
            this.binThresholds = [];
            var axis = this;
            if(width===undefined) {
                this.histogram.bins(function(range, values) {
                    var unRoundedBinWidth = Math.abs(range[0]-range[1])/numOfBins;
                    var precision = this.getPrecision(unRoundedBinWidth);
                    for(var i = 0; i<= numOfBins; i++) {
                        var threshold = range[0] + i*unRoundedBinWidth;
                        var pow = Math.pow(10, precision);
                        threshold = parseFloat((Math.ceil(threshold*pow)/pow).toFixed(precision));
                        axis.binThresholds.push(threshold);
                    }
                    return axis.binThresholds;
                });
            } else {
                this.histogram.bins(function (range, values, indx) {
                    var maxCaseValue = _.max(values);
                    var precision = this.getPrecision(width);
                    var pow = Math.pow(10, precision+1);
                    var threshold = parseFloat((Math.ceil(range[0]*pow)/pow).toFixed(precision+1));
                    axis.binThresholds.push(threshold);
                    for (var i=1;threshold <= maxCaseValue;i++) {
                        threshold = range[0] + i*width;
                        threshold = Math.ceil(threshold*pow)/pow;
                        axis.binThresholds.push(threshold);
                    }

                    // Note: important this is after the previous if statement
                    rangeMax = axis.binThresholds[axis.binThresholds.length -1];

                    return axis.binThresholds;

                });
            }

            this.histogram.value(getCaseVal);
            this.bins = this.histogram(_(caseViews).filter(function (c) {
                return getCaseVal(c) < rangeMax;
            }));

        };

        StatsAxis.prototype.registerResetFn = function(fn) {
            this.resetFunctions.push(fn);
        };

        StatsAxis.prototype.scale = function(dataValue) {
            return this.viewConfig.scale[this.axisId](dataValue);
        };
        StatsAxis.prototype.invert = function(pixelValue) {
            return this.viewConfig.scale[this.axisId].invert(pixelValue);
        };
        StatsAxis.prototype.isQuant = function() {
            return this.type ===  mt.stats.STATS_FIELD_TYPE_NUMERIC;
        };
        StatsAxis.prototype.getTicks = function () {
            var ticks = [];

            var fixedPoint = this.anchor.copy();

            if(this.isQuant() &&!this.binned) {

                var startX = this.isXAxis ? this.min.x : this.min.y;
                var endX = this.isXAxis ? this.max.x : this.max.y;
                var zeroRange = Math.abs(this.minorInterval.val()) < mt.common.GRAPH_MIN_RANGE;

                var delta = zeroRange? this.minorInterval.copy(): this.getAdjustedInterval(this.minorInterval);

                //move the anchor point into the axis range
                var labelDelta = this.getAdjustedInterval(this.majorInterval, true);

                while(fixedPoint.val() > endX.val()) {

                    fixedPoint.subtract(labelDelta);
                }

                while(fixedPoint.val() < startX.val()) {
                    fixedPoint.add(labelDelta);
                }

                var startXVal = startX.val();
                var endXVal = endX.val();

                //negative ticks
                var tickVal;
                if (!zeroRange) {
                    for (tickVal = fixedPoint.copy(); tickVal.val() >= startXVal; tickVal.subtract(delta)) {
                        //hack to deal with floating point errors, probably need better solution:
                        tickVal.setVal(Math.round(tickVal.val()*10000)/10000);
                        ticks.push(tickVal.copy());
                    }
                }

                //positive ticks
                if (!zeroRange) {
                    for (tickVal = fixedPoint.copy().add(delta); tickVal.val() <= endXVal; tickVal.add(delta)) {
                        tickVal.setVal(Math.round(tickVal.val()*10000)/10000);
                        ticks.push(tickVal.copy());
                    }
                }

                if (ticks.length < 2) {
                    ticks.push(startX.copy());
                    ticks.push(endX.copy());
                }

                var anchor = ticks[0];
                ticks.sort(function (a, b) { return a.val() - b.val(); });

                var axis = this;

                var minLabelInterval = this.getMinLabelInterval();
                var anchorIndex = ticks.indexOf(anchor);

                //process ticks from the anchor out - assigning drawn labels and major ticks
                anchor.isMajor = true;
                anchor.drawLabel = true;
                var i, tick;
                var prevLabel = anchor.val();
                for(i = anchorIndex-1; i >= 0; i--) {
                    tick = ticks[i];
                    tick.isMajor = isMajor(axis, tick);
                    if(tick.isMajor && Math.abs(tick.val() - prevLabel) > minLabelInterval) {
                        tick.drawLabel = true;
                        prevLabel = tick.val();
                    }
                }
                prevLabel = anchor.val();
                for(i = anchorIndex+1; i < ticks.length; i++) {
                    tick = ticks[i];
                    tick.isMajor = isMajor(axis, tick);
                    if(tick.isMajor && Math.abs(tick.val() - prevLabel) > minLabelInterval) {
                        tick.drawLabel = true;
                        prevLabel = tick.val();
                    }
                }
                _.each(ticks, function (tick) {
                    tick.showGridLine = true;
                });
                return ticks;
            } else {
                _.each(this.categoryGroups, function(categoryGroup) {
                    var tick = fixedPoint.copy();
                    tick.val = function() {return this.toString();};
                    tick.num = categoryGroup.join(',');
                    tick.isMajor = true;
                    tick.drawLabel = true;
                    tick.showGridLine = false;
                    ticks.push(tick);
                });
                return ticks;
            }
        };
        StatsAxis.prototype.inRange = function (val) {
            var min = this.isXAxis ? this.min.x : this.min.y;
            var max = this.isXAxis ? this.max.x : this.max.y;
            return val >= min.val() && val <= max.val();
        };
        StatsAxis.prototype.clamp = function (val) {
            var min = this.isXAxis ? this.min.x : this.min.y;
            var max = this.isXAxis ? this.max.x : this.max.y;
            var clampedVal = Math.min(val, max.val());
            clampedVal = Math.max(clampedVal, min.val());
            return clampedVal;
        };
        StatsAxis.prototype.getMinLabelInterval = function () {
            var maxTickLabels = this.getMaxTickLabels();
            var minIntervalScale = (this.getMax() - this.getMin())/maxTickLabels / this.minorInterval.val();
            minIntervalScale = adjustScale(minIntervalScale);
            //return the interval
            return (minIntervalScale-0.5)*this.minorInterval.val();
        };
        StatsAxis.prototype.getMaxTickLabels = function () {
            var maxTickLabels = mt.common.GRAPH_MAX_TICK_LABELS;
            if(Math.abs(this.getMax()) > 100 || Math.abs(this.getMin()) > 100) {
                maxTickLabels = mt.common.GRAPH_HIGH_MAX_TICK_LABELS;
            }
            return maxTickLabels;
        };
        StatsAxis.prototype.getAdjustedInterval = function (interval, useLabel) {
            var adjusted = interval.copy();
            var maxTicks = mt.common.GRAPH_MAX_TICKS;
            var minInterval;
            if(useLabel === true) {
                maxTicks = this.getMaxTickLabels();
            }
            if(!this.isQuant()) {
                minInterval = 300/maxTicks;
            } else {
                minInterval = (this.getMax() - this.getMin())/maxTicks;
            }

            var scale = Math.max(1, Math.ceil(minInterval/adjusted.val()));
            scale = adjustScale(scale);
            adjusted.multiplyByNum(scale);
            return adjusted;
        };
        StatsAxis.prototype.getMax = function() {
            var max;
            if(this.isXAxis) {
                max = this.max.x.val();
            } else {
                max = this.max.y.val();
            }
            return max;
        };
        StatsAxis.prototype.getMin = function() {
            var min;
            if(this.isXAxis) {
                min = this.min.x.val();
            } else {
                min = this.min.y.val();
            }
            return min;
        };
        StatsAxis.prototype.getPixMax = function() {
            return this.renderMax[this.axisId];
        };
        StatsAxis.prototype.getPixMin = function() {
            return this.renderMin[this.axisId];
        };
        StatsAxis.prototype.type = function type() {
            return 'axis';
        };
        // fit min and max interval to range
        StatsAxis.prototype.generateTickInterval = function() {
            var minInterval;
            var range = this.trueRange[1] - this.trueRange[0];
            var interval = 1;
            var val = range / 10;
            if(val > 1) {
                while(val > 1) {
                    interval *= 10;
                    val /= 10;
                }
            } else {
                while(range/interval < 1) {
                    interval /= 10;
                }
            }
            if(range/interval < 4) {
                interval /= 2;
            }

            if(this.isInteger) {
                if(interval < 1) {
                    interval = 1;
                }
            }

            if(interval === 1 || interval === 2) {
                minInterval = interval / 4;
            } else {
                minInterval = interval / 5;
            }

            this.majorInterval = new mt.common.MtValue(interval);
            this.minorInterval = new mt.common.MtValue(minInterval);
        };
        StatsAxis.prototype.bufferMin = function(min,majorInterval) {
            var minModulo = ((1000 * min) % (1000 * majorInterval)) / 1000;

            // we only want to add buffer if the userSetAxes flag is false, or if the user
            // left the min undefined
            if (!this.userSetAxes || (!this.userRange[0] && this.userRange[0] !== 0)) {
                if (min > 0 && minModulo !== 0) {
                    this.min[this.axisId].setVal(min - minModulo);
                } else {
                    this.min[this.axisId].setVal(min - (minModulo) - majorInterval);
                }
            } else {
                this.min[this.axisId].setVal(min);
            }

        };
        StatsAxis.prototype.bufferMax = function(max,majorInterval) {
            var maxModulo = ((1000 * max) % (1000 * majorInterval)) / 1000;

            // we only want to add buffer if the userSetAxes flag is false, or if the user
            // left the max undefined
            if (!this.userSetAxes || (!this.userRange[1] && this.userRange[1] !== 0)) {
                maxModulo = ((1000 * max) % (1000 * majorInterval)) / 1000;
                if (max > 0 || maxModulo === 0) {
                    this.max[this.axisId].setVal(max - (maxModulo) + majorInterval);
                } else {
                    this.max[this.axisId].setVal(max - (maxModulo));
                }
            } else {
                this.max[this.axisId].setVal(max);
            }

        };
        StatsAxis.prototype.isCount = function() {
            return this.orthogonal.showHistograms||this.orthogonal.showBarChart;
        };
        StatsAxis.prototype.getPrecision = function(range) {
            var interval = 1;
            var val = range / 10;
            var precision = 0;
            if( Math.abs(val) <= 1) {
                while (range / interval < 1) {
                    interval /= 10;
                    precision += 1;
                }
                precision += 1;
            }
            return precision;
        };

        function isMajor(axis, tick) {
            var multiplier = 1;
            var divisor = axis.majorInterval.val();
            while (Math.abs(divisor) < 1 && divisor !== 0) {
                multiplier *= 10;
                divisor *= 10;
            }
            return (Math.round(1000*(multiplier * (tick.val() - axis.anchor.val())))/1000) % divisor === 0;
        }
        function adjustScale(scale) {
            if(scale > 5) {
                var tenPower = 1;
                var temp = scale;
                //TODO: investigate - needed the cutoff here to stop unit tests getting stuck
                while(temp > 10 && tenPower < 100000000) {
                    tenPower *= 10;
                    temp /= 10;
                }
                scale = Math.round(scale/tenPower)*tenPower;
            }
            return scale;
        }
        return StatsAxis;

    }());
})(window.mt.stats);

(function (ns) {

    'use strict';

    ns.StatsCasePositioner = (function (graphModel, viewConfig) {

        function StatsCasePositioner(graphModel, viewConfig) {
            if (!(this instanceof StatsCasePositioner)) {
                return new StatsCasePositioner(graphModel);
            }
            this.graphModel = graphModel;
            this.viewConfig = viewConfig;
        }

        /**
         *
         * @description algorithm for vertically nudging up point positions to avoid overlaps
         *  - uses square approximation, could improve on this but probably good enough
         * @param orderedData
         * @param verticalNudge
         * @param nudgeDiameter
         * @param max
         * @param min
         * @returns {boolean}
         */
        StatsCasePositioner.prototype.nudgePositions = function(orderedData, verticalNudge, nudgeDiameter, max, min) {

            // default nudge distance
            var d = this.graphModel.caseDiameter;
            var i, j;
            var maxIterations = 5000;
            var dSqrd = d * d;
            var prevPos, dist;
            var axis = this.graphModel.axes[verticalNudge?'x':'y'];
            if (nudgeDiameter !== undefined) {
                d = nudgeDiameter;
            }

            //set target indices depending on whether we are nudging vertically or horizontally
            var fixedIndex = verticalNudge ? 0 : 1;
            var nudgeIndex = verticalNudge ? 1 : 0;


            if(min===undefined) {
                min = axis.orthogonal.renderMin[axis.orthogonal.axisId];
            }

            //is nudge in +ve or -ve direction
            var nudgeSign = verticalNudge ? -1 : 1;

            // create an array of arrays indexed by the pixel position along the numerical axis
            var casesAtPixelCoord = [];
            _(orderedData).each(function (caseView) {
                caseView.dependentCases = [];
                var pixel = verticalNudge ? Math.floor(caseView.pos[fixedIndex]) : Math.ceil(caseView.pos[fixedIndex]);

                // pixelCoordinate is not the same as pos, since it is necessarily an int
                caseView.pixelCoordinate = pixel;
                if (casesAtPixelCoord[pixel] === undefined) {
                    casesAtPixelCoord[pixel] = [];
                }

                // figure out all the dependent cases
                if (verticalNudge) {
                    for (i = pixel; i >= pixel - caseView.diameter; i--) {
                        if (casesAtPixelCoord[i] !== undefined) {
                            for (j = casesAtPixelCoord[i].length - 1; j >= 0; j--) {
                                caseView.dependentCases.push(casesAtPixelCoord[i][j]);
                            }
                        }
                    }
                } else {
                    for (i = pixel; i <= pixel + caseView.diameter; i++) {
                        if (casesAtPixelCoord[i] !== undefined) {
                            for (j = casesAtPixelCoord[i].length - 1; j >= 0; j--) {
                                caseView.dependentCases.push(casesAtPixelCoord[i][j]);
                            }
                        }
                    }
                }

                casesAtPixelCoord[pixel].push(caseView);
            });
            _.each(orderedData, function (caseView, curIndex) {
                var pos = caseView.pos;

                if (min !== undefined) {
                    pos[nudgeIndex] = min + (nudgeSign * mt.common.GRAPH_CASE_RADIUS);
                }

                var overlapping = true;
                var loop = 0;

                // if the previously nudged cases has the same pixel coordinate, we know that we can
                // just nudge this one on top of it. This can be a big optimization when there are many cases.

                if (caseView.dependentCases[0] && caseView.dependentCases[0].pixelCoordinate === caseView.pixelCoordinate) {
                    caseView.pos[nudgeIndex] = caseView.dependentCases[0].pos[nudgeIndex] + nudgeSign * caseView.diameter;
                }

                while (overlapping === true && loop < maxIterations) {
                    var foundOverlap = false;
                    for (var iDep = 0; iDep < caseView.dependentCases.length; iDep++) {
                        prevPos = caseView.dependentCases[iDep].pos;
                        var overlap = Math.abs(prevPos[nudgeIndex] - caseView.pos[nudgeIndex]);

                        if (overlap > d) {

                            // possible optimization, not working yet..
                            // iDep += casesAtPixelCoord[caseView.dependentCases[iDep].pixelCoordinate].length - 1;

                            continue;
                        }
                        dist =
                            (prevPos[0] - caseView.pos[0]) * (prevPos[0] - caseView.pos[0]) +
                            (prevPos[1] - caseView.pos[1]) * (prevPos[1] - caseView.pos[1]);
                        if (dist < dSqrd) {
                            foundOverlap = true;
                            caseView.pos[nudgeIndex] += (d - overlap) * nudgeSign;
                        }
                    }
                    overlapping = foundOverlap;
                    loop++;
                }
            });
        };

        /**
         *
         * @param {Array} cases
         * @param attributes
         * @returns {Array}
         * @description sets the pre-nudged positions for cases
         */
        StatsCasePositioner.prototype.setCaseViewPositions= function(cases, attributes) {
            // we are going to return a list of case views corresponding to cases passed in.
            // this.graphModel.allCaseViews is the list of *all* caseViews
            var rtnCaseViews = [];

            _(cases).each(function(curCase) {
                var caseView = _.find(this.graphModel.allCaseViews, function(c) {return c.case.index === curCase.index;});
                if(caseView) {
                    rtnCaseViews.push(caseView);

                    // default un-nudged positions for all cases when no attributes on axis is offset from end edge graph
                    // enough so that whole case is available on graph
                    caseView.pos[0] = mt.common.GRAPH_RENDER_MIN_X + (this.graphModel.caseDiameter / 2) + 1;
                    caseView.pos[1] = mt.common.GRAPH_RENDER_MIN_Y - (this.graphModel.caseDiameter / 2) - 1;

                    // for each axis, if we are not binned on that axis, position the case according to its attribute value
                    _(this.graphModel.axes).each(function (axis) {
                        var indx = axis.isXAxis ? 0 : 1;
                        var attr = attributes[axis.axisId];
                        if (attr !== undefined && !axis.binned && !axis.orthogonal.showBarChart &&   //TODO This should probably be cleaned up
                            !axis.orthogonal.showHistograms      //maybe axis needs value type and display type
                            ) {
                            caseView.pos[indx] =
                                this.viewConfig.transformToPos.apply(this.viewConfig, axis.swap([curCase.attributes[attr], 0]))[indx];
                            if (axis.type === mt.stats.STATS_FIELD_TYPE_CATEGORICAL) {
                                caseView.pos[indx] += (axis.bins[0].width - this.graphModel.caseDiameter) / 2;
                            }
                        }
                    }, this);
                }
            }, this);
            return rtnCaseViews;
        };

        /**
         *
         * @description nudges cases when numerical data on one axis and nothing on the other
         * @param attributes
         * @param axisId
         * */
        StatsCasePositioner.prototype.nudgeNumerical = function(axisId) {
            var isX = axisId === 'x';
            var axis = this.graphModel.axes[axisId];
            var max = axis.orthogonal.renderMax[axis.orthogonal.axisId];
            var caseViews = this.graphModel.getVisibleCases();
            var min = axis.orthogonal.renderMin[axis.orthogonal.axisId];

            this.nudgePositions(caseViews, isX, this.graphModel.caseDiameter, max);
            scaleToFit(caseViews, max, min, isX);
        };

        /**
         *
         * @description nudge cases when numerical data on one axis and binned (including categorical) on other         *
         * @param attributes
         * @param axisId the id ('x' or 'y') of the axis with binned data
         */
        StatsCasePositioner.prototype.nudgeNumericalBinned = function(axisId, attributes) {

            var axis = this.graphModel.axes[axisId];
            var attr = attributes[axis.orthogonal.axisId];
            var multiplier = axis.multiplier;

            _.each(axis.bins, function (bin) {
                // sort the cases within the bin by the numerical attribute
                var sortedBin = _.sortBy(bin, function (c) {return c.case.attributes[attr];});

                if(bin.width>this.graphModel.caseDiameter+4) {

                    // find max and min positions within bin (horizontally if x axis bins, etc
                    var max = bin.start + (multiplier * bin.width / 2) + (multiplier * (bin.width / 2 - 4));
                    var min = bin.start + (multiplier * bin.width / 2) - (multiplier * (bin.width / 2 - 4));

                    // keep in mind that if x axis is binned, the nudging horizontal
                    this.nudgePositions(sortedBin, !axis.isXAxis, this.graphModel.caseDiameter, max, min);
                    scaleToFit(sortedBin, max, min, !axis.isXAxis);
                } else {
                    _(bin).each(function(caseView) {
                        caseView.pos[axis.isXAxis?0:1] = bin.start+ (multiplier * bin.width / 2);
                    });
                }
            }, this);
        };

        /**
         *
         * @description layout cases when both attributes are binned/categorical
         */
        StatsCasePositioner.prototype.nudgeBinnedBinned = function() {
            var diameter = this.graphModel.caseDiameter;
            var matrixCells = this.graphModel.matrixCells;

            // for now assuming all bins same dimensions
            var maxCasesInHeight = _.max([Math.floor((matrixCells[0].height-4) / diameter),1]);
            var maxCasesInWidth = _.max([Math.floor((matrixCells[0].width -4) / diameter),1]);
            var widthToHeightRatio  = maxCasesInWidth/maxCasesInHeight;

            // lets figure out how many rows and columns in each bin
            _.each(matrixCells, function(bin) {
                bin.rowsCols = rowsAndColumns(bin.caseViews.length, widthToHeightRatio);
            },this);

            var maxX = _.max(matrixCells, function (bin) {return bin.rowsCols[0];}).rowsCols[0];
            var maxY = _.max(matrixCells, function (bin) {return bin.rowsCols[1];}).rowsCols[1];

            var nudgeX = diameter, nudgeY = diameter;
            if(maxX > maxCasesInWidth && maxX >1) {
                nudgeX = ((matrixCells[0].width -4) - diameter)/(maxX -1);
            }
            if(maxY > maxCasesInHeight && maxY >1) {
                nudgeY = ((matrixCells[0].height -4) - diameter)/(maxY -1);
            }
            _.each(matrixCells, function(bin) {
                var rows = bin.rowsCols[1];
                var cols = bin.rowsCols[0];

                var anchor = [bin.center[0] - ((cols-1)*nudgeX/2), bin.center[1] + ((rows-1)*nudgeY/2)];
                var indx = 0;

                for(var r = 1; r<=rows; r++) {
                    for(var c = 1; c<=cols; c++){
                        if(bin.caseViews[indx] === undefined) {
                            break;
                        }
                        bin.caseViews[indx++].pos = anchor;
                        anchor = [anchor[0]+nudgeX,anchor[1]];
                    }
                    anchor = [bin.center[0] - ((cols-1)*nudgeX/2),anchor[1]-nudgeY];
                }

            });

        };

        /**
         *
         * @description nudge cases when one attribute is binned (or categorical) and other is undefined
         * @param axisId
         */
        StatsCasePositioner.prototype.nudgeBinned = function(axisId) {
            var axis = this.graphModel.axes[axisId];
            var axisIndx = axis.isXAxis ? 0 : 1;
            var maxCasesPerBin = _.max(_.map(axis.bins, function (b) {return b.y;}));
            var max = axis.orthogonal.renderMax[axis.orthogonal.axisId];
            var min = axis.orthogonal.renderMin[axis.orthogonal.axisId];

            var maxStackHeight = Math.abs(max - min);

            // for now, assume all bins same width
            var maxStackWidth = axis.bins[0]? axis.bins[0].width - 2: Math.abs(axis.getPixMax() - axis.getPixMin()) -2 ;
            var diameter = this.graphModel.caseDiameter;
            var maxCasesInHeight = _.max([Math.floor(maxStackHeight / diameter),1]);
            var maxCasesInWidth = _.max([Math.floor(maxStackWidth / diameter),1]);

            // stackingDepth is the number of columns of cases in a vertical bin (or rows in a horizontal bin).
            // initially set to the maximum we can fit without overlap (maxCasesInWidth), but then try to find if
            // there is some number fewer than that, that can accommodate the maximum number in a bin
            var stackingDepth = maxCasesInWidth;
            var nudgeFactor = diameter;
            for (var i = 1; i <= maxCasesInWidth; i++) {
                if ((i * maxCasesInHeight) > maxCasesPerBin) {
                    stackingDepth = i;
                    break;
                }
            }

            // loop through the bins and handle layout for each one
            _.each(axis.bins, function (bin) {
                var binStackingDepth = stackingDepth;

                // keep things centered if this bin has fewer cases than the stackingDepth
                if (binStackingDepth > bin.y) {
                    binStackingDepth = bin.y;
                }

                _.each(bin, function (caseView, i) {
                    var stackParam = (2 * (i % binStackingDepth) - (binStackingDepth - 1));
                    caseView.pos[axisIndx] = bin.start + axis.multiplier * ((bin.width / 2) + (stackParam * mt.common.GRAPH_CASE_RADIUS));
                });

                if (maxCasesPerBin > maxCasesInHeight * maxCasesInWidth) {
                    nudgeFactor = (maxStackHeight - diameter ) / ((maxCasesPerBin / stackingDepth) - 1);
                }

                _.each(_.values(_.groupBy(bin, function (caseView) {
                    return caseView.pos[axisIndx];
                })), function (cases) {
                    this.nudgePositions(cases, axis.isXAxis, nudgeFactor, max);
                }, this);
            }, this);

            scaleToFit(_(axis.bins).flatten(), max, min, axis.isXAxis);
        };

        /**
         * @description createa matrix of cells from x and y bins
         * @param xBins
         * @param yBins
         */
        StatsCasePositioner.prototype.updateMatrixCells = function(xBins, yBins) {
	        this.graphModel.matrixCells = [];
	        var positioner = this;
            // note that bins can be category bins or numerical bins

            _(xBins).each(function(xbin) {
                _(yBins).each(function(ybin) {
                    var caseViews = _.intersection(ybin, xbin);
                    var matrixCell = {
                        bins: {
                            x: xbin,
                            y: ybin
                        },
                        caseViews: caseViews,
                        startx: xbin.start,
                        starty: ybin.start,
                        height: ybin.width,
                        width: xbin.width,
                        center: [xbin.start + (xbin.width / 2), ybin.start - (ybin.width / 2)],
                        percentage: (100 * (caseViews.length / positioner.graphModel.visibleCaseCount)).toFixed()
                    };
                    positioner.graphModel.matrixCells.push(matrixCell);
                });
            });
        };

        /**
         *
         * @description given a number of cases and an x to y ration, figure out how many rows and columns are needed
         * for a matrix bin
         * @param n number of cases to fit in a matrix bin
         * @param ratio ration of x to y for matrix bin
         * @returns {*}
         */
        function rowsAndColumns(n, ratio) {
            if(n===1) {
                return [1,1];
            }

            var r= 1,c=1;
            for (var i=1;i<=n;i++) {

                if( (i-1)%(c*r) === 0) {
                    if (c/r >= ratio) {
                        r+=1;
                    } else {
                        c+=1;
                    }
                }
            }
            return [c,r];
        }

        /**
         *
         * @param caseViews
         * @param max
         * @param min
         * @param verticalNudge
         * @description  We need to scale everything to fit within allowable area (eg, height of the graph or height of
         *  a horizontal bin/category
         *
         *  if we need to fit n cases of diameter (d) within a width (w), we can define a nudge factor (f)
         *  representing the distance between case center points.
         *
         *  f= (w-d)/(n-1)
         *
         *  where w = |maxPos - minPos|
         *
         *  the center position of the nth stacked case is:
         *  y = min + s*((n-1)f +d/2), where s is the nudge sign (-1 y for vertical nudging, q for horizontal).
         *
         *  which, if unscaled (i.e., f=d) becomes
         *  y = min + s*((n-1)d +d/2)
         *
         *  using the above we can calculate the n value for a given case based on its position in the original
         *  unscaled configuration:
         *  n = s*(o-min)/d +1/2
         *
         *  we can also calculate the new position as a function of the old position
         *  yNew = yOld + s(n-1)(f-d)
         *
         */
        function scaleToFit(caseViews, max, min, verticalNudge) {
            var s,             // nudge sign
                indx,          // index of pos array of cases
                maxHeightCase, // the topmost (or leftmost, horizontal) case that we need to fit in the graph
                minHeightCase, // the lowest (or rightmost, horizontal) case that we need to fit in the graph
                m,             // the pre-scaled maximum height of the stack
                h,             // the maximum height within which we need to fit the case
                f,             // the nudge factor
                d,             // case diameter
                o,             // the original position of a given case
                n;             // the n value for a given case (where it is ordered within stack)

            if(caseViews.length === 0) {
                return;
            }
            if (verticalNudge) {
                s = -1;
                indx = 1;
                maxHeightCase = _(caseViews).min(function (c) { return c.pos[indx];});
                minHeightCase = _(caseViews).max(function (c) { return c.pos[indx];});
            } else {
                s = 1;
                indx = 0;
                maxHeightCase = _(caseViews).max(function (c) { return c.pos[indx];});
                minHeightCase = _(caseViews).min(function (c) { return c.pos[indx];});
            }

            h = Math.abs(max-min);
            d = 2*mt.common.GRAPH_CASE_RADIUS;

            // use maxHeightCase to figure maximum height of stack prior to scaling
            m = Math.abs((maxHeightCase.pos[indx] + s * mt.common.GRAPH_CASE_RADIUS) - min);

            if(m<=d) {
                _(caseViews).each(function (caseView) {
                    caseView.pos[indx] = minHeightCase.pos[indx];
                });
            } else {
                if (m > h) {
                    f = (h - d) / ((m / d) - 1);
                    _(caseViews).each(function (caseView) {

                        o = caseView.pos[indx];
                        n = (s * (o - min) / d) + (1 / 2);
                        caseView.pos[indx] = o + s * (n - 1) * (f - d);

                    });
                }
            }
        }

        return StatsCasePositioner;
    }());
})(window.mt.stats);




(function (ns) {
    'use strict';

    ns.StatsGraphEventineer = (function (eventingService, toolId) {

        //constructor function

        function StatsGraphEventineer(eventingService, toolId, errorCallback) {
            if (!(this instanceof StatsGraphEventineer)) {
                return new StatsGraphEventineer(eventingService, toolId);
            }

            //callback functions - to be registered
            var importFromTable = function () {};
            var handleAttributeDragStart = function () {};
            var handleAttributeDrag = function () {};
            var handleAttributeDragEnd = function () {};
            var handleDataUpdate = function () {};
            var handleDataDelete = function () {};
            var handleClearTable = function () {};
            var handleDataAdd = function () {};
            var handleAttributeDelete = function () {};
            var handleAttributeUpdate = function () {};
            var handleReset = function () {};
            var handleAttributeRename = function () {};
            var handleAttributeTypeChange = function () {};
            var handleRerender = function () {};

            var eventineer = this;

            //public interface

            this.registerHandleAttributeDragStart = function (attributeDragStartFn) {
                handleAttributeDragStart = attributeDragStartFn;
            };

            this.registerHandleAttributeDrag = function (attributeDragFn) {
                handleAttributeDrag = attributeDragFn;
            };

            this.registerHandleAttributeDragEnd = function (attributeDragEndFn) {
                handleAttributeDragEnd = attributeDragEndFn;
            };

            this.registerImportFromTable = function (importFn) {
                importFromTable = importFn;
            };
            this.registerHandleDataUpdate = function (updateFn) {
                handleDataUpdate = updateFn;
            };
            this.registerHandleDataAdd = function (addFn) {
                handleDataAdd = addFn;
            };
            this.registerHandleDataDelete = function (deleteFn) {
                handleDataDelete = deleteFn;
            };
            this.registerHandleClearTable = function (fn) {
                handleClearTable = fn;
            };
            this.registerHandleAttributeDelete = function (deleteFn) {
                handleAttributeDelete = deleteFn;
            };
            this.registerHandleAttributeUpdate = function (updateFn) {
                handleAttributeUpdate = updateFn;
            };
            this.registerHandleReset = function (resetFn) {
                handleReset = resetFn;
            };

            this.registerHandleAttributeRename = function (renameFn) {
                handleAttributeRename = renameFn;
            };

            this.registerHandleAttributeTypeChange = function (typeChangeFn) {
                handleAttributeTypeChange = typeChangeFn;
            };
            this.registerHandleRerender = function (renderFn) {
                handleRerender = renderFn;
            };

            function canHandle(event) {
                var handle = true;
                if (event && event.data) {
                    if (event.sourceId !== eventineer.sourceTableId) {
                        handle = false;
                    } else if (event.data.error) {
                        errorCallback(event.data.error);
                        handle = false;
                    }
                } else {
                    handle = false;
                }
                return handle;
            }

            //subscribe to export request from table
            eventingService.subscribe(toolId, mt.stats.EVENT_EXPORT_CASE_DATA_TO_STATS_GRAPH, function (event) {
                //analyticsService.sendDataImported(event.data, mt.common.TYPE_GRAPH, toolId);
                importFromTable(event.data);
                eventineer.sourceTableId = event.sourceId;
            });
            this.subscribeToGraphEvents = function (toolId) {
                eventingService.subscribe(toolId, ns.TOPIC_STATS_NOTIFY_GRAPHS, function (event) {
                    if (canHandle(event) === true) {
                        //analyticsService.sendDataImported(event.data, mt.common.TYPE_GRAPH, toolId);
                        if (event.type === ns.EVENT_ATTRIBUTE_DRAG_START) {
                            handleAttributeDragStart();
                        }

                        if (event.type === ns.EVENT_ATTRIBUTE_DRAG) {
                            handleAttributeDrag(event);
                        }

                        if (event.type === ns.EVENT_ATTRIBUTE_DRAG_END) {
                            handleAttributeDragEnd(event);
                        }

                        if (event.type === ns.EVENT_DATA_UPDATE) {
                            handleDataUpdate(event);
                        }

                        if (event.type === ns.EVENT_DATA_DELETE) {
                            handleDataDelete(event);
                        }

                        if (event.type === ns.EVENT_CLEAR_TABLE) {
                            handleClearTable(event);
                        }

                        if (event.type === ns.EVENT_DATA_ADD) {
                            handleDataAdd(event);
                        }

                        if (event.type === ns.EVENT_ATTRIBUTE_DELETE) {
                            handleAttributeDelete(event);
                        }

                        if (event.type === ns.EVENT_ATTRIBUTE_UPDATE) {
                            handleAttributeUpdate(event);
                        }

                        if (event.type === ns.EVENT_RESET_GRAPH) {
                            handleReset(event);
                        }

                        if (event.type === ns.EVENT_ATTRIBUTE_RENAME) {
                            handleAttributeRename(event);
                        }

                        if (event.type === ns.EVENT_RERENDER) {
                            handleRerender(event);
                        }

                        if (event.type === ns.EVENT_ATTRIBUTE_TYPE_CHANGE) {
                            handleAttributeTypeChange(event);
                        }
                    }
                });
            };
            this.subscribeToGraphEvents(toolId);
        }

        return StatsGraphEventineer;
    })();
})(window.mt.stats);

(function (ns) {
    'use strict';

    ns.StatsGraphGestureHandler = (function () {
        var threshold = mt.common.TOUCH_SIZE * mt.common.TOUCH_SIZE / 4;
        function StatsGraphGestureHandler(graphModel, viewConfig, updateCallbacks, selectionApi) {
            if (!(this instanceof StatsGraphGestureHandler)) {
                return new StatsGraphGestureHandler(graphModel, viewConfig, updateCallbacks, selectionApi);
            }

            this.mode = mt.stats.GESTURE_MODE_DEFAULT;
            this.graphModel = graphModel;
            this.caseData = graphModel.caseData;
            this.viewConfig = viewConfig;
            this.update = angular.isFunction(updateCallbacks.all) ? updateCallbacks.all : angular.noop;
            this.updateDividers = updateCallbacks.dividers;
            this.updateRulers = updateCallbacks.rulers;
            this.measureDeviations =  updateCallbacks.deviations;
            this.updateCasePosition = updateCallbacks.casePositions;
            this.caseDragEnd = updateCallbacks.caseDragEnd;
            this.addCaseAt = updateCallbacks.addCaseAt;
            this.removeCase = updateCallbacks.removeCase;
            this.selectCase = updateCallbacks.selectCase;
            this.mergeMode = false;
            this.selectionApi = selectionApi;
            // this.unmergeMode = false;
        }

        function distanceSqrd(caseView, renderX, renderY) {
            return Math.pow(caseView.pos[0] - renderX, 2) + Math.pow(caseView.pos[1] - renderY, 2);
        }

        StatsGraphGestureHandler.prototype.setGraphModel = function (graphModel) {
            this.graphModel = graphModel;
            this.caseData = graphModel.caseData;
        };

        StatsGraphGestureHandler.prototype.findNearestDivider = function( x, y) {
            var sortedDividers = _.sortBy(_.filter(
                _.union(this.graphModel.axes.x.dividers,this.graphModel.axes.y.dividers),
                function (d) {
                    return d.active;
                }), function (divider) {
                return (divider.handle.x - x) * (divider.handle.x - x) + (divider.handle.y - y) * (divider.handle.y - y);
            });
            return sortedDividers[0];
        };

        StatsGraphGestureHandler.prototype.holdAtPos = function (posX, posY) {

            // first check if we are trying to get a divider popup
            var divider = this.getDividerAtPos(posX, posY);
            if (divider) {
                this.graphModel.selectedDivider = divider;
                this.graphModel.selectedDividerValue = divider.value;
                this.graphModel.dividerAdjusterStyle = {left: posX, top: posY};
                this.updateDividers();
                return;
            }

            // otherwise, check to see if one an existing case, and remove it, if we are unlocked
            if(!this.graphModel.locked && !this.graphModel.showBarChart() &&!this.graphModel.showHistograms()) {
                var nearestCase = getNearestCase(this.graphModel.allCaseViews, posX, posY);
                if (distanceSqrd(nearestCase, posX, posY) <= threshold) {
                    this.removeCase(nearestCase);
                }
            }
        };

        StatsGraphGestureHandler.prototype.tapAtPos = function (posX, posY) {
            var valid = false;
            this.deselect();
            if (this.lastTap) {
                // this is a total kludge. we should be using hammerjs' requireFailure to prevent second tap
                // of a double tap from being considered a single tap. I don't want to mess with shared directives
                // now, so in the meantime, use the default time difference, and position
                // difference that hammer uses to see if this is a double tap
                if (Date.now > this.lastTap.time + 300 ||
                    Math.pow(posX - this.lastTap.x, 2) + Math.pow(posY - this.lastTap.y, 2) > 100) {
                    valid = true;
                }
            } else {
                valid = true;
            }

            this.lastTap = {
                x: posX,
                y: posY,
                time: Date.now()
            };

            if (!valid) {
                return;
            }

            var minDist = Infinity,
            minDistCaseView;

            _(this.graphModel.allCaseViews).each(function (caseView) {
                var dist = distanceSqrd(caseView, posX, posY);
                if (dist < minDist && dist <= threshold) {
                    minDist = dist;
                    minDistCaseView = caseView;
                }
            });
            if (minDistCaseView) {
                this.caseData.select(minDistCaseView.case);
                this.selectCase(minDistCaseView);
            }

            //SELECTION
            var rulers = _(_(this.graphModel.axes).map(function (a) { return a.ruler ;})).filter(function (r) {
                return r!==undefined;
            });
            var rulerHandles = _.flatten(_.union(_(rulers).map(function(ruler) { return ruler.handles;})));
            var selectedHandle = getSelectedHandle(rulerHandles, posX, posY);
            var divider = this.getDividerAtPos(posX, posY);

            if(selectedHandle !== undefined) {
                this.selectObject(selectedHandle.ruler);
            } else if(divider !== undefined) {
                this.selectObject(divider);
            }
        };

        /**
         * @description get all of the cases within threshold distance of [posX,posY]
         * @param caseViews
         * @param posX
         * @param posY
         * @returns caseView
         */
        function getNearestCase(caseViews, posX, posY) {
            return _(caseViews).min(function (caseView) {
                return distanceSqrd(caseView, posX, posY);
            });
        }

        function getSelectedHandle(handles, posX, posY) {
            var selectedHandle;
            var distFromCenter = function(point) {
                return Math.sqrt(Math.pow(posX-point[0], 2) + Math.pow(posY-point[1],2));
            };
            var touchedHandles = _(handles).filter(function(handle) {
                var center = handle.getCenterPoint();
                return distFromCenter(center) < 50;
            });
            if(touchedHandles.length>0) {
                selectedHandle = _(touchedHandles).min(function (h) {
                    return distFromCenter(h.getCenterPoint());
                });
            }
            return selectedHandle;
        }

        StatsGraphGestureHandler.prototype.dragStartAtPos = function (posX, posY) {
            this.lastDragStartPos = [posX, posY];

            if(!this.graphModel.locked && !this.graphModel.axes.x.binned &&
                !this.graphModel.axes.y.binned && !this.graphModel.showBarChart()) {
                var nearestCase = getNearestCase(this.graphModel.allCaseViews, posX, posY);
                if (distanceSqrd(nearestCase, posX, posY) <= threshold) {
                    this.draggingCase = nearestCase;
                    return;
                }
            }
            var buffer = 15; //mt.common.TOUCH_SIZE /2;
            var labelGroup = this.graphModel.tickLabelGroup;
            var rulers = _(_(this.graphModel.axes).map(function (a) { return a.ruler ;})).
                filter(function (r) {return r!==undefined;});
            var rulerHandles = _.flatten(_.union(_(rulers).map(function(ruler) { return ruler.handles;})));
            var selectedHandle = getSelectedHandle(rulerHandles, posX, posY);

            if(selectedHandle && !selectedHandle.ruler.axis.deviationAnimationInProgress) {
                this.draggingHandle = selectedHandle;
                return;
            }
            //TODO: we aren't accounting for the possibility of a rotated label
            var touchedLabels = labelGroup.selectAll('text').filter(function (t) {
                var box = this.getBBox();
                var minX = box.x - buffer;
                var maxX = box.x + buffer + box.width;
                var minY = box.y - buffer;
                var maxY = box.y + buffer + box.height;
                return (posX>minX && posX< maxX && posY > minY && posY < maxY);
            })[0];

            var srcElem;


            if(touchedLabels.length > 0) {
                if(touchedLabels.length > 1) {
                    var minFn = function(label) {
                        var b = label.getBBox();
                        return Math.pow(((b.x+b.width)/2),2)+Math.pow(((b.y+b.height)/2),2)-((posX*posX)+(posY*posY));
                    };
                    srcElem = _(touchedLabels).min(minFn);
                } else {
                    srcElem = touchedLabels[0];
                }

            }
            var srcElemClass = $(srcElem).attr('class');

            if(srcElemClass &&
                (srcElemClass.indexOf('x-axis-tick-label') !== -1 ||
                    srcElemClass.indexOf('y-axis-tick-label') !== -1 )) {

                var axis = srcElemClass.charAt(0);
                if(this.graphModel.axes[axis].type === mt.stats.STATS_FIELD_TYPE_CATEGORICAL) {

                    this.draggingTickLabel = {
                        srcElem: srcElem,
                        axis: axis
                    };
                    $(srcElem).css('fill', 'red');
                }
            } else {
                this.draggingDivider = this.getDividerAtPos(posX, posY);
                this.updateDividers();
            }
        };

        StatsGraphGestureHandler.prototype.doubleTapAtPos = function (posX, posY) {
            // var rulers = _(_(this.graphModel.axes).map(function (a) { return a.ruler ;})).filter(function (r) {
            //     return r!==undefined;
            // });
            // var rulerHandles = _.flatten(_.union(_(rulers).map(function(ruler) { return ruler.handles;})));
            // var selectedHandle = getSelectedHandle(rulerHandles, posX, posY);
            // // var selectedDivider = this.getDividerAtPos(posX, posY);
            // if(selectedHandle) {
            //     var axis = selectedHandle.ruler.axis;
            //     var startValue = selectedHandle.getDataValue();
            //     var attr = axis.attribute;

            //     // first the deviation
            //     var deviationAttributeHeader = this.caseData.addAttribute('deviation from '+startValue+
            //         ' for '+attr,mt.stats.STATS_FIELD_TYPE_NUMERIC);
            //     deviationAttributeHeader.getter = function() {
            //         return function() {
            //             console.log(this);
            //             return this.attributes[attr] -startValue;
            //         };
            //     };

            //     // and then the absolute deviation
            //     var absDeviationAttributeHeader = this.caseData.addAttribute('absolute deviation from '+startValue+
            //         ' for '+attr,mt.stats.STATS_FIELD_TYPE_NUMERIC);
            //     absDeviationAttributeHeader.getter = function() {
            //         return function() {
            //             return Math.abs(this.attributes[attr] -startValue);
            //         };
            //     };
            //     if(axis.deviationAnimationInProgress) {
            //         if(axis.deviationAnimationDuration > 0.5) {
            //             axis.deviationAnimationDuration /= 2;
            //         }
            //     } else {
            //         this.measureDeviations(selectedHandle,deviationAttributeHeader, absDeviationAttributeHeader);
            //     }
            // } else if(selectedDivider) {
            //     selectedDivider.destroy();
            //     this.updateDividers();
            //} else 
            if (!this.graphModel.axes.x.binned && !this.graphModel.axes.y.binned &&
                !this.graphModel.locked &&!this.graphModel.showBarChart()) {
                this.addCaseAt(posX, posY);
            }
        };

        StatsGraphGestureHandler.prototype.dragAtPos = function (posX, posY) {
            var newVal, delta;

            if(this.draggingCase) {
                this.draggingCase.pos[0] = this.draggingCase.pos[0] +posX- this.lastDragStartPos[0];
                this.draggingCase.pos[1] = this.draggingCase.pos[1] +posY- this.lastDragStartPos[1];
                this.updateCasePosition(this.draggingCase);
                this.lastDragStartPos = [posX, posY];
            }
            if (this.draggingHandle) {
                delta = this.draggingHandle.ruler.axis.swap([posX - this.lastDragStartPos[0], posY - this.lastDragStartPos[1]])[0];
                if(this.draggingHandle.isPastTheOther(this.draggingHandle.getPixelValue()+delta)) {
                    this.draggingHandle = this.draggingHandle.switchHandles();
                }

                this.draggingHandle.setPixelValue(this.draggingHandle.getPixelValue()+delta);
                this.updateRulers();
                this.lastDragStartPos = [posX, posY];
                return;
            }
            if (this.draggingTickLabel !== undefined) {
                var dtl = this.draggingTickLabel;
                dtl.targetElem = undefined;
                $('.mt-' + this.draggingTickLabel.axis + '-axis-tick-label').each(function (i, e) {
                    if(e.id !== dtl.srcElem.id) {
                        $(e).css('fill', '').css('cursor', 'move');
                        var bbox = e.getBBox();
                        if(posX > bbox.x && posY > bbox.y && posX < (bbox.x + bbox.width) && posY < (bbox.y + bbox.height)) {
                            $(e).css('fill', 'yellow').css('cursor', 'crosshair');
                            dtl.targetElem = e;
                        }
                    }
                });
            }
            else if (this.draggingDivider !== undefined) {
                if(this.draggingDivider.axis.isXAxis) {
                    if(posX < this.graphModel.axes.x.renderMin.x) {
                        newVal = this.viewConfig.scale.x.invert(this.graphModel.axes.x.renderMin.x);
                    } else if (posX > this.graphModel.axes.x.renderMax.x) {
                        newVal = this.viewConfig.scale.x.invert(this.graphModel.axes.x.renderMax.x);
                    } else {
                        newVal = this.viewConfig.scale.x.invert(posX);
                    }
                } else {
                    if (posY > this.graphModel.axes.y.renderMin.y) {
                        newVal = this.viewConfig.scale.y.invert(this.graphModel.axes.y.renderMin.y);
                    } else if (posY < this.graphModel.axes.y.renderMax.y) {
                        newVal = this.viewConfig.scale.y.invert(this.graphModel.axes.y.renderMax.y);
                    } else {
                        newVal = this.viewConfig.scale.y.invert(posY);
                    }
                }
                this.draggingDivider.setValue(newVal);
                this.updateDividers();
            }
        };

        StatsGraphGestureHandler.prototype.dragEnd = function () {
            var axis;
            if(this.draggingCase) {
                this.caseDragEnd(this.draggingCase);
                this.draggingCase = undefined;
            }
            if(this.draggingHandle) {
                var handle = this.draggingHandle;
                axis = this.draggingHandle.ruler.axis;
                var snappingPoints = this.graphModel.getSnappingPoints(axis);
                /*var nearSnappingPoints = _(snappingPoints).filter(function (sp) {
                    return Math.abs(handle.getPixelValue() - axis.scale(sp)) < 50;
                });*/
                var closestPoint = _(snappingPoints).min(function(sp) {
                    return Math.abs(handle.getPixelValue() - axis.scale(sp));
                });

                if(closestPoint!==Infinity) {
                    handle.setDataValue(closestPoint);
                }
                this.draggingHandle = undefined;
                this.update();
            }

            if (this.draggingTickLabel !== undefined) {
                var dtl = this.draggingTickLabel;
                $('.mt-' + dtl.axis + '-axis-tick-label').css('fill', '').css('cursor', 'move');
                if(dtl.targetElem !== undefined) {
                    axis = this.graphModel.axes[dtl.axis];
                    var srcIndex;
                    var targetIndex;
                    _.each(axis.range, function (element, index) {
                        if (element.toString() === dtl.srcElem.id) {
                            srcIndex = index;
                        }
                        else if (element.toString() === dtl.targetElem.id) {
                            targetIndex = index;
                        }
                    });
                    if(this.mergeMode) {
                        axis.range[targetIndex] = axis.range[targetIndex].concat(axis.range[srcIndex]);
                        axis.range.splice(srcIndex,1);
                    }
                    //unmerge no longer a toggle, mode is not needed
                    // else if(this.unmergeMode) {
                    //     if(axis.range[srcIndex].length > 1) {
                    //         axis.range.splice(targetIndex, 0, axis.range[srcIndex].splice(-1, 1));
                    //     }
                    // }
                    else {
                        axis.range.splice(targetIndex, 0, axis.range.splice(srcIndex, 1)[0]);
                    }
                    if(axis.attribute === this.caseData.colorAttributeName) {
                        this.caseData.colorAttributeHeader.attributeValues.sortCategories(axis.range);
                    }
                    axis.userSetAxes = true;
                    $('.mt-' + dtl.axis + '-axis-tick-label').css('fill', '');
                    this.update();
                }
                this.draggingTickLabel = undefined;
            } else if(this.draggingDivider) {
                this.draggingDivider = undefined;
                this.updateDividers();
            }
        };

        StatsGraphGestureHandler.prototype.getCategoryAtPos = function (pos) {
            var closestCategory = this.graphModel.axes.y.categories[0];
            var viewConfig = this.viewConfig;
            _.each(this.graphModel.axes.y.categories, function (category) {
                if(Math.abs(viewConfig.scale.y(category) -pos) <= Math.abs(viewConfig.scale.y(closestCategory) - pos)) {
                    closestCategory = category;
                }
            });
            return closestCategory;
        };

        StatsGraphGestureHandler.prototype.getDividerAtPos = function(posX, posY, touchSize) {
            var selectedDivider;
            if (touchSize === undefined) {
                touchSize = mt.common.TOUCH_SIZE;
            }
            var nearest = this.findNearestDivider(posX,posY);
            if(nearest) {
                var handleX = nearest.handle.x;
                var handleY = nearest.handle.y;

                var distSq = (handleX - posX) * (handleX - posX) + (handleY - posY) * (handleY - posY);
                if (distSq < touchSize * touchSize / 4) {
                    selectedDivider = nearest;
                }

                return selectedDivider;
            }
        };

        // this.selectAtPos = function (posX, posY, id) {
        //     self.deselect();

        //     if(self.mode !== mt.common.GESTURE_MODE_DEFAULT) {
        //         return false;
        //     }
        //     var selectedObject;
        //     if(id !== undefined) {
        //         selectedObject = graphModel.getObject(id);
        //     } else {
        //         selectedObject = executeHandlers(selectHandlers, posX, posY);
        //     }

        //     if(selectedObject) {
        //         self.selectObject(selectedObject);
        //     }

        //     update(false);
        //     return selectedObject;
        // };

        StatsGraphGestureHandler.prototype.selectObject = function(modelObject) {
            modelObject.isSelected = true;
            if(this.selectionApi !== undefined) {
                this.selectionApi.setSelection({type: modelObject.type(), modelObject: modelObject});
            }
        };

        StatsGraphGestureHandler.prototype.deselect = function() {
            this.graphModel.deselectAll();
            if(this.selectionApi !== undefined) {
                this.selectionApi.clear();
            }
            this.update();
        };

        return StatsGraphGestureHandler;
    }());
})(window.mt.stats);

(function (ns) {

    'use strict';

    ns.StatsGraphModel = (function () {

        function StatsGraphModel() {
            this.axes = {
                x: new mt.stats.StatsAxis('x'),
                y: new mt.stats.StatsAxis('y')
            };
            this.axes.x.orthogonal = this.axes.y;
            this.axes.y.orthogonal = this.axes.x;
            this.showGridLines = true;
            this.showAxes = true;
            this.attributes = { x:undefined, y:undefined, color:undefined };
        }

        StatsGraphModel.prototype.findNearestDivider = function(x,y) {
            var sortedDividers = _.sortBy(_.union(this.axes.x.dividers,this.axes.y.dividers), function (divider) {
                return (divider.handle.x - x)*(divider.handle.x - x) + (divider.handle.y - y)*(divider.handle.y - y);
            });
            return sortedDividers[0];
        };

        StatsGraphModel.prototype.showHistograms = function() {
            return this.axes.x.showHistograms || this.axes.y.showHistograms ;
        };
        StatsGraphModel.prototype.showBarChart = function() {
            return this.axes.x.showBarChart || this.axes.y.showBarChart ;
        };

        /**
         * @description given a list of caseViews, return a filtered list containing only those for which
         *              the case has an attribute value within the ranges of numerical axes.
         * @param caseViews
         * @returns {*}
         */
        StatsGraphModel.prototype.getVisibleCases = function(caseViews) {
            if(caseViews===undefined) {
                caseViews = this.filteredCaseViews;
            }
            var filteredCases = _.filter(caseViews, function (caseView) {
                var passFilter = {x:true,y:true};
                _(this.axes).each(function (axis) {
                    var attr = axis.attribute;
                    if(attr !== undefined &&
                        (axis.type === mt.stats.STATS_FIELD_TYPE_NUMERIC) &&
                        ( caseView.case.attributes[attr] < axis.min[axis.axisId].val() ||
                            caseView.case.attributes[attr] > axis.max[axis.axisId].val())) {
                        passFilter[axis.axisId] = false;
                    }
                });
                return passFilter.x && passFilter.y;
            }, this);

            return filteredCases;
        };
        StatsGraphModel.prototype.getSnappingPoints = function(axis){
            var snappingPoints = _(this.getVisibleCases()).map(function (c) {return c.case.attributes[axis.attribute];});
            _(_(axis.means).map(function (m) {return m.mean;})).each(function (value) {snappingPoints.push(value);});
            _(_(axis.medians).map(function (m) {return m.median;})).each(function (value) {snappingPoints.push(value);});
            _(_(axis.dividers).map(function (d) {return d.value;})).each(function (value) {snappingPoints.push(value);});
            snappingPoints.push(axis.getMin());
            snappingPoints.push(axis.getMax());
            return snappingPoints;
        };

        StatsGraphModel.prototype.deselectAll = function () {
            var deselectObject = function (object) {
                object.isSelected = false;
            };

            _(this.axes).each(deselectObject);
            _(this.axes.dividers).each(deselectObject);
            _(this.axes.rulers).each(deselectObject);
        };

        return StatsGraphModel;

    }());
})(window.mt.stats);

(function (ns) {

    'use strict';

    ns.StatsGraphRenderer = (function (containerElement, graphModel, viewConfig, toolId) {

        function StatsGraphRenderer(containerElement, graphModel, viewConfig, toolId) {
            this.graphModel = graphModel;
            this.viewConfig = viewConfig;
            this.containerElement = containerElement;
            this.initSVG(toolId);
        }

        StatsGraphRenderer.prototype.initSVG = function (toolId) {
            var svg = d3.select(this.containerElement.childNodes[0]);
            this.vis = svg.append('svg:g');

            this.clipId = 'clip' + toolId;
            svg.append('svg:defs').append('svg:clipPath')
                .attr('id', this.clipId)
                .append('svg:rect')
                .attr('x', this.viewConfig.margin.left)
                .attr('y', this.viewConfig.margin.top)
                .attr('width', this.viewConfig.width - (this.viewConfig.margin.left + this.viewConfig.margin.right))
                .attr('height', this.viewConfig.height - (this.viewConfig.margin.top + this.viewConfig.margin.bottom));

            // order matters here, because it sets the z-order on the graph

            this.gridGroup = this.vis.append('svg:g');
            this.axisGroup = this.vis.append('svg:g');
            this.tickLabelGroup = this.vis.append('svg:g');
            this.axisLabelGroup = this.vis.append('svg:g');
            this.dataGroup = this.vis.append('svg:g');
            this.binBoundaryGroup = this.vis.append('svg:g');
            this.binLabelGroup = this.vis.append('svg:g');
            this.histogramLabelGroup = this.vis.append('svg:g');
            this.categoryBoundaryGroup = this.vis.append('svg:g');
            this.rectangleGroup = this.vis.append('svg:g');
            this.barBorderGroup = this.vis.append('svg:g');
            this.dividerGroup = this.vis.append('svg:g');
            this.sectionGroup = this.vis.append('svg:g');
            this.matrixGroup = this.vis.append('svg:g');
            this.rulerGroup = this.vis.append('svg:g');
            this.boxGroup = this.vis.append('svg:g');
            this.meansGroup = this.vis.append('svg:g');
            this.mediansGroup = this.vis.append('svg:g');
            this.MADsGroup = this.vis.append('svg:g');
            this.meanBinGroup = this.vis.append('svg:g');
            this.mediansBinGroup = this.vis.append('svg:g');
            this.deviationsGroup = this.vis.append('svg:g');

            // let the graphModel know about the axisLabelGroup so it can be used in gesture handler
            this.graphModel.tickLabelGroup = this.tickLabelGroup;

            this.caseRenderDuration = 2000;

        };
        StatsGraphRenderer.prototype.render = function (updateAxes, afterCaseDataRenderCallbackFn) {
            var currentTime = Date.now();
            if (this.lastRenderTime && currentTime - this.lastRenderTime < 2000) {
                this.caseRenderDuration = currentTime - this.lastRenderTime;
            } else {
                this.caseRenderDuration = 2000;
            }
            this.lastRenderTime = Date.now();
            if (updateAxes !== false) {
                var ranges = getRanges(this),
                    xRange = ranges[0],
                    yRange = ranges[1];
                this.viewConfig.update(xRange, yRange, {'x': this.graphModel.axes.x.type, 'y': this.graphModel.axes.y.type});
                this.renderAxis(this.graphModel.axes.x, true);
                this.renderAxis(this.graphModel.axes.y, false);
            }

            this.renderBinBoundaries();
            this.renderCaseData(afterCaseDataRenderCallbackFn);
            this.renderDividers();
            this.renderSections();
            this.renderCategoryBoundaries();
            this.renderMatrices();
            this.renderBoxes();
            this.renderMeans();
            this.renderMedians();
            this.renderMADs();
            this.renderBinMedians();
            this.renderBinMeans();
            this.renderRulers();
        };
        StatsGraphRenderer.prototype.renderItem = function (group, data, className, type, renderFn, keyFn) {
            //TODO: can we remove viewConfig
            var viewConfig = this.viewConfig;
            var xPos = function (valX, valY, xAxis) { return viewConfig.transformToPos(valX, valY, xAxis)[0];};
            var yPos = function (valX, valY, xAxis) { return viewConfig.transformToPos(valX, valY, xAxis)[1];};

            var elements;

            if (keyFn !== undefined) {
                elements = group.selectAll('.' + className).data(data, keyFn);
            } else {
                elements = group.selectAll('.' + className).data(data);
            }

            elements.enter().append(type).attr('class', className);
            elements.exit().remove();

            // ordering helps stats cases overlap nicely
            elements.order();
            renderFn(elements, xPos, yPos);
        };

        StatsGraphRenderer.prototype.renderMatrices = function () {
            var showCounts = this.graphModel.showCounts;
            var showPercentages = this.graphModel.showPercentages;
            this.renderItem(this.matrixGroup, this.graphModel.matrixCells, 'mt-matrix-count-label', 'svg:text', function (elements) {
                elements.text(function (d) {
                    var count = d.caseViews.length;
                    if (showCounts && showPercentages) {
                        return count + '(' + d.percentage + '%)';
                    } else if (showCounts) {
                        return count;
                    } else if (showPercentages) {
                        return d.percentage + '%';
                    }
                })
                    .attr('x', function (d) {
                        return d.startx + d.width - 2;
                    })
                    .attr('y', function (d) {
                        return d.starty - d.height + 2;
                    })
                    .attr('dominant-baseline', 'hanging')
                    .attr('fill', 'blue')
                    .attr('text-anchor', 'end')
                    .attr('font-size', 12);
            });
        };
        StatsGraphRenderer.prototype.renderBinBoundaries = function () {
            //render the line from axis min to axis max - graph space coordinates
            var axes = this.graphModel.axes;
            var min = this.graphModel.axes.y.renderMin.y;
            var max = this.graphModel.axes.y.renderMax.y;
            var labelledBins, labelledBinBoundaries;
	        var self = this;

            this.renderItem(this.binBoundaryGroup, axes.x.binBoundaries, 'mt-x-bin', 'svg:line', function (elements, xPos, yPos) {
                elements.attr('x1', function (d) { return d.pos; })
                    .attr('y1', function (d) { return min; })
                    .attr('x2', function (d) { return d.pos; })
                    .attr('y2', function (d) { return max; })
                    .attr('class', function (d) { return 'mt-x-bin'; })
                    .style('stroke', mt.common.GRAPH_BIN_COLOR)
                    .style('stroke-width', mt.common.GRAPH_AXIS_WIDTH);
            });
            if (axes.x.bins !== undefined) {
                labelledBins = axes.x.showHistograms ? [] : axes.x.bins;
                labelledBinBoundaries = axes.x.showHistograms ? axes.x.binBoundaries : [];
                this.renderItem(this.binLabelGroup, labelledBins, 'mt-x-bin-label', 'svg:text', function (elements) {
                    var labelFitter = new LabelFitter();
                    elements.text(function (d) { return d.label; })
                        .attr('class', 'mt-x-bin-label')
                        .attr('x', function (d) {return d.start + (d.width / 2);})
                        .attr('y', function (d) {return min + 5;})
                        .attr('dominant-baseline', 'hanging')
                        .attr('text-anchor', 'middle')
                        .attr('font-size', 12)
                        .call(labelFitter.xLabelTooLong)
                        .attr('y', function (d, indx) {
                            var y = parseFloat(d3.select(this).attr('y'));
                            if (labelFitter.labelsStaggered) {
                                y += ((this.getBBox().height / 2)) * (indx % 2 === 0 ? -1 : 1) + 5;
                            }
                            return y;
                        });
                });

                this.renderItem(this.histogramLabelGroup, labelledBinBoundaries, 'mt-x-histogram-label', 'svg:text', function (elements) {
                    var labelFitter = new LabelFitter();
                    elements.text(function (d) { return d.label;})
                        .attr('class', 'mt-x-histogram-label')
                        .attr('x', function (d) { return d.pos; })
                        .attr('y', function (d) { return min + 5;})
                        .attr('dominant-baseline', 'hanging')
                        .attr('text-anchor', 'middle')
                        .attr('font-size', 12)
                        .call(labelFitter.xLabelTooLong)
                        .attr('y', function (d, indx) {
                            var y = parseFloat(d3.select(this).attr('y'));
                            if (labelFitter.labelsStaggered) {
                                y += ((this.getBBox().height / 2)) * (indx % 2 === 0 ? -1 : 1) + 5;
                            }
                            return y;
                        });
                });

                this.renderItem(this.binLabelGroup, axes.x.bins, 'mt-x-count-label', 'svg:text', function (elements) {

                    elements.text(function(d) { return self.countsAndPercents(d);})
                        .attr('class', 'mt-x-count-label')
                        .attr('x', function (d) { return d.start + (d.width / 2);})
                        .attr('y', function (d) { return max - 5;})
                        .attr('dominant-baseline', 'middle')
                        .attr('fill', 'blue')
                        .attr('text-anchor', 'middle')
                        .attr('font-size', 12);
                });
            }
            min = this.graphModel.axes.x.renderMin.x;
            max = this.graphModel.axes.x.renderMax.x;
            this.renderItem(this.binBoundaryGroup, axes.y.binBoundaries, 'mt-y-bin', 'svg:line', function (elements, xPos, yPos) {
                elements.attr('y1', function (d) { return d.pos; })
                    .attr('x1', function (d) { return min; })
                    .attr('y2', function (d) { return d.pos; })
                    .attr('x2', function (d) { return max; })
                    .attr('class', function (d) { return 'mt-y-bin'; })
                    .style('stroke', mt.common.GRAPH_BIN_COLOR)
                    .style('stroke-width', mt.common.GRAPH_AXIS_WIDTH);
            });

            if (axes.y.bins !== undefined) {
                labelledBins = axes.y.showHistograms ? [] : axes.y.bins;
                labelledBinBoundaries = axes.y.showHistograms ? axes.y.binBoundaries : [];
                this.renderItem(this.binLabelGroup, labelledBins, 'mt-y-bin-label', 'svg:text', function (elements) {
                    var labelFitter = new LabelFitter();
                    elements.text(function (d) { return d.label;})
                        .attr('class', 'mt-y-bin-label')
                        .attr('x', function (d) {return min - 5;})
                        .attr('y', function (d) {return d.start - (d.width / 2);})
                        .attr('dominant-baseline', 'middle')
                        .attr('text-anchor', 'end')
                        .attr('font-size', 12)
                        .call(labelFitter.yLabelTooLong)
                        .attr('transform', function (d, indx) {
                            var transform = '';
                            var box = this.getBBox();
                            if (labelFitter.labelsRotated) {
                                transform = 'rotate(-45 ' + (box.x + box.width) + ' ' + (box.height / 2 + box.y) + ')';
                            }
                            return transform;
                        });
                });

                this.renderItem(this.histogramLabelGroup, labelledBinBoundaries, 'mt-y-histogram-label', 'svg:text', function (elements) {
                    var labelFitter = new LabelFitter();
                    elements.text(function (d) {
                        return d.label;
                    })
                        .attr('class', 'mt-y-histogram-label')
                        .attr('y', function (d) { return d.pos; })
                        .attr('x', function (d) { return min - 5; })
                        .attr('dominant-baseline', 'hanging')
                        .attr('text-anchor', 'end')
                        .attr('font-size', 12)
                        .call(labelFitter.yLabelTooLong)
                        .attr('transform', function (d, indx) {
                            var transform = '';
                            var box = this.getBBox();
                            if (labelFitter.labelsRotated) {
                                transform = 'rotate(-45 ' + (box.x + box.width) + ' ' + (box.height / 2 + box.y) + ')';
                            }
                            return transform;
                        });
                });
                this.renderItem(this.binLabelGroup, axes.y.bins, 'mt-y-count-label', 'svg:text', function (elements) {

                    elements.text(function(d) { return self.countsAndPercents(d);})
                        .attr('class', 'mt-y-count-label')
                        .attr('y', function (d) { return d.start - (d.width / 2); })
                        .attr('x', function (d) { return max + 3; })
                        .attr('dominant-baseline', 'middle')
                        .attr('fill', 'blue')
                        .attr('text-anchor', 'start')
                        .attr('font-size', 12);
                });
            }
        };
        StatsGraphRenderer.prototype.renderCategoryBoundaries = function () {
            var boundaries = _.union(this.graphModel.axes.y.categoryBoundaries, this.graphModel.axes.x.categoryBoundaries);

            this.renderItem(this.categoryBoundaryGroup, boundaries, 'mt-category-boundary', 'svg:line', function (elements, xPos, yPos) {
                elements.attr('x1', function (d) { return d.x1;})
                    .attr('x2', function (d) { return d.x2;})
                    .attr('y1', function (d) { return d.y1;})
                    .attr('y2', function (d) { return d.y2; })
                    .attr('class', function (d) { return 'mt-category-boundary'; })
                    .style('stroke', '#A8A8A8');
            });
        };
        StatsGraphRenderer.prototype.renderSections = function () {
            var binSections, self = this;

            _(this.graphModel.axes).each(function (axis) {
                var orthogonal = axis.orthogonal;
                var className = 'mt-' + axis.axisId + '-sections';
                var renderFn = function (elements) {
                    elements
                        .attr(axis.axisId, function (d) {
                            return axis.swap(d.renderPos)[0];
                        })
                        .attr(orthogonal.axisId, function (d) {return axis.swap(d.renderPos)[1] + (axis.isXAxis ? -15 : 3);})
                        .attr('text-anchor', axis.isXAxis ? 'middle' : 'start')
                        .attr('dominant-baseline', axis.isXAxis ? 'alphabetical' : 'middle')
                        .attr('fill', mt.common.GRAPH_DIVIDER_COLOR)
                        .text(function (d) {
                            if (orthogonal.showHistograms || orthogonal.showBarChart || axis.type === undefined) {
                                return '';
                            } else {
                                return(self.countsAndPercents(d));
                            }
                        })
                        .attr('font-size', 12)
                        .attr('transform', function (d) {
                            return axis.isXAxis || (!axis.binned && axis.type !== mt.stats.STATS_FIELD_TYPE_CATEGORICAL) ?
                                '' :
                                'rotate(90 ' + 450 + ' ' + (d.renderPos ? d.renderPos[1] : 0) + ') translate(0,-14)';
                        });
                };
                this.renderItem(this.sectionGroup, axis.sections, className, 'svg:text', renderFn);

                binSections = _(_(_(axis.orthogonal.bins).filter(function (b) {
                    return b.sections !== undefined;
                })).map(function (b) {
                    return b.sections;
                })).flatten(true);
                this.renderItem(this.sectionGroup, binSections, className + '-bins', 'svg:text', renderFn);
            }, this);
        };
        StatsGraphRenderer.prototype.renderBoxes = function () {
            _(this.graphModel.axes).each(function (axis) {
                var className = 'mt-' + axis.axisId + '-box';
                var orthogonal = axis.orthogonal;
                this.renderItem(this.boxGroup, axis.boxes, className + '-left-box', 'svg:rect', function (elements) {
                    elements.attr(axis.axisId, function (d) {return d.leftBrim;})
                        .attr(orthogonal.axisId, function (d) {return d.position;})
                        .attr('fill', '#dddddd')
                        .attr('fill-opacity', 0.7)
                        .style('stroke', 'black')
                        .style('stroke-width', '2px')
                        .attr('height', function (d) {return axis.swap([d.height, Math.abs(d.crownCenter - d.leftBrim)])[0];})
                        .attr('width', function (d) {return axis.swap([d.height, Math.abs(d.crownCenter - d.leftBrim)])[1];});
                }, function (d) {return d.identifier;});
                this.renderItem(this.boxGroup, axis.boxes, className + '-right-box', 'svg:rect', function (elements) {
                    elements.attr(axis.axisId, function (d) {return d.crownCenter;})
                        .attr(orthogonal.axisId, function (d) {return d.position;})
                        .attr('fill', '#dddddd')
                        .attr('fill-opacity', 0.7)
                        .style('stroke', 'black')
                        .style('stroke-width', '2px')
                        .attr('height', function (d) {return axis.swap([d.height, Math.abs(d.rightBrim - d.crownCenter)])[0];})
                        .attr('width', function (d) {return axis.swap([d.height, Math.abs(d.rightBrim - d.crownCenter)])[1];});
                }, function (d) {return d.identifier;});
                this.renderItem(this.boxGroup, axis.boxes, className + '-left-box-line', 'svg:line', function (elements) {
                    elements.attr(axis.axisId + '1', function (d) {return d.min;})
                        .attr(axis.axisId + '2', function (d) {return d.leftBrim;})
                        .attr(orthogonal.axisId + '1', function (d) {return d.position + (d.height ? d.height / 2 : 50);})
                        .attr(orthogonal.axisId + '2', function (d) {return d.position + (d.height ? d.height / 2 : 50);})
                        .style('stroke', 'black')
                        .style('stroke-width', '2px');
                }, function (d) {return d.identifier;});
                this.renderItem(this.boxGroup, axis.boxes, className + '-right-box-line', 'svg:line', function (elements) {
                    elements.attr(axis.axisId + '1', function (d) {return d.rightBrim;})
                        .attr(axis.axisId + '2', function (d) {return d.max;})
                        .attr(orthogonal.axisId + '1', function (d) {return d.position + (d.height ? d.height / 2 : 50);})
                        .attr(orthogonal.axisId + '2', function (d) {return d.position + (d.height ? d.height / 2 : 50);})
                        .style('stroke', 'black')
                        .style('stroke-width', '2px');
                }, function (d) {return d.identifier;});
                this.renderItem(this.boxGroup, axis.boxes, className + '-left-box-end', 'svg:line', function (elements) {
                    elements.attr(axis.axisId + '1', function (d) {return d.min;})
                        .attr(axis.axisId + '2', function (d) {return d.min;})
                        .attr(orthogonal.axisId + '1', function (d) {return d.position;})
                        .attr(orthogonal.axisId + '2', function (d) {return d.position + (d.height ? d.height : 50);})
                        .style('stroke', 'black')
                        .style('stroke-width', '2px');
                }, function (d) {return d.identifier;});
                this.renderItem(this.boxGroup, axis.boxes, className + '-right-box-end', 'svg:line', function (elements) {
                    elements.attr(axis.axisId + '1', function (d) {return d.max;})
                        .attr(axis.axisId + '2', function (d) {return d.max;})
                        .attr(orthogonal.axisId + '1', function (d) {return d.position;})
                        .attr(orthogonal.axisId + '2', function (d) {return d.position + (d.height ? d.height : 50);})
                        .style('stroke', 'black')
                        .style('stroke-width', '2px');
                }, function (d) {return d.identifier;});
            }, this);
        };
        StatsGraphRenderer.prototype.renderDividers = function () {
            _(this.graphModel.axes).each(function (axis) {
                var className = 'mt-' + axis.axisId + '-divider';
                this.renderItem(this.dividerGroup, axis.dividers, className, 'svg:line', function (elements) {
                    elements
                        .attr(axis.axisId + '1', function (d) { return d.position;})
                        .attr(axis.axisId + '2', function (d) { return d.position;})
                        .attr(axis.orthogonal.axisId + '1', function (d) { return d.min;})
                        .attr(axis.orthogonal.axisId + '2', function (d) { return d.max;})
                        .attr('opacity', function (d) { return d.active ? 1 : 0;})
                        .style('stroke', mt.common.GRAPH_DIVIDER_COLOR)
                        .style('stroke-width', mt.common.GRAPH_AXIS_WIDTH);
                });
                this.renderItem(this.dividerGroup, axis.dividers, className + '-text', 'svg:text', function (elements) {
                    elements
                        .attr(axis.axisId, function (d) { return d.position;})
                        .attr(axis.orthogonal.axisId, function (d) { return d.min + (axis.multiplier * 2);})
                        .text(function (d) { return (d.value).toFixed(2);})
                        .attr('text-anchor', function (d) { return axis.isXAxis ? 'middle' : 'end';})
                        .attr('dominant-baseline', function (d) {return axis.isXAxis ? 'hanging' : 'middle';})
                        .attr('opacity', function (d) { return d.active ? 1 : 0;})
                        .attr('font-size', 12)
                        .style('stroke', mt.common.GRAPH_DIVIDER_COLOR)
                        .style('stroke-width', mt.common.GRAPH_AXIS_WIDTH);
                });
                this.renderItem(this.dividerGroup, axis.dividers, className + '-circle', 'svg:circle', function (elements) {
                    elements
                        .attr('cy', function (d) { return d.handle.y;})
                        .attr('cx', function (d) { return d.handle.x;})
                        .attr('opacity', function (d) { return d.active ? 1 : 0;})
                        .attr('r',  mt.common.GRAPH_POINT_RADIUS)
                        .attr('fill', mt.common.GRAPH_DIVIDER_COLOR)
                        .attr('stroke',  mt.common.GRAPH_DIVIDER_COLOR);
                });
            }, this);
        };
        StatsGraphRenderer.prototype.renderRulers = function () {
            _(this.graphModel.axes).each(function (axis) {
                var className = 'mt-' + axis.axisId + '-ruler';

                this.renderItem(this.rulerGroup, axis.ruler ? [axis.ruler] : [], className, 'svg:rect', function (elements) {
                    elements
                        .attr(axis.axisId, function (d) { return d.handles[0].getPixelValue();})
                        .attr(axis.orthogonal.axisId, function (d) {
                            return d.orthogonalCoordinate;
                        })
                        .attr('height', function (d) { return axis.swap([d.thickness, d.getLength()])[0];})
                        .attr('width', function (d) { return axis.swap([d.thickness, d.getLength()])[1];})
                        .attr('opacity', 0.25)
                        .style('fill', '#ffa500')
                        .style('stroke', '#4467ff');
                });

                var handles = axis.ruler ? axis.ruler.handles : [];
                this.renderItem(this.rulerGroup, handles, className + '-handle', 'svg:path', function (elements) {
                    elements
                        .attr('transform', function (d) {
                            return 'translate(' +
                                axis.swap([d.getPixelValue(), d.ruler.orthogonalCenterPosition]).join(',')+ ')';
                        })
                        .attr('d', d3.svg.arc()
                            .innerRadius(0)
                            .outerRadius(25)
                            .startAngle(function (d) { return d.startAngle * Math.PI; })
                            .endAngle(function (d, i) { return d.endAngle * Math.PI; }))
                        .style('fill', '#666666')
                        .style('fill-opacity', 0.8)
                        .style('stroke', 'black')
                        .style('stroke-width', 2);
                });

                this.renderItem(this.rulerGroup, handles, className + '-line', 'svg:line', function (elements) {
                    elements
                        .attr(axis.axisId + '1', function (d) { return d.getPixelValue();})
                        .attr(axis.axisId + '2', function (d) { return d.getPixelValue();})
                        .attr(axis.orthogonal.axisId + '1', function (d) { return d.ruler.orthogonalCoordinate;})
                        .attr(axis.orthogonal.axisId + '2', function (d) { return axis.orthogonal.getPixMin();})
                        .attr('stroke-dasharray', '5,5')
                        .style('stroke', 'green')
                    ;
                });

                this.renderItem(this.rulerGroup, axis.ruler ? [axis.ruler] : [], className + '-label', 'svg:text', function (elements) {
                    elements
                        .attr('x', function (d) {
                            if (axis.isXAxis) {
                                return d.handles[0].getPixelValue() + 5;
                            } else {
                                return d.orthogonalCenterPosition + 1;
                            }
                        })
                        .attr('y', function (d) {
                            return (axis.isXAxis ? d.orthogonalCoordinate : d.handles[0].getPixelValue()) + 5;
                        })
                        .text(function (d) { return Math.floor(d.getDataLength());})
                        .attr('dominant-baseline', 'hanging')
                        .attr('font-size', 12)
                        .style('stroke', 'blue')
                        .style('stroke-width', mt.common.GRAPH_AXIS_WIDTH);
                });
            }, this);
        };

        StatsGraphRenderer.prototype.renderMeans = function () {
            _(this.graphModel.axes).each(function (axis) {
                var className = 'mt-' + axis.axisId + '-mean';
                var textXY = function (d) { return axis.swap([d.renderVal, d.renderMin + (axis.multiplier * 11)]); };
                this.renderItem(this.meansGroup, axis.means, className, 'svg:line', function (elements) {
                    elements.attr(axis.axisId + '1', function (d) { return d.renderVal; })
                        .attr(axis.axisId + '2', function (d) { return d.renderVal; })
                        .attr(axis.orthogonal.axisId + '1', function (d) { return d.renderMin; })
                        .attr(axis.orthogonal.axisId + '2', function (d) { return d.renderMax; })
                        .style('stroke', mt.common.GRAPH_MEAN_COLOR)
                        .style('stroke-width', 2);
                });
                this.renderItem(this.meansGroup, axis.means, className + '-symbol', 'svg:polygon', function (elements) {
                    elements.attr('points', function (d) {
                        return  [
                            axis.swap([d.renderVal, d.renderMin]).join(','),
                            axis.swap([d.renderVal - 6, d.renderMin + (axis.multiplier * 9)]).join(','),
                            axis.swap([d.renderVal + 6, d.renderMin + (axis.multiplier * 9)]).join(',')
                        ].join(' ');
                    })
                        .style('stroke', mt.common.GRAPH_MEAN_COLOR)
                        .style('fill', 'white')
                        .style('stroke-width', 2);
                });
                this.renderItem(this.meansGroup, axis.means, className + '-text-shadow', 'svg:text', function (elements) {
                    elements.text(function (d) { return parseFloat(d.mean).toFixed(2); })
                        .attr('class', className + '-text-shadow')
                        .attr('x', function (d) { return textXY(d)[0];})
                        .attr('y', function (d) { return textXY(d)[1];})
                        .attr('dominant-baseline', axis.isXAxis ? 'hanging' : 'middle')
                        .attr('text-anchor', axis.isXAxis ? 'middle' : 'end')
                        .style('stroke', 'white')
                        .style('stroke-width', 4)
                        .attr('font-size', 12);
                });
                this.renderItem(this.meansGroup, axis.means, className + '-text', 'svg:text', function (elements) {
                    elements.text(function (d) { return parseFloat(d.mean).toFixed(2);})
                        .attr('x', function (d) { return textXY(d)[0];})
                        .attr('y', function (d) { return textXY(d)[1];})
                        .attr('dominant-baseline', axis.isXAxis ? 'hanging' : 'middle')
                        .attr('text-anchor', axis.isXAxis ? 'middle' : 'end')
                        .attr('stroke', mt.common.GRAPH_MEAN_COLOR)
                        .attr('font-size', 12);
                });
            }, this);
        };
        StatsGraphRenderer.prototype.renderBinMeans = function (axisId) {
            _(this.graphModel.axes).each(function (axis) {
                var className = 'mt-' + axis.axisId + '-bin-mean';
                var textXY = function (d) {
                    return axis.swap([(d.renderMin + d.renderMax) / 2, d.renderPos + (axis.multiplier * 11)]);
                };
                this.renderItem(this.meanBinGroup, axis.meanBins, className + '-line', 'svg:line', function (elements) {
                    elements.attr(axis.axisId + '1', function (d) { return d.renderMin; })
                        .attr(axis.axisId + '2', function (d) { return d.renderMax; })
                        .attr(axis.orthogonal.axisId + '1', function (d) { return d.renderPos; })
                        .attr(axis.orthogonal.axisId + '2', function (d) { return d.renderPos; })
                        .style('stroke', mt.common.GRAPH_MEAN_COLOR)
                        .style('stroke-width', 5);
                });
                this.renderItem(this.meanBinGroup, axis.meanBins, className + '-text-shadow', 'svg:text', function (elements) {
                    elements.text(function (d) { return parseFloat(d.mean).toFixed(2);})
                        .attr('x', function (d) { return textXY(d)[0];})
                        .attr('y', function (d) { return textXY(d)[1];})
                        .attr('dominant-baseline', axis.isXAxis ? 'hanging' : 'middle')
                        .attr('text-anchor', axis.isXAxis ? 'middle' : 'end')
                        .style('stroke', 'white')
                        .style('stroke-width', 4)
                        .attr('font-size', 12);
                });
                this.renderItem(this.meanBinGroup, axis.meanBins, className + '-text', 'svg:text', function (elements) {
                    elements.text(function (d) { return parseFloat(d.mean).toFixed(2);})
                        .attr('x', function (d) { return textXY(d)[0];})
                        .attr('y', function (d) { return textXY(d)[1];})
                        .attr('dominant-baseline', axis.isXAxis ? 'hanging' : 'middle')
                        .attr('text-anchor', axis.isXAxis ? 'middle' : 'end')
                        .attr('stroke', mt.common.GRAPH_MEAN_COLOR)
                        .attr('font-size', 12);
                });
            }, this);
        };
        // MAD rectangle for X and Y axis continuous numeric data
        StatsGraphRenderer.prototype.renderMADs = function () {
            _(this.graphModel.axes).each(function (axis) {
                var className = 'mt-' + axis.axisId + '-mad';
                var orthogonal = axis.orthogonal;
                this.renderItem(this.MADsGroup, axis.mads, className, 'svg:rect', function (elements) {
                    elements.attr(axis.axisId, function (d) {
                        return (axis.swap([d.renderMADGraphMin, d.renderMADGraphMax])[0] - 1);
                    })
                        .attr(axis.orthogonal.axisId, function (d) {
                            return (axis.swap([Math.floor(d.renderMax) - 1, d.renderMin])[0]);
                        })
                        .attr('width', function (d) {
                            return axis.swap([d.renderMADGraphWidth + 2, Math.abs(d.renderMax - d.renderMin) + 1])[0];
                        })
                        .attr('height', function (d) {
                            return axis.swap([Math.ceil(d.renderMin) - Math.floor(d.renderMax), d.renderMADGraphWidth + 2])[0];
                        })
                        .attr('fill', mt.common.GRAPH_MAD_COLOR)
                        .attr('fill-opacity', 0.2)
                        .attr('stroke', mt.common.GRAPH_MAD_COLOR)
                        .attr('stroke-width', 0);
                });
                this.renderItem(this.MADsGroup, axis.mads, className + '-text-shadow', 'svg:text', function (elements) {
                    elements.text(function (d) { return parseFloat(d.mad).toFixed(2);})
                        .attr(axis.axisId, function (d) {return (axis.swap([d.renderMADGraphMax - 2, d.renderMADGraphMax + 2]))[0];})
                        .attr(orthogonal.axisId, function (d) {return (axis.swap([d.renderMax + 2, d.renderMax - 2]))[0];})
                        .attr('dominant-baseline', axis.isXAxis ? 'hanging' : 'hanging')
                        .attr('text-anchor', axis.isXAxis ? 'end' : 'end')
                        .style('stroke', 'white')
                        .style('stroke-width', 4)
                        .attr('font-size', 12);
                });
                this.renderItem(this.MADsGroup, axis.mads, className + '-text', 'svg:text', function (elements) {
                    elements.text(function (d) {return parseFloat(d.mad).toFixed(2); })
                        .attr(axis.axisId, function (d) {return (axis.swap([d.renderMADGraphMax - 2, d.renderMADGraphMax + 2]))[0]; })
                        .attr(orthogonal.axisId, function (d) {return (axis.swap([d.renderMax + 2, d.renderMax - 2]))[0]; })
                        .attr('dominant-baseline', axis.isXAxis ? 'hanging' : 'hanging')
                        //.attr('baseline-shift', '-25%')
                        .attr('text-anchor', axis.isXAxis ? 'end' : 'end')
                        .attr('stroke', mt.common.GRAPH_MAD_COLOR)
                        .attr('font-size', 12);
                });
                this.renderItem(this.MADsGroup, axis.mads, className + '-border-left', 'svg:line', function (elements) {
                    elements.attr(axis.axisId + '1', function (d) {return axis.swap([d.renderMADGraphMin, d.renderMADGraphMax])[0]; })
                        .attr(axis.axisId + '2', function (d) {return axis.swap([d.renderMADGraphMin, d.renderMADGraphMax])[0]; })
                        .attr(orthogonal.axisId + '1', function (d) {return axis.swap([d.renderMax, d.renderMin])[0]; })
                        .attr(orthogonal.axisId + '2', function (d) { return axis.swap([d.renderMax, d.renderMin - 1])[1]; })
                        .style('stroke', mt.common.GRAPH_MAD_COLOR)
                        .style('stroke-width', 1)
                        .attr('stroke-dasharray', '2,2');
                });
                this.renderItem(this.MADsGroup, axis.mads, className + '-border-right', 'svg:line', function (elements) {
                    elements.attr(axis.axisId + '1', function (d) {return axis.swap([d.renderMADGraphMin, d.renderMADGraphMax])[1]; })
                        .attr(axis.axisId + '2', function (d) {return axis.swap([d.renderMADGraphMin, d.renderMADGraphMax])[1]; })
                        .attr(orthogonal.axisId + '1', function (d) {return axis.swap([d.renderMax, d.renderMin])[0]; })
                        .attr(orthogonal.axisId + '2', function (d) { return axis.swap([d.renderMax, d.renderMin - 1])[1]; })
                        .style('stroke', mt.common.GRAPH_MAD_COLOR)
                        .style('stroke-width', 1)
                        .attr('stroke-dasharray', '2,2');
                });
            }, this);

        };
        StatsGraphRenderer.prototype.renderMedians = function () {
            _(this.graphModel.axes).each(function (axis) {
                var textXY = function (d) {return axis.swap([d.renderVal, d.renderMin + (axis.multiplier * 11)]);};
                var className = 'mt-' + axis.axisId + '-median';
                this.renderItem(this.mediansGroup, axis.medians, className, 'svg:line', function (elements) {
                    elements.attr(axis.axisId + '1', function (d) { return d.renderVal;})
                        .attr(axis.axisId + '2', function (d) { return d.renderVal;})
                        .attr(axis.orthogonal.axisId + '1', function (d) { return d.renderMin;})
                        .attr(axis.orthogonal.axisId + '2', function (d) { return d.renderMax;})
                        .style('stroke', mt.common.GRAPH_MEDIAN_COLOR)
                        .style('stroke-width', 2);
                });
                this.renderItem(this.mediansGroup, axis.medians, className + '-symbol', 'svg:polyline', function (elements) {
                    elements.attr('points', function (d) {
                        return  [
                            axis.swap([d.renderVal, d.renderMin]).join(','),
                            axis.swap([d.renderVal, d.renderMin + (axis.multiplier * 9)]).join(','),
                            axis.swap([d.renderVal - 6, d.renderMin + (axis.multiplier * 9)]).join(','),
                            axis.swap([d.renderVal + 6, d.renderMin + (axis.multiplier * 9)]).join(',')
                        ].join(' ');
                    })
                        .style('stroke', mt.common.GRAPH_MEDIAN_COLOR)
                        .style('fill', 'none')
                        .style('stroke-width', 2);
                });
                this.renderItem(this.mediansGroup, axis.medians, className + '-text-shadow', 'svg:text', function (elements) {
                    elements.text(function (d) { return parseFloat(d.median).toFixed(2);})
                        .attr('class', className + '-text-shadow')
                        .attr('x', function (d) { return textXY(d)[0];})
                        .attr('y', function (d) { return textXY(d)[1];})
                        .attr('dominant-baseline', axis.isXAxis ? 'hanging' : 'middle')
                        .attr('text-anchor', axis.isXAxis ? 'middle' : 'end')
                        .style('stroke', 'white')
                        .style('stroke-width', 4)
                        .attr('font-size', 12);
                });
                this.renderItem(this.mediansGroup, axis.medians, className + '-text', 'svg:text', function (elements) {
                    elements.text(function (d) { return parseFloat(d.median).toFixed(2);})
                        .attr('x', function (d) { return textXY(d)[0];})
                        .attr('y', function (d) { return textXY(d)[1];})
                        .attr('dominant-baseline', axis.isXAxis ? 'hanging' : 'middle')
                        .attr('text-anchor', axis.isXAxis ? 'middle' : 'end')
                        .attr('stroke', mt.common.GRAPH_MEDIAN_COLOR)
                        .attr('font-size', 12);
                });
            }, this);
        };
        StatsGraphRenderer.prototype.renderBinMedians = function () {
            _(this.graphModel.axes).each(function (axis) {
                var className = 'mt-' + axis.axisId + '-bin-median';
                var textXY = function (d) { return axis.swap([(d.renderMax + d.renderMin) / 2, d.renderPos + (axis.multiplier * 11)]);};
                this.renderItem(this.mediansBinGroup, axis.medianBins, className, 'svg:line', function (elements) {
                    elements.attr(axis.axisId + '1', function (d) { return d.renderMin; })
                        .attr(axis.axisId + '2', function (d) { return d.renderMax; })
                        .attr(axis.orthogonal.axisId + '1', function (d) { return d.renderPos; })
                        .attr(axis.orthogonal.axisId + '2', function (d) { return d.renderPos; })
                        .style('stroke', mt.common.GRAPH_MEDIAN_COLOR)
                        .style('stroke-width', 5);
                });
                this.renderItem(this.mediansBinGroup, axis.medianBins, className + '-text-shadow', 'svg:text', function (elements) {
                    elements.text(function (d) { return parseFloat(d.median).toFixed(2);})
                        .attr('x', function (d) { return textXY(d)[0];})
                        .attr('y', function (d) { return textXY(d)[1];})
                        .attr('dominant-baseline', axis.isXAxis ? 'hanging' : 'middle')
                        .attr('text-anchor', axis.isXAxis ? 'middle' : 'end')
                        .style('stroke', 'white')
                        .style('stroke-width', 4)
                        .attr('font-size', 12);
                });
                this.renderItem(this.mediansBinGroup, axis.medianBins, className + '-text', 'svg:text', function (elements) {
                    elements.text(function (d) { return parseFloat(d.median).toFixed(2);})
                        .attr('x', function (d) { return textXY(d)[0];})
                        .attr('y', function (d) { return textXY(d)[1];})
                        .attr('dominant-baseline', axis.isXAxis ? 'hanging' : 'middle')
                        .attr('text-anchor', axis.isXAxis ? 'middle' : 'end')
                        .attr('stroke', mt.common.GRAPH_MEDIAN_COLOR)
                        .attr('font-size', 12);
                });
            }, this);
        };
        StatsGraphRenderer.prototype.renderCase = function (caseView) {
            var selection = this.dataGroup.selectAll('.mt-case-data-points')
                .data([caseView], function (d) {
                    return d.case.id + '_dot';
                });

            selection.enter()
                .append('svg:circle')
                .attr('class', '.mt-case-data-points')
                .attr('id', function (d) { return d.case.id + '-circle';})
                .attr('r', mt.common.GRAPH_CASE_RADIUS);

            selection
                .attr('class', function (d) {return d.case.active ? 'mt-case-data-points active' : 'mt-case-data-points'; })
                .attr('fill', function (d) {return (d.renderColor !== undefined) ? d.renderColor : 'gray'; })
                .attr('id', function (d) {return d.case.id + '-circle'; })
                .attr('cx', function (d) {return d.pos[0];})
                .attr('cy', function (d) {return d.pos[1];});
        };
        StatsGraphRenderer.prototype.renderCaseData = function (afterRenderCallback) {
            var cases = this.graphModel.getVisibleCases(), self = this;

            function renderDots() {
                self.renderItem(self.dataGroup, cases, 'mt-case-data-points', 'svg:circle', function (elements) {
                    elements.attr('r', mt.common.GRAPH_CASE_RADIUS)
                        .attr('class', function (d) {
                            return d.case.active ? 'mt-case-data-points active' : 'mt-case-data-points';
                        })
                        .attr('fill', function (d) { return (d.renderColor !== undefined) ? d.renderColor : 'gray'; })
                        .attr('id', function (d) { return d.case.id + '-circle'; })
                        .transition().duration(self.caseRenderDuration)
                        .attr('cx', function (d) { return isNaN(d.pos[0]) ? -999 : d.pos[0]; })
                        .attr('cy', function (d) { return isNaN(d.pos[1]) ? -999 : d.pos[1]; })
                        .call(afterTransitions, function () {
                            if (afterRenderCallback && typeof afterRenderCallback === 'function') {
                                afterRenderCallback();
                            }
                        })
                        .empty(function () {
                            afterRenderCallback();
                        });
                }, function (d) {
                    return d.case.id + '_dot';
                });
            }

            function renderBars() {
                self.renderItem(self.rectangleGroup, cases, 'mt-case-data-rects', 'svg:rect', function (elements) {
                    elements
                        .attr('fill', function (d) { return (d.renderColor !== undefined) ? d.renderColor : 'gray'; })
                        .style('stroke', function (d) { return (d.renderColor !== undefined) ? d.renderColor : 'gray'; })
                        .transition().duration(self.caseRenderDuration)
                        .attr('x', function (d) { return isNaN(d.rectPos[0]) ? -999 : d.rectPos[0]; })
                        .attr('y', function (d) { return isNaN(d.rectPos[1]) ? -999 : d.rectPos[1]; })
                        .attr('rx', 0)
                        .attr('ry', 0)
                        .attr('height', function (d) { return d.rectHeight;})
                        .attr('width', function (d) { return d.rectWidth;});

                }, function (d) {
                    return d.case.id + '_bar';
                });

                var borders = [];
                _(self.graphModel.axes).each(function (axis) {
                    if (axis.showHistograms) {
                        _(axis.bins).each(function (bin) {
                            var points = [
                                axis.swap([bin.start, axis.orthogonal.scale(0)]).join(','),
                                axis.swap([bin.start, axis.orthogonal.scale(bin.y)]).join(','),
                                axis.swap([bin.start + axis.multiplier * (bin.width), axis.orthogonal.scale(bin.y)]).join(','),
                                axis.swap([bin.start + axis.multiplier * (bin.width), axis.orthogonal.scale(0)]).join(',')
                            ].join(' ');
                            borders.push(points);
                        });
                    }
                });

                self.renderItem(self.barBorderGroup, borders, 'mt-case-data-borders', 'svg:polyline', function (elements) {
                    elements.attr('points', function (d) {return d; })
                        .style('stroke', 'black')
                        .style('stroke-opacity', 0)
                        .style('stroke-width', 1)
                        .style('fill', 'none')
                        .transition().duration(2000)
                        .style('stroke-opacity', 1);
                });
            }

            if (this.graphModel.showHistograms() || this.graphModel.showBarChart()) {
                renderBars();
            } else {
                renderDots();
            }
        };
        StatsGraphRenderer.prototype.transitionToBars = function (callbackFn) {
            var cases = this.graphModel.getVisibleCases(), self =this;
            this.rectangleGroup.selectAll('.mt-case-data-rects').data(cases, function (d) { return d.case.id + '_bar'; })
                .enter()
                .append('svg:rect')
                .attr('class', 'mt-case-data-rects')
                .attr('x', function (d) {return isNaN(d.squarePos()[0]) ? -999 : d.squarePos()[0];})
                .attr('y', function (d) { return isNaN(d.squarePos()[1]) ? -999 : d.squarePos()[1];})
                .attr('rx', function (d) { return d.radius;})
                .attr('ry', function (d) { return d.radius;})
                .attr('height', function (d) { return d.radius * 2;})
                .attr('width', function (d) { return d.radius * 2;})
                .attr('fill', function (d) {return d.renderColor !== undefined ? d.renderColor : 'gray';})
                .attr('id', function (d) { return d.id + '-rect'; })
                .style('stroke', 'black')
                .style('stroke-width', 1);

            this.dataGroup.selectAll('.mt-case-data-points').data([], function (d) {return d.case.id + '_dot';}).exit().remove();
            this.rectangleGroup.selectAll('.mt-case-data-rects').data(cases, function (d) {
                return d.case.id + '_bar';
            })
                .transition().duration(1500)
                .attr('x', function (d) {
                    return isNaN(d.rectPos[0]) ? -999 : d.rectPos[0];
                })
                .attr('y', function (d) { return isNaN(d.rectPos[1]) ? -999 : d.rectPos[1]; })
                .attr('rx', 0)
                .attr('ry', 0)
                .attr('height', function (d) { return d.rectHeight;})
                .attr('width', function (d) { return d.rectWidth;})
                .call(afterTransitions, function () {
                    callbackFn();
                    self.rectangleGroup.selectAll('.mt-case-data-rects').data(cases, function (d) {
                        return d.case.id + '_bar';
                    })
                        .transition().duration(500)
                        .style('stroke-width', 1)
                        .style('stroke', function (d) { return d.renderColor !== undefined ? d.renderColor : 'gray'; });
                });
        };

        StatsGraphRenderer.prototype.transitionToDots = function (callbackFn) {
            var barSelection = this.rectangleGroup.selectAll('.mt-case-data-rects');
            var cases = this.graphModel.getVisibleCases();
            var dotSelection = this.dataGroup.selectAll('.mt-case-data-points');
	        var self = this;
            var addDots = function () {
                dotSelection.data(cases, function (d) { return d.case.id + '_dot'; })
                    .enter()
                    .append('svg:circle')
                    .attr('class', function (d) {
                        return d.case.active ? 'mt-case-data-points active' : 'mt-case-data-points';
                    })
                    .attr('fill', function (d) { return (d.renderColor !== undefined) ? d.renderColor : 'gray'; })
                    .attr('id', function (d) { return d.case.id + '-circle'; })
                    .attr('cx', function (d) { return isNaN(d.pos[0]) ? -999 : d.pos[0]; })
                    .attr('cy', function (d) { return isNaN(d.pos[1]) ? -999 : d.pos[1]; });
            };
            this.barBorderGroup.selectAll('.mt-case-data-borders')
                .data([])
                .exit()
                .remove();

            barSelection.data(cases, function (d) { return d.case.id + '_bar'; })
                .transition()
                .duration(1500)
                .attr('x', function (d) {
                    return d.squarePos()[0];
                })
                .attr('y', function (d) {
                    return d.squarePos()[1];})
                .attr('rx', function (d) {
                    return d.radius;
                })
                .attr('ry', function (d) { return d.radius;})
                .attr('height', function (d) { return d.radius * 2;})
                .attr('width', function (d) { return d.radius * 2;})
                .attr('fill', function (d) {return d.renderColor !== undefined ? d.renderColor : 'gray';})
                .style('stroke', 'black')
                .style('stroke-width', 1)
                .call(afterTransitions, function () {
                    addDots();
                    barSelection.data([], function (d) { return d.case.id + '_bar'; }).exit().remove();

                    // TODO: clean this up. until then, we pass the attribute of the binned axis into the
                    // callback which is scope update for graph controller so that histogram cases get their
                    // color back. This is a kludge on so many levels :-(

                    callbackFn(undefined, _(self.graphModel.axes).filter(function (axis) {
                        return axis.bins.length > 0;
                    })[0].attribute);
                });
        };
        StatsGraphRenderer.prototype.removeBars = function () {
            this.rectangleGroup.selectAll('.mt-case-data-rects')
                .data([], function (d) { return d.case.id + '_bar'; })
                .exit()
                .remove();
            this.barBorderGroup.selectAll('.mt-case-data-borders')
                .data([])
                .exit()
                .remove();
        };
        StatsGraphRenderer.prototype.renderAxis = function (axis, isXAxis) {
            //render the line from axis min to axis max - graph space coordinates
            var axisName = isXAxis ? mt.common.GRAPH_X_AXIS_CLASS : mt.common.GRAPH_Y_AXIS_CLASS;

            var showAxis = this.graphModel.showAxes && axis.visible;

            var min = [axis.renderMin.x, axis.renderMin.y];
            var max = [axis.renderMax.x, axis.renderMax.y];

            min = this.viewConfig.clamp(min[0], min[1], !isXAxis, isXAxis);
            max = this.viewConfig.clamp(max[0], max[1], !isXAxis, isXAxis);

            var axisData = showAxis ? [axis] : [];
            this.renderItem(this.axisGroup, axisData, axisName, 'svg:line', function (elements, xPos, yPos) {
                elements.attr('x1', function (d) { return min[0]; })
                    .attr('y1', function (d) { return min[1]; })
                    .attr('x2', function (d) { return max[0]; })
                    .attr('y2', function (d) { return max[1]; })
                    .attr('class', function (d) { return axisName; })
                    .style('stroke', mt.common.GRAPH_AXIS_COLOR)
                    .style('stroke-width', mt.common.GRAPH_AXIS_WIDTH);
            });


            //get ticks as an array of fractions
            var minorTicks = showAxis ? axis.getTicks(this.viewConfig.mode) : [];
            var majorTicks = _(minorTicks).filter(function (tick) {
                return tick.isMajor === true;
            });

            //+ve offset
            var offsetA, offsetB;

            var originPos = this.viewConfig.transformToPos(0, 0);
            var originOffset = [0, 0];
            //clamp static coord in originPos

            var clampedOrigin = this.viewConfig.clamp(originPos[0], originPos[1], !isXAxis, isXAxis);
            originOffset = [-clampedOrigin[0] + originPos[0], -clampedOrigin[1] + originPos[1]];
            originPos = this.viewConfig.clamp(originPos[0], originPos[1], isXAxis, !isXAxis);

            if (isXAxis) {
                offsetA = {x: 0, y: this.viewConfig.margin.top - originPos[1] };
                offsetB = {x: 0, y: this.viewConfig.height - this.viewConfig.margin.bottom - originPos[1]};
            } else {
                offsetA = {x: this.viewConfig.width - this.viewConfig.margin.right - originPos[0], y: 0};
                offsetB = {x: this.viewConfig.margin.left - originPos[0], y: 0};
            }

            this.drawTicks(this.gridGroup, minorTicks, axisName + '-minor-grid-line', offsetA, offsetB, isXAxis);

            var labeledTicks = _(majorTicks).filter(function (tick) {
                return tick.drawLabel === true;
            });
            this.drawTickLabels(labeledTicks, axisName + '-tick-label', originOffset, isXAxis);

            var viewConfig = this.viewConfig;
            this.renderItem(this.axisLabelGroup, axisData, axisName + '-label', 'svg:text', function (elements, xPos, yPos) {
                var halfMargin = viewConfig.margin.bottom / 4;
                var x = isXAxis === true ? viewConfig.width - viewConfig.margin.right : halfMargin;
                var y = isXAxis === true ? viewConfig.height - halfMargin + 2 : halfMargin;
                var transform = isXAxis === true ? '' : 'rotate(-90 ' + halfMargin + ' ' + halfMargin + ')';

                elements.text(function (d) { return d.label !== undefined ? d.label.val() : undefined; })
                    .attr('x', x)
                    .attr('y', y)
                    .attr('transform', transform)
                    .attr('text-anchor', 'end')
                    .attr('font-size', 12);
            });
        };
        StatsGraphRenderer.prototype.drawTicks = function (group, ticks, className, offsetA, offsetB, isXAxis) {
            var showGridLines = this.graphModel.showGridLines;
            var filteredTicks = _(ticks).filter(function (tick) {
                return ((isXAxis && !isNaN(this.viewConfig.scale.x(tick))) || (!isXAxis && !isNaN(this.viewConfig.scale.y(tick))));
            }, this);
            this.renderItem(group, filteredTicks, className, 'svg:line', function (elements, xPos, yPos) {
                function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}

                function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                elements.transition().duration(1000).attr('x1', function (d) { return tickXPos(d.val()) + offsetA.x; })
                    .attr('y1', function (d) { return  tickYPos(d.val()) + offsetA.y; })
                    .attr('x2', function (d) { return tickXPos(d.val()) + offsetB.x; })
                    .attr('y2', function (d) { return tickYPos(d.val()) + offsetB.y; })
                    .attr('class', function (d) {
                        return ( (showGridLines && d.showGridLine) ? className : className + ' ' + mt.common.GRAPH_HIDDEN_CLASS);
                    }
                )
                    .attr('stroke', function (d) { return d.drawLabel ? '#A8A8A8' : (d.color ? d.color : '#CDCDCD'); });
            });
        };
        StatsGraphRenderer.prototype.drawTickLabels = function (ticks, className, originOffset, isXAxis, forceDecimal) {

            var offset;
            if (isXAxis) {
                offset = [0, 11];
            } else {
                offset = [-11, 0];
            }

            var viewConfig = this.viewConfig;
            var filteredTicks = _(ticks).filter(function (tick) {
                return ((isXAxis && !isNaN(viewConfig.scale.x(tick))) || (!isXAxis && !isNaN(viewConfig.scale.y(tick))));
            });
            this.renderItem(this.tickLabelGroup, filteredTicks, className, 'svg:text', function (elements) {
                function tickXPos(val) {
                    if (isXAxis) {
                        return viewConfig.scale.x(val);
                    } else {
                        return mt.stats.STATS_GRAPH_RENDER_MIN_X;
                    }
                }

                function tickYPos(val) {
                    if (isXAxis) {
                        return mt.stats.STATS_GRAPH_RENDER_MIN_Y;
                    } else {
                        return viewConfig.scale.y(val);
                    }
                }

                var labelFitter = new LabelFitter();

                elements.text(function (d) { return (forceDecimal !== true && d.isFraction) ? d.num : d.toString(forceDecimal); })
                    .attr('x', function (d) {return tickXPos(d.val()) + offset[0];})
                    .attr('y', function (d) {return tickYPos(d.val()) + offset[1];})
                    .attr('id', function (d) {return d.val();})
                    .attr('class', function (d) { return className;})
                    .attr('text-anchor', isXAxis ? 'middle' : 'end')
                    .attr('dominant-baseline', isXAxis ? 'hanging' : 'middle')
                    .attr('font-size', 12)
                    .style('cursor', 'move')
                    .call(labelFitter.xLabelTooLong)
                    .attr('y', function (d, indx) {
                        var y = parseFloat(d3.select(this).attr('y'));
                        if (isXAxis && labelFitter.labelsStaggered) {
                            y += ((this.getBBox().height / 2) - 3) * (indx % 2 === 0 ? -1 : 1) - 2;
                        }
                        return y;
                    })
                    .call(labelFitter.yLabelTooLong)
                    .attr('transform', function (d, indx) {
                        var transform = '';
                        var box = this.getBBox();
                        if (!isXAxis && labelFitter.labelsRotated) {
                            transform = 'rotate(-45 ' + (box.x + box.width) + ' ' + (box.height / 2 + box.y) + ')';
                        }
                        return transform;
                    });
            });
        };

        StatsGraphRenderer.prototype.renderDeviations = function (deviations, axis, callback) {
            axis.deviationAnimationInProgress = true;
            axis.deviationAnimationDuration = 250;

            var animate = function (d, i) {

                d3.select(d[i])
                    .transition()
                    .duration(axis.deviationAnimationDuration)
                    .attr(axis.axisId + '2', function (d) {
                        return axis.scale(d.caseValue);
                    }).each('end', function () {
                        d3.select(this)
                            .transition()
                            .duration(axis.deviationAnimationDuration)
                            .attr(axis.axisId + '2', function (d) {
                                return axis.scale(d.startValue);
                            }).each('end', function (line) {
                                Object.defineProperty(line.caseView.case.attributes, 'deviation from ' + line.startValue + ' for ' + axis.attribute,
                                    {
                                        get: function () {
                                            return line.deviation;
                                        },
                                        set: function () {}
                                    }
                                );
                                Object.defineProperty(line.caseView.case.attributes, 'absolute deviation from ' + line.startValue + ' for ' + axis.attribute,
                                    {
                                        get: function () {
                                            return line.absoluteDeviation;
                                        },
                                        set: function () {}
                                    }
                                );
                                // this is a bit arbitrary, but, for larger data sets we don't want to
                                // re-render the table with every new value, since it would be very slow.
                                if (d.length < 100) {
                                    callback();
                                }
                                if (++i === d.length) {
                                    axis.deviationAnimationInProgress = false;
                                }
                                animate(d, i);
                            });
                    });
            };

            this.renderItem(this.deviationsGroup, _(deviations).sortBy(function (d) {return d.orthogonalCoordinate;}),
                    axis.axisId + '-deviations', 'svg:line', function (elements) {
                    elements
                        .attr(axis.axisId + '1', function (d) { return axis.scale(d.startValue); })
                        .attr(axis.axisId + '2', function (d) { return axis.scale(d.startValue); })
                        .attr(axis.orthogonal.axisId + '1', function (d) { return d.orthogonalCoordinate; })
                        .attr(axis.orthogonal.axisId + '2', function (d) { return d.orthogonalCoordinate; })
                        .attr('stroke', 'green')
                        .attr('stroke-width', 2);
                    animate(elements[0], 0);
                });
        };
        StatsGraphRenderer.prototype.countsAndPercents=function(d){
            var showCounts = this.graphModel.showCounts;
            var showPercentages = this.graphModel.showPercentages;
            if (showCounts && showPercentages) {
                return d.y + '(' + d.percentage + '%)';
            } else if (showCounts) {
                return d.y;
            } else if (showPercentages) {
                return d.percentage + '%';
            } else {
                return '';
            }
        };
        function getRanges(baseObj) {
            var xRange, yRange;
            switch (baseObj.viewConfig.type.x) {

                case mt.stats.STATS_FIELD_TYPE_NUMERIC:
                    xRange = [baseObj.graphModel.axes.x.min.x.val(), baseObj.graphModel.axes.x.max.x.val()];
                    break;
                case mt.stats.STATS_FIELD_TYPE_CATEGORICAL:
                    xRange = baseObj.graphModel.axes.x.categoryGroups;
                    break;
                default:
                    xRange = [0, 1];
            }
            switch (baseObj.viewConfig.type.y) {

                case mt.stats.STATS_FIELD_TYPE_NUMERIC:
                    yRange = [baseObj.graphModel.axes.y.min.y.val(), baseObj.graphModel.axes.y.max.y.val()];
                    break;
                case mt.stats.STATS_FIELD_TYPE_CATEGORICAL:
                    yRange = baseObj.graphModel.axes.y.categoryGroups;
                    break;
                default:
                    yRange = [0, 1];
            }

            return [xRange, yRange];
        }

        function afterTransitions(transition, fn) {
            var i = 0;
            transition
                .each(function () { i++; })
                .each('end', function () {
                    i--;
                    if (i === 0) {
                        fn.apply(this, arguments);
                    }
                });
        }

        function LabelFitter() {
            if (!this instanceof LabelFitter) {
                return new LabelFitter();
            }
            var labelFitter = this;
            this.labelsStaggered = false;
            this.labelsRotated = false;
            LabelFitter.prototype.xLabelTooLong = function (selection, fn) {
                var boundingBoxes = [];
                selection.each(function () {
                    boundingBoxes.push(this.getBBox());
                });
                _(boundingBoxes).each(function (bbox, indx) {

                    if (boundingBoxes[indx + 1] && bbox.x + bbox.width >= boundingBoxes[indx + 1].x - 15) {
                        this.labelsStaggered = true;
                    }
                }, labelFitter);
            };

            LabelFitter.prototype.yLabelTooLong = function (selection, fn) {
                var boundingBoxes = [];
                selection.each(function () {
                    boundingBoxes.push(this.getBBox());
                });

                _(boundingBoxes).each(function (bbox, indx) {

                    if (bbox.x < 0) {
                        this.labelsRotated = true;
                    }
                }, labelFitter);
            };
        }

        return StatsGraphRenderer;

    }());
})(window.mt.stats);




(function (ns) {

    'use strict';

    //view config responsible for mapping between graph and view space for both graph and numberline
    ns.StatsGraphViewConfig = (function () {
        function StatsGraphViewConfig(width, height, margin) {
            this.height = height;
            this.width = width;
            this.margin = {
                left: margin,
                right: margin,
                bottom: margin,
                top: margin
            };
            this.type = {'x': mt.stats.STATS_FIELD_TYPE_NUMERIC, 'y': mt.stats.STATS_FIELD_TYPE_NUMERIC};
            //init transforms to a unit graph
            this.update([0,1],[0,1],this.type);
        }

        StatsGraphViewConfig.prototype.setMargins = function (spec) {
            this.margin = _(this.margin).extend(spec);
        };

        StatsGraphViewConfig.prototype.update = function (domainX, domainY, type) {
            // eg, type = { 'x': 'linear', 'y': 'ordinal' }, etc
            this.scale = {};
            if(type!==undefined) {
                this.type = type;
            }
            if(type.x !== mt.stats.STATS_FIELD_TYPE_CATEGORICAL) {
                var minX = domainX[0];
                var maxX = domainX[1];
                this.xScale = d3.scale.linear().domain([minX, maxX]).range([this.margin.left, this.width - this.margin.right]);
            } else  {
                this.xScale = d3.scale.ordinal().domain(domainX).rangePoints([this.margin.left, this.width - this.margin.right],1);
            }


            if(type.y !== mt.stats.STATS_FIELD_TYPE_CATEGORICAL) {
                var minY = domainY[0];
                var maxY = domainY[1];
                this.yScale = d3.scale.linear().domain([maxY, minY]).range([this.margin.top, this.height - this.margin.bottom]);
            } else {
                var ordinal = d3.scale.ordinal().domain(domainY);
                this.yScale = ordinal.rangePoints([this.margin.top, this.height - this.margin.bottom],1);
                this.yRangePoints = ordinal.range();
            }

            this.scale.x = this.xScale;
            this.scale.y = this.yScale;
        };

        StatsGraphViewConfig.prototype.transformToGraph = function (posX, posY) {
            var valX = this.xScale.invert(posX);
            var valY = this.yScale.invert(posY);
            return [valX, valY];
        };

        StatsGraphViewConfig.prototype.transformToPos = function (valX, valY, isXAxis) {
            var posX, posY;

            if(this.type.x === mt.stats.STATS_FIELD_TYPE_CATEGORICAL) {
                if (valX === 0) {
                    posX = 45;
                }  else {
                    posX = this.xScale(valX);
                }
            } else {
                posX = this.xScale(valX);
            }

            if(this.type.y === mt.stats.STATS_FIELD_TYPE_CATEGORICAL) {
                if (valY === 0) {
                    posY = mt.common.GRAPH_RENDER_MIN_Y;
                } else {
                    posY = this.yScale(valY);
                }
            } else {
                posY = this.yScale(valY);
            }

            return [posX, posY];
        };

        StatsGraphViewConfig.prototype.getHeight = function () {
            return this.height;
        };

        StatsGraphViewConfig.prototype.getWidth = function () {
            return this.width;
        };

        StatsGraphViewConfig.prototype.clamp = function(posX, posY, clampX, clampY) {
            var clamped = [
                clampX? Math.min(this.width - this.margin.left, Math.max(this.margin.right, posX)): posX,
                clampY? Math.min(this.height - this.margin.top, Math.max(this.margin.bottom, posY)): posY
            ];
            return clamped;
        };

        return StatsGraphViewConfig;
    }());
})(window.mt.stats);




(function (ns) {
    'use strict';

    angular.module('mtStats').controller('StatsCaseCtrl', function ($scope) {

        $scope.model.active = !!$scope.model.active;
    });

})(window.mt.stats);
(function (ns) {
    'use strict';

    angular.module('mtStats').controller('StatsCaseDataCtrl', function ($filter, $scope, $timeout, eventingService, preconfiguredToolService) {

        $scope.eventineer = new ns.CaseDataEventineer($scope.toolId, eventingService);

        eventingService.addTopic(ns.TOPIC_STATS_NOTIFY_GRAPHS);
        eventingService.addTopic(ns.TOPIC_STATS_NOTIFY_TABLE);

        $scope.draggableAttribute = {
            text: '',
            top: 0,
            left: 0,
            visible: false
        };

        $scope.indexHeader = {
            display: 'Index ',
            reverse: true,
            sort: function() {
                $scope.caseData.cases = $filter('orderBy')($scope.caseData.cases, 'index', this.reverse);
                this.reverse = !this.reverse;
            }
        };
        
        $scope.subscribeToEvents = function() {
            eventingService.subscribe($scope.toolId, ns.TOPIC_STATS_NOTIFY_TABLE, function (event) {
                if (_($scope.linkedGraphIds).contains(event.sourceId) ||
                    _($scope.linkedProbabilityDeviceIds).contains(event.sourceId)) {

                    switch (event.type) {
                        case ns.EVENT_DATA_DELETE:
                            notifyGraphsOfRemovedCase(event.data.case);
                            break;
                        case ns.EVENT_DATA_ADD:
                            notifyGraphsOfNewCase(event.data.case);
                            break;
                        case ns.EVENT_DATA_UPDATE:
                            $scope.caseData.updateCase(event.data.case);
                            event.originId = event.sourceId;
                            event.sourceId = $scope.toolId;
                            eventingService.publish(ns.TOPIC_STATS_NOTIFY_GRAPHS, event);
                            break;
                        case ns.EVENT_RESET_GRAPH:
                            event.originId = event.sourceId;
                            event.sourceId = $scope.toolId;
                            eventingService.publish(ns.TOPIC_STATS_NOTIFY_GRAPHS, event);
                            break;
                        case ns.EVENT_CLEAR_TABLE:
                            clearTable();
                            break;
                    }
                    $timeout(angular.noop, 0, true);

                }
            });

            eventingService.subscribe($scope.toolId, ns.EVENT_PROB_TOOL_RESULTS, function (event) {
                $scope.caseData = event.data.caseData;
                $scope.linkedProbabilityDeviceIds.push(event.data.sourceId);
                $scope.wizardApi.toggle(false);
            });
        };
        $scope.linkedGraphIds = [];
        $scope.linkedProbabilityDeviceIds = [];
        $scope.subscribeToEvents();

        $scope.select = function (caze) {
            if($scope.selectionApi !== undefined) {
                $scope.selectionApi.setSelection({type: ns.STATS_CASE_TYPE, modelObject: caze});
            }
            $scope.caseData.select(caze);
            $scope.updateSelection();
        };

        $scope.updateCell = function (kase, attr) {
            kase.setClean(attr,false);
            var attributeHeader = _.find($scope.caseData.attributeHeaders, function (h) {
                return h.display === attr.display;
            });

            attributeHeader.attributeValues.reset();

            if (attributeHeader.type === mt.stats.STATS_FIELD_TYPE_NUMERIC) {
                if(kase.validateNumeric(attr.display)) {
                    kase.attributes[attr.display] = parseFloat(kase.attributes[attr.display]);
                }
            } else {
                kase.validateCategorical(attr.display);
            }

            var updateAttributeEvent = new mt.common.Event({attribute: attr.display});
            updateAttributeEvent.type = mt.stats.EVENT_ATTRIBUTE_UPDATE;
            updateAttributeEvent.sourceId = $scope.toolId;
            eventingService.publish(ns.TOPIC_STATS_NOTIFY_GRAPHS, updateAttributeEvent);
        };

        $scope.validate = function (kase,attribute) {
            // if data hasn't changed since last validation, just return true
            if (kase.getClean(attribute)) {
                return !kase.invalidAttributes[attribute.display];
            }

            var attributeHeader = _.find($scope.caseData.attributeHeaders, function (h) {
                return h.display === attribute.display;
            });

            var valid = true;

            // we allow null/undefined, but if it is defined, and we are expecting numeric, we need to validate
            if (kase.attributes[attribute.display] && (attributeHeader.type === mt.stats.STATS_FIELD_TYPE_NUMERIC)) {
                valid = kase.validateNumeric(attribute.display);
            }
            kase.setClean(attribute,true);
            return !kase.invalidAttributes[attribute.display];
        };

        $scope.$on('addGraph', function () {
            $scope.linkedGraphIds.push($scope.eventineer.exportToNewGraph($scope.caseData));
        });

        function clearProbabilityTool() {
            _.each($scope.linkedProbabilityDeviceIds, function(probId){
                preconfiguredToolService.removeTool(probId);
            });
            $scope.linkedProbabilityDeviceIds = [];
        }

        $scope.$on('launchProbabilityTool', function (event, sampler) {
            clearProbabilityTool();
            $scope.linkedProbabilityDeviceIds.push($scope.eventineer.launchProbabilityTool($scope.caseData, sampler));
        });

        $scope.$on('clearProbabilityTool', clearProbabilityTool);

        $scope.$on('addAttribute', function (event, attributeName, attributeType, index) {
            $scope.caseData.addAttribute(attributeName, attributeType, index);
            if($scope.caseData.cases.length === 0) {
                addRow();
            }
        });

        $scope.$on('addRow', function (event, index) {
            addRow(index);
        });

        function addRow(index) {
            var newCase = $scope.caseData.addCase(index);
            _.each($scope.caseData.attributeHeaders, function (header) {
                newCase.attributes[header.display] = undefined;
            });
            notifyGraphsOfNewCase(newCase);
        }
        function notifyGraphsOfNewCase(newCase) {
            var addDataEvent = new mt.common.Event({case:newCase});
            addDataEvent.type = mt.stats.EVENT_DATA_ADD;
            addDataEvent.sourceId = $scope.toolId;
            eventingService.publish(ns.TOPIC_STATS_NOTIFY_GRAPHS, addDataEvent);
        }
        function notifyGraphsOfRemovedCase(kase) {
            var deleteEvent = new mt.common.Event({case:kase});
            deleteEvent.type = mt.stats.EVENT_DATA_DELETE;
            deleteEvent.sourceId = $scope.toolId;
            eventingService.publish(ns.TOPIC_STATS_NOTIFY_GRAPHS, deleteEvent);
        }
        function clearTable() {
            var event = new mt.common.Event();
            event.type = mt.stats.EVENT_CLEAR_TABLE;
            event.sourceId = $scope.toolId;
            eventingService.publish(ns.TOPIC_STATS_NOTIFY_GRAPHS, event);
        }

        $scope.$on('changeAttributeType', function (event, changeDesc) {
            if($scope.caseData.setActiveHeaderType(changeDesc.newType)) {
                var typeChangeEvent = new mt.common.Event(changeDesc);
                typeChangeEvent.type = mt.stats.EVENT_ATTRIBUTE_TYPE_CHANGE;
                typeChangeEvent.sourceId = $scope.toolId;
                eventingService.publish(ns.TOPIC_STATS_NOTIFY_GRAPHS, typeChangeEvent);
            }
        });


        $scope.$on('renameAttribute', function (event, changeDesc) {
            if (_.find($scope.caseData.attributeHeaders, function(h) {
                return h.display === changeDesc.newName;
            })) {
                return;
            }
            _.each($scope.caseData.cases, function(caseElem) {
                if (caseElem.attributes.hasOwnProperty(changeDesc.oldName)) {
                    caseElem.attributes[changeDesc.newName] = caseElem.attributes[changeDesc.oldName];
                    delete caseElem.attributes[changeDesc.oldName];
                }
            });
            changeDesc.activeHeader.display = changeDesc.newName;
            var renameEvent = new mt.common.Event(changeDesc);
            renameEvent.type = mt.stats.EVENT_ATTRIBUTE_RENAME;
            renameEvent.sourceId = $scope.toolId;
            eventingService.publish(ns.TOPIC_STATS_NOTIFY_GRAPHS, renameEvent);
        });

        $scope.$on('deleteAttribute', function (event) {
            var activeHeader = $scope.caseData.getActiveHeader();
            if(activeHeader !== undefined) {
                _.each($scope.caseData.cases, function (c) {
                    delete c.attributes[activeHeader.display];
                });
                var deleteAttributeEvent = new mt.common.Event({attribute:activeHeader.display});
                $scope.caseData.attributeHeaders.splice($scope.caseData.attributeHeaders.indexOf(activeHeader), 1);

                deleteAttributeEvent.type = mt.stats.EVENT_ATTRIBUTE_DELETE;
                deleteAttributeEvent.sourceId = $scope.toolId;
                eventingService.publish(ns.TOPIC_STATS_NOTIFY_GRAPHS, deleteAttributeEvent);
            }
        });

        $scope.$on('deleteRow', function (event) {
            var activeCase = $scope.caseData.getActiveCase();
            if(activeCase!==undefined) {
                $scope.caseData.removeCase(activeCase);
                notifyGraphsOfRemovedCase($scope.caseData.getActiveCase());
            }
        });

        $scope.$on('mtStatsResizeHeaderChange', function (event, header) {
            if($scope.resizeHeaderMode) {
                $scope.resizeHeader = header;
                $scope.resizeHeader.resizing = true;
                // resize mode turned on for this header
                $("div[data-attr-name='" + header.display + "']").addClass('.mt-resize');//jshint ignore:line
            }
            else {
                $scope.resizeHeader.resizing = false;
                $scope.resizeHeader = null;
                // resize mode turned off
                $('.mt-stats-cell-header').removeClass('.mt-resize');
            }
        });

        $scope.$on('mtStatsActiveHeaderChange', function (event, header) {
            if($scope.selectionApi !== undefined) {
                $scope.selectionApi.setSelection({type: ns.STATS_HEADER_TYPE, modelObject: header});
            }

            $scope.caseData.select(header);

            if($scope.resizeHeaderMode) {
                if(header !== $scope.resizeHeader || !header.active) {
                    $scope.resizeHeaderMode = false;
                    $scope.resizeHeader = null;
                    $('.mt-stats-cell-header').removeClass('.mt-resize');
                }
            }
        });

        $scope.$on('mtStatsHeaderDragStart', function (event, text) {
            if(!$scope.resizeHeaderMode) {
                $scope.draggableAttribute.visible = true;
                $scope.draggableAttribute.text = text;
                var dragndropEvent = new mt.common.Event({});
                dragndropEvent.type = ns.EVENT_ATTRIBUTE_DRAG_START;
                $scope.eventineer.broadcastToGraphs(dragndropEvent);
            }
        });

        var prevDragTime;
        var dragTargetAttrName;
        $scope.$on('mtStatsHeaderDrag', function (event, gesture, top, left) {

            //throttle attribute update to every 10fps
            var curTime = new Date().getTime();
            if(prevDragTime !== undefined && curTime - prevDragTime < 30) {
                return;
            }
            prevDragTime = curTime;

            if($scope.resizeHeaderMode) {
                var jq = $(".mt-stats-cell[data-attr-name='" + $scope.resizeHeader.display + "']"); //jshint ignore:line
                var elem = jq.get(0);
                var rect = elem.getBoundingClientRect();
                var newRight = gesture.gesture.center.pageX;
                if(newRight > rect.left) {
                    var newWidth = newRight - rect.left;
                    jq.css('width', newWidth);
                }
            }
            else {
                $scope.draggableElement.css({top: top+'px', left: left+'px'});
                dragTargetAttrName = null;
                $('.mt-stats-cell-header').each(function() {
                    var target = $(this);
                    var props = {
                        offset: target.offset(),
                        height: target.height(),
                        width: target.width()
                    };
                    var isInsideTarget = isInside(gesture.gesture.center.pageX, gesture.gesture.center.pageY, props);
                    if(isInsideTarget) {
                        target.addClass('mt-drag-over');
                        dragTargetAttrName = target.data('attr-name');
                    }
                    else {
                        target.removeClass('mt-drag-over');
                    }

                });
                var dragndropEvent = new mt.common.Event({gesture:gesture});
                dragndropEvent.type = ns.EVENT_ATTRIBUTE_DRAG;
                $scope.eventineer.broadcastToGraphs(dragndropEvent);
            }
        });

        function isInside(dragX, dragY, properties) {
            return dragX > properties.offset.left && dragX < properties.offset.left + properties.width &&
                dragY > properties.offset.top && dragY < properties.offset.top + properties.height;
        }

        $scope.$on('mtStatsHeaderDragEnd', function (event, gesture) {
            if(!$scope.resizeHeaderMode) {
                prevDragTime = undefined;
                $scope.draggableAttribute.visible = false;

                $('.mt-drag-over').removeClass('mt-drag-over');
                if(dragTargetAttrName !== null) {
                    var dragHeaderIdx = $scope.caseData.getHeaderIndex($scope.draggableAttribute.text);
                    var dragTargetHeaderIdx = $scope.caseData.getHeaderIndex(dragTargetAttrName);
                    $scope.caseData.attributeHeaders.splice(dragTargetHeaderIdx, 0, $scope.caseData.attributeHeaders.splice(dragHeaderIdx, 1)[0]);
                }

                var dragndropEvent = new mt.common.Event({gesture:gesture, text:$scope.draggableAttribute.text});
                dragndropEvent.type = ns.EVENT_ATTRIBUTE_DRAG_END;
                $scope.eventineer.broadcastToGraphs(dragndropEvent);
            }
        });
    });

})(window.mt.stats);

(function (ns) {
    'use strict';

    angular.module('mtStats').controller('StatsGraphCtrl', function ($controller, $scope, lineRectIntersectionFactory, eventingService, selectionApiFactory) {
        var graphMargin = 45;

        // just for shorthand..
        var NUMERIC = mt.stats.STATS_FIELD_TYPE_NUMERIC;
        var CATEGORICAL = mt.stats.STATS_FIELD_TYPE_CATEGORICAL;

        //selection API - selection objects are NUMERIC data or CATEGORICAL data 
        $scope.selectionApi = selectionApiFactory.createApi(function(oldSelection) {
            if(oldSelection !== undefined && oldSelection.modelObject !== undefined) {
                oldSelection.modelObject.isSelected = false;
            }
            $scope.update();
        });

        $scope.registerEventineerCallbacks = function(){
            $scope.eventineer.registerHandleAttributeDrag($scope.handleAttributeDrag);
            $scope.eventineer.registerHandleAttributeDragStart($scope.handleAttributeDragStart);
            $scope.eventineer.registerHandleAttributeDragEnd($scope.handleAttributeDragEnd);
            $scope.eventineer.registerHandleDataDelete(function (e) {
                _($scope.graphModel.allCaseViews).each(function (caseView) {
                    if(!_($scope.caseData.cases).contains(caseView.case)) {
                        caseView.pos = [-999,-999];
                        caseView.rectPos = [-999,-999];
                    }
                });
                $scope.graphModel.allCaseViews = _.filter($scope.graphModel.allCaseViews, function (caseView) {
                    return _.contains($scope.caseData.cases, caseView.case);
                });
                $scope.update();
            });
            $scope.eventineer.registerHandleClearTable(function (e) {
                $scope.graphModel.allCaseViews = [];
                $scope.xRange = [];
                $scope.yRange = [];
                $scope.update();
            });
            $scope.eventineer.registerHandleAttributeDelete(function (e) {
                var newXAttr, newYAttr, newDataAttr;
                newYAttr = ($scope.graphModel.attributes.y === e.data.attribute) ? null : $scope.graphModel.attributes.y;
                newXAttr = ($scope.graphModel.attributes.x === e.data.attribute) ? null : $scope.graphModel.attributes.x;
                newDataAttr = ($scope.graphModel.attributes.color === e.data.attribute) ? null : $scope.graphModel.attributes.color;
                $scope.update(newXAttr,newDataAttr,newYAttr);
            });
            $scope.eventineer.registerHandleAttributeUpdate(function (e) {
                if($scope.graphModel.attributes.y === e.data.attribute ||
                    $scope.graphModel.attributes.x === e.data.attribute ||
                    $scope.graphModel.attributes.color === e.data.attribute) {
                    $scope.update($scope.graphModel.attributes.x, $scope.graphModel.attributes.color, $scope.graphModel.attributes.y);
                }
            });
            $scope.eventineer.registerHandleDataUpdate(function (e) {
                if(e.originId!==$scope.toolId) {$scope.update($scope.graphModel.attributes.x, $scope.graphModel.attributes.color, $scope.graphModel.attributes.y);}
            });
            $scope.eventineer.registerHandleDataAdd(function (e) {
                var casesWithViews =_($scope.graphModel.allCaseViews).map(function (c) {return c.case;});
                if(!casesWithViews || !_(casesWithViews).contains(e.data.case)) {
                    var caseView = new mt.stats.CaseView(e.data.case);
                    $scope.graphModel.allCaseViews.push(caseView);
                    $scope.update($scope.graphModel.attributes.x, $scope.graphModel.attributes.color, $scope.graphModel.attributes.y);
                }
            });
            $scope.eventineer.registerHandleReset(function (e) {$scope.resetGraph();});
            $scope.eventineer.registerHandleAttributeTypeChange(function (e) {
                if($scope.graphModel.attributes.x === e.data.oldName || $scope.graphModel.attributes.x === e.data.newName) {
                    $scope.graphModel.attributes.x = null;
                    $scope.update($scope.graphModel.attributes.x, $scope.graphModel.attributes.color, $scope.graphModel.attributes.y);
                    $scope.graphModel.attributes.x = e.data.newName;
                    $scope.update($scope.graphModel.attributes.x, $scope.graphModel.attributes.color, $scope.graphModel.attributes.y);
                }
                else if($scope.graphModel.attributes.y === e.data.oldName || $scope.graphModel.attributes.y === e.data.newName) {
                    $scope.graphModel.attributes.y = null;
                    $scope.update($scope.graphModel.attributes.x, $scope.graphModel.attributes.color, $scope.graphModel.attributes.y);
                    $scope.graphModel.attributes.y = e.data.newName;
                    $scope.update($scope.graphModel.attributes.x, $scope.graphModel.attributes.color, $scope.graphModel.attributes.y);
                }
                else if($scope.graphModel.attributes.color === e.data.oldName || $scope.graphModel.attributes.color === e.data.newName) {
                    $scope.graphModel.attributes.color = null;
                    $scope.update($scope.graphModel.attributes.x, $scope.graphModel.attributes.color, $scope.graphModel.attributes.y);
                    $scope.graphModel.attributes.color = e.data.newName;
                    $scope.update($scope.graphModel.attributes.x, $scope.graphModel.attributes.color, $scope.graphModel.attributes.y);
                }
            });
            $scope.eventineer.registerHandleAttributeRename(function (e) {
                if($scope.graphModel.attributes.x === e.data.oldName) {
                    $scope.graphModel.attributes.x = e.data.newName;
                }
                else if($scope.graphModel.attributes.y === e.data.oldName) {
                    $scope.graphModel.attributes.y = e.data.newName;
                }
                else if($scope.graphModel.attributes.color === e.data.oldName) {
                    $scope.graphModel.attributes.color = e.data.newName;
                }
                if($scope.caseData.colorAttributeName === e.data.oldName) {
                    $scope.caseData.colorAttributeName = e.data.newName;
                }
                $scope.update($scope.graphModel.attributes.x, $scope.graphModel.attributes.color, $scope.graphModel.attributes.y);
            });
            $scope.eventineer.registerHandleRerender(function (e) {
                $scope.renderer.render();
            });
            $scope.eventineer.registerImportFromTable(function (eventData) {
                $scope.resetGraph();
                $scope.caseData = eventData;
                $scope.graphModel.allCaseViews = [];
                $scope.graphModel.caseData = $scope.caseData;
                _.each($scope.caseData.cases, function (kase) {
                    var caseView = (new mt.stats.CaseView(kase));
                    $scope.graphModel.allCaseViews.push(caseView);
                });
                $scope.gestureHandler.setGraphModel($scope.graphModel);
                $scope.update();
            });
        };
        $scope.setGestureCallbacks = function () {
                $scope.gestureCallbacks = {
                    all: $scope.update,
                    dividers: function () {
                        $scope.updateSections();
                        $scope.renderer.render(true);
                    },
                    rulers: function () {
                        $scope.renderer.renderRulers();
                    },
                    selectCase: function (caseView) {
                        $scope.renderer.render(false);
                        var event = new mt.common.Event({case: caseView.case});
                        event.type = ns.EVENT_DATA_UPDATE;
                        event.sourceId = $scope.toolId;
                        eventingService.publish(ns.TOPIC_STATS_NOTIFY_TABLE, event);
                    },
                    deviations: function (handle, deviationAttributeHeader, absDeviationAttributeHeader) {
                        $scope.measureDeviations(handle, deviationAttributeHeader, absDeviationAttributeHeader);
                    },
                    casePositions: function (caseView) {
                        $scope.renderer.renderCase(caseView);
                    },
                    caseDragEnd: function (caseView) {
                        var containingBin;
                        // maybe we shouldn't even allow drag when data is binned
                        if ($scope.graphModel.axes.x.binned || $scope.graphModel.axes.x.binned) {
                            $scope.update();
                        } else {
                            if ($scope.graphModel.axes.x.type === NUMERIC) {
                                caseView.case.attributes[$scope.graphModel.axes.x.attribute] =
                                    $scope.graphModel.axes.x.invert(caseView.pos[0]);
                            }
                            if ($scope.graphModel.axes.y.type === NUMERIC) {
                                caseView.case.attributes[$scope.graphModel.axes.y.attribute] =
                                    $scope.graphModel.axes.y.invert(caseView.pos[1]);
                            }
                            if ($scope.graphModel.axes.x.type === CATEGORICAL) {
                                containingBin = _($scope.graphModel.axes.x.bins).find(function (bin) {
                                    return (bin.start < caseView.pos[0] && caseView.pos[0] <= bin.start + bin.width);
                                });
                                if (containingBin) {
                                    if (!_(containingBin.categories).contains(caseView.case.attributes[$scope.graphModel.axes.x.attribute])) {
                                        caseView.case.attributes[$scope.graphModel.axes.x.attribute] =
                                            containingBin.categories[0];
                                    }
                                }
                            }
                            if ($scope.graphModel.axes.y.type === CATEGORICAL) {
                                containingBin = _($scope.graphModel.axes.y.bins).find(function (bin) {
                                    return (bin.start >= caseView.pos[1] && caseView.pos[1] > bin.start - bin.width);
                                });
                                if (containingBin) {
                                    if (!_(containingBin.categories).contains(caseView.case.attributes[$scope.graphModel.axes.y.attribute])) {
                                        caseView.case.attributes[$scope.graphModel.axes.y.attribute] =
                                            containingBin.categories[0];
                                    }
                                }
                            }
                            $scope.renderer.renderCase(caseView);
                            $scope.update(undefined, $scope.graphModel.attributes.color, undefined);
                            var event = new mt.common.Event({case: caseView.case});
                            event.type = ns.EVENT_DATA_UPDATE;
                            event.sourceId = $scope.toolId;
                            eventingService.publish(ns.TOPIC_STATS_NOTIFY_TABLE, event);
                        }

                    },
                    addCaseAt: function (posX, posY) {
                        if ($scope.graphModel.axes.x.binned || $scope.graphModel.axes.x.binned) {
                            $scope.update();
                        } else {
                            var newCase = $scope.graphModel.caseData.addCase();
                            _($scope.graphModel.axes).each(function (axis) {
                                var pos = axis.isXAxis ? posX : posY;
                                if (axis.type === NUMERIC) {
                                    newCase.attributes[axis.attribute] = axis.invert(pos);
                                }
                                if (axis.type === CATEGORICAL) {
                                    var containingBin = _(axis.bins).find(function (bin) {
                                        if (axis.isXAxis) {
                                            return (bin.start < pos && pos <= bin.start + bin.width);
                                        } else {
                                            return (bin.start >= pos && pos > bin.start - bin.width);
                                        }
                                    });
                                    if (containingBin) {
                                        newCase.attributes[axis.attribute] = containingBin.categories[0];
                                    }
                                }
                            });

                            var caseView = new mt.stats.CaseView(newCase);
                            caseView.pos = [posX, posY];
                            $scope.graphModel.allCaseViews.push(caseView);
                            $scope.graphModel.filteredCaseViews.push(caseView);
                            $scope.renderer.renderCase(caseView);
                            $scope.update(undefined, $scope.graphModel.attributes.color, undefined, function () {
                                var event = new mt.common.Event({case: caseView.case});
                                event.type = ns.EVENT_DATA_ADD;
                                event.sourceId = $scope.toolId;
                                eventingService.publish(ns.TOPIC_STATS_NOTIFY_TABLE, event);
                            });
                        }
                    },
                    removeCase: function (caseView) {
                        var kase = caseView.case;
                        $scope.graphModel.caseData.removeCase(kase);
                        var event = new mt.common.Event({case: kase});
                        event.type = ns.EVENT_DATA_DELETE;
                        event.sourceId = $scope.toolId;
                        eventingService.publish(ns.TOPIC_STATS_NOTIFY_TABLE, event);
                    }
                };
            };

        $scope.init = function () {
            $scope.eventineer = new ns.StatsGraphEventineer(eventingService, $scope.toolId);
            $scope.registerEventineerCallbacks();
            $scope.graphModel = new mt.stats.StatsGraphModel();
            $scope.graphModel.rectCaseViews = [];
            $scope.graphModel.locked = true;
            $scope.graphModel.caseDiameter = mt.common.GRAPH_CASE_RADIUS * 2;
            $scope.viewConfig = new mt.stats.StatsGraphViewConfig($scope.width, $scope.height, graphMargin);
            $scope.viewConfig.setMargins({
                left: 65,
                top: 25,
                right: 45,
                bottom: 75
            });
            _($scope.graphModel.axes).each(function (axis) {axis.viewConfig = $scope.viewConfig;});
            $scope.renderer = new mt.stats.StatsGraphRenderer($scope.containerElement, $scope.graphModel, $scope.viewConfig, $scope.toolId);
            $scope.positioner = new mt.stats.StatsCasePositioner($scope.graphModel, $scope.viewConfig);
            $scope.graphModel.caseData = $scope.caseData;
            $scope.graphModel.allCaseViews = [];

            $scope.showAttributeTargets = false;
            $scope.activeTarget = {};
            $scope.activeTarget[ns.STATS_GRAPH_DROP_AREA_X] = false;
            $scope.activeTarget[ns.STATS_GRAPH_DROP_AREA_Y] = false;
            $scope.activeTarget[ns.STATS_GRAPH_DROP_AREA_CASE] = false;

            $scope.binNumOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

            $scope.registerAxisResetFn('x', function () { $scope.removeRuler('x'); });
            $scope.registerAxisResetFn('y', function () { $scope.removeRuler('y'); });

            $scope.setGestureCallbacks();
            $scope.gestureHandler = new ns.StatsGraphGestureHandler($scope.graphModel, $scope.viewConfig, $scope.gestureCallbacks, $scope.selectionApi);
            // $scope.createPaletteItems();
        };
        $scope.registerAxisResetFn = function (axis, resetFn) {
            $scope.graphModel.axes[axis].registerResetFn(resetFn);
        };
        $scope.resetGraph = function () {
            $scope.$broadcast('reset');
        };
        // $scope.addBoxes = function(axis) {
        //     if(axis === 'x') {
        //         $scope.showXBox = true;
        //         $scope.gestureHandler.mode = ns.GESTURE_MODE_XBOX;
        //     } else {
        //         $scope.showYBox = true;
        //         $scope.gestureHandler.mode = ns.GESTURE_MODE_YBOX;
        //     }
        //     $scope.$broadcast('addBox', axis);
        // };
        // $scope.removeBoxes = function(axis) {
        //     if(axis === 'x') {
        //         $scope.showXBox = false;
        //     } else {
        //         $scope.showYBox = false;
        //     }
        //     $scope.graphModel.axes[axis].boxes = [];
        //     $scope.update();
        // };

        $scope.addRuler = function(axisId) {
            var axis = $scope.graphModel.axes[axisId];
            if(axis.type === NUMERIC && !axis.binned && !axis.isCount()) {
                axis.ruler = new ns.Ruler(axis);
                $scope.gestureHandler.selectObject(axis.ruler);
                $scope.update();
            }
        };
        $scope.removeRuler = function(axisId) {
            $scope.graphModel.axes[axisId].ruler = undefined;
            $scope.renderer.renderRulers();
        };

        //Form submission handler for axesAdjuster populate user defined range and flag to indicate its use
        $scope.axesUpdate = function(){
            $scope.axesAdjusterVisible  = false;
            if($scope.graphModel.axes.x.isQuant()) {
                $scope.graphModel.axes.x.userSetAxes = true;
                $scope.graphModel.axes.x.userRange = [
                    $scope.graphModel.axes.x.adjuster.min,
                    $scope.graphModel.axes.x.adjuster.max
                ];
                if($scope.graphModel.axes.x.selectedBinWidth !== undefined) {
                    $scope.graphModel.axes.x.bins =[];
                    $scope.graphModel.axes.x.binThresholds = undefined;
                }
            }
            if($scope.graphModel.axes.y.isQuant()) {
                $scope.graphModel.axes.y.userSetAxes = true;
                $scope.graphModel.axes.y.userRange = [
                    $scope.graphModel.axes.y.adjuster.min,
                    $scope.graphModel.axes.y.adjuster.max
                ];
                if($scope.graphModel.axes.y.selectedBinWidth !== undefined) {
                    $scope.graphModel.axes.y.bins =[];
                    $scope.graphModel.axes.y.binThresholds = undefined;
                }
            }

            $scope.update();
        };

        //axesAdjuster model gets current range values
        // $scope.toggleAxesAdjuster = function(){
        //     if($scope.graphModel.axes.x.isQuant()) {
        //         $scope.graphModel.axes.x.adjuster.min = $scope.graphModel.axes.x.min.x.val();
        //         $scope.graphModel.axes.x.adjuster.max = $scope.graphModel.axes.x.max.x.val();
        //         $scope.graphModel.axes.x.adjuster.major = $scope.graphModel.axes.x.majorInterval.val();
        //         $scope.graphModel.axes.x.adjuster.minor = $scope.graphModel.axes.x.minorInterval.val();
        //     }
        //     if($scope.graphModel.axes.y.isQuant()) {
        //         $scope.graphModel.axes.y.adjuster.min = $scope.graphModel.axes.y.min.y.val();
        //         $scope.graphModel.axes.y.adjuster.max = $scope.graphModel.axes.y.max.y.val();
        //         $scope.graphModel.axes.y.adjuster.major = $scope.graphModel.axes.y.majorInterval.val();
        //         $scope.graphModel.axes.y.adjuster.minor = $scope.graphModel.axes.y.minorInterval.val();
        //     }
        //     $scope.axesAdjusterVisible = !$scope.axesAdjusterVisible;

        // };

        //update the case data render positions and render
        $scope.update = function (xAtt, dataAtt, yAtt, callbackFn) {
            var yAxisChanged = ((yAtt !== undefined || yAtt === null) && yAtt!==$scope.graphModel.attributes.y) ;
            var xAxisChanged = ((xAtt !== undefined || xAtt === null) && xAtt!==$scope.graphModel.attributes.x) ;

            if(xAxisChanged && $scope.graphModel.axes.y.isCount()) {
                $scope.graphModel.axes.y.type = undefined;
                $scope.graphModel.attributes.y = undefined; // getting rid of count
            }
            if(yAxisChanged && $scope.graphModel.axes.x.isCount()) {
                $scope.graphModel.axes.x.type = undefined;
                $scope.graphModel.attributes.x = undefined; // getting rid of count
            }
            if(yAxisChanged) {
                if(yAtt === null) {yAtt = undefined;}
                $scope.graphModel.attributes.y = yAtt;
                if($scope.graphModel.showHistograms() || $scope.graphModel.showBarChart()) {
                    $scope.graphModel.axes.x.showHistograms = false;
                    $scope.graphModel.axes.x.showBarChart = false;
                }
                $scope.resetAxis('y');
            }

            if(xAxisChanged) {
                if(xAtt === null) {xAtt = undefined;}
                $scope.graphModel.attributes.x = xAtt;
                if($scope.graphModel.showHistograms()||$scope.graphModel.showBarChart()) {
                    $scope.graphModel.axes.y.showHistograms = false;
                    $scope.graphModel.axes.y.showBarChart = false;
                }
                $scope.resetAxis('x');
            }

            var att = xAtt || dataAtt || yAtt;
            if(att) {$scope.graphModel.attributes.color = att;}
            var isCasePlot = $scope.graphModel.attributes.x === undefined && $scope.graphModel.attributes.y === undefined;

            // we need to call updateAxis before updateBins because we need to determine the maximum value on the axis
            // for the case where only the number if bins is specified so we can figure out the range to use for the
            // histogram function used for binning.
            $scope.updateAxis(isCasePlot);
            $scope.updateBins(filterCaseViews($scope.graphModel.allCaseViews));
            $scope.updateHistograms();
            $scope.updateBarCharts();

            // we need to call updateAxis again, in case bins reset the range and because barcharts/histograms set
            // the orthogonal axis attribute

            $scope.updateAxis(isCasePlot);
            updateDividers();
            $scope.updateBinBoundaries();
            $scope.positioner.updateMatrixCells($scope.graphModel.axes.x.bins, $scope.graphModel.axes.y.bins);
            $scope.updateCasePositions();
            $scope.updateBoxes();
            $scope.updateSections();
            $scope.updateMeasuresOfCenter();
            if(att){
                $scope.updateDataColors(att);
            }
            // Render the graph (graphRenderer) with all changes from above
            $scope.renderer.render(true, callbackFn);
        };
        $scope.reset = function () {
            $scope.graphModel.attributes.color = undefined;
            $scope.graphModel.attributes.x = undefined;
            $scope.graphModel.attributes.y = undefined;

            _.each(['x','y'], function (a) {
                $scope.resetAxis(a);
                $scope.graphModel.axes[a].type = undefined;
                $scope.graphModel.axes[a].attribute = undefined;
            });

            //reset all case colors
            _.each($scope.graphModel.allCaseViews, function(caseView) {
                caseView.renderColor = undefined;
            });
            if($scope.caseData) {
                $scope.caseData.colorAttributeName = undefined;
                $scope.caseData.colorAttributeHeader = undefined;
            }
            $scope.update();
        };

        $scope.removeAxisAttribute = function (axisId) {
            if(axisId === 'x') {
                $scope.graphModel.attributes.x = undefined;
                if($scope.graphModel.axes.y.isCount()) {
                    $scope.graphModel.attributes.y = undefined;
                    $scope.resetAxis('y');
                }
            } else {
                $scope.graphModel.attributes.y = undefined;
                if($scope.graphModel.axes.x.isCount()) {
                    $scope.graphModel.attributes.x = undefined;
                    $scope.resetAxis('x');
                }
            }
            $scope.resetAxis(axisId);
            $scope.update();
        };

        $scope.updateDataColors = function(colorAttribute) {
            $scope.caseData.colorAttributeName = colorAttribute;
            if($scope.graphModel.showHistograms()||$scope.graphModel.showBarChart()) { return; }
            if(colorAttribute === undefined) {
                _.each($scope.graphModel.allCaseViews, function(caseView) {
                    caseView.renderColor = undefined;
                });
            }  else {
                var dataRange = $scope.caseData.getRange(colorAttribute, true);
                var attributeHeader = _.findWhere($scope.caseData.attributeHeaders, {display: colorAttribute});
                $scope.caseData.colorAttributeHeader = attributeHeader;

                var axes = $scope.graphModel.axes;
                var range = null;
                if(axes.x.attribute === $scope.caseData.colorAttributeName) {
                    range = axes.x.range;
                }
                else if(axes.y.attribute === $scope.caseData.colorAttributeName) {
                    range = axes.y.range;
                }
                // range can be null
                if($scope.caseData.colorAttributeHeader){
                    $scope.caseData.colorAttributeHeader.attributeValues.sortCategories(range);
                }

                var dataType = $scope.caseData.getType(colorAttribute);

                if (dataType === NUMERIC) {
                    var dataWidth = dataRange[1] - dataRange[0];
                    _.each($scope.caseData.cases, function (curCase) {
                        //parameterize the value on [0,1]
                        var mixParam = (curCase.attributes[colorAttribute] - dataRange[0]) / dataWidth;
                        var color = attributeHeader.colorRange.getColorRGB(mixParam);
                        _.each(_.filter($scope.graphModel.allCaseViews, function (c) {
                            return c.case.index === curCase.index;
                        }), function (c) {
                            c.renderColor = color;
                        });
                    });
                } else {
                    _.each($scope.caseData.cases, function (curCase) {
                        if(curCase.attributes[colorAttribute] !== undefined &&
                            !curCase.attributes[colorAttribute].toString().match(/^\s*$/)) {
                            var color = attributeHeader.attributeValues.getColor(curCase);
                            _.each(_.filter($scope.graphModel.allCaseViews, function (c) {
                                return c.case.index === curCase.index;
                            }), function (c) {
                                c.renderColor = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
                            });
                        }
                    });
                }
            }
        };

        //If the user has defined a range, we want to use that, otherwise, the caseData will define one for us.
        function getRange(axisId,attName, useUserRange, useTrueRange){
            var caseDataRange = $scope.caseData.getRange( attName, useTrueRange);
            var axis = $scope.graphModel.axes[axisId];
            if(!useUserRange) {
                if(axis.type === CATEGORICAL) {
                    return _(caseDataRange).map(function (r) {return [r];});
                } else {
                    return caseDataRange;
                }
            } else {
                var range = [];
                if(axis.type === CATEGORICAL) {
                    range =  axis.range; // return what has already been set
                } else {
                    _([0, 1]).each(function (indx) {

                        // for both min (0) and max (1) only use user selected range value if it is defined,
                        // otherwise assume they want to use what we think it should be.
                        var userVal = axis.userRange[indx];
                        if (userVal !== undefined && userVal !== null) {
                            range[indx] = userVal;
                        } else {
                            range[indx] = caseDataRange[indx];
                        }
                    });
                }
                return range;
            }
        }

        //update axis and viewConfig based on caseData and active attribute
        $scope.updateAxis = function(casePlot) {
            var dataRange;
            var dataType = {
                'x': mt.stats.STATS_FIELD_TYPE_NUMERIC,
                'y': mt.stats.STATS_FIELD_TYPE_NUMERIC
            };
            var min, max, majorInterval;

            if (casePlot === true) {
                //set the axis to be invisible
                $scope.graphModel.axes.x.visible = false;
                $scope.graphModel.axes.y.visible = false;

                //set the axes to be on [0,1]
                $scope.graphModel.axes.x.min.x.setVal(0);
                $scope.graphModel.axes.x.max.x.setVal(1);
                $scope.graphModel.axes.y.min.y.setVal(0);
                $scope.graphModel.axes.y.max.y.setVal(1);
                $scope.graphModel.axes.x.dividers = [];
                $scope.graphModel.axes.y.dividers = [];
                $scope.xRange = [0, 1];
                $scope.yRange = [0, 1];

            } else {
                var attribute = { x: $scope.graphModel.attributes.x, y: $scope.graphModel.attributes.y};
                _($scope.graphModel.axes).each(function (axis) {

                    // if there is an attribute defined, we want to set the axis attribute to it,
                    // otherwise there is the possibility that it is a count for a barchart/histogram
                    if (attribute[axis.axisId] !== undefined) {
                        axis.visible = true;
                        axis.label = { val: function () {return attribute[axis.axisId];} }; //TODO: is there a reason to return function here?

                        // if this axis is a count axis for barchart/histogram we do not want to set the type to
                        // a 'data' attribute. otherwise we do.
                        if (!axis.isCount()) {
                            axis.type = $scope.caseData.getType(attribute[axis.axisId]);
                            axis.isInteger = $scope.caseData.isInteger(attribute[axis.axisId]);
                            axis.attribute = attribute[axis.axisId];

                            dataType[axis.axisId] = axis.type;
                            if(axis.binThresholds) {
                                dataRange = [axis.binThresholds[0], axis.binThresholds[axis.binThresholds.length-1]];
                            } else {
                                dataRange = getRange(axis.axisId, attribute[axis.axisId], axis.userSetAxes, !axis.userSetAxes);
                            }
                        }

                        // set the range for numeric (including integer, binned) data
                        if (axis.type === NUMERIC) {

                            // if this a count for barchart/histogram, the scope.xRange or scope.yRange would have been
                            // set in updateBarChart()/updateHistogram()
                            if (axis.isCount()) {
                                axis.trueRange = axis.isXAxis ? $scope.xRange : $scope.yRange;
                                dataRange = axis.trueRange;
                            }

                            // otherwise ..
                            else {
                                axis.trueRange = $scope.caseData.getRange(attribute[axis.axisId], true);
                            }

                            min = dataRange[0];
                            max = dataRange[1];

                            axis.generateTickInterval();
                            if(axis.userSetAxes) {
                                if(axis.adjuster.major!==undefined &&
                                    !isNaN(axis.adjuster.major) && axis.adjuster.major !== null) {
                                    axis.majorInterval = new mt.common.MtValue(axis.adjuster.major);
                                }
                                if(axis.adjuster.minor!==undefined &&
                                    !isNaN(axis.adjuster.minor) && axis.adjuster.minor!== null) {
                                    axis.minorInterval = new mt.common.MtValue(axis.adjuster.minor);
                                }
                            }
                            majorInterval = axis.majorInterval.val();


                            // for counts we make sure we end on major interval, for others we need to
                            // start and end on major intervals
                            if(axis.binThresholds) {
                                axis.max[axis.axisId].setVal(max);
                            } else {
                                axis.bufferMax(max, majorInterval);
                            }
                            if (axis.isCount() ||axis.binThresholds) {
                                axis.min[axis.axisId].setVal(min);
                            } else {
                                axis.bufferMin(min, majorInterval);

                            }

                            dataRange = [axis.min[axis.axisId].val(), axis.max[axis.axisId].val()];
                            

                            if(!axis.userSetAxes) {
                                axis.adjuster.min = axis.min[axis.axisId].val();
                                axis.adjuster.max = axis.max[axis.axisId].val();
                                axis.adjuster.major = axis.majorInterval.val();
                                axis.adjuster.minor = axis.minorInterval.val();
                            }

                        }

                        // if categorical, set min and max to first and last categories. TODO: is this actually used?
                        else {
                            if (dataRange.length > 1) {
                                axis.min[axis.axisId].setVal(dataRange[dataRange.length - 1]);
                                axis.max[axis.axisId].setVal(dataRange[0]);
                            }
                        }

                        // set the scope.xRange/scope.yRange based on the data range determined above
                        if (axis.isXAxis) {
                            $scope.xRange = dataRange;
                        } else {
                            $scope.yRange = dataRange;
                        }
                    }

                    // this is for the case where the attribute is undefined, so either the axis represents a count,
                    // or it shouldn't be shown..
                    else {
                        if (axis.isCount()) {
                            max = _.max(_.map(axis.orthogonal.bins, function (b) {return b.y;}));
                            axis.min[axis.axisId].setVal(0);
                            axis.max[axis.axisId].setVal(max);
                            if (axis.isXaxis) { $scope.xRange = [0, max]; } else { $scope.yRange = [0, max]; }
                        } else {
                            //set the axis to be invisible
                            axis.visible = false;

                            //set the axes to be on [0,1]
                            axis.min[axis.axisId].setVal(0);
                            axis.max[axis.axisId].setVal(1);
                            axis.dividers = []; //TODO: necessary?
                            if (axis.isXAxis) { $scope.xRange = [0, 1]; } else { $scope.yRange = [0, 1]; }
                        }
                    }
                });
            }
            $scope.graphModel.axes.x.range = $scope.xRange;
            $scope.graphModel.axes.y.range = $scope.yRange;
            $scope.viewConfig.update($scope.xRange, $scope.yRange, dataType);
            updateCategoryBins(filterCaseViews($scope.graphModel.allCaseViews));
            updateCategoryBoundaries();
        };

        function updateCategoryBoundaries () {
            _.each([$scope.graphModel.axes.x, $scope.graphModel.axes.y], function(axis) {
                axis.categoryBoundaries = [];
                var scale = function(val) {
                    if(axis.isXAxis) {
                        return $scope.viewConfig.xScale(val);
                    } else {
                        return $scope.viewConfig.yScale(val);
                    }
                };

                var bounds = [];
                if(axis.type === mt.stats.STATS_FIELD_TYPE_CATEGORICAL) {
                    var categoryHalfWidth;
                    if(axis.categoryGroups.length < 2) {
                        var min = axis.renderMin[axis.isXAxis? 'x' : 'y'];
                        var max = axis.renderMax[axis.isXAxis? 'x' : 'y'];
                        axis.categoryHalfWidth = Math.round((max-min) / 2);
                        return ;
                    }
                    categoryHalfWidth = Math.round((scale(axis.categoryGroups[1]) - scale(axis.categoryGroups[0])) / 2);
                    axis.categoryHalfWidth = categoryHalfWidth;
                    bounds.push(Math.floor(scale(axis.categoryGroups[0]) - categoryHalfWidth));

                    _.each(axis.categoryGroups, function (category) {
                        bounds.push(Math.floor(scale(category) + categoryHalfWidth));
                    });

                    bounds = _.unique(bounds, true);
                    _.each(bounds, function(boundary) {
                        axis.categoryBoundaries.push ({
                            x1: axis.isXAxis ? boundary : $scope.graphModel.axes.x.renderMin.x,
                            x2: axis.isXAxis ? boundary : $scope.graphModel.axes.x.renderMax.x,
                            y1: axis.isXAxis ? $scope.graphModel.axes.y.renderMin.y : boundary,
                            y2: axis.isXAxis ? $scope.graphModel.axes.y.renderMax.y: boundary
                        });
                    });
                }
            });
        }

        /**
         * @description given a list of caseViews, return a filtered list containing only those for which
         *              the case has defined values for any defined axis attributes.
         * @param caseViews
         * @returns {*}
         */
        function filterCaseViews(caseViews) {

            var filteredCases = _.filter(caseViews, function (caseView) {
                return (
                    ($scope.graphModel.attributes.x === undefined ||
                        caseView.case.attributes[$scope.graphModel.attributes.x] !== undefined ||
                        $scope.graphModel.axes.x.isCount() ) &&
                    ($scope.graphModel.attributes.y === undefined ||
                        $scope.graphModel.axes.y.isCount() ||
                        caseView.case.attributes[$scope.graphModel.attributes.y] !== undefined)
                    );
            });

            return filteredCases;
        }

        /**
         * @description given a list of caseViews, return a filtered list containing those that are actually within
         *              a bin for each binned axis (eg, that haven't been excluded from bins due to axis adjustment).
         *              note: as a side effect this also positions the case within bin along the binned axis
         * @param caseViews
         * @returns {*}
         */
        function filterCaseViewsByBin(caseViews) {
            _.each(caseViews, function(c) {
                c.inview = {x:false, y:false};
            });
            _($scope.graphModel.axes).each(function(axis) {
                if(axis.binned) {
                    _(axis.bins).each(function(bin) {
                        _.each(bin,function(caseView) {
                            //TODO: is this really the place to be setting pos?
                            caseView.pos[axis.isXAxis?0:1] = bin.start + axis.multiplier*(bin.width/2);
                            caseView.inview[axis.axisId] = true;
                        });
                    });
                } else {
                    _.each(caseViews, function (c) {c.inview[axis.axisId] = true;});
                }
            });

            return _.filter(caseViews, function (caseView) {
                return caseView.inview.x === true && caseView.inview.y === true;
            });
        }

        /**
         * @description for categorical data, assign each caseView to the appropriate category bin, as well as
         *              calculate summary information for the bins.
         * @param caseViews
         */
        function updateCategoryBins(caseViews) {
            var attributes = { 'x': $scope.graphModel.attributes.x, 'y': $scope.graphModel.attributes.y };

            _($scope.graphModel.axes).each (function (axis) {
                if (axis.type === CATEGORICAL) {
                    axis.bins = [];
                    _(axis.range).each(function (axisRangeItem) {
                        var bin = [];
                        Object.defineProperty(bin, 'categories', { enumerable: false, writable: true  });

                        // make this have same interface as d3 bin as returned by d3.histogram
                        Object.defineProperty(bin, 'y', { enumerable: false, writable: true });
                        Object.defineProperty(bin, 'x', { enumerable: false, writable: true });
                        Object.defineProperty(bin, 'dx', { enumerable: false, writable: true });
                        Object.defineProperty(bin, 'percentage', { enumerable: false, writable: true });
                        Object.defineProperty(bin, 'sections', { enumerable: false, writable: true });
                        bin.categories = axisRangeItem;
                        axis.bins.push(bin);
                    });

                    // sorting keeps z axis position of cases sane for binned X categorical plots
                    caseViews = _(caseViews).sortBy(function (c) { return c.case.attributes[axis.orthogonal.attribute];});
                    _.each(caseViews, function (caseView) {
                        var caseCategory = caseView.case.attributes[attributes[axis.axisId]];
                        var bin = _.find(axis.bins, function (b) {
                            return _(b.categories).contains(caseCategory);
                        });
                        if(bin){
                            bin.push(caseView);
                        }
                    });

                    // set the axis categories to be same as bin categories.
                    axis.setCategoryGroups(_(axis.bins).map(function (bin) { return bin.categories; }));

                    // determine the bin width, in pixels
                    var binWidth;
                    if (axis.categoryGroups.length === 1) {
                        binWidth = Math.abs(axis.renderMax[axis.axisId] - axis.renderMin[axis.axisId]);
                    } else {
                        binWidth = Math.abs(axis.scale(axis.categoryGroups[1]) -
                            axis.scale(axis.categoryGroups[0]));
                    }

                    // calculate summary information
                    _.each(axis.categoryGroups, function (categoryGroup, indx) {
                        var bin = _.find(axis.bins, function (b) {
                            return b.categories === categoryGroup;
                        });
                        bin.y = bin.length;
                        bin.percentage = (100 * (bin.y / $scope.graphModel.visibleCaseCount)).toFixed();
                        bin.width = binWidth;
                        bin.start = axis.scale(axis.categoryGroups[indx]) -
                            axis.multiplier * Math.floor(bin.width / 2);
                        bin.identifier = bin.categories.join('');
                    });
                }
            });
        }

        $scope.updateCasePositions = function() {
            if($scope.caseData===undefined || $scope.caseData.cases ===undefined) {
                return;
            }
            var orderBy = ($scope.graphModel.attributes.x !== undefined &&
                ($scope.graphModel.axes.x.type !== mt.stats.STATS_FIELD_TYPE_CATEGORICAL &&
                    !$scope.graphModel.axes.x.isCount())) ?
                $scope.graphModel.attributes.x : (($scope.graphModel.attributes.y !== undefined &&
                $scope.graphModel.axes.y.type !== mt.stats.STATS_FIELD_TYPE_CATEGORICAL &&
                !$scope.graphModel.axes.y.isCount()) ? $scope.graphModel.attributes.y : $scope.graphModel.attributes.color);
            var orderedData = (orderBy !== undefined) ? $scope.caseData.order(orderBy) : $scope.caseData.cases;
            var axes = $scope.graphModel.axes;
            var attributes = { 'x': $scope.graphModel.attributes.x, 'y': $scope.graphModel.attributes.y };
            var orderedCaseViews = $scope.positioner.setCaseViewPositions(orderedData, attributes);

            $scope.graphModel.filteredCaseViews = filterCaseViewsByBin(filterCaseViews(orderedCaseViews));
            $scope.graphModel.visibleCaseCount = $scope.graphModel.filteredCaseViews.length;


            if ($scope.graphModel.showHistograms()||$scope.graphModel.showBarChart()) {
                var axis = _(axes).find(function (axis) {return (axis.showHistograms || axis.showBarChart);});

                var maxCount = _.max(axis.bins, function (bin) {
                    return bin.y;
                }).y;
                var rectHeight = 20;
                var maxHeight;
                var offset = $scope.graphModel.showHistograms() ? 0 : 7;
                maxHeight = Math.abs(axis.orthogonal.scale(maxCount) - axis.orthogonal.scale(0));
                rectHeight = maxHeight / maxCount ;

                _.each(axis.bins, function (bin) {
                    _.each(bin, function (caseView, indx) {
                        
                        if (axis.isXAxis) {
                            caseView.rectPos = [bin.start + offset, (mt.stats.STATS_GRAPH_RENDER_MIN_Y - ((rectHeight * (indx+1))))];
                            caseView.rectHeight = rectHeight;
                            caseView.rectWidth = bin.width - (offset*2);
                        } else {
                            caseView.rectPos = [mt.stats.STATS_GRAPH_RENDER_MIN_X + (rectHeight * indx), (bin.start - bin.width) + offset];
                            caseView.rectWidth = rectHeight;
                            caseView.rectHeight = bin.width - (offset*2);
                        }
                    });
                });
            }
            if ($scope.graphModel.attributes.x !== undefined || $scope.graphModel.attributes.y !== undefined) {
                if (($scope.graphModel.attributes.y === undefined ||axes.y.isCount()) &&
                    (axes.x.type === CATEGORICAL || axes.x.binned)) {
                    $scope.positioner.nudgeBinned('x');
                } else if (($scope.graphModel.attributes.x === undefined || axes.x.isCount()) &&
                    (axes.y.type === CATEGORICAL || axes.y.binned)) {
                    $scope.positioner.nudgeBinned('y');
                } else if ($scope.graphModel.attributes.y === undefined && axes.x.isQuant() && !axes.x.binned) {
                    $scope.positioner.nudgeNumerical('x',attributes);
                } else if ($scope.graphModel.attributes.x === undefined && axes.y.isQuant() && !axes.y.binned) {
                    $scope.positioner.nudgeNumerical('y',attributes);
                } else if ( axes.x.isQuant() && !axes.x.binned && axes.y.type === CATEGORICAL) {
                    $scope.positioner.nudgeNumericalBinned('y', attributes);
                } else if (axes.x.type === CATEGORICAL && axes.y.isQuant() &&!axes.y.binned) {
                    $scope.positioner.nudgeNumericalBinned('x', attributes);
                } else if (axes.x.isQuant() &&!axes.x.binned && axes.y.binned) {
                    $scope.positioner.nudgeNumericalBinned('y', attributes);
                } else if (axes.x.binned && axes.y.isQuant() && !axes.y.binned) {
                    $scope.positioner.nudgeNumericalBinned('x', attributes);
                } else if ((axes.x.type === CATEGORICAL||axes.x.binned) &&
                    (axes.y.binned||axes.y.type === CATEGORICAL)) {
                    $scope.positioner.nudgeBinnedBinned();
                }
            } else {
                var xStart = graphMargin * 2;
                var xEnd = $scope.width - graphMargin * 2;
                var numRows = orderedData.length * mt.common.GRAPH_CASE_RADIUS * 2 / (xEnd - xStart);
                var yStart = $scope.height / 2 - (numRows - 1) / 2 * mt.common.GRAPH_CASE_RADIUS * 2;

                var curPos = [xStart, yStart];
                _.each(orderedData, function (curCase) {
                    var caseView = _.find($scope.graphModel.allCaseViews, function (c) {
                        return c.case.index === curCase.index;
                    });
                    caseView.pos[0] = curPos[0];
                    caseView.pos[1] = curPos[1];
                    curPos[0] += mt.common.GRAPH_CASE_RADIUS * 2;
                    if (curPos[0] > xEnd) {
                        curPos[0] = xStart;
                        curPos[1] += mt.common.GRAPH_CASE_RADIUS * 2;
                    }
                });
            }
            $scope.$broadcast('casePositionsUpdated');

        };

        /**
         * @description Update all measure of center traits (Mean, Median, MAD). NOTE:
         * $scope.graphModel.filteredCaseViews as set of cases included in calculations to avoid nulls, and
         * empty cases, which d3 library cons to zero.
         */
        $scope.updateMeasuresOfCenter = function() {
            _($scope.graphModel.axes).each(function (axis) {
                axis.means = [];
                axis.medians = [];
                axis.mads = [];
                axis.meanBins = [];
                axis.medianBins = [];
                var orthogonal = axis.orthogonal;
                var meanValue;
                var meanBin;
                if(axis.isQuant()) {
                    if (axis.orthogonal.type === mt.stats.STATS_FIELD_TYPE_CATEGORICAL) {
                        _.each(axis.orthogonal.categoryGroups, function (category) {
                            var markerPosition;
                            var categoryWidth = axis.orthogonal.bins[0].width ;
                            var categoryCases = _.filter($scope.graphModel.filteredCaseViews, function (caseView) {
                                return _(category).contains(caseView.case.attributes[orthogonal.attribute]);
                            });
                            if (axis.showMeans) {
                                meanValue = d3.mean(categoryCases, function (caseView) {
                                    return caseView.case.attributes[axis.attribute];
                                });
                                if(!axis.binned) {
                                    markerPosition = orthogonal.scale(category) +
                                            (axis.multiplier * categoryWidth/2);
                                    axis.means.push({
                                        renderMin: markerPosition, // for categorical there is no line, so renderMin
                                        renderMax: markerPosition, // and renderMax are the same
                                        renderVal: axis.scale(meanValue),
                                        mean: meanValue
                                    });
                                } else {
                                    meanBin = _.find(axis.bins, function(bin) {
                                        return (bin.x <= meanValue && bin.x+bin.dx > meanValue);
                                    });
                                    axis.meanBins.push({
                                        renderPos: orthogonal.scale(category) +
                                            (axis.multiplier * (Math.round((categoryWidth/2) -3))),
                                        renderMin: axis.scale(meanBin.x),
                                        renderMax: axis.scale(meanBin.x+meanBin.dx),
                                        mean: meanValue
                                    });
                                }
                            }
                            if (axis.showMADs) {
                                meanValue = d3.mean(categoryCases, function (caseView) {
                                    return caseView.case.attributes[axis.attribute];
                                });
                                var madFunc = function () {
                                    var sumOfAllCasesForThisCategoryMADs = 0;
                                    _.each(categoryCases, function(caseView) {
                                        sumOfAllCasesForThisCategoryMADs += Math.abs(caseView.case.attributes[axis.attribute] - meanValue);
                                    });
                                    var mad = sumOfAllCasesForThisCategoryMADs / categoryCases.length;
                                    return mad;
                                };
                                var madValue = madFunc();
                                if(axis.isQuant() && madValue > 0)  {
                                    axis.mads.push({
                                        renderMin: orthogonal.scale(category) +
                                            (axis.multiplier * categoryWidth/2),
                                        renderMax: orthogonal.scale(category) -
                                            (axis.multiplier * categoryWidth/2),
                                        renderMADGraphMin: axis.scale(meanValue - madValue),
                                        renderMADGraphMax: axis.scale(meanValue + madValue),
                                        renderMADGraphWidth: ((axis.scale(meanValue + madValue) -
                                            axis.scale(meanValue - madValue)) * axis.multiplier),
                                        mad: madValue
                                    });
                                }
                            }
                            if (axis.showMedians) {
                                var medianValue = d3.median(categoryCases, function (caseView) {
                                    return caseView.case.attributes[axis.attribute];
                                });
                                if(!axis.binned) {
                                    markerPosition = orthogonal.scale(category)+
                                        (axis.multiplier * categoryWidth/2);
                                    axis.medians.push({
                                        renderMin: markerPosition, // for categorical there is no line, so renderMin
                                        renderMax: markerPosition, // and renderMax are the same
                                        renderVal: axis.scale(medianValue),
                                        median: medianValue
                                    });
                                } else {
                                    var medianBin = _.find(axis.bins, function(bin) {
                                        return (bin.x <= medianValue && bin.x+bin.dx > medianValue);
                                    });
                                    var pad = medianBin === meanBin ? 8 : 3;
                                    axis.medianBins.push({
                                        renderPos: orthogonal.scale(category) +
                                           (axis.multiplier * (Math.round((categoryWidth/2) -pad))),
                                        renderMin: axis.scale(medianBin.x),
                                        renderMax: axis.scale(medianBin.x+medianBin.dx),
                                        median: medianValue
                                    });
                                }
                            }
                        });
                    } else {
                        if (axis.showMeans) {
                            meanValue = d3.mean($scope.graphModel.filteredCaseViews, function (caseView) {
                                return caseView.case.attributes[axis.attribute];
                            });
                            if (axis.isQuant()&&!axis.binned) {
                                axis.means.push({
                                    renderMin: orthogonal.renderMin[orthogonal.axisId],
                                    renderMax: orthogonal.renderMax[orthogonal.axisId],
                                    renderVal: axis.scale(meanValue),
                                    mean: meanValue
                                });
                            } else {
                                meanBin = _.find(axis.bins, function (bin) {
                                    return (bin.x <= meanValue && bin.x + bin.dx > meanValue);
                                });
                                axis.meanBins.push({
                                    renderPos: orthogonal.renderMin[orthogonal.axisId] + (axis.multiplier * -3),
                                    renderMin: axis.scale(meanBin.x),
                                    renderMax: axis.scale(meanBin.x + meanBin.dx),
                                    mean: meanValue
                                });
                            }
                        }
                        if (axis.showMADs) {
                            meanValue = d3.mean($scope.graphModel.filteredCaseViews, function (caseView) {
                                return caseView.case.attributes[axis.attribute];
                            });
                            var madFunc = function () {
                                var sumOfAllCasesMAD = 0;
                                _.each($scope.graphModel.filteredCaseViews, function (caseView) {
                                    sumOfAllCasesMAD += Math.abs(caseView.case.attributes[axis.attribute] - meanValue);
                                });
                                var mad = sumOfAllCasesMAD / $scope.graphModel.filteredCaseViews.length;
                                return mad;
                            };
                            var madValue = madFunc();

                            if (axis.isQuant() && madValue > 0 && !axis.binned) {
                                axis.mads.push({
                                    renderMin: orthogonal.renderMin[orthogonal.axisId],
                                    renderMax: orthogonal.renderMax[orthogonal.axisId],
                                    renderMADGraphMin: axis.scale(meanValue - madValue),
                                    renderMADGraphMax: axis.scale(meanValue + madValue),
                                    renderMADGraphWidth: ((axis.scale(meanValue + madValue) -
                                        axis.scale(meanValue - madValue)) * axis.multiplier),
                                    mad: madValue
                                });
                            }
                        }
                        if (axis.showMedians) {
                            var medianValue = d3.median($scope.graphModel.filteredCaseViews, function (caseView) {
                                return caseView.case.attributes[axis.attribute];
                            });
                            if (axis.isQuant()&&!axis.binned) {
                                axis.medians.push({
                                    renderMin: axis.orthogonal.renderMin[axis.orthogonal.axisId],
                                    renderMax: axis.orthogonal.renderMax[axis.orthogonal.axisId],
                                    renderVal: axis.scale(medianValue),
                                    median: medianValue
                                });
                            } else {
                                var medianBin = _.find(axis.bins, function (bin) {
                                    return (bin.x <= medianValue && bin.x + bin.dx > medianValue);
                                });
                                var pad = medianBin === meanBin ? 8 : 3;
                                axis.medianBins.push({
                                    renderPos: axis.orthogonal.renderMin[axis.orthogonal.axisId] - (axis.multiplier * pad),
                                    renderMin: axis.scale(medianBin.x),
                                    renderMax: axis.scale(medianBin.x + medianBin.dx),
                                    median: medianValue
                                });
                            }
                        }
                    }
                }
            });
        };

        $scope.getState = function() {
            if ($scope.graphModel.attributes.x !== undefined && $scope.graphModel.attributes.y !== undefined) {
                return ns.STATS_GRAPH_STATE_SCATTER;
            } else if ($scope.graphModel.attributes.x !== undefined && $scope.graphModel.attributes.y === undefined) {
                return ns.STATS_GRAPH_STATE_DOT_ON_X;
            } else if ($scope.graphModel.attributes.x === undefined && $scope.graphModel.attributes.y !== undefined) {
                return ns.STATS_GRAPH_STATE_DOT_ON_Y;
            } else {
                return ns.STATS_GRAPH_STATE_EMPTY;
            }
        };

        $scope.getDropTargetText = function (type) {
            var messages = _(ns.STATS_DROP_TARGET_MESSAGES).findWhere({state: $scope.getState()}).messages;
            return _(messages).findWhere({type: type}).text;
        };
        $scope.$on('update', function(e, xAtt, dataAtt, yAtt) {
            $scope.update(xAtt, dataAtt, yAtt);
        });
        $scope.$on('reset', function() {
            $scope.reset();
        });
        $scope.updateSections = function () {
            _($scope.graphModel.axes).each(function (axis){
                var histogramLayout;
                var lowEnd = axis.min[axis.axisId].val();
                var thresholds = [lowEnd];
                var orderedDividers = _(axis.dividers).sortBy('value');
                _(orderedDividers).each(function (divider) {
                    thresholds.push(divider.value);
                });
                thresholds.push(axis.max[axis.axisId].val());
                histogramLayout = d3.layout.histogram().value(function (kase) {
                    return kase.attributes[axis.attribute];
                }).bins(thresholds);

                if(axis.type === CATEGORICAL) {
                    axis.sections = [
                        {
                            y: $scope.graphModel.filteredCaseViews.length,
                            percentage: 100,
                            renderPos: axis.swap([
                                (axis.getPixMin()+axis.getPixMax())/2,
                                axis.orthogonal.renderMax[axis.orthogonal.axisId]
                            ])
                        }
                    ];
                } else if(axis.type === NUMERIC){
                    axis.sections = histogramLayout(_($scope.graphModel.filteredCaseViews).map(function (c) {
                            return c.case;
                        })
                    );
                    _.each(axis.sections, function (section) {
                        section.midpoint = section.x + (section.dx / 2);
                        section.renderPos = axis.swap([
                            axis.scale(section.midpoint),
                            axis.orthogonal.renderMax[axis.orthogonal.axisId]
                        ]);
                        section.percentage = (100 * (section.y / $scope.graphModel.visibleCaseCount)).toFixed();
                    });
                    if(axis.orthogonal.bins && axis.orthogonal.bins.length>0) {
                        _(axis.orthogonal.bins).each(function (bin) {
                            bin.sections = histogramLayout(_(bin).map(function (c) {return c.case;}));

                            _.each(bin.sections, function (section) {
                                section.midpoint = section.x + (section.dx / 2);
                                section.renderPos = axis.swap([
                                    axis.scale(section.midpoint),
                                    bin.start
                                ]);
                                section.percentage = (100 * (section.y / bin.y)).toFixed();
                            });
                        });
                    }
                }
            });
        };

        $scope.adjustDivider = function() {
            var value = $scope.graphModel.selectedDividerValue;
            var divider = $scope.graphModel.selectedDivider;
            var axis = divider.axis;

            if(value>axis.max[axis.axisId].val() || value <axis.min[axis.axisId].val()) {
                $scope.graphModel.selectedDivider.destroy();
            } else {
                $scope.graphModel.selectedDivider.setValue(value);
            }
            $scope.graphModel.selectedDivider = undefined;
            $scope.update();
        };

        $scope.addDivider = function (axisId) {
            if ($scope.graphModel.axes[axisId].isQuant()) {
                var axis = $scope.graphModel.axes[axisId];
                var divider = new mt.stats.Divider(axis);

                $scope.gestureHandler.selectObject(divider); //$scope.selectionApi.setSelection({type: 'divider', modelObject:divider});

                axis.dividers.push(divider);
                $scope.update();
                return divider;
            }
        };

        $scope.updateBoxes = function() {
            _($scope.graphModel.axes).each(function(axis) {
                axis.boxes = [];
                if(axis.showBoxes && axis.isQuant() && !axis.binned) {
                    var caseViews, orthogonal = axis.orthogonal;
                    if (orthogonal.type === CATEGORICAL || orthogonal.binned) {
                        _(orthogonal.bins).each(function (bin) {
                            caseViews = _(bin).sortBy(function (caseView) {
                                return caseView.case.attributes[axis.attribute];
                            });
                            $scope.addBox(axis, caseViews, bin);
                        });
                    } else {
                        caseViews = _.sortBy($scope.graphModel.filteredCaseViews, function (caseView) {
                            return caseView.case.attributes[axis.attribute];
                        });
                        $scope.addBox(axis, caseViews);
                    }
                }
            });
        };

        /**
         * @description add a boxplot for a given axis,set of cases and possibly category group. Note that, as per story
         * ST-361, we use this method for determining quartiles: http://en.wikipedia.org/wiki/Quartile#Method_1
         * which is slightly different than what is returned by d3.quantile()
         * @param axis
         * @param caseViews
         * @param categoryGroup
         */
        $scope.addBox = function (axis, caseViews, bin) {

            var box = {};
            var orthogonal = axis.orthogonal;

            if(bin) {
                box.identifier = bin.identifier;
                box.height = axis.orthogonal.bins[0].width / 2;
                box.position = bin.start + (orthogonal.multiplier*(bin.width/2)) - (box.height / 2);
            } else {
                box.height = 75;
                box.position = ( ( (axis.orthogonal.scale(orthogonal.max[orthogonal.axisId].val()) +
                    axis.orthogonal.scale(orthogonal.min[orthogonal.axisId].val())) / 2 ) -
                    box.height * (axis.isXAxis? 1:0));
            }

            if(caseViews[0]) {

                if(axis.isXAxis) {
                    box.min = caseViews[0].pos[0];
                    box.max = caseViews[caseViews.length - 1].pos[0];
                } else {
                    box.min = caseViews[caseViews.length - 1].pos[1];
                    box.max = caseViews[0].pos[1];
                }

                // see http://en.wikipedia.org/wiki/Quartile#Method_1
                var dataPoints = _.map( caseViews, function(c) { return c.case.attributes[axis.attribute];});
                var medianValue = d3.median(dataPoints);
                var lowerHalf = _(dataPoints).filter(function(val) {return val < medianValue;});
                var upperHalf = _(dataPoints).filter(function(val) {return val > medianValue;});
                var quantiles = [
                    dataPoints[0],
                    (lowerHalf.length>0) ? d3.median(lowerHalf):medianValue,
                    medianValue,
                    (upperHalf.length>0) ? d3.median(upperHalf):medianValue,
                    dataPoints[dataPoints.length-1]
                ];
                box.leftBrim = axis.scale(axis.swap([quantiles[1],quantiles[3]])[0]);
                box.rightBrim = axis.scale(axis.swap([quantiles[1],quantiles[3]])[1]);
                box.crownCenter =  axis.scale(quantiles[2]);

                axis.boxes.push(box);
            }
        };
        $scope.updateBinBoundaries = function() {
            _.each(['x','y'], function(a) {
                var axis = $scope.graphModel.axes[a];
                axis.binBoundaries = [];
                if(axis.binned) {
                    _.each(axis.bins, function (bin, indx) {
                        Object.defineProperty(bin, 'width', { enumerable: false, writable: true});
                        Object.defineProperty(bin, 'start', { enumerable: false, writable: true});
                        Object.defineProperty(bin, 'label', { enumerable: false, writable: true});
                        Object.defineProperty(bin, 'percentage', { enumerable: false, writable: true});
                        Object.defineProperty(bin, 'sections', { enumerable: false, writable: true});
                        bin.start = axis.scale(bin.x);
                        bin.width = Math.abs(axis.scale(bin.x + bin.dx) - axis.scale(bin.x));
                        axis.binBoundaries.push({label:bin.x.toFixed(axis.getPrecision(bin.dx)), pos:bin.start});
                        if (indx === axis.bins.length - 1) {
                            axis.binBoundaries.push({
                                label:(bin.x+bin.dx).toFixed(axis.getPrecision(bin.dx)),
                                pos:axis.scale(bin.x + bin.dx)
                            });
                        }
                        var precision = axis.getPrecision(bin.dx)+1;
                        bin.label = bin.x+ '-' + (bin.x + bin.dx - Math.pow(0.1,precision)).toFixed(precision);
                        bin.percentage = (100 * (bin.y / $scope.graphModel.visibleCaseCount)).toFixed();
                        bin.identifier = bin.label;
                    });
                }
            });
        };
        $scope.updateHistograms = function() {
            if( !$scope.graphModel.showHistograms() ) {
                $scope.graphModel.axes.x.histograms = [];
                $scope.graphModel.axes.y.histograms = [];
                return;
            }

            _.each(['x', 'y'], function (a) {
                var axis = $scope.graphModel.axes[a];
                $scope.graphModel.axes[a].histograms = [];
                if(!axis.binned) {
                    return;
                }
                if( $scope.graphModel.axes[a].showHistograms) {
                    $scope.graphModel.axes[a].histograms = axis.bins;
                }
                axis.binBoundaries = [];
                var maxCount = _.max(axis.bins, function (b) {
                    return b.y;
                }).y;

                _($scope.graphModel.allCaseViews).each(function (caseView) {
                    caseView.renderColor =
                        $scope.graphModel.filteredCaseViews[$scope.graphModel.filteredCaseViews.length - 1].renderColor;
                });

                if (a === 'x') {
                    $scope.yRange = [0, maxCount];
                    $scope.graphModel.axes.y.isInteger = true;
                    $scope.graphModel.axes.y.type = NUMERIC;
                    $scope.graphModel.axes.y.visible = true;
                    $scope.graphModel.attributes.y = 'Count';
                } else {
                    $scope.xRange = [0, maxCount];
                    $scope.graphModel.axes.x.isInteger = true;
                    $scope.graphModel.axes.x.type = NUMERIC;
                    $scope.graphModel.axes.x.visible = true;
                    $scope.graphModel.attributes.x = 'Count';
                }
            });
        };

        $scope.updateBarCharts = function() {
            _.each(['x', 'y'], function (a) {
                var axis = $scope.graphModel.axes[a];
                if(axis.type !== CATEGORICAL || axis.showBarChart === false) {
                    return;
                }
               
                var maxCount = _.max(axis.bins, function (b) {
                    return b.y;
                }).y;
                if (a === 'x') {
                    $scope.yRange = [0, maxCount];
                    $scope.graphModel.axes.y.isInteger = true;
                    $scope.graphModel.axes.y.type = NUMERIC;
                    $scope.graphModel.axes.y.visible = true;
                    $scope.graphModel.attributes.y = 'Count';
                } else {
                    $scope.xRange = [0, maxCount];
                    $scope.graphModel.axes.x.isInteger = true;
                    $scope.graphModel.axes.x.type = NUMERIC;
                    $scope.graphModel.axes.x.visible = true;
                    $scope.graphModel.attributes.x = 'Count';
                }

                // set the render color for each case
                var attributeHeader = _.findWhere($scope.caseData.attributeHeaders, {display: axis.attribute });
                _.each($scope.graphModel.allCaseViews, function(caseView) {
                    var color = attributeHeader.attributeValues.getColor(caseView.case);
                    if(color) {
                        caseView.renderColor = 'rgb(' + color[0] + ',' + color[1] + ',' + color[2] + ')';
                    }
                });

            });
        };
        $scope.updateBins = function(caseViews) {
            _.each(['x', 'y'], function (a) {
                var axis = $scope.graphModel.axes[a];
                axis.binBoundaries = [];
                if(!axis.binned) {
                    return;
                }
                axis.ruler = undefined;
                // we should not allow dividers on binned axis as per ST-227
                axis.dividers = [];
                var attr = axis.isXAxis ? $scope.graphModel.attributes.x : $scope.graphModel.attributes.y;
                caseViews = _(caseViews).sortBy(function (c) { return c.case.attributes[attr];});
                if (axis.selectedBinWidth !== undefined) {
                    axis.createEqualSizeBins(caseViews, axis.binCount, attr, axis.selectedBinWidth);
                } else {
                    axis.createEqualSizeBins(caseViews, axis.binCount, attr);
                }
            });
        };
        $scope.binData = function(a) {
            if ($scope.graphModel.axes[a].selectedBinWidth === null) {
                $scope.graphModel.axes[a].selectedBinWidth = undefined;
            }

            if ($scope.graphModel.axes[a].binCount === 0 && $scope.graphModel.axes[a].selectedBinWidth === undefined) {
                $scope.graphModel.axes[a].type = $scope.caseData.getType(a === 'x' ? $scope.graphModel.attributes.x : $scope.graphModel.attributes.y);
                $scope.graphModel.axes[a].binned = false;
                $scope.graphModel.axes[a].binThresholds = undefined;
                if ($scope.graphModel.axes[a].showHistograms) {
                    if(a==='x') {
                        $scope.graphModel.attributes.y = undefined;
                    } else {
                        $scope.graphModel.attributes.x = undefined;
                    }
                    $scope.graphModel.axes[a].orthogonal.type = undefined;
                    $scope.graphModel.axes[a].showHistograms = false;
                    $scope.renderer.transitionToDots(function() {
                        $scope.graphModel.axes[a].bins = [];
                        $scope.update();
                    });
                } else {
                    $scope.graphModel.axes[a].bins = [];
                    $scope.update();
                }
            } else {
                $scope.graphModel.axes[a].binned = true;
                $scope.graphModel.axes[a].showBoxes = false;
                $scope.update();
            }
        };

        function updateDividers() {
            _($scope.graphModel.axes).each(function (axis) {
                _(axis.dividers).each(function (divider) {
                    divider.setValue();
                });
            });
        }
        $scope.resetAxis=function(axisId) {
            $scope.renderer.removeBars();
            $scope.graphModel.axes[axisId].reset();
        };

        /**
         * @description get a range of values based on a bin width and either a min or max
         * @param axis
         * @param caseViews
         * @param width
         * @param anchor
         * @param isMin boolean indicating whether or not the anchor is a min or a max
         * @returns {*[]}
         */
        $scope.getRangeForBinsByWidth=function(axis, caseViews, width, anchor, isMin) {
            var i = 0;
            var attributeValues = _(caseViews).map(function (c) {
                return c.case.attributes[axis.attribute];
            });

            if(isMin) {
                var max = _(attributeValues).max();

                while(anchor + i*width  <= max) {
                    i++;
                }
                return [anchor, anchor + i*width];
            } else {
                var min = _(attributeValues).min();

                while(anchor - i*width > min) {
                    i++;
                }
                return [anchor - i*width, anchor];
            }
        };

        /**
         * @description adjust the min or max in the axes adjuster when the max or min (respectively) is adjusted by user
         * @param axis
         * @param prop
         */
        $scope.adjusterChange = function(axis, prop) {
            if(axis.selectedBinWidth !== undefined) {
                if (prop === 'min') {
                    var max =
                        $scope.getRangeForBinsByWidth(axis,
                            $scope.graphModel.filteredCaseViews,
                            axis.selectedBinWidth,
                            axis.adjuster.min,
                            true
                        )[1];
                    if (max > axis.adjuster.min) {
                        axis.adjuster.max= max;
                    }
                }

                if (prop === 'max') {
                    var min =
                        $scope.getRangeForBinsByWidth(axis,
                            $scope.graphModel.filteredCaseViews,
                            axis.selectedBinWidth,
                            axis.adjuster.max,
                            false
                        )[0];
                    if (min < axis.adjuster.max) {
                        axis.adjuster.min = min;
                    }
                }
            }
        };

        $scope.validateAdjusterMinMax = function(axis) {
            if(!axis.isQuant()||
                axis.adjuster.min === null||
                axis.adjuster.max === null||
                axis.adjuster.min < axis.adjuster.max) {
                return true;
            } else {
                return false;
            }
        };

        $scope.measureDeviations = function(divider, deviationAttributeHeader, absDeviationAttributeHeader ) {
            var deviations = [];
            var axis = divider.axis;
            var attr = axis.attribute;
            var indx = 0;
            var startValue = divider.value;

            _($scope.graphModel.filteredCaseViews).each(function (caseView) {
                var deviation = {
                    index: indx++,
                    axis: axis,
                    attr: attr,
                    caseView: caseView,
                    caseValue: caseView.case.attributes[attr],
                    orthogonalCoordinate: caseView.pos[axis.isXAxis?1:0],
                    startValue: startValue
                };
                deviations.push(deviation);
                Object.defineProperty(deviation, 'deviation', {
                    get: deviationAttributeHeader.getter().bind(caseView.case)
                });
                Object.defineProperty(deviation, 'absoluteDeviation', {
                    get: absDeviationAttributeHeader.getter().bind(caseView.case)
                });

            });

            $scope.renderer.renderDeviations(deviations,axis, function() {
                $scope.$root.$broadcast('rerender');
            });
        };

        $scope.setAxisMenu = function(axis) {

            var isNumeric = $scope.graphModel.axes[axis].isQuant();

            $scope.graphModel.axes[axis].isSelected = true;

            if(isNumeric) {
                $scope.selectionApi.setSelection({type: mt.stats.STATS_FIELD_TYPE_NUMERIC, modelObject: $scope.graphModel.axes[axis] });
            } else if (!isNumeric) {
                $scope.selectionApi.setSelection({type: mt.stats.STATS_FIELD_TYPE_CATEGORICAL, modelObject: $scope.graphModel.axes[axis] });
            }
        };

        $scope.ribbon = $controller('mtStatsPlotRibbonCtrl', {
            $scope: $scope
        });

        $scope.ribbon.register();
    });
})(window.mt.stats);

(function (ns) {
    'use strict';

    var StatsPlotRibbonCtrl = [
        '$compile', '$scope', '$timeout', 'statsDataService', 'toolMenuService',
        function (
                $compile,
                $scope,
                $timeout,
                statsDataService,
                toolMenuService
                ) {

        var NUMERIC = mt.stats.STATS_FIELD_TYPE_NUMERIC;
        var CATEGORICAL = mt.stats.STATS_FIELD_TYPE_CATEGORICAL;
        var DIVIDER = 'divider';
        var RULER = 'ruler';

        function getSelection(type) {
            var curSelection = $scope.selectionApi.getSelection();
            var selObj;
            if(curSelection !== undefined  && curSelection.type === type && curSelection.modelObject !== undefined) {
                selObj = curSelection.modelObject;
            }
            return selObj;
        }

        function getCurrentSelection(type) {
            return getSelection(type);
        }

        //Generic Ribbon Items
        var riSeparator = toolMenuService.newItem.seperator();

        //PLOT Ribbon
        var riResetCb = function() {
            $scope.resetGraph();
            $scope.update();
        };

        var riReset = toolMenuService.newItem.button('Reset', riResetCb, {showName: true, cssClass:'mt-plot-reset-axes'});

        var riRemoveAxisAttrCb = function() {
            var axis;

            if($scope.graphModel.axes.x.type === NUMERIC || $scope.graphModel.axes.y.type === NUMERIC) {
                axis = getCurrentSelection(NUMERIC);
            } else {
                axis = getCurrentSelection(CATEGORICAL);
            }

            $scope.removeAxisAttribute(axis.axisId);
            $scope.selectionApi.clear();
            $scope.update();
        };

        var riRemoveAxisAttr = toolMenuService.newItem.button('Clear Axis', riRemoveAxisAttrCb, {showName: true, cssClass:'mt-plot-remove-axis-attr'});

        var riShowCountsCb = function() {
            $scope.graphModel.showCounts = !$scope.graphModel.showCounts;
            $scope.update();
        };

        var riShowCountsGet = function() {
            return $scope.graphModel.showCounts;
        };

        var riShowCounts = toolMenuService.newItem.toggle('#', riShowCountsCb, {showName: true, cssClass:'mt-plot-show-counts'}, riShowCountsGet);

        var riShowPercentagesCb = function() {
            $scope.graphModel.showPercentages = !$scope.graphModel.showPercentages;
            $scope.update();
        };

        var riShowPercentagesGet = function() {
            return $scope.graphModel.showPercentages;
        };

        var riShowPercentages = toolMenuService.newItem.toggle('%', riShowPercentagesCb, {showName: true, cssClass:'mt-plot-show-percentages'}, riShowPercentagesGet);

        var riUnlockCb = function() {
            $scope.graphModel.locked = !$scope.graphModel.locked;
            $scope.update();
        };

        var riUnlockGet = function() {
            return !$scope.graphModel.locked;
        };

        var riUnlock = toolMenuService.newItem.toggle('Unlock', riUnlockCb, {showName: true, cssClass:'mt-plot-unlock', nameToggle:'Lock'}, riUnlockGet);

        //NUMERIC ribbon
        var riAxesMinCb = function(input) {
            var axis = getCurrentSelection(NUMERIC);
            var newMin = parseInt(input);

            if(isNaN(newMin)) {
                newMin = 0;
            }

            axis.adjuster.min = newMin;
            $scope.axesUpdate();
        };

        var riAxesMinGet = function() {
            var axis = getCurrentSelection(NUMERIC);
            if(axis === undefined) { return; }
            return axis.min[axis.axisId].val();
        };

        var riAxesMin = toolMenuService.newItem.input('axis-min', riAxesMinCb, {showName: true, cssClass:'mt-plot-axis-min', updateOnChange: false}, riAxesMinGet); //for temp styling

        var riAxesMaxCb = function(input) {
            var axis = getCurrentSelection(NUMERIC);
            var newMax = parseInt(input);
            
            if(isNaN(newMax)) {
                newMax = 0;
            }
            
            axis.adjuster.max = newMax;
            $scope.axesUpdate();
        };

        var riAxesMaxGet = function() {
            var axis = getCurrentSelection(NUMERIC);
            if(axis === undefined) { return; }
            return axis.max[axis.axisId].val();
        };

        var riAxesMax = toolMenuService.newItem.input('axis-max', riAxesMaxCb, {showName: true, cssClass:'mt-plot-axis-max', updateOnChange: false}, riAxesMaxGet); //for temp styling

        var riBinsInputCb = function(input) {
            var axis = getCurrentSelection(NUMERIC);
            var newCount = parseInt(input);

            $scope.binWidthCheckBox = false;
            $scope.binNumCheckBox = true;
            axis.selectedBinWidth = undefined;

            if(isNaN(newCount)) {
                newCount = 0;
            }

            axis.binCount = newCount;

            $scope.binData(axis.axisId); 
        };

        var riBinsInputGet = function() {
             var axis = getCurrentSelection(NUMERIC);
            if(axis === undefined) { return; }
            return axis.binCount;
        };

        var riBinsInput = toolMenuService.newItem.input('bins-input', riBinsInputCb, {showName: true, label:' bins', cssClass:'mt-plot-bins-by-number', updateOnChange: false}, riBinsInputGet);

        var riBinsWidthCb = function(input) {
            var axis = getCurrentSelection(NUMERIC);
            var newCount = parseInt(input);

            $scope.binWidthCheckBox = true;
            $scope.binNumCheckBox = false;
            axis.binCount = 0;

            if(isNaN(newCount)) {
                newCount = 0;
            }

            axis.selectedBinWidth = newCount;

            $scope.binData(axis.axisId); 
        };

        var riBinsWidthGet = function() {
            var axis = getCurrentSelection(NUMERIC);
            if(axis === undefined) { return; }
            if(axis.selectedBinWidth === 0) {
                return 0;
            } else {
                return axis.selectedBinWidth;
            }
        };

        var riBinsWidth = toolMenuService.newItem.input('bins-width', riBinsWidthCb, {showName: true, label: ' bins by width', cssClass:'mt-plot-bins-by-width', updateOnChange: false}, riBinsWidthGet);

        var riBinsResetCb = function() {
            var axis = getCurrentSelection(NUMERIC);
            $scope.binWidthCheckBox = false;
            $scope.binNumCheckBox = false;
            axis.binCount = 0;
            axis.selectedBinWidth = undefined;

            $scope.binData(axis.axisId);
        };

        var riBinsReset = toolMenuService.newItem.button('Remove Bins', riBinsResetCb, {showName: true});

        var riHistogramCb = function() {
            if($scope.graphModel.showHistograms()) {
                _.each(['x','y'], function (a) {
                    if(!$scope.graphModel.axes[a].showHistograms) {
                        $scope.graphModel.axes[a].type = undefined;
                        $scope.graphModel.axes[a].visible = false;
                        if(a==='x') {
                            $scope.graphModel.attributes.x = undefined;
                        } else {
                            $scope.graphModel.attributes.y = undefined;
                        }
                    } else {
                        $scope.graphModel.axes[a].showHistograms = false;
                    }
                });
                $scope.renderer.transitionToDots($scope.update);
            } else {
                var noop = true;
                _.each(['x', 'y'], function (a) {
                    var otherAxis = a === 'x' ? 'y' : 'x';
                    if ($scope.graphModel.axes[a].binned &&
                        $scope.graphModel.axes[otherAxis].type === undefined) {
                        $scope.graphModel.axes[a].showHistograms = true;
                        noop = false;
                    }
                });
                if (!noop) {
                    $scope.updateHistograms();
                    $scope.updateAxis(false);
                    $scope.updateCasePositions();
                    $scope.renderer.transitionToBars($scope.update);
                }
            }
        };

        var riHistogramGet = function() {
            var axis = getCurrentSelection(NUMERIC);
            if(axis === undefined) { return; }
            return axis.showHistograms;
        };

        var riHistogram = toolMenuService.newItem.toggle('Histogram', riHistogramCb, 
            {showName: true, cssClass:'mt-plot-histogram', 
                isVisible: function() {
                    if($scope.binNumCheckBox || $scope.binWidthCheckBox) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }, riHistogramGet);

        var binsOpts = ['Bin Options', riBinsInput, riBinsWidth, riHistogram, riBinsReset];
        var riBins = toolMenuService.newItem.popover('+Bins', [binsOpts], {showName: true, cssClass:'mt-plot-add-bins'});

        var riDividerCb = function() {
            var axis = getCurrentSelection(NUMERIC);
            riBinsResetCb();
            $scope.addDivider(axis.axisId);
        };

        var riDivider = toolMenuService.newItem.button('+Divider', riDividerCb, {showName: true, cssClass:'mt-plot-divider'});

        var riMeanCb = function() {
            var axis = getCurrentSelection(NUMERIC);
            axis.showMeans = !axis.showMeans;
            $scope.update();
        };

        var riMeanGet = function() {
            var axis = getCurrentSelection(NUMERIC);
            if(axis === undefined) { return; }
            return axis.showMeans;
        };

        var riMean = toolMenuService.newItem.toggle('Show Means', riMeanCb, {showName: true, cssClass:'mt-plot-show-mean'}, riMeanGet);

        var riMedianCb = function() {
            var axis = getCurrentSelection(NUMERIC);
            axis.showMedians = !axis.showMedians;
            $scope.update();
        };

        var riMedianGet = function() {
            var axis = getCurrentSelection(NUMERIC);
            if(axis === undefined) { return; }
            return axis.showMedians;
        };

        var riMedian = toolMenuService.newItem.toggle('Show Medians', riMedianCb, {showName: true, cssClass:'mt-plot-show-median'}, riMedianGet);

        var riMADCb = function() {
            var axis = getCurrentSelection(NUMERIC);
            axis.showMADs = !axis.showMADs;
            axis.showMeans = axis.showMADs;

            if(axis.binned) {
                axis.showMADs = false;
            }

            $scope.update();
        };

        var riMADGet = function() {
            var axis = getCurrentSelection(NUMERIC);
            if(axis === undefined) { return; }
            return axis.showMADs;
        };

        var riMAD = toolMenuService.newItem.toggle('Show MADs', riMADCb, {showName: true, cssClass:'mt-plot-show-mad'}, riMADGet);

        var measureOpts = ['Measure Options', riMean, riMedian, riMAD];
        var riMeasure = toolMenuService.newItem.popover('+Measure', [measureOpts], {showName: true, cssClass:'mt-plot-add-measure'});

        var riRulerCb = function() {
            var axis = getCurrentSelection(NUMERIC);
            if (axis.ruler) {
                $scope.removeRuler(axis.axisId);
            } else {
                $scope.addRuler(axis.axisId);
            }

            $scope.update();
        };

        var riRuler = toolMenuService.newItem.button('+Ruler', riRulerCb, {showName: true, cssClass:'mt-plot-ruler'});

        var riBoxPlotCb = function() {
            var axis = getCurrentSelection(NUMERIC);
            if(!axis.binned) {
                axis.showBoxes = !axis.showBoxes;
                $scope.update();
            }
        };

        var riBoxPlotGet = function() {
            var axis = getCurrentSelection(NUMERIC);
            if(axis === undefined) { return; }
            return axis.showBoxes;
        };

        var riBoxPlot = toolMenuService.newItem.toggle('Box Plot', riBoxPlotCb, {showName: true, cssClass:'mt-plot-box-plot'}, riBoxPlotGet);

        var riNumNameGet = function() {
            var axis = getCurrentSelection(NUMERIC);
            if(axis === undefined) { return; }
            return _.capitalize(axis.axisId) + '-axis: ' + axis.attribute;
        };

        var riNumName = toolMenuService.newItem.label('Axis Label', {}, riNumNameGet);

        //CATEGORICAL Ribbon
        var riBarChartCb = function() {
            if($scope.graphModel.showBarChart()) {
                _.each(['x','y'], function (a) {
                    if(!$scope.graphModel.axes[a].showBarChart) {
                        $scope.graphModel.axes[a].type = undefined;
                        $scope.graphModel.axes[a].visible = false;
                        $scope.graphModel.attributes[a] = undefined;
                    } else {
                        $scope.graphModel.axes[a].showBarChart = false;
                    }
                });
                $scope.renderer.transitionToDots($scope.update);

            } else {
                _.each(['x','y'], function (a) {
                    if ($scope.graphModel.axes[a].type === CATEGORICAL &&
                        $scope.graphModel.axes[a].orthogonal.type === undefined) {
                        $scope.graphModel.axes[a].showBarChart = true;
                    }
                });
                if($scope.graphModel.showBarChart()) {
                    $scope.updateBarCharts();
                    $scope.updateAxis(false);
                    $scope.updateCasePositions();
                    $scope.renderer.transitionToBars($scope.update);
                }
            }
        };

        var riBarChartGet = function() {
            var axis = getCurrentSelection(CATEGORICAL);
            if(axis === undefined) { return; }
            return axis.showBarChart;
        };

        var riBarChart = toolMenuService.newItem.toggle('Bar Chart', riBarChartCb, {showName: true, cssClass:'mt-plot-bar-chart'}, riBarChartGet);

        // var riMergeCb = function() {
        //     $scope.gestureHandler.mergeMode = !$scope.gestureHandler.mergeMode;
        //     $scope.update();
        // };

        // var riMergeGet = function() {
        //     return $scope.gestureHandler.mergeMode;
        // };

        // var riMerge = toolMenuService.newItem.toggle('Merge', riMergeCb, {showName: true, cssClass:'mt-plot-merge'}, riMergeGet);

        // var riUnmergeCb = function() {
        //     var axis = getCurrentSelection(CATEGORICAL);

        //     if(axis.visible) {
        //         _.each(axis.range, function (element, index) {
        //             if(element.length > 1){
        //                 axis.range.splice(index, 0, axis.range[index].splice(-1, 1));
        //             }
        //         });
        //     }

        //     if($scope.gestureHandler.mergeMode) {
        //         $scope.gestureHandler.mergeMode = false;
        //     }

        //     $scope.update();
        // };

        // var riUnmerge = toolMenuService.newItem.button('Unmerge', riUnmergeCb, {showName: true, cssClass:'mt-plot-unmerge'});

        var riCatNameGet = function() {
            var axis = getCurrentSelection(CATEGORICAL);
            if(axis === undefined) { return; }
            return _.capitalize(axis.axisId) + '-axis: ' + axis.attribute;
        };

        var riCatName = toolMenuService.newItem.label('Axis Label', {}, riCatNameGet);

        // var riXAxis = toolMenuService.newItem.button('X Axis', function() {$scope.setAxisMenu('x');}, {showName: true, isVisible: function() {return $scope.graphModel.axes.x.sections;}, cssClass:'mt-plot-x-axis-menu'});
        // var riYAxis = toolMenuService.newItem.button('Y Axis', function() {$scope.setAxisMenu('y');}, {showName: true, isVisible: function() {return $scope.graphModel.axes.y.sections;}, cssClass:'mt-plot-y-axis-menu'});
        
        //Divider Ribbon
        var riRemoveDividerCb = function() {
            var divider = getCurrentSelection(DIVIDER);
            divider.destroy();
            $scope.selectionApi.clear();
            $scope.update();
        };

        var riRemoveDivider = toolMenuService.newItem.button('Remove', riRemoveDividerCb);

        var riDividerLabelGet = function() {
            var divider = getCurrentSelection(DIVIDER);
            if(divider === undefined) { return; }
            return _.capitalize(divider.axis.axisId) + '-axis Dividers';
        };

        var riDividerLabel = toolMenuService.newItem.label('Divider Label', {}, riDividerLabelGet);

        var riAddDividerCb = function() {
            var divider = getCurrentSelection(DIVIDER);
            var newDivider = new mt.stats.Divider(divider.axis);
            $scope.gestureHandler.selectObject(newDivider);
            divider.axis.dividers.push(newDivider);
            $scope.update();
        };

        var riAddDivider = toolMenuService.newItem.button('+', riAddDividerCb);

        var riDividerValueCb = function(input){
            var divider = getCurrentSelection(DIVIDER);
            var newVal = parseInt(input);

            divider.value = isNaN(newVal) ? 0 : newVal;

            $scope.update();
        };

        var riDividerValueGet = function(){
            var divider = getCurrentSelection(DIVIDER);
            if(divider === undefined) { return; }
            return parseInt(divider.value);
        };

        var riDividerValue = toolMenuService.newItem.input('divider-value', riDividerValueCb, {updateOnChange: false}, riDividerValueGet);

        var riDividerCalcDeviationCb = function() {
            var divider = getCurrentSelection(DIVIDER);
            var axis = divider.axis;
            var startValue = divider.value;
            var attr = axis.attribute;

            // first the deviation
            var deviationAttributeHeader = $scope.graphModel.caseData.addAttribute('deviation from '+startValue+
                ' for '+attr, NUMERIC);
            deviationAttributeHeader.getter = function() {
                return function() {
                    return Math.floor(this.attributes[attr] -startValue);
                };
            };

            // and then the absolute deviation
            var absDeviationAttributeHeader = $scope.graphModel.caseData.addAttribute('absolute deviation from '+startValue+
                ' for '+attr,mt.stats.STATS_FIELD_TYPE_NUMERIC);
            absDeviationAttributeHeader.getter = function() {
                return function() {
                    return Math.floor(Math.abs(this.attributes[attr] -startValue));
                };
            };
            if(axis.deviationAnimationInProgress) {
                if(axis.deviationAnimationDuration > 0.5) {
                    axis.deviationAnimationDuration /= 2;
                }
            } else {
                $scope.measureDeviations(divider, deviationAttributeHeader, absDeviationAttributeHeader);
            }
        };

        var riDividerDeviations = toolMenuService.newItem.button('Calc Deviations', riDividerCalcDeviationCb);

        //Ruler Ribbon
        var riRemoveRulerCb = function() {
            var ruler = getCurrentSelection(RULER);
            ruler.destroy();
            $scope.selectionApi.clear();
            $scope.renderer.renderRulers();
        };

        var riRemoveRuler = toolMenuService.newItem.button('Remove', riRemoveRulerCb);

        var riRulerLabelGet = function() {
            var ruler = getCurrentSelection(RULER);
            if(ruler === undefined) { return; }
            return _.capitalize(ruler.axis.axisId) + '-axis Ruler';
        };

        var riRulerLabel = toolMenuService.newItem.label('Ruler Label', {}, riRulerLabelGet);

        //ruler min === left/top handle
        var riRulerMinCb = function(input) {
            var ruler = getCurrentSelection(RULER);
            var minHandle = ruler.handles[0];
            var initVal = minHandle.dataValue;
            var newMin = parseInt(input);

            if(isNaN(newMin)) {
                newMin = initVal;
            }

            minHandle.setDataValue(newMin);

            if(minHandle.isPastTheOther(minHandle.getPixelValue())) {
                minHandle = minHandle.switchHandles();
                minHandle.setDataValue(newMin);
            }

            $scope.renderer.renderRulers();
        };

        var riRulerMinGet = function() {
            var ruler = getCurrentSelection(RULER);
            if(ruler === undefined) { return; }
            var minHandle = ruler.handles[0];
            return minHandle.dataValue;
        };

        var riRulerMin = toolMenuService.newItem.input('ruler-min', riRulerMinCb, {showName: true, updateOnChange: false}, riRulerMinGet);

        //ruler max === right/bottom handle
        var riRulerMaxCb = function(input) {
            var ruler = getCurrentSelection(RULER);
            var maxHandle = ruler.handles[1];
            var initVal = maxHandle.dataValue;
            var newMax = parseInt(input);

            if(isNaN(newMax)) {
                newMax = initVal;
            }

            maxHandle.setDataValue(newMax);

            if(maxHandle.isPastTheOther(maxHandle.getPixelValue())) {
                maxHandle = maxHandle.switchHandles();
                maxHandle.setDataValue(newMax);
            }

            $scope.renderer.renderRulers();
        };

        var riRulerMaxGet = function() {
            var ruler = getCurrentSelection(RULER);
            if(ruler === undefined) { return; }
            var maxHandle = ruler.handles[1];
            return maxHandle.dataValue;
        };

        var riRulerMax = toolMenuService.newItem.input('ruler-max', riRulerMaxCb, {showName: true, updateOnChange: false}, riRulerMaxGet);

        //Set Ribbons
        var ribbon = {
            toolId: $scope.toolId,
            items: {
                left: [riReset],
                center: [],
                right: [riShowCounts, riShowPercentages, riUnlock]
            }
        };

        var numericRibbon = {
            toolId: $scope.toolId,
            items: {
                left: [riRemoveAxisAttr, riSeparator, riNumName],
                center: [],
                right: [riAxesMin, toolMenuService.newItem.label('Min - Max', {cssClass:'mt-ribbon-image-end-points'}), riAxesMax, riBins, riDivider, riMeasure, riRuler, riBoxPlot]
            }
        };

        var catRibbon = {
            toolId: $scope.toolId,
            items: {
                left: [riRemoveAxisAttr, riSeparator, riCatName],
                center: [],
                right: [riBarChart]
            }
        };

        var dividerRibbon = {
            toolId: $scope.toolId,
            items: {
                left:[riRemoveDivider, toolMenuService.newItem.seperator(), riDividerLabel, riSeparator, riDividerValue],
                center:[],
                right: [riDividerDeviations, riSeparator, riShowCounts, riShowPercentages, riAddDivider]
            }
        };

        var rulerRibbon = {
            toolId: $scope.toolId,
            items: {
                left:[riRemoveRuler, toolMenuService.newItem.seperator(), riRulerLabel, riSeparator, riRulerMin, toolMenuService.newItem.label('Min - Max', {cssClass:'mt-ribbon-image-end-points'}), riRulerMax],
                center:[],
                right: []
            }
        };

        this.register = function() {
            toolMenuService.setToolMenu($scope.toolId, ribbon, {containerApi: $scope.containerApi});
            toolMenuService.setToolMenu($scope.toolId, numericRibbon, {contextId: NUMERIC, selectionApi: $scope.selectionApi});
            toolMenuService.setToolMenu($scope.toolId, catRibbon, {contextId: CATEGORICAL, selectionApi: $scope.selectionApi});
            toolMenuService.setToolMenu($scope.toolId, dividerRibbon, {contextId: DIVIDER, selectionApi: $scope.selectionApi});
            toolMenuService.setToolMenu($scope.toolId, rulerRibbon, {contextId: RULER, selectionApi: $scope.selectionApi});
        };
    }];

    angular.module('mtStats').controller('mtStatsPlotRibbonCtrl', StatsPlotRibbonCtrl);

})(window.mt.stats);

/**
 * Created by Oakley Hall on 6/13/14.
 */
(function () {
    'use strict';

    angular.module('mtStats').controller('ProbsToolsParentCtrl', function ($controller, $scope, ProbabilityService, eventingService) {
        $scope.probabilityService = ProbabilityService.getInstance();
        $scope.activeSim = 'cards'; 
        $scope.ribbonProperties = {tableOpts:[], replaceOpts:[]};

        $scope.ribbon = $controller('mtStatsProbabilityRibbonCtrl', {
            $scope: $scope
        });

        $scope.ribbon.register();

        $scope.init = function() {
            $scope.resultsCaseData = new mt.stats.CaseData();
            //subscribe to link event (sent from parent stats table)
            eventingService.subscribe($scope.toolId, mt.stats.EVENT_PROB_TOOL_SOURCE, function(event) {
                $scope.probabilityService.setResultsCaseData(event.data);
                $scope.probabilityService.setResultsToolId(event.sourceId);
            });
        };

        //JMT this was copied from the old GRT prob and sampler fn, they have now diverged in flows
        $scope.initSampler = function() {
            var createEvent = new mt.common.Event();
            $scope.resultsCaseData = new mt.stats.CaseData();
            $scope.probabilityService.setResultsCaseData($scope.resultsCaseData);
            $scope.probabilityService.setToolId($scope.toolId);
            var linkDataEvent = new mt.common.Event({caseData:$scope.resultsCaseData,sourceId:$scope.toolId});

            createEvent.toolId = mt.common.createGuid();
            $scope.probabilityService.setResultsToolId(createEvent.toolId);
            createEvent.type = mt.common.TYPE_STATS;
            eventingService.publish(mt.common.EVENT_CREATE_TOOL, createEvent);

            setTimeout(function() {
                eventingService.publishToSubscriber(mt.stats.EVENT_PROB_TOOL_RESULTS,
                    linkDataEvent, createEvent.toolId);
            });
            return createEvent.toolId;
        };
    });
})(window.mt.stats);


/**
 * Created by Oakley Hall on 7/1/14.
 */
(function () {
    'use strict';

    angular.module('mtStats').controller('CardCtrl', function ($scope,$timeout,toolMenuService){

        var NUM_CARDS_TO_START = 52,
            FLIP_TIMEOUT = 1500;

        $scope.speed                = 1;
        $scope.skipani              = false;
        $scope.runs                 = 0;
        $scope.repsRemaining        = 0;
        $scope.deckOfCards          = [];
        $scope.results              = [];
        $scope.numRepetitions       = 1;
        $scope.numDraw              = 1;
        $scope.flipped              = false;
        $scope.running              = false;
        $scope.outOfCards           = false;
        $scope.replacement          = 'draw';


        $scope.countCardValues          = false;
        $scope.countCardValuesAndSuits  = false;
        $scope.countCardColors          = {red:false, black:false};
        $scope.countCardSuits           = {hearts:false, spades:false, diamonds:false, clubs:false};

        $scope.preserveResults          = false;

        //establish ribbon options
        var riReplaceDraw        = toolMenuService.newItem.toggle('Replace every draw', function() { $scope.replacement = 'draw'; }, {}, function() { return $scope.replacement === 'draw'; });
        var riReplaceTrial       = toolMenuService.newItem.toggle('Replace every trial', function() { $scope.replacement = 'trial'; }, {}, function() { return $scope.replacement === 'trial'; });
        var riReplaceExperiment  = toolMenuService.newItem.toggle('No replacement', function() { $scope.replacement = 'experiment'; }, {}, function() { return $scope.replacement === 'experiment'; });
        var riPreserve           = toolMenuService.newItem.toggle('Preserve Results', function() { $scope.preserveResults = !$scope.preserveResults; }, {cssClass:'mt-probs-preserve', showName: true}, function() { return $scope.preserveResults; });
        var riValues             = toolMenuService.newItem.toggle('Values', function() { $scope.countCardValues = !$scope.countCardValues; }, {}, function() { return $scope.countCardValues; });
        var riValuesAndSuits     = toolMenuService.newItem.toggle('Values and Suits', function() { $scope.countCardValuesAndSuits = !$scope.countCardValuesAndSuits; }, {}, function() { return $scope.countCardValuesAndSuits; });
        var riReds               = toolMenuService.newItem.toggle('Reds', function() { $scope.countCardColors.red = !$scope.countCardColors.red; }, {}, function() { return $scope.countCardColors.red; });
        var riBlacks             = toolMenuService.newItem.toggle('Blacks', function() { $scope.countCardColors.black = !$scope.countCardColors.black; }, {}, function() { return $scope.countCardColors.black; });
        var riSpades             = toolMenuService.newItem.toggle('Spades', function() { $scope.countCardSuits.spades = !$scope.countCardSuits.spades; }, {}, function() { return $scope.countCardSuits.spades; });
        var riDiamonds           = toolMenuService.newItem.toggle('Diamonds', function() { $scope.countCardSuits.diamonds = !$scope.countCardSuits.diamonds; }, {}, function() { return $scope.countCardSuits.diamonds; });
        var riClubs              = toolMenuService.newItem.toggle('Clubs', function() { $scope.countCardSuits.clubs = !$scope.countCardSuits.clubs; }, {}, function() { return $scope.countCardSuits.clubs; });
        var riHearts             = toolMenuService.newItem.toggle('Hearts', function() { $scope.countCardSuits.hearts = !$scope.countCardSuits.hearts; }, {}, function() { return $scope.countCardSuits.hearts; });

        var riCardReplaceOpts    = [riReplaceExperiment, riReplaceDraw, riReplaceTrial];
        var riCardTableOpts      = [riValues, riValuesAndSuits, riReds, riBlacks, riSpades, riDiamonds, riClubs, riHearts, riPreserve];

        //called by link function to initialize
        $scope.begin = function(){
            $scope.getNewDeck();
            $scope.ribbonProps.tableOpts = riCardTableOpts;
            $scope.ribbonProps.replaceOpts = riCardReplaceOpts;
        };

        //called when tool window is closed
        $scope.$on('$destroy', function() {
            $scope.resetTool();
        });

        ///////////////////////
        //  User Controls    //
        ///////////////////////

        $scope.getNewDeck = function(){
            $scope.deckOfCards = [];
            for(var i = 0; i < NUM_CARDS_TO_START; i++){
                $scope.deckOfCards.push( new Card(i+1) );
            }
            $scope.outOfCards = false;
        };

        $scope.run = function(){
            $scope.preserveEnabled = true;
            if(!$scope.preserveResults){
                $scope.runs = 0;
                $scope.probabilityService.clearTable();
            }

            $scope.repsRemaining = $scope.numRepetitions;
            $scope.running = true;
            $scope.flip();
        };

        $scope.clearCards = function(){
            $scope.results =[];
        };

        //////////////////////////
        //      Watchers        //
        //////////////////////////

        $scope.$watch('numDraw + replacement + countCardValues + countCardValuesAndSuits', function () {
            $scope.disallowPreservation();
        });

        $scope.$watch('countCardSuits',function () {
            $scope.disallowPreservation();
        },true);

        $scope.$watch('countCardColors',function () {
            $scope.disallowPreservation();
        },true);

        $scope.$watch('speed', function() {
            $scope.skipani = false;
            if($scope.speed === 32) {
                $scope.skipani = true;
            }
        });

        $scope.disallowPreservation = function(){
            $scope.preserveResults  = false;
            $scope.preserveEnabled = false;
        };

        ///////////////////////
        //  Card Behavior    //
        ///////////////////////

        $scope.getRandomCardIndex = function(){
            return Math.floor( Math.random() * $scope.deckOfCards.length );
        };

        $scope.drawCards = function(){
            var cardsToDraw = $scope.numDraw,
                thisDraw = [];

            $scope.runs++;

            if($scope.runs>1){
                $scope.case = $scope.probabilityService.addNewCase();
            }

            while(cardsToDraw>0){
                cardsToDraw--;

                var attr = 'Card ' + ( $scope.numDraw - cardsToDraw ),
                    cardIndex = $scope.getRandomCardIndex();

                $scope.card = $scope.deckOfCards[ cardIndex ];

                if($scope.runs===1){
                    $scope.probabilityService.addAttribute(attr, mt.stats.STATS_FIELD_TYPE_CATEGORICAL);
                    $scope.case = $scope.probabilityService.getCaseByIndex(1);
                }

                $scope.results.push( $scope.card );
                thisDraw.push( $scope.card );
                if($scope.case){
                    $scope.probabilityService.addDataPoint($scope.case.index, attr, $scope.card.name);
                }

                $scope.deckOfCards.splice(cardIndex, 1);

                if( $scope.replacement === 'draw' ){
                    $scope.getNewDeck();
                }
            }

            if( $scope.replacement === 'trial' ){
                $scope.getNewDeck();
            }
            if($scope.case){
                $scope.probabilityService.addCardCalculatedTraits($scope.case.index,thisDraw, $scope.countCardValues,
                    $scope.countCardValuesAndSuits,
                    $scope.countCardColors,$scope.countCardSuits);
            }
            $scope.repsRemaining--;
        };

        $scope.experimentFinished = function(){
            $scope.running = false;
            $scope.speed = 1;
            if( $scope.replacement === 'experiment' ){
                $scope.getNewDeck();
            }
        };

        $scope.flip = function(){
            var speed = ($scope.speed || 1);
            if($scope.outOfCards){
                return;
            }

            if($scope.skipani){
                while($scope.repsRemaining>0){
                    $scope.drawCards();
                }
                $scope.experimentFinished();
            }else{
                if(!$scope.flipped){
                    $('.mt-flipper').addClass('mt-flip-it');
                    $scope.flipped = true;
                    $scope.drawCards();
                    $timeout($scope.flip, FLIP_TIMEOUT/speed);
                }else{
                    $('.mt-flipper').removeClass('mt-flip-it');
                    $scope.flipped = false;
                    if($scope.repsRemaining>0){
                        $timeout($scope.flip, FLIP_TIMEOUT/speed);
                    }else{
                        $scope.experimentFinished();
                    }
                }
            }


            if( $scope.deckOfCards.length <= 0 ){
                $scope.outOfCards = true;
                $scope.card = undefined;
            }
            speed = 1;
        };

        $scope.getCardValues = function(cardInt){
            var numbers = [ 'Ace','King','Queen','Jack',
                    '10','9','8','7','6','5','4','3','2'],
                suits   = ['Clubs', 'Spades', 'Hearts', 'Diamonds' ],
                region  = cardInt/suits.length,
                num     = ( region%1===0 ) ? region-1 : Math.floor(region),
                suit    = ( ( cardInt%suits.length ) === 0 ) ? 3 : cardInt%suits.length- 1;

            return { suit:suits[suit],
                     value:numbers[num],
                     color:(suits[suit] === 'Clubs' ||
                            suits[suit] === 'Spades')? 'black' : 'red'
                   };
        };

        var Card = function(id){
            var cardVals = $scope.getCardValues(id);
            this.id     = id;
            this.name   = cardVals.value + ' of ' + cardVals.suit;
            this.value  = cardVals.value;
            this.suit   = cardVals.suit;
            this.color  = cardVals.color;
            this.image  = $scope.probabilityService.getImageURL(id);
        };

        //////////////////
        //  Utilities   //
        //////////////////

        $scope.resetTool = function(){
            $scope.flipped = false;
            $scope.repsRemaining = 0;
            $scope.runs = 0;
            $scope.deckOfCards = [];

            $scope.results              = [];
            $scope.numRepetitions       = 1;
            $scope.numDraw              = 1;
            $scope.running              = false;
            $scope.outOfCards           = false;
            $scope.replacement          = 'draw';
        };
    });

    //directive for displaying card face
    angular.module('mtStats').directive('backImg', function(){
        return function (scope, element, attrs) {
            attrs.$observe('img', function(pUrl) {
                element.css({
                    'background-image': 'url(' + pUrl + ')',
                    'background-repeat': 'no-repeat',
                    'background-size': '25%',
                    'background-position': '50%'
                });
            });
        };
    });

})(window.mt.stats);

/**
 * Created by Oakley Hall on 7/1/14.
 */
(function () {
    'use strict';

    angular.module('mtStats').controller('CoinCtrl', function ($scope,$interval,$timeout,toolMenuService) {

        var pict = [3, 4, 1, 4],
            faceImages = ['heads','tails1','tails','heads1','dist'],
            HEADS_FACE = 'heads',
            TAILS_FACE = 'tails',
            FLIP_TIME = 1500,
            ANIMATION_INTERVAL = 90;


        $scope.speed            = 1;
        $scope.skipani          = false;
        $scope.odds             = 0.5;
        $scope.resultsArray     = [];
        $scope.repsRemaining    = 0;
        $scope.runs             = 0;
        $scope.tailsWeight      = 50;
        $scope.headsWeight      = 50;
        $scope.numRepetitions   = 1;
        $scope.running          = false;
        $scope.coins            = [];
        $scope.numCoins         = 1;

        $scope.orderedList      = false;
        $scope.unorderedList    = false;
        $scope.countHeads       = false;
        $scope.countTails       = false;

        $scope.preserveResults  = false;

        //establish ribbon options
        var riPreserve      = toolMenuService.newItem.toggle('Preserve Results', function() { $scope.preserveResults = !$scope.preserveResults; }, {cssClass:'mt-probs-preserve', showName: true}, function() { return $scope.preserveResults; });
        var riUnorderedList = toolMenuService.newItem.toggle('Unordered List', function() { $scope.unorderedList = !$scope.unorderedList; }, {}, function() { return $scope.unorderedList; });
        var riOrderedList   = toolMenuService.newItem.toggle('Ordered List', function() { $scope.orderedList = !$scope.orderedList; }, {}, function() { return $scope.orderedList; });
        var riCountHeads    = toolMenuService.newItem.toggle('Count Heads',  function() { $scope.countHeads = !$scope.countHeads; }, {}, function() { return $scope.countHeads; });
        var riCountTails    = toolMenuService.newItem.toggle('Count Tails',  function() { $scope.countTails = !$scope.countTails; }, {}, function() { return $scope.countTails; });
        
        var riCoinTableOpts = [riUnorderedList, riOrderedList, riCountHeads, riCountTails, riPreserve];

        //called by link function to initialize
        $scope.begin = function(){
            $scope.coins.push( new $scope.Coin(1) );
            $scope.ribbonProps.tableOpts = riCoinTableOpts;
        };

        //called when tool window is closed
        $scope.$on('$destroy', function() {
            $scope.resetTool();
        });

        ///////////////////////
        //  User Controls    //
        ///////////////////////

        $scope.numCoinsChanged = function(){
            while($scope.numCoins>$scope.coins.length){
                $scope.coins.push( new $scope.Coin($scope.coins.length+1) );
            }

            while($scope.numCoins<$scope.coins.length){
                $scope.coins.splice( $scope.coins.length-1, 1 );
            }

        };

        $scope.run = function(){
            $scope.preserveEnabled = true;
            if(!$scope.preserveResults){
                $scope.runs = 0;
                $scope.probabilityService.clearTable();
            }

            $scope.running = true;
            $scope.repsRemaining = $scope.numRepetitions;
            $scope.coins.forEach(function(coin) {

                $scope.probabilityService.addAttribute('Coin ' + coin.id, mt.stats.STATS_FIELD_TYPE_CATEGORICAL);
                coin.reset();
            });
            $scope.doFlips();
        };

        $scope.doFlips = function() {
            var kase;
            var speed = ($scope.speed || 1);
            $scope.runs++;
            $scope.repsRemaining--;
            if($scope.runs>1){
                kase = $scope.probabilityService.addNewCase() || {};
            } else {
                kase = $scope.probabilityService.getCaseByIndex(1)  || {};
            }

            $scope.coins.forEach(function(coin){
                if($scope.skipani){
                    $scope.calculateResult(coin,kase);
                }else{
                    coin.complete = false;
                    coin.flip(kase);
                }
            });

            $scope.resultsArray = [];

            if($scope.repsRemaining>0){
                $timeout($scope.doFlips, $scope.skipani?0:(FLIP_TIME/speed));
            }else{
                $scope.running = false;
                $scope.speed = 1;
            }
        };

        //////////////////
        //  Watchers    //
        //////////////////

        $scope.$watch('numCoins + orderedList + unorderedList + countHeads+ countTails',function(){
            $scope.disallowPreservation();
        });

        $scope.$watch('tailsWeight', function () {
            $scope.disallowPreservation();
            $scope.headsWeight = 100-$scope.tailsWeight;
            $scope.odds = $scope.headsWeight/100;
        });

        $scope.$watch('headsWeight', function () {
            $scope.disallowPreservation();
            $scope.tailsWeight = 100-$scope.headsWeight;
            $scope.odds = $scope.headsWeight/100;
        });

        $scope.$watch('speed', function() {
            $scope.skipani = false;
            if($scope.speed === 32) {
                $scope.skipani = true;
            }
        });

        $scope.disallowPreservation = function(){
            $scope.preserveResults  = false;
            $scope.preserveEnabled = false;
        };

        ///////////////////////
        //  Coin Behavior    //
        ///////////////////////

        $scope.calculateResult = function(coin,kase){
            var attr = 'Coin '+ coin.id;
            if (Math.random() > $scope.odds) {
                coin.choice = 0;
                coin.face = HEADS_FACE;
                coin.image = coinImage(HEADS_FACE);
                coin.complete = true;
                $scope.resultsArray.push('H');
            }else {
                coin.choice = 2;
                coin.face = TAILS_FACE;
                coin.image = coinImage(TAILS_FACE);
                coin.complete = true;
                $scope.resultsArray.push('T');
            }
            $scope.probabilityService.addDataPoint(kase.index, attr, coin.face);
            $scope.probabilityService.addCoinCalculatedTraits(kase.index,$scope.resultsArray,
                                                                $scope.orderedList,
                                                                $scope.unorderedList,
                                                                $scope.countHeads,
                                                                $scope.countTails);

        };

        var coinImage = function(img){
            return $scope.probabilityService.getImageURL(img);
        };

        $scope.Coin = function(id){
            this.id         = id;
            this.framecnt   = 0;
            this.framenum   = undefined;
            this.choice     = 0;
            this.image      = coinImage(HEADS_FACE);
            this.face       = HEADS_FACE;
            this.flipping   = null;
            this.complete   = false;

            this.reset = function(){
                this.framecnt = 0;
                this.framenum = undefined;
                this.flipping = null;
                this.complete = false;
            };

            this.flip = function(kase){
                $('#'+this.id).addClass('flipup');
                var queue = [];
                this.ani = function(coin){
                    coin.framenum = (coin.framecnt) % 4;
                    coin.framecnt++;
                    coin.image = coinImage(faceImages[pict[coin.framenum]]);
                    if ((coin.framecnt > 8) && (coin.framenum === coin.choice) ) {
                        $interval.cancel(coin.flipping);
                        coin.flipping = null;
                        coin.complete = true;
                        coin.image = coinImage(faceImages[coin.choice]);
                        $('#'+coin.id).removeClass('flipup');
                    }

                    queue.forEach(function(calc){
                        calc[0](calc[1],calc[2]);
                        queue.shift();
                    });
                };

                queue.push( [ $scope.calculateResult, this, kase ] );
                if ( this.flipping === null && !this.complete ) {
                    var coin = this,
                        speed = ($scope.speed||1);
                    this.flipping = $interval(function(){ coin.ani(coin); }, ANIMATION_INTERVAL/speed);
                }
            };

        };

        //////////////////
        //  Utilities   //
        //////////////////

        $scope.resetTool = function(){
            $scope.tailsWeight      = 50;
            $scope.headsWeight      = 50;
            $scope.numRepetitions    = 1;
            $scope.running          = false;
            $scope.coins            = [];
            $scope.numCoins         = 1;

            $scope.orderedList      = false;
            $scope.unorderedList    = false;
            $scope.countHeads       = false;
            $scope.countTails       = false;
            $scope.repsRemaining    = 0;
            $scope.runs             = 0;

            $scope.odds = 0.5;
            $scope.resultsArray = [];
        };
    });
})(window.mt.stats);

/**
 * Created by Oakley Hall on 7/1/14.
 */
(function () {
    'use strict';

    angular.module('mtStats').controller('DiceCtrl', function ($scope,$interval,$timeout,toolMenuService) {

        var rollingImgsUrls = [
                ['die-1','dices-1','die-1','dicet-1'],
                ['die-2','dices-2','die-2','dicet-2'],
                ['die-3','dices-3','die-3','dicet-3'],
                ['die-4','dices-4','die-4','dicet-4'],
                ['die-5','dices-5','die-5','dicet-5'],
                ['die-6','dices-6','die-6','dicet-6']
            ],
            rollingImgs = [],
            faces = [],i,
            gravity = 0.2,
            bounceFactor = 0.5,
            UPDATE_INTERVAL = 1000/20,
            RUN_DURATION = 4000;

        $scope.speed            = 1;
        $scope.skipani          = false;
        $scope.runs             = 0;
        $scope.updateCount      = 0;
        $scope.numRepetitions   = 1;
        $scope.numDice          = 1;
        $scope.resultsPerThrow  = [];
        $scope.diceValues       = [];

        $scope.stopRoll         = false;
        $scope.running          = false;
        $scope.diceChanged      = true;
        $scope.orderedList      = false;
        $scope.unorderedList    = false;
        $scope.doCount          = false;
        $scope.doSum            = false;
        $scope.preserveResults  = false;

        //establish ribbon options
        var riPreserve      = toolMenuService.newItem.toggle('Preserve Results', function() { $scope.preserveResults = !$scope.preserveResults; }, {cssClass:'mt-probs-preserve', showName: true}, function() { return $scope.preserveResults; });
        var riUnorderedList = toolMenuService.newItem.toggle('Unordered List', function() { $scope.unorderedList = !$scope.unorderedList; }, {}, function() { return $scope.unorderedList; });
        var riOrderedList   = toolMenuService.newItem.toggle('Ordered List', function() { $scope.orderedList = !$scope.orderedList; }, {}, function() { return $scope.orderedList; });
        var riCount         = toolMenuService.newItem.toggle('Count',  function() { $scope.doCount = !$scope.doCount; }, {}, function() { return $scope.doCount; });
        var riSum           = toolMenuService.newItem.toggle('Sum',  function() { $scope.doSum = !$scope.doSum; }, {}, function() { return $scope.doSum; });

        var riDiceTableOpts = [riUnorderedList, riOrderedList, riCount, riSum, riPreserve];

        //called by link function to initialize
        $scope.begin = function(){
            $scope.ctx = $scope.canvas.getContext('2d');
            $scope.canvas.height = 300;
            $scope.canvas.width = 300;
            //preload the images now, so we don't have to during animation
            rollingImgsUrls.forEach(function(faceArray){
                var faceImages = [];
                faceArray.forEach(function(view){
                    var img = new Image(32, 32);
                    img.src = $scope.probabilityService.getImageURL(view);
                    faceImages.push(img);
                });
                rollingImgs.push(faceImages);

                //0 indexed face is the unadulterated display face
                var face = new Image(32, 32);
                face.src = $scope.probabilityService.getImageURL(faceArray[0]);
                faces.push(face);
            });
            $scope.diceValues.push( new Die(1) );
            $scope.ribbonProps.tableOpts = riDiceTableOpts;
        };

        //called when tool window is closed
        $scope.$on('$destroy', function() {
            $scope.resetTool();
        });

        ///////////////////////
        //  User Controls    //
        ///////////////////////

        $scope.run = function(){
            $scope.preserveEnabled = true;

            if(!$scope.preserveResults){
                $scope.runs = 0;
                $scope.probabilityService.clearTable();
            }

            $scope.diceValues.forEach(function(die){
                $scope.probabilityService.addAttribute('Die '+ die.id, mt.stats.STATS_FIELD_TYPE_NUMERIC);
            });
            $scope.case = $scope.probabilityService.getCaseByIndex(1);
            $scope.repsRemaining = $scope.numRepetitions;
            $scope.dice();
        };

        $scope.dice = function(){
            var speed = ( $scope.speed || 1 );
            function clearCanvas() {
                $scope.ctx.clearRect(0, 0, $scope.canvas.width, $scope.canvas.height);
            }

            function update() {
                $scope.updateCount++;
                clearCanvas();
                for(var i =0;i<$scope.diceArray.length;i++){
                    $scope.diceArray[i].draw($scope.diceArray[i]);
                    $scope.diceArray[i].y += $scope.diceArray[i].vy;
                    $scope.diceArray[i].vy += gravity;
                    if($scope.diceArray[i].y + $scope.diceArray[i].height > $scope.canvas.height) {
                        $scope.diceArray[i].y = $scope.canvas.height - $scope.diceArray[i].height;
                        $scope.diceArray[i].vy *= -bounceFactor;
                    }
                }
            }

            $scope.runs++;
            if($scope.runs>1){
                $scope.case = $scope.probabilityService.addNewCase();
            }

            $scope.setDice($scope.drawFunc);

            $scope.diceChanged = false;

            if($scope.timer){
                $timeout.cancel($scope.timer);
                $scope.timer = undefined;
            }

            if($scope.skipani){
                $scope.stopRoll = true;
                clearCanvas();
                $scope.diceArray.forEach(function(die){
                    $scope.generateAndPublishResult(die);
                    $scope.ctx.drawImage(die.image, die.x, die.y);
                });
                $scope.stop();
            }else{
                if(!$scope.running){
                    $scope.running = true;
                    $scope.updateCount = 0;
                    $scope.updates = $interval(update, UPDATE_INTERVAL/speed);
                }else{
                    $scope.stop();
                    clearCanvas();
                }

                $timeout(function(){
                    $scope.stopRoll = true;
                }, (RUN_DURATION/2)/speed );

                $scope.timer = $timeout($scope.stop,RUN_DURATION/speed);
            }
        };

        $scope.numDiceChanged = function(){
            $scope.diceChanged = true;

            if($scope.diceValues[0] && !$scope.diceValues[0].tracked){
                $scope.diceValues[0].tracked = true;
            }

            if ($scope.numDice > $scope.diceValues.length) {
                var dieNumber = $scope.diceValues.length;
                while ($scope.numDice > $scope.diceValues.length) {
                    dieNumber++;
                    $scope.diceValues.push(new Die(dieNumber));
                }
            } else if ($scope.numDice < $scope.diceValues.length) {
                $scope.diceValues.length = $scope.numDice;
            }
        };

        //////////////////////////
        //      Watchers        //
        //////////////////////////

        $scope.$watch('numDice + orderedList + unorderedList + doSum + doCount',function(){
            $scope.disallowPreservation();
        });

        $scope.$watch('diceValues',function(){
            $scope.disallowPreservation();
        },true);

        $scope.$watch('speed', function() {
            $scope.skipani = false;
            if($scope.speed === 32) {
                $scope.skipani = true;
            }
        });

        $scope.disallowPreservation = function(){
            $scope.preserveResults  = false;
            $scope.preserveEnabled = false;
        };

        ///////////////////////
        //  Dice Behavior    //
        ///////////////////////

        $scope.stop = function(){
            if($scope.case) {
                $scope.probabilityService.addDiceTraits($scope.case.index, $scope.resultsPerThrow, $scope.orderedList,
                                                        $scope.unorderedList,
                                                        $scope.doCount,
                                                        $scope.diceArray,
                                                        $scope.doSum);
            }
            $scope.resultsPerThrow = [];
            $scope.repsRemaining--;
            $scope.running = false;
            if(!$scope.skipani){
                $interval.cancel($scope.updates);
                $scope.updates = undefined;
            }
            if($scope.repsRemaining>0){
                $scope.dice();
            }else{
                $scope.speed = 1;
                $scope.repsRemaining = $scope.numRepetitions;
            }
        };

        $scope.generateAndPublishResult = function(die){
            die.stopped = true;
            var image = new Image(32, 32),
                resultIndex = Math.floor(Math.random() * die.faces.length);

            die.result = die.faces[resultIndex];
            die.name = die.result;
            $scope.resultsPerThrow.push( die.result );
            image = faces[ die.faces[resultIndex]-1 ];

            die.image = image;
            $scope.probabilityService.addDataPoint($scope.case.index, 'Die '+die.id, die.result);
        };

        $scope.drawFunc = function(die) {
            if(!$scope.stopRoll){//we're looping through die faces
                var image = new Image(32, 32),
                    faceImages = [];
                die.faces.forEach(function(face){
                    faceImages = $.merge(faceImages,  rollingImgs[face-1] );
                });
                die.index = $scope.getDieAnimationImage(die.direction,die.index,faceImages);
                image = faceImages[die.index];
                $scope.ctx.drawImage(image, die.x, die.y);
                die.image = image;
            }else{
                if(!die.stopped) {//we're choosing a face to land on
                    $scope.generateAndPublishResult(die);
                }
                $scope.ctx.drawImage(die.image, die.x, die.y);
            }
        };

        $scope.setDice = function(pdrawFunc){
            $scope.stopRoll = false;
            $scope.diceArray = [];
            for(i=0;i<$scope.diceValues.length;i++){
                var die = {
                    x: ($scope.canvas.width/10)*i + 15,
                    y: Math.floor(Math.random()*$scope.numDice),
                    height:32,
                    stopped:false,
                    index:i,
                    faces:$scope.diceValues[i].faces,
                    id:$scope.diceValues[i].id,
                    direction:i,
                    image:null,
                    vx: 0,
                    vy: Math.floor(Math.random()*$scope.numDice),
                    draw: pdrawFunc
                };
                $scope.diceArray.push(die);
            }
        };

        $scope.getDieAnimationImage =  function(directionInt,index,faces){
            if($scope.updateCount%6===0){
                if(angular.isNumber(directionInt) && (directionInt % 2 === 0)){
                    return ( index === 0 ) ? faces.length-1 : index-1;
                }else{//spin other direction
                    return ( index === faces.length-1 ) ? 0 : index+1;
                }
            }else{
                return index;
            }
        };

        var Die = function(id){
            this.id = id;
            this.name = id;
            this.value = id;
            this.faces =[ 1, 2, 3, 4, 5, 6 ];
            this.tracked = false;
        };

        //////////////////
        //  Utilities   //
        //////////////////

        $scope.resetTool = function(){
            $scope.running       = false;
            $scope.numRepetitions = 1;
            $scope.numDice       = 1;
            $scope.diceChanged   = true;
            $scope.diceValues    = [];

            $scope.orderedList      = false;
            $scope.unorderedList    = false;
            $scope.doCount          = false;
            $scope.doSum            = false;
            $scope.resultsPerThrow  = [];

            rollingImgs = [];
            faces = [];
            $scope.diceArray = [];
            $scope.repsRemaining = 0;
            $scope.runs = 0;
        };
    });
})(window.mt.stats);

/**
 * Created by Oakley Hall on 7/1/14.
 */
(function () {
    'use strict';

    angular.module('mtStats').controller('MarbleCtrl', function ($scope,$interval,$timeout,toolMenuService){

        var ctx ,
            BALL_RADIUS = 15,
            bounceFactor = 0.1,
            selections=0,
            updates,
            UPDATE_INTERVAL = 1000/20,
            RUN_DURATION = 4000,
            originalMarbleData;

        $scope.speed                = 1;
        $scope.skipani              = false;
        $scope.runs                 = 0;
        $scope.balls                = [];
        $scope.repsRemaining        = 0;
        $scope.MAXDIFFBALLS         = 10;
        $scope.numDraw              = 1;
        $scope.numRepetitions       = 1;
        $scope.running              = false;
        $scope.numBallsCreated      = 0;
        $scope.totalMarbles         = 0;
        $scope.binnedBalls          = [];
        $scope.replacement          = 'draw';

        $scope.orderedList      = false;
        $scope.unorderedList    = false;
        $scope.doCount          = false;

        $scope.preserveResults  = false;

        //establish ribbon options
        var riReplaceDraw       = toolMenuService.newItem.toggle('Replace every draw', function() { $scope.replacement = 'draw'; }, {}, function() { return $scope.replacement === 'draw'; });
        var riReplaceTrial      = toolMenuService.newItem.toggle('Replace every trial', function() { $scope.replacement = 'trial'; }, {}, function() { return $scope.replacement === 'trial'; });
        var riReplaceExperiment = toolMenuService.newItem.toggle('No replacement', function() { $scope.replacement = 'experiment'; }, {}, function() { return $scope.replacement === 'experiment'; });
        var riPreserve          = toolMenuService.newItem.toggle('Preserve Results', function() { $scope.preserveResults = !$scope.preserveResults; }, {cssClass:'mt-probs-preserve', showName: true}, function() { return $scope.preserveResults; });
        var riUnorderedList     = toolMenuService.newItem.toggle('Unordered List', function() { $scope.unorderedList = !$scope.unorderedList; }, {}, function() { return $scope.unorderedList; });
        var riOrderedList       = toolMenuService.newItem.toggle('Ordered List', function() { $scope.orderedList = !$scope.orderedList; }, {}, function() { return $scope.orderedList; });
        var riCount             = toolMenuService.newItem.toggle('Count',  function() { $scope.doCount = !$scope.doCount; }, {}, function() { return $scope.doCount; });

        var riMarbleTableOpts   = [riUnorderedList, riOrderedList, riCount, riPreserve];
        var riMarbleReplaceOpts = [riReplaceExperiment, riReplaceDraw, riReplaceTrial];

        //called by link function to initialize
        $scope.begin = function(){
            if(_.isUndefined(ctx)){
                ctx = $scope.canvas.getContext('2d');
                // $scope.canvas.height = 300;
                // $scope.canvas.width =  300;
            }
            $scope.setDefaultBalls();
            $scope.resetMarbles();
            $scope.ribbonProps.tableOpts = riMarbleTableOpts;
            $scope.ribbonProps.replaceOpts = riMarbleReplaceOpts;
        };

        //called when tool window is closed
        $scope.$on('$destroy', function() {
            $scope.resetTool();
        });

        //////////////////////////
        //     User Functions   //
        //////////////////////////

        $scope.run = function(){
            $scope.preserveEnabled = true;
            if(!$scope.preserveResults){
                $scope.runs = 0;
                $scope.probabilityService.clearTable();
            }

            $scope.running = true;
            $scope.repsRemaining = $scope.numRepetitions;
            saveMarbleChanges();
            $scope.runMarbleAni();
        };

        $scope.addColor = function(){
            var colorObj = $scope.probabilityService.getColorFromPalette();
            $scope.colorGroups.push(new ColorGroup(colorObj.name, colorObj.color));
            $scope.colorGroupCount++;
        };

        $scope.removeItem = function(){
            var lastColor = $scope.colorGroups.length - 1;
            $scope.colorGroups.splice(lastColor, 1);
            $scope.colorGroupCount--;
        };

        $scope.choose = function(){
            var ballsLeftToChoose = $scope.numDraw,
                chosenIndexes = [],
                marblesThisRun = [];

            $scope.runs++;

            if($scope.runs===1){
                for(var i=0;i<$scope.numDraw;i++){
                    $scope.probabilityService.addAttribute('Ball '+(i+1), mt.stats.STATS_FIELD_TYPE_CATEGORICAL);
                }
                $scope.case = $scope.probabilityService.getCaseByIndex(1);
            }else{
                $scope.case = $scope.probabilityService.addNewCase();
            }

            while(ballsLeftToChoose > 0 && $scope.totalMarbles > 0){
                ballsLeftToChoose--;
                var ballIndex = Math.floor(Math.random() * $scope.balls.length),
                    selectedBall = $scope.balls[ ballIndex ];
                chosenIndexes.push(ballIndex);
                marblesThisRun.push(selectedBall);
                $scope.binnedBalls.push(new ColorGroup('', selectedBall.color ) );
                if($scope.case){
                    $scope.probabilityService.addDataPoint($scope.case.index, 'Ball '+( $scope.numDraw - ballsLeftToChoose ), selectedBall.name.toString());
                }
                selectedBall.radius = 0;

                $scope.removeMarbleByIndex(ballIndex);
                //no draw replacement so remove
                if($scope.replacement === 'draw'){
                    $scope.resetMarbles(true);
                }

            }
            if($scope.case){
                $scope.probabilityService.addGenericCalculatedTraits($scope.case.index,marblesThisRun, $scope.orderedList,
                                                                                    $scope.unorderedList,
                                                                                    $scope.doCount,
                                                                                    $scope.colorGroups);
            }

            $scope.resetMarbles($scope.replacement === 'trial');
        };

        $scope.stop = function(){
            $scope.choose();

            $interval.cancel(updates);
            $scope.resetMarbles();

            if($scope.repsRemaining>0){
                $scope.runMarbleAni();
            }else{
                $scope.experimentComplete();
            }
        };

        $scope.clearBalls = function(){
            $scope.binnedBalls = [];
        };

        $scope.colorChange = function(){
            $scope.disallowPreservation();
        };

        //////////////////////////
        //      Watchers        //
        //////////////////////////

        $scope.$watch('numDraw + replacement + orderedList + unorderedList + doCount',function(){
            $scope.disallowPreservation();
        });

        $scope.$watch('colorGroups', function () {
            $scope.totalMarbles = 0;
            $scope.colorGroups.forEach(function(group){
                $scope.totalMarbles += group.number;

            });
            if(!$scope.running){
                saveMarbleChanges();
            }
            $scope.resetMarbles();
        },true);

        $scope.$watch('colorGroupCount', function () {
            if($scope.colorGroupCount>$scope.MAXDIFFBALLS){
                $scope.colorGroupCount=$scope.MAXDIFFBALLS;
            }

            if($scope.colorGroupCount<1){
                $scope.colorGroupCount = 1;
            }

            while($scope.colorGroupCount > $scope.colorGroups.length){
                var colorObj = $scope.probabilityService.getColorFromPalette();
                $scope.colorGroups.push(new ColorGroup(colorObj.name, colorObj.color));
            }

            while($scope.colorGroupCount < $scope.colorGroups.length){
                $scope.colorGroups.splice($scope.colorGroups.length-1, 1);
            }
            $scope.resetMarbles();
        });

        $scope.$watch('numDraw', function () {
            $scope.disallowPreservation();

            if($scope.numDraw > $scope.totalMarbles){
                $scope.numDraw = $scope.totalMarbles;
            }
        });

        $scope.$watch('speed', function() {
            $scope.skipani = false;
            if($scope.speed === 32) {
                $scope.skipani = true;
            }
        });

        $scope.disallowPreservation = function(){
            $scope.preserveResults  = false;
            $scope.preserveEnabled = false;
        };

        //////////////////////////
        //   Marble Behavior    //
        //////////////////////////

        var saveMarbleChanges = function(){
            originalMarbleData = angular.copy($scope.colorGroups);
        };

        $scope.resetMarbles  = function(doReplaceDrawn){
            clearCanvas();
            if(doReplaceDrawn){
                $scope.colorGroups = angular.copy(originalMarbleData);
            }
            $scope.createMarblesFromGroups($scope.colorGroups);
            drawAllMarbles();
        };

        $scope.experimentComplete = function(){
            $scope.resetMarbles();
            $scope.running = false;
            $scope.speed = 1;
            if($scope.replacement === 'experiment'){//if experiment replacement, reset all
                $scope.resetMarbles(false);
            }
            selections = 0;
        };

        $scope.removeMarbleByIndex = function(index){
            $scope.totalMarbles--;
            $scope.colorGroups.forEach(function(group){
                if( $scope.balls[index].name === group.name ){
                    group.number--;
                }
            });
            $scope.balls.splice(index, 1);
            drawAllMarbles();
            // $scope.$apply();
        };

        $scope.createMarblesFromGroups = function(colorGroups){
            var i;
            $scope.balls = [];
            $scope.numBallsCreated = 0;
            colorGroups.forEach(function(group){
                for(i=0;i<group.number;i++){
                    $scope.balls.push( createBall( group.color, group.name ) );
                }
            });
            $scope.totalMarbles = $scope.balls.length;
        };

        $scope.setDefaultBalls = function(){//three defaults
            $scope.colorGroups = [];
            var numInitMarbles = 3;

            while(numInitMarbles>0){
                var colorObj = $scope.probabilityService.getColorFromPalette();
                $scope.colorGroups.push(new ColorGroup(colorObj.name, colorObj.color));
                numInitMarbles--;
            }
            $scope.colorGroupCount = $scope.colorGroups.length;
        };

        $scope.runMarbleAni = function(){
            if($scope.totalMarbles <= 0){
                $scope.experimentComplete();
                return;
            }

            var speed = ($scope.speed || 1);
            selections++;
            $scope.repsRemaining--;

            if($scope.skipani){
                $scope.stop();
            }else{
                $( '#marblejar' ).effect( 'shake' );
                $timeout(function(){//pause a beat before releasing balls
                    $scope.running = true;
                    $scope.$watch('speed', function(newSpeed){ speed = newSpeed; });
                    updates = $interval($scope.update, UPDATE_INTERVAL/speed);
                },500/speed);
                $timeout($scope.stop, RUN_DURATION/speed);
            }
        };

        var drawAllMarbles = function(){
            for(var i =0;i<$scope.balls.length;i++) {
                $scope.balls[i].draw();
            }
        };

        $scope.update = function() {
            clearCanvas();
            if($scope.balls){
                for(var i =0;i<$scope.balls.length;i++){
                    $scope.balls[i].draw();
                    if( $scope.balls[i].x<0 || $scope.balls[i].x>$scope.canvas.width){
                        $scope.balls[i].vx *= -bounceFactor;
                        $scope.balls[i].dx=-$scope.balls[i].dx;
                    }

                    if( $scope.balls[i].y<0 || $scope.balls[i].y>$scope.canvas.height){
                        $scope.balls[i].vy *= -bounceFactor;
                        $scope.balls[i].dy=-$scope.balls[i].dy;
                    }
                    $scope.balls[i].x+=$scope.balls[i].dx;
                    $scope.balls[i].y+=$scope.balls[i].dy;
                }
            }
        };

        var drawFunc = function() {
            if(ctx){
                // Here, we'll first begin drawing the path and then use the arc() function to draw the circle. The arc function accepts 6 parameters, x position, y position, radius, start angle, end angle and a boolean for anti-clockwise direction.
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);

                //createRadialGradient(x0, y0, r0, x1, y1, r1);
                var radialGradient = ctx.createRadialGradient(this.x+2, this.y+2, BALL_RADIUS, this.x+2, this.y+2, 1);
                radialGradient.addColorStop(1,'#fff' );
                radialGradient.addColorStop(0, this.color);
                ctx.fillStyle = radialGradient;
                ctx.fill();
                ctx.closePath();
            }
        };

        var ballInitPos = function(numballs,width){
            var padding=10, row = 1, loc = {},
                ballsInRow = ballsPerRow(30,width,padding);

            for(var i = 0;i<numballs;i++){
                if( i >= ballsInRow * row ){
                    row++;
                }
            }
            loc.x = padding + ( numballs-( ballsInRow * (row-1)  ) ) * 30;
            loc.y = padding + 30 * row;
            return loc;
        };

        var createBall = function(color,name){
            $scope.numBallsCreated++;
            var x = ballInitPos($scope.numBallsCreated,$scope.canvas.width).x,
                y = ballInitPos($scope.numBallsCreated,$scope.canvas.width).y;
            return {
                x: x,
                y: y,
                initialX: x,
                initialY: y,
                radius: BALL_RADIUS,
                color: color,
                name: name,
                vx: Math.floor(Math.random()*10),
                vy: Math.floor(Math.random()*10),
                dx: Math.floor(Math.random()*10),
                dy: Math.floor(Math.random()*10),
                draw: drawFunc
            };
        };

        //////////////////////////
        //  Utility Functions   //
        //////////////////////////

        $scope.resetTool = function(){
            $scope.runs = 0;
            selections = 0;
            originalMarbleData = undefined;

            $scope.MAXDIFFBALLS         = 10;
            $scope.repsRemaining        = 0;
            $scope.numDraw              = 1;
            $scope.numRepetitions        = 1;
            $scope.running              = false;
            $scope.numBallsCreated      = 0;
            $scope.totalMarbles         = 0;
            $scope.binnedBalls          = [];
            $scope.balls                = [];
            $scope.replacement          = 'draw';

            $scope.orderedList      = false;
            $scope.unorderedList    = false;
            $scope.doCount          = false;
        };

        var clearCanvas = function() {
            if(ctx){
                ctx.clearRect(0, 0, $scope.canvas.width, $scope.canvas.height);
            }
        };

        var getMarbleGradient = function(color){
            return 'background-image:-webkit-radial-gradient(55% 55%, circle farthest-side,#FFF,'+color+' 100%)';
        };

        var ballsPerRow = function(ballwidth,canvasWidth,padding){
            return Math.floor( ( canvasWidth- ( 2 * padding ) )/ballwidth );
        };

        //////////////////////////
        //      Classes         //
        //////////////////////////

        var ColorGroup = function(name,color){
            this.name = name;
            this.color = color;
            this.number = 1;
            this.gradient = getMarbleGradient(color);
        };

    });
})(window.mt.stats);

(function (ns) {
    'use strict';

    var StatsProbabilityRibbonCtrl = [
        '$scope', 'toolMenuService',
        function (
            $scope,
            toolMenuService
            ) {

            var riTableOptionsHeader = 'Calculate';
            var riReplaceOptionsHeader = 'Replace Results';

            var tableOpts = toolMenuService.newItem.popover('Record', [$scope.ribbonProperties.tableOpts], {cssClass:'mt-probs-table-opts', showName: true});
            var replacementOpts = toolMenuService.newItem.popover('Replace', [$scope.ribbonProperties.replaceOpts], {isVisible: function(){ return $scope.activeSim === 'cards' || $scope.activeSim === 'marbles'; }, cssClass:'mt-probs-replace-opts', showName: true});

            // SELECTION //
            var riSimCb = function(input) {
                var newInput = input.toLowerCase();
                $scope.activeSim = newInput;
            };

            var riSimGet = function() {
                return 'Simulators';
            };

            var riSimList = [
                {name: 'Cards'},
                {name: 'Coins'},
                {name: 'Dice'},
                {name: 'Marbles'},
                {name: 'Spinner'}
            ];

            var riProbabilitySamplers = toolMenuService.newItem.option('Simulators', riSimCb, {}, riSimGet, riSimList);

            $scope.$watch(function() { return $scope.ribbonProperties.tableOpts; }, function(newOpts){
                tableOpts.popover[0] = newOpts;
                tableOpts.popover[0].splice(0, 0, riTableOptionsHeader);
            });

            $scope.$watch(function() { return $scope.ribbonProperties.replaceOpts; }, function(newOpts){
                replacementOpts.popover[0] = newOpts;
                replacementOpts.popover[0].splice(0, 0, riReplaceOptionsHeader);
            });

            var ribbon = {
                toolId: $scope.toolId,
                items: {
                    left: [riProbabilitySamplers],
                    center: [],
                    right: [tableOpts, replacementOpts]
                }
            };

            this.register = function() {
                toolMenuService.setToolMenu($scope.toolId, ribbon, {containerApi: $scope.containerApi});
            };
    }];

    angular.module('mtStats').controller('mtStatsProbabilityRibbonCtrl', StatsProbabilityRibbonCtrl);

})(window.mt.stats);

/**
 * Created by Oakley Hall on 7/1/14.
 */
(function () {
    'use strict';

    angular.module('mtStats').controller('SpinCtrl', function ($scope,toolMenuService) {
        $scope.MAXNUMSLICES = 10;

        var arcGroup,
            SPINDURATION = 5000,//ms
            NUMROTATIONS = 25,
            resultsPerRun = [],
            width = 225,height = 321,
            radius = Math.min(width, height) / 2,
            path,text,arc,svg;

        $scope.speed            = 1;
        $scope.skipani          = false;
        $scope.runs             = 0;
        $scope.spinsLeftThisRun = 0;
        $scope.angle            = 0;
        $scope.slices           = [];
        $scope.numSlices        = $scope.slices.length;
        $scope.wheelState       = 'reset';
        $scope.numRepetitions   = 1;
        $scope.numSpins         = 1;
        $scope.running          = false;
        $scope.sumError         = false;

        $scope.orderedList      = false;
        $scope.unorderedList    = false;
        $scope.doCount          = false;

        $scope.preserveResults  = false;

        //establish ribbon options
        var riPreserve           = toolMenuService.newItem.toggle('Preserve Results', function() { $scope.preserveResults = !$scope.preserveResults; }, {cssClass:'mt-probs-preserve', showName: true}, function() { return $scope.preserveResults; });
        var riUnorderedList      = toolMenuService.newItem.toggle('Unordered List', function() { $scope.unorderedList = !$scope.unorderedList; }, {}, function() { return $scope.unorderedList; });
        var riOrderedList        = toolMenuService.newItem.toggle('Ordered List', function() { $scope.orderedList = !$scope.orderedList; }, {}, function() { return $scope.orderedList; });
        var riCount              = toolMenuService.newItem.toggle('Count',  function() { $scope.doCount = !$scope.doCount; }, {}, function() { return $scope.doCount; });

        var riSpinnerTableOpts   = [riUnorderedList, riOrderedList, riCount, riPreserve];

        //called by link function to initialize
        $scope.begin = function(wheelElem){
            if(_.isUndefined(arc)){
                arc = d3.svg.arc()
                    .outerRadius(radius - 10)
                    .innerRadius(0);

                $scope.pie = d3.layout.pie()
                    .sort(null)
                    .value(function(d) { return d.value; });

                svg = d3.select(wheelElem).append('svg')
                    .attr('width', width)
                    .attr('height', height);

                svg.append('svg:image')
                    .attr('width', width)
                    .attr('height', height)
                    .attr('xlink:href', $scope.probabilityService.getImageURL('spinback') );

                $scope.wheelGroup = svg.append('g')
                    .attr('width', width)
                    .attr('height', height)
                    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
                    .append('g');
            }
            $scope.setDefaultValues();
            $scope.createSlices();
            $scope.ribbonProps.tableOpts = riSpinnerTableOpts;
        };

        //called when tool window is closed
        $scope.$on('$destroy', function() {
            $scope.resetTool();
        });

        ///////////////////////
        //  User Controls    //
        ///////////////////////

        $scope.run = function(){
            resultsPerRun = [];
            $scope.preserveEnabled = true;
            if(!$scope.preserveResults){
                $scope.runs = 0;
                $scope.probabilityService.clearTable();
            }
            $scope.running = true;
            $scope.repsRemaining = $scope.numRepetitions;
            $scope.spinsLeftThisRun = $scope.numSpins;
            $scope.repsRemaining--;
            $scope.runs++;
            $scope.cycle();
        };

        $scope.addSlice = function(){
            var colorObj = $scope.probabilityService.getColorFromPalette();
            var newPercent = 1;
            var sliceSum = 0;

            _.each($scope.slices, function(slice){
                sliceSum += slice.value;
            });

            if($scope.isTotal100()) {
                $scope.slices[0].value = $scope.slices[0].value-1;
                newPercent = 1;
            } else {
                newPercent = 100-sliceSum;
            }

            $scope.slices.push(new Slice(colorObj.name, colorObj.color, newPercent));
            $scope.numSlices++;
        };

        $scope.removeItem = function(){
            var lastSlice = $scope.slices.length - 1;
            var removedSlice = $scope.slices[lastSlice].value;
            $scope.slices.splice(lastSlice, 1);
            lastSlice = $scope.slices.length - 1;
            $scope.numSlices--;

            $scope.slices[lastSlice].value += removedSlice; 
        };

        $scope.changeSliceName = function(){
            $scope.createSlices();
        };

        $scope.changeSliceValue = function(index){
            if(index !== undefined) {
                $scope.slices[index].value = parseFloat($scope.slices[index].value);
            }

            if($scope.isTotal100()){
                path = path.data($scope.pie( $scope.slices )); // compute the new angles
                path.transition()
                    .duration(750)
                    .style('fill', function(d) { return d.data.color; })
                    .each(function(d) { $scope.pieVal(d); })
                    .attrTween('d', $scope.arcTween); // redraw the arcs
                text.data($scope.pie( $scope.slices ));
                text.transition().ease('elastic').duration(750)
                    .attr('transform', function(d) {return 'translate(' + arc.centroid(d) + ')'; })
                    .text(function(d) { return (d.data.value > 0) ? d.data.name : ''; });
            }
            $scope.createSlices();
        };

        $scope.isTotal100 = function(){
            var sliceSum = 0, i;
            for(i = 0 ;i<$scope.slices.length;i++){
                if( isNaN($scope.slices[i].value) ){
                    $scope.slices[i].value = 0;
                }
                sliceSum += $scope.slices[i].value;
            }

            $scope.sumError = ( sliceSum !== 100 );
            return ( sliceSum === 100 );
        };

        //////////////////
        //  Watchers    //
        //////////////////
        $scope.$watch('numSpins + orderedList + unorderedList + doCount',function(){
            $scope.disallowPreservation();
        });

        $scope.$watch('slices',function(){
            $scope.disallowPreservation();
            $scope.createSlices();
        },true);

        $scope.$watch('numSlices',function(){

            $scope.disallowPreservation();

            if($scope.numSlices>$scope.MAXNUMSLICES){
                $scope.numSlices=$scope.MAXNUMSLICES;
            }

            if($scope.numSlices<1){
                $scope.numSlices = 1;
            }

            $scope.createSlices();
        });
        
        $scope.$watch('speed', function() {
            $scope.skipani = false;
            if($scope.speed === 32) {
                $scope.skipani = true;
            }
        });

        $scope.disallowPreservation = function(){
            $scope.preserveResults  = false;
            $scope.preserveEnabled = false;
        };

        //////////////////////////
        //  Spinner Behavior    //
        //////////////////////////

        $scope.setPieEndAngle = function(slices){
            var totalSlicePercentage = 0;
            slices.forEach(function(slice){
                totalSlicePercentage += slice.value;
            });
            $scope.pie.startAngle( 0 );
            $scope.pie.endAngle( degreesToRadians( 360 * (totalSlicePercentage/100) ) );
        };

        $scope.createSlices = function(){
            $scope.isTotal100();

            if(arcGroup){
                arcGroup.remove();
            }

            arcGroup = $scope.wheelGroup.selectAll('.arc')
                .data($scope.pie( $scope.slices ))
                .enter().append('g')
                .attr('class', 'arc');

            path = arcGroup.append('path')
                .attr('d', arc)
                .style('fill', function(d) { return d.data.color; })
                .each(function(d) { $scope.pieVal(d); })
                .each(function(d) { this.current = d; });

            text = arcGroup.append('text')
                .attr('transform', function(d) { return 'translate(' + arc.centroid(d) + ')'; })
                .attr('dy', '.35em')
                .style('text-anchor', 'middle')
                .text(function(d) { return (d.data.value > 0) ? d.data.name : ''; });

            $scope.setPieEndAngle($scope.slices);
        };

        $scope.pieVal = function(pv){
            var slice = $scope.slices.filter(function( obj ) {
                return obj.name === pv.data.name;
            })[0];
            slice.startAngleDeg = radiansToDegrees(pv.startAngle);
            slice.endAngleDeg = radiansToDegrees(pv.endAngle);
        };

        var resetWheel = function(){
            $scope.wheelGroup.transition()
                .duration(250)
                .ease('cubic-in')
                .each('end', $scope.doSpin )
                .attrTween('transform', function() { return d3.interpolateString('rotate(-'+$scope.angle+')' , 'rotate(0)' );});
        };

        $scope.doSpin = function(){
            var resultDegree = Math.random() * 360,
                speed = ( $scope.speed || 1);
            $scope.angle = resultDegree * NUMROTATIONS * speed;

            if($scope.skipani){
                $scope.spinDone( $scope.angle % 360 );
                $scope.angle = 0;
                $scope.running = false;
            }else{
                $scope.wheelGroup.transition()
                    .delay(50)
                    .each('end', function(){ $scope.spinDone( $scope.angle % 360 ); } )
                    .duration(SPINDURATION/speed)
                    .attrTween('transform', function() { return d3.interpolateString('rotate(0)', 'rotate(-' + $scope.angle + ')');});
            }

        };

        $scope.cycle = function() {
            $scope.spinsLeftThisRun--;

            if($scope.runs===1){
                $scope.probabilityService.addAttribute(getAttributeName(), mt.stats.STATS_FIELD_TYPE_CATEGORICAL);
                $scope.case = $scope.probabilityService.getCaseByIndex(1);
            }else if( $scope.runs > 1 && $scope.numSpins - $scope.spinsLeftThisRun === 1 ){
                $scope.case = $scope.probabilityService.addNewCase();
            }

            if($scope.skipani) {
                $scope.doSpin();
            }else{
                if($scope.angle!==0){//reset the wheel to 0 for spin
                    resetWheel();
                }else{
                    $scope.doSpin();
                }
            }
        };

        $scope.spinDone = function(resultDeg){
            $scope.getResultSlice(resultDeg);
            if( $scope.repsRemaining > 0 || $scope.spinsLeftThisRun > 0 ){
                if($scope.spinsLeftThisRun <= 0 ){
                    $scope.probabilityService.addGenericCalculatedTraits($scope.case.index, resultsPerRun, $scope.orderedList,
                        $scope.unorderedList,
                        $scope.doCount,
                        $scope.slices);
                    $scope.runs++;
                    $scope.repsRemaining--;
                    $scope.spinsLeftThisRun = $scope.numSpins;
                    resultsPerRun = [];
                }
                $scope.cycle();
            }else{
                $scope.running = false;
                $scope.speed = 1;
                $scope.probabilityService.addGenericCalculatedTraits($scope.case.index, resultsPerRun, $scope.orderedList,
                    $scope.unorderedList,
                    $scope.doCount,
                    $scope.slices);

            }
        };

        $scope.getResultSlice = function(resultDeg){
            $scope.slices.some(
                function( slice ) {
                    if( slice.startAngleDeg < resultDeg && slice.endAngleDeg > resultDeg ){
                        $scope.probabilityService.addDataPoint( $scope.case.index, getAttributeName(), slice.name);
                        resultsPerRun.push(slice);
                        return true;
                    }
                }
            );

        };

        //////////////////
        //  Utilities   //
        //////////////////

        $scope.resetTool = function(){
            $scope.slices           = [];
            $scope.numSlices        = $scope.slices.length;
            $scope.wheelState       = 'reset';
            $scope.numRepetitions    = 1;
            $scope.numSpins         = 1;
            $scope.speed            = 1;
            $scope.running          = false;
            $scope.sumError         = false;

            $scope.orderedList      = false;
            $scope.unorderedList    = false;
            $scope.doCount          = false;
            $scope.spinsLeftThisRun = 0;
            $scope.repsRemaining = 0;
            $scope.runs = 0;
            resultsPerRun = [];
        };

        $scope.arcTween = function(a) {
            var i = d3.interpolate(this.current, a);
            this.current = i(0);
            return function(t) {
                return arc(i(t));
            };
        };

        var radiansToDegrees = function( rads ){
            return rads * (180/Math.PI);
        };

        var degreesToRadians = function(degrees) {
            return degrees * Math.PI / 180;
        };

        var getAttributeName = function(){
            return 'Spin '+ ($scope.numSpins - $scope.spinsLeftThisRun);
        };

        $scope.setDefaultValues = function(){
            $scope.slices = [];

            //incrementing though palette colors
            var colorObj = $scope.probabilityService.getColorFromPalette();
            $scope.slices.push(new Slice(colorObj.name, colorObj.color,33));

            colorObj = $scope.probabilityService.getColorFromPalette();
            $scope.slices.push(new Slice(colorObj.name, colorObj.color,33));

            colorObj = $scope.probabilityService.getColorFromPalette();
            $scope.slices.push(new Slice(colorObj.name, colorObj.color,34));

            $scope.numSlices = $scope.slices.length;
        };

        var Slice = function(name,color,value){
            this.name = name.toString();
            this.color = color;
            this.value = value;
        };

    });
})(window.mt.stats);

(function (ns) {
    'use strict';

    var StatsRibbonCtrl = [
        '$scope', '$timeout', 'statsDataService', 'toolMenuService',
        function (
                $scope,
                $timeout,
                statsDataService,
                toolMenuService
                ) {

        var riSeparator = toolMenuService.newItem.seperator();

        function getSelection(type) {
            var curSelection = $scope.selectionApi.getSelection();
            var selObj;
            if(curSelection !== undefined  && curSelection.type === type && curSelection.modelObject !== undefined) {
                selObj = curSelection.modelObject;
            }
            return selObj;
        }

        function getSelectedCase() {
            return getSelection(ns.STATS_CASE_TYPE);
        }

        function getSelectedAttr() {
            return getSelection(ns.STATS_HEADER_TYPE);
        }

        //TOOL RIBBON

        var riAttributeCb = function () {
            //check whether we have a header selected to see whether it is an insertAtIndex or an append
            var attIndex;
            var name = 'Attr ' + $scope.caseData.attributeHeaders.length;
            var curSelection = getSelectedAttr();
            if(curSelection !== undefined) {
                attIndex = $scope.caseData.getIndexFromAttr(curSelection);
            }

            $scope.$broadcast('addAttribute', name, ns.STATS_FIELD_TYPE_CATEGORICAL, attIndex);
            $scope.selectionApi.clear();
        };

        var riAddAttribute = toolMenuService.newItem.button('addAttribute', riAttributeCb, {cssClass: 'mt-ribbon-image-add-col'});

        var riCaseCb = function () {
            var caseIndex;
            var curSelection = getSelectedCase();
            if(curSelection !== undefined) {
                caseIndex = $scope.caseData.getIndexFromCase(curSelection);
            }


            $scope.$broadcast('addRow', caseIndex);
            $scope.selectionApi.clear();
        };

        var riAddCase = toolMenuService.newItem.button('addCase', riCaseCb, {cssClass: 'mt-ribbon-image-add-row'});

        var riPlotCb = function () {
            $scope.addGraph();
            $scope.update();
        };

        var riAddPlot = toolMenuService.newItem.button('+Plot', riPlotCb);

        var riSamplerCb = function () {
            $scope.launchSamplerTool();
            $scope.update();
        };

        var riAddSampler = toolMenuService.newItem.button('+Sampler', riSamplerCb);

        //ATTRIBUTE RIBBON

        var riAttributeLabelCb = function (attributeName) {
            var activeHeader = getSelectedAttr();
            if(activeHeader === undefined) {
                return;
            }
            var curName = activeHeader.display;
            var newName = attributeName.trim();
            if (newName !== curName) {
                var changeDesc = {
                    activeHeader: activeHeader,
                    oldName: curName,
                    newName: newName
                };
                $scope.$broadcast('renameAttribute', changeDesc);
            }
        };

        var riAttributeLabelGet = function() {
            var activeHeader = getSelectedAttr();
            if(activeHeader === undefined) {
                return;
            }
            return activeHeader.display;
        };

        var riAttributeLabel = toolMenuService.newItem.input('attribute-name', riAttributeLabelCb, {cssClass:'mt-ribbon-name-input', placeHolder: 'unlabeled', updateOnChange: false}, riAttributeLabelGet);

        //CASE RIBBON

        var riCaseNameGet = function() {
            var row = getSelectedCase();
            if(row === undefined) {
                return;
            }
            return 'Case ' + row.index;
        };

        var riCaseName = toolMenuService.newItem.label('Case', {}, riCaseNameGet);

        var riChangeData = toolMenuService.newItem.button('Data',
            function() {
                $scope.wizardApi.toggle(true);
            }, {}, function(){});

        var ribbon = {
            toolId: $scope.toolId,
            items: {
                left: [riChangeData],
                center: [],
                right: [riAddAttribute, riAddCase, toolMenuService.newItem.seperator(), riAddPlot, riAddSampler]
            }
        };

        //change type
        var riAttributeTypeCb = function(newType) {
            var activeHeader = getSelectedAttr();
            if(activeHeader === undefined) {
                return;
            }
            var curType = activeHeader.type;
            if (newType !== curType) {
                var changeDesc = {
                    activeHeader: activeHeader,
                    oldType: curType,
                    newType: newType
                };
                $scope.$broadcast('changeAttributeType', changeDesc);
            }
        };

        var riAttributeTypeGet = function() {
            var activeHeader = getSelectedAttr();
            if(activeHeader === undefined) {
                return;
            }
            return 'Type: ' + _.capitalize(activeHeader.type);
        };

        var riAttributeType = toolMenuService.newItem.option('Type',riAttributeTypeCb, {},
            riAttributeTypeGet, [{name: ns.STATS_FIELD_TYPE_CATEGORICAL}, {name: ns.STATS_FIELD_TYPE_NUMERIC}]
        );

        //sort
        var sortUp = 'Sort up';
        var sortDown = 'Sort down';
        function sortCases(sortUp) {
            var activeHeader = getSelectedAttr();
            if(activeHeader === undefined) {
                return;
            }
            var sorted = _.sortBy($scope.caseData.cases, function(c) {
                return c.attributes[activeHeader.display];
            });
            if(!sortUp) {
                sorted = sorted.reverse();
            }
            $scope.caseData.cases = sorted;
        }

        var riSortAttribute = toolMenuService.newItem.option('Sort',
            function(mode) {
                //apply
                if(mode === sortUp) {
                    sortCases(true);
                } else if(mode === sortDown) {
                    sortCases(false);
                }
            }, {},
            undefined,
            [{name: sortUp}, {name: sortDown}]
        );

        var attrRibbon = {
            items: {
                left: [toolMenuService.newItem.button('Delete', function () {
                        $scope.$broadcast('deleteAttribute');
                        $scope.selectionApi.clear();
                        $scope.update(false);
                    }, {cssClass: 'mt-ribbon-image-remove-col'}),
                    riSeparator, riAttributeLabel],
                center: [],
                right: [riSortAttribute, riAttributeType, riSeparator, riAddAttribute]
            }
        };

        var caseRibbon = {
            items: {
                left: [
                    toolMenuService.newItem.button('Delete', function () {
                        $scope.$broadcast('deleteRow');
                        $scope.selectionApi.clear();
                        $scope.update(false);
                    }, {cssClass: 'mt-ribbon-image-remove-row'}),
                    riSeparator, riCaseName],
                center: [],
                right: [riAddCase]
            }
        };

        this.register = function() {
            toolMenuService.setToolMenu($scope.toolId, ribbon, {containerApi: $scope.containerApi});
            toolMenuService.setToolMenu($scope.toolId, attrRibbon, {contextId: ns.STATS_HEADER_TYPE, selectionApi: $scope.selectionApi});
            toolMenuService.setToolMenu($scope.toolId, caseRibbon, {contextId: ns.STATS_CASE_TYPE, selectionApi: $scope.selectionApi});
        };
    }];

    angular.module('mtStats').controller('mtStatsRibbonCtrl', StatsRibbonCtrl);

})(window.mt.stats);

/**
 * Created by Oakley Hall on 7/1/14.
 */
(function () {
    'use strict';

    angular.module('mtStats').controller('SamplerMarbleCtrl', function ($scope,$interval,$timeout,ProbabilityService, eventingService){

        var ctx ,
            BALL_RADIUS = 15,
            bounceFactor = 0.1,runs = 0, selections=0,
            UPDATE_INTERVAL = 1000/20,
            RUN_DURATION = 4000,
            originalMarbleData;

        $scope.MAXDIFFBALLS         = 10;
        $scope.numDraw              = 1;
        $scope.numRepetitions        = 1;
        $scope.running              = false;
        $scope.numBallsCreated      = 0;
        $scope.totalMarbles         = 0;
        $scope.binnedBalls          = [];
        $scope.replacement          = 'experiment';

        $scope.orderedList      = false;
        $scope.unorderedList    = false;
        $scope.doCount          = false;

        $scope.preserveResults  = false;

        //called by link function to initialize
        $scope.begin = function(){
            if(_.isUndefined(ctx)){
                ctx = $scope.canvas.getContext('2d');
                // $scope.canvas.height = 150;
                // $scope.canvas.width =  300;
            }
            $scope.setDefaultBalls();
            eventingService.subscribe($scope.toolId, mt.stats.EVENT_PROB_TOOL_SOURCE, function(event) {
                $scope.probabilityService.setSourceCaseData(event.data);
                console.log('sampler got case data ', event.data);
                $scope.sourceCaseData = $scope.probabilityService.getSourceCaseData();
                $scope.caseData = angular.copy($scope.sourceCaseData);
                $scope.resetMarbles();
            });
        };

        //called when tool window is closed
        $scope.$on('$destroy', function() {
            $scope.resetTool();
        });

        //////////////////////////
        //     User Functions   //
        //////////////////////////

        $scope.run = function(){
            $scope.resetMarbles(true);
            $scope.preserveEnabled = true;
            if(!$scope.preserveResults){
                runs = 0;
                $scope.probabilityService.clearTable();
            }

            $scope.running = true;
            $scope.repsRemaining = $scope.numRepetitions;
            saveMarbleChanges();
            $scope.runMarbleAni();
        };

        $scope.choose = function(){
            var ballsLeftToChoose = $scope.numDraw,
                chosenIndexes = [],
                marblesThisRun = [];

            runs++;

            if(runs===1) {
                $scope.probabilityService.addAttribute('SourceIndex ', mt.stats.STATS_FIELD_TYPE_NUMERIC);
                $scope.probabilityService.addSourceAttributes();
            }

            while(ballsLeftToChoose > 0 && $scope.totalMarbles > 0){
                if(runs===1 && ballsLeftToChoose===$scope.numDraw) {
                    $scope.case = $scope.probabilityService.getCaseByIndex(1);
                }else{
                    $scope.case = $scope.probabilityService.addNewCase();
                }
                ballsLeftToChoose--;
                var ballIndex = Math.floor(Math.random() * $scope.balls.length),
                    selectedBall = $scope.balls[ ballIndex ];
                chosenIndexes.push(ballIndex);
                marblesThisRun.push(selectedBall);
                $scope.binnedBalls.push(new ColorGroup(selectedBall.name, selectedBall.color ) );
                if($scope.case){
                    $scope.probabilityService.addSourceCaseToResults(selectedBall.case, $scope.case);
                }
                selectedBall.radius = 0;

                $scope.removeMarbleByIndex(ballIndex);
            }

            $scope.resetMarbles(false);
        };

        $scope.stop = function(){
            $scope.choose();

            $interval.cancel($scope.updates);
            $scope.resetMarbles();

            if($scope.repsRemaining>0){
                $scope.runMarbleAni();
            }else{
                $scope.experimentComplete();
            }
        };

        $scope.clearBalls = function(){
            $scope.binnedBalls = [];
        };

        $scope.colorChange = function(){
            $scope.disallowPreservation();
        };

        //////////////////////////
        //      Watchers        //
        //////////////////////////

        $scope.$watch('numDraw + replacement + orderedList + unorderedList + doCount',function(){
            $scope.disallowPreservation();
        });

        $scope.disallowPreservation = function(){
            $scope.preserveResults  = false;
            $scope.preserveEnabled = false;
        };

        //////////////////////////
        //   Marble Behavior    //
        //////////////////////////

        var saveMarbleChanges = function(){
            originalMarbleData = angular.copy($scope.colorGroups);
        };

        $scope.resetMarbles  = function(doReplaceDrawn){
            clearCanvas();
            if(doReplaceDrawn){
                $scope.caseData = angular.copy($scope.sourceCaseData);
            }
            $scope.createMarblesFromCaseData($scope.caseData);
            drawAllMarbles();
        };

        $scope.experimentComplete = function(){
            $scope.resetMarbles();
            if($scope.replacement === 'experiment'){//if experiment replacement, reset all
                $scope.resetMarbles(false);
            }
            selections = 0;
            $scope.running = false;
            $scope.speed = 0;
        };

        $scope.removeMarbleByIndex = function(index){
            $scope.totalMarbles--;
            $scope.caseData.cases.splice(index,1);
            $scope.balls.splice(index, 1);
            drawAllMarbles();
            // $scope.$apply();
        };

        $scope.createMarblesFromCaseData = function(caseData){
            $scope.balls = [];
            $scope.numBallsCreated = 0;
            _(caseData.cases).each(function(c) {
                $scope.balls.push( createBall('grey', c) );
            });
            $scope.totalMarbles = $scope.balls.length;
        };

        $scope.setDefaultBalls = function(){//three defaults
            $scope.colorGroups = [];
            var numInitMarbles = 3;

            while(numInitMarbles>0){
                var colorObj = $scope.probabilityService.getColorFromPalette();
                $scope.colorGroups.push(new ColorGroup(colorObj.name, colorObj.color));
                numInitMarbles--;
            }
            $scope.colorGroupCount = $scope.colorGroups.length;
        };

        $scope.runMarbleAni = function(){
            if($scope.totalMarbles <= 0){
                $scope.experimentComplete();
                return;
            }
            var speed = ($scope.speed || 1);
            selections++;
            $scope.repsRemaining--;

            if($scope.skipani){
                $scope.stop();
            }else{
                $( '#marbleCanvas' ).effect( 'shake' );
                $timeout(function(){//pause a beat before releasing balls
                    $scope.running = true;
                    $scope.updates = $interval($scope.update, UPDATE_INTERVAL/speed);
                },500/speed);
                $timeout($scope.stop, RUN_DURATION/speed);
            }
        };

        var drawAllMarbles = function(){
            for(var i =0;i<$scope.balls.length;i++) {
                $scope.balls[i].draw();
            }
        };

        $scope.update = function() {
            clearCanvas();
            if($scope.balls){
                for(var i =0;i<$scope.balls.length;i++){
                    $scope.balls[i].draw();
                    if( $scope.balls[i].x<0 || $scope.balls[i].x>$scope.canvas.width){
                        $scope.balls[i].vx *= -bounceFactor;
                        $scope.balls[i].dx=-$scope.balls[i].dx;
                    }

                    if( $scope.balls[i].y<0 || $scope.balls[i].y>$scope.canvas.height){
                        $scope.balls[i].vy *= -bounceFactor;
                        $scope.balls[i].dy=-$scope.balls[i].dy;
                    }
                    $scope.balls[i].x+=$scope.balls[i].dx;
                    $scope.balls[i].y+=$scope.balls[i].dy;
                }
            }
        };

        var drawFunc = function() {
            if(ctx){
                // Here, we'll first begin drawing the path and then use the arc() function to draw the circle. The arc function accepts 6 parameters, x position, y position, radius, start angle, end angle and a boolean for anti-clockwise direction.
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);

                //createRadialGradient(x0, y0, r0, x1, y1, r1);
                var radialGradient = ctx.createRadialGradient(this.x+2, this.y+2, BALL_RADIUS, this.x+2, this.y+2, 1);
                radialGradient.addColorStop(1,'#fff' );
                radialGradient.addColorStop(0, this.color);
                ctx.fillStyle = radialGradient;
                ctx.fill();
                ctx.closePath();
                ctx.font='12px Arial';
                ctx.strokeText(this.name+'', this.x-7, this.y+4);
            }
        };

        var ballInitPos = function(numballs,width){
            var padding=30, row = 1, loc = {},
                ballsInRow = ballsPerRow(30,width,padding);

            for(var i = 0;i<numballs;i++){
                if( i >= ballsInRow * row ){
                    row++;
                }
            }
            loc.x = padding + ( numballs-( ballsInRow * (row-1)  ) ) * 30;
            loc.y = padding + 30 * row;
            return loc;
        };

        var createBall = function(color,kase){
            $scope.numBallsCreated++;
            var x = ballInitPos($scope.numBallsCreated,$scope.canvas.width).x,
                y = ballInitPos($scope.numBallsCreated,$scope.canvas.width).y;
            return {
                x: x,
                y: y,
                initialX: x,
                initialY: y,
                radius: BALL_RADIUS,
                color: color,
                name: kase.index,
                case: kase,
                vx: Math.floor(Math.random()*10),
                vy: Math.floor(Math.random()*10),
                dx: Math.floor(Math.random()*10),
                dy: Math.floor(Math.random()*10),
                draw: drawFunc
            };
        };

        //////////////////////////
        //  Utility Functions   //
        //////////////////////////

        $scope.resetTool = function(){
            runs = 0;
            selections = 0;
            originalMarbleData = undefined;

            $scope.MAXDIFFBALLS         = 10;
            $scope.repsRemaining        = 0;
            $scope.numDraw              = 1;
            $scope.numRepetitions        = 1;
            $scope.running              = false;
            $scope.numBallsCreated      = 0;
            $scope.totalMarbles         = 0;
            $scope.binnedBalls          = [];
            $scope.balls                = [];
            $scope.replacement          = 'experiment';

            $scope.orderedList      = false;
            $scope.unorderedList    = false;
            $scope.doCount          = false;
        };

        var clearCanvas = function() {
            if(ctx){
                ctx.clearRect(0, 0, $scope.canvas.width, $scope.canvas.height);
            }
        };

        var getMarbleGradient = function(color){
            return 'background-image:-webkit-radial-gradient(55% 55%, circle farthest-side,#FFF,'+color+' 100%)';
        };

        var ballsPerRow = function(ballwidth,canvasWidth,padding){
            return Math.floor( ( canvasWidth- ( 2 * padding ) )/ballwidth );
        };

        //////////////////////////
        //      Classes         //
        //////////////////////////

        var ColorGroup = function(name,color){
            this.name = name;
            this.color = color;
            this.number = 1;
            this.gradient = getMarbleGradient(color);
        };

    });
})(window.mt.stats);

(function (ns) {
    'use strict';

    angular.module('mtStats').controller('StatsToolCtrl', function ($controller, $scope, $timeout, statsDataService, eventingService, broadcastService, toolPersistorService, preconfiguredToolService, selectionApiFactory) {

        $scope.wizardActive = true;
        $scope.ready = false;
        $scope.showTable = true;
        $scope.showGraph = true;
        $scope.showXHat = false;
        $scope.showYHat = false;
        $scope.resizeHeaderMode = false;

        $scope.deleteRowMode = false;
        $scope.deleteAttributeMode = false;

        function setReady(isReady) {
            if (isReady) {
                //  $scope.resetGraph();
                $scope.update();
            }
            // } else {
            //     $scope.containerApi.name.value = '';
            // }

            $scope.ready = isReady;

            // unfortunately necessary to force render
            $timeout(angular.noop, 0, true);
        }

        $scope.update = function (xAttribute, dataAttribute, yAttribute) {
            //$scope.$broadcast('update', xAttribute, dataAttribute, yAttribute);
            var dataUpdateEvent = new mt.common.Event({
                xAttribute: xAttribute,
                dataAttribute: dataAttribute,
                yAttribute: yAttribute
            });
            dataUpdateEvent.type = mt.stats.EVENT_DATA_UPDATE;
            eventingService.publish(ns.TOPIC_STATS_NOTIFY_GRAPHS, dataUpdateEvent);
        };

        $scope.updateSelection = function () {
            var rerenderEvent = new mt.common.Event({});
            rerenderEvent.type = mt.stats.EVENT_RERENDER;
            rerenderEvent.sourceId = $scope.toolId;
            eventingService.publish(ns.TOPIC_STATS_NOTIFY_GRAPHS,rerenderEvent);
        };

        $scope.addGraph = function () {
            $scope.$broadcast('addGraph');
        };

        $scope.$on('rerender', function() {
            $timeout(angular.noop, 0, true);
        });

        //intialize empty table - should we remove linked tools
        $scope.init = function () {
            $scope.caseData = new mt.stats.CaseData();
            setReady(true);
        };
        $scope.init();


        $scope.wizardApi = {};
        $scope.wizardApi.backBtn = false;
        $scope.wizardApi.loadFileData = function(filename) {
            $scope.$broadcast('clearProbabilityTool');
            $scope.caseData = new mt.stats.CaseData();
            $scope.caseData.title = filename;
            $scope.containerApi.name.value = $scope.caseData.title;
            setReady(false);
            $scope.wizardApi.toggle(false);
            $scope.caseData.importFromFile('data/' + filename + '.json', function () {
                setReady(true);
                var exportEvent = new mt.common.Event($scope.caseData);
                _.each($scope.linkedGraphIds, function (graphId) {
                    exportEvent.sourceId = $scope.toolId;
                    eventingService.publishToSubscriber(mt.stats.EVENT_EXPORT_CASE_DATA_TO_STATS_GRAPH, exportEvent, graphId);
                });
            });
        };

        $scope.wizardApi.toggle = function(active, clearData) {
            if(active === undefined) {
                active = !$scope.wizardActive;
            }
            if(clearData === true) {
                $scope.$broadcast('clearProbabilityTool');
                $scope.init();
            }
            $scope.wizardActive = active;
            $scope.wizardApi.backBtn = true;
        };

        $scope.wizardApi.openWithProbabilityTool = function () {
            $scope.$broadcast('launchProbabilityTool');
            $scope.wizardApi.toggle(false);
        };

        $scope.launchSamplerTool = function () {
            //the event name below is not a type - this is just what grt chose to do
            $scope.$broadcast('launchProbabilityTool', true);
        };

        $scope.closeStatsTable = function () {
            _.each($scope.linkedGraphIds, function (graphId) {
                var removeEvent = new mt.common.Event();
                removeEvent.toolId = graphId;
                eventingService.publish(mt.common.EVENT_REMOVE_TOOL, removeEvent);
            });
        };

        $scope.getType = function () {
            return mt.common.TYPE_STATS;
        };


        $scope.serialize = function() {
            return $scope.caseData.serialize();
        };

        $scope.deserialize = function(data) {
            $scope.wizardApi.toggle(false);
            $scope.caseData.deserialize( data );
        };


        $scope.containerApi.registerClose($scope.closeStatsTable);

        toolPersistorService.registerTool($scope.toolId, mt.common.TYPE_STATS, $scope.containerApi, $scope.serialize, $scope.deserialize);

        //selection API - selection objects are col headers (Attrs) or row headers (case)
        $scope.selectionApi = selectionApiFactory.createApi(function() {
            //clear case and header selection
            $scope.caseData.select();
        });

        $scope.ribbon = $controller('mtStatsRibbonCtrl', {
                $scope: $scope
            });
        $scope.ribbon.register();
    });
})(window.mt.stats);

(function (ns) {
    'use strict';
    angular.module('mtStats').directive('mtDataSampler', function(){
        return{
            templateUrl: 'templates/mtDataSamplerTemplate.html',
            controller:'ProbsToolsParentCtrl',
            restrict: 'E',
            scope: {
                toolId: '=',
                containerApi: '='
            },
            link: function(scope) {
                scope.initSampler();
            }
        };
    });
})(window.mt.stats);

/**
 * Created by Oakley Hall on 6/16/14.
 */
(function (ns) {
    'use strict';
    angular.module('mtStats').directive('mtProbsCard', function(){
        return{
            scope: {
                probabilityService: '=',
                ribbonProps: '='
            },
            template:  '<div class="mt-probs-container">'+
                            '<h4 ng-if="outOfCards" >No cards left</h4>' +
                            '<div class="mt-probs-sim-container">'+
                                '<div class="mt-flip-container">' +
                                    '<div class="mt-flipper">' +
                                        '<div class="mt-front" img="{{back}}"></div>' +
                                        '<div class="mt-back" back-img img="{{card.image}}"></div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="mt-probs-sim-output">' +
                                    '<a class="pull-right mt-probs-clear-output" style="color: white; cursor: default;" ng-click="clearCards()">X</a>' +
                                    '<h4 class="mt-probs-text" ng-if="results.length === 0">No cards have been flipped yet!</h4>'+
                                    '<div class="mt-card" ng-repeat="card in results track by $index">' +
                                        '<img ng-src="{{card.image}}" class="mt-card-thumb">' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="mt-probs-sim-inputs">' +
                                '<div class="mt-probs-sim-trials">'+
                                    '<label>Draw: <input class="mt-single-input" min="0" max="52" type="number" ng-model="numDraw" ng-disabled="running" /> card<span ng-if="numDraw > 1">s</span></label>' +
                                    '<label>Do:   <input class="mt-single-input" min="0" max="100" type="number" ng-model="numRepetitions" ng-disabled="running" /> trial<span ng-if="numRepetitions > 1">s</span></label>' +
                                    '<input  type="button" class="btn btn-small" ng-click="getNewDeck()" value="New Deck" ng-if="outOfCards" /> ' +
                                '</div>'+
                                '<div class="mt-probs-sim-start">'+
                                    '<button class="btn btn-large" ng-class="{\'btn-success\': !running}" ng-model="skipAnimations" ng-disabled="speed === 32">'+
                                        '<div class="mt-probs-sim-go-button" ng-if="!running" ng-click="run()" >Go!</div>'+
                                        '<div class="mt-probs-sim-go-button" ng-show="running && speed === 1" ng-click="speed = 8"> >> </div>'+
                                        '<div class="mt-probs-sim-go-button" ng-show="speed === 8 || speed === 32" ng-click="speed = 32"> >>| </div>'+
                                    '</button>'+
                                '</div>'+
                            '</div>' +
                        '</div>',
            controller:'CardCtrl',
            restrict: 'E',
            link: function link(scope, element) {
                scope.begin();
            }
        };
    });
})(window.mt.stats);

/**
 * Created by Oakley Hall on 6/16/14.
 */
(function (ns) {
    'use strict';
    angular.module('mtStats').directive('mtProbsCoin', function($animate){
        return{
            scope: {
                probabilityService: '=',
                ribbonProps: '='
            },
            template:  '<div class="mt-probs-container">'+
                            '<div class="mt-probs-sim-container">'+
                                '<div class="mt-coin" ng-repeat="coin in coins" id="{{coin.id}}" >' +
                                    '<img style="height: 100%; width: 100%" ng-src="{{coin.image}}"/>' +
                                '</div>' +
                                '<div class="mt-probs-config-container">'+
                                    '<div class="mt-probs-config">'+
                                        '<h5 class="mt-probs-config-header">Coin Settings</h5>'+
                                        '<div class="mt-probs-config-body">'+
                                            '<h4>Coin Weights:</h4>'+
                                            '<label>Heads: <div class="input-append"><input class="mt-single-input" min="0"  max="100" type="number" ng-model="tailsWeight" /><span class="add-on">%</span></div></label>'+
                                            '<label>Tails: <div class="input-append"><input class="mt-single-input" min="0"  max="100" type="number" ng-model="headsWeight" /><span class="add-on">%</span></div></label>'+
                                        '</div>'+
                                        '<div class="mt-probs-config-footer">'+
                                            '<button class="btn btn-primary pull-right" ng-click="openConfig()">Ok</button>'+
                                        '</div>'+
                                    '</div>' +
                                '</div>'+
                                '<div class="mt-probs-config-open" ng-click="openConfig()">C</div>'+
                            '</div>' +
                            '<div class="mt-probs-sim-inputs">' +
                                '<div class="mt-probs-sim-trials">'+
                                    '<label>Flip: <input class="mt-single-input" min="0" max="10" type="number" ng-model="numCoins" ng-change="numCoinsChanged()" ng-disabled="running" /> coin<span ng-if="runs > 1">s</span></label>' +
                                    '<label>Do:   <input class="mt-single-input" min="0" max="100" type="number" ng-model="numRepetitions" ng-disabled="running" /> trial<span ng-if="numRepetitions > 1">s</span></label>' +
                                '</div>'+
                                '<div class="mt-probs-sim-start">'+
                                    '<button class="btn btn-large coin-go" ng-class="{\'btn-success\': !running}" ng-model="skipAnimations" ng-disabled="speed === 32">'+
                                        '<div class="mt-probs-sim-go-button" ng-if="!running" ng-click="run()" >Go!</div>'+
                                        '<div class="mt-probs-sim-go-button" ng-show="running && speed === 1" ng-click="speed = 8"> >> </div>'+
                                        '<div class="mt-probs-sim-go-button" ng-show="speed === 8 || speed === 32" ng-click="speed = 32"> >>| </div>'+
                                    '</button>'+
                                '</div>'+
                            '</div>' +
                        '</div>',
            controller:'CoinCtrl',
            restrict: 'E',
            link: function link(scope, element) {
                scope.begin();

                var isConfigOpen = false;

                scope.openConfig = function() {
                    var configPanel = element.find('.mt-probs-config').get(0);
                    var configBtn = element.find('.mt-probs-config-open').get(0);
                    
                    if(isConfigOpen) {
                        $animate.removeClass(configPanel, 'mt-config-slide-right');
                        $animate.removeClass(configBtn, 'mt-config-btn-slide-right');
                    } else {
                        $animate.addClass(configPanel, 'mt-config-slide-right');
                        $animate.addClass(configBtn, 'mt-config-btn-slide-right');
                    }

                    isConfigOpen = !isConfigOpen;
                };
            }
        };
    });
})(window.mt.stats);

/**
 * Created by Oakley Hall on 6/16/14.
 */
(function (ns) {
    'use strict';
    angular.module('mtStats').directive('mtProbsDice', function($animate){
        return{
            scope: {
                probabilityService: '=',
                ribbonProps: '='
            },
            template:  '<div class="mt-probs-container">'+
                            '<div class="mt-probs-sim-container">'+
                                '<canvas id="diceCanvas" class="mt-throwing-canvas-dice"></canvas>' +
                                '<div class="mt-probs-config-container">'+
                                    '<div class="mt-probs-config">'+
                                        '<h5 class="mt-probs-config-header">Dice Settings</h5>'+
                                        '<div class="mt-probs-config-body">'+
                                            '<h4>Dice Faces:</h4>'+
                                            '<div class="mt-item-config" ng-repeat="die in diceValues">' +
                                                '<input type="number" min="1" max="6" ng-model="die.faces[0]" class="mt-face-input"/>' +
                                                '<input type="number" min="1" max="6" ng-model="die.faces[1]" class="mt-face-input"/>' +
                                                '<input type="number" min="1" max="6" ng-model="die.faces[2]" class="mt-face-input"/>' +
                                                '<input type="number" min="1" max="6" ng-model="die.faces[3]" class="mt-face-input"/>' +
                                                '<input type="number" min="1" max="6" ng-model="die.faces[4]" class="mt-face-input"/>' +
                                                '<input type="number" min="1" max="6" ng-model="die.faces[5]" class="mt-face-input"/>' +
                                            '</div>' +
                                        '</div>'+
                                        '<div class="mt-probs-config-footer">'+
                                            '<button class="btn btn-primary pull-right" ng-click="openConfig()">Ok</button>'+
                                        '</div>'+
                                    '</div>' +
                                '</div>'+
                                '<div class="mt-probs-config-open" ng-click="openConfig()">C</div>'+
                            '</div>' +
                            '<div class="mt-probs-sim-inputs">' +
                                '<div class="mt-probs-sim-trials">'+
                                    '<label>Roll: <input class="mt-single-input" min="0" max="12" type="number" ng-model="numDice" ng-change="numDiceChanged()" ng-disabled="running" /> dice</label>' +
                                    '<label>Do:   <input class="mt-single-input" min="0" max="100" type="number" ng-model="numRepetitions" ng-disabled="running" /> trial<span ng-if="numRepetitions > 1">s</span></label>' +
                                '</div>'+
                                '<div class="mt-probs-sim-start">'+
                                    '<button class="btn btn-large" ng-class="{\'btn-success\': !running}" ng-model="skipAnimations" ng-disabled="speed === 32">'+
                                        '<div class="mt-probs-sim-go-button" ng-if="!running" ng-click="run()" >Go!</div>'+
                                        '<div class="mt-probs-sim-go-button" ng-show="running && speed === 1" ng-click="speed = 8"> >> </div>'+
                                        '<div class="mt-probs-sim-go-button" ng-show="speed === 8 || speed === 32" ng-click="speed = 32"> >>| </div>'+
                                    '</button>'+
                                '</div>'+
                            '</div>' +
                        '</div>',
            controller:'DiceCtrl',
            restrict: 'E',
            link: function link(scope, element) {
                scope.canvas = element.find('#diceCanvas').get(0);
                scope.begin();

                var isConfigOpen = false;

                scope.openConfig = function() {
                    var configPanel = element.find('.mt-probs-config').get(0);
                    var configBtn = element.find('.mt-probs-config-open').get(0);
                    
                    if(isConfigOpen) {
                        $animate.removeClass(configPanel, 'mt-config-slide-right');
                        $animate.removeClass(configBtn, 'mt-config-btn-slide-right');
                    } else {
                        $animate.addClass(configPanel, 'mt-config-slide-right');
                        $animate.addClass(configBtn, 'mt-config-btn-slide-right');
                    }

                    isConfigOpen = !isConfigOpen;
                };
            }
        };
    });
})(window.mt.stats);

/**
 * Created by Oakley Hall on 6/16/14.
 */
(function (ns) {
    'use strict';
    angular.module('mtStats').directive('mtProbsMarb', function($animate){
        return{
            scope: {
                probabilityService: '=',
                ribbonProps: '='
            },
            template:  '<div class="mt-probs-container">'+
                            '<div class="mt-probs-sim-container">'+
                                '<canvas id="marbleCanvas" class="mt-throwing-canvas-marble"></canvas>' +
                                '<div class="mt-probs-config-container">'+
                                    '<div class="mt-probs-config">'+
                                        '<h5 class="mt-probs-config-header">Marble Settings</h5>'+
                                        '<div class="mt-probs-config-body">'+
                                            '<h5>Number of Colors: {{colorGroupCount}}</h5>'+
                                            '<div class="mt-probs-slice-btns"><button class="btn" type="submit" ng-click="addColor()" ng-disabled="colorGroupCount === 10">+ Color</button>' +
                                            '<button class="btn" type="submit" ng-click="removeItem()" ng-disabled="colorGroupCount === 1">- Color</button></div>' +
                                            // '<label>Number of Colors: <div class="input-append"><input class="mt-single-input" type="number" max="{{MAXDIFFBALLS}}" min="1" ng-model="val" /><button class="btn" type="submit" ng-click="submit(val)">Ok</button></div></label>' +
                                            '<div class="mt-item-config" ng-repeat="colorGroup in colorGroups">' +
                                                '<input class="mt-single-input" type="text"  style="width: 75px; margin-right: 5px;" ng-model="colorGroup.name" ng-change="colorChange()" />' +
                                                '<input class="mt-single-input" type="number" ng-model="colorGroup.number" ng-change="colorChange()"/>' +
                                            '</div>' +
                                        '</div>'+
                                        '<div class="mt-probs-config-footer">'+
                                            '<button class="btn btn-primary pull-right" ng-click="openConfig()">Ok</button>'+
                                        '</div>'+
                                    '</div>' +
                                '</div>'+
                                '<div class="mt-probs-config-open" ng-click="openConfig()">C</div>'+
                                '<div class="mt-probs-sim-output">' +
                                    '<a class="pull-right mt-probs-clear-output" style="color: white; cursor: default;" ng-click="clearBalls()">X</a>' +
                                    '<h4 class="mt-probs-text" ng-if="binnedBalls.length === 0">No marbles have been rolled yet!</h4>'+
                                    '<div class="mt-bin-div">' +
                                        '<span class="mt-ball-holder" ng-repeat="ball in binnedBalls track by $index" >' +
                                            '<div class="mt-circle" style="{{\'background-color:\'+ball.color+\';\'+ball.gradient}}"></div>' +
                                        '</span>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="mt-probs-sim-inputs">' +
                                '<div class="mt-probs-sim-trials">'+
                                    '<label>Draw: <input class="mt-single-input" min="0" max="10" type="number" ng-model="numDraw" ng-disabled="running" /> marble<span ng-if="numDraw > 1">s</span></label>' +
                                    '<label>Do:   <input class="mt-single-input" min="0" max="100" type="number" ng-model="numRepetitions" ng-disabled="running" /> trial<span ng-if="numRepetitions > 1">s</span></label>' +
                                '</div>'+
                                '<div class="mt-probs-sim-start">'+
                                    '<button class="btn btn-large" ng-class="{\'btn-success\': !running}" ng-model="skipAnimations" ng-disabled="speed === 32">'+
                                        '<div class="mt-probs-sim-go-button" ng-if="!running" ng-click="run()" >Go!</div>'+
                                        '<div class="mt-probs-sim-go-button" ng-show="running && speed === 1" ng-click="speed = 8"> >> </div>'+
                                        '<div class="mt-probs-sim-go-button" ng-show="speed === 8 || speed === 32" ng-click="speed = 32"> >>| </div>'+
                                    '</button>'+
                                '</div>'+
                            '</div>' +
                        '</div>',
            controller:'MarbleCtrl',
            restrict: 'E',
            link: function (scope, element) {
                scope.canvas = element.find('#marbleCanvas').get(0);
                scope.val = scope.colorGroupCount;
                scope.begin();

                scope.submit = function(val) {
                    scope.colorGroupCount = val;
                };

                var isConfigOpen = false;

                scope.openConfig = function() {
                    var configPanel = element.find('.mt-probs-config').get(0);
                    var configBtn = element.find('.mt-probs-config-open').get(0);
                    
                    if(isConfigOpen) {
                        $animate.removeClass(configPanel, 'mt-config-slide-right');
                        $animate.removeClass(configBtn, 'mt-config-btn-slide-right');
                    } else {
                        $animate.addClass(configPanel, 'mt-config-slide-right');
                        $animate.addClass(configBtn, 'mt-config-btn-slide-right');
                    }

                    isConfigOpen = !isConfigOpen;  
                };
            }
        };
    });
})(window.mt.stats);

/**
 * Created by Oakley Hall on 6/16/14.
 */
(function (ns) {
    'use strict';
    angular.module('mtStats').directive('mtProbsSpin',function($animate){
        return{
            scope: {
                probabilityService: '=',
                ribbonProps: '='
            },
            template:  '<div class="mt-probs-container">'+
                            '<div class="mt-probs-sim-container">'+
                                '<div id="wheel" class="mt-spinner" />'+
                                '<p class="mt-sum-error" ng-show="sumError"> Values must add up to 100% </p>' +
                                '<div class="mt-probs-config-container">'+
                                    '<div class="mt-probs-config">'+
                                        '<h5 class="mt-probs-config-header">Spinner Settings</h5>'+
                                        '<div class="mt-probs-config-body">'+
                                            '<h5>Number of Slices: {{numSlices}}</h5>'+
                                            '<div class="mt-probs-slice-btns"><button class="btn" type="submit" ng-click="addSlice()" ng-disabled="numSlices === 10">+ Slice</button>' +
                                            '<button class="btn" type="submit" ng-click="removeItem()" ng-disabled="numSlices === 1">- Slice</button></div>' +
                                            '<div class="mt-item-config" ng-repeat="slice in slices">' +
                                                '<input class="mt-small-input" type="text" maxlength="16" ng-model="slice.name" ng-change="changeSliceName()" />' +
                                                '<div class="input-append"><input class="mt-single-input" type="number" min="0" max="100" step="any" ng-model="slice.value" ng-change="changeSliceValue($index)" /><span class="add-on">%</span></div>' +
                                            '</div>' +
                                        '</div>'+
                                        '<div class="mt-probs-config-footer">'+
                                            '<button class="btn btn-primary pull-right" ng-click="openConfig()">Ok</button>'+
                                        '</div>'+
                                    '</div>' +
                                '</div>'+
                                '<div class="mt-probs-config-open" ng-click="openConfig()">C</div>'+
                            '</div>' +
                            '<div class="mt-probs-sim-inputs">' +
                                '<div class="mt-probs-sim-trials">'+
                                    '<label>Do: <input class="mt-single-input" min="0" max="100" type="number" ng-model="numSpins" ng-disabled="running || sumError" /> spin<span ng-if="numSpins > 1">s</span></label>' +
                                    '<label>Do: <input class="mt-single-input" min="0" max="100" type="number" ng-model="numRepetitions" ng-disabled="running || sumError" /> trial<span ng-if="numRepetitions > 1">s</span></label>' +
                                '</div>'+
                                '<div class="mt-probs-sim-start">'+
                                    '<button class="btn btn-large" ng-class="{\'btn-success\': !running}" ng-model="skipAnimations" ng-disabled="speed === 32 || sumError">'+
                                        '<div class="mt-probs-sim-go-button" ng-if="!running" ng-click="run()" >Go!</div>'+
                                        '<div class="mt-probs-sim-go-button" ng-show="running && speed === 1" ng-click="speed = 8"> >> </div>'+
                                        '<div class="mt-probs-sim-go-button" ng-show="speed === 8 || speed === 32" ng-click="speed = 32"> >>| </div>'+
                                    '</button>'+
                                '</div>'+
                            '</div>' +
                        '</div>',
            controller:'SpinCtrl',
            restrict: 'E',
            link: function link(scope,element) {
                scope.begin(element.find('#wheel').get(0));

                var isConfigOpen = false;

                scope.openConfig = function() {
                    var configPanel = element.find('.mt-probs-config').get(0);
                    var configBtn = element.find('.mt-probs-config-open').get(0);
                    
                    if(isConfigOpen) {
                        $animate.removeClass(configPanel, 'mt-config-slide-right');
                        $animate.removeClass(configBtn, 'mt-config-btn-slide-right');
                    } else {
                        $animate.addClass(configPanel, 'mt-config-slide-right');
                        $animate.addClass(configBtn, 'mt-config-btn-slide-right');
                    }

                    isConfigOpen = !isConfigOpen;
                };
            }
        };
    });
})(window.mt.stats);

/**
 * Created by Oakley Hall on 6/16/14.
 */
(function (ns) {
    'use strict';
    angular.module('mtStats').directive('mtProbsTools', function(){
        return{
            templateUrl: 'templates/mtStatsProbabilityTemplate.html',
            controller:'ProbsToolsParentCtrl',
            restrict: 'E',
            scope: {
                toolId: '=',
                containerApi: '='
            },
            link: function(scope) {
                scope.init();
            }
        };
    });
})(window.mt.stats);

(function (ns) {
    'use strict';
    angular.module('mtStats').directive('mtSamplerMarb', function(){
        return{
            scope: {
                skipani: '=',
                speed: '=',
                probabilityService: '=',
                toolId: '='
            },
            template:  '<div class="mt-probs-container">'+
                            '<div class="mt-probs-sim-container">'+
                                '<canvas id="marbleCanvas" class="mt-throwing-canvas-marble"></canvas>' +
                                '<div class="mt-probs-sim-output">' +
                                    '<a class="pull-right mt-probs-clear-output" style="color: white; cursor: default;" ng-click="clearBalls()">X</a>' +
                                    '<h4 class="mt-probs-text" ng-if="binnedBalls.length === 0">No marbles have been rolled yet!</h4>'+
                                    '<div class="mt-bin-div">' +
                                        '<span class="mt-ball-holder" ng-repeat="ball in binnedBalls track by $index" >' +
                                            '<div class="mt-circle" style="{{\'background-color:\'+ball.color+\';\'+ball.gradient}}">'+
                                                '<div style="font-size:12px;font-weight:bold;font-family:Arial;position:relative;top:4px;left:7px">' +
                                                    '{{ball.name}}' +
                                                '</div>' +
                                            '</div>' +
                                        '</span>' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                            '<div class="mt-probs-sim-inputs">' +
                                '<div class="mt-probs-sim-trials">'+
                                    '<h5>Number of cases: {{totalMarbles}}</h5>' +
                                    '<label>Sample Size: <input class="mt-single-input" min="0" type="number" ng-model="numRepetitions" ng-disabled="running || totalMarbles < numDraw" /></label>' +
                                '</div>'+
                                '<div class="mt-probs-sim-start">'+
                                    '<button class="btn btn-large" ng-class="{\'btn-success\': !running}" ng-disabled="speed === 32">'+
                                        '<div class="mt-probs-sim-go-button" ng-if="!running" ng-click="run()" >Go!</div>'+
                                        '<div class="mt-probs-sim-go-button" ng-show="running && speed === 1" ng-click="speed = 8"> >> </div>'+
                                        '<div class="mt-probs-sim-go-button" ng-show="speed === 8 || speed === 32" ng-click="speed = 32"> >>| </div>'+
                                    '</button>'+
                                '</div>'+
                            '</div>' +
                        '</div>',
            // templateUrl: 'templates/mtSamplerMarbTemplate.html',
            controller:'SamplerMarbleCtrl',
            restrict: 'E',
            link: function (scope, element) {
                scope.canvas = element.find('#marbleCanvas').get(0);
                scope.begin();
            }
        };
    });
})(window.mt.stats);

/**
 * Created by Oakley Hall on 6/30/14.
 */

(function (ns) {
    'use strict';
    angular.module('mtStats').directive('mtSpeedSlider', function(){
        return {
            link: function(scope, elem) {
                $(elem).slider({
                    min: scope.speeds[0],
                    max: scope.speeds[scope.speeds.length-1],
                    slide: function( event, ui ) {
                        scope.speedSelection = ui.value;
                        scope.$apply(); //update speed display bindings
                    }
                });
            }
        };
    });
})(window.mt.stats);
(function (ns) {
    'use strict';

    angular.module('mtStats').directive('mtStatsAttributeTarget', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/mtStatsAttributeTargetTemplate.html',
            scope: {
                type: '@',
                active: '=',
                text: '='
            },
            link: function (scope, element, attrs) {

                scope.isTarget = function (type) {
                    return scope.type === type;
                };
            }
        };
    });
})(window.mt.stats);
(function (ns) {
    'use strict';

    angular.module('mtStats').directive('mtStatsCaseData', function (safeApply, $timeout) {
        return {
            restrict: 'E',
            templateUrl: 'templates/mtStatsCaseDataTemplate.html',
            controller: 'StatsCaseDataCtrl',
            link: function (scope, element, attrs) {
                scope.marginLeft = 0;

                $(element).find('.mt-stats-data-rows').scroll(function (event) {
                    safeApply(scope, function () {
                        scope.marginLeft = -1 * event.target.scrollLeft;
                    });
                });

                $timeout(function () {
                    scope.draggableElement = $(element).find('.mt-stats-draggable-attribute');
                });

                scope.$watch(function () {
                    return _(scope.caseData.cases).findWhere({active: true});
                }, function (newVal, oldVal) {
                    if (newVal === oldVal || newVal === undefined) {
                        return;
                    }

                    // give angular time to add the active class to the active case
                    $timeout(function () {
                        var activeCase = $(element).find('.mt-stats-data-rows .mt-active');
                        var container = $(element).find('.mt-stats-data-rows');
                        var activeCaseTop = activeCase.position().top;
                        var containerTop = container.position().top;
                        var containerBottom = containerTop + container.height();

                        var scrollLeft = container.scrollLeft();

                        if (activeCaseTop < containerTop || activeCaseTop > containerBottom) {
                            activeCase.get(0).scrollIntoView(false);
                            container.scrollLeft( scrollLeft );
                        }

                    });
                });
            }
        };
    });

})(window.mt.stats);

(function (ns) {
    'use strict';

    angular.module('mtStats').directive('mtStatsCase', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/mtStatsCaseTemplate.html',
            controller: 'StatsCaseCtrl',
            scope: {
                model: '=',
                attributes: '=',
                updateFn: '=',
                selectFn: '=',
                validateFn: '='
            },
            link: function (scope, element, attrs) {
                scope.onBlur = function(attr) {
                    scope.updateFn(scope.model, attr);
                };
                scope.onChange = function(attr) {
                    scope.model.setClean(attr,false);
                };
                scope.handleKeyPress = function(event, attr) {
                    if(event.which === 13) {
                        scope.updateFn(scope.model, attr);
                    }
                };
                scope.isEven = function() {
                    return scope.$parent.$index % 2 === 0;
                };

                element.on('touchmove', function(e){ //allows for scrolling inside the table
                    e.stopPropagation();
                });
            }
        };
    });

})(window.mt.stats);

(function (ns) {
    'use strict';

    angular.module('mtStats').directive('mtStatsDraggableAttribute', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/mtStatsDraggableAttributeTemplate.html',
            scope: {
                text: '=',
                left: '=',
                top: '='
            },
            link: function (scope, element, attrs) {

            }
        };
    });

})(window.mt.stats);
// (function () {
//     'use strict';

//     angular.module('mtStats').directive('mtStatsGraphBinDialog', function () {
//         return {
//             restrict: 'E',
//             replace: true,
//             templateUrl: 'templates/mtStatsGraphBinDialogTemplate.html',
//             link: function (scope) {
//                 scope.registerAxisResetFn(scope.axis, function (){
//                     scope.binWidthCheckBox = false;
//                     scope.binNumCheckBox = true;
//                     scope.graphModel.axes[scope.axis].selectedBinWidth = undefined;
//                     scope.graphModel.axes[scope.axis].binCount = 0;
//                     scope.showDialog = false;
//                 });

//             },
//             controller: function ($scope) {
//                 $scope.updateBins = function() {
//                     if( $scope.binWidthCheckBox &&
//                         $scope.graphModel.axes[$scope.axis].selectedBinWidth !== undefined) {
//                         $scope.graphModel.axes[$scope.axis].binCount = 0;
//                     }
//                     $scope.binData($scope.axis);
//                 };
//                 $scope.focusStart = function(event) {};
//                 $scope.blur = function() {
//                     $scope.updateBins();
//                 };
//                 $scope.selectByNum = function() {
//                     $scope.binNumCheckBox = !$scope.binNumCheckBox;
//                     if(!$scope.binNumCheckBox) {
//                         $scope.graphModel.axes[$scope.axis].binCount = 0;
//                     } else {
//                         $scope.binWidthCheckBox = false;
//                         $scope.graphModel.axes[$scope.axis].selectedBinWidth = undefined;
//                     }
//                     $scope.updateBins();
//                 };
//                 $scope.selectByWidth = function() {
//                     $scope.binWidthCheckBox = !$scope.binWidthCheckBox;
//                     if (!$scope.binWidthCheckBox) {
//                         $scope.graphModel.axes[$scope.axis].selectedBinWidth = undefined;
//                         $scope.graphModel.axes[$scope.axis].binCount = 0;
//                     } else {
//                         $scope.binNumCheckBox = false;
//                     }
//                     $scope.updateBins();
//                 };
//                 $scope.handleTap = function () {
//                     if(!$scope.graphModel.axes[$scope.axis].isQuant()) {
//                         return;
//                     }
//                     $scope.showDialog = !$scope.showDialog;
//                 };
//                 $scope.keypress = function (event) {
//                     if(event.which === 13) {
//                         $scope.updateBins();
//                     }
//                 };
//             }
//         };
//     });
// })(window.mt.stats);

(function (ns) {
    'use strict';

    angular.module('mtStats').directive('mtStatsGraphLegendDialog', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/mtStatsGraphLegendDialogTemplate.html',
            controller: function ($scope) {
                $scope.handleTap = function () {
                    $scope.showDialog = !$scope.showDialog;
                };
            }
        };
    });
})(window.mt.stats);

(function (ns) {
    'use strict';

    angular.module('mtStats').directive('mtStatsGraphLegend', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/mtStatsGraphLegendTemplate.html',
            scope: true,
            link: function (scope, element, attributes) {
                scope.axis = attributes.axis;
            },
            controller: function ($scope) {
            }
        };
    });
})(window.mt.stats);

// (function (ns) {
//     'use strict';

//     angular.module('mtStats').directive('mtStatsGraphMarkerDialog', function () {
//         return {
//             restrict: 'E',
//             replace: true,
//             templateUrl: 'templates/mtStatsGraphMarkerDialogTemplate.html',
//             link: function (scope) {
//                 scope.registerAxisResetFn(scope.axis, function (){
//                     scope.graphModel.axes[scope.axis].showMeans = false;
//                     scope.graphModel.axes[scope.axis].showMedians = false;
//                     scope.graphModel.axes[scope.axis].showMADs = false;
//                     scope.showDialog = false;
//                 });

//             },
//             controller: function ($scope) {
//                 $scope.handleTap = function () {
//                     if(!$scope.graphModel.axes[$scope.axis].isQuant()) {
//                         return;
//                     }
//                     $scope.showDialog = !$scope.showDialog;
//                 };
//                 $scope.disabled = function () {
//                     if($scope.graphModel.axes[$scope.axis].binned) {
//                         $scope.graphModel.axes[$scope.axis].showMADs = false;
//                     }
//                     return ($scope.graphModel.axes[$scope.axis].binned);
//                 };

//                 $scope.toggleMeans = function (axis) {
//                     $scope.graphModel.axes[axis].showMeans = !$scope.graphModel.axes[axis].showMeans;
//                     $scope.update();
//                 };
//                 $scope.toggleMedians = function (axis) {
//                     $scope.graphModel.axes[axis].showMedians = !$scope.graphModel.axes[axis].showMedians;
//                     $scope.update();
//                 };
//                 $scope.toggleMADs = function (axis) {
//                     if(!$scope.disabled()) {
//                         $scope.graphModel.axes[axis].showMADs = !$scope.graphModel.axes[axis].showMADs;
//                         $scope.graphModel.axes[$scope.axis].showMeans = $scope.graphModel.axes[$scope.axis].showMADs;
//                         $scope.update();
//                     }
//                 };
//             }
//         };
//     });
// })(window.mt.stats);

(function (ns) {
    'use strict';

    angular.module('mtStats').directive('mtStatsGraphMenuButton', function () {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: 'templates/mtStatsGraphMenuButtonTemplate.html',
            scope: {}
        };
    });
})(window.mt.stats);
(function (ns) {
    'use strict';

    angular.module('mtStats').directive('mtStatsGraphToolbar', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/mtStatsGraphToolbarTemplate.html',
            scope: true,
            link: function (scope, element, attributes) {
                scope.axis = attributes.axis;
            },
            controller: function ($scope) {
                $scope.toggleRuler = function () {
                    if ($scope.graphModel.axes[$scope.axis].ruler) {
                        $scope.removeRuler($scope.axis);
                    } else {
                        $scope.addRuler($scope.axis);
                    }

                };
            }
        };
    });
})(window.mt.stats);

(function (ns) {
    'use strict';

    angular.module('mtStats').directive('mtStatsGraph', function () {
        return {
            restrict            : 'E',
            templateUrl         : 'templates/mtStatsGraphTemplate.html',
            controller          : 'StatsGraphCtrl',
            scope: {
                toolId: '=',
                containerApi: '='
            },
            link: function (scope, element) {
                var container = $(element).find('.mt-graph-container');
                scope.containerElement = container[0];
                scope.width = container.width();
                scope.height = container.height();
                scope.handleAttributeDragEnd = function (event) {
                    updateTargests(event.data.gesture);

                    scope.showAttributeTargets = false;
                    if (scope.activeTarget[ns.STATS_GRAPH_DROP_AREA_CASE]) {
                        scope.update(undefined, event.data.text);
                    } else if (scope.activeTarget[ns.STATS_GRAPH_DROP_AREA_X]) {
                        scope.update(event.data.text);
                    } else if (scope.activeTarget[ns.STATS_GRAPH_DROP_AREA_Y]) {
                        scope.update(undefined, undefined, event.data.text);
                    }
                };
                scope.handleAttributeDrag = function (event) {
                    updateTargests(event.data.gesture);
                };
                scope.handleAttributeDragStart = function () {
                    scope.showAttributeTargets = true;
                };

                scope.init();

                function getEventPos(e) {
                    return [e.gesture.center.pageX-$(scope.containerElement).offset().left, e.gesture.center.pageY-$(scope.containerElement).offset().top];
                }

                function buildProperties(className) {
                    var target = $(element).find('.' + className);
                    return {
                        offset: target.offset(),
                        height: target.height(),
                        width: target.width()
                    };
                }

                function isInside(dragX, dragY, properties) {
                    return dragX > properties.offset.left && dragX < properties.offset.left + properties.width &&
                        dragY > properties.offset.top && dragY < properties.offset.top + properties.height;
                }

                scope.tap = function (event) {
                    var pos = getEventPos(event);
                    scope.gestureHandler.tapAtPos(pos[0], pos[1], $(event.srcElement).attr('id'));
                };

                scope.hold = function (event) {
                    var pos = getEventPos(event);
                    scope.gestureHandler.holdAtPos(pos[0], pos[1], $(event.srcElement).attr('id'));
                };

                scope.doubletap = function (event) {
                    var pos = getEventPos(event);
                    scope.gestureHandler.doubleTapAtPos(pos[0], pos[1], $(event.srcElement).attr('id'));
                };
                scope.dragStart = function (event) {
                    var pos = getEventPos(event);
                    scope.gestureHandler.dragStartAtPos(pos[0], pos[1], event.srcElement);
                };
                scope.dragEnd = function (event) {
                    scope.gestureHandler.dragEnd();
                };

               // scope.$on(ns.EVENT_ATTRIBUTE_DRAG_START, function () {

                //});

                //scope.$on(ns.EVENT_ATTRIBUTE_DRAG, function (event, gesture) {

                //});
                var lastUpdate;
                var throttleThreshold = 50; //ms
                function throttleUpdate() {
                    var time = new Date().getTime();
                    if(lastUpdate === undefined || time - lastUpdate > throttleThreshold) {
                        lastUpdate = time;
                        return false;
                    }
                    return true;
                }

                var lastDigest;
                var throttleDigestThreshold = 150; //ms
                function throttleDigest() {
                    var time = new Date().getTime();
                    if(lastDigest === undefined || time - lastDigest > throttleDigestThreshold) {
                        lastDigest = time;
                        return false;
                    }
                    return true;
                }

                scope.drag = function (e) {
                    if(throttleUpdate()) {
                        return false;
                    }

                    var pos = getEventPos(e);
                    e.gesture.preventDefault();
                    scope.gestureHandler.dragAtPos(pos[0], pos[1]);

                    //only need to call digest to update expression list - don't need this every frame
                    if(throttleDigest() === false) {
                        scope.$apply();
                    }
                    return false;
                };

                function updateTargests(gesture) {
                    var caseProperties = buildProperties('mt-stats-graph-target-case'),
                        xProperties = buildProperties('mt-stats-graph-target-x'),
                        yProperties = buildProperties('mt-stats-graph-target-y');

                    scope.activeTarget[ns.STATS_GRAPH_DROP_AREA_CASE] = isInside(gesture.gesture.center.pageX, gesture.gesture.center.pageY, caseProperties);
                    scope.activeTarget[ns.STATS_GRAPH_DROP_AREA_X] = isInside(gesture.gesture.center.pageX, gesture.gesture.center.pageY, xProperties);
                    scope.activeTarget[ns.STATS_GRAPH_DROP_AREA_Y] = isInside(gesture.gesture.center.pageX, gesture.gesture.center.pageY, yProperties);
                }
            }
        };
    });

})(window.mt.stats);

(function (ns) {
    'use strict';

    angular.module('mtStats').directive('mtStatsHeader', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/mtStatsHeaderTemplate.html',
            scope: {
                model: '=',
                headers: '='
            },
            link: {
                pre: function preLink(scope, element, attrs) {
                },
                post: function postLink(scope, element, attrs) {

                    var parentOffset, elementSize;

                    scope.touch = function (event) {
                        //scope.model.dragging = true;
                        if (!scope.model.resizing) {
                            scope.$emit('mtStatsActiveHeaderChange', scope.model);
                        }
                        // prevents header row from scrolling away from data
                        event.gesture.preventDefault();
                    };

                    scope.release = function () {
                        scope.model.dragging = false;
                    };

                    scope.dragStart = function (event) {
                        scope.$emit('mtStatsHeaderDragStart', scope.model.display);
                        if( event.srcElement !== undefined ) {
                            parentOffset = $(event.srcElement.offsetParent).offset();
                        }
                        elementSize = {
                            height: $(element).height(),
                            width: $(element).width()
                        };
                    };

                    scope.drag = function (event) {
                        var top;
                        var left;
                        if( parentOffset !== undefined ) {
                            top = event.gesture.center.pageY - parentOffset.top - elementSize.height / 2;
                            left = event.gesture.center.pageX - parentOffset.left - elementSize.width / 2;
                        } else {
                            top = event.gesture.center.pageY - elementSize.height / 2;
                            left = event.gesture.center.pageX  - elementSize.width / 2;
                        }
                        scope.$emit('mtStatsHeaderDrag', event, top, left);
                    };

                    scope.dragEnd = function (event) {
                        scope.$emit('mtStatsHeaderDragEnd', event);
                        if (!scope.model.resizing) {
                            scope.model.active = false;
                        }
                    };
                }
            }
        };
    });

})(window.mt.stats);

(function (ns) {
    'use strict';

    angular.module('mtStats').directive('mtStatsTool', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/mtStatsToolTemplate.html',
            controller: 'StatsToolCtrl',
            scope: {
                toolId: '=',
                containerApi: '='
            },
            link: function (scope, element, attrs) {

            }
        };
    });

})(window.mt.stats);

(function (ns) {
    'use strict';
    angular.module('mtStats').directive('mtStatsWizard', function(){
        return{
            templateUrl: 'templates/mtStatsWizardTemplate.html',
            restrict: 'E',
            scope: {
                wizardApi: '='
            },
            link: function(scope) {
                scope.dataSetFiles = ['ufo','ufo_ext','drug_a','drug_b', 'drug_c','census'];

                scope.mainPageActive = true;
                scope.toggleDataView = function (mainActive) {
                    if(mainActive === undefined) {
                        mainActive = !scope.mainPageActive;
                    }
                    scope.mainPageActive = mainActive;
                };
            }
        };
    });
})(window.mt.stats);

(function (ns) {
    'use strict';

    angular.module('mtStats').service('statsDataService', function ($http, configService) {
        var statsDataApi = _.template(configService.statsDataUrl + '/?src={{src}}');

        function getPath(url) {
            return statsDataApi({src: encodeURIComponent(url)});
        }

        return {
            getData: function (url, callback, errorCallback) {
                $http.get(getPath(url))
                    .success(function (data) {
                        callback(data);
                    })
                    .error(function (data) {
                        if (angular.isFunction(errorCallback)) {
                            errorCallback();
                        }
                    });
            }
        };
    });
})(window.mt.stats);
/**
 * Created by Oakley Hall on 7/1/14.
 */
(function (ns) {
    'use strict';

    angular.module('mtStats').factory('ProbabilityService',['eventingService', function(eventingService){

        var countItems = function(array, item){
            var matches = 0;
            _.forEach(array, function(elem){
                if(elem===item){
                    matches++;
                }
            });
            return matches;
        };

        var ORD_LIST   = 'Ordered List',
            UNORD_LIST = 'Unordered List',
            CNT_HEADS  = 'Count Heads',
            CNT_TAILS  = 'Count Tails',
            CARD_VAL   = 'Values',
            CARD_VALS_SUITS = 'Values and Suits',
            COUNT_RED  = 'Count Red',
            COUNT_BLK  = 'Count Black',
            COUNT_DIA  = 'Count Diamonds',
            COUNT_HRT  = 'Count Hearts',
            COUNT_SPD  = 'Count Spades',
            COUNT_CLB  = 'Count Clubs',
            SUM        = 'sum';

        var colors = [
                {color:'#FF0000',name:'Red'},
                {color:'#020fd6',name:'Blue'},
                {color:'#662d91',name:'Purple'},
                {color:'#16b36c',name:'Green'},
                {color:'#9e005d',name:'Dark Pink'},
                {color:'#fbdd32',name:'Yellow'},
                {color:'#ff7537',name:'Orange'},
                {color:'#51bdff',name:'Light Blue'},
                {color:'#ff85ad',name:'Pink'},
                {color:'#b3db6c',name:'Light Green'}
            ],

            colorSelectionIndex = 0;


        var  getArrayOfAttributes = function(cards, attr){
            return $.map( cards, function(card){ return card[attr]; } );
        };

        var countItemsWithMatchingAttrs = function(cards, attr, value){
            function matcher(element){
                return element.toString().toLowerCase() === value.toLowerCase();
            }
            return  getArrayOfAttributes(cards, attr).filter(matcher).length || 0;
        };

        var ProbabilityAPI = function(toolId, caseData) {
            this.toolId = toolId;
            this.resultsCaseData = caseData;
        };

        ProbabilityAPI.prototype.isSampler = function() {
            return this.sampler;
        };

        ProbabilityAPI.prototype.addRow = function(){
            var newCase = this.resultsCaseData.addCase();
            var addDataEvent = new mt.common.Event({case:newCase});
            addDataEvent.type = mt.stats.EVENT_DATA_ADD;
            addDataEvent.sourceId = this.toolId;
            eventingService.publishToSubscriber(ns.TOPIC_STATS_NOTIFY_TABLE, addDataEvent, this.resultsToolId);
            return newCase;
        };
        ProbabilityAPI.prototype.getCaseByIndex = function(index) {
            if(this.resultsCaseData.getCase){
                return this.resultsCaseData.getCase(index);
            }
        };
        ProbabilityAPI.prototype.getRandomColor = function() {
            var letters = '0123456789ABCDEF'.split(''),
                color = '#';
            for (var i = 0; i < 6; i++ ) {
                color += letters[Math.floor(Math.random() * 16)];
            }
            return color;
        };
        ProbabilityAPI.prototype.getColorFromPalette = function(index){
            if( _.isNumber(index) && index < colors.length ){//by index or squentially
                return colors[index];
            }else{
                if(colorSelectionIndex >= colors.length){
                    colorSelectionIndex = 0;
                }
                var reVal = colors[colorSelectionIndex];
                colorSelectionIndex++;
                return reVal;
            }
        };
        ProbabilityAPI.prototype.getImageURL = function(img){
            return 'img/probability/'+img+'.png';
        };
        ProbabilityAPI.prototype.addNewCase = function(){
            return this.addRow();
        };
        ProbabilityAPI.prototype.addAttribute = function(name,type){
            if(this.resultsCaseData.addAttribute){
                this.resultsCaseData.addAttribute(name, type);
            }
            if(this.resultsCaseData.cases && this.resultsCaseData.cases.length === 0) {
                return this.addRow();
            }
        };
        ProbabilityAPI.prototype.addDataPoint = function(caseIndex, name,value){
            if(this.resultsCaseData.getCase){
                var curCase = this.resultsCaseData.getCase(caseIndex);
                var event = new mt.common.Event({case: curCase});

                curCase.attributes[name] = value;

                event.type = mt.stats.EVENT_DATA_UPDATE;
                event.sourceId = this.toolId;
                eventingService.publishToSubscriber(ns.TOPIC_STATS_NOTIFY_TABLE, event, this.resultsToolId);
            }
        };
        ProbabilityAPI.prototype.addSourceAttributes = function() {
            _(this.sourceCaseData.getAttributeHeaders()).each(function (sourceAttributeHeader) {
                this.resultsCaseData.addAttribute(sourceAttributeHeader.display,sourceAttributeHeader.type);
            },this);
        };
        ProbabilityAPI.prototype.addSourceCaseToResults = function(sourceCase,resultsCase) {
            _(sourceCase.attributes).each(function (sourceAttribute, key) {
                resultsCase.attributes[key] = sourceAttribute;
            });
            resultsCase.attributes.SourceIndex = sourceCase.index;
            var event = new mt.common.Event({case: resultsCase});
            event.type = mt.stats.EVENT_DATA_UPDATE;
            event.sourceId = this.toolId;
            eventingService.publishToSubscriber(ns.TOPIC_STATS_NOTIFY_TABLE, event, this.resultsToolId);
        };
        ProbabilityAPI.prototype.clearTable = function(){
            if(this.resultsCaseData.clear){
                this.resultsCaseData.clear();
                var event = new mt.common.Event();
                event.sourceId = this.toolId;
                event.type = mt.stats.EVENT_CLEAR_TABLE;
                eventingService.publishToSubscriber(ns.TOPIC_STATS_NOTIFY_TABLE, event, this.resultsToolId);
            }
        };
        ProbabilityAPI.prototype.resetGraph = function(){
            var event = new mt.common.Event();
            event.sourceId = this.toolId;
            event.type = mt.stats.EVENT_RESET_GRAPH;
            eventingService.publishToSubscriber(ns.TOPIC_STATS_NOTIFY_TABLE, event, this.resultsToolId);
        };
        ProbabilityAPI.prototype.addCoinCalculatedTraits =
            function(caseIndex, resultsArray, orderedList, unorderedList, countHeads, countTails ){

            if(unorderedList){
                if(caseIndex === 1){
                    this.addAttribute(UNORD_LIST, mt.stats.STATS_FIELD_TYPE_CATEGORICAL);
                }
                this.addDataPoint( caseIndex, UNORD_LIST,  resultsArray.join(',') );
            }

            if(orderedList){
                if(caseIndex === 1){
                    this.addAttribute(ORD_LIST, mt.stats.STATS_FIELD_TYPE_CATEGORICAL);
                }
                this.addDataPoint(caseIndex, ORD_LIST,  resultsArray.sort().join(',') );
            }


            if(countHeads){
                if(caseIndex === 1){
                    this.addAttribute(CNT_HEADS, mt.stats.STATS_FIELD_TYPE_NUMERIC);
                }
                this.addDataPoint( caseIndex, CNT_HEADS,  countItems(resultsArray, 'H') );
            }

            if(countTails){
                if(caseIndex === 1){
                    this.addAttribute(CNT_TAILS, mt.stats.STATS_FIELD_TYPE_NUMERIC);
                }
                this.addDataPoint( caseIndex, CNT_TAILS,  countItems(resultsArray, 'T') );
            }

        };
        ProbabilityAPI.prototype.addCardCalculatedTraits =
            function(caseIndex, resultsArray, values, valuesAndSuits, colorCountObj, suitCountObj){
            function cardSort(a, b) {
                var faces = ['ace','jack','queen','king'];
                if( a.toLowerCase() === 'ace'){ return -1;}//aces first
                if( b.toLowerCase() === 'ace'){ return 1; }//aces first
                if( $.isNumeric(a) && $.isNumeric(b) ){ return (parseInt(a,10) < parseInt(b,10) ) ? -1 : 1; }//numbers compared
                if( $.isNumeric(a) ){ return -1; }//numbers before faces
                if( $.isNumeric(b) ){ return 1; }//numbers before faces
                return( faces.indexOf( a.toLowerCase() ) < faces.indexOf( b.toLowerCase() ) )?-1:1;//faces by index
            }

            if(values){
                if(caseIndex === 1){
                    this.addAttribute(CARD_VAL, mt.stats.STATS_FIELD_TYPE_CATEGORICAL);
                }
                this.addDataPoint( caseIndex,CARD_VAL,  getArrayOfAttributes(resultsArray,'value').sort(cardSort).join(',') );
            }

            if(valuesAndSuits){
                if(caseIndex === 1){
                    this.addAttribute(CARD_VALS_SUITS, mt.stats.STATS_FIELD_TYPE_CATEGORICAL);
                }
                this.addDataPoint(caseIndex,CARD_VALS_SUITS,$.map(resultsArray,function(card){ return card.value+'-'+card.suit; }).join(',') );
            }


            if(colorCountObj.red){
                if(caseIndex === 1){
                    this.addAttribute(COUNT_RED, mt.stats.STATS_FIELD_TYPE_NUMERIC);
                }
                this.addDataPoint( caseIndex, COUNT_RED,  countItemsWithMatchingAttrs(resultsArray, 'color', 'red') );
            }

            if(colorCountObj.black){
                if(caseIndex === 1){
                    this.addAttribute(COUNT_BLK, mt.stats.STATS_FIELD_TYPE_NUMERIC);
                }
                this.addDataPoint( caseIndex, COUNT_BLK,  countItemsWithMatchingAttrs(resultsArray, 'color', 'black') );
            }

            if(suitCountObj.hearts){
                if(caseIndex === 1){
                    this.addAttribute(COUNT_HRT, mt.stats.STATS_FIELD_TYPE_NUMERIC);
                }
                this.addDataPoint( caseIndex, COUNT_HRT,  countItemsWithMatchingAttrs(resultsArray, 'suit', 'hearts') );
            }

            if(suitCountObj.spades){
                if(caseIndex === 1){
                    this.addAttribute(COUNT_SPD, mt.stats.STATS_FIELD_TYPE_NUMERIC);
                }
                this.addDataPoint( caseIndex, COUNT_SPD,  countItemsWithMatchingAttrs(resultsArray, 'suit', 'spades') );
            }

            if(suitCountObj.diamonds){
                if(caseIndex === 1){
                    this.addAttribute(COUNT_DIA, mt.stats.STATS_FIELD_TYPE_NUMERIC);
                }
                this.addDataPoint( caseIndex, COUNT_DIA,  countItemsWithMatchingAttrs(resultsArray, 'suit', 'diamonds') );
            }

            if(suitCountObj.clubs){
                if(caseIndex === 1){
                    this.addAttribute(COUNT_CLB, mt.stats.STATS_FIELD_TYPE_NUMERIC);
                }
                this.addDataPoint( caseIndex, COUNT_CLB,  countItemsWithMatchingAttrs(resultsArray, 'suit', 'clubs') );
            }
        };
        ProbabilityAPI.prototype.addGenericCalculatedTraits = function(caseIndex, resultsArray, orderedList, unorderedList, docount, types){
            var self = this;
            if(unorderedList){
                if(caseIndex === 1){
                    this.addAttribute(UNORD_LIST, mt.stats.STATS_FIELD_TYPE_CATEGORICAL);
                }
                this.addDataPoint( caseIndex, UNORD_LIST, getArrayOfAttributes(resultsArray,'name').join(',') );
            }

            if(orderedList){
                if(caseIndex === 1){
                    this.addAttribute(ORD_LIST, mt.stats.STATS_FIELD_TYPE_CATEGORICAL);
                }
                this.addDataPoint(caseIndex, ORD_LIST,  getArrayOfAttributes(resultsArray,'name').sort().join(',') );
            }

            if(docount){
                types.forEach(function(type){
                    if(caseIndex === 1){
                        self.addAttribute(type.name,mt.stats.STATS_FIELD_TYPE_NUMERIC);
                    }
                    self.addDataPoint(caseIndex,type.name,countItemsWithMatchingAttrs(resultsArray,'name',type.name));
                });
            }

        };
        ProbabilityAPI.prototype.addDiceTraits = function(caseIndex, resultsArray, orderedList, unorderedList, docount, types, getsum){
            var self = this;
            if(unorderedList){
                if(caseIndex === 1){
                    this.addAttribute(UNORD_LIST, mt.stats.STATS_FIELD_TYPE_CATEGORICAL);
                }
                this.addDataPoint( caseIndex, UNORD_LIST, resultsArray.join(',') );
            }

            if(orderedList){
                if(caseIndex === 1){
                    this.addAttribute(ORD_LIST, mt.stats.STATS_FIELD_TYPE_CATEGORICAL);
                }
                this.addDataPoint(caseIndex, ORD_LIST,  resultsArray.sort().join(',') );
            }

            var sum = 0;
            if(getsum){
                resultsArray.forEach(function(result){
                    sum += parseInt(result, 10);
                });
                if(caseIndex === 1){
                    this.addAttribute(SUM, mt.stats.STATS_FIELD_TYPE_NUMERIC);
                }
                this.addDataPoint(caseIndex, SUM, sum );
            }

            if(docount){
                //if it's our fist case, grab faces we're counting, sort them and add attributes
                if(caseIndex === 1){
                    var facesToAdd = [];
                    types.forEach(function(type){
                        type.faces.forEach(function(face){
                            facesToAdd.push(face);
                        });
                    });

                    facesToAdd.sort().forEach(function(face){
                        self.addAttribute('Count-'+face, mt.stats.STATS_FIELD_TYPE_NUMERIC);
                    });
                }


                types.forEach(function(type){
                    type.faces.forEach(function(face){
                        var matches = 0;
                        resultsArray.forEach(function(result){
                            if(result === face ){
                                matches++;
                            }
                        });
                        self.addDataPoint(caseIndex,'Count-'+face, matches);
                    });
                });
            }

        };
        ProbabilityAPI.prototype.setToolId = function(toolId) {
            this.toolId= toolId;
        };
        ProbabilityAPI.prototype.setResultsToolId = function(toolId) {
            this.resultsToolId= toolId;
        };
        ProbabilityAPI.prototype.setResultsCaseData = function(caseData) {
            this.resultsCaseData= caseData;
        };
        ProbabilityAPI.prototype.setSourceCaseData = function(caseData) {
            this.sourceCaseData= caseData;
        };
        ProbabilityAPI.prototype.getSourceCaseData = function() {
            return this.sourceCaseData;
        };
        return {
            getInstance: function() {
                return new ProbabilityAPI();
            }
        };
    }]);
})(window.mt.stats);

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
