/**
* sortTable.js
* sorting of HT-ML tables
* @author convinced, LA-MJ
*/

'use strict';

Foxtrick.modules.TableSort = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['all'],
	NICE: 10, // after anythig that adds or changes tables
	CSS: Foxtrick.InternalPath + 'resources/css/tableSort.css',

	/** @param {document} doc */
	run: function(doc) {
		/** @type {Listener<HTMLTableCellElement,MouseEvent>} */
		// eslint-disable-next-line complexity
		var doSort = function(ev) {
			try {
				// eslint-disable-next-line consistent-this, no-invalid-this
				var thisTh = this;

				// find table header cell if click was on some inner span or img
				thisTh = thisTh.closest('th');

				// get the column (index) and row(sort_start).
				// there had been tables with multiple head rows. thus goto whole table
				var table = thisTh.closest('table');
				var row = /** @type {HTMLTableRowElement} */ (thisTh.parentElement);
				var sortStart = row.rowIndex;
				var thisIndex = thisTh.cellIndex;
				var index = 0;
				for (let i = 0; i <= thisIndex; ++i) {
					let cell = row.cells[i];

					// adjust for colspan in header
					index += cell.colSpan;
				}

				// Foxtrick.log('sort_start:',sort_start,'index: ',index);

				// determine sort direction
				var direction = thisTh.hasAttribute('sort-asc') ? 1 : -1;
				if (String(index) == table.getAttribute('lastSortIndex')) {
					if (direction == 1)
						thisTh.removeAttribute('sort-asc');
					else
						thisTh.setAttribute('sort-asc', 'true');
					direction *= -1;
				}
				table.setAttribute('lastSortIndex', String(index));

				// get text to sort by. first try textContent, then title
				/**
				 * @param  {HTMLTableCellElement} el
				 * @return {string}
				 */
				var getText = function(el) {
					var text = el.textContent.trim() || el.title.trim();
					if (text == '') {
						// use first title instead
						/** @type {HTMLElement} */
						let tEl = el.querySelector('[title]');
						text = tEl && tEl.title.trim() || '';
					}
					return text;
				};

				var isNum = true, isAge = true, isAgeParent = true, isYouthSkill = true,
					isOrdinal = true, isDate = true, isSkill = true;

				if (table.rows.length <= sortStart + 1)
					return;

				var numCols = table.rows[sortStart + 1].cells.length;
				var i = sortStart + 1;
				for (; i < table.rows.length; ++i) {
					let row = table.rows[i];

					// if numCols change, we are at the bottom with
					// nonsortable entries (eg transfercompare)
					if (numCols != row.cells.length)
						break;

					// get sorting format
					let cell = row.cells[thisIndex];
					if (!cell)
						continue;

					let inner = getText(cell);
					if (inner) {
						let num = inner.replace(/\u202d|&nbsp;|\s+/g, '').replace(/,/, '.');
						if (isNaN(parseFloat(num)))
							isNum = false;
						if (!/^(-|\d)\/(-|\d)$/.test(inner))
							isYouthSkill = false;
						if (!/^\d+\W\(\d+\)$/.test(inner))
							isAgeParent = false;
						if (!/^\d+\.\d+$/.test(inner))
							isAge = false;
						if (!/^\d+\./.test(inner))
							isOrdinal = false;
						if (!Foxtrick.util.time.getDateFromText(inner))
							isDate = false;
						if (!/lt=skillshort&amp;ll=\d+/.test(cell.innerHTML))
							isSkill = false;
					}
				}
				var sortEnd = i;

				// Foxtrick.log('sort end: ',sort_end);

				// rows to be sorted
				var rows = [];
				for (let i = sortStart + 1; i < sortEnd; ++i)
					rows.push(Foxtrick.cloneElement(table.rows[i], true));

				/**
				 * @param  {HTMLTableRowElement} a
				 * @param  {HTMLTableRowElement} b
				 * @return {number}
				 */
				// eslint-disable-next-line complexity
				var cmp = function(a, b) {
					var lastSort = Number(a.getAttribute('lastSort')) -
						Number(b.getAttribute('lastSort'));

					var aCell = a.cells[thisIndex];
					var bCell = b.cells[thisIndex];

					if (aCell.innerHTML === bCell.innerHTML)
						return lastSort;

					var aContent = getText(aCell);
					var bContent = getText(bCell);

					// place empty cells at the bottom
					if (aContent === '' || aContent == null)
						return 1;
					if (bContent === '' || bContent == null)
						return -1;

					/* eslint-disable no-magic-numbers */
					if (isSkill) {
						aContent = aCell.innerHTML.match(/lt=skillshort&amp;ll=(\d+)/)[1];
						bContent = bCell.innerHTML.match(/lt=skillshort&amp;ll=(\d+)/)[1];
						return direction * (parseFloat(bContent) - parseFloat(aContent));
					}
					else if (isDate) {
						let date1 = Foxtrick.util.time.getDateFromText(aContent);
						let date2 = Foxtrick.util.time.getDateFromText(bContent);
						return direction * (date2.getTime() - date1.getTime());
					}
					else if (isYouthSkill) {
						let aMatch = aContent.replace('-', '0').match(/^(\d)\/(\d)$/);
						let aVal = parseFloat(aMatch[1]) * 18 + parseFloat(aMatch[2]) * 2 +
							(aCell.getElementsByTagName('strong').length == 0 ? 0 : 1);
						let bMatch = bContent.replace('-', '0').match(/^(\d)\/(\d)$/);
						let bVal = parseFloat(bMatch[1]) * 18 + parseFloat(bMatch[2]) * 2 +
							(bCell.getElementsByTagName('strong').length == 0 ? 0 : 1);
						return direction * (bVal - aVal);
					}
					else if (isAge) {
						let aMatch = aContent.match(/^(\d+)\.(\d+)$/);
						let aVal = parseInt(aMatch[1], 10) * 1000 + parseInt(aMatch[2], 10);
						let bMatch = bContent.match(/^(\d+)\.(\d+)$/);
						let bVal = parseInt(bMatch[1], 10) * 1000 + parseInt(bMatch[2], 10);
						return direction * (aVal - bVal);
					}
					else if (isAgeParent) {
						let aMatch = aContent.match(/^(\d+)\W\((\d+)\)$/);
						let aVal = parseInt(aMatch[1], 10) * 1000 + parseInt(aMatch[2], 10);
						let bMatch = bContent.match(/^(\d+)\W\((\d+)\)$/);
						let bVal = parseInt(bMatch[1], 10) * 1000 + parseInt(bMatch[2], 10);
						return direction * (aVal - bVal);
					}
					else if (isOrdinal) {
						let aVal = parseInt(aContent.match(/^(\d+)\./)[1], 10);
						let bVal = parseInt(bContent.match(/^(\d+)\./)[1], 10);
						return direction * (aVal - bVal);
					}
					else if (isNum) {
						let aVal = parseFloat(aContent.replace(/\u202d|&nbsp;|\s+/g, '')
						                              .replace(/,/, '.'));
						let bVal = parseFloat(bContent.replace(/\u202d|&nbsp;|\s+/g, '')
						                              .replace(/,/, '.'));
						aVal = isNaN(aVal) ? lastSort : aVal;
						bVal = isNaN(bVal) ? lastSort : bVal;
						if (aVal === bVal)
							return lastSort;

						return direction * (aVal - bVal);
					}
					/* eslint-enable no-magic-numbers */

					// sort string
					// always sort by ascending order
					return direction * aContent.localeCompare(bContent);
				};

				// sort them
				rows.sort(cmp);

				// put them back
				for (let i = sortStart + 1; i < sortEnd; ++i) {
					table.rows[i].parentNode.replaceChild(rows[i - 1 - sortStart], table.rows[i]);
					table.rows[i].setAttribute('lastSort', String(i));
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		var tables;
		if (Foxtrick.isPage(doc, 'forumViewThread'))
			tables = doc.querySelectorAll('.htMlTable');
		else
			tables = doc.querySelectorAll('#mainBody table');

		for (let table of tables) {
			if (table.id == 'ft_skilltable' || Foxtrick.hasClass(table, 'tablesorter'))
				continue;

			let ths = table.querySelectorAll('th');
			for (let th of ths) {
				if (!th.hasAttribute('ht-orderable-by') &&
				    th.querySelectorAll('input').length === 0 &&
				    th.querySelectorAll('a').length === 0 &&
				    !Foxtrick.hasClass(th, 'header')) { // ht sorting

					Foxtrick.makeFeaturedElement(th, this);
					Foxtrick.onClick(th, doSort);
				}
			}
		}
	},
};
