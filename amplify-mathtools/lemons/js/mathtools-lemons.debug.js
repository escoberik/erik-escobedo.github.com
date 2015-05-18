(function () {
    'use strict';

    if (!window.mt) {
        window.mt = {};
    }

    if (!window.mt.lemons) {
        window.mt.lemons = {};
    }

    angular.module('mtLemons', ['mt.common', 'ui.bootstrap'])

        .config(function (toolRegistryServiceProvider) {
            var template = {
                id: 'lemonsToolbarItem',
                type: mt.common.TYPE_LEMONS,
                displayName: 'Lemons and Cups',
                available: true,
                htmlTemplate: '<mt-lemons-tool tool-id="toolId" container-api="containerApi" id="tool-{{toolId}}"></mt-lemons-tool>',
                applet: true
            };
            toolRegistryServiceProvider.addTemplate(template);
        });

    window.mt.loadModules.push('mtLemons');
})();

(function (ns) {
    'use strict';

    ns.FlMoveableObject = (function() {
        function FlMoveableObject(APP, ctx, type, imagePath, x, y, width, height, onDidPrerender) {
            if (!(this instanceof FlMoveableObject)) {
                return new FlMoveableObject(APP, ctx, type, imagePath, x, y, width, height, onDidPrerender);
            }
            this.ctx = ctx;
            this.type = type;
            this.marginOffset = 16;
            this.x = Math.floor(x);
            this.y = Math.floor(y);

            // Making the radius a bit smaller than the actual picture.
            this.r = width / 2;

            this.width = width;
            this.height = height;
            this.speed = {x: 0, y: 0};
            this.remove = false;
            this.ready = false;
            this.moveToCenter = false;
            this.moveable = true;
            this.isInterfaceElement = false;
            this.placed = false;
            this.isFollowing = false;
            this.transperent = false;
            this.imagePath = imagePath;

            this.group = null;
            this.groupPos = '';
            this.groupId = 0;
            this.coSelectedElements = null;
            this.APP = APP;

            this.onDidPrerender = onDidPrerender;

            var self = this;
            self.selectedState = new Image();
            self.moveState = new Image();
            self.placedState = new Image();

            self.image = new Image();
            this.setupImage();
            self.image.src = 'lemons/img/' + this.imagePath;

            this.lassoResolution = 18;

            this.isInLassoSelection = false;
            this.originalX = this.x;
            this.originalY = this.y;
            this.isTemporaryPosition = false;
            this.orderedByDragging = false;
            this.justStartedDragging = false;
            this.wasFirstDrag = false;
            this.dragging = false;
            this.centerWhenDragging = false;
            this.relativeX = 0;
            this.relativeY = 0;

            this.animateTo = false;
            this.animateToPointHandle = null;
            this.animateToX = 0;
            this.animateToY = 0;
            this.didAnimate = false;
            this.animateToDelegate = null;

            this.fadeIn = false;
            this.fadeInTime = 0;
            this.fadeInPerTick = 1;
            this.fadeInValue = 1;
            this.fadeInHandle = null;
            this.fadeInDelegate = null;

        }

        FlMoveableObject.prototype.setupImage = function() {
            var self = this;
            this.image.onload = function() {
                self.ready = true;
                var scaleFactor = 1.15;
                
                self.selectedState = ns.FlDraw.renderToCanvas(self.width,self.height, self.marginOffset, function(ctx, caller)
                {
                    ctx.save();

                    var tintImg = ns.FlDraw.generateMatte( self.image, scaleFactor, 'rgb(103,180,232)');
                    var offset = ((caller.width * 1.15 - caller.width) / 2);

                    ctx.shadowColor = 'rgba(0,0,0,.2)';
                    ctx.shadowBlur = 12;
                    ctx.shadowOffsetX = 4;
                    ctx.shadowOffsetY = 4;

                    ctx.drawImage( tintImg, -offset, -offset, caller.width * scaleFactor, caller.height * scaleFactor);
                    ctx.restore();
                    
                }, self);
                
                self.placedState = ns.FlDraw.renderToCanvas(self.width,self.height, self.marginOffset, function(ctx, caller)
                {
                    ctx.save();
                    ctx.shadowColor = 'rgba(0,0,0,.2)';
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 2;
                    ctx.shadowOffsetY = 2;

                    ctx.drawImage( self.image, 0, 0 , caller.width, caller.height);
                    ctx.restore();
                    
                }, self);
                
                self.moveState = ns.FlDraw.renderToCanvas(self.width,self.height, self.marginOffset, function(ctx, caller)
                {
                    ctx.save();
                    ctx.shadowColor = 'rgba(0,0,0,.2)';
                    ctx.shadowBlur = 12;
                    ctx.shadowOffsetX = 6;
                    ctx.shadowOffsetY = 6;
                    
                    ctx.drawImage( self.image, 0, 0, caller.width, caller.height);
                    ctx.restore();

                }, self);

                if(self.onDidPrerender !== null && self.onDidPrerender !== undefined) {
                    self.onDidPrerender();
                    self.onDidPrerender = null;
                }

            };
        };

        FlMoveableObject.prototype.onEnter = function() {};
        FlMoveableObject.prototype.onLeave = function() {};
        FlMoveableObject.prototype.update = function() {

            if(!this.isInterfaceElement && this.remove) {
                if(this.placed) {
                    if((this.type.indexOf(ns.CONFIG.elementOneName) > -1)) {
                        this.APP.elementOneCount--;
                    } else { 
                        this.APP.elementTwoCount--;
                    }

                    if(this.APP.elementOneCount <= 0 || this.APP.elementTwoCount <= 0) {
                        this.APP.testRecipeButton.enabled = false;
                    }

                }

                if(this.group !== null && this.group !== undefined) {
                    this.group.splice(this.group.indexOf(this), 1);

                    if(this.group.length === 0) {
                        this.APP.removeDialog();
                    }
                }

                if(this.APP.currentSelection !== null && this.APP.currentSelection !== undefined ) {
                    this.APP.currentSelection.splice(this.APP.currentSelection.indexOf(this), 1);

                    if(this.APP.currentSelection.length === 0)
                    {
                        this.APP.removeDialog();
                    }
                }

                this.APP.removeMoveableObject(this);
                return false;
            }

            return true;
        };


        FlMoveableObject.prototype.onStartDrag = function()
        {
            this.originalX = this.x;
            this.originalY = this.y;
            this.goTemporaryLocation();
            this.justStartedDragging = true;
            this.wasFirstDrag = true;
            this.dragging = true;

            if(!this.isInterfaceElement && this.APP.currentSelection.indexOf(this) === -1)
            {
                this.APP.clearSelection();
            }
        };

        FlMoveableObject.prototype.onEndDrag = function()
        {
            // This is here to reverse the effect of setOrderedByDragging()
            this.r = this.width / 2;
            this.orderedByDragging = false;
            this.justStartedDragging = false;
            this.dragging = false;
            this.relativeX = 0;
            this.relativeY = 0;
            
            if(this.centerWhenDragging)
            {
                if(!this.animateTo)
                {
                    this.x -= this.width / 2;
                    this.y -= this.height / 2;
                }

                this.centerWhenDragging = false; 
            }

            if(!this.isTemporaryPosition)
            {
                this.x = this.originalX;
                this.y = this.originalY;
            }
            else
            {
                this.originalX = this.x;
                this.originalY = this.y;
            }
        };

        FlMoveableObject.prototype.setOrderedByDragging = function() {
            // This effectively double the radius and makes this grouping stay together unless you really move it away
            this.r = this.width / 2;
            this.orderedByDragging = true;
        };

        FlMoveableObject.prototype.goTemporaryLocation = function() {
            if(!this.isTemporaryPosition)
            {
                this.isTemporaryPosition = true;
            }
        };

        FlMoveableObject.prototype.goRealLocation = function() {
            if(this.isTemporaryPosition)
            {
                this.isTemporaryPosition = false;
            }
        };

        FlMoveableObject.prototype.render = function() {
            if(this.ready) {
                
                if(this.group !== null && this.group !== undefined) {
                    ns.FlDraw.rect(this.ctx, this.x, this.y, this.width, this.height, 'rgba(255, 255, 255, .6)');
                }
                if(this.coSelectedElements !== null || this.isInLassoSelection) {
                    if((this.transperent = this.isFollowing || this.moving)) {
                        this.ctx.globalAlpha = 0.5;
                    }

                    this.ctx.drawImage( this.selectedState, this.x - this.marginOffset, this.y  - this.marginOffset);                   
                }

                if((this.transperent = this.isFollowing || this.moving)) {
                    this.ctx.globalAlpha = 0.5;
                    this.ctx.drawImage( this.moveState, this.x  - this.marginOffset, this.y  - this.marginOffset);
                } else {
                    if(this.fadeIn) {
                        this.ctx.globalAlpha = this.fadeInValue;
                    }
                    this.ctx.drawImage( this.placedState, this.x - this.marginOffset, this.y  - this.marginOffset);
                }

                if(this.ctx.globalAlpha !== 1) {
                    this.ctx.globalAlpha = 1;
                }
            }
        };
    
        FlMoveableObject.prototype.create = function(scale) {
            var type = this.type + '_obj';
            var width = this.width * scale;
            var height = this.height * scale;

            var copy = new FlMoveableObject(this.APP, this.ctx, type, this.imagePath, this.x, this.y, width, height);
            copy.setPosition(this.x, this.y);
            return copy;
        };

        FlMoveableObject.prototype.clone = function(x, y) {
            x = (x === undefined ? this.x : x);
            y = (y === undefined ? this.y : y);

            var clone = new FlMoveableObject(this.APP, this.ctx, this.type, this.imagePath, x, y, this.width, this.height);
            clone.setPosition(x, y);
            clone.isInterfaceElement = this.isInterfaceElement;

            return clone;
        };

        FlMoveableObject.prototype.collides = function(currentInputState) {
            return ns.collidesCircle(this.APP, {x: this.x + this.width / 2, y: this.y + this.height / 2, r: this.r}, currentInputState);
        };

        // Returns true if the event was handeled
        FlMoveableObject.prototype.handleEvent = function(currentInputState) {
            if(this.collides(currentInputState)) {
                this.onEvent(currentInputState);
                return true; 
            }
            return false;
        };

        FlMoveableObject.prototype.onEvent = function(currentInputState) {
            var x = currentInputState.x;
            var y = currentInputState.y;
            if(!this.isInterfaceElement && this.placed && this.APP.Input.click) {
                if(this.coSelectedElements !== null && this.APP.currentDialog === null) {
                    //this.APP.currentSelection = this.group;
                    this.APP.swapDialog(new ns.FlGroupDialog(this.APP, this.ctx, this.APP.currentSelection));
                    this.APP.Input.click = false;
                    return true;
                } else if(this.coSelectedElements !== null) {
                    this.APP.removeDialog();
                    this.APP.Input.click = false;
                    return true;
                } else if(this.group !== null && this.APP.currentDialog === null) {
                    this.APP.clearSelection();
                    this.APP.currentSelection = this.group;
                    this.APP.swapDialog(new ns.FlGroupDialog(this.APP, this.ctx, this.APP.currentSelection));
                    this.APP.Input.click = false;
                    return true;
                } else if(this.group !== null) {
                    this.APP.removeDialog();
                    this.APP.Input.click = false;
                    return true;
                } else if(this.APP.currentSelection !== null && this.APP.currentSelection.length === 1 && this.APP.currentSelection[0] === this) {
                    this.APP.removeDialog();
                    this.APP.clearSelection();
                    this.APP.Input.click = false;
                    return true;
                } else {
                    this.APP.removeDialog();
                    this.APP.clearSelection();
                    this.APP.currentSelection = [];
                    this.APP.currentSelection.push(this);
                    this.APP.swapDialog(new ns.FlGroupDialog(this.APP, this.ctx, this.APP.currentSelection));
                    this.APP.Input.click = false;
                    return true;
                }
            }
            if(!this.isFollowing) {
                this.APP.movingEntity = this;

                var relativeX = x - this.x;
                var relativeY = y - this.y;

                if(this.coSelectedElements === null && this.group === null && !this.placed) {
                    for(var j = 0; j < this.APP.moveableObjects.length; j++) {
                        var relatedEntity = this.APP.moveableObjects[j];

                        if(this.type === relatedEntity.type && !relatedEntity.placed) {
                            relatedEntity.setPosition(relatedEntity.x + relativeX, relatedEntity.y + relativeY);

                            if(this !== relatedEntity) {
                                relatedEntity.isFollowing = true;
                            }
                        }
                    }
                } else {
                    var app = this.APP;
                    this.invokeOnThisOrFollowersOneByOne(function(currentEntity, followers) {
                        currentEntity.setPosition(currentEntity.x + relativeX, currentEntity.y + relativeY);
                        if(app.movingEntity !== currentEntity) {
                            currentEntity.isFollowing = true;
                        }

                    });
                }
                return true;
            }
            return false;
        };

        FlMoveableObject.prototype.setPosition = function(x, y) {
            if (this.moveable) {
                if (this.justStartedDragging && !this.animateTo) {
                    var orgDeltaX = this.originalX - this.x;
                    var orgDeltaY = this.originalY - this.y;

                    // If distance from original location is over 50 trigger some events 
                    if (Math.abs(ns.distance(orgDeltaX, orgDeltaY)) > 2) {
                        //this.centerWhenDragging = true;
                        this.justStartedDragging = false;
                        this.APP.removeDialog();
                    }
                }

                if (this.wasFirstDrag) {
                    this.relativeX = this.x - x;
                    this.relativeY = this.y - y;
                    this.wasFirstDrag = false;
                }
                
                if (this.centerWhenDragging || this.animateTo) {
                    this.x = x;
                    this.y = y;
                } else {
                    this.x = x + this.relativeX;
                    this.y = y + this.relativeY;
                }
            }
        };

        // Swaps places of 2 objects
        FlMoveableObject.prototype.swapPlaces = function(moveableObject) {
            if (moveableObject !== null && moveableObject !== undefined && moveableObject !== this) {
                var myX = this.x, myY = this.y;
                this.x = moveableObject.x;
                this.y = moveableObject.y;
                moveableObject.x = myX;
                moveableObject.y = myY;
            }
        };

        FlMoveableObject.prototype.animateToPoint = function(x, y, delegate) {
            this.x = Math.ceil(this.x);
            this.y = Math.ceil(this.y);

            if (!this.animateTo) {
                this.animateToX = Math.floor(x);
                this.animateToY = Math.floor(y);
                this.animateTo = true;
                this.animateToDelegate = delegate;
                this.animateToPointHandle = window.setInterval(this.animateToPointTick, 32, this);
            }
        };

        FlMoveableObject.prototype.setFadeInTime = function(fadeInTime, delegate) {
            if (!this.fadeIn) {
                this.fadeInTime = fadeInTime;
                this.fadeIn = true;
                this.fadeInPerTick = 1 / (fadeInTime / 32);
                this.fadeInValue = 0;
                this.fadeInDelegate = delegate;
                this.fadeInHandle = window.setInterval(ns.fadeInTick, 32, this);
            }
        };

        FlMoveableObject.prototype.invokeOnThisOrFollowersOneByOne = function(delegate) {
            var j;
            if(this.coSelectedElements !== null) {
                var coSelectedElements = this.coSelectedElements;

                for(j = 0; j < coSelectedElements.length; j++) {
                    delegate(coSelectedElements[j], coSelectedElements);
                }
            } else if(this.group !== null) {
                var group = this.group;

                for(j = 0; j < group.length; j++) {
                   delegate(group[j], group);
                }
            } else {
                delegate(this, [this]);
            }
        };

        FlMoveableObject.prototype.invokeOnThisOrFollowers = function(delegate) {
            if(this.coSelectedElements !== null) { 
                delegate(this.coSelectedElements);
            } else if(this.group !== null) {
                delegate(this.group);
            } else {
                delegate([this]);
            }
        };

        FlMoveableObject.prototype.clearRelationships = function() {
            var index;
            if(this.group !== null) {
                index = this.group.indexOf(this);
                this.group.splice(index, 1);
                this.group = null;
            }
            if(this.coSelectedElements !== null) {
                index = this.coSelectedElements.indexOf(this);
                this.coSelectedElements.splice(index, 1);
                this.coSelectedElements = null;
            }
        };

        FlMoveableObject.prototype.animateToPointTick = function(objectToAnimate) {
            var dX = objectToAnimate.animateToX - objectToAnimate.x;
            var dY = objectToAnimate.animateToY - objectToAnimate.y;

            if (Math.abs(dX) < 10 && Math.abs(dY) < 10) {
                objectToAnimate.x = objectToAnimate.animateToX;
                objectToAnimate.y = objectToAnimate.animateToY;
                dX = 0;
                dY = 0;

                if(objectToAnimate.animateToDelegate !== null) {
                    objectToAnimate.animateToDelegate(objectToAnimate);
                    objectToAnimate.animateToDelegate = null;
                }

                window.clearInterval(objectToAnimate.animateToPointHandle);

                objectToAnimate.didAnimate = true;
                objectToAnimate.animateTo = false;
                objectToAnimate.animateToPointHandle = null;
            } else {
                objectToAnimate.speed.x = dX === 0 ? 0 : dX / 25;
                objectToAnimate.speed.y = dY === 0 ? 0 : dY / 25;

                objectToAnimate.speed.x = objectToAnimate.speed.x > 0 ? Math.ceil(objectToAnimate.speed.x) : Math.floor(objectToAnimate.speed.x);
                objectToAnimate.speed.y = objectToAnimate.speed.y > 0 ? Math.ceil(objectToAnimate.speed.y) : Math.floor(objectToAnimate.speed.y);

                objectToAnimate.x = objectToAnimate.x + objectToAnimate.speed.x; 
                objectToAnimate.y = objectToAnimate.y + objectToAnimate.speed.y;
            }
        };

        FlMoveableObject.prototype.serialize = function() {
            var data = {
                posX: this.x,
                posY: this.y,
                type: this.type,
                path: this.imagePath,
                width: this.width,
                height: this.height,
                groupNum: this.groupNum,
                placed: this.placed         //required to prevent rendering bug on reload
            };

            return data;
        };

        FlMoveableObject.prototype.deserialize = function(data) {
            this.x = data.posX;
            this.y = data.posY;
            this.type = data.type;
            this.imagePath = data.path;
            this.width = data.width;
            this.height = data.height;
            this.groupNum = data.groupNum;
            this.placed = data.placed;
        };




        // Returns the elements of this new possible grouping
        FlMoveableObject.prototype.determineGroupingCollision = function(entity) {
            var movingEntities;

            if(entity.coSelectedElements !== null) {
                movingEntities = entity.coSelectedElements;
            } else if(entity.group !== null) {
                movingEntities = entity.group;
            } else {
                movingEntities = [];
                movingEntities.push(entity);
            }

            // If the objects is left ontop of another object group them 
            var collideAbleObject = null;
            var currentMovingEntity = null;

            for (var i = 0; i < this.APP.moveableObjects.length; i++) {
                collideAbleObject = this.APP.moveableObjects[i];

                if(!collideAbleObject.moving && !collideAbleObject.isFollowing) {
                    for(var j = 0; j < movingEntities.length; j++) {
                        currentMovingEntity = movingEntities[j];

                        if(collideAbleObject !== currentMovingEntity && ns.collidesCircle(this.APP, currentMovingEntity, collideAbleObject)) {
                            var newMembers = [];

                            if(collideAbleObject.group !== null) {
                               newMembers = newMembers.concat(collideAbleObject.group);
                            } else {
                               newMembers.push(collideAbleObject);
                            }

                            if(currentMovingEntity.coSelectedElements !== null) {
                                newMembers = newMembers.concat(currentMovingEntity.coSelectedElements);
                                ns.move(newMembers, newMembers.indexOf(currentMovingEntity), newMembers.length-1);
                            } else if(currentMovingEntity.group !== null) {
                                newMembers = newMembers.concat(currentMovingEntity.group);
                                ns.move(newMembers, newMembers.indexOf(currentMovingEntity), newMembers.length-1);
                            } else {
                                newMembers.push(currentMovingEntity);
                            }

                            if(newMembers.length > 0 && !ns.isSameGroup(newMembers)) {
                                return newMembers;
                            }
                        }
                    }
                }
            }

           return null;
        };

        return FlMoveableObject;
    })();
})(window.mt.lemons);

