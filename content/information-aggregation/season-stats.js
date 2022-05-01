/**
 * season-stats.js
 * Foxtrick add stats to match archive
 * @author convinced
 */

'use strict';

Foxtrick.modules['SeasonStats'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['matchesArchive'],
	NICE: -1, // before FoxtrickCopyMatchID
	CSS: Foxtrick.InternalPath + 'resources/css/seasonstats.css',


	// eslint-disable-next-line complexity
	run: function(doc) {

		if (Foxtrick.Pages.All.isYouth(doc)) {
			// don't run on youth
			return;
		}

		try {
			// get current season
			var htDate = Foxtrick.util.time.getHTDate(doc);
			var season = Foxtrick.util.time.gregorianToHT(htDate).season;
			// get selected season
			var selected_season = doc.location.href.match(/season=(\d+)/i)[1];
			var season_diff = season - selected_season;
		}
		catch (e) {
			// either current season or selected season is missing, return
			return;
		}

		var selected_local_season = doc.getElementById('mainBody').getElementsByTagName('h2')[0]
			.textContent.match(/\d+/i);
		var local_season = parseInt(selected_local_season, 10) + season_diff;

		// add season select box
		var selectbox = Foxtrick.createFeaturedElement(doc, this, 'select');
		selectbox.setAttribute('id', 'ft_season_selectboxID');

		Foxtrick.listen(selectbox, 'change', function(ev) {
			try {
				var actiontype = '';
				var select = Foxtrick.getMBElement(doc, 'ddlMatchType');
				var options = select.getElementsByTagName('option');
				for (var i = 0; i < options.length; ++i) {
					if (options[i].hasAttribute('selected')) {
						actiontype = options[i].value;
						break;
					}
				}
				if (doc.location.href.search(/actiontype/i) == -1) {
					// has no actiontype. add one
					doc.location.href =
						doc.location.href.replace(/season=\d+/, 'season=' + ev['target']['value']) + '&actiontype=' + actiontype;
				}
				else {
					doc.location.href = doc.location.href
						.replace(/season=\d+/, 'season=' + ev['target']['value'])
						.replace(/actiontype=.+/, 'actiontype=' + actiontype);
				}

			}
			catch (e) {
				Foxtrick.log(e);
			}
		}, false);

		var s = season;
		for (var ls = local_season; ls > 0; --ls) {
			var option = doc.createElement('option');
			option.setAttribute('value', s);
			option.textContent = ls;
			selectbox.appendChild(option);
			--s;
		}
		selectbox.value = selected_season;
		var matchTypeSelect = Foxtrick.getMBElement(doc, 'ddlMatchType');
		doc.getElementById('mainBody').insertBefore(selectbox, matchTypeSelect);


		// ------------------------------ season stats --------------------------------------

		var sum_matches = new Array(12);
		for (var i = 0; i < sum_matches.length; ++i)
			sum_matches[i] = {
				'type': '', 'num': 0, 'won': 0, 'lost': 0,
				'draw': 0, 'goal0': 0, 'goal1': 0
			};

		var matchestable = Foxtrick.Pages.Matches.getTable(doc);

		// get team name. start with current name, but try to get name of
		// that season from first home game
		var teamName = Foxtrick.Pages.All.getTeamName(doc).slice(0, 15);
		var teamNameOld = null;

		var rows = Foxtrick.toArray(matchestable.rows);
		for (var row of rows) {
			var won = row.querySelector('.won');
			var lost = row.querySelector('.lost');
			var draw = row.querySelector('.draw');

			if (draw)
				continue;

			var goals = row.querySelector('strong').textContent.match(/\d+/g);
			var goalsHome = parseInt(goals[0], 10);
			var goalsAway = parseInt(goals[1], 10);

			var matchLink = row.querySelector('a[href*="Match.aspx"]');
			var teams = matchLink.textContent.split(/\u00a0-\u00a0/);

			if (goalsHome > goalsAway && lost ||
			    goalsHome < goalsAway && won) {
				// away
				teamNameOld = teams[1];
			}
			else {
				// home
				teamNameOld = teams[0];
			}

			break;
		}

		Foxtrick.log('teamName:', teamName, 'teamNameOld:', teamNameOld);

		for (var i = 0; i < matchestable.rows.length; ++i) {
			var type;
			var img = matchestable.rows[i].cells[1].getElementsByTagName('img')[0];
			var span = matchestable.rows[i].cells[3].getElementsByTagName('span')[0];
			var b = matchestable.rows[i].cells[3].getElementsByTagName('strong')[0];
			if (img.className == 'matchLeague')
				type = 0;
			else if (img.className == 'matchFriendly')
				type = 1;
			else if (/matchCup/.test(img.className))
				type = 2;
			else if (img.className == 'matchMasters')
				type = 3;
			else
				// skip other matches: HTO/qualifiers etc
				continue;

			var islost = span.className.trim() == 'lost';
			var iswon = span.className.trim() == 'won';
			var isdraw = span.className.trim() == 'draw';
			var goals = b.textContent.match(/\d+/g);
			var goals0 = parseInt(goals[0], 10);
			var goals1 = parseInt(goals[1], 10);
			var ishome = 1;
			if (goals0 > goals1 && islost || goals0 < goals1 && iswon) { // away. own goals second
				goals0 = parseInt(goals[1], 10);
				goals1 = parseInt(goals[0], 10);
				ishome = 2;
			}

			// get home/away for draws
			if (isdraw) {
				var fixture = matchestable.rows[i].cells[2].querySelector('a').title;
				if (fixture.indexOf(teamName) !== -1)
					ishome = fixture.indexOf(teamName) ? 2 : 1; // home = first pos = 0 = false
				else if (teamNameOld && fixture.indexOf(teamNameOld) !== -1)
					ishome = fixture.indexOf(teamNameOld) ? 2 : 1;
			}

			sum_matches[type * 3]['type'] = matchestable.rows[i].cells[1]
				.getElementsByTagName('img')[0].title;
			sum_matches[type * 3]['num']++;
			if (iswon)
				sum_matches[type * 3]['won']++;
			if (islost)
				sum_matches[type * 3]['lost']++;
			if (isdraw)
				sum_matches[type * 3]['draw']++;
			sum_matches[type * 3]['goal0'] += goals0;
			sum_matches[type * 3]['goal1'] += goals1;

			sum_matches[type * 3 + ishome]['num']++;
			if (iswon)
				sum_matches[type * 3 + ishome]['won']++;
			if (islost)
				sum_matches[type * 3 + ishome]['lost']++;
			if (isdraw)
				sum_matches[type * 3 + ishome]['draw']++;
			sum_matches[type * 3 + ishome]['goal0'] += goals0;
			sum_matches[type * 3 + ishome]['goal1'] += goals1;
		}

		var ownBoxBody = Foxtrick.createFeaturedElement(doc, this, 'div');
		var header = Foxtrick.L10n.getString('seasonstats.boxheader');
		var ownBoxBodyId = 'foxtrick_seasonstats_content';
		ownBoxBody.setAttribute('id', ownBoxBodyId);

		for (var type = 0; type < 4; ++type) {
			if (!sum_matches[type * 3]['type'])
				continue;
			var head = doc.createElement('strong');

			if (type == 0)
				head.textContent = Foxtrick.L10n.getString('seasonstats.league');
			else if (type == 1)
				head.textContent = Foxtrick.L10n.getString('seasonstats.friendly');
			else if (type == 2)
				head.textContent = Foxtrick.L10n.getString('seasonstats.cup');
			else
				head.textContent = Foxtrick.L10n.getString('seasonstats.masters');

			ownBoxBody.appendChild(head);
			var table = doc.createElement('table');
			ownBoxBody.appendChild(table);
			var tbody = doc.createElement('tbody');
			table.appendChild(tbody);

			var SS_HEADER_CLASS_GENERIC = 'right ft_seasonstats_td';
			var SS_HEADER_CLASS_BORDER = 'right ft_seasonstats_td ft_seasonstats_border_left';
			var cols = {
				header: null,
				played: SS_HEADER_CLASS_BORDER,
				won: SS_HEADER_CLASS_BORDER,
				draw: SS_HEADER_CLASS_GENERIC,
				lost: SS_HEADER_CLASS_GENERIC,
				goalplus: SS_HEADER_CLASS_BORDER,
				goalminus: SS_HEADER_CLASS_GENERIC,
				goaldiff: SS_HEADER_CLASS_GENERIC,
			};

			var headerRow = doc.createElement('tr');
			tbody.appendChild(headerRow);

			for (var col in cols) {
				var th = doc.createElement('th');
				var cls = cols[col];
				if (cls) {
					Foxtrick.addClass(th, cls);
					var l10n = Foxtrick.L10n.getString('seasonstats.' + col);
					var l10nDesc = Foxtrick.L10n.getString('seasonstats.' + col + '.desc');
					th.textContent = l10n;
					th.title = l10nDesc;
				}
				headerRow.appendChild(th);
			}

			for (var k = 0; k < 3; ++k) {
				var tr = doc.createElement('tr');
				tbody.appendChild(tr);
				var td = doc.createElement('td');
				td.setAttribute('class', 'right ft_seasonstats_td');
				if (k == 0)
					td.textContent = Foxtrick.L10n.getString('seasonstats.total');
				else if (k == 1)
					td.textContent = Foxtrick.L10n.getString('seasonstats.home');
				else
					td.textContent = Foxtrick.L10n.getString('seasonstats.away');
				tr.appendChild(td);
				var td = doc.createElement('td');
				td.setAttribute('class', 'right ft_seasonstats_td ft_seasonstats_border_left');
				td.textContent = sum_matches[type * 3 + k]['num'];
				tr.appendChild(td);
				var td = doc.createElement('td');
				td.setAttribute('class', 'right ft_seasonstats_td ft_seasonstats_border_left');
				td.textContent = sum_matches[type * 3 + k]['won'];
				tr.appendChild(td);
				var td = doc.createElement('td');
				td.setAttribute('class', 'right ft_seasonstats_td');
				td.textContent = sum_matches[type * 3 + k]['draw'];
				tr.appendChild(td);
				var td = doc.createElement('td');
				td.setAttribute('class', 'right ft_seasonstats_td');
				td.textContent = sum_matches[type * 3 + k]['lost'];
				tr.appendChild(td);
				var td = doc.createElement('td');
				td.setAttribute('class', 'right ft_seasonstats_td ft_seasonstats_border_left');
				td.textContent = sum_matches[type * 3 + k]['goal0'];
				tr.appendChild(td);
				var td = doc.createElement('td');
				td.setAttribute('class', 'right ft_seasonstats_td');
				td.textContent = sum_matches[type * 3 + k]['goal1'];
				tr.appendChild(td);
				var td = doc.createElement('td');
				td.setAttribute('class', 'right ft_seasonstats_td');
				td.textContent = sum_matches[type * 3 + k]['goal0'] -
					sum_matches[type * 3 + k]['goal1'];
				tr.appendChild(td);
			}

			var br = doc.createElement('br');
			ownBoxBody.appendChild(br);
		}

		Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, 1);
	},
};
