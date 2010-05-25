/**
 * addmanagerbuttons.js
 * Adds Send Message and Write in Guestbook buttons to manager page
 * @author larsw84, Stephan57, ryanli
 */

 ////////////////////////////////////////////////////////////////////////////////
var FoxtrickAddManagerButtons = {

	MODULE_NAME : "AddManagerButtons",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array("managerPage", "youthoverview"),
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION : "0.5.1.3",
	LATEST_CHANGE : "Updated to latest HT version.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

	ACTION_BOX_ID : "foxtrick-actions-box",
	MANAGER_ACTION_BOX_ID : "ctl00_CPSidebar_ucVisitorActions_UpdatePanel1",

	init : function() {
	},

	run : function(page, doc) {
		try {
			if (page === "managerPage") {
				if (!Foxtrick.hasElement(doc, this.ACTION_BOX_ID)
					&& !Foxtrick.hasElement(doc, this.MANAGER_ACTION_BOX_ID)) {
					this.addActionsBox(doc);
				}
			}
			else if (page === "youthoverview") {
				if (!Foxtrick.hasElement(doc, this.ACTION_BOX_ID)) {
					this.addActionsBox(doc);
				}
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	change : function(page, doc) {
		this.run(page, doc);
	},

	addActionsBox : function(doc) {
		var ownTeamId = Foxtrick.Pages.All.getOwnTeamId(doc);
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		var isSupporter = Foxtrick.hasElement(doc, "ctl00_CPMain_ucManagerFace_pnlAvatar");

		if (ownTeamId === null || teamId === null || ownTeamId === teamId) {
			// we don't add the buttons for your own page
			return;
		}

		var h1inner = doc.getElementById('mainBody').getElementsByTagName("h1")[0].innerHTML;
		var username = Foxtrick.trim(h1inner.replace(/\<.+\>|\(.+\)| /gi,''));
		var official = (username.toLowerCase().indexOf('mod-') == 0 || username.toLowerCase().indexOf('gm-') == 0 || username.toLowerCase().indexOf('la-') == 0 || username.toLowerCase().indexOf('ht-') == 0 || username.toLowerCase().indexOf('chpp-') == 0)
		// Foxtrick.dump('\nOFFI: ' + official+'\n');

		var parentDiv = doc.createElement("div");
		parentDiv.id = "foxtrick_addactionsbox_parentDiv";

		var messageLink = doc.createElement("a");
		messageLink.className = "inner";

		messageLink.href = "/MyHattrick/Inbox/Default.aspx?actionType=newMail&mailto="+username;
		if (doc.location.href.search(/\/Club\/Youth/)!=-1) messageLink.href='/Club/?TeamID='+teamID+'&SendMessage=true';
		//messageLink.href = "../?TeamID=" + teamID + "&SendMessage=true";
		messageLink.title = Foxtrickl10n.getString("foxtrick.tweaks.sendmessage");

		var img = doc.createElement("img");
		img.style.padding = "0px 5px 0px 0px";
		img.className = "actionIcon";
		img.alt = Foxtrickl10n.getString("foxtrick.tweaks.sendmessage");
		img.src = "/App_Themes/Standard/images/ActionIcons/mail.png";
		messageLink.appendChild(img);

		parentDiv.appendChild(messageLink);

		//Display GuestBook button only if teamid is HT-Supporter - Stephan57
		if (isSupporter) {
			var guestbookLink = doc.createElement("a");
			guestbookLink.className = "inner";
			guestbookLink.href = "\/Club\/Manager\/Guestbook.aspx?teamid=" + teamID;
			guestbookLink.title = Foxtrickl10n.getString("foxtrick.tweaks.writeinguestbook");

			var img = doc.createElement("img");
			img.style.padding = "0px 5px 0px 0px";
			img.className = "actionIcon";
			img.alt = Foxtrickl10n.getString("foxtrick.tweaks.writeinguestbook");
			img.src = Foxtrick.ResourcePath+"resources/img/writeinguestbook.png";
			guestbookLink.appendChild(img);

			parentDiv.appendChild(guestbookLink);
		}
		if (official) {
			var infobox = doc.createElement("div");
			infobox.style.color = "red";
			infobox.style.padding = "2px";
			infobox.innerHTML = Foxtrickl10n.getString("foxtrick.tweaks.sendmessageofficial");
			parentDiv.appendChild(infobox);
		}

		// Append the box to the sidebar
		Foxtrick.addBoxToSidebar(doc, Foxtrickl10n.getString("foxtrick.tweaks.actions"),
			parentDiv, this.ACTION_BOX_ID, "first", "");
	}
};
