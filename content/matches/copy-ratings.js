'use strict';
/**
 * copy-ratings.js
 * Copies match ratings (HT-ML style)
 * @author spambot, ryanli, LA-MJ
 */

Foxtrick.modules['CopyRatings'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match', 'matchesLive'],

	NICE: 1, // after MatchReportFormat.

	CSS: Foxtrick.InternalPath + 'resources/css/copy-ratings.css',

	run: function(doc) {
		if (Foxtrick.Pages.Match.isPrematch(doc))
			return;

		if (Foxtrick.isPage(doc, 'matchesLive'))
			Foxtrick.Pages.Match.addLiveTabListener(doc, 'divSectors',
			                                        this.copyRatingDetails.bind(this));
		else
			this.copyRatingDetails(doc);

		var table = Foxtrick.Pages.Match.getRatingsTable(doc);
		if (!table)
			return;

		this.copyRatingsTable(table);
	},
	copyRatingDetails: function(doc) {
		var module = this;

		if (!Foxtrick.Pages.Match.hasRatingsTabs(doc))
			return;

		if (doc.getElementById('ft-copy-rating-details'))
			return;

		var inProgress = Foxtrick.Pages.Match.inProgress(doc);
		var isLive = Foxtrick.isPage(doc, 'matchesLive');

		var SECTORS = {
			home_rd_: 0,
			away_la_: 1,
			home_cd_: 2,
			away_ca_: 3,
			home_ld_: 4,
			away_ra_: 5,
			home_mf_: 6,
			away_mf_: 7,
			home_ra_: 8,
			away_ld_: 9,
			home_ca_: 10,
			away_cd_: 11,
			home_la_: 12,
			away_rd_: 13,
		};

		var COPIED = Foxtrick.L10n.getString('copy.ratings.copied');
		var COPY = Foxtrick.L10n.getString('button.copy');

		var SECTORS_TEMPLATE = '[tr][th colspan=3 align=center]{sectors_title}[/th][/tr]\n[tr]\n[td align=center][b]{home_rd_lbl}[/b]\n{home_rd_txt}\n[{home_rd_val}][/td]\n[td align=center][b]{home_cd_lbl}[/b]\n{home_cd_txt}\n[{home_cd_val}][/td]\n[td align=center][b]{home_ld_lbl}[/b]\n{home_ld_txt}\n[{home_ld_val}][/td]\n[/tr]\n[tr]\n[td align=center][q]{away_la_pct}[/q][/td]\n[td align=center][q]{away_ca_pct}[/q][/td]\n[td align=center][q]{away_ra_pct}[/q][/td]\n[/tr]\n[tr]\n[td align=center][b]{away_la_lbl}[/b]\n{away_la_txt}\n[{away_la_val}][/td]\n[td align=center][b]{away_ca_lbl}[/b]\n{away_ca_txt}\n[{away_ca_val}][/td]\n[td align=center][b]{away_ra_lbl}[/b]\n{away_ra_txt}\n[{away_ra_val}][/td]\n[/tr]\n[tr][td colspan=3 align=center][b]{home_mf_lbl}[/b]\n{home_mf_txt}\n[{home_mf_val}][/td][/tr]\n[tr][td colspan=3 align=center][q]{home_mf_pct}[/q][/td][/tr]\n[tr][td colspan=3 align=center][b]{away_mf_lbl}[/b]\n{away_mf_txt}\n[{away_mf_val}][/td][/tr]\n[tr]\n[td align=center][b]{home_ra_lbl}[/b]\n{home_ra_txt}\n[{home_ra_val}][/td]\n[td align=center][b]{home_ca_lbl}[/b]\n{home_ca_txt}\n[{home_ca_val}][/td]\n[td align=center][b]{home_la_lbl}[/b]\n{home_la_txt}\n[{home_la_val}][/td]\n[/tr]\n[tr]\n[td align=center][q]{home_ra_pct}[/q][/td]\n[td align=center][q]{home_ca_pct}[/q][/td]\n[td align=center][q]{home_la_pct}[/q][/td]\n[/tr]\n[tr]\n[td align=center][b]{away_ld_lbl}[/b]\n{away_ld_txt}\n[{away_ld_val}][/td]\n[td align=center][b]{away_cd_lbl}[/b]\n{away_cd_txt}\n[{away_cd_val}][/td]\n[td align=center][b]{away_rd_lbl}[/b]\n{away_rd_txt}\n[{away_rd_val}][/td]\n[/tr]\n[tr][td colspan=3]{prob_desc}[/td][/tr]';

		var TEMPLATE = '[table]\n[tr][td align=center]{home_team}\n{home_link}[/td]\n[th align=center]{match_link}\n{home_goals} - {away_goals}\n{match_time}[/th]\n[td align=center]{away_team}\n{away_link}[/td][/tr]\n[tr][td align=center]{home_atd}[/td][th align=center]{attitude_lbl}[/th][td align=center]{away_atd}[/td][/tr]\n[tr][td align=center][u]{home_tct_txt}[/u][/td][th align=center]{tactic_lbl}[/th][td align=center][u]{away_tct_txt}[/u][/td][/tr]\n[tr][td align=center]{home_tct_lvl}[/td][th align=center]{tactic_lvl_lbl}[/th][td align=center]{away_tct_lvl}[/td][/tr]\n{sectors}\n[/table]\n';
		var LIVE_TEMPLATE = '[table]\n[tr][td align=center]{home_team}\n{home_link}[/td]\n[th align=center]{match_link}\n{home_goals} - {away_goals}\n{match_time}[/th]\n[td align=center]{away_team}\n{away_link}[/td][/tr]\n{sectors}\n[/table]\n';

		var listener = function(ev) {
			var doc = ev.target.ownerDocument;

			var labels = Foxtrick.map(function(label) {
				// MatchRatingsTweaks.FollowChanges moves full sector name to title
				return label.title.trim() || label.textContent.trim();
			}, doc.querySelectorAll('.posLabel'));

			var textRatings = Foxtrick.map(function(text) {
				return text.textContent.trim();
			}, doc.querySelectorAll('.overlaySector .teamTextRatings'));

			var numberRatings = Foxtrick.map(function(text) {
				return text.textContent.trim();
			}, doc.querySelectorAll('.overlaySector .teamNumberRatings'));

			var ratings = Foxtrick.map(function(number) {
				return Foxtrick.Math.hsToFloat(number, true).toFixed(2);
			}, numberRatings);

			var sectorResults = Foxtrick.map(function(text) {
				// using '[42%]' for HT values
				// while '(42%)' for real probabilities (adds title attribute)
				var template = text.title ? '({})' : '[{}]';
				var pct = text.firstChild; // skipping FollowChanges
				return Foxtrick.format(template, [pct.textContent.trim()]);
			}, doc.querySelectorAll('.sectorResult'));

			var map = {};
			for (var sector in SECTORS) {
				var order = SECTORS[sector];
				map[sector + 'lbl'] = labels[order];
				map[sector + 'txt'] = textRatings[order];
				map[sector + 'val'] = ratings[order];
				map[sector + 'pct'] = sectorResults[order];
			}

			var realProb = doc.getElementById('ft-probabilityDesc');
			var htProb = doc.getElementById('ht-probabilityDesc');
			if (realProb && !Foxtrick.hasClass(realProb, 'hidden'))
				map.prob_desc = realProb.textContent.trim();
			else if (htProb && !Foxtrick.hasClass(htProb, 'hidden'))
				map.prob_desc = htProb.textContent.trim();

			var title = doc.querySelector('#divSectors h4');
			map.sectors_title = title.textContent.trim();

			if (!inProgress && !isLive) {
				var time = doc.querySelector('.currentEvent .timelineEventTimeStamp');
				var eventDetails = doc.getElementById('timelineEventDetails').firstChild;
				var match_time = time ? time.textContent.trim()
					: eventDetails.textContent.trim().match(/^\d+/)[0];
				map.match_time = isNaN(parseInt(match_time, 10)) ? match_time : match_time + '\'';
			}
			else if (inProgress) {
				// README: this is fragile match minute detection
				// matchdetails:154-7
				var minute = 0;
				var isSecondHalf = doc.querySelector('#matchReport span[data-eventtype^="45"]');
				if (isSecondHalf)
					minute += 45;

				// assuming 156 (extra time) is not used
				// var isExtraTime = doc.querySelector('#matchReport span[data-eventtype^="70"]');

				var progress = Foxtrick.getMBElement(doc, 'lblMatchStatus');
				// assuming no numbers before match minute
				// lookahead defeats references to 11 meters (Azer & Vietnamese)
				var min = progress.textContent.match(/\d+(?= )/);
				if (min)
					minute += parseInt(min[0], 10);

				var events = doc.querySelectorAll('#matchReport span[data-match-minute]');
				var lastEvent = events[events.length - 1];
				var lastMinute = parseInt(lastEvent.dataset.matchMinute, 10);
				if (lastMinute > minute)
					minute = lastMinute;

				map.match_time = minute + '\'';
			}
			else if (isLive) {
				var timer = doc.getElementById('match');
				map.match_time = timer.textContent.trim().match(/^\d+/)[0] + '\'';
			}

			map.sectors = Foxtrick.format(SECTORS_TEMPLATE, map);

			var youth = Foxtrick.Pages.Match.isYouth(doc) ? 'youth' : '';
			var hto = Foxtrick.Pages.Match.isHTOIntegrated(doc) ? 'tournament' : '';
			var isNT = Foxtrick.Pages.Match.isNT(doc);
			var gameId = Foxtrick.Pages.Match.getId(doc);

			map.match_link = '[' + youth + hto + 'matchid=' + gameId + ']';
			map.home_team = Foxtrick.Pages.Match.getHomeTeamName(doc);
			var homeId = Foxtrick.Pages.Match.getHomeTeamId(doc);
			map.home_link = !isNT ? '[' + youth + 'teamid=' + homeId + ']' : '(' + homeId + ')';
			// : '[link=/Club/NationalTeam/NationalTeam.aspx?teamId=' + homeId + ']';
			map.away_team = Foxtrick.Pages.Match.getAwayTeamName(doc);
			var awayId = Foxtrick.Pages.Match.getAwayTeamId(doc);
			map.away_link = !isNT ? '[' + youth + 'teamid=' + awayId + ']' : '(' + awayId + ')';
			// : '[link=/Club/NationalTeam/NationalTeam.aspx?teamId=' + awayId + ']';
			var score = Foxtrick.Pages.Match.getResult(doc);
			map.home_goals = score[0];
			map.away_goals = score[1];

			var ret;
			if (isLive || inProgress) {
				ret = Foxtrick.format(LIVE_TEMPLATE, map);
			}
			else {
				var headers = doc.querySelectorAll('.miscRatings h2');
				var miscRow = headers[1].parentNode.parentNode;

				var attitudeRow = miscRow.nextElementSibling;
				map.attitude_lbl = attitudeRow.cells[0].textContent.trim();
				map.home_atd = attitudeRow.cells[1].textContent.trim() || '-';
				map.away_atd = attitudeRow.cells[2].textContent.trim() || '-';

				var tacticsRow = attitudeRow.nextElementSibling;
				map.tactic_lbl = tacticsRow.cells[0].textContent.trim();
				map.home_tct_txt = tacticsRow.cells[1].textContent.trim();
				map.away_tct_txt = tacticsRow.cells[2].textContent.trim();

				var tacticsLvlRow = tacticsRow.nextElementSibling;
				map.tactic_lvl_lbl = tacticsLvlRow.cells[0].textContent.trim();
				var tacticLvls = tacticsLvlRow.getElementsByClassName('teamTextRatings');
				map.home_tct_lvl = tacticLvls[0].textContent.trim();
				map.away_tct_lvl = tacticLvls[1].textContent.trim();

				ret = Foxtrick.format(TEMPLATE, map);
			}
			var ftRatings = doc.getElementById('ft-mrt-ratings');
			if (ftRatings) {
				var table = Foxtrick.util.htMl.getTable(ftRatings);
				ret += table.markup + '\n';
			}

			Foxtrick.copyStringToClipboard(ret);
			Foxtrick.util.note.add(doc, COPIED, 'ft-ratings-copy-note');
		};

		var button = Foxtrick.createFeaturedElement(doc, module, 'span');
		button.id = 'ft-copy-rating-details';
		button.textContent = COPY;
		Foxtrick.onClick(button, listener);

		var title = doc.querySelector('#divSectors h4');
		var actions = title.parentNode;
		actions.appendChild(button);
	},
	copyRatingsTable: function(table) {
		var doc = table.ownerDocument;
		var COPIED = Foxtrick.L10n.getString('copy.ratings.copied');
		var COPY = Foxtrick.L10n.getString('button.copy');
		var COPY_BOTH = Foxtrick.L10n.getString('copy.ratings.both');
		var createRatings = function(place, teams) {
			try {
				var insertBefore = null;
				if (place == 'table')
					insertBefore = doc.getElementById('oldMatchRatings');

				var team1 = (teams == 'both') || (teams == 'home');
				var team2 = (teams == 'both') || (teams == 'away');

				var byNumber = doc.getElementById('sortByNumberIcon');
				var byText = doc.getElementById('sortByTextIcon');
				var copyTextRating = !Foxtrick.hasClass(byNumber, 'disabled');
				var copyNumRating = !Foxtrick.hasClass(byText, 'disabled');

				var table = Foxtrick.Pages.Match.getRatingsTable(doc).cloneNode(true);
				Foxtrick.forEach(function(row) {
					if (!team1 && row.cells.length >= 2)
						row.cells[1].textContent = '###';
					if (!team2 && row.cells.length >= 3)
						row.cells[2].textContent = '###';
				}, table.rows);

				var youth = Foxtrick.Pages.Match.isYouth(doc) ? 'youth' : '';
				var hto = Foxtrick.Pages.Match.isHTOIntegrated(doc) ? 'tournament' : '';
				var isNT = Foxtrick.Pages.Match.isNT(doc);

				var matchLink = Foxtrick.Pages.All.getBreadCrumbs(doc)[0];
				var gameId = Foxtrick.util.id.getMatchIdFromUrl(matchLink.href);
				var gameResult = Foxtrick.Pages.Match.getResult(doc);

				// team name links in result table no longer lead to team pages
				// however getTeams returns short team names
				var teamNames = doc.querySelectorAll('.teamName a');
				var teamLinks = Foxtrick.Pages.Match.getTeams(doc);

				var addTeamInfo = function(idx) {
					var ret = '';
					var teamLink = teamLinks[idx];
					var name = teamNames[idx];
					if (teamLink) {
						var id = Foxtrick.util.id.getTeamIdFromUrl(teamLink.href);
						var result = (teams == 'both') ? ' - ' + gameResult[idx] : '';
						ret = name.textContent + result + '\n';
						if (isNT)
							ret += '[link=/Club/NationalTeam/NationalTeam.aspx?teamId=' + id + ']';
						else
							ret += '[' + youth + 'teamid=' + id + ']';
					}
					return ret;
				};

				var ad = '[table]\n';
				// head row
				ad += '[tr][th]';
				ad += '[' + youth + hto + 'matchid=' + gameId + ']';
				ad += '[/th][th]';
				if (team1) {
					ad += addTeamInfo(0);
				}
				if (team1 && team2)
					ad += '[/th][th]';
				if (team2) {
					ad += addTeamInfo(1);
				}
				ad += '[/th][/tr]\n';

				var addRowForTeam = function(row, idx) {
					var ret = '';
					var textCell = row.cells[1 + idx];
					var numCell = row.cells[3 + idx];
					if (textCell && (copyTextRating ||
					    Foxtrick.hasClass(row, 'ft_rating_table_row'))) {
						ret += textCell.textContent.trim();
					}
					if (numCell && copyNumRating) {
						ret += ' (' + numCell.textContent.trim().replace(',', '.') + ')';
					}
					return ret;
				};

				var rows = Foxtrick.toArray(table.rows).slice(1); // skip team names
				Foxtrick.forEach(function(row) {
					ad += '[tr]';
					if (row.cells[0]) {
						var colSpan = row.cells[0].colSpan;
						var cSpan = colSpan > 1 ? ' colspan=' + colSpan : '';

						ad += '[th' + cSpan + ']' + row.cells[0].textContent.trim() + '[/th]';
						if (colSpan > 1) {
							// assume the whole row is spanned and skip it
							ad += '[/tr]\n';
							return;
						}
						ad += '[td]';
					}

					if (team1) {
						ad += addRowForTeam(row, 0);
					}
					if (team1 && team2)
						ad += '[/td][td]';
					if (team2) {
						ad += addRowForTeam(row, 1);
					}
					ad += '[/td][/tr]\n';
				}, rows);

				ad = ad.replace(/\[td\]###\[\/td\]/gi, '');
				ad += '[/table]\n';

				// copy htms prediction.
				if (team1 && team2) {
					var htmsMatchDivId = doc.getElementById('htmsMatchDivId');
					if (htmsMatchDivId) {
						ad += Foxtrick.modules['HTMSPrediction'].copy(htmsMatchDivId);
					}
				}

				Foxtrick.copyStringToClipboard(ad);
				Foxtrick.util.note.add(doc, COPIED, 'ft-ratings-copy-note', { at: insertBefore });
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};

		// Copy links inside the table
		var tableHeader = doc.querySelector('#oldMatchRatings .tblBox');
		var homeHeader = table.getElementsByTagName('th')[1];
		var awayHeader = table.getElementsByTagName('th')[2];

		var copyBoth = Foxtrick.createFeaturedElement(doc, this, 'span');
		copyBoth.className = 'ft_copy_rating';
		copyBoth.textContent = COPY;
		Foxtrick.onClick(copyBoth, function() { createRatings('table', 'both'); });
		tableHeader.appendChild(copyBoth);

		var copyHome = Foxtrick.createFeaturedElement(doc, this, 'span');
		copyHome.className = 'ft_copy_rating';
		copyHome.textContent = '(' + COPY + ')';
		Foxtrick.onClick(copyHome, function() { createRatings('table', 'home'); });
		homeHeader.appendChild(copyHome);

		var copyAway = Foxtrick.createFeaturedElement(doc, this, 'span');
		copyAway.className = 'ft_copy_rating';
		copyAway.textContent = '(' + COPY + ')';
		Foxtrick.onClick(copyAway, function() { createRatings('table', 'away'); });
		awayHeader.appendChild(copyAway);

		var makeBoxListener = function(team) {
			// to keep team variable here
			return function() { createRatings('box', team); };
		};
		var button = Foxtrick.util.copyButton.add(doc, COPY_BOTH);
		if (button) {
			button.title = '';
			button = Foxtrick.makeFeaturedElement(button, this);
			Foxtrick.addClass(button, 'ft-copy-ratings ft-pop-up-container');

			var list = doc.createElement('ul');
			list.className = 'ft-pop';
			var versions = ['both', 'home', 'away'];
			Foxtrick.forEach(function(version) {
				var item = doc.createElement('li');
				var link = doc.createElement('span');
				Foxtrick.onClick(link, makeBoxListener(version));
				link.textContent = Foxtrick.L10n.getString('copy.ratings.' + version);
				item.appendChild(link);
				list.appendChild(item);
			}, versions);
			button.appendChild(list);
		}
	},
};
