/**
* copy-youth.js
* Copy functions for youth sources
* @author larsw84, convincedd, Parminu, ryanli
*/

'use strict';

Foxtrick.modules.CopyYouth = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['youthTraining', 'youthPlayerDetails', 'youthOverview',
		'youthFixtures'],
	OPTIONS: [
		'TrainingReport', 'AutoSendTrainingReportToHY', 'ScoutComment',
		'AutoSendRejectedToHY', 'AutoSendTrainingChangesToHY', 'FixturesSource',
	],

	CSS: Foxtrick.InternalPath + 'resources/css/copy-youth.css',

	/**
	 * @param {document}           doc
	 * @param {string|HTMLElement} text
	 * @param {number}             [timeout]
	 */
	addNode: function(doc, text, timeout) {
		Foxtrick.util.note.add(doc, text, null, { timeout: timeout });
	},

	/** @param {document} doc */
	addTrainingReport: function(doc) {
		const module = this;

		/**
		 * copy function
		 * @type {Listener<HTMLElement, MouseEvent>}
		 */
		var copyReport = function() {
			try {
				let mainBody = doc.getElementById('mainBody');

				const matchId = Foxtrick.util.id.findMatchId(mainBody);

				let playerInfo = mainBody.querySelector('.playerInfo');
				let clone = Foxtrick.cloneElement(playerInfo, true);

				// eslint-disable-next-line no-magic-numbers
				for (let _ of Foxtrick.range(4)) { // remove greeting: text, p, text, strong
					clone.removeChild(clone.firstChild);
				}
				// eslint-disable-next-line no-magic-numbers
				for (let _ of Foxtrick.range(5)) { // remove end phrase: text, br, text, br, text
					clone.removeChild(clone.lastChild);
				}

				let plain = clone.textContent;
				plain = plain.replace(/\s+\n\s+/g, '\n\n');
				plain = plain.trim();
				plain += '\n';

				Foxtrick.copy(doc, plain);

				// display note
				let server = Foxtrick.Prefs.getBool('hty-stage') ? 'stage' : 'www';
				let url = 'https://' + server +
					'.hattrick-youthclub.org/site/coachcomments_add/htmatch/' + matchId;
				let copied = Foxtrick.L10n.getString('copy.trainingReport.copied');

				let container = doc.createElement('div');
				let p = doc.createElement('p');
				p.textContent = copied;
				container.appendChild(p);

				let linkContainer = doc.createElement('div');
				let [start, end] = Foxtrick.L10n.getString('button.goto').split('%s');
				linkContainer.textContent = start;

				let a = doc.createElement('a');
				a.href = url;
				a.target = '_copyYouth';
				a.textContent = url;

				linkContainer.appendChild(a);
				linkContainer.appendChild(doc.createTextNode(end));
				container.appendChild(linkContainer);

				Foxtrick.util.note.add(doc, container, 'ft-training-report-copy-note');
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		/**
		 * @param {number} matchId
		 * @param {HTMLElement} trainerNode
		 * @param {HTMLElement} reportNode
		 * @param {ArrayLike<HTMLSelectElement>} training
		 */
		var sendTrainingReportToHY = async (matchId, trainerNode, reportNode, training) => {
			let [primary, secondary] = Array.from(training);

			// assemble param string
			let params = 'report=' + encodeURIComponent(reportNode.innerHTML);
			params += '&matchId=' + matchId;
			params += '&trainer=' + encodeURIComponent(trainerNode.innerHTML);
			params += '&lang=' + Foxtrick.modules.ReadHtPrefs.readLanguageFromMetaTag(doc);
			params += '&primaryTraining=' + primary.value;
			params += '&secondaryTraining=' + secondary.value;

			let ok = 'module.CopyYouth.AutoSendTrainingReportToHY.success';
			ok = Foxtrick.L10n.getString(ok);

			const entry = doc.getElementById('mainBody');
			const loading = Foxtrick.util.note.createLoading(doc);
			entry.insertBefore(loading, entry.firstChild);


			try {
				await Foxtrick.api.hy.postMatchReport(params);
				// eslint-disable-next-line no-magic-numbers
				module.addNode(doc, ok, 3000);
			}
			catch (rej) {
				let { text, status } = rej ||
					{ status: 0, text: `unknown error: ${typeof rej}` };

				let payload = { error: 'Unknown error' };
				try {
					if (text)
						payload = JSON.parse(text);
				}
				catch (e) {
					const DTD = '<!DOCTYPE';
					const HTML = '<html>';
					if (text && DTD.toUpperCase() == // lgtm[js/trivial-conditional]
					    text.slice(0, DTD.length).toUpperCase() ||
					    text && HTML.toUpperCase() == // lgtm[js/trivial-conditional]
					    text.slice(0, HTML.length).toUpperCase()
					) {
						payload.error = 'hy failed to accept training report';
					}
					else {
						let msg = `[sendTrainingReportToHY]: could not parse '${text}'`;
						Foxtrick.log(new Error(msg));
					}
				}
				let { error } = payload;

				module.addNode(doc, `Error ${status}: ${error}`);
			}
			finally {
				entry.removeChild(loading);
			}
		};

		// if training report unread mark dirty on click so auto send to HY can kick in
		let readBtn = Foxtrick.getButton(doc, 'ReadAll');
		if (readBtn) {
			if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'AutoSendTrainingReportToHY')) {
				let readBtn = Foxtrick.getButton(doc, 'ReadAll');
				Foxtrick.onClick(readBtn, function() {
					Foxtrick.log('Marked');
					Foxtrick.sessionSet('YouthClub.sendTrainingReport', true);
				});
			}
			return;
		}

		// add button
		let copyL10n = Foxtrick.L10n.getString('copy.trainingReport');
		let button = Foxtrick.util.copyButton.add(doc, copyL10n);
		if (button) {
			Foxtrick.addClass(button, 'ft-copy-training-report');
			Foxtrick.onClick(button, copyReport);
		}

		// if the user is a HY user
		// send the TrainingReport to HY automatically
		if (!Foxtrick.Prefs.isModuleOptionEnabled(module, 'AutoSendTrainingReportToHY'))
			return;

		// DEBUG: Always send this report, can be used to test
		// Foxtrick.sessionSet('YouthClub.sendTrainingReport', true);

		(async () => {
			let isUser = await Foxtrick.api.hy.isHYUser();
			if (!isUser)
				return;

			let mainBody = doc.getElementById('mainBody');
			let matchId = Foxtrick.util.id.findMatchId(mainBody);

			let value = await Foxtrick.session.get('YouthClub.sendTrainingReport');
			if (!value) {
				Foxtrick.log('Not sending to HY, YouthClub.sendTrainingReport', value);
				return;
			}

			Foxtrick.log('Sending to HY, YouthClub.sendTrainingReport', value);
			Foxtrick.session.set('YouthClub.sendTrainingReport', false)
				.catch(Foxtrick.catch(module));

			/** @type {HTMLElement} */
			let trainerNode = doc.querySelector('#mainBody .pmAvatar');

			/** @type {HTMLElement} */
			let reportNode = doc.querySelector('.playerInfo');

			/** @type {NodeListOf<HTMLSelectElement>} */
			let training = doc.querySelectorAll('#mainBody table.form select');
			await sendTrainingReportToHY(matchId, trainerNode, reportNode, training);

		})().catch(Foxtrick.catch(module));
	},

	/** @param {document} doc */
	addScoutComment: function(doc) {
		const module = this;

		/** @param {boolean} sendToHY */
		var copyReport = function(sendToHY) {
			try {
				var mainBody = doc.getElementById('mainBody');

				/** @type {HTMLElement} */
				let info = mainBody.querySelector('.pmSpeech');
				if (!info)
					return;

				if (info.dataset.ftInProgress == '1')
					return;

				info.dataset.ftInProgress = '1';

				let clone = /** @type {HTMLElement} */ (info.cloneNode(true));
				let header = clone.querySelector('h3, h2');
				if (header)
					header.remove();

				let plain = clone.innerHTML;
				plain = plain.replace(/&nbsp;/ig, ' ');

				// remove leading whitespace
				plain = plain.replace(/^\s+/, '');

				// replace inner multiple whitespace by single whitespace
				plain = plain.replace(/\s+/g, ' ');

				// replace <br> with and w/o whitespace with newline
				plain = plain.replace(/<br ?\/?>\s+/ig, '\n');
				plain = plain.replace(/<br>|<\/h2> |<\/h3>/ig, '\n');

				plain = Foxtrick.stripHTML(plain);

				// remove last three paragraphs (two newlines and a sentence
				// like 'What do you say? Should we give him a chance?'
				let paragraphs = plain.split(/\n/);
				// eslint-disable-next-line no-magic-numbers
				paragraphs = paragraphs.splice(0, paragraphs.length - 3);
				plain = paragraphs.join('\n');

				Foxtrick.copy(doc, plain);

				// auto send the rejected player to HY

				let reportNode = Foxtrick.cloneElement(info, true);
				let img = reportNode.querySelector('img');
				if (img)
					img.parentNode.removeChild(img);

				let alert = reportNode.querySelector('.alert');
				if (alert)
					alert.parentNode.removeChild(alert);

				var sendScoutCallToHY = async function() {
					// assemble param string
					let params = 'scoutcall=' + encodeURIComponent(reportNode.innerHTML);
					params += `&lang=${Foxtrick.modules.ReadHtPrefs.readLanguageFromMetaTag(doc)}`;
					let ok = 'module.CopyYouth.AutoSendRejectedToHY.success';
					ok = Foxtrick.L10n.getString(ok);

					let entry = doc.getElementById('mainBody');
					let loading = Foxtrick.util.note.createLoading(doc);
					entry.insertBefore(loading, entry.firstChild);

					try {
						await Foxtrick.api.hy.postScoutCall(params);
						// eslint-disable-next-line no-magic-numbers
						module.addNode(doc, ok, 3000);
					}
					catch (rej) {
						let { text, status } = rej ||
							{ status: 0, text: `unknown error: ${typeof rej}` };

						let payload = { error: 'Unknown error' };
						try {
							if (text)
								payload = JSON.parse(text);
						}
						catch (e) {
							let msg = `[sendScoutCallToHY]: could not parse '${text}'`;
							Foxtrick.log(new Error(msg));
						}
						let { error } = payload;

						module.addNode(doc, `Error ${status}: ${error}`);
					}
					finally {
						info.dataset.ftInProgress = '0';
						entry.removeChild(loading);
					}
				};

				// only when clicking the reject btn
				if (sendToHY && typeof sendToHY == 'boolean') {
					(async () => {
						let isUser = await Foxtrick.api.hy.isHYUser();
						if (!isUser)
							return;

						Foxtrick.log('HY user, sending rejected call to HY');
						await sendScoutCallToHY();
					})().catch(Foxtrick.catch(module));
				}
				else {
					info.dataset.ftInProgress = '0';
					Foxtrick.log('Manual copy of scout call.');
					module.addNode(doc, Foxtrick.L10n.getString('copy.scoutComment.copied'));
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		let hasReport = false;
		if (Foxtrick.isPage(doc, 'youthOverview'))
			hasReport = Foxtrick.getHTModuleButton(doc, 'ucYouthScouts', 'ScoutPropYes') !== null;

		if (!Foxtrick.isPage(doc, 'youthPlayerDetails') && !hasReport)
			return;

		if (hasReport) {
			let alertdiv = Foxtrick.getHTModuleButton(doc, 'ucYouthScouts', 'ScoutPropYes').parentNode;
			let [acceptButton, rejectButton] = alertdiv.querySelectorAll('input');

			// auto send rejected players to HY, api see above
			if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'AutoSendRejectedToHY')) {
				let reject = Foxtrick.L10n.getString('module.CopyYouth.AutoSendRejectedToHY.desc');
				rejectButton.title = reject;
				Foxtrick.onClick(rejectButton, () => copyReport(true));

				// DEBUG: fake link, used to simulate sending data to HY
				// without actually rejecting the player

				// let fakeReject = doc.createElement('a');
				// fakeReject.textContent = 'Fake reject';
				// rejectButton.parentNode.appendChild(fakeReject);
				// Foxtrick.onClick(fakeReject, () => copyReport(true));
			}
			else if (alertdiv.parentNode.querySelector('a') == null &&
			         doc.getElementById('ft-copy-scout-comment-link') == null) {

				let copyLink = doc.createElement('a');
				copyLink.textContent = Foxtrick.L10n.getString('copy.scoutComment');
				copyLink.href = '#mainBody';
				copyLink.id = 'ft-copy-scout-comment-link';
				Foxtrick.onClick(copyLink, () => copyReport(false));
				alertdiv.parentNode.insertBefore(copyLink, alertdiv);
			}

			// setting the cookie in case of pull
			Foxtrick.onClick(acceptButton, () => Foxtrick.cookies.set('for_hty', { pull: true }));

			// DEBUG
			// let fakeAccept = doc.createElement('a');
			// fakeAccept.textContent = 'Fake accept';
			// acceptButton.parentNode.appendChild(fakeAccept);
			// Foxtrick.onClick(fakeAccept, () => Foxtrick.cookies.set('for_hty', { pull: true }));
		}

		// add button
		if (!doc.getElementById('ft-copy-scout-comment-button')) {
			let fired = Foxtrick.Pages.YouthPlayer.wasFired(doc);
			let isOwn = Foxtrick.Pages.All.isOwn(doc);
			if (fired || !isOwn)
				return;

			let copy = Foxtrick.L10n.getString('copy.scoutComment');
			let button = Foxtrick.util.copyButton.add(doc, copy);
			if (button) {
				button.id = 'ft-copy-scout-comment-button';
				Foxtrick.addClass(button, 'ft-copy-scout-comment');
				Foxtrick.onClick(button, () => copyReport(false));
			}
		}
	},

	/**
	 * monitor training changes and send them to HY
	 * @param {document} doc
	 */
	monitorTraining: function(doc) {
		const module = this;

		/** @param {ArrayLike<HTMLSelectElement>} training */
		var sendTrainingChangeToHY = async (training) => {
			let [primary, secondary] = Array.from(training);

			// assemble param string
			let params = 'primaryTraining=' + primary.value;
			params = params + '&secondaryTraining=' + secondary.value;
			let ok = 'module.CopyYouth.AutoSendTrainingChangesToHY.success';
			ok = Foxtrick.L10n.getString(ok);

			let entry = doc.getElementById('mainBody');
			let loading = Foxtrick.util.note.createLoading(doc);
			entry.insertBefore(loading, entry.firstChild);

			try {
				await Foxtrick.api.hy.postTrainingChange(params);
				// eslint-disable-next-line no-magic-numbers
				module.addNode(doc, ok, 3000);
			}
			catch (rej) {
				let { text, status } = rej ||
					{ status: 0, text: `unknown error: ${typeof rej}` };

				let payload = { error: 'Unknown error' };
				try {
					if (text)
						payload = JSON.parse(text);
				}
				catch (e) {
					let msg = `[sendTrainingChangeToHY]: could not parse '${text}'`;
					Foxtrick.log(new Error(msg));
				}
				let { error } = payload;

				module.addNode(doc, `Error ${status}: ${error}`);
			}
			finally {
				entry.removeChild(loading);
			}
		};

		/** @type {NodeListOf<HTMLSelectElement>} */
		var training = doc.querySelectorAll('#mainBody table.form select');
		let changeBtn = Foxtrick.getButton(doc, 'ChangeTraining');
		if (!changeBtn || training.length != 2)
			return;

		Foxtrick.onClick(changeBtn, (ev) => {
			Foxtrick.session.set('YouthClub.sendTrainingChange', true)
				.catch(Foxtrick.catch(module));
		});

		(async () => {
			let isUser = await Foxtrick.api.hy.isHYUser();
			if (!isUser)
				return;

			let send = await Foxtrick.session.get('YouthClub.sendTrainingChange');
			if (!send)
				return;

			Foxtrick.session.set('YouthClub.sendTrainingChange', false)
				.catch(Foxtrick.catch(module));

			await sendTrainingChangeToHY(training);
		})().catch(Foxtrick.catch(module));
	},

	/** @param {document} doc */
	addFixturesSource: function(doc) {
		var copySource = function() {
			var fixBr = function(text) {
				return text.replace(/<br\/?>/g, '<br />');
			};

			try {
				let html = '<html>' + doc.documentElement.innerHTML + ' </html>';
				html = fixBr(html);
				Foxtrick.copy(doc, html, 'text/html');

				// display note
				let container = doc.createElement('div');
				let p = doc.createElement('p');
				p.textContent = Foxtrick.L10n.getString('copy.fixturesSource.copied');
				container.appendChild(p);

				// README: host down
				// let linkContainer = doc.createElement('div');
				// let [start, end] = Foxtrick.L10n.getString('button.goto').split('%s');
				// linkContainer.textContent = start;

				// let url = 'http://www.ht-ys.org/read_fixtures';
				// let a = doc.createElement('a');
				// a.href = url;
				// a.target = '_ht_ys';
				// a.textContent = 'http://www.ht-ys.org';
				// linkContainer.appendChild(a);
				// linkContainer.appendChild(doc.createTextNode(end));
				// container.appendChild(linkContainer);

				Foxtrick.util.note.add(doc, container, 'ft-youthfixtures-source-copy-note');
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		let copyL10n = Foxtrick.L10n.getString('copy.fixturesSource');
		let button = Foxtrick.util.copyButton.add(doc, copyL10n);
		if (button) {
			Foxtrick.addClass(button, 'ft-copy-fixtures-source');
			Foxtrick.onClick(button, copySource);
		}
	},

	/** @param {document} doc */
	run: function(doc) {
		const module = this;

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'TrainingReport') &&
		    Foxtrick.isPage(doc, 'youthTraining'))
			module.addTrainingReport(doc);

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'AutoSendTrainingChangesToHY') &&
		    Foxtrick.isPage(doc, 'youthTraining'))
			module.monitorTraining(doc);

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'ScoutComment') &&
		    Foxtrick.isPage(doc, ['youthPlayerDetails', 'youthOverview']))
			module.addScoutComment(doc);

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'FixturesSource') &&
		    Foxtrick.isPage(doc, 'youthFixtures'))
			module.addFixturesSource(doc);

	},

	/** @param {document} doc */
	change: function(doc) {
		const module = this;

		if (Foxtrick.Prefs.isModuleOptionEnabled(module, 'ScoutComment') &&
		    Foxtrick.isPage(doc, 'youthOverview'))
			module.addScoutComment(doc);
	},
};
