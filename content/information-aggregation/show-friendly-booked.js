/*
 * show-friendly-booked.js
 * Show whether a team has booked friendly on series page
 * @author ryanli
 */

var FoxtrickShowFriendlyBooked = {
	MODULE_NAME : "ShowFriendlyBooked",
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ["league"],
	OPTIONS : new Array("OnDemand"),
	
	run : function(doc) {
		if (Foxtrick.isModuleFeatureEnabled(this, "OnDemand"))
			this.AddOnDemand(doc);
		else
			this.AddFriendlies(doc);
	},
	
	AddOnDemand : function(doc) {
		var gametype_span = doc.getElementById("ctl00_ctl00_CPContent_CPMain_hlAllGames");
		var span = doc.createElement('span');
		span.setAttribute('id','ShowFriendliesLinkId');
		span.className = 'float_left';
		var a = doc.createElement('a');
		a.textContent = Foxtrickl10n.getString("ShowFriendlyBooked.ShowFriendlies");
		a.href = 'javascript:void()';
		Foxtrick.addEventListenerChangeSave(a, 'click', FoxtrickShowFriendlyBooked.Show, false);
		span.appendChild(a);
		gametype_span.parentNode.parentNode.insertBefore(span,gametype_span.parentNode);
	},

	Show : function(ev) {
		var doc = ev.target.ownerDocument;
		doc.getElementById('ShowFriendliesLinkId').setAttribute('style','display:none;');
		FoxtrickShowFriendlyBooked.AddFriendlies(doc);
	},
	
	AddFriendlies : function(doc) {
		var leagueTableSpan = doc.getElementById("ctl00_ctl00_CPContent_CPMain_repLeagueTable");
		var leagueTable = leagueTableSpan.getElementsByTagName("table")[0];
		var rows = leagueTable.getElementsByTagName("tr");
		// remove header row and ownerless teams
		rows = Foxtrick.filter(rows, function(n) {
			var isHeader = function() { return n.getElementsByTagName("th").length > 0; };
			var inCup = function() { return n.getElementsByTagName("td")[3].getElementsByTagName("img").length > 0; };
			var isOwnerless = function() { return n.getElementsByClassName("shy").length > 0; };
			return !isHeader() && !inCup() && !isOwnerless();
		});
		// see whether friendly booked
		Foxtrick.map(rows, function(n) {
			var teamCell = n.getElementsByTagName("td")[2];
			var teamLink = teamCell.getElementsByTagName("a")[0].href;
			var teamId = FoxtrickHelper.getTeamIdFromUrl(teamLink);

			var destCell = n.getElementsByTagName("td")[3];
			destCell.textContent = Foxtrickl10n.getString("status.loading.abbr");
			destCell.title = Foxtrickl10n.getString("status.loading");

			var parameters = [
				["file", "teamdetails"],
				["teamID", teamId]
			];
			Foxtrick.ApiProxy.retrieve(doc, parameters,{ cache_lifetime:'default', caller_name:this.MODULE_NAME },
			function(xml) {
				if (xml == null) {
					// failed to retrieve XML
					destCell.textContent = Foxtrickl10n.getString("status.error.abbr");
					destCell.title = Foxtrickl10n.getString("api.failure");
					return;
				}
				// reset textContent and title
				destCell.textContent = "";
				destCell.removeAttribute("title");
				var friendly = xml.getElementsByTagName("FriendlyTeamID")[0];
				if (friendly.getAttribute("Available") != "True") {
					destCell.textContent = Foxtrickl10n.getString("status.unknown.abbr");
					destCell.title = Foxtrickl10n.getString("status.unknown");
				}
				else if (friendly.textContent != "0") {
					// friendly booked
					var img = doc.createElement("img");
					img.src = Foxtrick.ResourcePath + "resources/img/friendly_small.png";
					img.alt = img.title = Foxtrickl10n.getString("team.status.booked");
					destCell.appendChild(img);
				}
			});
		});
	}
};
