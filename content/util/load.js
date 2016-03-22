'use strict';
/*
 * load.js
 * loading files
 */

if (!Foxtrick)
	var Foxtrick = {};

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

	url = Foxtrick.util.load._parseUrl(url);

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

	return new Promise(function(resolve) {
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

				resolve(this.responseText);

			}

			// always resolve at this point
			resolve({ url: url, status: this.status, text: this.responseText, params: params });
		};

		req.onerror = function() {
			// always resolve at this point
			resolve({ url: url, status: this.status, text: this.responseText, params: params });
		};

		req.send(params);
	})
	.catch(function(e) {
		// handle fatal errors in Promise constructor
		Foxtrick.log(ERROR_XHR_FATAL, e);
		return { url: url, status: -1, text: ERROR_XHR_FATAL + e.message };
	}).then(function(resp) {
		// handle non-fatal errors by rejecting
		if (typeof resp !== 'string')
			return Promise.reject(resp);

		return resp;
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

	var tryFetch = function(cache) {
		Foxtrick.log('Promise cache replied:', cache, 'Fetching from', url);

		// resolve the original Promise
		return Foxtrick.__savePromiseFor(url, params, lifeTime)(Foxtrick.fetch(url, params));
	};

	return Foxtrick.__loadPromise(url, params, lifeTime, now)
		.catch(tryFetch);

};


// ----------------------- internal helpers ------------------------
if (Foxtrick.context === 'background') {

	Foxtrick.__promiseCache = (function() {

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

		return {

			/**
			 * Get a Promise for the cache object for {url, params}.
			 *
			 * Rejects with null if cache/Promise failed.
			 *
			 * @param  {string}  url
			 * @param  {object}  params {?object}
			 * @return {Promise}        Promise.<?object>
			 */
			get: function(url, params) {
				var id = genId(url, params);

				var obj = CACHE_OBJECTS.get(id);
				if (!obj) {
					// no cache, reject straight away
					return Promise.reject(null);
				}

				return obj.promise.then(function() {
					// good promise
					// resolve cache object
					return obj;
				}, function() {
					// bad promise: remove cache object
					CACHE_OBJECTS.delete(id);

					return Promise.reject(null);
				});

			},

			/**
			 * Save a Promise cache object for {url, params}.
			 *
			 * obj should be {promise: Promise, lifeTime}.
			 *
			 * @param {string} url
			 * @param {object} params {?object}
			 * @param {object} obj    {promise: Promise, lifeTime: ?Integer}
			 */
			set: function(url, params, obj) {
				var id = genId(url, params);
				CACHE_OBJECTS.set(id, obj);
			},

			/**
			 * Clear promise cache
			 */
			clear: function() {
				CACHE_OBJECTS.clear();
			},
		};

	})();

	/**
	 * Load a Promise for {url, params} from promise cache.
	 *
	 * The returned Promise may reject with null if cache failed
	 * or {stale, now: string} if cache lifeTime is over.
	 *
	 * aLifeTime is an optional timestamp to decrease cache lifeTime.
	 * now is also optional and defaults to Date.now().
	 *
	 * @param  {string}  url
	 * @param  {object}  params    {?object}
	 * @param  {number}  aLifeTime {?Integer}
	 * @param  {number}  now       {?Integer}
	 * @return {Promise}
	 */
	Foxtrick.__loadPromise = function(url, params, aLifeTime, now) {

		return Promise.resolve().then(function() {

			return Foxtrick.__promiseCache.get(url, params).then(function(obj) {
				now = now ? new Date(now) : new Date();

				var cache = 'session';

				/**
				 * Logs success and returns a cached Promise
				 *
				 * @return {Promise}
				 */
				var getCachedPromise = function() {
					Foxtrick.log('Using cache for:', url,
					             'until', cache.toString(), 'now:', now.toString());

					return obj.promise;
				};

				// deal with Promise lifeTime
				if (typeof obj.lifeTime === 'number') {
					cache = new Date(obj.lifeTime);
					if (cache < now) {
						// stale cache

						Foxtrick.__promiseCache.set(url, params, null);

						return Promise.reject({ stale: cache.toString(), now: now.toString() });
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
					return Foxtrick.__savePromiseFor(url, params, aLifeTime)(obj.promise)
						.then(getCachedPromise);
				}

				return getCachedPromise();
			});

		});

	};

	/**
	 * Save a promise in promise cache with specified properties
	 *
	 * Returns {function(Promise): Promise} to give the promise to.
	 * Callback returns a promise that resolves to the original promise.
	 *
	 * lifeTime is an optional timestamp.
	 *
	 * @param  {string}   url
	 * @param  {object}   params   {?object}
	 * @param  {number}   lifeTime {?Integer}
	 * @return {function}          {function(Promise): Promise}
	 */
	Foxtrick.__savePromiseFor = function(url, params, lifeTime) {
		return function(promise) {

			// promisify
			promise = Promise.resolve(promise);

			return Promise.resolve().then(function() {
				var cacheObj = { promise: promise };

				if (lifeTime)
					cacheObj.lifeTime = lifeTime;

				Foxtrick.__promiseCache.set(url, params, cacheObj);

				return promise;
			});

		};
	};
}


// --------------------- old implementation -------------------------
if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.load = {};

/**
 * Pre-process a URL to insert variables
 * @param  {string} url
 * @return {string}
 */
Foxtrick.util.load._parseUrl = function(url) {
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

/*
 * Load external URL asynchronously
 * @param url - URL
 * @param params - params != null makes it and used for a POST request
 * @param callback - function to be called when succeeded or failed
 * @callback_param String of text content if success or null if failure
 * @callback_param HTTP status code
 */
Foxtrick.util.load.async = function(url, callback, params) {
	url = this._parseUrl(url);
	if (Foxtrick.context == 'content') {
		// background script for xml requests
		Foxtrick.SB.ext.sendRequest({ req: 'getXml', url: url, params: params },
		  function(response) {
			try {
				callback(response.data, response.status);
			}
			catch (e) {
				Foxtrick.log('Uncaught callback error: - url: ', url, ': ', e);
			}
		});
	}
	else {
		var req = new window.XMLHttpRequest();
		var type = (params != null) ? 'POST' : 'GET';
		req.open(type, url, true);
		if (typeof(req.overrideMimeType) == 'function')
			req.overrideMimeType('text/plain');
		//Send the proper header information along with the request
		if (type == 'POST' && typeof(req.setRequestHeader) == 'function')
			req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

		req.onloadend = function() {
			try {
				callback(req.responseText, req.status);
			}
			catch (e) {
				Foxtrick.log('Uncaught callback error: - url: ' + url + ' params: ' + params, e);
			}
		};

		try {
			req.send(params);
		}
		catch (e) {
			// catch cross-domain errors
			Foxtrick.log(url + ' ' + params, e);
			callback(null, 0);
		}
	}
};

/*
 * @desc load a resource synchronusly (Not to be used in content modules).
 * only to be used for internal resources
 */
Foxtrick.util.load.sync = function(url) {
	if (url.replace(/^\s+/, '').indexOf(Foxtrick.InternalPath) != 0) {
		Foxtrick.log('loadSync only for internal resources. ', url, "isn't , only ",
		             Foxtrick.InternalPath, ' is');
		return null;
	}
	// load
	var req = new window.XMLHttpRequest();

	req.open('GET', url, false); //sync load of a chrome resource
	if (typeof(req.overrideMimeType) == 'function')
		req.overrideMimeType('text/plain');

	try {
		req.send(null);
		return req.responseText;
	}
	catch (e) {
		// catch non-existing
		Foxtrick.log('loadSync: cannot find or load: ', url);
		return null;
	}
};

/*
 * @desc load and parse xml asynchronously.
 */
Foxtrick.util.load.xml = function(url, callback) {
	Foxtrick.util.load.async(url, function(text, status) {
		if (text.indexOf('!DOCTYPE html') !== -1) {
			// eg login page was returned. aka cpp server not reachable
			var errorCode = 503;
			if (text.search(/<title>\d+/i) !== -1)
				errorCode = text.match(/<title>(\d+)/i)[1];
			Foxtrick.log(url, '\nreturned an html page.',
			             'Server could be down. Assumed errorCode:', errorCode);
			callback(null, errorCode);
			return;
		}

		try {
			var xml = Foxtrick.parseXml(text);
		}
		catch (e) {
			// invalid XML
			Foxtrick.log('Cannot parse XML (', url, ')\n', text);
			xml = null;
		}
		callback(xml, status);
	});
};

/*
 * @desc load and parse xml synchronously. only to be used for internal repository
 */
Foxtrick.util.load.xmlSync = function(url) {
	var text = Foxtrick.util.load.sync(url);
	try {
		var xml = Foxtrick.parseXml(text);
	}
	catch (e) {
		// invalid XML
		Foxtrick.log('Cannot parse XML (', url, ')\n', text);
		xml = null;
	}
	return xml;
};


/*
 * @desc load and parse yaml synchronously. only to be used for internal repository
 */
Foxtrick.util.load.ymlSync = function(url) {

	try {
		var text = Foxtrick.util.load.sync(url);
		var json = (text !== null) ? Foxtrick.jsyaml.safeLoad(text) : null;
	}
	catch (e) {
		// invalid YML
		var InputDump = function(text) {
			this.text = text;
		};
		var yError = 'Please check to see if the text has tabs instead of spaces, ' +
			'unescaped quotes or other weird shit.\n';
		Foxtrick.log('Cannot parse YML (', url, ')\n', yError, e, new InputDump(text));
		json = null;
	}
	return json;
};

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
				win.alert('File too large');
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
				win.alert('File too large');
				text = null;
			}
			callback(text);
		};
		reader.readAsText(file);
	}, false);
	return input;
};
