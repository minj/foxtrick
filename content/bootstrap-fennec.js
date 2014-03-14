'use strict';
Cu.import('resource://gre/modules/Services.jsm');

var FoxtrickFennec = function(window) {
	this.owner = window;
};
FoxtrickFennec.prototype = {
	scripts: [
		//<!-- essential stuffs -->
		'env.js',
		'prefs.js',
		'l10n.js',
		'xml-load.js',
		'pages.js',

		//<!-- external libraries -->
		'lib/oauth.js',
		'lib/sha1.js',
		'lib/jester.js',
		// 'lib/yaml.js',
		// 'lib/FileSaver.js',
		// 'lib/idbstore.js',
		'lib/psico.js',

		//<!-- utilities -->
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
		'util/misc.js',
		'util/math.js',
		'util/module.js',
		'util/note.js',
		'util/notify.js',
		'util/permissions.js',
		'util/sanitize.js',
		'util/session-store.js',
		'util/string.js',
		'util/tabs.js',
		'util/time.js',

		//<!-- categorized modules with init functions -->
		'forum/staff-marker.js',
		'presentation/skin-plugin.js',
		'links/links.js',

		//<!-- browser specific -->
		'ui.js',
		'entry.js',
		'background.js',
		'scripts-fennec.js'
	],
	loadScript: function() {
		// loading Foxtrick into window.Foxtrick
		try {
			// lib scope integration
			let libMap = {
				'saveAs': 'FileSaver.js',
				'YAML': 'yaml.js',
				'IDBStore': 'idbstore.js',
			};
			let scope = {
				self: this.owner,
				Foxtrick: this,
				exports: true,
				module: { exports: true },
				require: {}
			};
			for (let lib in libMap) {
				Services.scriptloader.loadSubScript(PATH + 'lib/' + libMap[lib], scope, 'UTF-8');
				this.owner.Foxtrick[lib] = scope.module.exports;
			}
		}
		catch (e) {
			e.message = 'Foxtrick ERROR: ' + e.message;
			Services.console.logStringMessage(e);
		}
		for (var i = 0; i < this.scripts.length; ++i) {
			try {
				Services.scriptloader.loadSubScript(PATH + this.scripts[i], this.owner, 'UTF-8');
			}
			catch (e) {
				e.message = 'Foxtrick ERROR: ' + e.message;
				Services.console.logStringMessage(e);
			}
		}
	},

	init: function() {
		// load foxtrick background files and starts background script
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
		//stop background
		this.loader.background.browserUnload();
		// remove content scripts and listeners
		this.loader.background.contentScriptManager.unload();
		// remove styles
		this.util.css.unload_module_css();
	}
};


// called from main bootstrap.js for each browser window
function loadIntoWindow(window) {
	if (!window || !window.document)
		return;

	//create & run
	try {
		window.Foxtrick = new FoxtrickFennec(window);
		window.Foxtrick.init();
	} catch (e) {
		Cu.reportError('FoxTrick error: ' + e);
	}
}

function unloadFromWindow(window) {
	if (!window || !window.document)
		return;

	// stop and delete
	window.Foxtrick.cleanup();
	delete window.Foxtrick;
}
