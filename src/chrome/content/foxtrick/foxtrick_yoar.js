// by YoaR

function flagsInCountriesList(document) {
    
  if (!isMenuUrl(document.location.href) && !isCountryDetailUrl(document.location.href)) return;
  if (!getShowTweak("flagsInCountriesList")) return;
  
  var form = document.forms.namedItem("ChangeLeagueSystem");
  if (form != null) {
    var select = form.elements.namedItem("leagueSystemID");
    if (select != null) {
      select.style.margin = "0 0 0 -6px";
      
      var options = select.options;
      for ( i = 0; i < options.length; i++ ) {
    	options[i].style.background='url("/Common/images/' + options[i].value + 'flag.gif") no-repeat left';
    	options[i].style.padding="2px 0 0 21px";
      }
    }
  }
  
}

function matchincome(document) {
    
  if (!isMatchDetailUrl(document.location.href)) return;
  if (!getShowTweak("matchincome")) return;
    
  var precios = new Array ( 5.5, 8.0, 11.0, 27.5 );
  var filas = document.getElementsByTagName ( "TR" );
  var expreg = new RegExp ( '<td colspan="1" align="left" valign="top"><b>.*:</b>\\s+</td>\\s*<td colspan="1" align="right" valign="top">(\\d+)</td>', "igm" );
  var tmp, base = filas.length - 4, i = 0, totalGente = 0, totalIngresos = 0;

  // _KOHb_ {
  var currency = "";
  var rate = 1.0;
  try {
    var currencyCode = PrefsBranch.getCharPref("htCurrency");
  } catch (e) {
    currencyCode = "EUR";
  }

  try {
    var path = "hattrickcurrencies/currency[@code='" + currencyCode + "']";
    var obj = htCurrenciesXml.evaluate(path,htCurrenciesXml,null,htCurrenciesXml.DOCUMENT_NODE,null).singleNodeValue;
    currency = obj.attributes.getNamedItem("shortname").textContent;
    rate = 1.0/parseFloat(obj.attributes.getNamedItem("eurorate").textContent);
  } catch (e) {
    currency = "&euro;";
    rate = 1.0;
  }
  // }

  while ( tmp = expreg.exec ( document.body.innerHTML ) ) {
  	ingreso = Math.ceil ( precios[i]*tmp[1]*rate );
	totalIngresos += ingreso;
	totalGente += parseInt ( tmp[1] );
	filas[base+i].innerHTML = filas[base+i].innerHTML + '<td colspan="1" align="right" valign="top">(' + foxtrick_formatNumber(ingreso) + " " + currency +')</td>';
	i++;
  }

  if ( i > 0 ) {
  	var tablas = document.getElementsByTagName ( "TABLE" );
  	tablas[15].innerHTML = tablas[15].innerHTML + '<tr><td style="border-top: 1px solid black;"><b>Total:</b> </td><td style="border-top: 1px solid black;" colspan="1" align="right" valign="top">' + totalGente+ '</td><td style="border-top: 1px solid black;" colspan="1" align="right" valign="top">(' + foxtrick_formatNumber(totalIngresos) + " " + currency +')</td></tr>';
  }
    
}

function goalDifference(document) {
    
  if (!isPromotionUrl(document.location.href)) return;
  if (!getShowTweak("goalDifference")) return;
  
  var table;
  
  for (var i=0; i<document.links.length; i++) {
    if (isTeamDetailUrl(document.links[i].href)) {
        table = findAncestor(document.links[i], "TABLE");
        break;
    }
  }
  
  if (table == null) return;
  
  var filas = table.rows;
  var filabase = 0;

  // making the Goals column bigger to include the new goal difference column
  filas[filabase].cells[2].colSpan = 2;
  var regexp = new RegExp ( '(<TD[^>]*>(\\d+)\.\\s*<\/TD>\\s*<TD[^>]*><A[^>]*>.*<\/A>\\s*<\/TD>\\s*<TD[^>]*>(\\d*)\\s*\\-\\s*(\\d*))(<\/TD>\\s*<TD[^>]*>\\d*<\/TD>)', "img" );
  
  for ( i = filabase+1; i < table.rows.length; i++ ) {
  	regexp.lastIndex = 0;
  	tmp = regexp.exec ( filas[i].innerHTML );
  	
  	if ( tmp != null ) {
		var goles = parseInt(tmp[3]) - parseInt(tmp[4]);
		var color = "red";
		if ( goles > 0 ) {
			goles = "+" + goles;
			color = "green";
		}
		else if ( goles == 0 ) {
			color = "blue";
		}
		filas[i].innerHTML = tmp[1] + '<td align="right" valign="top" width="1" style="color: ' + color + ';">(' + goles + ')</td>' + tmp[5];
  	}
	
  }  
}



