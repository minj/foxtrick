/**
* forumalltidflags.js
* Foxtrick Show Alltid flags in forum posts module
* @author convinced
*/

////////////////////////////////////////////////// //////////////////////////////

var FoxtrickAlltidFlags = {

	MODULE_NAME : "AlltidFlags",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : true,

	init : function() {
		Foxtrick.registerPageHandler( 'forumViewThread',
			FoxtrickAlltidFlags );
	},

	run : function( page, doc ) {
		var flagspage = "http://flags.alltidhattrick.org/userflags/";
		var linkpage = "http://stats.alltidhattrick.org/user/";

		var alldivs = doc.getElementsByTagName('div');
		var flagsCounter = 0;
		for (var i = 0; i < alldivs.length; i++) {
			if (alldivs[i].className=="cfWrapper") {
				var style ="margin-right:3px; padding-left:3px; " + 
					"background-repeat:repeat-x; background-position: 0% 50%;";
				var target = "_blank";
				var linksArray = alldivs[i].getElementsByTagName('a');
				
				var titlecountry1="";
				// get country
				for (var j=0; j<linksArray.length; j++) {
					var link = linksArray[j];
					if (link.href.search(/LeagueId=/i) > -1) {
						titlecountry1 = link.getElementsByTagName('img')[0].title;
						break;
					}	
				} 
				var innerdivs = alldivs[i].getElementsByTagName('div');
				for (var k = 0; k < innerdivs.length; k++) {
				  if (innerdivs[k].className=="cfHeader") { //Foxtrick.alert("W");
				    var count=0;
				    var linksArray = innerdivs[k].getElementsByTagName('a');
				
				    for (var j=0; j<linksArray.length; j++) {
					  var link = linksArray[j];
					  if (link.href.search(/userId=/i) > -1) {
						// Add the Alltid flags
						var mySpan = doc.createElement('span');
						var spanId = "foxtrick_alltidspan_"+flagsCounter;
						mySpan.setAttribute( "id", spanId );
						var userId = link.href.substring(link.href.lastIndexOf('userId=')+7);
						dump(spanId+"\n"+userId+"\n");
						var thistitlecountry="";
						if (count==0) thistitlecountry = titlecountry1;
						mySpan.innerHTML = ' <a href="' + linkpage + userId +
							'" target="' + target + ' "><img title="'+thistitlecountry+'" " style="' + 
							'vertical-align: middle; ' + style + '" src="' + 
							flagspage + userId + '.gif" border="0"' +
							'height="12" /></a>';
						target = link.nextSibling;
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
	}
};