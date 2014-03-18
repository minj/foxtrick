'use strict';
/*
 * notify.js
 * Utilities for creating a notification
 */

if (!Foxtrick) var Foxtrick = {};
if (!Foxtrick.util) Foxtrick.util = {};
Foxtrick.util.notify = {};

// show a notification containin given message and link if possible
// @param msg - message to be shown
// @param url - URL of event if applicable
Foxtrick.util.notify.create = function(msg, url) {
	var createGecko = function() {
		var img = Foxtrick.InternalPath + 'resources/img/hattrick-logo.png';
		var title = 'Hattrick.org';
		var clickable = true;
		var listener = {
			observe: function(subject, topic, data) {
				try {
					if (topic == 'alertclickcallback') {
						if (Foxtrick.platform == 'Firefox')
							Foxtrick.openAndReuseOneTabPerURL(url, true);
						else {
							Foxtrick.SB.ext.sendRequest({ req: 'reuseTab', url: url });
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
			alertWin.showAlertNotification(img, title, msg, clickable, url, listener);
		}
		catch (e) {
			// fix for when alerts-service is not available (e.g. SUSE)
			var alertWin = Services.ww.
				openWindow(null, 'chrome://global/content/alerts/alert.xul',
				           '_blank', 'chrome,titlebar=no,popup=yes', null);
			alertWin.arguments = [img, 'www.hattrick.org', msg, clickable, url, 0, listener];
		}
	};
	var createChrome = function() {
		Foxtrick.SB.ext.sendRequest({ req: 'notify', msg: msg, url: url });
	};

	if (Foxtrick.arch == 'Gecko') {
		createGecko();
	}
	else if (Foxtrick.platform == 'Chrome') {
		createChrome();
	}
	else if (Foxtrick.platform == 'Safari') {
		createChrome();
	}
};
