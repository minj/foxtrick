/**
 * teampopuplinks.js
 * Foxtrick show Team Popup
 * @author bummerland
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickTeamPopupLinks = {
    
    MODULE_NAME : "TeamPopupLinks",
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : true,
	OPTIONS : new Array("Matches", "Players", "last_5_ips", "Guestbook"),

    init : function() {
    	Foxtrick.registerAllPagesHandler( FoxtrickTeamPopupLinks );
    },

    run : function( doc ) {
		if (!FoxtrickPrefs.getBool("module.TeamPopupLinks.enabled"))
			return;
		var sUrl = Foxtrick.getHref( doc );
		//do not display pop-up on Forum pages
		if (sUrl.search(/Forum/i) != -1) return;
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
		//determine width of the floating box - Stephan
		var maxwidth = Math.max(Foxtrickl10n.getString( 'Matches' ).length, Foxtrickl10n.getString( 'Players' ).length, Foxtrickl10n.getString( 'last_5_ips' ).length, Foxtrickl10n.getString( 'Guestbook' ).length); //Stephan
		var bMatches = Foxtrick.isModuleFeatureEnabled( this, "Matches");
		var bPlayers = Foxtrick.isModuleFeatureEnabled( this, "Players");
		var bLast5IPs = Foxtrick.isModuleFeatureEnabled( this, "last_5_ips");
		var bGuestbook = Foxtrick.isModuleFeatureEnabled( this, "Guestbook");
		var top = 0;
		if (bMatches)
			top = top - 20;
		if (bPlayers)
			top = top - 20;
		if (bLast5IPs)
			top = top - 20;
		if (bGuestbook)
			top = top - 20;
		var zaw = 'span.myht1 {position: relative} div.myht2 {display: none} span.myht1:hover div.myht2 {display: inline; width: maxwidth; position: absolute; left: 20px; top:' + top + 'px !important; background-color: #FFFFFF; border: solid 1px #267F30; padding: 0px; z-index:999}'; //Stephan
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
				var par = aLinks[i].parentNode;
				
				if (par.parentNode.parentNode.parentNode.tagName == "DIV" && par.parentNode.parentNode.parentNode.className == "subMenuBox"){
					continue;
				}
				if (par.parentNode.parentNode.tagName == "DIV" && par.parentNode.parentNode.className == "subMenuBox"){
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
				
				if (bMatches){
					var tr1 = doc.createElement("tr");
					tr1.setAttribute("height", "20");
					var td1 = doc.createElement("td");
					var a1 = doc.createElement("a");
					a1.setAttribute('href', '/Club/Matches/?TeamID=' + value);
					a1.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Matches' )));
					td1.appendChild(a1);
					tr1.appendChild(td1);
					tbl.appendChild(tr1);
				}
				
				if (bPlayers){
					var tr2 = doc.createElement("tr");
					tr2.setAttribute("height", "20");
					var td2 = doc.createElement("td");
					var a2 = doc.createElement("a");
					a2.setAttribute('href', '/Club/Players/?TeamID=' + value);
					a2.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Players' )));
					td2.appendChild(a2);
					tr2.appendChild(td2);
					tbl.appendChild(tr2);
				}
								
				if (bLast5IPs){
					var tr3 = doc.createElement("tr");
					tr3.setAttribute("height", "20");
					var td3 = doc.createElement("td");
					td3.setAttribute("nowrap", "nowrap");
					var a3 = doc.createElement("a");
					a3.setAttribute('href', '/Club/Manager/?teamId=' + value+'&ShowOldConnections=true');
					a3.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'last_5_ips' )));
					td3.appendChild(a3);
					tr3.appendChild(td3);
					tbl.appendChild(tr3);
				}
				
				if (bGuestbook){
					var tr4 = doc.createElement("tr");
					tr4.setAttribute("height", "20");
					var td4 = doc.createElement("td");
					td4.setAttribute("nowrap", "nowrap");
					var a4 = doc.createElement("a");
					a4.setAttribute('href', '/Club/Manager/Guestbook.aspx?teamid=' + value);
					a4.appendChild(doc.createTextNode(Foxtrickl10n.getString( 'Guestbook' )));
					td4.appendChild(a4);
					tr4.appendChild(td4);
					tbl.appendChild(tr4);
				}
				
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
	},
	
	change : function( page, doc ) {
	
	}
};

