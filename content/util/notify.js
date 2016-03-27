'use strict';
/*
 * notify.js
 * Utilities for creating a notification
 *
 * @author ryanli, convincedd, LA-MJ
 */

if (!Foxtrick)
	var Foxtrick = {}; // jshint ignore: line
if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.notify = {};

/**
 * Create a desktop notification with a given message and link to source
 *
 * source is normally an URL or sender object in the background (non-Gecko).
 * opts is chrome NotificationOptions or
 * {msg, url, id: string, opts: NotificationOptions} in the background (non-Gecko).
 *
 * @param {string}        msg
 * @param {string|object} source
 * @param {object}        opts
 * @param {function}      callback {function(string)}
 */
Foxtrick.util.notify.create = function(msg, source, opts, callback) {
	const TITLE = 'Hattrick';
	const IMG = Foxtrick.InternalPath + 'resources/img/icon-128.png';
	const NAME = 'Foxtrick';
	const IS_CLICKABLE = true;

	var gId = '', gUrl = '';

	var createGecko = function() {

		var listener = {
			/**
			 * observer function
			 * @param  {object} subject null
			 * @param  {string} topic   {alertclickcallback|alertshow|alertfinished}
			 * @param  {string} data    url
			 */
			observe: function(subject, topic, data) { // jshint ignore:line
				try {
					if (topic === 'alertclickcallback') {
						if (Foxtrick.platform == 'Firefox')
							Foxtrick.openAndReuseOneTabPerURL(data, true);
						else {
							Foxtrick.SB.ext.sendRequest({ req: 'reuseTab', url: data });
						}

						if (typeof callback === 'function')
							callback(data);
					}
				}
				catch (e) {
					Foxtrick.log(e);
				}
			},
		};

		try {
			var alertWin = Cc['@mozilla.org/alerts-service;1'].getService(Ci.nsIAlertsService);
			alertWin.showAlertNotification(IMG, TITLE, msg, IS_CLICKABLE, gUrl, listener, NAME);
		}
		catch (e) {
			// fix for when alerts-service is not available (e.g. SUSE)
			var ALERT_XUL = 'chrome://global/content/alerts/alert.xul';
			var FF_WIN_OPTS = 'chrome,dialog=yes,titlebar=no,popup=yes';

			// arguments[0] --> the image src url
			// arguments[1] --> the alert title
			// arguments[2] --> the alert text
			// arguments[3] --> is the text clickable?
			// arguments[4] --> the alert cookie to be passed back to the listener
			// arguments[5] --> the alert origin reported by the look and feel
			// 0: bottom right.
			// 2: bottom left
			// 4: top right
			// 6: top left
			// arguments[6] --> bidi
			// arguments[7] --> lang
			// arguments[8] --> replaced alert window (nsIDOMWindow)
			// // i. e. previous alert
			// arguments[9] --> an optional callback listener (nsIObserver)
			// arguments[10] -> the nsIURI.hostPort of the origin, optional
			var wArgs = [IMG, TITLE, msg, IS_CLICKABLE, gUrl, 2, null, null, null, listener, NAME];

			// aParentwindow, aUrl, aWindowName, aWindowFeatures, aWindowArguments (nsISupports)
			var win = Services.ww.openWindow(null, ALERT_XUL, '_blank', FF_WIN_OPTS, null);
			win.arguments = wArgs;
		}
	};

	var createChrome = function() {
		var options = {
			type: 'basic',
			iconUrl: IMG,
			title: TITLE,
			message: msg,
			contextMessage: Foxtrick.L10n.getString('notify.focus'),
			isClickable: IS_CLICKABLE,
			// buttons: [
			// 	{ title: 'Button1', iconUrl: 'resources/img/hattrick-logo.png' },
			// 	{ title: 'Button2', iconUrl: 'resources/img/hattrick-logo.png' }
			// ],
			// items: [
			// 	{ title: 'Item1', message: 'resources/img/hattrick-logo.png' },
			// 	{ title: 'Item2', message: 'resources/img/hattrick-logo.png' }
			// ],
		};
		if (opts) {
			// overwrite defaults
			for (var opt in opts)
				options[opt] = opts[opt];
		}

		var clearNote = function(noteId) {
			return new Promise(function(resolve) {
				chrome.notifications.clear(noteId, resolve);
			});
		};

		var updateOriginTab = function(originTab, tabOpts) {
			var focusWindow = function(winId) {
				return new Promise(function(resolve) {
					chrome.windows.update(winId, { focused: true }, resolve);
				});
			};

			return new Promise(function(resolve) {
				chrome.tabs.update(originTab.id, tabOpts,
				  function(tab) { // jshint ignore:line
					if (chrome.runtime.lastError) {
						// tab closed, open new
						chrome.tabs.create({ url: gUrl }, resolve);
					}
					else {
						resolve(tab);
					}
				});
			}).then(function(tab) {
				return focusWindow(tab.windowId).then(function() {
					return tab;
				});
			});
		};

		chrome.notifications.onButtonClicked.addListener(
		  function onButtonClicked(noteId, btnIdx) { // jshint ignore:line
			if (noteId !== gId)
				return;

			chrome.notifications.onButtonClicked.removeListener(onButtonClicked);

			var tabOpts = { selected: true, url: gUrl }; // focus and open

			clearNote(noteId).then(function() {
				return updateOriginTab(source.tab, tabOpts);
			}).then(function() {
				callback(gUrl);
			}).catch(Foxtrick.catch('notifications.onButtonClicked'));
		});

		chrome.notifications.onClicked.addListener(
		  function onClicked(noteId) {
			if (noteId !== gId)
				return;

			chrome.notifications.onClicked.removeListener(onClicked);

			var tabOpts = { selected: true }; // focus only

			clearNote(noteId).then(function() {
				return updateOriginTab(source.tab, tabOpts);
			}).then(function() {
				callback(gUrl);
			}).catch(Foxtrick.catch('notifications.onClicked'));
		});

		chrome.notifications.getAll(function(notes) {
			if (chrome.runtime.lastError)
				return;

			Promise.resolve(notes).then(function(notes) {

				if (gId in notes)
					return clearNote(gId);

			}).then(function() {
				chrome.notifications.create(gId, options,
				  function(nId) { // jshint ignore:line
					var err = chrome.runtime.lastError;
					if (err && /^Adding buttons/.test(err.message)) {
						// opera does not support buttons
						delete options.buttons;
						opts = options;
						createChrome();
					}
				});
			}).catch(Foxtrick.catch('notifications.getAll'));
		});
	};

	var createWebkit = function() {
		var onclick = function() {
			if (Foxtrick.platform === 'Chrome') {
				// goto url in sender tab
				var focusWindow = function(windowId) {
					try {
						chrome.windows.update(windowId, { focused: true });
					}
					catch (e) {}
				};

				chrome.tabs.update(source.tab.id, { url: gUrl, selected: true }, function() {
					if (chrome.runtime.lastError) {
						// tab closed, open new
						chrome.tabs.create({ url: gUrl }, function(tab) {
							focusWindow(tab.windowId);
						});
					}
					else {
						focusWindow(source.tab.windowId);
					}
				});

			}
			else {
				Foxtrick.SB.tabs.create({ url: gUrl });
			}

			this.cancel();

			callback(gUrl);
		};

		var notification = window.webkitNotifications.createNotification(IMG, TITLE, msg);

		if (gUrl)
			notification.onclick = onclick;

		// Then show the notification.
		notification.show();

		// close after 20 sec
		window.setTimeout(function() { notification.cancel(); }, 20000);
	};

	var createGrowl = function() {
		var bridge = window.GrowlSafariBridge;
		try {
			if (bridge && bridge.notifyWithOptions) {
				bridge.notifyWithOptions(TITLE, msg, {
					isSticky: false,
					priority: -1,
					imageUrl: IMG,
				});
			}
		}
		catch (e) { Foxtrick.log(e); }
	};

	// standardize options
	if (opts && opts.opts) {
		// request to background
		gId = opts.id || '';
		gUrl = opts.url;

		opts = opts.opts;
	}
	else {
		// gecko or content
		opts = opts || {};

		if (opts.id) {
			gId = opts.id;
			delete opts.id;
		}

		gUrl = source;
	}

	// start logic
	if (Foxtrick.arch == 'Gecko') {
		createGecko();
	}
	else if (Foxtrick.context === 'background') {
		if (Foxtrick.platform === 'Chrome' && chrome.notifications) {
			createChrome();
		}
		else if (window.webkitNotifications) {
			createWebkit();
		}
		else if (Foxtrick.platform === 'Safari') {
			createGrowl();
		}
	}
	else {
		// content needs to notify bg
		Foxtrick.SB.ext.sendRequest({
			req: 'notify',
			msg: msg,
			id: gId,
			url: gUrl,
			opts: opts,
		}, callback);
	}
};
