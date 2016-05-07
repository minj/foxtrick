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
				{ icon: 'weather_sunny', text: 'Scoring' },
				{ icon: 'weather_sunny', text: 'Playmaking' },
				{ icon: 'aow', text: 'SpecialtyInfo.tdf' },
				{ events: [139, 55] },
			],
			neg: [
				{ icon: 'weather_rainy', text: 'Scoring' },
				{ icon: 'weather_rainy', text: 'Playmaking' },
			],
		},
		{ // Quick
			pos: [{ events: [115, 116, 289] }],
			neg: [
				{
					icon: 'weather_sunny',
					text: 'Defending',
					textIcons: [
						{ name: 'warning.png', text: 'icon.important' },
						{ name: 'clock.png', text: 'SpecialtyInfo.secondHalf' },
					],
				},
				{ icon: 'weather_rainy', text: 'Scoring' },
				{ icon: 'weather_rainy', text: 'Defending' },
			],
		},
		{ // Powerful
			pos: [
				{ icon: 'weather_rainy', text: 'Scoring' },
				{ icon: 'weather_rainy', text: 'Defending' },
				{ icon: 'weather_rainy', text: 'Playmaking' },
				{ icon: 'pressing', text: 'SpecialtyInfo.powerPress' },
			],
			neg: [
				{
					icon: 'weather_sunny',
					text: 'Scoring',
					textIcons: [
						{ name: 'clock.png', text: 'SpecialtyInfo.secondHalf' },
					],
				},
				{
					icon: 'weather_sunny',
					text: 'Stamina',
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
			pos: [{ icon: 'injured', text: 'SpecialtyInfo.regainer' }],
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

			var outerTable = infoContainer.appendChild(doc.createElement('table'));
			outerTable.className = 'ft-specInfo-outer';

			var cols = outerTable.appendChild(doc.createElement('colgroup'));
			var colPlus = cols.appendChild(doc.createElement('col'));
			colPlus.className = 'ft-specInfo-col';
			var colMinus = cols.appendChild(doc.createElement('col'));
			colMinus.className = 'ft-specInfo-col';

			var titleRow = outerTable.insertRow(-1);
			var thTitle = titleRow.appendChild(doc.createElement('th'));
			thTitle.className = 'center';
			thTitle.colSpan = 2;
			thTitle.textContent = Foxtrick.L10n.getSpecialityFromNumber(specNum);

			var headerRow = outerTable.insertRow(-1);
			var thPlus = headerRow.appendChild(doc.createElement('th'));
			thPlus.className = 'center';
			thPlus.textContent = '+';
			var thMinus = headerRow.appendChild(doc.createElement('th'));
			thMinus.className = 'center';
			thMinus.textContent = '-';

			var defRow = outerTable.insertRow(-1);
			var tdPlus = defRow.insertCell(-1);
			var tdMinus = defRow.insertCell(-1);

			var spec = module.SPECS[specNum];
			for (var pair of [[tdPlus, spec.pos], [tdMinus, spec.neg]]) {
				var cell = pair[0], arr = pair[1];
				if (!arr.length) {
					cell.className = 'center';
					cell.textContent = '-';
					continue;
				}

				var innerTable = cell.appendChild(doc.createElement('table'));
				innerTable.className = 'ft-specInfo-inner';
				for (var item of arr) {
					var row, iconCell, textCell;
					if (item.events) {
						for (var eventId of item.events) {
							row = innerTable.insertRow(-1);

							var icons = EVENT_UTIL.getEventIcons(eventId, 'team');
							iconCell = row.insertCell(-1);
							EVENT_UTIL.appendIcons(doc, iconCell, icons, eventId);

							var title = EVENT_UTIL.getEventTitle(eventId);
							textCell = row.insertCell(-1);
							textCell.textContent = title;
						}
						continue;
					}

					row = innerTable.insertRow(-1);
					iconCell = row.insertCell(-1);
					if (item.icon) {
						EVENT_UTIL.appendIcons(doc, iconCell, [item.icon], '');
					}

					textCell = row.insertCell(-1);
					textCell.textContent = Foxtrick.L10n.getString(item.text) + ' ';

					if (item.textIcons) {
						for (var icon of item.textIcons) {
							var iconText = Foxtrick.L10n.getString(icon.text);
							Foxtrick.addImage(doc, textCell, {
								src: Foxtrick.InternalPath + 'resources/img/' + icon.name,
								class: 'ft-specInfo-textIcon',
								alt: iconText,
								title: iconText,
							});
						}
					}
				}
			}

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
