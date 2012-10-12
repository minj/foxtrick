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

		Foxtrick.log("Is loggin page:" + Foxtrick.isLoginPage(doc));

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
		var bg_re = new RegExp(/#menu\s*{\s*background-color:([^;]+)/gi);
		var bg_matches = bg_re.exec(css);
		
		if(bg_matches && bg_matches[1])
			Foxtrick.util.inject.css(doc, '.ft-drop-down-submenu, .ft-drop-down-submenu li { background-color: ' + bg_matches[1]+ ' !important;}');

		var hover_re = new RegExp(/#menu\s*>\s*a:hover\s*{\s*color:\s*([^;]+);\s*background-color:\s*([^;]+)/gi);
		var hover_matches = hover_re.exec(css);

		if(hover_matches && hover_matches[1] && hover_matches[2]){
			var hover_bg = hover_matches[2];
			var rgb = Foxtrick.util.color.hexToRgb(hover_bg);
			var hsv = Foxtrick.util.color.rgbToHsv(rgb[0], rgb[1], rgb[2]);
			hsv[1] = (hsv[1] - 0.2 >= 0)?hsv[1] - 0.2:0;
			rgb = Foxtrick.util.color.hsvToRgb(hsv[0], hsv[1], hsv[2]);
			Foxtrick.log(rgb);

			if(hover_matches && hover_matches[1] && hover_matches[2])
				Foxtrick.util.inject.css(doc, '#ft-drop-down-menu > li > a:hover, .ft-drop-down-submenu li:hover { color: ' + hover_matches[1] + ' !important; background-color: rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ') !important; }');	
		}




		var activeLanguage = FoxtrickPrefs.getString('htLanguage');

		var learnCurrentPage = function(menuStructure){
			Foxtrick.log('MainMenuDropDown Updating: ' + doc.location.pathname)
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

			menuStructure[activeLanguage][doc.location.pathname] = entries;
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

			//iterate all main menu items
			Foxtrick.map(function(item){
				if(item.id == 'ctl00_ctl00_CPHeader_ucMenu_hypLogout')
					return;

				if(menuStructure[activeLanguage] !== undefined 
					&& menuStructure[activeLanguage][item.href.replace(/^.*\/\/[^\/]+/, '')] !== undefined){
					
					var li = doc.createElement('li');

					var subMenuList = doc.createElement('ul');
					Foxtrick.addClass(subMenuList, "ft-drop-down-submenu");
					
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
							link_link.textContent = entry.text;
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
					}, menuStructure[activeLanguage][item.href.replace(/^.*\/\/[^\/]+/, '')]);

					li.appendChild(item); 			//reposition original link from the #menu
					li.appendChild(subMenuList); 	//the popup
					nav.appendChild(li); 			//attach to #menu
				} else {

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
		});
	}
}
