'use strict';
/**
 * links.js
 * External links collection
 * @author others, convinced, ryanli, LA-MJ
 */

Foxtrick.modules['Links'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
	CORE_MODULE: true,
	PAGES: ['all'],
	OPTIONS: ['ReuseTab'],

	OPTION_FUNC: function(doc) {
		this.getCollection();

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

	getCollection: function() {
		// load links from external feeds
		var feeds = Foxtrick.Prefs.getString('module.Links.feedsList') || '';
		feeds = feeds.split(/(\n|\r|\\n|\\r)+/);
		feeds = Foxtrick.filter(function(n) { return n.trim() !== ''; }, feeds);

		// use the default feed if no feeds set or using dev/android
		if (feeds.length === 0 ||
		    Foxtrick.platform === 'Android' || Foxtrick.branch === 'dev')
			feeds = [Foxtrick.DataPath + 'links.json'];


		var parseFeeds = function(feeds) {
			var collection = {};

			feeds.forEach(function(text) {
				var links;
				try {
					// Foxtrick.log('parseFeed: ', text.slice(0, 200));
					links = JSON.parse(text);
				}
				catch (e) {
					Foxtrick.log('Failure parsing links:', text.slice(0, 200), e);
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
			});

			// Foxtrick.log('Link feeds loaded');
			return collection;
		};

		Foxtrick.log('Loading', feeds.length, 'link feeds from:', feeds);

		var promises = Foxtrick.map(function(feed) {
			// Foxtrick.log('loading feed:', feed);

			// load a plain text Promise
			return Foxtrick.load(feed)
				.then(function(text) {
					if (!text) {
						Foxtrick.log('Error loading links from:', feed,
						             '. Received empty response. Using cached feed.');

						return Foxtrick.storage.get('LinksFeed.' + feed);
					}
					else {
						return Foxtrick.storage.set('LinksFeed.' + feed, text)
							.then(function() { return text; });
					}

				}, function(resp) {

					Foxtrick.log('Error', resp.status, 'loading links from:', resp.url,
					             '. Using cached feed.');

					return Foxtrick.storage.get('LinksFeed.' + feed);

				}).catch(Foxtrick.catch('StoreLinksCollection'));

		}, feeds);

		return Promise.all(promises).then(function(feeds) {
			return parseFeeds(feeds.filter(function(text) {
				return text;
			}));
		});

	},

	getLinks: function(doc, options) {
		var module = this;

		return module.getCollection().then(function(collection) {
			return module.makeAnchors(doc, collection, options);
		});
	},

	makeAnchors: function(doc, collection, options) {
		var reuseTab = Foxtrick.Prefs.isModuleOptionEnabled('Links', 'ReuseTab');
		var opts = { type: '', info: {}, module: '', className: '' };
		Foxtrick.mergeValid(opts, options);
		var args = opts.info, type = opts.type, module = opts.module;
		var isTracker = /^tracker/.test(type);

		var gLink;

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

		var addUp = function(sum, prop) {
			var num = parseInt(args[prop], 10) || 0;
			return sum + num;
		};
		var testFilter = function(filter) {
			// ranges to determine whether to show
			var ranges = gLink[filter + 'ranges'];

			return Foxtrick.any(function(range) {
				return args[filter] >= range[0] && args[filter] <= range[1];
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
			},
		};

		// links to return
		var links = [];

		for (var key in collection[type]) {
			gLink = collection[type][key];
			var urlTmpl = gLink[type].url;
			var filters = gLink[type].filters;

			if (typeof gLink.SUM !== 'undefined') {
				// makes calculation of requested parameteres and place values
				// with the others in params
				if (gLink.SUM) {
					for (var sum in gLink.SUM) {
						args[sum] = gLink.SUM[sum].reduce(addUp, 0);
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
			else if (typeof gLink.allow !== 'undefined') {
				var test = gLink.allow;
				allowed = COMPARE[test[0]](test);
			}

			if (allowed) {
				var url = Foxtrick.util.links.makeUrl(urlTmpl, args);
				if (url) {
					links.push({
						anchor: makeAnchorElement(gLink, url, key),
						obj: gLink,
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
