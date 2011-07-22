/**
* core.js
* Some core functions for FoxTrick
* @author ryanli
*/

var FoxtrickCore = {
	MODULE_NAME : "Core",
	CORE_MODULE : true,
	PAGES : ["all"],
	CSS : [
		Foxtrick.ResourcePath + "resources/css/foxtrick.css",
		Foxtrick.ResourcePath + "resources/css/headercopyicons.css",
		Foxtrick.ResourcePath + "resources/css/flags.css",
	],
	CSS_SIMPLE : [
		Foxtrick.ResourcePath + "resources/css/foxtrick.css",
		Foxtrick.ResourcePath + "resources/css/foxtrick-simple.css",
		Foxtrick.ResourcePath + "resources/css/headercopyicons_simple.css",
		Foxtrick.ResourcePath + "resources/css/flags.css",
	],
	CSS_RTL : [
		Foxtrick.ResourcePath + "resources/css/foxtrick.css",
		Foxtrick.ResourcePath + "resources/css/rtl.css",
		Foxtrick.ResourcePath + "resources/css/headercopyicons_rtl.css",
		Foxtrick.ResourcePath + "resources/css/flags.css",
	],
	CSS_SIMPLE_RTL : [
		Foxtrick.ResourcePath + "resources/css/foxtrick.css",
		Foxtrick.ResourcePath + "resources/css/foxtrick-simple.css",
		Foxtrick.ResourcePath + "resources/css/rtl.css",
		Foxtrick.ResourcePath + "resources/css/headercopyicons_simple_rtl.css",
		Foxtrick.ResourcePath + "resources/css/flags.css",
	],

	// called after browser loaded (Gecko-only), with browser chrome
	// as the argument
	// initializes items in menu bar and status bar
	onLoad : function(document) {
		// toolbar menu - preferences
		var toolbarPreferences = document.getElementById("foxtrick-toolbar-preferences");
		toolbarPreferences.label = Foxtrickl10n.getString("preferences");
		// toolbar menu - disable
		var toolbarDisable = document.getElementById("foxtrick-toolbar-deactivate");
		toolbarDisable.label = Foxtrickl10n.getString("foxtrick.prefs.disableTemporaryLabel");
		// update status
		this.updateStatus();
	},

	onTabChange : function(doc) {
		this.updateStatus();
	},

	init : function() {
		this.updateStatus();
	},

	run : function(doc) {
		this.showChangeLog(doc);
		this.showVersion(doc);
		this.updateStatus();
		this.updateLastHost(doc);
	},

	setPageIcon : function(tab) { 
		// update page icon image and tooltip (chrome-only)
		var icon = ''; var statusText='';
		if (FoxtrickPrefs.getBool("disableTemporary")) {
			icon = "../skin/disabled-24.png";
			statusText = Foxtrickl10n.getString("status.disabled");
		}
		else {
			icon = "../skin/icon-24.png";
			statusText = Foxtrickl10n.getString("status.active");
		}
		var tooltipText = Foxtrickl10n.getString("foxtrick") + " " + Foxtrick.version() + " (" + statusText + ")";
		chrome.pageAction.setIcon({tabId : tab.id, path : icon});
		chrome.pageAction.setTitle({tabId : tab.id, title: tooltipText})
	},

	updateStatus : function() {
		// update status bar icon image and tooltip (Gecko-only)
		if (Foxtrick.BuildFor !== "Gecko")
			return;

		var disableItem = document.getElementById("foxtrick-toolbar-deactivate");
		if (disableItem)
			disableItem.setAttribute("checked", FoxtrickPrefs.getBool("disableTemporary"));

		var button = document.getElementById("foxtrick-toolbar-button");
		if (!button || !content)
			return;
		var doc = content.document; // get the document of current tab

		var statusText;

		if (FoxtrickPrefs.getBool("disableTemporary")) {
			// FoxTrick is disabled temporarily
			button.setAttribute("status", "disabled");
			statusText = Foxtrickl10n.getString("status.disabled");
		}
		else if (Foxtrick.isHt(doc)
			&& !(FoxtrickPrefs.getBool("disableOnStage") && Foxtrick.isStage(doc))) {
			// FoxTrick is enabled, and active on current page
			button.setAttribute("status", "active");
			statusText = Foxtrickl10n.getString("status.active");
		}
		else {
			// FoxTrick is enabled, but not active on current page
			button.setAttribute("status", "enabled");
			var hostname = doc.location.hostname;
			statusText = Foxtrickl10n.getString("status.enabled").replace("%s", hostname);
		}
		var tooltipText = Foxtrickl10n.getString("foxtrick") + " " + Foxtrick.version() + " (" + statusText + ")";
		button.setAttribute("tooltiptext", tooltipText);
	},

	updateLastHost : function(doc) {
		// update Foxtrick.lastHost, which is used when opening links
		// from browser chrome
		Foxtrick.setLastHost(doc.location.protocol + "//"
			+ doc.location.hostname);
		Foxtrick.setLastPage(doc.location.href);
		
	},

	showChangeLog : function(doc) {
		if (FoxtrickPrefs.getString("oldVersion") !== Foxtrick.version()) {
			if (FoxtrickPrefs.getBool("showReleaseNotes"))
				Foxtrick.newTab(Foxtrick.ResourcePath + "preferences.xhtml#tab=changes");
			FoxtrickPrefs.setString("oldVersion", Foxtrick.version());
		}
	},

	showVersion : function(doc) {
		// show version number on the bottom of the page
		var bottom = doc.getElementById("bottom");
		if (bottom) { // sometimes bottom is not loaded yet. just skip it in those cases
			var server = bottom.getElementsByClassName("currentServer")[0];
			server.textContent += " / FoxTrick " + Foxtrick.version();
		}
		else Foxtrick.log('bottom not loaded yet');
	},
	
	showPreferences : function(tab) {
		if (!tab) tab = 'main';
		Foxtrick.newTab(Foxtrick.ResourcePath + "preferences.xhtml#tab=" + tab);
	},
};
