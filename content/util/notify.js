'use strict';
/*
 * notify.js
 * Utilities for creating a notification
 *
 * @author ryanli, convincedd, LA-MJ
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.util)
	Foxtrick.util = {};

Foxtrick.util.notify = {};

if (Foxtrick.platform === 'Chrome' && chrome.notifications) {
	// store notification data
	Foxtrick.util.notify.__notes = {};
	(function() {
		var focusWindow = function(winId) {
			try {
				chrome.windows.update(winId, { focused: true });
			}
			catch (e) {}
		};

		var openTabFromNote = function(noteId, tabOptsFn) {
			var note = Foxtrick.util.notify.__notes[noteId];
			if (note) {
				var tabOpts = tabOptsFn(note);

				// focus sender tab
				chrome.tabs.update(note.tabId, tabOpts, function() {
					if (chrome.runtime.lastError) {
						// tab closed, open new
						chrome.tabs.create({ url: note.url }, function(tab) {
							focusWindow(tab.windowId);
						});
					}
					else {
						focusWindow(note.windowId);
					}
				});
			}

			// remove used
			var noOp = function(done) {}; // jshint ignore:line
			chrome.notifications.clear(noteId, noOp);
		};

		var runCb = function(noteId) {
			var note = Foxtrick.util.notify.__notes[noteId];
			if (note) {
				note.callback(note.url);
			}
		};

		chrome.notifications.onClicked.addListener(function(noteId) {
			openTabFromNote(noteId, function() { return { selected: true };	});
			runCb(noteId);
		});

		chrome.notifications.onButtonClicked.addListener(
		  function(noteId, btnIdx) { // jshint ignore:line
			openTabFromNote(noteId, function(note) { // jshint ignore:line
				return { selected: true, url: note.url };
			});
			runCb(noteId);
		});
	})();
}

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
	var TITLE = 'Hattrick';
	var IMG = Foxtrick.InternalPath + 'resources/img/icon-128.png';
	var NAME = 'Foxtrick';
	var IS_CLICKABLE = true;

	var createGecko = function() {

		var listener = {
			observe: function(subject, topic, data) { // jshint ignore:line
				try {
					if (topic === 'alertclickcallback') {
						if (Foxtrick.platform == 'Firefox')
							Foxtrick.openAndReuseOneTabPerURL(url, true);
						else {
							Foxtrick.SB.ext.sendRequest({ req: 'reuseTab', url: url });
						}
					}

					// if (topic === 'alertfinished') {
					// }

					if (typeof callback === 'function')
						callback(data);
				}
				catch (e) {
					Foxtrick.log(e);
				}
			},
		};

		try {
			var alertWin = Cc['@mozilla.org/alerts-service;1'].getService(Ci.nsIAlertsService);
			alertWin.showAlertNotification(IMG, TITLE, msg, IS_CLICKABLE, url, listener, NAME);
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
			var winArgs = [IMG, TITLE, msg, IS_CLICKABLE, url, 2, null, null, null, listener, NAME];

			// aParentwindow, aUrl, aWindowName, aWindowFeatures, aWindowArguments (nsISupports)
			var win = Services.ww.openWindow(null, ALERT_XUL, '_blank', FF_WIN_OPTS, null);
			win.arguments = winArgs;
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

		if (id !== '') {
			// named note, save source
			Foxtrick.util.notify.__notes[id] = {
				url: url,
				tabId: source.tab.id,
				windowId: source.tab.windowId,
				callback: callback,
			};
		}

		chrome.notifications.getAll(function(notes) {
			// check if exists
			if (chrome.runtime.lastError)
				return;

			var addNew = function() {
				chrome.notifications.create(id, options, function(nId) { // jshint ignore:line
					var err = chrome.runtime.lastError;
					if (err && /^Adding buttons/.test(err.message)) {
						// opera does not support buttons
						delete options.buttons;
						opts = options;
						createChrome();
					}
				});
			};

			if (id in notes) {
				// need to clear first
				// otherwise new note is not displayed
				chrome.notifications.clear(id, function(success) { // jshint ignore:line
					addNew();
				});
			}
			else {
				addNew();
			}

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

				chrome.tabs.update(source.tab.id, { url: url, selected: true }, function() {
					if (chrome.runtime.lastError) {
						// tab closed, open new
						chrome.tabs.create({ url: url }, function(tab) {
							focusWindow(tab.windowId);
						});
					}
					else {
						focusWindow(source.tab.windowId);
					}
				});

			}
			else {
				Foxtrick.SB.tabs.create({ url: url });
			}

			this.cancel();

			callback(url);
		};

		var notification = window.webkitNotifications.createNotification(IMG, TITLE, msg);

		if (url)
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
	var id = '', url = '';
	if (opts && opts.opts) {
		// request to background
		id = opts.id || '';
		url = opts.url;

		opts = opts.opts;
	}
	else {
		// gecko or content
		opts = opts || {};

		if (opts.id) {
			id = opts.id;
			delete opts.id;
		}

		url = source;
	}

	// start logic
	if (Foxtrick.arch == 'Gecko') {
		createGecko();
	}
	else if (Foxtrick.chromeContext() === 'background') {
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
			id: id,
			url: url,
			opts: opts,
		}, callback);
	}
};
