"use strict";
/**
* copy-youth.js
* Copy functions for youth sources
* @author larsw84, convincedd, Parminu, ryanli
*/

Foxtrick.modules["CopyYouth"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ["youthTraining", "youthPlayerDetails", "youthOverview",
		"youthFixtures"],
	OPTIONS : ["TrainingReport", "ScoutComment", "RejectedToHTY", "FixturesSource"],

	CSS : Foxtrick.InternalPath + "resources/css/copy-youth.css",

	addTrainingReport : function(doc) {
		// return if training report unread
		if (doc.getElementById("ctl00_ctl00_CPContent_CPMain_butReadAll"))
			return;
		// copy function
		var copyReport = function() {
			try {
				var mainBody = doc.getElementById('mainBody');
				var matchid = Foxtrick.util.id.findMatchId(mainBody);
				
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
				var plain = clone.textContent;
				plain = plain.replace(/\s+\n\s+/g,'\n\n'); // replace multiple whitespace+newline by single newline
				plain = plain.replace(/^\s+|\s+$/g,'');  // remove leading/trailing whitespace
				plain += '\n';

				Foxtrick.copyStringToClipboard(plain);

				// display note
				var insertBefore = doc.getElementsByTagName('h1')[0];
				var server = FoxtrickPrefs.getBool("hty-stage")?'stage':'www';
				var url = "http://" + server + ".hattrick-youthclub.org/site/coachcomments_add/htmatch/"+matchid;
				var container = doc.createElement("div");
				var p = doc.createElement("p");
				p.appendChild(doc.createTextNode(Foxtrickl10n.getString("copy.trainingReport.copied")));
				container.appendChild(p);
				
				var linkContainer = doc.createElement("div");
				var string = Foxtrickl10n.getString("button.goto").split('%s');
				linkContainer.appendChild(doc.createTextNode(string[0]));
				var a = doc.createElement('a');
				a.href = url;
				a.target = "_copyYouth";
				a.textContent = "http://www.hattrick-youthclub.org/site/coachcomments_add/htmatch/"+matchid;
				linkContainer.appendChild(a);
				linkContainer.appendChild(doc.createTextNode(string[1]));
				container.appendChild(linkContainer);
				
				Foxtrick.util.note.add(doc, insertBefore, "ft-training-report-copy-note", container, null, true);
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};
		// add button
		var button = Foxtrick.util.copyButton.add(doc,
			Foxtrickl10n.getString("copy.trainingReport"));
		if (button) {
			Foxtrick.addClass(button, "ft-copy-training-report");
			Foxtrick.onClick(button, copyReport);
		}
	},

	addScoutComment : function(doc) {
		var copyReport = function(openHTY) {
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

					var server = FoxtrickPrefs.getBool("hty-stage")?'stage':'www';
					if (rejectreport)
						var url = "http://" + server + ".hattrick-youthclub.org/site/player_myrejects_add";
					else
						var url = "http://" + server + ".hattrick-youthclub.org/";
						
					if (openHTY==true && !(Foxtrick.platform == "Opera" || Foxtrick.platform == "Safari")) {
						Foxtrick.newTab(url);
					}
					else {
						// display note
						var insertBefore = doc.getElementsByTagName('h1')[0];
						var container = doc.createElement("div");
						var p = doc.createElement("p");
						p.appendChild(doc.createTextNode(Foxtrickl10n.getString("copy.scoutComment.copied")));
						container.appendChild(p);
						
						var linkContainer = doc.createElement("div");
						var string = Foxtrickl10n.getString("button.goto").split('%s');
						linkContainer.appendChild(doc.createTextNode(string[0]));
						var a = doc.createElement('a');
						a.href = url;
						a.target = "_copyYouth";
						a.textContent = "http://www.hattrick-youthclub.org";
						linkContainer.appendChild(a);
						linkContainer.appendChild(doc.createTextNode(string[1]));
						container.appendChild(linkContainer);
				
						Foxtrick.util.note.add(doc, insertBefore, "ft-scout-report-copy-note", container, null, true);
					}
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		var has_report = false;
		if (Foxtrick.isPage("youthOverview", doc)) {
			has_report = doc.getElementById('ctl00_ctl00_CPContent_CPMain_butScoutPropYes')!=null;
		}

		if (Foxtrick.isPage("youthPlayerDetails", doc) || has_report) {
			if (has_report) {
				var alertdiv = doc.getElementById('ctl00_ctl00_CPContent_CPMain_butScoutPropYes').parentNode;
				
				if (FoxtrickPrefs.isModuleOptionEnabled("CopyYouth", "RejectedToHTY")) {
					var rejectButton = alertdiv.getElementsByTagName('input')[1];
					rejectButton.setAttribute('title', Foxtrickl10n.getString('foxtrick.CopyYouth.RejectedToHTY.desc'));
					Foxtrick.onClick(rejectButton, function(){ copyReport(true) })
				}
				else if (alertdiv.parentNode.getElementsByTagName('a')[0]==null
					&& doc.getElementById('ft-copy-scout-comment-link')==null) {
					var a=doc.createElement('a');
					a.textContent = Foxtrickl10n.getString("copy.scoutComment");
					a.style.cssFloat = "right";
					a.style.marginBottom = "5px";
					a.href='#mainBody';
					a.id = 'ft-copy-scout-comment-link';
					Foxtrick.onClick(a, copyReport)
					alertdiv.parentNode.insertBefore(a,alertdiv);
				}
			}

			// add button
			if (!doc.getElementById("ft-copy-scout-comment-button")) {
				var button = Foxtrick.util.copyButton.add(doc,
					Foxtrickl10n.getString("copy.scoutComment"));
				if (button) {
					button.id = "ft-copy-scout-comment-button";
					Foxtrick.addClass(button, "ft-copy-scout-comment");
					Foxtrick.onClick(button, copyReport);
				}
			}
		}
	},

	addFixturesSource : function(doc) {
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
				var p = doc.createElement("p");
				p.appendChild(doc.createTextNode(Foxtrickl10n.getString("copy.fixturesSource.copied")));
				container.appendChild(p);

				var linkContainer = doc.createElement("div");
				var string = Foxtrickl10n.getString("button.goto").split('%s');
				linkContainer.appendChild(doc.createTextNode(string[0]));
				var a = doc.createElement('a');
				a.href = url;
				a.target = "_ht_ys";
				a.textContent = "http://www.ht-ys.org";
				linkContainer.appendChild(a);
				linkContainer.appendChild(doc.createTextNode(string[1]));
				container.appendChild(linkContainer);

				var note = Foxtrick.util.note.add(doc, insertBefore, "ft-youthfixtures-source-copy-note", container, null, true);
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		var button = Foxtrick.util.copyButton.add(doc,
			Foxtrickl10n.getString("copy.fixturesSource"));
		if (button) {
			Foxtrick.addClass(button, "ft-copy-fixtures-source");
			Foxtrick.onClick(button, copySource);
		}
	},

	run : function(doc) {
		if (FoxtrickPrefs.isModuleOptionEnabled("CopyYouth", "TrainingReport")
			&& Foxtrick.isPage("youthTraining", doc)) {
			this.addTrainingReport(doc);
		}
		if (FoxtrickPrefs.isModuleOptionEnabled("CopyYouth", "ScoutComment")
			&& (Foxtrick.isPage("youthPlayerDetails", doc)
				|| Foxtrick.isPage("youthOverview", doc))) {
			this.addScoutComment(doc);
		}
		if (FoxtrickPrefs.isModuleOptionEnabled("CopyYouth", "FixturesSource")
			&& Foxtrick.isPage("youthFixtures", doc)) {
			this.addFixturesSource(doc);
		}
	},

	change : function(doc) {
		if (FoxtrickPrefs.isModuleOptionEnabled("CopyYouth", "ScoutComment")
			&& Foxtrick.isPage("youthOverview", doc)) {
			this.addScoutComment(doc);
		}
	}
};
