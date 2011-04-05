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
		var img = Foxtrick.ResourcePath + "resources/img/hattrick-logo.png";
		var title = "Hattrick.org";
		var clickable = true;
		var listener = {
			observe: function(subject, topic, data) {
				try {
					if (topic == "alertclickcallback") {
						Foxtrick.newTab(href);
					}
					if (topic == "alertfinished") {
						// empty
					}
				}
				catch (e) {
					Foxtrick.dumpError(e);
				}
			}
		};

		try {
			var alertWin = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
			alertWin.showAlertNotification(img, title, msg, clickable, url, listener);
		}
		catch (e) {
			// fix for when alerts-service is not available (e.g. SUSE)
			var alertWin = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
				.getService(Components.interfaces.nsIWindowWatcher)
				.openWindow(null, "chrome://global/content/alerts/alert.xul",
					"_blank", "chrome,titlebar=no,popup=yes", null);
			alertWin.arguments = [img, "www.hattrick.org", msg, clickable, url, 0, listener];
		}
	};
	var createChrome = function() {
		chrome.extension.sendRequest({req : "notify", msg : msg});
	};
	var createGrowl = function() {
		// Mac only
		var grn = Components.classes["@growl.info/notifications;1"].getService(Components.interfaces.grINotifications);
		var img = "http://hattrick.org/favicon.ico";
		var title = "Hattrick.org";
		grn.sendNotification("Hattrick.org (Foxtrick)", img, title, msg, "", null);
	};

	if (Foxtrick.BuildFor == "Gecko") {
		createGecko();
		try {
			createGrowl();
		}
		catch (e) {
			// not on Mac, throw away
		}
	}
	else if (Foxtrick.BuildFor == "Chrome") {
		createChrome();
	}
};
