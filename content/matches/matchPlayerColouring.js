/**
 * Colors the player name in the match report.
 *  * @author tychobrailleur & Stephan57 &convincedd
 */

FoxtrickMatchPlayerColouring = {
	MODULE_NAME : "MatchPlayerColouring",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : new Array('match','teamPageAny','myhattrick'), 
	ONPAGEPREF_PAGE : 'match', 
    DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.5.0.2",
	LATEST_CHANGE:"Fix for yyyy-mm-dd dateformat",	
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
		// get first youthteam id, assume its your own
		if (page=='teamPageAny')  {
			if  (this.OwnYouthTeamId==null) this.OwnYouthTeamId = FoxtrickHelper.findYouthTeamId(doc.getElementById('ctl00_pnlSubMenu'));
			return;
		}
        if (page=='myhattrick') {
			this.OwnYouthTeamId = null;
			return;
		}
		
		var isarchivedmatch = (doc.getElementById("ctl00_CPMain_lblMatchInfo")==null);
		var isprematch = (doc.getElementById("ctl00_CPMain_pnlPreMatch")!=null);
		if (isprematch ) return;
		
		var isyouth=false;
		var as = doc.getElementById("mainBody").getElementsByTagName('a');
		for (var i=0;i<as.lebgth;i++) {
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
			if (HomeTeamId == myTeamId) stlTeamA = stlMyTeam;
			else if (AwayTeamId == myTeamId) stlTeamB = stlMyTeam;
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
			Foxtrick.dump(k+1+': "'+teamA[k]+'"\n');
		}
		var num_unknown_namesB=0;
        if (contentB) {
            teamB = contentB.replace(/ \- /g, ", ").split(", ");
        }
		if (teamB[0].search(':')!=-1) teamB[0]=teamB[0].substring(teamB[0].search(':')+2);
		else teamB[0]=teamB[0].substring(teamB[0].lastIndexOf(' ')+1);
 		for (var k=0;k<teamB.length;k++) { 
			if (teamB[k]=='') {++num_unknown_namesB;teamB[k]='##################'; } // replace empty string with something which will not be found in text again
			Foxtrick.dump(k+1+': "'+teamB[k]+'"\n');
		}		
		//Retrieve substitutions
		 var spans = doc.getElementById('sidebar').getElementsByTagName("td");
		 for (var i=0; i<spans.length; i++) {
			//var span_a = spans[i].getElementsByTagName("a");
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
								/*dump(k+' '+span_a[k].nodeType+' :');
								if (span_a[k].nodeType==3) dump(span_a[k].nodeValue+' '+span_a[k].nodeValue.length);
								else dump(span_a[k].innerHTML+' '+span_a[k].nodeName+' '+span_a[k].innerHTML.lenght);
								dump('\n');
								*/
								if ( !PlayerOut) {
									if (span_a[k].nodeType==3 && span_a[k].nodeValue.length>2) {
										//dump('in:'+span_a[k].nodeValue+'\n'); 
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
                            //PlayerOut = span_a[0].textContent;
                            PlayerOut = PlayerOut.substr(PlayerOut.search(" ")+1);
                            //Foxtrick.dump('sub out:'+j+' '+span_a[0].textContent+' = '+PlayerOut+'\n');
							//Player In
							//PlayerIn = span_a[1].textContent;
                            PlayerIn = PlayerIn.substr(PlayerIn.search(" ")+1);
                            //Foxtrick.dump('sub in:'+j+' '+' '+span_a[1].textContent+' = '+PlayerIn+'\n');
                            dump('in:'+PlayerIn+' out:'+PlayerOut+'\n');
							
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
				//playerName=links[i].textContent; 
				var foundA =false;
				for (var k=0;k<teamA.length;k++) { //Foxtrick.dump(teamA[k]+' '+playerName.indexOf(teamA[k])+'\t');
					if (playerName.indexOf(teamA[k])>-1) foundA=true; 
				}
				var foundB =false;
				for (var k=0;k<teamB.length;k++) { //Foxtrick.dump(teamB[k]+' '+playerName.indexOf(teamB[k])+'\t');
					if (playerName.indexOf(teamB[k])>-1) foundB=true; 
				}
                if (foundA && !foundB || (!foundA && !foundB && num_unknown_namesA>0 && num_unknown_namesB==0)) {
					links[i].setAttribute("style", stlTeamA + 'padding:0px 2px;'); 
					if (iseventsbox) {
						links[i].parentNode.parentNode.getElementsByTagName('td')[0].setAttribute("style", 'text-align:left;'); 
						if (links[i].previousSibling) links[i].setAttribute("style", links[i].getAttribute("style") + 'margin-left:3px;'); 					
						//		Foxtrick.dump(links[i].parentNode.parentNode.firstChild.innerHTML+'\n');
					}
 				} 
				else if (foundB && !foundA || (!foundA && !foundB && num_unknown_namesA==0 && num_unknown_namesB>0)) {
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