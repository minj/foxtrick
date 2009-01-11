/**
 * playeradtoclipboard.js
 * Copies a player ad to the clipboard
 * @author larsw84
 */

 ////////////////////////////////////////////////////////////////////////////////
var FoxtrickPlayerAdToClipboard = {

    MODULE_NAME : "CopyPlayerAdToClipboard",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : true,

    init : function() {
        Foxtrick.registerPageHandler( 'playerdetail',
                                        FoxtrickPlayerAdToClipboard );
    },
    
    run : function( page, doc ) {
		var parentDiv = doc.createElement("div");
		parentDiv.id = "foxtrick_addactionsbox_parentDiv";
		
		var messageLink = doc.createElement("a");
		messageLink.className = "inner";
		messageLink.title = Foxtrickl10n.getString( 
			"foxtrick.tweaks.copyplayerad" );
		messageLink.setAttribute("style","cursor: pointer;");
		messageLink.addEventListener("click", this.createPlayerAd, false)
		
		var img = doc.createElement("img");
		img.style.padding = "0px 5px 0px 0px;";
		img.className = "actionIcon";
		img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyplayerad" );
		img.src = "chrome://foxtrick/content/resources/img/copyplayerad.png";
		messageLink.appendChild(img);
				
		parentDiv.appendChild(messageLink);
		
		var newBoxId = "foxtrick_actions_box";
		Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString( 
			"foxtrick.tweaks.actions" ), parentDiv, newBoxId, "first", "");
	},
	
	change : function( page, doc ) {
		var id = "foxtrick_addactionsbox_parentDiv";
		if(!doc.getElementById(id)) {
			this.run( page, doc );
		}
	},
	
	createPlayerAd : function( ev ) {
		var doc = ev.target.ownerDocument;
		try {

			var ad="";
			var obj;
    
			var links = doc.links;
			for (var i = 0; i < links.length; i++) {
				if (links[i].href.match(/Club\/Players\/Player\.aspx/i)) {
					obj = links[i];
					break;
				}
			}
			
			ad += obj.innerHTML; //name
			var id = obj.href.replace(/.+playerID=/i, "").match(/^\d+/)[0];
			ad += "\t[playerid=" + id + "]\n";
		
			//nationality, age and next birthday
			var allDivs = doc.getElementsByTagName("div");
			for(var i = 0; i < allDivs.length; i++) {
				if(allDivs[i].className == "byline") {
					var inner = allDivs[i].innerHTML;
					var startPos = inner.search("<a ");
					var endPos = inner.search("</a>")+4;
					var substring = inner.substr(startPos,endPos-startPos);
					inner = inner.replace(substring,"");
					inner = inner.replace(/<br>/g,"");
					inner = Foxtrick.trim(inner);
					ad += inner + "\n\n";
					var startPosNat = substring.search("alt=")+5;
					substring = substring.substr(startPosNat);
					var endPosNat = substring.search("\" ");
					var nationality = substring.substr(0,endPosNat);
					ad += Foxtrickl10n.getString("foxtrick.tweaks.bornin");
					ad += ": " + nationality + "\n\n";
					break;
				}
			}
			
			// form, stamina, personality + speciality
			var obj = doc.getElementById("ctl00_CPMain_pnlplayerInfo");
			var innerP = obj.getElementsByTagName("p")[0].innerHTML;
			innerP = innerP.replace(/<br>/g,"\n");
			for( var i=0; i < 7; i++) {
				var startPos = innerP.search("<a ");
				var endPos = innerP.search(">")+1;
				innerP = innerP.replace(innerP.substr(startPos,endPos-startPos),"");
				innerP = innerP.replace("</a>","");
			}
			ad += Foxtrick.trim(innerP) + "\n\n";
			        
			// owner, TSI wage, etc.
			var table = obj.getElementsByTagName("table")[0];
			for(var i = 0; i < 5; i++) {
				ad += Foxtrick.trim(table.rows[i].cells[0].textContent);
				ad += "\t" + Foxtrick.trim(table.rows[i].cells[1].textContent).
					replace(/\n/g,"").replace(/     /g,"") + "\n";
			}
			ad += "\n";
			    
			// skills
			for( var i=0; i < allDivs.length; i++) {
				if(allDivs[i].className == "mainBox") {
					var skillsTable = allDivs[i].getElementsByTagName("table")[0];
                
					for (var i=0; i<skillsTable.rows.length; i++) {
						var row = skillsTable.rows[i];
						ad += Foxtrick.trim(row.cells[0].textContent);
						ad += "\t";
						ad += FoxtrickPlayerAdToClipboard.getAdjustedText(
							row.cells[1].firstChild.nextSibling);
						ad += "\t";
						ad += Foxtrick.trim(row.cells[2].textContent);
						ad += "\t";
						ad += FoxtrickPlayerAdToClipboard.getAdjustedText(
							row.cells[3].firstChild.nextSibling);
						ad += "\n";
					}
					break;
				}
			}
			Foxtrick.alert(Foxtrickl10n.getString("foxtrick.tweaks.copied"));
			Foxtrick.copyStringToClipboard(ad);

		} catch (e) {
			Foxtrick.alert(e);
		}
	},
	
	getAdjustedText : function( link ) {
		var skillLevel = this.getSkillLevelFromLink(link);
		if (skillLevel == 5) {
			return "[i]" + link.textContent  + "[/i]";
		}
		if (skillLevel > 5) {
			return "[b]" + link.textContent  + "[/b]";
		}
		return link.textContent;
	},
	
	getSkillLevelFromLink : function( link ) {
		var value = link.href.replace(/.+(ll|labellevel)=/i, "").match(/^\d+/);   
		return value;
	}
};