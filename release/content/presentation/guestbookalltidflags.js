/**
* guestbookalltidflags.js
* Foxtrick Show Alltid flags in guestbook posts module
* @author convinced
*/

////////////////////////////////////////////////// //////////////////////////////
//---------------------------------------------------------------------------    

var FoxtrickGuestbookAlltidFlags = {

	MODULE_NAME : "GuestbookAlltidFlags",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	DEFAULT_ENABLED : true,

	init : function() {
		Foxtrick.registerPageHandler( 'guestbook',
			FoxtrickGuestbookAlltidFlags );
	},

	run : function( page, doc ) {
	try{	
		var flagspage = "http://flags.alltidhattrick.org/userflags/";
		var linkpage = "http://stats.alltidhattrick.org/user/";
		var style ="margin-right:3px; padding-left:3px; " + 
					"background-repeat:repeat-x; background-position: 0% 50%;";
		
		var outerdiv = doc.getElementById('ctl00_CPMain_grdGB_ctl00__0');
		var count =0;
		while (outerdiv!=null) {
			//var teamid=FoxtrickHelper.findTeamId(outerdiv);
			var linksArray = outerdiv.getElementsByTagName('a');
				for (var j=0; j<linksArray.length; j++) {
					link = linksArray[j];
					if (link.href.search(/userId=/i) > -1) { 
						// Add the Alltid flags
						var mySpan = doc.createElement('span');
						var spanId = "foxtrick_alltidspan_"+count;
						mySpan.setAttribute( "id", spanId );
						var userId = link.href.replace(/.+userId=/i, "").match(/^\d+/);
						//dump(spanId+"\n"+userId+"\n");
						var thistitlecountry="";
						mySpan.innerHTML = ' <a href="' + linkpage + userId +
							'"target="_blank"><img title="'+thistitlecountry+'" " style="' + 
							'vertical-align: middle; ' + style + '" src="' + 
							flagspage + userId + '.gif" border="0"' +
							'height="12" /></a>';
						var target = link.nextSibling;
						if (j+1!=linksArray.length && linksArray[j+1].href.lastIndexOf('Supporter') > -1) {
							target=linksArray[j+1].nextSibling;
						}
						if ( !doc.getElementById( spanId ) ) {
							link.parentNode.insertBefore(mySpan, target);
						}
						break;
					  } 
					}				
				count++;
				outerdiv = doc.getElementById('ctl00_CPMain_grdGB_ctl00__'+count);					
			}
		} catch (e) {dump('FoxtrickGuestbookAlltidFlags->'+e+'\n');}
	},
	
	change : function( page, doc ) {
		var spanId = "foxtrick_alltidspan_0";  // id of first added flag
		if( !doc.getElementById ( spanId ) ) {
			this.run( page, doc );
		}
	},	
						
};