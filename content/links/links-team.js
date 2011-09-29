/**
 * links-team.js
 * Foxtrick add links to team pages
 * @author convinced
 */

Foxtrick.util.module.register({
	alltid_links : {
		"alltid_add": {
			"openinthesamewindow": "true",
			"url": "javascript:var i=parseInt(localStorage.getItem(\"alltidcompare_index\"));if(!i)i=0;var do_remove=false;for(var j=0;j<i+1;++j) {if(parseInt(localStorage.getItem(\"alltidcompare_teamid\"+j))==[teamid]){do_remove=true;break;}}if (do_remove) {localStorage.setItem(\"alltidcompare_teamid\"+j,\"0\");localStorage.setItem(\"alltidcompare_teamname\"+j,\"\");}else {localStorage.setItem(\"alltidcompare_teamid\"+i, [teamid]);localStorage.setItem(\"alltidcompare_teamname\"+i, \"[teamname]\");i=i+1;localStorage.setItem(\"alltidcompare_index\",i);}var teams=\"\";for(var j=0;j<i;++j) {if(localStorage.getItem(\"alltidcompare_teamid\"+j)!=0) teams+=localStorage.getItem(\"alltidcompare_teamname\"+j)+\" --- \";}alert(\"Selected teams: \"+teams);",
			"img": "resources/linkicons/ahaddremove.png",
			"title": "Alltid: add to or remove from compare list",
			"shorttitle": "Add/Remove"
		},
		"alltid_clear": {
			"openinthesamewindow": "true",
			"url": "javascript: localStorage.setItem(\"alltidcompare_index\", 0); alert(\"Cleared team compare list\");",
			"img": "resources/linkicons/ahclear.png",
			"title": "Alltid: clear compare list",
			"shorttitle": "Clear"
		},
		"alltid_compare": {
			"url": "javascript: var alltidcompare_index=parseInt(localStorage.getItem(\"alltidcompare_index\")); var teams=\"\"; for (var i = 0; i < alltidcompare_index; ++i) if(localStorage.getItem(\"alltidcompare_teamid\" + i) != 0) teams += localStorage.getItem(\"alltidcompare_teamid\" + i) + \",\"; location.href=\"http://alltid.org/teamcompare/\"+teams;",
			"img": "resources/linkicons/ahcompare.png",
			"title": "Alltid: compare teams",
			"shorttitle": "Compare"
		}
	},
	
	MODULE_NAME : "LinksTeam",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('teamPage'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.util.links.getOptionsHtml(doc, this, false, "teamlink");
	},

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
			linkNode.href = link.url.replace(/\[teamid\]/g,teamid).replace(/\[teamname\]/g,teamname);
			linkNode.setAttribute("key", 'teamlink');
			linkNode.setAttribute("module", 'LinksTeam');
			if (link.openinthesamewindow) linkNode.target = '_self';
			else linkNode.target = '_stats';
			Foxtrick.addImage(doc, linkNode, { alt: link.shorttitle || link.title, title: link.title, src: Foxtrick.ResourcePath + link.img });
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

				var alltidLinks = this.AddAlltidLinks(doc, alldivs[j]);
				var externalLinks = Foxtrick.util.module.get("Links").getLinks("teamlink", teaminfo, doc, this );
				var links = Foxtrick.concat(alltidLinks,externalLinks);
				
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
