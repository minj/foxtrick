'use strict';
/**
* core.js
* Some core functions for FoxTrick
* @author ryanli
*/

Foxtrick.modules['Core'] = {
	CORE_MODULE: true,
	PAGES: ['all'],
	NICE: -50, // before anything else
	CSS: [
		Foxtrick.InternalPath + 'resources/css/foxtrick.css',
		Foxtrick.InternalPath + 'resources/css/headercopyicons.css',
		Foxtrick.InternalPath + 'resources/css/flags.css',
	],

	SELF_TEAM_INFO: {},
	PLAYER_LIST: {},
	HT_TIME: 0,

	run: function(doc) {
		this.parseSelfTeamInfo(doc);
		if (Foxtrick.isPage(doc, 'players') || Foxtrick.isPage(doc, 'youthPlayers'))
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

	updateLastHost: function(doc) {
		// update Foxtrick.lastHost, which is used when opening links
		// from browser chrome
		Foxtrick.setLastHost(doc.location.protocol + '//'
			+ doc.location.hostname);
		Foxtrick.setLastPage(doc.location.href);
	},

	showChangeLog: function(doc) {
		try {
			// show change log if anything but forth number changes
			if (Foxtrick.Prefs.getString('oldVersion') === null ||
			    Foxtrick.Prefs.getString('oldVersion').match(/\d+\.\d+(\.\d+)?/)[0] !==
			    Foxtrick.version().match(/\d+\.\d+(\.\d+)?/)[0]) {
				// set showReleaseNotes true for this version to get the new  beta changes shown
				Foxtrick.Prefs.setBool('showReleaseNotes', true);

				if (Foxtrick.Prefs.getBool('showReleaseNotes')) {
					Foxtrick.Prefs.show('#tab=changes');
				}
				Foxtrick.Prefs.setString('oldVersion', Foxtrick.version());
			}
		} catch (e) {
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
		var css =	"[class^='ft'], [id^='ft']," + // 'ft' at front
					"[class*=' ft'], [id*=' ft']," + // 'ft' at start word
					"[class*='foxtrick'], [id*='foxtrick']" + // 'foxtrick' anywhere
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
		var teamLinks = doc.getElementById('teamLinks');
		if (teamLinks && teamLinks.getElementsByTagName('a').length > 0) {
			this.SELF_TEAM_INFO = {
				teamId: Foxtrick.util.id.findTeamId(teamLinks),
				leagueId: Foxtrick.util.id.findLeagueId(teamLinks),
				teamName: Foxtrick.util.id.extractTeamName(teamLinks),
				seriesId: Foxtrick.util.id.findLeagueLeveUnitId(teamLinks),
			};
			Foxtrick.localGet('shortTeamName.' + this.SELF_TEAM_INFO.teamId,
			  function(name) {
				if (doc.querySelector('.ongoingEvents a[href*="/Club/Matches/Live.aspx"]')) {
					name = Foxtrick.modules['Core'].SELF_TEAM_INFO.teamName;
					Foxtrick.localSet('shortTeamName.' +
									  Foxtrick.modules['Core'].SELF_TEAM_INFO.teamId, name);
					Foxtrick.log('Short team name found!', name);
				}
				if (name)
					Foxtrick.modules['Core'].SELF_TEAM_INFO.shortTeamName = name;
			});
			Foxtrick.ht_pages['ownPlayers'] = '/Club/Players/$|/Club/Players/default.aspx|' +
				'/Club/Players/KeyPlayers.aspx$|/Club/Players/?TeamID=' +
				this.SELF_TEAM_INFO.teamId +
				'|/Club/Players/KeyPlayers.aspx?teamId=' + this.SELF_TEAM_INFO.teamId;
			Foxtrick.ht_pages['ownKeyPlayers'] = '/Club/Players/KeyPlayers.aspx$|' +
				'/Club/Players/KeyPlayers.aspx?teamId=' + this.SELF_TEAM_INFO.teamId;
			Foxtrick.addClass(doc.body, 'ft-teamID-' + this.SELF_TEAM_INFO.teamId);
		}
		var subMenu = doc.getElementsByClassName('subMenu')[0];
		if (subMenu) {
			if (!this.SELF_TEAM_INFO.youthTeamId) {
				var leftMenuTeamId = Foxtrick.util.id.findTeamId(subMenu);
				if (this.SELF_TEAM_INFO.teamId == leftMenuTeamId) {
					this.SELF_TEAM_INFO.youthTeamId = Foxtrick.util.id.findYouthTeamId(subMenu);
					Foxtrick.ht_pages['ownYouthPlayers'] = 'YouthPlayers.aspx$|' +
						'YouthPlayers.aspx?YouthTeamID=' + this.SELF_TEAM_INFO.youthTeamId;
				}
			}
		}
	},

	getSelfTeamInfo: function() {
		return this.SELF_TEAM_INFO;
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

				var team = CORE.getSelfTeamInfo().teamName;
				var id = CORE.getSelfTeamInfo().teamId;
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
					var info = doc.createDocumentFragment();

					var text, parts, link;

					var copied;
					if (/^https?:/.test(url)) {
						// upload successful
						Foxtrick.copyStringToClipboard('[link=' + url + ']');
						copied = doc.createElement('p');
						copied.textContent = Foxtrick.L10n.getString('reportBug.link.copied');
						info.appendChild(copied);
						var captcha = doc.createElement('p');
						text = Foxtrick.L10n.getString('reportBug.captcha');
						parts = text.match(/.+?(?=\{)|\{.*?\}|.+/g);
						captcha.appendChild(doc.createTextNode(parts[0]));
						link = doc.createElement('a');
						link.href = url;
						link.target = '_blank';
						link.textContent = parts[1].replace(/[{}]/g, '');
						captcha.appendChild(link);
						captcha.appendChild(doc.createTextNode(parts[2]));
						info.appendChild(captcha);
					}
					else {
						// too many pastes
						Foxtrick.copyStringToClipboard(bug);
						copied = doc.createElement('p');
						copied.textContent = Foxtrick.L10n.getString('reportBug.log.copied');
						info.appendChild(copied);
						var pastebin = doc.createElement('p');
						text = Foxtrick.L10n.getString('reportBug.pastebin');
						parts = text.match(/.+?(?=\{)|\{.*?\}|.+/g);
						pastebin.appendChild(doc.createTextNode(parts[0]));
						link = doc.createElement('a');
						link.href = 'http://pastebin.com/';
						link.target = '_blank';
						link.textContent = parts[1].replace(/[{}]/g, '');
						pastebin.appendChild(link);
						pastebin.appendChild(doc.createTextNode(parts[2]));
						info.appendChild(pastebin);
					}

					var forum = doc.createElement('p');
					text = Foxtrick.L10n.getString('reportBug.forum');
					parts = text.match(/.+?(?=\{)|\{.*?\}|.+/g);
					forum.appendChild(doc.createTextNode(parts[0]));
					link = doc.createElement('a');
					link.href = '/Forum/Overview.aspx?v=0&f=173635';
					link.target = '_blank';
					link.textContent = parts[1].replace(/[{}]/g, '');
					forum.appendChild(link);
					forum.appendChild(doc.createTextNode(parts[2]));
					info.appendChild(forum);

					var insertBefore = doc.getElementById('testingNewHeader') ||
						doc.getElementsByTagName('h1')[1];
					Foxtrick.util.note.add(doc, insertBefore, 'ft-bug-report-link-note',
					                       info, null, true, true);
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
	 * @returns	{Array}		playerList
	 */
	getPlayerList: function() {
		return this.PLAYER_LIST;
	},

};
