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
	NEW_AFTER_VERSION: "0.4.9",
	LATEST_CHANGE:"Fix for latest forum change",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

	init : function() {
	},

	run : function(page, doc) {
		try{
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

			var count=0;
			for ( var j=0; j<Foxtrick.run_on_cur_page.length; ++j ) {
				if (!Foxtrick.run_on_cur_page[j].module.MODULE_CATEGORY
					|| Foxtrick.run_on_cur_page[j].page=='all' || Foxtrick.run_on_cur_page[j].page=='all_late'
					/*|| !Foxtrick.run_on_cur_page[j].module.MODULE_CATEGORY=='links'*/ ) continue;
				var in_list=false;
				for ( var k=0; k<j; ++k ) {
					if (Foxtrick.run_on_cur_page[k].module==Foxtrick.run_on_cur_page[j].module) {in_list=true; break;}
				}
				if (in_list) continue;
				++count;
				//dump (Foxtrick.run_on_cur_page[j].page+' '+Foxtrick.run_on_cur_page[j].module.MODULE_NAME+'\n');
			}
			if (count==0) return;

			Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "last", "", column);
			//var content=doc.getElementById('idFoxtrickPrefs');
			//content.style.display='none';

			// clickable header
			var header = doc.getElementById('foxtrick_OnPagePrefs_box').getElementsByTagName("h2")[0];
			var pn = header.parentNode;
			var header = pn.removeChild(header);
			var div = doc.createElement("div");
			div.appendChild(header);
			div.setAttribute("style","cursor:pointer;");
			Foxtrick.addEventListenerChangeSave(div, "click", FoxtrickOnPagePrefs.HeaderClick, false );
			pn.insertBefore(div,pn.firstChild);

			var div=doc.getElementById('foxtrick_OnPagePrefs_box').firstChild;
			div.setAttribute("id","foxtrick_OnPagePrefs_headdiv");
			div.setAttribute("class","boxHead ft_sidebarBoxCollapsed");
			if (Foxtrick.isRTLLayout(doc)) div.setAttribute("class","boxHead ft_sidebarBoxCollapsed_rtl");
		}
		catch (e) {
			dump('FoxtrickOnPagePrefs '+e+'\n');
		}
	},

	change : function(doc) {
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
					alldivheader.setAttribute("style","cursor:pointer;");
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
					linkdivheader.setAttribute("style","cursor:pointer;");
					linkdivheader.setAttribute("class","ft_sidebarBoxCollapsed");
					if (Foxtrick.isRTLLayout(doc)) linkdivheader.setAttribute("class","ft_sidebarBoxCollapsed_rtl");
					Foxtrick.addEventListenerChangeSave(linkdivheader, "click", FoxtrickOnPagePrefs.HeaderClickLinks, false );
					linkdivouter.appendChild(linkdivheader);
					var linkdivinner = doc.createElement('div');
					linkdivinner.setAttribute("style","display:none;");
					linkdivinner.setAttribute("id","onpageprefs_linkdivinner");
					linkdivouter.appendChild(linkdivinner);
					var linkdiv_count = 0;

					// modules
					var modules_entries = new Array();
					var modules_entries_all = new Array();
					var modules_entries_links = new Array();
					for ( var j=0; j<Foxtrick.run_on_cur_page.length; ++j ) {
						if (!Foxtrick.run_on_cur_page[j].module.MODULE_CATEGORY) continue;

						var in_list=false;
						for ( var k=0; k<j; ++k ) {
							if (Foxtrick.run_on_cur_page[k].module==Foxtrick.run_on_cur_page[j].module) {in_list=true; break;}
						}
						if (in_list) continue;

						// add options
						var entry = FoxtrickPrefsDialogHTML._normalModule(doc, Foxtrick.run_on_cur_page[j].module,true);
						if (Foxtrick.run_on_cur_page[j].module.OPTIONS != null) {
							entry.appendChild(FoxtrickPrefsDialogHTML._checkboxModule(doc, Foxtrick.run_on_cur_page[j].module, entry, true));
						}
						if (Foxtrick.run_on_cur_page[j].module.RADIO_OPTIONS != null) {
							entry.appendChild(FoxtrickPrefsDialogHTML._radioModule(doc, Foxtrick.run_on_cur_page[j].module, entry, true));
						}

						if (Foxtrick.run_on_cur_page[j].page=='all' || Foxtrick.run_on_cur_page[j].page=='all_late') {
							modules_entries_all.push(entry);
							++alldiv_count;
						}
						else if(Foxtrick.run_on_cur_page[j].module.MODULE_CATEGORY=='links')	{
							modules_entries_links.push(entry);
							++linkdiv_count;
						}
						else modules_entries.push(entry);
							ownBoxBody.appendChild( entry );
					}
					modules_entries.sort(FoxtrickPrefsDialogHTML.entry_sortfunction);
					for ( var i=0;i<modules_entries.length;++i)	ownBoxBody.appendChild( modules_entries[i] );
					modules_entries_all.sort(FoxtrickPrefsDialogHTML.entry_sortfunction);
					for ( var i=0;i<modules_entries_all.length;++i)	alldivinner.appendChild( modules_entries_all[i] );
					modules_entries_links.sort(FoxtrickPrefsDialogHTML.entry_sortfunction);
					for ( var i=0;i<modules_entries_links.length;++i)	linkdivinner.appendChild( modules_entries_links[i] );

					if (linkdiv_count>0) {
						ownBoxBody.appendChild( linkdivouter );
					}
					if (alldiv_count>0) {
						ownBoxBody.appendChild( alldivouter );
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
			dump('OnPagePrefClick: '+e+'\n');
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
			dump('OnPagePrefClick: '+e+'\n');
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
			dump('OnPagePrefClick: '+e+'\n');
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
			dump('OnPagePrefClick: '+e+'\n');
		}
	},

	ClickCapture : function(ev) {
		try {
			var hasonclick=ev.originalTarget.getAttribute('onclick')!=null;
			var haspostback=ev.originalTarget.href && ev.originalTarget.href.search('javascript')!=-1;
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
			dump('OnPagePrefClick: '+e+'\n');
		}
	}
}
