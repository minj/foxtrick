'use strict';
/**
 * match-order-new.js
 * @author jazzzzz
 */

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

    run: function (doc) {
        var module = this;

        var IS_YOUTH = Foxtrick.Pages.Match.isYouth(doc);
        if (IS_YOUTH)
            return;


        var useRatings = Foxtrick.Prefs.isModuleEnabled('Ratings') &&
            Foxtrick.Prefs.isModuleOptionEnabled(module, 'UseRatingsModule');

        // ratings
        if (useRatings) {
            var ratingsDiv = Foxtrick.createFeaturedElement(doc, module, 'div');
            ratingsDiv.id = 'ft_simulation_ratings';
            var ratingsLabel = doc.createElement('h2');
            ratingsDiv.appendChild(ratingsLabel).textContent =
                Foxtrick.L10n.getString('matchOrder.ratings');
            var ratingsTable = doc.createElement('table');
            ratingsDiv.appendChild(ratingsTable).id = 'ft_simulation_ratings_table';
            document.getElementById("content").appendChild(ratingsDiv);

            setTimeout(function(){
                document.querySelector(".ht-tabs-wizard").addEventListener('click', function(){
                    setTimeout(addUpdateListener, 1000);
                });
                setTimeout(addUpdateListener, 1000);
            }, 2000);
        }


		var updateRatings = function () {
			var ratings = Array.from(document.querySelectorAll('.mo-field-rating-predicitons span.ng-binding:not(.mo-field-rating-predicitons-diff)'))
				.map(elem => [elem.textContent - 1,0] );
			if(ratings.length===0){
				return;
			}
			Foxtrick.modules['Ratings'].initHtRatings();

			var tactics = Foxtrick.modules.MatchOrderNew.TACTIC_NAMES[doc.getElementById('mo-tacticType').value];
			var tacticLevel = Foxtrick.L10n.getLevelFromText(document.querySelector('.mo-field-rating-predicitons-tactic span').textContent.trim());
			if(tacticLevel){
				tacticLevel = tacticLevel.toString();
			}

			var ratingsTable = doc.getElementById('ft_simulation_ratings_table');
			var newTable = ratingsTable.cloneNode(false);
			Foxtrick.modules['Ratings'].addRatings(
				doc, newTable,
				ratings[3], ratings[0], ratings[1], ratings[2], ratings[4], ratings[5], ratings[6],
				[tactics,''], [tacticLevel,""], false
			);

			ratingsTable.parentNode.replaceChild(newTable, ratingsTable);
		}

		function addUpdateListener() {
			MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

			let predictionsDomElement = document.querySelector(".mo-field-rating-predicitons-holder");
			if(!predictionsDomElement ){
				return;
			}
			var observer = new MutationObserver(function (mutations, observer) {
				updateRatings();
			});

			observer.observe(predictionsDomElement, {
				subtree: true,
				attributes: false,
				characterData: true,
				childList: true
			});
			updateRatings();
		}

    }
};
