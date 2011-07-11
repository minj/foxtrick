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
		Foxtrick.ResourcePath + "resources/css/headercopyicons.css"
	],
	CSS_SIMPLE : [
		Foxtrick.ResourcePath + "resources/css/foxtrick.css",
		Foxtrick.ResourcePath + "resources/css/foxtrick-simple.css",
		Foxtrick.ResourcePath + "resources/css/headercopyicons_simple.css"
	],
	CSS_RTL : [
		Foxtrick.ResourcePath + "resources/css/foxtrick.css",
		Foxtrick.ResourcePath + "resources/css/rtl.css",
		Foxtrick.ResourcePath + "resources/css/headercopyicons_rtl.css"
	],
	CSS_SIMPLE_RTL : [
		Foxtrick.ResourcePath + "resources/css/foxtrick.css",
		Foxtrick.ResourcePath + "resources/css/foxtrick-simple.css",
		Foxtrick.ResourcePath + "resources/css/rtl.css",
		Foxtrick.ResourcePath + "resources/css/headercopyicons_simple_rtl.css"
	],

	// called after browser loaded (Gecko-only), with browser chrome
	// as the argument
	// initializes items in menu bar and status bar
	onLoad : function(document) {
		// menu item
		var menuItem = document.getElementById("foxtrick-menu-preferences");
		menuItem.label = Foxtrickl10n.getString("foxtrick.prefs.preferences");
		// status bar menu - preferences
		var statusbarPreferences = document.getElementById("foxtrick-status-bar-preferences");
		statusbarPreferences.label = Foxtrickl10n.getString("preferences");
		// status bar menu - disable
		var statusbarDisable = document.getElementById("foxtrick-status-bar-deactivate");
		statusbarDisable.label = Foxtrickl10n.getString("foxtrick.prefs.disableTemporaryLabel");
		// update status
		this.updateStatus();
	},

	onTabChange : function(doc) {
		this.updateStatus();
	},

	init : function() {
		this.updateStatus();
	},

	run : function(page, doc) {
		this.showChangeLog(doc);
		this.showVersion(doc);
		this.updateStatus();
		this.updateLastHost(doc);
	},

	updateStatus : function() {
		// update status bar icon image and tooltip (Gecko-only)
		if (Foxtrick.BuildFor !== "Gecko")
			return;

		var statusbarDisable = document.getElementById("foxtrick-status-bar-deactivate");
		if (statusbarDisable)
			statusbarDisable.setAttribute("checked", FoxtrickPrefs.getBool("disableTemporary"));

		var icon = document.getElementById("foxtrick-status-bar-img");
		if (!icon || !content)
			return;
		var doc = content.document; // get the document of current tab

		var statusText;

		if (FoxtrickPrefs.getBool("disableTemporary")) {
			// FoxTrick is disabled temporarily
			icon.setAttribute("status", "disabled");
			statusText = Foxtrickl10n.getString("status.disabled");
		}
		else if (Foxtrick.isHt(doc)
			&& !(FoxtrickPrefs.getBool("disableOnStage") && Foxtrick.isStage(doc))) {
			// FoxTrick is enabled, and active on current page
			icon.setAttribute("status", "active");
			statusText = Foxtrickl10n.getString("status.active");
		}
		else {
			// FoxTrick is enabled, but not active on current page
			icon.setAttribute("status", "enabled");
			var hostname = doc.location.hostname;
			statusText = Foxtrickl10n.getString("status.enabled").replace("%s", hostname);
		}
		var tooltipText = Foxtrickl10n.getString("foxtrick") + " " + Foxtrick.version() + " (" + statusText + ")";
		icon.setAttribute("tooltiptext", tooltipText);
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
	}
};
