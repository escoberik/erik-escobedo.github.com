

if (!window.mt) {
    window.mt = {};
}

window.mt.classband = {};
angular.module('mtClassBand', ['mt.common']);


(function () {
    'use strict';

    if (!window.mt) {
        window.mt = {};
    }

    if (!window.mt.classband) {
        window.mt.classband = {};
    }

    angular.module('mtClassBand', ['mt.common', 'ui.bootstrap'])

        .config(function (toolRegistryServiceProvider) {
            var template = {
               id: 'classBandToolbarItem',
               type: mt.common.TYPE_CLASS_BAND,
               displayName: 'Class Band',
               available: true,
               htmlTemplate: '<mt-class-band-tool tool-id="toolId" container-api="containerApi" id="tool-{{toolId}}"></mt-class-band-tool>',
               applet: true
            };
            toolRegistryServiceProvider.addTemplate(template);
        });

    window.mt.loadModules.push('mtClassBand');
})();

(function (ns) {
    'use strict';

    ns.Bar = (function () {

        //constructor function

        function Bar(simpleBeats) {
            if (!(this instanceof Bar)) {
                return new Bar(simpleBeats);
            }

            this.notes = [false, false, false, false, false];
            if (simpleBeats !== undefined) {
                for (var i = 0; i < this.notes.length; i++) {
                    this.notes[i] = simpleBeats[i] === true;
                }
            }
        }

        Bar.prototype.setBarNote = function(note, on) {
            if (note >= 0 && note < this.notes.length) {
                this.notes[note] = on;
            }
        };

        Bar.prototype.getBarNote = function(note) {
            if (note < 0 || note >= this.notes.length) {
                return false;
            }
            return this.notes[note];
        };

        return Bar;
    })();
})(window.mt.classband);
(function (ns) {
    'use strict';

    ns.ClassBand = (function () {

        //constructor function

        function ClassBand(simpleBeats) {
            if (!(this instanceof ClassBand)) {
                return new ClassBand(simpleBeats);
            }

            this.beatTime = 0.0;
            this.lastPlayedBeat = -1;
            this.bars = [];
            this.minBPM = 30;
            this.maxBPM = 660;
            this.BPM = 90;
            this.lastTime = 0;
            this.running = false;
            this.repeat = true;
            this.customBeats = false;

            this.ratioBeat = [2,3,4,1];
            this.bandInstrument = [];
            this.maxInstruments = 4;
            this.loadInstrumentPictures();
            this.gameMode = ns.CLASS_BAND_MODE_PLAY;
            this.currentScreen = ns.CLASS_BAND_SCREEN_MAIN;
            this.unmuteAllChannels();
        }

        ClassBand.prototype.serialize = function () {
            return this;
        };
        ClassBand.prototype.deserialize = function (json) {
            this.BPM = json.BPM;
            this.bandInstrument = json.bandInstrument;
            var bars = [];
            _(json.bars).each(function (jsonBar) {
                var bar = new ns.Bar();
                bar.notes = jsonBar.notes;
                bars.push(bar);
            });
            this.bars = bars;
            this.beatTime = json.beatTime;
            this.currentScreen = json.currentScreen;
            this.customBeats = json.customBeats;
            this.gameMode = json.gameMode;
            this.highlightBeat = json.highlightBeat;
            this.lastPlayedBeat = json.lastPlayedBeat;
            this.lastTime = json.lastTime;
            this.mutedChannel = json.mutedChannel;
            this.ratioBeat = json.ratioBeat;
            this.repeat = json.repeat;
            this.running = false;//json.running;
        };

        ClassBand.prototype.loadInstrumentPictures = function() {
            this.instrumentUrls = [
                'free_bass_drum_img.png',
                'free_snare_drum_01_img.png',
                'free_triangle_img.png',
                'free_cymbal_img.png',
                'free_guitar_img.png',
                'free_flute_img.png',
                'free_piano_img.png',
                'free_snare_drum_02_img.png'


                // 'free_speak_img.png',

                // 'free_drum_img.png',

                // 'free_acordian_img.png',
                // 'free_bagpipe_img.png',
                // 'free_bango_img.png',
                // 'free_bell_img.png',
                // 'free_bongo_img.png',
                // 'free_cat_img.png',
                // 'free_clap_img.png',
                // 'free_dog_img.png',
                // 'free_harp_img.png',
                // 'free_maraca_img.png',
                // 'free_musicnote2_img.png',
                // 'free_musicnote3_img.png',
                // 'free_musicnote4_img.png',
                // 'free_musicnote_img.png',
                // 'free_saxophone_img.png',
                // 'free_tambourine_img.png',
                // 'free_trumpet_img.png'
            ];
        };

        ClassBand.prototype.convertBeatsToBars = function(simpleBeats) {
            var convertedBeats = [];
            for (var i in simpleBeats) {
                var bar = new ns.Bar(simpleBeats[i]);
                convertedBeats.push(bar);
            }
            return convertedBeats;
        };

        ClassBand.prototype.start = function() {
            this.beatTime = 0.0;
            this.lastPlayedBeat = -1;
            this.lastTime = Date.now();
            this.running = true;
        };

        ClassBand.prototype.pause = function() {
            this.running = false;
        };

        ClassBand.prototype.unpause = function() {
            this.running = true;
            this.lastTime = Date.now();
        };

        ClassBand.prototype.stop = function() {
            this.running = false;
            this.beatTime = 0.0;
            this.lastPlayedBeat = -1;
        };

        ClassBand.prototype.run = function() {
            if (!this.running) {
                return;
            }
            var currTime = Date.now();
            this.beatTime += ((currTime - this.lastTime) / 60000) * this.BPM;
            this.lastTime = currTime;
            if (this.customBeats && this.beatTime > this.bars.length) {
                if (this.repeat) {
                    this.start();
                } else {
                    this.stop();
                }
            }
        };

        ClassBand.prototype.toggleNote = function(barNum, noteNum) {
            if (barNum >= 0 && barNum < this.bars.length) {
                var bar = this.bars[barNum];
                bar.setBarNote(noteNum, !bar.getBarNote(noteNum));
            }
        };

        ClassBand.prototype.setBar = function(barNum, bar) {
            this.bars[barNum] = bar;
        };

        ClassBand.prototype.getBar = function(barNum) {
            if (barNum === undefined) {
                barNum = this.beatTime;
            }
            if (barNum > this.bars.length) {
                barNum = this.bars.length - 1;
            }
            barNum = Math.floor(barNum);
            return this.bars[barNum];
        };

        ClassBand.prototype.setBPM = function(bpm) {
            this.BPM = bpm;
        };

        ClassBand.prototype.hasBarNote = function(barNum, lineNum) {
            if (this.customBeats) {
                if (barNum >= 0 && barNum < this.bars.length) {
                    return this.getBar(barNum).getBarNote(lineNum);
                }
            } else {
                if (lineNum >= 0 && lineNum < this.ratioBeat.length) {
                    return ((barNum + 1) % this.ratioBeat[lineNum] === 0);
                }
            }
            return false;
        };

        ClassBand.prototype.setHighlightBeat = function(barNum, on) {
            if (on === undefined) {
                on = !this.isHighlightBeat(barNum);
            }
            if (on) {
                this.highlightBeat = barNum;
            } else {
                this.highlightBeat = undefined;
            }
        };

        ClassBand.prototype.isHighlightBeat = function(barNum) {
            return (barNum === this.highlightBeat);
        };

        ClassBand.prototype.setInstruments = function(instruments) {
            this.bandInstrument = instruments;
        };

        ClassBand.prototype.toggleInstrument = function(instrument) {
            for (var i in this.bandInstrument) {
                if (this.bandInstrument[i] === instrument) {
                    this.deleteInstrument(i);
                    return;
                }
            }
            for(var b = 0; b < this.maxInstruments; b++) {
                if (this.bandInstrument[b] === undefined) {
                    this.bandInstrument[b] = instrument;
                    break;
                }
            }
        };

        ClassBand.prototype.instrumentSelected = function(instrument) {
            for (var i in this.bandInstrument) {
                if (this.bandInstrument[i] === instrument) {
                    return true;
                }
            }
            return false;
        };

        ClassBand.prototype.getInstrumentPicture = function(instrument) {
            if (instrument < 0 || instrument >= this.instrumentUrls.length) {
                instrument = 0;
            }
            return 'classBand/img/' + this.instrumentUrls[instrument];
        };

        ClassBand.prototype.setToMaestroMode = function() {
            this.gameMode = ns.CLASS_BAND_MODE_MAESTRO;
        };

        ClassBand.prototype.isMaestroMode = function() {
            return this.gameMode === ns.CLASS_BAND_MODE_MAESTRO;
        };

        ClassBand.prototype.setToPlayMode = function() {
            this.gameMode = ns.CLASS_BAND_MODE_PLAY;
        };

        ClassBand.prototype.isPlayMode = function() {
            return this.gameMode === ns.CLASS_BAND_MODE_PLAY;
        };

        ClassBand.prototype.increaseBars = function(num) {
            while (num < 0 && this.bars.length > 1) {
                this.bars.pop();
                num++;
            }
            while (num > 0  && this.bars.length < 100) {
                var bar = new ns.Bar();
                this.bars.push(bar);
                num--;
            }
        };

        ClassBand.prototype.setProgramNumOfBeats = function(channel, beatsEvery) {
            beatsEvery = parseInt(beatsEvery, 10);
            if (beatsEvery === undefined || beatsEvery <= 0) {
                return;
            }
            if (this.customBeats) {
                for (var i = 0 ; i < this.bars.length; i++) {
                    var bar = this.bars[i];
                    var on = (((i + 1) % beatsEvery) === 0);
                    bar.setBarNote(channel, on);
                }
            } else {
                this.ratioBeat[channel] = beatsEvery;
            }
        };

        ClassBand.prototype.deleteInstrument = function(channel) {
            if (channel < 0 || channel >= this.maxInstruments) {
                return;
            }
            for (var i = 0 ; i < this.bars.length; i++) {
                var bar = this.bars[i];
                bar.setBarNote(channel, false);
            }
            this.bandInstrument[channel] = undefined;
        };

        ClassBand.prototype.unmuteAllChannels = function() {
            this.mutedChannel = [false, false, false, false, false];
        };

        ClassBand.prototype.clearMaestroMode = function() {
            var emptyBar = [];
            var defaultBeats = [];
            for (var i = 0; i < 35; i++) {
                defaultBeats.push(emptyBar);
            }
            this.bars = this.convertBeatsToBars(defaultBeats);
        };

        ClassBand.prototype.hasBars = function() {
            return this.bars.length > 0;
        };

        return ClassBand;
    })();
})(window.mt.classband);


