/**
 * my-monitor.js
 * Monitors matches of friends and foes
 * @author ryanli
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickMyMonitor = {
	MODULE_NAME : "MyMonitor",
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ["myhattrick", "dashboard", "teamPage", "youthoverview", "national"],
	OPTIONS : ["TeamIcons"],
	CSS : Foxtrick.InternalPath + "resources/css/my-monitor.css",
	NICE : -1, // add it before links for consistent sidebar placement

	run : function(doc) {
		if (Foxtrick.isPage("myhattrick", doc)
			|| Foxtrick.isPage("dashboard", doc)) {
			FoxtrickMyMonitor.display(doc);
		}
		else if (Foxtrick.isPage("teamPage", doc)
			|| Foxtrick.isPage("youthoverview", doc)
			|| Foxtrick.isPage("national", doc)) {
			FoxtrickMyMonitor.showSidebar(doc);
		}
	},

	change : function(doc) {
		// challenging etc removes box. need to re-add it
		if (doc.getElementById("ft-monitor-sidebar-box")===null
			&& 	(Foxtrick.isPage("teamPage", doc)
				|| Foxtrick.isPage("youthoverview", doc)
				|| Foxtrick.isPage("national", doc)) )
			FoxtrickMyMonitor.run(doc);
	},

	display : function(doc) {
		if (Foxtrick.isPage("myhattrick", doc))
			var insertBefore = doc.getElementById("ctl00_ctl00_CPContent_CPMain_pnlMain");
		else if (Foxtrick.isPage("dashboard", doc))
			var insertBefore = doc.getElementById("eventList").nextSibling;
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
			Foxtrick.map(function(team) {
				var option = doc.createElement("option");
				option.textContent = Foxtrickl10n.getString("MyMonitor.removeTeamFormat")
					.replace(/%n/, team.name)
					.replace(/%t/, Foxtrickl10n.getString("MyMonitor.type." + team.type))
					.replace(/%i/, team.id);
				removeSelect.appendChild(option);
			}, teams);
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
		var teams = FoxtrickMyMonitor.getSavedTeams(doc);
		const dateNow = Foxtrick.util.time.getHtDate(doc);
		var addTeam = function(team) {
			var buildLink = function(team, link) {
				link.textContent = team.name;
				link.href = FoxtrickMyMonitor.getLink(team);
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

			if (FoxtrickPrefs.isModuleOptionEnabled("MyMonitor", 'TeamIcons')) {
				var img_height = 18;
				if (Foxtrick.util.layout.isStandard(doc)) img_height = 24;

				if (team.logo) {
					var img = doc.createElement('img');
					img.title = team.name;
					img.height = img_height;
					img.className = 'teamicon';
					img.src = team.logo;
					header.appendChild(img);
				}
				else if (team.country) {
					var a = doc.createElement('a');
					var img = doc.createElement('img');
					img.src="/Img/Icons/transparent.gif";
					a.className = 'inner flag';
					img.className = 'flag'+team.country;
					a.appendChild(img);
					header.appendChild(a);
				}
				// dummy for icons alignment
				var img = doc.createElement('img');
				img.height = img_height;
				img.width = 0;
				img.src="../../Img/Icons/transparent.gif"
				header.appendChild(img);
			}

			header.appendChild(nameLink);

			var sortdiv = doc.createElement('div');
			sortdiv.className='ft_sort';

			var img = doc.createElement('img');
			img.height = img_height;
			img.width = 0;
			img.src="../../Img/Icons/transparent.gif"
			sortdiv.appendChild(img);


			var uplink = doc.createElement('input');
			uplink.type="image";
			uplink.title=Foxtrickl10n.getString('sort.up');
			uplink.className="up";
			uplink.src="../../Img/Icons/transparent.gif"
			uplink.setAttribute('teamid',team.id);
			Foxtrick.listen(uplink, 'click', FoxtrickMyMonitor.move_up, false);
			sortdiv.appendChild(uplink);

			var downlink = doc.createElement('input');
			downlink.type="image";
			downlink.title=Foxtrickl10n.getString('sort.down');
			downlink.className="down";
			downlink.src="../../Img/Icons/transparent.gif"
			downlink.setAttribute('teamid',team.id);
			Foxtrick.listen(downlink, 'click', FoxtrickMyMonitor.move_down, false);
			sortdiv.appendChild(downlink);
			header.appendChild(sortdiv);

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
			var parameters_str = JSON.stringify(args);

			Foxtrick.util.api.retrieve(doc, args, {
				cache_lifetime : "default",
				caller_name : "MyMonitor"
			},
			function(xml) {
				if (xml !== null) {
					team.name = xml.getElementsByTagName("TeamName")[0].textContent;
					team.id = xml.getElementsByTagName("TeamID")[0].textContent;
					//FoxtrickMyMonitor.setSavedTeams(teams); needed? what for? interfers somewhat with chrome pref updating
					buildLink(team, nameLink);
				}
				var nextmatchdate = Foxtrick.util.matchView.fillMatches(matchesContainer, xml);
				// change expire date of xml to after next match game
				if (nextmatchdate) {
					var expire = Foxtrick.util.time.getDateFromText(nextmatchdate, "yyyymmdd");
					Foxtrick.util.api.setCacheLifetime(doc, parameters_str, expire.getTime()+105*60*1000);
				}
			});

		};
		Foxtrick.map(addTeam, teams);
	},

	move_up: function (ev) {
		var doc = ev.target.ownerDocument;
		var teamid = ev.target.getAttribute('teamid');
		var teams = FoxtrickMyMonitor.getSavedTeams(doc);
		var neworder = [];
		for (var i=0;i<teams.length;++i) {
			if (i!=teams.length-1 && teams[i+1].id == teamid) {
				neworder.push(teams[i+1]);
				neworder.push(teams[i]);
				i++;
			}
			else neworder.push(teams[i]);
		}
		FoxtrickMyMonitor.setSavedTeams(neworder);
	},

	move_down: function (ev) {
		var doc = ev.target.ownerDocument;
		var teamid = ev.target.getAttribute('teamid');
		var teams = FoxtrickMyMonitor.getSavedTeams(doc);
		var neworder = [];
		for (var i=0;i<teams.length;++i) {
			if (teams[i].id == teamid && i!=teams.length-1) {
				neworder.push(teams[i+1]);
				neworder.push(teams[i]);
				i++;
			}
			else neworder.push(teams[i]);
		}
		FoxtrickMyMonitor.setSavedTeams(neworder);
	},

	showSidebar : function(doc) {
		if (Foxtrick.isPage("teamPage", doc))
			var type = "senior";
		else if (Foxtrick.isPage("youthoverview", doc))
			var type = "youth";
		else if (Foxtrick.isPage("national", doc))
			var type = "nt";

		var teams = FoxtrickMyMonitor.getSavedTeams(doc);
		var teamIdContainer = Foxtrick.Pages.All.getId(doc);
		var existing = Foxtrick.filter(function(n) {
			return n.id == teamIdContainer.id && n.type == type;
		}, teams);

		if ( type == 'senior' ) {
			var logo = doc.getElementsByClassName('teamLogo')[0];// team logo
			if (logo) {
				var logo_link = logo.getElementsByTagName('a')[0];  // better quality. original size
				if (logo_link) {
					teamIdContainer.logo = logo_link.href;
					if (existing[0]) existing[0].logo = logo_link.href; //update always
				}
			}
		}
		else if ( type == 'nt' ) {
				var country = Foxtrick.util.id.findCountryId(doc.getElementById('mainBody'));
				teamIdContainer.country = country;
				if (existing[0]) existing[0].country = country; //update if not existing from previous builds
		}


		var container = doc.createElement("div");
		container.id = "ft-monitor-sidebar-box-container";
		// link to add team
		var addLink = doc.createElement("a");
		addLink.className = "ft-link";
		addLink.textContent = Foxtrickl10n.getString("MyMonitor.add");
		addLink.addEventListener("click", function() {
			teams.push({ id : teamIdContainer.id, type : type, name : teamIdContainer.name, logo : teamIdContainer.logo, country:teamIdContainer.country});
			FoxtrickMyMonitor.setSavedTeams(teams);
			Foxtrick.addClass(addLink, "hidden");
			Foxtrick.removeClass(removeLink, "hidden");
			fillSelect();
		}, false);
		container.appendChild(addLink);
		// link to remove team
		var removeLink = doc.createElement("a");
		removeLink.className = "ft-link";
		removeLink.textContent = Foxtrickl10n.getString("MyMonitor.remove");
		removeLink.addEventListener("click", function() {
			teams = Foxtrick.filter(function(n) {
				return n.id != teamIdContainer.id || n.type != type;
			}, teams);
			FoxtrickMyMonitor.setSavedTeams(teams);
			Foxtrick.removeClass(addLink, "hidden");
			Foxtrick.addClass(removeLink, "hidden");
			fillSelect();
		}, false);
		container.appendChild(removeLink);

		// select box containing teams in the monitor
		var fillSelect = function() {
			select.textContent = ""; // clear first
			Foxtrick.listen(select, "change",
				function() {
					if (select.value)
						doc.location.href = select.value;
				},
				false);
			// use an option as faux-header
			var fauxHeader = doc.createElement("option");
			fauxHeader.selected = "selected";
			fauxHeader.textContent = Foxtrickl10n.getString("MyMonitor.teams").replace(/%s/, teams.length);
			select.appendChild(fauxHeader);
			// now add the teams
			Foxtrick.map(function(n) {
				var option = doc.createElement("option");
				option.textContent = n.name;
				option.value = FoxtrickMyMonitor.getLink(n);
				select.appendChild(option);
			}, teams);
		};
		var select = doc.createElement("select");
		fillSelect();
		container.appendChild(select);

		if (existing.length > 0)
			Foxtrick.addClass(addLink, "hidden");
		else
			Foxtrick.addClass(removeLink, "hidden");

		var box = Foxtrick.addBoxToSidebar(doc,
			Foxtrickl10n.getString("MyMonitor.header"), container, -1);
		box.id = "ft-monitor-sidebar-box";

		FoxtrickMyMonitor.setSavedTeams(teams);
	},

	getSavedTeams : function(doc) {
		var savedTeams = FoxtrickPrefs.getString("MyMonitor.teams");
		try {
			var teams = JSON.parse(savedTeams);
		}
		catch (e) {
			Foxtrick.log("Cannot parse saved teams: " + savedTeams + ".");
		}
		if (!teams) {
			// return national teams if first run
			var leagueId = Foxtrick.util.id.getOwnCountryId();
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
	},

	// return the link to a team given
	getLink : function(team) {
		if (team.type == "nt")
			return "/Club/NationalTeam/NationalTeam.aspx?teamId=" + team.id;
		else if (team.type == "youth")
			return "/Club/Youth/Default.aspx?YouthTeamID=" + team.id;
		else // default as senior
			return "/Club/?TeamID=" + team.id;
	}
};
Foxtrick.util.module.register(FoxtrickMyMonitor);
