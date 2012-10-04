'use strict';
/**
 * links.js
 * External links collection
 * @author others, convinced, ryanli
 */

(function() {
	// callback is called after links-collection is stored in session store
	var collection = null;
	var callbackStack = [];
	var storeCollection = function(callback) {
		callbackStack.push(callback);
		if (callbackStack.length != 1)
			return;
		if (collection)
			return;
		collection = {};
		// load links from external feeds
		var feeds = FoxtrickPrefs.getString('module.Links.feeds') || '';
		feeds = feeds.split(/(\n|\r)+/);
		feeds = Foxtrick.filter(function(n) { return Foxtrick.trim(n) != ''; }, feeds);
		// add default feed if no feeds set
		if (feeds.length == 0)
			feeds = [Foxtrick.DataPath + 'links.json'];

		var parseFeed = function(text) {
			var key, prop;

			try {
				//Foxtrick.log('parseFeed: ', text.substr(0,200));
				var links = JSON.parse(text);
			}
			catch (e) {
				Foxtrick.log('Failure parsing links file: ', text.substr(0, 200));
				return;
			}
			for (key in links) {
				var link = links[key];
				if (link.img) {
					// add path to internal images
					if (link.img.indexOf('resources') == 0)
						link.img = Foxtrick.InternalPath + link.img;
					link.img = Foxtrick.util.sanitize.parseUrl(link.img);
				}
				for (prop in link) {
					if (prop.indexOf('link') >= 0) {
						link[prop].url = Foxtrick.util.sanitize.parseUrl(link[prop].url);
						if (typeof(collection[prop]) == 'undefined') {
							collection[prop] = {};
						}
						collection[prop][key] = link;
					}
				}
			}
			Foxtrick.sessionSet('links-collection', collection);
			if (todo == 0 && callbackStack.length) {
				for (var i = 0; i < callbackStack.length; ++i) {
					if (typeof callbackStack[i] == 'function')
						callbackStack[i](collection);
				}
				callbackStack = [];
				Foxtrick.log('Links feeds loaded');
			}
		};

		// now load the feeds
		Foxtrick.log('Loading link feeds from: ', feeds, ' length: ', feeds.length);
		var todo = feeds.length;
		Foxtrick.map(function(feed) {
			// kick zip if still there
			feed = feed.replace(/\.json\.zip/i, '.json');
			Foxtrick.log('do feeds: ', feed);
			// load plain text
			Foxtrick.util.load.get(feed)('success',
			  function(text) {
				--todo;
				if (text == null)
					text = FoxtrickPrefs.getString('LinksFeed.' + feed);
				//Foxtrick.log('parse ', feed);
				parseFeed(text);
				Foxtrick.localSet('LinksFeed.' + feed, text);
			})('failure', function(code) {
				--todo;
				Foxtrick.log('Error loading links feed: ', feed, '. Using cached feed.');
				Foxtrick.localGet('LinksFeed.' + feed, function(text) { parseFeed(text); });
			});
		}, feeds);
	};


	Foxtrick.modules['Links'] = {
		MODULE_CATEGORY: Foxtrick.moduleCategories.LINKS,
		CORE_MODULE: true,
		OPTIONS: ['AddServer'],

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

			var br = doc.createElement('br');
			cont.appendChild(br);

			var label = doc.createElement('p');
			label.setAttribute('data-text', 'Links.feeds');
			cont.appendChild(label);

			var textarea = doc.createElement('textarea');
			textarea.setAttribute('pref', 'module.Links.feeds');
			cont.appendChild(textarea);

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

		getLinks: function(type, args, doc, module) {
			var makeLink = function(url) {
				var i;
				for (i in args) {
					url = url.replace(RegExp('\\[' + i + '\\]', 'g'), args[i]);
				}
				return url;
			};
			var getLinkElement = function(link, url, key, module) {
				var linkNode = doc.createElement('a');

				linkNode.href = url;
				if (link.openinthesamewindow == undefined) {
					linkNode.target = '_stats';
				}

				linkNode.title = link.title;
				linkNode.setAttribute('key', key);
				linkNode.setAttribute('module', module);

				if (link.img == undefined) {
					linkNode.appendChild(doc.createTextNode(link.shorttitle));
				}
				else {
					// add img for tracker flags
					if (module === 'LinksTracker')
						linkNode.appendChild(doc.createElement('img'));
					else {
						var height = 16;
						if (type == 'playerhealinglink')
							height = 8;
						Foxtrick.addImage(doc, linkNode, { alt: link.shorttitle || link.title,
							title: link.title, src: link.img, height: height });
					}
				}

				return linkNode;
			};

			// links collection are not available, get them and return
			if (!collection) {
				storeCollection();
				return [];
			}

			// add current server to args first
			args.server = doc.location.hostname;
			args.lang = FoxtrickPrefs.getString('htLanguage');

			// links to return
			var links = [];

			var key;
			for (key in collection[type]) {
				var link = collection[type][key];
				var urlTmpl = link[type].url;
				var filters = link[type].filters;

				var values = args;
				if (link.SUM != undefined) {
					// makes calculation of requested parameteres and place values
					// with the others in params
					var sum, i;
					if (link.SUM) {
						for (sum in link.SUM) {
							values[sum] = 0;
							for (i = 0; i < link.SUM[sum].length; ++i)
								values[sum] += Number(args[link.SUM[sum][i]]);
						}
					}
				}

				var allowed = true;
				if (!FoxtrickPrefs.isModuleOptionEnabled(module.MODULE_NAME, key)) {
					// link not enabled
					allowed = false;
				}
				else if (filters && filters.length > 0) {
					// ranges to determine whether to show
					var i, j;
					for (i = 0; i < filters.length; i++) {
						var filtertype = filters[i];
						var filterranges = link[filtertype + 'ranges'];
						var temp = false;

						for (j = 0; j < filterranges.length; j++) {
							if ((args[filtertype] >= filterranges[j][0]) &&
							    (args[filtertype] <= filterranges[j][1])) {
								temp = true;
								break;
							}
						}
						if (!temp) {
							allowed = false;
							break;
						}
					}
				}
				// check allowed based on value comparison
				else if (link.allow != undefined) {

					var comparisons = {
						GREATER: function(test) {
							return values[test[1]] > values[test[2]];
						},
						SMALLER: function(test) {
							return values[test[1]] < values[test[2]];
						},
						EQUAL: function(test) {
							return values[test[1]] == values[test[2]];
						},
						OR: function(test) {
							var result = false;
							for (var i = 1; i < test.length; ++i) {
								result = result || comparisons[test[i][0]](test[i]);
							}
							return result;
						},
						AND: function(test) {
							var result = true;
							for (var i = 1; i < test.length; ++i) {
								result = result && comparisons[test[i][0]](test[i]);
							}
							return result;
						}
					};
					var test = link.allow;
					allowed = comparisons[test[0]](test);
				}
				else {
					// alway shown
					allowed = true;
				}

				if (allowed) {
					if (FoxtrickPrefs.getBool('module.Links.AddServer.enabled') &&
					    urlTmpl.indexOf('?') != -1)
						urlTmpl = urlTmpl + '&ht-server=[server]';
					var url = makeLink(urlTmpl);
					if (url != null) {
						links.push({ 'link': getLinkElement(link, url, key, module.MODULE_NAME),
						           'obj': link });
					}
				}
			}
			links.sort(function(a, b) {
				if (a.obj.img == undefined && b.obj.img == undefined)
					return 0;
				else if (a.obj.img == undefined)
					return 1;
				else if (b.obj.img == undefined)
					return -1;
				else
					return a.obj.title.localeCompare(b.obj.title);
			});
			return links;
		},

		getOptionsHtml: function(doc, module, linkType, callback) {
			try {
				var list = doc.createElement('ul');
				this.getCollection(
				  function(collection) {
					try {
						var hasOption = false;
						var types = (linkType instanceof Array) ? linkType : [linkType];
						//Foxtrick.log('types ', types)
						Foxtrick.map(function(type) {
							try {
								//Foxtrick.log(module, ' ', linkType, ' ', type);
								if (collection[type]) {
									var links = collection[type];
									var key;
									for (var key in links) {
										//Foxtrick.log(type, ' ', key);
										var link = links[key];
										var item = doc.createElement('li');
										list.appendChild(item);

										var label = doc.createElement('label');
										item.appendChild(label);

										var check = doc.createElement('input');
										check.type = 'checkbox';
										check.setAttribute('module', module);
										check.setAttribute('option', key);
										// since this is appended asychronously, we set
										// the checked attribute manually
										if (FoxtrickPrefs.isModuleOptionEnabled(module, key) === null
										||	FoxtrickPrefs.isModuleOptionEnabled(module, key)) {
											check.setAttribute('checked', 'checked');
											FoxtrickPrefs.setModuleEnableState(module + '.' + key,
											                                   true);
											hasOption = true;
										}
										label.appendChild(check);
										label.appendChild(doc.createTextNode(link.title));
									}
								}
								if (hasOption && FoxtrickPrefs.isModuleEnabled(module) === null) {
									doc.getElementById('pref-' + module + '-check')
										.setAttribute('checked', 'checked');
									doc.getElementById('pref-' + module + '-options')
										.setAttribute('style', '');
									FoxtrickPrefs.setModuleEnableState(module, true);
								}
							}
							catch (e) {
								Foxtrick.log(e);
							}
						}, types);
						if (callback)
							callback();
					}
					catch (e) {
						Foxtrick.log(e);
					}
				});
				return list;
			}
			catch (e) {
				Foxtrick.log(e);
			}
		}
	};
}());
