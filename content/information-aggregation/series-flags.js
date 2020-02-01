/**
* series-flags.js
* Show series flags beside manager links and/or team links
* @author taised, ryanli
*/

'use strict';

Foxtrick.modules['SeriesFlags'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: [
		'guestbook', 'teamPage', 'series', 'youthSeries', 'federation', 'tournaments',
		'tournamentsGroups', 'tournamentsFixtures',
	],
	OPTIONS: ['Guestbook', 'Supporters', 'Visitors', 'Tournaments', 'CountryOnly'],
	NICE: +1, // some conflict with another module. setting NICE +1 solved it

	// eslint-disable-next-line complexity
	run: function(doc) {
		var buildFlag = function(arg, callback) {
			Foxtrick.localGet('seriesFlags', (mapping) => {
				let map = mapping;
				if (!map || typeof map[arg[0]] === 'undefined')
					map = { userId: {}, teamId: {}};

				// data is an Object with attributes leagueId, seriesName,
				// and seriesId
				var buildFromData = function(data) {
					var flag =
						Foxtrick.createFeaturedElement(doc, Foxtrick.modules.SeriesFlags, 'span');

					if (data.leagueId) {
						flag.className = 'ft-series-flag';
						var country = Foxtrick.util.id.createFlagFromLeagueId(doc, data.leagueId);
						flag.appendChild(country);
						if (!Foxtrick.Prefs.isModuleOptionEnabled('SeriesFlags', 'CountryOnly') &&
						    data.seriesId !== 0) {
							var series = doc.createElement('a');
							series.className = 'inner smallText';
							series.textContent = data.seriesName;
							series.href = '/World/Series/?LeagueLevelUnitID=' + data.seriesId;
							flag.appendChild(series);
						}
					}
					else {
						flag.className = 'ft-ownerless';
					}

					return flag;
				};

				// fetch data from stored mapping if available, otherwise
				// we retrieve XML
				if (typeof map[arg[0]][arg[1]] == 'undefined') {
					/** @type {CHPPParams} */
					let args = [['file', 'teamdetails']];
					args.push(arg);

					/** @type {CHPPOpts} */
					let cOpts = { cache: 'session' };
					Foxtrick.util.api.retrieve(doc, args, cOpts, (xml, errorText) => {
						if (!xml || errorText) {
							Foxtrick.log(errorText);
							return;
						}

						Foxtrick.stopObserver(doc);
						var data = { // in case LeagueLevelUnit is missing (eg during quali matches)
							leagueId: 0,
							seriesName: '',
							seriesId: 0,
						};

						if (xml.node('LeagueID')) // has a team
							data.leagueId = xml.num('LeagueID');

						// there are can be several LeagueLevelUnitID.
						// if LeagueLevelUnit is available it's the first
						let llu = xml.node('LeagueLevelUnit');
						let lluId = llu && xml.node('LeagueLevelUnitID', llu);
						if (lluId) {
							data.seriesId = xml.num('LeagueLevelUnitID', llu);
							data.seriesName = xml.text('LeagueLevelUnitName', llu);
						}

						// get newest mapping and store the data, because
						// it may have changed during the retrieval of XML
						Foxtrick.localGet('seriesFlags', (mapping) => {
							let map = mapping;
							if (!map || typeof map[arg[0]] === 'undefined')
								map = { userId: {}, teamId: {}};

							map[arg[0]][arg[1]] = data;

							Foxtrick.localSet('seriesFlags', map);

							let flag = buildFromData(data);
							// eslint-disable-next-line callback-return
							callback(flag);

							Foxtrick.startObserver(doc);
						});
					});

					return;
				}

				let mapObj = map[arg[0]][arg[1]];
				let { leagueId, seriesName, seriesId } = mapObj;
				let data = { leagueId, seriesName, seriesId };
				let flag = buildFromData(data);

				callback(flag);
			});
		};
		var modifyUserLinks = function(links) {
			Foxtrick.forEach(function(n) {
				let flagOpts = ['userId', Foxtrick.util.id.getUserIdFromUrl(n.href)];
				buildFlag(flagOpts, (flag) => {
					if (Foxtrick.hasClass(n, 'series-flag') ||
					    Foxtrick.hasClass(n, 'ft-popup-list-link'))
						return;

					Foxtrick.addClass(n, 'series-flag');
					n.parentNode.insertBefore(flag, n.nextSibling);
					n.parentNode.insertBefore(doc.createTextNode(' '), flag);
				});
			}, links);
		};
		var modifyTeamLinks = function(links) {
			Foxtrick.forEach(function(n) {
				let flagOpts = ['teamId', Foxtrick.util.id.getTeamIdFromUrl(n.href)];
				buildFlag(flagOpts, (flag) => {
					if (Foxtrick.hasClass(n, 'series-flag') ||
					    Foxtrick.hasClass(n, 'ft-popup-list-link'))
						return;
					Foxtrick.addClass(n, 'series-flag');
					n.parentNode.insertBefore(flag, n.nextSibling);
					n.parentNode.insertBefore(doc.createTextNode(' '), flag);
				});
			}, links);
		};

		if (Foxtrick.Prefs.isModuleOptionEnabled('SeriesFlags', 'Guestbook') &&
		    Foxtrick.isPage(doc, 'guestbook')) {
			// add to guest managers
			let wrapper = Foxtrick.getMBElement(doc, 'upGB');
			let links = wrapper.getElementsByTagName('a');
			let userLinks = Foxtrick.filter(function(n) {
				return n.href.search(/userId=/i) >= 0 &&
					!Foxtrick.hasClass(n, 'ft-popup-list-link');
			}, links);
			modifyUserLinks(userLinks);
		}

		// also add flag to the guestbook entry in teamPage, but we have to skip the own user link
		if (Foxtrick.Prefs.isModuleOptionEnabled('SeriesFlags', 'Guestbook') &&
		    Foxtrick.isPage(doc, 'teamPage')) {
			let mainBoxes = doc.getElementById('mainBody').getElementsByClassName('mainBox');
			Foxtrick.forEach(function(b) {
				let links = b.getElementsByTagName('a');
				let userLinks = Foxtrick.filter(function(n) {
					return /userId=/i.test(n.href) && !Foxtrick.hasClass(n, 'ft-popup-list-link');
				}, links);
				modifyUserLinks(userLinks);
			}, mainBoxes);
		}
		if (Foxtrick.Prefs.isModuleOptionEnabled('SeriesFlags', 'Supporters') &&
		    Foxtrick.isPage(doc, 'teamPage')) {
			// add to supporters
			if (!Foxtrick.Pages.All.getMainHeader(doc)) {
				// no team
				// e. g. https://www.hattrick.org/goto.ashx?path=/Club/?TeamID=9999999
				return;
			}

			let sideBar = doc.getElementById('sidebar');
			let sideBarBoxes = sideBar.getElementsByClassName('sidebarBox');

			// supporters box is among the boxes without a table
			let nonVisitorsBoxes = Foxtrick.filter(function(n) {
				return n.getElementsByTagName('table').length == 0 && n.id != 'ft-links-box';
			}, sideBarBoxes);
			Foxtrick.forEach(function(b) {
				let links = b.getElementsByTagName('a');
				let userLinks = Foxtrick.filter(function(n) {
					return /userId=/i.test(n.href) && !Foxtrick.hasClass(n, 'ft-popup-list-link');
				}, links);
				modifyUserLinks(userLinks);
			}, nonVisitorsBoxes);
		}

		let visitorPage = Foxtrick.isPage(doc, ['teamPage', 'series', 'youthSeries', 'federation']);
		if (Foxtrick.Prefs.isModuleOptionEnabled('SeriesFlags', 'Visitors') && visitorPage) {
			// add to visitors
			let sideBar = doc.getElementById('sidebar');
			let sideBarBoxes = sideBar.getElementsByClassName('sidebarBox');

			// visitors box is the box with a table
			let visitorsBoxes = Foxtrick.filter(function(n) {
				return n.getElementsByTagName('table').length > 0 && n.id != 'ft-links-box';
			}, sideBarBoxes);

			Foxtrick.forEach(function(n) {
				let links = n.getElementsByTagName('a');
				let userLinks = Foxtrick.filter(function(n) {
					return /userId=/i.test(n.href) && !Foxtrick.hasClass(n, 'ft-popup-list-link');
				}, links);
				modifyUserLinks(userLinks);
			}, visitorsBoxes);
		}

		let tournamentPage =
			Foxtrick.isPage(doc, ['tournaments', 'tournamentsGroups', 'tournamentsFixtures']);
		if (Foxtrick.Prefs.isModuleOptionEnabled('SeriesFlags', 'Tournaments') && tournamentPage) {
			// add to tournaments table
			let mainWrapper = doc.getElementById('mainBody');
			let links = mainWrapper.getElementsByTagName('a');
			let teamLinks = Foxtrick.filter(function(n) {
				return !/matchId=/i.test(n.href) && /teamId=/i.test(n.href) &&
					!Foxtrick.hasClass(n, 'ft-popup-list-link') && // link in .boxHead
					!/Tournaments/i.test(n.href);
			}, links);
			modifyTeamLinks(teamLinks);
		}
	},

	change: function(doc) {
		this.run(doc);
	},

};
