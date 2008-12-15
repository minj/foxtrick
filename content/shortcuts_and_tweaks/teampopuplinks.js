/**
 * teampopuplinks.js
 * Foxtrick show Team Popup
 * @author bummerland
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickTeamPopupLinks = {
    
    MODULE_NAME : "TeamPopupLinks",
	MODULE_CATEGORY : "shortcutsandtweaks",

    init : function() {
        Foxtrick.registerAllPagesHandler( FoxtrickTeamPopupLinks );
    },

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
		var zaw = 'span.myht1 {position: relative} div.myht2 {display: none} span.myht1:hover div.myht2 {display: inline; width: 80px; position: absolute; left: 20px; top: -54px; background-color: #FFFFFF; border: solid 1px #267F30; padding: 0px; z-index:999}';
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
				
				if (par.parentNode.parentNode.parentNode.tagName == "DIV" && par.parentNode.parentNode.parentNode.className == "subMenuBox"){
					continue;
				}
				if (par.parentNode.tagName == "DIV" && par.parentNode.className == "boxLeft"){
					continue;
				}
				if (par.tagName == "DIV" && par.id == "teamLinks"){
					continue;
				}
				
				var tbl = doc.createElement("table");
				tbl.setAttribute("cell-padding", "2");
				tbl.setAttribute("cell-spacing", "0");
				var tr1 = doc.createElement("tr");
				var td1 = doc.createElement("td");
				var a1 = doc.createElement("a");
				a1.setAttribute('href', '/Club/Matches/?TeamID=' + value);
				a1.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Matches' )));
				td1.appendChild(a1);
				tr1.appendChild(td1);
				tbl.appendChild(tr1);
				var tr2 = doc.createElement("tr");
				var td2 = doc.createElement("td");
				var a2 = doc.createElement("a");
				a2.setAttribute('href', '/Club/Players/?TeamID=' + value);
				a2.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Players' )));
				td2.appendChild(a2);
				tr2.appendChild(td2);
				tbl.appendChild(tr2);
				
				var tr3 = doc.createElement("tr");
				var td3 = doc.createElement("td");
				var a3 = doc.createElement("a");
				a3.setAttribute('href', '/Club/Manager/?teamId=' + value+'&ShowOldConnections=true');
				a3.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'last_5_ips' )));
				td3.appendChild(a3);
				tr3.appendChild(td3);
				tbl.appendChild(tr3);
				
				var span = doc.createElement("span");
				span.setAttribute('class', 'myht1');
				var div = doc.createElement("div");
				div.setAttribute('class', 'mainBox myht2');
//				div.appendChild(a1);
//				div.appendChild(doc.createElement("br"));
//				div.appendChild(a2);
//				div.appendChild(doc.createElement("br"));
//				div.appendChild(a3);
				div.appendChild(tbl);
				par.insertBefore(span, aLinks[i]);
				span.appendChild(sLink);
				span.appendChild(div);
				
				i=i+2;
			}
		}
	}
};

