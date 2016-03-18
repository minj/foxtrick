'use strict';

/**
 * bootstrap-fennec.js
 *
 * @author convincedd, LA-MJ
 */

/* global FOXTRICK_RUNTIME, FOXTRICK_PATH */

Cu.import('resource://gre/modules/Services.jsm');

var FoxtrickFennec = function(window) {
	this.owner = window;
	// exporting symbols for scripts-fennec
	window.FOXTRICK_RUNTIME = FOXTRICK_RUNTIME;
	window.FOXTRICK_PATH = FOXTRICK_PATH;
};
FoxtrickFennec.prototype = {
	scripts: [
		// <!-- essential -->
		'env.js',
		'prefs-util.js',
		'l10n.js',
		'xml-load.js',
		'pages.js',

		// <!-- ext-lib -->
		'lib/oauth.js',
		'lib/sha1.js',
		'lib/jester.js',
		'lib/psico.js',
		// <!-- end ext-lib -->

		// <!-- util -->
		'util/api.js',
		'util/array.js',
		'util/color.js',
		'util/cookies.js',
		'util/copy-button.js',
		'util/css.js',
		'util/currency.js',
		'util/dom.js',
		'util/ht-ml.js',
		'util/id.js',
		'util/inject.js',
		'util/layout.js',
		'util/links-box.js',
		'util/load.js',
		'util/local-store.js',
		'util/log.js',
		'util/match-event.js',
		'util/match-view.js',
		'util/math.js',
		'util/misc.js',
		'util/module.js',
		'util/note.js',
		'util/notify.js',
		'util/permissions.js',
		'util/sanitize.js',
		'util/session-store.js',
		'util/string.js',
		'util/tabs.js',
		'util/time.js',
		// <!-- end util -->

		// <!-- categorized modules with init functions -->
		'forum/staff-marker.js',
		'presentation/skin-plugin.js',
		'links/links.js',

		// <!-- platform-specific -->
		'ui.js',
		'entry.js',
		'background.js',
		'scripts-fennec.js',
	],
	loadScript: function() {
		// loading Foxtrick into window.Foxtrick
		try {
			// lib scope integration
			let libMap = {
				saveAs: 'FileSaver.js',
				YAML: 'yaml.js',
				IDBStore: 'idbstore.js',
			};
			let scope = {
				self: this.owner,
				Foxtrick: this,
				exports: true,
				module: { exports: true },
				require: {},
			};
			for (let i in libMap) {
				let lib = libMap[i];
				let url = FOXTRICK_PATH + 'lib/' + lib + '?bg=' + FOXTRICK_RUNTIME;
				Services.scriptloader.loadSubScript(url, scope, 'UTF-8');
				this.owner.Foxtrick[i] = scope.module.exports;
			}
		}
		catch (e) {
			e.message = 'Foxtrick lib ERROR: ' + e.message;
			Services.console.logStringMessage(e);
		}
		for (var script of this.scripts) {
			var url = FOXTRICK_PATH + script + '?bg=' + FOXTRICK_RUNTIME;
			try {
				Services.scriptloader.loadSubScript(url, this.owner, 'UTF-8');
			}
			catch (e) {
				e.message = 'Foxtrick ERROR: ' + script + ': ' + e.message + '\n' + e.stack + '\n';
				Services.console.logStringMessage(e);
			}
		}
	},

	init: function() {
		// load Foxtrick background files and start background script
		// debugger;
		this.loadScript();
		// run background
		this.loader.background.browserLoad();
		// add styles
		this.util.css.load_module_css();
		// fennec content script injection at 'runtime'
		this.loader.background.contentScriptManager.load();
	},

	cleanup: function() {
		this.saveAs.unload();
		// stop background
		this.loader.background.browserUnload();
		// remove content scripts and listeners
		this.loader.background.contentScriptManager.unload();
		// remove styles
		this.util.css.unload_module_css();
	},
};

/* jscs:disable disallowFunctionDeclarations */

// called from main bootstrap.js for each browser window
function loadIntoWindow(window) { // jshint ignore:line
	if (!window || !window.document)
		return;

	// create & run
	try {
		window.Foxtrick = new FoxtrickFennec(window);
		window.Foxtrick.init();
	}
	catch (e) {
		Cu.reportError('Foxtrick error: ' + e);
	}
}

function unloadFromWindow(window) { // jshint ignore:line
	if (!window || !window.document)
		return;

	// stop and delete
	window.Foxtrick.cleanup();
	delete window.Foxtrick;
}
