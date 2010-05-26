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
	DEFAULT_ENABLED : false,
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
					this.addActionsBox(doc, page);
				}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	change : function(page, doc) {
		this.run(page, doc);
	},

	addActionsBox : function(doc, page) {
	try{
		var ownTeamId = Foxtrick.Pages.All.getOwnTeamId(doc);
		var teamId = Foxtrick.Pages.All.getTeamId(doc);
		
		
		if (ownTeamId === null || teamId === null || ownTeamId === teamId) {
			// we don't add the buttons for your own page
			return;
		}

		var isSupporter = false ;
		var username = '';
		
		if (page === "managerPage") {
			var sidebarlinks = doc.getElementById('sidebar').getElementsByTagName("a");
			for (var i=0;i<sidebarlinks.length;++i) {
				if (sidebarlinks[i].href==='/Club/Supporters/' || sidebarlinks[i].href.search(/Club\/\?TeamID=/i)!=-1 ) {
					isSupporter = true;
					break;
				}
			}
			var h1inner = doc.getElementById('mainBody').getElementsByTagName("h1")[0].innerHTML;
			username = Foxtrick.trim(h1inner.replace(/\<.+\>|\(.+\)| /gi,''));
		}
		else if (page === "teamPage") { 
			var sidebarlinks = doc.getElementById('sidebar').getElementsByTagName("a");
			for (var i=0;i<sidebarlinks.length;++i) { 
				if (sidebarlinks[i].href.search(/Club\/HallOfFame/i)!=-1 ) {
					isSupporter = true;
					break;
				}
			}
			var sidebarlinks = doc.getElementById('mainBody').getElementsByTagName("a");
			for (var i=0;i<sidebarlinks.length;++i) {  
				if (sidebarlinks[i].href.search(/Club\/Manager\/\?userId=/i)!=-1 ) {
					username = sidebarlinks[i].innerHTML;
					break;
				}
			}			
		}
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
			guestbookLink.title = Foxtrickl10n.getString("foxtrick.tweaks.writeinguestbook");

			parentDiv.appendChild(guestbookLink);
		}
		if (official) {
			var infobox = doc.createElement("div");
			infobox.style.color = "red";
			infobox.style.padding = "5px 0 0 0";
			infobox.innerHTML = Foxtrickl10n.getString("foxtrick.tweaks.sendmessageofficial");
			parentDiv.appendChild(infobox);
		}

		// Append the box to the sidebar
		doc.getElementById(this.MANAGER_ACTION_BOX_ID).getElementsByTagName("div")[0].appendChild(parentDiv);
	} catch(e) {Foxtrick.dumpError(e);}
	}	
};