(function (ns) {
    'use strict';
    ns.ClassBandRenderer = (function () {

        function ClassBandRenderer(containerElement, classBandModel, viewConfig, toolId) {
            this.classBandModel = classBandModel;
            this.canvas = containerElement;
            this.viewConfig = viewConfig;
            this.noteMargin = 128;
            this.noteRadius = 10;
            this.noteOutlineRadius = 30;
            this.dotRadius = 5;
            this.lineWidth = 4;
            this.maxBeats = this.viewConfig.barWidth / this.noteMargin;
            this.colors = [
                'rgb(0, 255, 0)',
                'rgb(255, 0, 0)',
                'rgb(255, 255, 0)',
                'rgb(0, 0, 255)',
                'rgb(255, 165, 0)'
            ];
            this.images = [];
        }

        function renderCircle(ctx, color, x, y, radius, outlineColor, thickness) {
            ctx.beginPath();
            if (outlineColor === undefined) {
                outlineColor = 'none';
            }
            if (thickness === undefined) {
                thickness = 0;
            }
            ctx.lineWidth = thickness;
            ctx.fillStyle = color;
            ctx.strokeStyle = outlineColor;
            ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.stroke();
        }

        ClassBandRenderer.prototype.setup = function() {
            this.lineDimensions = this.getLineDimensions(4);
            this.loadImages();
        };

        ClassBandRenderer.prototype.render = function() {
            if (this.ctx === undefined) {
                this.ctx = this.canvas.getContext('2d');
            }
            if (this.ctx) {
                var ctx = this.ctx;
                ctx.clearRect(this.viewConfig.barLeftMargin, 0, this.viewConfig.barWidth, this.viewConfig.height);
                this.renderBackground(ctx);

                ctx.save();
                ctx.rect(this.viewConfig.barLeftMargin, 0, this.viewConfig.barWidth, this.viewConfig.height);
                ctx.strokeStyle = 'none';
                ctx.stroke();
                ctx.clip();

                this.renderLines(ctx);
                this.renderNotes(ctx);
                this.renderTapZone(ctx);
                this.renderBeatNumbers(ctx);

                ctx.restore();
                this.renderInstruments(ctx);
                this.renderBackButton(ctx);
            }
        };

        ClassBandRenderer.prototype.renderBackground = function(ctx) {
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.fillRect(0, 0, this.viewConfig.width, this.viewConfig.height);
            for(var i = 0; i < this.lineDimensions.length; i++) {
                ctx.fillStyle = this.lineDimensions[i].color;
                ctx.fillRect(0, this.lineDimensions[i].posY - (this.lineDimensions[i].height / 2),
                    this.viewConfig.width, this.lineDimensions[i].height);
            }
        };

        ClassBandRenderer.prototype.getBeatNum = function(position) {

            var beatNum = Math.floor(position + this.classBandModel.beatTime);
            while (this.classBandModel.customBeats && beatNum >= this.classBandModel.bars.length) {
                beatNum -= this.classBandModel.bars.length;
            }
            return beatNum;
        };

        ClassBandRenderer.prototype.renderNotes = function(ctx) {
            var inside = 'white';
            var outside = 'rgba(0, 0, 0, 0.6)';
            var dotColor = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = this.noteOutline;
            for(var i = 0; i < this.lineDimensions.length; i++) {
                var y = this.lineDimensions[i].posY;
                for (var n = -1; n < this.maxBeats + 1; n++) {
                    var x = (n + 0.5 - (this.classBandModel.beatTime % 1)) * this.noteMargin + this.viewConfig.barLeftMargin;
                    var t = Math.floor(n + this.classBandModel.beatTime);
                    if (t < 0) {
                        continue;
                    }
                    if (this.classBandModel.customBeats) {
                        t = t % this.classBandModel.bars.length;
                    }
                    if(this.classBandModel.hasBarNote(t, i)) {

                        var barColor = outside;

                        if (this.classBandModel.isHighlightBeat(this.getBeatNum(n))) {
                            barColor = this.colors[i];
                        }
                        renderCircle(ctx, barColor, x, y, this.noteOutlineRadius);
                        renderCircle(ctx, inside, x, y, this.noteRadius);
                    } else {
                        renderCircle(ctx, dotColor, x, y, this.dotRadius);
                    }
                }
            }
        };

        ClassBandRenderer.prototype.renderLines = function(ctx) {
            for (var n = -1; n < (this.maxBeats + 1); n++) {
                var x = ((n + 0.5 - (this.classBandModel.beatTime % 1)) * this.noteMargin) - (this.noteMargin / 2) + this.viewConfig.barLeftMargin;
                var drawLine = false;

                if (this.classBandModel.isHighlightBeat(this.getBeatNum(n))) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                    drawLine = true;
                } else if ((Math.floor(this.classBandModel.beatTime + n) % 2) === 0) {
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                    drawLine = true;
                }
                if (drawLine) {
                    ctx.fillRect(x, 0, this.noteMargin, this.viewConfig.height);
                }
            }
        };



        ClassBandRenderer.prototype.renderBeatNumbers = function(ctx) {
            var max = (this.maxBeats + 1);
            for (var n = 0; n < max; n++) {
                var x = ((n + 0.5 - (this.classBandModel.beatTime % 1)) * this.noteMargin) + this.viewConfig.barLeftMargin;
                ctx.fillStyle = 'black';
                ctx.font = '32px Arial';
                ctx.textAlign = 'center';
                var textNumber = n + this.classBandModel.beatTime;
                while (this.classBandModel.customBeats && textNumber >= this.classBandModel.bars.length) {
                    textNumber -= this.classBandModel.bars.length;
                }
                var text = Math.floor(textNumber + 1);
                ctx.fillText(text, x, this.viewConfig.barTopMargin - 10);
            }
        };

        ClassBandRenderer.prototype.renderTapZone = function(ctx) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            ctx.fillRect(this.viewConfig.barLeftMargin, this.viewConfig.barTopMargin, this.noteMargin, this.viewConfig.barHeight);

            ctx.lineWidth = this.lineWidth;
            ctx.strokeStyle = 'lightblue';
            ctx.beginPath();
            var x = this.viewConfig.barLeftMargin;
            var top = this.viewConfig.barTopMargin;
            var bottom = this.viewConfig.barTopMargin + this.viewConfig.barHeight;
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
            ctx.stroke();

            x = this.viewConfig.barLeftMargin + this.noteMargin;
            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
            ctx.stroke();

            // tap line
            x = this.viewConfig.barLeftMargin + (this.noteMargin / 2);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = this.lineWidth * 2;
            ctx.beginPath();
            ctx.moveTo(x, top);
            ctx.lineTo(x, bottom);
            ctx.stroke();
            var beatTimeRemainder = this.classBandModel.beatTime % 1;
            var beatDistance = 0.1;
            ctx.strokeStyle = 'red';
            ctx.lineWidth = this.lineWidth;
            ctx.stroke();
            
            // at the halfway point of each channel height, we need to draw a red circle on the tap line
            
            var normalDotColor = 'rgb(255, 0, 0)';
            var highlightDotColor = 'rgb(173, 216, 230)';
            var canHighlight = false;
            var t = Math.floor(this.classBandModel.beatTime + 0.5);
            if (this.classBandModel.customBeats) {
                t = t % this.classBandModel.bars.length;
            }
            if (beatTimeRemainder < beatDistance || beatTimeRemainder > 1 - beatDistance) {
                canHighlight = true;
            }
            var outlineColor = 'rgb(255, 255, 255)';
            var channelheight = this.viewConfig.barHeight / 4;
            var y = top + channelheight / 2;
            ctx.moveTo(x, y);
            for (var i = 0; i < 4; i++){
                var dotColor = normalDotColor;
                if(this.classBandModel.hasBarNote(t, i) && canHighlight) {
                    dotColor = highlightDotColor;
                }
                renderCircle(ctx, dotColor, x, y, this.noteRadius, outlineColor, 2);
                ctx.stroke();
                y += channelheight;
            }
        };

        ClassBandRenderer.prototype.renderInstruments = function(ctx) {
            for(var i = 0; i < this.lineDimensions.length; i++) {
                var y = this.lineDimensions[i].posY;
                var x = (this.viewConfig.barLeftMargin / 2);
                if (i < this.classBandModel.bandInstrument.length) {
                    if (this.classBandModel.bandInstrument[i] !== undefined) {
                        ctx.drawImage(this.images[this.classBandModel.bandInstrument[i]], x - 42, y - 42);

                        if (this.classBandModel.mutedChannel[i]) {
                            ctx.save();
                            ctx.beginPath();
                            ctx.moveTo(x - 42, y - 42);
                            ctx.lineTo(x + 42, y + 42);
                            ctx.strokeStyle = 'white';
                            ctx.lineWidth = 8;
                            ctx.stroke();
                            ctx.strokeStyle = 'red';
                            ctx.lineWidth = 6;
                            ctx.stroke();

                            ctx.moveTo(x + 42, y - 42);
                            ctx.lineTo(x - 42, y + 42);
                            ctx.strokeStyle = 'white';
                            ctx.lineWidth = 8;
                            ctx.stroke();
                            ctx.strokeStyle = 'red';
                            ctx.lineWidth = 6;
                            ctx.stroke();
                            ctx.restore();
                        }
                    }
                }
            }
        };

        ClassBandRenderer.prototype.getLineDimensions = function(numOfLines) {
            var lineDimensions = [];
            for (var i = 0; i < numOfLines; i++) {
                var dim = {
                    posY: (this.viewConfig.barHeight / numOfLines) * (i + 0.5) + this.viewConfig.barTopMargin,
                    height: (this.viewConfig.barHeight / numOfLines),
                    color: this.colors[i]
                };
                lineDimensions.push(dim);

            }
            return lineDimensions;
        };

        ClassBandRenderer.prototype.loadImages = function() {
            for (var i = 0; i < this.classBandModel.instrumentUrls.length; i++) {
                var imageObj = this.createImage();
                imageObj.src = this.classBandModel.getInstrumentPicture(i);
                this.images.push(imageObj);
            }
        };

        ClassBandRenderer.prototype.renderBackButton = function(ctx) {
            ctx.fillStyle = 'black';
            ctx.font = '32px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('back', (this.viewConfig.barLeftMargin / 2), (this.viewConfig.barTopMargin / 2) + 16);
        };

        ClassBandRenderer.prototype.createImage = function() {
            return new Image();
        };

        return ClassBandRenderer;
    }());
})(window.mt.classband);
(function (ns) {
    'use strict';
    /* global 
        createjs: false
    */
    ns.ClassBandSound = (function () {

        function ClassBandSound() {

            if (!(this instanceof ClassBandSound)) {
                return new ClassBandSound();
            }
            this.initSound();
            this.numOfChannels = 1;
        }
        var soundFolder = 'classBand/snd/';

        ClassBandSound.prototype.initSound = function() {
            this.html5Audio = this.hasHtml5Audio();
            this.sounds = [];
        };
        ClassBandSound.prototype.hasHtml5Audio = function() {
            var a = document.createElement('audio');
            return !!(a.canPlayType && a.canPlayType('audio/mpeg;').replace(/no/, ''));
        };
        ClassBandSound.prototype.loadSounds = function(urls) {
            var i;
            if (this.useSoundJS) {
                for (i = 0; i < urls.length; i++) {
                    createjs.Sound.removeSound(urls[i].id);
                    createjs.Sound.registerSound(soundFolder + urls[i].src, urls[i].id);
                }
            } else if (this.html5Audio) {
                for (i = 0; i < urls.length; i++) {
                    var snd = this.getSound(urls[i].src);
                    if (snd.readyState === 4) {
                        continue;
                    }
                    snd.load();
                    snd.play();
                }
            }
            
        };

        ClassBandSound.prototype.reloadSound = function(snd) {
            if ('' + snd.sound.duration === 'NaN') {
                var audio = this.makeAudio(snd.url);
                snd.sound = audio;
            }
            if (snd.sound.readyState === 0) {
                snd.sound.load();
            }
            return snd;
        };

        ClassBandSound.prototype.getSound = function(url) {
            for (var i = 0; i < this.sounds.length; i++) {
                var snd = this.sounds[i];
                if (snd.url === url) {
                    return this.reloadSound(snd).sound;
                }
            }
            var sound = this.makeAudio(soundFolder + url);
            sound.load();
            var newSnd = {
                sound: sound,
                url: url
            };
            this.sounds.push(newSnd);
            newSnd = this.reloadSound(newSnd);
            return newSnd.sound;

        };

        ClassBandSound.prototype.playSound = function(url, volume) {
            if (volume === undefined) {
                volume = 1;
            }
            if (this.useSoundJS) {
                createjs.Sound.play(soundFolder + url, {volume: volume});
            } else if(this.html5Audio){
                var snd = this.getSound(url);
                if (snd.currentTime !== 0) {
                    snd.pause();
                    snd.currentTime = 0;
                }
                if ('' + snd.duration !== 'NaN') {
                    snd.volume = volume;
                    snd.onEnded = function(){
                        this.volume = 1;
                    };
                    snd.play();
                }
            } else {
                $('#sound').remove();
                var sound = $('<embed id="sound" type="audio/mpeg" />');
                sound.attr('src', url);
                sound.attr('loop', false);
                sound.attr('hidden', true);
                sound.attr('autostart', true);
                $('body').append(sound);
            }
        };

        ClassBandSound.prototype.makeAudio = function(url) {
            return new Audio(url);
        };

        return ClassBandSound;
    }());
})(window.mt.classband);
(function (ns) {
    'use strict';

    ns.CLASS_BAND_SCREEN_MAIN = 'main';
    ns.CLASS_BAND_SCREEN_LESSON = 'lesson';
    ns.CLASS_BAND_SCREEN_SELECT = 'select';
    ns.CLASS_BAND_SCREEN_GAME = 'game';

    ns.CLASS_BAND_MODE_MAESTRO = 'maestro';
    ns.CLASS_BAND_MODE_PLAY = 'play';
})(window.mt.classband);

