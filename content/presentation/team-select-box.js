"use strict";
/**
 * team-select-box.js
 * Foxtrick team select box
 * @author convinced, ryanli
 */

Foxtrick.modules["TeamSelectBox"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["players", "youthPlayers"],

	run : function(doc) {
		var listBox; // sidebarBox containing player list
		var sidebarBoxes = doc.getElementsByClassName("sidebarBox");

		// take the one with most links
		// which should be the one with the players

		// sidebarBoxes is not an array, we create an array from it
		var isPlayerLink = function(n) {
			return n.href.search(/playerId=(\d+)/i) != -1;
		};
		var linkBoxes = Foxtrick.filter(function(n) {
			return n.getElementsByTagName("a").length > 0
				&& isPlayerLink(n.getElementsByTagName("a")[0]);
		}, sidebarBoxes);
		if (linkBoxes.length == 0)
			return; // listBox may not be present on oldies page

		linkBoxes.sort(function(a, b) {
			var aLinks = Foxtrick.filter(isPlayerLink, a.getElementsByTagName("a"));
			var bLinks = Foxtrick.filter(isPlayerLink, b.getElementsByTagName("a"));
			return bLinks.length - aLinks.length;
		});
		listBox = linkBoxes[0];

		// add headerClick
		var header = listBox.getElementsByTagName("h2")[0];
		var pn = header.parentNode;
		var div=null;
		if (pn.className!='boxLeft') {
			var hh=pn.removeChild(header);
			div = Foxtrick.createFeaturedElement(doc, this, "div");
			div.appendChild(hh);
			pn.insertBefore(div,pn.firstChild);
		}
		else
			div=pn.parentNode;

		var toList = function() {
			var option = listBox.getElementsByTagName("option")[0];
			var pn = option.parentNode;
			pn.removeChild(option);
			option = listBox.getElementsByTagName("option")[0];
			while (option != null){
				var player = doc.createElement("a");
				player.href = option.value;
				player.textContent = option.textContent;
				pn.parentNode.appendChild(player);
				pn.removeChild(option);
				option = listBox.getElementsByTagName("option")[0];
			}
			var selectbox = listBox.getElementsByTagName("select")[0];
			pn.parentNode.removeChild(selectbox);
		};

		var toSelectBox = function() {
			var selectBox = doc.createElement("select");
			var selected = function() {
				doc.location.href = selectBox.value;
			};
			Foxtrick.listen(selectBox, "change", selected, false);

			var option = doc.createElement("option");
			option.textContent = Foxtrickl10n.getString("TeamSelectBox.selectplayer");
			selectBox.appendChild(option);

			var players = listBox.getElementsByTagName("a");
			for (var i = 0; i < players.length; ++i) {
				var player = players[i];
				var option = doc.createElement("option");
				option.value = player.href;
				option.textContent = player.textContent;
				selectBox.appendChild(option);
			}
			var boxBody = listBox.getElementsByClassName("boxBody")[0];
			if (boxBody) {  // normal skin
				boxBody.textContent = ""; // clear it first
				boxBody.appendChild(selectBox);
			}
			else {  // simple skin. has no inner boxBody
				var headerdiv = listBox.getElementsByTagName("div")[0];
				headerdiv = listBox.removeChild(headerdiv);
				listBox.textContent = ""; // clear it first
				listBox.appendChild(headerdiv);
				listBox.appendChild(selectBox);
			}
		};

		var showAsList = true; // is shown as list initially
		var toggle = function() {
			try {
				showAsList = !showAsList;
				if (showAsList) {
					toList();
					div.className = "boxHead ft-expander-expanded";
				}
				else {
					toSelectBox();
					div.className = "boxHead ft-expander-unexpanded";
				}
			}
			catch (e) {
				Foxtrick.log(e);
			}
		};
		Foxtrick.onClick(div, toggle);
		toggle();
	}
};
