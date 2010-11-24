/**
 * largeflags.js
 * Script which replaces the tiny country flag on player pages with a large one
 * @author larsw84
 */

var FoxtrickLargeFlags = {
    MODULE_NAME : "LargeFlags",
    MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('playerdetail'),
	NEW_AFTER_VERSION : "0.5.2.1",
	LATEST_CHANGE : "Disabled by default since it may crash the whole operating system under GNU/Linux. Fixed the flag of Chinese Taipei.",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

    run : function(page, doc) {
		var faceCard = doc.getElementById("ctl00_CPMain_ucPlayerFace_pnlAvatar");
		if (!faceCard) {
			// if player faces aren't shown, remain with tiny flags
			// since large flags breaks page layout
			return;
		}
		var flag = doc.getElementsByClassName("flag")[0];
		var img = flag.getElementsByTagName("img")[0];
		var oldStyle = img.style.background;
		var newStyle = "transparent url('" + Foxtrick.ResourcePath + "resources/img/largeflags.png') no-repeat scroll";
		var pos = oldStyle.match(/(\d+)px/)[1];
		var newPos = -parseInt(pos) / 20 * 105;
		newStyle = newStyle + " " + newPos + "px 0pt";
		img.style.background = newStyle;
		img.style.width = "105px";
		img.style.height = "70px";
		// Move the link to the faceCard div
		var parentNode = faceCard.parentNode;
		var nextSibling = faceCard.nextSibling;
		var ownDiv = doc.createElement("div");
		ownDiv.style.width = "110px";
		ownDiv.style.margin = "5px 5px 0px 0px";
		ownDiv.appendChild(flag);
		var wrapperDiv = doc.createElement("div");
		wrapperDiv.appendChild(ownDiv);
		wrapperDiv.appendChild(faceCard);
		wrapperDiv.style.cssFloat = "left";
		parentNode.insertBefore(wrapperDiv, nextSibling);
	}
};
