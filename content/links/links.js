"use strict";
/**
 * links.js
 * External links collection
 * @author others, convinced, ryanli
 */

Foxtrick.util.module.register((function() {
	// callback is called after links-collection is stored in session store
	var storeCollection = function(callback) {
		var collection = {};
		// load links from external feeds
		var feeds = FoxtrickPrefs.getString("module.Links.feeds") || "";
		feeds = feeds.split(/(\n|\r)+/);
		feeds = Foxtrick.filter(function(n) { return Foxtrick.trim(n) != ""; }, feeds);
		// add default feed if no feeds set
		if (feeds.length == 0)
			feeds = [Foxtrick.DataPath + "links.json"];
		// now load the feeds
		Foxtrick.log("Loading link feeds from: ", feeds);
		Foxtrick.map(function(feed) {
			Foxtrick.get(feed)("success", function(text) {
				var key, prop;

				try {
					var links = JSON.parse(text);
				}
				catch (e) {
					Foxtrick.log("Failure parsing links file: ", text);
					return;
				}
				for (key in links) {
					var link = links[key]; 
					for (prop in link) { 
						if (prop.indexOf("link") >= 0) {
							if (link[prop].url.indexOf("javascript:") == 0) {
								Foxtrick.log("JavaScript not allowed in links: ", link[prop].url);
							}
							else {
								if (typeof(collection[prop]) == 'undefined') {
									collection[prop] = {};
								}
								collection[prop][key] = link;
							}
						}
					}
				}
				Foxtrick.sessionSet("links-collection", collection);
				if (typeof callback == "function")
					callback(collection);
			})("failure", function(code) {
				Foxtrick.log("Error loading links feed: ", feed);
			});
		}, feeds);
	};

	var getCollection = function(callback) {
		var collection = Foxtrick.sessionGet("links-collection");
		if (collection) {
			callback(collection);
		}
		else {
			storeCollection(callback);
		}
	};

	return {
		MODULE_NAME : "Links",
		MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
		CORE_MODULE : true,

		OPTION_FUNC : function(doc) {
			var cont = doc.createElement("div");

			var label = doc.createElement("p");
			label.setAttribute("data-text", "Links.feeds");
			cont.appendChild(label);

			var textarea = doc.createElement("textarea");
			textarea.setAttribute("pref", "module.Links.feeds");
			cont.appendChild(textarea);

			return cont;
		},

		init : function() {
			storeCollection();
		},

		getLinks : function(type, args, doc, module) {
			var makeLink = function(url) {
				var i;
				for (i in args) {
					url = url.replace(RegExp("\\[" + i + "\\]", "g"), args[i]);
				}
				return url;
			};
			var getLinkElement = function(link, url, key, module) {
				var linkNode = doc.createElement("a");

				linkNode.href = url;
				if (link.openinthesamewindow == undefined) {
					linkNode.target = "_stats";
				}

				linkNode.title = link.title;
				linkNode.setAttribute("key", key);
				linkNode.setAttribute("module", module);

				if (link.img == undefined) {
					linkNode.appendChild(doc.createTextNode(link.shorttitle));
				}
				else {
					// add path to internal images
					if (link.img.indexOf('resources')==0)
						link.img = Foxtrick.InternalPath + link.img;
					// add img for tracker flags
					if (module === "LinksTracker")
						linkNode.appendChild(doc.createElement("img"));
					else
						Foxtrick.addImage(doc, linkNode, { alt: link.shorttitle || link.title, title: link.title, src: link.img });
				}

				return linkNode;
			};

			var collection = Foxtrick.sessionGet("links-collection");
			// links collection are not available, get them and return
			if (!collection) {
				storeCollection();
				return [];
			}

			// add current server to args first
			args.server = doc.location.hostname;
			args.lang = FoxtrickPrefs.getString("htLanguage");

			// links to return
			var links = [];

			var key;
			for (key in collection[type]) {
				var link = collection[type][key];
				var urlTmpl = link[type].url;
				var filters = link[type].filters;
				
				var values = args;
				if (link.SUM != undefined) {
					// makes calculation of requested parameteres and place values with the others in params
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
						var filterranges = link[filtertype + "ranges"];
						var temp = false;

						for (j = 0; j < filterranges.length; j++) {
							if ( (args[filtertype] >= filterranges[j][0]) && (args[filtertype] <= filterranges[j][1])) {
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
						GREATER : function (test) {
							return values[test[1]] > values[test[2]];
						},
						SMALLER : function (test) {
							return values[test[1]] < values[test[2]]
						},
						EQUAL : function (test) { 
							return values[test[1]] == values[test[2]]
						},
						OR : function (test) { 
							var result = false;
							for (var i=1; i<test.length; ++i) {
								result = result || comparisons[ test[i][0] ](test[i])
							}
							return result;
						},
						AND : function (test) { 
							var result = true;
							for (var i=1; i<test.length; ++i) {
								result = result && comparisons[ test[i][0] ](test[i])
							}
							return result;
						}
					}
					var test = link.allow;
					allowed = comparisons[ test[0] ](test);
				}
				else {
					// alway shown
					allowed = true;
				}

				if (allowed) {
					var url = makeLink(urlTmpl);
					if (url != null) {
						links.push({"link" : getLinkElement(link, url, key, module.MODULE_NAME), "obj" : link});
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

		getOptionsHtml : function(doc, module, linkType) {
			var list = doc.createElement("ul");
			getCollection(function(collection) {
				var types = (linkType instanceof Array) ? linkType : [linkType];
				Foxtrick.map(function(type) {
					if (collection[type]) {
						var links = collection[type];
						var key;
						for (var key in links) {
							var link = links[key];
							var item = doc.createElement("li");
							list.appendChild(item);

							var label = doc.createElement("label");
							item.appendChild(label);

							var check = doc.createElement("input");
							check.type = "checkbox";
							check.setAttribute("module", module);
							check.setAttribute("option", key);
							// since this is appended asychronously, we set
							// the checked attribute manually
							if (FoxtrickPrefs.isModuleOptionEnabled(module, key)) {
								check.setAttribute("checked", "checked");
							}
							label.appendChild(check);
							label.appendChild(doc.createTextNode(link.title));
						}
					}
				}, types);
			});
			return list;
		}
	};
}()));
