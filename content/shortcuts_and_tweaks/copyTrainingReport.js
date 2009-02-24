/**
* copytrainingreport.js
* Foxtrick Copies youth training report to clipboard
* @author larsw84
*/

var FoxtrickCopyTrainingReport = {

	MODULE_NAME : "CopyTrainingReport",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : false,

	init : function() {
		Foxtrick.registerPageHandler( 'YouthTraining',
			FoxtrickCopyTrainingReport );
	},
	
	run : function( page, doc ) {
		try {
			var parentDiv = doc.createElement("div");
			parentDiv.id = "foxtrick_addyouthclubbox_parentDiv";
		
			var messageLink = doc.createElement("a");
			messageLink.className = "inner";
			messageLink.title = Foxtrickl10n.getString( 
				"foxtrick.tweaks.copytrainingreport" );
			messageLink.setAttribute("style","cursor: pointer;");
			messageLink.addEventListener("click", this.copyReport, false)
		
			var img = doc.createElement("img");
			img.style.padding = "0px 5px 0px 0px;";
			img.className = "actionIcon";
			img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copytrainingreport" );
			img.src = "chrome://foxtrick/content/resources/img/copyplayerad.png";
			messageLink.appendChild(img);
				
			parentDiv.appendChild(messageLink);
		
			var newBoxId = "foxtrick_actions_box";
			Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString( 
				"foxtrick.tweaks.youthclub" ), parentDiv, newBoxId, "first", "");
		} catch(e) { dump('FoxtrickCopyTrainingReport: '+e+'\n'); }
	},
	
	change : function( page, doc ) {
		var id = "foxtrick_addyouthclubbox_parentDiv";
		if(!doc.getElementById(id)) {
			this.run( page, doc );
		}
	},

	copyReport : function( ev ) {
		var doc = ev.target.ownerDocument;
		var mainBody = doc.getElementById('mainBody');
		var subDivs = mainBody.getElementsByTagName("div");
		for(var i = 0; i < subDivs.length; i++) {
			if(subDivs[i].className == "playerInfo") {
				var clone = subDivs[i].cloneNode(true);
				for(var j = 0; j < 8; j++) {
					clone.removeChild(clone.firstChild);
				}
				for(var j = 0; j < 6; j++) {
					clone.removeChild(clone.lastChild);
				}
				Foxtrick.copyStringToClipboard(clone.innerHTML);
				Foxtrick.alert(Foxtrickl10n.getString("foxtrick.tweaks.reportcopied"));
			}
		}
	}
};