(function (ns) {
    'use strict';

    ns.FlButton = (function() {
        function FlButton(APP, ctx, x, y, width, height, text1, text2, textsize, textcolor, onClickEvent, bold, font, hasOutline) {
            if (!(this instanceof FlButton)) {
                return new FlButton(APP, ctx, x, y, width, height, text1, text2, textsize, textcolor, onClickEvent, bold, font, hasOutline);
            }
            this.ctx = ctx;
            this.type = 'button';
            this.x = Math.floor(x);
            this.y = Math.floor(y);
            this.width = width;
            this.height = height;
            this.r = 50;
            this.text1 = text1;
            this.text2 = text2;
            this.textcolor = textcolor;
            this.remove = false;
            this.typeString = '';
            this.onClickEvent = onClickEvent;
            this.enabled = true;
            this.visible = true;
            this.isDown = false;
            this.APP = APP;

            if(bold) {
                this.typeString = 'bold ';
            }
            if(font === undefined ) {
                this.typeString += textsize + 'px HelveticaNeue';
            } else {
                this.typeString += textsize + 'px ' + font;
            }
            this.hasOutline = (hasOutline !== undefined) ? hasOutline : false;
        }
        FlButton.prototype.onEnter = function() {};
        FlButton.prototype.onLeave = function() {};
        FlButton.prototype.update = function() {};

        FlButton.prototype.collides = function(currentInputState){ return ns.collidesRect(this.APP, this, currentInputState); };

        // Returns true if the event was handeled
        FlButton.prototype.handleEvent = function(currentInputState) {
            if(this.collides(currentInputState)) {
                this.onEvent(currentInputState);
                return true;
            }
            if(this.isDown === true) {
                this.isDown = false;
            }
            return false;
        };

        FlButton.prototype.onEvent = function(currentInputState) {
            if(this.enabled && currentInputState.click) {
                if(this.onClickEvent !== null) {
                    this.onClickEvent();
                }
                return true;
            }

            if(this.enabled && currentInputState.down) {
                this.isDown = true;
            }

            if(this.enabled && currentInputState.up) {
                this.isDown = false;
            }

            return false;
        };
        
        FlButton.prototype.render = function() {
            if(this.visible) {
                this.ctx.save();
                
                if(!this.enabled) {
                    this.ctx.shadowColor   = 'rgba(0,0,0,0)';
                } else {
                    this.ctx.shadowColor   = 'rgba(0,0,0,.3)';
                }
                
                this.ctx.shadowBlur    = 1;
                this.ctx.shadowOffsetX = 2;
                this.ctx.shadowOffsetY = 2;
                
                if(!this.enabled) {
                    ns.FlDraw.roundRect(this.ctx, this.x, this.y, this.width, this.height, 4, false, '#f9f9f9');
                } else {
                    ns.FlDraw.roundRect(this.ctx, this.x, this.y, this.width, this.height, 4, false, '#fff');
                }
                
                this.ctx.restore();
                this.ctx.save();
                
                if(this.enabled && this.isDown) {
                    ns.FlDraw.roundRect(this.ctx, this.x, this.y, this.width, this.height, 4, false, 'rgba(103, 180, 232, .15)');
                }
                
                if(!this.enabled) {
                    this.ctx.globalAlpha = 0.3;
                }

                this.ctx.textAlign = 'center';
                ns.FlDraw.text(this.ctx, (this.x + this.width/2), (this.y + (this.height/2)-3),  this.text1, this.textcolor, this.typeString);
                ns.FlDraw.text(this.ctx, (this.x + this.width/2), (this.y+ (this.height/2)+15), this.text2, this.textcolor, this.typeString);
                this.ctx.restore();
            } else {
                if(this.enabled && this.isDown) {
                    ns.FlDraw.roundRect(this.ctx, this.x, this.y, this.width, this.height, 4, false, 'rgba(103, 180, 232, .15)');
                }
                //ns.FlDraw.roundRect(this.ctx, this.x, this.y, this.width, this.height, 4, false, 'rgba(103,180,232,.15)');
            }
            if (this.hasOutline) {
                ns.FlDraw.roundRect(this.ctx, this.x, this.y, this.width, this.height, 4, true, 'rgba(255, 255, 255, 0.0)');
            }
        };
        return FlButton;
    })();
})(window.mt.lemons);

(function (ns) {
    'use strict';

    ns.FlDraw = {

        clear: function(ctx) {
            ctx.clearRect(0, 0, ns.CONFIG.WIDTH, ns.CONFIG.HEIGHT);
        },

        renderToCanvas: function (width, height, margin, renderFunction, caller) {
            var buffer = document.createElement('canvas');
            var ctx = buffer.getContext('2d');

            buffer.width = width + margin * 2;
            buffer.height = height + margin * 2;
            ctx.translate(margin, margin);
            
            renderFunction(ctx, caller);
            return buffer;
        },

        rect: function(ctx, x, y, w, h, col, fill) {
            ctx.save();

            if(typeof fill === 'undefined' || fill)
            {
                ctx.fillStyle = col;
                ctx.fillRect(x, y, w, h);
            }
            else
            {
                ctx.strokeStyle = col;
                ctx.rect(x, y, w, h);
                ctx.stroke();
            }
            
            ctx.restore();
        },

        circle: function(ctx, x, y, r, col) {
            ctx.save();
            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        },

        text: function(ctx, x, y, string, col, typeString) {
            //ctx.save();
            ctx.font = typeString;
            ctx.fillStyle = col;
            ctx.fillText(string, x, y);
            //ctx.restore();
        },

        roundRect: function(ctx, x, y, width, height, radius, stroke, col) {
            ctx.save();
            ctx.fillStyle = col;
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.lineTo(x + width - radius, y);
            ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            ctx.lineTo(x + width, y + height - radius);
            ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            ctx.lineTo(x + radius, y + height);
            ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            ctx.lineTo(x, y + radius);
            ctx.quadraticCurveTo(x, y, x + radius, y);
            ctx.closePath();

            if (stroke) 
            {
              ctx.stroke();
            }

            ctx.fill();
            ctx.restore();
        },

        halfRoundRect: function(ctx, x, y, width, height, radius, stroke, col, flipped) {
            ctx.save();
            ctx.fillStyle = col;
            ctx.beginPath();

            if(!flipped) {
                ctx.moveTo(x, y);
                ctx.lineTo(x + width - radius, y);
                ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
                ctx.lineTo(x + width, y + height - radius);
                ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
                ctx.lineTo(x, y + height);
                ctx.lineTo(x, y );
            } else {
                ctx.moveTo(x + radius, y);
                ctx.lineTo(x + width, y);
                ctx.lineTo(x + width, y + height);
                ctx.lineTo(x + radius, y + height);
                ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
                ctx.lineTo(x, y + radius);
                ctx.quadraticCurveTo(x, y, x + radius, y);
            }

            ctx.closePath();
            
            if (stroke) {
              ctx.stroke();
            }

            ctx.fill();
            ctx.restore();
        },

        // This function takes an unlimited number of arguments and creates a gradient with each color given
        gradient: function(ctx, x, y, width, height) {
            var grd = ctx.createLinearGradient(0, 0, width, 0);

            for(var i = 4; i < arguments.length; i++) {
                grd.addColorStop((i - 4) * (1 / (arguments.length - 5)), arguments[i]);
            }

            ctx.fillStyle = grd;
            ctx.fillRect(x, y, width, height);
        },

        componentToHex: function(c) {
            var hex = c.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        },

        rgbToHex: function(r, g, b) {
            return '#' + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
        },

        generateMatte: function(img, scaleFactor, color ) {
            var w = img.width;
            var h = img.height;

            var newW = w * scaleFactor;
            var newH = h * scaleFactor;

            // var offsetW = (newW-w)/2;
            // var offsetH = (newH-h)/2;

            var buff = document.createElement( 'canvas' );
            buff.width  = newW;
            buff.height = newH;
            
            var ctx  = buff.getContext('2d');

            ctx.save();
            ctx.translate(newW/2,newH/2);
            ctx.save();
            ctx.scale(scaleFactor,scaleFactor);
            ctx.drawImage(img, -(w/2), -(h/2) );
            ctx.restore();
            ctx.globalCompositeOperation = 'source-in';
            ctx.fillStyle = color;
            ctx.fillRect(-newW/2, -newH/2, newW, newH);

            ctx.restore();
            //ctx.drawImage(img, offsetW, offsetH );
            return buff;
        },

        // t = animation time in percentage.  i.e current frame / max frames
        // p0 = lowerBound (animated property's starting point)
        // p1 = lower parametric bound
        // p2 = upper parametric bound
        // p3 = upperBound (animated property's ending point)
        cubicEase: function(t, p0,  p1, p2, p3) { 
           //mathemtical function:(1-t)^3P0 + 3(1-t)^2*t*P1 + 3(1-t)t^2P2 + t^3*p3
            return Math.pow(1-t,3)*p0 + 3*(Math.pow(1-t,2))*t*p1 + 3*(1-t)*Math.pow(t,2)*p2 + Math.pow(t,3)*p3;
        },

        strokeEffect: function(ctx, x, y, w, h, img, col) {
            ctx.save();
            ctx.fillStyle = col;
            ctx.fillRect(x, y, w, h);
            ctx.globalCompositeOperation='destination-atop';
            ctx.drawImage(img, x, y, w, h);
            ctx.restore();
        }
    };
})(window.mt.lemons);

(function (ns) {
    'use strict';

    ns.FlFlexiblePane = (function() {
        function FlFlexiblePane(ctx, x, y, minW, minH, imagePath1, imagePath2, onImageLoaded, elementOneCount, elementTwoCount) {
            if (!(this instanceof FlFlexiblePane)) {
                return new FlFlexiblePane(ctx, x, y, minW, minH, imagePath1, imagePath2, onImageLoaded, elementOneCount, elementTwoCount);
            }
            this.ctx = ctx;
            this.type = 'flexiblePane';
            this.marginOffset = 14;
            this.x = Math.floor(x - this.marginOffset);
            this.y = Math.floor(y - this.marginOffset);
            this.minW = minW;
            this.minH = minH;
            this.maxW = 800;
            this.maxH = 800;
            this.fill = null;
            this.stroke = null;
            this.title = '';
            this.titleFill = null;
            this.ready1 = false;
            this.ready2 = false;
            this.onImageLoaded = onImageLoaded;
            this.elementOneCount = elementOneCount;
            this.elementTwoCount = elementTwoCount;
            this.remove = false;

            this.imagePath1 = imagePath1;

            var self = this;
            self.ready1 = false;
            self.ready2 = false;
            this.didPreRender = false;

            this.bgImage = new Image();
            this.cache = new Image();

            if (imagePath1 !== null) {
                this.bgImage.onload = function() {
                    self.ready1 = true;
                    self.onImageLoaded(self.elementOneCount, self.elementTwoCount);
                    self.onImageLoaded = null;
                };

                this.bgImage.src = imagePath1;
            } else {
                self.onImageLoaded(self.elementOneCount, self.elementTwoCount);
                self.onImageLoaded = null;
            }

            this.titleImage = new Image();
            this.titleImage.onload = function() {
                self.ready2 = true;
            };
            
            if(imagePath2 !== null) {
                this.titleImage.src = imagePath2;
            }

            this.fadeIn = false;
            this.fadeInTime = 0;
            this.fadeInPerTick = 1;
            this.fadeInValue = 1;
            this.fadeInHandle = null;
            this.fadeInDelegate = null;

        }

        FlFlexiblePane.prototype.onEnter = function() {};
        FlFlexiblePane.prototype.collides = function(currentInputState){return false;};
        FlFlexiblePane.prototype.onEvent = function(currentInputState){ return false; };
        FlFlexiblePane.prototype.handleEvent = function(currentInputState){ return false; };
        FlFlexiblePane.prototype.onLeave = function() {};

        FlFlexiblePane.prototype.update = function() {};

        FlFlexiblePane.prototype.render = function() {
            if(this.ready1 && this.ready2 && !this.didPreRender) {
                this.didPreRender = true;

                this.cache = ns.FlDraw.renderToCanvas(this.minW, this.minH, this.marginOffset, function(ctx, caller) {
                    ctx.save();
                    ctx.strokeStyle= '#4d87ae';
                    ctx.lineWidth = 1; 

                    if(caller.ready1) {
                        // make a path to clip the canvas
                        //ctx.save();         
                        ctx.shadowColor   = 'rgba(0,0,0,.5)';
                        ctx.shadowBlur    = 1;
                        ctx.shadowOffsetX = 1;
                        ctx.shadowOffsetY = 1;
                        ns.FlDraw.roundRect(ctx, 0, 0, caller.minW, caller.minH, 8, true,'rgba(255 ,255 ,255 ,0)' );
                        //ctx.restore();          
                        ctx.clip(); 
                        //fill behind the clip
                        var pat1 = ctx.createPattern(caller.bgImage,'repeat');
                        ns.FlDraw.roundRect(ctx, 0, 0, caller.minW, caller.minH, 8, false, pat1);
                        // larger stroke around clip to make inside shadow
                        ctx.shadowColor   = 'rgba(255,255,255,.3)';
                        ctx.shadowBlur    = 2;
                        ctx.shadowOffsetX = 1;
                        ctx.shadowOffsetY = 1;
                        ctx.strokeStyle = 'black';
                        ctx.lineWidth = 2;
                        ns.FlDraw.roundRect(ctx, 0-2, 0-2, caller.minW+10, caller.minH+10, 10, true,'rgba(255 ,255 ,255 ,0)');
                        ctx.stroke();

                        //ctx.restore();

                        if (caller.ready2) {
                            //ctx.save();
                            var pat2 = ctx.createPattern(caller.titleImage,'repeat-x');
                            var lineH = caller.titleImage.height;
                            var linePadding = 8;
                            ctx.fillStyle = pat2;
                            
                            ctx.translate(0+linePadding, 0+22);
                            ctx.fillRect(0, 0, caller.minW-(linePadding*2), lineH);
                            //ctx.restore();
                        }

                    } else if(caller.imagePath1 === null) {
                        ns.FlDraw.roundRect(ctx, 0, 0, caller.minW, caller.minH, 8, false ,'red');  
                    }

                    ctx.restore();

                }, this);
            }

            if(this.fadeIn) {
                this.ctx.globalAlpha = this.fadeInValue;
            }

            this.ctx.drawImage( this.cache, this.x, this.y);

            if(this.ctx.globalAlpha !== 1) {
                this.ctx.globalAlpha = 1;
            }
        };

        FlFlexiblePane.prototype.setFadeInTime = function(fadeInTime, delegate) {
            if (!this.fadeIn) {
                this.fadeInTime = fadeInTime;
                this.fadeIn = true;
                this.fadeInPerTick = 1 / (fadeInTime / 32);
                this.fadeInValue = 0;
                this.fadeInDelegate = delegate;
                this.fadeInHandle = window.setInterval(ns.fadeInTick, 32, this);
            }
        };
        return FlFlexiblePane;
    })();
})(window.mt.lemons);

