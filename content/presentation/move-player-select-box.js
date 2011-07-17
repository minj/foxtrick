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

	run : function(doc) {
		var select =doc.getElementById('ctl00_ctl00_CPContent_CPSidebar_ddlSquad');
		if (!select) return;
		var box=select.parentNode;
		if (box.className!='sidebarBox') box=box.parentNode;
		box=box.parentNode.removeChild(box);
		var sidebar=doc.getElementById('ctl00_ctl00_CPContent_CPSidebar_pnlRight');
		sidebar.insertBefore(box,sidebar.firstChild);
	}
}
