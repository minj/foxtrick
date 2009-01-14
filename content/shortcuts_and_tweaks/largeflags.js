/**
 * largeflags.js
 * Script which replaces the tiny country flag on player pages with a large one
 * @author larsw84
 */

var FoxtrickLargeFlags = {
	
    MODULE_NAME : "LargeFlags",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : true,
	
    init : function() {
        Foxtrick.registerPageHandler( 'players',
                                      FoxtrickLargeFlags);
    },

    run : function( page, doc ) {
		var allDivs = doc.getElementsByTagName( "div" );
		for( var i = 0; i < allDivs.length; i++ ) {
			if( allDivs[i].className == "byline" ) {
				var link = allDivs[i].getElementsByTagName("a")[0];
				if(link) {
					var img = link.childNodes[0];
					var oldStyle = img.style.background;
					var newStyle = "transparent url(chrome://foxtrick/content/"
						+ "resources/img/largeflags.png) no-repeat scroll ";
					var firstPos = oldStyle.search("scroll ")+7;
					var lastPos = oldStyle.search("px");
					var pos = oldStyle.substr(firstPos, (lastPos-firstPos));
					newPos = parseInt(pos) / 20 * 105;
					newStyle = newStyle + newPos + "px 0pt";
					img.style.background = newStyle;
					img.style.width = "105px";
					img.style.height = "70px";
					// Move the link; either to the faceCard div or if that doesn't exist, to the bottom of the current div
					var faceCardDiv = doc.getElementById('ctl00_CPMain_ucPlayerFace_pnlAvatar');
					if( faceCardDiv ) {
						var parentNode = faceCardDiv.parentNode;
						var nextSibling = faceCardDiv.nextSibling;
						var ownDiv = doc.createElement("div");
						ownDiv.setAttribute("style","float:left;");
						ownDiv.style.width = "110px";
						ownDiv.style.height = "250px";
						ownDiv.style.padding = "10px 0px 0px 0px";
						ownDiv.appendChild( link );
						ownDiv.appendChild( faceCardDiv );
						parentNode.insertBefore( ownDiv, nextSibling );
					} else {
						var br1 = doc.createElement("br");
						var br2 = doc.createElement("br");
						allDivs[i].appendChild(br1);
						allDivs[i].appendChild(br2);
						allDivs[i].appendChild(link);
						allDivs[i].setAttribute("style", "margin-left: 4px; "
										+ "padding-bottom:0px");
					}
				}
			}
		}
	},
	
	change : function( page, doc ) {
	
	}
};