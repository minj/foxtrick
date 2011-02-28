/**
* series-flags.js
* Show series flags beside manager links and/or team links
* @author taised, ryanli
*/

////////////////////////////////////////////////// //////////////////////////////
//---------------------------------------------------------------------------

var FoxtrickSeriesFlags = {
	MODULE_NAME : "SeriesFlags",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["guestbook", "teamPage", "league", "youthleague", "federation", "oldcoaches", "oldplayers"],
	OPTIONS : ["Guestbook", "Supporters", "Visitors", "Oldies", "CountryOnly"],

	run : function(page, doc) {
		var buildFlag = function(url, userId, teamId) {
			var userLinkCountry = "";
			if (Foxtrick.isModuleFeatureEnabled(FoxtrickSeriesFlags, "CountryOnly")) {
				userLinkCountry = "countryonly=true&";
			}
			const userLinkBase = "http://www.fantamondi.it/HTMS/userstat.php?"+userLinkCountry+"userid=";
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
		if (Foxtrick.isModuleFeatureEnabled(this, "Guestbook")
			&& (page == "guestbook")) {
			// add to guest managers
			var mainWrapper = doc.getElementById("mainWrapper");
			var links = mainWrapper.getElementsByTagName("a");
			var userLinks = Foxtrick.filter(links, function(n) { return (n.href.search(/userId=/i) >= 0); });
			modifyUserLinks(userLinks);
		}
		//We add also flag to the guestbook entry in teamPage, but we have to skip the own user link
		if (Foxtrick.isModuleFeatureEnabled(this, "Guestbook")
			&& (page == "teamPage")) {
			var mainBoxes = doc.getElementById("mainWrapper").getElementsByClassName("mainBox");
			Foxtrick.map(mainBoxes, function(b) {
				var links = b.getElementsByTagName("a");
				var userLinks = Foxtrick.filter(links, function(n) { return (n.href.search(/userId=/i) >= 0); });
				modifyUserLinks(userLinks);
			});
		}
		if (Foxtrick.isModuleFeatureEnabled(this, "Supporters")
			&& (page == "teamPage")) {
			// add to supporters
			var sideBar = doc.getElementById("sidebar");
			var sideBarBoxes = sideBar.getElementsByClassName("sidebarBox");
			// supporters box is among the boxes without a table
			var nonVisitorsBoxes = Foxtrick.filter(sideBarBoxes, function(n) { return n.getElementsByTagName("table").length == 0; });
			Foxtrick.map(nonVisitorsBoxes, function(b) {
				var links = b.getElementsByTagName("a");
				var userLinks = Foxtrick.filter(links, function(n) { return (n.href.search(/userId=/i) >= 0); });
				modifyUserLinks(userLinks);
			});
		}
		if (Foxtrick.isModuleFeatureEnabled(this, "Visitors")
			&& (page == "teamPage" || page == "league"
				|| page == "youthleague" || page == "federation")) {
			// add to visitors
			var sideBar = doc.getElementById("sidebar");
			var sideBarBoxes = sideBar.getElementsByClassName("sidebarBox");
			// visitors box is the box with a table
			Foxtrick.map(
				Foxtrick.filter(sideBarBoxes,
					function(n) { return n.getElementsByTagName("table").length > 0; }),
				function(n) {
					var links = n.getElementsByTagName("a");
					var userLinks = Foxtrick.filter(links, function(n) { return (n.href.search(/userId=/i) >= 0); });
					modifyUserLinks(userLinks);
				}
			);
		}
		if (Foxtrick.isModuleFeatureEnabled(this, "Oldies")
			&& (page == "oldcoaches" || page == "oldplayers")) {
			// add to current owner
			var mainBody = doc.getElementById("mainBody");
			var links = mainBody.getElementsByTagName("a");
			var teamLinks = Foxtrick.filter(links, function(n) { return (FoxtrickHelper.isTeamDetailUrl(n.href)); });
			modifyTeamLinks(teamLinks);
		}
	}
};
