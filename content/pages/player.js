/* player.js
 * Utilities on player page
 * @author ryanli
 */

Foxtrick.Pages.Player = {
	getAge : function(doc) {
		try {
			// returns age in the following format:
			// age = { years: xx, days: yyy };
			var birthdayRe = /(\d+).*?(\d+).*?\d+.*?\d+.*?\d+.*?/;
			var birthdayCell;
			var allDivs = doc.getElementsByTagName("div");
			for (var i = 0; i < allDivs.length; i++) {
				if (allDivs[i].className == "byline") {
					birthdayCell = allDivs[i];
				}
			}
			var birthdayMatch = birthdayRe.exec(birthdayCell.innerHTML);

			var age = {
				years : parseInt(birthdayMatch[1]),
				days : parseInt(birthdayMatch[2])
			};
			return age;
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	getName : function(doc) {
		var mainWrapper = doc.getElementById("mainWrapper");
		var h2 = mainWrapper.getElementsByTagName("h2")[0];
		var links = h2.getElementsByTagName("a");
		for (var i = 0; i < links.length; ++i) {
			if (links[i].href.match(/PlayerID=\d+/)) {
				return links[i].textContent;
			}
		}
	},

	getId : function(doc) {
		var url = String(doc.location);
		return url.match(/PlayerID=(\d+)/)[1];
	}
};