(function (ns) {
    'use strict';

    /* Controllers */
    /* global 
        createjs: false
    */

    angular.module('mtClassBand').controller('ClassBandCtrl', function ($scope, toolPersistorService) {

        $scope.classBand = new ns.ClassBand();

        function getTouchesPos(e, scope) {
            var touches = [];
            for (var i = 0; i < e.gesture.touches.length; i++) {
                var touch = [e.gesture.touches[i].pageX-$(scope.targetElement).offset().left, e.gesture.touches[i].pageY-$(scope.targetElement).offset().top];
                touches.push(touch);
            }
            return touches;
        }

        $scope.init = function () {
            $scope.viewConfig = {
                width: 900,
                height: 450,
                margin: 0,
                barWidth: 800,
                barHeight: 400,
                barTopMargin: 50,
                barLeftMargin: 100
            };
            $scope.initClassBandRenderer();
            $scope.renderer.setup();
            $scope.sound = new ns.ClassBandSound();

            var registeredPlugins = false;
            if (navigator && navigator.userAgent && navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
                registeredPlugins = createjs.Sound.registerPlugins([createjs.HTMLAudioPlugin]);
            } else {
                registeredPlugins = createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashPlugin]);
            }
            if (createjs.Sound.activePlugin !== null || registeredPlugins === true) {
                $scope.sound.useSoundJS = true;
            } else {
                console.log('----could not load soundjs-----');
            }
            $scope.startTimer();
            $scope.loadSounds();
            $scope.openInstrumentMenu(false);
            $scope.programNumOfBeats = 1;
            $scope.editMaestroMode = false;
            $scope.lessons = [
                {
                    instrument: [1, 2, 3],
                    ratioBeat: [2, 3, 1]
                },
                {
                    instrument: [0, 1, 2],
                    ratioBeat: [6, 4, 1]
                },
            ];
        };

        $scope.initClassBandRenderer = function() {
            $scope.renderer = new ns.ClassBandRenderer($scope.targetElement, $scope.classBand, $scope.viewConfig, $scope.toolId);
        };

        $scope.serialize = function () {
            return $scope.classBand.serialize();
        };

        $scope.deserialize = function (data) {
            $scope.classBand.deserialize(data);
        };

        $scope.startTimer = function() {
            //$scope.classBand.start();
            $scope.classBandTimer = setInterval(function(){
                $scope.update();
            }, 1000 / 60);
        };

        $scope.endTimer = function() {
            clearInterval($scope.classBandTimer);
        };

        $scope.update = function () {
            $scope.classBand.run();
            $scope.renderer.render();
            if ($scope.classBand.customBeats) {
                if ($scope.classBand.running) {
                    $scope.progressSlider.slider('value', $scope.classBand.beatTime);
                }
                $scope.progressSlider.slider('option', 'max', $scope.classBand.bars.length - 1);
            }

            if ($scope.classBand.running && $scope.classBand.lastPlayedBeat !== Math.floor($scope.classBand.beatTime)) {
                $scope.classBand.lastPlayedBeat = Math.floor($scope.classBand.beatTime);
                //var bar = $scope.classBand.bars[$scope.classBand.lastPlayedBeat];
                for (var n = 0; n < 4; n++) {
                    if ($scope.classBand.hasBarNote($scope.classBand.lastPlayedBeat, n) && !$scope.isChannelMuted(n)) {
                        $scope.playInstrument($scope.classBand.bandInstrument[n]);
                    }
                }
            }
        };

        $scope.touchReleaseGame = function(e) {
            if ($scope.isDragging) {
                $scope.isDragging = false;
                return;
            }
            var touches = getTouchesPos(e, $scope);
            for (var t in touches) {
                $scope.tapChannel(touches[t]);
            }
        };

        $scope.touchGame = function(e) {
            $scope.originalBeatTime = $scope.classBand.beatTime;
        };

        $scope.dragGame = function(e) {
            $scope.isDragging = true;
            var newBeatTime = $scope.originalBeatTime - e.gesture.deltaX / $scope.renderer.noteMargin;
            
            if ($scope.classBand.isMaestroMode()) {
                while (newBeatTime < 0 && $scope.classBand.bars.length > 0) {
                    newBeatTime += $scope.classBand.bars.length;
                }
            } else if (newBeatTime < 0) {
                newBeatTime = 0;
            }
            while (newBeatTime > $scope.classBand.bars.length && $scope.classBand.bars.length > 0) {
                newBeatTime -= $scope.classBand.bars.length;
            }
            $scope.classBand.beatTime = newBeatTime;
            $scope.progressSlider.slider('value', $scope.classBand.beatTime);
        };

        $scope.loadSounds = function() {
            $scope.soundUrls = [

                {id:'bassDrum', src:'new_bass_drum_01.m4a'},
                {id:'snareDrum1', src:'new_snare_drum_01.m4a'},
                {id:'triangle', src:'new_triangle_01.m4a'},
                {id:'cymbal', src:'new_cymbal_01.m4a'},
                {id:'acousticGuitar', src:'new_acoustic_guitar_01.m4a'},
                {id:'flute', src:'new_flute_01.m4a'},
                {id:'piano', src:'new_piano_01.m4a'},
                {id:'snareDrum2', src:'new_snare_drum_02.m4a'}
            ];
            $scope.sound.loadSounds($scope.soundUrls);
        };

        $scope.getInstrumentPicture = function(instrument) {
            return $scope.classBand.getInstrumentPicture(instrument);
        };

        $scope.tapChannel = function(pos) {
            var x = pos[0];
            var y = pos[1];
            $scope.x = x;
            $scope.y = y;
            var channelHeight = $scope.viewConfig.barHeight / 4;
            var topMargin = $scope.viewConfig.barTopMargin;
            var channel = Math.floor((y - topMargin) / channelHeight);
            if (x > $scope.viewConfig.barLeftMargin) {
                var cellNum = $scope.getCellAt(x);
                if (channel >= 0 && channel < $scope.classBand.bandInstrument.length) {
                    if ($scope.classBand.isMaestroMode()) {
                        $scope.classBand.toggleNote(cellNum, channel);
                    }
                } else if (channel < 0) {
                    var realCellNum = $scope.getCellAt(x, !$scope.classBand.customBeats);
                    $scope.classBand.setHighlightBeat(realCellNum);
                }
            } else {
                if (channel < 0) {
                    $scope.goToMainScreen();
                } else {
                    $scope.instrumentMenuChannel = channel;
                    $scope.openInstrumentMenu(true);
                }
            }
        };

        $scope.getCellAt = function(x, real) {
            var cellNum = $scope.classBand.beatTime + ((x - $scope.viewConfig.barLeftMargin) / $scope.renderer.noteMargin);
            if (real === undefined) {
                real = false;
            }
            if (!real) {
                cellNum %= $scope.classBand.bars.length;
            }
            return Math.floor(cellNum);
        };

        $scope.togglePlay = function() {
            if($scope.classBand.running) {
                $scope.classBand.pause();
            } else {
                $scope.classBand.unpause();
                $scope.loadInstrumentSounds();
            }
        };

        $scope.toggleLoop = function() {
            $scope.classBand.repeat = !$scope.classBand.repeat;
        };

        $scope.stop = function() {
            $scope.classBand.stop();
        };

        $scope.goToMainScreen = function() {
            $scope.classBand.stop();
            $scope.classBand.currentScreen = ns.CLASS_BAND_SCREEN_MAIN;
        };

        $scope.isMainScreen = function() {
            return $scope.classBand.currentScreen === ns.CLASS_BAND_SCREEN_MAIN;
        };

        $scope.goToLessonScreen = function() {
            $scope.classBand.currentScreen = ns.CLASS_BAND_SCREEN_LESSON;
        };
        $scope.isLessonScreen = function() {
            return $scope.classBand.currentScreen === ns.CLASS_BAND_SCREEN_LESSON;
        };

        $scope.goToSelectScreen = function() {
            $scope.classBand.currentScreen = ns.CLASS_BAND_SCREEN_SELECT;
        };
        $scope.isSelectScreen = function() {
            return $scope.classBand.currentScreen === ns.CLASS_BAND_SCREEN_SELECT;
        };

        $scope.goToGameScreen = function() {
            $scope.classBand.currentScreen = ns.CLASS_BAND_SCREEN_GAME;
        };

        $scope.isGameScreen = function() {
            return $scope.classBand.currentScreen === ns.CLASS_BAND_SCREEN_GAME;
        };

        $scope.toggleInstrument = function(instrument) {
            $scope.classBand.toggleInstrument(instrument);
        };

        $scope.instrumentSelected = function(instrument) {
            return $scope.classBand.instrumentSelected(instrument);
        };

        $scope.playInstrument = function(instrument) {
            $scope.sound.playSound($scope.soundUrls[instrument % $scope.soundUrls.length].src);
        };

        $scope.loadLesson = function (lesson) {
            var lessonItem = $scope.lessons[lesson];
            if (lessonItem === undefined) {
                return;
            }
            $scope.classBand.setHighlightBeat(undefined);
            $scope.classBand.customBeats = false;

            $scope.classBand.setInstruments(lessonItem.instrument);
            $scope.classBand.ratioBeat = lessonItem.ratioBeat;

            $scope.loadInstrumentSounds();
            $scope.goToGameScreen();
            $scope.classBand.setToPlayMode();
        };

        $scope.startDefaultGame = function() {
            $scope.classBand.setHighlightBeat(undefined);
            $scope.classBand.setInstruments([1,2,3,4]);
            $scope.goToGameScreen();
            $scope.classBand.setToPlayMode();
        };

        $scope.clearMaestroMode = function () {
            $scope.classBand.clearMaestroMode();
            $scope.stop();
        };

        $scope.startMaestroMode = function() {
            $scope.classBand.setHighlightBeat(undefined);
            $scope.classBand.setToMaestroMode();
            $scope.classBand.customBeats = true;
            if (!this.classBand.hasBars()) {
                $scope.clearMaestroMode();
            }
            $scope.goToGameScreen();
        };
        $scope.addInstrument = function(){
            $scope.goToSelectScreen();
        };

        $scope.isMaestroMode = function() {
            return $scope.classBand.isMaestroMode();
        };

        $scope.isPlayMode = function() {
            return $scope.classBand.isPlayMode();
        };

        $scope.isCustomBeats = function() {
            return $scope.classBand.customBeats;
        };

        $scope.increaseBars = function(num) {
            $scope.classBand.increaseBars(num);
        };

        $scope.openInstrumentMenu = function(open) {
            if (open === undefined) {
                open = !$scope.isInstrumentMenuOpen;
            }
            if (open) {
                setTimeout(function(){
                    $('.modal-backdrop').unbind('click');
                },0);
            }
            $scope.isInstrumentMenuOpen = open;
        };

        $scope.unmuteAllChannels = function() {
            $scope.classBand.unmuteAllChannels();
        };

        $scope.toggleMute = function(channel) {
            if (channel < 0 || channel >= $scope.classBand.mutedChannel.length) {
                return;
            }
            $scope.classBand.mutedChannel[channel] = !$scope.classBand.mutedChannel[channel];
        };

        $scope.isChannelMuted = function(channel) {
            if (channel < 0 || channel >= $scope.classBand.mutedChannel.length) {
                return false;
            }
            return $scope.classBand.mutedChannel[channel];
        };

        $scope.setProgramNumOfBeats = function(channel, beatsEvery) {
            $scope.classBand.setProgramNumOfBeats(channel, beatsEvery);
        };

        $scope.deleteInstrument = function(channel) {
            $scope.classBand.deleteInstrument(channel);
        };

        $scope.loadInstrumentSounds = function () {
            var urlsToLoad = [];
            for(var i = 0; i < $scope.classBand.bandInstrument.length; i++) {
                urlsToLoad.push($scope.soundUrls[$scope.classBand.bandInstrument[i] % $scope.soundUrls.length]);
            }
            if ($scope.sound.useSoundJS) {
                for (var u in urlsToLoad) {
                    $scope.sound.playSound(urlsToLoad[u].src, 0);
                }
            } else {
                $scope.sound.loadSounds(urlsToLoad);
            }
        };

        $scope.playSymbol = function () {
            return ($scope.classBand.running) ? '|  |' : '►';
        };

        $scope.loopText = function () {
            return ($scope.classBand.repeat) ? 'looping' : 'once';
        };

        toolPersistorService.registerTool($scope.toolId, mt.common.TYPE_CLASS_BAND, $scope.containerApi, $scope.serialize, $scope.deserialize);

    });
})(window.mt.classband);

