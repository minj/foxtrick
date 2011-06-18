/**
* copy-youth.js
* Copy functions for youth sources
* @author larsw84, convincedd, Parminu, ryanli
*/

var FoxtrickCopyYouth = {
	MODULE_NAME : "CopyYouth",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ["YouthTraining", "youthplayerdetail", "youthoverview",
		"youthFixtures"],
	OPTIONS : ["TrainingReport", "ScoutComment", "PlayerSource",
		"FixturesSource"],

	addTrainingReport : function(page, doc) {
		// return if training report unread
		if (doc.getElementById("ctl00_ctl00_CPContent_CPMain_butReadAll"))
			return;
		// copy function
		var copyReport = function() {
			try {
				var mainBody = doc.getElementById('mainBody');
				var subDivs = mainBody.getElementsByTagName("div");
				// FIXME - what the hell are they using this class‽
				var playerInfo = mainBody.getElementsByClassName("playerInfo")[0];
				var clone = playerInfo.cloneNode(true);
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

				while (plain.search(/\<.+>/)!=-1)
					plain=plain.substr(0,plain.search('<'))+plain.substr(plain.search('>')+1);
				Foxtrick.copyStringToClipboard(plain);

				// display note
				var insertBefore = doc.getElementsByTagName('h1')[0];
				var server = FoxtrickPrefs.getBool("hty-stage")?'stage':'www';
				var url = "http://" + server + ".hattrick-youthclub.org/";
				var container = doc.createElement("div");
				container.appendChild(doc.createTextNode(Foxtrickl10n.getString("CopyYouth.trainingReport.copied")));
				var linkContainer = doc.createElement("div");
				linkContainer.innerHTML = Foxtrickl10n.getString("CopyYouth.goto").replace(/%s/,
					'<a href="' + url + '" target="_blank">http://www.hattrick-youthclub.org</a>');
				container.appendChild(linkContainer);
				Foxtrick.util.note.add(doc, insertBefore, "ft-training-report-copy-note", container, null, true);
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};
		// add icon
		if (FoxtrickPrefs.getBool("smallcopyicons")) {
			var boxHead = doc.getElementById('mainWrapper').getElementsByTagName('div')[1];
			if (boxHead.className!='boxHead')
				return;

			if (Foxtrick.isStandardLayout(doc))
				doc.getElementById('mainBody').style.paddingTop = "10px";

			var messageLink = doc.createElement("a");
			messageLink.className = "inner copyicon copytrainingreport ci_first";
			messageLink.id = "copytrainingreport" ;
			messageLink.title = Foxtrickl10n.getString("CopyYouth.trainingReport");
			messageLink.addEventListener("click", copyReport, false);

			var img = doc.createElement("img");
			img.alt = Foxtrickl10n.getString("foxtrick.tweaks.copytrainingreport");
			img.src = "/Img/Icons/transparent.gif";

			messageLink.appendChild(img);
			boxHead.insertBefore(messageLink,boxHead.firstChild);
		}
		else {
			var messageLink = doc.createElement("a");
			messageLink.className = "inner";
			messageLink.style.cursor = "pointer";
			messageLink.title = Foxtrickl10n.getString("CopyYouth.trainingReport");
			messageLink.addEventListener("click", copyReport, false);

			var img = doc.createElement("img");
			img.style.padding = "0px 5px 0px 0px;";
			img.className = "actionIcon";
			img.alt = Foxtrickl10n.getString("CopyYouth.trainingReport");
			img.src = Foxtrick.ResourcePath+"resources/img/copy/copyTrainingReport.png";
			messageLink.appendChild(img);

			var parentDiv = doc.createElement("div");
			parentDiv.id = "foxtrick_addyouthclubbox_parentDiv";
			parentDiv.appendChild(messageLink);
			var newBoxId = "foxtrick_actions_box";
			Foxtrick.addBoxToSidebar(doc,
				Foxtrickl10n.getString("CopyYouth.title"),
				parentDiv, newBoxId, "first", "");
		}
	},

	addScoutComment : function(page, doc) {
		var copyReport = function() {
			try {
				var mainBody = doc.getElementById('mainBody');

				var subDivs = mainBody.getElementsByTagName("div");
				var lastmainbox=-1;
				for (var i = 0; i < subDivs.length; i++) {
					if (subDivs[i].className == "mainBox") {
						lastmainbox=i;
					}
					if (subDivs[i].className == "managerInfo") {
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
					plain=Foxtrick.stripHTML(plain);

					// remove last three paragraphs (two newlines and a sentence
					// like "What do you say? Should we give him a chance?"
					var paragraphs = plain.split(/\n/);
					paragraphs = paragraphs.splice(0, paragraphs.length - 3);
					plain = paragraphs.join("\n");

					Foxtrick.copyStringToClipboard(plain);

					// display note
					var insertBefore = doc.getElementsByTagName('h1')[0];
					var server = FoxtrickPrefs.getBool("hty-stage")?'stage':'www';
					if (rejectreport)
						var url = "http://" + server + ".hattrick-youthclub.org/site/player_myrejects_add";
					else
						var url = "http://" + server + ".hattrick-youthclub.org/";
					var container = doc.createElement("div");
					container.appendChild(doc.createTextNode(Foxtrickl10n.getString("CopyYouth.scoutComment.copied")));
					var linkContainer = doc.createElement("div");
					linkContainer.innerHTML = Foxtrickl10n.getString("CopyYouth.goto").replace(/%s/,
						'<a href="' + url + '" target="_blank">http://www.hattrick-youthclub.org</a>');
					container.appendChild(linkContainer);
					Foxtrick.util.note.add(doc, insertBefore, "ft-scout-report-copy-note", container, null, true);
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		var has_report = false;
		if (page=='youthoverview') {
			has_report = doc.getElementById('ctl00_ctl00_CPContent_CPMain_butScoutPropYes')!=null;
		}

		if (page=='youthplayerdetail' || has_report) {
			if (has_report) {
				var alertdiv = doc.getElementById('ctl00_ctl00_CPContent_CPMain_butScoutPropYes').parentNode;
				if (alertdiv.parentNode.getElementsByTagName('a')[0]==null) {
					var a=doc.createElement('a');
					a.textContent = Foxtrickl10n.getString("CopyYouth.scoutComment");
					a.style.cssFloat = "right";
					a.style.marginBottom = "5px";
					a.href='javascript:void()';
					a.addEventListener("click", copyReport, false)
					alertdiv.parentNode.insertBefore(a,alertdiv);
				}
			}
			var id = "foxtrick_addyouthclubbox_parentDiv";
			if (doc.getElementById(id)!=null)
				return;

			if (FoxtrickPrefs.getBool("smallcopyicons")) {
				if (doc.getElementById('copyscoutreport'))
					return;
				var boxHead = doc.getElementById('mainWrapper').getElementsByTagName('div')[1];
				if (boxHead.className!='boxHead')
					return;

				if (Foxtrick.isStandardLayout(doc))
					doc.getElementById('mainBody').style.paddingTop = "10px";

				var messageLink = doc.createElement("a");
				messageLink.className = "inner copyicon copyscoutreport ci_second";
				messageLink.id='copyscoutreport';
				messageLink.title = Foxtrickl10n.getString("CopyYouth.scoutComment");
				messageLink.addEventListener("click", copyReport, false)

				var img = doc.createElement("img");
				img.id = "foxtrick_addyouthclubbox_parentDiv";
				img.alt = Foxtrickl10n.getString("CopyYouth.scoutComment");
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
				messageLink.title = Foxtrickl10n.getString("CopyYouth.scoutComment");
				messageLink.setAttribute("style","cursor: pointer;");
				messageLink.addEventListener("click", copyReport, false)

				var img = doc.createElement("img");
				img.style.padding = "0px 5px 5px 0px;";
				img.className = "actionIcon";
				img.alt = Foxtrickl10n.getString("CopyYouth.scoutComment");
				img.src = Foxtrick.ResourcePath+"resources/img/copy/copyScoutReport.png";
				messageLink.appendChild(img);

				parentDiv.appendChild(messageLink);

				var newBoxId = "foxtrick_actions_box";
				Foxtrick.addBoxToSidebar(doc, Foxtrickl10n.getString("CopyYouth.title"),
					parentDiv, newBoxId, "first", "");
			}
		}
	},

	addPlayerSource : function(page, doc) {
		var copySource = function() {
			var fixBr = function(text) {
				return text.replace(/\<br\>/g,'<br />' );
			};
			try {
				var html = '<html> '+doc.documentElement.innerHTML+' </html>';
				html = fixBr(html);
				Foxtrick.copyStringToClipboard(html);

				// display note
				var insertBefore = doc.getElementsByTagName('h1')[0];
				var server = FoxtrickPrefs.getBool("hty-stage")?'stage':'www';
				var url = "http://" + server + ".hattrick-youthclub.org/site/player_cp_add";
				var container = doc.createElement("div");
				container.appendChild(doc.createTextNode(Foxtrickl10n.getString("CopyYouth.playerSource.copied")));
				var linkContainer = doc.createElement("div");
				linkContainer.innerHTML = Foxtrickl10n.getString("CopyYouth.goto").replace(/%s/,
					'<a href="' + url + '" target="_blank">http://www.hattrick-youthclub.org</a>');
				container.appendChild(linkContainer);
				Foxtrick.util.note.add(doc, insertBefore, "ft-player-source-copy-note", container, null, true);
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		if (FoxtrickPrefs.getBool("smallcopyicons")) {
			var boxHead = doc.getElementById('mainWrapper').getElementsByTagName('div')[1];
			if (boxHead.className!='boxHead')
				return;

			if (Foxtrick.isStandardLayout(doc))
				doc.getElementById('mainBody').style.paddingTop = "10px";

			var messageLink = doc.createElement("a");
			messageLink.className = "inner copyicon copyplayerscource ci_third";
			messageLink.title = Foxtrickl10n.getString("CopyYouth.playerSource");
			messageLink.addEventListener("click", copySource, false);

			var img = doc.createElement("img");
			img.alt = Foxtrickl10n.getString("CopyYouth.playerSource");
			img.src = "/Img/Icons/transparent.gif";

			messageLink.appendChild(img);
			boxHead.insertBefore(messageLink,boxHead.firstChild);
		}
		else {
			var parentDiv = doc.createElement("div");
			parentDiv.id = "foxtrick_addyouthclubbox_parentDiv2";
			parentDiv.style.display = "inline";
			parentDiv.style.marginRight = "8px";

			var messageLink = doc.createElement("a");
			messageLink.className = "inner";
			messageLink.title = Foxtrickl10n.getString("CopyYouth.playerSource");
			messageLink.setAttribute("style","cursor: pointer;");
			messageLink.addEventListener("click", copySource, false)

			var img = doc.createElement("img");
			img.style.padding = "0px 5px 0px 0px;";
			img.className = "actionIcon";
			img.alt = Foxtrickl10n.getString("CopyYouth.playerSource");
			img.src = Foxtrick.ResourcePath+"resources/img/copy/copyPlayerSource.png";
			messageLink.appendChild(img);

			parentDiv.appendChild(messageLink);

			var newBoxId = "foxtrick_actions_box2";
			Foxtrick.addBoxToSidebar(doc,
				Foxtrickl10n.getString("foxtrick.tweaks.youthclub"),
				parentDiv, newBoxId, "first", "");
		}
	},

	addFixturesSource : function(page, doc) {
		var copySource = function() {
			var fixBr = function(text) {
				return text.replace(/\<br\>/g,'<br />' );
			};
			try {
				var html = '<html>' + doc.documentElement.innerHTML + ' </html>';
				html = fixBr(html);
				Foxtrick.copyStringToClipboard(html);

				// display note
				var insertBefore = doc.getElementsByTagName('h1')[0];
				var url = "http://www.ht-ys.org/read_fixtures";
				var container = doc.createElement("div");
				container.appendChild(doc.createTextNode(Foxtrickl10n.getString("CopyYouth.fixturesSource.copied")));
				var linkContainer = doc.createElement("div");
				linkContainer.innerHTML = Foxtrickl10n.getString("CopyYouth.goto").replace(/%s/,
					'<a href="' + url + '" target="_blank">http://www.ht-ys.org</a>');
				container.appendChild(linkContainer);
				
				var note = Foxtrick.util.note.add(doc, insertBefore, "ft-youthfixtures-source-copy-note", container, null, true);
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		if (FoxtrickPrefs.getBool("smallcopyicons")) {
			if (doc.getElementById('copyyouthfixturessource'))
				return;
			var boxHead = doc.getElementById('mainWrapper').getElementsByTagName('div')[1];
			if (boxHead.className!='boxHead')
				return;

			if (Foxtrick.isStandardLayout(doc))
				doc.getElementById('mainBody').style.paddingTop = "10px";

			var messageLink = doc.createElement("a");
			messageLink.className = "inner copyicon copyyouthfixturessource ci_first";
			messageLink.id='copyyouthfixturessource';
			messageLink.title = Foxtrickl10n.getString("CopyYouth.fixturesSource");
			messageLink.addEventListener("click", copySource, false);

			var img = doc.createElement("img");
			img.alt = Foxtrickl10n.getString("CopyYouth.fixturesSource");
			img.src = "/Img/Icons/transparent.gif";

			messageLink.appendChild(img);
			boxHead.insertBefore(messageLink,boxHead.firstChild);
		}
		else {
			var parentDiv = doc.createElement("div");
			parentDiv.id = "foxtrick_addyouthstatisticsbox_parentDiv";
			parentDiv.setAttribute("style","display: inline; margin-right:8px;");

			var messageLink = doc.createElement("a");
			messageLink.className = "inner";
			messageLink.title = Foxtrickl10n.getString("CopyYouth.fixturesSource");
			messageLink.style.cursor = "pointer";
			messageLink.addEventListener("click", copySource, false);

			var img = doc.createElement("img");
			img.style.padding = "0px 5px 0px 0px;";
			img.className = "actionIcon";
			img.alt = Foxtrickl10n.getString("CopyYouth.fixturesSource");
			img.src = Foxtrick.ResourcePath+"resources/img/copy/copyNormal.png";
			messageLink.appendChild(img);

			parentDiv.appendChild(messageLink);

			var newBoxId = "foxtrick_actions_box";
			Foxtrick.addBoxToSidebar(doc, Foxtrickl10n.getString("CopyYouth.title"),
				parentDiv, newBoxId, "first", "");
		}
	},

	run : function(page, doc) {
		if (Foxtrick.isModuleFeatureEnabled(this, "TrainingReport")
			&& page == "YouthTraining") {
			this.addTrainingReport(page, doc);
		}
		if (Foxtrick.isModuleFeatureEnabled(this, "ScoutComment")
			&& (page == "youthplayerdetail" || page == "youthoverview")) {
			this.addScoutComment(page, doc);
		}
		if (Foxtrick.isModuleFeatureEnabled(this, "PlayerSource")
			&& page == "youthplayerdetail") {
			this.addPlayerSource(page, doc);
		}
		if (Foxtrick.isModuleFeatureEnabled(this, "FixturesSource")
			&& page == "youthFixtures") {
			this.addFixturesSource(page, doc);
		}
	},

	change : function(page, doc) {
		if (Foxtrick.isModuleFeatureEnabled(this, "ScoutComment")
			&& page == "youthoverview") {
			this.addScoutComment(page, doc);
		}
	}
};
