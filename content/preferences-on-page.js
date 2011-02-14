////////////////////////////////////////////////////////////////////////////////
/**
 * HTML-OnPage -Preference dialog functions.
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickOnPagePrefs = {

	MODULE_NAME : "OnPagePrefs",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MAIN,
	PAGES : new Array('all_late'),

	run : function(page, doc) {
		try {
			if (doc.getElementById('ctl00_ucSubMenu_txtUserName')) return;
			if (doc.getElementById('ctl00_ctl00_pnlAdminMode')) return;

			var column;
			if (doc.getElementById('sidebar')) column='right';
			else {
				if (Foxtrick.isModuleFeatureEnabled( FoxtrickHeaderFix, "FixLeft") && doc.location.href.search(/forum/i)==-1) return;
				column='left';
			}
			// add box
			var ownBoxBody = doc.createElement("div");
			var header = Foxtrickl10n.getString("foxtrick.onpagepreferences" );
			var ownBoxId = "foxtrick_OnPagePrefs_box";
			var ownBoxBodyId = "foxtrick_OnPagePrefs_inner";
			ownBoxBody.setAttribute( "id", ownBoxBodyId );

			// To see whether there are any modules that will run on this page.
			var hasModule = false;
			for (var page in Foxtrick.ht_pages) {
				if (Foxtrick.isPage(Foxtrick.ht_pages[page], doc)) {
					if (page == "all" || page == "all_late") {
						// If they run on all pages, ignore them.
						continue;
					}
					for (var j in Foxtrick.may_run_on_page[page]) {
						if (Foxtrick.may_run_on_page[page][j].MODULE_CATEGORY) {
							// Found a module that runs on current page,
							// no need to search any more.
							hasModule = true;
							break;
						}
					}
					if (hasModule) {
						break;
					}
				}
			}
			if (hasModule === false) {
				return;
			}

			Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "last", "", column);
			var box=doc.getElementById(ownBoxId);
			if (!box)
				return; // return quietly if no sidebar is found
			if (Foxtrick.isStandardLayout(doc))
				Foxtrick.addClass(box,'ft_onpage_prefs_std');
			else
				Foxtrick.addClass(box,'ft_onpage_prefs_simple');

			// clickable header
			var header = doc.getElementById('foxtrick_OnPagePrefs_box').getElementsByTagName("h2")[0];
			var pn = header.parentNode;
			var header = pn.removeChild(header);
			var div = doc.createElement("div");
			div.appendChild(header);
			Foxtrick.addEventListenerChangeSave(div, "click", FoxtrickOnPagePrefs.HeaderClick, false );
			pn.insertBefore(div,pn.firstChild);

			var div=doc.getElementById('foxtrick_OnPagePrefs_box').firstChild;
			div.setAttribute("id","foxtrick_OnPagePrefs_headdiv");
			div.setAttribute("class","boxHead ft_sidebarBoxCollapsed");
			if (Foxtrick.isRTLLayout(doc)) div.setAttribute("class","boxHead ft_sidebarBoxCollapsed_rtl");
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},


	HeaderClick : function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			var headdiv = doc.getElementById('foxtrick_OnPagePrefs_headdiv');

			if ( headdiv.className.search("ft_sidebarBoxCollapsed") != -1 ) {
				headdiv.setAttribute("class","boxHead ft_sidebarBoxUnfolded");
				if (Foxtrick.isRTLLayout(doc)) headdiv.setAttribute("class","boxHead ft_sidebarBoxUnfolded_rtl");
				var ownBox = doc.getElementById('foxtrick_OnPagePrefs_inner');
				var ownBoxBody = doc.createElement("div");
				var ownBoxBodyId = "idFoxtrickPrefs";
				ownBoxBody.setAttribute( "id", ownBoxBodyId );
				ownBox.appendChild(ownBoxBody);

				if (!doc.getElementById('foxtrick_prefs_save')) {
					doc.addEventListener( "submit", FoxtrickOnPagePrefs.SubmitCapture, true );
					doc.addEventListener( "click", FoxtrickOnPagePrefs.ClickCapture, true );
					// save
					var prefsavediv=doc.createElement('div');
					prefsavediv.setAttribute('id','foxtrick_prefs_save');
					ownBoxBody.appendChild(prefsavediv);

					var prefsave=doc.createElement('input');
					prefsave.setAttribute('id','foxtrick_prefsave');
					prefsave.setAttribute('type','button');
					prefsave.setAttribute('value',Foxtrickl10n.getString("foxtrick.prefs.buttonSave"));
					prefsave.addEventListener('click',FoxtrickPrefsDialogHTML.save,false);
					prefsavediv.appendChild(prefsave);

					var alldivouter = doc.createElement('div');
					alldivouter.setAttribute("class","onpageprefs_extraprefs");
					var alldivheader = doc.createElement('h3');
					alldivheader.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.modules_allpages")));
					alldivheader.setAttribute("class","ft_sidebarBoxCollapsed");
					if (Foxtrick.isRTLLayout(doc)) alldivheader.setAttribute("class","ft_sidebarBoxCollapsed_rtl");
					Foxtrick.addEventListenerChangeSave(alldivheader, "click", FoxtrickOnPagePrefs.HeaderClickModulesAll, false );
					alldivouter.appendChild(alldivheader);
					var alldivinner = doc.createElement('div');
					alldivinner.setAttribute("style","display:none;");
					alldivinner.setAttribute("id","onpageprefs_alldivinner");
					alldivouter.appendChild(alldivinner);
					var alldiv_count = 0;
					var linkdivouter = doc.createElement('div');
					linkdivouter.setAttribute("class","onpageprefs_extraprefs");
					var linkdivheader = doc.createElement('h3');
					linkdivheader.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.LinksTab")));
					linkdivheader.setAttribute("class","ft_sidebarBoxCollapsed");
					if (Foxtrick.isRTLLayout(doc)) linkdivheader.setAttribute("class","ft_sidebarBoxCollapsed_rtl");
					Foxtrick.addEventListenerChangeSave(linkdivheader, "click", FoxtrickOnPagePrefs.HeaderClickLinks, false );
					linkdivouter.appendChild(linkdivheader);
					var linkdivinner = doc.createElement('div');
					linkdivinner.setAttribute("style","display:none;");
					linkdivinner.setAttribute("id","onpageprefs_linkdivinner");
					linkdivouter.appendChild(linkdivinner);
					var linkdiv_count = 0;

					var modules = [];
					for (var page in Foxtrick.ht_pages) {
						if (Foxtrick.isPage(Foxtrick.ht_pages[page], doc)) {
							for (var j in Foxtrick.may_run_on_page[page]) {
								modules.push({ page : page, module : Foxtrick.may_run_on_page[page][j] });
							}
						}
					}

					// modules
					var modules_entries = new Array();
					var modules_entries_all = new Array();
					var modules_entries_links = new Array();
					for (var j = 0; j < modules.length; ++j) {
						var module = modules[j].module;
						var page = modules[j].page;
						if (!module.MODULE_CATEGORY) {
							continue;
						}

						var in_list = false;
						for (var k = 0; k < j; ++k) {
							if (modules[k].module == module) {
								in_list = true;
								break;
							}
						}
						if (in_list) {
							continue;
						}

						// add options
						var entry = FoxtrickPrefsDialogHTML._normalModule(doc, module, true);
						if (module.OPTIONS != null) {
							entry.appendChild(FoxtrickPrefsDialogHTML._checkboxModule(doc, module, entry, true));
						}
						if (module.RADIO_OPTIONS != null) {
							entry.appendChild(FoxtrickPrefsDialogHTML._radioModule(doc, module, entry, true));
						}

						if (page == "all" || page == "all_late") {
							modules_entries_all.push(entry);
							++alldiv_count;
						}
						else if (module.MODULE_CATEGORY == "links") {
							modules_entries_links.push(entry);
							++linkdiv_count;
						}
						else {
							modules_entries.push(entry);
						}
						ownBoxBody.appendChild(entry);
					}
					modules_entries.sort(FoxtrickPrefsDialogHTML.entry_sortfunction);
					for(var i = 0; i < modules_entries.length; ++i) {
						ownBoxBody.appendChild(modules_entries[i]);
					}
					modules_entries_all.sort(FoxtrickPrefsDialogHTML.entry_sortfunction);
					for (var i = 0; i < modules_entries_all.length; ++i) {
						alldivinner.appendChild(modules_entries_all[i]);
					}
					modules_entries_links.sort(FoxtrickPrefsDialogHTML.entry_sortfunction);
					for (var i = 0; i < modules_entries_links.length; ++i) {
						linkdivinner.appendChild(modules_entries_links[i]);
					}

					if (linkdiv_count > 0) {
						ownBoxBody.appendChild(linkdivouter);
					}
					if (alldiv_count > 0) {
						ownBoxBody.appendChild(alldivouter);
					}
				}
			}
			else {
				headdiv.setAttribute("class","boxHead ft_sidebarBoxCollapsed");
				if (Foxtrick.isRTLLayout(doc)) headdiv.setAttribute("class","boxHead ft_sidebarBoxCollapsed_rtl");
				var content = doc.getElementById('idFoxtrickPrefs');
				if (content) {
					content.parentNode.removeChild(content);
				}
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	HeaderClickModulesAll : function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			var div = doc.getElementById('onpageprefs_alldivinner');
			var header = ev.target;
			if ( header.className.search("ft_sidebarBoxCollapsed") != -1 ) {
				header.setAttribute("class","ft_sidebarBoxUnfolded");
				if (Foxtrick.isRTLLayout(doc)) header.setAttribute("class","ft_sidebarBoxUnfolded_rtl");
				div.style.display = 'inline';
			}
			else {
				header.setAttribute("class","ft_sidebarBoxCollapsed");
				if (Foxtrick.isRTLLayout(doc)) header.setAttribute("class","ft_sidebarBoxCollapsed_rtl");
				div.style.display = 'none';
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	HeaderClickLinks : function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			var div = doc.getElementById('onpageprefs_linkdivinner');
			var header = ev.target;
			if ( header.className.search("ft_sidebarBoxCollapsed") != -1 ) {
				header.setAttribute("class","ft_sidebarBoxUnfolded");
				if (Foxtrick.isRTLLayout(doc)) header.setAttribute("class","ft_sidebarBoxUnfolded_rtl");
				div.style.display = 'inline';
			}
			else {
				header.setAttribute("class","ft_sidebarBoxCollapsed");
				if (Foxtrick.isRTLLayout(doc)) header.setAttribute("class","ft_sidebarBoxCollapsed_rtl");
				div.style.display = 'none';
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	SubmitCapture : function(ev) {
		try {
			var doc = ev.target.ownerDocument;
			var content = doc.getElementById('idFoxtrickPrefs');
			if (content) {
				content.parentNode.removeChild(content);
				var headdiv = doc.getElementById('foxtrick_OnPagePrefs_headdiv');
				headdiv.setAttribute("class","boxHead ft_sidebarBoxCollapsed");
				if (Foxtrick.isRTLLayout(doc)) headdiv.setAttribute("class","boxHead ft_sidebarBoxCollapsed_rtl");
				Foxtrick.dump ('onclick/submit remove onpagepref\n');
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	ClickCapture : function(ev) {
		try {
			var hasonclick=ev.target.getAttribute('onclick')!=null;
			var haspostback=ev.target.href && ev.target.href.search('javascript')!=-1;
			//dump('ClickCapture - hasonclick: ' +hasonclick+' haspostback: '+haspostback+'- return: '+!(hasonclick || haspostback)+'\n');
			if ( !(hasonclick || haspostback)) return;
			var doc = ev.target.ownerDocument;
			var content = doc.getElementById('idFoxtrickPrefs');
			if (content) {
				content.parentNode.removeChild(content);
				var headdiv = doc.getElementById('foxtrick_OnPagePrefs_headdiv');
				headdiv.setAttribute("class","boxHead ft_sidebarBoxCollapsed");
				if (Foxtrick.isRTLLayout(doc)) headdiv.setAttribute("class","boxHead ft_sidebarBoxCollapsed_rtl");
				Foxtrick.dump ('onclick/submit remove onpagepref\n');
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	}
}
