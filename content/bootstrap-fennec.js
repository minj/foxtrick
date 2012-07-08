// wrapper for firefox bootstrap

const Cu = Components.utils;
Cu.import("resource://gre/modules/Services.jsm");


var FoxtrickFennec = function(window) {
	this.owner = window;
};
FoxtrickFennec.prototype = {
	scripts: [
		//<!-- essential stuffs -->
		"chrome://foxtrick/content/env.js",
		"chrome://foxtrick/content/prefs.js",
		"chrome://foxtrick/content/l10n.js",
		"chrome://foxtrick/content/xml-load.js",
		"chrome://foxtrick/content/pages.js",
		//<!-- utilities -->
		"chrome://foxtrick/content/util/api.js",
		"chrome://foxtrick/content/util/array.js",
		"chrome://foxtrick/content/util/copy-button.js",
		"chrome://foxtrick/content/util/currency.js",
		"chrome://foxtrick/content/util/dom.js",
		"chrome://foxtrick/content/util/ht-ml.js",
		"chrome://foxtrick/content/util/id.js",
		"chrome://foxtrick/content/util/inject.js",
		"chrome://foxtrick/content/util/layout.js",
		"chrome://foxtrick/content/util/links-box.js",
		"chrome://foxtrick/content/util/local-store.js",
		"chrome://foxtrick/content/util/log.js",
		"chrome://foxtrick/content/util/match-view.js",
		"chrome://foxtrick/content/util/misc.js",
		"chrome://foxtrick/content/util/module.js",
		"chrome://foxtrick/content/util/note.js",
		"chrome://foxtrick/content/util/notify.js",
		"chrome://foxtrick/content/util/sanitize.js",
		"chrome://foxtrick/content/util/session-store.js",
		"chrome://foxtrick/content/util/string.js",
		"chrome://foxtrick/content/util/tabs.js",
		"chrome://foxtrick/content/util/time.js",
		
		//<!-- external libraries -->
		//"chrome://foxtrick/content/lib/jquery.js",
		"chrome://foxtrick/content/lib/oauth.js",
		"chrome://foxtrick/content/lib/sha1.js",
		"chrome://foxtrick/content/lib/jester.js",
		"chrome://foxtrick/content/lib/js-yaml.js",
		
		//<!-- categorized modules with init functions -->
		"chrome://foxtrick/content/forum/staff-marker.js",
		"chrome://foxtrick/content/presentation/header-fix.js",
		"chrome://foxtrick/content/presentation/skill-coloring.js",
		"chrome://foxtrick/content/presentation/skin-plugin.js",
		"chrome://foxtrick/content/links/links.js",
		
		//<!-- browser specific -->
		"chrome://foxtrick/content/observer.js",
		"chrome://foxtrick/content/ui.js",
		"chrome://foxtrick/content/entry.js",
		"chrome://foxtrick/content/scripts-fennec.js",
		"chrome://foxtrick/content/background.js"
	],
	
	loadScript: function() {
		// loading Foxtrick into window.Foxtrick
		for (var i=0; i<this.scripts.length; ++i)
			Services.scriptloader.loadSubScript(this.scripts[i], this.owner, "UTF-8");
	},
	
	init : function (){
		// load foxtrick backgound files and starts background script
		// content script injection is called and starts automatically in loader-gecko.js
		this.loadScript();
		// add ui
		this.addObserver();
		// fennec content script injection at 'runtime' when UI is ready
		this.loader.fennec_background.init();
		// run background
		this.loader.chrome.browserLoad();
	},
	
	cleanup : function (){
		// remove ui
		this.removeObserver();
		// remove content scripts and listeners
		this.loader.fennec_background.unload(); 
		// remove styles
		this.unload_module_css();
	}
};


// called from main bootstrap.js for each browser window
function loadIntoWindow(window) {
	if (!window || !window.document ) return;

	//create & run
	try {
		window.Foxtrick = new FoxtrickFennec(window);
		window.Foxtrick.init();
	} catch(e) {
		Components.utils.reportError("FoxTrick error: "+e);
	}
}

function unloadFromWindow(window) {
	if (!window || !window.document) return;

	// stop and delete
	window.Foxtrick.cleanup();
	delete window.Foxtrick;
	// we do have window.FoxtrickPrefs and window.Foxtrickl10n out there maybe
}
