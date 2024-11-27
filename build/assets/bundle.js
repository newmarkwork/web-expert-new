(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var imagesloaded = {exports: {}};

	var evEmitter = {exports: {}};

	/**
	 * EvEmitter v2.1.1
	 * Lil' event emitter
	 * MIT License
	 */

	var hasRequiredEvEmitter;

	function requireEvEmitter () {
		if (hasRequiredEvEmitter) return evEmitter.exports;
		hasRequiredEvEmitter = 1;
		(function (module) {
			(function (global, factory) {
			  // universal module definition
			  if (module.exports) {
			    // CommonJS - Browserify, Webpack
			    module.exports = factory();
			  } else {
			    // Browser globals
			    global.EvEmitter = factory();
			  }
			})(typeof window != 'undefined' ? window : commonjsGlobal, function () {
			  function EvEmitter() {}
			  let proto = EvEmitter.prototype;
			  proto.on = function (eventName, listener) {
			    if (!eventName || !listener) return this;

			    // set events hash
			    let events = this._events = this._events || {};
			    // set listeners array
			    let listeners = events[eventName] = events[eventName] || [];
			    // only add once
			    if (!listeners.includes(listener)) {
			      listeners.push(listener);
			    }
			    return this;
			  };
			  proto.once = function (eventName, listener) {
			    if (!eventName || !listener) return this;

			    // add event
			    this.on(eventName, listener);
			    // set once flag
			    // set onceEvents hash
			    let onceEvents = this._onceEvents = this._onceEvents || {};
			    // set onceListeners object
			    let onceListeners = onceEvents[eventName] = onceEvents[eventName] || {};
			    // set flag
			    onceListeners[listener] = true;
			    return this;
			  };
			  proto.off = function (eventName, listener) {
			    let listeners = this._events && this._events[eventName];
			    if (!listeners || !listeners.length) return this;
			    let index = listeners.indexOf(listener);
			    if (index != -1) {
			      listeners.splice(index, 1);
			    }
			    return this;
			  };
			  proto.emitEvent = function (eventName, args) {
			    let listeners = this._events && this._events[eventName];
			    if (!listeners || !listeners.length) return this;

			    // copy over to avoid interference if .off() in listener
			    listeners = listeners.slice(0);
			    args = args || [];
			    // once stuff
			    let onceListeners = this._onceEvents && this._onceEvents[eventName];
			    for (let listener of listeners) {
			      let isOnce = onceListeners && onceListeners[listener];
			      if (isOnce) {
			        // remove listener
			        // remove before trigger to prevent recursion
			        this.off(eventName, listener);
			        // unset once flag
			        delete onceListeners[listener];
			      }
			      // trigger listener
			      listener.apply(this, args);
			    }
			    return this;
			  };
			  proto.allOff = function () {
			    delete this._events;
			    delete this._onceEvents;
			    return this;
			  };
			  return EvEmitter;
			}); 
		} (evEmitter));
		return evEmitter.exports;
	}

	/*!
	 * imagesLoaded v5.0.0
	 * JavaScript is all like "You images are done yet or what?"
	 * MIT License
	 */

	(function (module) {
		(function (window, factory) {
		  // universal module definition
		  if (module.exports) {
		    // CommonJS
		    module.exports = factory(window, requireEvEmitter());
		  } else {
		    // browser global
		    window.imagesLoaded = factory(window, window.EvEmitter);
		  }
		})(typeof window !== 'undefined' ? window : commonjsGlobal, function factory(window, EvEmitter) {
		  let $ = window.jQuery;
		  let console = window.console;

		  // -------------------------- helpers -------------------------- //

		  // turn element or nodeList into an array
		  function makeArray(obj) {
		    // use object if already an array
		    if (Array.isArray(obj)) return obj;
		    let isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
		    // convert nodeList to array
		    if (isArrayLike) return [...obj];

		    // array of single index
		    return [obj];
		  }

		  // -------------------------- imagesLoaded -------------------------- //

		  /**
		   * @param {[Array, Element, NodeList, String]} elem
		   * @param {[Object, Function]} options - if function, use as callback
		   * @param {Function} onAlways - callback function
		   * @returns {ImagesLoaded}
		   */
		  function ImagesLoaded(elem, options, onAlways) {
		    // coerce ImagesLoaded() without new, to be new ImagesLoaded()
		    if (!(this instanceof ImagesLoaded)) {
		      return new ImagesLoaded(elem, options, onAlways);
		    }
		    // use elem as selector string
		    let queryElem = elem;
		    if (typeof elem == 'string') {
		      queryElem = document.querySelectorAll(elem);
		    }
		    // bail if bad element
		    if (!queryElem) {
		      console.error(`Bad element for imagesLoaded ${queryElem || elem}`);
		      return;
		    }
		    this.elements = makeArray(queryElem);
		    this.options = {};
		    // shift arguments if no options set
		    if (typeof options == 'function') {
		      onAlways = options;
		    } else {
		      Object.assign(this.options, options);
		    }
		    if (onAlways) this.on('always', onAlways);
		    this.getImages();
		    // add jQuery Deferred object
		    if ($) this.jqDeferred = new $.Deferred();

		    // HACK check async to allow time to bind listeners
		    setTimeout(this.check.bind(this));
		  }
		  ImagesLoaded.prototype = Object.create(EvEmitter.prototype);
		  ImagesLoaded.prototype.getImages = function () {
		    this.images = [];

		    // filter & find items if we have an item selector
		    this.elements.forEach(this.addElementImages, this);
		  };
		  const elementNodeTypes = [1, 9, 11];

		  /**
		   * @param {Node} elem
		   */
		  ImagesLoaded.prototype.addElementImages = function (elem) {
		    // filter siblings
		    if (elem.nodeName === 'IMG') {
		      this.addImage(elem);
		    }
		    // get background image on element
		    if (this.options.background === true) {
		      this.addElementBackgroundImages(elem);
		    }

		    // find children
		    // no non-element nodes, #143
		    let {
		      nodeType
		    } = elem;
		    if (!nodeType || !elementNodeTypes.includes(nodeType)) return;
		    let childImgs = elem.querySelectorAll('img');
		    // concat childElems to filterFound array
		    for (let img of childImgs) {
		      this.addImage(img);
		    }

		    // get child background images
		    if (typeof this.options.background == 'string') {
		      let children = elem.querySelectorAll(this.options.background);
		      for (let child of children) {
		        this.addElementBackgroundImages(child);
		      }
		    }
		  };
		  const reURL = /url\((['"])?(.*?)\1\)/gi;
		  ImagesLoaded.prototype.addElementBackgroundImages = function (elem) {
		    let style = getComputedStyle(elem);
		    // Firefox returns null if in a hidden iframe https://bugzil.la/548397
		    if (!style) return;

		    // get url inside url("...")
		    let matches = reURL.exec(style.backgroundImage);
		    while (matches !== null) {
		      let url = matches && matches[2];
		      if (url) {
		        this.addBackground(url, elem);
		      }
		      matches = reURL.exec(style.backgroundImage);
		    }
		  };

		  /**
		   * @param {Image} img
		   */
		  ImagesLoaded.prototype.addImage = function (img) {
		    let loadingImage = new LoadingImage(img);
		    this.images.push(loadingImage);
		  };
		  ImagesLoaded.prototype.addBackground = function (url, elem) {
		    let background = new Background(url, elem);
		    this.images.push(background);
		  };
		  ImagesLoaded.prototype.check = function () {
		    this.progressedCount = 0;
		    this.hasAnyBroken = false;
		    // complete if no images
		    if (!this.images.length) {
		      this.complete();
		      return;
		    }

		    /* eslint-disable-next-line func-style */
		    let onProgress = (image, elem, message) => {
		      // HACK - Chrome triggers event before object properties have changed. #83
		      setTimeout(() => {
		        this.progress(image, elem, message);
		      });
		    };
		    this.images.forEach(function (loadingImage) {
		      loadingImage.once('progress', onProgress);
		      loadingImage.check();
		    });
		  };
		  ImagesLoaded.prototype.progress = function (image, elem, message) {
		    this.progressedCount++;
		    this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
		    // progress event
		    this.emitEvent('progress', [this, image, elem]);
		    if (this.jqDeferred && this.jqDeferred.notify) {
		      this.jqDeferred.notify(this, image);
		    }
		    // check if completed
		    if (this.progressedCount === this.images.length) {
		      this.complete();
		    }
		    if (this.options.debug && console) {
		      console.log(`progress: ${message}`, image, elem);
		    }
		  };
		  ImagesLoaded.prototype.complete = function () {
		    let eventName = this.hasAnyBroken ? 'fail' : 'done';
		    this.isComplete = true;
		    this.emitEvent(eventName, [this]);
		    this.emitEvent('always', [this]);
		    if (this.jqDeferred) {
		      let jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
		      this.jqDeferred[jqMethod](this);
		    }
		  };

		  // --------------------------  -------------------------- //

		  function LoadingImage(img) {
		    this.img = img;
		  }
		  LoadingImage.prototype = Object.create(EvEmitter.prototype);
		  LoadingImage.prototype.check = function () {
		    // If complete is true and browser supports natural sizes,
		    // try to check for image status manually.
		    let isComplete = this.getIsImageComplete();
		    if (isComplete) {
		      // report based on naturalWidth
		      this.confirm(this.img.naturalWidth !== 0, 'naturalWidth');
		      return;
		    }

		    // If none of the checks above matched, simulate loading on detached element.
		    this.proxyImage = new Image();
		    // add crossOrigin attribute. #204
		    if (this.img.crossOrigin) {
		      this.proxyImage.crossOrigin = this.img.crossOrigin;
		    }
		    this.proxyImage.addEventListener('load', this);
		    this.proxyImage.addEventListener('error', this);
		    // bind to image as well for Firefox. #191
		    this.img.addEventListener('load', this);
		    this.img.addEventListener('error', this);
		    this.proxyImage.src = this.img.currentSrc || this.img.src;
		  };
		  LoadingImage.prototype.getIsImageComplete = function () {
		    // check for non-zero, non-undefined naturalWidth
		    // fixes Safari+InfiniteScroll+Masonry bug infinite-scroll#671
		    return this.img.complete && this.img.naturalWidth;
		  };
		  LoadingImage.prototype.confirm = function (isLoaded, message) {
		    this.isLoaded = isLoaded;
		    let {
		      parentNode
		    } = this.img;
		    // emit progress with parent <picture> or self <img>
		    let elem = parentNode.nodeName === 'PICTURE' ? parentNode : this.img;
		    this.emitEvent('progress', [this, elem, message]);
		  };

		  // ----- events ----- //

		  // trigger specified handler for event type
		  LoadingImage.prototype.handleEvent = function (event) {
		    let method = 'on' + event.type;
		    if (this[method]) {
		      this[method](event);
		    }
		  };
		  LoadingImage.prototype.onload = function () {
		    this.confirm(true, 'onload');
		    this.unbindEvents();
		  };
		  LoadingImage.prototype.onerror = function () {
		    this.confirm(false, 'onerror');
		    this.unbindEvents();
		  };
		  LoadingImage.prototype.unbindEvents = function () {
		    this.proxyImage.removeEventListener('load', this);
		    this.proxyImage.removeEventListener('error', this);
		    this.img.removeEventListener('load', this);
		    this.img.removeEventListener('error', this);
		  };

		  // -------------------------- Background -------------------------- //

		  function Background(url, element) {
		    this.url = url;
		    this.element = element;
		    this.img = new Image();
		  }

		  // inherit LoadingImage prototype
		  Background.prototype = Object.create(LoadingImage.prototype);
		  Background.prototype.check = function () {
		    this.img.addEventListener('load', this);
		    this.img.addEventListener('error', this);
		    this.img.src = this.url;
		    // check if image is already complete
		    let isComplete = this.getIsImageComplete();
		    if (isComplete) {
		      this.confirm(this.img.naturalWidth !== 0, 'naturalWidth');
		      this.unbindEvents();
		    }
		  };
		  Background.prototype.unbindEvents = function () {
		    this.img.removeEventListener('load', this);
		    this.img.removeEventListener('error', this);
		  };
		  Background.prototype.confirm = function (isLoaded, message) {
		    this.isLoaded = isLoaded;
		    this.emitEvent('progress', [this, this.element, message]);
		  };

		  // -------------------------- jQuery -------------------------- //

		  ImagesLoaded.makeJQueryPlugin = function (jQuery) {
		    jQuery = jQuery || window.jQuery;
		    if (!jQuery) return;

		    // set local variable
		    $ = jQuery;
		    // $().imagesLoaded()
		    $.fn.imagesLoaded = function (options, onAlways) {
		      let instance = new ImagesLoaded(this, options, onAlways);
		      return instance.jqDeferred.promise($(this));
		    };
		  };
		  // try making plugin
		  ImagesLoaded.makeJQueryPlugin();

		  // --------------------------  -------------------------- //

		  return ImagesLoaded;
		}); 
	} (imagesloaded));

	var imagesloadedExports = imagesloaded.exports;
	var imagesLoaded = /*@__PURE__*/getDefaultExportFromCjs(imagesloadedExports);

	function _assertThisInitialized(self) {
	  if (self === void 0) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }
	  return self;
	}
	function _inheritsLoose(subClass, superClass) {
	  subClass.prototype = Object.create(superClass.prototype);
	  subClass.prototype.constructor = subClass;
	  subClass.__proto__ = superClass;
	}

	/*!
	 * GSAP 3.11.4
	 * https://greensock.com
	 *
	 * @license Copyright 2008-2022, GreenSock. All rights reserved.
	 * Subject to the terms at https://greensock.com/standard-license or for
	 * Club GreenSock members, the agreement issued with that membership.
	 * @author: Jack Doyle, jack@greensock.com
	*/

	/* eslint-disable */
	var _config = {
	    autoSleep: 120,
	    force3D: "auto",
	    nullTargetWarn: 1,
	    units: {
	      lineHeight: ""
	    }
	  },
	  _defaults$1 = {
	    duration: .5,
	    overwrite: false,
	    delay: 0
	  },
	  _suppressOverwrites$1,
	  _reverting$1,
	  _context$2,
	  _bigNum$1 = 1e8,
	  _tinyNum = 1 / _bigNum$1,
	  _2PI = Math.PI * 2,
	  _HALF_PI = _2PI / 4,
	  _gsID = 0,
	  _sqrt = Math.sqrt,
	  _cos = Math.cos,
	  _sin = Math.sin,
	  _isString$1 = function _isString(value) {
	    return typeof value === "string";
	  },
	  _isFunction$1 = function _isFunction(value) {
	    return typeof value === "function";
	  },
	  _isNumber$1 = function _isNumber(value) {
	    return typeof value === "number";
	  },
	  _isUndefined = function _isUndefined(value) {
	    return typeof value === "undefined";
	  },
	  _isObject$1 = function _isObject(value) {
	    return typeof value === "object";
	  },
	  _isNotFalse = function _isNotFalse(value) {
	    return value !== false;
	  },
	  _windowExists$2 = function _windowExists() {
	    return typeof window !== "undefined";
	  },
	  _isFuncOrString = function _isFuncOrString(value) {
	    return _isFunction$1(value) || _isString$1(value);
	  },
	  _isTypedArray = typeof ArrayBuffer === "function" && ArrayBuffer.isView || function () {},
	  // note: IE10 has ArrayBuffer, but NOT ArrayBuffer.isView().
	  _isArray = Array.isArray,
	  _strictNumExp = /(?:-?\.?\d|\.)+/gi,
	  //only numbers (including negatives and decimals) but NOT relative values.
	  _numExp = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,
	  //finds any numbers, including ones that start with += or -=, negative numbers, and ones in scientific notation like 1e-8.
	  _numWithUnitExp = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g,
	  _complexStringNumExp = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,
	  //duplicate so that while we're looping through matches from exec(), it doesn't contaminate the lastIndex of _numExp which we use to search for colors too.
	  _relExp = /[+-]=-?[.\d]+/,
	  _delimitedValueExp = /[^,'"\[\]\s]+/gi,
	  // previously /[#\-+.]*\b[a-z\d\-=+%.]+/gi but didn't catch special characters.
	  _unitExp = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,
	  _globalTimeline,
	  _win$3,
	  _coreInitted$2,
	  _doc$3,
	  _globals = {},
	  _installScope = {},
	  _coreReady,
	  _install = function _install(scope) {
	    return (_installScope = _merge(scope, _globals)) && gsap$2;
	  },
	  _missingPlugin = function _missingPlugin(property, value) {
	    return console.warn("Invalid property", property, "set to", value, "Missing plugin? gsap.registerPlugin()");
	  },
	  _warn = function _warn(message, suppress) {
	    return !suppress && console.warn(message);
	  },
	  _addGlobal = function _addGlobal(name, obj) {
	    return name && (_globals[name] = obj) && _installScope && (_installScope[name] = obj) || _globals;
	  },
	  _emptyFunc = function _emptyFunc() {
	    return 0;
	  },
	  _startAtRevertConfig = {
	    suppressEvents: true,
	    isStart: true,
	    kill: false
	  },
	  _revertConfigNoKill = {
	    suppressEvents: true,
	    kill: false
	  },
	  _revertConfig = {
	    suppressEvents: true
	  },
	  _reservedProps = {},
	  _lazyTweens = [],
	  _lazyLookup = {},
	  _lastRenderedFrame,
	  _plugins = {},
	  _effects = {},
	  _nextGCFrame = 30,
	  _harnessPlugins = [],
	  _callbackNames = "",
	  _harness = function _harness(targets) {
	    var target = targets[0],
	      harnessPlugin,
	      i;
	    _isObject$1(target) || _isFunction$1(target) || (targets = [targets]);
	    if (!(harnessPlugin = (target._gsap || {}).harness)) {
	      // find the first target with a harness. We assume targets passed into an animation will be of similar type, meaning the same kind of harness can be used for them all (performance optimization)
	      i = _harnessPlugins.length;
	      while (i-- && !_harnessPlugins[i].targetTest(target)) {}
	      harnessPlugin = _harnessPlugins[i];
	    }
	    i = targets.length;
	    while (i--) {
	      targets[i] && (targets[i]._gsap || (targets[i]._gsap = new GSCache(targets[i], harnessPlugin))) || targets.splice(i, 1);
	    }
	    return targets;
	  },
	  _getCache = function _getCache(target) {
	    return target._gsap || _harness(toArray(target))[0]._gsap;
	  },
	  _getProperty = function _getProperty(target, property, v) {
	    return (v = target[property]) && _isFunction$1(v) ? target[property]() : _isUndefined(v) && target.getAttribute && target.getAttribute(property) || v;
	  },
	  _forEachName = function _forEachName(names, func) {
	    return (names = names.split(",")).forEach(func) || names;
	  },
	  //split a comma-delimited list of names into an array, then run a forEach() function and return the split array (this is just a way to consolidate/shorten some code).
	  _round$1 = function _round(value) {
	    return Math.round(value * 100000) / 100000 || 0;
	  },
	  _roundPrecise = function _roundPrecise(value) {
	    return Math.round(value * 10000000) / 10000000 || 0;
	  },
	  // increased precision mostly for timing values.
	  _parseRelative = function _parseRelative(start, value) {
	    var operator = value.charAt(0),
	      end = parseFloat(value.substr(2));
	    start = parseFloat(start);
	    return operator === "+" ? start + end : operator === "-" ? start - end : operator === "*" ? start * end : start / end;
	  },
	  _arrayContainsAny = function _arrayContainsAny(toSearch, toFind) {
	    //searches one array to find matches for any of the items in the toFind array. As soon as one is found, it returns true. It does NOT return all the matches; it's simply a boolean search.
	    var l = toFind.length,
	      i = 0;
	    for (; toSearch.indexOf(toFind[i]) < 0 && ++i < l;) {}
	    return i < l;
	  },
	  _lazyRender = function _lazyRender() {
	    var l = _lazyTweens.length,
	      a = _lazyTweens.slice(0),
	      i,
	      tween;
	    _lazyLookup = {};
	    _lazyTweens.length = 0;
	    for (i = 0; i < l; i++) {
	      tween = a[i];
	      tween && tween._lazy && (tween.render(tween._lazy[0], tween._lazy[1], true)._lazy = 0);
	    }
	  },
	  _lazySafeRender = function _lazySafeRender(animation, time, suppressEvents, force) {
	    _lazyTweens.length && !_reverting$1 && _lazyRender();
	    animation.render(time, suppressEvents, _reverting$1 && time < 0 && (animation._initted || animation._startAt));
	    _lazyTweens.length && !_reverting$1 && _lazyRender(); //in case rendering caused any tweens to lazy-init, we should render them because typically when someone calls seek() or time() or progress(), they expect an immediate render.
	  },
	  _numericIfPossible = function _numericIfPossible(value) {
	    var n = parseFloat(value);
	    return (n || n === 0) && (value + "").match(_delimitedValueExp).length < 2 ? n : _isString$1(value) ? value.trim() : value;
	  },
	  _passThrough$1 = function _passThrough(p) {
	    return p;
	  },
	  _setDefaults$1 = function _setDefaults(obj, defaults) {
	    for (var p in defaults) {
	      p in obj || (obj[p] = defaults[p]);
	    }
	    return obj;
	  },
	  _setKeyframeDefaults = function _setKeyframeDefaults(excludeDuration) {
	    return function (obj, defaults) {
	      for (var p in defaults) {
	        p in obj || p === "duration" && excludeDuration || p === "ease" || (obj[p] = defaults[p]);
	      }
	    };
	  },
	  _merge = function _merge(base, toMerge) {
	    for (var p in toMerge) {
	      base[p] = toMerge[p];
	    }
	    return base;
	  },
	  _mergeDeep = function _mergeDeep(base, toMerge) {
	    for (var p in toMerge) {
	      p !== "__proto__" && p !== "constructor" && p !== "prototype" && (base[p] = _isObject$1(toMerge[p]) ? _mergeDeep(base[p] || (base[p] = {}), toMerge[p]) : toMerge[p]);
	    }
	    return base;
	  },
	  _copyExcluding = function _copyExcluding(obj, excluding) {
	    var copy = {},
	      p;
	    for (p in obj) {
	      p in excluding || (copy[p] = obj[p]);
	    }
	    return copy;
	  },
	  _inheritDefaults = function _inheritDefaults(vars) {
	    var parent = vars.parent || _globalTimeline,
	      func = vars.keyframes ? _setKeyframeDefaults(_isArray(vars.keyframes)) : _setDefaults$1;
	    if (_isNotFalse(vars.inherit)) {
	      while (parent) {
	        func(vars, parent.vars.defaults);
	        parent = parent.parent || parent._dp;
	      }
	    }
	    return vars;
	  },
	  _arraysMatch = function _arraysMatch(a1, a2) {
	    var i = a1.length,
	      match = i === a2.length;
	    while (match && i-- && a1[i] === a2[i]) {}
	    return i < 0;
	  },
	  _addLinkedListItem = function _addLinkedListItem(parent, child, firstProp, lastProp, sortBy) {
	    var prev = parent[lastProp],
	      t;
	    if (sortBy) {
	      t = child[sortBy];
	      while (prev && prev[sortBy] > t) {
	        prev = prev._prev;
	      }
	    }
	    if (prev) {
	      child._next = prev._next;
	      prev._next = child;
	    } else {
	      child._next = parent[firstProp];
	      parent[firstProp] = child;
	    }
	    if (child._next) {
	      child._next._prev = child;
	    } else {
	      parent[lastProp] = child;
	    }
	    child._prev = prev;
	    child.parent = child._dp = parent;
	    return child;
	  },
	  _removeLinkedListItem = function _removeLinkedListItem(parent, child, firstProp, lastProp) {
	    if (firstProp === void 0) {
	      firstProp = "_first";
	    }
	    if (lastProp === void 0) {
	      lastProp = "_last";
	    }
	    var prev = child._prev,
	      next = child._next;
	    if (prev) {
	      prev._next = next;
	    } else if (parent[firstProp] === child) {
	      parent[firstProp] = next;
	    }
	    if (next) {
	      next._prev = prev;
	    } else if (parent[lastProp] === child) {
	      parent[lastProp] = prev;
	    }
	    child._next = child._prev = child.parent = null; // don't delete the _dp just so we can revert if necessary. But parent should be null to indicate the item isn't in a linked list.
	  },
	  _removeFromParent = function _removeFromParent(child, onlyIfParentHasAutoRemove) {
	    child.parent && (!onlyIfParentHasAutoRemove || child.parent.autoRemoveChildren) && child.parent.remove(child);
	    child._act = 0;
	  },
	  _uncache = function _uncache(animation, child) {
	    if (animation && (!child || child._end > animation._dur || child._start < 0)) {
	      // performance optimization: if a child animation is passed in we should only uncache if that child EXTENDS the animation (its end time is beyond the end)
	      var a = animation;
	      while (a) {
	        a._dirty = 1;
	        a = a.parent;
	      }
	    }
	    return animation;
	  },
	  _recacheAncestors = function _recacheAncestors(animation) {
	    var parent = animation.parent;
	    while (parent && parent.parent) {
	      //sometimes we must force a re-sort of all children and update the duration/totalDuration of all ancestor timelines immediately in case, for example, in the middle of a render loop, one tween alters another tween's timeScale which shoves its startTime before 0, forcing the parent timeline to shift around and shiftChildren() which could affect that next tween's render (startTime). Doesn't matter for the root timeline though.
	      parent._dirty = 1;
	      parent.totalDuration();
	      parent = parent.parent;
	    }
	    return animation;
	  },
	  _rewindStartAt = function _rewindStartAt(tween, totalTime, suppressEvents, force) {
	    return tween._startAt && (_reverting$1 ? tween._startAt.revert(_revertConfigNoKill) : tween.vars.immediateRender && !tween.vars.autoRevert || tween._startAt.render(totalTime, true, force));
	  },
	  _hasNoPausedAncestors = function _hasNoPausedAncestors(animation) {
	    return !animation || animation._ts && _hasNoPausedAncestors(animation.parent);
	  },
	  _elapsedCycleDuration = function _elapsedCycleDuration(animation) {
	    return animation._repeat ? _animationCycle(animation._tTime, animation = animation.duration() + animation._rDelay) * animation : 0;
	  },
	  // feed in the totalTime and cycleDuration and it'll return the cycle (iteration minus 1) and if the playhead is exactly at the very END, it will NOT bump up to the next cycle.
	  _animationCycle = function _animationCycle(tTime, cycleDuration) {
	    var whole = Math.floor(tTime /= cycleDuration);
	    return tTime && whole === tTime ? whole - 1 : whole;
	  },
	  _parentToChildTotalTime = function _parentToChildTotalTime(parentTime, child) {
	    return (parentTime - child._start) * child._ts + (child._ts >= 0 ? 0 : child._dirty ? child.totalDuration() : child._tDur);
	  },
	  _setEnd = function _setEnd(animation) {
	    return animation._end = _roundPrecise(animation._start + (animation._tDur / Math.abs(animation._ts || animation._rts || _tinyNum) || 0));
	  },
	  _alignPlayhead = function _alignPlayhead(animation, totalTime) {
	    // adjusts the animation's _start and _end according to the provided totalTime (only if the parent's smoothChildTiming is true and the animation isn't paused). It doesn't do any rendering or forcing things back into parent timelines, etc. - that's what totalTime() is for.
	    var parent = animation._dp;
	    if (parent && parent.smoothChildTiming && animation._ts) {
	      animation._start = _roundPrecise(parent._time - (animation._ts > 0 ? totalTime / animation._ts : ((animation._dirty ? animation.totalDuration() : animation._tDur) - totalTime) / -animation._ts));
	      _setEnd(animation);
	      parent._dirty || _uncache(parent, animation); //for performance improvement. If the parent's cache is already dirty, it already took care of marking the ancestors as dirty too, so skip the function call here.
	    }
	    return animation;
	  },
	  /*
	  _totalTimeToTime = (clampedTotalTime, duration, repeat, repeatDelay, yoyo) => {
	  	let cycleDuration = duration + repeatDelay,
	  		time = _round(clampedTotalTime % cycleDuration);
	  	if (time > duration) {
	  		time = duration;
	  	}
	  	return (yoyo && (~~(clampedTotalTime / cycleDuration) & 1)) ? duration - time : time;
	  },
	  */
	  _postAddChecks = function _postAddChecks(timeline, child) {
	    var t;
	    if (child._time || child._initted && !child._dur) {
	      //in case, for example, the _start is moved on a tween that has already rendered. Imagine it's at its end state, then the startTime is moved WAY later (after the end of this timeline), it should render at its beginning.
	      t = _parentToChildTotalTime(timeline.rawTime(), child);
	      if (!child._dur || _clamp$1(0, child.totalDuration(), t) - child._tTime > _tinyNum) {
	        child.render(t, true);
	      }
	    } //if the timeline has already ended but the inserted tween/timeline extends the duration, we should enable this timeline again so that it renders properly. We should also align the playhead with the parent timeline's when appropriate.

	    if (_uncache(timeline, child)._dp && timeline._initted && timeline._time >= timeline._dur && timeline._ts) {
	      //in case any of the ancestors had completed but should now be enabled...
	      if (timeline._dur < timeline.duration()) {
	        t = timeline;
	        while (t._dp) {
	          t.rawTime() >= 0 && t.totalTime(t._tTime); //moves the timeline (shifts its startTime) if necessary, and also enables it. If it's currently zero, though, it may not be scheduled to render until later so there's no need to force it to align with the current playhead position. Only move to catch up with the playhead.

	          t = t._dp;
	        }
	      }
	      timeline._zTime = -_tinyNum; // helps ensure that the next render() will be forced (crossingStart = true in render()), even if the duration hasn't changed (we're adding a child which would need to get rendered). Definitely an edge case. Note: we MUST do this AFTER the loop above where the totalTime() might trigger a render() because this _addToTimeline() method gets called from the Animation constructor, BEFORE tweens even record their targets, etc. so we wouldn't want things to get triggered in the wrong order.
	    }
	  },
	  _addToTimeline = function _addToTimeline(timeline, child, position, skipChecks) {
	    child.parent && _removeFromParent(child);
	    child._start = _roundPrecise((_isNumber$1(position) ? position : position || timeline !== _globalTimeline ? _parsePosition$1(timeline, position, child) : timeline._time) + child._delay);
	    child._end = _roundPrecise(child._start + (child.totalDuration() / Math.abs(child.timeScale()) || 0));
	    _addLinkedListItem(timeline, child, "_first", "_last", timeline._sort ? "_start" : 0);
	    _isFromOrFromStart(child) || (timeline._recent = child);
	    skipChecks || _postAddChecks(timeline, child);
	    timeline._ts < 0 && _alignPlayhead(timeline, timeline._tTime); // if the timeline is reversed and the new child makes it longer, we may need to adjust the parent's _start (push it back)

	    return timeline;
	  },
	  _scrollTrigger = function _scrollTrigger(animation, trigger) {
	    return (_globals.ScrollTrigger || _missingPlugin("scrollTrigger", trigger)) && _globals.ScrollTrigger.create(trigger, animation);
	  },
	  _attemptInitTween = function _attemptInitTween(tween, time, force, suppressEvents, tTime) {
	    _initTween(tween, time, tTime);
	    if (!tween._initted) {
	      return 1;
	    }
	    if (!force && tween._pt && !_reverting$1 && (tween._dur && tween.vars.lazy !== false || !tween._dur && tween.vars.lazy) && _lastRenderedFrame !== _ticker.frame) {
	      _lazyTweens.push(tween);
	      tween._lazy = [tTime, suppressEvents];
	      return 1;
	    }
	  },
	  _parentPlayheadIsBeforeStart = function _parentPlayheadIsBeforeStart(_ref) {
	    var parent = _ref.parent;
	    return parent && parent._ts && parent._initted && !parent._lock && (parent.rawTime() < 0 || _parentPlayheadIsBeforeStart(parent));
	  },
	  // check parent's _lock because when a timeline repeats/yoyos and does its artificial wrapping, we shouldn't force the ratio back to 0
	  _isFromOrFromStart = function _isFromOrFromStart(_ref2) {
	    var data = _ref2.data;
	    return data === "isFromStart" || data === "isStart";
	  },
	  _renderZeroDurationTween = function _renderZeroDurationTween(tween, totalTime, suppressEvents, force) {
	    var prevRatio = tween.ratio,
	      ratio = totalTime < 0 || !totalTime && (!tween._start && _parentPlayheadIsBeforeStart(tween) && !(!tween._initted && _isFromOrFromStart(tween)) || (tween._ts < 0 || tween._dp._ts < 0) && !_isFromOrFromStart(tween)) ? 0 : 1,
	      // if the tween or its parent is reversed and the totalTime is 0, we should go to a ratio of 0. Edge case: if a from() or fromTo() stagger tween is placed later in a timeline, the "startAt" zero-duration tween could initially render at a time when the parent timeline's playhead is technically BEFORE where this tween is, so make sure that any "from" and "fromTo" startAt tweens are rendered the first time at a ratio of 1.
	      repeatDelay = tween._rDelay,
	      tTime = 0,
	      pt,
	      iteration,
	      prevIteration;
	    if (repeatDelay && tween._repeat) {
	      // in case there's a zero-duration tween that has a repeat with a repeatDelay
	      tTime = _clamp$1(0, tween._tDur, totalTime);
	      iteration = _animationCycle(tTime, repeatDelay);
	      tween._yoyo && iteration & 1 && (ratio = 1 - ratio);
	      if (iteration !== _animationCycle(tween._tTime, repeatDelay)) {
	        // if iteration changed
	        prevRatio = 1 - ratio;
	        tween.vars.repeatRefresh && tween._initted && tween.invalidate();
	      }
	    }
	    if (ratio !== prevRatio || _reverting$1 || force || tween._zTime === _tinyNum || !totalTime && tween._zTime) {
	      if (!tween._initted && _attemptInitTween(tween, totalTime, force, suppressEvents, tTime)) {
	        // if we render the very beginning (time == 0) of a fromTo(), we must force the render (normal tweens wouldn't need to render at a time of 0 when the prevTime was also 0). This is also mandatory to make sure overwriting kicks in immediately.
	        return;
	      }
	      prevIteration = tween._zTime;
	      tween._zTime = totalTime || (suppressEvents ? _tinyNum : 0); // when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration tween, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect.

	      suppressEvents || (suppressEvents = totalTime && !prevIteration); // if it was rendered previously at exactly 0 (_zTime) and now the playhead is moving away, DON'T fire callbacks otherwise they'll seem like duplicates.

	      tween.ratio = ratio;
	      tween._from && (ratio = 1 - ratio);
	      tween._time = 0;
	      tween._tTime = tTime;
	      pt = tween._pt;
	      while (pt) {
	        pt.r(ratio, pt.d);
	        pt = pt._next;
	      }
	      totalTime < 0 && _rewindStartAt(tween, totalTime, suppressEvents, true);
	      tween._onUpdate && !suppressEvents && _callback$1(tween, "onUpdate");
	      tTime && tween._repeat && !suppressEvents && tween.parent && _callback$1(tween, "onRepeat");
	      if ((totalTime >= tween._tDur || totalTime < 0) && tween.ratio === ratio) {
	        ratio && _removeFromParent(tween, 1);
	        if (!suppressEvents && !_reverting$1) {
	          _callback$1(tween, ratio ? "onComplete" : "onReverseComplete", true);
	          tween._prom && tween._prom();
	        }
	      }
	    } else if (!tween._zTime) {
	      tween._zTime = totalTime;
	    }
	  },
	  _findNextPauseTween = function _findNextPauseTween(animation, prevTime, time) {
	    var child;
	    if (time > prevTime) {
	      child = animation._first;
	      while (child && child._start <= time) {
	        if (child.data === "isPause" && child._start > prevTime) {
	          return child;
	        }
	        child = child._next;
	      }
	    } else {
	      child = animation._last;
	      while (child && child._start >= time) {
	        if (child.data === "isPause" && child._start < prevTime) {
	          return child;
	        }
	        child = child._prev;
	      }
	    }
	  },
	  _setDuration = function _setDuration(animation, duration, skipUncache, leavePlayhead) {
	    var repeat = animation._repeat,
	      dur = _roundPrecise(duration) || 0,
	      totalProgress = animation._tTime / animation._tDur;
	    totalProgress && !leavePlayhead && (animation._time *= dur / animation._dur);
	    animation._dur = dur;
	    animation._tDur = !repeat ? dur : repeat < 0 ? 1e10 : _roundPrecise(dur * (repeat + 1) + animation._rDelay * repeat);
	    totalProgress > 0 && !leavePlayhead && _alignPlayhead(animation, animation._tTime = animation._tDur * totalProgress);
	    animation.parent && _setEnd(animation);
	    skipUncache || _uncache(animation.parent, animation);
	    return animation;
	  },
	  _onUpdateTotalDuration = function _onUpdateTotalDuration(animation) {
	    return animation instanceof Timeline ? _uncache(animation) : _setDuration(animation, animation._dur);
	  },
	  _zeroPosition = {
	    _start: 0,
	    endTime: _emptyFunc,
	    totalDuration: _emptyFunc
	  },
	  _parsePosition$1 = function _parsePosition(animation, position, percentAnimation) {
	    var labels = animation.labels,
	      recent = animation._recent || _zeroPosition,
	      clippedDuration = animation.duration() >= _bigNum$1 ? recent.endTime(false) : animation._dur,
	      //in case there's a child that infinitely repeats, users almost never intend for the insertion point of a new child to be based on a SUPER long value like that so we clip it and assume the most recently-added child's endTime should be used instead.
	      i,
	      offset,
	      isPercent;
	    if (_isString$1(position) && (isNaN(position) || position in labels)) {
	      //if the string is a number like "1", check to see if there's a label with that name, otherwise interpret it as a number (absolute value).
	      offset = position.charAt(0);
	      isPercent = position.substr(-1) === "%";
	      i = position.indexOf("=");
	      if (offset === "<" || offset === ">") {
	        i >= 0 && (position = position.replace(/=/, ""));
	        return (offset === "<" ? recent._start : recent.endTime(recent._repeat >= 0)) + (parseFloat(position.substr(1)) || 0) * (isPercent ? (i < 0 ? recent : percentAnimation).totalDuration() / 100 : 1);
	      }
	      if (i < 0) {
	        position in labels || (labels[position] = clippedDuration);
	        return labels[position];
	      }
	      offset = parseFloat(position.charAt(i - 1) + position.substr(i + 1));
	      if (isPercent && percentAnimation) {
	        offset = offset / 100 * (_isArray(percentAnimation) ? percentAnimation[0] : percentAnimation).totalDuration();
	      }
	      return i > 1 ? _parsePosition(animation, position.substr(0, i - 1), percentAnimation) + offset : clippedDuration + offset;
	    }
	    return position == null ? clippedDuration : +position;
	  },
	  _createTweenType = function _createTweenType(type, params, timeline) {
	    var isLegacy = _isNumber$1(params[1]),
	      varsIndex = (isLegacy ? 2 : 1) + (type < 2 ? 0 : 1),
	      vars = params[varsIndex],
	      irVars,
	      parent;
	    isLegacy && (vars.duration = params[1]);
	    vars.parent = timeline;
	    if (type) {
	      irVars = vars;
	      parent = timeline;
	      while (parent && !("immediateRender" in irVars)) {
	        // inheritance hasn't happened yet, but someone may have set a default in an ancestor timeline. We could do vars.immediateRender = _isNotFalse(_inheritDefaults(vars).immediateRender) but that'd exact a slight performance penalty because _inheritDefaults() also runs in the Tween constructor. We're paying a small kb price here to gain speed.
	        irVars = parent.vars.defaults || {};
	        parent = _isNotFalse(parent.vars.inherit) && parent.parent;
	      }
	      vars.immediateRender = _isNotFalse(irVars.immediateRender);
	      type < 2 ? vars.runBackwards = 1 : vars.startAt = params[varsIndex - 1]; // "from" vars
	    }
	    return new Tween(params[0], vars, params[varsIndex + 1]);
	  },
	  _conditionalReturn = function _conditionalReturn(value, func) {
	    return value || value === 0 ? func(value) : func;
	  },
	  _clamp$1 = function _clamp(min, max, value) {
	    return value < min ? min : value > max ? max : value;
	  },
	  getUnit = function getUnit(value, v) {
	    return !_isString$1(value) || !(v = _unitExp.exec(value)) ? "" : v[1];
	  },
	  // note: protect against padded numbers as strings, like "100.100". That shouldn't return "00" as the unit. If it's numeric, return no unit.
	  clamp = function clamp(min, max, value) {
	    return _conditionalReturn(value, function (v) {
	      return _clamp$1(min, max, v);
	    });
	  },
	  _slice = [].slice,
	  _isArrayLike = function _isArrayLike(value, nonEmpty) {
	    return value && _isObject$1(value) && "length" in value && (!nonEmpty && !value.length || value.length - 1 in value && _isObject$1(value[0])) && !value.nodeType && value !== _win$3;
	  },
	  _flatten = function _flatten(ar, leaveStrings, accumulator) {
	    if (accumulator === void 0) {
	      accumulator = [];
	    }
	    return ar.forEach(function (value) {
	      var _accumulator;
	      return _isString$1(value) && !leaveStrings || _isArrayLike(value, 1) ? (_accumulator = accumulator).push.apply(_accumulator, toArray(value)) : accumulator.push(value);
	    }) || accumulator;
	  },
	  //takes any value and returns an array. If it's a string (and leaveStrings isn't true), it'll use document.querySelectorAll() and convert that to an array. It'll also accept iterables like jQuery objects.
	  toArray = function toArray(value, scope, leaveStrings) {
	    return _context$2 && !scope && _context$2.selector ? _context$2.selector(value) : _isString$1(value) && !leaveStrings && (_coreInitted$2 || !_wake()) ? _slice.call((scope || _doc$3).querySelectorAll(value), 0) : _isArray(value) ? _flatten(value, leaveStrings) : _isArrayLike(value) ? _slice.call(value, 0) : value ? [value] : [];
	  },
	  selector = function selector(value) {
	    value = toArray(value)[0] || _warn("Invalid scope") || {};
	    return function (v) {
	      var el = value.current || value.nativeElement || value;
	      return toArray(v, el.querySelectorAll ? el : el === value ? _warn("Invalid scope") || _doc$3.createElement("div") : value);
	    };
	  },
	  shuffle = function shuffle(a) {
	    return a.sort(function () {
	      return .5 - Math.random();
	    });
	  },
	  // alternative that's a bit faster and more reliably diverse but bigger:   for (let j, v, i = a.length; i; j = Math.floor(Math.random() * i), v = a[--i], a[i] = a[j], a[j] = v); return a;
	  //for distributing values across an array. Can accept a number, a function or (most commonly) a function which can contain the following properties: {base, amount, from, ease, grid, axis, length, each}. Returns a function that expects the following parameters: index, target, array. Recognizes the following
	  distribute = function distribute(v) {
	    if (_isFunction$1(v)) {
	      return v;
	    }
	    var vars = _isObject$1(v) ? v : {
	        each: v
	      },
	      //n:1 is just to indicate v was a number; we leverage that later to set v according to the length we get. If a number is passed in, we treat it like the old stagger value where 0.1, for example, would mean that things would be distributed with 0.1 between each element in the array rather than a total "amount" that's chunked out among them all.
	      ease = _parseEase(vars.ease),
	      from = vars.from || 0,
	      base = parseFloat(vars.base) || 0,
	      cache = {},
	      isDecimal = from > 0 && from < 1,
	      ratios = isNaN(from) || isDecimal,
	      axis = vars.axis,
	      ratioX = from,
	      ratioY = from;
	    if (_isString$1(from)) {
	      ratioX = ratioY = {
	        center: .5,
	        edges: .5,
	        end: 1
	      }[from] || 0;
	    } else if (!isDecimal && ratios) {
	      ratioX = from[0];
	      ratioY = from[1];
	    }
	    return function (i, target, a) {
	      var l = (a || vars).length,
	        distances = cache[l],
	        originX,
	        originY,
	        x,
	        y,
	        d,
	        j,
	        max,
	        min,
	        wrapAt;
	      if (!distances) {
	        wrapAt = vars.grid === "auto" ? 0 : (vars.grid || [1, _bigNum$1])[1];
	        if (!wrapAt) {
	          max = -_bigNum$1;
	          while (max < (max = a[wrapAt++].getBoundingClientRect().left) && wrapAt < l) {}
	          wrapAt--;
	        }
	        distances = cache[l] = [];
	        originX = ratios ? Math.min(wrapAt, l) * ratioX - .5 : from % wrapAt;
	        originY = wrapAt === _bigNum$1 ? 0 : ratios ? l * ratioY / wrapAt - .5 : from / wrapAt | 0;
	        max = 0;
	        min = _bigNum$1;
	        for (j = 0; j < l; j++) {
	          x = j % wrapAt - originX;
	          y = originY - (j / wrapAt | 0);
	          distances[j] = d = !axis ? _sqrt(x * x + y * y) : Math.abs(axis === "y" ? y : x);
	          d > max && (max = d);
	          d < min && (min = d);
	        }
	        from === "random" && shuffle(distances);
	        distances.max = max - min;
	        distances.min = min;
	        distances.v = l = (parseFloat(vars.amount) || parseFloat(vars.each) * (wrapAt > l ? l - 1 : !axis ? Math.max(wrapAt, l / wrapAt) : axis === "y" ? l / wrapAt : wrapAt) || 0) * (from === "edges" ? -1 : 1);
	        distances.b = l < 0 ? base - l : base;
	        distances.u = getUnit(vars.amount || vars.each) || 0; //unit

	        ease = ease && l < 0 ? _invertEase(ease) : ease;
	      }
	      l = (distances[i] - distances.min) / distances.max || 0;
	      return _roundPrecise(distances.b + (ease ? ease(l) : l) * distances.v) + distances.u; //round in order to work around floating point errors
	    };
	  },
	  _roundModifier = function _roundModifier(v) {
	    //pass in 0.1 get a function that'll round to the nearest tenth, or 5 to round to the closest 5, or 0.001 to the closest 1000th, etc.
	    var p = Math.pow(10, ((v + "").split(".")[1] || "").length); //to avoid floating point math errors (like 24 * 0.1 == 2.4000000000000004), we chop off at a specific number of decimal places (much faster than toFixed())

	    return function (raw) {
	      var n = _roundPrecise(Math.round(parseFloat(raw) / v) * v * p);
	      return (n - n % 1) / p + (_isNumber$1(raw) ? 0 : getUnit(raw)); // n - n % 1 replaces Math.floor() in order to handle negative values properly. For example, Math.floor(-150.00000000000003) is 151!
	    };
	  },
	  snap = function snap(snapTo, value) {
	    var isArray = _isArray(snapTo),
	      radius,
	      is2D;
	    if (!isArray && _isObject$1(snapTo)) {
	      radius = isArray = snapTo.radius || _bigNum$1;
	      if (snapTo.values) {
	        snapTo = toArray(snapTo.values);
	        if (is2D = !_isNumber$1(snapTo[0])) {
	          radius *= radius; //performance optimization so we don't have to Math.sqrt() in the loop.
	        }
	      } else {
	        snapTo = _roundModifier(snapTo.increment);
	      }
	    }
	    return _conditionalReturn(value, !isArray ? _roundModifier(snapTo) : _isFunction$1(snapTo) ? function (raw) {
	      is2D = snapTo(raw);
	      return Math.abs(is2D - raw) <= radius ? is2D : raw;
	    } : function (raw) {
	      var x = parseFloat(is2D ? raw.x : raw),
	        y = parseFloat(is2D ? raw.y : 0),
	        min = _bigNum$1,
	        closest = 0,
	        i = snapTo.length,
	        dx,
	        dy;
	      while (i--) {
	        if (is2D) {
	          dx = snapTo[i].x - x;
	          dy = snapTo[i].y - y;
	          dx = dx * dx + dy * dy;
	        } else {
	          dx = Math.abs(snapTo[i] - x);
	        }
	        if (dx < min) {
	          min = dx;
	          closest = i;
	        }
	      }
	      closest = !radius || min <= radius ? snapTo[closest] : raw;
	      return is2D || closest === raw || _isNumber$1(raw) ? closest : closest + getUnit(raw);
	    });
	  },
	  random = function random(min, max, roundingIncrement, returnFunction) {
	    return _conditionalReturn(_isArray(min) ? !max : roundingIncrement === true ? !!(roundingIncrement = 0) : !returnFunction, function () {
	      return _isArray(min) ? min[~~(Math.random() * min.length)] : (roundingIncrement = roundingIncrement || 1e-5) && (returnFunction = roundingIncrement < 1 ? Math.pow(10, (roundingIncrement + "").length - 2) : 1) && Math.floor(Math.round((min - roundingIncrement / 2 + Math.random() * (max - min + roundingIncrement * .99)) / roundingIncrement) * roundingIncrement * returnFunction) / returnFunction;
	    });
	  },
	  pipe$1 = function pipe() {
	    for (var _len = arguments.length, functions = new Array(_len), _key = 0; _key < _len; _key++) {
	      functions[_key] = arguments[_key];
	    }
	    return function (value) {
	      return functions.reduce(function (v, f) {
	        return f(v);
	      }, value);
	    };
	  },
	  unitize = function unitize(func, unit) {
	    return function (value) {
	      return func(parseFloat(value)) + (unit || getUnit(value));
	    };
	  },
	  normalize = function normalize(min, max, value) {
	    return mapRange(min, max, 0, 1, value);
	  },
	  _wrapArray = function _wrapArray(a, wrapper, value) {
	    return _conditionalReturn(value, function (index) {
	      return a[~~wrapper(index)];
	    });
	  },
	  wrap = function wrap(min, max, value) {
	    // NOTE: wrap() CANNOT be an arrow function! A very odd compiling bug causes problems (unrelated to GSAP).
	    var range = max - min;
	    return _isArray(min) ? _wrapArray(min, wrap(0, min.length), max) : _conditionalReturn(value, function (value) {
	      return (range + (value - min) % range) % range + min;
	    });
	  },
	  wrapYoyo = function wrapYoyo(min, max, value) {
	    var range = max - min,
	      total = range * 2;
	    return _isArray(min) ? _wrapArray(min, wrapYoyo(0, min.length - 1), max) : _conditionalReturn(value, function (value) {
	      value = (total + (value - min) % total) % total || 0;
	      return min + (value > range ? total - value : value);
	    });
	  },
	  _replaceRandom = function _replaceRandom(value) {
	    //replaces all occurrences of random(...) in a string with the calculated random value. can be a range like random(-100, 100, 5) or an array like random([0, 100, 500])
	    var prev = 0,
	      s = "",
	      i,
	      nums,
	      end,
	      isArray;
	    while (~(i = value.indexOf("random(", prev))) {
	      end = value.indexOf(")", i);
	      isArray = value.charAt(i + 7) === "[";
	      nums = value.substr(i + 7, end - i - 7).match(isArray ? _delimitedValueExp : _strictNumExp);
	      s += value.substr(prev, i - prev) + random(isArray ? nums : +nums[0], isArray ? 0 : +nums[1], +nums[2] || 1e-5);
	      prev = end + 1;
	    }
	    return s + value.substr(prev, value.length - prev);
	  },
	  mapRange = function mapRange(inMin, inMax, outMin, outMax, value) {
	    var inRange = inMax - inMin,
	      outRange = outMax - outMin;
	    return _conditionalReturn(value, function (value) {
	      return outMin + ((value - inMin) / inRange * outRange || 0);
	    });
	  },
	  interpolate = function interpolate(start, end, progress, mutate) {
	    var func = isNaN(start + end) ? 0 : function (p) {
	      return (1 - p) * start + p * end;
	    };
	    if (!func) {
	      var isString = _isString$1(start),
	        master = {},
	        p,
	        i,
	        interpolators,
	        l,
	        il;
	      progress === true && (mutate = 1) && (progress = null);
	      if (isString) {
	        start = {
	          p: start
	        };
	        end = {
	          p: end
	        };
	      } else if (_isArray(start) && !_isArray(end)) {
	        interpolators = [];
	        l = start.length;
	        il = l - 2;
	        for (i = 1; i < l; i++) {
	          interpolators.push(interpolate(start[i - 1], start[i])); //build the interpolators up front as a performance optimization so that when the function is called many times, it can just reuse them.
	        }
	        l--;
	        func = function func(p) {
	          p *= l;
	          var i = Math.min(il, ~~p);
	          return interpolators[i](p - i);
	        };
	        progress = end;
	      } else if (!mutate) {
	        start = _merge(_isArray(start) ? [] : {}, start);
	      }
	      if (!interpolators) {
	        for (p in end) {
	          _addPropTween.call(master, start, p, "get", end[p]);
	        }
	        func = function func(p) {
	          return _renderPropTweens(p, master) || (isString ? start.p : start);
	        };
	      }
	    }
	    return _conditionalReturn(progress, func);
	  },
	  _getLabelInDirection = function _getLabelInDirection(timeline, fromTime, backward) {
	    //used for nextLabel() and previousLabel()
	    var labels = timeline.labels,
	      min = _bigNum$1,
	      p,
	      distance,
	      label;
	    for (p in labels) {
	      distance = labels[p] - fromTime;
	      if (distance < 0 === !!backward && distance && min > (distance = Math.abs(distance))) {
	        label = p;
	        min = distance;
	      }
	    }
	    return label;
	  },
	  _callback$1 = function _callback(animation, type, executeLazyFirst) {
	    var v = animation.vars,
	      callback = v[type],
	      prevContext = _context$2,
	      context = animation._ctx,
	      params,
	      scope,
	      result;
	    if (!callback) {
	      return;
	    }
	    params = v[type + "Params"];
	    scope = v.callbackScope || animation;
	    executeLazyFirst && _lazyTweens.length && _lazyRender(); //in case rendering caused any tweens to lazy-init, we should render them because typically when a timeline finishes, users expect things to have rendered fully. Imagine an onUpdate on a timeline that reports/checks tweened values.

	    context && (_context$2 = context);
	    result = params ? callback.apply(scope, params) : callback.call(scope);
	    _context$2 = prevContext;
	    return result;
	  },
	  _interrupt = function _interrupt(animation) {
	    _removeFromParent(animation);
	    animation.scrollTrigger && animation.scrollTrigger.kill(!!_reverting$1);
	    animation.progress() < 1 && _callback$1(animation, "onInterrupt");
	    return animation;
	  },
	  _quickTween,
	  _createPlugin = function _createPlugin(config) {
	    config = !config.name && config["default"] || config; //UMD packaging wraps things oddly, so for example MotionPathHelper becomes {MotionPathHelper:MotionPathHelper, default:MotionPathHelper}.

	    var name = config.name,
	      isFunc = _isFunction$1(config),
	      Plugin = name && !isFunc && config.init ? function () {
	        this._props = [];
	      } : config,
	      //in case someone passes in an object that's not a plugin, like CustomEase
	      instanceDefaults = {
	        init: _emptyFunc,
	        render: _renderPropTweens,
	        add: _addPropTween,
	        kill: _killPropTweensOf,
	        modifier: _addPluginModifier,
	        rawVars: 0
	      },
	      statics = {
	        targetTest: 0,
	        get: 0,
	        getSetter: _getSetter,
	        aliases: {},
	        register: 0
	      };
	    _wake();
	    if (config !== Plugin) {
	      if (_plugins[name]) {
	        return;
	      }
	      _setDefaults$1(Plugin, _setDefaults$1(_copyExcluding(config, instanceDefaults), statics)); //static methods

	      _merge(Plugin.prototype, _merge(instanceDefaults, _copyExcluding(config, statics))); //instance methods

	      _plugins[Plugin.prop = name] = Plugin;
	      if (config.targetTest) {
	        _harnessPlugins.push(Plugin);
	        _reservedProps[name] = 1;
	      }
	      name = (name === "css" ? "CSS" : name.charAt(0).toUpperCase() + name.substr(1)) + "Plugin"; //for the global name. "motionPath" should become MotionPathPlugin
	    }
	    _addGlobal(name, Plugin);
	    config.register && config.register(gsap$2, Plugin, PropTween);
	  },
	  /*
	   * --------------------------------------------------------------------------------------
	   * COLORS
	   * --------------------------------------------------------------------------------------
	   */
	  _255 = 255,
	  _colorLookup = {
	    aqua: [0, _255, _255],
	    lime: [0, _255, 0],
	    silver: [192, 192, 192],
	    black: [0, 0, 0],
	    maroon: [128, 0, 0],
	    teal: [0, 128, 128],
	    blue: [0, 0, _255],
	    navy: [0, 0, 128],
	    white: [_255, _255, _255],
	    olive: [128, 128, 0],
	    yellow: [_255, _255, 0],
	    orange: [_255, 165, 0],
	    gray: [128, 128, 128],
	    purple: [128, 0, 128],
	    green: [0, 128, 0],
	    red: [_255, 0, 0],
	    pink: [_255, 192, 203],
	    cyan: [0, _255, _255],
	    transparent: [_255, _255, _255, 0]
	  },
	  // possible future idea to replace the hard-coded color name values - put this in the ticker.wake() where we set the _doc:
	  // let ctx = _doc.createElement("canvas").getContext("2d");
	  // _forEachName("aqua,lime,silver,black,maroon,teal,blue,navy,white,olive,yellow,orange,gray,purple,green,red,pink,cyan", color => {ctx.fillStyle = color; _colorLookup[color] = splitColor(ctx.fillStyle)});
	  _hue = function _hue(h, m1, m2) {
	    h += h < 0 ? 1 : h > 1 ? -1 : 0;
	    return (h * 6 < 1 ? m1 + (m2 - m1) * h * 6 : h < .5 ? m2 : h * 3 < 2 ? m1 + (m2 - m1) * (2 / 3 - h) * 6 : m1) * _255 + .5 | 0;
	  },
	  splitColor = function splitColor(v, toHSL, forceAlpha) {
	    var a = !v ? _colorLookup.black : _isNumber$1(v) ? [v >> 16, v >> 8 & _255, v & _255] : 0,
	      r,
	      g,
	      b,
	      h,
	      s,
	      l,
	      max,
	      min,
	      d,
	      wasHSL;
	    if (!a) {
	      if (v.substr(-1) === ",") {
	        //sometimes a trailing comma is included and we should chop it off (typically from a comma-delimited list of values like a textShadow:"2px 2px 2px blue, 5px 5px 5px rgb(255,0,0)" - in this example "blue," has a trailing comma. We could strip it out inside parseComplex() but we'd need to do it to the beginning and ending values plus it wouldn't provide protection from other potential scenarios like if the user passes in a similar value.
	        v = v.substr(0, v.length - 1);
	      }
	      if (_colorLookup[v]) {
	        a = _colorLookup[v];
	      } else if (v.charAt(0) === "#") {
	        if (v.length < 6) {
	          //for shorthand like #9F0 or #9F0F (could have alpha)
	          r = v.charAt(1);
	          g = v.charAt(2);
	          b = v.charAt(3);
	          v = "#" + r + r + g + g + b + b + (v.length === 5 ? v.charAt(4) + v.charAt(4) : "");
	        }
	        if (v.length === 9) {
	          // hex with alpha, like #fd5e53ff
	          a = parseInt(v.substr(1, 6), 16);
	          return [a >> 16, a >> 8 & _255, a & _255, parseInt(v.substr(7), 16) / 255];
	        }
	        v = parseInt(v.substr(1), 16);
	        a = [v >> 16, v >> 8 & _255, v & _255];
	      } else if (v.substr(0, 3) === "hsl") {
	        a = wasHSL = v.match(_strictNumExp);
	        if (!toHSL) {
	          h = +a[0] % 360 / 360;
	          s = +a[1] / 100;
	          l = +a[2] / 100;
	          g = l <= .5 ? l * (s + 1) : l + s - l * s;
	          r = l * 2 - g;
	          a.length > 3 && (a[3] *= 1); //cast as number

	          a[0] = _hue(h + 1 / 3, r, g);
	          a[1] = _hue(h, r, g);
	          a[2] = _hue(h - 1 / 3, r, g);
	        } else if (~v.indexOf("=")) {
	          //if relative values are found, just return the raw strings with the relative prefixes in place.
	          a = v.match(_numExp);
	          forceAlpha && a.length < 4 && (a[3] = 1);
	          return a;
	        }
	      } else {
	        a = v.match(_strictNumExp) || _colorLookup.transparent;
	      }
	      a = a.map(Number);
	    }
	    if (toHSL && !wasHSL) {
	      r = a[0] / _255;
	      g = a[1] / _255;
	      b = a[2] / _255;
	      max = Math.max(r, g, b);
	      min = Math.min(r, g, b);
	      l = (max + min) / 2;
	      if (max === min) {
	        h = s = 0;
	      } else {
	        d = max - min;
	        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	        h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
	        h *= 60;
	      }
	      a[0] = ~~(h + .5);
	      a[1] = ~~(s * 100 + .5);
	      a[2] = ~~(l * 100 + .5);
	    }
	    forceAlpha && a.length < 4 && (a[3] = 1);
	    return a;
	  },
	  _colorOrderData = function _colorOrderData(v) {
	    // strips out the colors from the string, finds all the numeric slots (with units) and returns an array of those. The Array also has a "c" property which is an Array of the index values where the colors belong. This is to help work around issues where there's a mis-matched order of color/numeric data like drop-shadow(#f00 0px 1px 2px) and drop-shadow(0x 1px 2px #f00). This is basically a helper function used in _formatColors()
	    var values = [],
	      c = [],
	      i = -1;
	    v.split(_colorExp).forEach(function (v) {
	      var a = v.match(_numWithUnitExp) || [];
	      values.push.apply(values, a);
	      c.push(i += a.length + 1);
	    });
	    values.c = c;
	    return values;
	  },
	  _formatColors = function _formatColors(s, toHSL, orderMatchData) {
	    var result = "",
	      colors = (s + result).match(_colorExp),
	      type = toHSL ? "hsla(" : "rgba(",
	      i = 0,
	      c,
	      shell,
	      d,
	      l;
	    if (!colors) {
	      return s;
	    }
	    colors = colors.map(function (color) {
	      return (color = splitColor(color, toHSL, 1)) && type + (toHSL ? color[0] + "," + color[1] + "%," + color[2] + "%," + color[3] : color.join(",")) + ")";
	    });
	    if (orderMatchData) {
	      d = _colorOrderData(s);
	      c = orderMatchData.c;
	      if (c.join(result) !== d.c.join(result)) {
	        shell = s.replace(_colorExp, "1").split(_numWithUnitExp);
	        l = shell.length - 1;
	        for (; i < l; i++) {
	          result += shell[i] + (~c.indexOf(i) ? colors.shift() || type + "0,0,0,0)" : (d.length ? d : colors.length ? colors : orderMatchData).shift());
	        }
	      }
	    }
	    if (!shell) {
	      shell = s.split(_colorExp);
	      l = shell.length - 1;
	      for (; i < l; i++) {
	        result += shell[i] + colors[i];
	      }
	    }
	    return result + shell[l];
	  },
	  _colorExp = function () {
	    var s = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b",
	      //we'll dynamically build this Regular Expression to conserve file size. After building it, it will be able to find rgb(), rgba(), # (hexadecimal), and named color values like red, blue, purple, etc.,
	      p;
	    for (p in _colorLookup) {
	      s += "|" + p + "\\b";
	    }
	    return new RegExp(s + ")", "gi");
	  }(),
	  _hslExp = /hsl[a]?\(/,
	  _colorStringFilter = function _colorStringFilter(a) {
	    var combined = a.join(" "),
	      toHSL;
	    _colorExp.lastIndex = 0;
	    if (_colorExp.test(combined)) {
	      toHSL = _hslExp.test(combined);
	      a[1] = _formatColors(a[1], toHSL);
	      a[0] = _formatColors(a[0], toHSL, _colorOrderData(a[1])); // make sure the order of numbers/colors match with the END value.

	      return true;
	    }
	  },
	  /*
	   * --------------------------------------------------------------------------------------
	   * TICKER
	   * --------------------------------------------------------------------------------------
	   */
	  _tickerActive,
	  _ticker = function () {
	    var _getTime = Date.now,
	      _lagThreshold = 500,
	      _adjustedLag = 33,
	      _startTime = _getTime(),
	      _lastUpdate = _startTime,
	      _gap = 1000 / 240,
	      _nextTime = _gap,
	      _listeners = [],
	      _id,
	      _req,
	      _raf,
	      _self,
	      _delta,
	      _i,
	      _tick = function _tick(v) {
	        var elapsed = _getTime() - _lastUpdate,
	          manual = v === true,
	          overlap,
	          dispatch,
	          time,
	          frame;
	        elapsed > _lagThreshold && (_startTime += elapsed - _adjustedLag);
	        _lastUpdate += elapsed;
	        time = _lastUpdate - _startTime;
	        overlap = time - _nextTime;
	        if (overlap > 0 || manual) {
	          frame = ++_self.frame;
	          _delta = time - _self.time * 1000;
	          _self.time = time = time / 1000;
	          _nextTime += overlap + (overlap >= _gap ? 4 : _gap - overlap);
	          dispatch = 1;
	        }
	        manual || (_id = _req(_tick)); //make sure the request is made before we dispatch the "tick" event so that timing is maintained. Otherwise, if processing the "tick" requires a bunch of time (like 15ms) and we're using a setTimeout() that's based on 16.7ms, it'd technically take 31.7ms between frames otherwise.

	        if (dispatch) {
	          for (_i = 0; _i < _listeners.length; _i++) {
	            // use _i and check _listeners.length instead of a variable because a listener could get removed during the loop, and if that happens to an element less than the current index, it'd throw things off in the loop.
	            _listeners[_i](time, _delta, frame, v);
	          }
	        }
	      };
	    _self = {
	      time: 0,
	      frame: 0,
	      tick: function tick() {
	        _tick(true);
	      },
	      deltaRatio: function deltaRatio(fps) {
	        return _delta / (1000 / (fps || 60));
	      },
	      wake: function wake() {
	        if (_coreReady) {
	          if (!_coreInitted$2 && _windowExists$2()) {
	            _win$3 = _coreInitted$2 = window;
	            _doc$3 = _win$3.document || {};
	            _globals.gsap = gsap$2;
	            (_win$3.gsapVersions || (_win$3.gsapVersions = [])).push(gsap$2.version);
	            _install(_installScope || _win$3.GreenSockGlobals || !_win$3.gsap && _win$3 || {});
	            _raf = _win$3.requestAnimationFrame;
	          }
	          _id && _self.sleep();
	          _req = _raf || function (f) {
	            return setTimeout(f, _nextTime - _self.time * 1000 + 1 | 0);
	          };
	          _tickerActive = 1;
	          _tick(2);
	        }
	      },
	      sleep: function sleep() {
	        (_raf ? _win$3.cancelAnimationFrame : clearTimeout)(_id);
	        _tickerActive = 0;
	        _req = _emptyFunc;
	      },
	      lagSmoothing: function lagSmoothing(threshold, adjustedLag) {
	        _lagThreshold = threshold || Infinity; // zero should be interpreted as basically unlimited

	        _adjustedLag = Math.min(adjustedLag || 33, _lagThreshold);
	      },
	      fps: function fps(_fps) {
	        _gap = 1000 / (_fps || 240);
	        _nextTime = _self.time * 1000 + _gap;
	      },
	      add: function add(callback, once, prioritize) {
	        var func = once ? function (t, d, f, v) {
	          callback(t, d, f, v);
	          _self.remove(func);
	        } : callback;
	        _self.remove(callback);
	        _listeners[prioritize ? "unshift" : "push"](func);
	        _wake();
	        return func;
	      },
	      remove: function remove(callback, i) {
	        ~(i = _listeners.indexOf(callback)) && _listeners.splice(i, 1) && _i >= i && _i--;
	      },
	      _listeners: _listeners
	    };
	    return _self;
	  }(),
	  _wake = function _wake() {
	    return !_tickerActive && _ticker.wake();
	  },
	  //also ensures the core classes are initialized.

	  /*
	  * -------------------------------------------------
	  * EASING
	  * -------------------------------------------------
	  */
	  _easeMap = {},
	  _customEaseExp = /^[\d.\-M][\d.\-,\s]/,
	  _quotesExp = /["']/g,
	  _parseObjectInString = function _parseObjectInString(value) {
	    //takes a string like "{wiggles:10, type:anticipate})" and turns it into a real object. Notice it ends in ")" and includes the {} wrappers. This is because we only use this function for parsing ease configs and prioritized optimization rather than reusability.
	    var obj = {},
	      split = value.substr(1, value.length - 3).split(":"),
	      key = split[0],
	      i = 1,
	      l = split.length,
	      index,
	      val,
	      parsedVal;
	    for (; i < l; i++) {
	      val = split[i];
	      index = i !== l - 1 ? val.lastIndexOf(",") : val.length;
	      parsedVal = val.substr(0, index);
	      obj[key] = isNaN(parsedVal) ? parsedVal.replace(_quotesExp, "").trim() : +parsedVal;
	      key = val.substr(index + 1).trim();
	    }
	    return obj;
	  },
	  _valueInParentheses = function _valueInParentheses(value) {
	    var open = value.indexOf("(") + 1,
	      close = value.indexOf(")"),
	      nested = value.indexOf("(", open);
	    return value.substring(open, ~nested && nested < close ? value.indexOf(")", close + 1) : close);
	  },
	  _configEaseFromString = function _configEaseFromString(name) {
	    //name can be a string like "elastic.out(1,0.5)", and pass in _easeMap as obj and it'll parse it out and call the actual function like _easeMap.Elastic.easeOut.config(1,0.5). It will also parse custom ease strings as long as CustomEase is loaded and registered (internally as _easeMap._CE).
	    var split = (name + "").split("("),
	      ease = _easeMap[split[0]];
	    return ease && split.length > 1 && ease.config ? ease.config.apply(null, ~name.indexOf("{") ? [_parseObjectInString(split[1])] : _valueInParentheses(name).split(",").map(_numericIfPossible)) : _easeMap._CE && _customEaseExp.test(name) ? _easeMap._CE("", name) : ease;
	  },
	  _invertEase = function _invertEase(ease) {
	    return function (p) {
	      return 1 - ease(1 - p);
	    };
	  },
	  // allow yoyoEase to be set in children and have those affected when the parent/ancestor timeline yoyos.
	  _propagateYoyoEase = function _propagateYoyoEase(timeline, isYoyo) {
	    var child = timeline._first,
	      ease;
	    while (child) {
	      if (child instanceof Timeline) {
	        _propagateYoyoEase(child, isYoyo);
	      } else if (child.vars.yoyoEase && (!child._yoyo || !child._repeat) && child._yoyo !== isYoyo) {
	        if (child.timeline) {
	          _propagateYoyoEase(child.timeline, isYoyo);
	        } else {
	          ease = child._ease;
	          child._ease = child._yEase;
	          child._yEase = ease;
	          child._yoyo = isYoyo;
	        }
	      }
	      child = child._next;
	    }
	  },
	  _parseEase = function _parseEase(ease, defaultEase) {
	    return !ease ? defaultEase : (_isFunction$1(ease) ? ease : _easeMap[ease] || _configEaseFromString(ease)) || defaultEase;
	  },
	  _insertEase = function _insertEase(names, easeIn, easeOut, easeInOut) {
	    if (easeOut === void 0) {
	      easeOut = function easeOut(p) {
	        return 1 - easeIn(1 - p);
	      };
	    }
	    if (easeInOut === void 0) {
	      easeInOut = function easeInOut(p) {
	        return p < .5 ? easeIn(p * 2) / 2 : 1 - easeIn((1 - p) * 2) / 2;
	      };
	    }
	    var ease = {
	        easeIn: easeIn,
	        easeOut: easeOut,
	        easeInOut: easeInOut
	      },
	      lowercaseName;
	    _forEachName(names, function (name) {
	      _easeMap[name] = _globals[name] = ease;
	      _easeMap[lowercaseName = name.toLowerCase()] = easeOut;
	      for (var p in ease) {
	        _easeMap[lowercaseName + (p === "easeIn" ? ".in" : p === "easeOut" ? ".out" : ".inOut")] = _easeMap[name + "." + p] = ease[p];
	      }
	    });
	    return ease;
	  },
	  _easeInOutFromOut = function _easeInOutFromOut(easeOut) {
	    return function (p) {
	      return p < .5 ? (1 - easeOut(1 - p * 2)) / 2 : .5 + easeOut((p - .5) * 2) / 2;
	    };
	  },
	  _configElastic = function _configElastic(type, amplitude, period) {
	    var p1 = amplitude >= 1 ? amplitude : 1,
	      //note: if amplitude is < 1, we simply adjust the period for a more natural feel. Otherwise the math doesn't work right and the curve starts at 1.
	      p2 = (period || (type ? .3 : .45)) / (amplitude < 1 ? amplitude : 1),
	      p3 = p2 / _2PI * (Math.asin(1 / p1) || 0),
	      easeOut = function easeOut(p) {
	        return p === 1 ? 1 : p1 * Math.pow(2, -10 * p) * _sin((p - p3) * p2) + 1;
	      },
	      ease = type === "out" ? easeOut : type === "in" ? function (p) {
	        return 1 - easeOut(1 - p);
	      } : _easeInOutFromOut(easeOut);
	    p2 = _2PI / p2; //precalculate to optimize

	    ease.config = function (amplitude, period) {
	      return _configElastic(type, amplitude, period);
	    };
	    return ease;
	  },
	  _configBack = function _configBack(type, overshoot) {
	    if (overshoot === void 0) {
	      overshoot = 1.70158;
	    }
	    var easeOut = function easeOut(p) {
	        return p ? --p * p * ((overshoot + 1) * p + overshoot) + 1 : 0;
	      },
	      ease = type === "out" ? easeOut : type === "in" ? function (p) {
	        return 1 - easeOut(1 - p);
	      } : _easeInOutFromOut(easeOut);
	    ease.config = function (overshoot) {
	      return _configBack(type, overshoot);
	    };
	    return ease;
	  }; // a cheaper (kb and cpu) but more mild way to get a parameterized weighted ease by feeding in a value between -1 (easeIn) and 1 (easeOut) where 0 is linear.
	// _weightedEase = ratio => {
	// 	let y = 0.5 + ratio / 2;
	// 	return p => (2 * (1 - p) * p * y + p * p);
	// },
	// a stronger (but more expensive kb/cpu) parameterized weighted ease that lets you feed in a value between -1 (easeIn) and 1 (easeOut) where 0 is linear.
	// _weightedEaseStrong = ratio => {
	// 	ratio = .5 + ratio / 2;
	// 	let o = 1 / 3 * (ratio < .5 ? ratio : 1 - ratio),
	// 		b = ratio - o,
	// 		c = ratio + o;
	// 	return p => p === 1 ? p : 3 * b * (1 - p) * (1 - p) * p + 3 * c * (1 - p) * p * p + p * p * p;
	// };

	_forEachName("Linear,Quad,Cubic,Quart,Quint,Strong", function (name, i) {
	  var power = i < 5 ? i + 1 : i;
	  _insertEase(name + ",Power" + (power - 1), i ? function (p) {
	    return Math.pow(p, power);
	  } : function (p) {
	    return p;
	  }, function (p) {
	    return 1 - Math.pow(1 - p, power);
	  }, function (p) {
	    return p < .5 ? Math.pow(p * 2, power) / 2 : 1 - Math.pow((1 - p) * 2, power) / 2;
	  });
	});
	_easeMap.Linear.easeNone = _easeMap.none = _easeMap.Linear.easeIn;
	_insertEase("Elastic", _configElastic("in"), _configElastic("out"), _configElastic());
	(function (n, c) {
	  var n1 = 1 / c,
	    n2 = 2 * n1,
	    n3 = 2.5 * n1,
	    easeOut = function easeOut(p) {
	      return p < n1 ? n * p * p : p < n2 ? n * Math.pow(p - 1.5 / c, 2) + .75 : p < n3 ? n * (p -= 2.25 / c) * p + .9375 : n * Math.pow(p - 2.625 / c, 2) + .984375;
	    };
	  _insertEase("Bounce", function (p) {
	    return 1 - easeOut(1 - p);
	  }, easeOut);
	})(7.5625, 2.75);
	_insertEase("Expo", function (p) {
	  return p ? Math.pow(2, 10 * (p - 1)) : 0;
	});
	_insertEase("Circ", function (p) {
	  return -(_sqrt(1 - p * p) - 1);
	});
	_insertEase("Sine", function (p) {
	  return p === 1 ? 1 : -_cos(p * _HALF_PI) + 1;
	});
	_insertEase("Back", _configBack("in"), _configBack("out"), _configBack());
	_easeMap.SteppedEase = _easeMap.steps = _globals.SteppedEase = {
	  config: function config(steps, immediateStart) {
	    if (steps === void 0) {
	      steps = 1;
	    }
	    var p1 = 1 / steps,
	      p2 = steps + (immediateStart ? 0 : 1),
	      p3 = immediateStart ? 1 : 0,
	      max = 1 - _tinyNum;
	    return function (p) {
	      return ((p2 * _clamp$1(0, max, p) | 0) + p3) * p1;
	    };
	  }
	};
	_defaults$1.ease = _easeMap["quad.out"];
	_forEachName("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function (name) {
	  return _callbackNames += name + "," + name + "Params,";
	});
	/*
	 * --------------------------------------------------------------------------------------
	 * CACHE
	 * --------------------------------------------------------------------------------------
	 */

	var GSCache = function GSCache(target, harness) {
	  this.id = _gsID++;
	  target._gsap = this;
	  this.target = target;
	  this.harness = harness;
	  this.get = harness ? harness.get : _getProperty;
	  this.set = harness ? harness.getSetter : _getSetter;
	};
	/*
	 * --------------------------------------------------------------------------------------
	 * ANIMATION
	 * --------------------------------------------------------------------------------------
	 */

	var Animation = /*#__PURE__*/function () {
	  function Animation(vars) {
	    this.vars = vars;
	    this._delay = +vars.delay || 0;
	    if (this._repeat = vars.repeat === Infinity ? -2 : vars.repeat || 0) {
	      // TODO: repeat: Infinity on a timeline's children must flag that timeline internally and affect its totalDuration, otherwise it'll stop in the negative direction when reaching the start.
	      this._rDelay = vars.repeatDelay || 0;
	      this._yoyo = !!vars.yoyo || !!vars.yoyoEase;
	    }
	    this._ts = 1;
	    _setDuration(this, +vars.duration, 1, 1);
	    this.data = vars.data;
	    if (_context$2) {
	      this._ctx = _context$2;
	      _context$2.data.push(this);
	    }
	    _tickerActive || _ticker.wake();
	  }
	  var _proto = Animation.prototype;
	  _proto.delay = function delay(value) {
	    if (value || value === 0) {
	      this.parent && this.parent.smoothChildTiming && this.startTime(this._start + value - this._delay);
	      this._delay = value;
	      return this;
	    }
	    return this._delay;
	  };
	  _proto.duration = function duration(value) {
	    return arguments.length ? this.totalDuration(this._repeat > 0 ? value + (value + this._rDelay) * this._repeat : value) : this.totalDuration() && this._dur;
	  };
	  _proto.totalDuration = function totalDuration(value) {
	    if (!arguments.length) {
	      return this._tDur;
	    }
	    this._dirty = 0;
	    return _setDuration(this, this._repeat < 0 ? value : (value - this._repeat * this._rDelay) / (this._repeat + 1));
	  };
	  _proto.totalTime = function totalTime(_totalTime, suppressEvents) {
	    _wake();
	    if (!arguments.length) {
	      return this._tTime;
	    }
	    var parent = this._dp;
	    if (parent && parent.smoothChildTiming && this._ts) {
	      _alignPlayhead(this, _totalTime);
	      !parent._dp || parent.parent || _postAddChecks(parent, this); // edge case: if this is a child of a timeline that already completed, for example, we must re-activate the parent.
	      //in case any of the ancestor timelines had completed but should now be enabled, we should reset their totalTime() which will also ensure that they're lined up properly and enabled. Skip for animations that are on the root (wasteful). Example: a TimelineLite.exportRoot() is performed when there's a paused tween on the root, the export will not complete until that tween is unpaused, but imagine a child gets restarted later, after all [unpaused] tweens have completed. The start of that child would get pushed out, but one of the ancestors may have completed.

	      while (parent && parent.parent) {
	        if (parent.parent._time !== parent._start + (parent._ts >= 0 ? parent._tTime / parent._ts : (parent.totalDuration() - parent._tTime) / -parent._ts)) {
	          parent.totalTime(parent._tTime, true);
	        }
	        parent = parent.parent;
	      }
	      if (!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && _totalTime < this._tDur || this._ts < 0 && _totalTime > 0 || !this._tDur && !_totalTime)) {
	        //if the animation doesn't have a parent, put it back into its last parent (recorded as _dp for exactly cases like this). Limit to parents with autoRemoveChildren (like globalTimeline) so that if the user manually removes an animation from a timeline and then alters its playhead, it doesn't get added back in.
	        _addToTimeline(this._dp, this, this._start - this._delay);
	      }
	    }
	    if (this._tTime !== _totalTime || !this._dur && !suppressEvents || this._initted && Math.abs(this._zTime) === _tinyNum || !_totalTime && !this._initted && (this.add || this._ptLookup)) {
	      // check for _ptLookup on a Tween instance to ensure it has actually finished being instantiated, otherwise if this.reverse() gets called in the Animation constructor, it could trigger a render() here even though the _targets weren't populated, thus when _init() is called there won't be any PropTweens (it'll act like the tween is non-functional)
	      this._ts || (this._pTime = _totalTime); // otherwise, if an animation is paused, then the playhead is moved back to zero, then resumed, it'd revert back to the original time at the pause
	      //if (!this._lock) { // avoid endless recursion (not sure we need this yet or if it's worth the performance hit)
	      //   this._lock = 1;

	      _lazySafeRender(this, _totalTime, suppressEvents); //   this._lock = 0;
	      //}
	    }
	    return this;
	  };
	  _proto.time = function time(value, suppressEvents) {
	    return arguments.length ? this.totalTime(Math.min(this.totalDuration(), value + _elapsedCycleDuration(this)) % (this._dur + this._rDelay) || (value ? this._dur : 0), suppressEvents) : this._time; // note: if the modulus results in 0, the playhead could be exactly at the end or the beginning, and we always defer to the END with a non-zero value, otherwise if you set the time() to the very end (duration()), it would render at the START!
	  };
	  _proto.totalProgress = function totalProgress(value, suppressEvents) {
	    return arguments.length ? this.totalTime(this.totalDuration() * value, suppressEvents) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.ratio;
	  };
	  _proto.progress = function progress(value, suppressEvents) {
	    return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - value : value) + _elapsedCycleDuration(this), suppressEvents) : this.duration() ? Math.min(1, this._time / this._dur) : this.ratio;
	  };
	  _proto.iteration = function iteration(value, suppressEvents) {
	    var cycleDuration = this.duration() + this._rDelay;
	    return arguments.length ? this.totalTime(this._time + (value - 1) * cycleDuration, suppressEvents) : this._repeat ? _animationCycle(this._tTime, cycleDuration) + 1 : 1;
	  } // potential future addition:
	  // isPlayingBackwards() {
	  // 	let animation = this,
	  // 		orientation = 1; // 1 = forward, -1 = backward
	  // 	while (animation) {
	  // 		orientation *= animation.reversed() || (animation.repeat() && !(animation.iteration() & 1)) ? -1 : 1;
	  // 		animation = animation.parent;
	  // 	}
	  // 	return orientation < 0;
	  // }
	  ;
	  _proto.timeScale = function timeScale(value) {
	    if (!arguments.length) {
	      return this._rts === -_tinyNum ? 0 : this._rts; // recorded timeScale. Special case: if someone calls reverse() on an animation with timeScale of 0, we assign it -_tinyNum to remember it's reversed.
	    }
	    if (this._rts === value) {
	      return this;
	    }
	    var tTime = this.parent && this._ts ? _parentToChildTotalTime(this.parent._time, this) : this._tTime; // make sure to do the parentToChildTotalTime() BEFORE setting the new _ts because the old one must be used in that calculation.
	    // future addition? Up side: fast and minimal file size. Down side: only works on this animation; if a timeline is reversed, for example, its childrens' onReverse wouldn't get called.
	    //(+value < 0 && this._rts >= 0) && _callback(this, "onReverse", true);
	    // prioritize rendering where the parent's playhead lines up instead of this._tTime because there could be a tween that's animating another tween's timeScale in the same rendering loop (same parent), thus if the timeScale tween renders first, it would alter _start BEFORE _tTime was set on that tick (in the rendering loop), effectively freezing it until the timeScale tween finishes.

	    this._rts = +value || 0;
	    this._ts = this._ps || value === -_tinyNum ? 0 : this._rts; // _ts is the functional timeScale which would be 0 if the animation is paused.

	    this.totalTime(_clamp$1(-this._delay, this._tDur, tTime), true);
	    _setEnd(this); // if parent.smoothChildTiming was false, the end time didn't get updated in the _alignPlayhead() method, so do it here.

	    return _recacheAncestors(this);
	  };
	  _proto.paused = function paused(value) {
	    if (!arguments.length) {
	      return this._ps;
	    }
	    if (this._ps !== value) {
	      this._ps = value;
	      if (value) {
	        this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()); // if the pause occurs during the delay phase, make sure that's factored in when resuming.

	        this._ts = this._act = 0; // _ts is the functional timeScale, so a paused tween would effectively have a timeScale of 0. We record the "real" timeScale as _rts (recorded time scale)
	      } else {
	        _wake();
	        this._ts = this._rts; //only defer to _pTime (pauseTime) if tTime is zero. Remember, someone could pause() an animation, then scrub the playhead and resume(). If the parent doesn't have smoothChildTiming, we render at the rawTime() because the startTime won't get updated.

	        this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== _tinyNum && (this._tTime -= _tinyNum)); // edge case: animation.progress(1).pause().play() wouldn't render again because the playhead is already at the end, but the call to totalTime() below will add it back to its parent...and not remove it again (since removing only happens upon rendering at a new time). Offsetting the _tTime slightly is done simply to cause the final render in totalTime() that'll pop it off its timeline (if autoRemoveChildren is true, of course). Check to make sure _zTime isn't -_tinyNum to avoid an edge case where the playhead is pushed to the end but INSIDE a tween/callback, the timeline itself is paused thus halting rendering and leaving a few unrendered. When resuming, it wouldn't render those otherwise.
	      }
	    }
	    return this;
	  };
	  _proto.startTime = function startTime(value) {
	    if (arguments.length) {
	      this._start = value;
	      var parent = this.parent || this._dp;
	      parent && (parent._sort || !this.parent) && _addToTimeline(parent, this, value - this._delay);
	      return this;
	    }
	    return this._start;
	  };
	  _proto.endTime = function endTime(includeRepeats) {
	    return this._start + (_isNotFalse(includeRepeats) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
	  };
	  _proto.rawTime = function rawTime(wrapRepeats) {
	    var parent = this.parent || this._dp; // _dp = detached parent

	    return !parent ? this._tTime : wrapRepeats && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : !this._ts ? this._tTime : _parentToChildTotalTime(parent.rawTime(wrapRepeats), this);
	  };
	  _proto.revert = function revert(config) {
	    if (config === void 0) {
	      config = _revertConfig;
	    }
	    var prevIsReverting = _reverting$1;
	    _reverting$1 = config;
	    if (this._initted || this._startAt) {
	      this.timeline && this.timeline.revert(config);
	      this.totalTime(-0.01, config.suppressEvents);
	    }
	    this.data !== "nested" && config.kill !== false && this.kill();
	    _reverting$1 = prevIsReverting;
	    return this;
	  };
	  _proto.globalTime = function globalTime(rawTime) {
	    var animation = this,
	      time = arguments.length ? rawTime : animation.rawTime();
	    while (animation) {
	      time = animation._start + time / (animation._ts || 1);
	      animation = animation._dp;
	    }
	    return !this.parent && this._sat ? this._sat.vars.immediateRender ? -1 : this._sat.globalTime(rawTime) : time; // the _startAt tweens for .fromTo() and .from() that have immediateRender should always be FIRST in the timeline (important for context.revert()). "_sat" stands for _startAtTween, referring to the parent tween that created the _startAt. We must discern if that tween had immediateRender so that we can know whether or not to prioritize it in revert().
	  };
	  _proto.repeat = function repeat(value) {
	    if (arguments.length) {
	      this._repeat = value === Infinity ? -2 : value;
	      return _onUpdateTotalDuration(this);
	    }
	    return this._repeat === -2 ? Infinity : this._repeat;
	  };
	  _proto.repeatDelay = function repeatDelay(value) {
	    if (arguments.length) {
	      var time = this._time;
	      this._rDelay = value;
	      _onUpdateTotalDuration(this);
	      return time ? this.time(time) : this;
	    }
	    return this._rDelay;
	  };
	  _proto.yoyo = function yoyo(value) {
	    if (arguments.length) {
	      this._yoyo = value;
	      return this;
	    }
	    return this._yoyo;
	  };
	  _proto.seek = function seek(position, suppressEvents) {
	    return this.totalTime(_parsePosition$1(this, position), _isNotFalse(suppressEvents));
	  };
	  _proto.restart = function restart(includeDelay, suppressEvents) {
	    return this.play().totalTime(includeDelay ? -this._delay : 0, _isNotFalse(suppressEvents));
	  };
	  _proto.play = function play(from, suppressEvents) {
	    from != null && this.seek(from, suppressEvents);
	    return this.reversed(false).paused(false);
	  };
	  _proto.reverse = function reverse(from, suppressEvents) {
	    from != null && this.seek(from || this.totalDuration(), suppressEvents);
	    return this.reversed(true).paused(false);
	  };
	  _proto.pause = function pause(atTime, suppressEvents) {
	    atTime != null && this.seek(atTime, suppressEvents);
	    return this.paused(true);
	  };
	  _proto.resume = function resume() {
	    return this.paused(false);
	  };
	  _proto.reversed = function reversed(value) {
	    if (arguments.length) {
	      !!value !== this.reversed() && this.timeScale(-this._rts || (value ? -_tinyNum : 0)); // in case timeScale is zero, reversing would have no effect so we use _tinyNum.

	      return this;
	    }
	    return this._rts < 0;
	  };
	  _proto.invalidate = function invalidate() {
	    this._initted = this._act = 0;
	    this._zTime = -_tinyNum;
	    return this;
	  };
	  _proto.isActive = function isActive() {
	    var parent = this.parent || this._dp,
	      start = this._start,
	      rawTime;
	    return !!(!parent || this._ts && this._initted && parent.isActive() && (rawTime = parent.rawTime(true)) >= start && rawTime < this.endTime(true) - _tinyNum);
	  };
	  _proto.eventCallback = function eventCallback(type, callback, params) {
	    var vars = this.vars;
	    if (arguments.length > 1) {
	      if (!callback) {
	        delete vars[type];
	      } else {
	        vars[type] = callback;
	        params && (vars[type + "Params"] = params);
	        type === "onUpdate" && (this._onUpdate = callback);
	      }
	      return this;
	    }
	    return vars[type];
	  };
	  _proto.then = function then(onFulfilled) {
	    var self = this;
	    return new Promise(function (resolve) {
	      var f = _isFunction$1(onFulfilled) ? onFulfilled : _passThrough$1,
	        _resolve = function _resolve() {
	          var _then = self.then;
	          self.then = null; // temporarily null the then() method to avoid an infinite loop (see https://github.com/greensock/GSAP/issues/322)

	          _isFunction$1(f) && (f = f(self)) && (f.then || f === self) && (self.then = _then);
	          resolve(f);
	          self.then = _then;
	        };
	      if (self._initted && self.totalProgress() === 1 && self._ts >= 0 || !self._tTime && self._ts < 0) {
	        _resolve();
	      } else {
	        self._prom = _resolve;
	      }
	    });
	  };
	  _proto.kill = function kill() {
	    _interrupt(this);
	  };
	  return Animation;
	}();
	_setDefaults$1(Animation.prototype, {
	  _time: 0,
	  _start: 0,
	  _end: 0,
	  _tTime: 0,
	  _tDur: 0,
	  _dirty: 0,
	  _repeat: 0,
	  _yoyo: false,
	  parent: null,
	  _initted: false,
	  _rDelay: 0,
	  _ts: 1,
	  _dp: 0,
	  ratio: 0,
	  _zTime: -_tinyNum,
	  _prom: 0,
	  _ps: false,
	  _rts: 1
	});
	/*
	 * -------------------------------------------------
	 * TIMELINE
	 * -------------------------------------------------
	 */

	var Timeline = /*#__PURE__*/function (_Animation) {
	  _inheritsLoose(Timeline, _Animation);
	  function Timeline(vars, position) {
	    var _this;
	    if (vars === void 0) {
	      vars = {};
	    }
	    _this = _Animation.call(this, vars) || this;
	    _this.labels = {};
	    _this.smoothChildTiming = !!vars.smoothChildTiming;
	    _this.autoRemoveChildren = !!vars.autoRemoveChildren;
	    _this._sort = _isNotFalse(vars.sortChildren);
	    _globalTimeline && _addToTimeline(vars.parent || _globalTimeline, _assertThisInitialized(_this), position);
	    vars.reversed && _this.reverse();
	    vars.paused && _this.paused(true);
	    vars.scrollTrigger && _scrollTrigger(_assertThisInitialized(_this), vars.scrollTrigger);
	    return _this;
	  }
	  var _proto2 = Timeline.prototype;
	  _proto2.to = function to(targets, vars, position) {
	    _createTweenType(0, arguments, this);
	    return this;
	  };
	  _proto2.from = function from(targets, vars, position) {
	    _createTweenType(1, arguments, this);
	    return this;
	  };
	  _proto2.fromTo = function fromTo(targets, fromVars, toVars, position) {
	    _createTweenType(2, arguments, this);
	    return this;
	  };
	  _proto2.set = function set(targets, vars, position) {
	    vars.duration = 0;
	    vars.parent = this;
	    _inheritDefaults(vars).repeatDelay || (vars.repeat = 0);
	    vars.immediateRender = !!vars.immediateRender;
	    new Tween(targets, vars, _parsePosition$1(this, position), 1);
	    return this;
	  };
	  _proto2.call = function call(callback, params, position) {
	    return _addToTimeline(this, Tween.delayedCall(0, callback, params), position);
	  } //ONLY for backward compatibility! Maybe delete?
	  ;
	  _proto2.staggerTo = function staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
	    vars.duration = duration;
	    vars.stagger = vars.stagger || stagger;
	    vars.onComplete = onCompleteAll;
	    vars.onCompleteParams = onCompleteAllParams;
	    vars.parent = this;
	    new Tween(targets, vars, _parsePosition$1(this, position));
	    return this;
	  };
	  _proto2.staggerFrom = function staggerFrom(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams) {
	    vars.runBackwards = 1;
	    _inheritDefaults(vars).immediateRender = _isNotFalse(vars.immediateRender);
	    return this.staggerTo(targets, duration, vars, stagger, position, onCompleteAll, onCompleteAllParams);
	  };
	  _proto2.staggerFromTo = function staggerFromTo(targets, duration, fromVars, toVars, stagger, position, onCompleteAll, onCompleteAllParams) {
	    toVars.startAt = fromVars;
	    _inheritDefaults(toVars).immediateRender = _isNotFalse(toVars.immediateRender);
	    return this.staggerTo(targets, duration, toVars, stagger, position, onCompleteAll, onCompleteAllParams);
	  };
	  _proto2.render = function render(totalTime, suppressEvents, force) {
	    var prevTime = this._time,
	      tDur = this._dirty ? this.totalDuration() : this._tDur,
	      dur = this._dur,
	      tTime = totalTime <= 0 ? 0 : _roundPrecise(totalTime),
	      // if a paused timeline is resumed (or its _start is updated for another reason...which rounds it), that could result in the playhead shifting a **tiny** amount and a zero-duration child at that spot may get rendered at a different ratio, like its totalTime in render() may be 1e-17 instead of 0, for example.
	      crossingStart = this._zTime < 0 !== totalTime < 0 && (this._initted || !dur),
	      time,
	      child,
	      next,
	      iteration,
	      cycleDuration,
	      prevPaused,
	      pauseTween,
	      timeScale,
	      prevStart,
	      prevIteration,
	      yoyo,
	      isYoyo;
	    this !== _globalTimeline && tTime > tDur && totalTime >= 0 && (tTime = tDur);
	    if (tTime !== this._tTime || force || crossingStart) {
	      if (prevTime !== this._time && dur) {
	        //if totalDuration() finds a child with a negative startTime and smoothChildTiming is true, things get shifted around internally so we need to adjust the time accordingly. For example, if a tween starts at -30 we must shift EVERYTHING forward 30 seconds and move this timeline's startTime backward by 30 seconds so that things align with the playhead (no jump).
	        tTime += this._time - prevTime;
	        totalTime += this._time - prevTime;
	      }
	      time = tTime;
	      prevStart = this._start;
	      timeScale = this._ts;
	      prevPaused = !timeScale;
	      if (crossingStart) {
	        dur || (prevTime = this._zTime); //when the playhead arrives at EXACTLY time 0 (right on top) of a zero-duration timeline, we need to discern if events are suppressed so that when the playhead moves again (next time), it'll trigger the callback. If events are NOT suppressed, obviously the callback would be triggered in this render. Basically, the callback should fire either when the playhead ARRIVES or LEAVES this exact spot, not both. Imagine doing a timeline.seek(0) and there's a callback that sits at 0. Since events are suppressed on that seek() by default, nothing will fire, but when the playhead moves off of that position, the callback should fire. This behavior is what people intuitively expect.

	        (totalTime || !suppressEvents) && (this._zTime = totalTime);
	      }
	      if (this._repeat) {
	        //adjust the time for repeats and yoyos
	        yoyo = this._yoyo;
	        cycleDuration = dur + this._rDelay;
	        if (this._repeat < -1 && totalTime < 0) {
	          return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
	        }
	        time = _roundPrecise(tTime % cycleDuration); //round to avoid floating point errors. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)

	        if (tTime === tDur) {
	          // the tDur === tTime is for edge cases where there's a lengthy decimal on the duration and it may reach the very end but the time is rendered as not-quite-there (remember, tDur is rounded to 4 decimals whereas dur isn't)
	          iteration = this._repeat;
	          time = dur;
	        } else {
	          iteration = ~~(tTime / cycleDuration);
	          if (iteration && iteration === tTime / cycleDuration) {
	            time = dur;
	            iteration--;
	          }
	          time > dur && (time = dur);
	        }
	        prevIteration = _animationCycle(this._tTime, cycleDuration);
	        !prevTime && this._tTime && prevIteration !== iteration && (prevIteration = iteration); // edge case - if someone does addPause() at the very beginning of a repeating timeline, that pause is technically at the same spot as the end which causes this._time to get set to 0 when the totalTime would normally place the playhead at the end. See https://greensock.com/forums/topic/23823-closing-nav-animation-not-working-on-ie-and-iphone-6-maybe-other-older-browser/?tab=comments#comment-113005

	        if (yoyo && iteration & 1) {
	          time = dur - time;
	          isYoyo = 1;
	        }
	        /*
	        make sure children at the end/beginning of the timeline are rendered properly. If, for example,
	        a 3-second long timeline rendered at 2.9 seconds previously, and now renders at 3.2 seconds (which
	        would get translated to 2.8 seconds if the timeline yoyos or 0.2 seconds if it just repeats), there
	        could be a callback or a short tween that's at 2.95 or 3 seconds in which wouldn't render. So
	        we need to push the timeline to the end (and/or beginning depending on its yoyo value). Also we must
	        ensure that zero-duration tweens at the very beginning or end of the Timeline work.
	        */

	        if (iteration !== prevIteration && !this._lock) {
	          var rewinding = yoyo && prevIteration & 1,
	            doesWrap = rewinding === (yoyo && iteration & 1);
	          iteration < prevIteration && (rewinding = !rewinding);
	          prevTime = rewinding ? 0 : dur;
	          this._lock = 1;
	          this.render(prevTime || (isYoyo ? 0 : _roundPrecise(iteration * cycleDuration)), suppressEvents, !dur)._lock = 0;
	          this._tTime = tTime; // if a user gets the iteration() inside the onRepeat, for example, it should be accurate.

	          !suppressEvents && this.parent && _callback$1(this, "onRepeat");
	          this.vars.repeatRefresh && !isYoyo && (this.invalidate()._lock = 1);
	          if (prevTime && prevTime !== this._time || prevPaused !== !this._ts || this.vars.onRepeat && !this.parent && !this._act) {
	            // if prevTime is 0 and we render at the very end, _time will be the end, thus won't match. So in this edge case, prevTime won't match _time but that's okay. If it gets killed in the onRepeat, eject as well.
	            return this;
	          }
	          dur = this._dur; // in case the duration changed in the onRepeat

	          tDur = this._tDur;
	          if (doesWrap) {
	            this._lock = 2;
	            prevTime = rewinding ? dur : -0.0001;
	            this.render(prevTime, true);
	            this.vars.repeatRefresh && !isYoyo && this.invalidate();
	          }
	          this._lock = 0;
	          if (!this._ts && !prevPaused) {
	            return this;
	          } //in order for yoyoEase to work properly when there's a stagger, we must swap out the ease in each sub-tween.

	          _propagateYoyoEase(this, isYoyo);
	        }
	      }
	      if (this._hasPause && !this._forcing && this._lock < 2) {
	        pauseTween = _findNextPauseTween(this, _roundPrecise(prevTime), _roundPrecise(time));
	        if (pauseTween) {
	          tTime -= time - (time = pauseTween._start);
	        }
	      }
	      this._tTime = tTime;
	      this._time = time;
	      this._act = !timeScale; //as long as it's not paused, force it to be active so that if the user renders independent of the parent timeline, it'll be forced to re-render on the next tick.

	      if (!this._initted) {
	        this._onUpdate = this.vars.onUpdate;
	        this._initted = 1;
	        this._zTime = totalTime;
	        prevTime = 0; // upon init, the playhead should always go forward; someone could invalidate() a completed timeline and then if they restart(), that would make child tweens render in reverse order which could lock in the wrong starting values if they build on each other, like tl.to(obj, {x: 100}).to(obj, {x: 0}).
	      }
	      if (!prevTime && time && !suppressEvents) {
	        _callback$1(this, "onStart");
	        if (this._tTime !== tTime) {
	          // in case the onStart triggered a render at a different spot, eject. Like if someone did animation.pause(0.5) or something inside the onStart.
	          return this;
	        }
	      }
	      if (time >= prevTime && totalTime >= 0) {
	        child = this._first;
	        while (child) {
	          next = child._next;
	          if ((child._act || time >= child._start) && child._ts && pauseTween !== child) {
	            if (child.parent !== this) {
	              // an extreme edge case - the child's render could do something like kill() the "next" one in the linked list, or reparent it. In that case we must re-initiate the whole render to be safe.
	              return this.render(totalTime, suppressEvents, force);
	            }
	            child.render(child._ts > 0 ? (time - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (time - child._start) * child._ts, suppressEvents, force);
	            if (time !== this._time || !this._ts && !prevPaused) {
	              //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
	              pauseTween = 0;
	              next && (tTime += this._zTime = -_tinyNum); // it didn't finish rendering, so flag zTime as negative so that so that the next time render() is called it'll be forced (to render any remaining children)

	              break;
	            }
	          }
	          child = next;
	        }
	      } else {
	        child = this._last;
	        var adjustedTime = totalTime < 0 ? totalTime : time; //when the playhead goes backward beyond the start of this timeline, we must pass that information down to the child animations so that zero-duration tweens know whether to render their starting or ending values.

	        while (child) {
	          next = child._prev;
	          if ((child._act || adjustedTime <= child._end) && child._ts && pauseTween !== child) {
	            if (child.parent !== this) {
	              // an extreme edge case - the child's render could do something like kill() the "next" one in the linked list, or reparent it. In that case we must re-initiate the whole render to be safe.
	              return this.render(totalTime, suppressEvents, force);
	            }
	            child.render(child._ts > 0 ? (adjustedTime - child._start) * child._ts : (child._dirty ? child.totalDuration() : child._tDur) + (adjustedTime - child._start) * child._ts, suppressEvents, force || _reverting$1 && (child._initted || child._startAt)); // if reverting, we should always force renders of initted tweens (but remember that .fromTo() or .from() may have a _startAt but not _initted yet). If, for example, a .fromTo() tween with a stagger (which creates an internal timeline) gets reverted BEFORE some of its child tweens render for the first time, it may not properly trigger them to revert.

	            if (time !== this._time || !this._ts && !prevPaused) {
	              //in case a tween pauses or seeks the timeline when rendering, like inside of an onUpdate/onComplete
	              pauseTween = 0;
	              next && (tTime += this._zTime = adjustedTime ? -_tinyNum : _tinyNum); // it didn't finish rendering, so adjust zTime so that so that the next time render() is called it'll be forced (to render any remaining children)

	              break;
	            }
	          }
	          child = next;
	        }
	      }
	      if (pauseTween && !suppressEvents) {
	        this.pause();
	        pauseTween.render(time >= prevTime ? 0 : -_tinyNum)._zTime = time >= prevTime ? 1 : -1;
	        if (this._ts) {
	          //the callback resumed playback! So since we may have held back the playhead due to where the pause is positioned, go ahead and jump to where it's SUPPOSED to be (if no pause happened).
	          this._start = prevStart; //if the pause was at an earlier time and the user resumed in the callback, it could reposition the timeline (changing its startTime), throwing things off slightly, so we make sure the _start doesn't shift.

	          _setEnd(this);
	          return this.render(totalTime, suppressEvents, force);
	        }
	      }
	      this._onUpdate && !suppressEvents && _callback$1(this, "onUpdate", true);
	      if (tTime === tDur && this._tTime >= this.totalDuration() || !tTime && prevTime) if (prevStart === this._start || Math.abs(timeScale) !== Math.abs(this._ts)) if (!this._lock) {
	        // remember, a child's callback may alter this timeline's playhead or timeScale which is why we need to add some of these checks.
	        (totalTime || !dur) && (tTime === tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1); // don't remove if the timeline is reversed and the playhead isn't at 0, otherwise tl.progress(1).reverse() won't work. Only remove if the playhead is at the end and timeScale is positive, or if the playhead is at 0 and the timeScale is negative.

	        if (!suppressEvents && !(totalTime < 0 && !prevTime) && (tTime || prevTime || !tDur)) {
	          _callback$1(this, tTime === tDur && totalTime >= 0 ? "onComplete" : "onReverseComplete", true);
	          this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
	        }
	      }
	    }
	    return this;
	  };
	  _proto2.add = function add(child, position) {
	    var _this2 = this;
	    _isNumber$1(position) || (position = _parsePosition$1(this, position, child));
	    if (!(child instanceof Animation)) {
	      if (_isArray(child)) {
	        child.forEach(function (obj) {
	          return _this2.add(obj, position);
	        });
	        return this;
	      }
	      if (_isString$1(child)) {
	        return this.addLabel(child, position);
	      }
	      if (_isFunction$1(child)) {
	        child = Tween.delayedCall(0, child);
	      } else {
	        return this;
	      }
	    }
	    return this !== child ? _addToTimeline(this, child, position) : this; //don't allow a timeline to be added to itself as a child!
	  };
	  _proto2.getChildren = function getChildren(nested, tweens, timelines, ignoreBeforeTime) {
	    if (nested === void 0) {
	      nested = true;
	    }
	    if (tweens === void 0) {
	      tweens = true;
	    }
	    if (timelines === void 0) {
	      timelines = true;
	    }
	    if (ignoreBeforeTime === void 0) {
	      ignoreBeforeTime = -_bigNum$1;
	    }
	    var a = [],
	      child = this._first;
	    while (child) {
	      if (child._start >= ignoreBeforeTime) {
	        if (child instanceof Tween) {
	          tweens && a.push(child);
	        } else {
	          timelines && a.push(child);
	          nested && a.push.apply(a, child.getChildren(true, tweens, timelines));
	        }
	      }
	      child = child._next;
	    }
	    return a;
	  };
	  _proto2.getById = function getById(id) {
	    var animations = this.getChildren(1, 1, 1),
	      i = animations.length;
	    while (i--) {
	      if (animations[i].vars.id === id) {
	        return animations[i];
	      }
	    }
	  };
	  _proto2.remove = function remove(child) {
	    if (_isString$1(child)) {
	      return this.removeLabel(child);
	    }
	    if (_isFunction$1(child)) {
	      return this.killTweensOf(child);
	    }
	    _removeLinkedListItem(this, child);
	    if (child === this._recent) {
	      this._recent = this._last;
	    }
	    return _uncache(this);
	  };
	  _proto2.totalTime = function totalTime(_totalTime2, suppressEvents) {
	    if (!arguments.length) {
	      return this._tTime;
	    }
	    this._forcing = 1;
	    if (!this._dp && this._ts) {
	      //special case for the global timeline (or any other that has no parent or detached parent).
	      this._start = _roundPrecise(_ticker.time - (this._ts > 0 ? _totalTime2 / this._ts : (this.totalDuration() - _totalTime2) / -this._ts));
	    }
	    _Animation.prototype.totalTime.call(this, _totalTime2, suppressEvents);
	    this._forcing = 0;
	    return this;
	  };
	  _proto2.addLabel = function addLabel(label, position) {
	    this.labels[label] = _parsePosition$1(this, position);
	    return this;
	  };
	  _proto2.removeLabel = function removeLabel(label) {
	    delete this.labels[label];
	    return this;
	  };
	  _proto2.addPause = function addPause(position, callback, params) {
	    var t = Tween.delayedCall(0, callback || _emptyFunc, params);
	    t.data = "isPause";
	    this._hasPause = 1;
	    return _addToTimeline(this, t, _parsePosition$1(this, position));
	  };
	  _proto2.removePause = function removePause(position) {
	    var child = this._first;
	    position = _parsePosition$1(this, position);
	    while (child) {
	      if (child._start === position && child.data === "isPause") {
	        _removeFromParent(child);
	      }
	      child = child._next;
	    }
	  };
	  _proto2.killTweensOf = function killTweensOf(targets, props, onlyActive) {
	    var tweens = this.getTweensOf(targets, onlyActive),
	      i = tweens.length;
	    while (i--) {
	      _overwritingTween !== tweens[i] && tweens[i].kill(targets, props);
	    }
	    return this;
	  };
	  _proto2.getTweensOf = function getTweensOf(targets, onlyActive) {
	    var a = [],
	      parsedTargets = toArray(targets),
	      child = this._first,
	      isGlobalTime = _isNumber$1(onlyActive),
	      // a number is interpreted as a global time. If the animation spans
	      children;
	    while (child) {
	      if (child instanceof Tween) {
	        if (_arrayContainsAny(child._targets, parsedTargets) && (isGlobalTime ? (!_overwritingTween || child._initted && child._ts) && child.globalTime(0) <= onlyActive && child.globalTime(child.totalDuration()) > onlyActive : !onlyActive || child.isActive())) {
	          // note: if this is for overwriting, it should only be for tweens that aren't paused and are initted.
	          a.push(child);
	        }
	      } else if ((children = child.getTweensOf(parsedTargets, onlyActive)).length) {
	        a.push.apply(a, children);
	      }
	      child = child._next;
	    }
	    return a;
	  } // potential future feature - targets() on timelines
	  // targets() {
	  // 	let result = [];
	  // 	this.getChildren(true, true, false).forEach(t => result.push(...t.targets()));
	  // 	return result.filter((v, i) => result.indexOf(v) === i);
	  // }
	  ;
	  _proto2.tweenTo = function tweenTo(position, vars) {
	    vars = vars || {};
	    var tl = this,
	      endTime = _parsePosition$1(tl, position),
	      _vars = vars,
	      startAt = _vars.startAt,
	      _onStart = _vars.onStart,
	      onStartParams = _vars.onStartParams,
	      immediateRender = _vars.immediateRender,
	      initted,
	      tween = Tween.to(tl, _setDefaults$1({
	        ease: vars.ease || "none",
	        lazy: false,
	        immediateRender: false,
	        time: endTime,
	        overwrite: "auto",
	        duration: vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale()) || _tinyNum,
	        onStart: function onStart() {
	          tl.pause();
	          if (!initted) {
	            var duration = vars.duration || Math.abs((endTime - (startAt && "time" in startAt ? startAt.time : tl._time)) / tl.timeScale());
	            tween._dur !== duration && _setDuration(tween, duration, 0, 1).render(tween._time, true, true);
	            initted = 1;
	          }
	          _onStart && _onStart.apply(tween, onStartParams || []); //in case the user had an onStart in the vars - we don't want to overwrite it.
	        }
	      }, vars));
	    return immediateRender ? tween.render(0) : tween;
	  };
	  _proto2.tweenFromTo = function tweenFromTo(fromPosition, toPosition, vars) {
	    return this.tweenTo(toPosition, _setDefaults$1({
	      startAt: {
	        time: _parsePosition$1(this, fromPosition)
	      }
	    }, vars));
	  };
	  _proto2.recent = function recent() {
	    return this._recent;
	  };
	  _proto2.nextLabel = function nextLabel(afterTime) {
	    if (afterTime === void 0) {
	      afterTime = this._time;
	    }
	    return _getLabelInDirection(this, _parsePosition$1(this, afterTime));
	  };
	  _proto2.previousLabel = function previousLabel(beforeTime) {
	    if (beforeTime === void 0) {
	      beforeTime = this._time;
	    }
	    return _getLabelInDirection(this, _parsePosition$1(this, beforeTime), 1);
	  };
	  _proto2.currentLabel = function currentLabel(value) {
	    return arguments.length ? this.seek(value, true) : this.previousLabel(this._time + _tinyNum);
	  };
	  _proto2.shiftChildren = function shiftChildren(amount, adjustLabels, ignoreBeforeTime) {
	    if (ignoreBeforeTime === void 0) {
	      ignoreBeforeTime = 0;
	    }
	    var child = this._first,
	      labels = this.labels,
	      p;
	    while (child) {
	      if (child._start >= ignoreBeforeTime) {
	        child._start += amount;
	        child._end += amount;
	      }
	      child = child._next;
	    }
	    if (adjustLabels) {
	      for (p in labels) {
	        if (labels[p] >= ignoreBeforeTime) {
	          labels[p] += amount;
	        }
	      }
	    }
	    return _uncache(this);
	  };
	  _proto2.invalidate = function invalidate(soft) {
	    var child = this._first;
	    this._lock = 0;
	    while (child) {
	      child.invalidate(soft);
	      child = child._next;
	    }
	    return _Animation.prototype.invalidate.call(this, soft);
	  };
	  _proto2.clear = function clear(includeLabels) {
	    if (includeLabels === void 0) {
	      includeLabels = true;
	    }
	    var child = this._first,
	      next;
	    while (child) {
	      next = child._next;
	      this.remove(child);
	      child = next;
	    }
	    this._dp && (this._time = this._tTime = this._pTime = 0);
	    includeLabels && (this.labels = {});
	    return _uncache(this);
	  };
	  _proto2.totalDuration = function totalDuration(value) {
	    var max = 0,
	      self = this,
	      child = self._last,
	      prevStart = _bigNum$1,
	      prev,
	      start,
	      parent;
	    if (arguments.length) {
	      return self.timeScale((self._repeat < 0 ? self.duration() : self.totalDuration()) / (self.reversed() ? -value : value));
	    }
	    if (self._dirty) {
	      parent = self.parent;
	      while (child) {
	        prev = child._prev; //record it here in case the tween changes position in the sequence...

	        child._dirty && child.totalDuration(); //could change the tween._startTime, so make sure the animation's cache is clean before analyzing it.

	        start = child._start;
	        if (start > prevStart && self._sort && child._ts && !self._lock) {
	          //in case one of the tweens shifted out of order, it needs to be re-inserted into the correct position in the sequence
	          self._lock = 1; //prevent endless recursive calls - there are methods that get triggered that check duration/totalDuration when we add().

	          _addToTimeline(self, child, start - child._delay, 1)._lock = 0;
	        } else {
	          prevStart = start;
	        }
	        if (start < 0 && child._ts) {
	          //children aren't allowed to have negative startTimes unless smoothChildTiming is true, so adjust here if one is found.
	          max -= start;
	          if (!parent && !self._dp || parent && parent.smoothChildTiming) {
	            self._start += start / self._ts;
	            self._time -= start;
	            self._tTime -= start;
	          }
	          self.shiftChildren(-start, false, -1e999);
	          prevStart = 0;
	        }
	        child._end > max && child._ts && (max = child._end);
	        child = prev;
	      }
	      _setDuration(self, self === _globalTimeline && self._time > max ? self._time : max, 1, 1);
	      self._dirty = 0;
	    }
	    return self._tDur;
	  };
	  Timeline.updateRoot = function updateRoot(time) {
	    if (_globalTimeline._ts) {
	      _lazySafeRender(_globalTimeline, _parentToChildTotalTime(time, _globalTimeline));
	      _lastRenderedFrame = _ticker.frame;
	    }
	    if (_ticker.frame >= _nextGCFrame) {
	      _nextGCFrame += _config.autoSleep || 120;
	      var child = _globalTimeline._first;
	      if (!child || !child._ts) if (_config.autoSleep && _ticker._listeners.length < 2) {
	        while (child && !child._ts) {
	          child = child._next;
	        }
	        child || _ticker.sleep();
	      }
	    }
	  };
	  return Timeline;
	}(Animation);
	_setDefaults$1(Timeline.prototype, {
	  _lock: 0,
	  _hasPause: 0,
	  _forcing: 0
	});
	var _addComplexStringPropTween = function _addComplexStringPropTween(target, prop, start, end, setter, stringFilter, funcParam) {
	    //note: we call _addComplexStringPropTween.call(tweenInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.
	    var pt = new PropTween(this._pt, target, prop, 0, 1, _renderComplexString, null, setter),
	      index = 0,
	      matchIndex = 0,
	      result,
	      startNums,
	      color,
	      endNum,
	      chunk,
	      startNum,
	      hasRandom,
	      a;
	    pt.b = start;
	    pt.e = end;
	    start += ""; //ensure values are strings

	    end += "";
	    if (hasRandom = ~end.indexOf("random(")) {
	      end = _replaceRandom(end);
	    }
	    if (stringFilter) {
	      a = [start, end];
	      stringFilter(a, target, prop); //pass an array with the starting and ending values and let the filter do whatever it needs to the values.

	      start = a[0];
	      end = a[1];
	    }
	    startNums = start.match(_complexStringNumExp) || [];
	    while (result = _complexStringNumExp.exec(end)) {
	      endNum = result[0];
	      chunk = end.substring(index, result.index);
	      if (color) {
	        color = (color + 1) % 5;
	      } else if (chunk.substr(-5) === "rgba(") {
	        color = 1;
	      }
	      if (endNum !== startNums[matchIndex++]) {
	        startNum = parseFloat(startNums[matchIndex - 1]) || 0; //these nested PropTweens are handled in a special way - we'll never actually call a render or setter method on them. We'll just loop through them in the parent complex string PropTween's render method.

	        pt._pt = {
	          _next: pt._pt,
	          p: chunk || matchIndex === 1 ? chunk : ",",
	          //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
	          s: startNum,
	          c: endNum.charAt(1) === "=" ? _parseRelative(startNum, endNum) - startNum : parseFloat(endNum) - startNum,
	          m: color && color < 4 ? Math.round : 0
	        };
	        index = _complexStringNumExp.lastIndex;
	      }
	    }
	    pt.c = index < end.length ? end.substring(index, end.length) : ""; //we use the "c" of the PropTween to store the final part of the string (after the last number)

	    pt.fp = funcParam;
	    if (_relExp.test(end) || hasRandom) {
	      pt.e = 0; //if the end string contains relative values or dynamic random(...) values, delete the end it so that on the final render we don't actually set it to the string with += or -= characters (forces it to use the calculated value).
	    }
	    this._pt = pt; //start the linked list with this new PropTween. Remember, we call _addComplexStringPropTween.call(tweenInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.

	    return pt;
	  },
	  _addPropTween = function _addPropTween(target, prop, start, end, index, targets, modifier, stringFilter, funcParam, optional) {
	    _isFunction$1(end) && (end = end(index || 0, target, targets));
	    var currentValue = target[prop],
	      parsedStart = start !== "get" ? start : !_isFunction$1(currentValue) ? currentValue : funcParam ? target[prop.indexOf("set") || !_isFunction$1(target["get" + prop.substr(3)]) ? prop : "get" + prop.substr(3)](funcParam) : target[prop](),
	      setter = !_isFunction$1(currentValue) ? _setterPlain : funcParam ? _setterFuncWithParam : _setterFunc,
	      pt;
	    if (_isString$1(end)) {
	      if (~end.indexOf("random(")) {
	        end = _replaceRandom(end);
	      }
	      if (end.charAt(1) === "=") {
	        pt = _parseRelative(parsedStart, end) + (getUnit(parsedStart) || 0);
	        if (pt || pt === 0) {
	          // to avoid isNaN, like if someone passes in a value like "!= whatever"
	          end = pt;
	        }
	      }
	    }
	    if (!optional || parsedStart !== end || _forceAllPropTweens) {
	      if (!isNaN(parsedStart * end) && end !== "") {
	        // fun fact: any number multiplied by "" is evaluated as the number 0!
	        pt = new PropTween(this._pt, target, prop, +parsedStart || 0, end - (parsedStart || 0), typeof currentValue === "boolean" ? _renderBoolean : _renderPlain, 0, setter);
	        funcParam && (pt.fp = funcParam);
	        modifier && pt.modifier(modifier, this, target);
	        return this._pt = pt;
	      }
	      !currentValue && !(prop in target) && _missingPlugin(prop, end);
	      return _addComplexStringPropTween.call(this, target, prop, parsedStart, end, setter, stringFilter || _config.stringFilter, funcParam);
	    }
	  },
	  //creates a copy of the vars object and processes any function-based values (putting the resulting values directly into the copy) as well as strings with "random()" in them. It does NOT process relative values.
	  _processVars = function _processVars(vars, index, target, targets, tween) {
	    _isFunction$1(vars) && (vars = _parseFuncOrString(vars, tween, index, target, targets));
	    if (!_isObject$1(vars) || vars.style && vars.nodeType || _isArray(vars) || _isTypedArray(vars)) {
	      return _isString$1(vars) ? _parseFuncOrString(vars, tween, index, target, targets) : vars;
	    }
	    var copy = {},
	      p;
	    for (p in vars) {
	      copy[p] = _parseFuncOrString(vars[p], tween, index, target, targets);
	    }
	    return copy;
	  },
	  _checkPlugin = function _checkPlugin(property, vars, tween, index, target, targets) {
	    var plugin, pt, ptLookup, i;
	    if (_plugins[property] && (plugin = new _plugins[property]()).init(target, plugin.rawVars ? vars[property] : _processVars(vars[property], index, target, targets, tween), tween, index, targets) !== false) {
	      tween._pt = pt = new PropTween(tween._pt, target, property, 0, 1, plugin.render, plugin, 0, plugin.priority);
	      if (tween !== _quickTween) {
	        ptLookup = tween._ptLookup[tween._targets.indexOf(target)]; //note: we can't use tween._ptLookup[index] because for staggered tweens, the index from the fullTargets array won't match what it is in each individual tween that spawns from the stagger.

	        i = plugin._props.length;
	        while (i--) {
	          ptLookup[plugin._props[i]] = pt;
	        }
	      }
	    }
	    return plugin;
	  },
	  _overwritingTween,
	  //store a reference temporarily so we can avoid overwriting itself.
	  _forceAllPropTweens,
	  _initTween = function _initTween(tween, time, tTime) {
	    var vars = tween.vars,
	      ease = vars.ease,
	      startAt = vars.startAt,
	      immediateRender = vars.immediateRender,
	      lazy = vars.lazy,
	      onUpdate = vars.onUpdate,
	      onUpdateParams = vars.onUpdateParams,
	      callbackScope = vars.callbackScope,
	      runBackwards = vars.runBackwards,
	      yoyoEase = vars.yoyoEase,
	      keyframes = vars.keyframes,
	      autoRevert = vars.autoRevert,
	      dur = tween._dur,
	      prevStartAt = tween._startAt,
	      targets = tween._targets,
	      parent = tween.parent,
	      fullTargets = parent && parent.data === "nested" ? parent.vars.targets : targets,
	      autoOverwrite = tween._overwrite === "auto" && !_suppressOverwrites$1,
	      tl = tween.timeline,
	      cleanVars,
	      i,
	      p,
	      pt,
	      target,
	      hasPriority,
	      gsData,
	      harness,
	      plugin,
	      ptLookup,
	      index,
	      harnessVars,
	      overwritten;
	    tl && (!keyframes || !ease) && (ease = "none");
	    tween._ease = _parseEase(ease, _defaults$1.ease);
	    tween._yEase = yoyoEase ? _invertEase(_parseEase(yoyoEase === true ? ease : yoyoEase, _defaults$1.ease)) : 0;
	    if (yoyoEase && tween._yoyo && !tween._repeat) {
	      //there must have been a parent timeline with yoyo:true that is currently in its yoyo phase, so flip the eases.
	      yoyoEase = tween._yEase;
	      tween._yEase = tween._ease;
	      tween._ease = yoyoEase;
	    }
	    tween._from = !tl && !!vars.runBackwards; //nested timelines should never run backwards - the backwards-ness is in the child tweens.

	    if (!tl || keyframes && !vars.stagger) {
	      //if there's an internal timeline, skip all the parsing because we passed that task down the chain.
	      harness = targets[0] ? _getCache(targets[0]).harness : 0;
	      harnessVars = harness && vars[harness.prop]; //someone may need to specify CSS-specific values AND non-CSS values, like if the element has an "x" property plus it's a standard DOM element. We allow people to distinguish by wrapping plugin-specific stuff in a css:{} object for example.

	      cleanVars = _copyExcluding(vars, _reservedProps);
	      if (prevStartAt) {
	        prevStartAt._zTime < 0 && prevStartAt.progress(1); // in case it's a lazy startAt that hasn't rendered yet.

	        time < 0 && runBackwards && immediateRender && !autoRevert ? prevStartAt.render(-1, true) : prevStartAt.revert(runBackwards && dur ? _revertConfigNoKill : _startAtRevertConfig); // if it's a "startAt" (not "from()" or runBackwards: true), we only need to do a shallow revert (keep transforms cached in CSSPlugin)
	        // don't just _removeFromParent(prevStartAt.render(-1, true)) because that'll leave inline styles. We're creating a new _startAt for "startAt" tweens that re-capture things to ensure that if the pre-tween values changed since the tween was created, they're recorded.

	        prevStartAt._lazy = 0;
	      }
	      if (startAt) {
	        _removeFromParent(tween._startAt = Tween.set(targets, _setDefaults$1({
	          data: "isStart",
	          overwrite: false,
	          parent: parent,
	          immediateRender: true,
	          lazy: !prevStartAt && _isNotFalse(lazy),
	          startAt: null,
	          delay: 0,
	          onUpdate: onUpdate,
	          onUpdateParams: onUpdateParams,
	          callbackScope: callbackScope,
	          stagger: 0
	        }, startAt))); //copy the properties/values into a new object to avoid collisions, like var to = {x:0}, from = {x:500}; timeline.fromTo(e, from, to).fromTo(e, to, from);

	        tween._startAt._dp = 0; // don't allow it to get put back into root timeline! Like when revert() is called and totalTime() gets set.

	        tween._startAt._sat = tween; // used in globalTime(). _sat stands for _startAtTween

	        time < 0 && (_reverting$1 || !immediateRender && !autoRevert) && tween._startAt.revert(_revertConfigNoKill); // rare edge case, like if a render is forced in the negative direction of a non-initted tween.

	        if (immediateRender) {
	          if (dur && time <= 0 && tTime <= 0) {
	            // check tTime here because in the case of a yoyo tween whose playhead gets pushed to the end like tween.progress(1), we should allow it through so that the onComplete gets fired properly.
	            time && (tween._zTime = time);
	            return; //we skip initialization here so that overwriting doesn't occur until the tween actually begins. Otherwise, if you create several immediateRender:true tweens of the same target/properties to drop into a Timeline, the last one created would overwrite the first ones because they didn't get placed into the timeline yet before the first render occurs and kicks in overwriting.
	          }
	        }
	      } else if (runBackwards && dur) {
	        //from() tweens must be handled uniquely: their beginning values must be rendered but we don't want overwriting to occur yet (when time is still 0). Wait until the tween actually begins before doing all the routines like overwriting. At that time, we should render at the END of the tween to ensure that things initialize correctly (remember, from() tweens go backwards)
	        if (!prevStartAt) {
	          time && (immediateRender = false); //in rare cases (like if a from() tween runs and then is invalidate()-ed), immediateRender could be true but the initial forced-render gets skipped, so there's no need to force the render in this context when the _time is greater than 0

	          p = _setDefaults$1({
	            overwrite: false,
	            data: "isFromStart",
	            //we tag the tween with as "isFromStart" so that if [inside a plugin] we need to only do something at the very END of a tween, we have a way of identifying this tween as merely the one that's setting the beginning values for a "from()" tween. For example, clearProps in CSSPlugin should only get applied at the very END of a tween and without this tag, from(...{height:100, clearProps:"height", delay:1}) would wipe the height at the beginning of the tween and after 1 second, it'd kick back in.
	            lazy: immediateRender && !prevStartAt && _isNotFalse(lazy),
	            immediateRender: immediateRender,
	            //zero-duration tweens render immediately by default, but if we're not specifically instructed to render this tween immediately, we should skip this and merely _init() to record the starting values (rendering them immediately would push them to completion which is wasteful in that case - we'd have to render(-1) immediately after)
	            stagger: 0,
	            parent: parent //ensures that nested tweens that had a stagger are handled properly, like gsap.from(".class", {y:gsap.utils.wrap([-100,100])})
	          }, cleanVars);
	          harnessVars && (p[harness.prop] = harnessVars); // in case someone does something like .from(..., {css:{}})

	          _removeFromParent(tween._startAt = Tween.set(targets, p));
	          tween._startAt._dp = 0; // don't allow it to get put back into root timeline!

	          tween._startAt._sat = tween; // used in globalTime()

	          time < 0 && (_reverting$1 ? tween._startAt.revert(_revertConfigNoKill) : tween._startAt.render(-1, true));
	          tween._zTime = time;
	          if (!immediateRender) {
	            _initTween(tween._startAt, _tinyNum, _tinyNum); //ensures that the initial values are recorded
	          } else if (!time) {
	            return;
	          }
	        }
	      }
	      tween._pt = tween._ptCache = 0;
	      lazy = dur && _isNotFalse(lazy) || lazy && !dur;
	      for (i = 0; i < targets.length; i++) {
	        target = targets[i];
	        gsData = target._gsap || _harness(targets)[i]._gsap;
	        tween._ptLookup[i] = ptLookup = {};
	        _lazyLookup[gsData.id] && _lazyTweens.length && _lazyRender(); //if other tweens of the same target have recently initted but haven't rendered yet, we've got to force the render so that the starting values are correct (imagine populating a timeline with a bunch of sequential tweens and then jumping to the end)

	        index = fullTargets === targets ? i : fullTargets.indexOf(target);
	        if (harness && (plugin = new harness()).init(target, harnessVars || cleanVars, tween, index, fullTargets) !== false) {
	          tween._pt = pt = new PropTween(tween._pt, target, plugin.name, 0, 1, plugin.render, plugin, 0, plugin.priority);
	          plugin._props.forEach(function (name) {
	            ptLookup[name] = pt;
	          });
	          plugin.priority && (hasPriority = 1);
	        }
	        if (!harness || harnessVars) {
	          for (p in cleanVars) {
	            if (_plugins[p] && (plugin = _checkPlugin(p, cleanVars, tween, index, target, fullTargets))) {
	              plugin.priority && (hasPriority = 1);
	            } else {
	              ptLookup[p] = pt = _addPropTween.call(tween, target, p, "get", cleanVars[p], index, fullTargets, 0, vars.stringFilter);
	            }
	          }
	        }
	        tween._op && tween._op[i] && tween.kill(target, tween._op[i]);
	        if (autoOverwrite && tween._pt) {
	          _overwritingTween = tween;
	          _globalTimeline.killTweensOf(target, ptLookup, tween.globalTime(time)); // make sure the overwriting doesn't overwrite THIS tween!!!

	          overwritten = !tween.parent;
	          _overwritingTween = 0;
	        }
	        tween._pt && lazy && (_lazyLookup[gsData.id] = 1);
	      }
	      hasPriority && _sortPropTweensByPriority(tween);
	      tween._onInit && tween._onInit(tween); //plugins like RoundProps must wait until ALL of the PropTweens are instantiated. In the plugin's init() function, it sets the _onInit on the tween instance. May not be pretty/intuitive, but it's fast and keeps file size down.
	    }
	    tween._onUpdate = onUpdate;
	    tween._initted = (!tween._op || tween._pt) && !overwritten; // if overwrittenProps resulted in the entire tween being killed, do NOT flag it as initted or else it may render for one tick.

	    keyframes && time <= 0 && tl.render(_bigNum$1, true, true); // if there's a 0% keyframe, it'll render in the "before" state for any staggered/delayed animations thus when the following tween initializes, it'll use the "before" state instead of the "after" state as the initial values.
	  },
	  _updatePropTweens = function _updatePropTweens(tween, property, value, start, startIsRelative, ratio, time) {
	    var ptCache = (tween._pt && tween._ptCache || (tween._ptCache = {}))[property],
	      pt,
	      rootPT,
	      lookup,
	      i;
	    if (!ptCache) {
	      ptCache = tween._ptCache[property] = [];
	      lookup = tween._ptLookup;
	      i = tween._targets.length;
	      while (i--) {
	        pt = lookup[i][property];
	        if (pt && pt.d && pt.d._pt) {
	          // it's a plugin, so find the nested PropTween
	          pt = pt.d._pt;
	          while (pt && pt.p !== property && pt.fp !== property) {
	            // "fp" is functionParam for things like setting CSS variables which require .setProperty("--var-name", value)
	            pt = pt._next;
	          }
	        }
	        if (!pt) {
	          // there is no PropTween associated with that property, so we must FORCE one to be created and ditch out of this
	          // if the tween has other properties that already rendered at new positions, we'd normally have to rewind to put them back like tween.render(0, true) before forcing an _initTween(), but that can create another edge case like tweening a timeline's progress would trigger onUpdates to fire which could move other things around. It's better to just inform users that .resetTo() should ONLY be used for tweens that already have that property. For example, you can't gsap.to(...{ y: 0 }) and then tween.restTo("x", 200) for example.
	          _forceAllPropTweens = 1; // otherwise, when we _addPropTween() and it finds no change between the start and end values, it skips creating a PropTween (for efficiency...why tween when there's no difference?) but in this case we NEED that PropTween created so we can edit it.

	          tween.vars[property] = "+=0";
	          _initTween(tween, time);
	          _forceAllPropTweens = 0;
	          return 1;
	        }
	        ptCache.push(pt);
	      }
	    }
	    i = ptCache.length;
	    while (i--) {
	      rootPT = ptCache[i];
	      pt = rootPT._pt || rootPT; // complex values may have nested PropTweens. We only accommodate the FIRST value.

	      pt.s = (start || start === 0) && !startIsRelative ? start : pt.s + (start || 0) + ratio * pt.c;
	      pt.c = value - pt.s;
	      rootPT.e && (rootPT.e = _round$1(value) + getUnit(rootPT.e)); // mainly for CSSPlugin (end value)

	      rootPT.b && (rootPT.b = pt.s + getUnit(rootPT.b)); // (beginning value)
	    }
	  },
	  _addAliasesToVars = function _addAliasesToVars(targets, vars) {
	    var harness = targets[0] ? _getCache(targets[0]).harness : 0,
	      propertyAliases = harness && harness.aliases,
	      copy,
	      p,
	      i,
	      aliases;
	    if (!propertyAliases) {
	      return vars;
	    }
	    copy = _merge({}, vars);
	    for (p in propertyAliases) {
	      if (p in copy) {
	        aliases = propertyAliases[p].split(",");
	        i = aliases.length;
	        while (i--) {
	          copy[aliases[i]] = copy[p];
	        }
	      }
	    }
	    return copy;
	  },
	  // parses multiple formats, like {"0%": {x: 100}, {"50%": {x: -20}} and { x: {"0%": 100, "50%": -20} }, and an "ease" can be set on any object. We populate an "allProps" object with an Array for each property, like {x: [{}, {}], y:[{}, {}]} with data for each property tween. The objects have a "t" (time), "v", (value), and "e" (ease) property. This allows us to piece together a timeline later.
	  _parseKeyframe = function _parseKeyframe(prop, obj, allProps, easeEach) {
	    var ease = obj.ease || easeEach || "power1.inOut",
	      p,
	      a;
	    if (_isArray(obj)) {
	      a = allProps[prop] || (allProps[prop] = []); // t = time (out of 100), v = value, e = ease

	      obj.forEach(function (value, i) {
	        return a.push({
	          t: i / (obj.length - 1) * 100,
	          v: value,
	          e: ease
	        });
	      });
	    } else {
	      for (p in obj) {
	        a = allProps[p] || (allProps[p] = []);
	        p === "ease" || a.push({
	          t: parseFloat(prop),
	          v: obj[p],
	          e: ease
	        });
	      }
	    }
	  },
	  _parseFuncOrString = function _parseFuncOrString(value, tween, i, target, targets) {
	    return _isFunction$1(value) ? value.call(tween, i, target, targets) : _isString$1(value) && ~value.indexOf("random(") ? _replaceRandom(value) : value;
	  },
	  _staggerTweenProps = _callbackNames + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert",
	  _staggerPropsToSkip = {};
	_forEachName(_staggerTweenProps + ",id,stagger,delay,duration,paused,scrollTrigger", function (name) {
	  return _staggerPropsToSkip[name] = 1;
	});
	/*
	 * --------------------------------------------------------------------------------------
	 * TWEEN
	 * --------------------------------------------------------------------------------------
	 */

	var Tween = /*#__PURE__*/function (_Animation2) {
	  _inheritsLoose(Tween, _Animation2);
	  function Tween(targets, vars, position, skipInherit) {
	    var _this3;
	    if (typeof vars === "number") {
	      position.duration = vars;
	      vars = position;
	      position = null;
	    }
	    _this3 = _Animation2.call(this, skipInherit ? vars : _inheritDefaults(vars)) || this;
	    var _this3$vars = _this3.vars,
	      duration = _this3$vars.duration,
	      delay = _this3$vars.delay,
	      immediateRender = _this3$vars.immediateRender,
	      stagger = _this3$vars.stagger,
	      overwrite = _this3$vars.overwrite,
	      keyframes = _this3$vars.keyframes,
	      defaults = _this3$vars.defaults,
	      scrollTrigger = _this3$vars.scrollTrigger,
	      yoyoEase = _this3$vars.yoyoEase,
	      parent = vars.parent || _globalTimeline,
	      parsedTargets = (_isArray(targets) || _isTypedArray(targets) ? _isNumber$1(targets[0]) : "length" in vars) ? [targets] : toArray(targets),
	      tl,
	      i,
	      copy,
	      l,
	      p,
	      curTarget,
	      staggerFunc,
	      staggerVarsToMerge;
	    _this3._targets = parsedTargets.length ? _harness(parsedTargets) : _warn("GSAP target " + targets + " not found. https://greensock.com", !_config.nullTargetWarn) || [];
	    _this3._ptLookup = []; //PropTween lookup. An array containing an object for each target, having keys for each tweening property

	    _this3._overwrite = overwrite;
	    if (keyframes || stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
	      vars = _this3.vars;
	      tl = _this3.timeline = new Timeline({
	        data: "nested",
	        defaults: defaults || {},
	        targets: parent && parent.data === "nested" ? parent.vars.targets : parsedTargets
	      }); // we need to store the targets because for staggers and keyframes, we end up creating an individual tween for each but function-based values need to know the index and the whole Array of targets.

	      tl.kill();
	      tl.parent = tl._dp = _assertThisInitialized(_this3);
	      tl._start = 0;
	      if (stagger || _isFuncOrString(duration) || _isFuncOrString(delay)) {
	        l = parsedTargets.length;
	        staggerFunc = stagger && distribute(stagger);
	        if (_isObject$1(stagger)) {
	          //users can pass in callbacks like onStart/onComplete in the stagger object. These should fire with each individual tween.
	          for (p in stagger) {
	            if (~_staggerTweenProps.indexOf(p)) {
	              staggerVarsToMerge || (staggerVarsToMerge = {});
	              staggerVarsToMerge[p] = stagger[p];
	            }
	          }
	        }
	        for (i = 0; i < l; i++) {
	          copy = _copyExcluding(vars, _staggerPropsToSkip);
	          copy.stagger = 0;
	          yoyoEase && (copy.yoyoEase = yoyoEase);
	          staggerVarsToMerge && _merge(copy, staggerVarsToMerge);
	          curTarget = parsedTargets[i]; //don't just copy duration or delay because if they're a string or function, we'd end up in an infinite loop because _isFuncOrString() would evaluate as true in the child tweens, entering this loop, etc. So we parse the value straight from vars and default to 0.

	          copy.duration = +_parseFuncOrString(duration, _assertThisInitialized(_this3), i, curTarget, parsedTargets);
	          copy.delay = (+_parseFuncOrString(delay, _assertThisInitialized(_this3), i, curTarget, parsedTargets) || 0) - _this3._delay;
	          if (!stagger && l === 1 && copy.delay) {
	            // if someone does delay:"random(1, 5)", repeat:-1, for example, the delay shouldn't be inside the repeat.
	            _this3._delay = delay = copy.delay;
	            _this3._start += delay;
	            copy.delay = 0;
	          }
	          tl.to(curTarget, copy, staggerFunc ? staggerFunc(i, curTarget, parsedTargets) : 0);
	          tl._ease = _easeMap.none;
	        }
	        tl.duration() ? duration = delay = 0 : _this3.timeline = 0; // if the timeline's duration is 0, we don't need a timeline internally!
	      } else if (keyframes) {
	        _inheritDefaults(_setDefaults$1(tl.vars.defaults, {
	          ease: "none"
	        }));
	        tl._ease = _parseEase(keyframes.ease || vars.ease || "none");
	        var time = 0,
	          a,
	          kf,
	          v;
	        if (_isArray(keyframes)) {
	          keyframes.forEach(function (frame) {
	            return tl.to(parsedTargets, frame, ">");
	          });
	          tl.duration(); // to ensure tl._dur is cached because we tap into it for performance purposes in the render() method.
	        } else {
	          copy = {};
	          for (p in keyframes) {
	            p === "ease" || p === "easeEach" || _parseKeyframe(p, keyframes[p], copy, keyframes.easeEach);
	          }
	          for (p in copy) {
	            a = copy[p].sort(function (a, b) {
	              return a.t - b.t;
	            });
	            time = 0;
	            for (i = 0; i < a.length; i++) {
	              kf = a[i];
	              v = {
	                ease: kf.e,
	                duration: (kf.t - (i ? a[i - 1].t : 0)) / 100 * duration
	              };
	              v[p] = kf.v;
	              tl.to(parsedTargets, v, time);
	              time += v.duration;
	            }
	          }
	          tl.duration() < duration && tl.to({}, {
	            duration: duration - tl.duration()
	          }); // in case keyframes didn't go to 100%
	        }
	      }
	      duration || _this3.duration(duration = tl.duration());
	    } else {
	      _this3.timeline = 0; //speed optimization, faster lookups (no going up the prototype chain)
	    }
	    if (overwrite === true && !_suppressOverwrites$1) {
	      _overwritingTween = _assertThisInitialized(_this3);
	      _globalTimeline.killTweensOf(parsedTargets);
	      _overwritingTween = 0;
	    }
	    _addToTimeline(parent, _assertThisInitialized(_this3), position);
	    vars.reversed && _this3.reverse();
	    vars.paused && _this3.paused(true);
	    if (immediateRender || !duration && !keyframes && _this3._start === _roundPrecise(parent._time) && _isNotFalse(immediateRender) && _hasNoPausedAncestors(_assertThisInitialized(_this3)) && parent.data !== "nested") {
	      _this3._tTime = -_tinyNum; //forces a render without having to set the render() "force" parameter to true because we want to allow lazying by default (using the "force" parameter always forces an immediate full render)

	      _this3.render(Math.max(0, -delay) || 0); //in case delay is negative
	    }
	    scrollTrigger && _scrollTrigger(_assertThisInitialized(_this3), scrollTrigger);
	    return _this3;
	  }
	  var _proto3 = Tween.prototype;
	  _proto3.render = function render(totalTime, suppressEvents, force) {
	    var prevTime = this._time,
	      tDur = this._tDur,
	      dur = this._dur,
	      isNegative = totalTime < 0,
	      tTime = totalTime > tDur - _tinyNum && !isNegative ? tDur : totalTime < _tinyNum ? 0 : totalTime,
	      time,
	      pt,
	      iteration,
	      cycleDuration,
	      prevIteration,
	      isYoyo,
	      ratio,
	      timeline,
	      yoyoEase;
	    if (!dur) {
	      _renderZeroDurationTween(this, totalTime, suppressEvents, force);
	    } else if (tTime !== this._tTime || !totalTime || force || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== isNegative) {
	      //this senses if we're crossing over the start time, in which case we must record _zTime and force the render, but we do it in this lengthy conditional way for performance reasons (usually we can skip the calculations): this._initted && (this._zTime < 0) !== (totalTime < 0)
	      time = tTime;
	      timeline = this.timeline;
	      if (this._repeat) {
	        //adjust the time for repeats and yoyos
	        cycleDuration = dur + this._rDelay;
	        if (this._repeat < -1 && isNegative) {
	          return this.totalTime(cycleDuration * 100 + totalTime, suppressEvents, force);
	        }
	        time = _roundPrecise(tTime % cycleDuration); //round to avoid floating point errors. (4 % 0.8 should be 0 but some browsers report it as 0.79999999!)

	        if (tTime === tDur) {
	          // the tDur === tTime is for edge cases where there's a lengthy decimal on the duration and it may reach the very end but the time is rendered as not-quite-there (remember, tDur is rounded to 4 decimals whereas dur isn't)
	          iteration = this._repeat;
	          time = dur;
	        } else {
	          iteration = ~~(tTime / cycleDuration);
	          if (iteration && iteration === tTime / cycleDuration) {
	            time = dur;
	            iteration--;
	          }
	          time > dur && (time = dur);
	        }
	        isYoyo = this._yoyo && iteration & 1;
	        if (isYoyo) {
	          yoyoEase = this._yEase;
	          time = dur - time;
	        }
	        prevIteration = _animationCycle(this._tTime, cycleDuration);
	        if (time === prevTime && !force && this._initted) {
	          //could be during the repeatDelay part. No need to render and fire callbacks.
	          this._tTime = tTime;
	          return this;
	        }
	        if (iteration !== prevIteration) {
	          timeline && this._yEase && _propagateYoyoEase(timeline, isYoyo); //repeatRefresh functionality

	          if (this.vars.repeatRefresh && !isYoyo && !this._lock) {
	            this._lock = force = 1; //force, otherwise if lazy is true, the _attemptInitTween() will return and we'll jump out and get caught bouncing on each tick.

	            this.render(_roundPrecise(cycleDuration * iteration), true).invalidate()._lock = 0;
	          }
	        }
	      }
	      if (!this._initted) {
	        if (_attemptInitTween(this, isNegative ? totalTime : time, force, suppressEvents, tTime)) {
	          this._tTime = 0; // in constructor if immediateRender is true, we set _tTime to -_tinyNum to have the playhead cross the starting point but we can't leave _tTime as a negative number.

	          return this;
	        }
	        if (prevTime !== this._time) {
	          // rare edge case - during initialization, an onUpdate in the _startAt (.fromTo()) might force this tween to render at a different spot in which case we should ditch this render() call so that it doesn't revert the values.
	          return this;
	        }
	        if (dur !== this._dur) {
	          // while initting, a plugin like InertiaPlugin might alter the duration, so rerun from the start to ensure everything renders as it should.
	          return this.render(totalTime, suppressEvents, force);
	        }
	      }
	      this._tTime = tTime;
	      this._time = time;
	      if (!this._act && this._ts) {
	        this._act = 1; //as long as it's not paused, force it to be active so that if the user renders independent of the parent timeline, it'll be forced to re-render on the next tick.

	        this._lazy = 0;
	      }
	      this.ratio = ratio = (yoyoEase || this._ease)(time / dur);
	      if (this._from) {
	        this.ratio = ratio = 1 - ratio;
	      }
	      if (time && !prevTime && !suppressEvents) {
	        _callback$1(this, "onStart");
	        if (this._tTime !== tTime) {
	          // in case the onStart triggered a render at a different spot, eject. Like if someone did animation.pause(0.5) or something inside the onStart.
	          return this;
	        }
	      }
	      pt = this._pt;
	      while (pt) {
	        pt.r(ratio, pt.d);
	        pt = pt._next;
	      }
	      timeline && timeline.render(totalTime < 0 ? totalTime : !time && isYoyo ? -_tinyNum : timeline._dur * timeline._ease(time / this._dur), suppressEvents, force) || this._startAt && (this._zTime = totalTime);
	      if (this._onUpdate && !suppressEvents) {
	        isNegative && _rewindStartAt(this, totalTime, suppressEvents, force); //note: for performance reasons, we tuck this conditional logic inside less traveled areas (most tweens don't have an onUpdate). We'd just have it at the end before the onComplete, but the values should be updated before any onUpdate is called, so we ALSO put it here and then if it's not called, we do so later near the onComplete.

	        _callback$1(this, "onUpdate");
	      }
	      this._repeat && iteration !== prevIteration && this.vars.onRepeat && !suppressEvents && this.parent && _callback$1(this, "onRepeat");
	      if ((tTime === this._tDur || !tTime) && this._tTime === tTime) {
	        isNegative && !this._onUpdate && _rewindStartAt(this, totalTime, true, true);
	        (totalTime || !dur) && (tTime === this._tDur && this._ts > 0 || !tTime && this._ts < 0) && _removeFromParent(this, 1); // don't remove if we're rendering at exactly a time of 0, as there could be autoRevert values that should get set on the next tick (if the playhead goes backward beyond the startTime, negative totalTime). Don't remove if the timeline is reversed and the playhead isn't at 0, otherwise tl.progress(1).reverse() won't work. Only remove if the playhead is at the end and timeScale is positive, or if the playhead is at 0 and the timeScale is negative.

	        if (!suppressEvents && !(isNegative && !prevTime) && (tTime || prevTime || isYoyo)) {
	          // if prevTime and tTime are zero, we shouldn't fire the onReverseComplete. This could happen if you gsap.to(... {paused:true}).play();
	          _callback$1(this, tTime === tDur ? "onComplete" : "onReverseComplete", true);
	          this._prom && !(tTime < tDur && this.timeScale() > 0) && this._prom();
	        }
	      }
	    }
	    return this;
	  };
	  _proto3.targets = function targets() {
	    return this._targets;
	  };
	  _proto3.invalidate = function invalidate(soft) {
	    // "soft" gives us a way to clear out everything EXCEPT the recorded pre-"from" portion of from() tweens. Otherwise, for example, if you tween.progress(1).render(0, true true).invalidate(), the "from" values would persist and then on the next render, the from() tweens would initialize and the current value would match the "from" values, thus animate from the same value to the same value (no animation). We tap into this in ScrollTrigger's refresh() where we must push a tween to completion and then back again but honor its init state in case the tween is dependent on another tween further up on the page.
	    (!soft || !this.vars.runBackwards) && (this._startAt = 0);
	    this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0;
	    this._ptLookup = [];
	    this.timeline && this.timeline.invalidate(soft);
	    return _Animation2.prototype.invalidate.call(this, soft);
	  };
	  _proto3.resetTo = function resetTo(property, value, start, startIsRelative) {
	    _tickerActive || _ticker.wake();
	    this._ts || this.play();
	    var time = Math.min(this._dur, (this._dp._time - this._start) * this._ts),
	      ratio;
	    this._initted || _initTween(this, time);
	    ratio = this._ease(time / this._dur); // don't just get tween.ratio because it may not have rendered yet.
	    // possible future addition to allow an object with multiple values to update, like tween.resetTo({x: 100, y: 200}); At this point, it doesn't seem worth the added kb given the fact that most users will likely opt for the convenient gsap.quickTo() way of interacting with this method.
	    // if (_isObject(property)) { // performance optimization
	    // 	for (p in property) {
	    // 		if (_updatePropTweens(this, p, property[p], value ? value[p] : null, start, ratio, time)) {
	    // 			return this.resetTo(property, value, start, startIsRelative); // if a PropTween wasn't found for the property, it'll get forced with a re-initialization so we need to jump out and start over again.
	    // 		}
	    // 	}
	    // } else {

	    if (_updatePropTweens(this, property, value, start, startIsRelative, ratio, time)) {
	      return this.resetTo(property, value, start, startIsRelative); // if a PropTween wasn't found for the property, it'll get forced with a re-initialization so we need to jump out and start over again.
	    } //}

	    _alignPlayhead(this, 0);
	    this.parent || _addLinkedListItem(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0);
	    return this.render(0);
	  };
	  _proto3.kill = function kill(targets, vars) {
	    if (vars === void 0) {
	      vars = "all";
	    }
	    if (!targets && (!vars || vars === "all")) {
	      this._lazy = this._pt = 0;
	      return this.parent ? _interrupt(this) : this;
	    }
	    if (this.timeline) {
	      var tDur = this.timeline.totalDuration();
	      this.timeline.killTweensOf(targets, vars, _overwritingTween && _overwritingTween.vars.overwrite !== true)._first || _interrupt(this); // if nothing is left tweening, interrupt.

	      this.parent && tDur !== this.timeline.totalDuration() && _setDuration(this, this._dur * this.timeline._tDur / tDur, 0, 1); // if a nested tween is killed that changes the duration, it should affect this tween's duration. We must use the ratio, though, because sometimes the internal timeline is stretched like for keyframes where they don't all add up to whatever the parent tween's duration was set to.

	      return this;
	    }
	    var parsedTargets = this._targets,
	      killingTargets = targets ? toArray(targets) : parsedTargets,
	      propTweenLookup = this._ptLookup,
	      firstPT = this._pt,
	      overwrittenProps,
	      curLookup,
	      curOverwriteProps,
	      props,
	      p,
	      pt,
	      i;
	    if ((!vars || vars === "all") && _arraysMatch(parsedTargets, killingTargets)) {
	      vars === "all" && (this._pt = 0);
	      return _interrupt(this);
	    }
	    overwrittenProps = this._op = this._op || [];
	    if (vars !== "all") {
	      //so people can pass in a comma-delimited list of property names
	      if (_isString$1(vars)) {
	        p = {};
	        _forEachName(vars, function (name) {
	          return p[name] = 1;
	        });
	        vars = p;
	      }
	      vars = _addAliasesToVars(parsedTargets, vars);
	    }
	    i = parsedTargets.length;
	    while (i--) {
	      if (~killingTargets.indexOf(parsedTargets[i])) {
	        curLookup = propTweenLookup[i];
	        if (vars === "all") {
	          overwrittenProps[i] = vars;
	          props = curLookup;
	          curOverwriteProps = {};
	        } else {
	          curOverwriteProps = overwrittenProps[i] = overwrittenProps[i] || {};
	          props = vars;
	        }
	        for (p in props) {
	          pt = curLookup && curLookup[p];
	          if (pt) {
	            if (!("kill" in pt.d) || pt.d.kill(p) === true) {
	              _removeLinkedListItem(this, pt, "_pt");
	            }
	            delete curLookup[p];
	          }
	          if (curOverwriteProps !== "all") {
	            curOverwriteProps[p] = 1;
	          }
	        }
	      }
	    }
	    this._initted && !this._pt && firstPT && _interrupt(this); //if all tweening properties are killed, kill the tween. Without this line, if there's a tween with multiple targets and then you killTweensOf() each target individually, the tween would technically still remain active and fire its onComplete even though there aren't any more properties tweening.

	    return this;
	  };
	  Tween.to = function to(targets, vars) {
	    return new Tween(targets, vars, arguments[2]);
	  };
	  Tween.from = function from(targets, vars) {
	    return _createTweenType(1, arguments);
	  };
	  Tween.delayedCall = function delayedCall(delay, callback, params, scope) {
	    return new Tween(callback, 0, {
	      immediateRender: false,
	      lazy: false,
	      overwrite: false,
	      delay: delay,
	      onComplete: callback,
	      onReverseComplete: callback,
	      onCompleteParams: params,
	      onReverseCompleteParams: params,
	      callbackScope: scope
	    }); // we must use onReverseComplete too for things like timeline.add(() => {...}) which should be triggered in BOTH directions (forward and reverse)
	  };
	  Tween.fromTo = function fromTo(targets, fromVars, toVars) {
	    return _createTweenType(2, arguments);
	  };
	  Tween.set = function set(targets, vars) {
	    vars.duration = 0;
	    vars.repeatDelay || (vars.repeat = 0);
	    return new Tween(targets, vars);
	  };
	  Tween.killTweensOf = function killTweensOf(targets, props, onlyActive) {
	    return _globalTimeline.killTweensOf(targets, props, onlyActive);
	  };
	  return Tween;
	}(Animation);
	_setDefaults$1(Tween.prototype, {
	  _targets: [],
	  _lazy: 0,
	  _startAt: 0,
	  _op: 0,
	  _onInit: 0
	}); //add the pertinent timeline methods to Tween instances so that users can chain conveniently and create a timeline automatically. (removed due to concerns that it'd ultimately add to more confusion especially for beginners)
	// _forEachName("to,from,fromTo,set,call,add,addLabel,addPause", name => {
	// 	Tween.prototype[name] = function() {
	// 		let tl = new Timeline();
	// 		return _addToTimeline(tl, this)[name].apply(tl, toArray(arguments));
	// 	}
	// });
	//for backward compatibility. Leverage the timeline calls.

	_forEachName("staggerTo,staggerFrom,staggerFromTo", function (name) {
	  Tween[name] = function () {
	    var tl = new Timeline(),
	      params = _slice.call(arguments, 0);
	    params.splice(name === "staggerFromTo" ? 5 : 4, 0, 0);
	    return tl[name].apply(tl, params);
	  };
	});
	/*
	 * --------------------------------------------------------------------------------------
	 * PROPTWEEN
	 * --------------------------------------------------------------------------------------
	 */

	var _setterPlain = function _setterPlain(target, property, value) {
	    return target[property] = value;
	  },
	  _setterFunc = function _setterFunc(target, property, value) {
	    return target[property](value);
	  },
	  _setterFuncWithParam = function _setterFuncWithParam(target, property, value, data) {
	    return target[property](data.fp, value);
	  },
	  _setterAttribute = function _setterAttribute(target, property, value) {
	    return target.setAttribute(property, value);
	  },
	  _getSetter = function _getSetter(target, property) {
	    return _isFunction$1(target[property]) ? _setterFunc : _isUndefined(target[property]) && target.setAttribute ? _setterAttribute : _setterPlain;
	  },
	  _renderPlain = function _renderPlain(ratio, data) {
	    return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 1000000) / 1000000, data);
	  },
	  _renderBoolean = function _renderBoolean(ratio, data) {
	    return data.set(data.t, data.p, !!(data.s + data.c * ratio), data);
	  },
	  _renderComplexString = function _renderComplexString(ratio, data) {
	    var pt = data._pt,
	      s = "";
	    if (!ratio && data.b) {
	      //b = beginning string
	      s = data.b;
	    } else if (ratio === 1 && data.e) {
	      //e = ending string
	      s = data.e;
	    } else {
	      while (pt) {
	        s = pt.p + (pt.m ? pt.m(pt.s + pt.c * ratio) : Math.round((pt.s + pt.c * ratio) * 10000) / 10000) + s; //we use the "p" property for the text inbetween (like a suffix). And in the context of a complex string, the modifier (m) is typically just Math.round(), like for RGB colors.

	        pt = pt._next;
	      }
	      s += data.c; //we use the "c" of the PropTween to store the final chunk of non-numeric text.
	    }
	    data.set(data.t, data.p, s, data);
	  },
	  _renderPropTweens = function _renderPropTweens(ratio, data) {
	    var pt = data._pt;
	    while (pt) {
	      pt.r(ratio, pt.d);
	      pt = pt._next;
	    }
	  },
	  _addPluginModifier = function _addPluginModifier(modifier, tween, target, property) {
	    var pt = this._pt,
	      next;
	    while (pt) {
	      next = pt._next;
	      pt.p === property && pt.modifier(modifier, tween, target);
	      pt = next;
	    }
	  },
	  _killPropTweensOf = function _killPropTweensOf(property) {
	    var pt = this._pt,
	      hasNonDependentRemaining,
	      next;
	    while (pt) {
	      next = pt._next;
	      if (pt.p === property && !pt.op || pt.op === property) {
	        _removeLinkedListItem(this, pt, "_pt");
	      } else if (!pt.dep) {
	        hasNonDependentRemaining = 1;
	      }
	      pt = next;
	    }
	    return !hasNonDependentRemaining;
	  },
	  _setterWithModifier = function _setterWithModifier(target, property, value, data) {
	    data.mSet(target, property, data.m.call(data.tween, value, data.mt), data);
	  },
	  _sortPropTweensByPriority = function _sortPropTweensByPriority(parent) {
	    var pt = parent._pt,
	      next,
	      pt2,
	      first,
	      last; //sorts the PropTween linked list in order of priority because some plugins need to do their work after ALL of the PropTweens were created (like RoundPropsPlugin and ModifiersPlugin)

	    while (pt) {
	      next = pt._next;
	      pt2 = first;
	      while (pt2 && pt2.pr > pt.pr) {
	        pt2 = pt2._next;
	      }
	      if (pt._prev = pt2 ? pt2._prev : last) {
	        pt._prev._next = pt;
	      } else {
	        first = pt;
	      }
	      if (pt._next = pt2) {
	        pt2._prev = pt;
	      } else {
	        last = pt;
	      }
	      pt = next;
	    }
	    parent._pt = first;
	  }; //PropTween key: t = target, p = prop, r = renderer, d = data, s = start, c = change, op = overwriteProperty (ONLY populated when it's different than p), pr = priority, _next/_prev for the linked list siblings, set = setter, m = modifier, mSet = modifierSetter (the original setter, before a modifier was added)

	var PropTween = /*#__PURE__*/function () {
	  function PropTween(next, target, prop, start, change, renderer, data, setter, priority) {
	    this.t = target;
	    this.s = start;
	    this.c = change;
	    this.p = prop;
	    this.r = renderer || _renderPlain;
	    this.d = data || this;
	    this.set = setter || _setterPlain;
	    this.pr = priority || 0;
	    this._next = next;
	    if (next) {
	      next._prev = this;
	    }
	  }
	  var _proto4 = PropTween.prototype;
	  _proto4.modifier = function modifier(func, tween, target) {
	    this.mSet = this.mSet || this.set; //in case it was already set (a PropTween can only have one modifier)

	    this.set = _setterWithModifier;
	    this.m = func;
	    this.mt = target; //modifier target

	    this.tween = tween;
	  };
	  return PropTween;
	}(); //Initialization tasks

	_forEachName(_callbackNames + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function (name) {
	  return _reservedProps[name] = 1;
	});
	_globals.TweenMax = _globals.TweenLite = Tween;
	_globals.TimelineLite = _globals.TimelineMax = Timeline;
	_globalTimeline = new Timeline({
	  sortChildren: false,
	  defaults: _defaults$1,
	  autoRemoveChildren: true,
	  id: "root",
	  smoothChildTiming: true
	});
	_config.stringFilter = _colorStringFilter;
	var _media = [],
	  _listeners$1 = {},
	  _emptyArray$1 = [],
	  _lastMediaTime = 0,
	  _dispatch$1 = function _dispatch(type) {
	    return (_listeners$1[type] || _emptyArray$1).map(function (f) {
	      return f();
	    });
	  },
	  _onMediaChange = function _onMediaChange() {
	    var time = Date.now(),
	      matches = [];
	    if (time - _lastMediaTime > 2) {
	      _dispatch$1("matchMediaInit");
	      _media.forEach(function (c) {
	        var queries = c.queries,
	          conditions = c.conditions,
	          match,
	          p,
	          anyMatch,
	          toggled;
	        for (p in queries) {
	          match = _win$3.matchMedia(queries[p]).matches; // Firefox doesn't update the "matches" property of the MediaQueryList object correctly - it only does so as it calls its change handler - so we must re-create a media query here to ensure it's accurate.

	          match && (anyMatch = 1);
	          if (match !== conditions[p]) {
	            conditions[p] = match;
	            toggled = 1;
	          }
	        }
	        if (toggled) {
	          c.revert();
	          anyMatch && matches.push(c);
	        }
	      });
	      _dispatch$1("matchMediaRevert");
	      matches.forEach(function (c) {
	        return c.onMatch(c);
	      });
	      _lastMediaTime = time;
	      _dispatch$1("matchMedia");
	    }
	  };
	var Context = /*#__PURE__*/function () {
	  function Context(func, scope) {
	    this.selector = scope && selector(scope);
	    this.data = [];
	    this._r = []; // returned/cleanup functions

	    this.isReverted = false;
	    func && this.add(func);
	  }
	  var _proto5 = Context.prototype;
	  _proto5.add = function add(name, func, scope) {
	    // possible future addition if we need the ability to add() an animation to a context and for whatever reason cannot create that animation inside of a context.add(() => {...}) function.
	    // if (name && _isFunction(name.revert)) {
	    // 	this.data.push(name);
	    // 	return (name._ctx = this);
	    // }
	    if (_isFunction$1(name)) {
	      scope = func;
	      func = name;
	      name = _isFunction$1;
	    }
	    var self = this,
	      f = function f() {
	        var prev = _context$2,
	          prevSelector = self.selector,
	          result;
	        prev && prev !== self && prev.data.push(self);
	        scope && (self.selector = selector(scope));
	        _context$2 = self;
	        result = func.apply(self, arguments);
	        _isFunction$1(result) && self._r.push(result);
	        _context$2 = prev;
	        self.selector = prevSelector;
	        self.isReverted = false;
	        return result;
	      };
	    self.last = f;
	    return name === _isFunction$1 ? f(self) : name ? self[name] = f : f;
	  };
	  _proto5.ignore = function ignore(func) {
	    var prev = _context$2;
	    _context$2 = null;
	    func(this);
	    _context$2 = prev;
	  };
	  _proto5.getTweens = function getTweens() {
	    var a = [];
	    this.data.forEach(function (e) {
	      return e instanceof Context ? a.push.apply(a, e.getTweens()) : e instanceof Tween && !(e.parent && e.parent.data === "nested") && a.push(e);
	    });
	    return a;
	  };
	  _proto5.clear = function clear() {
	    this._r.length = this.data.length = 0;
	  };
	  _proto5.kill = function kill(revert, matchMedia) {
	    var _this4 = this;
	    if (revert) {
	      var tweens = this.getTweens();
	      this.data.forEach(function (t) {
	        // Flip plugin tweens are very different in that they should actually be pushed to their end. The plugin replaces the timeline's .revert() method to do exactly that. But we also need to remove any of those nested tweens inside the flip timeline so that they don't get individually reverted.
	        if (t.data === "isFlip") {
	          t.revert();
	          t.getChildren(true, true, false).forEach(function (tween) {
	            return tweens.splice(tweens.indexOf(tween), 1);
	          });
	        }
	      }); // save as an object so that we can cache the globalTime for each tween to optimize performance during the sort

	      tweens.map(function (t) {
	        return {
	          g: t.globalTime(0),
	          t: t
	        };
	      }).sort(function (a, b) {
	        return b.g - a.g || -1;
	      }).forEach(function (o) {
	        return o.t.revert(revert);
	      }); // note: all of the _startAt tweens should be reverted in reverse order that they were created, and they'll all have the same globalTime (-1) so the " || -1" in the sort keeps the order properly.

	      this.data.forEach(function (e) {
	        return !(e instanceof Animation) && e.revert && e.revert(revert);
	      });
	      this._r.forEach(function (f) {
	        return f(revert, _this4);
	      });
	      this.isReverted = true;
	    } else {
	      this.data.forEach(function (e) {
	        return e.kill && e.kill();
	      });
	    }
	    this.clear();
	    if (matchMedia) {
	      var i = _media.indexOf(this);
	      !!~i && _media.splice(i, 1);
	    }
	  };
	  _proto5.revert = function revert(config) {
	    this.kill(config || {});
	  };
	  return Context;
	}();
	var MatchMedia = /*#__PURE__*/function () {
	  function MatchMedia(scope) {
	    this.contexts = [];
	    this.scope = scope;
	  }
	  var _proto6 = MatchMedia.prototype;
	  _proto6.add = function add(conditions, func, scope) {
	    _isObject$1(conditions) || (conditions = {
	      matches: conditions
	    });
	    var context = new Context(0, scope || this.scope),
	      cond = context.conditions = {},
	      mq,
	      p,
	      active;
	    this.contexts.push(context);
	    func = context.add("onMatch", func);
	    context.queries = conditions;
	    for (p in conditions) {
	      if (p === "all") {
	        active = 1;
	      } else {
	        mq = _win$3.matchMedia(conditions[p]);
	        if (mq) {
	          _media.indexOf(context) < 0 && _media.push(context);
	          (cond[p] = mq.matches) && (active = 1);
	          mq.addListener ? mq.addListener(_onMediaChange) : mq.addEventListener("change", _onMediaChange);
	        }
	      }
	    }
	    active && func(context);
	    return this;
	  } // refresh() {
	  // 	let time = _lastMediaTime,
	  // 		media = _media;
	  // 	_lastMediaTime = -1;
	  // 	_media = this.contexts;
	  // 	_onMediaChange();
	  // 	_lastMediaTime = time;
	  // 	_media = media;
	  // }
	  ;
	  _proto6.revert = function revert(config) {
	    this.kill(config || {});
	  };
	  _proto6.kill = function kill(revert) {
	    this.contexts.forEach(function (c) {
	      return c.kill(revert, true);
	    });
	  };
	  return MatchMedia;
	}();
	/*
	 * --------------------------------------------------------------------------------------
	 * GSAP
	 * --------------------------------------------------------------------------------------
	 */

	var _gsap = {
	  registerPlugin: function registerPlugin() {
	    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	      args[_key2] = arguments[_key2];
	    }
	    args.forEach(function (config) {
	      return _createPlugin(config);
	    });
	  },
	  timeline: function timeline(vars) {
	    return new Timeline(vars);
	  },
	  getTweensOf: function getTweensOf(targets, onlyActive) {
	    return _globalTimeline.getTweensOf(targets, onlyActive);
	  },
	  getProperty: function getProperty(target, property, unit, uncache) {
	    _isString$1(target) && (target = toArray(target)[0]); //in case selector text or an array is passed in

	    var getter = _getCache(target || {}).get,
	      format = unit ? _passThrough$1 : _numericIfPossible;
	    unit === "native" && (unit = "");
	    return !target ? target : !property ? function (property, unit, uncache) {
	      return format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
	    } : format((_plugins[property] && _plugins[property].get || getter)(target, property, unit, uncache));
	  },
	  quickSetter: function quickSetter(target, property, unit) {
	    target = toArray(target);
	    if (target.length > 1) {
	      var setters = target.map(function (t) {
	          return gsap$2.quickSetter(t, property, unit);
	        }),
	        l = setters.length;
	      return function (value) {
	        var i = l;
	        while (i--) {
	          setters[i](value);
	        }
	      };
	    }
	    target = target[0] || {};
	    var Plugin = _plugins[property],
	      cache = _getCache(target),
	      p = cache.harness && (cache.harness.aliases || {})[property] || property,
	      // in case it's an alias, like "rotate" for "rotation".
	      setter = Plugin ? function (value) {
	        var p = new Plugin();
	        _quickTween._pt = 0;
	        p.init(target, unit ? value + unit : value, _quickTween, 0, [target]);
	        p.render(1, p);
	        _quickTween._pt && _renderPropTweens(1, _quickTween);
	      } : cache.set(target, p);
	    return Plugin ? setter : function (value) {
	      return setter(target, p, unit ? value + unit : value, cache, 1);
	    };
	  },
	  quickTo: function quickTo(target, property, vars) {
	    var _merge2;
	    var tween = gsap$2.to(target, _merge((_merge2 = {}, _merge2[property] = "+=0.1", _merge2.paused = true, _merge2), vars || {})),
	      func = function func(value, start, startIsRelative) {
	        return tween.resetTo(property, value, start, startIsRelative);
	      };
	    func.tween = tween;
	    return func;
	  },
	  isTweening: function isTweening(targets) {
	    return _globalTimeline.getTweensOf(targets, true).length > 0;
	  },
	  defaults: function defaults(value) {
	    value && value.ease && (value.ease = _parseEase(value.ease, _defaults$1.ease));
	    return _mergeDeep(_defaults$1, value || {});
	  },
	  config: function config(value) {
	    return _mergeDeep(_config, value || {});
	  },
	  registerEffect: function registerEffect(_ref3) {
	    var name = _ref3.name,
	      effect = _ref3.effect,
	      plugins = _ref3.plugins,
	      defaults = _ref3.defaults,
	      extendTimeline = _ref3.extendTimeline;
	    (plugins || "").split(",").forEach(function (pluginName) {
	      return pluginName && !_plugins[pluginName] && !_globals[pluginName] && _warn(name + " effect requires " + pluginName + " plugin.");
	    });
	    _effects[name] = function (targets, vars, tl) {
	      return effect(toArray(targets), _setDefaults$1(vars || {}, defaults), tl);
	    };
	    if (extendTimeline) {
	      Timeline.prototype[name] = function (targets, vars, position) {
	        return this.add(_effects[name](targets, _isObject$1(vars) ? vars : (position = vars) && {}, this), position);
	      };
	    }
	  },
	  registerEase: function registerEase(name, ease) {
	    _easeMap[name] = _parseEase(ease);
	  },
	  parseEase: function parseEase(ease, defaultEase) {
	    return arguments.length ? _parseEase(ease, defaultEase) : _easeMap;
	  },
	  getById: function getById(id) {
	    return _globalTimeline.getById(id);
	  },
	  exportRoot: function exportRoot(vars, includeDelayedCalls) {
	    if (vars === void 0) {
	      vars = {};
	    }
	    var tl = new Timeline(vars),
	      child,
	      next;
	    tl.smoothChildTiming = _isNotFalse(vars.smoothChildTiming);
	    _globalTimeline.remove(tl);
	    tl._dp = 0; //otherwise it'll get re-activated when adding children and be re-introduced into _globalTimeline's linked list (then added to itself).

	    tl._time = tl._tTime = _globalTimeline._time;
	    child = _globalTimeline._first;
	    while (child) {
	      next = child._next;
	      if (includeDelayedCalls || !(!child._dur && child instanceof Tween && child.vars.onComplete === child._targets[0])) {
	        _addToTimeline(tl, child, child._start - child._delay);
	      }
	      child = next;
	    }
	    _addToTimeline(_globalTimeline, tl, 0);
	    return tl;
	  },
	  context: function context(func, scope) {
	    return func ? new Context(func, scope) : _context$2;
	  },
	  matchMedia: function matchMedia(scope) {
	    return new MatchMedia(scope);
	  },
	  matchMediaRefresh: function matchMediaRefresh() {
	    return _media.forEach(function (c) {
	      var cond = c.conditions,
	        found,
	        p;
	      for (p in cond) {
	        if (cond[p]) {
	          cond[p] = false;
	          found = 1;
	        }
	      }
	      found && c.revert();
	    }) || _onMediaChange();
	  },
	  addEventListener: function addEventListener(type, callback) {
	    var a = _listeners$1[type] || (_listeners$1[type] = []);
	    ~a.indexOf(callback) || a.push(callback);
	  },
	  removeEventListener: function removeEventListener(type, callback) {
	    var a = _listeners$1[type],
	      i = a && a.indexOf(callback);
	    i >= 0 && a.splice(i, 1);
	  },
	  utils: {
	    wrap: wrap,
	    wrapYoyo: wrapYoyo,
	    distribute: distribute,
	    random: random,
	    snap: snap,
	    normalize: normalize,
	    getUnit: getUnit,
	    clamp: clamp,
	    splitColor: splitColor,
	    toArray: toArray,
	    selector: selector,
	    mapRange: mapRange,
	    pipe: pipe$1,
	    unitize: unitize,
	    interpolate: interpolate,
	    shuffle: shuffle
	  },
	  install: _install,
	  effects: _effects,
	  ticker: _ticker,
	  updateRoot: Timeline.updateRoot,
	  plugins: _plugins,
	  globalTimeline: _globalTimeline,
	  core: {
	    PropTween: PropTween,
	    globals: _addGlobal,
	    Tween: Tween,
	    Timeline: Timeline,
	    Animation: Animation,
	    getCache: _getCache,
	    _removeLinkedListItem: _removeLinkedListItem,
	    reverting: function reverting() {
	      return _reverting$1;
	    },
	    context: function context(toAdd) {
	      if (toAdd && _context$2) {
	        _context$2.data.push(toAdd);
	        toAdd._ctx = _context$2;
	      }
	      return _context$2;
	    },
	    suppressOverwrites: function suppressOverwrites(value) {
	      return _suppressOverwrites$1 = value;
	    }
	  }
	};
	_forEachName("to,from,fromTo,delayedCall,set,killTweensOf", function (name) {
	  return _gsap[name] = Tween[name];
	});
	_ticker.add(Timeline.updateRoot);
	_quickTween = _gsap.to({}, {
	  duration: 0
	}); // ---- EXTRA PLUGINS --------------------------------------------------------

	var _getPluginPropTween = function _getPluginPropTween(plugin, prop) {
	    var pt = plugin._pt;
	    while (pt && pt.p !== prop && pt.op !== prop && pt.fp !== prop) {
	      pt = pt._next;
	    }
	    return pt;
	  },
	  _addModifiers = function _addModifiers(tween, modifiers) {
	    var targets = tween._targets,
	      p,
	      i,
	      pt;
	    for (p in modifiers) {
	      i = targets.length;
	      while (i--) {
	        pt = tween._ptLookup[i][p];
	        if (pt && (pt = pt.d)) {
	          if (pt._pt) {
	            // is a plugin
	            pt = _getPluginPropTween(pt, p);
	          }
	          pt && pt.modifier && pt.modifier(modifiers[p], tween, targets[i], p);
	        }
	      }
	    }
	  },
	  _buildModifierPlugin = function _buildModifierPlugin(name, modifier) {
	    return {
	      name: name,
	      rawVars: 1,
	      //don't pre-process function-based values or "random()" strings.
	      init: function init(target, vars, tween) {
	        tween._onInit = function (tween) {
	          var temp, p;
	          if (_isString$1(vars)) {
	            temp = {};
	            _forEachName(vars, function (name) {
	              return temp[name] = 1;
	            }); //if the user passes in a comma-delimited list of property names to roundProps, like "x,y", we round to whole numbers.

	            vars = temp;
	          }
	          if (modifier) {
	            temp = {};
	            for (p in vars) {
	              temp[p] = modifier(vars[p]);
	            }
	            vars = temp;
	          }
	          _addModifiers(tween, vars);
	        };
	      }
	    };
	  }; //register core plugins

	var gsap$2 = _gsap.registerPlugin({
	  name: "attr",
	  init: function init(target, vars, tween, index, targets) {
	    var p, pt, v;
	    this.tween = tween;
	    for (p in vars) {
	      v = target.getAttribute(p) || "";
	      pt = this.add(target, "setAttribute", (v || 0) + "", vars[p], index, targets, 0, 0, p);
	      pt.op = p;
	      pt.b = v; // record the beginning value so we can revert()

	      this._props.push(p);
	    }
	  },
	  render: function render(ratio, data) {
	    var pt = data._pt;
	    while (pt) {
	      _reverting$1 ? pt.set(pt.t, pt.p, pt.b, pt) : pt.r(ratio, pt.d); // if reverting, go back to the original (pt.b)

	      pt = pt._next;
	    }
	  }
	}, {
	  name: "endArray",
	  init: function init(target, value) {
	    var i = value.length;
	    while (i--) {
	      this.add(target, i, target[i] || 0, value[i], 0, 0, 0, 0, 0, 1);
	    }
	  }
	}, _buildModifierPlugin("roundProps", _roundModifier), _buildModifierPlugin("modifiers"), _buildModifierPlugin("snap", snap)) || _gsap; //to prevent the core plugins from being dropped via aggressive tree shaking, we must include them in the variable declaration in this way.

	Tween.version = Timeline.version = gsap$2.version = "3.11.4";
	_coreReady = 1;
	_windowExists$2() && _wake();
	_easeMap.Power0;
	  _easeMap.Power1;
	  _easeMap.Power2;
	  _easeMap.Power3;
	  _easeMap.Power4;
	  _easeMap.Linear;
	  _easeMap.Quad;
	  _easeMap.Cubic;
	  _easeMap.Quart;
	  _easeMap.Quint;
	  _easeMap.Strong;
	  _easeMap.Elastic;
	  _easeMap.Back;
	  _easeMap.SteppedEase;
	  _easeMap.Bounce;
	  _easeMap.Sine;
	  _easeMap.Expo;
	  _easeMap.Circ;

	/*!
	 * CSSPlugin 3.11.4
	 * https://greensock.com
	 *
	 * Copyright 2008-2022, GreenSock. All rights reserved.
	 * Subject to the terms at https://greensock.com/standard-license or for
	 * Club GreenSock members, the agreement issued with that membership.
	 * @author: Jack Doyle, jack@greensock.com
	*/

	var _win$2,
	  _doc$2,
	  _docElement,
	  _pluginInitted,
	  _tempDiv,
	  _recentSetterPlugin,
	  _reverting,
	  _windowExists$1 = function _windowExists() {
	    return typeof window !== "undefined";
	  },
	  _transformProps = {},
	  _RAD2DEG = 180 / Math.PI,
	  _DEG2RAD = Math.PI / 180,
	  _atan2 = Math.atan2,
	  _bigNum = 1e8,
	  _capsExp$1 = /([A-Z])/g,
	  _horizontalExp = /(left|right|width|margin|padding|x)/i,
	  _complexExp = /[\s,\(]\S/,
	  _propertyAliases = {
	    autoAlpha: "opacity,visibility",
	    scale: "scaleX,scaleY",
	    alpha: "opacity"
	  },
	  _renderCSSProp = function _renderCSSProp(ratio, data) {
	    return data.set(data.t, data.p, Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u, data);
	  },
	  _renderPropWithEnd = function _renderPropWithEnd(ratio, data) {
	    return data.set(data.t, data.p, ratio === 1 ? data.e : Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u, data);
	  },
	  _renderCSSPropWithBeginning = function _renderCSSPropWithBeginning(ratio, data) {
	    return data.set(data.t, data.p, ratio ? Math.round((data.s + data.c * ratio) * 10000) / 10000 + data.u : data.b, data);
	  },
	  //if units change, we need a way to render the original unit/value when the tween goes all the way back to the beginning (ratio:0)
	  _renderRoundedCSSProp = function _renderRoundedCSSProp(ratio, data) {
	    var value = data.s + data.c * ratio;
	    data.set(data.t, data.p, ~~(value + (value < 0 ? -.5 : .5)) + data.u, data);
	  },
	  _renderNonTweeningValue = function _renderNonTweeningValue(ratio, data) {
	    return data.set(data.t, data.p, ratio ? data.e : data.b, data);
	  },
	  _renderNonTweeningValueOnlyAtEnd = function _renderNonTweeningValueOnlyAtEnd(ratio, data) {
	    return data.set(data.t, data.p, ratio !== 1 ? data.b : data.e, data);
	  },
	  _setterCSSStyle = function _setterCSSStyle(target, property, value) {
	    return target.style[property] = value;
	  },
	  _setterCSSProp = function _setterCSSProp(target, property, value) {
	    return target.style.setProperty(property, value);
	  },
	  _setterTransform = function _setterTransform(target, property, value) {
	    return target._gsap[property] = value;
	  },
	  _setterScale = function _setterScale(target, property, value) {
	    return target._gsap.scaleX = target._gsap.scaleY = value;
	  },
	  _setterScaleWithRender = function _setterScaleWithRender(target, property, value, data, ratio) {
	    var cache = target._gsap;
	    cache.scaleX = cache.scaleY = value;
	    cache.renderTransform(ratio, cache);
	  },
	  _setterTransformWithRender = function _setterTransformWithRender(target, property, value, data, ratio) {
	    var cache = target._gsap;
	    cache[property] = value;
	    cache.renderTransform(ratio, cache);
	  },
	  _transformProp$1 = "transform",
	  _transformOriginProp = _transformProp$1 + "Origin",
	  _saveStyle = function _saveStyle(property, isNotCSS) {
	    var _this = this;
	    var target = this.target,
	      style = target.style;
	    if (property in _transformProps) {
	      this.tfm = this.tfm || {};
	      if (property !== "transform") {
	        property = _propertyAliases[property] || property;
	        ~property.indexOf(",") ? property.split(",").forEach(function (a) {
	          return _this.tfm[a] = _get(target, a);
	        }) : this.tfm[property] = target._gsap.x ? target._gsap[property] : _get(target, property); // note: scale would map to "scaleX,scaleY", thus we loop and apply them both.
	      }
	      if (this.props.indexOf(_transformProp$1) >= 0) {
	        return;
	      }
	      if (target._gsap.svg) {
	        this.svgo = target.getAttribute("data-svg-origin");
	        this.props.push(_transformOriginProp, isNotCSS, "");
	      }
	      property = _transformProp$1;
	    }
	    (style || isNotCSS) && this.props.push(property, isNotCSS, style[property]);
	  },
	  _removeIndependentTransforms = function _removeIndependentTransforms(style) {
	    if (style.translate) {
	      style.removeProperty("translate");
	      style.removeProperty("scale");
	      style.removeProperty("rotate");
	    }
	  },
	  _revertStyle = function _revertStyle() {
	    var props = this.props,
	      target = this.target,
	      style = target.style,
	      cache = target._gsap,
	      i,
	      p;
	    for (i = 0; i < props.length; i += 3) {
	      // stored like this: property, isNotCSS, value
	      props[i + 1] ? target[props[i]] = props[i + 2] : props[i + 2] ? style[props[i]] = props[i + 2] : style.removeProperty(props[i].replace(_capsExp$1, "-$1").toLowerCase());
	    }
	    if (this.tfm) {
	      for (p in this.tfm) {
	        cache[p] = this.tfm[p];
	      }
	      if (cache.svg) {
	        cache.renderTransform();
	        target.setAttribute("data-svg-origin", this.svgo || "");
	      }
	      i = _reverting();
	      if (i && !i.isStart && !style[_transformProp$1]) {
	        _removeIndependentTransforms(style);
	        cache.uncache = 1; // if it's a startAt that's being reverted in the _initTween() of the core, we don't need to uncache transforms. This is purely a performance optimization.
	      }
	    }
	  },
	  _getStyleSaver = function _getStyleSaver(target, properties) {
	    var saver = {
	      target: target,
	      props: [],
	      revert: _revertStyle,
	      save: _saveStyle
	    };
	    properties && properties.split(",").forEach(function (p) {
	      return saver.save(p);
	    });
	    return saver;
	  },
	  _supports3D,
	  _createElement = function _createElement(type, ns) {
	    var e = _doc$2.createElementNS ? _doc$2.createElementNS((ns || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), type) : _doc$2.createElement(type); //some servers swap in https for http in the namespace which can break things, making "style" inaccessible.

	    return e.style ? e : _doc$2.createElement(type); //some environments won't allow access to the element's style when created with a namespace in which case we default to the standard createElement() to work around the issue. Also note that when GSAP is embedded directly inside an SVG file, createElement() won't allow access to the style object in Firefox (see https://greensock.com/forums/topic/20215-problem-using-tweenmax-in-standalone-self-containing-svg-file-err-cannot-set-property-csstext-of-undefined/).
	  },
	  _getComputedProperty = function _getComputedProperty(target, property, skipPrefixFallback) {
	    var cs = getComputedStyle(target);
	    return cs[property] || cs.getPropertyValue(property.replace(_capsExp$1, "-$1").toLowerCase()) || cs.getPropertyValue(property) || !skipPrefixFallback && _getComputedProperty(target, _checkPropPrefix(property) || property, 1) || ""; //css variables may not need caps swapped out for dashes and lowercase.
	  },
	  _prefixes = "O,Moz,ms,Ms,Webkit".split(","),
	  _checkPropPrefix = function _checkPropPrefix(property, element, preferPrefix) {
	    var e = element || _tempDiv,
	      s = e.style,
	      i = 5;
	    if (property in s && !preferPrefix) {
	      return property;
	    }
	    property = property.charAt(0).toUpperCase() + property.substr(1);
	    while (i-- && !(_prefixes[i] + property in s)) {}
	    return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? _prefixes[i] : "") + property;
	  },
	  _initCore$1 = function _initCore() {
	    if (_windowExists$1() && window.document) {
	      _win$2 = window;
	      _doc$2 = _win$2.document;
	      _docElement = _doc$2.documentElement;
	      _tempDiv = _createElement("div") || {
	        style: {}
	      };
	      _createElement("div");
	      _transformProp$1 = _checkPropPrefix(_transformProp$1);
	      _transformOriginProp = _transformProp$1 + "Origin";
	      _tempDiv.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0"; //make sure to override certain properties that may contaminate measurements, in case the user has overreaching style sheets.

	      _supports3D = !!_checkPropPrefix("perspective");
	      _reverting = gsap$2.core.reverting;
	      _pluginInitted = 1;
	    }
	  },
	  _getBBoxHack = function _getBBoxHack(swapIfPossible) {
	    //works around issues in some browsers (like Firefox) that don't correctly report getBBox() on SVG elements inside a <defs> element and/or <mask>. We try creating an SVG, adding it to the documentElement and toss the element in there so that it's definitely part of the rendering tree, then grab the bbox and if it works, we actually swap out the original getBBox() method for our own that does these extra steps whenever getBBox is needed. This helps ensure that performance is optimal (only do all these extra steps when absolutely necessary...most elements don't need it).
	    var svg = _createElement("svg", this.ownerSVGElement && this.ownerSVGElement.getAttribute("xmlns") || "http://www.w3.org/2000/svg"),
	      oldParent = this.parentNode,
	      oldSibling = this.nextSibling,
	      oldCSS = this.style.cssText,
	      bbox;
	    _docElement.appendChild(svg);
	    svg.appendChild(this);
	    this.style.display = "block";
	    if (swapIfPossible) {
	      try {
	        bbox = this.getBBox();
	        this._gsapBBox = this.getBBox; //store the original

	        this.getBBox = _getBBoxHack;
	      } catch (e) {}
	    } else if (this._gsapBBox) {
	      bbox = this._gsapBBox();
	    }
	    if (oldParent) {
	      if (oldSibling) {
	        oldParent.insertBefore(this, oldSibling);
	      } else {
	        oldParent.appendChild(this);
	      }
	    }
	    _docElement.removeChild(svg);
	    this.style.cssText = oldCSS;
	    return bbox;
	  },
	  _getAttributeFallbacks = function _getAttributeFallbacks(target, attributesArray) {
	    var i = attributesArray.length;
	    while (i--) {
	      if (target.hasAttribute(attributesArray[i])) {
	        return target.getAttribute(attributesArray[i]);
	      }
	    }
	  },
	  _getBBox = function _getBBox(target) {
	    var bounds;
	    try {
	      bounds = target.getBBox(); //Firefox throws errors if you try calling getBBox() on an SVG element that's not rendered (like in a <symbol> or <defs>). https://bugzilla.mozilla.org/show_bug.cgi?id=612118
	    } catch (error) {
	      bounds = _getBBoxHack.call(target, true);
	    }
	    bounds && (bounds.width || bounds.height) || target.getBBox === _getBBoxHack || (bounds = _getBBoxHack.call(target, true)); //some browsers (like Firefox) misreport the bounds if the element has zero width and height (it just assumes it's at x:0, y:0), thus we need to manually grab the position in that case.

	    return bounds && !bounds.width && !bounds.x && !bounds.y ? {
	      x: +_getAttributeFallbacks(target, ["x", "cx", "x1"]) || 0,
	      y: +_getAttributeFallbacks(target, ["y", "cy", "y1"]) || 0,
	      width: 0,
	      height: 0
	    } : bounds;
	  },
	  _isSVG = function _isSVG(e) {
	    return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && _getBBox(e));
	  },
	  //reports if the element is an SVG on which getBBox() actually works
	  _removeProperty = function _removeProperty(target, property) {
	    if (property) {
	      var style = target.style;
	      if (property in _transformProps && property !== _transformOriginProp) {
	        property = _transformProp$1;
	      }
	      if (style.removeProperty) {
	        if (property.substr(0, 2) === "ms" || property.substr(0, 6) === "webkit") {
	          //Microsoft and some Webkit browsers don't conform to the standard of capitalizing the first prefix character, so we adjust so that when we prefix the caps with a dash, it's correct (otherwise it'd be "ms-transform" instead of "-ms-transform" for IE9, for example)
	          property = "-" + property;
	        }
	        style.removeProperty(property.replace(_capsExp$1, "-$1").toLowerCase());
	      } else {
	        //note: old versions of IE use "removeAttribute()" instead of "removeProperty()"
	        style.removeAttribute(property);
	      }
	    }
	  },
	  _addNonTweeningPT = function _addNonTweeningPT(plugin, target, property, beginning, end, onlySetAtEnd) {
	    var pt = new PropTween(plugin._pt, target, property, 0, 1, onlySetAtEnd ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue);
	    plugin._pt = pt;
	    pt.b = beginning;
	    pt.e = end;
	    plugin._props.push(property);
	    return pt;
	  },
	  _nonConvertibleUnits = {
	    deg: 1,
	    rad: 1,
	    turn: 1
	  },
	  _nonStandardLayouts = {
	    grid: 1,
	    flex: 1
	  },
	  //takes a single value like 20px and converts it to the unit specified, like "%", returning only the numeric amount.
	  _convertToUnit = function _convertToUnit(target, property, value, unit) {
	    var curValue = parseFloat(value) || 0,
	      curUnit = (value + "").trim().substr((curValue + "").length) || "px",
	      // some browsers leave extra whitespace at the beginning of CSS variables, hence the need to trim()
	      style = _tempDiv.style,
	      horizontal = _horizontalExp.test(property),
	      isRootSVG = target.tagName.toLowerCase() === "svg",
	      measureProperty = (isRootSVG ? "client" : "offset") + (horizontal ? "Width" : "Height"),
	      amount = 100,
	      toPixels = unit === "px",
	      toPercent = unit === "%",
	      px,
	      parent,
	      cache,
	      isSVG;
	    if (unit === curUnit || !curValue || _nonConvertibleUnits[unit] || _nonConvertibleUnits[curUnit]) {
	      return curValue;
	    }
	    curUnit !== "px" && !toPixels && (curValue = _convertToUnit(target, property, value, "px"));
	    isSVG = target.getCTM && _isSVG(target);
	    if ((toPercent || curUnit === "%") && (_transformProps[property] || ~property.indexOf("adius"))) {
	      px = isSVG ? target.getBBox()[horizontal ? "width" : "height"] : target[measureProperty];
	      return _round$1(toPercent ? curValue / px * amount : curValue / 100 * px);
	    }
	    style[horizontal ? "width" : "height"] = amount + (toPixels ? curUnit : unit);
	    parent = ~property.indexOf("adius") || unit === "em" && target.appendChild && !isRootSVG ? target : target.parentNode;
	    if (isSVG) {
	      parent = (target.ownerSVGElement || {}).parentNode;
	    }
	    if (!parent || parent === _doc$2 || !parent.appendChild) {
	      parent = _doc$2.body;
	    }
	    cache = parent._gsap;
	    if (cache && toPercent && cache.width && horizontal && cache.time === _ticker.time && !cache.uncache) {
	      return _round$1(curValue / cache.width * amount);
	    } else {
	      (toPercent || curUnit === "%") && !_nonStandardLayouts[_getComputedProperty(parent, "display")] && (style.position = _getComputedProperty(target, "position"));
	      parent === target && (style.position = "static"); // like for borderRadius, if it's a % we must have it relative to the target itself but that may not have position: relative or position: absolute in which case it'd go up the chain until it finds its offsetParent (bad). position: static protects against that.

	      parent.appendChild(_tempDiv);
	      px = _tempDiv[measureProperty];
	      parent.removeChild(_tempDiv);
	      style.position = "absolute";
	      if (horizontal && toPercent) {
	        cache = _getCache(parent);
	        cache.time = _ticker.time;
	        cache.width = parent[measureProperty];
	      }
	    }
	    return _round$1(toPixels ? px * curValue / amount : px && curValue ? amount / px * curValue : 0);
	  },
	  _get = function _get(target, property, unit, uncache) {
	    var value;
	    _pluginInitted || _initCore$1();
	    if (property in _propertyAliases && property !== "transform") {
	      property = _propertyAliases[property];
	      if (~property.indexOf(",")) {
	        property = property.split(",")[0];
	      }
	    }
	    if (_transformProps[property] && property !== "transform") {
	      value = _parseTransform(target, uncache);
	      value = property !== "transformOrigin" ? value[property] : value.svg ? value.origin : _firstTwoOnly(_getComputedProperty(target, _transformOriginProp)) + " " + value.zOrigin + "px";
	    } else {
	      value = target.style[property];
	      if (!value || value === "auto" || uncache || ~(value + "").indexOf("calc(")) {
	        value = _specialProps[property] && _specialProps[property](target, property, unit) || _getComputedProperty(target, property) || _getProperty(target, property) || (property === "opacity" ? 1 : 0); // note: some browsers, like Firefox, don't report borderRadius correctly! Instead, it only reports every corner like  borderTopLeftRadius
	      }
	    }
	    return unit && !~(value + "").trim().indexOf(" ") ? _convertToUnit(target, property, value, unit) + unit : value;
	  },
	  _tweenComplexCSSString = function _tweenComplexCSSString(target, prop, start, end) {
	    // note: we call _tweenComplexCSSString.call(pluginInstance...) to ensure that it's scoped properly. We may call it from within a plugin too, thus "this" would refer to the plugin.
	    if (!start || start === "none") {
	      // some browsers like Safari actually PREFER the prefixed property and mis-report the unprefixed value like clipPath (BUG). In other words, even though clipPath exists in the style ("clipPath" in target.style) and it's set in the CSS properly (along with -webkit-clip-path), Safari reports clipPath as "none" whereas WebkitClipPath reports accurately like "ellipse(100% 0% at 50% 0%)", so in this case we must SWITCH to using the prefixed property instead. See https://greensock.com/forums/topic/18310-clippath-doesnt-work-on-ios/
	      var p = _checkPropPrefix(prop, target, 1),
	        s = p && _getComputedProperty(target, p, 1);
	      if (s && s !== start) {
	        prop = p;
	        start = s;
	      } else if (prop === "borderColor") {
	        start = _getComputedProperty(target, "borderTopColor"); // Firefox bug: always reports "borderColor" as "", so we must fall back to borderTopColor. See https://greensock.com/forums/topic/24583-how-to-return-colors-that-i-had-after-reverse/
	      }
	    }
	    var pt = new PropTween(this._pt, target.style, prop, 0, 1, _renderComplexString),
	      index = 0,
	      matchIndex = 0,
	      a,
	      result,
	      startValues,
	      startNum,
	      color,
	      startValue,
	      endValue,
	      endNum,
	      chunk,
	      endUnit,
	      startUnit,
	      endValues;
	    pt.b = start;
	    pt.e = end;
	    start += ""; // ensure values are strings

	    end += "";
	    if (end === "auto") {
	      target.style[prop] = end;
	      end = _getComputedProperty(target, prop) || end;
	      target.style[prop] = start;
	    }
	    a = [start, end];
	    _colorStringFilter(a); // pass an array with the starting and ending values and let the filter do whatever it needs to the values. If colors are found, it returns true and then we must match where the color shows up order-wise because for things like boxShadow, sometimes the browser provides the computed values with the color FIRST, but the user provides it with the color LAST, so flip them if necessary. Same for drop-shadow().

	    start = a[0];
	    end = a[1];
	    startValues = start.match(_numWithUnitExp) || [];
	    endValues = end.match(_numWithUnitExp) || [];
	    if (endValues.length) {
	      while (result = _numWithUnitExp.exec(end)) {
	        endValue = result[0];
	        chunk = end.substring(index, result.index);
	        if (color) {
	          color = (color + 1) % 5;
	        } else if (chunk.substr(-5) === "rgba(" || chunk.substr(-5) === "hsla(") {
	          color = 1;
	        }
	        if (endValue !== (startValue = startValues[matchIndex++] || "")) {
	          startNum = parseFloat(startValue) || 0;
	          startUnit = startValue.substr((startNum + "").length);
	          endValue.charAt(1) === "=" && (endValue = _parseRelative(startNum, endValue) + startUnit);
	          endNum = parseFloat(endValue);
	          endUnit = endValue.substr((endNum + "").length);
	          index = _numWithUnitExp.lastIndex - endUnit.length;
	          if (!endUnit) {
	            //if something like "perspective:300" is passed in and we must add a unit to the end
	            endUnit = endUnit || _config.units[prop] || startUnit;
	            if (index === end.length) {
	              end += endUnit;
	              pt.e += endUnit;
	            }
	          }
	          if (startUnit !== endUnit) {
	            startNum = _convertToUnit(target, prop, startValue, endUnit) || 0;
	          } // these nested PropTweens are handled in a special way - we'll never actually call a render or setter method on them. We'll just loop through them in the parent complex string PropTween's render method.

	          pt._pt = {
	            _next: pt._pt,
	            p: chunk || matchIndex === 1 ? chunk : ",",
	            //note: SVG spec allows omission of comma/space when a negative sign is wedged between two numbers, like 2.5-5.3 instead of 2.5,-5.3 but when tweening, the negative value may switch to positive, so we insert the comma just in case.
	            s: startNum,
	            c: endNum - startNum,
	            m: color && color < 4 || prop === "zIndex" ? Math.round : 0
	          };
	        }
	      }
	      pt.c = index < end.length ? end.substring(index, end.length) : ""; //we use the "c" of the PropTween to store the final part of the string (after the last number)
	    } else {
	      pt.r = prop === "display" && end === "none" ? _renderNonTweeningValueOnlyAtEnd : _renderNonTweeningValue;
	    }
	    _relExp.test(end) && (pt.e = 0); //if the end string contains relative values or dynamic random(...) values, delete the end it so that on the final render we don't actually set it to the string with += or -= characters (forces it to use the calculated value).

	    this._pt = pt; //start the linked list with this new PropTween. Remember, we call _tweenComplexCSSString.call(pluginInstance...) to ensure that it's scoped properly. We may call it from within another plugin too, thus "this" would refer to the plugin.

	    return pt;
	  },
	  _keywordToPercent = {
	    top: "0%",
	    bottom: "100%",
	    left: "0%",
	    right: "100%",
	    center: "50%"
	  },
	  _convertKeywordsToPercentages = function _convertKeywordsToPercentages(value) {
	    var split = value.split(" "),
	      x = split[0],
	      y = split[1] || "50%";
	    if (x === "top" || x === "bottom" || y === "left" || y === "right") {
	      //the user provided them in the wrong order, so flip them
	      value = x;
	      x = y;
	      y = value;
	    }
	    split[0] = _keywordToPercent[x] || x;
	    split[1] = _keywordToPercent[y] || y;
	    return split.join(" ");
	  },
	  _renderClearProps = function _renderClearProps(ratio, data) {
	    if (data.tween && data.tween._time === data.tween._dur) {
	      var target = data.t,
	        style = target.style,
	        props = data.u,
	        cache = target._gsap,
	        prop,
	        clearTransforms,
	        i;
	      if (props === "all" || props === true) {
	        style.cssText = "";
	        clearTransforms = 1;
	      } else {
	        props = props.split(",");
	        i = props.length;
	        while (--i > -1) {
	          prop = props[i];
	          if (_transformProps[prop]) {
	            clearTransforms = 1;
	            prop = prop === "transformOrigin" ? _transformOriginProp : _transformProp$1;
	          }
	          _removeProperty(target, prop);
	        }
	      }
	      if (clearTransforms) {
	        _removeProperty(target, _transformProp$1);
	        if (cache) {
	          cache.svg && target.removeAttribute("transform");
	          _parseTransform(target, 1); // force all the cached values back to "normal"/identity, otherwise if there's another tween that's already set to render transforms on this element, it could display the wrong values.

	          cache.uncache = 1;
	          _removeIndependentTransforms(style);
	        }
	      }
	    }
	  },
	  // note: specialProps should return 1 if (and only if) they have a non-zero priority. It indicates we need to sort the linked list.
	  _specialProps = {
	    clearProps: function clearProps(plugin, target, property, endValue, tween) {
	      if (tween.data !== "isFromStart") {
	        var pt = plugin._pt = new PropTween(plugin._pt, target, property, 0, 0, _renderClearProps);
	        pt.u = endValue;
	        pt.pr = -10;
	        pt.tween = tween;
	        plugin._props.push(property);
	        return 1;
	      }
	    }
	    /* className feature (about 0.4kb gzipped).
	    , className(plugin, target, property, endValue, tween) {
	    	let _renderClassName = (ratio, data) => {
	    			data.css.render(ratio, data.css);
	    			if (!ratio || ratio === 1) {
	    				let inline = data.rmv,
	    					target = data.t,
	    					p;
	    				target.setAttribute("class", ratio ? data.e : data.b);
	    				for (p in inline) {
	    					_removeProperty(target, p);
	    				}
	    			}
	    		},
	    		_getAllStyles = (target) => {
	    			let styles = {},
	    				computed = getComputedStyle(target),
	    				p;
	    			for (p in computed) {
	    				if (isNaN(p) && p !== "cssText" && p !== "length") {
	    					styles[p] = computed[p];
	    				}
	    			}
	    			_setDefaults(styles, _parseTransform(target, 1));
	    			return styles;
	    		},
	    		startClassList = target.getAttribute("class"),
	    		style = target.style,
	    		cssText = style.cssText,
	    		cache = target._gsap,
	    		classPT = cache.classPT,
	    		inlineToRemoveAtEnd = {},
	    		data = {t:target, plugin:plugin, rmv:inlineToRemoveAtEnd, b:startClassList, e:(endValue.charAt(1) !== "=") ? endValue : startClassList.replace(new RegExp("(?:\\s|^)" + endValue.substr(2) + "(?![\\w-])"), "") + ((endValue.charAt(0) === "+") ? " " + endValue.substr(2) : "")},
	    		changingVars = {},
	    		startVars = _getAllStyles(target),
	    		transformRelated = /(transform|perspective)/i,
	    		endVars, p;
	    	if (classPT) {
	    		classPT.r(1, classPT.d);
	    		_removeLinkedListItem(classPT.d.plugin, classPT, "_pt");
	    	}
	    	target.setAttribute("class", data.e);
	    	endVars = _getAllStyles(target, true);
	    	target.setAttribute("class", startClassList);
	    	for (p in endVars) {
	    		if (endVars[p] !== startVars[p] && !transformRelated.test(p)) {
	    			changingVars[p] = endVars[p];
	    			if (!style[p] && style[p] !== "0") {
	    				inlineToRemoveAtEnd[p] = 1;
	    			}
	    		}
	    	}
	    	cache.classPT = plugin._pt = new PropTween(plugin._pt, target, "className", 0, 0, _renderClassName, data, 0, -11);
	    	if (style.cssText !== cssText) { //only apply if things change. Otherwise, in cases like a background-image that's pulled dynamically, it could cause a refresh. See https://greensock.com/forums/topic/20368-possible-gsap-bug-switching-classnames-in-chrome/.
	    		style.cssText = cssText; //we recorded cssText before we swapped classes and ran _getAllStyles() because in cases when a className tween is overwritten, we remove all the related tweening properties from that class change (otherwise class-specific stuff can't override properties we've directly set on the target's style object due to specificity).
	    	}
	    	_parseTransform(target, true); //to clear the caching of transforms
	    	data.css = new gsap.plugins.css();
	    	data.css.init(target, changingVars, tween);
	    	plugin._props.push(...data.css._props);
	    	return 1;
	    }
	    */
	  },
	  /*
	   * --------------------------------------------------------------------------------------
	   * TRANSFORMS
	   * --------------------------------------------------------------------------------------
	   */
	  _identity2DMatrix = [1, 0, 0, 1, 0, 0],
	  _rotationalProperties = {},
	  _isNullTransform = function _isNullTransform(value) {
	    return value === "matrix(1, 0, 0, 1, 0, 0)" || value === "none" || !value;
	  },
	  _getComputedTransformMatrixAsArray = function _getComputedTransformMatrixAsArray(target) {
	    var matrixString = _getComputedProperty(target, _transformProp$1);
	    return _isNullTransform(matrixString) ? _identity2DMatrix : matrixString.substr(7).match(_numExp).map(_round$1);
	  },
	  _getMatrix = function _getMatrix(target, force2D) {
	    var cache = target._gsap || _getCache(target),
	      style = target.style,
	      matrix = _getComputedTransformMatrixAsArray(target),
	      parent,
	      nextSibling,
	      temp,
	      addedToDOM;
	    if (cache.svg && target.getAttribute("transform")) {
	      temp = target.transform.baseVal.consolidate().matrix; //ensures that even complex values like "translate(50,60) rotate(135,0,0)" are parsed because it mashes it into a matrix.

	      matrix = [temp.a, temp.b, temp.c, temp.d, temp.e, temp.f];
	      return matrix.join(",") === "1,0,0,1,0,0" ? _identity2DMatrix : matrix;
	    } else if (matrix === _identity2DMatrix && !target.offsetParent && target !== _docElement && !cache.svg) {
	      //note: if offsetParent is null, that means the element isn't in the normal document flow, like if it has display:none or one of its ancestors has display:none). Firefox returns null for getComputedStyle() if the element is in an iframe that has display:none. https://bugzilla.mozilla.org/show_bug.cgi?id=548397
	      //browsers don't report transforms accurately unless the element is in the DOM and has a display value that's not "none". Firefox and Microsoft browsers have a partial bug where they'll report transforms even if display:none BUT not any percentage-based values like translate(-50%, 8px) will be reported as if it's translate(0, 8px).
	      temp = style.display;
	      style.display = "block";
	      parent = target.parentNode;
	      if (!parent || !target.offsetParent) {
	        // note: in 3.3.0 we switched target.offsetParent to _doc.body.contains(target) to avoid [sometimes unnecessary] MutationObserver calls but that wasn't adequate because there are edge cases where nested position: fixed elements need to get reparented to accurately sense transforms. See https://github.com/greensock/GSAP/issues/388 and https://github.com/greensock/GSAP/issues/375
	        addedToDOM = 1; //flag

	        nextSibling = target.nextElementSibling;
	        _docElement.appendChild(target); //we must add it to the DOM in order to get values properly
	      }
	      matrix = _getComputedTransformMatrixAsArray(target);
	      temp ? style.display = temp : _removeProperty(target, "display");
	      if (addedToDOM) {
	        nextSibling ? parent.insertBefore(target, nextSibling) : parent ? parent.appendChild(target) : _docElement.removeChild(target);
	      }
	    }
	    return force2D && matrix.length > 6 ? [matrix[0], matrix[1], matrix[4], matrix[5], matrix[12], matrix[13]] : matrix;
	  },
	  _applySVGOrigin = function _applySVGOrigin(target, origin, originIsAbsolute, smooth, matrixArray, pluginToAddPropTweensTo) {
	    var cache = target._gsap,
	      matrix = matrixArray || _getMatrix(target, true),
	      xOriginOld = cache.xOrigin || 0,
	      yOriginOld = cache.yOrigin || 0,
	      xOffsetOld = cache.xOffset || 0,
	      yOffsetOld = cache.yOffset || 0,
	      a = matrix[0],
	      b = matrix[1],
	      c = matrix[2],
	      d = matrix[3],
	      tx = matrix[4],
	      ty = matrix[5],
	      originSplit = origin.split(" "),
	      xOrigin = parseFloat(originSplit[0]) || 0,
	      yOrigin = parseFloat(originSplit[1]) || 0,
	      bounds,
	      determinant,
	      x,
	      y;
	    if (!originIsAbsolute) {
	      bounds = _getBBox(target);
	      xOrigin = bounds.x + (~originSplit[0].indexOf("%") ? xOrigin / 100 * bounds.width : xOrigin);
	      yOrigin = bounds.y + (~(originSplit[1] || originSplit[0]).indexOf("%") ? yOrigin / 100 * bounds.height : yOrigin);
	    } else if (matrix !== _identity2DMatrix && (determinant = a * d - b * c)) {
	      //if it's zero (like if scaleX and scaleY are zero), skip it to avoid errors with dividing by zero.
	      x = xOrigin * (d / determinant) + yOrigin * (-c / determinant) + (c * ty - d * tx) / determinant;
	      y = xOrigin * (-b / determinant) + yOrigin * (a / determinant) - (a * ty - b * tx) / determinant;
	      xOrigin = x;
	      yOrigin = y;
	    }
	    if (smooth || smooth !== false && cache.smooth) {
	      tx = xOrigin - xOriginOld;
	      ty = yOrigin - yOriginOld;
	      cache.xOffset = xOffsetOld + (tx * a + ty * c) - tx;
	      cache.yOffset = yOffsetOld + (tx * b + ty * d) - ty;
	    } else {
	      cache.xOffset = cache.yOffset = 0;
	    }
	    cache.xOrigin = xOrigin;
	    cache.yOrigin = yOrigin;
	    cache.smooth = !!smooth;
	    cache.origin = origin;
	    cache.originIsAbsolute = !!originIsAbsolute;
	    target.style[_transformOriginProp] = "0px 0px"; //otherwise, if someone sets  an origin via CSS, it will likely interfere with the SVG transform attribute ones (because remember, we're baking the origin into the matrix() value).

	    if (pluginToAddPropTweensTo) {
	      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOrigin", xOriginOld, xOrigin);
	      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOrigin", yOriginOld, yOrigin);
	      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "xOffset", xOffsetOld, cache.xOffset);
	      _addNonTweeningPT(pluginToAddPropTweensTo, cache, "yOffset", yOffsetOld, cache.yOffset);
	    }
	    target.setAttribute("data-svg-origin", xOrigin + " " + yOrigin);
	  },
	  _parseTransform = function _parseTransform(target, uncache) {
	    var cache = target._gsap || new GSCache(target);
	    if ("x" in cache && !uncache && !cache.uncache) {
	      return cache;
	    }
	    var style = target.style,
	      invertedScaleX = cache.scaleX < 0,
	      px = "px",
	      deg = "deg",
	      cs = getComputedStyle(target),
	      origin = _getComputedProperty(target, _transformOriginProp) || "0",
	      x,
	      y,
	      z,
	      scaleX,
	      scaleY,
	      rotation,
	      rotationX,
	      rotationY,
	      skewX,
	      skewY,
	      perspective,
	      xOrigin,
	      yOrigin,
	      matrix,
	      angle,
	      cos,
	      sin,
	      a,
	      b,
	      c,
	      d,
	      a12,
	      a22,
	      t1,
	      t2,
	      t3,
	      a13,
	      a23,
	      a33,
	      a42,
	      a43,
	      a32;
	    x = y = z = rotation = rotationX = rotationY = skewX = skewY = perspective = 0;
	    scaleX = scaleY = 1;
	    cache.svg = !!(target.getCTM && _isSVG(target));
	    if (cs.translate) {
	      // accommodate independent transforms by combining them into normal ones.
	      if (cs.translate !== "none" || cs.scale !== "none" || cs.rotate !== "none") {
	        style[_transformProp$1] = (cs.translate !== "none" ? "translate3d(" + (cs.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") " : "") + (cs.rotate !== "none" ? "rotate(" + cs.rotate + ") " : "") + (cs.scale !== "none" ? "scale(" + cs.scale.split(" ").join(",") + ") " : "") + (cs[_transformProp$1] !== "none" ? cs[_transformProp$1] : "");
	      }
	      style.scale = style.rotate = style.translate = "none";
	    }
	    matrix = _getMatrix(target, cache.svg);
	    if (cache.svg) {
	      if (cache.uncache) {
	        // if cache.uncache is true (and maybe if origin is 0,0), we need to set element.style.transformOrigin = (cache.xOrigin - bbox.x) + "px " + (cache.yOrigin - bbox.y) + "px". Previously we let the data-svg-origin stay instead, but when introducing revert(), it complicated things.
	        t2 = target.getBBox();
	        origin = cache.xOrigin - t2.x + "px " + (cache.yOrigin - t2.y) + "px";
	        t1 = "";
	      } else {
	        t1 = !uncache && target.getAttribute("data-svg-origin"); //  Remember, to work around browser inconsistencies we always force SVG elements' transformOrigin to 0,0 and offset the translation accordingly.
	      }
	      _applySVGOrigin(target, t1 || origin, !!t1 || cache.originIsAbsolute, cache.smooth !== false, matrix);
	    }
	    xOrigin = cache.xOrigin || 0;
	    yOrigin = cache.yOrigin || 0;
	    if (matrix !== _identity2DMatrix) {
	      a = matrix[0]; //a11

	      b = matrix[1]; //a21

	      c = matrix[2]; //a31

	      d = matrix[3]; //a41

	      x = a12 = matrix[4];
	      y = a22 = matrix[5]; //2D matrix

	      if (matrix.length === 6) {
	        scaleX = Math.sqrt(a * a + b * b);
	        scaleY = Math.sqrt(d * d + c * c);
	        rotation = a || b ? _atan2(b, a) * _RAD2DEG : 0; //note: if scaleX is 0, we cannot accurately measure rotation. Same for skewX with a scaleY of 0. Therefore, we default to the previously recorded value (or zero if that doesn't exist).

	        skewX = c || d ? _atan2(c, d) * _RAD2DEG + rotation : 0;
	        skewX && (scaleY *= Math.abs(Math.cos(skewX * _DEG2RAD)));
	        if (cache.svg) {
	          x -= xOrigin - (xOrigin * a + yOrigin * c);
	          y -= yOrigin - (xOrigin * b + yOrigin * d);
	        } //3D matrix
	      } else {
	        a32 = matrix[6];
	        a42 = matrix[7];
	        a13 = matrix[8];
	        a23 = matrix[9];
	        a33 = matrix[10];
	        a43 = matrix[11];
	        x = matrix[12];
	        y = matrix[13];
	        z = matrix[14];
	        angle = _atan2(a32, a33);
	        rotationX = angle * _RAD2DEG; //rotationX

	        if (angle) {
	          cos = Math.cos(-angle);
	          sin = Math.sin(-angle);
	          t1 = a12 * cos + a13 * sin;
	          t2 = a22 * cos + a23 * sin;
	          t3 = a32 * cos + a33 * sin;
	          a13 = a12 * -sin + a13 * cos;
	          a23 = a22 * -sin + a23 * cos;
	          a33 = a32 * -sin + a33 * cos;
	          a43 = a42 * -sin + a43 * cos;
	          a12 = t1;
	          a22 = t2;
	          a32 = t3;
	        } //rotationY

	        angle = _atan2(-c, a33);
	        rotationY = angle * _RAD2DEG;
	        if (angle) {
	          cos = Math.cos(-angle);
	          sin = Math.sin(-angle);
	          t1 = a * cos - a13 * sin;
	          t2 = b * cos - a23 * sin;
	          t3 = c * cos - a33 * sin;
	          a43 = d * sin + a43 * cos;
	          a = t1;
	          b = t2;
	          c = t3;
	        } //rotationZ

	        angle = _atan2(b, a);
	        rotation = angle * _RAD2DEG;
	        if (angle) {
	          cos = Math.cos(angle);
	          sin = Math.sin(angle);
	          t1 = a * cos + b * sin;
	          t2 = a12 * cos + a22 * sin;
	          b = b * cos - a * sin;
	          a22 = a22 * cos - a12 * sin;
	          a = t1;
	          a12 = t2;
	        }
	        if (rotationX && Math.abs(rotationX) + Math.abs(rotation) > 359.9) {
	          //when rotationY is set, it will often be parsed as 180 degrees different than it should be, and rotationX and rotation both being 180 (it looks the same), so we adjust for that here.
	          rotationX = rotation = 0;
	          rotationY = 180 - rotationY;
	        }
	        scaleX = _round$1(Math.sqrt(a * a + b * b + c * c));
	        scaleY = _round$1(Math.sqrt(a22 * a22 + a32 * a32));
	        angle = _atan2(a12, a22);
	        skewX = Math.abs(angle) > 0.0002 ? angle * _RAD2DEG : 0;
	        perspective = a43 ? 1 / (a43 < 0 ? -a43 : a43) : 0;
	      }
	      if (cache.svg) {
	        //sense if there are CSS transforms applied on an SVG element in which case we must overwrite them when rendering. The transform attribute is more reliable cross-browser, but we can't just remove the CSS ones because they may be applied in a CSS rule somewhere (not just inline).
	        t1 = target.getAttribute("transform");
	        cache.forceCSS = target.setAttribute("transform", "") || !_isNullTransform(_getComputedProperty(target, _transformProp$1));
	        t1 && target.setAttribute("transform", t1);
	      }
	    }
	    if (Math.abs(skewX) > 90 && Math.abs(skewX) < 270) {
	      if (invertedScaleX) {
	        scaleX *= -1;
	        skewX += rotation <= 0 ? 180 : -180;
	        rotation += rotation <= 0 ? 180 : -180;
	      } else {
	        scaleY *= -1;
	        skewX += skewX <= 0 ? 180 : -180;
	      }
	    }
	    uncache = uncache || cache.uncache;
	    cache.x = x - ((cache.xPercent = x && (!uncache && cache.xPercent || (Math.round(target.offsetWidth / 2) === Math.round(-x) ? -50 : 0))) ? target.offsetWidth * cache.xPercent / 100 : 0) + px;
	    cache.y = y - ((cache.yPercent = y && (!uncache && cache.yPercent || (Math.round(target.offsetHeight / 2) === Math.round(-y) ? -50 : 0))) ? target.offsetHeight * cache.yPercent / 100 : 0) + px;
	    cache.z = z + px;
	    cache.scaleX = _round$1(scaleX);
	    cache.scaleY = _round$1(scaleY);
	    cache.rotation = _round$1(rotation) + deg;
	    cache.rotationX = _round$1(rotationX) + deg;
	    cache.rotationY = _round$1(rotationY) + deg;
	    cache.skewX = skewX + deg;
	    cache.skewY = skewY + deg;
	    cache.transformPerspective = perspective + px;
	    if (cache.zOrigin = parseFloat(origin.split(" ")[2]) || 0) {
	      style[_transformOriginProp] = _firstTwoOnly(origin);
	    }
	    cache.xOffset = cache.yOffset = 0;
	    cache.force3D = _config.force3D;
	    cache.renderTransform = cache.svg ? _renderSVGTransforms : _supports3D ? _renderCSSTransforms : _renderNon3DTransforms;
	    cache.uncache = 0;
	    return cache;
	  },
	  _firstTwoOnly = function _firstTwoOnly(value) {
	    return (value = value.split(" "))[0] + " " + value[1];
	  },
	  //for handling transformOrigin values, stripping out the 3rd dimension
	  _addPxTranslate = function _addPxTranslate(target, start, value) {
	    var unit = getUnit(start);
	    return _round$1(parseFloat(start) + parseFloat(_convertToUnit(target, "x", value + "px", unit))) + unit;
	  },
	  _renderNon3DTransforms = function _renderNon3DTransforms(ratio, cache) {
	    cache.z = "0px";
	    cache.rotationY = cache.rotationX = "0deg";
	    cache.force3D = 0;
	    _renderCSSTransforms(ratio, cache);
	  },
	  _zeroDeg = "0deg",
	  _zeroPx = "0px",
	  _endParenthesis = ") ",
	  _renderCSSTransforms = function _renderCSSTransforms(ratio, cache) {
	    var _ref = cache || this,
	      xPercent = _ref.xPercent,
	      yPercent = _ref.yPercent,
	      x = _ref.x,
	      y = _ref.y,
	      z = _ref.z,
	      rotation = _ref.rotation,
	      rotationY = _ref.rotationY,
	      rotationX = _ref.rotationX,
	      skewX = _ref.skewX,
	      skewY = _ref.skewY,
	      scaleX = _ref.scaleX,
	      scaleY = _ref.scaleY,
	      transformPerspective = _ref.transformPerspective,
	      force3D = _ref.force3D,
	      target = _ref.target,
	      zOrigin = _ref.zOrigin,
	      transforms = "",
	      use3D = force3D === "auto" && ratio && ratio !== 1 || force3D === true; // Safari has a bug that causes it not to render 3D transform-origin values properly, so we force the z origin to 0, record it in the cache, and then do the math here to offset the translate values accordingly (basically do the 3D transform-origin part manually)

	    if (zOrigin && (rotationX !== _zeroDeg || rotationY !== _zeroDeg)) {
	      var angle = parseFloat(rotationY) * _DEG2RAD,
	        a13 = Math.sin(angle),
	        a33 = Math.cos(angle),
	        cos;
	      angle = parseFloat(rotationX) * _DEG2RAD;
	      cos = Math.cos(angle);
	      x = _addPxTranslate(target, x, a13 * cos * -zOrigin);
	      y = _addPxTranslate(target, y, -Math.sin(angle) * -zOrigin);
	      z = _addPxTranslate(target, z, a33 * cos * -zOrigin + zOrigin);
	    }
	    if (transformPerspective !== _zeroPx) {
	      transforms += "perspective(" + transformPerspective + _endParenthesis;
	    }
	    if (xPercent || yPercent) {
	      transforms += "translate(" + xPercent + "%, " + yPercent + "%) ";
	    }
	    if (use3D || x !== _zeroPx || y !== _zeroPx || z !== _zeroPx) {
	      transforms += z !== _zeroPx || use3D ? "translate3d(" + x + ", " + y + ", " + z + ") " : "translate(" + x + ", " + y + _endParenthesis;
	    }
	    if (rotation !== _zeroDeg) {
	      transforms += "rotate(" + rotation + _endParenthesis;
	    }
	    if (rotationY !== _zeroDeg) {
	      transforms += "rotateY(" + rotationY + _endParenthesis;
	    }
	    if (rotationX !== _zeroDeg) {
	      transforms += "rotateX(" + rotationX + _endParenthesis;
	    }
	    if (skewX !== _zeroDeg || skewY !== _zeroDeg) {
	      transforms += "skew(" + skewX + ", " + skewY + _endParenthesis;
	    }
	    if (scaleX !== 1 || scaleY !== 1) {
	      transforms += "scale(" + scaleX + ", " + scaleY + _endParenthesis;
	    }
	    target.style[_transformProp$1] = transforms || "translate(0, 0)";
	  },
	  _renderSVGTransforms = function _renderSVGTransforms(ratio, cache) {
	    var _ref2 = cache || this,
	      xPercent = _ref2.xPercent,
	      yPercent = _ref2.yPercent,
	      x = _ref2.x,
	      y = _ref2.y,
	      rotation = _ref2.rotation,
	      skewX = _ref2.skewX,
	      skewY = _ref2.skewY,
	      scaleX = _ref2.scaleX,
	      scaleY = _ref2.scaleY,
	      target = _ref2.target,
	      xOrigin = _ref2.xOrigin,
	      yOrigin = _ref2.yOrigin,
	      xOffset = _ref2.xOffset,
	      yOffset = _ref2.yOffset,
	      forceCSS = _ref2.forceCSS,
	      tx = parseFloat(x),
	      ty = parseFloat(y),
	      a11,
	      a21,
	      a12,
	      a22,
	      temp;
	    rotation = parseFloat(rotation);
	    skewX = parseFloat(skewX);
	    skewY = parseFloat(skewY);
	    if (skewY) {
	      //for performance reasons, we combine all skewing into the skewX and rotation values. Remember, a skewY of 10 degrees looks the same as a rotation of 10 degrees plus a skewX of 10 degrees.
	      skewY = parseFloat(skewY);
	      skewX += skewY;
	      rotation += skewY;
	    }
	    if (rotation || skewX) {
	      rotation *= _DEG2RAD;
	      skewX *= _DEG2RAD;
	      a11 = Math.cos(rotation) * scaleX;
	      a21 = Math.sin(rotation) * scaleX;
	      a12 = Math.sin(rotation - skewX) * -scaleY;
	      a22 = Math.cos(rotation - skewX) * scaleY;
	      if (skewX) {
	        skewY *= _DEG2RAD;
	        temp = Math.tan(skewX - skewY);
	        temp = Math.sqrt(1 + temp * temp);
	        a12 *= temp;
	        a22 *= temp;
	        if (skewY) {
	          temp = Math.tan(skewY);
	          temp = Math.sqrt(1 + temp * temp);
	          a11 *= temp;
	          a21 *= temp;
	        }
	      }
	      a11 = _round$1(a11);
	      a21 = _round$1(a21);
	      a12 = _round$1(a12);
	      a22 = _round$1(a22);
	    } else {
	      a11 = scaleX;
	      a22 = scaleY;
	      a21 = a12 = 0;
	    }
	    if (tx && !~(x + "").indexOf("px") || ty && !~(y + "").indexOf("px")) {
	      tx = _convertToUnit(target, "x", x, "px");
	      ty = _convertToUnit(target, "y", y, "px");
	    }
	    if (xOrigin || yOrigin || xOffset || yOffset) {
	      tx = _round$1(tx + xOrigin - (xOrigin * a11 + yOrigin * a12) + xOffset);
	      ty = _round$1(ty + yOrigin - (xOrigin * a21 + yOrigin * a22) + yOffset);
	    }
	    if (xPercent || yPercent) {
	      //The SVG spec doesn't support percentage-based translation in the "transform" attribute, so we merge it into the translation to simulate it.
	      temp = target.getBBox();
	      tx = _round$1(tx + xPercent / 100 * temp.width);
	      ty = _round$1(ty + yPercent / 100 * temp.height);
	    }
	    temp = "matrix(" + a11 + "," + a21 + "," + a12 + "," + a22 + "," + tx + "," + ty + ")";
	    target.setAttribute("transform", temp);
	    forceCSS && (target.style[_transformProp$1] = temp); //some browsers prioritize CSS transforms over the transform attribute. When we sense that the user has CSS transforms applied, we must overwrite them this way (otherwise some browser simply won't render the transform attribute changes!)
	  },
	  _addRotationalPropTween = function _addRotationalPropTween(plugin, target, property, startNum, endValue) {
	    var cap = 360,
	      isString = _isString$1(endValue),
	      endNum = parseFloat(endValue) * (isString && ~endValue.indexOf("rad") ? _RAD2DEG : 1),
	      change = endNum - startNum,
	      finalValue = startNum + change + "deg",
	      direction,
	      pt;
	    if (isString) {
	      direction = endValue.split("_")[1];
	      if (direction === "short") {
	        change %= cap;
	        if (change !== change % (cap / 2)) {
	          change += change < 0 ? cap : -cap;
	        }
	      }
	      if (direction === "cw" && change < 0) {
	        change = (change + cap * _bigNum) % cap - ~~(change / cap) * cap;
	      } else if (direction === "ccw" && change > 0) {
	        change = (change - cap * _bigNum) % cap - ~~(change / cap) * cap;
	      }
	    }
	    plugin._pt = pt = new PropTween(plugin._pt, target, property, startNum, change, _renderPropWithEnd);
	    pt.e = finalValue;
	    pt.u = "deg";
	    plugin._props.push(property);
	    return pt;
	  },
	  _assign = function _assign(target, source) {
	    // Internet Explorer doesn't have Object.assign(), so we recreate it here.
	    for (var p in source) {
	      target[p] = source[p];
	    }
	    return target;
	  },
	  _addRawTransformPTs = function _addRawTransformPTs(plugin, transforms, target) {
	    //for handling cases where someone passes in a whole transform string, like transform: "scale(2, 3) rotate(20deg) translateY(30em)"
	    var startCache = _assign({}, target._gsap),
	      exclude = "perspective,force3D,transformOrigin,svgOrigin",
	      style = target.style,
	      endCache,
	      p,
	      startValue,
	      endValue,
	      startNum,
	      endNum,
	      startUnit,
	      endUnit;
	    if (startCache.svg) {
	      startValue = target.getAttribute("transform");
	      target.setAttribute("transform", "");
	      style[_transformProp$1] = transforms;
	      endCache = _parseTransform(target, 1);
	      _removeProperty(target, _transformProp$1);
	      target.setAttribute("transform", startValue);
	    } else {
	      startValue = getComputedStyle(target)[_transformProp$1];
	      style[_transformProp$1] = transforms;
	      endCache = _parseTransform(target, 1);
	      style[_transformProp$1] = startValue;
	    }
	    for (p in _transformProps) {
	      startValue = startCache[p];
	      endValue = endCache[p];
	      if (startValue !== endValue && exclude.indexOf(p) < 0) {
	        //tweening to no perspective gives very unintuitive results - just keep the same perspective in that case.
	        startUnit = getUnit(startValue);
	        endUnit = getUnit(endValue);
	        startNum = startUnit !== endUnit ? _convertToUnit(target, p, startValue, endUnit) : parseFloat(startValue);
	        endNum = parseFloat(endValue);
	        plugin._pt = new PropTween(plugin._pt, endCache, p, startNum, endNum - startNum, _renderCSSProp);
	        plugin._pt.u = endUnit || 0;
	        plugin._props.push(p);
	      }
	    }
	    _assign(endCache, startCache);
	  }; // handle splitting apart padding, margin, borderWidth, and borderRadius into their 4 components. Firefox, for example, won't report borderRadius correctly - it will only do borderTopLeftRadius and the other corners. We also want to handle paddingTop, marginLeft, borderRightWidth, etc.

	_forEachName("padding,margin,Width,Radius", function (name, index) {
	  var t = "Top",
	    r = "Right",
	    b = "Bottom",
	    l = "Left",
	    props = (index < 3 ? [t, r, b, l] : [t + l, t + r, b + r, b + l]).map(function (side) {
	      return index < 2 ? name + side : "border" + side + name;
	    });
	  _specialProps[index > 1 ? "border" + name : name] = function (plugin, target, property, endValue, tween) {
	    var a, vars;
	    if (arguments.length < 4) {
	      // getter, passed target, property, and unit (from _get())
	      a = props.map(function (prop) {
	        return _get(plugin, prop, property);
	      });
	      vars = a.join(" ");
	      return vars.split(a[0]).length === 5 ? a[0] : vars;
	    }
	    a = (endValue + "").split(" ");
	    vars = {};
	    props.forEach(function (prop, i) {
	      return vars[prop] = a[i] = a[i] || a[(i - 1) / 2 | 0];
	    });
	    plugin.init(target, vars, tween);
	  };
	});
	var CSSPlugin = {
	  name: "css",
	  register: _initCore$1,
	  targetTest: function targetTest(target) {
	    return target.style && target.nodeType;
	  },
	  init: function init(target, vars, tween, index, targets) {
	    var props = this._props,
	      style = target.style,
	      startAt = tween.vars.startAt,
	      startValue,
	      endValue,
	      endNum,
	      startNum,
	      type,
	      specialProp,
	      p,
	      startUnit,
	      endUnit,
	      relative,
	      isTransformRelated,
	      transformPropTween,
	      cache,
	      smooth,
	      hasPriority,
	      inlineProps;
	    _pluginInitted || _initCore$1(); // we may call init() multiple times on the same plugin instance, like when adding special properties, so make sure we don't overwrite the revert data or inlineProps

	    this.styles = this.styles || _getStyleSaver(target);
	    inlineProps = this.styles.props;
	    this.tween = tween;
	    for (p in vars) {
	      if (p === "autoRound") {
	        continue;
	      }
	      endValue = vars[p];
	      if (_plugins[p] && _checkPlugin(p, vars, tween, index, target, targets)) {
	        // plugins
	        continue;
	      }
	      type = typeof endValue;
	      specialProp = _specialProps[p];
	      if (type === "function") {
	        endValue = endValue.call(tween, index, target, targets);
	        type = typeof endValue;
	      }
	      if (type === "string" && ~endValue.indexOf("random(")) {
	        endValue = _replaceRandom(endValue);
	      }
	      if (specialProp) {
	        specialProp(this, target, p, endValue, tween) && (hasPriority = 1);
	      } else if (p.substr(0, 2) === "--") {
	        //CSS variable
	        startValue = (getComputedStyle(target).getPropertyValue(p) + "").trim();
	        endValue += "";
	        _colorExp.lastIndex = 0;
	        if (!_colorExp.test(startValue)) {
	          // colors don't have units
	          startUnit = getUnit(startValue);
	          endUnit = getUnit(endValue);
	        }
	        endUnit ? startUnit !== endUnit && (startValue = _convertToUnit(target, p, startValue, endUnit) + endUnit) : startUnit && (endValue += startUnit);
	        this.add(style, "setProperty", startValue, endValue, index, targets, 0, 0, p);
	        props.push(p);
	        inlineProps.push(p, 0, style[p]);
	      } else if (type !== "undefined") {
	        if (startAt && p in startAt) {
	          // in case someone hard-codes a complex value as the start, like top: "calc(2vh / 2)". Without this, it'd use the computed value (always in px)
	          startValue = typeof startAt[p] === "function" ? startAt[p].call(tween, index, target, targets) : startAt[p];
	          _isString$1(startValue) && ~startValue.indexOf("random(") && (startValue = _replaceRandom(startValue));
	          getUnit(startValue + "") || (startValue += _config.units[p] || getUnit(_get(target, p)) || ""); // for cases when someone passes in a unitless value like {x: 100}; if we try setting translate(100, 0px) it won't work.

	          (startValue + "").charAt(1) === "=" && (startValue = _get(target, p)); // can't work with relative values
	        } else {
	          startValue = _get(target, p);
	        }
	        startNum = parseFloat(startValue);
	        relative = type === "string" && endValue.charAt(1) === "=" && endValue.substr(0, 2);
	        relative && (endValue = endValue.substr(2));
	        endNum = parseFloat(endValue);
	        if (p in _propertyAliases) {
	          if (p === "autoAlpha") {
	            //special case where we control the visibility along with opacity. We still allow the opacity value to pass through and get tweened.
	            if (startNum === 1 && _get(target, "visibility") === "hidden" && endNum) {
	              //if visibility is initially set to "hidden", we should interpret that as intent to make opacity 0 (a convenience)
	              startNum = 0;
	            }
	            inlineProps.push("visibility", 0, style.visibility);
	            _addNonTweeningPT(this, style, "visibility", startNum ? "inherit" : "hidden", endNum ? "inherit" : "hidden", !endNum);
	          }
	          if (p !== "scale" && p !== "transform") {
	            p = _propertyAliases[p];
	            ~p.indexOf(",") && (p = p.split(",")[0]);
	          }
	        }
	        isTransformRelated = p in _transformProps; //--- TRANSFORM-RELATED ---

	        if (isTransformRelated) {
	          this.styles.save(p);
	          if (!transformPropTween) {
	            cache = target._gsap;
	            cache.renderTransform && !vars.parseTransform || _parseTransform(target, vars.parseTransform); // if, for example, gsap.set(... {transform:"translateX(50vw)"}), the _get() call doesn't parse the transform, thus cache.renderTransform won't be set yet so force the parsing of the transform here.

	            smooth = vars.smoothOrigin !== false && cache.smooth;
	            transformPropTween = this._pt = new PropTween(this._pt, style, _transformProp$1, 0, 1, cache.renderTransform, cache, 0, -1); //the first time through, create the rendering PropTween so that it runs LAST (in the linked list, we keep adding to the beginning)

	            transformPropTween.dep = 1; //flag it as dependent so that if things get killed/overwritten and this is the only PropTween left, we can safely kill the whole tween.
	          }
	          if (p === "scale") {
	            this._pt = new PropTween(this._pt, cache, "scaleY", cache.scaleY, (relative ? _parseRelative(cache.scaleY, relative + endNum) : endNum) - cache.scaleY || 0, _renderCSSProp);
	            this._pt.u = 0;
	            props.push("scaleY", p);
	            p += "X";
	          } else if (p === "transformOrigin") {
	            inlineProps.push(_transformOriginProp, 0, style[_transformOriginProp]);
	            endValue = _convertKeywordsToPercentages(endValue); //in case something like "left top" or "bottom right" is passed in. Convert to percentages.

	            if (cache.svg) {
	              _applySVGOrigin(target, endValue, 0, smooth, 0, this);
	            } else {
	              endUnit = parseFloat(endValue.split(" ")[2]) || 0; //handle the zOrigin separately!

	              endUnit !== cache.zOrigin && _addNonTweeningPT(this, cache, "zOrigin", cache.zOrigin, endUnit);
	              _addNonTweeningPT(this, style, p, _firstTwoOnly(startValue), _firstTwoOnly(endValue));
	            }
	            continue;
	          } else if (p === "svgOrigin") {
	            _applySVGOrigin(target, endValue, 1, smooth, 0, this);
	            continue;
	          } else if (p in _rotationalProperties) {
	            _addRotationalPropTween(this, cache, p, startNum, relative ? _parseRelative(startNum, relative + endValue) : endValue);
	            continue;
	          } else if (p === "smoothOrigin") {
	            _addNonTweeningPT(this, cache, "smooth", cache.smooth, endValue);
	            continue;
	          } else if (p === "force3D") {
	            cache[p] = endValue;
	            continue;
	          } else if (p === "transform") {
	            _addRawTransformPTs(this, endValue, target);
	            continue;
	          }
	        } else if (!(p in style)) {
	          p = _checkPropPrefix(p) || p;
	        }
	        if (isTransformRelated || (endNum || endNum === 0) && (startNum || startNum === 0) && !_complexExp.test(endValue) && p in style) {
	          startUnit = (startValue + "").substr((startNum + "").length);
	          endNum || (endNum = 0); // protect against NaN

	          endUnit = getUnit(endValue) || (p in _config.units ? _config.units[p] : startUnit);
	          startUnit !== endUnit && (startNum = _convertToUnit(target, p, startValue, endUnit));
	          this._pt = new PropTween(this._pt, isTransformRelated ? cache : style, p, startNum, (relative ? _parseRelative(startNum, relative + endNum) : endNum) - startNum, !isTransformRelated && (endUnit === "px" || p === "zIndex") && vars.autoRound !== false ? _renderRoundedCSSProp : _renderCSSProp);
	          this._pt.u = endUnit || 0;
	          if (startUnit !== endUnit && endUnit !== "%") {
	            //when the tween goes all the way back to the beginning, we need to revert it to the OLD/ORIGINAL value (with those units). We record that as a "b" (beginning) property and point to a render method that handles that. (performance optimization)
	            this._pt.b = startValue;
	            this._pt.r = _renderCSSPropWithBeginning;
	          }
	        } else if (!(p in style)) {
	          if (p in target) {
	            //maybe it's not a style - it could be a property added directly to an element in which case we'll try to animate that.
	            this.add(target, p, startValue || target[p], relative ? relative + endValue : endValue, index, targets);
	          } else if (p !== "parseTransform") {
	            _missingPlugin(p, endValue);
	            continue;
	          }
	        } else {
	          _tweenComplexCSSString.call(this, target, p, startValue, relative ? relative + endValue : endValue);
	        }
	        isTransformRelated || (p in style ? inlineProps.push(p, 0, style[p]) : inlineProps.push(p, 1, startValue || target[p]));
	        props.push(p);
	      }
	    }
	    hasPriority && _sortPropTweensByPriority(this);
	  },
	  render: function render(ratio, data) {
	    if (data.tween._time || !_reverting()) {
	      var pt = data._pt;
	      while (pt) {
	        pt.r(ratio, pt.d);
	        pt = pt._next;
	      }
	    } else {
	      data.styles.revert();
	    }
	  },
	  get: _get,
	  aliases: _propertyAliases,
	  getSetter: function getSetter(target, property, plugin) {
	    //returns a setter function that accepts target, property, value and applies it accordingly. Remember, properties like "x" aren't as simple as target.style.property = value because they've got to be applied to a proxy object and then merged into a transform string in a renderer.
	    var p = _propertyAliases[property];
	    p && p.indexOf(",") < 0 && (property = p);
	    return property in _transformProps && property !== _transformOriginProp && (target._gsap.x || _get(target, "x")) ? plugin && _recentSetterPlugin === plugin ? property === "scale" ? _setterScale : _setterTransform : (_recentSetterPlugin = plugin || {}) && (property === "scale" ? _setterScaleWithRender : _setterTransformWithRender) : target.style && !_isUndefined(target.style[property]) ? _setterCSSStyle : ~property.indexOf("-") ? _setterCSSProp : _getSetter(target, property);
	  },
	  core: {
	    _removeProperty: _removeProperty,
	    _getMatrix: _getMatrix
	  }
	};
	gsap$2.utils.checkPrefix = _checkPropPrefix;
	gsap$2.core.getStyleSaver = _getStyleSaver;
	(function (positionAndScale, rotation, others, aliases) {
	  var all = _forEachName(positionAndScale + "," + rotation + "," + others, function (name) {
	    _transformProps[name] = 1;
	  });
	  _forEachName(rotation, function (name) {
	    _config.units[name] = "deg";
	    _rotationalProperties[name] = 1;
	  });
	  _propertyAliases[all[13]] = positionAndScale + "," + rotation;
	  _forEachName(aliases, function (name) {
	    var split = name.split(":");
	    _propertyAliases[split[1]] = all[split[0]];
	  });
	})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");
	_forEachName("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function (name) {
	  _config.units[name] = "px";
	});
	gsap$2.registerPlugin(CSSPlugin);

	var gsapWithCSS = gsap$2.registerPlugin(CSSPlugin) || gsap$2;
	  // to protect from tree shaking
	  gsapWithCSS.core.Tween;

	const bodyLocker = bool => {
	  const body = document.querySelector("body");
	  if (bool) {
	    body.style.overflow = "hidden";
	  } else {
	    body.style.overflow = "auto";
	  }
	};

	const loader = document.querySelector('.loader');
	const nav = document.querySelector('.main-nav');
	const navOpener = document.querySelector('.nav-opener');
	const navCloser = document.querySelector('.nav-closer');

	if (loader) {
	  bodyLocker(true);
	  imagesLoaded('body', {
	    background: true
	  }, () => {
	    gsapWithCSS.fromTo('.loader', {
	      opacity: 1
	    }, {
	      opacity: 0,
	      display: 'none',
	      duration: 1,
	      delay: 0.5,
	      ease: 'ease-in',
	      onComplete: () => {
	        bodyLocker(false);
	      }
	    });
	  });
	}

	class Modal {
	  constructor(modal, options = {}) {
	    this.preventBodyLock = options.preventBodyLock ? true : false;
	    this.modal = modal;
	    this.overlay = this.modal.parentNode;
	    this.close = this.modal.querySelector('.modal-closer');
	    this.id = this.modal.getAttribute('id');
	    this.openers = document.querySelectorAll('[data-modal-opener="' + this.id + '"]');
	    this.isInited = false;
	    this.focusableElements = ['a[href]', 'input', 'select', 'textarea', 'button', 'iframe', '[contenteditable]', '[tabindex]:not([tabindex^="-"])'];
	    this.init();
	  }
	  bodyLocker = bool => {
	    const body = document.querySelector('body');
	    if (bool) {
	      body.style.overflow = 'hidden';
	    } else {
	      body.style.overflow = 'auto';
	    }
	  };
	  focusTrap = () => {
	    const firstFocusableElement = this.modal.querySelectorAll(this.focusableElements)[0];
	    const focusableContent = this.modal.querySelectorAll(this.focusableElements);
	    const lastFocusableElement = focusableContent[focusableContent.length - 1];
	    if (focusableContent.length) {
	      const onBtnClickHandler = evt => {
	        const isTabPressed = evt.key === 'Tab' || evt.key === 9;
	        if (evt.key === 'Escape') {
	          document.removeEventListener('keydown', onBtnClickHandler);
	        }
	        if (!isTabPressed) {
	          return;
	        }
	        if (evt.shiftKey) {
	          if (document.activeElement === firstFocusableElement) {
	            lastFocusableElement.focus();
	            evt.preventDefault();
	          }
	        } else {
	          if (document.activeElement === lastFocusableElement) {
	            firstFocusableElement.focus();
	            evt.preventDefault();
	          }
	        }
	      };
	      document.addEventListener('keydown', onBtnClickHandler);
	      firstFocusableElement.focus();
	    }
	  };
	  addListeners = () => {
	    if (this.openers) {
	      this.openers.forEach(opener => {
	        opener.removeEventListener('click', this.openModal);
	      });
	    }
	    document.addEventListener('click', this.closeByOverlayClick);
	    document.addEventListener('keydown', this.closeByEscBtn);
	    if (this.close) {
	      this.close.addEventListener('click', this.closeByBtnClick);
	    }
	  };
	  refresh = () => {
	    document.removeEventListener('click', this.closeByOverlayClick);
	    document.removeEventListener('keydown', this.closeByEscBtn);
	    if (this.close) {
	      this.close.removeEventListener('click', this.closeByBtnClick);
	    }
	    gsapWithCSS.fromTo(this.overlay, {
	      display: 'flex'
	    }, {
	      opacity: 0,
	      display: 'none',
	      duration: 0.6,
	      ease: 'ease-in',
	      onComplete: () => {
	        //если в модалке есть форма, при закрытии обнуляю поля
	        this.modal.querySelectorAll('form').forEach(f => f.reset());
	      }
	    });
	    !this.preventBodyLock ? this.bodyLocker(false) : null;
	    this.preventBodyLock = false;
	    if (this.openers) {
	      this.openers.forEach(opener => {
	        opener.addEventListener('click', this.openModal);
	      });
	    }
	  };
	  closeByOverlayClick = evt => {
	    if (evt.target === this.overlay) {
	      this.refresh();
	    }
	  };
	  closeByEscBtn = evt => {
	    if (evt.key === 'Escape') {
	      this.refresh();
	    }
	  };
	  closeByBtnClick = () => {
	    this.refresh();
	  };
	  openModal = evt => {
	    evt.preventDefault();
	    this.bodyLocker(true);
	    gsapWithCSS.fromTo(this.overlay, {
	      display: 'none',
	      opacity: 0
	    }, {
	      display: 'flex',
	      opacity: 1,
	      duration: 0.6,
	      ease: 'ease-in',
	      onComplete: () => {
	        this.addListeners();
	        this.focusTrap();
	      }
	    });
	  };
	  show = () => {
	    this.bodyLocker(true);
	    gsapWithCSS.fromTo(this.overlay, {
	      display: 'none',
	      opacity: 0
	    }, {
	      display: 'flex',
	      opacity: 1,
	      duration: 0.6,
	      ease: 'ease-in',
	      onComplete: () => {
	        this.addListeners();
	        this.focusTrap();
	      }
	    });
	  };
	  init() {
	    if (this.openers) {
	      this.isInited = true;
	      this.openers.forEach(opener => {
	        opener.addEventListener('click', this.openModal);
	      });
	    } else {
	      console.error('Не добавлена кнопка открытия модального окна, либо в ней не прописан аттр-т: data-modal-opener={modal-id} ');
	    }
	  }
	}

	function limitStr(str, n) {
	  if (str.length > n) {
	    return str.slice(0, n) + '...';
	  } else {
	    return str;
	  }
	}

	const collapsedItems = document.querySelectorAll('[data-collapsed-text]');
	if (collapsedItems.length) {
	  const reviewModal = document.querySelector('.review-modal');
	  collapsedItems.forEach(item => {
	    item.innerHTML = limitStr(item.innerHTML, item.dataset.collapsedText);
	    const length = item.innerHTML.length;
	    if (length > item.dataset.collapsedText) {
	      const showBtn = document.createElement('button');
	      showBtn.innerHTML = item.dataset.collapsedBtnText;
	      item.append(showBtn);
	      showBtn.addEventListener('click', () => {
	        reviewModal.querySelector('.modal-text').innerHTML = item.dataset.expandedText;
	        new Modal(reviewModal).show();
	      });
	    }
	  });
	}

	/**
	 * SSR Window 4.0.2
	 * Better handling for window object in SSR environment
	 * https://github.com/nolimits4web/ssr-window
	 *
	 * Copyright 2021, Vladimir Kharlampidi
	 *
	 * Licensed under MIT
	 *
	 * Released on: December 13, 2021
	 */
	/* eslint-disable no-param-reassign */
	function isObject$2(obj) {
	  return obj !== null && typeof obj === 'object' && 'constructor' in obj && obj.constructor === Object;
	}
	function extend$1(target, src) {
	  if (target === void 0) {
	    target = {};
	  }
	  if (src === void 0) {
	    src = {};
	  }
	  Object.keys(src).forEach(key => {
	    if (typeof target[key] === 'undefined') target[key] = src[key];else if (isObject$2(src[key]) && isObject$2(target[key]) && Object.keys(src[key]).length > 0) {
	      extend$1(target[key], src[key]);
	    }
	  });
	}
	const ssrDocument = {
	  body: {},
	  addEventListener() {},
	  removeEventListener() {},
	  activeElement: {
	    blur() {},
	    nodeName: ''
	  },
	  querySelector() {
	    return null;
	  },
	  querySelectorAll() {
	    return [];
	  },
	  getElementById() {
	    return null;
	  },
	  createEvent() {
	    return {
	      initEvent() {}
	    };
	  },
	  createElement() {
	    return {
	      children: [],
	      childNodes: [],
	      style: {},
	      setAttribute() {},
	      getElementsByTagName() {
	        return [];
	      }
	    };
	  },
	  createElementNS() {
	    return {};
	  },
	  importNode() {
	    return null;
	  },
	  location: {
	    hash: '',
	    host: '',
	    hostname: '',
	    href: '',
	    origin: '',
	    pathname: '',
	    protocol: '',
	    search: ''
	  }
	};
	function getDocument() {
	  const doc = typeof document !== 'undefined' ? document : {};
	  extend$1(doc, ssrDocument);
	  return doc;
	}
	const ssrWindow = {
	  document: ssrDocument,
	  navigator: {
	    userAgent: ''
	  },
	  location: {
	    hash: '',
	    host: '',
	    hostname: '',
	    href: '',
	    origin: '',
	    pathname: '',
	    protocol: '',
	    search: ''
	  },
	  history: {
	    replaceState() {},
	    pushState() {},
	    go() {},
	    back() {}
	  },
	  CustomEvent: function CustomEvent() {
	    return this;
	  },
	  addEventListener() {},
	  removeEventListener() {},
	  getComputedStyle() {
	    return {
	      getPropertyValue() {
	        return '';
	      }
	    };
	  },
	  Image() {},
	  Date() {},
	  screen: {},
	  setTimeout() {},
	  clearTimeout() {},
	  matchMedia() {
	    return {};
	  },
	  requestAnimationFrame(callback) {
	    if (typeof setTimeout === 'undefined') {
	      callback();
	      return null;
	    }
	    return setTimeout(callback, 0);
	  },
	  cancelAnimationFrame(id) {
	    if (typeof setTimeout === 'undefined') {
	      return;
	    }
	    clearTimeout(id);
	  }
	};
	function getWindow() {
	  const win = typeof window !== 'undefined' ? window : {};
	  extend$1(win, ssrWindow);
	  return win;
	}

	function classesToTokens(classes) {
	  if (classes === void 0) {
	    classes = '';
	  }
	  return classes.trim().split(' ').filter(c => !!c.trim());
	}
	function deleteProps(obj) {
	  const object = obj;
	  Object.keys(object).forEach(key => {
	    try {
	      object[key] = null;
	    } catch (e) {
	      // no getter for object
	    }
	    try {
	      delete object[key];
	    } catch (e) {
	      // something got wrong
	    }
	  });
	}
	function nextTick(callback, delay) {
	  if (delay === void 0) {
	    delay = 0;
	  }
	  return setTimeout(callback, delay);
	}
	function now() {
	  return Date.now();
	}
	function getComputedStyle$1(el) {
	  const window = getWindow();
	  let style;
	  if (window.getComputedStyle) {
	    style = window.getComputedStyle(el, null);
	  }
	  if (!style && el.currentStyle) {
	    style = el.currentStyle;
	  }
	  if (!style) {
	    style = el.style;
	  }
	  return style;
	}
	function getTranslate(el, axis) {
	  if (axis === void 0) {
	    axis = 'x';
	  }
	  const window = getWindow();
	  let matrix;
	  let curTransform;
	  let transformMatrix;
	  const curStyle = getComputedStyle$1(el);
	  if (window.WebKitCSSMatrix) {
	    curTransform = curStyle.transform || curStyle.webkitTransform;
	    if (curTransform.split(',').length > 6) {
	      curTransform = curTransform.split(', ').map(a => a.replace(',', '.')).join(', ');
	    }
	    // Some old versions of Webkit choke when 'none' is passed; pass
	    // empty string instead in this case
	    transformMatrix = new window.WebKitCSSMatrix(curTransform === 'none' ? '' : curTransform);
	  } else {
	    transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
	    matrix = transformMatrix.toString().split(',');
	  }
	  if (axis === 'x') {
	    // Latest Chrome and webkits Fix
	    if (window.WebKitCSSMatrix) curTransform = transformMatrix.m41;
	    // Crazy IE10 Matrix
	    else if (matrix.length === 16) curTransform = parseFloat(matrix[12]);
	    // Normal Browsers
	    else curTransform = parseFloat(matrix[4]);
	  }
	  if (axis === 'y') {
	    // Latest Chrome and webkits Fix
	    if (window.WebKitCSSMatrix) curTransform = transformMatrix.m42;
	    // Crazy IE10 Matrix
	    else if (matrix.length === 16) curTransform = parseFloat(matrix[13]);
	    // Normal Browsers
	    else curTransform = parseFloat(matrix[5]);
	  }
	  return curTransform || 0;
	}
	function isObject$1(o) {
	  return typeof o === 'object' && o !== null && o.constructor && Object.prototype.toString.call(o).slice(8, -1) === 'Object';
	}
	function isNode(node) {
	  // eslint-disable-next-line
	  if (typeof window !== 'undefined' && typeof window.HTMLElement !== 'undefined') {
	    return node instanceof HTMLElement;
	  }
	  return node && (node.nodeType === 1 || node.nodeType === 11);
	}
	function extend() {
	  const to = Object(arguments.length <= 0 ? undefined : arguments[0]);
	  const noExtend = ['__proto__', 'constructor', 'prototype'];
	  for (let i = 1; i < arguments.length; i += 1) {
	    const nextSource = i < 0 || arguments.length <= i ? undefined : arguments[i];
	    if (nextSource !== undefined && nextSource !== null && !isNode(nextSource)) {
	      const keysArray = Object.keys(Object(nextSource)).filter(key => noExtend.indexOf(key) < 0);
	      for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex += 1) {
	        const nextKey = keysArray[nextIndex];
	        const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
	        if (desc !== undefined && desc.enumerable) {
	          if (isObject$1(to[nextKey]) && isObject$1(nextSource[nextKey])) {
	            if (nextSource[nextKey].__swiper__) {
	              to[nextKey] = nextSource[nextKey];
	            } else {
	              extend(to[nextKey], nextSource[nextKey]);
	            }
	          } else if (!isObject$1(to[nextKey]) && isObject$1(nextSource[nextKey])) {
	            to[nextKey] = {};
	            if (nextSource[nextKey].__swiper__) {
	              to[nextKey] = nextSource[nextKey];
	            } else {
	              extend(to[nextKey], nextSource[nextKey]);
	            }
	          } else {
	            to[nextKey] = nextSource[nextKey];
	          }
	        }
	      }
	    }
	  }
	  return to;
	}
	function setCSSProperty(el, varName, varValue) {
	  el.style.setProperty(varName, varValue);
	}
	function animateCSSModeScroll(_ref) {
	  let {
	    swiper,
	    targetPosition,
	    side
	  } = _ref;
	  const window = getWindow();
	  const startPosition = -swiper.translate;
	  let startTime = null;
	  let time;
	  const duration = swiper.params.speed;
	  swiper.wrapperEl.style.scrollSnapType = 'none';
	  window.cancelAnimationFrame(swiper.cssModeFrameID);
	  const dir = targetPosition > startPosition ? 'next' : 'prev';
	  const isOutOfBound = (current, target) => {
	    return dir === 'next' && current >= target || dir === 'prev' && current <= target;
	  };
	  const animate = () => {
	    time = new Date().getTime();
	    if (startTime === null) {
	      startTime = time;
	    }
	    const progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
	    const easeProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
	    let currentPosition = startPosition + easeProgress * (targetPosition - startPosition);
	    if (isOutOfBound(currentPosition, targetPosition)) {
	      currentPosition = targetPosition;
	    }
	    swiper.wrapperEl.scrollTo({
	      [side]: currentPosition
	    });
	    if (isOutOfBound(currentPosition, targetPosition)) {
	      swiper.wrapperEl.style.overflow = 'hidden';
	      swiper.wrapperEl.style.scrollSnapType = '';
	      setTimeout(() => {
	        swiper.wrapperEl.style.overflow = '';
	        swiper.wrapperEl.scrollTo({
	          [side]: currentPosition
	        });
	      });
	      window.cancelAnimationFrame(swiper.cssModeFrameID);
	      return;
	    }
	    swiper.cssModeFrameID = window.requestAnimationFrame(animate);
	  };
	  animate();
	}
	function elementChildren(element, selector) {
	  if (selector === void 0) {
	    selector = '';
	  }
	  return [...element.children].filter(el => el.matches(selector));
	}
	function showWarning(text) {
	  try {
	    console.warn(text);
	    return;
	  } catch (err) {
	    // err
	  }
	}
	function createElement(tag, classes) {
	  if (classes === void 0) {
	    classes = [];
	  }
	  const el = document.createElement(tag);
	  el.classList.add(...(Array.isArray(classes) ? classes : classesToTokens(classes)));
	  return el;
	}
	function elementPrevAll(el, selector) {
	  const prevEls = [];
	  while (el.previousElementSibling) {
	    const prev = el.previousElementSibling; // eslint-disable-line
	    if (selector) {
	      if (prev.matches(selector)) prevEls.push(prev);
	    } else prevEls.push(prev);
	    el = prev;
	  }
	  return prevEls;
	}
	function elementNextAll(el, selector) {
	  const nextEls = [];
	  while (el.nextElementSibling) {
	    const next = el.nextElementSibling; // eslint-disable-line
	    if (selector) {
	      if (next.matches(selector)) nextEls.push(next);
	    } else nextEls.push(next);
	    el = next;
	  }
	  return nextEls;
	}
	function elementStyle(el, prop) {
	  const window = getWindow();
	  return window.getComputedStyle(el, null).getPropertyValue(prop);
	}
	function elementIndex(el) {
	  let child = el;
	  let i;
	  if (child) {
	    i = 0;
	    // eslint-disable-next-line
	    while ((child = child.previousSibling) !== null) {
	      if (child.nodeType === 1) i += 1;
	    }
	    return i;
	  }
	  return undefined;
	}
	function elementParents(el, selector) {
	  const parents = []; // eslint-disable-line
	  let parent = el.parentElement; // eslint-disable-line
	  while (parent) {
	    if (selector) {
	      if (parent.matches(selector)) parents.push(parent);
	    } else {
	      parents.push(parent);
	    }
	    parent = parent.parentElement;
	  }
	  return parents;
	}
	function elementOuterSize(el, size, includeMargins) {
	  const window = getWindow();
	  {
	    return el[size === 'width' ? 'offsetWidth' : 'offsetHeight'] + parseFloat(window.getComputedStyle(el, null).getPropertyValue(size === 'width' ? 'margin-right' : 'margin-top')) + parseFloat(window.getComputedStyle(el, null).getPropertyValue(size === 'width' ? 'margin-left' : 'margin-bottom'));
	  }
	}
	function makeElementsArray(el) {
	  return (Array.isArray(el) ? el : [el]).filter(e => !!e);
	}

	let support;
	function calcSupport() {
	  const window = getWindow();
	  const document = getDocument();
	  return {
	    smoothScroll: document.documentElement && document.documentElement.style && 'scrollBehavior' in document.documentElement.style,
	    touch: !!('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch)
	  };
	}
	function getSupport() {
	  if (!support) {
	    support = calcSupport();
	  }
	  return support;
	}
	let deviceCached;
	function calcDevice(_temp) {
	  let {
	    userAgent
	  } = _temp === void 0 ? {} : _temp;
	  const support = getSupport();
	  const window = getWindow();
	  const platform = window.navigator.platform;
	  const ua = userAgent || window.navigator.userAgent;
	  const device = {
	    ios: false,
	    android: false
	  };
	  const screenWidth = window.screen.width;
	  const screenHeight = window.screen.height;
	  const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/); // eslint-disable-line
	  let ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
	  const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
	  const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
	  const windows = platform === 'Win32';
	  let macos = platform === 'MacIntel';

	  // iPadOs 13 fix
	  const iPadScreens = ['1024x1366', '1366x1024', '834x1194', '1194x834', '834x1112', '1112x834', '768x1024', '1024x768', '820x1180', '1180x820', '810x1080', '1080x810'];
	  if (!ipad && macos && support.touch && iPadScreens.indexOf(`${screenWidth}x${screenHeight}`) >= 0) {
	    ipad = ua.match(/(Version)\/([\d.]+)/);
	    if (!ipad) ipad = [0, 1, '13_0_0'];
	    macos = false;
	  }

	  // Android
	  if (android && !windows) {
	    device.os = 'android';
	    device.android = true;
	  }
	  if (ipad || iphone || ipod) {
	    device.os = 'ios';
	    device.ios = true;
	  }

	  // Export object
	  return device;
	}
	function getDevice(overrides) {
	  if (overrides === void 0) {
	    overrides = {};
	  }
	  if (!deviceCached) {
	    deviceCached = calcDevice(overrides);
	  }
	  return deviceCached;
	}
	let browser;
	function calcBrowser() {
	  const window = getWindow();
	  const device = getDevice();
	  let needPerspectiveFix = false;
	  function isSafari() {
	    const ua = window.navigator.userAgent.toLowerCase();
	    return ua.indexOf('safari') >= 0 && ua.indexOf('chrome') < 0 && ua.indexOf('android') < 0;
	  }
	  if (isSafari()) {
	    const ua = String(window.navigator.userAgent);
	    if (ua.includes('Version/')) {
	      const [major, minor] = ua.split('Version/')[1].split(' ')[0].split('.').map(num => Number(num));
	      needPerspectiveFix = major < 16 || major === 16 && minor < 2;
	    }
	  }
	  const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(window.navigator.userAgent);
	  const isSafariBrowser = isSafari();
	  const need3dFix = isSafariBrowser || isWebView && device.ios;
	  return {
	    isSafari: needPerspectiveFix || isSafariBrowser,
	    needPerspectiveFix,
	    need3dFix,
	    isWebView
	  };
	}
	function getBrowser() {
	  if (!browser) {
	    browser = calcBrowser();
	  }
	  return browser;
	}
	function Resize(_ref) {
	  let {
	    swiper,
	    on,
	    emit
	  } = _ref;
	  const window = getWindow();
	  let observer = null;
	  let animationFrame = null;
	  const resizeHandler = () => {
	    if (!swiper || swiper.destroyed || !swiper.initialized) return;
	    emit('beforeResize');
	    emit('resize');
	  };
	  const createObserver = () => {
	    if (!swiper || swiper.destroyed || !swiper.initialized) return;
	    observer = new ResizeObserver(entries => {
	      animationFrame = window.requestAnimationFrame(() => {
	        const {
	          width,
	          height
	        } = swiper;
	        let newWidth = width;
	        let newHeight = height;
	        entries.forEach(_ref2 => {
	          let {
	            contentBoxSize,
	            contentRect,
	            target
	          } = _ref2;
	          if (target && target !== swiper.el) return;
	          newWidth = contentRect ? contentRect.width : (contentBoxSize[0] || contentBoxSize).inlineSize;
	          newHeight = contentRect ? contentRect.height : (contentBoxSize[0] || contentBoxSize).blockSize;
	        });
	        if (newWidth !== width || newHeight !== height) {
	          resizeHandler();
	        }
	      });
	    });
	    observer.observe(swiper.el);
	  };
	  const removeObserver = () => {
	    if (animationFrame) {
	      window.cancelAnimationFrame(animationFrame);
	    }
	    if (observer && observer.unobserve && swiper.el) {
	      observer.unobserve(swiper.el);
	      observer = null;
	    }
	  };
	  const orientationChangeHandler = () => {
	    if (!swiper || swiper.destroyed || !swiper.initialized) return;
	    emit('orientationchange');
	  };
	  on('init', () => {
	    if (swiper.params.resizeObserver && typeof window.ResizeObserver !== 'undefined') {
	      createObserver();
	      return;
	    }
	    window.addEventListener('resize', resizeHandler);
	    window.addEventListener('orientationchange', orientationChangeHandler);
	  });
	  on('destroy', () => {
	    removeObserver();
	    window.removeEventListener('resize', resizeHandler);
	    window.removeEventListener('orientationchange', orientationChangeHandler);
	  });
	}
	function Observer$1(_ref) {
	  let {
	    swiper,
	    extendParams,
	    on,
	    emit
	  } = _ref;
	  const observers = [];
	  const window = getWindow();
	  const attach = function (target, options) {
	    if (options === void 0) {
	      options = {};
	    }
	    const ObserverFunc = window.MutationObserver || window.WebkitMutationObserver;
	    const observer = new ObserverFunc(mutations => {
	      // The observerUpdate event should only be triggered
	      // once despite the number of mutations.  Additional
	      // triggers are redundant and are very costly
	      if (swiper.__preventObserver__) return;
	      if (mutations.length === 1) {
	        emit('observerUpdate', mutations[0]);
	        return;
	      }
	      const observerUpdate = function observerUpdate() {
	        emit('observerUpdate', mutations[0]);
	      };
	      if (window.requestAnimationFrame) {
	        window.requestAnimationFrame(observerUpdate);
	      } else {
	        window.setTimeout(observerUpdate, 0);
	      }
	    });
	    observer.observe(target, {
	      attributes: typeof options.attributes === 'undefined' ? true : options.attributes,
	      childList: typeof options.childList === 'undefined' ? true : options.childList,
	      characterData: typeof options.characterData === 'undefined' ? true : options.characterData
	    });
	    observers.push(observer);
	  };
	  const init = () => {
	    if (!swiper.params.observer) return;
	    if (swiper.params.observeParents) {
	      const containerParents = elementParents(swiper.hostEl);
	      for (let i = 0; i < containerParents.length; i += 1) {
	        attach(containerParents[i]);
	      }
	    }
	    // Observe container
	    attach(swiper.hostEl, {
	      childList: swiper.params.observeSlideChildren
	    });

	    // Observe wrapper
	    attach(swiper.wrapperEl, {
	      attributes: false
	    });
	  };
	  const destroy = () => {
	    observers.forEach(observer => {
	      observer.disconnect();
	    });
	    observers.splice(0, observers.length);
	  };
	  extendParams({
	    observer: false,
	    observeParents: false,
	    observeSlideChildren: false
	  });
	  on('init', init);
	  on('destroy', destroy);
	}

	/* eslint-disable no-underscore-dangle */

	var eventsEmitter = {
	  on(events, handler, priority) {
	    const self = this;
	    if (!self.eventsListeners || self.destroyed) return self;
	    if (typeof handler !== 'function') return self;
	    const method = priority ? 'unshift' : 'push';
	    events.split(' ').forEach(event => {
	      if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
	      self.eventsListeners[event][method](handler);
	    });
	    return self;
	  },
	  once(events, handler, priority) {
	    const self = this;
	    if (!self.eventsListeners || self.destroyed) return self;
	    if (typeof handler !== 'function') return self;
	    function onceHandler() {
	      self.off(events, onceHandler);
	      if (onceHandler.__emitterProxy) {
	        delete onceHandler.__emitterProxy;
	      }
	      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	        args[_key] = arguments[_key];
	      }
	      handler.apply(self, args);
	    }
	    onceHandler.__emitterProxy = handler;
	    return self.on(events, onceHandler, priority);
	  },
	  onAny(handler, priority) {
	    const self = this;
	    if (!self.eventsListeners || self.destroyed) return self;
	    if (typeof handler !== 'function') return self;
	    const method = priority ? 'unshift' : 'push';
	    if (self.eventsAnyListeners.indexOf(handler) < 0) {
	      self.eventsAnyListeners[method](handler);
	    }
	    return self;
	  },
	  offAny(handler) {
	    const self = this;
	    if (!self.eventsListeners || self.destroyed) return self;
	    if (!self.eventsAnyListeners) return self;
	    const index = self.eventsAnyListeners.indexOf(handler);
	    if (index >= 0) {
	      self.eventsAnyListeners.splice(index, 1);
	    }
	    return self;
	  },
	  off(events, handler) {
	    const self = this;
	    if (!self.eventsListeners || self.destroyed) return self;
	    if (!self.eventsListeners) return self;
	    events.split(' ').forEach(event => {
	      if (typeof handler === 'undefined') {
	        self.eventsListeners[event] = [];
	      } else if (self.eventsListeners[event]) {
	        self.eventsListeners[event].forEach((eventHandler, index) => {
	          if (eventHandler === handler || eventHandler.__emitterProxy && eventHandler.__emitterProxy === handler) {
	            self.eventsListeners[event].splice(index, 1);
	          }
	        });
	      }
	    });
	    return self;
	  },
	  emit() {
	    const self = this;
	    if (!self.eventsListeners || self.destroyed) return self;
	    if (!self.eventsListeners) return self;
	    let events;
	    let data;
	    let context;
	    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	      args[_key2] = arguments[_key2];
	    }
	    if (typeof args[0] === 'string' || Array.isArray(args[0])) {
	      events = args[0];
	      data = args.slice(1, args.length);
	      context = self;
	    } else {
	      events = args[0].events;
	      data = args[0].data;
	      context = args[0].context || self;
	    }
	    data.unshift(context);
	    const eventsArray = Array.isArray(events) ? events : events.split(' ');
	    eventsArray.forEach(event => {
	      if (self.eventsAnyListeners && self.eventsAnyListeners.length) {
	        self.eventsAnyListeners.forEach(eventHandler => {
	          eventHandler.apply(context, [event, ...data]);
	        });
	      }
	      if (self.eventsListeners && self.eventsListeners[event]) {
	        self.eventsListeners[event].forEach(eventHandler => {
	          eventHandler.apply(context, data);
	        });
	      }
	    });
	    return self;
	  }
	};
	function updateSize() {
	  const swiper = this;
	  let width;
	  let height;
	  const el = swiper.el;
	  if (typeof swiper.params.width !== 'undefined' && swiper.params.width !== null) {
	    width = swiper.params.width;
	  } else {
	    width = el.clientWidth;
	  }
	  if (typeof swiper.params.height !== 'undefined' && swiper.params.height !== null) {
	    height = swiper.params.height;
	  } else {
	    height = el.clientHeight;
	  }
	  if (width === 0 && swiper.isHorizontal() || height === 0 && swiper.isVertical()) {
	    return;
	  }

	  // Subtract paddings
	  width = width - parseInt(elementStyle(el, 'padding-left') || 0, 10) - parseInt(elementStyle(el, 'padding-right') || 0, 10);
	  height = height - parseInt(elementStyle(el, 'padding-top') || 0, 10) - parseInt(elementStyle(el, 'padding-bottom') || 0, 10);
	  if (Number.isNaN(width)) width = 0;
	  if (Number.isNaN(height)) height = 0;
	  Object.assign(swiper, {
	    width,
	    height,
	    size: swiper.isHorizontal() ? width : height
	  });
	}
	function updateSlides() {
	  const swiper = this;
	  function getDirectionPropertyValue(node, label) {
	    return parseFloat(node.getPropertyValue(swiper.getDirectionLabel(label)) || 0);
	  }
	  const params = swiper.params;
	  const {
	    wrapperEl,
	    slidesEl,
	    size: swiperSize,
	    rtlTranslate: rtl,
	    wrongRTL
	  } = swiper;
	  const isVirtual = swiper.virtual && params.virtual.enabled;
	  const previousSlidesLength = isVirtual ? swiper.virtual.slides.length : swiper.slides.length;
	  const slides = elementChildren(slidesEl, `.${swiper.params.slideClass}, swiper-slide`);
	  const slidesLength = isVirtual ? swiper.virtual.slides.length : slides.length;
	  let snapGrid = [];
	  const slidesGrid = [];
	  const slidesSizesGrid = [];
	  let offsetBefore = params.slidesOffsetBefore;
	  if (typeof offsetBefore === 'function') {
	    offsetBefore = params.slidesOffsetBefore.call(swiper);
	  }
	  let offsetAfter = params.slidesOffsetAfter;
	  if (typeof offsetAfter === 'function') {
	    offsetAfter = params.slidesOffsetAfter.call(swiper);
	  }
	  const previousSnapGridLength = swiper.snapGrid.length;
	  const previousSlidesGridLength = swiper.slidesGrid.length;
	  let spaceBetween = params.spaceBetween;
	  let slidePosition = -offsetBefore;
	  let prevSlideSize = 0;
	  let index = 0;
	  if (typeof swiperSize === 'undefined') {
	    return;
	  }
	  if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
	    spaceBetween = parseFloat(spaceBetween.replace('%', '')) / 100 * swiperSize;
	  } else if (typeof spaceBetween === 'string') {
	    spaceBetween = parseFloat(spaceBetween);
	  }
	  swiper.virtualSize = -spaceBetween;

	  // reset margins
	  slides.forEach(slideEl => {
	    if (rtl) {
	      slideEl.style.marginLeft = '';
	    } else {
	      slideEl.style.marginRight = '';
	    }
	    slideEl.style.marginBottom = '';
	    slideEl.style.marginTop = '';
	  });

	  // reset cssMode offsets
	  if (params.centeredSlides && params.cssMode) {
	    setCSSProperty(wrapperEl, '--swiper-centered-offset-before', '');
	    setCSSProperty(wrapperEl, '--swiper-centered-offset-after', '');
	  }
	  const gridEnabled = params.grid && params.grid.rows > 1 && swiper.grid;
	  if (gridEnabled) {
	    swiper.grid.initSlides(slides);
	  } else if (swiper.grid) {
	    swiper.grid.unsetSlides();
	  }

	  // Calc slides
	  let slideSize;
	  const shouldResetSlideSize = params.slidesPerView === 'auto' && params.breakpoints && Object.keys(params.breakpoints).filter(key => {
	    return typeof params.breakpoints[key].slidesPerView !== 'undefined';
	  }).length > 0;
	  for (let i = 0; i < slidesLength; i += 1) {
	    slideSize = 0;
	    let slide;
	    if (slides[i]) slide = slides[i];
	    if (gridEnabled) {
	      swiper.grid.updateSlide(i, slide, slides);
	    }
	    if (slides[i] && elementStyle(slide, 'display') === 'none') continue; // eslint-disable-line

	    if (params.slidesPerView === 'auto') {
	      if (shouldResetSlideSize) {
	        slides[i].style[swiper.getDirectionLabel('width')] = ``;
	      }
	      const slideStyles = getComputedStyle(slide);
	      const currentTransform = slide.style.transform;
	      const currentWebKitTransform = slide.style.webkitTransform;
	      if (currentTransform) {
	        slide.style.transform = 'none';
	      }
	      if (currentWebKitTransform) {
	        slide.style.webkitTransform = 'none';
	      }
	      if (params.roundLengths) {
	        slideSize = swiper.isHorizontal() ? elementOuterSize(slide, 'width') : elementOuterSize(slide, 'height');
	      } else {
	        // eslint-disable-next-line
	        const width = getDirectionPropertyValue(slideStyles, 'width');
	        const paddingLeft = getDirectionPropertyValue(slideStyles, 'padding-left');
	        const paddingRight = getDirectionPropertyValue(slideStyles, 'padding-right');
	        const marginLeft = getDirectionPropertyValue(slideStyles, 'margin-left');
	        const marginRight = getDirectionPropertyValue(slideStyles, 'margin-right');
	        const boxSizing = slideStyles.getPropertyValue('box-sizing');
	        if (boxSizing && boxSizing === 'border-box') {
	          slideSize = width + marginLeft + marginRight;
	        } else {
	          const {
	            clientWidth,
	            offsetWidth
	          } = slide;
	          slideSize = width + paddingLeft + paddingRight + marginLeft + marginRight + (offsetWidth - clientWidth);
	        }
	      }
	      if (currentTransform) {
	        slide.style.transform = currentTransform;
	      }
	      if (currentWebKitTransform) {
	        slide.style.webkitTransform = currentWebKitTransform;
	      }
	      if (params.roundLengths) slideSize = Math.floor(slideSize);
	    } else {
	      slideSize = (swiperSize - (params.slidesPerView - 1) * spaceBetween) / params.slidesPerView;
	      if (params.roundLengths) slideSize = Math.floor(slideSize);
	      if (slides[i]) {
	        slides[i].style[swiper.getDirectionLabel('width')] = `${slideSize}px`;
	      }
	    }
	    if (slides[i]) {
	      slides[i].swiperSlideSize = slideSize;
	    }
	    slidesSizesGrid.push(slideSize);
	    if (params.centeredSlides) {
	      slidePosition = slidePosition + slideSize / 2 + prevSlideSize / 2 + spaceBetween;
	      if (prevSlideSize === 0 && i !== 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
	      if (i === 0) slidePosition = slidePosition - swiperSize / 2 - spaceBetween;
	      if (Math.abs(slidePosition) < 1 / 1000) slidePosition = 0;
	      if (params.roundLengths) slidePosition = Math.floor(slidePosition);
	      if (index % params.slidesPerGroup === 0) snapGrid.push(slidePosition);
	      slidesGrid.push(slidePosition);
	    } else {
	      if (params.roundLengths) slidePosition = Math.floor(slidePosition);
	      if ((index - Math.min(swiper.params.slidesPerGroupSkip, index)) % swiper.params.slidesPerGroup === 0) snapGrid.push(slidePosition);
	      slidesGrid.push(slidePosition);
	      slidePosition = slidePosition + slideSize + spaceBetween;
	    }
	    swiper.virtualSize += slideSize + spaceBetween;
	    prevSlideSize = slideSize;
	    index += 1;
	  }
	  swiper.virtualSize = Math.max(swiper.virtualSize, swiperSize) + offsetAfter;
	  if (rtl && wrongRTL && (params.effect === 'slide' || params.effect === 'coverflow')) {
	    wrapperEl.style.width = `${swiper.virtualSize + spaceBetween}px`;
	  }
	  if (params.setWrapperSize) {
	    wrapperEl.style[swiper.getDirectionLabel('width')] = `${swiper.virtualSize + spaceBetween}px`;
	  }
	  if (gridEnabled) {
	    swiper.grid.updateWrapperSize(slideSize, snapGrid);
	  }

	  // Remove last grid elements depending on width
	  if (!params.centeredSlides) {
	    const newSlidesGrid = [];
	    for (let i = 0; i < snapGrid.length; i += 1) {
	      let slidesGridItem = snapGrid[i];
	      if (params.roundLengths) slidesGridItem = Math.floor(slidesGridItem);
	      if (snapGrid[i] <= swiper.virtualSize - swiperSize) {
	        newSlidesGrid.push(slidesGridItem);
	      }
	    }
	    snapGrid = newSlidesGrid;
	    if (Math.floor(swiper.virtualSize - swiperSize) - Math.floor(snapGrid[snapGrid.length - 1]) > 1) {
	      snapGrid.push(swiper.virtualSize - swiperSize);
	    }
	  }
	  if (isVirtual && params.loop) {
	    const size = slidesSizesGrid[0] + spaceBetween;
	    if (params.slidesPerGroup > 1) {
	      const groups = Math.ceil((swiper.virtual.slidesBefore + swiper.virtual.slidesAfter) / params.slidesPerGroup);
	      const groupSize = size * params.slidesPerGroup;
	      for (let i = 0; i < groups; i += 1) {
	        snapGrid.push(snapGrid[snapGrid.length - 1] + groupSize);
	      }
	    }
	    for (let i = 0; i < swiper.virtual.slidesBefore + swiper.virtual.slidesAfter; i += 1) {
	      if (params.slidesPerGroup === 1) {
	        snapGrid.push(snapGrid[snapGrid.length - 1] + size);
	      }
	      slidesGrid.push(slidesGrid[slidesGrid.length - 1] + size);
	      swiper.virtualSize += size;
	    }
	  }
	  if (snapGrid.length === 0) snapGrid = [0];
	  if (spaceBetween !== 0) {
	    const key = swiper.isHorizontal() && rtl ? 'marginLeft' : swiper.getDirectionLabel('marginRight');
	    slides.filter((_, slideIndex) => {
	      if (!params.cssMode || params.loop) return true;
	      if (slideIndex === slides.length - 1) {
	        return false;
	      }
	      return true;
	    }).forEach(slideEl => {
	      slideEl.style[key] = `${spaceBetween}px`;
	    });
	  }
	  if (params.centeredSlides && params.centeredSlidesBounds) {
	    let allSlidesSize = 0;
	    slidesSizesGrid.forEach(slideSizeValue => {
	      allSlidesSize += slideSizeValue + (spaceBetween || 0);
	    });
	    allSlidesSize -= spaceBetween;
	    const maxSnap = allSlidesSize - swiperSize;
	    snapGrid = snapGrid.map(snap => {
	      if (snap <= 0) return -offsetBefore;
	      if (snap > maxSnap) return maxSnap + offsetAfter;
	      return snap;
	    });
	  }
	  if (params.centerInsufficientSlides) {
	    let allSlidesSize = 0;
	    slidesSizesGrid.forEach(slideSizeValue => {
	      allSlidesSize += slideSizeValue + (spaceBetween || 0);
	    });
	    allSlidesSize -= spaceBetween;
	    const offsetSize = (params.slidesOffsetBefore || 0) + (params.slidesOffsetAfter || 0);
	    if (allSlidesSize + offsetSize < swiperSize) {
	      const allSlidesOffset = (swiperSize - allSlidesSize - offsetSize) / 2;
	      snapGrid.forEach((snap, snapIndex) => {
	        snapGrid[snapIndex] = snap - allSlidesOffset;
	      });
	      slidesGrid.forEach((snap, snapIndex) => {
	        slidesGrid[snapIndex] = snap + allSlidesOffset;
	      });
	    }
	  }
	  Object.assign(swiper, {
	    slides,
	    snapGrid,
	    slidesGrid,
	    slidesSizesGrid
	  });
	  if (params.centeredSlides && params.cssMode && !params.centeredSlidesBounds) {
	    setCSSProperty(wrapperEl, '--swiper-centered-offset-before', `${-snapGrid[0]}px`);
	    setCSSProperty(wrapperEl, '--swiper-centered-offset-after', `${swiper.size / 2 - slidesSizesGrid[slidesSizesGrid.length - 1] / 2}px`);
	    const addToSnapGrid = -swiper.snapGrid[0];
	    const addToSlidesGrid = -swiper.slidesGrid[0];
	    swiper.snapGrid = swiper.snapGrid.map(v => v + addToSnapGrid);
	    swiper.slidesGrid = swiper.slidesGrid.map(v => v + addToSlidesGrid);
	  }
	  if (slidesLength !== previousSlidesLength) {
	    swiper.emit('slidesLengthChange');
	  }
	  if (snapGrid.length !== previousSnapGridLength) {
	    if (swiper.params.watchOverflow) swiper.checkOverflow();
	    swiper.emit('snapGridLengthChange');
	  }
	  if (slidesGrid.length !== previousSlidesGridLength) {
	    swiper.emit('slidesGridLengthChange');
	  }
	  if (params.watchSlidesProgress) {
	    swiper.updateSlidesOffset();
	  }
	  swiper.emit('slidesUpdated');
	  if (!isVirtual && !params.cssMode && (params.effect === 'slide' || params.effect === 'fade')) {
	    const backFaceHiddenClass = `${params.containerModifierClass}backface-hidden`;
	    const hasClassBackfaceClassAdded = swiper.el.classList.contains(backFaceHiddenClass);
	    if (slidesLength <= params.maxBackfaceHiddenSlides) {
	      if (!hasClassBackfaceClassAdded) swiper.el.classList.add(backFaceHiddenClass);
	    } else if (hasClassBackfaceClassAdded) {
	      swiper.el.classList.remove(backFaceHiddenClass);
	    }
	  }
	}
	function updateAutoHeight(speed) {
	  const swiper = this;
	  const activeSlides = [];
	  const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
	  let newHeight = 0;
	  let i;
	  if (typeof speed === 'number') {
	    swiper.setTransition(speed);
	  } else if (speed === true) {
	    swiper.setTransition(swiper.params.speed);
	  }
	  const getSlideByIndex = index => {
	    if (isVirtual) {
	      return swiper.slides[swiper.getSlideIndexByData(index)];
	    }
	    return swiper.slides[index];
	  };
	  // Find slides currently in view
	  if (swiper.params.slidesPerView !== 'auto' && swiper.params.slidesPerView > 1) {
	    if (swiper.params.centeredSlides) {
	      (swiper.visibleSlides || []).forEach(slide => {
	        activeSlides.push(slide);
	      });
	    } else {
	      for (i = 0; i < Math.ceil(swiper.params.slidesPerView); i += 1) {
	        const index = swiper.activeIndex + i;
	        if (index > swiper.slides.length && !isVirtual) break;
	        activeSlides.push(getSlideByIndex(index));
	      }
	    }
	  } else {
	    activeSlides.push(getSlideByIndex(swiper.activeIndex));
	  }

	  // Find new height from highest slide in view
	  for (i = 0; i < activeSlides.length; i += 1) {
	    if (typeof activeSlides[i] !== 'undefined') {
	      const height = activeSlides[i].offsetHeight;
	      newHeight = height > newHeight ? height : newHeight;
	    }
	  }

	  // Update Height
	  if (newHeight || newHeight === 0) swiper.wrapperEl.style.height = `${newHeight}px`;
	}
	function updateSlidesOffset() {
	  const swiper = this;
	  const slides = swiper.slides;
	  // eslint-disable-next-line
	  const minusOffset = swiper.isElement ? swiper.isHorizontal() ? swiper.wrapperEl.offsetLeft : swiper.wrapperEl.offsetTop : 0;
	  for (let i = 0; i < slides.length; i += 1) {
	    slides[i].swiperSlideOffset = (swiper.isHorizontal() ? slides[i].offsetLeft : slides[i].offsetTop) - minusOffset - swiper.cssOverflowAdjustment();
	  }
	}
	const toggleSlideClasses$1 = (slideEl, condition, className) => {
	  if (condition && !slideEl.classList.contains(className)) {
	    slideEl.classList.add(className);
	  } else if (!condition && slideEl.classList.contains(className)) {
	    slideEl.classList.remove(className);
	  }
	};
	function updateSlidesProgress(translate) {
	  if (translate === void 0) {
	    translate = this && this.translate || 0;
	  }
	  const swiper = this;
	  const params = swiper.params;
	  const {
	    slides,
	    rtlTranslate: rtl,
	    snapGrid
	  } = swiper;
	  if (slides.length === 0) return;
	  if (typeof slides[0].swiperSlideOffset === 'undefined') swiper.updateSlidesOffset();
	  let offsetCenter = -translate;
	  if (rtl) offsetCenter = translate;
	  swiper.visibleSlidesIndexes = [];
	  swiper.visibleSlides = [];
	  let spaceBetween = params.spaceBetween;
	  if (typeof spaceBetween === 'string' && spaceBetween.indexOf('%') >= 0) {
	    spaceBetween = parseFloat(spaceBetween.replace('%', '')) / 100 * swiper.size;
	  } else if (typeof spaceBetween === 'string') {
	    spaceBetween = parseFloat(spaceBetween);
	  }
	  for (let i = 0; i < slides.length; i += 1) {
	    const slide = slides[i];
	    let slideOffset = slide.swiperSlideOffset;
	    if (params.cssMode && params.centeredSlides) {
	      slideOffset -= slides[0].swiperSlideOffset;
	    }
	    const slideProgress = (offsetCenter + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + spaceBetween);
	    const originalSlideProgress = (offsetCenter - snapGrid[0] + (params.centeredSlides ? swiper.minTranslate() : 0) - slideOffset) / (slide.swiperSlideSize + spaceBetween);
	    const slideBefore = -(offsetCenter - slideOffset);
	    const slideAfter = slideBefore + swiper.slidesSizesGrid[i];
	    const isFullyVisible = slideBefore >= 0 && slideBefore <= swiper.size - swiper.slidesSizesGrid[i];
	    const isVisible = slideBefore >= 0 && slideBefore < swiper.size - 1 || slideAfter > 1 && slideAfter <= swiper.size || slideBefore <= 0 && slideAfter >= swiper.size;
	    if (isVisible) {
	      swiper.visibleSlides.push(slide);
	      swiper.visibleSlidesIndexes.push(i);
	    }
	    toggleSlideClasses$1(slide, isVisible, params.slideVisibleClass);
	    toggleSlideClasses$1(slide, isFullyVisible, params.slideFullyVisibleClass);
	    slide.progress = rtl ? -slideProgress : slideProgress;
	    slide.originalProgress = rtl ? -originalSlideProgress : originalSlideProgress;
	  }
	}
	function updateProgress(translate) {
	  const swiper = this;
	  if (typeof translate === 'undefined') {
	    const multiplier = swiper.rtlTranslate ? -1 : 1;
	    // eslint-disable-next-line
	    translate = swiper && swiper.translate && swiper.translate * multiplier || 0;
	  }
	  const params = swiper.params;
	  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
	  let {
	    progress,
	    isBeginning,
	    isEnd,
	    progressLoop
	  } = swiper;
	  const wasBeginning = isBeginning;
	  const wasEnd = isEnd;
	  if (translatesDiff === 0) {
	    progress = 0;
	    isBeginning = true;
	    isEnd = true;
	  } else {
	    progress = (translate - swiper.minTranslate()) / translatesDiff;
	    const isBeginningRounded = Math.abs(translate - swiper.minTranslate()) < 1;
	    const isEndRounded = Math.abs(translate - swiper.maxTranslate()) < 1;
	    isBeginning = isBeginningRounded || progress <= 0;
	    isEnd = isEndRounded || progress >= 1;
	    if (isBeginningRounded) progress = 0;
	    if (isEndRounded) progress = 1;
	  }
	  if (params.loop) {
	    const firstSlideIndex = swiper.getSlideIndexByData(0);
	    const lastSlideIndex = swiper.getSlideIndexByData(swiper.slides.length - 1);
	    const firstSlideTranslate = swiper.slidesGrid[firstSlideIndex];
	    const lastSlideTranslate = swiper.slidesGrid[lastSlideIndex];
	    const translateMax = swiper.slidesGrid[swiper.slidesGrid.length - 1];
	    const translateAbs = Math.abs(translate);
	    if (translateAbs >= firstSlideTranslate) {
	      progressLoop = (translateAbs - firstSlideTranslate) / translateMax;
	    } else {
	      progressLoop = (translateAbs + translateMax - lastSlideTranslate) / translateMax;
	    }
	    if (progressLoop > 1) progressLoop -= 1;
	  }
	  Object.assign(swiper, {
	    progress,
	    progressLoop,
	    isBeginning,
	    isEnd
	  });
	  if (params.watchSlidesProgress || params.centeredSlides && params.autoHeight) swiper.updateSlidesProgress(translate);
	  if (isBeginning && !wasBeginning) {
	    swiper.emit('reachBeginning toEdge');
	  }
	  if (isEnd && !wasEnd) {
	    swiper.emit('reachEnd toEdge');
	  }
	  if (wasBeginning && !isBeginning || wasEnd && !isEnd) {
	    swiper.emit('fromEdge');
	  }
	  swiper.emit('progress', progress);
	}
	const toggleSlideClasses = (slideEl, condition, className) => {
	  if (condition && !slideEl.classList.contains(className)) {
	    slideEl.classList.add(className);
	  } else if (!condition && slideEl.classList.contains(className)) {
	    slideEl.classList.remove(className);
	  }
	};
	function updateSlidesClasses() {
	  const swiper = this;
	  const {
	    slides,
	    params,
	    slidesEl,
	    activeIndex
	  } = swiper;
	  const isVirtual = swiper.virtual && params.virtual.enabled;
	  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
	  const getFilteredSlide = selector => {
	    return elementChildren(slidesEl, `.${params.slideClass}${selector}, swiper-slide${selector}`)[0];
	  };
	  let activeSlide;
	  let prevSlide;
	  let nextSlide;
	  if (isVirtual) {
	    if (params.loop) {
	      let slideIndex = activeIndex - swiper.virtual.slidesBefore;
	      if (slideIndex < 0) slideIndex = swiper.virtual.slides.length + slideIndex;
	      if (slideIndex >= swiper.virtual.slides.length) slideIndex -= swiper.virtual.slides.length;
	      activeSlide = getFilteredSlide(`[data-swiper-slide-index="${slideIndex}"]`);
	    } else {
	      activeSlide = getFilteredSlide(`[data-swiper-slide-index="${activeIndex}"]`);
	    }
	  } else {
	    if (gridEnabled) {
	      activeSlide = slides.filter(slideEl => slideEl.column === activeIndex)[0];
	      nextSlide = slides.filter(slideEl => slideEl.column === activeIndex + 1)[0];
	      prevSlide = slides.filter(slideEl => slideEl.column === activeIndex - 1)[0];
	    } else {
	      activeSlide = slides[activeIndex];
	    }
	  }
	  if (activeSlide) {
	    if (!gridEnabled) {
	      // Next Slide
	      nextSlide = elementNextAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
	      if (params.loop && !nextSlide) {
	        nextSlide = slides[0];
	      }

	      // Prev Slide
	      prevSlide = elementPrevAll(activeSlide, `.${params.slideClass}, swiper-slide`)[0];
	      if (params.loop && !prevSlide === 0) {
	        prevSlide = slides[slides.length - 1];
	      }
	    }
	  }
	  slides.forEach(slideEl => {
	    toggleSlideClasses(slideEl, slideEl === activeSlide, params.slideActiveClass);
	    toggleSlideClasses(slideEl, slideEl === nextSlide, params.slideNextClass);
	    toggleSlideClasses(slideEl, slideEl === prevSlide, params.slidePrevClass);
	  });
	  swiper.emitSlidesClasses();
	}
	const processLazyPreloader = (swiper, imageEl) => {
	  if (!swiper || swiper.destroyed || !swiper.params) return;
	  const slideSelector = () => swiper.isElement ? `swiper-slide` : `.${swiper.params.slideClass}`;
	  const slideEl = imageEl.closest(slideSelector());
	  if (slideEl) {
	    let lazyEl = slideEl.querySelector(`.${swiper.params.lazyPreloaderClass}`);
	    if (!lazyEl && swiper.isElement) {
	      if (slideEl.shadowRoot) {
	        lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
	      } else {
	        // init later
	        requestAnimationFrame(() => {
	          if (slideEl.shadowRoot) {
	            lazyEl = slideEl.shadowRoot.querySelector(`.${swiper.params.lazyPreloaderClass}`);
	            if (lazyEl) lazyEl.remove();
	          }
	        });
	      }
	    }
	    if (lazyEl) lazyEl.remove();
	  }
	};
	const unlazy = (swiper, index) => {
	  if (!swiper.slides[index]) return;
	  const imageEl = swiper.slides[index].querySelector('[loading="lazy"]');
	  if (imageEl) imageEl.removeAttribute('loading');
	};
	const preload = swiper => {
	  if (!swiper || swiper.destroyed || !swiper.params) return;
	  let amount = swiper.params.lazyPreloadPrevNext;
	  const len = swiper.slides.length;
	  if (!len || !amount || amount < 0) return;
	  amount = Math.min(amount, len);
	  const slidesPerView = swiper.params.slidesPerView === 'auto' ? swiper.slidesPerViewDynamic() : Math.ceil(swiper.params.slidesPerView);
	  const activeIndex = swiper.activeIndex;
	  if (swiper.params.grid && swiper.params.grid.rows > 1) {
	    const activeColumn = activeIndex;
	    const preloadColumns = [activeColumn - amount];
	    preloadColumns.push(...Array.from({
	      length: amount
	    }).map((_, i) => {
	      return activeColumn + slidesPerView + i;
	    }));
	    swiper.slides.forEach((slideEl, i) => {
	      if (preloadColumns.includes(slideEl.column)) unlazy(swiper, i);
	    });
	    return;
	  }
	  const slideIndexLastInView = activeIndex + slidesPerView - 1;
	  if (swiper.params.rewind || swiper.params.loop) {
	    for (let i = activeIndex - amount; i <= slideIndexLastInView + amount; i += 1) {
	      const realIndex = (i % len + len) % len;
	      if (realIndex < activeIndex || realIndex > slideIndexLastInView) unlazy(swiper, realIndex);
	    }
	  } else {
	    for (let i = Math.max(activeIndex - amount, 0); i <= Math.min(slideIndexLastInView + amount, len - 1); i += 1) {
	      if (i !== activeIndex && (i > slideIndexLastInView || i < activeIndex)) {
	        unlazy(swiper, i);
	      }
	    }
	  }
	};
	function getActiveIndexByTranslate(swiper) {
	  const {
	    slidesGrid,
	    params
	  } = swiper;
	  const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
	  let activeIndex;
	  for (let i = 0; i < slidesGrid.length; i += 1) {
	    if (typeof slidesGrid[i + 1] !== 'undefined') {
	      if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1] - (slidesGrid[i + 1] - slidesGrid[i]) / 2) {
	        activeIndex = i;
	      } else if (translate >= slidesGrid[i] && translate < slidesGrid[i + 1]) {
	        activeIndex = i + 1;
	      }
	    } else if (translate >= slidesGrid[i]) {
	      activeIndex = i;
	    }
	  }
	  // Normalize slideIndex
	  if (params.normalizeSlideIndex) {
	    if (activeIndex < 0 || typeof activeIndex === 'undefined') activeIndex = 0;
	  }
	  return activeIndex;
	}
	function updateActiveIndex(newActiveIndex) {
	  const swiper = this;
	  const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
	  const {
	    snapGrid,
	    params,
	    activeIndex: previousIndex,
	    realIndex: previousRealIndex,
	    snapIndex: previousSnapIndex
	  } = swiper;
	  let activeIndex = newActiveIndex;
	  let snapIndex;
	  const getVirtualRealIndex = aIndex => {
	    let realIndex = aIndex - swiper.virtual.slidesBefore;
	    if (realIndex < 0) {
	      realIndex = swiper.virtual.slides.length + realIndex;
	    }
	    if (realIndex >= swiper.virtual.slides.length) {
	      realIndex -= swiper.virtual.slides.length;
	    }
	    return realIndex;
	  };
	  if (typeof activeIndex === 'undefined') {
	    activeIndex = getActiveIndexByTranslate(swiper);
	  }
	  if (snapGrid.indexOf(translate) >= 0) {
	    snapIndex = snapGrid.indexOf(translate);
	  } else {
	    const skip = Math.min(params.slidesPerGroupSkip, activeIndex);
	    snapIndex = skip + Math.floor((activeIndex - skip) / params.slidesPerGroup);
	  }
	  if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
	  if (activeIndex === previousIndex && !swiper.params.loop) {
	    if (snapIndex !== previousSnapIndex) {
	      swiper.snapIndex = snapIndex;
	      swiper.emit('snapIndexChange');
	    }
	    return;
	  }
	  if (activeIndex === previousIndex && swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) {
	    swiper.realIndex = getVirtualRealIndex(activeIndex);
	    return;
	  }
	  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;

	  // Get real index
	  let realIndex;
	  if (swiper.virtual && params.virtual.enabled && params.loop) {
	    realIndex = getVirtualRealIndex(activeIndex);
	  } else if (gridEnabled) {
	    const firstSlideInColumn = swiper.slides.filter(slideEl => slideEl.column === activeIndex)[0];
	    let activeSlideIndex = parseInt(firstSlideInColumn.getAttribute('data-swiper-slide-index'), 10);
	    if (Number.isNaN(activeSlideIndex)) {
	      activeSlideIndex = Math.max(swiper.slides.indexOf(firstSlideInColumn), 0);
	    }
	    realIndex = Math.floor(activeSlideIndex / params.grid.rows);
	  } else if (swiper.slides[activeIndex]) {
	    const slideIndex = swiper.slides[activeIndex].getAttribute('data-swiper-slide-index');
	    if (slideIndex) {
	      realIndex = parseInt(slideIndex, 10);
	    } else {
	      realIndex = activeIndex;
	    }
	  } else {
	    realIndex = activeIndex;
	  }
	  Object.assign(swiper, {
	    previousSnapIndex,
	    snapIndex,
	    previousRealIndex,
	    realIndex,
	    previousIndex,
	    activeIndex
	  });
	  if (swiper.initialized) {
	    preload(swiper);
	  }
	  swiper.emit('activeIndexChange');
	  swiper.emit('snapIndexChange');
	  if (swiper.initialized || swiper.params.runCallbacksOnInit) {
	    if (previousRealIndex !== realIndex) {
	      swiper.emit('realIndexChange');
	    }
	    swiper.emit('slideChange');
	  }
	}
	function updateClickedSlide(el, path) {
	  const swiper = this;
	  const params = swiper.params;
	  let slide = el.closest(`.${params.slideClass}, swiper-slide`);
	  if (!slide && swiper.isElement && path && path.length > 1 && path.includes(el)) {
	    [...path.slice(path.indexOf(el) + 1, path.length)].forEach(pathEl => {
	      if (!slide && pathEl.matches && pathEl.matches(`.${params.slideClass}, swiper-slide`)) {
	        slide = pathEl;
	      }
	    });
	  }
	  let slideFound = false;
	  let slideIndex;
	  if (slide) {
	    for (let i = 0; i < swiper.slides.length; i += 1) {
	      if (swiper.slides[i] === slide) {
	        slideFound = true;
	        slideIndex = i;
	        break;
	      }
	    }
	  }
	  if (slide && slideFound) {
	    swiper.clickedSlide = slide;
	    if (swiper.virtual && swiper.params.virtual.enabled) {
	      swiper.clickedIndex = parseInt(slide.getAttribute('data-swiper-slide-index'), 10);
	    } else {
	      swiper.clickedIndex = slideIndex;
	    }
	  } else {
	    swiper.clickedSlide = undefined;
	    swiper.clickedIndex = undefined;
	    return;
	  }
	  if (params.slideToClickedSlide && swiper.clickedIndex !== undefined && swiper.clickedIndex !== swiper.activeIndex) {
	    swiper.slideToClickedSlide();
	  }
	}
	var update = {
	  updateSize,
	  updateSlides,
	  updateAutoHeight,
	  updateSlidesOffset,
	  updateSlidesProgress,
	  updateProgress,
	  updateSlidesClasses,
	  updateActiveIndex,
	  updateClickedSlide
	};
	function getSwiperTranslate(axis) {
	  if (axis === void 0) {
	    axis = this.isHorizontal() ? 'x' : 'y';
	  }
	  const swiper = this;
	  const {
	    params,
	    rtlTranslate: rtl,
	    translate,
	    wrapperEl
	  } = swiper;
	  if (params.virtualTranslate) {
	    return rtl ? -translate : translate;
	  }
	  if (params.cssMode) {
	    return translate;
	  }
	  let currentTranslate = getTranslate(wrapperEl, axis);
	  currentTranslate += swiper.cssOverflowAdjustment();
	  if (rtl) currentTranslate = -currentTranslate;
	  return currentTranslate || 0;
	}
	function setTranslate(translate, byController) {
	  const swiper = this;
	  const {
	    rtlTranslate: rtl,
	    params,
	    wrapperEl,
	    progress
	  } = swiper;
	  let x = 0;
	  let y = 0;
	  const z = 0;
	  if (swiper.isHorizontal()) {
	    x = rtl ? -translate : translate;
	  } else {
	    y = translate;
	  }
	  if (params.roundLengths) {
	    x = Math.floor(x);
	    y = Math.floor(y);
	  }
	  swiper.previousTranslate = swiper.translate;
	  swiper.translate = swiper.isHorizontal() ? x : y;
	  if (params.cssMode) {
	    wrapperEl[swiper.isHorizontal() ? 'scrollLeft' : 'scrollTop'] = swiper.isHorizontal() ? -x : -y;
	  } else if (!params.virtualTranslate) {
	    if (swiper.isHorizontal()) {
	      x -= swiper.cssOverflowAdjustment();
	    } else {
	      y -= swiper.cssOverflowAdjustment();
	    }
	    wrapperEl.style.transform = `translate3d(${x}px, ${y}px, ${z}px)`;
	  }

	  // Check if we need to update progress
	  let newProgress;
	  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
	  if (translatesDiff === 0) {
	    newProgress = 0;
	  } else {
	    newProgress = (translate - swiper.minTranslate()) / translatesDiff;
	  }
	  if (newProgress !== progress) {
	    swiper.updateProgress(translate);
	  }
	  swiper.emit('setTranslate', swiper.translate, byController);
	}
	function minTranslate() {
	  return -this.snapGrid[0];
	}
	function maxTranslate() {
	  return -this.snapGrid[this.snapGrid.length - 1];
	}
	function translateTo(translate, speed, runCallbacks, translateBounds, internal) {
	  if (translate === void 0) {
	    translate = 0;
	  }
	  if (speed === void 0) {
	    speed = this.params.speed;
	  }
	  if (runCallbacks === void 0) {
	    runCallbacks = true;
	  }
	  if (translateBounds === void 0) {
	    translateBounds = true;
	  }
	  const swiper = this;
	  const {
	    params,
	    wrapperEl
	  } = swiper;
	  if (swiper.animating && params.preventInteractionOnTransition) {
	    return false;
	  }
	  const minTranslate = swiper.minTranslate();
	  const maxTranslate = swiper.maxTranslate();
	  let newTranslate;
	  if (translateBounds && translate > minTranslate) newTranslate = minTranslate;else if (translateBounds && translate < maxTranslate) newTranslate = maxTranslate;else newTranslate = translate;

	  // Update progress
	  swiper.updateProgress(newTranslate);
	  if (params.cssMode) {
	    const isH = swiper.isHorizontal();
	    if (speed === 0) {
	      wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = -newTranslate;
	    } else {
	      if (!swiper.support.smoothScroll) {
	        animateCSSModeScroll({
	          swiper,
	          targetPosition: -newTranslate,
	          side: isH ? 'left' : 'top'
	        });
	        return true;
	      }
	      wrapperEl.scrollTo({
	        [isH ? 'left' : 'top']: -newTranslate,
	        behavior: 'smooth'
	      });
	    }
	    return true;
	  }
	  if (speed === 0) {
	    swiper.setTransition(0);
	    swiper.setTranslate(newTranslate);
	    if (runCallbacks) {
	      swiper.emit('beforeTransitionStart', speed, internal);
	      swiper.emit('transitionEnd');
	    }
	  } else {
	    swiper.setTransition(speed);
	    swiper.setTranslate(newTranslate);
	    if (runCallbacks) {
	      swiper.emit('beforeTransitionStart', speed, internal);
	      swiper.emit('transitionStart');
	    }
	    if (!swiper.animating) {
	      swiper.animating = true;
	      if (!swiper.onTranslateToWrapperTransitionEnd) {
	        swiper.onTranslateToWrapperTransitionEnd = function transitionEnd(e) {
	          if (!swiper || swiper.destroyed) return;
	          if (e.target !== this) return;
	          swiper.wrapperEl.removeEventListener('transitionend', swiper.onTranslateToWrapperTransitionEnd);
	          swiper.onTranslateToWrapperTransitionEnd = null;
	          delete swiper.onTranslateToWrapperTransitionEnd;
	          swiper.animating = false;
	          if (runCallbacks) {
	            swiper.emit('transitionEnd');
	          }
	        };
	      }
	      swiper.wrapperEl.addEventListener('transitionend', swiper.onTranslateToWrapperTransitionEnd);
	    }
	  }
	  return true;
	}
	var translate = {
	  getTranslate: getSwiperTranslate,
	  setTranslate,
	  minTranslate,
	  maxTranslate,
	  translateTo
	};
	function setTransition(duration, byController) {
	  const swiper = this;
	  if (!swiper.params.cssMode) {
	    swiper.wrapperEl.style.transitionDuration = `${duration}ms`;
	    swiper.wrapperEl.style.transitionDelay = duration === 0 ? `0ms` : '';
	  }
	  swiper.emit('setTransition', duration, byController);
	}
	function transitionEmit(_ref) {
	  let {
	    swiper,
	    runCallbacks,
	    direction,
	    step
	  } = _ref;
	  const {
	    activeIndex,
	    previousIndex
	  } = swiper;
	  let dir = direction;
	  if (!dir) {
	    if (activeIndex > previousIndex) dir = 'next';else if (activeIndex < previousIndex) dir = 'prev';else dir = 'reset';
	  }
	  swiper.emit(`transition${step}`);
	  if (runCallbacks && activeIndex !== previousIndex) {
	    if (dir === 'reset') {
	      swiper.emit(`slideResetTransition${step}`);
	      return;
	    }
	    swiper.emit(`slideChangeTransition${step}`);
	    if (dir === 'next') {
	      swiper.emit(`slideNextTransition${step}`);
	    } else {
	      swiper.emit(`slidePrevTransition${step}`);
	    }
	  }
	}
	function transitionStart(runCallbacks, direction) {
	  if (runCallbacks === void 0) {
	    runCallbacks = true;
	  }
	  const swiper = this;
	  const {
	    params
	  } = swiper;
	  if (params.cssMode) return;
	  if (params.autoHeight) {
	    swiper.updateAutoHeight();
	  }
	  transitionEmit({
	    swiper,
	    runCallbacks,
	    direction,
	    step: 'Start'
	  });
	}
	function transitionEnd(runCallbacks, direction) {
	  if (runCallbacks === void 0) {
	    runCallbacks = true;
	  }
	  const swiper = this;
	  const {
	    params
	  } = swiper;
	  swiper.animating = false;
	  if (params.cssMode) return;
	  swiper.setTransition(0);
	  transitionEmit({
	    swiper,
	    runCallbacks,
	    direction,
	    step: 'End'
	  });
	}
	var transition = {
	  setTransition,
	  transitionStart,
	  transitionEnd
	};
	function slideTo(index, speed, runCallbacks, internal, initial) {
	  if (index === void 0) {
	    index = 0;
	  }
	  if (runCallbacks === void 0) {
	    runCallbacks = true;
	  }
	  if (typeof index === 'string') {
	    index = parseInt(index, 10);
	  }
	  const swiper = this;
	  let slideIndex = index;
	  if (slideIndex < 0) slideIndex = 0;
	  const {
	    params,
	    snapGrid,
	    slidesGrid,
	    previousIndex,
	    activeIndex,
	    rtlTranslate: rtl,
	    wrapperEl,
	    enabled
	  } = swiper;
	  if (!enabled && !internal && !initial || swiper.destroyed || swiper.animating && params.preventInteractionOnTransition) {
	    return false;
	  }
	  if (typeof speed === 'undefined') {
	    speed = swiper.params.speed;
	  }
	  const skip = Math.min(swiper.params.slidesPerGroupSkip, slideIndex);
	  let snapIndex = skip + Math.floor((slideIndex - skip) / swiper.params.slidesPerGroup);
	  if (snapIndex >= snapGrid.length) snapIndex = snapGrid.length - 1;
	  const translate = -snapGrid[snapIndex];
	  // Normalize slideIndex
	  if (params.normalizeSlideIndex) {
	    for (let i = 0; i < slidesGrid.length; i += 1) {
	      const normalizedTranslate = -Math.floor(translate * 100);
	      const normalizedGrid = Math.floor(slidesGrid[i] * 100);
	      const normalizedGridNext = Math.floor(slidesGrid[i + 1] * 100);
	      if (typeof slidesGrid[i + 1] !== 'undefined') {
	        if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext - (normalizedGridNext - normalizedGrid) / 2) {
	          slideIndex = i;
	        } else if (normalizedTranslate >= normalizedGrid && normalizedTranslate < normalizedGridNext) {
	          slideIndex = i + 1;
	        }
	      } else if (normalizedTranslate >= normalizedGrid) {
	        slideIndex = i;
	      }
	    }
	  }
	  // Directions locks
	  if (swiper.initialized && slideIndex !== activeIndex) {
	    if (!swiper.allowSlideNext && (rtl ? translate > swiper.translate && translate > swiper.minTranslate() : translate < swiper.translate && translate < swiper.minTranslate())) {
	      return false;
	    }
	    if (!swiper.allowSlidePrev && translate > swiper.translate && translate > swiper.maxTranslate()) {
	      if ((activeIndex || 0) !== slideIndex) {
	        return false;
	      }
	    }
	  }
	  if (slideIndex !== (previousIndex || 0) && runCallbacks) {
	    swiper.emit('beforeSlideChangeStart');
	  }

	  // Update progress
	  swiper.updateProgress(translate);
	  let direction;
	  if (slideIndex > activeIndex) direction = 'next';else if (slideIndex < activeIndex) direction = 'prev';else direction = 'reset';

	  // Update Index
	  if (rtl && -translate === swiper.translate || !rtl && translate === swiper.translate) {
	    swiper.updateActiveIndex(slideIndex);
	    // Update Height
	    if (params.autoHeight) {
	      swiper.updateAutoHeight();
	    }
	    swiper.updateSlidesClasses();
	    if (params.effect !== 'slide') {
	      swiper.setTranslate(translate);
	    }
	    if (direction !== 'reset') {
	      swiper.transitionStart(runCallbacks, direction);
	      swiper.transitionEnd(runCallbacks, direction);
	    }
	    return false;
	  }
	  if (params.cssMode) {
	    const isH = swiper.isHorizontal();
	    const t = rtl ? translate : -translate;
	    if (speed === 0) {
	      const isVirtual = swiper.virtual && swiper.params.virtual.enabled;
	      if (isVirtual) {
	        swiper.wrapperEl.style.scrollSnapType = 'none';
	        swiper._immediateVirtual = true;
	      }
	      if (isVirtual && !swiper._cssModeVirtualInitialSet && swiper.params.initialSlide > 0) {
	        swiper._cssModeVirtualInitialSet = true;
	        requestAnimationFrame(() => {
	          wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = t;
	        });
	      } else {
	        wrapperEl[isH ? 'scrollLeft' : 'scrollTop'] = t;
	      }
	      if (isVirtual) {
	        requestAnimationFrame(() => {
	          swiper.wrapperEl.style.scrollSnapType = '';
	          swiper._immediateVirtual = false;
	        });
	      }
	    } else {
	      if (!swiper.support.smoothScroll) {
	        animateCSSModeScroll({
	          swiper,
	          targetPosition: t,
	          side: isH ? 'left' : 'top'
	        });
	        return true;
	      }
	      wrapperEl.scrollTo({
	        [isH ? 'left' : 'top']: t,
	        behavior: 'smooth'
	      });
	    }
	    return true;
	  }
	  swiper.setTransition(speed);
	  swiper.setTranslate(translate);
	  swiper.updateActiveIndex(slideIndex);
	  swiper.updateSlidesClasses();
	  swiper.emit('beforeTransitionStart', speed, internal);
	  swiper.transitionStart(runCallbacks, direction);
	  if (speed === 0) {
	    swiper.transitionEnd(runCallbacks, direction);
	  } else if (!swiper.animating) {
	    swiper.animating = true;
	    if (!swiper.onSlideToWrapperTransitionEnd) {
	      swiper.onSlideToWrapperTransitionEnd = function transitionEnd(e) {
	        if (!swiper || swiper.destroyed) return;
	        if (e.target !== this) return;
	        swiper.wrapperEl.removeEventListener('transitionend', swiper.onSlideToWrapperTransitionEnd);
	        swiper.onSlideToWrapperTransitionEnd = null;
	        delete swiper.onSlideToWrapperTransitionEnd;
	        swiper.transitionEnd(runCallbacks, direction);
	      };
	    }
	    swiper.wrapperEl.addEventListener('transitionend', swiper.onSlideToWrapperTransitionEnd);
	  }
	  return true;
	}
	function slideToLoop(index, speed, runCallbacks, internal) {
	  if (index === void 0) {
	    index = 0;
	  }
	  if (runCallbacks === void 0) {
	    runCallbacks = true;
	  }
	  if (typeof index === 'string') {
	    const indexAsNumber = parseInt(index, 10);
	    index = indexAsNumber;
	  }
	  const swiper = this;
	  if (swiper.destroyed) return;
	  if (typeof speed === 'undefined') {
	    speed = swiper.params.speed;
	  }
	  const gridEnabled = swiper.grid && swiper.params.grid && swiper.params.grid.rows > 1;
	  let newIndex = index;
	  if (swiper.params.loop) {
	    if (swiper.virtual && swiper.params.virtual.enabled) {
	      // eslint-disable-next-line
	      newIndex = newIndex + swiper.virtual.slidesBefore;
	    } else {
	      let targetSlideIndex;
	      if (gridEnabled) {
	        const slideIndex = newIndex * swiper.params.grid.rows;
	        targetSlideIndex = swiper.slides.filter(slideEl => slideEl.getAttribute('data-swiper-slide-index') * 1 === slideIndex)[0].column;
	      } else {
	        targetSlideIndex = swiper.getSlideIndexByData(newIndex);
	      }
	      const cols = gridEnabled ? Math.ceil(swiper.slides.length / swiper.params.grid.rows) : swiper.slides.length;
	      const {
	        centeredSlides
	      } = swiper.params;
	      let slidesPerView = swiper.params.slidesPerView;
	      if (slidesPerView === 'auto') {
	        slidesPerView = swiper.slidesPerViewDynamic();
	      } else {
	        slidesPerView = Math.ceil(parseFloat(swiper.params.slidesPerView, 10));
	        if (centeredSlides && slidesPerView % 2 === 0) {
	          slidesPerView = slidesPerView + 1;
	        }
	      }
	      let needLoopFix = cols - targetSlideIndex < slidesPerView;
	      if (centeredSlides) {
	        needLoopFix = needLoopFix || targetSlideIndex < Math.ceil(slidesPerView / 2);
	      }
	      if (internal && centeredSlides && swiper.params.slidesPerView !== 'auto' && !gridEnabled) {
	        needLoopFix = false;
	      }
	      if (needLoopFix) {
	        const direction = centeredSlides ? targetSlideIndex < swiper.activeIndex ? 'prev' : 'next' : targetSlideIndex - swiper.activeIndex - 1 < swiper.params.slidesPerView ? 'next' : 'prev';
	        swiper.loopFix({
	          direction,
	          slideTo: true,
	          activeSlideIndex: direction === 'next' ? targetSlideIndex + 1 : targetSlideIndex - cols + 1,
	          slideRealIndex: direction === 'next' ? swiper.realIndex : undefined
	        });
	      }
	      if (gridEnabled) {
	        const slideIndex = newIndex * swiper.params.grid.rows;
	        newIndex = swiper.slides.filter(slideEl => slideEl.getAttribute('data-swiper-slide-index') * 1 === slideIndex)[0].column;
	      } else {
	        newIndex = swiper.getSlideIndexByData(newIndex);
	      }
	    }
	  }
	  requestAnimationFrame(() => {
	    swiper.slideTo(newIndex, speed, runCallbacks, internal);
	  });
	  return swiper;
	}

	/* eslint no-unused-vars: "off" */
	function slideNext(speed, runCallbacks, internal) {
	  if (runCallbacks === void 0) {
	    runCallbacks = true;
	  }
	  const swiper = this;
	  const {
	    enabled,
	    params,
	    animating
	  } = swiper;
	  if (!enabled || swiper.destroyed) return swiper;
	  if (typeof speed === 'undefined') {
	    speed = swiper.params.speed;
	  }
	  let perGroup = params.slidesPerGroup;
	  if (params.slidesPerView === 'auto' && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
	    perGroup = Math.max(swiper.slidesPerViewDynamic('current', true), 1);
	  }
	  const increment = swiper.activeIndex < params.slidesPerGroupSkip ? 1 : perGroup;
	  const isVirtual = swiper.virtual && params.virtual.enabled;
	  if (params.loop) {
	    if (animating && !isVirtual && params.loopPreventsSliding) return false;
	    swiper.loopFix({
	      direction: 'next'
	    });
	    // eslint-disable-next-line
	    swiper._clientLeft = swiper.wrapperEl.clientLeft;
	    if (swiper.activeIndex === swiper.slides.length - 1 && params.cssMode) {
	      requestAnimationFrame(() => {
	        swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
	      });
	      return true;
	    }
	  }
	  if (params.rewind && swiper.isEnd) {
	    return swiper.slideTo(0, speed, runCallbacks, internal);
	  }
	  return swiper.slideTo(swiper.activeIndex + increment, speed, runCallbacks, internal);
	}

	/* eslint no-unused-vars: "off" */
	function slidePrev(speed, runCallbacks, internal) {
	  if (runCallbacks === void 0) {
	    runCallbacks = true;
	  }
	  const swiper = this;
	  const {
	    params,
	    snapGrid,
	    slidesGrid,
	    rtlTranslate,
	    enabled,
	    animating
	  } = swiper;
	  if (!enabled || swiper.destroyed) return swiper;
	  if (typeof speed === 'undefined') {
	    speed = swiper.params.speed;
	  }
	  const isVirtual = swiper.virtual && params.virtual.enabled;
	  if (params.loop) {
	    if (animating && !isVirtual && params.loopPreventsSliding) return false;
	    swiper.loopFix({
	      direction: 'prev'
	    });
	    // eslint-disable-next-line
	    swiper._clientLeft = swiper.wrapperEl.clientLeft;
	  }
	  const translate = rtlTranslate ? swiper.translate : -swiper.translate;
	  function normalize(val) {
	    if (val < 0) return -Math.floor(Math.abs(val));
	    return Math.floor(val);
	  }
	  const normalizedTranslate = normalize(translate);
	  const normalizedSnapGrid = snapGrid.map(val => normalize(val));
	  let prevSnap = snapGrid[normalizedSnapGrid.indexOf(normalizedTranslate) - 1];
	  if (typeof prevSnap === 'undefined' && params.cssMode) {
	    let prevSnapIndex;
	    snapGrid.forEach((snap, snapIndex) => {
	      if (normalizedTranslate >= snap) {
	        // prevSnap = snap;
	        prevSnapIndex = snapIndex;
	      }
	    });
	    if (typeof prevSnapIndex !== 'undefined') {
	      prevSnap = snapGrid[prevSnapIndex > 0 ? prevSnapIndex - 1 : prevSnapIndex];
	    }
	  }
	  let prevIndex = 0;
	  if (typeof prevSnap !== 'undefined') {
	    prevIndex = slidesGrid.indexOf(prevSnap);
	    if (prevIndex < 0) prevIndex = swiper.activeIndex - 1;
	    if (params.slidesPerView === 'auto' && params.slidesPerGroup === 1 && params.slidesPerGroupAuto) {
	      prevIndex = prevIndex - swiper.slidesPerViewDynamic('previous', true) + 1;
	      prevIndex = Math.max(prevIndex, 0);
	    }
	  }
	  if (params.rewind && swiper.isBeginning) {
	    const lastIndex = swiper.params.virtual && swiper.params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
	    return swiper.slideTo(lastIndex, speed, runCallbacks, internal);
	  } else if (params.loop && swiper.activeIndex === 0 && params.cssMode) {
	    requestAnimationFrame(() => {
	      swiper.slideTo(prevIndex, speed, runCallbacks, internal);
	    });
	    return true;
	  }
	  return swiper.slideTo(prevIndex, speed, runCallbacks, internal);
	}

	/* eslint no-unused-vars: "off" */
	function slideReset(speed, runCallbacks, internal) {
	  if (runCallbacks === void 0) {
	    runCallbacks = true;
	  }
	  const swiper = this;
	  if (swiper.destroyed) return;
	  if (typeof speed === 'undefined') {
	    speed = swiper.params.speed;
	  }
	  return swiper.slideTo(swiper.activeIndex, speed, runCallbacks, internal);
	}

	/* eslint no-unused-vars: "off" */
	function slideToClosest(speed, runCallbacks, internal, threshold) {
	  if (runCallbacks === void 0) {
	    runCallbacks = true;
	  }
	  if (threshold === void 0) {
	    threshold = 0.5;
	  }
	  const swiper = this;
	  if (swiper.destroyed) return;
	  if (typeof speed === 'undefined') {
	    speed = swiper.params.speed;
	  }
	  let index = swiper.activeIndex;
	  const skip = Math.min(swiper.params.slidesPerGroupSkip, index);
	  const snapIndex = skip + Math.floor((index - skip) / swiper.params.slidesPerGroup);
	  const translate = swiper.rtlTranslate ? swiper.translate : -swiper.translate;
	  if (translate >= swiper.snapGrid[snapIndex]) {
	    // The current translate is on or after the current snap index, so the choice
	    // is between the current index and the one after it.
	    const currentSnap = swiper.snapGrid[snapIndex];
	    const nextSnap = swiper.snapGrid[snapIndex + 1];
	    if (translate - currentSnap > (nextSnap - currentSnap) * threshold) {
	      index += swiper.params.slidesPerGroup;
	    }
	  } else {
	    // The current translate is before the current snap index, so the choice
	    // is between the current index and the one before it.
	    const prevSnap = swiper.snapGrid[snapIndex - 1];
	    const currentSnap = swiper.snapGrid[snapIndex];
	    if (translate - prevSnap <= (currentSnap - prevSnap) * threshold) {
	      index -= swiper.params.slidesPerGroup;
	    }
	  }
	  index = Math.max(index, 0);
	  index = Math.min(index, swiper.slidesGrid.length - 1);
	  return swiper.slideTo(index, speed, runCallbacks, internal);
	}
	function slideToClickedSlide() {
	  const swiper = this;
	  if (swiper.destroyed) return;
	  const {
	    params,
	    slidesEl
	  } = swiper;
	  const slidesPerView = params.slidesPerView === 'auto' ? swiper.slidesPerViewDynamic() : params.slidesPerView;
	  let slideToIndex = swiper.clickedIndex;
	  let realIndex;
	  const slideSelector = swiper.isElement ? `swiper-slide` : `.${params.slideClass}`;
	  if (params.loop) {
	    if (swiper.animating) return;
	    realIndex = parseInt(swiper.clickedSlide.getAttribute('data-swiper-slide-index'), 10);
	    if (params.centeredSlides) {
	      if (slideToIndex < swiper.loopedSlides - slidesPerView / 2 || slideToIndex > swiper.slides.length - swiper.loopedSlides + slidesPerView / 2) {
	        swiper.loopFix();
	        slideToIndex = swiper.getSlideIndex(elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
	        nextTick(() => {
	          swiper.slideTo(slideToIndex);
	        });
	      } else {
	        swiper.slideTo(slideToIndex);
	      }
	    } else if (slideToIndex > swiper.slides.length - slidesPerView) {
	      swiper.loopFix();
	      slideToIndex = swiper.getSlideIndex(elementChildren(slidesEl, `${slideSelector}[data-swiper-slide-index="${realIndex}"]`)[0]);
	      nextTick(() => {
	        swiper.slideTo(slideToIndex);
	      });
	    } else {
	      swiper.slideTo(slideToIndex);
	    }
	  } else {
	    swiper.slideTo(slideToIndex);
	  }
	}
	var slide = {
	  slideTo,
	  slideToLoop,
	  slideNext,
	  slidePrev,
	  slideReset,
	  slideToClosest,
	  slideToClickedSlide
	};
	function loopCreate(slideRealIndex) {
	  const swiper = this;
	  const {
	    params,
	    slidesEl
	  } = swiper;
	  if (!params.loop || swiper.virtual && swiper.params.virtual.enabled) return;
	  const initSlides = () => {
	    const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
	    slides.forEach((el, index) => {
	      el.setAttribute('data-swiper-slide-index', index);
	    });
	  };
	  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
	  const slidesPerGroup = params.slidesPerGroup * (gridEnabled ? params.grid.rows : 1);
	  const shouldFillGroup = swiper.slides.length % slidesPerGroup !== 0;
	  const shouldFillGrid = gridEnabled && swiper.slides.length % params.grid.rows !== 0;
	  const addBlankSlides = amountOfSlides => {
	    for (let i = 0; i < amountOfSlides; i += 1) {
	      const slideEl = swiper.isElement ? createElement('swiper-slide', [params.slideBlankClass]) : createElement('div', [params.slideClass, params.slideBlankClass]);
	      swiper.slidesEl.append(slideEl);
	    }
	  };
	  if (shouldFillGroup) {
	    if (params.loopAddBlankSlides) {
	      const slidesToAdd = slidesPerGroup - swiper.slides.length % slidesPerGroup;
	      addBlankSlides(slidesToAdd);
	      swiper.recalcSlides();
	      swiper.updateSlides();
	    } else {
	      showWarning('Swiper Loop Warning: The number of slides is not even to slidesPerGroup, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)');
	    }
	    initSlides();
	  } else if (shouldFillGrid) {
	    if (params.loopAddBlankSlides) {
	      const slidesToAdd = params.grid.rows - swiper.slides.length % params.grid.rows;
	      addBlankSlides(slidesToAdd);
	      swiper.recalcSlides();
	      swiper.updateSlides();
	    } else {
	      showWarning('Swiper Loop Warning: The number of slides is not even to grid.rows, loop mode may not function properly. You need to add more slides (or make duplicates, or empty slides)');
	    }
	    initSlides();
	  } else {
	    initSlides();
	  }
	  swiper.loopFix({
	    slideRealIndex,
	    direction: params.centeredSlides ? undefined : 'next'
	  });
	}
	function loopFix(_temp) {
	  let {
	    slideRealIndex,
	    slideTo = true,
	    direction,
	    setTranslate,
	    activeSlideIndex,
	    byController,
	    byMousewheel
	  } = _temp === void 0 ? {} : _temp;
	  const swiper = this;
	  if (!swiper.params.loop) return;
	  swiper.emit('beforeLoopFix');
	  const {
	    slides,
	    allowSlidePrev,
	    allowSlideNext,
	    slidesEl,
	    params
	  } = swiper;
	  const {
	    centeredSlides
	  } = params;
	  swiper.allowSlidePrev = true;
	  swiper.allowSlideNext = true;
	  if (swiper.virtual && params.virtual.enabled) {
	    if (slideTo) {
	      if (!params.centeredSlides && swiper.snapIndex === 0) {
	        swiper.slideTo(swiper.virtual.slides.length, 0, false, true);
	      } else if (params.centeredSlides && swiper.snapIndex < params.slidesPerView) {
	        swiper.slideTo(swiper.virtual.slides.length + swiper.snapIndex, 0, false, true);
	      } else if (swiper.snapIndex === swiper.snapGrid.length - 1) {
	        swiper.slideTo(swiper.virtual.slidesBefore, 0, false, true);
	      }
	    }
	    swiper.allowSlidePrev = allowSlidePrev;
	    swiper.allowSlideNext = allowSlideNext;
	    swiper.emit('loopFix');
	    return;
	  }
	  let slidesPerView = params.slidesPerView;
	  if (slidesPerView === 'auto') {
	    slidesPerView = swiper.slidesPerViewDynamic();
	  } else {
	    slidesPerView = Math.ceil(parseFloat(params.slidesPerView, 10));
	    if (centeredSlides && slidesPerView % 2 === 0) {
	      slidesPerView = slidesPerView + 1;
	    }
	  }
	  const slidesPerGroup = params.slidesPerGroupAuto ? slidesPerView : params.slidesPerGroup;
	  let loopedSlides = slidesPerGroup;
	  if (loopedSlides % slidesPerGroup !== 0) {
	    loopedSlides += slidesPerGroup - loopedSlides % slidesPerGroup;
	  }
	  loopedSlides += params.loopAdditionalSlides;
	  swiper.loopedSlides = loopedSlides;
	  const gridEnabled = swiper.grid && params.grid && params.grid.rows > 1;
	  if (slides.length < slidesPerView + loopedSlides) {
	    showWarning('Swiper Loop Warning: The number of slides is not enough for loop mode, it will be disabled and not function properly. You need to add more slides (or make duplicates) or lower the values of slidesPerView and slidesPerGroup parameters');
	  } else if (gridEnabled && params.grid.fill === 'row') {
	    showWarning('Swiper Loop Warning: Loop mode is not compatible with grid.fill = `row`');
	  }
	  const prependSlidesIndexes = [];
	  const appendSlidesIndexes = [];
	  let activeIndex = swiper.activeIndex;
	  if (typeof activeSlideIndex === 'undefined') {
	    activeSlideIndex = swiper.getSlideIndex(slides.filter(el => el.classList.contains(params.slideActiveClass))[0]);
	  } else {
	    activeIndex = activeSlideIndex;
	  }
	  const isNext = direction === 'next' || !direction;
	  const isPrev = direction === 'prev' || !direction;
	  let slidesPrepended = 0;
	  let slidesAppended = 0;
	  const cols = gridEnabled ? Math.ceil(slides.length / params.grid.rows) : slides.length;
	  const activeColIndex = gridEnabled ? slides[activeSlideIndex].column : activeSlideIndex;
	  const activeColIndexWithShift = activeColIndex + (centeredSlides && typeof setTranslate === 'undefined' ? -slidesPerView / 2 + 0.5 : 0);
	  // prepend last slides before start
	  if (activeColIndexWithShift < loopedSlides) {
	    slidesPrepended = Math.max(loopedSlides - activeColIndexWithShift, slidesPerGroup);
	    for (let i = 0; i < loopedSlides - activeColIndexWithShift; i += 1) {
	      const index = i - Math.floor(i / cols) * cols;
	      if (gridEnabled) {
	        const colIndexToPrepend = cols - index - 1;
	        for (let i = slides.length - 1; i >= 0; i -= 1) {
	          if (slides[i].column === colIndexToPrepend) prependSlidesIndexes.push(i);
	        }
	        // slides.forEach((slide, slideIndex) => {
	        //   if (slide.column === colIndexToPrepend) prependSlidesIndexes.push(slideIndex);
	        // });
	      } else {
	        prependSlidesIndexes.push(cols - index - 1);
	      }
	    }
	  } else if (activeColIndexWithShift + slidesPerView > cols - loopedSlides) {
	    slidesAppended = Math.max(activeColIndexWithShift - (cols - loopedSlides * 2), slidesPerGroup);
	    for (let i = 0; i < slidesAppended; i += 1) {
	      const index = i - Math.floor(i / cols) * cols;
	      if (gridEnabled) {
	        slides.forEach((slide, slideIndex) => {
	          if (slide.column === index) appendSlidesIndexes.push(slideIndex);
	        });
	      } else {
	        appendSlidesIndexes.push(index);
	      }
	    }
	  }
	  swiper.__preventObserver__ = true;
	  requestAnimationFrame(() => {
	    swiper.__preventObserver__ = false;
	  });
	  if (isPrev) {
	    prependSlidesIndexes.forEach(index => {
	      slides[index].swiperLoopMoveDOM = true;
	      slidesEl.prepend(slides[index]);
	      slides[index].swiperLoopMoveDOM = false;
	    });
	  }
	  if (isNext) {
	    appendSlidesIndexes.forEach(index => {
	      slides[index].swiperLoopMoveDOM = true;
	      slidesEl.append(slides[index]);
	      slides[index].swiperLoopMoveDOM = false;
	    });
	  }
	  swiper.recalcSlides();
	  if (params.slidesPerView === 'auto') {
	    swiper.updateSlides();
	  } else if (gridEnabled && (prependSlidesIndexes.length > 0 && isPrev || appendSlidesIndexes.length > 0 && isNext)) {
	    swiper.slides.forEach((slide, slideIndex) => {
	      swiper.grid.updateSlide(slideIndex, slide, swiper.slides);
	    });
	  }
	  if (params.watchSlidesProgress) {
	    swiper.updateSlidesOffset();
	  }
	  if (slideTo) {
	    if (prependSlidesIndexes.length > 0 && isPrev) {
	      if (typeof slideRealIndex === 'undefined') {
	        const currentSlideTranslate = swiper.slidesGrid[activeIndex];
	        const newSlideTranslate = swiper.slidesGrid[activeIndex + slidesPrepended];
	        const diff = newSlideTranslate - currentSlideTranslate;
	        if (byMousewheel) {
	          swiper.setTranslate(swiper.translate - diff);
	        } else {
	          swiper.slideTo(activeIndex + Math.ceil(slidesPrepended), 0, false, true);
	          if (setTranslate) {
	            swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
	            swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
	          }
	        }
	      } else {
	        if (setTranslate) {
	          const shift = gridEnabled ? prependSlidesIndexes.length / params.grid.rows : prependSlidesIndexes.length;
	          swiper.slideTo(swiper.activeIndex + shift, 0, false, true);
	          swiper.touchEventsData.currentTranslate = swiper.translate;
	        }
	      }
	    } else if (appendSlidesIndexes.length > 0 && isNext) {
	      if (typeof slideRealIndex === 'undefined') {
	        const currentSlideTranslate = swiper.slidesGrid[activeIndex];
	        const newSlideTranslate = swiper.slidesGrid[activeIndex - slidesAppended];
	        const diff = newSlideTranslate - currentSlideTranslate;
	        if (byMousewheel) {
	          swiper.setTranslate(swiper.translate - diff);
	        } else {
	          swiper.slideTo(activeIndex - slidesAppended, 0, false, true);
	          if (setTranslate) {
	            swiper.touchEventsData.startTranslate = swiper.touchEventsData.startTranslate - diff;
	            swiper.touchEventsData.currentTranslate = swiper.touchEventsData.currentTranslate - diff;
	          }
	        }
	      } else {
	        const shift = gridEnabled ? appendSlidesIndexes.length / params.grid.rows : appendSlidesIndexes.length;
	        swiper.slideTo(swiper.activeIndex - shift, 0, false, true);
	      }
	    }
	  }
	  swiper.allowSlidePrev = allowSlidePrev;
	  swiper.allowSlideNext = allowSlideNext;
	  if (swiper.controller && swiper.controller.control && !byController) {
	    const loopParams = {
	      slideRealIndex,
	      direction,
	      setTranslate,
	      activeSlideIndex,
	      byController: true
	    };
	    if (Array.isArray(swiper.controller.control)) {
	      swiper.controller.control.forEach(c => {
	        if (!c.destroyed && c.params.loop) c.loopFix({
	          ...loopParams,
	          slideTo: c.params.slidesPerView === params.slidesPerView ? slideTo : false
	        });
	      });
	    } else if (swiper.controller.control instanceof swiper.constructor && swiper.controller.control.params.loop) {
	      swiper.controller.control.loopFix({
	        ...loopParams,
	        slideTo: swiper.controller.control.params.slidesPerView === params.slidesPerView ? slideTo : false
	      });
	    }
	  }
	  swiper.emit('loopFix');
	}
	function loopDestroy() {
	  const swiper = this;
	  const {
	    params,
	    slidesEl
	  } = swiper;
	  if (!params.loop || swiper.virtual && swiper.params.virtual.enabled) return;
	  swiper.recalcSlides();
	  const newSlidesOrder = [];
	  swiper.slides.forEach(slideEl => {
	    const index = typeof slideEl.swiperSlideIndex === 'undefined' ? slideEl.getAttribute('data-swiper-slide-index') * 1 : slideEl.swiperSlideIndex;
	    newSlidesOrder[index] = slideEl;
	  });
	  swiper.slides.forEach(slideEl => {
	    slideEl.removeAttribute('data-swiper-slide-index');
	  });
	  newSlidesOrder.forEach(slideEl => {
	    slidesEl.append(slideEl);
	  });
	  swiper.recalcSlides();
	  swiper.slideTo(swiper.realIndex, 0);
	}
	var loop = {
	  loopCreate,
	  loopFix,
	  loopDestroy
	};
	function setGrabCursor(moving) {
	  const swiper = this;
	  if (!swiper.params.simulateTouch || swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) return;
	  const el = swiper.params.touchEventsTarget === 'container' ? swiper.el : swiper.wrapperEl;
	  if (swiper.isElement) {
	    swiper.__preventObserver__ = true;
	  }
	  el.style.cursor = 'move';
	  el.style.cursor = moving ? 'grabbing' : 'grab';
	  if (swiper.isElement) {
	    requestAnimationFrame(() => {
	      swiper.__preventObserver__ = false;
	    });
	  }
	}
	function unsetGrabCursor() {
	  const swiper = this;
	  if (swiper.params.watchOverflow && swiper.isLocked || swiper.params.cssMode) {
	    return;
	  }
	  if (swiper.isElement) {
	    swiper.__preventObserver__ = true;
	  }
	  swiper[swiper.params.touchEventsTarget === 'container' ? 'el' : 'wrapperEl'].style.cursor = '';
	  if (swiper.isElement) {
	    requestAnimationFrame(() => {
	      swiper.__preventObserver__ = false;
	    });
	  }
	}
	var grabCursor = {
	  setGrabCursor,
	  unsetGrabCursor
	};

	// Modified from https://stackoverflow.com/questions/54520554/custom-element-getrootnode-closest-function-crossing-multiple-parent-shadowd
	function closestElement(selector, base) {
	  if (base === void 0) {
	    base = this;
	  }
	  function __closestFrom(el) {
	    if (!el || el === getDocument() || el === getWindow()) return null;
	    if (el.assignedSlot) el = el.assignedSlot;
	    const found = el.closest(selector);
	    if (!found && !el.getRootNode) {
	      return null;
	    }
	    return found || __closestFrom(el.getRootNode().host);
	  }
	  return __closestFrom(base);
	}
	function preventEdgeSwipe(swiper, event, startX) {
	  const window = getWindow();
	  const {
	    params
	  } = swiper;
	  const edgeSwipeDetection = params.edgeSwipeDetection;
	  const edgeSwipeThreshold = params.edgeSwipeThreshold;
	  if (edgeSwipeDetection && (startX <= edgeSwipeThreshold || startX >= window.innerWidth - edgeSwipeThreshold)) {
	    if (edgeSwipeDetection === 'prevent') {
	      event.preventDefault();
	      return true;
	    }
	    return false;
	  }
	  return true;
	}
	function onTouchStart(event) {
	  const swiper = this;
	  const document = getDocument();
	  let e = event;
	  if (e.originalEvent) e = e.originalEvent;
	  const data = swiper.touchEventsData;
	  if (e.type === 'pointerdown') {
	    if (data.pointerId !== null && data.pointerId !== e.pointerId) {
	      return;
	    }
	    data.pointerId = e.pointerId;
	  } else if (e.type === 'touchstart' && e.targetTouches.length === 1) {
	    data.touchId = e.targetTouches[0].identifier;
	  }
	  if (e.type === 'touchstart') {
	    // don't proceed touch event
	    preventEdgeSwipe(swiper, e, e.targetTouches[0].pageX);
	    return;
	  }
	  const {
	    params,
	    touches,
	    enabled
	  } = swiper;
	  if (!enabled) return;
	  if (!params.simulateTouch && e.pointerType === 'mouse') return;
	  if (swiper.animating && params.preventInteractionOnTransition) {
	    return;
	  }
	  if (!swiper.animating && params.cssMode && params.loop) {
	    swiper.loopFix();
	  }
	  let targetEl = e.target;
	  if (params.touchEventsTarget === 'wrapper') {
	    if (!swiper.wrapperEl.contains(targetEl)) return;
	  }
	  if ('which' in e && e.which === 3) return;
	  if ('button' in e && e.button > 0) return;
	  if (data.isTouched && data.isMoved) return;

	  // change target el for shadow root component
	  const swipingClassHasValue = !!params.noSwipingClass && params.noSwipingClass !== '';
	  // eslint-disable-next-line
	  const eventPath = e.composedPath ? e.composedPath() : e.path;
	  if (swipingClassHasValue && e.target && e.target.shadowRoot && eventPath) {
	    targetEl = eventPath[0];
	  }
	  const noSwipingSelector = params.noSwipingSelector ? params.noSwipingSelector : `.${params.noSwipingClass}`;
	  const isTargetShadow = !!(e.target && e.target.shadowRoot);

	  // use closestElement for shadow root element to get the actual closest for nested shadow root element
	  if (params.noSwiping && (isTargetShadow ? closestElement(noSwipingSelector, targetEl) : targetEl.closest(noSwipingSelector))) {
	    swiper.allowClick = true;
	    return;
	  }
	  if (params.swipeHandler) {
	    if (!targetEl.closest(params.swipeHandler)) return;
	  }
	  touches.currentX = e.pageX;
	  touches.currentY = e.pageY;
	  const startX = touches.currentX;
	  const startY = touches.currentY;

	  // Do NOT start if iOS edge swipe is detected. Otherwise iOS app cannot swipe-to-go-back anymore

	  if (!preventEdgeSwipe(swiper, e, startX)) {
	    return;
	  }
	  Object.assign(data, {
	    isTouched: true,
	    isMoved: false,
	    allowTouchCallbacks: true,
	    isScrolling: undefined,
	    startMoving: undefined
	  });
	  touches.startX = startX;
	  touches.startY = startY;
	  data.touchStartTime = now();
	  swiper.allowClick = true;
	  swiper.updateSize();
	  swiper.swipeDirection = undefined;
	  if (params.threshold > 0) data.allowThresholdMove = false;
	  let preventDefault = true;
	  if (targetEl.matches(data.focusableElements)) {
	    preventDefault = false;
	    if (targetEl.nodeName === 'SELECT') {
	      data.isTouched = false;
	    }
	  }
	  if (document.activeElement && document.activeElement.matches(data.focusableElements) && document.activeElement !== targetEl) {
	    document.activeElement.blur();
	  }
	  const shouldPreventDefault = preventDefault && swiper.allowTouchMove && params.touchStartPreventDefault;
	  if ((params.touchStartForcePreventDefault || shouldPreventDefault) && !targetEl.isContentEditable) {
	    e.preventDefault();
	  }
	  if (params.freeMode && params.freeMode.enabled && swiper.freeMode && swiper.animating && !params.cssMode) {
	    swiper.freeMode.onTouchStart();
	  }
	  swiper.emit('touchStart', e);
	}
	function onTouchMove(event) {
	  const document = getDocument();
	  const swiper = this;
	  const data = swiper.touchEventsData;
	  const {
	    params,
	    touches,
	    rtlTranslate: rtl,
	    enabled
	  } = swiper;
	  if (!enabled) return;
	  if (!params.simulateTouch && event.pointerType === 'mouse') return;
	  let e = event;
	  if (e.originalEvent) e = e.originalEvent;
	  if (e.type === 'pointermove') {
	    if (data.touchId !== null) return; // return from pointer if we use touch
	    const id = e.pointerId;
	    if (id !== data.pointerId) return;
	  }
	  let targetTouch;
	  if (e.type === 'touchmove') {
	    targetTouch = [...e.changedTouches].filter(t => t.identifier === data.touchId)[0];
	    if (!targetTouch || targetTouch.identifier !== data.touchId) return;
	  } else {
	    targetTouch = e;
	  }
	  if (!data.isTouched) {
	    if (data.startMoving && data.isScrolling) {
	      swiper.emit('touchMoveOpposite', e);
	    }
	    return;
	  }
	  const pageX = targetTouch.pageX;
	  const pageY = targetTouch.pageY;
	  if (e.preventedByNestedSwiper) {
	    touches.startX = pageX;
	    touches.startY = pageY;
	    return;
	  }
	  if (!swiper.allowTouchMove) {
	    if (!e.target.matches(data.focusableElements)) {
	      swiper.allowClick = false;
	    }
	    if (data.isTouched) {
	      Object.assign(touches, {
	        startX: pageX,
	        startY: pageY,
	        currentX: pageX,
	        currentY: pageY
	      });
	      data.touchStartTime = now();
	    }
	    return;
	  }
	  if (params.touchReleaseOnEdges && !params.loop) {
	    if (swiper.isVertical()) {
	      // Vertical
	      if (pageY < touches.startY && swiper.translate <= swiper.maxTranslate() || pageY > touches.startY && swiper.translate >= swiper.minTranslate()) {
	        data.isTouched = false;
	        data.isMoved = false;
	        return;
	      }
	    } else if (pageX < touches.startX && swiper.translate <= swiper.maxTranslate() || pageX > touches.startX && swiper.translate >= swiper.minTranslate()) {
	      return;
	    }
	  }
	  if (document.activeElement) {
	    if (e.target === document.activeElement && e.target.matches(data.focusableElements)) {
	      data.isMoved = true;
	      swiper.allowClick = false;
	      return;
	    }
	  }
	  if (data.allowTouchCallbacks) {
	    swiper.emit('touchMove', e);
	  }
	  touches.previousX = touches.currentX;
	  touches.previousY = touches.currentY;
	  touches.currentX = pageX;
	  touches.currentY = pageY;
	  const diffX = touches.currentX - touches.startX;
	  const diffY = touches.currentY - touches.startY;
	  if (swiper.params.threshold && Math.sqrt(diffX ** 2 + diffY ** 2) < swiper.params.threshold) return;
	  if (typeof data.isScrolling === 'undefined') {
	    let touchAngle;
	    if (swiper.isHorizontal() && touches.currentY === touches.startY || swiper.isVertical() && touches.currentX === touches.startX) {
	      data.isScrolling = false;
	    } else {
	      // eslint-disable-next-line
	      if (diffX * diffX + diffY * diffY >= 25) {
	        touchAngle = Math.atan2(Math.abs(diffY), Math.abs(diffX)) * 180 / Math.PI;
	        data.isScrolling = swiper.isHorizontal() ? touchAngle > params.touchAngle : 90 - touchAngle > params.touchAngle;
	      }
	    }
	  }
	  if (data.isScrolling) {
	    swiper.emit('touchMoveOpposite', e);
	  }
	  if (typeof data.startMoving === 'undefined') {
	    if (touches.currentX !== touches.startX || touches.currentY !== touches.startY) {
	      data.startMoving = true;
	    }
	  }
	  if (data.isScrolling || e.type === 'touchmove' && data.preventTouchMoveFromPointerMove) {
	    data.isTouched = false;
	    return;
	  }
	  if (!data.startMoving) {
	    return;
	  }
	  swiper.allowClick = false;
	  if (!params.cssMode && e.cancelable) {
	    e.preventDefault();
	  }
	  if (params.touchMoveStopPropagation && !params.nested) {
	    e.stopPropagation();
	  }
	  let diff = swiper.isHorizontal() ? diffX : diffY;
	  let touchesDiff = swiper.isHorizontal() ? touches.currentX - touches.previousX : touches.currentY - touches.previousY;
	  if (params.oneWayMovement) {
	    diff = Math.abs(diff) * (rtl ? 1 : -1);
	    touchesDiff = Math.abs(touchesDiff) * (rtl ? 1 : -1);
	  }
	  touches.diff = diff;
	  diff *= params.touchRatio;
	  if (rtl) {
	    diff = -diff;
	    touchesDiff = -touchesDiff;
	  }
	  const prevTouchesDirection = swiper.touchesDirection;
	  swiper.swipeDirection = diff > 0 ? 'prev' : 'next';
	  swiper.touchesDirection = touchesDiff > 0 ? 'prev' : 'next';
	  const isLoop = swiper.params.loop && !params.cssMode;
	  const allowLoopFix = swiper.touchesDirection === 'next' && swiper.allowSlideNext || swiper.touchesDirection === 'prev' && swiper.allowSlidePrev;
	  if (!data.isMoved) {
	    if (isLoop && allowLoopFix) {
	      swiper.loopFix({
	        direction: swiper.swipeDirection
	      });
	    }
	    data.startTranslate = swiper.getTranslate();
	    swiper.setTransition(0);
	    if (swiper.animating) {
	      const evt = new window.CustomEvent('transitionend', {
	        bubbles: true,
	        cancelable: true,
	        detail: {
	          bySwiperTouchMove: true
	        }
	      });
	      swiper.wrapperEl.dispatchEvent(evt);
	    }
	    data.allowMomentumBounce = false;
	    // Grab Cursor
	    if (params.grabCursor && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
	      swiper.setGrabCursor(true);
	    }
	    swiper.emit('sliderFirstMove', e);
	  }
	  let loopFixed;
	  new Date().getTime();
	  if (data.isMoved && data.allowThresholdMove && prevTouchesDirection !== swiper.touchesDirection && isLoop && allowLoopFix && Math.abs(diff) >= 1) {
	    Object.assign(touches, {
	      startX: pageX,
	      startY: pageY,
	      currentX: pageX,
	      currentY: pageY,
	      startTranslate: data.currentTranslate
	    });
	    data.loopSwapReset = true;
	    data.startTranslate = data.currentTranslate;
	    return;
	  }
	  swiper.emit('sliderMove', e);
	  data.isMoved = true;
	  data.currentTranslate = diff + data.startTranslate;
	  let disableParentSwiper = true;
	  let resistanceRatio = params.resistanceRatio;
	  if (params.touchReleaseOnEdges) {
	    resistanceRatio = 0;
	  }
	  if (diff > 0) {
	    if (isLoop && allowLoopFix && !loopFixed && data.allowThresholdMove && data.currentTranslate > (params.centeredSlides ? swiper.minTranslate() - swiper.slidesSizesGrid[swiper.activeIndex + 1] : swiper.minTranslate())) {
	      swiper.loopFix({
	        direction: 'prev',
	        setTranslate: true,
	        activeSlideIndex: 0
	      });
	    }
	    if (data.currentTranslate > swiper.minTranslate()) {
	      disableParentSwiper = false;
	      if (params.resistance) {
	        data.currentTranslate = swiper.minTranslate() - 1 + (-swiper.minTranslate() + data.startTranslate + diff) ** resistanceRatio;
	      }
	    }
	  } else if (diff < 0) {
	    if (isLoop && allowLoopFix && !loopFixed && data.allowThresholdMove && data.currentTranslate < (params.centeredSlides ? swiper.maxTranslate() + swiper.slidesSizesGrid[swiper.slidesSizesGrid.length - 1] : swiper.maxTranslate())) {
	      swiper.loopFix({
	        direction: 'next',
	        setTranslate: true,
	        activeSlideIndex: swiper.slides.length - (params.slidesPerView === 'auto' ? swiper.slidesPerViewDynamic() : Math.ceil(parseFloat(params.slidesPerView, 10)))
	      });
	    }
	    if (data.currentTranslate < swiper.maxTranslate()) {
	      disableParentSwiper = false;
	      if (params.resistance) {
	        data.currentTranslate = swiper.maxTranslate() + 1 - (swiper.maxTranslate() - data.startTranslate - diff) ** resistanceRatio;
	      }
	    }
	  }
	  if (disableParentSwiper) {
	    e.preventedByNestedSwiper = true;
	  }

	  // Directions locks
	  if (!swiper.allowSlideNext && swiper.swipeDirection === 'next' && data.currentTranslate < data.startTranslate) {
	    data.currentTranslate = data.startTranslate;
	  }
	  if (!swiper.allowSlidePrev && swiper.swipeDirection === 'prev' && data.currentTranslate > data.startTranslate) {
	    data.currentTranslate = data.startTranslate;
	  }
	  if (!swiper.allowSlidePrev && !swiper.allowSlideNext) {
	    data.currentTranslate = data.startTranslate;
	  }

	  // Threshold
	  if (params.threshold > 0) {
	    if (Math.abs(diff) > params.threshold || data.allowThresholdMove) {
	      if (!data.allowThresholdMove) {
	        data.allowThresholdMove = true;
	        touches.startX = touches.currentX;
	        touches.startY = touches.currentY;
	        data.currentTranslate = data.startTranslate;
	        touches.diff = swiper.isHorizontal() ? touches.currentX - touches.startX : touches.currentY - touches.startY;
	        return;
	      }
	    } else {
	      data.currentTranslate = data.startTranslate;
	      return;
	    }
	  }
	  if (!params.followFinger || params.cssMode) return;

	  // Update active index in free mode
	  if (params.freeMode && params.freeMode.enabled && swiper.freeMode || params.watchSlidesProgress) {
	    swiper.updateActiveIndex();
	    swiper.updateSlidesClasses();
	  }
	  if (params.freeMode && params.freeMode.enabled && swiper.freeMode) {
	    swiper.freeMode.onTouchMove();
	  }
	  // Update progress
	  swiper.updateProgress(data.currentTranslate);
	  // Update translate
	  swiper.setTranslate(data.currentTranslate);
	}
	function onTouchEnd(event) {
	  const swiper = this;
	  const data = swiper.touchEventsData;
	  let e = event;
	  if (e.originalEvent) e = e.originalEvent;
	  let targetTouch;
	  const isTouchEvent = e.type === 'touchend' || e.type === 'touchcancel';
	  if (!isTouchEvent) {
	    if (data.touchId !== null) return; // return from pointer if we use touch
	    if (e.pointerId !== data.pointerId) return;
	    targetTouch = e;
	  } else {
	    targetTouch = [...e.changedTouches].filter(t => t.identifier === data.touchId)[0];
	    if (!targetTouch || targetTouch.identifier !== data.touchId) return;
	  }
	  if (['pointercancel', 'pointerout', 'pointerleave', 'contextmenu'].includes(e.type)) {
	    const proceed = ['pointercancel', 'contextmenu'].includes(e.type) && (swiper.browser.isSafari || swiper.browser.isWebView);
	    if (!proceed) {
	      return;
	    }
	  }
	  data.pointerId = null;
	  data.touchId = null;
	  const {
	    params,
	    touches,
	    rtlTranslate: rtl,
	    slidesGrid,
	    enabled
	  } = swiper;
	  if (!enabled) return;
	  if (!params.simulateTouch && e.pointerType === 'mouse') return;
	  if (data.allowTouchCallbacks) {
	    swiper.emit('touchEnd', e);
	  }
	  data.allowTouchCallbacks = false;
	  if (!data.isTouched) {
	    if (data.isMoved && params.grabCursor) {
	      swiper.setGrabCursor(false);
	    }
	    data.isMoved = false;
	    data.startMoving = false;
	    return;
	  }

	  // Return Grab Cursor
	  if (params.grabCursor && data.isMoved && data.isTouched && (swiper.allowSlideNext === true || swiper.allowSlidePrev === true)) {
	    swiper.setGrabCursor(false);
	  }

	  // Time diff
	  const touchEndTime = now();
	  const timeDiff = touchEndTime - data.touchStartTime;

	  // Tap, doubleTap, Click
	  if (swiper.allowClick) {
	    const pathTree = e.path || e.composedPath && e.composedPath();
	    swiper.updateClickedSlide(pathTree && pathTree[0] || e.target, pathTree);
	    swiper.emit('tap click', e);
	    if (timeDiff < 300 && touchEndTime - data.lastClickTime < 300) {
	      swiper.emit('doubleTap doubleClick', e);
	    }
	  }
	  data.lastClickTime = now();
	  nextTick(() => {
	    if (!swiper.destroyed) swiper.allowClick = true;
	  });
	  if (!data.isTouched || !data.isMoved || !swiper.swipeDirection || touches.diff === 0 && !data.loopSwapReset || data.currentTranslate === data.startTranslate && !data.loopSwapReset) {
	    data.isTouched = false;
	    data.isMoved = false;
	    data.startMoving = false;
	    return;
	  }
	  data.isTouched = false;
	  data.isMoved = false;
	  data.startMoving = false;
	  let currentPos;
	  if (params.followFinger) {
	    currentPos = rtl ? swiper.translate : -swiper.translate;
	  } else {
	    currentPos = -data.currentTranslate;
	  }
	  if (params.cssMode) {
	    return;
	  }
	  if (params.freeMode && params.freeMode.enabled) {
	    swiper.freeMode.onTouchEnd({
	      currentPos
	    });
	    return;
	  }

	  // Find current slide
	  const swipeToLast = currentPos >= -swiper.maxTranslate() && !swiper.params.loop;
	  let stopIndex = 0;
	  let groupSize = swiper.slidesSizesGrid[0];
	  for (let i = 0; i < slidesGrid.length; i += i < params.slidesPerGroupSkip ? 1 : params.slidesPerGroup) {
	    const increment = i < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
	    if (typeof slidesGrid[i + increment] !== 'undefined') {
	      if (swipeToLast || currentPos >= slidesGrid[i] && currentPos < slidesGrid[i + increment]) {
	        stopIndex = i;
	        groupSize = slidesGrid[i + increment] - slidesGrid[i];
	      }
	    } else if (swipeToLast || currentPos >= slidesGrid[i]) {
	      stopIndex = i;
	      groupSize = slidesGrid[slidesGrid.length - 1] - slidesGrid[slidesGrid.length - 2];
	    }
	  }
	  let rewindFirstIndex = null;
	  let rewindLastIndex = null;
	  if (params.rewind) {
	    if (swiper.isBeginning) {
	      rewindLastIndex = params.virtual && params.virtual.enabled && swiper.virtual ? swiper.virtual.slides.length - 1 : swiper.slides.length - 1;
	    } else if (swiper.isEnd) {
	      rewindFirstIndex = 0;
	    }
	  }
	  // Find current slide size
	  const ratio = (currentPos - slidesGrid[stopIndex]) / groupSize;
	  const increment = stopIndex < params.slidesPerGroupSkip - 1 ? 1 : params.slidesPerGroup;
	  if (timeDiff > params.longSwipesMs) {
	    // Long touches
	    if (!params.longSwipes) {
	      swiper.slideTo(swiper.activeIndex);
	      return;
	    }
	    if (swiper.swipeDirection === 'next') {
	      if (ratio >= params.longSwipesRatio) swiper.slideTo(params.rewind && swiper.isEnd ? rewindFirstIndex : stopIndex + increment);else swiper.slideTo(stopIndex);
	    }
	    if (swiper.swipeDirection === 'prev') {
	      if (ratio > 1 - params.longSwipesRatio) {
	        swiper.slideTo(stopIndex + increment);
	      } else if (rewindLastIndex !== null && ratio < 0 && Math.abs(ratio) > params.longSwipesRatio) {
	        swiper.slideTo(rewindLastIndex);
	      } else {
	        swiper.slideTo(stopIndex);
	      }
	    }
	  } else {
	    // Short swipes
	    if (!params.shortSwipes) {
	      swiper.slideTo(swiper.activeIndex);
	      return;
	    }
	    const isNavButtonTarget = swiper.navigation && (e.target === swiper.navigation.nextEl || e.target === swiper.navigation.prevEl);
	    if (!isNavButtonTarget) {
	      if (swiper.swipeDirection === 'next') {
	        swiper.slideTo(rewindFirstIndex !== null ? rewindFirstIndex : stopIndex + increment);
	      }
	      if (swiper.swipeDirection === 'prev') {
	        swiper.slideTo(rewindLastIndex !== null ? rewindLastIndex : stopIndex);
	      }
	    } else if (e.target === swiper.navigation.nextEl) {
	      swiper.slideTo(stopIndex + increment);
	    } else {
	      swiper.slideTo(stopIndex);
	    }
	  }
	}
	function onResize() {
	  const swiper = this;
	  const {
	    params,
	    el
	  } = swiper;
	  if (el && el.offsetWidth === 0) return;

	  // Breakpoints
	  if (params.breakpoints) {
	    swiper.setBreakpoint();
	  }

	  // Save locks
	  const {
	    allowSlideNext,
	    allowSlidePrev,
	    snapGrid
	  } = swiper;
	  const isVirtual = swiper.virtual && swiper.params.virtual.enabled;

	  // Disable locks on resize
	  swiper.allowSlideNext = true;
	  swiper.allowSlidePrev = true;
	  swiper.updateSize();
	  swiper.updateSlides();
	  swiper.updateSlidesClasses();
	  const isVirtualLoop = isVirtual && params.loop;
	  if ((params.slidesPerView === 'auto' || params.slidesPerView > 1) && swiper.isEnd && !swiper.isBeginning && !swiper.params.centeredSlides && !isVirtualLoop) {
	    swiper.slideTo(swiper.slides.length - 1, 0, false, true);
	  } else {
	    if (swiper.params.loop && !isVirtual) {
	      swiper.slideToLoop(swiper.realIndex, 0, false, true);
	    } else {
	      swiper.slideTo(swiper.activeIndex, 0, false, true);
	    }
	  }
	  if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
	    clearTimeout(swiper.autoplay.resizeTimeout);
	    swiper.autoplay.resizeTimeout = setTimeout(() => {
	      if (swiper.autoplay && swiper.autoplay.running && swiper.autoplay.paused) {
	        swiper.autoplay.resume();
	      }
	    }, 500);
	  }
	  // Return locks after resize
	  swiper.allowSlidePrev = allowSlidePrev;
	  swiper.allowSlideNext = allowSlideNext;
	  if (swiper.params.watchOverflow && snapGrid !== swiper.snapGrid) {
	    swiper.checkOverflow();
	  }
	}
	function onClick(e) {
	  const swiper = this;
	  if (!swiper.enabled) return;
	  if (!swiper.allowClick) {
	    if (swiper.params.preventClicks) e.preventDefault();
	    if (swiper.params.preventClicksPropagation && swiper.animating) {
	      e.stopPropagation();
	      e.stopImmediatePropagation();
	    }
	  }
	}
	function onScroll() {
	  const swiper = this;
	  const {
	    wrapperEl,
	    rtlTranslate,
	    enabled
	  } = swiper;
	  if (!enabled) return;
	  swiper.previousTranslate = swiper.translate;
	  if (swiper.isHorizontal()) {
	    swiper.translate = -wrapperEl.scrollLeft;
	  } else {
	    swiper.translate = -wrapperEl.scrollTop;
	  }
	  // eslint-disable-next-line
	  if (swiper.translate === 0) swiper.translate = 0;
	  swiper.updateActiveIndex();
	  swiper.updateSlidesClasses();
	  let newProgress;
	  const translatesDiff = swiper.maxTranslate() - swiper.minTranslate();
	  if (translatesDiff === 0) {
	    newProgress = 0;
	  } else {
	    newProgress = (swiper.translate - swiper.minTranslate()) / translatesDiff;
	  }
	  if (newProgress !== swiper.progress) {
	    swiper.updateProgress(rtlTranslate ? -swiper.translate : swiper.translate);
	  }
	  swiper.emit('setTranslate', swiper.translate, false);
	}
	function onLoad(e) {
	  const swiper = this;
	  processLazyPreloader(swiper, e.target);
	  if (swiper.params.cssMode || swiper.params.slidesPerView !== 'auto' && !swiper.params.autoHeight) {
	    return;
	  }
	  swiper.update();
	}
	function onDocumentTouchStart() {
	  const swiper = this;
	  if (swiper.documentTouchHandlerProceeded) return;
	  swiper.documentTouchHandlerProceeded = true;
	  if (swiper.params.touchReleaseOnEdges) {
	    swiper.el.style.touchAction = 'auto';
	  }
	}
	const events = (swiper, method) => {
	  const document = getDocument();
	  const {
	    params,
	    el,
	    wrapperEl,
	    device
	  } = swiper;
	  const capture = !!params.nested;
	  const domMethod = method === 'on' ? 'addEventListener' : 'removeEventListener';
	  const swiperMethod = method;
	  if (!el || typeof el === 'string') return;

	  // Touch Events
	  document[domMethod]('touchstart', swiper.onDocumentTouchStart, {
	    passive: false,
	    capture
	  });
	  el[domMethod]('touchstart', swiper.onTouchStart, {
	    passive: false
	  });
	  el[domMethod]('pointerdown', swiper.onTouchStart, {
	    passive: false
	  });
	  document[domMethod]('touchmove', swiper.onTouchMove, {
	    passive: false,
	    capture
	  });
	  document[domMethod]('pointermove', swiper.onTouchMove, {
	    passive: false,
	    capture
	  });
	  document[domMethod]('touchend', swiper.onTouchEnd, {
	    passive: true
	  });
	  document[domMethod]('pointerup', swiper.onTouchEnd, {
	    passive: true
	  });
	  document[domMethod]('pointercancel', swiper.onTouchEnd, {
	    passive: true
	  });
	  document[domMethod]('touchcancel', swiper.onTouchEnd, {
	    passive: true
	  });
	  document[domMethod]('pointerout', swiper.onTouchEnd, {
	    passive: true
	  });
	  document[domMethod]('pointerleave', swiper.onTouchEnd, {
	    passive: true
	  });
	  document[domMethod]('contextmenu', swiper.onTouchEnd, {
	    passive: true
	  });

	  // Prevent Links Clicks
	  if (params.preventClicks || params.preventClicksPropagation) {
	    el[domMethod]('click', swiper.onClick, true);
	  }
	  if (params.cssMode) {
	    wrapperEl[domMethod]('scroll', swiper.onScroll);
	  }

	  // Resize handler
	  if (params.updateOnWindowResize) {
	    swiper[swiperMethod](device.ios || device.android ? 'resize orientationchange observerUpdate' : 'resize observerUpdate', onResize, true);
	  } else {
	    swiper[swiperMethod]('observerUpdate', onResize, true);
	  }

	  // Images loader
	  el[domMethod]('load', swiper.onLoad, {
	    capture: true
	  });
	};
	function attachEvents() {
	  const swiper = this;
	  const {
	    params
	  } = swiper;
	  swiper.onTouchStart = onTouchStart.bind(swiper);
	  swiper.onTouchMove = onTouchMove.bind(swiper);
	  swiper.onTouchEnd = onTouchEnd.bind(swiper);
	  swiper.onDocumentTouchStart = onDocumentTouchStart.bind(swiper);
	  if (params.cssMode) {
	    swiper.onScroll = onScroll.bind(swiper);
	  }
	  swiper.onClick = onClick.bind(swiper);
	  swiper.onLoad = onLoad.bind(swiper);
	  events(swiper, 'on');
	}
	function detachEvents() {
	  const swiper = this;
	  events(swiper, 'off');
	}
	var events$1 = {
	  attachEvents,
	  detachEvents
	};
	const isGridEnabled = (swiper, params) => {
	  return swiper.grid && params.grid && params.grid.rows > 1;
	};
	function setBreakpoint() {
	  const swiper = this;
	  const {
	    realIndex,
	    initialized,
	    params,
	    el
	  } = swiper;
	  const breakpoints = params.breakpoints;
	  if (!breakpoints || breakpoints && Object.keys(breakpoints).length === 0) return;

	  // Get breakpoint for window width and update parameters
	  const breakpoint = swiper.getBreakpoint(breakpoints, swiper.params.breakpointsBase, swiper.el);
	  if (!breakpoint || swiper.currentBreakpoint === breakpoint) return;
	  const breakpointOnlyParams = breakpoint in breakpoints ? breakpoints[breakpoint] : undefined;
	  const breakpointParams = breakpointOnlyParams || swiper.originalParams;
	  const wasMultiRow = isGridEnabled(swiper, params);
	  const isMultiRow = isGridEnabled(swiper, breakpointParams);
	  const wasGrabCursor = swiper.params.grabCursor;
	  const isGrabCursor = breakpointParams.grabCursor;
	  const wasEnabled = params.enabled;
	  if (wasMultiRow && !isMultiRow) {
	    el.classList.remove(`${params.containerModifierClass}grid`, `${params.containerModifierClass}grid-column`);
	    swiper.emitContainerClasses();
	  } else if (!wasMultiRow && isMultiRow) {
	    el.classList.add(`${params.containerModifierClass}grid`);
	    if (breakpointParams.grid.fill && breakpointParams.grid.fill === 'column' || !breakpointParams.grid.fill && params.grid.fill === 'column') {
	      el.classList.add(`${params.containerModifierClass}grid-column`);
	    }
	    swiper.emitContainerClasses();
	  }
	  if (wasGrabCursor && !isGrabCursor) {
	    swiper.unsetGrabCursor();
	  } else if (!wasGrabCursor && isGrabCursor) {
	    swiper.setGrabCursor();
	  }

	  // Toggle navigation, pagination, scrollbar
	  ['navigation', 'pagination', 'scrollbar'].forEach(prop => {
	    if (typeof breakpointParams[prop] === 'undefined') return;
	    const wasModuleEnabled = params[prop] && params[prop].enabled;
	    const isModuleEnabled = breakpointParams[prop] && breakpointParams[prop].enabled;
	    if (wasModuleEnabled && !isModuleEnabled) {
	      swiper[prop].disable();
	    }
	    if (!wasModuleEnabled && isModuleEnabled) {
	      swiper[prop].enable();
	    }
	  });
	  const directionChanged = breakpointParams.direction && breakpointParams.direction !== params.direction;
	  const needsReLoop = params.loop && (breakpointParams.slidesPerView !== params.slidesPerView || directionChanged);
	  const wasLoop = params.loop;
	  if (directionChanged && initialized) {
	    swiper.changeDirection();
	  }
	  extend(swiper.params, breakpointParams);
	  const isEnabled = swiper.params.enabled;
	  const hasLoop = swiper.params.loop;
	  Object.assign(swiper, {
	    allowTouchMove: swiper.params.allowTouchMove,
	    allowSlideNext: swiper.params.allowSlideNext,
	    allowSlidePrev: swiper.params.allowSlidePrev
	  });
	  if (wasEnabled && !isEnabled) {
	    swiper.disable();
	  } else if (!wasEnabled && isEnabled) {
	    swiper.enable();
	  }
	  swiper.currentBreakpoint = breakpoint;
	  swiper.emit('_beforeBreakpoint', breakpointParams);
	  if (initialized) {
	    if (needsReLoop) {
	      swiper.loopDestroy();
	      swiper.loopCreate(realIndex);
	      swiper.updateSlides();
	    } else if (!wasLoop && hasLoop) {
	      swiper.loopCreate(realIndex);
	      swiper.updateSlides();
	    } else if (wasLoop && !hasLoop) {
	      swiper.loopDestroy();
	    }
	  }
	  swiper.emit('breakpoint', breakpointParams);
	}
	function getBreakpoint(breakpoints, base, containerEl) {
	  if (base === void 0) {
	    base = 'window';
	  }
	  if (!breakpoints || base === 'container' && !containerEl) return undefined;
	  let breakpoint = false;
	  const window = getWindow();
	  const currentHeight = base === 'window' ? window.innerHeight : containerEl.clientHeight;
	  const points = Object.keys(breakpoints).map(point => {
	    if (typeof point === 'string' && point.indexOf('@') === 0) {
	      const minRatio = parseFloat(point.substr(1));
	      const value = currentHeight * minRatio;
	      return {
	        value,
	        point
	      };
	    }
	    return {
	      value: point,
	      point
	    };
	  });
	  points.sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10));
	  for (let i = 0; i < points.length; i += 1) {
	    const {
	      point,
	      value
	    } = points[i];
	    if (base === 'window') {
	      if (window.matchMedia(`(min-width: ${value}px)`).matches) {
	        breakpoint = point;
	      }
	    } else if (value <= containerEl.clientWidth) {
	      breakpoint = point;
	    }
	  }
	  return breakpoint || 'max';
	}
	var breakpoints = {
	  setBreakpoint,
	  getBreakpoint
	};
	function prepareClasses(entries, prefix) {
	  const resultClasses = [];
	  entries.forEach(item => {
	    if (typeof item === 'object') {
	      Object.keys(item).forEach(classNames => {
	        if (item[classNames]) {
	          resultClasses.push(prefix + classNames);
	        }
	      });
	    } else if (typeof item === 'string') {
	      resultClasses.push(prefix + item);
	    }
	  });
	  return resultClasses;
	}
	function addClasses() {
	  const swiper = this;
	  const {
	    classNames,
	    params,
	    rtl,
	    el,
	    device
	  } = swiper;
	  // prettier-ignore
	  const suffixes = prepareClasses(['initialized', params.direction, {
	    'free-mode': swiper.params.freeMode && params.freeMode.enabled
	  }, {
	    'autoheight': params.autoHeight
	  }, {
	    'rtl': rtl
	  }, {
	    'grid': params.grid && params.grid.rows > 1
	  }, {
	    'grid-column': params.grid && params.grid.rows > 1 && params.grid.fill === 'column'
	  }, {
	    'android': device.android
	  }, {
	    'ios': device.ios
	  }, {
	    'css-mode': params.cssMode
	  }, {
	    'centered': params.cssMode && params.centeredSlides
	  }, {
	    'watch-progress': params.watchSlidesProgress
	  }], params.containerModifierClass);
	  classNames.push(...suffixes);
	  el.classList.add(...classNames);
	  swiper.emitContainerClasses();
	}
	function removeClasses() {
	  const swiper = this;
	  const {
	    el,
	    classNames
	  } = swiper;
	  if (!el || typeof el === 'string') return;
	  el.classList.remove(...classNames);
	  swiper.emitContainerClasses();
	}
	var classes = {
	  addClasses,
	  removeClasses
	};
	function checkOverflow() {
	  const swiper = this;
	  const {
	    isLocked: wasLocked,
	    params
	  } = swiper;
	  const {
	    slidesOffsetBefore
	  } = params;
	  if (slidesOffsetBefore) {
	    const lastSlideIndex = swiper.slides.length - 1;
	    const lastSlideRightEdge = swiper.slidesGrid[lastSlideIndex] + swiper.slidesSizesGrid[lastSlideIndex] + slidesOffsetBefore * 2;
	    swiper.isLocked = swiper.size > lastSlideRightEdge;
	  } else {
	    swiper.isLocked = swiper.snapGrid.length === 1;
	  }
	  if (params.allowSlideNext === true) {
	    swiper.allowSlideNext = !swiper.isLocked;
	  }
	  if (params.allowSlidePrev === true) {
	    swiper.allowSlidePrev = !swiper.isLocked;
	  }
	  if (wasLocked && wasLocked !== swiper.isLocked) {
	    swiper.isEnd = false;
	  }
	  if (wasLocked !== swiper.isLocked) {
	    swiper.emit(swiper.isLocked ? 'lock' : 'unlock');
	  }
	}
	var checkOverflow$1 = {
	  checkOverflow
	};
	var defaults = {
	  init: true,
	  direction: 'horizontal',
	  oneWayMovement: false,
	  swiperElementNodeName: 'SWIPER-CONTAINER',
	  touchEventsTarget: 'wrapper',
	  initialSlide: 0,
	  speed: 300,
	  cssMode: false,
	  updateOnWindowResize: true,
	  resizeObserver: true,
	  nested: false,
	  createElements: false,
	  eventsPrefix: 'swiper',
	  enabled: true,
	  focusableElements: 'input, select, option, textarea, button, video, label',
	  // Overrides
	  width: null,
	  height: null,
	  //
	  preventInteractionOnTransition: false,
	  // ssr
	  userAgent: null,
	  url: null,
	  // To support iOS's swipe-to-go-back gesture (when being used in-app).
	  edgeSwipeDetection: false,
	  edgeSwipeThreshold: 20,
	  // Autoheight
	  autoHeight: false,
	  // Set wrapper width
	  setWrapperSize: false,
	  // Virtual Translate
	  virtualTranslate: false,
	  // Effects
	  effect: 'slide',
	  // 'slide' or 'fade' or 'cube' or 'coverflow' or 'flip'

	  // Breakpoints
	  breakpoints: undefined,
	  breakpointsBase: 'window',
	  // Slides grid
	  spaceBetween: 0,
	  slidesPerView: 1,
	  slidesPerGroup: 1,
	  slidesPerGroupSkip: 0,
	  slidesPerGroupAuto: false,
	  centeredSlides: false,
	  centeredSlidesBounds: false,
	  slidesOffsetBefore: 0,
	  // in px
	  slidesOffsetAfter: 0,
	  // in px
	  normalizeSlideIndex: true,
	  centerInsufficientSlides: false,
	  // Disable swiper and hide navigation when container not overflow
	  watchOverflow: true,
	  // Round length
	  roundLengths: false,
	  // Touches
	  touchRatio: 1,
	  touchAngle: 45,
	  simulateTouch: true,
	  shortSwipes: true,
	  longSwipes: true,
	  longSwipesRatio: 0.5,
	  longSwipesMs: 300,
	  followFinger: true,
	  allowTouchMove: true,
	  threshold: 5,
	  touchMoveStopPropagation: false,
	  touchStartPreventDefault: true,
	  touchStartForcePreventDefault: false,
	  touchReleaseOnEdges: false,
	  // Unique Navigation Elements
	  uniqueNavElements: true,
	  // Resistance
	  resistance: true,
	  resistanceRatio: 0.85,
	  // Progress
	  watchSlidesProgress: false,
	  // Cursor
	  grabCursor: false,
	  // Clicks
	  preventClicks: true,
	  preventClicksPropagation: true,
	  slideToClickedSlide: false,
	  // loop
	  loop: false,
	  loopAddBlankSlides: true,
	  loopAdditionalSlides: 0,
	  loopPreventsSliding: true,
	  // rewind
	  rewind: false,
	  // Swiping/no swiping
	  allowSlidePrev: true,
	  allowSlideNext: true,
	  swipeHandler: null,
	  // '.swipe-handler',
	  noSwiping: true,
	  noSwipingClass: 'swiper-no-swiping',
	  noSwipingSelector: null,
	  // Passive Listeners
	  passiveListeners: true,
	  maxBackfaceHiddenSlides: 10,
	  // NS
	  containerModifierClass: 'swiper-',
	  // NEW
	  slideClass: 'swiper-slide',
	  slideBlankClass: 'swiper-slide-blank',
	  slideActiveClass: 'swiper-slide-active',
	  slideVisibleClass: 'swiper-slide-visible',
	  slideFullyVisibleClass: 'swiper-slide-fully-visible',
	  slideNextClass: 'swiper-slide-next',
	  slidePrevClass: 'swiper-slide-prev',
	  wrapperClass: 'swiper-wrapper',
	  lazyPreloaderClass: 'swiper-lazy-preloader',
	  lazyPreloadPrevNext: 0,
	  // Callbacks
	  runCallbacksOnInit: true,
	  // Internals
	  _emitClasses: false
	};
	function moduleExtendParams(params, allModulesParams) {
	  return function extendParams(obj) {
	    if (obj === void 0) {
	      obj = {};
	    }
	    const moduleParamName = Object.keys(obj)[0];
	    const moduleParams = obj[moduleParamName];
	    if (typeof moduleParams !== 'object' || moduleParams === null) {
	      extend(allModulesParams, obj);
	      return;
	    }
	    if (params[moduleParamName] === true) {
	      params[moduleParamName] = {
	        enabled: true
	      };
	    }
	    if (moduleParamName === 'navigation' && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].prevEl && !params[moduleParamName].nextEl) {
	      params[moduleParamName].auto = true;
	    }
	    if (['pagination', 'scrollbar'].indexOf(moduleParamName) >= 0 && params[moduleParamName] && params[moduleParamName].enabled && !params[moduleParamName].el) {
	      params[moduleParamName].auto = true;
	    }
	    if (!(moduleParamName in params && 'enabled' in moduleParams)) {
	      extend(allModulesParams, obj);
	      return;
	    }
	    if (typeof params[moduleParamName] === 'object' && !('enabled' in params[moduleParamName])) {
	      params[moduleParamName].enabled = true;
	    }
	    if (!params[moduleParamName]) params[moduleParamName] = {
	      enabled: false
	    };
	    extend(allModulesParams, obj);
	  };
	}

	/* eslint no-param-reassign: "off" */
	const prototypes = {
	  eventsEmitter,
	  update,
	  translate,
	  transition,
	  slide,
	  loop,
	  grabCursor,
	  events: events$1,
	  breakpoints,
	  checkOverflow: checkOverflow$1,
	  classes
	};
	const extendedDefaults = {};
	class Swiper {
	  constructor() {
	    let el;
	    let params;
	    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }
	    if (args.length === 1 && args[0].constructor && Object.prototype.toString.call(args[0]).slice(8, -1) === 'Object') {
	      params = args[0];
	    } else {
	      [el, params] = args;
	    }
	    if (!params) params = {};
	    params = extend({}, params);
	    if (el && !params.el) params.el = el;
	    const document = getDocument();
	    if (params.el && typeof params.el === 'string' && document.querySelectorAll(params.el).length > 1) {
	      const swipers = [];
	      document.querySelectorAll(params.el).forEach(containerEl => {
	        const newParams = extend({}, params, {
	          el: containerEl
	        });
	        swipers.push(new Swiper(newParams));
	      });
	      // eslint-disable-next-line no-constructor-return
	      return swipers;
	    }

	    // Swiper Instance
	    const swiper = this;
	    swiper.__swiper__ = true;
	    swiper.support = getSupport();
	    swiper.device = getDevice({
	      userAgent: params.userAgent
	    });
	    swiper.browser = getBrowser();
	    swiper.eventsListeners = {};
	    swiper.eventsAnyListeners = [];
	    swiper.modules = [...swiper.__modules__];
	    if (params.modules && Array.isArray(params.modules)) {
	      swiper.modules.push(...params.modules);
	    }
	    const allModulesParams = {};
	    swiper.modules.forEach(mod => {
	      mod({
	        params,
	        swiper,
	        extendParams: moduleExtendParams(params, allModulesParams),
	        on: swiper.on.bind(swiper),
	        once: swiper.once.bind(swiper),
	        off: swiper.off.bind(swiper),
	        emit: swiper.emit.bind(swiper)
	      });
	    });

	    // Extend defaults with modules params
	    const swiperParams = extend({}, defaults, allModulesParams);

	    // Extend defaults with passed params
	    swiper.params = extend({}, swiperParams, extendedDefaults, params);
	    swiper.originalParams = extend({}, swiper.params);
	    swiper.passedParams = extend({}, params);

	    // add event listeners
	    if (swiper.params && swiper.params.on) {
	      Object.keys(swiper.params.on).forEach(eventName => {
	        swiper.on(eventName, swiper.params.on[eventName]);
	      });
	    }
	    if (swiper.params && swiper.params.onAny) {
	      swiper.onAny(swiper.params.onAny);
	    }

	    // Extend Swiper
	    Object.assign(swiper, {
	      enabled: swiper.params.enabled,
	      el,
	      // Classes
	      classNames: [],
	      // Slides
	      slides: [],
	      slidesGrid: [],
	      snapGrid: [],
	      slidesSizesGrid: [],
	      // isDirection
	      isHorizontal() {
	        return swiper.params.direction === 'horizontal';
	      },
	      isVertical() {
	        return swiper.params.direction === 'vertical';
	      },
	      // Indexes
	      activeIndex: 0,
	      realIndex: 0,
	      //
	      isBeginning: true,
	      isEnd: false,
	      // Props
	      translate: 0,
	      previousTranslate: 0,
	      progress: 0,
	      velocity: 0,
	      animating: false,
	      cssOverflowAdjustment() {
	        // Returns 0 unless `translate` is > 2**23
	        // Should be subtracted from css values to prevent overflow
	        return Math.trunc(this.translate / 2 ** 23) * 2 ** 23;
	      },
	      // Locks
	      allowSlideNext: swiper.params.allowSlideNext,
	      allowSlidePrev: swiper.params.allowSlidePrev,
	      // Touch Events
	      touchEventsData: {
	        isTouched: undefined,
	        isMoved: undefined,
	        allowTouchCallbacks: undefined,
	        touchStartTime: undefined,
	        isScrolling: undefined,
	        currentTranslate: undefined,
	        startTranslate: undefined,
	        allowThresholdMove: undefined,
	        // Form elements to match
	        focusableElements: swiper.params.focusableElements,
	        // Last click time
	        lastClickTime: 0,
	        clickTimeout: undefined,
	        // Velocities
	        velocities: [],
	        allowMomentumBounce: undefined,
	        startMoving: undefined,
	        pointerId: null,
	        touchId: null
	      },
	      // Clicks
	      allowClick: true,
	      // Touches
	      allowTouchMove: swiper.params.allowTouchMove,
	      touches: {
	        startX: 0,
	        startY: 0,
	        currentX: 0,
	        currentY: 0,
	        diff: 0
	      },
	      // Images
	      imagesToLoad: [],
	      imagesLoaded: 0
	    });
	    swiper.emit('_swiper');

	    // Init
	    if (swiper.params.init) {
	      swiper.init();
	    }

	    // Return app instance
	    // eslint-disable-next-line no-constructor-return
	    return swiper;
	  }
	  getDirectionLabel(property) {
	    if (this.isHorizontal()) {
	      return property;
	    }
	    // prettier-ignore
	    return {
	      'width': 'height',
	      'margin-top': 'margin-left',
	      'margin-bottom ': 'margin-right',
	      'margin-left': 'margin-top',
	      'margin-right': 'margin-bottom',
	      'padding-left': 'padding-top',
	      'padding-right': 'padding-bottom',
	      'marginRight': 'marginBottom'
	    }[property];
	  }
	  getSlideIndex(slideEl) {
	    const {
	      slidesEl,
	      params
	    } = this;
	    const slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
	    const firstSlideIndex = elementIndex(slides[0]);
	    return elementIndex(slideEl) - firstSlideIndex;
	  }
	  getSlideIndexByData(index) {
	    return this.getSlideIndex(this.slides.filter(slideEl => slideEl.getAttribute('data-swiper-slide-index') * 1 === index)[0]);
	  }
	  recalcSlides() {
	    const swiper = this;
	    const {
	      slidesEl,
	      params
	    } = swiper;
	    swiper.slides = elementChildren(slidesEl, `.${params.slideClass}, swiper-slide`);
	  }
	  enable() {
	    const swiper = this;
	    if (swiper.enabled) return;
	    swiper.enabled = true;
	    if (swiper.params.grabCursor) {
	      swiper.setGrabCursor();
	    }
	    swiper.emit('enable');
	  }
	  disable() {
	    const swiper = this;
	    if (!swiper.enabled) return;
	    swiper.enabled = false;
	    if (swiper.params.grabCursor) {
	      swiper.unsetGrabCursor();
	    }
	    swiper.emit('disable');
	  }
	  setProgress(progress, speed) {
	    const swiper = this;
	    progress = Math.min(Math.max(progress, 0), 1);
	    const min = swiper.minTranslate();
	    const max = swiper.maxTranslate();
	    const current = (max - min) * progress + min;
	    swiper.translateTo(current, typeof speed === 'undefined' ? 0 : speed);
	    swiper.updateActiveIndex();
	    swiper.updateSlidesClasses();
	  }
	  emitContainerClasses() {
	    const swiper = this;
	    if (!swiper.params._emitClasses || !swiper.el) return;
	    const cls = swiper.el.className.split(' ').filter(className => {
	      return className.indexOf('swiper') === 0 || className.indexOf(swiper.params.containerModifierClass) === 0;
	    });
	    swiper.emit('_containerClasses', cls.join(' '));
	  }
	  getSlideClasses(slideEl) {
	    const swiper = this;
	    if (swiper.destroyed) return '';
	    return slideEl.className.split(' ').filter(className => {
	      return className.indexOf('swiper-slide') === 0 || className.indexOf(swiper.params.slideClass) === 0;
	    }).join(' ');
	  }
	  emitSlidesClasses() {
	    const swiper = this;
	    if (!swiper.params._emitClasses || !swiper.el) return;
	    const updates = [];
	    swiper.slides.forEach(slideEl => {
	      const classNames = swiper.getSlideClasses(slideEl);
	      updates.push({
	        slideEl,
	        classNames
	      });
	      swiper.emit('_slideClass', slideEl, classNames);
	    });
	    swiper.emit('_slideClasses', updates);
	  }
	  slidesPerViewDynamic(view, exact) {
	    if (view === void 0) {
	      view = 'current';
	    }
	    if (exact === void 0) {
	      exact = false;
	    }
	    const swiper = this;
	    const {
	      params,
	      slides,
	      slidesGrid,
	      slidesSizesGrid,
	      size: swiperSize,
	      activeIndex
	    } = swiper;
	    let spv = 1;
	    if (typeof params.slidesPerView === 'number') return params.slidesPerView;
	    if (params.centeredSlides) {
	      let slideSize = slides[activeIndex] ? Math.ceil(slides[activeIndex].swiperSlideSize) : 0;
	      let breakLoop;
	      for (let i = activeIndex + 1; i < slides.length; i += 1) {
	        if (slides[i] && !breakLoop) {
	          slideSize += Math.ceil(slides[i].swiperSlideSize);
	          spv += 1;
	          if (slideSize > swiperSize) breakLoop = true;
	        }
	      }
	      for (let i = activeIndex - 1; i >= 0; i -= 1) {
	        if (slides[i] && !breakLoop) {
	          slideSize += slides[i].swiperSlideSize;
	          spv += 1;
	          if (slideSize > swiperSize) breakLoop = true;
	        }
	      }
	    } else {
	      // eslint-disable-next-line
	      if (view === 'current') {
	        for (let i = activeIndex + 1; i < slides.length; i += 1) {
	          const slideInView = exact ? slidesGrid[i] + slidesSizesGrid[i] - slidesGrid[activeIndex] < swiperSize : slidesGrid[i] - slidesGrid[activeIndex] < swiperSize;
	          if (slideInView) {
	            spv += 1;
	          }
	        }
	      } else {
	        // previous
	        for (let i = activeIndex - 1; i >= 0; i -= 1) {
	          const slideInView = slidesGrid[activeIndex] - slidesGrid[i] < swiperSize;
	          if (slideInView) {
	            spv += 1;
	          }
	        }
	      }
	    }
	    return spv;
	  }
	  update() {
	    const swiper = this;
	    if (!swiper || swiper.destroyed) return;
	    const {
	      snapGrid,
	      params
	    } = swiper;
	    // Breakpoints
	    if (params.breakpoints) {
	      swiper.setBreakpoint();
	    }
	    [...swiper.el.querySelectorAll('[loading="lazy"]')].forEach(imageEl => {
	      if (imageEl.complete) {
	        processLazyPreloader(swiper, imageEl);
	      }
	    });
	    swiper.updateSize();
	    swiper.updateSlides();
	    swiper.updateProgress();
	    swiper.updateSlidesClasses();
	    function setTranslate() {
	      const translateValue = swiper.rtlTranslate ? swiper.translate * -1 : swiper.translate;
	      const newTranslate = Math.min(Math.max(translateValue, swiper.maxTranslate()), swiper.minTranslate());
	      swiper.setTranslate(newTranslate);
	      swiper.updateActiveIndex();
	      swiper.updateSlidesClasses();
	    }
	    let translated;
	    if (params.freeMode && params.freeMode.enabled && !params.cssMode) {
	      setTranslate();
	      if (params.autoHeight) {
	        swiper.updateAutoHeight();
	      }
	    } else {
	      if ((params.slidesPerView === 'auto' || params.slidesPerView > 1) && swiper.isEnd && !params.centeredSlides) {
	        const slides = swiper.virtual && params.virtual.enabled ? swiper.virtual.slides : swiper.slides;
	        translated = swiper.slideTo(slides.length - 1, 0, false, true);
	      } else {
	        translated = swiper.slideTo(swiper.activeIndex, 0, false, true);
	      }
	      if (!translated) {
	        setTranslate();
	      }
	    }
	    if (params.watchOverflow && snapGrid !== swiper.snapGrid) {
	      swiper.checkOverflow();
	    }
	    swiper.emit('update');
	  }
	  changeDirection(newDirection, needUpdate) {
	    if (needUpdate === void 0) {
	      needUpdate = true;
	    }
	    const swiper = this;
	    const currentDirection = swiper.params.direction;
	    if (!newDirection) {
	      // eslint-disable-next-line
	      newDirection = currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
	    }
	    if (newDirection === currentDirection || newDirection !== 'horizontal' && newDirection !== 'vertical') {
	      return swiper;
	    }
	    swiper.el.classList.remove(`${swiper.params.containerModifierClass}${currentDirection}`);
	    swiper.el.classList.add(`${swiper.params.containerModifierClass}${newDirection}`);
	    swiper.emitContainerClasses();
	    swiper.params.direction = newDirection;
	    swiper.slides.forEach(slideEl => {
	      if (newDirection === 'vertical') {
	        slideEl.style.width = '';
	      } else {
	        slideEl.style.height = '';
	      }
	    });
	    swiper.emit('changeDirection');
	    if (needUpdate) swiper.update();
	    return swiper;
	  }
	  changeLanguageDirection(direction) {
	    const swiper = this;
	    if (swiper.rtl && direction === 'rtl' || !swiper.rtl && direction === 'ltr') return;
	    swiper.rtl = direction === 'rtl';
	    swiper.rtlTranslate = swiper.params.direction === 'horizontal' && swiper.rtl;
	    if (swiper.rtl) {
	      swiper.el.classList.add(`${swiper.params.containerModifierClass}rtl`);
	      swiper.el.dir = 'rtl';
	    } else {
	      swiper.el.classList.remove(`${swiper.params.containerModifierClass}rtl`);
	      swiper.el.dir = 'ltr';
	    }
	    swiper.update();
	  }
	  mount(element) {
	    const swiper = this;
	    if (swiper.mounted) return true;

	    // Find el
	    let el = element || swiper.params.el;
	    if (typeof el === 'string') {
	      el = document.querySelector(el);
	    }
	    if (!el) {
	      return false;
	    }
	    el.swiper = swiper;
	    if (el.parentNode && el.parentNode.host && el.parentNode.host.nodeName === swiper.params.swiperElementNodeName.toUpperCase()) {
	      swiper.isElement = true;
	    }
	    const getWrapperSelector = () => {
	      return `.${(swiper.params.wrapperClass || '').trim().split(' ').join('.')}`;
	    };
	    const getWrapper = () => {
	      if (el && el.shadowRoot && el.shadowRoot.querySelector) {
	        const res = el.shadowRoot.querySelector(getWrapperSelector());
	        // Children needs to return slot items
	        return res;
	      }
	      return elementChildren(el, getWrapperSelector())[0];
	    };
	    // Find Wrapper
	    let wrapperEl = getWrapper();
	    if (!wrapperEl && swiper.params.createElements) {
	      wrapperEl = createElement('div', swiper.params.wrapperClass);
	      el.append(wrapperEl);
	      elementChildren(el, `.${swiper.params.slideClass}`).forEach(slideEl => {
	        wrapperEl.append(slideEl);
	      });
	    }
	    Object.assign(swiper, {
	      el,
	      wrapperEl,
	      slidesEl: swiper.isElement && !el.parentNode.host.slideSlots ? el.parentNode.host : wrapperEl,
	      hostEl: swiper.isElement ? el.parentNode.host : el,
	      mounted: true,
	      // RTL
	      rtl: el.dir.toLowerCase() === 'rtl' || elementStyle(el, 'direction') === 'rtl',
	      rtlTranslate: swiper.params.direction === 'horizontal' && (el.dir.toLowerCase() === 'rtl' || elementStyle(el, 'direction') === 'rtl'),
	      wrongRTL: elementStyle(wrapperEl, 'display') === '-webkit-box'
	    });
	    return true;
	  }
	  init(el) {
	    const swiper = this;
	    if (swiper.initialized) return swiper;
	    const mounted = swiper.mount(el);
	    if (mounted === false) return swiper;
	    swiper.emit('beforeInit');

	    // Set breakpoint
	    if (swiper.params.breakpoints) {
	      swiper.setBreakpoint();
	    }

	    // Add Classes
	    swiper.addClasses();

	    // Update size
	    swiper.updateSize();

	    // Update slides
	    swiper.updateSlides();
	    if (swiper.params.watchOverflow) {
	      swiper.checkOverflow();
	    }

	    // Set Grab Cursor
	    if (swiper.params.grabCursor && swiper.enabled) {
	      swiper.setGrabCursor();
	    }

	    // Slide To Initial Slide
	    if (swiper.params.loop && swiper.virtual && swiper.params.virtual.enabled) {
	      swiper.slideTo(swiper.params.initialSlide + swiper.virtual.slidesBefore, 0, swiper.params.runCallbacksOnInit, false, true);
	    } else {
	      swiper.slideTo(swiper.params.initialSlide, 0, swiper.params.runCallbacksOnInit, false, true);
	    }

	    // Create loop
	    if (swiper.params.loop) {
	      swiper.loopCreate();
	    }

	    // Attach events
	    swiper.attachEvents();
	    const lazyElements = [...swiper.el.querySelectorAll('[loading="lazy"]')];
	    if (swiper.isElement) {
	      lazyElements.push(...swiper.hostEl.querySelectorAll('[loading="lazy"]'));
	    }
	    lazyElements.forEach(imageEl => {
	      if (imageEl.complete) {
	        processLazyPreloader(swiper, imageEl);
	      } else {
	        imageEl.addEventListener('load', e => {
	          processLazyPreloader(swiper, e.target);
	        });
	      }
	    });
	    preload(swiper);

	    // Init Flag
	    swiper.initialized = true;
	    preload(swiper);

	    // Emit
	    swiper.emit('init');
	    swiper.emit('afterInit');
	    return swiper;
	  }
	  destroy(deleteInstance, cleanStyles) {
	    if (deleteInstance === void 0) {
	      deleteInstance = true;
	    }
	    if (cleanStyles === void 0) {
	      cleanStyles = true;
	    }
	    const swiper = this;
	    const {
	      params,
	      el,
	      wrapperEl,
	      slides
	    } = swiper;
	    if (typeof swiper.params === 'undefined' || swiper.destroyed) {
	      return null;
	    }
	    swiper.emit('beforeDestroy');

	    // Init Flag
	    swiper.initialized = false;

	    // Detach events
	    swiper.detachEvents();

	    // Destroy loop
	    if (params.loop) {
	      swiper.loopDestroy();
	    }

	    // Cleanup styles
	    if (cleanStyles) {
	      swiper.removeClasses();
	      if (el && typeof el !== 'string') {
	        el.removeAttribute('style');
	      }
	      if (wrapperEl) {
	        wrapperEl.removeAttribute('style');
	      }
	      if (slides && slides.length) {
	        slides.forEach(slideEl => {
	          slideEl.classList.remove(params.slideVisibleClass, params.slideFullyVisibleClass, params.slideActiveClass, params.slideNextClass, params.slidePrevClass);
	          slideEl.removeAttribute('style');
	          slideEl.removeAttribute('data-swiper-slide-index');
	        });
	      }
	    }
	    swiper.emit('destroy');

	    // Detach emitter events
	    Object.keys(swiper.eventsListeners).forEach(eventName => {
	      swiper.off(eventName);
	    });
	    if (deleteInstance !== false) {
	      if (swiper.el && typeof swiper.el !== 'string') {
	        swiper.el.swiper = null;
	      }
	      deleteProps(swiper);
	    }
	    swiper.destroyed = true;
	    return null;
	  }
	  static extendDefaults(newDefaults) {
	    extend(extendedDefaults, newDefaults);
	  }
	  static get extendedDefaults() {
	    return extendedDefaults;
	  }
	  static get defaults() {
	    return defaults;
	  }
	  static installModule(mod) {
	    if (!Swiper.prototype.__modules__) Swiper.prototype.__modules__ = [];
	    const modules = Swiper.prototype.__modules__;
	    if (typeof mod === 'function' && modules.indexOf(mod) < 0) {
	      modules.push(mod);
	    }
	  }
	  static use(module) {
	    if (Array.isArray(module)) {
	      module.forEach(m => Swiper.installModule(m));
	      return Swiper;
	    }
	    Swiper.installModule(module);
	    return Swiper;
	  }
	}
	Object.keys(prototypes).forEach(prototypeGroup => {
	  Object.keys(prototypes[prototypeGroup]).forEach(protoMethod => {
	    Swiper.prototype[protoMethod] = prototypes[prototypeGroup][protoMethod];
	  });
	});
	Swiper.use([Resize, Observer$1]);

	function createElementIfNotDefined(swiper, originalParams, params, checkProps) {
	  if (swiper.params.createElements) {
	    Object.keys(checkProps).forEach(key => {
	      if (!params[key] && params.auto === true) {
	        let element = elementChildren(swiper.el, `.${checkProps[key]}`)[0];
	        if (!element) {
	          element = createElement('div', checkProps[key]);
	          element.className = checkProps[key];
	          swiper.el.append(element);
	        }
	        params[key] = element;
	        originalParams[key] = element;
	      }
	    });
	  }
	  return params;
	}

	function Navigation(_ref) {
	  let {
	    swiper,
	    extendParams,
	    on,
	    emit
	  } = _ref;
	  extendParams({
	    navigation: {
	      nextEl: null,
	      prevEl: null,
	      hideOnClick: false,
	      disabledClass: 'swiper-button-disabled',
	      hiddenClass: 'swiper-button-hidden',
	      lockClass: 'swiper-button-lock',
	      navigationDisabledClass: 'swiper-navigation-disabled'
	    }
	  });
	  swiper.navigation = {
	    nextEl: null,
	    prevEl: null
	  };
	  function getEl(el) {
	    let res;
	    if (el && typeof el === 'string' && swiper.isElement) {
	      res = swiper.el.querySelector(el);
	      if (res) return res;
	    }
	    if (el) {
	      if (typeof el === 'string') res = [...document.querySelectorAll(el)];
	      if (swiper.params.uniqueNavElements && typeof el === 'string' && res && res.length > 1 && swiper.el.querySelectorAll(el).length === 1) {
	        res = swiper.el.querySelector(el);
	      } else if (res && res.length === 1) {
	        res = res[0];
	      }
	    }
	    if (el && !res) return el;
	    // if (Array.isArray(res) && res.length === 1) res = res[0];
	    return res;
	  }
	  function toggleEl(el, disabled) {
	    const params = swiper.params.navigation;
	    el = makeElementsArray(el);
	    el.forEach(subEl => {
	      if (subEl) {
	        subEl.classList[disabled ? 'add' : 'remove'](...params.disabledClass.split(' '));
	        if (subEl.tagName === 'BUTTON') subEl.disabled = disabled;
	        if (swiper.params.watchOverflow && swiper.enabled) {
	          subEl.classList[swiper.isLocked ? 'add' : 'remove'](params.lockClass);
	        }
	      }
	    });
	  }
	  function update() {
	    // Update Navigation Buttons
	    const {
	      nextEl,
	      prevEl
	    } = swiper.navigation;
	    if (swiper.params.loop) {
	      toggleEl(prevEl, false);
	      toggleEl(nextEl, false);
	      return;
	    }
	    toggleEl(prevEl, swiper.isBeginning && !swiper.params.rewind);
	    toggleEl(nextEl, swiper.isEnd && !swiper.params.rewind);
	  }
	  function onPrevClick(e) {
	    e.preventDefault();
	    if (swiper.isBeginning && !swiper.params.loop && !swiper.params.rewind) return;
	    swiper.slidePrev();
	    emit('navigationPrev');
	  }
	  function onNextClick(e) {
	    e.preventDefault();
	    if (swiper.isEnd && !swiper.params.loop && !swiper.params.rewind) return;
	    swiper.slideNext();
	    emit('navigationNext');
	  }
	  function init() {
	    const params = swiper.params.navigation;
	    swiper.params.navigation = createElementIfNotDefined(swiper, swiper.originalParams.navigation, swiper.params.navigation, {
	      nextEl: 'swiper-button-next',
	      prevEl: 'swiper-button-prev'
	    });
	    if (!(params.nextEl || params.prevEl)) return;
	    let nextEl = getEl(params.nextEl);
	    let prevEl = getEl(params.prevEl);
	    Object.assign(swiper.navigation, {
	      nextEl,
	      prevEl
	    });
	    nextEl = makeElementsArray(nextEl);
	    prevEl = makeElementsArray(prevEl);
	    const initButton = (el, dir) => {
	      if (el) {
	        el.addEventListener('click', dir === 'next' ? onNextClick : onPrevClick);
	      }
	      if (!swiper.enabled && el) {
	        el.classList.add(...params.lockClass.split(' '));
	      }
	    };
	    nextEl.forEach(el => initButton(el, 'next'));
	    prevEl.forEach(el => initButton(el, 'prev'));
	  }
	  function destroy() {
	    let {
	      nextEl,
	      prevEl
	    } = swiper.navigation;
	    nextEl = makeElementsArray(nextEl);
	    prevEl = makeElementsArray(prevEl);
	    const destroyButton = (el, dir) => {
	      el.removeEventListener('click', dir === 'next' ? onNextClick : onPrevClick);
	      el.classList.remove(...swiper.params.navigation.disabledClass.split(' '));
	    };
	    nextEl.forEach(el => destroyButton(el, 'next'));
	    prevEl.forEach(el => destroyButton(el, 'prev'));
	  }
	  on('init', () => {
	    if (swiper.params.navigation.enabled === false) {
	      // eslint-disable-next-line
	      disable();
	    } else {
	      init();
	      update();
	    }
	  });
	  on('toEdge fromEdge lock unlock', () => {
	    update();
	  });
	  on('destroy', () => {
	    destroy();
	  });
	  on('enable disable', () => {
	    let {
	      nextEl,
	      prevEl
	    } = swiper.navigation;
	    nextEl = makeElementsArray(nextEl);
	    prevEl = makeElementsArray(prevEl);
	    if (swiper.enabled) {
	      update();
	      return;
	    }
	    [...nextEl, ...prevEl].filter(el => !!el).forEach(el => el.classList.add(swiper.params.navigation.lockClass));
	  });
	  on('click', (_s, e) => {
	    let {
	      nextEl,
	      prevEl
	    } = swiper.navigation;
	    nextEl = makeElementsArray(nextEl);
	    prevEl = makeElementsArray(prevEl);
	    const targetEl = e.target;
	    let targetIsButton = prevEl.includes(targetEl) || nextEl.includes(targetEl);
	    if (swiper.isElement && !targetIsButton) {
	      const path = e.path || e.composedPath && e.composedPath();
	      if (path) {
	        targetIsButton = path.find(pathEl => nextEl.includes(pathEl) || prevEl.includes(pathEl));
	      }
	    }
	    if (swiper.params.navigation.hideOnClick && !targetIsButton) {
	      if (swiper.pagination && swiper.params.pagination && swiper.params.pagination.clickable && (swiper.pagination.el === targetEl || swiper.pagination.el.contains(targetEl))) return;
	      let isHidden;
	      if (nextEl.length) {
	        isHidden = nextEl[0].classList.contains(swiper.params.navigation.hiddenClass);
	      } else if (prevEl.length) {
	        isHidden = prevEl[0].classList.contains(swiper.params.navigation.hiddenClass);
	      }
	      if (isHidden === true) {
	        emit('navigationShow');
	      } else {
	        emit('navigationHide');
	      }
	      [...nextEl, ...prevEl].filter(el => !!el).forEach(el => el.classList.toggle(swiper.params.navigation.hiddenClass));
	    }
	  });
	  const enable = () => {
	    swiper.el.classList.remove(...swiper.params.navigation.navigationDisabledClass.split(' '));
	    init();
	    update();
	  };
	  const disable = () => {
	    swiper.el.classList.add(...swiper.params.navigation.navigationDisabledClass.split(' '));
	    destroy();
	  };
	  Object.assign(swiper.navigation, {
	    enable,
	    disable,
	    update,
	    init,
	    destroy
	  });
	}

	function classesToSelector(classes) {
	  if (classes === void 0) {
	    classes = '';
	  }
	  return `.${classes.trim().replace(/([\.:!+\/])/g, '\\$1') // eslint-disable-line
  .replace(/ /g, '.')}`;
	}

	function Pagination(_ref) {
	  let {
	    swiper,
	    extendParams,
	    on,
	    emit
	  } = _ref;
	  const pfx = 'swiper-pagination';
	  extendParams({
	    pagination: {
	      el: null,
	      bulletElement: 'span',
	      clickable: false,
	      hideOnClick: false,
	      renderBullet: null,
	      renderProgressbar: null,
	      renderFraction: null,
	      renderCustom: null,
	      progressbarOpposite: false,
	      type: 'bullets',
	      // 'bullets' or 'progressbar' or 'fraction' or 'custom'
	      dynamicBullets: false,
	      dynamicMainBullets: 1,
	      formatFractionCurrent: number => number,
	      formatFractionTotal: number => number,
	      bulletClass: `${pfx}-bullet`,
	      bulletActiveClass: `${pfx}-bullet-active`,
	      modifierClass: `${pfx}-`,
	      currentClass: `${pfx}-current`,
	      totalClass: `${pfx}-total`,
	      hiddenClass: `${pfx}-hidden`,
	      progressbarFillClass: `${pfx}-progressbar-fill`,
	      progressbarOppositeClass: `${pfx}-progressbar-opposite`,
	      clickableClass: `${pfx}-clickable`,
	      lockClass: `${pfx}-lock`,
	      horizontalClass: `${pfx}-horizontal`,
	      verticalClass: `${pfx}-vertical`,
	      paginationDisabledClass: `${pfx}-disabled`
	    }
	  });
	  swiper.pagination = {
	    el: null,
	    bullets: []
	  };
	  let bulletSize;
	  let dynamicBulletIndex = 0;
	  function isPaginationDisabled() {
	    return !swiper.params.pagination.el || !swiper.pagination.el || Array.isArray(swiper.pagination.el) && swiper.pagination.el.length === 0;
	  }
	  function setSideBullets(bulletEl, position) {
	    const {
	      bulletActiveClass
	    } = swiper.params.pagination;
	    if (!bulletEl) return;
	    bulletEl = bulletEl[`${position === 'prev' ? 'previous' : 'next'}ElementSibling`];
	    if (bulletEl) {
	      bulletEl.classList.add(`${bulletActiveClass}-${position}`);
	      bulletEl = bulletEl[`${position === 'prev' ? 'previous' : 'next'}ElementSibling`];
	      if (bulletEl) {
	        bulletEl.classList.add(`${bulletActiveClass}-${position}-${position}`);
	      }
	    }
	  }
	  function onBulletClick(e) {
	    const bulletEl = e.target.closest(classesToSelector(swiper.params.pagination.bulletClass));
	    if (!bulletEl) {
	      return;
	    }
	    e.preventDefault();
	    const index = elementIndex(bulletEl) * swiper.params.slidesPerGroup;
	    if (swiper.params.loop) {
	      if (swiper.realIndex === index) return;
	      swiper.slideToLoop(index);
	    } else {
	      swiper.slideTo(index);
	    }
	  }
	  function update() {
	    // Render || Update Pagination bullets/items
	    const rtl = swiper.rtl;
	    const params = swiper.params.pagination;
	    if (isPaginationDisabled()) return;
	    let el = swiper.pagination.el;
	    el = makeElementsArray(el);
	    // Current/Total
	    let current;
	    let previousIndex;
	    const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.slides.length;
	    const total = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
	    if (swiper.params.loop) {
	      previousIndex = swiper.previousRealIndex || 0;
	      current = swiper.params.slidesPerGroup > 1 ? Math.floor(swiper.realIndex / swiper.params.slidesPerGroup) : swiper.realIndex;
	    } else if (typeof swiper.snapIndex !== 'undefined') {
	      current = swiper.snapIndex;
	      previousIndex = swiper.previousSnapIndex;
	    } else {
	      previousIndex = swiper.previousIndex || 0;
	      current = swiper.activeIndex || 0;
	    }
	    // Types
	    if (params.type === 'bullets' && swiper.pagination.bullets && swiper.pagination.bullets.length > 0) {
	      const bullets = swiper.pagination.bullets;
	      let firstIndex;
	      let lastIndex;
	      let midIndex;
	      if (params.dynamicBullets) {
	        bulletSize = elementOuterSize(bullets[0], swiper.isHorizontal() ? 'width' : 'height');
	        el.forEach(subEl => {
	          subEl.style[swiper.isHorizontal() ? 'width' : 'height'] = `${bulletSize * (params.dynamicMainBullets + 4)}px`;
	        });
	        if (params.dynamicMainBullets > 1 && previousIndex !== undefined) {
	          dynamicBulletIndex += current - (previousIndex || 0);
	          if (dynamicBulletIndex > params.dynamicMainBullets - 1) {
	            dynamicBulletIndex = params.dynamicMainBullets - 1;
	          } else if (dynamicBulletIndex < 0) {
	            dynamicBulletIndex = 0;
	          }
	        }
	        firstIndex = Math.max(current - dynamicBulletIndex, 0);
	        lastIndex = firstIndex + (Math.min(bullets.length, params.dynamicMainBullets) - 1);
	        midIndex = (lastIndex + firstIndex) / 2;
	      }
	      bullets.forEach(bulletEl => {
	        const classesToRemove = [...['', '-next', '-next-next', '-prev', '-prev-prev', '-main'].map(suffix => `${params.bulletActiveClass}${suffix}`)].map(s => typeof s === 'string' && s.includes(' ') ? s.split(' ') : s).flat();
	        bulletEl.classList.remove(...classesToRemove);
	      });
	      if (el.length > 1) {
	        bullets.forEach(bullet => {
	          const bulletIndex = elementIndex(bullet);
	          if (bulletIndex === current) {
	            bullet.classList.add(...params.bulletActiveClass.split(' '));
	          } else if (swiper.isElement) {
	            bullet.setAttribute('part', 'bullet');
	          }
	          if (params.dynamicBullets) {
	            if (bulletIndex >= firstIndex && bulletIndex <= lastIndex) {
	              bullet.classList.add(...`${params.bulletActiveClass}-main`.split(' '));
	            }
	            if (bulletIndex === firstIndex) {
	              setSideBullets(bullet, 'prev');
	            }
	            if (bulletIndex === lastIndex) {
	              setSideBullets(bullet, 'next');
	            }
	          }
	        });
	      } else {
	        const bullet = bullets[current];
	        if (bullet) {
	          bullet.classList.add(...params.bulletActiveClass.split(' '));
	        }
	        if (swiper.isElement) {
	          bullets.forEach((bulletEl, bulletIndex) => {
	            bulletEl.setAttribute('part', bulletIndex === current ? 'bullet-active' : 'bullet');
	          });
	        }
	        if (params.dynamicBullets) {
	          const firstDisplayedBullet = bullets[firstIndex];
	          const lastDisplayedBullet = bullets[lastIndex];
	          for (let i = firstIndex; i <= lastIndex; i += 1) {
	            if (bullets[i]) {
	              bullets[i].classList.add(...`${params.bulletActiveClass}-main`.split(' '));
	            }
	          }
	          setSideBullets(firstDisplayedBullet, 'prev');
	          setSideBullets(lastDisplayedBullet, 'next');
	        }
	      }
	      if (params.dynamicBullets) {
	        const dynamicBulletsLength = Math.min(bullets.length, params.dynamicMainBullets + 4);
	        const bulletsOffset = (bulletSize * dynamicBulletsLength - bulletSize) / 2 - midIndex * bulletSize;
	        const offsetProp = rtl ? 'right' : 'left';
	        bullets.forEach(bullet => {
	          bullet.style[swiper.isHorizontal() ? offsetProp : 'top'] = `${bulletsOffset}px`;
	        });
	      }
	    }
	    el.forEach((subEl, subElIndex) => {
	      if (params.type === 'fraction') {
	        subEl.querySelectorAll(classesToSelector(params.currentClass)).forEach(fractionEl => {
	          fractionEl.textContent = params.formatFractionCurrent(current + 1);
	        });
	        subEl.querySelectorAll(classesToSelector(params.totalClass)).forEach(totalEl => {
	          totalEl.textContent = params.formatFractionTotal(total);
	        });
	      }
	      if (params.type === 'progressbar') {
	        let progressbarDirection;
	        if (params.progressbarOpposite) {
	          progressbarDirection = swiper.isHorizontal() ? 'vertical' : 'horizontal';
	        } else {
	          progressbarDirection = swiper.isHorizontal() ? 'horizontal' : 'vertical';
	        }
	        const scale = (current + 1) / total;
	        let scaleX = 1;
	        let scaleY = 1;
	        if (progressbarDirection === 'horizontal') {
	          scaleX = scale;
	        } else {
	          scaleY = scale;
	        }
	        subEl.querySelectorAll(classesToSelector(params.progressbarFillClass)).forEach(progressEl => {
	          progressEl.style.transform = `translate3d(0,0,0) scaleX(${scaleX}) scaleY(${scaleY})`;
	          progressEl.style.transitionDuration = `${swiper.params.speed}ms`;
	        });
	      }
	      if (params.type === 'custom' && params.renderCustom) {
	        subEl.innerHTML = params.renderCustom(swiper, current + 1, total);
	        if (subElIndex === 0) emit('paginationRender', subEl);
	      } else {
	        if (subElIndex === 0) emit('paginationRender', subEl);
	        emit('paginationUpdate', subEl);
	      }
	      if (swiper.params.watchOverflow && swiper.enabled) {
	        subEl.classList[swiper.isLocked ? 'add' : 'remove'](params.lockClass);
	      }
	    });
	  }
	  function render() {
	    // Render Container
	    const params = swiper.params.pagination;
	    if (isPaginationDisabled()) return;
	    const slidesLength = swiper.virtual && swiper.params.virtual.enabled ? swiper.virtual.slides.length : swiper.grid && swiper.params.grid.rows > 1 ? swiper.slides.length / Math.ceil(swiper.params.grid.rows) : swiper.slides.length;
	    let el = swiper.pagination.el;
	    el = makeElementsArray(el);
	    let paginationHTML = '';
	    if (params.type === 'bullets') {
	      let numberOfBullets = swiper.params.loop ? Math.ceil(slidesLength / swiper.params.slidesPerGroup) : swiper.snapGrid.length;
	      if (swiper.params.freeMode && swiper.params.freeMode.enabled && numberOfBullets > slidesLength) {
	        numberOfBullets = slidesLength;
	      }
	      for (let i = 0; i < numberOfBullets; i += 1) {
	        if (params.renderBullet) {
	          paginationHTML += params.renderBullet.call(swiper, i, params.bulletClass);
	        } else {
	          // prettier-ignore
	          paginationHTML += `<${params.bulletElement} ${swiper.isElement ? 'part="bullet"' : ''} class="${params.bulletClass}"></${params.bulletElement}>`;
	        }
	      }
	    }
	    if (params.type === 'fraction') {
	      if (params.renderFraction) {
	        paginationHTML = params.renderFraction.call(swiper, params.currentClass, params.totalClass);
	      } else {
	        paginationHTML = `<span class="${params.currentClass}"></span>` + ' / ' + `<span class="${params.totalClass}"></span>`;
	      }
	    }
	    if (params.type === 'progressbar') {
	      if (params.renderProgressbar) {
	        paginationHTML = params.renderProgressbar.call(swiper, params.progressbarFillClass);
	      } else {
	        paginationHTML = `<span class="${params.progressbarFillClass}"></span>`;
	      }
	    }
	    swiper.pagination.bullets = [];
	    el.forEach(subEl => {
	      if (params.type !== 'custom') {
	        subEl.innerHTML = paginationHTML || '';
	      }
	      if (params.type === 'bullets') {
	        swiper.pagination.bullets.push(...subEl.querySelectorAll(classesToSelector(params.bulletClass)));
	      }
	    });
	    if (params.type !== 'custom') {
	      emit('paginationRender', el[0]);
	    }
	  }
	  function init() {
	    swiper.params.pagination = createElementIfNotDefined(swiper, swiper.originalParams.pagination, swiper.params.pagination, {
	      el: 'swiper-pagination'
	    });
	    const params = swiper.params.pagination;
	    if (!params.el) return;
	    let el;
	    if (typeof params.el === 'string' && swiper.isElement) {
	      el = swiper.el.querySelector(params.el);
	    }
	    if (!el && typeof params.el === 'string') {
	      el = [...document.querySelectorAll(params.el)];
	    }
	    if (!el) {
	      el = params.el;
	    }
	    if (!el || el.length === 0) return;
	    if (swiper.params.uniqueNavElements && typeof params.el === 'string' && Array.isArray(el) && el.length > 1) {
	      el = [...swiper.el.querySelectorAll(params.el)];
	      // check if it belongs to another nested Swiper
	      if (el.length > 1) {
	        el = el.filter(subEl => {
	          if (elementParents(subEl, '.swiper')[0] !== swiper.el) return false;
	          return true;
	        })[0];
	      }
	    }
	    if (Array.isArray(el) && el.length === 1) el = el[0];
	    Object.assign(swiper.pagination, {
	      el
	    });
	    el = makeElementsArray(el);
	    el.forEach(subEl => {
	      if (params.type === 'bullets' && params.clickable) {
	        subEl.classList.add(...(params.clickableClass || '').split(' '));
	      }
	      subEl.classList.add(params.modifierClass + params.type);
	      subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
	      if (params.type === 'bullets' && params.dynamicBullets) {
	        subEl.classList.add(`${params.modifierClass}${params.type}-dynamic`);
	        dynamicBulletIndex = 0;
	        if (params.dynamicMainBullets < 1) {
	          params.dynamicMainBullets = 1;
	        }
	      }
	      if (params.type === 'progressbar' && params.progressbarOpposite) {
	        subEl.classList.add(params.progressbarOppositeClass);
	      }
	      if (params.clickable) {
	        subEl.addEventListener('click', onBulletClick);
	      }
	      if (!swiper.enabled) {
	        subEl.classList.add(params.lockClass);
	      }
	    });
	  }
	  function destroy() {
	    const params = swiper.params.pagination;
	    if (isPaginationDisabled()) return;
	    let el = swiper.pagination.el;
	    if (el) {
	      el = makeElementsArray(el);
	      el.forEach(subEl => {
	        subEl.classList.remove(params.hiddenClass);
	        subEl.classList.remove(params.modifierClass + params.type);
	        subEl.classList.remove(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
	        if (params.clickable) {
	          subEl.classList.remove(...(params.clickableClass || '').split(' '));
	          subEl.removeEventListener('click', onBulletClick);
	        }
	      });
	    }
	    if (swiper.pagination.bullets) swiper.pagination.bullets.forEach(subEl => subEl.classList.remove(...params.bulletActiveClass.split(' ')));
	  }
	  on('changeDirection', () => {
	    if (!swiper.pagination || !swiper.pagination.el) return;
	    const params = swiper.params.pagination;
	    let {
	      el
	    } = swiper.pagination;
	    el = makeElementsArray(el);
	    el.forEach(subEl => {
	      subEl.classList.remove(params.horizontalClass, params.verticalClass);
	      subEl.classList.add(swiper.isHorizontal() ? params.horizontalClass : params.verticalClass);
	    });
	  });
	  on('init', () => {
	    if (swiper.params.pagination.enabled === false) {
	      // eslint-disable-next-line
	      disable();
	    } else {
	      init();
	      render();
	      update();
	    }
	  });
	  on('activeIndexChange', () => {
	    if (typeof swiper.snapIndex === 'undefined') {
	      update();
	    }
	  });
	  on('snapIndexChange', () => {
	    update();
	  });
	  on('snapGridLengthChange', () => {
	    render();
	    update();
	  });
	  on('destroy', () => {
	    destroy();
	  });
	  on('enable disable', () => {
	    let {
	      el
	    } = swiper.pagination;
	    if (el) {
	      el = makeElementsArray(el);
	      el.forEach(subEl => subEl.classList[swiper.enabled ? 'remove' : 'add'](swiper.params.pagination.lockClass));
	    }
	  });
	  on('lock unlock', () => {
	    update();
	  });
	  on('click', (_s, e) => {
	    const targetEl = e.target;
	    const el = makeElementsArray(swiper.pagination.el);
	    if (swiper.params.pagination.el && swiper.params.pagination.hideOnClick && el && el.length > 0 && !targetEl.classList.contains(swiper.params.pagination.bulletClass)) {
	      if (swiper.navigation && (swiper.navigation.nextEl && targetEl === swiper.navigation.nextEl || swiper.navigation.prevEl && targetEl === swiper.navigation.prevEl)) return;
	      const isHidden = el[0].classList.contains(swiper.params.pagination.hiddenClass);
	      if (isHidden === true) {
	        emit('paginationShow');
	      } else {
	        emit('paginationHide');
	      }
	      el.forEach(subEl => subEl.classList.toggle(swiper.params.pagination.hiddenClass));
	    }
	  });
	  const enable = () => {
	    swiper.el.classList.remove(swiper.params.pagination.paginationDisabledClass);
	    let {
	      el
	    } = swiper.pagination;
	    if (el) {
	      el = makeElementsArray(el);
	      el.forEach(subEl => subEl.classList.remove(swiper.params.pagination.paginationDisabledClass));
	    }
	    init();
	    render();
	    update();
	  };
	  const disable = () => {
	    swiper.el.classList.add(swiper.params.pagination.paginationDisabledClass);
	    let {
	      el
	    } = swiper.pagination;
	    if (el) {
	      el = makeElementsArray(el);
	      el.forEach(subEl => subEl.classList.add(swiper.params.pagination.paginationDisabledClass));
	    }
	    destroy();
	  };
	  Object.assign(swiper.pagination, {
	    enable,
	    disable,
	    render,
	    update,
	    init,
	    destroy
	  });
	}

	/* eslint no-underscore-dangle: "off" */
	/* eslint no-use-before-define: "off" */
	function Autoplay(_ref) {
	  let {
	    swiper,
	    extendParams,
	    on,
	    emit,
	    params
	  } = _ref;
	  swiper.autoplay = {
	    running: false,
	    paused: false,
	    timeLeft: 0
	  };
	  extendParams({
	    autoplay: {
	      enabled: false,
	      delay: 3000,
	      waitForTransition: true,
	      disableOnInteraction: false,
	      stopOnLastSlide: false,
	      reverseDirection: false,
	      pauseOnMouseEnter: false
	    }
	  });
	  let timeout;
	  let raf;
	  let autoplayDelayTotal = params && params.autoplay ? params.autoplay.delay : 3000;
	  let autoplayDelayCurrent = params && params.autoplay ? params.autoplay.delay : 3000;
	  let autoplayTimeLeft;
	  let autoplayStartTime = new Date().getTime();
	  let wasPaused;
	  let isTouched;
	  let pausedByTouch;
	  let touchStartTimeout;
	  let slideChanged;
	  let pausedByInteraction;
	  let pausedByPointerEnter;
	  function onTransitionEnd(e) {
	    if (!swiper || swiper.destroyed || !swiper.wrapperEl) return;
	    if (e.target !== swiper.wrapperEl) return;
	    swiper.wrapperEl.removeEventListener('transitionend', onTransitionEnd);
	    if (pausedByPointerEnter || e.detail && e.detail.bySwiperTouchMove) {
	      return;
	    }
	    resume();
	  }
	  const calcTimeLeft = () => {
	    if (swiper.destroyed || !swiper.autoplay.running) return;
	    if (swiper.autoplay.paused) {
	      wasPaused = true;
	    } else if (wasPaused) {
	      autoplayDelayCurrent = autoplayTimeLeft;
	      wasPaused = false;
	    }
	    const timeLeft = swiper.autoplay.paused ? autoplayTimeLeft : autoplayStartTime + autoplayDelayCurrent - new Date().getTime();
	    swiper.autoplay.timeLeft = timeLeft;
	    emit('autoplayTimeLeft', timeLeft, timeLeft / autoplayDelayTotal);
	    raf = requestAnimationFrame(() => {
	      calcTimeLeft();
	    });
	  };
	  const getSlideDelay = () => {
	    let activeSlideEl;
	    if (swiper.virtual && swiper.params.virtual.enabled) {
	      activeSlideEl = swiper.slides.filter(slideEl => slideEl.classList.contains('swiper-slide-active'))[0];
	    } else {
	      activeSlideEl = swiper.slides[swiper.activeIndex];
	    }
	    if (!activeSlideEl) return undefined;
	    const currentSlideDelay = parseInt(activeSlideEl.getAttribute('data-swiper-autoplay'), 10);
	    return currentSlideDelay;
	  };
	  const run = delayForce => {
	    if (swiper.destroyed || !swiper.autoplay.running) return;
	    cancelAnimationFrame(raf);
	    calcTimeLeft();
	    let delay = typeof delayForce === 'undefined' ? swiper.params.autoplay.delay : delayForce;
	    autoplayDelayTotal = swiper.params.autoplay.delay;
	    autoplayDelayCurrent = swiper.params.autoplay.delay;
	    const currentSlideDelay = getSlideDelay();
	    if (!Number.isNaN(currentSlideDelay) && currentSlideDelay > 0 && typeof delayForce === 'undefined') {
	      delay = currentSlideDelay;
	      autoplayDelayTotal = currentSlideDelay;
	      autoplayDelayCurrent = currentSlideDelay;
	    }
	    autoplayTimeLeft = delay;
	    const speed = swiper.params.speed;
	    const proceed = () => {
	      if (!swiper || swiper.destroyed) return;
	      if (swiper.params.autoplay.reverseDirection) {
	        if (!swiper.isBeginning || swiper.params.loop || swiper.params.rewind) {
	          swiper.slidePrev(speed, true, true);
	          emit('autoplay');
	        } else if (!swiper.params.autoplay.stopOnLastSlide) {
	          swiper.slideTo(swiper.slides.length - 1, speed, true, true);
	          emit('autoplay');
	        }
	      } else {
	        if (!swiper.isEnd || swiper.params.loop || swiper.params.rewind) {
	          swiper.slideNext(speed, true, true);
	          emit('autoplay');
	        } else if (!swiper.params.autoplay.stopOnLastSlide) {
	          swiper.slideTo(0, speed, true, true);
	          emit('autoplay');
	        }
	      }
	      if (swiper.params.cssMode) {
	        autoplayStartTime = new Date().getTime();
	        requestAnimationFrame(() => {
	          run();
	        });
	      }
	    };
	    if (delay > 0) {
	      clearTimeout(timeout);
	      timeout = setTimeout(() => {
	        proceed();
	      }, delay);
	    } else {
	      requestAnimationFrame(() => {
	        proceed();
	      });
	    }

	    // eslint-disable-next-line
	    return delay;
	  };
	  const start = () => {
	    autoplayStartTime = new Date().getTime();
	    swiper.autoplay.running = true;
	    run();
	    emit('autoplayStart');
	  };
	  const stop = () => {
	    swiper.autoplay.running = false;
	    clearTimeout(timeout);
	    cancelAnimationFrame(raf);
	    emit('autoplayStop');
	  };
	  const pause = (internal, reset) => {
	    if (swiper.destroyed || !swiper.autoplay.running) return;
	    clearTimeout(timeout);
	    if (!internal) {
	      pausedByInteraction = true;
	    }
	    const proceed = () => {
	      emit('autoplayPause');
	      if (swiper.params.autoplay.waitForTransition) {
	        swiper.wrapperEl.addEventListener('transitionend', onTransitionEnd);
	      } else {
	        resume();
	      }
	    };
	    swiper.autoplay.paused = true;
	    if (reset) {
	      if (slideChanged) {
	        autoplayTimeLeft = swiper.params.autoplay.delay;
	      }
	      slideChanged = false;
	      proceed();
	      return;
	    }
	    const delay = autoplayTimeLeft || swiper.params.autoplay.delay;
	    autoplayTimeLeft = delay - (new Date().getTime() - autoplayStartTime);
	    if (swiper.isEnd && autoplayTimeLeft < 0 && !swiper.params.loop) return;
	    if (autoplayTimeLeft < 0) autoplayTimeLeft = 0;
	    proceed();
	  };
	  const resume = () => {
	    if (swiper.isEnd && autoplayTimeLeft < 0 && !swiper.params.loop || swiper.destroyed || !swiper.autoplay.running) return;
	    autoplayStartTime = new Date().getTime();
	    if (pausedByInteraction) {
	      pausedByInteraction = false;
	      run(autoplayTimeLeft);
	    } else {
	      run();
	    }
	    swiper.autoplay.paused = false;
	    emit('autoplayResume');
	  };
	  const onVisibilityChange = () => {
	    if (swiper.destroyed || !swiper.autoplay.running) return;
	    const document = getDocument();
	    if (document.visibilityState === 'hidden') {
	      pausedByInteraction = true;
	      pause(true);
	    }
	    if (document.visibilityState === 'visible') {
	      resume();
	    }
	  };
	  const onPointerEnter = e => {
	    if (e.pointerType !== 'mouse') return;
	    pausedByInteraction = true;
	    pausedByPointerEnter = true;
	    if (swiper.animating || swiper.autoplay.paused) return;
	    pause(true);
	  };
	  const onPointerLeave = e => {
	    if (e.pointerType !== 'mouse') return;
	    pausedByPointerEnter = false;
	    if (swiper.autoplay.paused) {
	      resume();
	    }
	  };
	  const attachMouseEvents = () => {
	    if (swiper.params.autoplay.pauseOnMouseEnter) {
	      swiper.el.addEventListener('pointerenter', onPointerEnter);
	      swiper.el.addEventListener('pointerleave', onPointerLeave);
	    }
	  };
	  const detachMouseEvents = () => {
	    if (swiper.el && typeof swiper.el !== 'string') {
	      swiper.el.removeEventListener('pointerenter', onPointerEnter);
	      swiper.el.removeEventListener('pointerleave', onPointerLeave);
	    }
	  };
	  const attachDocumentEvents = () => {
	    const document = getDocument();
	    document.addEventListener('visibilitychange', onVisibilityChange);
	  };
	  const detachDocumentEvents = () => {
	    const document = getDocument();
	    document.removeEventListener('visibilitychange', onVisibilityChange);
	  };
	  on('init', () => {
	    if (swiper.params.autoplay.enabled) {
	      attachMouseEvents();
	      attachDocumentEvents();
	      start();
	    }
	  });
	  on('destroy', () => {
	    detachMouseEvents();
	    detachDocumentEvents();
	    if (swiper.autoplay.running) {
	      stop();
	    }
	  });
	  on('_freeModeStaticRelease', () => {
	    if (pausedByTouch || pausedByInteraction) {
	      resume();
	    }
	  });
	  on('_freeModeNoMomentumRelease', () => {
	    if (!swiper.params.autoplay.disableOnInteraction) {
	      pause(true, true);
	    } else {
	      stop();
	    }
	  });
	  on('beforeTransitionStart', (_s, speed, internal) => {
	    if (swiper.destroyed || !swiper.autoplay.running) return;
	    if (internal || !swiper.params.autoplay.disableOnInteraction) {
	      pause(true, true);
	    } else {
	      stop();
	    }
	  });
	  on('sliderFirstMove', () => {
	    if (swiper.destroyed || !swiper.autoplay.running) return;
	    if (swiper.params.autoplay.disableOnInteraction) {
	      stop();
	      return;
	    }
	    isTouched = true;
	    pausedByTouch = false;
	    pausedByInteraction = false;
	    touchStartTimeout = setTimeout(() => {
	      pausedByInteraction = true;
	      pausedByTouch = true;
	      pause(true);
	    }, 200);
	  });
	  on('touchEnd', () => {
	    if (swiper.destroyed || !swiper.autoplay.running || !isTouched) return;
	    clearTimeout(touchStartTimeout);
	    clearTimeout(timeout);
	    if (swiper.params.autoplay.disableOnInteraction) {
	      pausedByTouch = false;
	      isTouched = false;
	      return;
	    }
	    if (pausedByTouch && swiper.params.cssMode) resume();
	    pausedByTouch = false;
	    isTouched = false;
	  });
	  on('slideChange', () => {
	    if (swiper.destroyed || !swiper.autoplay.running) return;
	    slideChanged = true;
	  });
	  Object.assign(swiper.autoplay, {
	    start,
	    stop,
	    pause,
	    resume
	  });
	}

	const sliders = document.querySelectorAll('.main-slider');
	if (sliders.length) {
	  sliders.forEach(slider => {
	    const pagination = slider.querySelector('.swiper-pagination');
	    const prevEl = slider.parentNode.querySelector('.swiper-button-prev');
	    const nextEl = slider.parentNode.querySelector('.swiper-button-next');
	    new Swiper(slider, {
	      modules: [Navigation, Pagination],
	      slidesPerView: 'auto',
	      spaceBetween: '30',
	      navigation: {
	        nextEl: nextEl ? nextEl : null,
	        prevEl: prevEl ? prevEl : null
	      },
	      pagination: {
	        el: pagination ? pagination : null,
	        dynamicBullets: true,
	        clickable: true
	      }
	    });
	  });
	}
	const heroSlider = document.querySelector('.hero-slider');
	if (heroSlider) {
	  const pagination = heroSlider.querySelector('.hero-slider .pagination');
	  new Swiper(heroSlider, {
	    modules: [Pagination, Autoplay],
	    slidesPerView: 1,
	    loop: true,
	    autoplay: {
	      delay: 10000
	    },
	    pagination: {
	      el: pagination ? pagination : null,
	      clickable: true
	    }
	  });
	}

	const accordeons = document.querySelectorAll('.main-accordeon');
	if (accordeons) {
	  accordeons.forEach(accordeon => {
	    const headers = accordeon.querySelectorAll('.main-accordeon__item-header');
	    const onClickHandler = evt => {
	      const isOpened = !evt.currentTarget.classList.contains('collapsed');
	      headers.forEach(header => {
	        !header.classList.contains('collapsed') ? header.classList.add('collapsed') : null;
	      });
	      isOpened ? evt.currentTarget.classList.add('collapsed') : evt.currentTarget.classList.remove('collapsed');
	    };
	    headers.forEach(header => {
	      header.addEventListener('click', onClickHandler);
	    });
	  });
	}

	/** Checks if value is string */
	function isString(str) {
	  return typeof str === 'string' || str instanceof String;
	}

	/** Checks if value is object */
	function isObject(obj) {
	  var _obj$constructor;
	  return typeof obj === 'object' && obj != null && (obj == null || (_obj$constructor = obj.constructor) == null ? void 0 : _obj$constructor.name) === 'Object';
	}
	function pick(obj, keys) {
	  if (Array.isArray(keys)) return pick(obj, (_, k) => keys.includes(k));
	  return Object.entries(obj).reduce((acc, _ref) => {
	    let [k, v] = _ref;
	    if (keys(v, k)) acc[k] = v;
	    return acc;
	  }, {});
	}

	/** Direction */
	const DIRECTION = {
	  NONE: 'NONE',
	  LEFT: 'LEFT',
	  FORCE_LEFT: 'FORCE_LEFT',
	  RIGHT: 'RIGHT',
	  FORCE_RIGHT: 'FORCE_RIGHT'
	};

	/** Direction */

	function forceDirection(direction) {
	  switch (direction) {
	    case DIRECTION.LEFT:
	      return DIRECTION.FORCE_LEFT;
	    case DIRECTION.RIGHT:
	      return DIRECTION.FORCE_RIGHT;
	    default:
	      return direction;
	  }
	}

	/** Escapes regular expression control chars */
	function escapeRegExp(str) {
	  return str.replace(/([.*+?^=!:${}()|[\]/\\])/g, '\\$1');
	}

	// cloned from https://github.com/epoberezkin/fast-deep-equal with small changes
	function objectIncludes(b, a) {
	  if (a === b) return true;
	  const arrA = Array.isArray(a),
	    arrB = Array.isArray(b);
	  let i;
	  if (arrA && arrB) {
	    if (a.length != b.length) return false;
	    for (i = 0; i < a.length; i++) if (!objectIncludes(a[i], b[i])) return false;
	    return true;
	  }
	  if (arrA != arrB) return false;
	  if (a && b && typeof a === 'object' && typeof b === 'object') {
	    const dateA = a instanceof Date,
	      dateB = b instanceof Date;
	    if (dateA && dateB) return a.getTime() == b.getTime();
	    if (dateA != dateB) return false;
	    const regexpA = a instanceof RegExp,
	      regexpB = b instanceof RegExp;
	    if (regexpA && regexpB) return a.toString() == b.toString();
	    if (regexpA != regexpB) return false;
	    const keys = Object.keys(a);
	    // if (keys.length !== Object.keys(b).length) return false;

	    for (i = 0; i < keys.length; i++) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
	    for (i = 0; i < keys.length; i++) if (!objectIncludes(b[keys[i]], a[keys[i]])) return false;
	    return true;
	  } else if (a && b && typeof a === 'function' && typeof b === 'function') {
	    return a.toString() === b.toString();
	  }
	  return false;
	}

	/** Provides details of changing input */
	class ActionDetails {
	  /** Current input value */

	  /** Current cursor position */

	  /** Old input value */

	  /** Old selection */

	  constructor(opts) {
	    Object.assign(this, opts);

	    // double check if left part was changed (autofilling, other non-standard input triggers)
	    while (this.value.slice(0, this.startChangePos) !== this.oldValue.slice(0, this.startChangePos)) {
	      --this.oldSelection.start;
	    }
	    if (this.insertedCount) {
	      // double check right part
	      while (this.value.slice(this.cursorPos) !== this.oldValue.slice(this.oldSelection.end)) {
	        if (this.value.length - this.cursorPos < this.oldValue.length - this.oldSelection.end) ++this.oldSelection.end;else ++this.cursorPos;
	      }
	    }
	  }

	  /** Start changing position */
	  get startChangePos() {
	    return Math.min(this.cursorPos, this.oldSelection.start);
	  }

	  /** Inserted symbols count */
	  get insertedCount() {
	    return this.cursorPos - this.startChangePos;
	  }

	  /** Inserted symbols */
	  get inserted() {
	    return this.value.substr(this.startChangePos, this.insertedCount);
	  }

	  /** Removed symbols count */
	  get removedCount() {
	    // Math.max for opposite operation
	    return Math.max(this.oldSelection.end - this.startChangePos ||
	    // for Delete
	    this.oldValue.length - this.value.length, 0);
	  }

	  /** Removed symbols */
	  get removed() {
	    return this.oldValue.substr(this.startChangePos, this.removedCount);
	  }

	  /** Unchanged head symbols */
	  get head() {
	    return this.value.substring(0, this.startChangePos);
	  }

	  /** Unchanged tail symbols */
	  get tail() {
	    return this.value.substring(this.startChangePos + this.insertedCount);
	  }

	  /** Remove direction */
	  get removeDirection() {
	    if (!this.removedCount || this.insertedCount) return DIRECTION.NONE;

	    // align right if delete at right
	    return (this.oldSelection.end === this.cursorPos || this.oldSelection.start === this.cursorPos) &&
	    // if not range removed (event with backspace)
	    this.oldSelection.end === this.oldSelection.start ? DIRECTION.RIGHT : DIRECTION.LEFT;
	  }
	}

	/** Applies mask on element */
	function IMask(el, opts) {
	  // currently available only for input-like elements
	  return new IMask.InputMask(el, opts);
	}

	// TODO can't use overloads here because of https://github.com/microsoft/TypeScript/issues/50754
	// export function maskedClass(mask: string): typeof MaskedPattern;
	// export function maskedClass(mask: DateConstructor): typeof MaskedDate;
	// export function maskedClass(mask: NumberConstructor): typeof MaskedNumber;
	// export function maskedClass(mask: Array<any> | ArrayConstructor): typeof MaskedDynamic;
	// export function maskedClass(mask: MaskedDate): typeof MaskedDate;
	// export function maskedClass(mask: MaskedNumber): typeof MaskedNumber;
	// export function maskedClass(mask: MaskedEnum): typeof MaskedEnum;
	// export function maskedClass(mask: MaskedRange): typeof MaskedRange;
	// export function maskedClass(mask: MaskedRegExp): typeof MaskedRegExp;
	// export function maskedClass(mask: MaskedFunction): typeof MaskedFunction;
	// export function maskedClass(mask: MaskedPattern): typeof MaskedPattern;
	// export function maskedClass(mask: MaskedDynamic): typeof MaskedDynamic;
	// export function maskedClass(mask: Masked): typeof Masked;
	// export function maskedClass(mask: typeof Masked): typeof Masked;
	// export function maskedClass(mask: typeof MaskedDate): typeof MaskedDate;
	// export function maskedClass(mask: typeof MaskedNumber): typeof MaskedNumber;
	// export function maskedClass(mask: typeof MaskedEnum): typeof MaskedEnum;
	// export function maskedClass(mask: typeof MaskedRange): typeof MaskedRange;
	// export function maskedClass(mask: typeof MaskedRegExp): typeof MaskedRegExp;
	// export function maskedClass(mask: typeof MaskedFunction): typeof MaskedFunction;
	// export function maskedClass(mask: typeof MaskedPattern): typeof MaskedPattern;
	// export function maskedClass(mask: typeof MaskedDynamic): typeof MaskedDynamic;
	// export function maskedClass<Mask extends typeof Masked> (mask: Mask): Mask;
	// export function maskedClass(mask: RegExp): typeof MaskedRegExp;
	// export function maskedClass(mask: (value: string, ...args: any[]) => boolean): typeof MaskedFunction;

	/** Get Masked class by mask type */
	function maskedClass(mask) /* TODO */{
	  if (mask == null) throw new Error('mask property should be defined');
	  if (mask instanceof RegExp) return IMask.MaskedRegExp;
	  if (isString(mask)) return IMask.MaskedPattern;
	  if (mask === Date) return IMask.MaskedDate;
	  if (mask === Number) return IMask.MaskedNumber;
	  if (Array.isArray(mask) || mask === Array) return IMask.MaskedDynamic;
	  if (IMask.Masked && mask.prototype instanceof IMask.Masked) return mask;
	  if (IMask.Masked && mask instanceof IMask.Masked) return mask.constructor;
	  if (mask instanceof Function) return IMask.MaskedFunction;
	  console.warn('Mask not found for mask', mask); // eslint-disable-line no-console
	  return IMask.Masked;
	}
	function normalizeOpts(opts) {
	  if (!opts) throw new Error('Options in not defined');
	  if (IMask.Masked) {
	    if (opts.prototype instanceof IMask.Masked) return {
	      mask: opts
	    };

	    /*
	      handle cases like:
	      1) opts = Masked
	      2) opts = { mask: Masked, ...instanceOpts }
	    */
	    const {
	      mask = undefined,
	      ...instanceOpts
	    } = opts instanceof IMask.Masked ? {
	      mask: opts
	    } : isObject(opts) && opts.mask instanceof IMask.Masked ? opts : {};
	    if (mask) {
	      const _mask = mask.mask;
	      return {
	        ...pick(mask, (_, k) => !k.startsWith('_')),
	        mask: mask.constructor,
	        _mask,
	        ...instanceOpts
	      };
	    }
	  }
	  if (!isObject(opts)) return {
	    mask: opts
	  };
	  return {
	    ...opts
	  };
	}

	// TODO can't use overloads here because of https://github.com/microsoft/TypeScript/issues/50754

	// From masked
	// export default function createMask<Opts extends Masked, ReturnMasked=Opts> (opts: Opts): ReturnMasked;
	// // From masked class
	// export default function createMask<Opts extends MaskedOptions<typeof Masked>, ReturnMasked extends Masked=InstanceType<Opts['mask']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedOptions<typeof MaskedDate>, ReturnMasked extends MaskedDate=MaskedDate<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedOptions<typeof MaskedNumber>, ReturnMasked extends MaskedNumber=MaskedNumber<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedOptions<typeof MaskedEnum>, ReturnMasked extends MaskedEnum=MaskedEnum<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedOptions<typeof MaskedRange>, ReturnMasked extends MaskedRange=MaskedRange<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedOptions<typeof MaskedRegExp>, ReturnMasked extends MaskedRegExp=MaskedRegExp<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedOptions<typeof MaskedFunction>, ReturnMasked extends MaskedFunction=MaskedFunction<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedOptions<typeof MaskedPattern>, ReturnMasked extends MaskedPattern=MaskedPattern<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedOptions<typeof MaskedDynamic>, ReturnMasked extends MaskedDynamic=MaskedDynamic<Opts['parent']>> (opts: Opts): ReturnMasked;
	// // From mask opts
	// export default function createMask<Opts extends MaskedOptions<Masked>, ReturnMasked=Opts extends MaskedOptions<infer M> ? M : never> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedNumberOptions, ReturnMasked extends MaskedNumber=MaskedNumber<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedDateFactoryOptions, ReturnMasked extends MaskedDate=MaskedDate<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedEnumOptions, ReturnMasked extends MaskedEnum=MaskedEnum<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedRangeOptions, ReturnMasked extends MaskedRange=MaskedRange<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedPatternOptions, ReturnMasked extends MaskedPattern=MaskedPattern<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedDynamicOptions, ReturnMasked extends MaskedDynamic=MaskedDynamic<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedOptions<RegExp>, ReturnMasked extends MaskedRegExp=MaskedRegExp<Opts['parent']>> (opts: Opts): ReturnMasked;
	// export default function createMask<Opts extends MaskedOptions<Function>, ReturnMasked extends MaskedFunction=MaskedFunction<Opts['parent']>> (opts: Opts): ReturnMasked;

	/** Creates new {@link Masked} depending on mask type */
	function createMask(opts) {
	  if (IMask.Masked && opts instanceof IMask.Masked) return opts;
	  const nOpts = normalizeOpts(opts);
	  const MaskedClass = maskedClass(nOpts.mask);
	  if (!MaskedClass) throw new Error("Masked class is not found for provided mask " + nOpts.mask + ", appropriate module needs to be imported manually before creating mask.");
	  if (nOpts.mask === MaskedClass) delete nOpts.mask;
	  if (nOpts._mask) {
	    nOpts.mask = nOpts._mask;
	    delete nOpts._mask;
	  }
	  return new MaskedClass(nOpts);
	}
	IMask.createMask = createMask;

	/**  Generic element API to use with mask */
	class MaskElement {
	  /** */

	  /** */

	  /** */

	  /** Safely returns selection start */
	  get selectionStart() {
	    let start;
	    try {
	      start = this._unsafeSelectionStart;
	    } catch {}
	    return start != null ? start : this.value.length;
	  }

	  /** Safely returns selection end */
	  get selectionEnd() {
	    let end;
	    try {
	      end = this._unsafeSelectionEnd;
	    } catch {}
	    return end != null ? end : this.value.length;
	  }

	  /** Safely sets element selection */
	  select(start, end) {
	    if (start == null || end == null || start === this.selectionStart && end === this.selectionEnd) return;
	    try {
	      this._unsafeSelect(start, end);
	    } catch {}
	  }

	  /** */
	  get isActive() {
	    return false;
	  }
	  /** */

	  /** */

	  /** */
	}
	IMask.MaskElement = MaskElement;

	const KEY_Z = 90;
	const KEY_Y = 89;

	/** Bridge between HTMLElement and {@link Masked} */
	class HTMLMaskElement extends MaskElement {
	  /** HTMLElement to use mask on */

	  constructor(input) {
	    super();
	    this.input = input;
	    this._onKeydown = this._onKeydown.bind(this);
	    this._onInput = this._onInput.bind(this);
	    this._onBeforeinput = this._onBeforeinput.bind(this);
	    this._onCompositionEnd = this._onCompositionEnd.bind(this);
	  }
	  get rootElement() {
	    var _this$input$getRootNo, _this$input$getRootNo2, _this$input;
	    return (_this$input$getRootNo = (_this$input$getRootNo2 = (_this$input = this.input).getRootNode) == null ? void 0 : _this$input$getRootNo2.call(_this$input)) != null ? _this$input$getRootNo : document;
	  }

	  /** Is element in focus */
	  get isActive() {
	    return this.input === this.rootElement.activeElement;
	  }

	  /** Binds HTMLElement events to mask internal events */
	  bindEvents(handlers) {
	    this.input.addEventListener('keydown', this._onKeydown);
	    this.input.addEventListener('input', this._onInput);
	    this.input.addEventListener('beforeinput', this._onBeforeinput);
	    this.input.addEventListener('compositionend', this._onCompositionEnd);
	    this.input.addEventListener('drop', handlers.drop);
	    this.input.addEventListener('click', handlers.click);
	    this.input.addEventListener('focus', handlers.focus);
	    this.input.addEventListener('blur', handlers.commit);
	    this._handlers = handlers;
	  }
	  _onKeydown(e) {
	    if (this._handlers.redo && (e.keyCode === KEY_Z && e.shiftKey && (e.metaKey || e.ctrlKey) || e.keyCode === KEY_Y && e.ctrlKey)) {
	      e.preventDefault();
	      return this._handlers.redo(e);
	    }
	    if (this._handlers.undo && e.keyCode === KEY_Z && (e.metaKey || e.ctrlKey)) {
	      e.preventDefault();
	      return this._handlers.undo(e);
	    }
	    if (!e.isComposing) this._handlers.selectionChange(e);
	  }
	  _onBeforeinput(e) {
	    if (e.inputType === 'historyUndo' && this._handlers.undo) {
	      e.preventDefault();
	      return this._handlers.undo(e);
	    }
	    if (e.inputType === 'historyRedo' && this._handlers.redo) {
	      e.preventDefault();
	      return this._handlers.redo(e);
	    }
	  }
	  _onCompositionEnd(e) {
	    this._handlers.input(e);
	  }
	  _onInput(e) {
	    if (!e.isComposing) this._handlers.input(e);
	  }

	  /** Unbinds HTMLElement events to mask internal events */
	  unbindEvents() {
	    this.input.removeEventListener('keydown', this._onKeydown);
	    this.input.removeEventListener('input', this._onInput);
	    this.input.removeEventListener('beforeinput', this._onBeforeinput);
	    this.input.removeEventListener('compositionend', this._onCompositionEnd);
	    this.input.removeEventListener('drop', this._handlers.drop);
	    this.input.removeEventListener('click', this._handlers.click);
	    this.input.removeEventListener('focus', this._handlers.focus);
	    this.input.removeEventListener('blur', this._handlers.commit);
	    this._handlers = {};
	  }
	}
	IMask.HTMLMaskElement = HTMLMaskElement;

	/** Bridge between InputElement and {@link Masked} */
	class HTMLInputMaskElement extends HTMLMaskElement {
	  /** InputElement to use mask on */

	  constructor(input) {
	    super(input);
	    this.input = input;
	  }

	  /** Returns InputElement selection start */
	  get _unsafeSelectionStart() {
	    return this.input.selectionStart != null ? this.input.selectionStart : this.value.length;
	  }

	  /** Returns InputElement selection end */
	  get _unsafeSelectionEnd() {
	    return this.input.selectionEnd;
	  }

	  /** Sets InputElement selection */
	  _unsafeSelect(start, end) {
	    this.input.setSelectionRange(start, end);
	  }
	  get value() {
	    return this.input.value;
	  }
	  set value(value) {
	    this.input.value = value;
	  }
	}
	IMask.HTMLMaskElement = HTMLMaskElement;

	class HTMLContenteditableMaskElement extends HTMLMaskElement {
	  /** Returns HTMLElement selection start */
	  get _unsafeSelectionStart() {
	    const root = this.rootElement;
	    const selection = root.getSelection && root.getSelection();
	    const anchorOffset = selection && selection.anchorOffset;
	    const focusOffset = selection && selection.focusOffset;
	    if (focusOffset == null || anchorOffset == null || anchorOffset < focusOffset) {
	      return anchorOffset;
	    }
	    return focusOffset;
	  }

	  /** Returns HTMLElement selection end */
	  get _unsafeSelectionEnd() {
	    const root = this.rootElement;
	    const selection = root.getSelection && root.getSelection();
	    const anchorOffset = selection && selection.anchorOffset;
	    const focusOffset = selection && selection.focusOffset;
	    if (focusOffset == null || anchorOffset == null || anchorOffset > focusOffset) {
	      return anchorOffset;
	    }
	    return focusOffset;
	  }

	  /** Sets HTMLElement selection */
	  _unsafeSelect(start, end) {
	    if (!this.rootElement.createRange) return;
	    const range = this.rootElement.createRange();
	    range.setStart(this.input.firstChild || this.input, start);
	    range.setEnd(this.input.lastChild || this.input, end);
	    const root = this.rootElement;
	    const selection = root.getSelection && root.getSelection();
	    if (selection) {
	      selection.removeAllRanges();
	      selection.addRange(range);
	    }
	  }

	  /** HTMLElement value */
	  get value() {
	    return this.input.textContent || '';
	  }
	  set value(value) {
	    this.input.textContent = value;
	  }
	}
	IMask.HTMLContenteditableMaskElement = HTMLContenteditableMaskElement;

	class InputHistory {
	  constructor() {
	    this.states = [];
	    this.currentIndex = 0;
	  }
	  get currentState() {
	    return this.states[this.currentIndex];
	  }
	  get isEmpty() {
	    return this.states.length === 0;
	  }
	  push(state) {
	    // if current index points before the last element then remove the future
	    if (this.currentIndex < this.states.length - 1) this.states.length = this.currentIndex + 1;
	    this.states.push(state);
	    if (this.states.length > InputHistory.MAX_LENGTH) this.states.shift();
	    this.currentIndex = this.states.length - 1;
	  }
	  go(steps) {
	    this.currentIndex = Math.min(Math.max(this.currentIndex + steps, 0), this.states.length - 1);
	    return this.currentState;
	  }
	  undo() {
	    return this.go(-1);
	  }
	  redo() {
	    return this.go(+1);
	  }
	  clear() {
	    this.states.length = 0;
	    this.currentIndex = 0;
	  }
	}
	InputHistory.MAX_LENGTH = 100;

	/** Listens to element events and controls changes between element and {@link Masked} */
	class InputMask {
	  /**
	    View element
	  */

	  /** Internal {@link Masked} model */

	  constructor(el, opts) {
	    this.el = el instanceof MaskElement ? el : el.isContentEditable && el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA' ? new HTMLContenteditableMaskElement(el) : new HTMLInputMaskElement(el);
	    this.masked = createMask(opts);
	    this._listeners = {};
	    this._value = '';
	    this._unmaskedValue = '';
	    this._rawInputValue = '';
	    this.history = new InputHistory();
	    this._saveSelection = this._saveSelection.bind(this);
	    this._onInput = this._onInput.bind(this);
	    this._onChange = this._onChange.bind(this);
	    this._onDrop = this._onDrop.bind(this);
	    this._onFocus = this._onFocus.bind(this);
	    this._onClick = this._onClick.bind(this);
	    this._onUndo = this._onUndo.bind(this);
	    this._onRedo = this._onRedo.bind(this);
	    this.alignCursor = this.alignCursor.bind(this);
	    this.alignCursorFriendly = this.alignCursorFriendly.bind(this);
	    this._bindEvents();

	    // refresh
	    this.updateValue();
	    this._onChange();
	  }
	  maskEquals(mask) {
	    var _this$masked;
	    return mask == null || ((_this$masked = this.masked) == null ? void 0 : _this$masked.maskEquals(mask));
	  }

	  /** Masked */
	  get mask() {
	    return this.masked.mask;
	  }
	  set mask(mask) {
	    if (this.maskEquals(mask)) return;
	    if (!(mask instanceof IMask.Masked) && this.masked.constructor === maskedClass(mask)) {
	      // TODO "any" no idea
	      this.masked.updateOptions({
	        mask
	      });
	      return;
	    }
	    const masked = mask instanceof IMask.Masked ? mask : createMask({
	      mask
	    });
	    masked.unmaskedValue = this.masked.unmaskedValue;
	    this.masked = masked;
	  }

	  /** Raw value */
	  get value() {
	    return this._value;
	  }
	  set value(str) {
	    if (this.value === str) return;
	    this.masked.value = str;
	    this.updateControl('auto');
	  }

	  /** Unmasked value */
	  get unmaskedValue() {
	    return this._unmaskedValue;
	  }
	  set unmaskedValue(str) {
	    if (this.unmaskedValue === str) return;
	    this.masked.unmaskedValue = str;
	    this.updateControl('auto');
	  }

	  /** Raw input value */
	  get rawInputValue() {
	    return this._rawInputValue;
	  }
	  set rawInputValue(str) {
	    if (this.rawInputValue === str) return;
	    this.masked.rawInputValue = str;
	    this.updateControl();
	    this.alignCursor();
	  }

	  /** Typed unmasked value */
	  get typedValue() {
	    return this.masked.typedValue;
	  }
	  set typedValue(val) {
	    if (this.masked.typedValueEquals(val)) return;
	    this.masked.typedValue = val;
	    this.updateControl('auto');
	  }

	  /** Display value */
	  get displayValue() {
	    return this.masked.displayValue;
	  }

	  /** Starts listening to element events */
	  _bindEvents() {
	    this.el.bindEvents({
	      selectionChange: this._saveSelection,
	      input: this._onInput,
	      drop: this._onDrop,
	      click: this._onClick,
	      focus: this._onFocus,
	      commit: this._onChange,
	      undo: this._onUndo,
	      redo: this._onRedo
	    });
	  }

	  /** Stops listening to element events */
	  _unbindEvents() {
	    if (this.el) this.el.unbindEvents();
	  }

	  /** Fires custom event */
	  _fireEvent(ev, e) {
	    const listeners = this._listeners[ev];
	    if (!listeners) return;
	    listeners.forEach(l => l(e));
	  }

	  /** Current selection start */
	  get selectionStart() {
	    return this._cursorChanging ? this._changingCursorPos : this.el.selectionStart;
	  }

	  /** Current cursor position */
	  get cursorPos() {
	    return this._cursorChanging ? this._changingCursorPos : this.el.selectionEnd;
	  }
	  set cursorPos(pos) {
	    if (!this.el || !this.el.isActive) return;
	    this.el.select(pos, pos);
	    this._saveSelection();
	  }

	  /** Stores current selection */
	  _saveSelection( /* ev */
	  ) {
	    if (this.displayValue !== this.el.value) {
	      console.warn('Element value was changed outside of mask. Syncronize mask using `mask.updateValue()` to work properly.'); // eslint-disable-line no-console
	    }
	    this._selection = {
	      start: this.selectionStart,
	      end: this.cursorPos
	    };
	  }

	  /** Syncronizes model value from view */
	  updateValue() {
	    this.masked.value = this.el.value;
	    this._value = this.masked.value;
	    this._unmaskedValue = this.masked.unmaskedValue;
	    this._rawInputValue = this.masked.rawInputValue;
	  }

	  /** Syncronizes view from model value, fires change events */
	  updateControl(cursorPos) {
	    const newUnmaskedValue = this.masked.unmaskedValue;
	    const newValue = this.masked.value;
	    const newRawInputValue = this.masked.rawInputValue;
	    const newDisplayValue = this.displayValue;
	    const isChanged = this.unmaskedValue !== newUnmaskedValue || this.value !== newValue || this._rawInputValue !== newRawInputValue;
	    this._unmaskedValue = newUnmaskedValue;
	    this._value = newValue;
	    this._rawInputValue = newRawInputValue;
	    if (this.el.value !== newDisplayValue) this.el.value = newDisplayValue;
	    if (cursorPos === 'auto') this.alignCursor();else if (cursorPos != null) this.cursorPos = cursorPos;
	    if (isChanged) this._fireChangeEvents();
	    if (!this._historyChanging && (isChanged || this.history.isEmpty)) this.history.push({
	      unmaskedValue: newUnmaskedValue,
	      selection: {
	        start: this.selectionStart,
	        end: this.cursorPos
	      }
	    });
	  }

	  /** Updates options with deep equal check, recreates {@link Masked} model if mask type changes */
	  updateOptions(opts) {
	    const {
	      mask,
	      ...restOpts
	    } = opts; // TODO types, yes, mask is optional

	    const updateMask = !this.maskEquals(mask);
	    const updateOpts = this.masked.optionsIsChanged(restOpts);
	    if (updateMask) this.mask = mask;
	    if (updateOpts) this.masked.updateOptions(restOpts); // TODO

	    if (updateMask || updateOpts) this.updateControl();
	  }

	  /** Updates cursor */
	  updateCursor(cursorPos) {
	    if (cursorPos == null) return;
	    this.cursorPos = cursorPos;

	    // also queue change cursor for mobile browsers
	    this._delayUpdateCursor(cursorPos);
	  }

	  /** Delays cursor update to support mobile browsers */
	  _delayUpdateCursor(cursorPos) {
	    this._abortUpdateCursor();
	    this._changingCursorPos = cursorPos;
	    this._cursorChanging = setTimeout(() => {
	      if (!this.el) return; // if was destroyed
	      this.cursorPos = this._changingCursorPos;
	      this._abortUpdateCursor();
	    }, 10);
	  }

	  /** Fires custom events */
	  _fireChangeEvents() {
	    this._fireEvent('accept', this._inputEvent);
	    if (this.masked.isComplete) this._fireEvent('complete', this._inputEvent);
	  }

	  /** Aborts delayed cursor update */
	  _abortUpdateCursor() {
	    if (this._cursorChanging) {
	      clearTimeout(this._cursorChanging);
	      delete this._cursorChanging;
	    }
	  }

	  /** Aligns cursor to nearest available position */
	  alignCursor() {
	    this.cursorPos = this.masked.nearestInputPos(this.masked.nearestInputPos(this.cursorPos, DIRECTION.LEFT));
	  }

	  /** Aligns cursor only if selection is empty */
	  alignCursorFriendly() {
	    if (this.selectionStart !== this.cursorPos) return; // skip if range is selected
	    this.alignCursor();
	  }

	  /** Adds listener on custom event */
	  on(ev, handler) {
	    if (!this._listeners[ev]) this._listeners[ev] = [];
	    this._listeners[ev].push(handler);
	    return this;
	  }

	  /** Removes custom event listener */
	  off(ev, handler) {
	    if (!this._listeners[ev]) return this;
	    if (!handler) {
	      delete this._listeners[ev];
	      return this;
	    }
	    const hIndex = this._listeners[ev].indexOf(handler);
	    if (hIndex >= 0) this._listeners[ev].splice(hIndex, 1);
	    return this;
	  }

	  /** Handles view input event */
	  _onInput(e) {
	    this._inputEvent = e;
	    this._abortUpdateCursor();
	    const details = new ActionDetails({
	      // new state
	      value: this.el.value,
	      cursorPos: this.cursorPos,
	      // old state
	      oldValue: this.displayValue,
	      oldSelection: this._selection
	    });
	    const oldRawValue = this.masked.rawInputValue;
	    const offset = this.masked.splice(details.startChangePos, details.removed.length, details.inserted, details.removeDirection, {
	      input: true,
	      raw: true
	    }).offset;

	    // force align in remove direction only if no input chars were removed
	    // otherwise we still need to align with NONE (to get out from fixed symbols for instance)
	    const removeDirection = oldRawValue === this.masked.rawInputValue ? details.removeDirection : DIRECTION.NONE;
	    let cursorPos = this.masked.nearestInputPos(details.startChangePos + offset, removeDirection);
	    if (removeDirection !== DIRECTION.NONE) cursorPos = this.masked.nearestInputPos(cursorPos, DIRECTION.NONE);
	    this.updateControl(cursorPos);
	    delete this._inputEvent;
	  }

	  /** Handles view change event and commits model value */
	  _onChange() {
	    if (this.displayValue !== this.el.value) this.updateValue();
	    this.masked.doCommit();
	    this.updateControl();
	    this._saveSelection();
	  }

	  /** Handles view drop event, prevents by default */
	  _onDrop(ev) {
	    ev.preventDefault();
	    ev.stopPropagation();
	  }

	  /** Restore last selection on focus */
	  _onFocus(ev) {
	    this.alignCursorFriendly();
	  }

	  /** Restore last selection on focus */
	  _onClick(ev) {
	    this.alignCursorFriendly();
	  }
	  _onUndo() {
	    this._applyHistoryState(this.history.undo());
	  }
	  _onRedo() {
	    this._applyHistoryState(this.history.redo());
	  }
	  _applyHistoryState(state) {
	    if (!state) return;
	    this._historyChanging = true;
	    this.unmaskedValue = state.unmaskedValue;
	    this.el.select(state.selection.start, state.selection.end);
	    this._saveSelection();
	    this._historyChanging = false;
	  }

	  /** Unbind view events and removes element reference */
	  destroy() {
	    this._unbindEvents();
	    this._listeners.length = 0;
	    delete this.el;
	  }
	}
	IMask.InputMask = InputMask;

	/** Provides details of changing model value */
	class ChangeDetails {
	  /** Inserted symbols */

	  /** Additional offset if any changes occurred before tail */

	  /** Raw inserted is used by dynamic mask */

	  /** Can skip chars */

	  static normalize(prep) {
	    return Array.isArray(prep) ? prep : [prep, new ChangeDetails()];
	  }
	  constructor(details) {
	    Object.assign(this, {
	      inserted: '',
	      rawInserted: '',
	      tailShift: 0,
	      skip: false
	    }, details);
	  }

	  /** Aggregate changes */
	  aggregate(details) {
	    this.inserted += details.inserted;
	    this.rawInserted += details.rawInserted;
	    this.tailShift += details.tailShift;
	    this.skip = this.skip || details.skip;
	    return this;
	  }

	  /** Total offset considering all changes */
	  get offset() {
	    return this.tailShift + this.inserted.length;
	  }
	  get consumed() {
	    return Boolean(this.rawInserted) || this.skip;
	  }
	  equals(details) {
	    return this.inserted === details.inserted && this.tailShift === details.tailShift && this.rawInserted === details.rawInserted && this.skip === details.skip;
	  }
	}
	IMask.ChangeDetails = ChangeDetails;

	/** Provides details of continuous extracted tail */
	class ContinuousTailDetails {
	  /** Tail value as string */

	  /** Tail start position */

	  /** Start position */

	  constructor(value, from, stop) {
	    if (value === void 0) {
	      value = '';
	    }
	    if (from === void 0) {
	      from = 0;
	    }
	    this.value = value;
	    this.from = from;
	    this.stop = stop;
	  }
	  toString() {
	    return this.value;
	  }
	  extend(tail) {
	    this.value += String(tail);
	  }
	  appendTo(masked) {
	    return masked.append(this.toString(), {
	      tail: true
	    }).aggregate(masked._appendPlaceholder());
	  }
	  get state() {
	    return {
	      value: this.value,
	      from: this.from,
	      stop: this.stop
	    };
	  }
	  set state(state) {
	    Object.assign(this, state);
	  }
	  unshift(beforePos) {
	    if (!this.value.length || beforePos != null && this.from >= beforePos) return '';
	    const shiftChar = this.value[0];
	    this.value = this.value.slice(1);
	    return shiftChar;
	  }
	  shift() {
	    if (!this.value.length) return '';
	    const shiftChar = this.value[this.value.length - 1];
	    this.value = this.value.slice(0, -1);
	    return shiftChar;
	  }
	}

	/** Append flags */

	/** Extract flags */

	// see https://github.com/microsoft/TypeScript/issues/6223

	/** Provides common masking stuff */
	class Masked {
	  /** */

	  /** */

	  /** Transforms value before mask processing */

	  /** Transforms each char before mask processing */

	  /** Validates if value is acceptable */

	  /** Does additional processing at the end of editing */

	  /** Format typed value to string */

	  /** Parse string to get typed value */

	  /** Enable characters overwriting */

	  /** */

	  /** */

	  /** */

	  /** */

	  constructor(opts) {
	    this._value = '';
	    this._update({
	      ...Masked.DEFAULTS,
	      ...opts
	    });
	    this._initialized = true;
	  }

	  /** Sets and applies new options */
	  updateOptions(opts) {
	    if (!this.optionsIsChanged(opts)) return;
	    this.withValueRefresh(this._update.bind(this, opts));
	  }

	  /** Sets new options */
	  _update(opts) {
	    Object.assign(this, opts);
	  }

	  /** Mask state */
	  get state() {
	    return {
	      _value: this.value,
	      _rawInputValue: this.rawInputValue
	    };
	  }
	  set state(state) {
	    this._value = state._value;
	  }

	  /** Resets value */
	  reset() {
	    this._value = '';
	  }
	  get value() {
	    return this._value;
	  }
	  set value(value) {
	    this.resolve(value, {
	      input: true
	    });
	  }

	  /** Resolve new value */
	  resolve(value, flags) {
	    if (flags === void 0) {
	      flags = {
	        input: true
	      };
	    }
	    this.reset();
	    this.append(value, flags, '');
	    this.doCommit();
	  }
	  get unmaskedValue() {
	    return this.value;
	  }
	  set unmaskedValue(value) {
	    this.resolve(value, {});
	  }
	  get typedValue() {
	    return this.parse ? this.parse(this.value, this) : this.unmaskedValue;
	  }
	  set typedValue(value) {
	    if (this.format) {
	      this.value = this.format(value, this);
	    } else {
	      this.unmaskedValue = String(value);
	    }
	  }

	  /** Value that includes raw user input */
	  get rawInputValue() {
	    return this.extractInput(0, this.displayValue.length, {
	      raw: true
	    });
	  }
	  set rawInputValue(value) {
	    this.resolve(value, {
	      raw: true
	    });
	  }
	  get displayValue() {
	    return this.value;
	  }
	  get isComplete() {
	    return true;
	  }
	  get isFilled() {
	    return this.isComplete;
	  }

	  /** Finds nearest input position in direction */
	  nearestInputPos(cursorPos, direction) {
	    return cursorPos;
	  }
	  totalInputPositions(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    return Math.min(this.displayValue.length, toPos - fromPos);
	  }

	  /** Extracts value in range considering flags */
	  extractInput(fromPos, toPos, flags) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    return this.displayValue.slice(fromPos, toPos);
	  }

	  /** Extracts tail in range */
	  extractTail(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    return new ContinuousTailDetails(this.extractInput(fromPos, toPos), fromPos);
	  }

	  /** Appends tail */
	  appendTail(tail) {
	    if (isString(tail)) tail = new ContinuousTailDetails(String(tail));
	    return tail.appendTo(this);
	  }

	  /** Appends char */
	  _appendCharRaw(ch, flags) {
	    if (!ch) return new ChangeDetails();
	    this._value += ch;
	    return new ChangeDetails({
	      inserted: ch,
	      rawInserted: ch
	    });
	  }

	  /** Appends char */
	  _appendChar(ch, flags, checkTail) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    const consistentState = this.state;
	    let details;
	    [ch, details] = this.doPrepareChar(ch, flags);
	    if (ch) {
	      details = details.aggregate(this._appendCharRaw(ch, flags));

	      // TODO handle `skip`?

	      // try `autofix` lookahead
	      if (!details.rawInserted && this.autofix === 'pad') {
	        const noFixState = this.state;
	        this.state = consistentState;
	        let fixDetails = this.pad(flags);
	        const chDetails = this._appendCharRaw(ch, flags);
	        fixDetails = fixDetails.aggregate(chDetails);

	        // if fix was applied or
	        // if details are equal use skip restoring state optimization
	        if (chDetails.rawInserted || fixDetails.equals(details)) {
	          details = fixDetails;
	        } else {
	          this.state = noFixState;
	        }
	      }
	    }
	    if (details.inserted) {
	      let consistentTail;
	      let appended = this.doValidate(flags) !== false;
	      if (appended && checkTail != null) {
	        // validation ok, check tail
	        const beforeTailState = this.state;
	        if (this.overwrite === true) {
	          consistentTail = checkTail.state;
	          for (let i = 0; i < details.rawInserted.length; ++i) {
	            checkTail.unshift(this.displayValue.length - details.tailShift);
	          }
	        }
	        let tailDetails = this.appendTail(checkTail);
	        appended = tailDetails.rawInserted.length === checkTail.toString().length;

	        // not ok, try shift
	        if (!(appended && tailDetails.inserted) && this.overwrite === 'shift') {
	          this.state = beforeTailState;
	          consistentTail = checkTail.state;
	          for (let i = 0; i < details.rawInserted.length; ++i) {
	            checkTail.shift();
	          }
	          tailDetails = this.appendTail(checkTail);
	          appended = tailDetails.rawInserted.length === checkTail.toString().length;
	        }

	        // if ok, rollback state after tail
	        if (appended && tailDetails.inserted) this.state = beforeTailState;
	      }

	      // revert all if something went wrong
	      if (!appended) {
	        details = new ChangeDetails();
	        this.state = consistentState;
	        if (checkTail && consistentTail) checkTail.state = consistentTail;
	      }
	    }
	    return details;
	  }

	  /** Appends optional placeholder at the end */
	  _appendPlaceholder() {
	    return new ChangeDetails();
	  }

	  /** Appends optional eager placeholder at the end */
	  _appendEager() {
	    return new ChangeDetails();
	  }

	  /** Appends symbols considering flags */
	  append(str, flags, tail) {
	    if (!isString(str)) throw new Error('value should be string');
	    const checkTail = isString(tail) ? new ContinuousTailDetails(String(tail)) : tail;
	    if (flags != null && flags.tail) flags._beforeTailState = this.state;
	    let details;
	    [str, details] = this.doPrepare(str, flags);
	    for (let ci = 0; ci < str.length; ++ci) {
	      const d = this._appendChar(str[ci], flags, checkTail);
	      if (!d.rawInserted && !this.doSkipInvalid(str[ci], flags, checkTail)) break;
	      details.aggregate(d);
	    }
	    if ((this.eager === true || this.eager === 'append') && flags != null && flags.input && str) {
	      details.aggregate(this._appendEager());
	    }

	    // append tail but aggregate only tailShift
	    if (checkTail != null) {
	      details.tailShift += this.appendTail(checkTail).tailShift;
	      // TODO it's a good idea to clear state after appending ends
	      // but it causes bugs when one append calls another (when dynamic dispatch set rawInputValue)
	      // this._resetBeforeTailState();
	    }
	    return details;
	  }
	  remove(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    this._value = this.displayValue.slice(0, fromPos) + this.displayValue.slice(toPos);
	    return new ChangeDetails();
	  }

	  /** Calls function and reapplies current value */
	  withValueRefresh(fn) {
	    if (this._refreshing || !this._initialized) return fn();
	    this._refreshing = true;
	    const rawInput = this.rawInputValue;
	    const value = this.value;
	    const ret = fn();
	    this.rawInputValue = rawInput;
	    // append lost trailing chars at the end
	    if (this.value && this.value !== value && value.indexOf(this.value) === 0) {
	      this.append(value.slice(this.displayValue.length), {}, '');
	      this.doCommit();
	    }
	    delete this._refreshing;
	    return ret;
	  }
	  runIsolated(fn) {
	    if (this._isolated || !this._initialized) return fn(this);
	    this._isolated = true;
	    const state = this.state;
	    const ret = fn(this);
	    this.state = state;
	    delete this._isolated;
	    return ret;
	  }
	  doSkipInvalid(ch, flags, checkTail) {
	    return Boolean(this.skipInvalid);
	  }

	  /** Prepares string before mask processing */
	  doPrepare(str, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    return ChangeDetails.normalize(this.prepare ? this.prepare(str, this, flags) : str);
	  }

	  /** Prepares each char before mask processing */
	  doPrepareChar(str, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    return ChangeDetails.normalize(this.prepareChar ? this.prepareChar(str, this, flags) : str);
	  }

	  /** Validates if value is acceptable */
	  doValidate(flags) {
	    return (!this.validate || this.validate(this.value, this, flags)) && (!this.parent || this.parent.doValidate(flags));
	  }

	  /** Does additional processing at the end of editing */
	  doCommit() {
	    if (this.commit) this.commit(this.value, this);
	  }
	  splice(start, deleteCount, inserted, removeDirection, flags) {
	    if (inserted === void 0) {
	      inserted = '';
	    }
	    if (removeDirection === void 0) {
	      removeDirection = DIRECTION.NONE;
	    }
	    if (flags === void 0) {
	      flags = {
	        input: true
	      };
	    }
	    const tailPos = start + deleteCount;
	    const tail = this.extractTail(tailPos);
	    const eagerRemove = this.eager === true || this.eager === 'remove';
	    let oldRawValue;
	    if (eagerRemove) {
	      removeDirection = forceDirection(removeDirection);
	      oldRawValue = this.extractInput(0, tailPos, {
	        raw: true
	      });
	    }
	    let startChangePos = start;
	    const details = new ChangeDetails();

	    // if it is just deletion without insertion
	    if (removeDirection !== DIRECTION.NONE) {
	      startChangePos = this.nearestInputPos(start, deleteCount > 1 && start !== 0 && !eagerRemove ? DIRECTION.NONE : removeDirection);

	      // adjust tailShift if start was aligned
	      details.tailShift = startChangePos - start;
	    }
	    details.aggregate(this.remove(startChangePos));
	    if (eagerRemove && removeDirection !== DIRECTION.NONE && oldRawValue === this.rawInputValue) {
	      if (removeDirection === DIRECTION.FORCE_LEFT) {
	        let valLength;
	        while (oldRawValue === this.rawInputValue && (valLength = this.displayValue.length)) {
	          details.aggregate(new ChangeDetails({
	            tailShift: -1
	          })).aggregate(this.remove(valLength - 1));
	        }
	      } else if (removeDirection === DIRECTION.FORCE_RIGHT) {
	        tail.unshift();
	      }
	    }
	    return details.aggregate(this.append(inserted, flags, tail));
	  }
	  maskEquals(mask) {
	    return this.mask === mask;
	  }
	  optionsIsChanged(opts) {
	    return !objectIncludes(this, opts);
	  }
	  typedValueEquals(value) {
	    const tval = this.typedValue;
	    return value === tval || Masked.EMPTY_VALUES.includes(value) && Masked.EMPTY_VALUES.includes(tval) || (this.format ? this.format(value, this) === this.format(this.typedValue, this) : false);
	  }
	  pad(flags) {
	    return new ChangeDetails();
	  }
	}
	Masked.DEFAULTS = {
	  skipInvalid: true
	};
	Masked.EMPTY_VALUES = [undefined, null, ''];
	IMask.Masked = Masked;

	class ChunksTailDetails {
	  /** */

	  constructor(chunks, from) {
	    if (chunks === void 0) {
	      chunks = [];
	    }
	    if (from === void 0) {
	      from = 0;
	    }
	    this.chunks = chunks;
	    this.from = from;
	  }
	  toString() {
	    return this.chunks.map(String).join('');
	  }
	  extend(tailChunk) {
	    if (!String(tailChunk)) return;
	    tailChunk = isString(tailChunk) ? new ContinuousTailDetails(String(tailChunk)) : tailChunk;
	    const lastChunk = this.chunks[this.chunks.length - 1];
	    const extendLast = lastChunk && (
	    // if stops are same or tail has no stop
	    lastChunk.stop === tailChunk.stop || tailChunk.stop == null) &&
	    // if tail chunk goes just after last chunk
	    tailChunk.from === lastChunk.from + lastChunk.toString().length;
	    if (tailChunk instanceof ContinuousTailDetails) {
	      // check the ability to extend previous chunk
	      if (extendLast) {
	        // extend previous chunk
	        lastChunk.extend(tailChunk.toString());
	      } else {
	        // append new chunk
	        this.chunks.push(tailChunk);
	      }
	    } else if (tailChunk instanceof ChunksTailDetails) {
	      if (tailChunk.stop == null) {
	        // unwrap floating chunks to parent, keeping `from` pos
	        let firstTailChunk;
	        while (tailChunk.chunks.length && tailChunk.chunks[0].stop == null) {
	          firstTailChunk = tailChunk.chunks.shift(); // not possible to be `undefined` because length was checked above
	          firstTailChunk.from += tailChunk.from;
	          this.extend(firstTailChunk);
	        }
	      }

	      // if tail chunk still has value
	      if (tailChunk.toString()) {
	        // if chunks contains stops, then popup stop to container
	        tailChunk.stop = tailChunk.blockIndex;
	        this.chunks.push(tailChunk);
	      }
	    }
	  }
	  appendTo(masked) {
	    if (!(masked instanceof IMask.MaskedPattern)) {
	      const tail = new ContinuousTailDetails(this.toString());
	      return tail.appendTo(masked);
	    }
	    const details = new ChangeDetails();
	    for (let ci = 0; ci < this.chunks.length; ++ci) {
	      const chunk = this.chunks[ci];
	      const lastBlockIter = masked._mapPosToBlock(masked.displayValue.length);
	      const stop = chunk.stop;
	      let chunkBlock;
	      if (stop != null && (
	      // if block not found or stop is behind lastBlock
	      !lastBlockIter || lastBlockIter.index <= stop)) {
	        if (chunk instanceof ChunksTailDetails ||
	        // for continuous block also check if stop is exist
	        masked._stops.indexOf(stop) >= 0) {
	          details.aggregate(masked._appendPlaceholder(stop));
	        }
	        chunkBlock = chunk instanceof ChunksTailDetails && masked._blocks[stop];
	      }
	      if (chunkBlock) {
	        const tailDetails = chunkBlock.appendTail(chunk);
	        details.aggregate(tailDetails);

	        // get not inserted chars
	        const remainChars = chunk.toString().slice(tailDetails.rawInserted.length);
	        if (remainChars) details.aggregate(masked.append(remainChars, {
	          tail: true
	        }));
	      } else {
	        details.aggregate(masked.append(chunk.toString(), {
	          tail: true
	        }));
	      }
	    }
	    return details;
	  }
	  get state() {
	    return {
	      chunks: this.chunks.map(c => c.state),
	      from: this.from,
	      stop: this.stop,
	      blockIndex: this.blockIndex
	    };
	  }
	  set state(state) {
	    const {
	      chunks,
	      ...props
	    } = state;
	    Object.assign(this, props);
	    this.chunks = chunks.map(cstate => {
	      const chunk = "chunks" in cstate ? new ChunksTailDetails() : new ContinuousTailDetails();
	      chunk.state = cstate;
	      return chunk;
	    });
	  }
	  unshift(beforePos) {
	    if (!this.chunks.length || beforePos != null && this.from >= beforePos) return '';
	    const chunkShiftPos = beforePos != null ? beforePos - this.from : beforePos;
	    let ci = 0;
	    while (ci < this.chunks.length) {
	      const chunk = this.chunks[ci];
	      const shiftChar = chunk.unshift(chunkShiftPos);
	      if (chunk.toString()) {
	        // chunk still contains value
	        // but not shifted - means no more available chars to shift
	        if (!shiftChar) break;
	        ++ci;
	      } else {
	        // clean if chunk has no value
	        this.chunks.splice(ci, 1);
	      }
	      if (shiftChar) return shiftChar;
	    }
	    return '';
	  }
	  shift() {
	    if (!this.chunks.length) return '';
	    let ci = this.chunks.length - 1;
	    while (0 <= ci) {
	      const chunk = this.chunks[ci];
	      const shiftChar = chunk.shift();
	      if (chunk.toString()) {
	        // chunk still contains value
	        // but not shifted - means no more available chars to shift
	        if (!shiftChar) break;
	        --ci;
	      } else {
	        // clean if chunk has no value
	        this.chunks.splice(ci, 1);
	      }
	      if (shiftChar) return shiftChar;
	    }
	    return '';
	  }
	}

	class PatternCursor {
	  constructor(masked, pos) {
	    this.masked = masked;
	    this._log = [];
	    const {
	      offset,
	      index
	    } = masked._mapPosToBlock(pos) || (pos < 0 ?
	    // first
	    {
	      index: 0,
	      offset: 0
	    } :
	    // last
	    {
	      index: this.masked._blocks.length,
	      offset: 0
	    });
	    this.offset = offset;
	    this.index = index;
	    this.ok = false;
	  }
	  get block() {
	    return this.masked._blocks[this.index];
	  }
	  get pos() {
	    return this.masked._blockStartPos(this.index) + this.offset;
	  }
	  get state() {
	    return {
	      index: this.index,
	      offset: this.offset,
	      ok: this.ok
	    };
	  }
	  set state(s) {
	    Object.assign(this, s);
	  }
	  pushState() {
	    this._log.push(this.state);
	  }
	  popState() {
	    const s = this._log.pop();
	    if (s) this.state = s;
	    return s;
	  }
	  bindBlock() {
	    if (this.block) return;
	    if (this.index < 0) {
	      this.index = 0;
	      this.offset = 0;
	    }
	    if (this.index >= this.masked._blocks.length) {
	      this.index = this.masked._blocks.length - 1;
	      this.offset = this.block.displayValue.length; // TODO this is stupid type error, `block` depends on index that was changed above
	    }
	  }
	  _pushLeft(fn) {
	    this.pushState();
	    for (this.bindBlock(); 0 <= this.index; --this.index, this.offset = ((_this$block = this.block) == null ? void 0 : _this$block.displayValue.length) || 0) {
	      var _this$block;
	      if (fn()) return this.ok = true;
	    }
	    return this.ok = false;
	  }
	  _pushRight(fn) {
	    this.pushState();
	    for (this.bindBlock(); this.index < this.masked._blocks.length; ++this.index, this.offset = 0) {
	      if (fn()) return this.ok = true;
	    }
	    return this.ok = false;
	  }
	  pushLeftBeforeFilled() {
	    return this._pushLeft(() => {
	      if (this.block.isFixed || !this.block.value) return;
	      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.FORCE_LEFT);
	      if (this.offset !== 0) return true;
	    });
	  }
	  pushLeftBeforeInput() {
	    // cases:
	    // filled input: 00|
	    // optional empty input: 00[]|
	    // nested block: XX<[]>|
	    return this._pushLeft(() => {
	      if (this.block.isFixed) return;
	      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.LEFT);
	      return true;
	    });
	  }
	  pushLeftBeforeRequired() {
	    return this._pushLeft(() => {
	      if (this.block.isFixed || this.block.isOptional && !this.block.value) return;
	      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.LEFT);
	      return true;
	    });
	  }
	  pushRightBeforeFilled() {
	    return this._pushRight(() => {
	      if (this.block.isFixed || !this.block.value) return;
	      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.FORCE_RIGHT);
	      if (this.offset !== this.block.value.length) return true;
	    });
	  }
	  pushRightBeforeInput() {
	    return this._pushRight(() => {
	      if (this.block.isFixed) return;

	      // const o = this.offset;
	      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.NONE);
	      // HACK cases like (STILL DOES NOT WORK FOR NESTED)
	      // aa|X
	      // aa<X|[]>X_    - this will not work
	      // if (o && o === this.offset && this.block instanceof PatternInputDefinition) continue;
	      return true;
	    });
	  }
	  pushRightBeforeRequired() {
	    return this._pushRight(() => {
	      if (this.block.isFixed || this.block.isOptional && !this.block.value) return;

	      // TODO check |[*]XX_
	      this.offset = this.block.nearestInputPos(this.offset, DIRECTION.NONE);
	      return true;
	    });
	  }
	}

	class PatternFixedDefinition {
	  /** */

	  /** */

	  /** */

	  /** */

	  /** */

	  /** */

	  constructor(opts) {
	    Object.assign(this, opts);
	    this._value = '';
	    this.isFixed = true;
	  }
	  get value() {
	    return this._value;
	  }
	  get unmaskedValue() {
	    return this.isUnmasking ? this.value : '';
	  }
	  get rawInputValue() {
	    return this._isRawInput ? this.value : '';
	  }
	  get displayValue() {
	    return this.value;
	  }
	  reset() {
	    this._isRawInput = false;
	    this._value = '';
	  }
	  remove(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this._value.length;
	    }
	    this._value = this._value.slice(0, fromPos) + this._value.slice(toPos);
	    if (!this._value) this._isRawInput = false;
	    return new ChangeDetails();
	  }
	  nearestInputPos(cursorPos, direction) {
	    if (direction === void 0) {
	      direction = DIRECTION.NONE;
	    }
	    const minPos = 0;
	    const maxPos = this._value.length;
	    switch (direction) {
	      case DIRECTION.LEFT:
	      case DIRECTION.FORCE_LEFT:
	        return minPos;
	      case DIRECTION.NONE:
	      case DIRECTION.RIGHT:
	      case DIRECTION.FORCE_RIGHT:
	      default:
	        return maxPos;
	    }
	  }
	  totalInputPositions(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this._value.length;
	    }
	    return this._isRawInput ? toPos - fromPos : 0;
	  }
	  extractInput(fromPos, toPos, flags) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this._value.length;
	    }
	    if (flags === void 0) {
	      flags = {};
	    }
	    return flags.raw && this._isRawInput && this._value.slice(fromPos, toPos) || '';
	  }
	  get isComplete() {
	    return true;
	  }
	  get isFilled() {
	    return Boolean(this._value);
	  }
	  _appendChar(ch, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    if (this.isFilled) return new ChangeDetails();
	    const appendEager = this.eager === true || this.eager === 'append';
	    const appended = this.char === ch;
	    const isResolved = appended && (this.isUnmasking || flags.input || flags.raw) && (!flags.raw || !appendEager) && !flags.tail;
	    const details = new ChangeDetails({
	      inserted: this.char,
	      rawInserted: isResolved ? this.char : ''
	    });
	    this._value = this.char;
	    this._isRawInput = isResolved && (flags.raw || flags.input);
	    return details;
	  }
	  _appendEager() {
	    return this._appendChar(this.char, {
	      tail: true
	    });
	  }
	  _appendPlaceholder() {
	    const details = new ChangeDetails();
	    if (this.isFilled) return details;
	    this._value = details.inserted = this.char;
	    return details;
	  }
	  extractTail() {
	    return new ContinuousTailDetails('');
	  }
	  appendTail(tail) {
	    if (isString(tail)) tail = new ContinuousTailDetails(String(tail));
	    return tail.appendTo(this);
	  }
	  append(str, flags, tail) {
	    const details = this._appendChar(str[0], flags);
	    if (tail != null) {
	      details.tailShift += this.appendTail(tail).tailShift;
	    }
	    return details;
	  }
	  doCommit() {}
	  get state() {
	    return {
	      _value: this._value,
	      _rawInputValue: this.rawInputValue
	    };
	  }
	  set state(state) {
	    this._value = state._value;
	    this._isRawInput = Boolean(state._rawInputValue);
	  }
	  pad(flags) {
	    return this._appendPlaceholder();
	  }
	}

	class PatternInputDefinition {
	  /** */

	  /** */

	  /** */

	  /** */

	  /** */

	  /** */

	  /** */

	  /** */

	  constructor(opts) {
	    const {
	      parent,
	      isOptional,
	      placeholderChar,
	      displayChar,
	      lazy,
	      eager,
	      ...maskOpts
	    } = opts;
	    this.masked = createMask(maskOpts);
	    Object.assign(this, {
	      parent,
	      isOptional,
	      placeholderChar,
	      displayChar,
	      lazy,
	      eager
	    });
	  }
	  reset() {
	    this.isFilled = false;
	    this.masked.reset();
	  }
	  remove(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.value.length;
	    }
	    if (fromPos === 0 && toPos >= 1) {
	      this.isFilled = false;
	      return this.masked.remove(fromPos, toPos);
	    }
	    return new ChangeDetails();
	  }
	  get value() {
	    return this.masked.value || (this.isFilled && !this.isOptional ? this.placeholderChar : '');
	  }
	  get unmaskedValue() {
	    return this.masked.unmaskedValue;
	  }
	  get rawInputValue() {
	    return this.masked.rawInputValue;
	  }
	  get displayValue() {
	    return this.masked.value && this.displayChar || this.value;
	  }
	  get isComplete() {
	    return Boolean(this.masked.value) || this.isOptional;
	  }
	  _appendChar(ch, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    if (this.isFilled) return new ChangeDetails();
	    const state = this.masked.state;
	    // simulate input
	    let details = this.masked._appendChar(ch, this.currentMaskFlags(flags));
	    if (details.inserted && this.doValidate(flags) === false) {
	      details = new ChangeDetails();
	      this.masked.state = state;
	    }
	    if (!details.inserted && !this.isOptional && !this.lazy && !flags.input) {
	      details.inserted = this.placeholderChar;
	    }
	    details.skip = !details.inserted && !this.isOptional;
	    this.isFilled = Boolean(details.inserted);
	    return details;
	  }
	  append(str, flags, tail) {
	    // TODO probably should be done via _appendChar
	    return this.masked.append(str, this.currentMaskFlags(flags), tail);
	  }
	  _appendPlaceholder() {
	    if (this.isFilled || this.isOptional) return new ChangeDetails();
	    this.isFilled = true;
	    return new ChangeDetails({
	      inserted: this.placeholderChar
	    });
	  }
	  _appendEager() {
	    return new ChangeDetails();
	  }
	  extractTail(fromPos, toPos) {
	    return this.masked.extractTail(fromPos, toPos);
	  }
	  appendTail(tail) {
	    return this.masked.appendTail(tail);
	  }
	  extractInput(fromPos, toPos, flags) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.value.length;
	    }
	    return this.masked.extractInput(fromPos, toPos, flags);
	  }
	  nearestInputPos(cursorPos, direction) {
	    if (direction === void 0) {
	      direction = DIRECTION.NONE;
	    }
	    const minPos = 0;
	    const maxPos = this.value.length;
	    const boundPos = Math.min(Math.max(cursorPos, minPos), maxPos);
	    switch (direction) {
	      case DIRECTION.LEFT:
	      case DIRECTION.FORCE_LEFT:
	        return this.isComplete ? boundPos : minPos;
	      case DIRECTION.RIGHT:
	      case DIRECTION.FORCE_RIGHT:
	        return this.isComplete ? boundPos : maxPos;
	      case DIRECTION.NONE:
	      default:
	        return boundPos;
	    }
	  }
	  totalInputPositions(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.value.length;
	    }
	    return this.value.slice(fromPos, toPos).length;
	  }
	  doValidate(flags) {
	    return this.masked.doValidate(this.currentMaskFlags(flags)) && (!this.parent || this.parent.doValidate(this.currentMaskFlags(flags)));
	  }
	  doCommit() {
	    this.masked.doCommit();
	  }
	  get state() {
	    return {
	      _value: this.value,
	      _rawInputValue: this.rawInputValue,
	      masked: this.masked.state,
	      isFilled: this.isFilled
	    };
	  }
	  set state(state) {
	    this.masked.state = state.masked;
	    this.isFilled = state.isFilled;
	  }
	  currentMaskFlags(flags) {
	    var _flags$_beforeTailSta;
	    return {
	      ...flags,
	      _beforeTailState: (flags == null || (_flags$_beforeTailSta = flags._beforeTailState) == null ? void 0 : _flags$_beforeTailSta.masked) || (flags == null ? void 0 : flags._beforeTailState)
	    };
	  }
	  pad(flags) {
	    return new ChangeDetails();
	  }
	}
	PatternInputDefinition.DEFAULT_DEFINITIONS = {
	  '0': /\d/,
	  'a': /[\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]/,
	  // http://stackoverflow.com/a/22075070
	  '*': /./
	};

	/** Masking by RegExp */
	class MaskedRegExp extends Masked {
	  /** */

	  /** Enable characters overwriting */

	  /** */

	  /** */

	  /** */

	  updateOptions(opts) {
	    super.updateOptions(opts);
	  }
	  _update(opts) {
	    const mask = opts.mask;
	    if (mask) opts.validate = value => value.search(mask) >= 0;
	    super._update(opts);
	  }
	}
	IMask.MaskedRegExp = MaskedRegExp;

	/** Pattern mask */
	class MaskedPattern extends Masked {
	  /** */

	  /** */

	  /** Single char for empty input */

	  /** Single char for filled input */

	  /** Show placeholder only when needed */

	  /** Enable characters overwriting */

	  /** */

	  /** */

	  /** */

	  constructor(opts) {
	    super({
	      ...MaskedPattern.DEFAULTS,
	      ...opts,
	      definitions: Object.assign({}, PatternInputDefinition.DEFAULT_DEFINITIONS, opts == null ? void 0 : opts.definitions)
	    });
	  }
	  updateOptions(opts) {
	    super.updateOptions(opts);
	  }
	  _update(opts) {
	    opts.definitions = Object.assign({}, this.definitions, opts.definitions);
	    super._update(opts);
	    this._rebuildMask();
	  }
	  _rebuildMask() {
	    const defs = this.definitions;
	    this._blocks = [];
	    this.exposeBlock = undefined;
	    this._stops = [];
	    this._maskedBlocks = {};
	    const pattern = this.mask;
	    if (!pattern || !defs) return;
	    let unmaskingBlock = false;
	    let optionalBlock = false;
	    for (let i = 0; i < pattern.length; ++i) {
	      if (this.blocks) {
	        const p = pattern.slice(i);
	        const bNames = Object.keys(this.blocks).filter(bName => p.indexOf(bName) === 0);
	        // order by key length
	        bNames.sort((a, b) => b.length - a.length);
	        // use block name with max length
	        const bName = bNames[0];
	        if (bName) {
	          const {
	            expose,
	            repeat,
	            ...bOpts
	          } = normalizeOpts(this.blocks[bName]); // TODO type Opts<Arg & Extra>
	          const blockOpts = {
	            lazy: this.lazy,
	            eager: this.eager,
	            placeholderChar: this.placeholderChar,
	            displayChar: this.displayChar,
	            overwrite: this.overwrite,
	            autofix: this.autofix,
	            ...bOpts,
	            repeat,
	            parent: this
	          };
	          const maskedBlock = repeat != null ? new IMask.RepeatBlock(blockOpts /* TODO */) : createMask(blockOpts);
	          if (maskedBlock) {
	            this._blocks.push(maskedBlock);
	            if (expose) this.exposeBlock = maskedBlock;

	            // store block index
	            if (!this._maskedBlocks[bName]) this._maskedBlocks[bName] = [];
	            this._maskedBlocks[bName].push(this._blocks.length - 1);
	          }
	          i += bName.length - 1;
	          continue;
	        }
	      }
	      let char = pattern[i];
	      let isInput = (char in defs);
	      if (char === MaskedPattern.STOP_CHAR) {
	        this._stops.push(this._blocks.length);
	        continue;
	      }
	      if (char === '{' || char === '}') {
	        unmaskingBlock = !unmaskingBlock;
	        continue;
	      }
	      if (char === '[' || char === ']') {
	        optionalBlock = !optionalBlock;
	        continue;
	      }
	      if (char === MaskedPattern.ESCAPE_CHAR) {
	        ++i;
	        char = pattern[i];
	        if (!char) break;
	        isInput = false;
	      }
	      const def = isInput ? new PatternInputDefinition({
	        isOptional: optionalBlock,
	        lazy: this.lazy,
	        eager: this.eager,
	        placeholderChar: this.placeholderChar,
	        displayChar: this.displayChar,
	        ...normalizeOpts(defs[char]),
	        parent: this
	      }) : new PatternFixedDefinition({
	        char,
	        eager: this.eager,
	        isUnmasking: unmaskingBlock
	      });
	      this._blocks.push(def);
	    }
	  }
	  get state() {
	    return {
	      ...super.state,
	      _blocks: this._blocks.map(b => b.state)
	    };
	  }
	  set state(state) {
	    if (!state) {
	      this.reset();
	      return;
	    }
	    const {
	      _blocks,
	      ...maskedState
	    } = state;
	    this._blocks.forEach((b, bi) => b.state = _blocks[bi]);
	    super.state = maskedState;
	  }
	  reset() {
	    super.reset();
	    this._blocks.forEach(b => b.reset());
	  }
	  get isComplete() {
	    return this.exposeBlock ? this.exposeBlock.isComplete : this._blocks.every(b => b.isComplete);
	  }
	  get isFilled() {
	    return this._blocks.every(b => b.isFilled);
	  }
	  get isFixed() {
	    return this._blocks.every(b => b.isFixed);
	  }
	  get isOptional() {
	    return this._blocks.every(b => b.isOptional);
	  }
	  doCommit() {
	    this._blocks.forEach(b => b.doCommit());
	    super.doCommit();
	  }
	  get unmaskedValue() {
	    return this.exposeBlock ? this.exposeBlock.unmaskedValue : this._blocks.reduce((str, b) => str += b.unmaskedValue, '');
	  }
	  set unmaskedValue(unmaskedValue) {
	    if (this.exposeBlock) {
	      const tail = this.extractTail(this._blockStartPos(this._blocks.indexOf(this.exposeBlock)) + this.exposeBlock.displayValue.length);
	      this.exposeBlock.unmaskedValue = unmaskedValue;
	      this.appendTail(tail);
	      this.doCommit();
	    } else super.unmaskedValue = unmaskedValue;
	  }
	  get value() {
	    return this.exposeBlock ? this.exposeBlock.value :
	    // TODO return _value when not in change?
	    this._blocks.reduce((str, b) => str += b.value, '');
	  }
	  set value(value) {
	    if (this.exposeBlock) {
	      const tail = this.extractTail(this._blockStartPos(this._blocks.indexOf(this.exposeBlock)) + this.exposeBlock.displayValue.length);
	      this.exposeBlock.value = value;
	      this.appendTail(tail);
	      this.doCommit();
	    } else super.value = value;
	  }
	  get typedValue() {
	    return this.exposeBlock ? this.exposeBlock.typedValue : super.typedValue;
	  }
	  set typedValue(value) {
	    if (this.exposeBlock) {
	      const tail = this.extractTail(this._blockStartPos(this._blocks.indexOf(this.exposeBlock)) + this.exposeBlock.displayValue.length);
	      this.exposeBlock.typedValue = value;
	      this.appendTail(tail);
	      this.doCommit();
	    } else super.typedValue = value;
	  }
	  get displayValue() {
	    return this._blocks.reduce((str, b) => str += b.displayValue, '');
	  }
	  appendTail(tail) {
	    return super.appendTail(tail).aggregate(this._appendPlaceholder());
	  }
	  _appendEager() {
	    var _this$_mapPosToBlock;
	    const details = new ChangeDetails();
	    let startBlockIndex = (_this$_mapPosToBlock = this._mapPosToBlock(this.displayValue.length)) == null ? void 0 : _this$_mapPosToBlock.index;
	    if (startBlockIndex == null) return details;

	    // TODO test if it works for nested pattern masks
	    if (this._blocks[startBlockIndex].isFilled) ++startBlockIndex;
	    for (let bi = startBlockIndex; bi < this._blocks.length; ++bi) {
	      const d = this._blocks[bi]._appendEager();
	      if (!d.inserted) break;
	      details.aggregate(d);
	    }
	    return details;
	  }
	  _appendCharRaw(ch, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    const blockIter = this._mapPosToBlock(this.displayValue.length);
	    const details = new ChangeDetails();
	    if (!blockIter) return details;
	    for (let bi = blockIter.index, block; block = this._blocks[bi]; ++bi) {
	      var _flags$_beforeTailSta;
	      const blockDetails = block._appendChar(ch, {
	        ...flags,
	        _beforeTailState: (_flags$_beforeTailSta = flags._beforeTailState) == null || (_flags$_beforeTailSta = _flags$_beforeTailSta._blocks) == null ? void 0 : _flags$_beforeTailSta[bi]
	      });
	      details.aggregate(blockDetails);
	      if (blockDetails.consumed) break; // go next char
	    }
	    return details;
	  }
	  extractTail(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    const chunkTail = new ChunksTailDetails();
	    if (fromPos === toPos) return chunkTail;
	    this._forEachBlocksInRange(fromPos, toPos, (b, bi, bFromPos, bToPos) => {
	      const blockChunk = b.extractTail(bFromPos, bToPos);
	      blockChunk.stop = this._findStopBefore(bi);
	      blockChunk.from = this._blockStartPos(bi);
	      if (blockChunk instanceof ChunksTailDetails) blockChunk.blockIndex = bi;
	      chunkTail.extend(blockChunk);
	    });
	    return chunkTail;
	  }
	  extractInput(fromPos, toPos, flags) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    if (flags === void 0) {
	      flags = {};
	    }
	    if (fromPos === toPos) return '';
	    let input = '';
	    this._forEachBlocksInRange(fromPos, toPos, (b, _, fromPos, toPos) => {
	      input += b.extractInput(fromPos, toPos, flags);
	    });
	    return input;
	  }
	  _findStopBefore(blockIndex) {
	    let stopBefore;
	    for (let si = 0; si < this._stops.length; ++si) {
	      const stop = this._stops[si];
	      if (stop <= blockIndex) stopBefore = stop;else break;
	    }
	    return stopBefore;
	  }

	  /** Appends placeholder depending on laziness */
	  _appendPlaceholder(toBlockIndex) {
	    const details = new ChangeDetails();
	    if (this.lazy && toBlockIndex == null) return details;
	    const startBlockIter = this._mapPosToBlock(this.displayValue.length);
	    if (!startBlockIter) return details;
	    const startBlockIndex = startBlockIter.index;
	    const endBlockIndex = toBlockIndex != null ? toBlockIndex : this._blocks.length;
	    this._blocks.slice(startBlockIndex, endBlockIndex).forEach(b => {
	      if (!b.lazy || toBlockIndex != null) {
	        var _blocks2;
	        details.aggregate(b._appendPlaceholder((_blocks2 = b._blocks) == null ? void 0 : _blocks2.length));
	      }
	    });
	    return details;
	  }

	  /** Finds block in pos */
	  _mapPosToBlock(pos) {
	    let accVal = '';
	    for (let bi = 0; bi < this._blocks.length; ++bi) {
	      const block = this._blocks[bi];
	      const blockStartPos = accVal.length;
	      accVal += block.displayValue;
	      if (pos <= accVal.length) {
	        return {
	          index: bi,
	          offset: pos - blockStartPos
	        };
	      }
	    }
	  }
	  _blockStartPos(blockIndex) {
	    return this._blocks.slice(0, blockIndex).reduce((pos, b) => pos += b.displayValue.length, 0);
	  }
	  _forEachBlocksInRange(fromPos, toPos, fn) {
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    const fromBlockIter = this._mapPosToBlock(fromPos);
	    if (fromBlockIter) {
	      const toBlockIter = this._mapPosToBlock(toPos);
	      // process first block
	      const isSameBlock = toBlockIter && fromBlockIter.index === toBlockIter.index;
	      const fromBlockStartPos = fromBlockIter.offset;
	      const fromBlockEndPos = toBlockIter && isSameBlock ? toBlockIter.offset : this._blocks[fromBlockIter.index].displayValue.length;
	      fn(this._blocks[fromBlockIter.index], fromBlockIter.index, fromBlockStartPos, fromBlockEndPos);
	      if (toBlockIter && !isSameBlock) {
	        // process intermediate blocks
	        for (let bi = fromBlockIter.index + 1; bi < toBlockIter.index; ++bi) {
	          fn(this._blocks[bi], bi, 0, this._blocks[bi].displayValue.length);
	        }

	        // process last block
	        fn(this._blocks[toBlockIter.index], toBlockIter.index, 0, toBlockIter.offset);
	      }
	    }
	  }
	  remove(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    const removeDetails = super.remove(fromPos, toPos);
	    this._forEachBlocksInRange(fromPos, toPos, (b, _, bFromPos, bToPos) => {
	      removeDetails.aggregate(b.remove(bFromPos, bToPos));
	    });
	    return removeDetails;
	  }
	  nearestInputPos(cursorPos, direction) {
	    if (direction === void 0) {
	      direction = DIRECTION.NONE;
	    }
	    if (!this._blocks.length) return 0;
	    const cursor = new PatternCursor(this, cursorPos);
	    if (direction === DIRECTION.NONE) {
	      // -------------------------------------------------
	      // NONE should only go out from fixed to the right!
	      // -------------------------------------------------
	      if (cursor.pushRightBeforeInput()) return cursor.pos;
	      cursor.popState();
	      if (cursor.pushLeftBeforeInput()) return cursor.pos;
	      return this.displayValue.length;
	    }

	    // FORCE is only about a|* otherwise is 0
	    if (direction === DIRECTION.LEFT || direction === DIRECTION.FORCE_LEFT) {
	      // try to break fast when *|a
	      if (direction === DIRECTION.LEFT) {
	        cursor.pushRightBeforeFilled();
	        if (cursor.ok && cursor.pos === cursorPos) return cursorPos;
	        cursor.popState();
	      }

	      // forward flow
	      cursor.pushLeftBeforeInput();
	      cursor.pushLeftBeforeRequired();
	      cursor.pushLeftBeforeFilled();

	      // backward flow
	      if (direction === DIRECTION.LEFT) {
	        cursor.pushRightBeforeInput();
	        cursor.pushRightBeforeRequired();
	        if (cursor.ok && cursor.pos <= cursorPos) return cursor.pos;
	        cursor.popState();
	        if (cursor.ok && cursor.pos <= cursorPos) return cursor.pos;
	        cursor.popState();
	      }
	      if (cursor.ok) return cursor.pos;
	      if (direction === DIRECTION.FORCE_LEFT) return 0;
	      cursor.popState();
	      if (cursor.ok) return cursor.pos;
	      cursor.popState();
	      if (cursor.ok) return cursor.pos;
	      return 0;
	    }
	    if (direction === DIRECTION.RIGHT || direction === DIRECTION.FORCE_RIGHT) {
	      // forward flow
	      cursor.pushRightBeforeInput();
	      cursor.pushRightBeforeRequired();
	      if (cursor.pushRightBeforeFilled()) return cursor.pos;
	      if (direction === DIRECTION.FORCE_RIGHT) return this.displayValue.length;

	      // backward flow
	      cursor.popState();
	      if (cursor.ok) return cursor.pos;
	      cursor.popState();
	      if (cursor.ok) return cursor.pos;
	      return this.nearestInputPos(cursorPos, DIRECTION.LEFT);
	    }
	    return cursorPos;
	  }
	  totalInputPositions(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    let total = 0;
	    this._forEachBlocksInRange(fromPos, toPos, (b, _, bFromPos, bToPos) => {
	      total += b.totalInputPositions(bFromPos, bToPos);
	    });
	    return total;
	  }

	  /** Get block by name */
	  maskedBlock(name) {
	    return this.maskedBlocks(name)[0];
	  }

	  /** Get all blocks by name */
	  maskedBlocks(name) {
	    const indices = this._maskedBlocks[name];
	    if (!indices) return [];
	    return indices.map(gi => this._blocks[gi]);
	  }
	  pad(flags) {
	    const details = new ChangeDetails();
	    this._forEachBlocksInRange(0, this.displayValue.length, b => details.aggregate(b.pad(flags)));
	    return details;
	  }
	}
	MaskedPattern.DEFAULTS = {
	  ...Masked.DEFAULTS,
	  lazy: true,
	  placeholderChar: '_'
	};
	MaskedPattern.STOP_CHAR = '`';
	MaskedPattern.ESCAPE_CHAR = '\\';
	MaskedPattern.InputDefinition = PatternInputDefinition;
	MaskedPattern.FixedDefinition = PatternFixedDefinition;
	IMask.MaskedPattern = MaskedPattern;

	/** Pattern which accepts ranges */
	class MaskedRange extends MaskedPattern {
	  /**
	    Optionally sets max length of pattern.
	    Used when pattern length is longer then `to` param length. Pads zeros at start in this case.
	  */

	  /** Min bound */

	  /** Max bound */

	  get _matchFrom() {
	    return this.maxLength - String(this.from).length;
	  }
	  constructor(opts) {
	    super(opts); // mask will be created in _update
	  }
	  updateOptions(opts) {
	    super.updateOptions(opts);
	  }
	  _update(opts) {
	    const {
	      to = this.to || 0,
	      from = this.from || 0,
	      maxLength = this.maxLength || 0,
	      autofix = this.autofix,
	      ...patternOpts
	    } = opts;
	    this.to = to;
	    this.from = from;
	    this.maxLength = Math.max(String(to).length, maxLength);
	    this.autofix = autofix;
	    const fromStr = String(this.from).padStart(this.maxLength, '0');
	    const toStr = String(this.to).padStart(this.maxLength, '0');
	    let sameCharsCount = 0;
	    while (sameCharsCount < toStr.length && toStr[sameCharsCount] === fromStr[sameCharsCount]) ++sameCharsCount;
	    patternOpts.mask = toStr.slice(0, sameCharsCount).replace(/0/g, '\\0') + '0'.repeat(this.maxLength - sameCharsCount);
	    super._update(patternOpts);
	  }
	  get isComplete() {
	    return super.isComplete && Boolean(this.value);
	  }
	  boundaries(str) {
	    let minstr = '';
	    let maxstr = '';
	    const [, placeholder, num] = str.match(/^(\D*)(\d*)(\D*)/) || [];
	    if (num) {
	      minstr = '0'.repeat(placeholder.length) + num;
	      maxstr = '9'.repeat(placeholder.length) + num;
	    }
	    minstr = minstr.padEnd(this.maxLength, '0');
	    maxstr = maxstr.padEnd(this.maxLength, '9');
	    return [minstr, maxstr];
	  }
	  doPrepareChar(ch, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    let details;
	    [ch, details] = super.doPrepareChar(ch.replace(/\D/g, ''), flags);
	    if (!ch) details.skip = !this.isComplete;
	    return [ch, details];
	  }
	  _appendCharRaw(ch, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    if (!this.autofix || this.value.length + 1 > this.maxLength) return super._appendCharRaw(ch, flags);
	    const fromStr = String(this.from).padStart(this.maxLength, '0');
	    const toStr = String(this.to).padStart(this.maxLength, '0');
	    const [minstr, maxstr] = this.boundaries(this.value + ch);
	    if (Number(maxstr) < this.from) return super._appendCharRaw(fromStr[this.value.length], flags);
	    if (Number(minstr) > this.to) {
	      if (!flags.tail && this.autofix === 'pad' && this.value.length + 1 < this.maxLength) {
	        return super._appendCharRaw(fromStr[this.value.length], flags).aggregate(this._appendCharRaw(ch, flags));
	      }
	      return super._appendCharRaw(toStr[this.value.length], flags);
	    }
	    return super._appendCharRaw(ch, flags);
	  }
	  doValidate(flags) {
	    const str = this.value;
	    const firstNonZero = str.search(/[^0]/);
	    if (firstNonZero === -1 && str.length <= this._matchFrom) return true;
	    const [minstr, maxstr] = this.boundaries(str);
	    return this.from <= Number(maxstr) && Number(minstr) <= this.to && super.doValidate(flags);
	  }
	  pad(flags) {
	    const details = new ChangeDetails();
	    if (this.value.length === this.maxLength) return details;
	    const value = this.value;
	    const padLength = this.maxLength - this.value.length;
	    if (padLength) {
	      this.reset();
	      for (let i = 0; i < padLength; ++i) {
	        details.aggregate(super._appendCharRaw('0', flags));
	      }

	      // append tail
	      value.split('').forEach(ch => this._appendCharRaw(ch));
	    }
	    return details;
	  }
	}
	IMask.MaskedRange = MaskedRange;

	const DefaultPattern = 'd{.}`m{.}`Y';

	// Make format and parse required when pattern is provided

	/** Date mask */
	class MaskedDate extends MaskedPattern {
	  static extractPatternOptions(opts) {
	    const {
	      mask,
	      pattern,
	      ...patternOpts
	    } = opts;
	    return {
	      ...patternOpts,
	      mask: isString(mask) ? mask : pattern
	    };
	  }

	  /** Pattern mask for date according to {@link MaskedDate#format} */

	  /** Start date */

	  /** End date */

	  /** Format typed value to string */

	  /** Parse string to get typed value */

	  constructor(opts) {
	    super(MaskedDate.extractPatternOptions({
	      ...MaskedDate.DEFAULTS,
	      ...opts
	    }));
	  }
	  updateOptions(opts) {
	    super.updateOptions(opts);
	  }
	  _update(opts) {
	    const {
	      mask,
	      pattern,
	      blocks,
	      ...patternOpts
	    } = {
	      ...MaskedDate.DEFAULTS,
	      ...opts
	    };
	    const patternBlocks = Object.assign({}, MaskedDate.GET_DEFAULT_BLOCKS());
	    // adjust year block
	    if (opts.min) patternBlocks.Y.from = opts.min.getFullYear();
	    if (opts.max) patternBlocks.Y.to = opts.max.getFullYear();
	    if (opts.min && opts.max && patternBlocks.Y.from === patternBlocks.Y.to) {
	      patternBlocks.m.from = opts.min.getMonth() + 1;
	      patternBlocks.m.to = opts.max.getMonth() + 1;
	      if (patternBlocks.m.from === patternBlocks.m.to) {
	        patternBlocks.d.from = opts.min.getDate();
	        patternBlocks.d.to = opts.max.getDate();
	      }
	    }
	    Object.assign(patternBlocks, this.blocks, blocks);
	    super._update({
	      ...patternOpts,
	      mask: isString(mask) ? mask : pattern,
	      blocks: patternBlocks
	    });
	  }
	  doValidate(flags) {
	    const date = this.date;
	    return super.doValidate(flags) && (!this.isComplete || this.isDateExist(this.value) && date != null && (this.min == null || this.min <= date) && (this.max == null || date <= this.max));
	  }

	  /** Checks if date is exists */
	  isDateExist(str) {
	    return this.format(this.parse(str, this), this).indexOf(str) >= 0;
	  }

	  /** Parsed Date */
	  get date() {
	    return this.typedValue;
	  }
	  set date(date) {
	    this.typedValue = date;
	  }
	  get typedValue() {
	    return this.isComplete ? super.typedValue : null;
	  }
	  set typedValue(value) {
	    super.typedValue = value;
	  }
	  maskEquals(mask) {
	    return mask === Date || super.maskEquals(mask);
	  }
	  optionsIsChanged(opts) {
	    return super.optionsIsChanged(MaskedDate.extractPatternOptions(opts));
	  }
	}
	MaskedDate.GET_DEFAULT_BLOCKS = () => ({
	  d: {
	    mask: MaskedRange,
	    from: 1,
	    to: 31,
	    maxLength: 2
	  },
	  m: {
	    mask: MaskedRange,
	    from: 1,
	    to: 12,
	    maxLength: 2
	  },
	  Y: {
	    mask: MaskedRange,
	    from: 1900,
	    to: 9999
	  }
	});
	MaskedDate.DEFAULTS = {
	  ...MaskedPattern.DEFAULTS,
	  mask: Date,
	  pattern: DefaultPattern,
	  format: (date, masked) => {
	    if (!date) return '';
	    const day = String(date.getDate()).padStart(2, '0');
	    const month = String(date.getMonth() + 1).padStart(2, '0');
	    const year = date.getFullYear();
	    return [day, month, year].join('.');
	  },
	  parse: (str, masked) => {
	    const [day, month, year] = str.split('.').map(Number);
	    return new Date(year, month - 1, day);
	  }
	};
	IMask.MaskedDate = MaskedDate;

	/** Dynamic mask for choosing appropriate mask in run-time */
	class MaskedDynamic extends Masked {
	  constructor(opts) {
	    super({
	      ...MaskedDynamic.DEFAULTS,
	      ...opts
	    });
	    this.currentMask = undefined;
	  }
	  updateOptions(opts) {
	    super.updateOptions(opts);
	  }
	  _update(opts) {
	    super._update(opts);
	    if ('mask' in opts) {
	      this.exposeMask = undefined;
	      // mask could be totally dynamic with only `dispatch` option
	      this.compiledMasks = Array.isArray(opts.mask) ? opts.mask.map(m => {
	        const {
	          expose,
	          ...maskOpts
	        } = normalizeOpts(m);
	        const masked = createMask({
	          overwrite: this._overwrite,
	          eager: this._eager,
	          skipInvalid: this._skipInvalid,
	          ...maskOpts
	        });
	        if (expose) this.exposeMask = masked;
	        return masked;
	      }) : [];

	      // this.currentMask = this.doDispatch(''); // probably not needed but lets see
	    }
	  }
	  _appendCharRaw(ch, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    const details = this._applyDispatch(ch, flags);
	    if (this.currentMask) {
	      details.aggregate(this.currentMask._appendChar(ch, this.currentMaskFlags(flags)));
	    }
	    return details;
	  }
	  _applyDispatch(appended, flags, tail) {
	    if (appended === void 0) {
	      appended = '';
	    }
	    if (flags === void 0) {
	      flags = {};
	    }
	    if (tail === void 0) {
	      tail = '';
	    }
	    const prevValueBeforeTail = flags.tail && flags._beforeTailState != null ? flags._beforeTailState._value : this.value;
	    const inputValue = this.rawInputValue;
	    const insertValue = flags.tail && flags._beforeTailState != null ? flags._beforeTailState._rawInputValue : inputValue;
	    const tailValue = inputValue.slice(insertValue.length);
	    const prevMask = this.currentMask;
	    const details = new ChangeDetails();
	    const prevMaskState = prevMask == null ? void 0 : prevMask.state;

	    // clone flags to prevent overwriting `_beforeTailState`
	    this.currentMask = this.doDispatch(appended, {
	      ...flags
	    }, tail);

	    // restore state after dispatch
	    if (this.currentMask) {
	      if (this.currentMask !== prevMask) {
	        // if mask changed reapply input
	        this.currentMask.reset();
	        if (insertValue) {
	          this.currentMask.append(insertValue, {
	            raw: true
	          });
	          details.tailShift = this.currentMask.value.length - prevValueBeforeTail.length;
	        }
	        if (tailValue) {
	          details.tailShift += this.currentMask.append(tailValue, {
	            raw: true,
	            tail: true
	          }).tailShift;
	        }
	      } else if (prevMaskState) {
	        // Dispatch can do something bad with state, so
	        // restore prev mask state
	        this.currentMask.state = prevMaskState;
	      }
	    }
	    return details;
	  }
	  _appendPlaceholder() {
	    const details = this._applyDispatch();
	    if (this.currentMask) {
	      details.aggregate(this.currentMask._appendPlaceholder());
	    }
	    return details;
	  }
	  _appendEager() {
	    const details = this._applyDispatch();
	    if (this.currentMask) {
	      details.aggregate(this.currentMask._appendEager());
	    }
	    return details;
	  }
	  appendTail(tail) {
	    const details = new ChangeDetails();
	    if (tail) details.aggregate(this._applyDispatch('', {}, tail));
	    return details.aggregate(this.currentMask ? this.currentMask.appendTail(tail) : super.appendTail(tail));
	  }
	  currentMaskFlags(flags) {
	    var _flags$_beforeTailSta, _flags$_beforeTailSta2;
	    return {
	      ...flags,
	      _beforeTailState: ((_flags$_beforeTailSta = flags._beforeTailState) == null ? void 0 : _flags$_beforeTailSta.currentMaskRef) === this.currentMask && ((_flags$_beforeTailSta2 = flags._beforeTailState) == null ? void 0 : _flags$_beforeTailSta2.currentMask) || flags._beforeTailState
	    };
	  }
	  doDispatch(appended, flags, tail) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    if (tail === void 0) {
	      tail = '';
	    }
	    return this.dispatch(appended, this, flags, tail);
	  }
	  doValidate(flags) {
	    return super.doValidate(flags) && (!this.currentMask || this.currentMask.doValidate(this.currentMaskFlags(flags)));
	  }
	  doPrepare(str, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    let [s, details] = super.doPrepare(str, flags);
	    if (this.currentMask) {
	      let currentDetails;
	      [s, currentDetails] = super.doPrepare(s, this.currentMaskFlags(flags));
	      details = details.aggregate(currentDetails);
	    }
	    return [s, details];
	  }
	  doPrepareChar(str, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    let [s, details] = super.doPrepareChar(str, flags);
	    if (this.currentMask) {
	      let currentDetails;
	      [s, currentDetails] = super.doPrepareChar(s, this.currentMaskFlags(flags));
	      details = details.aggregate(currentDetails);
	    }
	    return [s, details];
	  }
	  reset() {
	    var _this$currentMask;
	    (_this$currentMask = this.currentMask) == null || _this$currentMask.reset();
	    this.compiledMasks.forEach(m => m.reset());
	  }
	  get value() {
	    return this.exposeMask ? this.exposeMask.value : this.currentMask ? this.currentMask.value : '';
	  }
	  set value(value) {
	    if (this.exposeMask) {
	      this.exposeMask.value = value;
	      this.currentMask = this.exposeMask;
	      this._applyDispatch();
	    } else super.value = value;
	  }
	  get unmaskedValue() {
	    return this.exposeMask ? this.exposeMask.unmaskedValue : this.currentMask ? this.currentMask.unmaskedValue : '';
	  }
	  set unmaskedValue(unmaskedValue) {
	    if (this.exposeMask) {
	      this.exposeMask.unmaskedValue = unmaskedValue;
	      this.currentMask = this.exposeMask;
	      this._applyDispatch();
	    } else super.unmaskedValue = unmaskedValue;
	  }
	  get typedValue() {
	    return this.exposeMask ? this.exposeMask.typedValue : this.currentMask ? this.currentMask.typedValue : '';
	  }
	  set typedValue(typedValue) {
	    if (this.exposeMask) {
	      this.exposeMask.typedValue = typedValue;
	      this.currentMask = this.exposeMask;
	      this._applyDispatch();
	      return;
	    }
	    let unmaskedValue = String(typedValue);

	    // double check it
	    if (this.currentMask) {
	      this.currentMask.typedValue = typedValue;
	      unmaskedValue = this.currentMask.unmaskedValue;
	    }
	    this.unmaskedValue = unmaskedValue;
	  }
	  get displayValue() {
	    return this.currentMask ? this.currentMask.displayValue : '';
	  }
	  get isComplete() {
	    var _this$currentMask2;
	    return Boolean((_this$currentMask2 = this.currentMask) == null ? void 0 : _this$currentMask2.isComplete);
	  }
	  get isFilled() {
	    var _this$currentMask3;
	    return Boolean((_this$currentMask3 = this.currentMask) == null ? void 0 : _this$currentMask3.isFilled);
	  }
	  remove(fromPos, toPos) {
	    const details = new ChangeDetails();
	    if (this.currentMask) {
	      details.aggregate(this.currentMask.remove(fromPos, toPos))
	      // update with dispatch
	      .aggregate(this._applyDispatch());
	    }
	    return details;
	  }
	  get state() {
	    var _this$currentMask4;
	    return {
	      ...super.state,
	      _rawInputValue: this.rawInputValue,
	      compiledMasks: this.compiledMasks.map(m => m.state),
	      currentMaskRef: this.currentMask,
	      currentMask: (_this$currentMask4 = this.currentMask) == null ? void 0 : _this$currentMask4.state
	    };
	  }
	  set state(state) {
	    const {
	      compiledMasks,
	      currentMaskRef,
	      currentMask,
	      ...maskedState
	    } = state;
	    if (compiledMasks) this.compiledMasks.forEach((m, mi) => m.state = compiledMasks[mi]);
	    if (currentMaskRef != null) {
	      this.currentMask = currentMaskRef;
	      this.currentMask.state = currentMask;
	    }
	    super.state = maskedState;
	  }
	  extractInput(fromPos, toPos, flags) {
	    return this.currentMask ? this.currentMask.extractInput(fromPos, toPos, flags) : '';
	  }
	  extractTail(fromPos, toPos) {
	    return this.currentMask ? this.currentMask.extractTail(fromPos, toPos) : super.extractTail(fromPos, toPos);
	  }
	  doCommit() {
	    if (this.currentMask) this.currentMask.doCommit();
	    super.doCommit();
	  }
	  nearestInputPos(cursorPos, direction) {
	    return this.currentMask ? this.currentMask.nearestInputPos(cursorPos, direction) : super.nearestInputPos(cursorPos, direction);
	  }
	  get overwrite() {
	    return this.currentMask ? this.currentMask.overwrite : this._overwrite;
	  }
	  set overwrite(overwrite) {
	    this._overwrite = overwrite;
	  }
	  get eager() {
	    return this.currentMask ? this.currentMask.eager : this._eager;
	  }
	  set eager(eager) {
	    this._eager = eager;
	  }
	  get skipInvalid() {
	    return this.currentMask ? this.currentMask.skipInvalid : this._skipInvalid;
	  }
	  set skipInvalid(skipInvalid) {
	    this._skipInvalid = skipInvalid;
	  }
	  get autofix() {
	    return this.currentMask ? this.currentMask.autofix : this._autofix;
	  }
	  set autofix(autofix) {
	    this._autofix = autofix;
	  }
	  maskEquals(mask) {
	    return Array.isArray(mask) ? this.compiledMasks.every((m, mi) => {
	      if (!mask[mi]) return;
	      const {
	        mask: oldMask,
	        ...restOpts
	      } = mask[mi];
	      return objectIncludes(m, restOpts) && m.maskEquals(oldMask);
	    }) : super.maskEquals(mask);
	  }
	  typedValueEquals(value) {
	    var _this$currentMask5;
	    return Boolean((_this$currentMask5 = this.currentMask) == null ? void 0 : _this$currentMask5.typedValueEquals(value));
	  }
	}
	/** Currently chosen mask */
	/** Currently chosen mask */
	/** Compliled {@link Masked} options */
	/** Chooses {@link Masked} depending on input value */
	MaskedDynamic.DEFAULTS = {
	  ...Masked.DEFAULTS,
	  dispatch: (appended, masked, flags, tail) => {
	    if (!masked.compiledMasks.length) return;
	    const inputValue = masked.rawInputValue;

	    // simulate input
	    const inputs = masked.compiledMasks.map((m, index) => {
	      const isCurrent = masked.currentMask === m;
	      const startInputPos = isCurrent ? m.displayValue.length : m.nearestInputPos(m.displayValue.length, DIRECTION.FORCE_LEFT);
	      if (m.rawInputValue !== inputValue) {
	        m.reset();
	        m.append(inputValue, {
	          raw: true
	        });
	      } else if (!isCurrent) {
	        m.remove(startInputPos);
	      }
	      m.append(appended, masked.currentMaskFlags(flags));
	      m.appendTail(tail);
	      return {
	        index,
	        weight: m.rawInputValue.length,
	        totalInputPositions: m.totalInputPositions(0, Math.max(startInputPos, m.nearestInputPos(m.displayValue.length, DIRECTION.FORCE_LEFT)))
	      };
	    });

	    // pop masks with longer values first
	    inputs.sort((i1, i2) => i2.weight - i1.weight || i2.totalInputPositions - i1.totalInputPositions);
	    return masked.compiledMasks[inputs[0].index];
	  }
	};
	IMask.MaskedDynamic = MaskedDynamic;

	/** Pattern which validates enum values */
	class MaskedEnum extends MaskedPattern {
	  constructor(opts) {
	    super({
	      ...MaskedEnum.DEFAULTS,
	      ...opts
	    }); // mask will be created in _update
	  }
	  updateOptions(opts) {
	    super.updateOptions(opts);
	  }
	  _update(opts) {
	    const {
	      enum: enum_,
	      ...eopts
	    } = opts;
	    if (enum_) {
	      const lengths = enum_.map(e => e.length);
	      const requiredLength = Math.min(...lengths);
	      const optionalLength = Math.max(...lengths) - requiredLength;
	      eopts.mask = '*'.repeat(requiredLength);
	      if (optionalLength) eopts.mask += '[' + '*'.repeat(optionalLength) + ']';
	      this.enum = enum_;
	    }
	    super._update(eopts);
	  }
	  _appendCharRaw(ch, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    const matchFrom = Math.min(this.nearestInputPos(0, DIRECTION.FORCE_RIGHT), this.value.length);
	    const matches = this.enum.filter(e => this.matchValue(e, this.unmaskedValue + ch, matchFrom));
	    if (matches.length) {
	      if (matches.length === 1) {
	        this._forEachBlocksInRange(0, this.value.length, (b, bi) => {
	          const mch = matches[0][bi];
	          if (bi >= this.value.length || mch === b.value) return;
	          b.reset();
	          b._appendChar(mch, flags);
	        });
	      }
	      const d = super._appendCharRaw(matches[0][this.value.length], flags);
	      if (matches.length === 1) {
	        matches[0].slice(this.unmaskedValue.length).split('').forEach(mch => d.aggregate(super._appendCharRaw(mch)));
	      }
	      return d;
	    }
	    return new ChangeDetails({
	      skip: !this.isComplete
	    });
	  }
	  extractTail(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    // just drop tail
	    return new ContinuousTailDetails('', fromPos);
	  }
	  remove(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    if (fromPos === toPos) return new ChangeDetails();
	    const matchFrom = Math.min(super.nearestInputPos(0, DIRECTION.FORCE_RIGHT), this.value.length);
	    let pos;
	    for (pos = fromPos; pos >= 0; --pos) {
	      const matches = this.enum.filter(e => this.matchValue(e, this.value.slice(matchFrom, pos), matchFrom));
	      if (matches.length > 1) break;
	    }
	    const details = super.remove(pos, toPos);
	    details.tailShift += pos - fromPos;
	    return details;
	  }
	  get isComplete() {
	    return this.enum.indexOf(this.value) >= 0;
	  }
	}
	/** Match enum value */
	MaskedEnum.DEFAULTS = {
	  ...MaskedPattern.DEFAULTS,
	  matchValue: (estr, istr, matchFrom) => estr.indexOf(istr, matchFrom) === matchFrom
	};
	IMask.MaskedEnum = MaskedEnum;

	/** Masking by custom Function */
	class MaskedFunction extends Masked {
	  /** */

	  /** Enable characters overwriting */

	  /** */

	  /** */

	  /** */

	  updateOptions(opts) {
	    super.updateOptions(opts);
	  }
	  _update(opts) {
	    super._update({
	      ...opts,
	      validate: opts.mask
	    });
	  }
	}
	IMask.MaskedFunction = MaskedFunction;

	var _MaskedNumber;
	/** Number mask */
	class MaskedNumber extends Masked {
	  /** Single char */

	  /** Single char */

	  /** Array of single chars */

	  /** */

	  /** */

	  /** Digits after point */

	  /** Flag to remove leading and trailing zeros in the end of editing */

	  /** Flag to pad trailing zeros after point in the end of editing */

	  /** Enable characters overwriting */

	  /** */

	  /** */

	  /** */

	  /** Format typed value to string */

	  /** Parse string to get typed value */

	  constructor(opts) {
	    super({
	      ...MaskedNumber.DEFAULTS,
	      ...opts
	    });
	  }
	  updateOptions(opts) {
	    super.updateOptions(opts);
	  }
	  _update(opts) {
	    super._update(opts);
	    this._updateRegExps();
	  }
	  _updateRegExps() {
	    const start = '^' + (this.allowNegative ? '[+|\\-]?' : '');
	    const mid = '\\d*';
	    const end = (this.scale ? "(" + escapeRegExp(this.radix) + "\\d{0," + this.scale + "})?" : '') + '$';
	    this._numberRegExp = new RegExp(start + mid + end);
	    this._mapToRadixRegExp = new RegExp("[" + this.mapToRadix.map(escapeRegExp).join('') + "]", 'g');
	    this._thousandsSeparatorRegExp = new RegExp(escapeRegExp(this.thousandsSeparator), 'g');
	  }
	  _removeThousandsSeparators(value) {
	    return value.replace(this._thousandsSeparatorRegExp, '');
	  }
	  _insertThousandsSeparators(value) {
	    // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
	    const parts = value.split(this.radix);
	    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandsSeparator);
	    return parts.join(this.radix);
	  }
	  doPrepareChar(ch, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    const [prepCh, details] = super.doPrepareChar(this._removeThousandsSeparators(this.scale && this.mapToRadix.length && (
	    /*
	      radix should be mapped when
	      1) input is done from keyboard = flags.input && flags.raw
	      2) unmasked value is set = !flags.input && !flags.raw
	      and should not be mapped when
	      1) value is set = flags.input && !flags.raw
	      2) raw value is set = !flags.input && flags.raw
	    */
	    flags.input && flags.raw || !flags.input && !flags.raw) ? ch.replace(this._mapToRadixRegExp, this.radix) : ch), flags);
	    if (ch && !prepCh) details.skip = true;
	    if (prepCh && !this.allowPositive && !this.value && prepCh !== '-') details.aggregate(this._appendChar('-'));
	    return [prepCh, details];
	  }
	  _separatorsCount(to, extendOnSeparators) {
	    if (extendOnSeparators === void 0) {
	      extendOnSeparators = false;
	    }
	    let count = 0;
	    for (let pos = 0; pos < to; ++pos) {
	      if (this._value.indexOf(this.thousandsSeparator, pos) === pos) {
	        ++count;
	        if (extendOnSeparators) to += this.thousandsSeparator.length;
	      }
	    }
	    return count;
	  }
	  _separatorsCountFromSlice(slice) {
	    if (slice === void 0) {
	      slice = this._value;
	    }
	    return this._separatorsCount(this._removeThousandsSeparators(slice).length, true);
	  }
	  extractInput(fromPos, toPos, flags) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    [fromPos, toPos] = this._adjustRangeWithSeparators(fromPos, toPos);
	    return this._removeThousandsSeparators(super.extractInput(fromPos, toPos, flags));
	  }
	  _appendCharRaw(ch, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    const prevBeforeTailValue = flags.tail && flags._beforeTailState ? flags._beforeTailState._value : this._value;
	    const prevBeforeTailSeparatorsCount = this._separatorsCountFromSlice(prevBeforeTailValue);
	    this._value = this._removeThousandsSeparators(this.value);
	    const oldValue = this._value;
	    this._value += ch;
	    const num = this.number;
	    let accepted = !isNaN(num);
	    let skip = false;
	    if (accepted) {
	      let fixedNum;
	      if (this.min != null && this.min < 0 && this.number < this.min) fixedNum = this.min;
	      if (this.max != null && this.max > 0 && this.number > this.max) fixedNum = this.max;
	      if (fixedNum != null) {
	        if (this.autofix) {
	          this._value = this.format(fixedNum, this).replace(MaskedNumber.UNMASKED_RADIX, this.radix);
	          skip || (skip = oldValue === this._value && !flags.tail); // if not changed on tail it's still ok to proceed
	        } else {
	          accepted = false;
	        }
	      }
	      accepted && (accepted = Boolean(this._value.match(this._numberRegExp)));
	    }
	    let appendDetails;
	    if (!accepted) {
	      this._value = oldValue;
	      appendDetails = new ChangeDetails();
	    } else {
	      appendDetails = new ChangeDetails({
	        inserted: this._value.slice(oldValue.length),
	        rawInserted: skip ? '' : ch,
	        skip
	      });
	    }
	    this._value = this._insertThousandsSeparators(this._value);
	    const beforeTailValue = flags.tail && flags._beforeTailState ? flags._beforeTailState._value : this._value;
	    const beforeTailSeparatorsCount = this._separatorsCountFromSlice(beforeTailValue);
	    appendDetails.tailShift += (beforeTailSeparatorsCount - prevBeforeTailSeparatorsCount) * this.thousandsSeparator.length;
	    return appendDetails;
	  }
	  _findSeparatorAround(pos) {
	    if (this.thousandsSeparator) {
	      const searchFrom = pos - this.thousandsSeparator.length + 1;
	      const separatorPos = this.value.indexOf(this.thousandsSeparator, searchFrom);
	      if (separatorPos <= pos) return separatorPos;
	    }
	    return -1;
	  }
	  _adjustRangeWithSeparators(from, to) {
	    const separatorAroundFromPos = this._findSeparatorAround(from);
	    if (separatorAroundFromPos >= 0) from = separatorAroundFromPos;
	    const separatorAroundToPos = this._findSeparatorAround(to);
	    if (separatorAroundToPos >= 0) to = separatorAroundToPos + this.thousandsSeparator.length;
	    return [from, to];
	  }
	  remove(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    [fromPos, toPos] = this._adjustRangeWithSeparators(fromPos, toPos);
	    const valueBeforePos = this.value.slice(0, fromPos);
	    const valueAfterPos = this.value.slice(toPos);
	    const prevBeforeTailSeparatorsCount = this._separatorsCount(valueBeforePos.length);
	    this._value = this._insertThousandsSeparators(this._removeThousandsSeparators(valueBeforePos + valueAfterPos));
	    const beforeTailSeparatorsCount = this._separatorsCountFromSlice(valueBeforePos);
	    return new ChangeDetails({
	      tailShift: (beforeTailSeparatorsCount - prevBeforeTailSeparatorsCount) * this.thousandsSeparator.length
	    });
	  }
	  nearestInputPos(cursorPos, direction) {
	    if (!this.thousandsSeparator) return cursorPos;
	    switch (direction) {
	      case DIRECTION.NONE:
	      case DIRECTION.LEFT:
	      case DIRECTION.FORCE_LEFT:
	        {
	          const separatorAtLeftPos = this._findSeparatorAround(cursorPos - 1);
	          if (separatorAtLeftPos >= 0) {
	            const separatorAtLeftEndPos = separatorAtLeftPos + this.thousandsSeparator.length;
	            if (cursorPos < separatorAtLeftEndPos || this.value.length <= separatorAtLeftEndPos || direction === DIRECTION.FORCE_LEFT) {
	              return separatorAtLeftPos;
	            }
	          }
	          break;
	        }
	      case DIRECTION.RIGHT:
	      case DIRECTION.FORCE_RIGHT:
	        {
	          const separatorAtRightPos = this._findSeparatorAround(cursorPos);
	          if (separatorAtRightPos >= 0) {
	            return separatorAtRightPos + this.thousandsSeparator.length;
	          }
	        }
	    }
	    return cursorPos;
	  }
	  doCommit() {
	    if (this.value) {
	      const number = this.number;
	      let validnum = number;

	      // check bounds
	      if (this.min != null) validnum = Math.max(validnum, this.min);
	      if (this.max != null) validnum = Math.min(validnum, this.max);
	      if (validnum !== number) this.unmaskedValue = this.format(validnum, this);
	      let formatted = this.value;
	      if (this.normalizeZeros) formatted = this._normalizeZeros(formatted);
	      if (this.padFractionalZeros && this.scale > 0) formatted = this._padFractionalZeros(formatted);
	      this._value = formatted;
	    }
	    super.doCommit();
	  }
	  _normalizeZeros(value) {
	    const parts = this._removeThousandsSeparators(value).split(this.radix);

	    // remove leading zeros
	    parts[0] = parts[0].replace(/^(\D*)(0*)(\d*)/, (match, sign, zeros, num) => sign + num);
	    // add leading zero
	    if (value.length && !/\d$/.test(parts[0])) parts[0] = parts[0] + '0';
	    if (parts.length > 1) {
	      parts[1] = parts[1].replace(/0*$/, ''); // remove trailing zeros
	      if (!parts[1].length) parts.length = 1; // remove fractional
	    }
	    return this._insertThousandsSeparators(parts.join(this.radix));
	  }
	  _padFractionalZeros(value) {
	    if (!value) return value;
	    const parts = value.split(this.radix);
	    if (parts.length < 2) parts.push('');
	    parts[1] = parts[1].padEnd(this.scale, '0');
	    return parts.join(this.radix);
	  }
	  doSkipInvalid(ch, flags, checkTail) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    const dropFractional = this.scale === 0 && ch !== this.thousandsSeparator && (ch === this.radix || ch === MaskedNumber.UNMASKED_RADIX || this.mapToRadix.includes(ch));
	    return super.doSkipInvalid(ch, flags, checkTail) && !dropFractional;
	  }
	  get unmaskedValue() {
	    return this._removeThousandsSeparators(this._normalizeZeros(this.value)).replace(this.radix, MaskedNumber.UNMASKED_RADIX);
	  }
	  set unmaskedValue(unmaskedValue) {
	    super.unmaskedValue = unmaskedValue;
	  }
	  get typedValue() {
	    return this.parse(this.unmaskedValue, this);
	  }
	  set typedValue(n) {
	    this.rawInputValue = this.format(n, this).replace(MaskedNumber.UNMASKED_RADIX, this.radix);
	  }

	  /** Parsed Number */
	  get number() {
	    return this.typedValue;
	  }
	  set number(number) {
	    this.typedValue = number;
	  }
	  get allowNegative() {
	    return this.min != null && this.min < 0 || this.max != null && this.max < 0;
	  }
	  get allowPositive() {
	    return this.min != null && this.min > 0 || this.max != null && this.max > 0;
	  }
	  typedValueEquals(value) {
	    // handle  0 -> '' case (typed = 0 even if value = '')
	    // for details see https://github.com/uNmAnNeR/imaskjs/issues/134
	    return (super.typedValueEquals(value) || MaskedNumber.EMPTY_VALUES.includes(value) && MaskedNumber.EMPTY_VALUES.includes(this.typedValue)) && !(value === 0 && this.value === '');
	  }
	}
	_MaskedNumber = MaskedNumber;
	MaskedNumber.UNMASKED_RADIX = '.';
	MaskedNumber.EMPTY_VALUES = [...Masked.EMPTY_VALUES, 0];
	MaskedNumber.DEFAULTS = {
	  ...Masked.DEFAULTS,
	  mask: Number,
	  radix: ',',
	  thousandsSeparator: '',
	  mapToRadix: [_MaskedNumber.UNMASKED_RADIX],
	  min: Number.MIN_SAFE_INTEGER,
	  max: Number.MAX_SAFE_INTEGER,
	  scale: 2,
	  normalizeZeros: true,
	  padFractionalZeros: false,
	  parse: Number,
	  format: n => n.toLocaleString('en-US', {
	    useGrouping: false,
	    maximumFractionDigits: 20
	  })
	};
	IMask.MaskedNumber = MaskedNumber;

	/** Mask pipe source and destination types */
	const PIPE_TYPE = {
	  MASKED: 'value',
	  UNMASKED: 'unmaskedValue',
	  TYPED: 'typedValue'
	};
	/** Creates new pipe function depending on mask type, source and destination options */
	function createPipe(arg, from, to) {
	  if (from === void 0) {
	    from = PIPE_TYPE.MASKED;
	  }
	  if (to === void 0) {
	    to = PIPE_TYPE.MASKED;
	  }
	  const masked = createMask(arg);
	  return value => masked.runIsolated(m => {
	    m[from] = value;
	    return m[to];
	  });
	}

	/** Pipes value through mask depending on mask type, source and destination options */
	function pipe(value, mask, from, to) {
	  return createPipe(mask, from, to)(value);
	}
	IMask.PIPE_TYPE = PIPE_TYPE;
	IMask.createPipe = createPipe;
	IMask.pipe = pipe;

	/** Pattern mask */
	class RepeatBlock extends MaskedPattern {
	  get repeatFrom() {
	    var _ref;
	    return (_ref = Array.isArray(this.repeat) ? this.repeat[0] : this.repeat === Infinity ? 0 : this.repeat) != null ? _ref : 0;
	  }
	  get repeatTo() {
	    var _ref2;
	    return (_ref2 = Array.isArray(this.repeat) ? this.repeat[1] : this.repeat) != null ? _ref2 : Infinity;
	  }
	  constructor(opts) {
	    super(opts);
	  }
	  updateOptions(opts) {
	    super.updateOptions(opts);
	  }
	  _update(opts) {
	    var _ref3, _ref4, _this$_blocks;
	    const {
	      repeat,
	      ...blockOpts
	    } = normalizeOpts(opts); // TODO type
	    this._blockOpts = Object.assign({}, this._blockOpts, blockOpts);
	    const block = createMask(this._blockOpts);
	    this.repeat = (_ref3 = (_ref4 = repeat != null ? repeat : block.repeat) != null ? _ref4 : this.repeat) != null ? _ref3 : Infinity; // TODO type

	    super._update({
	      mask: 'm'.repeat(Math.max(this.repeatTo === Infinity && ((_this$_blocks = this._blocks) == null ? void 0 : _this$_blocks.length) || 0, this.repeatFrom)),
	      blocks: {
	        m: block
	      },
	      eager: block.eager,
	      overwrite: block.overwrite,
	      skipInvalid: block.skipInvalid,
	      lazy: block.lazy,
	      placeholderChar: block.placeholderChar,
	      displayChar: block.displayChar
	    });
	  }
	  _allocateBlock(bi) {
	    if (bi < this._blocks.length) return this._blocks[bi];
	    if (this.repeatTo === Infinity || this._blocks.length < this.repeatTo) {
	      this._blocks.push(createMask(this._blockOpts));
	      this.mask += 'm';
	      return this._blocks[this._blocks.length - 1];
	    }
	  }
	  _appendCharRaw(ch, flags) {
	    if (flags === void 0) {
	      flags = {};
	    }
	    const details = new ChangeDetails();
	    for (let bi = (_this$_mapPosToBlock$ = (_this$_mapPosToBlock = this._mapPosToBlock(this.displayValue.length)) == null ? void 0 : _this$_mapPosToBlock.index) != null ? _this$_mapPosToBlock$ : Math.max(this._blocks.length - 1, 0), block, allocated;
	    // try to get a block or
	    // try to allocate a new block if not allocated already
	    block = (_this$_blocks$bi = this._blocks[bi]) != null ? _this$_blocks$bi : allocated = !allocated && this._allocateBlock(bi); ++bi) {
	      var _this$_mapPosToBlock$, _this$_mapPosToBlock, _this$_blocks$bi, _flags$_beforeTailSta;
	      const blockDetails = block._appendChar(ch, {
	        ...flags,
	        _beforeTailState: (_flags$_beforeTailSta = flags._beforeTailState) == null || (_flags$_beforeTailSta = _flags$_beforeTailSta._blocks) == null ? void 0 : _flags$_beforeTailSta[bi]
	      });
	      if (blockDetails.skip && allocated) {
	        // remove the last allocated block and break
	        this._blocks.pop();
	        this.mask = this.mask.slice(1);
	        break;
	      }
	      details.aggregate(blockDetails);
	      if (blockDetails.consumed) break; // go next char
	    }
	    return details;
	  }
	  _trimEmptyTail(fromPos, toPos) {
	    var _this$_mapPosToBlock2, _this$_mapPosToBlock3;
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    const firstBlockIndex = Math.max(((_this$_mapPosToBlock2 = this._mapPosToBlock(fromPos)) == null ? void 0 : _this$_mapPosToBlock2.index) || 0, this.repeatFrom, 0);
	    let lastBlockIndex;
	    if (toPos != null) lastBlockIndex = (_this$_mapPosToBlock3 = this._mapPosToBlock(toPos)) == null ? void 0 : _this$_mapPosToBlock3.index;
	    if (lastBlockIndex == null) lastBlockIndex = this._blocks.length - 1;
	    let removeCount = 0;
	    for (let blockIndex = lastBlockIndex; firstBlockIndex <= blockIndex; --blockIndex, ++removeCount) {
	      if (this._blocks[blockIndex].unmaskedValue) break;
	    }
	    if (removeCount) {
	      this._blocks.splice(lastBlockIndex - removeCount + 1, removeCount);
	      this.mask = this.mask.slice(removeCount);
	    }
	  }
	  reset() {
	    super.reset();
	    this._trimEmptyTail();
	  }
	  remove(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos === void 0) {
	      toPos = this.displayValue.length;
	    }
	    const removeDetails = super.remove(fromPos, toPos);
	    this._trimEmptyTail(fromPos, toPos);
	    return removeDetails;
	  }
	  totalInputPositions(fromPos, toPos) {
	    if (fromPos === void 0) {
	      fromPos = 0;
	    }
	    if (toPos == null && this.repeatTo === Infinity) return Infinity;
	    return super.totalInputPositions(fromPos, toPos);
	  }
	  get state() {
	    return super.state;
	  }
	  set state(state) {
	    this._blocks.length = state._blocks.length;
	    this.mask = this.mask.slice(0, this._blocks.length);
	    super.state = state;
	  }
	}
	IMask.RepeatBlock = RepeatBlock;

	try {
	  globalThis.IMask = IMask;
	} catch {}

	const phoneFields = document.querySelectorAll('[type="tel"]');
	if (phoneFields.length) {
	  const maskOptions = {
	    mask: '+{7}(000) 000 - 00 - 00'
	  };
	  phoneFields.forEach(field => {
	    IMask(field, maskOptions);
	  });
	}

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}
	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  return Constructor;
	}

	/*!
	 * Observer 3.11.4
	 * https://greensock.com
	 *
	 * @license Copyright 2008-2022, GreenSock. All rights reserved.
	 * Subject to the terms at https://greensock.com/standard-license or for
	 * Club GreenSock members, the agreement issued with that membership.
	 * @author: Jack Doyle, jack@greensock.com
	*/

	/* eslint-disable */
	var gsap$1,
	  _coreInitted$1,
	  _win$1,
	  _doc$1,
	  _docEl$1,
	  _body$1,
	  _isTouch,
	  _pointerType,
	  ScrollTrigger$1,
	  _root$1,
	  _normalizer$1,
	  _eventTypes,
	  _context$1,
	  _getGSAP$1 = function _getGSAP() {
	    return gsap$1 || typeof window !== "undefined" && (gsap$1 = window.gsap) && gsap$1.registerPlugin && gsap$1;
	  },
	  _startup$1 = 1,
	  _observers = [],
	  _scrollers = [],
	  _proxies = [],
	  _getTime$1 = Date.now,
	  _bridge = function _bridge(name, value) {
	    return value;
	  },
	  _integrate = function _integrate() {
	    var core = ScrollTrigger$1.core,
	      data = core.bridge || {},
	      scrollers = core._scrollers,
	      proxies = core._proxies;
	    scrollers.push.apply(scrollers, _scrollers);
	    proxies.push.apply(proxies, _proxies);
	    _scrollers = scrollers;
	    _proxies = proxies;
	    _bridge = function _bridge(name, value) {
	      return data[name](value);
	    };
	  },
	  _getProxyProp = function _getProxyProp(element, property) {
	    return ~_proxies.indexOf(element) && _proxies[_proxies.indexOf(element) + 1][property];
	  },
	  _isViewport$1 = function _isViewport(el) {
	    return !!~_root$1.indexOf(el);
	  },
	  _addListener$1 = function _addListener(element, type, func, nonPassive, capture) {
	    return element.addEventListener(type, func, {
	      passive: !nonPassive,
	      capture: !!capture
	    });
	  },
	  _removeListener$1 = function _removeListener(element, type, func, capture) {
	    return element.removeEventListener(type, func, !!capture);
	  },
	  _scrollLeft = "scrollLeft",
	  _scrollTop = "scrollTop",
	  _onScroll$1 = function _onScroll() {
	    return _normalizer$1 && _normalizer$1.isPressed || _scrollers.cache++;
	  },
	  _scrollCacheFunc = function _scrollCacheFunc(f, doNotCache) {
	    var cachingFunc = function cachingFunc(value) {
	      // since reading the scrollTop/scrollLeft/pageOffsetY/pageOffsetX can trigger a layout, this function allows us to cache the value so it only gets read fresh after a "scroll" event fires (or while we're refreshing because that can lengthen the page and alter the scroll position). when "soft" is true, that means don't actually set the scroll, but cache the new value instead (useful in ScrollSmoother)
	      if (value || value === 0) {
	        _startup$1 && (_win$1.history.scrollRestoration = "manual"); // otherwise the new position will get overwritten by the browser onload.

	        var isNormalizing = _normalizer$1 && _normalizer$1.isPressed;
	        value = cachingFunc.v = Math.round(value) || (_normalizer$1 && _normalizer$1.iOS ? 1 : 0); //TODO: iOS Bug: if you allow it to go to 0, Safari can start to report super strange (wildly inaccurate) touch positions!

	        f(value);
	        cachingFunc.cacheID = _scrollers.cache;
	        isNormalizing && _bridge("ss", value); // set scroll (notify ScrollTrigger so it can dispatch a "scrollStart" event if necessary
	      } else if (doNotCache || _scrollers.cache !== cachingFunc.cacheID || _bridge("ref")) {
	        cachingFunc.cacheID = _scrollers.cache;
	        cachingFunc.v = f();
	      }
	      return cachingFunc.v + cachingFunc.offset;
	    };
	    cachingFunc.offset = 0;
	    return f && cachingFunc;
	  },
	  _horizontal = {
	    s: _scrollLeft,
	    p: "left",
	    p2: "Left",
	    os: "right",
	    os2: "Right",
	    d: "width",
	    d2: "Width",
	    a: "x",
	    sc: _scrollCacheFunc(function (value) {
	      return arguments.length ? _win$1.scrollTo(value, _vertical.sc()) : _win$1.pageXOffset || _doc$1[_scrollLeft] || _docEl$1[_scrollLeft] || _body$1[_scrollLeft] || 0;
	    })
	  },
	  _vertical = {
	    s: _scrollTop,
	    p: "top",
	    p2: "Top",
	    os: "bottom",
	    os2: "Bottom",
	    d: "height",
	    d2: "Height",
	    a: "y",
	    op: _horizontal,
	    sc: _scrollCacheFunc(function (value) {
	      return arguments.length ? _win$1.scrollTo(_horizontal.sc(), value) : _win$1.pageYOffset || _doc$1[_scrollTop] || _docEl$1[_scrollTop] || _body$1[_scrollTop] || 0;
	    })
	  },
	  _getTarget = function _getTarget(t) {
	    return gsap$1.utils.toArray(t)[0] || (typeof t === "string" && gsap$1.config().nullTargetWarn !== false ? console.warn("Element not found:", t) : null);
	  },
	  _getScrollFunc = function _getScrollFunc(element, _ref) {
	    var s = _ref.s,
	      sc = _ref.sc;
	    // we store the scroller functions in an alternating sequenced Array like [element, verticalScrollFunc, horizontalScrollFunc, ...] so that we can minimize memory, maximize performance, and we also record the last position as a ".rec" property in order to revert to that after refreshing to ensure things don't shift around.
	    _isViewport$1(element) && (element = _doc$1.scrollingElement || _docEl$1);
	    var i = _scrollers.indexOf(element),
	      offset = sc === _vertical.sc ? 1 : 2;
	    !~i && (i = _scrollers.push(element) - 1);
	    _scrollers[i + offset] || element.addEventListener("scroll", _onScroll$1); // clear the cache when a scroll occurs

	    var prev = _scrollers[i + offset],
	      func = prev || (_scrollers[i + offset] = _scrollCacheFunc(_getProxyProp(element, s), true) || (_isViewport$1(element) ? sc : _scrollCacheFunc(function (value) {
	        return arguments.length ? element[s] = value : element[s];
	      })));
	    func.target = element;
	    prev || (func.smooth = gsap$1.getProperty(element, "scrollBehavior") === "smooth"); // only set it the first time (don't reset every time a scrollFunc is requested because perhaps it happens during a refresh() when it's disabled in ScrollTrigger.

	    return func;
	  },
	  _getVelocityProp = function _getVelocityProp(value, minTimeRefresh, useDelta) {
	    var v1 = value,
	      v2 = value,
	      t1 = _getTime$1(),
	      t2 = t1,
	      min = minTimeRefresh || 50,
	      dropToZeroTime = Math.max(500, min * 3),
	      update = function update(value, force) {
	        var t = _getTime$1();
	        if (force || t - t1 > min) {
	          v2 = v1;
	          v1 = value;
	          t2 = t1;
	          t1 = t;
	        } else if (useDelta) {
	          v1 += value;
	        } else {
	          // not totally necessary, but makes it a bit more accurate by adjusting the v1 value according to the new slope. This way we're not just ignoring the incoming data. Removing for now because it doesn't seem to make much practical difference and it's probably not worth the kb.
	          v1 = v2 + (value - v2) / (t - t2) * (t1 - t2);
	        }
	      },
	      reset = function reset() {
	        v2 = v1 = useDelta ? 0 : v1;
	        t2 = t1 = 0;
	      },
	      getVelocity = function getVelocity(latestValue) {
	        var tOld = t2,
	          vOld = v2,
	          t = _getTime$1();
	        (latestValue || latestValue === 0) && latestValue !== v1 && update(latestValue);
	        return t1 === t2 || t - t2 > dropToZeroTime ? 0 : (v1 + (useDelta ? vOld : -vOld)) / ((useDelta ? t : t1) - tOld) * 1000;
	      };
	    return {
	      update: update,
	      reset: reset,
	      getVelocity: getVelocity
	    };
	  },
	  _getEvent = function _getEvent(e, preventDefault) {
	    preventDefault && !e._gsapAllow && e.preventDefault();
	    return e.changedTouches ? e.changedTouches[0] : e;
	  },
	  _getAbsoluteMax = function _getAbsoluteMax(a) {
	    var max = Math.max.apply(Math, a),
	      min = Math.min.apply(Math, a);
	    return Math.abs(max) >= Math.abs(min) ? max : min;
	  },
	  _setScrollTrigger = function _setScrollTrigger() {
	    ScrollTrigger$1 = gsap$1.core.globals().ScrollTrigger;
	    ScrollTrigger$1 && ScrollTrigger$1.core && _integrate();
	  },
	  _initCore = function _initCore(core) {
	    gsap$1 = core || _getGSAP$1();
	    if (gsap$1 && typeof document !== "undefined" && document.body) {
	      _win$1 = window;
	      _doc$1 = document;
	      _docEl$1 = _doc$1.documentElement;
	      _body$1 = _doc$1.body;
	      _root$1 = [_win$1, _doc$1, _docEl$1, _body$1];
	      gsap$1.utils.clamp;
	      _context$1 = gsap$1.core.context || function () {};
	      _pointerType = "onpointerenter" in _body$1 ? "pointer" : "mouse"; // isTouch is 0 if no touch, 1 if ONLY touch, and 2 if it can accommodate touch but also other types like mouse/pointer.

	      _isTouch = Observer.isTouch = _win$1.matchMedia && _win$1.matchMedia("(hover: none), (pointer: coarse)").matches ? 1 : "ontouchstart" in _win$1 || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0 ? 2 : 0;
	      _eventTypes = Observer.eventTypes = ("ontouchstart" in _docEl$1 ? "touchstart,touchmove,touchcancel,touchend" : !("onpointerdown" in _docEl$1) ? "mousedown,mousemove,mouseup,mouseup" : "pointerdown,pointermove,pointercancel,pointerup").split(",");
	      setTimeout(function () {
	        return _startup$1 = 0;
	      }, 500);
	      _setScrollTrigger();
	      _coreInitted$1 = 1;
	    }
	    return _coreInitted$1;
	  };
	_horizontal.op = _vertical;
	_scrollers.cache = 0;
	var Observer = /*#__PURE__*/function () {
	  function Observer(vars) {
	    this.init(vars);
	  }
	  var _proto = Observer.prototype;
	  _proto.init = function init(vars) {
	    _coreInitted$1 || _initCore(gsap$1) || console.warn("Please gsap.registerPlugin(Observer)");
	    ScrollTrigger$1 || _setScrollTrigger();
	    var tolerance = vars.tolerance,
	      dragMinimum = vars.dragMinimum,
	      type = vars.type,
	      target = vars.target,
	      lineHeight = vars.lineHeight,
	      debounce = vars.debounce,
	      preventDefault = vars.preventDefault,
	      onStop = vars.onStop,
	      onStopDelay = vars.onStopDelay,
	      ignore = vars.ignore,
	      wheelSpeed = vars.wheelSpeed,
	      event = vars.event,
	      onDragStart = vars.onDragStart,
	      onDragEnd = vars.onDragEnd,
	      onDrag = vars.onDrag,
	      onPress = vars.onPress,
	      onRelease = vars.onRelease,
	      onRight = vars.onRight,
	      onLeft = vars.onLeft,
	      onUp = vars.onUp,
	      onDown = vars.onDown,
	      onChangeX = vars.onChangeX,
	      onChangeY = vars.onChangeY,
	      onChange = vars.onChange,
	      onToggleX = vars.onToggleX,
	      onToggleY = vars.onToggleY,
	      onHover = vars.onHover,
	      onHoverEnd = vars.onHoverEnd,
	      onMove = vars.onMove,
	      ignoreCheck = vars.ignoreCheck,
	      isNormalizer = vars.isNormalizer,
	      onGestureStart = vars.onGestureStart,
	      onGestureEnd = vars.onGestureEnd,
	      onWheel = vars.onWheel,
	      onEnable = vars.onEnable,
	      onDisable = vars.onDisable,
	      onClick = vars.onClick,
	      scrollSpeed = vars.scrollSpeed,
	      capture = vars.capture,
	      allowClicks = vars.allowClicks,
	      lockAxis = vars.lockAxis,
	      onLockAxis = vars.onLockAxis;
	    this.target = target = _getTarget(target) || _docEl$1;
	    this.vars = vars;
	    ignore && (ignore = gsap$1.utils.toArray(ignore));
	    tolerance = tolerance || 1e-9;
	    dragMinimum = dragMinimum || 0;
	    wheelSpeed = wheelSpeed || 1;
	    scrollSpeed = scrollSpeed || 1;
	    type = type || "wheel,touch,pointer";
	    debounce = debounce !== false;
	    lineHeight || (lineHeight = parseFloat(_win$1.getComputedStyle(_body$1).lineHeight) || 22); // note: browser may report "normal", so default to 22.

	    var id,
	      onStopDelayedCall,
	      dragged,
	      moved,
	      wheeled,
	      locked,
	      axis,
	      self = this,
	      prevDeltaX = 0,
	      prevDeltaY = 0,
	      scrollFuncX = _getScrollFunc(target, _horizontal),
	      scrollFuncY = _getScrollFunc(target, _vertical),
	      scrollX = scrollFuncX(),
	      scrollY = scrollFuncY(),
	      limitToTouch = ~type.indexOf("touch") && !~type.indexOf("pointer") && _eventTypes[0] === "pointerdown",
	      // for devices that accommodate mouse events and touch events, we need to distinguish.
	      isViewport = _isViewport$1(target),
	      ownerDoc = target.ownerDocument || _doc$1,
	      deltaX = [0, 0, 0],
	      // wheel, scroll, pointer/touch
	      deltaY = [0, 0, 0],
	      onClickTime = 0,
	      clickCapture = function clickCapture() {
	        return onClickTime = _getTime$1();
	      },
	      _ignoreCheck = function _ignoreCheck(e, isPointerOrTouch) {
	        return (self.event = e) && ignore && ~ignore.indexOf(e.target) || isPointerOrTouch && limitToTouch && e.pointerType !== "touch" || ignoreCheck && ignoreCheck(e, isPointerOrTouch);
	      },
	      onStopFunc = function onStopFunc() {
	        self._vx.reset();
	        self._vy.reset();
	        onStopDelayedCall.pause();
	        onStop && onStop(self);
	      },
	      update = function update() {
	        var dx = self.deltaX = _getAbsoluteMax(deltaX),
	          dy = self.deltaY = _getAbsoluteMax(deltaY),
	          changedX = Math.abs(dx) >= tolerance,
	          changedY = Math.abs(dy) >= tolerance;
	        onChange && (changedX || changedY) && onChange(self, dx, dy, deltaX, deltaY); // in ScrollTrigger.normalizeScroll(), we need to know if it was touch/pointer so we need access to the deltaX/deltaY Arrays before we clear them out.

	        if (changedX) {
	          onRight && self.deltaX > 0 && onRight(self);
	          onLeft && self.deltaX < 0 && onLeft(self);
	          onChangeX && onChangeX(self);
	          onToggleX && self.deltaX < 0 !== prevDeltaX < 0 && onToggleX(self);
	          prevDeltaX = self.deltaX;
	          deltaX[0] = deltaX[1] = deltaX[2] = 0;
	        }
	        if (changedY) {
	          onDown && self.deltaY > 0 && onDown(self);
	          onUp && self.deltaY < 0 && onUp(self);
	          onChangeY && onChangeY(self);
	          onToggleY && self.deltaY < 0 !== prevDeltaY < 0 && onToggleY(self);
	          prevDeltaY = self.deltaY;
	          deltaY[0] = deltaY[1] = deltaY[2] = 0;
	        }
	        if (moved || dragged) {
	          onMove && onMove(self);
	          if (dragged) {
	            onDrag(self);
	            dragged = false;
	          }
	          moved = false;
	        }
	        locked && !(locked = false) && onLockAxis && onLockAxis(self);
	        if (wheeled) {
	          onWheel(self);
	          wheeled = false;
	        }
	        id = 0;
	      },
	      onDelta = function onDelta(x, y, index) {
	        deltaX[index] += x;
	        deltaY[index] += y;
	        self._vx.update(x);
	        self._vy.update(y);
	        debounce ? id || (id = requestAnimationFrame(update)) : update();
	      },
	      onTouchOrPointerDelta = function onTouchOrPointerDelta(x, y) {
	        if (lockAxis && !axis) {
	          self.axis = axis = Math.abs(x) > Math.abs(y) ? "x" : "y";
	          locked = true;
	        }
	        if (axis !== "y") {
	          deltaX[2] += x;
	          self._vx.update(x, true); // update the velocity as frequently as possible instead of in the debounced function so that very quick touch-scrolls (flicks) feel natural. If it's the mouse/touch/pointer, force it so that we get snappy/accurate momentum scroll.
	        }
	        if (axis !== "x") {
	          deltaY[2] += y;
	          self._vy.update(y, true);
	        }
	        debounce ? id || (id = requestAnimationFrame(update)) : update();
	      },
	      _onDrag = function _onDrag(e) {
	        if (_ignoreCheck(e, 1)) {
	          return;
	        }
	        e = _getEvent(e, preventDefault);
	        var x = e.clientX,
	          y = e.clientY,
	          dx = x - self.x,
	          dy = y - self.y,
	          isDragging = self.isDragging;
	        self.x = x;
	        self.y = y;
	        if (isDragging || Math.abs(self.startX - x) >= dragMinimum || Math.abs(self.startY - y) >= dragMinimum) {
	          onDrag && (dragged = true);
	          isDragging || (self.isDragging = true);
	          onTouchOrPointerDelta(dx, dy);
	          isDragging || onDragStart && onDragStart(self);
	        }
	      },
	      _onPress = self.onPress = function (e) {
	        if (_ignoreCheck(e, 1)) {
	          return;
	        }
	        self.axis = axis = null;
	        onStopDelayedCall.pause();
	        self.isPressed = true;
	        e = _getEvent(e); // note: may need to preventDefault(?) Won't side-scroll on iOS Safari if we do, though.

	        prevDeltaX = prevDeltaY = 0;
	        self.startX = self.x = e.clientX;
	        self.startY = self.y = e.clientY;
	        self._vx.reset(); // otherwise the t2 may be stale if the user touches and flicks super fast and releases in less than 2 requestAnimationFrame ticks, causing velocity to be 0.

	        self._vy.reset();
	        _addListener$1(isNormalizer ? target : ownerDoc, _eventTypes[1], _onDrag, preventDefault, true);
	        self.deltaX = self.deltaY = 0;
	        onPress && onPress(self);
	      },
	      _onRelease = function _onRelease(e) {
	        if (_ignoreCheck(e, 1)) {
	          return;
	        }
	        _removeListener$1(isNormalizer ? target : ownerDoc, _eventTypes[1], _onDrag, true);
	        var isTrackingDrag = !isNaN(self.y - self.startY),
	          wasDragging = self.isDragging && (Math.abs(self.x - self.startX) > 3 || Math.abs(self.y - self.startY) > 3),
	          // some touch devices need some wiggle room in terms of sensing clicks - the finger may move a few pixels.
	          eventData = _getEvent(e);
	        if (!wasDragging && isTrackingDrag) {
	          self._vx.reset();
	          self._vy.reset();
	          if (preventDefault && allowClicks) {
	            gsap$1.delayedCall(0.08, function () {
	              // some browsers (like Firefox) won't trust script-generated clicks, so if the user tries to click on a video to play it, for example, it simply won't work. Since a regular "click" event will most likely be generated anyway (one that has its isTrusted flag set to true), we must slightly delay our script-generated click so that the "real"/trusted one is prioritized. Remember, when there are duplicate events in quick succession, we suppress all but the first one. Some browsers don't even trigger the "real" one at all, so our synthetic one is a safety valve that ensures that no matter what, a click event does get dispatched.
	              if (_getTime$1() - onClickTime > 300 && !e.defaultPrevented) {
	                if (e.target.click) {
	                  //some browsers (like mobile Safari) don't properly trigger the click event
	                  e.target.click();
	                } else if (ownerDoc.createEvent) {
	                  var syntheticEvent = ownerDoc.createEvent("MouseEvents");
	                  syntheticEvent.initMouseEvent("click", true, true, _win$1, 1, eventData.screenX, eventData.screenY, eventData.clientX, eventData.clientY, false, false, false, false, 0, null);
	                  e.target.dispatchEvent(syntheticEvent);
	                }
	              }
	            });
	          }
	        }
	        self.isDragging = self.isGesturing = self.isPressed = false;
	        onStop && !isNormalizer && onStopDelayedCall.restart(true);
	        onDragEnd && wasDragging && onDragEnd(self);
	        onRelease && onRelease(self, wasDragging);
	      },
	      _onGestureStart = function _onGestureStart(e) {
	        return e.touches && e.touches.length > 1 && (self.isGesturing = true) && onGestureStart(e, self.isDragging);
	      },
	      _onGestureEnd = function _onGestureEnd() {
	        return (self.isGesturing = false) || onGestureEnd(self);
	      },
	      onScroll = function onScroll(e) {
	        if (_ignoreCheck(e)) {
	          return;
	        }
	        var x = scrollFuncX(),
	          y = scrollFuncY();
	        onDelta((x - scrollX) * scrollSpeed, (y - scrollY) * scrollSpeed, 1);
	        scrollX = x;
	        scrollY = y;
	        onStop && onStopDelayedCall.restart(true);
	      },
	      _onWheel = function _onWheel(e) {
	        if (_ignoreCheck(e)) {
	          return;
	        }
	        e = _getEvent(e, preventDefault);
	        onWheel && (wheeled = true);
	        var multiplier = (e.deltaMode === 1 ? lineHeight : e.deltaMode === 2 ? _win$1.innerHeight : 1) * wheelSpeed;
	        onDelta(e.deltaX * multiplier, e.deltaY * multiplier, 0);
	        onStop && !isNormalizer && onStopDelayedCall.restart(true);
	      },
	      _onMove = function _onMove(e) {
	        if (_ignoreCheck(e)) {
	          return;
	        }
	        var x = e.clientX,
	          y = e.clientY,
	          dx = x - self.x,
	          dy = y - self.y;
	        self.x = x;
	        self.y = y;
	        moved = true;
	        (dx || dy) && onTouchOrPointerDelta(dx, dy);
	      },
	      _onHover = function _onHover(e) {
	        self.event = e;
	        onHover(self);
	      },
	      _onHoverEnd = function _onHoverEnd(e) {
	        self.event = e;
	        onHoverEnd(self);
	      },
	      _onClick = function _onClick(e) {
	        return _ignoreCheck(e) || _getEvent(e, preventDefault) && onClick(self);
	      };
	    onStopDelayedCall = self._dc = gsap$1.delayedCall(onStopDelay || 0.25, onStopFunc).pause();
	    self.deltaX = self.deltaY = 0;
	    self._vx = _getVelocityProp(0, 50, true);
	    self._vy = _getVelocityProp(0, 50, true);
	    self.scrollX = scrollFuncX;
	    self.scrollY = scrollFuncY;
	    self.isDragging = self.isGesturing = self.isPressed = false;
	    _context$1(this);
	    self.enable = function (e) {
	      if (!self.isEnabled) {
	        _addListener$1(isViewport ? ownerDoc : target, "scroll", _onScroll$1);
	        type.indexOf("scroll") >= 0 && _addListener$1(isViewport ? ownerDoc : target, "scroll", onScroll, preventDefault, capture);
	        type.indexOf("wheel") >= 0 && _addListener$1(target, "wheel", _onWheel, preventDefault, capture);
	        if (type.indexOf("touch") >= 0 && _isTouch || type.indexOf("pointer") >= 0) {
	          _addListener$1(target, _eventTypes[0], _onPress, preventDefault, capture);
	          _addListener$1(ownerDoc, _eventTypes[2], _onRelease);
	          _addListener$1(ownerDoc, _eventTypes[3], _onRelease);
	          allowClicks && _addListener$1(target, "click", clickCapture, false, true);
	          onClick && _addListener$1(target, "click", _onClick);
	          onGestureStart && _addListener$1(ownerDoc, "gesturestart", _onGestureStart);
	          onGestureEnd && _addListener$1(ownerDoc, "gestureend", _onGestureEnd);
	          onHover && _addListener$1(target, _pointerType + "enter", _onHover);
	          onHoverEnd && _addListener$1(target, _pointerType + "leave", _onHoverEnd);
	          onMove && _addListener$1(target, _pointerType + "move", _onMove);
	        }
	        self.isEnabled = true;
	        e && e.type && _onPress(e);
	        onEnable && onEnable(self);
	      }
	      return self;
	    };
	    self.disable = function () {
	      if (self.isEnabled) {
	        // only remove the _onScroll listener if there aren't any others that rely on the functionality.
	        _observers.filter(function (o) {
	          return o !== self && _isViewport$1(o.target);
	        }).length || _removeListener$1(isViewport ? ownerDoc : target, "scroll", _onScroll$1);
	        if (self.isPressed) {
	          self._vx.reset();
	          self._vy.reset();
	          _removeListener$1(isNormalizer ? target : ownerDoc, _eventTypes[1], _onDrag, true);
	        }
	        _removeListener$1(isViewport ? ownerDoc : target, "scroll", onScroll, capture);
	        _removeListener$1(target, "wheel", _onWheel, capture);
	        _removeListener$1(target, _eventTypes[0], _onPress, capture);
	        _removeListener$1(ownerDoc, _eventTypes[2], _onRelease);
	        _removeListener$1(ownerDoc, _eventTypes[3], _onRelease);
	        _removeListener$1(target, "click", clickCapture, true);
	        _removeListener$1(target, "click", _onClick);
	        _removeListener$1(ownerDoc, "gesturestart", _onGestureStart);
	        _removeListener$1(ownerDoc, "gestureend", _onGestureEnd);
	        _removeListener$1(target, _pointerType + "enter", _onHover);
	        _removeListener$1(target, _pointerType + "leave", _onHoverEnd);
	        _removeListener$1(target, _pointerType + "move", _onMove);
	        self.isEnabled = self.isPressed = self.isDragging = false;
	        onDisable && onDisable(self);
	      }
	    };
	    self.kill = self.revert = function () {
	      self.disable();
	      var i = _observers.indexOf(self);
	      i >= 0 && _observers.splice(i, 1);
	      _normalizer$1 === self && (_normalizer$1 = 0);
	    };
	    _observers.push(self);
	    isNormalizer && _isViewport$1(target) && (_normalizer$1 = self);
	    self.enable(event);
	  };
	  _createClass(Observer, [{
	    key: "velocityX",
	    get: function get() {
	      return this._vx.getVelocity();
	    }
	  }, {
	    key: "velocityY",
	    get: function get() {
	      return this._vy.getVelocity();
	    }
	  }]);
	  return Observer;
	}();
	Observer.version = "3.11.4";
	Observer.create = function (vars) {
	  return new Observer(vars);
	};
	Observer.register = _initCore;
	Observer.getAll = function () {
	  return _observers.slice();
	};
	Observer.getById = function (id) {
	  return _observers.filter(function (o) {
	    return o.vars.id === id;
	  })[0];
	};
	_getGSAP$1() && gsap$1.registerPlugin(Observer);

	/*!
	 * ScrollTrigger 3.11.4
	 * https://greensock.com
	 *
	 * @license Copyright 2008-2022, GreenSock. All rights reserved.
	 * Subject to the terms at https://greensock.com/standard-license or for
	 * Club GreenSock members, the agreement issued with that membership.
	 * @author: Jack Doyle, jack@greensock.com
	*/

	var gsap,
	  _coreInitted,
	  _win,
	  _doc,
	  _docEl,
	  _body,
	  _root,
	  _resizeDelay,
	  _toArray,
	  _clamp,
	  _time2,
	  _syncInterval,
	  _refreshing,
	  _pointerIsDown,
	  _transformProp,
	  _i,
	  _prevWidth,
	  _prevHeight,
	  _autoRefresh,
	  _sort,
	  _suppressOverwrites,
	  _ignoreResize,
	  _normalizer,
	  _ignoreMobileResize,
	  _baseScreenHeight,
	  _baseScreenWidth,
	  _fixIOSBug,
	  _context,
	  _scrollRestoration,
	  _limitCallbacks,
	  // if true, we'll only trigger callbacks if the active state toggles, so if you scroll immediately past both the start and end positions of a ScrollTrigger (thus inactive to inactive), neither its onEnter nor onLeave will be called. This is useful during startup.
	  _startup = 1,
	  _getTime = Date.now,
	  _time1 = _getTime(),
	  _lastScrollTime = 0,
	  _enabled = 0,
	  _pointerDownHandler = function _pointerDownHandler() {
	    return _pointerIsDown = 1;
	  },
	  _pointerUpHandler = function _pointerUpHandler() {
	    return _pointerIsDown = 0;
	  },
	  _passThrough = function _passThrough(v) {
	    return v;
	  },
	  _round = function _round(value) {
	    return Math.round(value * 100000) / 100000 || 0;
	  },
	  _windowExists = function _windowExists() {
	    return typeof window !== "undefined";
	  },
	  _getGSAP = function _getGSAP() {
	    return gsap || _windowExists() && (gsap = window.gsap) && gsap.registerPlugin && gsap;
	  },
	  _isViewport = function _isViewport(e) {
	    return !!~_root.indexOf(e);
	  },
	  _getBoundsFunc = function _getBoundsFunc(element) {
	    return _getProxyProp(element, "getBoundingClientRect") || (_isViewport(element) ? function () {
	      _winOffsets.width = _win.innerWidth;
	      _winOffsets.height = _win.innerHeight;
	      return _winOffsets;
	    } : function () {
	      return _getBounds(element);
	    });
	  },
	  _getSizeFunc = function _getSizeFunc(scroller, isViewport, _ref) {
	    var d = _ref.d,
	      d2 = _ref.d2,
	      a = _ref.a;
	    return (a = _getProxyProp(scroller, "getBoundingClientRect")) ? function () {
	      return a()[d];
	    } : function () {
	      return (isViewport ? _win["inner" + d2] : scroller["client" + d2]) || 0;
	    };
	  },
	  _getOffsetsFunc = function _getOffsetsFunc(element, isViewport) {
	    return !isViewport || ~_proxies.indexOf(element) ? _getBoundsFunc(element) : function () {
	      return _winOffsets;
	    };
	  },
	  _maxScroll = function _maxScroll(element, _ref2) {
	    var s = _ref2.s,
	      d2 = _ref2.d2,
	      d = _ref2.d,
	      a = _ref2.a;
	    return (s = "scroll" + d2) && (a = _getProxyProp(element, s)) ? a() - _getBoundsFunc(element)()[d] : _isViewport(element) ? (_docEl[s] || _body[s]) - (_win["inner" + d2] || _docEl["client" + d2] || _body["client" + d2]) : element[s] - element["offset" + d2];
	  },
	  _iterateAutoRefresh = function _iterateAutoRefresh(func, events) {
	    for (var i = 0; i < _autoRefresh.length; i += 3) {
	      (!events || ~events.indexOf(_autoRefresh[i + 1])) && func(_autoRefresh[i], _autoRefresh[i + 1], _autoRefresh[i + 2]);
	    }
	  },
	  _isString = function _isString(value) {
	    return typeof value === "string";
	  },
	  _isFunction = function _isFunction(value) {
	    return typeof value === "function";
	  },
	  _isNumber = function _isNumber(value) {
	    return typeof value === "number";
	  },
	  _isObject = function _isObject(value) {
	    return typeof value === "object";
	  },
	  _endAnimation = function _endAnimation(animation, reversed, pause) {
	    return animation && animation.progress(reversed ? 0 : 1) && pause && animation.pause();
	  },
	  _callback = function _callback(self, func) {
	    if (self.enabled) {
	      var result = func(self);
	      result && result.totalTime && (self.callbackAnimation = result);
	    }
	  },
	  _abs = Math.abs,
	  _left = "left",
	  _top = "top",
	  _right = "right",
	  _bottom = "bottom",
	  _width = "width",
	  _height = "height",
	  _Right = "Right",
	  _Left = "Left",
	  _Top = "Top",
	  _Bottom = "Bottom",
	  _padding = "padding",
	  _margin = "margin",
	  _Width = "Width",
	  _Height = "Height",
	  _px = "px",
	  _getComputedStyle = function _getComputedStyle(element) {
	    return _win.getComputedStyle(element);
	  },
	  _makePositionable = function _makePositionable(element) {
	    // if the element already has position: absolute or fixed, leave that, otherwise make it position: relative
	    var position = _getComputedStyle(element).position;
	    element.style.position = position === "absolute" || position === "fixed" ? position : "relative";
	  },
	  _setDefaults = function _setDefaults(obj, defaults) {
	    for (var p in defaults) {
	      p in obj || (obj[p] = defaults[p]);
	    }
	    return obj;
	  },
	  _getBounds = function _getBounds(element, withoutTransforms) {
	    var tween = withoutTransforms && _getComputedStyle(element)[_transformProp] !== "matrix(1, 0, 0, 1, 0, 0)" && gsap.to(element, {
	        x: 0,
	        y: 0,
	        xPercent: 0,
	        yPercent: 0,
	        rotation: 0,
	        rotationX: 0,
	        rotationY: 0,
	        scale: 1,
	        skewX: 0,
	        skewY: 0
	      }).progress(1),
	      bounds = element.getBoundingClientRect();
	    tween && tween.progress(0).kill();
	    return bounds;
	  },
	  _getSize = function _getSize(element, _ref3) {
	    var d2 = _ref3.d2;
	    return element["offset" + d2] || element["client" + d2] || 0;
	  },
	  _getLabelRatioArray = function _getLabelRatioArray(timeline) {
	    var a = [],
	      labels = timeline.labels,
	      duration = timeline.duration(),
	      p;
	    for (p in labels) {
	      a.push(labels[p] / duration);
	    }
	    return a;
	  },
	  _getClosestLabel = function _getClosestLabel(animation) {
	    return function (value) {
	      return gsap.utils.snap(_getLabelRatioArray(animation), value);
	    };
	  },
	  _snapDirectional = function _snapDirectional(snapIncrementOrArray) {
	    var snap = gsap.utils.snap(snapIncrementOrArray),
	      a = Array.isArray(snapIncrementOrArray) && snapIncrementOrArray.slice(0).sort(function (a, b) {
	        return a - b;
	      });
	    return a ? function (value, direction, threshold) {
	      if (threshold === void 0) {
	        threshold = 1e-3;
	      }
	      var i;
	      if (!direction) {
	        return snap(value);
	      }
	      if (direction > 0) {
	        value -= threshold; // to avoid rounding errors. If we're too strict, it might snap forward, then immediately again, and again.

	        for (i = 0; i < a.length; i++) {
	          if (a[i] >= value) {
	            return a[i];
	          }
	        }
	        return a[i - 1];
	      } else {
	        i = a.length;
	        value += threshold;
	        while (i--) {
	          if (a[i] <= value) {
	            return a[i];
	          }
	        }
	      }
	      return a[0];
	    } : function (value, direction, threshold) {
	      if (threshold === void 0) {
	        threshold = 1e-3;
	      }
	      var snapped = snap(value);
	      return !direction || Math.abs(snapped - value) < threshold || snapped - value < 0 === direction < 0 ? snapped : snap(direction < 0 ? value - snapIncrementOrArray : value + snapIncrementOrArray);
	    };
	  },
	  _getLabelAtDirection = function _getLabelAtDirection(timeline) {
	    return function (value, st) {
	      return _snapDirectional(_getLabelRatioArray(timeline))(value, st.direction);
	    };
	  },
	  _multiListener = function _multiListener(func, element, types, callback) {
	    return types.split(",").forEach(function (type) {
	      return func(element, type, callback);
	    });
	  },
	  _addListener = function _addListener(element, type, func, nonPassive, capture) {
	    return element.addEventListener(type, func, {
	      passive: !nonPassive,
	      capture: !!capture
	    });
	  },
	  _removeListener = function _removeListener(element, type, func, capture) {
	    return element.removeEventListener(type, func, !!capture);
	  },
	  _wheelListener = function _wheelListener(func, el, scrollFunc) {
	    return scrollFunc && scrollFunc.wheelHandler && func(el, "wheel", scrollFunc);
	  },
	  _markerDefaults = {
	    startColor: "green",
	    endColor: "red",
	    indent: 0,
	    fontSize: "16px",
	    fontWeight: "normal"
	  },
	  _defaults = {
	    toggleActions: "play",
	    anticipatePin: 0
	  },
	  _keywords = {
	    top: 0,
	    left: 0,
	    center: 0.5,
	    bottom: 1,
	    right: 1
	  },
	  _offsetToPx = function _offsetToPx(value, size) {
	    if (_isString(value)) {
	      var eqIndex = value.indexOf("="),
	        relative = ~eqIndex ? +(value.charAt(eqIndex - 1) + 1) * parseFloat(value.substr(eqIndex + 1)) : 0;
	      if (~eqIndex) {
	        value.indexOf("%") > eqIndex && (relative *= size / 100);
	        value = value.substr(0, eqIndex - 1);
	      }
	      value = relative + (value in _keywords ? _keywords[value] * size : ~value.indexOf("%") ? parseFloat(value) * size / 100 : parseFloat(value) || 0);
	    }
	    return value;
	  },
	  _createMarker = function _createMarker(type, name, container, direction, _ref4, offset, matchWidthEl, containerAnimation) {
	    var startColor = _ref4.startColor,
	      endColor = _ref4.endColor,
	      fontSize = _ref4.fontSize,
	      indent = _ref4.indent,
	      fontWeight = _ref4.fontWeight;
	    var e = _doc.createElement("div"),
	      useFixedPosition = _isViewport(container) || _getProxyProp(container, "pinType") === "fixed",
	      isScroller = type.indexOf("scroller") !== -1,
	      parent = useFixedPosition ? _body : container,
	      isStart = type.indexOf("start") !== -1,
	      color = isStart ? startColor : endColor,
	      css = "border-color:" + color + ";font-size:" + fontSize + ";color:" + color + ";font-weight:" + fontWeight + ";pointer-events:none;white-space:nowrap;font-family:sans-serif,Arial;z-index:1000;padding:4px 8px;border-width:0;border-style:solid;";
	    css += "position:" + ((isScroller || containerAnimation) && useFixedPosition ? "fixed;" : "absolute;");
	    (isScroller || containerAnimation || !useFixedPosition) && (css += (direction === _vertical ? _right : _bottom) + ":" + (offset + parseFloat(indent)) + "px;");
	    matchWidthEl && (css += "box-sizing:border-box;text-align:left;width:" + matchWidthEl.offsetWidth + "px;");
	    e._isStart = isStart;
	    e.setAttribute("class", "gsap-marker-" + type + (name ? " marker-" + name : ""));
	    e.style.cssText = css;
	    e.innerText = name || name === 0 ? type + "-" + name : type;
	    parent.children[0] ? parent.insertBefore(e, parent.children[0]) : parent.appendChild(e);
	    e._offset = e["offset" + direction.op.d2];
	    _positionMarker(e, 0, direction, isStart);
	    return e;
	  },
	  _positionMarker = function _positionMarker(marker, start, direction, flipped) {
	    var vars = {
	        display: "block"
	      },
	      side = direction[flipped ? "os2" : "p2"],
	      oppositeSide = direction[flipped ? "p2" : "os2"];
	    marker._isFlipped = flipped;
	    vars[direction.a + "Percent"] = flipped ? -100 : 0;
	    vars[direction.a] = flipped ? "1px" : 0;
	    vars["border" + side + _Width] = 1;
	    vars["border" + oppositeSide + _Width] = 0;
	    vars[direction.p] = start + "px";
	    gsap.set(marker, vars);
	  },
	  _triggers = [],
	  _ids = {},
	  _rafID,
	  _sync = function _sync() {
	    return _getTime() - _lastScrollTime > 34 && (_rafID || (_rafID = requestAnimationFrame(_updateAll)));
	  },
	  _onScroll = function _onScroll() {
	    // previously, we tried to optimize performance by batching/deferring to the next requestAnimationFrame(), but discovered that Safari has a few bugs that make this unworkable (especially on iOS). See https://codepen.io/GreenSock/pen/16c435b12ef09c38125204818e7b45fc?editors=0010 and https://codepen.io/GreenSock/pen/JjOxYpQ/3dd65ccec5a60f1d862c355d84d14562?editors=0010 and https://codepen.io/GreenSock/pen/ExbrPNa/087cef197dc35445a0951e8935c41503?editors=0010
	    if (!_normalizer || !_normalizer.isPressed || _normalizer.startX > _body.clientWidth) {
	      // if the user is dragging the scrollbar, allow it.
	      _scrollers.cache++;
	      if (_normalizer) {
	        _rafID || (_rafID = requestAnimationFrame(_updateAll));
	      } else {
	        _updateAll(); // Safari in particular (on desktop) NEEDS the immediate update rather than waiting for a requestAnimationFrame() whereas iOS seems to benefit from waiting for the requestAnimationFrame() tick, at least when normalizing. See https://codepen.io/GreenSock/pen/qBYozqO?editors=0110
	      }
	      _lastScrollTime || _dispatch("scrollStart");
	      _lastScrollTime = _getTime();
	    }
	  },
	  _setBaseDimensions = function _setBaseDimensions() {
	    _baseScreenWidth = _win.innerWidth;
	    _baseScreenHeight = _win.innerHeight;
	  },
	  _onResize = function _onResize() {
	    _scrollers.cache++;
	    !_refreshing && !_ignoreResize && !_doc.fullscreenElement && !_doc.webkitFullscreenElement && (!_ignoreMobileResize || _baseScreenWidth !== _win.innerWidth || Math.abs(_win.innerHeight - _baseScreenHeight) > _win.innerHeight * 0.25) && _resizeDelay.restart(true);
	  },
	  // ignore resizes triggered by refresh()
	  _listeners = {},
	  _emptyArray = [],
	  _softRefresh = function _softRefresh() {
	    return _removeListener(ScrollTrigger, "scrollEnd", _softRefresh) || _refreshAll(true);
	  },
	  _dispatch = function _dispatch(type) {
	    return _listeners[type] && _listeners[type].map(function (f) {
	      return f();
	    }) || _emptyArray;
	  },
	  _savedStyles = [],
	  // when ScrollTrigger.saveStyles() is called, the inline styles are recorded in this Array in a sequential format like [element, cssText, gsCache, media]. This keeps it very memory-efficient and fast to iterate through.
	  _revertRecorded = function _revertRecorded(media) {
	    for (var i = 0; i < _savedStyles.length; i += 5) {
	      if (!media || _savedStyles[i + 4] && _savedStyles[i + 4].query === media) {
	        _savedStyles[i].style.cssText = _savedStyles[i + 1];
	        _savedStyles[i].getBBox && _savedStyles[i].setAttribute("transform", _savedStyles[i + 2] || "");
	        _savedStyles[i + 3].uncache = 1;
	      }
	    }
	  },
	  _revertAll = function _revertAll(kill, media) {
	    var trigger;
	    for (_i = 0; _i < _triggers.length; _i++) {
	      trigger = _triggers[_i];
	      if (trigger && (!media || trigger._ctx === media)) {
	        if (kill) {
	          trigger.kill(1);
	        } else {
	          trigger.revert(true, true);
	        }
	      }
	    }
	    media && _revertRecorded(media);
	    media || _dispatch("revert");
	  },
	  _clearScrollMemory = function _clearScrollMemory(scrollRestoration, force) {
	    // zero-out all the recorded scroll positions. Don't use _triggers because if, for example, .matchMedia() is used to create some ScrollTriggers and then the user resizes and it removes ALL ScrollTriggers, and then go back to a size where there are ScrollTriggers, it would have kept the position(s) saved from the initial state.
	    _scrollers.cache++;
	    (force || !_refreshingAll) && _scrollers.forEach(function (obj) {
	      return _isFunction(obj) && obj.cacheID++ && (obj.rec = 0);
	    });
	    _isString(scrollRestoration) && (_win.history.scrollRestoration = _scrollRestoration = scrollRestoration);
	  },
	  _refreshingAll,
	  _refreshID = 0,
	  _queueRefreshID,
	  _queueRefreshAll = function _queueRefreshAll() {
	    // we don't want to call _refreshAll() every time we create a new ScrollTrigger (for performance reasons) - it's better to batch them. Some frameworks dynamically load content and we can't rely on the window's "load" or "DOMContentLoaded" events to trigger it.
	    if (_queueRefreshID !== _refreshID) {
	      var id = _queueRefreshID = _refreshID;
	      requestAnimationFrame(function () {
	        return id === _refreshID && _refreshAll(true);
	      });
	    }
	  },
	  _refreshAll = function _refreshAll(force, skipRevert) {
	    if (_lastScrollTime && !force) {
	      _addListener(ScrollTrigger, "scrollEnd", _softRefresh);
	      return;
	    }
	    _refreshingAll = ScrollTrigger.isRefreshing = true;
	    _scrollers.forEach(function (obj) {
	      return _isFunction(obj) && obj.cacheID++ && (obj.rec = obj());
	    }); // force the clearing of the cache because some browsers take a little while to dispatch the "scroll" event and the user may have changed the scroll position and then called ScrollTrigger.refresh() right away

	    var refreshInits = _dispatch("refreshInit");
	    _sort && ScrollTrigger.sort();
	    skipRevert || _revertAll();
	    _scrollers.forEach(function (obj) {
	      if (_isFunction(obj)) {
	        obj.smooth && (obj.target.style.scrollBehavior = "auto"); // smooth scrolling interferes

	        obj(0);
	      }
	    });
	    _triggers.slice(0).forEach(function (t) {
	      return t.refresh();
	    }); // don't loop with _i because during a refresh() someone could call ScrollTrigger.update() which would iterate through _i resulting in a skip.

	    _triggers.forEach(function (t, i) {
	      // nested pins (pinnedContainer) with pinSpacing may expand the container, so we must accommodate that here.
	      if (t._subPinOffset && t.pin) {
	        var prop = t.vars.horizontal ? "offsetWidth" : "offsetHeight",
	          original = t.pin[prop];
	        t.revert(true, 1);
	        t.adjustPinSpacing(t.pin[prop] - original);
	        t.revert(false, 1);
	      }
	    });
	    _triggers.forEach(function (t) {
	      return t.vars.end === "max" && t.setPositions(t.start, Math.max(t.start + 1, _maxScroll(t.scroller, t._dir)));
	    }); // the scroller's max scroll position may change after all the ScrollTriggers refreshed (like pinning could push it down), so we need to loop back and correct any with end: "max".

	    refreshInits.forEach(function (result) {
	      return result && result.render && result.render(-1);
	    }); // if the onRefreshInit() returns an animation (typically a gsap.set()), revert it. This makes it easy to put things in a certain spot before refreshing for measurement purposes, and then put things back.

	    _scrollers.forEach(function (obj) {
	      if (_isFunction(obj)) {
	        obj.smooth && requestAnimationFrame(function () {
	          return obj.target.style.scrollBehavior = "smooth";
	        });
	        obj.rec && obj(obj.rec);
	      }
	    });
	    _clearScrollMemory(_scrollRestoration, 1);
	    _resizeDelay.pause();
	    _refreshID++;
	    _updateAll(2);
	    _triggers.forEach(function (t) {
	      return _isFunction(t.vars.onRefresh) && t.vars.onRefresh(t);
	    });
	    _refreshingAll = ScrollTrigger.isRefreshing = false;
	    _dispatch("refresh");
	  },
	  _lastScroll = 0,
	  _direction = 1,
	  _primary,
	  _updateAll = function _updateAll(force) {
	    if (!_refreshingAll || force === 2) {
	      ScrollTrigger.isUpdating = true;
	      _primary && _primary.update(0); // ScrollSmoother uses refreshPriority -9999 to become the primary that gets updated before all others because it affects the scroll position.

	      var l = _triggers.length,
	        time = _getTime(),
	        recordVelocity = time - _time1 >= 50,
	        scroll = l && _triggers[0].scroll();
	      _direction = _lastScroll > scroll ? -1 : 1;
	      _lastScroll = scroll;
	      if (recordVelocity) {
	        if (_lastScrollTime && !_pointerIsDown && time - _lastScrollTime > 200) {
	          _lastScrollTime = 0;
	          _dispatch("scrollEnd");
	        }
	        _time2 = _time1;
	        _time1 = time;
	      }
	      if (_direction < 0) {
	        _i = l;
	        while (_i-- > 0) {
	          _triggers[_i] && _triggers[_i].update(0, recordVelocity);
	        }
	        _direction = 1;
	      } else {
	        for (_i = 0; _i < l; _i++) {
	          _triggers[_i] && _triggers[_i].update(0, recordVelocity);
	        }
	      }
	      ScrollTrigger.isUpdating = false;
	    }
	    _rafID = 0;
	  },
	  _propNamesToCopy = [_left, _top, _bottom, _right, _margin + _Bottom, _margin + _Right, _margin + _Top, _margin + _Left, "display", "flexShrink", "float", "zIndex", "gridColumnStart", "gridColumnEnd", "gridRowStart", "gridRowEnd", "gridArea", "justifySelf", "alignSelf", "placeSelf", "order"],
	  _stateProps = _propNamesToCopy.concat([_width, _height, "boxSizing", "max" + _Width, "max" + _Height, "position", _margin, _padding, _padding + _Top, _padding + _Right, _padding + _Bottom, _padding + _Left]),
	  _swapPinOut = function _swapPinOut(pin, spacer, state) {
	    _setState(state);
	    var cache = pin._gsap;
	    if (cache.spacerIsNative) {
	      _setState(cache.spacerState);
	    } else if (pin._gsap.swappedIn) {
	      var parent = spacer.parentNode;
	      if (parent) {
	        parent.insertBefore(pin, spacer);
	        parent.removeChild(spacer);
	      }
	    }
	    pin._gsap.swappedIn = false;
	  },
	  _swapPinIn = function _swapPinIn(pin, spacer, cs, spacerState) {
	    if (!pin._gsap.swappedIn) {
	      var i = _propNamesToCopy.length,
	        spacerStyle = spacer.style,
	        pinStyle = pin.style,
	        p;
	      while (i--) {
	        p = _propNamesToCopy[i];
	        spacerStyle[p] = cs[p];
	      }
	      spacerStyle.position = cs.position === "absolute" ? "absolute" : "relative";
	      cs.display === "inline" && (spacerStyle.display = "inline-block");
	      pinStyle[_bottom] = pinStyle[_right] = "auto";
	      spacerStyle.flexBasis = cs.flexBasis || "auto";
	      spacerStyle.overflow = "visible";
	      spacerStyle.boxSizing = "border-box";
	      spacerStyle[_width] = _getSize(pin, _horizontal) + _px;
	      spacerStyle[_height] = _getSize(pin, _vertical) + _px;
	      spacerStyle[_padding] = pinStyle[_margin] = pinStyle[_top] = pinStyle[_left] = "0";
	      _setState(spacerState);
	      pinStyle[_width] = pinStyle["max" + _Width] = cs[_width];
	      pinStyle[_height] = pinStyle["max" + _Height] = cs[_height];
	      pinStyle[_padding] = cs[_padding];
	      if (pin.parentNode !== spacer) {
	        pin.parentNode.insertBefore(spacer, pin);
	        spacer.appendChild(pin);
	      }
	      pin._gsap.swappedIn = true;
	    }
	  },
	  _capsExp = /([A-Z])/g,
	  _setState = function _setState(state) {
	    if (state) {
	      var style = state.t.style,
	        l = state.length,
	        i = 0,
	        p,
	        value;
	      (state.t._gsap || gsap.core.getCache(state.t)).uncache = 1; // otherwise transforms may be off

	      for (; i < l; i += 2) {
	        value = state[i + 1];
	        p = state[i];
	        if (value) {
	          style[p] = value;
	        } else if (style[p]) {
	          style.removeProperty(p.replace(_capsExp, "-$1").toLowerCase());
	        }
	      }
	    }
	  },
	  _getState = function _getState(element) {
	    // returns an Array with alternating values like [property, value, property, value] and a "t" property pointing to the target (element). Makes it fast and cheap.
	    var l = _stateProps.length,
	      style = element.style,
	      state = [],
	      i = 0;
	    for (; i < l; i++) {
	      state.push(_stateProps[i], style[_stateProps[i]]);
	    }
	    state.t = element;
	    return state;
	  },
	  _copyState = function _copyState(state, override, omitOffsets) {
	    var result = [],
	      l = state.length,
	      i = omitOffsets ? 8 : 0,
	      // skip top, left, right, bottom if omitOffsets is true
	      p;
	    for (; i < l; i += 2) {
	      p = state[i];
	      result.push(p, p in override ? override[p] : state[i + 1]);
	    }
	    result.t = state.t;
	    return result;
	  },
	  _winOffsets = {
	    left: 0,
	    top: 0
	  },
	  // // potential future feature (?) Allow users to calculate where a trigger hits (scroll position) like getScrollPosition("#id", "top bottom")
	  // _getScrollPosition = (trigger, position, {scroller, containerAnimation, horizontal}) => {
	  // 	scroller = _getTarget(scroller || _win);
	  // 	let direction = horizontal ? _horizontal : _vertical,
	  // 		isViewport = _isViewport(scroller);
	  // 	_getSizeFunc(scroller, isViewport, direction);
	  // 	return _parsePosition(position, _getTarget(trigger), _getSizeFunc(scroller, isViewport, direction)(), direction, _getScrollFunc(scroller, direction)(), 0, 0, 0, _getOffsetsFunc(scroller, isViewport)(), isViewport ? 0 : parseFloat(_getComputedStyle(scroller)["border" + direction.p2 + _Width]) || 0, 0, containerAnimation ? containerAnimation.duration() : _maxScroll(scroller), containerAnimation);
	  // },
	  _parsePosition = function _parsePosition(value, trigger, scrollerSize, direction, scroll, marker, markerScroller, self, scrollerBounds, borderWidth, useFixedPosition, scrollerMax, containerAnimation) {
	    _isFunction(value) && (value = value(self));
	    if (_isString(value) && value.substr(0, 3) === "max") {
	      value = scrollerMax + (value.charAt(4) === "=" ? _offsetToPx("0" + value.substr(3), scrollerSize) : 0);
	    }
	    var time = containerAnimation ? containerAnimation.time() : 0,
	      p1,
	      p2,
	      element;
	    containerAnimation && containerAnimation.seek(0);
	    if (!_isNumber(value)) {
	      _isFunction(trigger) && (trigger = trigger(self));
	      var offsets = (value || "0").split(" "),
	        bounds,
	        localOffset,
	        globalOffset,
	        display;
	      element = _getTarget(trigger) || _body;
	      bounds = _getBounds(element) || {};
	      if ((!bounds || !bounds.left && !bounds.top) && _getComputedStyle(element).display === "none") {
	        // if display is "none", it won't report getBoundingClientRect() properly
	        display = element.style.display;
	        element.style.display = "block";
	        bounds = _getBounds(element);
	        display ? element.style.display = display : element.style.removeProperty("display");
	      }
	      localOffset = _offsetToPx(offsets[0], bounds[direction.d]);
	      globalOffset = _offsetToPx(offsets[1] || "0", scrollerSize);
	      value = bounds[direction.p] - scrollerBounds[direction.p] - borderWidth + localOffset + scroll - globalOffset;
	      markerScroller && _positionMarker(markerScroller, globalOffset, direction, scrollerSize - globalOffset < 20 || markerScroller._isStart && globalOffset > 20);
	      scrollerSize -= scrollerSize - globalOffset; // adjust for the marker
	    } else if (markerScroller) {
	      _positionMarker(markerScroller, scrollerSize, direction, true);
	    }
	    if (marker) {
	      var position = value + scrollerSize,
	        isStart = marker._isStart;
	      p1 = "scroll" + direction.d2;
	      _positionMarker(marker, position, direction, isStart && position > 20 || !isStart && (useFixedPosition ? Math.max(_body[p1], _docEl[p1]) : marker.parentNode[p1]) <= position + 1);
	      if (useFixedPosition) {
	        scrollerBounds = _getBounds(markerScroller);
	        useFixedPosition && (marker.style[direction.op.p] = scrollerBounds[direction.op.p] - direction.op.m - marker._offset + _px);
	      }
	    }
	    if (containerAnimation && element) {
	      p1 = _getBounds(element);
	      containerAnimation.seek(scrollerMax);
	      p2 = _getBounds(element);
	      containerAnimation._caScrollDist = p1[direction.p] - p2[direction.p];
	      value = value / containerAnimation._caScrollDist * scrollerMax;
	    }
	    containerAnimation && containerAnimation.seek(time);
	    return containerAnimation ? value : Math.round(value);
	  },
	  _prefixExp = /(webkit|moz|length|cssText|inset)/i,
	  _reparent = function _reparent(element, parent, top, left) {
	    if (element.parentNode !== parent) {
	      var style = element.style,
	        p,
	        cs;
	      if (parent === _body) {
	        element._stOrig = style.cssText; // record original inline styles so we can revert them later

	        cs = _getComputedStyle(element);
	        for (p in cs) {
	          // must copy all relevant styles to ensure that nothing changes visually when we reparent to the <body>. Skip the vendor prefixed ones.
	          if (!+p && !_prefixExp.test(p) && cs[p] && typeof style[p] === "string" && p !== "0") {
	            style[p] = cs[p];
	          }
	        }
	        style.top = top;
	        style.left = left;
	      } else {
	        style.cssText = element._stOrig;
	      }
	      gsap.core.getCache(element).uncache = 1;
	      parent.appendChild(element);
	    }
	  },
	  // _mergeAnimations = animations => {
	  // 	let tl = gsap.timeline({smoothChildTiming: true}).startTime(Math.min(...animations.map(a => a.globalTime(0))));
	  // 	animations.forEach(a => {let time = a.totalTime(); tl.add(a); a.totalTime(time); });
	  // 	tl.smoothChildTiming = false;
	  // 	return tl;
	  // },
	  // returns a function that can be used to tween the scroll position in the direction provided, and when doing so it'll add a .tween property to the FUNCTION itself, and remove it when the tween completes or gets killed. This gives us a way to have multiple ScrollTriggers use a central function for any given scroller and see if there's a scroll tween running (which would affect if/how things get updated)
	  _getTweenCreator = function _getTweenCreator(scroller, direction) {
	    var getScroll = _getScrollFunc(scroller, direction),
	      prop = "_scroll" + direction.p2,
	      // add a tweenable property to the scroller that's a getter/setter function, like _scrollTop or _scrollLeft. This way, if someone does gsap.killTweensOf(scroller) it'll kill the scroll tween.
	      lastScroll1,
	      lastScroll2,
	      getTween = function getTween(scrollTo, vars, initialValue, change1, change2) {
	        var tween = getTween.tween,
	          onComplete = vars.onComplete,
	          modifiers = {};
	        initialValue = initialValue || getScroll();
	        change2 = change1 && change2 || 0; // if change1 is 0, we set that to the difference and ignore change2. Otherwise, there would be a compound effect.

	        change1 = change1 || scrollTo - initialValue;
	        tween && tween.kill();
	        lastScroll1 = Math.round(initialValue);
	        vars[prop] = scrollTo;
	        vars.modifiers = modifiers;
	        modifiers[prop] = function (value) {
	          value = Math.round(getScroll()); // round because in some [very uncommon] Windows environments, it can get reported with decimals even though it was set without.

	          if (value !== lastScroll1 && value !== lastScroll2 && Math.abs(value - lastScroll1) > 3 && Math.abs(value - lastScroll2) > 3) {
	            // if the user scrolls, kill the tween. iOS Safari intermittently misreports the scroll position, it may be the most recently-set one or the one before that! When Safari is zoomed (CMD-+), it often misreports as 1 pixel off too! So if we set the scroll position to 125, for example, it'll actually report it as 124.
	            tween.kill();
	            getTween.tween = 0;
	          } else {
	            value = initialValue + change1 * tween.ratio + change2 * tween.ratio * tween.ratio;
	          }
	          lastScroll2 = lastScroll1;
	          return lastScroll1 = Math.round(value);
	        };
	        vars.onUpdate = function () {
	          _scrollers.cache++;
	          _updateAll();
	        };
	        vars.onComplete = function () {
	          getTween.tween = 0;
	          onComplete && onComplete.call(tween);
	        };
	        tween = getTween.tween = gsap.to(scroller, vars);
	        return tween;
	      };
	    scroller[prop] = getScroll;
	    getScroll.wheelHandler = function () {
	      return getTween.tween && getTween.tween.kill() && (getTween.tween = 0);
	    };
	    _addListener(scroller, "wheel", getScroll.wheelHandler); // Windows machines handle mousewheel scrolling in chunks (like "3 lines per scroll") meaning the typical strategy for cancelling the scroll isn't as sensitive. It's much more likely to match one of the previous 2 scroll event positions. So we kill any snapping as soon as there's a wheel event.

	    return getTween;
	  };
	var ScrollTrigger = /*#__PURE__*/function () {
	  function ScrollTrigger(vars, animation) {
	    _coreInitted || ScrollTrigger.register(gsap) || console.warn("Please gsap.registerPlugin(ScrollTrigger)");
	    this.init(vars, animation);
	  }
	  var _proto = ScrollTrigger.prototype;
	  _proto.init = function init(vars, animation) {
	    this.progress = this.start = 0;
	    this.vars && this.kill(true, true); // in case it's being initted again

	    if (!_enabled) {
	      this.update = this.refresh = this.kill = _passThrough;
	      return;
	    }
	    vars = _setDefaults(_isString(vars) || _isNumber(vars) || vars.nodeType ? {
	      trigger: vars
	    } : vars, _defaults);
	    var _vars = vars,
	      onUpdate = _vars.onUpdate,
	      toggleClass = _vars.toggleClass,
	      id = _vars.id,
	      onToggle = _vars.onToggle,
	      onRefresh = _vars.onRefresh,
	      scrub = _vars.scrub,
	      trigger = _vars.trigger,
	      pin = _vars.pin,
	      pinSpacing = _vars.pinSpacing,
	      invalidateOnRefresh = _vars.invalidateOnRefresh,
	      anticipatePin = _vars.anticipatePin,
	      onScrubComplete = _vars.onScrubComplete,
	      onSnapComplete = _vars.onSnapComplete,
	      once = _vars.once,
	      snap = _vars.snap,
	      pinReparent = _vars.pinReparent,
	      pinSpacer = _vars.pinSpacer,
	      containerAnimation = _vars.containerAnimation,
	      fastScrollEnd = _vars.fastScrollEnd,
	      preventOverlaps = _vars.preventOverlaps,
	      direction = vars.horizontal || vars.containerAnimation && vars.horizontal !== false ? _horizontal : _vertical,
	      isToggle = !scrub && scrub !== 0,
	      scroller = _getTarget(vars.scroller || _win),
	      scrollerCache = gsap.core.getCache(scroller),
	      isViewport = _isViewport(scroller),
	      useFixedPosition = ("pinType" in vars ? vars.pinType : _getProxyProp(scroller, "pinType") || isViewport && "fixed") === "fixed",
	      callbacks = [vars.onEnter, vars.onLeave, vars.onEnterBack, vars.onLeaveBack],
	      toggleActions = isToggle && vars.toggleActions.split(" "),
	      markers = "markers" in vars ? vars.markers : _defaults.markers,
	      borderWidth = isViewport ? 0 : parseFloat(_getComputedStyle(scroller)["border" + direction.p2 + _Width]) || 0,
	      self = this,
	      onRefreshInit = vars.onRefreshInit && function () {
	        return vars.onRefreshInit(self);
	      },
	      getScrollerSize = _getSizeFunc(scroller, isViewport, direction),
	      getScrollerOffsets = _getOffsetsFunc(scroller, isViewport),
	      lastSnap = 0,
	      lastRefresh = 0,
	      scrollFunc = _getScrollFunc(scroller, direction),
	      tweenTo,
	      pinCache,
	      snapFunc,
	      scroll1,
	      scroll2,
	      start,
	      end,
	      markerStart,
	      markerEnd,
	      markerStartTrigger,
	      markerEndTrigger,
	      markerVars,
	      change,
	      pinOriginalState,
	      pinActiveState,
	      pinState,
	      spacer,
	      offset,
	      pinGetter,
	      pinSetter,
	      pinStart,
	      pinChange,
	      spacingStart,
	      spacerState,
	      markerStartSetter,
	      pinMoves,
	      markerEndSetter,
	      cs,
	      snap1,
	      snap2,
	      scrubTween,
	      scrubSmooth,
	      snapDurClamp,
	      snapDelayedCall,
	      prevProgress,
	      prevScroll,
	      prevAnimProgress,
	      caMarkerSetter,
	      customRevertReturn;
	    _context(self);
	    self._dir = direction;
	    anticipatePin *= 45;
	    self.scroller = scroller;
	    self.scroll = containerAnimation ? containerAnimation.time.bind(containerAnimation) : scrollFunc;
	    scroll1 = scrollFunc();
	    self.vars = vars;
	    animation = animation || vars.animation;
	    if ("refreshPriority" in vars) {
	      _sort = 1;
	      vars.refreshPriority === -9999 && (_primary = self); // used by ScrollSmoother
	    }
	    scrollerCache.tweenScroll = scrollerCache.tweenScroll || {
	      top: _getTweenCreator(scroller, _vertical),
	      left: _getTweenCreator(scroller, _horizontal)
	    };
	    self.tweenTo = tweenTo = scrollerCache.tweenScroll[direction.p];
	    self.scrubDuration = function (value) {
	      scrubSmooth = _isNumber(value) && value;
	      if (!scrubSmooth) {
	        scrubTween && scrubTween.progress(1).kill();
	        scrubTween = 0;
	      } else {
	        scrubTween ? scrubTween.duration(value) : scrubTween = gsap.to(animation, {
	          ease: "expo",
	          totalProgress: "+=0.001",
	          duration: scrubSmooth,
	          paused: true,
	          onComplete: function onComplete() {
	            return onScrubComplete && onScrubComplete(self);
	          }
	        });
	      }
	    };
	    if (animation) {
	      animation.vars.lazy = false;
	      animation._initted || animation.vars.immediateRender !== false && vars.immediateRender !== false && animation.duration() && animation.render(0, true, true);
	      self.animation = animation.pause();
	      animation.scrollTrigger = self;
	      self.scrubDuration(scrub);
	      snap1 = 0;
	      id || (id = animation.vars.id);
	    }
	    _triggers.push(self);
	    if (snap) {
	      // TODO: potential idea: use legitimate CSS scroll snapping by pushing invisible elements into the DOM that serve as snap positions, and toggle the document.scrollingElement.style.scrollSnapType onToggle. See https://codepen.io/GreenSock/pen/JjLrgWM for a quick proof of concept.
	      if (!_isObject(snap) || snap.push) {
	        snap = {
	          snapTo: snap
	        };
	      }
	      "scrollBehavior" in _body.style && gsap.set(isViewport ? [_body, _docEl] : scroller, {
	        scrollBehavior: "auto"
	      }); // smooth scrolling doesn't work with snap.

	      _scrollers.forEach(function (o) {
	        return _isFunction(o) && o.target === (isViewport ? _doc.scrollingElement || _docEl : scroller) && (o.smooth = false);
	      }); // note: set smooth to false on both the vertical and horizontal scroll getters/setters

	      snapFunc = _isFunction(snap.snapTo) ? snap.snapTo : snap.snapTo === "labels" ? _getClosestLabel(animation) : snap.snapTo === "labelsDirectional" ? _getLabelAtDirection(animation) : snap.directional !== false ? function (value, st) {
	        return _snapDirectional(snap.snapTo)(value, _getTime() - lastRefresh < 500 ? 0 : st.direction);
	      } : gsap.utils.snap(snap.snapTo);
	      snapDurClamp = snap.duration || {
	        min: 0.1,
	        max: 2
	      };
	      snapDurClamp = _isObject(snapDurClamp) ? _clamp(snapDurClamp.min, snapDurClamp.max) : _clamp(snapDurClamp, snapDurClamp);
	      snapDelayedCall = gsap.delayedCall(snap.delay || scrubSmooth / 2 || 0.1, function () {
	        var scroll = scrollFunc(),
	          refreshedRecently = _getTime() - lastRefresh < 500,
	          tween = tweenTo.tween;
	        if ((refreshedRecently || Math.abs(self.getVelocity()) < 10) && !tween && !_pointerIsDown && lastSnap !== scroll) {
	          var progress = (scroll - start) / change,
	            totalProgress = animation && !isToggle ? animation.totalProgress() : progress,
	            velocity = refreshedRecently ? 0 : (totalProgress - snap2) / (_getTime() - _time2) * 1000 || 0,
	            change1 = gsap.utils.clamp(-progress, 1 - progress, _abs(velocity / 2) * velocity / 0.185),
	            naturalEnd = progress + (snap.inertia === false ? 0 : change1),
	            endValue = _clamp(0, 1, snapFunc(naturalEnd, self)),
	            endScroll = Math.round(start + endValue * change),
	            _snap = snap,
	            onStart = _snap.onStart,
	            _onInterrupt = _snap.onInterrupt,
	            _onComplete = _snap.onComplete;
	          if (scroll <= end && scroll >= start && endScroll !== scroll) {
	            if (tween && !tween._initted && tween.data <= _abs(endScroll - scroll)) {
	              // there's an overlapping snap! So we must figure out which one is closer and let that tween live.
	              return;
	            }
	            if (snap.inertia === false) {
	              change1 = endValue - progress;
	            }
	            tweenTo(endScroll, {
	              duration: snapDurClamp(_abs(Math.max(_abs(naturalEnd - totalProgress), _abs(endValue - totalProgress)) * 0.185 / velocity / 0.05 || 0)),
	              ease: snap.ease || "power3",
	              data: _abs(endScroll - scroll),
	              // record the distance so that if another snap tween occurs (conflict) we can prioritize the closest snap.
	              onInterrupt: function onInterrupt() {
	                return snapDelayedCall.restart(true) && _onInterrupt && _onInterrupt(self);
	              },
	              onComplete: function onComplete() {
	                self.update();
	                lastSnap = scrollFunc();
	                snap1 = snap2 = animation && !isToggle ? animation.totalProgress() : self.progress;
	                onSnapComplete && onSnapComplete(self);
	                _onComplete && _onComplete(self);
	              }
	            }, scroll, change1 * change, endScroll - scroll - change1 * change);
	            onStart && onStart(self, tweenTo.tween);
	          }
	        } else if (self.isActive && lastSnap !== scroll) {
	          snapDelayedCall.restart(true);
	        }
	      }).pause();
	    }
	    id && (_ids[id] = self);
	    trigger = self.trigger = _getTarget(trigger || pin); // if a trigger has some kind of scroll-related effect applied that could contaminate the "y" or "x" position (like a ScrollSmoother effect), we needed a way to temporarily revert it, so we use the stRevert property of the gsCache. It can return another function that we'll call at the end so it can return to its normal state.

	    customRevertReturn = trigger && trigger._gsap && trigger._gsap.stRevert;
	    customRevertReturn && (customRevertReturn = customRevertReturn(self));
	    pin = pin === true ? trigger : _getTarget(pin);
	    _isString(toggleClass) && (toggleClass = {
	      targets: trigger,
	      className: toggleClass
	    });
	    if (pin) {
	      pinSpacing === false || pinSpacing === _margin || (pinSpacing = !pinSpacing && pin.parentNode && pin.parentNode.style && _getComputedStyle(pin.parentNode).display === "flex" ? false : _padding); // if the parent is display: flex, don't apply pinSpacing by default. We should check that pin.parentNode is an element (not shadow dom window)

	      self.pin = pin;
	      pinCache = gsap.core.getCache(pin);
	      if (!pinCache.spacer) {
	        // record the spacer and pinOriginalState on the cache in case someone tries pinning the same element with MULTIPLE ScrollTriggers - we don't want to have multiple spacers or record the "original" pin state after it has already been affected by another ScrollTrigger.
	        if (pinSpacer) {
	          pinSpacer = _getTarget(pinSpacer);
	          pinSpacer && !pinSpacer.nodeType && (pinSpacer = pinSpacer.current || pinSpacer.nativeElement); // for React & Angular

	          pinCache.spacerIsNative = !!pinSpacer;
	          pinSpacer && (pinCache.spacerState = _getState(pinSpacer));
	        }
	        pinCache.spacer = spacer = pinSpacer || _doc.createElement("div");
	        spacer.classList.add("pin-spacer");
	        id && spacer.classList.add("pin-spacer-" + id);
	        pinCache.pinState = pinOriginalState = _getState(pin);
	      } else {
	        pinOriginalState = pinCache.pinState;
	      }
	      vars.force3D !== false && gsap.set(pin, {
	        force3D: true
	      });
	      self.spacer = spacer = pinCache.spacer;
	      cs = _getComputedStyle(pin);
	      spacingStart = cs[pinSpacing + direction.os2];
	      pinGetter = gsap.getProperty(pin);
	      pinSetter = gsap.quickSetter(pin, direction.a, _px); // pin.firstChild && !_maxScroll(pin, direction) && (pin.style.overflow = "hidden"); // protects from collapsing margins, but can have unintended consequences as demonstrated here: https://codepen.io/GreenSock/pen/1e42c7a73bfa409d2cf1e184e7a4248d so it was removed in favor of just telling people to set up their CSS to avoid the collapsing margins (overflow: hidden | auto is just one option. Another is border-top: 1px solid transparent).

	      _swapPinIn(pin, spacer, cs);
	      pinState = _getState(pin);
	    }
	    if (markers) {
	      markerVars = _isObject(markers) ? _setDefaults(markers, _markerDefaults) : _markerDefaults;
	      markerStartTrigger = _createMarker("scroller-start", id, scroller, direction, markerVars, 0);
	      markerEndTrigger = _createMarker("scroller-end", id, scroller, direction, markerVars, 0, markerStartTrigger);
	      offset = markerStartTrigger["offset" + direction.op.d2];
	      var content = _getTarget(_getProxyProp(scroller, "content") || scroller);
	      markerStart = this.markerStart = _createMarker("start", id, content, direction, markerVars, offset, 0, containerAnimation);
	      markerEnd = this.markerEnd = _createMarker("end", id, content, direction, markerVars, offset, 0, containerAnimation);
	      containerAnimation && (caMarkerSetter = gsap.quickSetter([markerStart, markerEnd], direction.a, _px));
	      if (!useFixedPosition && !(_proxies.length && _getProxyProp(scroller, "fixedMarkers") === true)) {
	        _makePositionable(isViewport ? _body : scroller);
	        gsap.set([markerStartTrigger, markerEndTrigger], {
	          force3D: true
	        });
	        markerStartSetter = gsap.quickSetter(markerStartTrigger, direction.a, _px);
	        markerEndSetter = gsap.quickSetter(markerEndTrigger, direction.a, _px);
	      }
	    }
	    if (containerAnimation) {
	      var oldOnUpdate = containerAnimation.vars.onUpdate,
	        oldParams = containerAnimation.vars.onUpdateParams;
	      containerAnimation.eventCallback("onUpdate", function () {
	        self.update(0, 0, 1);
	        oldOnUpdate && oldOnUpdate.apply(oldParams || []);
	      });
	    }
	    self.previous = function () {
	      return _triggers[_triggers.indexOf(self) - 1];
	    };
	    self.next = function () {
	      return _triggers[_triggers.indexOf(self) + 1];
	    };
	    self.revert = function (revert, temp) {
	      if (!temp) {
	        return self.kill(true);
	      } // for compatibility with gsap.context() and gsap.matchMedia() which call revert()

	      var r = revert !== false || !self.enabled,
	        prevRefreshing = _refreshing;
	      if (r !== self.isReverted) {
	        if (r) {
	          // if (!self.scroll.rec && (_refreshing || _refreshingAll)) {
	          // 	self.scroll.rec = scrollFunc();
	          // 	_refreshingAll && scrollFunc(0);
	          // }
	          prevScroll = Math.max(scrollFunc(), self.scroll.rec || 0); // record the scroll so we can revert later (repositioning/pinning things can affect scroll position). In the static refresh() method, we first record all the scroll positions as a reference.

	          prevProgress = self.progress;
	          prevAnimProgress = animation && animation.progress();
	        }
	        markerStart && [markerStart, markerEnd, markerStartTrigger, markerEndTrigger].forEach(function (m) {
	          return m.style.display = r ? "none" : "block";
	        });
	        if (r) {
	          _refreshing = 1;
	          self.update(r); // make sure the pin is back in its original position so that all the measurements are correct. do this BEFORE swapping the pin out
	        }
	        if (pin && (!pinReparent || !self.isActive)) {
	          if (r) {
	            _swapPinOut(pin, spacer, pinOriginalState);
	          } else {
	            _swapPinIn(pin, spacer, _getComputedStyle(pin), spacerState);
	          }
	        }
	        r || self.update(r); // when we're restoring, the update should run AFTER swapping the pin into its pin-spacer.

	        _refreshing = prevRefreshing; // restore. We set it to true during the update() so that things fire properly in there.

	        self.isReverted = r;
	      }
	    };
	    self.refresh = function (soft, force) {
	      if ((_refreshing || !self.enabled) && !force) {
	        return;
	      }
	      if (pin && soft && _lastScrollTime) {
	        _addListener(ScrollTrigger, "scrollEnd", _softRefresh);
	        return;
	      }
	      !_refreshingAll && onRefreshInit && onRefreshInit(self);
	      _refreshing = 1;
	      lastRefresh = _getTime();
	      if (tweenTo.tween) {
	        tweenTo.tween.kill();
	        tweenTo.tween = 0;
	      }
	      scrubTween && scrubTween.pause();
	      invalidateOnRefresh && animation && animation.revert({
	        kill: false
	      }).invalidate();
	      self.isReverted || self.revert(true, true);
	      self._subPinOffset = false; // we'll set this to true in the sub-pins if we find any

	      var size = getScrollerSize(),
	        scrollerBounds = getScrollerOffsets(),
	        max = containerAnimation ? containerAnimation.duration() : _maxScroll(scroller, direction),
	        offset = 0,
	        otherPinOffset = 0,
	        parsedEnd = vars.end,
	        parsedEndTrigger = vars.endTrigger || trigger,
	        parsedStart = vars.start || (vars.start === 0 || !trigger ? 0 : pin ? "0 0" : "0 100%"),
	        pinnedContainer = self.pinnedContainer = vars.pinnedContainer && _getTarget(vars.pinnedContainer),
	        triggerIndex = trigger && Math.max(0, _triggers.indexOf(self)) || 0,
	        i = triggerIndex,
	        cs,
	        bounds,
	        scroll,
	        isVertical,
	        override,
	        curTrigger,
	        curPin,
	        oppositeScroll,
	        initted,
	        revertedPins,
	        forcedOverflow;
	      while (i--) {
	        // user might try to pin the same element more than once, so we must find any prior triggers with the same pin, revert them, and determine how long they're pinning so that we can offset things appropriately. Make sure we revert from last to first so that things "rewind" properly.
	        curTrigger = _triggers[i];
	        curTrigger.end || curTrigger.refresh(0, 1) || (_refreshing = 1); // if it's a timeline-based trigger that hasn't been fully initialized yet because it's waiting for 1 tick, just force the refresh() here, otherwise if it contains a pin that's supposed to affect other ScrollTriggers further down the page, they won't be adjusted properly.

	        curPin = curTrigger.pin;
	        if (curPin && (curPin === trigger || curPin === pin) && !curTrigger.isReverted) {
	          revertedPins || (revertedPins = []);
	          revertedPins.unshift(curTrigger); // we'll revert from first to last to make sure things reach their end state properly

	          curTrigger.revert(true, true);
	        }
	        if (curTrigger !== _triggers[i]) {
	          // in case it got removed.
	          triggerIndex--;
	          i--;
	        }
	      }
	      _isFunction(parsedStart) && (parsedStart = parsedStart(self));
	      start = _parsePosition(parsedStart, trigger, size, direction, scrollFunc(), markerStart, markerStartTrigger, self, scrollerBounds, borderWidth, useFixedPosition, max, containerAnimation) || (pin ? -0.001 : 0);
	      _isFunction(parsedEnd) && (parsedEnd = parsedEnd(self));
	      if (_isString(parsedEnd) && !parsedEnd.indexOf("+=")) {
	        if (~parsedEnd.indexOf(" ")) {
	          parsedEnd = (_isString(parsedStart) ? parsedStart.split(" ")[0] : "") + parsedEnd;
	        } else {
	          offset = _offsetToPx(parsedEnd.substr(2), size);
	          parsedEnd = _isString(parsedStart) ? parsedStart : start + offset; // _parsePosition won't factor in the offset if the start is a number, so do it here.

	          parsedEndTrigger = trigger;
	        }
	      }
	      end = Math.max(start, _parsePosition(parsedEnd || (parsedEndTrigger ? "100% 0" : max), parsedEndTrigger, size, direction, scrollFunc() + offset, markerEnd, markerEndTrigger, self, scrollerBounds, borderWidth, useFixedPosition, max, containerAnimation)) || -0.001;
	      change = end - start || (start -= 0.01) && 0.001;
	      offset = 0;
	      i = triggerIndex;
	      while (i--) {
	        curTrigger = _triggers[i];
	        curPin = curTrigger.pin;
	        if (curPin && curTrigger.start - curTrigger._pinPush <= start && !containerAnimation && curTrigger.end > 0) {
	          cs = curTrigger.end - curTrigger.start;
	          if ((curPin === trigger && curTrigger.start - curTrigger._pinPush < start || curPin === pinnedContainer) && !_isNumber(parsedStart)) {
	            // numeric start values shouldn't be offset at all - treat them as absolute
	            offset += cs * (1 - curTrigger.progress);
	          }
	          curPin === pin && (otherPinOffset += cs);
	        }
	      }
	      start += offset;
	      end += offset;
	      self._pinPush = otherPinOffset;
	      if (markerStart && offset) {
	        // offset the markers if necessary
	        cs = {};
	        cs[direction.a] = "+=" + offset;
	        pinnedContainer && (cs[direction.p] = "-=" + scrollFunc());
	        gsap.set([markerStart, markerEnd], cs);
	      }
	      if (pin) {
	        cs = _getComputedStyle(pin);
	        isVertical = direction === _vertical;
	        scroll = scrollFunc(); // recalculate because the triggers can affect the scroll

	        pinStart = parseFloat(pinGetter(direction.a)) + otherPinOffset;
	        if (!max && end > 1) {
	          // makes sure the scroller has a scrollbar, otherwise if something has width: 100%, for example, it would be too big (exclude the scrollbar). See https://greensock.com/forums/topic/25182-scrolltrigger-width-of-page-increase-where-markers-are-set-to-false/
	          forcedOverflow = (isViewport ? _doc.scrollingElement || _docEl : scroller).style;
	          forcedOverflow = {
	            style: forcedOverflow,
	            value: forcedOverflow["overflow" + direction.a.toUpperCase()]
	          };
	          forcedOverflow["overflow" + direction.a.toUpperCase()] = "scroll";
	        }
	        _swapPinIn(pin, spacer, cs);
	        pinState = _getState(pin); // transforms will interfere with the top/left/right/bottom placement, so remove them temporarily. getBoundingClientRect() factors in transforms.

	        bounds = _getBounds(pin, true);
	        oppositeScroll = useFixedPosition && _getScrollFunc(scroller, isVertical ? _horizontal : _vertical)();
	        if (pinSpacing) {
	          spacerState = [pinSpacing + direction.os2, change + otherPinOffset + _px];
	          spacerState.t = spacer;
	          i = pinSpacing === _padding ? _getSize(pin, direction) + change + otherPinOffset : 0;
	          i && spacerState.push(direction.d, i + _px); // for box-sizing: border-box (must include padding).

	          _setState(spacerState);
	          if (pinnedContainer) {
	            // in ScrollTrigger.refresh(), we need to re-evaluate the pinContainer's size because this pinSpacing may stretch it out, but we can't just add the exact distance because depending on layout, it may not push things down or it may only do so partially.
	            _triggers.forEach(function (t) {
	              if (t.pin === pinnedContainer && t.vars.pinSpacing !== false) {
	                t._subPinOffset = true;
	              }
	            });
	          }
	          useFixedPosition && scrollFunc(prevScroll);
	        }
	        if (useFixedPosition) {
	          override = {
	            top: bounds.top + (isVertical ? scroll - start : oppositeScroll) + _px,
	            left: bounds.left + (isVertical ? oppositeScroll : scroll - start) + _px,
	            boxSizing: "border-box",
	            position: "fixed"
	          };
	          override[_width] = override["max" + _Width] = Math.ceil(bounds.width) + _px;
	          override[_height] = override["max" + _Height] = Math.ceil(bounds.height) + _px;
	          override[_margin] = override[_margin + _Top] = override[_margin + _Right] = override[_margin + _Bottom] = override[_margin + _Left] = "0";
	          override[_padding] = cs[_padding];
	          override[_padding + _Top] = cs[_padding + _Top];
	          override[_padding + _Right] = cs[_padding + _Right];
	          override[_padding + _Bottom] = cs[_padding + _Bottom];
	          override[_padding + _Left] = cs[_padding + _Left];
	          pinActiveState = _copyState(pinOriginalState, override, pinReparent);
	          _refreshingAll && scrollFunc(0);
	        }
	        if (animation) {
	          // the animation might be affecting the transform, so we must jump to the end, check the value, and compensate accordingly. Otherwise, when it becomes unpinned, the pinSetter() will get set to a value that doesn't include whatever the animation did.
	          initted = animation._initted; // if not, we must invalidate() after this step, otherwise it could lock in starting values prematurely.

	          _suppressOverwrites(1);
	          animation.render(animation.duration(), true, true);
	          pinChange = pinGetter(direction.a) - pinStart + change + otherPinOffset;
	          pinMoves = Math.abs(change - pinChange) > 1;
	          useFixedPosition && pinMoves && pinActiveState.splice(pinActiveState.length - 2, 2); // transform is the last property/value set in the state Array. Since the animation is controlling that, we should omit it.

	          animation.render(0, true, true);
	          initted || animation.invalidate(true);
	          animation.parent || animation.totalTime(animation.totalTime()); // if, for example, a toggleAction called play() and then refresh() happens and when we render(1) above, it would cause the animation to complete and get removed from its parent, so this makes sure it gets put back in.

	          _suppressOverwrites(0);
	        } else {
	          pinChange = change;
	        }
	        forcedOverflow && (forcedOverflow.value ? forcedOverflow.style["overflow" + direction.a.toUpperCase()] = forcedOverflow.value : forcedOverflow.style.removeProperty("overflow-" + direction.a));
	      } else if (trigger && scrollFunc() && !containerAnimation) {
	        // it may be INSIDE a pinned element, so walk up the tree and look for any elements with _pinOffset to compensate because anything with pinSpacing that's already scrolled would throw off the measurements in getBoundingClientRect()
	        bounds = trigger.parentNode;
	        while (bounds && bounds !== _body) {
	          if (bounds._pinOffset) {
	            start -= bounds._pinOffset;
	            end -= bounds._pinOffset;
	          }
	          bounds = bounds.parentNode;
	        }
	      }
	      revertedPins && revertedPins.forEach(function (t) {
	        return t.revert(false, true);
	      });
	      self.start = start;
	      self.end = end;
	      scroll1 = scroll2 = _refreshingAll ? prevScroll : scrollFunc(); // reset velocity

	      if (!containerAnimation && !_refreshingAll) {
	        scroll1 < prevScroll && scrollFunc(prevScroll);
	        self.scroll.rec = 0;
	      }
	      self.revert(false, true);
	      if (snapDelayedCall) {
	        lastSnap = -1;
	        self.isActive && scrollFunc(start + change * prevProgress); // just so snapping gets re-enabled, clear out any recorded last value

	        snapDelayedCall.restart(true);
	      }
	      _refreshing = 0;
	      animation && isToggle && (animation._initted || prevAnimProgress) && animation.progress() !== prevAnimProgress && animation.progress(prevAnimProgress, true).render(animation.time(), true, true); // must force a re-render because if saveStyles() was used on the target(s), the styles could have been wiped out during the refresh().

	      if (prevProgress !== self.progress || containerAnimation) {
	        // ensures that the direction is set properly (when refreshing, progress is set back to 0 initially, then back again to wherever it needs to be) and that callbacks are triggered.
	        animation && !isToggle && animation.totalProgress(prevProgress, true); // to avoid issues where animation callbacks like onStart aren't triggered.

	        self.progress = (scroll1 - start) / change === prevProgress ? 0 : prevProgress;
	      }
	      pin && pinSpacing && (spacer._pinOffset = Math.round(self.progress * pinChange)); //			scrubTween && scrubTween.invalidate();

	      onRefresh && !_refreshingAll && onRefresh(self); // when refreshing all, we do extra work to correct pinnedContainer sizes and ensure things don't exceed the maxScroll, so we should do all the refreshes at the end after all that work so that the start/end values are corrected.
	    };
	    self.getVelocity = function () {
	      return (scrollFunc() - scroll2) / (_getTime() - _time2) * 1000 || 0;
	    };
	    self.endAnimation = function () {
	      _endAnimation(self.callbackAnimation);
	      if (animation) {
	        scrubTween ? scrubTween.progress(1) : !animation.paused() ? _endAnimation(animation, animation.reversed()) : isToggle || _endAnimation(animation, self.direction < 0, 1);
	      }
	    };
	    self.labelToScroll = function (label) {
	      return animation && animation.labels && (start || self.refresh() || start) + animation.labels[label] / animation.duration() * change || 0;
	    };
	    self.getTrailing = function (name) {
	      var i = _triggers.indexOf(self),
	        a = self.direction > 0 ? _triggers.slice(0, i).reverse() : _triggers.slice(i + 1);
	      return (_isString(name) ? a.filter(function (t) {
	        return t.vars.preventOverlaps === name;
	      }) : a).filter(function (t) {
	        return self.direction > 0 ? t.end <= start : t.start >= end;
	      });
	    };
	    self.update = function (reset, recordVelocity, forceFake) {
	      if (containerAnimation && !forceFake && !reset) {
	        return;
	      }
	      var scroll = _refreshingAll ? prevScroll : self.scroll(),
	        p = reset ? 0 : (scroll - start) / change,
	        clipped = p < 0 ? 0 : p > 1 ? 1 : p || 0,
	        prevProgress = self.progress,
	        isActive,
	        wasActive,
	        toggleState,
	        action,
	        stateChanged,
	        toggled,
	        isAtMax,
	        isTakingAction;
	      if (recordVelocity) {
	        scroll2 = scroll1;
	        scroll1 = containerAnimation ? scrollFunc() : scroll;
	        if (snap) {
	          snap2 = snap1;
	          snap1 = animation && !isToggle ? animation.totalProgress() : clipped;
	        }
	      } // anticipate the pinning a few ticks ahead of time based on velocity to avoid a visual glitch due to the fact that most browsers do scrolling on a separate thread (not synced with requestAnimationFrame).

	      anticipatePin && !clipped && pin && !_refreshing && !_startup && _lastScrollTime && start < scroll + (scroll - scroll2) / (_getTime() - _time2) * anticipatePin && (clipped = 0.0001);
	      if (clipped !== prevProgress && self.enabled) {
	        isActive = self.isActive = !!clipped && clipped < 1;
	        wasActive = !!prevProgress && prevProgress < 1;
	        toggled = isActive !== wasActive;
	        stateChanged = toggled || !!clipped !== !!prevProgress; // could go from start all the way to end, thus it didn't toggle but it did change state in a sense (may need to fire a callback)

	        self.direction = clipped > prevProgress ? 1 : -1;
	        self.progress = clipped;
	        if (stateChanged && !_refreshing) {
	          toggleState = clipped && !prevProgress ? 0 : clipped === 1 ? 1 : prevProgress === 1 ? 2 : 3; // 0 = enter, 1 = leave, 2 = enterBack, 3 = leaveBack (we prioritize the FIRST encounter, thus if you scroll really fast past the onEnter and onLeave in one tick, it'd prioritize onEnter.

	          if (isToggle) {
	            action = !toggled && toggleActions[toggleState + 1] !== "none" && toggleActions[toggleState + 1] || toggleActions[toggleState]; // if it didn't toggle, that means it shot right past and since we prioritize the "enter" action, we should switch to the "leave" in this case (but only if one is defined)

	            isTakingAction = animation && (action === "complete" || action === "reset" || action in animation);
	          }
	        }
	        preventOverlaps && (toggled || isTakingAction) && (isTakingAction || scrub || !animation) && (_isFunction(preventOverlaps) ? preventOverlaps(self) : self.getTrailing(preventOverlaps).forEach(function (t) {
	          return t.endAnimation();
	        }));
	        if (!isToggle) {
	          if (scrubTween && !_refreshing && !_startup) {
	            scrubTween._dp._time - scrubTween._start !== scrubTween._time && scrubTween.render(scrubTween._dp._time - scrubTween._start); // if there's a scrub on both the container animation and this one (or a ScrollSmoother), the update order would cause this one not to have rendered yet, so it wouldn't make any progress before we .restart() it heading toward the new progress so it'd appear stuck thus we force a render here.

	            if (scrubTween.resetTo) {
	              scrubTween.resetTo("totalProgress", clipped, animation._tTime / animation._tDur);
	            } else {
	              // legacy support (courtesy), before 3.10.0
	              scrubTween.vars.totalProgress = clipped;
	              scrubTween.invalidate().restart();
	            }
	          } else if (animation) {
	            animation.totalProgress(clipped, !!_refreshing);
	          }
	        }
	        if (pin) {
	          reset && pinSpacing && (spacer.style[pinSpacing + direction.os2] = spacingStart);
	          if (!useFixedPosition) {
	            pinSetter(_round(pinStart + pinChange * clipped));
	          } else if (stateChanged) {
	            isAtMax = !reset && clipped > prevProgress && end + 1 > scroll && scroll + 1 >= _maxScroll(scroller, direction); // if it's at the VERY end of the page, don't switch away from position: fixed because it's pointless and it could cause a brief flash when the user scrolls back up (when it gets pinned again)

	            if (pinReparent) {
	              if (!reset && (isActive || isAtMax)) {
	                var bounds = _getBounds(pin, true),
	                  _offset = scroll - start;
	                _reparent(pin, _body, bounds.top + (direction === _vertical ? _offset : 0) + _px, bounds.left + (direction === _vertical ? 0 : _offset) + _px);
	              } else {
	                _reparent(pin, spacer);
	              }
	            }
	            _setState(isActive || isAtMax ? pinActiveState : pinState);
	            pinMoves && clipped < 1 && isActive || pinSetter(pinStart + (clipped === 1 && !isAtMax ? pinChange : 0));
	          }
	        }
	        snap && !tweenTo.tween && !_refreshing && !_startup && snapDelayedCall.restart(true);
	        toggleClass && (toggled || once && clipped && (clipped < 1 || !_limitCallbacks)) && _toArray(toggleClass.targets).forEach(function (el) {
	          return el.classList[isActive || once ? "add" : "remove"](toggleClass.className);
	        }); // classes could affect positioning, so do it even if reset or refreshing is true.

	        onUpdate && !isToggle && !reset && onUpdate(self);
	        if (stateChanged && !_refreshing) {
	          if (isToggle) {
	            if (isTakingAction) {
	              if (action === "complete") {
	                animation.pause().totalProgress(1);
	              } else if (action === "reset") {
	                animation.restart(true).pause();
	              } else if (action === "restart") {
	                animation.restart(true);
	              } else {
	                animation[action]();
	              }
	            }
	            onUpdate && onUpdate(self);
	          }
	          if (toggled || !_limitCallbacks) {
	            // on startup, the page could be scrolled and we don't want to fire callbacks that didn't toggle. For example onEnter shouldn't fire if the ScrollTrigger isn't actually entered.
	            onToggle && toggled && _callback(self, onToggle);
	            callbacks[toggleState] && _callback(self, callbacks[toggleState]);
	            once && (clipped === 1 ? self.kill(false, 1) : callbacks[toggleState] = 0); // a callback shouldn't be called again if once is true.

	            if (!toggled) {
	              // it's possible to go completely past, like from before the start to after the end (or vice-versa) in which case BOTH callbacks should be fired in that order
	              toggleState = clipped === 1 ? 1 : 3;
	              callbacks[toggleState] && _callback(self, callbacks[toggleState]);
	            }
	          }
	          if (fastScrollEnd && !isActive && Math.abs(self.getVelocity()) > (_isNumber(fastScrollEnd) ? fastScrollEnd : 2500)) {
	            _endAnimation(self.callbackAnimation);
	            scrubTween ? scrubTween.progress(1) : _endAnimation(animation, action === "reverse" ? 1 : !clipped, 1);
	          }
	        } else if (isToggle && onUpdate && !_refreshing) {
	          onUpdate(self);
	        }
	      } // update absolutely-positioned markers (only if the scroller isn't the viewport)

	      if (markerEndSetter) {
	        var n = containerAnimation ? scroll / containerAnimation.duration() * (containerAnimation._caScrollDist || 0) : scroll;
	        markerStartSetter(n + (markerStartTrigger._isFlipped ? 1 : 0));
	        markerEndSetter(n);
	      }
	      caMarkerSetter && caMarkerSetter(-scroll / containerAnimation.duration() * (containerAnimation._caScrollDist || 0));
	    };
	    self.enable = function (reset, refresh) {
	      if (!self.enabled) {
	        self.enabled = true;
	        _addListener(scroller, "resize", _onResize);
	        _addListener(isViewport ? _doc : scroller, "scroll", _onScroll);
	        onRefreshInit && _addListener(ScrollTrigger, "refreshInit", onRefreshInit);
	        if (reset !== false) {
	          self.progress = prevProgress = 0;
	          scroll1 = scroll2 = lastSnap = scrollFunc();
	        }
	        refresh !== false && self.refresh();
	      }
	    };
	    self.getTween = function (snap) {
	      return snap && tweenTo ? tweenTo.tween : scrubTween;
	    };
	    self.setPositions = function (newStart, newEnd) {
	      // doesn't persist after refresh()! Intended to be a way to override values that were set during refresh(), like you could set it in onRefresh()
	      if (pin) {
	        pinStart += newStart - start;
	        pinChange += newEnd - newStart - change;
	        pinSpacing === _padding && self.adjustPinSpacing(newEnd - newStart - change);
	      }
	      self.start = start = newStart;
	      self.end = end = newEnd;
	      change = newEnd - newStart;
	      self.update();
	    };
	    self.adjustPinSpacing = function (amount) {
	      if (spacerState) {
	        var i = spacerState.indexOf(direction.d) + 1;
	        spacerState[i] = parseFloat(spacerState[i]) + amount + _px;
	        spacerState[1] = parseFloat(spacerState[1]) + amount + _px;
	        _setState(spacerState);
	      }
	    };
	    self.disable = function (reset, allowAnimation) {
	      if (self.enabled) {
	        reset !== false && self.revert(true, true);
	        self.enabled = self.isActive = false;
	        allowAnimation || scrubTween && scrubTween.pause();
	        prevScroll = 0;
	        pinCache && (pinCache.uncache = 1);
	        onRefreshInit && _removeListener(ScrollTrigger, "refreshInit", onRefreshInit);
	        if (snapDelayedCall) {
	          snapDelayedCall.pause();
	          tweenTo.tween && tweenTo.tween.kill() && (tweenTo.tween = 0);
	        }
	        if (!isViewport) {
	          var i = _triggers.length;
	          while (i--) {
	            if (_triggers[i].scroller === scroller && _triggers[i] !== self) {
	              return; //don't remove the listeners if there are still other triggers referencing it.
	            }
	          }
	          _removeListener(scroller, "resize", _onResize);
	          _removeListener(scroller, "scroll", _onScroll);
	        }
	      }
	    };
	    self.kill = function (revert, allowAnimation) {
	      self.disable(revert, allowAnimation);
	      scrubTween && !allowAnimation && scrubTween.kill();
	      id && delete _ids[id];
	      var i = _triggers.indexOf(self);
	      i >= 0 && _triggers.splice(i, 1);
	      i === _i && _direction > 0 && _i--; // if we're in the middle of a refresh() or update(), splicing would cause skips in the index, so adjust...
	      // if no other ScrollTrigger instances of the same scroller are found, wipe out any recorded scroll position. Otherwise, in a single page application, for example, it could maintain scroll position when it really shouldn't.

	      i = 0;
	      _triggers.forEach(function (t) {
	        return t.scroller === self.scroller && (i = 1);
	      });
	      i || _refreshingAll || (self.scroll.rec = 0);
	      if (animation) {
	        animation.scrollTrigger = null;
	        revert && animation.revert({
	          kill: false
	        });
	        allowAnimation || animation.kill();
	      }
	      markerStart && [markerStart, markerEnd, markerStartTrigger, markerEndTrigger].forEach(function (m) {
	        return m.parentNode && m.parentNode.removeChild(m);
	      });
	      _primary === self && (_primary = 0);
	      if (pin) {
	        pinCache && (pinCache.uncache = 1);
	        i = 0;
	        _triggers.forEach(function (t) {
	          return t.pin === pin && i++;
	        });
	        i || (pinCache.spacer = 0); // if there aren't any more ScrollTriggers with the same pin, remove the spacer, otherwise it could be contaminated with old/stale values if the user re-creates a ScrollTrigger for the same element.
	      }
	      vars.onKill && vars.onKill(self);
	    };
	    self.enable(false, false);
	    customRevertReturn && customRevertReturn(self);
	    !animation || !animation.add || change ? self.refresh() : gsap.delayedCall(0.01, function () {
	      return start || end || self.refresh();
	    }) && (change = 0.01) && (start = end = 0); // if the animation is a timeline, it may not have been populated yet, so it wouldn't render at the proper place on the first refresh(), thus we should schedule one for the next tick. If "change" is defined, we know it must be re-enabling, thus we can refresh() right away.

	    pin && _queueRefreshAll(); // pinning could affect the positions of other things, so make sure we queue a full refresh()
	  };
	  ScrollTrigger.register = function register(core) {
	    if (!_coreInitted) {
	      gsap = core || _getGSAP();
	      _windowExists() && window.document && ScrollTrigger.enable();
	      _coreInitted = _enabled;
	    }
	    return _coreInitted;
	  };
	  ScrollTrigger.defaults = function defaults(config) {
	    if (config) {
	      for (var p in config) {
	        _defaults[p] = config[p];
	      }
	    }
	    return _defaults;
	  };
	  ScrollTrigger.disable = function disable(reset, kill) {
	    _enabled = 0;
	    _triggers.forEach(function (trigger) {
	      return trigger[kill ? "kill" : "disable"](reset);
	    });
	    _removeListener(_win, "wheel", _onScroll);
	    _removeListener(_doc, "scroll", _onScroll);
	    clearInterval(_syncInterval);
	    _removeListener(_doc, "touchcancel", _passThrough);
	    _removeListener(_body, "touchstart", _passThrough);
	    _multiListener(_removeListener, _doc, "pointerdown,touchstart,mousedown", _pointerDownHandler);
	    _multiListener(_removeListener, _doc, "pointerup,touchend,mouseup", _pointerUpHandler);
	    _resizeDelay.kill();
	    _iterateAutoRefresh(_removeListener);
	    for (var i = 0; i < _scrollers.length; i += 3) {
	      _wheelListener(_removeListener, _scrollers[i], _scrollers[i + 1]);
	      _wheelListener(_removeListener, _scrollers[i], _scrollers[i + 2]);
	    }
	  };
	  ScrollTrigger.enable = function enable() {
	    _win = window;
	    _doc = document;
	    _docEl = _doc.documentElement;
	    _body = _doc.body;
	    if (gsap) {
	      _toArray = gsap.utils.toArray;
	      _clamp = gsap.utils.clamp;
	      _context = gsap.core.context || _passThrough;
	      _suppressOverwrites = gsap.core.suppressOverwrites || _passThrough;
	      _scrollRestoration = _win.history.scrollRestoration || "auto";
	      gsap.core.globals("ScrollTrigger", ScrollTrigger); // must register the global manually because in Internet Explorer, functions (classes) don't have a "name" property.

	      if (_body) {
	        _enabled = 1;
	        Observer.register(gsap); // isTouch is 0 if no touch, 1 if ONLY touch, and 2 if it can accommodate touch but also other types like mouse/pointer.

	        ScrollTrigger.isTouch = Observer.isTouch;
	        _fixIOSBug = Observer.isTouch && /(iPad|iPhone|iPod|Mac)/g.test(navigator.userAgent); // since 2017, iOS has had a bug that causes event.clientX/Y to be inaccurate when a scroll occurs, thus we must alternate ignoring every other touchmove event to work around it. See https://bugs.webkit.org/show_bug.cgi?id=181954 and https://codepen.io/GreenSock/pen/ExbrPNa/087cef197dc35445a0951e8935c41503

	        _addListener(_win, "wheel", _onScroll); // mostly for 3rd party smooth scrolling libraries.

	        _root = [_win, _doc, _docEl, _body];
	        if (gsap.matchMedia) {
	          ScrollTrigger.matchMedia = function (vars) {
	            var mm = gsap.matchMedia(),
	              p;
	            for (p in vars) {
	              mm.add(p, vars[p]);
	            }
	            return mm;
	          };
	          gsap.addEventListener("matchMediaInit", function () {
	            return _revertAll();
	          });
	          gsap.addEventListener("matchMediaRevert", function () {
	            return _revertRecorded();
	          });
	          gsap.addEventListener("matchMedia", function () {
	            _refreshAll(0, 1);
	            _dispatch("matchMedia");
	          });
	          gsap.matchMedia("(orientation: portrait)", function () {
	            // when orientation changes, we should take new base measurements for the ignoreMobileResize feature.
	            _setBaseDimensions();
	            return _setBaseDimensions;
	          });
	        } else {
	          console.warn("Requires GSAP 3.11.0 or later");
	        }
	        _setBaseDimensions();
	        _addListener(_doc, "scroll", _onScroll); // some browsers (like Chrome), the window stops dispatching scroll events on the window if you scroll really fast, but it's consistent on the document!

	        var bodyStyle = _body.style,
	          border = bodyStyle.borderTopStyle,
	          AnimationProto = gsap.core.Animation.prototype,
	          bounds,
	          i;
	        AnimationProto.revert || Object.defineProperty(AnimationProto, "revert", {
	          value: function value() {
	            return this.time(-0.01, true);
	          }
	        }); // only for backwards compatibility (Animation.revert() was added after 3.10.4)

	        bodyStyle.borderTopStyle = "solid"; // works around an issue where a margin of a child element could throw off the bounds of the _body, making it seem like there's a margin when there actually isn't. The border ensures that the bounds are accurate.

	        bounds = _getBounds(_body);
	        _vertical.m = Math.round(bounds.top + _vertical.sc()) || 0; // accommodate the offset of the <body> caused by margins and/or padding

	        _horizontal.m = Math.round(bounds.left + _horizontal.sc()) || 0;
	        border ? bodyStyle.borderTopStyle = border : bodyStyle.removeProperty("border-top-style"); // TODO: (?) maybe move to leveraging the velocity mechanism in Observer and skip intervals.

	        _syncInterval = setInterval(_sync, 250);
	        gsap.delayedCall(0.5, function () {
	          return _startup = 0;
	        });
	        _addListener(_doc, "touchcancel", _passThrough); // some older Android devices intermittently stop dispatching "touchmove" events if we don't listen for "touchcancel" on the document.

	        _addListener(_body, "touchstart", _passThrough); //works around Safari bug: https://greensock.com/forums/topic/21450-draggable-in-iframe-on-mobile-is-buggy/

	        _multiListener(_addListener, _doc, "pointerdown,touchstart,mousedown", _pointerDownHandler);
	        _multiListener(_addListener, _doc, "pointerup,touchend,mouseup", _pointerUpHandler);
	        _transformProp = gsap.utils.checkPrefix("transform");
	        _stateProps.push(_transformProp);
	        _coreInitted = _getTime();
	        _resizeDelay = gsap.delayedCall(0.2, _refreshAll).pause();
	        _autoRefresh = [_doc, "visibilitychange", function () {
	          var w = _win.innerWidth,
	            h = _win.innerHeight;
	          if (_doc.hidden) {
	            _prevWidth = w;
	            _prevHeight = h;
	          } else if (_prevWidth !== w || _prevHeight !== h) {
	            _onResize();
	          }
	        }, _doc, "DOMContentLoaded", _refreshAll, _win, "load", _refreshAll, _win, "resize", _onResize];
	        _iterateAutoRefresh(_addListener);
	        _triggers.forEach(function (trigger) {
	          return trigger.enable(0, 1);
	        });
	        for (i = 0; i < _scrollers.length; i += 3) {
	          _wheelListener(_removeListener, _scrollers[i], _scrollers[i + 1]);
	          _wheelListener(_removeListener, _scrollers[i], _scrollers[i + 2]);
	        }
	      }
	    }
	  };
	  ScrollTrigger.config = function config(vars) {
	    "limitCallbacks" in vars && (_limitCallbacks = !!vars.limitCallbacks);
	    var ms = vars.syncInterval;
	    ms && clearInterval(_syncInterval) || (_syncInterval = ms) && setInterval(_sync, ms);
	    "ignoreMobileResize" in vars && (_ignoreMobileResize = ScrollTrigger.isTouch === 1 && vars.ignoreMobileResize);
	    if ("autoRefreshEvents" in vars) {
	      _iterateAutoRefresh(_removeListener) || _iterateAutoRefresh(_addListener, vars.autoRefreshEvents || "none");
	      _ignoreResize = (vars.autoRefreshEvents + "").indexOf("resize") === -1;
	    }
	  };
	  ScrollTrigger.scrollerProxy = function scrollerProxy(target, vars) {
	    var t = _getTarget(target),
	      i = _scrollers.indexOf(t),
	      isViewport = _isViewport(t);
	    if (~i) {
	      _scrollers.splice(i, isViewport ? 6 : 2);
	    }
	    if (vars) {
	      isViewport ? _proxies.unshift(_win, vars, _body, vars, _docEl, vars) : _proxies.unshift(t, vars);
	    }
	  };
	  ScrollTrigger.clearMatchMedia = function clearMatchMedia(query) {
	    _triggers.forEach(function (t) {
	      return t._ctx && t._ctx.query === query && t._ctx.kill(true, true);
	    });
	  };
	  ScrollTrigger.isInViewport = function isInViewport(element, ratio, horizontal) {
	    var bounds = (_isString(element) ? _getTarget(element) : element).getBoundingClientRect(),
	      offset = bounds[horizontal ? _width : _height] * ratio || 0;
	    return horizontal ? bounds.right - offset > 0 && bounds.left + offset < _win.innerWidth : bounds.bottom - offset > 0 && bounds.top + offset < _win.innerHeight;
	  };
	  ScrollTrigger.positionInViewport = function positionInViewport(element, referencePoint, horizontal) {
	    _isString(element) && (element = _getTarget(element));
	    var bounds = element.getBoundingClientRect(),
	      size = bounds[horizontal ? _width : _height],
	      offset = referencePoint == null ? size / 2 : referencePoint in _keywords ? _keywords[referencePoint] * size : ~referencePoint.indexOf("%") ? parseFloat(referencePoint) * size / 100 : parseFloat(referencePoint) || 0;
	    return horizontal ? (bounds.left + offset) / _win.innerWidth : (bounds.top + offset) / _win.innerHeight;
	  };
	  ScrollTrigger.killAll = function killAll(allowListeners) {
	    _triggers.slice(0).forEach(function (t) {
	      return t.vars.id !== "ScrollSmoother" && t.kill();
	    });
	    if (allowListeners !== true) {
	      var listeners = _listeners.killAll || [];
	      _listeners = {};
	      listeners.forEach(function (f) {
	        return f();
	      });
	    }
	  };
	  return ScrollTrigger;
	}();
	ScrollTrigger.version = "3.11.4";
	ScrollTrigger.saveStyles = function (targets) {
	  return targets ? _toArray(targets).forEach(function (target) {
	    // saved styles are recorded in a consecutive alternating Array, like [element, cssText, transform attribute, cache, matchMedia, ...]
	    if (target && target.style) {
	      var i = _savedStyles.indexOf(target);
	      i >= 0 && _savedStyles.splice(i, 5);
	      _savedStyles.push(target, target.style.cssText, target.getBBox && target.getAttribute("transform"), gsap.core.getCache(target), _context());
	    }
	  }) : _savedStyles;
	};
	ScrollTrigger.revert = function (soft, media) {
	  return _revertAll(!soft, media);
	};
	ScrollTrigger.create = function (vars, animation) {
	  return new ScrollTrigger(vars, animation);
	};
	ScrollTrigger.refresh = function (safe) {
	  return safe ? _onResize() : (_coreInitted || ScrollTrigger.register()) && _refreshAll(true);
	};
	ScrollTrigger.update = function (force) {
	  return ++_scrollers.cache && _updateAll(force === true ? 2 : 0);
	};
	ScrollTrigger.clearScrollMemory = _clearScrollMemory;
	ScrollTrigger.maxScroll = function (element, horizontal) {
	  return _maxScroll(element, horizontal ? _horizontal : _vertical);
	};
	ScrollTrigger.getScrollFunc = function (element, horizontal) {
	  return _getScrollFunc(_getTarget(element), horizontal ? _horizontal : _vertical);
	};
	ScrollTrigger.getById = function (id) {
	  return _ids[id];
	};
	ScrollTrigger.getAll = function () {
	  return _triggers.filter(function (t) {
	    return t.vars.id !== "ScrollSmoother";
	  });
	}; // it's common for people to ScrollTrigger.getAll(t => t.kill()) on page routes, for example, and we don't want it to ruin smooth scrolling by killing the main ScrollSmoother one.

	ScrollTrigger.isScrolling = function () {
	  return !!_lastScrollTime;
	};
	ScrollTrigger.snapDirectional = _snapDirectional;
	ScrollTrigger.addEventListener = function (type, callback) {
	  var a = _listeners[type] || (_listeners[type] = []);
	  ~a.indexOf(callback) || a.push(callback);
	};
	ScrollTrigger.removeEventListener = function (type, callback) {
	  var a = _listeners[type],
	    i = a && a.indexOf(callback);
	  i >= 0 && a.splice(i, 1);
	};
	ScrollTrigger.batch = function (targets, vars) {
	  var result = [],
	    varsCopy = {},
	    interval = vars.interval || 0.016,
	    batchMax = vars.batchMax || 1e9,
	    proxyCallback = function proxyCallback(type, callback) {
	      var elements = [],
	        triggers = [],
	        delay = gsap.delayedCall(interval, function () {
	          callback(elements, triggers);
	          elements = [];
	          triggers = [];
	        }).pause();
	      return function (self) {
	        elements.length || delay.restart(true);
	        elements.push(self.trigger);
	        triggers.push(self);
	        batchMax <= elements.length && delay.progress(1);
	      };
	    },
	    p;
	  for (p in vars) {
	    varsCopy[p] = p.substr(0, 2) === "on" && _isFunction(vars[p]) && p !== "onRefreshInit" ? proxyCallback(p, vars[p]) : vars[p];
	  }
	  if (_isFunction(batchMax)) {
	    batchMax = batchMax();
	    _addListener(ScrollTrigger, "refresh", function () {
	      return batchMax = vars.batchMax();
	    });
	  }
	  _toArray(targets).forEach(function (target) {
	    var config = {};
	    for (p in varsCopy) {
	      config[p] = varsCopy[p];
	    }
	    config.trigger = target;
	    result.push(ScrollTrigger.create(config));
	  });
	  return result;
	}; // to reduce file size. clamps the scroll and also returns a duration multiplier so that if the scroll gets chopped shorter, the duration gets curtailed as well (otherwise if you're very close to the top of the page, for example, and swipe up really fast, it'll suddenly slow down and take a long time to reach the top).

	var _clampScrollAndGetDurationMultiplier = function _clampScrollAndGetDurationMultiplier(scrollFunc, current, end, max) {
	    current > max ? scrollFunc(max) : current < 0 && scrollFunc(0);
	    return end > max ? (max - current) / (end - current) : end < 0 ? current / (current - end) : 1;
	  },
	  _allowNativePanning = function _allowNativePanning(target, direction) {
	    if (direction === true) {
	      target.style.removeProperty("touch-action");
	    } else {
	      target.style.touchAction = direction === true ? "auto" : direction ? "pan-" + direction + (Observer.isTouch ? " pinch-zoom" : "") : "none"; // note: Firefox doesn't support it pinch-zoom properly, at least in addition to a pan-x or pan-y.
	    }
	    target === _docEl && _allowNativePanning(_body, direction);
	  },
	  _overflow = {
	    auto: 1,
	    scroll: 1
	  },
	  _nestedScroll = function _nestedScroll(_ref5) {
	    var event = _ref5.event,
	      target = _ref5.target,
	      axis = _ref5.axis;
	    var node = (event.changedTouches ? event.changedTouches[0] : event).target,
	      cache = node._gsap || gsap.core.getCache(node),
	      time = _getTime(),
	      cs;
	    if (!cache._isScrollT || time - cache._isScrollT > 2000) {
	      // cache for 2 seconds to improve performance.
	      while (node && node !== _body && (node.scrollHeight <= node.clientHeight && node.scrollWidth <= node.clientWidth || !(_overflow[(cs = _getComputedStyle(node)).overflowY] || _overflow[cs.overflowX]))) {
	        node = node.parentNode;
	      }
	      cache._isScroll = node && node !== target && !_isViewport(node) && (_overflow[(cs = _getComputedStyle(node)).overflowY] || _overflow[cs.overflowX]);
	      cache._isScrollT = time;
	    }
	    if (cache._isScroll || axis === "x") {
	      event.stopPropagation();
	      event._gsapAllow = true;
	    }
	  },
	  // capture events on scrollable elements INSIDE the <body> and allow those by calling stopPropagation() when we find a scrollable ancestor
	  _inputObserver = function _inputObserver(target, type, inputs, nested) {
	    return Observer.create({
	      target: target,
	      capture: true,
	      debounce: false,
	      lockAxis: true,
	      type: type,
	      onWheel: nested = nested && _nestedScroll,
	      onPress: nested,
	      onDrag: nested,
	      onScroll: nested,
	      onEnable: function onEnable() {
	        return inputs && _addListener(_doc, Observer.eventTypes[0], _captureInputs, false, true);
	      },
	      onDisable: function onDisable() {
	        return _removeListener(_doc, Observer.eventTypes[0], _captureInputs, true);
	      }
	    });
	  },
	  _inputExp = /(input|label|select|textarea)/i,
	  _inputIsFocused,
	  _captureInputs = function _captureInputs(e) {
	    var isInput = _inputExp.test(e.target.tagName);
	    if (isInput || _inputIsFocused) {
	      e._gsapAllow = true;
	      _inputIsFocused = isInput;
	    }
	  },
	  _getScrollNormalizer = function _getScrollNormalizer(vars) {
	    _isObject(vars) || (vars = {});
	    vars.preventDefault = vars.isNormalizer = vars.allowClicks = true;
	    vars.type || (vars.type = "wheel,touch");
	    vars.debounce = !!vars.debounce;
	    vars.id = vars.id || "normalizer";
	    var _vars2 = vars,
	      normalizeScrollX = _vars2.normalizeScrollX,
	      momentum = _vars2.momentum,
	      allowNestedScroll = _vars2.allowNestedScroll,
	      self,
	      maxY,
	      target = _getTarget(vars.target) || _docEl,
	      smoother = gsap.core.globals().ScrollSmoother,
	      smootherInstance = smoother && smoother.get(),
	      content = _fixIOSBug && (vars.content && _getTarget(vars.content) || smootherInstance && vars.content !== false && !smootherInstance.smooth() && smootherInstance.content()),
	      scrollFuncY = _getScrollFunc(target, _vertical),
	      scrollFuncX = _getScrollFunc(target, _horizontal),
	      scale = 1,
	      initialScale = (Observer.isTouch && _win.visualViewport ? _win.visualViewport.scale * _win.visualViewport.width : _win.outerWidth) / _win.innerWidth,
	      wheelRefresh = 0,
	      resolveMomentumDuration = _isFunction(momentum) ? function () {
	        return momentum(self);
	      } : function () {
	        return momentum || 2.8;
	      },
	      lastRefreshID,
	      skipTouchMove,
	      inputObserver = _inputObserver(target, vars.type, true, allowNestedScroll),
	      resumeTouchMove = function resumeTouchMove() {
	        return skipTouchMove = false;
	      },
	      scrollClampX = _passThrough,
	      scrollClampY = _passThrough,
	      updateClamps = function updateClamps() {
	        maxY = _maxScroll(target, _vertical);
	        scrollClampY = _clamp(_fixIOSBug ? 1 : 0, maxY);
	        normalizeScrollX && (scrollClampX = _clamp(0, _maxScroll(target, _horizontal)));
	        lastRefreshID = _refreshID;
	      },
	      removeContentOffset = function removeContentOffset() {
	        content._gsap.y = _round(parseFloat(content._gsap.y) + scrollFuncY.offset) + "px";
	        content.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, " + parseFloat(content._gsap.y) + ", 0, 1)";
	        scrollFuncY.offset = scrollFuncY.cacheID = 0;
	      },
	      ignoreDrag = function ignoreDrag() {
	        if (skipTouchMove) {
	          requestAnimationFrame(resumeTouchMove);
	          var offset = _round(self.deltaY / 2),
	            scroll = scrollClampY(scrollFuncY.v - offset);
	          if (content && scroll !== scrollFuncY.v + scrollFuncY.offset) {
	            scrollFuncY.offset = scroll - scrollFuncY.v;
	            var y = _round((parseFloat(content && content._gsap.y) || 0) - scrollFuncY.offset);
	            content.style.transform = "matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, " + y + ", 0, 1)";
	            content._gsap.y = y + "px";
	            scrollFuncY.cacheID = _scrollers.cache;
	            _updateAll();
	          }
	          return true;
	        }
	        scrollFuncY.offset && removeContentOffset();
	        skipTouchMove = true;
	      },
	      tween,
	      startScrollX,
	      startScrollY,
	      onStopDelayedCall,
	      onResize = function onResize() {
	        // if the window resizes, like on an iPhone which Apple FORCES the address bar to show/hide even if we event.preventDefault(), it may be scrolling too far now that the address bar is showing, so we must dynamically adjust the momentum tween.
	        updateClamps();
	        if (tween.isActive() && tween.vars.scrollY > maxY) {
	          scrollFuncY() > maxY ? tween.progress(1) && scrollFuncY(maxY) : tween.resetTo("scrollY", maxY);
	        }
	      };
	    content && gsap.set(content, {
	      y: "+=0"
	    }); // to ensure there's a cache (element._gsap)

	    vars.ignoreCheck = function (e) {
	      return _fixIOSBug && e.type === "touchmove" && ignoreDrag() || scale > 1.05 && e.type !== "touchstart" || self.isGesturing || e.touches && e.touches.length > 1;
	    };
	    vars.onPress = function () {
	      var prevScale = scale;
	      scale = _round((_win.visualViewport && _win.visualViewport.scale || 1) / initialScale);
	      tween.pause();
	      prevScale !== scale && _allowNativePanning(target, scale > 1.01 ? true : normalizeScrollX ? false : "x");
	      startScrollX = scrollFuncX();
	      startScrollY = scrollFuncY();
	      updateClamps();
	      lastRefreshID = _refreshID;
	    };
	    vars.onRelease = vars.onGestureStart = function (self, wasDragging) {
	      scrollFuncY.offset && removeContentOffset();
	      if (!wasDragging) {
	        onStopDelayedCall.restart(true);
	      } else {
	        _scrollers.cache++; // make sure we're pulling the non-cached value
	        // alternate algorithm: durX = Math.min(6, Math.abs(self.velocityX / 800)),	dur = Math.max(durX, Math.min(6, Math.abs(self.velocityY / 800))); dur = dur * (0.4 + (1 - _power4In(dur / 6)) * 0.6)) * (momentumSpeed || 1)

	        var dur = resolveMomentumDuration(),
	          currentScroll,
	          endScroll;
	        if (normalizeScrollX) {
	          currentScroll = scrollFuncX();
	          endScroll = currentScroll + dur * 0.05 * -self.velocityX / 0.227; // the constant .227 is from power4(0.05). velocity is inverted because scrolling goes in the opposite direction.

	          dur *= _clampScrollAndGetDurationMultiplier(scrollFuncX, currentScroll, endScroll, _maxScroll(target, _horizontal));
	          tween.vars.scrollX = scrollClampX(endScroll);
	        }
	        currentScroll = scrollFuncY();
	        endScroll = currentScroll + dur * 0.05 * -self.velocityY / 0.227; // the constant .227 is from power4(0.05)

	        dur *= _clampScrollAndGetDurationMultiplier(scrollFuncY, currentScroll, endScroll, _maxScroll(target, _vertical));
	        tween.vars.scrollY = scrollClampY(endScroll);
	        tween.invalidate().duration(dur).play(0.01);
	        if (_fixIOSBug && tween.vars.scrollY >= maxY || currentScroll >= maxY - 1) {
	          // iOS bug: it'll show the address bar but NOT fire the window "resize" event until the animation is done but we must protect against overshoot so we leverage an onUpdate to do so.
	          gsap.to({}, {
	            onUpdate: onResize,
	            duration: dur
	          });
	        }
	      }
	    };
	    vars.onWheel = function () {
	      tween._ts && tween.pause();
	      if (_getTime() - wheelRefresh > 1000) {
	        // after 1 second, refresh the clamps otherwise that'll only happen when ScrollTrigger.refresh() is called or for touch-scrolling.
	        lastRefreshID = 0;
	        wheelRefresh = _getTime();
	      }
	    };
	    vars.onChange = function (self, dx, dy, xArray, yArray) {
	      _refreshID !== lastRefreshID && updateClamps();
	      dx && normalizeScrollX && scrollFuncX(scrollClampX(xArray[2] === dx ? startScrollX + (self.startX - self.x) : scrollFuncX() + dx - xArray[1])); // for more precision, we track pointer/touch movement from the start, otherwise it'll drift.

	      if (dy) {
	        scrollFuncY.offset && removeContentOffset();
	        var isTouch = yArray[2] === dy,
	          y = isTouch ? startScrollY + self.startY - self.y : scrollFuncY() + dy - yArray[1],
	          yClamped = scrollClampY(y);
	        isTouch && y !== yClamped && (startScrollY += yClamped - y);
	        scrollFuncY(yClamped);
	      }
	      (dy || dx) && _updateAll();
	    };
	    vars.onEnable = function () {
	      _allowNativePanning(target, normalizeScrollX ? false : "x");
	      ScrollTrigger.addEventListener("refresh", onResize);
	      _addListener(_win, "resize", onResize);
	      if (scrollFuncY.smooth) {
	        scrollFuncY.target.style.scrollBehavior = "auto";
	        scrollFuncY.smooth = scrollFuncX.smooth = false;
	      }
	      inputObserver.enable();
	    };
	    vars.onDisable = function () {
	      _allowNativePanning(target, true);
	      _removeListener(_win, "resize", onResize);
	      ScrollTrigger.removeEventListener("refresh", onResize);
	      inputObserver.kill();
	    };
	    vars.lockAxis = vars.lockAxis !== false;
	    self = new Observer(vars);
	    self.iOS = _fixIOSBug; // used in the Observer getCachedScroll() function to work around an iOS bug that wreaks havoc with TouchEvent.clientY if we allow scroll to go all the way back to 0.

	    _fixIOSBug && !scrollFuncY() && scrollFuncY(1); // iOS bug causes event.clientY values to freak out (wildly inaccurate) if the scroll position is exactly 0.

	    _fixIOSBug && gsap.ticker.add(_passThrough); // prevent the ticker from sleeping

	    onStopDelayedCall = self._dc;
	    tween = gsap.to(self, {
	      ease: "power4",
	      paused: true,
	      scrollX: normalizeScrollX ? "+=0.1" : "+=0",
	      scrollY: "+=0.1",
	      onComplete: onStopDelayedCall.vars.onComplete
	    });
	    return self;
	  };
	ScrollTrigger.sort = function (func) {
	  return _triggers.sort(func || function (a, b) {
	    return (a.vars.refreshPriority || 0) * -1e6 + a.start - (b.start + (b.vars.refreshPriority || 0) * -1e6);
	  });
	};
	ScrollTrigger.observe = function (vars) {
	  return new Observer(vars);
	};
	ScrollTrigger.normalizeScroll = function (vars) {
	  if (typeof vars === "undefined") {
	    return _normalizer;
	  }
	  if (vars === true && _normalizer) {
	    return _normalizer.enable();
	  }
	  if (vars === false) {
	    return _normalizer && _normalizer.kill();
	  }
	  var normalizer = vars instanceof Observer ? vars : _getScrollNormalizer(vars);
	  _normalizer && _normalizer.target === normalizer.target && _normalizer.kill();
	  _isViewport(normalizer.target) && (_normalizer = normalizer);
	  return normalizer;
	};
	ScrollTrigger.core = {
	  // smaller file size way to leverage in ScrollSmoother and Observer
	  _getVelocityProp: _getVelocityProp,
	  _inputObserver: _inputObserver,
	  _scrollers: _scrollers,
	  _proxies: _proxies,
	  bridge: {
	    // when normalizeScroll sets the scroll position (ss = setScroll)
	    ss: function ss() {
	      _lastScrollTime || _dispatch("scrollStart");
	      _lastScrollTime = _getTime();
	    },
	    // a way to get the _refreshing value in Observer
	    ref: function ref() {
	      return _refreshing;
	    }
	  }
	};
	_getGSAP() && gsap.registerPlugin(ScrollTrigger);

	gsapWithCSS.registerPlugin(ScrollTrigger);
	const section = document.querySelector('.faq');
	if (section) {
	  const topLine = document.createElement('span');
	  const bottomLine = document.createElement('span');
	  gsapWithCSS.set(section, {
	    position: 'relative',
	    paddingTop: 'clamp(60px, 10vw, 160px)',
	    paddingBottom: 'clamp(120px, 18vw, 160px)',
	    overflow: 'hidden'
	  });
	  gsapWithCSS.set(topLine, {
	    position: 'absolute',
	    top: 0,
	    right: '-100vw',
	    innerHTML: 'Вопрос',
	    fontSize: 'clamp(100px, 36vw, 320px)',
	    lineHeight: '1',
	    fontWeight: '600',
	    willChange: 'scroll-position',
	    color: '#fafafa',
	    zIndex: '-1'
	  });
	  gsapWithCSS.set(bottomLine, {
	    position: 'absolute',
	    bottom: 0,
	    left: '-100vw',
	    innerHTML: 'Ответ',
	    fontSize: 'clamp(100px, 36vw, 320px)',
	    lineHeight: '1',
	    fontWeight: '600',
	    willChange: 'scroll-position',
	    color: '#fafafa',
	    zIndex: '-1'
	  });
	  section.append(topLine, bottomLine);
	  gsapWithCSS.to(topLine, {
	    scrollTrigger: {
	      trigger: '.faq',
	      start: 'top center',
	      scrub: true,
	      end: '+=3000'
	    },
	    right: '100vw'
	  });
	  gsapWithCSS.to(bottomLine, {
	    scrollTrigger: {
	      trigger: '.faq',
	      start: 'center bottom',
	      scrub: true,
	      end: '+=3000'
	    },
	    left: '100vw'
	  });
	}

	const controls = document.querySelectorAll('input[type="file"]');
	if (controls.length) {
	  const onClickAddFile = evt => {
	    const target = evt.currentTarget;
	    const filename = target.files[0].name;
	    const fakeControl = target.parentNode.querySelector(".file-attach-fake-control span");
	    fakeControl.innerHTML = filename;
	  };
	  controls.forEach(ctrl => {
	    ctrl.addEventListener("change", onClickAddFile);
	  });
	}

	const focusableElements = ['a[href]', 'input', 'select', 'textarea', 'button', 'iframe', '[contenteditable]', '[tabindex]:not([tabindex^="-"])'];
	const focusTrap = node => {
	  const focusableContent = node.querySelectorAll(focusableElements);
	  const firstFocusableElement = focusableContent[0];
	  const lastFocusableElement = focusableContent[focusableContent.length - 1];
	  firstFocusableElement.focus();
	  if (focusableContent.length) {
	    const onBtnClickHandler = evt => {
	      const isTabPressed = evt.key === 'Tab' || evt.key === 9;
	      if (evt.key === 'Escape') {
	        document.removeEventListener('keydown', onBtnClickHandler);
	      }
	      if (!isTabPressed) {
	        return;
	      }
	      if (evt.shiftKey) {
	        if (document.activeElement === firstFocusableElement) {
	          lastFocusableElement.focus();
	          evt.preventDefault();
	        }
	      } else {
	        if (document.activeElement === lastFocusableElement) {
	          firstFocusableElement.focus();
	          evt.preventDefault();
	        }
	      }
	    };
	    document.addEventListener('keydown', onBtnClickHandler);
	  }
	};

	if (nav && navOpener && navCloser) {
	  const closeNav = () => {
	    nav.classList.remove('mobile-active');
	    navCloser.removeEventListener('click', closeNav);
	    nav.removeEventListener('click', onOverlayClickCloseNav);
	    document.removeEventListener('keydown', onEscPressCloseNav);
	    navOpener.addEventListener('click', onClickOpenNav);
	    bodyLocker(false);
	  };
	  const onOverlayClickCloseNav = evt => {
	    if (evt.target === nav) {
	      closeNav();
	    }
	  };
	  const onEscPressCloseNav = evt => {
	    if (evt.key === 'Escape' || evt.key === 'Esc') {
	      closeNav();
	    }
	  };
	  const onClickOpenNav = () => {
	    bodyLocker(true);
	    nav.classList.add('mobile-active');
	    focusTrap(nav);
	    navOpener.removeEventListener('click', onClickOpenNav);
	    navCloser.addEventListener('click', closeNav);
	    nav.addEventListener('click', onOverlayClickCloseNav);
	    document.addEventListener('keydown', onEscPressCloseNav);
	  };
	  navOpener.addEventListener('click', onClickOpenNav);
	}

	const openers = document.querySelectorAll('.nested-list-opener');
	if (openers.length) {
	  openers.forEach(opener => {
	    opener.addEventListener('click', evt => {
	      const target = evt.currentTarget;
	      target.parentNode.classList.toggle('expanded');
	    });
	  });
	}

	const modals = document.querySelectorAll('.modal');
	if (modals) {
	  modals.forEach(modal => {
	    new Modal(modal);
	  });
	}

	const GOOGLE_CAPTHCA_V_3_SITE_KEY = '6Lf1HwgqAAAAABxriKXLHJLVus5dMHT7rZ3KAyLL';
	function sendForm(form) {
	  const successModal = document.querySelector('.success-modal');
	  const errorModal = document.querySelector('.error-modal');
	  loader.classList.add('active');
	  function hideLoader() {
	    loader.classList.remove('active');
	  }
	  function success() {
	    hideLoader();
	    form.reset();
	    const fileFields = document.querySelectorAll('.file-attach-fake-control span');
	    if (fileFields.length) {
	      fileFields.forEach(field => {
	        field.innerHTML = 'Прикрепить файл';
	      });
	    }
	    const currentModal = form.closest('.modal');
	    if (currentModal) {
	      new Modal(currentModal).refresh();
	    }
	    setTimeout(() => {
	      new Modal(successModal).show();
	    }, 700);

	    // if (dataLayer) {
	    //   dataLayer.push({ event: "form-submit-event" });
	    // }
	  }
	  function error() {
	    hideLoader();
	    new Modal(errorModal, {
	      preventBodyLock: true
	    }).show();
	  }

	  // handle the form submission event

	  grecaptcha.ready(function () {
	    grecaptcha.execute(GOOGLE_CAPTHCA_V_3_SITE_KEY, {
	      action: 'submit'
	    }).then(function (token) {
	      form.querySelector('.g-recaptcha-response').value = token;
	      const data = new FormData(form);
	      ajax(form.method, form.action, data, success, error);
	      function ajax(method, url, data, success, error) {
	        const xhr = new XMLHttpRequest();
	        xhr.open(method, url);
	        xhr.setRequestHeader('Accept', 'application/json');
	        xhr.onreadystatechange = function () {
	          if (xhr.readyState !== XMLHttpRequest.DONE) return;
	          if (xhr.status === 200) {
	            success(xhr.response, xhr.responseType);
	          } else {
	            error(xhr.status, xhr.response, xhr.responseType);
	          }
	        };
	        xhr.send(data);
	      }
	    });
	  });
	}

	const formValidation = form => {
	  const fields = form.querySelectorAll('[data-required]');
	  const setInvalidStatus = field => {
	    !field.classList.contains('invalid-control') ? field.classList.add('invalid-control') : null;
	    field.classList.add('shaker');
	    setTimeout(() => {
	      field.classList.remove('shaker');
	    }, 800);
	  };
	  const setValidStatus = field => {
	    field.classList.contains('invalid-control') ? field.classList.remove('invalid-control') : null;
	  };
	  fields.forEach(field => {
	    field.addEventListener('change', () => {
	      setValidStatus(field);
	    });
	    if (field['type'] === 'text') {
	      if (field.value.trim().length < 2) {
	        setInvalidStatus(field);
	      } else {
	        setValidStatus(field);
	      }
	    } else if (field['type'] === 'tel') {
	      if (field.value.trim().length < 21) {
	        setInvalidStatus(field);
	      } else {
	        setValidStatus(field);
	      }
	    } else if (field['type'] === 'checkbox') {
	      console.log(field);
	      if (!field.checked) {
	        setInvalidStatus(field);
	      } else {
	        setValidStatus(field);
	      }
	    }
	  });
	  const isInvalid = document.querySelector('.invalid-control');
	  if (!isInvalid) {
	    sendForm(form);
	  }
	};

	const btns = document.querySelectorAll('[type="submit"]');
	if (btns) {
	  btns.forEach(btn => {
	    btn.addEventListener('click', evt => {
	      evt.preventDefault();
	      formValidation(evt.target.closest('form'));
	    });
	  });
	}

	const items = document.querySelectorAll(".service-stuff__list-item");
	if (items) {
	  const isOdd = items.length % 2 === 1 ? true : false;
	  const setClass = (item, type = null) => {
	    item.classList.add("service-stuff__list-item--related");
	    if (type && type === "top") {
	      item.classList.add("service-stuff__list-item--related-position-top");
	    }
	    if (type && type === "right") {
	      item.classList.add("service-stuff__list-item--related-position-right");
	    }
	  };
	  if (items.length === 2) {
	    setClass(items[0], "right");
	  } else {
	    for (let i = 2; i < items.length - 1; i++) {
	      if (i % 2 === 0) {
	        setClass(items[i]);
	      }
	    }
	    if (isOdd && items.length !== 1) {
	      setClass(items[items.length - 1], "top");
	    }
	  }
	}

	let tables = document.getElementsByTagName('table');
	if (tables.length) {
	  let length = tables.length,
	    i,
	    wrapper;
	  for (i = 0; i < length; i++) {
	    wrapper = document.createElement('div');
	    wrapper.setAttribute('class', 'table-wrapper');
	    tables[i].parentNode.insertBefore(wrapper, tables[i]);
	    wrapper.appendChild(tables[i]);
	  }
	}

	window.addEventListener('load', () => {
	  const hero = document.querySelector('.hero');
	  if (hero) {
	    const video = document.createElement('video');
	    const container = document.querySelector('#video-container');
	    video.setAttribute('preload', 'auto');
	    video.setAttribute('muted', 'muted');
	    video.setAttribute('loop', 'loop');
	    video.setAttribute('playsinline', 'playsinline');
	    video.setAttribute('autoplay', 'autoplay');
	    video.setAttribute('width', '1920');
	    video.setAttribute('height', '640');
	    video.setAttribute('src', container.dataset.src);
	    container.append(video);
	  }
	});

	window.addEventListener('load', () => {
	  const btn = document.createElement('button');
	  btn.classList.add('scroll-up-btn');
	  btn.setAttribute('aria-label', 'Наверх');
	  gsapWithCSS.set(btn, {
	    display: 'flex',
	    alignItems: 'center',
	    justifyContent: 'center',
	    position: 'fixed',
	    bottom: '40px',
	    right: '40px',
	    width: '50px',
	    height: '50px',
	    borderRadius: '50%',
	    backgroundColor: 'var(--primary)',
	    zIndex: 89,
	    mixBlendMode: 'multiply',
	    padding: '5px',
	    border: 'none',
	    transform: 'translateY(150px)',
	    backgroundImage: 'url(/local/templates/web-expert/assets/images/icon-up.svg)',
	    backgroundRepeat: 'no-repeat',
	    backgroundSize: '16px',
	    backgroundPosition: 'center'
	  });
	  document.body.append(btn);
	  let isActive = false;
	  window.addEventListener('scroll', () => {
	    const viewportHeight = document.documentElement.clientHeight;
	    if (window.scrollY > viewportHeight * 1.3) {
	      if (!isActive) {
	        isActive = true;
	        gsapWithCSS.fromTo(btn, {
	          y: '150px'
	        }, {
	          y: '0',
	          duration: 0.7,
	          ease: 'back'
	        });
	      }
	    } else {
	      if (isActive) {
	        isActive = false;
	        gsapWithCSS.fromTo(btn, {
	          y: '0'
	        }, {
	          y: '150px',
	          duration: 0.5,
	          ease: 'linear'
	        });
	      }
	    }
	  });
	  btn.addEventListener('click', () => {
	    window.scrollTo({
	      top: 0,
	      behavior: 'smooth'
	    });
	  });
	});

	const t = (t, e = 1e4) => (t = parseFloat(t + "") || 0, Math.round((t + Number.EPSILON) * e) / e),
	  e = function (t) {
	    if (!(t && t instanceof Element && t.offsetParent)) return !1;
	    const e = t.scrollHeight > t.clientHeight,
	      i = window.getComputedStyle(t).overflowY,
	      n = -1 !== i.indexOf("hidden"),
	      s = -1 !== i.indexOf("visible");
	    return e && !n && !s;
	  },
	  i = function (t, n = void 0) {
	    return !(!t || t === document.body || n && t === n) && (e(t) ? t : i(t.parentElement, n));
	  },
	  n = function (t) {
	    var e = new DOMParser().parseFromString(t, "text/html").body;
	    if (e.childElementCount > 1) {
	      for (var i = document.createElement("div"); e.firstChild;) i.appendChild(e.firstChild);
	      return i;
	    }
	    return e.firstChild;
	  },
	  s = t => `${t || ""}`.split(" ").filter(t => !!t),
	  o = (t, e, i) => {
	    t && s(e).forEach(e => {
	      t.classList.toggle(e, i || !1);
	    });
	  };
	class a {
	  constructor(t) {
	    Object.defineProperty(this, "pageX", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: void 0
	    }), Object.defineProperty(this, "pageY", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: void 0
	    }), Object.defineProperty(this, "clientX", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: void 0
	    }), Object.defineProperty(this, "clientY", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: void 0
	    }), Object.defineProperty(this, "id", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: void 0
	    }), Object.defineProperty(this, "time", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: void 0
	    }), Object.defineProperty(this, "nativePointer", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: void 0
	    }), this.nativePointer = t, this.pageX = t.pageX, this.pageY = t.pageY, this.clientX = t.clientX, this.clientY = t.clientY, this.id = self.Touch && t instanceof Touch ? t.identifier : -1, this.time = Date.now();
	  }
	}
	const r = {
	  passive: !1
	};
	class l {
	  constructor(t, {
	    start: e = () => !0,
	    move: i = () => {},
	    end: n = () => {}
	  }) {
	    Object.defineProperty(this, "element", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: void 0
	    }), Object.defineProperty(this, "startCallback", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: void 0
	    }), Object.defineProperty(this, "moveCallback", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: void 0
	    }), Object.defineProperty(this, "endCallback", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: void 0
	    }), Object.defineProperty(this, "currentPointers", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: []
	    }), Object.defineProperty(this, "startPointers", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: []
	    }), this.element = t, this.startCallback = e, this.moveCallback = i, this.endCallback = n;
	    for (const t of ["onPointerStart", "onTouchStart", "onMove", "onTouchEnd", "onPointerEnd", "onWindowBlur"]) this[t] = this[t].bind(this);
	    this.element.addEventListener("mousedown", this.onPointerStart, r), this.element.addEventListener("touchstart", this.onTouchStart, r), this.element.addEventListener("touchmove", this.onMove, r), this.element.addEventListener("touchend", this.onTouchEnd), this.element.addEventListener("touchcancel", this.onTouchEnd);
	  }
	  onPointerStart(t) {
	    if (!t.buttons || 0 !== t.button) return;
	    const e = new a(t);
	    this.currentPointers.some(t => t.id === e.id) || this.triggerPointerStart(e, t) && (window.addEventListener("mousemove", this.onMove), window.addEventListener("mouseup", this.onPointerEnd), window.addEventListener("blur", this.onWindowBlur));
	  }
	  onTouchStart(t) {
	    for (const e of Array.from(t.changedTouches || [])) this.triggerPointerStart(new a(e), t);
	    window.addEventListener("blur", this.onWindowBlur);
	  }
	  onMove(t) {
	    const e = this.currentPointers.slice(),
	      i = "changedTouches" in t ? Array.from(t.changedTouches || []).map(t => new a(t)) : [new a(t)],
	      n = [];
	    for (const t of i) {
	      const e = this.currentPointers.findIndex(e => e.id === t.id);
	      e < 0 || (n.push(t), this.currentPointers[e] = t);
	    }
	    n.length && this.moveCallback(t, this.currentPointers.slice(), e);
	  }
	  onPointerEnd(t) {
	    t.buttons > 0 && 0 !== t.button || (this.triggerPointerEnd(t, new a(t)), window.removeEventListener("mousemove", this.onMove), window.removeEventListener("mouseup", this.onPointerEnd), window.removeEventListener("blur", this.onWindowBlur));
	  }
	  onTouchEnd(t) {
	    for (const e of Array.from(t.changedTouches || [])) this.triggerPointerEnd(t, new a(e));
	  }
	  triggerPointerStart(t, e) {
	    return !!this.startCallback(e, t, this.currentPointers.slice()) && (this.currentPointers.push(t), this.startPointers.push(t), !0);
	  }
	  triggerPointerEnd(t, e) {
	    const i = this.currentPointers.findIndex(t => t.id === e.id);
	    i < 0 || (this.currentPointers.splice(i, 1), this.startPointers.splice(i, 1), this.endCallback(t, e, this.currentPointers.slice()));
	  }
	  onWindowBlur() {
	    this.clear();
	  }
	  clear() {
	    for (; this.currentPointers.length;) {
	      const t = this.currentPointers[this.currentPointers.length - 1];
	      this.currentPointers.splice(this.currentPointers.length - 1, 1), this.startPointers.splice(this.currentPointers.length - 1, 1), this.endCallback(new Event("touchend", {
	        bubbles: !0,
	        cancelable: !0,
	        clientX: t.clientX,
	        clientY: t.clientY
	      }), t, this.currentPointers.slice());
	    }
	  }
	  stop() {
	    this.element.removeEventListener("mousedown", this.onPointerStart, r), this.element.removeEventListener("touchstart", this.onTouchStart, r), this.element.removeEventListener("touchmove", this.onMove, r), this.element.removeEventListener("touchend", this.onTouchEnd), this.element.removeEventListener("touchcancel", this.onTouchEnd), window.removeEventListener("mousemove", this.onMove), window.removeEventListener("mouseup", this.onPointerEnd), window.removeEventListener("blur", this.onWindowBlur);
	  }
	}
	function c(t, e) {
	  return e ? Math.sqrt(Math.pow(e.clientX - t.clientX, 2) + Math.pow(e.clientY - t.clientY, 2)) : 0;
	}
	function h(t, e) {
	  return e ? {
	    clientX: (t.clientX + e.clientX) / 2,
	    clientY: (t.clientY + e.clientY) / 2
	  } : t;
	}
	const d = t => "object" == typeof t && null !== t && t.constructor === Object && "[object Object]" === Object.prototype.toString.call(t),
	  u = (t, ...e) => {
	    const i = e.length;
	    for (let n = 0; n < i; n++) {
	      const i = e[n] || {};
	      Object.entries(i).forEach(([e, i]) => {
	        const n = Array.isArray(i) ? [] : {};
	        t[e] || Object.assign(t, {
	          [e]: n
	        }), d(i) ? Object.assign(t[e], u(n, i)) : Array.isArray(i) ? Object.assign(t, {
	          [e]: [...i]
	        }) : Object.assign(t, {
	          [e]: i
	        });
	      });
	    }
	    return t;
	  },
	  p = function (t, e) {
	    return t.split(".").reduce((t, e) => "object" == typeof t ? t[e] : void 0, e);
	  };
	class f {
	  constructor(t = {}) {
	    Object.defineProperty(this, "options", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: t
	    }), Object.defineProperty(this, "events", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: new Map()
	    }), this.setOptions(t);
	    for (const t of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) t.startsWith("on") && "function" == typeof this[t] && (this[t] = this[t].bind(this));
	  }
	  setOptions(t) {
	    this.options = t ? u({}, this.constructor.defaults, t) : {};
	    for (const [t, e] of Object.entries(this.option("on") || {})) this.on(t, e);
	  }
	  option(t, ...e) {
	    let i = p(t, this.options);
	    return i && "function" == typeof i && (i = i.call(this, this, ...e)), i;
	  }
	  optionFor(t, e, i, ...n) {
	    let s = p(e, t);
	    var o;
	    "string" != typeof (o = s) || isNaN(o) || isNaN(parseFloat(o)) || (s = parseFloat(s)), "true" === s && (s = !0), "false" === s && (s = !1), s && "function" == typeof s && (s = s.call(this, this, t, ...n));
	    let a = p(e, this.options);
	    return a && "function" == typeof a ? s = a.call(this, this, t, ...n, s) : void 0 === s && (s = a), void 0 === s ? i : s;
	  }
	  cn(t) {
	    const e = this.options.classes;
	    return e && e[t] || "";
	  }
	  localize(t, e = []) {
	    t = String(t).replace(/\{\{(\w+).?(\w+)?\}\}/g, (t, e, i) => {
	      let n = "";
	      return i ? n = this.option(`${e[0] + e.toLowerCase().substring(1)}.l10n.${i}`) : e && (n = this.option(`l10n.${e}`)), n || (n = t), n;
	    });
	    for (let i = 0; i < e.length; i++) t = t.split(e[i][0]).join(e[i][1]);
	    return t = t.replace(/\{\{(.*?)\}\}/g, (t, e) => e);
	  }
	  on(t, e) {
	    let i = [];
	    "string" == typeof t ? i = t.split(" ") : Array.isArray(t) && (i = t), this.events || (this.events = new Map()), i.forEach(t => {
	      let i = this.events.get(t);
	      i || (this.events.set(t, []), i = []), i.includes(e) || i.push(e), this.events.set(t, i);
	    });
	  }
	  off(t, e) {
	    let i = [];
	    "string" == typeof t ? i = t.split(" ") : Array.isArray(t) && (i = t), i.forEach(t => {
	      const i = this.events.get(t);
	      if (Array.isArray(i)) {
	        const t = i.indexOf(e);
	        t > -1 && i.splice(t, 1);
	      }
	    });
	  }
	  emit(t, ...e) {
	    [...(this.events.get(t) || [])].forEach(t => t(this, ...e)), "*" !== t && this.emit("*", t, ...e);
	  }
	}
	Object.defineProperty(f, "version", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: "5.0.36"
	}), Object.defineProperty(f, "defaults", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: {}
	});
	class g extends f {
	  constructor(t = {}) {
	    super(t), Object.defineProperty(this, "plugins", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: {}
	    });
	  }
	  attachPlugins(t = {}) {
	    const e = new Map();
	    for (const [i, n] of Object.entries(t)) {
	      const t = this.option(i),
	        s = this.plugins[i];
	      s || !1 === t ? s && !1 === t && (s.detach(), delete this.plugins[i]) : e.set(i, new n(this, t || {}));
	    }
	    for (const [t, i] of e) this.plugins[t] = i, i.attach();
	  }
	  detachPlugins(t) {
	    t = t || Object.keys(this.plugins);
	    for (const e of t) {
	      const t = this.plugins[e];
	      t && t.detach(), delete this.plugins[e];
	    }
	    return this.emit("detachPlugins"), this;
	  }
	}
	var m;
	!function (t) {
	  t[t.Init = 0] = "Init", t[t.Error = 1] = "Error", t[t.Ready = 2] = "Ready", t[t.Panning = 3] = "Panning", t[t.Mousemove = 4] = "Mousemove", t[t.Destroy = 5] = "Destroy";
	}(m || (m = {}));
	const v = ["a", "b", "c", "d", "e", "f"],
	  b = {
	    PANUP: "Move up",
	    PANDOWN: "Move down",
	    PANLEFT: "Move left",
	    PANRIGHT: "Move right",
	    ZOOMIN: "Zoom in",
	    ZOOMOUT: "Zoom out",
	    TOGGLEZOOM: "Toggle zoom level",
	    TOGGLE1TO1: "Toggle zoom level",
	    ITERATEZOOM: "Toggle zoom level",
	    ROTATECCW: "Rotate counterclockwise",
	    ROTATECW: "Rotate clockwise",
	    FLIPX: "Flip horizontally",
	    FLIPY: "Flip vertically",
	    FITX: "Fit horizontally",
	    FITY: "Fit vertically",
	    RESET: "Reset",
	    TOGGLEFS: "Toggle fullscreen"
	  },
	  y = {
	    content: null,
	    width: "auto",
	    height: "auto",
	    panMode: "drag",
	    touch: !0,
	    dragMinThreshold: 3,
	    lockAxis: !1,
	    mouseMoveFactor: 1,
	    mouseMoveFriction: .12,
	    zoom: !0,
	    pinchToZoom: !0,
	    panOnlyZoomed: "auto",
	    minScale: 1,
	    maxScale: 2,
	    friction: .25,
	    dragFriction: .35,
	    decelFriction: .05,
	    click: "toggleZoom",
	    dblClick: !1,
	    wheel: "zoom",
	    wheelLimit: 7,
	    spinner: !0,
	    bounds: "auto",
	    infinite: !1,
	    rubberband: !0,
	    bounce: !0,
	    maxVelocity: 75,
	    transformParent: !1,
	    classes: {
	      content: "f-panzoom__content",
	      isLoading: "is-loading",
	      canZoomIn: "can-zoom_in",
	      canZoomOut: "can-zoom_out",
	      isDraggable: "is-draggable",
	      isDragging: "is-dragging",
	      inFullscreen: "in-fullscreen",
	      htmlHasFullscreen: "with-panzoom-in-fullscreen"
	    },
	    l10n: b
	  },
	  w = '<circle cx="25" cy="25" r="20"></circle>',
	  x = '<div class="f-spinner"><svg viewBox="0 0 50 50">' + w + w + "</svg></div>",
	  E = t => t && null !== t && t instanceof Element && "nodeType" in t,
	  S = (t, e) => {
	    t && s(e).forEach(e => {
	      t.classList.remove(e);
	    });
	  },
	  P = (t, e) => {
	    t && s(e).forEach(e => {
	      t.classList.add(e);
	    });
	  },
	  C = {
	    a: 1,
	    b: 0,
	    c: 0,
	    d: 1,
	    e: 0,
	    f: 0
	  },
	  T = 1e5,
	  M = 1e4,
	  O = "mousemove",
	  A = "drag",
	  L = "content",
	  z = "auto";
	let R = null,
	  k = null;
	class I extends g {
	  get fits() {
	    return this.contentRect.width - this.contentRect.fitWidth < 1 && this.contentRect.height - this.contentRect.fitHeight < 1;
	  }
	  get isTouchDevice() {
	    return null === k && (k = window.matchMedia("(hover: none)").matches), k;
	  }
	  get isMobile() {
	    return null === R && (R = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)), R;
	  }
	  get panMode() {
	    return this.options.panMode !== O || this.isTouchDevice ? A : O;
	  }
	  get panOnlyZoomed() {
	    const t = this.options.panOnlyZoomed;
	    return t === z ? this.isTouchDevice : t;
	  }
	  get isInfinite() {
	    return this.option("infinite");
	  }
	  get angle() {
	    return 180 * Math.atan2(this.current.b, this.current.a) / Math.PI || 0;
	  }
	  get targetAngle() {
	    return 180 * Math.atan2(this.target.b, this.target.a) / Math.PI || 0;
	  }
	  get scale() {
	    const {
	      a: t,
	      b: e
	    } = this.current;
	    return Math.sqrt(t * t + e * e) || 1;
	  }
	  get targetScale() {
	    const {
	      a: t,
	      b: e
	    } = this.target;
	    return Math.sqrt(t * t + e * e) || 1;
	  }
	  get minScale() {
	    return this.option("minScale") || 1;
	  }
	  get fullScale() {
	    const {
	      contentRect: t
	    } = this;
	    return t.fullWidth / t.fitWidth || 1;
	  }
	  get maxScale() {
	    return this.fullScale * (this.option("maxScale") || 1) || 1;
	  }
	  get coverScale() {
	    const {
	        containerRect: t,
	        contentRect: e
	      } = this,
	      i = Math.max(t.height / e.fitHeight, t.width / e.fitWidth) || 1;
	    return Math.min(this.fullScale, i);
	  }
	  get isScaling() {
	    return Math.abs(this.targetScale - this.scale) > 1e-5 && !this.isResting;
	  }
	  get isContentLoading() {
	    const t = this.content;
	    return !!(t && t instanceof HTMLImageElement) && !t.complete;
	  }
	  get isResting() {
	    if (this.isBouncingX || this.isBouncingY) return !1;
	    for (const t of v) {
	      const e = "e" == t || "f" === t ? 1e-4 : 1e-5;
	      if (Math.abs(this.target[t] - this.current[t]) > e) return !1;
	    }
	    return !(!this.ignoreBounds && !this.checkBounds().inBounds);
	  }
	  constructor(t, e = {}, i = {}) {
	    var s;
	    if (super(e), Object.defineProperty(this, "pointerTracker", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "resizeObserver", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "updateTimer", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "clickTimer", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "rAF", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "isTicking", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: !1
	    }), Object.defineProperty(this, "ignoreBounds", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: !1
	    }), Object.defineProperty(this, "isBouncingX", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: !1
	    }), Object.defineProperty(this, "isBouncingY", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: !1
	    }), Object.defineProperty(this, "clicks", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: 0
	    }), Object.defineProperty(this, "trackingPoints", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: []
	    }), Object.defineProperty(this, "pwt", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: 0
	    }), Object.defineProperty(this, "cwd", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: 0
	    }), Object.defineProperty(this, "pmme", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: void 0
	    }), Object.defineProperty(this, "friction", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: 0
	    }), Object.defineProperty(this, "state", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: m.Init
	    }), Object.defineProperty(this, "isDragging", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: !1
	    }), Object.defineProperty(this, "container", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: void 0
	    }), Object.defineProperty(this, "content", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: void 0
	    }), Object.defineProperty(this, "spinner", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "containerRect", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: {
	        width: 0,
	        height: 0,
	        innerWidth: 0,
	        innerHeight: 0
	      }
	    }), Object.defineProperty(this, "contentRect", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: {
	        top: 0,
	        right: 0,
	        bottom: 0,
	        left: 0,
	        fullWidth: 0,
	        fullHeight: 0,
	        fitWidth: 0,
	        fitHeight: 0,
	        width: 0,
	        height: 0
	      }
	    }), Object.defineProperty(this, "dragStart", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: {
	        x: 0,
	        y: 0,
	        top: 0,
	        left: 0,
	        time: 0
	      }
	    }), Object.defineProperty(this, "dragOffset", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: {
	        x: 0,
	        y: 0,
	        time: 0
	      }
	    }), Object.defineProperty(this, "current", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: Object.assign({}, C)
	    }), Object.defineProperty(this, "target", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: Object.assign({}, C)
	    }), Object.defineProperty(this, "velocity", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: {
	        a: 0,
	        b: 0,
	        c: 0,
	        d: 0,
	        e: 0,
	        f: 0
	      }
	    }), Object.defineProperty(this, "lockedAxis", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: !1
	    }), !t) throw new Error("Container Element Not Found");
	    this.container = t, this.initContent(), this.attachPlugins(Object.assign(Object.assign({}, I.Plugins), i)), this.emit("attachPlugins"), this.emit("init");
	    const o = this.content;
	    if (o.addEventListener("load", this.onLoad), o.addEventListener("error", this.onError), this.isContentLoading) {
	      if (this.option("spinner")) {
	        t.classList.add(this.cn("isLoading"));
	        const e = n(x);
	        !t.contains(o) || o.parentElement instanceof HTMLPictureElement ? this.spinner = t.appendChild(e) : this.spinner = (null === (s = o.parentElement) || void 0 === s ? void 0 : s.insertBefore(e, o)) || null;
	      }
	      this.emit("beforeLoad");
	    } else queueMicrotask(() => {
	      this.enable();
	    });
	  }
	  initContent() {
	    const {
	        container: t
	      } = this,
	      e = this.cn(L);
	    let i = this.option(L) || t.querySelector(`.${e}`);
	    if (i || (i = t.querySelector("img,picture") || t.firstElementChild, i && P(i, e)), i instanceof HTMLPictureElement && (i = i.querySelector("img")), !i) throw new Error("No content found");
	    this.content = i;
	  }
	  onLoad() {
	    const {
	      spinner: t,
	      container: e,
	      state: i
	    } = this;
	    t && (t.remove(), this.spinner = null), this.option("spinner") && e.classList.remove(this.cn("isLoading")), this.emit("afterLoad"), i === m.Init ? this.enable() : this.updateMetrics();
	  }
	  onError() {
	    this.state !== m.Destroy && (this.spinner && (this.spinner.remove(), this.spinner = null), this.stop(), this.detachEvents(), this.state = m.Error, this.emit("error"));
	  }
	  getNextScale(t) {
	    const {
	      fullScale: e,
	      targetScale: i,
	      coverScale: n,
	      maxScale: s,
	      minScale: o
	    } = this;
	    let a = o;
	    switch (t) {
	      case "toggleMax":
	        a = i - o < .5 * (s - o) ? s : o;
	        break;
	      case "toggleCover":
	        a = i - o < .5 * (n - o) ? n : o;
	        break;
	      case "toggleZoom":
	        a = i - o < .5 * (e - o) ? e : o;
	        break;
	      case "iterateZoom":
	        let t = [1, e, s].sort((t, e) => t - e),
	          r = t.findIndex(t => t > i + 1e-5);
	        a = t[r] || 1;
	    }
	    return a;
	  }
	  attachObserver() {
	    var t;
	    const e = () => {
	      const {
	        container: t,
	        containerRect: e
	      } = this;
	      return Math.abs(e.width - t.getBoundingClientRect().width) > .1 || Math.abs(e.height - t.getBoundingClientRect().height) > .1;
	    };
	    this.resizeObserver || void 0 === window.ResizeObserver || (this.resizeObserver = new ResizeObserver(() => {
	      this.updateTimer || (e() ? (this.onResize(), this.isMobile && (this.updateTimer = setTimeout(() => {
	        e() && this.onResize(), this.updateTimer = null;
	      }, 500))) : this.updateTimer && (clearTimeout(this.updateTimer), this.updateTimer = null));
	    })), null === (t = this.resizeObserver) || void 0 === t || t.observe(this.container);
	  }
	  detachObserver() {
	    var t;
	    null === (t = this.resizeObserver) || void 0 === t || t.disconnect();
	  }
	  attachEvents() {
	    const {
	      container: t
	    } = this;
	    t.addEventListener("click", this.onClick, {
	      passive: !1,
	      capture: !1
	    }), t.addEventListener("wheel", this.onWheel, {
	      passive: !1
	    }), this.pointerTracker = new l(t, {
	      start: this.onPointerDown,
	      move: this.onPointerMove,
	      end: this.onPointerUp
	    }), document.addEventListener(O, this.onMouseMove);
	  }
	  detachEvents() {
	    var t;
	    const {
	      container: e
	    } = this;
	    e.removeEventListener("click", this.onClick, {
	      passive: !1,
	      capture: !1
	    }), e.removeEventListener("wheel", this.onWheel, {
	      passive: !1
	    }), null === (t = this.pointerTracker) || void 0 === t || t.stop(), this.pointerTracker = null, document.removeEventListener(O, this.onMouseMove), document.removeEventListener("keydown", this.onKeydown, !0), this.clickTimer && (clearTimeout(this.clickTimer), this.clickTimer = null), this.updateTimer && (clearTimeout(this.updateTimer), this.updateTimer = null);
	  }
	  animate() {
	    this.setTargetForce();
	    const t = this.friction,
	      e = this.option("maxVelocity");
	    for (const i of v) t ? (this.velocity[i] *= 1 - t, e && !this.isScaling && (this.velocity[i] = Math.max(Math.min(this.velocity[i], e), -1 * e)), this.current[i] += this.velocity[i]) : this.current[i] = this.target[i];
	    this.setTransform(), this.setEdgeForce(), !this.isResting || this.isDragging ? this.rAF = requestAnimationFrame(() => this.animate()) : this.stop("current");
	  }
	  setTargetForce() {
	    for (const t of v) "e" === t && this.isBouncingX || "f" === t && this.isBouncingY || (this.velocity[t] = (1 / (1 - this.friction) - 1) * (this.target[t] - this.current[t]));
	  }
	  checkBounds(t = 0, e = 0) {
	    const {
	        current: i
	      } = this,
	      n = i.e + t,
	      s = i.f + e,
	      o = this.getBounds(),
	      {
	        x: a,
	        y: r
	      } = o,
	      l = a.min,
	      c = a.max,
	      h = r.min,
	      d = r.max;
	    let u = 0,
	      p = 0;
	    return l !== 1 / 0 && n < l ? u = l - n : c !== 1 / 0 && n > c && (u = c - n), h !== 1 / 0 && s < h ? p = h - s : d !== 1 / 0 && s > d && (p = d - s), Math.abs(u) < 1e-4 && (u = 0), Math.abs(p) < 1e-4 && (p = 0), Object.assign(Object.assign({}, o), {
	      xDiff: u,
	      yDiff: p,
	      inBounds: !u && !p
	    });
	  }
	  clampTargetBounds() {
	    const {
	        target: t
	      } = this,
	      {
	        x: e,
	        y: i
	      } = this.getBounds();
	    e.min !== 1 / 0 && (t.e = Math.max(t.e, e.min)), e.max !== 1 / 0 && (t.e = Math.min(t.e, e.max)), i.min !== 1 / 0 && (t.f = Math.max(t.f, i.min)), i.max !== 1 / 0 && (t.f = Math.min(t.f, i.max));
	  }
	  calculateContentDim(t = this.current) {
	    const {
	        content: e,
	        contentRect: i
	      } = this,
	      {
	        fitWidth: n,
	        fitHeight: s,
	        fullWidth: o,
	        fullHeight: a
	      } = i;
	    let r = o,
	      l = a;
	    if (this.option("zoom") || 0 !== this.angle) {
	      const i = !(e instanceof HTMLImageElement) && ("none" === window.getComputedStyle(e).maxWidth || "none" === window.getComputedStyle(e).maxHeight),
	        c = i ? o : n,
	        h = i ? a : s,
	        d = this.getMatrix(t),
	        u = new DOMPoint(0, 0).matrixTransform(d),
	        p = new DOMPoint(0 + c, 0).matrixTransform(d),
	        f = new DOMPoint(0 + c, 0 + h).matrixTransform(d),
	        g = new DOMPoint(0, 0 + h).matrixTransform(d),
	        m = Math.abs(f.x - u.x),
	        v = Math.abs(f.y - u.y),
	        b = Math.abs(g.x - p.x),
	        y = Math.abs(g.y - p.y);
	      r = Math.max(m, b), l = Math.max(v, y);
	    }
	    return {
	      contentWidth: r,
	      contentHeight: l
	    };
	  }
	  setEdgeForce() {
	    if (this.ignoreBounds || this.isDragging || this.panMode === O || this.targetScale < this.scale) return this.isBouncingX = !1, void (this.isBouncingY = !1);
	    const {
	        target: t
	      } = this,
	      {
	        x: e,
	        y: i,
	        xDiff: n,
	        yDiff: s
	      } = this.checkBounds();
	    const o = this.option("maxVelocity");
	    let a = this.velocity.e,
	      r = this.velocity.f;
	    0 !== n ? (this.isBouncingX = !0, n * a <= 0 ? a += .14 * n : (a = .14 * n, e.min !== 1 / 0 && (this.target.e = Math.max(t.e, e.min)), e.max !== 1 / 0 && (this.target.e = Math.min(t.e, e.max))), o && (a = Math.max(Math.min(a, o), -1 * o))) : this.isBouncingX = !1, 0 !== s ? (this.isBouncingY = !0, s * r <= 0 ? r += .14 * s : (r = .14 * s, i.min !== 1 / 0 && (this.target.f = Math.max(t.f, i.min)), i.max !== 1 / 0 && (this.target.f = Math.min(t.f, i.max))), o && (r = Math.max(Math.min(r, o), -1 * o))) : this.isBouncingY = !1, this.isBouncingX && (this.velocity.e = a), this.isBouncingY && (this.velocity.f = r);
	  }
	  enable() {
	    const {
	        content: t
	      } = this,
	      e = new DOMMatrixReadOnly(window.getComputedStyle(t).transform);
	    for (const t of v) this.current[t] = this.target[t] = e[t];
	    this.updateMetrics(), this.attachObserver(), this.attachEvents(), this.state = m.Ready, this.emit("ready");
	  }
	  onClick(t) {
	    var e;
	    "click" === t.type && 0 === t.detail && (this.dragOffset.x = 0, this.dragOffset.y = 0), this.isDragging && (null === (e = this.pointerTracker) || void 0 === e || e.clear(), this.trackingPoints = [], this.startDecelAnim());
	    const i = t.target;
	    if (!i || t.defaultPrevented) return;
	    if (i.hasAttribute("disabled")) return t.preventDefault(), void t.stopPropagation();
	    if ((() => {
	      const t = window.getSelection();
	      return t && "Range" === t.type;
	    })() && !i.closest("button")) return;
	    const n = i.closest("[data-panzoom-action]"),
	      s = i.closest("[data-panzoom-change]"),
	      o = n || s,
	      a = o && E(o) ? o.dataset : null;
	    if (a) {
	      const e = a.panzoomChange,
	        i = a.panzoomAction;
	      if ((e || i) && t.preventDefault(), e) {
	        let t = {};
	        try {
	          t = JSON.parse(e);
	        } catch (t) {
	          console && console.warn("The given data was not valid JSON");
	        }
	        return void this.applyChange(t);
	      }
	      if (i) return void (this[i] && this[i]());
	    }
	    if (Math.abs(this.dragOffset.x) > 3 || Math.abs(this.dragOffset.y) > 3) return t.preventDefault(), void t.stopPropagation();
	    if (i.closest("[data-fancybox]")) return;
	    const r = this.content.getBoundingClientRect(),
	      l = this.dragStart;
	    if (l.time && !this.canZoomOut() && (Math.abs(r.x - l.x) > 2 || Math.abs(r.y - l.y) > 2)) return;
	    this.dragStart.time = 0;
	    const c = e => {
	        this.option("zoom", t) && e && "string" == typeof e && /(iterateZoom)|(toggle(Zoom|Full|Cover|Max)|(zoomTo(Fit|Cover|Max)))/.test(e) && "function" == typeof this[e] && (t.preventDefault(), this[e]({
	          event: t
	        }));
	      },
	      h = this.option("click", t),
	      d = this.option("dblClick", t);
	    d ? (this.clicks++, 1 == this.clicks && (this.clickTimer = setTimeout(() => {
	      1 === this.clicks ? (this.emit("click", t), !t.defaultPrevented && h && c(h)) : (this.emit("dblClick", t), t.defaultPrevented || c(d)), this.clicks = 0, this.clickTimer = null;
	    }, 350))) : (this.emit("click", t), !t.defaultPrevented && h && c(h));
	  }
	  addTrackingPoint(t) {
	    const e = this.trackingPoints.filter(t => t.time > Date.now() - 100);
	    e.push(t), this.trackingPoints = e;
	  }
	  onPointerDown(t, e, i) {
	    var n;
	    if (!1 === this.option("touch", t)) return !1;
	    this.pwt = 0, this.dragOffset = {
	      x: 0,
	      y: 0,
	      time: 0
	    }, this.trackingPoints = [];
	    const s = this.content.getBoundingClientRect();
	    if (this.dragStart = {
	      x: s.x,
	      y: s.y,
	      top: s.top,
	      left: s.left,
	      time: Date.now()
	    }, this.clickTimer) return !1;
	    if (this.panMode === O && this.targetScale > 1) return t.preventDefault(), t.stopPropagation(), !1;
	    const o = t.composedPath()[0];
	    if (!i.length) {
	      if (["TEXTAREA", "OPTION", "INPUT", "SELECT", "VIDEO", "IFRAME"].includes(o.nodeName) || o.closest("[contenteditable],[data-selectable],[data-draggable],[data-clickable],[data-panzoom-change],[data-panzoom-action]")) return !1;
	      null === (n = window.getSelection()) || void 0 === n || n.removeAllRanges();
	    }
	    if ("mousedown" === t.type) ["A", "BUTTON"].includes(o.nodeName) || t.preventDefault();else if (Math.abs(this.velocity.a) > .3) return !1;
	    return this.target.e = this.current.e, this.target.f = this.current.f, this.stop(), this.isDragging || (this.isDragging = !0, this.addTrackingPoint(e), this.emit("touchStart", t)), !0;
	  }
	  onPointerMove(e, n, s) {
	    if (!1 === this.option("touch", e)) return;
	    if (!this.isDragging) return;
	    if (n.length < 2 && this.panOnlyZoomed && t(this.targetScale) <= t(this.minScale)) return;
	    if (this.emit("touchMove", e), e.defaultPrevented) return;
	    this.addTrackingPoint(n[0]);
	    const {
	        content: o
	      } = this,
	      a = h(s[0], s[1]),
	      r = h(n[0], n[1]);
	    let l = 0,
	      d = 0;
	    if (n.length > 1) {
	      const t = o.getBoundingClientRect();
	      l = a.clientX - t.left - .5 * t.width, d = a.clientY - t.top - .5 * t.height;
	    }
	    const u = c(s[0], s[1]),
	      p = c(n[0], n[1]);
	    let f = u ? p / u : 1,
	      g = r.clientX - a.clientX,
	      m = r.clientY - a.clientY;
	    this.dragOffset.x += g, this.dragOffset.y += m, this.dragOffset.time = Date.now() - this.dragStart.time;
	    let v = t(this.targetScale) === t(this.minScale) && this.option("lockAxis");
	    if (v && !this.lockedAxis) if ("xy" === v || "y" === v || "touchmove" === e.type) {
	      if (Math.abs(this.dragOffset.x) < 6 && Math.abs(this.dragOffset.y) < 6) return void e.preventDefault();
	      const t = Math.abs(180 * Math.atan2(this.dragOffset.y, this.dragOffset.x) / Math.PI);
	      this.lockedAxis = t > 45 && t < 135 ? "y" : "x", this.dragOffset.x = 0, this.dragOffset.y = 0, g = 0, m = 0;
	    } else this.lockedAxis = v;
	    if (i(e.target, this.content) && (v = "x", this.dragOffset.y = 0), v && "xy" !== v && this.lockedAxis !== v && t(this.targetScale) === t(this.minScale)) return;
	    e.cancelable && e.preventDefault(), this.container.classList.add(this.cn("isDragging"));
	    const b = this.checkBounds(g, m);
	    this.option("rubberband") ? ("x" !== this.isInfinite && (b.xDiff > 0 && g < 0 || b.xDiff < 0 && g > 0) && (g *= Math.max(0, .5 - Math.abs(.75 / this.contentRect.fitWidth * b.xDiff))), "y" !== this.isInfinite && (b.yDiff > 0 && m < 0 || b.yDiff < 0 && m > 0) && (m *= Math.max(0, .5 - Math.abs(.75 / this.contentRect.fitHeight * b.yDiff)))) : (b.xDiff && (g = 0), b.yDiff && (m = 0));
	    const y = this.targetScale,
	      w = this.minScale,
	      x = this.maxScale;
	    y < .5 * w && (f = Math.max(f, w)), y > 1.5 * x && (f = Math.min(f, x)), "y" === this.lockedAxis && t(y) === t(w) && (g = 0), "x" === this.lockedAxis && t(y) === t(w) && (m = 0), this.applyChange({
	      originX: l,
	      originY: d,
	      panX: g,
	      panY: m,
	      scale: f,
	      friction: this.option("dragFriction"),
	      ignoreBounds: !0
	    });
	  }
	  onPointerUp(t, e, n) {
	    if (n.length) return this.dragOffset.x = 0, this.dragOffset.y = 0, void (this.trackingPoints = []);
	    this.container.classList.remove(this.cn("isDragging")), this.isDragging && (this.addTrackingPoint(e), this.panOnlyZoomed && this.contentRect.width - this.contentRect.fitWidth < 1 && this.contentRect.height - this.contentRect.fitHeight < 1 && (this.trackingPoints = []), i(t.target, this.content) && "y" === this.lockedAxis && (this.trackingPoints = []), this.emit("touchEnd", t), this.isDragging = !1, this.lockedAxis = !1, this.state !== m.Destroy && (t.defaultPrevented || this.startDecelAnim()));
	  }
	  startDecelAnim() {
	    var e;
	    const i = this.isScaling;
	    this.rAF && (cancelAnimationFrame(this.rAF), this.rAF = null), this.isBouncingX = !1, this.isBouncingY = !1;
	    for (const t of v) this.velocity[t] = 0;
	    this.target.e = this.current.e, this.target.f = this.current.f, S(this.container, "is-scaling"), S(this.container, "is-animating"), this.isTicking = !1;
	    const {
	        trackingPoints: n
	      } = this,
	      s = n[0],
	      o = n[n.length - 1];
	    let a = 0,
	      r = 0,
	      l = 0;
	    o && s && (a = o.clientX - s.clientX, r = o.clientY - s.clientY, l = o.time - s.time);
	    const c = (null === (e = window.visualViewport) || void 0 === e ? void 0 : e.scale) || 1;
	    1 !== c && (a *= c, r *= c);
	    let h = 0,
	      d = 0,
	      u = 0,
	      p = 0,
	      f = this.option("decelFriction");
	    const g = this.targetScale;
	    if (l > 0) {
	      u = Math.abs(a) > 3 ? a / (l / 30) : 0, p = Math.abs(r) > 3 ? r / (l / 30) : 0;
	      const t = this.option("maxVelocity");
	      t && (u = Math.max(Math.min(u, t), -1 * t), p = Math.max(Math.min(p, t), -1 * t));
	    }
	    u && (h = u / (1 / (1 - f) - 1)), p && (d = p / (1 / (1 - f) - 1)), ("y" === this.option("lockAxis") || "xy" === this.option("lockAxis") && "y" === this.lockedAxis && t(g) === this.minScale) && (h = u = 0), ("x" === this.option("lockAxis") || "xy" === this.option("lockAxis") && "x" === this.lockedAxis && t(g) === this.minScale) && (d = p = 0);
	    const m = this.dragOffset.x,
	      b = this.dragOffset.y,
	      y = this.option("dragMinThreshold") || 0;
	    Math.abs(m) < y && Math.abs(b) < y && (h = d = 0, u = p = 0), (this.option("zoom") && (g < this.minScale - 1e-5 || g > this.maxScale + 1e-5) || i && !h && !d) && (f = .35), this.applyChange({
	      panX: h,
	      panY: d,
	      friction: f
	    }), this.emit("decel", u, p, m, b);
	  }
	  onWheel(t) {
	    var e = [-t.deltaX || 0, -t.deltaY || 0, -t.detail || 0].reduce(function (t, e) {
	      return Math.abs(e) > Math.abs(t) ? e : t;
	    });
	    const i = Math.max(-1, Math.min(1, e));
	    if (this.emit("wheel", t, i), this.panMode === O) return;
	    if (t.defaultPrevented) return;
	    const n = this.option("wheel");
	    "pan" === n ? (t.preventDefault(), this.panOnlyZoomed && !this.canZoomOut() || this.applyChange({
	      panX: 2 * -t.deltaX,
	      panY: 2 * -t.deltaY,
	      bounce: !1
	    })) : "zoom" === n && !1 !== this.option("zoom") && this.zoomWithWheel(t);
	  }
	  onMouseMove(t) {
	    this.panWithMouse(t);
	  }
	  onKeydown(t) {
	    "Escape" === t.key && this.toggleFS();
	  }
	  onResize() {
	    this.updateMetrics(), this.checkBounds().inBounds || this.requestTick();
	  }
	  setTransform() {
	    this.emit("beforeTransform");
	    const {
	        current: e,
	        target: i,
	        content: n,
	        contentRect: s
	      } = this,
	      o = Object.assign({}, C);
	    for (const n of v) {
	      const s = "e" == n || "f" === n ? M : T;
	      o[n] = t(e[n], s), Math.abs(i[n] - e[n]) < ("e" == n || "f" === n ? .51 : .001) && (e[n] = i[n]);
	    }
	    let {
	        a: a,
	        b: r,
	        c: l,
	        d: c,
	        e: h,
	        f: d
	      } = o,
	      u = `matrix(${a}, ${r}, ${l}, ${c}, ${h}, ${d})`,
	      p = n.parentElement instanceof HTMLPictureElement ? n.parentElement : n;
	    if (this.option("transformParent") && (p = p.parentElement || p), p.style.transform === u) return;
	    p.style.transform = u;
	    const {
	      contentWidth: f,
	      contentHeight: g
	    } = this.calculateContentDim();
	    s.width = f, s.height = g, this.emit("afterTransform");
	  }
	  updateMetrics(e = !1) {
	    var i;
	    if (!this || this.state === m.Destroy) return;
	    if (this.isContentLoading) return;
	    const n = Math.max(1, (null === (i = window.visualViewport) || void 0 === i ? void 0 : i.scale) || 1),
	      {
	        container: s,
	        content: o
	      } = this,
	      a = o instanceof HTMLImageElement,
	      r = s.getBoundingClientRect(),
	      l = getComputedStyle(this.container);
	    let c = r.width * n,
	      h = r.height * n;
	    const d = parseFloat(l.paddingTop) + parseFloat(l.paddingBottom),
	      u = c - (parseFloat(l.paddingLeft) + parseFloat(l.paddingRight)),
	      p = h - d;
	    this.containerRect = {
	      width: c,
	      height: h,
	      innerWidth: u,
	      innerHeight: p
	    };
	    const f = parseFloat(o.dataset.width || "") || (t => {
	        let e = 0;
	        return e = t instanceof HTMLImageElement ? t.naturalWidth : t instanceof SVGElement ? t.width.baseVal.value : Math.max(t.offsetWidth, t.scrollWidth), e || 0;
	      })(o),
	      g = parseFloat(o.dataset.height || "") || (t => {
	        let e = 0;
	        return e = t instanceof HTMLImageElement ? t.naturalHeight : t instanceof SVGElement ? t.height.baseVal.value : Math.max(t.offsetHeight, t.scrollHeight), e || 0;
	      })(o);
	    let v = this.option("width", f) || z,
	      b = this.option("height", g) || z;
	    const y = v === z,
	      w = b === z;
	    "number" != typeof v && (v = f), "number" != typeof b && (b = g), y && (v = f * (b / g)), w && (b = g / (f / v));
	    let x = o.parentElement instanceof HTMLPictureElement ? o.parentElement : o;
	    this.option("transformParent") && (x = x.parentElement || x);
	    const E = x.getAttribute("style") || "";
	    x.style.setProperty("transform", "none", "important"), a && (x.style.width = "", x.style.height = ""), x.offsetHeight;
	    const S = o.getBoundingClientRect();
	    let P = S.width * n,
	      C = S.height * n,
	      T = P,
	      M = C;
	    P = Math.min(P, v), C = Math.min(C, b), a ? ({
	      width: P,
	      height: C
	    } = ((t, e, i, n) => {
	      const s = i / t,
	        o = n / e,
	        a = Math.min(s, o);
	      return {
	        width: t *= a,
	        height: e *= a
	      };
	    })(v, b, P, C)) : (P = Math.min(P, v), C = Math.min(C, b));
	    let O = .5 * (M - C),
	      A = .5 * (T - P);
	    this.contentRect = Object.assign(Object.assign({}, this.contentRect), {
	      top: S.top - r.top + O,
	      bottom: r.bottom - S.bottom + O,
	      left: S.left - r.left + A,
	      right: r.right - S.right + A,
	      fitWidth: P,
	      fitHeight: C,
	      width: P,
	      height: C,
	      fullWidth: v,
	      fullHeight: b
	    }), x.style.cssText = E, a && (x.style.width = `${P}px`, x.style.height = `${C}px`), this.setTransform(), !0 !== e && this.emit("refresh"), this.ignoreBounds || (t(this.targetScale) < t(this.minScale) ? this.zoomTo(this.minScale, {
	      friction: 0
	    }) : this.targetScale > this.maxScale ? this.zoomTo(this.maxScale, {
	      friction: 0
	    }) : this.state === m.Init || this.checkBounds().inBounds || this.requestTick()), this.updateControls();
	  }
	  calculateBounds() {
	    const {
	        contentWidth: e,
	        contentHeight: i
	      } = this.calculateContentDim(this.target),
	      {
	        targetScale: n,
	        lockedAxis: s
	      } = this,
	      {
	        fitWidth: o,
	        fitHeight: a
	      } = this.contentRect;
	    let r = 0,
	      l = 0,
	      c = 0,
	      h = 0;
	    const d = this.option("infinite");
	    if (!0 === d || s && d === s) r = -1 / 0, c = 1 / 0, l = -1 / 0, h = 1 / 0;else {
	      let {
	          containerRect: s,
	          contentRect: d
	        } = this,
	        u = t(o * n, M),
	        p = t(a * n, M),
	        {
	          innerWidth: f,
	          innerHeight: g
	        } = s;
	      if (s.width === u && (f = s.width), s.width === p && (g = s.height), e > f) {
	        c = .5 * (e - f), r = -1 * c;
	        let t = .5 * (d.right - d.left);
	        r += t, c += t;
	      }
	      if (o > f && e < f && (r -= .5 * (o - f), c -= .5 * (o - f)), i > g) {
	        h = .5 * (i - g), l = -1 * h;
	        let t = .5 * (d.bottom - d.top);
	        l += t, h += t;
	      }
	      a > g && i < g && (r -= .5 * (a - g), c -= .5 * (a - g));
	    }
	    return {
	      x: {
	        min: r,
	        max: c
	      },
	      y: {
	        min: l,
	        max: h
	      }
	    };
	  }
	  getBounds() {
	    const t = this.option("bounds");
	    return t !== z ? t : this.calculateBounds();
	  }
	  updateControls() {
	    const e = this,
	      i = e.container,
	      {
	        panMode: n,
	        contentRect: s,
	        targetScale: a,
	        minScale: r
	      } = e;
	    let l = r,
	      c = e.option("click") || !1;
	    c && (l = e.getNextScale(c));
	    let h = e.canZoomIn(),
	      d = e.canZoomOut(),
	      u = n === A && !!this.option("touch"),
	      p = d && u;
	    if (u && (t(a) < t(r) && !this.panOnlyZoomed && (p = !0), (t(s.width, 1) > t(s.fitWidth, 1) || t(s.height, 1) > t(s.fitHeight, 1)) && (p = !0)), t(s.width * a, 1) < t(s.fitWidth, 1) && (p = !1), n === O && (p = !1), o(i, this.cn("isDraggable"), p), !this.option("zoom")) return;
	    let f = h && t(l) > t(a),
	      g = !f && !p && d && t(l) < t(a);
	    o(i, this.cn("canZoomIn"), f), o(i, this.cn("canZoomOut"), g);
	    for (const t of i.querySelectorAll("[data-panzoom-action]")) {
	      let e = !1,
	        i = !1;
	      switch (t.dataset.panzoomAction) {
	        case "zoomIn":
	          h ? e = !0 : i = !0;
	          break;
	        case "zoomOut":
	          d ? e = !0 : i = !0;
	          break;
	        case "toggleZoom":
	        case "iterateZoom":
	          h || d ? e = !0 : i = !0;
	          const n = t.querySelector("g");
	          n && (n.style.display = h ? "" : "none");
	      }
	      e ? (t.removeAttribute("disabled"), t.removeAttribute("tabindex")) : i && (t.setAttribute("disabled", ""), t.setAttribute("tabindex", "-1"));
	    }
	  }
	  panTo({
	    x: t = this.target.e,
	    y: e = this.target.f,
	    scale: i = this.targetScale,
	    friction: n = this.option("friction"),
	    angle: s = 0,
	    originX: o = 0,
	    originY: a = 0,
	    flipX: r = !1,
	    flipY: l = !1,
	    ignoreBounds: c = !1
	  }) {
	    this.state !== m.Destroy && this.applyChange({
	      panX: t - this.target.e,
	      panY: e - this.target.f,
	      scale: i / this.targetScale,
	      angle: s,
	      originX: o,
	      originY: a,
	      friction: n,
	      flipX: r,
	      flipY: l,
	      ignoreBounds: c
	    });
	  }
	  applyChange({
	    panX: e = 0,
	    panY: i = 0,
	    scale: n = 1,
	    angle: s = 0,
	    originX: o = -this.current.e,
	    originY: a = -this.current.f,
	    friction: r = this.option("friction"),
	    flipX: l = !1,
	    flipY: c = !1,
	    ignoreBounds: h = !1,
	    bounce: d = this.option("bounce")
	  }) {
	    const u = this.state;
	    if (u === m.Destroy) return;
	    this.rAF && (cancelAnimationFrame(this.rAF), this.rAF = null), this.friction = r || 0, this.ignoreBounds = h;
	    const {
	        current: p
	      } = this,
	      f = p.e,
	      g = p.f,
	      b = this.getMatrix(this.target);
	    let y = new DOMMatrix().translate(f, g).translate(o, a).translate(e, i);
	    if (this.option("zoom")) {
	      if (!h) {
	        const t = this.targetScale,
	          e = this.minScale,
	          i = this.maxScale;
	        t * n < e && (n = e / t), t * n > i && (n = i / t);
	      }
	      y = y.scale(n);
	    }
	    y = y.translate(-o, -a).translate(-f, -g).multiply(b), s && (y = y.rotate(s)), l && (y = y.scale(-1, 1)), c && (y = y.scale(1, -1));
	    for (const e of v) "e" !== e && "f" !== e && (y[e] > this.minScale + 1e-5 || y[e] < this.minScale - 1e-5) ? this.target[e] = y[e] : this.target[e] = t(y[e], M);
	    (this.targetScale < this.scale || Math.abs(n - 1) > .1 || this.panMode === O || !1 === d) && !h && this.clampTargetBounds(), u === m.Init ? this.animate() : this.isResting || (this.state = m.Panning, this.requestTick());
	  }
	  stop(t = !1) {
	    if (this.state === m.Init || this.state === m.Destroy) return;
	    const e = this.isTicking;
	    this.rAF && (cancelAnimationFrame(this.rAF), this.rAF = null), this.isBouncingX = !1, this.isBouncingY = !1;
	    for (const e of v) this.velocity[e] = 0, "current" === t ? this.current[e] = this.target[e] : "target" === t && (this.target[e] = this.current[e]);
	    this.setTransform(), S(this.container, "is-scaling"), S(this.container, "is-animating"), this.isTicking = !1, this.state = m.Ready, e && (this.emit("endAnimation"), this.updateControls());
	  }
	  requestTick() {
	    this.isTicking || (this.emit("startAnimation"), this.updateControls(), P(this.container, "is-animating"), this.isScaling && P(this.container, "is-scaling")), this.isTicking = !0, this.rAF || (this.rAF = requestAnimationFrame(() => this.animate()));
	  }
	  panWithMouse(e, i = this.option("mouseMoveFriction")) {
	    if (this.pmme = e, this.panMode !== O || !e) return;
	    if (t(this.targetScale) <= t(this.minScale)) return;
	    this.emit("mouseMove", e);
	    const {
	        container: n,
	        containerRect: s,
	        contentRect: o
	      } = this,
	      a = s.width,
	      r = s.height,
	      l = n.getBoundingClientRect(),
	      c = (e.clientX || 0) - l.left,
	      h = (e.clientY || 0) - l.top;
	    let {
	      contentWidth: d,
	      contentHeight: u
	    } = this.calculateContentDim(this.target);
	    const p = this.option("mouseMoveFactor");
	    p > 1 && (d !== a && (d *= p), u !== r && (u *= p));
	    let f = .5 * (d - a) - c / a * 100 / 100 * (d - a);
	    f += .5 * (o.right - o.left);
	    let g = .5 * (u - r) - h / r * 100 / 100 * (u - r);
	    g += .5 * (o.bottom - o.top), this.applyChange({
	      panX: f - this.target.e,
	      panY: g - this.target.f,
	      friction: i
	    });
	  }
	  zoomWithWheel(e) {
	    if (this.state === m.Destroy || this.state === m.Init) return;
	    const i = Date.now();
	    if (i - this.pwt < 45) return void e.preventDefault();
	    this.pwt = i;
	    var n = [-e.deltaX || 0, -e.deltaY || 0, -e.detail || 0].reduce(function (t, e) {
	      return Math.abs(e) > Math.abs(t) ? e : t;
	    });
	    const s = Math.max(-1, Math.min(1, n)),
	      {
	        targetScale: o,
	        maxScale: a,
	        minScale: r
	      } = this;
	    let l = o * (100 + 45 * s) / 100;
	    t(l) < t(r) && t(o) <= t(r) ? (this.cwd += Math.abs(s), l = r) : t(l) > t(a) && t(o) >= t(a) ? (this.cwd += Math.abs(s), l = a) : (this.cwd = 0, l = Math.max(Math.min(l, a), r)), this.cwd > this.option("wheelLimit") || (e.preventDefault(), t(l) !== t(o) && this.zoomTo(l, {
	      event: e
	    }));
	  }
	  canZoomIn() {
	    return this.option("zoom") && (t(this.contentRect.width, 1) < t(this.contentRect.fitWidth, 1) || t(this.targetScale) < t(this.maxScale));
	  }
	  canZoomOut() {
	    return this.option("zoom") && t(this.targetScale) > t(this.minScale);
	  }
	  zoomIn(t = 1.25, e) {
	    this.zoomTo(this.targetScale * t, e);
	  }
	  zoomOut(t = .8, e) {
	    this.zoomTo(this.targetScale * t, e);
	  }
	  zoomToFit(t) {
	    this.zoomTo("fit", t);
	  }
	  zoomToCover(t) {
	    this.zoomTo("cover", t);
	  }
	  zoomToFull(t) {
	    this.zoomTo("full", t);
	  }
	  zoomToMax(t) {
	    this.zoomTo("max", t);
	  }
	  toggleZoom(t) {
	    this.zoomTo(this.getNextScale("toggleZoom"), t);
	  }
	  toggleMax(t) {
	    this.zoomTo(this.getNextScale("toggleMax"), t);
	  }
	  toggleCover(t) {
	    this.zoomTo(this.getNextScale("toggleCover"), t);
	  }
	  iterateZoom(t) {
	    this.zoomTo("next", t);
	  }
	  zoomTo(t = 1, {
	    friction: e = z,
	    originX: i = z,
	    originY: n = z,
	    event: s
	  } = {}) {
	    if (this.isContentLoading || this.state === m.Destroy) return;
	    const {
	      targetScale: o,
	      fullScale: a,
	      maxScale: r,
	      coverScale: l
	    } = this;
	    if (this.stop(), this.panMode === O && (s = this.pmme || s), s || i === z || n === z) {
	      const t = this.content.getBoundingClientRect(),
	        e = this.container.getBoundingClientRect(),
	        o = s ? s.clientX : e.left + .5 * e.width,
	        a = s ? s.clientY : e.top + .5 * e.height;
	      i = o - t.left - .5 * t.width, n = a - t.top - .5 * t.height;
	    }
	    let c = 1;
	    "number" == typeof t ? c = t : "full" === t ? c = a : "cover" === t ? c = l : "max" === t ? c = r : "fit" === t ? c = 1 : "next" === t && (c = this.getNextScale("iterateZoom")), c = c / o || 1, e = e === z ? c > 1 ? .15 : .25 : e, this.applyChange({
	      scale: c,
	      originX: i,
	      originY: n,
	      friction: e
	    }), s && this.panMode === O && this.panWithMouse(s, e);
	  }
	  rotateCCW() {
	    this.applyChange({
	      angle: -90
	    });
	  }
	  rotateCW() {
	    this.applyChange({
	      angle: 90
	    });
	  }
	  flipX() {
	    this.applyChange({
	      flipX: !0
	    });
	  }
	  flipY() {
	    this.applyChange({
	      flipY: !0
	    });
	  }
	  fitX() {
	    this.stop("target");
	    const {
	      containerRect: t,
	      contentRect: e,
	      target: i
	    } = this;
	    this.applyChange({
	      panX: .5 * t.width - (e.left + .5 * e.fitWidth) - i.e,
	      panY: .5 * t.height - (e.top + .5 * e.fitHeight) - i.f,
	      scale: t.width / e.fitWidth / this.targetScale,
	      originX: 0,
	      originY: 0,
	      ignoreBounds: !0
	    });
	  }
	  fitY() {
	    this.stop("target");
	    const {
	      containerRect: t,
	      contentRect: e,
	      target: i
	    } = this;
	    this.applyChange({
	      panX: .5 * t.width - (e.left + .5 * e.fitWidth) - i.e,
	      panY: .5 * t.innerHeight - (e.top + .5 * e.fitHeight) - i.f,
	      scale: t.height / e.fitHeight / this.targetScale,
	      originX: 0,
	      originY: 0,
	      ignoreBounds: !0
	    });
	  }
	  toggleFS() {
	    const {
	        container: t
	      } = this,
	      e = this.cn("inFullscreen"),
	      i = this.cn("htmlHasFullscreen");
	    t.classList.toggle(e);
	    const n = t.classList.contains(e);
	    n ? (document.documentElement.classList.add(i), document.addEventListener("keydown", this.onKeydown, !0)) : (document.documentElement.classList.remove(i), document.removeEventListener("keydown", this.onKeydown, !0)), this.updateMetrics(), this.emit(n ? "enterFS" : "exitFS");
	  }
	  getMatrix(t = this.current) {
	    const {
	      a: e,
	      b: i,
	      c: n,
	      d: s,
	      e: o,
	      f: a
	    } = t;
	    return new DOMMatrix([e, i, n, s, o, a]);
	  }
	  reset(t) {
	    if (this.state !== m.Init && this.state !== m.Destroy) {
	      this.stop("current");
	      for (const t of v) this.target[t] = C[t];
	      this.target.a = this.minScale, this.target.d = this.minScale, this.clampTargetBounds(), this.isResting || (this.friction = void 0 === t ? this.option("friction") : t, this.state = m.Panning, this.requestTick());
	    }
	  }
	  destroy() {
	    this.stop(), this.state = m.Destroy, this.detachEvents(), this.detachObserver();
	    const {
	        container: t,
	        content: e
	      } = this,
	      i = this.option("classes") || {};
	    for (const e of Object.values(i)) t.classList.remove(e + "");
	    e && (e.removeEventListener("load", this.onLoad), e.removeEventListener("error", this.onError)), this.detachPlugins();
	  }
	}
	Object.defineProperty(I, "defaults", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: y
	}), Object.defineProperty(I, "Plugins", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: {}
	});
	const D = function (t, e) {
	    let i = !0;
	    return (...n) => {
	      i && (i = !1, t(...n), setTimeout(() => {
	        i = !0;
	      }, e));
	    };
	  },
	  F = (t, e) => {
	    let i = [];
	    return t.childNodes.forEach(t => {
	      t.nodeType !== Node.ELEMENT_NODE || e && !t.matches(e) || i.push(t);
	    }), i;
	  },
	  j = {
	    viewport: null,
	    track: null,
	    enabled: !0,
	    slides: [],
	    axis: "x",
	    transition: "fade",
	    preload: 1,
	    slidesPerPage: "auto",
	    initialPage: 0,
	    friction: .12,
	    Panzoom: {
	      decelFriction: .12
	    },
	    center: !0,
	    infinite: !0,
	    fill: !0,
	    dragFree: !1,
	    adaptiveHeight: !1,
	    direction: "ltr",
	    classes: {
	      container: "f-carousel",
	      viewport: "f-carousel__viewport",
	      track: "f-carousel__track",
	      slide: "f-carousel__slide",
	      isLTR: "is-ltr",
	      isRTL: "is-rtl",
	      isHorizontal: "is-horizontal",
	      isVertical: "is-vertical",
	      inTransition: "in-transition",
	      isSelected: "is-selected"
	    },
	    l10n: {
	      NEXT: "Next slide",
	      PREV: "Previous slide",
	      GOTO: "Go to slide #%d"
	    }
	  };
	var B;
	!function (t) {
	  t[t.Init = 0] = "Init", t[t.Ready = 1] = "Ready", t[t.Destroy = 2] = "Destroy";
	}(B || (B = {}));
	const H = t => {
	    if ("string" == typeof t || t instanceof HTMLElement) t = {
	      html: t
	    };else {
	      const e = t.thumb;
	      void 0 !== e && ("string" == typeof e && (t.thumbSrc = e), e instanceof HTMLImageElement && (t.thumbEl = e, t.thumbElSrc = e.src, t.thumbSrc = e.src), delete t.thumb);
	    }
	    return Object.assign({
	      html: "",
	      el: null,
	      isDom: !1,
	      class: "",
	      customClass: "",
	      index: -1,
	      dim: 0,
	      gap: 0,
	      pos: 0,
	      transition: !1
	    }, t);
	  },
	  N = (t = {}) => Object.assign({
	    index: -1,
	    slides: [],
	    dim: 0,
	    pos: -1
	  }, t);
	class _ extends f {
	  constructor(t, e) {
	    super(e), Object.defineProperty(this, "instance", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: t
	    });
	  }
	  attach() {}
	  detach() {}
	}
	const $ = {
	  classes: {
	    list: "f-carousel__dots",
	    isDynamic: "is-dynamic",
	    hasDots: "has-dots",
	    dot: "f-carousel__dot",
	    isBeforePrev: "is-before-prev",
	    isPrev: "is-prev",
	    isCurrent: "is-current",
	    isNext: "is-next",
	    isAfterNext: "is-after-next"
	  },
	  dotTpl: '<button type="button" data-carousel-page="%i" aria-label="{{GOTO}}"><span class="f-carousel__dot" aria-hidden="true"></span></button>',
	  dynamicFrom: 11,
	  maxCount: 1 / 0,
	  minCount: 2
	};
	class W extends _ {
	  constructor() {
	    super(...arguments), Object.defineProperty(this, "isDynamic", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: !1
	    }), Object.defineProperty(this, "list", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    });
	  }
	  onRefresh() {
	    this.refresh();
	  }
	  build() {
	    let t = this.list;
	    if (!t) {
	      t = document.createElement("ul"), P(t, this.cn("list")), t.setAttribute("role", "tablist");
	      const e = this.instance.container;
	      e.appendChild(t), P(e, this.cn("hasDots")), this.list = t;
	    }
	    return t;
	  }
	  refresh() {
	    var t;
	    const e = this.instance.pages.length,
	      i = Math.min(2, this.option("minCount")),
	      n = Math.max(2e3, this.option("maxCount")),
	      s = this.option("dynamicFrom");
	    if (e < i || e > n) return void this.cleanup();
	    const a = "number" == typeof s && e > 5 && e >= s,
	      r = !this.list || this.isDynamic !== a || this.list.children.length !== e;
	    r && this.cleanup();
	    const l = this.build();
	    if (o(l, this.cn("isDynamic"), !!a), r) for (let t = 0; t < e; t++) l.append(this.createItem(t));
	    let c,
	      h = 0;
	    for (const e of [...l.children]) {
	      const i = h === this.instance.page;
	      i && (c = e), o(e, this.cn("isCurrent"), i), null === (t = e.children[0]) || void 0 === t || t.setAttribute("aria-selected", i ? "true" : "false");
	      for (const t of ["isBeforePrev", "isPrev", "isNext", "isAfterNext"]) S(e, this.cn(t));
	      h++;
	    }
	    if (c = c || l.firstChild, a && c) {
	      const t = c.previousElementSibling,
	        e = t && t.previousElementSibling;
	      P(t, this.cn("isPrev")), P(e, this.cn("isBeforePrev"));
	      const i = c.nextElementSibling,
	        n = i && i.nextElementSibling;
	      P(i, this.cn("isNext")), P(n, this.cn("isAfterNext"));
	    }
	    this.isDynamic = a;
	  }
	  createItem(t = 0) {
	    var e;
	    const i = document.createElement("li");
	    i.setAttribute("role", "presentation");
	    const s = n(this.instance.localize(this.option("dotTpl"), [["%d", t + 1]]).replace(/\%i/g, t + ""));
	    return i.appendChild(s), null === (e = i.children[0]) || void 0 === e || e.setAttribute("role", "tab"), i;
	  }
	  cleanup() {
	    this.list && (this.list.remove(), this.list = null), this.isDynamic = !1, S(this.instance.container, this.cn("hasDots"));
	  }
	  attach() {
	    this.instance.on(["refresh", "change"], this.onRefresh);
	  }
	  detach() {
	    this.instance.off(["refresh", "change"], this.onRefresh), this.cleanup();
	  }
	}
	Object.defineProperty(W, "defaults", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: $
	});
	const X = "disabled",
	  q = "next",
	  Y = "prev";
	class V extends _ {
	  constructor() {
	    super(...arguments), Object.defineProperty(this, "container", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "prev", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "next", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "isDom", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: !1
	    });
	  }
	  onRefresh() {
	    const t = this.instance,
	      e = t.pages.length,
	      i = t.page;
	    if (e < 2) return void this.cleanup();
	    this.build();
	    let n = this.prev,
	      s = this.next;
	    n && s && (n.removeAttribute(X), s.removeAttribute(X), t.isInfinite || (i <= 0 && n.setAttribute(X, ""), i >= e - 1 && s.setAttribute(X, "")));
	  }
	  addBtn(t) {
	    var e;
	    const i = this.instance,
	      n = document.createElement("button");
	    n.setAttribute("tabindex", "0"), n.setAttribute("title", i.localize(`{{${t.toUpperCase()}}}`)), P(n, this.cn("button") + " " + this.cn(t === q ? "isNext" : "isPrev"));
	    const s = i.isRTL ? t === q ? Y : q : t;
	    var o;
	    return n.innerHTML = i.localize(this.option(`${s}Tpl`)), n.dataset[`carousel${(o = t, o ? o.match("^[a-z]") ? o.charAt(0).toUpperCase() + o.substring(1) : o : "")}`] = "true", null === (e = this.container) || void 0 === e || e.appendChild(n), n;
	  }
	  build() {
	    const t = this.instance.container,
	      e = this.cn("container");
	    let {
	      container: i,
	      prev: n,
	      next: s
	    } = this;
	    i || (i = t.querySelector("." + e), this.isDom = !!i), i || (i = document.createElement("div"), P(i, e), t.appendChild(i)), this.container = i, s || (s = i.querySelector("[data-carousel-next]")), s || (s = this.addBtn(q)), this.next = s, n || (n = i.querySelector("[data-carousel-prev]")), n || (n = this.addBtn(Y)), this.prev = n;
	  }
	  cleanup() {
	    this.isDom || (this.prev && this.prev.remove(), this.next && this.next.remove(), this.container && this.container.remove()), this.prev = null, this.next = null, this.container = null, this.isDom = !1;
	  }
	  attach() {
	    this.instance.on(["refresh", "change"], this.onRefresh);
	  }
	  detach() {
	    this.instance.off(["refresh", "change"], this.onRefresh), this.cleanup();
	  }
	}
	Object.defineProperty(V, "defaults", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: {
	    classes: {
	      container: "f-carousel__nav",
	      button: "f-button",
	      isNext: "is-next",
	      isPrev: "is-prev"
	    },
	    nextTpl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M9 3l9 9-9 9"/></svg>',
	    prevTpl: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M15 3l-9 9 9 9"/></svg>'
	  }
	});
	class Z extends _ {
	  constructor() {
	    super(...arguments), Object.defineProperty(this, "selectedIndex", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "target", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "nav", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    });
	  }
	  addAsTargetFor(t) {
	    this.target = this.instance, this.nav = t, this.attachEvents();
	  }
	  addAsNavFor(t) {
	    this.nav = this.instance, this.target = t, this.attachEvents();
	  }
	  attachEvents() {
	    const {
	      nav: t,
	      target: e
	    } = this;
	    t && e && (t.options.initialSlide = e.options.initialPage, t.state === B.Ready ? this.onNavReady(t) : t.on("ready", this.onNavReady), e.state === B.Ready ? this.onTargetReady(e) : e.on("ready", this.onTargetReady));
	  }
	  onNavReady(t) {
	    t.on("createSlide", this.onNavCreateSlide), t.on("Panzoom.click", this.onNavClick), t.on("Panzoom.touchEnd", this.onNavTouch), this.onTargetChange();
	  }
	  onTargetReady(t) {
	    t.on("change", this.onTargetChange), t.on("Panzoom.refresh", this.onTargetChange), this.onTargetChange();
	  }
	  onNavClick(t, e, i) {
	    this.onNavTouch(t, t.panzoom, i);
	  }
	  onNavTouch(t, e, i) {
	    var n, s;
	    if (Math.abs(e.dragOffset.x) > 3 || Math.abs(e.dragOffset.y) > 3) return;
	    const o = i.target,
	      {
	        nav: a,
	        target: r
	      } = this;
	    if (!a || !r || !o) return;
	    const l = o.closest("[data-index]");
	    if (i.stopPropagation(), i.preventDefault(), !l) return;
	    const c = parseInt(l.dataset.index || "", 10) || 0,
	      h = r.getPageForSlide(c),
	      d = a.getPageForSlide(c);
	    a.slideTo(d), r.slideTo(h, {
	      friction: (null === (s = null === (n = this.nav) || void 0 === n ? void 0 : n.plugins) || void 0 === s ? void 0 : s.Sync.option("friction")) || 0
	    }), this.markSelectedSlide(c);
	  }
	  onNavCreateSlide(t, e) {
	    e.index === this.selectedIndex && this.markSelectedSlide(e.index);
	  }
	  onTargetChange() {
	    var t, e;
	    const {
	      target: i,
	      nav: n
	    } = this;
	    if (!i || !n) return;
	    if (n.state !== B.Ready || i.state !== B.Ready) return;
	    const s = null === (e = null === (t = i.pages[i.page]) || void 0 === t ? void 0 : t.slides[0]) || void 0 === e ? void 0 : e.index,
	      o = n.getPageForSlide(s);
	    this.markSelectedSlide(s), n.slideTo(o, null === n.prevPage && null === i.prevPage ? {
	      friction: 0
	    } : void 0);
	  }
	  markSelectedSlide(t) {
	    const e = this.nav;
	    e && e.state === B.Ready && (this.selectedIndex = t, [...e.slides].map(e => {
	      e.el && e.el.classList[e.index === t ? "add" : "remove"]("is-nav-selected");
	    }));
	  }
	  attach() {
	    const t = this;
	    let e = t.options.target,
	      i = t.options.nav;
	    e ? t.addAsNavFor(e) : i && t.addAsTargetFor(i);
	  }
	  detach() {
	    const t = this,
	      e = t.nav,
	      i = t.target;
	    e && (e.off("ready", t.onNavReady), e.off("createSlide", t.onNavCreateSlide), e.off("Panzoom.click", t.onNavClick), e.off("Panzoom.touchEnd", t.onNavTouch)), t.nav = null, i && (i.off("ready", t.onTargetReady), i.off("refresh", t.onTargetChange), i.off("change", t.onTargetChange)), t.target = null;
	  }
	}
	Object.defineProperty(Z, "defaults", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: {
	    friction: .35
	  }
	});
	const U = {
	    Navigation: V,
	    Dots: W,
	    Sync: Z
	  },
	  G = "animationend",
	  K = "isSelected",
	  J = "slide";
	class Q extends g {
	  get axis() {
	    return this.isHorizontal ? "e" : "f";
	  }
	  get isEnabled() {
	    return this.state === B.Ready;
	  }
	  get isInfinite() {
	    let t = !1;
	    const {
	        contentDim: e,
	        viewportDim: i,
	        pages: n,
	        slides: s
	      } = this,
	      o = s[0];
	    return n.length >= 2 && o && e + o.dim >= i && (t = this.option("infinite")), t;
	  }
	  get isRTL() {
	    return "rtl" === this.option("direction");
	  }
	  get isHorizontal() {
	    return "x" === this.option("axis");
	  }
	  constructor(t, e = {}, i = {}) {
	    if (super(), Object.defineProperty(this, "bp", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: ""
	    }), Object.defineProperty(this, "lp", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: 0
	    }), Object.defineProperty(this, "userOptions", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: {}
	    }), Object.defineProperty(this, "userPlugins", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: {}
	    }), Object.defineProperty(this, "state", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: B.Init
	    }), Object.defineProperty(this, "page", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: 0
	    }), Object.defineProperty(this, "prevPage", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "container", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: void 0
	    }), Object.defineProperty(this, "viewport", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "track", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "slides", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: []
	    }), Object.defineProperty(this, "pages", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: []
	    }), Object.defineProperty(this, "panzoom", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "inTransition", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: new Set()
	    }), Object.defineProperty(this, "contentDim", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: 0
	    }), Object.defineProperty(this, "viewportDim", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: 0
	    }), "string" == typeof t && (t = document.querySelector(t)), !t || !E(t)) throw new Error("No Element found");
	    this.container = t, this.slideNext = D(this.slideNext.bind(this), 150), this.slidePrev = D(this.slidePrev.bind(this), 150), this.userOptions = e, this.userPlugins = i, queueMicrotask(() => {
	      this.processOptions();
	    });
	  }
	  processOptions() {
	    var t, e;
	    const i = u({}, Q.defaults, this.userOptions);
	    let n = "";
	    const s = i.breakpoints;
	    if (s && d(s)) for (const [t, e] of Object.entries(s)) window.matchMedia(t).matches && d(e) && (n += t, u(i, e));
	    n === this.bp && this.state !== B.Init || (this.bp = n, this.state === B.Ready && (i.initialSlide = (null === (e = null === (t = this.pages[this.page]) || void 0 === t ? void 0 : t.slides[0]) || void 0 === e ? void 0 : e.index) || 0), this.state !== B.Init && this.destroy(), super.setOptions(i), !1 === this.option("enabled") ? this.attachEvents() : setTimeout(() => {
	      this.init();
	    }, 0));
	  }
	  init() {
	    this.state = B.Init, this.emit("init"), this.attachPlugins(Object.assign(Object.assign({}, Q.Plugins), this.userPlugins)), this.emit("attachPlugins"), this.initLayout(), this.initSlides(), this.updateMetrics(), this.setInitialPosition(), this.initPanzoom(), this.attachEvents(), this.state = B.Ready, this.emit("ready");
	  }
	  initLayout() {
	    const {
	        container: t
	      } = this,
	      e = this.option("classes");
	    P(t, this.cn("container")), o(t, e.isLTR, !this.isRTL), o(t, e.isRTL, this.isRTL), o(t, e.isVertical, !this.isHorizontal), o(t, e.isHorizontal, this.isHorizontal);
	    let i = this.option("viewport") || t.querySelector(`.${e.viewport}`);
	    i || (i = document.createElement("div"), P(i, e.viewport), i.append(...F(t, `.${e.slide}`)), t.prepend(i)), i.addEventListener("scroll", this.onScroll);
	    let n = this.option("track") || t.querySelector(`.${e.track}`);
	    n || (n = document.createElement("div"), P(n, e.track), n.append(...Array.from(i.childNodes))), n.setAttribute("aria-live", "polite"), i.contains(n) || i.prepend(n), this.viewport = i, this.track = n, this.emit("initLayout");
	  }
	  initSlides() {
	    const {
	      track: t
	    } = this;
	    if (!t) return;
	    const e = [...this.slides],
	      i = [];
	    [...F(t, `.${this.cn(J)}`)].forEach(t => {
	      if (E(t)) {
	        const e = H({
	          el: t,
	          isDom: !0,
	          index: this.slides.length
	        });
	        i.push(e);
	      }
	    });
	    for (let t of [...(this.option("slides", []) || []), ...e]) i.push(H(t));
	    this.slides = i;
	    for (let t = 0; t < this.slides.length; t++) this.slides[t].index = t;
	    for (const t of i) this.emit("beforeInitSlide", t, t.index), this.emit("initSlide", t, t.index);
	    this.emit("initSlides");
	  }
	  setInitialPage() {
	    const t = this.option("initialSlide");
	    this.page = "number" == typeof t ? this.getPageForSlide(t) : parseInt(this.option("initialPage", 0) + "", 10) || 0;
	  }
	  setInitialPosition() {
	    const {
	      track: t,
	      pages: e,
	      isHorizontal: i
	    } = this;
	    if (!t || !e.length) return;
	    let n = this.page;
	    e[n] || (this.page = n = 0);
	    const s = (e[n].pos || 0) * (this.isRTL && i ? 1 : -1),
	      o = i ? `${s}px` : "0",
	      a = i ? "0" : `${s}px`;
	    t.style.transform = `translate3d(${o}, ${a}, 0) scale(1)`, this.option("adaptiveHeight") && this.setViewportHeight();
	  }
	  initPanzoom() {
	    this.panzoom && (this.panzoom.destroy(), this.panzoom = null);
	    const t = this.option("Panzoom") || {};
	    this.panzoom = new I(this.viewport, u({}, {
	      content: this.track,
	      zoom: !1,
	      panOnlyZoomed: !1,
	      lockAxis: this.isHorizontal ? "x" : "y",
	      infinite: this.isInfinite,
	      click: !1,
	      dblClick: !1,
	      touch: t => !(this.pages.length < 2 && !t.options.infinite),
	      bounds: () => this.getBounds(),
	      maxVelocity: t => Math.abs(t.target[this.axis] - t.current[this.axis]) < 2 * this.viewportDim ? 100 : 0
	    }, t)), this.panzoom.on("*", (t, e, ...i) => {
	      this.emit(`Panzoom.${e}`, t, ...i);
	    }), this.panzoom.on("decel", this.onDecel), this.panzoom.on("refresh", this.onRefresh), this.panzoom.on("beforeTransform", this.onBeforeTransform), this.panzoom.on("endAnimation", this.onEndAnimation);
	  }
	  attachEvents() {
	    const t = this.container;
	    t && (t.addEventListener("click", this.onClick, {
	      passive: !1,
	      capture: !1
	    }), t.addEventListener("slideTo", this.onSlideTo)), window.addEventListener("resize", this.onResize);
	  }
	  createPages() {
	    let t = [];
	    const {
	      contentDim: e,
	      viewportDim: i
	    } = this;
	    let n = this.option("slidesPerPage");
	    n = ("auto" === n || e <= i) && !1 !== this.option("fill") ? 1 / 0 : parseFloat(n + "");
	    let s = 0,
	      o = 0,
	      a = 0;
	    for (const e of this.slides) (!t.length || o + e.dim - i > .05 || a >= n) && (t.push(N()), s = t.length - 1, o = 0, a = 0), t[s].slides.push(e), o += e.dim + e.gap, a++;
	    return t;
	  }
	  processPages() {
	    const e = this.pages,
	      {
	        contentDim: i,
	        viewportDim: n,
	        isInfinite: s
	      } = this,
	      o = this.option("center"),
	      a = this.option("fill"),
	      r = a && o && i > n && !s;
	    if (e.forEach((t, e) => {
	      var s;
	      t.index = e, t.pos = (null === (s = t.slides[0]) || void 0 === s ? void 0 : s.pos) || 0, t.dim = 0;
	      for (const [e, i] of t.slides.entries()) t.dim += i.dim, e < t.slides.length - 1 && (t.dim += i.gap);
	      r && t.pos + .5 * t.dim < .5 * n ? t.pos = 0 : r && t.pos + .5 * t.dim >= i - .5 * n ? t.pos = i - n : o && (t.pos += -.5 * (n - t.dim));
	    }), e.forEach(e => {
	      a && !s && i > n && (e.pos = Math.max(e.pos, 0), e.pos = Math.min(e.pos, i - n)), e.pos = t(e.pos, 1e3), e.dim = t(e.dim, 1e3), Math.abs(e.pos) <= .1 && (e.pos = 0);
	    }), s) return e;
	    const l = [];
	    let c;
	    return e.forEach(t => {
	      const e = Object.assign({}, t);
	      c && e.pos === c.pos ? (c.dim += e.dim, c.slides = [...c.slides, ...e.slides]) : (e.index = l.length, c = e, l.push(e));
	    }), l;
	  }
	  getPageFromIndex(t = 0) {
	    const e = this.pages.length;
	    let i;
	    return t = parseInt((t || 0).toString()) || 0, i = this.isInfinite ? (t % e + e) % e : Math.max(Math.min(t, e - 1), 0), i;
	  }
	  getSlideMetrics(e) {
	    var i, n;
	    const s = this.isHorizontal ? "width" : "height";
	    let o = 0,
	      a = 0,
	      r = e.el;
	    const l = !(!r || r.parentNode);
	    if (r ? o = parseFloat(r.dataset[s] || "") || 0 : (r = document.createElement("div"), r.style.visibility = "hidden", (this.track || document.body).prepend(r)), P(r, this.cn(J) + " " + e.class + " " + e.customClass), o) r.style[s] = `${o}px`, r.style["width" === s ? "height" : "width"] = "";else {
	      l && (this.track || document.body).prepend(r), o = r.getBoundingClientRect()[s] * Math.max(1, (null === (i = window.visualViewport) || void 0 === i ? void 0 : i.scale) || 1);
	      let t = r[this.isHorizontal ? "offsetWidth" : "offsetHeight"];
	      t - 1 > o && (o = t);
	    }
	    const c = getComputedStyle(r);
	    return "content-box" === c.boxSizing && (this.isHorizontal ? (o += parseFloat(c.paddingLeft) || 0, o += parseFloat(c.paddingRight) || 0) : (o += parseFloat(c.paddingTop) || 0, o += parseFloat(c.paddingBottom) || 0)), a = parseFloat(c[this.isHorizontal ? "marginRight" : "marginBottom"]) || 0, l ? null === (n = r.parentElement) || void 0 === n || n.removeChild(r) : e.el || r.remove(), {
	      dim: t(o, 1e3),
	      gap: t(a, 1e3)
	    };
	  }
	  getBounds() {
	    const {
	      isInfinite: t,
	      isRTL: e,
	      isHorizontal: i,
	      pages: n
	    } = this;
	    let s = {
	      min: 0,
	      max: 0
	    };
	    if (t) s = {
	      min: -1 / 0,
	      max: 1 / 0
	    };else if (n.length) {
	      const t = n[0].pos,
	        o = n[n.length - 1].pos;
	      s = e && i ? {
	        min: t,
	        max: o
	      } : {
	        min: -1 * o,
	        max: -1 * t
	      };
	    }
	    return {
	      x: i ? s : {
	        min: 0,
	        max: 0
	      },
	      y: i ? {
	        min: 0,
	        max: 0
	      } : s
	    };
	  }
	  repositionSlides() {
	    let e,
	      {
	        isHorizontal: i,
	        isRTL: n,
	        isInfinite: s,
	        viewport: o,
	        viewportDim: a,
	        contentDim: r,
	        page: l,
	        pages: c,
	        slides: h,
	        panzoom: d
	      } = this,
	      u = 0,
	      p = 0,
	      f = 0,
	      g = 0;
	    d ? g = -1 * d.current[this.axis] : c[l] && (g = c[l].pos || 0), e = i ? n ? "right" : "left" : "top", n && i && (g *= -1);
	    for (const i of h) {
	      const n = i.el;
	      n ? ("top" === e ? (n.style.right = "", n.style.left = "") : n.style.top = "", i.index !== u ? n.style[e] = 0 === p ? "" : `${t(p, 1e3)}px` : n.style[e] = "", f += i.dim + i.gap, u++) : p += i.dim + i.gap;
	    }
	    if (s && f && o) {
	      let n = getComputedStyle(o),
	        s = "padding",
	        l = i ? "Right" : "Bottom",
	        c = parseFloat(n[s + (i ? "Left" : "Top")]);
	      g -= c, a += c, a += parseFloat(n[s + l]);
	      for (const i of h) i.el && (t(i.pos) < t(a) && t(i.pos + i.dim + i.gap) < t(g) && t(g) > t(r - a) && (i.el.style[e] = `${t(p + f, 1e3)}px`), t(i.pos + i.gap) >= t(r - a) && t(i.pos) > t(g + a) && t(g) < t(a) && (i.el.style[e] = `-${t(f, 1e3)}px`));
	    }
	    let m,
	      v,
	      b = [...this.inTransition];
	    if (b.length > 1 && (m = c[b[0]], v = c[b[1]]), m && v) {
	      let i = 0;
	      for (const n of h) n.el ? this.inTransition.has(n.index) && m.slides.indexOf(n) < 0 && (n.el.style[e] = `${t(i + (m.pos - v.pos), 1e3)}px`) : i += n.dim + n.gap;
	    }
	  }
	  createSlideEl(t) {
	    const {
	      track: e,
	      slides: i
	    } = this;
	    if (!e || !t) return;
	    if (t.el && t.el.parentNode) return;
	    const n = t.el || document.createElement("div");
	    P(n, this.cn(J)), P(n, t.class), P(n, t.customClass);
	    const s = t.html;
	    s && (s instanceof HTMLElement ? n.appendChild(s) : n.innerHTML = t.html + "");
	    const o = [];
	    i.forEach((t, e) => {
	      t.el && o.push(e);
	    });
	    const a = t.index;
	    let r = null;
	    if (o.length) {
	      r = i[o.reduce((t, e) => Math.abs(e - a) < Math.abs(t - a) ? e : t)];
	    }
	    const l = r && r.el && r.el.parentNode ? r.index < t.index ? r.el.nextSibling : r.el : null;
	    e.insertBefore(n, e.contains(l) ? l : null), t.el = n, this.emit("createSlide", t);
	  }
	  removeSlideEl(t, e = !1) {
	    const i = null == t ? void 0 : t.el;
	    if (!i || !i.parentNode) return;
	    const n = this.cn(K);
	    if (i.classList.contains(n) && (S(i, n), this.emit("unselectSlide", t)), t.isDom && !e) return i.removeAttribute("aria-hidden"), i.removeAttribute("data-index"), void (i.style.left = "");
	    this.emit("removeSlide", t);
	    const s = new CustomEvent(G);
	    i.dispatchEvent(s), t.el && (t.el.remove(), t.el = null);
	  }
	  transitionTo(t = 0, e = this.option("transition")) {
	    var i, n, s, o;
	    if (!e) return !1;
	    const a = this.page,
	      {
	        pages: r,
	        panzoom: l
	      } = this;
	    t = parseInt((t || 0).toString()) || 0;
	    const c = this.getPageFromIndex(t);
	    if (!l || !r[c] || r.length < 2 || Math.abs(((null === (n = null === (i = r[a]) || void 0 === i ? void 0 : i.slides[0]) || void 0 === n ? void 0 : n.dim) || 0) - this.viewportDim) > 1) return !1;
	    let h = t > a ? 1 : -1;
	    this.isInfinite && (0 === a && t === r.length - 1 && (h = -1), a === r.length - 1 && 0 === t && (h = 1));
	    const d = r[c].pos * (this.isRTL ? 1 : -1);
	    if (a === c && Math.abs(d - l.target[this.axis]) < 1) return !1;
	    this.clearTransitions();
	    const u = l.isResting;
	    P(this.container, this.cn("inTransition"));
	    const p = (null === (s = r[a]) || void 0 === s ? void 0 : s.slides[0]) || null,
	      f = (null === (o = r[c]) || void 0 === o ? void 0 : o.slides[0]) || null;
	    this.inTransition.add(f.index), this.createSlideEl(f);
	    let g = p.el,
	      m = f.el;
	    u || e === J || (e = "fadeFast", g = null);
	    const v = this.isRTL ? "next" : "prev",
	      b = this.isRTL ? "prev" : "next";
	    return g && (this.inTransition.add(p.index), p.transition = e, g.addEventListener(G, this.onAnimationEnd), g.classList.add(`f-${e}Out`, `to-${h > 0 ? b : v}`)), m && (f.transition = e, m.addEventListener(G, this.onAnimationEnd), m.classList.add(`f-${e}In`, `from-${h > 0 ? v : b}`)), l.current[this.axis] = d, l.target[this.axis] = d, l.requestTick(), this.onChange(c), !0;
	  }
	  manageSlideVisiblity() {
	    const t = new Set(),
	      e = new Set(),
	      i = this.getVisibleSlides(parseFloat(this.option("preload", 0) + "") || 0);
	    for (const n of this.slides) i.has(n) ? t.add(n) : e.add(n);
	    for (const e of this.inTransition) t.add(this.slides[e]);
	    for (const e of t) this.createSlideEl(e), this.lazyLoadSlide(e);
	    for (const i of e) t.has(i) || this.removeSlideEl(i);
	    this.markSelectedSlides(), this.repositionSlides();
	  }
	  markSelectedSlides() {
	    if (!this.pages[this.page] || !this.pages[this.page].slides) return;
	    const t = "aria-hidden";
	    let e = this.cn(K);
	    if (e) for (const i of this.slides) {
	      const n = i.el;
	      n && (n.dataset.index = `${i.index}`, n.classList.contains("f-thumbs__slide") ? this.getVisibleSlides(0).has(i) ? n.removeAttribute(t) : n.setAttribute(t, "true") : this.pages[this.page].slides.includes(i) ? (n.classList.contains(e) || (P(n, e), this.emit("selectSlide", i)), n.removeAttribute(t)) : (n.classList.contains(e) && (S(n, e), this.emit("unselectSlide", i)), n.setAttribute(t, "true")));
	    }
	  }
	  flipInfiniteTrack() {
	    const {
	        axis: t,
	        isHorizontal: e,
	        isInfinite: i,
	        isRTL: n,
	        viewportDim: s,
	        contentDim: o
	      } = this,
	      a = this.panzoom;
	    if (!a || !i) return;
	    let r = a.current[t],
	      l = a.target[t] - r,
	      c = 0,
	      h = .5 * s;
	    n && e ? (r < -h && (c = -1, r += o), r > o - h && (c = 1, r -= o)) : (r > h && (c = 1, r -= o), r < -o + h && (c = -1, r += o)), c && (a.current[t] = r, a.target[t] = r + l);
	  }
	  lazyLoadImg(t, e) {
	    const i = this,
	      s = "f-fadeIn",
	      o = "is-preloading";
	    let a = !1,
	      r = null;
	    const l = () => {
	      a || (a = !0, r && (r.remove(), r = null), S(e, o), e.complete && (P(e, s), setTimeout(() => {
	        S(e, s);
	      }, 350)), this.option("adaptiveHeight") && t.el && this.pages[this.page].slides.indexOf(t) > -1 && (i.updateMetrics(), i.setViewportHeight()), this.emit("load", t));
	    };
	    P(e, o), e.src = e.dataset.lazySrcset || e.dataset.lazySrc || "", delete e.dataset.lazySrc, delete e.dataset.lazySrcset, e.addEventListener("error", () => {
	      l();
	    }), e.addEventListener("load", () => {
	      l();
	    }), setTimeout(() => {
	      const i = e.parentNode;
	      i && t.el && (e.complete ? l() : a || (r = n(x), i.insertBefore(r, e)));
	    }, 300);
	  }
	  lazyLoadSlide(t) {
	    const e = t && t.el;
	    if (!e) return;
	    const i = new Set();
	    let n = Array.from(e.querySelectorAll("[data-lazy-src],[data-lazy-srcset]"));
	    e.dataset.lazySrc && n.push(e), n.map(t => {
	      t instanceof HTMLImageElement ? i.add(t) : t instanceof HTMLElement && t.dataset.lazySrc && (t.style.backgroundImage = `url('${t.dataset.lazySrc}')`, delete t.dataset.lazySrc);
	    });
	    for (const e of i) this.lazyLoadImg(t, e);
	  }
	  onAnimationEnd(t) {
	    var e;
	    const i = t.target,
	      n = i ? parseInt(i.dataset.index || "", 10) || 0 : -1,
	      s = this.slides[n],
	      o = t.animationName;
	    if (!i || !s || !o) return;
	    const a = !!this.inTransition.has(n) && s.transition;
	    a && o.substring(0, a.length + 2) === `f-${a}` && this.inTransition.delete(n), this.inTransition.size || this.clearTransitions(), n === this.page && (null === (e = this.panzoom) || void 0 === e ? void 0 : e.isResting) && this.emit("settle");
	  }
	  onDecel(t, e = 0, i = 0, n = 0, s = 0) {
	    if (this.option("dragFree")) return void this.setPageFromPosition();
	    const {
	        isRTL: o,
	        isHorizontal: a,
	        axis: r,
	        pages: l
	      } = this,
	      c = l.length,
	      h = Math.abs(Math.atan2(i, e) / (Math.PI / 180));
	    let d = 0;
	    if (d = h > 45 && h < 135 ? a ? 0 : i : a ? e : 0, !c) return;
	    let u = this.page,
	      p = o && a ? 1 : -1;
	    const f = t.current[r] * p;
	    let {
	      pageIndex: g
	    } = this.getPageFromPosition(f);
	    Math.abs(d) > 5 ? (l[u].dim < document.documentElement["client" + (this.isHorizontal ? "Width" : "Height")] - 1 && (u = g), u = o && a ? d < 0 ? u - 1 : u + 1 : d < 0 ? u + 1 : u - 1) : u = 0 === n && 0 === s ? u : g, this.slideTo(u, {
	      transition: !1,
	      friction: t.option("decelFriction")
	    });
	  }
	  onClick(t) {
	    const e = t.target,
	      i = e && E(e) ? e.dataset : null;
	    let n, s;
	    i && (void 0 !== i.carouselPage ? (s = "slideTo", n = i.carouselPage) : void 0 !== i.carouselNext ? s = "slideNext" : void 0 !== i.carouselPrev && (s = "slidePrev")), s ? (t.preventDefault(), t.stopPropagation(), e && !e.hasAttribute("disabled") && this[s](n)) : this.emit("click", t);
	  }
	  onSlideTo(t) {
	    const e = t.detail || 0;
	    this.slideTo(this.getPageForSlide(e), {
	      friction: 0
	    });
	  }
	  onChange(t, e = 0) {
	    const i = this.page;
	    this.prevPage = i, this.page = t, this.option("adaptiveHeight") && this.setViewportHeight(), t !== i && (this.markSelectedSlides(), this.emit("change", t, i, e));
	  }
	  onRefresh() {
	    let t = this.contentDim,
	      e = this.viewportDim;
	    this.updateMetrics(), this.contentDim === t && this.viewportDim === e || this.slideTo(this.page, {
	      friction: 0,
	      transition: !1
	    });
	  }
	  onScroll() {
	    var t;
	    null === (t = this.viewport) || void 0 === t || t.scroll(0, 0);
	  }
	  onResize() {
	    this.option("breakpoints") && this.processOptions();
	  }
	  onBeforeTransform(t) {
	    this.lp !== t.current[this.axis] && (this.flipInfiniteTrack(), this.manageSlideVisiblity()), this.lp = t.current.e;
	  }
	  onEndAnimation() {
	    this.inTransition.size || this.emit("settle");
	  }
	  reInit(t = null, e = null) {
	    this.destroy(), this.state = B.Init, this.prevPage = null, this.userOptions = t || this.userOptions, this.userPlugins = e || this.userPlugins, this.processOptions();
	  }
	  slideTo(t = 0, {
	    friction: e = this.option("friction"),
	    transition: i = this.option("transition")
	  } = {}) {
	    if (this.state === B.Destroy) return;
	    t = parseInt((t || 0).toString()) || 0;
	    const n = this.getPageFromIndex(t),
	      {
	        axis: s,
	        isHorizontal: o,
	        isRTL: a,
	        pages: r,
	        panzoom: l
	      } = this,
	      c = r.length,
	      h = a && o ? 1 : -1;
	    if (!l || !c) return;
	    if (this.page !== n) {
	      const e = new Event("beforeChange", {
	        bubbles: !0,
	        cancelable: !0
	      });
	      if (this.emit("beforeChange", e, t), e.defaultPrevented) return;
	    }
	    if (this.transitionTo(t, i)) return;
	    let d = r[n].pos;
	    if (this.isInfinite) {
	      const e = this.contentDim,
	        i = l.target[s] * h;
	      if (2 === c) d += e * Math.floor(parseFloat(t + "") / 2);else {
	        d = [d, d - e, d + e].reduce(function (t, e) {
	          return Math.abs(e - i) < Math.abs(t - i) ? e : t;
	        });
	      }
	    }
	    d *= h, Math.abs(l.target[s] - d) < 1 || (l.panTo({
	      x: o ? d : 0,
	      y: o ? 0 : d,
	      friction: e
	    }), this.onChange(n));
	  }
	  slideToClosest(t) {
	    if (this.panzoom) {
	      const {
	        pageIndex: e
	      } = this.getPageFromPosition();
	      this.slideTo(e, t);
	    }
	  }
	  slideNext() {
	    this.slideTo(this.page + 1);
	  }
	  slidePrev() {
	    this.slideTo(this.page - 1);
	  }
	  clearTransitions() {
	    this.inTransition.clear(), S(this.container, this.cn("inTransition"));
	    const t = ["to-prev", "to-next", "from-prev", "from-next"];
	    for (const e of this.slides) {
	      const i = e.el;
	      if (i) {
	        i.removeEventListener(G, this.onAnimationEnd), i.classList.remove(...t);
	        const n = e.transition;
	        n && i.classList.remove(`f-${n}Out`, `f-${n}In`);
	      }
	    }
	    this.manageSlideVisiblity();
	  }
	  addSlide(t, e) {
	    var i, n, s, o;
	    const a = this.panzoom,
	      r = (null === (i = this.pages[this.page]) || void 0 === i ? void 0 : i.pos) || 0,
	      l = (null === (n = this.pages[this.page]) || void 0 === n ? void 0 : n.dim) || 0,
	      c = this.contentDim < this.viewportDim;
	    let h = Array.isArray(e) ? e : [e];
	    const d = [];
	    for (const t of h) d.push(H(t));
	    this.slides.splice(t, 0, ...d);
	    for (let t = 0; t < this.slides.length; t++) this.slides[t].index = t;
	    for (const t of d) this.emit("beforeInitSlide", t, t.index);
	    if (this.page >= t && (this.page += d.length), this.updateMetrics(), a) {
	      const e = (null === (s = this.pages[this.page]) || void 0 === s ? void 0 : s.pos) || 0,
	        i = (null === (o = this.pages[this.page]) || void 0 === o ? void 0 : o.dim) || 0,
	        n = this.pages.length || 1,
	        h = this.isRTL ? l - i : i - l,
	        d = this.isRTL ? r - e : e - r;
	      c && 1 === n ? (t <= this.page && (a.current[this.axis] -= h, a.target[this.axis] -= h), a.panTo({
	        [this.isHorizontal ? "x" : "y"]: -1 * e
	      })) : d && t <= this.page && (a.target[this.axis] -= d, a.current[this.axis] -= d, a.requestTick());
	    }
	    for (const t of d) this.emit("initSlide", t, t.index);
	  }
	  prependSlide(t) {
	    this.addSlide(0, t);
	  }
	  appendSlide(t) {
	    this.addSlide(this.slides.length, t);
	  }
	  removeSlide(t) {
	    const e = this.slides.length;
	    t = (t % e + e) % e;
	    const i = this.slides[t];
	    if (i) {
	      this.removeSlideEl(i, !0), this.slides.splice(t, 1);
	      for (let t = 0; t < this.slides.length; t++) this.slides[t].index = t;
	      this.updateMetrics(), this.slideTo(this.page, {
	        friction: 0,
	        transition: !1
	      }), this.emit("destroySlide", i);
	    }
	  }
	  updateMetrics() {
	    const {
	      panzoom: e,
	      viewport: i,
	      track: n,
	      slides: s,
	      isHorizontal: o,
	      isInfinite: a
	    } = this;
	    if (!n) return;
	    const r = o ? "width" : "height",
	      l = o ? "offsetWidth" : "offsetHeight";
	    if (i) {
	      let e = Math.max(i[l], t(i.getBoundingClientRect()[r], 1e3)),
	        n = getComputedStyle(i),
	        s = "padding",
	        a = o ? "Right" : "Bottom";
	      e -= parseFloat(n[s + (o ? "Left" : "Top")]) + parseFloat(n[s + a]), this.viewportDim = e;
	    }
	    let c,
	      h = 0;
	    for (const [e, i] of s.entries()) {
	      let n = 0,
	        o = 0;
	      !i.el && c ? (n = c.dim, o = c.gap) : (({
	        dim: n,
	        gap: o
	      } = this.getSlideMetrics(i)), c = i), n = t(n, 1e3), o = t(o, 1e3), i.dim = n, i.gap = o, i.pos = h, h += n, (a || e < s.length - 1) && (h += o);
	    }
	    h = t(h, 1e3), this.contentDim = h, e && (e.contentRect[r] = h, e.contentRect[o ? "fullWidth" : "fullHeight"] = h), this.pages = this.createPages(), this.pages = this.processPages(), this.state === B.Init && this.setInitialPage(), this.page = Math.max(0, Math.min(this.page, this.pages.length - 1)), this.manageSlideVisiblity(), this.emit("refresh");
	  }
	  getProgress(e, i = !1, n = !1) {
	    void 0 === e && (e = this.page);
	    const s = this,
	      o = s.panzoom,
	      a = s.contentDim,
	      r = s.pages[e] || 0;
	    if (!r || !o) return e > this.page ? -1 : 1;
	    let l = -1 * o.current.e,
	      c = t((l - r.pos) / (1 * r.dim), 1e3),
	      h = c,
	      d = c;
	    this.isInfinite && !0 !== n && (h = t((l - r.pos + a) / (1 * r.dim), 1e3), d = t((l - r.pos - a) / (1 * r.dim), 1e3));
	    let u = [c, h, d].reduce(function (t, e) {
	      return Math.abs(e) < Math.abs(t) ? e : t;
	    });
	    return i ? u : u > 1 ? 1 : u < -1 ? -1 : u;
	  }
	  setViewportHeight() {
	    const {
	      page: t,
	      pages: e,
	      viewport: i,
	      isHorizontal: n
	    } = this;
	    if (!i || !e[t]) return;
	    let s = 0;
	    n && this.track && (this.track.style.height = "auto", e[t].slides.forEach(t => {
	      t.el && (s = Math.max(s, t.el.offsetHeight));
	    })), i.style.height = s ? `${s}px` : "";
	  }
	  getPageForSlide(t) {
	    for (const e of this.pages) for (const i of e.slides) if (i.index === t) return e.index;
	    return -1;
	  }
	  getVisibleSlides(t = 0) {
	    var e;
	    const i = new Set();
	    let {
	      panzoom: n,
	      contentDim: s,
	      viewportDim: o,
	      pages: a,
	      page: r
	    } = this;
	    if (o) {
	      s = s + (null === (e = this.slides[this.slides.length - 1]) || void 0 === e ? void 0 : e.gap) || 0;
	      let l = 0;
	      l = n && n.state !== m.Init && n.state !== m.Destroy ? -1 * n.current[this.axis] : a[r] && a[r].pos || 0, this.isInfinite && (l -= Math.floor(l / s) * s), this.isRTL && this.isHorizontal && (l *= -1);
	      const c = l - o * t,
	        h = l + o * (t + 1),
	        d = this.isInfinite ? [-1, 0, 1] : [0];
	      for (const t of this.slides) for (const e of d) {
	        const n = t.pos + e * s,
	          o = n + t.dim + t.gap;
	        n < h && o > c && i.add(t);
	      }
	    }
	    return i;
	  }
	  getPageFromPosition(t) {
	    const {
	        viewportDim: e,
	        contentDim: i,
	        slides: n,
	        pages: s,
	        panzoom: o
	      } = this,
	      a = s.length,
	      r = n.length,
	      l = n[0],
	      c = n[r - 1],
	      h = this.option("center");
	    let d = 0,
	      u = 0,
	      p = 0,
	      f = void 0 === t ? -1 * ((null == o ? void 0 : o.target[this.axis]) || 0) : t;
	    h && (f += .5 * e), this.isInfinite ? (f < l.pos - .5 * c.gap && (f -= i, p = -1), f > c.pos + c.dim + .5 * c.gap && (f -= i, p = 1)) : f = Math.max(l.pos || 0, Math.min(f, c.pos));
	    let g = c,
	      m = n.find(t => {
	        const e = t.pos - .5 * g.gap,
	          i = t.pos + t.dim + .5 * t.gap;
	        return g = t, f >= e && f < i;
	      });
	    return m || (m = c), u = this.getPageForSlide(m.index), d = u + p * a, {
	      page: d,
	      pageIndex: u
	    };
	  }
	  setPageFromPosition() {
	    const {
	      pageIndex: t
	    } = this.getPageFromPosition();
	    this.onChange(t);
	  }
	  destroy() {
	    if ([B.Destroy].includes(this.state)) return;
	    this.state = B.Destroy;
	    const {
	        container: t,
	        viewport: e,
	        track: i,
	        slides: n,
	        panzoom: s
	      } = this,
	      o = this.option("classes");
	    t.removeEventListener("click", this.onClick, {
	      passive: !1,
	      capture: !1
	    }), t.removeEventListener("slideTo", this.onSlideTo), window.removeEventListener("resize", this.onResize), s && (s.destroy(), this.panzoom = null), n && n.forEach(t => {
	      this.removeSlideEl(t);
	    }), this.detachPlugins(), e && (e.removeEventListener("scroll", this.onScroll), e.offsetParent && i && i.offsetParent && e.replaceWith(...i.childNodes));
	    for (const [e, i] of Object.entries(o)) "container" !== e && i && t.classList.remove(i);
	    this.track = null, this.viewport = null, this.page = 0, this.slides = [];
	    const a = this.events.get("ready");
	    this.events = new Map(), a && this.events.set("ready", a);
	  }
	}
	Object.defineProperty(Q, "Panzoom", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: I
	}), Object.defineProperty(Q, "defaults", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: j
	}), Object.defineProperty(Q, "Plugins", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: U
	});
	const tt = function (t) {
	    if (!E(t)) return 0;
	    const e = window.scrollY,
	      i = window.innerHeight,
	      n = e + i,
	      s = t.getBoundingClientRect(),
	      o = s.y + e,
	      a = s.height,
	      r = o + a;
	    if (e > r || n < o) return 0;
	    if (e < o && n > r) return 100;
	    if (o < e && r > n) return 100;
	    let l = a;
	    o < e && (l -= e - o), r > n && (l -= r - n);
	    const c = l / i * 100;
	    return Math.round(c);
	  },
	  et = !("undefined" == typeof window || !window.document || !window.document.createElement);
	let it;
	const nt = ["a[href]", "area[href]", 'input:not([disabled]):not([type="hidden"]):not([aria-hidden])', "select:not([disabled]):not([aria-hidden])", "textarea:not([disabled]):not([aria-hidden])", "button:not([disabled]):not([aria-hidden]):not(.fancybox-focus-guard)", "iframe", "object", "embed", "video", "audio", "[contenteditable]", '[tabindex]:not([tabindex^="-"]):not([disabled]):not([aria-hidden])'].join(","),
	  st = t => {
	    if (t && et) {
	      void 0 === it && document.createElement("div").focus({
	        get preventScroll() {
	          return it = !0, !1;
	        }
	      });
	      try {
	        if (it) t.focus({
	          preventScroll: !0
	        });else {
	          const e = window.scrollY || document.body.scrollTop,
	            i = window.scrollX || document.body.scrollLeft;
	          t.focus(), document.body.scrollTo({
	            top: e,
	            left: i,
	            behavior: "auto"
	          });
	        }
	      } catch (t) {}
	    }
	  },
	  ot = () => {
	    const t = document;
	    let e,
	      i = "",
	      n = "",
	      s = "";
	    return t.fullscreenEnabled ? (i = "requestFullscreen", n = "exitFullscreen", s = "fullscreenElement") : t.webkitFullscreenEnabled && (i = "webkitRequestFullscreen", n = "webkitExitFullscreen", s = "webkitFullscreenElement"), i && (e = {
	      request: function (e = t.documentElement) {
	        return "webkitRequestFullscreen" === i ? e[i](Element.ALLOW_KEYBOARD_INPUT) : e[i]();
	      },
	      exit: function () {
	        return t[s] && t[n]();
	      },
	      isFullscreen: function () {
	        return t[s];
	      }
	    }), e;
	  },
	  at = {
	    animated: !0,
	    autoFocus: !0,
	    backdropClick: "close",
	    Carousel: {
	      classes: {
	        container: "fancybox__carousel",
	        viewport: "fancybox__viewport",
	        track: "fancybox__track",
	        slide: "fancybox__slide"
	      }
	    },
	    closeButton: "auto",
	    closeExisting: !1,
	    commonCaption: !1,
	    compact: () => window.matchMedia("(max-width: 578px), (max-height: 578px)").matches,
	    contentClick: "toggleZoom",
	    contentDblClick: !1,
	    defaultType: "image",
	    defaultDisplay: "flex",
	    dragToClose: !0,
	    Fullscreen: {
	      autoStart: !1
	    },
	    groupAll: !1,
	    groupAttr: "data-fancybox",
	    hideClass: "f-fadeOut",
	    hideScrollbar: !0,
	    idle: 3500,
	    keyboard: {
	      Escape: "close",
	      Delete: "close",
	      Backspace: "close",
	      PageUp: "next",
	      PageDown: "prev",
	      ArrowUp: "prev",
	      ArrowDown: "next",
	      ArrowRight: "next",
	      ArrowLeft: "prev"
	    },
	    l10n: Object.assign(Object.assign({}, b), {
	      CLOSE: "Close",
	      NEXT: "Next",
	      PREV: "Previous",
	      MODAL: "You can close this modal content with the ESC key",
	      ERROR: "Something Went Wrong, Please Try Again Later",
	      IMAGE_ERROR: "Image Not Found",
	      ELEMENT_NOT_FOUND: "HTML Element Not Found",
	      AJAX_NOT_FOUND: "Error Loading AJAX : Not Found",
	      AJAX_FORBIDDEN: "Error Loading AJAX : Forbidden",
	      IFRAME_ERROR: "Error Loading Page",
	      TOGGLE_ZOOM: "Toggle zoom level",
	      TOGGLE_THUMBS: "Toggle thumbnails",
	      TOGGLE_SLIDESHOW: "Toggle slideshow",
	      TOGGLE_FULLSCREEN: "Toggle full-screen mode",
	      DOWNLOAD: "Download"
	    }),
	    parentEl: null,
	    placeFocusBack: !0,
	    showClass: "f-zoomInUp",
	    startIndex: 0,
	    tpl: {
	      closeButton: '<button data-fancybox-close class="f-button is-close-btn" title="{{CLOSE}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M20 20L4 4m16 0L4 20"/></svg></button>',
	      main: '<div class="fancybox__container" role="dialog" aria-modal="true" aria-label="{{MODAL}}" tabindex="-1">\n    <div class="fancybox__backdrop"></div>\n    <div class="fancybox__carousel"></div>\n    <div class="fancybox__footer"></div>\n  </div>'
	    },
	    trapFocus: !0,
	    wheel: "zoom"
	  };
	var rt, lt;
	!function (t) {
	  t[t.Init = 0] = "Init", t[t.Ready = 1] = "Ready", t[t.Closing = 2] = "Closing", t[t.CustomClosing = 3] = "CustomClosing", t[t.Destroy = 4] = "Destroy";
	}(rt || (rt = {})), function (t) {
	  t[t.Loading = 0] = "Loading", t[t.Opening = 1] = "Opening", t[t.Ready = 2] = "Ready", t[t.Closing = 3] = "Closing";
	}(lt || (lt = {}));
	let ct = "",
	  ht = !1,
	  dt = !1,
	  ut = null;
	const pt = () => {
	    let t = "",
	      e = "";
	    const i = Oe.getInstance();
	    if (i) {
	      const n = i.carousel,
	        s = i.getSlide();
	      if (n && s) {
	        let o = s.slug || void 0,
	          a = s.triggerEl || void 0;
	        e = o || i.option("slug") || "", !e && a && a.dataset && (e = a.dataset.fancybox || ""), e && "true" !== e && (t = "#" + e + (!o && n.slides.length > 1 ? "-" + (s.index + 1) : ""));
	      }
	    }
	    return {
	      hash: t,
	      slug: e,
	      index: 1
	    };
	  },
	  ft = () => {
	    const t = new URL(document.URL).hash,
	      e = t.slice(1).split("-"),
	      i = e[e.length - 1],
	      n = i && /^\+?\d+$/.test(i) && parseInt(e.pop() || "1", 10) || 1;
	    return {
	      hash: t,
	      slug: e.join("-"),
	      index: n
	    };
	  },
	  gt = () => {
	    const {
	      slug: t,
	      index: e
	    } = ft();
	    if (!t) return;
	    let i = document.querySelector(`[data-slug="${t}"]`);
	    if (i && i.dispatchEvent(new CustomEvent("click", {
	      bubbles: !0,
	      cancelable: !0
	    })), Oe.getInstance()) return;
	    const n = document.querySelectorAll(`[data-fancybox="${t}"]`);
	    n.length && (i = n[e - 1], i && i.dispatchEvent(new CustomEvent("click", {
	      bubbles: !0,
	      cancelable: !0
	    })));
	  },
	  mt = () => {
	    if (!1 === Oe.defaults.Hash) return;
	    const t = Oe.getInstance();
	    if (!1 === (null == t ? void 0 : t.options.Hash)) return;
	    const {
	        slug: e,
	        index: i
	      } = ft(),
	      {
	        slug: n
	      } = pt();
	    t && (e === n ? t.jumpTo(i - 1) : (ht = !0, t.close())), gt();
	  },
	  vt = () => {
	    ut && clearTimeout(ut), queueMicrotask(() => {
	      mt();
	    });
	  },
	  bt = () => {
	    window.addEventListener("hashchange", vt, !1), setTimeout(() => {
	      mt();
	    }, 500);
	  };
	et && (/complete|interactive|loaded/.test(document.readyState) ? bt() : document.addEventListener("DOMContentLoaded", bt));
	const yt = "is-zooming-in";
	class wt extends _ {
	  onCreateSlide(t, e, i) {
	    const n = this.instance.optionFor(i, "src") || "";
	    i.el && "image" === i.type && "string" == typeof n && this.setImage(i, n);
	  }
	  onRemoveSlide(t, e, i) {
	    i.panzoom && i.panzoom.destroy(), i.panzoom = void 0, i.imageEl = void 0;
	  }
	  onChange(t, e, i, n) {
	    S(this.instance.container, yt);
	    for (const t of e.slides) {
	      const e = t.panzoom;
	      e && t.index !== i && e.reset(.35);
	    }
	  }
	  onClose() {
	    var t;
	    const e = this.instance,
	      i = e.container,
	      n = e.getSlide();
	    if (!i || !i.parentElement || !n) return;
	    const {
	      el: s,
	      contentEl: o,
	      panzoom: a,
	      thumbElSrc: r
	    } = n;
	    if (!s || !r || !o || !a || a.isContentLoading || a.state === m.Init || a.state === m.Destroy) return;
	    a.updateMetrics();
	    let l = this.getZoomInfo(n);
	    if (!l) return;
	    this.instance.state = rt.CustomClosing, i.classList.remove(yt), i.classList.add("is-zooming-out"), o.style.backgroundImage = `url('${r}')`;
	    const c = i.getBoundingClientRect();
	    1 === ((null === (t = window.visualViewport) || void 0 === t ? void 0 : t.scale) || 1) && Object.assign(i.style, {
	      position: "absolute",
	      top: `${i.offsetTop + window.scrollY}px`,
	      left: `${i.offsetLeft + window.scrollX}px`,
	      bottom: "auto",
	      right: "auto",
	      width: `${c.width}px`,
	      height: `${c.height}px`,
	      overflow: "hidden"
	    });
	    const {
	      x: h,
	      y: d,
	      scale: u,
	      opacity: p
	    } = l;
	    if (p) {
	      const t = ((t, e, i, n) => {
	        const s = e - t,
	          o = n - i;
	        return e => i + ((e - t) / s * o || 0);
	      })(a.scale, u, 1, 0);
	      a.on("afterTransform", () => {
	        o.style.opacity = t(a.scale) + "";
	      });
	    }
	    a.on("endAnimation", () => {
	      e.destroy();
	    }), a.target.a = u, a.target.b = 0, a.target.c = 0, a.target.d = u, a.panTo({
	      x: h,
	      y: d,
	      scale: u,
	      friction: p ? .2 : .33,
	      ignoreBounds: !0
	    }), a.isResting && e.destroy();
	  }
	  setImage(t, e) {
	    const i = this.instance;
	    t.src = e, this.process(t, e).then(e => {
	      const {
	        contentEl: n,
	        imageEl: s,
	        thumbElSrc: o,
	        el: a
	      } = t;
	      if (i.isClosing() || !n || !s) return;
	      n.offsetHeight;
	      const r = !!i.isOpeningSlide(t) && this.getZoomInfo(t);
	      if (this.option("protected") && a) {
	        a.addEventListener("contextmenu", t => {
	          t.preventDefault();
	        });
	        const t = document.createElement("div");
	        P(t, "fancybox-protected"), n.appendChild(t);
	      }
	      if (o && r) {
	        const s = e.contentRect,
	          a = Math.max(s.fullWidth, s.fullHeight);
	        let c = null;
	        !r.opacity && a > 1200 && (c = document.createElement("img"), P(c, "fancybox-ghost"), c.src = o, n.appendChild(c));
	        const h = () => {
	          c && (P(c, "f-fadeFastOut"), setTimeout(() => {
	            c && (c.remove(), c = null);
	          }, 200));
	        };
	        (l = o, new Promise((t, e) => {
	          const i = new Image();
	          i.onload = t, i.onerror = e, i.src = l;
	        })).then(() => {
	          i.hideLoading(t), t.state = lt.Opening, this.instance.emit("reveal", t), this.zoomIn(t).then(() => {
	            h(), this.instance.done(t);
	          }, () => {}), c && setTimeout(() => {
	            h();
	          }, a > 2500 ? 800 : 200);
	        }, () => {
	          i.hideLoading(t), i.revealContent(t);
	        });
	      } else {
	        const n = this.optionFor(t, "initialSize"),
	          s = this.optionFor(t, "zoom"),
	          o = {
	            event: i.prevMouseMoveEvent || i.options.event,
	            friction: s ? .12 : 0
	          };
	        let a = i.optionFor(t, "showClass") || void 0,
	          r = !0;
	        i.isOpeningSlide(t) && ("full" === n ? e.zoomToFull(o) : "cover" === n ? e.zoomToCover(o) : "max" === n ? e.zoomToMax(o) : r = !1, e.stop("current")), r && a && (a = e.isDragging ? "f-fadeIn" : ""), i.hideLoading(t), i.revealContent(t, a);
	      }
	      var l;
	    }, () => {
	      i.setError(t, "{{IMAGE_ERROR}}");
	    });
	  }
	  process(t, e) {
	    return new Promise((i, s) => {
	      var o;
	      const a = this.instance,
	        r = t.el;
	      a.clearContent(t), a.showLoading(t);
	      let l = this.optionFor(t, "content");
	      if ("string" == typeof l && (l = n(l)), !l || !E(l)) {
	        if (l = document.createElement("img"), l instanceof HTMLImageElement) {
	          let i = "",
	            n = t.caption;
	          i = "string" == typeof n && n ? n.replace(/<[^>]+>/gi, "").substring(0, 1e3) : `Image ${t.index + 1} of ${(null === (o = a.carousel) || void 0 === o ? void 0 : o.pages.length) || 1}`, l.src = e || "", l.alt = i, l.draggable = !1, t.srcset && l.setAttribute("srcset", t.srcset), this.instance.isOpeningSlide(t) && (l.fetchPriority = "high");
	        }
	        t.sizes && l.setAttribute("sizes", t.sizes);
	      }
	      P(l, "fancybox-image"), t.imageEl = l, a.setContent(t, l, !1);
	      t.panzoom = new I(r, u({
	        transformParent: !0
	      }, this.option("Panzoom") || {}, {
	        content: l,
	        width: (e, i) => a.optionFor(t, "width", "auto", i) || "auto",
	        height: (e, i) => a.optionFor(t, "height", "auto", i) || "auto",
	        wheel: () => {
	          const t = a.option("wheel");
	          return ("zoom" === t || "pan" == t) && t;
	        },
	        click: (e, i) => {
	          var n, s;
	          if (a.isCompact || a.isClosing()) return !1;
	          if (t.index !== (null === (n = a.getSlide()) || void 0 === n ? void 0 : n.index)) return !1;
	          if (i) {
	            const t = i.composedPath()[0];
	            if (["A", "BUTTON", "TEXTAREA", "OPTION", "INPUT", "SELECT", "VIDEO"].includes(t.nodeName)) return !1;
	          }
	          let o = !i || i.target && (null === (s = t.contentEl) || void 0 === s ? void 0 : s.contains(i.target));
	          return a.option(o ? "contentClick" : "backdropClick") || !1;
	        },
	        dblClick: () => a.isCompact ? "toggleZoom" : a.option("contentDblClick") || !1,
	        spinner: !1,
	        panOnlyZoomed: !0,
	        wheelLimit: 1 / 0,
	        on: {
	          ready: t => {
	            i(t);
	          },
	          error: () => {
	            s();
	          },
	          destroy: () => {
	            s();
	          }
	        }
	      }));
	    });
	  }
	  zoomIn(t) {
	    return new Promise((e, i) => {
	      const n = this.instance,
	        s = n.container,
	        {
	          panzoom: o,
	          contentEl: a,
	          el: r
	        } = t;
	      o && o.updateMetrics();
	      const l = this.getZoomInfo(t);
	      if (!(l && r && a && o && s)) return void i();
	      const {
	          x: c,
	          y: h,
	          scale: d,
	          opacity: u
	        } = l,
	        p = () => {
	          t.state !== lt.Closing && (u && (a.style.opacity = Math.max(Math.min(1, 1 - (1 - o.scale) / (1 - d)), 0) + ""), o.scale >= 1 && o.scale > o.targetScale - .1 && e(o));
	        },
	        f = t => {
	          (t.scale < .99 || t.scale > 1.01) && !t.isDragging || (S(s, yt), a.style.opacity = "", t.off("endAnimation", f), t.off("touchStart", f), t.off("afterTransform", p), e(t));
	        };
	      o.on("endAnimation", f), o.on("touchStart", f), o.on("afterTransform", p), o.on(["error", "destroy"], () => {
	        i();
	      }), o.panTo({
	        x: c,
	        y: h,
	        scale: d,
	        friction: 0,
	        ignoreBounds: !0
	      }), o.stop("current");
	      const g = {
	          event: "mousemove" === o.panMode ? n.prevMouseMoveEvent || n.options.event : void 0
	        },
	        m = this.optionFor(t, "initialSize");
	      P(s, yt), n.hideLoading(t), "full" === m ? o.zoomToFull(g) : "cover" === m ? o.zoomToCover(g) : "max" === m ? o.zoomToMax(g) : o.reset(.172);
	    });
	  }
	  getZoomInfo(t) {
	    const {
	        el: e,
	        imageEl: i,
	        thumbEl: n,
	        panzoom: s
	      } = t,
	      o = this.instance,
	      a = o.container;
	    if (!e || !i || !n || !s || tt(n) < 3 || !this.optionFor(t, "zoom") || !a || o.state === rt.Destroy) return !1;
	    if ("0" === getComputedStyle(a).getPropertyValue("--f-images-zoom")) return !1;
	    const r = window.visualViewport || null;
	    if (1 !== (r ? r.scale : 1)) return !1;
	    let {
	        top: l,
	        left: c,
	        width: h,
	        height: d
	      } = n.getBoundingClientRect(),
	      {
	        top: u,
	        left: p,
	        fitWidth: f,
	        fitHeight: g
	      } = s.contentRect;
	    if (!(h && d && f && g)) return !1;
	    const m = s.container.getBoundingClientRect();
	    p += m.left, u += m.top;
	    const v = -1 * (p + .5 * f - (c + .5 * h)),
	      b = -1 * (u + .5 * g - (l + .5 * d)),
	      y = h / f;
	    let w = this.option("zoomOpacity") || !1;
	    return "auto" === w && (w = Math.abs(h / d - f / g) > .1), {
	      x: v,
	      y: b,
	      scale: y,
	      opacity: w
	    };
	  }
	  attach() {
	    const t = this,
	      e = t.instance;
	    e.on("Carousel.change", t.onChange), e.on("Carousel.createSlide", t.onCreateSlide), e.on("Carousel.removeSlide", t.onRemoveSlide), e.on("close", t.onClose);
	  }
	  detach() {
	    const t = this,
	      e = t.instance;
	    e.off("Carousel.change", t.onChange), e.off("Carousel.createSlide", t.onCreateSlide), e.off("Carousel.removeSlide", t.onRemoveSlide), e.off("close", t.onClose);
	  }
	}
	Object.defineProperty(wt, "defaults", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: {
	    initialSize: "fit",
	    Panzoom: {
	      maxScale: 1
	    },
	    protected: !1,
	    zoom: !0,
	    zoomOpacity: "auto"
	  }
	}), "function" == typeof SuppressedError && SuppressedError;
	const xt = "html",
	  Et = "image",
	  St = "map",
	  Pt = "youtube",
	  Ct = "vimeo",
	  Tt = "html5video",
	  Mt = (t, e = {}) => {
	    const i = new URL(t),
	      n = new URLSearchParams(i.search),
	      s = new URLSearchParams();
	    for (const [t, i] of [...n, ...Object.entries(e)]) {
	      let e = i + "";
	      if ("t" === t) {
	        let t = e.match(/((\d*)m)?(\d*)s?/);
	        t && s.set("start", 60 * parseInt(t[2] || "0") + parseInt(t[3] || "0") + "");
	      } else s.set(t, e);
	    }
	    let o = s + "",
	      a = t.match(/#t=((.*)?\d+s)/);
	    return a && (o += `#t=${a[1]}`), o;
	  },
	  Ot = {
	    ajax: null,
	    autoSize: !0,
	    iframeAttr: {
	      allow: "autoplay; fullscreen",
	      scrolling: "auto"
	    },
	    preload: !0,
	    videoAutoplay: !0,
	    videoRatio: 16 / 9,
	    videoTpl: '<video class="fancybox__html5video" playsinline controls controlsList="nodownload" poster="{{poster}}">\n  <source src="{{src}}" type="{{format}}" />Sorry, your browser doesn\'t support embedded videos.</video>',
	    videoFormat: "",
	    vimeo: {
	      byline: 1,
	      color: "00adef",
	      controls: 1,
	      dnt: 1,
	      muted: 0
	    },
	    youtube: {
	      controls: 1,
	      enablejsapi: 1,
	      nocookie: 1,
	      rel: 0,
	      fs: 1
	    }
	  },
	  At = ["image", "html", "ajax", "inline", "clone", "iframe", "map", "pdf", "html5video", "youtube", "vimeo"];
	class Lt extends _ {
	  onBeforeInitSlide(t, e, i) {
	    this.processType(i);
	  }
	  onCreateSlide(t, e, i) {
	    this.setContent(i);
	  }
	  onClearContent(t, e) {
	    e.xhr && (e.xhr.abort(), e.xhr = null);
	    const i = e.iframeEl;
	    i && (i.onload = i.onerror = null, i.src = "//about:blank", e.iframeEl = null);
	    const n = e.contentEl,
	      s = e.placeholderEl;
	    if ("inline" === e.type && n && s) n.classList.remove("fancybox__content"), "none" !== getComputedStyle(n).getPropertyValue("display") && (n.style.display = "none"), setTimeout(() => {
	      s && (n && s.parentNode && s.parentNode.insertBefore(n, s), s.remove());
	    }, 0), e.contentEl = void 0, e.placeholderEl = void 0;else for (; e.el && e.el.firstChild;) e.el.removeChild(e.el.firstChild);
	  }
	  onSelectSlide(t, e, i) {
	    i.state === lt.Ready && this.playVideo();
	  }
	  onUnselectSlide(t, e, i) {
	    var n, s;
	    if (i.type === Tt) {
	      try {
	        null === (s = null === (n = i.el) || void 0 === n ? void 0 : n.querySelector("video")) || void 0 === s || s.pause();
	      } catch (t) {}
	      return;
	    }
	    let o;
	    i.type === Ct ? o = {
	      method: "pause",
	      value: "true"
	    } : i.type === Pt && (o = {
	      event: "command",
	      func: "pauseVideo"
	    }), o && i.iframeEl && i.iframeEl.contentWindow && i.iframeEl.contentWindow.postMessage(JSON.stringify(o), "*"), i.poller && clearTimeout(i.poller);
	  }
	  onDone(t, e) {
	    t.isCurrentSlide(e) && !t.isClosing() && this.playVideo();
	  }
	  onRefresh(t, e) {
	    e.slides.forEach(t => {
	      t.el && (this.resizeIframe(t), this.setAspectRatio(t));
	    });
	  }
	  onMessage(t) {
	    try {
	      let e = JSON.parse(t.data);
	      if ("https://player.vimeo.com" === t.origin) {
	        if ("ready" === e.event) for (let e of Array.from(document.getElementsByClassName("fancybox__iframe"))) e instanceof HTMLIFrameElement && e.contentWindow === t.source && (e.dataset.ready = "true");
	      } else if (t.origin.match(/^https:\/\/(www.)?youtube(-nocookie)?.com$/) && "onReady" === e.event) {
	        const t = document.getElementById(e.id);
	        t && (t.dataset.ready = "true");
	      }
	    } catch (t) {}
	  }
	  loadAjaxContent(t) {
	    const e = this.instance.optionFor(t, "src") || "";
	    this.instance.showLoading(t);
	    const i = this.instance,
	      n = new XMLHttpRequest();
	    i.showLoading(t), n.onreadystatechange = function () {
	      n.readyState === XMLHttpRequest.DONE && i.state === rt.Ready && (i.hideLoading(t), 200 === n.status ? i.setContent(t, n.responseText) : i.setError(t, 404 === n.status ? "{{AJAX_NOT_FOUND}}" : "{{AJAX_FORBIDDEN}}"));
	    };
	    const s = t.ajax || null;
	    n.open(s ? "POST" : "GET", e + ""), n.setRequestHeader("Content-Type", "application/x-www-form-urlencoded"), n.setRequestHeader("X-Requested-With", "XMLHttpRequest"), n.send(s), t.xhr = n;
	  }
	  setInlineContent(t) {
	    let e = null;
	    if (E(t.src)) e = t.src;else if ("string" == typeof t.src) {
	      const i = t.src.split("#", 2).pop();
	      e = i ? document.getElementById(i) : null;
	    }
	    if (e) {
	      if ("clone" === t.type || e.closest(".fancybox__slide")) {
	        e = e.cloneNode(!0);
	        const i = e.dataset.animationName;
	        i && (e.classList.remove(i), delete e.dataset.animationName);
	        let n = e.getAttribute("id");
	        n = n ? `${n}--clone` : `clone-${this.instance.id}-${t.index}`, e.setAttribute("id", n);
	      } else if (e.parentNode) {
	        const i = document.createElement("div");
	        i.classList.add("fancybox-placeholder"), e.parentNode.insertBefore(i, e), t.placeholderEl = i;
	      }
	      this.instance.setContent(t, e);
	    } else this.instance.setError(t, "{{ELEMENT_NOT_FOUND}}");
	  }
	  setIframeContent(t) {
	    const {
	      src: e,
	      el: i
	    } = t;
	    if (!e || "string" != typeof e || !i) return;
	    i.classList.add("is-loading");
	    const n = this.instance,
	      s = document.createElement("iframe");
	    s.className = "fancybox__iframe", s.setAttribute("id", `fancybox__iframe_${n.id}_${t.index}`);
	    for (const [e, i] of Object.entries(this.optionFor(t, "iframeAttr") || {})) s.setAttribute(e, i);
	    s.onerror = () => {
	      n.setError(t, "{{IFRAME_ERROR}}");
	    }, t.iframeEl = s;
	    const o = this.optionFor(t, "preload");
	    if ("iframe" !== t.type || !1 === o) return s.setAttribute("src", t.src + ""), n.setContent(t, s, !1), this.resizeIframe(t), void n.revealContent(t);
	    n.showLoading(t), s.onload = () => {
	      if (!s.src.length) return;
	      const e = "true" !== s.dataset.ready;
	      s.dataset.ready = "true", this.resizeIframe(t), e ? n.revealContent(t) : n.hideLoading(t);
	    }, s.setAttribute("src", e), n.setContent(t, s, !1);
	  }
	  resizeIframe(t) {
	    const {
	      type: e,
	      iframeEl: i
	    } = t;
	    if (e === Pt || e === Ct) return;
	    const n = null == i ? void 0 : i.parentElement;
	    if (!i || !n) return;
	    let s = t.autoSize;
	    void 0 === s && (s = this.optionFor(t, "autoSize"));
	    let o = t.width || 0,
	      a = t.height || 0;
	    o && a && (s = !1);
	    const r = n && n.style;
	    if (!1 !== t.preload && !1 !== s && r) try {
	      const t = window.getComputedStyle(n),
	        e = parseFloat(t.paddingLeft) + parseFloat(t.paddingRight),
	        s = parseFloat(t.paddingTop) + parseFloat(t.paddingBottom),
	        l = i.contentWindow;
	      if (l) {
	        const t = l.document,
	          i = t.getElementsByTagName(xt)[0],
	          n = t.body;
	        r.width = "", n.style.overflow = "hidden", o = o || i.scrollWidth + e, r.width = `${o}px`, n.style.overflow = "", r.flex = "0 0 auto", r.height = `${n.scrollHeight}px`, a = i.scrollHeight + s;
	      }
	    } catch (t) {}
	    if (o || a) {
	      const t = {
	        flex: "0 1 auto",
	        width: "",
	        height: ""
	      };
	      o && "auto" !== o && (t.width = `${o}px`), a && "auto" !== a && (t.height = `${a}px`), Object.assign(r, t);
	    }
	  }
	  playVideo() {
	    const t = this.instance.getSlide();
	    if (!t) return;
	    const {
	      el: e
	    } = t;
	    if (!e || !e.offsetParent) return;
	    if (!this.optionFor(t, "videoAutoplay")) return;
	    if (t.type === Tt) try {
	      const t = e.querySelector("video");
	      if (t) {
	        const e = t.play();
	        void 0 !== e && e.then(() => {}).catch(e => {
	          t.muted = !0, t.play();
	        });
	      }
	    } catch (t) {}
	    if (t.type !== Pt && t.type !== Ct) return;
	    const i = () => {
	      if (t.iframeEl && t.iframeEl.contentWindow) {
	        let e;
	        if ("true" === t.iframeEl.dataset.ready) return e = t.type === Pt ? {
	          event: "command",
	          func: "playVideo"
	        } : {
	          method: "play",
	          value: "true"
	        }, e && t.iframeEl.contentWindow.postMessage(JSON.stringify(e), "*"), void (t.poller = void 0);
	        t.type === Pt && (e = {
	          event: "listening",
	          id: t.iframeEl.getAttribute("id")
	        }, t.iframeEl.contentWindow.postMessage(JSON.stringify(e), "*"));
	      }
	      t.poller = setTimeout(i, 250);
	    };
	    i();
	  }
	  processType(t) {
	    if (t.html) return t.type = xt, t.src = t.html, void (t.html = "");
	    const e = this.instance.optionFor(t, "src", "");
	    if (!e || "string" != typeof e) return;
	    let i = t.type,
	      n = null;
	    if (n = e.match(/(youtube\.com|youtu\.be|youtube\-nocookie\.com)\/(?:watch\?(?:.*&)?v=|v\/|u\/|shorts\/|embed\/?)?(videoseries\?list=(?:.*)|[\w-]{11}|\?listType=(?:.*)&list=(?:.*))(?:.*)/i)) {
	      const s = this.optionFor(t, Pt),
	        {
	          nocookie: o
	        } = s,
	        a = function (t, e) {
	          var i = {};
	          for (var n in t) Object.prototype.hasOwnProperty.call(t, n) && e.indexOf(n) < 0 && (i[n] = t[n]);
	          if (null != t && "function" == typeof Object.getOwnPropertySymbols) {
	            var s = 0;
	            for (n = Object.getOwnPropertySymbols(t); s < n.length; s++) e.indexOf(n[s]) < 0 && Object.prototype.propertyIsEnumerable.call(t, n[s]) && (i[n[s]] = t[n[s]]);
	          }
	          return i;
	        }(s, ["nocookie"]),
	        r = `www.youtube${o ? "-nocookie" : ""}.com`,
	        l = Mt(e, a),
	        c = encodeURIComponent(n[2]);
	      t.videoId = c, t.src = `https://${r}/embed/${c}?${l}`, t.thumbSrc = t.thumbSrc || `https://i.ytimg.com/vi/${c}/mqdefault.jpg`, i = Pt;
	    } else if (n = e.match(/^.+vimeo.com\/(?:\/)?([\d]+)((\/|\?h=)([a-z0-9]+))?(.*)?/)) {
	      const s = Mt(e, this.optionFor(t, Ct)),
	        o = encodeURIComponent(n[1]),
	        a = n[4] || "";
	      t.videoId = o, t.src = `https://player.vimeo.com/video/${o}?${a ? `h=${a}${s ? "&" : ""}` : ""}${s}`, i = Ct;
	    }
	    if (!i && t.triggerEl) {
	      const e = t.triggerEl.dataset.type;
	      At.includes(e) && (i = e);
	    }
	    i || "string" == typeof e && ("#" === e.charAt(0) ? i = "inline" : (n = e.match(/\.(mp4|mov|ogv|webm)((\?|#).*)?$/i)) ? (i = Tt, t.videoFormat = t.videoFormat || "video/" + ("ogv" === n[1] ? "ogg" : n[1])) : e.match(/(^data:image\/[a-z0-9+\/=]*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg|ico)((\?|#).*)?$)/i) ? i = Et : e.match(/\.(pdf)((\?|#).*)?$/i) && (i = "pdf")), (n = e.match(/(?:maps\.)?google\.([a-z]{2,3}(?:\.[a-z]{2})?)\/(?:(?:(?:maps\/(?:place\/(?:.*)\/)?\@(.*),(\d+.?\d+?)z))|(?:\?ll=))(.*)?/i)) ? (t.src = `https://maps.google.${n[1]}/?ll=${(n[2] ? n[2] + "&z=" + Math.floor(parseFloat(n[3])) + (n[4] ? n[4].replace(/^\//, "&") : "") : n[4] + "").replace(/\?/, "&")}&output=${n[4] && n[4].indexOf("layer=c") > 0 ? "svembed" : "embed"}`, i = St) : (n = e.match(/(?:maps\.)?google\.([a-z]{2,3}(?:\.[a-z]{2})?)\/(?:maps\/search\/)(.*)/i)) && (t.src = `https://maps.google.${n[1]}/maps?q=${n[2].replace("query=", "q=").replace("api=1", "")}&output=embed`, i = St), i = i || this.instance.option("defaultType"), t.type = i, i === Et && (t.thumbSrc = t.thumbSrc || t.src);
	  }
	  setContent(t) {
	    const e = this.instance.optionFor(t, "src") || "";
	    if (t && t.type && e) {
	      switch (t.type) {
	        case xt:
	          this.instance.setContent(t, e);
	          break;
	        case Tt:
	          const i = this.option("videoTpl");
	          i && this.instance.setContent(t, i.replace(/\{\{src\}\}/gi, e + "").replace(/\{\{format\}\}/gi, this.optionFor(t, "videoFormat") || "").replace(/\{\{poster\}\}/gi, t.poster || t.thumbSrc || ""));
	          break;
	        case "inline":
	        case "clone":
	          this.setInlineContent(t);
	          break;
	        case "ajax":
	          this.loadAjaxContent(t);
	          break;
	        case "pdf":
	        case St:
	        case Pt:
	        case Ct:
	          t.preload = !1;
	        case "iframe":
	          this.setIframeContent(t);
	      }
	      this.setAspectRatio(t);
	    }
	  }
	  setAspectRatio(t) {
	    const e = t.contentEl;
	    if (!(t.el && e && t.type && [Pt, Ct, Tt].includes(t.type))) return;
	    let i,
	      n = t.width || "auto",
	      s = t.height || "auto";
	    if ("auto" === n || "auto" === s) {
	      i = this.optionFor(t, "videoRatio");
	      const e = (i + "").match(/(\d+)\s*\/\s?(\d+)/);
	      i = e && e.length > 2 ? parseFloat(e[1]) / parseFloat(e[2]) : parseFloat(i + "");
	    } else n && s && (i = n / s);
	    if (!i) return;
	    e.style.aspectRatio = "", e.style.width = "", e.style.height = "", e.offsetHeight;
	    const o = e.getBoundingClientRect(),
	      a = o.width || 1,
	      r = o.height || 1;
	    e.style.aspectRatio = i + "", i < a / r ? (s = "auto" === s ? r : Math.min(r, s), e.style.width = "auto", e.style.height = `${s}px`) : (n = "auto" === n ? a : Math.min(a, n), e.style.width = `${n}px`, e.style.height = "auto");
	  }
	  attach() {
	    const t = this,
	      e = t.instance;
	    e.on("Carousel.beforeInitSlide", t.onBeforeInitSlide), e.on("Carousel.createSlide", t.onCreateSlide), e.on("Carousel.selectSlide", t.onSelectSlide), e.on("Carousel.unselectSlide", t.onUnselectSlide), e.on("Carousel.Panzoom.refresh", t.onRefresh), e.on("done", t.onDone), e.on("clearContent", t.onClearContent), window.addEventListener("message", t.onMessage);
	  }
	  detach() {
	    const t = this,
	      e = t.instance;
	    e.off("Carousel.beforeInitSlide", t.onBeforeInitSlide), e.off("Carousel.createSlide", t.onCreateSlide), e.off("Carousel.selectSlide", t.onSelectSlide), e.off("Carousel.unselectSlide", t.onUnselectSlide), e.off("Carousel.Panzoom.refresh", t.onRefresh), e.off("done", t.onDone), e.off("clearContent", t.onClearContent), window.removeEventListener("message", t.onMessage);
	  }
	}
	Object.defineProperty(Lt, "defaults", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: Ot
	});
	const zt = "play",
	  Rt = "pause",
	  kt = "ready";
	class It extends _ {
	  constructor() {
	    super(...arguments), Object.defineProperty(this, "state", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: kt
	    }), Object.defineProperty(this, "inHover", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: !1
	    }), Object.defineProperty(this, "timer", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "progressBar", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    });
	  }
	  get isActive() {
	    return this.state !== kt;
	  }
	  onReady(t) {
	    this.option("autoStart") && (t.isInfinite || t.page < t.pages.length - 1) && this.start();
	  }
	  onChange() {
	    this.removeProgressBar(), this.pause();
	  }
	  onSettle() {
	    this.resume();
	  }
	  onVisibilityChange() {
	    "visible" === document.visibilityState ? this.resume() : this.pause();
	  }
	  onMouseEnter() {
	    this.inHover = !0, this.pause();
	  }
	  onMouseLeave() {
	    var t;
	    this.inHover = !1, (null === (t = this.instance.panzoom) || void 0 === t ? void 0 : t.isResting) && this.resume();
	  }
	  onTimerEnd() {
	    const t = this.instance;
	    "play" === this.state && (t.isInfinite || t.page !== t.pages.length - 1 ? t.slideNext() : t.slideTo(0));
	  }
	  removeProgressBar() {
	    this.progressBar && (this.progressBar.remove(), this.progressBar = null);
	  }
	  createProgressBar() {
	    var t;
	    if (!this.option("showProgress")) return null;
	    this.removeProgressBar();
	    const e = this.instance,
	      i = (null === (t = e.pages[e.page]) || void 0 === t ? void 0 : t.slides) || [];
	    let n = this.option("progressParentEl");
	    if (n || (n = (1 === i.length ? i[0].el : null) || e.viewport), !n) return null;
	    const s = document.createElement("div");
	    return P(s, "f-progress"), n.prepend(s), this.progressBar = s, s.offsetHeight, s;
	  }
	  set() {
	    const t = this,
	      e = t.instance;
	    if (e.pages.length < 2) return;
	    if (t.timer) return;
	    const i = t.option("timeout");
	    t.state = zt, P(e.container, "has-autoplay");
	    let n = t.createProgressBar();
	    n && (n.style.transitionDuration = `${i}ms`, n.style.transform = "scaleX(1)"), t.timer = setTimeout(() => {
	      t.timer = null, t.inHover || t.onTimerEnd();
	    }, i), t.emit("set");
	  }
	  clear() {
	    const t = this;
	    t.timer && (clearTimeout(t.timer), t.timer = null), t.removeProgressBar();
	  }
	  start() {
	    const t = this;
	    if (t.set(), t.state !== kt) {
	      if (t.option("pauseOnHover")) {
	        const e = t.instance.container;
	        e.addEventListener("mouseenter", t.onMouseEnter, !1), e.addEventListener("mouseleave", t.onMouseLeave, !1);
	      }
	      document.addEventListener("visibilitychange", t.onVisibilityChange, !1), t.emit("start");
	    }
	  }
	  stop() {
	    const t = this,
	      e = t.state,
	      i = t.instance.container;
	    t.clear(), t.state = kt, i.removeEventListener("mouseenter", t.onMouseEnter, !1), i.removeEventListener("mouseleave", t.onMouseLeave, !1), document.removeEventListener("visibilitychange", t.onVisibilityChange, !1), S(i, "has-autoplay"), e !== kt && t.emit("stop");
	  }
	  pause() {
	    const t = this;
	    t.state === zt && (t.state = Rt, t.clear(), t.emit(Rt));
	  }
	  resume() {
	    const t = this,
	      e = t.instance;
	    if (e.isInfinite || e.page !== e.pages.length - 1) {
	      if (t.state !== zt) {
	        if (t.state === Rt && !t.inHover) {
	          const e = new Event("resume", {
	            bubbles: !0,
	            cancelable: !0
	          });
	          t.emit("resume", e), e.defaultPrevented || t.set();
	        }
	      } else t.set();
	    } else t.stop();
	  }
	  toggle() {
	    this.state === zt || this.state === Rt ? this.stop() : this.start();
	  }
	  attach() {
	    const t = this,
	      e = t.instance;
	    e.on("ready", t.onReady), e.on("Panzoom.startAnimation", t.onChange), e.on("Panzoom.endAnimation", t.onSettle), e.on("Panzoom.touchMove", t.onChange);
	  }
	  detach() {
	    const t = this,
	      e = t.instance;
	    e.off("ready", t.onReady), e.off("Panzoom.startAnimation", t.onChange), e.off("Panzoom.endAnimation", t.onSettle), e.off("Panzoom.touchMove", t.onChange), t.stop();
	  }
	}
	Object.defineProperty(It, "defaults", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: {
	    autoStart: !0,
	    pauseOnHover: !0,
	    progressParentEl: null,
	    showProgress: !0,
	    timeout: 3e3
	  }
	});
	class Dt extends _ {
	  constructor() {
	    super(...arguments), Object.defineProperty(this, "ref", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    });
	  }
	  onPrepare(t) {
	    const e = t.carousel;
	    if (!e) return;
	    const i = t.container;
	    i && (e.options.Autoplay = u({
	      autoStart: !1
	    }, this.option("Autoplay") || {}, {
	      pauseOnHover: !1,
	      timeout: this.option("timeout"),
	      progressParentEl: () => this.option("progressParentEl") || null,
	      on: {
	        start: () => {
	          t.emit("startSlideshow");
	        },
	        set: e => {
	          var n;
	          i.classList.add("has-slideshow"), (null === (n = t.getSlide()) || void 0 === n ? void 0 : n.state) !== lt.Ready && e.pause();
	        },
	        stop: () => {
	          i.classList.remove("has-slideshow"), t.isCompact || t.endIdle(), t.emit("endSlideshow");
	        },
	        resume: (e, i) => {
	          var n, s, o;
	          !i || !i.cancelable || (null === (n = t.getSlide()) || void 0 === n ? void 0 : n.state) === lt.Ready && (null === (o = null === (s = t.carousel) || void 0 === s ? void 0 : s.panzoom) || void 0 === o ? void 0 : o.isResting) || i.preventDefault();
	        }
	      }
	    }), e.attachPlugins({
	      Autoplay: It
	    }), this.ref = e.plugins.Autoplay);
	  }
	  onReady(t) {
	    const e = t.carousel,
	      i = this.ref;
	    i && e && this.option("playOnStart") && (e.isInfinite || e.page < e.pages.length - 1) && i.start();
	  }
	  onDone(t, e) {
	    const i = this.ref,
	      n = t.carousel;
	    if (!i || !n) return;
	    const s = e.panzoom;
	    s && s.on("startAnimation", () => {
	      t.isCurrentSlide(e) && i.stop();
	    }), t.isCurrentSlide(e) && i.resume();
	  }
	  onKeydown(t, e) {
	    var i;
	    const n = this.ref;
	    n && e === this.option("key") && "BUTTON" !== (null === (i = document.activeElement) || void 0 === i ? void 0 : i.nodeName) && n.toggle();
	  }
	  attach() {
	    const t = this,
	      e = t.instance;
	    e.on("Carousel.init", t.onPrepare), e.on("Carousel.ready", t.onReady), e.on("done", t.onDone), e.on("keydown", t.onKeydown);
	  }
	  detach() {
	    const t = this,
	      e = t.instance;
	    e.off("Carousel.init", t.onPrepare), e.off("Carousel.ready", t.onReady), e.off("done", t.onDone), e.off("keydown", t.onKeydown);
	  }
	}
	Object.defineProperty(Dt, "defaults", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: {
	    key: " ",
	    playOnStart: !1,
	    progressParentEl: t => {
	      var e;
	      return (null === (e = t.instance.container) || void 0 === e ? void 0 : e.querySelector(".fancybox__toolbar [data-fancybox-toggle-slideshow]")) || t.instance.container;
	    },
	    timeout: 3e3
	  }
	});
	const Ft = {
	  classes: {
	    container: "f-thumbs f-carousel__thumbs",
	    viewport: "f-thumbs__viewport",
	    track: "f-thumbs__track",
	    slide: "f-thumbs__slide",
	    isResting: "is-resting",
	    isSelected: "is-selected",
	    isLoading: "is-loading",
	    hasThumbs: "has-thumbs"
	  },
	  minCount: 2,
	  parentEl: null,
	  thumbTpl: '<button class="f-thumbs__slide__button" tabindex="0" type="button" aria-label="{{GOTO}}" data-carousel-index="%i"><img class="f-thumbs__slide__img" data-lazy-src="{{%s}}" alt="" /></button>',
	  type: "modern"
	};
	var jt;
	!function (t) {
	  t[t.Init = 0] = "Init", t[t.Ready = 1] = "Ready", t[t.Hidden = 2] = "Hidden";
	}(jt || (jt = {}));
	const Bt = "isResting",
	  Ht = "thumbWidth",
	  Nt = "thumbHeight",
	  _t = "thumbClipWidth";
	let $t = class extends _ {
	  constructor() {
	    super(...arguments), Object.defineProperty(this, "type", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: "modern"
	    }), Object.defineProperty(this, "container", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "track", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "carousel", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "thumbWidth", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: 0
	    }), Object.defineProperty(this, "thumbClipWidth", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: 0
	    }), Object.defineProperty(this, "thumbHeight", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: 0
	    }), Object.defineProperty(this, "thumbGap", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: 0
	    }), Object.defineProperty(this, "thumbExtraGap", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: 0
	    }), Object.defineProperty(this, "state", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: jt.Init
	    });
	  }
	  get isModern() {
	    return "modern" === this.type;
	  }
	  onInitSlide(t, e) {
	    const i = e.el ? e.el.dataset : void 0;
	    i && (e.thumbSrc = i.thumbSrc || e.thumbSrc || "", e[_t] = parseFloat(i[_t] || "") || e[_t] || 0, e[Nt] = parseFloat(i.thumbHeight || "") || e[Nt] || 0), this.addSlide(e);
	  }
	  onInitSlides() {
	    this.build();
	  }
	  onChange() {
	    var t;
	    if (!this.isModern) return;
	    const e = this.container,
	      i = this.instance,
	      n = i.panzoom,
	      s = this.carousel,
	      a = s ? s.panzoom : null,
	      r = i.page;
	    if (n && s && a) {
	      if (n.isDragging) {
	        S(e, this.cn(Bt));
	        let n = (null === (t = s.pages[r]) || void 0 === t ? void 0 : t.pos) || 0;
	        n += i.getProgress(r) * (this[_t] + this.thumbGap);
	        let o = a.getBounds();
	        -1 * n > o.x.min && -1 * n < o.x.max && a.panTo({
	          x: -1 * n,
	          friction: .12
	        });
	      } else o(e, this.cn(Bt), n.isResting);
	      this.shiftModern();
	    }
	  }
	  onRefresh() {
	    this.updateProps();
	    for (const t of this.instance.slides || []) this.resizeModernSlide(t);
	    this.shiftModern();
	  }
	  isDisabled() {
	    const t = this.option("minCount") || 0;
	    if (t) {
	      const e = this.instance;
	      let i = 0;
	      for (const t of e.slides || []) t.thumbSrc && i++;
	      if (i < t) return !0;
	    }
	    const e = this.option("type");
	    return ["modern", "classic"].indexOf(e) < 0;
	  }
	  getThumb(t) {
	    const e = this.option("thumbTpl") || "";
	    return {
	      html: this.instance.localize(e, [["%i", t.index], ["%d", t.index + 1], ["%s", t.thumbSrc || "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"]])
	    };
	  }
	  addSlide(t) {
	    const e = this.carousel;
	    e && e.addSlide(t.index, this.getThumb(t));
	  }
	  getSlides() {
	    const t = [];
	    for (const e of this.instance.slides || []) t.push(this.getThumb(e));
	    return t;
	  }
	  resizeModernSlide(t) {
	    this.isModern && (t[Ht] = t[_t] && t[Nt] ? Math.round(this[Nt] * (t[_t] / t[Nt])) : this[Ht]);
	  }
	  updateProps() {
	    const t = this.container;
	    if (!t) return;
	    const e = e => parseFloat(getComputedStyle(t).getPropertyValue("--f-thumb-" + e)) || 0;
	    this.thumbGap = e("gap"), this.thumbExtraGap = e("extra-gap"), this[Ht] = e("width") || 40, this[_t] = e("clip-width") || 40, this[Nt] = e("height") || 40;
	  }
	  build() {
	    const t = this;
	    if (t.state !== jt.Init) return;
	    if (t.isDisabled()) return void t.emit("disabled");
	    const e = t.instance,
	      i = e.container,
	      n = t.getSlides(),
	      s = t.option("type");
	    t.type = s;
	    const o = t.option("parentEl"),
	      a = t.cn("container"),
	      r = t.cn("track");
	    let l = null == o ? void 0 : o.querySelector("." + a);
	    l || (l = document.createElement("div"), P(l, a), o ? o.appendChild(l) : i.after(l)), P(l, `is-${s}`), P(i, t.cn("hasThumbs")), t.container = l, t.updateProps();
	    let c = l.querySelector("." + r);
	    c || (c = document.createElement("div"), P(c, t.cn("track")), l.appendChild(c)), t.track = c;
	    const h = u({}, {
	        track: c,
	        infinite: !1,
	        center: !0,
	        fill: "classic" === s,
	        dragFree: !0,
	        slidesPerPage: 1,
	        transition: !1,
	        preload: .25,
	        friction: .12,
	        Panzoom: {
	          maxVelocity: 0
	        },
	        Dots: !1,
	        Navigation: !1,
	        classes: {
	          container: "f-thumbs",
	          viewport: "f-thumbs__viewport",
	          track: "f-thumbs__track",
	          slide: "f-thumbs__slide"
	        }
	      }, t.option("Carousel") || {}, {
	        Sync: {
	          target: e
	        },
	        slides: n
	      }),
	      d = new e.constructor(l, h);
	    d.on("createSlide", (e, i) => {
	      t.setProps(i.index), t.emit("createSlide", i, i.el);
	    }), d.on("ready", () => {
	      t.shiftModern(), t.emit("ready");
	    }), d.on("refresh", () => {
	      t.shiftModern();
	    }), d.on("Panzoom.click", (e, i, n) => {
	      t.onClick(n);
	    }), t.carousel = d, t.state = jt.Ready;
	  }
	  onClick(t) {
	    t.preventDefault(), t.stopPropagation();
	    const e = this.instance,
	      {
	        pages: i,
	        page: n
	      } = e,
	      s = t => {
	        if (t) {
	          const e = t.closest("[data-carousel-index]");
	          if (e) return [parseInt(e.dataset.carouselIndex || "", 10) || 0, e];
	        }
	        return [-1, void 0];
	      },
	      o = (t, e) => {
	        const i = document.elementFromPoint(t, e);
	        return i ? s(i) : [-1, void 0];
	      };
	    let [a, r] = s(t.target);
	    if (a > -1) return;
	    const l = this[_t],
	      c = t.clientX,
	      h = t.clientY;
	    let [d, u] = o(c - l, h),
	      [p, f] = o(c + l, h);
	    u && f ? (a = Math.abs(c - u.getBoundingClientRect().right) < Math.abs(c - f.getBoundingClientRect().left) ? d : p, a === n && (a = a === d ? p : d)) : u ? a = d : f && (a = p), a > -1 && i[a] && e.slideTo(a);
	  }
	  getShift(t) {
	    var e;
	    const i = this,
	      {
	        instance: n
	      } = i,
	      s = i.carousel;
	    if (!n || !s) return 0;
	    const o = i[Ht],
	      a = i[_t],
	      r = i.thumbGap,
	      l = i.thumbExtraGap;
	    if (!(null === (e = s.slides[t]) || void 0 === e ? void 0 : e.el)) return 0;
	    const c = .5 * (o - a),
	      h = n.pages.length - 1;
	    let d = n.getProgress(0),
	      u = n.getProgress(h),
	      p = n.getProgress(t, !1, !0),
	      f = 0,
	      g = c + l + r;
	    const m = d < 0 && d > -1,
	      v = u > 0 && u < 1;
	    return 0 === t ? (f = g * Math.abs(d), v && 1 === d && (f -= g * Math.abs(u))) : t === h ? (f = g * Math.abs(u) * -1, m && -1 === u && (f += g * Math.abs(d))) : m || v ? (f = -1 * g, f += g * Math.abs(d), f += g * (1 - Math.abs(u))) : f = g * p, f;
	  }
	  setProps(e) {
	    var i;
	    const n = this;
	    if (!n.isModern) return;
	    const {
	        instance: s
	      } = n,
	      o = n.carousel;
	    if (s && o) {
	      const a = null === (i = o.slides[e]) || void 0 === i ? void 0 : i.el;
	      if (a && a.childNodes.length) {
	        let i = t(1 - Math.abs(s.getProgress(e))),
	          o = t(n.getShift(e));
	        a.style.setProperty("--progress", i ? i + "" : ""), a.style.setProperty("--shift", o + "");
	      }
	    }
	  }
	  shiftModern() {
	    const t = this;
	    if (!t.isModern) return;
	    const {
	        instance: e,
	        track: i
	      } = t,
	      n = e.panzoom,
	      s = t.carousel;
	    if (!(e && i && n && s)) return;
	    if (n.state === m.Init || n.state === m.Destroy) return;
	    for (const i of e.slides) t.setProps(i.index);
	    let o = (t[_t] + t.thumbGap) * (s.slides.length || 0);
	    i.style.setProperty("--width", o + "");
	  }
	  cleanup() {
	    const t = this;
	    t.carousel && t.carousel.destroy(), t.carousel = null, t.container && t.container.remove(), t.container = null, t.track && t.track.remove(), t.track = null, t.state = jt.Init, S(t.instance.container, t.cn("hasThumbs"));
	  }
	  attach() {
	    const t = this,
	      e = t.instance;
	    e.on("initSlide", t.onInitSlide), e.state === B.Init ? e.on("initSlides", t.onInitSlides) : t.onInitSlides(), e.on(["change", "Panzoom.afterTransform"], t.onChange), e.on("Panzoom.refresh", t.onRefresh);
	  }
	  detach() {
	    const t = this,
	      e = t.instance;
	    e.off("initSlide", t.onInitSlide), e.off("initSlides", t.onInitSlides), e.off(["change", "Panzoom.afterTransform"], t.onChange), e.off("Panzoom.refresh", t.onRefresh), t.cleanup();
	  }
	};
	Object.defineProperty($t, "defaults", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: Ft
	});
	const Wt = Object.assign(Object.assign({}, Ft), {
	    key: "t",
	    showOnStart: !0,
	    parentEl: null
	  }),
	  Xt = "is-masked",
	  qt = "aria-hidden";
	class Yt extends _ {
	  constructor() {
	    super(...arguments), Object.defineProperty(this, "ref", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "hidden", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: !1
	    });
	  }
	  get isEnabled() {
	    const t = this.ref;
	    return t && !t.isDisabled();
	  }
	  get isHidden() {
	    return this.hidden;
	  }
	  onClick(t, e) {
	    e.stopPropagation();
	  }
	  onCreateSlide(t, e) {
	    var i, n, s;
	    const o = (null === (s = null === (n = null === (i = this.instance) || void 0 === i ? void 0 : i.carousel) || void 0 === n ? void 0 : n.slides[e.index]) || void 0 === s ? void 0 : s.type) || "",
	      a = e.el;
	    if (a && o) {
	      let t = `for-${o}`;
	      ["video", "youtube", "vimeo", "html5video"].includes(o) && (t += " for-video"), P(a, t);
	    }
	  }
	  onInit() {
	    var t;
	    const e = this,
	      i = e.instance,
	      n = i.carousel;
	    if (e.ref || !n) return;
	    const s = e.option("parentEl") || i.footer || i.container;
	    if (!s) return;
	    const o = u({}, e.options, {
	      parentEl: s,
	      classes: {
	        container: "f-thumbs fancybox__thumbs"
	      },
	      Carousel: {
	        Sync: {
	          friction: i.option("Carousel.friction") || 0
	        }
	      },
	      on: {
	        ready: t => {
	          const i = t.container;
	          i && this.hidden && (e.refresh(), i.style.transition = "none", e.hide(), i.offsetHeight, queueMicrotask(() => {
	            i.style.transition = "", e.show();
	          }));
	        }
	      }
	    });
	    o.Carousel = o.Carousel || {}, o.Carousel.on = u((null === (t = e.options.Carousel) || void 0 === t ? void 0 : t.on) || {}, {
	      click: this.onClick,
	      createSlide: this.onCreateSlide
	    }), n.options.Thumbs = o, n.attachPlugins({
	      Thumbs: $t
	    }), e.ref = n.plugins.Thumbs, e.option("showOnStart") || (e.ref.state = jt.Hidden, e.hidden = !0);
	  }
	  onResize() {
	    var t;
	    const e = null === (t = this.ref) || void 0 === t ? void 0 : t.container;
	    e && (e.style.maxHeight = "");
	  }
	  onKeydown(t, e) {
	    const i = this.option("key");
	    i && i === e && this.toggle();
	  }
	  toggle() {
	    const t = this.ref;
	    if (t && !t.isDisabled()) return t.state === jt.Hidden ? (t.state = jt.Init, void t.build()) : void (this.hidden ? this.show() : this.hide());
	  }
	  show() {
	    const t = this.ref;
	    if (!t || t.isDisabled()) return;
	    const e = t.container;
	    e && (this.refresh(), e.offsetHeight, e.removeAttribute(qt), e.classList.remove(Xt), this.hidden = !1);
	  }
	  hide() {
	    const t = this.ref,
	      e = t && t.container;
	    e && (this.refresh(), e.offsetHeight, e.classList.add(Xt), e.setAttribute(qt, "true")), this.hidden = !0;
	  }
	  refresh() {
	    const t = this.ref;
	    if (!t || !t.state) return;
	    const e = t.container,
	      i = (null == e ? void 0 : e.firstChild) || null;
	    e && i && i.childNodes.length && (e.style.maxHeight = `${i.getBoundingClientRect().height}px`);
	  }
	  attach() {
	    const t = this,
	      e = t.instance;
	    e.state === rt.Init ? e.on("Carousel.init", t.onInit) : t.onInit(), e.on("resize", t.onResize), e.on("keydown", t.onKeydown);
	  }
	  detach() {
	    var t;
	    const e = this,
	      i = e.instance;
	    i.off("Carousel.init", e.onInit), i.off("resize", e.onResize), i.off("keydown", e.onKeydown), null === (t = i.carousel) || void 0 === t || t.detachPlugins(["Thumbs"]), e.ref = null;
	  }
	}
	Object.defineProperty(Yt, "defaults", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: Wt
	});
	const Vt = {
	  panLeft: {
	    icon: '<svg><path d="M5 12h14M5 12l6 6M5 12l6-6"/></svg>',
	    change: {
	      panX: -100
	    }
	  },
	  panRight: {
	    icon: '<svg><path d="M5 12h14M13 18l6-6M13 6l6 6"/></svg>',
	    change: {
	      panX: 100
	    }
	  },
	  panUp: {
	    icon: '<svg><path d="M12 5v14M18 11l-6-6M6 11l6-6"/></svg>',
	    change: {
	      panY: -100
	    }
	  },
	  panDown: {
	    icon: '<svg><path d="M12 5v14M18 13l-6 6M6 13l6 6"/></svg>',
	    change: {
	      panY: 100
	    }
	  },
	  zoomIn: {
	    icon: '<svg><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/></svg>',
	    action: "zoomIn"
	  },
	  zoomOut: {
	    icon: '<svg><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35M8 11h6"/></svg>',
	    action: "zoomOut"
	  },
	  toggle1to1: {
	    icon: '<svg><path d="M3.51 3.07c5.74.02 11.48-.02 17.22.02 1.37.1 2.34 1.64 2.18 3.13 0 4.08.02 8.16 0 12.23-.1 1.54-1.47 2.64-2.79 2.46-5.61-.01-11.24.02-16.86-.01-1.36-.12-2.33-1.65-2.17-3.14 0-4.07-.02-8.16 0-12.23.1-1.36 1.22-2.48 2.42-2.46Z"/><path d="M5.65 8.54h1.49v6.92m8.94-6.92h1.49v6.92M11.5 9.4v.02m0 5.18v0"/></svg>',
	    action: "toggleZoom"
	  },
	  toggleZoom: {
	    icon: '<svg><g><line x1="11" y1="8" x2="11" y2="14"></line></g><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35M8 11h6"/></svg>',
	    action: "toggleZoom"
	  },
	  iterateZoom: {
	    icon: '<svg><g><line x1="11" y1="8" x2="11" y2="14"></line></g><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35M8 11h6"/></svg>',
	    action: "iterateZoom"
	  },
	  rotateCCW: {
	    icon: '<svg><path d="M15 4.55a8 8 0 0 0-6 14.9M9 15v5H4M18.37 7.16v.01M13 19.94v.01M16.84 18.37v.01M19.37 15.1v.01M19.94 11v.01"/></svg>',
	    action: "rotateCCW"
	  },
	  rotateCW: {
	    icon: '<svg><path d="M9 4.55a8 8 0 0 1 6 14.9M15 15v5h5M5.63 7.16v.01M4.06 11v.01M4.63 15.1v.01M7.16 18.37v.01M11 19.94v.01"/></svg>',
	    action: "rotateCW"
	  },
	  flipX: {
	    icon: '<svg style="stroke-width: 1.3"><path d="M12 3v18M16 7v10h5L16 7M8 7v10H3L8 7"/></svg>',
	    action: "flipX"
	  },
	  flipY: {
	    icon: '<svg style="stroke-width: 1.3"><path d="M3 12h18M7 16h10L7 21v-5M7 8h10L7 3v5"/></svg>',
	    action: "flipY"
	  },
	  fitX: {
	    icon: '<svg><path d="M4 12V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6M10 18H3M21 18h-7M6 15l-3 3 3 3M18 15l3 3-3 3"/></svg>',
	    action: "fitX"
	  },
	  fitY: {
	    icon: '<svg><path d="M12 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6M18 14v7M18 3v7M15 18l3 3 3-3M15 6l3-3 3 3"/></svg>',
	    action: "fitY"
	  },
	  reset: {
	    icon: '<svg><path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/></svg>',
	    action: "reset"
	  },
	  toggleFS: {
	    icon: '<svg><g><path d="M14.5 9.5 21 3m0 0h-6m6 0v6M3 21l6.5-6.5M3 21v-6m0 6h6"/></g><g><path d="m14 10 7-7m-7 7h6m-6 0V4M3 21l7-7m0 0v6m0-6H4"/></g></svg>',
	    action: "toggleFS"
	  }
	};
	var Zt;
	!function (t) {
	  t[t.Init = 0] = "Init", t[t.Ready = 1] = "Ready", t[t.Disabled = 2] = "Disabled";
	}(Zt || (Zt = {}));
	const Ut = {
	    absolute: "auto",
	    display: {
	      left: ["infobar"],
	      middle: [],
	      right: ["iterateZoom", "slideshow", "fullscreen", "thumbs", "close"]
	    },
	    enabled: "auto",
	    items: {
	      infobar: {
	        tpl: '<div class="fancybox__infobar" tabindex="-1"><span data-fancybox-current-index></span>/<span data-fancybox-count></span></div>'
	      },
	      download: {
	        tpl: '<a class="f-button" title="{{DOWNLOAD}}" data-fancybox-download href="javasript:;"><svg><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12"/></svg></a>'
	      },
	      prev: {
	        tpl: '<button class="f-button" title="{{PREV}}" data-fancybox-prev><svg><path d="m15 6-6 6 6 6"/></svg></button>'
	      },
	      next: {
	        tpl: '<button class="f-button" title="{{NEXT}}" data-fancybox-next><svg><path d="m9 6 6 6-6 6"/></svg></button>'
	      },
	      slideshow: {
	        tpl: '<button class="f-button" title="{{TOGGLE_SLIDESHOW}}" data-fancybox-toggle-slideshow><svg><g><path d="M8 4v16l13 -8z"></path></g><g><path d="M8 4v15M17 4v15"/></g></svg></button>'
	      },
	      fullscreen: {
	        tpl: '<button class="f-button" title="{{TOGGLE_FULLSCREEN}}" data-fancybox-toggle-fullscreen><svg><g><path d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v2M16 20h2a2 2 0 0 0 2-2v-2"/></g><g><path d="M15 19v-2a2 2 0 0 1 2-2h2M15 5v2a2 2 0 0 0 2 2h2M5 15h2a2 2 0 0 1 2 2v2M5 9h2a2 2 0 0 0 2-2V5"/></g></svg></button>'
	      },
	      thumbs: {
	        tpl: '<button class="f-button" title="{{TOGGLE_THUMBS}}" data-fancybox-toggle-thumbs><svg><circle cx="5.5" cy="5.5" r="1"/><circle cx="12" cy="5.5" r="1"/><circle cx="18.5" cy="5.5" r="1"/><circle cx="5.5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18.5" cy="12" r="1"/><circle cx="5.5" cy="18.5" r="1"/><circle cx="12" cy="18.5" r="1"/><circle cx="18.5" cy="18.5" r="1"/></svg></button>'
	      },
	      close: {
	        tpl: '<button class="f-button" title="{{CLOSE}}" data-fancybox-close><svg><path d="m19.5 4.5-15 15M4.5 4.5l15 15"/></svg></button>'
	      }
	    },
	    parentEl: null
	  },
	  Gt = {
	    tabindex: "-1",
	    width: "24",
	    height: "24",
	    viewBox: "0 0 24 24",
	    xmlns: "http://www.w3.org/2000/svg"
	  },
	  Kt = "has-toolbar",
	  Jt = "fancybox__toolbar";
	class Qt extends _ {
	  constructor() {
	    super(...arguments), Object.defineProperty(this, "state", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: Zt.Init
	    }), Object.defineProperty(this, "container", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    });
	  }
	  onReady(t) {
	    var e;
	    if (!t.carousel) return;
	    let i = this.option("display"),
	      n = this.option("absolute"),
	      s = this.option("enabled");
	    if ("auto" === s) {
	      const t = this.instance.carousel;
	      let e = 0;
	      if (t) for (const i of t.slides) (i.panzoom || "image" === i.type) && e++;
	      e || (s = !1);
	    }
	    s || (i = void 0);
	    let o = 0;
	    const a = {
	      left: [],
	      middle: [],
	      right: []
	    };
	    if (i) for (const t of ["left", "middle", "right"]) for (const n of i[t]) {
	      const i = this.createEl(n);
	      i && (null === (e = a[t]) || void 0 === e || e.push(i), o++);
	    }
	    let r = null;
	    if (o && (r = this.createContainer()), r) {
	      for (const [t, e] of Object.entries(a)) {
	        const i = document.createElement("div");
	        P(i, Jt + "__column is-" + t);
	        for (const t of e) i.appendChild(t);
	        "auto" !== n || "middle" !== t || e.length || (n = !0), r.appendChild(i);
	      }
	      !0 === n && P(r, "is-absolute"), this.state = Zt.Ready, this.onRefresh();
	    } else this.state = Zt.Disabled;
	  }
	  onClick(t) {
	    var e, i;
	    const n = this.instance,
	      s = n.getSlide(),
	      o = null == s ? void 0 : s.panzoom,
	      a = t.target,
	      r = a && E(a) ? a.dataset : null;
	    if (!r) return;
	    if (void 0 !== r.fancyboxToggleThumbs) return t.preventDefault(), t.stopPropagation(), void (null === (e = n.plugins.Thumbs) || void 0 === e || e.toggle());
	    if (void 0 !== r.fancyboxToggleFullscreen) return t.preventDefault(), t.stopPropagation(), void this.instance.toggleFullscreen();
	    if (void 0 !== r.fancyboxToggleSlideshow) {
	      t.preventDefault(), t.stopPropagation();
	      const e = null === (i = n.carousel) || void 0 === i ? void 0 : i.plugins.Autoplay;
	      let s = e.isActive;
	      return o && "mousemove" === o.panMode && !s && o.reset(), void (s ? e.stop() : e.start());
	    }
	    const l = r.panzoomAction,
	      c = r.panzoomChange;
	    if ((c || l) && (t.preventDefault(), t.stopPropagation()), c) {
	      let t = {};
	      try {
	        t = JSON.parse(c);
	      } catch (t) {}
	      o && o.applyChange(t);
	    } else l && o && o[l] && o[l]();
	  }
	  onChange() {
	    this.onRefresh();
	  }
	  onRefresh() {
	    if (this.instance.isClosing()) return;
	    const t = this.container;
	    if (!t) return;
	    const e = this.instance.getSlide();
	    if (!e || e.state !== lt.Ready) return;
	    const i = e && !e.error && e.panzoom;
	    for (const e of t.querySelectorAll("[data-panzoom-action]")) i ? (e.removeAttribute("disabled"), e.removeAttribute("tabindex")) : (e.setAttribute("disabled", ""), e.setAttribute("tabindex", "-1"));
	    let n = i && i.canZoomIn(),
	      s = i && i.canZoomOut();
	    for (const e of t.querySelectorAll('[data-panzoom-action="zoomIn"]')) n ? (e.removeAttribute("disabled"), e.removeAttribute("tabindex")) : (e.setAttribute("disabled", ""), e.setAttribute("tabindex", "-1"));
	    for (const e of t.querySelectorAll('[data-panzoom-action="zoomOut"]')) s ? (e.removeAttribute("disabled"), e.removeAttribute("tabindex")) : (e.setAttribute("disabled", ""), e.setAttribute("tabindex", "-1"));
	    for (const e of t.querySelectorAll('[data-panzoom-action="toggleZoom"],[data-panzoom-action="iterateZoom"]')) {
	      s || n ? (e.removeAttribute("disabled"), e.removeAttribute("tabindex")) : (e.setAttribute("disabled", ""), e.setAttribute("tabindex", "-1"));
	      const t = e.querySelector("g");
	      t && (t.style.display = n ? "" : "none");
	    }
	  }
	  onDone(t, e) {
	    var i;
	    null === (i = e.panzoom) || void 0 === i || i.on("afterTransform", () => {
	      this.instance.isCurrentSlide(e) && this.onRefresh();
	    }), this.instance.isCurrentSlide(e) && this.onRefresh();
	  }
	  createContainer() {
	    const t = this.instance.container;
	    if (!t) return null;
	    const e = this.option("parentEl") || t;
	    let i = e.querySelector("." + Jt);
	    return i || (i = document.createElement("div"), P(i, Jt), e.prepend(i)), i.addEventListener("click", this.onClick, {
	      passive: !1,
	      capture: !0
	    }), t && P(t, Kt), this.container = i, i;
	  }
	  createEl(t) {
	    const e = this.instance,
	      i = e.carousel;
	    if (!i) return null;
	    if ("toggleFS" === t) return null;
	    if ("fullscreen" === t && !ot()) return null;
	    let s = null;
	    const o = i.slides.length || 0;
	    let a = 0,
	      r = 0;
	    for (const t of i.slides) (t.panzoom || "image" === t.type) && a++, ("image" === t.type || t.downloadSrc) && r++;
	    if (o < 2 && ["infobar", "prev", "next"].includes(t)) return s;
	    if (void 0 !== Vt[t] && !a) return null;
	    if ("download" === t && !r) return null;
	    if ("thumbs" === t) {
	      const t = e.plugins.Thumbs;
	      if (!t || !t.isEnabled) return null;
	    }
	    if ("slideshow" === t) {
	      if (!i.plugins.Autoplay || o < 2) return null;
	    }
	    if (void 0 !== Vt[t]) {
	      const e = Vt[t];
	      s = document.createElement("button"), s.setAttribute("title", this.instance.localize(`{{${t.toUpperCase()}}}`)), P(s, "f-button"), e.action && (s.dataset.panzoomAction = e.action), e.change && (s.dataset.panzoomChange = JSON.stringify(e.change)), s.appendChild(n(this.instance.localize(e.icon)));
	    } else {
	      const e = (this.option("items") || [])[t];
	      e && (s = n(this.instance.localize(e.tpl)), "function" == typeof e.click && s.addEventListener("click", t => {
	        t.preventDefault(), t.stopPropagation(), "function" == typeof e.click && e.click.call(this, this, t);
	      }));
	    }
	    const l = null == s ? void 0 : s.querySelector("svg");
	    if (l) for (const [t, e] of Object.entries(Gt)) l.getAttribute(t) || l.setAttribute(t, String(e));
	    return s;
	  }
	  removeContainer() {
	    const t = this.container;
	    t && t.remove(), this.container = null, this.state = Zt.Disabled;
	    const e = this.instance.container;
	    e && S(e, Kt);
	  }
	  attach() {
	    const t = this,
	      e = t.instance;
	    e.on("Carousel.initSlides", t.onReady), e.on("done", t.onDone), e.on(["reveal", "Carousel.change"], t.onChange), t.onReady(t.instance);
	  }
	  detach() {
	    const t = this,
	      e = t.instance;
	    e.off("Carousel.initSlides", t.onReady), e.off("done", t.onDone), e.off(["reveal", "Carousel.change"], t.onChange), t.removeContainer();
	  }
	}
	Object.defineProperty(Qt, "defaults", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: Ut
	});
	const te = {
	    Hash: class extends _ {
	      onReady() {
	        ht = !1;
	      }
	      onChange(t) {
	        ut && clearTimeout(ut);
	        const {
	            hash: e
	          } = pt(),
	          {
	            hash: i
	          } = ft(),
	          n = t.isOpeningSlide(t.getSlide());
	        n && (ct = i === e ? "" : i), e && e !== i && (ut = setTimeout(() => {
	          try {
	            if (t.state === rt.Ready) {
	              let t = "replaceState";
	              n && !dt && (t = "pushState", dt = !0), window.history[t]({}, document.title, window.location.pathname + window.location.search + e);
	            }
	          } catch (t) {}
	        }, 300));
	      }
	      onClose(t) {
	        if (ut && clearTimeout(ut), !ht && dt) return dt = !1, ht = !1, void window.history.back();
	        if (!ht) try {
	          window.history.replaceState({}, document.title, window.location.pathname + window.location.search + (ct || ""));
	        } catch (t) {}
	      }
	      attach() {
	        const t = this.instance;
	        t.on("ready", this.onReady), t.on(["Carousel.ready", "Carousel.change"], this.onChange), t.on("close", this.onClose);
	      }
	      detach() {
	        const t = this.instance;
	        t.off("ready", this.onReady), t.off(["Carousel.ready", "Carousel.change"], this.onChange), t.off("close", this.onClose);
	      }
	      static parseURL() {
	        return ft();
	      }
	      static startFromUrl() {
	        gt();
	      }
	      static destroy() {
	        window.removeEventListener("hashchange", vt, !1);
	      }
	    },
	    Html: Lt,
	    Images: wt,
	    Slideshow: Dt,
	    Thumbs: Yt,
	    Toolbar: Qt
	  },
	  ee = "with-fancybox",
	  ie = "hide-scrollbar",
	  ne = "--fancybox-scrollbar-compensate",
	  se = "--fancybox-body-margin",
	  oe = "aria-hidden",
	  ae = "is-using-tab",
	  re = "is-animated",
	  le = "is-compact",
	  ce = "is-loading",
	  he = "is-opening",
	  de = "has-caption",
	  ue = "disabled",
	  pe = "tabindex",
	  fe = "download",
	  ge = "href",
	  me = "src",
	  ve = t => "string" == typeof t,
	  be = function () {
	    var t = window.getSelection();
	    return !!t && "Range" === t.type;
	  };
	let ye,
	  we = null,
	  xe = null,
	  Ee = 0,
	  Se = 0,
	  Pe = 0,
	  Ce = 0;
	const Te = new Map();
	let Me = 0;
	class Oe extends g {
	  get isIdle() {
	    return this.idle;
	  }
	  get isCompact() {
	    return this.option("compact");
	  }
	  constructor(t = [], e = {}, i = {}) {
	    super(e), Object.defineProperty(this, "userSlides", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: []
	    }), Object.defineProperty(this, "userPlugins", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: {}
	    }), Object.defineProperty(this, "idle", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: !1
	    }), Object.defineProperty(this, "idleTimer", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "clickTimer", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "pwt", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: 0
	    }), Object.defineProperty(this, "ignoreFocusChange", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: !1
	    }), Object.defineProperty(this, "startedFs", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: !1
	    }), Object.defineProperty(this, "state", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: rt.Init
	    }), Object.defineProperty(this, "id", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: 0
	    }), Object.defineProperty(this, "container", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "caption", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "footer", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "carousel", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "lastFocus", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: null
	    }), Object.defineProperty(this, "prevMouseMoveEvent", {
	      enumerable: !0,
	      configurable: !0,
	      writable: !0,
	      value: void 0
	    }), ye || (ye = ot()), this.id = e.id || ++Me, Te.set(this.id, this), this.userSlides = t, this.userPlugins = i, queueMicrotask(() => {
	      this.init();
	    });
	  }
	  init() {
	    if (this.state === rt.Destroy) return;
	    this.state = rt.Init, this.attachPlugins(Object.assign(Object.assign({}, Oe.Plugins), this.userPlugins)), this.emit("init"), this.emit("attachPlugins"), !0 === this.option("hideScrollbar") && (() => {
	      if (!et) return;
	      const t = document,
	        e = t.body,
	        i = t.documentElement;
	      if (e.classList.contains(ie)) return;
	      let n = window.innerWidth - i.getBoundingClientRect().width;
	      const s = parseFloat(window.getComputedStyle(e).marginRight);
	      n < 0 && (n = 0), i.style.setProperty(ne, `${n}px`), s && e.style.setProperty(se, `${s}px`), e.classList.add(ie);
	    })(), this.initLayout(), this.scale();
	    const t = () => {
	      this.initCarousel(this.userSlides), this.state = rt.Ready, this.attachEvents(), this.emit("ready"), setTimeout(() => {
	        this.container && this.container.setAttribute(oe, "false");
	      }, 16);
	    };
	    this.option("Fullscreen.autoStart") && ye && !ye.isFullscreen() ? ye.request().then(() => {
	      this.startedFs = !0, t();
	    }).catch(() => t()) : t();
	  }
	  initLayout() {
	    var t, e;
	    const i = this.option("parentEl") || document.body,
	      s = n(this.localize(this.option("tpl.main") || ""));
	    if (s) {
	      if (s.setAttribute("id", `fancybox-${this.id}`), s.setAttribute("aria-label", this.localize("{{MODAL}}")), s.classList.toggle(le, this.isCompact), P(s, this.option("mainClass") || ""), P(s, he), this.container = s, this.footer = s.querySelector(".fancybox__footer"), i.appendChild(s), P(document.documentElement, ee), we && xe || (we = document.createElement("span"), P(we, "fancybox-focus-guard"), we.setAttribute(pe, "0"), we.setAttribute(oe, "true"), we.setAttribute("aria-label", "Focus guard"), xe = we.cloneNode(), null === (t = s.parentElement) || void 0 === t || t.insertBefore(we, s), null === (e = s.parentElement) || void 0 === e || e.append(xe)), s.addEventListener("mousedown", t => {
	        Ee = t.pageX, Se = t.pageY, S(s, ae);
	      }), this.option("closeExisting")) for (const t of Te.values()) t.id !== this.id && t.close();else this.option("animated") && (P(s, re), setTimeout(() => {
	        this.isClosing() || S(s, re);
	      }, 350));
	      this.emit("initLayout");
	    }
	  }
	  initCarousel(t) {
	    const i = this.container;
	    if (!i) return;
	    const n = i.querySelector(".fancybox__carousel");
	    if (!n) return;
	    const s = this.carousel = new Q(n, u({}, {
	      slides: t,
	      transition: "fade",
	      Panzoom: {
	        lockAxis: this.option("dragToClose") ? "xy" : "x",
	        infinite: !!this.option("dragToClose") && "y"
	      },
	      Dots: !1,
	      Navigation: {
	        classes: {
	          container: "fancybox__nav",
	          button: "f-button",
	          isNext: "is-next",
	          isPrev: "is-prev"
	        }
	      },
	      initialPage: this.option("startIndex"),
	      l10n: this.option("l10n")
	    }, this.option("Carousel") || {}));
	    s.on("*", (t, e, ...i) => {
	      this.emit(`Carousel.${e}`, t, ...i);
	    }), s.on(["ready", "change"], () => {
	      this.manageCaption();
	    }), this.on("Carousel.removeSlide", (t, e, i) => {
	      this.clearContent(i), i.state = void 0;
	    }), s.on("Panzoom.touchStart", () => {
	      var t, e;
	      this.isCompact || this.endIdle(), (null === (t = document.activeElement) || void 0 === t ? void 0 : t.closest(".f-thumbs")) && (null === (e = this.container) || void 0 === e || e.focus());
	    }), s.on("settle", () => {
	      this.idleTimer || this.isCompact || !this.option("idle") || this.setIdle(), this.option("autoFocus") && !this.isClosing && this.checkFocus();
	    }), this.option("dragToClose") && (s.on("Panzoom.afterTransform", (t, i) => {
	      const n = this.getSlide();
	      if (n && e(n.el)) return;
	      const s = this.container;
	      if (s) {
	        const t = Math.abs(i.current.f),
	          e = t < 1 ? "" : Math.max(.5, Math.min(1, 1 - t / i.contentRect.fitHeight * 1.5));
	        s.style.setProperty("--fancybox-ts", e ? "0s" : ""), s.style.setProperty("--fancybox-opacity", e + "");
	      }
	    }), s.on("Panzoom.touchEnd", (t, i, n) => {
	      var s;
	      const o = this.getSlide();
	      if (o && e(o.el)) return;
	      if (i.isMobile && document.activeElement && -1 !== ["TEXTAREA", "INPUT"].indexOf(null === (s = document.activeElement) || void 0 === s ? void 0 : s.nodeName)) return;
	      const a = Math.abs(i.dragOffset.y);
	      "y" === i.lockedAxis && (a >= 200 || a >= 50 && i.dragOffset.time < 300) && (n && n.cancelable && n.preventDefault(), this.close(n, "f-throwOut" + (i.current.f < 0 ? "Up" : "Down")));
	    })), s.on("change", t => {
	      var e;
	      let i = null === (e = this.getSlide()) || void 0 === e ? void 0 : e.triggerEl;
	      if (i) {
	        const e = new CustomEvent("slideTo", {
	          bubbles: !0,
	          cancelable: !0,
	          detail: t.page
	        });
	        i.dispatchEvent(e);
	      }
	    }), s.on(["refresh", "change"], t => {
	      const e = this.container;
	      if (!e) return;
	      for (const i of e.querySelectorAll("[data-fancybox-current-index]")) i.innerHTML = t.page + 1;
	      for (const i of e.querySelectorAll("[data-fancybox-count]")) i.innerHTML = t.pages.length;
	      if (!t.isInfinite) {
	        for (const i of e.querySelectorAll("[data-fancybox-next]")) t.page < t.pages.length - 1 ? (i.removeAttribute(ue), i.removeAttribute(pe)) : (i.setAttribute(ue, ""), i.setAttribute(pe, "-1"));
	        for (const i of e.querySelectorAll("[data-fancybox-prev]")) t.page > 0 ? (i.removeAttribute(ue), i.removeAttribute(pe)) : (i.setAttribute(ue, ""), i.setAttribute(pe, "-1"));
	      }
	      const i = this.getSlide();
	      if (!i) return;
	      let n = i.downloadSrc || "";
	      n || "image" !== i.type || i.error || !ve(i[me]) || (n = i[me]);
	      for (const t of e.querySelectorAll("[data-fancybox-download]")) {
	        const e = i.downloadFilename;
	        n ? (t.removeAttribute(ue), t.removeAttribute(pe), t.setAttribute(ge, n), t.setAttribute(fe, e || n), t.setAttribute("target", "_blank")) : (t.setAttribute(ue, ""), t.setAttribute(pe, "-1"), t.removeAttribute(ge), t.removeAttribute(fe));
	      }
	    }), this.emit("initCarousel");
	  }
	  attachEvents() {
	    const t = this,
	      e = t.container;
	    if (!e) return;
	    e.addEventListener("click", t.onClick, {
	      passive: !1,
	      capture: !1
	    }), e.addEventListener("wheel", t.onWheel, {
	      passive: !1,
	      capture: !1
	    }), document.addEventListener("keydown", t.onKeydown, {
	      passive: !1,
	      capture: !0
	    }), document.addEventListener("visibilitychange", t.onVisibilityChange, !1), document.addEventListener("mousemove", t.onMousemove), t.option("trapFocus") && document.addEventListener("focus", t.onFocus, !0), window.addEventListener("resize", t.onResize);
	    const i = window.visualViewport;
	    i && (i.addEventListener("scroll", t.onResize), i.addEventListener("resize", t.onResize));
	  }
	  detachEvents() {
	    const t = this,
	      e = t.container;
	    if (!e) return;
	    document.removeEventListener("keydown", t.onKeydown, {
	      passive: !1,
	      capture: !0
	    }), e.removeEventListener("wheel", t.onWheel, {
	      passive: !1,
	      capture: !1
	    }), e.removeEventListener("click", t.onClick, {
	      passive: !1,
	      capture: !1
	    }), document.removeEventListener("mousemove", t.onMousemove), window.removeEventListener("resize", t.onResize);
	    const i = window.visualViewport;
	    i && (i.removeEventListener("resize", t.onResize), i.removeEventListener("scroll", t.onResize)), document.removeEventListener("visibilitychange", t.onVisibilityChange, !1), document.removeEventListener("focus", t.onFocus, !0);
	  }
	  scale() {
	    const t = this.container;
	    if (!t) return;
	    const e = window.visualViewport,
	      i = Math.max(1, (null == e ? void 0 : e.scale) || 1);
	    let n = "",
	      s = "",
	      o = "";
	    if (e && i > 1) {
	      let t = `${e.offsetLeft}px`,
	        a = `${e.offsetTop}px`;
	      n = e.width * i + "px", s = e.height * i + "px", o = `translate3d(${t}, ${a}, 0) scale(${1 / i})`;
	    }
	    t.style.transform = o, t.style.width = n, t.style.height = s;
	  }
	  onClick(t) {
	    var e;
	    const {
	      container: i,
	      isCompact: n
	    } = this;
	    if (!i || this.isClosing()) return;
	    !n && this.option("idle") && this.resetIdle();
	    const s = t.composedPath()[0];
	    if (s.closest(".fancybox-spinner") || s.closest("[data-fancybox-close]")) return t.preventDefault(), void this.close(t);
	    if (s.closest("[data-fancybox-prev]")) return t.preventDefault(), void this.prev();
	    if (s.closest("[data-fancybox-next]")) return t.preventDefault(), void this.next();
	    if ("click" === t.type && 0 === t.detail) return;
	    if (Math.abs(t.pageX - Ee) > 30 || Math.abs(t.pageY - Se) > 30) return;
	    const o = document.activeElement;
	    if (be() && o && i.contains(o)) return;
	    if (n && "image" === (null === (e = this.getSlide()) || void 0 === e ? void 0 : e.type)) return void (this.clickTimer ? (clearTimeout(this.clickTimer), this.clickTimer = null) : this.clickTimer = setTimeout(() => {
	      this.toggleIdle(), this.clickTimer = null;
	    }, 350));
	    if (this.emit("click", t), t.defaultPrevented) return;
	    let a = !1;
	    if (s.closest(".fancybox__content")) {
	      if (o) {
	        if (o.closest("[contenteditable]")) return;
	        s.matches(nt) || o.blur();
	      }
	      if (be()) return;
	      a = this.option("contentClick");
	    } else s.closest(".fancybox__carousel") && !s.matches(nt) && (a = this.option("backdropClick"));
	    "close" === a ? (t.preventDefault(), this.close(t)) : "next" === a ? (t.preventDefault(), this.next()) : "prev" === a && (t.preventDefault(), this.prev());
	  }
	  onWheel(t) {
	    const e = t.target;
	    let n = this.option("wheel", t);
	    e.closest(".fancybox__thumbs") && (n = "slide");
	    const s = "slide" === n,
	      o = [-t.deltaX || 0, -t.deltaY || 0, -t.detail || 0].reduce(function (t, e) {
	        return Math.abs(e) > Math.abs(t) ? e : t;
	      }),
	      a = Math.max(-1, Math.min(1, o)),
	      r = Date.now();
	    this.pwt && r - this.pwt < 300 ? s && t.preventDefault() : (this.pwt = r, this.emit("wheel", t, a), t.defaultPrevented || ("close" === n ? (t.preventDefault(), this.close(t)) : "slide" === n && (i(e) || (t.preventDefault(), this[a > 0 ? "prev" : "next"]()))));
	  }
	  onScroll() {
	    window.scrollTo(Pe, Ce);
	  }
	  onKeydown(t) {
	    if (!this.isTopmost()) return;
	    this.isCompact || !this.option("idle") || this.isClosing() || this.resetIdle();
	    const e = t.key,
	      i = this.option("keyboard");
	    if (!i) return;
	    const n = t.composedPath()[0],
	      s = document.activeElement && document.activeElement.classList,
	      o = s && s.contains("f-button") || n.dataset.carouselPage || n.dataset.carouselIndex;
	    if ("Escape" !== e && !o && E(n)) {
	      if (n.isContentEditable || -1 !== ["TEXTAREA", "OPTION", "INPUT", "SELECT", "VIDEO"].indexOf(n.nodeName)) return;
	    }
	    if ("Tab" === t.key ? P(this.container, ae) : S(this.container, ae), t.ctrlKey || t.altKey || t.shiftKey) return;
	    this.emit("keydown", e, t);
	    const a = i[e];
	    a && "function" == typeof this[a] && (t.preventDefault(), this[a]());
	  }
	  onResize() {
	    const t = this.container;
	    if (!t) return;
	    const e = this.isCompact;
	    t.classList.toggle(le, e), this.manageCaption(this.getSlide()), this.isCompact ? this.clearIdle() : this.endIdle(), this.scale(), this.emit("resize");
	  }
	  onFocus(t) {
	    this.isTopmost() && this.checkFocus(t);
	  }
	  onMousemove(t) {
	    this.prevMouseMoveEvent = t, !this.isCompact && this.option("idle") && this.resetIdle();
	  }
	  onVisibilityChange() {
	    "visible" === document.visibilityState ? this.checkFocus() : this.endIdle();
	  }
	  manageCloseBtn(t) {
	    const e = this.optionFor(t, "closeButton") || !1;
	    if ("auto" === e) {
	      const t = this.plugins.Toolbar;
	      if (t && t.state === Zt.Ready) return;
	    }
	    if (!e) return;
	    if (!t.contentEl || t.closeBtnEl) return;
	    const i = this.option("tpl.closeButton");
	    if (i) {
	      const e = n(this.localize(i));
	      t.closeBtnEl = t.contentEl.appendChild(e), t.el && P(t.el, "has-close-btn");
	    }
	  }
	  manageCaption(t = void 0) {
	    var e, i;
	    const n = "fancybox__caption",
	      s = this.container;
	    if (!s) return;
	    S(s, de);
	    const o = this.isCompact || this.option("commonCaption"),
	      a = !o;
	    if (this.caption && this.stop(this.caption), a && this.caption && (this.caption.remove(), this.caption = null), o && !this.caption) for (const t of (null === (e = this.carousel) || void 0 === e ? void 0 : e.slides) || []) t.captionEl && (t.captionEl.remove(), t.captionEl = void 0, S(t.el, de), null === (i = t.el) || void 0 === i || i.removeAttribute("aria-labelledby"));
	    if (t || (t = this.getSlide()), !t || o && !this.isCurrentSlide(t)) return;
	    const r = t.el;
	    let l = this.optionFor(t, "caption", "");
	    if (!l) return void (o && this.caption && this.animate(this.caption, "f-fadeOut", () => {
	      this.caption && (this.caption.innerHTML = "");
	    }));
	    let c = null;
	    if (a) {
	      if (c = t.captionEl || null, r && !c) {
	        const e = n + `_${this.id}_${t.index}`;
	        c = document.createElement("div"), P(c, n), c.setAttribute("id", e), t.captionEl = r.appendChild(c), P(r, de), r.setAttribute("aria-labelledby", e);
	      }
	    } else {
	      if (c = this.caption, c || (c = s.querySelector("." + n)), !c) {
	        c = document.createElement("div"), c.dataset.fancyboxCaption = "", P(c, n);
	        (this.footer || s).prepend(c);
	      }
	      P(s, de), this.caption = c;
	    }
	    c && (c.innerHTML = "", ve(l) || "number" == typeof l ? c.innerHTML = l + "" : l instanceof HTMLElement && c.appendChild(l));
	  }
	  checkFocus(t) {
	    this.focus(t);
	  }
	  focus(t) {
	    var e;
	    if (this.ignoreFocusChange) return;
	    const i = document.activeElement || null,
	      n = (null == t ? void 0 : t.target) || null,
	      s = this.container,
	      o = null === (e = this.carousel) || void 0 === e ? void 0 : e.viewport;
	    if (!s || !o) return;
	    if (!t && i && s.contains(i)) return;
	    const a = this.getSlide(),
	      r = a && a.state === lt.Ready ? a.el : null;
	    if (!r || r.contains(i) || s === i) return;
	    t && t.cancelable && t.preventDefault(), this.ignoreFocusChange = !0;
	    const l = Array.from(s.querySelectorAll(nt));
	    let c = [],
	      h = null;
	    for (let t of l) {
	      const e = !t.offsetParent || !!t.closest('[aria-hidden="true"]'),
	        i = r && r.contains(t),
	        n = !o.contains(t);
	      if (t === s || (i || n) && !e) {
	        c.push(t);
	        const e = t.dataset.origTabindex;
	        void 0 !== e && e && (t.tabIndex = parseFloat(e)), t.removeAttribute("data-orig-tabindex"), !t.hasAttribute("autoFocus") && h || (h = t);
	      } else {
	        const e = void 0 === t.dataset.origTabindex ? t.getAttribute("tabindex") || "" : t.dataset.origTabindex;
	        e && (t.dataset.origTabindex = e), t.tabIndex = -1;
	      }
	    }
	    let d = null;
	    t ? (!n || c.indexOf(n) < 0) && (d = h || s, c.length && (i === xe ? d = c[0] : this.lastFocus !== s && i !== we || (d = c[c.length - 1]))) : d = a && "image" === a.type ? s : h || s, d && st(d), this.lastFocus = document.activeElement, this.ignoreFocusChange = !1;
	  }
	  next() {
	    const t = this.carousel;
	    t && t.pages.length > 1 && t.slideNext();
	  }
	  prev() {
	    const t = this.carousel;
	    t && t.pages.length > 1 && t.slidePrev();
	  }
	  jumpTo(...t) {
	    this.carousel && this.carousel.slideTo(...t);
	  }
	  isTopmost() {
	    var t;
	    return (null === (t = Oe.getInstance()) || void 0 === t ? void 0 : t.id) == this.id;
	  }
	  animate(t = null, e = "", i) {
	    if (!t || !e) return void (i && i());
	    this.stop(t);
	    const n = s => {
	      s.target === t && t.dataset.animationName && (t.removeEventListener("animationend", n), delete t.dataset.animationName, i && i(), S(t, e));
	    };
	    t.dataset.animationName = e, t.addEventListener("animationend", n), P(t, e);
	  }
	  stop(t) {
	    t && t.dispatchEvent(new CustomEvent("animationend", {
	      bubbles: !1,
	      cancelable: !0,
	      currentTarget: t
	    }));
	  }
	  setContent(t, e = "", i = !0) {
	    if (this.isClosing()) return;
	    const s = t.el;
	    if (!s) return;
	    let o = null;
	    if (E(e) ? o = e : (o = n(e + ""), E(o) || (o = document.createElement("div"), o.innerHTML = e + "")), ["img", "picture", "iframe", "video", "audio"].includes(o.nodeName.toLowerCase())) {
	      const t = document.createElement("div");
	      t.appendChild(o), o = t;
	    }
	    E(o) && t.filter && !t.error && (o = o.querySelector(t.filter)), o && E(o) ? (P(o, "fancybox__content"), t.id && o.setAttribute("id", t.id), s.classList.add(`has-${t.error ? "error" : t.type || "unknown"}`), s.prepend(o), "none" === o.style.display && (o.style.display = ""), "none" === getComputedStyle(o).getPropertyValue("display") && (o.style.display = t.display || this.option("defaultDisplay") || "flex"), t.contentEl = o, i && this.revealContent(t), this.manageCloseBtn(t), this.manageCaption(t)) : this.setError(t, "{{ELEMENT_NOT_FOUND}}");
	  }
	  revealContent(t, e) {
	    const i = t.el,
	      n = t.contentEl;
	    i && n && (this.emit("reveal", t), this.hideLoading(t), t.state = lt.Opening, (e = this.isOpeningSlide(t) ? void 0 === e ? this.optionFor(t, "showClass") : e : "f-fadeIn") ? this.animate(n, e, () => {
	      this.done(t);
	    }) : this.done(t));
	  }
	  done(t) {
	    this.isClosing() || (t.state = lt.Ready, this.emit("done", t), P(t.el, "is-done"), this.isCurrentSlide(t) && this.option("autoFocus") && queueMicrotask(() => {
	      var e;
	      null === (e = t.panzoom) || void 0 === e || e.updateControls(), this.option("autoFocus") && this.focus();
	    }), this.isOpeningSlide(t) && (S(this.container, he), !this.isCompact && this.option("idle") && this.setIdle()));
	  }
	  isCurrentSlide(t) {
	    const e = this.getSlide();
	    return !(!t || !e) && e.index === t.index;
	  }
	  isOpeningSlide(t) {
	    var e, i;
	    return null === (null === (e = this.carousel) || void 0 === e ? void 0 : e.prevPage) && t && t.index === (null === (i = this.getSlide()) || void 0 === i ? void 0 : i.index);
	  }
	  showLoading(t) {
	    t.state = lt.Loading;
	    const e = t.el;
	    if (!e) return;
	    P(e, ce), this.emit("loading", t), t.spinnerEl || setTimeout(() => {
	      if (!this.isClosing() && !t.spinnerEl && t.state === lt.Loading) {
	        let i = n(x);
	        P(i, "fancybox-spinner"), t.spinnerEl = i, e.prepend(i), this.animate(i, "f-fadeIn");
	      }
	    }, 250);
	  }
	  hideLoading(t) {
	    const e = t.el;
	    if (!e) return;
	    const i = t.spinnerEl;
	    this.isClosing() ? null == i || i.remove() : (S(e, ce), i && this.animate(i, "f-fadeOut", () => {
	      i.remove();
	    }), t.state === lt.Loading && (this.emit("loaded", t), t.state = lt.Ready));
	  }
	  setError(t, e) {
	    if (this.isClosing()) return;
	    const i = new Event("error", {
	      bubbles: !0,
	      cancelable: !0
	    });
	    if (this.emit("error", i, t), i.defaultPrevented) return;
	    t.error = e, this.hideLoading(t), this.clearContent(t);
	    const n = document.createElement("div");
	    n.classList.add("fancybox-error"), n.innerHTML = this.localize(e || "<p>{{ERROR}}</p>"), this.setContent(t, n);
	  }
	  clearContent(t) {
	    if (void 0 === t.state) return;
	    this.emit("clearContent", t), t.contentEl && (t.contentEl.remove(), t.contentEl = void 0);
	    const e = t.el;
	    e && (S(e, "has-error"), S(e, "has-unknown"), S(e, `has-${t.type || "unknown"}`)), t.closeBtnEl && t.closeBtnEl.remove(), t.closeBtnEl = void 0, t.captionEl && t.captionEl.remove(), t.captionEl = void 0, t.spinnerEl && t.spinnerEl.remove(), t.spinnerEl = void 0;
	  }
	  getSlide() {
	    var t;
	    const e = this.carousel;
	    return (null === (t = null == e ? void 0 : e.pages[null == e ? void 0 : e.page]) || void 0 === t ? void 0 : t.slides[0]) || void 0;
	  }
	  close(t, e) {
	    if (this.isClosing()) return;
	    const i = new Event("shouldClose", {
	      bubbles: !0,
	      cancelable: !0
	    });
	    if (this.emit("shouldClose", i, t), i.defaultPrevented) return;
	    t && t.cancelable && (t.preventDefault(), t.stopPropagation());
	    const n = () => {
	      this.proceedClose(t, e);
	    };
	    this.startedFs && ye && ye.isFullscreen() ? Promise.resolve(ye.exit()).then(() => n()) : n();
	  }
	  clearIdle() {
	    this.idleTimer && clearTimeout(this.idleTimer), this.idleTimer = null;
	  }
	  setIdle(t = !1) {
	    const e = () => {
	      this.clearIdle(), this.idle = !0, P(this.container, "is-idle"), this.emit("setIdle");
	    };
	    if (this.clearIdle(), !this.isClosing()) if (t) e();else {
	      const t = this.option("idle");
	      t && (this.idleTimer = setTimeout(e, t));
	    }
	  }
	  endIdle() {
	    this.clearIdle(), this.idle && !this.isClosing() && (this.idle = !1, S(this.container, "is-idle"), this.emit("endIdle"));
	  }
	  resetIdle() {
	    this.endIdle(), this.setIdle();
	  }
	  toggleIdle() {
	    this.idle ? this.endIdle() : this.setIdle(!0);
	  }
	  toggleFullscreen() {
	    ye && (ye.isFullscreen() ? ye.exit() : ye.request().then(() => {
	      this.startedFs = !0;
	    }));
	  }
	  isClosing() {
	    return [rt.Closing, rt.CustomClosing, rt.Destroy].includes(this.state);
	  }
	  proceedClose(t, e) {
	    var i, n;
	    this.state = rt.Closing, this.clearIdle(), this.detachEvents();
	    const s = this.container,
	      o = this.carousel,
	      a = this.getSlide(),
	      r = a && this.option("placeFocusBack") ? a.triggerEl || this.option("triggerEl") : null;
	    if (r && (tt(r) ? st(r) : r.focus()), s && (S(s, he), P(s, "is-closing"), s.setAttribute(oe, "true"), this.option("animated") && P(s, re), s.style.pointerEvents = "none"), o) {
	      o.clearTransitions(), null === (i = o.panzoom) || void 0 === i || i.destroy(), null === (n = o.plugins.Navigation) || void 0 === n || n.detach();
	      for (const t of o.slides) {
	        t.state = lt.Closing, this.hideLoading(t);
	        const e = t.contentEl;
	        e && this.stop(e);
	        const i = null == t ? void 0 : t.panzoom;
	        i && (i.stop(), i.detachEvents(), i.detachObserver()), this.isCurrentSlide(t) || o.emit("removeSlide", t);
	      }
	    }
	    Pe = window.scrollX, Ce = window.scrollY, window.addEventListener("scroll", this.onScroll), this.emit("close", t), this.state !== rt.CustomClosing ? (void 0 === e && a && (e = this.optionFor(a, "hideClass")), e && a ? (this.animate(a.contentEl, e, () => {
	      o && o.emit("removeSlide", a);
	    }), setTimeout(() => {
	      this.destroy();
	    }, 500)) : this.destroy()) : setTimeout(() => {
	      this.destroy();
	    }, 500);
	  }
	  destroy() {
	    var t;
	    if (this.state === rt.Destroy) return;
	    window.removeEventListener("scroll", this.onScroll), this.state = rt.Destroy, null === (t = this.carousel) || void 0 === t || t.destroy();
	    const e = this.container;
	    e && e.remove(), Te.delete(this.id);
	    const i = Oe.getInstance();
	    i ? i.focus() : (we && (we.remove(), we = null), xe && (xe.remove(), xe = null), S(document.documentElement, ee), (() => {
	      if (!et) return;
	      const t = document,
	        e = t.body;
	      e.classList.remove(ie), e.style.setProperty(se, ""), t.documentElement.style.setProperty(ne, "");
	    })(), this.emit("destroy"));
	  }
	  static bind(t, e, i) {
	    if (!et) return;
	    let n,
	      s = "",
	      o = {};
	    if (void 0 === t ? n = document.body : ve(t) ? (n = document.body, s = t, "object" == typeof e && (o = e || {})) : (n = t, ve(e) && (s = e), "object" == typeof i && (o = i || {})), !n || !E(n)) return;
	    s = s || "[data-fancybox]";
	    const a = Oe.openers.get(n) || new Map();
	    a.set(s, o), Oe.openers.set(n, a), 1 === a.size && n.addEventListener("click", Oe.fromEvent);
	  }
	  static unbind(t, e) {
	    let i,
	      n = "";
	    if (ve(t) ? (i = document.body, n = t) : (i = t, ve(e) && (n = e)), !i) return;
	    const s = Oe.openers.get(i);
	    s && n && s.delete(n), n && s || (Oe.openers.delete(i), i.removeEventListener("click", Oe.fromEvent));
	  }
	  static destroy() {
	    let t;
	    for (; t = Oe.getInstance();) t.destroy();
	    for (const t of Oe.openers.keys()) t.removeEventListener("click", Oe.fromEvent);
	    Oe.openers = new Map();
	  }
	  static fromEvent(t) {
	    if (t.defaultPrevented) return;
	    if (t.button && 0 !== t.button) return;
	    if (t.ctrlKey || t.metaKey || t.shiftKey) return;
	    let e = t.composedPath()[0];
	    const i = e.closest("[data-fancybox-trigger]");
	    if (i) {
	      const t = i.dataset.fancyboxTrigger || "",
	        n = document.querySelectorAll(`[data-fancybox="${t}"]`),
	        s = parseInt(i.dataset.fancyboxIndex || "", 10) || 0;
	      e = n[s] || e;
	    }
	    if (!(e && e instanceof Element)) return;
	    let n, s, o, a;
	    if ([...Oe.openers].reverse().find(([t, i]) => !(!t.contains(e) || ![...i].reverse().find(([i, r]) => {
	      let l = e.closest(i);
	      return !!l && (n = t, s = i, o = l, a = r, !0);
	    }))), !n || !s || !o) return;
	    a = a || {}, t.preventDefault(), e = o;
	    let r = [],
	      l = u({}, at, a);
	    l.event = t, l.triggerEl = e, l.delegate = i;
	    const c = l.groupAll,
	      h = l.groupAttr,
	      d = h && e ? e.getAttribute(`${h}`) : "";
	    if ((!e || d || c) && (r = [].slice.call(n.querySelectorAll(s))), e && !c && (r = d ? r.filter(t => t.getAttribute(`${h}`) === d) : [e]), !r.length) return;
	    const p = Oe.getInstance();
	    return p && p.options.triggerEl && r.indexOf(p.options.triggerEl) > -1 ? void 0 : (e && (l.startIndex = r.indexOf(e)), Oe.fromNodes(r, l));
	  }
	  static fromSelector(t, e, i) {
	    let n = null,
	      s = "",
	      o = {};
	    if (ve(t) ? (n = document.body, s = t, "object" == typeof e && (o = e || {})) : t instanceof HTMLElement && ve(e) && (n = t, s = e, "object" == typeof i && (o = i || {})), !n || !s) return !1;
	    const a = Oe.openers.get(n);
	    return !!a && (o = u({}, a.get(s) || {}, o), !!o && Oe.fromNodes(Array.from(n.querySelectorAll(s)), o));
	  }
	  static fromNodes(t, e) {
	    e = u({}, at, e || {});
	    const i = [];
	    for (const n of t) {
	      const t = n.dataset || {},
	        s = t[me] || n.getAttribute(ge) || n.getAttribute("currentSrc") || n.getAttribute(me) || void 0;
	      let o;
	      const a = e.delegate;
	      let r;
	      a && i.length === e.startIndex && (o = a instanceof HTMLImageElement ? a : a.querySelector("img:not([aria-hidden])")), o || (o = n instanceof HTMLImageElement ? n : n.querySelector("img:not([aria-hidden])")), o && (r = o.currentSrc || o[me] || void 0, !r && o.dataset && (r = o.dataset.lazySrc || o.dataset[me] || void 0));
	      const l = {
	        src: s,
	        triggerEl: n,
	        thumbEl: o,
	        thumbElSrc: r,
	        thumbSrc: r
	      };
	      for (const e in t) {
	        let i = t[e] + "";
	        i = "false" !== i && ("true" === i || i), l[e] = i;
	      }
	      i.push(l);
	    }
	    return new Oe(i, e);
	  }
	  static getInstance(t) {
	    if (t) return Te.get(t);
	    return Array.from(Te.values()).reverse().find(t => !t.isClosing() && t) || null;
	  }
	  static getSlide() {
	    var t;
	    return (null === (t = Oe.getInstance()) || void 0 === t ? void 0 : t.getSlide()) || null;
	  }
	  static show(t = [], e = {}) {
	    return new Oe(t, e);
	  }
	  static next() {
	    const t = Oe.getInstance();
	    t && t.next();
	  }
	  static prev() {
	    const t = Oe.getInstance();
	    t && t.prev();
	  }
	  static close(t = !0, ...e) {
	    if (t) for (const t of Te.values()) t.close(...e);else {
	      const t = Oe.getInstance();
	      t && t.close(...e);
	    }
	  }
	}
	Object.defineProperty(Oe, "version", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: "5.0.36"
	}), Object.defineProperty(Oe, "defaults", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: at
	}), Object.defineProperty(Oe, "Plugins", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: te
	}), Object.defineProperty(Oe, "openers", {
	  enumerable: !0,
	  configurable: !0,
	  writable: !0,
	  value: new Map()
	});

	Oe.bind('[data-fancybox]', {
	  // Your custom options
	});

}));
//# sourceMappingURL=bundle.js.map