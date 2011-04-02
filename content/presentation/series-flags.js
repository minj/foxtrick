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
	PAGES : ["guestbook", "teamPage", "league", "youthleague", "federation"],
	OPTIONS : ["Guestbook", "Supporters", "Visitors", "CountryOnly"],

	run : function(page, doc) {
		var buildFlag = function(arg, callback) {
			var args = [["file", "teamdetails"]];
			args.push(arg);
			Foxtrick.ApiProxy.retrieve(doc, args, function(xml) {
				var flag = doc.createElement("span");
				flag.className = "ft-series-flag";
				var leagueId = xml.getElementsByTagName("LeagueID")[0].textContent;
				var countryId = Foxtrick.XMLData.getCountryIdByLeagueId(leagueId);
				var country = FoxtrickHelper.createFlagFromCountryId(doc, countryId);
				flag.appendChild(country);
				if (!Foxtrick.isModuleFeatureEnabled(FoxtrickSeriesFlags, "CountryOnly")) {
					var seriesName = xml.getElementsByTagName("LeagueLevelUnitName")[0].textContent;
					var seriesId = xml.getElementsByTagName("LeagueLevelUnitID")[0].textContent;
					var series = doc.createElement("a");
					series.className = "inner";
					series.textContent = seriesName;
					series.href = "/World/Series/Default.aspx?LeagueLevelUnitID=" + seriesId;
					flag.appendChild(series);
				}
				callback(flag);
			});
		};
		var modifyUserLinks = function(links) {
			Foxtrick.map(links, function(n) {
				buildFlag(
					["userID", FoxtrickHelper.getUserIdFromUrl(n.href)],
					function(flag) {
						n.parentNode.insertBefore(flag, n.nextSibling);
						n.parentNode.insertBefore(doc.createTextNode(" "), flag);
					}
				);
			});
		};
		var modifyTeamLinks = function(links) {
			Foxtrick.map(links, function(n) {
				buildFlag(
					["teamID", FoxtrickHelper.getTeamIdFromUrl(n.href)],
					function(flag) {
						n.parentNode.insertBefore(flag, n.nextSibling);
						n.parentNode.insertBefore(doc.createTextNode(" "), flag);
					}
				);
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
	}
};
