//**********************************************************
/**
* sortTable.js
* sorting of HT-ML tables
* @author convinced
*/

var FoxtrickTableSort = {
	MODULE_NAME : "TableSort",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('forumViewThread','all_late'),
	CSS : Foxtrick.ResourcePath + "resources/css/tableSort.css",

	run : function( page, doc ) {
		if (page=='forumViewThread') {
			var tables = doc.getElementsByClassName("htMlTable");
		}
		else {
			var tables = doc.getElementById('mainBody').getElementsByTagName("table");
		}
		for (var i = 0; i < tables.length; ++i) {
			var ths = tables[i].getElementsByTagName("th");
			for (var j = 0; j < ths.length; ++j) {
				ths[j].addEventListener("click", FoxtrickTableSort.clickListener, false);
			}
		}
		// Foxtrick.dump('FoxtrickTableSort was here...\n');
	},

	clickListener : function( ev ) {
		try {
			var this_th = ev.target;
			var table = this_th.parentNode.parentNode.parentNode;
			for (var i = 0; i < table.rows.length; ++i) {
				var index = 0;
				var found = false;
				for (var j = 0; j < table.rows[i].cells.length; ++j) {
					if (table.rows[i].cells[j]===this_th) { found = true; break; }
					var colspan = 1;
					if (table.rows[i].cells[j].getAttribute('colspan')!=null) colspan = parseInt(table.rows[i].cells[j].getAttribute('colspan'));
					index += colspan;
				}
				if (found) break;
			}
			var sort_start = i;

			var lastSortIndex = table.getAttribute('lastSortIndex');
			if (lastSortIndex==null || lastSortIndex!=index) {
				var direction = 1;
				table.setAttribute('lastSortIndex', index);
			}
			else {
				var direction = -1;
				table.removeAttribute('lastSortIndex');
			}
			var is_num = true, is_age=true, is_youthskill = true, is_ordinal=true, is_date=true, is_skill=true;
			var num_cols = table.rows[sort_start+1].cells.length;
			for (var i = sort_start+1; i < table.rows.length; ++i) {
				if (num_cols != table.rows[i].cells.length) break;
				var inner = Foxtrick.trim(Foxtrick.stripHTML(table.rows[i].cells[index].innerHTML));
				if (isNaN(parseFloat(inner)) && inner!='') {is_num=false;}
				if (inner.search(/^(-|\d)\/(-|\d)$/)==-1 && inner!='') {is_youthskill=false;}
				if (inner.search(/^\d+\.\d+$/)==-1 && inner!='') {is_age=false;}
				if (inner.search(/^\d+\./)==-1 && inner!='') {is_ordinal=false;}
				if (!Foxtrick.util.time.getDateFromText(inner)) {is_date=false;}
				if (table.rows[i].cells[index].innerHTML.search(/lt=skillshort&amp;ll=\d+/)==-1 && inner!='') {is_skill=false;}
			}
			var sort_end = i;

			// rows to be sorted
			var rows = new Array();
			for (var i = sort_start+1; i < sort_end; ++i) {
				rows.push(table.rows[i].cloneNode(true));
			}

			var cmp = function (a, b) {
				var aContent, bContent;

				aContent = a.cells[index].innerHTML;
				bContent = b.cells[index].innerHTML;

				if (aContent === bContent) {
					return 0;
				}

				aContent = Foxtrick.trim(Foxtrick.stripHTML(aContent));
				bContent = Foxtrick.trim(Foxtrick.stripHTML(bContent));

				// place empty cells at the bottom
				if (aContent === "" || aContent === null || aContent === undefined) {
					return 1;
				}
				if (bContent === "" || bContent === null || bContent === undefined) {
					return -1;
				}

				if (is_skill) {
					aContent = (a.cells[index].innerHTML.match(/lt=skillshort&amp;ll=(\d+)/)[1]);
					bContent = (b.cells[index].innerHTML.match(/lt=skillshort&amp;ll=(\d+)/)[1]);
					return direction * (bContent - aContent);
				}
				else if (is_date) {
					var date1 = Foxtrick.util.time.getDateFromText(aContent);
					var date2 = Foxtrick.util.time.getDateFromText(bContent);
					return direction * (date2.getTime() - date1.getTime());
				}
				else if (is_youthskill) {
					aContent = aContent.replace('-','0').match(/^(\d)\/(\d)$/);
					aContent = aContent[1] * 18 + aContent[2] * 2 + (a.cells[index].getElementsByTagName('strong').length==0?0:1);
					bContent = bContent.replace('-','0').match(/^(\d)\/(\d)$/);
					bContent = bContent[1] * 18 + bContent[2] * 2 + (b.cells[index].getElementsByTagName('strong').length==0?0:1);
					return direction * (bContent - aContent);
				}
				else if (is_age) {
					aContent = aContent.match(/^(\d+)\.(\d+)$/);
					aContent = parseInt(aContent[1]) * 1000 + parseInt(aContent[2]) ;
					bContent = bContent.match(/^(\d+)\.(\d+)$/);
					bContent = parseInt(bContent[1]) * 1000 + parseInt(bContent[2]);
					return direction * (aContent - bContent);
				}
				else if (is_ordinal) {
					aContent = parseInt(aContent.match(/^(\d+)\./)[1]);
					bContent = parseInt(bContent.match(/^(\d+)\./)[1]);
					return direction * (aContent - bContent);
				}
				else if (is_num) {
					aContent = parseFloat(aContent);
					bContent = parseFloat(bContent);
					aContent = isNaN(aContent) ? 0 : aContent;
					bContent = isNaN(bContent) ? 0 : bContent;
					if (aContent === bContent) {
						return 0;
					}
					else {
						return direction * (bContent - aContent);
					}
				}
				else { // sort string
					// always sort by ascending order
					return direction * (aContent.localeCompare(bContent));
				}
			};

			// sort them
			rows.sort(cmp);

			// put them back
			for (var i = sort_start+1; i < sort_end; ++i) {
				table.rows[i].innerHTML = rows[i-1-sort_start].innerHTML;
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	}
};
