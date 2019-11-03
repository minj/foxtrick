/**
* series-flags.js
* Show series flags beside manager links and/or team links
* @author taised, ryanli, LA-MJ
*/

'use strict';

Foxtrick.modules.SeriesFlags = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: [
		'guestbook', 'teamPage', 'series', 'youthSeries', 'federation', 'tournaments',
		'tournamentsGroups', 'tournamentsFixtures',
	],
	OPTIONS: ['Guestbook', 'Supporters', 'Visitors', 'Tournaments', 'CountryOnly'],
	NICE: 1, // some conflict with another module. setting NICE +1 solved it

	/** @param {document} doc */
	// eslint-disable-next-line complexity
	run: function(doc) {
		const module = this;

		/**
		 * @typedef {'userId'|'teamId'} FlagQArg
		 * @typedef FlagData
		 * @prop {number} leagueId
		 * @prop {number} seriesId
		 * @prop {string} seriesName
		 * @typedef FlagMap
		 * @prop {Record<number, FlagData>} userId
		 * @prop {Record<number, FlagData>} teamId
		 */
		/**
		 * @param {[FlagQArg, number]} arg
		 * @param {function(HTMLElement):void}  callback
		 */
		var buildFlag = function(arg, callback) {
			let [type, id] = arg;

			Foxtrick.localGet('seriesFlags', (mapping) => {
				/** @type {FlagMap} */
				const map = mapping || { userId: {}, teamId: {}};

				/**
				 * @param  {FlagData} data
				 * @return {HTMLElement}
				 */
				var buildFromData = function(data) {
					var flag = Foxtrick.createFeaturedElement(doc, module, 'span');

					if (data.leagueId) {
						flag.className = 'ft-series-flag';
						let country = Foxtrick.util.id.createFlagFromLeagueId(doc, data.leagueId);
						flag.appendChild(country);

						if (!Foxtrick.Prefs.isModuleOptionEnabled(module, 'CountryOnly') &&
						    data.seriesId !== 0) {
							let series = doc.createElement('a');
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

				const section = map[type];

				// fetch data from stored mapping if available,
				// otherwise we retrieve XML
				if (typeof section[id] == 'undefined') {
					/** @type {[string, string|number][]} */
					let args = [['file', 'teamdetails']];
					args.push(arg);

					// eslint-disable-next-line camelcase
					let cOpts = { cache_lifetime: 'session' };
					Foxtrick.util.api.retrieve(doc, args, cOpts, (xml, errorText) => {
						if (!xml || errorText) {
							Foxtrick.log(errorText);
							return;
						}

						Foxtrick.stopListenToChange(doc);

						/** @type {FlagData} */
						// defaults in case LeagueLevelUnit is missing (eg during quali matches)
						var data = {
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
							/** @type {FlagMap} */
							const map = mapping || { userId: {}, teamId: {}};
							map[type][id] = data;
							Foxtrick.localSet('seriesFlags', map);

							let flag = buildFromData(Object.assign({}, data));
							// eslint-disable-next-line callback-return
							callback(flag);

							Foxtrick.startListenToChange(doc);
						});
					});

					return;
				}

				let data = section[id];
				let flag = buildFromData(Object.assign({}, data));

				callback(flag);
			});
		};

		/** @param {HTMLAnchorElement[]} links */
		var modifyUserLinks = function(links) {
			for (let a of links) {
				let id = Foxtrick.util.id.getUserIdFromUrl(a.href);
				buildFlag(['userId', id], (flag) => {
					if (Foxtrick.hasClass(a, 'series-flag') ||
					    Foxtrick.hasClass(a, 'ft-popup-list-link'))
						return;

					Foxtrick.addClass(a, 'series-flag');
					a.parentNode.insertBefore(flag, a.nextSibling);
					a.parentNode.insertBefore(doc.createTextNode(' '), flag);
				});
			}
		};

		/** @param {HTMLAnchorElement[]} links */
		var modifyTeamLinks = function(links) {
			for (let a of links) {
				let id = Foxtrick.util.id.getTeamIdFromUrl(a.href);
				buildFlag(['teamId', id], (flag) => {
					if (Foxtrick.hasClass(a, 'series-flag') ||
					    Foxtrick.hasClass(a, 'ft-popup-list-link'))
						return;

					Foxtrick.addClass(a, 'series-flag');
					Foxtrick.insertAfter(flag, a);
					Foxtrick.insertBefore(' ', flag);
				});
			}
		};


		// -------------------------

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'Guestbook') &&
		    Foxtrick.isPage(doc, 'guestbook')) {
			// add to guest managers
			let wrapper = Foxtrick.getMBElement(doc, 'upGB');
			let links = wrapper.getElementsByTagName('a');

			let userLinks = Foxtrick.filter(function(n) {
				return /userId=/i.test(n.href) && !Foxtrick.hasClass(n, 'ft-popup-list-link');
			}, links);

			modifyUserLinks(userLinks);
		}

		// also add flag to the guestbook entry in teamPage, but we have to skip the own user link
		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'Guestbook') &&
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

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'Supporters') &&
		    Foxtrick.isPage(doc, 'teamPage')) {
			// add to supporters
			if (!Foxtrick.Pages.All.getMainHeader(doc)) {
				// no team
				// e. g. https://www.hattrick.org/goto.ashx?path=/Club/?TeamID=9999999
				return;
			}

			let sideBar = doc.getElementById('sidebar');
			let sideBarBoxes = sideBar.querySelectorAll('.sidebarBox');

			// supporters box is among the boxes without a table
			let nonVisitorsBoxes = Foxtrick.filter(function(n) {
				return !n.querySelector('table') && n.id != 'ft-links-box';
			}, sideBarBoxes);

			Foxtrick.forEach(function(b) {
				let links = b.getElementsByTagName('a');

				let userLinks = Foxtrick.filter(function(n) {
					return /userId=/i.test(n.href) && !Foxtrick.hasClass(n, 'ft-popup-list-link');
				}, links);

				modifyUserLinks(userLinks);
			}, nonVisitorsBoxes);
		}

		let isVisitor = Foxtrick.isPage(doc, ['teamPage', 'series', 'youthSeries', 'federation']);
		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'Visitors') && isVisitor) {
			// add to visitors
			let sideBar = doc.getElementById('sidebar');
			let sideBarBoxes = sideBar.querySelectorAll('.sidebarBox');

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

		let tourneyPages = ['tournaments', 'tournamentsGroups', 'tournamentsFixtures'];
		let isTournament = Foxtrick.isPage(doc, tourneyPages);

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'Tournaments') && isTournament) {
			// add to tournaments table
			let mainWrapper = doc.getElementById('mainBody');
			let links = mainWrapper.querySelectorAll('a');

			let teamLinks = Foxtrick.filter(function(n) {
				return !/matchId=/i.test(n.href) && /teamId=/i.test(n.href) &&
					!Foxtrick.hasClass(n, 'ft-popup-list-link') && // link in .boxHead
					!/Tournaments/i.test(n.href);
			}, links);

			modifyTeamLinks(teamLinks);
		}
	},

	/** @param {document} doc */
	change: function(doc) {
		this.run(doc);
	},

};
