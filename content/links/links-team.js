"use strict";
/**
 * links-team.js
 * Foxtrick add links to team pages
 * @author convinced
 */

Foxtrick.util.module.register({
	alltid_links : {
		"alltid_add": {
			"handler" : function(ev) {
				var doc = ev.target.ownerDocument;
				var teamid = Number(ev.target.getAttribute('teamid'));
				var teamname = ev.target.getAttribute('teamname');
				
				var teams = Foxtrick.sessionGet("alltidcompare_teams");
				var new_teams = [], isNew = true;
				if (teams)
					for (var i=0; i<teams.length; ++i) {
						if (teams[i].teamid != teamid) 
							new_teams.push(teams[i]); 
						else isNew = false;
					}
				if (isNew) 
					new_teams.push({ teamid:teamid, teamname:teamname });
				Foxtrick.sessionSet("alltidcompare_teams", new_teams);
				
				var note = doc.createElement('p');
				var h3 = doc.createElement('h3');
				h3.appendChild( doc.createTextNode("Selected teams:") );
				note.appendChild( h3 );
				for (var j=0; j<new_teams.length; ++j) {
					note.appendChild( doc.createTextNode(new_teams[j].teamname) );
					note.appendChild( doc.createElement('br') );
				}
				Foxtrick.util.note.add(doc, doc.getElementById('foxtrick_links_content'), "ft-alltid_tc-note", note, null, true);
			},
			"img": "resources/linkicons/ahaddremove.png",
			"title": "Alltid: add to or remove from compare list",
			"shorttitle": "Add/Remove"
		},
		"alltid_clear": {
			"handler": function(ev) {
				var doc = ev.target.ownerDocument;
				Foxtrick.sessionSet("alltidcompare_teams", null);
				Foxtrick.util.note.add(doc, doc.getElementById('foxtrick_links_content'), "ft-alltid_tc-note", "Cleared team compare list", null, true);
			},
			"img": "resources/linkicons/ahclear.png",
			"title": "Alltid: clear compare list",
			"shorttitle": "Clear"
		},
		"alltid_compare": {
			"handler": function(ev) {
				var doc = ev.target.ownerDocument;
				var teams = Foxtrick.sessionGet("alltidcompare_teams"), teamids="";
				for (var i = 0; i < teams.length; ++i) {
					teamids += teams[i].teamid + ",";
				}
				Foxtrick.newTab("http://alltid.org/teamcompare/" + teamids);
			},
			"img": "resources/linkicons/ahcompare.png",
			"title": "Alltid: compare teams",
			"shorttitle": "Compare"
		}
	},

	MODULE_NAME : "LinksTeam",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('teamPage'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.util.module.get("Links").getOptionsHtml(doc, "LinksTeam", "teamlink");
	},
	OPTIONS : ["AlltidTeamCompare"],

	run : function(doc) {
		this.AddLinksRight(doc);
	},

	change : function(doc) {
		// challenging etc removes box. need to re-add it
		if (doc.getElementById('ft-links-box')===null)
			this.run(doc);
	},

	AddAlltidLinks : function(doc, thisdiv) {
  		var links = [];
		var teamid = Foxtrick.util.id.findTeamId(thisdiv);
		var teamname = Foxtrick.util.id.extractTeamName(thisdiv);
		var i;
		for (i in this.alltid_links) {
			var link = this.alltid_links[i];
			var linkNode = doc.createElement('a');
			linkNode.href = "javascript:void();"
			Foxtrick.listen(linkNode, 'click', link.handler, false);
			Foxtrick.addImage(doc, linkNode, { 
				alt: link.shorttitle || link.title, 
				title: link.title, 
				src: Foxtrick.InternalPath + link.img,
				teamid: teamid,
				teamname: teamname
			});
			links.push({ link: linkNode });
		}
		return links;
	},
	
	AddLinksRight : function(doc) {
		if (!this.isTeamPage(doc)) {return;}
		var alldivs = doc.getElementsByTagName('div');
		var ownBoxBody=null;
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
				var teaminfo = this.gatherLinks( alldivs[j], doc );

				var links = Foxtrick.util.module.get("Links").getLinks("teamlink", teaminfo, doc, this );
				if (FoxtrickPrefs.isModuleOptionEnabled("LinksTeam", "AlltidTeamCompare")) {
					var alltidLinks = this.AddAlltidLinks(doc, alldivs[j]);
					links = Foxtrick.concat(alltidLinks, links);
				}
				
				if (links.length > 0) {
					ownBoxBody = doc.createElement("div");
					var header = Foxtrickl10n.getString("foxtrick.links.boxheader" );
					var ownBoxBodyId = "foxtrick_links_content";
					ownBoxBody.id = ownBoxBodyId;

					for (var k = 0; k < links.length; k++) {
						links[k].link.className ="inner";
						ownBoxBody.appendChild(links[k].link);
					}
					var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
					box.id = "ft-links-box";
				}
				break;
			}
		}
		Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME,teaminfo);
	},

	isTeamPage : function(doc) {
		var site=doc.location.href;
		var remain=site.substr(site.search(/Club\//i)+5);  //Foxtrick.dump(remain+' '+remain.search(/TeamID=/i)+'\n');
		return (remain=="" || remain.search(/TeamID=/i)==1 || remain.search(/TeamID=/i)==13);
	},

	gatherLinks : function( thisdiv, doc ) {
		var countryid = Foxtrick.util.id.findLeagueId(thisdiv);
  		var teamid = Foxtrick.util.id.findTeamId(thisdiv);
		var teamname = Foxtrick.util.id.extractTeamName(thisdiv);
		var leaguename = Foxtrick.util.id.extractLeagueName(thisdiv);
		var levelnum = Foxtrick.util.id.getLevelNum(leaguename, countryid);
		var leagueid = Foxtrick.util.id.findLeagueLeveUnitId(thisdiv);;
		var userid = Foxtrick.util.id.findUserId(thisdiv);
		if (!leaguename.match(/^[A-Z]+\.\d+/i)) {
			leaguename="I";
		}
		var leaguepos=0,fans=0;
		try {
		  var teamInfo=doc.getElementById('mainBody').getElementsByTagName('h2')[0].parentNode;
		  var ps=teamInfo.getElementsByTagName('p');
		  try {leaguepos=ps[0].innerHTML.replace(/<.+>/,'').match(/(\d)/)[1];}
		  catch(e){}; // running game, leaguepos not known
		  var children=teamInfo.childNodes;
		  var child,i=0,infocount=0;
		  while (child=children[i++]) {
			if (infocount==2 && child.nodeName=='P'){
			  fans=children[i+1].innerHTML.replace(/&nbsp;/g,'').replace(/<a.+\/a>/ig,'').match(/(\d+)/)[1];
			  /*var l=children[i+1].innerHTML.lastIndexOf('(');
			  if (children[i+1].innerHTML.search(/\(/)!=-1) fans=children[i+1].innerHTML.replace(/&nbsp;/g,'').substr(l).match(/(\d+)/)[1];
			  else fans=children[i+1].innerHTML.replace('&nbsp;','').match(/(\d+)/)[1];*/
			  break;
			}
			if (child.className && child.className=='info') infocount++;
		  }
		}catch(e){Foxtrick.dump('leaguepos/fans: '+e+'\n');}
		return { "teamid": teamid, "teamname": teamname, "countryid" : countryid,
				"levelnum" : levelnum ,"leagueid": leagueid,"userid":userid,
				"fans":fans,'leaguepos':leaguepos};
	}
});
