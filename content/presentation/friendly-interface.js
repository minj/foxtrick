/**
 * friendly-interface
 * More friendly interface tweaks
 * @author ryanli
 */

FoxtrickFriendlyInterface = {
	MODULE_NAME : "FriendlyInterface",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["matchLineup", "playerdetail"],

	OPTIONS : ["FullPlayerNameInLineUp", "NtLinkForNtPlayer"],

	run : function(page, doc) {
		if (page == "matchLineup"
			&& Foxtrick.isModuleFeatureEnabled(this, "FullPlayerNameInLineUp")) {
			// show full player names while hiding overflew characters
			var field = doc.getElementsByClassName("field")[0];
			var names = field.getElementsByClassName("name");
			for (var i = 0; i < names.length; ++i) {
				var name = names[i];
				name.style.overflow = "hidden";
				name.style.whiteSpace = "nowrap";
				name.style.maxWidth = "73px";
				var link = name.getElementsByTagName("a")[0];
				var setName = function(s) {
					link.textContent = s;
				};
				var original = link.textContent; // original name shown in link
				var full = link.title; // full name shown in link title
				if (original.substr(1, 2) == ". ") { // in form like "J. Doe"
					var initial = original[0]; // first character of first name
					var lastNameShown = original.substr(3);
					// ellipsis as the last two characters, remove it
					if (lastNameShown.substr(lastNameShown.length - 2) == "..") {
						var firstNameLength = original.match(RegExp("^(" + initial + "\\S*)\\s"))[1].length;
						var remaining = full.substr(firstNameLength + 1); // remove space after first name
						var lastNamePos = remaining.indexOf(lastNameShown.substr(0, lastNameShown.length - 2));
						var lastName = remaining.substr(lastNamePos);
						setName(initial + ". " + lastName);
					}
					else {
						setName(original);
					}
				}
				else { // in form like "Jesus"
					setName(full);
				}
			}
		}
		if (page == "playerdetail"
			&& Foxtrick.isModuleFeatureEnabled(this, "NtLinkForNtPlayer")) {
			// show national team names as links in national players' page
			var playerInfo = doc.getElementsByClassName("playerInfo")[0];
			// a player has highlight <=> he is a national player
			var highlight = playerInfo.getElementsByClassName("highlight")[0];
			if (highlight) {
				const text = highlight.textContent;
				const leagueId = Foxtrick.Pages.Player.getNationalityId(doc);
				const ntIdXml = Foxtrick.XMLData.htNTidsXml;
				const ntNode = ntIdXml.evaluate("/leagues/league[@id='" + leagueId + "'][1]",
					ntIdXml, null, XPathResult.ANY_TYPE, null).iterateNext();
				const u20Name = ntNode.getElementsByTagName("U20Name")[0].textContent;
				const u20Id = ntNode.getElementsByTagName("U20id")[0].textContent;
				const ntName = ntNode.getElementsByTagName("NTName")[0].textContent;
				const ntId = ntNode.getElementsByTagName("NTid")[0].textContent;
				var replace = function(team, id) {
					highlight.textContent = text.substr(0, text.indexOf(team));
					var link = doc.createElement("a");
					link.textContent = team;
					link.href = "/Club/NationalTeam/NationalTeam.aspx?teamId=" + id;
					highlight.appendChild(link);
					highlight.appendChild(doc.createTextNode(text.substr(text.indexOf(team) + team.length)));
				};
				// find U20 first because generally NT name is a substring of U20 name
				if (text.indexOf(u20Name) > -1) // u20 player
					replace(u20Name, u20Id);
				else if (text.indexOf(ntName) > -1) // nt player
					replace(ntName, ntId);
			}
		}
	}
};
