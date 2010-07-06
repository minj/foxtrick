/**
 * Colors the player name in the match report.
 * @author tychobrailleur & Stephan57 &convincedd
 */

FoxtrickMatchPlayerColouring = {
	MODULE_NAME : "MatchPlayerColouring",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : new Array('match', 'playerdetail'),
	ONPAGEPREF_PAGE : 'match',
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION : "0.5.2.1",
	LATEST_CHANGE : "Use CSS file for styling.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

	CSS : Foxtrick.ResourcePath + "resources/css/match-player-colouring.css",

	OwnYouthTeamId : null,

	init : function() {
	},

	run : function(page, doc) {
		try {
			if (page == "playerdetail") {
				this.addHighlightParam(doc);
				return;
			}

			var isarchivedmatch = (doc.getElementById("ctl00_CPMain_lblMatchInfo")==null);
			var isprematch = (doc.getElementById("ctl00_CPMain_pnlPreMatch")!=null);
			if (isprematch) return;

			var isyouth = false;
			var as = doc.getElementById("mainBody").getElementsByTagName("a");
			for (var i=0;i<as.length;i++) {
				if (as[i].href.search(/YouthArenaID/i)!=-1) {
					isyouth = true;
					break;
				}
				else if (as[i].href.search(/ArenaID/i)!=-1) {
					isyouth=false;
					break;
				}
			}

			var matchid = FoxtrickHelper.getMatchIdFromUrl(doc.location.href);
			// exmaple xml use
			//Foxtrick.dump(Foxtrick.Matches.matchxmls[matchid].getElementsByTagName('AwayTeam')[0].getElementsByTagName('RatingMidfield')[0].textContent+'\n');
			//Foxtrick.alert(Foxtrick.Matches.matchxmls[matchid].getElementsByTagName('AwayTeam')[0].getElementsByTagName('RatingMidfield')[0].textContent+'\n');

			//Retrieve teams id
			var myTeamId = isyouth ? FoxtrickHelper.getOwnTeamId() : FoxtrickHelper.getOwnYouthTeamId();
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
			const HOME_TEAM_CLASS_NAME = (myTeamId == HomeTeamId) ? "ft-match-player-mine" : "ft-match-player-home";
			const AWAY_TEAM_CLASS_NAME = (myTeamId == AwayTeamId) ? "ft-match-player-mine" : "ft-match-player-away";

			Foxtrick.dump('ownteam: '+myTeamId+'\n');
			Foxtrick.dump('HomeTeamId: '+HomeTeamId+'\n');
			Foxtrick.dump('AwayTeamId: '+AwayTeamId+'\n');

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
			else { // matchreport coloring active
				var contentA=null;
				var contentB='';

				var divs=content_div.getElementsByTagName("h1")[0].parentNode.getElementsByTagName('div');
				for (var i=0;i<divs.length;++i) {
					if (divs[i].innerHTML.indexOf('ft_mR_format')!=-1) {
						if (contentA==null) {
							contentA=divs[i+1].innerHTML;
							contentA=contentA.substring(0,contentA.length-1);
						}
						else {
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
								if (!PlayerOut) {
									if (span_a[k].nodeType==3 && span_a[k].nodeValue.length>2) {
										//Foxtrick.dump('in:'+span_a[k].nodeValue+'\n');
										PlayerOut = span_a[k].nodeValue;
										k+=2;
									}
									else if (span_a[k].nodeName=='A') {
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
									else if (span_a[k].nodeName=='A') {
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
							for (var k=0;k<teamB.length;k++) { //Foxtrick.dump(k+' '+teamB[k]+' '+PlayerOut+'\n');
								if (PlayerOut.search(teamB[k])!=-1) {teamB.push(PlayerIn);break;}
							}

						}
						catch(e) {
							Foxtrick.dump('FoxtrickMatchPlayerColouring => Substitution=> ' + e+'\n');
						}
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
			}

			var links = content_div.getElementsByTagName("a");

			for (var i=0; i<links.length; i++) {
				if (FoxtrickMatchPlayerColouring._isLinkPlayer(links[i].href)) {
					//Foxtrick.dump('['+links[i].href +']\n');
					links[i].href+='&colored';
					var iseventsbox=(links[i].parentNode.tagName=="TD");

					var playerFullName = links[i].textContent;
					if (playerFullName.charAt(0)==" ") playerFullName = playerFullName.substr(1);
					var b = playerFullName.search(" ");
					var l = playerFullName.length;
					if (b>=0) {
						var playerName = playerFullName.substr(b+1,l-b+1);
					}
					else {
						var playerName = playerFullName;
					}
					//Foxtrick.dump(playerName+' '+playerFullName+'\n');
					var foundA =false, foundFullA=false;
					for (var k=0;k<teamA.length;k++) { //Foxtrick.dump(teamA[k]+' '+playerName.indexOf(teamA[k])+'\t');
						if (teamA[k].indexOf(playerFullName)>-1) {foundFullA=true;	break;}
						else if (playerName.indexOf(teamA[k])>-1) {foundA=true;}
					}
					var foundB =false, foundFullB=false;
					for (var k=0;k<teamB.length;k++) { //Foxtrick.dump(teamB[k]+' '+playerName.indexOf(teamB[k])+'\t');
						if (teamB[k].indexOf(playerFullName)>-1) {foundFullB=true; break;}
						else if (playerName.indexOf(teamB[k])>-1) {foundB=true;}
					}
	//				Foxtrick.dump('\np: "'+ playerName+'" A: '+foundFullA+' '+foundA+' B: '+foundFullB+' '+foundB+'\n');
					if ( (foundFullA && !foundFullB) || (foundA && !foundB) || (!foundA && !foundB && !foundFullB && num_unknown_namesA>0 && num_unknown_namesB==0)) {
	//					Foxtrick.dump(playerName+' colorA\n');
						Foxtrick.addClass(links[i], HOME_TEAM_CLASS_NAME);
						if (iseventsbox) {
							links[i].parentNode.parentNode.getElementsByTagName('td')[0].className = "left";
						}
					}
					else if ((foundFullB && !foundFullA) || (foundB && !foundA) || (!foundA && !foundB && !foundFullA && num_unknown_namesA==0 && num_unknown_namesB>0)) {
	//					Foxtrick.dump(playerName+' colorB\n');
						Foxtrick.addClass(links[i], AWAY_TEAM_CLASS_NAME);
						if (iseventsbox) {
							links[i].parentNode.parentNode.getElementsByTagName('td')[0].className = "right";
						}
					}
					else {
						Foxtrick.addClass(links[i], "ft-match-player-unknown");
					}
				}
				//Colors the name of the teams on the right box like the players
				else if (FoxtrickMatchPlayerColouring._isLinkTeam(links[i].href)) {
					var linkParent = links[i];
					while (linkParent && linkParent.className !== "sidebarBox") {
						linkParent = linkParent.parentNode;
					}
					if (linkParent && linkParent.className === "sidebarBox") {
						if (FirstTeam) {
							Foxtrick.addClass(links[i], HOME_TEAM_CLASS_NAME);
							FirstTeam = false;
						}
						else {
							Foxtrick.addClass(links[i], AWAY_TEAM_CLASS_NAME);
						}
					}
				}
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	change : function(page, doc) {
		if (page == "playerdetail") {
			this.addHighlightParam(doc);
		}
	},

	// add matchreport highlight links to playerdetails
	addHighlightParam : function(doc) {
		try {
			var playerName = Foxtrick.Pages.Player.getName(doc);
			playerLastName = playerName.substr(playerName.lastIndexOf(" ") + 1);
			var as = doc.getElementById("mainBody").getElementsByTagName("a");
			for (var i = 0; i < as.length; ++i) {
				if (as[i].href.search(/Club\/Matches\/Match\.aspx\?matchID=/i) != -1
					&& as[i].href.search(/highlight/i) == -1) {
					as[i].href += "&highlight=" + playerlastname;
				}
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
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
