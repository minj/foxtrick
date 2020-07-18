/**
 * transfer-search-result-filters.js
 * Transfer list filters
 * @author convincedd, ryanli, LA-MJ
 */

'use strict';

Foxtrick.modules.TransferSearchResultFilters = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['transferSearchForm', 'transferSearchResult'],
	NICE: -1, // before TransferDeadline and HTMSPoints

	/** @param {document} doc */
	run: function(doc) {
		const module = this;
		const FILTER_PREFIX = 'FoxtrickTransferSearchResultFilters';

		// functions returning whether to hide a player
		// need to check availablility of a certain property first since they
		// may not be available for players just sold
		var FILTER_FUNC = {

			/**
			 * @param  {Player} player
			 * @param  {number|''} min
			 * @param  {number|''} max
			 * @return {boolean}
			 */
			form: function(player, min, max) {
				if (player.form == null)
					return true;
				if (typeof min == 'number' && min !== -1 && player.form < min)
					return true;
				if (typeof max == 'number' && max !== -1 && player.form > max)
					return true;

				return false;
			},

			/**
			 * @param  {Player} player
			 * @return {boolean}
			 */
			hideBruised: function(player) {
				if (player.bruised == null)
					return true;

				return player.bruised;
			},

			/**
			 * @param  {Player} player
			 * @return {boolean}
			 */
			hideInjured: function(player) {
				if (player.injured == null)
					return true;

				return player.injured;
			},

			/**
			 * @param  {Player} player
			 * @return {boolean}
			 */
			hideSuspended: function(player) {
				if (player.redCard == null)
					return true;

				return player.redCard == 1;
			},

			/**
			 * @param  {Player} player
			 * @return {boolean}
			 */
			hideOrdinary: function(player) {
				if (player.specialty == null)
					return true;

				return player.specialty == '';
			},
		};

		/**
		 * @typedef TSFilterCheck
		 * @prop {'check'} type
		 * @prop {keyof FILTER_FUNC} key
		 * @prop {boolean} checked
		 */
		/**
		 * @typedef TSFilterMinMax
		 * @prop {'minmax'} type
		 * @prop {keyof FILTER_FUNC} key
		 * @prop {number|''} min
		 * @prop {number|''} max
		 */
		/**
		 * @typedef TSFilterSkill
		 * @prop {'skillselect'} type
		 * @prop {keyof FILTER_FUNC} key
		 * @prop {number} min
		 * @prop {number} max
		 * @prop {number} minAllowed
		 * @prop {number} maxAllowed
		 */
		/**
		 * @typedef {TSFilterCheck|TSFilterMinMax|TSFilterSkill} TSFilter
		 */

		/**
		 * default filter values
		 * @type {TSFilter[]}
		 */
		var FILTER_VAL = [
			{ key: 'form', type: 'skillselect', min: -1, max: -1, minAllowed: 0, maxAllowed: 8 },
			{ key: 'hideOrdinary', type: 'check', checked: false },
			{ key: 'hideInjured', type: 'check', checked: false },
			{ key: 'hideSuspended', type: 'check', checked: false },
			{ key: 'hideBruised', type: 'check', checked: false },
		];

		const SESSION_KEY = 'transfer-search-result-filters';

		/**
		 * @param  {TSFilter[]} filters
		 * @return {Promise<void>}
		 */
		var setFilters = async function(filters) {
			await Foxtrick.session.set(SESSION_KEY, filters).catch(Foxtrick.catch('setFilters'));
		};

		/**
		 * @return {Promise<TSFilter[]>}
		 */
		var getFilters = async function() {
			try {
				let n = await Foxtrick.session.get(SESSION_KEY);
				if (n)
					return n;
			}
			catch (e) {
				Foxtrick.log(e);
			}

			// set default filters if not set
			await setFilters(FILTER_VAL);
			return FILTER_VAL;
		};

		var showHTSearchProfileComment = function() {
			var HTProfileRow = Foxtrick.getMBElement(doc, 'rowProfiles');
			if (HTProfileRow) {
				var HTProfileSelect = Foxtrick.getMBElement(doc, 'ddlSearchProfile');
				var tr = Foxtrick.createFeaturedElement(doc, module, 'tr');
				var td = doc.createElement('td');
				td.textContent = HTProfileSelect.title;
				td.colSpan = 3;
				tr.appendChild(td);
				HTProfileRow.parentNode.insertBefore(tr, HTProfileRow.nextSibling);
			}
		};

		/**
		 * @param {HTMLTableElement} table
		 * @param {TSFilter} filter
		 */
		var addNewFilter = function(table, filter) {

			var tr = doc.createElement('tr');
			table.appendChild(tr);

			if (filter.type == 'minmax') {
				let td = doc.createElement('td');
				tr.appendChild(td);
				let strong = doc.createElement('strong');
				strong.textContent = Foxtrick.L10n.getString(`${module.MODULE_NAME}.${filter.key}`);
				td.appendChild(strong);

				{
					let td = doc.createElement('td');
					td.colSpan = 2;
					td.textContent = Foxtrick.L10n.getString('Filters.minimum') + '\u00a0';
					tr.appendChild(td);
					let input = doc.createElement('input');
					input.style.width = '90px';
					input.id = `${FILTER_PREFIX}_${filter.key}_min`;
					input.value = String(filter.min);
					td.appendChild(input);
				}

				{
					let td = doc.createElement('td');
					td.colSpan = 2;
					td.textContent = Foxtrick.L10n.getString('Filters.maximum') + '\u00a0';
					tr.appendChild(td);
					let input = doc.createElement('input');
					input.style.width = '90px';
					input.id = `${FILTER_PREFIX}_${filter.key}_max`;
					input.value = String(filter.max);
					td.appendChild(input);
				}
			}
			else if (filter.type == 'skillselect') {
				// element to steal from
				let steal = /** @type {HTMLSelectElement} */
					(Foxtrick.getMBElement(doc, 'ddlSkill1Min'));

				{
					let td = doc.createElement('td');
					tr.appendChild(td);
					let strong = doc.createElement('strong');
					strong.textContent =
						Foxtrick.L10n.getString(`${module.MODULE_NAME}.${filter.key}`);
					td.appendChild(strong);
				}

				{
					let td = doc.createElement('td');
					td.colSpan = 2;
					tr.appendChild(td);
					let select = doc.createElement('select');
					select.id = `${FILTER_PREFIX}_Skills_${filter.key}_min`;
					let optionMin = doc.createElement('option');
					optionMin.textContent = `-- ${Foxtrick.L10n.getString('Filters.minimum')} --`;
					optionMin.value = '-1';
					select.add(optionMin, null);
					for (let i = filter.minAllowed; i < filter.maxAllowed + 1; ++i) {
						let option = doc.createElement('option');
						option.textContent = steal.options[i + 1].textContent;
						option.value = String(i);
						select.add(option, null);
					}
					select.value = String(filter.min);
					td.appendChild(select);
				}

				{
					let td = doc.createElement('td');
					td.colSpan = 2;
					tr.appendChild(td);
					let select = doc.createElement('select');
					select.id = `${FILTER_PREFIX}_Skills_${filter.key}_max`;
					let optionMin = doc.createElement('option');
					optionMin.textContent = `-- ${Foxtrick.L10n.getString('Filters.maximum')} --`;
					optionMin.value = '-1';
					select.add(optionMin, null);
					for (let i = filter.minAllowed; i < filter.maxAllowed + 1; ++i) {
						let option = doc.createElement('option');
						option.textContent = steal.options[i + 1].textContent;
						option.value = String(i);
						select.add(option, null);
					}
					select.value = String(filter.max);
					td.appendChild(select);
				}
			}
			else if (filter.type == 'check') {
				let td = doc.createElement('td');
				td.colSpan = 5;
				tr.appendChild(td);
				let input = doc.createElement('input');
				input.type = 'checkbox';
				input.id = `${FILTER_PREFIX}_${filter.key}_check`;
				if (filter.checked === true)
					input.setAttribute('checked', 'checked');
				td.appendChild(input);
				let label = doc.createElement('label');
				label.textContent = Foxtrick.L10n.getString(`${module.MODULE_NAME}.${filter.key}`);
				label.htmlFor = input.id;
				td.appendChild(label);
			}
		};
		var addExtraFilters = async function() {
			// only show if advanced filters is on
			var check = /** @type {HTMLInputElement} */
				(Foxtrick.getMBElement(doc, 'chkShowAdvanced'));

			if (!check || !check.checked)
				return;

			var tableAdvanced = Foxtrick.getMBElement(doc, 'tblAdvanced') ||
				doc.querySelector('.transfer-search-table');

			if (tableAdvanced === null)
				return;

			var table = Foxtrick.createFeaturedElement(doc, module, 'table');
			table.id = 'ft-ExtraFilters';

			let tr = doc.createElement('tr');
			table.appendChild(tr);
			let td = doc.createElement('td');
			td.setAttribute('colspan', '5');
			tr.appendChild(td);
			let div = doc.createElement('div');
			div.setAttribute('class', 'borderSeparator');
			td.appendChild(div);

			let filters = await getFilters();
			for (let filter of filters)
				addNewFilter(table, filter);

			Foxtrick.insertAfter(table, tableAdvanced);

			let buttonClear = Foxtrick.getButton(doc, 'Clear');
			Foxtrick.onClick(buttonClear, async function() {
				for (let filter of await getFilters()) {
					if (filter.type == 'minmax') {
						/** @type {HTMLInputElement} */
						let min = doc.querySelector(`#${FILTER_PREFIX}_${filter.key}_min`);
						min.value = '';
						filter.min = '';

						/** @type {HTMLInputElement} */
						let max = doc.querySelector(`#${FILTER_PREFIX}_${filter.key}_max`);
						max.value = '';
						filter.max = '';
					}
					else if (filter.type == 'check') {
						/** @type {HTMLInputElement} */
						let check = doc.querySelector(`#${FILTER_PREFIX}_${filter.key}_check`);
						check.removeAttribute('checked');
						check.checked = false;
						filter.checked = false;
					}
					else if (filter.type == 'skillselect') {
						/** @type {HTMLInputElement} */
						let min = doc.querySelector(`#${FILTER_PREFIX}_Skills_${filter.key}_min`);
						min.value = '-1';
						filter.min = -1;

						/** @type {HTMLInputElement} */
						let max = doc.querySelector(`#${FILTER_PREFIX}_Skills_${filter.key}_max`);
						max.value = '-1';
						filter.max = -1;
					}
				}
				await setFilters(filters);
			});

			var buttonSearch = Foxtrick.getButton(doc, 'Search');
			Foxtrick.onClick(buttonSearch, async function(ev) {
				// we can't get to localStore in async mode before the page
				// navigates away in opera so we need some fake click logic;
				// creating a modified event does not work
				// because FF is too stupid to submit with it /facepalm

				if (buttonSearch.getAttribute('x-updated'))
					return;

				// don't submit before we're done
				ev.preventDefault();

				let filters = await getFilters();
				for (let filter of filters) {
					if (filter.type == 'minmax') {
						/** @type {HTMLInputElement} */
						let min = doc.querySelector(`#${FILTER_PREFIX}_${filter.key}_min`);
						if (min.value === '' || isNaN(parseFloat(min.value)))
							filter.min = '';
						else
							filter.min = Number(min.value);

						/** @type {HTMLInputElement} */
						let max = doc.querySelector(`#${FILTER_PREFIX}_${filter.key}_max`);
						if (max.value === '' || isNaN(parseFloat(max.value)))
							filter.max = '';
						else
							filter.max = Number(max.value);
					}
					else if (filter.type == 'check') {
						/** @type {HTMLInputElement} */
						let check = doc.querySelector(`#${FILTER_PREFIX}_${filter.key}_check`);
						filter.checked = Boolean(check.checked);
					}
					else if (filter.type == 'skillselect') {
						/** @type {HTMLInputElement} */
						let min = doc.querySelector(`#${FILTER_PREFIX}_Skills_${filter.key}_min`);
						filter.min = parseInt(min.value, 10);
						if (isNaN(filter.min))
							filter.min = -1;

						/** @type {HTMLInputElement} */
						let max = doc.querySelector(`#${FILTER_PREFIX}_Skills_${filter.key}_max`);
						filter.max = parseInt(max.value, 10);
						if (isNaN(filter.max))
							filter.max = -1;
					}
				}
				await setFilters(filters);

				// ensure reentrancy
				buttonSearch.setAttribute('x-updated', '1');

				// fake click
				buttonSearch.click();
			});
		};

		var filterResults = async function() {
			let filters = await getFilters();
			let playerList = Foxtrick.Pages.TransferSearchResults.getPlayerList(doc);

			// playerList and playerInfos should have the same order,
			// and the same length
			for (let player of playerList) {
				let hide = filters.some((filter) => {
					if (filter.type == 'minmax' &&
						(filter.min !== '' || filter.max !== '')) {
						if (FILTER_FUNC[filter.key](player, filter.min, filter.max))
							return true;
					}
					else if (filter.type == 'skillselect' &&
						(filter.min != -1 || filter.max != -1)) {
						if (FILTER_FUNC[filter.key](player, filter.min, filter.max))
							return true;
					}
					else if (filter.type == 'check') {
						return filter.checked && FILTER_FUNC[filter.key](player, void 0, void 0);
					}

					return false;
				});
				if (hide) {
					let node = player.playerNode, next;
					if ((next = node.nextElementSibling) &&
						Foxtrick.hasClass(next, 'borderSeparator')) {
						// remove separator if exists
						next.remove();
					}

					node.remove();
				}
			}
		};
		if (Foxtrick.isPage(doc, 'transferSearchForm')) {
			addExtraFilters();
			showHTSearchProfileComment();
		}
		else if (Foxtrick.isPage(doc, 'transferSearchResult')) {
			filterResults();
		}
	},
};
