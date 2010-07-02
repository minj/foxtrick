/**
 * largeflags.js
 * Script which replaces the tiny country flag on player pages with a large one
 * @author larsw84
 */

var FoxtrickLargeFlags = {
	
    MODULE_NAME : "LargeFlags",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('playerdetail'),
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION : "0.5.2.1",
	LATEST_CHANGE : "Disabled by default since it may crash the whole operating system under GNU/Linux.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	
    init : function() {
    },

    run : function( page, doc ) {
	try{
		var faceCardCount = doc.getElementsByClassName("faceCard").length;
		if (faceCardCount === 0) {
			// if player faces aren't shown, remain with tiny flags
			// since large flags breaks page layout
			return;
		}
		var allDivs = doc.getElementsByTagName( "div" );
		for( var i = 0; i < allDivs.length; i++ ) {
			if( allDivs[i].className == "byline" ) {
				var link = allDivs[i].getElementsByTagName("a")[0];
				if(link) { 
					var img = link.childNodes[0];
					var oldStyle = img.style.background;
					var newStyle = "transparent url("+Foxtrick.ResourcePath
						+ "resources/img/largeflags.png) no-repeat scroll ";
					var pos = oldStyle.match(/(\d+)px/)[1];  
					var newPos = -parseInt(pos) / 20 * 105;   
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
						ownDiv.style.width = "110px";
						ownDiv.style.margin = "5px 5px 0px 0px";
						ownDiv.appendChild( link );
						var wrapperDiv = doc.createElement("div");
						wrapperDiv.appendChild( ownDiv );
						wrapperDiv.setAttribute("style","float:left;");
						wrapperDiv.appendChild( faceCardDiv );
						parentNode.insertBefore( wrapperDiv, nextSibling );
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
	}catch(e){Foxtrick.dump('FoxtrickLargeFlags: '+e+'\n');}
	},
	
};
