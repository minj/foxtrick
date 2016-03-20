'use strict';
/**
 * loader_chrome.js
 * Foxtrick loader
 *
 * @author ryanli, convincedd, CatzHoek, LA-MJ
 */

if (!Foxtrick)
	var Foxtrick = {}; // jshint ignore:line
if (!Foxtrick.loader)
	Foxtrick.loader = {};

Foxtrick.loader.chrome = {};

// invoked when an allowed HTML document (as defined by eg manifest.json) is load started
// starts the content instances for chrome/safari (one per tab/peg. not persistant)
Foxtrick.loader.chrome.docLoadStart = function() {
	var LOADER = this; // jscs:ignore safeContextKeyword
	try {
		if (!Foxtrick.isHtUrl(document.location.href) || Foxtrick.isExcluded(document))
			return;

		var DOMContentLoaded = false;
		var LocalResourcesLoaded = false;

		var beginRequest = new Date();

		// request resources from background script
		// calls/adds LOADER.docLoadEnd
		Foxtrick.SB.ext.sendRequest({ req: 'pageLoad' },
		  function(data) {
			try {
				var beginInit = new Date();

				if (data.error)
					Foxtrick.log(data.error);

				Foxtrick.entry.contentScriptInit(data);

				// README: cannot use Foxtrick.Prefs.isEnabled here because DOM is not ready
				if (Foxtrick.Prefs.getBool('disableOnStage') && Foxtrick.isStage(document) ||
				    Foxtrick.Prefs.getBool('disableTemporary')) {
					// not on Hattrick or disabled
					Foxtrick.log('Foxtrick disabled');
					return;
				}

				var moduleCss = document.getElementById('ft-module-css');
				// remove old CSS if exists
				if (moduleCss)
					moduleCss.parentNode.removeChild(moduleCss);

				// inject CSS
				Foxtrick.util.inject.css(document, data.cssText, 'ft-module-css');

				Foxtrick.entry.cssLoaded = true;

				if (Foxtrick.platform == 'Safari') {
					// safari context menu special paste listener
					window.addEventListener('mouseup', LOADER.clickListener);
					// growl notifications
					LOADER.initGrowl();
				}

				var nowTime = new Date();
				var requestTime = beginInit.getTime() - beginRequest.getTime();
				var initTime = nowTime - beginInit.getTime();
				Foxtrick.log('request time:', requestTime, '- init time:', initTime, 'ms');

				if (DOMContentLoaded) {
					Foxtrick.log('LocalResourcesLoad took too long, running docLoad now.');
					Foxtrick.entry.docLoad(document);
				}
				LocalResourcesLoaded = true;
			}
			catch (e) {
				Foxtrick.log('loader init:', e);
			}
		});

		// that's our normal entry point unless init took too long.
		window.addEventListener('DOMContentLoaded', function() {
			DOMContentLoaded = true;
			if (LocalResourcesLoaded)
				Foxtrick.entry.docLoad(document);
		});

	}
	catch (e) {
		Foxtrick.log(e);
	}
};


Foxtrick.loader.chrome.clickListener = function(ev) {
	try {
		// jscs:disable disallowMultipleSpaces
		if (typeof ev.target.tagName !== 'undefined' &&
			(ev.target.tagName == 'INPUT' && ev.target.type == 'text' || // text imput
			ev.target.tagName == 'TEXTAREA') &&                          // or text area
			ev.button === 0 &&      // left mouse button
			ev.shiftKey === true) { // our special key we listen too

			// jscs:enable disallowMultipleSpaces

			Foxtrick.sessionGet('clipboard', function(text) {
				if (!text)
					return;

				// insert clipboard at current position
				var target = ev.target;
				var sel = Foxtrick.getSelection(target);
				if (target.selectionStart || target.selectionStart === 0) {
					// Mozilla
					var scrollTop = target.scrollTop;
					target.value = sel.textBeforeSelection + text + sel.textAfterSelection;
					target.scrollTop = scrollTop;
				}
				else {
					// Others
					target.value += text;
				}
			});
		}
	}
	catch (e) {
		Foxtrick.log(e);
	}
};

Foxtrick.loader.chrome.initGrowl = function() {
	try {
		var object = document.createElement('object');
		object.setAttribute('type', 'application/x-growl-safari-bridge');
		object.width = '0';
		object.height = '0';
		object.id = 'growl-safari-bridge';
		document.body.appendChild(object);
		window.GrowlSafariBridge = object;
	}
	catch (e) { Foxtrick.log(e); }
};

// this is the content side entry point for chrome/safari
Foxtrick.loader.chrome.docLoadStart();
