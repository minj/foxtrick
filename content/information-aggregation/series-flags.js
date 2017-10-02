'use strict';
/**
* series-flags.js
* Show series flags beside manager links and/or team links
* @author taised, ryanli
*/

Foxtrick.modules['SeriesFlags'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: [
		'guestbook', 'teamPage', 'series', 'youthSeries', 'federation', 'tournaments',
		'tournamentsGroups', 'tournamentsFixtures'
	],
	OPTIONS: ['Guestbook', 'Supporters', 'Visitors', 'Tournaments', 'CountryOnly'],
	NICE: +1,  // some conflict with another module. setting NICE +1 solved it

	run: function(doc) {
		var buildFlag = function(arg, callback) {
			Foxtrick.localGet('seriesFlags',
			  function(mapping) {
				if (!mapping || typeof mapping[arg[0]] === 'undefined')
					mapping = { 'userId': {}, 'teamId': {} };

				// data is an Object with attributes leagueId, seriesName,
				// and seriesId
				var buildFromData = function(data) {
					var flag =
						Foxtrick.createFeaturedElement(doc, Foxtrick.modules.SeriesFlags, 'span');
					if (data['leagueId'] != 0) {
						flag.className = 'ft-series-flag';
						var country = Foxtrick.util.id.createFlagFromLeagueId(doc, data.leagueId);
						flag.appendChild(country);
						if (!Foxtrick.Prefs.isModuleOptionEnabled('SeriesFlags', 'CountryOnly') &&
						    data['seriesId'] !== 0) {
							var series = doc.createElement('a');
							series.className = 'inner smallText';
							series.textContent = data['seriesName'];
							series.href = '/World/Series/?LeagueLevelUnitID=' +
								data['seriesId'];
							flag.appendChild(series);
						}
					}
					else flag.className = 'ft-ownerless';
					return flag;
				};
				// fetch data from stored mapping if available, otherwise
				// we retrieve XML
				if (mapping[arg[0]][arg[1]] != undefined) {
					var mapObj = mapping[arg[0]][arg[1]];
					var data = {
						'leagueId': mapObj['leagueId'],
						'seriesName': mapObj['seriesName'],
						'seriesId': mapObj['seriesId']
					};
					var flag = buildFromData(data);
					callback(flag);
				}
				else {
					var args = [['file', 'teamdetails']];
					args.push(arg);
					Foxtrick.util.api.retrieve(doc, args, { cache_lifetime: 'session' },
					  function(xml, errorText) {
						if (!xml || errorText) {
							Foxtrick.log(errorText);
							return;
						}
						Foxtrick.stopListenToChange(doc);
						var data = { // in case LeagueLevelUnit is missing (eg during quali matches)
							'leagueId': 0,
							'seriesName': '',
							'seriesId': 0
						};
						if (xml.getElementsByTagName('LeagueID')[0]) // has a team
							data.leagueId = xml.getElementsByTagName('LeagueID')[0].textContent;
						// there are can be several LeagueLevelUnitID.
						// if LeagueLevelUnit is available it's the first
						if (xml.getElementsByTagName('LeagueLevelUnit')[0] &&
						    xml.getElementsByTagName('LeagueLevelUnit')[0]
						    .getElementsByTagName('LeagueLevelUnitID')[0]) {
							data.seriesName = xml.getElementsByTagName('LeagueLevelUnitName')[0]
								.textContent,
							data.seriesId = xml.getElementsByTagName('LeagueLevelUnitID')[0]
								.textContent;
						}
						// get newest mapping and store the data, because
						// it may have changed during the retrieval of XML
						Foxtrick.localGet('seriesFlags',
						  function(mapping) {
							if (!mapping || typeof mapping[arg[0]] === 'undefined')
								mapping = { 'userId': {}, 'teamId': {} };
							mapping[arg[0]][arg[1]] = data;
							Foxtrick.localSet('seriesFlags', mapping);
							var flag = buildFromData(data);
							callback(flag);
							Foxtrick.startListenToChange(doc);
						});
					});
				}
			});
		};
		var modifyUserLinks = function(links) {
			Foxtrick.map(function(n) {
				buildFlag(['userId', Foxtrick.util.id.getUserIdFromUrl(n.href)],
				  function(flag) {
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
			Foxtrick.map(function(n) {
				buildFlag(['teamId', Foxtrick.util.id.getTeamIdFromUrl(n.href)],
				  function(flag) {
					if (Foxtrick.hasClass(n, 'series-flag') ||
					    Foxtrick.hasClass(n, 'ft-popup-list-link'))
						return;
					Foxtrick.addClass(n, 'series-flag');
					n.parentNode.insertBefore(flag, n.nextSibling);
					n.parentNode.insertBefore(doc.createTextNode(' '), flag);
				});
			}, links);
		};
		if (Foxtrick.Prefs.isModuleOptionEnabled('SeriesFlags', 'Guestbook')
			&& Foxtrick.isPage(doc, 'guestbook')) {
			// add to guest managers
			var wrapper = Foxtrick.getMBElement(doc, 'upGB');
			var links = wrapper.getElementsByTagName('a');
			var userLinks = Foxtrick.filter(function(n) {
				return n.href.search(/userId=/i) >= 0 &&
					!Foxtrick.hasClass(n, 'ft-popup-list-link');
			}, links);
			modifyUserLinks(userLinks);
		}
		//We add also flag to the guestbook entry in teamPage, but we have to skip the own user link
		if (Foxtrick.Prefs.isModuleOptionEnabled('SeriesFlags', 'Guestbook')
			&& Foxtrick.isPage(doc, 'teamPage')) {
			var mainBoxes = doc.getElementById('mainBody').getElementsByClassName('mainBox');
			Foxtrick.map(function(b) {
				var links = b.getElementsByTagName('a');
				var userLinks = Foxtrick.filter(function(n) {
					return (n.href.search(/userId=/i) >= 0 &&
					        !Foxtrick.hasClass(n, 'ft-popup-list-link'));
				}, links);
				modifyUserLinks(userLinks);
			}, mainBoxes);
		}
		if (Foxtrick.Prefs.isModuleOptionEnabled('SeriesFlags', 'Supporters')
			&& Foxtrick.isPage(doc, 'teamPage')) {
			// add to supporters
			if (!Foxtrick.Pages.All.getMainHeader(doc)) {
				// no team
				// e. g. https://www.hattrick.org/goto.ashx?path=/Club/?TeamID=9999999
				return;
			}

			var sideBar = doc.getElementById('sidebar');
			var sideBarBoxes = sideBar.getElementsByClassName('sidebarBox');
			// supporters box is among the boxes without a table
			var nonVisitorsBoxes = Foxtrick.filter(function(n) {
				return n.getElementsByTagName('table').length == 0 && n.id != 'ft-links-box';
			}, sideBarBoxes);
			Foxtrick.map(function(b) {
				var links = b.getElementsByTagName('a');
				var userLinks = Foxtrick.filter(function(n) {
					return (n.href.search(/userId=/i) >= 0 &&
					        !Foxtrick.hasClass(n, 'ft-popup-list-link'));
				}, links);
				modifyUserLinks(userLinks);
			}, nonVisitorsBoxes);
		}
		if (Foxtrick.Prefs.isModuleOptionEnabled('SeriesFlags', 'Visitors')
			&& Foxtrick.any(function(n) {
				return Foxtrick.isPage(doc, n);
			}, ['teamPage', 'series', 'youthSeries', 'federation'])) {
			// add to visitors
			var sideBar = doc.getElementById('sidebar');
			var sideBarBoxes = sideBar.getElementsByClassName('sidebarBox');
			// visitors box is the box with a table
			var visitorsBoxes = Foxtrick.filter(function(n) {
				return n.getElementsByTagName('table').length > 0 && n.id != 'ft-links-box';
			}, sideBarBoxes);
			Foxtrick.map(function(n) {
				var links = n.getElementsByTagName('a');
				var userLinks = Foxtrick.filter(function(n) {
					return (n.href.search(/userId=/i) >= 0 &&
					        !Foxtrick.hasClass(n, 'ft-popup-list-link'));
				}, links);
				modifyUserLinks(userLinks);
			}, visitorsBoxes);
		}

		if (Foxtrick.Prefs.isModuleOptionEnabled('SeriesFlags', 'Tournaments')
			&& (Foxtrick.isPage(doc, 'tournaments')
				|| Foxtrick.isPage(doc, 'tournamentsGroups')
				|| Foxtrick.isPage(doc, 'tournamentsFixtures'))) {


			// add to tournaments table
			var mainWrapper = doc.getElementById('mainBody');
			var links = mainWrapper.getElementsByTagName('a');
			var teamLinks = Foxtrick.filter(function(n) {
				return (n.href.search(/matchId=/i) == -1
					&& n.href.search(/teamId=/i) >= 0
					&& !Foxtrick.hasClass(n, 'ft-popup-list-link')
					// link in .boxHead
					&& n.href.search(/Tournaments/i) == -1);
			}, links);
			modifyTeamLinks(teamLinks);
		}
	},

	change: function(doc) {
		this.run(doc);
	}

};
