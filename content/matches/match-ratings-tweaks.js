'use strict';
/**
 * match-ratings-tweaks.js
 * tweak detail ratings tab in match report
 * @author LA-MJ
 */

Foxtrick.modules['MatchRatingsTweaks'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match'],
	//CSS: Foxtrick.InternalPath + 'resources/css/match-ratings-tweaks.css',
	OPTIONS: [
		'FollowChanges',
		'RealProbabilities'
	],
	OPTIONS_CSS: [
		Foxtrick.InternalPath + 'resources/css/match-ratings-follow.css',
		Foxtrick.InternalPath + 'resources/css/match-ratings-probabilities.css',
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

		var doChanges = FoxtrickPrefs.isModuleOptionEnabled('MatchRatingsTweaks', 'FollowChanges');
		var doProb = FoxtrickPrefs.isModuleOptionEnabled('MatchRatingsTweaks', 'RealProbabilities');
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

			// add team names
			var home = Foxtrick.Pages.Match.getHomeTeamName(doc);
			var away = Foxtrick.Pages.Match.getAwayTeamName(doc);
			var targ = doc.getElementById('sectorsField');
			var aDiv = Foxtrick.createFeaturedElement(doc, this, 'div');
			Foxtrick.addClass(aDiv, 'ft-mrt-teamName');
			aDiv.id = 'ft-mrt-awayName';
			aDiv.textContent = away;
			targ.insertBefore(aDiv, targ.firstChild);
			aDiv = Foxtrick.createFeaturedElement(doc, this, 'div');
			Foxtrick.addClass(aDiv, 'ft-mrt-teamName');
			aDiv.id = 'ft-mrt-homeName';
			aDiv.textContent = home;
			targ.insertBefore(aDiv, targ.firstChild);
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

		if (doProb) {
			var p = doc.getElementById('probabilityDesc');
			if (!p) {
				p = doc.querySelector('#sectorWrapper ~ p');
				p.id = 'probabilityDesc';
				p.textContent = '';
				var b = Foxtrick.createFeaturedElement(doc, this, 'strong');
				b.textContent = Foxtrickl10n.getString('MatchRatingsTweaks.probability.note');
				p.appendChild(b);
			}
		}


		Foxtrick.startListenToChange(doc);
	},
};
