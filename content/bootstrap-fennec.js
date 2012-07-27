// wrapper for firefox bootstrap

const Cu = Components.utils;
Cu.import("resource://gre/modules/Services.jsm");


var FoxtrickFennec = function(window) {
	this.owner = window;
};
FoxtrickFennec.prototype = {
	scripts: [
		//<!-- essential stuffs -->
		"env.js",
		"prefs.js",
		"l10n.js",
		"xml-load.js",
		"pages.js",
		//<!-- utilities -->
		"util/api.js",
		"util/array.js",
		"util/cookies.js",
		"util/copy-button.js",
		"util/css.js",
		"util/currency.js",
		"util/dom.js",
		"util/ht-ml.js",
		"util/id.js",
		"util/inject.js",
		"util/layout.js",
		"util/links-box.js",
		"util/load.js",
		"util/local-store.js",
		"util/log.js",
		"util/match-view.js",
		"util/misc.js",
		"util/module.js",
		"util/note.js",
		"util/notify.js",
		"util/sanitize.js",
		"util/session-store.js",
		"util/string.js",
		"util/tabs.js",
		"util/time.js",
		
		//<!-- external libraries -->
		//"lib/jquery.js",
		"lib/oauth.js",
		"lib/sha1.js",
		"lib/jester.js",
		"lib/yaml.js",
		"lib/BlobBuilder.min.js",
		"lib/FileSaver.min.js",
		
		//<!-- categorized modules with init functions -->
		"forum/staff-marker.js",
		"presentation/header-fix.js",
		"presentation/skill-coloring.js",
		"presentation/skin-plugin.js",
		"links/links.js",
		
		//<!-- browser specific -->
		"observer.js",
		"ui.js",
		"entry.js",
		"background.js",
		"scripts-fennec.js"
	],
	
	loadScript: function() {
		// loading Foxtrick into window.Foxtrick
		for (var i=0; i<this.scripts.length; ++i)
			Services.scriptloader.loadSubScript("chrome://foxtrick/content/" + this.scripts[i], this.owner, "UTF-8");
	},
	
	init : function (){
		// load foxtrick background files and starts background script
		this.loadScript();
		// add ui
		this.addObserver();
		// run background
		this.loader.background.browserLoad();
		// add styles
		this.util.css.load_module_css();
		// fennec content script injection at 'runtime' 
		this.loader.background.contentScriptManager.load();
	},
	
	cleanup : function (){
		// remove ui
		this.removeObserver();
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
