/**
* copytrainingreport.js
* Foxtrick Copies youth training report to clipboard
* @author larsw84, convincedd
*/

var FoxtrickCopyTrainingReport = {
	MODULE_NAME : "CopyTrainingReport",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('YouthTraining'),
	OPTIONS : new Array("OpenHTYpage"),

	run : function( page, doc ) {
		if (doc.getElementById('ctl00_ctl00_CPContent_CPMain_butReadAll')!=null) return;


		if (FoxtrickPrefs.getBool( "smallcopyicons" )) {
			if (doc.getElementById('copytrainingreport')) return;
			var boxHead = doc.getElementById('mainWrapper').getElementsByTagName('div')[1];
			if (boxHead.className!='boxHead') return;

			if (Foxtrick.isStandardLayout(doc)) doc.getElementById('mainBody').setAttribute('style','padding-top:10px;');

			var messageLink = doc.createElement("a");
			messageLink.className = "inner copyicon copytrainingreport ci_first";
			messageLink.id = "copytrainingreport" ;
			messageLink.title = Foxtrickl10n.getString("foxtrick.tweaks.copytrainingreport" );
			messageLink.addEventListener("click", this.copyReport, false)

			var img = doc.createElement("img");
			img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copytrainingreport" );
			img.src = "/Img/Icons/transparent.gif";

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
			img.src = Foxtrick.ResourcePath+"resources/img/copy/copyTrainingReport.png";
			messageLink.appendChild(img);

			var parentDiv = doc.createElement("div");
			parentDiv.id = "foxtrick_addyouthclubbox_parentDiv";
			parentDiv.appendChild(messageLink);
			var newBoxId = "foxtrick_actions_box";
			Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString(
				"foxtrick.tweaks.youthclub" ), parentDiv, newBoxId, "first", "");
		}
	},

	change : function( page, doc ) {
		var id = "foxtrick_addyouthclubbox_parentDiv";
		if(!doc.getElementById(id)) {
			this.run( page, doc );
		}
	},

	copyReport : function( ev ) {
		try {
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
					var insertBefore = doc.getElementsByTagName('h1')[0];
					Foxtrick.copyStringToClipboard(plain);
					var note = Foxtrick.util.note.add(doc, insertBefore, "ft-training-report-copy-note", Foxtrickl10n.getString("foxtrick.tweaks.trainingreportcopied"), null, true);
				}
			}
			if (Foxtrick.isModuleFeatureEnabled( FoxtrickCopyTrainingReport, "OpenHTYpage")) {
				var server = FoxtrickPrefs.getBool("hty-stage")?'stage':'www';
				Foxtrick.newTab('http://'+server+'.hattrick-youthclub.org/');
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	}
};

