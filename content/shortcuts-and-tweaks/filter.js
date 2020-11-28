/**
 * filter.js
 * add filters to lists
 * @author convinced, LA-MJ
 */

'use strict';

Foxtrick.modules.Filter = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['statsTopPlayers'],
	CSS: Foxtrick.InternalPath + 'resources/css/filter.css',
	OPTIONS: ['ShowOwned'],

	/** @param {document} doc */
	run: function(doc) {
		const module = this;
		var gLastSave = Promise.resolve();

		const MAIN = Foxtrick.getMainIDPrefix();
		const HIDE_FUNC = {
			/**
			 * @param  {string|number} val
			 * @param  {string} category
			 * @return {boolean}
			 */
			category: function(val, category) {
				if (category == 'Filters.noFilter')
					return false;
				if (category == 'Filters.none')
					return val != '';

				return val != category;
			},

			/**
			 * @param  {string|number} val
			 * @param  {string|number} min
			 * @param  {string|number} max
			 * @return {boolean}
			 */
			minmax: function(val, min, max) {
				if (val === null)
					return true;
				if (typeof min == 'number' && val < min)
					return true;
				if (typeof max == 'number' && val > max)
					return true;

				return false;
			},

			/**
			 * @param  {string|number} val
			 * @return {boolean}
			 */
			check: function(val) {
				return !val;
			},
		};

		/**
		 * @typedef FilterNull
		 * @prop {string} key
		 * @prop {false} filtertype
		 */
		/**
		 * @typedef FilterMinMax
		 * @prop {string} key
		 * @prop {'number'|'text'|'days'|'stars'} type
		 * @prop {Record<string, number>} [incPerClass]
		 * @prop {'minmax'} filtertype
		 * @prop {string|number} min
		 * @prop {string|number} max
		 */
		/**
		 * @typedef FilterBool
		 * @prop {string} key
		 * @prop {'number'|'text'|'days'|'stars'} type
		 * @prop {Record<string, number>} [incPerClass]
		 * @prop {'check'} filtertype
		 * @prop {boolean} checked
		 */
		/**
		 * @typedef FilterCategory
		 * @prop {string} key
		 * @prop {'number'|'text'|'days'|'stars'} type
		 * @prop {Record<string, number>} [incPerClass]
		 * @prop {'category'} filtertype
		 * @prop {string} category
		 */
		/**
		 * @typedef {FilterMinMax|FilterBool|FilterCategory|FilterNull} Filter
		 */
		/**
		 * @typedef FilterPage
		 * @prop {string} ctxType
		 * @prop {number} ctxIdx
		 * @prop {string} rowType
		 * @prop {string} cellType
		 * @prop {number} rowStartIdx
		 */
		/**
		 * @typedef PageFilterDef
		 * @prop {FilterPage} toBeFiltered
		 * @prop {{id?: string, insertAfter?: boolean}} [insertFilterWhere]
		 * @prop {Filter[]} filters
		 */

		/**
		 * @type {Record<string, PageFilterDef>}
		 */
		const FILTER_VAL = {
			statsTopPlayers: {
				toBeFiltered: {
					ctxType: 'table',
					ctxIdx: 2,
					rowType: 'tr',
					cellType: 'td',
					rowStartIdx: 1,
				},
				insertFilterWhere: { id: MAIN + 'btnSearch', insertAfter: true },
				filters: [
					/* eslint-disable object-curly-spacing */
					{ key: 'name', 		filtertype: false},
					{ key: 'days', 		filtertype: 'minmax', min: null, max: null,	type: 'days'},
					{ key: 'tsi', 		filtertype: 'minmax', min: null, max: null,	type: 'number'},
					{ key: 'stamina',	filtertype: 'minmax', min: null, max: null,	type: 'number'},
					{ key: 'Form', 		filtertype: 'minmax', min: null, max: null,	type: 'number'},
					{ key: 'XP', 		filtertype: 'minmax', min: null, max: null,	type: 'number'},
					{ key: 'specialty',	filtertype: 'category', category: null, 	type: 'text'},
					{
						key: 'stars',
						filtertype: 'minmax',
						min: null,
						max: null,
						type: 'stars',
						incPerClass: { starWhole: 1, starBig: 5, starHalf: 0.5 },
					},
					/* eslint-enable object-curly-spacing */
				],
			},
		};

		/**
		 * @param  {string} page
		 * @param  {Filter[]} filters
		 * @return {Promise<string>}
		 */
		var saveFilters = async function(page, filters) {
			var k = '';
			try {
				k = await Foxtrick.session.set('filters.' + page, filters);
			}
			catch (e) {
				Foxtrick.catch('Filter')(e);
			}

			return k;
		};

		/**
		 * @param  {string} page
		 * @return {Promise<Filter[]>}
		 */
		var getFilters = async function(page) {
			/** @type {Filter[]} */
			var saved = null;
			try {
				saved = await Foxtrick.session.get('filters.' + page);
			}
			catch (e) {
				Foxtrick.catch('Filter')(e);
			}

			if (saved)
				return saved;

			// set default filters if not set
			let defFilter = FILTER_VAL[page].filters;
			await saveFilters(page, defFilter);
			return defFilter;
		};

		/**
		 * @param  {string} page
		 * @return {Listener<HTMLInputElement, MouseEvent>}
		 */
		var clearFilters = function(page) {
			return async function() {
				// eslint-disable-next-line no-invalid-this
				var doc = this.ownerDocument;

				for (let filter of await getFilters(page)) {
					if (!filter.filtertype)
						continue;

					switch (filter.filtertype) {
						case 'minmax':
							filter.min = null;
							filter.max = null;
							['min', 'max'].forEach((type) => {
								let idSelector = `Filters.${filter.key}.${type}`;

								/** @type {HTMLInputElement} */
								let input = doc.querySelector(`#${CSS.escape(idSelector)}`);
								input.value = '';
							});
							break;

						case 'check':
							filter.checked = false;

							{
								let idSelector = `Filters.${filter.key}.check`;

								/** @type {HTMLInputElement} */
								let input = doc.querySelector(`#${CSS.escape(idSelector)}`);
								input.checked = false;
								input.removeAttribute('checked');
							}
							break;

						case 'category':
							filter.category = null;

							{
								let idSelector = `Filters.${filter.key}.category`;

								/** @type {HTMLSelectElement} */
								let select = doc.querySelector(`#${CSS.escape(idSelector)}`);
								select.selectedIndex = 0;
							}
							break;

						default:
							Foxtrick.log(new Error('not implemented'));
					}
				}
			};
		};


		/**
		 * @param  {string} page
		 * @return {Listener<HTMLInputElement|HTMLSelectElement, FocusEvent>}
		 */
		var saveValues = function(page) {
			return async function() {
				let { resolve, promise } = Foxtrick.deferred();
				gLastSave = promise;

				var filters = await getFilters(page);

				let value = null;
				// eslint-disable-next-line consistent-this, no-invalid-this
				let input = this;

				if (input instanceof HTMLSelectElement) {
					value = input.options[input.selectedIndex].value;
				}
				else if (input.type == 'text') {
					if (input.value != '' && !Number.isNaN(Number(input.value)))
						value = Number(input.value);
				}
				else if (input.type == 'checkbox') {
					value = Boolean(input.checked);
				}

				let idxAttr = input.dataset.ftFilterIdx;
				let index = parseInt(idxAttr, 10);
				if (Number.isNaN(index)) {
					Foxtrick.log(new Error(`Unrecognized filter ${idxAttr}`));
					return;
				}

				let prop = input.dataset.ftFilterProp;

				// @ts-ignore
				filters[index][prop] = value;

				await saveFilters(page, filters);
				resolve();
			};
		};

		/**
		 * @param  {HTMLTableElement} table
		 * @param  {string} page
		 * @return {function(Filter, number):void}
		 */
		var addNewFilter = function(table, page) {
			var save = saveValues(page);

			// eslint-disable-next-line complexity
			return function(filter, idx) {
				if (!filter.filtertype)
					return;

				var doc = table.ownerDocument;
				var tr = doc.createElement('tr');
				table.appendChild(tr);

				if (filter.filtertype == 'minmax') {
					let { min, max } = filter;
					{
						let td = doc.createElement('td');
						tr.appendChild(td);
						let strong = doc.createElement('strong');
						strong.textContent = Foxtrick.L10n.getString('Filters.' + filter.key);
						td.appendChild(strong);
					}

					{
						let td = doc.createElement('td');
						td.colSpan = 2;
						td.textContent = Foxtrick.L10n.getString('Filters.minimum') + '\u00a0';
						tr.appendChild(td);
						let input = doc.createElement('input');
						input.style.width = '90px';
						input.id = 'Filters.' + filter.key + '.min';
						input.value = min == null ? '' : String(min);
						input.dataset.ftFilterIdx = String(idx);
						input.dataset.ftFilterProp = 'min';
						Foxtrick.listen(input, 'blur', save, false);
						td.appendChild(input);
					}

					{
						let td = doc.createElement('td');
						td.colSpan = 2;
						td.textContent = Foxtrick.L10n.getString('Filters.maximum') + '\u00a0';
						tr.appendChild(td);
						let input = doc.createElement('input');
						input.style.width = '90px';
						input.id = 'Filters.' + filter.key + '.max';
						input.value = max == null ? '' : String(max);
						input.dataset.ftFilterIdx = String(idx);
						input.dataset.ftFilterProp = 'max';
						Foxtrick.listen(input, 'blur', save, false);
						td.appendChild(input);
					}
				}
				else if (filter.filtertype == 'check') {
					let td = doc.createElement('td');
					td.colSpan = 5;
					tr.appendChild(td);
					let input = doc.createElement('input');
					input.type = 'checkbox';
					input.id = 'Filters.' + filter.key + '.check';
					input.dataset.ftFilterIdx = String(idx);
					input.dataset.ftFilterProp = 'checked';
					if (filter.checked === true)
						input.setAttribute('checked', 'checked');
					Foxtrick.listen(input, 'blur', save, false);
					td.appendChild(input);
					let label = doc.createElement('label');
					label.textContent = Foxtrick.L10n.getString('Filters.' + filter.key);
					label.htmlFor = input.id;
					td.appendChild(label);
				}
				else if (filter.filtertype == 'category') {
					const toBeFiltered = FILTER_VAL[page].toBeFiltered;

					let nodes = doc.querySelectorAll(`#mainBody ${toBeFiltered.ctxType}`);
					let target = nodes[toBeFiltered.ctxIdx];

					if (!target)
						return;

					let list = target.querySelectorAll(toBeFiltered.rowType);
					if (!list)
						return;

					/** @type {Record<string, boolean>} */
					let categories = {};
					for (let i = toBeFiltered.rowStartIdx; i < list.length; ++i) {
						let cell = list[i].querySelectorAll(toBeFiltered.cellType);
						if (cell[idx].textContent)
							categories[cell[idx].textContent] = true;
						else
							categories[Foxtrick.L10n.getString('Filters.none')] = true;
					}

					{
						let td = doc.createElement('td');
						tr.appendChild(td);
						let strong = doc.createElement('strong');
						strong.textContent = Foxtrick.L10n.getString('Filters.' + filter.key);
						td.appendChild(strong);
					}

					{
						let td = doc.createElement('td');
						td.colSpan = 2;
						tr.appendChild(td);

						let select = doc.createElement('select');
						select.id = 'Filters.' + filter.key + '.category';
						select.dataset.ftFilterIdx = String(idx);
						select.dataset.ftFilterProp = 'category';
						let option = doc.createElement('option');
						option.textContent = Foxtrick.L10n.getString('Filters.noFilter');
						option.value = 'Filters.noFilter';
						select.appendChild(option);

						for (let i in categories) {
							let option = doc.createElement('option');
							option.textContent = i;
							if (i == Foxtrick.L10n.getString('Filters.none'))
								option.value = 'Filters.none';
							else
								option.value = i;

							select.appendChild(option);
						}
						if (filter.category) {
							for (let [i, opt] of [...select.options].entries()) {
								if (opt.value == filter.category) {
									select.selectedIndex = i;
									break;
								}
							}
						}
						Foxtrick.listen(select, 'blur', save, false);
						td.appendChild(select);
					}

					{
						let td = doc.createElement('td');
						td.colSpan = 2;
						tr.appendChild(td);
					}
				}

			};
		};

		/** @type {Listener<HTMLInputElement, MouseEvent>} */
		// eslint-disable-next-line complexity
		var filterResults = async function() {
			// eslint-disable-next-line no-invalid-this, consistent-this
			var input = this;
			var doc = input.ownerDocument;
			var page = input.dataset.ftFilterPage;

			await gLastSave;
			var filters = await getFilters(page);
			try {
				var rows = null;
				const toBeFiltered = FILTER_VAL[page].toBeFiltered;

				if (toBeFiltered.ctxType) {
					let nodes = doc.querySelectorAll(`#mainBody ${toBeFiltered.ctxType}`);
					rows = nodes[toBeFiltered.ctxIdx].querySelectorAll(toBeFiltered.rowType);
				}

				if (!rows)
					return;

				for (let i = toBeFiltered.rowStartIdx; i < rows.length; ++i) {
					let row = rows[i];
					Foxtrick.removeClass(row, 'hidden');

					let cells = row.querySelectorAll(toBeFiltered.cellType);
					let hide = false;

					for (let [j, filter] of filters.entries()) {
						if (!filter.filtertype)
							continue;

						let cell = cells[j];

						let val = null;
						if (filter.type == 'number') {
							val = Foxtrick.trimnum(cell.textContent);
						}
						else if (filter.type == 'days') {
							val = parseInt(cell.textContent.match(/\((\d+)\)/)[1], 10);
						}
						else if (filter.type == 'text') {
							val = cell.textContent;
						}
						else if (filter.type == 'stars') {
							val = 0;

							let stars = cell.querySelector('.stars');
							if (stars) {
								val = parseFloat(stars.textContent.trim()) || 0;
							}
							else {
								let imgs = cell.querySelectorAll('img');
								for (let img of imgs) {
									/* eslint-disable max-depth */
									for (let searchStr in filter.incPerClass) {
										if (new RegExp(searchStr).test(img.className))
											val += filter.incPerClass[searchStr];
									}
									/* eslint-enable max-depth */
								}
							}
						}

						if (val === null) {
							continue;
						}
						else if (filter.filtertype == 'minmax' &&
							(filter.min != null || filter.max != null)) {

							let func = HIDE_FUNC[filter.filtertype];
							if (func(val, filter.min, filter.max))
								hide = true;

						}
						else if (filter.filtertype == 'check') {
							let func = HIDE_FUNC[filter.filtertype];
							if (filter.checked && func(val))
								hide = true;
						}
						else if (filter.filtertype == 'category') {
							let func = HIDE_FUNC[filter.filtertype];
							if (filter.category && func(val, filter.category))
								hide = true;
						}

						if (hide) {
							Foxtrick.addClass(row, 'hidden');
							break;
						}
					}
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		/**
		 * @param  {string} page
		 * @return {Promise<void>}
		 */
		var addExtraFilters = async function(page) {
			var filters = await getFilters(page);

			let insertBefore = null;
			if (FILTER_VAL[page].insertFilterWhere && FILTER_VAL[page].insertFilterWhere.id) {
				insertBefore = doc.getElementById(FILTER_VAL[page].insertFilterWhere.id);
				if (FILTER_VAL[page].insertFilterWhere.insertAfter)
					insertBefore = insertBefore.nextSibling;
			}
			if (!insertBefore)
				return;

			var filterdiv = Foxtrick.createFeaturedElement(doc, module, 'div');
			insertBefore.parentNode.insertBefore(filterdiv, insertBefore);

			let h2 = doc.createElement('h2');
			h2.textContent = Foxtrick.L10n.getString('Filters.label');
			filterdiv.appendChild(h2);

			var table = doc.createElement('table');
			filterdiv.appendChild(table);

			const toBeFiltered = FILTER_VAL[page].toBeFiltered;
			let nodes = doc.querySelectorAll(`#mainBody ${toBeFiltered.ctxType}`);
			let target = nodes[toBeFiltered.ctxIdx];
			if (!target) {
				Foxtrick.addClass(filterdiv, 'hidden');
				return;
			}

			let tr = doc.createElement('tr');
			table.appendChild(tr);
			let td = doc.createElement('td');
			td.colSpan = 5;
			tr.appendChild(td);

			filters.forEach(addNewFilter(table, page));

			let buttonFilter = doc.createElement('input');
			buttonFilter.type = 'button';
			buttonFilter.value = Foxtrick.L10n.getString('Filters.ok');
			buttonFilter.dataset.ftFilterPage = page;
			filterdiv.appendChild(buttonFilter);
			Foxtrick.onClick(buttonFilter, filterResults);

			let buttonClear = doc.createElement('input');
			buttonClear.type = 'button';
			buttonClear.value = Foxtrick.L10n.getString('Filters.clear');
			filterdiv.appendChild(buttonClear);

			Foxtrick.onClick(buttonClear, clearFilters(page));
		};

		for (let page of /** @type {PAGE[]} */ (module.PAGES)) {
			if (Foxtrick.isPage(doc, page))
				addExtraFilters(page);
		}

		if (Foxtrick.isPage(doc, 'statsTopPlayers')) {
			if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'ShowOwned'))
				module.showOwned(doc);
		}
	},

	/**
	 * Highlight players of the logged in manager in Top Players stats page
	 * @author tasosventouris
	 * @param  {document} doc
	 */
	showOwned: function(doc) {
		const module = this;
		const teamId = Foxtrick.modules.Core.TEAM.teamId;

		/** @type {CHPPParams} */
		const args = [
			['file', 'players'],
			['version', '2.2'],
			['teamId', teamId],
		];

		Foxtrick.util.api.retrieve(doc, args, { cache: 'session' }, (xml, errorText) => {
			if (!xml || errorText) {
				Foxtrick.log(errorText);
				return;
			}

			let ids = new Set([...xml.getElementsByTagName('PlayerID')].map(n => n.textContent));

			let playerLinks = doc.getElementById('mainBody').getElementsByTagName('a');
			for (let playerLink of playerLinks) {
				let player = Foxtrick.getUrlParam(playerLink.href, 'playerId');
				if (player && ids.has(player)) {
					let row = playerLink.parentElement.parentElement;
					Foxtrick.addClass(row, 'ft-top-players-owner');
					Foxtrick.makeFeaturedElement(row, module);
				}
			}
		});

	},
};
