/**
* series-flags.js
* Show series flags beside manager links and/or team links
* @author taised, ryanli
*/

Foxtrick.util.module.register({
	MODULE_NAME : "SeriesFlags",
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ["guestbook", "teamPage", "series", "youthSeries", "federation"],
	OPTIONS : ["Guestbook", "Supporters", "Visitors", "CountryOnly"],
	NICE: +1,  // some conflict with another module. setting NICE +1 solved it

	run : function(doc) {
		var buildFlag = function(arg, callback) {
			var mapping = Foxtrick.sessionGet("seriesFlags");
			if (mapping == undefined)
				mapping = { "userID" : {}, "teamID" : {} };

			// data is an Object with attributes leagueId, seriesName,
			// and seriesId
			var buildFromData = function(data) {
				var flag = doc.createElement("span");
				if (data["leagueId"]!=0) {
					flag.className = "ft-series-flag";
					var countryId = Foxtrick.XMLData.getCountryIdByLeagueId(data["leagueId"]);
					var country = Foxtrick.util.id.createFlagFromCountryId(doc, countryId);
					flag.appendChild(country);
					if (!FoxtrickPrefs.isModuleOptionEnabled("SeriesFlags", "CountryOnly") && data["seriesId"]!==0) {
						var series = doc.createElement("a");
						series.className = "inner";
						series.textContent = data["seriesName"];
						series.href = "/World/Series/Default.aspx?LeagueLevelUnitID=" + data["seriesId"];
						flag.appendChild(series);
					}
				}
				else flag.className = "ft-ownerless";
				return flag;
			};
			// fetch data from stored mapping if available, otherwise
			// we retrieve XML
			if (mapping[arg[0]][arg[1]] != undefined) {
				var mapObj = mapping[arg[0]][arg[1]];
				var data = {
					"leagueId" : mapObj["leagueId"],
					"seriesName" : mapObj["seriesName"],
					"seriesId" : mapObj["seriesId"]
				};
				var flag = buildFromData(data);
				callback(flag);
			}
			else {
				var args = [["file", "teamdetails"]];
				args.push(arg);
				Foxtrick.util.api.retrieve(doc, args,{cache_lifetime:'session', caller_name:this.MODULE_NAME },
				function(xml) {
					if (!xml) return;
					var data = { // in case LeagueLevelUnit is missing (eg during quali matches)
						"leagueId" : 0,
						"seriesName" : '',
						"seriesId" : 0
					};
					if (xml.getElementsByTagName("LeagueID")[0]) // has a team
						data.leagueId = xml.getElementsByTagName("LeagueID")[0].textContent;
					// there are can be several LeagueLevelUnitID. if LeagueLevelUnit is available it's the first
					if (xml.getElementsByTagName("LeagueLevelUnit")[0] && xml.getElementsByTagName("LeagueLevelUnit")[0].getElementsByTagName("LeagueLevelUnitID")[0]) {
						data.seriesName = xml.getElementsByTagName("LeagueLevelUnitName")[0].textContent,
						data.seriesId = xml.getElementsByTagName("LeagueLevelUnitID")[0].textContent
					}
					// get newest mapping and store the data, because
					// it may have changed during the retrieval of XML
					var mapping = Foxtrick.sessionGet("seriesFlags");
					if (mapping == undefined)
						mapping = { "userID" : {}, "teamID" : {} };
					mapping[arg[0]][arg[1]] = data;
					Foxtrick.sessionSet("seriesFlags", mapping);
					var flag = buildFromData(data);
					callback(flag);
				});
			}
		};
		var modifyUserLinks = function(links) {
			Foxtrick.map(function(n) {
				buildFlag(
					["userID", Foxtrick.util.id.getUserIdFromUrl(n.href)],
					function(flag) {
						n.parentNode.insertBefore(flag, n.nextSibling);
						n.parentNode.insertBefore(doc.createTextNode(" "), flag);
					}
				);
			}, links);
		};
		var modifyTeamLinks = function(links) {
			Foxtrick.map(function(n) {
				buildFlag(
					["teamID", Foxtrick.util.id.getTeamIdFromUrl(n.href)],
					function(flag) {
						n.parentNode.insertBefore(flag, n.nextSibling);
						n.parentNode.insertBefore(doc.createTextNode(" "), flag);
					}
				);
			}, links);
		};
		if (FoxtrickPrefs.isModuleOptionEnabled("SeriesFlags", "Guestbook")
			&& Foxtrick.isPage("guestbook", doc)) {
			// add to guest managers
			var mainWrapper = doc.getElementById("mainWrapper");
			var links = mainWrapper.getElementsByTagName("a");
			var userLinks = Foxtrick.filter(function(n) { return (n.href.search(/userId=/i) >= 0); }, links);
			modifyUserLinks(userLinks);
		}
		//We add also flag to the guestbook entry in teamPage, but we have to skip the own user link
		if (FoxtrickPrefs.isModuleOptionEnabled("SeriesFlags", "Guestbook")
			&& Foxtrick.isPage("teamPage", doc)) {
			var mainBoxes = doc.getElementById("mainWrapper").getElementsByClassName("mainBox");
			Foxtrick.map(function(b) {
				var links = b.getElementsByTagName("a");
				var userLinks = Foxtrick.filter(function(n) { return (n.href.search(/userId=/i) >= 0); }, links);
				modifyUserLinks(userLinks);
			}, mainBoxes);
		}
		if (FoxtrickPrefs.isModuleOptionEnabled("SeriesFlags", "Supporters")
			&& Foxtrick.isPage("teamPage", doc)) {
			// add to supporters
			var sideBar = doc.getElementById("sidebar");
			var sideBarBoxes = sideBar.getElementsByClassName("sidebarBox");
			// supporters box is among the boxes without a table
			var nonVisitorsBoxes = Foxtrick.filter(function(n) { return n.getElementsByTagName("table").length == 0; }, sideBarBoxes);
			Foxtrick.map(function(b) {
				var links = b.getElementsByTagName("a");
				var userLinks = Foxtrick.filter(function(n) { return (n.href.search(/userId=/i) >= 0); }, links);
				modifyUserLinks(userLinks);
			}, nonVisitorsBoxes);
		}
		if (FoxtrickPrefs.isModuleOptionEnabled("SeriesFlags", "Visitors")
			&& Foxtrick.any(function(n) { return Foxtrick.isPage(n, doc); }, ["teamPage", "series", "youthSeries", "federation"])) {
			// add to visitors
			var sideBar = doc.getElementById("sidebar");
			var sideBarBoxes = sideBar.getElementsByClassName("sidebarBox");
			// visitors box is the box with a table
			Foxtrick.map(function(n) {
					var links = n.getElementsByTagName("a");
					var userLinks = Foxtrick.filter(function(n) { return (n.href.search(/userId=/i) >= 0); }, links);
					modifyUserLinks(userLinks);
				},
				Foxtrick.filter(function(n) { return n.getElementsByTagName("table").length > 0; },
					sideBarBoxes)
			);
		}
	}
});
