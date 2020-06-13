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
	* @param {document} doc
	*/
	showReleaseModal: function(doc) {
		// TODO: this needs maintenance:
		// use release-notes-links.yml directly

		var CONTRIBUTE_URL = 'https://www.foxtrick.org/contribute';
		var CHANGES_URL = 'foxtrick://preferences.html#tab=changes';
		var UPDATES_URL = 'https://twitter.com/Foxtrick';

		var content = doc.createDocumentFragment();
		var header = doc.createElement('h2');
		header.textContent = Foxtrick.L10n.getString('changes.announcement');
		content.appendChild(header);
		header = doc.createElement('h3');
		header.textContent = Foxtrick.L10n.getString('changes.newVersion');
		content.appendChild(header);

		var pSupport = doc.createElement('p');
		Foxtrick.L10n.appendLink('changes.support', pSupport, CONTRIBUTE_URL);
		content.appendChild(pSupport);

		var link = doc.createElement('a');
		link.href = CHANGES_URL;
		link.textContent = Foxtrick.L10n.getString('changes.open');
		link.target = '_blank';
		content.appendChild(link);

		var pUpdates = doc.createElement('p');
		Foxtrick.L10n.appendLink('changes.updates', pUpdates, UPDATES_URL);
		content.appendChild(pUpdates);

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
			let weekMatch = online.textContent.trim().match(/\d+$/);
			if (weekMatch) {
				let [weekStr] = weekMatch;
				week = parseInt(weekStr, 10);
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
	 * Adds a link to send Foxtrick log to pastebin
	 * @param {document} doc
	 */
	addBugReportLink: function(doc) {
		var CORE = this;

		var bottom = doc.getElementById('bottom');
		if (!bottom)
			return;

		var reportBug = function(log) {
			const BUG_TITLE_TMPL = 'Bug {nonce} by {team} ({id})';

			if (log === '')
				return;

			let info;
			{
				let team = CORE.TEAM.teamName;
				let id = CORE.TEAM.teamId;
				let nonce = Math.random().toString(16).slice(2).toUpperCase();
				info = { nonce, team, id };
			}
			var title = Foxtrick.format(BUG_TITLE_TMPL, info);
			var bug = log + '\n\n\n' + Foxtrick.Prefs.save({ notes: true, skipFiles: true });

			// add a somewhat sane limit of 200K
			const Ki = 1024, KB = 200, MAX_LENGTH = KB * Ki;

			if (bug.length > MAX_LENGTH)
				bug = bug.slice(bug.length - MAX_LENGTH);

			let url = new URL(doc.URL);
			let href = `${url.pathname}?${url.searchParams.toString()}`;
			bug = Foxtrick.log.header(doc) + 'BUG URL: ' + href + '\n\n' + bug;

			var showNote = function(url) {
				const MANUAL_URL = 'https://pastebin.com/';
				const FORUM_URL = '/Forum/Overview.aspx?v=0&f=173635';

				var info = doc.createDocumentFragment();

				if (/^https?:/.test(url)) {
					// upload successful
					Foxtrick.copy(doc, '[link=' + url + ']');
					let upload = doc.createElement('p');
					upload.textContent = Foxtrick.L10n.getString('reportBug.link.copied');
					info.appendChild(upload);

					let captcha = doc.createElement('p');
					Foxtrick.L10n.appendLink('reportBug.captcha', captcha, url);
					info.appendChild(captcha);
				}
				else {
					// too many pastes
					Foxtrick.copy(doc, bug);
					let copied = doc.createElement('p');
					copied.textContent = Foxtrick.L10n.getString('reportBug.log.copied');
					info.appendChild(copied);

					let pastebin = doc.createElement('p');
					Foxtrick.L10n.appendLink('reportBug.pastebin', pastebin, MANUAL_URL);
					info.appendChild(pastebin);
				}

				let forum = doc.createElement('p');
				Foxtrick.L10n.appendLink('reportBug.forum', forum, FORUM_URL);
				info.appendChild(forum);

				const NOTE_ID = 'ft-bug-report-link-note';
				Foxtrick.util.note.add(doc, info, NOTE_ID, { closable: false, focus: true });
			};

			Foxtrick.api.pastebin.paste(showNote, title, bug, 'unlisted');
		};

		var reportBugSpan = doc.createElement('span');
		reportBugSpan.id = 'ft_report_bug';
		reportBugSpan.textContent = Foxtrick.L10n.getString('reportBug.title');

		let title = Foxtrick.L10n.getString('reportBug.desc');
		reportBugSpan.setAttribute('aria-label', reportBugSpan.title = title);

		Foxtrick.onClick(reportBugSpan, function() {
			Foxtrick.SB.ext.sendRequest({ req: 'getDebugLog' }, ({ log }) => {
				reportBug(log);
			});
		});

		bottom.insertBefore(reportBugSpan, bottom.firstChild);
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
