/**
 * addmanagerbuttons.js
 * Adds Send Message and Write in Guestbook buttons to manager page
 * @author larsw84
 */

 ////////////////////////////////////////////////////////////////////////////////
var FoxtrickAddManagerButtons = {

    MODULE_NAME : "AddManagerButtons",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('managerPage','teamPage','youthoverview'), 
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.9",
	LATEST_CHANGE:"Added infotext to staff pages",
	

    init : function() {
    },
    
    run : function( page, doc ) { 
		switch( page ) {
			case 'managerPage':
				if(!doc.getElementById('sidebar')) {
					// Guestbook page
					break;
				}
				this.addActionsBox( doc );
				break;
			case 'youthoverview':
				this.addActionsBox( doc );
				break;
				
			case 'teamPage':
				this.showMessageForm( doc );
				break;
		}
	},
	
	change : function( page, doc ) {
        try {
            switch( page ) {
                case 'managerPage': 
                    var newBoxId = "foxtrick_actions_box";
                    if( !Foxtrick.hasElement( doc, newBoxId ) ) {
                        this.addActionsBox( doc );
                    }
                    break;
                case 'youthoverview':
                    var newBoxId = "foxtrick_actions_box";
                    if( !Foxtrick.hasElement( doc, newBoxId ) ) {
                        this.addActionsBox( doc );
                    }
                    break;
                case 'teamPage': 
                    var divMessage = doc.getElementById(
                        'ctl00_CPSidebar_ucVisitorActions_pnlMessage');
                    if( !divMessage ) {
                        this.showMessageForm( doc );
                    }
                    break;
            }
        } 
        catch (e) {
            dump('AddManagerButtons:  Redirection on Manager Page?\n');
            dump('  ' + e + '\n');
        } 
	},
	
	addActionsBox : function( doc ) {
		var allDivs = doc.getElementsByTagName("div");
		var teamID;
		var ownerID;
		var HTSupporter = true;
				
		// Get the teamID
		for(var i = 0; i < allDivs.length; i++) { 
			//Retrieve owner manager ID - Stephan57
			if(allDivs[i].id=="teamLinks") {
				var teamLinks_a = allDivs[i].getElementsByTagName("a")[0];
				ownerID = teamLinks_a.href.substr(
					teamLinks_a.href.search( /TeamID=/i )+7 );
			}
			//Determine if teamID is HT-Supporter - Stephan57 
			// only works if script is executed before AddDefaultFaceCard
			// does not work on youthoverview page
			if(allDivs[i].id=="ctl00_CPMain_ucManagerFace_pnlAvatar") {
				HTSupporter=true;
			}
			
			if(allDivs[i].className=="subMenuBox") {
				teamID = FoxtrickHelper.findTeamId(allDivs[i]);
				break;
			}
			
		}
		var h1inner = doc.getElementById('mainBody').getElementsByTagName("h1")[0].innerHTML;
		var username = Foxtrick.trim(h1inner.replace(/\<.+\>|\(.+\)| /gi,''));				
		var official = (username.toLowerCase().indexOf('mod-') == 0 || username.toLowerCase().indexOf('gm-') == 0 || username.toLowerCase().indexOf('la-') == 0 || username.toLowerCase().indexOf('ht-') == 0 || username.toLowerCase().indexOf('chpp-') == 0)
        // dump('\nOFFI: ' + official+'\n');
		//Do not add send message button for owner manager page. - Stephan57
		if ( ownerID==teamID ) return;
		
		var parentDiv = doc.createElement("div");
		parentDiv.id = "foxtrick_addactionsbox_parentDiv";
		
		var messageLink = doc.createElement("a");
		messageLink.className = "inner";
		
		messageLink.href = "/MyHattrick/Inbox/Default.aspx?actionType=newMail&mailto="+username;
		if  (doc.location.href.search(/\/Club\/Youth/)!=-1) messageLink.href='/Club/?TeamID='+teamID+'&SendMessage=true';
		//messageLink.href = "../?TeamID=" + teamID + "&SendMessage=true";
		messageLink.title = Foxtrickl10n.getString( 
			"foxtrick.tweaks.sendmessage" );
				
		var img = doc.createElement("img");
		img.style.padding = "0px 5px 0px 0px";
		img.className = "actionIcon";
		img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.sendmessage" );
		img.src = "/App_Themes/Standard/images/ActionIcons/mail.png";
		messageLink.appendChild(img);
		
		parentDiv.appendChild(messageLink);

		//Display GuestBook button only if teamid is HT-Supporter - Stephan57
		if (HTSupporter) {	
			var guestbookLink = doc.createElement("a");
			guestbookLink.className = "inner";
			guestbookLink.href = "\/Club\/Manager\/Guestbook.aspx?teamid=" + teamID;
			guestbookLink.title = Foxtrickl10n.getString(
				"foxtrick.tweaks.writeinguestbook");
			
			var img = doc.createElement("img");
			img.style.padding = "0px 5px 0px 0px";
			img.className = "actionIcon";
			img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.writeinguestbook" );
			img.src = "chrome://foxtrick/content/resources/img/writeinguestbook.png";
			guestbookLink.appendChild(img);
			
			parentDiv.appendChild(guestbookLink);
		}
        if (official) {
            var infobox  = doc.createElement("div");
            infobox.style.color = "red";
            infobox.style.padding = "2px";
            infobox.innerHTML = "Please note that all staff issues and questions must be sent via the contact form in the <a class='inner' href='/Help/Contact.aspx'>staff pages</a>. The internal mail system is <b>not</b> to be used for staff related issues.";
            parentDiv.appendChild(infobox);
        }

		// Append the box to the sidebar
		var newBoxId = "foxtrick_actions_box";
		Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString( 
			"foxtrick.tweaks.actions" ), parentDiv, newBoxId, "first", "");
	},
	
	showMessageForm : function( doc ) {
		var sUrl = Foxtrick.getHref( doc );
		var sendPos = sUrl.search(/&SendMessage=true/i);
		if (sendPos > -1){
			var a = doc.getElementById('ctl00_CPSidebar_ucVisitorActions_lnkMail');
			if (a){
				var func = a.href;
				if (func){
					doc.location.href = func;
				}
			}
		}
	}
};

