'use strict';
/*
 * cookies.js
 * cookie management
 */

if (!Foxtrick) var Foxtrick = {};


(function() {
		// cookies for external pages
		var cookies = {
			for_hty: {
				url: 'http://www.hattrick-youthclub.org/*',
				name: 'fromFoxtrick',
				addId: true,
				domain: '.hattrick-youthclub.org',
				isJSON: true,
				isBase64: true
			},
			from_hty: {
				url: 'http://hattrick-youthclub.org/*',
				name: 'forFoxtrick',
				addId: true,
				domain: '.hattrick-youthclub.org',
				isJSON: true,
				isBase64: true
			},
		};

		var makeCookie = function(where, name, oldvalue, newvalue) {
			var new_cookie = { url: cookies[where].url, domain: cookies[where].domain };
			new_cookie.name = name;
			if (cookies[where].isJSON) {
				var decode = oldvalue;

				new_cookie.value = oldvalue ? oldvalue : '{}';
				if (!cookies[where].isBase64 || !decode)
					var valuejson = JSON.parse(new_cookie.value);
				else
					var valuejson = JSON.parse(Foxtrick.decodeBase64(new_cookie.value));

				var key;
				for (key in newvalue)
					valuejson[key] = newvalue[key];

				if (cookies[where].isBase64)
					new_cookie.value = Foxtrick.encodeBase64(JSON.stringify(valuejson));
			}
			else
				new_cookie.value = newvalue;
			return new_cookie;
		};

		// defines if cookie being set currently and thuse need wait if needed
		// depends somewhat one browser implementation. so we'll see how it works
		var set_scheduled = false;

		// @param where - cookies type: see above - cookies map
		// @param what - value to add to the cookie, if isJSON it's added to existing
		// (optional) @callback(cookieValue) - the value (json) it set,
		// returns content decoded and json.parsed if applicable
		Foxtrick.cookieSet = function(where, what, callback) {
			if (cookies[where].addId)
				var name = cookies[where].name + '_' +
					Foxtrick.modules['Core'].getSelfTeamInfo().teamId;
			else
				var name = cookies[where].name;

			if (Foxtrick.arch == 'Gecko') {
				Foxtrick.cookieGet(where,
				  function(oldValue) {
					if (oldValue && cookies[where].isJSON) {
						oldValue = JSON.stringify(oldValue);
						if (cookies[where].isBase64)
							oldValue = Foxtrick.encodeBase64(oldValue);
					}
					var new_cookie = makeCookie(where, name, oldValue, what);
					var cookieManager2 =
						Components.classes['@mozilla.org/cookiemanager;1']
							.getService(Components.interfaces.nsICookieManager2);
					//expire just to make the function happy, no effect
					//when the param before is true (session only)
					var expire = (new Date()).getTime() + 60 * 60 * 24 * 7;
					cookieManager2.add(new_cookie.domain, '/', new_cookie.name, new_cookie.value,
					                   false, true, true, expire);
					if (callback) {
						if (cookies[where].isJSON && cookies[where].isBase64)
							callback(JSON.parse(Foxtrick.decodeBase64(new_cookie.value)));
						else if (cookies[where].isJSON && !cookies[where].isBase64)
							callback(JSON.parse(new_cookie.value));
						else
							callback(new_cookie.value);
					}
				});
			}
			else if (Foxtrick.platform == 'Chrome') {
				if (Foxtrick.chromeContext() == 'content') {
					sandboxed.extension.sendRequest(
					  { req: 'cookieSet', where: where, name: name, what: what },
					  function(reponse) {
						if (callback) {
							try {
								if (cookies[where].isJSON && cookies[where].isBase64)
									callback(JSON.parse(Foxtrick.decodeBase64(reponse)));
								else if (cookies[where].isJSON && !cookies[where].isBase64)
									callback(JSON.parse(reponse));
								else
									callback(reponse);
							}
							catch (e) {
								Foxtrick.log('Error in callback for cookieSet',
											 response, e);
							}
						}
					});
				}
			}
			else if (callback)
					callback(null);
		};

		// chrome background
		Foxtrick._cookieSet = function(where, name, what, callback) {
			var _set = function() {
				set_scheduled = true;
				chrome.cookies.get({ url: cookies[where].url, name: name},
				  function(cookie) {
					var oldValue = cookie ? cookie.value : null;
					var new_cookie = makeCookie(where, name, oldValue, what);
					chrome.cookies.set(new_cookie, function() {
						set_scheduled = false;
						if (callback)
							callback(new_cookie.value);
					});
				});
			};
			if (set_scheduled)
				// if unfinshed set is called, queue behind
				window.setTimeout(function () { _set(); }, 0);
			else
				_set();
		};
		// @param where - cookies type: see above - cookies map
		// @callback cookieValue - the retrieved value
		Foxtrick.cookieGet = function(where, callback) {
			if (cookies[where].addId)
				var name = cookies[where].name + '_' +
					Foxtrick.modules['Core'].getSelfTeamInfo().teamId;
			else
				var name = cookies[where].name;

			if (Foxtrick.arch == 'Gecko') {
				var cookieManager2 =
					Components.classes['@mozilla.org/cookiemanager;1']
						.getService(Components.interfaces.nsICookieManager2);
				var iter = cookieManager2.getCookiesFromHost(cookies[where].domain);
				var cookie_count = 0;
				while (iter.hasMoreElements()) {
					var cookie = iter.getNext();
					if (cookie instanceof Components.interfaces.nsICookie) {
						if (cookie.name == name
						&& cookie.host == cookies[where].domain)
						{
							if (cookies[where].isJSON && !cookies[where].isBase64)
								callback(JSON.parse(cookie.value));
							else if (cookies[where].isJSON && cookies[where].isBase64)
								callback(JSON.parse(Foxtrick.decodeBase64(cookie.value)));
							else
								callback(cookie.value);
							return;
						}
						cookie_count++;
					}
				}
				callback(null);
				return;
			} else if (Foxtrick.platform == 'Chrome') {
				if (Foxtrick.chromeContext() == 'content') {
					sandboxed.extension.sendRequest({
							req: 'cookieGet', where: where, name: name
					  },
					  function(response) {
						try {
							if (response && cookies[where].isJSON && !cookies[where].isBase64)
								callback(JSON.parse(response));
							else if (response && cookies[where].isJSON &&
									 cookies[where].isBase64)
								callback(JSON.parse(Foxtrick.decodeBase64(response)));
							else
								callback(response);
							return;						}
						catch (e) {
							Foxtrick.log('Error in callback for cookieGet',
										 response, e);
						}
					});
				}
			}
			else
				callback(null);
		};

		// chrome background
		Foxtrick._cookieGet = function(where, name, callback) {
			var _get = function() {
				chrome.cookies.get({ url: cookies[where].url, name: name },
				  function(cookie) {
					if (cookie)
						callback(cookie.value);
					else
						callback(null);
				});
			};
			if (set_scheduled)
				// if unfinshed set is called, queue behind
				window.setTimeout(function () { _get(); }, 0);
			else
				_get();
		};
})();
