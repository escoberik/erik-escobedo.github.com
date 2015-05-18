(function() {
    'use strict';
    //math tools template for registering the tool
    var template = {
        type: 'ResizeRectangleTool',
        displayName: 'Rectangle Resizer',
        htmlTemplate: '<resize-rectangle-tool tool-id="rectangleAppId" container-api="containerApi" id="tool-{{toolId}}"></resize-rectangle-tool>',
        exportTargets: ['table'],
        applet: true
    };

    //add the module as a math tool dependency
    window.mt.loadModules.push('resizeRectangleToolModule');

    angular.module('resizeRectangleToolModule', ['mt.common'])
        .config(function (toolRegistryServiceProvider) {
            toolRegistryServiceProvider.addTemplate(template);
        })
        .directive('resizeRectangleTool', function() {
            return {
                scope: {
                    toolId: '=',
                    containerApi: '='
                },
                replace: true,
                restrict: 'E',
				link: function(scope, element, attr)
				{

				},
                controller: 'reizeRectangleController',
                template: '<div> <button ng-click="reset()" style="position: relative; left:50px; top: 10px; padding: 5px;">Reset</button> <div id="container" style=" position: relative;  top:10px; width:400px; height:400px;"></div></div>'
            };
        })
        .controller('reizeRectangleController', function($scope, $element, toolPersistorService, dataExchangeService) {
            var serializeFn = function() {
                return $scope.textState;
            };
            var deserializeFn = function(data) {
                $scope.textState = data;
            };

            toolPersistorService.registerTool($scope.toolId, template.type, $scope.containerApi, serializeFn, deserializeFn);

            var exportFn = function() {
                return {
                    headers: [''],
                    rows: [[$scope.textState]]
                };
            };
            var importFn = function(data) {
                if(data.rows[0] !== undefined && data.rows[0][0] !== undefined) {
                    $scope.textState = data.rows[0][0];
                }
            };

            dataExchangeService.registerTool($scope.toolId, template.type, exportFn, importFn, $scope.containerApi, template.exportTargets);

			console.log = function() {};




/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js from "rectangle_files.txt" begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/* Last merge : Thu Aug 28 15:05:01 PKT 2014  */

/* Merging order :

- Ruler.js
- PopupMenu.js
- RectangleLayer.js
- SplitRect.js
- GridLayer.js
- HandlesLayer.js
- MenuLayer.js

*/


/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: Ruler.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function Ruler(pos, isHorizontal, panel, width, units, rectangleLayer, gridLayer)
{

	this.rectangleLayer = rectangleLayer;
	this.gridLayer = gridLayer;

	this.pos = pos;
	this.units = units;
	this.unitLines = [];
	this.rulerLine;
	this.panel = panel;
	this.handle;
	this.isHorizontal = isHorizontal;
	this.width = width;
	this.height = 10;
	this.linePadding = 6;


	var handleRadius = 8;

	var self = this;


	//Helper Function to make line path string
	var getLinePath = function(x1, y1, x2, y2)
	{
		 return "M " + x1 + " " + y1 + " l " + x2 + " " + y2 + " z";
	}


	this.redrawHorRuler = function()
	{
		//Remove current ruler and draw new ruler
		if(self.rulerLine != undefined)
			self.rulerLine.remove();

		for(var k = 0; k < self.unitLines.length; k++)
		{
			self.unitLines[k].remove();
		}

		//Create Ruler Line
		var line = getLinePath(self.pos.x, self.pos.y + self.height/2, self.width + self.linePadding , 0);
		self.rulerLine = self.panel.path(line);
		self.rulerLine.attr("stroke", "#db00fa");

		self.unitLines = [];

		//Create Ruler Unit Lines
		var unit = self.width/self.units;
		for(var i = 0; i <= self.units; i++)
		{
			var unitLine = getLinePath(self.pos.x + (unit * i), pos.y, 0, self.height)
			var ul = self.panel.path(unitLine);
			ul.attr("stroke", "#db00fa");
			self.unitLines.push(ul);
		}
	}

	this.redrawVerRuler = function()
	{
		//Remove current ruler and draw new ruler
		if(self.rulerLine != undefined)
			self.rulerLine.remove();

		for(var k = 0; k < self.unitLines.length; k++)
		{
			self.unitLines[k].remove();
		}

		//Create Ruler Line
		var x1 = self.pos.x + self.height/2;
		var y1 = self.pos.y;
		var x2 = 0;
		var y2 = self.width + self.linePadding;

		var line = getLinePath(x1, y1, x2, y2);

		self.rulerLine = self.panel.path(line);
		self.rulerLine.attr("stroke", "#db00fa");

		//Create unit lines
		self.unitLines = [];

		var unit = self.width/self.units;
		for(var i = 0; i <= self.units; i++)
		{
			var unitLine = getLinePath(self.pos.x, self.pos.y + (unit * i), self.height, 0);
			var ul = self.panel.path(unitLine);
			ul.attr("stroke", "#db00fa");
			self.unitLines.push(ul);
		}
	}


	this.horizontal_start = function()
	{
		this.ox = this.attr("cx");
		this.oy = this.attr("cy");
		this.w = self.width;
		this.attr({r: 12}); //greg
	}

	this.horizontal_move = function(dx, dy)
	{
		var x = this.ox + dx;
		var w = this.w + dx;

		//if(w <= self.rectangleLayer.getWidth())
		if(w <= self.gridLayer.unitWidth)
			return;

		//if(x > this.ox && self.gridLayer.cellSize.x >= self.rectangleLayer.getWidth())
		if(x > this.ox && self.gridLayer.cellSize.x >= self.gridLayer.unitWidth)
			return;

		this.attr({cx: x, cy: this.oy});


		self.width = w;
		self.gridLayer.setWidth(w);
		self.redrawHorRuler();
	}

	this.horizontal_up = function()
	{
		var distances = [];
		this.attr({r: 8}); //greg
		var pos = 0;
		//var rw = self.rectangleLayer.getWidth();
		var rw = self.gridLayer.unitWidth;
		for(var i = 0; i < self.gridLayer.cellCount.x; i ++)
		{
			pos += self.gridLayer.cellSize.x;
			var d = 0;
			if(pos > rw)
			{
				d = pos - rw;
			}
			else
			{
				d = rw - pos;
			}

			distances.push(d);
		}

		var smallestIndex;

		for(var k = 0; k < distances.length; k++)
		{
			if(smallestIndex == undefined)
			{
				smallestIndex = k;
			}
			else if( distances[k] < distances[smallestIndex])
			{
				smallestIndex = k;
			}
		}

		var cellSize = rw/ (smallestIndex + 1);
		self.width = cellSize * self.gridLayer.cellCount.x;
		self.gridLayer.setWidth(self.width);
		self.redrawHorRuler();
		self.handle.attr("cx", self.pos.x + self.width + self.linePadding + handleRadius + handleRadius/2);

	}



	this.vertical_start = function()
	{
		this.ox = this.attr("cx");
		this.oy = this.attr("cy");
		this.w = self.width;
		this.attr({r: 12}); //greg
	}

	this.vertical_move = function(dx, dy)
	{
		var y = this.oy + dy;
		var w = this.w + dy;

		//if(w <= self.rectangleLayer.getHeight())
		if(w <= self.gridLayer.unitHeight)
			return;

		//if(y > this.oy && self.gridLayer.cellSize.y >= self.rectangleLayer.getHeight())
		if(y > this.oy && self.gridLayer.cellSize.y >= self.gridLayer.unitHeight)
			return;

		this.attr({cx: this.ox, cy: y});


		self.width = w;
		self.gridLayer.setHeight(w);
		self.redrawVerRuler();
	}

	this.vertical_up = function()
	{
		var distances = [];
		this.attr({r: 8}); //greg
		var pos = 0;
		//var rh = self.rectangleLayer.getHeight();
		var rh = self.gridLayer.unitHeight;

		for(var i = 0; i < self.gridLayer.cellCount.y; i ++)
		{
			pos += self.gridLayer.cellSize.y;
			var d = 0;
			if(pos > rh)
			{
				d = pos - rh;
			}
			else
			{
				d = rh - pos;
			}

			distances.push(d);
		}

		var smallestIndex;

		for(var k = 0; k < distances.length; k++)
		{
			if(smallestIndex == undefined)
			{
				smallestIndex = k;
			}
			else if( distances[k] < distances[smallestIndex])
			{
				smallestIndex = k;
			}
		}

		var cellSize = rh/ (smallestIndex + 1);
		self.width = cellSize * self.gridLayer.cellCount.y;
		self.gridLayer.setHeight(self.width);
		self.redrawVerRuler();
		self.handle.attr("cy", self.pos.y + self.width + self.linePadding + handleRadius + handleRadius/2);

	}




	//setup horizontal line
	var setupHorizontalLine = function()
	{
		//Create Ruler Line
		var line = getLinePath(self.pos.x, self.pos.y + self.height/2, self.width + self.linePadding , 0);
		self.rulerLine = self.panel.path(line);
		self.rulerLine.attr("stroke", "#db00fa");

		//Create Ruler Unit Lines
		var unit = self.width/self.units;
		for(var i = 0; i <= self.units; i++)
		{
			var unitLine = getLinePath(self.pos.x + (unit * i), pos.y, 0, self.height)
			var ul = self.panel.path(unitLine);
			ul.attr("stroke", "#db00fa");
			self.unitLines.push(ul);
		}

		//Create Ruler Handle
		var cx = self.pos.x + self.width + self.linePadding + handleRadius + handleRadius/2;
		var cy = self.pos.y + self.height/2;
		console.log("<"+ cx + ", " + cy +" >");
		self.handle = self.panel.circle(
			cx,
			cy,
			handleRadius);

		self.handle.attr("stroke", "#db00fa");
		self.handle.attr("stroke-width", handleRadius);
		self.handle.attr("fill", "#fff");
		self.panel.set(self.handle).drag( self.horizontal_move,
										  self.horizontal_start,
										  self.horizontal_up);
	}

	//Setup vertical line
	var setupVerticalLine = function()
	{
		var x1 = self.pos.x + self.height/2;
		var y1 = self.pos.y;
		var x2 = 0;
		var y2 = self.width + self.linePadding;

		var line = getLinePath(x1, y1, x2, y2);

		self.rulerLine = self.panel.path(line);
		self.rulerLine.attr("stroke", "#db00fa");

		var unit = self.width/self.units;
		for(var i = 0; i <= self.units; i++)
		{
			var unitLine = getLinePath(self.pos.x, self.pos.y + (unit * i), self.height, 0);
			var ul = self.panel.path(unitLine);
			ul.attr("stroke", "#db00fa");
			self.unitLines.push(ul);
		}

		//Create Ruler Handle
		var cx = self.pos.x + self.height/2;
		var cy = self.pos.y  + self.width + self.linePadding + handleRadius + handleRadius/2;
		console.log("<"+ cx + ", " + cy +" >");
		self.handle = self.panel.circle(
			cx,
			cy,
			handleRadius);

		self.handle.attr("stroke", "#db00fa");
		self.handle.attr("stroke-width", handleRadius);
		self.handle.attr("fill", "#fff");
		self.panel.set(self.handle).drag( 	self.vertical_move,
											self.vertical_start,
											self.vertical_up );
	}

	this.init = function()
	{
		if(this.isHorizontal)
		{
			setupHorizontalLine();
		}
		else
		{
			setupVerticalLine();
		}
	}
	this.init();


	this.setUnits = function(val)
	{
		self.units = val;
		if(self.isHorizontal)
		{
			self.gridLayer.cellCount.x = val;
			self.redrawHorRuler();
			self.gridLayer.setWidth(self.width);
		}
		else
		{
			self.gridLayer.cellCount.y = val;
			self.redrawVerRuler();
			self.gridLayer.setHeight(self.width);
		}

	}

	this.setWidth = function(w)
	{
		self.width = w;
		if(this.isHorizontal)
		{
			var cx = self.pos.x + self.width + self.linePadding + handleRadius + handleRadius/2;
			var cy = self.pos.y + self.height/2;
			self.handle.attr({cx: cx, cy: cy});
			self.redrawHorRuler();

		}
		else
		{
			var cx = self.pos.x + self.height/2;
			var cy = self.pos.y  + self.width + self.linePadding + handleRadius + handleRadius/2;
			self.handle.attr({cx: cx, cy: cy});
			self.redrawVerRuler();
		}

	}


	this.hide = function()
	{
		if(self.rulerLine != undefined)
			self.rulerLine.hide();

		for(var i = 0; i < self.unitLines.length; i++)
		{
			self.unitLines[i].hide();
		}

		self.handle.hide();
	}

	this.show = function()
	{
		if(self.rulerLine != undefined)
			self.rulerLine.show();

		for(var i = 0; i < self.unitLines.length; i++)
		{
			self.unitLines[i].show();
		}

		self.handle.show();
	}

}

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: PopupMenu.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function PopupMenu(panel, position, orientation) //Orientation can be "top" or "left".
{
	this.popupBg;
	this.triangle;
	this.numberText;
	this.leftBtn;
	this.rightBtn;
	this.value = 3;

	this.panel = panel;
	this.pos = position;
	this.orientation = orientation;

	this.onValueChanged = undefined;

	var self = this;

	var popupW = 70;
	var popupH = 75;

	var triH = 5;
	var triW = 8;

	var btnTriW = popupW * 0.4;
	var btnTriH = popupW * 0.4;

	var minVal = 1;
	var maxVal = 99;


	this.setVal = function(val)
	{
		self.value = val;
		if(self.numberText != undefined)
		{
			self.numberText.attr({text : val});
		}
	}

	var onIncreaseClicked = function()
	{
		if(self.value < maxVal)
		{
			self.setVal(self.value + 1);
			if(self.onValueChanged != undefined)
			{
				self.onValueChanged(self.value);
			}
		}
	}

	var onDecreaseClicked = function()
	{
		if(self.value > minVal)
		{
			self.setVal(self.value - 1);
			if(self.onValueChanged != undefined)
			{
				self.onValueChanged(self.value);
			}
		}
	}

	var getTrianglePath = function(x, y, width, height)
	{
		var path = "";

		switch(self.orientation)
		{
			case "top":
				path = "M " + x + " " + y + " ";
				path += "L " + (x + width/2) + " " + (y - height) + " ";
				path += "L " + (x - width/2) + " " + (y - height) + "Z";
				break;
			case "left":
				path = "M " + x + " " + y + " ";
				path += "L " + (x - height) + " " + (y - width/2) + " ";
				path += "L " + (x - height) + " " + (y + width/2) + "Z";
				break;
			default:
				console.log("Error: Please use orientation left or top for popups!");
				break;
		}

		return path;
	}

	var getLeftBtnTriangle = function(x,y,w,h)
	{
		var path;

		switch(self.orientation)
		{
			case "top":
				path = "M " + x + " " + (y - h/2) + " ";
				path += "L " + x + " " + (y + h/2) + " ";
				path += "L " + (x-w) + " " + y + " Z";
				break;
			case "left":
				path = "M " +  (x - w/2) + " " + y + " ";
				path += "L " + (x + w/2) + " " + y + " ";
				path += "L " +  x        + " " + (y - h) + " Z";
				break;
			default:
				console.log("Error: Please use orientation left or top for popups!");
				break;
		}


		return path;
	}

	var getRightBtnTriangle = function(x,y,w,h)
	{
		var path;

		switch(self.orientation)
		{
			case "top":
				path = "M " + x + " " + (y + h/2) + " ";
				path += "L " + x + " " +  (y - h/2)+ " ";
				path += "L " + (x+w) + " " + y + " Z";
				break;
			case "left":
				path = "M " +  (x - w/2) + " " + y + " ";
				path += "L " + (x + w/2) + " " + y + " ";
				path += "L " +  x        + " " + (y + h) + " Z";
				break;
			default:
				console.log("Error: Please use orientation left or top for popups!");
				break;
		}


		return path;
	}


	this.init = function()
	{
		//Init popup bg
		var bgX, bgY;
		var lBtnX, lBtnY, rBtnX, rBtnY;
		var textX, textY;

		switch(this.orientation)
		{
			case "top":
				bgX = this.pos.x - popupW/2;
				bgY = this.pos.y - triH  - popupH;

				lBtnX = bgX + popupW/2 - 5;
				lBtnY = bgY + popupH - 20;

				rBtnX = bgX + popupW/2 + 5;
				rBtnY = bgY + popupH - 20;

				textX = bgX + popupW/2;
				textY = bgY + 20;

				break;
			case "left":
				bgX = this.pos.x - triH - popupW;
				bgY = this.pos.y - popupH/2;

				lBtnX = bgX + 20;
				lBtnY = bgY + popupH/2 - 5;

				rBtnX = bgX + 20;
				rBtnY = bgY + popupH/2 + 5;

				textX = bgX + popupW - 20;
				textY = bgY + popupH/2;

				break;
			default:
				console.log("Error: Please use orientation left or top for popups!");
				break;
		}

		this.popupBg = this.panel.rect(bgX, bgY, popupW, popupH);
		this.popupBg.attr({fill : "#FFF", stroke: "#dddddd", r : 8});

		//Init popup triangle
		this.triangle = this.panel.path(getTrianglePath(this.pos.x, this.pos.y, triW, triH));
		this.triangle.attr({fill: "#dddddd", stroke: "#dddddd"});
		this.triangle.hide();

		//Init Left Button
		this.leftBtn = this.panel.path(getLeftBtnTriangle(lBtnX, lBtnY, btnTriW, btnTriH));
		this.leftBtn.attr({fill: "#efc079", stroke:"#FFF"});
		this.leftBtn.hide();
		this.leftBtn.node.onclick = (this.orientation == "top") ? onDecreaseClicked : onIncreaseClicked;

		//Init Right Button
		this.rightBtn = this.panel.path(getRightBtnTriangle(rBtnX, rBtnY, btnTriW, btnTriH));
		this.rightBtn.attr({fill: "#efc079", stroke:"#FFF"});
		this.rightBtn.hide();
		this.rightBtn.node.onclick = (this.orientation == "top") ? onIncreaseClicked : onDecreaseClicked;

		//Draw text -- Initiation inside a timeout function is a hack. Text position was not being applied properly on hidden objects.
		setTimeout(function(){
			self.numberText = self.panel.text(textX, textY, self.value);
			self.numberText.attr({ "font-size": "32px", "font-weight": "400", fill: "#95beee", stroke:"#95beee", "stroke-width": "1px"});
			self.numberText.hide();
		});


	}
	this.init();


	this.show = function()
	{
		self.popupBg.show();
		self.triangle.show();
		self.leftBtn.show();
		self.rightBtn.show();
		self.numberText.show();
	}

	this.hide = function()
	{
		self.popupBg.hide();
		self.triangle.hide();
		self.leftBtn.hide();
		self.rightBtn.hide();
		if(self.numberText !== undefined) //Special check for text to counter the position hack we applied.
			self.numberText.hide();
	}



}

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: RectangleLayer.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function RectangleLayer (panel)
{
	var rectW = 150;
	var rectH = 150;
	var color = "#95beee";

	this.panel = panel;

	this.rect;
	var self = this;

	this.init = function()
	{
		this.rect = this.panel.rect(0,0,rectW, rectH);
		this.rect.attr("fill", color);
		this.rect.attr("stroke-width", 0);
	}
	this.init();


	this.setPosition = function(pos)
	{
		this.rect.attr("x", pos.x);
		this.rect.attr("y", pos.y);
	}

	this.setX = function(x)
	{
		this.rect.attr("x", x);
	}

	this.setY = function(y)
	{
		this.rect.attr("y", y);
	}

	this.getWidth = function()
	{
		return this.rect.attrs.width;
	}

	this.getHeight = function()
	{
		return this.rect.attrs.height;
	}

	this.setWidth = function(val)
	{
		this.rect.attr("width", val);
	}

	this.setHeight = function(val)
	{
		this.rect.attr("height", val);
	}


	this.hide = function()
	{
		self.rect.hide();
	}

	this.show = function()
	{
		self.rect.show();
	}
}

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: SplitRect.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function SplitRect(panel, pos, width, height, gridLayer, dragUnit)
{
	this.panel = panel;
	this.gridLayer = gridLayer;
	this.pos = pos;
	this.width = width;
	this.height = height;
	this.rect;
	this.handle;
	this.isSelected = false;
	this.onSelected = undefined;
	this.onDragEnd  = undefined;
	this.dragSnap = dragUnit;

	var snapDist = 5;

	var self = this;
	var color = "#95beee";
	var black = "rgba(0, 0, 0, 1)";

	var unselectOptions = { attrs:  {fill: color, stroke: black},
							distance: 1.8,
							size: 8,
							rotate: [null, null, null],
							scale: [false, false, false, false, false],
							drag: [null, null],
							snapDist: { rotate: 10},
							boundary: {x: self.gridLayer._offset.x + width/2, y: self.gridLayer._offset.y+height/2},
							snap: { rotate: 90} };

	var selectOptions = { 	attrs:  {fill: color, stroke: black},
							distance: 1.8,
							size: 8,
							rotate: [null, 'axisY', null],
							scale: [false, false, false, false, false],
							drag: [null, null],
							snapDist: { rotate: 10},
							boundary: {x: self.gridLayer._offset.x + width/2, y: self.gridLayer._offset.y+height/2},
							snap: { rotate: 90} };



	this.cbFreeTransform = function (s, e) {

    	if (e.toString() == 'rotate end')
    	{
	       var delta = self.handle.attrs.rotate % 90;

	       // Snap to angle, rotate with increments
			var dist = Math.abs(self.handle.attrs.rotate % 90);
			dist = Math.min(dist, 90 - dist);

			if ( dist < 90 ) {
				self.handle.attrs.rotate = Math.round(self.handle.attrs.rotate / 90) * 90;
			}
	       self.handle.apply();
	    }

	}



	this.select = function()
	{
		//Return if object is already selected.
		if(self.isSelected)
		{
			return;
		}

		self.isSelected = true;

		self.handle.setOpts(selectOptions, self.cbFreeTransform);


		//self.handle.attrs.rotate = 180;
		self.handle.apply();
		this.rect.drag( this.drag_move,
						this.drag_start,
						this.drag_up);

		if(self.onSelected != undefined)
		{
			self.onSelected(self);
		}

	}

	this.deselect = function()
	{
		//Return if object is already unselected.
		if(!self.isSelected)
		{
			return;
		}

		self.isSelected = false;

		if(self.handle != undefined)
		{
			self.handle.setOpts(unselectOptions, self.cbFreeTransform);
			self.handle.apply();
			this.rect.drag( this.drag_move,
						this.drag_start,
						this.drag_up);
		}
	}


	this.onClick = function()
	{
		if(!self.isSelected)
		{
			self.select();
		}
		else
		{
			self.deselect();
		}
		console.log("Selected: " + self.isSelected);
	}

	this.drag_start = function()
	{
		this.bb = self.rect.getBBox();
		this.gridPos = self.gridLayer._offset;
		this.ox = this.bb.x;//this.attr("x");
		this.oy = this.bb.y;//this.attr("y");
		this.tx = Math.abs(this.ox - this.attr("x"));
		this.ty = Math.abs(this.oy - this.attr("y"));

		self.rect.toFront();
		console.log("drag start + x: " + this.ox );
	}

	this.drag_move = function(dx, dy)
	{
		var x = this.ox + dx;
		var y = this.oy + dy;

		if(x < this.gridPos.x)
		{
			console.log("gridX: " + this.gridPos.x);
			x = this.gridPos.x;
		}
		else if((x - this.gridPos.x) % self.dragSnap < snapDist)
		{
			x -= (x - this.gridPos.x) % self.dragSnap < snapDist;
		}

		if(y < this.gridPos.y)
		{
			y = this.gridPos.y;
		}
		else if((y - this.gridPos.y) % self.dragSnap < snapDist)
		{
			y -= (y - this.gridPos.y) % self.dragSnap;
		}


		if(self.width < this.bb.width)
			x += this.tx;
		else
			x -= this.tx;

		if(self.height < this.bb.height)
			y += this.ty;
		else
			y -= this.ty;



		self.rect.attr({x: x, y: y});
		self.handle.attrs.center = {x: x + self.width/2, y: y + self.height/2};
		self.handle.apply();
	}

	this.drag_up = function()
	{
		self.select();
		this.bb = self.rect.getBBox();
		var posX = this.bb.x;
		var posY = this.bb.y;

		if((posX - this.gridPos.x) % self.dragSnap > 0)
		{
			var deltaX = (posX - this.gridPos.x) % self.dragSnap;
			if(deltaX > self.dragSnap/2)
			{
				posX += self.dragSnap - deltaX;
			}
			else
			{
				posX -= deltaX;
			}
		}

		if((posY - this.gridPos.y) % self.dragSnap > 0)
		{
			var deltaY = (posY - this.gridPos.y) % self.dragSnap;
			if(deltaY > self.dragSnap/2)
			{
				posY += self.dragSnap - deltaY;
			}
			else
			{
				posY -= deltaY;
			}
		}

		var x = posX;
		var y = posY;

		if(self.width < this.bb.width)
			x += this.tx;
		else
			x -= this.tx;

		if(self.height < this.bb.height)
			y += this.ty;
		else
			y -= this.ty;

		self.rect.attr({x: x, y: y});
		self.handle.attrs.center = {x: x + self.width/2, y: y + self.height/2};
		self.handle.apply();

	    if(self.onDragEnd != undefined)
	    {
		    self.onDragEnd(self);
	    }
	}


	this.init = function()
	{
		this.rect = this.panel.rect(pos.x, pos.y, this.width, this.height);
		this.rect.attr("fill", "rgba(149, 190, 238, 0.7)");
		this.rect.attr("stroke-width", 0.5);
		this.rect.drag( this.drag_move,
						this.drag_start,
						this.drag_up);

		//this.rect.node.onclick = this.onClick;

		self.handle = self.panel.freeTransform(self.rect, unselectOptions, self.cbFreeTransform);
	}

	this.init();

	this.bbWidth = function()
	{
		return self.rect.getBBox().width;
	}

	this.bbHeight = function()
	{
		return self.rect.getBBox().height;
	}

	this.remove = function()
	{
		if(self.handle !== undefined)
		{
			 self.handle.unplug();
		}
		self.rect.remove();
		console.log("Removed Obj!");
	}
}

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: GridLayer.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function GridLayer(panel, pos, width, height, cellCount)
{

	this.panel = panel;
	this.unitSquare;
	var self = this;

	this.width  = width;
	this.height = height;
	this.cellCount = cellCount;
	this.cellSize = {x: width/cellCount.x, y: height/cellCount.y};
	this._offset = pos;
	this.cellCount;

	this.unitWidth = 150;
	this.unitHeight = 150;

	this.horizontalLines = [];
	this.verticalLines = [];

	this.onRedrawn = undefined;

	//Helper Function to make line path string
	var getLinePath = function(x1, y1, x2, y2)
	{
		 return "M " + x1 + " " + y1 + " l " + x2 + " " + y2 + " z";
	}

	this.clearGird = function()
	{
		for(var i = 0; i < self.verticalLines.length; i++)
		{
			self.verticalLines[i].remove();
		}

		for(var k = 0; k < self.horizontalLines.length; k++)
		{
			self.horizontalLines[k].remove();
		}

		self.verticalLines = [];
		self.horizontalLines = [];
	}

	this.drawGrid = function()
	{
		 // vertical lines
	    for(var i = 0; i <= self.cellCount.x; i++){

	    	var x = (self.cellSize.x * i)  + self._offset.x;
	        var vpath = getLinePath(x, self._offset.y, 0, self.height);
	        var vline = panel.path(vpath);
	        vline.attr({'stroke-dasharray': "- ", 'stroke': "#db00fa" });
	        self.verticalLines.push(vline);
	    }
	    // horizontal lines
	    for(var i = 0; i <= self.cellCount.y; i++){
	    	var y = (self.cellSize.y * i)  + self._offset.y;
	        var hpath = getLinePath(self._offset.x, y, self.width, 0);
	        var hline = panel.path(hpath);
	        hline.attr({'stroke-dasharray': "- ", 'stroke': "#db00fa" });
	        self.horizontalLines.push(hline);
	    }

	    //this.unitSquare.attr({width: self.width, height: self.height});

	    if(self.onRedrawn != undefined)
	        	self.onRedrawn();
	}

	this.init = function()
	{
		//Use as constructor..
		this.unitSquare = this.panel.rect(this._offset.x, this._offset.y, this.width, this.height);
		this.unitSquare.attr({fill: "url(lib/externalTools/Rectangle/images/p1.png)", stroke: 0});

		//Unit size is the default size of the rectangle. A reference set for user to go back to the orignal size.
		this.unitWidth = this.width;
		this.unitHeight = this.height;

		this.drawGrid();
	}
	this.init();

	this.getMaxBoundX = function()
	{
		return this.width + this._offset.x;
	}

	this.getMinBoundX = function()
	{
		return this._offset.x + this.cellSize.x;
	}

	this.getMaxBoundY = function()
	{
		return this.height + this._offset.y;
	}

	this.getMinBoundY = function()
	{
		return this._offset.y + this.cellSize.y;
	}

	this.setWidth = function(width)
	{
		self.width = width;
		self.cellSize.x = width/cellCount.x;

		self.clearGird();
	    self.drawGrid();
	}

	this.setUnitWidth = function(val)
	{
		self.unitWidth = val;
		self.unitSquare.attr({width: self.unitWidth});
	}
	this.setUnitHeight = function(val)
	{
		self.unitHeight = val;
		self.unitSquare.attr({height: self.unitHeight});
	}

	this.setHeight = function(height)
	{
		self.height = height;
		self.cellSize.y = height/cellCount.y;

		self.clearGird();
		self.drawGrid();
	}

	this.hidePattern = function()
	{
		self.unitSquare.hide();
	}

	this.showPattern = function()
	{
		self.unitSquare.show();
	}

	this.toFront = function()
	{
		//self.unitSquare.toFront();
		for(var i=0; i < self.verticalLines.length; i++)
		{
			self.verticalLines[i].toFront();
		}

		for (var j=0; j < self.horizontalLines.length; j++)
		{
			self.horizontalLines[j].toFront();
		}
	}

}

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: HandlesLayer.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function HandlesLayer(panel, rectangleLayer, gridLayer, pos)
{

	this.panel = panel;
	this.rectangleLayer = rectangleLayer;
	this.rect = rectangleLayer.rect;
	this.gridLayer = gridLayer;
	this.pos = pos;
	this.verticalRuler;
	this.horizontalRuler;
	this.cloneRect;
	this.cloneSize;

	var handleRadius = 8;
	var rulerHeight = 12;
	var padding = 3;

	this.rectHorizontalHandle;
	this.rectVerticalHandle;
	this.bottomHandle;


	var resizeHandleW = 25;
	var resizeHandleH = 25;

	this.resizeHandle;


	var self = this;


	//Update panel Size
	this.updatePanelSize = function()
	{
		var panelW = self.panel.width;
		var panelH = self.panel.height;

		var maxW = Math.max( self.gridLayer._offset.x + self.gridLayer.width,  self.rectangleLayer.rect.attr("x") + self.rectangleLayer.getWidth() );
		var maxH = Math.max( self.gridLayer._offset.y + self.gridLayer.height, self.rectangleLayer.rect.attr("y") + self.rectangleLayer.getHeight());

		var maxD = Math.max(self.rectangleLayer.getWidth(), self.rectangleLayer.getHeight());

		panelW = maxW + maxD;
		panelH = maxH + maxD;


		self.panel.setSize(panelW, panelH);
		self.panel.canvas.parentNode.style.width = panelW  + "px";
		self.panel.canvas.parentNode.style.height = panelH + "px";
	}


	this.updateRectHandlePositions = function()
	{
		self.rectHorizontalHandle.attr({cx:  this.rect.attrs.x + this.rect.attrs.width,
										cy: this.rect.attrs.y + this.rect.attrs.height/2});

		self.rectVerticalHandle.attr({cx: this.rect.attrs.x + this.rect.attrs.width/2,
									  cy:this.rect.attrs.y + this.rect.attrs.height});

		self.updateResizeHandlePosition();
	}

	this.updateResizeHandlePosition = function()
	{
		var posX = self.pos.x + resizeHandleW/2 + Math.max(self.rect.attrs.width, self.gridLayer.width);
		var posY = self.pos.y + resizeHandleH/2 + Math.max(self.rect.attrs.height, self.gridLayer.height);
		this.resizeHandle.attr({x: posX, y: posY});
	}


	//------ Rectangle Handle Drag Events -----------
	this.rectHorizontal_start = function()
	{
		this.ox = this.attr("cx");
		this.oy = this.attr("cy");
		this.ow = self.rectangleLayer.getWidth();
		this.w = self.rectangleLayer.getWidth();
		console.log(this.w);
		self.rectHorizontalHandle.attr({r: 12}); // greg
	}

	this.rectHorizontal_move = function(dx, dy)
	{
		var x = this.ox + dx;
		if(self.rectangleLayer.getWidth() <= self.gridLayer.width)
		{
			if(x < self.gridLayer.getMinBoundX() || x > self.gridLayer.getMaxBoundX())
			return;
		}
		else
		{
			if(x > self.gridLayer.getMaxBoundX() + (this.ow - self.gridLayer.width))
			{
				return;
			}
		}


		this.attr({cx: x, cy: this.oy});
		var w = this.w + dx;
		self.rectangleLayer.setWidth(w);
		self.rectVerticalHandle.attr({cx: self.rect.attrs.x + self.rect.attrs.width/2});
		self.updateResizeHandlePosition();

		//Update panel size
		self.updatePanelSize();
	}

	this.rectHorizontal_up = function()
	{
		var w = self.rectangleLayer.getWidth();
		if(w % self.gridLayer.cellSize.x != 0)
		{
			var delta = w % self.gridLayer.cellSize.x;
			if(delta > self.gridLayer.cellSize.x/2)
			{
				w += self.gridLayer.cellSize.x - delta;
				self.rectangleLayer.setWidth(w);
				self.rectVerticalHandle.attr({cx: self.rect.attrs.x + self.rect.attrs.width/2});
				self.rectHorizontalHandle.attr({cx: self.rect.attrs.x + self.rect.attrs.width});
			}
			else
			{
				w -= delta;
				self.rectangleLayer.setWidth(w);
				self.rectVerticalHandle.attr({cx: self.rect.attrs.x + self.rect.attrs.width/2});
				self.rectHorizontalHandle.attr({cx: self.rect.attrs.x + self.rect.attrs.width});
			}
		}

		//Set clone rect width
		self.cloneSize.x = self.rectangleLayer.getWidth();
		self.rectHorizontalHandle.attr({r: 8});	//greg
		//Update panel size
		self.updatePanelSize();
	}

	this.rectVertical_start = function()
	{
		this.ox = this.attr("cx");
		this.oy = this.attr("cy");
		this.oh = this.h = self.rectangleLayer.getHeight();
		console.log(this.h);
		self.rectVerticalHandle.attr({r: 12}); // greg
	}

	this.rectVertical_move = function(dx, dy)
	{
		var y = this.oy + dy;
		if(self.rectangleLayer.getHeight() <= self.gridLayer.height)
		{
			if(y < self.gridLayer.getMinBoundY() || y > self.gridLayer.getMaxBoundY())
				return;
		}
		else
		{
			if(y > self.gridLayer.getMaxBoundY() + (this.oh - self.gridLayer.height))
			{
				return;
			}
		}

		this.attr({cx: this.ox, cy: this.oy + dy});
		var h = this.h + dy;
		self.rectangleLayer.setHeight(h);
		self.rectHorizontalHandle.attr({cy: self.rect.attrs.y + self.rect.attrs.height/2});
		self.updateResizeHandlePosition();

		//Update panel size
		self.updatePanelSize();
	}

	this.rectVertical_up = function()
	{
		var h = self.rectangleLayer.getHeight();
		if(h % self.gridLayer.cellSize.y != 0)
		{
			var delta = h % self.gridLayer.cellSize.y;
			if(delta > self.gridLayer.cellSize.y/2)
			{
				h += self.gridLayer.cellSize.y - delta;
				self.rectangleLayer.setHeight(h);
				self.rectVerticalHandle.attr({cy: self.rect.attrs.y + self.rect.attrs.height});
				self.rectHorizontalHandle.attr({cy: self.rect.attrs.y + self.rect.attrs.height/2});
			}
			else
			{
				h -= delta;
				self.rectangleLayer.setHeight(h);
				self.rectVerticalHandle.attr({cy: self.rect.attrs.y + self.rect.attrs.height});
				self.rectHorizontalHandle.attr({cy: self.rect.attrs.y + self.rect.attrs.height/2});
			}
		}

		//Set clone rect height
		self.cloneSize.y = self.rectangleLayer.getHeight();
		self.rectVerticalHandle.attr({r: 8}); // greg
		//Update panel size
		self.updatePanelSize();
	}


	//Resize Handle Drag Events
	this.resizeHandle_start = function()
	{
		this.ox = this.attr("cx");
		this.oy = this.attr("cy");
		this.rw = self.rectangleLayer.getWidth();
		this.rh = self.rectangleLayer.getHeight();
		this.rr = this.rh/this.rw

		this.gw = self.gridLayer.width;
		this.gh = self.gridLayer.height;
		this.gr = this.gh/this.gw;
		this.gridToRectRatio = this.gw/this.rw;

		this.uw = self.gridLayer.unitWidth;
		this.uh = self.gridLayer.unitHeight;
		this.ur = this.uh/this.uw;
		this.unitToRectRatio = this.uw/this.rw;

		this.cw = self.cloneRect.attrs.width;
		this.ch = self.cloneRect.attrs.height;
		this.cr = this.ch/this.cw;
		this.cloneToRectRatio = this.cw/ this.rw;

	}

	this.resizeHandle_move = function(dx, dy)
	{
		var delta = Math.min(dx, dy);


		if( this.rw + delta < 50)
			return;

		self.rectangleLayer.setWidth(this.rw + delta);
		self.rectangleLayer.setHeight(self.rectangleLayer.getWidth() * this.rr);

		self.gridLayer.setWidth(self.rectangleLayer.getWidth() * this.gridToRectRatio);
		self.gridLayer.setHeight(self.gridLayer.width * this.gr);

		self.gridLayer.setUnitWidth(self.rectangleLayer.getWidth() * this.unitToRectRatio);
		self.gridLayer.setUnitHeight(self.gridLayer.unitWidth * this.ur);

		self.cloneRect.attr({width: self.rectangleLayer.getWidth() * this.cloneToRectRatio,
							height: self.rectangleLayer.getWidth() * this.cr});

		self.updateRectHandlePositions();
		self.horizontalRuler.setWidth(self.gridLayer.width);
		self.verticalRuler.setWidth(self.gridLayer.height);

		//Update panel size
		self.updatePanelSize();
	}

	this.resizeHandle_up = function()
	{

	}

	//------ Clone Rect Drag Event Handler ----------
	var clone_dragstart = function(x, y, evt)
	{
		this.ox = this.attr("x");
        this.oy = this.attr("y");
        this.attr("width", self.cloneSize.x);
		this.attr("height", self.cloneSize.y);
        this.startAnim = this.animate({fill: "rgba(255, 249, 240 ,0.7)"}, 300, ">");
	}
	var clone_dragmove = function(dx, dy)
	{

		if(dx < 0) dx = 0;
		if(dy < 0) dy = 0;

		if(dx > 0 || dy > 0)
		{
			//If we moved in x keep moving in x
			if(this.attr("x") - this.ox > 0)
			{
				var x = (this.ox + dx > this.ox + self.rectangleLayer.getWidth()) ?
				this.ox + self.rectangleLayer.getWidth() : this.ox + dx;
				this.attr({x: x, y: this.oy});
			}
			else if(this.attr("y") - this.oy > 0) //We moved in y so keep moving in y
			{
				var y = (this.oy + dy > this.oy + self.rectangleLayer.getHeight()) ?
				this.oy + self.rectangleLayer.getHeight(): this.oy + dy;
				this.attr({x: this.ox, y: y});
			}
			else if(dx > dy) //We haven't moved in any direction yet
			{
				var w = self.cloneSize.x; //Math.min(self.rectangleLayer.getWidth(), self.gridLayer.unitWidth);
				var h = (self.rectangleLayer.getHeight());

				this.attr("width", w);
				this.attr("height", h);

				var x = (this.ox + dx > this.ox + self.rectangleLayer.getWidth()) ?
				this.ox + self.rectangleLayer.getWidth() : this.ox + dx;
				this.attr({x: x, y: this.oy});
			}
			else
			{
				var w = (self.rectangleLayer.getWidth());
				var h = self.cloneSize.y;//Math.min(self.rectangleLayer.getHeight(), self.gridLayer.unitHeight);

				this.attr("width", w);
				this.attr("height", h);

				var y = (this.oy + dy > this.oy + self.rectangleLayer.getHeight()) ?
				this.oy + self.rectangleLayer.getHeight(): this.oy + dy;
				this.attr({x: this.ox, y: y});
			}
		}

	}
	var clone_dragend = function()
	{
		if(this.attr("x") >= this.ox + self.rectangleLayer.getWidth())
		{
			//Increase Rectangle in width
			self.rectangleLayer.setWidth(self.rectangleLayer.getWidth() + this.attr("width"));
			self.cloneSize.y = self.rectangleLayer.getHeight();
			self.updateRectHandlePositions();
		}
		else if(this.attr("y") >= this.oy + self.rectangleLayer.getHeight())
		{
			//Increase Rect in Hieght
			self.rectangleLayer.setHeight(self.rectangleLayer.getHeight() + this.attr("height"));
			self.cloneSize.x = self.rectangleLayer.getWidth();
			self.updateRectHandlePositions();
		}

		//Reset Clone Rect
		this.stop(this.startAnim);
		this.attr("width", self.cloneSize.x);
		this.attr("height", self.cloneSize.y);
		this.attr({x: this.ox, y: this.oy, fill:"rgba(0,0,0,0)"});
		this.animate({fill: "rgba(0,0,0,0)"}, 300, ">");


		//Update panel size
		self.updatePanelSize();
	}

	this.onGridRedrawn = function()
	{
		//Bring rectangle Handles to Front
		self.rectHorizontalHandle.toFront();
		self.rectVerticalHandle.toFront();

		self.updateResizeHandlePosition();

		//Update panel size
		self.updatePanelSize();
	}

	this.onRectangleResized = function()
	{
		self.updateRectHandlePositions();
		self.updateResizeHandlePosition();
	}

	this.init = function()
	{

		//Init Rectangle Resize Handles
		var pos = {x: this.pos.x + rulerHeight + padding, y: this.pos.y + rulerHeight + padding};
		this.rectangleLayer.setPosition(pos);

		this.rectHorizontalHandle = this.panel.circle(
			this.rect.attrs.x + this.rect.attrs.width,
			this.rect.attrs.y + this.rect.attrs.height/2,
			handleRadius);
		this.rectHorizontalHandle.attr("stroke", "#95beee");
		this.rectHorizontalHandle.attr("stroke-width", handleRadius);
		this.rectHorizontalHandle.attr("fill", "#fff");
		this.panel.set(this.rectHorizontalHandle).drag( this.rectHorizontal_move,
														this.rectHorizontal_start,
														this.rectHorizontal_up);

		this.rectVerticalHandle = this.panel.circle(
			this.rect.attrs.x + this.rect.attrs.width/2,
			this.rect.attrs.y + this.rect.attrs.height,
			handleRadius);
		this.rectVerticalHandle.attr("stroke", "#95beee");
		this.rectVerticalHandle.attr("stroke-width", handleRadius);
		this.rectVerticalHandle.attr("fill", "#fff");
		this.panel.set(this.rectVerticalHandle).drag( this.rectVertical_move,
														this.rectVertical_start,
														this.rectVertical_up);

		//Init Grid Resize Handles
		this.verticalRuler = new Ruler(
			{ x:this.pos.x, y: this.rect.attrs.y},
			false,
			this.panel,
			this.gridLayer.height,
			this.gridLayer.cellCount.y ,
			this.rectangleLayer,
			this.gridLayer
		);


		this.horizontalRuler = new Ruler(
			{ x:this.rect.attrs.x, y: this.pos.y},
			true,
			this.panel,
			this.gridLayer.width,
			this.gridLayer.cellCount.x ,
			this.rectangleLayer,
			this.gridLayer
		);

		this.resizeHandle = self.panel.image("lib/externalTools/Rectangle/images/resize_icon.svg",
											 pos.x + this.rect.attrs.width, pos.y + this.rect.attrs.height,
											 resizeHandleW, resizeHandleH);
		this.resizeHandle.drag( this.resizeHandle_move,
								this.resizeHandle_start,
								this.resizeHandle_up);


		self.gridLayer.onRedrawn = self.onGridRedrawn;

		//Init Clone Rect
		this.cloneRect = this.panel.rect(this.rect.attrs.x, this.rect.attrs.y,
										 this.rectangleLayer.getWidth(), this.rectangleLayer.getHeight());
		this.cloneSize = {x : this.rectangleLayer.getWidth(), y: this.rectangleLayer.getHeight()};
		this.cloneRect.attr({stroke:"rgba(0,0,0,0)", fill: "rgba(0,0,0,0)"});
		self.rectHorizontalHandle.toFront();
		self.rectVerticalHandle.toFront();
		this.cloneRect.drag(clone_dragmove, clone_dragstart, clone_dragend);

		self.updatePanelSize();

	}
	this.init();

	this.updateCellCountX = function(val)
	{
		self.horizontalRuler.setUnits(val);

		//Resize rectangle width to maintain unit size
		var w = self.rectangleLayer.getWidth();
		if(w % self.gridLayer.cellSize.x != 0)
		{
			var delta = w % self.gridLayer.cellSize.x;
			if(delta >= self.gridLayer.cellSize.x/2)
			{
				w += self.gridLayer.cellSize.x - delta;
				self.rectangleLayer.setWidth(w);
				self.updateRectHandlePositions();
			}
			else
			{
				w -= delta;
				self.rectangleLayer.setWidth(w);
				self.updateRectHandlePositions();
			}
		}

	}

	this.updateCellCountY = function(val)
	{
		self.verticalRuler.setUnits(val);

		//Resize Rectangle Height to maintain unit size
		var h = self.rectangleLayer.getHeight();
		if(h % self.gridLayer.cellSize.y != 0)
		{
			var delta = h % self.gridLayer.cellSize.y;
			if(delta >= self.gridLayer.cellSize.y/2)
			{
				h += self.gridLayer.cellSize.y - delta;
				self.rectangleLayer.setHeight(h);
				self.updateRectHandlePositions();
			}
			else
			{
				h -= delta;
				self.rectangleLayer.setHeight(h);
				self.updateRectHandlePositions();
			}
		}

	}


	this.hide = function()
	{
		this.rectHorizontalHandle.hide();
		this.rectVerticalHandle.hide();
		this.verticalRuler.hide();
		this.horizontalRuler.hide();
		this.cloneRect.hide();
		this.resizeHandle.hide();
	}

	this.show = function()
	{
		this.rectHorizontalHandle.show();
		this.rectVerticalHandle.show();
		this.verticalRuler.show();
		this.horizontalRuler.show();
		this.cloneRect.show();
		this.resizeHandle.show();
	}


}

/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
/* Merging js: MenuLayer.js begins */
/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


function MenuLayer(panel, pos, handlesLayer, rectangleLayer, gridLayer)
{

	this.panel = panel;
	this.pos = pos;
	this.handlesLayer = handlesLayer;
	this.rectangleLayer = rectangleLayer;
	this.gridLayer = gridLayer;

	this.splitBtn;
	this.splitBtnGlow;

	this.horizontalSplitBtn;
	this.horizontalSpltBtnGlow;

	this.verticalSplitBtn;
	this.verticalSplitBtnGlow;

	this.verticalPopup;
	this.horizontalPopup;

	this.horBtnImg;
	this.verBtnImg;

	var self = this;

	var btnW = 42;
	var btnH = 43;

	var plusColor = "#cbcbcb";
	var dottedLinesColor = "#db00fa";
	var btnRectFillColor = "#95beee";
	var btnRectStrokeColor = "#989898";
	var btnSelectedColor = "#4e4e4e";
	var btnDefaultColor = "#f2f2f2";

	var VER_DEFAULT_IMAGE  = "lib/externalTools/Rectangle/images/v-split-default.svg";
	var VER_INACTIVE_IMAGE = "lib/externalTools/Rectangle/images/v-split-inactive.svg";

	var HOR_DEFAULT_IMAGE  = "lib/externalTools/Rectangle/images/h-split-default.svg";
	var HOR_INACTIVE_IMAGE = "lib/externalTools/Rectangle/images/h-split-inactive.svg";

	var splitSelected = false, horizontalSplitSelected = false, verticalSplitSelected = false;

	this.splitObjects = [];
	this.currSplitObj = undefined;

	this.splitObjSelected = function(obj)
	{
		if(self.currSplitObj != undefined)
			self.currSplitObj.deselect();

		self.currSplitObj = obj;
	}


	var gcd = function(a, b)
	{
	    if ( ! b) {
	        return a;
	    }

	    return gcd(b, a % b);
	};

	function compareNumbers(a, b)
	{
	  return a - b;
	}

	var createSplitRectangle = function()
	{
		self.splitObjects = [];
		self.currSplitObj = undefined;

		var startPos = { x: self.rectangleLayer.rect.attr("x"), y: self.rectangleLayer.rect.attr("y")};
		var rowCount = self.rectangleLayer.getWidth()/self.gridLayer.cellSize.x;
		var colCount = self.rectangleLayer.getHeight()/self.gridLayer.cellSize.y;
		var rectSize = self.gridLayer.cellSize;
		var dragUnit = gcd(rectSize.x, rectSize.y);
		console.log("RectSize: " + rectSize.x + "," + rectSize.y + " Drag unit: " + dragUnit);

		for(var row = 0; row < rowCount; row++)
		{
			for(var col = 0; col < colCount; col++)
			{
				var splitRect = new SplitRect(self.panel,
											 {x: startPos.x + (rectSize.x * row), y:startPos.y + (rectSize.y * col)},
											 rectSize.x, rectSize.y, self.gridLayer, dragUnit);
				splitRect.onSelected = self.splitObjSelected;
				splitRect.onDragEnd = function(obj)
				{
					self.gridLayer.toFront();
				}

				self.splitObjects.push(splitRect);
			}
		}
		self.gridLayer.toFront();
	}

	var removeSplitRectangle = function()
	{
		if(self.splitObjects.length > 0)
		{
			for(var i = 0; i < self.splitObjects.length; i++)
			{
				self.splitObjects[i].remove();
			}
		}
		self.splitObjects = [];
	}


	function intersectRect(r1, r2) {

	  return !(r2.left >= r1.right ||
	           r2.right <= r1.left ||
	           r2.top >= r1.bottom ||
	           r2.bottom <= r1.top);
	}

	var getNewRect = function()
	{
		var minX, minY, maxX, maxY;
		minX = maxX = self.splitObjects[0].rect.attr("x");
		minY = maxY = self.splitObjects[0].rect.attr("y");

		for(var i = 0; i < self.splitObjects.length; i++)
		{
			var x = self.splitObjects[i].rect.attr("x");
			var y = self.splitObjects[i].rect.attr("y");
			var w = self.splitObjects[i].bbWidth();
			var h = self.splitObjects[i].bbHeight();

			if(minX > x)
			{
				minX = x;
			}

			if(minY > y)
			{
				minY = y;
			}

			if(maxX < x+w)
				maxX = x+w;

			if(maxY < y+h)
				maxY = y+h;
		}

		var newRect = {x: minX, y: minY, width: maxX - minX, height: maxY - minY};

		var newArea = newRect.width * newRect.height;
		var oldArea = self.rectangleLayer.getWidth() * self.rectangleLayer.getHeight();

		//If the area is changed then we don't have a proper rectangle.
		if(newArea !== oldArea)
		{
			return undefined;
		}

		//If the area is appropriate then we just need to check if non of the objects overlap each other.
		//With the correct area and no split rectangle over lapping each other means that we have a valid rectangle.
		for(var j = 0; j < self.splitObjects.length - 1; j++)
		{
			var x1 = self.splitObjects[j].rect.attr("x");
			var y1 = self.splitObjects[j].rect.attr("y");
			var w1 = self.splitObjects[j].bbWidth();
			var h1 = self.splitObjects[j].bbHeight();

			var r1 = {left: x1, right: x1+w, top: y1, bottom: y1+h};

			for(var k = j + 1; k < self.splitObjects.length; k++)
			{
				var x2 = self.splitObjects[k].rect.attr("x");
				var y2 = self.splitObjects[k].rect.attr("y");
				var w2 = self.splitObjects[k].bbWidth();
				var h2 = self.splitObjects[k].bbHeight();

				var r2 = {left: x2, right: x2+w, top: y2, bottom: y2+h};

				//If rectangles intersect each other than we do not have a proper rectangle.
				if(intersectRect(r1, r2))
				{
					return undefined;
				}
			}
		}


		//After passing the above checks, we conclude that we have a valid Rectangle.
		return newRect;
	}

	//On Split Button Clicked
	var onSplitClicked = function()
	{

		if(!splitSelected)
		{
			if(horizontalSplitSelected)
				onHorizontalSplitClicked();
			if(verticalSplitSelected)
				onVerticalSplitClicked();
		}

		//toggle split
		splitSelected = !splitSelected;

		if(splitSelected)
		{
			self.splitBtn.attr({'fill':btnSelectedColor, r: 2});
			self.splitBtnGlow.remove();
			self.handlesLayer.hide();
			self.rectangleLayer.hide();

			//Create split rectangles
			createSplitRectangle();

			//Disable Hor/Ver split buttons
			self.verBtnImg.attr({ src: VER_INACTIVE_IMAGE });
			self.horBtnImg.attr({ src: HOR_INACTIVE_IMAGE });
		}
		else
		{
			self.splitBtn.attr({'fill':btnDefaultColor, r: 2});
			self.splitBtnGlow = self.splitBtn.glow({
							 width:2,
							 fill:true,
							 offsetx :1,
							 offsety:1,
							 color:'grey'
						   });
		    self.handlesLayer.show();
		    self.rectangleLayer.show();

		    var newRect = getNewRect();

		    if(newRect !== undefined)
		    {
		    	self.rectangleLayer.setWidth(newRect.width);
			    self.rectangleLayer.setHeight(newRect.height);
			    self.handlesLayer.onRectangleResized();

			    //Update panel size
				self.handlesLayer.updatePanelSize();
		    }

		    //remove split objects
		    removeSplitRectangle();

		    //Enable Hor/Ver split buttons
			self.verBtnImg.attr({ src: VER_DEFAULT_IMAGE });
			self.horBtnImg.attr({ src: HOR_DEFAULT_IMAGE });
			self.handlesLayer.rectHorizontalHandle.toFront();
			self.handlesLayer.rectVerticalHandle.toFront();
		}
	}

	//On Horizontal Split Button Clicked
	var onHorizontalSplitClicked = function()
	{
		horizontalSplitSelected = !horizontalSplitSelected;

		if(!splitSelected)
		if(horizontalSplitSelected)
		{
			self.horizontalSplitBtn.attr({'fill':btnSelectedColor, r: 2});
			self.horizontalSplitBtnGlow.remove();
			self.horizontalPopup.show();
			//self.verticalPopup.hide(); // greg
		}
		else
		{
			self.horizontalSplitBtn.attr({'fill':btnDefaultColor, r: 2});
			self.horizontalSplitBtnGlow = self.horizontalSplitBtn.glow({
							 width:2,
							 fill:true,
							 offsetx :1,
							 offsety:1,
							 color:'grey'
						   });
			self.horizontalPopup.hide();
		}
	}

	//On Vertical Split Button Clicked()
	var onVerticalSplitClicked = function()
	{
		verticalSplitSelected = !verticalSplitSelected;

		if(!splitSelected)
		if(verticalSplitSelected)
		{
			self.verticalSplitBtn.attr({'fill':btnSelectedColor, r: 2});
			self.verticalSplitBtnGlow.remove();

			self.verticalPopup.show();
			//self.horizontalPopup.hide(); // greg
		}
		else
		{
			self.verticalSplitBtn.attr({'fill':btnDefaultColor, r: 2});
			self.verticalSplitBtnGlow = self.verticalSplitBtn.glow({
							 width:2,
							 fill:true,
							 offsetx :1,
							 offsety:1,
							 color:'grey'
						   });

			self.verticalPopup.hide();
		}
	}


	//Handler for popup menu
	var onHorizontalSplitValueChanged = function(newVal)
	{
		self.handlesLayer.updateCellCountY(newVal);
	}

	var onVerticalSplitValueChanged = function(newVal)
	{
		self.handlesLayer.updateCellCountX(newVal);
	}


	this.init = function()
	{
		//Init Split Button
		self.splitBtn = panel.rect(pos.x, pos.y, btnW, btnH);
		self.splitBtn.attr({'fill':btnDefaultColor, r: 2, stroke: "rgba(0,0,0,0)"});
		self.splitBtnGlow = self.splitBtn.glow({
							 width:2,
							 fill:true,
							 offsetx :1,
							 offsety:1,
							 color:'grey'
						   });

	    self.panel.image("lib/externalTools/Rectangle/images/split_icon.svg", pos.x, pos.y, btnW, btnH).node.onclick = onSplitClicked;

	    //Init Horizontal Split Button
	    self.horizontalSplitBtn = panel.rect(pos.x, pos.y + btnH  + 20, btnW, btnH);
		self.horizontalSplitBtn.attr({'fill':btnDefaultColor, r: 2, stroke: "rgba(0,0,0,0)"});
		self.horizontalSplitBtnGlow = self.horizontalSplitBtn.glow({
							 width:2,
							 fill:true,
							 offsetx :1,
							 offsety:1,
							 color:'grey'
						   });

	    self.horBtnImg = self.panel.image(HOR_DEFAULT_IMAGE, pos.x, pos.y + btnH  + 20, btnW, btnH);
	    self.horBtnImg.node.onclick = onHorizontalSplitClicked;

	    //Init Vertical Split Button
		self.verticalSplitBtn = panel.rect(pos.x + btnW + 20, pos.y, btnW, btnH);
		self.verticalSplitBtn.attr({'fill':btnDefaultColor, r: 2, stroke: "rgba(0,0,0,0)"});
		self.verticalSplitBtnGlow = self.verticalSplitBtn.glow({
							 width:2,
							 fill:true,
							 offsetx :1,
							 offsety:1,
							 color:'grey'
						   });

		self.verBtnImg = self.panel.image(VER_DEFAULT_IMAGE, pos.x + btnW + 20, pos.y, btnW, btnH);
	    self.verBtnImg.node.onclick = onVerticalSplitClicked;

	    //Init popup menus
	    self.verticalPopup = new PopupMenu(self.panel, {x: pos.x + btnW + btnW/2 + 20, y: pos.y}, "top");
	    self.verticalPopup.setVal(self.gridLayer.cellCount.y);
	    self.verticalPopup.onValueChanged = onVerticalSplitValueChanged;
	    self.verticalPopup.hide();

	    self.horizontalPopup = new PopupMenu(self.panel, {x: pos.x, y: pos.y + btnH  + 20 + btnH/2}, "left");
	    self.horizontalPopup.setVal(self.gridLayer.cellCount.x);
	    self.horizontalPopup.onValueChanged  = onHorizontalSplitValueChanged;
	    self.horizontalPopup.hide();

	}
	this.init();

}





			//--------------------------------------------------------------------------------
			//-------------------------- Controller Implementation ---------------------------
			//--------------------------------------------------------------------------------

			$scope.container = $element.find('#container');
			$scope.myPanel = new  Raphael($scope.container[0], 350, 350);

			var popupW = 85;
	     	var popupH = 90;
	     	var btnW = 44;
	     	var btnH = 45;

	     	var rectLayer = new RectangleLayer($scope.myPanel);
	     	var gridLayer = new GridLayer($scope.myPanel, {x: popupH + btnW + 20, y: popupH + btnW + 20}, 150, 150, {x:1, y:1});
	     	var handlesLayer = new HandlesLayer($scope.myPanel, rectLayer, gridLayer, {x: popupH + btnW + 5, y: popupH + btnW + 5});
	     	var menuLayer = new MenuLayer($scope.myPanel, {x:popupH, y:popupH}, handlesLayer, rectLayer, gridLayer);



			$scope.clear = function()
			{
				if($scope.myPanel !== undefined)
					$scope.myPanel.remove();
			}

			$scope.reset = function()
			{
					$scope.clear();

	  		      	$scope.myPanel = new  Raphael($scope.container[0], 350, 350);

	  			  	rectLayer = new RectangleLayer($scope.myPanel);
	  		     	gridLayer = new GridLayer($scope.myPanel, {x: popupH + btnW + 20, y: popupH + btnW + 20}, 150, 150, {x:1, y:1});
	  		     	handlesLayer = new HandlesLayer($scope.myPanel, rectLayer, gridLayer, {x: popupH + btnW + 5, y: popupH + btnW + 5});
	  		     	menuLayer = new MenuLayer($scope.myPanel, {x:popupH, y:popupH}, handlesLayer, rectLayer, gridLayer);
			}


        }); //End of Controller


})();
