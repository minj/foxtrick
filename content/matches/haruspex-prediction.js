/**
 * haruspex-prediction.js
 * adds match prediction on match report
 * based on taised work in htms-prediction.js
 */

'use strict';

Foxtrick.modules['Haruspex'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match'],
	CSS: Foxtrick.InternalPath + 'resources/css/haruspex-prediction.css',

	run: function(doc) {
		if (Foxtrick.Pages.Match.isPrematch(doc) || Foxtrick.Pages.Match.inProgress(doc))
			return;

		// request parameters
		var url = 'https://haruspex.altervista.org/foxtrick/?id=';
		url += Foxtrick.Pages.Match.getId(doc);
		if (Foxtrick.Pages.Match.isHTOIntegrated(doc))
			url += '&type=hto';
		else if (Foxtrick.Pages.Match.isYouth(doc))
			url += '&type=youth';
		else 
			url += '&type=hattrick';

		// print result
		var ratingsanchor = doc.querySelector('div#oldMatchRatings');
		var haruspex = Foxtrick.createFeaturedElement(doc, this, 'div');
		ratingsanchor.insertBefore(haruspex, null);
		// table
		var haruspextable = haruspex.appendChild(doc.createElement('table'));
		haruspextable.id = 'ft-haruspextable';
		// header
		var title = Foxtrick.L10n.getString('Haruspex.title');
		var link = url.replace('foxtrick', 'matches');
		var header = doc.createElement('h2');
		header.innerHTML = '<a href="' + link + '" target="_blank">' + title + '</a>';
		haruspextable.parentNode.insertBefore(header, haruspextable);

		Foxtrick.load(url).then(function(response) {
			var pred = Foxtrick.parseJSON(response);

			pred[0] = (pred[0] * 100).toFixed(1);
			pred[1] = (pred[1] * 100).toFixed(1);
			pred[2] = (pred[2] * 100).toFixed(1);
			pred[3] = pred[3].toFixed(2);
			pred[4] = pred[4].toFixed(2);
			// table
			var predictiontable = doc.getElementById('ft-haruspextable');
			// avg score (1st row)
			var row = haruspextable.insertRow(0);
			var cell = row.insertCell(0); cell.textContent = Foxtrick.L10n.getString('Haruspex.score');
			cell = row.insertCell(1); cell.textContent = pred[3];
			cell = row.insertCell(2);
			cell = row.insertCell(3); cell.textContent = pred[4];
			// graph (2nd row)
			row = predictiontable.insertRow(1);
			cell = row.insertCell(0);
			cell = row.insertCell(1); cell.setAttribute('colspan', 3);
			var graph = cell.appendChild(doc.createElement('div'));
			var div = graph.appendChild(doc.createElement('div')); div.className = 'haruspex-graph';
			div.style.width = pred[0] + '%';
			div = graph.appendChild(doc.createElement('div')); div.className = 'haruspex-graph';
			div.style.width = pred[1] + '%';
			div = graph.appendChild(doc.createElement('div')); div.className = 'haruspex-graph';
			div.style.width = (100 - parseFloat(pred[0]) - parseFloat(pred[1])) + '%';
			// odds (3rd row)
			row = predictiontable.insertRow(2);
			cell = row.insertCell(0); cell.textContent = Foxtrick.L10n.getString('Haruspex.odds');
			cell = row.insertCell(1); cell.textContent = pred[0] + '%';
			cell = row.insertCell(2); cell.textContent = pred[1] + '%';
			cell = row.insertCell(3); cell.textContent = pred[2] + '%';
		}).catch(Foxtrick.catch(this));
	}
};
