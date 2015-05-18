window.mtConfig =  {
    realtimeUrl: 'http://localhost:8000/mt',
    localStoragePersistence: true,
    closeButtonInTitleBar: true,
    noOverlap: true,
    disableOverlays: true
};



if (!window.mt) {
    window.mt = {};
    window.mt.version = '0.10.3';
    window.mt.revision = '';
}
if (!window.mt.common) {
    window.mt.common = {};
}

window.mt.loadModules = [];

(function (ns) {
    'use strict';

    ns.TEACHER_ROLE = 'teacher';
    ns.STUDENT_ROLE = 'student';
    ns.CONTENT_AUTHOR_ROLE = 'contentAuthor';

    ns.TOOL_SAVE_REQUEST_TOPIC = 'toolSaveRequest';
    ns.TOOL_SAVE_RESPONSE_TOPIC = 'toolSaveResponse';
    ns.TOOL_LOAD_TOPIC = 'toolLoad';
//    ns.TOOL_LOAD_REQUEST_TOPIC = 'toolLoadRequest';

    ns.BROADCAST_TOOL_REQUEST_TOPIC = 'workspace.broadcastToolRequest';

    ns.TOOL_CATEGORY = 'instantiated_tool';
    ns.GLOBAL_TOOL_CATEGORY = 'global_tool';

    ns.TYPE_TABLE = 'table';
    ns.TYPE_CONTINGENCY_TABLE = 'contingencyTable';
    ns.TYPE_GRAPH = 'graph';
    ns.TYPE_RATIO_BOX = 'ratioBox';
    ns.TYPE_NUMBER_LINE = 'numberLine';
    ns.TYPE_PERCENT_BAR = 'percentBar';
    ns.TYPE_NUMBER_HUNT = 'numberHunt';
    ns.TYPE_MIC_DROP = 'micDrop';
    ns.TYPE_WORKSPACE = 'workspace';
    ns.TYPE_RESULTS_TABLE = 'resultsTable';
    ns.TYPE_POLL = 'poll';
    ns.TYPE_RATIOTABLE = 'ratioTable';
    ns.TYPE_CLASS_BAND = 'classBand';
    ns.TYPE_GAME_BUILDER = 'gameBuilder';
    ns.TYPE_STATS = 'stats-tool';
    ns.TYPE_STATS_GRAPH = 'statsGraph';
    ns.TYPE_PROBABILITY_TOOL = 'probabilityTool';
    ns.TYPE_DATA_SAMPLER = 'dataSampler';
    ns.TYPE_LEMONS = 'lemonsAndCups';
    ns.TYPE_TRY_IT = 'tryIt';
    ns.TYPE_MAIN_IDEA = 'mainIdea';
    ns.TYPE_NUMBER_MACHINE = 'numberMachine';
    ns.TYPE_DAISY_CHAIN = 'daisyChain';
    ns.TYPE_IMAGE = 'image';

    //sub types
    ns.TYPE_POINT = 'point';
    ns.TYPE_POINT_SET = 'pointSet';
    ns.TYPE_LINE = 'line';
    ns.TYPE_DROP_LINE = 'dropLine';
    ns.TYPE_LINE_SEGMENT = 'lineSegment';
    ns.TYPE_RAY = 'ray';
    ns.TYPE_AXIS_LABEL = 'axisLabel';
    ns.TYPE_TICK_MARK = 'tickMark';
    ns.TYPE_TABLE_ROW = 'tableRow';
    ns.TYPE_TABLE_COLUMN = 'tableColumn';
    ns.TYPE_TABLE_CELL = 'tableCell';
    ns.TYPE_TABLE_MEAN_COLUMN = 'tableMeanColumn';
    ns.TYPE_TABLE_HEADER = 'tableHeader';
    ns.TYPE_TABLE_UPPER_HEADER = 'tableUpperHeader';
    ns.TYPE_CORRECTNESS = 'correctness';
    ns.TYPE_FRACTION = 'fraction';
    ns.TYPE_EQUATION = 'equation';

    ns.INPUT_TYPE_KEYBOARD = 'keyboard';
    ns.INPUT_TYPE_CUSTOM = 'custom';
    ns.INPUT_TYPE_HANDWRITING = 'handwriting';

    ns.WORKFLOW_AGGREGATE_POLL = 'workflowAggregatePoll';

    //workspace save interval in ms
    ns.SAVE_INTERVAL = 5000;

    // interval to check for new content
    ns.FIND_CONTENT_INTERVAL = 30000;

    ns.LOCAL_STORAGE_SESSION_ID = 'localStorageSessionId';
    ns.LOCAL_STORAGE_USER_ID_KEY = 'userId';

    ns.EVENT_TABLE_REQUEST_DATA = 'table.publishData.request';
    ns.EVENT_TABLE_PUBLISH_DATA = 'table.publishData.response';

    ns.EVENT_WORKSPACE_PUBLISH_DATA = 'workspace.publishData';

    ns.EVENT_CONTINGENCY_TABLE_OPEN_WITH_DATA = 'contingencyTable.openWithData.request';
    ns.EVENT_CONTINGENCY_TABLE_REQUEST_IMPORT_DATA = 'contingencyTable.loadData.request';

    //workspace events
    ns.EVENT_CREATE_TOOL = 'eventCreateTool';
    ns.EVENT_REMOVE_TOOL = 'eventRemoveTool';

    //tool export
    ns.EVENT_EXPORT_TABLE_TO_GRAPH = 'eventExportTableToGraph';
    ns.EVENT_EXPORT_NUMBERLINE_TO_GRAPH = 'eventExportNumberlineToGraph';
    ns.EVENT_EXPORT_GRAPH_TO_TABLE = 'eventExportGraphToTable';
    ns.EVENT_EXPORT_POLL_TO_TABLE = 'eventExportPollToTable';

    //table <-> graph linking
    ns.EVENT_LINK_GRAPH_FROM_TABLE = 'eventLinkGraphFromTable';
    ns.EVENT_LINK_TABLE_FROM_GRAPH = 'eventLinkTableFromGraph';

    ns.EVENT_NETWORK_CONNECTION_STATUS = 'eventNetworkConnectionStatus';

    //minimum amount of the tools header that should remain in the viewport when dragging
    ns.TOOL_DRAG_BUFFER = 100;

    //used for approx equals
    ns.DEFAULT_EPS = 0.00001;

    ns.MY_SCRIPT_KEY = '779bda68-877e-4f6a-93d9-ba315ec05db7';
    ns.MY_SCRIPT_EQN_URL = 'https://myscript-webservices.visionobjects.com/api/myscript/v2.0/equation/doSimpleRecognition.json';
    ns.MY_SCRIPT_TEXT_URL = 'https://myscript-webservices.visionobjects.com/api/myscript/v2.0/hwr/doSimpleRecognition.json';

    ns.EDIT_MODE_HWR = 'handwriting_editing';
    ns.EDIT_MODE_SYSTEM = 'system_keyboard_editing';
    ns.EDIT_MODE_CUSTOM = 'custom_keyboard_editing';
    //TODO - this is the edit mode setting and belongs in a property file
    ns.EDIT_MODE = ns.EDIT_MODE_CUSTOM;
    ns.EDIT_MODE_DEFAULT = ns.EDIT_MODE_CUSTOM;

    mt.common.setInputMode = function(mode) {
        ns.EDIT_MODE = mode;
    };
    //ns.EDIT_MODE = ns.EDIT_MODE_SYSTEM;
    //ns.EDIT_MODE = ns.EDIT_MODE_CUSTOM;

    ns.RESET_WINDOW_POSITION = 'reset_window_position';

    ns.MENU_ITEM_ACTIVE_COLOR = 'black';
    ns.MENU_ITEM_INACTIVE_COLOR = 'gray';

    ns.HW_MODE_TEXT = 'hw_mode_text';
    ns.HW_MODE_EQN = 'hw_mode_eqn';
    ns.HW_MODE_EQN_EXPRESSION_LIST = 'hw_mode_eqn_expression_list';
    ns.HW_MODE_EQN_EXPRESSION_LIST_EQN = 'hw_mode_eqn_expression_list_eqn';

    // graphing
    ns.DEFAULT_PARTITION_RANGE_END = 5.0;
    ns.DEFAULT_PARTITION_RANGE_START = -5.0;
    ns.DEFAULT_NUM_PARTITIONS = 5;
    //this is the main graph touch threshold
    ns.TOUCH_SIZE = 60;

    ns.TICK_MARK_SIZE = 20;

    ns.GRAPH_MODE_STANDARD = 'graphModeStandard';
    ns.GRAPH_MODE_NUMBERLINE = 'graphModeNumberline';
    ns.GRAPH_MODE_PERCENTBAR = 'graphModePercentbar';
    ns.GRAPH_MODE_NUMBERHUNT = 'graphModeNumberhunt';
    ns.GRAPH_MODE_MICDROP = 'graphModeMicdrop';

    ns.GRAPH_SELECTED_CLASS = 'mt-graph-selected';
    ns.GRAPH_HIDDEN_CLASS = 'mt-graph-hidden';
    ns.GRAPH_POINT_CLASS = 'mt-point';
    ns.GRAPH_POINT_LABEL_CLASS = 'mt-point-label';
    ns.GRAPH_LINE_CLASS = 'mt-line';
    ns.GRAPH_LINE_SELECTED_CLASS = 'mt-line-selected';
    ns.GRAPH_X_AXIS_CLASS ='mt-x-axis';
    ns.GRAPH_Y_AXIS_CLASS = 'mt-y-axis';
    ns.GRAPH_GLIDER_CLASS = 'mt-glider';
    ns.GRAPH_ORIGIN_CLASS = 'mt-origin-tick';

    ns.POINT_MENU_REMOVE_POINT = 'Remove Point';
    ns.POINT_MENU_DRAW_LINE_SEGMENT = 'Draw Line Segment';
    ns.POINT_MENU_DRAW_RAY = 'Draw Ray';
    ns.POINT_MENU_DRAW_LINE = 'Draw Line';
    ns.POINT_MENU_DROP_LINE_X = 'Drop Line to X';
    ns.POINT_MENU_DROP_LINE_Y = 'Drop Line to Y';

    ns.LINE_MENU_REMOVE_LINE = 'Remove Line';
    ns.LINE_MENU_REMOVE_ALL_LINES = 'Remove All Lines';
    ns.LINE_MENU_ADD_GLIDER = 'Add Glider';
    ns.LINE_MENU_REMOVE_GLIDER = 'Remove Glider';

    ns.PARTITION_MENU_DELETE = 'Delete Partition';
    ns.PARTITION_MENU_EDIT_PARTITIONS = 'Edit Partitions';
    ns.PARTITION_MENU_HIDE_SHADING = 'Hide Shading';

    ns.PARTITION_MENU_COPY = 'Copy';
    ns.PARTITION_MENU_DRAG = 'Drag';

    //TODO these should go into css
    ns.GRAPH_AXIS_COLOR = 'black';
    ns.GRAPH_BIN_COLOR = '#13b5ea';
    ns.GRAPH_DIVIDER_COLOR = '#FB3A11';
    ns.GRAPH_AXIS_WIDTH = 1;
    ns.GRAPH_LINE_WIDTH = 2;
    ns.GRAPH_POINT_COLOR = '#f39121';
    ns.GRAPH_TICK_MARK_SIZE = 10;
    ns.GRAPH_LINE_COLOR = 'black';
    ns.GRAPH_POINT_RADIUS = 8;
    ns.GRAPH_SELECTED_POINT_RADIUS = 14;

    //percent bar options
    ns.PERCENT_BAR_HEIGHT = 40;
    ns.PERCENT_BAR_POINT_WIDTH = 1;
    ns.PERCENT_BAR_POINT_WIDTH_SELECTED = 5;

    //number hunt
    ns.NUMBER_HUNT_POINT_RADIUS = 10;
    ns.NUMBER_HUNT_POINT_CLASS = 'mt-hunt-point';
    ns.NUMBER_HUNT_MARKER_CLASS = 'mt-hunt-marker';
    ns.NUMBER_HUNT_PARTITION_LABEL = 'mt-partition-label';
    ns.NUMBER_HUNT_LABEL = 'mt-hunt-label';
    ns.NUMBER_HUNT_LABEL_POINT = 'mt-hunt-label-point';
    ns.NUMBER_HUNT_ERROR_CLASS = 'mt-hunt-error';

    //mic drop
    ns.MIC_DROP_LABEL = 'micDropLabel';

    //zoom pinch constants
    ns.PINCH_SCALE_FACTOR = 1;
    ns.MAX_SCALE_FACTOR = 1.1;
    ns.MIN_SCALE_FACTOR = 0.9;
    ns.SCALE_TOLERANCE = 0.03;

    ns.GRAPH_ARROW_LENGTH = 20;
    ns.GRAPH_ARROW_RATIO = 0.3;

    ns.GRAPH_TICK_LENGTH = 10;

    //numberline graph options
    ns.NUMBERLINE_MENU_SET_LABEL = 'Set Label';
    ns.NUMBERLINE_FRAC_MODE = 'Fraction';
    ns.NUMBERLINE_DEC_MODE = 'Decimal';
    ns.NUMBERLINE_FRAC_DEC_MODE = 'Fraction/Decimal';
    ns.GRAPH_SNAP_MODE = 'Snap';
    ns.GRAPH_NO_SNAP_MODE = 'No snap';
    ns.GRAPH_PROXIMITY_SNAP = 'Proximity';
    ns.PERCENT_BAR_ZOOM = 'Zoom';
    ns.PERCENT_BAR_STACK = 'Duplicate';

    ns.PERCENT_BAR_MODE_NONE = 'None';
    ns.PERCENT_BAR_MODE_VALUE = 'Value';
    ns.PERCENT_BAR_MODE_PERCENT = 'Percent';
    ns.PERCENT_BAR_MODE_ALL = 'All';

    ns.GRAPH_SNAP_THRESHOLD = 15;

    ns.GRAPH_TYPE_POINT = 'point type';
    ns.GRAPH_TYPE_LINE = 'line type';
    ns.GRAPH_TYPE_GLIDER = 'glider type';
    ns.GRAPH_TYPE_POINT_SET = 'point set type';
    ns.GRAPH_TYPE_EQUATION = 'equation type';
    ns.GRAPH_TYPE_PARTITION = 'partition type';
    ns.GRAPH_TYPE_PERCENT_MAX = 'percent max';

    ns.LINE_INNER_TYPE_LINE = 'innerTypeLine';
    ns.LINE_INNER_TYPE_LINE_SEGMENT = 'innerTypeLineSegment';
    ns.LINE_INNER_TYPE_RAY = 'innerTypeRay';
    ns.LINE_INNER_TYPE_DROP_LINE_X = 'innerTypeDropLineX';
    ns.LINE_INNER_TYPE_DROP_LINE_Y = 'innerTypeDropLineY';
    ns.LINE_INNER_TYPES = [ns.LINE_INNER_TYPE_LINE, ns.LINE_INNER_TYPE_LINE_SEGMENT, ns.LINE_INNER_TYPE_RAY, ns.LINE_INNER_TYPE_DROP_LINE_X, ns.LINE_INNER_TYPE_DROP_LINE_Y];

    ns.GRAPH_MAX_TICK_LABELS = 20;
    ns.GRAPH_MAX_TICKS = 50;
    //the abs value of max/min that is considered high
    ns.GRAPH_HIGH_RANGE = 100;
    //label filtering applied in the high range
    ns.GRAPH_HIGH_MAX_TICK_LABELS = 10;
    //limit the minimum range while we are displaying to 2DP
    ns.GRAPH_MIN_RANGE = 0.01;

    ns.GRAPH_MAX_RANGE = 100000;

    ns.GRAPH_CASE_RADIUS = 10;

    ns.GRAPH_DEFAULT_PARTITIONS = 5;

    ns.GRAPH_RENDER_MIN_X = 45;
    ns.GRAPH_RENDER_MIN_Y = 362;
    ns.GRAPH_RENDER_MAX_X = 405;
    ns.GRAPH_RENDER_MAX_Y = 45;

    ns.GRAPH_MEAN_COLOR = '#B728E6';
    ns.GRAPH_MEDIAN_COLOR = '#FF8800';
    ns.GRAPH_MAD_COLOR = '#B728E6';
    ns.PARTITION_COLORS = ['#fa4848', '#f39121', '#f6ef80', '#61d382', '#66b0ef', 'violet', 'skyblue', 'tomato']; //colors changed according to sales deck MH
    // ['#13b5ea', '#8dc63f', '#f27220', '#4b63ae', '#fcee41', 'cyan', 'orange', 'magenta'];

    ns.TABLE_EVENT_DATA_MODEL_UPDATED = 'tableEventDataModelUpdated';

    ns.PERCENT_BAR_MIN_WIDTH = 300;

    //used for optimizing views for ipad in landscape more
    ns.IPAD_WIDTH = 980;
    ns.IPAD_HEIGHT = 676;
    ns.NAV_HEIGHT = 40;

    //workspace nav constants
    ns.TOOLSPACE_VIEWPORTS = 3;
    ns.ZOOM_LEVELS = [1, 0.66, 0.35];
    //ns.ZOOM_LEVELS = [1];

    ns.PERSISTENCE_SERVICE_ENABLED = false;

    //validator types
    ns.VALIDATOR_MATCH = 'match';
    ns.VALIDATOR_RATIO = 'ratio';
    ns.VALIDATOR_RANGE = 'range';
    ns.VALIDATOR_UNIQUENESS = 'uniqueness';

    //qualitative
    ns.VALIDATOR_IGE_RATIOTABLE_BASE_RATIO_QUAL = 'igeRatioTableBaseRatioQualitative';
    ns.VALIDATOR_IGE_RATIOTABLE_BASE_RATIO_FIRST = 'igeRatioTableBaseRatioFirst';
    ns.VALIDATOR_IGE_RATIOTABLE_BASE_RATIO_GCF = 'igeRatioTableBaseRatioGcf';
    ns.VALIDATOR_IGE_RATIOTABLE_UNIT_RATIO_COUNT = 'igeRatioTableUnitRatioCount';
    ns.VALIDATOR_IGE_RATIOTABLE_UNIT_RATIO_GENERALIZATION = 'igeRatioTableUnitRatioGeneralization';
    ns.VALIDATOR_IGE_RATIOTABLE_UNIT_RATIO_FIRST = 'igeRatioTableUnitRatioFirst';
    ns.VALIDATOR_IGE_RATIOTABLE_UNIT_RATIO_INCOMPLETE = 'igeRatioTableUnitRatioIncomplete';
    ns.VALIDATOR_IGE_RATIOTABLE_CATEGORIZATION = 'igeRatioTableCategorization';

    //quantitative
    ns.VALIDATOR_IGE_RATIOTABLE_LEFT_UNIT_RATIO = 'igeRatioTableLeftUnitRatio';
    ns.VALIDATOR_IGE_RATIOTABLE_RIGHT_UNIT_RATIO = 'igeRatioTableRightUnitRatio';
    ns.VALIDATOR_IGE_RATIOTABLE_BASE_RATIO = 'igeRatioTableBaseRatio';
    ns.VALIDATOR_IGE_RATIOTABLE_EXACT_VALUE_LEFT = 'igeRatioTableExactValueLeft';
    ns.VALIDATOR_IGE_RATIOTABLE_EXACT_VALUE_RIGHT = 'igeRatioTableExactValueRight';
    ns.VALIDATOR_IGE_RATIOTABLE_ALL_RATIOS = 'igeRatioTableAllRatios';
    ns.VALIDATOR_IGE_RATIOTABLE_LESSER_RATIOS = 'igeRatioTableLesserRatios';
    ns.VALIDATOR_IGE_RATIOTABLE_GREATER_RATIOS = 'igeRatioTableGreaterRatios';

    ns.TOOL_ACCESS_RESTRICTED = 'restricted';

    ns.NW = 'nw';
    ns.N = 'n';
    ns.NE = 'ne';
    ns.E = 'e';
    ns.SE = 'se';
    ns.S = 's';
    ns.SW = 'sw';
    ns.W = 'w';
    ns.DIRECTIONS = [ns.NW, ns.N, ns.NE, ns.E, ns.SE, ns.S, ns.SW, ns.W];

    //PEN DATA MODEL
    ns.PEN_WORKSPACE_GROUP = 'workspace';

    ns.TEST_SECTION = 'testSection';

    // TODO need more added here
    ns.ITEM_TYPE_QUESTION = 'question';
    ns.ITEM_TYPE_DESCRIPTION = 'description';
    ns.ITEM_TYPE_MEDIA = 'media';
    ns.ITEM_TYPE_IMAGE = 'image';
    ns.ITEM_TYPE_APPLET = 'applet';
    ns.ITEM_TYPE_TOOL = 'tool';
    ns.ITEM_TYPE_QUESTION_SET = 'questionSet';
    ns.ITEM_TYPE_JUMP_START = 'jumpStart';
    ns.ITEM_TYPE_EXTENSION = 'extension';

    ns.ITEM_STACK_TYPE_TASK = 'task';
    ns.ITEM_STACK_TYPE_DISCUSSION = 'discussion';

    ns.DEFAULT_SPACE_ID = 'canvas';
    ns.TEACHER_INBOX_SPACE_ID = 'teacherInbox';

    ns.TOOL_OFFSETS = [[100, 175], [500, 175], [100, 400], [500, 400]]; // 100 changed to 175 for first two until palette menus are removed
    //ns.TOOL_OFFSETS = [[200, 200], [400, 200], [600, 200], [200, 600], [400, 600], [600, 600]];

    ns.PALETTE_MENU_CALLBACK_NAMES = ['broadcast', 'showControls', 'toggleLockMode', 'submit', 'close', 'exportData', 'duplicate', 'clear', 'link', 'addLocalPaletteItem', 'getPos', 'setPos', 'sendToWorkspace'];

    //import/export
    ns.TOOL_EXPORT_REQUEST_TOPIC = 'toolExportRequest';
    ns.TOOL_EXPORT_RESPONSE_TOPIC = 'toolExportResponse';
    ns.TOOL_IMPORT_TOPIC = 'toolImport';
    ns.IMPORT_MODE_APPEND = 'append';
    ns.IMPORT_MODE_AGGREGATE = 'aggregate';

    //gesture modes
    ns.GESTURE_MODE_DEFAULT = 'default';
    ns.GESTURE_MODE_LINE = 'lineSegment';
    ns.GESTURE_MODE_PARTITION = 'partition';

    //time for notification ribbon to dismiss itself
    ns.NOTIFICATION_TIMEOUT = 3000;

    //postmessage commands
    ns.PMCMD_OPENTOOL = 'opentool';                //open a tool in the workbook from CDA
    ns.PMCMD_GETTOOLS = 'gettools';                //get workbook tools json from CDA
    ns.PMCMD_CLEARTOOL = 'cleartools';             //clear tools in workbook
    ns.PMCMD_SETSIZE = 'setsize';                  //set the size of a container in the CDA (for inline tools)
    ns.PMCMD_SETABSTRACT = 'setabstract';          //set abstract in workbook
    ns.PMCMD_SETSUBMISSIONS = 'setsubmissions';    //set submission data in CDA

    ns.TOOL_NUDGE_MARGIN = 8; //margin applied to tools when applying overlap avoidance algorithm
    ns.WORKSPACE_GRID_SIZE = 22; //margin applied to tools when applying overlap avoidance algorithm
    ns.TOOL_INIT_POS = [-999, -999]; //tool position on initialization
    ns.TOOL_ANIMATE_DISTSQ = 400;
})(window.mt.common);

(function (ns) {
    'use strict';

    ns.createGuid = function () {
        /*jshint bitwise:false */
        // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
        return 'mtxxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    };

    ns.toBase64 = function (unicodeString) {
        return btoa(unescape(encodeURIComponent(unicodeString)));
    };

    /* global escape */
    ns.fromBase64 = function (base64String) {
        return decodeURIComponent(escape(atob(base64String)));
    };

    ns.isNumeric = function (num) {
        return !(String(num).match(/^\s*$/) || isNaN(num));
    };

    //only works for precisions of 1 or less (.1, .01, etc.)
    ns.toPrecision = function (currVal, precision) {
        var noUnits = parseFloat(currVal);
        var multiplier = Math.pow(10, precision);
        return Math.round(noUnits * multiplier)/multiplier;

        //this causes rounding errors, especially visible on 5s
        //return parseFloat(rounded.toFixed(precision));
    };

    ns.subclass = function (constructor, superConstructor) {
        function SurrogateConstructor() {}

        SurrogateConstructor.prototype = superConstructor.prototype;

        var prototypeObject = new SurrogateConstructor();
        prototypeObject.constructor = constructor;

        constructor.prototype = prototypeObject;
    };

    ns.approxEquals = function (val1, val2, eps) {
        if(eps === undefined) {
            eps = ns.DEFAULT_EPS;
        }
        return Math.abs(val1 - val2) < eps;
    };

    ns.tag = function (items, properties) {
        _(items).each(function (item) {
            _(item).extend(properties);
        });
    };

    //http://blog.ideashower.com/post/15147136549/leastgreatest-common-mulitple-lcmgcm-in-php-and-javascri
    ns.gcf = function($a, $b) {
        return ( $b === 0 ) ? ($a):( ns.gcf($b, $a % $b) );
    };

    ns.lcm = function(a, b) {
        return ( a / ns.gcf(a,b) ) * b;
    };

    //http://stackoverflow.com/questions/23287/prime-factors
    //Returns all the prime factors of a positive integer
    ns.primeFactorization = function(n) {
        var factors = [];
        var d = 2;
        while (n > 1) {
            while (n % d === 0) {
                factors.push(d);
                n /= d;
            }
            d = d + 1;
            if (d * d > n) {
                if (n > 1) {
                    factors.push(n);
                }
                break;
            }
        }
        return factors;
    };

    ns.isRole = function(target) {
        return mt.common.TEACHER_ROLE === target || mt.common.STUDENT_ROLE === target || mt.common.CONTENT_AUTHOR_ROLE === target;
    };

    ns.calculateArithmeticMean = function (a, b) {
        return (a + b) / 2;
    };

    ns.calculateGeometricMean = function (a, b) {
        return Math.pow(a * b, 0.5);
    };

    ns.isEmptyString = function(str) {
        // console.log(str);
        return String(str).match(/^\s*$/); //string contains nothing but whitespace
    };

    // see: http://stackoverflow.com/a/5624139/2961247
    ns.hexToRgb = function(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });

        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : null;
    };

    //1d interval overlap check
    ns.checkIntervalOverlap = function (minA, maxA, minB, maxB) {
        return (minA <= minB && maxA >= maxB) || (minA >= minB && maxA <= maxB) || (minA >= minB && minA <= maxB) || (maxA >= minB && maxA <= maxB);
    };
    //2d overlap check
    ns.checkBoxOverlap = function (posA, maxA, posB, maxB) {
        return mt.common.checkIntervalOverlap(posA[0], maxA[0], posB[0], maxB[0]) && mt.common.checkIntervalOverlap(posA[1], maxA[1], posB[1], maxB[1]);
    };

    //returns dist sq between 2 points [x,y]
    ns.getDistSq = function(posA, posB) {
        return (posA[0]-posB[0])*(posA[0]-posB[0]) + (posA[1]-posB[1])*(posA[1]-posB[1]);
    };

})(window.mt.common);

(function (ns) {
    'use strict';

    // integrate underscore string functions with underscore core functions
    _.mixin(_.str.exports());

    // use mustache-style templating
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };

    // assemble required dependencies into a single module
    angular.module('mt.common', ['ui.bootstrap', 'ngAnimate'])
        .run(function (configService, $location) {
            var hostname = $location.host();

            _(configService).chain().keys().each(function (key) {
                var url = configService[key];
                if ((/localhost/).test(url)) {
                    configService[key] = url.replace('localhost', hostname);
                }
            });
        });

    /**
        A safe apply method that checks the current phase
    */
    angular.module('mt.common').provider('safeApply', function() {

        this.$get = function() {
            function safeApply(scope, fn) {
                if (scope.$root !== undefined) {
                    var phase = scope.$root.$$phase;
                    if(phase === '$apply' || phase === '$digest') {
                        if(fn && (typeof(fn) === 'function')) {
                            fn();
                        }
                    } else {
                        scope.$apply(fn);
                    }
                }
            }

            return safeApply;
        };
    });

    window.onerror = function(message, file, line, column, errorObj) {
        var maxErrors = 10;
        var errorStorageName = 'errors';

        var localErrors = localStorage.getItem(errorStorageName);
        var storedErrors = [];

        if (localErrors !== null && localErrors !== undefined) {
            storedErrors = JSON.parse(localErrors);
        }
        if (storedErrors.length >= maxErrors) {
            storedErrors.splice(0, storedErrors.length - (maxErrors - 1));
        }

        var currentdate = new Date();

        var datetime = '' +
            (currentdate.getMonth() + 1)  + '/' +
            currentdate.getDate() + '/' +
            currentdate.getFullYear() + ' @ ' +
            currentdate.getHours() + ':' +
            currentdate.getMinutes() + ':' +
            currentdate.getSeconds();

        var error = {
            type: 'onerror',
            time: datetime,
            message: message,
            file: file,
            line: line,
            column: column,
            errorObjStack: (errorObj !== undefined) ? errorObj.stack : undefined
        };
        storedErrors.push(error);
        localStorage.setItem(errorStorageName, JSON.stringify(storedErrors));
    };

})(window.mt.common);

/*
    Makes sure the workspace takes the whole screen on the iPad
    if the app is initiated portrait and turned landscape.
*/
$(document).ready(function(){
    'use strict';
    // var w = $(window);
    // var largeSide = Math.max(w.width(),w.height());
    // var smallSide = Math.min(w.width(),w.height());
    // w.bind('orientationchange', function(){
    //     var orientation = window.orientation;
    //     $('#workspace').width( (orientation === 90 || orientation === -90) ? largeSide : smallSide);
    // });

    // if(!Hammer.HAS_TOUCHEVENTS && !Hammer.HAS_POINTEREVENTS) {
    //     // Hammer.plugins.showTouches();
    //     Hammer.plugins.fakeMultitouch();
    // }
});


(function (ns) {
    'use strict';

    ns.Equation = (function () {

        //represents a linear equation parsed from a string
        function Equation(eqnString) {

            eqnString = eqnString === undefined ? '' : eqnString;

            //rhs and lhs of the equations are arrays of equationTerm objects
            var rhs = [];
            var lhs = [];
            var line;

            var parseable = true;
            var m, b, isVertical;

            this.id = ns.createGuid();

            this.updateFromExpression = function(eString) {
                rhs = [];
                lhs = [];
                m = undefined;
                b = undefined;
                line = undefined;
                isVertical = false;
                parseable = true;

                var trimmed = eString.replace(/ /g, '');
                trimmed = trimmed.replace('Y', 'y');
                trimmed = trimmed.replace('X', 'x');
                var sides = trimmed.split('=');
                if(sides.length !== 2) {
                    parseable = false;
                    return;
                }
                parseEqnSide(sides[0], lhs);
                parseEqnSide(sides[1], rhs);

                if(parseable === true) {
                    reduce();
                    calculateLine(this);
                }
            };

            function parseEqnSide(eqnSide, termArray) {
                var positiveTerms = eqnSide.split('+');
                for(var iPos in positiveTerms) {
                    var negativeTerms = positiveTerms[iPos].split('-');

                    //the first term is either a positive term or an empty term
                    if(negativeTerms[0] !== '') {
                        termArray.push(parseEqnTerm(negativeTerms[0], false));
                    }

                    //add all other negative terms
                    for(var iNeg = 1; iNeg < negativeTerms.length; iNeg++) {
                        termArray.push(parseEqnTerm(negativeTerms[iNeg], true));
                    }
                }

                if(termArray.length === 0) {
                    parseable = false;
                }
                for(var i in termArray) {
                    if(termArray[i].isParseable !== true) {
                        parseable = false;
                    }
                }
            }

            function parseEqnTerm(termString, isNegative) {
                var eqnTerm = {isParseable: true};
                if(termString === '') {
                    eqnTerm.isParseable = false;
                    return eqnTerm;
                }

                var coeffString;
                if(termString.search('x') >= 0) {
                    eqnTerm.type = 'x';
                    coeffString = termString.replace('x', '');
                } else if (termString.search('y') >= 0) {
                    eqnTerm.type = 'y';
                    coeffString = termString.replace('y', '');
                } else {
                    eqnTerm.type = 'constant';
                    coeffString = termString;
                }
                if(coeffString === '' && eqnTerm.type !== 'constant') {
                    eqnTerm.coefficient = 1;
                } else {
                    //require the coeffString is an integer String
                    //TODO - update this if we want it to support decimals
                    if(coeffString.search(/^\s*\d+\s*$/) === -1) {
                        eqnTerm.isParseable = false;
                        return eqnTerm;
                    }
                    eqnTerm.coefficient = parseFloat(coeffString);
                }

                if(isNegative === true) {
                    eqnTerm.coefficient *= -1;
                }

                return eqnTerm;
            }

            function reduce() {
                var i;

                //on lhs
                var yCoeff = 0;
                for(i in lhs) {
                    if(lhs[i].type === 'y') {
                        yCoeff += lhs[i].coefficient;
                    }
                }
                for(i in rhs) {
                    if(rhs[i].type === 'y') {
                        yCoeff -= rhs[i].coefficient;
                    }
                }

                //for rhs
                var xCoeff = 0;
                for(i in lhs) {
                    if(lhs[i].type === 'x') {
                        xCoeff -= lhs[i].coefficient;
                    }
                }
                for(i in rhs) {
                    if(rhs[i].type === 'x') {
                        xCoeff += rhs[i].coefficient;
                    }
                }

                var constants = 0;
                for(i in lhs) {
                    if(lhs[i].type === 'constant') {
                        constants -= lhs[i].coefficient;
                    }
                }
                for(i in rhs) {
                    if(rhs[i].type === 'constant') {
                        constants += rhs[i].coefficient;
                    }
                }

                if(Math.abs(xCoeff) < ns.DEFAULT_EPS && Math.abs(yCoeff) < ns.DEFAULT_EPS) {
                    parseable = false;
                } else {
                    if(Math.abs(yCoeff) < ns.DEFAULT_EPS) {
                        //vertical line case
                        m = undefined;
                        //note in this case, b is intercept with x axis
                        b = -constants/xCoeff;
                        isVertical = true;
                    } else {
                        isVertical = false;
                        m = xCoeff/yCoeff;
                        b = constants/yCoeff;
                    }
                }
            }

            function calculateLine(self) {
                var start;
                var end;
                if(isVertical) {
                    start = [b, 0];
                    end = [b, 1];
                } else {
                    start = [0, self.getYFromX(0)];
                    end = [1, self.getYFromX(1)];
                }
                line = new ns.Line({
                    id: self.id,
                    isSelected: self.isSelected,
                    start: new ns.Point({
                        x: start[0],
                        y: start[1]
                    }),
                    end: new ns.Point({
                        x: end[0],
                        y: end[1]
                    }),
                    innerType: ns.LINE_INNER_TYPE_LINE
                });
            }

            this.getGradient = function () {
                return m;
            };

            this.getIntercept = function () {
                return b;
            };

            this.toString = function () {
                var eqnText;
                if(parseable !== true) {
                    eqnText = 'error';
                } else if(isVertical === true) {
                    eqnText = 'x = ' + b;
                } else {
                    eqnText = 'y = ' + m + 'x' + ' + ' + b;
                }
                return eqnText;
            };

            this.getYFromX = function(x) {
                var val;
                if(isVertical) {
                    val = undefined;
                } else {
                    val = m*x+b;
                }
                return val;
            };

            this.getXFromY = function(y) {
                var val;
                if(isVertical) {
                    val = b;
                } else {
                    val = (y-b)/m;
                }
                return val;
            };

            this.isParseable = function() {
                return parseable;
            };

            this.type = function () {
                return ns.GRAPH_TYPE_EQUATION;
            };

            this.getLine = function () {
                if(parseable === false) {
                    return;
                }
                line.isSelected = this.isSelected;
                return line;
            };

            this.updateFromExpression(eqnString);
        }

        return Equation;
    })();

})(window.mt.common);

(function (ns) {
    'use strict';

    ns.Event = (function () {

        function Event(data) {
            if (!(this instanceof Event)) {
                return new Event(data);
            }

            // this.isPropagationStopped = false;
            // this.isImmediatePropagationStopped = false;
            this.data = data;
        }


        return Event;
    })();
})(window.mt.common);

(function (ns) {
    'use strict';

    ns.Topic = (function () {

        function Topic(name) {
            if (!(this instanceof Topic)) {
                return new Topic(name);
            }

            this.name = name;
            this.active = true;
            this.subscribers = {};
        }

        /***
         * Adds topic event handler to be called when the event is fired.
         * <p>Event handler will receive one argument - an <code>Event</code>
         * object the event was fired with.<p>
         * @method subscribe
         * @param subscriberName {String} Subscriber Name.
         * @param fn {Function} Event handler.
         */
        Topic.prototype.subscribe = function (subscriberName, fn) {
            this.subscribers[subscriberName] = fn;

            // if (this.systemEventManager != null) {
            //     var addSubscriptionTopic = this.systemEventManager.getTopic('addSubscription');
            //     if (addSubscriptionTopic != null) {
            //     var args = new Object();
            //         args.topicName = this.name;
            //         args.subscriberName = subscriberName;
            //         addSubscriptionTopic.publish(subscriberName, args);
            //     }
            // }
        };

        /***
         * Removes a topic event handler added with <code>subscribe(fn)</code>.
         * @method unsubscribe
         * @param subscriberName {String} Subscriber Name.
         */
        Topic.prototype.unsubscribe = function (subscriberName) {
            delete this.subscribers[subscriberName];

            // if (this.systemEventManager !== null) {
            //     var removeSubscriptionTopic = this.systemEventManager.getTopic('removeSubscription');
            //     if (removeSubscriptionTopic !== null) {
            //         var args = {};
            //         args.topicName = this.name;
            //         args.subscriberName = subscriberName;
            //         removeSubscriptionTopic.publish(subscriberName, args);
            //     }
            // }
        };

        /***
         * Publishes topic event notifying all subscribers.
         * @method publish
         * @param originator {String} Originator Name.
         * @param e {Event}
         *      Optional.
         *      An <code>Event</code> object to be passed to all handlers.
         */
        Topic.prototype.publish = function (e, originator) {
            e = e || new ns.Event();
            originator = originator || 'system';

            e.originator = originator;

            _.each(_.values(this.subscribers), function(subscriber) {
                subscriber.call(this, e);
            });
        };

        /***
         * Publishes topic event to a specific subscriber.
         * @method publishToSubscriber
         * @param e {Event}
         *      Optional.
         *      An <code>Event</code> object to be passed to all handlers.
         * @param originator {String} Originator Name.
         * @param subscriberId {String} The specific subscriber to publish to.
         */
        Topic.prototype.publishToSubscriber = function (e, originator, subscriberId) {
            e = e || new ns.Event();
            originator = originator || 'system';
            e.originator = originator;

            var fn = this.subscribers[subscriberId];
            if(fn !== undefined) {
                fn.call (this, e);
            } else {
                console.log('Topic.publishToSubscriber failed: no subscriber found with id ' + subscriberId);
            }
        };

        /***
         * Check for topic subscription.
         * @method isSubscribed
         * @param subscriberName {String} Subscriber Name.
         * @return subscribed {Boolean} True if subscriber is subscribed to topic.
         */
        Topic.prototype.isSubscribed = function (subscriberName) {
            for (var subscriberKey in this.subscribers) {
                if (subscriberKey === subscriberName) {
                    return true;
                }
            }
            return false;
        };


        /***
         * Lists topic subscribers.
         * @method listSubscribers
         * @return list {String} List of event type subscriber names.
         */
        Topic.prototype.listSubscribers = function () {
            return _.keys(this.subscribers);
        };


        return Topic;
    })();

})(window.mt.common);















(function (ns) {
    'use strict';

    ns.Axis = (function (spec) {

        function Axis(spec) {
            if (!(this instanceof Axis)) {
                return new Axis(spec);
            }

            spec = spec || {};

            this.id = attributeValueForKey(spec, 'id', ns.createGuid());

            var label = attributeValueForKey(spec, 'label', '');
            this.label = label instanceof mt.common.MtValue ? label : new mt.common.MtValue(label, 1, false);

            this.isXAxis = !!attributeValueForKey(spec, 'isXAxis', true);
            if (this.isXAxis === true) {
                this.min = {
                    x: getValue(spec, 'min', -10),
                    y: new mt.common.MtValue(0, 1, false)
                };
                this.max = {
                    x: getValue(spec, 'max', 10),
                    y: new mt.common.MtValue(0, 1, false)
                };
            } else {
                this.min = {
                    x: new mt.common.MtValue(0, 1, false),
                    y: getValue(spec, 'min', -10)
                };
                this.max = {
                    x: new mt.common.MtValue(0, 1, false),
                    y: getValue(spec, 'max', 10)
                };
            }

            this.majorInterval = getValue(spec, 'majorInterval', 1);
            this.minorInterval = getValue(spec, 'minorInterval', 1);

            this.anchor = getValue(spec, 'anchor', 0);

            this.fractionMode = (spec.fractionMode === undefined)? ns.NUMBERLINE_DEC_MODE: spec.fractionMode;
            this.forcedMaxTicks = spec.forcedMaxTicks;

            this.huntMode = (spec.huntMode !== undefined)? spec.huntMode: false;
            this.partitions = [];
        }

        function getValue(spec, key, defaultNum) {
            var val = spec[key];
            if (val !== undefined) {
                return val instanceof mt.common.MtValue ? val : new mt.common.MtValue(Number(val), 1, false);
            } else {
                var num = defaultNum ? defaultNum : 0;
                return new mt.common.MtValue(num, 1, false);
            }
        }

        function attributeValueForKey(attributes, key, defaultVal) {
            return attributes[key] === undefined ? defaultVal : attributes[key];
        }

        Axis.prototype.getTicks = function (mode) {
            var ticks = [];
            var fixedPoint = this.anchor.copy();
            var startX = this.isXAxis ? this.min.x : this.min.y;
            var endX = this.isXAxis ? this.max.x : this.max.y;

            if (this.huntMode === true) {
                if (this.huntLow !== undefined) {
                    ticks.push(this.huntLow);
                }
                if (this.huntHigh !== undefined) {
                    ticks.push(this.huntHigh);
                }
                return ticks;
            }

            var zeroRange = Math.abs(this.minorInterval.val()) < ns.GRAPH_MIN_RANGE;

            var delta = zeroRange? this.minorInterval.copy(): this.getAdjustedInterval(this.minorInterval);

            //move the anchor point into the axis range
            var labelDelta = this.getAdjustedInterval(mode === ns.GRAPH_MODE_NUMBERLINE? this.minorInterval: this.majorInterval, true);

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
                    ticks.push(tickVal.copy());
                }
            }

            //positive ticks
            if (!zeroRange) {
                for (tickVal = fixedPoint.copy().add(delta); tickVal.val() <= endXVal; tickVal.add(delta)) {
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
                if((mode === ns.GRAPH_MODE_NUMBERLINE || tick.isMajor) && Math.abs(tick.val() - prevLabel) > minLabelInterval) {
                    tick.drawLabel = true;
                    prevLabel = tick.val();
                }
            }
            prevLabel = anchor.val();
            for(i = anchorIndex+1; i < ticks.length; i++) {
                tick = ticks[i];
                tick.isMajor = isMajor(axis, tick);
                if((mode === ns.GRAPH_MODE_NUMBERLINE || tick.isMajor) && Math.abs(tick.val() - prevLabel) > minLabelInterval) {
                    tick.drawLabel = true;
                    prevLabel = tick.val();
                }
            }
            convertTicksToFraction(ticks, this.fractionMode !== ns.NUMBERLINE_DEC_MODE);
            return ticks;
        };

        function convertTicksToFraction(ticks, isFraction) {
            for (var i = 0; i < ticks.length; i++) {
                ticks[i].isFraction = isFraction;
                ticks[i].reduce();
            }
        }

        function isMajor(axis, tick) {
            return (tick.val() - axis.anchor.val()) % axis.majorInterval.val() === 0;
        }

        Axis.prototype.inRange = function (val) {
            var min = this.isXAxis ? this.min.x : this.min.y;
            var max = this.isXAxis ? this.max.x : this.max.y;
            return val >= min.val() && val <= max.val();

        };

        Axis.prototype.clamp = function (val) {
            var min = this.isXAxis ? this.min.x : this.min.y;
            var max = this.isXAxis ? this.max.x : this.max.y;
            var clampedVal = Math.min(val, max.val());
            clampedVal = Math.max(clampedVal, min.val());
            return clampedVal;
        };

        Axis.prototype.getNearestTick = function (value, snappingMode, excludedPartition) {
            if(snappingMode === mt.common.GRAPH_NO_SNAP_MODE) {
                console.log('no snap');
                return new mt.common.MtValue(value);
            }

            var ticks = this.getTicks();
            var closestTick;
            for (var i = 0; i < ticks.length; ++i) {
                //if value is before the first tick or after the last tick
                if (ticks[i].val() >= value || i + 1 === ticks.length) {
                    return ticks[i].copy();
                }
                if (ticks[i + 1].val() > value) {
                    var pre = value - ticks[i].val();
                    var post = ticks[i + 1].val() - value;
                    if (post < pre) {
                        closestTick = ticks[i + 1].copy();
                    } else {
                        closestTick = ticks[i].copy();
                    }
                    break;
                }
            }

            var tickDist = Math.abs(value - closestTick.val());

            for(var iPartition in this.partitions) {
                if(this.partitions[iPartition] === excludedPartition) {
                    continue;
                }
                var partTick = this.partitions[iPartition].getClosestTick(value);
                var partDist =  Math.abs(partTick - value);
                if(partDist < tickDist) {
                    closestTick = new mt.common.MtValue(partTick);
                    tickDist = partDist;
                }
            }

            return closestTick;
        };

        Axis.prototype.getMinLabelInterval = function () {
            var maxTickLabels = this.getMaxTickLabels();
            var minIntervalScale = (this.getMax() - this.getMin())/maxTickLabels / this.minorInterval.val();
            minIntervalScale = adjustScale(minIntervalScale);
            //return the interval
            return (minIntervalScale-0.5)*this.minorInterval.val();
        };

        Axis.prototype.getMaxTickLabels = function () {
            var maxTickLabels = ns.GRAPH_MAX_TICK_LABELS;
            if(Math.abs(this.getMax()) > 100 || Math.abs(this.getMin()) > 100) {
                maxTickLabels = ns.GRAPH_HIGH_MAX_TICK_LABELS;
            }
            return maxTickLabels;
        };

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

        Axis.prototype.getAdjustedInterval = function (interval, useLabel) {
            var adjusted = interval.copy();

            if (this.forcedMaxTicks === undefined || isNaN(this.forcedMaxTicks)) {
                var maxTicks = ns.GRAPH_MAX_TICKS;
                if(useLabel === true) {
                    maxTicks = this.getMaxTickLabels();
                }
                var minInterval = (this.getMax() - this.getMin())/maxTicks;
                var scale = Math.max(1, Math.ceil(minInterval/adjusted.val()));
                scale = adjustScale(scale);

                if(isNaN(scale) || isNaN(adjusted.val())) {
                    console.log('null scale', adjusted, scale, useLabel, maxTicks, minInterval);
                }
                adjusted.multiplyByNum(scale);
            } else {
                adjusted.multiplyByNum(this.forcedMaxTicks / 100);
            }
            return adjusted;
        };

        Axis.prototype.getMax = function() {
            var max;
            if(this.isXAxis) {
                max = this.max.x.val();
            } else {
                max = this.max.y.val();
            }
            return max;
        };

        Axis.prototype.getMin = function() {
            var min;
            if(this.isXAxis) {
                min = this.min.x.val();
            } else {
                min = this.min.y.val();
            }
            return min;
        };

        Axis.prototype.scaleRange = function (center, scale) {
            //prevent zooming out if we are already outside the max range
            if(this.getMax() - this.getMin() > ns.GRAPH_MAX_RANGE && scale > 1.0) {
                return;
            }

            if(this.isXAxis) {
                this.min.x = new mt.common.MtValue((this.min.x.val()-center)*scale+center, 1, false);
                this.max.x = new mt.common.MtValue((this.max.x.val()-center)*scale+center, 1, false);
            } else {
                this.min.y = new mt.common.MtValue((this.min.y.val()-center)*scale+center, 1, false);
                this.max.y = new mt.common.MtValue((this.max.y.val()-center)*scale+center, 1, false);
            }

            //don't scale below the min range
            if(this.getMax() - this.getMin() < ns.GRAPH_MIN_RANGE) {
                if(this.isXAxis) {
                    this.max.x = this.min.x.copy();
                    this.max.x.add(new mt.common.MtValue(ns.GRAPH_MIN_RANGE, 1, false));
                } else {
                    this.max.y = this.min.y.copy();
                    this.max.y.add(new mt.common.MtValue(ns.GRAPH_MIN_RANGE, 1, false));
                }
            }
        };

        Axis.prototype.translateRange = function(translation) {
            if(this.isXAxis) {
                this.min.x = new mt.common.MtValue(this.min.x.val()+translation, 1, false);
                this.max.x = new mt.common.MtValue(this.max.x.val()+translation, 1, false);
            } else {
                this.min.y = new mt.common.MtValue(this.min.y.val()+translation, 1, false);
                this.max.y = new mt.common.MtValue(this.max.y.val()+translation, 1, false);
            }
        };

        Axis.prototype.toString = function toString() {
            if (this.isXAxis === true) {
                return 'axis: ' + this.min.x.editText + ' -> ' + this.max.x.editText;
            }
            return 'axis: ' + this.min.y.editText + ' -> ' + this.max.y.editText;
        };

        Axis.prototype.type = function type() {
            return 'axis';
        };

        return Axis;
    })();
})(window.mt.common);

(function (ns) {
    'use strict';
    //core graph renderer class init, item rendering template and any common helper functions
    ns.BaseRenderer = (function () {

        function BaseRenderer(containerElement, viewConfig, toolId) {
            var svg, vis, clipId;
            function initSVG(toolId) {
                svg = d3.select(containerElement.childNodes[0]);
                vis = svg.append('svg:g');

                //add clipping rectangle
                clipId = 'clip' + toolId;
                svg.append('svg:defs').append('svg:clipPath')
                    .attr('id', clipId)
                    .append('svg:rect')
                        .attr('x', viewConfig.margin)
                        .attr('y', 0)
                        .attr('width', viewConfig.width - (2 * viewConfig.margin))
                        .attr('height', viewConfig.height);
            }
            initSVG(toolId);

            this.appendGroup = function() {
                return vis.append('svg:g');
            };

            this.renderItem = function (group, data, className, type, renderFn, clip) {
                function xPos(valX, valY, xAxis) { return viewConfig.transformToPos(valX, valY, xAxis)[0];}
                function yPos(valX, valY, xAxis) { return viewConfig.transformToPos(valX, valY, xAxis)[1];}

                var elements = group.selectAll('.' + className).data(data);

                elements.enter().append(type).attr('class', className);

                renderFn(elements, xPos, yPos);
                if(clip === true) {
                    elements.attr('clip-path', 'url(#' + clipId + ')');
                }

                elements.exit().remove();
            };

            //helper fn to get arrow path data based on start and endPos (in pixel space)
            this.getArrowData = function(startPos, endPos) {
                var lengthSq = (endPos[0] - startPos[0])*(endPos[0]- startPos[0]) + (endPos[1] - startPos[1])*(endPos[1] - startPos[1]);
                //divide by arrow length below to scale everything to correct size
                var length = Math.sqrt(lengthSq) / ns.GRAPH_ARROW_LENGTH;
                var norm = [(endPos[0] - startPos[0])/length, (endPos[1] - startPos[1])/length];
                var normPerp = [norm[1], -norm[0]];

                //arrow arm to stem ratio
                var ratio = ns.GRAPH_ARROW_RATIO;

                //arrow data containing 2 paths - stem and path
                var arrowData = [];
                //stem
                arrowData.push([endPos, [endPos[0] + norm[0], endPos[1] + norm[1]]]);
                //cap
                arrowData.push([
                    [endPos[0] + norm[0] + (-norm[0]+normPerp[0])*ratio, endPos[1] + norm[1] + (-norm[1] + normPerp[1])*ratio],
                    [endPos[0] + norm[0], endPos[1] + norm[1]],
                    [endPos[0] + norm[0] + (-norm[0]-normPerp[0])*ratio, endPos[1] + norm[1] + (-norm[1] - normPerp[1])*ratio]]);
                return arrowData;
            };

            this.drawLines = function(group, lines, className) {
                this.renderItem(group, lines, className, 'svg:line', function(elements, xPos, yPos) {
                    elements.attr('x1', function (d) { return xPos(d.start.x.val(), d.start.y.val(), d.start.xAxis); })
                        .attr('y1', function (d) { return yPos(d.start.x.val(), d.start.y.val(), d.start.xAxis); })
                        .attr('x2', function (d) { return xPos(d.end.x.val(), d.end.y.val(), d.end.xAxis); })
                        .attr('y2', function (d) { return yPos(d.end.x.val(), d.end.y.val(), d.end.xAxis); })
                        .attr('class', function (d) {
                            return d.isSelected === true ? className + ' mt-line mt-selected-line' : className + ' mt-line';
                        });
                }, true);

                var listenerClass = className + '-listener';
                this.renderItem(group, lines, listenerClass, 'svg:line', function(elements, xPos, yPos) {
                    elements.attr('x1', function (d) { return xPos(d.start.x.val(), d.start.y.val(), d.start.xAxis); })
                        .attr('y1', function (d) { return yPos(d.start.x.val(), d.start.y.val(), d.start.xAxis); })
                        .attr('x2', function (d) { return xPos(d.end.x.val(), d.end.y.val(), d.end.xAxis); })
                        .attr('y2', function (d) { return yPos(d.end.x.val(), d.end.y.val(), d.end.xAxis); })
                        .attr('id', function (d) { return d.id; })
                        .attr('class', listenerClass + ' mt-line-listener');
                }, true);
            };

            this.removeFromSVG = function(group, className) {
                if (className !== undefined) {
                    className = '.' + className;
                } else {
                    className = '*';
                }
                group.selectAll(className).remove();
            };
        }
        return BaseRenderer;
    }());
})(window.mt.common);




(function (ns) {
    'use strict';

    //generic functions allowing tool-specific graphing gestures to be built up
    //registered listeners are evaluated in a chain of responsibility until one handles the interaction (returns true)
    //all objects are assumed to have the api: {type: function(), isSelected: bool}
    ns.GestureHandler = (function () {

        //getObjectFn is a callback to get objects by
        function GestureHandler(graphModel, update, selectionApi) {
            this.mode = mt.common.GESTURE_MODE_DEFAULT;
            var self = this;

            //handlers
            var selectHandlers = [];
            var tapHandlers = [];
            var dragHandlers = [];


            //generic handler execution - execute in order until one of them handles the event
            function executeHandlers(handlerArray, posX, posY) {
                for(var i = 0; i < handlerArray.length; i++) {
                    var retVal = handlerArray[i](posX, posY);
                    if(retVal) {
                        return retVal;
                    }
                }
                return false;
            }

            //main set of fns that are called directly from a tool
            this.setMode = function (mode) {
                if(mode === undefined) {
                    self.mode = mt.common.GESTURE_MODE_DEFAULT;
                } else {
                    self.mode = mode;
                }
            };

            this.selectAtPos = function (posX, posY, id) {
                self.deselect();

                if(self.mode !== mt.common.GESTURE_MODE_DEFAULT) {
                    return false;
                }
                var selectedObject;
                if(id !== undefined) {
                    selectedObject = graphModel.getObject(id);
                } else {
                    selectedObject = executeHandlers(selectHandlers, posX, posY);
                }

                if(selectedObject) {
                    self.selectObject(selectedObject);
                }

                update(false);
                return selectedObject;
            };

            this.tapAtPos = function (posX, posY) {
                self.deselect();
                var handlers = _.pluck(_.where(tapHandlers, {mode: self.mode}), 'tapFn');
                var retVal =  executeHandlers(handlers, posX, posY);
                return retVal;
            };

            this.dragStartAtPos = function (posX, posY) {
                var handlers = _.pluck(_.where(dragHandlers, {mode: self.mode}), 'dragStartFn');
                return executeHandlers(handlers, posX, posY);
            };

            this.dragAtPos = function (posX, posY) {
                var handlers = _.pluck(_.where(dragHandlers, {mode: self.mode}), 'dragFn');
                executeHandlers(handlers, posX, posY);
                return false;
            };

            this.dragEnd = function() {
                var handlers = _.pluck(_.where(dragHandlers, {mode: self.mode}), 'dragEndFn');
                return executeHandlers(handlers);
            };

            //registration of each gesture handler
            //each of the registered fns returns true if they handle the gesture
            this.registerSelection = function (getToolFn) {
                selectHandlers.push(getToolFn);
            };

            this.registerTap = function (tapFn, targetMode) {
                if(targetMode === undefined) {
                    targetMode = mt.common.GESTURE_MODE_DEFAULT;
                }
                tapHandlers.push({mode: targetMode, tapFn: tapFn});
            };

            this.registerDrag = function (dragStartFn, dragFn, dragEndFn, targetMode) {
                if(targetMode === undefined) {
                    targetMode = mt.common.GESTURE_MODE_DEFAULT;
                }
                dragHandlers.push({mode: targetMode, dragStartFn: dragStartFn, dragFn: dragFn, dragEndFn: dragEndFn});
            };

            //common helper fns for interacting with graph model
            this.selectObject = function(modelObject) {
                modelObject.isSelected = true;
                if(selectionApi !== undefined) {
                    selectionApi.setSelection({type: modelObject.type(), modelObject: modelObject});
                }
            };

            this.deselect = function() {
                graphModel.deselectAll();
                if(selectionApi !== undefined) {
                    selectionApi.clear();
                }
                update(false);
            };
        }

        return GestureHandler;
    }());
})(window.mt.common);




(function (ns) {
    'use strict';

    ns.Glider = (function (parentLine, pos) {

        function Glider(parentLine, pos) {
            if (!(this instanceof Glider)) {
                return new Glider(parentLine, pos);
            }

            this.id = ns.createGuid();
            this.parentLine = parentLine;

            //calculate the position in x, y space
            this.getPos = function() {
                var aX = this.parentLine.start.x.val();
                var aY = this.parentLine.start.y.val();
                var bX = this.parentLine.end.x.val();
                var bY = this.parentLine.end.y.val();
                var x = this.t*(bX-aX) + aX;
                var y = this.t*(bY-aY) + aY;
                return[x, y];
            };

            //recalculate paremetric pos for a point in x,y space (not required to be on the line)
            this.moveToPos = function(pos) {
                var aX = this.parentLine.start.x.val();
                var aY = this.parentLine.start.y.val();
                var bX = this.parentLine.end.x.val();
                var bY = this.parentLine.end.y.val();
                var diffX = (bX-aX);
                var diffY = (bY-aY);
                var lengthSq = diffX*diffX + diffY*diffY;


                if(lengthSq === 0) {
                    console.log('zero length glider');
                    return;
                }

                //project (x,y) onto the line -> (pX,pY)
                //calc component of line from A to (x,y) that is parralel to parent line
                var lineComponent = ((pos[0]-aX)*diffX + (pos[1]-aY)*diffY)/lengthSq;
                var pX = aX + (bX - aX)*lineComponent;
                var pY = aY + (bY - aY)*lineComponent;

                this.t = ((pX-aX)*diffX + (pY-aY)*diffY)/lengthSq;
                //constrain to startPoint
                if(this.parentLine.innerType !== ns.LINE_INNER_TYPE_LINE) {
                    this.t = Math.max(this.t, 0);
                }

                //constrain to endPoint
                if(this.parentLine.innerType !== ns.LINE_INNER_TYPE_LINE && this.parentLine.innerType !== ns.LINE_INNER_TYPE_RAY) {
                    this.t = Math.min(this.t, 1);
                }
            };

            this.distSqFrom = function (pos) {
                var gliderPos = this.getPos();
                return (pos[0]-gliderPos[0])*(pos[0]-gliderPos[0]) + (pos[1]-gliderPos[1])*(pos[1]-gliderPos[1]);
            };

            this.getParentLine = function() {
                return this.parentLine;
            };

            this.type = function () {
                return ns.GRAPH_TYPE_GLIDER;
            };

            this.isSingular = function () {
                return (Math.abs(this.parentLine.start.x.val() - this.parentLine.end.x.val()) < ns.DEFAULT_EPS) &&
                    (Math.abs(this.parentLine.start.y.val() - this.parentLine.end.y.val()) < ns.DEFAULT_EPS);
            };

            this.toString = function () {
                var p = this.getPos();
                return '(' + round(p[0]) + ', ' + round(p[1]) + ')';
            };

            function round(val) {
                return Math.round(val * 100) / 100;
            }

            //position in parametric space [start,end] -> t on [0,1]
            //store in parametric space so that updating the parent points works correctly
            //set parametric position from the constructor arg position
            if(pos === undefined) {
                this.t = 0.5;
            } else {
                this.moveToPos(pos);
            }
        }

        return Glider;
    })();
})(window.mt.common);

(function (ns) {

    'use strict';

    //view config responsible for mapping between graph and view space for both graph and numberline
    ns.GraphGestureHandler = (function () {

        function GraphGestureHandler(graphModel, viewConfig, updateCallback, keypadService) {
            this.graphModel = graphModel;
            this.viewConfig = viewConfig;
            this.update = updateCallback;
            this.pointSetId = undefined;
            this.partitioningMode = false;
            this.snappingMode = mt.common.GRAPH_SNAP_MODE;
            this.keypadService = keypadService;
        }

        var MODE_TO_LINE_TYPE = {
            lineSegment: ns.LINE_INNER_TYPE_LINE_SEGMENT,
            line: ns.LINE_INNER_TYPE_LINE,
            ray: ns.LINE_INNER_TYPE_RAY,
            dropLineX: ns.LINE_INNER_TYPE_DROP_LINE_X,
            dropLineY: ns.LINE_INNER_TYPE_DROP_LINE_Y
        };

        function selectObject(self, modelObject) {
            if (modelObject.type() === ns.GRAPH_TYPE_POINT) {
                self.selectedPoint = modelObject;
            } else if (modelObject.type() === ns.GRAPH_TYPE_LINE) {
                self.selectedLine = modelObject;
            } else if (modelObject.type() === ns.GRAPH_TYPE_EQUATION) {
                self.selectedEquation = modelObject;
            }
            modelObject.isSelected = true;
        }

        //gesture handler functions
        GraphGestureHandler.prototype.tapAtPos = function (posX, posY, id) {
            var makePointSelected = false;
            var isDropLine = false;
            var drewLine = false;
            if (this.drawingMode !== undefined) {
                if (this.selectedPoint !== undefined && this.drawingMode !== 'pointSetMode') {
                    drewLine = true;
                } else if (this.drawingMode === 'dropLineX' || this.drawingMode === 'dropLineY') {
                    isDropLine = true;
                } else if (this.drawingMode !== 'pointSetMode') {
                    makePointSelected = true;
                }
            }

            if (makePointSelected || isDropLine || this.drawingMode === undefined || drewLine || this.drawingMode === 'pointSetMode') {
                var oldPoint = this.selectedPoint;
                this.deselectAll();

                var modelObject = this.graphModel.getObject(id);
                if (modelObject !== undefined) {
                    selectObject(this, modelObject);
                } else {
                    var existingPoint = this.getPointAtPos(posX, posY);
                    if (existingPoint !== undefined) {
                        var p = existingPoint;
                        selectObject(this, p);
                        var self = this;
                        if (makePointSelected) {
                            this.selectedPoint = p;
                        } else if (drewLine) {
                            this.selectedPoint = oldPoint;
                            this.addLine(posX, posY, this.drawingMode);
                        } else if (this.drawingMode === 'dropLineX') {
                            this.addDropLineToX();
                        } else if (this.drawingMode === 'dropLineY') {
                            this.addDropLineToY();
                        } else if (this.drawingMode === 'pointSetMode') {
                            this.pointSetId = this.graphModel.moveExistingPointToPointSet(p, this.pointSetId);
                        } else if (this.drawingMode === ''){
                            // clear timeout in case another point is tapped before first is deselected
                            clearTimeout(this.deselectTimeout);
                            this.deselectTimeout = setTimeout(function () {
                                p.isSelected = false;
                                self.deselectAll();
                                self.update(false);
                            }, 1000);
                        }

                        if (!makePointSelected)
                        {
                            this.deselectAll();
                        }
                    } else {
                        var val = this.viewConfig.transformToGraph(posX, posY);
                        var tickValX = this.getNearestTick(val[0], true);
                        var tickValY = this.getNearestTick(val[1], false);

                        var isXAxis = this.viewConfig.isXAxis(posY);
                        if (isXAxis === true) {
                            tickValY = new mt.common.MtValue(0, 1, false);
                        } else if (isXAxis === false) {
                            tickValX = new mt.common.MtValue(0, 1, false);
                        }
                        var point = new ns.Point({x: tickValX, y: tickValY, xAxis: isXAxis});
                        this.graphModel.addPoint(point);
                        if (makePointSelected && this.drawingMode !== '') {
                            this.selectedPoint = point;
                        }
                        if (this.drawingMode === 'dropLineX') {
                            this.selectedPoint = point;
                            this.addDropLineToX();
                        } else if (this.drawingMode === 'dropLineY') {
                            this.selectedPoint = point;
                            this.addDropLineToY();
                        } else if (drewLine) {
                            this.selectedPoint = oldPoint;
                            this.addLine(posX, posY, this.drawingMode);
                        } else if (this.drawingMode === 'pointSetMode') {
                            this.pointSetId = this.graphModel.moveExistingPointToPointSet(point, this.pointSetId);
                        }
                    }
                }
            }
            this.update(false);
        };


        GraphGestureHandler.prototype.holdAtPos = function (posX, posY, id, touchSize) {

            //TODO - was the click on a line? Determine with jquery position search to support line operations
            var typeHeld;
            this.deselectAll();
            var modelObject = this.graphModel.getObject(id);
            if (modelObject !== undefined) {
                selectObject(this, modelObject);
                typeHeld = modelObject.type();
            } else {
                this.selectedPoint = this.getPointAtPos(posX, posY, touchSize);
                if (this.selectedPoint) {
                    this.selectedPoint.isSelected = true;
                    typeHeld = ns.GRAPH_TYPE_POINT;
                }
            }

            if(this.selectedPoint === undefined) {
                this.selectedGlider = this.getGliderAtPos(posX, posY, touchSize);
                if (this.selectedGlider) {
                    this.selectedGlider.isSelected = true;
                    typeHeld = ns.GRAPH_TYPE_GLIDER;
                }
            }

            if(this.selectedPoint === undefined && this.selectedGlider === undefined) {
                this.selectedPartition = this.getPartitionedRangeAtPos(posX, posY, true);
                if(this.selectedPartition === undefined) {
                    this.selectedPartition = this.getPartitionedRangeAtPos(posX, posY, false);
                }

                if (this.selectedPartition) {
                    this.selectedPartition.isSelected = true;
                    typeHeld = ns.GRAPH_TYPE_PARTITION;
                }
            }

            this.update(false);

            console.log('hold selected ' + typeHeld);

            //return the object in order to open the popover menu
            return typeHeld;
        };

        GraphGestureHandler.prototype.togglePartitioning = function (on) {
            if(on === undefined) {
                on = !this.partitioningMode;
            }
            this.partitioningMode = on;
        };

        GraphGestureHandler.prototype.toggleSnapping = function (mode) {
            console.log('snapping mode set to ', mode);
            this.snappingMode = mode;
        };

        var numberLineYPosition;
        GraphGestureHandler.prototype.dragStartAtPos = function (posX, posY) {
            this.deselectAll();

            this.lastDragStartPos = [posX, posY];

            // ignore drag start if drawing a line, will be handled in dragAtPos
            if (_(['line', 'lineSegment', 'ray']).contains(this.drawingMode)) {
                return;
            }

            if (this.partitioningMode !== true) {
                this.draggingGlider = this.getGliderAtPos(posX, posY);
                if (this.draggingGlider === undefined || this.draggingGlider.isSingular()) {
                    this.draggingGlider = undefined;
                    this.draggingPoint = this.getPointAtPos(posX, posY);
                } else {
                    this.draggingGlider.isSelected = true;
                }
                if (this.draggingPoint !== undefined) {
                    this.draggingPoint.isSelected = true;
                    if (this.draggingPoint.editStrokes && this.draggingPoint.editStrokes.editText) {
                        this.draggingPoint.editStrokes.editText = []; // wipe handwritten coords
                    }
                }

                if (this.draggingPoint === undefined && this.draggingGlider === undefined){
                    this.draggingPartitionMax = this.getPartitionedRangeAtPos(posX, posY, true);
                    
                    if(this.draggingPartitionMax === undefined) {
                        this.draggingPartitionMin = this.getPartitionedRangeAtPos(posX, posY, false);
                        if(this.draggingPartitionMin !== undefined) {
                            this.draggingPartitionMin.isSelected = true;
                        }
                    } else {
                        this.draggingPartitionMax.isSelected = true;
                    }
                }

            } else {
                this.draggingPartitionMax = this.addPartitionedRangeAtPos(posX, posY);
                this.draggingPartitionMax.isSelected = true;
            }

            if (this.viewConfig.isNumberline && this.draggingPoint !== undefined) {
                numberLineYPosition = this.draggingPoint.xAxis ? this.viewConfig.height * 3 / 4 : this.viewConfig.height * 1 / 4;
            }

            this.update(false);
        };

        GraphGestureHandler.prototype.dragAtPos = function (posX, posY) {
            var prevVal, newVal;

            if (this.draggingPoint !== undefined) {
                if (this.viewConfig.isNumberline) {
                    posY = numberLineYPosition;
                }

                prevVal = [this.draggingPoint.x.val(), this.draggingPoint.y.val()];
                newVal = this.viewConfig.transformToGraph(posX, posY);

                if (this.viewConfig.isGraph || this.draggingPoint.xAxis === true) {
                    this.draggingPoint.x.setVal(newVal[0]);
                }

                if (this.viewConfig.isGraph || this.draggingPoint.xAxis === false) {
                    this.draggingPoint.y.setVal(newVal[1]);
                }

                //update if the point moved
                if (prevVal[0] !== newVal[0] || prevVal[1] !== newVal[1]) {
                    this.update(false);
                }
            } else if (this.draggingGlider !== undefined) {
                newVal = this.viewConfig.transformToGraph(posX, posY);
                this.draggingGlider.moveToPos(newVal);
                this.update(false);
            } else if (this.draggingPartitionMax !== undefined) {
                newVal = this.viewConfig.transformToGraph(posX, posY);
                var newMax = this.draggingPartitionMax.isXAxis ? newVal[0]: newVal[1];
                this.draggingPartitionMax.setMax(newMax);
                this.update(false);
            } else if (this.draggingPartitionMin !== undefined) {
                newVal = this.viewConfig.transformToGraph(posX, posY);
                var newMin = this.draggingPartitionMin.isXAxis ? newVal[0]: newVal[1];
                this.draggingPartitionMin.setMin(newMin);
                this.update(false);
            } else if (_(['line', 'lineSegment', 'ray']).contains(this.drawingMode) && !this.drawingLine && this.viewConfig.mode !== ns.GRAPH_MODE_NUMBERLINE) {
                drawLineFromDrag(this, posX, posY);
            }
        };

        function drawLineFromDrag(gestureHandler, posX, posY) {
            var startPoint = gestureHandler.getOrCreatePointAtPos(gestureHandler.lastDragStartPos[0], gestureHandler.lastDragStartPos[1]);
            var endPoint = gestureHandler.getOrCreatePointAtPos(posX, posY);

            if (!startPoint.equals(endPoint)) {
                var line = new ns.Line({
                    start: startPoint,
                    end: endPoint,
                    innerType: MODE_TO_LINE_TYPE[gestureHandler.drawingMode]
                });

                if (gestureHandler.graphModel.getObject(startPoint.id) === undefined) {
                    gestureHandler.graphModel.addPoint(startPoint);
                }

                if (gestureHandler.graphModel.getObject(endPoint.id) === undefined) {
                    gestureHandler.graphModel.addPoint(endPoint);
                }

                gestureHandler.graphModel.addLine(line);

                gestureHandler.drawingLine = true;
                gestureHandler.lastNewLineEndPoint = endPoint;
                gestureHandler.draggingPoint = endPoint;
                gestureHandler.draggingPoint.isSelected = true;
                gestureHandler.update(false);
            }
        }

        GraphGestureHandler.prototype.dragEnd = function () {
            if (this.viewResizing) {
                if (this.viewConfig.width < mt.common.PERCENT_BAR_MIN_WIDTH) {
                    this.viewConfig.width = mt.common.PERCENT_BAR_MIN_WIDTH;
                }
                this.viewResizing = false;
                this.update(true);
                return;
            }
            var draggedObject;

            var snappedVal;
            if (this.draggingPoint !== undefined) {
                var tickX, tickY;
                if (this.viewConfig.isGraph || this.draggingPoint.xAxis === true) {
                    tickX = this.getNearestTick(this.draggingPoint.x.val(), true);
                    this.draggingPoint.x.setVal(tickX.val());
                }

                if (this.viewConfig.isGraph || this.draggingPoint.xAxis === false) {
                    tickY = this.getNearestTick(this.draggingPoint.y.val(), false);
                    this.draggingPoint.y.setVal(tickY.val());
                }

                this.draggingPoint.isSelected = false;
                this.draggingPoint = undefined;
                this.update(false);
            } else if (this.draggingGlider !== undefined) {
                this.draggingGlider.isSelected = false;
                this.draggingGlider = undefined;
                this.update(false);
            } else if (this.draggingPartitionMax !== undefined) {
                snappedVal = this.getNearestTick(this.draggingPartitionMax.max.val(), this.draggingPartitionMax.isXAxis, this.draggingPartitionMax);

                this.draggingPartitionMax.setMax(snappedVal.val());
                if(this.partitioningMode === true) {
                    draggedObject = this.draggingPartitionMax;
                }
                this.draggingPartitionMax = undefined;
                this.update(false);
            } else if (this.draggingPartitionMin !== undefined) {
                snappedVal = this.getNearestTick(this.draggingPartitionMin.min.val(), this.draggingPartitionMin.isXAxis, this.draggingPartitionMin);
                this.draggingPartitionMin.setMin(snappedVal.val());
                this.draggingPartitionMin = undefined;
                this.update(false);
            }

            this.drawingLine = false;
            this.lastDragStartPos = [];

            if(draggedObject === undefined) {
                this.deselectAll();
            }

            return draggedObject;
        };

        GraphGestureHandler.prototype.pinchAtPos = function (dragCenter, scale, translationPos) {
            if (!this.viewConfig.isGraph) {
                dragCenter[1] = this.viewConfig.height * 3 / 4;
                translationPos[1] = this.viewConfig.height * 3 / 4;
            }

            var centerVal = this.viewConfig.transformToGraph(dragCenter[0], dragCenter[1]);
            var translationVal = this.viewConfig.transformToGraph(translationPos[0], translationPos[1]);

            this.graphModel.axes.x.scaleRange(centerVal[0], scale);
            this.graphModel.axes.x.translateRange(centerVal[0] - translationVal[0]);
            if (!this.viewConfig.isGraph) {
                this.graphModel.axes.y.scaleRange(centerVal[0], scale);
                this.graphModel.axes.y.translateRange(centerVal[0] - translationVal[0]);
            } else {
                this.graphModel.axes.y.scaleRange(centerVal[1], scale);
                this.graphModel.axes.y.translateRange(centerVal[1] - translationVal[1]);
            }

            this.update();
        };

        GraphGestureHandler.prototype.setMode = function (type) {
            this.pointSetId = undefined;
            this.drawingMode = type;
        };

        GraphGestureHandler.prototype.addLine = function (posX, posY, mode) {
            var lineType = MODE_TO_LINE_TYPE[mode];
            createAndAddLine(this, this.selectedPoint, this.getOrCreatePointAtPos(posX, posY), lineType);
        };

        GraphGestureHandler.prototype.addDropLineToX = function () {
            createAndAddLine(this, this.selectedPoint, new ns.Point({
                x: this.selectedPoint.x,
                y: new ns.MtValue(0, 1, false)
            }), ns.LINE_INNER_TYPE_DROP_LINE_X);
        };

        GraphGestureHandler.prototype.addDropLineToY = function () {
            createAndAddLine(this, this.selectedPoint, new ns.Point({
                x: new ns.MtValue(0, 1, false),
                y: this.selectedPoint.y
            }), ns.LINE_INNER_TYPE_DROP_LINE_Y);
        };

        function createAndAddLine(self, fromPoint, toPoint, lineType) {
            if (fromPoint === undefined || toPoint === undefined) {
                return;
            }
            var line = new ns.Line({
                start: fromPoint,
                end: toPoint,
                innerType: lineType
            });

            if (line !== undefined && (self.viewConfig.mode !== ns.GRAPH_MODE_NUMBERLINE || fromPoint.xAxis !== toPoint.xAxis)) {
                self.graphModel.addLine(line);
                self.selectedPoint = undefined;
            }

            self.deselectAll();
            self.update(false);
        }

        function deleteSelected(gestureHandler, object, removalFn) {
            if (object === undefined) {
                return;
            }

            removalFn(object);
            gestureHandler.deselectAll();
            gestureHandler.update(false);
        }

        function labelSelected(gestureHandler, object, labelFn, label) {
            if (object === undefined) {
                return;
            }

            labelFn(object, label);
            gestureHandler.deselectAll();
            gestureHandler.update(false);
        }

        GraphGestureHandler.prototype.labelMaxPercent = function (label) {
            this.graphModel.maxPercentLabel = label;
            this.deselectAll();
            this.update(false);
        };

        GraphGestureHandler.prototype.labelSelectedPoint = function (label) {
            labelSelected(this, this.selectedPoint, _(this.graphModel.labelPoint).bind(this.graphModel), label);
        };

        GraphGestureHandler.prototype.labelSelectedPartition = function (label) {
            labelSelected(this, this.selectedPartition, _(this.graphModel.labelPartition).bind(this.graphModel), label);
        };

        GraphGestureHandler.prototype.deleteSelectedPoint = function () {
            deleteSelected(this, this.selectedPoint, _(this.graphModel.removePoint).bind(this.graphModel));
        };

        GraphGestureHandler.prototype.deleteSelectedLine = function () {
            deleteSelected(this, this.selectedLine, _(this.graphModel.removeLine).bind(this.graphModel));
        };

        GraphGestureHandler.prototype.deleteSelectedEquation = function () {
            deleteSelected(this, this.selectedEquation, _(this.graphModel.removeEquation).bind(this.graphModel));
        };

        GraphGestureHandler.prototype.deleteAllLines = function () {
            this.graphModel.removeAllLines();
            this.graphModel.removeAllEquations();
            this.deselectAll();
            this.update(false);
        };

        GraphGestureHandler.prototype.deleteSelectedPartition = function () {
            this.graphModel.removePartitionedRange(this.selectedPartition);
            this.deselectAll();
            this.update(false);
        };

        GraphGestureHandler.prototype.deselectAll = function () {
            this.selectedPoint = undefined;
            this.selectedLine = undefined;
            this.selectedGlider = undefined;
            this.selectedEquation = undefined;
            this.selectedPartition = undefined;
            this.graphModel.deselectAll();
            this.update();
        };

        //helper functions
        GraphGestureHandler.prototype.isNearPoint = function (pointX, pointY, posX, posY, touchSize) {
            if (touchSize === undefined) {
                touchSize = ns.TOUCH_SIZE;
            }
            var isXAxis = this.viewConfig.isXAxis(posY);

            //get point position in screen coords to check the point is within the selection range
            var pointPos = this.viewConfig.transformToPos(pointX, pointY, isXAxis);
            var distSq = (pointPos[0] - posX) * (pointPos[0] - posX) + (pointPos[1] - posY) * (pointPos[1] - posY);
            if (distSq < touchSize * touchSize / 4) {
                return true;
            }
            return false;
        };

        //helper functions
        GraphGestureHandler.prototype.getPointAtPos = function (posX, posY, touchSize) {
            if (touchSize === undefined) {
                touchSize = ns.TOUCH_SIZE;
            }
            var val = this.viewConfig.transformToGraph(posX, posY);
            var isXAxis = this.viewConfig.isXAxis(posY);

            var points = this.graphModel.findNearestPoints(val[0], val[1], isXAxis);

            var clickedPoint;
            if (points.length >= 1) {
                var point = points[0];
                //get point position in screen coords to check the point is within the selection range
                var pointPos = this.viewConfig.transformToPos(point.x.val(), point.y.val(), isXAxis);
                var distSq = (pointPos[0] - posX) * (pointPos[0] - posX) + (pointPos[1] - posY) * (pointPos[1] - posY);
                if (distSq < touchSize * touchSize / 4) {
                    clickedPoint = point;
                }
            }

            return clickedPoint;
        };

        GraphGestureHandler.prototype.getGliderAtPos = function(posX, posY, touchSize) {
            if (touchSize === undefined) {
                touchSize = ns.TOUCH_SIZE;
            }
            var val = this.viewConfig.transformToGraph(posX, posY);
            var gliders = this.graphModel.findNearestGliders(val[0], val[1]);

            var clickedPoint;

            if (gliders.length >= 1) {
                var glider = gliders[0];
                var gliderVal = glider.getPos();
                //get point position in screen coords to check the point is within the selection range
                var pointPos = this.viewConfig.transformToPos(gliderVal[0], gliderVal[1]);
                var distSq = (pointPos[0] - posX) * (pointPos[0] - posX) + (pointPos[1] - posY) * (pointPos[1] - posY);
                if (distSq < touchSize * touchSize / 4) {
                    clickedPoint = glider;
                }
            }
            return clickedPoint;
        };

        GraphGestureHandler.prototype.getOrCreatePointAtPos = function (posX, posY) {
            var point = this.getPointAtPos(posX, posY);
            if (point === undefined) {
                var val = this.viewConfig.transformToGraph(posX, posY);
                var tickValX = this.getNearestTick(val[0], true);
                var tickValY = this.getNearestTick(val[1], false);

                var isXAxis = this.viewConfig.isXAxis(posY);
                if (isXAxis === true) {
                    tickValY = new mt.common.MtValue(0, 1, false);
                } else if (isXAxis === false) {
                    tickValX = new mt.common.MtValue(0, 1, false);
                }

                point = new ns.Point({x: tickValX, y: tickValY, xAxis: isXAxis});
            }
            return point;
        };

        GraphGestureHandler.prototype.addGliderToSelectedLine = function () {
            if (this.selectedLine === undefined) {
                console.log('no line selected to add the glider');
                return;
            }

            var glider = new ns.Glider(this.selectedLine);
            this.graphModel.addGlider(glider);
        };

        GraphGestureHandler.prototype.deleteSelectedGlider = function () {
            if (this.selectedGlider === undefined) {
                console.log('no line selected to delete the glider');
                return;
            }

            this.graphModel.removeGlider(this.selectedGlider);
            this.update();
        };

        GraphGestureHandler.prototype.release = function () {
            this.drawingLine = false;
            if (this.lastNewLineEndPoint !== undefined) {
                var endPoint = this.lastNewLineEndPoint;

                // check if any other point already exists at end location
                var pointAtLocation = _(this.graphModel.findPoints(endPoint.x.val(), endPoint.y.val())).chain()
                    .reject(function (point) {
                        return point === endPoint;
                    })
                    .first()
                    .value();

                if (pointAtLocation !== undefined) {
                    this.graphModel.replacePoint(endPoint, pointAtLocation, true);
                }
                this.lastNewLineEndPoint = undefined;
            }
        };

        GraphGestureHandler.prototype.toggleLineSegmentMode = function () {
            this.drawingMode = this.drawingMode === undefined ? 'mt-line-segment' : undefined;
        };

        GraphGestureHandler.prototype.addPartitionedRangeAtPos = function (posX, posY) {
            var val = this.viewConfig.transformToGraph(posX, posY);

            var startVal;
            var isXAxis = this.viewConfig.isXAxis(posY);
            if (isXAxis === true) {
                startVal = this.getNearestTick(val[0], true);
            } else if (isXAxis === false) {
                //todo fix up all like this
                startVal = this.getNearestTick(val[1], false);
            }

            //create and add the partition
            var partition = this.graphModel.addPartitionedRange(isXAxis, startVal, startVal, 1);
            return partition;
        };

        //helper function for getting partition handle
        GraphGestureHandler.prototype.getPartitionedRangeAtPos = function (posX, posY, max) {
            var touchSize = ns.TOUCH_SIZE;
            var val = this.viewConfig.transformToGraph(posX, posY);

            var isXAxis = this.viewConfig.isXAxis(posY);
            var axisVal = isXAxis? val[0]: val[1];

            var partition = this.graphModel.findNearestPartitionedRange(axisVal, isXAxis, max);
            var clickedPartition;
            if (partition !== undefined) {
                var handleVal = max? partition.max: partition.min;
                var pointVal = isXAxis? [handleVal.val(), 0]: [0, handleVal.val()];
                //get point position in screen coords to check the point is within the selection range
                var pointPos = this.viewConfig.transformToPos(pointVal[0], pointVal[1], isXAxis);
                var distSq = (pointPos[0] - posX) * (pointPos[0] - posX) + (pointPos[1] - posY) * (pointPos[1] - posY);
                if (distSq < touchSize * touchSize / 4) {
                    clickedPartition = partition;
                }
            }
            return clickedPartition;
        };

        GraphGestureHandler.prototype.getNearestTick = function (val, isXAxis, excludedPartition) {
            var axis;
            if(isXAxis) {
                axis = this.graphModel.axes.x;
            } else {
                axis = this.graphModel.axes.y;
            }
            var tickVal = axis.getNearestTick(val, this.snappingMode, excludedPartition);

            if(this.snappingMode === ns.GRAPH_PROXIMITY_SNAP) {
                var tickPos, valPos;
                //compare 1d position of tick and value to determine whether to snap;
                if(isXAxis) {
                    tickPos = this.viewConfig.transformToPos(tickVal.val(), 0, isXAxis);
                    valPos = this.viewConfig.transformToPos(val, 0, isXAxis);
                } else {
                    tickPos = this.viewConfig.transformToPos(0, tickVal.val(), isXAxis);
                    valPos = this.viewConfig.transformToPos(0, val, isXAxis);
                }
                var snapDistSq = (tickPos[0]-valPos[0])*(tickPos[0]-valPos[0]) + (tickPos[1]-valPos[1])*(tickPos[1]-valPos[1]);
                if(snapDistSq > ns.GRAPH_SNAP_THRESHOLD*ns.GRAPH_SNAP_THRESHOLD) {
                    tickVal = new ns.MtValue(val);
                }
            }

            return tickVal;
        };

        return GraphGestureHandler;
    }());
})(window.mt.common);

(function (ns) {
    'use strict';

    ns.GraphModel = (function (spec, _pointNameService) {

        var pointNameService; // this can be static since it's a service anyway

        function GraphModel(spec, _pointNameService) {
            if (!(this instanceof GraphModel)) {
                return new GraphModel(spec, _pointNameService);
            }


            spec = spec || {};
            this.points = attributeValueForKey(spec, 'points', []);
            this.pointSets = attributeValueForKey(spec, 'pointSets', []);
            this.lines = attributeValueForKey(spec, 'lines', []);
            this.gliders = attributeValueForKey(spec, 'gliders', []);
            this.equations = attributeValueForKey(spec, 'equations', []);
            this.axes = initializeAxes(spec);

            this.showPointLabels = !!spec.showPointLabels;
            this.showGridLines = true;
            if (spec.showGridLines !== undefined) {
                this.showGridLines = !!spec.showGridLines;
            }
            this.showAxes = true;
            if (spec.showAxes !== undefined) {
                this.showAxes = !!spec.showAxes;
            }
            this.setHundredPercentValue(attributeValueForKey(spec, 'hundredPercentValue', 100));
            initializeRegistry(this);

            pointNameService = _pointNameService;
            this.tickLabels = [];
        }

        function initializeAxes(spec) {
            var axes = attributeValueForKey(spec, 'axes', {});
            var xAxis = attributeValueForKey(axes, 'x', new ns.Axis({isXAxis: true}));
            var yAxis = attributeValueForKey(axes, 'y', new ns.Axis({isXAxis: false}));
            return {
                x: xAxis,
                y: yAxis
            };
        }

        function initializeRegistry(graphModel) {
            graphModel.registry = {};

            var registerObj = _(register).partial(graphModel);

            _(graphModel.points).each(registerObj);
            _(graphModel.pointSets).each(registerObj);
            _(graphModel.lines).each(registerObj);
            _(graphModel.gliders).each(registerObj);
            _(graphModel.equations).each(registerObj);
        }

        function attributeValueForKey(attributes, key, defaultVal) {
            return attributes[key] === undefined ? defaultVal : attributes[key];
        }

        function register(graphModel, newObject) {
            graphModel.registry[newObject.id] = newObject;
        }

        function unregister(graphModel, oldObject) {
            delete graphModel.registry[oldObject.id];
        }

        GraphModel.prototype.uniqueObjects = function () {
            var self = this;
            return _.chain(this.registry)
                .keys()
                .filter(function (id) {
                    var obj = self.getObject(id);
                    // return if not a glider or a point in a point set
                    return !isGlider(obj) && (!isPoint(obj) || isPointStandalone(self, obj));
                })
                .value();
        };

        function isPoint(obj) {
            return obj.type() === ns.GRAPH_TYPE_POINT;
        }

        function isGlider(obj) {
            return obj.type() === ns.GRAPH_TYPE_GLIDER;
        }

        // could use point.pointSetId instead if it was being consistently set
        function isPointStandalone(graphModel, point) {
            return !inPointSet(graphModel, point);
        }

        function inPointSet(graphModel, point) {
            var existsInPointSet = _(graphModel.pointSets).find(function (pointSet) {
                return _(pointSet.points).contains(point);
            });

            return !!existsInPointSet;
        }

        function getRowFromPoint(point) {
            var row = {values: [point.x.val(), point.y.val()], id: point.id};
            if(point.name !== undefined && point.name !== '') {
                row.label = point.name;
            } else if(point.numberLinePointLabel !== undefined && point.numberLinePointLabel !== '') {
                row.label = point.numberLinePointLabel;
            }
            return row;
        }

        //import export in common data format
        GraphModel.prototype.exportPoints = function () {
            var data = {
                headers: [this.axes.x.label.val(), this.axes.y.label.val()],
                rows: []
            };

            _(this.points).each(function(point) {
                data.rows.push(getRowFromPoint(point));
            });

            _(this.pointSets).each(function(pointSet) {
                _(pointSet.points).each(function(point) {
                    data.rows.push(getRowFromPoint(point));
                });
            });

            return data;

        };

        GraphModel.prototype.importPoints = function (data, isSNL) {
            var self = this;

            if(isSNL !== false && data.headers !== undefined && data.headers.length > 1) {
                this.axes.x.label.setVal(data.headers[0]);
                this.axes.y.label.setVal(data.headers[1]);
            }

            _(data.rows).each(function(row) {
                var isXAxis;
                if(isSNL === true) {
                    isXAxis = Math.abs(row.values[0]) > Math.abs(row.values[1]);
                }
                var newPoint = new mt.common.Point({x: isXAxis === false? 0 : row.values[0], y: isXAxis === true? 0 : row.values[1], xAxis: isXAxis});
                if(row.label !== undefined && row.label !== '') {
                    if(isSNL === true) {
                        newPoint.numberLinePointLabel = row.label;
                    } else {
                        newPoint.name = row.label;
                    }
                }
                self.addPoint(newPoint);
            });

            //adjust axes
            var xRange = this.getPointRange(true);
            var yRange = this.getPointRange(false);

            //deal with SNL case where ranges must be the same
            if(isSNL === true) {
                var newRange = [Math.min(xRange[0], yRange[0]), Math.max(xRange[1], yRange[1])];
                xRange = newRange;
                yRange = newRange;
            }

            this.axes.x.min.x.setVal(xRange[0]);
            this.axes.x.max.x.setVal(xRange[1]);

            this.axes.y.min.y.setVal(yRange[0]);
            this.axes.y.max.y.setVal(yRange[1]);
        };

        GraphModel.prototype.getPointRange = function (xAxis, rangeMargin) {
            //default to 25% range margin
            if (rangeMargin === undefined) {
                rangeMargin = 1;
            }

            var max = Number.NEGATIVE_INFINITY;
            var min = Number.POSITIVE_INFINITY;
            if(this.points.length === 0) {
                return [0,1];
            }
            _.each(this.points, function(point) {
                //don't include the co-value for points bound to an axis
                if(point.xAxis !== undefined && xAxis !== point.xAxis) {
                    return;
                }
                var val = xAxis ? point.x.val(): point.y.val();
                if(max === undefined || val > max) {
                    max = val;
                }
                if(min === undefined || val < min) {
                    min = val;
                }
            });

            return [min - rangeMargin, max + rangeMargin];
        };

        GraphModel.prototype.serialize = function () {
            return this;
        };

        GraphModel.prototype.deserialize = function (json) {
            var self = this;

            this.registry = {};
            this.showPointLabels = !!json.showPointLabels;
            this.showGridLines = !!json.showGridLines;
            this.showAxes = !!json.showAxes;

            var axis = json.axes.x;
            this.axes.x = new ns.Axis({
                id: axis.id,
                label: new mt.common.MtValue(axis.label.num, axis.label.denom, axis.label.isFraction),
                min: new mt.common.MtValue(axis.min.x.num, axis.min.x.denom, axis.min.x.isFraction),
                max: new mt.common.MtValue(axis.max.x.num, axis.max.x.denom, axis.max.x.isFraction),
                majorInterval: new mt.common.MtValue(axis.majorInterval.num, axis.majorInterval.denom, axis.majorInterval.isFraction),
                minorInterval: new mt.common.MtValue(axis.minorInterval.num, axis.minorInterval.denom, axis.minorInterval.isFraction),
                anchor: new mt.common.MtValue(axis.anchor.num, axis.anchor.denom, axis.anchor.isFraction),
                isXAxis: true,
                fractionMode: axis.fractionMode,
                forcedMaxTicks: axis.forcedMaxTicks,
                huntMode: axis.huntMode
            });

            axis = json.axes.y;
            this.axes.y = new ns.Axis({
                id: axis.id,
                label: new mt.common.MtValue(axis.label.num, axis.label.denom, axis.label.isFraction),
                min: new mt.common.MtValue(axis.min.y.num, axis.min.y.denom, axis.min.y.isFraction),
                max: new mt.common.MtValue(axis.max.y.num, axis.max.y.denom, axis.max.y.isFraction),
                majorInterval: new mt.common.MtValue(axis.majorInterval.num, axis.majorInterval.denom, axis.majorInterval.isFraction),
                minorInterval: new mt.common.MtValue(axis.minorInterval.num, axis.minorInterval.denom, axis.minorInterval.isFraction),
                anchor: new mt.common.MtValue(axis.anchor.num, axis.anchor.denom, axis.anchor.isFraction),
                isXAxis: false,
                fractionMode: axis.fractionMode,
                forcedMaxTicks: axis.forcedMaxTicks,
                huntMode: axis.huntMode
            });

            this.points.length = 0;
            _(json.points).each(function (point) {
                var p = new ns.Point({
                    id: point.id,
                    isSelected: point.isSelected,
                    name: point.name,
                    x: new mt.common.MtValue(point.x.num, point.x.denom, point.x.isFraction),
                    y: new mt.common.MtValue(point.y.num, point.y.denom, point.y.isFraction),
                    xAxis: point.xAxis,
                    numberLinePointLabel: point.numberLinePointLabel,
                    numberLinePercentLabel: point.numberLinePercentLabel,
                    color: point.color
                    //isHidden
                    //label
                    //hasValidName
                    //editText
                });
                p.editText = p.toString();
                self.addPoint(p);
            });

            this.pointSets.length = 0;
            _(json.pointSets).each(function (pointSet) {
                var mtPointSet = new ns.PointSet({
                    id: pointSet.id,
                    title: pointSet.title,
                    label: pointSet.label
                });
                var points = pointSet.points;
                _(points).each(function (point) {
                    mtPointSet.addPoint(new ns.Point({
                        id: point.id,
                        isSelected: point.isSelected,
                        name: point.name,
                        x: new mt.common.MtValue(point.x.num, point.x.denom, point.x.isFraction),
                        y: new mt.common.MtValue(point.y.num, point.y.denom, point.y.isFraction),
                        xAxis: point.xAxis
                    }));
                });
                self.addPointSet(mtPointSet);
            });

            this.lines.length = 0;
            _(json.lines).each(function (line) {
                var start = self.getObject(line.start.id);
                var end = self.getObject(line.end.id);
                // end will be undefined for drop lines
                if (end === undefined) {
                    if (line.end.x.num === 0) { // drop line to y
                        end = new ns.Point({
                            id: line.end.id,
                            x: new ns.MtValue(0, 1, false),
                            y: start.y
                        });
                    } else {                    // drop line to x
                        end = new ns.Point({
                            id: line.end.id,
                            x: start.x,
                            y: new ns.MtValue(0, 1, false)
                        });
                    }
                }
                self.addLine(new ns.Line({
                    id: line.id,
                    isSelected: line.isSelected,
                    innerType: line.innerType,
                    start: start,
                    end: end
                }));
            });

            //gliders - will need a set parent line object?
            this.gliders.length = 0;
            _(json.gliders).each(function (glider) {
                var line = self.getObject(glider.parentLine.id);
                var loadedGlider = new ns.Glider(line);
                loadedGlider.id = glider.id;
                loadedGlider.t = glider.t;
                self.addGlider(loadedGlider);
            });

            _(json.equations).each(function (eqn) {
                var loadedEqn = new ns.Equation(eqn.editText);
                loadedEqn.editText = eqn.editText;
                self.addEquation(loadedEqn);
            });

            if (pointNameService !== undefined) {
                pointNameService.validateNames(this.getAllPoints());
            }

            //load partitions
            _(json.axes.x.partitions).each(function (partition) {
                var max = new mt.common.MtValue(partition.max.num, partition.max.denom, partition.max.isFraction);
                var min = new mt.common.MtValue(partition.min.num, partition.min.denom, partition.min.isFraction);
                var loadedPartition = new ns.PartitionedRange(min, max, partition.partitions, partition.color, partition.isXAxis);
                loadedPartition.numberLinePointLabel = partition.numberLinePointLabel;
                loadedPartition.numberLinePercentLabel = partition.numberLinePercentLabel;
                loadedPartition.isPrime = partition.isPrime;
                self.axes.x.partitions.push(loadedPartition);
            });

            _(json.axes.y.partitions).each(function (partition) {
                var max = new mt.common.MtValue(partition.max.num, partition.max.denom, partition.max.isFraction);
                var min = new mt.common.MtValue(partition.min.num, partition.min.denom, partition.min.isFraction);
                var loadedPartition = new ns.PartitionedRange(min, max, partition.partitions, partition.color, partition.isXAxis);
                loadedPartition.numberLinePointLabel = partition.numberLinePointLabel;
                loadedPartition.numberLinePercentLabel = partition.numberLinePercentLabel;
                loadedPartition.isPrime = partition.isPrime;
                self.axes.y.partitions.push(loadedPartition);
            });

            this.hundredPercentValue = json.hundredPercentValue;
            this.percentBarMode = json.percentBarMode;
            this.maxPercentLabel = json.maxPercentLabel;
            this.hundredPercentLabel = json.hundredPercentLabel;
            this.transparentMode = json.transparentMode;
            this.lowNum = json.lowNum;
            this.highNum = json.highNum;
            this.huntNum = json.huntNum;
            this.customPartitionSet = json.customPartitionSet;
        };

        GraphModel.prototype.select = function (graphObject) {
            // return if the object isn't registered in the model
            if (!this.getObject(graphObject.id)) {
                return;
            }
            this.deselectAll();
            graphObject.isSelected = true;

            if (graphObject.type() === ns.GRAPH_TYPE_POINT_SET) {
                _(graphObject.points).each(function (point) {
                    point.isSelected = true;
                });
            }
        };

        GraphModel.prototype.deselectAll = function () {
            var deselectObject = function (object) {
                object.isSelected = false;
            };

            _(this.points).each(deselectObject);

            _(this.pointSets).each(function (pointSet) {
                pointSet.isSelected = false;
                _(pointSet.points).each(deselectObject);
            });

            _(this.lines).each(deselectObject);

            _(this.gliders).each(deselectObject);

            _(this.equations).each(deselectObject);

            _(this.axes.x.partitions).each(deselectObject);
            _(this.axes.y.partitions).each(deselectObject);
        };

        GraphModel.prototype.getObject = function (id) {
            return this.registry[id];
        };

        GraphModel.prototype.getAllPoints = function () {
            var allPoints = [];

            var self = this;
            _(this.registry).chain()
                .keys()
                .filter(function (id) {
                    return isPoint(self.getObject(id));
                }).each(function (id) {
                    allPoints.push(self.getObject(id));
                });

            return allPoints;
        };

        GraphModel.prototype.addPoint = function (point, pointSetId) {
            this.deselectAll();

            if (point.name === undefined && pointNameService !== undefined) {
                point.name = pointNameService.nextValidName(this.getAllPoints());
            }

            if (pointSetId !== undefined) {
                var pointSet = this.getObject(pointSetId);
                if (pointSet === undefined) {
                    return;
                }
                pointSet.addPoint(point);
            } else {
                this.points.push(point);
            }
            register(this, point);
        };

        GraphModel.prototype.moveExistingPointToPointSet = function (point, pointSetId) {
            var destinationPointSet = this.getObject(pointSetId);
            var add = false;
            if (destinationPointSet === undefined) {
                destinationPointSet = new ns.PointSet({
                    title: '',
                    label: ''
                });
                add = true;
            }
            if (this.points.indexOf(point) !== -1) {
                //This is an individual point, go ahead and move it into the point set.
                this.points.splice(this.points.indexOf(point), 1);
                destinationPointSet.addPoint(point);
            } else {
                //Must find the point set that this point is already in and remove it from there.
                _(this.pointSets).each(function (pointSet) {
                    if (pointSet.containsPoint(point)) {
                        pointSet.removePoint(point);
                        destinationPointSet.addPoint(point);
                    }
                });
            }
            if (add) {
                this.addPointSet(destinationPointSet);
            }
            return destinationPointSet.id;
        };

        // assumes newPoint is already in model
        GraphModel.prototype.replacePoint = function (oldPoint, newPoint, removePoint) {
            // currently only need to replace point in lines, so that's all I'm implementing
            _(this.lines).each(function (line) {
                if (line.start === oldPoint) {
                    line.start = newPoint;
                }

                if (line.end === oldPoint) {
                    line.end = newPoint;
                }
            });

            if (removePoint === true) {
                this.removePoint(oldPoint);
            }
        };

        GraphModel.prototype.findPoints = function (x, y) {
            var points = [];

            // search standalone points
            _(this.points).each(function (point) {
                if (point.x.val() === x && point.y.val() === y) {
                    points.push(point);
                }
            });

            // search point sets
            _(this.pointSets).each(function (pointSet) {
                _(pointSet.points).each(function (point) {
                    if (point.x.val() === x && point.y.val() === y) {
                        points.push(point);
                    }
                });
            });

            return points;
        };

        GraphModel.prototype.findNearestPoints = function (x, y, isXAxis) {
            var tmpPoint = new ns.Point({x: x, y: y});
            var points = [];
            var minDist;

            _(this.points).chain()
                .reject(function (point) {
                    return point.isHidden === true;
                })
                .each(function (point) {
                    var dist = tmpPoint.distanceFrom(point);
                    minDist = minDist === undefined ? dist : minDist;
                    if(isXAxis !== undefined && point.xAxis !== isXAxis) {
                        return;
                    }
                    if (dist === minDist) {
                        points.push(point);
                    } else if (dist < minDist) {
                        minDist = dist;
                        points = [point];
                    }
                });

            _(this.pointSets).each(function (pointSet) {
                _(pointSet.points).chain()
                    .reject(function (point) {
                        return point.isHidden === true;
                    })
                    .each(function (point) {
                        var dist = tmpPoint.distanceFrom(point);
                        minDist = minDist === undefined ? dist : minDist;
                        if(isXAxis !== undefined && point.xAxis !== isXAxis) {
                            return;
                        }
                        if (dist === minDist) {
                            points.push(point);
                        } else if (dist < minDist) {
                            minDist = dist;
                            points = [point];
                        }
                    });
            });

            return points;
        };

        GraphModel.prototype.labelPoint = function (point, label) {
            point.setPointLabel (label);
        };

        GraphModel.prototype.labelPartition = function (partition, label) {
            partition.numberLinePointLabel = label;
        };

        GraphModel.prototype.removePoint = function (point) {
            var index = this.points.indexOf(point);
            var pointWasRemoved = false;
            if (index >= 0) {
                this.points.splice(index, 1);
                this.removeElementsWithPoint(point);
                pointWasRemoved = true;
            } else {
                var pointSet = _(this.pointSets).find(function (pointSet) {
                    index = pointSet.points.indexOf(point);
                    return index >= 0;
                });
                if (pointSet) {
                    pointSet.points.splice(index, 1);
                    this.removeElementsWithPoint(point);

                    pointWasRemoved = true;
                }
            }

            if (pointWasRemoved) {
                this.deselectAll();
                unregister(this, point);
            }

            return pointWasRemoved;
        };

        GraphModel.prototype.removeElementsWithPoint = function (point) {
            // find lines associated with point
            var assocLines = _(this.lines).filter(function (line) {
                return line.start === point || line.end === point;
            });
            // remove lines
            _(assocLines).each(function(line) {
                this.removeLine(line);
            }, this);

            //TODO - remove any gliders associated with deleted line
        };

        GraphModel.prototype.addPointSet = function (pointSet) {
            this.pointSets.push(pointSet);
            var self = this;
            _(pointSet.points).each(function (point) {
                register(self, point);
            });
            register(this, pointSet);
        };

        GraphModel.prototype.removePointSet = function (pointSet) {
            var index = this.pointSets.indexOf(pointSet);
            if (index >= 0) {
                var self = this;
                _(pointSet.points).each(function (point) {
                    unregister(self, point);
                });
                this.pointSets.splice(index, 1);
                unregister(this, pointSet);
                return true;
            }
            return false;
        };

        GraphModel.prototype.addLine = function (line) {
            this.lines.push(line);
            register(this, line);
        };

        GraphModel.prototype.removeLine = function (line) {
            var index = this.lines.indexOf(line);
            return removeLineAtIndex(this, index);
        };

        function removeLineAtIndex(model, index) {
            if (index >= 0) {
                var line = model.lines.splice(index, 1)[0];
                var gliders = model.findGlidersForLine(line);
                _(gliders).each(function (glider) {
                    model.removeGlider(glider);
                });
                unregister(model, line);
                return true;
            }
            return false;
        }

        GraphModel.prototype.removeAllLines = function () {
            while (this.lines.length > 0) {
                removeLineAtIndex(this, 0);
            }
        };

        GraphModel.prototype.getNearestIntersection = function (x, y) {
            var nearestX = this.axes.x.getNearestTick(x);
            var nearestY = this.axes.y.getNearestTick(y);
            return new ns.Point({x: nearestX, y:nearestY});
        };

        GraphModel.prototype.addGlider = function (glider) {
            this.deselectAll();

            this.gliders.push(glider);
            register(this, glider);
        };

        GraphModel.prototype.removeGlider = function (glider) {
            var index = this.gliders.indexOf(glider);
            if(index >= 0) {
                this.gliders.splice(index, 1);
                unregister(this, glider);
                return true;
            }
            return false;
        };

        GraphModel.prototype.findGlidersForLine = function (line) {
            return _(this.gliders).filter(function (glider) {
                return glider.getParentLine() === line;
            });
        };

        GraphModel.prototype.findNearestGliders = function (x, y) {
            var gliders = [];
            var minDist;

            _(this.gliders).each(function (glider) {
                var dist = glider.distSqFrom([x, y]);
                minDist = minDist === undefined ? dist : minDist;
                if (dist === minDist) {
                    gliders.push(glider);
                } else if (dist < minDist) {
                    minDist = dist;
                    gliders = [glider];
                }
            });
            return gliders;
        };

        GraphModel.prototype.findNearestDivider = function(x,y) {
            var sortedDividers = _.sortBy(_.union(this.axes.x.dividers,this.axes.y.dividers), function (divider) {
                return (divider.handle.x - x)*(divider.handle.x - x) + (divider.handle.y - y)*(divider.handle.y - y);
            });
            return sortedDividers[0];
        };
        GraphModel.prototype.removeObject = function (obj) {
            var type = obj.type();
            if (type === ns.GRAPH_TYPE_POINT) {
                return this.removePoint(obj);
            } else if (type === ns.GRAPH_TYPE_POINT_SET) {
                return this.removePointSet(obj);
            } else if (type === ns.GRAPH_TYPE_LINE) {
                return this.removeLine(obj);
            } else if (type === ns.GRAPH_TYPE_GLIDER) {
                return this.removeGlider(obj);
            } else if (type === ns.GRAPH_TYPE_EQUATION) {
                return this.removeEquation(obj);
            }
        };

        GraphModel.prototype.getVisiblePoints = function () {
            return _(this.points).filter(function (point) {
                return point.isHidden !== true;
            });
        };

        GraphModel.prototype.addEquation = function (equation) {
            this.deselectAll();

            this.equations.push(equation);
            register(this, equation);
        };

        GraphModel.prototype.removeEquation = function (equation) {
            var index = this.equations.indexOf(equation);
            if(index >= 0) {
                this.equations.splice(index, 1);
                unregister(this, equation);
                return true;
            }
            return false;
        };

        GraphModel.prototype.removeAllEquations = function () {
            while (this.equations.length > 0) {
                var equation = this.equations.splice(0, 1)[0];
                unregister(this, equation);
            }
        };

        GraphModel.prototype.expandToFitPoints = function() {
            if (this.points.length > 0) {
                var minX = this.points[0].x.val();
                var maxX = minX;
                var minY = this.points[0].y.val();
                var maxY = minY;

                _(this.points).each(function (point) {
                    var x = point.x.val();
                    var y = point.y.val();
                    minX = Math.min(x, minX);
                    maxX = Math.max(x, maxX);
                    minY = Math.min(y, minY);
                    maxY = Math.max(y, maxY);
                });

                if (minX < this.axes.x.min.x.val()) {
                    this.axes.x.min.x.setVal(minX);
                }
                if (maxX > this.axes.x.max.x.val()) {
                    this.axes.x.max.x.setVal(maxX);
                }
                if (minY < this.axes.y.min.y.val()) {
                    this.axes.y.min.y.setVal(minY);
                }
                if (maxY > this.axes.y.max.y.val()) {
                    this.axes.y.max.y.setVal(maxY);
                }
            }
        };

        GraphModel.prototype.expandToSquare = function() {
            var minX = this.axes.x.min.x.val();
            var maxX = this.axes.x.max.x.val();
            var minY = this.axes.y.min.y.val();
            var maxY = this.axes.y.max.y.val();
            var xExtent = maxX - minX;
            var yExtent = maxY - minY;
            var sideAdd;
            if (xExtent > yExtent) {
                sideAdd = (xExtent - yExtent) / 2;
                this.axes.y.max.y.setVal(maxY + sideAdd);
                this.axes.y.min.y.setVal(minY - sideAdd);
            } else if (xExtent < yExtent) {
                sideAdd = (yExtent - xExtent) / 2;
                this.axes.x.max.x.setVal(maxX + sideAdd);
                this.axes.x.min.x.setVal(minX - sideAdd);
            }
        };

        GraphModel.prototype.getNextPartitionColor = function () {
            var colors = mt.common.PARTITION_COLORS;
            var xParts = this.axes.x.partitions;
            var yParts = this.axes.y.partitions;
            for(var i in colors) {
                if(_(xParts).findWhere({color: colors[i]}) === undefined && _(yParts).findWhere({color: colors[i]}) === undefined) {
                    return colors[i];
                }
            }
            //deal with no available colors - iterate back through colors
            var nextColIndex = (xParts.length + yParts.length)%colors.length;
            return colors[nextColIndex];
        };

        GraphModel.prototype.addPartitionedRange = function (isXAxis, min, max, numPartitions) {
            var axis = isXAxis? this.axes.x: this.axes.y;
            var color = this.getNextPartitionColor();
            var partition = new ns.PartitionedRange(min, max, numPartitions, color, isXAxis);
            axis.partitions.push(partition);

            return partition;
        };

        GraphModel.prototype.removePartitionedRange = function (partition) {
            var axis = partition.isXAxis? this.axes.x: this.axes.y;
            var index = axis.partitions.indexOf(partition);
            axis.partitions.splice(index, 1);
        };

        //find nearest partition by max or min handle
        GraphModel.prototype.findNearestPartitionedRange = function (val, isXAxis, useMaxHandle) {
            var nearestPartition;
            var minDist;

            var partitions = isXAxis? this.axes.x.partitions: this.axes.y.partitions;
            _(partitions).each(function (partition) {
                var handle = useMaxHandle? partition.max: partition.min;
                if(minDist === undefined || Math.abs(handle.val() - val) < minDist) {
                    nearestPartition = partition;
                    minDist = Math.abs(handle.val() - val);
                }
            });

            return nearestPartition;
        };

        //return the first partitioned range that overlaps a point
        GraphModel.prototype.getPartionedRangeAtPoint = function (val, isXAxis, getLast) {
            var partitions = isXAxis? this.axes.x.partitions: this.axes.y.partitions;
            if (getLast === true) {
                partitions = partitions.slice(0).reverse();
            }
            return _(partitions).find(function (partition) {
                return partition.getMin().val() < val && partition.getMax().val() > val;
            });
        };

        GraphModel.prototype.setMaxTicks = function(ticksNum) {
            this.axes.y.forcedMaxTicks = ticksNum;
            this.axes.x.forcedMaxTicks = ticksNum;
        };

        GraphModel.prototype.setPercentZoom = function(zoomVal) {
            this.axes.y.max.y.setVal(zoomVal);
            this.axes.x.max.x.setVal(zoomVal);
        };

        GraphModel.prototype.setHundredPercentValue = function(val) {
            if (isNaN(val) || val < 1) {
                return;
            }
            val = parseInt(val, 10);
            if (this.axes.y.max !== undefined) {
                this.axes.y.max.y.setVal(val);
            }
            if (this.axes.x.max !== undefined) {
                this.axes.x.max.x.setVal(val);
            }
            this.setMaxTicks(val);
            this.hundredPercentValue = val;
        };

        GraphModel.prototype.getPercentOfValue = function(val) {
            var returnVal = (((val.val() / this.hundredPercentValue) * 100).toFixed(2) + '%');
            while (returnVal.indexOf('0%') !== -1) {
                returnVal = returnVal.replace('0%', '%');
            }
            returnVal = returnVal.replace('.%', '%');
            return returnVal;
        };

        GraphModel.prototype.resetPercentBarTextCalc = function() {
            this.percentLabelRenderZones = [[[]],[[]]];
        };

        GraphModel.prototype.getYPosOfPercentBarText = function(x, width, top, obj) {
            var newPos = {
                x: x,
                width: width,
                left: (x - (width / 2)),
                right: (x + (width / 2)),
                obj: obj
            };
            var minHeight = 20;
            var arrayNum = (top) ? 0 : 1;
            for (var py = 0; py < this.percentLabelRenderZones[arrayNum].length; py++) {
                var lastPos = {x:-1000, width: 0, left: -1000, right: -1000, obj: undefined};
                var collision = false;
                for (var px = 0; px < this.percentLabelRenderZones[arrayNum][py].length && !collision; px++) {
                    var thisPos = this.percentLabelRenderZones[arrayNum][py][px];
                    if (newPos.left > lastPos.right && newPos.right < thisPos.left) {
                        newPos.y = py * minHeight;
                        this.percentLabelRenderZones[arrayNum][py].splice(px, 0, newPos);
                        return newPos.y;
                    }
                    if ((newPos.left < lastPos.right && newPos.right > lastPos.left)) {
                        collision = true;
                    } else {
                        lastPos = thisPos;
                    }
                }
                if (!collision && (newPos.left < lastPos.right && newPos.right > lastPos.left)) {
                    collision = true;
                }
                if (!collision) {
                    newPos.y = py * minHeight;
                    this.percentLabelRenderZones[arrayNum][py].push(newPos);
                    return newPos.y;
                }
            }
            newPos.y = (this.percentLabelRenderZones[arrayNum].length) * minHeight;
            var newZone = [newPos];
            this.percentLabelRenderZones[arrayNum].push(newZone);
            return newPos.y;
        };

        GraphModel.prototype.getPercentZoneByObj = function(obj, top) {
            var arrayNum = 1;
            if (top) {
                arrayNum = 0;
            }

            for (var y = 0; y < this.percentLabelRenderZones[arrayNum].length; y++) {
                for (var x = 0; x < this.percentLabelRenderZones[arrayNum][y].length; x++) {
                    var zone = this.percentLabelRenderZones[arrayNum][y][x];
                    if (zone.obj === obj) {
                        return zone;
                    }
                }
            }
            return undefined;
        };

        GraphModel.prototype.getPercentTextObj = function(x, y, lineY) {
            var percentBarHeight = ns.PERCENT_BAR_HEIGHT;
            var arrayNum;

            if (y < lineY - percentBarHeight / 2) {
                arrayNum = 0;
            } else if (y > lineY + percentBarHeight / 2) {
                arrayNum = 1;
            } else {
                return undefined;
            }
            var closestPoint;
            var distanceToPoint = 30;
            var arrayToCheck = this.percentLabelRenderZones[arrayNum];
            y = Math.abs(y - lineY);
            for (var n = 0; n < arrayToCheck.length; n++) {
                for (var m = 0; m < arrayToCheck[n].length; m++) {
                    var point = arrayToCheck[n][m];
                    var xDist = Math.abs(x - point.x);
                    var yDist = Math.abs(y - (point.y + 25));
                    var distance = Math.sqrt((xDist * xDist) + (yDist * yDist));
                    if (distance < distanceToPoint) {
                        distanceToPoint = distance;
                        closestPoint = point.obj;
                    }
                }
            }

            return closestPoint;
        };

        GraphModel.prototype.setCustomPartitionSet = function(customPartitionSet) {
            this.customPartitionSet = customPartitionSet;
        };

        //NumberHunt
        GraphModel.prototype.setNumberHunt = function(lowNum, highNum, huntNum, huntOptions) {
            this.lowNum = lowNum;
            this.highNum = highNum;
            this.huntNum = huntNum;
            this.huntOptions = (huntOptions) ? huntOptions : {};
            if (this.huntOptions.isIdentify) {
                this.huntPoint = ns.Point({
                    x: new mt.common.MtValue(0),
                    y: huntNum
                });
            }
            this.points = [];
            this.errorPoints = [];
            this.axes.y.partitions = [];
        };

        return GraphModel;
    })();
})(window.mt.common);

(function (ns) {

    'use strict';

    //view config responsible for mapping between graph and view space for both graph and numberline
    ns.GraphRenderer = (function () {

        function GraphRenderer(containerElement, graphModel, viewConfig, lineRectIntersectionFactory, toolId) {
            this.graphModel = graphModel;
            this.viewConfig = viewConfig;
            this.lineRectIntersectionFactory = lineRectIntersectionFactory;

            this.containerElement = containerElement;
            this.initSVG(toolId);
        }

        GraphRenderer.prototype.initSVG = function (toolId) {
            var svg = d3.select(this.containerElement.childNodes[0]);
            this.vis = svg.append('svg:g');

            this.clipId = 'clip' + toolId;
            svg.append('svg:defs').append('svg:clipPath')
                .attr('id', this.clipId)
                .append('svg:rect')
                    .attr('x', this.viewConfig.margin)
                    .attr('y', this.viewConfig.margin)
                    .attr('width', this.viewConfig.width - (2 * this.viewConfig.margin))
                    .attr('height', this.viewConfig.height - (2 * this.viewConfig.margin));

            this.gridGroup = this.vis.append('svg:g');
            this.axisGroup = this.vis.append('svg:g');
            this.tickGroup = this.vis.append('svg:g');
            this.tickLabelGroup = this.vis.append('svg:g');
            this.axisLabelGroup = this.vis.append('svg:g');
            this.lineGroup = this.vis.append('svg:g');
            this.lineListenerGroup = this.vis.append('svg:g');
            this.pointGroup = this.vis.append('svg:g');
            this.gliderGroup = this.vis.append('svg:g');
        };

        GraphRenderer.prototype.render = function (updateAxes) {
            this.graphModel.resetPercentBarTextCalc();

            if (this.viewConfig.isPercentbar) {
                updateAxes = true;
            }
            if(updateAxes !== false) {
                this.viewConfig.update(this.graphModel.axes.x.min.x.val(), this.graphModel.axes.x.max.x.val(),
                    this.graphModel.axes.y.min.y.val(), this.graphModel.axes.y.max.y.val());
                if(this.viewConfig.isDouble === true) {
                    this.renderAxis(this.graphModel.axes.x, true);
                }
                if(this.viewConfig.isPercentbar) {
                    this.renderPercentBar(this.graphModel.axes.y, false);
                } else {
                    this.renderAxis(this.graphModel.axes.y, false);
                }
            }
            if (this.viewConfig.isNumberhunt) {
                var axis = this.graphModel.axes.y;
                var huntLowPoint = ns.Point({
                    x: new mt.common.MtValue(0),
                    y: this.graphModel.lowNum
                });
                var huntHighPoint = ns.Point({
                    x: new mt.common.MtValue(0),
                    y: this.graphModel.highNum
                });
                var offset = [0, - (ns.PERCENT_BAR_HEIGHT / 2)];
                if (this.graphModel.huntOptions.isIdentify) {
                    this.renderPoints([this.graphModel.huntPoint], {isIdentify: true});
                    this.drawPercentTickLabelsTop(false, [this.graphModel.huntPoint], ns.NUMBER_HUNT_LABEL, [0, 0], axis.isXAxis, false, offset);
                } else {
                    this.renderPoints([], {isIdentify: true});
                    this.drawPercentTickLabelsTop(false, [], ns.NUMBER_HUNT_LABEL, [0, 0], axis.isXAxis, false, offset);
                }
                this.renderPoints(this.graphModel.errorPoints, {errorPoint: true});
                this.renderPoints([huntLowPoint, huntHighPoint], {huntMarker: true});
            }

            var allPoints = this.graphModel.points;
            _(this.graphModel.pointSets).each(function (pointSet) {
                allPoints = allPoints.concat(pointSet.points);
            });

            var options = {};
            if (this.viewConfig.isNumberhunt) {
                options.huntPoint = true;
            }
            this.renderPoints(allPoints, options);

            this.renderLines(this.graphModel.lines, this.graphModel.equations);

            this.renderGliders(this.graphModel.gliders);

            if(this.viewConfig.isDouble === true) {
                this.drawPartitions(this.graphModel.axes.x);
            }
            this.drawPartitions(this.graphModel.axes.y);

        };

        GraphRenderer.prototype.renderItem = function (group, data, className, type, renderFn, insert) {
            var viewConfig = this.viewConfig;
            function xPos(valX, valY, xAxis) { return viewConfig.transformToPos(valX, valY, xAxis)[0];}
            function yPos(valX, valY, xAxis) { return viewConfig.transformToPos(valX, valY, xAxis)[1];}

            var elements = group.selectAll('.' + className).data(data);

            if (insert === true) {
                elements.enter().insert(type).attr('class', className);
            } else {
                elements.enter().append(type).attr('class', className);
            }

            renderFn(elements, xPos, yPos);

            elements.exit().remove();
        };

        GraphRenderer.prototype.renderPercentBar = function (axis, isXAxis) {
            //render the line from axis min to axis max - graph space coordinates
            var axisName = isXAxis? ns.GRAPH_X_AXIS_CLASS: ns.GRAPH_Y_AXIS_CLASS;

            var showAxes = this.graphModel.showAxes;

            var min = this.viewConfig.transformToPos(axis.min.x.val(), axis.min.y.val(), isXAxis);
            var max = this.viewConfig.transformToPos(axis.max.x.val(), axis.max.y.val(), isXAxis);
            this.renderItem(this.axisGroup, [axis], axisName, 'svg:rect', function(elements, xPos, yPos) {
                elements.attr('x', function (d) { return min[0]; })
                    .attr('y', function (d) { return min[1] - (ns.PERCENT_BAR_HEIGHT / 2); })
                    .attr('width', function (d) { return max[0] - min[0]; })
                    .attr('height', function (d) { return ns.PERCENT_BAR_HEIGHT; })
                    .attr('class', function(d) { return showAxes ? axisName : axisName + ' ' + ns.GRAPH_HIDDEN_CLASS;})
                    .style('stroke', ns.GRAPH_AXIS_COLOR)
                    .style('fill', 'none')
                    .style('stroke-width', ns.GRAPH_AXIS_WIDTH);
            }, true);


            var originOffset = [0, 0];
            var percentBarTicks = [
                new mt.common.Point({
                    x: 0,
                    y: 0,
                    numberLinePointLabel: '0'
                }),
                new mt.common.Point({
                    x: 0,
                    y: axis.max.y.val(),
                    numberLinePointLabel: ((this.graphModel.maxPercentLabel !== undefined) ? this.graphModel.maxPercentLabel : '')
                })
            ];
            percentBarTicks[1].isMaxPercentLabel = true;
            this.drawPercentTickLabels(percentBarTicks, axisName + '-tick-label', originOffset, isXAxis);
            if (percentBarTicks[1].y.val() !== 100){
                this.renderHundredPercentPoint();
            }
        };

        GraphRenderer.prototype.renderHundredPercentPoint = function(){
            var clipId = (!this.viewConfig.isGraph) ? '' : this.clipId;
            var originOffset = [0, 0];
            var points = [];
            var hundredPoint = new mt.common.Point({
                x: 0,
                y: 100,
                xAxis: false,
                numberLinePointLabel: ((this.graphModel.hundredPercentLabel !== undefined) ? this.graphModel.hundredPercentLabel : '')
            });
            hundredPoint.isHundredLabel = true;
            points.push(hundredPoint);

            this.renderItem(this.pointGroup, points, '-perm-point', 'svg:line', function(elements, xPos, yPos) {
                elements.attr('y1', function (d) { return yPos(d.x.val(), d.y.val(), d.xAxis) - (ns.PERCENT_BAR_HEIGHT / 2); })
                    .attr('y2', function (d) { return yPos(d.x.val(), d.y.val(), d.xAxis) + (ns.PERCENT_BAR_HEIGHT / 2); })
                    .attr('x1', function (d) { return xPos(d.x.val(), d.y.val(), d.xAxis); })
                    .attr('x2', function (d) { return xPos(d.x.val(), d.y.val(), d.xAxis); })
                    .style('stroke', 'rgb(0,0,0)')
                    .style('stroke-width', function (d) { return d.isSelected === true ? ns.PERCENT_BAR_POINT_WIDTH_SELECTED : ns.PERCENT_BAR_POINT_WIDTH;})
                    .attr('clip-path', 'url(#' + clipId + ')');
            });

            this.drawPercentTickLabels(points, ns.GRAPH_POINT_LABEL_CLASS + '-perm-percent', originOffset, false);
        };

        GraphRenderer.prototype.renderAxis = function (axis, isXAxis) {
            //render the line from axis min to axis max - graph space coordinates
            var axisName = isXAxis? ns.GRAPH_X_AXIS_CLASS: ns.GRAPH_Y_AXIS_CLASS;

            var showAxes = this.graphModel.showAxes;

            var min = this.viewConfig.transformToPos(axis.min.x.val(), axis.min.y.val(), isXAxis);
            var max = this.viewConfig.transformToPos(axis.max.x.val(), axis.max.y.val(), isXAxis);
            if(this.viewConfig.isGraph) {
                min = this.viewConfig.clamp(min[0], min[1], !isXAxis, isXAxis);
                max = this.viewConfig.clamp(max[0], max[1], !isXAxis, isXAxis);
            }
            this.renderItem(this.axisGroup, [axis], axisName, 'svg:line', function(elements, xPos, yPos) {
                elements.attr('x1', function (d) { return min[0]; })
                    .attr('y1', function (d) { return min[1]; })
                    .attr('x2', function (d) { return max[0]; })
                    .attr('y2', function (d) { return max[1]; })
                    .attr('class', function(d) { return showAxes ? axisName : axisName + ' ' + ns.GRAPH_HIDDEN_CLASS;})
                    .style('stroke', ns.GRAPH_AXIS_COLOR)
                    .style('stroke-width', ns.GRAPH_AXIS_WIDTH);
            }, true);


            //get ticks as an array of fractions
            var minorTicks = axis.getTicks(this.viewConfig.mode);
            var majorTicks = _(minorTicks).filter(function (tick) {
                return tick.isMajor === true;
            });

            //+ve offset
            var offsetA, offsetB;

            var originPos = this.viewConfig.transformToPos(0,0);
            var originOffset = [0, 0];
            //clamp static coord in originPos
            if(this.viewConfig.isGraph) {
                var clampedOrigin = this.viewConfig.clamp(originPos[0], originPos[1], !isXAxis, isXAxis);
                originOffset = [-clampedOrigin[0] + originPos[0], -clampedOrigin[1] + originPos[1]];
                originPos = this.viewConfig.clamp(originPos[0], originPos[1], isXAxis, !isXAxis);
            }

            if(!this.viewConfig.isGraph) {
                offsetA = {x:0, y:0};
                offsetB = {x:0, y:ns.GRAPH_TICK_LENGTH};
            } else if(isXAxis) {
                offsetA = {x: 0, y: this.viewConfig.margin - originPos[1] };
                offsetB = {x: 0, y: this.viewConfig.height - this.viewConfig.margin - originPos[1]};
            } else {
                offsetA = {x: this.viewConfig.width - this.viewConfig.margin - originPos[0], y: 0};
                offsetB = {x: this.viewConfig.margin - originPos[0], y: 0};
            }

            this.drawTicks(this.gridGroup, minorTicks, axisName + '-minor-grid-line', offsetA, offsetB, isXAxis);
            if (this.viewConfig.isGraph) {
                this.drawTicks(this.gridGroup, majorTicks, axisName + '-major-grid-line', offsetA, offsetB, isXAxis);
            }

            this.renderAxisArrows(min, max, axisName, isXAxis);


            //in numberline mode render the minor tick marks too
            var labeledTicks;
            if(!this.viewConfig.isGraph) {
                labeledTicks = _(minorTicks).filter(function (tick) {
                    return tick.drawLabel === true;
                });

                this.drawTickLabels(labeledTicks, axisName + '-tick-label', originOffset, isXAxis);

                if(axis.fractionMode === ns.NUMBERLINE_FRAC_DEC_MODE) {
                    this.drawTickLabels(labeledTicks, axisName + '-tick-label-dec', [0, -40], isXAxis, true);
                } else {
                    this.drawTickLabels([], axisName + '-tick-label-dec', [0, -40], isXAxis, true);
                }

                if(labeledTicks.length > 0 && labeledTicks[0].isFraction) {
                    //filter out ticks with unit denominator
                    var fracTicks = _(labeledTicks).filter(function (tick) {
                        return tick.denom !== 1;
                    });

                    this.drawTickLabelDividers(fracTicks, axisName + '-tick-label-divider', originOffset, isXAxis);
                    this.drawTickLabelDenom(fracTicks, axisName + '-tick-label-denom', originOffset, isXAxis);
                } else {
                    this.drawTickLabelDividers([], axisName + '-tick-label-divider', originOffset, isXAxis);
                    this.drawTickLabelDenom([], axisName + '-tick-label-denom', originOffset, isXAxis);
                }
            } else {
                labeledTicks = _(majorTicks).filter(function (tick) {
                    return tick.drawLabel === true;
                });
                this.drawTickLabels(labeledTicks, axisName + '-tick-label', originOffset, isXAxis);
            }

            var viewConfig = this.viewConfig;
            this.renderItem(this.axisLabelGroup, [axis], axisName + '-label', 'svg:text', function (elements, xPos, yPos) {
                var halfMargin = viewConfig.margin / 2;
                var x = isXAxis === true ? viewConfig.width - viewConfig.margin : halfMargin;
                var y = isXAxis === true ? viewConfig.height - halfMargin : halfMargin;
                var transform = isXAxis === true ? '' : 'rotate(-90 ' + halfMargin + ' ' + halfMargin + ')';

                elements.text(function (d) { return d.label !== undefined ? d.label.val() : undefined; })
                    .attr('x', x)
                    .attr('y', y)
                    .attr('transform', transform)
                    .attr('text-anchor', 'end');
            });
        };

        GraphRenderer.prototype.drawTicks = function (group, ticks, className, offsetA, offsetB, isXAxis) {
            var showGridLines = this.graphModel.showGridLines;
            this.renderItem(group, ticks, className, 'svg:line', function (elements, xPos, yPos) {
                function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                elements.attr('x1', function (d) { return tickXPos(d.val()) + offsetA.x; })
                    .attr('y1', function (d) { return  tickYPos(d.val()) + offsetA.y; })
                    .attr('x2', function (d) { return tickXPos(d.val()) + offsetB.x; })
                    .attr('y2', function (d) { return tickYPos(d.val()) + offsetB.y; })
                    .attr('class', function(d) { return showGridLines ? className : className + ' ' + ns.GRAPH_HIDDEN_CLASS; })
                    .attr('stroke', function(d) { return d.drawLabel? '#A8A8A8': (d.color? d.color: '#CDCDCD'); });
            });
        };

        GraphRenderer.prototype.drawPartitions = function (axis) {
            var axisName = axis.isXAxis? ns.GRAPH_X_AXIS_CLASS: ns.GRAPH_Y_AXIS_CLASS;

            var min = axis.isXAxis === true ? axis.min.x: axis.min.y;
            var max = axis.isXAxis === true ? axis.max.x: axis.max.y;

            var partitionTicks = [];

            var yOffset = ns.GRAPH_TICK_LENGTH*4;
            var isPercentbar = this.viewConfig.isPercentbar;

            for(var iPartition in axis.partitions) {
                var partition = axis.partitions[iPartition];
                var ticks = [];
                if(this.viewConfig.isNumberhunt) {
                    ticks = partition.getVisibleTicks(partition.min, partition.max);
                } else {
                    ticks = partition.getVisibleTicks(min, max);
                }
                for(var iTick in ticks) {
                    ticks[iTick].color = partition.color;
                }
                partitionTicks = partitionTicks.concat(ticks);
            }

            if (isPercentbar) {
                partitionTicks.shift(); //remove the first tick
            }
            this.drawTicks(this.gridGroup, partitionTicks, axisName + '-partition-ticks', {x:0, y:-ns.GRAPH_TICK_LENGTH*2}, {x:0, y:0}, axis.isXAxis);
            if (isPercentbar === true){
                yOffset = 20;
            }
            this.drawPartitionBlocks(this.gridGroup, axis.partitions, axisName + '-partition-block', {x:0, y:-yOffset}, {x:0, y:yOffset}, axis.isXAxis);
            this.drawPartitionHandles(axis);

            if (this.viewConfig.isNumberhunt) {
                _.each(this.graphModel.tickLabels, function(labelPoint) {
                    labelPoint.found = false;
                });
                for (var pt in partitionTicks) {
                    var val = partitionTicks[pt].val();
                    if (Math.abs(this.graphModel.lowNum - val) < (1e-14) ||
                        Math.abs(this.graphModel.highNum - val) < (1e-14) ||
                        (this.graphModel.huntOptions.isIdentify && Math.abs(this.graphModel.huntNum.val() - val) < (1e-14))) {
                        continue;
                    }
                    var found = false;
                    for (var t in this.graphModel.tickLabels) {
                        if (Math.abs(this.graphModel.tickLabels[t].y.val() - val) < (1e-14)) {
                            this.graphModel.tickLabels[t].found = true;
                            found = true;
                            break;
                        }
                    }
                    if (found) {
                        continue;
                    }

                    var tickLabel = mt.common.Point({
                        x: 0,
                        y: val,
                        numberLinePointLabel: ''
                    });
                    tickLabel.found = true;
                    this.graphModel.tickLabels.push(tickLabel);
                }
                this.graphModel.tickLabels = _.where(this.graphModel.tickLabels, {found: true});

                var offset = [0, - (ns.PERCENT_BAR_HEIGHT / 2)];
                this.drawPercentTickLabelsTop(false, this.graphModel.tickLabels, ns.NUMBER_HUNT_PARTITION_LABEL, [0, 0], axis.isXAxis, false, offset);
            }

            if (isPercentbar) {
                var labelPoints = [];

                for (var p in axis.partitions) {
                    var newPoint = new mt.common.Point({
                        x: 0,
                        y: axis.partitions[p].max.val(),
                        numberLinePointLabel: ((axis.partitions[p].numberLinePointLabel !== undefined) ? axis.partitions[p].numberLinePointLabel : '')
                    });
                    newPoint.partition = axis.partitions[p];
                    labelPoints.push(newPoint);
                }
                var originOffset = [0, 0];
                this.drawPercentTickLabels(labelPoints, axisName + '-partition-percent', originOffset, false);
            }

        };

        GraphRenderer.prototype.drawPartitionHandles = function (axis) {
            var axisName = axis.isXAxis? ns.GRAPH_X_AXIS_CLASS: ns.GRAPH_Y_AXIS_CLASS;

            var className = axisName + '-partition-handles';

            var handles = [];
            for(var i in axis.partitions) {
                var partition = axis.partitions[i];
                if(axis.isXAxis) {
                    handles.push({x:partition.getMin().val(), y:0, color: partition.color, xAxis: partition.isXAxis});
                    handles.push({x:partition.getMax().val(), y:0, color: partition.color, xAxis: partition.isXAxis});
                } else {
                    if (this.viewConfig.isPercentbar !== true){
                        handles.push({x:0, y:partition.getMin().val(), color: partition.color, xAxis: partition.isXAxis});
                    }
                    handles.push({x:0, y:partition.getMax().val(), color: partition.color, xAxis: partition.isXAxis});
                }
            }

            this.renderItem(this.gridGroup, handles, className, 'svg:circle', function(elements, xPos, yPos) {
                elements.attr('cy', function (d) { return yPos(d.x, d.y, d.xAxis); })
                    .attr('cx', function (d) { return xPos(d.x, d.y, d.xAxis); })
                    .attr('r', function (d) { return ns.GRAPH_POINT_RADIUS;})
                    .attr('fill', function (d) { return d.color;})
                    .attr('stroke', function(d) { return d.color; });
            });
        };

        GraphRenderer.prototype.drawPartitionBlocks = function (group, partitions, className, offsetA, offsetB, isXAxis) {
            var rx = this.viewConfig.isPercentbar === true ? 0 : 5;
            var ry = this.viewConfig.isPercentbar === true ? 0 : 5;
            this.renderItem(group, partitions, className, 'svg:rect', function (elements, xPos, yPos) {
                function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                elements.attr('x', function (d) { return tickXPos(d.getMin().val()); })
                    .attr('y', function (d) { return tickYPos(d.getMin().val()) + offsetA.y; })
                    .attr('width', function (d) { return tickXPos(d.getMax().val()) - tickXPos(d.getMin().val()); })
                    .attr('height', offsetB.y - offsetA.y)
                    .attr('fill', function (d) { return d.color;})
                    .attr('id', function (d) { return d.id; })
                    .style('stroke', function (d) { return d.color;})
                    .style('stroke-width', function (d) { return d.isSelected? 2: 0;})
                    .attr('rx', rx)
                    .attr('ry', ry);
            });
        };

        function toFixedDown(val) {
            var returnVal = val.toFixed(2) + ' ';
            while (returnVal.indexOf('0 ') !== -1) {
                returnVal = returnVal.replace('0 ', ' ');
            }
            return returnVal.replace('. ', ' ').replace(' ', '');
        }

        function getPercentOfValue(val, hundredPercentValue, withPercentSymbol) {
            var returnVal = (((val.val() / hundredPercentValue) * 100).toFixed(2) + '%');
            while (returnVal.indexOf('0%') !== -1) {
                returnVal = returnVal.replace('0%', '%');
            }
            returnVal = returnVal.replace('.%', '%');
            return returnVal;
        }

        function percentLabel(point, label, percentMode, top, hundredPercentValue) {
            if (top) {
                if (percentMode === mt.common.PERCENT_BAR_MODE_ALL || percentMode === mt.common.PERCENT_BAR_MODE_VALUE) {
                    return toFixedDown(point.val());
                }
            } else {
                if (percentMode === mt.common.PERCENT_BAR_MODE_ALL || percentMode === mt.common.PERCENT_BAR_MODE_PERCENT) {
                    return getPercentOfValue(point, hundredPercentValue);
                }
            }
            return label;
        }

        GraphRenderer.prototype.drawPercentTickLabels = function (ticks, className, originOffset, isXAxis, forceDecimal) {
            var isGraph = this.viewConfig.isGraph;

            // don't draw zero label for y axis
            if (!isXAxis && isGraph) {
                ticks = _(ticks).filter(function (tick) {
                    return tick.val() !== 0;
                });
            }

            var offset;
            if (this.viewConfig.isPercentbar) {
                offset = [0, - (ns.PERCENT_BAR_HEIGHT / 2) - 5];
            } else if(!isGraph || isXAxis) {
                offset = [0, ns.GRAPH_TICK_LENGTH*3];
            } else {
                offset = [ns.GRAPH_TICK_LENGTH*2, 5];
            }

            this.drawPercentTickLabelsTop(true, ticks, className, originOffset, isXAxis, forceDecimal, offset);
            this.drawPercentTickLabelsTop(false, ticks, className, originOffset, isXAxis, forceDecimal, offset);
        };

        GraphRenderer.prototype.drawPercentTickLabelsTop = function (isTop, ticks, className, originOffset, isXAxis, forceDecimal, offset) {
            var showAxes = this.graphModel.showAxes;
            var clazz = className + '-top';
            var classHighlight = className + '-highlight-top';
            if(!isTop) {
                clazz = className + '-bottom';
                classHighlight = className + '-highlight-bottom';
            }

            var graphModel = this.graphModel;
            var self = this;

            this.renderItem(this.tickLabelGroup, ticks, clazz, 'svg:text', function (elements, xPos, yPos) {
                function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                elements.text(function (d) { return percentLabel(d.y, d.numberLinePointLabel, graphModel.percentBarMode, isTop, graphModel.hundredPercentValue); })
                    .attr('x', function (d) {
                        // offset zero label to avoid y axis
                        return tickXPos(d.y.val()) + offset[0] - originOffset[0];
                    })
                    .attr('y', function (d) {
                        var newX = tickXPos(d.y.val()) + offset[0] - originOffset[0];
                        var topWidth = self.getSVGTextWidth(percentLabel(d.y, d.numberLinePointLabel, graphModel.percentBarMode, isTop, graphModel.hundredPercentValue));
                        var newY = graphModel.getYPosOfPercentBarText(newX, topWidth, isTop, d);
                        if (!isTop) {
                            newY =  -newY - (ns.PERCENT_BAR_HEIGHT + 20);
                        }
                        return tickYPos(d.y.val()) + offset[1] - originOffset[1] - newY;
                    })
                    .attr('class', function(d) { return className + ' ' + clazz + (showAxes ? '' : ' ' + ns.GRAPH_HIDDEN_CLASS);})
                    .attr('text-anchor', 'middle');
            });
            this.renderItem(this.tickLabelGroup, ticks, classHighlight, 'svg:rect', function (elements, xPos, yPos){
                function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}
                elements.attr('x', function(d) {
                    var highlightObjX = graphModel.getPercentZoneByObj(d, isTop);
                    var XW = (highlightObjX.width > 10) ? highlightObjX.width : 10;
                    return highlightObjX.x - XW / 2;
                })
                    .attr('y', function (d) {
                        var highlightObjY = graphModel.getPercentZoneByObj(d, isTop);
                        var highlightOffset = -15 - highlightObjY.y;
                        if (!isTop) {
                            highlightOffset = ns.PERCENT_BAR_HEIGHT + 5 + highlightObjY.y;
                        }
                        return tickYPos(d.y.val()) + offset[1] - originOffset[1] + highlightOffset;
                    })
                    .attr('width', function (d){
                        var highlightObjW = graphModel.getPercentZoneByObj(d, isTop);
                        var hightlightW = (highlightObjW.width > 10) ? highlightObjW.width : 10;
                        return hightlightW;
                    })
                    .attr('height', 20)
                    .style('fill', function (d) {
                        var hightlightString = percentLabel(d.y, d.numberLinePointLabel, graphModel.percentBarMode, isTop, graphModel.hundredPercentValue);
                        var shouldBeMode = mt.common.PERCENT_BAR_MODE_PERCENT;
                        if (!isTop) {
                            shouldBeMode = mt.common.PERCENT_BAR_MODE_VALUE;
                        }
                        if (((!isTop && self.viewConfig.isNumberhunt) || graphModel.percentBarMode === shouldBeMode) &&
                            (hightlightString === undefined || hightlightString.length === 0)) {
                            var highlightColor = (self.viewConfig.isNumberhunt) ? 'lightblue': 'lightgray';
                            if (clazz.indexOf('mt-hunt-label') !== -1) {
                                highlightColor = 'blue';
                            }
                            return highlightColor;
                        }
                        return 'none';
                    })
                    .style('stroke-width', '1px')
                    .classed('is-percent-bar-selected', function (d) {
                        return (graphModel.highlightTarget !== undefined &&
                            ((d.isMaxPercentLabel === true && graphModel.highlightTarget.isMaxPercentLabel === true) ||
                                (d.isHundredLabel === true && graphModel.highlightTarget.isHundredLabel === true) ||
                                d === graphModel.highlightTarget || d.partition === graphModel.highlightTarget) &&
                            graphModel.percentBarMode === mt.common.PERCENT_BAR_MODE_PERCENT);
                    });
            });
        };

        GraphRenderer.prototype.drawTickLabels = function (ticks, className, originOffset, isXAxis, forceDecimal) {
            if (this.viewConfig.isNumberhunt) {
                return;
            }
            var isGraph = this.viewConfig.isGraph;
            var showAxes = this.graphModel.showAxes;

            // don't draw zero label for y axis
            if (!isXAxis && isGraph) {
                ticks = _(ticks).filter(function (tick) {
                    return tick.val() !== 0;
                });
            }

            var offset;
            if (this.viewConfig.isPercentbar) {
                offset = [0, - (ns.PERCENT_BAR_HEIGHT / 2) - 5];
            } else if(!isGraph || isXAxis) {
                offset = [0, ns.GRAPH_TICK_LENGTH*3];
            } else {
                offset = [ns.GRAPH_TICK_LENGTH*2, 5];
            }

            this.renderItem(this.tickLabelGroup, ticks, className, 'svg:text', function (elements, xPos, yPos) {
                function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                elements.text(function (d) { return (forceDecimal !== true && d.isFraction)? d.num: d.toString({forceDecimal:forceDecimal}); })
                    .attr('x', function (d) {
                        // offset zero label to avoid y axis
                        return (!isGraph || d.val() !== 0) ? tickXPos(d.val()) + offset[0] - originOffset[0]: tickXPos(d.val()) + ns.GRAPH_TICK_LENGTH*2 - originOffset[0];
                    })
                    .attr('y', function (d) {
                        return tickYPos(d.val()) + offset[1] - originOffset[1];
                    })
                    .attr('class', function(d) { return showAxes ? className : className + ' ' + ns.GRAPH_HIDDEN_CLASS;})
                    .attr('text-anchor', 'middle');
            });
        };

        GraphRenderer.prototype.drawTickLabelDividers = function (ticks, className, originPos, isXAxis) {
            var isGraph = this.viewConfig.isGraph;

            // don't draw zero label for y axis
            if (!isXAxis && isGraph) {
                ticks = _(ticks).filter(function (tick) {
                    return tick.val() !== 0;
                });
            }

            var length = 14;
            var vertOffset = 3;

            var offset;
            if(!isGraph || isXAxis) {
                offset = [0, ns.GRAPH_TICK_LENGTH*3 + vertOffset];
            } else {
                offset = [ns.GRAPH_TICK_LENGTH*2, 5 + vertOffset];
            }

            this.renderItem(this.tickLabelGroup, ticks, className, 'svg:line', function (elements, xPos, yPos) {
                function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                elements.attr('x1', function (d) { return (!isGraph || d.val() !== 0) ? tickXPos(d.val()) + offset[0] - length/2: tickXPos(d.val()) + ns.GRAPH_TICK_LENGTH*2 - length/2;})
                    .attr('y1', function (d) { return tickYPos(d.val()) + offset[1];})
                    .attr('x2', function (d) { return (!isGraph || d.val() !== 0) ? tickXPos(d.val()) + offset[0] + length/2: tickXPos(d.val()) + ns.GRAPH_TICK_LENGTH*2 + length/2;})
                    .attr('y2', function (d) { return tickYPos(d.val()) + offset[1];})
                    .style('stroke', ns.GRAPH_AXIS_COLOR);
            });
        };

        GraphRenderer.prototype.drawTickLabelDenom = function (ticks, className, originPos, isXAxis) {
            var isGraph = this.viewConfig.isGraph;

            // don't draw zero label for y axis
            if (!isXAxis && isGraph) {
                ticks = _(ticks).filter(function (tick) {
                    return tick.val() !== 0;
                });
            }

            var denomOffset = 17;

            var offset;
            if(!isGraph || isXAxis) {
                offset = [0, ns.GRAPH_TICK_LENGTH*3 + denomOffset];
            } else {
                offset = [ns.GRAPH_TICK_LENGTH*2, 5 + denomOffset];
            }

            this.renderItem(this.tickLabelGroup, ticks, className, 'svg:text', function (elements, xPos, yPos) {
                function tickXPos(val) {return isXAxis ? xPos(val, 0, isXAxis) : xPos(0, val, isXAxis);}
                function tickYPos(val) {return isXAxis ? yPos(val, 0, isXAxis) : yPos(0, val, isXAxis);}

                elements.text(function (d) { return d.denom; })
                    .attr('x', function (d) {
                        // offset zero label to avoid y axis
                        return (!isGraph || d.val() !== 0) ? tickXPos(d.val()) + offset[0]: tickXPos(d.val()) + ns.GRAPH_TICK_LENGTH*2;
                    })
                    .attr('y', function (d) {
                        return tickYPos(d.val()) + offset[1];
                    })
                    .attr('text-anchor', 'middle');
            });
        };

        GraphRenderer.prototype.renderPoints = function (points, options) {
            var self = this;
            if (options === undefined) {
                options = {};
            }
            points = _(points).filter(function (point) {
                return !point.isHidden;
            });

            var clipId = (!this.viewConfig.isGraph) ? '' : this.clipId;

            if (this.viewConfig.isPercentbar) {
                this.renderItem(this.pointGroup, points, ns.GRAPH_POINT_CLASS, 'svg:line', function(elements, xPos, yPos) {
                    elements.attr('y1', function (d) { return yPos(d.x.val(), d.y.val(), d.xAxis) - (ns.PERCENT_BAR_HEIGHT / 2); })
                        .attr('y2', function (d) { return yPos(d.x.val(), d.y.val(), d.xAxis) + (ns.PERCENT_BAR_HEIGHT / 2); })
                        .attr('x1', function (d) { return xPos(d.x.val(), d.y.val(), d.xAxis); })
                        .attr('x2', function (d) { return xPos(d.x.val(), d.y.val(), d.xAxis); })
                        .style('stroke', ns.GRAPH_POINT_COLOR)
                        .style('stroke-width', function (d) { return d.isSelected === true ? ns.PERCENT_BAR_POINT_WIDTH_SELECTED : ns.PERCENT_BAR_POINT_WIDTH;})
                        .attr('clip-path', 'url(#' + clipId + ')');
                });
            } else {
                var clazz = ns.GRAPH_POINT_CLASS;
                if (options.huntPoint === true) {
                    clazz = ns.NUMBER_HUNT_POINT_CLASS;
                } else if (options.huntMarker === true) {
                    clazz = ns.NUMBER_HUNT_MARKER_CLASS;
                } else if (options.errorPoint === true) {
                    clazz = ns.NUMBER_HUNT_ERROR_CLASS;
                } else if (options.isIdentify === true) {
                    clazz = ns.NUMBER_HUNT_LABEL_POINT;
                }
                
                this.renderItem(this.pointGroup, points, clazz, 'svg:circle', function(elements, xPos, yPos) {
                    elements.attr('cy', function (d) { return yPos(d.x.val(), d.y.val(), d.xAxis); })
                        .attr('cx', function (d) { return xPos(d.x.val(), d.y.val(), d.xAxis); })
                        .attr('r', function (d) {
                            var pointRadius = ns.GRAPH_POINT_RADIUS;
                            if (self.viewConfig.isNumberhunt) {
                                pointRadius = ns.NUMBER_HUNT_POINT_RADIUS;
                            } else if (d.isSelected) {
                                pointRadius = ns.GRAPH_SELECTED_POINT_RADIUS;
                            }
                            return pointRadius;
                        })
                        .attr('clip-path', 'url(#' + clipId + ')');
                });
            }

            if(this.viewConfig.isPercentbar) {
                var originOffset = [0, 0];
                this.drawPercentTickLabels(points, ns.GRAPH_POINT_LABEL_CLASS + '-percent', originOffset, false);
                return;
            }

            var mode = this.viewConfig.mode;

            var showPointLabels = (options.showLabels !== undefined)? options.showLabels: this.graphModel.showPointLabels;
            var textClazz = ns.GRAPH_POINT_LABEL_CLASS;
            if (options.huntMarker === true) {
                showPointLabels = true;
                textClazz += '-hunt-marker';
            } else if (options.huntPoint === true){
                showPointLabels = false;
            } else if (options.errorPoint === true) {
                textClazz += '-error-point';
            } else if (options.isIdentify === true) {
                textClazz += '-identify';
            }

            this.renderItem(this.pointGroup, points, textClazz, 'svg:text', function(elements, xPos, yPos) {
                elements.attr('text-anchor', 'middle')
                    .attr('x', function (d) {
                        return xPos(d.x.val(), d.y.val(), d.xAxis);
                    })
                    .attr('y', function (d) {
                        var baseY = yPos(d.x.val(), d.y.val(), d.xAxis);
                        return mode === ns.GRAPH_MODE_NUMBERLINE ? baseY - 14 : baseY + 25;
                    })
                    .attr('class', function (d) {
                        return (d.isSelected === true && !self.viewConfig.isNumberhunt) || showPointLabels === true || options.errorPoint ? textClazz : textClazz + ' ' + ns.GRAPH_HIDDEN_CLASS;
                    })
                    .attr('clip-path', 'url(#' + clipId + ')')
                    .text(function (d) {
                        return d.coordinateLabel(mode, {
                            displayMixedFraction: (self.graphModel.huntOptions !== undefined && self.graphModel.huntOptions.displayMixedFraction === true),
                            forceFraction: self.graphModel.huntNum && self.graphModel.huntNum.isFraction
                        });
                    });
            });
        };

        GraphRenderer.prototype.renderGliders = function (gliders) {
            var clipId = this.clipId;
            this.renderItem(this.gliderGroup, gliders, ns.GRAPH_GLIDER_CLASS, 'svg:circle', function(elements, xPos, yPos) {
                elements.attr('cy', function (d) { return yPos(d.getPos()[0], d.getPos()[1]); })
                    .attr('cx', function (d) { return xPos(d.getPos()[0], d.getPos()[1]); })
                    .attr('r', function (d) { return d.isSelected === true ? ns.GRAPH_SELECTED_POINT_RADIUS : ns.GRAPH_POINT_RADIUS;})
                    .attr('clip-path', 'url(#' + clipId + ')');
            });

            var selectedGlider = _(gliders).findWhere({isSelected: true});
            if (!selectedGlider) {
                return;
            }

            var pos = selectedGlider.getPos();
            var text = selectedGlider.toString();

            this.renderItem(this.pointGroup, [selectedGlider], ns.GRAPH_POINT_LABEL_CLASS, 'svg:text', function(elements, xPos, yPos) {
                elements.attr('text-anchor', 'middle')
                    .attr('x', function () {
                        return xPos(pos[0], pos[1], true);
                    })
                    .attr('y', function () {
                        var baseY = yPos(pos[0], pos[1], false);
                        return baseY - 25;
                    })
                    .attr('class', ns.GRAPH_POINT_LABEL_CLASS)
                    .attr('clip-path', 'url(#' + clipId + ')')
                    .text(text);
            });
        };

        GraphRenderer.prototype.renderLines = function (lines, equations) {
            //don't draw lines in single numberline mode
            if(!this.viewConfig.isGraph && this.viewConfig.isDouble === false) {
                lines = [];
            }

            lines = _(lines).filter(function (line) {
                return !line.isHidden();
            });

            drawSimpleLines(this, lines);
            drawRays(this, lines);

            _(equations).each(function (equation) {
                var line = equation.getLine();
                if(line !== undefined) {
                    lines.push(line);
                }
            });
            drawInfiniteLines(this, lines);
        };

        function drawLines(renderer, lines, className) {
            var clipId = renderer.clipId;
            renderer.renderItem(renderer.lineGroup, lines, className, 'svg:line', function(elements, xPos, yPos) {
                elements.attr('x1', function (d) { return xPos(d.start.x.val(), d.start.y.val(), d.start.xAxis); })
                    .attr('y1', function (d) { return yPos(d.start.x.val(), d.start.y.val(), d.start.xAxis); })
                    .attr('x2', function (d) { return xPos(d.end.x.val(), d.end.y.val(), d.end.xAxis); })
                    .attr('y2', function (d) { return yPos(d.end.x.val(), d.end.y.val(), d.end.xAxis); })
                    .attr('class', function (d) {
                        return d.isSelected === true ? className + ' mt-line mt-selected-line' : className + ' mt-line';
                    })
                    .attr('clip-path', 'url(#' + clipId + ')');
            });

            var listenerClass = className + '-listener';
            renderer.renderItem(renderer.lineListenerGroup, lines, listenerClass, 'svg:line', function(elements, xPos, yPos) {
                elements.attr('x1', function (d) { return xPos(d.start.x.val(), d.start.y.val(), d.start.xAxis); })
                    .attr('y1', function (d) { return yPos(d.start.x.val(), d.start.y.val(), d.start.xAxis); })
                    .attr('x2', function (d) { return xPos(d.end.x.val(), d.end.y.val(), d.end.xAxis); })
                    .attr('y2', function (d) { return yPos(d.end.x.val(), d.end.y.val(), d.end.xAxis); })
                    .attr('id', function (d) { return d.id; })
                    .attr('class', listenerClass + ' mt-line-listener')
                    .attr('clip-path', 'url(#' + clipId + ')');
            });
        }

        function drawSimpleLines(renderer, lines) {
            var lineSegments = _(lines).filter(function (line) {
                return _([ns.LINE_INNER_TYPE_LINE_SEGMENT, ns.LINE_INNER_TYPE_DROP_LINE_X, ns.LINE_INNER_TYPE_DROP_LINE_Y]).contains(line.innerType);
            });
            drawLines(renderer, lineSegments, 'mt-line-segment');
        }

        function drawInfiniteLines(renderer, lines) {
            var infiniteLines = _(lines).filter(function (line) {
                return line.innerType === ns.LINE_INNER_TYPE_LINE;
            });

            var extensionFn = _(renderer.lineRectIntersectionFactory.findLineForPoints).bind(renderer.lineRectIntersectionFactory);
            var extendedLines = getExtendedLines(renderer, infiniteLines, extensionFn);
            drawLines(renderer, extendedLines, 'mt-infinite-line');

            drawLineArrows(renderer, extendedLines, 'mt-infinite-line-arrow', true);
        }

        function drawRays(renderer, lines) {
            var rays = _(lines).filter(function (line) {
                return line.innerType === ns.LINE_INNER_TYPE_RAY;
            });

            var extensionFn = _(renderer.lineRectIntersectionFactory.findRayForPoints).bind(renderer.lineRectIntersectionFactory);
            var extendedLines = getExtendedLines(renderer, rays, extensionFn);
            drawLines(renderer, extendedLines, 'mt-ray');

            drawLineArrows(renderer, extendedLines, 'mt-ray-arrow', false);
        }

        function getExtendedLines(renderer, lines, extensionFn) {
            var rectDiag = getRectDiagonal(renderer.graphModel);

            var extendedLines = _.chain(lines)
                .map(function(infiniteLine) {
                    var newLine = extensionFn(infiniteLine.start, infiniteLine.end, rectDiag);
                    // relate new extended line to the line it was based off of
                    if (newLine && infiniteLine) {
                        newLine.id = infiniteLine.id;
                        newLine.isSelected = infiniteLine.isSelected;
                    }
                    return newLine;
                }, renderer)
                .reject(function(line){
                    return _.isUndefined(line);
                })
                .value();

            return extendedLines;
        }

        function drawLineArrows(renderer, lines, className, bothEnds) {
            var arrowLines = [];
            _(lines).each(function (line) {
                var startPos = renderer.viewConfig.transformToPos(line.start.x.val(), line.start.y.val());
                var endPos = renderer.viewConfig.transformToPos(line.end.x.val(), line.end.y.val());
                var theseArrows = getArrowData(startPos, endPos);

                if (bothEnds) {
                    theseArrows = theseArrows.concat(getArrowData(endPos, startPos));
                }

                _(theseArrows).each(function (arrowData) {
                    arrowLines.push({
                        x1: arrowData[0][0],
                        y1: arrowData[0][1],
                        x2: arrowData[1][0],
                        y2: arrowData[1][1],
                        isSelected: line.isSelected
                    });
                });
            });

            renderer.renderItem(renderer.lineGroup, arrowLines, className, 'svg:line', function(elements) {
                elements.attr('x1', function (d) { return d.x1; })
                    .attr('y1', function (d) { return d.y1; })
                    .attr('x2', function (d) { return d.x2; })
                    .attr('y2', function (d) { return d.y2; })
                    .attr('class', function (d) {
                        return d.isSelected === true ? className + ' mt-selected-arrow' : className;
                    });
            });
        }

        function getRectDiagonal(graphModel) {
            var xMin = graphModel.axes.x.min.x.val();
            var xMax = graphModel.axes.x.max.x.val();
            var yMin = graphModel.axes.y.min.y.val();
            var yMax = graphModel.axes.y.max.y.val();

            var line = new ns.Line({
                start: {
                    x: xMin,
                    y: yMin
                },
                end: {
                    x: xMax,
                    y: yMax
                }
            });
            return line;
        }

        GraphRenderer.prototype.renderAxisArrows = function (startPos, endPos, axisName, isXAxis) {
            //render the line from axis min to axis max - graph space coordinates
            var arrowName = axisName + '-arrow';
            var showAxes = this.graphModel.showAxes;

            var arrowLines = getArrowData(startPos, endPos);
            arrowLines = arrowLines.concat(getArrowData(endPos, startPos));

            this.renderItem(this.axisGroup, arrowLines, arrowName, 'svg:line', function(elements) {
                elements.attr('x1', function (d) { return d[0][0]; })
                    .attr('y1', function (d) { return d[0][1]; })
                    .attr('x2', function (d) { return d[1][0]; })
                    .attr('y2', function (d) { return d[1][1]; })
                    .attr('class', function (d) { return showAxes ? arrowName : arrowName + ' ' + ns.GRAPH_HIDDEN_CLASS;})
                    .style('stroke', ns.GRAPH_AXIS_COLOR)
                    .style('stroke-width', ns.GRAPH_AXIS_WIDTH);
            });
        };
        function getArrowData(startPos, endPos) {
            var lengthSq = (endPos[0] - startPos[0])*(endPos[0]- startPos[0]) + (endPos[1] - startPos[1])*(endPos[1] - startPos[1]);
            //divide by arrow length below to scale everything to correct size
            var length = Math.sqrt(lengthSq) / ns.GRAPH_ARROW_LENGTH;
            var norm = [(endPos[0] - startPos[0])/length, (endPos[1] - startPos[1])/length];
            var normPerp = [norm[1], -norm[0]];

            //arrow arm to stem ratio
            var ratio = ns.GRAPH_ARROW_RATIO;

            //arrow data containing 3 lines
            var arrowData = [];
            //stem
            arrowData.push([endPos, [endPos[0] + norm[0], endPos[1] + norm[1]]]);
            //upper angle
            arrowData.push([[endPos[0] + norm[0], endPos[1] + norm[1]], [endPos[0] + norm[0] + (-norm[0]+normPerp[0])*ratio, endPos[1] + norm[1] + (-norm[1] + normPerp[1])*ratio]]);
            //lower angle
            arrowData.push([[endPos[0] + norm[0], endPos[1] + norm[1]], [endPos[0] + norm[0] + (-norm[0]-normPerp[0])*ratio, endPos[1] + norm[1] + (-norm[1] - normPerp[1])*ratio]]);
            return arrowData;
        }

        //TODO: this is hacky, but I can't seem to precalculate the text
        GraphRenderer.prototype.getSVGTextWidth = function(string) {
            if (string === undefined || string.length === 0) {
                return 20;
            }
            var margin = 2;
            string = '' + string;
            var size = 0;
            var textSizes = {
                '0': 10,
                '1': 5,
                '2': 9,
                '3': 9,
                '4': 9,
                '5': 9,
                '6': 9,
                '7': 8,
                '8': 9,
                '9': 9,
                '.': 4,
                '%': 12,
                '-': 5
            };
            for (var i = 0; i < string.length; i++) {
                size += (textSizes[string.charAt(i)] !== undefined) ? textSizes[string.charAt(i)] : 9; //giving it an average size if we don't have the letter
            }

            return size + ((size > 0 ) ? margin : 0);
        };


        return GraphRenderer;
    }());
})(window.mt.common);




(function (ns) {

    'use strict';

    //view config responsible for mapping between graph and view space for both graph and numberline
    ns.GraphViewConfig = (function () {

        function GraphViewConfig(width, height, margin, mode, isDouble) {
            this.height = height;
            this.width = width;
            this.margin = margin;
            this.mode = mode;
            this.isDouble = isDouble;

            //init transforms to a unit graph
            this.isGraph = this.mode === ns.GRAPH_MODE_STANDARD;
            this.isNumberline = this.mode === ns.GRAPH_MODE_NUMBERLINE;
            this.isPercentbar = this.mode === ns.GRAPH_MODE_PERCENTBAR;
            this.isNumberhunt = this.mode === ns.GRAPH_MODE_NUMBERHUNT;
            this.isMicdrop = this.mode === ns.GRAPH_MODE_MICDROP;
            this.update(0, 1, 0, 1);
        }

        GraphViewConfig.prototype.update = function (minX, maxX, minY, maxY) {
            this.xScale = d3.scale.linear().domain([minX, maxX]).range([this.margin, this.width - this.margin]);
            if(this.isGraph) {
                this.yScale = d3.scale.linear().domain([maxY, minY]).range([this.margin, this.height - this.margin]);
            }
        };

        GraphViewConfig.prototype.transformToGraph = function (posX, posY) {
            var valX, valY;
            if (this.isGraph) {
                valX = this.xScale.invert(posX);
                valY = this.yScale.invert(posY);
            } else {
                var index = (posY > this.height/2)? 1: 0;
                //in numberline mode we use xScale or everything since both axes share a common scale
                if(index === 1) {
                    valX = this.xScale.invert(posX);
                    valY = 0;
                } else {
                    valX = 0;
                    valY = this.xScale.invert(posX);
                }
            }
            return [valX, valY];
        };

        GraphViewConfig.prototype.transformToPos = function (valX, valY, isXAxis) {
            var posX, posY;
            if (this.isGraph) {
                posX = this.xScale(valX);
                posY = this.yScale(valY);
            } else {
                if(isXAxis === true || (isXAxis === undefined && Math.abs(valY) < Math.abs(valX))) {
                    //x-axis
                    posY = this.height*3/4;
                    posX = this.xScale(valX);
                }
                else {
                    //y-axis
                    posY = this.height/4;
                    posX = this.xScale(valY);
                }
            }
            return [posX, posY];
        };

        GraphViewConfig.prototype.getHeight = function () {
            var height = this.height;
            if(this.isDouble !== true) {
                height /= 2;
            }
            return height;
        };

        GraphViewConfig.prototype.getWidth = function () {
            return this.width;
        };

        GraphViewConfig.prototype.isXAxis = function (posY) {
            var isXAxis;
            if(!this.isGraph) {
                isXAxis = posY > this.height/2;
            }
            return isXAxis;
        };

        GraphViewConfig.prototype.clamp = function(posX, posY, clampX, clampY) {
            var clamped = [
                clampX? Math.min(this.width - this.margin, Math.max(this.margin, posX)): posX,
                clampY? Math.min(this.height - this.margin, Math.max(this.margin, posY)): posY
            ];
            return clamped;
        };

        return GraphViewConfig;
    }());
})(window.mt.common);




(function (ns) {
    'use strict';

    ns.Line = (function (spec) {

        function Line(spec) {
            if (!(this instanceof Line)) {
                return new Line(spec);
            }

            spec = spec || {};

            this.id = attributeValueForKey(spec, 'id', ns.createGuid());
            this.start = getPoint(spec, 'start');
            this.end = getPoint(spec, 'end');

            this.isSelected = !!spec.isSelected;
            this.innerType = attributeValueForKey(spec, 'innerType', ns.LINE_INNER_TYPE_LINE);
        }

        function getPoint(spec, key) {
            var val = spec[key];
            if (val !== undefined) {
                return val instanceof ns.Point ? val : new ns.Point({x: val.x, y: val.y});
            } else {
                return new ns.Point({x: 0, y: 0});
            }
        }

        function attributeValueForKey(attributes, key, defaultVal) {
            return attributes[key] === undefined ? defaultVal : attributes[key];
        }

        Line.prototype.isHidden = function () {
            return this.start.isHidden || this.end.isHidden;
        };

        Line.prototype.toString = function () {
            return this.innerType + ': ' + this.start.toString() + ' -> ' + this.end.toString();
        };

        Line.prototype.equals = function (otherLine) {
            if (!otherLine) {
                return false;
            }
            return this.start.equals(otherLine.start) && this.end.equals(otherLine.end) && this.innerType === otherLine.innerType;
        };

        Line.prototype.type = function () {
            return ns.GRAPH_TYPE_LINE;
        };

        return Line;
    })();
})(window.mt.common);

(function (ns) {
    'use strict';

    ns.PartitionedRange = (function (min, max, partitions, color, isXAxis) {

        function PartitionedRange(min, max, partitions, color, isXAxis, handlePoints) {
            this.partitions = partitions;
            this.min = min.copy();
            this.max = max.copy();
            this.color = color;
            this.id = ns.createGuid();
            this.isXAxis = isXAxis;
            this.handlePoints = handlePoints;
            this.isSelected = false;

            this.orderMaxMin();
            this.calcInterval();
        }

        PartitionedRange.prototype.orderMaxMin = function () {
            if(this.min.val() > this.max.val()) {
                var temp = this.min;
                this.min = this.max;
                this.max = temp;
            }
        };

        PartitionedRange.prototype.calcInterval = function () {
            this.interval = this.getMax().copy();
            this.interval.subtract(this.getMin());

            //handle the zero interval case
            if(this.interval.val() < mt.common.DEFAULT_EPS) {
                this.interval = new mt.common.MtValue(1);
            }

            this.interval.divideByNum(this.partitions);
            return this.interval;
        };

        PartitionedRange.prototype.getVisibleTicks = function (visMin, visMax) {
            var val = this.getMin().copy();
            var max = this.getMax();

            var delta = this.interval.val()/2;

            var visibleTicks = [];
            while(val.val() < max.val() + delta) {
                if(val.val() > visMin.val() - mt.common.DEFAULT_EPS && val.val() < visMax.val() + mt.common.DEFAULT_EPS) {
                    visibleTicks.push(val.copy());
                }
                val.add(this.interval);
            }
            return visibleTicks;
        };

        PartitionedRange.prototype.setNumPartitions = function (partitions) {
            this.partitions = partitions;
            this.calcInterval();
        };

        PartitionedRange.prototype.setMin = function (minVal) {
            this.min.setVal(minVal);
            this.calcInterval();
        };

        PartitionedRange.prototype.setMax = function (maxVal) {
            this.max.setVal(maxVal);
            this.calcInterval();
        };

        PartitionedRange.prototype.checkMinMax = function () {
            if (this.max.val() < this.min.val()) {
                var oldMin = this.min.copy();
                this.min = this.max;
                this.max = oldMin;
                this.calcInterval();
            }
        };

        //note this functions return the ordered min or max regardless of actual assignments
        PartitionedRange.prototype.getMin = function () {
            if(this.min.val() > this.max.val()) {
                return this.max;
            }
            return this.min;
        };
        PartitionedRange.prototype.getMax = function () {
            if(this.min.val() > this.max.val()) {
                return this.min;
            }
            return this.max;
        };

        PartitionedRange.prototype.getVisibleCenter = function (visMin, visMax) {
            var partVisMin = Math.max(visMin.val(), this.getMin().val());
            var partVisMax = Math.min(visMax.val(), this.getMax().val());
            return (partVisMin + partVisMax)/2;
        };

        PartitionedRange.prototype.getClosestTick = function (val) {
            var numIntervals = parseInt((val - this.getMin().val())/this.interval.val() + 0.5, 10);
            //constrain intervals to the range
            numIntervals = Math.max(0, Math.min(numIntervals, this.partitions));
            var tickVal = this.getMin().val() + this.interval.val()*numIntervals;

            return tickVal;
        };

        PartitionedRange.prototype.type = function() {
            return mt.common.GRAPH_TYPE_PARTITION;
        };

        PartitionedRange.prototype.getRange = function() {
            return Math.abs(this.max.val() - this.min.val());
        };

        return PartitionedRange;

    })();
})(window.mt.common);

(function (ns) {
    'use strict';

    ns.Point = (function (spec) {

        function Point(spec) {
            if (!(this instanceof Point)) {
                return new Point(spec);
            }

            spec = spec || {};

            this.id = attributeValueForKey(spec, 'id', ns.createGuid());
            this.x = getCoordinate(spec, 'x');
            this.y = getCoordinate(spec, 'y');

            this.isHidden = !(isNumber(this.x.val()) && isNumber(this.y.val()));
            this.isSelected = !!spec.isSelected;
            this.pointSetId = attributeValueForKey(spec, 'pointSetId');
            //optional property used by numberline
            this.xAxis = spec.xAxis;

            this.name = spec.name;
            this.hasValidName = true; // assume validity

            this.numberLinePointLabel = attributeValueForKey(spec, 'numberLinePointLabel', '');
            this.numberLinePercentLabel = attributeValueForKey(spec, 'numberLinePercentLabel', '');
            this.color = attributeValueForKey(spec, 'color', '');
        }

        function getCoordinate(spec, key) {
            var val = spec[key];

            if (!isMtValue(val)) {
                var num = val === undefined ? '' : val;
                val = new mt.common.MtValue(num, 1, false);
            }

            return val;
        }

        function isNumber(val) {
            return !isNaN(val) && !_(val).isBlank();
        }

        function isMtValue(val) {
            return val instanceof mt.common.MtValue;
        }

        function attributeValueForKey(attributes, key, defaultVal) {
            return attributes[key] === undefined ? defaultVal : attributes[key];
        }

        Point.prototype.distanceFrom = function (otherPoint) {
            var x1 = this.x.val();
            var y1 = this.y.val();
            var x2 = otherPoint.x.val();
            var y2 = otherPoint.y.val();

            //TODO - we should probably optimize functionality using this work with distSq instead to avoid unnecessary sqrt
            return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
        };

        Point.prototype.setPointLabel = function(pointLabel) {
            this.numberLinePointLabel = pointLabel;
        };

        Point.prototype.coordinateLabel = function (mode, options) {
            options = (options) ? options : {};
            if (mode === ns.GRAPH_MODE_NUMBERLINE) {
                return this.numberLinePointLabel;
            } else if (mode === ns.GRAPH_MODE_NUMBERHUNT) {
                return this.y.toString(options);
            }
            return '(' + this.x.editText + ', ' + this.y.editText + ')';
        };

        Point.prototype.toString = function () {
            return '(' + this.x.editText + ', ' + this.y.editText + ')';
        };

        //snap is the snap-to, possibly the minor interval; ex: .25, .01
        function round(val, snap) {
            var precision = Math.round(1/snap);
            return Math.round(precision * val) / precision;
        }

        Point.prototype.equals = function equals(otherPoint) {
            if (!otherPoint) {
                return false;
            }
            var snap = 0.01;
            return round(this.x.val(), snap) === round(otherPoint.x.val(), snap) && round(this.y.val(), snap) === round(otherPoint.y.val(), snap);
        };

        Point.prototype.type = function () {
            return ns.GRAPH_TYPE_POINT;
        };

        Point.prototype.updateFromExpression = function (expression) {
            expression = expression.replace(/ /g,'');

            var pattern = /\(([+-]?[=.a-zA-Z0-9_]*),([+-]?[=.a-zA-Z0-9_]*)\)/;
            var result = expression.match(pattern);

            if (result === null || result === undefined) {
                this.x.editText = '';
                this.y.editText = '';
                this.isHidden = true;
                return;
            }

            if (angular.isArray(result) && result.length >= 1) {
                this.x.setVal(result[1]);
            }
            if (angular.isArray(result) && result.length >= 2) {
                this.y.setVal(result[2]);
            }

            this.isHidden = !(isNumber(this.x.val()) && isNumber(this.y.val()));
        };

        return Point;
    })();
})(window.mt.common);

(function (ns) {
    'use strict';

    ns.PointSet = (function (spec) {

        function PointSet(spec) {
            if (!(this instanceof PointSet)) {
                return new PointSet(spec);
            }

            spec = spec || {};

            this.id = attributeValueForKey(spec, 'id', ns.createGuid());
            this.title = attributeValueForKey(spec, 'title');
            this.label = attributeValueForKey(spec, 'label');
            this.points = attributeValueForKey(spec, 'points', []);

            this.isSelected = false;
        }

        function attributeValueForKey(attributes, key, defaultVal) {
            return attributes[key] === undefined ? defaultVal : attributes[key];
        }

        PointSet.prototype.toString = function toString() {
            return this.label + ' - [' + this.points + '] selected - ' + this.isSelected;
        };

        PointSet.prototype.equals = function equals(otherPointSet) {
            if (this.label !== otherPointSet.label) {
                return false;
            }

            var allEqual = true;
            _(this.points).each(function (point, i) {
                if (!point.equals(otherPointSet.points[i])) {
                    allEqual = false;
                }
            });

            return allEqual === true && this.points.length === otherPointSet.points.length;
        };

        PointSet.prototype.type = function () {
            return ns.GRAPH_TYPE_POINT_SET;
        };

        PointSet.prototype.addPoint = function (point) {
            if (point.label === undefined) {
                point.label = this.getNextFreeLabel();
            }
            point.pointSetId = this.id;
            this.points.push(point);
        };

        PointSet.prototype.removePoint = function (point) {
            var index = this.points.indexOf(point);
            this.points.splice(index, 1);
        };

        PointSet.prototype.getNextFreeLabel = function () {
            var lastLabel = getLastLabel(this.points);
            var nextLabel = '';
            if (lastLabel === undefined) {
                nextLabel = 'A';
            } else if (_(lastLabel).endsWith('Z')) {
                _(lastLabel.length + 1).times(function () {
                    nextLabel += 'A';
                });
            } else {
                nextLabel = _(lastLabel).succ();
            }

            return nextLabel;
        };

        PointSet.prototype.containsPoint = function (point) {
            return this.points.indexOf(point) !== -1;
        };

        function getLastLabel(points) {
            var labels = _(points).pluck('label').sort(function (a, b) {
                var diff = a.length - b.length;
                if (diff !== 0) {
                    return diff;
                }
                var i;
                for (i = 0; i < a.length; ++i) {
                    diff = a.charCodeAt(i) - b.charCodeAt(i);
                    if (diff !== 0) {
                        return diff;
                    }
                }
                return 0;
            });

            return _(labels).last();
        }

        return PointSet;
    })();
})(window.mt.common);

(function (ns) {
    'use strict';

    ns.Key = (function () {
        function Key(name, action, value, title) {
            if (!(this instanceof Key)) {
                return new Key(name, action, value, title);
            }
            this.name = name; //for display
            this.action = action; //function called
            this.value = value; //for class in tests
            this.title = title; //
        }

        Key.prototype.getName = function () {
            return this.name;
        };

        Key.prototype.setName = function(name) {
            this.name = name;
        };

        Key.prototype.doAction = function () {
            this.action(this.value);
        };

        Key.prototype.setAction = function(action) {
            this.action = action;
        };

        Key.prototype.getValue = function () {
            return this.value;
        };

        Key.prototype.setValue = function(value) {
            this.value = value;
        };

        Key.prototype.getTitle = function () {
            return this.title;
        };

        Key.prototype.setTitle = function(title) {
            this.title = title;
        };

        return Key;
    })();
})(window.mt.common);

(function (ns) {
    'use strict';

    ns.Keypad = (function () {
        function Keypad() {
            if (!(this instanceof Keypad)) {
                return new Keypad();
            }
            this.keypadVisible = false;
            this.keypadInput = undefined;

            //bind the functions we are passing into Key to this instance of the Keypad, to prevent closure issues
            this.sendKeyToCurrentInput = this.sendKeyToCurrentInput_static.bind(this);
            this.backSpaceFromCurrentInput = this.backSpaceFromCurrentInput_static.bind(this);

            this.setStandardKeys();
        }

        Keypad.prototype.setKeys = function (keys) {
            this.keys = keys;
        };

        Keypad.prototype.setStandardKeys = function () {
            var keys = [];
            var r;
            for (r = 0; r < 3; r++) {
                keys[r] = [];
                for (var c = 0; c < 3; c++) {
                    var value = '' + ((r * 3) + c + 1);
                    var key = new mt.common.Key(value, this.sendKeyToCurrentInput, value, value);
                    keys[r][c] = key;
                }
            }
            keys[0][3] = new mt.common.Key('÷', this.sendKeyToCurrentInput, ns.DIV_CHAR, 'divide');
            keys[1][3] = new mt.common.Key('×', this.sendKeyToCurrentInput, '*', 'multiply');
            keys[2][3] = new mt.common.Key('-', this.sendKeyToCurrentInput, '-', '-'); //negative? subtract?
            keys[3] = [];
            keys[3][0] = new mt.common.Key('←', this.backSpaceFromCurrentInput, false, 'bs');
            keys[3][1] = new mt.common.Key('0', this.sendKeyToCurrentInput, '0', '0');
            keys[3][2] = new mt.common.Key('.', this.sendKeyToCurrentInput, '.', 'decimal');
            keys[3][3] = new mt.common.Key('+', this.sendKeyToCurrentInput, '+', 'add');
            keys[4] = [];
            keys[4][0] = new mt.common.Key('Clr', this.backSpaceFromCurrentInput, true, 'Clr');
            keys[4][1] = new mt.common.Key('\u2423', this.sendKeyToCurrentInput, ' ', 'space'); //will eventually be an extension of the Clr button
            keys[4][2] = new mt.common.Key('%', this.sendKeyToCurrentInput, '%', 'percent');
            keys[4][3] = new mt.common.Key('=', this.sendKeyToCurrentInput, '=', 'equals');
            this.setKeys(keys);
        };

        Keypad.prototype.getKeyAt = function(row, column) {
            return this.keys[row][column];
        };

        Keypad.prototype.getNumRows = function () {
            return this.keys.length;
        };

        Keypad.prototype.getNumKeys = function (row) {
            return this.keys[row].length;
        };

        //this will be executed by a Key, rather than the Keypad, so the 'this' variable needs to be bound to the Keypad instance
        Keypad.prototype.sendKeyToCurrentInput_static = function(value) {
            this.keypadInput.setValue(this.keypadInput.getValue() + value);
            this.keypadInput.element.focus();
            this.keypadInput.update();
        };

        //this will be executed by a Key, rather than the Keypad, so the 'this' variable needs to be bound to the Keypad instance
        Keypad.prototype.backSpaceFromCurrentInput_static = function(all) {
            if (all) {
                this.keypadInput.setValue('');
            } else {
                var str = this.keypadInput.getValue();
                this.keypadInput.setValue(str.substring(0, str.length - 1));
            }
            this.keypadInput.element.focus();
            this.keypadInput.update();
        };

        //default implementation - has to be called by the implementor
        Keypad.prototype.setKeypadVisible = function (visible, activeElement, tapOutFn) {
            if (visible && this.keypadVisible) {
                this.setKeypadVisible(false);
            }
            if (visible !== undefined && visible !== this.keypadVisible) {
                this.keypadVisible = visible;
                if (!visible && this.keypadInput.element === activeElement) {
                    $(this.keypadInput.element).blur();
                }
            }
            var self = this;
            if (visible) {
                setTimeout(function(){
                    $(document).on('click.keypadOffTouch touchstart.keypadOffTouch', function(e) {
                        if ($(e.target).parents('.mt-keypad-menu').length === 0) {
                            self.setKeypadVisible(false);
                            $(document).off('click.keypadOffTouch touchstart.keypadOffTouch');
                            if (tapOutFn) {
                                tapOutFn();
                            }
                        }
                    });
                });
            } else {
                $(document).off('click.keypadOffTouch touchstart.keypadOffTouch');
            }
        };

        //default (partial) implementation - has to be called by the implementor
        Keypad.prototype.selectInput = function(event, target) {
            this.keypadInput = {
                element : (event.target ? event.target : event.srcElement),
                setValue : function (value) {
                    this.element.value = value;
                    target.value = value;
                },
                getValue : function () {
                    return this.element.value;
                },
                update : function () {}
            };

            this.setKeypadVisible(true);
        };

        return Keypad;
    })();
})(window.mt.common);

(function (ns) {
    'use strict';

    ns.MtValue = (function () {
        var DECIMAL_PRECISION = 2;
        function MtValue(num, denom, isFraction, whole, postfix) {
            if (!(this instanceof MtValue)) {
                return new MtValue(num, denom, isFraction, whole, postfix);
            }

            this.num = num;

            if(denom === undefined) {
                this.denom = 1;
            } else {
                this.denom = denom;
            }

            if(isFraction === undefined) {
                this.isFraction = false;
            } else {
                this.isFraction = isFraction;
            }

            this.whole = whole;
            this.postfix = postfix;
            this.precision = DECIMAL_PRECISION;

            this.add = function (frac) {
                var newDenom = ns.lcm(this.denom, frac.denom);
                var myMultiplier = newDenom / this.denom;
                var fracMultiplier = newDenom / frac.denom;
                var newNum = (this.num * myMultiplier) + (frac.num * fracMultiplier);
                this.num = newNum;
                this.denom = newDenom;
                this.reduce();
                return this;
            };
            this.addByNum = function(val) {
                var frac = new mt.common.MtValueFromString(val);
                return this.add(frac);
            };
            this.subtract = function (frac) {
                var newDenom = ns.lcm(this.denom, frac.denom);
                var myMultiplier = newDenom / this.denom;
                var fracMultiplier = newDenom / frac.denom;
                var newNum = (this.num * myMultiplier) - (frac.num * fracMultiplier);
                this.num = newNum;
                this.denom = newDenom;
                this.reduce();
                return this;
            };
            this.subtractByNum = function(val) {
                var frac = new mt.common.MtValueFromString(val);
                return this.subtract(frac);
            };
            this.multiply = function(frac) {
                return this.multiplyByNum(frac.val());
            };
            this.multiplyByNum = function (multiplyNum) {
                this.num *= multiplyNum;
                if(this.whole !== undefined) {
                    this.whole *= multiplyNum;
                }
                this.reduce();
                return this;
            };
            this.divide = function(frac) {
                return this.divideByNum(frac.val());
            };
            this.divideByNum = function (divideNum) {
                if(this.whole !== undefined) {
                    //put everything into the denominator so we don't get decimals anywhere
                    this.num += this.whole*this.denom;
                    this.whole = undefined;
                }
                this.denom *= divideNum;
                this.reduce();
                return this;
            };

            function patternConsistent(str, pattern) {
                var patternInstances = str.split(pattern);
                patternInstances.shift();
                patternInstances.pop();
                return patternInstances.length > 0 && patternInstances.join('').length === 0;
            }

            this.convertDecimalToFraction = function(useWhole) {
                this.isFraction = true;
                var str = this.toString({forceDecimal: true, noPrecision: true});
                if (str.indexOf('.') !== -1) {
                    var usePattern = true;
                    if (str.length < 17) {
                        usePattern = false;
                    }
                    var whole = str.substring(0, str.indexOf('.'));
                    str = str.substring(str.indexOf('.') + 1, str.length);
                    var pattern = '';
                    var end = str.length - 2; //ignore rounding
                    
                    if (usePattern) {
                        for (var i = end; i >= 0; i--) {
                            pattern = str.charAt(i) + pattern;
                            if (patternConsistent(str, pattern)) {
                                break;
                            }
                            if (i === 0) {
                                usePattern = false;
                                break;
                            }
                        }
                    }
                    if (usePattern) {
                        var realPattern = pattern;
                        var patternLength = pattern.length;
                        var earliestInstanceOfPattern = str.length;
                        for (var p = 0; p < patternLength; p++) {
                            if (str.indexOf(pattern) < earliestInstanceOfPattern) {
                                earliestInstanceOfPattern = str.indexOf(pattern);
                                realPattern = pattern;
                            }
                            pattern += pattern.charAt(0);
                            pattern = pattern.substring(1);
                        }

                        var first = str.split(realPattern)[0];
                        var second = first + realPattern;
                        this.denom = Math.pow(10, second.length) - Math.pow(10, first.length);
                        this.num = Number(second) - Number(first);
                    } else {
                        this.num = Number(str);
                        this.denom = Math.pow(10, str.length);
                    }
                    if (useWhole && (1 * whole) !== 0) {
                        this.whole = Number(whole);
                    } else {
                        this.num += this.denom * whole;
                        this.whole = undefined;
                    }
                }
                this.reduce();
                return this;
            };
            this.reduce = function () {
                if (!this.isFraction || !mt.common.isNumeric(this.num)) {
                    return this;
                }
                if(this.whole !== undefined) {
                    //put everything over the numerator and recalculate the whole number part
                    this.num += this.whole * this.denom;
                    this.whole = parseInt(this.num/this.denom, 10);
                    this.num -= this.whole * this.denom;
                }
                var remainderLength = getDecimalLength(this.num);
                var denomRemainderLength = getDecimalLength(this.denom);

                if (denomRemainderLength > remainderLength) {
                    remainderLength = denomRemainderLength;
                }
                this.num *= Math.pow(10, remainderLength);
                this.denom *= Math.pow(10, remainderLength);
                this.num = parseInt(this.num, 10);
                this.denom = parseInt(this.denom, 10);

                var gcd = function gcd(a, b) {
                    return b ? gcd(b, a % b) : a;
                };
                gcd = gcd(this.num, this.denom);
                this.num = this.num / gcd;
                this.denom = this.denom / gcd;
                if (this.denom < 0) {
                    this.num *= -1;
                    this.denom *= -1;
                }
                this.editText = this.toString();
                return this;
            };
            function getDecimalLength(num){
                var remainder = (num + '').split('.')[1];
                if (remainder === undefined) {
                    return 0;
                }
                return remainder.length;
            }

            this.val = function () {
                var val;
                if (isNaN(this.num) || this.num === '') {
                    //try to parse out something numerical
                    var floatRep = parseFloat(this.num);
                    if(isNaN(floatRep) === false) {
                        val = floatRep;
                    } else {
                        val =  this.num;
                    }
                } else {
                    val = this.num / this.denom;
                    if(this.whole !== undefined && isNaN(this.whole) === false) {
                        val += parseFloat(this.whole);
                    }
                }

                return val;
            };

            this.setVal = function (num, denom, whole) {
                this.num = num;
                this.whole = whole;
                this.denom = 1;
                this.isFraction = false;
                if (denom !== undefined) {
                    this.denom = denom;
                    this.isFraction = true;
                    this.reduce();
                }
                this.editText = this.toString();
            };

            this.toString = function (options) {
                options = (options) ? options : {};
                var str;
                if (options.forceFraction) {
                    var newFraction = this.copy().convertDecimalToFraction(options.displayMixedFraction);
                    var newStr = newFraction.toString({displayMixedFraction: options.displayMixedFraction});
                    return newStr;
                }
                if (options.displayMixedFraction === true) {

                    var self = this.copy();
                    self.reduce();
                    var denom = self.denom;
                    var whole = self.whole;
                    if (whole === undefined) {
                        whole = 0;
                    }
                    whole += parseInt(self.num / denom, 10);
                    var num = self.num % denom;
                    if (whole === 0) {
                        str = '' + num;
                        if (denom !== 1) {
                            str += '/' + denom;
                        }
                    } else {
                        str = '' + whole;
                        if (num !== 0) {
                            str += ' ' + num + '/' + denom;
                        }
                    }
                } else if (options.forceDecimal !== true && (this.isFraction === true && this.denom !== 1)) {
                    str = (this.whole !== undefined && this.whole !== 0) ? this.whole + ' ': '';
                    str += this.num + '/' + this.denom;
                    if(this.postfix !== undefined && this.postfix !== '') {
                        str += ' ' + this.postfix;
                    }
                } else if (options.forceDecimal === true || this.isNumeric() === true) {
                    var currVal = (this.whole !== undefined) ? this.whole : 0;
                    currVal += (this.num / this.denom);
                    var precision = this.precision;
                    if (options.decimalPlace !== undefined) {
                        precision = options.decimalPlace;
                    }
                    str = options.noPrecision? currVal + '': mt.common.toPrecision(currVal, precision) + '';
                } else {
                    str = this.num + '';
                }
                return str;
            };

            this.toLatexString = function () {
                var text = this.toString() + '';
                if (this.isFraction === true) {
                    if(this.whole !== undefined) {
                        text = '\\text{' + this.whole + '}';
                    } else {
                        text = '';
                    }
                    if (this.num === '' || this.denom === '') {
                        text += this.num + '/' + this.denom;
                    } else {
                        text += '\\frac{' + this.num + '}{' + this.denom + '}';
                    }

                    if(this.postfix !== undefined && this.postfix !== '') {
                        text += '\\text{' + this.postfix + '}';
                    }
                } else if(this.isNumeric() === false && text.length !== 0) {
                    text = '\\text{' + text + '}';
                }
                return text;
            };

            //could make this function simpler and more efficient but shooting for clarity in this logic for now
            function isValidFraction (fractionVals) {
                //only support num / denom format
                if(fractionVals.length !== 2) {
                    return false;
                }

                //empty num or denom
                if(fractionVals[0].length === 0 || fractionVals[1].length === 0) {
                    return false;
                }

                //num and denom should not contain any = signs
                if(fractionVals[0].indexOf('=') >= 0 || fractionVals[1].indexOf('=') >= 0) {
                    return false;
                }

                //spaces around numerator or denom indicate that this is not a fraction
                if(fractionVals[1].charAt(0) === ' ' || fractionVals[0].charAt(fractionVals[0].length-1) === ' ') {
                    return false;
                }

                return true;
            }

            this.updateFromEdit = function (editText) {
                this.whole = undefined;
                if(editText !== undefined) {
                    this.editText = editText;
                }
                var fractionText = this.editText;

                var fractionVals = String(fractionText).split('/');

                //the values to be extracted in [num, denom, postfix] format
                var valArray;

                if(isValidFraction(fractionVals)) {
                    var num = fractionVals[0];
                    var splitNum = num.split(' ');
                    if(splitNum.length > 1) {
                        num = num.trim();
                        //whole prefix is everything that comes before the numerator
                        var numTemp = splitNum[splitNum.length-1];
                        this.whole = num.slice(0, num.length - numTemp.length).trim();
                        num = numTemp;
                    }
                    valArray = [num];

                    var splitDenom = fractionVals[1].split(' ', 2);
                    valArray.push(splitDenom[0]);
                    //add the postfix if there is one
                    if(splitDenom.length > 1) {
                        valArray.push(fractionVals[1].slice(splitDenom[0].length+1));
                    }
                } else {
                    valArray = [fractionText];
                }

                this.updateFromValues(valArray);
            };

            this.updateFromLatex = function (latex) {
                this.whole = undefined;
                var values = [latex];
                if(latex.indexOf('{') >= 0) {
                    //index of first latex command
                    var latexIndex = latex.indexOf('\\');
                    var wholeString = latex.slice(0, latexIndex);
                    if(wholeString !== '') {
                        this.whole = parseInt(wholeString, 10);
                    }
                    var trimmed = latex.slice(latexIndex);
                    trimmed = trimmed.replace('{','');
                    trimmed = trimmed.replace('{','');
                    trimmed = trimmed.replace('\\frac','');
                    trimmed = trimmed.replace('\\dfrac','');
                    values = String(trimmed).split('}');
                } else if(latex.indexOf('/' >= 0)){
                    values = String(latex).split('/');
                }
                this.updateFromValues(values);
                this.editText = this.toString();
            };

            this.updateFromValues = function (values) {
                this.postfix = undefined;
                if (values.length >= 2) {
                    this.num = values[0].trim();
                    if(checkNumeric(this.num)) {
                        this.num = parseInt(this.num, 10);
                    }
                    this.denom = values[1].trim();
                    if(checkNumeric(this.denom)) {
                        this.denom = parseInt(this.denom, 10);
                    }
                    this.isFraction = true;
                    if(values.length >= 3) {
                        this.postfix = values[2];
                    }
                } else if(values.length === 1) {
                    this.num = values[0];
                    this.isFraction = false;
                    this.denom = 1;
                } else {
                    this.num = 'ERROR';
                }
            };

            this.isNumeric = function () {
                return checkNumeric(this.num);
            };

            function checkNumeric(val) {
                return (String(val).match(/^\s*$/) || isNaN(val)) === false;
            }

            this.copy = function () {
                return new MtValue(this.num, this.denom, this.isFraction, this.whole, this.postfix);
            };

            this.setPrecision = function (precision) {
                if (precision === undefined || precision < 0 || isNaN(precision)) {
                    precision = DECIMAL_PRECISION;
                }
                this.precision = precision;
            };

            //this is the string value that should be bound to all input boxes
            this.editText = this.toString(undefined, true);
        }
        return MtValue;
    })();

    ns.MtValueFromString = (function() {
        function MtValueFromString(str, isFraction) {
            function getDecimalPlace(num) {
                return (('' + num).split('.')[1] || []).length;
            }
            str = '' + str;
            if (isFraction === undefined) {
                isFraction = ((str.indexOf('/') || str.indexOf('÷')) !== -1);
            }
            var whole;
            var num = 0;
            var denom = 1;
            if (isFraction) {
                if (str.indexOf(' ') !== -1) {
                    whole = Number(str.substring(0, str.indexOf(' ')));
                    str = str.substring(str.indexOf(' ') + 1, str.length);
                }
                var dividePos = (str.indexOf('/') || str.indexOf('÷'));
                if (dividePos !== -1) {
                    denom = Number(str.substring(dividePos + 1, str.length));
                    str = str.substring(0, dividePos);
                }
            }
            num = Number(str);
            var maxDecimalPlace = 2;
            var nums = [whole, num, denom];
            for (var i in nums) {
                var currNum = nums[i];
                var dp = getDecimalPlace(currNum);
                if (dp > maxDecimalPlace) {
                    maxDecimalPlace = dp;
                }
            }

            var mtValue = new mt.common.MtValue(num, denom, isFraction, whole);
            mtValue.setPrecision(maxDecimalPlace);
            return mtValue;
        }

        return MtValueFromString;
    })();
})(window.mt.common);

(function (ns) {
    'use strict';

    /***
     * Responsible for triggering tool load and save and communicating with the datastore
     */
    ns.WorkSpacePersistor = (function () {
        function WorkSpacePersistor(spaceId, dataStore, sessionId, configService, workspacePageService) {
            if (!(this instanceof WorkSpacePersistor)) {
                return new WorkSpacePersistor(spaceId, dataStore, sessionId, configService, workspacePageService);
            }

            this.loadTools = function () {
                var sessionData = dataStore.loadSessionData(sessionId);

                //load the page data
                if(sessionData.pages === undefined || sessionData.pages.length === 0) {
                    return;
                }

                //load the page data into the page data service
                workspacePageService.setPages(sessionData.pages);
                //set the active page index and load the tools from that page
                if(sessionData.activePageIndex !== undefined) {
                    workspacePageService.setActivePage(sessionData.activePageIndex, false, true);
                }
            };

            this.saveTools = function () {
                if (configService.localStoragePersistence === false) {
                    return;
                }

                //save the tools in the active workspace
                workspacePageService.updateActivePageData();

                //pull existing session data from the datastore - need this because only have key, val pairs in datastore
                var sessionData = {
                    activePageIndex: workspacePageService.getActivePageIndex(),
                    pages: workspacePageService.getPages()
                };

                //push out to the dataStore
                dataStore.saveSessionData(sessionId, sessionData);
            };

            this.setSessionId = function (id) {
                sessionId = id;
            };

            this.getSessionId = function () {
                return sessionId;
            };
        }

        return WorkSpacePersistor;
    })();
})(window.mt.common);

(function (ns) {
    'use strict';

    var propertiesLoaded = false;

    ns.Properties = (function () {
        function Properties(propertiesFile) {
            if (!(this instanceof Properties)) {
                return new Properties(propertiesFile);
            }

            if (!propertiesLoaded) {

                if (propertiesFile !== null && propertiesFile !== undefined) {
                    propertiesFile += '/';
                }

                // to see different properties in action, propertiesFile = custom/

//                jQuery.i18n.properties({
//                    name: 'mathTools',
//                    path: 'properties/' + propertiesFile,
//                    language: 'X',
//                    mode: 'map',
//                    callback: function() {
//                        propertiesLoaded = true;
//                        // Once the properties are loaded, they're available
//                        // from any of the tools or workspace via getUserProperty
//                    }
//                });
            }
        }

        Properties.prototype.getUserProperty = function (property) {

            var result = mt.common[property];
            var propertyPath = mt.common[property + '_PROP'];

            if (jQuery.i18n.prop(propertyPath) !== ('[' + propertyPath + ']')) {
                result = jQuery.i18n.prop(propertyPath);
            }

            return result;
        };

        Properties.prototype.getBooleanUserProperty = function (property) {
            var result = this.getUserProperty(property);
            return (/^true$/i.test(result));
        };

        return Properties;
    })();
})(window.mt.common);

(function (ns) {
    'use strict';

    ns.QualitativeData = (function () {
        function QualitativeData() {
            if (!(this instanceof QualitativeData)) {
                return new QualitativeData();
            }
            this.data = {};
        }

        QualitativeData.prototype.addAction = function(type, datum) {
            var list = this.data[String(type)];
            if (undefined === list) {
                list = [datum];
            } else
            {
                list.push(datum);
            }
            this.data[String(type)] = list;
        };

        QualitativeData.prototype.getActions = function(type) {
            return this.data[String(type)];
        };

        QualitativeData.prototype.deserialize = function(input) {
            this.data = input.data;
        };

        return QualitativeData;
    })();
})(window.mt.common);

(function (ns) {
    'use strict';

    ns.Settings = (function () {
        function Settings() {
            if (!(this instanceof Settings)) {
                return new Settings();
            }

            this.items = [];
        }

        Settings.prototype.addItem = function (name, defaultVal) {
            this.items.push({'name': name, 'value': defaultVal});
        };

        Settings.prototype.getItemAtIndex = function(index) {
            return this.items[index];
        };

        Settings.prototype.getNumItems = function () {
            return this.items.length;
        };

        Settings.prototype.getValueByName = function(name) {
            for(var i in this.items) {
                if(this.items[i].name === name) {
                    return this.items[i].value;
                }
            }
            return undefined;
        };

        Settings.prototype.setValueByName = function(name, value)
        {
            for(var i in this.items) {
                if(this.items[i].name === name) {
                    this.items[i].value = value;
                    break;
                }
            }
        };

        return Settings;
    })();
})(window.mt.common);

(function (ns) {
    'use strict';

    ns.SpaceApi = (function () {

        function SpaceApi(id) {
            if (!(this instanceof SpaceApi)) {
                return new SpaceApi(id);
            }

            return {
                spaceId: id,
                showModalAlert: angular.noop,
                focusTool: angular.noop,
                removeTool: angular.noop,
                clear: angular.noop,
                containers: []
            };
        }

        return SpaceApi;
    })();

})(window.mt.common);
(function (ns) {
    'use strict';

    angular.module('mt.common').factory('configService', function () {
        return window.mtConfig;
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').controller('globalRibbonMenuCtrl', function ($scope, $timeout, annotationService, ribbonMenuAnimationService, toolMenuService, undoService) {
        
        var up = function (elem) {
            ribbonMenuAnimationService.slideUp(elem);
        };

        var down = function(elem) {
            ribbonMenuAnimationService.slideDown(elem);
        };

        var toolListMenuElem = 'div.mt-ribbon-menu-tool-list';
        var toolMenuElem = 'div.mt-ribbon-menu-tool';
        var contextMenuElem = 'div.mt-ribbon-menu-context';

        function setToolListMenu(getRibbonFn) {
            up(contextMenuElem);
            up(toolMenuElem);
            $scope.toolListMenu = getRibbonFn();
            down(toolListMenuElem);
        }

        function setToolMenu(toolMenuId) {
            up(toolListMenuElem);
            up(contextMenuElem);
            $scope.toolMenu = toolMenuService.getToolMenu(toolMenuId);
            down(toolMenuElem);
        }

        function setContextMenu(toolMenuId, contextMenuId) {
            up(toolListMenuElem);
            $scope.contextMenu = toolMenuService.getToolMenu(toolMenuId, contextMenuId);
            down(contextMenuElem);
        }

        $scope.setRibbonMenu = function(globalRibbonDisplay, previous) {
            var undoRbn, annotationRbn, toolListRbn, toolRbn;
            var notificationActive, penActive, toolListActive, toolMenuActive, contextMenuActive;

            //time to wait to initiate slideDown animation
            var slideTimeout = 200;

            undoRbn = undoService.getNotificationRibbon;
            annotationRbn = annotationService.getRibbon;
            toolListRbn = toolMenuService.getToolListRibbon;
            toolRbn = toolMenuService.getToolMenu;
            
            notificationActive = globalRibbonDisplay.notification;
            penActive = globalRibbonDisplay.pen;
            toolListActive = globalRibbonDisplay.toolList;
            toolMenuActive = globalRibbonDisplay.activeToolId;
            contextMenuActive = globalRibbonDisplay.activeToolContextId;
            $timeout(function(){toolMenuService.hasChanged = false;}, slideTimeout);
            

            //reset some things when the active tool changes
            if(toolMenuActive !== previous.activeToolId) {
                toolMenuService.toggleToolListMenu(false);
                toolMenuService.setContext();
                up(toolMenuElem);
            }

            //determine which menus to slide in and out of view
            //use $timeout to allow for delay when menus switch
            if (notificationActive) {

                if(previous.pen || previous.toolList || previous.notification) {
                    up(toolListMenuElem);
                }

                $timeout(function() {
                    setToolListMenu(undoRbn);
                }, slideTimeout);

            } else if (penActive) {

                if(previous.toolList || previous.notification) {
                    up(toolListMenuElem);
                }

                if(previous.activeToolId || previous.activeToolContextId) {
                    up(contextMenuElem);
                    up(toolMenuElem);
                }

                $timeout(function() {
                    setToolListMenu(annotationRbn);
                }, slideTimeout);

            } else if (toolListActive) {

                if(previous.pen || previous.notification) {
                    up(toolListMenuElem);
                }

                $timeout(function() {
                    setToolListMenu(toolListRbn);
                }, slideTimeout);

            } else if(contextMenuActive) {

                if(toolMenuService.hasChanged || 
                previous.activeToolContextId && contextMenuActive !== previous.activeToolContextId) {
                    up(contextMenuElem);
                }

                $timeout(function(){
                    setContextMenu(toolMenuActive, contextMenuActive);
                }, slideTimeout);

            } else if(toolMenuActive) {

                if(previous.activeToolId && toolMenuActive !== previous.activeToolId) {
                    up(toolMenuElem);
                }

                $timeout(function() {
                    setToolMenu(toolMenuActive);
                }, slideTimeout);

            }
            
            //reset when menus are undefined/false
            if(contextMenuActive === undefined) { up(contextMenuElem); }

            if(toolMenuActive === undefined) { up(toolMenuElem); } 

            if(!toolListActive && (!penActive && !notificationActive)) { up(toolListMenuElem); }
        };
    });
})(window.mt.common);
(function (ns) {
    'use strict';

    angular.module('mt.common').controller('handWritingController', function($scope, handWritingManagerService) {

        //recognition mode
        $scope.mode = mt.common.HW_MODE_EQN;

        function resultHandler(result) {
            $scope.update(result, $scope.strokes);
        }

        $scope.recognize = function () {
            if($scope.strokes.length > 0) {
                handWritingManagerService.recognize($scope.strokes, resultHandler, $scope.mode);
            } else {
                $scope.update('', $scope.strokes);
            }
        };

    });

})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').controller('InputSwitchCtrl', function ($scope) {
        // input switching
        $scope.inputTypes = [
            { type: mt.common.EDIT_MODE_SYSTEM, displayName: 'Keyboard', color: mt.common.MENU_ITEM_ACTIVE_COLOR },
            { type: mt.common.EDIT_MODE_CUSTOM, displayName: 'Keypad / Keyboard', color: mt.common.MENU_ITEM_ACTIVE_COLOR },
            { type: mt.common.EDIT_MODE_HWR, displayName: 'Handwriting', color: mt.common.MENU_ITEM_ACTIVE_COLOR }
        ];

        $scope.currentInputType = function (type) {
            return mt.common.EDIT_MODE === type;
        };

        $scope.switchInput = function (type) {
            mt.common.EDIT_MODE = type;
        };
    });
})(window.mt.common);
(function (ns) {
    'use strict';

    angular.module('mt.common').controller('PopupMenuCtrl', function($scope, popupMenuService) {

        $scope.active = false;
        $scope.position = [];
        $scope.activeItems = [];

        var maxPopupMenuItems = 5;
        var popupMenuItemsOffset = 0;

        var popupMenuItems = [];
        var dismissEvent;

        $scope.showPopup = function (items, inputEvent, closeEvent) {
            inputEvent.cancelBubble = true;
            popupMenuItemsOffset = 0;

            var x, y;
            if(inputEvent.gesture !== undefined) {
                x = inputEvent.gesture.center.pageX;
                y = inputEvent.gesture.center.pageY;
            } else {
                x = inputEvent.pageX;
                y = inputEvent.pageY;
            }

            $scope.position = [x, y, 0];

            popupMenuItems = items;

            $scope.active = true;

            $scope.wasShowCalled = true;
            updatePopupMenu();

            $scope.popupMenuMoveTo();
        };

        $scope.closePopup = function (actionTriggered) {
            $scope.dismissPopupMenu(actionTriggered);
        };

        //register these with service
        popupMenuService.registerOpenCallback($scope.showPopup);
        popupMenuService.registerCloseCallback($scope.closePopup);

        function updatePopupMenu() {
            var itemsCopy = angular.copy(popupMenuItems);

            if (popupMenuItems.length <= 0) {
                $scope.dismissPopupMenu();
                return;
            }

            //constrain offset
            if ((popupMenuItemsOffset + maxPopupMenuItems) > popupMenuItems.length) {
                popupMenuItemsOffset = popupMenuItems.length - maxPopupMenuItems;
            }
            if (popupMenuItemsOffset < 0) {
                popupMenuItemsOffset = 0;
            }
            //pull out active items
            $scope.activeItems = itemsCopy.splice(popupMenuItemsOffset, maxPopupMenuItems);


            if (popupMenuItemsOffset > 0) {
                if (!$scope.popupMenuLeftArrowVisible) {
                    $scope.position[0] -= 14;
                    $scope.position[2] += 14;
                }
                $scope.popupMenuLeftArrowVisible = true;
            } else {
                if ($scope.popupMenuLeftArrowVisible) {
                    $scope.position[0] += 14;
                    $scope.position[2] -= 14;
                }
                $scope.popupMenuLeftArrowVisible = false;
            }
            if ((popupMenuItemsOffset + maxPopupMenuItems) < popupMenuItems.length) {
                $scope.popupMenuRightArrowVisible = true;
            } else {
                $scope.popupMenuRightArrowVisible = false;
            }
        }

        $scope.getPopupMenuItemsOffset = function () {
            return popupMenuItemsOffset;
        };
        $scope.popupMenuItemsLength = function () {
            return popupMenuItems.length;
        };
        $scope.getMaxPopupMenuItems = function () {
            return maxPopupMenuItems;
        };
        $scope.popupMenuLeftButton = function () {
            popupMenuItemsOffset -= 3;
            updatePopupMenu();
        };
        $scope.popupMenuRightButton = function () {
            popupMenuItemsOffset += 3;
            updatePopupMenu();
        };


        $scope.getPopupMenuItemAtIndex = function (index) {
            if (index < 0 || index >= popupMenuItems.length) {
                return;
            }
            return popupMenuItems[index];
        };

        $scope.runPopupMenuActionAtIndex = function (index) {
            var menuItem = $scope.getPopupMenuItemAtIndex(index);
            if (menuItem.func) {
                menuItem.func();
                $scope.dismissPopupMenu(true);
            }
            else if (menuItem.funcWithInput) {
                $scope.popupMenuInputIndex = index;
            }
            else {
                $scope.dismissPopupMenu(true);
            }
        };

        $scope.submitPopupMenuInput = function () {
            var menuItem = $scope.getPopupMenuItemAtIndex($scope.popupMenuInputIndex);
            if (menuItem.funcWithInput) {
                menuItem.funcWithInput($scope.popupInputValue);
            }
            $scope.dismissPopupMenu(true);
        };

        $scope.dismissPopupMenu = function(actionTriggered) {
            if (actionTriggered === undefined) {
                actionTriggered = false;
            }
            if ($scope.active && dismissEvent) {
                dismissEvent(actionTriggered);
            }
            $scope.active = false;
            $scope.popupMenuLeftArrowVisible = false;
            $scope.popupMenuRightArrowVisible = false;
            $scope.popupMenuInputIndex = -1;
        };

        $scope.popupStyle = function() {};
        $scope.arrowOffset = function() {};

        $scope.popupMenuMoveTo = function () {
            if (!!$scope.position) {
                var x = $scope.position[0];
                var y = $scope.position[1];
                var pointOffset = $scope.position[2];
                var leftOffset = 15;
                var topOffset = 58;//-18;
                if ((x - leftOffset) < 0) {
                    x = leftOffset;
                }
                if ((y - topOffset) < 0) {
                    y = topOffset;
                }
                x -= leftOffset;
                y -= topOffset;

                $scope.popupStyle = function() {
                    return {
                        position: 'absolute',
                        left: x + 'px',
                        top: y + 'px',
                    };
                };
                $scope.arrowOffset = function() {
                    return {
                        position: 'relative',
                        left: pointOffset + 'px'
                    };
                };
            }
        };
    });

})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').directive('mtAutoHeight', function () {
        return {
            restrict            : 'A',
            require             : 'ngModel',
            link: function(scope, element, attrs, ngModelCtrl) {

                var lastVal = ngModelCtrl.$viewValue;

                scope.$watch(function ngModelWatch() {
                    var currVal = ngModelCtrl.$viewValue;

                    if (currVal !== lastVal) {
                        lastVal = currVal;

                        var el = element[0];

                        el.style.height = '1px';
                        el.style.height = (15+el.scrollHeight)+'px';
                    }
                    return currVal;
                });
            }
        };
    });

})(window.mt.common);

(function (ns) {
    'use strict';

    /** Adapted from https://github.com/randallb/angular-hammer **/

    var hmGestures = ['hmHold:hold',
                      'hmTap:tap',
                      'hmDoubletap:doubletap',
                      'hmDrag:drag',
                      'hmDragstart:dragstart',
                      'hmDragend:dragend',
                      'hmDragup:dragup',
                      'hmDragdown:dragedown',
                      'hmDragleft:dragleft',
                      'hmDragright:dragright',
                      'hmSwipe:swipe',
                      'hmSwipeup:swipeup',
                      'hmSwipedown:swipedown',
                      'hmSwipeleft:swipeleft',
                      'hmSwiperight:swiperight',
                      'hmTransform:transform',
                      'hmRotate:rotate',
                      'hmPinch:pinch',
                      'hmPinchin:pinchin',
                      'hmPinchout:pinchout',
                      'hmTouch:touch',
                      'hmRelease:release'];

    angular.forEach(hmGestures, function (name) {
        var directive = name.split(':'),
        directiveName = directive[0],
        eventName = directive[1];

        angular.module('mt.common').directive(directiveName, ['$parse', function ($parse) {
            var linkFn = function(scope, element, attr) {
                var fn = $parse(attr[directiveName]);
                var opts = $parse(attr.hmOptions)(scope, {});
                var hammer = new Hammer(element[0], opts);
                hammer.on(eventName, function (event) {
                    if(fn(scope, {$event: event}) !== false) {
                        //don't do a scope apply if the handler returns false
                        scope.$apply(function() {});
                    }
                });
            };
            return {
                link  : linkFn,
                scope : false
            };
        }]);
    });
})(window.mt.common);


(function (ns) {
    'use strict';

    angular.module('mt.common').directive('handWritingMenu', function ($timeout, handwritingService, handWritingManagerService) {

        return {
            restrict: 'E',
            scope: {},
            controller: 'handWritingController',
            replace: true,
            template:
                '<div class="mt-hand-writer-main">' + //navbar-fixed-bottom
                    '<div class="mt-hand-writer-header row-fluid">' +
                        //'Hand Writer' +
                        '<div class="mt-hand-writer-btn-clear span2" ng-click="clear()">Clear</div>' +
                        '<div class="mt-hand-writer-btn-backspace span2" ng-click="backspace()">Backspace</div>' +
                        '<div class="span6"></div>' +
                        '<div class="mt-hand-writer-btn-exit span2" ng-click="setVisible(false)">X</div>' +
                    '</div>' +
                    '<div class="mt-hand-writer-container">' +
                          '<canvas class="mt-hand-writer-canvas" width="{{width}}" height="{{height}}" hm-tap="tap($event)" hm-drag="drag($event)" hm-dragstart="dragStart($event)" hm-dragend="dragEnd($event)"> </canvas>' +
                    '</div>' +
                '</div>',
            link: function (scope, element, attrs) {
                scope.isVisible = false;
                element.hide();
                var dismissTimeout;

                var hasTouch = !!('ontouchstart' in window) || !!('onmsgesturechange' in window);

                scope.height = $(window).height()/3;
                scope.width = Math.max(mt.common.IPAD_WIDTH, $(window).width());

                //digital ink
                scope.strokes = [];

                //injection method for acceptance tests
                scope.injectText = function (text) {
                    scope.update(text, []);
                };

                // immediately set panel visibility
                scope.setVisible = function (visible) {
                    if (visible === false) {
                        $(scope.inputElement).find('input').blur();
                        $(scope.inputElement).removeClass('mt-hw-active-input');
                        element.hide();
                    } else {
                        element.show();
                    }
                    handwritingService.setPanelVisible(visible);
                    scope.isVisible = visible;
                };

                scope.openHandwriter = function (model) {
                    $timeout.cancel(dismissTimeout);

                    scope.strokes = model.strokes;
                    if(scope.strokes === undefined) {
                        scope.strokes = [];
                    }
                    drawStrokes();
                    setElementActive(model.element);

                    scope.mode = model.recognizerMode ? model.recognizerMode : mt.common.HW_MODE_EQN;

                    scope.isVisible = true;
                    element.show();
                };
                handwritingService.setHandler(scope.openHandwriter);

                scope.update = function (result, strokes) {
                    var model = handwritingService.getActiveModel();
                    var updateCallback = model.updateCallback;
                    if (angular.isFunction(updateCallback)) {
                        updateCallback(result, strokes);
                    }
                };

                function setElementActive(inputElement) {
                    scope.inputElement = inputElement;
                    $('.mt-hw-active-input input').blur();
                    $('.mt-hw-active-input').removeClass('mt-hw-active-input');
                    if(inputElement) {
                        $(inputElement).addClass('mt-hw-active-input');
                        var inputHeight = $(inputElement).height();
                        var inputTop = $(inputElement).offset().top;
                        var panelHeight = element.height();
                        var windowHeight = $(window).height();
                        var toolspace = $('#toolSpace');
                        var toolspaceTop = parseInt(toolspace.css('top'), 10);

                        var toolSpaceOffset = Math.min(0, -inputTop - inputHeight - panelHeight - 20 + windowHeight + toolspaceTop);
                        toolspace.css({ top: toolSpaceOffset +'px' });

                        console.log('offset toolspace by top = ' + toolSpaceOffset, inputHeight, inputTop, panelHeight, windowHeight, toolspaceTop);
                    }
                }

                scope.clear = function () {
                    scope.strokes = [];
                    drawStrokes();
                    scope.recognize();
                };

                scope.backspace = function () {
                    scope.strokes.splice(scope.strokes.length - 1, 1);
                    drawStrokes();
                    scope.recognize();
                };

                //return the XY on the canvas
                function getXY(e) {
                    //return [e.gesture.center.pageX, e.gesture.center.pageY];
                    return [e.gesture.center.pageX-$(canvas).offset().left, e.gesture.center.pageY-$(canvas).offset().top];
                }

                //DRAWING
                var canvas = $(element).find('.mt-hand-writer-canvas')[0];
                var stroke, lastX, lastY, ctx;
                var drawing = false;

                function initCanvas() {
                    ctx = canvas.getContext('2d');

                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                }
                initCanvas();

                function drawStrokes() {
                    ctx.clearRect(0, 0, scope.width, scope.height);
                    for(var i in scope.strokes) {
                        drawStroke(scope.strokes[i]);
                    }
                }

                function drawStroke(stroke) {
                    for(var j = 1; j < stroke.x.length; j++) {
                        ctx.beginPath();
                        ctx.moveTo(stroke.x[j-1], stroke.y[j-1]);
                        ctx.lineTo(stroke.x[j], stroke.y[j]);
                        ctx.stroke();
                    }
                }

                //GESTURES
                scope.tap = function (event) {
                    var xy = getXY(event);
                    var stroke = {
                        type:'stroke',
                        x : [xy[0]-2, xy[0]+5, xy[0]+3, xy[0]-2, xy[0]-2],
                        y : [xy[1]-3, xy[1]-3, xy[1]+3, xy[1]+4, xy[1]-3]
                    };
                    drawStroke(stroke);
                    scope.strokes.push(stroke);
                };

                scope.dragStart = function (event) {
                    var xy = getXY(event);
                    stroke = {
                        type:'stroke',
                        x : [xy[0]],
                        y : [xy[1]]
                    };
                    lastX = xy[0];
                    lastY = xy[1];
                    drawing = true;
                };

                scope.drag = function (event) {
                    event.gesture.preventDefault();
                    if (drawing) {
                        var xy = getXY(event);

                        ctx.beginPath();
                        ctx.moveTo(lastX, lastY);
                        ctx.lineTo(xy[0], xy[1]);
                        ctx.stroke();
                        stroke.x.push(xy[0]);
                        stroke.y.push(xy[1]);
                        lastX = xy[0];
                        lastY = xy[1];
                    }
                };

                scope.dragEnd = function () {
                    if (drawing) {
                        drawing = false;
                        scope.strokes.push(stroke);
                        scope.recognize();
                    }
                };

                var dismissEvent = hasTouch ? 'touchstart.handWriterDismissTouch' : 'mousedown.handWriterDismiss';

                //watch to apply listeners to close the panel
                scope.$watch('isVisible', function (value) {

                    if (value) {
                        $('#workspace').on(dismissEvent, function (e) {
                            if ($(element).has(e.target).length === 0) {
                                dismissPanel();
                            }
                        });
                    } else {
                        dismissPanel();
                    }
                });

                function dismissPanel() {
                    $timeout.cancel(dismissTimeout);
                    $('#workspace').off(dismissEvent);
                    dismissTimeout = $timeout(function () {
                        scope.setVisible(false);
                        $('#toolSpace').css({ top: '0px' });
                    }, 500, true);
                }
            }
        };
    });

})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').directive('keypadMenu', function (keypadService) {

        return {
            restrict: 'E',
            scope: {
//                keypad: '=keypad',
//                isVisibleFn: '=isVisibleFn',
//                setVisibleFn: '=setVisibleFn',
//                reposition: '='

            },
            replace: true,
            template:
                '<div class="mt-keypad-menu" ng-show="keypadService.isVisible()" hm-dragstart="dragStartKeypad($event)" hm-dragend="dragEndKeypad($event)" hm-drag="dragKeypad($event)">' +
                    '<div class="mt-popup-menu-style" >' +
                        '<div class="modal-header">' +
                            'Keypad' +
                            '<div class="mt-keypad-exit-button" hm-tap="keypadService.setVisible(false)">X</div>' +
                        '</div>' +
                        '<div class="modal-body">' +
                            '<div ng-repeat="r in [] | range:keypad.getNumRows()">' +
                                '<div hm-tap="keypad.getKeyAt(r, c).doAction()" class="mt-key-button-border mt-keypad_{{keypad.getKeyAt(r, c).getTitle()}}" ' +
                                    'ng-repeat="c in [] | range:keypad.getNumKeys(r)">' +
                                    '<button class="mt-key-button" disabled>' +
                                        '{{keypad.getKeyAt(r, c).getName()}}' +
                                    '</button>' +
                                    '<div class="mt-key-button-cover"></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>',
            link: function (scope, element, attrs) {
                element.draggable({
                    containment: 'window'
                });
                scope.keypadService = keypadService;

                scope.$watch('keypadService.isVisible()', function (newValue, oldValue) {
                    if (newValue && !oldValue) {
                        scope.keypad = keypadService.getKeypad();
                    }
                });

                scope.dragStartKeypad = function (event) {
                    var offset = $(element).offset();
                    scope.keypadTouchOffset = [event.gesture.center.pageX - offset.left, event.gesture.center.pageY - offset.top];
                };

                scope.dragEndKeypad = function (event) {
                    var offset = $(element).offset();
                    var size = $(element).find('.mt-popup-menu-style');
                    var newOffset = {
                        left: offset.left,
                        top: offset.top
                    };
                    if (newOffset.left < 0) {
                        newOffset.left = 0;
                    }
                    if (newOffset.top < 0) {
                        newOffset.top = 0;
                    }
                    if (newOffset.left > $(window).width() - size.width()) {
                        newOffset.left = $(window).width() - size.width();
                    }
                    if (newOffset.top > $(window).height() - size.height()) {
                        newOffset.top = $(window).height() - size.height();
                    }
                    $(element).offset(newOffset);
                };

                scope.dragKeypad = function (event) {
                    $(element).offset({
                        left: event.gesture.center.pageX - scope.keypadTouchOffset[0],
                        top: event.gesture.center.pageY - scope.keypadTouchOffset[1]
                    });
                };
            }
        };
    });

})(window.mt.common);


(function (ns) {
    'use strict';

    angular.module('mt.common').directive('mtLinkIndicator', function () {
        return {
            restrict: 'E',
            scope: {
                eventineer: '='
            },
            replace: true,
            template:
                '<div class="mt-link-indicator" ng-style="eventineer.getLinkStyle()">linked</div>'
        };
    });

})(window.mt.common);



(function (ns) {
    'use strict';

    angular.module('mt.common').directive('mtModalAlert', function(modalAlertService) {
        return {
            restrict: 'E',
            template:
                '<div modal="shouldShowModalAlert">' +
                    '<div class="modal-body">' +
                        '<h4>{{modalAlertMessage}}</h4>' +
                        '<br/>' +
                        '<button ng-click="hideModalAlert()" class="btn btn-primary ok">Continue</button>' +
                    '</div>' +
                '</div>',
            scope: {},
            link: function(scope, element) {
                scope.shouldShowModalAlert = false;
                scope.modalAlertMessage = '';

                //NOTE - this still isn't very clean - we should have an isolate scope but preserving the old hacky route for noe
                scope.showModalAlert = function (text) {
                    scope.shouldShowModalAlert = true;
                    scope.modalAlertMessage = text;
                };

                scope.hideModalAlert = function () {
                    scope.shouldShowModalAlert = false;
                };

                modalAlertService.registerShowFn(scope.showModalAlert);

                // remove the popup explicitly since it is in a different DOM position
                scope.$on('$destroy', function() {
                    $(element).remove();
                });
            }
        };
    });

})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').directive('mtAbstractPanel', function (workspaceAbstractService, preconfiguredToolService, undoService) {
        return {
            restrict: 'E',
            templateUrl: 'templates/mtAbstractPanelTemplate.html',
            scope: {},
            link: function (scope, element, attrs) {
                scope.curAbstract = workspaceAbstractService.getAbstract();

                workspaceAbstractService.registerSetCallback(function(abstract) {
                    scope.curAbstract = abstract;
                });

                scope.getAbstract = function() {
                    return workspaceAbstractService.getAbstract();
                };

                scope.isOpen = function() {
                    return workspaceAbstractService.isOpen();
                };

                scope.close = function() {
                    return workspaceAbstractService.toggle(false);
                };

                scope.openTool = function(index, submitted) {
                    undoService.save();
                    //override the id - it should always open a new tool
                    var tool;
                    if(submitted === true) {
                        tool = scope.curAbstract.submittedTools[index];
                    } else {
                        tool = scope.curAbstract.tools[index];
                    }
                    tool.toolId = mt.common.createGuid();
                    preconfiguredToolService.addToolWithData(tool);
                };

                scope.removeToolSubmission = function(index) {
                    scope.curAbstract.submittedTools.splice(index, 1);
                    workspaceAbstractService.updateCDA();
                };

                scope.toggleWorkspace = function() {
                    workspaceAbstractService.toggleSubmissionDisplay();
                };

                scope.isSubmittedActive = function() {
                    return workspaceAbstractService.isSubmissionDisplayed();
                };

                scope.removeWorkspaceSubmission = function() {
                    if(scope.isSubmittedActive() === true) {
                        scope.toggleWorkspace();
                    }
                    scope.curAbstract.submittedWorkspace = undefined;
                    workspaceAbstractService.updateCDA();
                };
            }
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').directive('mtButton', function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                config: '='
            },
            templateUrl: 'templates/mtButtonTemplate.html',
            link: function(scope, element, attrs) {
                scope.hasOption = scope.config.options !== undefined;
                scope.hasText = scope.hasOption || scope.config.text !== undefined;
                scope.hasInputTypes = (scope.config.inputTypes !== undefined);
                var hasToggle = !scope.hasOption && (scope.config.toggledClass !== undefined || scope.config.toggledText !== undefined);

                if(scope.hasText) {
                    scope.text = scope.config.text;
                }

                var optionsElement;
                if(scope.hasOption) {
                    optionsElement = $(element).find('.mt-button-options');
                }

                scope.backgroundClass = scope.config.backgroundClass;

                scope.iconClass = scope.config.inactiveClass;

                scope.inputVisible = false;
                scope.inputText = '';
                scope.inputType = mt.stats.STATS_FIELD_TYPE_NUMERIC;

                scope.touch = function () {
                    scope.iconClass = scope.config.activeClass;
                    scope.backgroundClass = 'mt-active-button';
                };

                scope.release = function () {
                    if(scope.config.callbackFn) {
                        if(scope.config.hasInput) {
                            if(scope.inputVisible) {
                                resetInputState();
                                scope.inputVisible = false;
                            }
                            else {
                                if(scope.config.getActiveHeaderFn !== undefined) {
                                    var activeHeader = scope.config.getActiveHeaderFn();
                                    if(activeHeader !== undefined) {
                                        scope.inputText = activeHeader.display;
                                        scope.inputType = activeHeader.type;
                                    }
                                }
                                scope.inputVisible = true;
                            }
                        } else if(scope.hasOption) {
                            scope.toggleOptions();
                        } else {
                            scope.config.callbackFn();
                        }
                    }
                    endHighlight();
                    return false;
                };

                function resetInputState() {
                    scope.inputText = '';
                }

                scope.toggleOptions = function () {
                    //apply transitions
                    if(optionsElement.is(':visible') === false) {
                         //close an open options
                        $('.mt-button-options').hide();
                        $('.mt-button-active-options').removeClass('mt-button-active-options');
                        optionsElement.addClass('mt-button-active-options');
                    }

                    optionsElement.toggle('slide', { direction: 'left' }, 300);
                };

                scope.inputSubmit = function () {
                    scope.config.callbackFn(scope.inputText, scope.inputType);
                    resetInputState();
                    scope.inputVisible = false;
                };

                scope.inputTypeSelect = function (event, inputTypeValue) {
                    scope.inputType = inputTypeValue;
                };

                scope.optionSelect = function(event, index) {
                    scope.config.callbackFn(scope.config.options[index]);
                    scope.toggleOptions();
                };

                function endHighlight () {
                    if(hasToggle) {
                        applyToggle();
                    } else {
                        scope.iconClass = scope.config.inactiveClass;
                        scope.backgroundClass = scope.config.backgroundClass;
                    }
                }

                var toggleState = false;
                function applyToggle (state) {
                    if(state === undefined) {
                        if(scope.config.getToggleStateFn !== undefined)   {
                            toggleState = scope.config.getToggleStateFn();
                        } else {
                            toggleState = !toggleState;
                        }
                    } else {
                        toggleState = state;
                    }

                    if(toggleState) {
                        scope.iconClass = scope.config.toggledClass;
                        scope.text = scope.config.toggledText;
                        if(scope.config.toggledBackgroundClass !== undefined) {
                            scope.backgroundClass = scope.config.toggledBackgroundClass;
                        } else {
                            scope.backgroundClass = scope.config.backgroundClass;
                        }
                    } else {
                        scope.iconClass = scope.config.inactiveClass;
                        scope.text = scope.config.text;
                        scope.backgroundClass = scope.config.backgroundClass;
                    }
                }

                if(hasToggle && scope.config.getToggleStateFn !== undefined) {
                    scope.$watch('config.getToggleStateFn()', function(val) {
                        if(val !== toggleState) {
                            applyToggle(val);
                        }
                    });
                }

                if(scope.hasOption && scope.config.getOptionStateFn !== undefined) {
                    scope.$watch('config.getOptionStateFn()', function(val) {
                        scope.text = val;
                    });
                }
            }
        };
    });
})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mt.common').directive('mtDeselector', function (deselectorService) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var hammer = new Hammer(element[0], {});
                hammer.on('tap', function (event) {
                    if (deselectorService.attemptCallback(event) !== false) {
                        //don't do a scope apply if the handler returns false
                        scope.$apply(function() {});
                    }
                });
            }
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').directive('mtDrawer', function () {
        return {
            restrict: 'E',
            transclude: true,
            templateUrl: 'templates/mtDrawerTemplate.html',
            scope: {
                handleText: '@',
                isDisabled: '&',
                drawerApi: '='
            },
            link: function (scope, element, attrs) {
                var DRAG_THRESHOLD = 5;
                var dragStart, dragHandler;

                scope.isBottom = attrs.type === 'bottom';
                scope.isTop = attrs.type === 'top';
                scope.isOpen = false;

                // if positiveYOpens is true, a drag in the positive y direction opens the drawer
                // TODO this could be slightly refactored to support right and left drawers
                function handleVerticalDrag(positiveYOpens, event) {
                    positiveYOpens = !!positiveYOpens;
                    var pos = event.gesture.center.pageY;

                    if (dragStart === undefined) {
                        dragStart = pos;
                    } else {
                        var dist = pos - dragStart;
                        if (dist < 0 && Math.abs(dist) > DRAG_THRESHOLD) {
                            setMenuOpen(!positiveYOpens);
                            scope.release();
                        } else if (dist > 0 && Math.abs(dist) > DRAG_THRESHOLD) {
                            setMenuOpen(positiveYOpens);
                            scope.release();
                        }
                    }
                }

                function setMenuOpen(open) {
                    scope.isOpen = open;

                    if (open && angular.isFunction(scope.drawerApi.didOpenCallback)) {
                        scope.drawerApi.didOpenCallback();
                    }
                }

                scope.drag = function (event) {
                    if (scope.isDisabled()) {
                        return;
                    }
                    event.gesture.preventDefault();

                    var handler = dragHandler[attrs.type];
                    if (angular.isFunction(handler)) {
                        handler(event);
                    }
                };

                scope.release = function () {
                    dragStart = undefined;
                };

                scope.drawerApi.open = _(setMenuOpen).partial(true);
                scope.drawerApi.close = _(setMenuOpen).partial(false);

                dragHandler = {
                    bottom: _(handleVerticalDrag).partial(false),
                    top: _(handleVerticalDrag).partial(true)
                };
            }
        };
    });
})(window.mt.common);
(function (ns) {
    'use strict';

    angular.module('mt.common').directive('mtGlobalMenu', function ($timeout, globalMenuService) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/mtGlobalMenuTemplate.html',
            scope: true, // inherited scope
            link: function (scope, element, attrs) {
                scope.globalMenuService = globalMenuService;

                scope.followLink = function (link) {
                    if (angular.isFunction(link.activate)) {
                        $timeout(link.activate);
                    }

                    // executes on parent scope
                    scope.closeMenu();
                };

//                This was an attempt to resize based on number of links to help with animation
//                scope.$watch('globalMenuService.getLinks().length', function (newVal) {
//                    console.log('links', newVal);
//                    var totalHeight = 0;
//                    $(element).find('.global-link').each(function () {
//                        totalHeight += $(this).height();
//                    });
//
//                    $(element).css('height', totalHeight);
//                });
            }
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').directive('mtGlobalNavbar', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/mtGlobalNavbarTemplate.html',
            scope: {
                header: '@',
                phases: '='
            },
            link: function (scope, element, attrs) {
            }
        };
    });
})(window.mt.common);
(function (ns) {
    'use strict';

    angular.module('mt.common').directive('mtGlobalRibbonMenu', 
        function (activeToolService, annotationService, toolMenuService, undoService) {
            return {
                restrict: 'E',
                scope: {},
                controller: 'globalRibbonMenuCtrl',
                replace: true,
                template: '<div>' +
                            '<mt-ribbon-menu class="mt-ribbon-menu-tool-list" menu="toolListMenu"></mt-ribbon-menu>' +
                            '<mt-ribbon-menu class="mt-ribbon-menu-tool" menu="toolMenu"></mt-ribbon-menu>' +
                            '<mt-ribbon-menu class="mt-ribbon-menu-context" menu="contextMenu"></mt-ribbon-menu>' +
                          '</div>',
                link: function (scope, element) {

                    scope.$watch(
                        //gather all the info needed to figure out which ribbon to display
                        function () {
                            return {
                                activeToolId: activeToolService.getActiveId(),
                                activeToolContextId: toolMenuService.getContext(),
                                pen: annotationService.isActive(),
                                toolList: toolMenuService.isToolListMenuOpen(),
                                notification: undoService.isNotificationActive(),
                                changed: toolMenuService.hasChanged
                            };
                        },

                        function (globalRibbonDisplay, previous) {
                            scope.setRibbonMenu(globalRibbonDisplay, previous);
                        },

                        true //object equality
                    );
                }
            };
        }
    );
})(window.mt.common);
(function (ns) {
    'use strict';

    angular.module('mt.common').directive('mtGlobalSettings', function ($location, environmentService, dataExchangeService, modalAlertService, undoService) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/mtGlobalSettingsTemplate.html',
            scope: true, // inherited scope
            link: function (scope, element, attrs) {
                scope.clearWorkspace = function () {
                    undoService.save('All your tools were cleared from this workbook page');

                    var workspaceApi = environmentService.getSpaceApi(mt.common.DEFAULT_SPACE_ID);
                    workspaceApi.clear();

                    // executes on parent scope
                    scope.closeMenu();
                };

                scope.showUrl = false;
                scope.curUrl = '';

                scope.showEncodedUrl = function () {
                    var toolData = dataExchangeService.exportAll();
                    var encodedData = encodeURIComponent(mt.common.toBase64(JSON.stringify(toolData)));

                    var encodedUrl = $location.absUrl().split('?')[0] + '?toolData=' + encodedData;

                    scope.showUrl = true;
                    scope.curUrl = encodedUrl;
                };
            }
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').directive('mtInputSwitch', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/mtInputSwitchTemplate.html',
            controller: 'InputSwitchCtrl',
            scope: {},
            link: function (scope, element, attrs) {
            }
        };
    });
})(window.mt.common);
(function (ns) {
    'use strict';

    angular.module('mt.common').directive('mtInput', function (handwritingService, safeApply, keypadService) {

        return {
            restrict: 'E',
            scope: {
                model: '=',
                keypad: '='
            },
            replace: true,
            template: '<input type="text" ng-readonly="isReadOnly()" ng-click="selectInput($event, model)" ng-model="model.value">', // <jQuery1.9 throw errors changing type after creation
            link: function (scope, element, attrs) {

                function selectWithKeypad(event, target) {
                    var tapOutFn = function() {
                        safeApply(scope, function(){});
                    };
                    scope.keypad.setKeypadVisible(true, undefined, tapOutFn);
                    scope.keypad.selectInput(event, target);


                    keypadService.showKeypad(scope.keypad, function () {
                        scope.keypad.keypadInput.element.blur();
                    });
                }

                function selectWithHandwriting() {
                    scope.model.editStrokes = angular.isArray(scope.model.editStrokes) ? scope.model.editStrokes : [];
                    handwritingService.openPanelForElement(element, scope.model.editStrokes, mt.common.HW_MODE_EQN, handwritingUpdateCallback);
                }

                function handwritingUpdateCallback(latex, strokes) {
                    safeApply(scope, function () {
                        scope.model.editStrokes = strokes;
                        scope.model.value = latex;
                    });
                }

                scope.selectInput = function (event, target) {
                    if (handwritingService.useHandwriting()) {
                        selectWithHandwriting();
                    } else {
                        if (scope.keypad !== undefined) {
                            selectWithKeypad(event, target);
                        }
                    }
                };

                // if keypad is provided, is always readonly
                // if keypad is not provided, is readonly only when in handwriting mode
                scope.isReadOnly = function () {
                    if (scope.keypad !== undefined) {
                        return true;
                    }
                    return handwritingService.useHandwriting();
                };
            }
        };
    });

})(window.mt.common);



(function (ns) {
    'use strict';

    angular.module('mt.common').directive('mtModalPanel', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/mtModalPanelTemplate.html',
            transclude: true,
            replace: true,
            scope: {
                tapCallback: '='
            },
            link: function (scope, element, attrs) {
                scope.tap = function (event) {
                    // only call callback if outer panel is tapped
                    if ($(event.target).hasClass('mt-modal-panel')) {
                        scope.tapCallback();
                    }
                };

                scope.dismiss = function () {
                    scope.tapCallback();
                };
            }
        };
    });
})(window.mt.common);
(function (ns) {
    'use strict';

    angular.module('mt.common').directive('mtNavigationButton', function () {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/mtNavigationButtonTemplate.html',
            link: function(scope, element, attrs) {
            }
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').directive('mtPanel', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/mtPanelTemplate.html',
            transclude: true,
            replace: true,
            scope: {
                closeCallback: '='
            },
            link: function () {

            }
        };
    });
}) (window.mt.common);
(function (ns) {
    'use strict';

    angular.module('mt.common').directive('mtPenMenu', function (annotationService) {
        return {
            restrict: 'E',
            replace: true,
            scope: {},
            templateUrl: 'templates/mtPenMenuTemplate.html',
            link: function(scope, element, attrs) {
                scope.penService = annotationService;

                scope.isActiveColor = function(color) {
                    return annotationService.getPenColor() === color;
                };
                scope.colors = annotationService.colors;
                scope.penSizes = annotationService.penSizes;

                scope.isActivePenSize = function (size) {
                    return size === annotationService.getPenSize();
                };

                scope.getPenSizeStyle = function (size) {
                    var displaySize = size + 2;
                    var style = {
                        width: displaySize + 'px',
                        height: displaySize + 'px'
                    };
                    return style;
                };
            }
        };
    });
})(window.mt.workspace);

// (function (ns) {
//     'use strict';

//     //custom ribbon button for popovers/extended menu
//     angular.module('mt.common').directive('mtPopoverRibbonButton', function ($rootScope, $timeout) {
//         return {
//             restrict: 'A',
//             replace: true,
//             scope: true,
//             template:'<div class="mt-ribbon-toggle mt-ribbon-popover {{item.opts.cssClass}}" ng-class="{\'mt-ribbon-toggle-active\': isActive()}" ng-show="isVisible()" ng-click="toggle($event)">' +
//                         '<span ng-show="showName">{{item.name}}</span>' +
//                         '<mt-popover ng-show="isActive()"></mt-popover>' +
//                      '</div>',
//             link: function(scope, element, attrs) {
//                 var popover = $(element)[0];
//                 var workspace = $('#toolViewPort');
//                 var globalNav = $('.mt-global-toolbar');
//                 var pops = document.getElementsByClassName('mt-ribbon-popover');

//                 scope.active = false;

//                 scope.showName = (scope.item.opts.showName) || angular.isUndefined(scope.item.opts.cssClass) || (scope.item.opts.cssClass === '');

//                 scope.toggle = function(e) {
//                     var target = e.currentTarget;
//                     scope.active = !scope.active;

//                     //close other open popovers
//                     _.each(pops, function(p){
//                         if(p !== target) {
//                             var otherPop = angular.element(p).scope();
//                             otherPop.active = false;
//                         }
//                     });
//                 };

//                 scope.isActive = function() {
//                     return scope.active;
//                 };

//                 scope.isVisible = function() {
//                     return scope.item.opts.isVisible === undefined || scope.item.opts.isVisible();
//                 };

//                 //insure popover closes when workspace is clicked
//                 $rootScope.$on('donePressed', function() {
//                     scope.active = false;
//                 });

//                 $rootScope.$on('toolOpened', function() {
//                     scope.active = false;
//                 });

//                 workspace.bind('click tap', function(e){
//                     var target = angular.element(e.target)[0];
//                     scope.active = (target === popover) ? true : false; 
//                 });

//                 globalNav.bind('click tap', function(e){
//                     var target = angular.element(e.target)[0];
//                     scope.active = (target === popover) ? true : false; 
//                 });
//             }
//         };
//     });
// })(window.mt.workspace);


(function (ns) {
    'use strict';
    angular.module('mt.common').directive('mtPopover', function () {
        return {
            scope: true,
            restrict: 'E',
            templateUrl: 'templates/mtPopoverTemplate.html',
            replace: true,
            link: function(scope, element, attrs) {
                //prevents popover from closing on click, including touchmove allows for scrolling
                element.on('click tap touchmove', function(e) {
                    e.stopPropagation();
                });
            }
        };
    });
})(window.mt.workspace);
(function (ns) {
    'use strict';

    //DIRECTIVE
    var MtRibbonMenu = [
    function () {
        return {
            replace: true,
            restrict: 'E',
            templateUrl: 'templates/mtRibbonMenuTmpl.html',
            scope: {
                menu: '='
            },
            link: function(scope) {
                //prevent tap events from propagating from the ribbon menu
                scope.tap = function(event) {
                    event.stopPropagation();
                    event.gesture.stopPropagation();
                };
            }
        };
    }];

    var MtRibbonItem = [
        '$compile',
        function ($compile) {
            return {
                scope: {
                    item: '='
                },
                restrict: 'A',
                replace: true,
                link: function ($scope, element, attrs, controller) {
                    var itemHtml = '<div mt-ribbon-' + $scope.item.type + '></div>';
                    var e = $compile(itemHtml)($scope);
                    element.replaceWith(e);
                }
            };
        }
    ];

    var MtRibbonSeperator = [
        function () {
            return {
                scope: true,
                restrict: 'A',
                template: '<div class="mt-ribbon-seperator"></div>',
                replace: true
            };
        }];

    var MtRibbonButton = [
        function () {
            return {
                scope: true,
                restrict: 'A',
                template: '<div class="mt-ribbon-button {{item.opts.cssClass}}" hm-tap="onClick($event)" ng-show="isVisible()"><span ng-show="showName">{{item.name}}</span></div>',
                replace: true,
                link: function($scope, iElm, iAttrs, controller) {
                    $scope.showName = ($scope.item.opts.showName === true) || angular.isUndefined($scope.item.opts.cssClass) || ($scope.item.opts.cssClass === '');
                    $scope.isVisible = function() {
                        return $scope.item.opts.isVisible === undefined || $scope.item.opts.isVisible();
                    };

                    $scope.onClick = function(event) {
                        event.stopPropagation();
                        event.gesture.stopPropagation();
                        $scope.item.callback();
                    };
                }
            };
        }];

    var MtRibbonLabel = [
        function () {
            return {
                scope: true,
                restrict: 'A',
                template: '<div class="mt-ribbon-label {{item.opts.cssClass}}"><span ng-show="showName" ng-bind="item.getValue() || item.name">{{item.name}}</span></div>',
                replace: true,
                link: function($scope, iElm, iAttrs, controller) {
                    $scope.showName = angular.isUndefined($scope.item.opts.cssClass) || ($scope.item.opts.cssClass === '') || ($scope.item.opts.showName === true);
                }

            };
        }];

    var MtRibbonToggle = [
        function () {
            return {
                scope: true,
                restrict: 'A',
                template: '<div class="mt-ribbon-toggle {{item.opts.cssClass}} {{toggleClass}}" hm-tap="toggle()" ng-show="isVisible()"><span ng-show="showName">{{toggleName}}</span></div>',
                replace: true,
                link: function($scope, iElm, iAttrs, controller) {
                    $scope.val = $scope.item.getValue();
                    $scope.$watch(function() {
                        return $scope.item.getValue();
                    }, function(newVal) {
                        $scope.val = newVal;
                        updateBold();
                    });

                    $scope.toggleClass = '';
                    $scope.toggleName = $scope.item.name;

                    $scope.isVisible = function() {
                        return $scope.item.opts.isVisible === undefined || $scope.item.opts.isVisible();
                    };

                    $scope.showName = ($scope.item.opts.showName === true) || angular.isUndefined($scope.item.opts.cssClass) || ($scope.item.opts.cssClass === '');

                    var updateBold = function() {
                        if ($scope.val === true) {
                            $scope.toggleClass = 'mt-ribbon-toggle-active';
                            $scope.toggleName = $scope.item.opts.nameToggle ? $scope.item.opts.nameToggle : $scope.toggleName;
                        } else {
                            $scope.toggleClass = '';
                            $scope.toggleName = $scope.item.name;
                        }
                    };
                    updateBold();
                    $scope.toggle = function() {
                        $scope.val = !$scope.val;
                        $scope.item.callback($scope.val);
                        updateBold();
                    };
                }
            };
        }];

    var MtRibbonInput = [
        function () {
            return {
                scope: true,
                restrict: 'A',
                template: '<div class="mt-ribbon-input {{item.opts.cssClass}} mt-ribbon-input-{{item.name}}"><input type="text"" placeholder="{{item.opts.placeHolder}}" ng-model="val" \n ng-change="change()" ng-keypress="onKeyPress($event, val)" \n ng-focus="focused=true" \n ng-blur="blur()"> \n <label class="mt-ribbon-input-label" ng-if="item.opts.label" ng-hide="focused" ng-bind="item.opts.label"></label> \n <button class="mt-ribbon-button mt-ribbon-ok-button" type="submit" ng-if="item.opts.updateOnChange === false" ng-show="focused" hm-tap="updateCallback(val)">Ok</button> \n </div>',
                replace: true,
                link: function($scope, iElm, iAttrs, controller) {
                    $scope.inputType = 'text';
                    if ($scope.item.opts.inputType !== undefined) {
                        $scope.inputType = $scope.item.opts.inputType;
                    }
                    $scope.val = $scope.item.getValue();
                    $scope.$watch(function() {
                        return $scope.item.getValue();
                    }, function(newVal) {
                        $scope.val = newVal;
                    });

                    $scope.focused = false;
                    $scope.modified = false;

                    $scope.showName = angular.isUndefined($scope.item.opts.cssClass) || ($scope.item.opts.cssClass === '');

                    $scope.blur = function() {
                        if($scope.modified) {
                            return;
                        }
                        $scope.focused = false;
                    };
                    $scope.updateCallback = function(val) {
                        $scope.item.callback(val);
                        $scope.modified = false;
                        $scope.focused = false;
                    };
                    $scope.change = function() {
                        $scope.modified = true;
                        if($scope.item.opts.updateOnChange === undefined || $scope.item.opts.updateOnChange === true) {
                            $scope.updateCallback($scope.val);
                        }
                    };

                    $scope.onKeyPress = function(e, value) {
                        var key = e.keyCode ? e.keyCode : e.which;

                        if(key === 13) { //enter key
                            $scope.updateCallback(value);
                            $('input').blur(); //closes ipad keyboard
                        }
                    };
                }
            };
        }];

    var MtRibbonSlider = [
        function () {
            return {
                scope: true,
                restrict: 'A',
                template: '<div class="mt-ribbon-slider {{item.opts.cssClass}}">{{item.name}}: <input type="range" max="item.opts.max" min="item.opts.min" step="item.opts.step" ng-model="val" ng-change="item.callback(val)"></div>',
                replace: true,
                link: function($scope, iElm, iAttrs, controller) {
                    $scope.val = $scope.item.getValue();
                    $scope.$watch(function() {
                        return $scope.item.getValue();
                    }, function(newVal) {
                        $scope.val = newVal;
                    });
                }
            };
        }];

    var MtRibbonOptions = [
    '$rootScope',
    function ($rootScope) {
        return {
            scope: true,
            restrict: 'A',
            template: '<div class="mt-ribbon-options" ng-show="isVisible()">' +
                        '<div ng-class="mt-val-css-class" ng-click="toggleOptions()">' +
                            '<div class="mt-button-text" ng-show="showName" ng-bind="val"></div>' +
                            // '<div class="mt-button-arrow-down"></div>' +
                        '</div>' +
                        '<div class="mt-button-options">' +
                            '<div ng-repeat="option in item.valuesAvailable" class="mt-button-option" ng-class="option.cssClass" ng-click="selectOption($index)">' +
                                '<div class="mt-option-text" ng-bind="option.name"></div>' +
                            '</div>' +
                        '</div>' +
                    '</div>',
            replace: true,
            link: function(scope, element) {
                scope.showName = angular.isUndefined(scope.valCssClass) || (scope.valCssClass === '');

                var optionsElement = $(element).find('.mt-button-options');

                scope.selectOption = function(index) {
                    scope.item.callback(scope.item.valuesAvailable[index].name);
                    scope.toggleOptions();
                };

                scope.toggleOptions = function() {
                    //apply transitions
                    if(optionsElement.is(':visible') === false) {
                        //globally close any open options
                        $('.mt-button-options').hide();
                        $('.mt-button-active-options').removeClass('mt-button-active-options');
                        optionsElement.addClass('mt-button-active-options');
                    }

                    optionsElement.toggle('slide', { direction: 'up'}, 200);
                };

                scope.isVisible = function() {
                    return scope.item.opts.isVisible === undefined || scope.item.opts.isVisible();
                };

                $rootScope.$on('donePressed', function(e) {
                    if(optionsElement.is(':visible')){
                        optionsElement.toggle('slide', { direction: 'up'}, 200);
                    }
                });

                if(scope.item.getValue !== undefined) {
                    scope.$watch(function() {
                        return scope.item.getValue();
                    }, function(newVal) {
                        scope.val = newVal;
                        //find the corresponding css for the option
                        var selectedOption = _.findWhere(scope.item.valuesAvailable, {name: newVal});
                        if(selectedOption !== undefined) {
                            scope.valCssClass = selectedOption.cssClass;
                        }
                    });
                } else {
                    scope.val = scope.item.name;
                }

            }
        };
    }];

    var MtRibbonPopover = [
        '$rootScope',
        function($rootScope) {
            return {
                restrict: 'A',
                replace: true,
                scope: true,
                template:'<div class="mt-ribbon-toggle mt-ribbon-popover {{item.opts.cssClass}}" ng-class="{\'mt-ribbon-toggle-active\': isActive()}" ng-show="isVisible()" ng-click="toggle($event)">' +
                            '<div ng-if="item.opts.showName" style="margin-bottom: 17px;">{{item.name}}</div>'+
                            '<svg ng-if="!item.opts.showName" class="mt-ribbon-popover-dots" width="64px" height="44px" viewBox="0 0 64 44" version="1.1" xmlns="http://www.w3.org/2000/svg">'+
                                '<circle fill="white" cx="14" cy="22" r="4"></circle>'+
                                '<circle fill="white" cx="32" cy="22" r="4"></circle>'+
                                '<circle fill="white" cx="50" cy="22" r="4"></circle>'+
                            '</svg>' +
                            '<mt-popover ng-show="isActive()"></mt-popover>' +
                         '</div>',
                link: function(scope, element, attrs) {
                    var popover = $(element)[0];
                    var workspace = $('#toolViewPort');
                    var globalNav = $('.mt-global-toolbar');
                    var pops = document.getElementsByClassName('mt-ribbon-popover');

                    scope.active = false;

                    scope.showName = (scope.item.opts.showName) || angular.isUndefined(scope.item.opts.cssClass) || (scope.item.opts.cssClass === '');

                    scope.toggle = function(e) {
                        var target = e.currentTarget;
                        scope.active = !scope.active;

                        //close other open popovers
                        _.each(pops, function(p){
                            if(p !== target) {
                                var otherPop = angular.element(p).scope();
                                otherPop.active = false;
                            }
                        });
                    };

                    scope.isActive = function() {
                        return scope.active;
                    };

                    scope.isVisible = function() {
                        return scope.item.opts.isVisible === undefined || scope.item.opts.isVisible();
                    };

                    //insure popover closes when workspace is clicked
                    $rootScope.$on('donePressed', function() {
                        scope.active = false;
                    });

                    $rootScope.$on('toolOpened', function() {
                        scope.active = false;
                    });

                    workspace.bind('click tap', function(e){
                        var target = angular.element(e.target)[0];
                        scope.active = (target === popover) ? true : false; 
                    });

                    globalNav.bind('click tap', function(e){
                        var target = angular.element(e.target)[0];
                        scope.active = (target === popover) ? true : false; 
                    });
                }
            };
        }
    ];

    var MtRibbonCustom = [
        '$compile', '$timeout',
        function ($compile, $timeout) {
            return {
                scope: true,
                restrict: 'A',
                template: '<div class="mt-ribbon-custom"></div>',
                link: function ($scope, element) {
                    $timeout(function() {
                        var e = $compile($scope.item.htmlTemplate)($scope);
                        element.replaceWith(e);
                    });
                }
            };
        }
    ];

    angular.module('mt.common')
        .directive('mtRibbonMenu', MtRibbonMenu)
        .directive('mtRibbonItem', MtRibbonItem)
        .directive('mtRibbonSeperator', MtRibbonSeperator)
        .directive('mtRibbonButton', MtRibbonButton)
        .directive('mtRibbonLabel', MtRibbonLabel)
        .directive('mtRibbonToggle', MtRibbonToggle)
        .directive('mtRibbonSlider', MtRibbonSlider)
        .directive('mtRibbonInput', MtRibbonInput)
        .directive('mtRibbonOptions', MtRibbonOptions)
        .directive('mtRibbonPopover', MtRibbonPopover)
        .directive('mtRibbonCustom', MtRibbonCustom);

})(window.mt.common);

(function (ns) {
    'use strict';

    //simple toggleable panel for use with nested panel displays
    angular.module('mt.common').directive('mtTogglePanel', function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            template: '<div class="mt-toggle-panel" ng-transclude></div>',
            link: function(scope, element, attrs) {
                //NOTE - this wrapper directive expects header and body elements with the following selectors
                var headerSelector = '.mt-panel-header';
                var bodySelector = '.mt-panel-body';

                setTimeout(function () {
                    var header = $(element).find(headerSelector)[0];
                    var body = $(element).find(bodySelector).first();
                    body.hide();
                    var hammer = new Hammer(header, {});
                    hammer.on('tap', function () {
                        body.toggle();//'slide', { direction: 'up' }, 500); <- put some animation in here - this one doesn't look very good
                    });

                    $(header).append('<div class="mt-toggle-panel-icon"></div>');
                });
            }
        };
    });
})(window.mt.workspace);

(function (ns) {
    'use strict';

    angular.module('mt.common').directive('mtTray', function () {
        return {
            restrict: 'E',
            templateUrl: 'templates/mtTrayTemplate.html',
            transclude: true,
            replace: true,
            scope: {
                name: '@'
            },
            link: function (scope, element, attrs) {
                scope.minimized = false;
                scope.navMinimized = false;

                scope.tap = function () {
                    scope.minimized = !scope.minimized;
                };

                scope.toggleNav = function(){
                    scope.navMinimized = !scope.navMinimized;
                    scope.$emit('toggleNav');
                };

                scope.$on('toggleTray', function (event, name) {
                    if (scope.name === name) {
                        scope.minimized = !scope.minimized;
                    }
                });
            }
        };
    });
})(window.mt.common);
(function (ns) {
    'use strict';

    angular.module('mt.common').directive('mtExternalTool', function ($compile, toolPersistorService, toolRegistryService, dataExchangeService) {
        return {
            scope: {
                containerApi: '=',
                toolId: '=',
                type: '='
            },
            restrict: 'E',
            link: function (scope, element) {
                var template = toolRegistryService.getTemplate(scope.type);

                var e = $compile(template.htmlTemplate)(scope);
                element.replaceWith(e);

                //if the tool is non-angular then it should have a create fn that does executes it's controller and returns an API object
                if(template.initFn !== undefined) {
                    var externalToolApi = template.initFn(e);
                    if(externalToolApi.serializeFn !== undefined && externalToolApi.deserializeFn !== undefined) {
                        toolPersistorService.registerTool(scope.toolId, scope.type, scope.containerApi, externalToolApi.serializeFn, externalToolApi.deserializeFn);
                    } else {
                        console.log('external tool did not register serialize/deserialize callbacks - will not persist.');
                    }
                    if(template.exportTargets !== undefined && externalToolApi.exportFn !== undefined && externalToolApi.importFn !== undefined) {
                        dataExchangeService.registerTool(scope.toolId, scope.type, externalToolApi.exportFn, externalToolApi.importFn, scope.containerApi, ['table']);
                    }
                }
            }
        };
    });

})(window.mt.common);

(function (ns) {
    'use strict';

    //custom ribbon button for the pen tool
    angular.module('mt.common').directive('mtPenRibbonButton', function (annotationService) {
        return {
            restrict: 'E',
            replace: true,
            scope: {},
            template: '<div class="mt-pen-menu-button-wrapper">' +
                        '<div class="mt-ribbon-toggle mt-ribbon-image-annotation-pen" ng-class="{\'mt-ribbon-toggle-active\': isActive()}" ng-click="onClick()"></div>' +
                        '<mt-pen-menu></mt-pen-menu>' +
                        '<div class="mt-pen-style-indicator" ng-style="getPenIndicatorStyle()"></div>' +
                    '</div>',
            link: function(scope, element, attrs) {
                scope.onClick = function() {
                    annotationService.togglePenMenu();
                };

                scope.getPenIndicatorStyle = function() {
                    var displaySize = parseInt(annotationService.getPenSize()/4+3, 10);
                    return {
                        'background-color': annotationService.getPenColor(),
                        width: displaySize + 'px',
                        height: displaySize + 'px'
                    };
                };

                scope.isActive = function() {
                    return annotationService.isPenMenuOpen();
                };
            }
        };
    });
})(window.mt.workspace);


(function (ns) {
    'use strict';

    angular.module('mt.common').directive('popupMenu', function () {

        return {
            restrict: 'E',
            scope: {},
            controller: 'PopupMenuCtrl',
            template:
            '<div class="mt-popup-menu" ng-show="active" ng-style="popupStyle()">' +
                '<div class="mt-popup-menu-offset">' +
                    '<div class="mt-popup-menu-arrow-up-offset" ng-style="arrowOffset()">' +
                        '<div class="mt-popup-menu-arrow-up"></div>' +
                    '</div>' +
                    '<div class="mt-popup-menu-func-container">' +
                        '<div class="mt-popup-menu-style mt-popup-menu-left-menu-cap"></div>' +
                        '<div class="mt-popup-menu-style mt-popup-menu-arrow-left-container" ng-show="popupMenuLeftArrowVisible">' +
                            '<div class="mt-popup-menu-arrow-container">' +
                                '<div class="mt-popup-menu-arrow-left" >' +
                                    '<div ng-click="popupMenuLeftButton()" class="mt-popup-menu-arrow-left-touch" ></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="mt-popup-menu-buttons" >' +
                            '<div ng-show="popupMenuItemsLength() <= 0" class="mt-popup-menu-style mt-popup-menu-item">' +
                                '<div class="mt-popup-menu-text-container">' +
                                    '<div class="mt-popup-menu-text" style="font-style: italic;">NONE</div>' +
                                '</div>' +
                            '</div>' +
                            '<mt-popup-menu-button ng-repeat="item in activeItems" item="item" dismiss-fn="dismissPopupMenu" index="$index"> </mt-popup-menu-item>' +
                        '</div>' +
                        '<div class="mt-popup-menu-style mt-popup-menu-arrow-right-container" ng-show="popupMenuRightArrowVisible">' +
                            '<div class="mt-popup-menu-arrow-container">' +
                                '<div class="mt-popup-menu-arrow-right">' +
                                    '<div ng-click="popupMenuRightButton()" class="mt-popup-menu-arrow-right-touch" ></div>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                        '<div class="mt-popup-menu-style mt-popup-menu-right-menu-cap"></div>' +
                    '</div>' +
                    '<div class="mt-popup-menu-arrow-down-offset" ng-style="arrowOffset()">' +
                        '<div class="mt-popup-menu-arrow-down"></div>' +
                    '</div>' +
                '</div>' +
            '</div>',
            link: function (scope, element, attrs) {
                var hasTouch = !!('ontouchstart' in window) || !!('onmsgesturechange' in window);

                scope.$watch('active', function(value) {
                    var dismissText = hasTouch ? 'touchstart.popupDismissTouch' : 'mousedown.popupDismiss';
                    if (value){
                        $(document).on(dismissText, function (e) {
                            if ($('.mt-popup-menu').has(e.target).length === 0 /*&& $(currentPopupHeaderHeaderElement).has(e.target).length === 0*/) {
                                scope.$apply(function() {
                                    scope.dismissPopupMenu();
                                    $(document).off(dismissText);
                                });
                            }
                        });
                    }
                    else {
                        $(document).off(dismissText);
                    }
                });

            }
        };
    });

    angular.module('mt.common').directive('mtPopupMenuButton', function () {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                item: '=',
                index: '=',
                dismissFn: '='
            },
            template:
                '<div class="mt-popup-menu-style mt-popup-menu-item mt-popup-menu-button{{index}}">' +
                    '<div class="mt-popup-menu-text-container" ng-click="onClick()">' +
                        '{{item.text}}' +
                    '</div>' +
                    '<div class="mt-popup-menu-input" ng-show="item.inputActive">' +
                        '<input class="mt-popup-menu-input-field" type="text" name="popupMenuInput" ng-model="inputValue">' +
                        '<button class="btn mt-popup-menu-submit-button" ng-click="submitInput()">OK</button>' +
                    '</div>' +
                '</div>',
            link: function (scope, element, attrs) {
                scope.inputValue = '';

                scope.onClick = function () {
                    if (scope.item.func) {
                        scope.item.func();
                        scope.dismissFn(true);
                    } else if (scope.item.funcSetInput) {
                        scope.item.inputActive = !scope.item.inputActive;
                        if(scope.item.inputActive && scope.item.funcGetInput() !== undefined) {
                            scope.inputValue = scope.item.funcGetInput();
                        }
                    } else {
                        scope.dismissFn(true);
                    }
                };
                scope.submitInput = function () {
                    scope.item.funcSetInput(scope.inputValue);
                    scope.item.inputActive = false;
                    scope.dismissFn(true);
                };
            }
        };
    });



})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').directive('settingsMenu', function () {

        return {
            restrict: 'E',
            scope: {
                settings: '=',
                containerApi: '='
            },
            replace: true,
            template:
                '<div>' +
                '<div class="mt-settings-button" ng-click="setVisibility()"></div>' +
                '<div ng-show="isVisible" class="mt-popup-menu-style mt-settings-menu-frame">' +
                    '<div class>' +
                    '<div class="modal-header">' +
                        'Settings' +
                    '</div>' +
                    '<div class="modal-body mt-popup-menu-style">' +
                        '<div class="checkbox" ng-repeat="i in [] | range:settings.getNumItems()">' +
                            '<label><input class="mt-setting-input_{{i}}" type="checkbox" ng-model="settings.getItemAtIndex(i).value" > {{settings.getItemAtIndex(i).name}}</label>' +
                        '</div>' +
                    '</div>' +
                    '</div>' +
                '</div>' +
                '</div>',
            link: function (scope, element, attrs) {
                scope.isVisible = false;

                scope.setVisibility = function (visible) {
                    if(visible === undefined) {
                        scope.isVisible = !scope.isVisible;
                    } else {
                        scope.isVisible = visible;
                    }
                };

                scope.onClose = function() {
                    scope.setVisibility(false);
                };

                scope.containerApi.registerShowControls(function () {
                    scope.setVisibility(!scope.isVisible);
                });
            }
        };
    });

})(window.mt.common);



(function (ns) {
    'use strict';

    /*
     * TODO: replace with the angular version once released
     */
    angular.module('mt.common').directive('uiIf', [function () {
        return {
            transclude: 'element',
            priority: 1000,
            terminal: true,
            restrict: 'A',
            compile: function (element, attr, transclude) {
                return function (scope, element, attr) {

                    var childElement;
                    var childScope;

                    scope.$watch(attr.uiIf, function (newValue) {
                        if (childElement) {
                            childElement.remove();
                            childElement = undefined;
                        }
                        if (childScope) {
                            childScope.$destroy();
                            childScope = undefined;
                        }

                        if (newValue) {
                            childScope = scope.$new();
                            transclude(childScope, function (clone) {
                                childElement = clone;
                                element.after(clone);
                            });
                        }
                    });
                };
            }
        };
    }]);
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').filter('range', function () {

        return function (input, total) {
            total = parseInt(total, 10);
            for (var i = 0; i < total; i++) {
                input.push(i);
            }
            return input;
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').filter('reverse', function() {
        return function(items) {
            return items.slice().reverse();
        };
    });
})(window.mt.common);

//<!-- mt.mathToolsProperties -->
// This is the companion file to properties/mathTools.properties. Any properties
// exposed in mathTools.properties need to have corresponding properties in this file.

// Since this file is part of the build it will always be available, whereas
// mathTools.properties might not. The actual property names are included here for
// looking up the user-defined values that are available to users from mathTools.properties

(function (ns)
{
    'use strict';

////////////////////////////////////////////////
// Common (across all workspaces and tools)
////////////////////////////////////////////////



////////////////////////////////////////////////
// Workspace
////////////////////////////////////////////////

// Workspaces Common

// Teacher Workspace

// Student Workspace



////////////////////////////////////////////////
// Tools
////////////////////////////////////////////////

// Tools Common


// Table

    ns.TABLE_NUM_COLUMNS                            = 2;
    ns.TABLE_NUM_COLUMNS_PROP                       = 'Table.numberOfColumns';
    ns.TABLE_NUM_COLUMNS_DESCRIPTION                = 'Table Number of Columns';

    ns.TABLE_NUM_ROWS                               = 5;
    ns.TABLE_NUM_ROWS_PROP                          = 'Table.numberOfRows';
    ns.TABLE_NUM_ROWS_DESCRIPTION                   = 'Table Number of Rows';

// Graph

    ns.GRAPH_MINOR_TICK_INTERVAL_X                  = 1;
    ns.GRAPH_MINOR_TICK_INTERVAL_X_PROP             = 'Graph.minorTickIntervalX';
    ns.GRAPH_MINOR_TICK_INTERVAL_X_DESCRIPTION      = 'Graph Minor Tick Interval for X';

    ns.GRAPH_MINOR_TICK_INTERVAL_Y                  = 1;
    ns.GRAPH_MINOR_TICK_INTERVAL_Y_PROP             = 'Graph.minorTickIntervalY';
    ns.GRAPH_MINOR_TICK_INTERVAL_Y_DESCRIPTION      = 'Graph Minor Tick Interval for Y';

    ns.GRAPH_MAJOR_TICK_INTERVAL_X                  = 5;
    ns.GRAPH_MAJOR_TICK_INTERVAL_X_PROP             = 'Graph.majorTickIntervalX';
    ns.GRAPH_MAJOR_TICK_INTERVAL_X_DESCRIPTION      = 'Graph Major Tick Interval for X';

    ns.GRAPH_MAJOR_TICK_INTERVAL_Y                  = 5;
    ns.GRAPH_MAJOR_TICK_INTERVAL_Y_PROP             = 'Graph.majorTickIntervalY';
    ns.GRAPH_MAJOR_TICK_INTERVAL_Y_DESCRIPTION      = 'Graph Major Tick Interval for Y';

    ns.GRAPH_MAX_X                                  = 10;
    ns.GRAPH_MAX_X_PROP                             = 'Graph.maxX';
    ns.GRAPH_MAX_X_DESCRIPTION                      = 'Graph Max X';

    ns.GRAPH_MAX_Y                                  = 10;
    ns.GRAPH_MAX_Y_PROP                             = 'Graph.maxY';
    ns.GRAPH_MAX_Y_DESCRIPTION                      = 'Graph Max Y';

    ns.GRAPH_MIN_X                                  = -10;
    ns.GRAPH_MIN_X_PROP                             = 'Graph.minX';
    ns.GRAPH_MIN_X_DESCRIPTION                      = 'Graph Min X';

    ns.GRAPH_MIN_Y                                  = -10;
    ns.GRAPH_MIN_Y_PROP                             = 'Graph.minY';
    ns.GRAPH_MIN_Y_DESCRIPTION                      = 'Graph Min Y';

    ns.LABEL_X_AXIS                                 = '';
    ns.LABEL_X_AXIS_PROP                            = 'Graph.labelXAxis';
    ns.LABEL_X_AXIS_DESCRIPTION                     = 'Graph Label for X Axis';

    ns.LABEL_Y_AXIS                                 = '';
    ns.LABEL_Y_AXIS_PROP                            = 'Graph.labelYAxis';
    ns.LABEL_Y_AXIS_DESCRIPTION                     = 'Graph Label for Y Axis';

// Number Line

    ns.NUMBER_LINE_RANGE_LOW                        = -10;
    ns.NUMBER_LINE_RANGE_LOW_PROP                   = 'NumberLine.rangeLow';
    ns.NUMBER_LINE_RANGE_LOW_DESCRIPTION            = 'NumberLine Low Range';

    ns.NUMBER_LINE_RANGE_HIGH                       = 10;
    ns.NUMBER_LINE_RANGE_HIGH_PROP                  = 'NumberLine.rangeHigh';
    ns.NUMBER_LINE_RANGE_HIGH_DESCRIPTION           = 'NumberLine High Range';

    ns.NUMBER_LINE_TICK_INTERVAL                    = 1;
    ns.NUMBER_LINE_TICK_INTERVAL_PROP               = 'NumberLine.tickInterval';
    ns.NUMBER_LINE_TICK_INTERVAL_DESCRIPTION        = 'NumberLine Tick Interval';

    ns.NUMBER_LINE_SHOW_DOUBLE                      = false;
    ns.NUMBER_LINE_SHOW_DOUBLE_PROP                 = 'NumberLine.showDouble';
    ns.NUMBER_LINE_SHOW_DOUBLE_DESCRIPTION          = 'Double NumberLine';

// Percent Bar

    ns.PERCENT_BAR_RANGE_LOW                        = 0;
    ns.PERCENT_BAR_RANGE_LOW_PROP                   = 'PercentBar.rangeLow';
    ns.PERCENT_BAR_RANGE_LOW_DESCRIPTION            = 'PercentBar Low Range';

    ns.PERCENT_BAR_RANGE_HIGH                       = 100;
    ns.PERCENT_BAR_RANGE_HIGH_PROP                  = 'PercentBar.rangeHigh';
    ns.PERCENT_BAR_RANGE_HIGH_DESCRIPTION           = 'PercentBar High Range';

    ns.PERCENT_BAR_TICK_INTERVAL                    = 1;
    ns.PERCENT_BAR_TICK_INTERVAL_PROP               = 'PercentBar.tickInterval';
    ns.PERCENT_BAR_TICK_INTERVAL_DESCRIPTION        = 'PercentBar Tick Interval';

    ns.PERCENT_BAR_SHOW_DOUBLE                      = false;
    ns.PERCENT_BAR_SHOW_DOUBLE_PROP                 = 'PercentBar.showDouble';
    ns.PERCENT_BAR_SHOW_DOUBLE_DESCRIPTION          = 'Zoom';

// Number Hunt

    ns.NUMBER_HUNT_RANGE_LOW                        = 0;
    ns.NUMBER_HUNT_RANGE_LOW_PROP                   = 'NumberHunt.rangeLow';
    ns.NUMBER_HUNT_RANGE_LOW_DESCRIPTION            = 'NumberHunt Low Range';

    ns.NUMBER_HUNT_RANGE_HIGH                       = 10;
    ns.NUMBER_HUNT_RANGE_HIGH_PROP                  = 'NumberHunt.rangeHigh';
    ns.NUMBER_HUNT_RANGE_HIGH_DESCRIPTION           = 'NumberHunt High Range';

    ns.NUMBER_HUNT_TICK_INTERVAL                    = 1;
    ns.NUMBER_HUNT_TICK_INTERVAL_PROP               = 'NumberHunt.tickInterval';
    ns.NUMBER_HUNT_TICK_INTERVAL_DESCRIPTION        = 'NumberHunt Tick Interval';

    ns.NUMBER_HUNT_SHOW_DOUBLE                      = false;
    ns.NUMBER_HUNT_SHOW_DOUBLE_PROP                 = 'NumberHunt.showDouble';
    ns.NUMBER_HUNT_SHOW_DOUBLE_DESCRIPTION          = 'Double NumberLine';

// Mic Drop

    ns.MIC_DROP_RANGE_LOW                        = -7;
    ns.MIC_DROP_RANGE_LOW_PROP                   = 'MicDrop.rangeLow';
    ns.MIC_DROP_RANGE_LOW_DESCRIPTION            = 'MicDrop Low Range';

    ns.MIC_DROP_RANGE_HIGH                       = 4;
    ns.MIC_DROP_RANGE_HIGH_PROP                  = 'MicDrop.rangeHigh';
    ns.MIC_DROP_RANGE_HIGH_DESCRIPTION           = 'MicDrop High Range';

    ns.MIC_DROP_TICK_INTERVAL                    = 1;
    ns.MIC_DROP_TICK_INTERVAL_PROP               = 'MicDrop.tickInterval';
    ns.MIC_DROP_TICK_INTERVAL_DESCRIPTION        = 'MicDrop Tick Interval';

    ns.MIC_DROP_SHOW_DOUBLE                      = false;
    ns.MIC_DROP_SHOW_DOUBLE_PROP                 = 'MicDrop.showDouble';
    ns.MIC_DROP_SHOW_DOUBLE_DESCRIPTION          = 'Double NumberLine';

// Contingency Table

    ns.CONTINGENCY_TABLE_NUM_COLUMNS                = 3;
    ns.CONTINGENCY_TABLE_NUM_COLUMNS_PROP           = 'ContingencyTable.numberOfColumns';
    ns.CONTINGENCY_TABLE_NUM_COLUMNS_DESCRIPTION    = 'Contingency Table Number of Columns';

    ns.CONTINGENCY_TABLE_NUM_ROWS                   = 3;
    ns.CONTINGENCY_TABLE_NUM_ROWS_PROP              = 'ContingencyTable.numberOfRows';
    ns.CONTINGENCY_TABLE_NUM_ROWS_DESCRIPTION       = 'Contingency Table Number of Rows';


// Poll

    ns.QUESTION_1                                   = 'Which do you prefer?';
    ns.QUESTION_1_PROP                              = 'Poll.Question1';
    ns.QUESTION_1_DESCRIPTION                       = 'Poll Question 1';

    ns.QUESTION_1_ANSWER_1                          = 'Video A';
    ns.QUESTION_1_ANSWER_1_PROP                     = 'Poll.Question1Answer1';
    ns.QUESTION_1_ANSWER_1_DESCRIPTION              = 'Poll Answer 1';

    ns.QUESTION_1_ANSWER_2                          = 'Video B';
    ns.QUESTION_1_ANSWER_2_PROP                     = 'Poll.Question1Answer2';
    ns.QUESTION_1_ANSWER_2_DESCRIPTION              = 'Poll Answer 2';

    ns.QUESTION_2                                   = 'Are you...';
    ns.QUESTION_2_PROP                              = 'Poll.Question2';
    ns.QUESTION_2_DESCRIPTION                       = 'Poll Question 2';

    ns.QUESTION_2_ANSWER_1                          = 'Female';
    ns.QUESTION_2_ANSWER_1_PROP                     = 'Poll.Question2Answer1';
    ns.QUESTION_2_ANSWER_1_DESCRIPTION              = 'Poll Answer 1';

    ns.QUESTION_2_ANSWER_2                          = 'Male';
    ns.QUESTION_2_ANSWER_2_PROP                     = 'Poll.Question2Answer2';
    ns.QUESTION_2_ANSWER_2_DESCRIPTION              = 'Poll Answer 2';

// Results Table


})(window.mt.common);

(function (ns) {
    'use strict';

    ns.DaisyChain = (function () {

        var opFuncs = {
            '*': function(a, b) {
                return a * b;
            },
            '/': function(a, b) {
                return a / b;
            },
            '+': function(a, b) {
                return a + b;
            },
            '-': function(a, b) {
                return a - b;
            }
        };

        function DaisyChain(expression) {
            if (!(this instanceof DaisyChain)) {
                return new DaisyChain(expression);
            }

            this.expression = expression;
            this.operations = parseExpression(expression);
        }

        function parseExpression(expression) {
            if (!expression) {
                return [];
            }

            var opNumRe = /([\*x\/\+-])(\d+)/g,
                opStringMatched = '',
                operations = [],
                m;

            while ((m = opNumRe.exec(expression))) {
                var operation = {
                    operator: m[1],
                    number: parseInt(m[2], 10)
                };
                if (operation.operator === 'x') {
                    operation.operator = '*';
                }
                operations.push(operation);
                opStringMatched += m[0];
            }

            if (opStringMatched !== expression) {
                return [];
            }

            return operations;
        }

        //restrictOperations: bool - if true, a valid daisy chain equation
        //must contain mult/div or add/sub operations, the two groups are
        //mutually exclusive
        DaisyChain.prototype.isValid = function(restrictOperations) {
            var valid = Array.isArray(this.operations) && this.operations.length > 0;
            if(!valid) {
                return valid;
            }

            if (restrictOperations) {
                var validOps = {
                    'x': 'x*/',
                    '*': 'x*/',
                    '/': 'x*/',
                    '+': '+-',
                    '-': '+-'
                };

                var firstOp = this.operations[0].operator;
                _.each(this.operations, function(op) {
                    valid = valid && (validOps[firstOp].indexOf(op.operator) !== -1);
                });
            }

            return valid;
        };

        DaisyChain.prototype.evaluate = function(baseNumber) {
            if(!this.isValid()) {
                return undefined;
            }

            var result = baseNumber;

            _.each(this.operations, function(op) {
                var func = opFuncs[op.operator];
                if (func) {
                    result = func(result, op.number);
                }
            });

            return result;
        };

        DaisyChain.prototype.consistentWith = function(other) {
            if (!this.isValid() || !other.isValid() || this.operations.length !== other.operations.length) {
                return false;
            }

            for (var i = 0; i < this.operations.length; ++i) {
                if (this.operations[i].operator !== other.operations[i].operator || this.operations[i].number !== other.operations[i].number) {
                    return false;
                }
            }

            return true;
        };

        return DaisyChain;
    })();
})(window.mt.common);

(function (ns, ng) {
    'use strict';

    angular.module('mt.common').directive('mtImage', function () {
        var URL = window.url || window.webkitURL;
        return {
            name: 'mtImage',
            scope: {},
            controller: function ($scope, $element, $attrs, $transclude) {
                $scope.showFile = true;
            },
            // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
            restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
            template: '<div class="mt-image-tool"><input type="file" accept="image/*" ng-show="showFile"><img src="{{imgsrc}}" style="max-height: 500px; max-width: 500px;"/></div>',
            replace: true,
            link: function ($scope, iElm, iAttrs, controller) {
                var inpt = iElm.find('input');
                var img = iElm.find('img');
                inpt.on('change', function () {
                    //turn the file into a URL. this URL is not consistent across reloads
                    var imgUrl = URL.createObjectURL(this.files[0]);
                    //set img src. binding through angular will not work
                    img.attr('src', imgUrl);
                    //clean up the URL
                    URL.revokeObjectURL(imgUrl);

                    //hide the file selector
                    $scope.$apply(function () {
                        $scope.showFile = false;
                    });
                });
            }
        };
    });

})(window.mt.common, angular);

(function (ns) {
    'use strict';

    var iOS = /(iPad|iPhone|iPod)/g.test( navigator.userAgent );
    function preventLoupe(e) {
        var tagName = e.srcElement.tagName;
        if(tagName === 'INPUT' || tagName === 'TEXTAREA') {
            return;
        }
        if((e.target ? e.target : e.srcElement) === document.activeElement) {
            e.preventDefault();
        }
    }
    function fixScreenTop() {
        if (!iOS) {
            return;
        }
        $('html,body').css({'overflow':''});
        $(window).scrollTop(0);
        $('html,body').removeAttr('style');
    }
    document.addEventListener('touchstart', function(e) {
        preventLoupe(e);
    }, true);
    document.addEventListener('touchend', function(e) {
        preventLoupe(e);
    }, true);
    document.addEventListener('doubletap', function(e) {
        preventLoupe(e);
        if (!document.activeElement.select) {
            return;
        }
        document.activeElement.select();
        document.activeElement.focus();
        document.activeElement.selectionStart = 0;
        document.activeElement.selectionEnd = document.activeElement.value.length;
    }, true);
    document.addEventListener('focusout', function(e){
        fixScreenTop();
    });
    document.addEventListener('focus', function(e) {
        $('body,html').css({'overflow':'hidden'});
        var element = (e.target ? e.target : e.srcElement);
        if (element !== undefined && element.value !== undefined) {
            setTimeout(function() {
                if (element.createTextRange) {
                    var r = element.createTextRange();
                    r.collapse(true);
                    r.moveEnd('character', element.value.length);
                    r.moveStart('character', element.value.length);
                    r.select();
                }
                else {
                    if (element.tagName !== 'INPUT' || element.type === 'text') {
                        element.selectionStart = element.selectionEnd = element.value.length;
                    }
                }
            }, 0);
        }
    }, true);

})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('activeToolService', function () {

        var activeToolId;


        var callbacks = [];
        this.registerCallback = function(callback) {
            if(angular.isFunction(callback)) {
                callbacks.push(callback);
            } else {
                console.error('Error registering activeToolService callback: not a function.');
            }
        };

        this.setActiveTool = function (toolId) {
            activeToolId = toolId;
            _.each(callbacks, function(fn) {
                fn(activeToolId);
            });
        };

        this.getActiveId = function() {
            return activeToolId;
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    //service for controlling the annotation directives
    angular.module('mt.common').service('annotationService', function (MtRibbonItemService, ribbonMenuAnimationService, undoService, workspacePageService) {
        var self = this;

        this.PEN_MODE = 'penMode';
        this.ERASER_MODE = 'eraserMode';
        this.HIGHLIGHT_MODE = 'highlightMode';
        this.TEXT_MODE = 'textMode';

        this.colors = ['#272727', '#d32515', '#4eba4a', '#a100f6'];
        this.penSizes = [2, 10, 16, 22, 34];

        var annotationMode = this.PEN_MODE;
        this.setMode = function(mode) {
            annotationMode = mode;
            if(mode !== this.PEN_MODE) {
                this.togglePenMenu(false);
            }
        };

        this.getMode = function() {
            return annotationMode;
        };

        var penMenuOpen = false;
        this.isPenMenuOpen = function () {
            return penMenuOpen;
        };

        this.togglePenMenu = function (activate) {
            if(activate !== undefined) {
                penMenuOpen = activate;
            } else {
                penMenuOpen = !penMenuOpen;
            }

            if(penMenuOpen === true) {
                this.setMode(this.PEN_MODE);
            }
        };

        var active = false;
        this.isActive = function () {
            return active;
        };

        this.toggleActive = function (activate) {
            if(activate === undefined) {
                activate = !active;
            }
            active = activate;
            if(active === false) {
                this.togglePenMenu(false);
                ribbonMenuAnimationService.slideUp('div.mt-ribbon-menu-tool-list');
            }
        };

        var size = this.penSizes[0];
        this.getPenSize = function () {
            return size;
        };
        this.setPenSize = function (newSize) {
            size = newSize;
        };

        var color = this.colors[0];
        this.getPenColor = function () {
            return color;
        };
        this.setPenColor = function (newColor) {
            color = newColor;
        };

        var clearFn = angular.noop;
        this.registerClearFunction = function (callback) {
            clearFn = callback;
        };

        this.clearPenSurface = function(noAlert) {
            if(noAlert !== true) {
                undoService.save('All your annotations were cleared from this workbook page');
            }
            clearFn();
            self.toggleActive(false);
        };

        workspacePageService.registerClearFn(function() {
            self.clearPenSurface(true);
        });

        this.getRibbon = function() {
            var ribbon = {};
            ribbon.items = {};
            ribbon.items.left = [
                MtRibbonItemService.newItem.button('Clear', function() {self.clearPenSurface();}, {cssClass: 'mt-ribbon-annotation-clear'})
            ];
            ribbon.items.center = [
                MtRibbonItemService.newItem.custom('Pen', '<mt-pen-ribbon-button></mt-pen-ribbon-button>'),
                MtRibbonItemService.newItem.toggle('Eraser',
                    function(isOn) {
                        var mode = isOn? self.ERASER_MODE: undefined;
                        self.setMode(mode);
                    }, {cssClass: 'mt-ribbon-image-annotation-erase'}, function() {
                        return self.getMode() === self.ERASER_MODE;
                    })
            ];
            ribbon.items.right = [
                MtRibbonItemService.newItem.button('Done', function() {self.toggleActive(false);}, {}),
            ];

            return ribbon;
        };

    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('broadcastService', function (realtimeService, roleService) {

        return {
            broadcastTool: function (packageCallback, config) {
                var data = packageCallback();
                var event = new mt.common.Event(data);
                event = _.extend(event, config);

                var target = event.target ? event.target : mt.common.STUDENT_ROLE;
                var packet = realtimeService.Packet(target, undefined, undefined, event);
                realtimeService.sendTool(packet);

                return data;
            },

            getTarget: function() {
                return mt.common.TEACHER_ROLE === roleService.getRole() ? mt.common.STUDENT_ROLE : mt.common.TEACHER_ROLE;
            }
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').factory('containerApiFactory', function (modalAlertService, roleService, environmentService, undoService) {
        return {
            createApi: function(toolId, spaceId, options, disabledCallbacks) {
                var api = {
                    toolId: toolId,
                    name: {value: ''},
                    spaceId: spaceId,
                    locking: false,
                    submittable: false,
                    precision: {value: 2},
                    isHidden: (options.isHidden === undefined) ? false: options.isHidden,
                    canName: true,
                    //isActive: false,
                    menuItems: []
                };

                function capitalizeFirstLetter(str) {
                    return str.charAt(0).toUpperCase() + str.slice(1);
                }

                var callbackNames = mt.common.PALETTE_MENU_CALLBACK_NAMES;
                var callbacks = {};

                disabledCallbacks = (disabledCallbacks === undefined)? []: disabledCallbacks;
                //disable sends to any spaces that don't exist
                if(environmentService.isSpaceRegistered(mt.common.DEFAULT_SPACE_ID) === false) {
                    disabledCallbacks.push('sendToWorkspace');
                }

                function isDisbaled(callbackName) {
                    return disabledCallbacks !== undefined && disabledCallbacks.indexOf(callbackName) !== -1;
                }

                //register api fns (callout, register and isSet fns)
                _.each(callbackNames, function(name) {
                    var namePostfix = capitalizeFirstLetter(name);
                    callbacks[name] = angular.noop;

                    api[name] = function(args) {
                        return callbacks[name].apply(this, arguments);
                    };

                    if(isDisbaled(name) !== true) {
                        api['register' + namePostfix] = function(fn) {
                            callbacks[name] = fn;
                        };
                    } else {
                        api['register' + namePostfix] = angular.noop;
                    }


                    api['can' + namePostfix] = function() {
                        return callbacks[name] !== undefined && callbacks[name] !== angular.noop;
                    };
                });

                //override register callback
                api.registerExportData = function (callback, exportTargets) {
                    if(isDisbaled('exportData') !== true) {
                        callbacks.exportData = callback;
                        api.exportTargets = exportTargets;
                    }
                };


                //callouts that wrap the registered callback - override the straight callouts
                api.broadcast = function() {
                    callbacks.broadcast();
                    var targetRole = roleService.getBroadcastTarget();
                    if (targetRole === mt.common.STUDENT_ROLE) {
                        targetRole += 's';
                    }
                    modalAlertService.showModalAlert('Sent to ' + targetRole);
                };

                return api;
            }
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    //service to facilitate basic import/export across tools

    //common data model: {type: "", id: "", headers: [""], rows: [[""]]}
    angular.module('mt.common').service('dataExchangeService', function ($timeout, eventingService, preconfiguredToolService) {

        this.registerTool = function(id, toolType, exportFn, importFn, containerApi, exportTargets) {
            function onExportRequest() {
                var saveEvent = new ns.Event(exportFn());
                saveEvent.id = id;
                saveEvent.type = toolType;
                eventingService.publish(ns.TOOL_EXPORT_RESPONSE_TOPIC, saveEvent);
            }

            function onImportRequest(event) {
                if(event.id === id) {
                    importFn(event.data, event.updateType);
                }
            }

            //subscribe to onExportRequest and onImportRequest
            eventingService.subscribe(id, ns.TOOL_EXPORT_REQUEST_TOPIC, onExportRequest);
            eventingService.subscribe(id, ns.TOOL_IMPORT_TOPIC, onImportRequest);

            //register with export UI through the containerAPI
            if(containerApi !== undefined) {
                containerApi.registerExportData(exportFn, exportTargets);
            }
        };

        //subscribe to export response to collect export data
        var toolExportData = [];
        eventingService.subscribe('dataExchangeService', ns.TOOL_EXPORT_RESPONSE_TOPIC, function(event) {
            toolExportData.push({id:event.id, type: event.type, data: event.data});
        });

        this.exportAll = function() {
            toolExportData = [];

            //push out an export request - should syncronously grap the data
            eventingService.publish(ns.TOOL_EXPORT_REQUEST_TOPIC, new mt.common.Event({}));

            //return a copy of the data structure
            return toolExportData;
        };

        var self = this;
        this.importAll = function(toolData) {
            _.each(toolData, function(tool) {
                self.exportToNewTool(tool.type, tool.id, tool.data);
            });
        };

        this.exportToNewTool = function (type, id, data) {
            var toolId = preconfiguredToolService.addTool(type, ns.DEFAULT_SPACE_ID, id);

            // ensure tool has been created and then publish export data
            $timeout(function () {
                self.exportToExistingTool(toolId, data);
            });
        };

        //update type is optional - up to the target importFn how it is treated; default is override.
        this.exportToExistingTool = function(id, data, updateType) {
            var event = new mt.common.Event(data);
            event.id = id;
            event.updateType = updateType;

            eventingService.publish(mt.common.TOOL_IMPORT_TOPIC, event);
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('deselectorService', function () {
        var callback,
            selector;

        return {
            setCallback: function (exceptSelector, fn) {
                callback = fn;
                selector = exceptSelector;
            },

            attemptCallback: function (event) {
                var retVal = false;
                if (callback && !$(event.target).closest(selector).length) {
                    retVal = callback(event);
                    callback = undefined;
                }
                return retVal;
            }
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('environmentService', function () {
        var spaceApiRegistry = {};

        return {
            createSpaceApi: function (id) {
                spaceApiRegistry[id] = new mt.common.SpaceApi(id);
                return spaceApiRegistry[id];
            },
            getSpaceApi: function (id) {
                if (!id) {
                    throw new Error('Unable to set up a space api without an id');
                }
                return spaceApiRegistry[id];
            },
            isSpaceRegistered: function (id) {
                return spaceApiRegistry[id] !== undefined;
            }
        };
    });

})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('eventingService', function () {

        this.topics = {};
        /***
         * Adds a topic to be managed.
         * @method addTopic
         * @param topicName {String} Name of topic to be added.
         */
        this.addTopic = function (topicName) {
            var topic = this.topics[topicName];
            if (topic === undefined) {
                topic = new ns.Topic(topicName);
                this.topics[topicName] = topic;
            }
        };

        /***
         * Lists topics currently being managed.
         * @method listTopics
         * @return list {Topic} List of topics.
         */
        this.listTopics = function () {
            var list = [];
            for (var topicKey in this.topics) {
                var topic = this.topics[topicKey];
                var topicCopy = jQuery.extend({}, topic);
                list.push(topicCopy);
            }
            return list;
        };

        /***
         * Get a topic.
         * @method getTopic
         * @param topicName {String} Name of topic to be returned.
         * @return topic {Topic} Topic to be returned.
         */
        this.getTopic = function (topicName) {
            if (this.topics[topicName] === undefined) {
                this.addTopic(topicName); // allow for lazy loading
            }
            return this.topics[topicName];
        };


        this.publish = function(topicName, event) {
            var topic = this.getTopic(topicName);
            if (!topic) {
                console.log('Warning: published to unknown topic: ' + topicName);
            }
            else {
                topic.publish(event);
            }
        };

        this.publishToSubscriber = function(topicName, event, subscriberId) {
            var topic = this.getTopic(topicName);
            if (!topic) {
                console.log('Warning: published to unknown topic: ' + topicName);
            }
            else {
                topic.publishToSubscriber(event, null, subscriberId);
            }
        };


        /***
         * Removes a topic from being managed.
         * @method removeTopic
         * @param topicName {String} Name of topic to be removed.
         */
        this.removeTopic = function (topicName) {
            delete this.topics[topicName];
        };


        /***
         * Adds a topic event handler to be called when the event is fired.
         * <p>Event handler will receive one argument - an <code>Event</code>
         * object the event was fired with.<p>
         * @method subscribe
         * @param subscriberName {String} Subscriber Name.
         * @param topicName {String} Topic Name.
         * @param fn {Function} Event handler.
         */
        this.subscribe = function (subscriberName, topicName, fn) {
            this.getTopic(topicName).subscribe(subscriberName, fn);
        };

        this.removeSubscriber = function (subscriberName) {
            for(var topicName in this.topics) {
                var topic = this.topics[topicName];
                topic.unsubscribe(subscriberName);
            }
        };

        this.removeAllSubscribers = function () {
            for(var topicName in this.topics) {
                var topic = this.topics[topicName];
                topic.subscribers = {};
            }
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('globalMenuService', function () {

        var links = [];

        return {

            getLinks: function () {
                return links;
            },

            addLink: function (link) {
                var existing = _(links).findWhere({displayText: link.displayText});
                if (!existing) {
                    links.push(link);
                }
            }
        };
    });
})(window.mt.common);
(function (ns) {
    'use strict';

    angular.module('mt.common').service('handWritingManagerService', function () {

        function performReplacements(str) {
            return str.replace(/\\cdot/g,'.').replace(/ /g,'');
        }

        function recognizeWebService(strokes, resultHandler, mode) {
            console.log('web service recognition', mode);

            var data = getWebServiceData(strokes, mode);
            var url = ns.MY_SCRIPT_EQN_URL;
            if(mode === ns.HW_MODE_TEXT) {
                url = ns.MY_SCRIPT_TEXT_URL;
            }

            var result;
            $.post(url, data, function (jsonResult) {
                if(mode === ns.HW_MODE_TEXT) {
                    result = jsonResult.result.textSegmentResult.candidates[0].label;
                } else {
                    result = jsonResult.result.results[0].value;
                    //do any global replacements
                    result = performReplacements(result);
                }
                resultHandler(result);
            }, 'json')
                .error(function(XMLHttpRequest, textStatus) {
                    console.log('handwriting error: ' + XMLHttpRequest.responseText);
                });
        }

        function getWebServiceData(strokes, mode) {
            var data = {apiKey: mt.common.MY_SCRIPT_KEY};
            var json;
            if(mode === mt.common.HW_MODE_TEXT) {
                json =  {
                    hwrParameter:{
                        language: 'en_US'
                    },
                    inputUnits: [{components: strokes}]
                };
                data.hwrInput = JSON.stringify(json);
            } else {
                json =  {
                    components : strokes,
                    resultTypes : ['LATEX'],
                    userResources:['mtGeneral']
                };
                if (mode === mt.common.HW_MODE_EQN_EXPRESSION_LIST) {
                    json.userResources = ['mtExpressionList'];
                } else if (mode === mt.common.HW_MODE_EQN_EXPRESSION_LIST_EQN) {
                    json.userResources = ['mtExpressionListEquation'];
                }
                data.equationInput = JSON.stringify(json);
            }
            return data;
        }

        return {
            recognize: function(strokes, resultHandler, mode) {
                recognizeWebService(strokes, resultHandler, mode);
            }
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('handwritingService', function () {

        var panelVisible = false;
        var callbackFn;
        var closeCallbackFn;
        var model = {};

        return {
            useHandwriting: function () {
                return ns.EDIT_MODE === ns.EDIT_MODE_HWR;
            },
            openPanelForElement: function (element, strokes, recognizerMode, updateCallback, closeCallback) {
                if (!this.useHandwriting()) {
                    return;
                }

                panelVisible = true;

                model = {
                    element: element,
                    strokes: strokes,
                    recognizerMode: recognizerMode,
                    updateCallback: updateCallback,
                };

                if (angular.isFunction(callbackFn)) {
                    callbackFn(model);
                }

                closeCallbackFn = closeCallback || angular.noop;
            },
            setHandler: function (fn) {
                callbackFn = fn;
            },
            isPanelVisible: function () {
                return panelVisible;
            },
            setPanelVisible: function (visible) {
                panelVisible = visible;
                if (!panelVisible) {
                    if (angular.isFunction(closeCallbackFn)) {
                        closeCallbackFn();
                    }

                    model = {};
                    closeCallbackFn = undefined;
                }
            },
            getActiveModel: function () {
                return model;
            }
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('itemValidationService', function () {

        var validators = {};

        //simple matching to a single or array of answer keys
        validators[ns.VALIDATOR_MATCH] = function(inputs, answers) {
            var result;
            if(angular.isArray(answers)) {
                result = answers.indexOf(inputs[0]) !== -1;
            } else {
                result = inputs[0] === answers;
            }
            return result;
        };

        //validate that a pair of inputs have the correct ratio are lhs, rhs of ratio
        validators[ns.VALIDATOR_RATIO] = function(inputs, answers) {
            var lhs = parseFloat(inputs[0]);
            var rhs = parseFloat(inputs[1]);
            var ansLhs = parseFloat(answers[0]);
            var ansRhs = parseFloat(answers[1]);

            if(isNaN(lhs) || isNaN(rhs) || isNaN(ansLhs) || isNaN(ansRhs)) {
                return false;
            }

            return Math.abs(lhs/rhs - ansLhs/ansRhs) < ns.DEFAULT_EPS;
        };

        //validate that an input is in the correct range
        validators[ns.VALIDATOR_RANGE] = function(inputs, answers) {
            var val = parseFloat(inputs[0]);

            var min = parseFloat(answers[0]);
            var max = parseFloat(answers[1]);

            if(isNaN(val) || isNaN(min) || isNaN(max)) {
                return false;
            }

            return val >= min && val <= max;
        };

        validators[ns.VALIDATOR_UNIQUENESS] = function(inputs) {
            var prevInputs = [];
            var isCorrect = true;
            _(inputs).each(function (input) {
                if(input === ''){
                    return;
                }
                if(prevInputs.indexOf(input) !== -1) {
                    isCorrect = false;
                    return;
                }
                prevInputs.push(input);
            });
            return isCorrect;
        };

        this.validate = function(inputForm, validatorConfigs) {
            var result = {
                correct: true,
                feedback: [],
                correctInputs: [],
                incorrectInputs: []
            };
            _(validatorConfigs).each(function (validatorConfig) {
                var inputs = [];
                if(angular.isArray(validatorConfig.fields)) {
                    _(validatorConfig.fields).each(function (curField) {
                        inputs.push(inputForm[curField]);
                    });
                } else {
                    inputs.push(inputForm[validatorConfig.fields]);
                }

                var validator = validators[validatorConfig.type];
                var isCorrect;
                if(validator === undefined) {
                    isCorrect = false;
                    console.log('Error for validator ', validator);
                } else {
                    isCorrect = validator(inputs, validatorConfig.answers);
                    if(validatorConfig.invert === true) {
                        isCorrect = !isCorrect;
                    }
                    if(isCorrect === false) {
                        result.correct = false;
                        if(result.feedback.indexOf(validatorConfig.feedback) === -1) {
                            result.feedback.push(validatorConfig.feedback);
                        }
                    }
                }

                var fields = angular.isArray( validatorConfig.fields)?  validatorConfig.fields: [validatorConfig.fields];
                if(validatorConfig.associatedFields !== undefined) {
                    var associatedFields = angular.isArray( validatorConfig.associatedFields)?  validatorConfig.associatedFields: [validatorConfig.associatedFields];
                    fields = fields.concat(associatedFields);
                }

                _(fields).each(function(field) {
                    if(isCorrect === true) {
                        //if the fields aren't in correctInputs or incorrectInputs add to correct
                        if(result.correctInputs.indexOf(field) === -1 && result.incorrectInputs.indexOf(field) === -1){
                            result.correctInputs.push(field);
                        }
                    } else {
                        if(result.incorrectInputs.indexOf(field) === -1){
                            result.incorrectInputs.push(field);
                        }
                        var correctIndex = result.correctInputs.indexOf(field);
                        if (correctIndex !== -1) {
                            result.correctInputs.splice(correctIndex, 1);
                        }
                    }
                });

            });
            return result;
        };

        /*********
        * IGE Specific code - might want to refactor into a different place.
        **********/

        function isRowEquivalent(leftSeed, rightSeed, leftAction, rightAction) {
            if (undefined === leftAction || undefined === rightAction) {
                return false;
            }
            return ratiosEqual(leftSeed, rightSeed, leftAction.result, rightAction.result);
        }

        function isMultiplicationSymbol(input) {
            return '*' === input || 'x' === input;
        }

        function allMultOrDiv(operations) {
            if (!operations instanceof Array) {
                return false;
            }

            var op;
            for(var i = 0; i < operations.length; i++) {
                op = operations[i].operator;
                if (!(op === '/' ||
                    isMultiplicationSymbol(op))) {
                    return false;
                }
            }
            return true;
        }

        function allAddOrSubtract(operations) {
            if (!operations instanceof Array) {
                return false;
            }

            var op;
            for(var i = 0; i < operations.length; i++) {
                op = operations[i].operator;
                if (!(op === '-' || op === '+')) {
                    return false;
                }
            }
            return true;
        }

        function getColumnAction(rowActions, columnIndex) {
            for (var i = rowActions.length - 1; 0 <= i; --i) {
                if (columnIndex === rowActions[i].columnIndex) {
                    return rowActions[i];
                }
            }
        }

        function isRowStrategyConsistent(left, right) {
            if (undefined === left || undefined === right) {
                return false;
            }
            //if only one side has an operation, it's inherently consistent
            if (undefined === left.operations) {
                return undefined !== right.operations;
            }

            if (undefined === right.operations) {
                return undefined !== left.operations;
            }

            return areSidesConsistent(left, right);
        }

        //requires left and right to be side operator operations, not manual entry
        function areSidesConsistent(left, right) {
            console.log(left);
            console.log(left.operations);
            return left.sourceRow === right.sourceRow &&
                left.operations.consistentWith(right.operations);
        }

        function isWhole(value) {
            return mt.common.approxEquals(Math.round(value), value);
        }

        function isPrime(value) {
            return isWhole(value) && //whole
                0 < value && //greater than 0
                (mt.common.approxEquals(1, value) || //1 (honorary prime)
                 1 === mt.common.primeFactorization(value).length); //actual prime
        }

        //inputs: ratio left seed, ratio right seed
        validators[ns.VALIDATOR_IGE_RATIOTABLE_BASE_RATIO_QUAL] = function(qualitativeActions, inputs) {
            var leftSeed = inputs[0];
            var rightSeed = inputs[1];
            var gcf = mt.common.gcf(leftSeed, rightSeed);

            //Row 1 is the seed row.
            for(var i = 2; ; ++i) {
                var rowActions = qualitativeActions.getActions(i);
                if (undefined === rowActions) {
                    break;
                }
                var left = getColumnAction(rowActions, 0);
                var right = getColumnAction(rowActions, 1);
                if (isRowEquivalent(leftSeed, rightSeed, left, right) &&
                    mt.common.approxEquals(left.result, leftSeed / gcf) && mt.common.approxEquals(right.result, rightSeed / gcf))
                {
                    return 'Base Ratio';
                }
            }
            return undefined;
        };

        //inputs: ratio left seed, ratio right seed
        validators[ns.VALIDATOR_IGE_RATIOTABLE_BASE_RATIO_GCF] = function(qualitativeActions, inputs) {
            var leftSeed = inputs[0];
            var rightSeed = inputs[1];
            var gcf = mt.common.gcf(leftSeed, rightSeed);

            //Row 1 is the seed row.
            for(var i = 2; ; ++i) {
                var rowActions = qualitativeActions.getActions(i);
                if (undefined === rowActions) {
                    break;
                }
                var left = getColumnAction(rowActions, 0);
                var right = getColumnAction(rowActions, 1);
                if (isRowEquivalent(leftSeed, rightSeed, left, right) && //row is equivalent, both sides are defined
                    mt.common.approxEquals(left.result, leftSeed / gcf) && mt.common.approxEquals(right.result, rightSeed / gcf) && //is base ratio
                    isRowStrategyConsistent(left, right) && //strategy is consistent, at least one operation is defined
                    (undefined === left.sourceRow || 1 === left.sourceRow) && (undefined === right.sourceRow || 1 === right.sourceRow) && //the source row is the seed
                    (undefined === left.operations || allMultOrDiv(left.operations.operations)) && (undefined === right.operations || allMultOrDiv(right.operations.operations))) //not a +- strategy
                {
                    return 'Base Ratio, by GCF, with proof';
                }
            }
            return undefined;
        };

        //inputs: ratio left seed, ratio right seed
        validators[ns.VALIDATOR_IGE_RATIOTABLE_BASE_RATIO_FIRST] = function(qualitativeActions, inputs) {
            var leftSeed = inputs[0];
            var rightSeed = inputs[1];
            var gcf = mt.common.gcf(leftSeed, rightSeed);

            //Row 1 is the seed row.
            var rowActions = qualitativeActions.getActions(2);
            if (undefined !== rowActions) {
                var left = getColumnAction(rowActions, 0);
                var right = getColumnAction(rowActions, 1);
                if (isRowEquivalent(leftSeed, rightSeed, left, right) &&
                    undefined === left.operations && undefined === right.operations &&
                    mt.common.approxEquals(left.result, leftSeed / gcf) && mt.common.approxEquals(right.result, rightSeed / gcf))
                {
                    return 'Base Ratio, by GCF, without proof';
                }
            }
            return undefined;
        };

        //inputs: ratio left seed, ratio right seed
        validators[ns.VALIDATOR_IGE_RATIOTABLE_UNIT_RATIO_COUNT] = function(qualitativeActions, inputs) {
            var leftSeed = inputs[0];
            var rightSeed = inputs[1];
            var leftTarget = leftSeed / rightSeed;
            var rightTarget = rightSeed / leftSeed;
            var foundLeft = false;
            var foundRight = false;

            //Row 1 is the seed row.
            for(var i = 2; !foundLeft || !foundRight; ++i) {
                var rowActions = qualitativeActions.getActions(i);
                if (undefined === rowActions) {
                    break;
                }
                var left = getColumnAction(rowActions, 0);
                var right = getColumnAction(rowActions, 1);
                if (isRowEquivalent(leftSeed, rightSeed, left, right)) {
                    if (mt.common.approxEquals(1, left.result) && mt.common.approxEquals(rightTarget, right.result)) {
                        foundLeft = true;
                    } else if (mt.common.approxEquals(leftTarget, left.result) && mt.common.approxEquals(1, right.result)) {
                        foundRight = true;
                    }
                }
            }

            if (foundLeft && foundRight) {
                return '2 Unit Ratios';
            }
            if (!foundLeft && !foundRight) {
                return undefined;
            }
            return 'Unit Ratio';
        };

        //inputs: ratio left seed, ratio right seed
        validators[ns.VALIDATOR_IGE_RATIOTABLE_UNIT_RATIO_GENERALIZATION] = function(qualitativeActions, inputs) {
            var leftSeed = inputs[0];
            var rightSeed = inputs[1];
            var leftTarget = leftSeed / rightSeed;
            var rightTarget = rightSeed / leftSeed;
            var foundLeft = false;
            var foundRight = false;

            //Row 1 is the seed row.
            for(var i = 2; !foundLeft || !foundRight; ++i) {
                var rowActions = qualitativeActions.getActions(i);
                if (undefined === rowActions) {
                    break;
                }
                var left = getColumnAction(rowActions, 0);
                var right = getColumnAction(rowActions, 1);
                if (isRowEquivalent(leftSeed, rightSeed, left, right) && //row is equivalent, both sides are defined
                    isRowStrategyConsistent(left, right) && //strategy is consistent, at least one operation is defined
                    (undefined === left.sourceRow || 1 === left.sourceRow) && (undefined === right.sourceRow || 1 === right.sourceRow) && //the source row is the seed
                    (undefined === left.operations || allMultOrDiv(left.operations.operations)) && (undefined === right.operations || allMultOrDiv(right.operations.operations))) //not a +- strategy
                {
                    if (mt.common.approxEquals(left.result, 1) && mt.common.approxEquals(right.result, rightTarget)) {
                        foundLeft = true;
                    } else if (mt.common.approxEquals(leftTarget, left.result) && mt.common.approxEquals(1, right.result)) {
                        foundRight = true;
                    }
                }
            }
            if (foundLeft && foundRight) {
                return '2 Unit ratio generalizations, with proof';
            }
            if (!foundLeft && !foundRight) {
                return undefined;
            }
            return 'Unit ratio generalization, with proof';
        };

        //inputs: ratio left seed, ratio right seed
        validators[ns.VALIDATOR_IGE_RATIOTABLE_UNIT_RATIO_FIRST] = function(qualitativeActions, inputs) {
            var leftSeed = inputs[0];
            var rightSeed = inputs[1];
            var leftTarget = leftSeed / rightSeed;
            var rightTarget = rightSeed / leftSeed;

            //Row 1 is the seed row.
            var rowActions = qualitativeActions.getActions(2);
            if (undefined !== rowActions) {
                var left = getColumnAction(rowActions, 0);
                var right = getColumnAction(rowActions, 1);
                if (isRowEquivalent(leftSeed, rightSeed, left, right) &&
                    undefined === left.operations && undefined === right.operations)
                {
                    if ((mt.common.approxEquals(1, left.result) && mt.common.approxEquals(rightTarget, right.result)) ||
                        (mt.common.approxEquals(leftTarget, left.result) && mt.common.approxEquals(1, right.result)))
                    {
                        return 'Unit ratio generalization, without proof';
                    }
                }
            }

            return undefined;
        };

        //inputs: isLeftColumn (boolean)
        validators[ns.VALIDATOR_IGE_RATIOTABLE_UNIT_RATIO_INCOMPLETE] = function(qualitativeActions, inputs) {
            var isLeft = inputs[0];

            //Row 1 is the seed row.
            for(var i = 2; ; ++i) {
                var rowActions = qualitativeActions.getActions(i);
                if (undefined === rowActions) {
                    break;
                }

                var left = getColumnAction(rowActions, 0);
                var right = getColumnAction(rowActions, 1);
                if ((isLeft && undefined === right && mt.common.approxEquals(1, left.result)) ||
                    (!isLeft && undefined === left && mt.common.approxEquals(1, right.result)))
                {
                    return 'Incomplete - 1 in appropriate column';
                }
            }

            return undefined;
        };

        //inputs: ratio left seed, ratio right seed
        validators[ns.VALIDATOR_IGE_RATIOTABLE_CATEGORIZATION] = function(qualitativeActions, inputs) {
            var leftSeed = inputs[0];
            var rightSeed = inputs[1];
            var leftValues = [undefined, leftSeed];
            var rightValues = [undefined, rightSeed];

            var isCorrect, isConsistentStrategy, isIncomplete, noProof, allMultDiv, sourceRow, leftSource, isSmaller, factor, factors, is2;

            var smaller2Proof = 0;
            var smaller2 = 0;
            var smallerNot2Proof = 0;
            var smallerNot2 = 0;
            var larger2Proof = 0;
            var larger2 = 0;
            var largerNot2Proof = 0;
            var largerNot2 = 0;
            var buildUpProof = 0;
            var smaller = 0;
            var larger = 0;
            var additiveProof = 0;
            var additive = 0;
            var singlePrime = 0;
            var nonsense = 0;
            var incomplete = 0;

            //Row 1 is the seed row.
            for(var i = 2; ; ++i) {
                var rowActions = qualitativeActions.getActions(i);
                if (undefined === rowActions) {
                    break;
                }
                var left = getColumnAction(rowActions, 0);
                var right = getColumnAction(rowActions, 1);
                if (undefined !== left) {
                    leftValues[i] = left.result;
                }
                if (undefined !== right) {
                    rightValues[i] = right.result;
                }
                isCorrect = isRowEquivalent(leftSeed, rightSeed, left, right);
                isIncomplete = undefined === left || undefined === right;
                isConsistentStrategy = isRowStrategyConsistent(left, right); //hasProof, except in the case of build up
                noProof = !isIncomplete && undefined === left.operations && undefined === right.operations;
                allMultDiv = isConsistentStrategy && (undefined === left.operations || allMultOrDiv(left.operations.operations)) && (undefined === right.operations || allMultOrDiv(right.operations.operations));

                if (isCorrect) {
                    if (mt.common.approxEquals(left.result, leftSeed)) {
                        continue;
                    }
                    if (!noProof &&
                        (undefined === left.operations || allAddOrSubtract(left.operations.operations)) &&
                        (undefined === right.operations || allAddOrSubtract(right.operations.operations)))
                    {
                        ++buildUpProof;
                        continue;
                    }
                    sourceRow = left.sourceRow;
                    if (undefined === sourceRow) {
                        sourceRow = right.sourceRow;
                    }
                    is2 = false;
                    leftSource = leftSeed;
                    if (undefined !== sourceRow) {
                        leftSource = leftValues[sourceRow];
                    }
                    isSmaller = left.result < leftSource;
                    if (isSmaller) {
                        factor = leftSource / left.result;
                    } else {
                        factor = left.result / leftSource;
                    }
                    if (isWhole(factor)) {
                        factors = mt.common.primeFactorization(factor);
                        is2 = 2 === factors[factors.length - 1];
                    }
                    if (isSmaller) {
                        if (isConsistentStrategy && allMultDiv) {
                            if (is2) {
                                ++smaller2Proof;
                            } else {
                                ++smallerNot2Proof;
                            }
                        } else if (noProof) {
                            if (is2) {
                                ++smaller2;
                            } else {
                                ++smallerNot2;
                            }
                        } else { //inconsistent strategy
                            ++smaller;
                        }
                    } else {
                        if (isConsistentStrategy && allMultDiv) {
                            if (is2) {
                                ++larger2Proof;
                            } else {
                                ++largerNot2Proof;
                            }
                        } else if (noProof) {
                            if (is2) {
                                ++larger2;
                            } else {
                                ++largerNot2;
                            }
                        } else { //inconsistent strategy
                            ++larger;
                        }
                    }
                } else { //incorrect
                    if (isIncomplete) {
                        ++incomplete;
                    } else if (mt.common.approxEquals(leftSeed - left.result, rightSeed - right.result)) {
                        if (isConsistentStrategy) {
                            ++additiveProof;
                        } else if (noProof) {
                            ++additive;
                        } else {
                            ++nonsense;
                        }
                    } else if (isPrime(left.result) && isPrime(right.result)) {
                        ++singlePrime;
                    } else {
                        ++nonsense;
                    }
                }
            }

            var result = [];
            if (0 < smaller2Proof) {
                result.push(smaller2Proof + ' Smaller equivalent, division by power of 2, with proof');
            }
            if (0 < smaller2) {
                result.push(smaller2 + ' Smaller equivalent, division by power of 2, without proof');
            }
            if (0 < smallerNot2Proof) {
                result.push(smallerNot2Proof + ' Smaller equivalent, division by non-power of 2, with proof');
            }
            if (0 < smallerNot2) {
                result.push(smallerNot2 + ' Smaller equivalent, division by non-power of 2, without proof');
            }
            if (0 < larger2Proof) {
                result.push(larger2Proof + ' Larger equivalent, multiplication by power of 2, with proof');
            }
            if (0 < larger2) {
                result.push(larger2 + ' Larger equivalent, multiplication by power of 2, without proof');
            }
            if (0 < largerNot2Proof) {
                result.push(largerNot2Proof + ' Larger equivalent, multiplication by non-power of 2, with proof');
            }
            if (0 < largerNot2) {
                result.push(largerNot2 + ' Larger equivalent, multiplication by non-power of 2, without proof');
            }
            if (0 < buildUpProof) {
                result.push(buildUpProof + ' Equivalent ratio, build up, with proof');
            }
            if (0 < smaller) {
                result.push(smaller + ' Smaller equivalent');
            }
            if (0 < larger) {
                result.push(larger + ' Larger equivalent');
            }
            if (0 < additiveProof) {
                result.push(additiveProof + ' Additive misconception, with proof');
            }
            if (0 < additive) {
                result.push(additive + ' Additive misconception, without proof');
            }
            if (0 < singlePrime) {
                result.push(singlePrime + ' Reducing each side to a single prime');
            }
            if (0 < nonsense) {
                result.push(nonsense + ' Incorrect/nonsensical response');
            }
            if (0 < incomplete) {
                result.push(incomplete + ' Incomplete response');
            }

            return result;
        };

        //validates RatioTable IGEs
        //qualitativeActions is ns.QualitativeData
        //aryValidators is an array of objects - type is ns.Validator_IGE_RATIOTABLE_*, args is the optional array of arguments to the validator
        //returns an array of sentences describing student successful performance - if a validator fails, it does not produce a sentence
        this.validateRatioTableIge = function(qualitativeActions, aryValidators) {
            var results = [];
            var count = aryValidators.length;
            for (var i = 0; i < count; ++i) {
                var validator = validators[aryValidators[i].type];
                if (validator !== undefined) {
                    var result = validator(qualitativeActions, aryValidators[i].args);
                    if (result !== undefined) {
                        if (result instanceof Array) {
                            results = results.concat(result);
                        } else {
                            results.push(result);
                        }
                    }
                }
            }
            return results;
        };

        function hasRow(dataModel, leftTarget, rightTarget) {
            for (var i = 2; i < dataModel.leftCellArray.length - 1; ++i) {
                if (mt.common.isNumeric(dataModel.leftCellArray[i].value) &&
                    mt.common.approxEquals(leftTarget, dataModel.leftCellArray[i].value) &&
                    mt.common.isNumeric(dataModel.rightCellArray[i].value) &&
                    mt.common.approxEquals(rightTarget, dataModel.rightCellArray[i].value))
                {
                    return true;
                }
            }
            return false;
        }

        function ratiosEqual(leftSeed, rightSeed, left, right) {
            return mt.common.approxEquals(leftSeed / rightSeed, left / right);
        }

        validators[ns.VALIDATOR_IGE_RATIOTABLE_LEFT_UNIT_RATIO] = function(dataModel) {
            var leftSeed = dataModel.leftCellArray[1].value;
            var rightSeed = dataModel.rightCellArray[1].value;
            return hasRow(dataModel, 1, rightSeed / leftSeed);
        };

        validators[ns.VALIDATOR_IGE_RATIOTABLE_RIGHT_UNIT_RATIO] = function(dataModel) {
            var leftSeed = dataModel.leftCellArray[1].value;
            var rightSeed = dataModel.rightCellArray[1].value;
            return hasRow(dataModel, leftSeed / rightSeed, 1);
        };

        validators[ns.VALIDATOR_IGE_RATIOTABLE_BASE_RATIO] = function(dataModel) {
            var leftSeed = dataModel.leftCellArray[1].value;
            var rightSeed = dataModel.rightCellArray[1].value;
            var gcf = mt.common.gcf(leftSeed, rightSeed);
            return hasRow(dataModel, leftSeed / gcf, rightSeed / gcf);
        };

        validators[ns.VALIDATOR_IGE_RATIOTABLE_EXACT_VALUE_LEFT] = function(dataModel, inputs) {
            var value = inputs[0];
            var leftSeed = dataModel.leftCellArray[1].value;
            var rightSeed = dataModel.rightCellArray[1].value;
            return hasRow(dataModel, value, value / leftSeed * rightSeed);
        };

        validators[ns.VALIDATOR_IGE_RATIOTABLE_EXACT_VALUE_RIGHT] = function(dataModel, inputs) {
            var value = inputs[0];
            var leftSeed = dataModel.leftCellArray[1].value;
            var rightSeed = dataModel.rightCellArray[1].value;
            return hasRow(dataModel, value * leftSeed / rightSeed, value);
        };

        validators[ns.VALIDATOR_IGE_RATIOTABLE_ALL_RATIOS] = function(dataModel, inputs) {
            var maxLeft = inputs[0];
            var maxRight = inputs[1];
            var leftSeed = dataModel.leftCellArray[1].value;
            var rightSeed = dataModel.rightCellArray[1].value;
            var gcf = mt.common.gcf(leftSeed, rightSeed);
            var baseLeft = leftSeed / gcf;
            var baseRight = rightSeed / gcf;
            for (var i = 1; ; ++i) {
                var left = baseLeft * i;
                var right = baseRight * i;
                if (left >= maxLeft || right >= maxRight) {
                    return true;
                }
                if (mt.common.approxEquals(left, leftSeed)) {
                    continue;
                }
                if (!hasRow(dataModel, left, right)) {
                    return false;
                }
            }
        };

        //inputs[0]: number of unique, whole number ratios to count
        //inputs[1]: maximum value
        //inputs[2]: wether maximum value applies to left (true) or right (false)
        validators[ns.VALIDATOR_IGE_RATIOTABLE_LESSER_RATIOS] = function(dataModel, inputs) {
            var targetCount = inputs[0];
            var maxLeft, maxRight;
            if (inputs[2]) {
                maxLeft = inputs[1];
            } else {
                maxRight = inputs[1];
            }
            var lefts = [];
            var leftSeed = dataModel.leftCellArray[1].value;
            var rightSeed = dataModel.rightCellArray[1].value;
            lefts.push(leftSeed);
            for (var i = 2; i < dataModel.leftCellArray.length - 1 && lefts.length - 1 < targetCount; ++i) {
                var left = dataModel.leftCellArray[i].value;
                if (mt.common.isNumeric(left) && isWhole(left) &&
                    (undefined === maxLeft || left < maxLeft) && !_.contains(lefts, left)) {
                    var right = dataModel.rightCellArray[i].value;
                    if (mt.common.isNumeric(right) && isWhole(left) &&
                        (undefined === maxRight || right < maxRight) && ratiosEqual(leftSeed, rightSeed, left, right)) {
                        lefts.push(left);
                    }
                }
            }

            return lefts.length - 1 >= targetCount;
        };

        //inputs[0]: number of unique, whole number ratios to count
        //inputs[1]: minimum value
        //inputs[2]: wether minimum value applies to left (true) or right (false)
        validators[ns.VALIDATOR_IGE_RATIOTABLE_GREATER_RATIOS] = function(dataModel, inputs) {
            var targetCount = inputs[0];
            var minLeft, minRight;
            if (inputs[2]) {
                minLeft = inputs[1];
            } else {
                minRight = inputs[1];
            }
            var lefts = [];
            var leftSeed = dataModel.leftCellArray[1].value;
            var rightSeed = dataModel.rightCellArray[1].value;
            lefts.push(leftSeed);
            for (var i = 2; i < dataModel.leftCellArray.length - 1 && lefts.length - 1 < targetCount; ++i) {
                var left = dataModel.leftCellArray[i].value;
                if (mt.common.isNumeric(left) && isWhole(left) &&
                    (undefined === minLeft || left > minLeft) && !_.contains(lefts, left)) {
                    var right = dataModel.rightCellArray[i].value;
                    if (mt.common.isNumeric(right) && isWhole(left) &&
                        (undefined === minRight || right > minRight) && ratiosEqual(leftSeed, rightSeed, left, right)) {
                        lefts.push(left);
                    }
                }
            }

            return lefts.length - 1 >= targetCount;
        };

        //checks correctness of RatioTable IGEs
        //dataModel is a serialized RatioTable
        //aryValidators is an array of objects - type is ns.Validator_IGE_RATIOTABLE_*, args is the optional array of arguments to the validator
        //returns a boolean
        this.gradeRatioTableIge = function(dataModel, aryValidators) {
            var result = {
                correct: true,
                feedback: [],
                correctInputs: [],
                incorrectInputs: []
            };
            var count = aryValidators.length;
            for (var i = 0; result.correct && i < count; ++i) {
                var validator = validators[aryValidators[i].type];
                if (validator !== undefined) {
                    result.correct = result.correct && validator(dataModel, aryValidators[i].args);
                }
            }
            return result;
        };
        /*********
        * End IGE Specific code
        **********/

    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('keypadService', function ($timeout) {

        var keypad = new ns.Keypad(),
            closeCallback = angular.noop;

        keypad.setKeypadVisible(false);

        return {

            showKeypad: function (keypadModel, closeCallbackFn) {
                keypad = keypadModel;
                closeCallback = angular.isFunction(closeCallbackFn) ? closeCallbackFn : angular.noop;
            },

            isVisible: function () {
                return keypad && keypad.keypadVisible;
            },

            setVisible: function (isVisible) {
                keypad.setKeypadVisible(isVisible);

                if (!isVisible) {
                    closeCallback();
                    closeCallback = angular.noop;
                }
            },

            getKeypad: function () {
                return keypad;
            }
        };
    });
})(window.mt.common);
(function (ns) {
    'use strict';

    angular.module('mt.common').factory('lineRectIntersectionFactory', function() {
        /* jshint bitwise:false */

        var INSIDE = 0; // 0000
        var LEFT = 1;   // 0001
        var RIGHT = 2;  // 0010
        var BOTTOM = 4; // 0100
        var TOP = 8;    // 1000


        return {
            findLineForPoints: function(p1, p2, rectDiag) {
                if (p1.equals(p2)) {
                    return undefined;
                }

                var simpleP1 = {
                    x: p1.x.val(),
                    y: p1.y.val()
                };
                var simpleP2 = {
                    x: p2.x.val(),
                    y: p2.y.val()
                };

                var simpleRectDiag = {
                    start: {
                        x: rectDiag.start.x.val(),
                        y: rectDiag.start.y.val()
                    },
                    end: {
                        x: rectDiag.end.x.val(),
                        y: rectDiag.end.y.val()
                    }
                };

                var eq = this.getLineEquation(simpleP1, simpleP2);

                var extrapMinX;
                var extrapMaxX;
                var extrapMinY;
                var extrapMaxY;

                // can't use 'y=mx+b' for vertical line
                if (eq.type === 'vertical') {
                    extrapMinX = simpleP1.x;
                    extrapMinY = simpleRectDiag.start.y - 1;
                    extrapMaxX = p1.x;
                    extrapMaxY = simpleRectDiag.end.y + 1;
                }
                else {
                    // gets y value for given x
                    var mxPlusB = function (x) {
                        return eq.m * x + eq.b;
                    };

                    // find extrapolated points for line that are just
                    // beyond the bounds of the rect
                    extrapMinX = simpleRectDiag.start.x - 1;
                    extrapMaxX = simpleRectDiag.end.x + 1;
                    extrapMinY = mxPlusB(extrapMinX);
                    extrapMaxY = mxPlusB(extrapMaxX);
                }

                var extrapolatedLine = {
                    start: {
                        x: extrapMinX,
                        y: extrapMinY
                    },
                    end: {
                        x: extrapMaxX,
                        y: extrapMaxY
                    }
                };

                // now get the line
                var simpleLine = this.cohenSutherlandLineClip(extrapolatedLine, simpleRectDiag);

                return simpleLine !== undefined ? new ns.Line({
                    start: simpleLine.start,
                    end: simpleLine.end
                }) : undefined;
            },

            /* a ray terminates at p1 and extends through p2 to infinity
            */
            findRayForPoints: function(p1, p2, rectDiag)
            {
                if (p1.equals(p2)) {
                    return undefined;
                }

                var simpleP1 = {
                    x: p1.x.val(),
                    y: p1.y.val()
                };
                var simpleP2 = {
                    x: p2.x.val(),
                    y: p2.y.val()
                };

                var simpleRectDiag = {
                    start: {
                        x: rectDiag.start.x.val(),
                        y: rectDiag.start.y.val()
                    },
                    end: {
                        x: rectDiag.end.x.val(),
                        y: rectDiag.end.y.val()
                    }
                };

                var eq = this.getLineEquation(simpleP1, simpleP2);

                var extrapX2;
                var extrapY2;

                // can't use 'y=mx+b' for vertical line
                if (eq.type === 'vertical') {
                    extrapX2 = simpleP2.x;
                    //figure out wether to draw the line up or down
                    extrapY2 = (simpleP1.y < simpleP2.y)? (simpleRectDiag.end.y + 1) : (simpleRectDiag.start.y - 1);
                }
                else {
                    // gets y value for given x
                    var mxPlusB = function (x) {
                        return eq.m * x + eq.b;
                    };

                    // find extrapolated points for line that are just
                    // beyond the bounds of the rect
                    // figure out wether to draw the line right or left
                    extrapX2 = (simpleP1.x < simpleP2.x)? (simpleRectDiag.end.x + 1) : (simpleRectDiag.start.x - 1);
                    extrapY2 = mxPlusB(extrapX2);
                }

                var extrapolatedLine = {
                    start: simpleP1,
                    end: {
                        x: extrapX2,
                        y: extrapY2
                    }
                };

                // now get the line
                var simpleLine = this.cohenSutherlandLineClip(extrapolatedLine, simpleRectDiag);

                return simpleLine !== undefined ? new ns.Line({
                    start: simpleLine.start,
                    end: simpleLine.end
                }) : undefined;
            },

            getLineEquation: function(p1, p2) {
                var snap = 0.01;
                //snap is the snap-to, possibly the minor interval; ex: .25, .01
                function round(val, snap)
                {
                    var precision = Math.round(1/snap);
                    return Math.round(precision * val) / precision;
                }

                if (p1.x === p2.x) {
                    return {
                        type: 'vertical',
                        x: p1.x,
                        equals: function(other)
                        {
                            return this.type === other.type && round(this.x, snap) === round(other.x, snap);
                        }
                    };
                }

                // find slope
                var m = (p1.y - p2.y) / (p1.x - p2.x);
                // solve for b
                var b = p1.y - m * p1.x;

                return {
                    type: 'sloped',
                    m: m,
                    b: b,
                    equals: function(other)
                    {
                        return this.type === other.type &&
                            round(this.m, snap) === round(other.m, snap) &&
                            round(this.b, snap) === round(other.b, snap);
                    }
                };
            },

            /**
                adapted from http://en.wikipedia.org/wiki/Cohen-Sutherland_algorithm
            */
            calcOutCode: function(p, rectDiag){
                var code = INSIDE;          // initialised as being inside of clip window

                if (p.x < rectDiag.start.x) {           // to the left of clip window
                    code = code | LEFT;
                }
                else if (p.x > rectDiag.end.x) {    // to the right of clip window
                    code = code | RIGHT;
                }
                if (p.y < rectDiag.start.y) {           // below the clip window
                    code = code | BOTTOM;
                }
                else if (p.y > rectDiag.end.y) {      // above the clip window
                    code = code | TOP;
                }

                return code;
            },

            /**
                adapted from http://en.wikipedia.org/wiki/Cohen-Sutherland_algorithm
            */
            cohenSutherlandLineClip: function(line, rectDiag) {
                // copy points so originals don't get mutated
                var p0 = {
                    x: line.start.x,
                    y: line.start.y
                };
                var p1 = {
                    x: line.end.x,
                    y: line.end.y
                };

                // compute outcodes for P0, P1, and whatever point lies outside the clip rectangle
                var outcode0 = this.calcOutCode(p0, rectDiag);
                var outcode1 = this.calcOutCode(p1, rectDiag);
                var accept = false;

                while (true) {
                    if (!(outcode0 | outcode1)) { // Bitwise OR is 0. Trivially accept and get out of loop
                        accept = true;
                        break;
                    } else if (outcode0 & outcode1) { // Bitwise AND is not 0. Trivially reject and get out of loop
                        break;
                    } else {
                        // failed both tests, so calculate the line segment to clip
                        // from an outside point to an intersection with clip edge
                        var x, y;

                        // At least one endpoint is outside the clip rectangle; pick it.
                        var outcodeOut = outcode0 ? outcode0 : outcode1;

                        // Now find the intersection point;
                        // use formulas y = p0.y + slope * (x - p0.x), x = p0.x + (1 / slope) * (y - p0.y)
                        if (outcodeOut & TOP) { // point is above the clip rectangle
                            x = p0.x + (p1.x - p0.x) * (rectDiag.end.y - p0.y) / (p1.y - p0.y);
                            y = rectDiag.end.y;
                        } else if (outcodeOut & BOTTOM) { // point is below the clip rectangle
                            x = p0.x + (p1.x - p0.x) * (rectDiag.start.y - p0.y) / (p1.y - p0.y);
                            y = rectDiag.start.y;
                        } else if (outcodeOut & RIGHT) { // point is to the right of clip rectangle
                            y = p0.y + (p1.y - p0.y) * (rectDiag.end.x - p0.x) / (p1.x - p0.x);
                            x = rectDiag.end.x;
                        } else if (outcodeOut & LEFT) { // point is to the left of clip rectangle
                            y = p0.y + (p1.y - p0.y) * (rectDiag.start.x - p0.x) / (p1.x - p0.x);
                            x = rectDiag.start.x;
                        }

                        // Now we move outside point to intersection point to clip
                        // and get ready for next pass.
                        if (outcodeOut === outcode0) {
                            p0.x = x;
                            p0.y = y;
                            outcode0 = this.calcOutCode(p0, rectDiag);
                        } else {
                            p1.x = x;
                            p1.y = y;
                            outcode1 = this.calcOutCode(p1, rectDiag);
                        }
                    }
                }

                if (accept) {
                    return {
                        start: p0,
                        end: p1
                    };
                }
                else {
                    return undefined;
                }
            }
        };
    });

})(window.mt.common);

(function (ns) {
    'use strict';
    angular.module('mt.common').service('localStorageService', function() {

        function ensureSectionId(sessionData) {
            if (!sessionData.sectionId) {
                sessionData.sectionId = ''; //TODO - this needs to be the actual CS section id
            }
            return sessionData;
        }

        this.clearSessionData = function (sessionId) {
            var sessionData = this.loadSessionData(sessionId);
            var clearSessionData = {};

            if (sessionData.sectionId) {
                clearSessionData.sectionId = sessionData.sectionId;
            } else {
                ensureSectionId(clearSessionData);
            }

            if (sessionData.role) {
                clearSessionData.role = sessionData.role;
            }

            var jsonData = JSON.stringify(clearSessionData);
            localStorage[sessionId] = jsonData;
        };

        this.saveSessionData = function (sessionId, sessionData) {
            ensureSectionId(sessionData);
            var jsonData = JSON.stringify(sessionData);
            localStorage[sessionId] = jsonData;
        };

        this.loadSessionData = function(sessionId)  {
            var jsonData = localStorage[sessionId];
            var sessionData;
            if(jsonData === undefined) {
                sessionData = {};
            } else {
                sessionData = JSON.parse(jsonData);
            }
            if (!sessionData.sectionId) {
                ensureSectionId(sessionData);
                this.saveSessionData(sessionId, sessionData);
            }
            return sessionData;
        };

        this.getUserId = function () {
            var tmp = localStorage[mt.common.LOCAL_STORAGE_USER_ID_KEY];
            if (undefined === tmp) {
                tmp = ns.createGuid(); //TODO - this needs to be the actual CS user id
                this.setUserId(tmp);
            }
            return tmp;
        };

        this.setUserId = function (value) {
            localStorage[mt.common.LOCAL_STORAGE_USER_ID_KEY] = value;
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    //service for controlling the singleton mtModalAlert directive
    angular.module('mt.common').service('modalAlertService', function() {
        var showFn = angular.noop;

        this.registerShowFn = function(callback) {
            showFn = callback;
        };

        this.showModalAlert = function (text) {
            showFn(text);
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('mtLocalStorage', function () {

        this.save = function (
                key,
                string
                ) {
            localStorage[key] = string;
        };

        this.load = function (key) {
            return localStorage[key];
        };

        this.saveJson = function (
                key,
                object
                ) {
            this.save(key, JSON.stringify(object));
        };

        this.loadJson = function (key) {
            var lsData = this.load(key);
            var lsJson;
            if (lsData) {
                lsJson = JSON.parse(lsData);
            }
            return lsJson;
        };

    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('toolMenuService', function (activeToolService, toolRegistryService, preconfiguredToolService, roleService, MtRibbonItemService, undoService, mtTourService, workspaceAbstractService, $rootScope) {

        var toolMenus = {};

        this.itemType = MtRibbonItemService.itemType;
        this.newItem = MtRibbonItemService.newItem;
        var self = this;

        function getMenuId(toolId, contextId) {
            return (contextId === undefined)? toolId: toolId + '_' + contextId;
        }

        function addCommonToolItems(menuItems, containerApi, selectionApi) {
            // function closeFn() {
            //     undoService.save();
            //     containerApi.closeTool();
            // }

            function doneFn() {
                if(menuItems.contextId) {
                    selectionApi.clear();
                } else {
                    activeToolService.setActiveTool();
                }
                
                $rootScope.$emit('donePressed');
            }

            function setNameFn(name) {
                containerApi.name.value = name;
            }

            function getNameFn() {
                return containerApi.name.value;
            }

            function submitFn() {
                workspaceAbstractService.submitTool(containerApi.toolId);
            }

            if(!menuItems.contextId) {

                var leftItems = menuItems.items.left;
                //prepend items onto array in reverse order
                leftItems.splice(0, 0,
                    // Playtesting indicated we may not want close button on ribbon
                    // TODO - remove this once final decision made
                    // self.newItem.button('Close', closeFn, {cssClass: 'mt-ribbon-item-close'}),
                    // self.newItem.seperator(),
                    self.newItem.input('name', setNameFn,
                        {cssClass: 'mt-ribbon-name-input', placeHolder: containerApi.name.value, updateOnChange: false},
                        getNameFn)
                );

                if(roleService.getRole() === mt.common.STUDENT_ROLE) {
                    menuItems.items.right.push(
                        self.newItem.button('Submit', submitFn, {
                            isVisible: function() {
                                return workspaceAbstractService.isEnabled();
                            }
                        })
                    );
                } else if(roleService.getRole() === mt.common.TEACHER_ROLE) {
                    menuItems.items.right.push(self.newItem.button('Broadcast', function() {
                        containerApi.broadcast();
                    }, {cssClass: 'mt-ribbon-image-share'}));
                }
            }

            var rightItems = menuItems.items.right;

            rightItems.push(
                self.newItem.seperator(),
                self.newItem.button('Done', doneFn, {})
            );
        }

        this.setToolMenu = function (toolId, menuItems, opts) {
            if(toolId !== menuItems.toolId) {
                menuItems.toolId = toolId;
            }
            if(opts.contextId !== menuItems.contextId) {
                menuItems.contextId = opts.contextId;
            }

            if(opts.containerApi !== undefined) {
                addCommonToolItems(menuItems, opts.containerApi, opts.selectionApi);
            }

            if(opts.selectionApi !== undefined) {
                addCommonToolItems(menuItems, opts.containerApi, opts.selectionApi);
            }

            toolMenus[getMenuId(toolId, opts.contextId)] = menuItems;
        };

        this.getToolMenu = function (toolId, contextId) {
            return toolMenus[getMenuId(toolId, contextId)];
        };

        //keep track of global context
        var curContext;
        var curClearFn;
        //make sure we reset context when the active tool changes
        this.setContext = function(contextId, clearFn) {
            //apply clear callback if registered - used to clear selections on context change
            if(curClearFn !== undefined) {
                curClearFn();
                this.hasChanged = true;
            }

            curClearFn = clearFn;
            curContext = contextId;
        };

        this.getContext = function() {
            return curContext;
        };

        this.getToolListRibbon = function() {

            function addTool(type) {
                undoService.save();
                setTimeout(function () {
                    toolListMenuOpen = false;
                    mtTourService.nextStep('workspace', 'openTable');
                }, 0);
                preconfiguredToolService.addTool(type, mt.common.DEFAULT_SPACE_ID);
                self.toggleToolListMenu(false);
                $rootScope.$emit('toolOpened');
            }

            function createButton(icon, name, type) {
                return {
                    type: MtRibbonItemService.itemType.BUTTON,
                    icon: icon,
                    name: name,
                    btnName: type + '-btn',
                    callback: angular.bind(undefined, addTool, type),
                    opts: {cssClass: 'mt-ribbon-image-' + type}
                };
            }

            var toolItems = [];
            var applets = ['Choose one:'];
            var appletPopover = {
                type: MtRibbonItemService.itemType.POPOVER,
                name: 'Applets',
                popover: [applets],
                opts: {cssClass:'mt-tool-list-applets', showName: true}
            };
            
            _(toolRegistryService.getTemplates())
                .chain()
                .filter(function (template) {
                    return true === template.available || (mt.common.TOOL_ACCESS_RESTRICTED === template.available && roleService.hasAccessToAllTools());
                }).each(function (template) {
                    if(template.applet){
                        applets.push(createButton(template.id, template.displayName, template.type));
                        applets[applets.length - 1].opts.showName = true; //show full applet name, not just initials
                    } else {
                        toolItems.push(createButton(template.id, template.displayName, template.type));
                    }
                });

            var ribbon = {};
            ribbon.items = {};
            ribbon.items.center = toolItems;
            ribbon.items.center.push(appletPopover);

            return ribbon;
        };

        //tool instantiation menu options
        var toolListMenuOpen = false;
        this.toggleToolListMenu = function(isOpen) {
            if(isOpen === undefined) {
                isOpen = !toolListMenuOpen;
            }

            toolListMenuOpen = isOpen;
        };

        this.isToolListMenuOpen = function(iOpen) {
            return toolListMenuOpen;
        };

    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('mtTourService', function (
            $timeout,
            mtLocalStorage,
            configService
            ) {

        var LOCAL_STORAGE_KEY = 'mt-tours';
        var tours = {};

        function saveTourState(tourName) {
            var mtTourStates = mtLocalStorage.loadJson(LOCAL_STORAGE_KEY);
            if (!mtTourStates) {
                mtTourStates = {};
            }

            mtTourStates[tourName] = true;
            mtLocalStorage.saveJson(LOCAL_STORAGE_KEY, mtTourStates);
        }

        function getTourState(tourName) {
            var tourState = false;

            var mtTourStates = mtLocalStorage.loadJson(LOCAL_STORAGE_KEY);
            if (mtTourStates && mtTourStates[tourName]) {
                tourState = true;
            }

            return tourState;
        }

        this.getActiveTourName = function () {
            var activeTourName;

            var tourNames = _.keys(tours);

            _.each(tourNames, function (tourName) {
                if (Shepherd.activeTour === tours[tourName]) {
                    activeTourName = tourName;
                }
            });

            return activeTourName;
        };

        this.setTour = function (
                tourName,
                tour
                ) {
            tours[tourName] = tour;
        };

        this.getTour = function (tourName) {
            return tours[tourName];
        };

        this.startTour = function (tourName) {
            if (!configService.disableOverlays && !getTourState(tourName)) {
                $timeout(angular.bind(this, function () {
                    tours[tourName].start();
                }));
            }
        };

        this.nextStep = function (
                tourName,
                stepId
                ) {
            var activeTourName = this.getActiveTourName();

            if (activeTourName === tourName) {
                if (tours[activeTourName].currentStep.id === stepId) {

                    $timeout(angular.bind(this, function () {
                        var finished = tours[tourName].next();

                        if (finished) {
                            this.finishTour(tourName);
                        }
                    }), 400);
                }
            }
        };

        this.finishTour = function (tourName) {
            var activeTourName = this.getActiveTourName();

            //hide tour if it's the active tour
            if (activeTourName === tourName) {
                tours[activeTourName].hide();
                tours[activeTourName].complete();
            }

            //save tour state
            if (activeTourName === tourName ||
                    activeTourName === undefined) {
                saveTourState(tourName);
            }
        };

    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('persistorService', function (eventingService) {

        //persistor service, generic (non-tool specific) persistence service
        this.register = function (id, category, spaceId, serialize, deserialize) {
            //is this space the target of the event?
            function isSpaceTarget(event) {
                //handle events for this space or untargetted events in default space
                return event.spaceId === spaceId || (event.spaceId === undefined && spaceId === mt.common.DEFAULT_SPACE_ID);
            }

            function onSaveRequest(event) {
                if(isSpaceTarget(event)) {
                    var data = serialize();
                    var saveEvent = new ns.Event();
                    _.extend(saveEvent, data);
                    saveEvent.toolCategory = category;
                    saveEvent.toolId = id;
                    saveEvent.spaceId = spaceId;
                    eventingService.publish(ns.TOOL_SAVE_RESPONSE_TOPIC, saveEvent);
                }
            }

            function onLoadRequest(event) {
                //only handle load events with a matching toolId and spaceId
                if(isSpaceTarget(event) && event.toolId === id) {
                    deserialize(event);
                }
            }

            //subscribe to onSaveRequest and onLoadRequest
            eventingService.subscribe(id, ns.TOOL_SAVE_REQUEST_TOPIC, onSaveRequest);
            eventingService.subscribe(id, ns.TOOL_LOAD_TOPIC, onLoadRequest);
        };

        //keep track of tool data for which there isn't a tool yet
        var eventQueue = [];
        this.applyQueuedData = function(toolId) {
            var loadEvent = _.findWhere(eventQueue, {toolId: toolId});
            if(loadEvent !== undefined) {
                //remove the data from the queue
                var index = eventQueue.indexOf(loadEvent);
                eventQueue.splice(index, 1);
                //publish the event to the tool
                eventingService.publish(ns.TOOL_LOAD_TOPIC, loadEvent);
                return true;
            }
            return false;
        };

        this.loadData = function(toolId, data) {
            var loadEvent = new mt.common.Event();
            _.extend(loadEvent, data);
            loadEvent.toolId = toolId;
            if(eventingService.getTopic(ns.TOOL_LOAD_TOPIC).isSubscribed(toolId)) {
                eventingService.publish(ns.TOOL_LOAD_TOPIC, loadEvent);
            } else {
                eventQueue.push(loadEvent);
            }
        };

        //synchronous helper fns for extracting tool data
        var tools = [];
        var submissionActive = false;
        eventingService.subscribe('getToolsSyncService', ns.TOOL_SAVE_RESPONSE_TOPIC, function(event) {
            if(submissionActive === true) {
                tools.push(event);
            }
        });

        function getToolData() {
            tools = [];
            //request that tools send their data - fill tools array
            var saveEvent = new mt.common.Event({});
            submissionActive = true;
            eventingService.publish(mt.common.TOOL_SAVE_REQUEST_TOPIC, saveEvent);
            submissionActive = false;
            return tools;
        }

        this.getTools = function () {
            return angular.copy(getToolData());
        };

        this.getInstantiatedTools = function() {
            var instantiatedTools = _.filter(getToolData(), function(tool){ return tool.toolCategory === mt.common.TOOL_CATEGORY;});
            return angular.copy(instantiatedTools);
        };

        this.getToolById = function(id) {
            var tool = _.findWhere(getToolData(), {toolId: id});
            return angular.copy(tool);
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('pointNameService', function () {

        function findNext(names, lastTried) {
            var chars = lastTried.split('');
            var lastChar = _(chars).last();

            if (lastChar === 'Z') {
                // find nearest non-Z ancestor
                var i, nearestNonZIndex = -1;
                for (i = chars.length - 2; i >= 0; --i) {
                    if (chars[i] !== 'Z') {
                        nearestNonZIndex = i;
                        break;
                    }
                }

                var startIndex = Math.max(nearestNonZIndex + 1, 0);
                for (i = startIndex; i < chars.length; ++i) {
                    chars[i] = 'A';
                }

                if (nearestNonZIndex >= 0) {
                    chars[nearestNonZIndex] = _(chars[nearestNonZIndex]).succ();
                } else {
                    chars.push('A');
                }

            } else {
                chars[chars.length - 1] = _(lastChar).succ();
            }

            var nextTry = chars.join('');

            if (!_(names).contains(nextTry)) {
                return nextTry;
            } else {
                return findNext(names, nextTry);
            }
        }

        return {
            validateNames: function (points) {
                var self = this;
                _(points).each(function (point) {
                    if (!point.isEditing && (point.name === undefined || _(point.name).isBlank())) {
                        point.name = self.nextValidName(points);
                        point.hasValidName = true;
                    } else {
                        point.hasValidName = self.hasValidName(point, points);
                    }
                });
            },

            hasValidName: function (point, points) {
                return point.name !== undefined && !_(point.name).isBlank() && _(points).chain()
                    .reject(function (currentPoint) {
                        return currentPoint === point;
                    })
                    .pluck('name')
                    .indexOf(point.name)
                    .value() === -1;
            },

            nextValidName: function (points) {
                var allNames = _(points).pluck('name');
                if (!_(allNames).contains('A')) {
                    return 'A';
                }

                var nextName = findNext(allNames, 'A');
                return nextName.substring(0, 3);
            },

            renameIfEmpty: function (point, points) {
                if (point.name === undefined || _(point.name).isBlank()) {
                    point.name = this.nextValidName(points);
                    point.hasValidName = true;
                }
            }
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('popupMenuService', function () {
        var openCallback, closeCallback;

        return {
            registerOpenCallback: function (callback) {
                openCallback = callback;
            },
            registerCloseCallback: function (callback) {
                closeCallback = callback;
            },
            openPopup: function(items, inputEvent, closeEvent) {
                openCallback(items, inputEvent, closeEvent);
            },
            closePopup: function(actionTriggered) {
                closeCallback(actionTriggered);
            }
        };
    });

})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('postMessageService', [
        'preconfiguredToolService',
        'environmentService',
        'persistorService',
        '$window', '$timeout',
        function (
            preconfiguredToolService,
            environmentService,
            persistorService,
            $window, $timeout) {
            //store a reference to the CDA
            var cda;

            function getTools() {
                return persistorService.getInstantiatedTools();
            }

            //object being used as a lookup table for messages handled
            var messagesHandled = {};

            function handleMessage (event) {

                //save a reference to CDA
                cda = event.source;

                //create ack packet
                var packetId = event.data.id;

                //prevent duplicate messages being handled
                if(messagesHandled[packetId]  === true) {
                    return;
                }
                messagesHandled[packetId] = true;

                var ackPacket = {
                    ack: packetId
                };
                sendToCda(ackPacket);

                var msg = event.data.msg;
                if (event.data.msg) {
                    switch (msg.cmd) {
                    case ns.PMCMD_OPENTOOL:
                        var tool = JSON.parse(msg.json);

                        if (angular.isArray(tool)) {
                            tool.forEach(function (t) {
                                preconfiguredToolService.addToolWithData(t);
                            });
                        } else {
                            preconfiguredToolService.addToolWithData(tool);
                        }

                        break;

                    case ns.PMCMD_GETTOOLS:

                        var tools = getTools();
                        var packet = {
                            msg: {
                                cmd: ns.PMCMD_GETTOOLS,
                                toolsJson: JSON.stringify(tools)
                            },
                            id: mt.common.createGuid()
                        };
                        sendToCda(packet);
                        break;
                    case ns.PMCMD_CLEARTOOL:
                        environmentService.getSpaceApi(mt.common.DEFAULT_SPACE_ID).clear();
                        break;
                    case ns.PMCMD_SETABSTRACT:
                        var abstract = JSON.parse(msg.json);
                        setAbstract(abstract);
                        break;
                    }
                }
            }

            //register the messageListener
            if ($window.addEventListener) {
                // For standards-compliant web browsers
                $window.addEventListener('message', handleMessage, false);
            } else {
                $window.attachEvent('onmessage', handleMessage);
            }

            function sendToCda(packet) {
                if(cda !== undefined) {
                    cda.postMessage(packet, '*');
                }
            }

            this.sendSubmissionsToCda = function(abstract) {
                if(abstract.submittedTools === undefined) {
                    abstract.submittedTools = [];
                }
                if(abstract.submittedWorkspace === undefined) {
                    abstract.submittedWorkspace = [];
                }
                var packet = {
                    msg: {
                        cmd: ns.PMCMD_SETSUBMISSIONS,
                        toolsJson: JSON.stringify(abstract.submittedTools),
                        workspaceJson: JSON.stringify(abstract.submittedWorkspace)
                    },
                    id: mt.common.createGuid()
                };
                sendToCda(packet);
            };

            this.sendSizeNotification = function(size) {
                var packet = {
                    msg: {
                        cmd: ns.PMCMD_SETSIZE,
                        size: size
                    },
                    id: mt.common.createGuid()
                };
                sendToCda(packet);
            };

            var setAbstract = angular.noop;
            this.registerSetAbstract = function(callback) {
                setAbstract = callback;
            };
        }
    ]);
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('preconfiguredToolService', function ($rootScope, eventingService, toolRegistryService, persistorService, activeToolService) {
        function createTool(id, type, spaceId) {
            var createEvent = new mt.common.Event();
            createEvent.type = type;
            createEvent.toolId = id;
            createEvent.spaceId = spaceId;

            eventingService.publish(mt.common.EVENT_CREATE_TOOL, createEvent);
        }

        this.addTool = function (type, spaceId, toolId, externalConfig, doNotMakeActive) {
            var id = (toolId === undefined)? mt.common.createGuid(): toolId;
            if(spaceId === undefined) {
                spaceId = mt.common.DEFAULT_SPACE_ID;
            }

            if (externalConfig) { // register external tool
                toolRegistryService.addTemplate({
                    id: externalConfig.id,
                    type: type,
                    displayName: externalConfig.displayName,
                    available: true,
                    htmlTemplate: externalConfig.htmlTemplate
                });
            }

            createTool(id, type, spaceId);

            if(doNotMakeActive !== true) {
                activeToolService.setActiveTool(id);
            }
            return id;
        };

        this.addToolWithData = function (tool, doNotMakeActive) {
            var externalConfig;
            if (tool.data !== undefined) { externalConfig = tool.data.externalConfig; }
            var id;

            //don't inject data if it isn't defined - for convenience of post message
            if(tool.data === undefined) {
                this.addTool(tool.type, tool.spaceId, tool.toolId, externalConfig, doNotMakeActive);
                return;
            } else {
                id = this.addTool(tool.type, tool.spaceId, tool.toolId, externalConfig, doNotMakeActive);
            }

            tool.submittable = (tool.submittable !== undefined) ? tool.submittable: false;
            persistorService.loadData(id, tool);

            return id;
        };

        //questionable whether this belongs here but we need it somewhere
        this.removeTool = function (toolId)  {
            var removeEvent = new mt.common.Event();
            removeEvent.toolId = toolId;
            eventingService.publish(mt.common.EVENT_REMOVE_TOOL, removeEvent);
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('realtimeService', function ($log, configService, roleService, eventingService, sessionService, localStorageService) {
        var realtimeQueue = [], // {event, data}
                sock_opt = {
                    'max reconnection attempts': 100,
                    'reconnect': true, //auto reconnect on disconnect
                    'reconnection delay': 1000, //initial reconnect delay 1s
                    'reconnection limit': 4000, //max backoff 4s
                    'sync disconnect on unload': true //let server know browser closed
                },
                cache = new LRUCache({
                    max: 1000,
                    length: function (n) { return n * 2; },
                    maxAge: 1000 * 60 * 60
                }),
                offlineMode = false,
                ACKNOWLEDGE = 'mt_client_ack',
                SUBSCRIBE = 'mt_client_subscribe',
                MSG_WORKBOOK = 'mt_msg_workbook',
                MSG_REGISTER_RESULT_TABLE = 'mt_msg_regrt',
                MSG_UNREGISTER_RESULT_TABLE = 'mt_msg_unregrt',
                realtimeConnect = function() {
                    return io.connect(configService.realtimeUrl, sock_opt);
                },
                realtimeSubscribe = function(subData) {
                    lastSubscribeData = subData;
                    socket.emit(SUBSCRIBE, subData);
                },
                doCallback = function(eventName, data) {
                    var packetId = data.id;

                    //send acknowledgement
                    socket.emit(ACKNOWLEDGE, {'id': packetId});

                    //make sure we haven't seen this packet before
                    if (packetId && cache.get(packetId)) {
                        console.log('Already got this packet!');
                        return;
                    }
                    //cache packet id
                    cache.set(packetId, true);
                    var topicSubscribers = subscribers[eventName];
                    if (topicSubscribers && offlineMode === false) {
                        console.log('realtime callback for event', JSON.stringify(data));
                        console.log('targetToolId: ', data.targetToolId);
                        for(var i in topicSubscribers) {
                            //if a targetId is defined only hit that subscriber, otherwise hit them all
                            if(data.targetToolId === undefined || data.targetToolId === topicSubscribers[i].id) {
                                topicSubscribers[i].callback(data);
                            }
                        }
                    }
                },
                queueEvent = function(event) {
                    if(offlineMode === false) {
                        realtimeQueue.push(event);
                    }
                    sendQueue();
                },
                dequeueEvent = function(id) {
                    var sioObject,
                            i,
                            event_id;

                    //make sure we have an id
                    if (!id) {
                        return;
                    }

                    //find the event to remove
                    for (i = 0; i < realtimeQueue.length; i++) {
                        sioObject = realtimeQueue[i];
                        event_id = sioObject.data.id;
                        if(event_id === id) {
                            realtimeQueue.splice(i, 1);
                        }
                    }
                },
                sendQueue = function() {
                    var sioObject,
                            i,
                    //emit acknowledgement callback
                            ack_packet = function (ack_data) {
                                dequeueEvent(ack_data.id);
                            };

                    if (socket.connected) {
                        for (i = 0; i < realtimeQueue.length; i++) {
                            sioObject = realtimeQueue[i];
                            //make sure the packet has an id
                            if (!sioObject.data.id) {
                                sioObject.data.id = mt.common.createGuid();
                            }
                            socket.emit(sioObject.event, sioObject.data, ack_packet);
                        }
                    }
                },
                socket = realtimeConnect(),
                lastSubscribeData = {},
                subscribers = {},
                subIds = {};

        socket.on('connect', function () {
            $log.info('socket.io connected.');
            sendQueue();
            eventingService.publish(mt.common.EVENT_NETWORK_CONNECTION_STATUS, new mt.common.Event({connected: true}));
        });
        socket.on('connecting', function () {
            $log.info('socket.io connecting.');
        });
        socket.on('disconnect', function () {
            $log.info('socket.io disconnected.');
            eventingService.publish(mt.common.EVENT_NETWORK_CONNECTION_STATUS, new mt.common.Event({connected: false}));
        });
        socket.on('connect_failed', function () {
            $log.info('socket.io connection failed.');
        });
        socket.on('error', function () {
            $log.info('socket.io error.');
        });
        socket.on('reconnect_failed', function () {
            $log.info('socket.io reconnect failed.');
        });
        socket.on('reconnect', function () {
            $log.info('socket.io reconnect.');
            realtimeSubscribe(lastSubscribeData);
        });
        socket.on('reconnecting', function () {
            $log.info('socket.io reconnecting.');
        });

        socket.on(MSG_WORKBOOK, function(data) {
            doCallback(MSG_WORKBOOK, data);
        });

        function getSessionDataFromLocalStorage() {
            return localStorageService.loadSessionData(sessionService.getSessionId());
        }

        function getUserIdFromLocalStorage() {
            return localStorageService.getUserId();
        }

        function getSectionIdFromLocalStorage() {
            var sessionData = getSessionDataFromLocalStorage();
            return sessionData.sectionId;
        }

        function subscribe(role) {
            var data = {
                mt_userId: getUserIdFromLocalStorage(),
                mt_sectionId: getSectionIdFromLocalStorage(),
                mt_role: role
            };
            realtimeSubscribe(data);
        }

        function addSubscriber(topicName, callback, id) {
            var subId = mt.common.createGuid();

            var subscriber = {callback: callback, id: id, subId: subId};
            if(subscribers[topicName] === undefined) {
                subscribers[topicName] = [];
            }

            subscribers[topicName].push(subscriber);

            subIds[subId] = topicName;
            return subId;
        }

        function removeSubscriber(subId) {
            if(!subIds[subId]) {
                return;
            }
            var topicName = subIds[subId];
            if(subscribers[topicName] === undefined) {
                return;
            }

            subscribers[topicName] = _.filter(subscribers[topicName], function(s) {
                return s.subId !== subId;
            });

            delete subIds[subId];
        }

        subscribe(roleService.getRole());

        return {
            subscribe: subscribe,
            getUserId: function() {
                return getUserIdFromLocalStorage();
            },
            unregisterCallback: function (subId) {
                removeSubscriber(subId);
            },
            onSendTool: function (callback, id) {
                return addSubscriber(MSG_WORKBOOK, callback, id);
            },
            sendTool: function (data) {
                var newEvent = {
                    'event': MSG_WORKBOOK,
                    'data': data
                };
                queueEvent(newEvent);
            },
            onRegisterResultTable: function (callback) {
                return addSubscriber(MSG_REGISTER_RESULT_TABLE, callback);
            },
            onUnregisterResultTable: function (callback) {
                return addSubscriber(MSG_UNREGISTER_RESULT_TABLE, callback);
            },
            registerResultTable: function (data) {
                var newEvent = {
                    'event': MSG_REGISTER_RESULT_TABLE,
                    'data': data
                };
                queueEvent(newEvent);
            },
            unregisterResultTable: function (data) {
                var newEvent = {
                    'event': MSG_UNREGISTER_RESULT_TABLE,
                    'data': data
                };
                queueEvent(newEvent);
            },
            Packet: function (target_usr, target_tool_id, source_tool_id, payload) {
                return {
                    'id': mt.common.createGuid(),
                    'target': target_usr,
                    'targetToolId': target_tool_id,
                    'source': getUserIdFromLocalStorage(),
                    'sourceSection': getSectionIdFromLocalStorage(),
                    'sourceToolId': source_tool_id,
                    'data': payload
                };
            },
            toggleOfflineMode: function(offline) {
                offlineMode = offline;
            }
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';


    var MtRibbonItemService = [function () {
        var MtRibbonItemService = {};

        var itemType = {            //decide on builder API
            SEPERATOR: 'seperator', //DONE
            BUTTON: 'button',       //DONE
            INPUT: 'input',         //validation?
            TOGGLE: 'toggle',       //active css class
            SLIDER: 'slider',      //
            OPTIONS: 'options',      //
            POPOVER: 'popover',
            LABEL: 'label',
            CUSTOM: 'custom'
        };

        /* builder API

         newItem.type(
         name
         callback
         opts {<cssClass, isVisible>}
         <other required parameters, individual variables, getValue>
         )

         */

        MtRibbonItemService.itemType = itemType;

        MtRibbonItemService.newItem = {};

        MtRibbonItemService.newItem.seperator = function () {
            return {
                type: itemType.SEPERATOR
            };
        };
        MtRibbonItemService.newItem.label = function (
                name,
                opts,
                getValue
                ) {
            return {
                type: itemType.LABEL,
                name: name,
                opts: opts || {},
                getValue: getValue
            };
        };
        MtRibbonItemService.newItem.button = function (
                name,
                callback,
                opts
                ) {
            return {
                type: itemType.BUTTON,
                name: name,
                callback: callback,
                opts: opts || {}
            };
        };
        MtRibbonItemService.newItem.input = function (
                name,
                callback,
                opts,
                getValue
                ) {
            /**
             * opts: object with optional properties
             *   updateOnChange ->
             *   (default) true: callback executed on change,
             *   (must be defined) false: confirm button
             */
            return {
                type: itemType.INPUT,
                name: name,
                callback: callback,
                opts: opts || {},
                getValue: getValue
            };
        };
        MtRibbonItemService.newItem.toggle = function (
                name,
                callback,
                opts,
                getValue
                ) {
            return {
                type: itemType.TOGGLE,
                name: name,
                callback: callback,
                opts: opts || {},
                getValue: getValue
            };
        };
        MtRibbonItemService.newItem.slider = function (
                name,
                callback,
                opts,
                getValue
                ) {
            /**
             * opts: object with optional properties
             *   min
             *   max
             *   step
             */
            return {
                type: itemType.SLIDER,
                name: name,
                callback: callback,
                opts: opts || {},
                getValue: getValue
            };
        };

        MtRibbonItemService.newItem.option = function (
                name,
                callback,
                opts,
                getValue,
                valuesAvailable
                ) {
            /**
             * valuesAvailable: array of options [{name, cssClass}]
             */
            return {
                type: itemType.OPTIONS,
                name: name,
                callback: callback,
                opts: opts || {},
                getValue: getValue,
                valuesAvailable: valuesAvailable
            };
        };

        MtRibbonItemService.newItem.popover = function (
            name,
            popover,
            opts
            ) {
            return {
                type: itemType.POPOVER,
                name: name,
                popover: popover,
                opts: opts || {}
            };
        };

        MtRibbonItemService.newItem.custom = function (name, htmlTemplate, opts) {
            return {
                type: itemType.CUSTOM,
                name: name,
                htmlTemplate: htmlTemplate,
                opts: opts || {}
            };
        };

        return MtRibbonItemService;
    }];

    angular.module('mt.common')
            .service('MtRibbonItemService', MtRibbonItemService);

})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('ribbonMenuAnimationService', function ($animate) {

        this.slideDown = function(element) {
            $animate.addClass(element, 'mt-ribbon-slide-down');
            $animate.removeClass(element, 'mt-ribbon-slide-up');
        };

        this.slideUp = function(element) {                
            $animate.addClass(element, 'mt-ribbon-slide-up');
            $animate.removeClass(element, 'mt-ribbon-slide-down');
        };

    });
})(window.mt.common);
(function (ns) {
    'use strict';

    angular.module('mt.common').service('roleService', function ($location, sessionService, localStorageService) {

        var AVAILABLE_ROLES = [ns.TEACHER_ROLE, ns.STUDENT_ROLE, ns.CONTENT_AUTHOR_ROLE];

        var role = $location.search().role;
        if (!_(AVAILABLE_ROLES).contains(role)) {
            role = mt.common.STUDENT_ROLE;
        }

        return {
            getAvailableRoles: function () {
                return AVAILABLE_ROLES;
            },
            getRole: function () {
                return role;
            },
            setRole: function(newRole) {
                var sessionData = localStorageService.loadSessionData(sessionService.getSessionId());
                sessionData.role = newRole;
                role = newRole;
            },
            canBroadcast: function () {
                return role === ns.TEACHER_ROLE || role === ns.STUDENT_ROLE;
            },
            canReadWriteContent: function () {
                return role === ns.CONTENT_AUTHOR_ROLE || role === ns.TEACHER_ROLE;
            },
            canReadContent: function () {
                return true;
            },
            contentAppends: function () {
                return role === ns.TEACHER_ROLE;
            },
            hasAccessToAllTools: function () {
                return role === mt.common.TEACHER_ROLE || role === mt.common.CONTENT_AUTHOR_ROLE;
            },
            getBroadcastTarget: function() {
                return (role === mt.common.STUDENT_ROLE)? mt.common.TEACHER_ROLE: mt.common.STUDENT_ROLE;
            }
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    //creates a tool selection object api that interfactes with the tool menu service to set the context for the currnet selection
    angular.module('mt.common').factory('selectionApiFactory', function (toolMenuService) {
        return {
            createApi: function(clearCallback) {
                var selection;
                function clearSelection() {
                    if(clearCallback !== undefined) {
                        //call callback if it was provided to do tool-specific clearing
                        clearCallback(selection);
                    }
                    selection = undefined;
                }
                return {
                    getSelection: function() {return selection;},
                    setSelection: function(newSelection) {
                        toolMenuService.setContext(newSelection.type, clearSelection);
                        selection = newSelection;
                    },
                    clear: function () {
                        clearSelection();
                        toolMenuService.setContext();
                    }
                };
            }
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('sessionService', function () {
        this.getSessionId = function () {
            return ns.LOCAL_STORAGE_SESSION_ID;
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('toolLinkManagerService', function () {
        var linkColors = ['Coral', 'MediumSlateBlue', 'MediumSeaGreen', 'CadetBlue',  'Orchid', 'Gold'];
        var numLinks = 0;

        return {
            getLinkColor: function() {
                var col = linkColors[numLinks%linkColors.length];
                numLinks++;
                return col;
            }
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('toolPersistorService', function (broadcastService, persistorService, workspaceNavService, activeToolService) {

        function streamLineToolData(data) {
            //strip out mtValues recursively
            var newData = angular.copy(data);
            replaceValues(data, newData);
            return newData;
        }

        var mtValueFlag = 'mt_val';

        //recursive functions to streamline and restore tool data models
        function replaceValues(parentNode, newParentNode) {
            var node, key;
            //stop recursion when apply returns true or if node is a primitive or fn
            if(angular.isArray(parentNode) === false && angular.isObject(parentNode) === false) {
                return;
            }
            //recurse on nodes
            for(key in parentNode) {
                node = parentNode[key];
                if(node instanceof mt.common.MtValue) {
                    newParentNode[key] = {
                        type: mtValueFlag,
                        val: node.toString(false, true)
                    };
                } else {
                    //only continue node traversal if the node isn't an MtValue
                    replaceValues(node, newParentNode[key]);
                }
            }
        }

        function restoreValues(parentNode) {
            var node, key;
            //stop recursion when apply returns true or if node is a primitive or fn
            if(angular.isArray(parentNode) === false && angular.isObject(parentNode) === false) {
                return;
            }
            //recurse on nodes
            for(key in parentNode) {
                node = parentNode[key];
                if(angular.isObject(node) && node.type === mtValueFlag) {

                    var newVal = new mt.common.MtValue('');
                    newVal.updateFromEdit(node.val);
                    parentNode[key] = newVal;
                } else {
                    //only continue node traversal if the node isn't an MtValue
                    restoreValues(node);
                }
            }
        }

        this.registerTool = function (toolId, toolType, containerApi, serialize, deserialize) {
            var containerElement;

            function packageTool() {
                var data = streamLineToolData(serialize());

                if(containerElement === undefined) {
                    containerElement = $('#' + toolId);
                }
                var position = containerApi.getPos();

                var saveResponseEvent = {};
                saveResponseEvent.data = data;
                saveResponseEvent.type = toolType;
                saveResponseEvent.toolId = toolId;
                saveResponseEvent.position = position;
                saveResponseEvent.zIndex = containerElement.css('z-index');
                saveResponseEvent.active = activeToolService.getActiveId() === toolId;
                saveResponseEvent.name = containerApi.name.value;
                saveResponseEvent.spaceId = containerApi.spaceId;
                saveResponseEvent.size = workspaceNavService.getToolSize(toolId);

                return saveResponseEvent;
            }


            function onLoad(event) {
                //only handle load events with a matching toolId and spaceId
                if(event.data !== undefined) {
                    restoreValues(event.data);
                    deserialize(event.data);
                }

                //set position
                if(event.position !== undefined) {
                    containerApi.setPos(event.position);
                }

                //TODO, work out the best place to put this
                // if(event.active) {
                //     activeToolService.setActiveTool(toolId);
                // }

                containerApi.submittable = event.submittable;
                containerApi.submissionInfo = event.submissionInfo;
                if (event.hidden !== undefined) {
                    containerApi.isHidden = event.hidden;
                }

                if(event.name !== undefined) {
                    containerApi.name.value = event.name;
                }
            }

            persistorService.register(toolId, mt.common.TOOL_CATEGORY, containerApi.spaceId, packageTool, onLoad);

            //register tool broadcast
            containerApi.registerBroadcast(function () {
                var target = broadcastService.getTarget();
                broadcastService.broadcastTool(packageTool, {target: target});
                return target;
            });

            //request any queued data for this tool
            persistorService.applyQueuedData(toolId);

            //return packageTool callback
            return packageTool;
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    // TODO tool registry needs to behave better with separation of spaces
    angular.module('mt.common').provider('toolRegistryService', function () {

        var addTemplate = function (templates, newTemplate) {
            var templateExists = _.findWhere(templates, {type: newTemplate.type});
            if (!templateExists) {
                templates.push(newTemplate);
            } else {
                console.log('Attempted to add a tool with an existing type.');
            }
        };

        this.templates = [];

        this.addTemplate = function (template) {
            if (template.available === undefined) {
                template.available = true;
            }
            addTemplate(this.templates, template);
        };

        this.$get = function () {
            var templates = angular.copy(this.templates);

            return {
                setTemplates: function (newTemplates) {
                    templates = newTemplates;
                },

                getTemplates: function () {
                    return templates;
                },

                addTemplate: function (template) {
                    addTemplate(templates, template);
                },

                removeTemplateType: function (type) {
                    templates = _(templates).reject(function (template) {
                        return template.type === type;
                    });
                },

                setAvailableTools: function (types) {
                    _(templates).each(function (template) {
                        template.available = _(types).contains(template.type);
                    });
                },

                getTemplate: function (type) {
                    return _(templates).findWhere({type: type});
                },

                getNextName: function(type) {
                    var template = _(templates).findWhere({type: type});

                    if (!angular.isNumber(template.numberCreated)) {
                        template.numberCreated = 0;
                    }

                    template.numberCreated += 1;

                    return template.displayName + ' ' + template.numberCreated;
                }
            };
        };
    });
    //JMT - commenting this out until we're really using the image tool
    // angular.module('mt.common').config(function (toolRegistryServiceProvider) {
    //     var template = {
    //         id: 'imageToolbarItem',
    //         type: mt.common.TYPE_IMAGE,
    //         displayName: 'Image',
    //         available: true,
    //         htmlTemplate: '<mt-image tool-id="toolId" id="tool-{{toolId}}" container-api="containerApi"></mt-image>'
    //     };
    //     toolRegistryServiceProvider.addTemplate(template);
    // });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('undoService', function (preconfiguredToolService, eventingService, toolRegistryService, $timeout, MtRibbonItemService, ribbonMenuAnimationService, persistorService, workspacePageService) {
        function getTools() {
            var allTools = persistorService.getTools();
            var tools = _.filter(allTools, function(tool) {return tool.toolCategory === mt.common.TOOL_CATEGORY;});
            tools = _.filter(tools, function(tool) {
                var template = toolRegistryService.getTemplate(tool.type);
                //do not include any tools that have undo disabled
                return template.undoDisabled !== true;
            });

            var globals = _.filter(allTools, function(tool) {return tool.toolCategory !== mt.common.TOOL_CATEGORY;});

            return {tools: tools, globals: globals};
        }

        //load a certain stack of data based on the current stack and undoOffset
        function loadStackData(undo) {
            var index = stack.length - 1 - undoOffset;
            var fromIndex = index + 1;
            if(undo === false) {
                fromIndex = index - 1;
            }

            var newData = stack[index];
            var oldData = stack[fromIndex];

            var newPageIndex = workspacePageService.getPageIndexById(newData.pageId);
            if(newPageIndex >= 0) {
                workspacePageService.setActivePage(newPageIndex);
            }

            //add tools and data
            newData.tools.forEach(function (tool) {
                preconfiguredToolService.addToolWithData(tool);
            });

            //remove any deleted tools
            oldData.tools.forEach(function (tool) {
                if(_.findWhere(newData.tools, {toolId: tool.toolId}) === undefined) {
                    preconfiguredToolService.removeTool(tool.toolId);
                }
            });

            //apply global data (annotations etc)
            newData.globals.forEach(function (global) {
                persistorService.loadData(global.toolId, global);
            });
        }

        var stackSize = 10;
        //just making the stack a fixed size array
        var stack = [];
        //the number of consecutive undos we have done is stored as an offset to allow redos
        var undoOffset = 0;

        var self = this;

        this.undo = function () {
            //if this is the first undo - save the stack so that we can get back to it
            if(undoOffset === 0) {
                self.save();
            }

            if(self.canUndo() === false) {
                return;
            }

            undoOffset++;
            loadStackData(true);
        };

        this.redo = function () {
            if(self.canRedo() === false) {
                return;
            }
            undoOffset = Math.max(0, undoOffset-1);
            loadStackData(false);

            //if redoing to the top of the stack, remove the top most state
            //to avoid it being duplicated if we undo again
            if(undoOffset === 0) {
                stack.splice(stack.length - 1, 1);
            }
        };

        this.canUndo = function() {
            return stack.length - 1 - undoOffset > 0;
        };

        this.canRedo = function() {
            return undoOffset >= 1;
        };

        this.save = function (notificationText) {
            //toggle this off so that the undo notification is only there while
            //the associated state is at the top of the undo stack
            this.toggleNotification(false);

            var data = getTools();
            data.pageId = workspacePageService.getActivePageId();

            //trim the start and end of the stack
            var startTrim = Math.max(0, stack.length - stackSize - undoOffset);
            stack = stack.splice(startTrim, stack.length - startTrim - undoOffset);

            stack.push(data);
            undoOffset = 0;

            if(notificationText !== undefined) {
                this.toggleNotification(true, notificationText);
            }
        };

        //undo notifications
        var notificationActive = false;
        var notificationText = '';

        //time (ms) before notification ribbon disappears
        var notificationTime = mt.common.NOTIFICATION_TIMEOUT;

        var undoService;
        //doing this to avoid circular dependency
        this.registerUndoService = function(service) {
            undoService = service;
        };

        this.isNotificationActive = function () {
            return notificationActive;
        };

        this.toggleNotification = function (activate, text) {
            notificationText = text;
            if(activate === undefined) {
                activate = !notificationActive;
            }

            if(activate === true) {
                $timeout(function() {
                    self.toggleNotification(false);
                }, notificationTime);
            }

            notificationActive = activate;
        };

        var undoCssClass = 'mt-ribbon-menu-undo';
        this.getNotificationRibbon = function() {
            var ribbon = {cssClass: undoCssClass};
            ribbon.items = {};
            ribbon.items.left = [];
            ribbon.items.center = [
                MtRibbonItemService.newItem.label('Notification', {}, function() {
                    return notificationText;
                })];
            ribbon.items.right = [
                MtRibbonItemService.newItem.button('OK', function() {self.toggleNotification(false);}, {}),
                MtRibbonItemService.newItem.seperator(),
                MtRibbonItemService.newItem.button('Undo', function() {self.undo();}, {cssClass:'mt-notification-undo-button'})
            ];

            return ribbon;
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    //manage the abstract that is presented in the abstract panel
    angular.module('mt.common').service('workspaceAbstractService', function ($location, persistorService, postMessageService, environmentService, preconfiguredToolService, workspacePageService) {


        var curAbstract = {};
        var isOpen = false;
        var setCallbacks = [];

        this.getAbstract = function () {
            return curAbstract;
        };

        var self = this;
        this.setAbstract = function (abstract) {
            //for backwards compatibility only disable the abstract if it is explicitly disabled in model
            if(abstract.hasAbstract !== false) {
                self.enableAbstract(true);
            } else {
                self.enableAbstract(false);
            }

            curAbstract = abstract;
            _.each(setCallbacks, function(callback) {
                callback(abstract);
            });
            self.toggle(true);
            if(self.isSubmissionDisplayed()) {
                self.toggleSubmissionDisplay();
            }
        };

        postMessageService.registerSetAbstract(this.setAbstract);

        //register with this service to receive a notification of a changed abstract
        this.registerSetCallback = function (callback) {
            setCallbacks.push(callback);
        };

        this.toggle = function (open) {
            if(open === undefined) {
                open = !isOpen;
            }
            //prevent abstract when it is disabled
            if(open === true && abstractEnabled === false) {
                return;
            }
            isOpen = open;
        };

        this.isOpen = function () {
            return isOpen;
        };

        this.submitTool = function(toolId) {
            this.toggle(true);
            var tool = persistorService.getToolById(toolId);
            if(curAbstract.submittedTools === undefined) {
                curAbstract.submittedTools = [];
            }
            curAbstract.submittedTools.push(tool);
            this.setAbstract(curAbstract);

            this.updateCDA();
        };

        this.updateCDA = function() {
            postMessageService.sendSubmissionsToCda(curAbstract);
        };

        this.submitWorkspace = function() {
            this.toggle(true);
            curAbstract.submittedWorkspace = persistorService.getTools();
            this.setAbstract(curAbstract);
            this.updateCDA();
        };

        var viewingSubmission = false;
        var liveWorkbook;
        function loadWorkspace(tools) {
            var workspaceApi = environmentService.getSpaceApi(mt.common.DEFAULT_SPACE_ID);
            workspaceApi.clear();
            _.each(tools, function(tool) {
                if(tool.toolCategory === mt.common.TOOL_CATEGORY) {
                    preconfiguredToolService.addToolWithData(tool);
                } else {
                    persistorService.loadData(tool.toolId, tool);
                }
            });
        }

        this.toggleSubmissionDisplay = function() {
            if(viewingSubmission === false) {
                if(curAbstract.submittedWorkspace === undefined) {
                    console.log('submitted workspace not defined');
                    return;
                }
                liveWorkbook = persistorService.getTools();
                loadWorkspace(curAbstract.submittedWorkspace);
            } else {
                if(liveWorkbook === undefined) {
                    console.log('live workspace not defined');
                    return;
                }
                loadWorkspace(liveWorkbook);
                liveWorkbook = undefined;
            }
            viewingSubmission = !viewingSubmission;
            workspacePageService.setSubmissionView(viewingSubmission);
        };

        this.isSubmissionDisplayed = function() {
            return viewingSubmission;
        };

        var abstractEnabled = $location.search().abstract === 'true';

        this.isEnabled = function() {
            return abstractEnabled;
        };

        this.enableAbstract = function(enable) {
            abstractEnabled = enable;
            if(abstractEnabled === false) {
                this.toggle(false);
            }
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('workspaceNavService', function (configService, activeToolService) {
        var viewPort;

        var zooming = false;
        var zoomSteps = mt.common.ZOOM_LEVELS;
        var zoomLevel = 0;
        //translation
        var wsPos = [0, 0];

        var canvasSize = [mt.common.IPAD_WIDTH*mt.common.TOOLSPACE_VIEWPORTS, mt.common.IPAD_HEIGHT*mt.common.TOOLSPACE_VIEWPORTS];

        var dragStartPos;
        var totalDrag = 0;
        var cumulativeScale = 1;

        var self = this;
        var tools = [];

        var updateCallbacks = [];
        //register callbacks with an id so we can override when required
        this.registerUpdateCallback = function (callback, id) {
            console.log('registered nav update callback ' + id);
            var callbackEntry = _.findWhere(updateCallbacks, {id:id});
            if(callbackEntry === undefined) {
                updateCallbacks.push({callback: callback, id: id});
            } else {
                callbackEntry.callback = callback;
            }
        };

        //applies new workspace nav params by calling all update callbacks
        this.update = function () {
            for(var i in updateCallbacks) {
                updateCallbacks[i].callback();
            }
        };

        //fn for testing only
        this.setZoomSteps = function (steps) {
            zoomSteps = steps;
        };

        this.setViewPort = function (vp) {
            viewPort = vp;
        };

        this.getNavStyle = function () {
            var scale = this.getScale();
            var trans = [wsPos[0]*scale, wsPos[1]*scale];
            var style = {
                '-webkit-transform': 'translate3d(' + trans[0] + 'px, ' + trans[1] + 'px, 0) scale(' + scale +', ' + scale + ')'
            };
            if(zooming === true) {
                style['-webkit-transition'] = '-webkit-transform 0.5s ease-in';
            } else {
                style['-webkit-transition'] = 'none';
            }
            return style;
        };

        this.pinch = function (x, y, scale) {
            //determine whether to pinch or drag
            var pos = [x, y - mt.common.NAV_HEIGHT];
            cumulativeScale *= scale;
            if(Math.abs(cumulativeScale-1) > 0.4) {
                this.zoom(pixelToCanvas(pos));
            }
        };

        this.drag = function (x, y) {
            var pos = [x, y - mt.common.NAV_HEIGHT];
            panWorkspace(pos);
            this.update();
        };

        this.release = function () {
            dragStartPos = undefined;
            totalDrag = 0;
            cumulativeScale = 1;
        };

        //to allow tools to constrain their tool dragging
        this.constrainToolPos = function (pos, toolContainer, noSnap) {
            if(noSnap !== true) {
                snapToolPos(pos);
            }
            var toolSize = [toolContainer.width(), toolContainer.height()];
            var toolPosMargins = [0, snapSize*3];
            for(var i = 0; i < 2; i++) {
                pos[i] = Math.max(toolPosMargins[i], Math.min(canvasSize[i]-toolSize[i], pos[i]));
            }
        };

        var snapSize = mt.common.WORKSPACE_GRID_SIZE;
        function snapToolPos(pos) {

            if(configService.noOverlaps !== true) {
                pos[0] = Math.round(pos[0]/snapSize)*snapSize;
                pos[1] = Math.round(pos[1]/snapSize)*snapSize;
            }
        }

        //return viewport bounding box [min, max] as a proportion of full toolspace
        this.getFractionalBounds = function () {
            var scale = this.getScale();
            var viewPortSize = [viewPort.width()/scale, viewPort.height()/scale];

            var min = [-wsPos[0]/canvasSize[0], -wsPos[1]/canvasSize[1]];
            var max = [(-wsPos[0]+viewPortSize[0])/canvasSize[0], (-wsPos[1]+viewPortSize[1])/canvasSize[1]];
            return [min, max];
        };

        this.getToolBounds = function() {
            return tools;
        };
        this.getMappedToolBounds = function(includeActive) {
            return _.map(tools, function(tool) {
                var bounds = {
                    heightPercentage: tool.heightPercentage,
                    leftPercentage: tool.leftPercentage,
                    topPercentage: tool.topPercentage,
                    widthPercentage: tool.widthPercentage
                };
                if(includeActive === true) {
                    bounds.isActive = tool.isActive;
                }
                return bounds;
            });
        };

        this.registerTool = function(id, toolPos, toolContainer){
            tools.push({toolId:id});
            this.updateTool(id, toolPos, toolContainer);
            if(activeToolService.getActiveId() === id) {
                setActiveTool(id);
            }
        };

        this.updateTool = function(id, toolPos, toolContainer){
            var tool = _.findWhere(tools, {toolId: id});

            var width = toolContainer.width();
            var height = toolContainer.height();
            var left = toolPos[0];
            var top = toolPos[1];

            //precentages are adjusted by 1% due to hidden overlap...looks better
            tool.container = toolContainer;
            tool.pos = toolPos;
            tool.widthPercentage = width/canvasSize[0]*100 - 1;
            tool.heightPercentage = height/canvasSize[1]*100 - 1;

            tool.leftPercentage = 100 - (-left + canvasSize[0])/canvasSize[0]*100;
            tool.topPercentage = 100 - (-top + canvasSize[1])/canvasSize[1]*100;

            //trigger visual update on nav indicator
            this.update();
        };

        this.unregisterTool = function(id){
            var tool = _.findWhere(tools, {toolId: id});
            var index = tools.indexOf(tool);
            tools.splice(index, 1);
            this.update();
        };

        var nudgeMargin = mt.common.TOOL_NUDGE_MARGIN;
        //find nudge vector, in a specific direction (N,S,E,W), for a tool tool (pos, max) s.t. it does not overlap another tool (toolPos, toolMax)
        function calcToolNudge(pos, max, toolPos, toolMax, moveDir) {
            var nudge = [0,0];
            if(moveDir === 'N') {
                nudge[1] = Math.min(0, toolPos[1] - max[1] - nudgeMargin);
            } else if(moveDir === 'S') {
                nudge[1] = Math.max(0, toolMax[1] - pos[1] + nudgeMargin);
            } else if(moveDir === 'W') {
                nudge[0] = Math.min(0, toolPos[0] - max[0] - nudgeMargin);
            } else if(moveDir === 'E') {
                nudge[0] = Math.max(0, toolMax[0] - pos[0] + nudgeMargin);
            }

            return nudge;
        }

        //These in bounds functions are equivalent but use different input variables for convenience
        function isNudgeInBounds(nudge, pos, max) {
            return (pos[0]+nudge[0]) >= 0 && (pos[1]+nudge[1]) >= 0 &&  (max[0]+nudge[0]) <= canvasSize[0] && (max[1]+nudge[1]) <= canvasSize[1];
        }

        function isInBounds(pos, container) {
            return pos[0] >= 0 && pos[1] >= 0 &&  (pos[0] + container.width()) <= canvasSize[0] && (pos[1] + container.height()) <= canvasSize[1];
        }

        //factor to increase tendency to nudge in horiz over vertical direction
        var horizNudgeWeight = 2.0;
        function isSmallerNudge(nudge, prevNudge) {
            return (nudge[0]*nudge[0]/horizNudgeWeight + nudge[1]*nudge[1]) < (prevNudge[0]*prevNudge[0]/horizNudgeWeight + prevNudge[1]*prevNudge[1]);
        }

        function getWeightedDistSq(posA, posB) {
            return (posA[0] - posB[0])*(posA[0] - posB[0])/horizNudgeWeight + (posA[1] - posB[1])*(posA[1] - posB[1]);
        }

        //find nudge vector, for one of a set of diections (minimizing nudge), for a tool tool (pos, max) s.t. it does not overlap another tool (toolPos, toolMax)
        function calcToolNudgeStep(pos, max, toolPos, toolMax, moveDirs) {
            var nudge;
            _.each(moveDirs, function(dir) {
                var dirNudge = calcToolNudge(pos, max, toolPos, toolMax, dir);
                if(isNudgeInBounds(dirNudge, toolPos, toolMax) && (nudge === undefined || isSmallerNudge(dirNudge, nudge))) {
                    nudge = dirNudge;
                }
            });
            return nudge;
        }

        //return a nudge vector describing the minimum nudge to be applied, in a specified set of directions, in order to avoid overlaps
        function findToolNudge(id, pos, size, moveDirs) {
            var max = [pos[0] + size[0], pos[1] + size[1]];
            var nudge = [0,0];
            //just looping, but using find so that we can break
            _.find(tools, function(tool) {
                if(tool.toolId === id) {
                    return false;
                }
                var toolMax =[tool.pos[0] + tool.container.width(), tool.pos[1] + tool.container.height()];
                if(mt.common.checkBoxOverlap(pos, max, tool.pos, toolMax)) {
                    nudge = calcToolNudgeStep(pos, max, tool.pos, toolMax, moveDirs);
                    return true;
                } else {
                    return false;
                }
            });
            return nudge;
        }

        this.getToolSize = function(id) {
            var size = [0,0];
            var tool = _.findWhere(tools, {toolId: id});
            if(tool !== undefined && tool.container !== undefined) {
                size = [tool.container.width(), tool.container.height()];
            }
            return size;
        };

        var allDirs = [['N', 'E'], ['N', 'W'], ['S', 'E'], ['S', 'W']];

        //allow tool fit algorithm to be disabled for optimization
        var toolFitEnabled = true;
        this.setToolFit = function(enabled) {
            toolFitEnabled = enabled;
        };

        this.findToolPosition = function(id, toolPos, toolContainer) {
            self.constrainToolPos(toolPos, toolContainer);

            if(configService.noOverlap !== true || toolFitEnabled === false) {
                return toolPos;
            }

            var newToolPos;
            var minDistSq;
            //try to nudge in all directions taking the best in bound fit
            _.each(allDirs, function(moveDirs) {
                var testPos = self.findToolPositionInDirs(id, toolPos, toolContainer, moveDirs);

                if(testPos === undefined || isInBounds(testPos, toolContainer) === false) {
                    return;
                }
                var testDistSq = getWeightedDistSq(testPos, toolPos);
                if(newToolPos === undefined || testDistSq < minDistSq) {
                    newToolPos = testPos;
                    minDistSq = testDistSq;
                }
            });

            //unlikely that we can't find a tool position but if we can't just use the original one
            if(newToolPos === undefined) {
                newToolPos = toolPos;
            }
            return newToolPos;
        };

        this.findToolPositionInDirs = function(id, toolPos, toolContainer, moveDirs) {
            var size = [toolContainer.width(), toolContainer.height()];
            var count = 0;
            var lastNudge = [1,1];

            var newToolPos = [toolPos[0], toolPos[1]];
            while(count < 10 && (lastNudge[0] !== 0 || lastNudge[1] !== 0)) {
                lastNudge = findToolNudge(id, newToolPos, size, moveDirs);
                if(lastNudge === undefined) {
                    //no inbound nudge found
                    return;
                }
                newToolPos[0] += lastNudge[0];
                newToolPos[1] += lastNudge[1];
                count++;
            }
            return newToolPos;
        };

        function setActiveTool(activeId) {
            _.each(tools, function(tool) {
                if(tool.toolId === activeId) {
                    tool.isActive = true;
                } else {
                    tool.isActive = false;
                }
            });

            //trigger visual update on nav indicator
            self.update();
        }

        var zoomTime = 1000; //ms
        this.zoom = function (canvasPos, forceZoomIn) {
            if(zooming === true ) {
                return;
            }
            var oldZoomLevel = zoomLevel;

            if(forceZoomIn === true) {
                zoomLevel = 0;
            } else {
                if(cumulativeScale > 1) {
                    zoomLevel -= 1;
                } else {
                    zoomLevel += 1;
                }
            }

            cumulativeScale = 1;
            zoomLevel = Math.min(zoomSteps.length-1, Math.max(0, zoomLevel));

            if(zoomLevel !== oldZoomLevel) {
                calcZoomTranslation(this.getScale(), canvasPos);
                zooming = true;

                this.update();

                setTimeout(function() {
                    zooming = false;
                    self.update();
                }, zoomTime);
            }
        };

        this.isZoomedOut = function () {
            return zoomLevel !== 0;
        };

        this.getScale = function () {
            return zoomSteps[zoomLevel];
        };

        this.getPos = function() {
            return [-wsPos[0], -wsPos[1]];
        };

        this.getCanvasCenter = function () {
            return [canvasSize[0] / 2, canvasSize[1] / 2];
        };

        this.centerViewPortOnCanvas = function () {
            calcZoomTranslation(this.getScale(), this.getCanvasCenter());
            this.update();
        };

        var animateTime = 500;
        function animateView() {
            zooming = true;
            setTimeout(function() {
                zooming = false;
                self.update();
            }, animateTime);
        }

        function applyViewMove(animate) {
            isBatching = false;
            if(animate) {
                animateView();
            }
            calcZoomTranslation(self.getScale(), batchMovePos);
            self.update();
        }

        //batch move requests together over some time period
        var moveBatchTime = 50; //ms
        var isBatching = false;
        var batchMovePos;
        this.moveViewport = function (pos, animate) {
            if(isBatching === false) {
                isBatching = true;
                batchMovePos = pos;
                setTimeout(function() {
                    applyViewMove(animate);
                }, moveBatchTime);
            } else {
                batchMovePos = pos;
            }
        };

        this.getNextToolPos = function(toolElement) {
            var toolSize = [toolElement.width(), toolElement.height()];
            var viewPortSize = [viewPort.width(), viewPort.height()];

            var pos = this.getPos();
            pos[0] += viewPortSize[0]/2 - toolSize[0]/2;
            pos[1] += viewPortSize[1]/2 - toolSize[1]/2;

            return pos;
        };

        function panWorkspace (pos) {
            if(dragStartPos === undefined) {
                dragStartPos = pos;
                return;
            }
            wsPos[0] += pos[0] - dragStartPos[0];
            wsPos[1] += pos[1] - dragStartPos[1];

            totalDrag += Math.abs(pos[0] - dragStartPos[0] + pos[1] - dragStartPos[1]);

            constrainWorkspaceTranslation();

            dragStartPos = pos;
        }

        function calcZoomTranslation(zoom, canvasPos) {
            var winCenter = [viewPort.width()/2, viewPort.height()/2];

            wsPos[0] = - canvasPos[0] + winCenter[0]/zoom;
            wsPos[1] = - canvasPos[1] + winCenter[1]/zoom;

            constrainWorkspaceTranslation();
        }

        //apply max and mins to keep withing the canvas
        function constrainWorkspaceTranslation() {
            var viewPortSize = [viewPort.width(), viewPort.height()];
            var scale = zoomSteps[zoomLevel];

            for(var i = 0; i < 2; i++) {
                wsPos[i] = Math.min(0, Math.max(-canvasSize[i]+viewPortSize[i]/scale, wsPos[i]));
            }
        }

        function pixelToCanvas(pixPos) {
            var scale = zoomSteps[zoomLevel];
            return [pixPos[0]/scale-wsPos[0], pixPos[1]/scale-wsPos[1]];
        }

        activeToolService.registerCallback(setActiveTool);
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    //service for controlling the annotation directives
    angular.module('mt.common').service('workspacePageService', function (workspaceNavService, persistorService, environmentService, preconfiguredToolService, activeToolService, $timeout) {
        //this data should
        var pages = [];
        var activePageIndex;
        var self = this;

        //initialize data model with a empty page
        function init() {
            self.addPage();
            //set the current active page to this one
            self.setActivePage(0, false);
        }

        var maxPages = 7;
        //add an empty page onto the pages array
        this.addPage = function() {
            if(pages.length >= maxPages) {
                return;
            }
            var page = {
                id: ns.createGuid(),
                globalTools: [],
                instantiatedTools: [],
                toolBounds: []
            };
            pages.push(page);
            return page;
        };

        //accessing pages by id
        this.getPageIndexById = function(id) {
            var page = _.findWhere(pages, {id:id});
            return pages.indexOf(page);
        };

        this.getActivePageId = function() {
            return pages[activePageIndex].id;
        };

        //change the active page
        //  caches the old pages data first according to savePreviousPage flag
        //  clears the current workspace data and loads the data for the new tool page
        this.setActivePage = function (index, savePreviousPage, init) {
            if(init !== true && index === activePageIndex) {
                return;
            }
            // cache the outgoing ctive page
            if(savePreviousPage !== false && activePageIndex !== undefined) {
                self.updateActivePageData();

                _.each(clearFns, function(clearFn) {
                    clearFn();
                });
            }

            activePageIndex = index;

            //clear data instantiated tools

            var newData = pages[activePageIndex];

            //load tools from a timeout so that there is visual indication of page change without waiting for tools to load
            $timeout(function() {
                loadTools(newData);
            });
        };

        function loadTools(newData) {
            workspaceNavService.setToolFit(false);

            var activeToolId;
            //load the tools
            _.each(newData.instantiatedTools, function(toolData) {
                if(toolData.active === true) {
                    activeToolId = toolData.toolId;
                }
                //load instantiated tools
                preconfiguredToolService.addToolWithData(toolData, true);
            });
            _.each(newData.globalTools, function(toolData) {
                setTimeout(function() {
                    persistorService.loadData(toolData.toolId, toolData);
                });
            });

            activeToolService.setActiveTool(activeToolId);
            workspaceNavService.setToolFit(true);
        }

        this.getActivePageIndex = function () {
            return activePageIndex;
        };

        //update the data in the active page from the live workspace tools
        this.updateActivePageData = function (spaceId) {
            if(spaceId === undefined) {
                spaceId = ns.DEFAULT_SPACE_ID;
            }

            var allTools = _.filter(persistorService.getTools(), function(tool) {
                return tool.spaceId === spaceId;
            });

            var activePage = pages[activePageIndex];
            if(activePage === undefined) {
                console.log('no active page ', activePageIndex, pages);
                return;
            }

            activePage.instantiatedTools = _.filter(allTools, function(tool){ return tool.toolCategory === mt.common.TOOL_CATEGORY;});
            activePage.globalTools = _.filter(allTools, function(tool){ return tool.toolCategory !== mt.common.TOOL_CATEGORY;});
            activePage.toolBounds = workspaceNavService.getMappedToolBounds();
            return activePage;
        };

        this.setPages = function(pageData) {
            pages = pageData;
        };

        this.getPages = function() {
            return pages;
        };

        //control visibility of pages
        var pagesVisible = false;
        this.showPages = function() {
            return pagesVisible && submissionView !== true;
        };
        this.toggleShowPages = function(show) {
            if(show === undefined) {
                show = !pagesVisible;
            }
            pagesVisible = show;
        };

        var submissionView = false;
        this.setSubmissionView = function(viewingSubmission) {
            console.log('submissionView ' + viewingSubmission);
            submissionView = viewingSubmission;
        };

        var clearFns = [];
        this.registerClearFn = function (callback) {
            clearFns.push(callback);
        };


        init();
    });
})(window.mt.common);

(function (ns) {
    'use strict';

    angular.module('mt.common').service('workspaceSelectionService', function () {
//        var hold = false,
        var SELECTED_CLASS = 'selectedTool',
            selectorActive = false;

        this.deselectAll = function () {
            $('.' + SELECTED_CLASS).removeClass(SELECTED_CLASS);
        };

        this.select = function (toolId) {
            $('#' + toolId).addClass(SELECTED_CLASS);
        };

// Only necessary for the James interaction, currently commented out
//        this.startHold = function () {
//            hold = true;
//            this.deselectAll();
//        };
//
//        this.endHold = function () {
//            hold = false;
//        };
//
//        this.isHeld = function () {
//            return hold;
//        };

        this.toggleSelector = function (activate) {
            if (activate !== undefined) {
                selectorActive = activate;
            } else {
                selectorActive = !selectorActive;
            }
        };

        this.isSelectorActive = function () {
            return selectorActive;
        };
    });
})(window.mt.common);

(function (ns) {
    'use strict';
    ns.getToolApi = function(toolId) {
        return $('#' + toolId).isolateScope().API();
    };

    ns.getWorkspaceApi = function() {
        var workspaceScope = $('mt-workspace').scope();
        if (workspaceScope) {
            return workspaceScope.API();
        } else {
            return undefined;
        }
    };
})(window.mt.common);

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
