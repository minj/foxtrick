/**
* copytrainingreport.js
* Foxtrick Copies youth training report to clipboard
* @author larsw84, convincedd
*/

var FoxtrickCopyTrainingReport = {

	MODULE_NAME : "CopyTrainingReport",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('YouthTraining'), 
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.4.6.2",
	LATEST_CHANGE:"Copies plain text to match htyouthclub requirement",
	CSS: Foxtrick.ResourcePath+"resources/css/headercopyicons.css",
	CSS_SIMPLE: Foxtrick.ResourcePath+"resources/css/headercopyicons_simple.css",
	
	init : function() {
	},
	
	run : function( page, doc ) {
		try {
		if (doc.getElementById('ctl00_CPMain_butReadAll')!=null) return;
		

		if (FoxtrickPrefs.getBool( "smallcopyicons" )) {
			if (doc.getElementById('copytrainingreport')) return;
			var boxHead = doc.getElementById('mainWrapper').getElementsByTagName('div')[1];
			if (boxHead.className!='boxHead') return;
			
			if (Foxtrick.isStandardLayout(doc)) doc.getElementById('mainBody').setAttribute('style','padding-top:10px;');
			
			var messageLink = doc.createElement("a");
			messageLink.className = "inner copyicon copyplayerad ci_first";	
			messageLink.id = "copytrainingreport" ;
			messageLink.title = Foxtrickl10n.getString("foxtrick.tweaks.copytrainingreport" );
			messageLink.addEventListener("click", this.copyReport, false)

			var img = doc.createElement("img");
			img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copytrainingreport" );
			img.src = Foxtrick.ResourcePath+"resources/img/transparent_002.gif";
			
			messageLink.appendChild(img);
			boxHead.insertBefore(messageLink,boxHead.firstChild);
		}
		else {
			var messageLink = doc.createElement("a");
			messageLink.className = "inner";
			messageLink.setAttribute("style","cursor: pointer;");
			messageLink.title = Foxtrickl10n.getString("foxtrick.tweaks.copytrainingreport" );
			messageLink.addEventListener("click", this.copyReport, false)
		
			var img = doc.createElement("img");
			img.style.padding = "0px 5px 0px 0px;";
			img.className = "actionIcon";
			img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copytrainingreport" );
			img.src = Foxtrick.ResourcePath+"resources/img/copyplayerad.png";
			messageLink.appendChild(img);
			
			var parentDiv = doc.createElement("div");
			parentDiv.id = "foxtrick_addyouthclubbox_parentDiv";						
			parentDiv.appendChild(messageLink);		
			var newBoxId = "foxtrick_actions_box";
			Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString( 
				"foxtrick.tweaks.youthclub" ), parentDiv, newBoxId, "first", "");
		}
		} catch(e) { Foxtrick.dump('FoxtrickCopyTrainingReport: '+e+'\n'); }
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
				for(var j = 0; j < 5; j++) {  // remove greeting
					clone.removeChild(clone.firstChild);
				}
				for(var j = 0; j < 6; j++) { // remove end phrase
					clone.removeChild(clone.lastChild);
				}
				var plain = clone.innerHTML;
				plain=plain.replace(/^\s+/,'');  // remove leading whitespace
				plain=plain.replace(/\s+/g,' '); // replace inner multiple whitespace by single whitespace
				plain=plain.replace(/\<br\>\s+/ig,'\n'); // replace <br> with and w/o whitespace with newline
				plain=plain.replace(/\<br\>/ig,'\n');
				
				while (plain.search(/\<.+>/)!=-1) plain=plain.substr(0,plain.search('<'))+plain.substr(plain.search('>')+1);
				Foxtrick.copyStringToClipboard(plain);
				if (FoxtrickPrefs.getBool( "copyfeedback" )) 
					Foxtrick.alert(Foxtrickl10n.getString("foxtrick.tweaks.reportcopied"));
			}
		}
	}
};


