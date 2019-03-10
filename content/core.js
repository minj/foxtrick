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

	TEAM: {},
	PLAYER_LIST: {},

	// UTC timestamp
	HT_TIME: 0,

	run: function(doc) {
		this.addBugReportLink(doc);

		this.monitorWeekChanges(doc);

		var UTC = Foxtrick.util.time.getUTCDate(doc);
		if (UTC) {
			this.HT_TIME = UTC.getTime();
			Foxtrick.Prefs.setString('lastTime', this.HT_TIME);
		}

		if (Foxtrick.isPage(doc, 'matchOrder')) {
			var MOData = Foxtrick.InternalPath + 'resources/js/matchOrderData.js';
			Foxtrick.util.inject.jsLink(doc, MOData);
		}

		this.parseSelfTeamInfo(doc);
		if (Foxtrick.isPage(doc, 'allPlayers') || Foxtrick.isPage(doc, 'youthPlayers'))
			this.parsePlayerList(doc);

		this.updateLastPage(doc);
		this.showVersion(doc);
		this.showChangeLog(doc);
		this.featureHighlight(doc);
	},
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

	monitorWeekChanges: function(doc) {
		try {
			var LAST_WEEK = Foxtrick.util.time.WEEKS_IN_SEASON;

			var oldWeek = Foxtrick.Prefs.getInt('oldWeek');
			var online = doc.getElementById('online');
			var week = parseInt(online.textContent.trim().match(/\d+$/), 10);

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

	updateLastPage: function(doc) {
		Foxtrick.setLastPage(doc.URL);
	},

	showChangeLog: function(doc) {
		try {
			// show change log if anything but forth number changes

			var versionRe = /\d+\.\d+(\.\d+)?/;
			var freshInstall = false;
			var br = Foxtrick.branch.slice(0, 'beta'.length);

			var newVMajor, newV = Foxtrick.version;
			var oldVMajor, oldV = Foxtrick.Prefs.getString('oldVersion');

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

				this.showReleaseModal(doc);
			}
		}
		catch (e) {
			// catching very old 'wrong' formats and fix them by just using the up to date version
			Foxtrick.Prefs.setString('oldVersion', Foxtrick.version);
		}
	},

	showVersion: function(doc) {
		// show version number on the bottom of the page
		var bottom = doc.getElementById('bottom');
		if (!bottom) {
			// sometimes bottom is not loaded yet. just skip it in those cases
			Foxtrick.log('bottom not loaded yet');
			return;
		}

		var server = bottom.querySelector('.currentServer');
		var span = doc.createElement('span');
		span.textContent += ' / Foxtrick ' + Foxtrick.version + ' ' + Foxtrick.branch;
		span.id = 'ft_versionInfo';
		server.appendChild(span);
	},

	featureHighlight: function(doc) {
		if (!Foxtrick.Prefs.getBool('featureHighlight'))
			return;

		var css =
			'[class^="ft"], [id^="ft"],' + // 'ft' at front
			'[class*=" ft"], [id*=" ft"],' + // 'ft' at start word
			'[class*="foxtrick"], [id*="foxtrick"]' + // 'foxtrick' anywhere
			'{ background-color:#66ccff !important; color:black !important; ' +
			'border: 1px solid #66ccff !important;}';

		var featureCss = doc.getElementById('ft-feature-highlight-css');

		// remove old CSS if exists
		if (featureCss) {
			featureCss.parentNode.removeChild(featureCss);
			Foxtrick.Prefs.setBool('featureHighlight', false);
		}
		else {
			// inject CSS
			Foxtrick.util.inject.css(doc, css, 'ft-feature-highlight-css');
			Foxtrick.Prefs.setBool('featureHighlight', true);
		}
		Foxtrick.modules.UI.update(doc);
	},

	parseSelfTeamInfo: function(doc) {
		var CORE = this; // jscs:ignore safeContextKeyword

		var teamLinks = doc.getElementById('teamLinks');
		if (teamLinks && teamLinks.getElementsByTagName('a').length > 0) {
			var teamLink = teamLinks.querySelector('a');

			var processShortName = function(name) {
				var n = name;
				if (doc.querySelector('.ongoingEvents a[href*="/Club/Matches/Live.aspx"]')) {
					n = teamLink.textContent;
					Foxtrick.log('Short team name found!', n);

					// move away from localStore
					Foxtrick.localSet('shortTeamName.' + CORE.TEAM.teamId, null);
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

			var teamId = CORE.TEAM.teamId;
			var shortName = Foxtrick.Prefs.getString('shortTeamName.' + teamId);
			if (shortName === null)
				Foxtrick.localGet('shortTeamName.' + teamId, processShortName);
			else
				processShortName(shortName);

			/* eslint-disable dot-notation */
			Foxtrick.htPages['ownPlayers'] =
				Foxtrick.htPages['ownPlayersTemplate'].replace(/\[id\]/g, teamId);
			/* eslint-enable dot-notation */

			Foxtrick.addClass(doc.body, 'ft-teamID-' + teamId);
		}

		var subMenu = doc.querySelector('.subMenu');
		if (!subMenu)
			return;

		var leftMenuTeamId = Foxtrick.util.id.findTeamId(subMenu);
		if (CORE.TEAM.teamId !== leftMenuTeamId)
			return;

		if (!CORE.TEAM.youthTeamId) {
			var youthId = Foxtrick.util.id.findYouthTeamId(subMenu);
			CORE.TEAM.youthTeamId = youthId;
			/* eslint-disable dot-notation */
			Foxtrick.htPages['ownYouthPlayers'] =
				Foxtrick.htPages['ownYouthPlayersTemplate'].replace(/\[id\]/g, youthId);
			/* eslint-enable dot-notation */
		}

		// NT coach
		var ntTeamLink = subMenu.querySelector('a[href^="/Club/NationalTeam/"]');
		if (!ntTeamLink)
			return;

		var ntId = Foxtrick.util.id.getTeamIdFromUrl(ntTeamLink.href);
		if (!ntId)
			return;

		/* eslint-disable dot-notation */
		Foxtrick.htPages['ownPlayers'] = Foxtrick.htPages['ownPlayers'].replace(/\[ntid\]/g, ntId);
		/* eslint-enable dot-notation */
	},

	/**
	 * Adds a link to send Foxtrick log to pastebin
	 * @param {document} doc
	 */
	addBugReportLink: function(doc) {
		var CORE = this; // jscs:ignore safeContextKeyword

		var bottom = doc.getElementById('bottom');
		if (!bottom)
			return;

		var reportBug = function(log) {
			var BUG_TITLE_TMPL = 'Bug {nonce} by {team} ({id})';

			if (log === '')
				return;

			var team = CORE.TEAM.teamName;
			var id = CORE.TEAM.teamId;
			var url = doc.location.pathname + doc.location.search;
			var nonce = Math.random().toString(16).slice(2).toUpperCase();

			var info = {
				nonce: nonce,
				team: team,
				id: id,
			};
			var title = Foxtrick.format(BUG_TITLE_TMPL, info);

			var prefs = Foxtrick.Prefs.save({ notes: true, skipFiles: true });

			var bug = log + '\n\n\n' + prefs;

			// add a somewhat sane limit of 200K
			var Ki = 1024,
				KB = 200,
				MAX_LENGTH = KB * Ki;

			if (bug.length > MAX_LENGTH)
				bug = bug.slice(bug.length - MAX_LENGTH);

			bug = Foxtrick.log.header(doc) + 'BUG URL: ' + url + '\n\n' + bug;

			var showNote = function(url) {
				var MANUAL_URL = 'http://pastebin.com/';
				var FORUM_URL = '/Forum/Overview.aspx?v=0&f=173635';

				var info = doc.createDocumentFragment();

				if (/^https?:/.test(url)) {
					// upload successful
					Foxtrick.copy(doc, '[link=' + url + ']');
					var upload = doc.createElement('p');
					upload.textContent = Foxtrick.L10n.getString('reportBug.link.copied');
					info.appendChild(upload);

					var captcha = doc.createElement('p');
					Foxtrick.L10n.appendLink('reportBug.captcha', captcha, url);
					info.appendChild(captcha);
				}
				else {
					// too many pastes
					Foxtrick.copy(doc, bug);
					var copied = doc.createElement('p');
					copied.textContent = Foxtrick.L10n.getString('reportBug.log.copied');
					info.appendChild(copied);

					var pastebin = doc.createElement('p');
					Foxtrick.L10n.appendLink('reportBug.pastebin', pastebin, MANUAL_URL);
					info.appendChild(pastebin);
				}

				var forum = doc.createElement('p');
				Foxtrick.L10n.appendLink('reportBug.forum', forum, FORUM_URL);
				info.appendChild(forum);

				var NOTE_ID = 'ft-bug-report-link-note';
				Foxtrick.util.note.add(doc, info, NOTE_ID, { closable: false, focus: true });
			};

			Foxtrick.api.pastebin.paste(showNote, title, bug, 'unlisted');
		};

		var reportBugSpan = doc.createElement('span');
		reportBugSpan.id = 'ft_report_bug';
		reportBugSpan.textContent = Foxtrick.L10n.getString('reportBug.title');
		var title = Foxtrick.L10n.getString('reportBug.desc');
		reportBugSpan.setAttribute('area-label', reportBugSpan.title = title);
		Foxtrick.onClick(reportBugSpan, function() {
			if (Foxtrick.arch === 'Sandboxed' || Foxtrick.platform == 'Android') {
				Foxtrick.SB.ext.sendRequest({ req: 'getDebugLog' }, function(r) {
					reportBug(r.log);
				});
			}
			else {
				reportBug(Foxtrick.debugLogStorage);
			}
		});
		bottom.insertBefore(reportBugSpan, bottom.firstChild);
	},

	parsePlayerList: function(doc) {
		this.PLAYER_LIST = Foxtrick.Pages.Players.getPlayerList(doc);
	},

	/**
	 * get playerlist in sync only once
	 * don't use in async context because
	 * data is overwritten by subsequent reloads
	 * team might change in FF!
	 * @return {array} playerList
	 */
	getPlayerList: function() {
		return this.PLAYER_LIST;
	},

};
