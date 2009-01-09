/**
 * teamselectbox.js
 * Foxtrick team select box
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickTeamSelectBox= {
    
    MODULE_NAME : "TeamSelectBox",
        MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
        DEFAULT_ENABLED : true,

    init : function() {
            Foxtrick.registerPageHandler( 'players',
                                          FoxtrickTeamSelectBox);
    },

    run : function( page, doc ) {

		var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="sidebarBox" ) {
				var header = alldivs[j].getElementsByTagName("h2")[0];
				if (header.innerHTML == Foxtrickl10n.getString("foxtrick.tweaks.overview" )) {
					var selectbox = doc.createElement("select");
					selectbox.className = "ownselectbox";
					selectbox.addEventListener('change',FoxtrickTeamSelectBox_Select,false);
					selectbox.setAttribute("id", "ownselectboxID" );
					FoxtrickTeamSelectBox_Select.doc=doc;
					
					var option = doc.createElement("option");
					option.setAttribute("value","");
					option.innerHTML=Foxtrickl10n.getString("foxtrick.tweaks.selectplayer" );
					selectbox.appendChild(option);	
						
					var player = alldivs[j].getElementsByTagName("a")[0];
					var pn=player.parentNode;
					while (player){
						var option = doc.createElement("option");
						option.setAttribute("value",player.href);
						option.innerHTML=player.innerHTML;
						selectbox.appendChild(option);
						pn.removeChild(player);	
						player=alldivs[j].getElementsByTagName("a")[0];																
					}
					pn.appendChild(selectbox);
					break;
				}
			}
		}
	},
        
    change : function( page, doc ) {
		if( !doc.getElementById ( "ownselectboxID" ) ) {
			this.run( page, doc );
		}	
	},
};

function FoxtrickTeamSelectBox_Select(evt) {
		var doc=FoxtrickTeamSelectBox_Select.doc;
		doc.location.href=evt["target"]["value"];						
}
