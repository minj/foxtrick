/**
 * teampopuplinks.js
 * Foxtrick show Team Popup
 * @author bummerland/convinced
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickTeamPopupLinks = {
    
    MODULE_NAME : "TeamPopupLinks",
        MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
		PAGES : new Array('all_late'), 
        DEFAULT_ENABLED : true,
		NEW_AFTER_VERSION: "0.4.8.2",	
		LASTEST_CHANGE:"Added teamhistory, next match, addnextmatch(to htlive), youth matches (default off)",
        OPTIONS :  new Array( "OpenNewTab",
							"TeamLinks",
							"UserLinks",
							"Manager",
							"Team",
							"TeamAtAlltid",
							"Matches" ,
                            "Players" ,
                            "last_5_ips" ,
                            "Guestbook" ,
                            "SendMessage" ,
							"Challenge",
							"Achievements",
                            "Coach",
                            "TransferHistory" ,
                            "TeamHistory" ,
							"LastLineup",
							"NextMatch",
							"AddNextMatch",
							"YouthMatches",
							"CustomLink"),
		OPTION_TEXTS : true,
		OPTION_TEXTS_DEFAULT_VALUES : new Array("","","","","","","","","","","","","","","","","","","","","<a href='http://www.alltid.org/team/[teamid]'>mylink</a> "),        
		OPTION_TEXTS_DISABLED_LIST : new Array(true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,false),

		bTeamLinks : "",
		bUserLinks : "",
		bManager : "",
		bTeam : "",
		bTeamAtAlltid : "",
		bMatches : "",
		bPlayers : "",
		bLast5IPs : "",
		bGuestbook : "",
		bCoach : "",
		bTransferHistory : "",
		bTeamHistory : "",
		bLastLineup : "",
		bNextMatch : "",
		bAddNextMatch : "",
		bMessage : "",
		bChallenge:"",
		bAchievemants:"",
		bYouthMatches:"",
		bCustomLink:"",
		bMore:"",
		utext:"",
		ownteamid:"",
		maxwidth:"",
		hasScroll:"",		

		
    init : function() {
                //determine width of the floating box - Stephan
                this.maxwidth = Math.max(Foxtrickl10n.getString( 'Team' ).length, 
											Foxtrickl10n.getString( 'TeamAtAlltid' ).length, 
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
											Foxtrickl10n.getString( 'TeamHistory' ).length,
											Foxtrickl10n.getString( 'NextMatch').length, 
											Foxtrickl10n.getString( 'AddNextMatch').length,
											Foxtrickl10n.getString( 'YouthMatches').length,
											Foxtrickl10n.getString( 'LastLineup').length ); 
				this.bTeamLinks = Foxtrick.isModuleFeatureEnabled( this, "TeamLinks");
                this.bUserLinks = Foxtrick.isModuleFeatureEnabled( this, "UserLinks");
				this.bManager = Foxtrick.isModuleFeatureEnabled( this, "Manager");
                this.bTeam = Foxtrick.isModuleFeatureEnabled( this, "Team");
                this.bTeamAtAlltid = Foxtrick.isModuleFeatureEnabled( this, "TeamAtAlltid");
                this.bMatches = Foxtrick.isModuleFeatureEnabled( this, "Matches");
                this.bPlayers = Foxtrick.isModuleFeatureEnabled( this, "Players");
                this.bLast5IPs = Foxtrick.isModuleFeatureEnabled( this, "last_5_ips");
                this.bGuestbook = Foxtrick.isModuleFeatureEnabled( this, "Guestbook");
                this.bCoach = Foxtrick.isModuleFeatureEnabled( this, "Coach");
                this.bTransferHistory = Foxtrick.isModuleFeatureEnabled( this, "TransferHistory");
                this.bTeamHistory = Foxtrick.isModuleFeatureEnabled( this, "TeamHistory");
                this.bLastLineup = Foxtrick.isModuleFeatureEnabled( this, "LastLineup");
                this.bNextMatch = Foxtrick.isModuleFeatureEnabled( this, "NextMatch");
                this.bAddNextMatch = Foxtrick.isModuleFeatureEnabled( this, "AddNextMatch");
				this.bMessage= Foxtrick.isModuleFeatureEnabled( this, "SendMessage");
				this.bChallenge= Foxtrick.isModuleFeatureEnabled( this, "Challenge");
                this.bAchievements= Foxtrick.isModuleFeatureEnabled( this, "Achievements");
                this.bYouthMatches= Foxtrick.isModuleFeatureEnabled( this, "YouthMatches");
                this.bCustomLink= Foxtrick.isModuleFeatureEnabled( this, "CustomLink");
                this.bMore = FoxtrickPrefs.getBool("module.TeamPopupLinksMore.enabled"); 						
				
                this.bMore = FoxtrickPrefs.getBool("module.TeamPopupLinksMore.enabled"); 						
				
				this.utext = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "CustomLink_text");
				if (!this.utext) this.utext = this.OPTION_TEXTS_DEFAULT_VALUES[16];
    },

    run : function( page, doc ) {  
		try { 				 		
				if (!FoxtrickPrefs.getBool("module.TeamPopupLinks.enabled")) return;
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
				this.hasScroll = Foxtrick.hasMainBodyScroll(doc);
						               				
				this.Target = '_self';
				if (Foxtrick.isModuleFeatureEnabled( this, "OpenNewTab")) this.Target = '_blank';                
				
				var head = doc.getElementsByTagName("head")[0];
                var style = doc.createElement("style");
                style.setAttribute("type", "text/css");
				var zaw = 'span.myht1 {position: relative; width:+'+this.maxwidth+';} div.myht2 {display: none;} span.myht1:hover div.myht2 {display: inline; position: absolute; background-color: #FFFFFF; border: solid 1px #267F30; padding: 0px; z-index:999} div.playerInfo {overflow: visible !important;} span.myht1 table>tr>td>a { font-weight:normal !important; text-decoration:underline !important; color: #3f7137 !important;} span.myht1:hover table>tr:hover { background-color:#C3E7C7 !important;} div.cfMessage, div.edited, div.cfHeader, div.feedItem, div.cfUserInfo, div.signature {overflow: visible !important;} div.message {overflow:auto;} #ticker div div.myht2, div.message span.myht1:hover div.myht2, div.signature-trunc span.myht1:hover div.myht2 {display: none;}';
				//var zaw = 'span.myht1 {position: relative} div.myht2 {display: none} span.myht1:hover div.myht2 {display: inline; width:maxwidth; position: absolute; left: 20px; background-color: #FFFFFF; border: solid 1px #267F30; padding: 0px; z-index:999} div.playerInfo {overflow: visible !important;} span.myht1 table>tr>td>a { font-weight:normal !important; text-decoration:underline !important; color: #3f7137 !important;} span.myht1:hover table>tr:hover { background-color:#C3E7C7 !important;} div.cfHeader {overflow: visible !important;} div.feedItem {overflow: visible !important;} div.cfUserInfo {overflow: visible !important;}';
				style.appendChild(doc.createTextNode(zaw));
                head.appendChild(style);
				
				//  team links
                var aLink = doc.getElementById('teamLinks').getElementsByTagName('a')[0]; 
				if (aLink) this._addSpan( doc,aLink );
				
				// all in mainWrapper (ie. not left boxes)
				if (sUrl.search(/Forum\/Default/i)!=-1) return; // not in forum overview
				var aLinks = doc.getElementById('mainBody').getElementsByTagName('a'); 
				var i = 0, aLink;
                while ( aLink = aLinks[i++] ) {
					if (aLink.getElementsByTagName('img')[0] != null || aLink.parentNode.className=='liveTabText') continue; // don't add to buttons, and htlive tabs				
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
		var doc = event.view.document; //FoxtrickTeamPopupLinks.popupshow.doc;
		if (org_link.style==null) org_link.setAttribute('style','display:inline');
  		event.target.parentNode.removeEventListener("mouseover",FoxtrickTeamPopupLinks.popupshow,false);
        var value = FoxtrickHelper.getTeamIdFromUrl(org_link.href);
		var userlink = org_link.href.search(/Club\/Manager\/\?UserID=/i)!=-1 
															&& org_link.parentNode.id.search(/foxtrick_alltidspan/i)==-1
															&& org_link.parentNode.className!="cfUserInfo";
		var forumuserlink = org_link.href.search(/Club\/Manager\/\?UserID=/i)!=-1 && doc.location.href.search(/Forum\/Read/i)!=-1 ; 
		var forumlink = doc.location.href.search(/Forum\/Read/i)!=-1 ; 
		var ismatchpreview = doc.getElementById("ctl00_CPMain_pnlPreMatch");
		
		var username='';
		if (userlink || forumuserlink) {
			username = org_link.text; 
			var longnick = org_link.getAttribute('longnick');
			if (longnick) username = longnick; 
		} 
		
		var top = -18; if (Foxtrick.isStandardLayout(doc) ) top = 0;
		if (forumuserlink) {top = -18; if (Foxtrick.isStandardLayout(doc)) top = 0;}
		else if (userlink) top = +0;
		
        var teamid=null;
		var teamname=null;
		var userid=null;
		if (userlink) {
			value = FoxtrickHelper.getUserIdFromUrl(org_link.href); 
			userid = value;
			teamid = org_link.getAttribute('teamid'); 
			teamname = org_link.getAttribute('teamname'); 
			if (teamid != null) {
				value = teamid;
			}
		}
		else teamid=value;
		
		var owntopteamlinks=false;
		if (org_link.parentNode.parentNode.tagName == "DIV" 
			&& org_link.parentNode.parentNode.id == "teamLinks") owntopteamlinks=true;
									
                                var tbl = doc.createElement("table");
                                tbl.setAttribute("cell-padding", "2");
                                tbl.setAttribute("cell-spacing", "0");
                                
								if ((userlink) && ((!show_more && FoxtrickTeamPopupLinks.bTeam)
													|| (show_more && FoxtrickTeamPopupLinksMore.bTeam))) {
                                        var tr1 = doc.createElement("tr");
                                        tr1.setAttribute("height", "20");
                                        var td1 = doc.createElement("td");
                                        var a1 = doc.createElement("a");
                                        if (teamid==null) {
											a1.setAttribute('href', '/Club/Manager/?userId='+userid+'&redir_to_team=true'+'&ft_popuplink=true');
										}
										else {
											a1.setAttribute('href', '/Club/?TeamID='+teamid+'&ft_popuplink=true');
										}
										a1.setAttribute('target', FoxtrickTeamPopupLinks.Target);
										a1.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Team' )));											
										a1.innerHTML= a1.innerHTML.replace(/ /g,'&nbsp;');
										td1.appendChild(a1);
                                        tr1.appendChild(td1);
                                        tbl.appendChild(tr1);
										top = top - 20;
                                }
								if (teamname!=null) {
									if (org_link.title.search(teamname)==-1)
											org_link.title += ' : '+teamname;																				
								}
								
								if ((!owntopteamlinks && !userlink) && ((!show_more && FoxtrickTeamPopupLinks.bManager)
													|| (show_more && FoxtrickTeamPopupLinksMore.bManager))) {
                                        var tr1 = doc.createElement("tr");
                                        tr1.setAttribute("height", "20");
                                        var td1 = doc.createElement("td");
                                        var a1 = doc.createElement("a");
                                        a1.setAttribute('href', '/Club/Manager/?teamId='+teamid+'&ft_popuplink=true');
										a1.setAttribute('target', FoxtrickTeamPopupLinks.Target);
										a1.appendChild(doc.createTextNode( Foxtrickl10n.getString( 'Manager' )));
										a1.innerHTML= a1.innerHTML.replace(/ /g,'&nbsp;');
										td1.appendChild(a1);
                                        tr1.appendChild(td1);
                                        tbl.appendChild(tr1);
										top = top - 20;
                                }
								
								if (!owntopteamlinks && ((!show_more && FoxtrickTeamPopupLinks.bTeamAtAlltid)
												|| (show_more && FoxtrickTeamPopupLinksMore.bTeamAtAlltid))) {
                                        var tr1 = doc.createElement("tr");
                                        tr1.setAttribute("height", "20");
                                        var td1 = doc.createElement("td");
                                        var a1 = doc.createElement("a");
                                        if (teamid==null) {
											a1.setAttribute('href', '/Club/Manager/?userId='+userid+'&redir_to_team_at_alltid=true'+'&ft_popuplink=true');
											}
										else {
											a1.setAttribute('href', 'http://alltid.org/team/'+teamid+'&ft_popuplink=true');
										}
                                        a1.appendChild(doc.createTextNode( Foxtrickl10n.getString( 'TeamAtAlltid' )));
										a1.innerHTML = a1.innerHTML.replace(/ /g,'&nbsp;');
										a1.setAttribute('target', FoxtrickTeamPopupLinks.Target);
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
                                        if (teamid==null) a1.setAttribute('href', '/Club/Manager/?userId='+userid+'&redir_to_matches=true'+'&ft_popuplink=true');
		                                else a1.setAttribute('href', '/Club/Matches/?TeamID=' + teamid+'&ft_popuplink=true');
                                        a1.setAttribute('target', FoxtrickTeamPopupLinks.Target);
										a1.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Matches' )));
                                        a1.innerHTML= a1.innerHTML.replace(/ /g,'&nbsp;');
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
                                        if (teamid==null) a2.setAttribute('href', '/Club/Manager/?userId='+userid+'&redir_to_players=true'+'&ft_popuplink=true');
		                                else a2.setAttribute('href', '/Club/Players/?TeamID=' + teamid+'&ft_popuplink=true');
                                        a2.setAttribute('target', FoxtrickTeamPopupLinks.Target);
										a2.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Players' )));
                                        a2.innerHTML= a2.innerHTML.replace(/ /g,'&nbsp;');
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
                                        if (teamid==null) a3.setAttribute('href', '/Club/Manager/?userId=' + userid+'&ShowOldConnections=true'+'&ft_popuplink=true');
                                        else a3.setAttribute('href', '/Club/Manager/?teamId=' + teamid+'&ShowOldConnections=true'+'&ft_popuplink=true');
                                        a3.setAttribute('target', FoxtrickTeamPopupLinks.Target);
										a3.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'last_5_ips' )));
                                        a3.innerHTML= a3.innerHTML.replace(/ /g,'&nbsp;');
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
                                        if (teamid==null) a4.setAttribute('href', '/Club/Manager/?userId='+userid+'&redir_to_guestbook=true'+'&ft_popuplink=true');
		                                else a4.setAttribute('href', '/Club/Manager/Guestbook.aspx?teamid=' + teamid+'&ft_popuplink=true');
                                        a4.setAttribute('target', FoxtrickTeamPopupLinks.Target);
										a4.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Guestbook' )));
                                        a4.innerHTML= a4.innerHTML.replace(/ /g,'&nbsp;');
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
										//if (teamid==null) a9.setAttribute('href', '/Club/Manager/?userId='+userid+'&redir_to_sendmessage=true'+'&ft_popuplink=true');
										else a9.setAttribute('href', '/Club/?TeamID='+teamid+'&SendMessage=true'+'&ft_popuplink=true');										
                                        a9.setAttribute('target', FoxtrickTeamPopupLinks.Target);
										a9.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'SendMessage' )));
                                        a9.innerHTML= a9.innerHTML.replace(/ /g,'&nbsp;');
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
                                        if (teamid==null) a6.setAttribute('href', '/Club/Manager/?userId='+userid+'&redir_to_challenge=true'+'&ft_popuplink=true');
										else a6.setAttribute('href', '/Club/Challenges/?TeamID='+teamid+'&challenge=true'+'&ft_popuplink=true');										
                                        a6.setAttribute('target', FoxtrickTeamPopupLinks.Target);
										a6.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Challenge' )));
                                        a6.innerHTML= a6.innerHTML.replace(/ /g,'&nbsp;');
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
                                        if (teamid && userid) a8.setAttribute('href', '/Club/Achievements/?userID='+userid+'&teamid='+teamid+'&ft_popuplink=true');
										else if (teamid==null) a8.setAttribute('href', '/Club/Manager/?userId='+userid+'&redir_to_achievements=true'+'&ft_popuplink=true');
										else a8.setAttribute('href', '/Club/Manager/?teamId='+teamid+'&redir_to_achievements=true'+'&ft_popuplink=true');										
                                        a8.setAttribute('target', FoxtrickTeamPopupLinks.Target);
										a8.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Achievements' )));
                                        a8.innerHTML= a8.innerHTML.replace(/ /g,'&nbsp;');
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
										if (teamid==null) a5.setAttribute('href', '/Club/Manager/?userId='+userid+'&redir_to_coach=true'+'&ft_popuplink=true');
		                                else {
											if (teamid!=FoxtrickTeamPopupLinks.ownteamid) {
												a5.setAttribute('href', '/Club/Players/?TeamID='+teamid+'&redir_to_coach=true'+'&ft_popuplink=true');}
											else {a5.setAttribute('href', '/Club/Training/?redir_to_coach=true'+'&ft_popuplink=true');}
											}
										a5.setAttribute('target', FoxtrickTeamPopupLinks.Target);
										a5.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Coach' )));										
                                        a5.innerHTML= a5.innerHTML.replace(/ /g,'&nbsp;');
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
                                        if (teamid==null) a7.setAttribute('href', '/Club/Manager/?userId='+userid+'&redir_to_transferhistory=true'+'&ft_popuplink=true');
		                                else a7.setAttribute('href', '/Club/Transfers/transfersTeam.aspx?teamId=' + teamid+'&ft_popuplink=true');
        								a7.setAttribute('target', FoxtrickTeamPopupLinks.Target);
										a7.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'TransferHistory' )));
                                        a7.innerHTML= a7.innerHTML.replace(/ /g,'&nbsp;');
										td7.appendChild(a7);
                                        tr7.appendChild(td7);
                                        tbl.appendChild(tr7);
										top = top - 20;
                                }       
                               if (!owntopteamlinks && ((!show_more && FoxtrickTeamPopupLinks.bTeamHistory)
													|| (show_more && FoxtrickTeamPopupLinksMore.bTeamHistory))) {
                                        var tr7 = doc.createElement("tr");
                                        tr7.setAttribute("height", "20");
                                        var td7 = doc.createElement("td");
                                        td7.setAttribute("nowrap", "nowrap");
                                        var a7 = doc.createElement("a");
                                        if (teamid==null) a7.setAttribute('href', '/Club/Manager/?userId='+userid+'&redir_to_teamhistory=true'+'&ft_popuplink=true');
		                                else a7.setAttribute('href', '/Club/History/?teamId=' + teamid+'&ft_popuplink=true');
        								a7.setAttribute('target', FoxtrickTeamPopupLinks.Target);
										a7.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'TeamHistory' )));
                                        a7.innerHTML= a7.innerHTML.replace(/ /g,'&nbsp;');
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
                                        if (teamid==null) a6.setAttribute('href', '/Club/Manager/?userId='+userid+'&redir_to_lastlineup=true'+'&ft_popuplink=true');
										else a6.setAttribute('href', '/Club/Matches/MatchLineup.aspx?MatchID=&TeamID='+teamid+'&useArchive=True'+'&ft_popuplink=true');										
                                        a6.setAttribute('target', FoxtrickTeamPopupLinks.Target);
										a6.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'LastLineup' )));
                                        a6.innerHTML= a6.innerHTML.replace(/ /g,'&nbsp;');
										td6.appendChild(a6);
                                        tr6.appendChild(td6);
                                        tbl.appendChild(tr6);
										top = top - 20;
                                } 
								if (!owntopteamlinks && ((!show_more && FoxtrickTeamPopupLinks.bNextMatch)
													|| (show_more && FoxtrickTeamPopupLinksMore.bNextMatch))) {
                                        var tr6 = doc.createElement("tr");
                                        tr6.setAttribute("height", "20");
                                        var td6 = doc.createElement("td");
                                        td6.setAttribute("nowrap", "nowrap");
                                        var a6 = doc.createElement("a");
                                        if (teamid==null) a6.setAttribute('href', '/Club/Manager/?userId='+userid+'&redir_to_nextmatch=true'+'&ft_popuplink=true');
										else a6.setAttribute('href', '/Club/Matches/?TeamID='+teamid+'&redir_to_nextmatch=true'+'&ft_popuplink=true');										
                                        a6.setAttribute('target', FoxtrickTeamPopupLinks.Target);
										a6.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'NextMatch' )));
                                        a6.innerHTML= a6.innerHTML.replace(/ /g,'&nbsp;');
										td6.appendChild(a6);
                                        tr6.appendChild(td6);
                                        tbl.appendChild(tr6);
										top = top - 20;
                                } 
								if (!owntopteamlinks && ((!show_more && FoxtrickTeamPopupLinks.bAddNextMatch)
													|| (show_more && FoxtrickTeamPopupLinksMore.bAddNextMatch))) {
                                        var tr6 = doc.createElement("tr");
                                        tr6.setAttribute("height", "20");
                                        var td6 = doc.createElement("td");
                                        td6.setAttribute("nowrap", "nowrap");
                                        var a6 = doc.createElement("a");
                                        if (teamid==null) a6.setAttribute('href', '/Club/Manager/?userId='+userid+'&redir_to_addnextmatch=true'+'&ft_popuplink=true');
										else a6.setAttribute('href', '/Club/Matches/?TeamID='+teamid+'&redir_to_addnextmatch=true'+'&ft_popuplink=true');										
                                        a6.setAttribute('target', FoxtrickTeamPopupLinks.Target);
										a6.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'AddNextMatch' )));
                                        a6.innerHTML= a6.innerHTML.replace(/ /g,'&nbsp;');
										td6.appendChild(a6);
                                        tr6.appendChild(td6);
                                        tbl.appendChild(tr6);
										top = top - 20;
                                } 
								if (!owntopteamlinks && ((!show_more && FoxtrickTeamPopupLinks.bYouthMatches)
													|| (show_more && FoxtrickTeamPopupLinksMore.bYouthMatches))) {
                                        var tr6 = doc.createElement("tr");
                                        tr6.setAttribute("height", "20");
                                        var td6 = doc.createElement("td");
                                        td6.setAttribute("nowrap", "nowrap");
                                        var a6 = doc.createElement("a");
                                        if (teamid==null) a6.setAttribute('href', '/Club/Manager/?userId='+userid+'&redir_to_youthmatches=true'+'&ft_popuplink=true');
										else a6.setAttribute('href', '/Club/Matches/?TeamID='+teamid+'&redir_to_youthmatches=true'+'&ft_popuplink=true');										
                                        a6.setAttribute('target', FoxtrickTeamPopupLinks.Target);
										a6.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'YouthMatches' )));
                                        a6.innerHTML= a6.innerHTML.replace(/ /g,'&nbsp;');
										td6.appendChild(a6);
                                        tr6.appendChild(td6);
                                        tbl.appendChild(tr6);
										top = top - 20;
                                } 
								if (!owntopteamlinks && ((!show_more && FoxtrickTeamPopupLinks.bCustomLink)
													|| (show_more && FoxtrickTeamPopupLinksMore.bCustomLink))) {
									var ownlinks = FoxtrickTeamPopupLinks.utext;
									if (show_more) ownlinks =  FoxtrickTeamPopupLinksMore.utext;
									ownlinks = ownlinks.split(/<\/a>\s+/);
									var i=0,ownlink;
									while (ownlink=ownlinks[i++]) {
										ownlink+='</a>';
                                        var tr6 = doc.createElement("tr");
                                        tr6.setAttribute("height", "20");
                                        var td6 = doc.createElement("td");
                                        td6.setAttribute("nowrap", "nowrap");
										var redir_to_custom = false;
                                        var a6inner = ownlink;
										if (a6inner.search(/\[teamid\]/) != -1) {
											if (teamid) a6inner = a6inner.replace(/\[teamid\]/i, teamid);
											else redir_to_custom = true;
											}
										if (a6inner.search(/\[userid\]/) != -1) {
											if (userid) a6inner = a6inner.replace(/\[userid\]/i, userid);
											else redir_to_custom = true;
											}
										
										if (redir_to_custom) {
											td6.innerHTML = a6inner;
											var a6 = td6.getElementsByTagName('a')[0];
											if (teamid==null) a6.href = '/Club/Manager/?userId='+userid+'&redir_to_custom=true'+'&'+a6.href;
											else a6.href = '/Club/Manager/?teamId='+teamid+'&redir_to_custom=true'+'&'+a6.href;
											a6.setAttribute('target', FoxtrickTeamPopupLinks.Target);
											a6.innerHTML= a6.innerHTML.replace(/ /g,'&nbsp;');
										}
										else {
											td6.innerHTML = a6inner;
											var a6 =td6.getElementsByTagName('a')[0];
											a6.setAttribute('target', FoxtrickTeamPopupLinks.Target);
											a6.innerHTML= a6.innerHTML.replace(/ /g,'&nbsp;');										
										}
                                        tr6.appendChild(td6);
                                        tbl.appendChild(tr6);
										top = top - 20;
									}
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
									
									var left = 20;
									if (!owntopteamlinks && FoxtrickTeamPopupLinks.hasScroll) {
										var pT = Foxtrick.GetElementPosition(org_link,mainBody)['top'] - mainBody.scrollTop;
										if ( pT < mainBody.offsetHeight/2) {// = popdown
											top = -10;  
											var more=tbl.removeChild(tbl.lastChild);
											tbl.insertBefore(more,tbl.firstChild);
										}
									} 
									if (!owntopteamlinks && ismatchpreview) {
										top = -10;  
										if (Foxtrick.isStandardLayout(doc)) top=10;
										var more=tbl.removeChild(tbl.lastChild);
										tbl.insertBefore(more,tbl.firstChild);
									}
									
									
									div.setAttribute('style','top:'+top+'px;'+'left:'+left+'px; z-index:10000;');
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
		PAGES : new Array('all_late'), 
        DEFAULT_ENABLED : true,
        OPTIONS :  new Array( "Manager",
							"Team",
							"TeamAtAlltid",
							"Matches" ,
                            "Players" ,
                            "last_5_ips" ,
                            "Guestbook" ,
                            "SendMessage" ,
							"Challenge",
							"Achievements",
                            "Coach",
                            "TransferHistory" ,
                            "TeamHistory" ,
							"LastLineup",
							"NextMatch",
							"AddNextMatch",
							"YouthMatches",
							"CustomLink"),
		OPTION_TEXTS : true,
		OPTION_TEXTS_DEFAULT_VALUES : new Array("","","","","","","","","","","","","","","","","",
												"<a href='http://www.alltid.org/user/[userid]'>mylink</a> <a href='/club/?teamid=[teamid]'>mylink2</a> "),        
		OPTION_TEXTS_DISABLED_LIST : new Array(true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,true,false),

		bManager : "",
		bTeam : "",
		bTeamAtAlltid : "",
		bMatches : "",
		bPlayers : "",
		bLast5IPs : "",
		bGuestbook : "",
		bCoach : "",
		bTransferHistory : "",
		bTeamHistory : "",
		bLastLineup : "",
		bNextMatch : "",
		bAddNextMatch : "",
		bMessage : "",
		bChallenge:"",
		bAchievements:"",
		bYouthMatches:"",
		bCustomLink:"",
		utext:"",
		
    init : function() {
                this.bManager = Foxtrick.isModuleFeatureEnabled( this, "Manager");
                this.bTeam = Foxtrick.isModuleFeatureEnabled( this, "Team");
                this.bTeamAtAlltid = Foxtrick.isModuleFeatureEnabled( this, "TeamAtAlltid");
                this.bMatches = Foxtrick.isModuleFeatureEnabled( this, "Matches");
                this.bPlayers = Foxtrick.isModuleFeatureEnabled( this, "Players");
                this.bLast5IPs = Foxtrick.isModuleFeatureEnabled( this, "last_5_ips");
                this.bGuestbook = Foxtrick.isModuleFeatureEnabled( this, "Guestbook");
				this.bMessage= Foxtrick.isModuleFeatureEnabled( this, "SendMessage");
                this.bChallenge= Foxtrick.isModuleFeatureEnabled( this, "Challenge");
                this.bAchievements= Foxtrick.isModuleFeatureEnabled( this, "Achievements");
                this.bCoach = Foxtrick.isModuleFeatureEnabled( this, "Coach");
                this.bTransferHistory = Foxtrick.isModuleFeatureEnabled( this, "TransferHistory");
                this.bTeamHistory = Foxtrick.isModuleFeatureEnabled( this, "TeamHistory");
                this.bLastLineup = Foxtrick.isModuleFeatureEnabled( this, "LastLineup");
                this.bNextMatch = Foxtrick.isModuleFeatureEnabled( this, "NextMatch");
                this.bAddNextMatch = Foxtrick.isModuleFeatureEnabled( this, "AddNextMatch");
				this.bAddNextMatch = Foxtrick.isModuleFeatureEnabled( this, "YouthMatches");
				this.bCustomLink = Foxtrick.isModuleFeatureEnabled( this, "CustomLink");
				this.utext = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "CustomLink_text");
				if (!this.utext) this.utext = this.OPTION_TEXTS_DEFAULT_VALUES[13];				
    },

    run : function( page, doc ) {  
	},
	
	change : function( page, doc ) {        
	},
};

		