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

		/**
		 * @typedef TransferSearchFilterInput
		 * @prop {string} $
		 * @prop {boolean} [skill]
		 * @prop {{ $: string, range: [number, number]}} [check]
		 */

		/**
		 * @type {Record<string, TransferSearchFilterInput>}
		 */
		var backwardCompatibleCodes = {
			// _01: MAIN + 'ddlDeadline',
			_02: { $: `#${MAIN}ddlAgeMin` },
			_03: { $: `#${MAIN}ddlAgeMax` },

			_04: { $: `#${MAIN}ddlSkill1`, skill: true },
			_05: { $: `#${MAIN}ddlSkill1Min`, skill: true },
			_06: { $: `#${MAIN}ddlSkill1Max`, skill: true },
			_07: { $: `#${MAIN}ddlSkill2`, skill: true },
			_08: { $: `#${MAIN}ddlSkill2Min`, skill: true },
			_09: { $: `#${MAIN}ddlSkill2Max`, skill: true },
			_10: { $: `#${MAIN}ddlSkill3`, skill: true },
			_11: { $: `#${MAIN}ddlSkill3Min`, skill: true },
			_12: { $: `#${MAIN}ddlSkill3Max`, skill: true },
			_13: { $: `#${MAIN}ddlSkill4`, skill: true },
			_14: { $: `#${MAIN}ddlSkill4Min`, skill: true },
			_15: { $: `#${MAIN}ddlSkill4Max`, skill: true },

			_16: {
				$: `#${MAIN}ddlSpecialty`,
				check: {
					$: `#${MAIN}chkSpecialty`,
					// eslint-disable-next-line no-magic-numbers
					range: [0, 9],
				},
			},

			_90: { $: `#${MAIN}chkSpecialty0` },
			_91: { $: `#${MAIN}chkSpecialty1` },
			_92: { $: `#${MAIN}chkSpecialty2` },
			_93: { $: `#${MAIN}chkSpecialty3` },
			_94: { $: `#${MAIN}chkSpecialty4` },
			_95: { $: `#${MAIN}chkSpecialty5` },
			_96: { $: `#${MAIN}chkSpecialty6` },

			// _97: { $: `#${MAIN}chkSpecialty7` },
			_98: { $: `#${MAIN}chkSpecialty8` },


			// _17: MAIN + 'ddlZone',

			_18: { $: `#${MAIN}ddlBornIn` },
			_19: { $: `#${MAIN}txtTSIMin_text` },
			_20: { $: `#${MAIN}txtTSIMin_Value` },

			// _21: MAIN + 'txtTSIMin_ClientState',
			_22: { $: `#${MAIN}txtTSIMax_text` },
			_23: { $: `#${MAIN}txtTSIMax_Value` },

			// _24: MAIN + 'txtTSIMax_ClientState',
			_25: { $: `#${MAIN}txtBidMin_text` }, // deprecated
			_26: { $: `#${MAIN}txtBidMin_Value` }, // deprecated

			// _27: MAIN + 'txtBidMin_ClientState',
			_28: { $: `#${MAIN}txtBidMax_text, #${MAIN}txtBidMax` },
			_29: { $: `#${MAIN}txtBidMax_Value` }, // deprecated

			// _30: MAIN + 'txtBidMax_ClientState',
			_31: { $: `#${MAIN}ddlGlobalSkillMax` },
			_32: { $: `#${MAIN}chkUseGlobalMax` },
			_33: { $: `#${MAIN}ddlAgeDaysMin` },
			_34: { $: `#${MAIN}ddlAgeDaysMax` },

			// ctl00_ctl00_CPContent_CPMain_rdSort_0
			// ctl00$ctl00$CPContent$CPMain$rdSort

			_51: { $: `#${FTPRE}_hideBruised_check` },
			_52: { $: `#${FTPRE}_hideInjured_check` },
			_53: { $: `#${FTPRE}_hideSuspended_check` },

			// _55: { $: `#${FTPRE}_days_min` },
			// _56: { $: `#${FTPRE}_days_max` },

			_57: { $: `#${FTPRE}_Skills_form_min` },
			_58: { $: `#${FTPRE}_Skills_form_max` },
			_59: { $: `#${FTPRE}_hideOrdinary_check` }, // deprecated
		};
		var NAME_PROMPT = Foxtrick.L10n.getString('TransferSearchFilters.enterName');
		var DELETE_PROMPT = Foxtrick.L10n.getString('TransferSearchFilters.deleteFilter.ask');

		/**
		 * @param  {string} selector
		 * @return {Promise<void>}
		 */
		var waitFor = function(selector) {
			return new Promise((resolve) => {
				let section = doc.querySelector('.transfer-search-table');
				Foxtrick.onChange(section, () => {
					if (doc.querySelector(selector)) {
						resolve();
						return true;
					}
					return void 0;
				});
			});
		};

		/**
		 * @param  {string} xmlId
		 * @param  {string} [value]
		 * @return {Promise<HTMLInputElement[]>}
		 */
		// eslint-disable-next-line complexity
		var findFormElements = async function(xmlId, value) {
			/** @type { HTMLElement[]} */
			let more = [];

			let isNum = !Number.isNaN(parseInt(value, 10));

			let main = doc.getElementById(xmlId);
			if (!main) {
				let input = backwardCompatibleCodes[xmlId];
				if (typeof input != 'undefined') {
					main = doc.querySelector(input.$);
					if (!main) {
						if (input.skill && isNum && value != '0' && value != '-1') {
							let [_, num] = input.$.match(/Skill(\d)/);

							/** @type {HTMLAnchorElement} */
							let add = doc.querySelector(`#${MAIN}lnkAddSkill${num}`);
							if (add) {
								add.click();
								await waitFor(`#${MAIN}pnlSkill${num}`);
							}

							main = doc.querySelector(input.$);
						}
						else if (input.check && typeof value != 'undefined') {
							let [start, end] = input.check.range;
							for (let num of Foxtrick.range(start, end)) {
								/** @type {HTMLInputElement} */
								let el = doc.querySelector(`${input.check.$}${num}`);
								el && more.push(el);
							}
						}
					}
				}
			}

			if (main)
				more.unshift(main);

			return /** @type {HTMLInputElement[]} */ (more);
		};

		/**
		 * @param {HTMLElement} table
		 * @param {string} name
		 */
		var addFilter = function(table, name) {
			/** @type {Listener<HTMLElement,MouseEvent>} */
			// eslint-disable-next-line complexity
			var fillForm = async function() {
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
						// eslint-disable-next-line no-await-in-loop
						let els = await findFormElements(id, value);
						if (els.length > 1) {
							if (Number.isNaN(parseInt(value, 10)))
								continue;

							for (let el of els) {
								el.checked = String(el.id.match(/\d$/)) == value;
								if (el.checked)
									el.setAttribute('checked', 'checked');
								else
									el.removeAttribute('checked');
							}

							continue;
						}

						let [el] = els;
						if (!el)
							continue;

						if (el.type != 'radio') {
							el.value = value;

							if (el instanceof HTMLSelectElement && el.selectedIndex == -1)
								el.selectedIndex = 0;
						}

						if (el.type == 'checkbox') {
							el.checked = value === 'true';
							if (el.checked)
								el.setAttribute('checked', 'checked');
							else
								el.removeAttribute('checked');

						}

						el.disabled = false;
						el.dispatchEvent(new Event('change'));
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
		var addNewFilter = async function(ev) {
			try {
				var filtername = ev.view.prompt(NAME_PROMPT);
				if (filtername === '')
					return;

				var formString = '<root>';
				for (let i in backwardCompatibleCodes) {
					// eslint-disable-next-line no-await-in-loop
					let [el] = await findFormElements(i);
					if (!el) {
						formString += '<elem>';
						formString += '<name>' + i + '</name>';
						formString += '<value></value>';
						formString += '</elem>';
						continue;
					}

					if (el.type != 'radio' && el.type != 'checkbox') {
						if (/\{/.test(el.value)) {
							// don't save hidden imputs
							continue;
						}

						formString += '<elem>';
						formString += '<name>' + i + '</name>';
						formString += '<value>' + el.value + '</value>';
						formString += '</elem>';
					}

					if (el.type == 'checkbox') {
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
					let el = doc.getElementById('filter_' + filtername);
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
