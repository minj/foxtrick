/**
 * htms-statistics.js
 * adds some statistics on matches based on HTMS web site info
 * @author taised
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickHTMSPrediction = {
	MODULE_NAME : "HTMSPrediction",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : new Array('match'),
	CSS : Foxtrick.ResourcePath + "resources/css/htms-statistics.css",

	run : function(doc) {
		var isprematch = (doc.getElementById("ctl00_ctl00_CPContent_CPMain_pnlPreMatch")!=null);
		if (isprematch) return;

		var ratingstable = Foxtrick.Pages.Match.getRatingsTable(doc);
		if (ratingstable == null) return;
		var tacticRow=ratingstable.rows.length-2;
		//Foxtrick.dump('got table '+tacticRow+' : '+ratingstable.rows[tacticRow].innerHTML)
		if (Foxtrick.Pages.Match.isWalkOver(ratingstable)) return;
		if (!Foxtrick.Pages.Match.isCorrectLanguage(ratingstable)) { // incorrect language

			var htmstable = ratingstable.parentNode.insertBefore(doc.createElement('table'),ratingstable.nextSibling);
			var row = htmstable.insertRow(0);
			var cell = row.insertCell(0);
			cell.setAttribute("colspan" , 3);
			cell.innerHTML = Foxtrickl10n.getString( "foxtrick.matches.wronglang" );
			return;
		}

		var midfieldLevel=new Array(Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[1].cells[1]), Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[1].cells[2]));
		midfieldLevel[0]=midfieldLevel[0]*4+1;
		midfieldLevel[1]=midfieldLevel[1]*4+1;
		var rdefence=new Array(Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[2].cells[1]), Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[2].cells[2]));
		rdefence[0]=rdefence[0]*4+1;
		rdefence[1]=rdefence[1]*4+1;
		var cdefence=new Array(Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[3].cells[1]), Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[3].cells[2]));
		cdefence[0]=cdefence[0]*4+1;
		cdefence[1]=cdefence[1]*4+1;
		var ldefence=new Array(Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[4].cells[1]), Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[4].cells[2]));
		ldefence[0]=ldefence[0]*4+1;
		ldefence[1]=ldefence[1]*4+1;
		var rattack=new Array(Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[5].cells[1]), Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[5].cells[2]));
		rattack[0]=rattack[0]*4+1;
		rattack[1]=rattack[1]*4+1;
		var cattack=new Array(Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[6].cells[1]), Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[6].cells[2]));
		cattack[0]=cattack[0]*4+1;
		cattack[1]=cattack[1]*4+1;
		var lattack=new Array(Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[7].cells[1]), Foxtrick.Pages.Match.getStatFromCell(ratingstable.rows[7].cells[2]));
		lattack[0]=lattack[0]*4+1;
		lattack[1]=lattack[1]*4+1;
		var tactics;
		var tacticsLevel;

		tactics=new Array(Foxtrick.Pages.Match.getTacticsFromCell(ratingstable.rows[tacticRow].cells[1]), Foxtrick.Pages.Match.getTacticsFromCell(ratingstable.rows[tacticRow].cells[2]));
		tacticsLevel=new Array(Foxtrick.Pages.Match.getTacticsLevelFromCell(ratingstable.rows[tacticRow+1].cells[1]), Foxtrick.Pages.Match.getTacticsLevelFromCell(ratingstable.rows[tacticRow+1].cells[2]));

		//Creating params for link
		var params='&TAM='+midfieldLevel[0]+'&TBM='+midfieldLevel[1];
		params+='&TARD='+rdefence[0]+'&TBRD='+rdefence[1];
		params+='&TACD='+cdefence[0]+'&TBCD='+cdefence[1];
		params+='&TALD='+ldefence[0]+'&TBLD='+ldefence[1];
		params+='&TARA='+rattack[0]+'&TBRA='+rattack[1];
		params+='&TACA='+cattack[0]+'&TBCA='+cattack[1];
		params+='&TALA='+lattack[0]+'&TBLA='+lattack[1];
		if (tactics[0]=='aow') {
			params+='&TATAC=AOW&TATACLEV='+tacticsLevel[0];
		}
		if (tactics[0]=='aim') {
			params+='&TATAC=AIM&TATACLEV='+tacticsLevel[0];
		}
		if (tactics[0]=='pressing') {
			params+='&TATAC=PRES&TATACLEV='+tacticsLevel[0];
		}
		if (tactics[0]=='ca') {
			params+='&TATAC=CA&TATACLEV='+tacticsLevel[0];
		}
		if (tactics[1]=='aow') {
			params+='&TBTAC=AOW&TBTACLEV='+tacticsLevel[1];
		}
		if (tactics[1]=='aim') {
			params+='&TBTAC=AIM&TBTACLEV='+tacticsLevel[1];
		}
		if (tactics[1]=='pressing') {
			params+='&TBTAC=PRES&TBTACLEV='+tacticsLevel[1];
		}
		if (tactics[1]=='ca') {
			params+='&TBTAC=CA&TBTACLEV='+tacticsLevel[1];
		}

		//Inserting the table
		var htmstable = ratingstable.parentNode.insertBefore(doc.createElement('table'),ratingstable.nextSibling);
		htmstable.id='htmstable';

		//Inserting header
		var lang = FoxtrickPrefs.getString("htLanguage");
		var h2 = doc.createElement('h2');
		var a = doc.createElement('a');
		a.href='http://www.fantamondi.it/HTMS/index.php?lang='+lang;
		a.textContent = Foxtrickl10n.getString("HTMSPrediction.title");
		a.target = '_blank';
		h2.appendChild(a);
		htmstable.parentNode.insertBefore(h2, htmstable);

		row = htmstable.insertRow(htmstable.rows.length);
		cell = row.insertCell(0);
		cell.className = 'ch ft-htms-leftcell';
		cell.style.width = '160px';
		cell.textContent = Foxtrickl10n.getString("HTMSPrediction.prediction");

		var url = 'http://www.fantamondi.it/HTMS/dorequest.php?action=predict&' + params;
		Foxtrick.loadXml(url, function(xml) {
				FoxtrickHTMSPrediction.show_result(doc, xml);
			}, true);

		var p = doc.createElement('p');
		var a = doc.createElement('a');
		a.appendChild(doc.createTextNode(Foxtrickl10n.getString('HTMSPrediction.changePrediction')));
		a.href = "http://www.fantamondi.it/HTMS/index.php?page=predictor&action=showpredict&lang="+lang+params;
		a.target='_blank';
		p.appendChild(a);
		htmstable.parentNode.insertBefore(p, htmstable.nextSibling);
	},

	show_result : function(doc, xml) {
		try {
			Foxtrick.stopListenToChange(doc);

			var htmstable = doc.getElementById('htmstable');
			var row = htmstable.rows[htmstable.rows.length-1];

			var pred1 = xml.getElementsByTagName('T1').item(0).firstChild.nodeValue;
			var pred2 = xml.getElementsByTagName('T2').item(0).firstChild.nodeValue;
			var b = doc.createElement('b');
			b.appendChild(doc.createTextNode(pred1));
			cell = row.insertCell(1); cell.appendChild(b); cell.className = "left";
			cell = row.insertCell(2); cell.className = "center";
			var b = doc.createElement('b');
			b.appendChild(doc.createTextNode(pred2));
			cell = row.insertCell(3); cell.appendChild(b); cell.className = "right";

			var winprob = xml.getElementsByTagName('S1P').item(0).firstChild.nodeValue;
			var drawprob = xml.getElementsByTagName('SXP').item(0).firstChild.nodeValue;;
			var lossprob = xml.getElementsByTagName('S2P').item(0).firstChild.nodeValue;

			var row = htmstable.insertRow(htmstable.rows.length);
			cell = row.insertCell(0);
			cell = row.insertCell(1);
			cell.setAttribute("colspan", 3);
			var graph = cell.appendChild(doc.createElement('div'));
			graph.className = "ft-htms-graph";
			var windiv = graph.appendChild(doc.createElement('div'));
			windiv.className = "ft-htms-bar ft-htms-stats-win";
			windiv.style.width = winprob+"%";
			var drawdiv = graph.appendChild(doc.createElement('div'));
			drawdiv.className = "ft-htms-bar ft-htms-stats-draw";
			drawdiv.style.width = drawprob+"%";
			var lossdiv = graph.appendChild(doc.createElement('div'));
			lossdiv.className = "ft-htms-bar ft-htms-stats-loss";
			// use minus to prevent from overall sum exceeding 100%
			// when there is rounding up
			lossdiv.style.width = (100 - parseFloat(winprob) - parseFloat(drawprob)) + "%";

  			var row = htmstable.insertRow(htmstable.rows.length);
			cell = row.insertCell(0); cell.className = "ch"; cell.textContent = Foxtrickl10n.getString("HTMSPrediction.winDrawLoss");
			cell = row.insertCell(1); cell.textContent = winprob; cell.className = "left";
			cell = row.insertCell(2); cell.textContent = drawprob; cell.className = "center";
			cell = row.insertCell(3); cell.textContent = lossprob; cell.className = "right";
		}
		catch (e) {
			Foxtrick.log(e);
		}
	}
};
Foxtrick.util.module.register(FoxtrickHTMSPrediction);
