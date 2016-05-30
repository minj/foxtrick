'use strict';
/**
 * specialty-info.js
 *
 * Show a concise specialty information table having clicked on a specialty icon
 *
 * @author LA-MJ
 */

Foxtrick.modules['SpecialtyInfo'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['all'],
	CSS: Foxtrick.InternalPath + 'resources/css/specialty-info.css',

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
				{ events: [139, 55] },
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
			neg: [{ events: [109, /*125 own goal*/] }],
		},
		{ // Head
			pos: [{ events: [119, 137] }],
			neg: [{ events: [139] }],
		},
		{ // Regainer
			pos: [{ icon: 'injured', text: 'SpecialtyInfo.regainer', title: 'Injured' }],
			neg: [],
		},
	],

	run: function(doc) {
		var module = this;
		var EVENT_UTIL = Foxtrick.util.matchEvent;

		var addInfo = function(parent) {
			var doc = parent.ownerDocument;
			var specNum = parent.dataset.specialty;
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
			thTitle.textContent = Foxtrick.L10n.getSpecialityFromNumber(specNum);

			var headerRow = thead.insertRow(-1);
			var thPlus = headerRow.appendChild(doc.createElement('th'));
			thPlus.className = 'center';
			thPlus.colSpan = 2;
			thPlus.textContent = '+';
			var thMinus = headerRow.appendChild(doc.createElement('th'));
			thMinus.className = 'center';
			thMinus.colSpan = 2;
			thMinus.textContent = '-';


			var rows = [], iconCell;

			var row, rowIdx;
			var updateRowPointer = function(newIdx) {
				rowIdx = newIdx;
				while (rowIdx >= rows.length)
					rows.push([{}, {}, {}, {}]);

				row = rows[rowIdx];
			};

			var spec = module.SPECS[specNum];
			for (var pair of [[0, spec.pos], [2, spec.neg]]) {
				var startIdx = pair[0], arr = pair[1];
				updateRowPointer(0);

				if (!arr.length) {
					row[startIdx] = { className: 'center', textContent: '-', colSpan: 2 };
					row[startIdx + 1] = null;

					continue;
				}

				for (var item of arr) {
					if (item.events) {
						var evRowIdx = rowIdx;
						for (var eventId of item.events) {
							updateRowPointer(evRowIdx);

							iconCell = doc.createElement('td');
							row[startIdx] = iconCell;

							var icons = EVENT_UTIL.getEventIcons(eventId, 'team');
							EVENT_UTIL.appendIcons(doc, iconCell, icons, eventId);

							var title = EVENT_UTIL.getEventTitle(eventId);
							row[startIdx + 1] = title;

							evRowIdx++;
						}
						continue;
					}

					updateRowPointer(rowIdx);

					iconCell = doc.createElement('td');
					row[startIdx] = iconCell;

					if (item.icon) {
						var iTitle = Foxtrick.L10n.getString(item.title);
						EVENT_UTIL.appendIcons(doc, iconCell, [item.icon], iTitle);
					}

					var text = Foxtrick.L10n.getString(item.text);
					row[startIdx + 1] = text;

					if (item.textIcons) {
						var textArr = row[startIdx + 1] = [text];
						for (var icon of item.textIcons) {
							textArr.push(' ');

							var iconFrag = doc.createDocumentFragment();
							textArr.push(iconFrag);

							var iconText = Foxtrick.L10n.getString(icon.text);
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

			var ancestor = parent.parentNode;
			while (ancestor && !Foxtrick.hasClass(ancestor, 'position'))
				ancestor = ancestor.parentNode;

			if (ancestor) {
				// match order field
				// absolute positioning in HT design overlaps our container
				// if attached at original position
				// moving up a few nodes instead
				parent = ancestor;
			}

			parent.appendChild(infoContainer);
		};

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
		Foxtrick.onClick(mainBody, function specInfoListener(ev) {
			var target = ev.target;
			while (target) {
				if (Foxtrick.hasClass(target, 'ft-specInfo')) {
					var uuid = target.dataset.uuid;
					target = doc.getElementById('ft-specInfo-parent-' + uuid);
					break;
				}

				// README: parent class set elsewhere
				if (Foxtrick.hasClass(target, 'ft-specInfo-parent'))
					break;

				target = target.parentNode;
			}

			if (!target)
				return;

			activate(target);

			// stop event to disable match order select
			ev.preventDefault();
			ev.stopPropagation();

		}, true); // useCapture

	},
};