var FoxtrickCopyScoutReport = {

	MODULE_NAME : "CopyScoutReport",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('youthplayerdetail'), 
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.4.9.1",
	LATEST_CHANGE:"Copies just the report again",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	
	init : function() {
	},
	
	run : function( page, doc ) {
		try {
			
		if (FoxtrickPrefs.getBool( "smallcopyicons" )) {
			if (doc.getElementById('copyscoutreport')) return;
			var boxHead = doc.getElementById('mainWrapper').getElementsByTagName('div')[1];
			if (boxHead.className!='boxHead') return;
			
			if (Foxtrick.isStandardLayout(doc)) doc.getElementById('mainBody').setAttribute('style','padding-top:10px;');
			
			var messageLink = doc.createElement("a");
			messageLink.className = "inner copyicon copyplayerad ci_second";				
			messageLink.id='copyscoutreport';
			messageLink.title = Foxtrickl10n.getString("foxtrick.tweaks.copyscoutreport" );
			messageLink.addEventListener("click", this.copyReport, false)

			var img = doc.createElement("img");
			img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyscoutreport" );
			img.src = Foxtrick.ResourcePath+"resources/img/transparent_002.gif";
			
			messageLink.appendChild(img);
			boxHead.insertBefore(messageLink,boxHead.firstChild);
		}
		else {
			var parentDiv = doc.createElement("div");
			parentDiv.id = "foxtrick_addyouthclubbox_parentDiv";
			parentDiv.setAttribute("style","display: inline;");
			
			var messageLink = doc.createElement("a");
			messageLink.className = "inner";
			messageLink.title = Foxtrickl10n.getString( 
				"foxtrick.tweaks.copyscoutreport" );
			messageLink.setAttribute("style","cursor: pointer;");
			messageLink.addEventListener("click", this.copyReport, false)
		
			var img = doc.createElement("img");
			img.style.padding = "0px 5px 5px 0px;";
			img.className = "actionIcon";
			img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyscoutreport" );
			img.src = Foxtrick.ResourcePath+"resources/img/copyplayerad.png";
			messageLink.appendChild(img);
				
			parentDiv.appendChild(messageLink);
		
			var newBoxId = "foxtrick_actions_box";
			Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString( 
				"foxtrick.tweaks.youthclub" ), parentDiv, newBoxId, "first", "");
		}
		
		} catch(e) { Foxtrick.dump('FoxtrickCopyTrainingReport: '+e+'\n'); }
	},
	
	change : function( page, doc ) {
		var id = "foxtrick_addyouthclubbox_parentDiv";
		if(!doc.getElementById(id)) {
			this.run( page, doc );
		}
	},

	copyReport : function( ev ) {
	try{
		var doc = ev.target.ownerDocument;
		var mainBody = doc.getElementById('mainBody');
		var subDivs = mainBody.childNodes;//getElementsByTagName("div");
		var lastmainbox=-1;
		for(var i = 0; i < subDivs.length; i++) {
			if (subDivs[i].className == "mainBox") { 
				lastmainbox=i;
			}
		}
		
		if (lastmainbox!=-1) {
				var graphs = subDivs[lastmainbox].innerHTML.split('<br><br>');
				var plain = graphs[0]+'<br>'+graphs[1];		
				if ( graphs[4] ) plain+=graphs[2];	// has a specialty
				plain=plain.replace(/\&nbsp;/ig,' ');
				plain=plain.replace(/^\s+/,'');  // remove leading whitespace
				plain=plain.replace(/\s+/g,' '); // replace inner multiple whitespace by single whitespace
				plain=plain.replace(/\<br\>\s+/ig,'\n'); // replace <br> with and w/o whitespace with newline
				plain=plain.replace(/\<br\>|\<\/h2\> /ig,'\n');
				
				while (plain.search(/\<.+>/)!=-1) plain=plain.substr(0,plain.search('<'))+plain.substr(plain.search('>')+1);
				Foxtrick.copyStringToClipboard(plain);
				if (FoxtrickPrefs.getBool( "copyfeedback" )) 
					Foxtrick.alert(Foxtrickl10n.getString("foxtrick.tweaks.copyscoutreport"));			
		}
	} catch(e) {Foxtrick.dump('copyreport '+e+'\n');}
	}
};


