/**
 * ticker-alert.js
 * display a notification when a new ticker has arrived
 * @author taised, convincedd, ryanli
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickTickerAlert = {
	MODULE_NAME : "TickerAlert",
	MODULE_CATEGORY : Foxtrick.moduleCategories.ALERT,
	PAGES : ["all"],

	run : function(page, doc) {
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
					Foxtrick.util.notify.create(n.text, n.href);
				});
			});
		};
		if (ticker)
			ticker.addEventListener("DOMSubtreeModified", tickerArrival, true);
	}
};
