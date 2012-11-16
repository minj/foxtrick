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
		if (Foxtrick.isPage('players', doc) || Foxtrick.isPage('youthPlayers', doc))
			this.parsePlayerList(doc);
		this.updateLastHost(doc);
		this.showVersion(doc);
		this.featureHighlight(doc);
		this.showChangeLog(doc);
		this.HT_TIME = Foxtrick.util.time.getHtTimeStamp(doc);
	},

	updateLastHost: function(doc) {
		// update Foxtrick.lastHost, which is used when opening links
		// from browser chrome
		Foxtrick.setLastHost(doc.location.protocol + '//'
			+ doc.location.hostname);
		Foxtrick.setLastPage(doc.location.href);

		//cookies for partner websites
		var logout = doc.getElementById('ctl00_ctl00_CPHeader_ucMenu_hypLogout');
		Foxtrick.onClick(logout, function(ev) {
			setLoggedOutState();
		});
		var setLoggedOutState = function() {
			Foxtrick.cookieSet('for_htev', 'ht-server: www.hattrick.org');
			Foxtrick.cookieSet('for_hty', {
				'server': 'www.hattrick.org', 'c': Foxtrick.util.time.getHtTimeStamp(doc) / 1000
			});
		};
		Foxtrick.cookieSet('for_hty', {
			'server': doc.location.hostname, 'c': Foxtrick.util.time.getHtTimeStamp(doc) / 1000 },
			function(cookie) { Foxtrick.log('setting hy server cookie:', cookie);
		});
		Foxtrick.cookieSet('for_htev', 'ht-server:' + doc.location.hostname,
		  function(cookie) {
			Foxtrick.log('setting htev server cookie:', cookie);
		});
	},

	showChangeLog: function(doc) {
		try {
			// show change log if anything but forth number changes
			if (FoxtrickPrefs.getString('oldVersion') &&
			    FoxtrickPrefs.getString('oldVersion').match(/\d+\.\d+\.?\d+?/)[0] !==
			    Foxtrick.version().match(/\d+\.\d+\.?\d+?/)[0]) {
				// set showReleaseNotes true for this version to get the new  beta changes shown
				FoxtrickPrefs.setBool('showReleaseNotes', true);

				if (FoxtrickPrefs.getBool('showReleaseNotes')) {
					if (Foxtrick.platform != 'Opera')
						FoxtrickPrefs.show('#tab=changes');
					else { // opera inline version since we can't open options in opera
						var show = function(releaseNotes) {
							var changes = doc.createElement('div');
							changes.id = 'pane-changes';
							var div = doc.createElement('div');
							changes.appendChild(div);
							var label = doc.createElement('h2');
							label.textContent = 'FoxTrick ' + Foxtrick.version() + ' ' +
								Foxtrick.branch();
							div.appendChild(label);
							var label = doc.createElement('p');
							label.textContent = Foxtrickl10n.getString('releaseNotes.showFor');
							div.appendChild(label);
							var select = doc.createElement('select');
							select.id = 'pref-version-release-notes';
							div.appendChild(select);
							var div = doc.createElement('div');
							div.id = 'pref-notepad';
							changes.appendChild(div);
							var ul = doc.createElement('ul');
							ul.id = 'pref-notepad-list';
							div.appendChild(ul);

							var note = Foxtrick.util.note.create(doc, changes, false, true);
							doc.getElementById('mainBody')
								.insertBefore(note, doc.getElementById('mainBody').firstChild);

							function importContent(from, to)
							{
								for (var i = 0; i < from.childNodes.length; ++i) {
									var node = from.childNodes[i];
									if (node.nodeType == Foxtrick.NodeTypes.ELEMENT_NODE
										&& node.nodeName.toLowerCase() == 'module') {
										var link = document.createElement('a');
										link.textContent = node.textContent;
										link.href = Foxtrick.InternalPath +
											'preferences.html#module=' + link.textContent;
										to.appendChild(link);
									}
									else {
										var importedNode = document.importNode(node, true);
										to.appendChild(importedNode);
									}
								}
							}

							var notes = {};

							var parseNotes = function(xml, dest) {
								if (!xml) {
									dest = {};
									return;
								}
								var noteElements = xml.getElementsByTagName('note');
								for (var i = 0; i < noteElements.length; ++i) {
									var version = noteElements[i].getAttribute('version');
									dest[version] = noteElements[i];
								}
							};
							parseNotes(releaseNotes, notes);

							var select = doc.getElementById('pref-version-release-notes');
							for (var i in notes) {
								// unique version name
								var version = notes[i].getAttribute('version');
								if (version.search(/^\d/) == -1)
									continue;
								// don't add subversions
								if (version.search(/\d\.\d\.\d\.\d/) != -1)
									continue;
								// localized version name
								// search by:
								// 1. localized-version in localized release notes
								// 2. localized-version in master release notes
								// 3. version as fall-back
								var localizedVersion =
									(notes[version] &&
									 notes[version].getAttribute('localized-version'))
									|| version;
								var item = document.createElement('option');
								item.textContent = localizedVersion;
								item.value = version;
								select.appendChild(item);
							}

							var updateNotepad = function() {
								var version = select.options[select.selectedIndex].value;
								var list = document.getElementById('pref-notepad-list');
								list.textContent = ''; // clear list
								var note = notes[version];
								if (!note)
									return;
								var items = note.getElementsByTagName('item');
								for (var i = 0; i < items.length; ++i) {
									var item = document.createElement('li');
									list.appendChild(item);
									importContent(items[i], item);
									item.appendChild(document.createTextNode('\u00a0'));
								}
							};

							var version = Foxtrick.version();
							for (var i = 0; i < select.options.length; ++i) {
								if (select.options[i].value == version) {
									select.selectedIndex = i;
									break;
								}
							}

							updateNotepad();
							Foxtrick.listen(select, 'change', updateNotepad, false);
						};
						Foxtrick.util.load.xml(Foxtrick.InternalPath + 'release-notes.xml', show);
					}
				}
				FoxtrickPrefs.setString('oldVersion', Foxtrick.version());
			}
		} catch (e) {
			// catching very old 'wrong' formats and fix them by just using the upto date version
			FoxtrickPrefs.setString('oldVersion', Foxtrick.version());
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
		if (!FoxtrickPrefs.getBool('featureHighlight'))
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
			FoxtrickPrefs.setBool('featureHighlight', false);
		}
		else {
			// inject CSS
			Foxtrick.util.inject.css(doc, css, 'ft-feature-highlight-css');
			FoxtrickPrefs.setBool('featureHighlight', true);
		}
		Foxtrick.modules.UI.update(doc);
	},

	parseSelfTeamInfo: function(doc) {
		var teamLinks = doc.getElementById('teamLinks');
		if (teamLinks && teamLinks.getElementsByTagName('a').length > 0) {
			this.SELF_TEAM_INFO = {
				teamId: Foxtrick.util.id.findTeamId(teamLinks),
				leagueId: Foxtrick.util.id.findLeagueId(teamLinks),
				teamName: Foxtrick.util.id.extractTeamName(teamLinks)
			};
			Foxtrick.localGet('shortTeamName.' + this.SELF_TEAM_INFO.teamId,
			  function(name) {
				if (! name) {
					if (! doc.getElementById('ctl00_ctl00_ucOngoingEvents_lblOngoingEvents'))
						return;
					name = Foxtrick.modules['Core'].SELF_TEAM_INFO.teamName;
					Foxtrick.localSet('shortTeamName.' +
					                  Foxtrick.modules['Core'].SELF_TEAM_INFO.teamId, name);
				}
				Foxtrick.modules['Core'].SELF_TEAM_INFO.shortTeamName = name;
			});
			Foxtrick.ht_pages['ownPlayers'] = '/Club/Players/$|/Club/Players/default.aspx|' +
				'/Club/Players/KeyPlayers.aspx$|/Club/Players/?TeamID=' +
				this.SELF_TEAM_INFO.teamId +
				'|/Club/Players/KeyPlayers.aspx?teamId=' + this.SELF_TEAM_INFO.teamId;
				Foxtrick.ht_pages['ownKeyPlayers'] = '/Club/Players/KeyPlayers.aspx$|' +
				'/Club/Players/KeyPlayers.aspx?teamId=' + this.SELF_TEAM_INFO.teamId;
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

	parsePlayerList: function(doc) {
		this.PLAYER_LIST = Foxtrick.Pages.Players.getPlayerList(doc);
	},

	getPlayerList: function() {
		return this.PLAYER_LIST;
	},

};
