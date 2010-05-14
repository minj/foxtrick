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
		if ( Foxtrick.isModuleEnabled(FoxtrickContextMenueCopyId) && event.target.href && 
				( event.target.href.search(/ID=/i) != -1 ||  event.target.href.search(/\/Forum\/Read.aspx\?t=\d+&n=\d+/gi) != -1 ) )  {
			
			var copytext = '';
			var context = ''; 
			var href = event.target.href;
				
			// some id
			if (href.search(/ID=/i) != -1) {
				var id = event.target.href.match(/id=(\d+)/i)[1]; 
				var idtype= event.target.href.match(/\?(.+id)=\d+|\&(.+id)=\d+/i)[1];
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
				else if ( href.search(/\?userId=\d+"/gi) != -1 ) ml = '[userid=';
				else if ( href.search(/\?KitID=\d+/gi) != -1 ) ml = '[kitid=';
				else if ( href.search(/\?ArticleID=\d+/gi) != -1 ) ml = '[articleid=';
				
				
				copytext = id;
				context = "-"+idtype+': ' +id; 
				if (ml!=='') {
					copytext = ml + id + ']';
					context = ': '+copytext;
				}
			}
			else { // forum post
				if ( href.search(/\/Forum\/Read.aspx\?t=\d+&n=\d+/gi) != -1 ) {
					var id = href.replace(/.+Forum\/Read.aspx\?t=(\d+)&n=(\d+).+/gi,'$1.$2');				
					copytext = '[post=' + id + ']';
					context = ': '+copytext;
				}
			}
			
			if (copytext!=='') {
				Foxtrick.CopyID = copytext;
				Foxtrick.popupMenu.setAttribute( "hidden", false); 
				Foxtrick.popupMenu.setAttribute( "label", Foxtrickl10n.getString( "foxtrick.CopyContext")+context);
			}
			else Foxtrick.popupMenu.setAttribute( "hidden", true); 			
		}
		else {  //hide old
			Foxtrick.popupMenu.setAttribute( "hidden", true); 			
		}
	} catch(e){Foxtrick.dump('contextCopy: '+e)};
	},	
};	