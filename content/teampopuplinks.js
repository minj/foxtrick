/**
 * teampopuplinks.js
 * Foxtrick show Team Popup
 * @author bummerland
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickTeamPopupLinks = {
    
    MODULE_NAME : "TeamPopupLinks",


    run : function( doc ) {
		
		var sUrl = Foxtrick.getHref( doc );
		if (sUrl.search(/ShowOldConnections=true/i) > -1){
			var a = doc.getElementById("ctl00_CPMain_lnkShowLogins");
			if (a){
				var func = a.href;
				if (func){
					doc.location.href = func;
				}
			}
		}
        var head = doc.getElementsByTagName("head")[0];
		var style = doc.createElement("style");
		style.setAttribute("type", "text/css");
		var zaw = 'span.myht1 {position: relative} div.myht2 {display: none} span.myht1:hover div.myht2 {display: block; width: 70px; position: absolute; left: 35px; top: -46px; background-color: #FFFFFF; border: solid 1px #267F30; padding: 2px}';
		style.appendChild(doc.createTextNode(zaw));
		head.appendChild(style);
		var aLinks = doc.getElementsByTagName('a'); //doc.links;
		for (var i=0; i<aLinks.length; i++) {
			if (aLinks[i].href.search(/Club\/\?TeamID=/i) > -1) {
				var sLink = aLinks[i];
				var pocz = sLink.href.search(/teamID=/i);
				var value = sLink.href.substr(pocz+7,7);
				if (value.match(/&/)) {
					value = value.substr(0,value.search(/&/));
				}
				var par = aLinks[i].parentNode; //rodzic
				
				var a1 = doc.createElement("a");
				a1.setAttribute('href', '/Club/Matches/?TeamID=' + value);
				a1.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Matches' )));
				
				var a2 = doc.createElement("a");
				a2.setAttribute('href', '/Club/Players/?TeamID=' + value);
				a2.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Players' )));
				
				var a3 = doc.createElement("a");
				a3.setAttribute('href', '/Club/Manager/?teamId=' + value+'&ShowOldConnections=true');
				a3.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'last_5_ips' )));
				
				var span = doc.createElement("span");
				span.setAttribute('class', 'myht1');
				var div = doc.createElement("div");
				div.setAttribute('class', 'myht2');
				div.appendChild(a1);
				div.appendChild(doc.createElement("br"));
				div.appendChild(a2);
				div.appendChild(doc.createElement("br"));
				div.appendChild(a3);
				par.insertBefore(span, aLinks[i]);
				span.appendChild(sLink);
				span.appendChild(div);
				i=i+2;
			}
		}
	}
};

