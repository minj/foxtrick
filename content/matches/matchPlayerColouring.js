/**
 * Colors the player name in the match report.
 *  * @author tychobrailleur & Stephan57
 */

FoxtrickMatchPlayerColouring = {
	MODULE_NAME : "MatchPlayerColouring",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	DEFAULT_ENABLED : true,
	WHITE_COLOUR : "#fff",
	BLACK_COLOUR : "#000",
	
	init : function() {
        Foxtrick.registerPageHandler( "match",
                                      FoxtrickMatchPlayerColouring );
    },
    
    run : function( page, doc ) {
        var content = doc.getElementsByTagName("h1")[0].parentNode.textContent;
        var teamA = null;
        var teamB = null;
        var regexp = new RegExp(":([^\\.]*?)\\.");
		var FirstTeam = true; 
        var matchteamA = regexp.exec(content);
        if (matchteamA) {
            var resultat = doc.getElementById("resultat");
            teamA = matchteamA[1].replace(/ \- /g, ", ").split(", ");
        }

        content = content.substring(content.indexOf(matchteamA[0])+matchteamA[0].length);
        var matchteamB = regexp.exec(content);
        if (matchteamB) {
            var resultat = doc.getElementById("resultat");
            teamB = matchteamB[1].replace(/ \- /g, ", ").split(", ");
         }
         
         var links = doc.getElementsByTagName("a");
         for each(link in links) {
             if (FoxtrickMatchPlayerColouring._isLinkPlayer(link.href)) {
                 link.style.border = "1px solid #ccc";
                 var playerName = link.textContent;
                 for each(player in teamA) {
                     if (playerName.indexOf(player) >=0) {
                         link.style.backgroundColor = FoxtrickMatchPlayerColouring.WHITE_COLOUR;
                     }
                 }
                 
                 for each(player in teamB) {
                     if (playerName.indexOf(player) >=0) {
                         link.style.backgroundColor = FoxtrickMatchPlayerColouring.BLACK_COLOUR;
                         link.style.color = FoxtrickMatchPlayerColouring.WHITE_COLOUR;
                     }                 
                 }
             } 
			 //Colors the name of the teams  on the right box like the players
			 else { 
			     if (FoxtrickMatchPlayerColouring._isLinkTeam(link.href)) {
					 if (link.parentNode.parentNode.parentNode.parentNode.tagName=="TBODY") {
						link.style.border = "1px solid #ccc";
						if (FirstTeam) {
							link.style.backgroundColor = FoxtrickMatchPlayerColouring.BLACK_COLOUR;
							link.style.color = FoxtrickMatchPlayerColouring.WHITE_COLOUR;
							FirstTeam = false;
						}
						else {
						    link.style.backgroundColor = FoxtrickMatchPlayerColouring.WHITE_COLOUR;
						}
					 }
				}
			 }
         }
    },
    
    _isLinkPlayer : function(url) {
        if (url) {
            return url.match(/Player\.aspx/);
        }
        return false;
    },

	_isLinkTeam : function(url) {
        if (url) {
            return url.match(/Club\/\?TeamID=/i);
        }
        return false;
    }

};