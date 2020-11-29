'use strict';
/**
 * haruspex-prediction.js
 * @author lucaxvi
 */

Foxtrick.modules['HaruspexPrediction'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match'],
	CSS: Foxtrick.InternalPath + 'resources/css/haruspex-prediction.css',

	run: function(doc) {
		// check if match is finished
		if (doc.querySelector('div.match-overlay-chance-distribution') == null)
			return;

		// request parameters
		var url = 'https://haruspex.altervista.org/foxtrick?id=';
		url += Foxtrick.Pages.Match.getId(doc);

		if (Foxtrick.Pages.Match.isHTOIntegrated(doc))
			url += '&type=hto';
		else if (Foxtrick.Pages.Match.isYouth(doc))
			url += '&type=youth';
		else
			url += '&type=hattrick';

		// prepare haruspex box
		var haruspex = Foxtrick.createFeaturedElement(doc, this, 'div');
		haruspex.classList.add('htbox', 'ft-haruspex');

		var header = doc.createElement('h2');
		header.className = 'htbox-header';
		haruspex.appendChild(header);
		var icon = header.appendChild(doc.createElement('span'));
		icon.className = 'htbox-header-icon';
		icon = icon.appendChild(doc.createElement('i'));
		icon.className = 'icon-box-star';
		header.appendChild(doc.createTextNode(Foxtrick.L10n.getString('HaruspexPrediction.title')));

		var link = header.appendChild(doc.createElement('span'));
		link.className = 'htbox-header-right';
		link = link.appendChild(doc.createElement('a'));
		link.setAttribute('href', url.replace('foxtrick', 'matches'));
		link.setAttribute('target', '_blank');
		link = link.appendChild(doc.createElement('i'));
		link.className = 'icon-new-tab';

		var content = doc.createElement('div');
		content.className = 'htbox-content ft-dummy';
		var teams = content.appendChild(doc.createElement('div'));
		teams.className = 'flex flex-space-between';
		haruspex.appendChild(content);
		var team = teams.appendChild(doc.createElement('div'));
		team.textContent = Foxtrick.L10n.getString('HaruspexPrediction.home');
		team = teams.appendChild(doc.createElement('div'));
		team.textContent = Foxtrick.L10n.getString('HaruspexPrediction.draw');
		team = teams.appendChild(doc.createElement('div'));
		team.textContent = Foxtrick.L10n.getString('HaruspexPrediction.away');

		Foxtrick.load(url).then(function(response) {
			var prediction = Foxtrick.parseJSON(response);

			// prediction bars
			var bars = content.appendChild(doc.createElement('div'));
			bars.className = 'prediction flex';
			var barHome = bars.appendChild(doc.createElement('div'));
			barHome.className = 'prediction-home';
			barHome.style.width = prediction.odds.home;
			barHome.textContent = prediction.odds.home;
			var barDraw = bars.appendChild(doc.createElement('div'));
			barDraw.className = 'prediction-draw';
			barDraw.style.width = prediction.odds.draw;
			barDraw.textContent = prediction.odds.draw;
			var barAway = bars.appendChild(doc.createElement('div'));
			barAway.className = 'prediction-away';
			barAway.style.width = prediction.odds.away;
			barAway.textContent = prediction.odds.away;

			var score = content.appendChild(doc.createElement('div'));
			score.className = 'flex flex-space-between';
			var scoreHome = score.appendChild(doc.createElement('div'));
			scoreHome.textContent = prediction.goals.home;
			var scoreString = score.appendChild(doc.createElement('div'));
			scoreString.textContent = Foxtrick.L10n.getString('HaruspexPrediction.score');
			var scoreAway = score.appendChild(doc.createElement('div'));
			scoreAway.textContent = prediction.goals.away;

			doc.querySelector('div.notPlayerTeamDetails').appendChild(haruspex);
		}).catch(Foxtrick.catch(this));
	}
};