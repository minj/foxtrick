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

	run : function(page, doc) {
		this.showChangeLog(doc);
		this.showVersion(doc);
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
