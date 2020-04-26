/**
 * api.js
 * Proxy for authorizing and retrieving XML data from Hattrick
 * @author ryanli, LA-MJ
 */

'use strict';

/* eslint-disable */
if (!this.Foxtrick)
	var Foxtrick = {};
/* eslint-enable */

if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.api = {
	consumerKey: 'sKDixHQBSGgdJ3a9O6lRtL',
	consumerSecret: 'DIZIDBTX64d0+-9fPq8GrYN5PNHtMxYhpS9ZKsbcPqf',

	signatureMethod: 'HMAC-SHA1',
	requestTokenUrl: 'https://chpp.hattrick.org/oauth/request_token.ashx',
	authorizeUrl: 'https://chpp.hattrick.org/oauth/authorize.aspx',
	accessTokenUrl: 'https://chpp.hattrick.org/oauth/access_token.ashx',
	resourceUrl: 'https://chpp.hattrick.org/chppxml.ashx',

	// map of requested and unprocessed urls { serialized url: true }
	queue: {},

	authorized: function() {
		return Foxtrick.util.api.getAccessToken() &&
			Foxtrick.util.api.getAccessTokenSecret();
	},

	authorizationQueued: false,
	authorize: function(doc) {
		if (Foxtrick.util.api.authorizationQueued)
			return;

		Foxtrick.util.api.authorizationQueued = true;
		var win = doc.defaultView;
		win.setTimeout(function() {
			Foxtrick.util.api.authorizationQueued = false;
			Foxtrick.util.api._authorize(win.document);
		}, 0);
	},

	_authorize: function(doc) {
		const HTTP_OK = 200;

		var showNotice = function(div, link) {
			div.removeChild(link);
			var notice = doc.createElement('p');
			var paragraphs = Foxtrick.L10n.getString('oauth.instructions').split(/\n/);
			for (var i = 0; i < paragraphs.length; ++i) {
				notice.appendChild(doc.createTextNode(paragraphs[i]));
				if (i != paragraphs.length - 1)
					notice.appendChild(doc.createElement('br'));
			}
			div.appendChild(notice);

			// link to FAQ
			var more = doc.createElement('a');
			more.textContent = Foxtrick.L10n.getString('oauth.why');
			Foxtrick.addClass(more, 'ft-link');
			Foxtrick.onClick(more, () => Foxtrick.Prefs.show('#faq=authorize'));
			div.appendChild(more);
		};
		var showFinished = function(div, text) {
			div.textContent = text ? text : Foxtrick.L10n.getString('oauth.success');
		};

		Foxtrick.stopListenToChange(doc);

		var div = doc.createElement('div');
		var accessor = {
			consumerSecret: Foxtrick.util.api.consumerSecret,
			tokenSecret: null,
		};
		var msg = {
			action: Foxtrick.util.api.requestTokenUrl,
			method: 'get',
			parameters: [
				['oauth_consumer_key', Foxtrick.util.api.consumerKey],
				['oauth_signature_method', Foxtrick.util.api.signatureMethod],
				['oauth_signature', ''],
				['oauth_timestamp', ''],
				['oauth_nonce', ''],
				['oauth_callback', 'oob'], // no callback
			],
		};
		Foxtrick.OAuth.setTimestampAndNonce(msg);
		Foxtrick.OAuth.SignatureMethod.sign(msg, accessor);
		var rTokenUrl = Foxtrick.OAuth.addToURL(Foxtrick.util.api.requestTokenUrl, msg.parameters);

		var link = doc.createElement('a');
		link.className = 'ft-link';
		link.textContent = Foxtrick.L10n.getString('oauth.authorize');

		Foxtrick.onClick(link, function(ev) {
			Foxtrick.stopListenToChange(doc);

			showNotice(div, link);

			var linkPar = doc.createElement('p');
			div.appendChild(linkPar);
			linkPar.appendChild(Foxtrick.util.note.createLoading(doc, null, true));
			Foxtrick.log('Requesting token at: ', Foxtrick.util.api.stripToken(rTokenUrl));
			Foxtrick.util.load.fetch(rTokenUrl, function(text, status) {
				Foxtrick.stopListenToChange(doc);
				linkPar.textContent = ''; // clear linkPar first
				if (status != HTTP_OK) {
					// failed to fetch link
					linkPar.textContent = Foxtrick.util.api.getErrorText(text, status);
					return;
				}
				var requestToken = text.split('&')[0].split('=')[1];
				var requestTokenSecret = text.split('&')[1].split('=')[1];

				// link
				var link = doc.createElement('a');
				link.title = link.href = Foxtrick.util.api.authorizeUrl + '?' + text;
				link.textContent = Foxtrick.L10n.getString('oauth.link');
				link.target = '_blank';
				linkPar.appendChild(link);

				// input
				var inputPar = doc.createElement('p');
				div.appendChild(inputPar);
				var input = doc.createElement('input');
				inputPar.appendChild(input);
				var button = doc.createElement('input');
				button.type = 'button';
				button.value = Foxtrick.L10n.getString('button.authorize');
				Foxtrick.onClick(button, function(ev) {
					var accessor = {
						consumerSecret: Foxtrick.util.api.consumerSecret,
						tokenSecret: requestTokenSecret,
					};
					var msg = {
						action: Foxtrick.util.api.accessTokenUrl,
						method: 'get',
						parameters: [
							['oauth_consumer_key', Foxtrick.util.api.consumerKey],
							['oauth_token', requestToken],
							['oauth_signature_method', Foxtrick.util.api.signatureMethod],
							['oauth_signature', ''],
							['oauth_timestamp', ''],
							['oauth_nonce', ''],
							['oauth_verifier', input.value],
						],
					};
					Foxtrick.OAuth.setTimestampAndNonce(msg);
					Foxtrick.OAuth.SignatureMethod.sign(msg, accessor);
					var query = Foxtrick.OAuth.formEncode(msg.parameters);
					var accessTokenUrl = Foxtrick.util.api.accessTokenUrl + '?' + query;
					Foxtrick.log('Requesting access token at:',
					             Foxtrick.util.api.stripToken(accessTokenUrl));

					Foxtrick.util.load.fetch(accessTokenUrl, function(text, status) {
						if (status != HTTP_OK) {
							// failed to fetch link
							let errorText = Foxtrick.util.api.getErrorText(text, status);
							showFinished(div, errorText);
							return;
						}
						var accessToken = text.split('&')[0].split('=')[1];
						var accessTokenSecret = text.split('&')[1].split('=')[1];
						Foxtrick.util.api.setAccessToken(accessToken);
						Foxtrick.util.api.setAccessTokenSecret(accessTokenSecret);

						showFinished(div);
					}); // save token and secret
				}); // after hitting 'authorize' button

				inputPar.appendChild(button);

				// disabled to prevent auth-reset on dynamic pages
				// Foxtrick.startListenToChange(doc);
			}); // get authorize URL with Foxtrick.util.load.fetch()
			Foxtrick.startListenToChange(doc);
		}); // initial authorize link event listener

		div.appendChild(link);

		Foxtrick.util.note.add(doc, div, 'ft-api-proxy-auth', { closable: false });
		Foxtrick.startListenToChange(doc);
	},


	// used to change expire date of xml_cache eg for to my_monitors nextmachtdate
	setCacheLifetime: function(paramStr, cacheLifetime) {
		Foxtrick.sessionGet('xml_cache.' + paramStr, (xmlCache) => {
			let xmlStr = xmlCache ? xmlCache.xml_string : '';
			let obj = { xml_string: xmlStr, cache_lifetime: cacheLifetime };
			Foxtrick.sessionSet('xml_cache.' + paramStr, obj);
		});
	},

	addClearCacheLink: function(doc) {
		let bottom = doc.getElementById('bottom');
		if (!bottom)
			return;

		// don't add twice
		let clearCacheSpan = doc.getElementById('ft_clear_cache');
		if (clearCacheSpan)
			return;

		clearCacheSpan = doc.createElement('span');
		clearCacheSpan.id = 'ft_clear_cache';
		clearCacheSpan.textContent = Foxtrick.L10n.getString('api.clearCache');
		clearCacheSpan.title = Foxtrick.L10n.getString('api.clearCache.title');
		bottom.insertBefore(clearCacheSpan, bottom.firstChild);
		Foxtrick.onClick(clearCacheSpan, Foxtrick.util.api.clearCache);
	},

	clearCache: function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			Foxtrick.sessionDeleteBranch('xml_cache');
			doc.location.reload();
		}
		catch (e) { Foxtrick.log(e); }
	},

	/**
	 * Add helper functions node(), text() and num()
	 * for easier data access.
	 * @param {document} xml
	 */
	addHelpers: function(xml) {
		if (!xml || typeof xml !== 'object')
			return;
		xml.node = function(tagName, container) {
			let cont = container || this;
			return cont.getElementsByTagName(tagName)[0];
		};
		xml.text = function(tagName, container) {
			var node = this.node(tagName, container);
			return node.textContent;
		};
		xml.bool = function(tagName, container) {
			var text = this.text(tagName, container);
			return text === 'True';
		};
		xml.time = function(tagName, container) {
			var text = this.text(tagName, container);
			if (text === '0001-01-01 00:00:00')
				return null;
			return Foxtrick.util.time.getDateFromText(text, 'yyyymmdd');
		};
		xml.date = function(tagName, container) {
			var text = this.text(tagName, container);
			if (text === '0001-01-01 00:00:00')
				return null;
			return Foxtrick.util.time.getDateFromText(text, 'yyyymmdd', true);
		};
		xml.num = function(tagName, container) {
			var text = this.text(tagName, container);
			return parseInt(text, 10);
		};
		xml.money = function(tagName, rate, container) {
			var sek = this.num(tagName, container);
			return Math.ceil(sek / (10 * rate));
		};
	},

	// options: { cache:'session' or 'default' or timestamp }
	// session: take xml from this session. xml doesn't expire
	// unless timestamp is manually set on sessionStore later
	// default: currently 1 hour, see below
	// timestamp: time in milliseconds since 1970 when a new xml will get retrieved
	// parameter order and spelling consistency helps caching
	// preferred order: file, version?, id, actiontype?, others... (check existing usage)
	// preferred spelling: param names in camelBack, values in lowercase;
	//                     integers over strings;
	//                     strings over booleans.
	retrieve: function(doc, apiParams, options, callback) {
		var win = doc.defaultView;

		// create local copies so that oauth params are not propagated outside this scope
		var args = [...apiParams]; // for logging etc!
		var params = [...apiParams]; // for API!

		var safeCallback = (args => (xml, ...rest) => {
			Foxtrick.util.api.addHelpers(xml);
			try {
				callback.call(this, xml, ...rest);
			}
			catch (e) {
				Foxtrick.log('ApiProxy: uncaught callback error:', e, 'args:', args);
			}
		})(args);

		if (!Foxtrick.Prefs.getBool('xmlLoad')) {
			Foxtrick.log('XML loading disabled');
			safeCallback(null);
			return;
		}

		const HT_DATE = (() => {
			let htDate;
			try {
				htDate = Foxtrick.util.time.getHTTimeStamp(doc);
			}
			catch (e) {
				// No HT time yet. We have been to fast. Lets put us 1 day in the future
				Foxtrick.log('no HT time yet');
				htDate = Date.now() + Foxtrick.util.time.MSECS_IN_DAY;
			}
			return htDate;
		})();
		const NOW = new Date(HT_DATE).toString();
		const RESOURCE_URL = Foxtrick.util.api.resourceUrl;
		const HTTP_ERROR = 503;
		const HTTP_FORBIDDEN = 401;
		const HTTP_OK = 200;
		const ERROR_TIMEOUT_MIN = 30;
		const ERROR_TIMEOUT_MSEC = ERROR_TIMEOUT_MIN * Foxtrick.util.time.MSECS_IN_MIN;
		const SESSION_GCACHE = 'xml_cache.global_cache_lifetime';

		// global_cache_lifetime = server down
		var globalLifetime = Foxtrick.session.get(SESSION_GCACHE);
		var argStr = JSON.stringify(args);
		var cacheArgs = 'xml_cache.' + argStr;
		var xmlCache = Foxtrick.session.get(cacheArgs);

		/* eslint-disable complexity */
		Promise.all([globalLifetime, xmlCache]).then(([recheckDate, xmlCache]) => {
			if (recheckDate && Number(recheckDate) > HT_DATE) {
				let recheck = new Date(recheckDate).toString();
				Foxtrick.log('global cache set. recheck later:', recheck, 'NOW:', NOW);

				Foxtrick.util.api.addClearCacheLink(doc);
				safeCallback(null, Foxtrick.L10n.getString('api.serverUnavailable'));
				return;
			}

			var session = options && options.cache_lifetime === 'session' || false;
			var cacheTime = 0;
			if (xmlCache) {
				cacheTime = Number(xmlCache.cache_lifetime);
				let cache = session ? 'session' : '';
				if (cacheTime)
					cache += new Date(cacheTime).toString();

				Foxtrick.log('ApiProxy: options:', args, 'cache_lifetime:', cache, 'NOW:', NOW);
			}

			var getError = function(x, status) {
				var errorText = null;
				if (x == null) {
					errorText = Foxtrick.L10n.getString('api.failure');
				}
				else {
					let [errorNode] = [...x.getElementsByTagName('Error')];
					if (typeof errorNode !== 'undefined') {
						// chpp api return error xml
						errorText = errorNode.textContent;
					}
				}

				if (status == HTTP_ERROR)
					errorText = Foxtrick.L10n.getString('api.serverUnavailable');

				return errorText;
			};

			// check file cache next
			// numetical cache time overrides 'session'
			if (xmlCache && xmlCache.xml_string && options &&
				(session && !cacheTime || cacheTime > HT_DATE)) {
				Foxtrick.log('ApiProxy: use cached xml:', argStr);

				Foxtrick.util.api.addClearCacheLink(doc);

				if (xmlCache.xml_string == HTTP_ERROR.toString()) {
					// server was down. we wait for cache expires
					safeCallback(null, Foxtrick.L10n.getString('api.serverUnavailable'));
					return;
				}

				let parser = new win.DOMParser();
				let xml = parser.parseFromString(JSON.parse(xmlCache.xml_string), 'text/xml');
				let errorText = getError(xml);
				safeCallback(xml, errorText);
			}
			else {
				// add to or create queue
				if (argStr in Foxtrick.util.api.queue) {
					Foxtrick.util.api.queue[argStr].push(safeCallback);
					return;
				}

				Foxtrick.util.api.queue[argStr] = [];
				Foxtrick.util.api.queue[argStr].push(safeCallback);

				// process queued requested
				var processQueue = function(x, status) {
					let errorText = getError(x, status);
					for (let safeCb of Foxtrick.util.api.queue[argStr])
						safeCb(x, errorText);

					delete Foxtrick.util.api.queue[argStr];
				};

				// determine cache liftime
				var cacheLifetime = 0;
				if (options && options.cache_lifetime) {
					if (options.cache_lifetime == 'default')
						cacheLifetime = HT_DATE + Foxtrick.util.time.MSECS_IN_HOUR;
					else
						cacheLifetime = options.cache_lifetime;
				}

				try {
					Foxtrick.log('ApiProxy: attempting to retrieve:', args);
					if (!Foxtrick.util.api.authorized()) {
						Foxtrick.log('ApiProxy: unauthorized.');
						Foxtrick.util.api.authorize(doc);
						processQueue(null, 0);
						return;
					}

					let accessor = {
						consumerSecret: Foxtrick.util.api.consumerSecret,
						tokenSecret: Foxtrick.util.api.getAccessTokenSecret(),
					};
					let msg = {
						action: RESOURCE_URL,
						method: 'get',
						parameters: params,
					};
					Foxtrick.OAuth.setParameters(msg, [
						['oauth_consumer_key', Foxtrick.util.api.consumerKey],
						['oauth_token', Foxtrick.util.api.getAccessToken()],
						['oauth_signature_method', Foxtrick.util.api.signatureMethod],
						['oauth_signature', ''],
						['oauth_timestamp', ''],
						['oauth_nonce', ''],
					]);

					Foxtrick.OAuth.setTimestampAndNonce(msg);
					Foxtrick.OAuth.SignatureMethod.sign(msg, accessor);

					let url = Foxtrick.OAuth.addToURL(RESOURCE_URL, msg.parameters);
					Foxtrick.log('Fetching XML data from', Foxtrick.util.api.stripToken(url));
					Foxtrick.util.load.xml(url, (x, status) => {
						if (status == HTTP_OK) {
							let serializer = new win.XMLSerializer();
							let xml = JSON.stringify(serializer.serializeToString(x));
							Foxtrick.sessionSet(cacheArgs, {
								xml_string: xml,
								cache_lifetime: cacheLifetime,
							});
							processQueue(x, status);
						}
						else if (status == HTTP_FORBIDDEN) {
							Foxtrick.log(`ApiProxy: error ${HTTP_FORBIDDEN}, unauthorized.`, args);
							Foxtrick.util.api.invalidateAccessToken(doc);
							Foxtrick.util.api.authorize(doc);
							processQueue(null, status);
						}
						else {
							let errorText = Foxtrick.util.api.getErrorText(x, status);
							Foxtrick.log('ApiProxy: error', errorText, '. Arguments:', args);

							// server down. no need to check very page load.
							// let's say we check again in 30 min
							if (status == HTTP_ERROR) {
								let recheckDate = HT_DATE + ERROR_TIMEOUT_MSEC;
								Foxtrick.sessionSet('xml_cache.' + argStr, {
									xml_string: status.toString(),
									cache_lifetime: recheckDate,
								});

								Foxtrick.sessionSet(SESSION_GCACHE, recheckDate);
							}
							processQueue(null, status);
						}
					});
				}
				catch (e) {
					Foxtrick.log(e);
					processQueue(null, 0);
				}
			}
			/* eslint-enable complexity */
		}).catch(function(e) {
			Foxtrick.log('FATAL CHPP ERROR in retrieve:', e);
		});

	},

	// batchParameters: array of parameters for retrieve function
	// returns array of xml docs with matching indices
	// still better to later identify xmls by content, not by index
	batchRetrieve: function(doc, batchParameters, options, callback) {
		if (!Foxtrick.Prefs.getBool('xmlLoad')) {
			Foxtrick.log('XML loading disabled');
			try {
				callback(null);
				return;
			}
			catch (e) {
				Foxtrick.log('ApiProxy: uncaught callback error:', e,
				             'parameters:', batchParameters);
			}
			return;
		}

		let chppPromises = Foxtrick.map(function(params, i) {
			let opts = Array.isArray(options) ? options[i] : options;
			return new Promise(function(resolve) {
				Foxtrick.util.api.retrieve(doc, params, opts, (xml, errorText) => {
					Foxtrick.util.api.addHelpers(xml);
					resolve([xml, errorText]);
				});
			}).catch(function(e) {
				Foxtrick.log('FATAL CHPP ERROR in batchRetrieve:', e);
				return [null, e.message];
			});
		}, batchParameters);

		Promise.all(chppPromises).then(function(arr) {
			let responses = arr.map(([xml]) => xml);
			let errors = arr.map(([_, err]) => err);
			callback(responses, errors);
		}).catch(function(e) {
			Foxtrick.log('ApiProxy: uncaught callback error:', e, 'parameters:', batchParameters);
		});

	},

	invalidateAccessToken: function() {
		let teamId = Foxtrick.util.id.getOwnTeamId();
		let keys = Foxtrick.Prefs.getAllKeysOfBranch('oauth.' + teamId);
		for (let key of keys)
			Foxtrick.Prefs.deleteValue(key);
	},

	getAccessToken: function() {
		let teamId = Foxtrick.util.id.getOwnTeamId();
		return Foxtrick.Prefs.getString('oauth.' + teamId + '.accessToken');
	},

	setAccessToken: function(token) {
		let teamId = Foxtrick.util.id.getOwnTeamId();
		Foxtrick.Prefs.setString('oauth.' + teamId + '.accessToken', token);
	},

	getAccessTokenSecret: function() {
		let teamId = Foxtrick.util.id.getOwnTeamId();
		return Foxtrick.Prefs.getString('oauth.' + teamId + '.accessTokenSecret');
	},

	setAccessTokenSecret: function(secret) {
		let teamId = Foxtrick.util.id.getOwnTeamId();
		Foxtrick.Prefs.setString('oauth.' + teamId + '.accessTokenSecret', secret);
	},

	stripToken: function(url) {
		return url.slice(0, url.indexOf('oauth_consumer_key'));
	},

	getErrorText: function(text, status) {
		var errorText;

		try {
			errorText = text.getElementsByTagName('title')[0].textContent;
		}
		catch (e) {
			try {

				var xml = Foxtrick.parseXML(text);
				if (xml == null)
					errorText = Foxtrick.L10n.getString('exception.error').replace(/%s/, -1);
				else
					errorText = xml.getElementsByTagName('h2')[0].textContent;

			}
			catch (ee) {

				errorText = Foxtrick.L10n.getString('exception.error').replace(/%s/, status);

			}
		}

		return errorText;
	},
};
