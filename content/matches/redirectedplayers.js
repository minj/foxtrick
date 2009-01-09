/**
 * redirectedplayers.js
 * Foxtrick colors redirected Players
 * @author spambot
 */

////////////////////////////////////////////////////////////////////////////////

var FoxtrickRedirectedPlayers = {

	MODULE_NAME : "RedirectedPlayers",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	DEFAULT_ENABLED : true,
    
    
    PLAYERIDS : new Array (
                            "ctl00_CPMain_ucKeeper_pnlbox",
                            "ctl00_CPMain_ucLeftBack_pnlbox",
                            "ctl00_CPMain_ucCentralDefender1_pnlbox",
                            "ctl00_CPMain_ucCentralDefender2_pnlbox",
                            "ctl00_CPMain_ucrightback_pnlbox",
                            "ctl00_CPMain_ucLeftwinger_pnlbox",
                            "ctl00_CPMain_ucInnerMidfield1_pnlbox",
                            "ctl00_CPMain_ucInnerMidfield2_pnlbox",
                            "ctl00_CPMain_ucrightwinger_pnlbox",
                            "ctl00_CPMain_ucForward1_pnlbox",
                            "ctl00_CPMain_ucForward2_pnlbox"
                          ),
	
	init : function() {
			Foxtrick.registerPageHandler( 'matchLineup',
                                          FoxtrickRedirectedPlayers );
    },

    run : function( page, doc ) {
                var HIGHLIGHT = "#FF4040";
                var playerdivs = getElementsByClass( "position", doc );
                
                for (var i = 0; i < playerdivs.length; i++) {
                    // playerdivs[i].setAttribute( "style", "color :#ABCDEF" );
                    // dump('#' + i + ': ' + Foxtrick.trim(playerdivs[i].innerHTML) + ' - ' + playerdivs[i].parentNode.id + '\n');
                    // dump( ' TEST ' );
                    var player_id = playerdivs[i].parentNode.id;
                    var player_pos = Foxtrick.trim(playerdivs[i].innerHTML);
                    dump('#' + i + ': ' + player_pos + ' - ' + player_id + '\n');
                    switch ( player_id ) {
                        case this.PLAYERIDS[0]: 
                            if (player_pos != Foxtrickl10n.getString('foxtrick.matches.Keeper')) 
                                playerdivs[i].setAttribute( "style", "color :" + HIGHLIGHT ); 
                            break;
                        case this.PLAYERIDS[1]: 
                            if (player_pos != Foxtrickl10n.getString('foxtrick.matches.LeftBack')) playerdivs[i].setAttribute( "style", "color :" + HIGHLIGHT );
                            break;
                        case this.PLAYERIDS[2]: 
                            if (player_pos != Foxtrickl10n.getString('foxtrick.matches.CentralDefender')) playerdivs[i].setAttribute( "style", "color :" + HIGHLIGHT );
                            break;
                        case this.PLAYERIDS[3]: 
                            if (player_pos != Foxtrickl10n.getString('foxtrick.matches.CentralDefender')) playerdivs[i].setAttribute( "style", "color :" + HIGHLIGHT );
                            break;
                        case this.PLAYERIDS[4]: 
                            if (player_pos != Foxtrickl10n.getString('foxtrick.matches.RightBack')) playerdivs[i].setAttribute( "style", "color :" + HIGHLIGHT );
                            break;
                        case this.PLAYERIDS[5]: 
                            if (player_pos != Foxtrickl10n.getString('foxtrick.matches.Leftwinger')) playerdivs[i].setAttribute( "style", "color :" + HIGHLIGHT );
                            break;
                        case this.PLAYERIDS[6]: 
                            if (player_pos != Foxtrickl10n.getString('foxtrick.matches.InnerMidfield')) playerdivs[i].setAttribute( "style", "color :" + HIGHLIGHT );
                            break;
                        case this.PLAYERIDS[7]: 
                            if (player_pos!= Foxtrickl10n.getString('foxtrick.matches.InnerMidfield')) playerdivs[i].setAttribute( "style", "color :" + HIGHLIGHT );
                            break;
                        case this.PLAYERIDS[8]: 
                            if (player_pos!= Foxtrickl10n.getString('foxtrick.matches.Rightwinger')) playerdivs[i].setAttribute( "style", "color :" + HIGHLIGHT );
                            break;
                        case this.PLAYERIDS[9]: 
                            if (player_pos != Foxtrickl10n.getString('foxtrick.matches.Forward')) playerdivs[i].setAttribute( "style", "color :" + HIGHLIGHT );
                            break;
                        case this.PLAYERIDS[10]: 
                            if (player_pos != Foxtrickl10n.getString('foxtrick.matches.Forward')) playerdivs[i].setAttribute( "style", "color :" + HIGHLIGHT );
                            break;
                    }
                    
                }
	},
	
	change : function( page, doc ) {
	
	}
};