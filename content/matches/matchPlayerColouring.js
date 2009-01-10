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
        var regexp = new RegExp(": ([^\\.]*?)\\.");
		var FirstTeam = true; 
        var matchteamA = regexp.exec(content);
        if (matchteamA) {
            teamA = matchteamA[1].replace(/ \- /g, ", ").split(", ");
            //dump(teamA + '\n');
        }

        content = content.substring(content.indexOf(matchteamA[0])+matchteamA[0].length);
        var matchteamB = regexp.exec(content);
        if (matchteamB) {
            teamB = matchteamB[1].replace(/ \- /g, ", ").split(", ");
            //dump(teamB + '\n');
         }
         
		 //Retrieve substitutions
		 var spans = doc.getElementsByTagName("span");
		 for (var i=0; i<spans.length; i++) {
			var span_a = spans[i].getElementsByTagName("a");
			for (var j=0; j<span_a.length; j++) {
				if (FoxtrickMatchPlayerColouring._isLinkPlayer(span_a[j].href)) {
					if (span_a[j].id == "") {
                        try {
                            //Player Out
                            var SubPlayerName = span_a[j].textContent;
                            var b = SubPlayerName.lastIndexOf(" ");
                            var l = SubPlayerName.length;
                            if (b>=0) {
                                var PlayerOut = SubPlayerName.substr(b+1,l-b+1);
                            } else {
                                var PlayerOut = SubPlayerName;
                            }
                            //Player In
                            var SubPlayerName = span_a[j+1].textContent;
                            var b = SubPlayerName.lastIndexOf(" ");
                            var l = SubPlayerName.length;
                            if (b>=0) {
                                var PlayerIn = SubPlayerName.substr(b+1,l-b+1);
                            } else {
                                var PlayerIn = SubPlayerName;
                            }
                            //Add Player In to the players list
                            if (teamA.indexOf(PlayerOut) >=0) {
                                    teamA = teamA + "," + PlayerIn;
                                }
                            if (teamB.indexOf(PlayerOut) >=0) {
                                    teamB = teamB + "," + PlayerIn;
                                }
                            j=j+1;
                        }
                        catch(e) {
                            dump('FoxtrickMatchPlayerColouring => Substitution=> ' + e);
                        }
					}
				}
			}
		 }
		 
         var links = doc.getElementsByTagName("a");
		 for (var i=0; i<links.length; i++) {
             if (FoxtrickMatchPlayerColouring._isLinkPlayer(links[i].href)) {
                 links[i].style.border = "1px solid #ccc";
				 links[i].style.padding = "0px 2px";
  				 var playerFullName = links[i].textContent;
				 var b = playerFullName.lastIndexOf(" ");
				 var l = playerFullName.length;
				 if (b>=0) {
					var playerName = playerFullName.substr(b+1,l-b+1);
				 } else {
					var playerName = playerFullName;
				 }

                 if (teamA.indexOf(playerName) >=0) {
                     links[i].style.backgroundColor = FoxtrickMatchPlayerColouring.WHITE_COLOUR;
                     links[i].style.color = FoxtrickMatchPlayerColouring.BLACK_COLOUR;
                 }
                 if (teamB.indexOf(playerName) >=0) {
                     links[i].style.backgroundColor = FoxtrickMatchPlayerColouring.BLACK_COLOUR;
                     links[i].style.color = FoxtrickMatchPlayerColouring.WHITE_COLOUR;
                 }                 
             } 
			 //Colors the name of the teams  on the right box like the players
			 else { 
			     if (FoxtrickMatchPlayerColouring._isLinkTeam(links[i].href)) {
					 if (links[i].parentNode.parentNode.parentNode.parentNode.tagName=="TBODY") {
						links[i].style.border = "1px solid #ccc";
						links[i].style.padding = "0px 2px";
						if (FirstTeam) {
							links[i].style.backgroundColor = FoxtrickMatchPlayerColouring.WHITE_COLOUR;
							links[i].style.color = FoxtrickMatchPlayerColouring.BLACK_COLOUR;
							FirstTeam = false;
						}
						else {
						    links[i].style.backgroundColor = FoxtrickMatchPlayerColouring.BLACK_COLOUR;
							links[i].style.color = FoxtrickMatchPlayerColouring.WHITE_COLOUR;
						}
					 }
				}
			 }
         }
    },

    change : function(url) {
        
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