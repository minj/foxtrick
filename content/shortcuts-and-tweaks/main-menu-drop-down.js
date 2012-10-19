/**
 * main-menu-drop-down.js
 * Self sustaining drop down menu containing all links usually found in the main-sidebar
 * Updates the corresponding menu whenever the user browses to the original target page (room for improvement)
 * @author CatzHoek
 */

Foxtrick.modules['MainMenuDropDown']={
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ['all'],
	OPTIONS : ['DisregardFirstHeader'],
	CSS : [Foxtrick.InternalPath + 'resources/css/main-menu-drop-down.css'],

	buildMainMenu : function(doc){
		var menuLinks = doc.querySelectorAll('#menu > a');
			var list = Foxtrick.createFeaturedElement(doc, Foxtrick.modules.MainMenuDropDown, 'ul');
			list.id = 'ft-drop-down-menu';
			Foxtrick.map(function(link){
				if(link.id == 'ctl00_ctl00_CPHeader_ucMenu_hypLogout')
					return;
				var listItem = doc.createElement('li');
				listItem.appendChild(link);
				list.appendChild(listItem);
			}, menuLinks);
			doc.getElementById('menu').insertBefore(list, doc.getElementById('ctl00_ctl00_CPHeader_ucMenu_hypLogout'));
	},
	addSeperator : function(doc, list, text){
		var li = doc.createElement('li');
		if(text){
			var h3 = doc.createElement('h3');
			h3.textContent = text;
			li.appendChild(h3);
			list.appendChild(li);
		}
		li = doc.createElement('li');
		var hr = doc.createElement('hr');
		li.appendChild(hr);
		list.appendChild(li);

	},
	addMenusToListItem : function(doc, node, menus, className, recursive){
		if(!menus.length)
			return;

		var list = doc.createElement('ul');
		Foxtrick.addClass(list, className);
		Foxtrick.map(function(menu){

			Foxtrick.modules['MainMenuDropDown'].addSeperator(doc, list, menu.name);
			Foxtrick.map(function(entry){
				var li = doc.createElement('li');
				var anchor = doc.createElement('a');
				anchor.textContent = entry.text;
				anchor.href = entry.link;
				li.appendChild(anchor);
				list.appendChild(li);
			}, menu.entries);
		}, menus);
		node.appendChild(list);

		//add hr for displaying info later
		Foxtrick.modules['MainMenuDropDown'].addSeperator(doc, list);

		var li = doc.createElement('li');
		Foxtrick.addClass(li,"ft-mmdd-annoy");
		li.textContent = "Work in progress stuff, the menu learns as you go!";
		list.appendChild(li);

	},
	run : function(doc){
		//only stage for now until HTs release decent CSS
		if(!Foxtrick.isStage(doc))
			return;
	
		this.buildMainMenu(doc);

		var isOnMainMenuPage = function(){
			var menuLinks = doc.querySelectorAll('#menu a');
			var ret = false;
			Foxtrick.map(function(menuLink){
				if(Foxtrick.isPageHref(menuLink.href.replace(/^.*\/\/[^\/]+/, '') +'$', doc.location.href))
					ret = true;
			}, menuLinks);	
			return ret;
		}

		var NavigationStructure = function(){
			this.language = FoxtrickPrefs.getString('htLanguage');
			this.menus = {
				primary : [],
				secondary : []
			}
			this.save = function(){
				Foxtrick.localSet("Menu.v1." + Foxtrick.modules['Core'].getSelfTeamInfo().teamId, this);
			}
			this.load = function(func){
				Foxtrick.localGet("Menu.v1."  + Foxtrick.modules['Core'].getSelfTeamInfo().teamId, function(menu){
					if(!menu){
						func(new NavigationStructure());
					} else {
						var nav = new NavigationStructure();
						nav.language = menu.language;
						nav.menus = menu.menus;
						func(nav);
					}
				});
			}
			this.getPrimaryMenusForUrl = function(url){
				var primaries = Foxtrick.filter(function(entry){
					if(entry.url == url.replace(/^.*\/\/[^\/]+/, ''))
						return true;
					else
						return false;
				}, this.menus.primary);
				return primaries;
			}
			this.getSecondaryMenusForUrl = function(url){
				var secondaries = Foxtrick.filter(function(entry){
					if(entry.url == url.replace(/^.*\/\/[^\/]+/, ''))
						return true;
					else
						return false;
				}, navi.menus.secondary);
				return secondaries;
			}
			this.concatPrimary = function(addMenus){
				Foxtrick.log("Addmenus", addMenus);
				var primary = this.menus.primary;
				Foxtrick.map(function(newMenu){
					var exists = Foxtrick.any(function(menu){
						if(menu.url === newMenu.url && menu.name === newMenu.name)
							return true;

						return false;
					}, primary);
					if(!exists)
						primary.push(newMenu);

				}, addMenus);
				this.menus.primary = primary;
			}
			this.concatSecondary = function(addMenus){
				var secondary = this.menus.secondary;
				Foxtrick.map(function(newMenu){
					var exists = Foxtrick.any(function(menu){
						if(menu.url === newMenu.url && menu.name === newMenu.name)
							return true;

						return false;
					}, secondary);
					if(!exists)
						secondary.push(newMenu);
				}, addMenus);
				this.menus.secondary = secondary;
			}
			this.learn = function(doc){
				//learns secondary menus from current document
				var getSecondaryMenus = function(doc){
					var boxBodies = doc.querySelectorAll('#sidebar > .sidebarBox > .boxBody');

					var menuslist = [];
					Foxtrick.map(function(boxBody){
						//only accept sidebar thingies that have the structure .boxbody > a
						//but allow <br> and empty textnode
						//
						var isEmptyTextNode = function(node){
							var nodeType = node.nodeType;
							if(Foxtrick.NodeTypes.TEXT_NODE == nodeType && node.textContent.replace(/\s*/gi, '') == '')
								return true;

							return false;
						};
						var linkOnlyBox = true;
						for(var child = 0; child < boxBody.childNodes.length; child++){
							//ignore stupid empty textnodes or line break
							if(isEmptyTextNode(boxBody.childNodes[child]) || boxBody.childNodes[child].tagName == 'BR' ){
								//that's okay
							} else if(boxBody.childNodes[child].tagName != 'A'){
								//hack out those anchor tags that are wrapped in paragraphs for some reason
								if(boxBody.childNodes[child].tagName == 'P'){
									var ok = true;
									Foxtrick.map(function(node){
										if(!isEmptyTextNode(node) && node.tagName != 'A')
											ok = false;
									}, boxBody.childNodes[child].childNodes);
									if(ok){
										Foxtrick.log("Hacked arround unecessary <p> wrapping");
										continue;
									}
								}
								linkOnlyBox = false;
							}
						}
						//only contains links (and <br> and empty text nodes) -> build object
						if(linkOnlyBox){
							var header = boxBody.parentNode.querySelector('h2');
							var links = boxBody.parentNode.querySelectorAll('a');

							var menu = {};
							menu.name = Foxtrick.trim(header.textContent);
							menu.url = doc.location.href.replace(/^.*\/\/[^\/]+/, '');
							menu.entries = [];
							menu.timestamp = (new Date()).getTime();

							Foxtrick.map(function(link){
								//no empty shit, lile
								if(link.textContent.replace(/\s*/gi, '') == '')
									return;

								var entry = {}
								entry.text = Foxtrick.trim(link.textContent);
								entry.link = link.href.replace(/^.*\/\/[^\/]+/, '');
								menu.entries.push(entry);
							}, links);
							menuslist.push(menu);
						}	
						
					}, boxBodies);
					return menuslist;
				}
				//learns primary menus from current document
				var getPrimaryMenus = function(doc){
					var subMenuContent = doc.querySelectorAll('.subMenu > .subMenuBox > .boxBody')[0];
					
					//no navigation sidebar, like forums
					if(subMenuContent  === undefined)
						return [];

					var menulist = [];
					Foxtrick.map(function(node){
						if(node.tagName === 'H3'){
							menu = {};
							menu.name = Foxtrick.trim(node.textContent);

							menu.entries = [];
							menu.timestamp = (new Date()).getTime();
							menu.url = doc.location.href.replace(/^.*\/\/[^\/]+/, '');
						}
						if(node.tagName === 'UL'){
							var links = node.getElementsByTagName('a');

							Foxtrick.map(function(link){
								var entry = {};
								entry.text = Foxtrick.trim(link.textContent);
								entry.link = link.href.replace(/^.*\/\/[^\/]+/, '');
								menu.entries.push( entry );
							}, links);
							menulist.push(menu);
						}
					}, subMenuContent.childNodes);
					return menulist;
				}

				this.concatPrimary( getPrimaryMenus(doc) );
				this.concatSecondary( getSecondaryMenus(doc) );
			}
		}

		//that shit saves and loads from localstore and stuff
		var navi = new NavigationStructure();
		navi.load(function(loaded){
			navi = loaded;
			navi.learn(doc);
			navi.save();

			//build the menu
			var links = doc.querySelectorAll('#menu > ul > li > a');
			for(var l = 0; l < links.length; l++){
				var primaries = navi.getPrimaryMenusForUrl( links[l].href );
				var secondaries = navi.getSecondaryMenusForUrl( links[l].href );
				Foxtrick.modules['MainMenuDropDown'].addMenusToListItem(doc, links[l].parentNode, Foxtrick.union(primaries, secondaries), "ft-drop-down-submenu", false);
				
				//secondary links
				var secondaryLinks = links[l].parentNode.querySelectorAll('a');
				for(var sl = 0; sl < secondaryLinks.length; sl++){
					if(sl == 0) //skip first entry, that's cover already
						continue;
					var secondaries = navi.getSecondaryMenusForUrl( secondaryLinks[sl].href );
					Foxtrick.modules['MainMenuDropDown'].addMenusToListItem(doc, secondaryLinks[sl].parentNode, secondaries, "ft-drop-down-submenu ft-drop-down-submenu-2", false);
					if(secondaries.length){
						var ul = secondaryLinks[sl].parentNode.getElementsByTagName('ul')[0];
						var span = doc.createElement('span');
						span.textContent = '\u25b6';
						secondaryLinks[sl].parentNode.insertBefore(span, ul);
					}
				}
			}

			//css adjustments for custom ht designs ()
			var getCustomCss = function(doc){
				var inlinestyleNodes = doc.getElementsByTagName('style');
				var inlineStyle = '';
				Foxtrick.map(function(styleNode){
					if(styleNode.id != 'ft-module-css')
						inlineStyle = inlineStyle + styleNode.textContent + '\n';
				}, inlinestyleNodes);
				return inlineStyle;
			};

			var css = getCustomCss(doc);
			var newcss = css.replace(/#menu\s*{/gi, "#menu hr, #menu h3, #menu ul, #menu {");
			newcss = newcss.replace(/#menu\s*a\s*:\s*hover\s*{/gi, "#menu li:hover, #menu a:hover {");
			if(newcss != css)
				doc.getElementsByTagName("style")[0].textContent = newcss;
		});
		
		return;


		var isSubPage = function(menu, url){
				for(var i in menu[activeLanguage])
					for(var k in menu[activeLanguage][i].content){
						if(menu[activeLanguage][i].content[k].tag == 'a')
							if( url === menu[activeLanguage][i].content[k].link)
								return {'main':i, 'link':menu[activeLanguage][i].content[k]};
					}
					
			}
			Foxtrick.log(isSubPage(menuStructure, doc.location.href.replace(/^.*\/\/[^\/]+/, '')));

		

		//gimme what we stored so far, should be good enought for now
		var getLocalStoredStructure = function(callback){
			Foxtrick.localGet('htMenuStructure.' + Foxtrick.modules['Core'].getSelfTeamInfo().teamId, function(menuStructure){
				if(menuStructure === undefined || menuStructure === null)
					callback({});
				else	
					callback(menuStructure);	
			});	
		}
		
		//get saved structure and do the stuff async
		getLocalStoredStructure(function(menuStructure){
			var menuItems = doc.querySelectorAll('#menu > a');
			var nav = Foxtrick.createFeaturedElement(doc, Foxtrick.modules.MainMenuDropDown, 'ul');
			nav.id = 'ft-drop-down-menu';
			Foxtrick.addClass(nav, 'ft-mmdd-default');


			

			//iterate all main menu items
			Foxtrick.map(function(item){
				if(item.id == 'ctl00_ctl00_CPHeader_ucMenu_hypLogout')
					return;

				if(menuStructure[activeLanguage] !== undefined 
					&& menuStructure[activeLanguage][item.href.replace(/^.*\/\/[^\/]+/, '')] !== undefined					 
					&& menuStructure[activeLanguage][item.href.replace(/^.*\/\/[^\/]+/, '')].content !== undefined){

					var li = doc.createElement('li');

					var subMenuList = doc.createElement('ul');
					Foxtrick.addClass(subMenuList, 'ft-drop-down-submenu');
					
					
					// //for custom /club/ styles, set color read from inline <style> nodes, see above
					// if(bgcolor)
					// 	subMenuList.setAttribute('style', 'background-color: ' + bgcolor + '!important;');
					
					//iterate saved structure for current page and current language
					//h3 and lists of links are assumed and supported
					var firstHeader = true;
					Foxtrick.map(function(entry){
						if(entry.tag == 'a'){
							var link_li = doc.createElement('li');
							var link_link = doc.createElement('a');
							link_link.textContent = Foxtrick.trim(entry.text);
							//link_link.setAttribute('title',  Foxtrick.trim(entry.text));
							link_link.href = entry.link;
							link_li.appendChild(link_link);
							subMenuList.appendChild(link_li);
						} else if(entry.tag == 'h3'){
							//first header basicly repeats the name of the main navigation item, repeating it seems weird
							if(firstHeader &&FoxtrickPrefs.isModuleOptionEnabled('MainMenuDropDown', 'DisregardFirstHeader')){
								firstHeader = false;
								return;
							}
							var h3_li = doc.createElement('li');
							var h3 = doc.createElement('h3');
							h3.textContent = entry.text;
							h3_li.appendChild(h3);
							subMenuList.appendChild(h3_li);

							var hr_li = doc.createElement('li');
							var hr = doc.createElement('hr');
							hr_li.appendChild(hr);
							subMenuList.appendChild(hr_li);
						} 
					}, menuStructure[activeLanguage][item.href.replace(/^.*\/\/[^\/]+/, '')].content);

					//append last updated time
					var now = (new Date()).getTime();
					var diff = Number(now) - Number(menuStructure[activeLanguage][item.href.replace(/^.*\/\/[^\/]+/, '')].updated);
					var days = diff/(1000*60*60*24);


					var hr_li = doc.createElement('li');
					var hr = doc.createElement('hr');
					hr_li.appendChild(hr);
					subMenuList.appendChild(hr_li);

					var update_li = doc.createElement('li');
					var update_link = item.cloneNode(true);
					update_link.textContent = 'Updated ' + days.toFixed(2) + ' days ago';
					update_link.setAttribute('title',  'This might eventually serve as place where a warning could be placed when a menu gets old because the landing page is never used (room for improvement here) and an update is required or something');
					update_li.appendChild(update_link);
					subMenuList.appendChild(update_li);

					li.appendChild(item); 			//reposition original link from the #menu
					li.appendChild(subMenuList); 	//the popup
					nav.appendChild(li); 			//attach to #menu
				} else {
					Foxtrick.log("No records found");
					//no records for this language and/or page are present, just attach as is, without popup
					var li = doc.createElement('li');
					li.appendChild(item);
					nav.appendChild(li);
				}

				//update, learn current page if it matches one of the links in #menu
				if(Foxtrick.isPageHref(item.href.replace(/^.*\/\/[^\/]+/, '') +'$', doc.location.href))
					learnCurrentPage(menuStructure);

			}, menuItems);

			//attach rebuild navigation to the menu
			doc.getElementById('menu').insertBefore(nav, doc.getElementById('ctl00_ctl00_CPHeader_ucMenu_hypLogout'));

			fixCss(doc);
		});
	}
}
