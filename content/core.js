/**
* core.js
* Some core functions for FoxTrick
* @author ryanli
*/

var FoxtrickCore = {
	MODULE_NAME : "Core",
	CORE_MODULE : true,
	PAGES : ["all"],
	CSS : Foxtrick.ResourcePath + "resources/css/foxtrick.css",
	CSS_SIMPLE : [
		Foxtrick.ResourcePath + "resources/css/foxtrick.css",
		Foxtrick.ResourcePath + "resources/css/foxtrick-simple.css"
	],
	CSS_RTL : Foxtrick.ResourcePath + "resources/css/rtl.css",

	// called after browser loaded (Gecko-only), with browser chrome
	// as the argument
	// initializes items in menu bar and status bar
	onLoad : function(document) {
		// menu item
		var menuItem = document.getElementById("foxtrick-menu-preferences");
		menuItem.label = Foxtrickl10n.getString("foxtrick.prefs.preferences");
		// status bar icon
		this.statusbarIcon = document.getElementById("foxtrick-status-bar-img");
		// status bar menu - preferences
		var statusbarPreferences = document.getElementById("foxtrick-status-bar-preferences");
		statusbarPreferences.label = Foxtrickl10n.getString("preferences");
		// status bar menu - disable
		var statusbarDisable = document.getElementById("foxtrick-status-bar-deactivate");
		statusbarDisable.label = Foxtrickl10n.getString("foxtrick.prefs.disableTemporaryLabel");
		this.statusbarDisable = statusbarDisable;
		// update status
		this.updateStatus();
		this.updateDisableStatus();
	},

	onTabChange : function(doc) {
		this.updateStatus();
	},

	init : function() {
		this.updateDisableStatus();
	},

	run : function(page, doc) {
		this.showChangeLog(doc);
		this.showVersion(doc);
		this.updateStatus()
	},

	updateStatus : function() {
		// update status bar icon image and tooltip (Gecko-only)
		if (Foxtrick.BuildFor === "Gecko") {
			var icon = this.statusbarIcon;
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
		}
	},

	updateDisableStatus : function() {
		this.statusbarDisable.checked = FoxtrickPrefs.getBool("disableTemporary");
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
		var server = bottom.getElementsByClassName("currentServer")[0];
		server.textContent += " / FoxTrick " + Foxtrick.version();
	}
};
