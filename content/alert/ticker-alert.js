"use strict";
/**
 * ticker-alert.js
 * display a notification when a new ticker has arrived
 * @author taised, convincedd, ryanli
 */

 Foxtrick.modules["TickerAlert"].run = function(doc) {
	// type of change to listen to. opera doesn't support DOMSubtreeModified

	var getType = function(url) {
		for (var type in  Foxtrick.modules["TickerAlert"].types) {
			var regexp =  Foxtrick.modules["TickerAlert"].types[type];

			if (url.match(regexp))
				return type;
		}
		return null;
	};
	// add watch to ticker
	var ticker = doc.getElementById("ticker");
	var getTickers = function() {
		var divs = ticker.getElementsByTagName("div");
		var tickers = Foxtrick.map(function(n) {
			return {
				text : n.textContent,
				link : n.getElementsByTagName("a")[0].href,
				isNew : (n.getElementsByTagName("strong").length > 0)
			};
		}, divs);
		return tickers;
	};
	var tickerCheck = function() {
		Foxtrick.log('tickerCheck')
		var tickers = Foxtrick.sessionGet("tickers");
		if (tickers == undefined)
			tickers = [];

		var tickersNow = getTickers();

		if (tickersNow.length < tickers.length) {
			// Hattrick.org clears all tickers before adding a new one,
			// so to not alert when the tickers are being cleared, we
			// return when ticker count now is less than old ticker
			// count
			return;
		}

		Foxtrick.sessionSet("tickers", tickersNow);

		var newTickers = Foxtrick.filter(function(n) {
			if (!n.isNew)
				return false;
			for (var i = 0; i < tickers.length; ++i) {
				var old = tickers[i]; 
				if (old.text == n.text && old.link.replace(/http:\/\/.+\//,'/') == n.link.replace(/http:\/\/.+\//,'/'))
					return false;
			}
			return true;
		}, tickersNow);

		
		Foxtrick.map(function(n) {
			var type = getType(n.link);

			if (FoxtrickPrefs.getBool("module.TickerAlert." + type + ".enabled")) {
				Foxtrick.util.notify.create(n.text, n.link);
				var sound = FoxtrickPrefs.getString("module.TickerAlert." + type + ".sound");
				if (sound) {
					// use foxtrick:// for Foxtrick.ResourcePath
					// for cross-platform compatibility
					sound = sound.replace(/^foxtrick:\/\//, Foxtrick.ResourcePath);
					Foxtrick.playSound(sound, doc);
				}
			}
		}, newTickers);
		ticker.addEventListener('DOMNodeInserted', tickerCheck, false);
	};
	if (Foxtrick.util.layout.isSupporter(doc))
		tickerCheck();
};
