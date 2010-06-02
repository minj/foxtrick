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
	CHALLENGE_LINK_ID : "ctl00_CPSidebar_ucVisitorActions_lnkChallenge",

	init : function() {
	},

	run : function(page, doc) {
		try {
			var ownTeamId = Foxtrick.Pages.All.getOwnTeamId(doc);
			var teamId = Foxtrick.Pages.All.getTeamId(doc);

			if (ownTeamId === null || teamId === null || ownTeamId === teamId
				|| !Foxtrick.isSupporter(doc)) {
				// we don't add the buttons for your own page
				// and no need to add guestbook icon for non-supporters
				return;
			}

			if (!Foxtrick.hasElement(doc, this.GUESTBOOK_LINK_ID) &&
					Foxtrick.hasElement(doc, this.CHALLENGE_LINK_ID)) {
				this.addActionsBox(doc, page);
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	change : function(page, doc) {
		// no onchange now. position isn't right and mostly gb-link will not be needed then
		//this.run(page, doc);
	},

	addActionsBox : function(doc, page) {
	try {
		var teamId = Foxtrick.Pages.All.getTeamId(doc);

		var isSupporter = false;
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

		var parentDiv = doc.getElementById(this.CHALLENGE_LINK_ID).parentNode;

		//Display GuestBook button only if teamid is HT-Supporter - Stephan57
		if (isSupporter) {
			var guestbookLink = doc.createElement("a");
			guestbookLink.className = "inner";
			guestbookLink.href = "\/Club\/Manager\/Guestbook.aspx?teamid=" + teamId;
			guestbookLink.title = Foxtrickl10n.getString("foxtrick.tweaks.writeinguestbook");
			guestbookLink.id = this.GUESTBOOK_LINK_ID;

			if (doc.getElementById(this.CHALLENGE_LINK_ID).getElementsByTagName('img').length===0) {
				guestbookLink.innerHTML = Foxtrickl10n.getString("foxtrick.tweaks.writeinguestbook");
			}
			else {
				var img = doc.createElement("img");
				img.style.padding = "0px 5px 0px 0px";
				img.className = "actionIcon";
				img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.writeinguestbook" );
				img.src = Foxtrick.ResourcePath+"resources/img/writeinguestbook.png";
				guestbookLink.appendChild(img);
			}
			parentDiv.appendChild(guestbookLink);
		}

	} catch(e) {Foxtrick.dumpError(e);}
	}	
};
