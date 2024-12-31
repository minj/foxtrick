'use strict';

/**
* core.js
* Some core functions for Foxtrick
* @author ryanli, LA-MJ
*/

Foxtrick.modules.Core = {
	CORE_MODULE: true,
	OUTSIDE_MAINBODY: true,
	PAGES: ['all'],
	NICE: -50, // before anything else
	CSS: [
		Foxtrick.InternalPath + 'resources/css/foxtrick.css',
		Foxtrick.InternalPath + 'resources/css/headercopyicons.css',
		Foxtrick.InternalPath + 'resources/css/flags.css',
	],

	/**
	 * @typedef OwnTeamInfo
	 * @prop {number} teamId
	 * @prop {number} [youthTeamId]
	 * @prop {number} leagueId
	 * @prop {number} seriesId
	 * @prop {string} teamName
	 * @prop {string} [shortTeamName]
	 */

	/**
	 * @type {OwnTeamInfo}
	 */
	// @ts-ignore
	TEAM: {},

	/**
	 * @type {Player[]}
	 */
	PLAYER_LIST: [],

	/**
	 * UTC timestamp
	 *
	 * @type {number}
	 */
	HT_TIME: 0,

	/**
	 * @param {document} doc
	 */
	run: function(doc) {
		const CORE = this;

		CORE.addBugReportLink(doc);

		CORE.monitorWeekChanges(doc);

		const UTC = Foxtrick.util.time.getUTCDate(doc);
		if (UTC) {
			CORE.HT_TIME = UTC.getTime();
			Foxtrick.Prefs.setString('lastTime', String(CORE.HT_TIME));
		}

		if (Foxtrick.isPage(doc, 'matchOrder')) {
			let MOData = Foxtrick.InternalPath + 'resources/js/matchOrderData.js';
			Foxtrick.util.inject.jsLink(doc, MOData);
		}

		CORE.parseSelfTeamInfo(doc);
		if (Foxtrick.isPage(doc, 'allPlayers') || Foxtrick.isPage(doc, 'youthPlayers'))
			CORE.parsePlayerList(doc);

		CORE.updateLastPage(doc);
		CORE.showVersion(doc);
		CORE.showChangeLog(doc);
		CORE.featureHighlight(doc);
	},

	/**
	 * test
	 * @param {Document} doc HTML document object
	 */
	showReleaseModal: function(doc) {
		// TODO: this needs maintenance:
		// use release-notes-links.yml directly

		var CONTRIBUTE_URL = 'https://www.foxtrick.org/contribute';
		var CHANGES_URL = 'https://foxtrick-ng.github.io/releasenotes.html';
		var UPDATES_URL = 'https://twitter.com/Foxtrick';

		var content = doc.createDocumentFragment();
		var header = doc.createElement('h2');
		header.textContent = Foxtrick.L10n.getString('changes.announcement');
		content.appendChild(header);
		header = doc.createElement('h3');
		header.textContent = Foxtrick.L10n.getString('changes.newVersion');
		content.appendChild(header);

		/* disable until we have a new contribute page
		var pSupport = doc.createElement('p');
		Foxtrick.L10n.appendLink('changes.support', pSupport, CONTRIBUTE_URL);
		content.appendChild(pSupport);
		*/

		var link = doc.createElement('a');
		link.href = CHANGES_URL;
		link.textContent = Foxtrick.L10n.getString('changes.open');
		link.target = '_blank';
		content.appendChild(link);

		/* disable until we decide what to replace the Twitter link with, if anything
		var pUpdates = doc.createElement('p');
		Foxtrick.L10n.appendLink('changes.updates', pUpdates, UPDATES_URL);
		content.appendChild(pUpdates);
		*/
		Foxtrick.makeModal(doc, Foxtrick.version, content);
	},

	/**
	 * @param {document} doc
	 */
	monitorWeekChanges: function(doc) {
		try {
			const LAST_WEEK = Foxtrick.util.time.WEEKS_IN_SEASON;

			let oldWeek = Foxtrick.Prefs.getInt('oldWeek');
			let online = doc.getElementById('online');

			let week;
			let fullText = online.textContent.trim().replace(/\u00a0/g, '');
			let weekMatch = fullText.match(/\d+/g);
			if (weekMatch) {
				for (let weekStr of weekMatch) {
					let match = parseInt(weekStr, 10);
					if (match > 0 && match <= Foxtrick.util.time.WEEKS_IN_SEASON) {
						week = match;
						break;
					}
				}
			}

			if (!week) {
				Foxtrick.log('WARNING: week # detection failed.', online.textContent);
				return;
			}

			if (oldWeek != week && (!oldWeek || oldWeek > week || week == LAST_WEEK)) {
				// season changes (like series) more or less happen before LAST_WEEK starts
				Foxtrick.clearCaches();
			}

			Foxtrick.Prefs.setInt('oldWeek', week);
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	/**
	 * @param {document} doc
	 */
	updateLastPage: function(doc) {
		Foxtrick.setLastPage(doc.URL);
	},

	/**
	 * @param {document} doc
	 */
	showChangeLog: function(doc) {
		const CORE = this;
		try {
			// show change log if anything but fourth number changes

			let versionRe = /^\d+\.\d+(\.\d+)?/;
			let freshInstall = false;
			let br = Foxtrick.branch.slice(0, 'beta'.length);

			let newVMajor, newV = Foxtrick.version;
			let oldVMajor, oldV = Foxtrick.Prefs.getString('oldVersion');

			if (oldV) {
				oldVMajor = oldV.match(versionRe)[0];
				newVMajor = newV.match(versionRe)[0];
			}
			else {
				freshInstall = true;
			}

			if (freshInstall || oldV !== newV && br !== 'beta' || oldVMajor !== newVMajor) {
				Foxtrick.Prefs.setString('oldVersion', newV);

				if (Foxtrick.Prefs.getBool('showReleaseNotes'))
					Foxtrick.Prefs.show('#tab=changes');

				CORE.showReleaseModal(doc);
			}
		}
		catch (e) {
			// catching very old 'wrong' formats and fix them by just using the up to date version
			Foxtrick.Prefs.setString('oldVersion', Foxtrick.version);
		}
	},

	/**
	 * show version number on the bottom of the page
	 *
	 * @param {document} doc
	 */
	showVersion: function(doc) {
		let bottom = doc.getElementById('bottom');
		if (!bottom) {
			// sometimes bottom is not loaded yet. just skip it in those cases
			Foxtrick.log('bottom not loaded yet');
			return;
		}

		let server = bottom.querySelector('.currentServer');
		let span = doc.createElement('span');
		span.textContent = ` / Foxtrick ${Foxtrick.version} ${Foxtrick.branch}`;
		span.id = 'ft_versionInfo';
		server.appendChild(span);
	},

	/**
	 * Inject CSS to highlight all elements
	 * that were added or modified (i.e. 'featured') by FT
	 *
	 * @param {document} doc
	 */
	featureHighlight: function(doc) {
		if (!Foxtrick.Prefs.getBool('featureHighlight'))
			return;

		const CSS =
			'[class^="ft"], [id^="ft"],' + // 'ft' at front
			'[class*=" ft"], [id*=" ft"],' + // 'ft' at start word
			'[class*="foxtrick"], [id*="foxtrick"]' + // 'foxtrick' anywhere
			'{ background-color:#66ccff !important; color:black !important; ' +
			'border: 1px solid #66ccff !important;}';

		// remove old CSS if exists
		let featureCss = doc.getElementById('ft-feature-highlight-css');
		if (featureCss) {
			featureCss.parentNode.removeChild(featureCss);
			Foxtrick.Prefs.setBool('featureHighlight', false);
		}
		else {
			// inject CSS
			Foxtrick.util.inject.css(doc, CSS, 'ft-feature-highlight-css');
			Foxtrick.Prefs.setBool('featureHighlight', true);
		}
		Foxtrick.modules.UI.update(doc);
	},

	/**
	 * @param {document} doc
	 */
	parseSelfTeamInfo: function(doc) {
		const CORE = this;

		var teamLinks = doc.getElementById('teamLinks');
		if (teamLinks && teamLinks.querySelectorAll('a').length > 0) {
			var teamLink = teamLinks.querySelector('a');

			/**
			 * @param {string} name
			 */
			var processShortName = function(name) {
				let n = name;
				if (doc.querySelector('.ongoingEvents a[href*="/Club/Matches/Live.aspx"]')) {
					n = teamLink.textContent;
					Foxtrick.log('Short team name found!', n);

					// move away from localStore
					Foxtrick.storage.set('shortTeamName.' + CORE.TEAM.teamId, null)
						.catch(Foxtrick.catch('CORE.processShortName'));

					Foxtrick.Prefs.setString('shortTeamName.' + CORE.TEAM.teamId, n);
				}
				if (n)
					CORE.TEAM.shortTeamName = n;
			};

			CORE.TEAM = {
				teamId: Foxtrick.util.id.getTeamIdFromUrl(teamLink.href),
				teamName: teamLink.title,
				leagueId: Foxtrick.util.id.findLeagueId(teamLinks),
				seriesId: Foxtrick.util.id.findLeagueLeveUnitId(teamLinks),
			};

			let teamId = CORE.TEAM.teamId;
			let shortName = Foxtrick.Prefs.getString('shortTeamName.' + teamId);
			if (shortName === null) {
				Foxtrick.storage.get('shortTeamName.' + teamId).then(processShortName)
				                .catch(Foxtrick.catch('CORE.processShortName'));
			}
			else {
				processShortName(shortName);
			}

			/* eslint-disable dot-notation */
			Foxtrick.htPages['ownPlayers'] =
				Foxtrick.htPages['ownPlayersTemplate'].replace(/\[id\]/g, String(teamId));
			/* eslint-enable dot-notation */

			Foxtrick.addClass(doc.body, 'ft-teamID-' + teamId);
		}

		var subMenu = doc.querySelector('.subMenu');
		if (!subMenu)
			return;

		let leftMenuTeamId = Foxtrick.util.id.findTeamId(subMenu);
		if (CORE.TEAM.teamId !== leftMenuTeamId)
			return;

		if (!CORE.TEAM.youthTeamId) {
			let youthId = Foxtrick.util.id.findYouthTeamId(subMenu);
			CORE.TEAM.youthTeamId = youthId;
			/* eslint-disable dot-notation */
			Foxtrick.htPages['ownYouthPlayers'] =
				Foxtrick.htPages['ownYouthPlayersTemplate'].replace(/\[id\]/g, String(youthId));
			/* eslint-enable dot-notation */
		}

		// NT coach
		/** @type {HTMLAnchorElement} */
		let ntTeamLink = subMenu.querySelector('a[href^="/Club/NationalTeam/"]');
		if (!ntTeamLink)
			return;

		let ntId = Foxtrick.util.id.getTeamIdFromUrl(ntTeamLink.href);
		if (!ntId)
			return;

		/* eslint-disable dot-notation */
		Foxtrick.htPages['ownPlayers'] =
			Foxtrick.htPages['ownPlayers'].replace(/\[ntid\]/g, String(ntId));
		/* eslint-enable dot-notation */
	},

	/**
	 * Adds a link to send Foxtrick log
	 * @param {document} doc
	 */
	addBugReportLink: function(doc) {
		const NOTE_ID = 'ft-bug-report-confirm';
		const BUG_DATA_URL = 'https://foxtrick-ng.github.io/datacollection.html';

		var bottom = doc.getElementById('bottom');
		if (!bottom)
			return;

		var reportBugSpan = doc.createElement('span');
		reportBugSpan.id = 'ft_report_bug';
		reportBugSpan.textContent = Foxtrick.L10n.getString('reportBug.title');

		let title = Foxtrick.L10n.getString('reportBug.descNew');
		reportBugSpan.setAttribute('aria-label', reportBugSpan.title = title);

		var hideNote = function() {
			doc.getElementById(NOTE_ID).remove();
		};

		Foxtrick.onClick(reportBugSpan, function() {
			var info = doc.createDocumentFragment();

			let sorry = doc.createElement('p');
			sorry.textContent = Foxtrick.L10n.getString('reportBug.sorry');
			info.appendChild(sorry);

			let data = doc.createElement('p');
			Foxtrick.L10n.appendLink('reportBug.error.data', data, BUG_DATA_URL);
			info.appendChild(data);

			let report = doc.createElement('button');
			report.type = 'button';
			report.textContent = Foxtrick.L10n.getString('reportBug.now');
			Foxtrick.onClick(report, function() {
				// eslint-disable-next-line no-invalid-this
				let doc = this.ownerDocument;
				hideNote();
				Foxtrick.modules.Core.reportBug(doc);
			});
			info.appendChild(report);

			Foxtrick.util.note.add(doc, info, NOTE_ID, { closable: true, focus: true });
		});

		bottom.insertBefore(reportBugSpan, bottom.firstChild);
	},

	/**
	 * @param {document} doc
	 */
	reportBug: function(doc) {
		var reportBug = function(log) {
			if (log === '')
				return;


			// set to 50K for free exceptionless.io
			const Ki = 1024, KB = 50, MAX_LENGTH = KB * Ki;

			var bug = log;
			if (bug.length > MAX_LENGTH)
				bug = bug.slice(bug.length - MAX_LENGTH);

			let url = new URL(doc.URL);
			let href = `${url.pathname}?${url.searchParams.toString()}`;
			let header = 'BUG URL: ' + href;

			var prefs = Foxtrick.Prefs.save({ notes: true, skipFiles: true });

			var showNote = function(refId) {
				const FORUM_URL = '/Forum/Overview.aspx?v=0&f=173635';

				Foxtrick.copy(doc, refId);

				var info = doc.createDocumentFragment();

				let success = doc.createElement('p');
				success.textContent = Foxtrick.L10n.getString('reportBug.success');
				info.appendChild(success);

				let result = doc.createElement('p');
				let ref = Foxtrick.L10n.getString('reportBug.id.copied');
				ref = ref.replace(/%s/g, String(refId));
				result.textContent = ref;
				info.appendChild(result);

				let forum = doc.createElement('p');
				Foxtrick.L10n.appendLink('reportBug.forumNew', forum, FORUM_URL);
				info.appendChild(forum);

				const NOTE_ID = 'ft-bug-report-link-note';
				Foxtrick.util.note.add(doc, info, NOTE_ID, { closable: true, focus: true });
			};

			Foxtrick.reportBug(header, bug, prefs, showNote);
		};
		Foxtrick.SB.ext.sendRequest({ req: 'getDebugLog' }, ({ log }) => {
			reportBug(log);
		});
	},

	/**
	 * @param {document} doc
	 * @param {boolean} ask
	 */
	displayErrorNotice: function(doc, ask) {
		const NOTE_ID = 'ft-bug-ask-notice';
		const BUG_DATA_URL = 'https://foxtrick-ng.github.io/datacollection.html';

		if (doc.getElementById(NOTE_ID))
			return;

		/** @type {HTMLElement} */
		var note;
		let info = doc.createDocumentFragment();

		var hideNote = function() {
			note.style.display = 'none';
		};

		let title = doc.createElement('h3');
		title.textContent = Foxtrick.L10n.getString('reportBug.error.title');
		info.appendChild(title);

		let detected = doc.createElement('p');
		detected.textContent = Foxtrick.L10n.getString('reportBug.error.detected');
		info.appendChild(detected);

		let help = doc.createElement('p');
		help.textContent = ask ?
			  Foxtrick.L10n.getString('reportBug.error.help')
			: Foxtrick.L10n.getString('reportBug.error.reported');
		info.appendChild(help);

		let data = doc.createElement('p');
		Foxtrick.L10n.appendLink('reportBug.error.data', data, BUG_DATA_URL);
		info.appendChild(data);

		if (ask) {
			let options = doc.createElement('div');
			options.style.display = 'flex';
			info.appendChild(options);

			let agree = doc.createElement('div');
			agree.style.width = '50%';
			agree.style.display = 'flex';
			agree.style.justifyContent = 'space-around';
			options.appendChild(agree);

			let disagree = doc.createElement('div');
			disagree.style.width = '50%';
			disagree.style.display = 'flex';
			disagree.style.justifyContent = 'space-around';
			options.appendChild(disagree);

			// Disabled while using free plan on exceptionless.io 
			//
			// let always = doc.createElement('button');
			// always.type = 'button';
			// always.textContent = Foxtrick.L10n.getString('reportBug.always');
			// Foxtrick.onClick(always, function() {
			// 	Foxtrick.Prefs.setString('errorReporting', 'reportAll');
			// 	let doc = note.ownerDocument;
			// 	hideNote();
			// 	Foxtrick.modules.Core.reportBug(doc);
			// });
			// agree.appendChild(always);

			let report = doc.createElement('button');
			report.type = 'button';
			report.textContent = Foxtrick.L10n.getString('reportBug.now');
			Foxtrick.onClick(report, function() {
				let doc = note.ownerDocument;
				hideNote();
				Foxtrick.modules.Core.reportBug(doc);
			});
			agree.appendChild(report);

			let ignore = doc.createElement('button');
			ignore.type = 'button';
			ignore.textContent = Foxtrick.L10n.getString('reportBug.ignore');
			Foxtrick.onClick(ignore, function() {
				hideNote();
			});
			disagree.appendChild(ignore);

			let never = doc.createElement('button');
			never.type = 'button';
			never.textContent = Foxtrick.L10n.getString('reportBug.never');
			Foxtrick.onClick(never, function() {
				Foxtrick.Prefs.setString('errorReporting', 'ignoreAll');
				hideNote();
			});
			disagree.appendChild(never);
		}

		let opts = { closable: !ask, focus: ask };
		if (!ask)
			opts.timeout = 5000;

		note = Foxtrick.util.note.add(doc, info, NOTE_ID, opts);
	},

	/**
	 * @param {document} doc
	 */
	parsePlayerList: function(doc) {
		this.PLAYER_LIST = Foxtrick.Pages.Players.getPlayerList(doc);
	},

	/**
	 * get playerlist in sync only once
	 *
	 * @return {Player[]} playerList
	 */
	getPlayerList: function() {
		return this.PLAYER_LIST;
	},

};
