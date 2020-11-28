/**
 * match-order-new.js
 * @author jazzzzz
 */

'use strict';

Foxtrick.modules.MatchOrderNew = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['matchOrderNew'],
	OPTIONS: ['UseRatingsModule'],
	CSS: Foxtrick.InternalPath + 'resources/css/match-order-new.css',

	TACTIC_NAMES: [
		'normal', 'pressing',
		'ca', 'aim', 'aow',
		'', '',
		'creatively', 'longshots',
	],

	/** @param {document} doc */
	run: function(doc) {
		const module = this;

		const isYouth = Foxtrick.Pages.Match.isYouth(doc);
		const useRatings = Foxtrick.Prefs.isModuleEnabled('Ratings') &&
			Foxtrick.Prefs.isModuleOptionEnabled(module, 'UseRatingsModule');

		if (!isYouth && useRatings)
			module.runRatings(doc);
	},

	/** @param {document} doc */
	runRatings(doc) {
		const module = this;

		var ensureTable = function() {
			const TABLE_ID = 'ft_simulation_ratings_table';
			let ratingsTable = doc.getElementById(TABLE_ID);
			if (ratingsTable)
				return ratingsTable;

			let ratingsDiv = Foxtrick.createFeaturedElement(doc, module, 'div');
			ratingsDiv.id = 'ft_simulation_ratings-new';

			let ratingsLabel = doc.createElement('h2');
			ratingsDiv.appendChild(ratingsLabel).textContent =
				Foxtrick.L10n.getString('matchOrder.ratings');

			ratingsTable = doc.createElement('table');
			ratingsDiv.appendChild(ratingsTable).id = TABLE_ID;

			let scope = doc.querySelector('.ng-scope[ng-if="lineupMgr"]');

			// let content = scope.querySelector('.mo-field .htbox-content');

			scope.appendChild(ratingsDiv);

			return ratingsTable;
		};

		var updateRatings = function() {
			const PRED_CLS = 'mo-field-rating-predicitons';
			const PRED_DIFF_CLS = 'mo-field-rating-predicitons-diff';

			// doc.querySelectorAll(`.${PRED_CLS} div.ng-binding[ng-repeat*='SectorRatings'i]`)

			var predictions =
				doc.querySelectorAll(`.${PRED_CLS} .ng-binding:not(.${PRED_DIFF_CLS})`);

			if (predictions.length === 0)
				return;

			var ratings = [...predictions].map(elem => [Number(elem.textContent.trim()) - 1, 0]);

			/** @type {HTMLSelectElement} */
			// var tacticType = doc.querySelector('#mo-tacticType');
			var tacticType =
				doc.querySelector('.mo-field .htbox-footer select:not(#mo-speechLevel)');

			if (!tacticType)
				return;

			var tactics = module.TACTIC_NAMES[tacticType.value];

			var tLevelSpan = doc.querySelector('.mo-field-rating-predicitons-tactic span');
			var tacticLevel = Foxtrick.L10n.getLevelFromText(tLevelSpan.textContent.trim());

			var ratingsTable = ensureTable();
			var newTable = ratingsTable.cloneNode(false);

			Foxtrick.modules.Ratings.addRatings(doc, newTable,
			    ratings[3], ratings[0], ratings[1], ratings[2], ratings[4], ratings[5], ratings[6],
			    [tactics, ''], [tacticLevel, ''], false);

			ratingsTable.parentNode.replaceChild(newTable, ratingsTable);
		};

		var addUpdateListener = (function() {
			const LINEUP_Q = '.mo-field-view-lineup, .htbox-left[ng-class*="mo-field-view-lineup"]';

			var lineups = new WeakSet();
			var holders = new WeakSet();

			return function updateListener() {
				let lineupView = doc.querySelector(LINEUP_Q);
				if (!Foxtrick.hasClass(lineupView, 'mo-field-view-lineup')) {
					updateRatings();
					if (!lineupView || lineups.has(lineupView))
						return;

					lineups.add(lineupView);
					Foxtrick.onChange(lineupView, updateListener);
					return;
				}

				let predictionsHolder = doc.querySelector('.mo-field-rating-predicitons-holder');
				if (!predictionsHolder)
					return;

				if (holders.has(predictionsHolder))
					return;

				holders.add(predictionsHolder);
				Foxtrick.onChange(predictionsHolder, updateRatings, { characterData: true });
				updateRatings();
			};
		})();

		let wizard = doc.querySelector('.ht-tabs-wizard');
		if (!wizard)
			return;

		Foxtrick.onClick(wizard, addUpdateListener);
		addUpdateListener();
	},
};
