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
		for (var i = 0; i < alldivs.length; i++) {
			if (alldivs[i].className=="cfHeader") {
				var style ="margin-right:3px; padding-left:3px; " + 
					"background-repeat:repeat-x; background-position: 0% 50%;";
				var target = "_blank";
				var linksArray = alldivs[i].getElementsByTagName('a');
				for (var j=0; j<linksArray.length; j++) {
					var link = linksArray[j];
					if (link.href.search(/userId=/i) > -1) {
						// Add the Alltid flags
						var mySpan = doc.createElement('span');
						var userId = link.href.substring(link.href.lastIndexOf('userId=')+7);
						mySpan.innerHTML = ' <a href="' + linkpage + userId +
							'" target="' + target + ' "><img style="' + 
							'vertical-align: middle; ' + style + '" src="' + 
							flagspage + userId + '.gif" border="0"' +
							'height="12" /></a>';
						target = link.nextSibling;
						if (j+1!=linksArray.length && linksArray[j+1].href.lastIndexOf('Supporter') > -1) {
							target=linksArray[j+1].nextSibling;
						}
						link.parentNode.insertBefore(mySpan, target);
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
};