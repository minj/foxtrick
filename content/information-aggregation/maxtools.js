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
    OPTIONS: ['RomanNumberEdition', 'YouthPlayers', 'SeniorPlayers', 'AllPlayers'],



    /** @param {document} doc */
    // eslint-disable-next-line complexity
    run: function (doc) {
        const module = this;

        var isYouthPlayerDetailsPage = Foxtrick.isPage(doc, 'youthPlayerDetails');
        var isSeniorPlayerDetailsPage = Foxtrick.isPage(doc, 'playerDetails');
        var isPlayersPage = Foxtrick.isPage(doc, 'allPlayers');
        var isYouthPlayersPage = Foxtrick.isPage(doc, 'youthPlayers');

        var isYouthEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'YouthPlayers');
        var isSeniorsEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'SeniorPlayers');
        var isPlayersEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'AllPlayers');


        // If the option isn't enabled for this page, don't show.
        if (isYouthPlayerDetailsPage && !isYouthEnabled)
            return;
        if (isSeniorPlayerDetailsPage && !isSeniorsEnabled)
            return;
        if (isPlayersPage && !isPlayersEnabled)
            return;

        if (isYouthPlayerDetailsPage || isSeniorPlayerDetailsPage) {
            module.runPlayer(doc);
        }
        else if (isPlayersPage || isYouthPlayersPage)
            module.runPlayerList(doc);
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
        var champsList = JSON.parse(text);
        return champsList;
    },

    /**
    * @param  {number} years
    * @param  {number} days
    * @param  {document} doc
    * @return {HTMLAnchorElement}
    */
    getLink: function (years, days, doc) {
        let lang = Foxtrick.Prefs.getString('htLanguage');
        let HTMT_PATH = 'https://ht-mt.org/nt/perfect-age';
        let skillQuery = `?lang=${lang}&years=${years}&days=${days}`;

        let link = doc.createElement('a');
        link.textContent = Foxtrick.L10n.getString('MaxTools.MoreDetails');
        link.href = HTMT_PATH + skillQuery;
        link.target = '_blank';
        link.rel = 'noopener';
        return link;
    },

    /** @param {document} doc */
    runPlayer: function (doc) {
        const module = this;

        const TITLE_STR = Foxtrick.L10n.getString('MaxTools.eligibilityTitle');
        const SUBTITLE_STR = Foxtrick.L10n.getString('MaxTools.eligibilitySubtitle');        

        if (Foxtrick.Pages.Player.wasFired(doc))
            return;

        let age = Foxtrick.Pages.Player.getAge(doc);

        const HTMT_PATH = 'https://ht-mt.org';
        var url = `${HTMT_PATH}/maxtools-api/perfect-age/${age.years}/${age.days}`;

        Foxtrick.load(url).then(function (r) {
            var text = /** @type {string} */ (r);
            let champsList = module.buildMaxToolPerfectAge(text);

            let entryPoint =
                doc.querySelector('#mainBody > .mainBox') ||
                doc.querySelector('#mainBody > .playerInfo');

            let wrapper = Foxtrick.createFeaturedElement(doc, module, 'div');
            Foxtrick.addClass(wrapper, 'mainBox');

            let titleElement = doc.createElement('h2');
            titleElement.textContent = TITLE_STR;
            wrapper.appendChild(titleElement);

            let subtitleElement = doc.createElement('h3');
            subtitleElement.textContent = SUBTITLE_STR;
            wrapper.appendChild(subtitleElement);

            module.appendChampsDetail(champsList, doc, wrapper, true);             

            let textElement = doc.createElement('div');
            textElement.appendChild(module.getLink(age.years, age.days, doc));
            wrapper.appendChild(textElement);

            entryPoint.parentNode.insertBefore(wrapper, entryPoint.nextSibling);
        }, (er) => {
            console.log(er);
        }).catch(Foxtrick.catch(module));
    },

    /** @param {document} doc */
    runPlayerList: function (doc) {
        const module = this;

        let players = Foxtrick.modules.Core.getPlayerList();
        for (let player of players) {

            const HTMT_PATH = 'https://ht-mt.org';
            var url = `${HTMT_PATH}/maxtools-api/perfect-age/${player.age.years}/${player.age.days}`;

            Foxtrick.load(url).then(function (r) {
                var text = /** @type {string} */ (r);
                let champsList = module.buildMaxToolPerfectAge(text);

                let container = Foxtrick.createFeaturedElement(doc, module, 'p');
                Foxtrick.addClass(container, 'ft-u20lastmatch');
                container.appendChild(module.getLink(player.age.years, player.age.days, doc));
                container.appendChild(doc.createTextNode(' '));

                
                module.appendChampsDetail(champsList, doc, container, false); 

                let entry = player.playerNode.querySelector('table') || player.playerNode.lastChild;
                while (entry.parentElement && entry.parentElement.matches('.flex'))
                    entry = entry.parentElement;

                Foxtrick.insertAfter(container, entry);
            }, (er) => {
                console.log(er);
            }).catch(Foxtrick.catch(module));
        }
    },

    /**    
    * @param {Array<MaxToolPerfectAge>} champsList
    * @param {document} doc
    * @param {boolean} extendedDescription
    * @param {HTMLParagraphElement} container
    */
    appendChampsDetail: function (champsList, doc, container, extendedDescription) {        
        const module = this;

        var isRomanNumberEditionEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'RomanNumberEdition');

        champsList.forEach(function (championship) {
            if (Object.keys(championship).length !== 0) {
                let editionNum = isRomanNumberEditionEnabled ? Foxtrick.decToRoman(championship.edition) : championship.edition;                

                let tmplStr = module.buildTmplStr(championship, editionNum, extendedDescription);                

                let champDiv = doc.createElement('div');
                champDiv.textContent = tmplStr;
                container.appendChild(champDiv);
            }
        });
    },

    /**
    * @param   {MaxToolPerfectAge} championship
    * @param   {string|number} editionNum
    * @param   {boolean} extendedDescription
    * @returns {string}
    */
    buildTmplStr: function (championship, editionNum, extendedDescription) {
        const MATCH_STR = Foxtrick.L10n.getString('MaxTools.match');
        const TMPL_STR = Foxtrick.L10n.getString('MaxTools.templateWithoutTable');

        var textFormat = extendedDescription ? MATCH_STR : "%1/%2";

        let strMatch = textFormat.replace(/%1/, championship.match.toString());
        strMatch = strMatch.replace(/%2/, championship.last_phase_match.toString());

        const TMPL_STR_SHORT = Foxtrick.L10n.getString('MaxTools.templateShortWithoutTable');
        const LAST_MATCH_STR = Foxtrick.L10n.getString('MaxTools.lastMatch');
        let contentChamp = extendedDescription ? TMPL_STR : TMPL_STR_SHORT;

        contentChamp = contentChamp.replace(/%1/, LAST_MATCH_STR);
        contentChamp = contentChamp.replace(/%2/, championship.type);

        if (extendedDescription) {
            const EDITION_STR = Foxtrick.L10n.getString('MaxTools.edition');

            contentChamp = contentChamp.replace(/%3/, championship.scheduler);
            contentChamp = contentChamp.replace(/%4/, EDITION_STR);
            contentChamp = contentChamp.replace(/%5/, editionNum.toString());
            contentChamp = contentChamp.replace(/%6/, championship.phase);
            contentChamp = contentChamp.replace(/%7/, strMatch);
        } else {
            contentChamp = contentChamp.replace(/%3/, championship.phase);
            contentChamp = contentChamp.replace(/%4/, editionNum.toString());
            contentChamp = contentChamp.replace(/%5/, strMatch);
        }
        

        return contentChamp;
    }
};

