/**
 * ticker-alert.js
 * display a notification when a new ticker has arrived
 * @author taised, convincedd, ryanli
 */
Foxtrick.util.module.register((function() {
	var types = {
		"welcome" : /\/MyHattrick\/Dashboard\.aspx$/i,
		"supporter" : /\/Club\/Manager\/\?teamId=/i,
		"forum" : /\/Forum/i,
		"transfer" : /\/Players/i,
		"challenge" : /\/Challenges/i,
		"guestbook" : /\/Club\/Manager\/Guestbook\.aspx\?teamid=/i,
		"mail" : /\/Inbox/i,
		"myht" : /\/Myhattrick\/Dashboard\.aspx\?actionType=/i,
		"others" : /.*/
	};
	return {
		MODULE_NAME : "TickerAlert",
		MODULE_CATEGORY : Foxtrick.moduleCategories.ALERT,
		PAGES : ["all"],
		NICE : 20, // after all other modules that make changes to #ticker

		OPTION_FUNC : function(doc) {
			var table = doc.createElement("table");
			table.className = "bordered center maxed";

			// header
			var header = doc.createElement("tr");
			table.appendChild(header);
			var holder = doc.createElement("th");
			header.appendChild(holder);
			var enableh = doc.createElement("th");
			enableh.setAttribute("data-text", "TickerAlert.enable");
			enableh.className='col_checkbox';
			header.appendChild(enableh);
			var soundh = doc.createElement("th");
			soundh.setAttribute("data-text", "TickerAlert.sound");
			soundh.className='col_textfield';
			header.appendChild(soundh);
			var fileh = doc.createElement("th");
			fileh.className='col_filepicker';
			header.appendChild(fileh);

			for (var type in types) {
				var row = doc.createElement("tr");
				table.appendChild(row);
				var rhead = doc.createElement("th");
				rhead.setAttribute("data-text", "ticker.type." + type);
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
				var filec = doc.createElement("td");
				row.appendChild(filec);
				var input = Foxtrick.filePickerForDataUrl(doc, (function(sound) {
						return function(url) { sound.value = url; };
					})(sound));
				filec.appendChild(input);
			}

			return table;
		},

		run : function(doc) {
			// type of change to listen to. opera doesn't support DOMSubtreeModified
			var DOMMutationEventType = (Foxtrick.platform == "Opera") ? "DOMNodeInserted" : "DOMSubtreeModified";

			var getType = function(url) {
				for (var type in types) {
					var regexp = types[type];
					if (url.match(regexp))
						return type;
				}
				return null;
			};
			// add watch to ticker
			var ticker = doc.getElementById("ticker");
			var getTickers = function() {
				const divs = ticker.getElementsByTagName("div");
				const tickers = Foxtrick.map(function(n) {
					return {
						text : n.textContent,
						link : n.getElementsByTagName("a")[0].href,
						isNew : (n.getElementsByTagName("strong").length > 0)
					};
				}, divs);
				return tickers;
			};
			var tickerCheck = function() {
				// prevent from multiple tickerCheck() instances running at the
				// same time
				ticker.removeEventListener(DOMMutationEventType, tickerCheck, false);
				var tickers = Foxtrick.sessionGet("tickers");
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

				const newTickers = Foxtrick.filter(function(n) {
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
				ticker.addEventListener(DOMMutationEventType, tickerCheck, false);
			};
			if (Foxtrick.util.layout.isSupporter(doc))
				tickerCheck();
		}
	};
})());
