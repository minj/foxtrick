'use strict';
/*
 * load.js
 * loading files
 */

if (!Foxtrick)
	var Foxtrick = {}; // jshint ignore:line

/**
 * Parse data as JSON.
 *
 * Logs bad input in case of errors and returns null instead.
 *
 * @param  {string} data
 * @return {object}
 */
Foxtrick.parseJSON = function(data) {
	var ret = null;
	try {
		ret = JSON.parse(data);

		if (typeof ret !== 'object') {
			Foxtrick.log(new TypeError('Bad JSON: non-object'), data);
			ret = null;
		}
	}
	catch (e) {
		Foxtrick.log('Bad JSON:', e, data);
	}
	return ret;
};

/**
 * Parse data as YAML.
 *
 * Logs bad input in case of errors and returns null instead.
 *
 * @param  {string} data
 * @return {object}
 */
Foxtrick.parseYAML = function(data) {
	var ret = null;

	try {
		ret = data !== null ? Foxtrick.jsyaml.safeLoad(data) : null;
	}
	catch (e) {
		// invalid YML

		var InputDump = function(text) {
			this.text = text;
		};

		var yError = 'Please check to see if the text has tabs instead of spaces, ' +
			'unescaped quotes or other weird stuff.\n';

		Foxtrick.log('Cannot parse YAML\n', yError, e, new InputDump(data));

		ret = null;
	}

	return ret;
};

/**
 * Parse data as XML.
 *
 * Logs bad input in case of errors and returns null instead.
 *
 * @param  {string}      data
 * @return {XMLDocument}
 */
Foxtrick.parseXML = function(data) {
	var errCode = null;

	var parseXML = function(text) {
		var xml = null;

		try {
			var parser = new window.DOMParser();

			xml = parser.parseFromString(text, 'text/xml');
		}
		catch (e) {
			// invalid XML
			Foxtrick.log('Cannot parse XML:', e, text);
		}

		return xml;
	};

	if (/!DOCTYPE html/.test(data)) {
		// e.g login page was returned
		// i. e, CHPP server not reachable

		var titleRe = /<title>(\d+)/i;
		if (titleRe.test(data))
			errCode = data.match(titleRe)[1];
		else
			errCode = 503;

		Foxtrick.error('safeXML got an html page. Server could be down. ' +
		               'Assumed errCode: ' + errCode);

		return null;
	}

	return parseXML(data);
};

/**
 * Pre-process a URL to insert variables
 *
 * @param  {string} url
 * @return {string}
 */
Foxtrick.parseURL = function(url) {
	url = url.replace(/\/res\/%d\//, function() {
		// get a timestamp in the form 150324, i. e. $(date +'%y%m%d')
		// use HT date or -1 so as not to mess up due to wrong system time (in the future)
		// -1 refers to 691231 which was tagged for default cases
		var time = parseInt(Foxtrick.Prefs.getString('lastTime'), 10) || -1;
		var date = new Date(time).toISOString().slice(2, 10).replace(/\D/g, '');
		return '/res/' + date + '/';
	});
	return url;
};


/**
 * Fetch a url.
 *
 * Returns a Promise that fulfills with a string on success
 * or rejects with {url, status, text, params}.
 *
 * params is optional, switches to POST.
 *
 * @param  {string}  url
 * @param  {object}  params {?object}
 * @return {Promise}
 */
Foxtrick.fetch = function(url, params) {
	const ERROR_XHR_FATAL = 'FATAL error in XHR:';

	url = Foxtrick.parseURL(url);

	if (Foxtrick.context == 'content') {

		return new Promise(function(fulfill, reject) {
			Foxtrick.SB.ext.sendRequest({ req: 'fetch', url: url, params: params },
			  function(response) {
				if (typeof response === 'string') {
					fulfill(response);
				}
				else {
					Foxtrick.log('XHR failed:', response);
					reject(response);
				}
			});
		});

	}

	return new Promise(function(fulfill, reject) {
		try {
			var type = params ? 'POST' : 'GET';

			var req = new window.XMLHttpRequest();
			req.open(type, url, true);

			if (typeof req.overrideMimeType === 'function')
				req.overrideMimeType('text/plain');

			// Send the proper header information along with the request
			if (type == 'POST' && typeof req.setRequestHeader === 'function')
				req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

			req.onload = function() {
				// README: safari returns chrome resources with status=0
				if (this.status >= 200 && this.status < 300 ||
				    this.status === 0 && this.responseText) {

					fulfill(this.responseText);
					return;
				}

				reject({ url: url, status: this.status, text: this.responseText, params: params });
			};

			req.onerror = function() {
				reject({ url: url, status: this.status, text: this.responseText, params: params });
			};

			req.onabort = function() {
				reject({ url: url, status: -1, text: this.responseText, params: params });
			};

			req.send(params);

		}
		catch (e) {
			// handle fatal errors here
			Foxtrick.log(ERROR_XHR_FATAL, e);
			reject({ url: url, status: -1, text: ERROR_XHR_FATAL + e.message, params: params });
		}
	});

};

