/**
 * bookmark-adjust.js
 * Colors bookmark icon extracting code from bookmark comment
 * @author taised, LA-MJ
 */

'use strict';

Foxtrick.modules['BookmarkAdjust'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['bookmarks'],

	run: function(doc) {
		this._adjustBookmarks(doc);
	},

	change: function(doc) {
		this._adjustBookmarks(doc);
	},

	_bookmarkColor: function(comment, img, re, color) {
		let tNode = comment.firstChild;
		let text = tNode.textContent;
		if (!re.test(text))
			return;

		img.style.background = `transparent
			url(${Foxtrick.ResourcePath}resources/notes/${color}.png) no-repeat scroll 0 0`;

		tNode.textContent = text.replace(re, '');
	},

	_bookmarkColors: function(comment, img) {
		const COLORS = {
			aqua: /\[aqua\]/i,
			B: /\[B\]/i,
			black: /\[black\]/i,
			blue: /\[blue\]/i,
			brown: /\[brown\]/i,
			cyan: /\[cyan\]/i,
			darkpurple: /\[darkpurple\]/i,
			green: /\[green\]/i,
			idea: /\[idea\]/i,
			lightblue: /\[lightblue\]/i,
			lightgreen: /\[lightgreen\]/i,
			orange: /\[orange\]/i,
			pink: /\[pink\]/i,
			purple: /\[purple\]/i,
			red: /\[red\]/i,
			white: /\[white\]/i,
			yellow: /\[yellow\]/i,
		};

		for (let [color, re] of Object.entries(COLORS))
			this._bookmarkColor(comment, img, re, color);
	},

	_adjustBookmarks: function(doc) {
		let spanObj = Foxtrick.getMBElement(doc, 'repB');
		if (!spanObj)
			return;

		let tableObj = spanObj.querySelector('table');

		// checking if deadline already set
		let ddlSpan = doc.querySelector('ft_deadline');
		// eslint-disable-next-line no-unused-vars
		let setDeadline = !ddlSpan; // lgtm[js/unused-local-variable]

		// Now running through the table
		for (let row of tableObj.rows) {
			// If there aren't 4 cells on the row is a separator row
			if (row.cells.length != 4)
				continue;

			// a comment is on a span with class italic on the first cell
			let [cCell, _, imgCell] = row.cells; // lgtm[js/unused-local-variable]
			let comment = cCell.querySelector('.italic');
			if (!comment)
				continue;

			let img = imgCell.querySelector('input[type="image"]');
			this._bookmarkColors(comment, img);
		}
	},
};