function foxtrick_seriesHistoryGraph(document) {
  
  if (!isLeagueFixturesUrl(document.location.href)) return;
  if (!getShowTweak("seriesHistoryGraph1") && !getShowTweak("seriesHistoryGraph2")) return;
  
  function sortByMatchID ( a, b ) {
    return a [0] - b [0];
  }

  var fixture = [
    1, 2, 3, 4, 5, 6, 7, 8,
    6, 1, 8, 3, 2, 7, 4, 5,
    3, 2, 5, 8, 6, 4, 7, 1,
    1, 4, 8, 6, 2, 5, 7, 3,
    3, 1, 5, 7, 6, 2, 4, 8,
    1, 8, 3, 5, 2, 4, 7, 6,
    5, 1, 6, 3, 8, 2, 4, 7,
    7, 4, 2, 8, 3, 6, 1, 5,
    6, 7, 4, 2, 5, 3, 8, 1,
    8, 4, 2, 6, 7, 5, 1, 3,
    3, 7, 5, 2, 6, 8, 4, 1,
    1, 7, 4, 6, 8, 5, 2, 3,
    5, 4, 7, 2, 3, 8, 1, 6,
    8, 7, 6, 5, 4, 3, 2, 1 ];
  
  var div = document.createElement ( "DIV" );
  div.id = "foxtrickseriegraph";
  
  var tabla = document.getElementsByTagName ( "TABLE" ) [ 2 ];
  if ( typeof ( tabla ) == 'undefined' )
  	throw ("table not found");
  
  var matches = new Array ();
  
  var regexp = new RegExp ( '<A HREF="matchDetails\.asp\\?matchID=(-?\\d+)">(.*) - (.*)<\/A>&nbsp;\\s*<\/TD>\\s*<TD><BDO Dir="ltr">(\\d+) - (\\d+)<\/BDO><\/TD>', "img" );

  var tmp;
  var i = 0;
  while ( tmp = regexp.exec ( document.body.innerHTML ) ) {
    matches [i] = new Array (5);
    matches [i][0] = tmp[1];
    matches [i][1] = tmp[2].replace(/\+/g, '%2B').replace(/&amp;/g, '%26');
    matches [i][2] = tmp[3].replace(/\+/g, '%2B').replace(/&amp;/g, '%26');
    matches [i][3] = tmp[4];
    matches [i][4] = tmp[5];
    i++;
  }
  var numMatches = i;
  var sortedMatches = matches.sort (sortByMatchID);

  var equipos = new Array();
  for ( i = 0; i < 8; i++ )
    // 0: nombre, 1: goles a favor; 2: goles en contra
    equipos[i] = new Array ( "", 0, 0 );
  for ( i = 0; i < numMatches; i++ ) {
    equipos [fixture[i*2]-1  ] [0] = sortedMatches[i][1];
    equipos [fixture[i*2]-1  ] [1] += sortedMatches[i][3] + "-";
    equipos [fixture[i*2]-1  ] [2] += sortedMatches[i][4] + "-";
    equipos [fixture[i*2+1]-1] [0] = sortedMatches[i][2];
    equipos [fixture[i*2+1]-1] [1] += sortedMatches[i][4] + "-";
    equipos [fixture[i*2+1]-1] [2] += sortedMatches[i][3] + "-";
  }

  var params = "?j1=" + equipos[0] + "&amp;j2=" + equipos[1] +
  		"&amp;j3=" + equipos[2] + "&amp;j4=" + equipos[3] +
		"&amp;j5=" + equipos[4] + "&amp;j6=" + equipos[5] +
		"&amp;j7=" + equipos[6] + "&amp;j8=" + equipos[7];
	
  div.style.margin = "12px 0";
  
  if (!getShowTweak("seriesHistoryGraph2")) {
   // autoshow
   div.innerHTML = '<img src="http://cebrator.php5.cz/clasificacion.php' + params + '">';
  } else {
   // display on click
   div.innerHTML = '<a href="" onClick="var z=document.getElementById(\'foxtrick-clasificacion2\');z.style.display=z.style.display==\'inline\'?\'none\':\'inline\';return false;">' + 
   messageBundle.GetStringFromName("foxtrick.tweaks.serieshistorygraphlabel") + ' (FoxTrick)' +'</a><div id="foxtrick-clasificacion2" style="display: none;"><img src="http://cebrator.php5.cz/clasificacion.php' + params + '"></div>';
  }
  tabla.parentNode.insertBefore ( div, tabla );

}


