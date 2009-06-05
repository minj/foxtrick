/**
 * contextmenue.js
 * Foxtrick add to contextmenue  at copyid feature
 * @author convinced
 */

var FoxtrickContextMenueCopyId = {

    MODULE_NAME : "ContextMenueCopyId",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    PAGES : new Array('all'), 
	DEFAULT_ENABLED : true,
	ID:'',
     
    init : function() {
    },

    run : function( page, doc ) {
	},

	change : function( page, doc ) {
	},

	onContext: function(event) { 
	try {
		if ( Foxtrick.isModuleEnabled(FoxtrickContextMenueCopyId) && event.target.href && event.target.href.search(/ID=/i) != -1 ) {
			var id = event.target.href.match(/id=(\d+)/i)[1]; 
			var idtype= event.target.href.match(/\?(.+id)=\d+|\&(.+id)=\d+/i)[1];
			idtype = idtype.charAt(0).toUpperCase()+idtype.substring(1);
			Foxtrick.CopyID=id;
			Foxtrick.popupMenu.setAttribute( "hidden", false); 
			Foxtrick.popupMenu.setAttribute( "label", Foxtrickl10n.getString( "foxtrick.CopyContext")+"-"+idtype+': ' +id );
		}
	} catch(e){dump(e)};
	},	
};	