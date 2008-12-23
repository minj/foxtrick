/**
 * linksteam.js
 * Foxtrick add links to team pages
 * @author convinced
 */

 
////////////////////////////////////////////////////////////////////////////////
//---------------------------------------------------------------------------    
function findCountryId(element) {
  var links = element.getElementsByTagName('a');
  
  for (var i=0; i < links.length; i++) {
    if ( links[i].href.match(/League\.aspx/i) ) {
      return links[i].href.replace(/.+leagueid=/i, "").match(/^\d+/)[0];
    }
  }
  return null;
}

function findTeamId(element) {
  var links = element.getElementsByTagName('a');
  
  for (var i=0; i < links.length; i++) {
    if ( links[i].href.match(/TeamID=/i) ) {
      return links[i].href.replace(/.+TeamID=/i, "").match(/^\d+/)[0];
    }
  }
  return null;
}

function getTeamIdFromUrl(url) {
  return url.replace(/.+TeamID=/i, "").match(/^\d+/);
}

function isTeamDetailUrl(href) {
  return href.match(/.+TeamID=/i) ;
}


function extractTeamName(element) {
 
 var links = element.getElementsByTagName('a');
 
 for (var i=0; i<links.length; i++) {
    if (isTeamDetailUrl(links[i].href)) {
        return Foxtrick.trim(links[i].text);
    } 
 }
 
 return null;
    
}

function isLeagueDetailUrl(href) {
  return href.match(/World\/Series\/Default\.aspx/i) ;
}

function extractLeagueNameFromElement(element) {
 var links = element.getElementsByTagName('a');
 for (var i=0; i<links.length; i++) {
    if (isLeagueDetailUrl(links[i].href)) {
        return links[i].textContent;
    } 
 }
 return null;
}

function getSeriesNum(leaguename) {
    if (!leaguename.match(/^[A-Z]+\.\d+/i)) {
         return "1";
    } else {
          return leaguename.match(/\d+/)[0];
    }
}

function getLevelNum(leaguename, countryid) {
    if (leaguename == null || countryid == null) return null;
  
    if (!leaguename.match(/^[A-Z]+\.\d+/i)) {
        
        // sweden
        if (countryid == "1") {
            if (leaguename.match(/^II[a-z]+/)) {
                return "3";
            }
            if (leaguename.match(/^I[a-z]+/)) {
                return "2";
            }
            return "1";
            
        }
        
         return "1";
    } else {
        var temp = foxtrick_romantodecimal(leaguename.match(/[A-Z]+/)[0]);
          
        // sweden
        if (countryid == "1") {
            return temp + 1;
        } else {

            return temp;
        }
    }
}

function foxtrick_romantodecimal(roman) {
    
    // very very stupid ....
    switch (roman) {
        case ("I"): return 1;
        case ("II"): return 2;
        case ("III"): return 3;
        case ("IV"): return 4;
        case ("V"): return 5;
        case ("VI"): return 6;
        case ("VII"): return 7;        
        case ("VIII"): return 8;
        case ("IX"): return 9;
        case ("X"): return 10;
        default: return null;
    }
}

function isTeamPage(doc) {
	var site=doc.location.href;
	var remain=site.substr(site.search('Club\/')+5);
    return (remain=="" || remain.search(/TeamID=/i)==1);
}

var FoxtrickLinksTeam = {
	
    MODULE_NAME : "LinksTeam",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	DEFAULT_ENABLED : true,
	OPTIONS : {}, 

    init : function() {
            Foxtrick.registerPageHandler( 'teamPageGeneral',
                                          FoxtrickLinksTeam );
			Foxtrick.initOptionsLinks(this,"teamlink");
    },

    run : function( page, doc ) {
		if (!isTeamPage(doc)) {return;}
	
		//addExternalLinksToCountryDetail
		var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
					var thisdiv = alldivs[j];
					var countryid = findCountryId(thisdiv);
  
					var teamid = findTeamId(thisdiv);
					var teamname = extractTeamName(thisdiv);
					var leaguename = extractLeagueNameFromElement(thisdiv);
					var levelnum = getLevelNum(leaguename, countryid);
      
					if (!leaguename.match(/^[A-Z]+\.\d+/i)) {
						leaguename="I";
					} 
       
					links = getLinks("teamlink", { "teamid": teamid, "teamname": teamname, "countryid" : countryid, "levelnum" : levelnum  }, doc, this );
				
					if (links.length > 0) {
						var ownBoxBody = doc.createElement("div");
                                
						for (var k = 0; k < links.length; k++) {
							links[k].link.className ="inner";
							ownBoxBody.appendChild(doc.createTextNode(" "));
							ownBoxBody.appendChild(links[k].link);
						}
						
						Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString(
							"foxtrick.links.boxheader" ), ownBoxBody, "first");                                                              
					}
			break;
			}
		}
   }	
 
};