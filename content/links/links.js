'use strict';
/**
 * links.js
 * External links collection
 * @author others, convinced, ryanli, LA-MJ
 */

(function() {
	// callback is called after links-collection is stored in session store
	var collection = null;
	var callbackStack = [];
	var storeCollection = function(callback) {
		callbackStack.push(callback);
		if (callbackStack.length != 1)
			return;

		if (collection && typeof callback === 'undefined') {
			// callback is defined => sessionstore is null
			// probably cache was cleared
			// hence we shuld not return here
			callbackStack = [];
			return;
		}
		collection = {};
		// load links from external feeds
		var feeds = Foxtrick.Prefs.getString('module.Links.feedsList') || '';
		feeds = feeds.split(/(\n|\r|\\n|\\r)+/);
		feeds = Foxtrick.filter(function(n) { return n.trim() !== ''; }, feeds);
		// add default feed if no feeds set or using dev/android
		if (feeds.length === 0 ||
		    Foxtrick.platform === 'Android' || Foxtrick.branch === 'dev')
			feeds = [Foxtrick.DataPath + 'links.json'];

		var parseFeed = function(text) {
			var links;
			try {
				// Foxtrick.log('parseFeed: ', text.slice(0, 200));
				links = JSON.parse(text);
			}
			catch (e) {
				Foxtrick.log('Failure parsing links file: ', text.slice(0, 200), e);
				return;
			}
			for (var key in links) {
				var link = links[key];
				if (link.img) {
					if (link.img.indexOf('resources') === 0) {
						// add path to internal images
						link.img = Foxtrick.InternalPath + link.img;
					}
					link.img = Foxtrick.util.sanitize.parseUrl(link.img);
				}
				for (var prop in link) {
					if (/link/.test(prop)) {
						link[prop].url = Foxtrick.util.sanitize.parseUrl(link[prop].url);
						if (typeof collection[prop] === 'undefined') {
							collection[prop] = {};
						}
						collection[prop][key] = link;
					}
				}
			}
			Foxtrick.sessionSet('links-collection', collection);
			if (todo === 0) {
				Foxtrick.log('Link feeds loaded');
				for (var i = 0; i < callbackStack.length; ++i) {
					if (typeof callbackStack[i] === 'function') {
						try {
							callbackStack[i](collection);
						}
						catch (e) {
							Foxtrick.log('Error in callback for getCollection', e);
						}
					}
				}
				callbackStack = [];
			}
		};

		// now load the feeds
		var todo = feeds.length;

		Foxtrick.log('Loading', todo, 'link feeds from:', feeds);

		Foxtrick.map(function(feed) {
			Foxtrick.log('loading feed:', feed);

			// load plain text
			Foxtrick.fetch(feed)
				.then(function(text) {

					--todo;

					if (!text) {
						Foxtrick.log('Error loading links from:', feed,
						             '. Received empty response. Using cached feed.');

						Foxtrick.localGet('LinksFeed.' + feed, parseFeed);
					}
					else {
						parseFeed(text);
						Foxtrick.localSet('LinksFeed.' + feed, text);
					}

				}, function(resp) {

					--todo;

					Foxtrick.log('Error', resp.status, 'loading links from:', resp.url,
					             '. Using cached feed.');

					Foxtrick.localGet('LinksFeed.' + feed, parseFeed);

				}).catch(Foxtrick.catch('StoreLinksCollection'));

		}, feeds);
	};


	Foxtrick.modules['Links'] = {
		MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
		CORE_MODULE: true,
		PAGES: ['all'],
		OPTIONS: ['ReuseTab'],

		OPTION_FUNC: function(doc) {
			// different background context for chrome. needs the links collection
			Foxtrick.sessionGet('links-collection',
			  function(col) {
				if (col)
					collection = col;
				else
					storeCollection();
			});

			var cont = doc.createElement('div');

			var label = doc.createElement('p');
			// README: not using Links.feedsList to preserve translations
			label.setAttribute('data-text', 'Links.feeds');
			cont.appendChild(label);

			var textarea = doc.createElement('textarea');
			textarea.setAttribute('pref', 'module.Links.feedsList');
			cont.appendChild(textarea);

			var button = doc.createElement('button');
			Foxtrick.onClick(button, function(ev) {
				ev.preventDefault();
				var doc = ev.target.ownerDocument;
				var links = doc.querySelectorAll('input[option][module^="Links"]:not([id])');
				var state = links[0].checked;
				for (var i = 0; i < links.length; i++) {
					if (links[i].checked === state)
						links[i].click();
				}
			});
			button.setAttribute('data-text', 'Links.toggle');
			cont.appendChild(button);

			return cont;
		},

		getCollection: function(callback) {
			Foxtrick.sessionGet('links-collection',
			  function(col) {
				if (col) {
					collection = col;
					callback(collection);
				}
				else {
					storeCollection(callback);
				}
			});
		},

		init: function() {
			storeCollection();
		},

		getLinks: function(doc, options) {
			var reuseTab = Foxtrick.Prefs.isModuleOptionEnabled('Links', 'ReuseTab');
			var opts = { type: '', info: {}, module: '', className: '' };
			Foxtrick.mergeValid(opts, options);
			var args = opts.info, type = opts.type, module = opts.module;
			var isTracker = /^tracker/.test(type);

			var makeAnchorElement = function(link, url, key) {
				var linkNode = doc.createElement('a');
				if (isTracker) {
					var id = args.nationality || args.leagueid;
					linkNode = Foxtrick.util.id.createFlagFromLeagueId(doc, id, url, link.title);
				}
				else {
					linkNode.title = link.title;
					linkNode.href = url;
					linkNode.className = opts.className;
					if (typeof link.img === 'undefined') {
						linkNode.textContent = link.shorttitle;
					}
					else {
						var img = {
							alt: link.shorttitle || link.title,
							title: link.title,
							src: link.img,
							class: 'ft-link-icon',
						};

						Foxtrick.addImage(doc, linkNode, img);
					}
				}

				if (typeof link.openinthesamewindow === 'undefined') {
					linkNode.target = reuseTab ? '_ftlinks' : '_blank';
				}

				linkNode.setAttribute('key', key);
				linkNode.setAttribute('module', module);
				return linkNode;
			};

			// links collection are not available, get them and return
			if (!collection) {
				storeCollection();
				return [];
			}

			var addUp = function(sum, prop) {
				var num = parseInt(args[prop], 10) || 0;
				return sum + num;
			};
			var testFilter = function(filter) {
				// ranges to determine whether to show
				var ranges = link[filter + 'ranges'];

				return Foxtrick.any(function(range) {
					return (args[filter] >= range[0]) &&
						(args[filter] <= range[1]);
				}, ranges);
			};
			var COMPARE = {
				EXISTS: function(test) {
					return typeof args[test[1]] !== 'undefined';
				},
				GREATER: function(test) {
					var first = args[test[1]];
					var second = args[test[2]];
					if (typeof first === 'undefined' || typeof second === 'undefined')
						return false;

					return first > second;
				},
				SMALLER: function(test) {
					var first = args[test[1]];
					var second = args[test[2]];
					if (typeof first === 'undefined' || typeof second === 'undefined')
						return false;

					return first < second;
				},
				EQUAL: function(test) {
					var first = args[test[1]];
					var second = args[test[2]];
					if (typeof first === 'undefined' || typeof second === 'undefined')
						return false;

					return first == second;
				},
				OR: function(test) {
					var result = false;
					for (var i = 1; i < test.length; ++i) {
						result = result || COMPARE[test[i][0]](test[i]);
					}
					return result;
				},
				AND: function(test) {
					var result = true;
					for (var i = 1; i < test.length; ++i) {
						result = result && COMPARE[test[i][0]](test[i]);
					}
					return result;
				}
			};

			// links to return
			var links = [];

			for (var key in collection[type]) {
				var link = collection[type][key];
				var urlTmpl = link[type].url;
				var filters = link[type].filters;

				if (typeof link.SUM !== 'undefined') {
					// makes calculation of requested parameteres and place values
					// with the others in params
					if (link.SUM) {
						for (var sum in link.SUM) {
							args[sum] = link.SUM[sum].reduce(addUp, 0);
						}
					}
				}

				var allowed = true;
				if (!Foxtrick.Prefs.isModuleOptionEnabled(module, key) &&
					Foxtrick.Prefs.isModuleOptionSet(module, key)) {
					// enable all by default unless set otherwise by user
					allowed = false;
				}
				else if (filters && filters.length > 0) {
					allowed = Foxtrick.all(testFilter, filters);
				}
				// check allowed based on value comparison
				else if (typeof link.allow !== 'undefined') {
					var test = link.allow;
					allowed = COMPARE[test[0]](test);
				}

				if (allowed) {
					var url = Foxtrick.util.links.makeUrl(urlTmpl, args);
					if (url) {
						links.push({
							anchor: makeAnchorElement(link, url, key),
							obj: link
						});
					}
				}
			}
			links.sort(function(a, b) {
				var noA = typeof a.obj.img === 'undefined';
				var noB = typeof b.obj.img === 'undefined';
				if (noA && noB)
					return 0;
				else if (noA)
					return 1;
				else if (noB)
					return -1;
				else
					return a.obj.title.localeCompare(b.obj.title);
			});
			var anchors = Foxtrick.map(function(link) {
				return link.anchor;
			}, links);
			return anchors;
		},
	};
}());
