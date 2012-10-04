'use strict';
/**
 * filter.js
 * add filters to lists
 * @author convinced
 */

Foxtrick.modules['Filter'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['statsTopPlayers'],

	run: function(doc) {
		var FILTER_FUNC = {
			'category': function(val, category) {
				if (category == 'Filters.noFilter')
					return false;
				else if (category == 'Filters.none')
					return val != '';
				return val != category;
			},
			'minmax': function(val, min, max) {
				if (val === null)
					return true;
				if (typeof(min) == 'number' && val < min)
					return true;
				if (typeof(max) == 'number' && val > max)
					return true;
				return false;
			}
		};

		// default filter values
		var FILTER_VAL = {
			'statsTopPlayers':
			{
				toBeFiltered: { nodeName: 'table', index: 2, rowType: 'tr', cellType: 'td',
					rowStartIndex: 1 },
				insertFilterWhere: {id: 'ctl00_ctl00_CPContent_CPMain_btnSearch', insertAfter: true},
				filters: [
					{ key: 'name', 		filtertype: null},
					{ key: 'days', 		filtertype: 'minmax', min: null, max: null,	type: 'days'},
					{ key: 'tsi', 		filtertype: 'minmax', min: null, max: null,	type: 'number'},
					{ key: 'stamina',	filtertype: 'minmax', min: null, max: null,	type: 'number'},
					{ key: 'Form', 		filtertype: 'minmax', min: null, max: null,	type: 'number'},
					{ key: 'XP', 		filtertype: 'minmax', min: null, max: null,	type: 'number'},
					{ key: 'specialty',	filtertype: 'category', category: null, 	type: 'text'},
					{
						key: 'stars', 	filtertype: 'minmax', min: null, max: null,	type: 'image',
						incPerClass: { starWhole: 1, starBig: 5, starHalf: 0.5 }
					}
				]
			}
		};
		var getFilters = function(page, callback) {
			Foxtrick.sessionGet('filters.' + page,
			  function(n) {
				try {
					if (n === undefined) {
						// set default filters if not set
						Foxtrick.sessionSet('filters.' + page, FILTER_VAL[page].filters);
						callback(FILTER_VAL[page].filters);
					}
					else {
						callback(n);
					}
				}
				catch (e) {
					Foxtrick.log(e);
				}
			});
		};
		var setFilters = function(page, filters) {
			Foxtrick.sessionSet('filters.' + page, filters);
		};

		var addNewFilter = function(page, table, filters, idx) {
			var saveValues = function(ev) {
				getFilters(page, function(filters) {
					var value = null;
					if (ev.target.type == 'text') {
						if (ev.target.value != '' && !isNaN(ev.target.value))
							value = Number(ev.target.value);
					}
					else if (ev.target.type == 'checkbox')
						value = Boolean(ev.target.checked);
					else if (ev.target.nodeName == 'SELECT')
						value = ev.target.options[ev.target.selectedIndex].value;
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
				var td = doc.createElement('td');
				tr.appendChild(td);
				var strong = doc.createElement('strong');
				strong.textContent = Foxtrickl10n.getString('Filters.' + filter.key);
				td.appendChild(strong);

				var td = doc.createElement('td');
				td.colSpan = 2;
				td.textContent = Foxtrickl10n.getString('Filters.minimum') + '\u00a0';
				tr.appendChild(td);
				var input = doc.createElement('input');
				input.style.width = '90px';
				input.id = 'Filters.' + filter.key + '.min';
				input.value = filter.min;
				input.setAttribute('x-ft-filter-idx', idx);
				input.setAttribute('x-ft-filter-prop', 'min');
				Foxtrick.listen(input, 'blur', saveValues, false);
				td.appendChild(input);

				var td = doc.createElement('td');
				td.colSpan = 2;
				td.textContent = Foxtrickl10n.getString('Filters.maximum') + '\u00a0';
				tr.appendChild(td);
				var input = doc.createElement('input');
				input.style.width = '90px';
				input.id = 'Filters.' + filter.key + '.max';
				input.value = filter.max;
				input.setAttribute('x-ft-filter-idx', idx);
				input.setAttribute('x-ft-filter-prop', 'max');
				Foxtrick.listen(input, 'blur', saveValues, false);
				td.appendChild(input);
			}
			else if (filter.filtertype == 'check') {
				var td = doc.createElement('td');
				td.colSpan = 5;
				tr.appendChild(td);
				var input = doc.createElement('input');
				input.type = 'checkbox';
				input.id = 'Filters.' + filter.key + '.check';
				input.setAttribute('x-ft-filter-idx', idx);
				input.setAttribute('x-ft-filter-prop', 'checked');
				if (filter.checked === true)
					input.setAttribute('checked', 'checked');
				Foxtrick.listen(input, 'blur', saveValues, false);
				td.appendChild(input);
				var label = doc.createElement('label');
				label.textContent = Foxtrickl10n.getString('Filters.' + filter.key);
				label.htmlFor = input.id;
				td.appendChild(label);
			}
			else if (filter.filtertype == 'category') {
				var target = doc.getElementById('mainBody')
					.getElementsByTagName(FILTER_VAL[page].toBeFiltered.nodeName)[
					FILTER_VAL[page].toBeFiltered.index];

				if (!target)
					return;

				var list = target.getElementsByTagName(FILTER_VAL[page].toBeFiltered.rowType);
				if (!list)
					return;

				var categories = {};
				for (var i = FILTER_VAL[page].toBeFiltered.rowStartIndex; i < list.length; ++i) {
					var cell = list[i].getElementsByTagName(FILTER_VAL[page].toBeFiltered.cellType);
					if (cell[idx].textContent)
						categories[cell[idx].textContent] = true;
					else
						categories[Foxtrickl10n.getString('Filters.none')] = true;
				}

				var td = doc.createElement('td');
				tr.appendChild(td);
				var strong = doc.createElement('strong');
				strong.textContent = Foxtrickl10n.getString('Filters.' + filter.key);
				td.appendChild(strong);

				var td = doc.createElement('td');
				td.colSpan = 2;
				tr.appendChild(td);

				var select = doc.createElement('select');
				select.id = 'Filters.' + filter.key + '.category';
				select.setAttribute('x-ft-filter-idx', idx);
				select.setAttribute('x-ft-filter-prop', 'category');
				var option = doc.createElement('option');
				option.textContent = Foxtrickl10n.getString('Filters.noFilter');
				option.value = 'Filters.noFilter';
				select.appendChild(option);

				for (var i in categories) {
					var option = doc.createElement('option');
					option.textContent = i;
					if (i == Foxtrickl10n.getString('Filters.none'))
						option.value = 'Filters.none';
					else
						option.value = i;
					select.appendChild(option);
				}
				if (filter.category) {
					for (var i = 0; i < select.options.length; ++i) {
						if (select.options[i].value == filter.category) {
							select.selectedIndex = i;
							break;
						}
					}
				}
				Foxtrick.listen(select, 'blur', saveValues, false);
				td.appendChild(select);

				var td = doc.createElement('td');
				td.colSpan = 2;
				tr.appendChild(td);
			}

		};
		var addExtraFilters = function(page) {
			getFilters(page, function(filters) {
				var insertBefore = null;
				if (FILTER_VAL[page].insertFilterWhere && FILTER_VAL[page].insertFilterWhere.id) {
					insertBefore = doc.getElementById(FILTER_VAL[page].insertFilterWhere.id);
					if (FILTER_VAL[page].insertFilterWhere.insertAfter)
						insertBefore = insertBefore.nextSibling;
				}
				if (!insertBefore)
					return;

				var filterdiv = doc.createElement('div');
				insertBefore.parentNode.insertBefore(filterdiv, insertBefore);

				var h2 = doc.createElement('h2');
				h2.textContent = Foxtrickl10n.getString('Filters.label');
				filterdiv.appendChild(h2);

				var table = doc.createElement('table');
				filterdiv.appendChild(table);

				var target = doc.getElementById('mainBody')
					.getElementsByTagName(FILTER_VAL[page].toBeFiltered.nodeName)[
					FILTER_VAL[page].toBeFiltered.index];

				if (!target) {
					Foxtrick.addClass(filterdiv, 'hidden');
					return;
				}

				var tr = doc.createElement('tr');
				table.appendChild(tr);
				var td = doc.createElement('td');
				td.setAttribute('colspan', '5');
				tr.appendChild(td);

				for (var j = 0; j < filters.length; ++j) {
					addNewFilter(page, table, filters, j);
				}

				var buttonFilter = doc.createElement('input');
				buttonFilter.type = 'button';
				buttonFilter.value = Foxtrickl10n.getString('Filters.ok');
				buttonFilter.setAttribute('page', page);
				filterdiv.appendChild(buttonFilter);
				Foxtrick.onClick(buttonFilter, filterResults);

				var buttonClear = doc.createElement('input');
				buttonClear.type = 'button';
				buttonClear.value = Foxtrickl10n.getString('Filters.clear');
				filterdiv.appendChild(buttonClear);
				Foxtrick.onClick(buttonClear, function() {
					getFilters(page, function(filters) {
						for (var j = 0; j < filters.length; ++j) {
							var filter = filters[j];
							if (filter.filtertype == 'minmax') {
								filters[j].min = null;
								doc.getElementById('Filters.' + filter.key + '.min').value = '';
								filters[j].max = null;
								doc.getElementById('Filters.' + filter.key + '.max').value = '';
							}
							else if (filter.filtertype == 'check') {
								filters[j].checked = false;
								doc.getElementById('Filters.' + filter.key + '.check')
									.removeAttribute('checked');
							}
							else if (filter.filtertype == 'category') {
								filters[j].category = null;
								doc.getElementById('Filters.' + filter.key + '.category')
									.selectedIndex = 0;
							}
						}
					});
				});
			});
		};
		var filterResults = function(ev) {
			var page = ev.target.getAttribute('page');
			getFilters(page,
			  function(filters) {
				try {
					var list = null;
					if (FILTER_VAL[page].toBeFiltered.nodeName) {
						list = doc.getElementById('mainBody')
							.getElementsByTagName(FILTER_VAL[page].toBeFiltered.nodeName)[
							FILTER_VAL[page].toBeFiltered.index]
								.getElementsByTagName(FILTER_VAL[page].toBeFiltered.rowType);
					}
					if (!list)
						return;

					for (var i = FILTER_VAL[page].toBeFiltered.rowStartIndex; i < list.length; ++i) {
						var cell = list[i].getElementsByTagName(FILTER_VAL[page].toBeFiltered
						                                        .cellType);
						Foxtrick.removeClass(list[i], 'hidden');
						var hide = false;
						for (var j = 0; j < filters.length; ++j) {
							var filter = filters[j];

							var val = null;
							if (filter.type == 'number')
								val = Foxtrick.trimnum(cell[j].textContent);
							else if (filter.type == 'days')
								val = cell[j].textContent.match(/\((\d+)\)/)[1];
							else if (filter.type == 'text')
								val = cell[j].textContent;
							else if (filter.type == 'image') {
								var imgs = cell[j].getElementsByTagName('img');
								val = 0;
								for (var k = 0; k < imgs.length; ++k) {
									for (var searchStr in filter.incPerClass) {
										/*Foxtrick.log(imgs[k].className, searchStr,
										            imgs[k].src.search(RegExp(searchStr)),
													filter.incPerClass[searchStr], val );*/
										if (imgs[k].className.search(RegExp(searchStr)) != -1)
											val += filter.incPerClass[searchStr];
									}
								}
							}

							if (val === null || !filter.filtertype)
								continue;
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
				} catch (e) {
					Foxtrick.log(e);
				}
			});
		};

		for (var i = 0; i < this.PAGES.length; ++i) {
			if (Foxtrick.isPage(this.PAGES[i], doc)) {
				addExtraFilters(this.PAGES[i]);
			}
		}
	}
};
