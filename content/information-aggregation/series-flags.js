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

			Foxtrick.storage.get('seriesFlags').then((mapping) => {
				/** @type {FlagMap} */
				const map = mapping || { userId: {}, teamId: {}};

				/**
				 * @param  {FlagData} data
				 * @return {HTMLElement}
				 */
				var buildFromData = function(data) {
					var flag = Foxtrick.createFeaturedElement(doc, module, 'span');

					let { leagueId, seriesId, seriesName } = data;

					if (leagueId) {
						flag.className = 'ft-series-flag';
						let country = Foxtrick.util.id.createFlagFromLeagueId(doc, leagueId);
						flag.appendChild(country);

						if (!Foxtrick.Prefs.isModuleOptionEnabled(module, 'CountryOnly') &&
						    seriesId !== 0) {
							let series = doc.createElement('a');
							series.className = 'inner smallText';
							series.textContent = seriesName;
							series.href = `/World/Series/?LeagueLevelUnitID=${seriesId}`;
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
						// TODO TEST
						let llu = xml.node('LeagueLevelUnit');
						let lluId = llu && xml.node('LeagueLevelUnitID', llu);
						if (lluId) {
							data.seriesId = xml.num('LeagueLevelUnitID', llu);
							data.seriesName = xml.text('LeagueLevelUnitName', llu);
						}

						// get newest mapping and store the data, because
						// it may have changed during the retrieval of XML
						let done = Foxtrick.storage.get('seriesFlags').then(async (mapping) => {
							/** @type {FlagMap} */
							const map = mapping || { userId: {}, teamId: {}};
							map[type][id] = data;

							try {
								await Foxtrick.storage.set('seriesFlags', map);
							}
							catch (e) {
								Foxtrick.catch('seriesFlags.refresh')(e);
							}

							let flag = buildFromData(Object.assign({}, data));
							callback(flag); // TODO promisify
						});
						Foxtrick.finally(done, () => Foxtrick.startObserver(doc))
							.catch(Foxtrick.catch('seriesFlags.buildFlag'));
					});

					return; // TODO promisify
				}

				let data = section[id];
				let flag = buildFromData(Object.assign({}, data));

				callback(flag); // TODO promisify

			}).catch(Foxtrick.catch('seriesFlags.buildFlag'));
		};

		/** @param {Iterable<HTMLAnchorElement>} links */
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

		/** @param {Iterable<HTMLAnchorElement>} links */
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

			/** @type {NodeListOf<HTMLAnchorElement>} */
			let links = wrapper.querySelectorAll('a[href*="userId="i]:not(.ft-popup-list-link)');
			modifyUserLinks(links);
		}

		// also add flag to the guestbook entry in teamPage, but we have to skip the own user link
		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'Guestbook') &&
		    Foxtrick.isPage(doc, 'teamPage')) {
			let mainBoxes = doc.querySelectorAll('#mainBody .mainBox');
			for (let box of mainBoxes) {
				/** @type {NodeListOf<HTMLAnchorElement>} */
				let links = box.querySelectorAll('a[href*="userId="i]:not(.ft-popup-list-link)');
				modifyUserLinks(links);
			}
		}

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'Supporters') &&
		    Foxtrick.isPage(doc, 'teamPage')) {
			// add to supporters
			if (!Foxtrick.Pages.All.getMainHeader(doc)) {
				// no team
				// e. g. https://www.hattrick.org/goto.ashx?path=/Club/?TeamID=9999999
				return;
			}

			let sideBarBoxes = doc.querySelectorAll('#sidebar .sidebarBox');

			// supporters box is among the boxes without a table
			let nonVisitorsBoxes = Foxtrick.filter(function(n) {
				return !n.querySelector('table') && n.id != 'ft-links-box';
			}, sideBarBoxes);
			Foxtrick.forEach(function(b) {
				/** @type {NodeListOf<HTMLAnchorElement>} */
				let links = b.querySelectorAll('a[href*="userId="i]:not(.ft-popup-list-link)');
				modifyUserLinks(links);
			}, nonVisitorsBoxes);
		}

		let isVisitor = Foxtrick.isPage(doc, ['teamPage', 'series', 'youthSeries', 'federation']);
		if (isVisitor && Foxtrick.Prefs.isModuleOptionEnabled(module, 'Visitors')) {
			// add to visitors
			let sideBar = doc.getElementById('sidebar');
			let sideBarBoxes = sideBar.querySelectorAll('.sidebarBox');

			// visitors box is the box with a table
			let visitorsBoxes = Foxtrick.filter(function(n) {
				return n.querySelectorAll('table').length > 0 && n.id != 'ft-links-box';
			}, sideBarBoxes);

			Foxtrick.forEach(function(b) {
				/** @type {NodeListOf<HTMLAnchorElement>} */
				let links = b.querySelectorAll('a[href*="userId="i]:not(.ft-popup-list-link)');
				modifyUserLinks(links);
			}, visitorsBoxes);
		}

		let isTourney =
			Foxtrick.isPage(doc, ['tournaments', 'tournamentsGroups', 'tournamentsFixtures']);
		if (isTourney && Foxtrick.Prefs.isModuleOptionEnabled(module, 'Tournaments')) {
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