(function (ns) {
    'use strict';

    /* Directives */

    angular.module('mtClassBand').directive('mtClassBandTool', function () {
        return {
            restrict            : 'E',
            templateUrl         : 'templates/classBandToolTemplate.html',
            scope               : {
                toolId: '=',
                containerApi: '='
            },
            controller          : 'ClassBandCtrl',
            link: function (scope, element) {
                scope.targetElement = $(element[0]).find('.mt-game-screen')[0];
                scope.tempoSlider = $(element[0]).find('.mt-tempo-slider').slider({
                    stop: function(event, ui) {
                        scope.classBand.setBPM(scope.tempoSlider.slider('value'));
                    },
                    slide: function(event, ui) {
                        scope.classBand.setBPM(scope.tempoSlider.slider('value'));
                    },
                    value: 90,
                    min: scope.classBand.minBPM,
                    max: scope.classBand.maxBPM
                });

                scope.progressSlider = $(element[0]).find('.mt-progress-slider').slider({
                    stop: function(event, ui) {
                        scope.classBand.beatTime = scope.progressSlider.slider('value');
                    },
                    slide: function(event, ui) {
                        scope.classBand.beatTime = scope.progressSlider.slider('value');
                    },
                    value: 0
                });

                scope.$on('$destroy', function() {
                    scope.endTimer();
                });

                scope.init();
            }
        };
    });


    //Fill menu
    angular.module('mtClassBand').directive('mtInstrumentMenu', function () {

        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/instrumentMenuTemplate.html',
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



})(window.mt.classband);
angular.module('mtClassBand').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/classBandToolTemplate.html',
    "<div class=mt-class-band><div class=mt-class-band-container><div class=\"mt-class-band-main-screen mt-class-band-screen\" ng-show=isMainScreen()><div class=mt-class-band-main-screen-button-holder><div><button class=\"mt-class-band-perform-button mt-class-band-main-screen-button btn btn-primary btn-large\" hm-tap=goToLessonScreen()>Perform</button><div><h3>Keep with the beat!</h3></div></div><div><button class=\"mt-class-band-compose-button mt-class-band-main-screen-button btn btn-primary btn-large\" hm-tap=goToSelectScreen()>Compose</button><div><h3>Create your own composition!</h3></div></div></div></div><div class=\"mt-class-band-lesson-screen mt-class-band-screen\" ng-show=isLessonScreen()><div ng-repeat=\"i in [] | range: lessons.length\" class=\"mt-lesson-btn{{i}} mt-lesson-btn btn btn-primary btn-large\" hm-tap=loadLesson(i)>Rhythm Pattern {{i + 1}}</div><div class=\"mt-lesson-btn-back mt-lesson-btn btn btn-large\" hm-tap=goToMainScreen()>back</div></div><div class=\"mt-class-band-select-screen mt-class-band-screen\" ng-show=isSelectScreen()><div ng-repeat=\"i in [] | range:8\" hm-tap=playInstrument(i) hm-doubletap=toggleInstrument(i) class=\"mt-class-band-img-container mt-instrument-btn{{i}}\" ng-class=\"{'mt-instrument-selected': instrumentSelected(i)}\"><img class=mt-class-band-img ng-src={{getInstrumentPicture(i)}}></div><div class=mt-bottom-right><div class=\"mt-instrument-play-button mt-select-buttons btn btn-large btn-primary\" hm-tap=startMaestroMode()>play</div><div class=\"mt-instrument-back-button mt-select-buttons btn btn-large\" hm-tap=goToMainScreen()>back</div></div></div><div class=\"mt-class-band-game-screen mt-class-band-screen\" ng-show=isGameScreen()><canvas hm-drag=dragGame($event) hm-release=touchReleaseGame($event) hm-touch=touchGame($event) class=mt-game-screen width=900 height=450></canvas><div ng-show=isMaestroMode() class=mt-add-instrument hm-tap=addInstrument()><i>+</i>Add Instrument</div><div ng-show=isCustomBeats() class=mt-progress-slider></div><div ng-show=isMaestroMode() class=mt-beat-button-holder><div class=mt-beat-info>Beats</div><div class=\"mt-beat-info mt-beat-button\" hm-tap=increaseBars(-1)>-</div><div class=mt-beat-info>{{classBand.bars.length}}</div><div class=\"mt-beat-info mt-beat-button\" hm-tap=increaseBars(1)>+</div></div><div ng-show=isMaestroMode() class=\"mt-clear-button mt-control-button\" hm-tap=clearMaestroMode()>clear</div><div class=controls><div class=\"mt-tempo-label mt-tempo-min\">{{classBand.minBPM}}bpm</div><div class=mt-tempo-slider></div><div class=\"mt-tempo-label mt-tempo-max\">{{classBand.BPM}}/{{classBand.maxBPM}}bpm</div><div class=\"mt-play-button mt-control-button\" hm-tap=togglePlay() ng-bind=playSymbol()></div><div class=\"mt-loop-button mt-control-button\" hm-tap=toggleLoop() ng-bind=loopText()></div><div class=\"mt-replay-button mt-control-button\" hm-tap=stop()>restart</div><h3 class=mt-instructions>Keep with the beat!</h3></div></div></div><mt-instrument-menu></mt-instrument-menu></div>"
  );


  $templateCache.put('templates/instrumentMenuTemplate.html',
    "<div modal=isInstrumentMenuOpen class=mt-instrument-menu-dialog><div class=modal-header><h3>Instrument Menu</h3></div><div class=modal-body><div class=mt-mute-info-holder hm-touch=toggleMute(instrumentMenuChannel)><div class=mt-mute-info>Mute</div><div class=\"mt-mute-info mt-mute-button\"><div class=mt-mute-x ng-show=isChannelMuted(instrumentMenuChannel)>X</div></div></div><div class=mt-program-info-holder><div class=mt-program-info>Set Beats Every</div><div class=\"mt-program-info mt-program-input\"><input ng-model=programNumOfBeats></div><div class=\"mt-program-info btn\" hm-touch=\"setProgramNumOfBeats(instrumentMenuChannel, programNumOfBeats)\">Apply</div></div><div class=mt-delete-info-holder ng-show=isMaestroMode()><div class=mt-delete-info>Delete Instrument</div><div class=\"mt-delete-info btn btn-danger\" hm-touch=deleteInstrument(instrumentMenuChannel)>Delete</div></div></div><div class=modal-footer><button hm-touch=openInstrumentMenu(false) class=btn>Close</button></div></div>"
  );

}]);
