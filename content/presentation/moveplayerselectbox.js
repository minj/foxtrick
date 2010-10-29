/**
 * moveplayerselectbox.js
 * option to move player select box up on playersdetail page
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickMovePlayerSelectbox= {
	MODULE_NAME : "MovePlayerSelectbox",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('playerdetail'),
    DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.4.7",
	LATEST_CHANGE:"option to move player select box up on playersdetail page (default off)",

    run : function( page, doc ) {
		var select =doc.getElementById('ctl00_CPSidebar_ddlSquad');
		if (!select) return;
		var box=select.parentNode;
		if (box.className!='sidebarBox') box=box.parentNode;
		box=box.parentNode.removeChild(box);
		var sidebar=doc.getElementById('ctl00_CPSidebar_pnlRight');
		sidebar.insertBefore(box,sidebar.firstChild);
	}
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
	PAGES : new Array('region'),
    DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.5.0.5",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	LATEST_CHANGE: "Simple speed check added. Don't move if there are more than about 80 managers online",

    run : function( page, doc ) {
		var mainBody = doc.getElementById('mainBody');
		var divs=mainBody.getElementsByTagName('div');
		var target=null;
		for (var i=0;i<divs.length;++i) {
			if (!target && divs[i].className=='separator') target=divs[i];

			if (divs[i].className=='mainBox') {
				var table=divs[i].getElementsByTagName('table')[0];
				if (table.className=='indent thin') continue;
				if (divs[i].getElementsByTagName('a').length>100) return;
				var div=mainBody.removeChild(divs[i]);
				mainBody.insertBefore(div,target);
				break;
			}
		}
	}
}
