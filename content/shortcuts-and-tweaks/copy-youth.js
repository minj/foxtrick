'use strict';
/**
* copy-youth.js
* Copy functions for youth sources
* @author larsw84, convincedd, Parminu, ryanli
*/

Foxtrick.modules['CopyYouth'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['youthTraining', 'youthPlayerDetails', 'youthOverview',
		'youthFixtures'],
	OPTIONS: ['TrainingReport', 'AutoSendTrainingReportToHY', 'ScoutComment',
		'AutoSendRejectedToHY', 'FixturesSource'],

	CSS: Foxtrick.InternalPath + 'resources/css/copy-youth.css',

	addTrainingReport: function(doc) {
		// copy function
		var copyReport = function() {
			try {
				var mainBody = doc.getElementById('mainBody');
				var matchid = Foxtrick.util.id.findMatchId(mainBody);

				var subDivs = mainBody.getElementsByTagName('div');
				// FIXME - what the hell are they using this class‽
				var playerInfo = mainBody.getElementsByClassName('playerInfo')[0];
				var clone = playerInfo.cloneNode(true);
				for (var j = 0; j < 5; j++) {  // remove greeting
					clone.removeChild(clone.firstChild);
				}
				for (var j = 0; j < 6; j++) { // remove end phrase
					clone.removeChild(clone.lastChild);
				}
				var plain = clone.textContent;
				plain = plain.replace(/\s+\n\s+/g, '\n\n');
				// replace multiple whitespace+newline by single newline
				plain = plain.replace(/^\s+|\s+$/g, '');  // remove leading/trailing whitespace
				plain += '\n';

				Foxtrick.copyStringToClipboard(plain);

				// display note
				var insertBefore = doc.getElementsByTagName('h1')[1];
				var server = FoxtrickPrefs.getBool('hty-stage') ? 'stage' : 'www';
				var url = 'http://' + server +
					'.hattrick-youthclub.org/site/coachcomments_add/htmatch/' + matchid;
				var container = doc.createElement('div');
				var p = doc.createElement('p');
				p.appendChild(doc.createTextNode(
				              Foxtrickl10n.getString('copy.trainingReport.copied')));
				container.appendChild(p);

				var linkContainer = doc.createElement('div');
				var string = Foxtrickl10n.getString('button.goto').split('%s');
				linkContainer.appendChild(doc.createTextNode(string[0]));
				var a = doc.createElement('a');
				a.href = url;
				a.target = '_copyYouth';
				a.textContent = 'http://www.hattrick-youthclub.org/site/coachcomments_add/htmatch/'
					+ matchid;
				linkContainer.appendChild(a);
				linkContainer.appendChild(doc.createTextNode(string[1]));
				container.appendChild(linkContainer);

				Foxtrick.util.note.add(doc, insertBefore, 'ft-training-report-copy-note', container,
				                       null, true);
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		var addNode = function(text, timeout) {
			var insertBefore = doc.getElementsByTagName('h1')[1];
			var container = doc.createElement('div');
			var p = doc.createElement('p');
			p.appendChild(doc.createTextNode(text));
			container.appendChild(p);
			Foxtrick.util.note.add(doc, insertBefore, 'ft-training-report-copy-note', container,
			                       null, true, null, false, timeout);
		};

		var sendTrainingReportToHY = function(matchId, trainerNode, reportNode, training) {
			//assemble param string
			var params = 'report=' + encodeURIComponent(reportNode.innerHTML);
			params = params + '&matchId=' + matchId;
			params = params + '&trainer=' + encodeURIComponent(trainerNode.innerHTML);
			params = params + '&lang=' +
				Foxtrick.modules['ReadHtPrefs'].readLanguageFromMetaTag(doc);
			params = params + '&primaryTraining=' + training[0].value;
			params = params + '&secondaryTraining=' + training[1].value;

			Foxtrick.api.hy.postMatchReport(function() {
				addNode(Foxtrickl10n
							.getString('module.CopyYouth.AutoSendTrainingReportToHY.success'), 3000);
			  }, params,
			  function(response, status) {
				addNode('Error ' + status + ': ' + JSON.parse(response).error);
			});
		};


		//if training report unread mark dirty on click so auto send to HY can kick in
		var readBtn = doc.getElementById('ctl00_ctl00_CPContent_CPMain_butReadAll');
		if (readBtn) {
			if (FoxtrickPrefs.isModuleOptionEnabled('CopyYouth', 'AutoSendTrainingReportToHY')) {
				var mainBody = doc.getElementById('mainBody');
				var matchid = Foxtrick.util.id.findMatchId(mainBody);
				var readBtn = doc.getElementById('ctl00_ctl00_CPContent_CPMain_butReadAll');

				Foxtrick.onClick(readBtn, function() {
					Foxtrick.log('Marked');
					Foxtrick.sessionSet('YouthClub.sendTrainingReport', true);
				});
			}
		} else {
			// add button
			var button = Foxtrick.util.copyButton.add(doc, Foxtrickl10n.getString(
			                                          'copy.trainingReport'));
			if (button) {
				Foxtrick.addClass(button, 'ft-copy-training-report');
				Foxtrick.onClick(button, copyReport);
			}

			//if the user is a HY user (currently identified by a response from YouthTwins,
			//send the TrainingReport to HY automatically
			if (!FoxtrickPrefs.isModuleOptionEnabled('CopyYouth', 'AutoSendTrainingReportToHY'))
				return;

			//Debug: Always send this report, can be used to test
			//Foxtrick.sessionSet('YouthClub.sendTrainingReport', true);

			Foxtrick.api.hy.runIfHYUser(function() {
				var mainBody = doc.getElementById('mainBody');
				var matchid = Foxtrick.util.id.findMatchId(mainBody);
				Foxtrick.sessionGet('YouthClub.sendTrainingReport',
				  function(value) {
					if (value) {
						Foxtrick.log('Sending to HY, YouthClub.sendTrainingReport', value);
						Foxtrick.sessionSet('YouthClub.sendTrainingReport', false);
						var reportNode = doc.getElementsByClassName('playerInfo')[0];
						var trainerNode = doc.querySelectorAll('#mainBody > p.shy')[0];
						var training = doc.querySelectorAll('#mainBody table.form select');
						sendTrainingReportToHY(matchid, trainerNode, reportNode, training);
					} else {
						Foxtrick.log('Not sending to HY, YouthClub.sendTrainingReport', value);
					}
				});
			});
		}
	},

	addScoutComment: function(doc) {
		var addNode = function(text, timeout) {
			var insertBefore = doc.getElementsByTagName('h1')[1];
			var container = doc.createElement('div');
			var p = doc.createElement('p');
			p.appendChild(doc.createTextNode(text));
			container.appendChild(p);
			Foxtrick.util.note.add(doc, insertBefore, 'ft-training-report-copy-note', container,
			                       null, true, null, false, timeout);
		};
		var copyReport = function(sendHTY) {
			try {
				var mainBody = doc.getElementById('mainBody');

				var subDivs = mainBody.getElementsByTagName('div');
				var lastmainbox = -1;
				for (var i = 0; i < subDivs.length; i++) {
					if (subDivs[i].className == 'mainBox') {
						lastmainbox = i;
					}
					if (subDivs[i].className == 'managerInfo') {
						lastmainbox = i; // not the last realy. just was lazy
						var rejectreport = true;
						break;
					}
				}

				if (lastmainbox != -1) {
					var plain = subDivs[lastmainbox].innerHTML;
					var plainsplit = plain.split('<a');
					plain = plainsplit[0];
					plain = plain.replace(/\&nbsp;/ig, ' ');
					plain = plain.replace(/^\s+/, '');
					// remove leading whitespace
					plain = plain.replace(/\s+/g, ' ');
					// replace inner multiple whitespace by single whitespace
					plain = plain.replace(/\<br\>\s+/ig, '\n');
					// replace <br> with and w/o whitespace with newline
					plain = plain.replace(/\<br\>|\<\/h2\> |\<\/h3\>/ig, '\n');
					plain = Foxtrick.stripHTML(plain);

					// remove last three paragraphs (two newlines and a sentence
					// like 'What do you say? Should we give him a chance?'
					var paragraphs = plain.split(/\n/);
					paragraphs = paragraphs.splice(0, paragraphs.length - 3);
					plain = paragraphs.join('\n');

					Foxtrick.copyStringToClipboard(plain);

					//auto send the rejected player to HY
					var reportNode = subDivs[lastmainbox].cloneNode(true);
					var img = reportNode.getElementsByTagName('img')[0];
					if (img)
						img.parentNode.removeChild(img);

					var alert = reportNode.getElementsByClassName('alert')[0];
					if (alert)
						alert.parentNode.removeChild(alert);


					var sendScoutCallToHY = function() {
						//assemble param string
						var params = 'scoutcall=' + encodeURIComponent(reportNode.innerHTML);
						params = params + '&lang=' +
							Foxtrick.modules['ReadHtPrefs'].readLanguageFromMetaTag(doc);

						Foxtrick.api.hy.postScoutCall(function() {
							addNode(Foxtrickl10n
										.getString('module.CopyYouth.AutoSendRejectedToHY.success'),
										3000);
						  }, params,
						  function(response, status) {
							addNode('Error ' + status + ': ' + JSON.parse(response).error);
						});
					};

					//only when clicking the reject btn
					if (sendHTY && typeof(sendHTY) == 'boolean') {
						Foxtrick.api.hy.runIfHYUser(function() {
							Foxtrick.log('HY user, sending rejected call to HY');
							sendScoutCallToHY();
						});
					} else {
						Foxtrick.log('Manual copy of scout call.');
						addNode(Foxtrickl10n.getString('copy.scoutComment.copied'));
					}
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		var has_report = false;
		if (Foxtrick.isPage(doc, 'youthOverview')) {
			has_report = doc.getElementById('ctl00_ctl00_CPContent_CPMain_butScoutPropYes') != null;
		}

		if (Foxtrick.isPage(doc, 'youthPlayerDetails') || has_report) {
			if (has_report) {
				var alertdiv =
					doc.getElementById('ctl00_ctl00_CPContent_CPMain_butScoutPropYes').parentNode;


				//auto send rejected players to HY, api see above
				if (FoxtrickPrefs.isModuleOptionEnabled('CopyYouth', 'AutoSendRejectedToHY')) {
					var rejectButton = alertdiv.getElementsByTagName('input')[1];
					rejectButton.setAttribute('title', Foxtrickl10n.getString(
					                          'module.CopyYouth.AutoSendRejectedToHY.desc'));
					Foxtrick.onClick(rejectButton, function() { copyReport(true) });

					// enable for debug: fake link, used to simulate sending shit to HY
					// without actually rejecting the player
					//var fakeReject = doc.createElement('a');
					//fakeReject.textContent = 'Fake reject';
					//rejectButton.parentNode.appendChild(fakeReject);
					//Foxtrick.onClick(fakeReject, function(){ copyReport(true) });

				}
				else if (alertdiv.parentNode.getElementsByTagName('a')[0] == null
					&& doc.getElementById('ft-copy-scout-comment-link') == null) {
					var a = doc.createElement('a');
					a.textContent = Foxtrickl10n.getString('copy.scoutComment');
					a.href = '#mainBody';
					a.id = 'ft-copy-scout-comment-link';
					Foxtrick.onClick(a, copyReport(false));
					alertdiv.parentNode.insertBefore(a, alertdiv);
				}
				// setting the cookie in case of pull
				var acceptButton = alertdiv.getElementsByTagName('input')[0];
				Foxtrick.onClick(acceptButton, function() {
					Foxtrick.cookieSet('for_hty', { 'pull': true }) });

				// var fakeAccept = doc.createElement('a');
				// fakeAccept.textContent = 'Fake accept';
				// acceptButton.parentNode.appendChild(fakeAccept);
				// Foxtrick.onClick(fakeAccept, function(){
				//	Foxtrick.cookieSet('for_hty', { 'pull':true }) });
			}

			// add button
			if (!doc.getElementById('ft-copy-scout-comment-button')) {
				var button = Foxtrick.util.copyButton.add(doc,
					Foxtrickl10n.getString('copy.scoutComment'));
				if (button) {
					button.id = 'ft-copy-scout-comment-button';
					Foxtrick.addClass(button, 'ft-copy-scout-comment');
					Foxtrick.onClick(button, copyReport);
				}
			}
		}
	},

	addFixturesSource: function(doc) {
		var copySource = function() {
			var fixBr = function(text) {
				return text.replace(/\<br\>/g, '<br />');
			};
			try {
				var html = '<html>' + doc.documentElement.innerHTML + ' </html>';
				html = fixBr(html);
				Foxtrick.copyStringToClipboard(html);

				// display note
				var insertBefore = doc.getElementsByTagName('h1')[1];
				var url = 'http://www.ht-ys.org/read_fixtures';
				var container = doc.createElement('div');
				var p = doc.createElement('p');
				p.appendChild(doc.createTextNode(
				              Foxtrickl10n.getString('copy.fixturesSource.copied')));
				container.appendChild(p);

				var linkContainer = doc.createElement('div');
				var string = Foxtrickl10n.getString('button.goto').split('%s');
				linkContainer.appendChild(doc.createTextNode(string[0]));
				var a = doc.createElement('a');
				a.href = url;
				a.target = '_ht_ys';
				a.textContent = 'http://www.ht-ys.org';
				linkContainer.appendChild(a);
				linkContainer.appendChild(doc.createTextNode(string[1]));
				container.appendChild(linkContainer);

				var note = Foxtrick.util.note.add(doc, insertBefore,
				                                  'ft-youthfixtures-source-copy-note', container,
				                                  null, true);
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		var button = Foxtrick.util.copyButton.add(doc,
			Foxtrickl10n.getString('copy.fixturesSource'));
		if (button) {
			Foxtrick.addClass(button, 'ft-copy-fixtures-source');
			Foxtrick.onClick(button, copySource);
		}
	},

	run: function(doc) {
		if (FoxtrickPrefs.isModuleOptionEnabled('CopyYouth', 'TrainingReport')
			&& Foxtrick.isPage(doc, 'youthTraining')) {
			this.addTrainingReport(doc);
		}
		if (FoxtrickPrefs.isModuleOptionEnabled('CopyYouth', 'ScoutComment')
			&& (Foxtrick.isPage(doc, 'youthPlayerDetails')
				|| Foxtrick.isPage(doc, 'youthOverview'))) {
			this.addScoutComment(doc);
		}
		if (FoxtrickPrefs.isModuleOptionEnabled('CopyYouth', 'FixturesSource')
			&& Foxtrick.isPage(doc, 'youthFixtures')) {
			this.addFixturesSource(doc);
		}
	},

	change: function(doc) {
		if (FoxtrickPrefs.isModuleOptionEnabled('CopyYouth', 'ScoutComment')
			&& Foxtrick.isPage(doc, 'youthOverview')) {
			this.addScoutComment(doc);
		}
	}
};
