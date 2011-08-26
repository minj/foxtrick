/**
 * ticker-alert.js
 * display a notification when a new ticker has arrived
 * @author taised, convincedd, ryanli
 */

var FoxtrickTickerAlert = {
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
		var fileh = doc.createElement("th");
		fileh.className='col_filepicker';
		header.appendChild(fileh);
		var soundh = doc.createElement("th");
		soundh.setAttribute("data-text", "TickerAlert.sound");
		soundh.className='col_textfield';
		header.appendChild(soundh);

		for (var type in FoxtrickTickerAlert.TYPES) {
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
			var filec = doc.createElement("td");
			row.appendChild(filec);
			var form = Foxtrick.filePickerForDataUrl(doc, function(url, data){
				doc.getElementById(data.id).value = url;
			}, {id: "module.TickerAlert." + type + ".sound"});
			filec.appendChild(form);
			var soundc = doc.createElement("td");
			row.appendChild(soundc);
			var sound = doc.createElement("input");
			sound.setAttribute("pref", "module.TickerAlert." + type + ".sound");
			sound.setAttribute("id", "module.TickerAlert." + type + ".sound");
			soundc.appendChild(sound);

		}

		return table;
	},

	TYPES : {
		"welcome" : /\/MyHattrick\/Dashboard\.aspx$/i,
		"supporter" : /\/Club\/Manager\/\?teamId=/i,
		"forum" : /\/Forum/i,
		"transfer" : /\/Players/i,
		"challenge" : /\/Challenges/i,
		"guestbook" : /\/Club\/Manager\/Guestbook\.aspx\?teamid=/i,
		"mail" : /\/Inbox/i,
		"myht" : /\/Myhattrick\/Dashboard\.aspx\?actionType=/i,
		"others" : /.*/
	},

	run : function(doc) {
		// type of change to listen to. opera doesn't support DOMSubtreeModified
		if (Foxtrick.platform == "Opera") var DOMMutationEventType = 'DOMNodeInserted';
		else var DOMMutationEventType = 'DOMSubtreeModified';

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
			const tickers = Foxtrick.map(function(n) {
				return {
					text : n.textContent,
					link : n.getElementsByTagName("a")[0].href,
					isNew : (n.getElementsByTagName("strong").length > 0)
				};
			}, divs);
			return tickers;
		};
		var tickerCheck = function(ev) {
			if (ev.target) var doc = ev.target.ownerDocument;
			else var doc = ev; // called directly

			// prevent from multiple tickerCheck() instances running at the
			// same time
			ticker.removeEventListener(DOMMutationEventType, tickerCheck, false);
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

				const newTickers = Foxtrick.filter(function(n) {
					if (!n.isNew)
						return false;
					for (var i = 0; i < tickers.length; ++i) {
						var old = tickers[i];
						if (old.text == n.text && old.link == n.link)
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
			});
		};
		if (Foxtrick.util.layout.isSupporter(doc))
			tickerCheck(doc);
	}
};
Foxtrick.util.module.register(FoxtrickTickerAlert);
