/**
 * Colors the player name in the match report.
 *  * @author tychobrailleur & Stephan57
 */

FoxtrickMatchPlayerColouring = {
	MODULE_NAME : "MatchPlayerColouring",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	DEFAULT_ENABLED : true,
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : new Array("background:#c3d9ff; color:black;", //My team
											"background:white; color:black;", //Home
                                            "background:black; color:white;" //Away
											),
	OPTIONS : new Array("My Team", "Home", "Away"),
						
    UNKNOWN_COLOUR : "#F0F0F0",
	
	init : function() {
        Foxtrick.registerPageHandler( "match",
                                      FoxtrickMatchPlayerColouring );
    },
    
    run : function( page, doc ) {
        
		//Retrieve teams id
		var myTeamId=FoxtrickHelper.findTeamId(doc.getElementById('teamLinks'));
		var table = doc.getElementById('mainBody').getElementsByTagName('table')[0];
		var HomeTeamId=FoxtrickHelper.findTeamId(table.rows[0].cells[1]);
		var AwayTeamId=FoxtrickHelper.findTeamId(table.rows[0].cells[2]);
		
		dump ('ownteam: '+myTeamId+'\n');
		dump ('HomeTeamId: '+HomeTeamId+'\n');
		dump ('AwayTeamId: '+AwayTeamId+'\n');
		
		//Retrieve colour parameters
		if (Foxtrick.isModuleFeatureEnabled( this, "My Team")) {
            var stlMyTeam = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "My Team_text");
            if (!stlMyTeam) stlMyTeam = this.OPTION_TEXTS_DEFAULT_VALUES[0];
		}
		if (Foxtrick.isModuleFeatureEnabled( this, "Home")) {
            var stlTeamA = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "Home_text");
            if (!stlTeamA) stlTeamA = this.OPTION_TEXTS_DEFAULT_VALUES[1];
        }
 		if (Foxtrick.isModuleFeatureEnabled( this, "Away")) {
            var stlTeamB = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "Away_text");
            if (!stlTeamB) stlTeamB = this.OPTION_TEXTS_DEFAULT_VALUES[2];
        }
	
		//Replace myTeam colour
		if (HomeTeamId == myTeamId) stlTeamA = stlMyTeam;
		else if (AwayTeamId == myTeamId) stlTeamB = stlMyTeam;
				
        var content_div = doc.getElementById('content');
        if (content_div == null) return;
        var teamA = "";
        var teamB = "";
        var content = content_div.getElementsByTagName("h1")[0].parentNode.textContent;
        var regexp = new RegExp(": ([^\\.]*?)\\.");
		var FirstTeam = true; 
        var matchteamA = regexp.exec(content);
        if (matchteamA) {
            teamA = matchteamA[1].replace(/ \- /g, ", ").split(", ");
        //    dump(teamA + '\n');
        }
		content = content.substring(content.indexOf(matchteamA[0])+matchteamA[0].length);
        var matchteamB = regexp.exec(content);
        if (matchteamB) {
            teamB = matchteamB[1].replace(/ \- /g, ", ").split(", ");
           // dump(teamB + '\n');
         }
		//Retrieve substitutions
		 var spans = content_div.getElementsByTagName("span");
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
                                    teamA.push(PlayerIn);
								 }
                            if (teamB.indexOf(PlayerOut) >=0) {
                                    teamB.push(PlayerIn);
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
		 
 
 
		var links = content_div.getElementsByTagName("a");
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
				playerName=links[i].textContent;// dump('p: '+ playerName+'\n');
				var foundA =false;
				for (var k=0;k<teamA.length;k++) { //dump(teamA[k]+' '+playerName.indexOf(teamA[k])+'\n');
					if (playerName.indexOf(teamA[k])>-1) foundA=true; 
				}
				var foundB =false;
				for (var k=0;k<teamB.length;k++) { //dump(teamB[k]+' '+playerName.indexOf(teamB[k])+'\n');
					if (playerName.indexOf(teamB[k])>-1) foundB=true; 
				}
                if (foundA && !foundB) {
					links[i].setAttribute("style", stlTeamA + 'border:1px solid #ccc;padding:0px 2px;'); 
                } 
				 else if (foundB && !foundA) {
					links[i].setAttribute("style", stlTeamB + 'border:1px solid #ccc;padding:0px 2px;'); 
                 }    
                 else {
                    links[i].style.backgroundColor = FoxtrickMatchPlayerColouring.UNKNOWN_COLOUR;
                 }
             } 
			 //Colors the name of the teams  on the right box like the players
			 else { 
			     if (FoxtrickMatchPlayerColouring._isLinkTeam(links[i].href)) {
					 if (links[i].parentNode.parentNode.parentNode.parentNode.tagName=="TBODY") {
						links[i].style.border = "1px solid #ccc";
						links[i].style.padding = "0px 2px";
						if (FirstTeam) {
							links[i].setAttribute("style", stlTeamA + 'border:1px solid #ccc;padding:0px 2px;'); 
 							FirstTeam = false;
						}
						else {
							links[i].setAttribute("style", stlTeamB + 'border:1px solid #ccc;padding:0px 2px;'); 
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