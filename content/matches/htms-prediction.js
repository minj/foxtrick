'use strict';
/**
 * htms-statistics.js
 * adds some statistics on matches based on HTMS web site info
 * @author taised
 */
////////////////////////////////////////////////////////////////////////////////

Foxtrick.modules['HTMSPrediction'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.MATCHES,
	PAGES: ['match'],
	CSS: Foxtrick.InternalPath + 'resources/css/htms-statistics.css',
	NICE: -1,  // before ratings
	OPTIONS: ['Mimimi'],

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

		//Creating params for link
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

		//Inserting the table
		var htmstable = targetNode.appendChild(doc.createElement('table'));
		htmstable.id = 'ft-htmstable';

		//Inserting header
		var lang = Foxtrick.Prefs.getString('htLanguage');
		var h2 = doc.createElement('h2');
		var a = doc.createElement('a');
		a.href = 'http://www.fantamondi.it/HTMS/index.php?lang=' + lang;
		a.textContent = Foxtrick.L10n.getString('HTMSPrediction.title');
		a.target = '_blank';
		h2.appendChild(a);
		htmstable.parentNode.insertBefore(h2, htmstable);

		if (teams) {
			var row = htmstable.insertRow(htmstable.rows.length);
			row.className = 'htms_teams';
			var cell = row.insertCell(0);
			cell.className = 'ch ft-htms-leftcell';
			cell.style.width = '160px';
			cell.textContent = Foxtrick.L10n.getString('HTMSPrediction.team');

			var b = doc.createElement('b');
			b.appendChild(doc.createTextNode(teams[0]));
			cell = row.insertCell(1); cell.appendChild(b); cell.className = 'left';
			cell = row.insertCell(2); cell.className = 'center';
			var b = doc.createElement('b');
			b.appendChild(doc.createTextNode(teams[1]));
			cell = row.insertCell(3); cell.appendChild(b); cell.className = 'right';
		}
		var row = htmstable.insertRow(htmstable.rows.length);
		var cell = row.insertCell(0);

		/**************************
		 * Mimimi add-on (part 1) *
		 **************************/
		var mimimiIsChecked = Foxtrick.Prefs.isModuleOptionEnabled('HTMSPrediction', 'Mimimi') && Foxtrick.Pages.Match.hasRatingsTabs(doc);
		if (mimimiIsChecked)
		{
			cell = row.insertCell(1); cell = row.insertCell(2);
			cell.className = 'center';
			var mimimicanvas = cell.appendChild(doc.createElement('canvas'));
			mimimicanvas.id = 'ft-mimimicanvas';
			mimimicanvas.className = 'ft-mimimi-canvas';
			cell = row.insertCell(3);
			row = htmstable.insertRow(htmstable.rows.length);
			cell = row.insertCell(0);
		}
		/* End of Mimimi add-on (part 1) */

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
			var row = htmstable.rows[htmstable.rows.length - 1];
			var cell;

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

			var b = doc.createElement('b');
			b.appendChild(doc.createTextNode(pred1));
			cell = row.insertCell(1); cell.appendChild(b); cell.className = 'left';
			cell = row.insertCell(2); cell.className = 'center';

			/**************************
			 * Mimimi add-on (part 2) *
			 **************************/
			if (mimimiIsChecked) {
				var b = doc.createElement('b');
				var luckText = Foxtrick.L10n.getString('HTMSPrediction.luck');
				b.appendChild(doc.createTextNode(luckText));
				cell.appendChild(b);
			}
			/* End of Mimimi add-on (part 2) */

			var b = doc.createElement('b');
			b.appendChild(doc.createTextNode(pred2));
			cell = row.insertCell(3); cell.appendChild(b); cell.className = 'right';

			var row = htmstable.insertRow(htmstable.rows.length);
			cell = row.insertCell(0);
			cell = row.insertCell(1);
			cell.setAttribute('colspan', 3);
			var graph = cell.appendChild(doc.createElement('div'));
			graph.className = 'ft-htms-graph';
			var windiv = graph.appendChild(doc.createElement('div'));
			windiv.className = 'htms-bar htms-stats-win';
			windiv.style.width = winprob + '%';
			var drawdiv = graph.appendChild(doc.createElement('div'));
			drawdiv.className = 'htms-bar htms-stats-draw';
			drawdiv.style.width = drawprob + '%';
			var lossdiv = graph.appendChild(doc.createElement('div'));
			lossdiv.className = 'htms-bar htms-stats-loss';
			// use minus to prevent from overall sum exceeding 100%
			// when there is rounding up
			lossdiv.style.width = (100 - parseFloat(winprob) - parseFloat(drawprob)) + '%';

			var row = htmstable.insertRow(htmstable.rows.length);
			cell = row.insertCell(0); cell.className = 'ch';
			cell.textContent = Foxtrick.L10n.getString('HTMSPrediction.winDrawLoss');
			cell = row.insertCell(1); cell.textContent = winprob; cell.className = 'left';
			cell = row.insertCell(2); cell.textContent = drawprob; cell.className = 'center';
			cell = row.insertCell(3); cell.textContent = lossprob; cell.className = 'right';

			/************************
			 * Mimimi add-on (main) *
			 * @author: educhielle  *
			 * HT: MetalTeck        *
			 ************************/

			/*
			   The Mimimi add-on aims to show if a match result was fair or if luck played a huge role
			   It takes into account the HTMS predictions and the match result, and determine how luck a team was
			   There are three fields:
			   - expected: shows how many points the home team was expected to get from the match
			   - acquired: shows how many points the home team actually got from the match
			   - luck: shows how luck the home team was (the luck parameter varies from -100% to +100%)
			     - -100% means that the home team was very unlucky (and, consequently, the away team very luck)
				 - near 0% means that it was a fair result
				 - +100% means that the home team was very luck (and the away team very unlucky)

				The luck parameter is quadratic to emphasize results heavily influenced by randomness
			*/
			if (mimimiIsChecked) {
				var goals = Foxtrick.Pages.Match.getResult(doc);
				var homeResult = goals[0];
				var awayResult = goals[1];
				var result = homeResult - awayResult;
				var expected = (3 * parseFloat(winprob) + parseFloat(drawprob)) / 100;
				var acquired = result > 0 ? 3 : result < 0 ? 0 : 1;
				var diff = acquired - expected;
				var luck = Math.round(100 * Math.abs(diff) * diff / 9);

				var opts = {
					angle: 0.0, // The span of the gauge arc
					lineWidth: 0.3, // The line thickness
					radiusScale: 1.0, // Relative radius
					pointer: {
						length: 0.7, // // Relative to gauge radius
						strokeWidth: 0.08, // The thickness
						color: '#000000' // Fill color
					},
					limitMax: true,     // If false, the max value of the gauge will be updated if value surpass max
					limitMin: true,     // If true, the min value of the gauge will be fixed unless you set it manually
					strokeColor: '#e0e0e0',  // to see which ones work best for you
					highDpiSupport: true,     // High resolution support
				};

				var zones = opts.staticZones = [];
				for (var pctg of Foxtrick.range(0, 105, 5)) {
					var max = pctg + 5;

					var hue = (1 - pctg / 100) * 360 / 3; // deg
					var light = (0.6 - 0.3 * Math.abs(1 - pctg / 50)) * 100; // pctg
					var hsl = `hsl(${hue}, 100%, ${light}%)`;

					zones.push({ strokeStyle: hsl, min: pctg, max });
					zones.unshift({ strokeStyle: hsl, min: -max, max: -pctg });
				}

				var target = doc.getElementById('ft-mimimicanvas'); // your canvas element
				var gauge = new Foxtrick.Gauge(target).setOptions(opts); // create sexy gauge!
				gauge.maxValue = 100; // set max gauge value
				gauge.setMinValue(-100);  // Prefer setter over gauge.minValue = 0
				gauge.animationSpeed = 50; // set animation speed (32 is default value)
				gauge.set(-luck); // set actual value
			}
			/* End of Mimimi add-on (part 2) */

		}).catch(Foxtrick.catch(module));

		var p = doc.createElement('p');
		var a = doc.createElement('a');
		a.appendChild(doc.createTextNode(Foxtrick.L10n.getString('HTMSPrediction.changePrediction')));
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
	}
};
