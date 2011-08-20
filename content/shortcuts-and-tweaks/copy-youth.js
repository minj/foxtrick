/**
* copy-youth.js
* Copy functions for youth sources
* @author larsw84, convincedd, Parminu, ryanli
*/

var FoxtrickCopyYouth = {
	MODULE_NAME : "CopyYouth",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ["YouthTraining", "youthplayerdetail", "playerdetail", "youthoverview",
		"youthFixtures"],
	OPTIONS : ["TrainingReport", "ScoutComment", "PlayerSource",
		"FixturesSource"],

	CSS : Foxtrick.ResourcePath + "resources/css/copy-youth.css",

	addTrainingReport : function(doc) {
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
		// add button
		var button = Foxtrick.util.copyButton.add(doc,
			Foxtrickl10n.getString("CopyYouth.trainingReport"));
		if (button) {
			Foxtrick.addClass(button, "ft-copy-training-report");
			Foxtrick.listen(button, "click", copyReport, false);
		}
	},

	addScoutComment : function(doc) {
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
		if (Foxtrick.isPage("youthoverview", doc)) {
			has_report = doc.getElementById('ctl00_ctl00_CPContent_CPMain_butScoutPropYes')!=null;
		}

		if (Foxtrick.isPage("youthplayerdetail", doc) || has_report) {
			if (has_report) {
				var alertdiv = doc.getElementById('ctl00_ctl00_CPContent_CPMain_butScoutPropYes').parentNode;
				if (alertdiv.parentNode.getElementsByTagName('a')[0]==null
					&& doc.getElementById('ft-copy-scout-comment-link')==null) {
					var a=doc.createElement('a');
					a.textContent = Foxtrickl10n.getString("CopyYouth.scoutComment");
					a.style.cssFloat = "right";
					a.style.marginBottom = "5px";
					a.href='javascript:void()';
					a.id = 'ft-copy-scout-comment-link';
					a.addEventListener("click", copyReport, false)
					alertdiv.parentNode.insertBefore(a,alertdiv);
				}
			}

			// add button
			if (!doc.getElementById("ft-copy-scout-comment-button")) {
				var button = Foxtrick.util.copyButton.add(doc,
					Foxtrickl10n.getString("CopyYouth.scoutComment"));
				if (button) {
					button.id = "ft-copy-scout-comment-button";
					Foxtrick.addClass(button, "ft-copy-scout-comment");
					Foxtrick.listen(button, "click", copyReport, false);
				}
			}
		}
	},

	addPlayerSource : function(doc) {
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
				if (Foxtrick.isPage('youthplayerdetail', doc))
					linkContainer.innerHTML = Foxtrickl10n.getString("CopyYouth.goto").replace(/%s/,
					'<a href="' + url + '" target="_blank">http://www.hattrick-youthclub.org</a>');
				container.appendChild(linkContainer);
				Foxtrick.util.note.add(doc, insertBefore, "ft-player-source-copy-note", container, null, true);
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		var button = Foxtrick.util.copyButton.add(doc,
			Foxtrickl10n.getString("CopyYouth.playerSource"));
		if (button) {
			Foxtrick.addClass(button, "ft-copy-player-source");
			Foxtrick.listen(button, "click", copySource, false);
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

		var button = Foxtrick.util.copyButton.add(doc,
			Foxtrickl10n.getString("CopyYouth.fixturesSource"));
		if (button) {
			Foxtrick.addClass(button, "ft-copy-fixtures-source");
			Foxtrick.listen(button, "click", copySource, false);
		}
	},

	run : function(doc) {
		if (FoxtrickPrefs.isModuleOptionEnabled("CopyYouth", "TrainingReport")
			&& Foxtrick.isPage("YouthTraining", doc)) {
			this.addTrainingReport(doc);
		}
		if (FoxtrickPrefs.isModuleOptionEnabled("CopyYouth", "ScoutComment")
			&& (Foxtrick.isPage("youthplayerdetail", doc)
				|| Foxtrick.isPage("youthoverview", doc))) {
			this.addScoutComment(doc);
		}
		if (FoxtrickPrefs.isModuleOptionEnabled("CopyYouth", "PlayerSource")
			&& (Foxtrick.isPage("youthplayerdetail", doc) || Foxtrick.isPage("playerdetail", doc))) {
			this.addPlayerSource(doc);
		}
		if (FoxtrickPrefs.isModuleOptionEnabled("CopyYouth", "FixturesSource")
			&& Foxtrick.isPage("youthFixtures", doc)) {
			this.addFixturesSource(doc);
		}
	},

	change : function(doc) {
		if (FoxtrickPrefs.isModuleOptionEnabled("CopyYouth", "ScoutComment")
			&& Foxtrick.isPage("youthoverview", doc)) {
			this.addScoutComment(doc);
		}
	}
};
Foxtrick.util.module.register(FoxtrickCopyYouth);
