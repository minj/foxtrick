'use strict';
/**
 * season-stats.js
 * Foxtrick add stats to match archive
 * @author convinced
 */

Foxtrick.modules['SeasonStats'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES: ['matchesArchive', 'matches'],
	NICE: -1, // before FoxtrickCopyMatchID
	CSS: Foxtrick.InternalPath + 'resources/css/seasonstats.css',


	run: function(doc) {
		try {
			// get current season
			var htDate = Foxtrick.util.time.getHtDate(doc);
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
		var local_season = parseInt(selected_local_season) + season_diff;

		// add season select box
		var selectbox = Foxtrick.createFeaturedElement(doc, this, 'select');
		selectbox.setAttribute('id', 'ft_season_selectboxID');

		Foxtrick.listen(selectbox, 'change',
		  function(ev) {
			try {
				var actiontype = '';
				var select = doc.getElementById('ctl00_ctl00_CPContent_CPMain_ddlMatchType');
				var options = select.getElementsByTagName('option');
				for (var i = 0; i < options.length; ++i) {
					if (options[i].hasAttribute('selected')) {
						actiontype = options[i].value;
						break;
					}
				}
				if (doc.location.href.search(/actiontype/i) == -1)// has no actiontype. add one
					doc.location.href = doc.location.href
						.replace(/season=\d+/, 'season=' +
						         ev['target']['value']) + '&actiontype=' + actiontype;
				else
					doc.location.href = doc.location.href
						.replace(/season=\d+/, 'season=' + ev['target']['value'])
						.replace(/actiontype=.+/, 'actiontype=' + actiontype);

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
		doc.getElementById('mainBody').insertBefore(selectbox,
		                                            doc.getElementById('ctl00_ctl00_CPContent' +
		                                                               '_CPMain_ddlMatchType'));


		// ------------------------------ season stats --------------------------------------

		var sum_matches = new Array(12);
		for (var i = 0; i < sum_matches.length; ++i)
			sum_matches[i] = {
				'type': '', 'num': 0, 'won': 0, 'lost': 0,
				'draw': 0, 'goal0': 0, 'goal1': 0
			};

		var matchestable = doc.getElementById('mainBody').getElementsByTagName('table')[0];

		// get team name. start with current name, but try to get name of
		// that season from first home game
		var TeamName = Foxtrick.util.id.extractTeamName(doc.getElementsByClassName('main')[0])
			.substr(0, 15);
		//.replace(/\W/g,'');
		var TeamNameOld = null;
		for (var i = 0; i < matchestable.rows.length; ++i) {
			var iswon = matchestable.rows[i].cells[3]
				.getElementsByTagName('span')[0].className == 'won';
			var islost = matchestable.rows[i].cells[3]
				.getElementsByTagName('span')[0].className == 'lost';
			var draw = matchestable.rows[i].cells[3]
				.getElementsByTagName('span')[0].className == 'draw';
			var goals = matchestable.rows[i].cells[3]
				.getElementsByTagName('strong')[0].textContent.match(/\d+/g);
			var goals0 = parseInt(goals[0]);
			var goals1 = parseInt(goals[1]);
			if (!draw) {
				if ((goals0 > goals1) && islost ||
					(goals0 < goals1) && iswon) { // away. own goals second
				}
				else {
					TeamNameOld = matchestable.rows[i].cells[2]
						.getElementsByTagName('a')[0].title.replace(/-.+/g, '');
					break;
				}
			}
		}
		Foxtrick.log('TeamName: ', TeamName, '  TeamNameOld: ', TeamNameOld);

		for (var i = 0; i < matchestable.rows.length; ++i) {
			var type = 0;
			if (matchestable.rows[i].cells[1].getElementsByTagName('img')[0]
			    .className == 'matchLeague')
				type = 0;
			else if (matchestable.rows[i].cells[1]
			         .getElementsByTagName('img')[0].className == 'matchFriendly')
				type = 1;
			else if (matchestable.rows[i].cells[1]
			         .getElementsByTagName('img')[0].className == 'matchCup')
				type = 2;
			else if (matchestable.rows[i].cells[1]
			         .getElementsByTagName('img')[0].className == 'matchMasters')
				type = 3;
			//var ishome = matchestable.rows[i].cells[2]
			//	.getElementsByTagName('a')[0].title.replace(/\W/g, '').search(TeamName) == 0 ? 1 : 2;
			var iswon = matchestable.rows[i].cells[3]
				.getElementsByTagName('span')[0].className == 'won';
			var islost = matchestable.rows[i].cells[3]
				.getElementsByTagName('span')[0].className == 'lost';
			var isdraw = matchestable.rows[i].cells[3]
				.getElementsByTagName('span')[0].className == 'draw';
			var goals = matchestable.rows[i].cells[3]
				.getElementsByTagName('strong')[0].textContent.match(/\d+/g);
			var goals0 = parseInt(goals[0]);
			var goals1 = parseInt(goals[1]);
			var ishome = 1;
			if (goals0 > goals1 && islost || goals0 < goals1 && iswon) { // away. own goals second
				goals0 = parseInt(goals[1]);
				goals1 = parseInt(goals[0]);
				ishome = 2;
			}
			// get home/away for draws
			if (isdraw) {
				var thisfixture = matchestable.rows[i].cells[2]
					.getElementsByTagName('a')[0].title/*.replace(/\W/g,'')*/;
				if (thisfixture.search(TeamName))  // check if teamname is in fixture
						ishome = thisfixture.search(TeamName) == 0 ? 1 : 2;  // first pos = home
				else if (TeamNameOld && thisfixture.search(TeamNameOld))  // same for old teamname
						ishome = thisfixture.search(TeamNameOld) == 0 ? 1 : 2;
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
		var header = Foxtrickl10n.getString('seasonstats.boxheader');
		var ownBoxBodyId = 'foxtrick_seasonstats_content';
		ownBoxBody.setAttribute('id', ownBoxBodyId);

		for (var type = 0; type < 4; ++type) {
			if (!sum_matches[type * 3]['type'])
				continue;
			var head = doc.createElement('strong');

			if (type == 0)
				head.textContent = Foxtrickl10n.getString('seasonstats.league');
			else if (type == 1)
				head.textContent = Foxtrickl10n.getString('seasonstats.friendly');
			else if (type == 2)
				head.textContent = Foxtrickl10n.getString('seasonstats.cup');
			else
				head.textContent = Foxtrickl10n.getString('seasonstats.masters');

			ownBoxBody.appendChild(head);
			var table = doc.createElement('table');
			ownBoxBody.appendChild(table);
			var tbody = doc.createElement('tbody');
			table.appendChild(tbody);

			var tr = doc.createElement('tr');
			tbody.appendChild(tr);
			var th = doc.createElement('th');
			tr.appendChild(th);
			var th = doc.createElement('th');
			th.setAttribute('class', 'right ft_seasonstats_td ft_seasonstats_border_left');
			th.textContent = Foxtrickl10n.getString('seasonstats.played');
			tr.appendChild(th);
			var th = doc.createElement('th');
			th.setAttribute('class', 'right ft_seasonstats_td ft_seasonstats_border_left');
			th.textContent = Foxtrickl10n.getString('seasonstats.won');
			tr.appendChild(th);
			var th = doc.createElement('th');
			th.setAttribute('class', 'right ft_seasonstats_td');
			th.textContent = Foxtrickl10n.getString('seasonstats.draw');
			tr.appendChild(th);
			var th = doc.createElement('th');
			th.setAttribute('class', 'right ft_seasonstats_td');
			th.textContent = Foxtrickl10n.getString('seasonstats.lost');
			tr.appendChild(th);
			var th = doc.createElement('th');
			th.setAttribute('class', 'right ft_seasonstats_td ft_seasonstats_border_left');
			th.textContent = Foxtrickl10n.getString('seasonstats.goalplus');
			tr.appendChild(th);
			var th = doc.createElement('th');
			th.setAttribute('class', 'right ft_seasonstats_td');
			th.textContent = Foxtrickl10n.getString('seasonstats.goalminus');
			tr.appendChild(th);
			var th = doc.createElement('th');
			th.setAttribute('class', 'right ft_seasonstats_td');
			th.textContent = Foxtrickl10n.getString('seasonstats.goaldiff');
			tr.appendChild(th);

			for (var k = 0; k < 3; ++k) {
				var tr = doc.createElement('tr');
				tbody.appendChild(tr);
				var td = doc.createElement('td');
				td.setAttribute('class', 'right ft_seasonstats_td');
				if (k == 0)
					td.textContent = Foxtrickl10n.getString('seasonstats.total');
				else if (k == 1)
					td.textContent = Foxtrickl10n.getString('seasonstats.home');
				else
					td.textContent = Foxtrickl10n.getString('seasonstats.away');
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
	}
};
