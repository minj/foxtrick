/**
 * htmsStatistics.js
 * adds some statistics on matches based on HTMS web site info
 * @author taised
 */
////////////////////////////////////////////////////////////////////////////////
Foxtrick.htmsStatistics = {

	MODULE_NAME : "htmsStatistics",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : new Array('match'),
	CSS : Foxtrick.ResourcePath + "resources/css/htms-statistics.css",

	run : function( page, doc ) {
		var isprematch = (doc.getElementById("ctl00_ctl00_CPContent_CPMain_pnlPreMatch")!=null);
		if (isprematch) return;

		var ratingstable = Foxtrick.Matches._getRatingsTable(doc);
		if (ratingstable == null) return;
		var tacticRow=ratingstable.rows.length-2;
		//Foxtrick.dump('got table '+tacticRow+' : '+ratingstable.rows[tacticRow].innerHTML)
		if (Foxtrick.Matches._isWalkOver(ratingstable)) return;
		if (!Foxtrick.Matches._isCorrectLanguage(ratingstable)) { // incorrect language

			var htmstable = ratingstable.parentNode.insertBefore(doc.createElement('table'),ratingstable.nextSibling);
			var row = htmstable.insertRow(0);
			var cell = row.insertCell(0);
			cell.setAttribute("colspan" , 3);
			cell.innerHTML = Foxtrickl10n.getString( "foxtrick.matches.wronglang" );
			return;
		}

		Foxtrick.addJavaScript(doc, "chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/js/gauge.js");

		var midfieldLevel=new Array(Foxtrick.Matches._getStatFromCell(ratingstable.rows[1].cells[1]), Foxtrick.Matches._getStatFromCell(ratingstable.rows[1].cells[2]));
		midfieldLevel[0]=midfieldLevel[0]*4+1;
		midfieldLevel[1]=midfieldLevel[1]*4+1;
		var rdefence=new Array(Foxtrick.Matches._getStatFromCell(ratingstable.rows[2].cells[1]), Foxtrick.Matches._getStatFromCell(ratingstable.rows[2].cells[2]));
		rdefence[0]=rdefence[0]*4+1;
		rdefence[1]=rdefence[1]*4+1;
		var cdefence=new Array(Foxtrick.Matches._getStatFromCell(ratingstable.rows[3].cells[1]), Foxtrick.Matches._getStatFromCell(ratingstable.rows[3].cells[2]));
		cdefence[0]=cdefence[0]*4+1;
		cdefence[1]=cdefence[1]*4+1;
		var ldefence=new Array(Foxtrick.Matches._getStatFromCell(ratingstable.rows[4].cells[1]), Foxtrick.Matches._getStatFromCell(ratingstable.rows[4].cells[2]));
		ldefence[0]=ldefence[0]*4+1;
		ldefence[1]=ldefence[1]*4+1;
		var rattack=new Array(Foxtrick.Matches._getStatFromCell(ratingstable.rows[5].cells[1]), Foxtrick.Matches._getStatFromCell(ratingstable.rows[5].cells[2]));
		rattack[0]=rattack[0]*4+1;
		rattack[1]=rattack[1]*4+1;
		var cattack=new Array(Foxtrick.Matches._getStatFromCell(ratingstable.rows[6].cells[1]), Foxtrick.Matches._getStatFromCell(ratingstable.rows[6].cells[2]));
		cattack[0]=cattack[0]*4+1;
		cattack[1]=cattack[1]*4+1;
		var lattack=new Array(Foxtrick.Matches._getStatFromCell(ratingstable.rows[7].cells[1]), Foxtrick.Matches._getStatFromCell(ratingstable.rows[7].cells[2]));
		lattack[0]=lattack[0]*4+1;
		lattack[1]=lattack[1]*4+1;
		var tactics;
		var tacticsLevel;
		// var tacticRow=14;
		// if (FoxtrickHelper.findIsYouthMatch(doc.location.href)) {
			// tacticRow=10;
		// }

		tactics=new Array(Foxtrick.Matches._getTacticsFromCell(ratingstable.rows[tacticRow].cells[1]), Foxtrick.Matches._getTacticsFromCell(ratingstable.rows[tacticRow].cells[2]));
		tacticsLevel=new Array(Foxtrick.Matches._getTacticsLevelFromCell(ratingstable.rows[tacticRow+1].cells[1]), Foxtrick.Matches._getTacticsLevelFromCell(ratingstable.rows[tacticRow+1].cells[2]));

        //Foxtrick.dump('rows '+ratingstable.rows.length+' Tactics:['+ tactics + '], TacticsLevel:[' +tacticsLevel +']'+ '\n');

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
		var h2 = doc.createElement('h2');
		var a = doc.createElement('a');
		a.href='http://www.fantamondi.it/HTMS/index.php?lang='+lang;
		a.textContent = Foxtrickl10n.getString("foxtrick.htmsStatistics.linkcaption");
		a.target = '_blank';
		h2.appendChild(a);
		htmstable.parentNode.insertBefore(h2, htmstable);

		row = htmstable.insertRow(htmstable.rows.length);
		cell = row.insertCell(0);
		cell.className = 'ch';
		cell.textContent = Foxtrickl10n.getString("foxtrick.htmsStatistics.prediction");

		var url = 'http://www.fantamondi.it/HTMS/dorequest.php?action=showpredict&' + params;
		if (Foxtrick.BuildFor=='Chrome') {
			porthtms.postMessage({reqtype: "get_htms",url:url});
		}
		else {
			var req = new XMLHttpRequest();
			req.open('GET', url, true);

			req.onreadystatechange = function (aEvt) {
				if (req.readyState == 4) {
					if(req.status == 200)
						Foxtrick.htmsStatistics.show_result( doc, req.responseText )
					else Foxtrick.dump('no connection\n');
				}
			}
			req.send(null);
		}
		var lang = FoxtrickPrefs.getString("htLanguage");
		var p = doc.createElement('p');
		var a = doc.createElement('a');
		a.appendChild(doc.createTextNode(Foxtrickl10n.getString('foxtrick.htmsStatistics.changePrediction')));
		a.href = "http://www.fantamondi.it/HTMS/index.php?page=predictor&action=showpredict&lang="+lang+params;
		a.target='_blank';
		p.appendChild(a);
		htmstable.parentNode.insertBefore(p, htmstable.nextSibling);
	},

	show_result : function(doc, responseText) {
		try {
			Foxtrick.stopListenToChange(doc);

			var frag = doc.createElement('dummy');
			frag.innerHTML = responseText;

			var htmstable = doc.getElementById('htmstable');
			var row = htmstable.rows[htmstable.rows.length-1];

			var pred = frag.getElementsByTagName('strong')[0].textContent.split('-');
			var b = doc.createElement('b');
			b.appendChild(doc.createTextNode(pred[0]));
			cell = row.insertCell(1); cell.appendChild(b); cell.className = "left";
			cell = row.insertCell(2); cell.className = "center";
			var b = doc.createElement('b');
			b.appendChild(doc.createTextNode(pred[1]));
			cell = row.insertCell(3); cell.appendChild(b); cell.className = "right";

			var winprob = frag.getElementsByTagName('table')[0].rows[0].cells[2].textContent;
			var drawprob = frag.getElementsByTagName('table')[0].rows[1].cells[2].textContent;
			var lossprob = frag.getElementsByTagName('table')[0].rows[2].cells[2].textContent;

			var row = htmstable.insertRow(htmstable.rows.length);
			cell = row.insertCell(0);
			cell = row.insertCell(1);
			cell.setAttribute("colspan", 3);
			var graph = cell.appendChild(doc.createElement('div'));
			graph.className = "ft-htms-graph";
			var windiv = graph.appendChild(doc.createElement('div'));
			windiv.className = "ft-htms-bar ft-htms-stats-win";
			windiv.style.width = winprob;
			var drawdiv = graph.appendChild(doc.createElement('div'));
			drawdiv.className = "ft-htms-bar ft-htms-stats-draw";
			drawdiv.style.width = drawprob;
			var lossdiv = graph.appendChild(doc.createElement('div'));
			lossdiv.className = "ft-htms-bar ft-htms-stats-loss";
			// use minus to prevent from overall sum exceeding 100%
			// when there is rounding up
			lossdiv.style.width = (100 - parseFloat(winprob) - parseFloat(drawprob)) + "%";

  			var row = htmstable.insertRow(htmstable.rows.length);
			cell = row.insertCell(0); cell.className = "ch"; cell.textContent = Foxtrickl10n.getString("foxtrick.htmsStatistics.windrawloss");
			cell = row.insertCell(1); cell.textContent = winprob; cell.className = "left";
			cell = row.insertCell(2); cell.textContent = drawprob; cell.className = "center";
			cell = row.insertCell(3); cell.textContent = lossprob; cell.className = "right";

			Foxtrick.startListenToChange (doc);
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	}
};

try {
var porthtms = chrome.extension.connect({name: "htms"});
porthtms.onMessage.addListener(function(msg) {
	if ( msg.set=='htms') {
		Foxtrick.htmsStatistics.show_result( document, msg.responseText );
		console.log('got htms ' + msg.set);
		}
	});
}
catch (e) {
	// throw it away
}
