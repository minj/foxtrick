/**
 * teampopuplinks.js
 * Foxtrick show Team Popup
 * @author bummerland/convinced
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickTeamPopupLinks = {
	MODULE_NAME : "TeamPopupLinks",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ["all_late"],
	DEFAULT_ENABLED : true,
	CSS : Foxtrick.ResourcePath + "resources/css/popup-links.css",
	NEW_AFTER_VERSION : "0.5.0.5",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	LATEST_CHANGE : "Simple speed check added. Only adds about max 100 teampopup links per page (for performance reason)",
	OPTIONS : ["OpenNewTab",
		"TeamLinks",
		"UserLinks",
		"Manager",
		"Team",
		"TeamAtAlltid",
		"Matches",
		"Players",
		"last_5_ips",
		"Guestbook",
		"SendMessage",
		"Challenge",
		"Achievements",
		"Coach",
		"TransferHistory",
		"TeamHistory",
		"LastLineup",
		"NextMatch",
		"AddNextMatch",
		"YouthMatches",
		"CustomLink"],
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "<a href='http://www.alltid.org/team/[teamid]'>mylink</a>"],
	OPTION_TEXTS_DISABLED_LIST : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false],

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
	hasScroll:"",

	init : function() {
		this.bTeamLinks = Foxtrick.isModuleFeatureEnabled(this, "TeamLinks");
		this.bUserLinks = Foxtrick.isModuleFeatureEnabled(this, "UserLinks");
		this.bManager = Foxtrick.isModuleFeatureEnabled(this, "Manager");
		this.bTeam = Foxtrick.isModuleFeatureEnabled(this, "Team");
		this.bTeamAtAlltid = Foxtrick.isModuleFeatureEnabled(this, "TeamAtAlltid");
		this.bMatches = Foxtrick.isModuleFeatureEnabled(this, "Matches");
		this.bPlayers = Foxtrick.isModuleFeatureEnabled(this, "Players");
		this.bLast5IPs = Foxtrick.isModuleFeatureEnabled(this, "last_5_ips");
		this.bGuestbook = Foxtrick.isModuleFeatureEnabled(this, "Guestbook");
		this.bCoach = Foxtrick.isModuleFeatureEnabled(this, "Coach");
		this.bTransferHistory = Foxtrick.isModuleFeatureEnabled(this, "TransferHistory");
		this.bTeamHistory = Foxtrick.isModuleFeatureEnabled(this, "TeamHistory");
		this.bLastLineup = Foxtrick.isModuleFeatureEnabled(this, "LastLineup");
		this.bNextMatch = Foxtrick.isModuleFeatureEnabled(this, "NextMatch");
		this.bAddNextMatch = Foxtrick.isModuleFeatureEnabled(this, "AddNextMatch");
		this.bMessage= Foxtrick.isModuleFeatureEnabled(this, "SendMessage");
		this.bChallenge= Foxtrick.isModuleFeatureEnabled(this, "Challenge");
		this.bAchievements= Foxtrick.isModuleFeatureEnabled(this, "Achievements");
		this.bYouthMatches= Foxtrick.isModuleFeatureEnabled(this, "YouthMatches");
		this.bCustomLink= Foxtrick.isModuleFeatureEnabled(this, "CustomLink");
		this.bMore = FoxtrickPrefs.getBool("module.TeamPopupLinksMore.enabled");

		this.utext = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "CustomLink_text")
			|| this.OPTION_TEXTS_DEFAULT_VALUES[16];
	},

	run : function(page, doc) {
		try {
			var sUrl = Foxtrick.getHref(doc);

			this.userlink = false;
			var redir_from_forum = (sUrl.search(/Forum/i) != -1);
			if (sUrl.search(/ShowOldConnections=true/i) != -1) {
				var a = doc.getElementById("ctl00_CPMain_lnkShowLogins");
				if (a) {
					var func = a.href;
					if (func) {
						doc.location.href = func;
					}
				}
			}

			this.ownteamid = FoxtrickHelper.getOwnTeamId();
			this.hasScroll = Foxtrick.hasMainBodyScroll(doc);

			this.Target = '_self';
			if (Foxtrick.isModuleFeatureEnabled(this, "OpenNewTab")) this.Target = '_blank';

			//  team links
			var aLink = doc.getElementById('teamLinks').getElementsByTagName('a')[0];
			if (aLink) this._addSpan(doc, aLink);

			// all in mainWrapper (ie. not left boxes)
			if (sUrl.search(/Forum\/Default/i)!=-1) return; // not in forum overview
			var aLinks = doc.getElementById('mainBody').getElementsByTagName('a');
			var i = 0, aLink,li=0;
			while (aLink = aLinks[i++]) {
				if (aLink.getElementsByTagName('img')[0] != null || aLink.parentNode.className=='liveTabText')
					continue; // don't add to buttons, and htlive tabs
				if ((aLink.href.search(/Club\/\?TeamID=/i) > -1 && this.bTeamLinks)
				|| (aLink.href.search(/Club\/Manager\/\?UserID=/i) !=-1 && this.bUserLinks)) {
					this._addSpan(doc, aLink);
					if (li++>100) break;
				}
			 }

			var sidebar = doc.getElementById('sidebar');
			if (sidebar) {
				aLinks = sidebar.getElementsByTagName('a');
				var i = 0, aLink;
				while (aLink = aLinks[i++]) {
					if (aLink.getElementsByTagName('img')[0] != null) continue; // don't add to buttons
					if ((aLink.href.search(/Club\/\?TeamID=/i) > -1 && aLink.href.search(/redir_to/i)===-1 && this.bTeamLinks)
						|| (aLink.href.search(/Club\/Manager\/\?UserID=/i) !=-1 && this.bUserLinks)) {
						this._addSpan(doc,  aLink);
					}
				}
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},


	_addSpan : function (doc, aLink) {
		var par = aLink.parentNode;
		var span = doc.createElement("span");
		span.setAttribute('class', 'myht1');
		par.insertBefore(span, aLink);
		span.addEventListener("mouseover",FoxtrickTeamPopupLinks.popupshow,false);
		span.appendChild(aLink);
	},

	popupshow : function(evt) {
		try {
			var org_link = evt.target;
			var show_more = false;
			if (org_link.getAttribute('more')) {//)href.search('javascript')!=-1) {
				//Foxtrick.dump(org_link.org_link+'\n');
				org_link.removeEventListener('click',FoxtrickTeamPopupLinks.popupshow,true);
				if (org_link.getAttribute('more')=='true') show_more=true;
				org_link = org_link.parentNode.parentNode.previousSibling;
			}
			var doc = evt.target.ownerDocument;
			if (org_link.style==null) org_link.setAttribute('style','display:inline');
	  		evt.target.parentNode.removeEventListener("mouseover",FoxtrickTeamPopupLinks.popupshow,false);
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

			var top = -18; if (Foxtrick.isStandardLayout(doc)) top = 0;
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

			var owntopteamlinks = (org_link.parentNode.parentNode.tagName == "DIV" && org_link.parentNode.parentNode.id == "teamLinks");

			var list = doc.createElement("ul");
			list.className = "ft-popup-list";

			if (userlink
				&& ((!show_more && FoxtrickTeamPopupLinks.bTeam) || (show_more && FoxtrickTeamPopupLinksMore.bTeam))) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_team=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/?TeamID='+teamid+'&ft_popuplink=true';
				}
				link.setAttribute('target', FoxtrickTeamPopupLinks.Target);
				link.textContent = Foxtrickl10n.getString('Team');
				item.appendChild(link);
				list.appendChild(item);
				top = top - 20;
			}
			if (teamname!=null) {
				if (org_link.title.search(teamname)==-1)
						org_link.title += ' : '+teamname;
			}

			if ((!owntopteamlinks && !userlink)
				&& ((!show_more && FoxtrickTeamPopupLinks.bManager) || (show_more && FoxtrickTeamPopupLinksMore.bManager))) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				link.href = '/Club/Manager/?teamId='+teamid+'&ft_popuplink=true';
				link.setAttribute('target', FoxtrickTeamPopupLinks.Target);
				link.textContent = Foxtrickl10n.getString('Manager');
				item.appendChild(link);
				list.appendChild(item);
				top = top - 20;
			}

			if (!owntopteamlinks
				&& ((!show_more && FoxtrickTeamPopupLinks.bTeamAtAlltid) || (show_more && FoxtrickTeamPopupLinksMore.bTeamAtAlltid))) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_team_at_alltid=true'+'&ft_popuplink=true';
				}
				else {
					link.href = 'http://alltid.org/team/'+teamid+'&ft_popuplink=true';
				}
				link.textContent = Foxtrickl10n.getString('TeamAtAlltid');
				link.setAttribute('target', FoxtrickTeamPopupLinks.Target);
				item.appendChild(link);
				list.appendChild(item);
				top = top - 20;
			}

			if (owntopteamlinks
				|| ((!show_more && FoxtrickTeamPopupLinks.bMatches) || (show_more && FoxtrickTeamPopupLinksMore.bMatches))) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_matches=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Matches/?TeamID=' + teamid+'&ft_popuplink=true';
				}
				link.setAttribute('target', FoxtrickTeamPopupLinks.Target);
				link.textContent = Foxtrickl10n.getString('Matches');
				item.appendChild(link);
				list.appendChild(item);
				top = top - 20;
			}

			if (owntopteamlinks
				|| ((!show_more && FoxtrickTeamPopupLinks.bPlayers) || (show_more && FoxtrickTeamPopupLinksMore.bPlayers))) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_players=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Players/?TeamID=' + teamid+'&ft_popuplink=true';
				}
				link.setAttribute('target', FoxtrickTeamPopupLinks.Target);
				link.textContent = Foxtrickl10n.getString('Players');
				item.appendChild(link);
				list.appendChild(item);
				top = top - 20;
			}

			if (!owntopteamlinks
				&& ((!show_more && FoxtrickTeamPopupLinks.bLast5IPs) || (show_more && FoxtrickTeamPopupLinksMore.bLast5IPs))) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId=' + userid+'&ShowOldConnections=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Manager/?teamId=' + teamid+'&ShowOldConnections=true'+'&ft_popuplink=true';
				}
				link.setAttribute('target', FoxtrickTeamPopupLinks.Target);
				link.textContent = Foxtrickl10n.getString('last_5_ips');
				item.appendChild(link);
				list.appendChild(item);
				top = top - 20;
			}

			if (!owntopteamlinks
				&& ((!show_more && FoxtrickTeamPopupLinks.bGuestbook) || (show_more && FoxtrickTeamPopupLinksMore.bGuestbook))) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_guestbook=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Manager/Guestbook.aspx?teamid=' + teamid+'&ft_popuplink=true';
				}
				link.setAttribute('target', FoxtrickTeamPopupLinks.Target);
				link.textContent = Foxtrickl10n.getString('Guestbook');
				item.appendChild(link);
				list.appendChild(item);
				top = top - 20;
			}

			if (!owntopteamlinks
				&& ((!show_more && FoxtrickTeamPopupLinks.bMessage) || (show_more && FoxtrickTeamPopupLinksMore.bMessage))) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (username!='') {
					link.href = '/MyHattrick/Inbox/Default.aspx?actionType=newMail&mailto='+username;
				}
				else {
					link.href = '/Club/?TeamID='+teamid+'&redir_to_mail=true'+'&ft_popuplink=true';
				}
				link.setAttribute('target', FoxtrickTeamPopupLinks.Target);
				link.textContent = Foxtrickl10n.getString('SendMessage');
				item.appendChild(link);
				list.appendChild(item);
				top = top - 20;
			}

			if (!owntopteamlinks
				&& ((!show_more && FoxtrickTeamPopupLinks.bChallenge) || (show_more && FoxtrickTeamPopupLinksMore.bChallenge))) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_challenge=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Challenges/?TeamID='+teamid+'&challenge=true'+'&ft_popuplink=true';
				}
				link.setAttribute('target', FoxtrickTeamPopupLinks.Target);
				link.textContent = Foxtrickl10n.getString('Challenge');
				item.appendChild(link);
				list.appendChild(item);
				top = top - 20;
			}

			if (!owntopteamlinks
				&& ((!show_more && FoxtrickTeamPopupLinks.bAchievements) || (show_more && FoxtrickTeamPopupLinksMore.bAchievements))) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid && userid) {
					link.href = '/Club/Achievements/?userID='+userid+'&teamid='+teamid+'&ft_popuplink=true';
				}
				else if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_achievements=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Manager/?teamId='+teamid+'&redir_to_achievements=true'+'&ft_popuplink=true';
				}
				link.setAttribute('target', FoxtrickTeamPopupLinks.Target);
				link.textContent = Foxtrickl10n.getString('Achievements');
				item.appendChild(link);
				list.appendChild(item);
				top = top - 20;
			}

			if (!owntopteamlinks
				&& ((!show_more && FoxtrickTeamPopupLinks.bCoach) || (show_more && FoxtrickTeamPopupLinksMore.bCoach))) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_coach=true'+'&ft_popuplink=true';
				}
				else if (teamid!=FoxtrickTeamPopupLinks.ownteamid) {
					link.href = '/Club/Players/?TeamID='+teamid+'&redir_to_coach=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Training/?redir_to_coach=true'+'&ft_popuplink=true';
				}
				link.setAttribute('target', FoxtrickTeamPopupLinks.Target);
				link.textContent = Foxtrickl10n.getString('Coach');
				item.appendChild(link);
				list.appendChild(item);
				top = top - 20;
			}

			if (!owntopteamlinks
				&& ((!show_more && FoxtrickTeamPopupLinks.bTransferHistory) || (show_more && FoxtrickTeamPopupLinksMore.bTransferHistory))) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_transferhistory=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Transfers/transfersTeam.aspx?teamId=' + teamid+'&ft_popuplink=true';
				}
				link.setAttribute('target', FoxtrickTeamPopupLinks.Target);
				link.textContent = Foxtrickl10n.getString('TransferHistory');
				item.appendChild(link);
				list.appendChild(item);
				top = top - 20;
			}

			if (!owntopteamlinks
				&& ((!show_more && FoxtrickTeamPopupLinks.bTeamHistory) || (show_more && FoxtrickTeamPopupLinksMore.bTeamHistory))) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_teamhistory=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/History/?teamId=' + teamid+'&ft_popuplink=true';
				}
				link.setAttribute('target', FoxtrickTeamPopupLinks.Target);
				link.textContent = Foxtrickl10n.getString('TeamHistory');
				item.appendChild(link);
				list.appendChild(item);
				top = top - 20;
			}

			if (!owntopteamlinks
				&& ((!show_more && FoxtrickTeamPopupLinks.bLastLineup) || (show_more && FoxtrickTeamPopupLinksMore.bLastLineup))) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_lastlineup=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Matches/MatchLineup.aspx?MatchID=&TeamID='+teamid+'&useArchive=True'+'&ft_popuplink=true';
				}
				link.setAttribute('target', FoxtrickTeamPopupLinks.Target);
				link.textContent = Foxtrickl10n.getString('LastLineup');
				item.appendChild(link);
				list.appendChild(item);
				top = top - 20;
			}

			if (!owntopteamlinks
				&& ((!show_more && FoxtrickTeamPopupLinks.bNextMatch) || (show_more && FoxtrickTeamPopupLinksMore.bNextMatch))) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_nextmatch=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Matches/?TeamID='+teamid+'&redir_to_nextmatch=true'+'&ft_popuplink=true';
				}
				link.setAttribute('target', FoxtrickTeamPopupLinks.Target);
				link.textContent = Foxtrickl10n.getString('NextMatch');
				item.appendChild(link);
				list.appendChild(item);
				top = top - 20;
			}

			if (!owntopteamlinks
				&& ((!show_more && FoxtrickTeamPopupLinks.bAddNextMatch) || (show_more && FoxtrickTeamPopupLinksMore.bAddNextMatch))) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_addnextmatch=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Matches/?TeamID='+teamid+'&redir_to_addnextmatch=true'+'&ft_popuplink=true';
				}
				link.setAttribute('target', FoxtrickTeamPopupLinks.Target);
				link.textContent = Foxtrickl10n.getString('AddNextMatch');
				item.appendChild(link);
				list.appendChild(item);
				top = top - 20;
			}

			if (!owntopteamlinks
				&& ((!show_more && FoxtrickTeamPopupLinks.bYouthMatches) || (show_more && FoxtrickTeamPopupLinksMore.bYouthMatches))) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_youthmatches=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Matches/?TeamID='+teamid+'&redir_to_youthmatches=true'+'&ft_popuplink=true';
				}
				link.setAttribute('target', FoxtrickTeamPopupLinks.Target);
				link.textContent = Foxtrickl10n.getString('YouthMatches');
				item.appendChild(link);
				list.appendChild(item);
				top = top - 20;
			}

			if (!owntopteamlinks
				&& ((!show_more && FoxtrickTeamPopupLinks.bCustomLink) || (show_more && FoxtrickTeamPopupLinksMore.bCustomLink))) {
				var ownlinks = FoxtrickTeamPopupLinks.utext;
				if (show_more) ownlinks =  FoxtrickTeamPopupLinksMore.utext;
				ownlinks = ownlinks.split(/<\/a>\s+/);
				var i=0,ownlink;
				while (ownlink=ownlinks[i++]) {
					ownlink+='</a>';
					var item = doc.createElement("li");
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
						item.innerHTML = a6inner;
						var a6 = item.getElementsByTagName('a')[0];
						if (teamid==null) a6.href = '/Club/Manager/?userId='+userid+'&redir_to_custom=true'+'&'+a6.href;
						else a6.href = '/Club/Manager/?teamId='+teamid+'&redir_to_custom=true'+'&'+a6.href;
						a6.setAttribute('target', FoxtrickTeamPopupLinks.Target);
					}
					else {
						item.innerHTML = a6inner;
						var a6 = item.getElementsByTagName('a')[0];
						a6.setAttribute('target', FoxtrickTeamPopupLinks.Target);
					}
					list.appendChild(item);
					top = top - 20;
				}
			}

			if (!owntopteamlinks && FoxtrickTeamPopupLinks.bMore) {
					var item = doc.createElement("li");
					var link = doc.createElement("span");
					if (!show_more) {
						link.setAttribute('more', 'true');
						link.textContent = Foxtrickl10n.getString('more');
					}
					else {
						link.setAttribute('more', 'false');
						link.textContent = Foxtrickl10n.getString('less');
					}
					link.addEventListener('click',FoxtrickTeamPopupLinks.popupshow,true);
					item.appendChild(link);
					list.appendChild(item);
					top = top - 20;
			}
			if (!Foxtrick.isStandardLayout(doc)) top += 20;
			if (owntopteamlinks) top = -40;

			var mainBody = doc.getElementById('mainBody');

			var left = 20;
			if (!owntopteamlinks && FoxtrickTeamPopupLinks.hasScroll) {
				var pT = Foxtrick.GetElementPosition(org_link,mainBody)['top'] - mainBody.scrollTop;
				if (pT < mainBody.offsetHeight/2) {// = popdown
					top = -10;
					var more = list.removeChild(list.lastChild);
					list.insertBefore(more, list.firstChild);
				}
			}
			if (!owntopteamlinks && ismatchpreview) {
				top = -10;
				if (Foxtrick.isStandardLayout(doc)) top=10;
				var more = list.removeChild(list.lastChild);
				list.insertBefore(more, list.firstChild);
			}

			list.style.top = top + "px";
			list.style.left = left + "px";

			if (org_link.parentNode.lastChild.className == "ft-popup-list")
				org_link.parentNode.removeChild(org_link.parentNode.lastChild);
			org_link.parentNode.appendChild(list);
			org_link.removeEventListener("mouseover",FoxtrickTeamPopupLinks.popupshow,false);
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	}
};

// -------------------------------------------------------------------------------------------------
var FoxtrickTeamPopupLinksMore = {
	MODULE_NAME : "TeamPopupLinksMore",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('all_late'),
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8.2",
	LATEST_CHANGE:"Added teamhistory, next match, addnextmatch(to htlive), youth matches (default off)",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	OPTIONS : ["Manager",
		"Team",
		"TeamAtAlltid",
		"Matches" ,
		"Players" ,
		"last_5_ips",
		"Guestbook",
		"SendMessage",
		"Challenge",
		"Achievements",
		"Coach",
		"TransferHistory",
		"TeamHistory",
		"LastLineup",
		"NextMatch",
		"AddNextMatch",
		"YouthMatches",
		"CustomLink"],
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "<a href='http://www.alltid.org/user/[userid]'>mylink</a> <a href='/club/?teamid=[teamid]'>mylink2</a>"],
	OPTION_TEXTS_DISABLED_LIST : [true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, false],

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
	bChallenge : "",
	bAchievements : "",
	bYouthMatches : "",
	bCustomLink : "",
	utext : "",

	init : function() {
		this.bManager = Foxtrick.isModuleFeatureEnabled(this, "Manager");
		this.bTeam = Foxtrick.isModuleFeatureEnabled(this, "Team");
		this.bTeamAtAlltid = Foxtrick.isModuleFeatureEnabled(this, "TeamAtAlltid");
		this.bMatches = Foxtrick.isModuleFeatureEnabled(this, "Matches");
		this.bPlayers = Foxtrick.isModuleFeatureEnabled(this, "Players");
		this.bLast5IPs = Foxtrick.isModuleFeatureEnabled(this, "last_5_ips");
		this.bGuestbook = Foxtrick.isModuleFeatureEnabled(this, "Guestbook");
		this.bMessage= Foxtrick.isModuleFeatureEnabled(this, "SendMessage");
		this.bChallenge= Foxtrick.isModuleFeatureEnabled(this, "Challenge");
		this.bAchievements= Foxtrick.isModuleFeatureEnabled(this, "Achievements");
		this.bCoach = Foxtrick.isModuleFeatureEnabled(this, "Coach");
		this.bTransferHistory = Foxtrick.isModuleFeatureEnabled(this, "TransferHistory");
		this.bTeamHistory = Foxtrick.isModuleFeatureEnabled(this, "TeamHistory");
		this.bLastLineup = Foxtrick.isModuleFeatureEnabled(this, "LastLineup");
		this.bNextMatch = Foxtrick.isModuleFeatureEnabled(this, "NextMatch");
		this.bAddNextMatch = Foxtrick.isModuleFeatureEnabled(this, "AddNextMatch");
		this.bYouthMatches = Foxtrick.isModuleFeatureEnabled(this, "YouthMatches");
		this.bCustomLink = Foxtrick.isModuleFeatureEnabled(this, "CustomLink");
		this.utext = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "CustomLink_text");
		if (!this.utext) this.utext = this.OPTION_TEXTS_DEFAULT_VALUES[13];
	}
};
