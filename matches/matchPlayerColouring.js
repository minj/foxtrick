/**
 * Colors the player name in the match report.
 *  * @author tychobrailleur & Stephan57 &convincedd
 */

FoxtrickMatchPlayerColouring = {
	MODULE_NAME : "MatchPlayerColouring",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : new Array('match','teamPageAny','myhattrick','playerdetail'), 
	ONPAGEPREF_PAGE : 'match', 
    DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.5.1.2",
	LATEST_CHANGE:"Uses now goalgetter's and substitutions full playernames",	
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : new Array("color:black;", //My team
											"background:#FFCDCD; color:black; border:1px solid #CF8181;", //Home #FFAFAF 
                                            "background:#D2CDFF; color:black; border:1px solid #8981CF;" //Away #AFB0FF
											),
	OPTIONS : new Array("MyTeam", "Home", "Away"),
						
	OwnYouthTeamId : null,
    UNKNOWN_COLOUR : "#F0F0F0",
	
	init : function() {
    },
    
    run : function( page, doc ) { 
	try {
		// get youthteam id from left menue, if teamid=leftmenue teamid
		if (page=='teamPageAny' || page=='match')  {
				var myTeamId = FoxtrickHelper.findTeamId(doc.getElementById('teamLinks'));
				if  (this.OwnYouthTeamId==null) {
					var leftMenuTeamId = FoxtrickHelper.findTeamId(doc.getElementById('ctl00_pnlSubMenu'));
					if (myTeamId==leftMenuTeamId) 
						this.OwnYouthTeamId = FoxtrickHelper.findYouthTeamId(doc.getElementById('ctl00_pnlSubMenu'));
					Foxtrick.dump('OwnYouthTeamId: '+this.OwnYouthTeamId+'\n');
				}		
			if (page=='teamPageAny') return;
		}
        if (page=='myhattrick') {
			this.OwnYouthTeamId = null;
			return;
		} 
		if (page=='playerdetail') { // add matchreport highlight links to playerdetails
			var playername = doc.getElementById("mainWrapper").getElementsByTagName('a')[1].innerHTML;
			playerlastname = playername.substr(playername.lastIndexOf(' ')+1);
			//Foxtrick.dump('playerlastname: "'+playerlastname+'"\n');
			var as = doc.getElementById("mainBody").getElementsByTagName('a');
			for (var i=0;i<as.length;i++) {
				//Foxtrick.dump(as[i].href+' '+as[i].href.search(/Club\/Matches\/Match\.aspx\?matchID=/i)+'\n');
				if (as[i].href.search(/Club\/Matches\/Match\.aspx\?matchID=/i)!=-1) {
					as[i].href += '&highlight='+playerlastname;
					//Foxtrick.dump(as[i].href+'\n');
				}
			}
			return;
		}
		
		var isarchivedmatch = (doc.getElementById("ctl00_CPMain_lblMatchInfo")==null);
		var isprematch = (doc.getElementById("ctl00_CPMain_pnlPreMatch")!=null);
		if (isprematch ) return;
		
		var isyouth=false;
		var as = doc.getElementById("mainBody").getElementsByTagName('a');
		for (var i=0;i<as.length;i++) {
			if (as[i].href.search(/YouthArenaID/i)!=-1) {isyouth=true;break;}
			else if (as[i].href.search(/ArenaID/i)!=-1) {isyouth=false;break;}
		}
		
		var matchid = FoxtrickHelper.getMatchIdFromUrl(doc.location.href); 
		// exmaple xml use
		//Foxtrick.dump(Foxtrick.Matches.matchxmls[matchid].getElementsByTagName('AwayTeam')[0].getElementsByTagName('RatingMidfield')[0].textContent+'\n');
		//Foxtrick.alert(Foxtrick.Matches.matchxmls[matchid].getElementsByTagName('AwayTeam')[0].getElementsByTagName('RatingMidfield')[0].textContent+'\n');
		
		//Retrieve teams id
		var myTeamId = FoxtrickHelper.findTeamId(doc.getElementById('teamLinks'));
		if (isyouth) myTeamId = this.OwnYouthTeamId;
		var table = doc.getElementById('mainBody').getElementsByTagName('table');
		if (!table[0]) {
			// match not finished
			var HomeTeamId=FoxtrickHelper.getTeamIdFromUrl(doc.getElementById('sidebar').getElementsByTagName('a')[0].href);
			var AwayTeamId=FoxtrickHelper.getTeamIdFromUrl(doc.getElementById('sidebar').getElementsByTagName('a')[1].href);
		}
		else {
			var HomeTeamId=FoxtrickHelper.findTeamId(table[0].rows[0].cells[1]);
			var AwayTeamId=FoxtrickHelper.findTeamId(table[0].rows[0].cells[2]);
		}
		Foxtrick.dump ('ownteam: '+myTeamId+'\n');
		Foxtrick.dump ('HomeTeamId: '+HomeTeamId+'\n');
		Foxtrick.dump ('AwayTeamId: '+AwayTeamId+'\n');
		
		//Retrieve colour parameters
		if (Foxtrick.isModuleFeatureEnabled( this, "Home")) {
            var stlTeamA = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "Home_text");
            if (!stlTeamA) stlTeamA = this.OPTION_TEXTS_DEFAULT_VALUES[1];
        }
 		if (Foxtrick.isModuleFeatureEnabled( this, "Away")) {
            var stlTeamB = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "Away_text");
            if (!stlTeamB) stlTeamB = this.OPTION_TEXTS_DEFAULT_VALUES[2];
        }
		if (Foxtrick.isModuleFeatureEnabled( this, "MyTeam")) {
            var stlMyTeam = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "MyTeam_text");
            if (!stlMyTeam) stlMyTeam = this.OPTION_TEXTS_DEFAULT_VALUES[0];
			//Replace myTeam colour
			if (HomeTeamId == myTeamId) {stlTeamA = stlMyTeam; Foxtrick.dump ('ownteam = HomeTeam\n'); }
			else if (AwayTeamId == myTeamId) {stlTeamB = stlMyTeam; Foxtrick.dump ('ownteam = AwayTeam\n'); }
		}
	
				
        var content_div = doc.getElementById('content');
        if (content_div == null) return;
        
		var content = content_div.getElementsByTagName("h1")[0].parentNode.innerHTML;		
		if (content.indexOf('ft_mR_format')==-1) { 		       
			// get part between fisrt '.' after formation and end of paragraph	
			var contentA = content.substring(content.search(/Default\.aspx\?ArenaID=/i));
			contentA = contentA.substring(0,contentA.search(/\.\<br\>\<br\>/));
			contentA=contentA.substring(contentA.search(/\d-\d-\d/));
			contentA=contentA.substring(contentA.indexOf('.'));
				
			// get part between fisrt '.' after formation and end of paragraph
			var contentB = content.substring(content.search(/Default\.aspx\?ArenaID=/i));
			contentB = contentB.substring(contentB.search('.<br>')+9); 
			contentB=contentB.substring(0,contentB.search('.<br>')); 
			contentB=contentB.substring(contentB.search(/\d-\d-\d/));
			contentB=contentB.substring(contentB.indexOf('.')); 
		}
		else {  // matchreport coloring active
			var contentA=null;
			var contentB='';
			
			var divs=content_div.getElementsByTagName("h1")[0].parentNode.getElementsByTagName('div');
			for (var i=0;i<divs.length;++i) {
				if (divs[i].innerHTML.indexOf('ft_mR_format')!=-1) { 
					if (contentA==null) {
						contentA=divs[i+1].innerHTML; 
						contentA=contentA.substring(0,contentA.length-1);			
					}
					else{ 
						contentB=divs[i+1].innerHTML; 
						contentB=contentB.substring(0,contentB.length-1);
						break;
					}
				}
			}
		}

		//Foxtrick.dump('A: ' + contentA+'\n------\n');
		//Foxtrick.dump('B: '+ contentB+'\n--------\n');
		
		var teamA = "";
        var teamB = "";
		var num_unknown_namesA=0;
        var FirstTeam = true; 
        if (contentA) {
            teamA = contentA.replace(/ \- /g, ", ").split(", ");
        }
		if (teamA[0].search(':')!=-1) teamA[0]=teamA[0].substring(teamA[0].search(':')+2);
		else teamA[0]=teamA[0].substring(teamA[0].lastIndexOf(' ')+1);
		for (var k=0;k<teamA.length;k++) { 
			if (teamA[k]=='') {++num_unknown_namesA;teamA[k]='##################'; }// replace empty string with something which will not be found in text again
			//Foxtrick.dump(k+1+': "'+teamA[k]+'"\n');
		}
		var num_unknown_namesB=0;
        if (contentB) {
            teamB = contentB.replace(/ \- /g, ", ").split(", ");
        }
		if (teamB[0].search(':')!=-1) teamB[0]=teamB[0].substring(teamB[0].search(':')+2);
		else teamB[0]=teamB[0].substring(teamB[0].lastIndexOf(' ')+1);
 		for (var k=0;k<teamB.length;k++) { 
			if (teamB[k]=='') {++num_unknown_namesB;teamB[k]='##################'; } // replace empty string with something which will not be found in text again
			//Foxtrick.dump(k+1+': "'+teamB[k]+'"\n');
		}		
		//Retrieve substitutions+goals
		 var spans = doc.getElementById('sidebar').getElementsByTagName("td");
		 var hgoals=0;
		 for (var i=0; i<spans.length; i++) {
			if (spans[i].innerHTML.search(/\d+&nbsp;-&nbsp;\d+/)!=-1) {
				var hg = parseInt(spans[i].innerHTML.match(/(\d+)&nbsp;-&nbsp;\d+/)[1]);
				var as = spans[i+1].getElementsByTagName("a");
				//dump(hg+' '+hgoals+' '+as.length+' '+spans[i+1].innerHTML+'\n');
				if (hg > hgoals) {
					hgoals = hg;
					if (as.length!=0) teamA.push(as[0].innerHTML);
					else teamA.push(spans[i+1].innerHTML);
				}
				else {
					if (as.length!=0) teamB.push(as[0].innerHTML);
					else teamB.push(spans[i+1].innerHTML);
				}
			}
			
			var span_img = spans[i].getElementsByTagName("img");
			for (var j=0; j<span_img.length; j++) {
				if (span_img[j].src.search(/sub_out/)!=-1) {
				//if (FoxtrickMatchPlayerColouring._isLinkPlayer(span_a[j].href)) {
					//if (span_a[j].id == "") {
                        try { 
                            var PlayerIn=null;
							var PlayerOut=null;
							
							var span_a = span_img[j].parentNode.childNodes;
							//dump(span_img[j]parentNode.innerHTML+'\n');
							for (var k=1;k<span_a.length;++k) {
								/*Foxtrick.dump(k+' '+span_a[k].nodeType+' :');
								if (span_a[k].nodeType==3) Foxtrick.dump(span_a[k].nodeValue+' '+span_a[k].nodeValue.length);
								else Foxtrick.dump(span_a[k].innerHTML+' '+span_a[k].nodeName+' '+span_a[k].innerHTML.lenght);
								Foxtrick.dump('\n');
								*/
								if ( !PlayerOut) {
									if (span_a[k].nodeType==3 && span_a[k].nodeValue.length>2) {
										//Foxtrick.dump('in:'+span_a[k].nodeValue+'\n'); 
										PlayerOut = span_a[k].nodeValue;
										k+=2;
									}
									else if(span_a[k].nodeName=='A') {
									//dump('in:'+ span_a[k].innerHTML+'\n'); //
									PlayerOut = span_a[k].innerHTML;
									k+=2;
									}
								}
								else if ( !PlayerIn) {
									if (span_a[k].nodeValue && span_a[k].nodeValue.length>2) {
										PlayerIn = span_a[k].nodeValue;
										break;
									}
									else if(span_a[k].nodeName=='A') {
										PlayerIn = span_a[k].innerHTML;
										break;
									}									
								}														
							} 
							//Player Out
                            //PlayerOut = PlayerOut.substr(PlayerOut.search(" ")+1);
                            //Foxtrick.dump('sub out:'+j+' '+span_a[0].textContent+' = '+PlayerOut+'\n');
							//Player In
							//PlayerIn = PlayerIn.substr(PlayerIn.search(" ")+1);
                            //Foxtrick.dump('sub in:'+j+' '+' '+span_a[1].textContent+' = '+PlayerIn+'\n');
                            Foxtrick.dump('in:'+PlayerIn+' out:'+PlayerOut+'\n');
							
							//Add Player In to the players list
							//Foxtrick.dump (j+' '+teamA.length+' '+teamB.length+'\n');
							for (var k=0;k<teamA.length;k++) { //Foxtrick.dump(k+' '+teamA[k]+' '+PlayerOut+'\n');
							if (PlayerOut.search(teamA[k])!=-1) 
								{teamA.push(PlayerIn);break;}
							}
							for (var k=0;k<teamB.length;k++)  { //Foxtrick.dump(k+' '+teamB[k]+' '+PlayerOut+'\n');
							if (PlayerOut.search(teamB[k])!=-1) {teamB.push(PlayerIn);break;}
							}
							
                        }
                        catch(e) {
                            Foxtrick.dump('FoxtrickMatchPlayerColouring => Substitution=> ' + e+'\n');
                        }
					//}
				}
			}
		 }		 
		
		Foxtrick.dump('A: '+teamA+'\n');
		Foxtrick.dump('B: '+teamB+'\n');
		

		// just highlight single player
		if (doc.location.href.search(/highlight=.+/)!=-1) {
			var playerhighlight = doc.location.href.match(/highlight=(.+)/)[1]; 
			Foxtrick.dump(playerhighlight+'\n');
			teamA.splice(0,teamA.length);
			teamB.splice(0,teamB.length);
			teamA.push(playerhighlight);
			stlTeamA = this.OPTION_TEXTS_DEFAULT_VALUES[1];
			this.UNKNOWN_COLOUR='';
		}	
			
		var links = content_div.getElementsByTagName("a");
        
		 for (var i=0; i<links.length; i++) {
            if (FoxtrickMatchPlayerColouring._isLinkPlayer(links[i].href)) {
                //Foxtrick.dump('['+links[i].href +']\n');
                links[i].href+='&colored';
                links[i].style.border = "1px solid #ccc";
				links[i].style.padding = "0px 2px";
  				var iseventsbox=(links[i].parentNode.tagName=="TD");
							
				var playerFullName = links[i].textContent;
				if  (playerFullName.charAt(0)==" ") playerFullName = playerFullName.substr(1);
				var b = playerFullName.search(" ");
				var l = playerFullName.length;
				if (b>=0) {
					var playerName = playerFullName.substr(b+1,l-b+1);
				} else {
					var playerName = playerFullName;
				}				
				var foundA =false, foundFullA=false;
				for (var k=0;k<teamA.length;k++) { //Foxtrick.dump(teamA[k]+' '+playerName.indexOf(teamA[k])+'\t');
					if (teamA[k].indexOf(playerFullName)>-1) {foundFullA=true;	break;}				
					else if (playerName.indexOf(teamA[k])>-1) {foundA=true;}
				}
				var foundB =false, foundFullB=false;
				for (var k=0;k<teamB.length;k++) { 
					if (teamB[k].indexOf(playerFullName)>-1) {foundFullB=true; break;}
					else if (playerName.indexOf(teamB[k])>-1) {foundB=true;}
				}
                if ( (foundFullA && !foundFullB) || (foundA && !foundB) || (!foundA && !foundB && num_unknown_namesA>0 && num_unknown_namesB==0)) {
					links[i].setAttribute("style", stlTeamA + 'padding:0px 2px;'); 
					if (iseventsbox) {
						links[i].parentNode.parentNode.getElementsByTagName('td')[0].setAttribute("style", 'text-align:left;'); 
						if (links[i].previousSibling) links[i].setAttribute("style", links[i].getAttribute("style") + 'margin-left:3px;'); 					
					}
 				} 
				else if ((foundFullB && !foundFullA) || (foundB && !foundA) || (!foundA && !foundB && num_unknown_namesA==0 && num_unknown_namesB>0)) {
					links[i].setAttribute("style", stlTeamB + 'padding:0px 2px;'); 
					if (iseventsbox) {
						links[i].parentNode.parentNode.getElementsByTagName('td')[0].setAttribute("style", 'text-align:right;'); 					
						if (links[i].previousSibling) links[i].setAttribute("style", links[i].getAttribute("style") + 'margin-left:3px;'); 					
					}
                 }    
                else {
                    links[i].style.backgroundColor = FoxtrickMatchPlayerColouring.UNKNOWN_COLOUR;
                 }
				 //Foxtrick.dump('\np: "'+ playerName+'" A: '+foundA+' B: '+foundB+'\n');
             } 
			 //Colors the name of the teams  on the right box like the players
			 else { 
			     if (FoxtrickMatchPlayerColouring._isLinkTeam(links[i].href)) {
					 if (links[i].parentNode.parentNode.parentNode.parentNode.tagName=="TBODY") {
						links[i].style.border = "1px solid #ccc";
						links[i].style.padding = "0px 2px";
						if (FirstTeam) {
							links[i].setAttribute("style", stlTeamA + ' border:1px solid #ccc;padding:0px 2px;'); 
							FirstTeam = false;
						}
						else {
							links[i].setAttribute("style", stlTeamB + ' border:1px solid #ccc;padding:0px 2px;'); 
						}
					 }
				}
			 }
         }
	} catch(e) {Foxtrick.dump('PlayerColoring error: '+e+'\n');}
    },

    change : function(page, doc ) {
		if (page=='playerdetail') { // add matchreport highlight links to playerdetails
			var playername = doc.getElementById("mainWrapper").getElementsByTagName('a')[1].innerHTML;
			playerlastname = playername.substr(playername.lastIndexOf(' ')+1);
			//Foxtrick.dump('playerlastname: "'+playerlastname+'"\n');
			var as = doc.getElementById("mainBody").getElementsByTagName('a');
			for (var i=0;i<as.length;i++) {
				//Foxtrick.dump(as[i].href+' '+as[i].href.search(/Club\/Matches\/Match\.aspx\?matchID=/i)+'\n');
				if (as[i].href.search(/Club\/Matches\/Match\.aspx\?matchID=/i)!=-1 && as[i].href.search(/highlight/i)==-1) {
					as[i].href += '&highlight='+playerlastname;
					//Foxtrick.dump(as[i].href+'\n');
				}
			}
			return;
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