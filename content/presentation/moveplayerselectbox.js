/**
 * moveplayerselectbox.js
 * option to move player select box up on playersdetail page
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickMovePlayerSelectbox= {
    
		MODULE_NAME : "MovePlayerSelectbox",
        MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
        DEFAULT_ENABLED : false,
		NEW_AFTER_VERSION: "0.4.7",	
		LASTEST_CHANGE:"option to move player select box up on playersdetail page (default off)",

    init : function() {
            Foxtrick.registerPageHandler( 'playerdetail',this);
    },

    run : function( page, doc ) {
		try {
		var select =doc.getElementById('ctl00_CPSidebar_ddlSquad');
		var box=select.parentNode;
		if (box.className!='sidebarBox') box=box.parentNode;
		box=box.parentNode.removeChild(box);
		var sidebar=doc.getElementById('ctl00_CPSidebar_pnlRight');
		sidebar.insertBefore(box,sidebar.firstChild);
		
		
		}
		catch (e) {dump("FoxtrickTeamSelectBox: "+e+'\n');}	
	},
	
    change : function( page, doc ) {
	},
}



/**
 * movemanageronline.js
 * option to move player select box up on playersdetail page
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickMoveManagerOnline= {
    
		MODULE_NAME : "MoveManagerOnline",
        MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
        DEFAULT_ENABLED : false,
		NEW_AFTER_VERSION: "0.4.7",	
		LASTEST_CHANGE: "option to move move online managers up on region page (default off)",

    init : function() {
            Foxtrick.registerPageHandler( 'region',this);
    },

    run : function( page, doc ) {
		try {
		var mainBody = doc.getElementById('mainBody');
		var divs=mainBody.getElementsByTagName('div');
		var target=null;
		for (var i=0;i<divs.length;++i) {
			if (!target && divs[i].className=='separator') target=divs[i];
			
			if (divs[i].className=='mainBox') {
				var table=divs[i].getElementsByTagName('table')[0];
				if (table.className=='indent thin') continue;
				var div=mainBody.removeChild(divs[i]);
				mainBody.insertBefore(div,target);
				break;
			}
		}
		
	} catch (e) {dump("FoxtrickTeamSelectBox: "+e+'\n');}	

	},
	
    change : function( page, doc ) {
	},
}
