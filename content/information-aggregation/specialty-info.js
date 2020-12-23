/**
 * specialty-info.js
 *
 * Show a concise specialty information table having clicked on a specialty icon
 *
 * @author LA-MJ
 */

'use strict';

Foxtrick.modules.SpecialtyInfo = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['all'],
	CSS: Foxtrick.InternalPath + 'resources/css/specialty-info.css',

	/**
	 * @typedef SpecialyEffectCustom
	 * @prop {string} text
	 * @prop {string} [icon] actually {MatchEventIcon} but tsc fails to infer json here :(
	 * @prop {string} [title]
	 * @prop {{name: string, text: string}[]} [textIcons]
	 * @typedef SpecialyEffectEvents
	 * @prop {number[]} events
	 * @typedef {SpecialyEffectCustom|SpecialyEffectEvents} SpecialtyEffect
	 * @typedef SpecialtyDefinition
	 * @prop {SpecialtyEffect[]} [pos]
	 * @prop {SpecialtyEffect[]} [neg]
	 */

	/** @type {SpecialtyDefinition[]} */
	/* eslint-disable no-magic-numbers */
	SPECS: [
		{}, // none
		{ // Technical
			pos: [
				{ icon: 'weather_sunny', text: 'Scoring', title: 'weather.3' },
				{ icon: 'weather_sunny', text: 'Playmaking', title: 'weather.3' },
				{
					icon: 'aow',
					text: 'SpecialtyInfo.tdf',
					title: 'PlayerPositionsEvaluations.wings',
				},
				{ events: [139, 311, 55] },
			],
			neg: [
				{ icon: 'weather_rainy', text: 'Scoring', title: 'weather.0' },
				{ icon: 'weather_rainy', text: 'Playmaking', title: 'weather.0' },
			],
		},
		{ // Quick
			pos: [{ events: [115, 116, 289] }],
			neg: [
				{
					icon: 'weather_sunny',
					text: 'Defending',
					title: 'weather.3',
					textIcons: [
						{ name: 'warning.png', text: 'icon.important' },
						{ name: 'clock.png', text: 'SpecialtyInfo.secondHalf' },
					],
				},
				{ icon: 'weather_rainy', text: 'Scoring', title: 'weather.0' },
				{ icon: 'weather_rainy', text: 'Defending', title: 'weather.0' },
			],
		},
		{ // Powerful
			pos: [
				{ icon: 'weather_rainy', text: 'Scoring', title: 'weather.0' },
				{ icon: 'weather_rainy', text: 'Defending', title: 'weather.0' },
				{ icon: 'weather_rainy', text: 'Playmaking', title: 'weather.0' },
				{ icon: 'pressing', text: 'SpecialtyInfo.powerPress', title: 'match.events.331' },
			],
			neg: [
				{
					icon: 'weather_sunny',
					text: 'Scoring',
					title: 'weather.3',
					textIcons: [
						{ name: 'clock.png', text: 'SpecialtyInfo.secondHalf' },
					],
				},
				{
					icon: 'weather_sunny',
					text: 'Stamina',
					title: 'weather.3',
					textIcons: [
						{ name: 'clock.png', text: 'SpecialtyInfo.secondHalf' },
					],
				},
			],
		},
		{ // Unpredictable
			pos: [{ events: [105, 106, 108] }],
			neg: [{ events: [109, 125] }],
		},
		{ // Head
			pos: [{ events: [119, 137] }],
			neg: [{ events: [139] }],
		},
		{ // Resilient
			pos: [
				{ icon: 'injured', text: 'SpecialtyInfo.resilient', title: 'Injured' },
				{ events: [427] },
			],
			neg: [],
		},
		{}, // Fool
		{ // Support
			pos: [{ events: [307] }],
			neg: [{ events: [308, 309] }],
		},
	],
	/* eslint-enable no-magic-numbers */

	/** @param {document} doc */
	run: function(doc) {
		var module = this;
		var EVENT_UTIL = Foxtrick.util.matchEvent;

		/**
		 * @param {HTMLElement} parent
		 */
		// eslint-disable-next-line complexity
		var addInfo = function(parent) {
			var doc = parent.ownerDocument;
			var specNum = parseInt(parent.dataset.specialty, 10) || 0;
			var uuid = parent.dataset.uuid;

			var infoContainer = Foxtrick.createFeaturedElement(doc, module, 'div');
			Foxtrick.addClass(infoContainer, 'ft-specInfo ft-specInfo-active');
			infoContainer.id = 'ft-specInfo-' + uuid;
			infoContainer.dataset.uuid = uuid;

			var infoTable = infoContainer.appendChild(doc.createElement('table'));
			infoTable.className = 'ft-specInfo-tbl';

			var cols = infoTable.appendChild(doc.createElement('colgroup'));
			cols.appendChild(doc.createElement('col')).className = 'ft-specInfo-col';
			cols.appendChild(doc.createElement('col')).className = 'ft-specInfo-col';
			cols.appendChild(doc.createElement('col')).className = 'ft-specInfo-col';
			cols.appendChild(doc.createElement('col')).className = 'ft-specInfo-col';

			var thead = infoTable.appendChild(doc.createElement('thead'));
			var titleRow = thead.insertRow(-1);
			var thTitle = titleRow.appendChild(doc.createElement('th'));
			thTitle.className = 'center';
			thTitle.colSpan = 4;
			thTitle.textContent = Foxtrick.L10n.getSpecialtyFromNumber(specNum);

			var headerRow = thead.insertRow(-1);
			var thPlus = headerRow.appendChild(doc.createElement('th'));
			thPlus.className = 'center';
			thPlus.colSpan = 2;
			thPlus.textContent = '+';
			var thMinus = headerRow.appendChild(doc.createElement('th'));
			thMinus.className = 'center';
			thMinus.colSpan = 2;
			thMinus.textContent = '-';

			/**
			 * @typedef {{className?:string,textContent?:string,colSpan?:number}} SpecInfoAttrs
			 * @typedef {string|Node|(string|Node)[]|SpecInfoAttrs} SpecInfoCell
			 * @typedef {[SpecInfoCell, SpecInfoCell, SpecInfoCell, SpecInfoCell]} SpecInfoRow
			 */

			/** @type {SpecInfoRow[]} */
			var rows = [];

			/** @type {SpecInfoRow} */
			var row = null;

			/** @type {HTMLTableCellElement} */
			var iconCell = null;
			var rowIdx = -1;

			/** @param {number} newIdx */
			var updateRowPointer = function(newIdx) {
				rowIdx = newIdx;
				while (rowIdx >= rows.length)
					rows.push([{}, {}, {}, {}]);

				row = rows[rowIdx];
			};

			let spec = module.SPECS[specNum];

			/** @type {[number, SpecialtyEffect[]][]} */
			let def = [[0, spec.pos], [2, spec.neg]];
			for (let [startIdx, arr] of def) {
				updateRowPointer(0);

				if (!Array.isArray(arr)) {
					row[startIdx] = { className: 'center', textContent: '-', colSpan: 2 };
					row[startIdx + 1] = null;

					continue;
				}

				for (let item of arr) {
					if ('events' in item) {
						let evRowIdx = rowIdx;
						for (let eventId of item.events) {
							updateRowPointer(evRowIdx);

							iconCell = doc.createElement('td');
							row[startIdx] = iconCell;

							let icons = EVENT_UTIL.getEventIcons(eventId, 'team');
							EVENT_UTIL.appendIcons(doc, iconCell, icons, String(eventId), false);

							let title = EVENT_UTIL.getEventTitle(eventId);
							row[startIdx + 1] = title;

							evRowIdx++;
						}
						continue;
					}

					updateRowPointer(rowIdx);

					iconCell = doc.createElement('td');
					row[startIdx] = iconCell;

					if (item.icon) {
						let iTitle = Foxtrick.L10n.getString(item.title);
						let icon = /** @type {MatchEventIcon} */ (item.icon);
						EVENT_UTIL.appendIcons(doc, iconCell, [icon], iTitle);
					}

					let text = Foxtrick.L10n.getString(item.text);
					row[startIdx + 1] = text;

					if (item.textIcons) {
						/** @type {(string|Node)[]} */
						let textArr = row[startIdx + 1] = [text];
						for (let icon of item.textIcons) {
							textArr.push(' ');

							let iconFrag = doc.createDocumentFragment();
							textArr.push(iconFrag);

							let iconText = Foxtrick.L10n.getString(icon.text);
							Foxtrick.addImage(doc, iconFrag, {
								src: Foxtrick.InternalPath + 'resources/img/' + icon.name,
								class: 'ft-specInfo-textIcon',
								alt: iconText,
								title: iconText,
							});
						}
					}

					rowIdx++;
				}
			}

			var tbody = infoTable.appendChild(doc.createElement('tbody'));
			Foxtrick.makeRows(doc, rows, tbody);

			var ancestor = parent.parentElement;
			while (ancestor && !Foxtrick.hasClass(ancestor, 'position'))
				ancestor = ancestor.parentElement;

			let target = parent;
			if (ancestor) {
				// match order field
				// absolute positioning in HT design overlaps our container
				// if attached at original position
				// moving up a few nodes instead
				target = ancestor;
			}

			target.appendChild(infoContainer);
		};

		/**
		 * @param {HTMLElement} parent
		 */
		var activate = function(parent) {
			var doc = parent.ownerDocument;

			var uuid = parent.dataset.uuid;
			if (!uuid) {
				parent.dataset.uuid = uuid = Math.random().toString(16).slice(2);
				parent.id = 'ft-specInfo-parent-' + uuid;
			}

			var info = doc.getElementById('ft-specInfo-' + uuid);
			if (info)
				Foxtrick.toggleClass(info, 'ft-specInfo-active');
			else
				addInfo(parent);
		};

		var mainBody = doc.getElementById('mainBody');
		if (!mainBody)
			return;

		Foxtrick.listen(mainBody, 'click', function specInfoListener(ev) {
			var target = /** @type {HTMLElement} */ (ev.target);
			while (target) {
				if (Foxtrick.hasClass(target, 'ft-specInfo')) {
					var uuid = target.dataset.uuid;
					target = doc.getElementById('ft-specInfo-parent-' + uuid);
					break;
				}

				// README: parent class set elsewhere
				if (Foxtrick.hasClass(target, 'ft-specInfo-parent'))
					break;

				target = target.parentElement;
			}

			if (!target)
				return true;

			activate(target);

			// stop event to disable match order select
			return false;

		}, true); // useCapture

	},
};
