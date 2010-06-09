/**
 * htlivetable.js
 * livetable
 * @author convincedd
 */
////////////////////////////////////////////////////////////////////////////////
Foxtrick.HTLiveTable = {

    MODULE_NAME : "HTLiveTable",
	DEFAULT_ENABLED : true,
	PAGES : new Array('match'), 
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : new Array('league','matchesLive'), 
	ONPAGEPREF_PAGE : 'match', 
    DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.5.1.1",
	LATEST_CHANGE:"",	

	matchxmls: new Array(),
	
	init : function() {
	},
	
	run : function(page,doc) {
	try{
		if (page=='league') {
			var link = doc.getElementById('ctl00_CPMain_hypAddRoundToLive');
			link.addEventListener(Foxtrick.HTLiveTable.getTable,true)
		}
		
	} catch(e){Foxtrick.dump('htlivetable run: '+e+'\n');}
	},

	change : function(page,doc) {
	},

	getTable : function(ev) {
	},
	
};