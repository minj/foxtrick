/**
 * team-select-box.js
 * Foxtrick team select box
 * @author convinced, ryanli
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickTeamSelectBox = {
	MODULE_NAME : "TeamSelectBox",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["players", "YouthPlayers"],

	run : function(page, doc) {
		var listBox; // sidebarBox containing player list
		var sidebarBoxes = doc.getElementsByClassName("sidebarBox");

		// first check by header content --- "Overview"
		for (var i = 0; i < sidebarBoxes.length; ++i) {
			var box = sidebarBoxes[i];
			var header = box.getElementsByTagName("h2")[0];
			if (header.textContent == Foxtrickl10n.getString("foxtrick.tweaks.overview")) {
				listBox = box;
				break;
			}
		}
		// fallback
		// player box not found by string, take the one with most links
		// which should be the one with the players

		// sidebarBoxes is not an array, we create an array from it
		if (!listBox) {
			var boxesArray = Foxtrick.map(sidebarBoxes, function(n) { return n; });
			var isPlayerLink = function(n) {
				return n.href.search(/playerId=(\d+)/i) != -1;
			};
			boxesArray.sort(function(a, b) {
				var aLinks = Foxtrick.filter(a.getElementsByTagName("a"), isPlayerLink);
				var bLinks = Foxtrick.filter(b.getElementsByTagName("a"), isPlayerLink);
				return bLinks - aLinks;
			});
			// only if player link count > 0
			if (Foxtrick.filter(boxesArray[0].getElementsByTagName("a"), isPlayerLink).length > 0)
				listBox = boxesArray[0];
		}

		if (!listBox)
			return; // listBox may not be present on oldies page

		// add headerClick
		var header = listBox.getElementsByTagName("h2")[0];
		var pn = header.parentNode;
		var div=null;
		if (pn.className!='boxLeft') {
			var hh=pn.removeChild(header);
			div = doc.createElement("div");
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
			Foxtrick.addEventListenerChangeSave(selectBox, "change", selected, false);

			var option = doc.createElement("option");
			option.textContent = Foxtrickl10n.getString("foxtrick.tweaks.selectplayer");
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
			boxBody.textContent = ""; // clear it first
			boxBody.appendChild(selectBox);
		};

		var showAsList = true; // is shown as list initially
		var toggle = function() {
			try {
				showAsList = !showAsList;
				if (showAsList) {
					toList();
					div.className = "boxHead ft_sidebarBoxUnfolded";
					if (Foxtrick.isRTLLayout(doc))
						div.className = "boxHead ft_sidebarBoxUnfolded_rtl";
				}
				else {
					toSelectBox();
					div.className = "boxHead ft_sidebarBoxCollapsed";
					if (Foxtrick.isRTLLayout(doc))
						div.className = "boxHead ft_sidebarBoxCollapsed_rtl";
				}
			}
			catch (e) {
				Foxtrick.dumpError(e);
			}
		};
		Foxtrick.addEventListenerChangeSave(div, "click", toggle, false);
		toggle();
	}
};
