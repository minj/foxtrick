//**********************************************************
/**
* forumsorttable.js
* sorting of HT-ML tables
* @author convinced
*/

var FoxtrickForumSortTable = {

	MODULE_NAME : "ForumSortTable",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forumViewThread'),
    NEW_AFTER_VERSION: "0.5.2.1",
	LATEST_CHANGE:"Sort option for forum tables",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	DEFAULT_ENABLED : true,

	sortString : true,
	sortIndex : -1,			
				
	run : function( page, doc ) {
		try {
			var tables = doc.getElementsByClassName("htMlTable");  
		    for (var i = 0; i < tables.length; ++i) {
		    	var ths = tables[i].getElementsByTagName("th");  
				for (var j = 0; j < ths.length; ++j) {
					Foxtrick.addEventListenerChangeSave(ths[j], "click", FoxtrickForumSortTable.clickListener, false);
				}
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},
	
	clickListener : function( ev ) {
		try {
			var this_th = ev.target;
			var table = this_th.parentNode.parentNode.parentNode;
			for (var j = 0; j < table.rows[0].cells.length; ++j) {
				if (table.rows[0].cells[j]===this_th) break;
			}
			var index = j;	
			Foxtrick.dump('index ' + index + '\n');
			
			var is_num = true;
			for (var i = 1; i < table.rows.length; ++i) {
		    	var inner = Foxtrick.trim(Foxtrick.stripHTML(table.rows[i].cells[index].innerHTML));
				//Foxtrick.dump( (inner!='')+' '+isNaN(parseFloat(inner))+' '+ parseInt(inner)+'\n');	
				if (isNaN(parseFloat(inner)) && inner!='') {is_num=false; break;} 
		    }
			Foxtrick.dump('is_num '+is_num+'\n');
			
			// old rows to array
			var table_old = table.cloneNode(true);
			var rows = new Array();
			for (var i = 1; i < table.rows.length; ++i) {
				rows.push(table_old.rows[i].cloneNode(true));
			}
			// sort options
			if (!is_num) FoxtrickForumSortTable.sortString = true;
			FoxtrickForumSortTable.sortIndex = index;			
			// sort them
			rows.sort(FoxtrickForumSortTable.sortCompare);
			// put them back
			for (var i = 1; i < table.rows.length; ++i) {
				table_old.rows[i].innerHTML = rows[i-1].innerHTML;
			}
			table.innerHTML = table_old.innerHTML;

	    	var ths = table.getElementsByTagName("th");  
			for (var j = 0; j < ths.length; ++j) {
				Foxtrick.addEventListenerChangeSave(ths[j], "click", FoxtrickForumSortTable.clickListener, false);
			}
			
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},
	
	sortCompare : function(a, b) {
		var aContent, bContent;
		
		aContent = Foxtrick.stripHTML(a.cells[FoxtrickForumSortTable.sortIndex].textContent);
		bContent = Foxtrick.stripHTML(b.cells[FoxtrickForumSortTable.sortIndex].textContent);
	
		if (aContent === bContent) {
			return 0;
		}
		// place empty cells at the bottom
		if (aContent === "" || aContent === null || aContent === undefined) {
			return 1;
		}
		if (bContent === "" || bContent === null || bContent === undefined) {
			return -1;
		}
		if (FoxtrickForumSortTable.sortString) {
			// always sort by ascending order
			return aContent.localeCompare(bContent);
		}
		else {
			aContent = parseFloat(aContent);
			bContent = parseFloat(bContent);
			aContent = isNaN(aContent) ? 0 : aContent;
			bContent = isNaN(bContent) ? 0 : bContent;
			if (aContent === bContent) {
				return 0;
			}
			/*if (FoxtrickForumSortTable.sortAsc) {
				return aContent - bContent;
			}
			else*/ {
				return bContent - aContent;
			}
		}
	},

};