(function() {
'use strict';
//math tools template for registering the tool
    var template = {
        type: 'PrimeFactorToolbarItem',
        displayName: 'Prime Factorization',
        htmlTemplate: '<mt-primefactor-applet tool-id="toolId" container-api="containerApi" id="tool-{{toolId}}"</mt-primefactor-applet>',
        exportTargets: ['table'],
        applet: true
    };

    var url = 'prime/index2.html';
//add the module as a math tool dependency
    window.mt.loadModules.push('mtPrimefactorApplet');

    angular.module('mtPrimefactorApplet', ['mt.common'])
    .config(function (toolRegistryServiceProvider) {
        toolRegistryServiceProvider.addTemplate(template);
    })
    .directive('mtPrimefactorApplet', function(){
        return {

            scope: {
                toolId: '=',
                containerApi: '='
            },
            // replace: true,
            link: function($scope, element, attributes){
            
            
            console.log = function(){};

		/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
		/* Merging js from "prime_files.txt" begins */
		/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
		
		
		/* Last merge : Thu Aug 28 19:55:18 PKT 2014  */
		
		/* Merging order :
		
		- node.js
		- nodeMenu.js
		- primeFactorCalculator.js
		
		*/
		
		
		/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
		/* Merging js: node.js
		 begins */
		/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
		
		function node(stage, parentLayer, x, y, radius, text, nodeType, parentNode, rowNumber, isPrime, scope, element){
		// Self Variable
		var self = this;
		
		self.radius = radius;
		self.cloneObject = undefined;
	
		self.scope = scope;
		self.element = element;
		// Set & Get Functions
		self.isNodeMenu = function(){
			return self.isMenu;
		};
		self.setNodeMenu = function(enabled){
			self.isMenu = enabled;
		};
		self.IsMoveAble = false;
		self.isDropped = false;
		
		self.setColor = function(color){
			self.circle.setFill(color);
		}
		self.getColor = function(color){
			return self.circle.getFill();
		}
		self.setText = function(text){
			self.text = text;
			if(self.circleText != undefined)
				self.circleText.setText(text);
		};
		self.getText = function(){
			return self.text;
		};
		self.setPosition = function(xAxis, yAxis){
			//console.log("Setting Position : " + xAxis + " " + yAxis);
			
			self.container.setX(xAxis);
			self.container.setY(yAxis);
			
			/*self.circle.setX(X);
			self.circle.setY(Y);
			self.circleBorder.setX(X);
			self.circleBorder.setY(Y);
			self.circleText.setX(X-(32/2));
			self.circleText.setY(Y-(32/3));
			*/
		};
		self.setSize = function(width, height){
			self.container.width(width);
			self.container.height(height);
		};
		self.getX = function(){
			return self.container.x() + 32;
		};
		self.getY = function(){
			return self.container.y() + 32;
		};
		self.setLinePosition = function(x1, y1,x2, y2){
			self.line.setPoints([x1, y1, x2, y2]);
		}
		self.getPoints = function(){
			return self.line.points();
		}
		self.setIsMoveAble = function(enabled){
			self.IsMoveAble = enabled;
		};
		self.getIsMoveAble = function(){
			return self.IsMoveAble;
		};
		
		self.setLeftChild = function(node){
			self.leftChild = node;
		};
		self.setRightChild = function(node){
			self.rightChild = node;
		};
		self.getLeftChild = function(){
			return self.leftChild;
		};
		self.getRightChild = function(){
			return self.rightChild;
		};
		self.getParentNode = function(){
			return self.parentNode;
		};
		self.getRowNumber = function(){
			return self.rowNumber;
		};
		self.getNodeType = function(){
			return self.nodeType;
		};
		
		self.makeNormalNode = function(){
			
			//console.log("Making Normal Node");
			self.circleBorder.stroke('#b3b3b3');
			self.circleBorder.strokeWidth(1);
			self.circleBorder.dash([0,0]);
			self.circleBorder.dashEnabled(false);
			
			if(self.getText()) self.circle.fill('#e6e6e6');
			else self.circle.fill('white');
				
			self.circle.opacity(1);
			self.circleText.opacity(1);
		};
		self.makeGhostPrime = function(value){
			if(value == 1){
				self.circleBorder.stroke('#82bff0');
				self.circleBorder.strokeWidth(1);
				self.circleBorder.dash([5,2]);
				self.circleBorder.dashEnabled(true);
				self.circle.fill('#82bff0');
				self.circle.opacity(0.3);
				self.circleText.opacity(0.4);
			}else{
				self.circleBorder.stroke('#82bff0');
				self.circleBorder.strokeWidth(1);
				self.circleBorder.dash([0,0]);
				self.circleBorder.dashEnabled(false);
				self.circle.fill('#82bff0');
				self.circle.opacity(1);
				self.circleText.opacity(1);
			}
		};
		self.solve = function(value){
			if(self.isPrime == true) return;
			
			//console.log("Applying Border Style");
			if(value == 2){
				// Solved Border
				self.circleBorder.stroke('#ffc175');
				self.circleBorder.strokeWidth(1);
				self.circleBorder.dash([5,2]);
				self.circleBorder.dashEnabled(true);
				
				self.circle.fill('#ffc175');
				self.circle.opacity(0.3);
				
				self.circleText.opacity(0.4); 
			}
			else{ 
				// Unsolved Border
				self.circleBorder.stroke('#ffc175');
				self.circleBorder.strokeWidth(1);
				self.circleBorder.dash([0,0]);
				self.circleBorder.dashEnabled(false);
				
				self.circle.fill('#ffc175');
				self.circle.opacity(1);
				
				self.circleText.opacity(1);  
			}
		}
		self.solveNode = function(){
			if(self.isPrime == true){
				var isSolved1 = false;
				var isSolved2 = false
				
				if(self.getLeftChild())
					if(self.getLeftChild().getText() != "")
						isSolved1 = true;
				
				if(self.getRightChild())
					if(self.getRightChild().getText() != "")
						isSolved2 = true;
				
				if(isSolved1 && isSolved2){
					self.solve(2);
				}
				else{
					self.solve(1);
					self.setColor('#ffc175');
				}
			}
			else if(self.getLeftChild().getText() != "" && self.getRightChild().getText() != ""){
				self.solve(2);
			}
			else{
				self.solve(1);
				self.setColor('#ffc175');
			}
		};
		
		self.removeSelf = function(){
			self.line.remove();
			self.removeNodeMenu();
			self.container.remove();
			if(self.cloneObject)
				self.cloneObject.destroy();
		};
		self.removeNodeMenu = function(){
			if(self.isNodeMenu() == false)
				return;
	
			self.setNodeMenu(false);
			self.menu.remove();
			self.menu = undefined;
		};
		self.addNodeMenu = function(){
			if(self.isNodeMenu() == true)
				return;
				
			self.setNodeMenu(true);
			
			var tempX = self.getX() - radius;
			var tempY = self.getY() + radius + 15;
			self.menu = new nodeMenu(parentLayer, tempX, tempY);
			self.menu.compositeButton = compositeButton;
			self.menu.primeButton = primeButton;
		};
		self.changePosition = function(selfX, selfY, parentX, parentY){
			
			if(self.parentNode.isPrime){
				self.setPosition(parentX-32, parentY+48);
				self.setLinePosition(parentX, parentY, parentX, parentY+64);	
			}
			else{
				self.setPosition(selfX-radius, selfY-radius);
				self.setLinePosition(parentX, parentY, selfX, selfY);
				
				if(self.isMenu == true){
					var tempX = selfX - radius;
					var tempY = selfY + radius + 15;
					self.menu.updateMenuPosition(tempX, tempY);
				}
			}
		}
		self.moveToFront = function(){
			if(self.line != undefined)
				self.line.moveToTop();
		
			self.container.moveToTop();
			//self.circleBorder.moveToTop();
			//self.circle.moveToTop();
			//self.circleText.moveToTop();
			
			if(parentNode != undefined)
				parentNode.moveToFront();
		};
		
		// Event Listeners Listeners
		function compositeButton(){
			
			self.unSelectNode();
			self.removeNodeMenu();
			//self.solve(1);
			//self.setColor('ffc175');
			self.addChildNodes(undefined, 1, self, self.getX(), self.getY(), (self.rowNumber+1), false);
			self.addChildNodes(undefined, 2, self, self.getX(), self.getY(), (self.rowNumber+1), false);
			
			self.moveToFront();
			self.reArrangeNodes();
			self.refreshLayer();
		};
		function primeButton(){
		
			self.unSelectNode(); // greg
			self.removeNodeMenu();
			self.isPrime = true;
			self.isDropped = false;
				
			if(self.checkPrimes != undefined)
				self.checkPrimes();
			
			self.reArrangeNodes();
			self.refreshLayer();
		};
		function nodeTouched(evt){
			
			if(self.getRowNumber() != 0)
				if(self.getParentNode().isPrime == true){
					/* self.getParentNode().nodeTouched(evt) */
					return;
				}
			// Unsselect the Node
			if(self.unSelectNode != undefined)
				self.unSelectNode();
			
			// Remove the clone if exists
			if(self.cloneObject != undefined){
				self.cloneObject.destroy();
				self.cloneObject = undefined;
			}
			
			// If Node was Prime
			if(self.isPrime == true){
				self.isPrime = false;
				self.addNodeMenu();
				//self.container.draggable(false);
			}
			
			// If there was any error Remove Nodes
			if(self.removeErrorNodes != undefined)
				self.removeErrorNodes();
			
			// Romve any children if has
			if(self.getLeftChild() != undefined){
				if(self.destroyChildNodes != undefined){
					self.destroyChildNodes(self, true);	
				}
				self.reArrangeNodes();		
			}
			
			//Rearrange Nodes if it had children
			//if(self.getLeftChild() != undefined){
			//	self.reArrangeNodes(); //  
			//}
			// Check for the primes 
			if(self.checkPrimes != undefined)
				self.checkPrimes();
			
			// Rearrange Nodes
			self.reArrangeNodes(); 
						
			if(self.selectNode != undefined)
				self.selectNode();
						
			self.promtText(self.getText());
			
		};
		self.promtText = function(value){
			// could we do this in only one place? like trigger the other render to happen since it calculates it there too?
			// use getValues() to access the left, top, and zoom of a scroller outside of the render function
			// var my_scope = angular.element($("#PrimeFactorID")).scope();
			
			var values = self.scope.scroller.getValues();
			
			var container = self.element.find("#primefactor_surface")[0];
	
			console.log(container.clientLeft);
	
			self.element.find(".primefactor_textField")[0].style.left = ""+(self.getX() + container.clientLeft + container.offsetLeft + values.left*-1) - radius - 0.5 + "px";
			self.element.find(".primefactor_textField")[0].style.top = ""+(self.getY()  + container.clientTop + container.offsetTop + values.top*-1) - radius - 0.5 + "px";
			
			self.setText("");
			self.makeNormalNode()
			self.circleBorder.stroke('black');
			self.circleBorder.strokeWidth(2);
			
			var txtfield = self.element.find(".primefactor_textField")[0];
			txtfield.style.display = "block";
			if ( value != 0) $("#textfield").val (value);
			$("#textfield").focus();
			if ( value != 0 || value != '') self.addNodeMenu();
			self.refreshLayer();
			 		 
			//userInput = (value == undefined) ? prompt('Value') : prompt('Value',value);
			//if (userInput) {
			// 	self.setText(userInput);
			//	self.addNodeMenu();
			//}
		};
		// Draw Everything
		self.draw = function(){
			// Functions
			self.selectNode = undefined;
			self.destroyChildNodes = undefined;
			self.addChildNodes = undefined;
			self.refreshLayer = undefined;
			self.reArrangeNodes = undefined;
			self.checkPrimes = undefined;
			self.nodeDropped = undefined;
			self.removeErrorNodes = undefined;
			self.isPFCalculator = undefined;
			self.unSelectNode = undefined;
			
			// Menu
			self.isMenu = false;
			self.menu = undefined;
			
			// Other and Self node Info
			self.container = undefined;
			self.circleBorder = undefined;
			self.circle = undefined;
			self.circleText = undefined;
			self.line = undefined;
			self.leftChild = undefined;
			self.rightChild = undefined;
			self.parentNode = parentNode;
			self.nodeType = nodeType;
			self.rowNumber = rowNumber;
			self.isPrime = isPrime;
			self.isNodePressed = false;
			
			//Creating Container
			self.container = new Kinetic.Group();
			// Setting Text
			self.setText((text == undefined) ? "" : text);
			
			//Positions
			var xOffset = 40;
			var yOffset = 80;
			var xAxis = x;
			var yAxis = y;
			
			if(nodeType == 1){
				xAxis = x-xOffset;
				yAxis = y+yOffset;
			}
			else if(nodeType == 2){
				xAxis = x+xOffset;
				yAxis = y+yOffset;
			}
			
			if(nodeType != 0){
				self.line = new Kinetic.Line({
					points: [parentNode.getX(), parentNode.getY(), xAxis, yAxis],
					stroke: '#666666',
					strokeWidth: 1
				});
				parentLayer.add(self.line);
			}
			
			self.setPosition(xAxis, yAxis);
			self.setSize(radius*2, radius*2);
			
			self.circleBorder = new Kinetic.Circle({
				x: radius,
				y: radius,
				radius: radius,
				fill: 'white',
				stroke: '#b3b3b3',
				strokeWidth: 1
			});
			
			var color = 'white';
			var fontsize = 20;
			
			//if(self.rowNumber == 0)
				//color = '#e6e6e6';
			
			self.circle = new Kinetic.Circle({
				x: radius,
				y: radius,
				radius: radius,
				fill: color//,
				//stroke: '#b3b3b3',
				//strokeWidth: 1
			});
			self.circleText = new Kinetic.Text({
				x:0,
				y:radius-(fontsize/2),
				width:radius*2,
				height:radius*2,
				text: self.text,
				fontSize:fontsize,
				align:'center',
				fontFamily: 'bentonSansBook',
				/* fontStyle:'300', */
				fill: '#363338'
			});
			
			var pointX = 0;
			var pointY = 0;
			
			self.container.on('mousedown touchstart', function(evt){
				evt.cancelBubble = true;
				self.manageScrolling(true);
				
				console.log("Mouse Down");
	
				if(self.isPrime == true){		
					var touchPos = stage.getPointerPosition()
					pointX = touchPos.x;
					pointY = touchPos.y;
					
					if(self.cloneObject == undefined && self.getIsMoveAble() && self.isPFCalculator()){
						console.log("Clone Created");
						
						self.cloneObject = this.clone();
						self.cloneObject.off('mousedown touchstart');
						self.cloneObject.off('mousemove touchmove');
						
						var children = self.cloneObject.getChildren();
						
						children[0].stroke('#82bff0');
						children[0].dash([5,2]);
						children[0].dashEnabled(true);
						children[1].opacity(0.3);
						children[2].opacity(0.4);
						
						this.draggable(true);
						
						parentLayer.add(self.cloneObject);
						this.moveToTop();
						self.refreshLayer();
					}
				}
			});
			self.container.on('mouseup touchend', function(evt){
				evt.cancelBubble = true;
				self.manageScrolling(false);
				
				console.log("Mouse Up");
				
				if(self.isPrime == true){
					var touchPos = stage.getPointerPosition();
					if(pointX == touchPos.x && pointY == touchPos.y){
						nodeTouched(evt);
					}else{
						if(self.nodeDropped){
							self.nodeDropped(self);
						}
					}
				}
				else{
					nodeTouched(evt);
				}
			});
			
			self.container.add(self.circleBorder);
			self.container.add(self.circle);
			self.container.add(self.circleText);
	
			parentLayer.add(self.container);
		};
		self.draw();
	};
		
		
		/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
		/* Merging js: nodeMenu.js
		 begins */
		/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
		
		
		function nodeMenu(parentLayer, x, y){
		var self = this;
	
		self.xAxis = x;
		self.yAxis = y;
			
		self.compositeButton = undefined;
		self.primeButton = undefined;
		
		self.getX = function(){
			return self.xAxis;
		};
		self.getY = function(){
			return self.yAxis;
		};
	
		self.draw = function(){
			var lineX = x+32.5;
			var lineY = y-15.5;
			
			self.line = new Kinetic.Line({
				points: [lineX, lineY, lineX, lineY+15],
	        	stroke: '#666666',
	        	strokeWidth: 1,
			});
			
			self.rectComposite = new Kinetic.Shape({
			    x: x+0.5,
			    y: y+0.5,
			    fill:'#ffc175',
				stroke:'#737373',
				strokeWidth:1,
			    drawFunc: function(context) {
			        var radius=3;
			        var x = 0;
			        var y = 0;
			        var width = 65;
			        var height = 45;
			        
			        context.beginPath()
			        context.moveTo(x + radius, y);
			        context.lineTo(x + width - radius, y);
			        context.quadraticCurveTo(x + width, y, x + width, y + radius);
			        context.lineTo(x + width, y + height);
			        context.lineTo(x, y + height);
			        context.lineTo(x, y + radius);
			        context.quadraticCurveTo(x, y, x + radius, y);
	   		        context.closePath();
			        context.fillStrokeShape(this);
			    }
			});
			
			self.compositeText = new Kinetic.Text({
				x:x,
				y:y+15,
				width:65,
				height:30,
				text: 'composite',
				fontSize:12,
				align:'center',
				fontFamily: 'bentonSansBook',
				/* fontStyle:'300', */
				fill: '#363338',
			});
	
			self.rectPrime = new Kinetic.Shape({
			    x: x+0.5,
			    y: y+44.5,
			    fill:'#82bff0',
				stroke:'#737373',
				strokeWidth:1,
			    drawFunc: function(context) {
			        var radius=3;
			        var x = 0;
			        var y = 0;
			        var width = 65;
			        var height = 45;
			        
			        context.beginPath()
			        context.moveTo(x, y);
			        context.lineTo(x + width, y);
			        context.lineTo(x + width, y + height - radius);
			        context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
			        context.lineTo(x + radius, y + height);
			        context.quadraticCurveTo(x, y + height, x, y + height - radius);
			        context.lineTo(x, y );
	   		        context.closePath();
			        context.fillStrokeShape(this);
			    }
			    
			});
			
			self.primeText = new Kinetic.Text({
				x:x,
				y:y+60,
				width:65,
				height:30,
				text: 'prime',
				fontSize:12,
				align:'center',
				fontFamily: 'bentonSansBook',
				/* fontStyle:'300', */
				fill: '#363338',
			});
			
			self.rectComposite.on('touchend mouseup', function(evt){
				evt.cancelBubble = true;
				if(self.compositeButton != undefined)
					self.compositeButton();
			});
			self.compositeText.on('touchend mouseup', function(evt){
				evt.cancelBubble = true;
				if(self.compositeButton != undefined)
					self.compositeButton();
			});
			self.rectPrime.on('touchend mouseup', function(evt){
				evt.cancelBubble = true;
				if(self.primeButton != undefined)
					self.primeButton();
			});
			self.primeText.on('touchend mouseup', function(evt){
				evt.cancelBubble = true;
				if(self.primeButton != undefined)
					self.primeButton();
			});
			
			parentLayer.add(self.line);
			parentLayer.add(self.rectComposite);
			parentLayer.add(self.rectPrime);
			parentLayer.add(self.compositeText);
			parentLayer.add(self.primeText);
		}
		
		self.remove = function(){
			self.line.remove();
			self.rectComposite.remove();
			self.rectPrime.remove();
			self.compositeText.remove();
			self.primeText.remove();
		};
		self.updateMenuPosition = function(x, y){
			self.xAxis = x;
			self.yAxis = y;
		
			self.line.points([x+32, y-15, x+32, y]);
			
			self.rectComposite.setX(x);
			self.rectComposite.setY(y);
			self.rectPrime.setX(x);
			self.rectPrime.setY(y+45);
			
			self.compositeText.setX(x);
			self.compositeText.setY(y+15);
			self.primeText.setX(x);
			self.primeText.setY(y+60);
		};
		
		self.draw();
	};
		
		/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
		/* Merging js: primeFactorCalculator.js begins */
		/*- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
		
		
		function primeFactorCalculator(parentLayer, layerWidth, y, totalNodes){
			var self = this;
			
			self.container = undefined;
			self.calculation = undefined;
			self.circleGroups = [];
			self.total = 0
			
			//functions
			self.setPosition = function(xAxis, yAxis){
				self.container.setX(xAxis);
				self.container.setY(yAxis);
			};
			self.setSize = function(width, height){
				self.container.width(width);
				self.container.height(height);
			};
			self.getWidth = function(){
				return self.container.width();
			};
			self.getHeight = function(){
				return self.container.height();
			};
			self.getX = function(){
				return self.container.x();
			};
			self.getY = function(){
				return self.container.y();
			};
			
			self.removeSelf = function(){
				self.container.remove();
			};
			self.equal = function(){
				var isAllowed = true;
				
				for(var j=0; j<self.circleGroups.length; j++){
					if(self.circleGroups[j].isFill == false){
						isAllowed = false;
						break;
					}
				}
				
				if(isAllowed == true){
					self.total = 1;
					for(var i=0; i<totalNodes; i++){
						var dictionary = self.circleGroups[i];
						var text = dictionary.text;
						
						self.total = self.total * parseInt(text.text());
					}
					
					if(self.calculation !=  undefined)
						self.calculation(self.total);
				}
			};
			
			self.draw = function(){
				console.log("Drawing Calculator");
				self.container = new Kinetic.Group();
				
				var width = 40 + (80 * totalNodes) + (30*totalNodes) + 75;
				var height = 91;
				var xAxis = (layerWidth-width)/2;
				var yAxis = y;
				
				self.setPosition(xAxis, yAxis);
				self.setSize(width, height);
				
				self.containerBorder = new Kinetic.Rect({
					x:0,
					y:0,
					width:width,
					height:height,
					stroke:'#b3b3b3',
					strokeWidth:1,
					fill:'transparent'
				});
				self.container.add(self.containerBorder);
				
				var tempX = 20;
				var tempY = 45.5;
				var tempRadius = 40;
				
				for(var i=0; i<totalNodes; i++){
					var group = new Kinetic.Group({
						x:tempX,
						y:tempY,
						width:tempRadius*2,
						height:tempRadius*2
					});
					
					var circleBorder = new Kinetic.Circle({
						x: tempRadius,
						y: 0,
						radius: tempRadius,
						fill: 'transparent',
						stroke: '#b3b3b3',
						strokeWidth: 1,
					});
					
					var circle = new Kinetic.Circle({
						x: 40,
						y: 0,
						radius: 32,
						fill: 'transparent'
					});
					var circleText = new Kinetic.Text({
						x:40-(40/2),
						y:-10,
						width:40,
						height:40,
						text: '',
						fontSize:20,
						align:'center',
						fontFamily: 'bentonSansLight',
						fill: '#363338',
					});
					
					group.add(circleBorder);
					group.add(circle);
					group.add(circleText);
					self.circleGroups.push({group:group, border:circleBorder, circle:circle, text:circleText, isFill:false});
					self.container.add(group);
					
					if(totalNodes != 0 && i < totalNodes-1){
						var multiplyText = new Kinetic.Text({
							x:tempX+85,
							y:35.5,
							text: 'X',
							width:20,
							height:20,
							fontSize:20,
							align:'center',
							fontFamily: 'bentonSansLight',
							fill:'#b3b3b3'
						});
						self.container.add(multiplyText);
						
					}
					
					tempX += 110;
				}
				
				tempY = 23.5;
				
				self.equalButton = new Kinetic.Rect({
					x:tempX,
					y:23.5,
					width:75,
					height:44,
					fill:'#82bff0',
					cornerRadius:2
				});
				self.equalText = new Kinetic.Text({
					x:tempX,
					y:22,
					text: '=',
					width:75,
					height:44,
					fontSize:50,
					align:'center',
					fontFamily: 'bentonSansLight',
					fill:'white'
				});
				
				self.container.add(self.equalButton);
				self.container.add(self.equalText);
				
				self.equalButton.on('touchend mouseup', function(evt){
					evt.cancelBubble = true;
					self.equal();
				});
				self.equalText.on('touchend mouseup', function(evt){
					evt.cancelBubble = true;
					self.equal();
				});
				
				parentLayer.add(self.container);
			}
			self.draw();
		};
            
            //------------------------------------------------------
            //--------------- Controller Implementation ------------
            //------------------------------------------------------
                
               element.find("#textfield").keydown(function (e) {  
                // prevent leading 0 
                if(this.value == "" && e.keyCode == 48 ) {
                    e.preventDefault();
                    return;
                }
            // Allow: backspace, delete, tab, escape, and enter
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110]) != -1 ||
                 // Allow: Ctrl+A
                (e.keyCode == 65 && e.ctrlKey === true) || 
                 // Allow: home, end, left, right
                (e.keyCode >= 35 && e.keyCode <= 39)) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                e.preventDefault();
            }
                }).keyup(function (e) {
            //console.log("text is entered");
            // var scope = angular.element($("#PrimeFactorID")).scope();
            	$scope.checkKeyValue();
            
            // Return key submits and hids ios keyboard - greg
            if(e.keyCode === 13){
                $scope.unSelectNode();               
                $scope.refreshLayer();
                 element.find("#textfield").blur();
            }
                });


                // **** MY Controller ****///
    var container = element.find("#primefactor_surface");
    container = container[0];
    var clientWidth = 768;
    var clientHeight = 500;
    var layerWidth = clientWidth;
    var layerHeight = clientHeight;

    // kinetic drag handling //
    var somethingIsBeingDraggedInKinetic = false; // used to stop scroller from scrolling on drag
    var touchedView = 0; // tell scroller what was touched by it's ID
    var view = 4; // there is probably a way to get the id directly from the nodes... this is how I did it
    
    //  Render functions
    $scope.render = function(left, top, zoom) {
        
        $scope.layer.setX(left * -1);
        $scope.layer.setY(top * -1);
        
        if(isSelectedNode){
            
            element.find(".primefactor_textField")[0].style.left = ""+(lastSelectedNode.getX() + container.clientLeft + container.offsetLeft + left*-1) - lastSelectedNode.radius - 0.5 +"px";
            element.find(".primefactor_textField")[0].style.top = ""+(lastSelectedNode.getY()  + container.clientTop + container.offsetTop + top*-1) - lastSelectedNode.radius - 0.5 + "px";
            //console.log( container.offsetTop + top*-1) - lastSelectedNode.radius - 0.5 + "px");
        }
        $scope.refreshLayer();
        
    };
    
    // Initialize Scroller
    $scope.scroller = new Scroller($scope.render, {
        zooming: false,
        locking: false
    });
    
    //Setting Root Node 
    $scope.isRootController = false;
    $scope.isRNMenuOpen = false;

    $scope.setup = function() {
        console.log("Setup");
        $scope.isRNMenuOpen = true;
        $scope.isRootController = false;
    };
    $scope.cancel = function() {
        $scope.isRNMenuOpen = false;
        $scope.isRootController = true;
    };

    //Creating Stage and Layers;
    $scope.stage = new Kinetic.Stage({
        container: container,
        x: 0,
        y: 0,
        width: clientWidth,
        height: clientHeight,
        listening: true,
    });
    $scope.layer = new Kinetic.Layer({
        x: 0,
        y: 0,
        width: layerWidth,
        height: layerHeight
    });
        
    $scope.dLayer = new Kinetic.Layer(); // setup drag layer to pass objects back and forth using node.moveto()

    $scope.stage.add($scope.layer, $scope.dLayer ); 
    
    $scope.stage.on('mousedown touchstart', function(evt) {
        //console.log("Stage mousedown/touchstart");
        if (evt.target.attrs.draggable) {
            somethingIsBeingDraggedInKinetic = true;
        }else {
            touchedView = evt.target._id;
            //console.log("touched view: "+touchedView);
        }
        //console.log("draggable = " + evt.target.attrs.draggable);
        
    });
    $scope.stage.on('mouseup touchend', function() {
        //console.log("Stage mouseup/touchend");
        somethingIsBeingDraggedInKinetic = false;

        if ($scope.isPFCalculator()) return;

        //$scope.unSelectNode();
        //arrangingNodes($scope.RootNode);
        //$scope.refreshLayer();
    });
    
    $scope.manageScrolling = function(enabled){
        somethingIsBeingDraggedInKinetic = enabled;
    };
    $scope.refreshLayer = function() {
        //console.log("");
        //console.log("Refreshing Stage's Layer");
        //console.log("");
        $scope.layer.draw();
    }

    // Global Variables
    $scope.RootNode = undefined;
    $scope.nodesHavingError = [];
    $scope.errorText = undefined;
    $scope.errorValue = 1;
    $scope.PFCalculator = undefined;
    $scope.totalText = undefined;
    $scope.instructionText = undefined;
    $scope.endInstructionText = undefined;

    $scope.totalRows = 0;
    var countChildRows = 0;
    var totalPrimes = 0;
    var maxHeight = 180;
    var nonPrimes = 0;
    
    var childrenCount = 0;// greg

    var lastSelectedNode = undefined;
    var isSelectedNode = false;

    // Node Functions
    $scope.addNode = function(text, nodeType, parentNode, x, y, rowNumber, isPrime) {
        var Node = new node($scope.stage, $scope.layer, x, y, 32, text, nodeType, parentNode, rowNumber, isPrime, $scope, element);
        Node.addChildNodes = $scope.addNode;
        Node.destroyChildNodes = $scope.destroyChildNodes;
        Node.selectNode = $scope.selectNode;
        Node.unSelectNode = $scope.unSelectNode;
        Node.nodeDropped = $scope.nodeDropped;
        Node.reArrangeNodes = $scope.reArrangeNodes;
        Node.checkPrimes = $scope.checkPrimes;
        Node.removeErrorNodes = $scope.removeErrorNodes;
        Node.removeExtraPrimeNodes = removeExtraPrimeNodes;
        Node.isPFCalculator = $scope.isPFCalculator;
        Node.refreshLayer = $scope.refreshLayer;
        Node.manageScrolling = $scope.manageScrolling;
        Node.isIOSPlatform = isIOSPlatform;

        if (text != undefined && isPrime == false) Node.addNodeMenu();

        if (nodeType == 0) {
            $scope.RootNode = Node;
            Node.selectNode();
            Node.makeNormalNode();
            //Node.promtText();
            Node.removeNodeMenu();
             
        }
        else if (nodeType == 1) {
            parentNode.setLeftChild(Node);
        }
        else if (nodeType == 2) {
            parentNode.setRightChild(Node);
        }

        //array_Nodes.push(Node);
    };
    // Changing
    $scope.setRootNode = function(value) {
        console.log("Adding Route Node : " + value);

        $scope.isRootController = true;
        $scope.isRNMenuOpen = false;
        $scope.layer.removeChildren();
        //$scope.Draw();
        $scope.background = new Kinetic.Rect({
            x: 0,
            y: 0,
            width: $scope.layer.width(),
            height: $scope.layer.height(),
            fill: '#f6f6f6'
        });
        
        $scope.instructionText = new Kinetic.Text({
            x:($scope.layer.width() / 2),
            y:15,
            text: "Enter a number to factor below.",
            fontSize:16,
            fontFamily: 'bentonSansBook',
           /*  fontStyle:'300', */
            fill: '#a6a6a6'
        });
        
        $scope.instructionText.offsetX($scope.instructionText.width()/2);
        $scope.layer.add($scope.background, $scope.instructionText);
        
        $scope.addNode(value, 0, undefined, ($scope.layer.width() / 2) - 32, 44, 0, false);
        $scope.refreshLayer();
    };

    
    $scope.getRootNode = function() {
        return $scope.RootNode;
    };
    
    $scope.selectNode = function() {
        isSelectedNode = true;
        lastSelectedNode = this;
        $scope.checkKeyValue();
        //$scope.refreshLayer();
    };
    $scope.unSelectNode = function() {
        if (isSelectedNode == true) {
             element.find("#textfield").focusout(function() {
                //console.log("Unfocusing the Textfield");
            });
            isSelectedNode = false;
            
            var txtfield = element.find(".primefactor_textField")[0];
            lastSelectedNode.setText(txtfield.value);
            txtfield.value = "";
            txtfield.style.display = "none";

            //if(lastSelectedNode.getNodeType() != 0)
            //  lastSelectedNode.getParentNode().solveNode();
            if (lastSelectedNode.isPrime == false) {
                if (lastSelectedNode.getText()) lastSelectedNode.addNodeMenu();

                lastSelectedNode.circleBorder.stroke('#b3b3b3');
                lastSelectedNode.circleBorder.strokeWidth(1);
                //$scope.refreshLayer();
            }
            updateNode(lastSelectedNode); //arrangingNodes($scope.RootNode);
        }
    };
    //check the entered value to add or remove nodemenu - greg
    $scope.checkKeyValue = function() {
                    
        var txtfield = element.find(".primefactor_textField")[0];
        
        if( $(txtfield).is(":visible") ){
            //console.log("Key is Pressed");    
                
            if (txtfield.value == "" || txtfield.value == "0"){
                lastSelectedNode.removeNodeMenu();
                if(lastSelectedNode.nodeType==0){
                    $scope.instructionText.text("Enter a number to factor below.");
                    $scope.instructionText.offsetX($scope.instructionText.width()/2);
                }
                
            }else{
                lastSelectedNode.addNodeMenu();
                if(lastSelectedNode.nodeType==0){
                    $scope.instructionText.text("");
                    $scope.instructionText.offsetX($scope.instructionText.width()/2);
                }
            }
            
            $scope.refreshLayer();
        }
        
    }
    $scope.destroyChildNodes = function(Node, isSelf) {
        if (Node == undefined) return;

        $scope.destroyChildNodes(Node.getLeftChild(), false);
        $scope.destroyChildNodes(Node.getRightChild(), false);

        if (isSelf == false) Node.removeSelf();
        else {
            Node.setLeftChild(undefined);
            Node.setRightChild(undefined);
        }
    };
    $scope.nodeDropped = function(Node) {

        if (!Node.cloneObject || !$scope.PFCalculator) return;

        console.log("Droppping Object");
        var container = Node.container;
        var cloneObject = Node.cloneObject;

        var x = $scope.PFCalculator.getX();
        var y = $scope.PFCalculator.getY();
        var width = $scope.PFCalculator.getWidth();
        var height = $scope.PFCalculator.getHeight();

        var containerX = container.getX();
        var containerY = container.getY();

        //console.log("Calculator X & Y : " + x + " " + y + " " + width + " " + height);
        //console.log("Container X & Y : " + containerX + " " + containerY);

        if (containerX >= x && containerX <= x + width && containerY >= y && containerY <= y + height) {
            var groups = $scope.PFCalculator.circleGroups;
            console.log("Dropped inside Calculation : " + groups.length);

            containerX = containerX - x;
            containerY = containerY - y + 45.5;

            for (var j = 0; j < groups.length; j++) {
                if (!groups[j].isFill) {
                    console.log("Not Filled");

                    var subGroup = groups[j].group;

                    var subX = subGroup.x();
                    var subY = subGroup.y();
                    var subWidth = subGroup.width();
                    var subHeight = subGroup.height();

                    console.log("SubGroup X & Y : " + subX + " " + subY + " " + subWidth + " " + subHeight);
                    console.log("Container X & Y : " + containerX + " " + containerY);

                    if (containerX >= subX && containerX <= subX + subWidth && containerY >= subY && containerY <= subY + subHeight) {

                        console.log("Updating Group in PFCalculator");
                        var circle = groups[j].circle;
                        var text = groups[j].text;

                        text.setText(Node.getText());
                        circle.fill('#82bff0');
                        groups[j].isFill = true;

                        Node.makeGhostPrime(1);
                        Node.setIsMoveAble(false);
                        Node.container.draggable(false);
                        Node.isDropped = true;
                        break;
                    }
                    else console.log("Dropped at wrong Position");
                }
                else console.log("It is Filled");
            }
        }

        Node.setPosition(cloneObject.x(), cloneObject.y());

        Node.cloneObject.destroy();
        Node.cloneObject = undefined;

        $scope.refreshLayer();
    };
    $scope.checkPrimes = function() {
        console.log("Checking Primes");

        totalPrimes = 0;
        nonPrimes = 0;

        //$scope.primeNodes = [];
        isPrime($scope.RootNode);

        if (nonPrimes == 0) { 
            element.find(".primefactor_textField")[0].blur();
            $scope.PFCalculator = new primeFactorCalculator($scope.layer, $scope.layer.width(), maxHeight, totalPrimes);
            $scope.PFCalculator.calculation = calculation;
        }
        else if ($scope.PFCalculator != undefined) {
            $scope.PFCalculator.removeSelf();
            if ($scope.totalText) {
                $scope.totalText.remove();
                $scope.totalText = undefined;
            }
            if ($scope.endInstructionText) {
                $scope.endInstructionText.remove();
                $scope.endInstructionText = undefined;
            }

            $scope.PFCalculator = undefined;
        }
    };
    $scope.removeErrorNodes = function() {
        console.log("Removing " + $scope.nodesHavingError.length + " Error Nodes");

        for (var i = 0; i < $scope.nodesHavingError.length; i++) {
            //$scope.nodesHavingError[i].makeGhostPrime(0);
            //$scope.nodesHavingError[i].setIsMoveAble(false);
        }

        if ($scope.errorLine) $scope.errorLine.remove();
        if ($scope.errorText) $scope.errorText.remove();
        if ($scope.nodesHavingError.length > 0) $scope.nodesHavingError = [];
    };
    $scope.isPFCalculator = function() {
        if ($scope.PFCalculator == undefined) return false;
        else return true;
    };
    $scope.totalLayers = function() {
        return $scope.totalRows;
    };  
    function isPrime(Node) {
        if (Node == undefined) return;

        if (Node.getLeftChild() == undefined && Node.getRightChild() == undefined && Node.isPrime == true) {
            totalPrimes++
        }
        else if (Node.getLeftChild() == undefined && Node.getRightChild() == undefined && Node.isPrime == false) {
            nonPrimes++;
        }

        isPrime(Node.getLeftChild()); 
        isPrime(Node.getRightChild());
    };
    function calculation(total) {
        console.log("Performing Calculations");
        if ($scope.totalText) {
            $scope.totalText.remove();
            $scope.totalText = undefined;
        }
        if ($scope.endInstructionText) {
            $scope.endInstructionText.remove();
            $scope.endInstructionText = undefined;
        }

        var x = $scope.PFCalculator.getX();
        var y = $scope.PFCalculator.getY();
        var width = $scope.PFCalculator.getWidth();
        var height = $scope.PFCalculator.getHeight();

        $scope.totalText = new Kinetic.Text({
            x: (x + width) - 56,
            y: y - 30,
            width: 80,
            height: 30,
            text: total,
            fontSize: 30,
            align: 'center',
            fontFamily: 'bentonSansBook',
           /*  fontStyle:'300', */
            fill: '#363338'
        });
        $scope.totalText.offsetX($scope.totalText.width()/2);
        
        $scope.endInstructionText = new Kinetic.Text({
            x: (x + width) - (width/ 2),
            y: y + height + 15,
            text: "You can factor a new number at the top",
            fontSize:16,
            fontFamily: 'bentonSansBook',
            /* fontStyle:'300', */
            fill: '#a6a6a6'
        });
        $scope.endInstructionText.offsetX($scope.endInstructionText.width()/2);
        
        $scope.layer.add($scope.totalText, $scope.endInstructionText);
        if (total != parseInt($scope.RootNode.getText())) {
            $scope.totalText.fill('red');
            $scope.endInstructionText.fill('red');
            $scope.endInstructionText.text('Correct errors highlighted in red')
            findErrorInNodes();
        }
        $scope.refreshLayer();
    };
    function findErrorInNodes() {
        console.log("Find Error In Total Rows : " + $scope.totalRows);

        for (var i = 0; i <= $scope.totalRows; i++) {

            $scope.nodesHavingError = [];
            $scope.errorValue = 1;

            errorInRow(i, $scope.RootNode);

            console.log("Error Value : " + $scope.errorValue);

            if ($scope.errorValue != parseInt($scope.RootNode.getText())) {
                console.log("Error is in row " + i);
                updateRowWithErrorWarning($scope.errorValue);
                break;
            }
        }
    };
    function errorInRow(row, Node) {
        if (Node == undefined) return;

        if (Node.getRowNumber() == row) {
            $scope.nodesHavingError.push(Node);
            $scope.errorValue *= parseInt(Node.getText());
        }
        else if (Node.getRowNumber() > row) return;
        else {
            errorInRow(row, Node.getLeftChild());
            errorInRow(row, Node.getRightChild());
        }
    };
    function updateRowWithErrorWarning(errorTotal) {
        if ($scope.nodesHavingError.length > 0) {

            console.log("Update Row With Error Warning");

            var xAxis = $scope.nodesHavingError[0].getX();
            var yAxis = $scope.nodesHavingError[0].getY();

            $scope.errorLine = new Kinetic.Line({
                points: [xAxis, yAxis, xAxis + 50, yAxis],
                stroke: 'red',
                strokeWidth: 1
            });
            $scope.layer.add($scope.errorLine);

            $scope.nodesHavingError[0].circleBorder.stroke('red');
            $scope.nodesHavingError[0].circleBorder.strokeWidth(2);
            $scope.nodesHavingError[0].circleBorder.dashEnabled(false);
            $scope.nodesHavingError[0].moveToFront();

            for (var i = 1; i < $scope.nodesHavingError.length; i++) {
                xAxis = $scope.nodesHavingError[i].getX();
                $scope.errorLine.points($scope.errorLine.points().concat([xAxis, yAxis]));

                $scope.nodesHavingError[i].circleBorder.stroke('red');
                $scope.nodesHavingError[i].circleBorder.strokeWidth(2);
                $scope.nodesHavingError[i].circleBorder.dashEnabled(false);
                $scope.nodesHavingError[i].moveToFront();
            }

            $scope.errorLine.points($scope.errorLine.points().concat([xAxis + 50, yAxis]));
            $scope.errorText = new Kinetic.Text({
                x: xAxis + 50,
                y: yAxis - 15,
                width: 80,
                height: 30,
                text: errorTotal,
                fontSize: 30,
                align: 'left',
                fontFamily: 'bentonSansBook',
                /* fontStyle:'300', */
                fill: 'red'
            });

            $scope.layer.add($scope.errorText);
        }
    }

    $scope.reArrangeNodes = function() {
        $scope.totalRows = 0;
        getNumberofLayers($scope.RootNode);
        console.log("Total Rows : " + $scope.totalRows);
        
        //var totalItems = powerOf($scope.totalRows);
        //var width = (64*totalItems)+(20*totalItems);
        
        childrenCount = 0;
        countChildren($scope.RootNode.getRightChild());
        var rightChildrenCount = childrenCount;
        
        childrenCount = 0;
        countChildren($scope.RootNode.getLeftChild());
        var leftChildrenCount = childrenCount;
        
        var lWidth = (leftChildrenCount * 112); //(66 + 8));
        var rWidth = (rightChildrenCount * 112);//(66 + 8));
        var extraPadding = 112*2;
        
        var height = maxHeight + 500;
        
        var width = lWidth + rWidth + extraPadding;
        
        var oldWidth = layerWidth;
        var offset = 0;
        
        if(width > clientWidth){
            layerWidth = width;
            offset = layerWidth - oldWidth;
        } 
        else  layerWidth = clientWidth;
        
        if(height > clientHeight) layerHeight = height;
        else layerHeight = clientHeight + 300;
        
        $scope.layer.setWidth(layerWidth);
        $scope.layer.setHeight(layerHeight);
        $scope.background.setWidth(layerWidth);
        $scope.background.setHeight(layerHeight);
        
        $scope.RootNode.setPosition(((layerWidth/2)-32), 44);
        //set scroller to the new dimentiosn, then offset it so the screen doesn't jerk
        $scope.scroller.setDimensions(clientWidth, clientHeight, layerWidth, layerHeight);
        $scope.scroller.scrollBy(offset/2, 0, false);
        
        $scope.refreshLayer();

        console.log("lwidth: "+lWidth+", rwidth: "+rWidth +" and Total Height : " + layerHeight);
        console.log("Regenerating Primes");
        regeneratePrimes($scope.RootNode);
        console.log("Remove Extra Primes");
        removeExtraPrimeNodes($scope.RootNode);
        console.log("Arranging Nodes");
        arrangingNodes($scope.RootNode);
    };
    function regeneratePrimes(Node) {
        if (Node == undefined) return;

        if ($scope.totalRows > Node.getRowNumber() && Node.isPrime == true) {
            if (Node.getLeftChild() == undefined && Node.getRightChild() == undefined) {
                var childNodeType = 1;
                $scope.addNode(Node.getText(), childNodeType, Node, Node.getX(), Node.getY(), (Node.getRowNumber() + 1), true);
            }
        }
        
        regeneratePrimes(Node.getLeftChild());
        regeneratePrimes(Node.getRightChild());
    };
    function removeExtraPrimeNodes(Node) {
        if (Node == undefined) return;

        removeExtraPrimeNodes(Node.getLeftChild());
        removeExtraPrimeNodes(Node.getRightChild());

        if ($scope.totalRows < Node.getRowNumber() && Node.isPrime == true) {
            if (Node.getParentNode().isPrime == true) {
                Node.removeSelf();
            }
        }
        else if ($scope.totalRows == Node.getRowNumber() && Node.isPrime == true) {
            Node.setLeftChild(undefined);
            Node.setRightChild(undefined);
        }
    };
    function arrangingNodes(Node) {
        if (Node == undefined) return;

        if (Node.getRowNumber() != 0) {
            //var p = "";
            //if(Node.isPrime) p += " prime";
            //if(Node.getLeftChild() != undefined && Node.isPrime == true) p += "-ghost";
            //if(!Node.isPrime && Node.getLeftChild() != undefined ) p += " composite";
            //if(!Node.isPrime && Node.getLeftChild() == undefined ) p += " empty";
        
            //console.log("row:" + Node.getRowNumber() + ", type: " + Node.getNodeType() + p );
                        
            var width = 66;
            var xPadding = 4;
            
            var height = 80;
            
            var parentX = Node.getParentNode().getX();
            var parentY = Node.getParentNode().getY();

            var xAxis = 0;
            var yAxis = parentY + height;
            
            if (Node.getNodeType() == 1) {
                if( !Node.isPrime && Node.getLeftChild() != undefined ){
                    childrenCount = 0;
                    countChildren(Node.getRightChild());
                    xAxis = parentX - ( childrenCount * (width + (xPadding*2) ) );
                }else{
                    xAxis = parentX - ( (width/2) + xPadding );
                }
            }
            else if (Node.getNodeType() == 2) {
                if( !Node.isPrime && Node.getLeftChild() != undefined ){
                    childrenCount = 0;
                    countChildren(Node.getLeftChild());
                    xAxis = parentX + ( childrenCount * (width + (xPadding*2) ) );
                }else{
                    xAxis = parentX + ( (width/2) + xPadding );
                }
            }
            Node.changePosition(xAxis, yAxis, parentX, parentY);
        }

        updateNode(Node);
        arrangingNodes(Node.getLeftChild());
        arrangingNodes(Node.getRightChild());
    };
    function updateNode(Node) {
        if (Node.getRowNumber() == 0) {
            if (Node.isPrime == true) {
                Node.makeGhostPrime(0);
                Node.setIsMoveAble(true);
            }
            else {
                Node.makeNormalNode();
                Node.setIsMoveAble(false);
            }
        }
        else {
            if (Node.isPrime == true) {
                if (Node.getLeftChild() == undefined && Node.getRightChild() == undefined) {
                    Node.makeGhostPrime(0);
                    if ($scope.PFCalculator) Node.setIsMoveAble(!Node.isDropped);
                    else {
                        Node.isDropped = false;
                        Node.setIsMoveAble(true);
                    }
                }
                else {
                    Node.makeGhostPrime(1);
                    Node.setIsMoveAble(false);
                }
            }
            else {
                Node.makeNormalNode();
                Node.setIsMoveAble(false);
            }

            if (!Node.getParentNode().isPrime) Node.getParentNode().solveNode();

            Node.moveToFront();
        }
    };
    function countChildren(Node) { //greg
        if (Node == undefined) return;
        
        if (Node.getLeftChild() == undefined ){
            childrenCount ++;
        }
        countChildren(Node.getRightChild());
        countChildren(Node.getLeftChild());
    }
    function getNumberofLayers(Node) {
        if (Node == undefined) return;

        if (!Node.isPrime) {
            getNumberofLayers(Node.getLeftChild());
            getNumberofLayers(Node.getRightChild());
        }
        if (Node.getRowNumber() > $scope.totalRows) {
            $scope.totalRows = Node.getRowNumber();
            maxHeight = Node.getY() + 100;
        }       
    }
    function powerOf(x) {
        var value = 1;
        for (var i = 0; i < x; i++) {
            value *= 2;
        }
        return value;
    };
    
    function detectBrowser(){
        var N= navigator.appName;
        var UA= navigator.userAgent;
        var temp;
        var browserVersion= UA.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
        
        if(browserVersion && (temp= UA.match(/version\/([\.\d]+)/i))!= null)
            browserVersion[2]= temp[1];
        
        browserVersion = browserVersion ? [browserVersion[1], browserVersion[2]]: [N, navigator.appVersion,'-?'];
        
        return browserVersion;
    };
    function isIOSPlatform(){
        var i = 0,
        iOS = false,
        iDevice = ['iPad', 'iPhone', 'iPod'];

        for ( ; i < iDevice.length ; i++ ) {
            if( navigator.platform === iDevice[i] ){
                iOS = true;
                break; 
            }
        }
        
        return iOS;
    };
    

    $scope.setRootNode('');
    
    var rect = container.getBoundingClientRect();
    $scope.scroller.setPosition(rect.left + container.clientLeft, rect.top + container.clientTop);
  

    // Scroller Touch events
    if ('ontouchstart' in window) {
        container.addEventListener("touchstart", function(e) {
            // Don't react if initial down happens on a form element
            console.log("Event Name : " + e.touches[0].target.tagName);
            if (e.touches[0] && e.touches[0].target && e.touches[0].target.tagName.match(/input|textarea|select/i)) {
                return;
            }
            //console.log("somethingIsBeingDraggedInKinetic : " + somethingIsBeingDraggedInKinetic);
            // Don't react if initial down happens on a draggable element
            if (somethingIsBeingDraggedInKinetic) {
                return;
            }
            // determin which view to scroll based on the id of the touched view
            if (touchedView == view) {
                $scope.scroller.doTouchStart(e.touches, e.timeStamp);
            }
            
            e.preventDefault();

        }, false);
        container.addEventListener("touchmove", function(e) {
            if (touchedView == view) {
                $scope.scroller.doTouchMove(e.touches, e.timeStamp, e.scale);
            }
        }, false);
        container.addEventListener("touchend", function(e) {
            if (touchedView == view) {  
                $scope.scroller.doTouchEnd(e.timeStamp);
            }
        }, false);
        container.addEventListener("touchcancel", function(e) {
            if (touchedView == view) {
                $scope.scroller.doTouchEnd(e.timeStamp);
            }

        }, false);

    } else {
        // Scroller Mouse events
        var mousedown = false;
        container.addEventListener("mousedown", function(e) {
            //console.log("Event Name : " + e.target.tagName);
            
            if (e.target.tagName.match(/input|textarea|select/i)) {
                return;
            }
            //console.log("somethingIsBeingDraggedInKinetic : " + somethingIsBeingDraggedInKinetic);
            if (somethingIsBeingDraggedInKinetic) {
                return;
            }

            if (touchedView == view) {
                $scope.scroller.doTouchStart([{
                    pageX: e.pageX,
                    pageY: e.pageY}], e.timeStamp);
            }
            mousedown = true;
        }, false);
        container.addEventListener("mousemove", function(e) {
            if (!mousedown) {
                return;
            }
            if (touchedView == view) {
                $scope.scroller.doTouchMove([{
                    pageX: e.pageX,
                    pageY: e.pageY}], e.timeStamp);
            }
            mousedown = true;
        }, false);
        container.addEventListener("mouseup", function(e) {
            if (!mousedown) {
                return;
            }
            if (touchedView == view) {
                $scope.scroller.doTouchEnd(e.timeStamp);
            }
            mousedown = false;
        }, false);
    }

/// **** End of Controller

            },//link
            restrict: 'E',
            template: '<div id="PrimeFactorID" ><div>' +
                      '<input type="number" min="1" inputmode="numeric" autocomplete="off" name="textfield" id="textfield" class="primefactor_textField" ng-show="isRootController">' +
                      '<div id="primefactor_surface" ng-show="isRootController"  style="width:768px; height:500px; "></div></div></div>',
    
            controller: 'myAppController'

        };//return
    })
    .controller('myAppController', function($scope, toolPersistorService,
        dataExchangeService) {

        // **** API Integretion Code ***///

            var serializeFn = function() {
                return $scope.textState;
            };

            var deserializeFn = function(data) {
                $scope.textState = data;
            };
        
        toolPersistorService.registerTool($scope.toolId, template.type,
        $scope.containerApi, serializeFn, deserializeFn);
        
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

        dataExchangeService.registerTool($scope.toolId, template.type, exportFn,
        importFn, $scope.containerApi, template.exportTargets);

    
});//end of controller

})();// MainFunction