/**
 * htms-statistics.js
 * adds some statistics on matches based on HTMS web site info
 * @author taised
 */

'use strict';

Foxtrick.modules['HTMSPrediction'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match'],
	CSS: Foxtrick.InternalPath + 'resources/css/htms-statistics.css',
	NICE: -1, // before ratings

	copy: function(div) {
		var HTMSClone = div.cloneNode(true);
		var htmstable = HTMSClone.getElementsByTagName('table')[0];
		if (htmstable) {
			// remove empty row and fix some newlines
			htmstable.deleteRow(htmstable.rows.length - 2);
			return '\n' + Foxtrick.util.htMl.getMarkupFromNode(HTMSClone)
				.replace(/\[link=/g, '\n[link=');
		}
		return '';
	},

	insertPrediction: function(doc, targetNode, midfieldLevel, rdefence, cdefence, ldefence,
	                           rattack, cattack, lattack, tactics, tacticsLevel, teams) {

		var module = this;
		var loading = Foxtrick.util.note.createLoading(doc);
		targetNode.appendChild(loading);

		midfieldLevel[0] = midfieldLevel[0] * 4 + 1;
		midfieldLevel[1] = midfieldLevel[1] * 4 + 1;
		rdefence[0] = rdefence[0] * 4 + 1;
		rdefence[1] = rdefence[1] * 4 + 1;
		cdefence[0] = cdefence[0] * 4 + 1;
		cdefence[1] = cdefence[1] * 4 + 1;
		ldefence[0] = ldefence[0] * 4 + 1;
		ldefence[1] = ldefence[1] * 4 + 1;
		rattack[0] = rattack[0] * 4 + 1;
		rattack[1] = rattack[1] * 4 + 1;
		cattack[0] = cattack[0] * 4 + 1;
		cattack[1] = cattack[1] * 4 + 1;
		lattack[0] = lattack[0] * 4 + 1;
		lattack[1] = lattack[1] * 4 + 1;


		// Creating params for link
		var params = '&TAM=' + midfieldLevel[0] + '&TBM=' + midfieldLevel[1];
		params += '&TARD=' + rdefence[0] + '&TBRD=' + rdefence[1];
		params += '&TACD=' + cdefence[0] + '&TBCD=' + cdefence[1];
		params += '&TALD=' + ldefence[0] + '&TBLD=' + ldefence[1];
		params += '&TARA=' + rattack[0] + '&TBRA=' + rattack[1];
		params += '&TACA=' + cattack[0] + '&TBCA=' + cattack[1];
		params += '&TALA=' + lattack[0] + '&TBLA=' + lattack[1];
		if (tactics[0] == 'aow') {
			params += '&TATAC=AOW&TATACLEV=' + tacticsLevel[0];
		}
		if (tactics[0] == 'aim') {
			params += '&TATAC=AIM&TATACLEV=' + tacticsLevel[0];
		}
		if (tactics[0] == 'pressing') {
			params += '&TATAC=PRES&TATACLEV=' + tacticsLevel[0];
		}
		if (tactics[0] == 'ca') {
			params += '&TATAC=CA&TATACLEV=' + tacticsLevel[0];
		}
		if (tactics[0] == 'longshots') {
			params += '&TATAC=LS&TATACLEV=' + tacticsLevel[0];
		}
		if (tactics[1] == 'aow') {
			params += '&TBTAC=AOW&TBTACLEV=' + tacticsLevel[1];
		}
		if (tactics[1] == 'aim') {
			params += '&TBTAC=AIM&TBTACLEV=' + tacticsLevel[1];
		}
		if (tactics[1] == 'pressing') {
			params += '&TBTAC=PRES&TBTACLEV=' + tacticsLevel[1];
		}
		if (tactics[1] == 'ca') {
			params += '&TBTAC=CA&TBTACLEV=' + tacticsLevel[1];
		}
		if (tactics[1] == 'longshots') {
			params += '&TBTAC=LS&TBTACLEV=' + tacticsLevel[1];
		}

		// inserting the table
		var htmstable = targetNode.appendChild(doc.createElement('table'));
		htmstable.id = 'ft-htmstable';

		// inserting header
		var lang = Foxtrick.Prefs.getString('htLanguage');
		{
			let h2 = doc.createElement('h2');
			let a = doc.createElement('a');
			a.href = 'http://www.fantamondi.it/HTMS/index.php?lang=' + lang;
			a.textContent = Foxtrick.L10n.getString('HTMSPrediction.title');
			a.target = '_blank';
			h2.appendChild(a);
			htmstable.parentNode.insertBefore(h2, htmstable);
		}

		if (teams) {
			let row = htmstable.insertRow(htmstable.rows.length);
			row.className = 'htms_teams';
			let cell = row.insertCell();
			cell.className = 'ch ft-htms-leftcell';
			cell.style.width = '160px';
			cell.textContent = Foxtrick.L10n.getString('HTMSPrediction.team');

			let b = doc.createElement('b');
			b.appendChild(doc.createTextNode(teams[0]));
			cell = row.insertCell();
			cell.appendChild(b);
			cell.className = 'left';

			cell = row.insertCell();
			cell.className = 'center';
			b = doc.createElement('b');
			b.appendChild(doc.createTextNode(teams[1]));

			cell = row.insertCell();
			cell.appendChild(b);
			cell.className = 'right';
		}
		let row = htmstable.insertRow(htmstable.rows.length);
		let cell = row.insertCell();
		cell.className = 'ch ft-htms-leftcell';
		cell.style.width = '160px';
		cell.textContent = Foxtrick.L10n.getString('HTMSPrediction.prediction');

		var url = 'http://www.fantamondi.it/HTMS/dorequest.php?action=predict&' + params;
		Foxtrick.load(url).then(function(text) {
			var xml = Foxtrick.parseXML(text);
			if (xml == null)
				return;

			if (loading)
				loading.parentNode.removeChild(loading);

			var htmstable = doc.getElementById('ft-htmstable');
			let row = htmstable.rows[htmstable.rows.length - 1];
			let cell;

			var pred1 = xml.getElementsByTagName('T1').item(0).firstChild.nodeValue;
			var pred2 = xml.getElementsByTagName('T2').item(0).firstChild.nodeValue;
			var winprob = xml.getElementsByTagName('S1P').item(0).firstChild.nodeValue;
			var drawprob = xml.getElementsByTagName('SXP').item(0).firstChild.nodeValue;
			var lossprob = xml.getElementsByTagName('S2P').item(0).firstChild.nodeValue;
			if (pred1 == 'NAN') {
				pred1 = 5;
				pred2 = 0;
				winprob = 100;
				drawprob = 0;
				lossprob = 0;
			}

			let b = doc.createElement('b');
			b.appendChild(doc.createTextNode(pred1));
			cell = row.insertCell();
			cell.appendChild(b);
			cell.className = 'left';

			cell = row.insertCell();
			cell.className = 'center';
			b = doc.createElement('b');
			b.appendChild(doc.createTextNode(pred2));
			cell = row.insertCell();
			cell.appendChild(b);
			cell.className = 'right';

			row = htmstable.insertRow(htmstable.rows.length);
			row.insertCell();
			cell = row.insertCell();
			cell.colSpan = 3;
			let graph = cell.appendChild(doc.createElement('div'));
			graph.className = 'ft-htms-graph';
			let windiv = graph.appendChild(doc.createElement('div'));
			windiv.className = 'htms-bar htms-stats-win';
			windiv.style.width = winprob + '%';
			let drawdiv = graph.appendChild(doc.createElement('div'));
			drawdiv.className = 'htms-bar htms-stats-draw';
			drawdiv.style.width = drawprob + '%';
			let lossdiv = graph.appendChild(doc.createElement('div'));
			lossdiv.className = 'htms-bar htms-stats-loss';

			// use minus to prevent from overall sum exceeding 100%
			// when there is rounding up
			lossdiv.style.width = 100 - parseFloat(winprob) - parseFloat(drawprob) + '%';

			row = htmstable.insertRow(htmstable.rows.length);
			cell = row.insertCell();
			cell.className = 'ch';
			cell.textContent = Foxtrick.L10n.getString('HTMSPrediction.winDrawLoss');

			cell = row.insertCell();
			cell.textContent = winprob;
			cell.className = 'left';

			cell = row.insertCell();
			cell.textContent = drawprob;
			cell.className = 'center';

			cell = row.insertCell();
			cell.textContent = lossprob;
			cell.className = 'right';
		}, (er) => {

			if (!loading) {
				Foxtrick.log(er);
				return;
			}
			loading.textContent = '';
			let p = loading.appendChild(doc.createElement('p'));
			p.textContent = `There appears to be a problem with the HTMS prediction service.
				This is not likely something Foxtrick developers can fix.`;

			p = loading.appendChild(doc.createElement('p'));
			p.textContent = `Try opening the `;
			let a = p.appendChild(doc.createElement('a'));
			a.target = '_blank';
			a.href = url;
			a.textContent = 'prediction result';
			p.appendChild(doc.createTextNode(' manually'));

		}).catch(Foxtrick.catch(module));

		var p = doc.createElement('p');
		var a = doc.createElement('a');
		a.textContent = Foxtrick.L10n.getString('HTMSPrediction.changePrediction');
		a.href = 'http://www.fantamondi.it/HTMS/index.php?page=predictor&action=showpredict&lang=' +
			lang + params;
		a.target = '_blank';
		p.appendChild(a);

		htmstable.parentNode.insertBefore(p, htmstable.nextSibling);
	},

	run: function(doc) {
		if (Foxtrick.Pages.Match.isPrematch(doc) || Foxtrick.Pages.Match.inProgress(doc))
			return;
		var ratingstable = Foxtrick.Pages.Match.getRatingsTable(doc);
		if (Foxtrick.Pages.Match.isWalkOver(ratingstable))
			return;

		var ratings = Foxtrick.Pages.Match.getRatingsByTeam(ratingstable);
		var midfieldLevel = ratings.mf;
		var rdefence = ratings.rd;
		var cdefence = ratings.cd;
		var ldefence = ratings.ld;
		var rattack = ratings.ra;
		var cattack = ratings.ca;
		var lattack = ratings.la;

		var tacticsData = Foxtrick.Pages.Match.getTacticsByTeam(ratingstable);
		var tactics = tacticsData.tactics;
		var tacticsLevel = tacticsData.level;

		var htmsDiv = Foxtrick.createFeaturedElement(doc, this, 'div');
		htmsDiv.id = 'htmsMatchDivId';
		ratingstable.parentNode.insertBefore(htmsDiv, ratingstable.nextSibling);
		Foxtrick.log(tactics, tacticsLevel);
		this.insertPrediction(doc, htmsDiv, midfieldLevel, rdefence, cdefence, ldefence, rattack,
		                      cattack, lattack, tactics, tacticsLevel);

	},
};
