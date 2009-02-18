/**
 * teampopuplinks.js
 * Foxtrick show Team Popup
 * @author bummerland/convinced
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickTeamPopupLinks = {
    
    MODULE_NAME : "TeamPopupLinks",
        MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
        DEFAULT_ENABLED : true,
        OPTIONS : {},
		bTeamLinks : "",
		bUserLinks : "",
		bManager : "",
		bTeam : "",
		bMatches : "",
		bPlayers : "",
		bLast5IPs : "",
		bGuestbook : "",
		bCoach : "",
		bTransferHistory : "",
		bLastLineup : "",
		bMessage : "",
		bChallenge:"",
		bAchievemants:"",
		bMore:"",
		ownteamid:"",
		maxwidth:"",
		hasScroll:"",		

    init : function() {
        Foxtrick.registerPageHandler('all_late', FoxtrickTeamPopupLinks );
                this.initOptions();
    },

	
        initOptions : function() {
                this.OPTIONS = new Array( "TeamLinks",
										  "UserLinks",
										  "Manager",
										  "Team",
										  "Matches" ,
                                          "Players" ,
                                          "last_5_ips" ,
                                          "Guestbook" ,
                                          "SendMessage" ,
										  "Challenge",
										  "Achievements",
                                          "Coach",
                                          "TransferHistory" ,
										  "LastLineup" );
        },

    run : function( page, doc ) {  
		try {  
				if (!FoxtrickPrefs.getBool("module.TeamPopupLinks.enabled"))
                        return;
                var sUrl = Foxtrick.getHref( doc );
				
				this.userlink = false;
                var redir_from_forum = false;
				if (sUrl.search(/Forum/i) != -1) redir_from_forum = true; 
                if (sUrl.search(/ShowOldConnections=true/i) != -1) {
                        var a = doc.getElementById("ctl00_CPMain_lnkShowLogins");
                        if (a){
                                var func = a.href;
                                if (func){
                                        doc.location.href = func;
                                }
                        }
                }
			   	
				var teamdiv = doc.getElementById('teamLinks');
				var ownleagueid = FoxtrickHelper.findLeagueLeveUnitId(teamdiv);
				this.ownteamid=0;
				if (ownleagueid != null) {
					this.ownteamid = FoxtrickHelper.findTeamId(teamdiv);
				}
				FoxtrickTeamPopupLinks.popupshow.doc=doc;
				var head = doc.getElementsByTagName("head")[0];
                var style = doc.createElement("style");
                style.setAttribute("type", "text/css");
				this.hasScroll = Foxtrick.hasMainBodyScroll(doc);
						               
                //determine width of the floating box - Stephan
                this.maxwidth = 5*Math.max(Foxtrickl10n.getString( 'Team' ).length, 
											Foxtrickl10n.getString( 'Team' ).length, 
											Foxtrickl10n.getString( 'Manager' ).length, 
											Foxtrickl10n.getString( 'Matches' ).length, 
											Foxtrickl10n.getString( 'Players' ).length, 
                                            Foxtrickl10n.getString( 'last_5_ips' ).length,
											Foxtrickl10n.getString( 'Guestbook' ).length,
                                            Foxtrickl10n.getString( 'SendMessage' ).length,
                                            Foxtrickl10n.getString( 'Challenge' ).length,
                                            Foxtrickl10n.getString( 'Achievements' ).length,
                                            Foxtrickl10n.getString( 'Coach' ).length,
											Foxtrickl10n.getString( 'TransferHistory' ).length,
											Foxtrickl10n.getString( 'LastLineup').length ); //Stephan
				this.bTeamLinks = Foxtrick.isModuleFeatureEnabled( this, "TeamLinks");
                this.bUserLinks = Foxtrick.isModuleFeatureEnabled( this, "UserLinks");
				this.bManager = Foxtrick.isModuleFeatureEnabled( this, "Manager");
                this.bTeam = Foxtrick.isModuleFeatureEnabled( this, "Team");
                this.bMatches = Foxtrick.isModuleFeatureEnabled( this, "Matches");
                this.bPlayers = Foxtrick.isModuleFeatureEnabled( this, "Players");
                this.bLast5IPs = Foxtrick.isModuleFeatureEnabled( this, "last_5_ips");
                this.bGuestbook = Foxtrick.isModuleFeatureEnabled( this, "Guestbook");
                this.bCoach = Foxtrick.isModuleFeatureEnabled( this, "Coach");
                this.bTransferHistory = Foxtrick.isModuleFeatureEnabled( this, "TransferHistory");
                this.bLastLineup = Foxtrick.isModuleFeatureEnabled( this, "LastLineup");
				this.bMessage= Foxtrick.isModuleFeatureEnabled( this, "SendMessage");
				this.bChallenge= Foxtrick.isModuleFeatureEnabled( this, "Challenge");
                this.bAchievements= Foxtrick.isModuleFeatureEnabled( this, "Achievements");
                this.bMore = FoxtrickPrefs.getBool("module.TeamPopupLinksMore.enabled"); 						
				
				var zaw = 'span.myht1 {position: relative;width:+'+this.maxwidth+';} div.myht2 {display: none} span.myht1:hover div.myht2 {display: inline; position: absolute; background-color: #FFFFFF; border: solid 1px #267F30; padding: 0px; z-index:999} div.playerInfo {overflow: visible !important;} span.myht1 table>tr>td>a { font-weight:normal !important; text-decoration:underline !important; color: #3f7137 !important;} table>tr>td:hover { background-color:#C3E7C7 !important;} div.message, div.cfMessage, div.edited, div.cfHeader, div.feedItem, div.cfUserInfo {overflow: visible !important;}';
				//var zaw = 'span.myht1 {position: relative} div.myht2 {display: none} span.myht1:hover div.myht2 {display: inline; width:maxwidth; position: absolute; left: 20px; background-color: #FFFFFF; border: solid 1px #267F30; padding: 0px; z-index:999} div.playerInfo {overflow: visible !important;} span.myht1 table>tr>td>a { font-weight:normal !important; text-decoration:underline !important; color: #3f7137 !important;} table>tr>td:hover { background-color:#C3E7C7 !important;} div.cfHeader {overflow: visible !important;} div.feedItem {overflow: visible !important;} div.cfUserInfo {overflow: visible !important;}';
				style.appendChild(doc.createTextNode(zaw));
                head.appendChild(style);
				
				//  team links
                var aLink = doc.getElementById('teamLinks').getElementsByTagName('a')[0]; 
				if (aLink) this._addSpan( doc, aLink );
				
				// all in mainWrapper (ie. not left boxes)
				if (sUrl.search(/Forum\/Default/i)!=-1) return; // not in forum overview
				var aLinks = doc.getElementById('mainBody').getElementsByTagName('a'); 
				var i = 0, aLink;
                while ( aLink = aLinks[i++] ) {
					if (aLink.getElementsByTagName('img')[0] != null) continue; // don't add to buttons				
					if ( ( aLink.href.search(/Club\/\?TeamID=/i) > -1 && this.bTeamLinks) 
					|| (aLink.href.search(/Club\/Manager\/\?UserID=/i) !=-1 && this.bUserLinks)) {                                
						this._addSpan(doc, aLink );
					}  
				}
				var sidebar = doc.getElementById('sidebar');
				if (sidebar) {
					aLinks = sidebar.getElementsByTagName('a'); 
					var i = 0, aLink;
					while ( aLink = aLinks[i++] ) {
						if (aLink.getElementsByTagName('img')[0] != null) continue; // don't add to buttons				
						if ( ( aLink.href.search(/Club\/\?TeamID=/i) > -1 && this.bTeamLinks) 
						|| (aLink.href.search(/Club\/Manager\/\?UserID=/i) !=-1 && this.bUserLinks)) {                                
							this._addSpan(doc,  aLink );
						}  
					}
				}
				
		} catch(e) {dump('TeamPopups: '+e+'\n');}
	},
	

	_addSpan : function ( doc, aLink ) {
		var par = aLink.parentNode;                                                               								
		var span = doc.createElement("span");
		span.setAttribute('class', 'myht1');
		par.insertBefore(span, aLink);
		span.addEventListener("mouseover",FoxtrickTeamPopupLinks.popupshow,false);								
		span.appendChild(aLink);                            		
	},
        

	change : function( page, doc ) {        
	},
  

	popupshow : function( event) {
	try { 
		var org_link = event.target;
		var show_more = false;
		if (org_link.getAttribute('more')){//)href.search('javascript')!=-1) {
			//dump (org_link.org_link+'\n');
			org_link.removeEventListener('click',FoxtrickTeamPopupLinks.popupshow,true);										
			if ( org_link.getAttribute('more')=='true') show_more=true;
			org_link = org_link.parentNode.parentNode.parentNode.parentNode.previousSibling;
		}
		var doc = FoxtrickTeamPopupLinks.popupshow.doc;
		if (org_link.style==null) org_link.setAttribute('style','display:inline');
  		event.target.parentNode.removeEventListener("mouseover",FoxtrickTeamPopupLinks.popupshow,false);
        var value = FoxtrickHelper.getTeamIdFromUrl(org_link.href);
		var userlink = org_link.href.search(/Club\/Manager\/\?UserID=/i)!=-1 
															&& org_link.parentNode.id.search(/foxtrick_alltidspan/i)==-1
															&& org_link.parentNode.className!="cfUserInfo";
		var forumuserlink = org_link.href.search(/Club\/Manager\/\?UserID=/i)!=-1 && doc.location.href.search(/Forum\/Read/i)!=-1 ; 
		var forumlink = doc.location.href.search(/Forum\/Read/i)!=-1 ; 
		var username='';
		if (userlink || forumuserlink) username = org_link.text;
		
		var top = -18; if (Foxtrick.isStandardLayout(doc) ) top = 0;
		if (forumuserlink) {top = -18; if (Foxtrick.isStandardLayout(doc)) top = 0;}
		else if (userlink) top = +0;
		
        var teamid=null;
		var teamname=null;
		var userid='';
		if (userlink) {
			value = FoxtrickHelper.getUserIdFromUrl(org_link.href); 
			userid = value;
			teamid = org_link.getAttribute('teamid'); 
			teamname = org_link.getAttribute('teamname'); 
			if (teamid != null) {
				value = teamid;
				userlink=false;
			}
		}
		var owntopteamlinks=false;
		if (org_link.parentNode.parentNode.tagName == "DIV" 
			&& org_link.parentNode.parentNode.id == "teamLinks") owntopteamlinks=true;
									
                                var tbl = doc.createElement("table");
                                tbl.setAttribute("cell-padding", "2");
                                tbl.setAttribute("cell-spacing", "0");
                                
								if ((org_link.href.search(/Club\/Manager\/\?UserID=/i)!=-1 ) && ((!show_more && FoxtrickTeamPopupLinks.bTeam)
													|| (show_more && FoxtrickTeamPopupLinksMore.bTeam))) {
                                        var tr1 = doc.createElement("tr");
                                        tr1.setAttribute("height", "20");
                                        var td1 = doc.createElement("td");
                                        var a1 = doc.createElement("a");
                                        if (teamname==null) {
											a1.setAttribute('href', '/Club/Manager/?userId='+value+'&redir_to_team=true'+'&ft_popuplink=true');
											a1.appendChild(doc.createTextNode( Foxtrickl10n.getString( 'Team' )));
										}
										else {
											a1.setAttribute('href', '/Club/?TeamID='+value+'&ft_popuplink=true');
											a1.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Team' )));											
										}
                                        td1.appendChild(a1);
                                        tr1.appendChild(td1);
                                        tbl.appendChild(tr1);
										top = top - 20;
                                }
								if (teamname!=null) {
									if (org_link.title.search(teamname)==-1)
											org_link.title += ' : '+teamname;																				
								}
								
								if ((!owntopteamlinks && (org_link.href.search(/Club\/Manager\/\?UserID=/i)==-1 )) && ((!show_more && FoxtrickTeamPopupLinks.bManager)
													|| (show_more && FoxtrickTeamPopupLinksMore.bManager))) {
                                        var tr1 = doc.createElement("tr");
                                        tr1.setAttribute("height", "20");
                                        var td1 = doc.createElement("td");
                                        var a1 = doc.createElement("a");
                                        a1.setAttribute('href', '/Club/Manager/?teamId='+value+'&ft_popuplink=true');
										a1.appendChild(doc.createTextNode( Foxtrickl10n.getString( 'Manager' )));
										td1.appendChild(a1);
                                        tr1.appendChild(td1);
                                        tbl.appendChild(tr1);
										top = top - 20;
                                }

								if (owntopteamlinks || ((!show_more && FoxtrickTeamPopupLinks.bMatches)
													|| (show_more && FoxtrickTeamPopupLinksMore.bMatches))) {
                                        var tr1 = doc.createElement("tr");
                                        tr1.setAttribute("height", "20");
                                        var td1 = doc.createElement("td");
                                        var a1 = doc.createElement("a");
                                        if (userlink) a1.setAttribute('href', '/Club/Manager/?userId='+value+'&redir_to_matches=true'+'&ft_popuplink=true');
		                                else a1.setAttribute('href', '/Club/Matches/?TeamID=' + value+'&ft_popuplink=true');
                                        a1.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Matches' )));
                                        td1.appendChild(a1);
                                        tr1.appendChild(td1);
                                        tbl.appendChild(tr1);
										top = top - 20;
                                }
                                
                                if (owntopteamlinks || ((!show_more && FoxtrickTeamPopupLinks.bPlayers)
													|| (show_more && FoxtrickTeamPopupLinksMore.bPlayers))) {
                                        var tr2 = doc.createElement("tr");
                                        tr2.setAttribute("height", "20");
                                        var td2 = doc.createElement("td");
                                        var a2 = doc.createElement("a");
                                        if (userlink) a2.setAttribute('href', '/Club/Manager/?userId='+value+'&redir_to_players=true'+'&ft_popuplink=true');
		                                else a2.setAttribute('href', '/Club/Players/?TeamID=' + value+'&ft_popuplink=true');
                                        a2.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Players' )));
                                        td2.appendChild(a2);
                                        tr2.appendChild(td2);
                                        tbl.appendChild(tr2);
										top = top - 20;
                                }
                                                                
                                if (!owntopteamlinks && ((!show_more && FoxtrickTeamPopupLinks.bLast5IPs)
													|| (show_more && FoxtrickTeamPopupLinksMore.bLast5IPs))) {
                                        var tr3 = doc.createElement("tr");
                                        tr3.setAttribute("height", "20");
                                        var td3 = doc.createElement("td");
                                        td3.setAttribute("nowrap", "nowrap");
                                        var a3 = doc.createElement("a");
                                        if (userlink) a3.setAttribute('href', '/Club/Manager/?userId=' + value+'&ShowOldConnections=true'+'&ft_popuplink=true');
                                        else a3.setAttribute('href', '/Club/Manager/?teamId=' + value+'&ShowOldConnections=true'+'&ft_popuplink=true');
                                        a3.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'last_5_ips' )));
                                        td3.appendChild(a3);
                                        tr3.appendChild(td3);
                                        tbl.appendChild(tr3);
										top = top - 20;
                                }
                                
                                if (!owntopteamlinks && ((!show_more && FoxtrickTeamPopupLinks.bGuestbook)
													|| (show_more && FoxtrickTeamPopupLinksMore.bGuestbook))) {
                                        var tr4 = doc.createElement("tr");
                                        tr4.setAttribute("height", "20");
                                        var td4 = doc.createElement("td");
                                        td4.setAttribute("nowrap", "nowrap");
                                        var a4 = doc.createElement("a");
                                        if (userlink) a4.setAttribute('href', '/Club/Manager/?userId='+value+'&redir_to_guestbook=true'+'&ft_popuplink=true');
		                                else a4.setAttribute('href', '/Club/Manager/Guestbook.aspx?teamid=' + value+'&ft_popuplink=true');
                                        a4.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Guestbook' )));
                                        td4.appendChild(a4);
                                        tr4.appendChild(td4);
                                        tbl.appendChild(tr4);
										top = top - 20;
                                }       
								if (!owntopteamlinks && ((!show_more && FoxtrickTeamPopupLinks.bMessage)
													|| (show_more && FoxtrickTeamPopupLinksMore.bMessage))) {
                                        var tr9 = doc.createElement("tr");
                                        tr9.setAttribute("height", "20");
                                        var td9 = doc.createElement("td");
                                        td9.setAttribute("nowrap", "nowrap");
                                        var a9 = doc.createElement("a");
                                        if (username!='') a9.setAttribute('href', '/MyHattrick/Inbox/Default.aspx?actionType=newMail&mailto='+username);
										//if (userlink) a9.setAttribute('href', '/Club/Manager/?userId='+value+'&redir_to_sendmessage=true'+'&ft_popuplink=true');
										else a9.setAttribute('href', '/Club/?TeamID='+value+'&SendMessage=true'+'&ft_popuplink=true');										
                                        a9.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'SendMessage' )));
                                        td9.appendChild(a9);
                                        tr9.appendChild(td9);
                                        tbl.appendChild(tr9);
										top = top - 20;
                                }
								if (!owntopteamlinks && ((!show_more && FoxtrickTeamPopupLinks.bChallenge)
													|| (show_more && FoxtrickTeamPopupLinksMore.bChallenge))) {
                                        var tr6 = doc.createElement("tr");
                                        tr6.setAttribute("height", "20");
                                        var td6 = doc.createElement("td");
                                        td6.setAttribute("nowrap", "nowrap");
                                        var a6 = doc.createElement("a");
                                        if (userlink) a6.setAttribute('href', '/Club/Manager/?userId='+value+'&redir_to_challenge=true'+'&ft_popuplink=true');
										else a6.setAttribute('href', '/Club/Challenges/?TeamID='+value+'&challenge=true'+'&ft_popuplink=true');										
                                        a6.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Challenge' )));
                                        td6.appendChild(a6);
                                        tr6.appendChild(td6);
                                        tbl.appendChild(tr6);
										top = top - 20;
                                }
                                if (!owntopteamlinks && ((!show_more && FoxtrickTeamPopupLinks.bAchievements)
													|| (show_more && FoxtrickTeamPopupLinksMore.bAchievements))) {
                                        var tr8 = doc.createElement("tr");
                                        tr8.setAttribute("height", "20");
                                        var td8 = doc.createElement("td");
                                        td8.setAttribute("nowrap", "nowrap");
                                        var a8 = doc.createElement("a");
                                        if (!userlink && userid!='') a8.setAttribute('href', '/Club/Achievements/?userID='+userid+'&teamid='+value+'&ft_popuplink=true');
										else if (userlink) a8.setAttribute('href', '/Club/Manager/?userId='+value+'&redir_to_achievements=true'+'&ft_popuplink=true');
										else a8.setAttribute('href', '/Club/Manager/?teamId='+value+'&redir_to_achievements=true'+'&ft_popuplink=true');										
                                        a8.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Achievements' )));
                                        td8.appendChild(a8);
                                        tr8.appendChild(td8);
                                        tbl.appendChild(tr8);
										top = top - 20;
                                }
								if (!owntopteamlinks && ((!show_more && FoxtrickTeamPopupLinks.bCoach)
													|| (show_more && FoxtrickTeamPopupLinksMore.bCoach))) {
                                        var tr5 = doc.createElement("tr");
                                        tr5.setAttribute("height", "20");
                                        var td5 = doc.createElement("td");
                                        td5.setAttribute("nowrap", "nowrap");
                                        var a5 = doc.createElement("a");
										if (userlink) a5.setAttribute('href', '/Club/Manager/?userId='+value+'&redir_to_coach=true'+'&ft_popuplink=true');
		                                else {
											if (value!=FoxtrickTeamPopupLinks.ownteamid) {
												a5.setAttribute('href', '/Club/Players/?TeamID='+value+'&redir_to_coach=true'+'&ft_popuplink=true');}
											else {a5.setAttribute('href', '/Club/Training/?redir_to_coach=true'+'&ft_popuplink=true');}
											}
										a5.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Coach' )));										
                                        td5.appendChild(a5);
                                        tr5.appendChild(td5);
                                        tbl.appendChild(tr5);
										top = top - 20;
									}
                                if (!owntopteamlinks && ((!show_more && FoxtrickTeamPopupLinks.bTransferHistory)
													|| (show_more && FoxtrickTeamPopupLinksMore.bTransferHistory))) {
                                        var tr7 = doc.createElement("tr");
                                        tr7.setAttribute("height", "20");
                                        var td7 = doc.createElement("td");
                                        td7.setAttribute("nowrap", "nowrap");
                                        var a7 = doc.createElement("a");
                                        if (userlink) a7.setAttribute('href', '/Club/Manager/?userId='+value+'&redir_to_transferhistory=true'+'&ft_popuplink=true');
		                                else a7.setAttribute('href', '/Club/Transfers/transfersTeam.aspx?teamId=' + value+'&ft_popuplink=true');
        								a7.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'TransferHistory' )));
                                        td7.appendChild(a7);
                                        tr7.appendChild(td7);
                                        tbl.appendChild(tr7);
										top = top - 20;
                                }       
                                if (!owntopteamlinks && ((!show_more && FoxtrickTeamPopupLinks.bLastLineup)
													|| (show_more && FoxtrickTeamPopupLinksMore.bLastLineup))) {
                                        var tr6 = doc.createElement("tr");
                                        tr6.setAttribute("height", "20");
                                        var td6 = doc.createElement("td");
                                        td6.setAttribute("nowrap", "nowrap");
                                        var a6 = doc.createElement("a");
                                        if (userlink) a6.setAttribute('href', '/Club/Manager/?userId='+value+'&redir_to_lastlineup=true'+'&ft_popuplink=true');
										else a6.setAttribute('href', '/Club/Matches/MatchLineup.aspx?MatchID=&TeamID='+value+'&useArchive=True'+'&ft_popuplink=true');										
                                        a6.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'LastLineup' )));
                                        td6.appendChild(a6);
                                        tr6.appendChild(td6);
                                        tbl.appendChild(tr6);
										top = top - 20;
                                }
								if (!owntopteamlinks && FoxtrickTeamPopupLinks.bMore) { 
                                        var tr7 = doc.createElement("tr");
                                        tr7.setAttribute("height", "20");
                                        var td7 = doc.createElement("td");
                                        td7.setAttribute("nowrap", "nowrap");
                                        var a7 = doc.createElement("a");
										a7.setAttribute('href', 'javascript:void();');										
										if(!show_more) {
												a7.setAttribute('more', 'true');										
												a7.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'more' )));
										}
										else {
												a7.setAttribute('more', 'false');										
												a7.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'less' )));
										}										
										a7.addEventListener('click',FoxtrickTeamPopupLinks.popupshow,true);
										td7.appendChild(a7);
										tr7.appendChild(td7);
                                        tbl.appendChild(tr7);
										top = top - 20;
                                }
									if (!Foxtrick.isStandardLayout(doc))  top += 13; 
								    if (owntopteamlinks) top = -40; 
									
									var div = doc.createElement("div");
									div.setAttribute('class', 'mainBox myht2');									
							
									var mainBody = doc.getElementById('mainBody');
									// absolut position
									// var pL=getPosition(org_link)['left'];
									// var pT=getPosition(org_link,mainBody)['top'] - mainBody.scrollTop + getPosition(mainBody)['top'] + top+5;									
									
									var left = 20;
									if (!owntopteamlinks && FoxtrickTeamPopupLinks.hasScroll) {
										/*var pL = getPosition(org_link, mainBody)['left'];
										if ( pL> mainBody.offsetWidth - FoxtrickTeamPopupLinks.maxwidth) left = -FoxtrickTeamPopupLinks.maxwidth;
										*/								
										var pT = getPosition(org_link,mainBody)['top'] - mainBody.scrollTop;
										if ( pT < mainBody.offsetHeight/2) top = -10;  // = popdown
									}
									//dump('left: '+pL+' '+mainBody.offsetWidth+' '+ FoxtrickTeamPopupLinks.maxwidth+'\n');
									//dump('top: '+pT+' '+mainBody.offsetHeight+' '+top+'\n');
									
									div.setAttribute('style','top:'+top+'px;'+'left:'+left+'px;'+'width:'+FoxtrickTeamPopupLinks.maxwidth);
									div.appendChild(tbl);		
									
									if (org_link.parentNode.lastChild.className=='mainBox myht2') 
											org_link.parentNode.removeChild(org_link.parentNode.lastChild);
									org_link.parentNode.appendChild(div);
									org_link.removeEventListener("mouseover",FoxtrickTeamPopupLinks.popupshow,false);								
		
	} catch(e){dump('popupshow '+e+'\n');}
        
	},
};

