/**
 * loader-fennec.js
 * Foxtrick loader for Fennec platform
 *
 * @author convincedd, LA-MJ
 */

'use strict';

/* eslint-disable */
if (!this.Foxtrick)
	var Foxtrick = {};

// window in content fennec script is named 'content'
if (!this.window)
	var window = content;
/* eslint-enable */


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
