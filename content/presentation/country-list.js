/**
* country-list.js
* displays country names in dropdown in different way
* @author spambot
*/

'use strict';

Foxtrick.modules.CountryList = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['all'],
	OPTIONS: [
		'SelectBoxes',
		['Flags', 'FlagSort'],
		'UseEnglish',
		'TeamPage', 'ManagerPage', 'HideFlagOntop',
	],
	CSS: Foxtrick.InternalPath + 'resources/css/CountyList.css',

	/** @param {document} doc */
	// eslint-disable-next-line complexity
	run: function(doc) {
		const module = this;
		var list = doc.getElementById('ft_countrylist');
		if (list !== null)
			return;

		var lgs = /** @type {HTMLSelectElement} */ (Foxtrick.getMBElement(doc, 'ddlLeagues'));

		var ddl = /** @type {HTMLSelectElement} */
			(Foxtrick.getMBElement(doc, 'ddlLeagues_ddlLeagues'));

		var ddlSide = /** @type {HTMLSelectElement} */
			(doc.getElementById('ctl00_ctl00_CPContent_CPSidebar_ucLeagues2_ddlLeagues'));

		var ddlDrop = /** @type {HTMLSelectElement} */
			(Foxtrick.getMBElement(doc, 'ucLeaguesDropdown_ddlLeagues'));

		var ddlBornIn = /** @type {HTMLSelectElement} */ (Foxtrick.getMBElement(doc, 'ddlBornIn'));

		var poolCountry = /** @type {HTMLSelectElement} */
			(Foxtrick.getMBElement(doc, 'ddlPoolSettingRequestLeague')); // country

		var poolCountries = /** @type {HTMLSelectElement} */
			(Foxtrick.getMBElement(doc, 'ddlPoolCountries'));

		var change = Foxtrick.Prefs.isModuleOptionEnabled(module, 'SelectBoxes');

		/** @typedef {[HTMLSelectElement, number]|[HTMLSelectElement, number, number]} CListArg */
		/** @type {Partial<Record<PAGE, CListArg[]>>} */
		var pageMap = {
			transferSearchForm: [[ddlBornIn, 1]],
			country: [[ddlDrop, 0]],
			htPress: [[ddlSide, 2]],
			statsTransfersBuyers: [[lgs, 1]],
			statsTeams: [[ddl, 0]],
			statsPlayers: [[ddl, 0]],
			statsRegions: [[ddl, 0]],
			statsNationalTeams: [[ddl, 0]],
			statsConfs: [[ddl, 0]],
			statsBookmarks: [[ddl, 0]],
			trainingStats: [[ddl, 1]],
			statsArena: [[ddlDrop, 0]],
			challenges: [[poolCountry, 2], [poolCountries, 0, 1]],
		};

		for (let [page, defs] of Object.entries(pageMap)) {
			let p = /** @type {PAGE} */ (page);
			if (!Foxtrick.isPage(doc, p))
				continue;

			if (change) {
				for (let def of defs)
					// eslint-disable-next-line prefer-spread
					module._changelist.apply(module, def);
			}
			else {
				for (let def of defs) {
					let [s] = def;
					module._activate(s);
				}
			}

			break;
		}

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'TeamPage')) {
			if (Foxtrick.isPage(doc, 'teamPage'))
				module._placeCountry(doc);
		}

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'ManagerPage')) {
			if (Foxtrick.isPage(doc, 'managerPage'))
				module._placeCountry(doc);
		}

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'Flags')) {
			if (Foxtrick.isPage(doc, 'flagCollection'))
				module._changeFlags(doc);
		}

	},

	/** @param {document} doc */
	_placeCountry: function(doc) {
		const module = this;

		let cntr = doc.getElementById('ft_cntr_fix');
		if (cntr)
			return;

		/** @type {HTMLAnchorElement} */
		let league = doc.querySelector('#mainBody .flag');
		if (!league)
			return;

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'HideFlagOntop'))
			league.setAttribute('style', 'display:none');

		Foxtrick.log(league.href);
		let leagueId = Foxtrick.getUrlParam(league.href, 'leagueId');
		if (!leagueId)
			return;

		let newName = Foxtrick.L10n.getCountryName(parseInt(leagueId, 10));
		if (newName === 'New Moon')
			return;

		league.firstElementChild.setAttribute('title', newName);

		let byline = doc.querySelector('.byline');
		let a = Foxtrick.createFeaturedElement(doc, module, 'a');
		byline.insertBefore(a, byline.firstChild);
		a.id = 'ft_cntr_fix';
		a.href = league.href;
		a.textContent = newName;
		byline.insertBefore(doc.createTextNode(', '), a.nextSibling);
	},

	/**
	 * @param {HTMLSelectElement} selectbox
	 * @param {number} start
	 * @param {number} [skipLast]
	 */
	// eslint-disable-next-line complexity
	_changelist: function(selectbox, start, skipLast) {
		const module = this;
		if (!selectbox)
			return;

		var id = selectbox.id;
		var value = selectbox.value;
		var end = selectbox.options.length - (Number(skipLast) || 0);
		var options = [...selectbox.options].slice(start, end);

		Foxtrick.log('id:', id, 'start:', start, 'end:', end);
		Foxtrick.makeFeaturedElement(selectbox, module);
		selectbox.style.display = 'inline';

		for (let opt of options) {
			let leagueId;

			if (/[^t]league/i.test(id)) { // RequestLeague is actually country
				let lId = parseInt(opt.value, 10);
				if (Number.isNaN(lId) || lId < 1)
					continue;

				leagueId = lId;
			}
			else {
				let cId = parseInt(opt.value, 10);
				if (Number.isNaN(cId) || cId < 1)
					continue;

				leagueId = Foxtrick.XMLData.getLeagueIdByCountryId(cId);
			}

			if (!leagueId)
				continue;

			let newName = Foxtrick.L10n.getCountryName(leagueId);
			if (newName === 'New Moon')
				continue;

			opt.text = newName;
		}

		/** @type {[string, string][]} */
		let pairs = options.map(opt => [opt.value || '-1', opt.text.trim() || '-1']);
		pairs.sort((a, b) => a[1].localeCompare(b[1], 'sv'));

		for (let [i, opt] of options.entries()) {
			let pair = pairs[i];
			let [val, text] = pair;

			opt.value = val;
			opt.text = text;

			if (val == value)
				selectbox.selectedIndex = i + start;
		}
	},

	/** @param {document} doc */
	_changeFlags: function(doc) {
		const module = this;

		/** @type {NodeListOf<HTMLAnchorElement>} */
		var flags = doc.querySelectorAll('.flag');

		// due to idiotic site layout by HTs
		// we have to resort to hack-work to group flags and sort them

		/** @type {HTMLAnchorElement[][]} */
		var flagGroups = [];

		/** @type {HTMLAnchorElement[]} */
		var flagGroup = [];

		for (let flag of flags) {
			let leagueId = Foxtrick.getUrlParam(flag.href, 'leagueId');
			if (!leagueId)
				continue;

			let newName = Foxtrick.L10n.getCountryName(parseInt(leagueId, 10));
			if (newName === 'New Moon')
				continue;

			let img = flag.querySelector('img');
			img.alt = img.title = newName;

			if (flag.previousElementSibling.nodeName === 'P') {
				// new flag group
				flagGroups.push(flagGroup = []);
			}

			flagGroup.push(flag);
		}

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'FlagSort')) {
			for (let group of flagGroups) {
				let insertBefore = group.slice().pop().nextSibling;

				group.sort((a, b) => {
					let imgA = a.querySelector('img');
					let imgB = b.querySelector('img');
					return imgA.alt.localeCompare(imgB.alt);
				});

				let wrapper = doc.createDocumentFragment();
				Foxtrick.appendChildren(wrapper, group);

				insertBefore.parentNode.insertBefore(wrapper, insertBefore);
			}
		}
	},

	/** @param {HTMLSelectElement} selectbox */
	_activate: function(selectbox) {
		if (!selectbox)
			return;

		selectbox.style.display = 'inline';
		Foxtrick.log('country select activated.\n');
	},
};
