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
	
	_PLAYMAKING : 3,
	_PASSING : 5,
	_WINGER : 4,
	_DEFENDING : 2,
	
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
			var main = doc.getElementById("mainWrapper");					
			var links = main.getElementsByTagName("a");;
			for (var i = 0; i < links.length; i++) {
				if (links[i].href.match(/Club\/Players\/Player\.aspx/i)) {
					obj = links[i];
					break;
				}
			}
			
			ad += obj.innerHTML; //name
			var id = obj.href.replace(/.+playerID=/i, "").match(/^\d+/)[0];
			ad += "\t[playerid=" + id + "]\n";
		
			var isEnglish=false;
			//nationality, age and next birthday
			var allDivs = doc.getElementsByTagName("div");
			for(var i = 0; i < allDivs.length; i++) {
				if(allDivs[i].className == "byline") {
					var inner = allDivs[i].innerHTML;
					isEnglish = (inner.search(/ years /)!=-1); dump(inner+ ' '+isEnglish+'\n');
					var startPos = inner.search("<a ");
					if (startPos!=-1) {
						var endPos = inner.search("</a>")+4;
						var substring = inner.substr(startPos,endPos-startPos);
						inner = inner.replace(substring,"");
						inner = inner.replace(/<br>/g,"");
					}
					inner = Foxtrick.trim(inner);
					ad += inner + "\n\n";
					break;
					}
				}
			var alla = doc.getElementsByTagName("a");
			for(var i = 0; i < alla.length; i++) {
				if(alla[i].className.search("flag")!=-1) {
					var inner = alla[i].innerHTML; 
					var startPosNat = inner.search("alt=")+5; 
					var substring = inner.substr(startPosNat); 
					var endPosNat = substring.search("\" ");
					var nationality = substring.substr(0,endPosNat);
					if (!isEnglish) ad += Foxtrickl10n.getString("foxtrick.tweaks.bornin");
					else ad += "Born in";
					ad += ": " + nationality + "\n\n";
					break;
					}
				}
			
			// create player skills array, needed for skillbars
			
			var skillLinks = [];
			var skillNames = [];
			// form, stamina, personality + speciality
			var obj = doc.getElementById("ctl00_CPMain_pnlplayerInfo");
			var staminaLink = obj.getElementsByTagName("a")[1];
			skillLinks.push(staminaLink);
			if (!isEnglish) skillNames.push(Foxtrickl10n.getString("Stamina")+":");
			else skillNames.push("Stamina:");
			var innerPElement = obj.getElementsByTagName("p")[0];
			var innerP=innerPElement.innerHTML;
			innerP = innerP.replace(/<br>/g,"\n");
			for( var i=0; i < innerPElement.getElementsByTagName("a").length; i++) {
				var startPos = innerP.search("<a ");
				if (startPos!=-1) {
					var endPos = innerP.search(">")+1;
					innerP = innerP.replace(innerP.substr(startPos,endPos-startPos),"");
					var startPos = innerP.search("<img ");
					var endPos = innerP.search(">")+1;
					if (startPos!=-1) innerP = innerP.replace(innerP.substr(startPos,endPos-startPos),"");
					innerP = innerP.replace("</a>","");
				}
			}
			ad += Foxtrick.trim(innerP) + "\n\n";
			        
			// owner, TSI wage, etc.
			var table = obj.getElementsByTagName("table")[0];
			for(var i = 0; i < table.rows.length; i++) {
				ad += Foxtrick.trim(table.rows[i].cells[0].textContent);
				// remove teampopuplinks
				var cellCopy = table.rows[i].cells[1].cloneNode(true);
				var popupLinks = cellCopy.getElementsByTagName("a");
				for(var j = 1; j < popupLinks.length; j++) {
					popupLinks[j].innerHTML = "";
				}
				// bolding for speciality
				ad += "\t" + (i==5?"[b]":"") + cellCopy.textContent.replace(/\n/g,"").replace(/     /g,"") + 
				             (i==5?"[/b]":"") + "\n";				
			}
			ad += "\n";
			    
			// skills
			var skillBars = false;
			for( var i=0; i < allDivs.length; i++) {
				if(allDivs[i].className == "mainBox") {
					var skillsTable = allDivs[i].
						getElementsByTagName("table")[0];
                
					for (var i=0; i<skillsTable.rows.length; i++) {
						var row = skillsTable.rows[i];
						if(row.cells[0].className == "right") {
							// skillbars
							skillBars = true;
							skillNames.push(Foxtrick.trim(
								row.cells[0].textContent));
							skillLinks.push(row.cells[1].
								getElementsByTagName("a")[0]);
						} else {
							if(i > 0) {
								skillNames.push(Foxtrick.trim(
									row.cells[0].textContent));
								skillLinks.push(row.cells[1].
									getElementsByTagName("a")[0]);
							}
							skillNames.push(Foxtrick.trim(
								row.cells[2].textContent));
							skillLinks.push(row.cells[3].
								getElementsByTagName("a")[0]);
							
						}
					}
					break;
				}
			}
			// Add the player skills
			// Test a link, if it doesn't have a href, there are no skills present
			if(skillLinks[1]) {
				for(var i = 0; i < 4; i++) {
					var posOne;
					var posTwo;
					if(skillBars) {
						switch(i) {
							case 1:
								posOne = FoxtrickPlayerAdToClipboard._PLAYMAKING;
								posTwo = FoxtrickPlayerAdToClipboard._PASSING;
								break;
							case 2:
								posOne = FoxtrickPlayerAdToClipboard._WINGER;
								posTwo = FoxtrickPlayerAdToClipboard._DEFENDING;
								break;
							default:
								posOne = 2*i;
								posTwo = 2*i+1;
								break;
						}
					} else {
						posOne = 2*i;
						posTwo = 2*i + 1;
					}
					ad += skillNames[posOne];
					ad += "\t";
					ad += FoxtrickPlayerAdToClipboard.getAdjustedText(
						skillLinks[posOne]);
					ad += "\t";
					ad += skillNames[posTwo];
					ad += "\t";
					ad += FoxtrickPlayerAdToClipboard.getAdjustedText(
						skillLinks[posTwo]);
					ad += "\n";
				}
			}
			var bidDiv = doc.getElementById("ctl00_CPMain_updBid");
			if (bidDiv){
				ad += "\n";
				var paragraphs = bidDiv.getElementsByTagName("p");
				for (var i=0; i<paragraphs.length; i++){
					var cellCopy = paragraphs[i].cloneNode(true);
					var popupLinks = cellCopy.getElementsByTagName("a");
					for(var j = 1; j < popupLinks.length; j++) {
						popupLinks[j].innerHTML = "";
					}
					ad += Foxtrick.trim(cellCopy.textContent);
					ad += "\n";
				}
			}
			
			Foxtrick.copyStringToClipboard(ad);
			if (FoxtrickPrefs.getBool( "copyfeedback" )) 
				Foxtrick.alert(Foxtrickl10n.getString("foxtrick.tweaks.copied"));
			
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