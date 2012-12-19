/*
 * Jester JavaScript Library v0.2
 * http://github.com/plainview/Jester
 *
 * Easy JavaScript gesture recognition.
 *
 * Released under MIT License
 *
 * Copyright (C) 2011 by Scott Seaward
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

if(!Foxtrick)
    Foxtrick = {};

(function(container, undefined) {
    var Jester = container.Jester = {
        cache : {},
        cacheId : "Jester" + (new Date()).getTime(),
        guid : 0,

        // The Jester constructor
        Watcher : function(element, options) {

            var that = this,
                cacheId = Jester.cacheId,
                cache = Jester.cache,
                gestures = "swipe flick tap doubletap pinchnarrow pinchwiden pinchend";

            if(!element || !element.nodeType) {
                throw new TypeError("Jester: no element given.");
            }

            // if this element hasn't had Jester called on it before,
            // set it up with a cache entry and give it the expando
            if(typeof element[cacheId] !== "number") {
                element[cacheId] = Jester.guid;
                Jester.guid++;
            }

            var elementId = element[cacheId];

            if(!(elementId in cache)) {
                Jester.cache[elementId] = {};
            }

            var elementCache = Jester.cache[elementId];

            if(!("options" in elementCache)) {
                elementCache.options = {};
            }

            options = options || elementCache.options || {};

            // cache the option values for reuse or, if options already
            // exist for this element, replace those that have been
            // specified
            if(elementCache.options !== options) {
                for(var prop in options) {
                    if(elementCache.options[prop]) {
                        if(elementCache.options[prop] !== options[prop]) {
                            elementCache.options[prop] = options[prop];
                        }
                    }
                    else {
                        elementCache.options[prop] = options[prop];
                    }
                }
            }

            if(!("eventSet" in elementCache) || !(elementCache.eventSet instanceof Jester.EventSet)) {
                elementCache.eventSet = new Jester.EventSet(element);
            }

            if(!elementCache.touchMonitor) {
                elementCache.touchMonitor = new Jester.TouchMonitor(element);
            }

            var events = elementCache.eventSet;
            var touches = elementCache.touchMonitor;

            this.id = element[cacheId];

            this.bind = function(evt, fn) {
                if(evt && typeof evt === "string" && typeof fn === "function") {
                    events.register(evt, fn);
                }
                return this;
            };

            // create shortcut bind methods for all gestures
            gestures.split(" ").forEach(function(gesture) {
                this[gesture] = function(fn) {
                    return this.bind(gesture, fn);
                };
            }, that);

            this.start = function(fn) {
                return this.bind("start", fn);
            };

            this.during = function(fn) {
                return this.bind("during", fn);
            };

            this.end = function(fn) {
                return this.bind("end", fn);
            };

            // wrapper to cover all three pinch methods
            this.pinch = function(fns) {
                if(typeof fns !== "undefined") {
                    // if its just a function it gets assigned to pinchend
                    if(typeof fns === "function") {
                        that.pinchend(fns);
                    }
                    else if(typeof fns === "object") {
                        var method;
                        "narrow widen end".split(" ").forEach(function(eventExt) {
                            method = "pinch" + eventExt;
                            if(typeof fns[eventExt] === "function") {
                                that[method](fns[eventExt]);
                            }
                        });
                    }
                }
            };

            this.halt = function() {
                touches.stopListening();
                events.clear();
                delete elementCache.eventSet;
                delete elementCache.touchMonitor;
            };
        },
        EventSet : function(element) {
            // all event names and their associated functions in an array i.e. "swipe" : [fn1, fn2, fn2]
            var eventsTable = {};
            this.eventsTable = eventsTable;

            // register a handler with an event
            this.register = function(eventName, fn) {
                // if the event exists and has handlers attached to it, add this one to the array of them
                if(eventsTable[eventName] && eventsTable[eventName].push) {
                    // make sure multiple copies of the same handler aren't inserted
                    if(!~eventsTable[eventName].indexOf(fn)) {
                        eventsTable[eventName].push(fn);
                    }
                }
                else {
                    // create a new array bound to the event containing only the handler passed in
                    eventsTable[eventName] = [fn];
                }
            };

            this.release = function(eventName, fn) {
                if(typeof eventName === "undefined") return;

                // if a handler hasn't been specified, remove all handlers
                if(typeof fn === "undefined") {
                    for(var handlers in eventsTable.eventName) {
                        delete eventsTable.eventName[handlers];
                    }
                }
                else {
                    // pull the given handler from the given event
                    if(eventsTable[eventName] && ~eventsTable[eventName].indexOf(fn))
                    {
                        eventsTable[eventName].splice(eventsTable[eventName].indexOf(fn), 1);
                    }
                }

                // if the event has no more handlers registered to it, get rid of the event completely
                if(eventsTable[eventName] && eventsTable[eventName].length === 0) {
                    delete eventsTable[eventName];
                }
            };

            // completely remove all events and their handlers
            this.clear = function() {
                var events;
                for(events in eventsTable) {
                    delete eventsTable[events];
                }
            };

            // get all the handlers associated with an event
            // return an empty array if nothing is registered with the given event name
            this.getHandlers = function(eventName) {
                if(eventsTable[eventName] && eventsTable[eventName].length) {
                    return eventsTable[eventName];
                }
                else {
                    return [];
                }
            };

            // inject an array of handlers into the event table for the given event
            // this will klobber all current handlers associated with the event
            this.setHandlers = function(eventName, handlers) {
                eventsTable[eventName] = handlers;
            };

            // execute all handlers associated with an event, passing each handler the arguments provided after the event's name.
            this.execute = function(eventName) {
                if(typeof eventName === "undefined") return;

                // if the event asked for exists in the events table
                if(eventsTable[eventName] && eventsTable[eventName].length) {
                    // get the arguments sent to the function
                    var args = Array.prototype.slice.call(arguments, 1);

                    // iterate throuh all the handlers
                    for(var i = 0; i < eventsTable[eventName].length; i++) {
                        // check current handler is a function
                        if(typeof eventsTable[eventName][i] === "function") {
                            // execute handler with the provided arguments
                            eventsTable[eventName][i].apply(element, args);
                        }
                    }
                }
            };
        },

        TouchMonitor : function(element)
        {
            var cacheId = Jester.cacheId,
                elementId = element[cacheId],
                cache = Jester.cache,
                elementCache = cache[elementId],
                opts = elementCache.options;

            opts.move           = opts.move                 ||    {};
            opts.scale          = opts.scale                ||    {};

            opts.tapDistance    = opts.tapDistance          ||    0;
            opts.tapTime        = opts.tapTime              ||    20;

            opts.doubleTapTime  = opts.doubleTapTime        ||    300;

            opts.swipeDistance  = opts.swipeDistance        ||    200;

            opts.flickTime      = opts.flickTime            ||    300;
            opts.flickDistance  = opts.flickDistance        ||    200;

            opts.deadX          = opts.deadX                ||    0;
            opts.deadY          = opts.deadY                ||    0;

            if(opts.capture !== false) opts.capture = true;
            if(typeof opts.preventDefault !== "undefined" && opts.preventDefault !== false) opts.preventDefault = true;
            if(typeof opts.preventDefault !== "undefined" && opts.stopPropagation !== false) opts.stopPropagation = true;

            var eventSet = elementCache.eventSet;

            var touches;
            var previousTapTime = 0;

            var touchStart = function(evt) {
                touches = new Jester.TouchGroup(evt);

                eventSet.execute("start", touches, evt);

                if(opts.preventDefault) evt.preventDefault();
                if(opts.stopPropagation) evt.stopPropagation();
            };

            var touchMove = function(evt) {
                touches.update(evt);

                eventSet.execute("during", touches, evt);

                if(opts.preventDefault) evt.preventDefault();
                if(opts.stopPropagation) evt.stopPropagation();

                if(touches.numTouches() == 2) {
                    // pinchnarrow
                    if(touches.delta.scale() < 0.0) {
                        eventSet.execute("pinchnarrow", touches);
                    }

                    // pinchwiden
                    else if(touches.delta.scale() > 0.0) {
                        eventSet.execute("pinchwiden", touches);
                    }
                }
            };

            var touchEnd = function(evt) {

                eventSet.execute("end", touches, evt);

                if(opts.preventDefault) evt.preventDefault();
                if(opts.stopPropagation) evt.stopPropagation();

                if(touches.numTouches() == 1) {
                    // tap
                    if(touches.touch(0).total.x() <= opts.tapDistance && touches.touch(0).total.y() <= opts.tapDistance && touches.touch(0).total.time() < opts.tapTime) {
                        eventSet.execute("tap", touches);
                    }
    
                    // doubletap
                    if(touches.touch(0).total.time() < opts.tapTime) {
                        var now = (new Date()).getTime();
                        if(now - previousTapTime <= opts.doubleTapTime) {
                            eventSet.execute("doubletap", touches);
                        }
                        previousTapTime = now;
                    }

                    // swipe
                    if(Math.abs(touches.touch(0).total.x()) >= opts.swipeDistance) {
                        var swipeDirection = touches.touch(0).total.x() < 0 ? "left" : "right";
                        eventSet.execute("swipe", touches, swipeDirection);
                    }

                    // flick
                    if(Math.abs(touches.touch(0).total.x()) >= opts.flickDistance && touches.touch(0).total.time() <= opts.flickTime) {
                        var flickDirection = touches.touch(0).total.x() < 0 ? "left" : "right";
                        eventSet.execute("flick", touches, flickDirection);
                    }
                }
                else if(touches.numTouches() == 2) {
                    // pinchend
                    if(touches.current.scale() !== 1.0) {
                        var pinchDirection = touches.current.scale() < 1.0 ? "narrowed" : "widened";
                        eventSet.execute("pinchend", touches, pinchDirection);
                    }
                }
            };

            var stopListening = function() {
                element.removeEventListener("touchstart", touchStart, opts.capture);
                element.removeEventListener("touchmove", touchMove, opts.capture);
                element.removeEventListener("touchend", touchEnd, opts.capture);
            };

            element.addEventListener("touchstart", touchStart, opts.capture);
            element.addEventListener("touchmove", touchMove, opts.capture);
            element.addEventListener("touchend", touchEnd, opts.capture);

            return {
                stopListening: stopListening
            };
        },

        TouchGroup : function(event) {
            var that = this;
    
            var numTouches = event.touches.length;
        
            var midpointX = 0;
            var midpointY = 0;
    
            var scale = event.scale;
            var prevScale = scale;
            var deltaScale = scale;

            for(var i = 0; i < numTouches; i++) {
                this["touch" + i] = new Jester.Touch(event.touches[i].pageX, event.touches[i].pageY);
                midpointX = event.touches[i].pageX;
                midpointY = event.touches[i].pageY;
            }

            function getNumTouches() {
                return numTouches;
            }

            function getTouch(num) {
                return that["touch" + num];
            }

            function getMidPointX() {
                return midpointX;
            }
            function getMidPointY() {
                return midpointY;
            }
            function getScale() {
                return scale;
            }
            function getDeltaScale() {
                return deltaScale;
            }

            function updateTouches(event) {
                var mpX = 0;
                var mpY = 0;

                for(var i = 0; i < event.touches.length; i++) {
                    if(i < numTouches) {
                        that["touch" + i].update(event.touches[i].pageX, event.touches[i].pageY);
                        mpX += event.touches[i].pageX;
                        mpY += event.touches[i].pageY;
                    }
                }
                midpointX = mpX / numTouches;
                midpointY = mpY / numTouches;

                prevScale = scale;
                scale = event.scale;
                deltaScale = scale - prevScale;
            }

            return {
                numTouches: getNumTouches,
                touch: getTouch,
                current: {
                    scale: getScale,
                    midX: getMidPointX,
                    midY: getMidPointY
                },
                delta: {
                    scale: getDeltaScale
                },
                update: updateTouches
            };
        },

        Touch : function(_startX, _startY) {
            var startX = _startX,
                startY = _startY,
                startTime = now(),
                currentX = startX,
                currentY = startY,
                currentTime = startTime,
                currentSpeedX = 0,
                currentSpeedY = 0,
                prevX = startX,
                prevY = startX,
                prevTime = startTime,
                prevSpeedX = 0,
                prevSpeedY = 0,
                deltaX = 0,
                deltaY = 0,
                deltaTime = 0,
                deltaSpeedX = 0,
                deltaSpeedY = 0,
                totalX = 0,
                totalY = 0,
                totalTime = 0;

            // position getters
            function getStartX() {
                return startX;
            }
            function getStartY() {
                return startY;
            }
            function getCurrentX() {
                return currentX;
            }
            function getCurrentY() {
                return currentY;
            }
            function getPrevX() {
                return prevX;
            }
            function getPrevY() {
                return prevY;
            }
            function getDeltaX() {
                return deltaX;
            }
            function getDeltaY() {
                return deltaY;
            }
            function getTotalX() {
                return totalX;
            }
            function getTotalY() {
                return totalY;
            }

            // time getters
            function now() {
                return (new Date()).getTime();
            }
            function getStartTime() {
                return startTime;
            }
            function getCurrentTime() {
                return currentTime;
            }
            function getPrevTime() {
                return prevTime;
            }
            function getDeltaTime() {
                return deltaTime;
            }
            function getTotalTime() {
                return totalTime;
            }

            // speed getters
            function getCurrentSpeedX() {
                return currentSpeedX;
            }
            function getCurrentSpeedY() {
                return currentSpeedY;
            }
            function getPrevSpeedX() {
                return prevSpeedX;
            }
            function getPrevSpeedY() {
                return prevSpeedY;
            }
            function getDeltaSpeedX() {
                return deltaSpeedX;
            }
            function getDeltaSpeedY() {
                return deltaSpeedY;
            }

            return {
                start: {
                    x: getStartX,
                    y: getStartY,
                    speedX: 0,
                    speedY: 0,
                    time: getStartTime
                },
                current: {
                    x: getCurrentX,
                    y: getCurrentY,
                    time: getCurrentTime,
                    speedX: getCurrentSpeedX,
                    speedY: getCurrentSpeedY
                },
                prev: {
                    x: getPrevX,
                    y: getPrevY,
                    time: getPrevTime,
                    speedX: getPrevSpeedX,
                    speedY: getPrevSpeedY
                },
                delta: {
                    x: getDeltaX,
                    y: getDeltaY,
                    speedX: getDeltaSpeedX,
                    speedY: getDeltaSpeedY,
                    time: getDeltaTime
                },
                total: {
                    x: getTotalX,
                    y: getTotalY,
                    time: getTotalTime
                },
                update: function(_x, _y) {
                    prevX = currentX;
                    prevY = currentY;
                    currentX = _x;
                    currentY = _y;
                    deltaX = currentX - prevX;
                    deltaY = currentY - prevY;
                    totalX = currentX - startX;
                    totalY = currentY - startY;

                    prevTime = currentTime;
                    currentTime = now();
                    deltaTime = currentTime - prevTime;
                    totalTime = currentTime - startTime;

                    prevSpeedX = currentSpeedX;
                    prevSpeedY = currentSpeedY;
                    currentSpeedX = deltaX / (deltaTime/1000);
                    currentSpeedY = deltaY / (deltaTime/1000);
                    deltaSpeedX = currentSpeedX - prevSpeedX;
                    deltaSpeedY = currentSpeedY - prevSpeedY;
                }
            };
        }
    };

    container.jester = function(el, opts) {
        return new Jester.Watcher(el, opts);
    };

}(Foxtrick));
