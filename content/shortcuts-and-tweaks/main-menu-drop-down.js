/**
 * main-menu-drop-down.js
 * Self sustaining drop down menu containing all links usually found in the main-sidebar
 * Updates the corresponding menu whenever the user browses to the original target page (room for improvement)
 * @author CatzHoek
 */
'use strict';

Foxtrick.modules['MainMenuDropDown'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	OUTSIDE_MAINBODY: true,
	PAGES: ['all'],
	OPTIONS: ['DisregardFirstHeader', 'DropDownArrows'],
	CSS: [Foxtrick.InternalPath + 'resources/css/main-menu-drop-down.css'],
	OPTIONS_CSS: [
		null,
		Foxtrick.InternalPath + 'resources/css/main-menu-drop-down-arrow.css',
	],

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
				if (!Foxtrick.Prefs.isModuleOptionEnabled('MainMenuDropDown', 'DisregardFirstHeader'))
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

		//add class to style those that have a ddm
		Foxtrick.addClass(node, 'ft-hasSubMenu');

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
		//		if (Foxtrick.isPageHref(doc.location.href,
		//		    menuLink.href.replace(/^.*\/\/[^\/]+/, '') +'$'))
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
								  '.' + Foxtrick.Prefs.getString('htLanguage'), { menus: this.menus });
			}
			this.load = function(func) {
				Foxtrick.localGet('Menu.v4.' + Foxtrick.modules['Core'].getSelfTeamInfo().teamId +
								  '.' + Foxtrick.Prefs.getString('htLanguage'),
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
							secondary = Foxtrick.exclude(secondary, menu);
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
							menu.name = header.textContent.trim();
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
								entry.text = link.textContent.trim();
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
					var menu;
					Foxtrick.map(function(node) {
						if (node.tagName === 'H3') {
							menu = {};
							menu.name = node.textContent.trim();

							menu.entries = [];
							menu.timestamp = (new Date()).getTime();

							menu.url = primaryUrl;
						}
						if (node.tagName === 'UL') {
							var links = node.getElementsByTagName('a');

							Foxtrick.map(function(link) {
								var entry = {};
								entry.text = link.textContent.trim();
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
										  Foxtrick.concat(primaries, secondaries),
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
			// extract bg color
			var bgColor = css.match(/background-color:\s*(.+?);/);
			var hoverColor;
			if (bgColor) {
				bgColor = bgColor[1];
				var hsl = Foxtrick.util.color.rgbToHsl(Foxtrick.util.color.hexToRgb(bgColor));
				// make light backgrounds darker, dark lighter on hover
				hsl[2] += hsl[2] > 0.5 ? -0.08 : 0.08;
				hoverColor = Foxtrick.util.color.rgbToHex(Foxtrick.util.color.hslToRgb(hsl));
			}

			var newcss = css.replace(/#menu\s*\{/gi, '#menu h3, #menu ul, #menu {');
			newcss = newcss.replace(/#menu\s*a\s*\{/gi, '#menu h3, #menu a {');
			newcss = newcss.replace(/#menu\s*a\s*:\s*hover\s*\{(.+?)\}/gi, function() {
				return '#menu li:hover, #menu a:hover {' +
					arguments[1].replace(bgColor, hoverColor) + '}';
			});
			if (newcss != css) {
				Foxtrick.util.inject.css(doc, newcss, 'modified-ht-style');
			}
		});

		var textColorRe = /#menu\s*a\s*{.*\s*color:([^;]+);/i;
		var textColor = function(text) {
			var matches = text.match(textColorRe);
			if (matches) {
				return matches[1];
			}
			return null;
		};

		var getMenuTextColor = function() {
			var tcolor;
			Foxtrick.map(function(styleSheet) {
				if (styleSheet.cssRules) {
					Foxtrick.any(function(rule) {
						var c = textColor(rule.cssText);

						if (c) {
							tcolor = c;
							return true;
						}
						else
							return false;

					}, styleSheet.cssRules);
				}
			}, doc.styleSheets);
			return tcolor;
		};
		var tc = getMenuTextColor();

		var hrstyle = '#menu hr { background-color:' + tc +
			' !important;} .ft-drop-down-submenu li span, #menu h3 {color:' + tc + ' !important;}';
		Foxtrick.util.inject.css(doc, hrstyle, 'dynamic-mmmd-style');
	}
};
