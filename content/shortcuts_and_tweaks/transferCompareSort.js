/**
 * TransferCompareSort.js
 * hide unknown youthskills
 * @Authors:  convincedd
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickTransferCompareSort = {
    
    MODULE_NAME : "TransferCompareSort",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('TransferCompare'), 
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.9",
	LATEST_CHANGE:"Sorting transfer compare results",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
		
    init : function() {
    },

    run : function( page, doc ) {
		try  {
				var table = doc. getElementById('mainBody').getElementsByTagName('table')[0];
					table.rows[4].cells[2].setAttribute( "s_index", 2 );						
					table.rows[4].cells[2].addEventListener( "click", this.sortClick, true );						
					table.rows[4].cells[2].setAttribute( "style", "cursor:pointer;");						
					table.rows[4].cells[2].title=Foxtrickl10n.getString("SortBy");

					table.rows[4].cells[3].setAttribute( "s_index", 3 );						
					table.rows[4].cells[3].addEventListener( "click", this.sortClick, true );						
					table.rows[4].cells[3].setAttribute( "style", "cursor:pointer;");						
					table.rows[4].cells[3].title=Foxtrickl10n.getString("SortBy");

					table.rows[4].cells[5].setAttribute( "s_index", 5 );						
					table.rows[4].cells[5].addEventListener( "click", this.sortClick, true );						
					table.rows[4].cells[5].setAttribute( "style", "cursor:pointer;");						
					table.rows[4].cells[5].title=Foxtrickl10n.getString("SortBy");

		} catch(e) {Foxtrick.dump('FoxtrickTransferCompareSort.run error: '+e+'\n');}
	},
	
	change : function( page, doc ) {	
	},

	sortfunction: function(a,b) {return a.cells[FoxtrickTransferCompareSort.s_index].innerHTML.localeCompare(b.cells[FoxtrickTransferCompareSort.s_index].innerHTML);},
	sortnumberfunction: function(a,b) { return parseInt(a.cells[FoxtrickTransferCompareSort.s_index].innerHTML.replace(/ |&nbsp;/g,'')) < parseInt(b.cells[FoxtrickTransferCompareSort.s_index].innerHTML.replace(/ |&nbsp;/g,''));},
	sortdownfunction: function(a,b) {return (b.cells[FoxtrickTransferCompareSort.s_index].innerHTML.localeCompare(a.cells[FoxtrickTransferCompareSort.s_index].innerHTML));},
	sortlinksfunction: function(a,b) {return a.cells[FoxtrickTransferCompareSort.s_index].getElementsByTagName('a')[0].innerHTML.localeCompare(b.cells[FoxtrickTransferCompareSort.s_index].getElementsByTagName('a')[0].innerHTML);},
	sortskillsfunction: function(a,b) {return a.cells[FoxtrickTransferCompareSort.s_index].getElementsByTagName('a')[0].href.match(/ll=(\d+)/)[1] < b.cells[FoxtrickTransferCompareSort.s_index].getElementsByTagName('a')[0].href.match(/ll=(\d+)/)[1];},
	
	sortClick : function(ev) {
	try{
		var doc = ev.originalTarget.ownerDocument;
		var table = doc. getElementById('mainBody').getElementsByTagName('table')[0];
		var table_old = table.cloneNode(true);
		FoxtrickTransferCompareSort.s_index = ev.target.getAttribute('s_index');
		if (!FoxtrickTransferCompareSort.s_index)  FoxtrickTransferCompareSort.s_index = ev.target.parentNode.getAttribute('s_index');
		
		var rows= new Array();
		for (var i=5;i<table.rows.length-2;++i) {
			rows.push(table_old.rows[i]);
		}
		
		if (FoxtrickTransferCompareSort.s_index==5) rows.sort(FoxtrickTransferCompareSort.sortskillsfunction);
		else rows.sort(FoxtrickTransferCompareSort.sortnumberfunction);
		
		var j=0;
		for (var i=5;i<table.rows.length-2;++i) {
			table.rows[i].innerHTML = rows[j++].innerHTML;
		}
	} catch(e) {Foxtrick.dump('FoxtrickTransferCompareSort: '+e+'\n');}
	},
}

