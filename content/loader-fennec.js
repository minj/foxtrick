'use strict';
/*
 * loader-fennec.js
 * FoxTrick loader for Fennec platform
 */


if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.loader)
	Foxtrick.loader = {};

if (Foxtrick.platform == 'Android') {

	// window in content fennec script is named 'content'
	if (!window)
		var window = content;

	// fennec tab load. starts the content instances for fennec (one per tab. persistant)
	Foxtrick.loader.fennec = {
		DOMContentLoadedListener: function(ev) {
			// DOM ready. run on DOM page
			Foxtrick.entry.docLoad(ev.originalTarget);
		},

		stopListener: function(request, sender, sendResponse) {
			if (request == 'unload')
				Foxtrick.loader.fennec.stop();
		},

		stop: function() {
			// stop listen to DOMContentLoaded
			removeEventListener('DOMContentLoaded',
			                    Foxtrick.loader.fennec.DOMContentLoadedListener, false);

			// stop listen to unload request
			sandboxed.extension.onRequest.removeListener(Foxtrick.loader.fennec.stopListener);
		},

		tabLoadStart: function() {
			// listen to unload request
			sandboxed.extension.onRequest.addListener(Foxtrick.loader.fennec.stopListener);

			// request needed data from background and start with DOMContentLoaded
			sandboxed.extension.sendRequest({ req: 'tabLoad' },
			  function(data) {
				Foxtrick.log('tabLoad: initing and adding listener');
				Foxtrick.entry.contentScriptInit(data);
				addEventListener('DOMContentLoaded',
				                 Foxtrick.loader.fennec.DOMContentLoadedListener, false);
			});
		}
	};

	// first content side entry point. gets executed after scripts are loaded
	Foxtrick.loader.fennec.tabLoadStart();
}
