'use strict';
/**
 * bookmark-adjust.js
 * Colors bookmark icon extracting code from bookmark comment
 * @author taised
 */

Foxtrick.modules['BookmarkAdjust'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['bookmarks'],

	run: function(doc) {
		this._adjust_bookmarks(doc);
	},

	change: function(doc) {
		this._adjust_bookmarks(doc);
	},

	_bookmarkColor: function(imageObj, regexp, commentObj, color) {
		if (commentObj.firstChild.nodeValue.search(regexp) > -1) {
			imageObj.style.background = 'transparent url(' + Foxtrick.ResourcePath +
			                                             'resources/notes/' + color +
			                                             '.png) no-repeat scroll 0 0';
			commentObj.firstChild.nodeValue = commentObj.firstChild.nodeValue.replace(regexp, '');
		}
	},

	_adjust_bookmarks: function(doc) {
		var spanObj = doc.getElementById('ctl00_ctl00_CPContent_CPMain_repB');
		var tableObj = spanObj.getElementsByTagName('table').item(0);

		//checking if deadline already set
		var deadline_span = doc.getElementsByClassName('ft_deadline');
		if (deadline_span.length > 0) {
			var setDeadline = false;
		}
		else {
			var setDeadline = true;
		}

		//Now running through the table
		for (var i = 0; i < tableObj.rows.length; i++) {
			//If there aren't 4 cells on the row is a separator row
			if (tableObj.rows[i].cells.length == 4) {
				//a comment is on a span with class italic on the first cell
				var comment = tableObj.rows[i].cells[0].getElementsByClassName('italic');
				if (comment.length > 0) {
					var commentObj = comment.item(0);
					var imageObj = tableObj.rows[i].cells[2].childNodes[1];
					this._bookmarkColor(imageObj, /\[aqua\]/i, commentObj, 'aqua');
					this._bookmarkColor(imageObj, /\[B\]/i, commentObj, 'B');
					this._bookmarkColor(imageObj, /\[black\]/i, commentObj, 'black');
					this._bookmarkColor(imageObj, /\[blue\]/i, commentObj, 'blue');
					this._bookmarkColor(imageObj, /\[brown\]/i, commentObj, 'brown');
					this._bookmarkColor(imageObj, /\[cyan\]/i, commentObj, 'cyan');
					this._bookmarkColor(imageObj, /\[darkpurple\]/i, commentObj, 'darkpurple');
					this._bookmarkColor(imageObj, /\[green\]/i, commentObj, 'green');
					this._bookmarkColor(imageObj, /\[idea\]/i, commentObj, 'idea');
					this._bookmarkColor(imageObj, /\[lightblue\]/i, commentObj, 'lightblue');
					this._bookmarkColor(imageObj, /\[lightgreen\]/i, commentObj, 'lightgreen');
					this._bookmarkColor(imageObj, /\[orange\]/i, commentObj, 'orange');
					this._bookmarkColor(imageObj, /\[pink\]/i, commentObj, 'pink');
					this._bookmarkColor(imageObj, /\[purple\]/i, commentObj, 'purple');
					this._bookmarkColor(imageObj, /\[red\]/i, commentObj, 'red');
					this._bookmarkColor(imageObj, /\[white\]/i, commentObj, 'white');
					this._bookmarkColor(imageObj, /\[yellow\]/i, commentObj, 'yellow');
				}
			}
		}
	},
};
