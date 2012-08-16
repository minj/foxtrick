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
	OPTIONS : ["TrainingReport", "ScoutComment", "AutoSendRejectedToHY", "FixturesSource"],

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
		var copyReport = function(sendHTY) {
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

					//auto send the rejected player to HY
					var reportNode = subDivs[lastmainbox].cloneNode(true);
					var img = reportNode.getElementsByTagName("img")[0];
						img.parentNode.removeChild(img);
					
					var alert = reportNode.getElementsByClassName("alert")[0];
						alert.parentNode.removeChild(alert);


					var sendScoutCallToHY = function(){

						// url: http://www.hattrick-youthclub.org/_data_provider/foxtrick/playersYouthRejectCall
						//
						// params:
						// teamid or managerid: teamid or managerid
						// app: "foxtrick"
						// scoutcall: urlencoded scoutcall
						// identifier: unique string each request
						// lang: language from hattricks meta tag
						// hash: "foxtrick_" + teamId + "_" + identifier;
						//
						// possible returns
						// HTTP 200:
						// - Ok
						// HTTP 409:
						// - This language is not available on hattrick youthclub!
						// - Given scout call is not valid!
						// - Scout does not exist on hattrick youthclub!
						// - No scoutcomments found in scout call!
						// HTTP 400:
						// - not all data is given
						// - unauthorized request

						//api url
						var url = "http://www.hattrick-youthclub.org/_data_provider/foxtrick/playersYouthRejectCall";
					
						var teamId = Foxtrick.modules["Core"].getSelfTeamInfo().teamId;
						//assemble param string
						var params = "teamId=" + teamId;
						params = params + "&app=foxtrick";
						params = params + "&scoutcall=" + encodeURIComponent(reportNode.innerHTML);
						var d = new Date();
						var identifier = teamId + "_" + d.getTime();
						params = params + "&identifier=" + identifier;
						params = params + "&lang=" + Foxtrick.modules["ReadHtPrefs"].readLanguageFromMetaTag(doc);
						var hash = "foxtrick_" + teamId + "_" + identifier;
						params = params + "&hash=" + Foxtrick.encodeBase64(hash);
						//load and callback
						Foxtrick.util.load.async(url, function(response, status){
							switch(status){
								case 200:
									//everything is play, lets be silent
									break;
								case 404:
									addNode(response);
									break;
								case 400:
								case 409:
									addNode(response);
									break;
							};
							Foxtrick.log(status, response);
						}, params);
					}

					var addNode = function(text){
						var insertBefore = doc.getElementsByTagName('h1')[0];
						var container = doc.createElement("div");
						var p = doc.createElement("p");
						p.appendChild(doc.createTextNode(text));
						container.appendChild(p);
;
						Foxtrick.util.note.add(doc, insertBefore, "ft-scout-report-copy-note", container, null, false, null, null, 1500);	
					}

					//only when clicking the reject btn
					if(sendHTY && typeof(sendHTY) == "boolean") {
						//var is set in youthtwins
						Foxtrick.localGet("YouthClub." + Foxtrick.modules["Core"].getSelfTeamInfo().teamId +".isUser", function (isHYUser){
							if(isHYUser)
								sendScoutCallToHY();
						});
					} else {
						addNode( Foxtrickl10n.getString("copy.scoutComment.copied") );
					}

					// var server = FoxtrickPrefs.getBool("hty-stage")?'stage':'www';
					// if (rejectreport)
					// 	var url = "http://" + server + ".hattrick-youthclub.org/site/player_myrejects_add";
					// else
					// 	var url = "http://" + server + ".hattrick-youthclub.org/";
						
					// if (openHTY==true && !(Foxtrick.platform == "Opera" || Foxtrick.platform == "Safari")) {
					// 	Foxtrick.newTab(url);
					// }
					// else {
					// 	// display note
					// 	var insertBefore = doc.getElementsByTagName('h1')[0];
					// 	var container = doc.createElement("div");
					// 	var p = doc.createElement("p");
					// 	p.appendChild(doc.createTextNode(Foxtrickl10n.getString("copy.scoutComment.copied")));
					// 	container.appendChild(p);
						
					// 	var linkContainer = doc.createElement("div");
					// 	var string = Foxtrickl10n.getString("button.goto").split('%s');
					// 	linkContainer.appendChild(doc.createTextNode(string[0]));
					// 	var a = doc.createElement('a');
					// 	a.href = url;
					// 	a.target = "_copyYouth";
					// 	a.textContent = "http://www.hattrick-youthclub.org";
					// 	linkContainer.appendChild(a);
					// 	linkContainer.appendChild(doc.createTextNode(string[1]));
					// 	container.appendChild(linkContainer);
				
					// 	Foxtrick.util.note.add(doc, insertBefore, "ft-scout-report-copy-note", container, null, true);
					// }
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
				
				if (FoxtrickPrefs.isModuleOptionEnabled("CopyYouth", "AutoSendRejectedToHY")) {
					var rejectButton = alertdiv.getElementsByTagName('input')[1];
					rejectButton.setAttribute('title', Foxtrickl10n.getString('module.CopyYouth.AutoSendRejectedToHY.desc'));
					Foxtrick.onClick(rejectButton, function(){ copyReport(true) });
				}
				else if (alertdiv.parentNode.getElementsByTagName('a')[0]==null
					&& doc.getElementById('ft-copy-scout-comment-link')==null) {
					var a=doc.createElement('a');
					a.textContent = Foxtrickl10n.getString("copy.scoutComment");
					a.style.cssFloat = "right";
					a.style.marginBottom = "5px";
					a.href='#mainBody';
					a.id = 'ft-copy-scout-comment-link';
					Foxtrick.onClick(a, copyReport(false))
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