/**
 * Load a url via cache, if possible
 *
 * Returns a Promise that fulfills with a string on success
 * or rejects with {url, status, text, params}.
 *
 * params is optional, switch to POST.
 *
 * @param  {string}  url
 * @param  {object}  params
 * @return {Promise}
 */
Foxtrick.load = function(url, params, lifeTime, now) {
	url = Foxtrick.parseURL(url);

	if (Foxtrick.context == 'content') {
		return new Promise(function(fulfill, reject) {

			var HT_TIME = Foxtrick.modules.Core.HT_TIME;
			if (!HT_TIME) {
				// No HT_TIME yet. We have been too quick
				// Lets put us 1 day in the future
				Foxtrick.log('no HT_TIME yet');
				HT_TIME = Date.now() + Foxtrick.util.time.MSECS_IN_DAY;
			}

			var req = {
				req: 'load',
				url: url,
				params: params,
				lifeTime: lifeTime,
				now: HT_TIME,
			};

			Foxtrick.SB.ext.sendRequest(req, function(response) {
				if (typeof response === 'string') {
					fulfill(response);
				}
				else {
					Foxtrick.log('load failed:', response);
					reject(response);
				}
			});
		});
	}

	var obj = Foxtrick.cache.getFor(url, params, lifeTime, now);
	if (obj && obj.promise) {
		return obj.promise;
	}

	Foxtrick.log('Promise cache replied:', obj, 'Fetching from', url);

	var promise = Foxtrick.fetch(url, params);
	Foxtrick.cache.setFor(url, params, lifeTime)(promise);

	return promise;
};


// ----------------------- internal helpers ------------------------
Foxtrick.cache = (function() {

	if (Foxtrick.context === 'background') {

		/**
		 * Promise cache
		 *
		 * Stores cache objects {promise: Promise, lifeTime}
		 * @type {Map}
		 */
		const CACHE_OBJECTS = new Map();

		/**
		 * Generate an ID to index cache objects by
		 *
		 * @param  {string} url
		 * @param  {object} params {?object}
		 * @return {string}
		 */
		var genId = function(url, params) {
			var id = url;
			if (params)
				id += ';' + JSON.stringify(params);

			return id;
		};

		/**
		 * Get a cache object for {url, params}
		 *
		 * @param  {string}  url
		 * @param  {object}  params {?object}
		 * @return {Promise}        Promise.<?object>
		 */
		var get = function(url, params) {
			var id = genId(url, params);

			var obj = CACHE_OBJECTS.get(id);
			if (!obj) {
				// no cache
				return null;
			}

			return obj;
		};

		/**
		 * Save a Promise cache object for {url, params}.
		 *
		 * obj should be {promise: Promise, lifeTime}.
		 *
		 * @param {string} url
		 * @param {object} params {?object}
		 * @param {object} obj    {promise: Promise, lifeTime: ?Integer}
		 */
		var set = function(url, params, obj) {
			var id = genId(url, params);
			CACHE_OBJECTS.set(id, obj);

			if (obj && obj.promise) {
				obj.promise.catch(function() {
					// bad promise: remove cache object
					if (CACHE_OBJECTS.get(id) === obj)
						CACHE_OBJECTS.delete(id);
				});
			}
		};

		return {

			/**
			 * Get a Promise cache object for {url, params}.
			 *
			 * cache object is {promise, lifeTime}.
			 *
			 * returns null if cache failed
			 * or {stale, now: string} if cache lifeTime is over.
			 *
			 * aLifeTime is an optional timestamp to decrease cache lifeTime.
			 * now is also optional and defaults to Date.now().
			 *
			 * @param  {string}  url
			 * @param  {object}  params    {?object}
			 * @param  {number}  aLifeTime {?Integer}
			 * @param  {number}  now       {?Integer}
			 * @return {object}
			 */
			getFor: function(url, params, aLifeTime, now) {

				var obj = get(url, params);
				if (!obj) {
					return null;
				}

				now = now ? new Date(now) : new Date();

				var cache = 'session';

				// deal with Promise lifeTime
				if (typeof obj.lifeTime === 'number') {
					cache = new Date(obj.lifeTime);
					if (cache < now) {
						// stale cache

						set(url, params, null);

						return { stale: cache.toString(), now: now.toString() };
					}
				}
				else if (obj.lifeTime) {
					// string?
					cache = obj.lifeTime;
				}

				if (typeof aLifeTime === 'number' &&
				    (typeof cache !== 'object' || cache > aLifeTime)) {
					// obj.lifeTime was not a number but aLifeTime is
					// or aLifeTime is sooner than obj.lifeTime
					Foxtrick.log('New lifeTime for cached', url, params, aLifeTime);

					// update for logging
					cache = new Date(aLifeTime);

					// set new lifeTime
					this.set(url, params, aLifeTime)(obj.promise);
				}

				Foxtrick.log('Using cache for:', url, 'until', cache.toString(),
				             'now:', now.toString());

				return obj;

			},

			/**
			 * Save a promise in promise cache with specified properties
			 *
			 * Returns {function(Promise)} to give the promise to.
			 *
			 * lifeTime is an optional timestamp.
			 *
			 * @param  {string}   url
			 * @param  {object}   params   {?object}
			 * @param  {number}   lifeTime {?Integer}
			 * @return {function}          {function(Promise): Promise}
			 */
			setFor: function(url, params, lifeTime) {
				return function(promise) {

					// promisify
					promise = Promise.resolve(promise);

					var cacheObj = { promise: promise };

					if (lifeTime)
						cacheObj.lifeTime = lifeTime;

					set(url, params, cacheObj);
				};
			},

			/**
			 * Clear promise cache
			 */
			clear: function() {
				CACHE_OBJECTS.clear();
			},
		};

	}
	else {
		return {
			clear: function() {
				Foxtrick.SB.ext.sendRequest({ req: 'cacheClear' });
			},
		};
	}

})();


