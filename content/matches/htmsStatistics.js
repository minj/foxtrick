/**
 * htmsStatistics.js
 * adds some statistics on matches based on HTMS web site info
 * @author taised
 */
////////////////////////////////////////////////////////////////////////////////
Foxtrick.htmsStatistics = {

	MODULE_NAME : "htmsStatistics",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	PAGES : new Array('match'),
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.9.1",
	LATEST_CHANGE:"Added custom colors",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	CSS : Foxtrick.ResourcePath + "resources/css/htms-statistics.css",

	run : function( page, doc ) {
		try {
			var isprematch = (doc.getElementById("ctl00_CPMain_pnlPreMatch")!=null);
			if (isprematch) return;

			var ratingstable = Foxtrick.Matches._getRatingsTable(doc);
			if (ratingstable == null) return;
			var tacticRow=ratingstable.rows.length-2;
			//Foxtrick.LOG('got table '+tacticRow+' : '+ratingstable.rows[tacticRow].innerHTML)
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

            //Foxtrick.LOG('rows '+ratingstable.rows.length+' Tactics:['+ tactics + '], TacticsLevel:[' +tacticsLevel +']'+ '\n');

			//Creating params for link
			var lang=FoxtrickPrefs.getString("htLanguage");
            //if (!((lang=='it') || (lang=='fr'))) lang='en';
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
			//Foxtrick.LOG(tactics[0]+' - '+tactics[1]);

			//Inserting a blank line
			var htmstable = ratingstable.parentNode.insertBefore(doc.createElement('table'),ratingstable.nextSibling);
			htmstable.id='htmstable';
			htmstable.setAttribute('windrawloss',Foxtrickl10n.getString( "foxtrick.htmsStatistics.windrawloss" ));

			//Inserting header
			var br = doc.createElement('br');
			htmstable.parentNode.insertBefore(br, htmstable);
			var br = doc.createElement('br');
			htmstable.parentNode.insertBefore(br, htmstable);
			var h2 = doc.createElement('h2');
			var a = doc.createElement('a');
			a.href='http://www.fantamondi.it/HTMS/index.php?lang='+lang;
			a.appendChild(doc.createTextNode(Foxtrickl10n.getString( "foxtrick.htmsStatistics.linkcaption" )));
			a.target='_blanck';
			h2.appendChild(a);
			htmstable.parentNode.insertBefore(h2, htmstable);

			var row = htmstable.insertRow(htmstable.rows.length);
			var cell = row.insertCell(0);
			cell.innerHTML='&nbsp;';

			row = htmstable.insertRow(htmstable.rows.length);
			cell = row.insertCell(0);
			cell.className='ch';
			cell.innerHTML = Foxtrickl10n.getString( "foxtrick.htmsStatistics.prediction" );

			var barwidth=320;
			var framewidth=barwidth+10;
			var barheight=50;
			var frameheight=barheight+95;

		var url= 'http://www.fantamondi.it/HTMS/dorequest.php?action=showpredict&lang='+lang+params+'&width='+barwidth+'&height='+barheight;
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
		} catch (e) {
			Foxtrick.dump('htmsStatistics.js run: '+e+"\n");
		}
		var p = doc.createElement('p');
		var a = doc.createElement('a');
		a.appendChild(doc.createTextNode(Foxtrickl10n.getString('foxtrick.htmsStatistics.changePrediction')));
		a.href = "http://www.fantamondi.it/HTMS/index.php?page=predictor&action=showpredict&lang="+lang+params;
		a.target='_blanck';
		p.appendChild(a);
		htmstable.parentNode.insertBefore(p, htmstable.nextSibling);
	},




	show_result : function( doc, responseText ) {
		try{
			Foxtrick.stopListenToChange (doc);

			var frag = doc.createElement('dummy');
			frag.innerHTML = responseText;

			var htmstable=doc.getElementById('htmstable');
			var  row = htmstable.rows[htmstable.rows.length-1];

			var pred = frag.getElementsByTagName('strong')[0].innerHTML.split('-');
			var b = doc.createElement('b');
			b.appendChild(doc.createTextNode(pred[0]));
			cell = row.insertCell(1); cell.appendChild(b); cell.setAttribute('style','text-align:left;');
			cell = row.insertCell(2); cell.setAttribute('style','text-align:center;');
			var b = doc.createElement('b');
			b.appendChild(doc.createTextNode(pred[1]));
			cell = row.insertCell(3); cell.appendChild(b); cell.setAttribute('style','text-align:right;');
			cell = row.insertCell(4);

			var homeprec= frag.getElementsByTagName('table')[0].rows[0].cells[2].innerHTML;
			var drawprec= frag.getElementsByTagName('table')[0].rows[1].cells[2].innerHTML;
			var lossprec= frag.getElementsByTagName('table')[0].rows[2].cells[2].innerHTML;
			Foxtrick.dump(homeprec+' '+drawprec+' '+lossprec+'\n');

			var size_f=(Foxtrick.isStandardLayout(doc))?2.8:2.6;
			var row = htmstable.insertRow(htmstable.rows.length);
			cell = row.insertCell(0);
			cell = row.insertCell(1);
			cell.setAttribute("colspan", 3);
			cell.setAttribute('align', 'center');
			var windiv = cell.appendChild(doc.createElement('div'));
			windiv.className = "ft-htms-bar ft-htms-stats-win";
			windiv.style.width = 100 * size_f + "px";
			var drawdiv = windiv.appendChild(doc.createElement('div'));
			drawdiv.className = "ft-htms-bar ft-htms-stats-draw";
			drawdiv.style.width = (parseFloat(lossprec.replace('%', '')) + parseFloat(drawprec.replace('%',''))) * size_f + "px";
			var lossdiv = drawdiv.appendChild(doc.createElement('div'));
			lossdiv.className = "ft-htms-bar ft-htms-stats-loss";
			lossdiv.style.width = parseFloat(lossprec.replace('%', '')) * size_f + "px";
			cell = row.insertCell(2);

  			var row = htmstable.insertRow(htmstable.rows.length);
			var b = doc.createElement('b');
			var div = doc.createElement('div');
			var div2 = doc.createElement('div');
			if (Foxtrick.isStandardLayout(doc)) {
				div.setAttribute('style','width:'+String(525-100*size_f-10-80)+'px;');
				div2.setAttribute('style','width:+'+80+'px;');
			}
			else div.setAttribute('style','width:'+String(420-100*size_f)+'px;');
			div.appendChild(doc.createTextNode(htmstable.getAttribute('windrawloss')));
			b.appendChild(div);
			cell = row.insertCell(0); cell.appendChild(b);
			cell = row.insertCell(1); cell.appendChild(doc.createTextNode(homeprec)); cell.setAttribute('style','text-align:left;');
			cell = row.insertCell(2); cell.appendChild(doc.createTextNode(drawprec)); cell.setAttribute('style','text-align:center;');
			cell = row.insertCell(3); cell.appendChild(doc.createTextNode(lossprec)); cell.setAttribute('style','text-align:right;');
			cell = row.insertCell(4); cell.appendChild(div2);

			Foxtrick.startListenToChange (doc);

		}catch(e){Foxtrick.dump('show_htms :'+e);}
	},

};

try {
var porthtms = chrome.extension.connect({name: "htms"});
porthtms.onMessage.addListener(function(msg) {
	if ( msg.set=='htms') {
		Foxtrick.htmsStatistics.show_result( document, msg.responseText );
		console.log('got htms ' + msg.set);
		}
	});
} catch(e){}
