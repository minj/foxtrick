/**
 * my-monitor.js
 * Monitors matches of friends and foes
 *
 * @author ryanli. convincedd, LA-MJ
 */

'use strict';

Foxtrick.modules.MyMonitor = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['myHattrick', 'dashboard', 'teamPage', 'youthOverview', 'national'],
	OPTIONS: ['TeamIcons'],
	RADIO_OPTIONS: ['ManualSort', 'SortByName', 'SortByID'],
	CSS: Foxtrick.InternalPath + 'resources/css/my-monitor.css',
	NICE: -1, // add it before links for consistent sidebar placement

	/**
	 * @param {document} doc
	 */
	run: function(doc) {
		const module = this;
		const SORT = Foxtrick.Prefs.getModuleValue('MyMonitor');

		/**
		 * @param {MyMonitorTeam[]} teams
		 */
		var setSavedTeams = function(teams) {
			Foxtrick.Prefs.setString('MyMonitor.teams', JSON.stringify(teams));
		};

		var getSavedTeams = function() {
			var savedTeams = Foxtrick.Prefs.getString('MyMonitor.teams');

			/** @type {MyMonitorTeam[]} */
			var teams = [];
			try {
				teams = JSON.parse(savedTeams);
			}
			catch (e) {
				Foxtrick.log('Cannot parse saved teams:', savedTeams);
			}

			if (!Array.isArray(teams) || !teams.length) {
				// return national teams if first run
				var leagueId = Foxtrick.util.id.getOwnLeagueId();
				if (leagueId) {
					let league = Foxtrick.XMLData.League[leagueId];
					let ntId = Number(league.NationalTeamId);
					let u20Id = Number(league.U20TeamId);
					let ntName = Foxtrick.XMLData.getNTNameByLeagueId(leagueId);
					let u20Name = 'U-20 ' + ntName;

					teams = [
						{ id: ntId, name: ntName, type: 'nt' },
						{ id: u20Id, name: u20Name, type: 'nt' },
					];
					teams = teams.filter(t => !!t.id);
				}
				else {
					// inactive team
					teams = [];
				}
			}

			if (SORT) {
				/**
				 * @param  {MyMonitorTeam} a
				 * @param  {MyMonitorTeam} b
				 * @return {number}
				 */
				var sorter = function(a, b) {
					if (SORT == 1)
						return a.name.localeCompare(b.name);

					return Number(a.id) - Number(b.id);
				};
				teams.sort(sorter);
			}
			return teams;
		};

		// return the link to a team given
		/**
		 * @param  {MyMonitorTeam} team
		 * @return {string}
		 */
		var getLink = function(team) {
			if (team.type == 'nt')
				return '/Club/NationalTeam/NationalTeam.aspx?teamId=' + team.id;
			else if (team.type == 'youth')
				return '/Club/Youth/?YouthTeamID=' + team.id;

			// default as senior
			return '/Club/?TeamID=' + team.id;
		};

		/**
		 * @param {HTMLElement} div
		 */
		var addBulkLiveSelect = function(div) {
			var url = '/Club/Matches/Live.aspx?matchID=!&actionType=addMatch&SourceSystem=!';
			var URL_TEMPLATE = Foxtrick.goToUrl(url).replace(/!/g, '{}');

			var tbl = doc.createElement('table');
			tbl.id = 'ft-monitor-live-links';
			var row = tbl.insertRow(-1);

			var th = row.appendChild(doc.createElement('td'));
			var liveImg = doc.createElement('img');
			liveImg.className = 'matchHTLive';
			liveImg.src = '/Img/Icons/transparent.gif';
			liveImg.alt = liveImg.title = Foxtrick.L10n.getString('MyMonitor.htLive');
			th.appendChild(liveImg);

			var selectCell = row.appendChild(doc.createElement('td'));
			var liveSelect = doc.createElement('select');
			liveSelect.id = 'ft-monitor-live-select';
			var opt = doc.createElement('option');
			opt.textContent = Foxtrick.L10n.getString('MyMonitor.selectType');
			liveSelect.appendChild(opt);
			selectCell.appendChild(liveSelect);

			var matchesBySource = [
				{ source: 'Hattrick', type: 'senior' },
				{ source: 'Youth', type: 'youth' },

				// README: HTO matches currently disabled in my monitor
				// { source: 'HTOIntegrated', type: 'hto' },
			];

			Foxtrick.forEach(function(t) {
				var sourceOpt = doc.createElement('option');
				sourceOpt.textContent = Foxtrick.L10n.getString('matches.' + t.type);
				sourceOpt.dataset.source = t.source;
				liveSelect.appendChild(sourceOpt);
			}, matchesBySource);

			/**
			 * @type {MyMonitorFilterType[]}
			 */
			var matchesByType = [
				'Official',
				'NT',
			];

			Foxtrick.forEach(function(t) {
				var typeOpt = doc.createElement('option');
				typeOpt.textContent = Foxtrick.L10n.getString('matches.' + t.toLowerCase());
				typeOpt.dataset.type = t;
				liveSelect.appendChild(typeOpt);
			}, matchesByType);

			var buttonCell = row.appendChild(doc.createElement('td'));
			var button = doc.createElement('button');
			button.type = 'button';
			button.textContent = Foxtrick.L10n.getString('button.import');
			buttonCell.appendChild(button);

			var infoCell = row.appendChild(doc.createElement('td'));
			infoCell.id = 'ft-monitor-live-info';

			Foxtrick.onClick(button, function(ev) {
				// eslint-disable-next-line no-invalid-this
				var doc = this.ownerDocument;

				/** @type {NodeListOf<HTMLAnchorElement>} */
				var liveLinks = doc.querySelectorAll('a[data-live]');
				if (!liveLinks.length)
					return;

				/** @type {HTMLSelectElement} */
				var liveSelect = doc.querySelector('#ft-monitor-live-select');
				var idx = liveSelect.selectedIndex;
				if (!idx)
					return;

				var opt = liveSelect.options[idx];
				var source = opt.dataset.source;

				var type = /** @type {MyMonitorFilterType} */ (opt.dataset.type);

				var url;

				if (source) {
					var re = new RegExp(Foxtrick.strToRe(source), 'i');
					var sourceMatches = Foxtrick.filter(function(link) {
						return re.test(link.href);
					}, liveLinks);

					if (sourceMatches.length) {
						var sourceIds = Foxtrick.map(function(link) {
							return Foxtrick.util.id.getMatchIdFromUrl(link.href);
						}, sourceMatches).toString();

						url = Foxtrick.format(URL_TEMPLATE, [sourceIds, source]);
					}
				}
				else if (type) {
					var types = Foxtrick.Pages.Matches[type];
					var typeMatches = Foxtrick.filter(function(link) {
						var mType = Number(link.dataset.matchType);
						return Foxtrick.any(function(type) {
							return type == mType;
						}, types);
					}, liveLinks);

					if (typeMatches.length) {
						var typeIds = Foxtrick.map(function(link) {
							return Foxtrick.util.id.getMatchIdFromUrl(link.href);
						}, typeMatches).toString();

						url = Foxtrick.format(URL_TEMPLATE, [typeIds, 'Hattrick']);
					}
				}

				var info = doc.getElementById('ft-monitor-live-info');

				if (url) {
					Foxtrick.newTab(url);
					info.textContent = '';
				}
				else {
					info.textContent = Foxtrick.L10n.getString('MyMonitor.noMatches');
				}

			});

			div.appendChild(tbl);

			// separator at the bottom
			var separator = doc.createElement('div');
			separator.className = 'separator';
			div.appendChild(separator);
		};

		/**
		 * display my monitor on MyHT, a.k.a news, and dashboard page
		 * @param {document} doc
		 */
		var display = function(doc) {
			var monitor = Foxtrick.createFeaturedElement(doc, module, 'div');
			monitor.id = 'ft-monitor-div';

			if (Foxtrick.isPage(doc, 'myHattrick')) {
				var h1 = doc.querySelector('#mainBody h1');
				h1.parentNode.insertBefore(monitor, h1);
			}
			else if (Foxtrick.isPage(doc, 'dashboard')) {
				doc.getElementById('mainBody').appendChild(monitor);
			}
			else {
				return;
			}

			var gTeams = getSavedTeams();

			// header - 'My Monitor'
			var header = doc.createElement('h2');

			// header.id = 'ft-monitor-header';
			header.textContent = Foxtrick.L10n.getString('MyMonitor.header');
			monitor.appendChild(header);

			// automatic sorters
			var sortDiv = Foxtrick.createFeaturedElement(doc, module, 'div');
			sortDiv.id = 'ft-monitor-sort';
			Foxtrick.addClass(sortDiv, 'float_left');
			monitor.appendChild(sortDiv);

			/**
			 * @param  {number} order
			 * @return {Listener<HTMLElement,MouseEvent>}
			 */
			var sortAndReload = function(order) {
				return function() {
					Foxtrick.Prefs.setModuleValue('MyMonitor', order);
					// eslint-disable-next-line no-invalid-this
					this.ownerDocument.location.reload();
				};
			};

			module.RADIO_OPTIONS.forEach(function addSortLink(id, value) {
				let sortLink = doc.createElement('a');
				sortLink.id = 'ft-monitor-sort-' + id;
				Foxtrick.addClass(sortLink, 'ft-link');
				sortLink.textContent = Foxtrick.L10n.getString(`module.MyMonitor.${id}.desc`);

				Foxtrick.onClick(sortLink, sortAndReload(value));

				sortDiv.appendChild(sortLink);
				sortDiv.appendChild(doc.createTextNode(' '));
			});

			// line containing add/remove links
			var addRemove = Foxtrick.createFeaturedElement(doc, module, 'div');
			addRemove.id = 'ft-monitor-add-remove';
			Foxtrick.addClass(addRemove, 'float_right');
			monitor.appendChild(addRemove);

			// link for adding a team
			var addLink = doc.createElement('a');
			addLink.id = 'ft-monitor-add';
			addLink.className = 'ft-link';
			addLink.textContent = Foxtrick.L10n.getString('button.add');
			addRemove.appendChild(addLink);

			Foxtrick.onClick(addLink, function() {
				var msg = Foxtrick.L10n.getString('MyMonitor.addHelp');
				Foxtrick.util.note.add(doc, msg, 'ft-monitor-add-note', { to: monitor });
			});

			// slash separating add and remove
			addRemove.appendChild(doc.createTextNode(' / '));

			// link for removing a team
			var removeLink = doc.createElement('a');
			removeLink.id = 'ft-monitor-remove';
			removeLink.className = 'ft-link';
			removeLink.textContent = Foxtrick.L10n.getString('button.remove');
			addRemove.appendChild(removeLink);

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
				Foxtrick.forEach(function(team) {
					// TODO test
					var option = doc.createElement('option');
					option.textContent = Foxtrick.L10n.getString('MyMonitor.removeTeamFormat')
						.replace(/%n/, team.name)
						.replace(/%t/, Foxtrick.L10n.getString('MyMonitor.type.' + team.type))
						.replace(/%i/, String(team.id));

					removeSelect.appendChild(option);
				}, gTeams);

				// button committing removal
				var removeButton = doc.createElement('input');
				removeButton.id = 'ft-monitor-remove-button';
				removeButton.type = 'button';
				removeButton.value = Foxtrick.L10n.getString('button.remove');
				removeBox.appendChild(removeButton);

				Foxtrick.onClick(removeButton, function() {
					var index = removeSelect.selectedIndex;
					removeSelect.removeChild(removeSelect.options[index]);

					gTeams.splice(index, 1); // remove the selected from teams
					setSavedTeams(gTeams);

					var frame = doc.getElementsByClassName('ft-monitor-frame')[index];
					frame.parentNode.removeChild(frame);
				});

				// add note
				Foxtrick.util.note.add(doc, removeBox, 'ft-monitor-remove-note', { to: monitor });
			});

			// container for the teams
			var container = Foxtrick.createFeaturedElement(doc, module, 'div');
			container.id = 'ft-monitor-container';
			monitor.appendChild(container);

			/**
			 * @param {MyMonitorTeam} team
			 * @param {HTMLAnchorElement} link
			 */
			var buildLink = function(team, link) {
				link.textContent = team.name;
				link.href = getLink(team);
			};

			var teamPromises = gTeams.map(function addTeam(team) {

				// frame for each team
				var frame = doc.createElement('div');
				frame.className = 'ft-monitor-frame';
				container.appendChild(frame);

				// team header
				var HEIGHT = '24';
				var header = doc.createElement('h3');
				frame.appendChild(header);

				// dummy for icons alignment
				Foxtrick.addImage(doc, header, {
					height: HEIGHT,
					width: 0,
					src: '/Img/Icons/transparent.gif',
				}, null, function() {
					if (Foxtrick.Prefs.isModuleOptionEnabled('MyMonitor', 'TeamIcons')) {
						if (team.logo) {
							var span = doc.createElement('span');
							span.className = 'teamIconSpan';
							header.appendChild(span);

							Foxtrick.addImage(doc, span, {
								title: team.name,
								class: 'teamIcon',
								src: team.logo,
							});
						}
						else if (team.country) {
							var a = doc.createElement('a');
							a.className = 'inner flag';
							header.appendChild(a);

							Foxtrick.addImage(doc, a, {
								title: team.name,
								class: 'flag' + team.country,
								src: '/Img/Icons/transparent.gif',
							});
						}
					}
				});

				var teamCont = doc.createElement('div');
				Foxtrick.addClass(teamCont, 'ft-monitor-team-name');
				header.appendChild(teamCont);

				// link containing team name
				var nameLink = doc.createElement('a');
				buildLink(team, nameLink);
				teamCont.appendChild(nameLink);

				var sortDiv = doc.createElement('div');
				sortDiv.className = 'float_right';

				// a fake image to fix vertical layout by expanding inner height
				Foxtrick.addImage(doc, sortDiv, {
					height: HEIGHT,
					width: 0,
					src: '/Img/Icons/transparent.gif',
				});

				/**
				 * @param  {'up'|'down'} direction
				 * @return {Listener<HTMLInputElement, MouseEvent>}
				 */
				var move = function(direction) {
					return function(ev) {
						var teams = getSavedTeams();
						var frames = [...doc.getElementsByClassName('ft-monitor-frame')];
						// eslint-disable-next-line no-invalid-this, consistent-this
						var thisFrame = this;
						thisFrame = thisFrame.closest('.ft-monitor-frame');
						if (!thisFrame) {
							Foxtrick.log(new Error('Unexpected layout in MyMonitor'));
							return null;
						}

						var parent = thisFrame.parentNode;

						var newOrder = [];
						for (var i = 0; i < teams.length; ++i) {
							if (i != teams.length - 1 &&
								(direction == 'up' && frames[i + 1] == thisFrame ||
									direction == 'down' && frames[i] == thisFrame)) {
								newOrder.push(teams[i + 1]);
								newOrder.push(teams[i]);

								parent.insertBefore(frames[i + 1], frames[i]);

								i++;
							}
							else {
								newOrder.push(teams[i]);
							}
						}
						setSavedTeams(newOrder);

						// ensure manual
						Foxtrick.Prefs.setModuleValue('MyMonitor', 0);

						// disable input[type=image] submit
						return false;
					};
				};

				// styling depends on HT CSS
				// ergo input.up[type=image] is needed
				// need to use preventDefault accordingly
				var upLink = doc.createElement('input');
				upLink.type = 'image';
				upLink.className = 'up';
				upLink.src = '/Img/Icons/transparent.gif';
				upLink.title = Foxtrick.L10n.getString('button.up');
				sortDiv.appendChild(upLink);

				Foxtrick.onClick(upLink, move('up'));

				var downLink = doc.createElement('input');
				downLink.type = 'image';
				downLink.className = 'down';
				downLink.src = '/Img/Icons/transparent.gif';
				downLink.title = Foxtrick.L10n.getString('button.down');
				downLink.setAttribute('teamid', String(team.id));
				sortDiv.appendChild(downLink);

				Foxtrick.onClick(downLink, move('down'));

				header.appendChild(sortDiv);

				// matches container
				var matchesContainer = doc.createElement('div');
				if (Foxtrick.Prefs.getBool('xmlLoad'))
					Foxtrick.util.matchView.startLoad(matchesContainer);

				frame.appendChild(matchesContainer);

				/** @type {CHPPParams} */
				var args = [
					['file', 'matches'],
					['version', '2.8'],
					['teamId', Number(team.id)],
				];
				if (team.type == 'youth')
					args.push(['isYouth', 'true']);

				var argStr = JSON.stringify(args);

				return new Promise(function(resolve) {
					/** @type {CHPPOpts} */
					let cOpts = { cache: 'default' };
					Foxtrick.util.api.retrieve(doc, args, cOpts, (xml, errorText) => {
						if (!xml || errorText) {
							Foxtrick.log(errorText);

							resolve(team);

							return;
						}

						team.name = xml.text('TeamName');
						team.id = xml.num('TeamID');
						buildLink(team, nameLink);

						var nextMatchDate =
							Foxtrick.util.matchView.fillMatches(matchesContainer, xml, errorText);

						// change expire date of XML to after next match game
						if (nextMatchDate) {
							const MATCH_DURATION = 105;
							var time = nextMatchDate.getTime() +
								MATCH_DURATION * Foxtrick.util.time.MSECS_IN_MIN;

							Foxtrick.util.api.setCacheLifetime(argStr, time);
						}

						resolve(team);
					});
				});
			});

			Promise.all(teamPromises).then(setSavedTeams)

				// @ts-ignore
				.catch(Foxtrick.catch(module));

			addBulkLiveSelect(monitor);
		};

		/**
		 * show my monitor shortcuts in sidebar
		 * @param {document} doc
		 */
		// eslint-disable-next-line complexity
		var showSidebar = function(doc) {
			/** @type {MyMonitorTeamType} */
			var type;
			if (Foxtrick.isPage(doc, 'teamPage'))
				type = 'senior';
			else if (Foxtrick.isPage(doc, 'youthOverview'))
				type = 'youth';
			else if (Foxtrick.isPage(doc, 'national'))
				type = 'nt';

			if (!Foxtrick.Pages.All.getMainHeader(doc)) {
				// no team
				// e. g. https://www.hattrick.org/goto.ashx?path=/Club/?TeamID=9999999
				return;
			}

			var teams = getSavedTeams();

			/** @type {Partial<MyMonitorTeam>} */
			var teamIdContainer = {
				id: Foxtrick.Pages.All.getTeamIdFromBC(doc),
				name: Foxtrick.Pages.All.getTeamNameFromBC(doc),
			};

			var savedTeam = Foxtrick.nth(function(n) {
				return n.id == teamIdContainer.id && n.type == type;
			}, teams);

			if (savedTeam)
				savedTeam.name = teamIdContainer.name;

			if (type == 'senior') {
				var logo = doc.querySelector('.teamLogo'); // team logo
				if (logo) {
					var logoLink = logo.querySelector('a');

					// better quality. original size
					if (logoLink) {
						teamIdContainer.logo = logoLink.href;

						if (savedTeam)
							savedTeam.logo = logoLink.href; // update always
					}
				}
			}
			else if (type == 'nt') {
				var country = Foxtrick.util.id.findLeagueId(doc.getElementById('mainBody'));
				teamIdContainer.country = country;

				// update if not existing from previous builds
				if (savedTeam)
					savedTeam.country = country;
			}

			var container = Foxtrick.createFeaturedElement(doc, module, 'div');
			container.id = 'ft-monitor-sidebar-box-container';

			// link to add team
			var addLink = doc.createElement('a');
			addLink.className = 'ft-link';
			addLink.textContent = Foxtrick.L10n.getString('MyMonitor.add');
			container.appendChild(addLink);

			// link to remove team
			var removeLink = doc.createElement('a');
			removeLink.className = 'ft-link';
			removeLink.textContent = Foxtrick.L10n.getString('MyMonitor.remove');
			container.appendChild(removeLink);

			var select = doc.createElement('select');
			container.appendChild(select);

			// select box containing teams in the monitor
			var fillSelect = function() {
				select.textContent = ''; // clear first

				Foxtrick.listen(select, 'change', function() {
					if (!select.value)
						return;

					var newURL = new URL(select.value, doc.location.origin);
					doc.location.assign(newURL.href);
				});

				// use an option as faux-header
				var fauxHeader = doc.createElement('option');
				fauxHeader.selected = true;
				fauxHeader.textContent = Foxtrick.L10n.getString('MyMonitor.teams', teams.length)
					.replace(/%s/, teams.length.toString());
				select.appendChild(fauxHeader);

				// now add the teams
				Foxtrick.forEach(function(n) {
					var option = doc.createElement('option');
					option.textContent = n.name;
					option.value = getLink(n);
					select.appendChild(option);
				}, teams);
			};
			fillSelect();

			Foxtrick.onClick(addLink, function() {
				teams.push({
					id: teamIdContainer.id,
					type: type,
					name: teamIdContainer.name,
					logo: teamIdContainer.logo,
					country: teamIdContainer.country,
				});
				setSavedTeams(teams);

				Foxtrick.addClass(addLink, 'hidden');
				Foxtrick.removeClass(removeLink, 'hidden');

				fillSelect();
			});

			Foxtrick.onClick(removeLink, function() {
				teams = Foxtrick.filter(function(n) {
					return n.id != teamIdContainer.id || n.type != type;
				}, teams);
				setSavedTeams(teams);

				Foxtrick.removeClass(addLink, 'hidden');
				Foxtrick.addClass(removeLink, 'hidden');

				fillSelect();
			});

			if (savedTeam)
				Foxtrick.addClass(addLink, 'hidden');
			else
				Foxtrick.addClass(removeLink, 'hidden');

			var l10nHeader = Foxtrick.L10n.getString('MyMonitor.header');
			var box = Foxtrick.addBoxToSidebar(doc, l10nHeader, container, -1);
			if (!box)
				return;

			box.id = 'ft-monitor-sidebar-box';

			setSavedTeams(teams);
		};

		// call functions from here
		if (Foxtrick.isPage(doc, ['myHattrick', 'dashboard']))
			display(doc);
		else if (Foxtrick.isPage(doc, ['teamPage', 'youthOverview', 'national']))
			showSidebar(doc);
	},

	/** @param {document} doc */
	change: function(doc) {
		if (doc.getElementById('ft-monitor-sidebar-box') == null &&
		    Foxtrick.isPage(doc, ['teamPage', 'youthOverview', 'national'])) {

			// challenging etc removes box. need to re-add it
			this.run(doc);
		}
	},
};

/**
 * @typedef MyMonitorTeam
 * @prop {number} id
 * @prop {string} name
 * @prop {MyMonitorTeamType} type
 * @prop {string} [logo]
 * @prop {number} [country]
 */

/** @typedef {'Official'|'NT'} MyMonitorFilterType */
/** @typedef {'senior'|'youth'|'nt'} MyMonitorTeamType */
