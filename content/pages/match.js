'use strict';
/**
 * match.js
 * utilities on match page
 * @author taised, Jestar, LA-MJ
 */
////////////////////////////////////////////////////////////////////////////////
if (!Foxtrick.Pages)
	Foxtrick.Pages = {};

Foxtrick.Pages.Match = {
	getHomeTeam: function(doc) {
		var homeIdx = Foxtrick.util.layout.isRtl(doc) ? 1 : 0;
		var link;
		if (Foxtrick.isPage(doc, 'matchesLive')) {
			link = doc.querySelectorAll('.liveTabText a')[homeIdx];
		}
		else {
			var body = doc.getElementById('mainBody');
			var teams = body.querySelectorAll('h1 > a, h1 > span > a');
			link = teams[homeIdx];
		}
		return link;
	},
	getAwayTeam: function(doc) {
		var awayIdx = Foxtrick.util.layout.isRtl(doc) ? 0 : 1;
		var link;
		if (Foxtrick.isPage(doc, 'matchesLive')) {
			link = doc.querySelectorAll('.liveTabText a')[awayIdx];
		}
		else {
			var body = doc.getElementById('mainBody');
			var teams = body.querySelectorAll('h1 > a, h1 > span > a');
			link = teams[awayIdx];
		}
		return link;
	},
	getHomeTeamId: function(doc) {
		var team = this.getHomeTeam(doc);
		return team ? Foxtrick.util.id.getTeamIdFromUrl(team.href) : null;
	},
	getAwayTeamId: function(doc) {
		var team = this.getAwayTeam(doc);
		return team ? Foxtrick.util.id.getTeamIdFromUrl(team.href) : null;
	},
	getHomeTeamName: function(doc) {
		var team = this.getHomeTeam(doc);
		return team ? team.textContent : null;
	},
	getAwayTeamName: function(doc) {
		var team = this.getAwayTeam(doc);
		return team ? team.textContent : null;
	},
	isPrematch: function(doc) {
		return doc.getElementById('ctl00_ctl00_CPContent_CPMain_pnlPreMatch') !== null;
	},
	hasRatingsTabs: function(doc) {
		return doc.getElementById('divSectors') !== null;
	},
	getSourceSystem: function(doc) {
		var SourceSystem = 'Hattrick';
		var isYouth = this.isYouth(doc);
		var isHTOIntegrated = this.isHTOIntegrated(doc);
		if (isYouth)
			SourceSystem = 'Youth';
		if (isHTOIntegrated)
			SourceSystem = 'HTOIntegrated';
		return SourceSystem;
	},
	isYouth: function(doc) {
		return /isYouth=true|SourceSystem=Youth/i.test(doc.location.search);
	},
	isHTOIntegrated: function(doc) {
		return /SourceSystem=HTOIntegrated/i.test(doc.location.search);
	},
	isNT: function(doc) {
		var homeId = this.getHomeTeamId(doc);
		var awayId = this.getAwayTeamId(doc);
		return homeId && awayId && homeId < 10000 && awayId < 10000 || false;
	},

	getId: function(doc) {
		var url;
		if (Foxtrick.isPage(doc, 'matchesLive')) {
			var link = doc.querySelector('.liveResult a');
			if (!link)
				return null;
			else
				url = link.href;
		}
		else {
			url = doc.location.href;
		}
		return Foxtrick.util.id.getMatchIdFromUrl(url);
	},
	/**
	 * Get match date
	 * @param  {document} doc
	 * @return {Date}
	 */
	getDate: function(doc) {
		var date = doc.getElementsByClassName('date')[0];
		return Foxtrick.util.time.getDateFromText(date.textContent);
	},

	inProgress: function(doc) {
		var matchStatus = doc.getElementById('ctl00_ctl00_CPContent_CPMain_lblMatchStatus');
		return matchStatus !== null && matchStatus.textContent.trim() !== '';
	},

	getRatingsTable: function(doc) {
		return doc.querySelector('.teamMatchRatingsTable table');
	},

	hasIndSetPieces: function(ratingstable) {
		// either iSP level link in that cell or for old matches tactic=no link
		return ratingstable.rows.length > 10 && ratingstable.rows[10].cells.length > 1 &&
			ratingstable.rows[10].cells[1].getElementsByTagName('a').length > 0;
	},

	isWalkOver: function(ratingstable) {
		try {
			for (var i = 1; i <= 7; i++) {
				for (var j = 3; j <= 4; j++) {
					var value = parseInt(ratingstable.rows[i].cells[j].textContent, 10);
					if (value > 0) { // no Walk-over
						return false;
					}
				}
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}
		return true;
	},

	getRatingsByTeam: function(ratingstable) {
		var getRatingFromCell = function(coords) {
			var cell = ratingstable.rows[coords[0]].cells[coords[1]];
			return Foxtrick.Math.hsToFloat(cell.textContent);
		};
		var ratings = {};
		// rows 1-7 contain numeric data (columns 3-4) for both team ratings in this order:
		var order = ['mf', 'rd', 'cd', 'ld', 'ra', 'ca', 'la'];
		for (var i = 1; i <= 7; i++) {
			ratings[order[i - 1]] = Foxtrick.map(getRatingFromCell, [[i, 3], [i, 4]]);
		}
		return ratings;
	},
	getTacticsLevelFromCell: function(cell) {
		var basevalue = 0;
		var tacticsLink = cell.getElementsByTagName('a')[0];
		if (tacticsLink) {
			basevalue = Foxtrick.util.id.getSkillLevelFromLink(tacticsLink.href);
		}
		return basevalue;
	},

	getTacticsFromCell: function(cell) {
		var tactics = cell.textContent.trim();
		var lang = Foxtrick.Prefs.getString('htLanguage');

		try {
			var category = Foxtrick.L10n.htLanguagesJSON[lang].language['tactics'];
			var subLevelValue = Foxtrick.nth(function(item) {
				return item.value == tactics;
			}, category).type;
			return subLevelValue || -1;
		}
		catch (e) {
			Foxtrick.log('getTacticsFromCell', e);
		}
		return null;
	},
	/**
	 * Get tactics data for home and away teams
	 * E. g. { tactics: ['aow', 'normal'], level: [15, 0] }
	 * @param  {HTMLTableElement}                                ratingstable
	 * @return { tactics: Array.<string>, level: Array.<number>}
	 */
	getTacticsByTeam: function(ratingstable) {
		var tacticRow = 10, levelRow = 11;
		if (this.hasIndSetPieces(ratingstable)) {
			tacticRow = 14;
			levelRow = 15;
		}
		var tactics = [
			this.getTacticsFromCell(ratingstable.rows[tacticRow].cells[1]),
			this.getTacticsFromCell(ratingstable.rows[tacticRow].cells[2])
		];
		var level = [
			parseInt(ratingstable.rows[levelRow].cells[3].textContent, 10) || 0,
			parseInt(ratingstable.rows[levelRow].cells[4].textContent, 10) || 0
		];
		return { tactics: tactics, level: level };
	},

	// START NEW RATINGS UTILS

	/**
	 * Add a listener to changes of tabId in HT-Live matches.
	 * Calls callback(doc) on mutation.
	 * Registers a chain of MOs to by-pass the Live timer.
	 * Cannot use subtree: true on the container because
	 * change() would execute every second in FF.
	 * This is because the match timer triggers childList changes in FF.
	 * @param {HTMLDocument}           doc
	 * @param {string}                 tabId    element to listen to
	 * @param {function(HTMLDocument)} callback
	 */
	addLiveTabListener: function(doc, tabId, callback) {
		var registerTab = function(doc) {
			callback(doc);
			var target = doc.getElementById(tabId);
			if (target) {
				// found the right tab
				Foxtrick.onChange(target, callback);
			}
		};
		var registerMatch = function(doc) {
			registerTab(doc);
			var target = doc.getElementById('ctl00_ctl00_CPContent_CPMain_phLiveStatusPanel');
			if (target) {
				// found match view
				Foxtrick.onChange(target, registerTab, { subtree: false });
			}
		};
		// start everything onLoad
		registerMatch(doc);
		var liveContainer = doc.getElementById('ctl00_ctl00_CPContent_CPMain_UpdatePanelMatch');
		if (liveContainer) {
			// this the largest container that contains overview OR match view
			Foxtrick.onChange(liveContainer, registerMatch, { subtree: false });
		}
	},

	/* modeled on Foxtrick.addBoxToSidebar
	 * @desc add a box to the sidebar on the right
	 * @param doc - HTML document the content is to be added on
	 * @param title - the title of the box, will create one if inexists
	 * @param content - HTML node of the content
	 * @param prec - precedence of the box, smaller value will be placed higher
	 * @return box to be added to
	 */
	addBoxToSidebar: function(doc, title, content, prec) {
		if (this.isPrematch(doc))
			// redirect to old style in prematch
			return Foxtrick.addBoxToSidebar.apply(Foxtrick, arguments);

		var sidebar = doc.getElementsByClassName('reportHighlights')[0];
		if (!sidebar)
			return;

		// class of the box to add
		var boxClass = 'ft-newSidebarBox';

		// destination box
		var dest;

		// existing sidebar boxes
		var existings = sidebar.getElementsByClassName(boxClass + ', .rightHandBoxHeader');
		for (var i = 0; i < existings.length; ++i) {
			var box = existings[i];
			var hdr = box.getElementsByClassName('rightHandBoxHeader')[0].textContent;
			if (hdr == title)
				dest = box; // found destination box
		}
		// create new box if old one doesn't exist
		if (!dest) {
			dest = doc.createElement('div');
			dest.className = boxClass;
			dest.setAttribute('x-precedence', prec);
			// boxHead
			var boxHead = doc.createElement('div');
			dest.appendChild(boxHead);
			// header
			var header = doc.createElement('h4');
			header.className = 'rightHandBoxHeader';
			header.textContent = title;
			boxHead.appendChild(header);
			// boxBody
			var boxBody = doc.createElement('div');
			boxBody.className = 'rightHandBoxBody';
			dest.appendChild(boxBody);
			// append content to boxBody
			boxBody.appendChild(content);
			// now we insert the newly created box
			var inserted = false;
			if (existings.length) {
				for (var i = 0; i < existings.length; ++i) {
					// precedence of current box, hattrick boxes are set to 0
					var curPrec = parseInt(existings[i].getAttribute('x-precedence'), 10) || 0;
					if (curPrec > prec) {
						if (i === 0 && curPrec === 0)
							// first to be added and placed before HT boxes. add it on top
							// before possible updatepanel div (eg teampage challenge and mailto)
							sidebar.insertBefore(dest, sidebar.firstChild);
						else
							existings[i].parentNode.insertBefore(dest, existings[i]);
						inserted = true;
						break;
					}
				}
			}
			else if (prec < 0) {
				sidebar.insertBefore(dest, sidebar.firstChild);
				inserted = true;
			}

			if (!inserted)
				sidebar.appendChild(dest);
		}

		// finally we add the content
		dest.getElementsByClassName('rightHandBoxBody')[0].appendChild(content);

		return dest;
	},
	modPlayerDiv: function(playerId, func, links) {
		var link = Foxtrick.filter(function(link) {
			return new RegExp(playerId).test(link.href);
		}, links)[0];
		if (link && typeof(func) == 'function')
			func(link.parentNode.parentNode);
	},
	parsePlayerData: function(doc) {
		var playerData = null;
		try {
			var json = doc.querySelector('#matchdata [id$="lblPlayerData"]').textContent;
			playerData = JSON.parse(json);
		}
		catch (e) {
			Foxtrick.error('FAILED to parse player JSON', e);
		}
		return playerData;
	},
	/**
	 * get timeline data as array of {min, sec}
	 * each minute/event has input.hidden[id$="_time"][value="min.sec"]
	 * @param  {document} doc
	 * @return {Array}        [{min: Integer, sec: Integer},..]
	 */
	getTimeline: function(doc) {
		var timeline = Foxtrick.map(function(el) {
			var time = el.value;
			return { min: parseInt(time.match(/^\d+/), 10), sec: parseInt(time.match(/\d+$/), 10) };
		}, doc.querySelectorAll('input[id$="_time"]'));
		return timeline;
	},
	/**
	 * Get team ratings event by event
	 * each minute has input.hidden[id$="_playerRatingsHome"][value="jsonArray"]
	 * Returns an array of {players, source}
	 * Where source is the input element
	 * and players is an array of Player objects
	 * { Cards: 0,	FromMin: -1, InjuryLevel: 0, IsCaptain: false,
	 * 	IsKicker: false, PlayerId: 360991810, PositionBehaviour: 0,
	 * 	PositionID: 100, Stamina: 1, Stars: 3, ToMin: 90 }
	 * @param  {document} doc
	 * @param  {Boolean}  isHome
	 * @return {Array}           [{players: Array, source: HTMLInputElement}]
	 */
	getTeamRatingsByEvent: function(doc, isHome) {
		var playerRatings = doc.querySelectorAll('input[id$="_playerRatings' +
												 (isHome ? 'Home' : 'Away') + '"]');
		var playerRatingsByEvent = Foxtrick.map(function(ratings) {
			return { players: JSON.parse(ratings.value), source: ratings };
		}, playerRatings);
		// keep playerRatingsByEvent[i].source as a pointer to the input
		// so that we know where to save
		return playerRatingsByEvent;
	},
	/**
	 * Get event indices event by event
	 * doc.querySelectorAll('input[id$="_eventIndex"]') points to the report tab
	 * Returns an array of {eventIdx, idx}
	 * Where eventIdx is the event index in the report (xml),
	 * used ot match highlights (#matchEventIndex_ + eventIdx)
	 * 5 minute updates have index=0, no event
	 * While idx is the timeline index (starts at 0, includes 5 minute updates)
	 * @param  {document} doc
	 * @return {Array}        [{eventIdx: Integer, idx: Integer},..]
	 */
	getEventIndicesByEvent: function(doc) {
		var eventIndices = doc.querySelectorAll('input[id$="_eventIndex"]');
		var eventIndexByEvent = Foxtrick.map(function(index, i) {
			return { eventIdx: index.value, idx: i };
		}, eventIndices);
		return eventIndexByEvent;
	}
};