(function (ns) {
    'use strict';

    ns.FlGroupDialog = (function() {
        function FlGroupDialog(APP, ctx, selection) {
            if (!(this instanceof FlGroupDialog)) {
                return new FlGroupDialog(APP, ctx, selection);
            }

            this.ctx = ctx;
            this.type = 'groupDialog';
            this.x = 0;
            this.y = 0;
            this.isSingleEntitySelection = (selection.length === 1);
            this.width = (this.isSingleEntitySelection ? 185 : 261);
            this.height = 40;
            this.sameGroup = ns.isSameGroup(APP.currentSelection);
            this.remove = false;

            this.isDown1 = false;
            this.isDown2 = false;
            this.isDown3 = false;

            this.itemText1 = 'Discard';
            this.itemText2 = 'Duplicate';
            this.itemText3 =  this.sameGroup ? 'Ungroup' : 'Group';

            this.ctx.save();

            this.ctx.font = '18px HelveticaNeue';
            this.ctx.fillStyle = '#00b0ea';

            this.itemText1W = this.ctx.measureText(this.itemText1).width;
            this.itemText2W = this.ctx.measureText(this.itemText2).width;
            this.itemText3W = this.ctx.measureText(this.itemText3).width;
            this.textPadding = 0;
            this.APP = APP;
            
            if (!this.isSingleEntitySelection) {
                this.textPadding = (this.width-(this.itemText1W+this.itemText2W+this.itemText3W))/6;
            } else {
                this.textPadding = (this.width-(this.itemText1W+this.itemText2W))/4;
            }

        }

        FlGroupDialog.prototype.update = function() {};
        FlGroupDialog.prototype.onEnter = function() {};
        FlGroupDialog.prototype.onLeave = function() {};
    
        FlGroupDialog.prototype.collides = function(currentInputState) {
            return ns.collidesRect(this.APP, this, currentInputState);
        };
        
        // Returns true if the event was handeled
        FlGroupDialog.prototype.handleEvent = function(currentInputState) {
            if(this.collides(currentInputState)) {
                if(currentInputState.click) {
                    this.onEvent(currentInputState);
                    currentInputState.click = false;
                } else if (currentInputState.down) {
                    var x = currentInputState.x;
                    //var y = currentInputState.y;

                    if(x > this.x) {
                        if((!this.isSingleEntitySelection && x < this.x + (this.textPadding * 2) + this.itemText1W) || (this.isSingleEntitySelection && x < this.x + (this.textPadding * 2) + this.itemText1W)) // Discard
                        {
                            if(!this.isDown1 && !this.isDown2 && !this.isDown3) {
                                this.isDown1 = true;
                                this.isDown2 = false;
                                this.isDown3 = false;
                            }
                        } else if((!this.isSingleEntitySelection && x < this.x + (this.textPadding * 4) + this.itemText1W + this.itemText2W) || (this.isSingleEntitySelection && x < this.x + this.width)) // Duplicate 
                        {
                            if(!this.isDown1 && !this.isDown2 && !this.isDown3) {
                                this.isDown2 = true;
                                this.isDown1 = false;
                                this.isDown3 = false;
                            }
                        } else if((x < this.x + this.width) && !this.isSingleEntitySelection) // Group / Ungroup  
                        {
                            if(!this.isDown1 && !this.isDown2 && !this.isDown3) {
                                this.isDown3 = true;
                                this.isDown1 = false;
                                this.isDown2 = false;
                            }
                        }
                    }
                }
                return true; 
            }

            this.isDown1 = false;
            this.isDown2 = false;
            this.isDown3 = false;

            return false;
        };

        FlGroupDialog.prototype.onEvent = function(currentInputState) {
            var x = currentInputState.x;
            //var y = currentInputState.y;
            var i, j;
            if(x > this.x) {
                if((!this.isSingleEntitySelection && x < this.x + (this.textPadding * 2) + this.itemText1W) || (this.isSingleEntitySelection && x < this.x + (this.textPadding * 2) + this.itemText1W)) {
                     // Discard
                    for(i = 0; i < this.APP.currentSelection.length; i++) {
                        this.APP.currentSelection[i].remove = true;
                    }

                    this.APP.clearSelection();
                    this.remove = true;
                    this.APP.currentDialog = null;
                    return true;
                } else if((!this.isSingleEntitySelection && x < this.x + (this.textPadding * 4) + this.itemText1W + this.itemText2W) || (this.isSingleEntitySelection && x < this.x + this.width)) {
                     // Duplicate 
                    var oldSelection = this.APP.currentSelection.slice(0);
                    var oldEntity, clone;

                    this.APP.currentSelection = [];

                    // If the old selection has a group
                    var groups = [];

                    checkOldSelectionForGroupsLoop:
                    for(i = 0; i < oldSelection.length; i++) {
                        if(oldSelection[i].group !== null) {
                            if(groups.length === 0) {
                                groups.push(oldSelection[i].group);
                            } else {
                                for(j = 0; j < groups.length; j++) {
                                    if(oldSelection[i].group === groups[j]) {
                                        continue checkOldSelectionForGroupsLoop;
                                    }
                                }

                                groups.push(oldSelection[i].group);
                            }
                        }
                    }

                    for(i = 0; i < groups.length; i++) {
                        var newGroup = [];
                        for(j = 0; j < groups[i].length; j++) {
                            oldEntity = groups[i][j];
                            oldEntity.coSelectedElements = null;
                            clone = oldEntity.clone(oldEntity.x + oldEntity.width / 4, oldEntity.y + oldEntity.height / 4);
                            newGroup.push(clone);
                            clone.group = newGroup;
                            this.APP.currentSelection.push(clone);
                            this.APP.moveableObjects.push(clone);
                            oldSelection.splice(oldSelection.indexOf(oldEntity), 1);
                        }
                    }

                    for(i = 0; i < oldSelection.length; i++) {
                        oldEntity = oldSelection[i];
                        oldEntity.coSelectedElements = null;
                        clone = oldEntity.clone(oldEntity.x + oldEntity.width / 4, oldEntity.y + oldEntity.height / 4);
                        this.APP.currentSelection.push(clone);
                        this.APP.moveableObjects.push(clone);
                    }

                    for(i = 0; i < this.APP.currentSelection.length; i++) {
                        this.APP.currentSelection[i].coSelectedElements = this.APP.currentSelection;
                    }

                    this.remove = true;
                    this.APP.currentDialog = null;
                    return true;
                } else if((x < this.x + this.width) && !this.isSingleEntitySelection) {
                     // Group / Ungroup  
                    var selection = this.APP.currentSelection;

                    if(this.sameGroup) {
                        var group = selection[0].group;

                        for(i = 0; i < group.length; i++)
                        {
                            group[i].group = null;
                        }
                    } else {
                        ns.groupObjects(this.APP.currentSelection);
                        ns.orderObjects(this.APP.currentSelection, this.x, this.y);
                    }

                    this.APP.clearSelection();

                    this.remove = true;
                    this.APP.currentDialog = null;
                    return true;
                }
            }

            return false;
        };

        FlGroupDialog.prototype.render = function() {
            if(this.APP.currentSelection !== null && this.APP.currentSelection.length > 0 && (this.APP.movingEntity === null || this.APP.movingEntity === undefined) && !this.remove) {
                var selection = this.APP.currentSelection;
                //Find center of selection of moveableObjects
                //Find top point of selection 

                var entity = selection[0]; 

                this.y = entity.y;
                this.x = entity.x + entity.width / 2;

                for(var i = 1; i < selection.length; i++)
                {   
                    entity = selection[i];

                    if(entity.y < this.y)
                    {
                        this.y = entity.y;
                    }

                    this.x += entity.x + entity.width / 2;
                }

                // Find average (mid)
                var mid = this.x /= selection.length;

                // Set x to most left point of Dialog
                this.x = (this.x - this.width / 2)+10;

                // Set y to top of Dialog and move it a bit up
                this.y = (this.y - (this.height + entity.height / 2));

                this.setPosition(this.x, this.y);

                //draw popover shape
                this.ctx.save();

                //shadow settings
                this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
                this.ctx.shadowBlur = 1;
                this.ctx.shadowOffsetX = 1.5;
                this.ctx.shadowOffsetY = 1;

                ns.FlDraw.roundRect(this.ctx, this.x, this.y, this.width, this.height, 8, false, 'rgba(255,255,255,.9)');

                //draw triangle
                this.ctx.fillStyle = 'rgba(255,255,255,.9)';

                this.ctx.beginPath();
                this.ctx.moveTo(mid, this.y + this.height + 13);
                this.ctx.lineTo(mid + 13.5, this.y + this.height - 0.3);
                this.ctx.lineTo(mid - 13.5, this.y + this.height - 0.3);
                this.ctx.closePath();
                this.ctx.fill();

                //this.ctx.beginPath();
                this.ctx.restore();

                // this.ctx.save();
                //this.ctx.textAlign = 'center';
                this.ctx.font = '18px HelveticaNeue';
                this.ctx.fillStyle = '#00b0ea';
                var width1, width2, width3;
                if(!this.isSingleEntitySelection) {
                    width1 = (this.textPadding * 2) + this.itemText1W;
                    width2 = ((this.textPadding * 4) + this.itemText1W + this.itemText2W) - width1;
                    width3 = this.width - ((this.textPadding * 4) + this.itemText1W + this.itemText2W);
                    
                    if(this.isDown1)
                    {
                        ns.FlDraw.halfRoundRect(this.ctx, this.x, this.y, width1, this.height, 8, false, 'rgba(103,180,232,.15)',true);
                    }
                    if(this.isDown2)
                    {
                        //function(ctx, x, y, w, h, col, fill)
                        ns.FlDraw.rect(this.ctx, this.x + (this.textPadding * 2) + this.itemText1W, this.y, width2, this.height, 'rgba(103,180,232,.15)');
                    }
                    if(this.isDown3)
                    {
                        ns.FlDraw.halfRoundRect(this.ctx, this.x + (this.width - width3), this.y, width3, this.height, 8, false, 'rgba(103,180,232,.15)',false);
                    }
                
                    this.ctx.fillText(this.itemText1, this.x + this.textPadding, this.y + (this.height/2)+6);
                    ns.FlDraw.rect(this.ctx, this.x + (this.textPadding * 2) + this.itemText1W, this.y+(this.height * 0.25), 1,this.height * 0.5, '#c5e2f6');
                    //ns.FlDraw.rect(this.ctx,         this.x + (this.textPadding * 2) + this.itemText1W, this.y, 1, this.height, '#c5e2f6');
                    this.ctx.fillText(this.itemText2, this.x + (this.textPadding * 3) + this.itemText1W, this.y + (this.height / 2) + 6);
                    ns.FlDraw.rect(this.ctx, this.x + (this.textPadding * 4) + this.itemText1W + this.itemText2W, this.y + (this.height * 0.25), 1, this.height * 0.5, '#c5e2f6');
                    //ns.FlDraw.rect(this.ctx,         this.x + (this.textPadding * 4) + this.itemText1W + this.itemText2W, this.y, 1, this.height, '#c5e2f6');
                    this.ctx.fillText(this.itemText3, this.x + (this.textPadding * 5) + this.itemText1W + this.itemText2W, this.y + (this.height / 2) + 6); 
                } else {
                    width1 = (this.textPadding * 2) + this.itemText1W;
                    width2 = this.width - width1;
                    if(this.isDown1) {
                        ns.FlDraw.halfRoundRect(this.ctx, this.x, this.y, width1, this.height, 8, false, 'rgba(103,180,232,.15)',true);
                    }
                    if(this.isDown2) {
                        ns.FlDraw.halfRoundRect(this.ctx, this.x + width1, this.y, width2, this.height, 8, false, 'rgba(103,180,232,.15)',false);
                    }

                    this.ctx.fillText(this.itemText1,   this.x + this.textPadding, this.y + (this.height/2)+6);
                    ns.FlDraw.rect(this.ctx,   this.x + (this.textPadding * 2) + this.itemText1W, this.y+(this.height * 0.25), 1, this.height * 0.5, '#c5e2f6');
                    //ns.FlDraw.rect(this.ctx,         this.x + (this.textPadding * 2) + this.itemText1W, this.y, 1, this.height, '#c5e2f6');
                    this.ctx.fillText(this.itemText2,   this.x + (this.textPadding * 3) + this.itemText1W, this.y + (this.height/2)+6);
                }

                this.ctx.restore();
            }
        };

        FlGroupDialog.prototype.setPosition = function(x, y) {
            if (x + this.width > ns.WIDTH) {
                this.x = ns.WIDTH - this.width; 
            } else if (x < 0) {
                this.x = 0;
            } else {
                this.x = x;
            }

            if(y < 0) {
                this.y = this.height / 2;  
            } else if(y + this.height / 2 > ns.HEIGHT) {
                this.y = ns.HEIGHT - this.height / 2;
            } else {
                this.y = y;
            }
        };
        return FlGroupDialog;
    })();
})(window.mt.lemons);

(function (ns) {
    'use strict';
    ns.FlInput = (function() {
        function FlInput(APP) {
            if (!(this instanceof FlInput)) {
                return new FlInput(APP);
            }
            this.x = 0;
            this.y = 0;
            this.lastX = 0;
            this.lastY = 0;
            this.tapped = false;
            this.down = false;
            this.up = false;
            this.click = false;
            this.didMove = 0;
            this.APP = APP;
        }

        FlInput.prototype.touch = function(touchXY) {
            this.set(touchXY);
        };

        FlInput.prototype.release = function(touchXY) {
            this.end();
        };

        FlInput.prototype.drag = function(touchXY) {
            this.move(touchXY);
        };

        // Gets called on mousedown/touchstart event
        FlInput.prototype.set = function(data) { 
            // this.x = (data.pageX - this.APP.offset.left) / this.APP.scale;
            // this.y = (data.pageY - this.APP.offset.top) / this.APP.scale;
            this.x = data[0];
            this.y = data[1];

            this.tapped = true;
            this.down = true;
            this.up = false;
            this.click = false;
            this.didMove = 0;
        };

        FlInput.prototype.move = function(data) {
            // this.x = (data.pageX - this.APP.offset.left) / this.APP.scale;
            // this.y = (data.pageY - this.APP.offset.top) / this.APP.scale; 
            this.x = data[0];
            this.y = data[1];

            if(this.x !== this.lastX || this.y !== this.lastY) {
                this.lastX = this.x;
                this.lastY = this.y;
                this.click = false;
                this.didMove++;
                
                if(this.down && this.APP.isSelecting) {
                    this.APP.addLassoPoint(this.x, this.y);
                }
            }
        };

        // Gets called on mouseup/touchend event
        FlInput.prototype.end = function() {
            if(this.down) {
                this.up = true;

                if(this.didMove < 10) {
                    this.click = true;
                }
            }

            this.tapped = false;
            this.down = false;
        };

        FlInput.prototype.getCurrentInputState = function(tapped) {
            if(this.tapped || this.down || this.up || this.click) {
                return {
                    x: this.x,
                    y: this.y,
                    r: 6,
                    width: 3,
                    height: 3,
                    tapped: this.tapped,
                    down: this.down,
                    up: this.up,
                    click: this.click
                };
            }

            return null;
        };

        return FlInput;
    })();
})(window.mt.lemons);

