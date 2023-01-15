'use strict';
/**
 * ticker-alert.js
 * display a notification when a new ticker has arrived
 * @author taised, convincedd, ryanli
 */
(function() {
	var types = {
		'welcome': /\/MyHattrick\/Dashboard\.aspx$/i,
		'supporter': /\/Club\/Manager\/\?teamId=/i,
		'forum': /\/Forum/i,
		'transfer': /\/Players/i,
		'challenge': /\/Challenges/i,
		'guestbook': /\/Club\/Manager\/Guestbook\.aspx\?teamid=/i,
		'mail': /\/Inbox/i,
		'myht': /\/Myhattrick\/Dashboard\.aspx\?actionType=/i,
		'match': /\/Matches/i,
		'team': /\/Club\/(Default\.aspx)?\?/i,
		'pa': /\/Announcements/i,
		'sysinfo': /\/SystemStatus/i,
		'others': /.*/
	};
	Foxtrick.modules.TickerAlert = {
		MODULE_CATEGORY: Foxtrick.moduleCategories.ALERT,
		OUTSIDE_MAINBODY: true,
		PAGES: ['all'],
		NICE: 20, // after all other modules that make changes to #ticker

		OPTION_FUNC: function(doc) {
			var table = doc.createElement('table');
			table.className = 'bordered center maxed';

			// header
			var header = doc.createElement('tr');
			table.appendChild(header);
			var holder = doc.createElement('th');
			header.appendChild(holder);
			var enableh = doc.createElement('th');
			enableh.setAttribute('data-text', 'TickerAlert.enable');
			enableh.className = 'col_checkbox';
			header.appendChild(enableh);
			var soundh = doc.createElement('th');
			soundh.setAttribute('data-text', 'TickerAlert.sound');
			soundh.className = 'col_textfield';
			header.appendChild(soundh);
			// var fileh = doc.createElement('th');
			// fileh.className = 'col_filepicker';
			// header.appendChild(fileh);
			var playh = doc.createElement('th');
			playh.className = 'col_play';
			header.appendChild(playh);

			for (let type in types) {
				let row = doc.createElement('tr');
				table.appendChild(row);
				let rhead = doc.createElement('th');
				rhead.setAttribute('data-text', 'ticker.type.' + type);
				row.appendChild(rhead);
				let enablec = doc.createElement('td');
				row.appendChild(enablec);
				let enable = doc.createElement('input');
				enable.type = 'checkbox';
				enable.setAttribute('pref', 'module.TickerAlert.' + type + '.enabled');
				enablec.appendChild(enable);
				let soundc = doc.createElement('td');
				row.appendChild(soundc);
				Foxtrick.addClass(soundc, 'left');
				let sound = doc.createElement('input');
				sound.setAttribute('pref', 'module.TickerAlert.' + type + '.sound');
				sound.id = 'module.TickerAlert.' + type + '.id';
				soundc.appendChild(sound);

				// let filec = doc.createElement('td');
				// row.appendChild(filec);
				let input = Foxtrick.util.load.filePickerForDataUrl(doc, (url) => {
					sound.value = url;
					sound.dispatchEvent(new Event('input', { bubbles: true }));
					Foxtrick.playSound(url);
				});
				soundc.appendChild(input);

				let playc = doc.createElement('td');
				row.appendChild(playc);
				let playButton = doc.createElement('button');
				playButton.setAttribute('data-text', 'button.play');
				playButton.setAttribute('soundId', 'module.TickerAlert.' + type + '.id');
				Foxtrick.onClick(playButton, function() {
					// eslint-disable-next-line no-invalid-this
					let url = doc.getElementById(this.getAttribute('soundId')).value;
					Foxtrick.playSound(url);
				}, false);
				playc.appendChild(playButton);
			}

			return table;
		},

		run: function(doc) {
			var getType = function(url) {
				var type;
				for (type in types) {
					var regexp = types[type];

					if (url.match(regexp))
						return type;
				}
				return null;
			};
			// add watch to ticker
			var ticker = doc.getElementById('ticker');
			var getTickers = function() {
				var divs = ticker.getElementsByTagName('div');
				var tickers = Foxtrick.map(function(n) {
					var anchor = n.querySelector('a');
					if (!anchor)
						return null;

					var prefix = anchor.textContent.match(/^[\d\W]+/);
					var time = prefix.toString().trim();

					return {
						text: n.textContent,
						link: anchor.href,
						time: time,
						isNew: !!n.querySelector('strong'),
					};

				}, divs);
				return tickers.filter(Boolean);
			};
			var callbackStack = 0;
			var tickerCheck = function() {
				++callbackStack;
				if (callbackStack != 1)
					return;
				//Foxtrick.log('ticker check')
				Foxtrick.sessionGet('tickers', function(tickers) {
					if (!tickers)
						tickers = [];

					var tickersNow = getTickers();

					if (tickersNow.length < tickers.length) {
						// Hattrick.org clears all tickers before adding a new one,
						// so to not alert when the tickers are being cleared, we
						// return when ticker count now is less than old ticker
						// count
						callbackStack = 0;
						return;
					}
					//Foxtrick.log('tickers',tickers)
					//Foxtrick.log('tickersNow',tickersNow)

					Foxtrick.sessionSet('tickers', tickersNow);

					var newTickers = Foxtrick.filter(function(n) {
						if (!n.isNew)
							return false;
						for (let old of tickers) {
							if (!old) {
								Foxtrick.log(new Error(`old is ${old}`));
								continue;
							}

							if (old.text == n.text && old.link.replace(/http:\/\/.+\//, '/') == n.link.replace(/http:\/\/.+\//, '/'))
								return false;
						}
						return 'link' in n && 'text' in n;
					}, tickersNow);

					// Foxtrick.log('tickersNow filtered',newTickers)

					var open = Foxtrick.L10n.getString('notify.open');
					Foxtrick.map(function(n) {
						var type = getType(n.link);

						if (Foxtrick.Prefs.getBool('module.TickerAlert.' + type + '.enabled')) {
							Foxtrick.util.notify.create(n.text, n.link, {
								id: 'ticker-' + type + '-' + n.time,
								buttons: [{ title: open }],
							});
							var sound = Foxtrick.Prefs.getString('module.TickerAlert.' + type + '.sound');
							if (sound) {
								Foxtrick.playSound(sound);
							}
						}
					}, newTickers);

					callbackStack = 0;
				});
			};
			if (Foxtrick.util.layout.isSupporter(doc)) {
				tickerCheck();
				Foxtrick.onChange(ticker, tickerCheck);
			}
		}
	};
})();
