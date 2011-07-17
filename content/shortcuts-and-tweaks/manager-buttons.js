/**
 * addmanager-buttons.js
 * Adds Send Message and Write in Guestbook buttons to manager page
 * @author larsw84, Stephan57, ryanli, convinedd
 */

 ////////////////////////////////////////////////////////////////////////////////
var FoxtrickManagerButtons = {

	MODULE_NAME : "ManagerButtons",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array("managerPage", "teamPage","youthoverview"),
	OPTIONS : ["GuestBook"],

	GUESTBOOK_LINK_ID : "ft-guest-book",
	CHALLENGE_LINK_ID : "ctl00_ctl00_CPContent_CPSidebar_ucVisitorActions_lnkChallenge",
	MAIL_LINK_ID: "ctl00_ctl00_CPContent_CPSidebar_ucVisitorActions_lnkMail",

	run : function(doc) {
		var ownTeamId = Foxtrick.Pages.All.getOwnTeamId(doc);
		var teamId = Foxtrick.Pages.All.getTeamId(doc);

		if (ownTeamId === null || teamId === null || ownTeamId === teamId) {
			// we don't add the buttons for your own page
			return;
		}

		if (Foxtrick.isModuleFeatureEnabled(this, "GuestBook")
			&& doc.getElementById(this.GUESTBOOK_LINK_ID) === null) {
			if (!Foxtrick.hasElement(doc, this.GUESTBOOK_LINK_ID)
				&& Foxtrick.hasElement(doc, this.CHALLENGE_LINK_ID)
				|| Foxtrick.isPage("youthoverview", doc)) {
				this.addGuestBookLink(doc);
			}
		}
	},

	change : function(doc) {
		this.run(doc);
	},

	addGuestBookLink : function(doc) {
		var teamId = Foxtrick.Pages.All.getTeamId(doc);

		var isSupporter = false;

		// first we check if the manager is a supporter
		if (Foxtrick.isPage("managerPage", doc)) {
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
		else if (Foxtrick.isPage("teamPage", doc)) {
			var sidebarlinks = doc.getElementById('sidebar').getElementsByTagName("a");
			for (var i=0;i<sidebarlinks.length;++i) {
				if (sidebarlinks[i].href.search(/Club\/HallOfFame/i)!=-1 ) {
					isSupporter = true;
					break;
				}
			}
		}
		else if (Foxtrick.isPage("youthoverview", doc)) {
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
