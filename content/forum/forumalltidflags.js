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

	run : function( page, doc ) {  return;
	try{	
		var flagspage = "http://flags.alltidhattrick.org/userflags/";
		var linkpage = "http://stats.alltidhattrick.org/user/";
		var style ="margin-right:3px; margin-bottom:3px; padding-left:3px; " + 
					"background-repeat:repeat-x; background-position: 0% 50%;";
		var link_to_alltid = (FoxtrickPrefs.getInt("module." + this.MODULE_NAME + ".value") == 1);
		var redir_to_team = (FoxtrickPrefs.getInt("module." + this.MODULE_NAME + ".value") == 0);
		
		var flagsCounter = 0; var postcount=0; 
		var alldivs = doc.getElementById('mainBody').getElementsByTagName('div');
		var alldivs_length = alldivs.length;
        for (var i = 0; i < alldivs_length ; ++i) {
            if (alldivs[i].className=='cfWrapper') { 
				var titlecountry1=null;
				var teamname=null;
				var teamid=null;
				
				var innerdivs = alldivs[i].getElementsByTagName('div');
				var innerdivs_length = innerdivs.length;
				for (var k = 4; k < innerdivs_length; k++) {
						if (innerdivs[k].className=="cfUserInfo") { 
							var linksArray = innerdivs[k].getElementsByTagName('a');
							linksArray_length = linksArray.length;
							// get country
							for (var j=0; j<linksArray_length; ++j) {
								var link = linksArray[j];
								if (link.href.search(/LeagueId=/i) > -1) {
									titlecountry1 = link.getElementsByTagName('img')[0].title;
								}
								else if (link.href.search(/TeamID=/i)>-1) {
									teamid = FoxtrickHelper.getTeamIdFromUrl(link.href); 
									teamname = link.innerHTML; 														
								}
							}
							break;
						}
				}
				var first_poster = true; 
				var linksArray = alldivs[i+1].getElementsByTagName('a');
				for (var j=0; j<linksArray.length; j++) {
					var link = linksArray[j];
					if (link.href.search(/userId=/i) != -1) { 
						// Add the Alltid flags
						var flaglink = doc.createElement('a');
						flaglink.setAttribute( "id", "foxtrick_alltidspan_" + flagsCounter );
						var userId = link.href.replace(/.+userId=/i, "").match(/^\d+/);
						
						if ( !first_poster || link_to_alltid || !titlecountry1 || !teamid) {	
							var target='_blank';
							var href;
							if (redir_to_team) {
								href='/Club/Manager/?userId='+userId+'&redir_to_league=true';
								target='_self';
							}
							else href = linkpage + userId;
							flaglink.setAttribute( "target", target );
							flaglink.setAttribute('href', href);
							flaglink.innerHTML='<img style="vertical-align: middle;" src="'+flagspage + userId + '.gif" />';
						}
						else {
							flaglink.setAttribute('href','/World/Series/Default.aspx?LeagueLevelUnitID=' + teamid);
							flaglink.innerHTML = "<img title="+titlecountry1+" style='vertical-align: middle;" + style + "' src="+flagspage + userId + ".gif border=0 height=12 />";
							link.setAttribute('teamid',teamid);
							link.setAttribute('teamname',teamname);			
						}
						var target = link.nextSibling;
						if (j+1!=linksArray.length && linksArray[j+1].href.lastIndexOf('Supporter') > -1) {
							target=linksArray[j+1].nextSibling;
						}
						link.parentNode.insertBefore(flaglink, target);
						
						++flagsCounter; j+=2;
						if (first_poster) first_poster=false;
						else break;						
					} 
				}
				
			}
		}
	} catch (e) {dump('ForumShowAlltidFlags->'+e+'\n');}
	},
	
	change : function( page, doc ) { return;
		var spanId = "foxtrick_alltidspan_0";  // id of first added flag
		if( !doc.getElementById ( spanId ) ) {
			this.run( page, doc );
		}
	},	
						
};