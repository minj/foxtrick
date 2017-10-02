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
	OPTIONS: [
		'TrainingReport', 'AutoSendTrainingReportToHY', 'ScoutComment',
		'AutoSendRejectedToHY', 'AutoSendTrainingChangesToHY', 'FixturesSource'
	],

	CSS: Foxtrick.InternalPath + 'resources/css/copy-youth.css',

	addNode: function(doc, text, timeout) {
		Foxtrick.util.note.add(doc, text, null, { timeout: timeout });
	},

	addTrainingReport: function(doc) {
		var module = this;
		// copy function
		var copyReport = function() {
			try {
				var mainBody = doc.getElementById('mainBody');
				var matchid = Foxtrick.util.id.findMatchId(mainBody);

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

				Foxtrick.copy(doc, plain);

				// display note
				var server = Foxtrick.Prefs.getBool('hty-stage') ? 'stage' : 'www';
				var url = 'https://' + server +
					'.hattrick-youthclub.org/site/coachcomments_add/htmatch/' + matchid;
				var container = doc.createElement('div');
				var p = doc.createElement('p');
				p.appendChild(doc.createTextNode(
				              Foxtrick.L10n.getString('copy.trainingReport.copied')));
				container.appendChild(p);

				var linkContainer = doc.createElement('div');
				var string = Foxtrick.L10n.getString('button.goto').split('%s');
				linkContainer.appendChild(doc.createTextNode(string[0]));
				var a = doc.createElement('a');
				a.href = url;
				a.target = '_copyYouth';
				a.textContent = 'https://www.hattrick-youthclub.org/site/coachcomments_add/htmatch/'
					+ matchid;
				linkContainer.appendChild(a);
				linkContainer.appendChild(doc.createTextNode(string[1]));
				container.appendChild(linkContainer);

				Foxtrick.util.note.add(doc, container, 'ft-training-report-copy-note');
			}
			catch (e) {
				Foxtrick.log(e);
			}
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
			var ok = 'module.CopyYouth.AutoSendTrainingReportToHY.success';
			ok = Foxtrick.L10n.getString(ok);

			var entry = doc.getElementById('mainBody');
			var loading = Foxtrick.util.note.createLoading(doc);
			entry.insertBefore(loading, entry.firstChild);

			Foxtrick.api.hy.postMatchReport(function() {
				module.addNode(doc, ok, 3000);
			  }, params,
			  function(response, status) {
				module.addNode(doc, 'Error ' + status + ': ' + JSON.parse(response).error);
			  },
			  function() {
				entry.removeChild(loading);
			});
		};


		//if training report unread mark dirty on click so auto send to HY can kick in
		var readBtn = Foxtrick.getButton(doc, 'ReadAll');
		if (readBtn) {
			if (Foxtrick.Prefs.isModuleOptionEnabled('CopyYouth', 'AutoSendTrainingReportToHY')) {
				var mainBody = doc.getElementById('mainBody');
				var matchid = Foxtrick.util.id.findMatchId(mainBody);
				var readBtn = Foxtrick.getButton(doc, 'ReadAll');

				Foxtrick.onClick(readBtn, function() {
					Foxtrick.log('Marked');
					Foxtrick.sessionSet('YouthClub.sendTrainingReport', true);
				});
			}
		} else {
			// add button
			var button = Foxtrick.util.copyButton.add(doc, Foxtrick.L10n.getString(
			                                          'copy.trainingReport'));
			if (button) {
				Foxtrick.addClass(button, 'ft-copy-training-report');
				Foxtrick.onClick(button, copyReport);
			}

			//if the user is a HY user (currently identified by a response from YouthTwins,
			//send the TrainingReport to HY automatically
			if (!Foxtrick.Prefs.isModuleOptionEnabled('CopyYouth', 'AutoSendTrainingReportToHY'))
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
		var module = this;
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

					Foxtrick.copy(doc, plain);

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
						var ok = 'module.CopyYouth.AutoSendRejectedToHY.success';
						ok = Foxtrick.L10n.getString(ok);

						var entry = doc.getElementById('mainBody');
						var loading = Foxtrick.util.note.createLoading(doc);
						entry.insertBefore(loading, entry.firstChild);

						Foxtrick.api.hy.postScoutCall(function() {
							module.addNode(doc, ok, 3000);
						  }, params,
						  function(response, status) {
							module.addNode(doc, 'Error ' + status + ': ' + JSON.parse(response).error);
						  },
						  function() {
							entry.removeChild(loading);
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
						module.addNode(doc, Foxtrick.L10n.getString('copy.scoutComment.copied'));
					}
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		var has_report = false;
		if (Foxtrick.isPage(doc, 'youthOverview')) {
			has_report = Foxtrick.getButton(doc, 'ScoutPropYes') !== null;
		}

		if (Foxtrick.isPage(doc, 'youthPlayerDetails') || has_report) {
			if (has_report) {
				var alertdiv = Foxtrick.getButton(doc, 'ScoutPropYes').parentNode;


				//auto send rejected players to HY, api see above
				if (Foxtrick.Prefs.isModuleOptionEnabled('CopyYouth', 'AutoSendRejectedToHY')) {
					var rejectButton = alertdiv.getElementsByTagName('input')[1];
					rejectButton.setAttribute('title', Foxtrick.L10n.getString(
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
					a.textContent = Foxtrick.L10n.getString('copy.scoutComment');
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
				if (Foxtrick.Pages.YouthPlayer.wasFired(doc))
					return;
				var button = Foxtrick.util.copyButton.add(doc,
					Foxtrick.L10n.getString('copy.scoutComment'));
				if (button) {
					button.id = 'ft-copy-scout-comment-button';
					Foxtrick.addClass(button, 'ft-copy-scout-comment');
					Foxtrick.onClick(button, copyReport);
				}
			}
		}
	},

	/**
	 * monitor training changes and send them to HY
	 * @param	{document}	doc
	 */
	monitorTraining: function(doc) {
		var module = this;
		var sendTrainingChangeToHY = function() {
			// assemble param string
			var params = 'primaryTraining=' + training[0].value;
			params = params + '&secondaryTraining=' + training[1].value;
			var ok = 'module.CopyYouth.AutoSendTrainingChangesToHY.success';
			ok = Foxtrick.L10n.getString(ok);

			var entry = doc.getElementById('mainBody');
			var loading = Foxtrick.util.note.createLoading(doc);
			entry.insertBefore(loading, entry.firstChild);

			Foxtrick.api.hy.postTrainingChange(function() {
				module.addNode(doc, ok, 3000);
			  }, params,
			  function(response, status) {
				module.addNode(doc, 'Error ' + status + ': ' + JSON.parse(response).error);
			  },
			  function() {
				entry.removeChild(loading);
			});
		};

		var changeBtn = Foxtrick.getButton(doc, 'ChangeTraining');
		var training = doc.querySelectorAll('#mainBody table.form select');
		if (!changeBtn || training.length != 2)
			return;

		Foxtrick.api.hy.runIfHYUser(function() {
			Foxtrick.sessionGet('YouthClub.sendTrainingChange', function(send) {
				if (!send)
					return;

				Foxtrick.sessionSet('YouthClub.sendTrainingChange', false);
				sendTrainingChangeToHY();
			});

			Foxtrick.onClick(changeBtn, function(ev) {
				Foxtrick.sessionSet('YouthClub.sendTrainingChange', true);
			});
		});
	},
	addFixturesSource: function(doc) {
		var copySource = function() {
			var fixBr = function(text) {
				return text.replace(/\<br\>/g, '<br />');
			};
			try {
				var html = '<html>' + doc.documentElement.innerHTML + ' </html>';
				html = fixBr(html);
				Foxtrick.copy(doc, html, 'text/html');

				// display note
				var url = 'http://www.ht-ys.org/read_fixtures';
				var container = doc.createElement('div');
				var p = doc.createElement('p');
				p.appendChild(doc.createTextNode(
				              Foxtrick.L10n.getString('copy.fixturesSource.copied')));
				container.appendChild(p);

				var linkContainer = doc.createElement('div');
				var string = Foxtrick.L10n.getString('button.goto').split('%s');
				linkContainer.appendChild(doc.createTextNode(string[0]));
				var a = doc.createElement('a');
				a.href = url;
				a.target = '_ht_ys';
				a.textContent = 'http://www.ht-ys.org';
				linkContainer.appendChild(a);
				linkContainer.appendChild(doc.createTextNode(string[1]));
				container.appendChild(linkContainer);

				Foxtrick.util.note.add(doc, container, 'ft-youthfixtures-source-copy-note');
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		var button = Foxtrick.util.copyButton.add(doc,
			Foxtrick.L10n.getString('copy.fixturesSource'));
		if (button) {
			Foxtrick.addClass(button, 'ft-copy-fixtures-source');
			Foxtrick.onClick(button, copySource);
		}
	},

	run: function(doc) {
		if (Foxtrick.Prefs.isModuleOptionEnabled('CopyYouth', 'TrainingReport')
			&& Foxtrick.isPage(doc, 'youthTraining')) {
			this.addTrainingReport(doc);
		}
		if (Foxtrick.Prefs.isModuleOptionEnabled('CopyYouth', 'AutoSendTrainingChangesToHY')
			&& Foxtrick.isPage(doc, 'youthTraining')) {
			this.monitorTraining(doc);
		}
		if (Foxtrick.Prefs.isModuleOptionEnabled('CopyYouth', 'ScoutComment')
			&& (Foxtrick.isPage(doc, 'youthPlayerDetails')
				|| Foxtrick.isPage(doc, 'youthOverview'))) {
			this.addScoutComment(doc);
		}
		if (Foxtrick.Prefs.isModuleOptionEnabled('CopyYouth', 'FixturesSource')
			&& Foxtrick.isPage(doc, 'youthFixtures')) {
			this.addFixturesSource(doc);
		}
	},

	change: function(doc) {
		if (Foxtrick.Prefs.isModuleOptionEnabled('CopyYouth', 'ScoutComment')
			&& Foxtrick.isPage(doc, 'youthOverview')) {
			this.addScoutComment(doc);
		}
	}
};