(function (ns) {
    'use strict';
    ns.FlNumberPad = (function() {
        function FlNumberPad(APP, ctx, x, y, arrowX, prevNum, callback, numOfButtons, arrowUp) {
            if (!(this instanceof FlNumberPad)) {
                return new FlNumberPad(APP, ctx, x, y, arrowX, prevNum, callback, numOfButtons, arrowUp);
            }
            this.ctx = ctx;
            this.type = 'numberPad';
            this.x = x;
            this.y = y;
            this.callback = callback;
            this.numOfButtons = numOfButtons >= 1 ? numOfButtons : 10;
            this.arrowX = arrowX;
            
            this.xPadding = 5;
            this.widthMinusPadding = 50;
            this.width = this.widthMinusPadding * 5 + this.xPadding;
            this.yPadding = 5;
            this.heightMinusPadding = 50;// - this.yPadding;
            this.height = this.heightMinusPadding * parseInt(this.numOfButtons / 5, 10) + this.yPadding;

            this.remove = false;
            this.wasDown = false;
            this.result = 1;
            this.APP = APP;
            this.prevNum = prevNum;
            this.arrowUp = (arrowUp !== undefined) ? arrowUp : false;
        }

        FlNumberPad.prototype.update = function() {};
        FlNumberPad.prototype.onEnter = function() {};
        FlNumberPad.prototype.onLeave = function() {};


        // Returns true if the event was handeled
        FlNumberPad.prototype.handleEvent = function(currentInputState) {
            if(((currentInputState.up || currentInputState.down) && ns.collidesRect(this.APP, this, currentInputState))) {
                this.onEvent(currentInputState);
                return true; 
            }

            return false;
        };

        FlNumberPad.prototype.onEvent = function(currentInputState) {
            var x = currentInputState.x;
            var y = currentInputState.y;

            x -= (this.x);
            y -= (this.y);
            this.result = 1;
            var xValue = Math.floor(x / (this.width / 5)) + 1;
            var yValue = Math.floor(y / (this.height/ parseInt(this.numOfButtons / 5, 10))) * 5;
            if (xValue < 1) {
                xValue = 1;
            } else if (xValue > 5) {
                xValue = 5;
            }
            if (yValue < 0) {
                yValue = 0;
            } else if (yValue >= this.numOfButtons) {
                yValue = this.numOfButtons - 5;
            }

            this.result = xValue + yValue ;

            if(this.APP && this.APP.Input && this.APP.Input.down) {
                this.wasDown = true;
            } else if(this.APP && this.APP.Input && this.APP.Input.up && this.wasDown) {
                this.callback(this.result);
                this.wasDown = false;
                this.remove = true;
            }

            if (this.result < 1) {
                this.result = 1;
            } else if (this.result > this.numOfButtons) {
                this.result = this.numOfButtons;
            }
            return true;
        };

        FlNumberPad.prototype.calculateNumberLocationX = function(number) {
            return (this.x + this.xPadding) + ((number - 1) % 5) * this.widthMinusPadding;
        };

        FlNumberPad.prototype.calculateNumberLocationY = function(number) {
            return (this.y + this.yPadding) + (number === 1 ? 0 : Math.floor((number - 1) / 5))  * this.heightMinusPadding;
        };

        FlNumberPad.prototype.render = function() {
            //draw popover shape
            this.ctx.save();

            //shadow settings
            this.ctx.shadowColor = 'rgba(0,0,0,0.3)';
            this.ctx.shadowBlur = 1;
            this.ctx.shadowOffsetX = 1.5;
            this.ctx.shadowOffsetY = 1;

            ns.FlDraw.roundRect(this.ctx, this.x, this.y, this.width, this.height, 8, false, 'rgba(255,255,255,.9)');

            //draw triangle
            this.ctx.fillStyle = 'rgba(255,255,255,.9)';

            var mid = (this.arrowX);
            this.ctx.beginPath();
            var offset = this.height;
            var offsetPoint = 13;
            if (this.arrowUp) {
                offset = 0;
                offsetPoint = -13;
            }
            this.ctx.moveTo(mid, this.y + offset + offsetPoint);
            this.ctx.lineTo(mid + 13.5, this.y + offset);
            this.ctx.lineTo(mid - 13.5, this.y + offset);
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.closePath();

            this.ctx.restore();

            // draw numbers
            this.ctx.save();
            this.ctx.textAlign = 'center';

            for(var numberCounter = 1; numberCounter <= this.numOfButtons; numberCounter++) {
                ns.FlDraw.text(this.ctx, Math.ceil(this.calculateNumberLocationX(numberCounter)+22), Math.ceil(this.calculateNumberLocationY(numberCounter)+(29)), numberCounter, 'rgba(103,180,232,1)', '18px HelveticaNeue');
                ns.FlDraw.rect(this.ctx, Math.ceil(this.calculateNumberLocationX(numberCounter)), Math.ceil(this.calculateNumberLocationY(numberCounter)), 44, 44, '#c5e2f6', false);
            }

            this.ctx.restore();

            // do down state
            if(this.wasDown) {
                ns.FlDraw.rect(this.ctx, this.calculateNumberLocationX(this.result), this.calculateNumberLocationY(this.result), 44, 44,'rgba(103,180,232,.15)');
            }
        };

        return FlNumberPad;
    })();
})(window.mt.lemons);

(function (ns) {
    'use strict';

    ns.FlRatioBar = (function() {
        function FlRatioBar(APP, ctx, x, y, width, height, originalElementRatio, elementOneCount, elementTwoCount) {
            if (!(this instanceof FlRatioBar)) {
                return new FlRatioBar(APP, ctx, x, y, width, height, originalElementRatio, elementOneCount, elementTwoCount);
            }
            this.ctx = ctx;
            this.type = 'ratioBar';
            this.marginOffset = 35;
            this.x = Math.floor(x - this.marginOffset);
            this.y = Math.floor(y - this.marginOffset);
            this.width = Math.floor(width);
            this.height = Math.floor(height);
            this.colorAtratioPlacement = undefined;
            this.originalElementRatio = originalElementRatio;
            this.elementOneCount = elementOneCount;
            this.elementTwoCount = elementTwoCount;
            this.remove = false;
            this.cache = new Image();

            this.ratioPlacement = this.calculateRatioPlacement(this.elementOneCount, this.elementTwoCount);

            if(isNaN(this.ratioPlacement) || this.ratioPlacement < 0) {
                this.ratioPlacement = 0;
            } else if(!isFinite(this.ratioPlacement) || this.ratioPlacement > this.width) {
                this.ratioPlacement = this.width;
            }

            this.ColorPlacement = this.ratioPlacement;

            this.originalRatioPlacement = this.calculateRatioPlacement(APP.elementOneOriginalCount, APP.elementTwoOriginalCount);

            // If the colorplacement hits the goal indicator move it a little to avoid the gray color
            if(this.ColorPlacement === this.originalRatioPlacement) {
                this.ColorPlacement+= 4;
            }

            this.ColorPlacement = Math.floor(this.ColorPlacement);

            if(this.ColorPlacement < 3) {
                this.ColorPlacement = 3;
            } else if(this.ColorPlacement > this.width - 3) {
                this.ColorPlacement = this.width - 3;
            }
        }

        FlRatioBar.prototype.translate = function(value, leftMin, leftMax, rightMin, rightMax) {
            // Figure out how 'wide' each range is
            var leftSpan = leftMax - leftMin;
            var rightSpan = rightMax - rightMin; 
            // Convert the left range into a 0-1 range (float)
            var valueScaled = (value - leftMin) / leftSpan;
            // Convert the 0-1 range into a value in the right range.
            return rightMin + (valueScaled * rightSpan);
        };

        FlRatioBar.prototype.calculateRatioPlacement = function(elementOneCount, elementTwoCount) {
            var mid = 0;
            var min = -elementTwoCount;
            var max = elementOneCount;
            max = max - min;
            mid = mid - min;
            min = min - min;
            var percentageOfBar = mid / max;
            var valueToMap = percentageOfBar*100;
            var barRatio = this.translate(Math.round(valueToMap),0,100, 0, this.width);

            return barRatio;
        };



        FlRatioBar.prototype.onEnter = function() {
            this.cache = ns.FlDraw.renderToCanvas(this.width,this.height, this.marginOffset, function(ctx, caller) {
                var width = caller.width;
                //var height = caller.height;
                ctx.save();

                var grd = ctx.createLinearGradient(0, 0, width, 0);
                grd.addColorStop(0, ns.CONFIG.MIX_RATIO_GRADIENT_START);
                var originalElementRatio = caller.originalElementRatio;
                if (originalElementRatio > 1) {
                    originalElementRatio = 1 - (1 / originalElementRatio);
                }
                grd.addColorStop(originalElementRatio, ns.CONFIG.MIX_RATIO_GRADIENT_MID);
                grd.addColorStop(1, ns.CONFIG.MIX_RATIO_GRADIENT_END);
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, caller.width, caller.height);

                // Draw pefect ratio indicator
                ns.FlDraw.rect(ctx, caller.originalRatioPlacement - 1, 0, 2, caller.height, 'rgba(102,102,102,.3)');
                // make a path to clip the canvas
                ctx.beginPath();
                ctx.rect(0, 0, caller.width, caller.height);
                ctx.clip();
                // make a stroke just larger than first sape and give it a drop shadow
                ctx.beginPath();
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 4;
                ctx.shadowBlur = 2;
                ctx.shadowColor = 'rgba(0, 0, 0, .2)';
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 2;
                ctx.rect(-2, -2, caller.width+4, caller.height+8);
                ctx.stroke();
                ctx.restore();
                
                // draw label box above bar //
                var miniPopW = 62.5;
                var miniPopH = 20;
                var miniPopMid = caller.originalRatioPlacement;
                var midRgb = ns.CONFIG.MIX_RATIO_GRADIENT_MID.replace(/^rgba?\(|\s+|\)$/g,'').split(',');
                var newRgb = 'rgb('+(parseInt(midRgb[0])+2)+', '+(parseInt(midRgb[1])-16)+', '+(parseInt(midRgb[2])-4)+')';
                
                //start round rect with inside shadow
                ctx.save();
                ctx.fillStyle = ns.CONFIG.MIX_RATIO_GRADIENT_MID;
                ns.FlDraw.roundRect(ctx, caller.originalRatioPlacement-(miniPopW/2), -35, miniPopW, miniPopH,4, false, ns.CONFIG.MIX_RATIO_GRADIENT_MID );
                ctx.fill();
                // make a path to clip the canvas for round rect
                ns.FlDraw.roundRect(ctx, caller.originalRatioPlacement-(miniPopW/2), -35, miniPopW, miniPopH,4, false);
                ctx.strokeStyle = newRgb;
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.clip();
                // stroke to make inside shadow for round rect
                ctx.shadowColor   = 'rgba(0 ,0 ,0 ,.2 )';
                ctx.shadowBlur    = 3;
                ctx.shadowOffsetX = 2;
                ctx.shadowOffsetY = 1.5;
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1;
                ns.FlDraw.roundRect(ctx, caller.originalRatioPlacement-(miniPopW/2)-2, -35-2, miniPopW+4, miniPopH+4,6, true, 'rgba(255 ,255 ,255 ,0)');
                ctx.stroke();
                ctx.restore();

                //start triangle with inside shadow
                ctx.save();
                ctx.fillStyle = ns.CONFIG.MIX_RATIO_GRADIENT_MID;
                ctx.beginPath();
                ctx.moveTo(miniPopMid + 5, (-35)+miniPopH-1);
                ctx.lineTo(miniPopMid,  (-35)+miniPopH+7);
                ctx.lineTo(miniPopMid - 5, (-35)+miniPopH-1);
                ctx.fill();
                // make a path to clip the canvas for triangle
                ctx.beginPath();
                ctx.moveTo(miniPopMid + 7, (-35)+miniPopH-3);
                ctx.lineTo(miniPopMid,  (-35)+miniPopH+9);
                ctx.lineTo(miniPopMid - 7, (-35)+miniPopH-3);
                ctx.closePath();
                ctx.clip();
                // stroke to make inside shadow for triangle
                ctx.shadowColor   = 'rgba(0 ,0 ,0 ,.3 )';
                ctx.shadowBlur    = 2;
                ctx.shadowOffsetX = 1.5;
                ctx.shadowOffsetY = 1;
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(miniPopMid + 7, (-35)+miniPopH-1);
                ctx.lineTo(miniPopMid,  (-35)+miniPopH+11);
                ctx.lineTo(miniPopMid - 7, (-35)+miniPopH-1);
                ctx.stroke();
                ctx.restore();
                
                // Just right text
                ctx.save();
                ctx.textAlign = 'center';
                ns.FlDraw.text(ctx, miniPopMid, (-38)+(miniPopH/2)+4.5, 'Just right', 'rgba(255,255,255,.4)', '12px HelveticaNeue' );
                ns.FlDraw.text(ctx, miniPopMid, (-36)+(miniPopH/2)+4.5, 'Just right', '#666', '12px HelveticaNeue' );
                ctx.restore();
                
                // Draw start and end indicators
                ctx.save();
                ctx.shadowBlur = 1;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 1;
                ctx.shadowColor = 'rgba(255, 255, 255, 1)';
                ns.FlDraw.rect(ctx, -3.5, (caller.height/2)-(34.57/2), 3.5, 34.57, '#666666');
                ns.FlDraw.rect(ctx, caller.width, (caller.height/2)-(34.57/2), 3.5, 34.57,'#666666' );
                ctx.restore();
               
            }, this);
        };

        FlRatioBar.prototype.collides = function(currentInputState){ return false; };
        FlRatioBar.prototype.handleEvent = function(){ return false; };

        FlRatioBar.prototype.onLeave = function() {};

        FlRatioBar.prototype.update = function() {};

        FlRatioBar.prototype.render = function() {
            // Draw gradient bar
            // white drop under bar
            this.ctx.save();
            this.ctx.fillStyle = '#fff';

            //this.ctx.restore();
            var bgImage = new Image();
            bgImage.src = 'lemons/img/flavorMeterBg.png';
            this.ctx.drawImage(bgImage, this.x-18, this.y-25, 563, 112);

            this.ctx.drawImage( this.cache, this.x, this.y );

            if(this.colorAtratioPlacement === undefined) {
                var p = this.ctx.getImageData(this.x + this.marginOffset + this.ColorPlacement, this.y + this.marginOffset  + (this.height/2), 1, 1).data;
                this.colorAtratioPlacement = ns.FlDraw.rgbToHex(p[0], p[1], p[2]);
            }

            //draw the user Ratio indicator;
            ns.FlDraw.rect(this.ctx, this.x + this.marginOffset + this.ratioPlacement-2, this.y + this.marginOffset + (this.height/2)-17, 3, 34, '#666666');
            this.ctx.shadowBlur = 2;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 1.5;
            this.ctx.shadowColor = 'rgba(0, 0, 0,.15)';
            ns.FlDraw.circle(this.ctx, this.x + this.marginOffset + this.ratioPlacement, this.y + this.marginOffset + (this.height/2), 15, '#666666');
            
            ns.FlDraw.circle(this.ctx, this.x + this.marginOffset + this.ratioPlacement, this.y + this.marginOffset + (this.height/2), 12, this.colorAtratioPlacement);
            this.ctx.restore();
        };
        return FlRatioBar;
    })();
})(window.mt.lemons);

(function (ns) {
    'use strict';

    ns.FlText = (function() {
        function FlText(ctx, x, y, text, bold, textsize, color, expandLeft, font) {
            if (!(this instanceof FlText)) {
                return new FlText(ctx, x, y, text, bold, textsize, color, expandLeft, font);
            }
            this.ctx = ctx;
            this.type = 'text';
            this.text = '' + text;
            this.x = Math.floor(x - (expandLeft ? (this.text.length * 8) : 0));
            this.y = Math.floor(y);
            this.r = 50;
            this.color = color;
            this.remove = false;

            this.textAlign = null;
            this.shadow = null;
            this.typeString = '';

            if(bold) {
                this.typeString = 'bold ';
            }
            if(font === undefined) {
                this.typeString += textsize + 'px HelveticaNeue';
            } else {
                this.typeString += textsize + 'px ' + font;
            }
        }

        FlText.prototype.collides = function(currentInputState){ return false; };
        FlText.prototype.handleEvent = function(currentInputState){return false; };
        FlText.prototype.onEnter = function() {};
        FlText.prototype.onLeave = function() {};
        FlText.prototype.update = function() {};

        FlText.prototype.render = function() {
            if(this.shadow !== null || this.textAlign !== null)
            {
                this.ctx.save();
            } 

            if(this.shadow !== null)
            {
                this.ctx.shadowColor   = this.shadow.shadowColor;
                this.ctx.shadowBlur    = this.shadow.shadowBlur;
                this.ctx.shadowOffsetX = this.shadow.shadowOffsetX;
                this.ctx.shadowOffsetY = this.shadow.shadowOffsetY;
            }

            if(this.textAlign !== null)
            {
                this.ctx.textAlign = this.textAlign;
            }

            ns.FlDraw.text(this.ctx, this.x, this.y, this.text, this.color, this.typeString);

            if(this.shadow !== null || this.textAlign !== null)
            {
                this.ctx.restore();
            }
        };
        return FlText;
    })();
})(window.mt.lemons);

(function (ns) {
    'use strict';

    //Checks if two circle objects collide
    ns.collidesCircle = function(APP, a, b) {
        var distance_squared = (((b.x - a.x) * (b.x - a.x)) + 
                                ((a.y - b.y) * (a.y - b.y)));
                                
        var radi_squared = (a.r + b.r) * (a.r + b.r);
        var collidesCircle = (distance_squared < radi_squared);

        if(collidesCircle && APP.checkCollision)
        {
            APP.endLassoing();
        }

        return collidesCircle;
    };

    //Checks if two rectangles collide
    ns.collidesRect = function(APP, a, b) {
        var collidesRect =  !(
            ((a.y + a.height) < (b.y)) ||
            (a.y > (b.y + b.height))   ||
            ((a.x + a.width) < b.x)    ||
            (a.x > (b.x + b.width))
        );

        if(collidesRect && APP.checkCollision) {
            APP.endLassoing();
        }

        return collidesRect;
    };

    // Used for the lasso to test if some point is within a polygon, where the lasso is the polygon
    ns.pointInPolygon = function (xp, yp, x, y) {
        var i, j, npol = xp.length, c = false, ypi = 0, ypj = 0, xpi = 0, xpj = 0;

        for (i = 0, j = npol-1; i < npol; j = i++) {
            ypi = yp[i];
            ypj = yp[j];
            xpi = xp[i];
            xpj = xp[j];

            if ((((ypi <= y) && (y < ypj)) || ((ypj <= y) && (y < ypi))) && (x < (xpj - xpi) * (y - ypi) / (ypj - ypi) + xpi)) {
                c = !c;
            }
        }

        return c;
    };

    ns.distance = function(deltaX, deltaY) {
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    };
})(window.mt.lemons);


(function (ns) {
    'use strict';
    ns.fadeInTick = function(objectToAnimate) {
        if(objectToAnimate.fadeInTime > 32) {
            objectToAnimate.fadeInTime += -32;
            objectToAnimate.fadeInValue += objectToAnimate.fadeInPerTick;
        } else {
            objectToAnimate.fadeInValue = 1;
            objectToAnimate.fadeIn = false;

            if(objectToAnimate.fadeInDelegate !== null) {
                objectToAnimate.fadeInDelegate();
                objectToAnimate.fadeInDelegate = null;
            }
        }
    };
})(window.mt.lemons);

