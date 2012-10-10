Foxtrick.modules['MainMenuDropDown']={
	MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : ['all'],
	OPTIONS : ['OmnitFirstHeader'],
	CSS : Foxtrick.InternalPath + 'resources/css/main-menu-drop-down.css',

	run : function(doc){

		var activeLanguage = FoxtrickPrefs.getString('htLanguage');

		var learnCurrentPage = function(menuStructure){
			Foxtrick.log('MainMenuDropDown Updating: ' + doc.location.pathname)
			var subMenuContent = doc.querySelectorAll('.subMenu > .subMenuBox > .boxBody')[0];
			
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

			var nav = doc.createElement('ul');
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

							//first header basicly repeats the name of the main navigation link
							if(firstHeader &&FoxtrickPrefs.isModuleOptionEnabled('MainMenuDropDown', 'OmnitFirstHeader')){
								firstHeader = false;
								return;
							}
							var h3_li = doc.createElement('li');
							var h3 = doc.createElement('h3');
							h3.textContent = entry.text;
							h3_li.appendChild(h3);
							subMenuList.appendChild(h3_li);

							var link_li = doc.createElement('li');
							var hr = doc.createElement('hr');
							link_li.appendChild(hr);
							subMenuList.appendChild(link_li);
						} 
					}, menuStructure[activeLanguage][item.href.replace(/^.*\/\/[^\/]+/, '')]);

					li.appendChild(item);
					li.appendChild(subMenuList);
					nav.appendChild(li);
				} else {
					var li = doc.createElement('li');
					li.appendChild(item);
					nav.appendChild(li);
				}

				//update
				if(Foxtrick.isPageHref(item.href.replace(/^.*\/\/[^\/]+/, '') +'$', doc.location.href))
					learnCurrentPage(menuStructure);

			}, menuItems);

			//rebuild #menu
			doc.getElementById('menu').insertBefore(nav, doc.getElementById('ctl00_ctl00_CPHeader_ucMenu_hypLogout'));
		});

		
	}
}
