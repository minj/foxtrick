'use strict';
/**
 * match-ratings-tweaks.js
 * tweak detail ratings tab in match report
 * @author LA-MJ
 */

Foxtrick.modules['MatchRatingsTweaks'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match'],
	CSS: Foxtrick.InternalPath + 'resources/css/match-ratings-tweaks.css',
	OPTIONS: [
		'FollowChanges',
		'RealProbabilities'
	],
	OPTIONS_CSS: [
		Foxtrick.InternalPath + 'resources/css/match-ratings-follow.css',
		null, // don't use a separate file as this option is dynamic
	],

	/**
	 * @param	{document}	doc
	 */
	run: function(doc) {
		if (Foxtrick.Pages.Match.isPrematch(doc)
			|| Foxtrick.Pages.Match.inProgress(doc))
			return;
		if (!Foxtrick.Pages.Match.hasNewRatings(doc))
			return;
		var module = this;
		var sectorsField = doc.getElementById('sectorsField');
		var doProb = FoxtrickPrefs.isModuleOptionEnabled('MatchRatingsTweaks', 'RealProbabilities');
		var doChanges = FoxtrickPrefs.isModuleOptionEnabled('MatchRatingsTweaks', 'FollowChanges');
		if (doChanges) {
			// add team names
			var home = Foxtrick.Pages.Match.getHomeTeamName(doc);
			var away = Foxtrick.Pages.Match.getAwayTeamName(doc);
			var aDiv = Foxtrick.createFeaturedElement(doc, this, 'div');
			Foxtrick.addClass(aDiv, 'ft-mrt-teamName ft-ratings-box');
			aDiv.id = 'ft-mrt-awayName';
			aDiv.textContent = away;
			sectorsField.insertBefore(aDiv, sectorsField.firstChild);
			aDiv = Foxtrick.createFeaturedElement(doc, this, 'div');
			Foxtrick.addClass(aDiv, 'ft-mrt-teamName ft-ratings-box');
			aDiv.id = 'ft-mrt-homeName';
			aDiv.textContent = home;
			sectorsField.insertBefore(aDiv, sectorsField.firstChild);
		}
		// add options
		var optionsDiv = Foxtrick.createFeaturedElement(doc, this, 'div');
		Foxtrick.addClass(optionsDiv, 'ft-ratings-box');
		optionsDiv.id = 'ft-matchRatingsOptions';
		var optionsTable = doc.createElement('table');
		optionsTable.id = 'ft-matchRatingsTable';
		var tbody = doc.createElement('tbody');
		var probTitle = Foxtrickl10n.getString('matchOrder.realProbabilities.title');
		var tr1 = doc.createElement('tr');
		var tdChkBox1 = doc.createElement('td');
		var chkbox1 = doc.createElement('input');
		chkbox1.type = 'checkbox';
		chkbox1.id = 'ft-matchRatingProb';
		chkbox1.title = probTitle;
		chkbox1.checked = doProb;
		Foxtrick.listen(chkbox1, 'change', function(ev) {
			FoxtrickPrefs.setBool('module.MatchRatingsTweaks.RealProbabilities.enabled',
								  ev.target.checked);
			var doc = ev.target.ownerDocument;
			var timelineButton = doc.getElementsByClassName('currentEvent')[0];
			Foxtrick.toggleClass(doc.getElementById('ft-probabilityDesc'), 'hidden');
			Foxtrick.toggleClass(doc.getElementById('ht-probabilityDesc'), 'hidden');
			if (timelineButton) {
				timelineButton.click();
				module.change(doc);
			}
		});
		tdChkBox1.appendChild(chkbox1);
		tr1.appendChild(tdChkBox1);
		var tdLabel1 = doc.createElement('td');
		var labelProb = doc.createElement('label');
		labelProb.for = 'ft-matchRatingProb';
		labelProb.textContent = Foxtrickl10n.getString('matchOrder.realProbabilities');
		labelProb.setAttribute('aria-label', labelProb.title = probTitle);
		tdLabel1.appendChild(labelProb);
		tr1.appendChild(tdLabel1);
		tbody.appendChild(tr1);
		optionsTable.appendChild(tbody);
		optionsDiv.appendChild(optionsTable);
		sectorsField.insertBefore(optionsDiv, sectorsField.firstChild);

		// add prob description
		var htP = doc.querySelector('#sectorWrapper ~ p');
		if (!htP.hasAttribute('id'))
			htP.id = 'ht-probabilityDesc';
		if (doProb)
			Foxtrick.addClass(htP, 'hidden');
		var p = Foxtrick.createFeaturedElement(doc, this, 'p');
		p.id = 'ft-probabilityDesc';
		var b = doc.createElement('strong');
		b.textContent = Foxtrickl10n.getString('MatchRatingsTweaks.probability.note');
		p.appendChild(b);
		if (!doProb)
			Foxtrick.addClass(p, 'hidden');
		htP.parentNode.insertBefore(p, htP);

		// run change now as sometimes we are too slow to init the listener
		// causing display to be broken on first load
		this.change(doc);
	},
	/**
	 * Placeholder for sector abbreviations
	 * @type {Array}
	 */
	sectorAbbrs: [],
	/**
	 * Placeholder for other strings
	 * @type {Object}
	 */
	l10n: {},
	/**
	 * init l10n strings
	 */
	initl10n: function() {
		var sectorOrder = ['rd','la','cd','ca','ld','ra','mf','mf','ra','ld','ca','cd','la','rd'];
		for (var i = 0, s; i < sectorOrder.length && (s = sectorOrder[i]); ++i) {
			this.sectorAbbrs[i] = Foxtrickl10n.getString('match.sector.' + s + '.abbr');
		}
		var l10n = [ 'change.title', 'probability.title', ];
		for (var i = 0, s; i < l10n.length && (s = l10n[i]); ++i) {
			this.l10n[s] = Foxtrickl10n.getString('MatchRatingsTweaks.' + s);
		}
	},
	/**
	 * Placeholder for ratings data
	 * matchid: { values: [], pctgs: []}
	 * @type {Object}
	 */
	sectorRatings: {},
	/**
	 * @param	{document}	doc
	 */
	change: function(doc) {
		if (Foxtrick.Pages.Match.isPrematch(doc)
			|| Foxtrick.Pages.Match.inProgress(doc))
			return;
		if (!Foxtrick.Pages.Match.hasNewRatings(doc))
			return;

		var doProb = FoxtrickPrefs.isModuleOptionEnabled('MatchRatingsTweaks', 'RealProbabilities');
		// sync the checkbox
		var chkbox = doc.getElementById('ft-matchRatingProb');
		if (chkbox && chkbox.checked !== doProb) {
			chkbox.checked = doProb;
			Foxtrick.toggleClass(doc.getElementById('ft-probabilityDesc'), 'hidden');
			Foxtrick.toggleClass(doc.getElementById('ht-probabilityDesc'), 'hidden');
		}
		var doChanges = FoxtrickPrefs.isModuleOptionEnabled('MatchRatingsTweaks', 'FollowChanges');
		if (!doChanges && !doProb)
			return;

		if (!this.sectorAbbrs.length)
			this.initl10n();

		var alreadyDone = doc.getElementsByClassName('ft-mrt-rating-calc').length > 0;
		if (alreadyDone)
			return;

		var ratings = doc.querySelectorAll('#sectorsField .teamNumberRatings');
		if (!ratings.length)
			// not ready yet
			return;

		Foxtrick.stopListenToChange(doc);

		if (doChanges) {
			var signedFloat = function(num) {
				return num >= 0 ? '+' + num.toFixed(2) : num.toFixed(2);
			};
			var signedInt = function(num) {
				return num >= 0 ? '+' + num : num;
			};

			var matchId = Foxtrick.Pages.Match.getId(doc);
			var data = this.sectorRatings[matchId], dataExists = false;
			if (typeof this.sectorRatings[matchId] === 'undefined') {
				this.sectorRatings[matchId] = data = { values: [], pctgs: [] };
			}
			else
				dataExists = true;

		}
		/**
		 * get the ith numeric rating or opponent rating in that sector
		 * opponent index is i + 1 if i is even, i - 1 if odd
		 * @param	{NodeList}	ratings
		 * @param	{Integer}	i
		 * @param	{Boolean}	isOpponentRating
		 * @returns	{Integer}
		 */
		var getRating = function(ratings, i, isOpponentRating) {
			var j = isOpponentRating ? (i % 2 ? i - 1 : i + 1) : i;
			return parseInt(ratings[j].textContent, 10);
		};

		for (var i = 0; i < ratings.length; ++i) {
			var num = getRating(ratings, i);
			var numOther = getRating(ratings, i, true);
			var ratio = num / (num + numOther);

			var box = ratings[i].parentNode;
			var sector = box.parentNode;
			var result = sector.getElementsByClassName('sectorResult')[0];

			if (doProb) {
				var prob;
				if (i == 6 || i == 7) {
					// midfield
					// [post=15766691.242]
					var first = Math.pow(ratio, 2.7);
					var second = Math.pow(1 - ratio, 2.7);
					prob = first / (first + second);
				}
				else {
					// [post=15766691.221]
					if (i < 6 && i % 2 || i > 7 && i % 2 == 0)
						// doing attack
						prob = Foxtrick.Math.tanh(6.9 * (ratio - 0.51)) * 0.455 + 0.46;
					else
						// doing defence
						prob = 1 - (Foxtrick.Math.tanh(6.9 * (1 - ratio - 0.51)) * 0.455 + 0.46);
				}
				var orig = result.textContent;
				result.textContent = Math.round(prob * 100) + '%';
				Foxtrick.makeFeaturedElement(result, this);
				result.setAttribute('aria-label', result.title =
									this.l10n['probability.title'].replace(/%s/, orig));
			}

			if (doChanges) {
				var calcBox = Foxtrick.createFeaturedElement(doc, this, 'div');
				Foxtrick.addClass(calcBox, 'ft-mrt-rating-calc');
				var value = num / 4 + 0.75;
				calcBox.textContent = value.toFixed(2) + ' ';
				var text = box.getElementsByClassName('teamTextRatings')[0];
				box.insertBefore(calcBox, text);

				var sectorLabel = box.getElementsByClassName('posLabel')[0];
				var fullSector = sectorLabel.textContent;
				sectorLabel.title = fullSector;
				sectorLabel.setAttribute('aria-label', fullSector);
				sectorLabel.textContent = this.sectorAbbrs[i];

				var pctg = parseInt(result.textContent, 10);

				if (dataExists) {
					var diff = value - data.values[i];
					if (diff) {
						var valueDiff = signedFloat(diff);
						var rDiff = Foxtrick.createFeaturedElement(doc, this, 'span');
						Foxtrick.addClass(rDiff, 'ft-mrt-rating-diff ft-color' + (diff < 0 ? 'Lower' : 'Higher'));
						rDiff.textContent = '(' + valueDiff + ')';
						rDiff.setAttribute('aria-label', rDiff.title = this.l10n['change.title']);
						calcBox.appendChild(rDiff);
					}
					diff = pctg - data.pctgs[i];
					if (diff) {
						var pctgDiff = signedInt(diff);
						var sDiff = Foxtrick.createFeaturedElement(doc, this, 'div');
						Foxtrick.addClass(sDiff, 'ft-mrt-sector-diff ft-color' + (diff < 0 ? 'Lower' : 'Higher'));
						sDiff.textContent = '(' + pctgDiff + '%)';
						sDiff.setAttribute('aria-label', sDiff.title = this.l10n['change.title']);
						result.appendChild(sDiff);
					}
				}
				data.values[i] = value;
				data.pctgs[i] = pctg;
			}
		}

		Foxtrick.startListenToChange(doc);
	},
};
