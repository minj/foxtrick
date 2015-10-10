'use strict';
/**
 * addmanager-buttons.js
 * Adds Send Message and Write in Guestbook buttons to manager page
 * @author larsw84, Stephan57, ryanli, convinedd
 */

////////////////////////////////////////////////////////////////////////////////
Foxtrick.modules['ManagerButtons'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['managerPage', 'teamPage', 'youthOverview'],
	OPTIONS: ['GuestBook'],
	NICE: -1, // before FoxtrickAddDefaultFaceCard

	GUESTBOOK_LINK_ID: 'ft-guest-book',
	CHALLENGE_LINK_ID: 'ctl00_ctl00_CPContent_CPSidebar_ucVisitorActions_lnkChallenge',
	MAIL_LINK_ID: 'ctl00_ctl00_CPContent_CPSidebar_ucVisitorActions_lnkMail',

	run: function(doc) {
		var ownTeamId = Foxtrick.Pages.All.getOwnTeamId(doc);
		var teamId = Foxtrick.Pages.All.getTeamId(doc);

		if (ownTeamId === null || teamId === null || ownTeamId === teamId) {
			// we don't add the buttons for your own page
			return;
		}

		if (Foxtrick.Prefs.isModuleOptionEnabled('ManagerButtons', 'GuestBook')
			&& doc.getElementById(this.GUESTBOOK_LINK_ID) === null) {
			if (!Foxtrick.hasElement(doc, this.GUESTBOOK_LINK_ID)
				&& Foxtrick.hasElement(doc, this.MAIL_LINK_ID)
				|| Foxtrick.isPage(doc, 'youthOverview')) {
				this.addGuestBookLink(doc);
			}
		}
	},

	change: function(doc) {
		this.run(doc);
	},

	addGuestBookLink: function(doc) {
		var teamId = Foxtrick.Pages.All.getTeamId(doc);

		var isSupporter = false;

		// first we check if the manager is a supporter
		if (Foxtrick.isPage(doc, 'managerPage')) {
			var sidebar = doc.getElementById('sidebar');
			var sidebarlinks = sidebar.getElementsByTagName('a');
			for (var i = 0; i < sidebarlinks.length; ++i) {
				if (sidebarlinks[i].href === '/Club/Supporters/'
					|| sidebarlinks[i].href.search(/Club\/\?TeamID=/i) !== -1
					|| sidebarlinks[i].href
						.search(/Community\/Federations\/Federation.aspx\?AllianceID=/i) !== -1) {
					isSupporter = true;
					break;
				}
			}
			if (!isSupporter) {
				var sidebarBoxCount = sidebar.getElementsByClassName('sidebarBox').length;
				if (sidebarBoxCount > 3) {
					isSupporter = true;
				}
			}
		}
		else if (Foxtrick.isPage(doc, 'teamPage')) {
			var sidebarlinks = doc.getElementById('sidebar').getElementsByTagName('a');
			for (var i = 0; i < sidebarlinks.length; ++i) {
				if (sidebarlinks[i].href.search(/Club\/HallOfFame/i) != -1) {
					isSupporter = true;
					break;
				}
			}
		}
		else if (Foxtrick.isPage(doc, 'youthOverview')) {
			isSupporter = true; // status unknown there. just add it anyways?
		}

		var parentDiv = doc.getElementById(this.MAIL_LINK_ID);
		var insertBefore = null;
		if (parentDiv === null) {
			parentDiv = doc.getElementById('foxtrick_addactionsbox_parentDiv');
			if (parentDiv === null) {
				parentDiv = Foxtrick.createFeaturedElement(doc, this, 'div');
				parentDiv.id = 'foxtrick_addactionsbox_parentDiv';
				Foxtrick.addBoxToSidebar(doc,
					Foxtrick.L10n.getString('sidebarBox.actions'),
					parentDiv, -1);
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
			var guestbookLink = Foxtrick.createFeaturedElement(doc, this, 'a');
			guestbookLink.href = '/Club/Manager/Guestbook.aspx?teamid=' + teamId;
			guestbookLink.title = Foxtrick.L10n.getString('ManagerButtons.writeInGuestbook');
			guestbookLink.id = this.GUESTBOOK_LINK_ID;

			if (Foxtrick.util.layout.isStandard(doc)) {
				guestbookLink.className = 'inner';
				Foxtrick.addImage(doc, guestbookLink, {
					style: 'padding: 0px 5px 0px 0px',
					class: 'actionIcon',
					alt: Foxtrick.L10n.getString('ManagerButtons.writeInGuestbook'),
					src: Foxtrick.InternalPath + 'resources/img/guestbook.png'
				});
			}
			else {
				guestbookLink.textContent = Foxtrick.L10n.getString('ManagerButtons.writeInGuestbook');
			}
			parentDiv.insertBefore(guestbookLink, insertBefore);
		}
	}
};
