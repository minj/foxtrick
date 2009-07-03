/**
 * FoxtrickSmallerPages.js
 * Reduces the dimension of some pages to adapt to small screens
 * @author taised
 */
////////////////////////////////////////////////////////////////////////////////
FoxtrickSmallerPages = {

    MODULE_NAME : "FoxtrickSmallerPages",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('playerdetail'), 
    DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.4.8.2",
	LASTEST_CHANGE:"Reduces the dimension of some pages to adapt to small screens",
	LASTEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	OPTIONS : new Array( "ReduceBid"),
    
    init : function() {
    },

    run : function( page, doc ) {
		switch(page) {
			case 'playerdetail':
				if (Foxtrick.isModuleFeatureEnabled( this, "ReduceBid")) {
					//we move the bid div
					this._move_bid( doc );
					//then adjust it
					this._adjust_bid( doc );
				}
				break;
		}
    },
	
	change : function( page, doc ) {
		switch(page) {
			case 'playerdetail':
				if (Foxtrick.isModuleFeatureEnabled( this, "ReduceBid")) {
					//bid div has already been moved, need only to be adjusted
					this._adjust_bid( doc );
				}
				break;
		}
	},
    
	_move_bid : function ( doc ) {
		var biddiv = doc.getElementById('ctl00_CPMain_updBid');
		if (biddiv) {
			try {
				//We move the bid div, i get the skill div
				var skilldiv=biddiv.nextSibling.nextSibling;
				//I get the skilltable and create a new table where to put skilltable and biddiv
				var skilltable=skilldiv.getElementsByTagName('table').item(0);
				var newtable=doc.createElement('table');
				skilldiv.appendChild(newtable);
				newtable.insertRow(0);
				newtable.rows[0].insertCell(0);
				newtable.rows[0].insertCell(1);
				newtable.rows[0].cells[0].appendChild(skilltable);
				newtable.rows[0].cells[1].appendChild(biddiv);
				
				//Now reducing the bid div cutting strings
				var toremove=biddiv.getElementsByTagName('strong');
				for (i=0;toremove.length;i++) {
					toremove.item(i).parentNode.removeChild(toremove.item(i));
				}
				toremove=biddiv.getElementsByTagName('b');
				for (i=0;toremove.length;i++) {
					toremove.item(i).parentNode.removeChild(toremove.item(i));
				}
			}
			catch (e) {
				Foxtrick.LOG(e);
				dump("FoxtrickSmallerPages"+e);
			}
		}
        
	},
	
	_adjust_bid : function ( doc ) {
		var biddiv = doc.getElementById('ctl00_CPMain_updBid');
		if (biddiv) {
			try {				
				//Now reducing the bid div cutting strings
				var toremove=biddiv.getElementsByTagName('strong');
				for (i=0;toremove.length;i++) {
					toremove.item(i).parentNode.removeChild(toremove.item(i));
				}
				toremove=biddiv.getElementsByTagName('b');
				for (i=0;toremove.length;i++) {
					toremove.item(i).parentNode.removeChild(toremove.item(i));
				}
				//Now removing text before numbers
				toremove=biddiv.getElementsByTagName('p');
				//for (i=0;toremove.length;i++) {
					//removing all non digit characters NOT WORKING
					//toremove[i].innerHTML=toremove[i].innerHTML.replace(/&nbsp;/g,"").replace(/[a-z]/g, "").replace(/[A-Z]/g, "");
					//Analyzing character per character
				//}
			}
			catch (e) {
				Foxtrick.LOG(e);
				dump("FoxtrickSmallerPages"+e);
			}
		}
        
	}

};