// --------------------- old implementation -------------------------
if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.load = {};

/**
 * Load an internal URL synchronously
 *
 * TODO: consider going full async
 *
 * @param  {string} url
 * @return {string}
 */
Foxtrick.util.load.sync = function(url) {
	if (url.replace(/^\s+/, '').indexOf(Foxtrick.InternalPath) !== 0) {
		Foxtrick.log('loadSync only for internal resources.', url, "isn't , only",
		             Foxtrick.InternalPath, 'is');

		return null;
	}

	// load
	var req = new window.XMLHttpRequest();

	req.open('GET', url, false); // sync load of a chrome resource

	if (typeof req.overrideMimeType === 'function')
		req.overrideMimeType('text/plain');

	try {
		req.send(null);

		return req.responseText;
	}
	catch (e) {
		// catch non-existing
		Foxtrick.log('loadSync: cannot find or load:', url);

		return null;
	}
};

/**
 * Load an internal URL synchronously and parse YAML content
 *
 * @deprecated use async methods
 *
 * @param  {string} url
 * @return {string}
 */
Foxtrick.util.load.ymlSync = function(url) {
	var text = Foxtrick.util.load.sync(url);

	return Foxtrick.parseYAML(text);
};

/**
 * Load an external URL asynchronously.
 *
 * params is any data to POST.
 *
 * @deprecated use load() instead
 *
 * @param {string}   url
 * @param {function} callback
 * @param {object}   params
 */
Foxtrick.util.load.async = function(url, callback, params) {

	Foxtrick.load(url, params).then(function(text) {
		callback(text, 200);
	}, function(resp) {
		callback(resp.text, resp.status);
	}).catch(function(e) {
		Foxtrick.log('Uncaught callback error: - url:', url, 'params:', params, e);
	});

};

/**
 * Load an external URL asynchronously (without cache)
 *
 * params is any data to POST.
 *
 * @deprecated use fetch() instead
 *
 * @param {string}   url
 * @param {function} callback
 * @param {object}   params
 */
Foxtrick.util.load.fetch = function(url, callback, params) {

	Foxtrick.fetch(url, params).then(function(text) {
		callback(text, 200);
	}, function(resp) {
		callback(resp.text, resp.status);
	}).catch(function(e) {
		Foxtrick.log('Uncaught callback error: - url:', url, 'params:', params, e);
	});

};

/**
 * Load an external URL asynchronously and parse XML content.
 *
 * @deprecated use Promises
 *
 * @param  {string}   url
 * @param  {function} callback
 */
Foxtrick.util.load.xml = function(url, callback) {

	// README: no promise cache
	Foxtrick.util.load.fetch(url, function(text, status) {
		var xml = Foxtrick.parseXML(text);

		if (xml == null && status == 200)
			status = 503;

		callback(xml, status);
	});
};


// FIXME: rewrite file pickers into a new async pattern
/*
 * @desc html5 filepicker for dataUrl. eg pictures and sounds
 */
Foxtrick.util.load.filePickerForDataUrl = function(doc, callback) {
	var input = doc.createElement('input');
	input.type = 'file';

	input.addEventListener('change', function(ev) {
		var win = this.ownerDocument.defaultView;
		var file = this.files[0];
		var reader = new win.FileReader();

		reader.onerror = function(e) {
			win.alert('Error code: ' + e.target.error.code);
			callback(null);
		};

		reader.onload = function(e) {
			var dataUrl = e.target.result;

			if (dataUrl.length > 164000) {
				win.alert('File too large. Limit: 164kB');
				dataUrl = null;
			}

			callback(dataUrl);
		};

		reader.readAsDataURL(file);

	}, false);

	return input;
};

/*
 * @desc html5 filepicker for text
 */
Foxtrick.util.load.filePickerForText = function(doc, callback) {
	var input = doc.createElement('input');
	input.type = 'file';

	input.addEventListener('change', function(ev) {
		var win = this.ownerDocument.defaultView;
		var file = this.files[0];
		var reader = new win.FileReader();

		reader.onerror = function(e) {
			win.alert('Error code: ' + e.target.error.code);
			callback(null);
		};

		reader.onload = function(e) {
			var text = e.target.result;

			if (text.length > 64000) {
				win.alert('File too large. Limit: 64kB');
				text = null;
			}

			callback(text);
		};

		reader.readAsText(file);

	}, false);

	return input;
};
