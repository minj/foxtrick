'use strict';
/**
 * htev-prediction.js
 * adds some statistics on matches based on HTEV web site info
 * @author CatzHoek
 */

/*protocol
 *
 * request: var url = 'http://htev.org/api/matchodds/' + matchid +'/'
 *
 * response:
 */
////////////////////////////////////////////////////////////////////////////////
Foxtrick.modules['HTEVPrediction'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['series', 'matches'],
	CSS: Foxtrick.InternalPath + 'resources/css/htev-prediction.css',
	//save some stuff permanently,
	//most important stuff will probably be own past games, they will never change again
	run: function(doc) {
		var handleHTEVResponse = function(response, status) {
			var fillPopups = function(matchid, json) {
				//league id
				var main = doc.getElementById('ctl00_ctl00_CPContent_divStartMain');
				var thisdiv = main.getElementsByTagName('div')[0];
				var leagueId = Foxtrick.util.id.findLeagueLeveUnitId(thisdiv);
				var teamId = Foxtrick.util.id.getTeamIdFromUrl(doc.location.href);
				var links = doc.getElementById('mainBody').getElementsByTagName('a');
				for (var i = 0; i < links.length; i++) {
					var mID = Foxtrick.util.id.getMatchIdFromUrl(links[i].href);
					if (matchid == mID) {
						if (links[i].href.search(/match.aspx/i) == -1)
							continue;

						if (Foxtrick.hasClass(links[i], 'ft-htev-popup-added'))
							continue;

						Foxtrick.addClass(links[i], 'ft-htev-popup-added');

						//popup
						var span = links[i].parentNode;
						var htev_div = span.getElementsByClassName('ft-htev-popup')[0];

						//navigation
						var div_nav = doc.createElement('div');
						var ul = doc.createElement('ul');
						Foxtrick.addClass(div_nav, 'ft-htev-nav');

						//see if its a future match
						var isFutureMatch = (json.tie == -1);

						//league id
						var li = doc.createElement('li');
						var htev_link = doc.createElement('a');
						if (isFutureMatch && leagueId) {
							htev_link.href = 'http://htev.org/search_leagueid/?SeriesID=' + leagueId;
							htev_link.setAttribute('title', Foxtrickl10n
							                       .getString('HTEVPrediction.visitLeague'));
						} else if (isFutureMatch && !leagueId) {
							htev_link.href = 'http://htev.org/match_to_league/' + matchid + '/';
							htev_link.setAttribute('title', Foxtrickl10n
							                       .getString('HTEVPrediction.visitLeague'));
						}
						else {
							htev_link.href = 'http://htev.org/match/' + matchid + '/';
							htev_link.setAttribute('title', Foxtrickl10n
							                       .getString('HTEVPrediction.visitDetailed'));
						}

						//link to htev
						htev_link.setAttribute('target', '_blank');
						htev_link.textContent = 'HTEV';
						li.appendChild(htev_link);
						ul.appendChild(li);
						div_nav.appendChild(ul);
						htev_div.appendChild(div_nav);
						//'no match' response
						if (json.message && json.message == 'no match') {
							var msg = doc.createElement('div');
							Foxtrick.addClass(msg, 'ft-htev-info');
							msg.textContent = 'No data';
							htev_div.appendChild(msg);
						}
						//'should be fine'
						else {
							//derby
							if (json.derby) {
								var msg = doc.createElement('div');
								Foxtrick.addClass(msg, 'ft-htev-derby');
								msg.textContent = 'Derby';
								htev_div.appendChild(msg);
							}

							//content
							var table = doc.createElement('table');
							var thead = doc.createElement('thead');
							var tbody = doc.createElement('tbody');

							//thead
							var thead_row = doc.createElement('tr');
							var thead_row_h = doc.createElement('th');
							if (!isFutureMatch)
								var thead_row_t = doc.createElement('th');
							var thead_row_a = doc.createElement('th');
							thead_row_h.textContent = Foxtrickl10n
								.getString('HTEVPrediction.home.short');
							if (!isFutureMatch)
								thead_row_t.textContent = Foxtrickl10n
									.getString('HTEVPrediction.tie.short');
							thead_row_a.textContent = Foxtrickl10n
								.getString('HTEVPrediction.away.short');
							thead_row_h.setAttribute('title', Foxtrickl10n
							                         .getString('HTEVPrediction.explainHome'));
							if (!isFutureMatch)
								thead_row_t.setAttribute('title', Foxtrickl10n
								                         .getString('HTEVPrediction.explainTie'));
							thead_row_a.setAttribute('title', Foxtrickl10n
							                         .getString('HTEVPrediction.explainAway'));
							thead_row.appendChild(thead_row_h);
							if (!isFutureMatch)
								thead_row.appendChild(thead_row_t);
							thead_row.appendChild(thead_row_a);
							thead.appendChild(thead_row);
							table.appendChild(thead);

							//tbody
							var tbody_row = doc.createElement('tr');
							var tbody_row_h = doc.createElement('td');
							if (!isFutureMatch)
								var tbody_row_t = doc.createElement('td');
							var tbody_row_a = doc.createElement('td');
							tbody_row_h.textContent = json.hwin + '%';
							if (!isFutureMatch)
								tbody_row_t.textContent = json.tie + '%';
							tbody_row_a.textContent = json.awin + '%';
							tbody_row.appendChild(tbody_row_h);
							if (!isFutureMatch)
								tbody_row.appendChild(tbody_row_t);
							tbody_row.appendChild(tbody_row_a);
							tbody.appendChild(tbody_row);
							table.appendChild(tbody);

							htev_div.appendChild(table);
						}
					}
				}
			};

			//actually react on the load request
			switch (status) {
				case 200:
					try {
						//ordinary request
						var json = JSON.parse(response);
					}
					catch (e) {
						//request from cache
						var json = response;
					}
					//set cache, might be overwritting
					//see if its a future match
					var storeSession = (json.tie == -1 || json.message == 'no match');
					if (storeSession) {
						Foxtrick.sessionSet('htev.prediction.future.' + json.matchid, json);
					} else {
						Foxtrick.localSet('htev.prediction.past.' + json.matchid, json);
					}
					//fix the popup contents
					fillPopups(json.matchid, json);
					break;
				default:
					Foxtrick.log('htev error:', response, status);
			}
		};

		var getFromHTEV = function(ev) {
			//target can be a member of the link, like a span or so
			var findLink = function(target) {
				while (!target.href)
					target = target.parentNode;

				return target;
			};

			var link = findLink(ev.target);
			var matchid = Foxtrick.util.id.getMatchIdFromUrl(link.href);
			//check local store if we have a record for this match already
			Foxtrick.localGet('htev.prediction.past.' + matchid,
			  function(lcache) {
				//jupp, excellent
				if (lcache) {
					Foxtrick.log('HTEV: using local cached (past match)');
					handleHTEVResponse(lcache, 200);
				}
				//nah, ask HTEV
				else {
					//try local store
					Foxtrick.sessionGet('htev.prediction.future.' + matchid,
					  function(scache) {
						//jupp, excellent
						if (scache) {
							Foxtrick.log('HTEV: using session cached (future match)');
							handleHTEVResponse(scache, 200);
						}
						//nah, ask HTEV
						else {
							var url = 'http://htev.org/api/matchodds/' + matchid + '/';
							Foxtrick.log('HTEV: request', url);
							Foxtrick.util.load.async(url, handleHTEVResponse);
						}
					});
				}
			});
		};

		var addPopup = function(link) {
			var matchid = Foxtrick.util.id.getMatchIdFromUrl(link.href);

			//build basic frame for the popup, data/content comes later
			var span =
				Foxtrick.createFeaturedElement(doc, Foxtrick.modules['HTEVPrediction'], 'span');
			var par = link.parentNode;
			span.className = 'ft-popup-span';
			par.insertBefore(span, link);
			span.appendChild(link);

			var htev_div =
				Foxtrick.createFeaturedElement(doc, Foxtrick.modules['HTEVPrediction'], 'div');
			Foxtrick.addClass(htev_div, 'ft-htev-popup');
			span.appendChild(htev_div);

			//actually get data from cache or htev and fill the popup
			Foxtrick.listen(link, 'mouseover', getFromHTEV, false);
		};

		//gets the match type for normal formated tabled that have game specific icons
		var getMatchType = function(node) {
			var parentNode = node.parentNode;
			var types = ['matchLeague', 'matchFriendly', 'matchTournament', 'matchCup',
				'matchQualification', 'matchMasters'];

			//dont leave parent table if appreciable
			while (parentNode && parentNode.tagName != 'TABLE') {
				if (parentNode.tagName == 'TR') {
					var t;
					for (t in types) {
						var search = parentNode.getElementsByClassName(types[t]);
						if (search.length)
							return types[t];
					}
				}
				parentNode = parentNode.parentNode;
			}
			return 'matchUnknown';
		};

		//only run on senior matches page
		if (Foxtrick.Pages.Matches.isYouthMatchesPage(doc) ||
		    Foxtrick.Pages.Matches.isNtMatchesPage(doc))
			return;

		var links = doc.getElementById('mainBody').getElementsByTagName('a');
		for (var i = 0; i < links.length; i++) {
			var matchid = Foxtrick.util.id.getMatchIdFromUrl(links[i].href);
			if (matchid == null)
				continue;

			if (links[i].href.search(/match.aspx/i) == -1)
				continue;

			if (Foxtrick.isPage(doc, 'series') || getMatchType(links[i]) == 'matchLeague')
				addPopup(links[i]);
		}
	}
};
