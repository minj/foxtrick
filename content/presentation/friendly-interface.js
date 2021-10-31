'use strict';
/**
 * friendly-interface
 * More friendly interface tweaks
 * @author ryanli, convincedd
 */

Foxtrick.modules['FriendlyInterface'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['playerDetails', 'guestbook', 'dashboard'],
	CSS: Foxtrick.InternalPath + 'resources/css/friendly-interface.css',
	OPTIONS: [
		'NtLinkForNtPlayer',
		'HideAnswerTo',
		'HideSpeechlessSecretary',
	],

	// eslint-disable-next-line complexity
	run: function(doc) {
		var module = this;
		if (Foxtrick.isPage(doc, 'playerDetails') &&
		    Foxtrick.Prefs.isModuleOptionEnabled('FriendlyInterface', 'NtLinkForNtPlayer')) {
			// show national team names as links in national players' page
			if (Foxtrick.Pages.Player.wasFired(doc))
				return;

			var playerInfo = doc.querySelector('.playerInfo');

			// a player has highlight <=> he is a national player
			var highlight = playerInfo.querySelector('.highlight');
			if (highlight) {
				var text = highlight.textContent;
				var leagueId = Foxtrick.Pages.Player.getNationalityId(doc);
				let league = Foxtrick.XMLData.League[leagueId];
				if (league) {
					var ntId = league.NationalTeamId;
					var u21Id = league.U20TeamId; // NOTE: property remains != U21
					var ntName = Foxtrick.XMLData.getNTNameByLeagueId(leagueId);
					var u21NameRe = new RegExp(`U21 .*?${Foxtrick.strToRe(ntName)}`);

					var replace = function(team, id) {
						highlight.textContent = text.slice(0, text.indexOf(team));
						var link = Foxtrick.createFeaturedElement(doc, module, 'a');
						link.textContent = team;
						link.href = '/Club/NationalTeam/NationalTeam.aspx?teamId=' + id;
						highlight.appendChild(link);
						var suffix =
							doc.createTextNode(text.slice(text.indexOf(team) + team.length));
						highlight.appendChild(suffix);
					};

					// find U21 first because generally NT name is a substring of U21 name
					if (u21NameRe.test(text)) {
						let [u21Name] = u21NameRe.exec(text);
						replace(u21Name, u21Id);
					}
					else if (text.indexOf(ntName) > -1) {
						replace(ntName, ntId);
					}
				}
				else {
					Foxtrick.log(new Error(`League ${leagueId} missing!`));
				}
			}
		}
		else if (Foxtrick.isPage(doc, 'guestbook') &&
		         Foxtrick.Prefs.isModuleOptionEnabled('FriendlyInterface', 'HideAnswerTo')) {
			var links = doc.getElementById('mainBody').getElementsByTagName('a');
			var answerToLinks = Foxtrick.filter(function(n) {
				return (n.href.search(/Guestbook\.aspx/i) >= 0);
			}, links);
			Foxtrick.map(function(n) {
				Foxtrick.addClass(n, 'hidden');
				Foxtrick.addClass(n.parentNode, 'ft-hiddenGBLinkContainer');
			}, answerToLinks);
		}
		else if (Foxtrick.isPage(doc, 'dashboard') &&
		         Foxtrick.Prefs.isModuleOptionEnabled('FriendlyInterface',
		                                              'HideSpeechlessSecretary')) {
			if (doc.getElementsByClassName('pmNextMessageCounter').length)
				return; // there are unread messages
			// nothing new, container should be marked as hidden
			var container = doc.querySelector('.pmContainer');
			Foxtrick.addClass(container, 'hidden');
		}
	}
};
