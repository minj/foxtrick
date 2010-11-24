/**
 * tickercoloring.js
 * Script which add colors to the ticker
 * @author htbaumanns, ryanli
 */

var FoxtrickTickerColoring = {
    MODULE_NAME : "TickerColoring",
    MODULE_CATEGORY : Foxtrick.moduleCategories.ALERT,
	PAGES : new Array('all'),
	NEW_AFTER_VERSION : "0.5.2.1",
	LATEST_CHANGE : "Use CSS file for coloring.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	CSS : Foxtrick.ResourcePath + "resources/css/ticker-coloring.css",

	addClass : function(doc) {
		var ticker = doc.getElementById("ticker");
		var links = ticker.getElementsByTagName("a");
		for (var i = 0; i < links.length; ++i) {
			var link = links[i];
			if (!Foxtrick.hasClass(link, "ft-ticker-link")) {
				Foxtrick.addClass(link, "ft-ticker-link");
				var href = link.href;
				if (href === "/MyHattrick/")
					Foxtrick.addClass(link, "ft-ticker-welcome");
				else if (href.indexOf("/Club/Manager/?teamId=") !== -1)
					Foxtrick.addClass(link, "ft-ticker-supporter");
				else if (href.indexOf("/Forum/") !== -1)
					Foxtrick.addClass(link, "ft-ticker-forum");
				else if (href.indexOf("/Players/") !== -1)
					Foxtrick.addClass(link, "ft-ticker-transfer");
				else if (href.indexOf("/Challenges/") !== -1)
					Foxtrick.addClass(link, "ft-ticker-challenge");
				else if (href.indexOf("/Club/Manager/Guestbook.aspx?teamid=") !== -1)
					Foxtrick.addClass(link, "ft-ticker-guestbook");
				else if (href.indexOf("/Inbox/") !== -1)
					Foxtrick.addClass(link, "ft-ticker-mail");
				else if (href.indexOf("/Myhattrick/?actionType") !== -1)
					Foxtrick.addClass(link, "ft-ticker-myht");
			}
		}
	},

	run : function(page, doc) {
		this.addClass(doc);
	},

	change : function(page, doc) {
		this.addClass(doc);
	}
};