(function (ns) {
    'use strict';

    ns.capitaliseFirstLetter = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };


    // Determins if a selection contains only the same group, if there is a group
    ns.isSameGroup = function(selection) {
        if(selection === null || selection === undefined || selection.length === 0) {
            return false;
        }

        var sameGroup = selection.length > 0;

        var group = selection[0].group;

        if(group !== null && group !== undefined && sameGroup) {
            for(var i = 1; i < selection.length; i++) {
                if(selection[i].group !== group) {
                    sameGroup = false;
                    break;
                }
            }
        } else {
            sameGroup = false;
        }

        return sameGroup;
    };

    // Turns a selection into a new group and clears any hold relationship with selections and groups
    ns.groupObjects = function(selection) {
        /*
        The double for loop construction is needed in order to reset all
        objects groups in case the selection is bigger than maxGroupSize
        */

        var i;
        for(i = 0; i < selection.length; i++) {
            selection[i].coSelectedElements = null;
            selection[i].group = null;
        }

        selection = selection.slice(0, ns.CONFIG.maxGroupSize);

        for(i = 0; i < selection.length; i++) {
            selection[i].group = selection;
        }
    };

    // Orders a selection, finds the average x as basis.
    ns.orderObjects = function(selection, x, y) {
        //Find center of selection of moveableObjects
        //Find top point of selection 
        var entity = selection[0]; 
        y = entity.y;
        x = entity.x + entity.width / 2;
        for(var i = 1; i < selection.length; i++) {
            entity = selection[i];
            if(entity.y < y) {
                y = entity.y;
            }
            x += entity.x + entity.width / 2;
        }
        // Find average (mid)
        var midX = x /= selection.length;
        var topY = y;

        ns.orderObjectsByPoint(midX, topY, selection);
    };


    // Orders a collection of elements relative to a point defined by the first to arguments
    ns.orderObjectsByPoint = function(upperLeftMostMemberX, upperLeftMostMemberY, selection,centerY) {
        var entity = selection[0];
        
        var elementOneElements = [];
        var elementTwoElements = [];
        for(var i = 0; i < selection.length; i++) {
            var selectionMember = selection[i];
            if(selectionMember.type.indexOf(ns.CONFIG.elementOneName) > -1) {
                elementOneElements.push(selectionMember);
            } else {
                elementTwoElements.push(selectionMember);
            }
        }

        var elementsPerRowAndColumnElementOne = Math.ceil(Math.sqrt(elementOneElements.length)); 
        var elementsPerRowAndColumnElementTwo = Math.ceil(Math.sqrt(elementTwoElements.length));

        var elementsPerColumnElementOne = Math.ceil(elementOneElements.length / elementsPerRowAndColumnElementOne)*(entity.height);
        var elementsPerColumnElementTwo = Math.ceil(elementTwoElements.length / elementsPerRowAndColumnElementTwo)*(entity.height);

        //var elementsPerColumnTwo = Math.ceil(elementTwoElements.length / elementsPerRowAndColumnElementTwo);

        //var remainder = elementTwoElements.length % elementsPerRowAndColumnElementOne;
        //var upperLeft = 0;
        //var upperRight = elementsPerRowAndColumnElementOne;

        //var elementTwoRemainder = (elementTwoElements.length % elementsPerRowAndColumnElementTwo);
        //var bottomLeft = elementTwoElements.length-elementTwoRemainder;
        //var bottomRight = 0;
        //var remainderOne = 0;
        //var remainderRight = 0;

        if(isNaN(elementsPerColumnElementOne)) {
            elementsPerColumnElementOne = 0;
        }
        if(isNaN(elementsPerColumnElementTwo)) {
            elementsPerColumnElementTwo = 0;
        }

        var totalWidthOfElements = (elementsPerRowAndColumnElementTwo + elementsPerRowAndColumnElementOne) * (entity.width);
        var totalHeightOfElements = Math.max(elementsPerColumnElementOne, elementsPerColumnElementTwo);

        var OffsetToMidOfElementsX = totalWidthOfElements/2;
        var OffsetToMidOfElementsY = totalHeightOfElements/2;

        var member;
        for(i = 0; i < elementOneElements.length; i++) {
            member = elementOneElements[i];  
            member.groupId = i;

            // Sorry about splitting the function up on serveral lines
            if(centerY) {
                member.setPosition
                (
                    (upperLeftMostMemberX + Math.floor(i % elementsPerRowAndColumnElementOne) * (member.width))-OffsetToMidOfElementsX, 
                    upperLeftMostMemberY + Math.floor(i / elementsPerRowAndColumnElementOne) * (member.height)-OffsetToMidOfElementsY
                );
            } else {
                member.setPosition
                (
                    (upperLeftMostMemberX + Math.floor(i % elementsPerRowAndColumnElementOne) * (member.width))-OffsetToMidOfElementsX, 
                    upperLeftMostMemberY + Math.floor(i / elementsPerRowAndColumnElementOne) * (member.height)
                );
            }
        }

        for (i = 0; i < elementTwoElements.length; i++) {
            member = elementTwoElements[i];  

            // Sorry about splitting the function up to serveral lines
            if(centerY) {
                member.setPosition(
                    (upperLeftMostMemberX + (Math.floor(i % elementsPerRowAndColumnElementTwo) + elementsPerRowAndColumnElementOne) * (member.width))-OffsetToMidOfElementsX, 
                    upperLeftMostMemberY + Math.floor(i / elementsPerRowAndColumnElementTwo)  * (member.height)-OffsetToMidOfElementsY
                );
            } else {
                member.setPosition(
                    (upperLeftMostMemberX + (Math.floor(i % elementsPerRowAndColumnElementTwo) + elementsPerRowAndColumnElementOne) * (member.width))-OffsetToMidOfElementsX, 
                    upperLeftMostMemberY + Math.floor(i / elementsPerRowAndColumnElementTwo)  * (member.height)
                );
            }
        }
    };
    ns.move = function(array, old_index, new_index) {
        if(new_index >= array.length) {
            var k = new_index - array.length;
            while ((k--) + 1) {
                array.push(undefined);
            }
        }
        array.splice(new_index, 0, array.splice(old_index, 1)[0]);
    };
})(window.mt.lemons);


// function loadXMLDoc(XMLname)
// {
// 	var xmlDoc;
// 	if (window.XMLHttpRequest)
// 	{
// 		xmlDoc=new window.XMLHttpRequest();
// 		xmlDoc.open("GET",XMLname,false);
// 		xmlDoc.send("");
// 		return xmlDoc.responseXML;
// 	}
// 	// IE 5 and IE 6
// 	else if (ActiveXObject("Microsoft.XMLDOM"))
// 	{
// 		xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
// 		xmlDoc.async=false;
// 		xmlDoc.load(XMLname);
// 		return xmlDoc;
// 	}

// 	alert("Error loading document!");
// 	return null;
// }

// function loadTextByTag(xmlDoc, tag)
// {
// 	return xmlDoc.getElementsByTagName(tag)[0].textContent;
// }

// var Reflector = function(obj) 
// {
// 	this.getProperties = function() 
//   	{
//     	var properties = [];

// 	    for (var prop in obj) 
// 	    {
// 	    	if(typeof obj[prop] != 'function') 
// 	      	{
// 	        	properties.push(prop);
// 	      	}
// 	    }
//     	return properties;
//   };
// }



