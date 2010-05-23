/**
 * contextMenuCopyId.js
 * Add a button for copying ID to context menu
 * @author convinced
 */

var FoxtrickContextMenuCopyId = {

    MODULE_NAME : "ContextMenuCopyId",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    PAGES : new Array('all'), 
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION : "0.5.1.3",
	LATEST_CHANGE : "Added HT-ML tags if appropriate",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	ID:'',
     
    init : function() {
    },

    run : function( page, doc ) {
	},

	change : function( page, doc ) {
	},

	onContext: function(event) { 
	try {		
		if ( !Foxtrick.isModuleEnabled(FoxtrickContextMenuCopyId) ) 
		{  //hide old
			Foxtrick.popupMenu.setAttribute( "hidden", true); 
			Foxtrick.popupMenuHT_ML.setAttribute( "hidden", true); 
			return;			
		}
				
		var href = event.target.href;
		// if eg link has strong tag
		if (!href) href = event.target.parentNode.href; 
		if (!href) 
		{  //hide old
			Foxtrick.popupMenu.setAttribute( "hidden", true); 
			Foxtrick.popupMenuHT_ML.setAttribute( "hidden", true); 
			return;			
		}
		
		if ( href && href.search(/ID=/i) != -1 || href.search(/\/Forum\/Read.aspx\?t=\d+&n=\d+/gi) != -1 ) 
		{
			var copytext = '';
			var context = ''; 
			var contexttype = '';
			var id = '';		
			
			// some id
			if (href.search(/ID=/i) != -1) {
				id = href.match(/id=(\d+)/i)[1]; 
				var idtypeend = href.search(/\id/i)+2;
				var idtype = href.substring(0,idtypeend);
				var idtypestart = Math.max(idtype.lastIndexOf('?'),idtype.lastIndexOf('&'));
				var idtype = idtype.substring(idtypestart+1);
				idtype = idtype.charAt(0).toUpperCase()+idtype.substring(1);
			
				var ml='';
				if ( href.search(/\?playerId=\d+/gi) != -1 ) ml = '[playerid=';
				else if ( href.search(/\?YouthPlayerID=\d+/gi) != -1 ) ml = '[youthplayerid=';
				else if ( href.search(/\?TeamID=\d+/gi) != -1 ) ml = '[teamid=';
				else if ( href.search(/\?YouthTeamID=\d+/gi) != -1 ) ml = '[youthteamid=';
				else if ( href.search(/\?matchID=\d+&/gi) != -1 ) ml = '[matchid=';
				else if ( href.search(/\?matchID=\d+&isYouth=True/gi) != -1 ) ml = '[youthmatchid=';
				else if ( href.search(/\?AllianceID=\d+/gi) != -1 ) ml = '[federationid=';
				else if ( href.search(/\?LeagueLevelUnitID=\d+/gi) != -1 ) ml = '[leagueid=';
				else if ( href.search(/\?YouthLeagueId=\d+/gi) != -1 ) ml = '[youthleagueid=';
				else if ( href.search(/\?userId=\d+/gi) != -1 ) ml = '[userid=';
				else if ( href.search(/\?KitID=\d+/gi) != -1 ) ml = '[kitid=';
				else if ( href.search(/\?ArticleID=\d+/gi) != -1 ) ml = '[articleid=';
				
				copytext = id;
				contexttype = " "+idtype+': ' +id; 
				if (ml!=='') {
					copytext = ml + id + ']';
					context = ': '+copytext;
				}
			}
			else { // forum post
				if ( href.search(/\/Forum\/Read.aspx\?t=\d+&n=\d+/gi) != -1 ) {
					id = href.replace(/.+Forum\/Read.aspx\?t=(\d+)&n=(\d+).+/gi,'$1.$2');				
					var contexttype = ' PostID: ' +id; 
					copytext = '[post=' + id + ']';
					context = ': '+copytext;
				}
			}
			
			if (id!=='') {
				Foxtrick.CopyID = id;
				Foxtrick.CopyIDHT_ML = copytext;
				Foxtrick.popupMenu.setAttribute( "hidden", false); 
				Foxtrick.popupMenu.setAttribute( "label", Foxtrickl10n.getString( "foxtrick.CopyContext")+contexttype);
				Foxtrick.popupMenuHT_ML.setAttribute( "hidden", false); 
				Foxtrick.popupMenuHT_ML.setAttribute( "label", Foxtrickl10n.getString( "foxtrick.CopyContext")+context);
			}
			else {
				Foxtrick.popupMenu.setAttribute( "hidden", true); 			
				Foxtrick.popupMenuHT_ML.setAttribute( "hidden", true); 			
			}
		}
		else {  //hide old
			Foxtrick.popupMenu.setAttribute( "hidden", true); 
			Foxtrick.popupMenuHT_ML.setAttribute( "hidden", true); 
		}
	} catch(e){Foxtrick.dump('contextCopy: '+e)};
	},	
};	
