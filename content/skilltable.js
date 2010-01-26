/**
 * skilltable.js
 * Utilities for skill tables
 * @author luminaryan
 */

var FoxtrickSkillTable = {
	MODULE_NAME : "SkillTable",
	DEFAULT_ENABLED : true,

	init : function() {
	},

	run : function(page, doc) {
	},

	change : function(page, doc) {
	},

	toHtMl : function(table) {
		try {
			Foxtrick.dump(table.tagName);
			var ret = "[table]";
			for (var rowIndex = 0; rowIndex < table.rows.length; ++rowIndex) {
				var row = table.rows[rowIndex];
				ret += "[tr]";
				for (var cellIndex = 0; cellIndex < row.cells.length; ++cellIndex) {
					var cell = row.cells[cellIndex];
					var tagName = cell.tagName.toLowerCase();
					ret += "[" + tagName + "]" + this._getCell(cell) + "[/" + tagName +"]";
				}
				ret += "[/tr]";
			}
			ret += "[/table]";
			return ret;
		}
		catch (e) {
			Foxtrick.dump("SkillTable: " + e + "\n");
		}
	},

	_getCell : function(cell) {
		return Foxtrick.trim(cell.textContent);
	}
};