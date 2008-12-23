/**
 * linksleague.js
 * Foxtrick add links to league pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
function isSeriesDetailUrl(href) {
  return href.match(/Series\/Default\.aspx/i) ;
}

function getLeagueLeveUnitIdFromUrl(url) {
   return url.replace(/.+leagueLevelUnitID=/i, "").match(/^\d+/);
}


//---------------------------------------------------------------------------    
function findLeagueLeveUnitId(element) {
  var links = element.getElementsByTagName('a');
  
  for (var i=0; i < links.length; i++) {
    if ( links[i].href.match(/Series\/Default\.aspx/i) ) {
      return links[i].href.replace(/.+leagueLevelUnitID=/i, "").match(/^\d+/)[0];
    }
  }
  
  return null;
}


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

function extractLeagueName(element) {
 
 var links = element.getElementsByTagName('a');
 
 for (var i=0; i<links.length; i++) {
    if (isSeriesDetailUrl(links[i].href)) {
        return Foxtrick.trim(links[i].text);
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

var FoxtrickLinksLeague = {
	
    MODULE_NAME : "LinksLeague",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	DEFAULT_ENABLED : true,


    init : function() {
            Foxtrick.registerPageHandler( 'league',
                                          FoxtrickLinksLeague );
    },

    run : function( page, doc ) {

			if (Foxtrick.SidebarExist (doc,Foxtrickl10n.getString("foxtrick.links.boxheader" ))) {return;}

			//addExternalLinksToLeagueDetail
			var alldivs = doc.getElementsByTagName('div');
			for (var j = 0; j < alldivs.length; j++) {
				if (alldivs[j].className=="main mainRegular") {
					var thisdiv = alldivs[j];
					var leagueid = findLeagueLeveUnitId(thisdiv);;
					var countryid = findCountryId(thisdiv);
        
					var leaguename = extractLeagueName(thisdiv);
					var leaguename2 = leaguename;
					var leaguename3 = leaguename;
        
					var seriesnum = getSeriesNum(leaguename);
					var levelnum = getLevelNum(leaguename, countryid);

        
					if (!leaguename.match(/^[A-Z]+\.\d+/i)) {
						leaguename2="I";
						leaguename3="1";
						}
        
					var links = getLinks("leaguelink", { "countryid": countryid, "leagueid": leagueid, 
										"levelnum" : levelnum, "seriesnum": seriesnum,
										"leaguename" : leaguename, "leaguename2" : leaguename2, "leaguename3" : leaguename3 }, doc );  
             

					if (links.length > 0) {
						var ownBoxBody = doc.createElement("div");
                                
						for (var k = 0; k < links.length; k++) {
							links[k].link.className ="inner";
							ownBoxBody.appendChild(doc.createTextNode(" "));
							ownBoxBody.appendChild(links[k].link);
						}
						
						Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString(
							"foxtrick.links.boxheader" ), ownBoxBody, "first");
							
						/*
						var ownSidebarBox = doc.createElement("div");
								ownSidebarBox.className = "sidebarBox";
                                var ownBoxHead = doc.createElement("div");
                                ownBoxHead.className = "boxHead";
                                ownSidebarBox.appendChild(ownBoxHead);
                                var ownBoxLeftHeader = doc.createElement("div");
                                ownBoxLeftHeader.className = "boxLeft";
                                ownBoxHead.appendChild(ownBoxLeftHeader);
                                var ownHeader = doc.createElement("h2");
                                ownHeader.innerHTML = Foxtrickl10n.getString("foxtrick.links.boxheader" );
                                ownBoxLeftHeader.appendChild(ownHeader);
                                var ownBoxBody = doc.createElement("div");
                                ownBoxBody.className = "boxBody";
                                ownSidebarBox.appendChild(ownBoxBody);
                                
								for (var k = 0; k < links.length; k++) {
									links[k].link.className ="inner";
									
									ownBoxBody.appendChild(doc.createTextNode(" "));
									ownBoxBody.appendChild(links[k].link);
								}
								var ownBoxFooter = doc.createElement("div");
                                ownBoxFooter.className = "boxFooter";
                                ownSidebarBox.appendChild(ownBoxFooter);
                                var ownBoxLeftFooter = doc.createElement("div");
                                ownBoxLeftFooter.className = "boxLeft";
                                ownBoxLeftFooter.innerHTML = "&nbsp;";                       
                                ownBoxFooter.appendChild(ownBoxLeftFooter);
                                
                                // Append the message form to the sidebar
                                var sidebar = doc.getElementById("sidebar");
                                var firstDiv = sidebar.getElementsByTagName("div")[0];
                                var subDivs = firstDiv.getElementsByTagName("div");
                                var divBoxHead;
                                var divBoxBody;
                                for(var j = 0; j < subDivs.length; j++) {
                                        switch(subDivs[j].className) {
                                                case "boxHead":
                                                        divBoxHead = subDivs[j];
                                                        break;
                                                case "boxBody":
                                                        divBoxBody = subDivs[j];
                                                        break;
                                        }
                                }
                                var divBoxLeft = divBoxHead.getElementsByTagName("div")[0];
                                var header = divBoxLeft.getElementsByTagName("h2")[0];
                                sidebar.insertBefore(ownSidebarBox,firstDiv.nextSibling);                                
                                break;*/
                }
            break;  
			}
		}
	}	
 
};