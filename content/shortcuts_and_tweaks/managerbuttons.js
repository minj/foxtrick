/**
 * addmanagerbuttons.js
 * Adds Send Message and Write in Guestbook buttons to manager page
 * @author larsw84, Stephan57, ryanli, convinedd
 */

 ////////////////////////////////////////////////////////////////////////////////
var FoxtrickManagerButtons = {

	MODULE_NAME : "ManagerButtons",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array("managerPage", "teamPage","youthoverview"),
	OPTIONS : ["GuestBook", "LargeSendMail"],

	GUESTBOOK_LINK_ID : "ft-guest-book",
	CHALLENGE_LINK_ID : "ctl00_ctl00_CPContent_CPSidebar_ucVisitorActions_lnkChallenge",
	MAIL_LINK_ID: "ctl00_ctl00_CPContent_CPSidebar_ucVisitorActions_lnkMail",

	run : function(page, doc) {
		var ownTeamId = Foxtrick.Pages.All.getOwnTeamId(doc);
		var teamId = Foxtrick.Pages.All.getTeamId(doc);

		if (ownTeamId === null || teamId === null || ownTeamId === teamId) {
			// we don't add the buttons for your own page
			return;
		}

		if (Foxtrick.isModuleFeatureEnabled(this, "LargeSendMail")) {
			this.changeMailLink(page, doc);
		}

		if (Foxtrick.isModuleFeatureEnabled(this, "GuestBook")
			&& doc.getElementById(this.GUESTBOOK_LINK_ID) === null) {
			if (!Foxtrick.hasElement(doc, this.GUESTBOOK_LINK_ID)
				&& Foxtrick.hasElement(doc, this.CHALLENGE_LINK_ID)
				|| page === "youthoverview") {
				this.addGuestBookLink(doc, page);
			}
		}
	},

	change : function(page, doc) {
		this.run(page, doc);
	},

	changeMailLink : function(page, doc) {
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		// get user name
		var username='';
		if (page==='managerPage') {
			var h1inner = doc.getElementById('mainBody').getElementsByTagName("h1")[0].innerHTML;
			username = h1inner.replace(/\<.+\>|\(.+\)| /gi,'');
			var messageLink = doc.getElementById(this.MAIL_LINK_ID);
			messageLink.href = "/MyHattrick/Inbox/Default.aspx?actionType=newMail&mailto="+username;
        }
		else if (page==='teamPage') {
			var mainBodylinks = doc.getElementById('mainBody').getElementsByTagName("a");
			for (var i=0;i<mainBodylinks.length;++i) {
				if (mainBodylinks[i].href.search(/\/Club\/Manager\/\?userId=/i)!=-1) {
					username = mainBodylinks[i].title;
					break;
				}
			}
			var messageLink = doc.getElementById(this.MAIL_LINK_ID);
			messageLink.href = "/MyHattrick/Inbox/Default.aspx?actionType=newMail&mailto="+username;
		}
		else if (page === "youthoverview") {
			parentDiv = doc.createElement("div");
			parentDiv.id = "foxtrick_addactionsbox_parentDiv";
			var newBoxId = "foxtrick_actions_box";

			var mailLink = doc.createElement("a");
			mailLink.className = "inner";
			mailLink.href = '/Club/?TeamID='+teamId+'&redir_to_mail=true';
            mailLink.title = Foxtrickl10n.getString("foxtrick.tweaks.sendmessage");

			if (!FoxtrickMain.isStandard) {
				mailLink.innerHTML = Foxtrickl10n.getString("foxtrick.tweaks.sendmessage");
				mailLink.setAttribute('style','display:block;');
			}
			else {
				var img = doc.createElement("img");
				img.style.padding = "0px 5px 0px 0px";
				img.className = "actionIcon";
				img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.sendmessage" );
				img.src = "/App_Themes/Standard/images/ActionIcons/mail.png";
				mailLink.appendChild(img);
			}
			parentDiv.appendChild(mailLink);
			Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString(
				"foxtrick.tweaks.actions" ), parentDiv, newBoxId, "first", "");
		}
	},

	addGuestBookLink : function(doc, page) {
		var teamId = Foxtrick.Pages.All.getTeamId(doc);

		var isSupporter = false;

		// first we check if the manager is a supporter
		if (page === "managerPage") {
			var sidebar = doc.getElementById("sidebar");
			var sidebarlinks = sidebar.getElementsByTagName("a");
			for (var i=0;i<sidebarlinks.length;++i) {
				if (sidebarlinks[i].href === "/Club/Supporters/"
					|| sidebarlinks[i].href.search(/Club\/\?TeamID=/i) !== -1
					|| sidebarlinks[i].href.search(/Community\/Federations\/Federation.aspx\?AllianceID=/i) !== -1) {
					isSupporter = true;
					break;
				}
			}
			if (!isSupporter) {
				var sidebarBoxCount = sidebar.getElementsByClassName("sidebarBox").length;
				if (sidebarBoxCount > 3) {
					isSupporter = true;
				}
			}
		}
		else if (page === "teamPage") {
			var sidebarlinks = doc.getElementById('sidebar').getElementsByTagName("a");
			for (var i=0;i<sidebarlinks.length;++i) {
				if (sidebarlinks[i].href.search(/Club\/HallOfFame/i)!=-1 ) {
					isSupporter = true;
					break;
				}
			}
		}
		else if (page === "youthoverview") {
			isSupporter = true; // status unknown there. just add it anyways?
		}

		var parentDiv = doc.getElementById(this.CHALLENGE_LINK_ID);
		var insertBefore = null;
		if (parentDiv === null) {
			parentDiv = doc.getElementById('foxtrick_addactionsbox_parentDiv');
			if (parentDiv === null) {
				parentDiv = doc.createElement("div");
				parentDiv.id = "foxtrick_addactionsbox_parentDiv";
				var newBoxId = "foxtrick_actions_box";
				Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString(
					"foxtrick.tweaks.actions" ), parentDiv, newBoxId, "first", "");
			}
		}
		else {
			parentDiv = parentDiv.parentNode;
			insertBefore = doc.getElementById(this.MAIL_LINK_ID);
			if (insertBefore) {
				// insert after the mail link
				insertBefore = insertBefore.nextSibling;
			}
		}

		//Display GuestBook button only if team is HT-Supporter
		if (isSupporter) {
			var guestbookLink = doc.createElement("a");
			guestbookLink.href = "/Club/Manager/Guestbook.aspx?teamid=" + teamId;
			guestbookLink.title = Foxtrickl10n.getString("foxtrick.tweaks.writeinguestbook");
			guestbookLink.id = this.GUESTBOOK_LINK_ID;

			if (Foxtrick.isStandardLayout(doc)) {
				guestbookLink.className = "inner";
				var img = doc.createElement("img");
				img.style.padding = "0px 5px 0px 0px";
				img.className = "actionIcon";
				img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.writeinguestbook" );
				img.src = Foxtrick.ResourcePath+"resources/img/guestbook.png";
				guestbookLink.appendChild(img);
			}
			else {
				guestbookLink.textContent = Foxtrickl10n.getString("foxtrick.tweaks.writeinguestbook");
			}
			parentDiv.insertBefore(guestbookLink, insertBefore);
		}
	}
};
