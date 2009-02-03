/**
* forumalltidflags.js
* Foxtrick Show Alltid flags in forum posts module
* @author convinced
*/

function findLeagueLeveUnitId(element) {
  var links = element.getElementsByTagName('a');
  
  for (var i=0; i < links.length; i++) {
    if ( links[i].href.match(/Series\/Default\.aspx/i) ) {
      return links[i].href.replace(/.+leagueLevelUnitID=/i, "").match(/^\d+/)[0];
    }
  }
  
  return null;
}

var FoxtrickAlltidFlags = {

	MODULE_NAME : "AlltidFlags",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : true,
	RADIO_OPTIONS : new Array("LinkFlagToLeague","LinkFlagToAlltid"), 

	init : function() {
		Foxtrick.registerPageHandler( 'forumViewThread',
			FoxtrickAlltidFlags );
	},

	run : function( page, doc ) {  
	try{	
		var flagspage = "http://flags.alltidhattrick.org/userflags/";
		var linkpage = "http://stats.alltidhattrick.org/user/";
		var style ="margin-right:3px; margin-bottom:3px; padding-left:3px; " + 
					"background-repeat:repeat-x; background-position: 0% 50%;";
		
		var flagsCounter = 0;
		var body = doc.getElementById("mainBody");
        if (body != null) {
			var alldivs = getElementsByClass("cfWrapper", body);
        	for (var i = 0; i < alldivs.length; i++) {
            	var innerdivs = alldivs[i].getElementsByTagName('div');
				var LeagueId=0;
				var titlecountry1="";
				for (var k = 0; k < innerdivs.length; k++) {
							if (innerdivs[k].className=="cfUserInfo") {
							LeagueId=findLeagueLeveUnitId(innerdivs[k]);
							var linksArray = innerdivs[k].getElementsByTagName('a');
							// get country
							for (var j=0; j<linksArray.length; j++) {
								var link = linksArray[j];
								if (link.href.search(/LeagueId=/i) > -1) {
									titlecountry1 = link.getElementsByTagName('img')[0].title;
								break;
								}
							}	
						}
				}
				for (var k = 0; k < innerdivs.length; k++) {
				  if (innerdivs[k].className=="cfWrapper") {
				    var count=0;
				    var linksArray = innerdivs[k].getElementsByTagName('a');
				
				    for (var j=0; j<linksArray.length; j++) {
					  var link = linksArray[j];
					  if (link.href.search(/userId=/i) > -1 && link.href.search(/ft_popuplink=true/i)==-1 && link.href.search('redir_to_league=true')==-1) { 
						// Add the Alltid flags
						var mySpan = doc.createElement('span');
						var spanId = "foxtrick_alltidspan_"+flagsCounter;
						mySpan.setAttribute( "id", spanId );
						var userId = link.href.replace(/.+userId=/i, "").match(/^\d+/);
						//dump(spanId+"\n"+userId+"\n");
						var thistitlecountry="";
						if (count==0) thistitlecountry = titlecountry1;
						if (count==1 || FoxtrickPrefs.getInt("module." + this.MODULE_NAME + ".value") == 1 || titlecountry1=="" || LeagueId==0) {		
							var href= linkpage + userId;
							target='_blank';
							if (FoxtrickPrefs.getInt("module." + this.MODULE_NAME + ".value") == 0) {
								href='/Club/Manager/?userId='+userId+'&redir_to_league=true';
								target='_self';
							}
							mySpan.innerHTML = ' <a href="' +href+
							'"target="'+target+'"><img title="'+thistitlecountry+'" " style="' + 
							'vertical-align: middle; ' + style + '" src="' + 
							flagspage + userId + '.gif" border="0"' +
							'height="12" /></a>';}
						else {
							mySpan.innerHTML = ' <a href="/World/Series/Default.aspx?LeagueLevelUnitID=' + LeagueId +
							'" target="_self"><img title="'+thistitlecountry+'" style="' + 
							'vertical-align: middle; ' + style + '" src="' + 
							flagspage + userId + '.gif" border="0"' +
							'height="12" /></a>';}
						var target = link.nextSibling;
						if (j+1!=linksArray.length && linksArray[j+1].href.lastIndexOf('Supporter') > -1) {
							target=linksArray[j+1].nextSibling;
						}
						if ( !doc.getElementById( spanId ) ) {
							link.parentNode.insertBefore(mySpan, target);
						}
						if (count==1) {
							flagsCounter++;
							break;
						}
						count++;
						flagsCounter++;
					  } else if (	link.href.search(/Read.aspx/i) > -1 && 
						!link.id) {
						// Replace "as answer to"
						var asAnswerTo = link.previousSibling;
						var newText = doc.createTextNode(" => ");
						asAnswerTo.parentNode.replaceChild(newText,asAnswerTo);
					  }
					}
				  }
				}
				
			}
		}
	} catch (e) {dump('ForumShowAlltidFlags->'+e+'\n');}
	},
	
	change : function( page, doc ) {
		var spanId = "foxtrick_alltidspan_0";  // id of first added flag
		if( !doc.getElementById ( spanId ) ) {
			this.run( page, doc );
		}
	},	
						
};