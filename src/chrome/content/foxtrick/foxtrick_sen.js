function foxtrick_addTeamLinkPopups(doc) {
  
  if (!getShowTweak("teamPopupLinks")) return;
  
  if (doc.location.href.match(/teamDetails\.asp/i)) return;
  if (doc.location.href.match(/menu\.asp/i)) return;
  
  var head = doc.getElementsByTagName("head")[0];
  var style = doc.createElement("style");
  style.setAttribute("type", "text/css");
  var zaw = 'span.myht1 {position: relative} div.myht2 {display: none} span.myht1:hover div.myht2 {display: block; width: 60px; position: absolute; left: 35px; top: -37px; background-color: #FFFFFF; border: solid 1px #267F30; padding: 2px}';
  style.appendChild(doc.createTextNode(zaw));
  head.appendChild(style);
  var links = doc.getElementsByTagName('a'); //doc.links;

  for (var i=0; i<links.length; i++) {
    if (links[i].href.search(/teamDetails\.asp\?teamID=/i) > -1) {
      var link = links[i];
      var pocz = link.href.search(/teamID=/i);
      var value = link.href.substr(pocz+7,7);
      if (value.match(/&/)) {
        value = value.substr(0,value.search(/&/));
      }
      var par = links[i].parentNode; //rodzic
      
      var a1 = doc.createElement("a");
      a1.setAttribute('href', '/Common/matches.aspx?actionType=view&TeamID=' + value);
      a1.setAttribute('target', 'main');
      a1.appendChild(doc.createTextNode("Matches"));
      
      var a2 = doc.createElement("a");
      a2.setAttribute('href', '/Common/players/players.aspx?TeamID=' + value);
      a2.setAttribute('target', 'main');
      a2.appendChild(doc.createTextNode("Players"));
      
      var a3 = doc.createElement("a");
      a3.setAttribute('href', '/Common/teamDetails.asp?actionType=viewUser&subaction=&TeamID=' + value+'&ShowOldConnections=true');
      a3.setAttribute('target', 'main');
      a3.appendChild(doc.createTextNode("Last 5 IPs"));
      
      var span = doc.createElement("span");
      span.setAttribute('class', 'myht1');
      var div = doc.createElement("div");
      div.setAttribute('class', 'myht2');
      div.appendChild(a1);
      div.appendChild(doc.createElement("br"));
      div.appendChild(a2);
      div.appendChild(doc.createElement("br"));
      div.appendChild(a3);
      par.insertBefore(span, links[i]);
      span.appendChild(link);
      span.appendChild(div);
      i=i+2;
    }
  }
}
