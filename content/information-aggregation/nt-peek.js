/**
 * nt-peek.js
 * peeks NT/U20 matches at MyHT
 * @author ryanli
 */

 ////////////////////////////////////////////////////////////////////////////////
var FoxtrickNtPeek = {
	MODULE_NAME : "NtPeek",
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ["country"],
	CSS : Foxtrick.ResourcePath + "resources/css/nt-peek.css",

	run : function(page, doc) {
		var buildContainer = function(team, id, isNt) {
			var buildTeamHeader = function() {
				var header = doc.createElement("h2");
				var link = doc.createElement("a");
				link.textContent = team;
				link.href = "/Club/NationalTeam/NationalTeam.aspx?teamId=" + id;
				header.appendChild(link);
				return header;
			}

			var container = doc.createElement("div");
			if (isNt)
				container.className = "ft-nt-peek-nt";
			else
				container.className = "ft-nt-peek-u20";

			var header = buildTeamHeader();
			container.appendChild(header);

			var matchesContainer = doc.createElement("div");
			Foxtrick.util.matchView.startLoad(matchesContainer);
			container.appendChild(matchesContainer);

			return container;
		}

		var leagueId = Foxtrick.Pages.Country.getId(doc);

		const ntNode = Foxtrick.xml_single_evaluate(Foxtrick.XMLData.worldDetailsXml,
			"//League[LeagueID='" + leagueId + "']");
		const ntName = ntNode.getElementsByTagName("LeagueName")[0].textContent;
		const ntId = ntNode.getElementsByTagName("NationalTeamId")[0].textContent;
		const u20Name = "U-20 " + ntName;
		const u20Id = ntNode.getElementsByTagName("U20TeamId")[0].textContent;

		var insertBefore = doc.getElementById("ctl00_ctl00_CPContent_CPMain_ucForumSneakpeek_updSneakpeek");

		var container = doc.createElement("div");
		container.className = "ft-nt-peek";
		insertBefore.parentNode.insertBefore(container, insertBefore);
		// title (only at My Hattrick page)
		if (page == "myhattrick") {
			var title = doc.createElement("h1");
			title.textContent = Foxtrickl10n.getString("ntpeek.title");
			container.appendChild(title);
		}

		// NT container
		var ntContainer = buildContainer(ntName, ntId, true);
		container.appendChild(ntContainer);
		// U20 container
		var u20Container = buildContainer(u20Name, u20Id, false);
		container.appendChild(u20Container);
		// separator
		var separator = doc.createElement("div");
		separator.className = "separator";
		container.appendChild(separator);

		const ntArgs = [
			["file", "matches"],
			["teamID", ntId]
		];
		Foxtrick.ApiProxy.retrieve(doc, ntArgs, function(xml) {
			Foxtrick.util.matchView.fillMatches(
				ntContainer.getElementsByTagName("div")[0],
				xml
			);
		});
		const u20Args = [
			["file", "matches"],
			["teamID", u20Id]
		];
		Foxtrick.ApiProxy.retrieve(doc, u20Args, function(xml) {
			Foxtrick.util.matchView.fillMatches(
				u20Container.getElementsByTagName("div")[0],
				xml
			);
		});
	}
};