function playerDetailCountryFlag(doc) {
  
  if (!isPlayerDetailUrl(doc.location.href)) return;
  if (!getShowTweak("playerDetailCountryFlag")) return;
  
  for ( var i = 0, links = doc.links; i < links.length; i++ ) {
     if ( tmp = new RegExp ( /leagueSystemID=(\d+)/gi).exec ( links[i].href ) ) {
         links[i].parentNode.innerHTML = "<img src=\"images/" + tmp[1] + "flag.gif\" align=\"top\" alt=\"flag\" title=\""
         + links[i].textContent + "\" width=\"20\" height=\"12\">" + links[i].parentNode.innerHTML;
         break;
     }
  }
}

function foxtrick_specialists(doc) {
  
  if (!isOwnClubUrl(doc.location.href)) return;
  if (!getShowTweak("specialistsCost")) return;
  
  var cost = 1800;
  
  var currency = "";
  var rate = 1.0;
  try {
  	var currencyCode = PrefsBranch.getCharPref("htCurrency");
  } catch (e) {
  	currencyCode = "EUR";
  }
  
  try {
  	var path = "hattrickcurrencies/currency[@code='" + currencyCode + "']";
  	var obj = htCurrenciesXml.evaluate(path,htCurrenciesXml,null,htCurrenciesXml.DOCUMENT_NODE,null).singleNodeValue;
  	currency = obj.attributes.getNamedItem("shortname").textContent;
  	rate = 1.0/parseFloat(obj.attributes.getNamedItem("eurorate").textContent);
  } catch (e) {
  	currency = "&euro;";
  	rate = 1.0;
  }
  
  var tabla = doc.getElementsByTagName ( "TABLE" ) [3];
  var total = 0;
  for ( var i = 0; i < tabla.rows.length; i++ ) {
  	var tmp = doc.createElement ( "TD" );
  	var esp = parseInt ( tabla.rows[i].cells[1].textContent );
  	tmp.innerHTML = ( "(" + foxtrick_formatNumber(esp*cost*rate) + " " + currency + ")" );
  	tmp.setAttribute ( "style", "color: gray; text-align: right;" );
  	tabla.rows[i].appendChild ( tmp );
  	tabla.rows[i].cells[1].setAttribute ( "ALIGN", "RIGHT" );
  	total += esp;
  }

  
  var fila = doc.createElement ( "TR" );
  var celda = doc.createElement ( "TD" );
  celda.setAttribute ( "style", "border-top: 1px solid gray;" );
  celda.innerHTML = "<b>Total:</b>";
  fila.appendChild ( celda );
  celda = doc.createElement ( "TD" );
  celda.setAttribute ( "style", "border-top: 1px solid gray; text-align: right;" );
  celda.innerHTML = total;
  fila.appendChild ( celda );
  celda = doc.createElement ( "TD" );
  celda.innerHTML = "(" + foxtrick_formatNumber ( total*cost*rate ) + " " + currency + ")";
  celda.setAttribute ( "style", "border-top: 1px solid gray; text-align: right; padding-left: 10px; color: gray;" );
  fila.appendChild ( celda );
  
  tabla.appendChild ( fila );
}