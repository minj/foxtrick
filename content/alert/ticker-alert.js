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
			var divs = ticker.getElementsByTagName("div");
			var tickers = Foxtrick.map(divs, function(n) {
				return {
					text : n.textContent,
					link : n.getElementsByTagName("a")[0].href
				};
			});
			return tickers;
		};
		var tickers = getTickers();
		// call callback when check finished
		var tickerCheck = function() {
			var tickersNow = getTickers();

			if (tickersNow.length < tickers.length) {
				// Hattrick.org clears all tickers before adding a new one,
				// so to not alert when the tickers are being cleared, we
				// return when ticker count now is less than old ticker
				// count
				return;
			}

			var newTickers = Foxtrick.filter(tickersNow, function(n) {
				for (var i = 0; i < tickers.length; ++i) {
					var old = tickers[i];
					if (old.text == n.text && old.link == n.link)
						return false;
				}
				return true;
			});
			tickers = tickersNow;

			Foxtrick.dump("Tickers: " + Foxtrick.map(tickers, JSON.stringify).join(";") + "\n");
			Foxtrick.dump("New tickers: " + Foxtrick.map(newTickers, JSON.stringify).join(";") + "\n");

			Foxtrick.map(newTickers, function(n) {
				var type = getType(n.link);
				if (FoxtrickPrefs.getBool("module.TickerAlert." + type + ".enabled")) {
					Foxtrick.util.notify.create(n.text, n.link);
					var sound = FoxtrickPrefs.getString("module.TickerAlert." + type + ".sound");
					if (sound)
						Foxtrick.playSound(sound);
				}
			});
		};
		if (Foxtrick.isSupporter(doc))
			ticker.addEventListener("DOMSubtreeModified", tickerCheck, false);
	}
};
