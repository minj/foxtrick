/**
 * addmanagerbuttons.js
 * Adds Send Message and Write in Guestbook buttons to manager page
 * @author larsw84, Stephan57, ryanli
 */

 ////////////////////////////////////////////////////////////////////////////////
var FoxtrickManagerButtons = {

	MODULE_NAME : "ManagerButtons",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array("managerPage", "teamPage"),
	DEFAULT_ENABLED : true,
	OPTIONS : ["addGuestbooklink", "largeMailbox"],
	NEW_AFTER_VERSION : "0.5.1.3",
	LATEST_CHANGE : "Updated to latest HT version.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,

	GUESTBOOK_LINK_ID : "guestbook_link_id",
	CHALLENGE_LINK_ID : "ctl00_CPSidebar_ucVisitorActions_lnkChallenge",
	MAIL_LINK_ID: "ctl00_CPSidebar_ucVisitorActions_lnkMail",

	init : function() {
	},

	run : function(page, doc) {
		try {
			var ownTeamId = Foxtrick.Pages.All.getOwnTeamId(doc);
			var teamId = Foxtrick.Pages.All.getTeamId(doc);

			if (ownTeamId === null || teamId === null || ownTeamId === teamId) {
				// we don't add the buttons for your own page
				return;
			}

			if (Foxtrick.isModuleFeatureEnabled(this, "largeMailbox")) {
				this.changeMaillink(page, doc);
			}
			
			if (Foxtrick.isModuleFeatureEnabled(this, "addGuestbooklink") &&
				!Foxtrick.hasElement(doc, this.GUESTBOOK_LINK_ID) &&
				Foxtrick.hasElement(doc, this.CHALLENGE_LINK_ID)) {
				this.addGuestbooklink(doc, page);
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

	changeMaillink : function(page, doc) {
		// get user name
		var username='';
		if (page==='managerPage') {
			var h1inner = doc.getElementById('mainBody').getElementsByTagName("h1")[0].innerHTML;
			username = h1inner.replace(/\<.+\>|\(.+\)| /gi,'');                         
        }
		else if (page==='teamPage') {
			var mainBodylinks = doc.getElementById('mainBody').getElementsByTagName("a");
			for (var i=0;i<mainBodylinks.length;++i) {
				Foxtrick.dump(mainBodylinks[i].href+' '+mainBodylinks[i].href.search(/\/Club\/Manager\/?userId=/)+'\n');
				if (mainBodylinks[i].href.search(/\/Club\/Manager\/\?userId=/i)!=-1) {
					username = mainBodylinks[i].title;
					break;
				}	
			}
		}
		
		// change link to mailbox
		var messageLink = doc.getElementById(this.MAIL_LINK_ID);		
		messageLink.href = "/MyHattrick/Inbox/Default.aspx?actionType=newMail&mailto="+username;
		//if  (doc.location.href.search(/\/Club\/Youth/)!=-1) messageLink.href='/Club/?TeamID='+teamID+'&SendMessage=true';
		//messageLink.href = "../?TeamID=" + teamID + "&SendMessage=true";
},

	addGuestbooklink : function(doc, page) {
	try {
		var teamId = Foxtrick.Pages.All.getTeamId(doc);

		var isSupporter = false;
		var username = '';

		if (page === "managerPage") {
			var sidebar = doc.getElementById("sidebar");
			var sidebarlinks = sidebar.getElementsByTagName("a");
			for (var i=0;i<sidebarlinks.length;++i) {
				if (sidebarlinks[i].href==='/Club/Supporters/'
					|| sidebarlinks[i].href.search(/Club\/\?TeamID=/i) !== -1
					|| sidebarlinks[i].href.search(/Community\/Federations\/Federation.aspx\?AllianceID=/i) !== 1) {
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