// -------------------------------------------------------------------------------------------------
var FoxtrickTeamPopupLinksMore = {
    
		MODULE_NAME : "TeamPopupLinksMore",
        MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
        DEFAULT_ENABLED : true,
        OPTIONS : {},

		bManager : "",
		bTeam : "",
		bMatches : "",
		bPlayers : "",
		bLast5IPs : "",
		bGuestbook : "",
		bCoach : "",
		bTransferHistory : "",
		bLastLineup : "",
		bMessage : "",
		bChallenge:"",
		bAchievements:"",
		
    init : function() {
        Foxtrick.registerPageHandler('all_late', FoxtrickTeamPopupLinksMore );
                this.initOptions();
    },

    run : function( page, doc ) {  
                this.bManager = Foxtrick.isModuleFeatureEnabled( this, "Manager");
                this.bTeam = Foxtrick.isModuleFeatureEnabled( this, "Team");
                this.bMatches = Foxtrick.isModuleFeatureEnabled( this, "Matches");
                this.bPlayers = Foxtrick.isModuleFeatureEnabled( this, "Players");
                this.bLast5IPs = Foxtrick.isModuleFeatureEnabled( this, "last_5_ips");
                this.bGuestbook = Foxtrick.isModuleFeatureEnabled( this, "Guestbook");
				this.bMessage= Foxtrick.isModuleFeatureEnabled( this, "SendMessage");
                this.bChallenge= Foxtrick.isModuleFeatureEnabled( this, "Challenge");
                this.bAchievements= Foxtrick.isModuleFeatureEnabled( this, "Achievements");
                this.bCoach = Foxtrick.isModuleFeatureEnabled( this, "Coach");
                this.bTransferHistory = Foxtrick.isModuleFeatureEnabled( this, "TransferHistory");
                this.bLastLineup = Foxtrick.isModuleFeatureEnabled( this, "LastLineup");
				
	},
	
	change : function( page, doc ) {        
	},

	initOptions : function() {
                this.OPTIONS = new Array( "Manager",
										  "Team",
										  "Matches" ,
                                          "Players" ,
                                          "last_5_ips" ,
                                          "Guestbook" ,
										  "SendMessage",
										  "Challenge",
 										  "Achievements",
                                          "Coach",
                                          "TransferHistory" ,
										  "LastLineup");
        }
};

	
	

function getPosition(This,ref){
var el = This;var pT = 0; var pL = 0;
while(el && el!=ref){pT+=el.offsetTop; pL+=el.offsetLeft; el=el.offsetParent;}
return {'top':pT,'left':pL};
}
	