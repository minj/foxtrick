/**
 * teampopuplinks.js
 * Foxtrick show Team Popup
 * @author bummerland, convinced, ryanli
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

	OPTIONS : [ "TeamLinks", "UserLinks", "CustomLink" ],
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : [ "", "", "<a href='http://www.alltid.org/team/[teamid]'>mylink</a>" ],
	OPTION_TEXTS_DISABLED_LIST : [ true, true, false],

	OPTION_FUNC : function(doc) {
		const options = [
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
			"YouthMatches"];

		var table = doc.createElement("table");

		var headerRow = doc.createElement("tr");
		table.appendChild(headerRow);

		var placeHolder = doc.createElement("th");
		headerRow.appendChild(placeHolder);
		var enableDefault = doc.createElement("th");
		enableDefault.setAttribute("text-key", "TeamPopupLinks.ShowByDefault");
		headerRow.appendChild(enableDefault);
		var enableMore = doc.createElement("th");
		enableMore.setAttribute("text-key", "TeamPopupLinks.ShowOnMore");
		headerRow.appendChild(enableMore);

		for (var i in options) {
			var row = doc.createElement("tr");
			table.appendChild(row);

			var title = doc.createElement("th");
			title.textContent = FoxtrickPrefs.getModuleElementDescription(this.MODULE_NAME, options[i]);
			row.appendChild(title);

			var defaultCell = doc.createElement("td");
			row.appendChild(defaultCell);
			var defaultCheck = doc.createElement("input");
			defaultCheck.type = "checkbox";
			defaultCheck.setAttribute("pref", "module." + this.MODULE_NAME + "." + options[i] + ".default");
			defaultCell.appendChild(defaultCheck);

			var moreCell = doc.createElement("td");
			row.appendChild(moreCell);
			var moreCheck = doc.createElement("input");
			moreCheck.type = "checkbox";
			moreCheck.setAttribute("pref", "module." + this.MODULE_NAME + "." + options[i] + ".more");
			moreCell.appendChild(moreCheck);
		}

		return table;
	},

	run : function(page, doc) {
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
			if ((aLink.href.search(/Club\/\?TeamID=/i) > -1)
			|| (aLink.href.search(/Club\/Manager\/\?UserID=/i) !=-1)) {
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
				if ((aLink.href.search(/Club\/\?TeamID=/i) > -1 && aLink.href.search(/redir_to/i)===-1 && Foxtrick.isModuleFeatureEnabled(this, "TeamLinks"))
					|| (aLink.href.search(/Club\/Manager\/\?UserID=/i) !=-1 && Foxtrick.isModuleFeatureEnabled(this, "UserLinks"))) {
					this._addSpan(doc,  aLink);
				}
			}
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

	isEnabledWithinContext : function(option, more) {
		if (!more)
			return FoxtrickPrefs.getBool("module." + this.MODULE_NAME + "." + option + ".default");
		else
			return FoxtrickPrefs.getBool("module." + this.MODULE_NAME + "." + option + ".more");
	},

	popupshow : function(evt) {
		try {
			var org_link = evt.target;
			var show_more = false;
			if (org_link.getAttribute('more')) {
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

			if (userlink && FoxtrickTeamPopupLinks.isEnabledWithinContext("Team", show_more)) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_team=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/?TeamID='+teamid+'&ft_popuplink=true';
				}
				link.textContent = Foxtrickl10n.getString('Team');
				item.appendChild(link);
				list.appendChild(item);
			}
			if (teamname!=null) {
				if (org_link.title.search(teamname)==-1)
						org_link.title += ' : '+teamname;
			}

			if ((!owntopteamlinks && !userlink)
				&& FoxtrickTeamPopupLinks.isEnabledWithinContext("Manager", show_more)) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				link.href = '/Club/Manager/?teamId='+teamid+'&ft_popuplink=true';
				link.textContent = Foxtrickl10n.getString('Manager');
				item.appendChild(link);
				list.appendChild(item);
			}

			if (!owntopteamlinks && FoxtrickTeamPopupLinks.isEnabledWithinContext("TeamAtAlltid", show_more)) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_team_at_alltid=true'+'&ft_popuplink=true';
				}
				else {
					link.href = 'http://alltid.org/team/'+teamid+'&ft_popuplink=true';
				}
				link.textContent = Foxtrickl10n.getString('TeamAtAlltid');
				item.appendChild(link);
				list.appendChild(item);
			}

			if (owntopteamlinks || FoxtrickTeamPopupLinks.isEnabledWithinContext("Team", show_more)) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_matches=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Matches/?TeamID=' + teamid+'&ft_popuplink=true';
				}
				link.textContent = Foxtrickl10n.getString('Matches');
				item.appendChild(link);
				list.appendChild(item);
			}

			if (owntopteamlinks || FoxtrickTeamPopupLinks.isEnabledWithinContext("Players", show_more)) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_players=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Players/?TeamID=' + teamid+'&ft_popuplink=true';
				}
				link.textContent = Foxtrickl10n.getString('Players');
				item.appendChild(link);
				list.appendChild(item);
			}

			if (!owntopteamlinks && FoxtrickTeamPopupLinks.isEnabledWithinContext("last_5_ips", show_more)) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId=' + userid+'&ShowOldConnections=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Manager/?teamId=' + teamid+'&ShowOldConnections=true'+'&ft_popuplink=true';
				}
				link.textContent = Foxtrickl10n.getString('last_5_ips');
				item.appendChild(link);
				list.appendChild(item);
			}

			if (!owntopteamlinks && FoxtrickTeamPopupLinks.isEnabledWithinContext("Guestbook", show_more)) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_guestbook=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Manager/Guestbook.aspx?teamid=' + teamid+'&ft_popuplink=true';
				}
				link.textContent = Foxtrickl10n.getString('Guestbook');
				item.appendChild(link);
				list.appendChild(item);
			}

			if (!owntopteamlinks && FoxtrickTeamPopupLinks.isEnabledWithinContext("SendMessage", show_more)) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (username!='') {
					link.href = '/MyHattrick/Inbox/Default.aspx?actionType=newMail&mailto='+username;
				}
				else {
					link.href = '/Club/?TeamID='+teamid+'&redir_to_mail=true'+'&ft_popuplink=true';
				}
				link.textContent = Foxtrickl10n.getString('SendMessage');
				item.appendChild(link);
				list.appendChild(item);
			}

			if (!owntopteamlinks && FoxtrickTeamPopupLinks.isEnabledWithinContext("Challenge", show_more)) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_challenge=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Challenges/?TeamID='+teamid+'&challenge=true'+'&ft_popuplink=true';
				}
				link.textContent = Foxtrickl10n.getString('Challenge');
				item.appendChild(link);
				list.appendChild(item);
			}

			if (!owntopteamlinks && FoxtrickTeamPopupLinks.isEnabledWithinContext("Achievements", show_more)) {
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
				link.textContent = Foxtrickl10n.getString('Achievements');
				item.appendChild(link);
				list.appendChild(item);
			}

			if (!owntopteamlinks && FoxtrickTeamPopupLinks.isEnabledWithinContext("Coach", show_more)) {
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
				link.textContent = Foxtrickl10n.getString('Coach');
				item.appendChild(link);
				list.appendChild(item);
			}

			if (!owntopteamlinks && FoxtrickTeamPopupLinks.isEnabledWithinContext("TransferHistory", show_more)) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_transferhistory=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Transfers/transfersTeam.aspx?teamId=' + teamid+'&ft_popuplink=true';
				}
				link.textContent = Foxtrickl10n.getString('TransferHistory');
				item.appendChild(link);
				list.appendChild(item);
			}

			if (!owntopteamlinks && FoxtrickTeamPopupLinks.isEnabledWithinContext("TeamHistory", show_more)) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_teamhistory=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/History/?teamId=' + teamid+'&ft_popuplink=true';
				}
				link.textContent = Foxtrickl10n.getString('TeamHistory');
				item.appendChild(link);
				list.appendChild(item);
			}

			if (!owntopteamlinks && FoxtrickTeamPopupLinks.isEnabledWithinContext("LastLineup", show_more)) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_lastlineup=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Matches/MatchLineup.aspx?MatchID=&TeamID='+teamid+'&useArchive=True'+'&ft_popuplink=true';
				}
				link.textContent = Foxtrickl10n.getString('LastLineup');
				item.appendChild(link);
				list.appendChild(item);
			}

			if (!owntopteamlinks && FoxtrickTeamPopupLinks.isEnabledWithinContext("NextMatch", show_more)) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_nextmatch=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Matches/?TeamID='+teamid+'&redir_to_nextmatch=true'+'&ft_popuplink=true';
				}
				link.textContent = Foxtrickl10n.getString('NextMatch');
				item.appendChild(link);
				list.appendChild(item);
			}

			if (!owntopteamlinks && FoxtrickTeamPopupLinks.isEnabledWithinContext("AddNextMatch", show_more)) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_addnextmatch=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Matches/?TeamID='+teamid+'&redir_to_addnextmatch=true'+'&ft_popuplink=true';
				}
				link.textContent = Foxtrickl10n.getString('AddNextMatch');
				item.appendChild(link);
				list.appendChild(item);
			}

			if (!owntopteamlinks && FoxtrickTeamPopupLinks.isEnabledWithinContext("YouthMatches", show_more)) {
				var item = doc.createElement("li");
				var link = doc.createElement("a");
				if (teamid==null) {
					link.href = '/Club/Manager/?userId='+userid+'&redir_to_youthmatches=true'+'&ft_popuplink=true';
				}
				else {
					link.href = '/Club/Matches/?TeamID='+teamid+'&redir_to_youthmatches=true'+'&ft_popuplink=true';
				}
				link.textContent = Foxtrickl10n.getString('YouthMatches');
				item.appendChild(link);
				list.appendChild(item);
			}

			if (!owntopteamlinks && Foxtrick.isModuleFeatureEnabled(this, "CustomLinks")) {
				ownlinks = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + "CustomLink_text");
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
					}
					else {
						item.innerHTML = a6inner;
						var a6 = item.getElementsByTagName('a')[0];
					}
					list.appendChild(item);
				}
			}

			if (!owntopteamlinks) {
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
			}

			var mainBody = doc.getElementById('mainBody');

			if (!owntopteamlinks && FoxtrickTeamPopupLinks.hasScroll) {
				var pT = Foxtrick.GetElementPosition(org_link,mainBody)['top'] - mainBody.scrollTop;
				if (pT < mainBody.offsetHeight/2) {// = popdown
					var more = list.removeChild(list.lastChild);
					list.insertBefore(more, list.firstChild);
					var down=true;
				}
			}
			if (!owntopteamlinks && ismatchpreview) {
				var more = list.removeChild(list.lastChild);
				list.insertBefore(more, list.firstChild);
			}

			if (!down) list.className +=' ft-popup-list-up';
			else list.className +=' ft-popup-list-down';

			if (Foxtrick.hasClass(org_link.parentNode.lastChild, "ft-popup-list"))
				org_link.parentNode.removeChild(org_link.parentNode.lastChild);
			org_link.parentNode.appendChild(list);
			org_link.removeEventListener("mouseover",FoxtrickTeamPopupLinks.popupshow,false);
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	}
};
