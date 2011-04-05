/**
 * ticker-alert.js
 * display a notification when a new ticker has arrived
 * @author taised, convincedd, ryanli
 */

var FoxtrickTickerAlert = {
	MODULE_NAME : "TickerAlert",
	MODULE_CATEGORY : Foxtrick.moduleCategories.ALERT,
	PAGES : ["all"],

	OPTION_FUNC : function(doc) {
		var table = doc.createElement("table");
		table.className = "bordered";

		// header
		var header = doc.createElement("tr");
		table.appendChild(header);
		var holder = doc.createElement("th");
		header.appendChild(holder);
		var enableh = doc.createElement("th");
		enableh.setAttribute("text-key", "TickerAlert.enable");
		header.appendChild(enableh);
		var soundh = doc.createElement("th");
		soundh.setAttribute("text-key", "TickerAlert.sound");
		header.appendChild(soundh);

		for (var type in FoxtrickTickerAlert.TYPES) {
			var row = doc.createElement("tr");
			table.appendChild(row);
			var rhead = doc.createElement("th");
			rhead.setAttribute("text-key", "ticker.type." + type);
			row.appendChild(rhead);
			var enablec = doc.createElement("td");
			row.appendChild(enablec);
			var enable = doc.createElement("input");
			enable.type = "checkbox";
			enable.setAttribute("pref", "module.TickerAlert." + type + ".enabled");
			enablec.appendChild(enable);
			var soundc = doc.createElement("td");
			row.appendChild(soundc);
			var sound = doc.createElement("input");
			sound.setAttribute("pref", "module.TickerAlert." + type + ".sound");
			soundc.appendChild(sound);
		}

		return table;
	},

	TYPES : {
		"welcome" : /\/MyHattrick/i,
		"supporter" : /\/Club\/Manager\/\?teamId=/i,
		"forum" : /\/Forum/i,
		"transfer" : /\/Players/i,
		"challenge" : /\/Challenges/i,
		"guestbook" : /\/Club\/Manager\/Guestbook\.aspx\?teamid=/i,
		"mail" : /\/Inbox/i,
		"myht" : /\/Myhattrick\/\?actionType/i
	},

	run : function(page, doc) {
		var getType = function(url) {
			for (var type in FoxtrickTickerAlert.TYPES) {
				var regexp = FoxtrickTickerAlert.TYPES[type];
				if (url.match(regexp))
					return type;
			}
			return null;
		};
		// add watch to ticker
		var ticker = doc.getElementById("ticker");
		var tickerArrival = function() {
			Foxtrick.sessionGet("tickers", function(oldTickers) {
				if (oldTickers == undefined)
					oldTickers = [];
				var divs = ticker.getElementsByTagName("div");
				var tickers = Foxtrick.map(divs, function(n) {
					return {
						text : n.textContent,
						link : n.getElementsByTagName("a")[0].href
					};
				});
				Foxtrick.sessionSet("tickers", tickers);
				var newTickers = Foxtrick.filter(tickers, function(n) {
					for (var i = 0; i < oldTickers.length; ++i) {
						var old = oldTickers[i];
						if (old.text == n.text && old.link == n.link)
							return false;
					}
					return true;
				});
				Foxtrick.map(newTickers, function(n) {
					var type = getType(n.href);
					if (FoxtrickPrefs.getBool("module.TickerAlert." + type + ".enabled")) {
						Foxtrick.util.notify.create(n.text, n.href);
						var sound = FoxtrickPrefs.getString("module.TickerAlert." + type + ".sound");
						if (sound)
							Foxtrick.playSound(sound);
					}
				});
			});
		};
		if (ticker)
			ticker.addEventListener("DOMSubtreeModified", tickerArrival, true);
	}
};
