/**
 * team-popup-links.js
 * Foxtrick show Team Popup
 * @author bummerland, convinced, ryanli
 */

'use strict';

Foxtrick.modules['TeamPopupLinks'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	OUTSIDE_MAINBODY: true,
	PAGES: ['all'],
	NICE: 10, // after anythings that works on team/manager links
	// but before staff-marker
	CSS: Foxtrick.InternalPath + 'resources/css/popup-links.css',

	OPTIONS: ['TeamHighlight', 'TeamLinks', 'UserLinks', 'CustomLink'],
	OPTION_TEXTS: true,
	OPTION_TEXTS_DISABLED_LIST: [true, true, true, false],

	LINKS: {
		Team: {
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_team=true',
		},
		Manager: {
			linkByTeam: '/Club/Manager/?teamId=[teamid]',
		},
		Matches: {
			ownLink: '/Club/Matches/',
			linkByTeam: '/Club/Matches/?teamId=[teamid]',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_matches=true',
		},
		Players: {
			ownLink: '/Club/Players/',
			linkByTeam: '/Club/Players/?teamId=[teamid]',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_players=true',
		},
		Series: {
			linkByTeam: '/Club/Manager/?teamId=[teamid]&redir_to_series=true',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_series=true',
		},
		last_5_ips: {
			linkByTeam: '/Club/Manager/?teamId=[teamid]&ShowOldConnections=true',
			linkByUser: '/Club/Manager/?userId=[userid]&ShowOldConnections=true',
		},
		Guestbook: {
			linkByTeam: '/Club/Manager/Guestbook.aspx?teamId=[teamid]',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_guestbook=true',
		},
		SendMessage: {
			linkByTeam: '/Club/?teamId=[teamid]&redir_to_mail=true',
			linkByUser: '/MyHattrick/Inbox/?actionType=newMail&userId=[userid]',
		},
		Challenge: {
			linkByTeam: '/Club/?teamId=[teamid]&make_challenge',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_challenge=true',
		},
		Achievements: {
			linkByTeam: '/Club/Manager/?teamId=[teamid]&redir_to_achievements=true',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_achievements=true',
		},
		Coach: {
			ownLink: '/Club/Training/?redir_to_coach=true',
			linkByTeam: '/Club/Players/?teamId=[teamid]&redir_to_coach=true',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_coach=true',
		},
		TeamAnalysis: {
			ownLink: '/Club/TacticsRoom/',
			linkByTeam: '/Club/TacticsRoom/?teamId=[teamid]',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_analysis=true',
		},
		TransferHistory: {
			linkByTeam: '/Club/Transfers/transfersTeam.aspx?teamId=[teamid]',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_transferhistory=true',
		},
		TeamHistory: {
			linkByTeam: '/Club/History/?teamId=[teamid]',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_teamhistory=true',
		},
		FlagCollection: {
			linkByTeam: '/Club/Flags/?teamId=[teamid]',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_flags=true',
		},
		LastLineup: {
			linkByTeam: '/Club/Matches/MatchLineup.aspx?teamId=[teamid]' +
				'&useArchive=True&redir_to_newlineup=true',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_lastlineup=true',
		},
		NextMatch: {
			linkByTeam: '/Club/Matches/?teamId=[teamid]&redir_to_nextmatch=true',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_nextmatch=true',
		},
		AddNextMatch: {
			linkByTeam: '/Club/Matches/?teamId=[teamid]&redir_to_addnextmatch=true',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_addnextmatch=true',
		},
		YouthMatches: {
			linkByTeam: '/Club/Matches/?teamId=[teamid]&redir_to_youthmatches=true',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_youthmatches=true',
		},
		Tournaments: {
			linkByTeam: '/Community/Tournaments/?teamId=[teamid]',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_tournaments=true',
		},
	},

	OPTION_FUNC: function(doc) {
		var table = doc.createElement('table');
		table.className = 'bordered center';

		var caption = doc.createElement('caption');
		caption.setAttribute('data-text', 'TeamPopupLinks.prefsCaption');
		table.appendChild(caption);

		var headerRow = doc.createElement('tr');
		table.appendChild(headerRow);

		var placeHolder = doc.createElement('th');
		headerRow.appendChild(placeHolder);
		var enableDefault = doc.createElement('th');
		enableDefault.setAttribute('data-text', 'TeamPopupLinks.ShowByDefault');
		headerRow.appendChild(enableDefault);
		var enableMore = doc.createElement('th');
		enableMore.setAttribute('data-text', 'TeamPopupLinks.ShowOnMore');
		headerRow.appendChild(enableMore);
		var enableNewTab = doc.createElement('th');
		enableNewTab.setAttribute('data-text', 'TeamPopupLinks.OpenNewTab');
		headerRow.appendChild(enableNewTab);

		var i;
		for (i in this.LINKS) {
			var row = doc.createElement('tr');
			table.appendChild(row);

			var title = doc.createElement('th');
			title.textContent = Foxtrick.Prefs.getModuleElementDescription('TeamPopupLinks', i);
			row.appendChild(title);

			var defaultCell = doc.createElement('td');
			row.appendChild(defaultCell);
			var defaultCheck = doc.createElement('input');
			defaultCheck.type = 'checkbox';
			defaultCheck.setAttribute('pref', 'module.TeamPopupLinks.' + i + '.default');
			defaultCell.appendChild(defaultCheck);

			var moreCell = doc.createElement('td');
			row.appendChild(moreCell);
			var moreCheck = doc.createElement('input');
			moreCheck.type = 'checkbox';
			moreCheck.setAttribute('pref', 'module.TeamPopupLinks.' + i + '.more');
			moreCell.appendChild(moreCheck);

			var newTab = doc.createElement('td');
			row.appendChild(newTab);
			var newTabCheck = doc.createElement('input');
			newTabCheck.type = 'checkbox';
			newTabCheck.setAttribute('pref', 'module.TeamPopupLinks.' + i + '.newTab');
			newTab.appendChild(newTabCheck);
		}

		return table;
	},

	run: function(doc) {
		const module = this;

		// show last 5 logins
		if (/ShowOldConnections=true/i.test(doc.URL)) {
			let a = Foxtrick.getMBElement(doc, 'lnkShowLogins');
			a && a.click();
		}

		module.addPopupLinks(doc);
	},

	/* eslint-disable complexity */
	addPopupLinks: function(doc) {
		const module = this;
		const MODULE_NAME = module.MODULE_NAME;

		const TEAM_RE = /Club\/(Default\.aspx)?\?TeamID=/i;
		const MANAGER_RE = /Club\/Manager\/(Default\.aspx)?\?UserID=/i;
		const FORUM_RE = /Forum\/(Default\.aspx)?\?/i;
		const TEAM_ID_TAG = /\[teamid\]/i;
		const USER_ID_TAG = /\[userid\]/i;
		const USER_NAME_TAG = /\[username\]/i;
		const REDIR_RE = /redir_to/i;

		var teamEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'TeamLinks');
		var userEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'UserLinks');
		var highlightEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'TeamHighlight');
		var customEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'CustomLink');

		var mainBody = doc.getElementById('mainBody');

		var sUrl = doc.URL;
		var ownTeamId = Foxtrick.util.id.getOwnTeamId();
		var curTeamId = Foxtrick.Pages.All.getTeamId(doc);
		var hasScroll = Foxtrick.util.layout.mainBodyHasScroll(doc);
		var links = this.LINKS;

		var addSpan = function(aLink) {
			if (Foxtrick.hasClass(aLink, 'ft-tpl') ||
			    Foxtrick.hasClass(aLink, 'ft-popup-list-link'))
				return;

			var url = aLink.href;
			var parent = aLink.parentNode;
			var grandParent = parent.parentNode;

			if (TEAM_RE.test(url) && !REDIR_RE.test(url) && teamEnabled ||
			    MANAGER_RE.test(url) && userEnabled) {

				var span = Foxtrick.createFeaturedElement(doc, module, 'span');
				span.className = 'ft-popup-span';

				if (highlightEnabled && TEAM_RE.test(url) &&
					curTeamId == parseInt(Foxtrick.getUrlParam(url, 'TeamID'), 10)) {

					if (parent.nodeName == 'TD')
						Foxtrick.addClass(grandParent, 'ftTeamHighlight');
					else if (grandParent.nodeName == 'TD')
						Foxtrick.addClass(grandParent.parentNode, 'ftTeamHighlight');
				}

				const pages = ['forumViewThread', 'forumWritePost', 'forumModWritePost', 'region'];
				if (!Foxtrick.isPage(doc, pages) &&
					(Foxtrick.util.layout.isStandard(doc) || parent.nodeName != 'TD')) {
					// Foxtrick.addClass(aLink, 'ft-nowrap');
					Foxtrick.addClass(aLink, 'ft-tpl');
				}
				else {
					Foxtrick.addClass(aLink, 'ft-tpl');
				}

				parent.insertBefore(span, aLink);

				// to show a pop-up!
				var showPopup = function(ev) {
					var findLink = function(node) {
						if (node.nodeName == 'A' && !Foxtrick.hasClass(node, 'ft-no-popup'))
							return node;

						if (!node.parentNode)
							return null;

						return findLink(node.parentNode);
					};

					// need to find <a> recursively as <a> may have children
					// like <bdo>
					var orgLink = findLink(ev.target);
					if (orgLink == null)
						return; // no link found

					var showMore = false;
					if (orgLink.getAttribute('more')) {
						if (orgLink.getAttribute('more') == 'true')
							showMore = true;

						orgLink = orgLink.parentNode.parentNode.previousSibling;
					}

					var teamId = Foxtrick.util.id.getTeamIdFromUrl(orgLink.href);
					if (teamId) {
						// eslint-disable-next-line no-unused-vars
						let teamName = orgLink.textContent; // lgtm[js/unused-local-variable]
					}

					var userName;
					var userId = Foxtrick.util.id.getUserIdFromUrl(orgLink.href);
					if (userId) {
						let linkName = orgLink.textContent.trim();
						let titleName = orgLink.title.trim();
						if (titleName.slice(0, linkName.length) === linkName) {
							// link name seems to be shortened for long user names
							// using titleName instead if it's a superstring
							userName = titleName;
						}
						else {
							userName = linkName;
						}
					}

					var ownTopTeamLinks = orgLink.parentNode.parentNode.nodeName == 'DIV' &&
						orgLink.parentNode.parentNode.id == 'teamLinks';

					var list = Foxtrick.createFeaturedElement(doc, module, 'ul');
					list.className = 'ft-popup-list';

					var addItem = function(key, isOwnTeam, teamId, userId, userName, ownLink,
					                       linkByTeam, linkByUser, linkByUserName) {

						var item = doc.createElement('li');
						var link = doc.createElement('a');
						link.className = 'ft-popup-list-link';

						var user = userName;
						if (user && userId && userId == user.match(/\d+/))
							user = '';

						if (isOwnTeam && ownLink)
							link.href = ownLink;
						else if (teamId && linkByTeam)
							link.href = linkByTeam.replace(TEAM_ID_TAG, teamId);
						else if (user && linkByUserName)
							link.href = linkByUserName.replace(USER_NAME_TAG, user);
						else if (userId && linkByUser)
							link.href = linkByUser.replace(USER_ID_TAG, userId);
						else
							return;

						var openInNewTab = function(option) {
							let key = `module.${MODULE_NAME}.${option}.newTab`;
							return Foxtrick.Prefs.getBool(key);
						};

						if (openInNewTab(key))
							link.target = '_blank';

						link.textContent = Foxtrick.L10n.getString(key);
						item.appendChild(link);
						list.appendChild(item);
					};

					var isEnabledWithinContext = function(option, more) {
						let key = `module.${MODULE_NAME}.${option}.${more ? 'more' : 'default'}`;
						return Foxtrick.Prefs.getBool(key);
					};

					var showLessMore = false;

					if (ownTopTeamLinks) {
						// own team's link at the top of the page
						for (let link of ['Matches', 'Players']) {
							let def = links[link];
							if (!def)
								continue;

							let ownLink = def.ownLink;
							addItem(link, true, null, null, null, ownLink, null, null, null);
						}
					}
					else {
						for (let link in links) {
							if (isEnabledWithinContext(link, showMore)) {
								let def = links[link];
								let own = teamId == ownTeamId;
								addItem(link, own, teamId, userId, userName, def.ownLink,
								        def.linkByTeam, def.linkByUser, def.linkByUserName);
							}
							else if (isEnabledWithinContext(link, !showMore)) {
								showLessMore = true;
							}
						}

						if (customEnabled) {
							let customLinkText =
								Foxtrick.Prefs.getString(`module.${MODULE_NAME}.CustomLink_text`);

							if (typeof customLinkText === 'string') {
								let ownLinks = customLinkText.split(/\n/);
								for (let ownLink of ownLinks) {
									try {
										let redirToCustom = false;
										let json = JSON.parse(ownLink);

										if (showMore != json.more) {
											showLessMore = true;
											continue;
										}

										let item = doc.createElement('li');
										let link = doc.createElement('a');
										link.href = Foxtrick.util.sanitize.parseUrl(json.link);
										link.title = json.title;
										link.textContent = json.title;

										if (TEAM_ID_TAG.test(link.href)) {
											if (teamId)
												link.href = link.href.replace(TEAM_ID_TAG, teamId);
											else
												redirToCustom = true;
										}

										if (USER_ID_TAG.test(link.href)) {
											if (userId)
												link.href = link.href.replace(USER_ID_TAG, userId);
											else
												redirToCustom = true;
										}

										if (redirToCustom) {
											if (teamId == null) {
												link.href = '/Club/Manager/?userId=' + userId +
													'&redir_to_custom=true&redir_to=' + link.href;
											}
											else {
												link.href = '/Club/Manager/?teamId=' + teamId +
													'&redir_to_custom=true&redir_to=' + link.href;
											}
										}
										if (json.newTab)
											link.target = '_blank';

										item.appendChild(link);
										list.appendChild(item);
									}
									catch (e) {
										Foxtrick.log('custom teampopup error:', e);
									}
								}
							}
						}

						if (showLessMore) {
							let item = doc.createElement('li');
							let link = doc.createElement('a');
							if (showMore) {
								link.setAttribute('more', 'false');
								link.textContent = Foxtrick.L10n.getString('less');
							}
							else {
								link.setAttribute('more', 'true');
								link.textContent = Foxtrick.L10n.getString('more');
							}
							Foxtrick.onClick(link, showPopup);
							item.appendChild(link);
							list.appendChild(item);
						}

					}

					var down = false;

					let pos = Foxtrick.getElementPosition(orgLink, mainBody);
					var pT = pos.top;
					if (hasScroll && pT - mainBody.scrollTop < mainBody.offsetHeight / 2 ||
					    pT - doc.body.scrollTop < 300 || !mainBody) { // = popdown

						if (list.lastChild) {
							let more = list.removeChild(list.lastChild);
							list.insertBefore(more, list.firstChild);
						}

						down = true;
					}

					Foxtrick.addClass(list, 'ft-popup-list-' + (down ? 'down' : 'up'));

					let parentTPL = orgLink.parentNode.querySelector('.ft-popup-list');
					if (parentTPL)
						parentTPL.remove();

					Foxtrick.insertAfter(list, orgLink);
				};
				Foxtrick.listen(aLink, 'mouseover', showPopup, false);
				span.appendChild(aLink);
			}
		};

		// team links
		var link = doc.querySelector('#teamLinks a');
		if (link)
			addSpan(link);

		// all in mainWrapper (ie. not left boxes)
		if (FORUM_RE.test(sUrl))
			return; // not in forum overview

		if (mainBody) {
			let aLinks = mainBody.querySelectorAll('a');
			for (let aLink of aLinks) {
				if (!aLink.hasAttribute('href') ||
				    Foxtrick.hasClass(aLink, 'ft-no-popup') ||
				    aLink.parentNode.className == 'liveTabText' ||
				    aLink.querySelector('img:not(.ft-staff-icon)') !== null)
					continue; // don't add to buttons, and htlive tabs

				addSpan(aLink);
			}
		}

		var sidebar = doc.getElementById('sidebar');
		if (sidebar) {
			let aLinks = sidebar.querySelectorAll('a');
			for (let aLink of aLinks) {
				if (!aLink.hasAttribute('href') ||
				    aLink.querySelector('img:not(.ft-staff-icon)') !== null)
					continue; // don't add to buttons

				addSpan(aLink);
			}
		}
	},

	change: function(doc) {
		this.addPopupLinks(doc);
	},
};