(function (ns) {
    'use strict';

    angular.module('mtLemons').controller('LemonsCtrl', function ($scope, toolPersistorService, $timeout) {

        ns.CONFIG = {
            SCALE: 3/4,
            WIDTH: 1024,
            HEIGHT: 768,
            WORKSPACESTART: 108,
            WORKSPACEEND: 624,
            ELEMENTS_PER_ROW: 4,
            elementWidth: 48,
            elementHeight: 48,
            elementOneName: 'cup',
            elementTwoName: 'lemon',
            elementOnePicture: 'water.png',
            elementTwoPicture: 'lemon.png',
            backgroundImage: 'bg.jpg',
            resultsBackgroundImage1: 'endBgtoMuch.jpg',
            resultsBackgroundImage2: 'endBgnotEnnough.jpg',
            resultsBackgroundImage3: 'endBgJustRight.jpg',
            elementOneOriginalCount: 12,
            elementTwoOriginalCount: 8,
            maxGroupSize: 160,
            maxElementCount: 320,
            IOSFontName: 'HelveticaNeue',
            IOSFontNameBold: 'HelveticaNeue',
            AndroidFontName: 'Arial',
            AndroidFontNameBold: 'Arial Black',

            // Displayed strings
            HEADER_MSG_LINE_1: 'Help us make a batch of lemonade that tastes the same as:',
            HEADER_MSG_LINE_2: '',
            HEADER_MSG_LINE_3: '',

            //Colors
            MIX_RATIO_GRADIENT_START: 'rgb(164, 255, 250)',
            MIX_RATIO_GRADIENT_MID: 'rgb(248, 248, 147)',
            MIX_RATIO_GRADIENT_END: 'rgb(255, 204, 33)'

        };

        $scope.BACKGROUND_STATE = {
            NORMAL : 0,
            RESULT1 : 1,
            RESULT2 : 2,
            RESULT3 : 3
        };

        $scope.backgroundState = -1;

        $scope.RATIO = null;
        $scope.currentWidth = null;
        $scope.currentHeight = null;
        $scope.canvas = null;
        $scope.backgroundCanvas = null;
        $scope.backgroundImage = new Image();
        $scope.backgroundImageReady = false;
        $scope.resultsBackgroundImage1 = new Image();
        $scope.resultsBackgroundImage2 = new Image();
        $scope.resultsBackgroundImage3 = new Image();

        // The html5 canvas 2d context for drawing
        $scope.ctx = null;
        $scope.backgroundCtx = null;

        $scope.scale = 1;
        $scope.offset = {top: 0, left: 0};

        $scope.elementOneOriginalCount = ns.CONFIG.elementOneOriginalCount;
        $scope.elementTwoOriginalCount = ns.CONFIG.elementTwoOriginalCount;

        // separated from above so we can reset the values without reloading the app
        $scope.initValues = function(){
            // Keeps track of how many of each type of elements there are in the recipe area, changes to these values
            // will be reflected in the ui.
            $scope.elementOneCount = 0;
            $scope.elementTwoCount = 0;

            // A small cache used to same the element counts when doing the final animations (Blending)
            // The blending event will decrement the original values of elementOneCount and elementTwoCount
            // So the 'user recipe' values are saved here
            $scope.elementOneCountCache = 0;
            $scope.elementTwoCountCache = 0;

            // The initial factory for each type.
            // These factories are used for reference and is cloned later when multiple factories are needed
            $scope.elementOneFactory = null;
            $scope.elementTwoFactory = null;

            // Collection that keeps the factories that 'makes' new elements
            $scope.elementOneFactories = [];
            $scope.elementTwoFactories = [];
            $scope.elementCupFactories = [];
            $scope.elementLemonFactories = [];
            $scope.activeFactories = [];
            $scope.inActiveElementOneFactories = [];
            $scope.inActiveElementTwoFactories = [];
            $scope.inActiveElementCupFactories = [];
            $scope.inActiveElementLemonFactories = [];

            $scope.mixRatio = 0;
            $scope.originalElementRatio = 0;
            $scope.mixStarting = false;
            $scope.mixStarted = false;
            $scope.showMixRatio = false;
            $scope.flexiblePane = null;

            $scope.userRecipeElementOneMiniatures = [];
            $scope.userRecipeElementTwoMiniatures = [];

            // Collection that keeps all moveableObjects i.e. all lemons / water glasses (elements)
            $scope.moveableObjects = [];

            // Collection that keeps all interface elements, i.e. things that are not movable
            $scope.interfaceElements = [];

            $scope.TextElements = null;
            $scope.testRecipeButton = null;

            $scope.elementOneOriginalMiniatures = [];
            $scope.elementTwoOriginalMiniatures = [];

            $scope.isSelecting = false;
            $scope.isSelectingEnded = true;
            $scope.currentSelection = [];
            $scope.currentDialog = null;
            $scope.rightNumberPad = null;
            $scope.leftNumberPad = null;
            $scope.cupNumberPad = null;
            $scope.lemonNumberPad = null;
            $scope.newPossibleGroup = null;

            // Coordinates needed to display the lasso
            $scope.lassoX = [];
            $scope.lassoY = [];
            $scope.lastLassoX = 0;
            $scope.lastLassoY = 0;

            $scope.movingEntity = null;
            $scope.checkCollision = false;

            // Need to display the auto finish of the 'lasso'
            $scope.needsDraw = false;

            // A reference to the blender object for the end animation
            $scope.blender = null;
            // A reference to the ratio bar used for in the end
            $scope.ratioBar = null;
            // An integer used for the end animation to keep a count how many animation are running
            $scope.animationsRunning = 0;
        };


        $scope.loadLessons = function() {
            $scope.lessons = [
                {
                    cups: 5,
                    lemons: 5
                },
                {
                    cups: 8,
                    lemons: 12
                },
                {
                    cups: 1,
                    lemons: 2
                },
                {
                    cups: 5,
                    lemons: 3
                },
                {
                    cups: 20,
                    lemons: 13
                },
                {
                    cups: 7,
                    lemons: 12
                }
            ];
            $scope.setLesson(0);
        };

        $scope.setLesson = function(lesson) {
            $scope.currentLesson = lesson;
            if ($scope.currentLesson >= $scope.lessons.length) {
                $scope.currentLesson = $scope.lessons.length - 1;
            } else if ($scope.currentLesson < 0) {
                $scope.currentLesson = 0;
            }
            $scope.elementOneOriginalCount = $scope.lessons[$scope.currentLesson].cups;
            $scope.elementTwoOriginalCount = $scope.lessons[$scope.currentLesson].lemons;
        };

        $scope.init = function () {
            //var xmlDoc;

            //xmlDoc = loadXMLDoc('data.xml');
            //$scope.loadXMLElements(xmlDoc);
            $scope.initValues();
            // future functionality
            // $scope.loadLessons();

            $scope.backgroundImage.onload = function() {
                $scope.backgroundImageReady = true;
            };

            $scope.backgroundImage.src = 'lemons/img/' + ns.CONFIG.backgroundImage;
            $scope.resultsBackgroundImage1.src = 'lemons/img/' + ns.CONFIG.resultsBackgroundImage1;
            $scope.resultsBackgroundImage2.src = 'lemons/img/' + ns.CONFIG.resultsBackgroundImage2;
            $scope.resultsBackgroundImage3.src = 'lemons/img/' + ns.CONFIG.resultsBackgroundImage3;

            $scope.RATIO = ns.CONFIG.WIDTH / ns.CONFIG.HEIGHT;
            $scope.currentWidth = ns.CONFIG.WIDTH;
            $scope.currentHeight = ns.CONFIG.HEIGHT;

            if($scope.canvas === null || $scope.canvas === undefined) {
                console.log('canvas null');
            }
            if($scope.backgroundCanvas === null || $scope.backgroundCanvas === undefined) {
                console.log('background canvas null');
            }

            $scope.canvas.width = ns.CONFIG.WIDTH;
            $scope.canvas.height = ns.CONFIG.HEIGHT;
            $scope.backgroundCanvas.width = ns.CONFIG.WIDTH;
            $scope.backgroundCanvas.height = ns.CONFIG.HEIGHT;
            $scope.ctx = $scope.canvas.getContext('2d');
            $scope.backgroundCtx = $scope.backgroundCanvas.getContext('2d');

            $scope.ua = navigator.userAgent.toLowerCase();
            $scope.android = ($scope.ua.indexOf('android') > -1);
            $scope.ios = ($scope.ua.indexOf('iphone') > -1 || $scope.ua.indexOf('ipad') > -1 ||
                $scope.ua.indexOf('ipod') > -1);

            $scope.resize();
            ns.FlDraw.clear($scope.ctx);
            ns.FlDraw.clear($scope.backgroundCtx);
            // Create two reference factories and clone them. The clones are used as the first factorie and the original is kept as
            $scope.elementOneFactory = new ns.FlMoveableObject(this, $scope.ctx, ns.CONFIG.elementOneName, ns.CONFIG.elementOnePicture, 221-(ns.CONFIG.elementWidth/2), 670, ns.CONFIG.elementWidth, ns.CONFIG.elementHeight);//was 24,630
            $scope.elementOneFactory.isInterfaceElement = true;
            var clone = $scope.elementOneFactory.clone();
            $scope.elementOneFactories.push(clone);
            $scope.activeFactories.push(clone);
            $scope.elementTwoFactory = new ns.FlMoveableObject(this, $scope.ctx, ns.CONFIG.elementTwoName, ns.CONFIG.elementTwoPicture, 803-(ns.CONFIG.elementWidth/2), 670, ns.CONFIG.elementWidth, ns.CONFIG.elementHeight);//698,630
            $scope.elementTwoFactory.isInterfaceElement = true;
            clone = $scope.elementTwoFactory.clone();
            $scope.elementTwoFactories.push(clone);
            $scope.activeFactories.push(clone);

            var counter;
            for(counter = 0; counter < 9; counter++) {
                $scope.inActiveElementOneFactories.push($scope.elementOneFactory.clone());
                $scope.inActiveElementTwoFactories.push($scope.elementTwoFactory.clone());
            }
            var app = this;

            var elementOneFactoryManager = new ns.FlButton(this, $scope.ctx, 15, 669, 93, 53, '', '', 0, '#fff', function() {
                $scope.removeDialog();
                $scope.clearSelection();

                if($scope.rightNumberPad !== null) {
                    $scope.removeInterfaceElement($scope.rightNumberPad);
                    $scope.rightNumberPad = null;
                }
                if($scope.cupNumberPad !== null) {
                    $scope.removeInterfaceElement($scope.cupNumberPad);
                    $scope.cupNumberPad = null;
                }
                if($scope.lemonNumberPad !== null) {
                    $scope.removeInterfaceElement($scope.lemonNumberPad);
                    $scope.lemonNumberPad = null;
                }

                if($scope.leftNumberPad !== null) {
                    $scope.removeInterfaceElement($scope.leftNumberPad);
                    $scope.leftNumberPad = null;
                } else {
                    $scope.leftNumberPad = new ns.FlNumberPad(app, $scope.ctx, 14, 540, 48, $scope.elementOneFactories.length, function(amount) {
                        var removedItems = $scope.elementOneFactories.splice(0, $scope.elementOneFactories.length);
                        for(counter = 0; counter < removedItems.length; counter++) {
                            $scope.inActiveElementOneFactories.push(removedItems[counter]);
                            $scope.activeFactories.splice($scope.activeFactories.indexOf(removedItems[counter]), 1);
                        }

                        for(counter = 0; counter < amount; counter++) {
                            var factory = $scope.inActiveElementOneFactories.pop();
                            if(factory === undefined) {
                                factory = $scope.elementOneFactory.clone();
                            }
                            $scope.elementOneFactories.push(factory);
                            $scope.activeFactories.push(factory);
                        }

                        ns.orderObjectsByPoint($scope.elementOneFactory.x + (ns.CONFIG.elementWidth/2), $scope.elementOneFactory.y + (ns.CONFIG.elementHeight / 2), $scope.elementOneFactories, true);

                        $scope.leftNumberPad = null;

                    });

                    $scope.addInterfaceElement($scope.leftNumberPad);
                }

                $scope.Input.click = false;

            });

            var elementTwoFactoryManager = new ns.FlButton(this, $scope.ctx, 917, 669, 93, 53, '', '', 0, '#fff', function(){
                $scope.removeDialog();
                $scope.clearSelection();

                if($scope.leftNumberPad !== null) {
                    $scope.removeInterfaceElement($scope.leftNumberPad);
                    $scope.leftNumberPad = null;
                }
                if($scope.cupNumberPad !== null) {
                    $scope.removeInterfaceElement($scope.cupNumberPad);
                    $scope.cupNumberPad = null;
                }
                if($scope.lemonNumberPad !== null) {
                    $scope.removeInterfaceElement($scope.lemonNumberPad);
                    $scope.lemonNumberPad = null;
                }

                if($scope.rightNumberPad !== null) {
                    $scope.removeInterfaceElement($scope.rightNumberPad);
                    $scope.rightNumberPad = null;
                } else {
                    $scope.rightNumberPad = new ns.FlNumberPad(app, $scope.ctx, 755, 540, 950, $scope.elementTwoFactories.length, function(amount)
                    {
                        var removedItems = $scope.elementTwoFactories.splice(0, $scope.elementTwoFactories.length);
                        var counter;
                        for(counter = 0; counter < removedItems.length; counter++)
                        {
                            $scope.inActiveElementTwoFactories.push(removedItems[counter]);
                            $scope.activeFactories.splice($scope.activeFactories.indexOf(removedItems[counter]), 1);
                        }

                        for(counter = 0; counter < amount; counter++)
                        {
                            var factory = $scope.inActiveElementTwoFactories.pop();

                            if(factory === undefined)
                            {
                                factory = $scope.elementTwoFactory.clone();
                            }

                            $scope.elementTwoFactories.push(factory);
                            $scope.activeFactories.push(factory);
                        }

                        ns.orderObjectsByPoint($scope.elementTwoFactory.x+(ns.CONFIG.elementWidth/2), $scope.elementTwoFactory.y+(ns.CONFIG.elementHeight/2), $scope.elementTwoFactories,true);

                        $scope.rightNumberPad = null;


                    });

                    $scope.addInterfaceElement($scope.rightNumberPad);
                }

                $scope.Input.click = false;
            });

            var numOfButtons = 40;

            var elementCupFactoryManager = new ns.FlButton(this, $scope.ctx, 690, 50, 105, 53, '', '', 0, '#fff', function() {
                $scope.removeDialog();
                $scope.clearSelection();

                if($scope.rightNumberPad !== null) {
                    $scope.removeInterfaceElement($scope.rightNumberPad);
                    $scope.rightNumberPad = null;
                }
                if($scope.leftNumberPad !== null) {
                    $scope.removeInterfaceElement($scope.leftNumberPad);
                    $scope.leftNumberPad = null;
                }
                if($scope.lemonNumberPad !== null) {
                    $scope.removeInterfaceElement($scope.lemonNumberPad);
                    $scope.lemonNumberPad = null;
                }

                if($scope.cupNumberPad !== null) {
                    $scope.removeInterfaceElement($scope.cupNumberPad);
                    $scope.cupNumberPad = null;
                } else {
                    $scope.cupNumberPad = new ns.FlNumberPad(app, $scope.ctx, 625, 140, 750, $scope.elementCupFactories.length, function(amount) {
                        $scope.elementOneOriginalCount = amount;
                        $scope.cupNumberPad = null;
                    }, numOfButtons, true);
                    $scope.addInterfaceElement($scope.cupNumberPad);
                }

                $scope.Input.click = false;
            }, undefined, undefined, true);

            var elementLemonFactoryManager = new ns.FlButton(this, $scope.ctx, 855, 50, 105, 53, '', '', 0, '#fff', function() {
                $scope.removeDialog();
                $scope.clearSelection();

                if($scope.rightNumberPad !== null) {
                    $scope.removeInterfaceElement($scope.rightNumberPad);
                    $scope.rightNumberPad = null;
                }
                if($scope.leftNumberPad !== null) {
                    $scope.removeInterfaceElement($scope.leftNumberPad);
                    $scope.leftNumberPad = null;
                }
                if($scope.cupNumberPad !== null) {
                    $scope.removeInterfaceElement($scope.cupNumberPad);
                    $scope.cupNumberPad = null;
                }
                if($scope.lemonNumberPad !== null) {
                    $scope.removeInterfaceElement($scope.lemonNumberPad);
                    $scope.lemonNumberPad = null;
                } else {
                    $scope.lemonNumberPad = new ns.FlNumberPad(app, $scope.ctx, 750, 140, 925, $scope.elementLemonFactories.length, function(amount) {
                        $scope.elementTwoOriginalCount = amount;
                        $scope.lemonNumberPad = null;
                    }, numOfButtons, true);
                    $scope.addInterfaceElement($scope.lemonNumberPad);
                }

                $scope.Input.click = false;
            }, undefined, undefined, true);

            elementOneFactoryManager.visible = false;
            elementTwoFactoryManager.visible = false;
            elementCupFactoryManager.visible = false;
            elementLemonFactoryManager.visible = false;

            elementOneFactoryManager.moveable = false;
            elementTwoFactoryManager.moveable = false;
            elementCupFactoryManager.moveable = false;
            elementLemonFactoryManager.moveable = false;

            elementOneFactoryManager.isInterfaceElement = true;
            elementTwoFactoryManager.isInterfaceElement = true;
            elementCupFactoryManager.isInterfaceElement = true;
            elementLemonFactoryManager.isInterfaceElement = true;

            $scope.interfaceElements.push(elementOneFactoryManager);
            $scope.interfaceElements.push(elementTwoFactoryManager);
            $scope.interfaceElements.push(elementCupFactoryManager);
            $scope.interfaceElements.push(elementLemonFactoryManager);

            $scope.testRecipeButton = new ns.FlButton(app, $scope.ctx, 467, 695, 90, 50, 'Test', 'Recipe', 18, '#0fb5eb',  function()
            {
                if(!$scope.showMixRatio && ($scope.elementOneCount > 0 || $scope.elementTwoCount > 0))
                {
                    $scope.Blend();
                    this.remove = true;
                }

            });

            $scope.testRecipeButton.enabled = false;

            $scope.interfaceElements.push($scope.testRecipeButton);

            // Placing the miniature elements to indicate the original recipe

            var elementOnePositionX = 730, elementOnePositionY = 51, elementTwoPositionX = 906, elementTwoPositionY = 51;
            $scope.elementOneOriginalMiniatures.push(new ns.FlMoveableObject(this, $scope.ctx, 'elementOneMiniature', ns.CONFIG.elementOnePicture, elementOnePositionX, elementOnePositionY, ns.CONFIG.elementWidth, ns.CONFIG.elementHeight));
            $scope.elementTwoOriginalMiniatures.push(new ns.FlMoveableObject(this, $scope.ctx, 'elementTwoMiniature', ns.CONFIG.elementTwoPicture, elementTwoPositionX, elementTwoPositionY, ns.CONFIG.elementWidth,  ns.CONFIG.elementHeight));

            // Early version had some kind of score system? not sure if this should still be here?
            $scope.score = {
                taps: 0,
                hit: 0,
                escaped: 0,
                accuracy: 0
            };

            $scope.Input = new ns.FlInput(this);
            //$scope.Input.setupHook();

            $scope.initTextFields();

            $scope.loop();
        };

        function getTouchXY (e) {
            return [(e.gesture.touches[0].pageX - $($scope.canvas).offset().left) / (ns.CONFIG.SCALE), (e.gesture.touches[0].pageY - $($scope.canvas).offset().top) / (ns.CONFIG.SCALE)];
        }

        $scope.touch = function(e) {
            e.preventDefault();
            $scope.Input.touch(getTouchXY(e));
        };

        $scope.release = function(e) {
            e.preventDefault();
            $scope.Input.release(getTouchXY(e));
        };

        $scope.drag = function(e) {
            e.preventDefault();
            $scope.Input.drag(getTouchXY(e));
        };


        $scope.Blend = function() {
            // Remove elements in the bottom of the screen:
            $scope.activeFactories = [];

            $scope.removeInterfaceElement($scope.TextElements.elementOneTypeNameText);
            $scope.removeInterfaceElement($scope.TextElements.elementTwoTypeNameText);
            $scope.removeInterfaceElement($scope.TextElements.elementOneCountText);
            $scope.removeInterfaceElement($scope.TextElements.elementTwoCountText);

            $scope.originalElementRatio = $scope.elementOneOriginalCount / $scope.elementTwoOriginalCount;
            $scope.ratioBar = new ns.FlRatioBar(this, $scope.ctx, 125.00, 200, 452, 20, $scope.originalElementRatio, $scope.elementOneCount, $scope.elementTwoCount);
            $scope.blender = new ns.FlMoveableObject(this, $scope.ctx, 'blender', 'blender.png', (ns.CONFIG.WIDTH/2)-(274/2), 280, 274, 265, function()
            {

                $scope.blender.setFadeInTime(600, function()
                {
                    var onEndAnimation = function(moveableObject)
                    {
                        moveableObject.remove = true;
                        $scope.animationsRunning--;

                        if($scope.animationsRunning < 2 && !$scope.blender.remove)
                        {
                            $scope.blender.remove = true;

                            for(var j = 0; j < $scope.moveableObjects.length; j++) {
                                if($scope.moveableObjects[j].type === 'mixing'){
                                    $scope.moveableObjects[j].remove = true;
                                }
                            }

                            $scope.showMixRatio = true;
                            $scope.interfaceElements.push(new ns.FlButton(this, $scope.ctx, 467, 695, 90, 50, 'Try', 'Again', 18, '#0fb5eb', function()
                            {
                                $scope.mixStarted = false;
                                $scope.resetTable();
                                //window.location.reload();
                                //this.remove = true;
                            }));

                            $scope.addInterfaceElement($scope.ratioBar);

                            $scope.flexiblePane = new ns.FlFlexiblePane($scope.ctx, 682.00, 133.00, 326.50, 0, 'lemons/img/blueTexture.png', 'lemons/img/blueDottedLine.png', function(elementOneCount, elementTwoCount)
                            {
                                //Create objects to display the users recipe
                                $scope.userRecipeElementOneMiniatures = [];
                                $scope.userRecipeElementTwoMiniatures = [];
                                var miniature;

                                var i, x, y;
                                for(i = 0; i < elementOneCount; i++)
                                {
                                    x = 730  + (20) * Math.floor(i % ns.CONFIG.ELEMENTS_PER_ROW);
                                    y = 200-27  + (20) * Math.floor(i / ns.CONFIG.ELEMENTS_PER_ROW);
                                    miniature = new ns.FlMoveableObject(this, $scope.ctx, 'elementOneMiniature', ns.CONFIG.elementOnePicture, x, y, 20, 20);
                                    miniature.isInterfaceElement = true;
                                    miniature.moveable = false;
                                    $scope.userRecipeElementOneMiniatures.push(miniature);
                                }

                                if(miniature !== null)
                                {
                                    $scope.flexiblePane.minH = (miniature.y - $scope.flexiblePane.y) + miniature.height * 2;
                                }

                                for(i = 0; i < elementTwoCount; i++)
                                {
                                    x = 906  + (20) * Math.floor(i % ns.CONFIG.ELEMENTS_PER_ROW);
                                    y = 200-27  + (20) * Math.floor(i / ns.CONFIG.ELEMENTS_PER_ROW);
                                    miniature = new ns.FlMoveableObject(this, $scope.ctx, 'elementTwoMiniature', ns.CONFIG.elementTwoPicture, x, y, 20, 20);
                                    miniature.isInterfaceElement = true;
                                    miniature.moveable = false;
                                    $scope.userRecipeElementTwoMiniatures.push(miniature);
                                }

                                var newPossibleHeight = (miniature.y - $scope.flexiblePane.y) + miniature.height * 2;

                                if($scope.flexiblePane.minH < newPossibleHeight)
                                {
                                    $scope.flexiblePane.minH = newPossibleHeight;
                                }

                                $scope.flexiblePane.setFadeInTime(600, function()
                                {
                                    // Save the first textrenderable to align the 'your recipe' text to it
                                    var elementCountTextRenderer = new ns.FlText($scope.ctx, 706, 224-27, elementOneCount, false, 18, 'rgba(255,255,255,.85)', true);
                                    elementCountTextRenderer.shadow = {shadowColor: 'rgba(0,0,0,.3)', shadowBlur: 0, shadowOffsetX: -1, shadowOffsetY: -1};
                                    $scope.addInterfaceElement(elementCountTextRenderer);

                                    elementCountTextRenderer = new ns.FlText($scope.ctx, 872, 224-27, elementTwoCount, false, 18, 'rgba(255,255,255,.85)', true);
                                    elementCountTextRenderer.shadow = {shadowColor: 'rgba(0,0,0,.3)', shadowBlur: 0, shadowOffsetX: -1, shadowOffsetY: -1};
                                    $scope.addInterfaceElement(elementCountTextRenderer);

                                    var yourRecipeText = new ns.FlText($scope.ctx, 700, 176-27, 'Your recipe:', false, 12, 'rgba(255,255,255,.85)', false);
                                    yourRecipeText.shadow = {shadowColor: 'rgba(0,0,0,.3)', shadowBlur: 0, shadowOffsetX: -1, shadowOffsetY: -1};
                                    $scope.addInterfaceElement(yourRecipeText);
                                });

                                $scope.addInterfaceElement($scope.flexiblePane);

                            }, $scope.elementOneCountCache, $scope.elementTwoCountCache);
                        }
                    };

                    $scope.elementOneCountCache = $scope.elementOneCount;
                    $scope.elementTwoCountCache = $scope.elementTwoCount;

                    $scope.animationsRunning = 0;

                    var i;
                    for(i = 0; i < $scope.moveableObjects.length; i++)
                    {
                        if($scope.moveableObjects[i].moveable)
                        {
                            $scope.animationsRunning++;
                            $scope.moveableObjects[i].clearRelationships();
                            $scope.moveableObjects[i].animateToPoint($scope.blender.x + $scope.blender.width / 2, ns.CONFIG.HEIGHT / 2, onEndAnimation);
                        }
                    }
                });

                $scope.interfaceElements.push($scope.blender);

            });

            $scope.blender.moveable = false;

            $scope.mixRatio = $scope.elementOneCount / $scope.elementTwoCount;

            $scope.mixStarting = true;
            $scope.mixStarted = true;

        };

        $scope.resetTable = function() {
            $scope.initValues();
            $scope.init();
        };

        // Redraws the lasso (if any) as a part of the main render routine
        $scope.redrawLasso = function() {
            var length = $scope.lassoX.length;

            if(length)
            {
                var context = $scope.ctx;
                // save current context settings - greg
                context.save();
                // set new ones for stroke and fill of lasso - greg
                context.globalAlpha = 1;
                context.strokeStyle = 'rgb(255,255,255)';
                context.fillStyle = 'rgb(152,206,240)';
                context.lineJoin = 'round';
                context.lineWidth = 5;
                // save this set to use later (remove shadows) - greg
                context.save();
                // add shadow to just the stroke - greg
                context.shadowColor = 'rgba(0,0,0,0.3)';
                context.shadowBlur = 1;
                context.shadowOffsetX = 1;
                context.shadowOffsetY = 1;

                var lassoX = $scope.lassoX;
                var lassoY = $scope.lassoY;
                var clickCounter;
                // make white stroke shape with drop shadow - greg
                context.beginPath();
                for(clickCounter = 1; clickCounter < length; clickCounter++) {
                    context.moveTo(lassoX[clickCounter-1], lassoY[clickCounter-1]);
                    context.lineTo(lassoX[clickCounter], lassoY[clickCounter]);
                }
                //context.closePath();
                context.stroke();

                // restore context settings to before shadow - greg
                context.restore();

                // make tansparent blue fill shape - greg
                context.globalAlpha = 0.15;
                context.beginPath();
                for(clickCounter = 1; clickCounter < length; clickCounter++) {
                    context.moveTo(lassoX[clickCounter-1], lassoY[clickCounter-1]);
                    context.lineTo(lassoX[clickCounter], lassoY[clickCounter]);
                    context.lineTo(lassoX[0], lassoY[0]);
                }

                context.closePath();
                context.fill();
                context.restore();
            }
        };

        // Adds a new point for the lasso
        $scope.addLassoPoint = function(x, y) {
            $scope.lassoX.push(x);
            $scope.lassoY.push(y);
            $scope.checkLassoPoints(x, y);

            $scope.lastLassoX = x;
            $scope.lastLassoY = y;
        };

        // Removes the current dialog above elements if any
        $scope.removeDialog = function() {
            if($scope.currentDialog !== null && $scope.currentDialog !== undefined) {
                $scope.removeNumberpads();
                $scope.currentDialog.remove = true;
                $scope.currentDialog = null;
            }
        };

        $scope.removeNumberpads = function() {
            if($scope.leftNumberPad !== null) {
                $scope.removeInterfaceElement($scope.leftNumberPad);
                $scope.leftNumberPad = null;
            }
            if($scope.rightNumberPad !== null) {
                $scope.removeInterfaceElement($scope.rightNumberPad);
                $scope.rightNumberPad = null;
            }
            if($scope.cupNumberPad !== null) {
                $scope.removeInterfaceElement($scope.cupNumberPad);
                $scope.cupNumberPad = null;
            }
            if($scope.lemonNumberPad !== null) {
                $scope.removeInterfaceElement($scope.lemonNumberPad);
                $scope.lemonNumberPad = null;
            }
        };

        // Clears the current selection
        $scope.clearSelection = function() {
            if($scope.currentSelection !== null) {
                for(var j = 0; j < $scope.currentSelection.length; j++) {
                    $scope.currentSelection[j].coSelectedElements = null;
                }
            }

            $scope.currentSelection = [];
        };

        // Gets called upon ending a lasso, resets same state for all elements
        $scope.endLassoing = function() {
            $scope.lastLassoX = 0;
            $scope.lastLassoY = 0;
            $scope.isSelecting = false;

            var moveableObjects = $scope.moveableObjects;
            var moveableObjectCount = moveableObjects.length;

            for(var i = 0; i < moveableObjectCount; i++) {
                moveableObjects[i].isInLassoSelection = false; // this creates a visual flash that deselects them before it reselects them. can we fix this - greg
            }
        };

        // Removes the old dialog and swaps it with its first argument
        $scope.swapDialog = function(newDialog) {
            $scope.removeNumberpads();

            $scope.removeDialog();

            $scope.currentDialog = newDialog;

            $scope.addInterfaceElement(newDialog);
        };

        // This functions uses Point in polygon logic on 4 corners of a rectangle and returns true if atleast 3 corners (points) are within the polygon
        $scope.isWithinAcceptableMarginOfLasso = function (xp, yp, x, y) {
            var elementWidth = ns.CONFIG.elementWidth, elementHeight = ns.CONFIG.elementHeight;
            var cornersWithinLasso = 0;

            var i, j, npol = xp.length, ypi = 0, ypj = 0, xpi = 0, xpj = 0;
            var upperLeftCorner = false, upperRightCorner = false, lowerLeftCorner = false, lowerRightCorner = false;
            x = x + elementWidth / 3; y = y + elementHeight / 3;
            var rightCornersX = x + elementWidth / 3, lowerCornersY = y + elementHeight / 3;

            for (i = 0, j = npol-1; i < npol; j = i++)
            {
                ypi = yp[i];
                ypj = yp[j];
                xpi = xp[i];
                xpj = xp[j];

                if ((((ypi <= y) && (y < ypj)) || ((ypj <= y) && (y < ypi))) && (x < (xpj - xpi) * (y - ypi) / (ypj - ypi) + xpi)) {
                    upperLeftCorner = !upperLeftCorner;
                }
                if ((((ypi <= y) && (y < ypj)) || ((ypj <= y) && (y < ypi))) && (rightCornersX < (xpj - xpi) * (y - ypi) / (ypj - ypi) + xpi)){
                    upperRightCorner = !upperRightCorner;
                }
                if ((((ypi <= lowerCornersY) && (lowerCornersY < ypj)) || ((ypj <= lowerCornersY) && (lowerCornersY < ypi))) && (x < (xpj - xpi) * (lowerCornersY - ypi) / (ypj - ypi) + xpi)){
                    lowerLeftCorner = !lowerLeftCorner;
                }
                if ((((ypi <= lowerCornersY) && (lowerCornersY < ypj)) || ((ypj <= lowerCornersY) && (lowerCornersY < ypi))) && (rightCornersX < (xpj - xpi) * (lowerCornersY - ypi) / (ypj - ypi) + xpi)) {
                    lowerRightCorner = !lowerRightCorner;
                }
            }

            if(upperLeftCorner)
            {
                cornersWithinLasso++;
            }
            if(upperRightCorner)
            {
                cornersWithinLasso++;
            }
            if(lowerLeftCorner)
            {
                cornersWithinLasso++;
            }
            if(lowerRightCorner)
            {
                cornersWithinLasso++;
            }

            return cornersWithinLasso >= 2;
        };

        // Adds an interfaceElement
        $scope.addInterfaceElement = function(newElement) {
            $scope.interfaceElements.push(newElement);
            newElement.onEnter();
        };

        // Adds an interfaceElement
        $scope.addInterfaceElementAtBack = function(newElement) {
            $scope.interfaceElements.unshift(newElement);
            newElement.onEnter();
        };

        // Removes an interface element
        $scope.removeInterfaceElement = function(newElementOrIndex) {
            if(typeof newElementOrIndex === 'number') {
                $scope.interfaceElements[newElementOrIndex].onLeave();
                $scope.interfaceElements.splice(newElementOrIndex, 1);

            } else // Else assume object
            {
                var index = $scope.interfaceElements.indexOf(newElementOrIndex);
                $scope.interfaceElements.splice(index, 1);
                newElementOrIndex.onLeave();
            }
        };

        // Adds a moveable object
        $scope.addMoveableObject = function(newElement) {
            $scope.moveableObjects.push(newElement);
            newElement.onEnter();
        };

        // Removes a moveable object
        $scope.removeMoveableObject = function(newElementOrIndex) {
            if(typeof(newElementOrIndex) === 'number')
            {
                $scope.moveableObjects[newElementOrIndex].onLeave();
                $scope.moveableObjects.splice(newElementOrIndex, 1);
            }
            else // Else assume object
            {
                var index = $scope.moveableObjects.indexOf(newElementOrIndex);
                $scope.moveableObjects.splice(index, 1);
                newElementOrIndex.onLeave();
            }
        };

        // Checks for groups in a selection,
        $scope.checkGroupInSelection = function(group, selection) {
            var entitiesInCommonCount = 0;
            var entity, k;
            for(var j = 0; j < selection.length; j++) {
                entity = selection[j];

                for(k = 0; k < group.length; k++) {
                    if(entity === group[k])
                    {
                        entitiesInCommonCount++;
                    }
                }
            }
            var index;
            // Calculate the percentage of the group in the selection and see if more than 20 % is in the group
            if(entitiesInCommonCount / group.length <= 0.20) {
                // Remove all members of the current group

                for(k = 0; k < group.length; k++) {
                    index = selection.indexOf(group[k]);

                    if(index > -1) {
                        selection[index].isInLassoSelection = false;
                        selection[index].coSelectedElements = null;
                        selection.splice(index, 1);
                    }
                }
            } else {
                // Fill in the remaining of the group
                if(entitiesInCommonCount !== group.length) {

                    for(k = 0; k < group.length; k++) {
                        index = selection.indexOf(group[k]);

                        if(index === -1) {
                            selection.push(group[k]);
                            group[k].coSelectedElements = selection;
                        }
                    }
                }
            }
        };

        $scope.isWithinRecipeArea = function(x, y) {
            if(x > ns.CONFIG.WIDTH - ns.CONFIG.elementWidth) {
                return false;
            } else if(x < 0) {
                return false;
            }

            if(y > ns.CONFIG.WORKSPACEEND - ns.CONFIG.elementHeight) {
                return false;
            } else if(y < ns.CONFIG.WORKSPACESTART) {
                return false;
            }

            return true;
        };

        // Works with a collection of $scope.MoveableObject
        $scope.isCollectionMoreThanHalfOutsideRecipeArea = function(collection) {
            var entity;
            var outsideCount = 0;
            for(var coElementsCounter = 0; coElementsCounter < collection.length; coElementsCounter++)
            {
                entity = collection[coElementsCounter];

                if(entity.y > ns.CONFIG.WORKSPACEEND - ns.CONFIG.elementHeight)
                {
                    outsideCount++;
                }

            }

            if(outsideCount / collection.length > 0.5)
            {
                return true;
            }

            return false;
        };

        $scope.moveElementAndItsCoElementsWithinBound = function(entity, coElements) {
            var outsideEntity, coElementsCounter;

            while(entity.y > ns.CONFIG.WORKSPACEEND - ns.CONFIG.elementHeight) {
                for(coElementsCounter = 0; coElementsCounter < coElements.length; coElementsCounter++) {
                    outsideEntity = coElements[coElementsCounter];
                    outsideEntity.y-= 30;
                }
            }
            while(entity.y < ns.CONFIG.WORKSPACESTART) {
                for(coElementsCounter = 0; coElementsCounter < coElements.length; coElementsCounter++) {
                    outsideEntity = coElements[coElementsCounter];
                    outsideEntity.y+= 30;
                }
            }
            while(entity.x > ns.CONFIG.WIDTH - ns.CONFIG.elementWidth) {
                for(coElementsCounter = 0; coElementsCounter < coElements.length; coElementsCounter++) {
                    outsideEntity = coElements[coElementsCounter];
                    outsideEntity.x-= 20;
                }
            }
            while(entity.x < 0) {
                for(coElementsCounter = 0; coElementsCounter < coElements.length; coElementsCounter++) {
                    outsideEntity = coElements[coElementsCounter];
                    outsideEntity.x+= 20;
                }
            }
        };

        $scope.initTextFields = function() {
            /*
            An empty string indicates that the textual content is changed just before rendering
            */
            $scope.TextElements = {
                headerMSG1: new ns.FlText($scope.ctx, 92, 104-31, ns.CONFIG.HEADER_MSG_LINE_1, false, 18, '#666666', false),
                headerMSG2: new ns.FlText($scope.ctx, 92, 124-31, ns.CONFIG.HEADER_MSG_LINE_2, false, 18, '#666666', false),
                headerMSG3: new ns.FlText($scope.ctx, 92, 144-31, ns.CONFIG.HEADER_MSG_LINE_3, false, 18, '#666666', false),

                originalRecipeText:          new ns.FlText($scope.ctx, 700, 66-31, 'Original recipe'                  , false, 12, '#898989', false),
                elementOneOriginalCountText: new ns.FlText($scope.ctx, 706, 112-31, $scope.elementOneCount, false, 18, '#898989', false),
                elementTwoOriginalCountText: new ns.FlText($scope.ctx, 872, 112-31, $scope.elementTwoCount, false, 18, '#898989', false),

                elementOneTypeNameText: new ns.FlText($scope.ctx, 407, 726, '', false, 20, 'rgba(255,255,255,.85)', false),
                elementTwoTypeNameText: new ns.FlText($scope.ctx, 616, 726, '', false, 20, 'rgba(255,255,255,.85)', false),
                elementOneCountText: new ns.FlText($scope.ctx, 407, 700, '', false, 40, 'rgba(255,255,255,.85)', false),
                elementTwoCountText: new ns.FlText($scope.ctx, 616, 700, '', false, 40, 'rgba(255,255,255,.85)', false),

                yourRecipeText: new ns.FlText($scope.ctx, 362.5, 655, 'Your recipe', false, 12, 'rgba(255,255,255,.85)', false, 'Helvetica Neue'),

                elementOneFactoriesCountText: new ns.FlText($scope.ctx, 48, 708, '', true, 35, '#0fb5eb', false, 'Helvetica Neue'),
                elementTwoFactoriesCountText: new ns.FlText($scope.ctx, 950, 708, '', true, 35, '#0fb5eb', false, 'Helvetica Neue'),

                elementOneFactoriesLable: new ns.FlText($scope.ctx, 221, 755, '', false, 12, '#dedede', false, 'Helvetica Neue'),
                elementTwoFactoriesLable: new ns.FlText($scope.ctx, 803, 755, '', false, 12, '#dedede', false, 'Helvetica Neue')

            };

            // alignment

            //top
            $scope.TextElements.elementOneOriginalCountText.textAlign = 'center';
            $scope.TextElements.elementTwoOriginalCountText.textAlign = 'center';

            //bottom
            $scope.TextElements.elementOneTypeNameText.textAlign = 'center';
            $scope.TextElements.elementTwoTypeNameText.textAlign = 'center';
            $scope.TextElements.elementOneCountText.textAlign = 'center';
            $scope.TextElements.elementTwoCountText.textAlign = 'center';

            $scope.TextElements.elementOneFactoriesCountText.textAlign = 'center';
            $scope.TextElements.elementTwoFactoriesCountText.textAlign = 'center';

            $scope.TextElements.elementOneFactoriesLable.textAlign = 'center';
            $scope.TextElements.elementTwoFactoriesLable.textAlign = 'center';
            // shading

            //top
            $scope.TextElements.elementOneOriginalCountText.shadow = {shadowColor: 'white', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 2};
            $scope.TextElements.elementTwoOriginalCountText.shadow = {shadowColor: 'white', shadowBlur: 0, shadowOffsetX: 0, shadowOffsetY: 2};

            //bottom
            $scope.TextElements.yourRecipeText.shadow = {shadowColor: 'rgba(0,0,0,.3)', shadowBlur: 0, shadowOffsetX: -1, shadowOffsetY: -1};

            $scope.TextElements.elementOneTypeNameText.shadow = {shadowColor: 'rgba(0,0,0,.3)', shadowBlur: 0, shadowOffsetX: -1, shadowOffsetY: -1};
            $scope.TextElements.elementTwoTypeNameText.shadow = {shadowColor: 'rgba(0,0,0,.3)', shadowBlur: 0, shadowOffsetX: -1, shadowOffsetY: -1};
            $scope.TextElements.elementOneCountText.shadow =   {shadowColor: 'rgba(0,0,0,.3)', shadowBlur: 0, shadowOffsetX: -1, shadowOffsetY: -1};
            $scope.TextElements.elementTwoCountText.shadow = {shadowColor: 'rgba(0,0,0,.3)', shadowBlur: 0, shadowOffsetX: -1, shadowOffsetY: -1};

            $scope.TextElements.elementOneFactoriesLable.shadow =  {shadowColor: 'rgba(0,0,0,.2)', shadowBlur: 0, shadowOffsetX: -1, shadowOffsetY: -1};
            $scope.TextElements.elementTwoFactoriesLable.shadow = {shadowColor: 'rgba(0,0,0,.2)', shadowBlur: 0, shadowOffsetX: -1, shadowOffsetY: -1};
        };


        // This function is called on every animation frame request to update the state of the app
        $scope.update = function() {
            $scope.checkCollision = false;
            var wasHandled = false;

            if($scope.Input.tapped) {
                $scope.score.taps++;
                $scope.checkCollision = true;
            }

            var currentInputState = $scope.Input.getCurrentInputState();
            var entity, i;
            if(currentInputState !== null) {
                interfaceLoop:
                for(i = 0; i < $scope.interfaceElements.length; i++) {
                    entity = $scope.interfaceElements[i];
                    entity.update();
                    wasHandled = entity.handleEvent(currentInputState);
                }

                for(i = 0; i < $scope.interfaceElements.length; i++) {
                    if($scope.interfaceElements[i].remove) {
                        $scope.removeInterfaceElement(i);
                    }
                }

                // If there a numberpads and the event wasn't handled by an interface element -> remove
                if(!wasHandled && $scope.Input.click) {
                    $scope.removeNumberpads();
                }

                if($scope.checkCollision && !$scope.mixStarted && !wasHandled) {
                    factoriesLoop:
                    for(i = $scope.activeFactories.length - 1; i >= 0; i--) {
                        entity = $scope.activeFactories[i];

                        switch(entity.type)
                        {
                            case ns.CONFIG.elementOneName:
                            case ns.CONFIG.elementTwoName:
                            {
                                if(entity.collides(currentInputState))
                                {
                                    //Remove numberpads if a drag is started
                                    $scope.removeNumberpads();

                                    var firstNewElement = (entity.create(1));
                                    firstNewElement.moving = true;

                                    $scope.movingEntity = firstNewElement;
                                    $scope.addMoveableObject(firstNewElement);

                                    var factories = (entity.type === ns.CONFIG.elementOneName ? $scope.elementOneFactories : $scope.elementTwoFactories);

                                    //If there's more than one factory then this will be a selection
                                    if(1 < factories.length)
                                    {
                                        $scope.clearSelection();

                                        $scope.currentSelection.push(firstNewElement);
                                        firstNewElement.coSelectedElements = $scope.currentSelection;

                                        for(var j = 0; j < factories.length; j++)
                                        {
                                             if(entity !== factories[j])
                                             {
                                                var newElement = (factories[j].create(1));
                                                newElement.isFollowing = true;

                                                $scope.addMoveableObject(newElement);

                                                $scope.currentSelection.push(newElement);
                                                newElement.coSelectedElements = $scope.currentSelection;
                                                newElement.onStartDrag();
                                             }
                                        }
                                    }

                                    firstNewElement.onStartDrag();

                                    wasHandled = true;
                                    break factoriesLoop;
                                }

                                break;
                            }
                        }


                    }
                }
                // If it wasn't handled by the interface...
                if(!wasHandled) {
                    if($scope.movingEntity !== null && $scope.movingEntity !== undefined) {
                        entity = $scope.movingEntity;
                        if(entity.update())
                        {
                            wasHandled = this.dispatchEvent(entity);
                        }
                    } else {
                        for(i = $scope.moveableObjects.length - 1; i >= 0; i--) {
                            entity = $scope.moveableObjects[i];

                            if(entity.update() && this.dispatchEvent(entity)) {
                                wasHandled = true;
                                break;
                            }
                        }
                    }
                }

                if($scope.Input.click) {
                    if(!wasHandled) {
                        // If a click is not handled remove current selection and dialog
                        if($scope.currentDialog !== null) {
                            $scope.removeDialog();
                        }

                        $scope.clearSelection();

                        // Remove the numberpads if they are there
                        if($scope.leftNumberPad !== null) {
                            $scope.removeInterfaceElement($scope.leftNumberPad);
                            $scope.leftNumberPad = null;
                        }
                        if($scope.rightNumberPad !== null) {
                            $scope.removeInterfaceElement($scope.rightNumberPad);
                            $scope.rightNumberPad = null;
                        }
                    }

                    $scope.Input.click = false;
                }
            }

            if($scope.Input.down && $scope.movingEntity === null && $scope.isSelectingEnded && !$scope.isSelecting)
            {
                if(!wasHandled && $scope.Input.y < ns.CONFIG.WORKSPACEEND && $scope.Input.y > ns.CONFIG.WORKSPACESTART)
                {
                    $scope.isSelecting = true;
                    $scope.removeNumberpads();
                    $scope.clearSelection();
                }

                $scope.isSelectingEnded = false;
            }

            if($scope.Input.up) {
                // Reset movingEntity
                $scope.movingEntity = null;

                if(($scope.isSelecting) && $scope.lassoX.length > 0)
                {
                    // The selection has ended! Clear the old selection!
                    $scope.clearSelection();

                    //Determine if we need to complete the lasso!
                    var lassoX = $scope.lassoX;
                    var lassoY = $scope.lassoY;

                    for(i = 0; i < $scope.moveableObjects.length; i++)
                    {
                        entity = $scope.moveableObjects[i];
                        entity.coSelectedElements = null;

                        if(entity.placed /*&& !entity.isFollowing*/)
                        {
                            if($scope.isWithinAcceptableMarginOfLasso(lassoX, lassoY, entity.x, entity.y))
                            {
                                $scope.currentSelection.push(entity);
                                entity.coSelectedElements = $scope.currentSelection;
                            }
                        }
                    }

                    // Check if there are half groups included
                    var lastGroup = null;
                    var currentGroup;
                    for(i = 0; i < $scope.currentSelection.length; i++)
                    {
                        entity = $scope.currentSelection[i];
                        currentGroup = entity.group;

                        if(currentGroup !== null)
                        {
                            if(lastGroup === null)
                            {
                                lastGroup = currentGroup;
                            }
                            else
                            {
                                if(currentGroup === lastGroup)
                                {
                                    continue;
                                }
                                else
                                {
                                    // Find out how many members the selection and the group have in common
                                    $scope.checkGroupInSelection(lastGroup, $scope.currentSelection);

                                    lastGroup = currentGroup;
                                }
                            }

                        }
                    }

                    if(lastGroup !== null)
                    {
                        $scope.checkGroupInSelection(lastGroup, $scope.currentSelection);
                    }

                    $scope.removeDialog();

                    if($scope.currentDialog === null && $scope.currentSelection !== null && $scope.currentSelection.length > 0) {
                        $scope.swapDialog(new ns.FlGroupDialog(this, $scope.ctx, $scope.currentSelection));

                        $scope.movingEntity = null;
                    }

                    //The selection has ended:
                    $scope.endLassoing();

                    $scope.lassoX = [];
                    $scope.lassoY = [];
                    //}
                }
                /*
                if($scope.completeLassoCounter === 1)
                {
                    $scope.completeLassoCounter = 0;
                }
                */
                $scope.isSelectingEnded = true;
            }

            if($scope.Input.tapped)
            {
                $scope.Input.tapped = false;
            }
        };

        $scope.dispatchEvent = function(entity) {
            if(this.mixStarting) {
                // Clear the selection dialog... we don't it to follow the animation
                $scope.removeDialog();

                if(entity.type.indexOf('_obj') > -1 && !entity.moveToCenter)
                {
                    this.mixStarting = false;
                }
            } else {
                var currentInputState = $scope.Input.getCurrentInputState();

                switch(entity.type) {
                    case  ns.CONFIG.elementOneName + '_obj':
                    case  ns.CONFIG.elementTwoName + '_obj':
                    {
                        if(entity.collides(currentInputState)) {
                            if(this.checkCollision && !entity.moving) {
                                //Remove numberpads if a drag is started
                                $scope.removeNumberpads();

                                entity.moving = true;

                                var currentIndex;
                                var moveableObjects = $scope.moveableObjects;

                                entity.invokeOnThisOrFollowersOneByOne(function(currentEntity, followers)
                                {
                                    currentEntity.onStartDrag();

                                    // Put the current object on top
                                    currentIndex = moveableObjects.indexOf(currentEntity);
                                    moveableObjects.splice(currentIndex, 1);
                                    moveableObjects.push(currentEntity);
                                });
                            }

                            if($scope.Input.click)
                            {
                                if(entity.onEvent(currentInputState))
                                {
                                    $scope.Input.click = false;
                                    return true;
                                }
                            }
                        }
                        if(this.Input.down && entity.moving)
                        {
                            if(entity.onEvent(currentInputState))
                            {
                                return true;
                            }
                        } else {
                            // If an entity is moved outside the recipe area, remove it !
                            if(entity.y > ns.CONFIG.WORKSPACEEND - ns.CONFIG.elementHeight)
                            {
                                entity.invokeOnThisOrFollowers(function(followers) {
                                    if($scope.isCollectionMoreThanHalfOutsideRecipeArea(followers)) {
                                        for(var coElementsCounter = 0; coElementsCounter < followers.length; coElementsCounter++) {
                                            followers[coElementsCounter].remove = true;
                                        }
                                    } else {
                                        $scope.moveElementAndItsCoElementsWithinBound(entity, followers);
                                    }
                                });

                                $scope.movingEntity = null;

                            }

                            if($scope.Input.up) {
                                if(entity.moving) {
                                    // Don't move back if this entity is about to get removed.
                                    // If it were not for this check a graphical problem where, the entity would
                                    // flash in place and then get removed, would occur.
                                    if(!entity.remove) {
                                        var shouldMoveBack = false;

                                        entity.invokeOnThisOrFollowersOneByOne(function(currentEntity, followers) {
                                            if(currentEntity.centerWhenDragging) {
                                                if(!$scope.isWithinRecipeArea(currentEntity.x - currentEntity.width / 2, currentEntity.y - currentEntity.height / 2)) {
                                                    shouldMoveBack = true;
                                                    return;
                                                }
                                            } else {
                                                if(!$scope.isWithinRecipeArea(currentEntity.x, currentEntity.y)) {
                                                    shouldMoveBack = true;
                                                    return;
                                                }
                                            }
                                        });

                                        entity.invokeOnThisOrFollowersOneByOne(function(currentEntity, followers) {
                                            currentEntity.onEndDrag();

                                            if(shouldMoveBack) {
                                                $scope.moveElementAndItsCoElementsWithinBound(currentEntity, followers);
                                            }

                                        });
                                    }

                                    $scope.newPossibleGroup = null;
                                    entity.moving = false;
                                }

                                // If its a new entity that has yet to be placed, place it
                                if(!entity.placed) {
                                    entity.placed = true;

                                    // Maintain the element count
                                    if((entity.type.indexOf(ns.CONFIG.elementOneName) > -1)) {
                                        this.elementOneCount++;
                                    } else {
                                        this.elementTwoCount++;
                                    }

                                    if(this.elementOneCount + this.elementTwoCount > ns.CONFIG.maxElementCount) {
                                        entity.remove = true;
                                    }
                                    // greg fix on kim note
                                    if(this.elementOneCount > 0 && this.elementTwoCount > 0) {
                                        $scope.testRecipeButton.enabled = true;
                                    }
                                }
                                $scope.movingEntity = null;
                                entity.isFollowing = false;
                            }
                        }

                        break;
                    }
                    default:
                    {
                        // If there's something that doesn't belong here.. remove it
                        entity.remove = true;
                        break;
                    }
                }
            }

            return false;
        };

        $scope.render = function() {
            ns.FlDraw.clear($scope.ctx);

            //change from original: The background is always the 'normal state'
            $scope.backgroundState = $scope.BACKGROUND_STATE.NORMAL;
            $scope.backgroundCtx.drawImage($scope.backgroundImage, 0, 0, ns.CONFIG.WIDTH, ns.CONFIG.HEIGHT);

            // question text render - greg
            $scope.TextElements.headerMSG1.render();
            $scope.TextElements.headerMSG2.render();
            $scope.TextElements.headerMSG3.render();

            $scope.TextElements.originalRecipeText.render();
            $scope.TextElements.elementOneOriginalCountText.text = $scope.elementOneOriginalCount;
            $scope.TextElements.elementOneOriginalCountText.render();
            $scope.TextElements.elementTwoOriginalCountText.text = $scope.elementTwoOriginalCount;
            $scope.TextElements.elementTwoOriginalCountText.render();

            // The following textelements should only be drawn when the user is creating a new recipe
            if(!$scope.showMixRatio)
            {
                // cups mixingCounter   render - greg
                var text = ns.capitaliseFirstLetter(ns.CONFIG.elementOneName) + ($scope.elementOneCount > 1 || $scope.elementOneCount === 0 ? 's' : '');
                $scope.TextElements.elementOneTypeNameText.text = text;
                $scope.TextElements.elementOneTypeNameText.render();

                text = ns.capitaliseFirstLetter(ns.CONFIG.elementTwoName) + ($scope.elementTwoCount > 1 || $scope.elementTwoCount === 0 ? 's' : '');
                $scope.TextElements.elementTwoTypeNameText.text = text;
                $scope.TextElements.elementTwoTypeNameText.render();

                $scope.TextElements.elementOneCountText.text = $scope.elementOneCount > -1 ? $scope.elementOneCount : 0;
                $scope.TextElements.elementOneCountText.render();

                $scope.TextElements.elementTwoCountText.text = $scope.elementTwoCount > -1 ? $scope.elementTwoCount : 0;
                $scope.TextElements.elementTwoCountText.render();

                // 'your recipe' header render - greg
                $scope.TextElements.yourRecipeText.render();

                // factory text render - greg
                $scope.TextElements.elementOneFactoriesCountText.text = $scope.elementOneFactories.length.toString();
                $scope.TextElements.elementOneFactoriesCountText.render();

                $scope.TextElements.elementTwoFactoriesCountText.text = $scope.elementTwoFactories.length.toString();
                $scope.TextElements.elementTwoFactoriesCountText.render();

                text = ns.capitaliseFirstLetter(ns.CONFIG.elementOneName) + ' Supply';
                $scope.TextElements.elementOneFactoriesLable.text = text;
                $scope.TextElements.elementOneFactoriesLable.render();

                text = ns.capitaliseFirstLetter(ns.CONFIG.elementTwoName) + ' Supply';
                $scope.TextElements.elementTwoFactoriesLable.text = text;
                $scope.TextElements.elementTwoFactoriesLable.render();
            }

            // Go through all other objects and draw them as well
            var i;

            for(i = 0; i < $scope.activeFactories.length; i++) {
                $scope.activeFactories[i].render();
            }
            for(i = 0; i < $scope.elementOneOriginalMiniatures.length; i++)
            {
                $scope.elementOneOriginalMiniatures[i].render();
            }
            for(i = 0; i < $scope.elementTwoOriginalMiniatures.length; i++)
            {
                $scope.elementTwoOriginalMiniatures[i].render();
            }

            for(i = 0; i < $scope.moveableObjects.length; i++) {
                $scope.moveableObjects[i].render();
            }

            for(i = 0; i < $scope.interfaceElements.length; i++) {
                $scope.interfaceElements[i].render();
            }

            for(i = 0; i < $scope.userRecipeElementOneMiniatures.length; i++) {
                $scope.userRecipeElementOneMiniatures[i].render();
            }

            for(i = 0; i < $scope.userRecipeElementTwoMiniatures.length; i++) {
                $scope.userRecipeElementTwoMiniatures[i].render();
            }

            if($scope.isSelecting && !$scope.mixStarted) {
                $scope.redrawLasso();
            }

        };

        $scope.loop = function() {
            window.requestAnimationFrame($scope.loop);

            $scope.update();
            $scope.render();
        };

        $scope.resize = function() {
            //var landscape = (window.orientation % 180 !== 0);

            $scope.currentHeight = $($scope.element).height();//window.innerHeight;
            $scope.currentWidth = $scope.currentHeight * $scope.RATIO;

            // if($scope.android || $scope.ios) {
            //     document.body.style.height = (window.innerHeight + 50) + 'px';
            // }

            $scope.canvas.style.width = $scope.currentWidth + 'px';
            $scope.canvas.style.height = $scope.currentHeight + 'px';
            $scope.backgroundCanvas.style.width = $scope.currentWidth + 'px';
            $scope.backgroundCanvas.style.height = $scope.currentHeight + 'px';
            //window.setTimeout(function() { window.scrollTo(0, 1); }, 1);
            //NO NO NO NO NO
            //$scope.canvas.style.left =           (((+window.innerWidth) - (+$scope.currentWidth)) / 2) + 'px';
            //$scope.backgroundCanvas.style.left = (((+window.innerWidth) - (+$scope.currentWidth)) / 2) + 'px';
            //$scope.canvas.style.top =            (((+window.innerHeight) - (+$scope.currentHeight)) / 2) + 'px';
            //$scope.backgroundCanvas.style.top =  (((+window.innerHeight) - (+$scope.currentHeight)) / 2) + 'px';

            $scope.scale = $scope.currentWidth / ns.CONFIG.WIDTH;
            //MORE NO!!!!
            //$scope.offset.top = $scope.canvas.offsetTop;
            //$scope.offset.left = $scope.canvas.offsetLeft;
        };

        $scope.checkLassoPoints = function(newX, newY) {
            var entity;
            var moveableObjects = $scope.moveableObjects;
            var moveableObjectCount = $scope.moveableObjects.length;

            for(var i = 0; i < moveableObjectCount; i++) {
                entity = moveableObjects[i];
                entity.isInLassoSelection = $scope.isWithinAcceptableMarginOfLasso($scope.lassoX, $scope.lassoY, entity.x, entity.y);

                if(entity.isInLassoSelection && $scope.currentSelection.length !== 0) {
                    $scope.clearSelection();
                }
            }
        };

        $scope.serialize = function () {
            var data = {
                currentWidth: $scope.currentWidth,
                moveableObjects: [],
                elementOneOriginalCount: $scope.elementOneOriginalCount,
                elementTwoOriginalCount: $scope.elementTwoOriginalCount
            };
            var groupArray = [];

            for (var i in $scope.moveableObjects) {

                //serialize groups
                var obj = $scope.moveableObjects[i];
                var found = false;

                if(obj.group !== null) {
                    for (var g = 0; g < groupArray.length; g++) {
                        var currGroup = groupArray[g];
                        if (obj.group === currGroup) {
                            obj.groupNum = g;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        groupArray.push(obj.group);
                        obj.groupNum = groupArray.length - 1;
                    }
                }

                //serialize individual objects
                var moveableObject = $scope.moveableObjects[i].serialize();
                data.moveableObjects.push(moveableObject);
            }

            return data;
        };

        $scope.deserialize = function (data) {
            $scope.currentWidth = data.currentWidth;
            $scope.moveableObjects = [];
            if (data.elementOneOriginalCount !== undefined) {
                $scope.elementOneOriginalCount = data.elementOneOriginalCount;
            }
            if (data.elementTwoOriginalCount !== undefined) {
                $scope.elementTwoOriginalCount = data.elementTwoOriginalCount;
            }

            var groupArray = [];

            for (var i in data.moveableObjects) {
                var item = data.moveableObjects[i];
                var moveableObject = new ns.FlMoveableObject($scope, $scope.ctx, item.type, item.path, item.posX, item.posY, item.width, item.height);

                moveableObject.deserialize(data.moveableObjects[i]);
                $scope.moveableObjects.push(moveableObject);

                var obj = $scope.moveableObjects[i];

                //restore object counts
                if(obj.type === 'cup_obj') {
                    $scope.elementOneCount++;
                } else {
                    $scope.elementTwoCount++;
                }

                $scope.testRecipeButton.enabled = true;

                //restore groups
                var found = false;

                if (obj.groupNum !== undefined) {
                    for (var j = 0; j < groupArray.length; j++) {
                        var currObj = groupArray[j];
                        if (obj.groupNum === currObj.groupNum) {
                            groupArray.push(obj);
                            found = true;
                            currObj.group = groupArray;
                            obj.group = groupArray;
                            break;
                        }
                    }
                    if(!found) {
                        groupArray = [];
                        groupArray.push(obj);
                    }
                }
            }
        };
        toolPersistorService.registerTool($scope.toolId, mt.common.TYPE_LEMONS, $scope.containerApi, $scope.serialize, $scope.deserialize);
    });
})(window.mt.lemons);

(function (ns) {
    'use strict';

    /* Directives */

    angular.module('mtLemons').directive('mtLemonsTool', function() {
        return {
            restrict            : 'E',
            templateUrl         : 'templates/lemonsToolTemplate.html',
            scope               : {
                toolId: '=',
                containerApi: '='
            },
            controller          : 'LemonsCtrl',
            link: function (scope, element) {
                scope.element = $(element).find('.mt-lemons-and-cups')[0];
                scope.backgroundCanvas = $(element).find('.mt-lemons-background-canvas')[0];
                scope.canvas = $(element).find('.mt-lemons-canvas')[0];
                scope.init();
            }
        };
    });

})(window.mt.lemons);
angular.module('mtLemons').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/lemonsToolTemplate.html',
    "<div class=mt-lemons-and-cups hm-touch=touch($event) hm-release=release($event) hm-drag=drag($event)><canvas class=mt-lemons-canvas>Error drawing canvas</canvas><canvas class=mt-lemons-background-canvas>Error drawing the background canvas</canvas></div>"
  );

}]);
