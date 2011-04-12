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
		var getTickers = function() {
			const divs = ticker.getElementsByTagName("div");
			const tickers = Foxtrick.map(divs, function(n) {
				return {
					text : n.textContent,
					link : n.getElementsByTagName("a")[0].href
				};
			});
			return tickers;
		};
		var tickerCheck = function(ev) {
			// prevent from multiple tickerCheck() instances running at the
			// same time
			ticker.removeEventListener("DOMSubtreeModified", tickerCheck, false);
			Foxtrick.sessionGet("tickers", function(tickers) {
				if (tickers == undefined)
					tickers = [];

				const tickersNow = getTickers();
				if (tickersNow.length < tickers.length) {
					// Hattrick.org clears all tickers before adding a new one,
					// so to not alert when the tickers are being cleared, we
					// return when ticker count now is less than old ticker
					// count
					return;
				}

				Foxtrick.sessionSet("tickers", tickersNow);

				const newTickers = Foxtrick.filter(tickersNow, function(n) {
					for (var i = 0; i < tickers.length; ++i) {
						var old = tickers[i];
						if (old.text == n.text && old.link == n.link)
							return false;
					}
					return true;
				});

				Foxtrick.dump("Tickers: " + JSON.stringify(tickers) + "\n");
				Foxtrick.dump("New tickers: " + JSON.stringify(newTickers) + "\n");

				Foxtrick.map(newTickers, function(n) {
					var type = getType(n.link);
					if (FoxtrickPrefs.getBool("module.TickerAlert." + type + ".enabled")) {
						Foxtrick.util.notify.create(n.text, n.link);
						var sound = FoxtrickPrefs.getString("module.TickerAlert." + type + ".sound");
						if (sound) {
							if (sound.indexOf("foxtrick://") == 0) {
								// use foxtrick:// for Foxtrick.ResourcePath
								// for cross-platform compatibility
								sound = sound.replace(
									new RegExp("^foxtrick://"),
									Foxtrick.ResourcePath
								);
							}
							Foxtrick.playSound(sound);
						}
					}
				});
				ticker.addEventListener("DOMSubtreeModified", tickerCheck, false);
			});
		};
		if (Foxtrick.isSupporter(doc))
			tickerCheck();
	}
};
