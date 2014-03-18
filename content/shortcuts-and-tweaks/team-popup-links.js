'use strict';
/**
 * team-popup-links.js
 * Foxtrick show Team Popup
 * @author bummerland, convinced, ryanli
 */

Foxtrick.modules['TeamPopupLinks'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['all'],
	NICE: 10, // after anythings that works on team/manager links
	// but before staff-marker
	CSS: Foxtrick.InternalPath + 'resources/css/popup-links.css',

	OPTIONS: ['TeamHighlight', 'TeamLinks', 'UserLinks', 'CustomLink'],
	OPTION_TEXTS: true,
	OPTION_TEXTS_DISABLED_LIST: [true, true, true, false],

	LINKS: {
		'Team': {
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_team=true'
		},
		'Manager': {
			linkByTeam: '/Club/Manager/?teamId=[teamid]'
		},
		'Matches': {
			ownLink: '/Club/Matches/',
			linkByTeam: '/Club/Matches/?TeamID=[teamid]',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_matches=true'
		},
		'Players': {
			ownLink: '/Club/Players/',
			linkByTeam: '/Club/Players/?TeamID=[teamid]',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_players=true'
		},
		'last_5_ips': {
			linkByTeam: '/Club/Manager/?teamId=[teamid]&ShowOldConnections=true',
			linkByUser: '/Club/Manager/?userId=[userid]&ShowOldConnections=true'
		},
		'Guestbook': {
			linkByTeam: '/Club/Manager/Guestbook.aspx?teamid=[teamid]',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_guestbook=true'
		},
		'SendMessage': {
			linkByTeam: '/Club/?TeamID=[teamid]&redir_to_mail=true',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_mail=true',
			linkByUserName: '/MyHattrick/Inbox/?actionType=newMail&alias=[username]'
		},
		'Challenge': {
			linkByTeam: '/Club/Challenges/?make_challenge=[teamid]',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_challenge=true'
		},
		'Achievements': {
			linkByTeam: '/Club/Manager/?teamId=[teamid]&redir_to_achievements=true',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_achievements=true'
		},
		'Coach': {
			ownLink: '/Club/Training/?redir_to_coach=true',
			linkByTeam: '/Club/Players/?TeamID=[teamid]&redir_to_coach=true',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_coach=true'
		},
		'TransferHistory': {
			linkByTeam: '/Club/Transfers/transfersTeam.aspx?teamId=[teamid]',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_transferhistory=true'
		},
		'TeamHistory': {
			linkByTeam: '/Club/History/?teamId=[teamid]',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_teamhistory=true'
		},
		'FlagCollection': {
			linkByTeam: '/Club/Flags/?teamId=[teamid]',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_flags=true'
		},
		'LastLineup': {
			linkByTeam: '/Club/Matches/MatchLineup.aspx?TeamID=[teamid]&useArchive=True',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_lastlineup=true'
		},
		'NextMatch': {
			linkByTeam: '/Club/Matches/?TeamID=[teamid]&redir_to_nextmatch=true',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_nextmatch=true'
		},
		'AddNextMatch': {
			linkByTeam: '/Club/Matches/?TeamID=[teamid]&redir_to_addnextmatch=true',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_addnextmatch=true'
		},
		'YouthMatches': {
			linkByTeam: '/Club/Matches/?TeamID=[teamid]&redir_to_youthmatches=true',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_youthmatches=true'
		},
		'Tournaments': {
			linkByTeam: '/Community/Tournaments/?teamId=[teamid]',
			linkByUser: '/Club/Manager/?userId=[userid]&redir_to_tournaments=true'
		}
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
		var sUrl = Foxtrick.getHref(doc);
		// show last 5 logins
		if (sUrl.search(/ShowOldConnections=true/i) != -1) {
			var a = doc.getElementById('ctl00_ctl00_CPContent_CPMain_lnkShowLogins');
			if (a) {
				var func = a.href;
				if (func) {
					doc.location.href = func;
				}
			}
		}
		this.add_popup_links(doc);
	},

	add_popup_links: function(doc) {
		var sUrl = Foxtrick.getHref(doc);
		var ownTeamId = Foxtrick.util.id.getOwnTeamId();
		var curTeamId = Foxtrick.Pages.All.getTeamId(doc);
		var hasScroll = Foxtrick.util.layout.mainBodyHasScroll(doc);
		var links = this.LINKS;


		var addSpan = function(aLink) {
			if (Foxtrick.hasClass(aLink.parentNode, 'ft-popup-span')
			    || Foxtrick.hasClass(aLink.parentNode.parentNode, 'ft-popup-list'))
				return;

			if ((aLink.href.search(/Club\/\?TeamID=/i) > -1 && aLink.href.search(/redir_to/i) === -1
			    && Foxtrick.Prefs.isModuleOptionEnabled('TeamPopupLinks', 'TeamLinks'))
				|| (aLink.href.search(/Club\/Manager\/\?UserID=/i) != -1
				&& Foxtrick.Prefs.isModuleOptionEnabled('TeamPopupLinks', 'UserLinks'))) {
				var par = aLink.parentNode;
				var span = Foxtrick.createFeaturedElement(doc,
				                                          Foxtrick.modules.TeamPopupLinks, 'span');
				span.className = 'ft-popup-span';
				if (Foxtrick.Prefs.isModuleOptionEnabled('TeamPopupLinks', 'TeamHighlight')
					&& aLink.href.search(/Club\/\?TeamID=/i) > -1
					&& curTeamId == aLink.href.match(/Club\/\?TeamID=(\d+)/i)[1]) {
					if (aLink.parentNode.nodeName == 'TD')
						Foxtrick.addClass(aLink.parentNode.parentNode, 'ftTeamHighlight');
					else if (aLink.parentNode.parentNode.nodeName == 'TD')
						Foxtrick.addClass(aLink.parentNode.parentNode.parentNode,
						                  'ftTeamHighlight');
				}

				if (!Foxtrick.isPage(doc, 'forumViewThread')
					&& !Foxtrick.isPage(doc, 'forumWritePost')
					&& !Foxtrick.isPage(doc, 'forumModWritePost')
					&& !Foxtrick.isPage(doc, 'region')
					&& (Foxtrick.util.layout.isStandard(doc) || aLink.parentNode.nodeName != 'TD'))
					//Foxtrick.addClass(aLink, 'ft-nowrap');
					Foxtrick.addClass(aLink, 'ft-dummy');
				else {
					Foxtrick.addClass(aLink, 'ft-dummy');
				}
				par.insertBefore(span, aLink);


				// to show a pop-up!
				var showPopup = function(ev) {
					var findLink = function(node) {
						if (node.nodeName.toLowerCase() == 'a' &&
							!Foxtrick.hasClass(node, 'ft-no-popup'))
							return node;
						if (!node.parentNode)
							return null;
						return findLink(node.parentNode);
					};
					// need to find <a> recursively as <a> may have children
					// like <bdo>
					var org_link = findLink(ev.target);
					if (org_link === null)
						return; // no link found
					var show_more = false;
					if (org_link.getAttribute('more')) {
						if (org_link.getAttribute('more') == 'true')
							show_more = true;
						org_link = org_link.parentNode.parentNode.nextSibling;
					}

					var teamid = Foxtrick.util.id.getTeamIdFromUrl(org_link.href);
					if (teamid)
						var teamname = org_link.textContent;
					var userid = Foxtrick.util.id.getUserIdFromUrl(org_link.href);
					if (userid)
						var username = org_link.textContent;

					var owntopteamlinks = (org_link.parentNode.parentNode.tagName == 'DIV'
					                       && org_link.parentNode.parentNode.id == 'teamLinks');

					var list = Foxtrick.createFeaturedElement(doc, Foxtrick.modules.TeamPopupLinks,
					                                          'ul');
					list.className = 'ft-popup-list';

					var addItem = function(key, isOwnTeam, teamId, userId, userName, ownLink,
					                       linkByTeam, linkByUser, linkByUserName) {
						var item = doc.createElement('li');
						var link = doc.createElement('a');
						if (userName && userId && userId == userName.match(/\d+/))
							userName = '';
						if (isOwnTeam && ownLink)
							link.href = ownLink;
						else if (teamId && linkByTeam)
							link.href = linkByTeam.replace(/\[teamid\]/i, teamId);
						else if (userName && linkByUserName)
							link.href = linkByUserName.replace(/\[username\]/i, userName);
						else if (userId && linkByUser)
							link.href = linkByUser.replace(/\[userid\]/i, userId);
						else
							return;

						var openInNewTab = function(option) {
							return Foxtrick.Prefs.getBool('module.TeamPopupLinks.' + option + '.' +
							                             'newTab');
						};

						if (openInNewTab(key))
							link.target = '_blank';

						link.textContent = Foxtrick.L10n.getString(key);
						item.appendChild(link);
						list.appendChild(item);
					};

					var isEnabledWithinContext = function(option, more) {
						return Foxtrick.Prefs.getBool('module.TeamPopupLinks.' + option + '.' +
						                             (more ? 'more' : 'default'));
					};

					var show_less_more = false;

					if (owntopteamlinks) {
						// own team's link at the top of the page
						var ownLinks = ['Matches', 'Players'];
						for (var item = 0; item < ownLinks.length; ++item) {
							var link = ownLinks[item];
							if (links[link]) {
								addItem(link, true,
									null, null, null,
									links[link].ownLink,
									null, null, null);
							}
						}
					}
					else {
						var link;
						for (link in links) {
							if (isEnabledWithinContext(link, show_more)) {
								addItem(link, teamid == ownTeamId, teamid,
									userid, username, links[link].ownLink,
									links[link].linkByTeam, links[link].linkByUser,
									links[link].linkByUserName);
							} else {
								if (isEnabledWithinContext(link, !show_more))
									show_less_more = true;
							}
						}

						if (Foxtrick.Prefs.isModuleOptionEnabled('TeamPopupLinks', 'CustomLink')) {
							var ownlinks =
								Foxtrick.Prefs.getString('module.TeamPopupLinks.CustomLink_text');
							if (typeof(ownlinks) === 'string') {
								ownlinks = ownlinks.split(/\n/);
								var i = 0, ownlink;
								while (ownlink = ownlinks[i++]) {
									try {
										var redir_to_custom = false;
										var json = JSON.parse(ownlink);

										if (show_more != json.more) {
											show_less_more = true;
											continue;
										}

										var item = doc.createElement('li');
										var a6 = doc.createElement('a');
										a6.href = Foxtrick.util.sanitize.parseUrl(json.link);
										a6.title = json.title;
										a6.textContent = json.title;

										if (a6.href.search(/\[teamid\]/) != -1) {
											if (teamid) a6.href = a6.href.replace(/\[teamid\]/i, teamid);
											else redir_to_custom = true;
										}
										if (a6.href.search(/\[userid\]/) != -1) {
											if (userid) a6.href = a6.href.replace(/\[userid\]/i, userid);
											else redir_to_custom = true;
										}

										if (redir_to_custom) {
											if (teamid == null) a6.href = '/Club/Manager/?userId=' +
												userid + '&redir_to_custom=true' + '&' + a6.href;
											else a6.href = '/Club/Manager/?teamId=' + teamid +
												'&redir_to_custom=true' + '&' + a6.href;
										}
										if (json.newTab)
											a6.target = '_blank';

										item.appendChild(a6);
										list.appendChild(item);
									} catch (e) {
										Foxtrick.log('custom teampopup error:', e);
									}
								}
							}
						}

						if (show_less_more) {
							var item = doc.createElement('li');
							var link = doc.createElement('a');
							if (!show_more) {
								link.setAttribute('more', 'true');
								link.textContent = Foxtrick.L10n.getString('more');
							}
							else {
								link.setAttribute('more', 'false');
								link.textContent = Foxtrick.L10n.getString('less');
							}
							Foxtrick.onClick(link, showPopup);
							item.appendChild(link);
							list.appendChild(item);
						}

					}

					var mainBody = doc.getElementById('mainBody');

					var pT = Foxtrick.GetElementPosition(org_link, mainBody)['top'];
					if ((hasScroll && (pT - mainBody.scrollTop < mainBody.offsetHeight / 2))
						|| pT - doc.body.scrollTop < 300) { // = popdown
						var more = list.removeChild(list.lastChild);
						list.insertBefore(more, list.firstChild);
						var down = true;
					}

					if (!down)
						Foxtrick.addClass(list, 'ft-popup-list-up');
					else
						Foxtrick.addClass(list, 'ft-popup-list-down');

					if (org_link.parentNode.getElementsByClassName('ft-popup-list')[0])
						org_link.parentNode.removeChild(org_link.parentNode
						                                .getElementsByClassName('ft-popup-list')[0]);

					org_link.parentNode.insertBefore(list, org_link);
				};
				Foxtrick.listen(aLink, 'mouseover', showPopup, false);
				span.appendChild(aLink);
			}
		};

		// team links
		var link = doc.getElementById('teamLinks').getElementsByTagName('a')[0];
		if (link)
			addSpan(link);

		// all in mainWrapper (ie. not left boxes)
		if (sUrl.search(/Forum\/(Default\.aspx)?\?/i) != -1)
			return; // not in forum overview
		var aLinks = doc.getElementById('mainBody').getElementsByTagName('a');
		var i = 0, aLink;
		while ((aLink = aLinks[i++])) {
			if (!aLink.hasAttribute('href') ||
			    Foxtrick.hasClass(aLink, 'ft-no-popup') ||
			    aLink.parentNode.className == 'liveTabText' ||
			    aLink.querySelector('img:not(.ft-staff-icon)') !== null)
				continue; // don't add to buttons, and htlive tabs
			addSpan(aLink);
		}

		var sidebar = doc.getElementById('sidebar');
		if (sidebar) {
			aLinks = sidebar.getElementsByTagName('a');
			i = 0;
			while ((aLink = aLinks[i++])) {
				if (!aLink.hasAttribute('href') ||
				    aLink.querySelector('img:not(.ft-staff-icon)') !== null)
					continue; // don't add to buttons
				addSpan(aLink);
			}
		}
	},

	change: function(doc) {
		this.add_popup_links(doc);
	}
};
