/**
 * maxtools.js
 * Shows which would be the last official u20/u21 match of a certain player.
 * @author: KaueFelipeBR, MaxDareDevil
 */

'use strict';

/* eslint-disable no-magic-numbers */

Foxtrick.modules.Maxtools = {
    MODULE_CATEGORY: Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
    PAGES: [
        'youthPlayerDetails', 'playerDetails',
        'allPlayers', 'youthPlayers',
        'transferSearchResult',
    ],    
    OPTIONS: ['RomanNumberEdition'],

    /** @param {document} doc */
    // eslint-disable-next-line complexity
    run: function (doc) {
        const module = this;

        var isYouthPlayerDetailsPage = Foxtrick.isPage(doc, 'youthPlayerDetails');
        var isSeniorPlayerDetailsPage = Foxtrick.isPage(doc, 'playerDetails');
        var isPlayersPage = Foxtrick.isPage(doc, 'allPlayers');
        var isYouthPlayersPage = Foxtrick.isPage(doc, 'youthPlayers');
        var isTransferResultsPage = Foxtrick.isPage(doc, 'transferSearchResult');

        ////var isYouthEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'YouthPlayers');
        ////var isSeniorsEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'SeniorPlayers');
        ////var isPlayersEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'AllPlayers');
        ////var isTransferEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'TransfersResults');
               

        //// If the option isn't enabled for this page, don't show.
        //if (isYouthPlayerDetailsPage && !isYouthEnabled)
        //	return;
        //if (isSeniorPlayerDetailsPage && !isSeniorsEnabled)
        //	return;
        //if (isPlayersPage && !isPlayersEnabled)
        //	return;
        //if (isTransferResultsPage && !isTransferEnabled)
        //	return;

        if (isYouthPlayerDetailsPage || isSeniorPlayerDetailsPage) {
            module.runPlayer(doc);
        }


        //else if (isPlayersPage || isYouthPlayersPage)
        //	module.runPlayerList(doc);
        //else if (isTransferResultsPage)
        //	module.runTransferList(doc);
    },

	/**
	 * @typedef MaxToolPerfectAge
	 * @prop {string} type
	 * @prop {string} scheduler
	 * @prop {number} edition
	 * @prop {string} phase
     * @prop {number} match	 
	 * @prop {number} last_phase_match
	 * @prop {number} training_weeks
	 */

	/**
	 * @param  {string} text	 
	 * @return {Array<MaxToolPerfectAge>}
	 */
    buildMaxToolPerfectAge: function (text) {
        const module = this;

        /** @type {Array<MaxToolPerfectAge>} */
        var champsList = JSON.parse(text);
        return champsList;
    },

    /** @param {document} doc */
    runPlayer: function (doc) {
        const module = this;

        const TITLE_STR = Foxtrick.L10n.getString('MaxTools.eligibilityTitle');
        const EDITION_STR = Foxtrick.L10n.getString('MaxTools.edition');
        const MATCH_STR = Foxtrick.L10n.getString('MaxTools.match');
        const TMPL_STR = Foxtrick.L10n.getString('MaxTools.templateWithoutTable');
        const LAST_MATCH_STR = Foxtrick.L10n.getString('MaxTools.lastMatch');

        var isRomanNumberEditionEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'RomanNumberEdition'); 

        if (Foxtrick.Pages.Player.wasFired(doc))
            return;

        let age = Foxtrick.Pages.Player.getAge(doc);        

        const HTMT_PATH = 'https://ht-mt.org';
        var url = `${HTMT_PATH}/maxtools-api/perfect-age/${age.years}/${age.days}`;

        console.log("vou chamar " + url);
        Foxtrick.load(url).then(function (r) {
            var text = /** @type {string} */ (r);
            console.log(text);
            let champsList = module.buildMaxToolPerfectAge(text);
            console.log(champsList);

            let entryPoint =
                doc.querySelector('#mainBody > .mainBox') ||
                doc.querySelector('#mainBody > .playerInfo');

            let wrapper = Foxtrick.createFeaturedElement(doc, module, 'div');
            Foxtrick.addClass(wrapper, 'mainBox');
            let titleElement = doc.createElement('h2');
            titleElement.textContent = TITLE_STR;
            wrapper.appendChild(titleElement);


            champsList.forEach(function (championship) {
                if (Object.keys(championship).length !== 0) {
                    let editionNum = isRomanNumberEditionEnabled ? Foxtrick.decToRoman(championship.edition) : championship.edition;

                    let lastMatch = MATCH_STR.replace(/%1/, championship.match.toString());
                    lastMatch = lastMatch.replace(/%2/, championship.last_phase_match.toString());

                    let contentChamp = TMPL_STR;
                    contentChamp = contentChamp.replace(/%1/, LAST_MATCH_STR);
                    contentChamp = contentChamp.replace(/%2/, championship.type);
                    contentChamp = contentChamp.replace(/%3/, championship.scheduler);
                    contentChamp = contentChamp.replace(/%4/, EDITION_STR);
                    contentChamp = contentChamp.replace(/%5/, editionNum);
                    contentChamp = contentChamp.replace(/%6/, championship.phase);
                    contentChamp = contentChamp.replace(/%7/, lastMatch);

                    let textElement = doc.createElement('div');
                    textElement.textContent = contentChamp;
                    wrapper.appendChild(textElement);
                }
            });

            entryPoint.parentNode.insertBefore(wrapper, entryPoint.nextSibling);
        }, (er) => {
            console.log(er);
        }).catch(Foxtrick.catch(module));
    },
};