var FoxtrickCopyScoutReport = {
	MODULE_NAME : "CopyScoutReport",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('youthplayerdetail','youthoverview'),
	OPTIONS : new Array("OpenHTYpage"),

	run : function( page, doc ) {
		var has_report = false;
		if (page=='youthoverview') {
			has_report = doc.getElementById('ctl00_ctl00_CPContent_CPMain_butScoutPropYes')!=null;
		}

		if (page=='youthplayerdetail' || has_report) {
			if (has_report) {
				var alertdiv = doc.getElementById('ctl00_ctl00_CPContent_CPMain_butScoutPropYes').parentNode;
				if (alertdiv.parentNode.getElementsByTagName('a')[0]==null) {
					var a=doc.createElement('a');
					a.innerHTML=Foxtrickl10n.getString("foxtrick.tweaks.copyscoutreport" );
					a.setAttribute('style','float:right; margin-bottom:5px;');
					a.href='javascript:void()';
					a.addEventListener("click", this.copyReport, false)
					alertdiv.parentNode.insertBefore(a,alertdiv);
				}
			}
			var id = "foxtrick_addyouthclubbox_parentDiv";
			if (doc.getElementById(id)!=null) return;

			if (FoxtrickPrefs.getBool( "smallcopyicons" )) {
				if (doc.getElementById('copyscoutreport')) return;
				var boxHead = doc.getElementById('mainWrapper').getElementsByTagName('div')[1];
				if (boxHead.className!='boxHead') return;

				if (Foxtrick.isStandardLayout(doc)) doc.getElementById('mainBody').setAttribute('style','padding-top:10px;');

				var messageLink = doc.createElement("a");
				messageLink.className = "inner copyicon copyscoutreport ci_second";
				messageLink.id='copyscoutreport';
				messageLink.title = Foxtrickl10n.getString("foxtrick.tweaks.copyscoutreport" );
				messageLink.addEventListener("click", this.copyReport, false)

				var img = doc.createElement("img");
				img.id = "foxtrick_addyouthclubbox_parentDiv";
				img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyscoutreport" );
				img.src = "/Img/Icons/transparent.gif";

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
					"foxtrick.tweaks.scoutreportcopied" );
				messageLink.setAttribute("style","cursor: pointer;");
				messageLink.addEventListener("click", this.copyReport, false)

				var img = doc.createElement("img");
				img.style.padding = "0px 5px 5px 0px;";
				img.className = "actionIcon";
				img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyscoutreport" );
				img.src = Foxtrick.ResourcePath+"resources/img/copy/copyScoutReport.png";
				messageLink.appendChild(img);

				parentDiv.appendChild(messageLink);

				var newBoxId = "foxtrick_actions_box";
				Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString(
					"foxtrick.tweaks.youthclub" ), parentDiv, newBoxId, "first", "");
			}
		}
	},

	change : function( page, doc ) {
		this.run( page, doc );
		//Foxtrick.dump('copyReport change rerun='+!doc.getElementById(id));
	},

	copyReport : function( ev ) {
	try{
		var doc = ev.target.ownerDocument;
		var mainBody = doc.getElementById('mainBody');

			var subDivs = mainBody.getElementsByTagName("div");
			var lastmainbox=-1;
			for(var i = 0; i < subDivs.length; i++) {
				if (subDivs[i].className == "mainBox") {
					lastmainbox=i;
				}
				if ( subDivs[i].className == "managerInfo" ) {
					lastmainbox=i; // not the last realy. just was lazy
					var rejectreport=true;
					break;
				}
			}

		if (lastmainbox!=-1) {
				var plain = subDivs[lastmainbox].innerHTML;
				var plainsplit = plain.split("<a");
				plain = plainsplit[0];
				plain=plain.replace(/\&nbsp;/ig,' ');
				plain=plain.replace(/^\s+/,'');  // remove leading whitespace
				plain=plain.replace(/\s+/g,' '); // replace inner multiple whitespace by single whitespace
				plain=plain.replace(/\<br\>\s+/ig,'\n'); // replace <br> with and w/o whitespace with newline
				plain=plain.replace(/\<br\>|\<\/h2\> |\<\/h3\>/ig,'\n');
				var paragraphs = plain.split(/\n/);
				paragraphs = paragraphs.splice(0, paragraphs.length - 2); // remove last two paragraphs
				plain = paragraphs.join("\n");
				Foxtrick.dump(plain+'\n');


				while (plain.search(/\<.+>/)!=-1) plain=plain.substr(0,plain.search('<'))+plain.substr(plain.search('>')+1);

				var insertBefore = doc.getElementsByTagName('h1')[0];
				Foxtrick.copyStringToClipboard(plain);
				var note = Foxtrick.util.note.add(doc, insertBefore, "ft-scout-report-copy-note", Foxtrickl10n.getString("foxtrick.tweaks.scoutreportcopied"), null, true);

				if (Foxtrick.isModuleFeatureEnabled( FoxtrickCopyTrainingReport, "OpenHTYpage")) {
					var server = FoxtrickPrefs.getBool("hty-stage")?'stage':'www';
					if (!rejectreport) Foxtrick.newTab('http://'+server+'.hattrick-youthclub.org/');
					else Foxtrick.newTab('http://'+server+'.hattrick-youthclub.org/site/player_myrejects_add/');
				}
		}
	} catch(e) {Foxtrick.dumpError(e);}
	}
};


var FoxtrickCopyPlayerSource = {

	MODULE_NAME : "CopyPlayerSource",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('youthplayerdetail'),
	OPTIONS : new Array("OpenHTYpage"),
	page_html:'',

	run : function( page, doc ) {
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
			img.src = "/Img/Icons/transparent.gif";

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
			img.src = Foxtrick.ResourcePath+"resources/img/copy/copyPlayerSource.png";
			messageLink.appendChild(img);

			parentDiv.appendChild(messageLink);

			var newBoxId = "foxtrick_actions_box2";
			Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString(
				"foxtrick.tweaks.youthclub" ), parentDiv, newBoxId, "first", "");
		}
	},

	change : function( page, doc ) {
		var id = "foxtrick_addyouthclubbox_parentDiv2";
		if(!doc.getElementById(id)) {
			this.run( page, doc );
		}
	},

	copySource : function( ev ) {
		try {
		var doc = ev.target.ownerDocument;
			var html = '<html> '+doc.documentElement.innerHTML+' </html>';

			var insertBefore = doc.getElementsByTagName('h1')[0];
			Foxtrick.copyStringToClipboard(FoxtrickCopyPlayerSource.fixbr(FoxtrickCopyPlayerSource.page_html ));
			var note = Foxtrick.util.note.add(doc, insertBefore, "ft-player-source-copy-note", Foxtrickl10n.getString("foxtrick.tweaks.playersourcecopied"), null, true);

			if (Foxtrick.isModuleFeatureEnabled( FoxtrickCopyTrainingReport, "OpenHTYpage")) {
						var server = FoxtrickPrefs.getBool("hty-stage")?'stage':'www';
						Foxtrick.newTab('http://'+server+'.hattrick-youthclub.org/site/player_cp_add');
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	fixbr : function(text) {
		return text.replace(/\<br\>/g,'<br />' );
	}
};
