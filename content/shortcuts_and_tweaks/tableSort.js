//**********************************************************
/**
* sortTable.js
* sorting of HT-ML tables
* @author convinced
*/

var FoxtrickTableSort = {

	MODULE_NAME : "TableSort",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array('forumViewThread','all_late'),
    NEW_AFTER_VERSION: "0.5.2.1",
	LATEST_CHANGE:"Sort option for forum tables",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	DEFAULT_ENABLED : true,
	CSS: Foxtrick.ResourcePath + "resources/css/tableSort.css",
	
	sortNum : false,
	sortYouthSkill : false,
	sortAge : false,
	sortOrdinal : false,
	sortIndex : -1,			
				
	run : function( page, doc ) {
		try {
			if (page=='forumViewThread') {
				var tables = doc.getElementsByClassName("htMlTable");  
				for (var i = 0; i < tables.length; ++i) {
					var ths = tables[i].getElementsByTagName("th");  
					for (var j = 0; j < ths.length; ++j) {
						Foxtrick.addEventListenerChangeSave(ths[j], "click", FoxtrickTableSort.clickListener, false);
					}
				}
				return;
			}
				var tables = doc.getElementById('mainBody').getElementsByClassName("indent");  
				for (var i = 0; i < tables.length; ++i) {
					var ths = tables[i].getElementsByTagName("th");
					for (var j = 0; j < ths.length; ++j) {
						Foxtrick.addEventListenerChangeSave(ths[j], "click", FoxtrickTableSort.clickListener, false);
					}
				}
				return;
			
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},
	
	clickListener : function( ev ) {
		try {
			var this_th = ev.target;
			var index = 0;
			var table = this_th.parentNode.parentNode.parentNode;
			for (var j = 0; j < table.rows[0].cells.length; ++j) {
				if (table.rows[0].cells[j]===this_th) break;
				var colspan = 1;
				if (table.rows[0].cells[j].getAttribute('colspan')!=null) colspan = parseInt(table.rows[0].cells[j].getAttribute('colspan'));
				index += colspan;
			}
				
			Foxtrick.dump('index ' + index + '\n');
			
			var is_num = true, is_age=true, is_youthskill = true, is_ordinal=true;
			for (var i = 1; i < table.rows.length; ++i) {
		    	var inner = Foxtrick.trim(Foxtrick.stripHTML(table.rows[i].cells[index].innerHTML));
				//Foxtrick.dump( (inner!='')+' '+isNaN(parseFloat(inner))+' '+ parseInt(inner)+'\n');	
				if (isNaN(parseFloat(inner)) && inner!='') {is_num=false;} 
		    	if (inner.search(/^(-|\d)\/(-|\d)$/)==-1 && inner!='') {is_youthskill=false;} 
		    	if (inner.search(/^\d+\.\d+$/)==-1 && inner!='') {is_age=false;} 
		    	if (inner.search(/^\d+\./)==-1 && inner!='') {is_ordinal=false;} 
		    }
			Foxtrick.dump('is_num '+is_num+'\n');
			Foxtrick.dump('is_youthskill '+is_youthskill+'\n');
			Foxtrick.dump('is_age '+is_age+'\n');
			Foxtrick.dump('is_ordinal '+is_ordinal+'\n');
			
			// old rows to array
			var table_old = table.cloneNode(true);
			var rows = new Array();
			for (var i = 1; i < table.rows.length; ++i) {
				rows.push(table_old.rows[i].cloneNode(true));
			}
			
			// sort options
			FoxtrickTableSort.sortYouthSkill = is_youthskill;
			FoxtrickTableSort.sortAge = is_age;
			FoxtrickTableSort.sortNum = is_num;
			FoxtrickTableSort.sortOrdinal = is_ordinal;			
			FoxtrickTableSort.sortIndex = index;			
			
			// sort them
			rows.sort(FoxtrickTableSort.sortCompare);
			
			// put them back
			for (var i = 1; i < table.rows.length; ++i) {
				table_old.rows[i].innerHTML = rows[i-1].innerHTML;
			}
			table.innerHTML = table_old.innerHTML;

	    	var ths = table.getElementsByTagName("th");  
			for (var j = 0; j < ths.length; ++j) {
				Foxtrick.addEventListenerChangeSave(ths[j], "click", FoxtrickTableSort.clickListener, false);
			}
			
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},
	
	sortCompare : function(a, b) {
		var aContent, bContent;
		
		aContent = a.cells[FoxtrickTableSort.sortIndex].innerHTML;
		bContent = b.cells[FoxtrickTableSort.sortIndex].innerHTML;
	
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
		
		if (FoxtrickTableSort.sortYouthSkill) {
			aContent = aContent.replace('-','0').match(/^(\d)\/(\d)$/);
			aContent = aContent[1] * 18 + aContent[2] * 2 + (a.cells[FoxtrickTableSort.sortIndex].getElementsByTagName('strong').length==0?0:1); 			
			bContent = bContent.replace('-','0').match(/^(\d)\/(\d)$/);
			bContent = bContent[1] * 18 + bContent[2] * 2 + (b.cells[FoxtrickTableSort.sortIndex].getElementsByTagName('strong').length==0?0:1); 
			return bContent - aContent;
		}
		else if (FoxtrickTableSort.sortAge) {
			aContent = aContent.match(/^(\d+)\.(\d+)$/);
			aContent = parseInt(aContent[1]) * 1000 + parseInt(aContent[2]) ;			
			bContent = bContent.match(/^(\d+)\.(\d+)$/);
			bContent = parseInt(bContent[1]) * 1000 + parseInt(bContent[2]);
			return aContent - bContent;
		}
		else if (FoxtrickTableSort.sortOrdinal) {
			aContent = parseInt(aContent.match(/^(\d+)\./)[1]);
			bContent = parseInt(bContent.match(/^(\d+)\./)[1]);
			//Foxtrick.dump(aContent+' '+bContent+'\n')
			return aContent - bContent;
		}
		else if (FoxtrickTableSort.sortNum) {
			aContent = parseFloat(aContent);
			bContent = parseFloat(bContent);
			//Foxtrick.dump(aContent+' '+bContent+'\n')
			aContent = isNaN(aContent) ? 0 : aContent;
			bContent = isNaN(bContent) ? 0 : bContent;
			if (aContent === bContent) {
				return 0;
			}			
			else {
				return bContent - aContent;
			}
		}
		else { // sort string
			// always sort by ascending order
			return aContent.localeCompare(bContent);
		}		
	},

};