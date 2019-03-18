/**
 * filter.js
 * add filters to lists
 * @author convinced
 */

'use strict';

Foxtrick.modules['Filter'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['statsTopPlayers'],
	CSS: Foxtrick.InternalPath + 'resources/css/filter.css',
	OPTIONS: ['ShowOwned'],

	/** @param {document} doc */
	run: function(doc) {
		const module = this;
		const MAIN = Foxtrick.getMainIDPrefix();
		var FILTER_FUNC = {
			category: function(val, category) {
				if (category == 'Filters.noFilter')
					return false;
				else if (category == 'Filters.none')
					return val != '';
				return val != category;
			},
			minmax: function(val, min, max) {
				if (val === null)
					return true;
				if (typeof min == 'number' && val < min)
					return true;
				if (typeof max == 'number' && val > max)
					return true;
				return false;
			},
		};

		// default filter values
		var FILTER_VAL = {
			statsTopPlayers:
			{
				toBeFiltered: {
					nodeName: 'table',
					index: 2,
					rowType: 'tr',
					cellType: 'td',
					rowStartIndex: 1,
				},
				insertFilterWhere: { id: MAIN + 'btnSearch', insertAfter: true },
				filters: [
					{ key: 'name', filtertype: null },
					{ key: 'days', filtertype: 'minmax', min: null, max: null, type: 'days' },
					{ key: 'tsi', filtertype: 'minmax', min: null, max: null, type: 'number' },
					{ key: 'stamina', filtertype: 'minmax', min: null, max: null, type: 'number' },
					{ key: 'Form', filtertype: 'minmax', min: null, max: null, type: 'number' },
					{ key: 'XP', filtertype: 'minmax', min: null, max: null, type: 'number' },
					{ key: 'specialty',	filtertype: 'category', category: null, type: 'text' },
					{
						key: 'stars',
						filtertype: 'minmax',
						min: null,
						max: null,
						type: 'image',
						incPerClass: { starWhole: 1, starBig: 5, starHalf: 0.5 },
					},
				],
			},
		};
		var getFilters = function(page, callback) {
			Foxtrick.sessionGet('filters.' + page, (n) => {
				try {
					if (n) {
						callback(n);
						return;
					}

					// set default filters if not set
					Foxtrick.sessionSet('filters.' + page, FILTER_VAL[page].filters);
					// eslint-disable-next-line callback-return
					callback(FILTER_VAL[page].filters);
				}
				catch (e) {
					Foxtrick.log(e);
				}
			});
		};
		var setFilters = function(page, filters) {
			Foxtrick.sessionSet('filters.' + page, filters);
		};

		// eslint-disable-next-line complexity
		var addNewFilter = function(page, table, filters, idx) {
			var saveValues = function(ev) {
				getFilters(page, function(filters) {
					var value = null;
					if (ev.target.type == 'text') {
						if (ev.target.value != '' && !isNaN(ev.target.value))
							value = Number(ev.target.value);
					}
					else if (ev.target.type == 'checkbox') {
						value = Boolean(ev.target.checked);
					}
					else if (ev.target.nodeName == 'SELECT') {
						value = ev.target.options[ev.target.selectedIndex].value;
					}
					var index = ev.target.getAttribute('x-ft-filter-idx');
					var prop = ev.target.getAttribute('x-ft-filter-prop');
					filters[index][prop] = value;
					setFilters(page, filters);
				});
			};

			var filter = filters[idx];

			var tr = doc.createElement('tr');
			table.appendChild(tr);

			if (filter.filtertype == 'minmax') {
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
					input.value = filter.min;
					input.setAttribute('x-ft-filter-idx', idx);
					input.setAttribute('x-ft-filter-prop', 'min');
					Foxtrick.listen(input, 'blur', saveValues, false);
					td.appendChild(input);
				}

				let td = doc.createElement('td');
				td.colSpan = 2;
				td.textContent = Foxtrick.L10n.getString('Filters.maximum') + '\u00a0';
				tr.appendChild(td);
				let input = doc.createElement('input');
				input.style.width = '90px';
				input.id = 'Filters.' + filter.key + '.max';
				input.value = filter.max;
				input.setAttribute('x-ft-filter-idx', idx);
				input.setAttribute('x-ft-filter-prop', 'max');
				Foxtrick.listen(input, 'blur', saveValues, false);
				td.appendChild(input);
			}
			else if (filter.filtertype == 'check') {
				let td = doc.createElement('td');
				td.colSpan = 5;
				tr.appendChild(td);
				let input = doc.createElement('input');
				input.type = 'checkbox';
				input.id = 'Filters.' + filter.key + '.check';
				input.setAttribute('x-ft-filter-idx', idx);
				input.setAttribute('x-ft-filter-prop', 'checked');
				if (filter.checked === true)
					input.setAttribute('checked', 'checked');
				Foxtrick.listen(input, 'blur', saveValues, false);
				td.appendChild(input);
				let label = doc.createElement('label');
				label.textContent = Foxtrick.L10n.getString('Filters.' + filter.key);
				label.htmlFor = input.id;
				td.appendChild(label);
			}
			else if (filter.filtertype == 'category') {
				let toBeFiltered = FILTER_VAL[page].toBeFiltered;
				let { nodeName, index, rowType, rowStartIndex, cellType } = toBeFiltered;

				let target = doc.querySelectorAll(`#mainBody ${nodeName}`)[index];
				if (!target)
					return;

				let list = target.getElementsByTagName(rowType);
				if (!list)
					return;

				let categories = {};
				for (let i = rowStartIndex; i < list.length; ++i) {
					let item = list[i];
					let cells = item.getElementsByTagName(cellType);
					let cell = cells[idx];
					if (cell.textContent)
						categories[cell.textContent] = true;
					else
						categories[Foxtrick.L10n.getString('Filters.none')] = true;
				}

				let td = doc.createElement('td');
				tr.appendChild(td);
				let strong = doc.createElement('strong');
				strong.textContent = Foxtrick.L10n.getString('Filters.' + filter.key);
				td.appendChild(strong);

				{
					let td = doc.createElement('td');
					td.colSpan = 2;
					tr.appendChild(td);
				}

				let select = doc.createElement('select');
				select.id = 'Filters.' + filter.key + '.category';
				select.setAttribute('x-ft-filter-idx', idx);
				select.setAttribute('x-ft-filter-prop', 'category');
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
					for (let [i, option] of [...select.options].entries()) {
						if (option.value == filter.category) {
							select.selectedIndex = i;
							break;
						}
					}
				}
				Foxtrick.listen(select, 'blur', saveValues, false);
				td.appendChild(select);

				{
					let td = doc.createElement('td');
					td.colSpan = 2;
					tr.appendChild(td);
				}
			}

		};
		var addExtraFilters = function(page) {
			getFilters(page, function(filters) {
				var insertBefore = null;
				let insertFilterWhere = FILTER_VAL[page].insertFilterWhere;
				if (insertFilterWhere && insertFilterWhere.id) {
					insertBefore = doc.getElementById(insertFilterWhere.id);
					if (insertFilterWhere.insertAfter)
						insertBefore = insertBefore.nextSibling;
				}
				if (!insertBefore)
					return;

				var filterdiv = Foxtrick.createFeaturedElement(doc, module, 'div');
				insertBefore.parentNode.insertBefore(filterdiv, insertBefore);

				var h2 = doc.createElement('h2');
				h2.textContent = Foxtrick.L10n.getString('Filters.label');
				filterdiv.appendChild(h2);

				var table = doc.createElement('table');
				filterdiv.appendChild(table);

				let toBeFiltered = FILTER_VAL[page].toBeFiltered;
				let { nodeName, index } = toBeFiltered;

				var target = doc.querySelectorAll(`#mainBody ${nodeName}`)[index];
				if (!target) {
					Foxtrick.addClass(filterdiv, 'hidden');
					return;
				}

				var tr = doc.createElement('tr');
				table.appendChild(tr);
				var td = doc.createElement('td');
				td.setAttribute('colspan', '5');
				tr.appendChild(td);

				for (var j = 0; j < filters.length; ++j)
					addNewFilter(page, table, filters, j);

				var buttonFilter = doc.createElement('input');
				buttonFilter.type = 'button';
				buttonFilter.value = Foxtrick.L10n.getString('Filters.ok');
				buttonFilter.setAttribute('page', page);
				filterdiv.appendChild(buttonFilter);
				// eslint-disable-next-line no-use-before-define
				Foxtrick.onClick(buttonFilter, filterResults);

				var buttonClear = doc.createElement('input');
				buttonClear.type = 'button';
				buttonClear.value = Foxtrick.L10n.getString('Filters.clear');
				filterdiv.appendChild(buttonClear);
				Foxtrick.onClick(buttonClear, function() {
					getFilters(page, function(filters) {
						for (let filter of filters) {
							if (filter.filtertype == 'minmax') {
								filter.min = null;
								filter.max = null;

								/** @type {HTMLInputElement} */
								let input = doc.querySelector(`#Filters.${filter.key}.min`);
								input.value = '';
								input = doc.querySelector(`#Filters.${filter.key}.max`);
								input.value = '';
							}
							else if (filter.filtertype == 'check') {
								filter.checked = false;
								doc.getElementById('Filters.' + filter.key + '.check')
									.removeAttribute('checked');
							}
							else if (filter.filtertype == 'category') {
								filter.category = null;

								/** @type {HTMLSelectElement} */
								let select = doc.querySelector(`#Filters.${filter.key}.category`);
								select.selectedIndex = 0;
							}
						}
					});
				});
			});
		};
		var filterResults = function(ev) {
			var page = ev.target.getAttribute('page');
			// eslint-disable-next-line complexity
			getFilters(page, (filters) => {
				try {
					var list = null;
					let toBeFiltered = FILTER_VAL[page].toBeFiltered;
					if (toBeFiltered.nodeName) {
						let { nodeName, index, rowType } = toBeFiltered;
						let node = doc.querySelectorAll(`#mainBody ${nodeName}`)[index];
						list = node.querySelectorAll(rowType);
					}

					if (!list)
						return;

					for (let i = toBeFiltered.rowStartIndex; i < list.length; ++i) {
						let cells = list[i].getElementsByTagName(toBeFiltered.cellType);
						Foxtrick.removeClass(list[i], 'hidden');
						let hide = false;
						for (let [j, filter] of filters.entries()) {
							let cell = cells[j];
							let val = null;
							if (filter.type == 'number') {
								val = Foxtrick.trimnum(cell.textContent);
							}
							else if (filter.type == 'days') {
								val = cell.textContent.match(/\((\d+)\)/)[1];
							}
							else if (filter.type == 'text') {
								val = cell.textContent;
							}
							else if (filter.type == 'image') {
								val = 0;
								let imgs = cell.querySelectorAll('img');
								for (let img of imgs) {
									for (let searchStr in filter.incPerClass) {
										// eslint-disable-next-line max-depth
										if (new RegExp(searchStr).test(img.className))
											val += filter.incPerClass[searchStr];
									}
								}
							}

							if (val === null || !filter.filtertype) {
								continue;
							}
							else if (filter.filtertype == 'minmax' && (filter.min != null ||
							         filter.max != null)) {
								if (FILTER_FUNC[filter.filtertype](val, filter.min, filter.max))
									hide = true;
							}
							else if (filter.filtertype == 'check') {
								if (filter.checked && FILTER_FUNC[filter.filtertype](val))
									hide = true;
							}
							else if (filter.filtertype == 'category') {
								if (filter.category && FILTER_FUNC[filter.filtertype](val,
								    filter.category))
									hide = true;
							}

							if (hide) {
								Foxtrick.addClass(list[i], 'hidden');
								break;
							}
						}
					}
				}
				catch (e) {
					Foxtrick.log(e);
				}
			});
		};

		for (let i = 0; i < this.PAGES.length; ++i) {
			if (Foxtrick.isPage(doc, this.PAGES[i]))
				addExtraFilters(this.PAGES[i]);
		}

		if (Foxtrick.isPage(doc, 'statsTopPlayers')) {
			if (Foxtrick.Prefs.isModuleOptionEnabled('Filter', 'ShowOwned'))
				this.showOwned(doc);
		}
	},

	/**
	 * Highlight players of the logged in manager in Top Players stats page
	 * @author tasosventouris
	 * @param  {document} doc
	 */
	showOwned: function(doc) {

		var teamId = Foxtrick.modules.Core.TEAM.teamId;
		var ids = [];

		let args = [
			['file', 'players'],
			['version', '2.2'],
			['teamId', teamId],
		];

		Foxtrick.util.api.retrieve(doc, args, { cache: 'session' }, (xml, errorText) => {
			if (!xml || errorText) {
				Foxtrick.log(errorText);
				return;
			}

			let all = xml.getElementsByTagName('PlayerID');
			for (let p of all)
				ids.push(p.textContent);

			/** @type {NodeListOf<HTMLAnchorElement>} */
			let allPlayers = doc.querySelectorAll('#mainBody a');
			for (let player of allPlayers) {
				let pId = Foxtrick.getUrlParam(player.href, 'playerId');
				if (pId && ids.indexOf(pId) >= 0) {
					// eslint-disable-next-line no-extra-parens
					let row = /** @type {HTMLElement} */ (player.parentNode.parentNode);
					Foxtrick.addClass(row, 'ft-top-players-owner');
					Foxtrick.makeFeaturedElement(row, Foxtrick.modules.TopPlayersOwner);
				}
			}
		});

	},
};
