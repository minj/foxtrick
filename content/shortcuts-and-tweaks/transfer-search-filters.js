/**
 * Transfer list filters
 * @author kolmis, bummerland, LA-MJ
 */

'use strict';

Foxtrick.modules.TransferSearchFilters = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['transferSearchForm'],
	CSS: Foxtrick.InternalPath + 'resources/css/transfer-search-filters.css',

	/** @param {document} doc */
	run: function(doc) {
		// do not modify the mappings - the keys are stored in preferences
		var MAIN = Foxtrick.getMainIDPrefix();
		var FTPRE = 'FoxtrickTransferSearchResultFilters';
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

			_51: FTPRE + '_hideBruised_check',
			_52: FTPRE + '_hideInjured_check',
			_53: FTPRE + '_hideSuspended_check',
			_55: FTPRE + '_days_min',
			_56: FTPRE + '_days_max',
			_57: FTPRE + '_Skills_form_min',
			_58: FTPRE + '_Skills_form_max',
			_59: FTPRE + '_hideOrdinary_check',
		};
		var NAME_PROMPT = Foxtrick.L10n.getString('TransferSearchFilters.enterName');
		var DELETE_PROMPT = Foxtrick.L10n.getString('TransferSearchFilters.deleteFilter.ask');

		/**
		 * @param  {string} xmlId
		 * @return {HTMLInputElement}
		 */
		var findFormElement = function(xmlId) {
			let el = doc.getElementById(xmlId);
			if (!el) {
				let subst = backwardCompatibleCodes[xmlId];
				if (typeof subst != 'undefined')
					el = doc.getElementById(subst);
			}

			return /** @type {HTMLInputElement} */ (el);
		};

		/**
		 * @param {HTMLElement} table
		 * @param {string} name
		 */
		var addFilter = function(table, name) {
			/** @type {Listener<HTMLElement,MouseEvent>} */
			var fillForm = function() {
				/** @type {string} */
				var filter;

				/** @type {XMLDocument} */
				var obj;
				try {
					// eslint-disable-next-line consistent-this, no-invalid-this
					var target = this;

					filter = target.dataset.filter;

					// parse it
					var dp = new target.ownerDocument.defaultView.DOMParser();
					obj = dp.parseFromString(filter, 'text/xml');

					var root = obj.firstChild;

					for (let child of root.childNodes) {
						let id = child.childNodes[0].textContent;

						let value = '';
						if (child.childNodes[1].childNodes.length > 0)
							value = child.childNodes[1].textContent;

						// set the value in form
						let el = findFormElement(id);
						if (!el)
							continue;

						if (el.type != 'radio')
							el.value = value;

						el.checked = el.type == 'checkbox' && value === 'true';
						el.disabled = false;
					}
				}
				catch (e) {
					Foxtrick.log(e);
					Foxtrick.log('filter-name:', filter);
					Foxtrick.log('filter-obj:', obj);
				}
			};

			/** @type {Listener<HTMLElement,MouseEvent>} */
			var deleteFilter = function() {
				// eslint-disable-next-line consistent-this, no-invalid-this
				var target = this;

				if (Foxtrick.confirmDialog(DELETE_PROMPT)) {
					Foxtrick.Prefs.delListPref('transferfilterlist', target.dataset.msg);
					Foxtrick.Prefs.deleteValue('transferfilter.' + target.dataset.msg);
					let el = doc.getElementById('filter_' + target.dataset.msg);
					if (el)
						el.remove();
				}
			};

			let fName = `transferfilter.${name}`;
			var filter = Foxtrick.Prefs.getString(fName);
			if (!filter) {
				filter = Foxtrick.Prefs.getString(encodeURI(fName));
				if (!filter)
					return;
			}

			var tr = doc.createElement('tr');
			tr.id = `filter_${name}`;
			table.appendChild(tr);

			var tdName = doc.createElement('td');
			var tdRemove = doc.createElement('td');
			tr.appendChild(tdName);
			tr.appendChild(tdRemove);

			var link = doc.createElement('a');
			link.className = 'ft-link';
			Foxtrick.onClick(link, fillForm);
			link.textContent = name;
			link.dataset.filter = filter;
			tdName.appendChild(link);

			var remover = doc.createElement('div');
			remover.className = 'foxtrickRemove';
			remover.dataset.msg = name;
			Foxtrick.onClick(remover, deleteFilter);
			tdRemove.appendChild(remover);
		};

		/** @type {Listener<HTMLElement,MouseEvent>} */
		// eslint-disable-next-line complexity
		var addNewFilter = function(ev) {
			try {
				var filtername = ev.view.prompt(NAME_PROMPT);
				if (filtername === '')
					return;

				var el;
				var formString = '<root>';
				for (let i in backwardCompatibleCodes) {
					el = findFormElement(i);
					if (el && el.type != 'radio' && el.type != 'checkbox') {
						if (/\{/.test(el.value)) {
							// don't save hidden imputs
							continue;
						}

						formString += '<elem>';
						formString += '<name>' + i + '</name>';
						formString += '<value>' + el.value + '</value>';
						formString += '</elem>';
					}

					if (el && el.type == 'checkbox') {
						formString += '<elem>';
						formString += '<name>' + i + '</name>';
						formString += '<value>' + el.checked + '</value>';
						formString += '</elem>';
					}
				}
				formString += '</root>';

				var bExists = false;
				for (let name of Foxtrick.Prefs.getList('transferfilterlist')) {
					if (name == filtername) {
						bExists = true;
						break;
					}
				}
				Foxtrick.Prefs.setString('transferfilter.' + filtername, formString);
				if (bExists) {
					Foxtrick.Prefs.delListPref('transferfilterlist', filtername);
					el = doc.getElementById('filter_' + filtername);
					if (el)
						el.parentNode.removeChild(el);
				}
				Foxtrick.Prefs.addPrefToList('transferfilterlist', filtername);
				let table = doc.getElementById('ft-transfer-search-filter-table');
				if (table)
					addFilter(table, filtername);
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		let ownBoxBody = doc.createElement('div');
		let header = Foxtrick.L10n.getString('TransferSearchFilters.boxheader');

		// add link
		let addlink = Foxtrick.createFeaturedElement(doc, this, 'a');
		addlink.id = 'ft-transfer-search-filter-new';
		addlink.className = 'ft-link';
		Foxtrick.onClick(addlink, addNewFilter);
		addlink.textContent = Foxtrick.L10n.getString('TransferSearchFilters.saveFilter');
		ownBoxBody.appendChild(addlink);

		let namelist = Foxtrick.Prefs.getList('transferfilterlist');
		namelist.sort();
		let table = Foxtrick.createFeaturedElement(doc, this, 'table');
		table.id = 'ft-transfer-search-filter-table';

		for (let filter of namelist)
			addFilter(table, filter);

		ownBoxBody.appendChild(table);
		Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, 1);
	},
};