/*
 * The following code was an attempt to create a Send Message form on the Manager page.
 * The code in the end was a failure: after clicking 'Send' in the form, Hattrick would
 * display an Application Error.
 * I'm going to shelve this attempt until further notice, but if I ever try again, this code
 * will be a good start. So please don't delete! But don't use it either :)
 * /larsw84 19-12-2008
				
				Foxtrick.addJavaScript(doc, "chrome://foxtrick/content/resources/js/"
					+"common.js");
				//var aspnetForm = doc.getElementById("aspnetForm");
				var allDivs = doc.getElementsByTagName("div");
				var teamID;
				
				// Get the teamID
				for(var i = 0; i < allDivs.length; i++) {
					if(allDivs[i].className=="main mainRegular") {
						var divBoxHead = allDivs[i].
							getElementsByTagName("div")[0];
						var divBoxLeft = divBoxHead.
									getElementsByTagName("div")[0];
						var header = divBoxLeft.getElementsByTagName("h2")[0];
						var a = header.getElementsByTagName("a")[0];
						teamID = a.href.substr(a.href.search(/TeamID=/i)+7);
					}
				}
				
				// Make sure the right action is executed
				//aspnetForm.setAttribute("action","../Default.aspx?TeamID="
				//	+ teamID);
				
				// Create the message form
				var ownDiv = doc.createElement("div");
				ownDiv.setAttribute("id","ctl00_CPSidebar_ucVisitorActions"
					+"_UpdatePanel1");
				var ownSidebarBox = doc.createElement("div");
				ownSidebarBox.className = "sidebarBox";
				ownDiv.appendChild(ownSidebarBox);
				var ownBoxHead = doc.createElement("div");
				ownBoxHead.className = "boxHead";
				ownSidebarBox.appendChild(ownBoxHead);
				var ownBoxLeftHeader = doc.createElement("div");
				ownBoxLeftHeader.className = "boxLeft";
				ownBoxHead.appendChild(ownBoxLeftHeader);
				var ownHeader = doc.createElement("h2");
				ownHeader.innerHTML = "Send message";
				ownBoxLeftHeader.appendChild(ownHeader);
				var ownBoxBody = doc.createElement("div");
				ownBoxBody.className = "boxBody";
				ownSidebarBox.appendChild(ownBoxBody);
				var messageDiv = doc.createElement("div");
				messageDiv.setAttribute("id","ctl00_CPSidebar_"
					+ "ucVisitorActions_pnlMessage");
				messageDiv.innerHTML = "<b> Subject</b><br/><input id=\"ctl00_"
					+ "CPSidebar_ucVisitorActions_txtSubject\" type=\"text\""
					+ "tabindex=\"1\" maxlength=\"50\" name=\"ctl00$CPSidebar"
					+ "$ucVisitorActions$txtSubject\"/><textarea id=\"ctl00_"
					+ "CPSidebar_ucVisitorActions_txtMessage\" onkeyup=\""
					+ "textCounter(ctl00_CPSidebar_ucVisitorActions_txtMessage"
					+ ", ctl00_CPSidebar_ucVisitorActions_txtCharsLeft, 1000)"
					+ "\"onkeydown=\"textCounter(ctl00_CPSidebar_ucVisitor"
					+ "Actions_txtMessage, ctl00_CPSidebar_ucVisitorActions_"
					+ "txtCharsLeft, 1000)\" tabindex=\"2\" cols=\"20\" rows="
					+ "\"5\" name=\"ctl00$CPSidebar$ucVisitorActions$"
					+ "txtMessage\"></textarea><br/><input id=\"ctl00_CPSideba"
					+ "r_ucVisitorActions_txtCharsLeft\" type=\"text\" style="
					+ "\"width: 40px;\" readonly=\"readonly\" value=\"1000\""
					+ "name=\"ctl00$CPSidebar$ucVisitorActions$txtCharsLeft\""
					+ "/><br/><input id=\"ctl00_CPSidebar_ucVisitorActions_"
					+ "btnSend\" type=\"submit\" tabindex=\"3\" value=\"send\""
					+ "name=\"ctl00$CPSidebar$ucVisitorActions$btnSend\"\/>"
					+ "</div>";
				ownBoxBody.appendChild(messageDiv);
				var ownBoxFooter = doc.createElement("div");
				ownBoxFooter.className = "boxFooter";
				ownSidebarBox.appendChild(ownBoxFooter);
				var ownBoxLeftFooter = doc.createElement("div");
				ownBoxLeftFooter.className = "boxLeft";
				ownBoxLeftFooter.innerHTML = "&nbsp;";			
						
				ownBoxFooter.appendChild(ownBoxLeftFooter);
				// Append the message form to the sidebar
				var sidebar = doc.getElementById("sidebar");
				var firstChild = sidebar.firstChild;
				sidebar.insertBefore(ownDiv,firstChild);
				*/