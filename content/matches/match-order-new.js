/**
 * match-order-new.js
 * @author jazzzzz
 */

'use strict';

Foxtrick.modules.MatchOrderNew = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['matchOrderNew'],
	OPTIONS: ['UseRatingsModule'],
	CSS: Foxtrick.InternalPath + 'resources/css/match-simulator.css',

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

		var updateRatings = function() {
			const PRED_CLS = 'mo-field-rating-predicitons';
			const PRED_DIFF_CLS = 'mo-field-rating-predicitons-diff';

			var predictions =
				doc.querySelectorAll(`.${PRED_CLS} span.ng-binding:not(.${PRED_DIFF_CLS})`);

			if (predictions.length === 0)
				return;

			var ratings = [...predictions].map(elem => [Number(elem.textContent.trim()) - 1, 0]);

			Foxtrick.modules.Ratings.initHtRatings();

			/** @type {HTMLInputElement} */
			var tacticType = doc.querySelector('#mo-tacticType');
			var tactics = module.TACTIC_NAMES[tacticType.value];

			var tLevelSpan = doc.querySelector('.mo-field-rating-predicitons-tactic span');
			var tacticLevel = Foxtrick.L10n.getLevelFromText(tLevelSpan.textContent.trim());

			var ratingsTable = doc.getElementById('ft_simulation_ratings_table');
			var newTable = ratingsTable.cloneNode(false);

			Foxtrick.modules.Ratings.addRatings(doc, newTable,
			    ratings[3], ratings[0], ratings[1], ratings[2], ratings[4], ratings[5], ratings[6],
			    [tactics, ''], [tacticLevel, ''], false);

			ratingsTable.parentNode.replaceChild(newTable, ratingsTable);
		};

		var addUpdateListener = function() {
			let predictionsHolder = doc.querySelector('.mo-field-rating-predicitons-holder');
			if (!predictionsHolder)
				return;

			Foxtrick.onChange(predictionsHolder, updateRatings, { characterData: true });
			updateRatings();
		};

		let ratingsDiv = Foxtrick.createFeaturedElement(doc, module, 'div');
		ratingsDiv.id = 'ft_simulation_ratings';
		let ratingsLabel = doc.createElement('h2');
		ratingsDiv.appendChild(ratingsLabel).textContent =
			Foxtrick.L10n.getString('matchOrder.ratings');

		let ratingsTable = doc.createElement('table');
		ratingsDiv.appendChild(ratingsTable).id = 'ft_simulation_ratings_table';
		doc.getElementById('content').appendChild(ratingsDiv);

		setTimeout(function() {
			doc.querySelector('.ht-tabs-wizard').addEventListener('click', function() {
				setTimeout(addUpdateListener, 1000);
			});
			setTimeout(addUpdateListener, 1000);
		}, 2000);

	},
};
