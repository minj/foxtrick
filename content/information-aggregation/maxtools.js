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
        var isTransferResultsPage = Foxtrick.isPage(doc, 'transferSearchResult');

        var isYouthEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'YouthPlayers');
        var isSeniorsEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'SeniorPlayers');
        var isPlayersEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'AllPlayers');
        var isTransferEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'TransfersResults');


        // If the option isn't enabled for this page, don't show.
        if (isYouthPlayerDetailsPage && !isYouthEnabled)
            return;
        if (isSeniorPlayerDetailsPage && !isSeniorsEnabled)
            return;
        if (isPlayersPage && !isPlayersEnabled)
            return;
        if (isTransferResultsPage && !isTransferEnabled)
            return;

        if (isYouthPlayerDetailsPage || isSeniorPlayerDetailsPage) {
            module.runPlayer(doc);
        }
        else if (isPlayersPage || isYouthPlayersPage)
            module.runPlayerList(doc);
        else if (isTransferResultsPage)
            module.runTransferList(doc);
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

    /** @param {document} doc */
    runPlayer: function (doc) {
        const module = this;

        const TITLE_STR = Foxtrick.L10n.getString('MaxTools.eligibilityTitle');
        const SUBTITLE_STR = Foxtrick.L10n.getString('MaxTools.eligibilitySubtitle');
        const EDITION_STR = Foxtrick.L10n.getString('MaxTools.edition');
        const MATCH_STR = Foxtrick.L10n.getString('MaxTools.match');
        const TMPL_STR = Foxtrick.L10n.getString('MaxTools.templateWithoutTable');
        const LAST_MATCH_STR = Foxtrick.L10n.getString('MaxTools.lastMatch');

        var isRomanNumberEditionEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'RomanNumberEdition');

        /**
         * @param  {number} years
         * @param  {number} days
         * @return {HTMLAnchorElement}
         */
        var getLink = function (years, days) {
            //console.log('chegou aqui');
            let lang = Foxtrick.Prefs.getString('htLanguage');
            //let prefix = 'http://www.fantamondi.it/HTMS/index.php' +
            //    `?page=htmspoints&lang=${lang}&action=calc`;
            let prefix = 'https://ht-mt.org/nt/perfect-age';
            let skillQuery = `?lang=${lang}&years=${years}&days=${days}`;

            let link = doc.createElement('a');
            link.textContent = Foxtrick.L10n.getString('MaxTools.MoreDetails');
            link.href = prefix + skillQuery;
            link.target = '_blank';
            link.rel = 'noopener';
            return link;
        }

        if (Foxtrick.Pages.Player.wasFired(doc))
            return;

        let age = Foxtrick.Pages.Player.getAge(doc);

        const HTMT_PATH = 'https://ht-mt.org';
        var url = `${HTMT_PATH}/maxtools-api/perfect-age/${age.years}/${age.days}`;

        //console.log("vou chamar " + url);
        Foxtrick.load(url).then(function (r) {
            var text = /** @type {string} */ (r);
            //console.log(text);
            let champsList = module.buildMaxToolPerfectAge(text);
            //console.log(champsList);

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
                    contentChamp = contentChamp.replace(/%5/, editionNum.toString());
                    contentChamp = contentChamp.replace(/%6/, championship.phase);
                    contentChamp = contentChamp.replace(/%7/, lastMatch);

                    let textElement = doc.createElement('div');
                    textElement.textContent = contentChamp;
                    wrapper.appendChild(textElement);
                }
            });

            let textElement = doc.createElement('div');
            textElement.appendChild(getLink(age.years, age.days));
            wrapper.appendChild(textElement);

            entryPoint.parentNode.insertBefore(wrapper, entryPoint.nextSibling);
        }, (er) => {
            console.log(er);
        }).catch(Foxtrick.catch(module));
    },

    /** @param {document} doc */
    runPlayerList: function (doc) {
        const module = this;

        const TITLE_STR = Foxtrick.L10n.getString('MaxTools.eligibilityTitle');
        const EDITION_STR = Foxtrick.L10n.getString('MaxTools.edition');
        const MATCH_STR = Foxtrick.L10n.getString('MaxTools.match');
        const TMPL_STR_SHORT = Foxtrick.L10n.getString('MaxTools.templateShortWithoutTable');
        const LAST_MATCH_STR = Foxtrick.L10n.getString('MaxTools.lastMatch');

        var isRomanNumberEditionEnabled = Foxtrick.Prefs.isModuleOptionEnabled(module, 'RomanNumberEdition');

        /**
         * @param  {number} years
         * @param  {number} days
         * @return {HTMLAnchorElement}
         */
        var getLink = function (years, days) {
            //console.log('chegou aqui');
            let lang = Foxtrick.Prefs.getString('htLanguage');
            //let prefix = 'http://www.fantamondi.it/HTMS/index.php' +
            //    `?page=htmspoints&lang=${lang}&action=calc`;
            let prefix = 'https://ht-mt.org/nt/perfect-age';
            let skillQuery = `?lang=${lang}&years=${years}&days=${days}`;

            let link = doc.createElement('a');
            link.textContent = Foxtrick.L10n.getString('MaxTools');
            link.href = prefix + skillQuery;
            link.target = '_blank';
            link.rel = 'noopener';
            return link;
        }

        let players = Foxtrick.modules.Core.getPlayerList();
        for (let player of players) {

            const HTMT_PATH = 'https://ht-mt.org';
            var url = `${HTMT_PATH}/maxtools-api/perfect-age/${player.age.years}/${player.age.days}`;

            Foxtrick.load(url).then(function (r) {
                var text = /** @type {string} */ (r);
                let champsList = module.buildMaxToolPerfectAge(text);

                let container = Foxtrick.createFeaturedElement(doc, module, 'p');
                Foxtrick.addClass(container, 'ft-u20lastmatch');
                container.appendChild(getLink(player.age.years, player.age.days));
                container.appendChild(doc.createTextNode(' '));


                champsList.forEach(function (championship) {
                    if (Object.keys(championship).length !== 0) {
                        let editionNum = isRomanNumberEditionEnabled ? Foxtrick.decToRoman(championship.edition) : championship.edition;

                        let lastMatch = championship.match.toString() + "/" + championship.last_phase_match.toString();
                        //let lastMatch = MATCH_STR.replace(/%1/, championship.match.toString());
                        //lastMatch = lastMatch.replace(/%2/, championship.last_phase_match.toString());

                        let contentChamp = TMPL_STR_SHORT;
                        contentChamp = contentChamp.replace(/%1/, LAST_MATCH_STR);
                        contentChamp = contentChamp.replace(/%2/, championship.type);
                        contentChamp = contentChamp.replace(/%3/, championship.phase);
                        contentChamp = contentChamp.replace(/%4/, editionNum.toString());
                        contentChamp = contentChamp.replace(/%5/, lastMatch);

                        let champDiv = doc.createElement('div');
                        champDiv.textContent = contentChamp;
                        container.appendChild(champDiv);
                    }
                });

                let entry = player.playerNode.querySelector('table') || player.playerNode.lastChild;
                while (entry.parentElement && entry.parentElement.matches('.flex'))
                    entry = entry.parentElement;

                Foxtrick.insertAfter(container, entry);                
            }, (er) => {
                console.log(er);
            }).catch(Foxtrick.catch(module));
            //if (player.age.years > 20)
            //    continue;

            //let { worldCupNumber, lastMatch, matchNumber, dateWhen21 } =
            //    module.calculate(doc, player.age);

            //let wcNum = Foxtrick.decToRoman(worldCupNumber);

            //let text = TMPL_STR;
            //text = text.replace(/%1/, TITLE_STR);
            //text = text.replace(/%2/, WC_STR);
            //text = text.replace(/%3/, wcNum);
            //text = text.replace(/%4/, lastMatch);

            //let container = Foxtrick.createFeaturedElement(doc, module, 'p');
            //Foxtrick.addClass(container, 'ft-u20lastmatch');
            //container.textContent = text;
            //container.dataset.value = String(dateWhen21.getTime());
            //container.dataset.valueString = `${wcNum}:${matchNumber}`;

            //let entry = player.playerNode.querySelector('table') || player.playerNode.lastChild;
            //while (entry.parentElement && entry.parentElement.matches('.flex'))
            //    entry = entry.parentElement;

            //Foxtrick.insertAfter(container, entry);
        }
    },
};
