/**
 * move-player-select-box.js
 * option to move player select box up on playersdetail page
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickMovePlayerSelectbox= {
	MODULE_NAME : "MovePlayerSelectbox",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('playerdetail'),

    run : function( page, doc ) {
		var select =doc.getElementById('ctl00_ctl00_CPContent_CPSidebar_ddlSquad');
		if (!select) return;
		var box=select.parentNode;
		if (box.className!='sidebarBox') box=box.parentNode;
		box=box.parentNode.removeChild(box);
		var sidebar=doc.getElementById('ctl00_ctl00_CPContent_CPSidebar_pnlRight');
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
