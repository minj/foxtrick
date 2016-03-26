'use strict';
/*
 * cookies.js
 * cookie management
 */

if (!Foxtrick)
	var Foxtrick = {}; // jshint ignore:line

Foxtrick.cookies = {};


(function() {

	const COOKIE_SPEC = {
		for_hty: {
			url: 'http://www.hattrick-youthclub.org/*',
			name: 'fromFoxtrick',
			addId: true,
			domain: 'hattrick-youthclub.org',
			isJSON: true,
			isBase64: true,
		},
		from_hty: {
			url: 'http://hattrick-youthclub.org/*',
			name: 'forFoxtrick',
			addId: true,
			domain: 'hattrick-youthclub.org',
			isJSON: true,
			isBase64: true,
		},
	};

	var parseVal = function(str, spec) {
		if (!str)
			return {};

		if (!spec.isJSON) {
			return str;
		}

		if (!spec.isBase64)
			return JSON.parse(str);
		else
			return JSON.parse(Foxtrick.decodeBase64(str));
	};

	var stringifyVal = function(val, spec) {
		if (!val)
			return '';

		if (!spec.isJSON) {
			return val.toString();
		}

		if (!spec.isBase64)
			return JSON.stringify(val);
		else
			return Foxtrick.encodeBase64(JSON.stringify(val));
	};

	var makeCookie = function(key, name, oldVal, val) {
		var spec = COOKIE_SPEC[key];

		var cookie = { url: spec.url, domain: spec.domain, name: name };

		if (spec.isJSON) {
			oldVal = oldVal || {};
			Foxtrick.mergeAll(oldVal, val);
			cookie.value = stringifyVal(oldVal, spec);
		}
		else {
			cookie.value = stringifyVal(val, spec);
		}

		return cookie;
	};

	// use a global Promise to limit concurrency
	var gCookiesReady = Promise.resolve();

	/**
	 * Get a promise when cookie value is set.
	 *
	 * Promise will never reject.
	 *
 	 * Cookie storage key must be preset in COOKIE_SPEC.
 	 * name is an optional cookie name override, typically used in BG comm.
 	 * value may be any stringify-able object.
	 *
	 * @param  {string}  key
	 * @param  {object}  value
	 * @param  {string}  name
	 * @return {Promise}
	 */
	Foxtrick.cookies.set = function(key, value, name) {
		var spec = COOKIE_SPEC[key];
		name = name || (spec.addId ? spec.name + '_' + Foxtrick.util.id.getOwnTeamId() : spec.name);

		if (Foxtrick.context == 'content') {
			return new Promise(function(fulfill) {
				Foxtrick.SB.ext.sendRequest({
					req: 'cookiesSet',
					key: key,
					value: value,
					name: name,
				}, fulfill);
			});
		}

		return Foxtrick.cookies.get(key).then(function(oldVal) {
			var cookie = makeCookie(key, name, oldVal, value);

			if (Foxtrick.arch === 'Gecko') {
				try {
					// expire just to make the function happy, no effect
					// when the param before is true (session only)
					var MSECS_IN_WEEK = Foxtrick.util.time.DAYS_IN_WEEK *
						Foxtrick.util.time.MSECS_IN_DAY;
					var expire = Date.now() + MSECS_IN_WEEK;

					Services.cookies.add(cookie.domain, '/', cookie.name, cookie.value,
					                     false, true, true, expire);
				}
				catch (e) {
					Foxtrick.log('Error setting cookie', key, value, cookie, e);
				}
			}
			else if (Foxtrick.platform === 'chrome') {
				gCookiesReady = new Promise(function(resolve) {
					try {
						chrome.cookies.set(cookie, function(cookie) { // jshint ignore:line
							resolve();
						});
					}
					catch (e) {
						Foxtrick.log('Error setting cookie', key, value, cookie, e);
						resolve();
					}
				});
			}

			return parseVal(cookie.value, spec);
		});

	};

	/**
	 * Get a promise for a cookie value.
	 *
	 * Promise will never reject, returns null instead.
	 *
 	 * Cookie storage key must be preset in COOKIE_SPEC.
 	 * name is an optional cookie name override, typically used in BG comm.
	 * value may be any stringify-able object or null if N/A.
	 *
	 * @param  {string}  key
	 * @param  {string}  name
	 * @return {Promise}      {Promise.<?value>}
	 */
	Foxtrick.cookies.get = function(key, name) {
		var spec = COOKIE_SPEC[key];
		name = name || (spec.addId ? spec.name + '_' + Foxtrick.util.id.getOwnTeamId() : spec.name);

		if (Foxtrick.context == 'content') {
			return new Promise(function(fulfill) {
				Foxtrick.SB.ext.sendRequest({ req: 'cookiesGet', key: key, name: name }, fulfill);
			});
		}

		return gCookiesReady.then(function() {

			if (Foxtrick.arch == 'Gecko') {
				try {
					var iter = Services.cookies.getCookiesFromHost(spec.domain);
					while (iter.hasMoreElements()) {
						var cookie = iter.getNext();

						if (!(cookie instanceof Ci.nsICookie))
							continue;

						if (cookie.name == name && cookie.host == spec.domain) {
							return parseVal(cookie.value, spec);
						}
					}
				}
				catch (e) {
					Foxtrick.log('Error getting cookie', key, e);
				}
			}
			else if (Foxtrick.platform == 'Chrome') {

				return new Promise(function(resolve) {
					try {
						chrome.cookies.get({ url: spec.url, name: name },
						  function(cookie) {
							if (cookie)
								resolve(parseVal(cookie.value, spec));
							else
								resolve(null);
						});
					}
					catch (e) {
						Foxtrick.log('Error getting cookie', key, e);
						resolve(null);
					}
				});

			}

			return null;
		});

	};

})();


// /////////////////////////
// TODO: remove deprecated
// ////////////////////////

/**
 * Save a value in the cookie storage.
 *
 * Cookie storage key must be preset in COOKIE_SPEC.
 *
 * @deprecated use cookies.set() instead
 *
 * @param {string}   key
 * @param {object}   value
 * @param {function} callback
 */
Foxtrick.cookieSet = function(key, value, callback) {
	Foxtrick.cookies.set(key, value).then(callback).catch(Foxtrick.catch('cookieSet'));
};

/**
 * Get a value from the cookie storage.
 *
 * Cookie storage key must be preset in COOKIE_SPEC.
 *
 * @deprecated use cookies.get() instead
 *
 * @param {string}   key
 * @param {object}   value
 * @param {function} callback
 */
Foxtrick.cookieGet = function(key, callback) {
	Foxtrick.cookies.get(key).then(callback).catch(Foxtrick.catch('cookieGet'));
};
