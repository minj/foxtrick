/**
 * my-monitor.js
 * Monitors matches of friends and foes
 * @author ryanli
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickMyMonitor = {
	MODULE_NAME : "MyMonitor",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ["myhattrick", "dashboard", "teamPage", "youthoverview", "national"],
	CSS : Foxtrick.ResourcePath + "resources/css/my-monitor.css",

	run : function(page, doc) {
		if (page == "myhattrick" || page == "dashboard")
			FoxtrickMyMonitor.display(page, doc);
		else if (page == "teamPage" || page == "youthoverview" || page == "national")
			FoxtrickMyMonitor.showSidebar(page, doc);
	},

	display : function(page, doc) {
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
			const noteId = "ft-monitor-add-note";
			while (note = doc.getElementById(noteId))
				note.parentNode.removeChild(note);
			var note = Foxtrick.util.note.create(
				doc,
				Foxtrickl10n.getString("MyMonitor.addHelp"),
				null,
				true
			);
			note.id = noteId;
			parent.insertBefore(note, container);
		}, false);
		addRemove.appendChild(addLink);

		// slash separating add and remove
		addRemove.appendChild(doc.createTextNode(" / "));

		// link for removing a team
		var removeLink = doc.createElement("a");
		removeLink.id = "ft-monitor-remove";
		removeLink.className = "ft-link";
		removeLink.textContent = Foxtrickl10n.getString("button.remove");
		removeLink.addEventListener("click", function() {
			const noteId = "ft-monitor-remove-note"
			while (note = doc.getElementById(noteId))
				note.parentNode.removeChild(note);

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
				option.textContent = Foxtrickl10n.getString("MyMonitor.removeTeamFormat")
					.replace(/%n/, team.name)
					.replace(/%t/, Foxtrickl10n.getString("MyMonitor.type." + team.type))
					.replace(/%i/, team.id);
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
				FoxtrickMyMonitor.setSavedTeams(teams);
				var frame = doc.getElementsByClassName("ft-monitor-frame")[index];
				frame.parentNode.removeChild(frame);
			}, false);
			removeBox.appendChild(removeButton);
			// add note
			var note = Foxtrick.util.note.create(doc, removeBox, null, true);
			note.id = noteId;
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
		var teams = FoxtrickMyMonitor.getSavedTeams();
		const dateNow = Foxtrick.util.time.getHtDate(doc);
		var addTeam = function(team) {
			var buildLink = function(team, link) {
				link.textContent = team.name;
				if (team.type == "nt")
					link.href = "/Club/NationalTeam/NationalTeam.aspx?teamId" + team.id;
				else if (team.type == "youth")
					link.href = "/Club/Youth/Default.aspx?YouthTeamID=" + team.id;
				else // default as senior
					link.href = "/Club/?TeamID=" + team.id;
			};
			// frame for each team
			var frame = doc.createElement("div");
			frame.className = "ft-monitor-frame";
			container.insertBefore(frame, separator);

			// team header
			var header = doc.createElement("h2");
			frame.appendChild(header);
			// link containing team name
			var nameLink = doc.createElement("a");
			buildLink(team, nameLink);
			header.appendChild(nameLink);

			// matches container
			var matchesContainer = doc.createElement("div");
			Foxtrick.util.matchView.startLoad(matchesContainer);
			frame.appendChild(matchesContainer);

			var args = [
				["file", "matches"],
				["teamID", team.id]
			];
			if (team.type == "youth")
				args.push(["isYouth", "true"]);

			Foxtrick.ApiProxy.retrieve(doc, args, function(xml) {
				Foxtrick.util.matchView.fillMatches(matchesContainer, xml);
			});
		};
		Foxtrick.map(teams, addTeam);
	},

	showSidebar : function(page, doc) {
		if (page == "teamPage")
			var type = "senior";
		else if (page == "youthoverview")
			var type = "youth";
		else if (page == "national")
			var type = "nt";

		var teams = FoxtrickMyMonitor.getSavedTeams();
		var teamId = Foxtrick.Pages.All.getId(doc);
		var existing = Foxtrick.filter(teams, function(n) {
			return n.id == teamId && n.type == type;
		});
		var container = doc.createElement("div");
		container.id = "ft-monitor-sidebar-box-container";
		// link to add team
		var addLink = doc.createElement("a");
		addLink.className = "ft-link";
		addLink.textContent = Foxtrickl10n.getString("MyMonitor.add");
		addLink.addEventListener("click", function() {
			teams.push({ id : teamId, type : type, name : "#" + teamId });
			FoxtrickMyMonitor.setSavedTeams(teams);
			Foxtrick.addClass(addLink, "hidden");
			Foxtrick.removeClass(removeLink, "hidden");
		}, false);
		container.appendChild(addLink);
		// link to remove team
		var removeLink = doc.createElement("a");
		removeLink.className = "ft-link";
		removeLink.textContent = Foxtrickl10n.getString("MyMonitor.remove");
		removeLink.addEventListener("click", function() {
			teams = Foxtrick.filter(teams, function(n) {
				return n.id != teamId || n.type != type;
			})
			FoxtrickMyMonitor.setSavedTeams(teams);
			Foxtrick.removeClass(addLink, "hidden");
			Foxtrick.addClass(removeLink, "hidden");
		}, false);
		container.appendChild(removeLink);

		if (existing.length > 0)
			Foxtrick.addClass(addLink, "hidden");
		else
			Foxtrick.addClass(removeLink, "hidden");

		var sidebar = Foxtrick.addBoxToSidebar(
			doc,
			Foxtrickl10n.getString("MyMonitor.header"),
			container,
			"ft-monitor-sidebar-box",
			"first"
		);
	},

	getSavedTeams : function() {
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
			teams = [
				{ id : ntId, name : ntName, type : "nt" },
				{ id : u20Id, name : u20Name, type : "nt" }
			];
		}
		return teams;
	},

	setSavedTeams : function(teams) {
		FoxtrickPrefs.setString("MyMonitor.teams", JSON.stringify(teams));
	}
};
