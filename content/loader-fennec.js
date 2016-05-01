'use strict';
/*
 * loader-fennec.js
 * Foxtrick loader for Fennec platform
 *
 * @author convincedd, LA-MJ
 */

if (!Foxtrick)
	var Foxtrick = {}; // jshint ignore:line

// window in content fennec script is named 'content'
if (!window)
	var window = content; // jshint ignore:line

// Fennec tab load. starts the content instances for Fennec (one per tab, persistent)
(function() {
	if (Foxtrick.platform !== 'Android')
		return;


	var onDocLoad = function(ev) {
		// Foxtrick.log('DOMContentLoaded');
		// DOM ready. run on content page

		Foxtrick.entry.docLoad(ev.originalTarget);
	};

	var onUnload = function(request, s, r) { // jshint ignore:line
		if (request !== 'unload')
			return;

		// stop listen to unload request
		Foxtrick.SB.ext.onRequest.removeListener(onUnload);

		// stop listen to DOMContentLoaded
		removeEventListener('DOMContentLoaded', onDocLoad);
	};

	var onTabLoad = function() {
		// Foxtrick.log('Foxtrick: new tab loaded');
		// debugger;

		// listen to unload request
		Foxtrick.SB.ext.onRequest.addListener(onUnload);

		// request needed data from background and start with DOMContentLoaded
		Foxtrick.SB.ext.sendRequest({ req: 'tabLoad' }, function(data) {
			// Foxtrick.log('tabLoad: initing and adding listener');

			Foxtrick.entry.contentScriptInit(data);
			addEventListener('DOMContentLoaded', onDocLoad);
		});
	};

	// First content side entry point in Fennec.
	// Executed after all scripts are loaded.
	onTabLoad();

})();
