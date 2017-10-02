'use strict';
/**
 * transfer-search-result-filters.js
 * Transfer list filters
 * @author convincedd, ryanli, LA-MJ
 */

Foxtrick.modules['TransferSearchResultFilters'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['transferSearchForm', 'transferSearchResult'],
	NICE: -1, // before TransferDeadline and HTMSPoints

	run: function(doc) {
		var filterIdPrefix = 'FoxtrickTransferSearchResultFilters.';
		// functions returning whether to hide a player
		// need to check availablility of a certain property first since they
		// may not be available for players just sold
		var FILTER_FUNC = {
			'hideBruised': function(player, checked) {
				if (player.bruised == null)
					return true;
				return player.bruised;
			},
			'hideInjured': function(player, checked) {
				if (player.injured == null)
					return true;
				return player.injured;
			},
			'hideSuspended': function(player, checked) {
				if (player.redCard == null)
					return true;
				return player.redCard == 1;
			},
			'days': function(player, min, max) {
				if (player.age == null)
					return true;
				if (typeof min == 'number' && player.age.days < min)
					return true;
				if (typeof max == 'number' && player.age.days > max)
					return true;
				return false;
			},
			'form': function(player, min, max) {
				if (player.form == null)
					return true;
				if (typeof min == 'number' && min !== -1 && player.form < min)
					return true;
				if (typeof max == 'number' && max !== -1 && player.form > max)
					return true;
				return false;
			},
			'hideOrdinary': function(player, checked) {
				if (player.speciality == null)
					return true;
				return (player.speciality == '');
			}
		};
		// default filter values
		var FILTER_VAL = [
			{ key: 'form', type: 'skillselect', min: -1, max: -1, minAllowed: 0, maxAllowed: 8 },
			{ key: 'days', type: 'minmax', min: '', max: '' },
			{ key: 'hideOrdinary', type: 'check', checked: false },
			{ key: 'hideInjured', type: 'check', checked: false },
			{ key: 'hideSuspended', type: 'check', checked: false },
			{ key: 'hideBruised', type: 'check', checked: false }
		];
		var getFilters = function(callback) {
			Foxtrick.sessionGet('transfer-search-result-filters',
			  function(n) {
				try {
					if (!n) {
						// set default filters if not set
						Foxtrick.sessionSet('transfer-search-result-filters', FILTER_VAL);
						callback(FILTER_VAL);
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
		var setFilters = function(filters) {
			Foxtrick.sessionSet('transfer-search-result-filters', filters);
		};
		var showHTSearchProfileComment = function() {
			var HTProfileRow = Foxtrick.getMBElement(doc, 'rowProfiles');
			if (HTProfileRow) {
				var HTProfileSelect = Foxtrick.getMBElement(doc, 'ddlSearchProfile');
				var tr = Foxtrick.createFeaturedElement(doc,
					Foxtrick.modules.TransferSearchResultFilters, 'tr');
				var td = doc.createElement('td');
				td.textContent = HTProfileSelect.title;
				td.colSpan = '3';
				tr.appendChild(td);
				HTProfileRow.parentNode.insertBefore(tr, HTProfileRow.nextSibling);
			}
		};
		var addNewFilter = function(table, filters, idx) {

			var filter = filters[idx];

			var tr = doc.createElement('tr');
			table.appendChild(tr);

			if (filter.type == 'minmax') {
				var td = doc.createElement('td');
				tr.appendChild(td);
				var strong = doc.createElement('strong');
				strong.textContent = Foxtrick.L10n.getString('TransferSearchResultFilters.' +
				                                            filter.key);
				td.appendChild(strong);

				var td = doc.createElement('td');
				td.colSpan = 2;
				td.textContent = Foxtrick.L10n.getString('Filters.minimum') + '\u00a0';
				tr.appendChild(td);
				var input = doc.createElement('input');
				input.style.width = '90px';
				input.id = filterIdPrefix + filter.key + '.Min';
				input.value = filter.min;
				td.appendChild(input);

				var td = doc.createElement('td');
				td.colSpan = 2;
				td.textContent = Foxtrick.L10n.getString('Filters.maximum') + '\u00a0';
				tr.appendChild(td);
				var input = doc.createElement('input');
				input.style.width = '90px';
				input.id = filterIdPrefix + filter.key + '.Max';
				input.value = filter.max;
				td.appendChild(input);
			}
			else if (filter.type == 'skillselect') {
				var steal = Foxtrick.getMBElement(doc, 'ddlSkill1Min');
				//element to steal from

				var td = doc.createElement('td');
				tr.appendChild(td);
				var strong = doc.createElement('strong');
				strong.textContent = Foxtrick.L10n.getString('TransferSearchResultFilters.' +
				                                            filter.key);
				td.appendChild(strong);

				var td = doc.createElement('td');
				td.colSpan = 2;
				tr.appendChild(td);
				var select = doc.createElement('select');
				select.id = 'FoxtrickTransferSearchResultFilters.Skills.' + filter.key + '.Min';
				var optionMin = doc.createElement('option');
				optionMin.textContent = '-- ' + Foxtrick.L10n.getString('Filters.minimum') + ' --';
				optionMin.value = '-1';
				select.add(optionMin, null);
				for (var i = filter.minAllowed; i < filter.maxAllowed + 1; ++i) {
					var option = doc.createElement('option');
					option.textContent = steal.options[i + 1].textContent;
					option.value = i;
					select.add(option, null);
				}
				select.value = filter.min;
				td.appendChild(select);

				var td = doc.createElement('td');
				td.colSpan = 2;
				tr.appendChild(td);
				var select = doc.createElement('select');
				select.id = 'FoxtrickTransferSearchResultFilters.Skills.' + filter.key + '.Max';
				var optionMin = doc.createElement('option');
				optionMin.textContent = '-- ' + Foxtrick.L10n.getString('Filters.maximum') + ' --';
				optionMin.value = '-1';
				select.add(optionMin, null);
				for (var i = filter.minAllowed; i < filter.maxAllowed + 1; ++i) {
					var option = doc.createElement('option');
					option.textContent = steal.options[i + 1].textContent;
					option.value = i;
					select.add(option, null);
				}
				select.value = filter.max;
				td.appendChild(select);
			}
			else if (filter.type == 'check') {
				var td = doc.createElement('td');
				td.colSpan = 5;
				tr.appendChild(td);
				var input = doc.createElement('input');
				input.type = 'checkbox';
				input.id = filterIdPrefix + filter.key + '.check';
				if (filter.checked === true)
					input.setAttribute('checked', 'checked');
				td.appendChild(input);
				var label = doc.createElement('label');
				label.textContent = Foxtrick.L10n.getString('TransferSearchResultFilters.' +
				                                           filter.key);
				label.htmlFor = input.id;
				td.appendChild(label);
			}
		};
		var addExtraFilters = function() {
			getFilters(
			  function(filters) {
				var tableAdvanced = Foxtrick.getMBElement(doc, 'tblAdvanced');
				if (tableAdvanced === null) {
					return;  //only show if advanced filters is on
				}
				var table = Foxtrick.createFeaturedElement(doc,
					Foxtrick.modules.TransferSearchResultFilters, 'table');
				table.id = 'ft-ExtraFilters';
				var tr = doc.createElement('tr');
				table.appendChild(tr);
				var td = doc.createElement('td');
				td.setAttribute('colspan', '5');
				tr.appendChild(td);
				var div = doc.createElement('div');
				div.setAttribute('class', 'borderSeparator');
				td.appendChild(div);

				for (var j = 0; j < filters.length; ++j) {
					addNewFilter(table, filters, j);
				}
				tableAdvanced.parentNode.insertBefore(table, tableAdvanced.nextSibling);

				var buttonClear = Foxtrick.getButton(doc, 'Clear');
				Foxtrick.onClick(buttonClear, function() {
					getFilters(function(filters) {
						for (var j = 0; j < filters.length; ++j) {
							var filter = filters[j];
							if (filter.type == 'minmax') {
								filters[j].min = '';
								doc.getElementById(filterIdPrefix +
								                   filter.key + '.Min').value = '';
								filters[j].max = '';
								doc.getElementById(filterIdPrefix +
								                   filter.key + '.Max').value = '';
							}
							else if (filter.type == 'check') {
								filters[j].checked = false;
								doc.getElementById(filterIdPrefix +
								                   filter.key + '.check').removeAttribute('checked');
							}
							else if (filter.type == 'skillselect') {
								filters[j].min = -1;
								doc.getElementById('FoxtrickTransferSearchResultFilters.Skills.' +
								                   filter.key + '.Min').value = '-1';
								filters[j].max = -1;
								doc.getElementById('FoxtrickTransferSearchResultFilters.Skills.' +
								                   filter.key + '.Max').value = '-1';
							}
						}
						setFilters(filters);
					});
				});
				var buttonSearch = Foxtrick.getButton(doc, 'Search');
				Foxtrick.onClick(buttonSearch, function(ev) {
					// we can't get to localStore in async mode before the page
					// navigates away in opera so we need some fake click logic;
					// creating a modified event does not work
					// because FF is too stupid to submit with it /facepalm

					if (!buttonSearch.getAttribute('x-updated')) {
						// don't submit before we're done
						ev.preventDefault();

						getFilters(
						  function(filters) {
							for (var j = 0; j < filters.length; ++j) {
								var filter = filters[j];
								if (filter.type == 'minmax') {
									var el = doc.getElementById(filterIdPrefix + filter.key +
									                            '.Min');
									if (el.value === '' || isNaN(el.value))
										filters[j].min = '';
									else filters[j].min = Number(el.value);
									var el = doc.getElementById(filterIdPrefix + filter.key +
									                            '.Max');
									if (el.value === '' || isNaN(el.value))
										filters[j].max = '';
									else filters[j].max = Number(el.value);
								}
								else if (filter.type == 'check') {
									var el = doc.getElementById(filterIdPrefix + filter.key +
									                            '.check');
									filters[j].checked = Boolean(el.checked);
								}
								else if (filter.type == 'skillselect') {
									var el = doc.getElementById(filterIdPrefix + 'Skills.' +
									                            filter.key + '.Min');
									filters[j].min = parseInt(el.value, 10);
									if (isNaN(filters[j].min))
										filters[j].min = -1;

									var el = doc.getElementById(filterIdPrefix + 'Skills.' +
									                            filter.key + '.Max');

									filters[j].max = parseInt(el.value, 10);
									if (isNaN(filters[j].max))
										filters[j].max = -1;
								}
							}
							setFilters(filters);

							// we are done: skip on fake
							buttonSearch.setAttribute('x-updated', '1');

							// fake click
							buttonSearch.click();

						});
					}
				});
			});
		};
		var filterResults = function() {
			getFilters(
			  function(filters) {
				var playerList = Foxtrick.Pages.TransferSearchResults.getPlayerList(doc);
				var playerInfos = doc.getElementsByClassName('transferPlayerInfo');
				// Transform a live NodeList to an array because we'll remove
				// elements below. Without transformation the index would
				// point to incorrect nodes.
				playerInfos = Foxtrick.map(function(n) { return n; }, playerInfos);

				// playerList and playerInfos should have the same order,
				// and the same length
				for (var i = 0; i < playerInfos.length; ++i) {
					var player = playerList[i];
					var hide = false;
					for (var j = 0; j < filters.length; ++j) {
						var filter = filters[j];
						if (filter.type == 'minmax' &&
						    (filter.min !== '' || filter.max !== '')) {
							if (FILTER_FUNC[filter.key](player, filter.min, filter.max))
								hide = true;
						}
						else if (filter.type == 'skillselect' &&
						    (filter.min != -1 || filter.max != -1)) {
							if (FILTER_FUNC[filter.key](player, filter.min, filter.max))
								hide = true;
						}
						else if (filter.type == 'check') {
							/*Foxtrick.log(filter, filter.checked,
							             FILTER_FUNC[filter.key](player), player);*/
							if (filter.checked && FILTER_FUNC[filter.key](player))
								hide = true;
						}
						if (hide) {
							playerInfos[i].parentNode.removeChild(playerInfos[i]);
							break;
						}
					}
				}
			});
		};
		if (Foxtrick.isPage(doc, 'transferSearchForm')) {
			addExtraFilters();
			showHTSearchProfileComment();
		}
		else if (Foxtrick.isPage(doc, 'transferSearchResult'))
			filterResults();
	}
};
