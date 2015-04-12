'use strict';
/**
* core.js
* Some core functions for FoxTrick
* @author ryanli
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
	HT_TIME: 0,

	run: function(doc) {
		this.parseSelfTeamInfo(doc);
		if (Foxtrick.isPage(doc, 'allPlayers') || Foxtrick.isPage(doc, 'youthPlayers'))
			this.parsePlayerList(doc);
		if (Foxtrick.isPage(doc, 'matchOrder'))
			Foxtrick.util.inject.jsLink(doc, Foxtrick.InternalPath +
			                            'resources/js/matchOrderData.js');
		this.updateLastHost(doc);
		this.showVersion(doc);
		this.featureHighlight(doc);
		this.showChangeLog(doc);
		this.HT_TIME = Foxtrick.util.time.getHtTimeStamp(doc);
		this.addBugReportLink(doc);
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

		Foxtrick.makeModal(doc, Foxtrick.version(), content);
	},

	updateLastHost: function(doc) {
		// update Foxtrick.lastHost, which is used when opening links
		// from browser chrome
		Foxtrick.setLastHost(doc.location.protocol + '//' + doc.location.hostname);
		Foxtrick.setLastPage(doc.location.href);
	},

	showChangeLog: function(doc) {
		try {
			// show change log if anything but forth number changes
			if (Foxtrick.Prefs.getString('oldVersion') === null ||
			    Foxtrick.Prefs.getString('oldVersion').match(/\d+\.\d+(\.\d+)?/)[0] !==
			    Foxtrick.version().match(/\d+\.\d+(\.\d+)?/)[0]) {
				if (Foxtrick.Prefs.getBool('showReleaseNotes')) {
					Foxtrick.Prefs.show('#tab=changes');
				}
				this.showReleaseModal(doc);
				Foxtrick.Prefs.setString('oldVersion', Foxtrick.version());
			}
		}
		catch (e) {
			// catching very old 'wrong' formats and fix them by just using the upto date version
			Foxtrick.Prefs.setString('oldVersion', Foxtrick.version());
		}
	},

	showVersion: function(doc) {
		// show version number on the bottom of the page
		var bottom = doc.getElementById('bottom');
		if (bottom) { // sometimes bottom is not loaded yet. just skip it in those cases
			var server = bottom.getElementsByClassName('currentServer')[0];
			var span = doc.createElement('span');
			span.textContent += ' / FoxTrick ' + Foxtrick.version() + ' ' + Foxtrick.branch();
			span.id = 'ft_versionInfo';
			server.appendChild(span);
		}
		else Foxtrick.log('bottom not loaded yet');
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
		var CORE = this;

		var processShortName = function(name) {
			if (doc.querySelector('.ongoingEvents a[href*="/Club/Matches/Live.aspx"]')) {
				name = CORE.TEAM.teamName;
				Foxtrick.log('Short team name found!', name);
				// move away from localStore
				Foxtrick.localSet('shortTeamName.' + CORE.TEAM.teamId, null);
				Foxtrick.Prefs.setString('shortTeamName.' + CORE.TEAM.teamId, name);
			}
			if (name)
				CORE.TEAM.shortTeamName = name;
		};

		var teamLinks = doc.getElementById('teamLinks');
		if (teamLinks && teamLinks.getElementsByTagName('a').length > 0) {
			CORE.TEAM = {
				teamId: Foxtrick.util.id.findTeamId(teamLinks),
				leagueId: Foxtrick.util.id.findLeagueId(teamLinks),
				teamName: Foxtrick.util.id.extractTeamName(teamLinks),
				seriesId: Foxtrick.util.id.findLeagueLeveUnitId(teamLinks),
			};
			var teamId = CORE.TEAM.teamId;
			var shortName = Foxtrick.Prefs.getString('shortTeamName.' + teamId);
			if (shortName !== null) {
				processShortName(shortName);
			}
			else {
				Foxtrick.localGet('shortTeamName.' + teamId, processShortName);
			}

			Foxtrick.ht_pages['ownPlayers'] =
				Foxtrick.ht_pages['ownPlayersTemplate'].replace(/\[id\]/g, teamId);
			Foxtrick.addClass(doc.body, 'ft-teamID-' + teamId);
		}

		var subMenu = doc.getElementsByClassName('subMenu')[0];
		if (subMenu) {
			if (!CORE.TEAM.youthTeamId) {
				var leftMenuTeamId = Foxtrick.util.id.findTeamId(subMenu);
				if (CORE.TEAM.teamId == leftMenuTeamId) {
					var youthId = Foxtrick.util.id.findYouthTeamId(subMenu);
					CORE.TEAM.youthTeamId = youthId;
					Foxtrick.ht_pages['ownYouthPlayers'] =
						Foxtrick.ht_pages['ownYouthPlayersTemplate'].replace(/\[id\]/g, youthId);

					var ntTeamLink = subMenu.querySelector('a[href^="/Club/NationalTeam/"]');
					if (ntTeamLink) {
						// NT coach
						var ntId = Foxtrick.util.id.getTeamIdFromUrl(ntTeamLink.href);
						if (ntId) {
							Foxtrick.ht_pages['ownPlayers'] =
								Foxtrick.ht_pages['ownPlayers'].replace(/\[ntid\]/g, ntId);
						}
					}
				}
			}
		}
	},

	/**
	 * Adds a link to send Foxtrick log to pastebin
	 * @param {document} doc
	 */
	addBugReportLink: function(doc) {
		var CORE = this;
		var bottom = doc.getElementById('bottom');
		if (bottom) {

			var reportBug = function(log) {
				if (log === '')
					return;

				var team = CORE.TEAM.teamName;
				var id = CORE.TEAM.teamId;
				var url = doc.location.pathname + doc.location.search;
				var nonce = Math.random().toString(16).substr(2).toUpperCase();

				var title = 'Bug ' + nonce + ' by ' + team + ' (' + id + ')';
				var prefs = Foxtrick.Prefs.save({ notes: true, skipFiles: true });
				var bug = log + '\n\n\n' + prefs;
				// add a somewhat sane limit of 200K
				var MAX_LENGTH = 200 * 1024;
				if (bug.length > MAX_LENGTH)
					bug = bug.substr(bug.length - MAX_LENGTH);

				bug = Foxtrick.log.header(doc) + 'BUG URL: ' + url + '\n\n' + bug;

				var showNote = function(url) {
					var MANUAL_URL = 'http://pastebin.com/';
					var FORUM_URL = '/Forum/Overview.aspx?v=0&f=173635';

					var info = doc.createDocumentFragment();

					if (/^https?:/.test(url)) {
						// upload successful
						Foxtrick.copyStringToClipboard('[link=' + url + ']');
						var upload = doc.createElement('p');
						upload.textContent = Foxtrick.L10n.getString('reportBug.link.copied');
						info.appendChild(upload);

						var captcha = doc.createElement('p');
						Foxtrick.L10n.appendLink('reportBug.captcha', captcha, url);
						info.appendChild(captcha);
					}
					else {
						// too many pastes
						Foxtrick.copyStringToClipboard(bug);
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

					Foxtrick.util.note.add(doc, info, 'ft-bug-report-link-note',
					                       { closable: false, focus: true });
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
					Foxtrick.SB.ext.sendRequest({ req: 'getDebugLog' },
					  function(n) {
						reportBug(n.log);
					});
				}
				else {
					reportBug(Foxtrick.debugLogStorage);
				}
			});
			bottom.insertBefore(reportBugSpan, bottom.firstChild);
		}
	},

	parsePlayerList: function(doc) {
		this.PLAYER_LIST = Foxtrick.Pages.Players.getPlayerList(doc);
	},

	/**
	 * get playerlist in sync only once
	 * don't use in async context because
	 * data is overwritten by subsequent reloads
	 * team might change in FF!
	 * @return {Array} playerList
	 */
	getPlayerList: function() {
		return this.PLAYER_LIST;
	},

};
