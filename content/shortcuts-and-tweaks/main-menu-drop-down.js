/**
 * main-menu-drop-down.js
 * Self sustaining drop down menu containing all links usually found in the main-sidebar
 * Updates the corresponding menu whenever the user browses to the original target page (room for improvement)
 * @author CatzHoek
 */

Foxtrick.modules['MainMenuDropDown'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES: ['all'],
	OPTIONS: ['DisregardFirstHeader'],
	CSS: [Foxtrick.InternalPath + 'resources/css/main-menu-drop-down.css'],

	convertMainMenuToUnorderedList: function(doc) {
		var menuLinks = doc.querySelectorAll('#menu > a');
		var list = Foxtrick.createFeaturedElement(doc, Foxtrick.modules.MainMenuDropDown, 'ul');
		list.id = 'ft-drop-down-menu';
		Foxtrick.map(function(link) {
			if (link.id == 'ctl00_ctl00_CPHeader_ucMenu_hypLogout')
				return;
			var listItem = doc.createElement('li');
			listItem.appendChild(link);
			list.appendChild(listItem);
		}, menuLinks);
		var logout = doc.getElementById('ctl00_ctl00_CPHeader_ucMenu_hypLogout');
		doc.getElementById('menu').insertBefore(list, logout);
	},
	
	addMenusToListItem: function(doc, node, menus, className) {
		if (!menus.length)
			return;

		var addSeperator = function(list, text) {
			var li = doc.createElement('li');
			var hr = doc.createElement('hr');
			li.appendChild(hr);
			list.appendChild(li);

			li = doc.createElement('li');
			if (text) {
				var h3 = doc.createElement('h3');
				h3.textContent = text;
				li.appendChild(h3);
				list.appendChild(li);
			}
			li = doc.createElement('li');
			var hr = doc.createElement('hr');
			li.appendChild(hr);
			list.appendChild(li);
		}

		var firstHeader = true;
		var list = doc.createElement('ul');
		Foxtrick.addClass(list, className);
		Foxtrick.map(function(menu) {
			if (firstHeader) {
				if (!FoxtrickPrefs.isModuleOptionEnabled('MainMenuDropDown', 'DisregardFirstHeader'))
					addSeperator(list, menu.name);
				firstHeader = false;
			} else {
				addSeperator(list, menu.name);	
			}
			Foxtrick.map(function(entry) {
				var li = doc.createElement('li');
				var anchor = doc.createElement('a');
				anchor.textContent = entry.text;
				anchor.href = entry.link;
				li.appendChild(anchor);
				list.appendChild(li);
			}, menu.entries);
		}, menus);


		node.appendChild(list);
	},
	run: function(doc) {

		var module = this;
		
		// put #menu > a in #menu > ul > li', logout is left as is
		this.convertMainMenuToUnorderedList(doc);

		// current page
		//var isOnMainMenuPage = function() {
		//	var menuLinks = doc.querySelectorAll('#menu a');
		//	var ret = false;
		//	Foxtrick.map(function(menuLink) {
		//		if (Foxtrick.isPageHref(menuLink.href.replace(/^.*\/\/[^\/]+/, '') +'$',
		//								doc.location.href))
		//			ret = true;
		//	}, menuLinks);
		//	return ret;
		//}


		var NavigationStructure = function() {
			this.menus = {
				primary: [],
				secondary: []
			}
			this.save = function() {
				Foxtrick.localSet('Menu.v4.' + Foxtrick.modules['Core'].getSelfTeamInfo().teamId +
								  '.' + FoxtrickPrefs.getString('htLanguage'), { menus: this.menus });
			}
			this.load = function(func) {
				Foxtrick.localGet('Menu.v4.' + Foxtrick.modules['Core'].getSelfTeamInfo().teamId +
								  '.' + FoxtrickPrefs.getString('htLanguage'),
				  function(menu) {
					if (!menu) {
						func(new NavigationStructure());
					} else {
						var nav = new NavigationStructure();
						nav.menus = menu.menus;
						func(nav);
					}
				});
			}
			this.getMenusForUrl = function(url, source) {
				var properUrl = url.replace(/^.*\/\/[^\/]+/, '').replace(/Default\.aspx/i, '');
				var primaries = Foxtrick.filter(function(entry) {
					if (entry.url.toLowerCase() == properUrl.toLowerCase())
						return true;
					else
						return false;
				}, source);
				return primaries;	
			}
			this.getPrimaryMenusForUrl = function(url) {
				return this.getMenusForUrl(url, navi.menus.primary);
			}
			this.getSecondaryMenusForUrl = function(url) {
				return this.getMenusForUrl(url, navi.menus.secondary);
			}
			this.update = function(menu, target) {
				for (var existingMenu in target) {
					Foxtrick.log(target[existingMenu].name, target[existingMenu].name);
				}
			}
			this.concat = function(menus, target) {
				var secondary = this.menus[target];
				Foxtrick.map(function(newMenu) {
					Foxtrick.any(function(menu) {
						if (menu.url.toLowerCase() === newMenu.url.toLowerCase() &&
						   menu.name === newMenu.name) {
							secondary = Foxtrick.remove(secondary, menu);
							return true; // stops on first match
						}
						return false;
					}, secondary);
					secondary.push(newMenu);
				}, menus);
				this.menus[target] = secondary;
			}
			this.learn = function(doc) {
				// learns secondary menus from current document
				var getSecondaryMenus = function(doc) {
					var boxBodies = doc.querySelectorAll('.sidebarBox > .boxBody');
					var menuslist = [];

					var isEmptyTextNode = function(node) {
						var nodeType = node.nodeType;
						if (Foxtrick.NodeTypes.TEXT_NODE == nodeType &&
						   node.textContent.replace(/\s*/gi, '') == '')
							return true;

						return false;
					};

					Foxtrick.map(function(boxBody) {
						// Foxtrick.log(boxBody);
						// only accept sidebar thingies that have the structure .boxbody > a
						// but allow <br> and empty textnode
						var linkOnlyBox = true;
						for (var c = 0; c < boxBody.childNodes.length; c++) {
							var child = boxBody.childNodes[c];
							// ignore stupid empty textnodes or line break
							if (isEmptyTextNode(child) || child.tagName == 'BR' ) {
								// that's okay
							}
							else if (child.tagName != 'A') {
								// hack out those anchor tags
								// that are wrapped in paragraphs for some reason
								if (child.tagName == 'P' || child.tagName == 'SPAN') {
									var ok = true;
									Foxtrick.map(function(node) {
										if (!isEmptyTextNode(node) && node.tagName != 'A')
											ok = false;
									}, child.childNodes);
									// allow supporter player category
									if (child.tagName == 'SPAN' &&
										child.id.match(/PlayersMenu_rep\d+_ctl\d+_lbCategory/))
										ok = true;
									if (ok) {
										Foxtrick.log('Hacked arround unecessary <p>/</span> wrapping');
										continue;
									}
								}
								else if (child.tagName == 'DIV') {
									if (child.getAttribute('style') &&
										child.getAttribute('style').match(/clear:both;/)) {
										Foxtrick.log('Hacked arround clear both div');
										continue;
									}
									if (Foxtrick.hasClass(child, 'supHlRepSpecial')) {
										Foxtrick.log('Ignored supporter scarf');
										continue;
									}
								}
								linkOnlyBox = false;
							}
						}
						// only contains links (and <br> and empty text nodes) -> build object
						if (linkOnlyBox) {
							var header = boxBody.parentNode.querySelector('h2');
							var links = boxBody.parentNode.querySelectorAll('a');

							var menu = {};
							menu.name = Foxtrick.trim(header.textContent);
							menu.url = doc.location.href.replace(/^.*\/\/[^\/]+/, '')
								.replace(/Default\.aspx/i, '');
							menu.entries = [];
							menu.timestamp = (new Date()).getTime();

							Foxtrick.map(function(link) {
								// no empty shit, like
								if (link.textContent.replace(/\s*/gi, '') == '')
									return;
								
								if (Foxtrick.getHref(doc) + '#' == link.href)
									return;

								if (link.href.match(/javascript\:/))
									return;

								var entry = {};
								entry.text = Foxtrick.trim(link.textContent);
								entry.link = !Foxtrick.isHtUrl(link.href) ? link.href :
									link.href.replace(/^.*\/\/[^\/]+/, '').replace(/Default\.aspx/i, '');
								menu.entries.push(entry);
							}, links);

							if (menu.entries.length > 0)
								menuslist.push(menu);
						} 
					}, boxBodies);
					return menuslist;
				}
				// learns primary menus from current document
				var getPrimaryMenus = function(doc) {
					var subMenuContent = doc.querySelectorAll('.subMenu > .subMenuBox > .boxBody')[0];
					
					// no navigation sidebar, like forums
					if (subMenuContent === undefined)
						return [];

					// map all teamPages to /Club/ primary
					// takes own only, discards others
					// other primaries will still spam but this one is key
					var primaryUrl = Foxtrick.isPage(doc, 'teamPageAny') ? '/Club/' :
						doc.location.href.replace(/^.*\/\/[^\/]+/, '')
							.replace(/Default\.aspx/i, '');

					var menulist = [];
					Foxtrick.map(function(node) {
						if (node.tagName === 'H3') {
							menu = {};
							menu.name = Foxtrick.trim(node.textContent);

							menu.entries = [];
							menu.timestamp = (new Date()).getTime();

							menu.url = primaryUrl;
						}
						if (node.tagName === 'UL') {
							var links = node.getElementsByTagName('a');

							Foxtrick.map(function(link) {
								var entry = {};
								entry.text = Foxtrick.trim(link.textContent);
								entry.link = !Foxtrick.isHtUrl(link.href) ? link.href :
									link.href.replace(/^.*\/\/[^\/]+/, '').replace(/Default\.aspx/i, '');
								menu.entries.push( entry );
							}, links);
							menulist.push(menu);
						}
					}, subMenuContent.childNodes);
					return menulist;
				}


				if (Foxtrick.isPage(doc, 'teamPageAny')) {
					// take own only, discard others
					var myTeamId = Foxtrick.util.id.getOwnTeamId();
					var currentTeamId = Foxtrick.Pages.All.getTeamId(doc);
					if (currentTeamId != myTeamId)
						return;
				}

				this.concat(getPrimaryMenus(doc), 'primary');
				this.concat(getSecondaryMenus(doc), 'secondary');
			}
		}

		// that shit saves and loads from localstore and stuff
		var navi = new NavigationStructure();
		navi.load(function(loaded) {
			navi = loaded;
			navi.learn(doc); // learn current page
			navi.save();	 // save to localstore

			// build the menu
			var links = doc.querySelectorAll('#menu > ul > li > a');
			for (var l = 0; l < links.length; l++) {
				var primaryUrl = links[l].href;
				var primaries = navi.getPrimaryMenusForUrl(primaryUrl);
				var secondaries = navi.getSecondaryMenusForUrl(primaryUrl);
				module.addMenusToListItem(doc, links[l].parentNode,
										  Foxtrick.union(primaries, secondaries),
										  'ft-drop-down-submenu');
				
				// secondary links
				var secondaryLinks = links[l].parentNode.querySelectorAll('a');
				for (var sl = 0; sl < secondaryLinks.length; sl++) {
					if (sl == 0) // skip first entry, that's cover already
						continue;
					var secondaryUrl = secondaryLinks[sl].href;
					var secondaries = navi.getSecondaryMenusForUrl(secondaryUrl);
					module.addMenusToListItem(doc, secondaryLinks[sl].parentNode, secondaries,
											  'ft-drop-down-submenu ft-drop-down-submenu-2');
					if (secondaries.length) {
						var ul = secondaryLinks[sl].parentNode.getElementsByTagName('ul')[0];
						var span = doc.createElement('span');
						if (!Foxtrick.util.layout.isRtl(doc))
							span.textContent = '\u25b6';
						else
							span.textContent = '\u25c0';
						secondaryLinks[sl].parentNode.insertBefore(span, ul);
					}
				}
			}

			// css adjustments for custom ht designs ()
			var getCustomCss = function(doc) {
				var inlinestyleNodes = doc.getElementsByTagName('style');
				var inlineStyle = '';
				Foxtrick.map(function(styleNode) {
					if (styleNode.id != 'ft-module-css' && styleNode.id != 'dynamic-mmmd-style')
						inlineStyle = inlineStyle + styleNode.textContent + '\n';
				}, inlinestyleNodes);
				return inlineStyle;
			};

			var css = getCustomCss(doc);
			var newcss = css.replace(/#menu\s*{/gi, '#menu h3, #menu ul, #menu {');
			var newcss = newcss.replace(/#menu\s*a\s*{/gi, '#menu h3, #menu a {');
			newcss = newcss.replace(/#menu\s*a\s*:\s*hover\s*{/gi, '#menu li:hover, #menu a:hover {');
			if (newcss != css) {
				Foxtrick.util.inject.css(doc, newcss, 'modified-ht-style');
			}
		});

		function hoverBgColor(text) {
			var matches = text.match(this.re);
			if (matches)
				return matches[1];
			return null;
		}
		hoverBgColor.prototype.re = /#menu\s*a\s*:\s*hover\s*{.*background-color:([^;]+);/i;
		function hoverColor(text) {
			var matches = text.match(this.re);
			if (matches)
				return matches[1];
			return null;
		}
		hoverColor.prototype.re = /#menu\s*a\s*:\s*hover\s*{.*\s*color:([^;]+);/i;
		function bgColor(text) {
			var matches = text.match(this.re);
			if (matches)
				return matches[1];
			return null;
		}
		bgColor.prototype.re = /#menu\s*a\s*{.*background-color:([^;]+);/i;
		function textColor(text) {
			var matches = text.match(this.re);
			if (matches)
				return matches[1];
			return null;
		}
		textColor.prototype.re = /#menu\s*a\s*{.*\s*color:([^;]+);/i;
		
		function getMenuTextColor() {
			var tcolor;
			Foxtrick.map(function(styleSheet) {
				try {
					// opera throws security exception when accessing CSS from different domain
					if (styleSheet.cssRules) {
						Foxtrick.any(function(rule) {
							//var hbc = hoverBgColor(rule.cssText);
							//var hc = hoverColor(rule.cssText);
							//var bc = bgColor(rule.cssText);
							var c = textColor(rule.cssText);

							//if (hbc)
							//	Foxtrick.log('hover bg color',hbc);
							//if (bc)
							//	Foxtrick.log('text bg c',bc);
							//if (hc)
							//	Foxtrick.log('text hover',hc);
							if (c) {
								tcolor = c;
								return true;
							}
							else
								return false;

						}, styleSheet.cssRules);
					}
				}
				catch (e) {};
			}, doc.styleSheets);	
			return tcolor;	
		}
		var tc = getMenuTextColor();
	
		var hrstyle = '#menu hr { background-color:' + tc +
			' !important;} .ft-drop-down-submenu li span, #menu h3 {color:' + tc + ' !important;}';
		Foxtrick.util.inject.css(doc, hrstyle, 'dynamic-mmmd-style');
	}
}
