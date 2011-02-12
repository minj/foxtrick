/**
* series-flags.js
* Show series flags beside manager links and/or team links
* adapted from old guestbookalltidflags.js, removed since r4686
* @author convinced, taised, ryanli
*/

////////////////////////////////////////////////// //////////////////////////////
//---------------------------------------------------------------------------

var FoxtrickSeriesFlags = {
	MODULE_NAME : "SeriesFlags",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["guestbook", "teamPage", "league", "youthleague", "federation", "oldcoaches", "oldplayers"],
	OPTIONS : ["Guestbook", "Supporters", "Visitors", "Oldies"],

	run : function(page, doc) {
		var buildFlag = function(url, userId, teamId) {
			const userLinkBase = "http://www.fantamondi.it/HTMS/userstat.php?userid=";
			const teamLinkBase = "http://www.fantamondi.it/HTMS/userstat.php?teamid=";
			var link = doc.createElement("a");
			link.href = url + "&redir_to_league=true";
			var img = doc.createElement("img");
			img.src = userId ? (userLinkBase + userId) : (teamLinkBase + teamId);
			link.appendChild(img);
			return link;
		};
		var modifyUserLinks = function(links) {
			Foxtrick.map(links, function(n) {
				n.parentNode.insertBefore(buildFlag(n.href, FoxtrickHelper.getUserIdFromUrl(n.href), null), n.nextSibling);
			});
		};
		var modifyTeamLinks = function(links) {
			Foxtrick.map(links, function(n) {
				n.parentNode.insertBefore(buildFlag(n.href, null, FoxtrickHelper.getTeamIdFromUrl(n.href)), n.nextSibling);
			});
		};

		if (page == "guestbook"
			&& Foxtrick.isModuleFeatureEnabled(this, "Guestbook")) {
			// add to guest managers
			var mainWrapper = doc.getElementById("mainWrapper");
			var links = mainWrapper.getElementsByTagName("a");
			var userLinks = Foxtrick.filter(links, function(n) { return (n.href.search(/userId=/i) >= 0); });
			modifyUserLinks(userLinks);
		}
		else if ((page == "teamPage" || page == "league"
			|| page == "youthleague" || page == "federation")
			&& Foxtrick.isModuleFeatureEnabled(this, "Visitors")) {
			// add to visitors
			var sideBar = doc.getElementById("sidebar");
			var links = sideBar.getElementsByTagName("a");
			var userLinks = Foxtrick.filter(links, function(n) { return (n.href.search(/userId=/i) >= 0); });
			modifyUserLinks(userLinks);
		}
		else if ((page == "oldcoaches" || page == "oldplayers")
			&& Foxtrick.isModuleFeatureEnabled(this, "Oldies")) {
			// add to current owner
			var mainBody = doc.getElementById("mainBody");
			var links = mainBody.getElementsByTagName("a");
			var teamLinks = Foxtrick.filter(links, function(n) { return (FoxtrickHelper.isTeamDetailUrl(n.href)); });
			modifyTeamLinks(teamLinks);
		}
	}
};
