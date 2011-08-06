/*
 * copy-button.js
 * Utilities for adding a button for copying
 * @author ryanli
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.util)
	Foxtrick.util = {};
Foxtrick.util.copyButton = {};

/*
 * Adds a button on the HTML document
 * @returns HTML node of the button
 */
Foxtrick.util.copyButton.add = function(doc, text) {
	if (FoxtrickPrefs.getBool("smallcopyicons")) {
		var mainWrapper = doc.getElementById("mainWrapper");
		var mainBody = doc.getElementById("mainBody");

		var boxHead = mainWrapper.getElementsByClassName("boxHead")[0];

		if (Foxtrick.util.layout.isStandard(doc))
			mainBody.style.paddingTop = "10px";

		// try to get order of the button in the header
		// orders: contains a list of positions which is a list of classes
		// that occupy that position
		var orders = [
			["ci_first", "backIcon", "statsIcon", "bookmark", "forumSettings", "forumSearch2"],
			["ci_second"],
			["ci_third"],
			["ci_fourth"],
			["ci_fifth"]
		];
		for (var i = 0; i < orders.length; ++i) {
			var occupied = Foxtrick.some(orders[i], function(n) {
				return doc.getElementsByClassName(n).length > 0;
			});
			if (!occupied) {
				var orderClass = orders[i][0];
				break;
			}
		}

		var messageLink = doc.createElement("a");
		messageLink.className = "inner copyicon " + orderClass;
		messageLink.title = text;

		var img = doc.createElement("img");
		img.alt = text;
		img.src = "/Img/Icons/transparent.gif";

		messageLink.appendChild(img);
		mainBody.insertBefore(messageLink, mainBody.firstChild);
	}
	else {
		var link = doc.createElement("a");
		link.className = "inner";
		link.title = text;
		link.style.cursor = "pointer";

		var img = doc.createElement("img");
		img.style.padding = "0px 5px 0px 0px;";
		img.className = "actionIcon";
		img.alt = text;
		img.src = Foxtrick.ResourcePath+"resources/img/copy/copyPlayerAd.png";
		link.appendChild(img);

		Foxtrick.addBoxToSidebar(doc,
			Foxtrickl10n.getString("foxtrick.tweaks.actions"), link, -1);
	}
	return messageLink;
};
