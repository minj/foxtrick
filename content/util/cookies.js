/**
 * cookies.js
 * cookie management
 *
 * @author convincedd, LA-MJ
 */

'use strict';

/* eslint-disable */
// MV3: Use globalThis for service worker compatibility
if (typeof globalThis.Foxtrick === 'undefined')
	globalThis.Foxtrick = {};
var Foxtrick = globalThis.Foxtrick;
/* eslint-enable */

/**
 * Cookie specification object
 */
Foxtrick.COOKIE_SPEC = {
	// eslint-disable-next-line camelcase
	for_hty: {
		url: 'https://www.hattrick-youthclub.org/*',
		name: 'fromFoxtrick',
		addId: true,
		domain: '.hattrick-youthclub.org',
		isJSON: true,
		isBase64: true,
	},
	// eslint-disable-next-line camelcase
	from_hty: {
		url: 'https://hattrick-youthclub.org/*',
		name: 'forFoxtrick',
		addId: true,
		domain: '.hattrick-youthclub.org',
		isJSON: true,
		isBase64: true,
	},
};

for (let k of Object.keys(Foxtrick.COOKIE_SPEC))
	Object.freeze(Foxtrick.COOKIE_SPEC[k]);

Object.freeze(Foxtrick.COOKIE_SPEC);

/** @typedef {keyof Foxtrick.COOKIE_SPEC} CookieKey */

Foxtrick.cookies = (function() {
	const COOKIE_SPEC = Foxtrick.COOKIE_SPEC;

	/**
	 * Parse a value from a cookie string according to spec:
	 * {isJSON, isBase64: Boolean}.
	 *
	 * base64 may only be used when isJSON=true.
	 *
	 * @param  {string} str
	 * @param  {object} spec
	 * @return {object}
	 */
	var parseVal = function(str, spec) {
		if (!str)
			return {};

		if (!spec.isJSON)
			return str;

		if (!spec.isBase64)
			return JSON.parse(str);

		return JSON.parse(Foxtrick.decodeBase64(str));
	};

	/**
	 * Prepare a value for storing in a cookie according to spec:
	 * {isJSON, isBase64: Boolean}.
	 *
	 * base64 may only be used when isJSON=true.
	 *
	 * @param  {object} val
	 * @param  {object} spec
	 * @return {string}
	 */
	var stringifyVal = function(val, spec) {
		if (!val)
			return '';

		if (!spec.isJSON)
			return val.toString();

		if (!spec.isBase64)
			return JSON.stringify(val);

		return Foxtrick.encodeBase64(JSON.stringify(val));
	};

	/**
	 * Create a chrome API Cookie object.
	 *
	 * Returns {url, domain, name, value: string}
	 *
	 * @param  {string} key
	 * @param  {string} name
	 * @param  {object} oldVal
	 * @param  {object} val
	 * @return {chrome.cookies.SetDetails}
	 */
	var makeCookie = function(key, name, oldVal, val) {
		const spec = COOKIE_SPEC[key];
		const { url, domain } = spec;

		/** @type {chrome.cookies.SetDetails} */
		const cookie = { url, domain, name };

		if (spec.isJSON) {
			let old = Object.assign(oldVal || {}, val);
			cookie.value = stringifyVal(old, spec);
		}
		else {
			cookie.value = stringifyVal(val, spec);
		}

		return cookie;
	};

	/**
	 * A global Promise to limit concurrency while cookie.set is in progress
	 * @type {Promise}
	 */
	var gCookiesReady = Promise.resolve();

	/**
	 * Get a promise when cookie value is set.
	 *
	 * Promise will never reject.
	 *
 	 * Cookie storage key must be preset in COOKIE_SPEC.
	 *
	 * cookieName is optional cookie name override in content
	 * which is **REQUIRED** in BG
	 *
 	 * value may be any stringify-able object.
	 *
	 * @param  {CookieKey} key
	 * @param  {object}    value
	 * @param  {string}    [cookieName] optional in content, **REQUIRED** in BG
	 * @return {Promise}
	 */
	var set = function(key, value, cookieName) {
		const spec = COOKIE_SPEC[key];
		let name = cookieName ||
			(spec.addId ? spec.name + '_' + Foxtrick.util.id.getOwnTeamId() : spec.name);

		if (Foxtrick.context == 'content') {
			return new Promise(function(fulfill) {
				Foxtrick.SB.ext.sendRequest({
					req: 'cookiesSet',
					key,
					value,
					name,
				}, fulfill);
			});
		}

		return Foxtrick.cookies.get(key, name).then(function(oldVal) {
			let cookie = makeCookie(key, name, oldVal, value);

			if (Foxtrick.arch === 'Gecko') {
				try {
					// expire just to make the function happy, no effect
					// when the param before is true (session only)
					const MSECS_IN_WEEK = Foxtrick.util.time.DAYS_IN_WEEK *
						Foxtrick.util.time.MSECS_IN_DAY;
					const expire = Date.now() + MSECS_IN_WEEK;

					Services.cookies.add(cookie.domain, '/', cookie.name, cookie.value,
					                     false, true, true, expire);
				}
				catch (e) {
					Foxtrick.log('Error setting cookie', key, value, cookie, e);
				}
			}
			else if (Foxtrick.platform === 'Chrome') {
				gCookiesReady = new Promise(function(resolve) {
					try {
						chrome.cookies.set(cookie, function(_) {
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
	 *
	 * cookieName is optional cookie name override in content
	 * which is **REQUIRED** in BG
	 *
	 * value may be any stringify-able object or null if N/A.
	 *
	 * @param  {CookieKey} key
	 * @param  {string}    [cookieName] optional in content, **REQUIRED** in BG
	 * @return {Promise}                {Promise.<?value>}
	 */
	var get = function(key, cookieName) {
		const spec = COOKIE_SPEC[key];
		if (!spec)
			Foxtrick.log(new Error(`spec is ${spec}`));

		let name = cookieName ||
			(spec.addId ? spec.name + '_' + Foxtrick.util.id.getOwnTeamId() : spec.name);

		if (Foxtrick.context == 'content') {
			return new Promise(function(fulfill) {
				Foxtrick.SB.ext.sendRequest({ req: 'cookiesGet', key, name }, fulfill);
			});
		}

		/** @type {chrome.cookies.Details} */
		const cookie = { url: spec.url, name };

		return gCookiesReady.then(function() {

			if (Foxtrick.arch == 'Gecko') {
				try {
					let iter = Services.cookies.getCookiesFromHost(spec.domain);
					while (iter.hasMoreElements()) {
						let cookie = iter.getNext();

						if (!(cookie instanceof Ci.nsICookie))
							continue;

						if (cookie.name == name && cookie.host == spec.domain)
							return parseVal(cookie.value, spec);
					}
				}
				catch (e) {
					Foxtrick.log('Error getting cookie', key, e);
				}
			}
			else if (Foxtrick.platform == 'Chrome') {

				return new Promise(function(resolve) {
					try {
						chrome.cookies.get(cookie, (cookie) => {
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

	return { get, set };

})();
