'use strict';
/**
 * Transfer list filters
 * @author kolmis, bummerland
 */

Foxtrick.modules['TransferSearchFilters'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['transferSearchForm'],
	CSS: Foxtrick.InternalPath + 'resources/css/transfer-search-filters.css',

	run: function(doc) {
		// do not modify the mappings - the keys are stored in preferences
		var MAIN = Foxtrick.getMainIDPrefix();
		var FTPRE = 'FoxtrickTransferSearchResultFilters.';
		var backwardCompatibleCodes = {
			_01: MAIN + 'ddlDeadline',
			_02: MAIN + 'ddlAgeMin',
			_03: MAIN + 'ddlAgeMax',
			_04: MAIN + 'ddlSkill1',
			_05: MAIN + 'ddlSkill1Min',
			_06: MAIN + 'ddlSkill1Max',
			_07: MAIN + 'ddlSkill2',
			_08: MAIN + 'ddlSkill2Min',
			_09: MAIN + 'ddlSkill2Max',
			_10: MAIN + 'ddlSkill3',
			_11: MAIN + 'ddlSkill3Min',
			_12: MAIN + 'ddlSkill3Max',
			_13: MAIN + 'ddlSkill4',
			_14: MAIN + 'ddlSkill4Min',
			_15: MAIN + 'ddlSkill4Max',
			_16: MAIN + 'ddlSpecialty',
			_17: MAIN + 'ddlZone',
			_18: MAIN + 'ddlBornIn',
			_19: MAIN + 'txtTSIMin_text',
			_20: MAIN + 'txtTSIMin_Value',
			// _21: MAIN + 'txtTSIMin_ClientState',
			_22: MAIN + 'txtTSIMax_text',
			_23: MAIN + 'txtTSIMax_Value',
			// _24: MAIN + 'txtTSIMax_ClientState',
			_25: MAIN + 'txtBidMin_text',
			_26: MAIN + 'txtBidMin_Value',
			// _27: MAIN + 'txtBidMin_ClientState',
			_28: MAIN + 'txtBidMax_text',
			_29: MAIN + 'txtBidMax_Value',
			// _30: MAIN + 'txtBidMax_ClientState',
			_31: MAIN + 'ddlGlobalSkillMax',
			_32: MAIN + 'chkUseGlobalMax',
			_33: MAIN + 'ddlAgeDaysMin',
			_34: MAIN + 'ddlAgeDaysMax',

			_51: FTPRE + 'hideBruised.check',
			_52: FTPRE + 'hideInjured.check',
			_53: FTPRE + 'hideSuspended.check',
			_55: FTPRE + 'days.Min',
			_56: FTPRE + 'days.Max',
			_57: FTPRE + 'Skills.form.Min',
			_58: FTPRE + 'Skills.form.Max',
			_59: FTPRE + 'hideOrdinary.check'

		};
		var findFormElement = function(id) {
			return doc.getElementById(id);
		};
		var addNewFilter = function() {
			try {
				var filtername = prompt(Foxtrick.L10n.getString('TransferSearchFilters.enterName'));
				if (filtername == '') return;

				var formString = '<root>';
				var i;
				for (i in backwardCompatibleCodes) {
					var el = findFormElement(i);
					if (el == null) {
						var subst = backwardCompatibleCodes[i];
						if (typeof(subst) != 'undefined') {
							el = findFormElement(subst);
						}
					}
					if (el != null && el.type != 'radio' && el.type != 'checkbox') {
						if (el.value.search('{') != -1) continue;  // don't save hidden imputs
						formString = formString + '<elem>';
						formString = formString + '<name>' + i + '</name>';
						formString = formString + '<value>' + el.value + '</value>';
						formString = formString + '</elem>';
					}

					if (el != null && el.type != 'radio' && el.type == 'checkbox') {
						formString = formString + '<elem>';
						formString = formString + '<name>' + i + '</name>';
						formString = formString + '<value>' + el.checked + '</value>';
						formString = formString + '</elem>';
					}
				}
				formString = formString + '</root>';

				var namelist = Foxtrick.Prefs.getList('transferfilterlist');
				var bExists = false;
				for (var i = 0; i < namelist.length; i++) {
					if (namelist[i] == filtername) {
						bExists = true;
						break;
					}
				}
				Foxtrick.Prefs.setString('transferfilter.' + filtername, formString);
				if (bExists) {
					Foxtrick.Prefs.delListPref('transferfilterlist', filtername);
					var el = doc.getElementById('filter_' + filtername);
						if (el)
							el.parentNode.removeChild(el);
				}
				Foxtrick.Prefs.addPrefToList('transferfilterlist', filtername);
				var table = doc.getElementById('ft-transfer-search-filter-table');
				if (table) {
					addFilter(table, filtername);
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};
		var addFilter = function(table, name) {
			var fillForm = function(ev) {
				try {
					var filter = ev.target.getAttribute('filter');
					// parse it
					var dp = new ev.view.DOMParser();
					var obj = dp.parseFromString(filter, 'text/xml');

					var root = obj.firstChild;

					for (var i = 0; i < root.childNodes.length; i++) {
						var id = root.childNodes[i].childNodes[0].textContent;

						var value;
						if (root.childNodes[i].childNodes[1].childNodes.length > 0) {
							value = root.childNodes[i].childNodes[1].textContent;
						}
						else {
							value = '';
						}

						// set the value in form
						var el = findFormElement(id);
						if (el == null) {
							var subst = backwardCompatibleCodes[id];
							if (typeof(subst) != 'undefined') {
								el = findFormElement(subst);
							}
						}
						if (el == null) continue;

						if (el.type != 'radio') {
							el.value = value;
						}
						el.checked = (el.type == 'checkbox' && value == 'true');
						el.disabled = false;
					}
				}
				catch (e) {
					Foxtrick.log(e);
					Foxtrick.log('filter-name: ', filter);
					Foxtrick.log('filter-obj: ', obj);
				}
			};
			var deleteFilter = function(ev) {
				if (Foxtrick.confirmDialog(
				    Foxtrick.L10n.getString('TransferSearchFilters.deleteFilter.ask'))) {
					Foxtrick.Prefs.delListPref('transferfilterlist', ev.target.msg);
					Foxtrick.Prefs.deleteValue('transferfilter.' + ev.target.msg);
					var el = doc.getElementById('filter_' + ev.target.msg);
					if (el)
						el.parentNode.removeChild(el);
				}
			};

			var filter = Foxtrick.Prefs.getString('transferfilter.' + name);
			if (filter === null) {
				filter = Foxtrick.Prefs.getString(encodeURI('transferfilter.' + name));
				if (filter === null)
					return;
			}

			var tr = doc.createElement('tr');
			tr.id = 'filter_' + name;
			table.appendChild(tr);

			var td_fname = doc.createElement('td');
			var td_remove = doc.createElement('td');
			tr.appendChild(td_fname);
			tr.appendChild(td_remove);

			var link = doc.createElement('a');
			link.className = 'ft-link';
			Foxtrick.onClick(link, fillForm);
			link.textContent = name;
			link.setAttribute('filter', filter);
			td_fname.appendChild(link);

			var remover = doc.createElement('div');
			remover.className = 'foxtrickRemove';
			remover.msg = name;
			Foxtrick.onClick(remover, deleteFilter);
			td_remove.appendChild(remover);
		};

		var ownBoxBody = doc.createElement('div');
		var header = Foxtrick.L10n.getString('TransferSearchFilters.boxheader');

		// add link
		var addlink = Foxtrick.createFeaturedElement(doc, this, 'a');
		addlink.id = 'ft-transfer-search-filter-new';
		addlink.className = 'ft-link';
		Foxtrick.onClick(addlink, addNewFilter);
		addlink.textContent = Foxtrick.L10n.getString('TransferSearchFilters.saveFilter');
		ownBoxBody.appendChild(addlink);

		var namelist = Foxtrick.Prefs.getList('transferfilterlist');
		namelist.sort();
		var table = Foxtrick.createFeaturedElement(doc, this, 'table');
		table.id = 'ft-transfer-search-filter-table';
		for (var i = 0; i < namelist.length; i++) {
			addFilter(table, namelist[i]);
		}
		ownBoxBody.appendChild(table);
		Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, 1);
	}
};
