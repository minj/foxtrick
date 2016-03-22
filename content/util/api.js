'use strict';
/**
 * api.js
 * Proxy for authorizing and retrieving XML data from Hattrick
 * @author ryanli
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.api = {
	consumerKey: 'sKDixHQBSGgdJ3a9O6lRtL',
	consumerSecret: 'DIZIDBTX64d0+-9fPq8GrYN5PNHtMxYhpS9ZKsbcPqf',

	signatureMethod: 'HMAC-SHA1',
	requestTokenUrl: 'https://chpp.hattrick.org/oauth/request_token.ashx',
	authorizeUrl: 'https://chpp.hattrick.org/oauth/authorize.aspx',
	accessTokenUrl: 'https://chpp.hattrick.org/oauth/access_token.ashx',
	resourceUrl: 'http://chpp.hattrick.org/chppxml.ashx',

	// map of requested and unprocessed urls { serialized url: true }
	queue: {},

	authorized: function() {
		return Foxtrick.util.api.getAccessToken()
			&& Foxtrick.util.api.getAccessTokenSecret();
	},

	authorizationQueued: false,
	authorize: function(doc) {
		if (Foxtrick.util.api.authorizationQueued)
			return;
		else {
			Foxtrick.util.api.authorizationQueued = true;
			var win = doc.defaultView;
			win.setTimeout(function() {
				Foxtrick.util.api.authorizationQueued = false;
				Foxtrick.util.api._authorize(this.document);
			}, 0);
		}
	},

	_authorize: function(doc) {
		Foxtrick.stopListenToChange(doc);

		var div = doc.createElement('div');
		var accessor = {
			consumerSecret: Foxtrick.util.api.consumerSecret,
			tokenSecret: null
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
				['oauth_callback', 'oob'] // no callback
			]
		};
		Foxtrick.OAuth.setTimestampAndNonce(msg);
		Foxtrick.OAuth.SignatureMethod.sign(msg, accessor);
		var requestTokenUrl = Foxtrick.OAuth.addToURL(Foxtrick.util.api.requestTokenUrl,
		                                              msg.parameters);
		var link = doc.createElement('a');
		link.className = 'ft-link';
		link.textContent = Foxtrick.L10n.getString('oauth.authorize');
		Foxtrick.onClick(link, function(ev) {
			Foxtrick.stopListenToChange(doc);
			showNotice();
			var linkPar = doc.createElement('p');
			div.appendChild(linkPar);
			linkPar.appendChild(Foxtrick.util.note.createLoading(doc, null, true));
			Foxtrick.log('Requesting token at: ', Foxtrick.util.api.stripToken(requestTokenUrl));
			Foxtrick.util.load.fetch(requestTokenUrl, function(text, status) {
				Foxtrick.stopListenToChange(doc);
				linkPar.textContent = ''; // clear linkPar first
				if (status != 200) {
					// failed to fetch link
					linkPar.textContent = Foxtrick.util.api.getErrorText(text, status);
					return;
				}
				var requestToken = text.split(/&/)[0].split(/=/)[1];
				var requestTokenSecret = text.split(/&/)[1].split(/=/)[1];
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
						tokenSecret: requestTokenSecret
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
							['oauth_verifier', input.value]
						]
					};
					Foxtrick.OAuth.setTimestampAndNonce(msg);
					Foxtrick.OAuth.SignatureMethod.sign(msg, accessor);
					var query = Foxtrick.OAuth.formEncode(msg.parameters);
					var accessTokenUrl = Foxtrick.util.api.accessTokenUrl + '?' + query;
					Foxtrick.log('Requesting access token at: ',
					             Foxtrick.util.api.stripToken(accessTokenUrl));
					Foxtrick.util.load.fetch(accessTokenUrl, function(text, status) {
						if (status != 200) {
							// failed to fetch link
							showFinished(Foxtrick.util.api.getErrorText(text, status));
							return;
						}
						var accessToken = text.split(/&/)[0].split(/=/)[1];
						var accessTokenSecret = text.split(/&/)[1].split(/=/)[1];
						Foxtrick.util.api.setAccessToken(accessToken);
						Foxtrick.util.api.setAccessTokenSecret(accessTokenSecret);
						showFinished();
					}); // save token and secret
				}); // after hitting 'authorize' button
				inputPar.appendChild(button);
				//disabled to prevent auth-reset on dynamic pages
				//Foxtrick.startListenToChange(doc);
			}); // get authorize URL with Foxtrick.util.load.fetch()
			Foxtrick.startListenToChange(doc);
		}); // initial authorize link event listener
		div.appendChild(link);
		var showNotice = function() {
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
			Foxtrick.onClick(more, function() { Foxtrick.Prefs.show('#faq=authorize'); });
			div.appendChild(more);
		};
		var showFinished = function(text) {
			if (!text) div.textContent = Foxtrick.L10n.getString('oauth.success');
			else div.textContent = text;
		};
		Foxtrick.util.note.add(doc, div, 'ft-api-proxy-auth', { closable: false });
		Foxtrick.startListenToChange(doc);
	},


	// used to change expire date of xml_cache eg for to my_monitors nextmachtdate
	setCacheLifetime: function(parameters_str, cache_lifetime) {
		Foxtrick.sessionGet('xml_cache.' + parameters_str,
		  function(xml_cache) {
			var xml_string = xml_cache ? xml_cache.xml_string : '';
			var obj = { xml_string: xml_string, cache_lifetime: cache_lifetime };
			Foxtrick.sessionSet('xml_cache.' + parameters_str, obj);
		});
	},

	addClearCacheLink: function(doc) {
		var bottom = doc.getElementById('bottom');
		if (bottom) {
			var clear_cache_span = doc.getElementById('ft_clear_cache');
			// don't add twice
			if (!clear_cache_span) {
				clear_cache_span = doc.createElement('span');
				clear_cache_span.id = 'ft_clear_cache';
				clear_cache_span.textContent = Foxtrick.L10n.getString('api.clearCache');
				clear_cache_span.title = Foxtrick.L10n.getString('api.clearCache.title');
				Foxtrick.onClick(clear_cache_span, Foxtrick.util.api.clearCache);
				bottom.insertBefore(clear_cache_span, bottom.firstChild);
			}
		}
	},

	clearCache: function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			Foxtrick.sessionDeleteBranch('xml_cache');
			doc.location.reload();
		} catch (e) { Foxtrick.log(e); }
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
			container = container || this;
			return container.getElementsByTagName(tagName)[0];
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
			return Math.floor(sek / (10 * rate));
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
	retrieve: function(doc, parameters, options, callback) {
		var safeCallback = (function(parameters) {
			// create a local copy so that oauth params are skipped
			if (Array.isArray(parameters))
				parameters = parameters.slice();

			return function() {
				Foxtrick.util.api.addHelpers(arguments[0]);
				try {
					callback.apply(this, arguments);
				}
				catch (e) {
					Foxtrick.log('ApiProxy: uncaught callback error: ', e,
					             'parameters: ', parameters);
				}
			};
		})(parameters);

		if (!Foxtrick.Prefs.getBool('xmlLoad')) {
			Foxtrick.log('XML loading disabled');
			safeCallback(null);
			return;
		}

		var HT_date;
		try {
			HT_date = Foxtrick.util.time.getHTTimeStamp(doc);
		}
		catch (e) {
			// No HT time yet. We have been to fast. Lets put us 1 day in the future
			Foxtrick.log('no HT time yet');
			HT_date = Date.now() + Foxtrick.util.time.MSECS_IN_DAY;
		}

		// check global_cache_lifetime first, aka server down
		Foxtrick.sessionGet('xml_cache.global_cache_lifetime',
		  function(recheckDate) {
			if (recheckDate && (Number(recheckDate) > HT_date)) {
				Foxtrick.log('global_cache_lifetime set. recheck later: ',
									'  recheckDate: ', (new Date(recheckDate)).toString(),
									'  current timestamp: ', (new Date(HT_date)).toString());
				Foxtrick.util.api.addClearCacheLink(doc);
				safeCallback(null, Foxtrick.L10n.getString('api.serverUnavailable'));
				return;
			}

			var parameters_str = JSON.stringify(parameters);
			Foxtrick.sessionGet('xml_cache.' + parameters_str,
			  function(xml_cache) {
				var session = options && options.cache_lifetime === 'session' || false;
				var cacheTime = 0;
				if (xml_cache) {
					cacheTime = Number(xml_cache.cache_lifetime);
					var cacheString = session ? 'session ' : '';
					if (cacheTime)
						cacheString += new Date(cacheTime).toString();
					Foxtrick.log('ApiProxy: options: ', options, 'cache_lifetime: ', cacheString,
					             'current timestamp: ', new Date(HT_date).toString());
				}

				var getError = function(x, status) {
					var errorText = null;
					if (x == null)
						errorText = Foxtrick.L10n.getString('api.failure');
					else {
						var ErrorNode = x.getElementsByTagName('Error')[0];
						if (typeof(ErrorNode) !== 'undefined') {
							// chpp api return error xml
							errorText = ErrorNode.textContent;
							x = null;
						}
					}
					if (status == 503)
						errorText = Foxtrick.L10n.getString('api.serverUnavailable');

					return errorText;
				};
				// check file cache next
				// numetical cache time overrides 'session'
				if (xml_cache && xml_cache.xml_string && options &&
				    (session && !cacheTime || cacheTime > HT_date)) {
					Foxtrick.log('ApiProxy: use cached xml: ' , parameters_str);

					Foxtrick.util.api.addClearCacheLink(doc);

					if (xml_cache.xml_string == '503') {
						// server was down. we wait for cache expires
						safeCallback(null, Foxtrick.L10n.getString('api.serverUnavailable'));
						return;
					}

					var parser = new doc.defaultView.DOMParser();
					var xml = parser.parseFromString(JSON.parse(xml_cache.xml_string), 'text/xml');
					var errorText = getError(xml);
					safeCallback(xml, errorText);
				}
				else {
					// add to or create queue
					if (typeof(Foxtrick.util.api.queue[parameters_str]) !== 'undefined') {
						Foxtrick.util.api.queue[parameters_str].push(safeCallback);
						return;
					}
					else {
						Foxtrick.util.api.queue[parameters_str] = [];
						Foxtrick.util.api.queue[parameters_str].push(safeCallback);
					}

					// process queued requested
					var process_queued = function(x, status) {
						var errorText = getError(x, status);
						for (var i = 0; i < Foxtrick.util.api.queue[parameters_str].length; ++i)
							Foxtrick.util.api.queue[parameters_str][i](x, errorText);
						delete (Foxtrick.util.api.queue[parameters_str]);
					};

					// determine cache liftime
					if (options && options.cache_lifetime) {
						if (options.cache_lifetime == 'default')
							var cache_lifetime = HT_date + Foxtrick.util.time.MSECS_IN_HOUR;
						else var cache_lifetime = options.cache_lifetime;
					}
					else var cache_lifetime = 0;

					try {
						Foxtrick.log('ApiProxy: attempting to retrieve: ', parameters, '…');

						if (!Foxtrick.util.api.authorized()) {
							Foxtrick.log('ApiProxy: unauthorized.');
							Foxtrick.util.api.authorize(doc);
							process_queued(null, 0);
							return;
						}

						var accessor = {
							consumerSecret: Foxtrick.util.api.consumerSecret,
							tokenSecret: Foxtrick.util.api.getAccessTokenSecret()
						};
						var msg = {
							action: Foxtrick.util.api.resourceUrl,
							method: 'get',
							parameters: parameters
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
						var url = Foxtrick.OAuth.addToURL(Foxtrick.util.api.resourceUrl,
						                                  msg.parameters);
						Foxtrick.log('Fetching XML data from ', Foxtrick.util.api.stripToken(url));
						Foxtrick.util.load.xml(url, function(x, status) {
							if (status == 200) {
								var serializer = new window.XMLSerializer();
								Foxtrick.sessionSet('xml_cache.' + parameters_str,
													{ xml_string: JSON.stringify(serializer
														.serializeToString(x)),
													cache_lifetime: cache_lifetime });
								process_queued(x, status);
							}
							else if (status == 401) {
								Foxtrick.log('ApiProxy: error 401, unauthorized. Arguments: ',
								             parameters);
								Foxtrick.util.api.invalidateAccessToken(doc);
								Foxtrick.util.api.authorize(doc);
								process_queued(null, 401);
							}
							else {
								Foxtrick.log('ApiProxy: error ',
								             Foxtrick.util.api.getErrorText(x, status),
											'. Arguments: ', Foxtrick.filter(function(p) {
												return (p[0] != 'oauth_consumer_key'
														&& p[0] != 'oauth_token'
														&& p[0] != 'oauth_signature');
											}, parameters));
								//Foxtrick.log('response was: ', x);
								// server down. no need to check very page load.
								// let's say we check again in 30 min
								if (status == 503) {
									var recheckDate =
										HT_date + 30 * Foxtrick.util.time.MSECS_IN_MIN;
									Foxtrick.sessionSet('xml_cache.' + parameters_str,
													{ xml_string: '503',
													cache_lifetime: recheckDate });
									Foxtrick.sessionSet('xml_cache.global_cache_lifetime',
									                    recheckDate);
								}
								process_queued(null, status);
							}
						});
					} catch (e) {
						Foxtrick.log(e);
						process_queued(null, 0);
					}
				}
			});
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
			}
			catch (e) {
				Foxtrick.log('ApiProxy: uncaught callback error: ', e,
				             'parameters: ', batchParameters);
			}
			return;
		}
		var index = 0, responses = [], errors = [];
		var processSingle = function(last_response, errorText) {
			// collect responses
			if (index !== 0) {
				Foxtrick.util.api.addHelpers(last_response);
				responses.push(last_response);
				errors.push(errorText);
			}
			// return if finished
			if (index == batchParameters.length)
				callback(responses, errors);
			else {
				// load next file
				var opts = Array.isArray(options) ? options[index] : options;
				Foxtrick.util.api.retrieve(doc, batchParameters[index++], opts, processSingle);
			}
		};
		processSingle();
	},

	invalidateAccessToken: function() {
		var teamId = Foxtrick.util.id.getOwnTeamId();
		var array = Foxtrick.Prefs.getAllKeysOfBranch('oauth.' + teamId);
		for (var i = 0; i < array.length; i++) {
			Foxtrick.Prefs.deleteValue(array[i]);
		}},

	getAccessToken: function() {
		var teamId = Foxtrick.util.id.getOwnTeamId();
		return Foxtrick.Prefs.getString('oauth.' + teamId + '.accessToken');
	},

	setAccessToken: function(token) {
		var teamId = Foxtrick.util.id.getOwnTeamId();
		Foxtrick.Prefs.setString('oauth.' + teamId + '.accessToken', token);
	},

	getAccessTokenSecret: function() {
		var teamId = Foxtrick.util.id.getOwnTeamId();
		return Foxtrick.Prefs.getString('oauth.' + teamId + '.accessTokenSecret');
	},

	setAccessTokenSecret: function(secret) {
		var teamId = Foxtrick.util.id.getOwnTeamId();
		Foxtrick.Prefs.setString('oauth.' + teamId + '.accessTokenSecret', secret);
	},

	stripToken: function(url) {
		return url.substr(0, url.search('oauth_consumer_key') - 1);
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
