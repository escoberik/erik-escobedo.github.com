(function() {
    'use strict';
    //math tools template for registering the tool
    var template = {
        type: 'SplitterTool',
        displayName: 'Splitter',
        htmlTemplate: '<splitter-tool tool-id="splitterAppId" container-api="containerApi" id="tool-{{toolId}}"></splitter-tool>',
        exportTargets: ['table'],
        applet: true
    };

    //add the module as a math tool dependency
    window.mt.loadModules.push('splitterToolModule');

    angular.module('splitterToolModule', ['mt.common'])
        .config(function (toolRegistryServiceProvider) {
            toolRegistryServiceProvider.addTemplate(template);
        })
        .directive('splitterTool', function()
        {
            return {
                scope: {
                    toolId: '=',
                    containerApi: '='
                },
                replace: true,
                restrict: 'E',
				link: function($scope, $element, $attr)
				{

				},
	            controller: 'splitterController',
	            templateUrl: 'lib/externalTools/splitter/index.html'//'<div> <div id="container" style="width:1023px; height:768px;"></div></div>'
	        };
        })
        .directive('popOver', function ($compile)
        {

		  return {
		    restrict: "A",
		    transclude: false,
		    link: function (scope, element, attrs) {

		      var popOverContent;
		      var body = angular.element("[tool-id='splitterAppId']");
		      var html = "<div>" + $("#" + scope.contentid, body).html() + "</div>";
			  popOverContent = html;
		      //popOverContent = $compile(html)(scope.parentScope);

	          $(element).bind('compileContent',function()
	          {
			  		$compile($(element).parent().find(".popover"))(scope.parentScope);
			  });

		      var options = {
		        content: popOverContent,
		        title: '',
		        placement: "bottom",
		        html: true
		      };
		      $(element).popover(options);

		    },
		    controller: function($scope){

			  	$scope.status = true;

		    },
		    scope: {
		    	contentid: '@',
		    	parentScope: '='
		    }
		  };
		})
        .controller('splitterController', function($scope, $element, toolPersistorService, dataExchangeService) {
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

            console.log = function(){};

            //---------------------------------- External Files ------------------------------------------------

				/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
				/* Merging js from "splitter_files.txt" begins */
				/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


				/* Last merge : Thu Aug 28 20:12:10 PKT 2014  */

				/* Merging order :

				- PinchLayer.js
				- BinObject.js
				- SplitterObject.js
				- SplitterMenu.js
				- PanelSplitter.js
				- Stack.js
				- TemplateRunner.js

				*/


				/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
				/* Merging js: PinchLayer.js begins */
				/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


				function PinchLayer (parent, config) {

					var self = this;

					self.parent = parent;
					self.layer = new Kinetic.Layer(config);
					self.header = [];

					self.binLayer = new Kinetic.Layer({
						x: 0,
						y: 0,
						width: self.layer.width(),
						height: 0,
						visible: false
					});
					self.binTitlesBox = new Kinetic.Group({
						x: 0,
						y: 0,
						width: self.layer.width(),
						height: 0,
						visible: false
					});
					self.border = new Kinetic.Rect({
						x: 0,
						y: 0,
						width: self.layer.width(),
						height: self.layer.height(),
						stroke: "grey",
						strokeWidth:1,
						fillEnabled: false
					});
					self.container = new Kinetic.Group({
						x: 0,
						y: 0,
						width: self.layer.width(),
						height: self.layer.height()
					});

					self.layer.clip({
						x: 0,
						y: 0,
						width: self.layer.width(),
						height: self.layer.height()
					});
					self.binLayer.clip({
						x: 0,
						y: 0,
						width: self.binTitlesBox.width(),
						height: self.binTitlesBox.height()
					});

					self.background = new Kinetic.Rect({
						x: 0,
						y: 0,
						width: self.container.width(),
						height: self.container.height(),
						fill: "white"
					});

					self.layer.draggable(false);
					self.container.add(self.background);
					self.layer.add(self.container);
					self.layer.add(self.border);
					self.binLayer.add(self.binTitlesBox);
					self.parent.add(self.binLayer);
					self.parent.add(self.layer);

					self.removeChildren = function() {
						self.layer.removeChildren();
						self.binLayer.removeChildren();
						self.draw();
					};
					self.add = function(obj) {
						self.container.add(obj);
						self.layer.draw();
						self.binTitlesBox.draw();
					};
					self.addBase = function() {

						self.layer.add(self.container);
						self.layer.add(self.border);

					};

					self.draw = function() {
						self.layer.draw();
						self.binLayer.draw();
					};
					self.batchDraw = function() {
						self.layer.batchDraw();
						self.binLayer.batchDraw();
					};

					self.setClip = function(val){
						self.layer.setClip(val);
					}
					self.getStage = function() {
						return self.layer.getStage();
					};
					self.setupForBins = function() {
						self.binLayer.visible(true);
						self.binLayer.height(50);
						self.binTitlesBox.height(50);
						var bg = new Kinetic.Rect({
							x: 0,
							y: 0,
							width: self.binTitlesBox.width(),
							height: self.binTitlesBox.height(),
							fill: "white",
							stroke: "grey",
							strokeWidth: 1
						});
						self.binLayer.add(bg);
						self.binTitlesBox.visible(true);
						self.layer.y(self.binTitlesBox.height());
						self.layer.height(config.height - self.binTitlesBox.height());
						self.border.height(self.layer.height());
						self.layer.clipHeight(self.layer.height());
						bg.moveToBottom();

						self.layer.draw();
					}

					self.width = function() {
						return self.container.width();
					};
					self.height = function() {
						return self.container.height();
					};
					self.setHeight = function(val) {

						self.layer.height(val);
						self.layer.clipHeight(self.layer.height());
						self.container.height(self.layer.height());
						//self.background.height(self.container.height()); // I don't want to change the background size to match for the bottom.
																			// Maybe the top? - greg
						self.border.height(val);

					}
					self.setWidth = function(val) {
						self.layer.width(val);
					}
					self.getX = function() {
						return self.layer.x();
					};
					self.getY = function() {
						return self.layer.y();
					};
					self.setX = function(val) {
						self.layer.x(val);
					}
					self.setY = function(val) {
						self.layer.y(val);
					}
					self.getScale = function() {
						return self.container.scaleX();
					};

					self.getId = function()
					{
						return self.layer.id();
					}
					self.setId = function(val)
					{
						self.layer.id(val);
					}

					self.getDistance = function(touch1, touch2) {
						var x1 = touch1.x;
						var x2 = touch2.x;
						var y1 = touch1.y;
						var y2 = touch2.y;
						return Math.sqrt(((x2 - x1) * (x2 - x1)) + ((y2 - y1) * (y2 - y1)));
					}
					self.updateTitleBar = function(binObjects){
						self.binTitlesBox.x(self.container.x());

						if (self.binTitlesBox.visible()) {
							var scale = self.getScale();

							for (var i = 0; i < binObjects.length; i++) {

								var unitW = 0;
								//var unitX = 0;

								var icon_xAxis = 0;

								if(binObjects[i].objectInfo.type == 3) {
									unitW = (binObjects[i].radius * 2 * scale) + (20 * scale);
									icon_xAxis = unitW*i - unitW/2 + 20*scale;
								}else {
									unitW = (binObjects[i].frame.width * scale) + (20 * scale);
									icon_xAxis = unitW*i + 20*scale;
								}

								icon_xAxis = unitW*i + (20*scale);

								var headerContainer = binObjects[i].headerContainer;
								var title = self.header[i].title;
								var bg = self.header[i].bg;

								headerContainer.setX(unitW*i);

								headerContainer.setWidth(unitW);
								title.setWidth(unitW);
								bg.setWidth(unitW);

								//icon.setX(icon_xAxis);
							}
						}

						self.binLayer.draw();
					}

					self.removeHeader = function(index){
						self.header.splice(index, 1);
					};
					self.addHeader = function(titleBackground, titleIcon, title)
					{
						console.log("Adding Header")
						self.header.push({bg:titleBackground, icon:titleIcon, title:title});
						//self.binTitlesBox.add(titleBackground);
						//self.binTitlesBox.add(titleIcon);
						//self.binTitlesBox.add(title);
					};

					self.moveTo = function(obj) {
						self.layer.moveTo(obj);
					};
				}


				/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
				/* Merging js: BinObject.js begins */
				/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


				function BinObject(scope, layer, mainLayer, objectInfo) {
				 	var self = this;

					self.objectInfo = objectInfo;
					self.removeSelf = undefined;

					self.mainType = 1;
					self.type = 1;

					self.frame = {
						width: 0,
						height: 0,
						x: 0,
						y: 0
					};
					self.radius = 0;
					self.cornerRadius = 0;
					self.color = 'rgba(204,204,204,1)';
					self.isSelected = false;
					self.layer = layer;
					self.mainLayer = mainLayer;

					self.setColor = function(color) {
						self.shape.setFill(color);
					};
					self.getColor = function() {
						return self.shape.fill();
					};

					self.setRadius = function(radius) {
						if (self.objectInfo.type == 3) {
							self.shape.setRadius(radius);
							self.radius = radius ;
							self.frame.width = (radius * 2);

							self.titleBackground.width(radius*2 + 20);
							self.title.width(radius*2 + 20);

							var x = self.headerContainer.x() - radius;
							self.headerContainer.x(x);

							//self.title.x(x);
							//self.titleIcon.x(x + 20);
							//self.titleBackground.x(x);
						}
					}
					self.getRadius = function() {
						if (self.objectInfo.type == 3){
							console.log("Checking Radius : " + self.shape.getClassName());
							console.log("Checking Radius : " + self.shape.radius());
							return self.shape.getRadius();
						}
						else return 0;
					}

					self.setCornerRadius = function(cornerRadius) {
						if (self.objectInfo.type == 2) {
							self.shape.setCornerRadius(cornerRadius);
						}
					}
					self.getCornerRadius = function() {
						if (self.objectInfo.type == 2) return self.shape.cornerRadius();
					}

					self.setFrame = function(x, y, width, height) {

						if (self.objectInfo.type == 3) return;

						self.container.x(x + 10);
						self.container.y(y);
						self.frame.x = 0,
						self.frame.y = 0,
						self.frame.height = height;
						self.frame.width = width;
						self.shape.height(height);
						self.shape.width(width);

					};
					self.getFrame = function() {
						if (self.objectInfo.type == 3) return null;

						return {
							"x": self.getX(),
							"y": self.getY(),
							"width": self.shape.width(),
							"height": self.shape.height()
						};
					}

					self.setPosition = function(x, y) {
						self.container.x(x + 10);
						self.container.y(y);

						self.frame.x = x;
						self.frame.y = y;

						self.headerContainer.x(x);
						//self.title.x(x);
						//self.titleIcon.x(x+20);
						//self.titleBackground.x(x);
					};
					self.getPosition = function(x, y) {
						return {
							x: self.getX(),
							y: self.getY()
						};
					};

					self.setWidth = function(width) {
						if (self.objectInfo.type == 3) return;

						self.frame.width = width;
						self.shape.width(width);

						self.headerContainer.width(x);

					};
					self.setHeight = function(height) {
						if (self.objectInfo.type == 3) return;
						self.frame.height = height;
						self.shape.height(height);
					};
					self.setSize = function(width, height) {
						if (self.objectInfo.type == 3) return;

						self.frame.height = height;
						self.frame.width = width;
						self.shape.height(height);
						self.shape.width(width);

						self.headerContainer.x(width + 20);

						//self.title.width(width + 20);
						//self.titleBackground.width(width + 20);

						//console.log("Title: " + self.title.text() + " x: " + self.title.x() + " width: " + self.title.width());
						//console.log(" x: " + self.title.x() + " width: " + self.title.width());
					};
					self.getX = function() {
						return self.container.x() - 10;
					};
					self.getY = function() {
						return self.container.y();
					};

					self.changeShape = function(shape, index, binW, binY) {
						self.shape.destroy();
						self.shape = null;
						self.container.removeChildren();

						var currentType = self.objectInfo.type;
						var x = 0;
						var y = 0;

						// This is padding Offset
						var xAxis_offset =  20*index;

						if (shape.name == "circle") {
							console.log("Bin Selected Shape is : Circle");

							self.objectInfo.type = 3;
							self.objectInfo.desc = "Circle";

							self.shape = new Kinetic.Circle({
								x: x,
								y: y,
								stroke: 'rgba(204,204,204,1)',
								fill: "rgba(247,247,247,1)",
								radius: binW / 2,
								listening: false
							});

							self.setPosition(binW*index + binW/2 + xAxis_offset, binY + binW/2);
							self.setRadius(binW/2);
						}
						else if (shape.name == "rectRoundCorner") {
							console.log("Bin Selected Shape is : Rect Rounc Corner");

							self.objectInfo.type = 2;
							self.objectInfo.desc = "Square with Round Corner";

							self.shape = new Kinetic.Rect({
								x: x,
								y: y,
								width: binW,
								height: binW,
								stroke: "rgba(204,204,204,1)",
								fill: "rgba(247,247,247,1)",
								cornerRadius: 25,
								listening: false
							});

							self.setPosition(binW*index + xAxis_offset, binY);
						}
						else if (shape.name == "square") {
							console.log("Bin Selected Shape is : Square");

							self.objectInfo.type = 1;
							self.objectInfo.desc = "Square";

							self.shape = new Kinetic.Rect({
								x: x,
								y: y,
								width: binW,
								height: binW,
								stroke: "rgba(204,204,204,1)",
								fill: "rgba(247,247,247,1)",
								listening: false
							});

							self.setPosition(binW*index + xAxis_offset, binY);
						}

						self.radius = binW/2;
						self.container.add(self.shape);
						self.layer.draw();
					};
					self.changeIconGraphic = function(graphic) {
						console.log("Change Graphic Image : " + graphic.image);

						var imgScaleX = 0.08;
						var imgScaleY = 0.08;

						var imgOffsetX = 0.2;
						var imgOffsetY = 0.2;

						var iconX = -5;
						var iconY = 0;
						var iconW = 30;
						var iconH = 30;

						if (graphic.name == "square") {
							self.mainType = 1;
							self.type = 1;
							iconX += 10;
							iconY = 10;
						}
						else if (graphic.name == "circle") {
							self.mainType = 1;
							self.type = 2;
							iconX += 25;
							iconY = 25;

							imgOffsetX = 190;
							imgOffsetY = 190;
						}
						else if (graphic.name == "rectLandscape") {
							self.mainType = 1;
							self.type = 3;
							iconH = 16;
							iconX += 10;
							iconY = 17;
						}
						else if (graphic.name == "rectPortrait") {
							self.mainType = 1;
							self.type = 4;
							iconW = 16;
							iconX += 17;
							iconY = 10;
						}

						self.titleIcon.destroy();
						self.titleIcon = null;

						if (self.type == 2) {
							self.titleIcon = new Kinetic.Circle({
								x: iconX,
								y: iconY,
								radius: 15
							});
						}
						else {
							self.titleIcon = new Kinetic.Rect({
								x: iconX,
								y: iconY,
								width: iconW,
								height: iconH
							});
						}

						var imageObj = new Image();

						imageObj.onload = function() {
							self.titleIcon.fillPatternImage(imageObj);

							self.titleIcon.fillPatternScale({
								x: imgScaleX,
								y: imgScaleY
							});

							self.titleIcon.fillPatternOffset({
								x: imgOffsetX,
								y: imgOffsetY
							});

							self.layer.draw();
						};

						imageObj.src = graphic.image;
						self.headerContainer.add(self.titleIcon);
					};
					self.changeIconShape = function(shape) {
						console.log("Change Shape of title Icon : " + shape.name);

						var iconX = -5;
						var iconY = 0;
						var iconW = 30;
						var iconH = 30;

						if (shape.name == "square") {
							self.mainType = 1;
							self.type = 1;
							iconX += 10;
							iconY = 10;
						}
						else if (shape.name == "circle") {
							self.mainType = 1;
							self.type = 2;
							iconX += 25;
							iconY = 25;
						}
						else if (shape.name == "rectLandscape") {
							self.mainType = 1;
							self.type = 3;
							iconH = 16;
							iconX += 10;
							iconY = 17;
						}
						else if (shape.name == "rectPortrait") {
							self.mainType = 1;
							self.type = 4;
							iconW = 16;
							iconX += 17;
							iconY = 10;
						}

						self.titleIcon.destroy();
						self.titleIcon = null;

						if (self.type == 2) {
							self.titleIcon = new Kinetic.Circle({
								x: iconX,
								y: iconY,
								radius: 15,
								fill: self.color
							});
						}
						else {
							self.titleIcon = new Kinetic.Rect({
								x: iconX,
								y: iconY,
								width: iconW,
								height: iconH,
								fill: self.color
							});
						}
						self.headerContainer.add(self.titleIcon);
					};

					self.openDialogue = function(posx, posy, width, height, mid) {
						self.dialog = new Kinetic.Rect({
							x: posx,
							y: posy,
							width: width,
							height: height,
							fill: 'black',
							cornerRadius: 4,
							shadowColor: 'rgba(0,0,0,0.5)',
							shadowBlur: 1,
							shadowOffsetX: 2,
							shadowOffsetY: 2
						});
						self.label1 = new Kinetic.Text({
							x: posx,
							y: posy + 3,
							width: width,
							height: height,
							fontSize: 18,
							text: 'Discard',
							align: 'center',
							fontFamily: 'HelveticaNeue',
							fill: 'white'
						});
						self.triangle = new Kinetic.Line({
							points: [mid, posy + height + 13, mid + 13.5, posy + height - 0.3, mid - 13.5, posy + height - 0.3],
							// stroke: 'black',
							// strokeWidth: 0.3,
							shadowColor: 'rgba(0,0,0,0.5)',
							shadowBlur: 1,
							shadowOffsetX: 1,
							shadowOffsetY: 1,
							closed: true,
							fill: 'black'
						});

						self.dialog.on('mousedown touchstart', function(evt) {
							evt.cancelBubble = true;

							self.removeSelf(1);
							self.reAdjustBins();
						});
						self.label1.on('mousedown touchstart', function(evt) {
							evt.cancelBubble = true;

							self.removeSelf(1);
							self.reAdjustBins();
						});
						self.triangle.on('mousedown touchstart', function(evt) {
							evt.cancelBubble = true;

							self.removeSelf(1);
							self.reAdjustBins();
						});

						self.layer.add(self.dialog);
						self.layer.add(self.triangle);
						self.layer.add(self.label1);

						self.triangle.moveToTop();
						self.dialog.moveToTop();
						self.label1.moveToTop();

						self.layer.draw();
					}
					self.selectBin = function(evt)
					{
						if (self.selectionRect) return;
						self.makeSelected();

						scope.templateRunner.closeAllPopupMenus();

						var xAxis = self.getX();
						var yAxis = self.getY();

						if (self.objectInfo.type == 3) {
							xAxis -= self.radius;
							yAxis -= self.radius;
						}

						var width = self.frame.width + 20;
						var height = self.layer.height() - 5;

						self.selectionRect = new Kinetic.Rect({
							x: xAxis,
							y: 2,
							width: width,
							height: self.layer.background.height(),
							stroke: 'blue',
							strokeWidth: 1
						});

						self.shape = new Kinetic.Circle({
							x: 0,
							y: 0,
							stroke: 'rgba(204,204,204,1)',
							fill: self.color,
							radius: self.radius,
							listening: false
						});

						self.layer.add(self.selectionRect);

						var mid = (self.frame.width + 20) / 2;

						self.selectionRect.moveToTop();
						self.openDialogue(xAxis + (mid - 35), 2, 70, 25, xAxis + mid);

						self.layer.draw();
					};

					self.removeSelf = function(value) {
						console.log("Removing Bin");

						if(value == 1){
							self.layer.removeHeader(self.getIndex());
							self.removeFromArray();
							self.deSelectBin();
						}

						self.container.destroy();
						self.headerContainer.destroy();
					};
					self.draw = function() {
						self.container = new Kinetic.Group({
							x: 50,
							y: 10
						});

						if (self.objectInfo.type == 1) {
							self.shape = new Kinetic.Rect({
								x: self.frame.x,
								y: self.frame.y,
								width: self.frame.width,
								height: self.frame.height,
								stroke: "rgba(204,204,204,1)",
								fill: "rgba(247,247,247,1)",
								listening: false
							});
						}
						else if (self.objectInfo.type == 2) {
							self.shape = new Kinetic.Rect({
								x: self.frame.x,
								y: self.frame.y,
								width: self.frame.width,
								height: self.frame.height,
								stroke: "rgba(204,204,204,1)",
								fill: self.color,
								cornerRaius: self.cornerRadius,
								listening: false
							});
						}
						else if (self.objectInfo.type == 3) {
							self.radius = 75;
							self.shape = new Kinetic.Circle({
								x: 0,
								y: 0,
								stroke: 'rgba(204,204,204,1)',
								fill: self.color,
								radius: self.radius,
								listening: false
							});
						}

						self.headerContainer = new Kinetic.Group({
							x: self.frame.x,
							y: 0
						});

						self.title = new Kinetic.Text({
							x: 0,
							y: 15,
							width: self.frame.width,
							text: self.objectInfo.title,
							align: 'center',
							fontSize: 18,
							fontFamily: 'Calibri',
							fill: 'black'
						})

						self.titleIcon = new Kinetic.Circle({
							x: 20,
							y: 25,
							fill: 'rgba(204,204,204,1)',
							radius: 15
						});

						self.titleBackground = new Kinetic.Rect({
							x: 0,
							y: 0,
							width: this.frame.width,
							height: 50,
							stroke: "rgba(204,204,204,1)",
							strokeWidth: 1
						});
						self.title.on('click tap', function(evt) {
							evt.cancelBubble = true;
							self.selectBin(evt);
						});
						self.titleIcon.on('click tap', function(evt) {
							evt.cancelBubble = true;
							self.selectBin(evt);
						});
						self.titleBackground.on('click tap', function(evt) {
							evt.cancelBubble = true;
							self.selectBin(evt);
						});

						self.container.add(self.shape);
						self.headerContainer.add(self.titleBackground);
						self.headerContainer.add(self.title);
						self.headerContainer.add(self.titleIcon);

						self.layer.add(self.container);
						self.layer.binTitlesBox.add(self.headerContainer);

						self.layer.addHeader(self.titleBackground, self.titleIcon, self.title);
						self.layer.draw();
					};
					self.draw();
				}


				/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
				/* Merging js: SplitterObject.js begins */
				/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


				function SplitterObject(layer, binLayer, dragLayer, splitBar, shapeInfo) {

					var self = this;

					console.log("offset X : " + shapeInfo.offsetX);
					console.log("offset Y : " + shapeInfo.offsetX);
					console.log("scale X : " + shapeInfo.scaleX);
					console.log("scale Y : " + shapeInfo.scaleY);

					this.shapeInfo = shapeInfo;
					this.dragLayer = dragLayer;
					this.binLayer = binLayer;
					this.layer = layer;
					this.splitBar = splitBar;
					this.shapeType = shapeInfo.type;
					this.shapecolor = undefined;
					this.shapeimage = undefined;
					this.togglelasso = undefined;

					this.newYaxis = 0;

					this.shapecolor = shapeInfo.color;
					this.shapeimage = shapeInfo.image;

					this.mainType = shapeInfo.mainType;
					this.isSelected = false;
					this.showDivision = false;
					this.divisionLines = new Kinetic.Group();
					this.color = shapeInfo.color;
					this.undo = false;

					this.Watch  = undefined;

					var isMouseDown = false;
					this.container = new Kinetic.Group({
						listening: true
					});

					// We don't need to check for mainType as we have only two shapes here (Either Circle or Rectangle)
					// Square, Portait Rectangle and Landscape Rectangle are same shapes.
					if (this.shapeType == 1) {
						this.frame = {
							width: 50,
							height: 50,
							x: 0,
							y: 0
						};

						this.shape = new Kinetic.Shape();
						this.shadow = new Kinetic.Shape();

						this.selectionBorder = new Kinetic.Rect({
							x: this.frame.x,
							y: this.frame.y,
							width: this.frame.width,
							height: this.frame.height,
							stroke: "rgba(103,180,232,1)",
							strokeScaleEnabled: false
						});
					}
					else {
						this.selectedColor = "rgba(180,190,196,1)";
						this.radius = 50;

						this.shape = new Kinetic.Wedge();
						this.shadow = new Kinetic.Wedge();
						//this.selectionBorder = new Kinetic.Wedge();
					}

					this.startContainerPos;
					this.startLayerPos;

					this.draw = function() {

						if (this.shapeType == 1) {
							this.shadow = new Kinetic.Rect({
								x: this.frame.x + 5,
								y: this.frame.y + 5,
								width: this.frame.width,
								height: this.frame.height,
								fill: "rgba(0,0,0,0.4)"
							});
							this.shadow.visible(false);
							this.shape = new Kinetic.Rect({
								x: this.frame.x,
								y: this.frame.y,
								width: this.frame.width,
								height: this.frame.height,
								stroke: "black",
								strokeScaleEnabled: false
							});

							if(shapeInfo.mainType == 2){
								var imageObj = new Image();
								imageObj.onload = function() {
									self.shape.fillPatternImage(imageObj);
									self.shape.fillPatternScale({
									  	x: self.shapeInfo.scaleX,
									  	y: self.shapeInfo.scaleY
									});

									self.shape.fillPatternOffset({
										x: self.shapeInfo.offsetX,
										y: self.shapeInfo.offsetY
									});
									self.layer.draw();
								};

								imageObj.src = self.shapeInfo.image;
							}
							else{
								self.shape.fill(this.color);
							}

							this.container.width(this.frame.width);
							this.container.height(this.frame.height);
							this.container.add(this.shadow);
							this.container.add(this.shape);
							this.container.add(this.divisionLines);
							this.container.add(this.selectionBorder);
							this.selectionBorder.visible(false);
							this.container.draggable(true);
							if(this.shapeInfo.inWorkView)
							{
								this.layer.add(this.container);
								this.layer.draw();
							}
							else
							{
								this.binLayer.add(this.container);
								this.binLayer.draw();
							}

						}
						else {
							var strokeColor = "black";
							var shadowColor = "rgba(0,0,0,0.4)";
							var sliceNum = 1;

							this.shadow = new Kinetic.Wedge({
								x: 5,
								y: 5,
								fill: shadowColor,
								radius: this.radius,
								angleDeg: shapeInfo.angle,
								rotationDeg: shapeInfo.rotation
							});
							this.shadow.visible(false);

							if(shapeInfo.angle == 360)
							{
								console.log("Creating Circle");
								this.shape = new Kinetic.Circle({
									x: 0,
									y: 0,
									radius: this.radius,
									stroke: strokeColor,
									strokeWidth: 1,
									strokeScaleEnabled: false
								});
							}
							else
							{
								this.shape = new Kinetic.Wedge({
									x: 0,
									y: 0,
									radius: this.radius,
									stroke: strokeColor,
									strokeWidth: 1,
									angleDeg: shapeInfo.angle,
									rotationDeg: shapeInfo.rotation,
									strokeScaleEnabled: false
								});
							}


							this.selectionBorder = new Kinetic.Wedge({
								x: 0,
								y: 0,
								radius: this.radius,
								stroke: "rgba(103,180,232,1)",
								angleDeg: shapeInfo.angle,
								rotationDeg: shapeInfo.rotation,
								strokeScaleEnabled: false
							});

							this.container.width(this.radius * 2);
							this.container.height(this.radius * 2);
							this.container.add(this.shadow);
							this.container.add(this.shape);

							if(shapeInfo.mainType == 2){
								var imageObj = new Image();
								imageObj.onload = function() {

									self.shape.fillPatternImage(imageObj);
									self.shape.fillPatternScale({
									  	x: self.shapeInfo.scaleX,
									  	y: self.shapeInfo.scaleY
									});

									self.shape.fillPatternOffset({
										x: self.shapeInfo.offsetX,
										y: self.shapeInfo.offsetY
									});

									if (shapeInfo.angle != 360)
										self.shape.fillPatternRotation(-(shapeInfo.rotation));

									self.layer.draw();
								};

								imageObj.src = self.shapeInfo.image;

							}
							else{
								self.shape.fill(this.color);
							}

							this.shape.x *= self.layer.getScale();
							this.shape.y *= self.layer.getScale();
							this.container.add(this.divisionLines);
							this.container.add(this.selectionBorder);
							this.selectionBorder.visible(false);
							this.container.draggable(true);

							if(this.shapeInfo.inWorkView)
							{
								this.layer.add(this.container);
								this.layer.draw();
							}
							else
							{
								this.binLayer.add(this.container);
								this.binLayer.draw();
							}
						}
					};

					this.setShapeType = function(shape) {
						this.shapeType = shape;
					}
					this.getShapeType = function() {
						return this.shapeType;
					}

					this.getShapeColor = function() {
						return this.shapecolor;
					}

					this.getShapeImage = function() {
						return this.shapeimage;
					}

					this.setColor = function(color) {
						this.color = color;
						this.shape.fill(color);
						this.layer.draw();
					};

					this.setImage = function(img_src){
						var imageObj = new Image();
								imageObj.onload = function() {

									self.shape.fillPatternImage(imageObj);
									self.shape.fillPatternScale({
									  	x: 0.26,
									  	y: 0.26
									});

									if (shapeInfo.angle != 360)
									{
										self.shape.fillPatternOffset({
											x: shapeInfo.offsetX,
											y: shapeInfo.offsetY
										});
										self.shape.fillPatternRotation(-(shapeInfo.rotation));
									}
									self.layer.draw();
								};

								imageObj.src = img_src;
								this.layer.draw();
					}
					this.setSelected = function(val) {

						this.isSelected = val;

						if (this.isSelected && this.shapeInfo.inWorkView) {

							this.shape.strokeEnabled(false);
							this.selectionBorder.visible(true);
							this.layer.draw();
							this.onSelected(this);
						}
						else {
							this.shape.strokeEnabled(true);
							this.selectionBorder.visible(false);
							this.divisionLines.destroyChildren();
							this.layer.draw();
							this.onUnSelected(this);
						}
					};
					this.setWidth = function(width) {
						if (this.shapeType == 2) return;
						this.frame.width = width;
						this.shape.width(width);
						this.shadow.width(width);
						this.container.width(self.frame.width);
						this.selectionBorder.width(width);
						this.layer.draw();

					};

					this.setHeight = function(height) {
						if (this.shapeType == 2) return;
						this.frame.height = height;
						this.shape.height(height);
						this.shadow.height(height);
						this.container.height(self.frame.height);
						this.selectionBorder.height(height);
						this.layer.draw();
					};
					this.setFrame = function(x, y, width, height) {
						if (this.shapeType == 2) {
							this.container.setX(x);
							this.container.setY(y);
							this.frame.x = 0,
							this.frame.y = 0,
							this.shape.radius = width / 2;
							this.container.width(self.frame.width);
							this.container.height(self.frame.height);
						}
						else {
							this.container.setX(x);
							this.container.setY(y);
							this.frame.x = 0,
							this.frame.y = 0,
							this.frame.height = height;
							this.frame.width = width;
							this.shape.height(height);
							this.shape.width(width);
							this.shadow.width(width);
							this.shadow.height(height);
							this.container.width(self.frame.width);
							this.container.height(self.frame.height);
							this.selectionBorder.height(height);
							this.selectionBorder.width(width);
						}
						this.layer.draw();
					};
					this.setDivisions = function(horizontal, num) {
						if (this.shapeType == 2) {
							console.log("Making Devisions in Circle")
							this.divisionLines.destroyChildren();

							var rotation = this.getRotation();
							var angle = this.getAngle() / (num + 1);

							for (var i = 1; i <= num; i++) {
								this.divisionWedges = new Kinetic.Wedge({
									x: this.shape.getX(),
									y: this.shape.getY(),
									stroke: "rgba(0,0,0,0.5)",
									radius: this.getRadius(),
									strokeWidth: 1,
									angleDeg: angle,
									rotationDeg: rotation,
									strokeScaleEnabled: false
								});
								this.divisionLines.add(this.divisionWedges);

								rotation = rotation + angle;
							}
						}
						else {
							this.divisionLines.destroyChildren();
							if (horizontal) {

								for (var i = 1; i <= num; i++) {
									var dx = this.frame.x + i * this.frame.width / (num + 1);
									var line = new Kinetic.Line({
										points: [dx, this.frame.y, dx, this.frame.y + this.frame.height],
										stroke: "rgba(0,0,0,0.5)",
										tension: 1,
										strokeScaleEnabled: false
									});

									this.divisionLines.add(line);
								}
							}
							else {
								for (var i = 1; i <= num; i++) {
									var dy = this.frame.y + i * this.frame.height / (num + 1);
									var line = new Kinetic.Line({
										points: [this.frame.x, dy, this.frame.x + this.frame.width, dy],
										stroke: "rgba(0,0,0,0.5)",
										tension: 1,
										strokeScaleEnabled: false
									});
									this.divisionLines.add(line);
								}
							}
						}
						this.layer.draw();
					};

					this.setSize_Rect = function(width, height) {
						if (this.shapeType == 2) return;
						this.frame.height = height;
						this.frame.width = width;
						this.shape.height(height);
						this.shape.width(width);
						this.shadow.width(width);
						this.shadow.height(height);
						this.container.width(self.frame.width);
						this.container.height(self.frame.height);
						this.selectionBorder.height(height);
						this.selectionBorder.width(width);
						this.layer.draw();
					};
					this.setPosition_Rect = function(x, y) {
						this.container.setX(x);
						this.container.setY(y);
						this.newYaxis = y;
						this.frame.x = 0;
						this.frame.y = 0;
						this.layer.draw();
					};
					this.setSize_Circle = function(radius) {
						this.shape.setRadius(radius);
						this.container.setWidth(radius * 2);
						this.container.setHeight(radius * 2);
						this.layer.draw();
					};
					this.setPosition_Circle = function(x, y, angle, rotation) {
						this.container.setX(x);
						this.container.setY(y);
						this.newYaxis = y;

						if(angle != 360)
						{
							this.shape.setAngleDeg(angle);
							this.selectionBorder.setAngleDeg(angle);
							this.shadow.setAngleDeg(angle);

							this.shape.setRotationDeg(rotation);
							this.selectionBorder.setRotationDeg(rotation);
							this.shadow.setRotationDeg(rotation);
						}
						this.layer.draw();
					};

					this.getRadius = function(){
						return this.shape.getRadius();
					};
					this.getAngle = function(){
						return this.shapeInfo.angle;
					};
					this.getRotation = function(){
						if(this.getAngle() == 360)
							return 0;
						else
							return this.shape.getRotationDeg();
					};

					this.onSelected = function(obj) {};
					this.onUnSelected = function(obj) {};

					this.splitObject = function(num, isHorizontalSplit) {

						if(self.Watch!=undefined)
						{
							self.Watch(self);
						}

						if (this.getShapeType() == 1)
							return splitRectangle(this, num, isHorizontalSplit);
						else
							return splitCircle(this, num);
					}
					function splitRectangle(selectedObject, num, isHorizontalSplit) {
						var arrayOfObjects = [];

						var splitCount = num;
						var isHorizontal = isHorizontalSplit;
						var currObj = selectedObject;
						var startFrame = currObj.frame;
						var unitW = startFrame.width / (num + 1);
						var unitH = startFrame.height / (num + 1);

						for (var i = 1; i <= splitCount; i++) {
							if (isHorizontal) //Do a horizontal split!
							{
								var dx = currObj.container.getX() + i * unitW;

								if (i == 1) {
									currObj.setWidth(unitW);
								}

								var shapeInfoNew = {
									mainType:selectedObject.mainType,
									type: 1,
									offsetX: selectedObject.shapeInfo.offsetX + 190,//i*unitW,
									offsetY: selectedObject.shapeInfo.offsetY,
									scaleX: selectedObject.shapeInfo.scaleX,
									scaleY: selectedObject.shapeInfo.scaleY,
									inWorkView: self.shapeInfo.inWorkView
								};

								var shapeSizeNew = {
									Width:unitW,
									Height:startFrame.height
								};
								var shapePositionNew = {
									X:dx,
									Y:currObj.container.getY()
								};

								if(selectedObject.mainType == 1)
									shapeInfoNew.color = selectedObject.color;
								else
									shapeInfoNew.image = selectedObject.shapeInfo.image;

									arrayOfObjects.push([shapeInfoNew, shapeSizeNew, shapePositionNew]);
							}
							else //Do a vertical split!
							{
								var dy = currObj.container.getY() + i * unitH;

								if (i == 1)
									currObj.setHeight(unitH);

								var shapeInfoNew = {
									mainType:selectedObject.mainType,
									type: 1,
									offsetX: selectedObject.shapeInfo.offsetX,
									offsetY: selectedObject.shapeInfo.offsetY + 190,//i*unitH,
									scaleX: selectedObject.shapeInfo.scaleX,
									scaleY: selectedObject.shapeInfo.scaleY,
									inWorkView: self.shapeInfo.inWorkView
								};

								var shapeSizeNew = {
									Width:currObj.frame.width,
									Height:unitH
								};
								var shapePositionNew = {
									X:currObj.container.getX(),
									Y:dy
								};

								if(selectedObject.mainType == 1)
									shapeInfoNew.color = selectedObject.color;
								else
									shapeInfoNew.image = selectedObject.shapeInfo.image;

								arrayOfObjects.push([shapeInfoNew, shapeSizeNew, shapePositionNew]);
							}
						}
						return arrayOfObjects;
					}
					function splitCircle(selectedSliceObject, numberOfSlices) {
						if (selectedSliceObject.shape == null) return [];

						var arrayOfObjects = [];
						var rotation = selectedSliceObject.getRotation();
						var currentAngle = selectedSliceObject.getAngle();
						var angle = currentAngle / (numberOfSlices + 1);
						var count = numberOfSlices + 1;

						var x = selectedSliceObject.container.getX();
						var y = selectedSliceObject.container.getY();
						var radius = selectedSliceObject.getRadius();
						var mainType = selectedSliceObject.mainType;
						var color = selectedSliceObject.color;

						//if(currentAngle == 360)
						//{
						//	console.log("Parent Shape is Circle");
						//	count++;
							self.container.remove(selectedSliceObject);
						//}
						//else
						//	console.log("Parent Shape is Wedge");

						console.log("Number of slices : " + count);
						console.log("Chilren Angles : " + angle);

						for (var i = 0; i <count; i++) {

							//if (i == 0 && currentAngle != 360) {
							//	selectedSliceObject.setPosition_Circle(x, y, angle, rotation);
							//	rotation = rotation + angle;
							//}

							var shapeInfoNew = {
								mainType:mainType,
								type: 2,
								angle: angle,
								rotation: rotation,
								offsetX: selectedSliceObject.shapeInfo.offsetX,
								offsetY: selectedSliceObject.shapeInfo.offsetY,
								scaleX: 0.26,
								scaleY: 0.26,
								inWorkView: self.shapeInfo.inWorkView
							};

							var shapeSizeNew = {
								Radius:radius
							};
							var shapePositionNew = {
								X:x,
								Y:y,
								Angle:angle,
								Rotation:rotation
							};

							console.log("X : " + x);
							console.log("Y : " + y);
							console.log("Angle : " + angle);
							console.log("Rotation : " + rotation);

							if(mainType == 1)
								shapeInfoNew.color = color;
							else
								shapeInfoNew.image = selectedSliceObject.shapeInfo.image;

							arrayOfObjects.push([shapeInfoNew, shapeSizeNew, shapePositionNew]);
							rotation = rotation + angle;
						}

						return arrayOfObjects;
					}

					this.onDragStart = function(evt)
					{

						if(self.Watch!=undefined)
						{
							self.Watch(self);
						}

						self.startContainerPos = {
							x: self.container.getAbsolutePosition().x,
							y: self.container.getAbsolutePosition().y
						};

						var currPos = {
							x: self.container.getAbsolutePosition().x,
							y: self.container.getAbsolutePosition().y
						};
						self.container.moveTo(self.dragLayer);
						self.container.setAbsolutePosition(currPos);

						self.container.offsetX(5);
						self.container.offsetY(5);

						self.layer.draw();
						self.dragLayer.draw();
						self.binLayer.draw();

						self.shadow.visible(true);
						evt.cancelBubble = true;



					};
					this.onDragMove = function(evt) {
						self.dragLayer.draw();
						evt.cancelBubble = true;
					};
					this.onDragEnd = function() {

						var currPos = {
							x: self.container.getAbsolutePosition().x,
							y: self.container.getAbsolutePosition().y
						};

						if (currPos.y < self.layer.getY() - self.container.height() / 2) {
							self.container.moveTo(self.binLayer);
							self.shapeInfo.inWorkView = false;
							if(self.isSelected)
							{
								self.setSelected(false);
							}
						}
						else {
							self.container.moveTo(self.layer);
							self.shapeInfo.inWorkView = true;
						}

						self.container.setAbsolutePosition(currPos);

						self.container.offsetX(0);
						self.container.offsetY(0);
						self.shadow.visible(false);

						self.layer.draw();
						self.dragLayer.draw();
						self.binLayer.draw();
						self.splitBar.bar.draw();

						// evt.cancelBubble = true;
					};
					this.onClick = function(evt) {

						console.log(self.container.getParent().id() + " Vs " + self.binLayer.layer.id());
						if(self.container.getParent().id() === self.binLayer.layer.id())
						{
							return;
						}


						self.setSelected(true);
					};
					this.onMouseMove = function(evt){
						if(isMouseDown){
							evt.cancelBubble = true;
							self.undo = true;
						}
					};
					/*this.onMouseUp = function(){

						self.newYaxis = self.container.getY()- self.layer.getY();

						if(self.undo){
							console.log('Down and Move');
							if(self.Watch!=undefined){

								self.Watch(self);
							}
							self.undo = false;
						}else{
							console.log('Mouse up on Splitter object');
							self.onClick();
						}

						console.log('newYaxis: ' + self.newYaxis);
						// On lasso
						// self.togglelasso();
						isMouseDown = false;
					};*/

					this.container.on("dragstart", this.onDragStart);
					this.container.on("dragmove mousemove", this.onDragMove);
					this.container.on("dragend", this.onDragEnd);
					this.container.on("click tap", this.onClick); //For Mouse Events


					//Draw Object!
					this.draw();
				}





				/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
				/* Merging js: SplitterMenu.js begins */
				/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


				function SplitterMenu(layer, posx,posy, counterX, counterY) {

					var self = this;

					this.layer = layer;

					this.posx = posx;

					this.posy = posy;

					this.wedge = null;

					this.watch = undefined;

					this.wedges = new Array();

					var moveflag = false;

					this.setStageClickDisable = undefined;

					var flag = 0;

					this.counterX = counterX;

					this.counterY = counterY;

					this.valueChangedCallback = undefined;

					this.okCallback = undefined;

					this.removemenu = undefined;

					var newWedges = [];

					this.circle = new Kinetic.Circle({
				        x: this.posx,
				        y: this.posy,
				        radius: 30,
				        fill: 'white',
				        stroke: 'black',
				        strokeWidth: 1
				      });

					this.label = new Kinetic.Text({
				        fontSize: 18,
				        text: 'Split',
				        fontFamily: 'HelveticaNeue',
				        fill: 'black'
				    });

				    this.counter = new Kinetic.Text({
				        fontSize: 16,
				        fontFamily: 'HelveticaNeue',
				        fill: 'black'
				    });

				    this.counterCircle  = new Kinetic.Circle({
				        x: this.counterX,
				        y: this.counterY,
				        radius: 20,
				        fill: 'rgba(230,230,230,1)',
				        stroke: 'black',
				        strokeWidth: 1
				      });

				this.newWedge = function(){

					this.wedge = new Kinetic.Wedge({
						fill: 'white',
				        stroke: 'black',
				        strokeWidth: 1,
				        radius: 60,

					});

				};

				function touchAndMove(index)
				{

					moveflag = true;

					if(self.setStageClickDisable!=undefined){
						self.setStageClickDisable(moveflag);
					}

					if(flag != 0 && self.indexOfLastSelectedWedge != index){

						self.indexOfLastSelectedWedge = index;

						console.log("touch and move" + index);

						for(var count = 0; count<=index; count++){
							self.wedges[count].fill('rgba(153,204,255,0.7)');
						}

						for(var count = index+1; count<self.wedges.length; count++){
							self.wedges[count].fill('white');
						}

						self.valueChangedCallback(index);
						if( (index+1) > 9){
							self.counter.setX(self.counterX - 9);
						}else{
							self.counter.setX(self.counterX - 4);
						}
						self.counter.setText(index+1);
						self.layer.draw();
					}

				}

				function splitObjects(){

					console.log("Count of objects : " + self.indexOfLastSelectedWedge);


					if(self.indexOfLastSelectedWedge>0){

						if(self.okCallback !== undefined && self.removemenu !== undefined){

							self.okCallback(self.indexOfLastSelectedWedge);
							self.removemenu();
						}

						self.removeMenuSplit();

					}else{
						self.removemenu();
						self.removeMenuSplit();
					}

					flag = 0;
					moveflag = false;
				};



				this.onMouseDown = function() {

					for(var i=0; i<this.wedges.length; i++){
						this.wedges[i].on('mousedown touchstart', function(){
							flag=1;
							//touchAndMove(i);
						});

						this.wedges[i].on('mouseup touchend', function() {
							console.log('Mouse up');
							flag=0;
						});
					}

					this.label.on('mousedown touchstart', function() {
						splitObjects();
					});


					this.circle.on('mousedown touchstart', function() {
						splitObjects();
					});

					this.wedges[0].on('mousemove touchmove mousedown touchstart', function(){
						touchAndMove(0);
					});
					this.wedges[1].on('mousemove touchmove mousedown touchstart', function(){
					 	touchAndMove(1);
					});
					this.wedges[2].on('mousemove touchmove mousedown touchstart', function(){
						touchAndMove(2);
					});
					this.wedges[3].on('mousemove touchmove mousedown touchstart', function(){
						touchAndMove(3);
					});
					this.wedges[4].on('mousemove touchmove mousedown touchstart', function(){
						touchAndMove(4);
					});
					this.wedges[5].on('mousemove touchmove mousedown touchstart', function(){
						touchAndMove(5);
					});
					this.wedges[6].on('mousemove touchmove mousedown touchstart', function(){
						touchAndMove(6);
					});
					this.wedges[7].on('mousemove touchmove mousedown touchstart', function(){
						touchAndMove(7);
					});
					this.wedges[8].on('mousemove touchmove mousedown touchstart', function(){
						touchAndMove(8);
					});
					this.wedges[9].on('mousemove touchmove mousedown touchstart', function(){
						touchAndMove(8);
					});
					this.wedges[10].on('mousemove touchmove mousedown touchstart', function(){
						touchAndMove(10);
					});
					this.wedges[11].on('mousemove touchmove mousedown touchstart', function(){
						touchAndMove(11);
					});
				};


					this.draw = function() {
						var angle = 30;
						var rotation = -120;

						for(var i=0; i<12; i++){

							rotation += 30;

							this.newWedge();

							this.wedge.setX(posx);
							this.wedge.setY(posy);
							this.wedge.setAngleDeg(angle);
							this.wedge.setRotationDeg(rotation);

							this.layer.add(this.wedge);

							this.wedges.push(this.wedge);

							 this.wedge.on('mouseover', function() {
				        		document.body.style.cursor = 'pointer';
				      		});

				      		this.wedge.on('mouseout', function() {
				        		document.body.style.cursor = 'default';
				        		// flag = 0;
				      		});

						}

						this.label.setX(this.posx - 15);
						this.label.setY(this.posy - 10);

						this.counter.setX(this.counterX - 4);
						this.counter.setY(this.counterY - 6);

						this.layer.add(this.circle);
						this.layer.add(this.label);
						this.layer.add(this.counterCircle);
						this.counterCircle.moveToTop();
						this.layer.add(this.counter);


						this.wedges[0].fill('rgba(153,204,255,0.5)');
						this.wedges[1].fill('rgba(153,204,255,0.5)');

						//this.valueChangedCallback(1);
						this.counter.setText(2);
						moveflag = false;
						this.layer.draw();

					};

					this.draw();
					this.indexOfLastSelectedWedge = 1;

					this.onMouseDown(this.wedges);

				this.removeMenuSplit = function() {

					this.circle.remove();
					this.label.remove();

					for(var i=0; i<12; i++){
						this.wedges[i].remove();
					}
					this.counterCircle.remove();
					this.counter.remove();

					this.layer.draw();

					moveflag = false;

				};




				}// main function

				/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
				/* Merging js: PanelSplitter.js begins */
				/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


				function PanelSplitter(parent, top, bottom, config)
				{
					this.parent = parent;
					this.container = new Kinetic.Layer({
						x: 0,
						y: 0,
						width: this.parent.width(),
						height: this.parent.height()
					});

					this.bar = new Kinetic.Group({
						x: config.x,
						y: config.y,
						width: config.width,
						height: config.height,
						draggable: true,
						dragBoundFunc: function(pos)
						{
							var y = pos.y;
							if( pos.y < 100)
							{
								y =100;
							}
							if(pos.y > self.parent.height() - 200)
							{
								y = self.parent.height() - 200;
							}
							return { x: 0, y: y };
						}
					});

					this.onSplitMoved = undefined;

					this.barRect = new Kinetic.Rect({
						x: 0,
						y: 0,
						width: config.width,
						height: config.height,
						strokeWidth: 1,
						stroke: "grey",
						fill: "white"
					});


					this.line = new Kinetic.Rect({

						x: (config.width/2 - 5),
						y: config.height - 5,
						width: 10,
						height: 2,
						fill: "grey"
					});

					this.topPanel = top;
					this.bottomPanel = bottom;

					self = this;

					this.bar.on("dragstart dragmove dragend", function(evt)
					{
						self.topPanel.setHeight(self.bar.y() - self.topPanel.layer.y());
						self.bottomPanel.setY(self.bar.y() + self.bar.height() +1);
						self.bottomPanel.setHeight(parent.height() - (self.bar.y() + self.bar.height() +1));

						//self.parent.batchDraw(); // not sure it's needed. I think things get drawn right after anyway - greg
						/*
						console.log(" ------------- info ---------------");
						console.log("TopPanel: [" +  self.topPanel.layer.x() + ", " + self.topPanel.layer.y() + ", "
						+ self.topPanel.layer.width() + ", " + self.topPanel.layer.height() + "]"
						+ "Container: [" + self.topPanel.container.x() + " : " + self.topPanel.container.offsetX() + ", " + self.topPanel.container.y() + " : " + self.topPanel.container.offsetY() + ", " + self.topPanel.container.width() + ", " + self.topPanel.container.height() + "] "+
						"Clip: " + self.topPanel.layer.clipY() + ", " + self.topPanel.layer.clipHeight());

						console.log("SplitBar: [" +  self.bar.x() + ", " + self.bar.y() + ", "
						+ self.bar.width() + ", " + self.bar.height() + "] " + self.barRect.y());

						console.log("BottomPanel: [" +  self.bottomPanel.layer.x() + ", " + self.bottomPanel.layer.y() + ", "
						+ self.bottomPanel.layer.width() + ", " + self.bottomPanel.layer.height() + "] "+ "Container: [" + self.bottomPanel.container.x() + " : " + self.bottomPanel.container.offsetX() + ", " + self.bottomPanel.container.y() + " : " + self.bottomPanel.container.offsetY() + ", " + self.bottomPanel.container.width() + ", " + self.bottomPanel.container.height());

						console.log("-----------------------------------");
						*/
						evt.cancelBubble = true;

						if(self.onSplitMoved !== undefined)
							self.onSplitMoved();
					});

					this.container.on("tap click", function(){
						console.log("Bar taped or clicked");
					});

					//Init
					this.bar.add(this.barRect);
					this.bar.add(this.line);
					this.container.add(this.bar);
					this.parent.add(this.container);
					this.parent.draw();

				}

				/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
				/* Merging js: Stack.js begins */
				/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


				function Stack(scope, objcts){

					this.layer = scope.bottomPanel;
					this.binLayer = scope.topPanel;

					this.objects = objcts.slice(0);
				    this.index = 0;
				    this.shapeInfo = [];
				    this.shapeSize = [];
				    this.shapePosition = [];

					var self = this;

				    this.setObjects = function(obj){
				        this.objects = [];
				        this.objects = obj;
				    }

					this.addSplitterObject = undefined;

					this.getSplitterObjects = function(){

						return this.objects;
					};

				    this.saveObjectsInfo = function(){


				        console.log('No. of objects ' + this.objects.length);

				        for(var i=0; i<this.objects.length; i++)
				        {
					        var shapeInfo;
					        var shapeSize;
					        var shapePosition;

				   			if(this.objects[i].getShapeType()==1)
				            {
				                 // for rect
				                if(this.objects[i].mainType== 2)
				                {
				                    // for image  shape
				                    shapeInfo = {
				                        mainType: this.objects[i].mainType,
				                        type: 1,
				                        offsetX: this.objects[i].shape.fillPatternOffsetX(),
				                        offsetY: this.objects[i].shape.fillPatternOffsetY(),
				                        scaleX: this.objects[i].shapeInfo.scaleX,
				                        scaleY: this.objects[i].shapeInfo.scaleY,
				                        image: this.objects[i].getShapeImage(),
				                        inWorkView: this.objects[i].shapeInfo.inWorkView
				                    };

				                   }
				                   else
				                   {
				                        // for color shape
				                        shapeInfo = {
				                            mainType: this.objects[i].mainType,
				                            type: 1,
				                            offsetX: this.objects[i].shape.fillPatternOffsetX(),
				                            offsetY: this.objects[i].shape.fillPatternOffsetY(),
				                            color: this.objects[i].color,
				                            inWorkView: this.objects[i].shapeInfo.inWorkView
				                        };
				                    }

				               shapeSize = {
				                    Width: this.objects[i].shape.getWidth(),
				                    Height: this.objects[i].shape.getHeight()
				                };
				                shapePosition = {
				                    X: this.objects[i].container.getX(),
				                    Y: this.objects[i].container.getY()
				                };

				            }else{ // for circle

				                if(this.objects[i].mainType== 2){
				                    // for circle image shape
				                    shapeInfo = {
				                        mainType: this.objects[i].mainType,
				                        type: 2,
				                        offsetX: this.objects[i].shape.fillPatternOffsetX(),
				                        offsetY: this.objects[i].shape.fillPatternOffsetY(),
				                        scaleX: this.objects[i].shapeInfo.scaleX,
				                        scaleY: this.objects[i].shapeInfo.scaleY,
				                        image: this.objects[i].getShapeImage(),
				                        inWorkView: this.objects[i].shapeInfo.inWorkView
				                    };

				                }else{
				                    // for circle color shape
				                    shapeInfo = {
				                        mainType: this.objects[i].mainType,
				                        type: 2,
				                        offsetX: this.objects[i].shape.fillPatternOffsetX(),
				                        offsetY: this.objects[i].shape.fillPatternOffsetY(),
				                        color: this.objects[i].color,
				                        inWorkView: this.objects[i].shapeInfo.inWorkView
				                    };
				                }
				                shapeSize = {
				                    Radius: this.objects[i].shape.getRadius()
				                };
				                shapePosition = {
				                    X: this.objects[i].container.getX(),
				                    Y: this.objects[i].container.getY(),
				                    Angle: this.objects[i].getAngle(),
				                    Rotation: this.objects[i].getRotation()
				                }

				             }

				             this.shapeInfo.push(shapeInfo);
				             this.shapeSize.push(shapeSize);
				             this.shapePosition.push(shapePosition);

				        }// loop
				    };

				    this.saveObjectsInfo();

					this.draw = function(){

						// this.layer.removeChildren();
						// this.layer.addBase();
				        console.log("---------Number of objects is: " + self.objects.length);
						for(var i=0; i<this.objects.length; i++){
							console.log("Drawing object["+ i + "].inWorkView: " + this.shapeInfo[i].inWorkView);
				            this.addSplitterObject(this.shapeInfo[i], this.shapeSize[i], this.shapePosition[i]);

						}// main loop

				        // console.log("");
						this.layer.draw();
						this.binLayer.draw();

					};// end of draw
				}// end of main

				/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
				/* Merging js: TemplateRunner.js begins */
				/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


				function TemplateRunner($scope, $element)
				{
							this.scope = $scope;

							this.selectedColorElement;
							this.selectedBinShapeElement;
							this.selectedGraphicElement;
							this.changeSOShapeColor;

							this.reset = function(){
								console.log("Resetting everything");

								this.scope.deleteAllSplitterObjects();
								this.scope.deleteAllBinObjects();
								this.scope.topPanel.header = [];

								this.scope.startApp();
								this.scope.reAdjustBins();
							};

							this.hideOther = function(popOver)
							{

								switch(popOver)
								{
									case 1:
										$("[data-toggle=Add]", $element).popover('hide');
										$("[data-toggle=Style_Shape]", $element).trigger('compileContent');
										break;
									case 2:
										$("[data-toggle=Add]", $element).popover('hide');
										$("[data-toggle=Style_Bin]", $element).trigger('compileContent');
										break;
									case 3:
										$("[data-toggle=Style]", $element).trigger('compileContent');
										$("[data-toggle=Add]", $element).popover('hide');
										break;
									case 4:
										$element.find("#subMenu")[0].style.zIndex = -1;
										$("[data-toggle=Style_Shape]", $element).popover('hide');
										$("[data-toggle=Style_Bin]", $element).popover('hide');
										$("[data-toggle=SubStyle_Bin]", $element).popover('hide');

										if($scope.deSelectBin())
											$scope.deSelectBin();

										$("[data-toggle=Add]", $element).trigger('compileContent');

										break;
									default:
										break;
								}

							};

							this.closeAllPopupMenus = function()
							{
								$element.find("#subMenu")[0].style.zIndex = -1;
								$("[data-toggle=Style_Shape]", $element).popover('hide');
								$("[data-toggle=Style_Bin]", $element).popover('hide');
								$("[data-toggle=SubStyle_Bin]", $element).popover('hide');
								$("[data-toggle=Style]", $element).popover('hide');
								$("[data-toggle=Add]", $element).popover('hide');
							}


							//Adding Items
							this.addShape = function(){
								console.log("Add Shape!");
								$scope.addNewShape();
								$("[data-toggle=Add]", $element).popover('hide');
							};
							this.addBin = function(){
								var title = $element.find('#newBinTitle')[0].value;
								var description = $element.find('#newBinDescription')[0].value;

								var scope = $scope;
								scope.addNewBin(title, description);
								$("[data-toggle=Add]", $element).popover('hide');
							};
							this.addGraphics = function(){
								var scope = $scope;
								scope.addNewGraphic();
								$("[data-toggle=Add]", $element).popover('hide');
							};

							// While Adding shape or graphic, we use below
							this.selectColor = function(evt, color){

								var root = $element.find('#splitter_app_add_li');
								var elm = root.find("#" + evt.target.id);
								elm.siblings().removeClass('selected-item');
								elm.addClass('selected-item');

								$scope.selectShapeColor(color);

								var items = $element.find('.splitterShapes');
								var count = items.length;
								for(var i=0; i<count; i++)
								{
									var item = items.get(i);
									item.style.backgroundColor = color;
								}

							};
							this.selectShape = function(evt, shape){
								console.log("Select Shape: " + shape);

								var root = $element.find('#splitter_app_add_li');
								var elm = root.find("#" + evt.target.id);
								elm.siblings().removeClass('selected-item');
								elm.addClass('selected-item');

								$scope.selectShape(shape);
							};
							this.selectGraphic = function(evt, graphic){
								console.log("Select Graphic: " + graphic);

								var root = $element.find('#splitter_app_add_li');
								var elm = root.find("#" + evt.target.id);
								elm.siblings().removeClass('selected-item');
								elm.addClass('selected-item');

								$scope.lastSelectedGraphics = graphic;
							}

							// While Adding Bin, we use below
							this.selectBinShape = function(evt, shape){

								var root = $element.find('#splitter_app_add_li');
								var elm = root.find("#" + evt.target.id);
								elm.siblings().removeClass('selected-item');
								elm.addClass('selected-item')



								$scope.selectBinShape(shape);
							};

							//Updating Splitter Object/s
							this.changeSOShapeColor = function(ID, color){
								var root = $element.find('#Style_Shape');
								var elm = root.find("#" + ID);
								elm.siblings().removeClass('selected-item');
								elm.addClass('selected-item');

								$scope.changeSOShapeColor(color);
							};

							//Updating Bin Object
							this.changeBinIconColor = function(evt, color){
								$scope.changeBinIconColor(color);

								var root = $element.find('#subMenu');
								var elm = root.find("#" + evt.target.id);
								elm.siblings().removeClass('selected-item');
								elm.addClass('selected-item');

								var items = $element.find('.splitterShapes');
								var count = items.length;
								for(var i=0; i<count; i++)
								{
									var item = items.get(i);
									item.style.backgroundColor = color;
								}
							};
							this.changeBinIconShape = function(evt, shape){

								var root = $element.find('#subMenu');
								var elm = root.find("#" + evt.target.id);
								elm.siblings().removeClass('selected-item');
								elm.addClass('selected-item');

								$scope.changeBinIconShape(shape);
							}
							this.changeBinShape = function(ID, shape){

								var root = $element.find('#Style_Bin');

								console.log("Root " + root.html());
								var elm = root.find("#" + ID);

								elm.html("helo");
								console.log("changeBinShape0 " + elm.html() + " #" + ID);

								elm.siblings().removeClass('selected-item');
								elm.addClass('selected-item');

								$scope.changeBinShape(shape);
							};
							this.changeBinIconGraphic = function(evt, graphic){
								console.log("graphic: " + graphic);

								var root = $element.find('#subMenu');
								var elm = root.find("#" + evt.target.id);
								elm.siblings().removeClass('selected-item');
								elm.addClass('selected-item');

								$scope.changeBinIconGraphic(graphic);
							};
							this.changeBinTitle = function(){
								$scope.changeBinTitle();
							}

							//Sub Style Menu
							this.openSubMenu = function(){
								$element.find("#subMenu")[0].style.zIndex = 1;

								$("[data-toggle=SubStyle_Bin]", $element).popover('show');
								$("[data-toggle=SubStyle_Bin]", $element).trigger('compileContent');
								$("[data-toggle=Style_Bin]", $element).popover('hide');
							};
							this.hideSubMenu = function(){
								$element.find("#subMenu")[0].style.zIndex = -1;

								$("[data-toggle=Style_Bin]", $element).popover('show');
								$("[data-toggle=Style_Bin]", $element).trigger('compileContent');
								$("[data-toggle=SubStyle_Bin]", $element).popover('hide');
							};

							//radio toggle
							this.setRadioActive = function(id){

								$element.find("#" + id).addClass('active').siblings().removeClass('active');
							}



				}


            //--------------------------------------------------------------------------------------------------
            //--------------------------------- Controller Implementation --------------------------------------
            //**************************************************************************************************

            //--------------------------------------------------------------------------------------------------
			//---------------------------------------  Setup Menu Bar ------------------------------------------
			//--------------------------------------------------------------------------------------------------

			$scope.selectedSO = undefined;
			$scope.selectedBO = undefined;
			$scope.isSelectedSO = false;
			$scope.isSelectedBO = false;

			$scope.styleObject = "Shape Style";
			$scope.styleObjectInfo = ""; // = "Mixed Shapes";

			$scope.isLasso = false;
			$scope.groupObjects = new Array();

			var isGroupSelected = false;
			var selected = new Array();
			var group_selected = new Array();

			var isdownMenu = false;
			var isrightMenu = false;

			$scope.app = [];
			$scope.stack = undefined;

			$scope.LassoLabel = "Lasso";

			$scope.toggleLasso = function()
			{
				$scope.isLasso = !$scope.isLasso;

				if ($scope.isLasso)
				{
					// Lasso is On now
					$scope.LassoLabel = "Lasso Active";
					isGroupSelected = false;
					selected = [];
					group_selected = [];
					// close all Menus if lasso is ON
					$scope.templateRunner.closeAllPopupMenus();
					removeDialog();
					// Deselect all selected splitter objects if they are selected
					for (var i = 0; i < $scope.splitterObjects.length; i++) {
						if ($scope.splitterObjects[i].isSelected && dialog == null)
						{
							$scope.splitterObjects[i].setSelected(false);
						}
					}
				}
				else
				{
					$scope.LassoLabel = "Lasso";
					//$element.find("#toggleBtn").removeClass('active')
				}
			}

            //--------------------------------------------------------------------------------------------------
			//---------------------------------------  Settings Controller -------------------------------------
			//--------------------------------------------------------------------------------------------------
			$scope.questionId = 1;


		    $scope.questions = [
		        //Question 1
		        {
		          binCount: 6,
		          binTitle: "Person",
		          objectsCount: 3
		        },
		        //Question 2
		        {
		          binCount: 8,
		          binTitle: "Person",
		          objectsCount: 7
		        },
		        //Question 3
		        {
		          binCount: 5,
		          binTitle: "Person",
		          objectsCount: 4
		        },
		        //Question 4
		        {
		          binCount: 8,
		          binTitle: "Clock",
		          objectsCount: 10
		        },
		        //Question 5
		        {
		          binCount: 6,
		          binTitle: "Hot Dog",
		          objectsCount: 3
		        }
		    ];

		    $scope.currentQuestion =  $scope.questions[$scope.questionId -1];


		    //----------------------------------------------------------------------------------------------------------------------------------------
			//----------------------------------------  Setup Stage with all the panels/layers -------------------------------------------------------
			//----------------------------------------------------------------------------------------------------------------------------------------
			var container = $element.find("#splitter_surface")[0];

			$scope.stage = new Kinetic.Stage({
				container: container,
				width: 1023,
				height: 768,
				listening: true,
			});
			$scope.stage.on("click tap", onStageClicked);
			function onStageClicked(evt)
			{
				for (var i = 0; i < $scope.splitterObjects.length; i++) {
					if ($scope.splitterObjects[i].isSelected && dialog == null)
					{
						$scope.splitterObjects[i].setSelected(false);
					}
				}
			}


			Kinetic.pixelRatio = 1;

			var panelSplitH = 30;
			var topPanelW = $scope.stage.width();
			var topPanelH = $scope.stage.height() * 0.4;

			//Create Top Panel
			$scope.topPanel = new PinchLayer($scope.stage, {
				x: 0,
				y: 0,
				width: topPanelW,
				height: topPanelH,
				listening: true
			});
			$scope.topPanel.setId("binView");
			$scope.topPanel.setupForBins();

			//Create Bottom Panel
			var bottomPanelW = $scope.stage.width();
			var bottomPanelH = $scope.stage.height() - topPanelH;

			$scope.bottomPanel = new PinchLayer($scope.stage, {
				x: 0,
				y: topPanelH + panelSplitH + 1,
				width: bottomPanelW,
				height: bottomPanelH - panelSplitH - 1,
				listening: true
			});
			$scope.bottomPanel.setId("workView");
			$scope.bottomPanel.background.fill("rgba(220,220,220,1)");


			// here I am just manually setting the bottom background to the values I want: - greg
			$scope.bottomPanel.background.width(1024);
			$scope.bottomPanel.background.height(768);

			$scope.bottomPanel.layer.draw();


			//Panel Split Bar
			$scope.splitBar = new PanelSplitter($scope.stage, $scope.topPanel, $scope.bottomPanel, {
				x: 0,
				y: $scope.topPanel.height(),
				width: topPanelW,
				height: panelSplitH
			});

			//Create transition layer. This layer will be used to move object between top and bottom panels.
			$scope.transitionLayer = new Kinetic.Layer({
				x: 0,
				y: 0,
				width: $scope.stage.width(),
				height: $scope.stage.height()
			});

			$scope.stage.add($scope.transitionLayer);
			$scope.transitionLayer.moveToTop();
			// Main Layer
			$scope.MainLayer = new Kinetic.Layer({
					x: 0,
					y: 0,
					width: $scope.stage.width(),
					height: $scope.stage.height()
				});
			$scope.stage.add($scope.MainLayer);

			//-------------------------------------------------------------------------------------------------------------
			//---------------------------------------  Split Menu Implementation ------------------------------------------
			//-------------------------------------------------------------------------------------------------------------
			var dialog = null;
			var triangle;
			var label1 = null,
				label2 = null,
				label3 = null,
				circle1 = null,
				circle2 = null,
				design1 = null,
				design2 = null;

			var group = null;

			var newDialog = function(posx, posy, width, height)
			{
				dialog = new Kinetic.Rect({
					x: posx,
					y: posy,
					width: width,
					height: height,
					fill: 'rgba(0,0,0,0.9)',
					shadowColor: 'rgba(0,0,0,0.5)',

					shadowBlur: 1,
					shadowOffsetX: 2,
					shadowOffsetY: 2,
					// stroke: 'black',
					// strokeWidth: 0,
					cornerRadius: 4

				});
			}
			var newGroup = function(posx, posy, h, w)
			{
				group = new Kinetic.Group({
					x: posx,
					y: posy,
					width: w,
					height: h,
					drawBorder: true,
					draggable: true
				});
			}
			var newLabel1 = function(posx, posy, txt)
			{
				label1 = new Kinetic.Text({
					x: posx,
					y: posy,
					fontSize: 18,
					text: txt,
					fontFamily: 'HelveticaNeue',
					fill: '#00b0ea'
				});
			}
			var newLabel2 = function(posx, posy, txt)
			{
				label2 = new Kinetic.Text({
					x: posx,
					y: posy,
					fontSize: 18,
					text: txt,
					fontFamily: 'HelveticaNeue',
					fill: '#00b0ea'
				});
			}
			var newLabel3 = function(posx, posy, txt)
			{
				label3 = new Kinetic.Text({
					x: posx,
					y: posy,
					fontSize: 18,
					text: txt,
					fontFamily: 'HelveticaNeue',
					fill: '#00b0ea'
				});
			}

			var OnHorizantal = function(flag)
			{
				$scope.isHorizontalSplit = flag;

				for (var i = 0; i < $scope.splitterObjects.length; i++)
				{
					if ($scope.splitterObjects[i].isSelected)
					{
						$scope.splitterObjects[i].setDivisions($scope.isHorizontalSplit, 1);
					}
				}
			}

			// Right menu
			var newCircle1 = function(posx, posy, counterX, counterY)
			{
				circle1 = new Kinetic.Circle({
					x: posx,
					y: posy,
					radius: 20,
					fill: 'white',
					stroke: 'black',
					strokeWidth: 1
				});
				console.log("Circle1.x: " + circle1.x() + " Circle1.y: " + circle1.y() );
				design1 = new Kinetic.Text({
					x: posx - 7,
					y: posy - 9,
					fontSize: 15,
					text: '-|-',
					fill: 'black'
				});

				$scope.MainLayer.add(circle1);
				$scope.MainLayer.add(design1);
				$scope.MainLayer.draw();

				design1.on('mousedown touchstart', function()
				{
					somethingIsBeingDraggedInKinetic = true;

					// Here horizantle split is false
					OnHorizantal(false);

					if (isdownMenu) {
						$scope.split_menu.removeMenuSplit();
					}

					$scope.split_menu = new SplitterMenu($scope.MainLayer, posx, posy, counterX, counterY);
					$scope.split_menu.valueChangedCallback = sliderChange;
					$scope.split_menu.watch = Watch;
					$scope.split_menu.setStageClickDisable = $scope.setStageClickDisable;
					$scope.split_menu.okCallback = handleSplitCallback;
					$scope.split_menu.removemenu = removeDialog;
					isrightMenu = true;
					isdownMenu = false;

				});

				circle1.on('mousedown touchstart', function()
				{
					somethingIsBeingDraggedInKinetic = true;

					// Here horizantle split is false
					OnHorizantal(false);

					if (isdownMenu) {
						$scope.split_menu.removeMenuSplit();
					}

					$scope.split_menu = new SplitterMenu($scope.MainLayer, posx, posy, counterX, counterY);
					$scope.split_menu.valueChangedCallback = sliderChange;
					$scope.split_menu.watch = Watch;
					$scope.split_menu.setStageClickDisable = $scope.setStageClickDisable;
					$scope.split_menu.okCallback = handleSplitCallback;
					$scope.split_menu.removemenu = removeDialog;
					isrightMenu = true;
					isdownMenu = false;

				});

			}
			//Down menu
			var newCircle2 = function(posx, posy, counterX, counterY)
			{
				circle2 = new Kinetic.Circle({
					x: posx,
					y: posy,
					radius: 20,
					fill: 'white',
					stroke: 'black',
					strokeWidth: 1
				});

				design2 = new Kinetic.Text({
					x: posx - 7,
					y: posy - 9,
					fontSize: 15,
					text: '-|-',
					fill: 'black'
				});

				$scope.MainLayer.add(circle2);
				$scope.MainLayer.add(design2); $scope.MainLayer.draw();

				design2.on('mousedown touchstart', function() {
					// Here horizantle split is true

					somethingIsBeingDraggedInKinetic = true;

					OnHorizantal(true);

					if (isrightMenu) {
						$scope.split_menu.removeMenuSplit();
					}
					$scope.split_menu = new SplitterMenu($scope.MainLayer, posx, posy, counterX, counterY);
					$scope.split_menu.valueChangedCallback = sliderChange;
					$scope.split_menu.watch = Watch;
					$scope.split_menu.setStageClickDisable = $scope.setStageClickDisable;
					$scope.split_menu.okCallback = handleSplitCallback;
					$scope.split_menu.removemenu = removeDialog;
					isdownMenu = true;
					isrightMenu = false;

				});

				circle2.on('mousedown touchstart', function()
				{
					// Here horizantle split is true

					somethingIsBeingDraggedInKinetic = true;

					OnHorizantal(true);

					if (isrightMenu) {
						$scope.split_menu.removeMenuSplit();
					}

					$scope.split_menu = new SplitterMenu($scope.MainLayer, posx, posy, counterX, counterY);
					$scope.split_menu.valueChangedCallback = sliderChange;
					$scope.split_menu.watch = Watch;
					$scope.split_menu.setStageClickDisable = $scope.setStageClickDisable;
					$scope.split_menu.okCallback = handleSplitCallback;
					$scope.split_menu.removemenu = removeDialog;
					isdownMenu = true;
					isrightMenu = false;
				});
			}

			//Draw Menu
			var drawMenu = function(sel)
			{
				var h = sel[0].shape.getHeight() * $scope.bottomPanel.container.scaleX();
				var w = sel[0].shape.getWidth()  * $scope.bottomPanel.container.scaleX();
				var x =  sel[0].container.getAbsolutePosition().x;
				var y =  sel[0].container.getAbsolutePosition().y;
				var h2 = h / 2;
				var w2 = w / 2;

				// for square shape
				if (sel[0].getShapeType() == 1) {
					// for right circle
					newCircle1(x + w + 50, y + h2, x + w2, y - 25);
					// for down circle
					newCircle2(x + w2, y + h + 50, x + w2, y - 25);
				}
				else {
					newCircle1(x + (sel[0].getRadius() * 2) + 20, y, x, y);
				}
			}
			var newTriangle = function(posx, posy, width, height, mid)
			{
				triangle = new Kinetic.Line({
					points: [mid, posy + height + 13, mid + 13.5, posy + height - 0.3, mid - 13.5, posy + height - 0.3],
					// stroke: 'black',
					// strokeWidth: 0.3,
					shadowColor: 'rgba(0,0,0,0.5)',
					shadowBlur: 1,
					shadowOffsetX: 1,
					shadowOffsetY: 1,
					closed: true,
					fill: 'rgba(0,0,0,0.9)'
				});
			}

			var drawDialogforBoth = function(selected, grp_selected)
			{
				var textPadding = 5;
				var dialog_width = 150;
				var entity = grp_selected[0];
				var objX = entity.getx();
				var objY = entity.gety();
				var height = entity.getheight();
				var width = entity.getwidth();
				var posy = objY + topPanelH + panelSplitH;
				var posx = objX + width / 2;

				for (var i = 1; i < grp_selected.length; i++)
				{
					entity = grp_selected[i];

					if (entity.gety() < posy) {
						posy = entity.gety() + topPanelH + panelSplitH;
					}

					posx += entity.getx() + width / 2;
				}

				var mid = posx /= grp_selected.length;
				posx = (posx - dialog_width / 2) + 10;
				// Set y to top of Dialog and move it a bit up
				posy = (posy - (30 + height / 2));
				newDialog(posx, posy, dialog_width, 30);
				newTriangle(posx, posy, dialog_width, 30, mid);

				newLabel1(posx + textPadding, posy + (25 / 4), "Discard"); // for Discard label

				$scope.MainLayer.add(dialog);
				$scope.MainLayer.add(triangle);

				$scope.MainLayer.add(label1); // for Discard label
				$scope.MainLayer.draw();

				// When click on Discard option
				label1.on('mousedown', function() {

					DiscardBoth(grp_selected, selected);
				});

				// for ipad/tablet
				label1.on('touchstart', function() {

					DiscardBoth(grp_selected, selected);
				});
			};

			var DiscardBoth = function(grp_selected, selected)
			{
				DiscardGroupObj(group_selected);
				DiscardObj(selected);
				isGroupSelected = false;
				selected = [];
				group_selected = [];

				$scope.bottomPanel.layer.draw();
			};

			// *Draw dialog for element only
			var drawDialog = function(selected)
			{
				var textPadding = 5;
				var isSingleEntitySelection = (selected.length == 1);
				var dialog_width = (isSingleEntitySelection ? 160 : 160);
				var entity = selected[0];
				var objX = entity.container.getAbsolutePosition().x;
				var objY = entity.container.getAbsolutePosition().y;
				var height = entity.shape.getHeight() * $scope.bottomPanel.getScale();
				var width = entity.shape.getWidth() * $scope.bottomPanel.getScale();
				var posy = objY;
				var posx = objX + (width/2);

				for (var i = 1; i < selected.length; i++)
				{
						entity = selected[i];

						if (entity.container.getY() < posy) {
							posy = entity.container.getAbsolutePosition().y;
						}

						posx += entity.container.getAbsolutePosition().x + (width/2);
				}

				var mid = posx /= selected.length;
				posx = (posx - dialog_width / 2);

				// for circle
				if (isSingleEntitySelection && entity.getShapeType() != 1)
				{
					var angle = entity.getRotation();
					var radius = entity.getRadius() * $scope.bottomPanel.getScale();
					console.log("Angle is: " + angle);

						// for Circle
						posx = objX;
						mid = posx /= selected.length;
						posx = posx - (dialog_width/2);
						posy = (posy - (radius*2));
						posy = posy - 20;

					// mid -= (dialog_width / 2);
					// Set y to top of Dialog and move it a bit up

				}
				else
				{
					//for square
					// Set y to top of Dialog and move it a bit up
					if(height<40){
						posy = posy - (80 + entity.shape.getHeight() / 2);
					}else{
						posy = posy - (45 + entity.shape.getHeight() / 2);
					}
				}

				newDialog(posx, posy, dialog_width, 30);
				newTriangle(posx, posy, dialog_width, 30, mid);

				$scope.MainLayer.add(dialog);
				$scope.MainLayer.add(triangle);
				$scope.MainLayer.moveToTop();

				newLabel1(posx + textPadding, posy + (25 / 4), "Discard"); // for Discard label
				$scope.MainLayer.add(label1); // for Discard label

				newLabel2(posx + (textPadding * 3) + label1.getTextWidth(), posy + (25/4), "| Duplicate" ); // for Discard label
                $scope.MainLayer.add(label2);

				$scope.MainLayer.draw();

				// When click on Discard option
				label1.on('mousedown touchstart', function()
				{
					DiscardObj(selected);
				});

				label2.on('mousedown touchstart', function()
				{
					DuplicateObj(selected, posx, posy);
				});

			}

			var DuplicateObj = function(selected, posx, posy) {

				posy = posy - topPanelH;

				// posy = posy - panelSplitH;

			for (var i = 0; i < selected.length; i++) {
				posx += 10;
				posy += 20;

				if (selected[i].getShapeType() == 1) {
					//for Rect
					 if(selected[i].mainType== 2)
                	{
                    // for image  shape
                    	var shapeInfo = {
                        	mainType: selected[i].mainType,
                        	type: 1,
                        	offsetX: selected[i].shape.fillPatternOffsetX(),
                        	offsetY: selected[i].shape.fillPatternOffsetY(),
                        	scaleX: selected[i].shapeInfo.scaleX,
                        	scaleY: selected[i].shapeInfo.scaleY,
                       	 	image: selected[i].getShapeImage(),
                        	inWorkView: selected[i].shapeInfo.inWorkView
                    	};

                   }
                   else
                   {
                        // for color shape
                       var shapeInfo = {
                            mainType: selected[i].mainType,
                            type: 1,
                            offsetX: selected[i].shape.fillPatternOffsetX(),
                            offsetY: selected[i].shape.fillPatternOffsetY(),
                            color: selected[i].color,
                            inWorkView: selected[i].shapeInfo.inWorkView
                        };
                    }


					var shapeSize = {
						Width: selected[i].shape.getWidth(),
						Height: selected[i].shape.getHeight()
					};
					var shapePosition = {
						X: posx,
						Y: posy
					};

					$scope.addSplitterObject(shapeInfo, shapeSize, shapePosition);
				}
				else {
					//for circle
					if(selected[i].mainType== 2){
                    	// for circle image shape
                    	var shapeInfo = {
                        	mainType: selected[i].mainType,
                        	type: 2,
                        	offsetX: selected[i].shape.fillPatternOffsetX(),
                       	 	offsetY: selected[i].shape.fillPatternOffsetY(),
                        	scaleX: selected[i].shapeInfo.scaleX,
                        	scaleY: selected[i].shapeInfo.scaleY,
                        	image: selected[i].getShapeImage(),
                        	inWorkView: selected[i].shapeInfo.inWorkView
                    	};

                	}else{
                    	// for circle color shape
                    	var shapeInfo = {
                        	mainType: selected[i].mainType,
                        	type: 2,
                        	offsetX: selected[i].shape.fillPatternOffsetX(),
                        	offsetY: selected[i].shape.fillPatternOffsetY(),
                        	color: selected[i].color,
                        	inWorkView: selected[i].shapeInfo.inWorkView
                    	};
                	}
                	var shapeSize = {
                    	Radius: selected[i].shape.getRadius()
                	};
                	var shapePosition = {
                    	X: posx,
                    	Y: posy,
                    	Angle: selected[i].getAngle(),
                    	Rotation: selected[i].getRotation()
                	};

					$scope.addSplitterObject(shapeInfo, shapeSize, shapePosition);
				}

			} //loop

				console.log('Duplicate it');
				removeDialog();
				selected = [];
				//** Unselect All **//
				for (var j = 0; j < $scope.splitterObjects.length; j++) {
						$scope.splitterObjects[j].shape.stroke('black');
						$scope.splitterObjects[j].setSelected(false);
				}
			}

			var DiscardObj = function(selected)
			{
					for (var i = 0; i < selected.length; i++)
					{
						selected[i].container.remove();
						var index = $scope.splitterObjects.indexOf(selected[i]);
						$scope.splitterObjects.splice(index, 1);
					}

					selected = [];
					$scope.bottomPanel.layer.draw();
					removeDialog();
				}

			$scope.deleteAllSplitterObjects = function()
			{
				for (var i = 0; i < $scope.splitterObjects.length; i++) {
					$scope.splitterObjects[i].container.remove();
				}
				$scope.splitterObjects = [];
				$scope.bottomPanel.layer.draw();
				removeDialog();
			}
			$scope.deleteAllBinObjects = function()
			{
				if($scope.isSelectedBO)
					$scope.deSelectBin();

				for (var i = 0; i < $scope.binObjects.length; i++) {
					$scope.binObjects[i].removeSelf(0);
				}

				$scope.binObjects = [];
				$scope.bottomPanel.layer.draw();
				removeDialog();
			}
			var removeDialog = function()
			{
				if (dialog != null) {
					dialog.remove();
					triangle.remove();
					dialog = null;
				}


				if (label1 != null) {
					label1.remove();
					label1 = null;
				}

				if (label2 != null) {
					label2.remove();
					label2 = null;
				}

				if (label3 != null) {
					label3.remove();
					label3 = null;
				}

				if (circle1 != null) {

					circle1.remove();
					design1.remove();
					circle1 = null;
					design1 = null;

				}

				if (circle2 != null) {
					circle2.remove();
					design2.remove();
					circle2 = null;
					design2 = null;
				}

				if (isdownMenu || isrightMenu) {

					$scope.split_menu.removeMenuSplit();
				}
				$scope.MainLayer.draw();
			};


			//-------------------------------------------------------------------------------------------------------------
			//-----------------------------  Lasso Implementation in Touch Event Handlers ---------------------------------
			//-------------------------------------------------------------------------------------------------------------
			var moving = false;
			var isBottom = false;

			var lasso_line =  null;
			var lassoX = new Array();
			var lassoY = new Array();

			var newLine = function()
			{
				// Remove previous lasso if exist
				if(lasso_line!=null){
					lasso_line.remove();
					lasso_line = null;
					$scope.bottomPanel.layer.draw();
				}

				lasso_line = new Kinetic.Line({
					points: [],
					stroke: "white",
					strokeWidth: 1,
					shadowColor: 'rgba(0,0,0,0.3)',
					shadowBlur: 1,
					shadowOffsetX: 1,
					shadowOffsetY: 1,
					lineJoin: 'round',
					linewidth: 10,
					closed: true,
					fill: 'rgba(152,206,240,0.2)'
				});
			}

			var mousedown = false;
			function onMouseDown(evt)
			{
				mousedown = true;
				newLine();
				$scope.bottomPanel.layer.add(lasso_line);
				lasso_line.dash([10, 5]);

				if($scope.stage.getPointerPosition() === undefined)
					return;

				var x1 = $scope.stage.getPointerPosition().x;
				var y1 = $scope.stage.getPointerPosition().y - $scope.topPanel.layer.height()
						 - $scope.topPanel.binLayer.height() - panelSplitH;
				drawline(x1, y1);

				$scope.bottomPanel.layer.draw();
			};

			function onMouseMove(evt)
			{
				if($scope.stage.getPointerPosition() === undefined)
					return;

				if (mousedown) {
					var x2 = $scope.stage.getPointerPosition().x;
					var y2 = $scope.stage.getPointerPosition().y - $scope.topPanel.layer.height()
						 - $scope.topPanel.binLayer.height() - panelSplitH;

					drawline(x2, y2);
					$scope.bottomPanel.layer.draw();
				}
			};
			function onMouseUp(evt)
			{
				if (moving) {
					moving = false;
					var points = lasso_line.points();

					for (var i = 0; i < points.length; i++) {
						if (i % 2 == 0) lassoX.push(points[i]);
						else lassoY.push(points[i]);
					}

					var scale = self.bottomPanel.container.scaleX();

					for (var j = 0; j < $scope.splitterObjects.length; j++) {
						var boxX = $scope.splitterObjects[j].container.getAbsolutePosition().x;
						var boxY = $scope.splitterObjects[j].container.getAbsolutePosition().y;
						var height = $scope.splitterObjects[j].shape.getHeight() * scale;
						var width = $scope.splitterObjects[j].shape.getWidth()   * scale;

						boxY -= ($scope.topPanel.layer.height() + $scope.topPanel.binLayer.height() + panelSplitH);

						checkLassoSelection(lassoX, lassoY, boxX, boxY, height, width, j, "obj");
					}

					for (var k = 0; k < $scope.groupObjects.length; k++)
					{
						checkLassoSelection(lassoX, lassoY,
											$scope.groupObjects[k].getAbsolutePosition().x,
											$scope.groupObjects[k].getAbsolutePosition().y - ($scope.topPanel.layer.height()
											+ $scope.topPanel.binLayer.height() + panelSplitH),
											$scope.groupObjects[k].getheight() * scale,
											$scope.groupObjects[k].getwidth() * scale, k, "grp");

					}

					if (isGroupSelected) {
						if (selected.length > 0) drawDialogforBoth(selected, group_selected);
						else drawDialogforGroup(group_selected);

					}
					else if (selected.length > 0)
						drawDialog(selected);

					lassoX = [];
					lassoY = [];

					lasso_line.remove();
					lasso_line = null;
					$scope.bottomPanel.layer.draw();
					$scope.$apply(function() {
						$scope.toggleLasso();
					});
				}
			};
			function onMouseDownBottom(evt)
			{
				if (dialog != null) {

					for (var j = 0; j < $scope.splitterObjects.length; j++) {
						$scope.splitterObjects[j].shape.stroke('black');
						$scope.splitterObjects[j].setSelected(false);
					}
					removeDialog();
				}

				isGroupSelected = false;
				group_selected = [];
				selected = [];
				isBottom = true;

				$scope.deSelectBin();
				$scope.isSelectedSO = false;
				$scope.selectedSO = undefined;

				$scope.MainLayer.draw();
				$scope.topPanel.layer.draw();
				$scope.bottomPanel.layer.draw();
				$scope.$apply();
			};

			function onMouseUpBottom(evt) {
				isBottom = false;
			};

			function onTouchDown(evt)
			{
				if (evt.changedTouches.length < 2)
				{
					var touch1 = evt.changedTouches[0];

					if (moving)
					{
						moving = false;
						$scope.bottomPanel.layer.draw();
					}
					else if (isBottom)
					{

						newLine();

						$scope.bottomPanel.layer.add(lasso_line);

						lasso_line.dash([10, 5]);

						var x1 = touch1.clientX;

						var y1 = touch1.clientY - $scope.topPanel.layer.height()
						 - $scope.topPanel.binLayer.height() - panelSplitH;

						drawline(x1, y1);

						$scope.bottomPanel.layer.draw();

					}
				}
			}
			function onTouchMove(evt)
			{
					if (evt.changedTouches.length < 2)
					{
						var touch1 = evt.changedTouches[0];

						if (moving)
						{
							var x2 = touch1.clientX;
							var y2 = touch1.clientY - $scope.topPanel.layer.height()
										- $scope.topPanel.binLayer.height() - panelSplitH;
							drawline(x2, y2);
							$scope.bottomPanel.layer.draw();
						}
					}
				}
			function onTouchUp(evt)
			{
					if (evt.changedTouches.length < 2) {

						var touch1 = evt.changedTouches[0];

						if (moving) {

							moving = false;

							var points = lasso_line.points();

							for (var i = 0; i < points.length; i++) {

								if (i % 2 == 0) {

									lassoX.push(points[i]);

								}
								else {

									lassoY.push(points[i]);

								}

							}

							var scale = self.bottomPanel.container.scaleX();

							for (var j = 0; j < $scope.splitterObjects.length; j++) {

								var boxX = $scope.splitterObjects[j].container.getAbsolutePosition().x;
								var boxY = $scope.splitterObjects[j].container.getAbsolutePosition().y;
								var height = $scope.splitterObjects[j].shape.getHeight() * scale;
								var width = $scope.splitterObjects[j].shape.getWidth()   * scale;

								boxY -= ($scope.topPanel.layer.height() + $scope.topPanel.binLayer.height() + panelSplitH);

								checkLassoSelection(lassoX, lassoY, boxX, boxY, height, width, j, "obj");
							}

							for (var k = 0; k < $scope.groupObjects.length; k++)
							{
								checkLassoSelection(lassoX, lassoY,
													$scope.groupObjects[k].getAbsolutePosition().x,
													$scope.groupObjects[k].getAbsolutePosition().y -
													($scope.topPanel.layer.height() + $scope.topPanel.binLayer.height() + panelSplitH),
													$scope.groupObjects[k].getheight() * scale,
													$scope.groupObjects[k].getwidth() * scale, k, "grp");
							}

							if (isGroupSelected)
							{
								if (selected.length > 0)
								{
									//if both group and  element is selected
									drawDialogforBoth(selected, group_selected);
								}
								else {

									//if only Group is selected
									drawDialogforGroup(group_selected);
								}
							}
							else {

								// if only Element is selected
								if (selected.length > 0) {

									drawDialog(selected);
								}//Else nothing was selected, hence no dialog will be drawn.
							}

							lassoX = [];
							lassoY = [];

							lasso_line.remove();
							lasso_line = null;
							$scope.bottomPanel.layer.draw();

							$scope.$apply(function() {
								$scope.toggleLasso();
							});

							console.log($scope.LassoLabel);

						}
					}
				}

			var drawline = function(x, y)
			{
				lasso_line.points().push(parseInt(x));
				lasso_line.points().push(parseInt(y));
				moving = true;
			};
			var checkLassoSelection = function(xp, yp, elmnt_x, elmnt_y, h, w, j, chk)
			{
				if (chk == "obj")
				{
					if (isinLassoSelection(xp, yp, elmnt_x, elmnt_y, h, w))
					{
						$scope.splitterObjects[j].setSelected(true);
						selected.push($scope.splitterObjects[j]);
					}
					else
						$scope.splitterObjects[j].setSelected(false);

				}
				else
				{
					if (isinLassoSelection(xp, yp, elmnt_x, elmnt_y, h, w))
					{
						isGroupSelected = true;
						group_selected.push($scope.groupObjects[j]);
					}
				}
			};

			var isinLassoSelection = function(xp, yp, x, y, h, w)
			{
				var elementWidth = w,
					elementHeight = h;
				var cornersWithinLasso = 0;

				var i, j, npol = xp.length,
					ypi = 0,
					ypj = 0,
					xpi = 0,
					xpj = 0;
				var upperLeftCorner = false,
					upperRightCorner = false,
					lowerLeftCorner = false,
					lowerRightCorner = false;
				x = x + elementWidth / 3;
				y = y + elementHeight / 3;
				var rightCornersX = x + elementWidth / 3,
					lowerCornersY = y + elementHeight / 3;

				for (i = 0, j = npol - 1; i < npol; j = i++) {
						ypi = yp[i],
						ypj = yp[j],
						xpi = xp[i],
						xpj = xp[j];

						if ( (  ((ypi <= y) && (y < ypj)) || ((ypj <= y) && (y < ypi)) )
							 && (x < (xpj - xpi) * (y - ypi) / (ypj - ypi) + xpi))
						{
							upperLeftCorner = !upperLeftCorner;
						}

						if ((((ypi <= y) && (y < ypj)) || ((ypj <= y)
							&& (y < ypi))) && (rightCornersX < (xpj - xpi) * (y - ypi) / (ypj - ypi) + xpi))
						{
							upperRightCorner = !upperRightCorner;
						}

						if ((((ypi <= lowerCornersY) && (lowerCornersY < ypj)) || ((ypj <= lowerCornersY)
							&& (lowerCornersY < ypi))) && (x < (xpj - xpi) * (lowerCornersY - ypi) / (ypj - ypi) + xpi))
						{
							lowerLeftCorner = !lowerLeftCorner;
						}

						if ((((ypi <= lowerCornersY) && (lowerCornersY < ypj)) || ((ypj <= lowerCornersY)
							&& (lowerCornersY < ypi))) && (rightCornersX < (xpj - xpi) * (lowerCornersY - ypi) / (ypj - ypi) + xpi))
						{
							lowerRightCorner = !lowerRightCorner;
						}
					}

				if (upperLeftCorner) {
						cornersWithinLasso++;
					}
				if (upperRightCorner) {
						cornersWithinLasso++;
					}
				if (lowerLeftCorner) {
						cornersWithinLasso++;
					}
				if (lowerRightCorner) {
						cornersWithinLasso++;
					}

				return cornersWithinLasso >= 2;
			};

			function findPos(obj)
			{
				var curleft = 0,
					curtop = 0;
				if (obj.offsetParent) {
						do {
							curleft += obj.offsetLeft;
							curtop += obj.offsetTop;
						} while (obj = obj.offsetParent);
						return {
							x: curleft,
							y: curtop
						};
					}
				return undefined;
			}

			//------------------------------------------------------------------------------------------
			//-----------------------------  Split Menu Event Handlers ---------------------------------
			//------------------------------------------------------------------------------------------
			function handleSplitCallback(num)
			{
				for (var i = 0; i < $scope.splitterObjects.length; i++) {

					if ($scope.splitterObjects[i].isSelected) {

						$scope.splitterObjects[i].setSelected(false);
						$scope.isSelectedSO = false;
						$scope.selectedSO = undefined;

						var newObjects = $scope.splitterObjects[i].splitObject(num, $scope.isHorizontalSplit);

						for (var j = 0; j < newObjects.length; j++) {
							console.log("ShapeInfo: " + newObjects[j][0]);
							$scope.addSplitterObject(newObjects[j][0], newObjects[j][1], newObjects[j][2]);

							// Watch(newObjects[]);
						}

						$scope.$apply();

						break;
					}
				}
				 Watch(undefined);
			};

			function sliderChange(newValue)
			{
				for (var i = 0; i < $scope.splitterObjects.length; i++) {
					if ($scope.splitterObjects[i].isSelected) {
						$scope.splitterObjects[i].setDivisions($scope.isHorizontalSplit, newValue);
					}
				}
			};




			//------------------------------------------------------------------------------------------
			//-----------------------------  Bin Styling Implementation --------------------------------
			//------------------------------------------------------------------------------------------
			$scope.splitterObjects = [];
			$scope.binObjects = [];
			$scope.isHorizontalSplit = true;

			$scope.grayScale  = [
					"background-color:#ffffff", "background-color:#bfbfbf", "background-color:#7f7f7f",
					"background-color:#404040", "background-color:#000000"
					];
			$scope.colors = [
					"#67b4dd", "#9edf61", "#fedf6a", "#febe78", "#fc6062", "#9c4ab7", "#4d9cc7",
					"#71be42", "#f0cf42", "#fda847", "#fc2e2b", "#6b2583", "#3a7fa0", "#7aae44",
					"#e1b629", "#e99c3a", "#cd2631", "#54176a", "#1a5676", "#57862c", "#c5911f",
					"#ce7c25", "#ac1b1e", "#3a0d48"
					];
			$scope.shapes = [{
					name: "square",
					class: "square-btn"},{
					name: "rectLandscape",
					class: "rectLandscape-btn"},{
					name: "circle",
					class: "circle-btn"},{
					name: "rectPortrait",
					class: "rectPortrait-btn"}];
			$scope.binShapes = [{
					name: "square",
					class: "square-btn shapeGap"},{
					name: "rectRoundCorner",
					class: "rectRoundCorner-btn shapeGap"},{
					name: "circle",
					class: "circle-btn"}];
			$scope.Graphics = [
				{image:"lib/externalTools/splitter/img/land.png", name:"square"},
				{image:"lib/externalTools/splitter/img/hotdog.png", name: "rectLandscape"},
				{image:"lib/externalTools/splitter/img/pizza.png", name: "circle"},
				{image:"lib/externalTools/splitter/img/water.png", name: "rectPortrait"},
				{image:"lib/externalTools/splitter/img/land.png", name:"square"},
				{image:"lib/externalTools/splitter/img/hotdog.png", name: "rectLandscape"},
				{image:"lib/externalTools/splitter/img/pizza.png", name: "circle"},
				{image:"lib/externalTools/splitter/img/water.png", name: "rectPortrait"},
				{image:"lib/externalTools/splitter/img/land.png", name:"square"},
				{image:"lib/externalTools/splitter/img/hotdog.png", name: "rectLandscape"},
				{image:"lib/externalTools/splitter/img/pizza.png", name: "circle"},
				{image:"lib/externalTools/splitter/img/water.png", name: "rectPortrait"},
				{image:"lib/externalTools/splitter/img/land.png", name:"square"},
				{image:"lib/externalTools/splitter/img/hotdog.png", name: "rectLandscape"},
				{image:"lib/externalTools/splitter/img/pizza.png", name: "circle"},
				{image:"lib/externalTools/splitter/img/water.png", name: "rectPortrait"}
			];
			$scope.lastSelectedGraphics = $scope.Graphics[0];

			$scope.selectedColor = $scope.colors[0];
			$scope.selectedShape = $scope.shapes[0];
			$scope.selectedBinShape = $scope.binShapes[0];

			$scope.selectBinShape = function(shape){
				$scope.selectedBinShape = shape;
			};
			$scope.selectShapeColor = function(color) {
				$scope.selectedColor = color;
			}
			$scope.selectShape = function(shape) {
				$scope.selectedShape = shape;
			}

			$scope.changeSOShapeColor = function(color) {
					console.log("Changing SO Shape Color : " + color);

					$scope.selectedSO.setColor(color);
					$scope.selectedSO.mainType = 1;
					$scope.bottomPanel.layer.draw();
				};
			$scope.changeBinShape = function(shape) {
				if ($scope.isSelectedBO) {
					var index = $scope.binObjects.indexOf($scope.selectedBO);
					var binW = $scope.selectedBO.frame.width;
					var binY = (($scope.topPanel.background.height() - binW) / 2);

					$scope.selectedBO.changeShape(shape, index, binW, binY);
					$scope.topPanel.draw();
				}
			}
			$scope.changeBinTitle = function(){
				if ($scope.isSelectedBO) {
					$scope.selectedBO.title.setText($element.find("#newBinTitle")[0].value);
					$scope.topPanel.draw();
				}
			};
			$scope.changeBinIconColor = function(color) {
					if ($scope.isSelectedBO) {

						console.log("Changing bin title icon color : " + color);

						$scope.selectedBO.titleIcon.setFill(color);
						$scope.selectedBO.color = color;
						$scope.selectedBO.titleIcon.mainType = 1;
						$scope.topPanel.draw();
					}
				};
			$scope.changeBinIconShape = function(shape) {
					if ($scope.isSelectedBO) {
						$scope.selectedBO.changeIconShape(shape);
						$scope.topPanel.updateTitleBar($scope.binObjects);
					}
				};
			$scope.changeBinIconGraphic = function(graphic) {
				if ($scope.isSelectedBO) {
					$scope.selectedBO.changeIconGraphic(graphic);
					$scope.topPanel.updateTitleBar($scope.binObjects);
				}
			};

			$scope.deSelectBin = function() {
				if (!$scope.isSelectedBO) return;

				$scope.selectedBO.titleBackground.setFill('transparent');
				$scope.selectedBO.selectionRect.destroy();
				$scope.selectedBO.triangle.destroy();
				$scope.selectedBO.dialog.destroy();
				$scope.selectedBO.label1.destroy();

				$scope.selectedBO.selectionRect = null;
				$scope.selectedBO = null;
				$scope.isSelectedBO = false;

				$scope.topPanel.draw();
			}
			$scope.makeSelected = function() {
					$scope.deSelectBin();
					$scope.isSelectedBO = true;
					$scope.selectedBO = this;
					$scope.selectedBOIndex = $scope.binObjects.indexOf(this);
					$scope.styleObject = "Bin Style";
					$scope.$apply();
			};
			$scope.reAdjustBins = function() {

				var binX = 0;
				var binW = 0;
				var binY = 0;

				for (var i = 0; i < $scope.binObjects.length; i++) {
					var binObject = $scope.binObjects[i];
					// Square or Rectangle
					if (binObject.objectInfo.type == 1) {
						binW = binObject.frame.width;
						binY = (($scope.topPanel.background.height() - binW) / 2);

						binObject.setPosition(binX, binY);
						binObject.setSize(binW, binW);
					}
					// Square or Rectangle with Round Corner
					else if (binObject.objectInfo.type == 2) {
						binW = binObject.frame.width;
						binY = (($scope.topPanel.background.height() - binW) / 2);

						binObject.setPosition(binX, binY);
						binObject.setSize(binW, binW);
						binObject.setCornerRadius(25);
					}
					// Circle
					else if (binObject.objectInfo.type == 3) {
						binW = binObject.getRadius();
						binY = (($scope.topPanel.background.height() - binW*2) / 2);

						binObject.setPosition(binX+binW, binY+binW);
						binObject.setRadius(binW);

						//To make it complete circle
						binW = binW * 2;
					}

					binX += binW + 20;
				}

				$scope.topPanel.container.setWidth(binX);
				$scope.topPanel.background.setWidth(binX);
				$scope.topPanel.draw()
				$scope.reflow();
			};
			$scope.returnSplitterObject = function(shapeInfo, size, position)
			{
					var splitObj;
					if (shapeInfo.type == 1)
					{
						splitObj = new SplitterObject($scope.bottomPanel, $scope.topPanel, $scope.transitionLayer, $scope.splitBar, shapeInfo);
						splitObj.setSize_Rect(size.Width, size.Height);
						splitObj.togglelasso = $scope.toggleLasso;
						splitObj.Watch = Watch;
						splitObj.setPosition_Rect(position.X, position.Y);
					}
					else
					{
						shapeInfo.angle = position.Angle;
						splitObj = new SplitterObject($scope.bottomPanel, $scope.topPanel, $scope.transitionLayer, $scope.splitBar, shapeInfo);
						splitObj.setSize_Circle(size.Radius);
						splitObj.togglelasso = $scope.toggleLasso;
						splitObj.Watch = Watch;
						splitObj.setPosition_Circle(position.X, position.Y, position.Angle, position.Rotation);
					}

					splitObj.onUnSelected = function(obj) {};
					return splitObj;
			}


			//------------------------------------------------------------------------------------------
			//-----------------------------  Add Bin/Split Object Methods ------------------------------
			//------------------------------------------------------------------------------------------

			$scope.addNewGraphic = function()
			{
					var name = $scope.lastSelectedGraphics.name;
					var position;
					var size;

					var info = {
						mainType: 2,
						image: $scope.lastSelectedGraphics.image,
						offsetX: 0,
						offsetY: 0,
						scaleX: 0.26,
						scaleY: 0.26,
						inWorkView:true
					};

					if (name == "square") {

						size = {
							Width: 100,
							Height: 100
						};
						position = {
							X: 50,
							Y: 50
						}
						info.type = 1;
					}
					else if (name == "rectLandscape") {
						size = {
							Width: 150,
							Height: 100
						};
						position = {
							X: 50,
							Y: 50
						}

						info.type = 1;
						info.scaleX = 0.39;
						info.scaleY = 0.52;
					}
					else if (name == "rectPortrait") {
						size = {
							Width: 100,
							Height: 150
						};
						position = {
							X: 50,
							Y: 50
						}
						info.type = 1;
						info.scaleX = 0.50;
						info.scaleY = 0.40;
					}
					else if (name == "circle") {
						size = {
							Radius: 50
						};
						position = {
							X: 50,
							Y: 50,
							Angle: 360,
							Rotation: 0
						}

						info.type = 2;
						info.offsetX = 190;
						info.offsetY = 190;
					}
					else {
						console.log("Unknown Shape");
					}

					$scope.addSplitterObject(info, size, position);
				};

			$scope.addNewShape = function()
			{
					var shapeName = $scope.selectedShape.name;
					var type = 1;

					var shapePosition;
					var shapeSize;

					if (shapeName == "square") {
						console.log("Square is the shape");
						type = 1;

						shapeSize = {
							Width: 100,
							Height: 100
						};
						shapePosition = {
							X: 50,
							Y: 50
						}
					}
					else if (shapeName == "rectLandscape") {
						console.log("rectLandscape is the shape");
						type = 1;

						shapeSize = {
							Width: 150,
							Height: 100
						};
						shapePosition = {
							X: 50,
							Y: 50
						}
					}
					else if (shapeName == "rectPortrait") {
						console.log("rectPortrait is the shape");
						type = 1;

						shapeSize = {
							Width: 100,
							Height: 150
						};
						shapePosition = {
							X: 50,
							Y: 50
						}
					}
					else if (shapeName == "circle") {
						console.log("circle is the shape");
						type = 2;

						shapeSize = {
							Radius: 50
						};
						shapePosition = {
							X: 50,
							Y: 50,
							Angle: 360,
							Rotation: 0
						}
					}
					else {
						console.log("Unknown Shape");
					}

					var shapeInfo = {
						mainType: 1,
						type: type,
						offsetX: 0,
						offsetY: 0,
						color: $scope.selectedColor,
						inWorkView: true
					};

					$scope.addSplitterObject(shapeInfo, shapeSize, shapePosition);
				}

			$scope.addNewBin = function(title, description)
			{
				var binTitle = (title.length == 0) ? "Title" : title;
				var binDescription = (description.length == 0) ? "Description" : description;

				var binW = 150
				var totalBW = $scope.topPanel.container.width() + 150 + 20;
				var binX = $scope.topPanel.container.width();
				var binY = (($scope.topPanel.background.height() - binW) / 2);

				var objectInfo;
				var objectSize;
				var objectPosition;

				// Square
				if ($scope.selectedBinShape.name == "square") {
					console.log("New Bin Object is Square");
					objectInfo = {
						type: 1,
						desc: "Square or Rectangle",
						title: binTitle
					};
					objectSize = {
						Width: binW,
						Height: binW
					}
					objectPosition = {
						X: binX,
						Y: binY
					}
				}
				// Square or Rectangle with Round Corner
				else if ($scope.selectedBinShape.name == "rectRoundCorner") {
					console.log("New Bin Object is Square with round Corners");
					objectInfo = {
						type: 2,
						desc: "Square or Rectangle with Round Corner",
						title: binTitle
					};

					objectSize = {
						Width: binW,
						Height: binW,
						cornerRadius: 25
					}
					objectPosition = {
						X: binX,
						Y: binY
					}
				}
				// Circle
				else if ($scope.selectedBinShape.name == "circle") {
					console.log("New Bin Object is Circle");
					objectInfo = {
						type: 3,
						desc: "Circle",
						title: binTitle
					};

					objectSize = {
						radius: binW / 2
					}
					objectPosition = {
						X: binX + (binW / 2),
						Y: binY + (binW / 2)
					}
				}

				$scope.addBins(objectInfo, objectSize, objectPosition);
				$scope.reAdjustBins();
			}

			$scope.addBins = function(objectInfo, size, position)
			{
					var binObject = new BinObject($scope, $scope.topPanel, $scope.MainLayer, objectInfo);
					binObject.makeSelected = $scope.makeSelected;
					binObject.deSelectBin = $scope.deSelectBin;
					binObject.reAdjustBins = $scope.reAdjustBins;
					binObject.getIndex = function(){
						return $scope.binObjects.indexOf(binObject);
					}
					binObject.removeFromArray = function(){
						var index = $scope.binObjects.indexOf(binObject);
						if (index > -1) $scope.binObjects.splice(index, 1);
					};

					//Square
					if (objectInfo.type == 1) {
						binObject.setPosition(position.X, position.Y);
						binObject.setSize(size.Width, size.Height);
					}
					// Square with Round Corner
					else if (objectInfo.type == 2) {
						binObject.setPosition(position.X, position.Y);
						binObject.setSize(size.Width, size.Height);
						binObject.setCornerRadius(size.cornerRadius);
					}
					// Circle
					else if (objectInfo.type == 3) {
						binObject.setPosition(position.X, position.Y);
						binObject.setRadius(size.radius);
					}

					binObject.layer.draw();
					$scope.binObjects.push(binObject);
				}
			$scope.addSplitterObject = function(shapeInfo, size, position)
			{
					var splitObj;

					if (shapeInfo.type == 1) {
						splitObj = new SplitterObject($scope.bottomPanel, $scope.topPanel, $scope.transitionLayer, $scope.splitBar, shapeInfo);
						splitObj.setPosition_Rect(position.X, position.Y);
						splitObj.setSize_Rect(size.Width, size.Height);
						splitObj.togglelasso = $scope.toggleLasso;
						splitObj.Watch = Watch;
					}
					else {
						shapeInfo.angle = position.Angle;
						splitObj = new SplitterObject($scope.bottomPanel, $scope.topPanel, $scope.transitionLayer, $scope.splitBar, shapeInfo);
						splitObj.setPosition_Circle(position.X, position.Y, position.Angle, position.Rotation);
						splitObj.setSize_Circle(size.Radius);
						splitObj.togglelasso = $scope.toggleLasso;
						splitObj.Watch = Watch;
					}

					splitObj.onSelected = function(obj) {

						$scope.styleObject = "Shape Style";
						if (!$scope.isLasso) {

							// if lasso tool is not ON
							selected = [];
							selected.push(obj);
							console.log("Before Is Selected So : " + $scope.isSelectedSO);

							$scope.isSelectedSO = true;
							$scope.selectedSO = splitObj;

							console.log("After Is Selected So : " + $scope.isSelectedSO);

							drawDialog(selected);
							// for draw spltting menu
							drawMenu(selected);

							for (var i = 0; i < $scope.splitterObjects.length; i++) {
								if ($scope.splitterObjects[i] != obj && $scope.splitterObjects[i].isSelected) {
									$scope.splitterObjects[i].setSelected(false);
								}
							}

							$scope.$apply();
						}
					};
					splitObj.onUnSelected = function(obj) {};
					$scope.splitterObjects.push(splitObj);
				}

			var addStartingBins = function()
			{
				var binPadding = 20;
				var binCount = $scope.currentQuestion.binCount;
				var binTitle = $scope.currentQuestion.binTitle;
				var binW = 150;
				var totalBW = binW * binCount + (binPadding * (binCount + 1));
				var binX = 0;
				var binY = (($scope.topPanel.background.height() - binW) / 2);
				var binCornerRadius = 25;

				$scope.topPanel.container.setWidth(totalBW-20);
				$scope.topPanel.background.setWidth(totalBW-20);

				for (var i = 0; i < binCount; i++) {

					var objectInfo;
					var objectSize;
					var objectPosition;

					objectInfo = {
						type: 1,
						desc: "Square or Rectangle",
						title: binTitle + " " + (i + 1)
					};
					objectSize = {
						Width: binW,
						Height: binW
					}
					objectPosition = {
						X: binX,
						Y: binY
					}

					$scope.addBins(objectInfo, objectSize, objectPosition);
					binX += binW + binPadding;
				}

			}
			var addStartingSplitterObjects = function()
			{
					var objectsCount = $scope.currentQuestion.objectsCount;
					var objW = 100;
					var objH = 100;
					var objPadding = 5;
					var totalObjW = objW * objectsCount + (objPadding * objectsCount);
					var objX = ($scope.bottomPanel.width() - totalObjW) / 2;
					var objY = 50;

					for (var i = 0; i < objectsCount; i++) {
						var shapeInfo = {
							mainType: 1,
							type: 1,
							offsetX: 0,
							offsetY: 0,
							color: "rgba(180,190,196,1)",
							inWorkView: true
						};
						var shapeSize = {
							Width: objW,
							Height: objH
						};
						var shapePosition = {
							X: objX,
							Y: objY
						};

						$scope.addSplitterObject(shapeInfo, shapeSize, shapePosition);
						objX += objW + objPadding;
					}

				}

			//----------------------------------------------------------------------------
			//-----------------------------  Watch For Undo ------------------------------
			//----------------------------------------------------------------------------
			function Watch(Object)
			{
				$scope.stack = undefined;

				console.log(">>>>>>>>>>>>> Saving Undo# " + $scope.app.length);
				// for backup objects pass splitter objects in constructor and save there info
				$scope.stack = new Stack($scope, $scope.splitterObjects);

				$scope.stack.addSplitterObject = $scope.addSplitterObject;
				$scope.app.push($scope.stack);

			};

			$scope.Undo = function() {

					removeDialog();

					if ($scope.app.length> 0) {

						// var index = $scope.app.length - 1;
						if($scope.app.length>1){
							var index = $scope.app.length - 1;
						}else{
							var index = $scope.app.length - 1;
						}

						console.log(">>>>>>>>>>>>> Undo Index: " + index + " Length: " + $scope.app.length);

						// Delete Current objects in Bottom layer
						$scope.deleteAllSplitterObjects();
						// Now draw again the backup objects on last index
						$scope.app[index].draw();
						// Now remove the backup from array
						if(index!=0){
							// var index = index;
							$scope.app.splice(index, 1);
						}



					}
					$scope.MainLayer.draw();
					$scope.bottomPanel.layer.draw();

				}


			//----------------------------------------------------------------------------
			//----------------- Zoom/Pan Scroller Implementation -------------------------
			//----------------------------------------------------------------------------

			// kinetic drag handling //
			var somethingIsBeingDraggedInKinetic = false; // used to stop scroller from scrolling on drag
			var touchedView = 0; // tell scroller what was touched by it's ID
			//var binView = 7; // there is probably a way to get the id directly from the nodes... this is how I did it
			//var workView = 14; //this is the id for the bottom's background. - greg

			var binView = $scope.topPanel.background._id;
			var workView = $scope.bottomPanel.background._id;


			var wGroup = $scope.bottomPanel.container;
			var bGroup = $scope.topPanel.container;
			var wLayer = $scope.bottomPanel;
			var bLayer = $scope.topPanel;

			$scope.setStageClickDisable = function(bool){
				somethingIsBeingDraggedInKinetic = bool;
			}

			$scope.stage.on('touchstart mousedown', function(evt) {
					if (evt.target.attrs.draggable) {
						somethingIsBeingDraggedInKinetic = true;
					}
					else {
						touchedView = evt.target._id;
					}
				});
			$scope.stage.on('mouseup touchend', function(evt) {
					somethingIsBeingDraggedInKinetic = false;
				});

			//  Render functions
			var bRender = function(left, top, zoom) {
					bGroup.x((left * -1));
					bGroup.y((top * -1));
					bGroup.scaleX(zoom);
					bGroup.scaleY(zoom);
					$scope.transitionLayer.scaleX(zoom);
					$scope.transitionLayer.scaleY(zoom);
					$scope.topPanel.updateTitleBar($scope.binObjects);
					bLayer.draw();
				}
			var wRender = function(left, top, zoom) {
					wGroup.x((left * -1));
					wGroup.y((top * -1)); // +bViewHeight; I was adding the height of the toppanel before because scrollers were both positioned at 0 in my demo - greg
					wGroup.scaleX(zoom);
					wGroup.scaleY(zoom);
					$scope.transitionLayer.scaleX(zoom);
					$scope.transitionLayer.scaleY(zoom);
					wLayer.draw();
				};

			// Intialize layout

			var container = $element.find("#splitter_surface")[0];
			//get the width and hieght of the container
			var clientWidth = container.clientWidth;
			var clientHeight = container.clientHeight;

			// set conetent areas
			var bContentWidth = bGroup.width(); //  These would need to be calculated by the space the bins take up and update
			var bContentHeight = bGroup.height(); // /when bins are added, removed, or resized.

			var wContentWidth = wGroup.width();
			var wContentHeight = wGroup.height();

			// im calling each area a "view"
			// set up the starting values for each view

			var bViewWidth = clientWidth;
			var bViewHeight = clientHeight; //*viewRatio;

			var wViewWidth = clientWidth;
			var wViewHeight = clientHeight; //*(1-viewRatio);

			// Initialize Scrollers
			var bScroller = new Scroller(bRender, {
					zooming: true,
					locking: false,
					centering: true,
					minZoom: 1,
					maxZoom: 4

				});
			var wScroller = new Scroller(wRender, {
					zooming: true,
					locking: false,
					centering: true,
					minZoom: 1,
					maxZoom: 4
				});

			//  The returned value is a TextRectangle object, which contains read-only left, top, right and bottom properties
			//  describing the border-box in pixels. top and left are relative to the top-left of the viewport.
			var rect = container.getBoundingClientRect();

			// Reflow handling
			$scope.reflow = function() {
				clientWidth = container.clientWidth;
				clientHeight = container.clientHeight;

				//bContentHeight = bGroup.height(); //
				//wContentHeight = wGroup.height();

				bContentHeight = $scope.topPanel.background.getHeight(); // use the background's size as the "content" so that scroller will center it for us - greg
				wContentHeight = $scope.bottomPanel.background.getHeight(); // use the background's size as the "content" so that scroller will center it for us - greg

				bViewWidth = clientWidth;
				bViewHeight = $scope.topPanel.layer.height();

				wViewWidth = clientWidth;
				wViewHeight = $scope.bottomPanel.layer.height();

				var x = rect.left + container.clientLeft;
				var y = rect.top + container.clientTop;

				var newX = (bContentWidth - $scope.topPanel.container.getWidth()) / 2;
				var newW = $scope.topPanel.container.getWidth();

				if(newX < 0) newX = 0;

				bScroller.setPosition(newX, y);
				wScroller.setPosition(x, $scope.bottomPanel.getY());
				bScroller.setDimensions(bViewWidth, bViewHeight, newW, bContentHeight);
				wScroller.setDimensions(wViewWidth, wViewHeight, wContentWidth, wContentHeight);

				$scope.stage.draw();

				console.log("New X : " + newX);
			};

			$scope.splitBar.onSplitMoved = function() {
					$scope.reflow();
				}
			window.addEventListener("resize", $scope.reflow, false);

			// Scroller Touch events
			if ('ontouchstart' in window)
			{

					container.addEventListener("touchstart", function(e) {

					// if lasso is on then stop scroll and draw lasso
					if($scope.isLasso && touchedView == workView){
						onMouseDown(e);
					}else{

						// Don't react if initial down happens on a form element
						if (e.touches[0] && e.touches[0].target && e.touches[0].target.tagName.match(/input|textarea|select/i)) {
							return;
						}
						// Don't react if initial down happens on a draggable element
						if (somethingIsBeingDraggedInKinetic) {
							console("Scroller touch blocked");
							return;
						}

						removeDialog();

						$scope.deSelectBin();
						$scope.isSelectedSO = false;
						$scope.selectedSO = undefined;
						$scope.$apply();

						$element.find("#subMenu")[0].style.zIndex = -1;
						$("[data-toggle=SubStyle_Bin]", $element).popover('hide');
						$("[data-toggle=Style]", $element).popover('hide');
						$("[data-toggle=Style_Shape]", $element).popover('hide');
						$("[data-toggle=Style_Bin]", $element).popover('hide');
						$("[data-toggle=Add]", $element).popover('hide');

						// determin which view to scroll based on the id of the touched view
						if (touchedView == binView) {
							bScroller.doTouchStart(e.touches, e.timeStamp);
							//bOldZoom = bScroller.getValues().zoom;
						}
						if (touchedView == workView) {
							wScroller.doTouchStart(e.touches, e.timeStamp);
							//wOldZoom = wScroller.getValues().zoom;
						}
					}//else
						e.preventDefault();

					}, false);

					$element.find("#splitterApp")[0].addEventListener("touchmove", function(e) {

							// if lasso is on then stop scroll and draw lasso
					if($scope.isLasso){
						onMouseMove(e);
					}else{


						// determin which view to scroll based on the id of the touched view
						if (touchedView == binView) {
							bScroller.doTouchMove(e.touches, e.timeStamp, e.scale);
							// set the bottomPanel to zoom to the top Panels value  - greg
							// maybe not effiecent but works. could check some stuff before doing it.
							wScroller.zoomTo(bScroller.getValues().zoom);
						}
						if (touchedView == workView) {
							wScroller.doTouchMove(e.touches, e.timeStamp, e.scale);
							// set the topPanel to zoom to the bottom Panels value - greg
							bScroller.zoomTo(wScroller.getValues().zoom);
						}
					}

					}, false);

					$element.find("#splitterApp")[0].addEventListener("touchend", function(e) {

					// if lasso is on then stop scroll and draw lasso
					if($scope.isLasso){
						onMouseUp(e);
					}else{
						// determin which view to scroll based on the id of the touched view
						if (touchedView == binView) {
							bScroller.doTouchEnd(e.timeStamp);
						}
						if (touchedView == workView) {
							wScroller.doTouchEnd(e.timeStamp);
						}
						touchedView = 0; //reset so drags that start on nothing don't activate scroller - greg
					}//else
					}, false);

					$element.find("#splitterApp")[0].addEventListener("touchcancel", function(e) {
						// determin which view to scroll based on the id of the touched view
						if (touchedView == binView) {
							bScroller.doTouchEnd(e.timeStamp);
						}
						if (touchedView == workView) {
							wScroller.doTouchEnd(e.timeStamp);
						}
						touchedView = 0; //reset so drags that start on nothing don't activate scroller - greg
					}, false);

				}
			else
			{
					// Scroller Mouse events
					var mousedown = false;

					container.addEventListener("mousedown", function(e) {

						console.log("Container:: On Mouse Down");

					if($scope.isLasso && touchedView == workView){

							onMouseDown(e);
					}else{

						if (e.target.tagName.match(/input|textarea|select/i)) {
							return;
						}
						if (somethingIsBeingDraggedInKinetic) {
							return;
						}


						removeDialog();

						$scope.deSelectBin();
						$scope.isSelectedSO = false;
						$scope.selectedSO = undefined;
						$scope.$apply();

						$element.find("#subMenu")[0].style.zIndex = -1;
						$("[data-toggle=SubStyle_Bin]", $element).popover('hide');
						$("[data-toggle=Style]", $element).popover('hide');
						$("[data-toggle=Style_Shape]", $element).popover('hide');
						$("[data-toggle=Style_Bin]", $element).popover('hide');
						$("[data-toggle=Add]", $element).popover('hide');

						console.log("TouchView: " + touchedView +" "+  workView + " " + binView);

						if (touchedView == binView) {
							bScroller.doTouchStart([
								{
								pageX: e.pageX,
								pageY: e.pageY}], e.timeStamp);
						}
						if (touchedView == workView) {
							wScroller.doTouchStart([
								{
								pageX: e.pageX,
								pageY: e.pageY}], e.timeStamp);
						}
							mousedown = true;

						}//else

					}, false);

					$element.find("#splitterApp")[0].addEventListener("mousemove", function(e) {

						if($scope.isLasso && touchedView == workView){
							onMouseMove(e);
						}else{

						if (!mousedown) {
							return;
						}
						if (touchedView == binView) {
							bScroller.doTouchMove([
								{
								pageX: e.pageX,
								pageY: e.pageY}], e.timeStamp);
						}
						if (touchedView == workView) {
							wScroller.doTouchMove([
								{
								pageX: e.pageX,
								pageY: e.pageY}], e.timeStamp);
						}

						mousedown = true;
					}
					}, false);

					$element.find("#splitterApp")[0].addEventListener("mouseup", function(e) {

						if($scope.isLasso && touchedView == workView){
							onMouseUp(e);
						}else
						{

							if (!mousedown) {
								return;
							}
							if (touchedView == binView) {
								bScroller.doTouchEnd(e.timeStamp);
							}
							if (touchedView == workView) {
								wScroller.doTouchEnd(e.timeStamp);
							}

						}//else
							touchedView = 0; //reset so drags that start on nothing don't activate scroller - greg
							mousedown = false;
					}, false);
					// Mouse scroll wheel support. we will need to add this in splitter since it should be used on PC too.
					container.addEventListener(navigator.userAgent.indexOf("Firefox") > -1 ? "DOMMouseScroll" : "mousewheel", function(e) {
						bScroller.doMouseZoom(e.detail ? (e.detail * -120) : e.wheelDelta, e.timeStamp, e.pageX, e.pageY);
						wScroller.doMouseZoom(e.detail ? (e.detail * -120) : e.wheelDelta, e.timeStamp, e.pageX, e.pageY);

					}, false);

				}

			$scope.startApp = function(){

				$scope.topPanel.container.setWidth(0);
				$scope.topPanel.background.setWidth(0);
				$scope.topPanel.container.setX(0);
				$scope.topPanel.background.setX(0);

				addStartingSplitterObjects();
				addStartingBins();
				$scope.reflow();
			}
			// Calling the function to create Bins and Splitter Objects

			$scope.startApp();
			//For Undo
			Watch(undefined);

			//For Screen Resizing
			$scope.reflow();



		    //---------------------------------------
		    //----- Setup Template Runner -----------
		    //---------------------------------------
		    $scope.templateRunner = new TemplateRunner($scope, $element);


        }); //End of Controller


})();
