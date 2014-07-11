'use strict';
/**
 * loader_chrome.js
 * Foxtrick loader
 * @author  convincedd
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.loader)
	Foxtrick.loader = {};

Foxtrick.loader.chrome = {};

// invoked when an allowed HTML document (as defined by eg manifest.json) is load started
// starts the content instances for chrome/safari (one per tab/peg. not persistant)
Foxtrick.loader.chrome.docLoadStart = function() {
	try {
		if (!Foxtrick.isHtUrl(document.location.href)
			|| Foxtrick.isExcluded(document))
			return;

		var DOMContentLoaded = false;
		var LocalResourcesLoaded = false;

		var beginRequest = new Date();

		// request resources from background script
		// calls/adds Foxtrick.loader.chrome.docLoadEnd
		Foxtrick.SB.ext.sendRequest({ req: 'pageLoad' },
		  function(data) {
			try {
				var beginInit = new Date();

				if (data.error)
					Foxtrick.log(data.error);

				Foxtrick.entry.contentScriptInit(data);

				if ((Foxtrick.Prefs.getBool('disableOnStage')
						&& Foxtrick.isStage(document))
					|| Foxtrick.Prefs.getBool('disableTemporary')) {
					// not on Hattrick or disabled
					Foxtrick.log(' Foxtrick disabled');
					return;
				}

				var moduleCss = document.getElementById('ft-module-css');
				// remove old CSS if exists
				if (moduleCss)
					moduleCss.parentNode.removeChild(moduleCss);
				// inject CSS
				Foxtrick.util.inject.css(document, data.cssText, 'ft-module-css');

				Foxtrick.entry.cssLoaded = true;

				// safari context menu special paste listener
				if (Foxtrick.platform == 'Safari') {
					window.addEventListener('mouseup', Foxtrick.loader.chrome.clickListener, false);
					Foxtrick.loader.chrome.initGrowl();
				}

				var nowTime = new Date();
				var requestTime = beginInit.getTime() - beginRequest.getTime();
				var initTime = nowTime - beginInit.getTime();
				Foxtrick.log('request time: ', requestTime, ' - init time: ', initTime, ' ms');


				if (DOMContentLoaded) {
					Foxtrick.log('LocalResourcesLoad took too long. run now. ');
					Foxtrick.entry.docLoad(document);
				}
				LocalResourcesLoaded = true;

			} catch (e) { Foxtrick.log('loader init: ', e); }
		});

		// that's our normal entry point unless init took too long.
		window.addEventListener('DOMContentLoaded', function() {
			DOMContentLoaded = true;
			if (LocalResourcesLoaded)
				Foxtrick.entry.docLoad(document);
		}, false);

	} catch (e) {
		Foxtrick.log(e);
	}
};


Foxtrick.loader.chrome.clickListener = function(e) {
	try {
		if (typeof(e.target.tagName) != 'undefined' &&
			((e.target.tagName == 'INPUT' && e.target.type == 'text') || // text imput
			e.target.tagName == 'TEXTAREA') &&	// or text area
			e.button == 0 && 		// left mouse button
			e.shiftKey == true) { 	// our special key we listen too

			Foxtrick.sessionGet('clipboard', function(text) {
				if (text) {
					// insert clipboard at current position
					ta = e.target;
					var s = Foxtrick.getSelection(ta);
					// Mozilla
					if (ta.selectionStart || ta.selectionStart == '0') {
						var st = ta.scrollTop;
						ta.value = s.textBeforeSelection + text +
									s.textAfterSelection;
						ta.scrollTop = st;
					}
					// Others
					else {
						ta.value += text;
					}
				}
			});
		}
	} catch (e) { Foxtrick.log(e) }
};

Foxtrick.loader.chrome.initGrowl = function() {
	try {
		if (document.getElementsByTagName('body').length) {
			var object = document.createElement('object');
			object.setAttribute('type', 'application/x-growl-safari-bridge');
			object.width = '0';
			object.height = '0';
			object.id = 'growl-safari-bridge';
			document.getElementsByTagName('body')[0].appendChild(object);
			window.GrowlSafariBridge = object;
		}
	} catch (e) { Foxtrick.log(e); }
};

// this is the content side entry point for chrome/safari
Foxtrick.loader.chrome.docLoadStart();
