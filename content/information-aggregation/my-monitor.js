'use strict';
/**
 * my-monitor.js
 * Monitors matches of friends and foes
 * @author ryanli
 */

Foxtrick.modules['MyMonitor'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['myHattrick', 'dashboard', 'teamPage', 'youthOverview', 'national'],
	OPTIONS: ['TeamIcons'],
	CSS: Foxtrick.InternalPath + 'resources/css/my-monitor.css',
	NICE: -1, // add it before links for consistent sidebar placement

	run: function(doc) {
		var getSavedTeams = function() {
			var savedTeams = Foxtrick.Prefs.getString('MyMonitor.teams');
			var teams = null;
			try {
				teams = JSON.parse(savedTeams);
			}
			catch (e) {
				Foxtrick.log('Cannot parse saved teams: ' + savedTeams + '.');
			}
			if (!teams) {
				// return national teams if first run
				var leagueId = Foxtrick.util.id.getOwnLeagueId();
				var league = Foxtrick.XMLData.League[leagueId];
				var ntId = league.NationalTeamId;
				var u20Id = league.U20TeamId;
				var ntName = Foxtrick.XMLData.getNTNameByLeagueId(leagueId);
				var u20Name = 'U-20 ' + ntName;

				teams = [
					{ id: ntId, name: ntName, type: 'nt' },
					{ id: u20Id, name: u20Name, type: 'nt' }
				];
			}
			return teams;
		};
		var setSavedTeams = function(teams) {
			Foxtrick.Prefs.setString('MyMonitor.teams', JSON.stringify(teams));
		};
		// return the link to a team given
		var getLink = function(team) {
			if (team.type == 'nt')
				return '/Club/NationalTeam/NationalTeam.aspx?teamId=' + team.id;
			else if (team.type == 'youth')
				return '/Club/Youth/?YouthTeamID=' + team.id;
			else // default as senior
				return '/Club/?TeamID=' + team.id;
		};
		// display my monitor on myhattrick=news and dashboard page
		var display = function() {
			var mydiv = Foxtrick.createFeaturedElement(doc, Foxtrick.modules.MyMonitor, 'div');
			mydiv.id = 'ft-monitor-div';
			if (Foxtrick.isPage(doc, 'myHattrick')) {
				var h1 = doc.querySelector('#mainBody h1');
				h1.parentNode.insertBefore(mydiv, h1);
			}
			else if (Foxtrick.isPage(doc, 'dashboard'))
				doc.getElementById('mainBody').appendChild(mydiv);
			else
				return;

			// header - 'My Monitor'
			var header = doc.createElement('h2');
			//header.id = 'ft-monitor-header';
			header.textContent = Foxtrick.L10n.getString('MyMonitor.header');
			mydiv.appendChild(header);

			// line containing add/remove links
			var addRemove = Foxtrick.createFeaturedElement(doc, Foxtrick.modules.MyMonitor, 'div');
			addRemove.id = 'ft-monitor-add-remove';
			mydiv.appendChild(addRemove);

			// link for adding a team
			var addLink = doc.createElement('a');
			addLink.id = 'ft-monitor-add';
			addLink.className = 'ft-link';
			addLink.textContent = Foxtrick.L10n.getString('button.add');
			Foxtrick.onClick(addLink, function() {
				var msg = Foxtrick.L10n.getString('MyMonitor.addHelp');
				Foxtrick.util.note.add(doc, msg, 'ft-monitor-add-note', { to: mydiv });
			});
			addRemove.appendChild(addLink);

			// slash separating add and remove
			addRemove.appendChild(doc.createTextNode(' / '));

			// link for removing a team
			var removeLink = doc.createElement('a');
			removeLink.id = 'ft-monitor-remove';
			removeLink.className = 'ft-link';
			removeLink.textContent = Foxtrick.L10n.getString('button.remove');
			Foxtrick.onClick(removeLink, function() {
				var removeBox = doc.createElement('div');
				removeBox.id = 'ft-monitor-remove-box';
				// label prompting to select a team for removal
				var removeLabel = doc.createElement('label');
				removeLabel.id = 'ft-monitor-remove-label';
				removeLabel.htmlFor = 'ft-monitor-remove-select';
				removeLabel.textContent = Foxtrick.L10n.getString('MyMonitor.removeTeam');
				removeBox.appendChild(removeLabel);
				removeBox.appendChild(doc.createTextNode(' '));
				// select box containing teams
				var removeSelect = doc.createElement('select');
				removeSelect.id = 'ft-monitor-remove-select';
				removeBox.appendChild(removeSelect);
				// add options to select box
				Foxtrick.map(function(team) {
					var option = doc.createElement('option');
					option.textContent = Foxtrick.L10n.getString('MyMonitor.removeTeamFormat')
						.replace(/%n/, team.name)
						.replace(/%t/, Foxtrick.L10n.getString('MyMonitor.type.' + team.type))
						.replace(/%i/, team.id);
					removeSelect.appendChild(option);
				}, teams);
				// button committing removal
				var removeButton = doc.createElement('input');
				removeButton.id = 'ft-monitor-remove-button';
				removeButton.type = 'button';
				removeButton.value = Foxtrick.L10n.getString('button.remove');
				Foxtrick.onClick(removeButton, function() {
					var index = removeSelect.selectedIndex;
					removeSelect.removeChild(removeSelect.options[index]);
					teams.splice(index, 1); // remove the selected from teams
					setSavedTeams(teams);
					var frame = doc.getElementsByClassName('ft-monitor-frame')[index];
					frame.parentNode.removeChild(frame);
				});
				removeBox.appendChild(removeButton);
				// add note
				Foxtrick.util.note.add(doc, removeBox, 'ft-monitor-remove-note', { to: mydiv });
			});
			addRemove.appendChild(removeLink);

			// container for the teams
			var container = Foxtrick.createFeaturedElement(doc, Foxtrick.modules.MyMonitor, 'div');
			container.id = 'ft-monitor-container';
			mydiv.appendChild(container);

			// separator at the bottom
			var separator = doc.createElement('div');
			separator.className = 'separator';
			container.appendChild(separator);

			// add the teams
			var teams = getSavedTeams(doc);
			var dateNow = Foxtrick.util.time.getHtDate(doc);
			var addTeam = function(team) {
				var buildLink = function(team, link) {
					link.textContent = team.name;
					link.href = getLink(team);
				};
				// frame for each team
				var frame = doc.createElement('div');
				frame.className = 'ft-monitor-frame';
				container.insertBefore(frame, separator);

				// team header
				var header = doc.createElement('h3');
				frame.appendChild(header);
				// link containing team name
				var nameLink = doc.createElement('a');
				buildLink(team, nameLink);

				if (Foxtrick.Prefs.isModuleOptionEnabled('MyMonitor', 'TeamIcons')) {
					var height = '24';
					if (team.logo) {
						var img = doc.createElement('img');
						img.title = team.name;
						img.height = height;
						img.className = 'teamicon';
						img.src = team.logo;
						header.appendChild(img);
					}
					else if (team.country) {
						var a = doc.createElement('a');
						var img = doc.createElement('img');
						img.src = '/Img/Icons/transparent.gif';
						a.className = 'inner flag';
						img.className = 'flag' + team.country;
						a.appendChild(img);
						header.appendChild(a);
					}
					// dummy for icons alignment
					var img = doc.createElement('img');
					img.height = height;
					img.width = 0;
					img.src = '../../Img/Icons/transparent.gif';
					header.appendChild(img);
				}

				header.appendChild(nameLink);

				var sortdiv = doc.createElement('div');
				sortdiv.className = 'ft_sort';

				var img = doc.createElement('img');
				img.height = height;
				img.width = 0;
				img.src = '../../Img/Icons/transparent.gif';
				sortdiv.appendChild(img);

				var move = function(direction, id) {
					return function() {
						var teams = getSavedTeams(doc);
						var neworder = [];
						for (var i = 0; i < teams.length; ++i) {
							if ((i != teams.length - 1)
								&& ((direction == 'up' && teams[i + 1].id == id)
									|| (direction == 'down' && teams[i].id == id))) {
								neworder.push(teams[i + 1]);
								neworder.push(teams[i]);
								i++;
							}
							else
								neworder.push(teams[i]);
						}
						setSavedTeams(neworder);
					};
				};

				var uplink = doc.createElement('input');
				uplink.type = 'image';
				uplink.title = Foxtrick.L10n.getString('button.up');
				uplink.className = 'up';
				uplink.src = '../../Img/Icons/transparent.gif';
				Foxtrick.onClick(uplink, move('up', team.id));
				sortdiv.appendChild(uplink);

				var downlink = doc.createElement('input');
				downlink.type = 'image';
				downlink.title = Foxtrick.L10n.getString('button.down');
				downlink.className = 'down';
				downlink.src = '../../Img/Icons/transparent.gif';
				downlink.setAttribute('teamid', team.id);
				Foxtrick.onClick(downlink, move('down', team.id));
				sortdiv.appendChild(downlink);
				header.appendChild(sortdiv);

				// matches container
				var matchesContainer = doc.createElement('div');
				if (Foxtrick.Prefs.getBool('xmlLoad'))
					Foxtrick.util.matchView.startLoad(matchesContainer);
				frame.appendChild(matchesContainer);

				var args = [
					['file', 'matches'],
					['teamId', parseInt(team.id, 10)]
				];
				if (team.type == 'youth')
					args.push(['isYouth', 'true']);
				var parameters_str = JSON.stringify(args);

				Foxtrick.util.api.retrieve(doc, args, { cache_lifetime: 'default' },
				  function(xml, errorText) {
					if (!xml || errorText) {
						Foxtrick.log(errorText);
						return;
					}
					team.name = xml.getElementsByTagName('TeamName')[0].textContent;
					team.id = xml.getElementsByTagName('TeamID')[0].textContent;
					buildLink(team, nameLink);
					var nextmatchdate = Foxtrick.util.matchView
						.fillMatches(matchesContainer, xml, errorText);
					// change expire date of xml to after next match game
					if (nextmatchdate) {
						var time = nextmatchdate.getTime() + 105 * 60 * 1000;
						Foxtrick.util.api.setCacheLifetime(parameters_str, time);
					}
				});

			};
			Foxtrick.map(addTeam, teams);
		};
		// show my monitor shortcuts in sidebar
		var showSidebar = function() {
			if (Foxtrick.isPage(doc, 'teamPage'))
				var type = 'senior';
			else if (Foxtrick.isPage(doc, 'youthOverview'))
				var type = 'youth';
			else if (Foxtrick.isPage(doc, 'national'))
				var type = 'nt';

			if (!Foxtrick.Pages.All.getMainHeader(doc)) {
				// no team
				// e. g. https://www.hattrick.org/goto.ashx?path=/Club/?TeamID=9999999
				return;
			}

			var teams = getSavedTeams(doc);
			var teamIdContainer = {
				id: Foxtrick.Pages.All.getTeamIdFromBC(doc),
				name: Foxtrick.Pages.All.getTeamNameFromBC(doc),
			};

			var existing = Foxtrick.filter(function(n) {
				return n.id == teamIdContainer.id && n.type == type;
			}, teams);

			if (type == 'senior') {
				var logo = doc.getElementsByClassName('teamLogo')[0];// team logo
				if (logo) {
					var logo_link = logo.getElementsByTagName('a')[0];
					// better quality. original size
					if (logo_link) {
						teamIdContainer.logo = logo_link.href;
						if (existing[0]) existing[0].logo = logo_link.href; //update always
					}
				}
			}
			else if (type == 'nt') {
					var country = Foxtrick.util.id.findLeagueId(doc.getElementById('mainBody'));
					teamIdContainer.country = country;
					if (existing[0])
						existing[0].country = country;
					//update if not existing from previous builds
			}


			var container = Foxtrick.createFeaturedElement(doc, Foxtrick.modules.MyMonitor, 'div');
			container.id = 'ft-monitor-sidebar-box-container';
			// link to add team
			var addLink = doc.createElement('a');
			addLink.className = 'ft-link';
			addLink.textContent = Foxtrick.L10n.getString('MyMonitor.add');
			Foxtrick.onClick(addLink, function() {
				teams.push({
					id: teamIdContainer.id, type: type, name: escape(teamIdContainer.name),
					logo: teamIdContainer.logo, country: teamIdContainer.country
				});
				setSavedTeams(teams);
				Foxtrick.addClass(addLink, 'hidden');
				Foxtrick.removeClass(removeLink, 'hidden');
				fillSelect();
			});
			container.appendChild(addLink);
			// link to remove team
			var removeLink = doc.createElement('a');
			removeLink.className = 'ft-link';
			removeLink.textContent = Foxtrick.L10n.getString('MyMonitor.remove');
			Foxtrick.onClick(removeLink, function() {
				teams = Foxtrick.filter(function(n) {
					return n.id != teamIdContainer.id || n.type != type;
				}, teams);
				setSavedTeams(teams);
				Foxtrick.removeClass(addLink, 'hidden');
				Foxtrick.addClass(removeLink, 'hidden');
				fillSelect();
			});
			container.appendChild(removeLink);

			// select box containing teams in the monitor
			var fillSelect = function() {
				select.textContent = ''; // clear first
				Foxtrick.listen(select, 'change', function() {
					// doc.location='' does not work hear, no idea
					if (select.value)
						doc.location.assign(select.value);
				}, false);
				// use an option as faux-header
				var fauxHeader = doc.createElement('option');
				fauxHeader.selected = 'selected';
				fauxHeader.textContent = Foxtrick.L10n.getString('MyMonitor.teams', teams.length)
					.replace(/%s/, teams.length);
				select.appendChild(fauxHeader);
				// now add the teams
				Foxtrick.map(function(n) {
					var option = doc.createElement('option');
					option.textContent = unescape(n.name);
					option.value = getLink(n);
					select.appendChild(option);
				}, teams);
			};
			var select = doc.createElement('select');
			fillSelect();
			container.appendChild(select);

			if (existing.length > 0)
				Foxtrick.addClass(addLink, 'hidden');
			else
				Foxtrick.addClass(removeLink, 'hidden');

			var box = Foxtrick.addBoxToSidebar(doc,
				Foxtrick.L10n.getString('MyMonitor.header'), container, -1);
			box.id = 'ft-monitor-sidebar-box';

			setSavedTeams(teams);
		};

		// call functions from here
		if (Foxtrick.isPage(doc, 'myHattrick')
			|| Foxtrick.isPage(doc, 'dashboard')) {
			display(doc);
		}
		else if (Foxtrick.isPage(doc, 'teamPage')
			|| Foxtrick.isPage(doc, 'youthOverview')
			|| Foxtrick.isPage(doc, 'national')) {
			showSidebar(doc);
		}
	},

	change: function(doc) {
		// challenging etc removes box. need to re-add it
		if (doc.getElementById('ft-monitor-sidebar-box') == null
			&& (Foxtrick.isPage(doc, 'teamPage')
				|| Foxtrick.isPage(doc, 'youthOverview')
				|| Foxtrick.isPage(doc, 'national')))
			this.run(doc);
	}
};
