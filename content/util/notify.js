'use strict';
/*
 * notify.js
 * Utilities for creating a notification
 */

if (!Foxtrick.util)
	Foxtrick.util = {};
Foxtrick.util.notify = {};

if (Foxtrick.platform === 'Chrome' && chrome.notifications) {
	// store notification data
	Foxtrick.util.notify._notes = {};
	(function() {
		var focusWindow = function(id) {
			// focus window. needs permissions: tabs. only nightly as for now
			try {
				chrome.windows.update(id, { focused: true });
			}
			catch (e) {}
		};
		var openTabFromNote = function(noteId, tabOptsFn) {
			var note = Foxtrick.util.notify._notes[noteId];
			if (note) {
				var tabOpts = tabOptsFn(note);
				// focus sender tab
				chrome.tabs.update(note.tab, tabOpts, function() {
					if (chrome.runtime.lastError) {
						// tab closed, open new
						chrome.tabs.create({ url: note.url }, function(tab) {
							focusWindow(tab.windowId);
						});
					}
					else {
						focusWindow(note.window);
					}
				});
			}
			// remove used
			chrome.notifications.clear(noteId, function(done) {});
		};
		chrome.notifications.onClicked.addListener(function(noteId) {
			openTabFromNote(noteId, function(note) { return { selected: true }; });
		});
		chrome.notifications.onButtonClicked.addListener(function(noteId, bId) {
			openTabFromNote(noteId, function(note) { return { selected: true, url: note.url }; });
		});
	})();
}

// show a notification containin given message and link if possible
// the first 3 parameters are used in both bg and content
// @param msg - message to be shown
// @param source - URL of event if applicable
Foxtrick.util.notify.create = function(msg, source, cb, opts) {
	var createGecko = function() {
		var img = Foxtrick.InternalPath + 'resources/img/icon-128.png';
		var title = 'Hattrick';
		var clickable = true;
		var listener = {
			observe: function(subject, topic, data) {
				try {
					if (topic == 'alertclickcallback') {
						if (Foxtrick.platform == 'Firefox')
							Foxtrick.openAndReuseOneTabPerURL(source, true);
						else {
							Foxtrick.SB.ext.sendRequest({ req: 'reuseTab', url: source });
						}
					}
					if (topic == 'alertfinished') {
						// empty
					}
				}
				catch (e) {
					Foxtrick.log(e);
				}
			}
		};

		try {
			var alertWin = Cc['@mozilla.org/alerts-service;1'].
				getService(Ci.nsIAlertsService);
			alertWin.showAlertNotification(img, title, msg, clickable, source, listener);
		}
		catch (e) {
			// fix for when alerts-service is not available (e.g. SUSE)
			var alertWin = Services.ww.
				openWindow(null, 'chrome://global/content/alerts/alert.xul',
				           '_blank', 'chrome,titlebar=no,popup=yes', null);
			alertWin.arguments = [img, 'www.hattrick.org', msg, clickable, source, 0, listener];
		}
	};

	var id = '', chromeOpts = {};
	if (opts) {
		// in content (need to send to bg)
		chromeOpts = opts.opts || {};
		id = opts.id;
	}
	else if (typeof msg === 'object') {
		// in bg (msg from content)
		chromeOpts = msg.opts;
		id = msg.id;
	}

	if (Foxtrick.arch == 'Gecko') {
		createGecko();
	}
	else if (Foxtrick.chromeContext() === 'background') {
		if (Foxtrick.platform === 'Chrome' && chrome.notifications) {
			var options = {
				type: 'basic',
				iconUrl: 'resources/img/icon-128.png',
				title: 'Hattrick',
				message: msg.msg,
				contextMessage: Foxtrick.L10n.getString('notify.focus'),
				// buttons: [
				// 	{ title: 'Button1', iconUrl: 'resources/img/hattrick-logo.png' },
				// 	{ title: 'Button2', iconUrl: 'resources/img/hattrick-logo.png' }
				// ],
				// items: [
				// 	{ title: 'Item1', message: 'resources/img/hattrick-logo.png' },
				// 	{ title: 'Item2', message: 'resources/img/hattrick-logo.png' }
				// ],
				isClickable: true
			};
			if (chromeOpts) {
				// overwrite defaults
				for (var opt in chromeOpts)
					options[opt] = chromeOpts[opt];
			}
			if (id !== '') {
				// named note, save source
				this._notes[id] = {
					url: msg.url,
					tab: source.tab.id,
					window: source.tab.windowId
				};
			}
			chrome.notifications.getAll(function(notes) {
				// check if exists
				if (chrome.runtime.lastError)
					return;
				var addNew = function() {
					chrome.notifications.create(id, options, function(a) {
						if (chrome.runtime.lastError)
							return;
					});
				};
				if (id in notes)
					// need to clear first
					// otherwise new note is not displayed
					chrome.notifications.clear(id, function(done) { addNew(); });
				else
					addNew();
			});
		}
		else if (window.webkitNotifications) {
			var notification = webkitNotifications.createNotification(
				'resources/img/hattrick-logo.png', // logo location
				'Hattrick', // notification title
				msg.msg // notification body text
			);
			// this webkit notification. onclick is needed
			notification.onclick = function() {
				if (Foxtrick.platform == 'Chrome') {
					// goto msg.url in sender tab
					chrome.tabs.update(source.tab.id, { url: msg.url, selected: true });
					// focus last window. needs permissions: tabs. only nightly as for now
					try {
						chrome.windows.update(source.tab.windowId, { focused: true });
					}
					catch (e) {}
				}
				else
					Foxtrick.SB.tabs.create({ url: msg.url });
				notification.cancel();
			};
			// Then show the notification.
			notification.show();
			// close after 10 sec
			window.setTimeout(function() { notification.cancel(); }, 10000);
		}
		if (Foxtrick.platform === 'Safari') {
			var showGrowlNotification = function(msg) {
				try {
					if (window.GrowlSafariBridge &&
					    window.GrowlSafariBridge.notifyWithOptions) {
						window.GrowlSafariBridge.notifyWithOptions(msg.name, msg.status, {
							isSticky: false,
							priority: -1,
							imageUrl: msg.img_url
						});
					}
				}
				catch (e) { Foxtrick.log(e); }
			};

			var img = Foxtrick.InternalPath + 'resources/img/hattrick-logo.png';
			showGrowlNotification({ name: 'www.hattrick.org', status: msg.msg, img_url: img });
		}
	}
	else {
		// content needs to notify bg
		Foxtrick.SB.ext.sendRequest({
			req: 'notify',
			msg: msg,
			url: source,
			id: id,
			opts: chromeOpts
		});
	}
};
