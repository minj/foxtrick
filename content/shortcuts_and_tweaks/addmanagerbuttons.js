/**
 * addmanagerbuttons.js
 * Adds Send Message and Write in Guestbook buttons to manager page
 * @author larsw84, Stephan57, ryanli
 */

 ////////////////////////////////////////////////////////////////////////////////
var FoxtrickAddManagerButtons = {

	MODULE_NAME : "AddManagerButtons",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array("managerPage", "teamPage"),
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION : "0.5.1.3",
	LATEST_CHANGE : "Updated to latest HT version.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

	GUESTBOOK_LINK_ID : "guestbook_link_id",
	MANAGER_ACTION_BOX_ID : "ctl00_CPSidebar_ucVisitorActions_UpdatePanel1",

	init : function() {
	},

	run : function(page, doc) {
		try {	
				if (!Foxtrick.hasElement(doc, this.GUESTBOOK_LINK_ID) &&
						Foxtrick.hasElement(doc, this.MANAGER_ACTION_BOX_ID)) {
					this.addActionsBox(doc);
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
	try{
		var ownTeamId = Foxtrick.Pages.All.getOwnTeamId(doc);
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		var isSupporter = (Foxtrick.hasElement(doc, "ctl00_CPMain_ucManagerFace_pnlAvatar") 
				|| Foxtrick.hasElement(doc, "ctl00_CPMain_ucClubLogo_pnlLogo")) ;

		if (ownTeamId === null || teamId === null || ownTeamId === teamId) {
			// we don't add the buttons for your own page
			return;
		}

		var h1inner = doc.getElementById('mainBody').getElementsByTagName("h1")[0].innerHTML;
		var username = Foxtrick.trim(h1inner.replace(/\<.+\>|\(.+\)| /gi,''));
		var official = (username.toLowerCase().indexOf('mod-') == 0 || username.toLowerCase().indexOf('gm-') == 0 || username.toLowerCase().indexOf('la-') == 0 || username.toLowerCase().indexOf('ht-') == 0 || username.toLowerCase().indexOf('chpp-') == 0)
		
//		Foxtrick.dump('isSupporter: '+isSupporter+' OFFI: ' + official+'\n');
		
		var parentDiv = doc.createElement("div");
		parentDiv.id = this.GUESTBOOK_LINK_ID;

		//Display GuestBook button only if teamid is HT-Supporter - Stephan57
		if (isSupporter) {
			var guestbookLink = doc.createElement("a");
			guestbookLink.className = "inner";
			guestbookLink.href = "\/Club\/Manager\/Guestbook.aspx?teamid=" + teamId;
			guestbookLink.innerHTML = Foxtrickl10n.getString("foxtrick.tweaks.writeinguestbook");

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
		doc.getElementById(this.MANAGER_ACTION_BOX_ID).getElementsByTagName("div")[0].appendChild(parentDiv);
	} catch(e) {Foxtrick.dumpError(e);}
	}	
};
