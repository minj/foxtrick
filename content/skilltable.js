/**
 * skilltable.js
 * Utilities for skill tables
 * @author convicedd, luminaryan
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

	sortfunction: function(a,b) {return a.cells[FoxtrickSkillTable.sortIndex].innerHTML.localeCompare(b.cells[FoxtrickSkillTable.sortIndex].innerHTML);},
	sortindexfunction: function(a,b) {return parseInt(b.cells[FoxtrickSkillTable.sortIndex].getAttribute('index')) < parseInt(a.cells[FoxtrickSkillTable.sortIndex].getAttribute('index'));},
	sortdownfunction: function(a,b) {return parseInt(b.cells[FoxtrickSkillTable.sortIndex].innerHTML.replace(/\&nbsp| /g,'')) > parseInt(a.cells[FoxtrickSkillTable.sortIndex].innerHTML.replace(/\&nbsp| /g,''));},
	sortdowntextfunction: function(a,b) {return (b.cells[FoxtrickSkillTable.sortIndex].innerHTML.localeCompare(a.cells[FoxtrickSkillTable.sortIndex].innerHTML));},
	sortlinksfunction: function(a,b) {return a.cells[FoxtrickSkillTable.sortIndex].getElementsByTagName('a')[0].innerHTML.localeCompare(b.cells[FoxtrickSkillTable.sortIndex].getElementsByTagName('a')[0].innerHTML);},
	sortagefunction: function(a,b) {return a.cells[FoxtrickSkillTable.sortIndex].getAttribute('age').localeCompare(b.cells[FoxtrickSkillTable.sortIndex].getAttribute('age'));},

	sortClick : function(ev, doc, index, sort) {
		try {
			if (ev) {
				var doc = ev.target.ownerDocument;
				FoxtrickSkillTable.sortIndex = ev.currentTarget.getAttribute('s_index');
				FoxtrickSkillTable.sort = ev.currentTarget.getAttribute('sort');
			}
			else {
				FoxtrickSkillTable.sortIndex = index;
				FoxtrickSkillTable.sort = sort;
			}
			var table = doc.getElementsByClassName("ft_skilltable")[0];
			var table_old = table.cloneNode(true);
			Foxtrick.dump('sortby: '+FoxtrickSkillTable.sortIndex+' '+FoxtrickSkillTable.sort+'\n');

			var rows = new Array();

			// a temporary solution concerning adultskilltable's customization
			// will be unified
			if (table.id === "ft_adultskilltable") {
				var start = 2;
			}
			else {
				var start = 1;
			}
			for (var i = start; i < table.rows.length; ++i) {
				rows.push(table_old.rows[i]);
			}
			//table.rows[3].innerHTML = table_old.rows[1].innerHTML;
			if (FoxtrickSkillTable.sort == "link")
				rows.sort(FoxtrickSkillTable.sortlinksfunction);
			else if (FoxtrickSkillTable.sort == "age")
				rows.sort(FoxtrickSkillTable.sortagefunction);
			else if (FoxtrickSkillTable.sort == "int")
				rows.sort(FoxtrickSkillTable.sortdownfunction);
			else if (FoxtrickSkillTable.sort == "index")
				rows.sort(FoxtrickSkillTable.sortindexfunction);
			else if (FoxtrickSkillTable.sort == "text")
				rows.sort(FoxtrickSkillTable.sortdowntextfunction);

			for (var i=start; i < table.rows.length; ++i) {
				table.rows[i].innerHTML = rows[i-start].innerHTML;
			}
		}
		catch (e) {
			Foxtrick.dump("SkillTable: " + e + "\n");
		}
	},

	toHtMl : function(table) {
		try {
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