var FoxtrickCopyPlayerSource = {

	MODULE_NAME : "CopyPlayerSource",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('youthplayerdetail'), 
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8.9",
	LATEST_CHANGE:"Adds button on youthplayerdetail page to copy the html source code to match htyouthclub requirement",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	CSS: Foxtrick.ResourcePath+"resources/css/headercopyicons.css",
	CSS_SIMPLE: Foxtrick.ResourcePath+"resources/css/headercopyicons_simple.css",
	page_html:'',
	
	init : function() {
	},
	
	run : function( page, doc ) {
		try {
			this.page_html = '<html> '+doc.documentElement.innerHTML+' </html>';
			
		if (FoxtrickPrefs.getBool( "smallcopyicons" )) {
			if (doc.getElementById('copyplayerscource')) return;
			var boxHead = doc.getElementById('mainWrapper').getElementsByTagName('div')[1];
			if (boxHead.className!='boxHead') return;

			if (Foxtrick.isStandardLayout(doc)) doc.getElementById('mainBody').setAttribute('style','padding-top:10px;');
			
			var messageLink = doc.createElement("a");
			if (Foxtrick.isModuleEnabled(FoxtrickCopyScoutReport)) messageLink.className = "inner copyicon copyplayerscource ci_third";
			else messageLink.className = "inner copyicon copyplayerscource ci_second";			
			messageLink.id='copyplayerscource';
			messageLink.title = Foxtrickl10n.getString("foxtrick.tweaks.copyplayerscource" );
			messageLink.addEventListener("click", this.copySource, false)

			var img = doc.createElement("img");
			img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyplayerscource" );
			img.src = Foxtrick.ResourcePath+"resources/img/transparent_002.gif";
			
			messageLink.appendChild(img);
			boxHead.insertBefore(messageLink,boxHead.firstChild);
		}
		else {
			var parentDiv = doc.createElement("div");
			parentDiv.id = "foxtrick_addyouthclubbox_parentDiv2";
			parentDiv.setAttribute("style","display: inline; margin-right:8px;");
		
			var messageLink = doc.createElement("a");
			messageLink.className = "inner";
			messageLink.title = Foxtrickl10n.getString( 
				"foxtrick.tweaks.copyplayerscource" );
			messageLink.setAttribute("style","cursor: pointer;");
			messageLink.addEventListener("click", this.copySource, false)
		
			var img = doc.createElement("img");
			img.style.padding = "0px 5px 0px 0px;";
			img.className = "actionIcon";
			img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyplayerscource" );
			img.src = Foxtrick.ResourcePath+"resources/img/youthplayersource.png";
			messageLink.appendChild(img);
				
			parentDiv.appendChild(messageLink);
		
			var newBoxId = "foxtrick_actions_box2";
			Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString( 
				"foxtrick.tweaks.youthclub" ), parentDiv, newBoxId, "first", "");
		}
		
		} catch(e) { Foxtrick.dump('FoxtrickCopyPlayerSource: '+e+'\n'); }
	},
	
	change : function( page, doc ) {
		var id = "foxtrick_addyouthclubbox_parentDiv2";
		if(!doc.getElementById(id)) {
			this.run( page, doc );
		}
	},

	copySource : function( ev ) {
		var doc = ev.target.ownerDocument;
		var html = '<html> '+doc.documentElement.innerHTML+' </html>';
		Foxtrick.copyStringToClipboard(FoxtrickCopyPlayerSource.fixbr(FoxtrickCopyPlayerSource.page_html ));
				if (FoxtrickPrefs.getBool( "copyfeedback" )) 
					Foxtrick.alert(Foxtrickl10n.getString("foxtrick.tweaks.playersourcecopied"));			
	},
	
	fixbr : function(text) {
        return text.replace(/\<br\>/g,'<br />' );
    },

};