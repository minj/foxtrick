/**
 * my-monitor.js
 * Monitors matches of friends and foes
 * @author ryanli
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickMyMonitor = {
	MODULE_NAME : "MyMonitor",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ["myhattrick", "dashboard"],
	CSS : Foxtrick.ResourcePath + "resources/css/my-monitor.css",

	run : function(page, doc) {
		// get saved teams from preferences
		var getSavedTeams = function() {
			var savedTeams = FoxtrickPrefs.getString("MyMonitor.teams");
			try {
				var teams = JSON.parse(savedTeams);
			}
			catch (e) {
				Foxtrick.dump("Cannot parse saved teams: " + savedTeams + ".\n");
			}
			if (!teams) {
				// return national teams if first run
				FoxtrickHelper.getOwnTeamInfo(doc, page);
				var leagueId = FoxtrickHelper.getOwnCountryId();
				const ntNode = Foxtrick.xml_single_evaluate(Foxtrick.XMLData.worldDetailsXml,
					"//League[LeagueID='" + leagueId + "']");
				const ntName = ntNode.getElementsByTagName("LeagueName")[0].textContent;
				const ntId = ntNode.getElementsByTagName("NationalTeamId")[0].textContent;
				const u20Name = "U-20 " + ntName;
				const u20Id = ntNode.getElementsByTagName("U20TeamId")[0].textContent;
				teams = [{ id : ntId, name : ntName }, { id : u20Id, name : u20Name }];
			}
			return teams;
		};
		var setSavedTeams = function(teams) {
			FoxtrickPrefs.setString("MyMonitor.teams", JSON.stringify(teams));
		};

		if (page == "myhattrick")
			var insertBefore = doc.getElementById("ctl00_ctl00_CPContent_CPMain_pnlMain");
		else if (page == "dashboard")
			var insertBefore = doc.getElementById("ctl00_ctl00_CPContent_CPMain_lnkArchive");
		var parent = insertBefore.parentNode;
		
		// header - "My Monitor"
		var header = doc.createElement("h1");
		header.id = "ft-monitor-header";
		header.textContent = Foxtrickl10n.getString("MyMonitor.header");
		parent.insertBefore(header, insertBefore);

		// line containing add/remove links
		var addRemove = doc.createElement("div");
		addRemove.id = "ft-monitor-add-remove";
		parent.insertBefore(addRemove, insertBefore);

		// link for adding a team
		var addLink = doc.createElement("a");
		addLink.id = "ft-monitor-add";
		addLink.className = "ft-link";
		addLink.textContent = Foxtrickl10n.getString("button.add");
		addLink.addEventListener("click", function() {
			while (note = doc.getElementById("ft-monitor-add-note")) {
				// remove old notes
				note.parentNode.removeChild(note);
			}
			// box for adding a team
			var addBox = doc.createElement("div");
			addBox.id = "ft-monitor-add-box";
			// label prompting for team ID
			var addLabel = doc.createElement("label");
			addLabel.id = "ft-monitor-add-label";
			addLabel.htmlFor = "ft-monitor-add-input";
			addLabel.textContent = Foxtrickl10n.getString("MyMonitor.inputTeamId");
			addBox.appendChild(addLabel);
			addBox.appendChild(doc.createTextNode(" "));
			// input for team ID
			var addInput = doc.createElement("input");
			addInput.id = "ft-monitor-add-input";
			addBox.appendChild(addInput);
			// button for submitting team id add
			var addButton = doc.createElement("input");
			addButton.id = "ft-monitor-add-button";
			addButton.type = "button";
			addButton.value = Foxtrickl10n.getString("button.add");
			addButton.addEventListener("click", function(ev) {
				var id = addInput.value;
				// name will be loaded after XML loads
				var team = { id : id, name : "#" + id };
				teams.push(team);
				setSavedTeams(teams);
				addTeam(team);
			}, false);
			addBox.appendChild(addButton);
			// add note
			var note = Foxtrick.util.note.create(doc, addBox, null, true);
			note.id = "ft-monitor-add-note";
			parent.insertBefore(note, container);
		}, false);
		addRemove.appendChild(addLink);

		// slash separating add and remove links
		addRemove.appendChild(doc.createTextNode(" / "));

		// link for removing a team
		var removeLink = doc.createElement("a");
		removeLink.id = "ft-monitor-remove";
		removeLink.className = "ft-link";
		removeLink.textContent = Foxtrickl10n.getString("button.remove");
		removeLink.addEventListener("click", function() {
			// add note when clicking the link
			while (note = doc.getElementById("ft-monitor-remove-note")) {
				// remove old notes
				note.parentNode.removeChild(note);
			}
			var removeBox = doc.createElement("div");
			removeBox.id = "ft-monitor-remove-box";
			// label prompting to select a team for removal
			var removeLabel = doc.createElement("label");
			removeLabel.id = "ft-monitor-remove-label";
			removeLabel.htmlFor = "ft-monitor-remove-select";
			removeLabel.textContent = Foxtrickl10n.getString("MyMonitor.removeTeam");
			removeBox.appendChild(removeLabel);
			removeBox.appendChild(doc.createTextNode(" "));
			// select box containing teams
			var removeSelect = doc.createElement("select");
			removeSelect.id = "ft-monitor-remove-select";
			removeBox.appendChild(removeSelect);
			// add options to select box
			Foxtrick.map(teams, function(team) {
				var option = doc.createElement("option");
				option.textContent = "%n (%i)".replace(/%n/, team.name).replace(/%i/, team.id);
				removeSelect.appendChild(option);
			});
			// button committing removal
			var removeButton = doc.createElement("input");
			removeButton.id = "ft-monitor-remove-button";
			removeButton.type = "button";
			removeButton.value = Foxtrickl10n.getString("button.remove");
			removeButton.addEventListener("click", function() {
				var index = removeSelect.selectedIndex;
				removeSelect.removeChild(removeSelect.options[index]);
				teams.splice(index, 1); // remove the selected from teams
				setSavedTeams(teams);
				var frame = doc.getElementsByClassName("ft-monitor-frame")[index];
				frame.parentNode.removeChild(frame);
			}, false);
			removeBox.appendChild(removeButton);
			// add note
			var note = Foxtrick.util.note.create(doc, removeBox, null, true);
			note.id = "ft-monitor-remove-note";
			parent.insertBefore(note, container);
		}, false);
		addRemove.appendChild(removeLink);

		// container for the teams
		var container = doc.createElement("div");
		container.id = "ft-monitor-container";
		parent.insertBefore(container, insertBefore);

		// separator at the bottom
		var separator = doc.createElement("div");
		separator.className = "separator";
		container.appendChild(separator);

		// add the teams
		var teams = getSavedTeams();
		const dateNow = Foxtrick.util.time.getHtDate(doc);
		var addTeam = function(team) {
			// frame for each team
			var frame = doc.createElement("div");
			frame.className = "ft-monitor-frame";
			container.insertBefore(frame, separator);

			// team header
			var header = doc.createElement("h2");
			frame.appendChild(header);
			// span containing team name
			var nameSpan = doc.createElement("span");
			nameSpan.textContent = team.name;
			header.appendChild(nameSpan);

			// matches table
			var matches = doc.createElement("table");
			frame.appendChild(matches);

			var args = [
				["file", "matches"],
				["teamID", team.id]
			];
			Foxtrick.ApiProxy.retrieve(doc, args, function(xml) {
				if (xml == null) {
					frame.removeChild(matches);
					frame.appendChild(doc.createTextNode(Foxtrickl10n.getString("api.failure")));
					return;
				}
				team.id = xml.getElementsByTagName("TeamID")[0].textContent
				team.name = xml.getElementsByTagName("TeamName")[0].textContent;
				nameSpan.textContent = team.name;
				
				setSavedTeams(teams);
				Foxtrick.map(xml.getElementsByTagName("Match"), function(match) {
					const dateText = match.getElementsByTagName("MatchDate")[0].textContent;
					const date = Foxtrick.util.time.getDateFromText(dateText, "yyyymmdd");
					const dateDiff = Math.abs(date.getTime() - dateNow.getTime());
					if (dateDiff > 7 * 24 * 60 * 60 * 1000)
						return; // only if within a week

					var matchId = match.getElementsByTagName("MatchID")[0].textContent;
					var homeTeam = match.getElementsByTagName("HomeTeamName")[0].textContent;
					var awayTeam = match.getElementsByTagName("AwayTeamName")[0].textContent;
					var homeId = match.getElementsByTagName("HomeTeamID")[0].textContent;
					var awayId = match.getElementsByTagName("AwayTeamID")[0].textContent;
					var side = (team.id == homeId) ? "home" : "away";
					var status = match.getElementsByTagName("Status")[0].textContent;
					// FIXME - we steal the function from FoxtrickNtPeek now,
					// should move the function outside in the future
					if (status == "FINISHED") {
						var homeGoals = match.getElementsByTagName("HomeGoals")[0].textContent;
						var awayGoals = match.getElementsByTagName("AwayGoals")[0].textContent;
						var matchRow = FoxtrickNtPeek.getMatchRow(doc,
							matchId, side, homeTeam, awayTeam, homeGoals,
							awayGoals);
					}
					else if (status == "UPCOMING" || status == "ONGOING") {
						var matchRow = FoxtrickNtPeek.getMatchRow(doc,
							matchId, side, homeTeam, awayTeam);
					}
					matches.appendChild(matchRow);
				});
			});
		};
		Foxtrick.map(teams, addTeam);
	}
};
