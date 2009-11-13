/**
 * highlightcupwins.js
 * Script which makes the new mails more visible
 * @author convincedd
 */

var FoxtrickHighlightCupwins = {
	
    MODULE_NAME : "HighlightCupwins",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('cupmatches'), 
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8.1",
	LATEST_CHANGE:"Highlight winning teams on CupMatches page",
		
    init : function() {
    },

    run : function( page, doc ) {	
	try{
	var mainBody=doc.getElementById('mainBody');
	var table= mainBody.getElementsByTagName('table')[0]; 
	for (var i=1;i<table.rows.length;++i) {
			var goals = table.rows[i].cells[3].innerHTML.match(/\d+/g); 
			var goals0=parseInt(goals[0]);
			var goals1=parseInt(goals[1]);
			
			var homewon = (goals0>goals1)
			var matchlink = table.rows[i].cells[2].getElementsByTagName('a')[0];
			var firstsep=matchlink.innerHTML.indexOf(' - ' );
			var hometeam = matchlink.innerHTML.substring(0,firstsep);
			// if there are names with ' - ' take the last part for away only
			var lastsep=matchlink.innerHTML.lastIndexOf(' - ' )+3;
			var awayteam = matchlink.innerHTML.substring(lastsep);
			if (homewon) {
				table.rows[i].cells[3].innerHTML = '<strong>'+table.rows[i].cells[3].innerHTML+'</strong>';
				matchlink.innerHTML = '<strong>'+hometeam+'</strong> - '+awayteam;
			}
			else {
				matchlink.innerHTML = hometeam+' - <strong>'+awayteam+'</strong>';
			}			
		}
	}catch(e){Foxtrick.dump(e)}	
 	},
	
	change : function( page, doc ) {	
	}
};