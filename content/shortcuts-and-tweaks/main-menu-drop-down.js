/**
 * main-menu-drop-down.js
 * Self sustaining drop down menu containing all links usually found in the main-sidebar
 * Updates the corresponding menu whenever the user browses to the original target page (room for improvement)
 * @author CatzHoek
 */

Foxtrick.modules['MainMenuDropDown']={
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ['all'],
	OPTIONS : ['DisregardFirstHeader', 'RemoveSidebarMenu'],
	CSS : [Foxtrick.InternalPath + 'resources/css/main-menu-drop-down.css'],
	OPTIONS_CSS:[null, Foxtrick.InternalPath + 'resources/css/remove-sidebar-menu.css'],
	run : function(doc){

		var fixCss = function(){
			//get's custom <style> contents, disregards foxtrick injected nodes
			var getCustomCss = function(doc){
				var inlinestyleNodes = doc.getElementsByTagName('style');
				var inlineStyle = '';
				Foxtrick.map(function(styleNode){
					if(styleNode.id != 'ft-module-css')
						inlineStyle = inlineStyle + styleNode.textContent + '\n';
				}, inlinestyleNodes);
				return inlineStyle;
			};

			//read custom css (supporter feature on /club/ for correct drop down menu color)
			var css = getCustomCss(doc);

			var getMenuBackgroundColor = function(css){
				var re = new RegExp(/#menu\s*{\s*background-color:\s*([^;]+)/gi);
				var matches = re.exec(css);

				return matches?matches[1]:null;
			}

			var getMenuTextColor = function(css){
				var re = new RegExp(/#menu\s*>\s*a\s*{\s*color:\s*([^;]+);/gi);
				var matches = re.exec(css);	
				return matches?matches[1]:null;
			}

			var getHoverColors = function(css){
				var re = new RegExp(/#menu\s*>\s*a:hover\s*{\s*color:\s*([^;]+);\s*background-color:\s*([^;]+)/gi);
				var matches = re.exec(css);	

				return (matches && matches[1] && matches[2])?{color:matches[1], backgroundColor:matches[2]}:null;
			}

			//get css
			var normal_bgc = getMenuBackgroundColor(css);
			var normal_tc = getMenuTextColor(css);
			var hoverColors = getHoverColors(css);

			var custom_tc_css = '#ft-drop-down-menu.ft-mmdd-custom h3, #ft-drop-down-menu.ft-mmdd-custom a { color: %s1 !important; }\n';
			custom_tc_css = custom_tc_css.replace('%s1', normal_tc);

			var custom_hr_css = '#ft-drop-down-menu.ft-mmdd-custom hr { background-color: %s1; }\n';
			custom_hr_css = custom_hr_css.replace('%s1', normal_tc);

			var custom_ul_li_css = '#ft-drop-down-menu.ft-mmdd-custom ul, #ft-drop-down-menu.ft-mmdd-custom li { background-color: %s1; }\n';
			custom_ul_li_css = custom_ul_li_css.replace('%s1', normal_bgc);

			var custom_css = custom_tc_css + custom_hr_css + custom_ul_li_css;

			//play arround with s and v in hsv color-space to find a suitable hover color
			if(hoverColors){
				var hover_bgc = hoverColors.backgroundColor;
				var hover_tc = hoverColors.color;

				var rgb = Foxtrick.util.color.hexToRgb(hover_bgc);
				var hsv = Foxtrick.util.color.rgbToHsv(rgb[0], rgb[1], rgb[2]);

				//this is not perfect yet. when s ([1]) and v ([2]) are both quite close to 80% and one of them is below 80% the computed hover color is barely noticable
				if(1-hsv[2] > 0.20)
					hsv[2] = hsv[2] + (1-hsv[2])/2;
				else if(1-hsv[1] > 0.20)
					hsv[1] = hsv[1] - 0.2 >= 0?hsv[1] - 0.2:hsv[1] + 0.2;
				else
					hsv[1] = hsv[1]/2;

				rgb = Foxtrick.util.color.hsvToRgb(hsv[0],hsv[1],hsv[2]);
					
				var custom_hover_css = '#ft-drop-down-menu.ft-mmdd-custom li:hover{ color: %s1; background-color: rgb(%s2, %s3, %s4); }\n';
				var hover_bgc = hoverColors.backgroundColor;
				var hover_tc = hoverColors.color;
				custom_hover_css = custom_hover_css.replace('%s1', hover_tc);
				custom_hover_css = custom_hover_css.replace('%s2', rgb[0]);
				custom_hover_css = custom_hover_css.replace('%s3', rgb[1]);
				custom_hover_css = custom_hover_css.replace('%s4', rgb[2]);
				custom_css = custom_css + custom_hover_css;
			}

			if(normal_bgc && normal_tc && hoverColors){
				var menu = doc.getElementById('ft-drop-down-menu');
				Foxtrick.removeClass(menu, 'ft-mmdd-default');
				Foxtrick.addClass(menu, 'ft-mmdd-custom');
				Foxtrick.util.inject.css(doc, custom_css);
			}
		}
		
		//end of css hacks to support custom styles (meaning ht supporter feature)

		var activeLanguage = FoxtrickPrefs.getString('htLanguage');

		var learnCurrentPage = function(menuStructure){
			Foxtrick.log('MainMenuDropDown Updating: ' + doc.location.pathname);
			var subMenuContent = doc.querySelectorAll('.subMenu > .subMenuBox > .boxBody')[0];
			
			if(!Foxtrick.util.layout.isStandard(doc))
				var subMenuContent = doc.querySelectorAll('.subMenu > .subMenuBox')[0];
			
			//no navigation sidebar, like forums
			if(subMenuContent === undefined)
				return;

			var entries = [];

			Foxtrick.map(function(subMenuEntry){
				if(subMenuEntry.tagName === undefined)
					return;

				if(subMenuEntry.tagName === 'H3'){
					var entry = {};
					entry.text = subMenuEntry.textContent;
					entry.tag = 'h3';
					entries.push( entry );
				}

				if(subMenuEntry.tagName === 'UL'){
					var links = subMenuEntry.getElementsByTagName('a');

					Foxtrick.map(function(link){
						var entry = {};
						entry.tag = 'a';
						entry.text = link.textContent;
						entry.link = link.href.replace(/^.*\/\/[^\/]+/, '');
						entries.push( entry );
					}, links);
				}
			}, subMenuContent.childNodes);

			if(menuStructure[activeLanguage] === undefined)
				menuStructure[activeLanguage] = {};

			//save date too, some menus might get unreliable and we might invalidate them after weeks or so
			var pageEntry = {
				updated: (new Date()).getTime(),
				content: entries
			}
			menuStructure[activeLanguage][doc.location.pathname] = pageEntry;
			Foxtrick.localSet('htMenuStructure.' + Foxtrick.modules['Core'].getSelfTeamInfo().teamId, menuStructure);
		};

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
