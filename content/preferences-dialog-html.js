/**
 * HTML-Preference dialog functions.
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickPrefsDialogHTML = {

	MODULE_NAME : "PrefsDialogHTML",
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.9.1",
	LATEST_CHANGE:"Fixed ex/importing preferences",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,

	TabNames: {	'main':'MainTab',
				'shortcuts_and_tweaks':'ShortcutsTab',
				'presentation':'PresentationTab',
				'matches':'MatchesTab',
				'forum':'ForumTab',
				'links':'LinksTab',
				'alert':'AlertTab',
				'changes':'ChangesTab',
				'help':'HelpTab',
				'about':'AboutTab'},

	init : function() {
		Foxtrick.registerAllPagesHandler( this );
		if (Foxtrick.BuildFor=='Gecko')
			Foxtrick.reload_css_permanent(Foxtrick.ResourcePath+"resources/css/preferences-dialog-html.css");
	},

	run : function( doc ) {
		try {
			if (doc.location.pathname.search(/^\/$|\/MyHattrick\/|\/Community|Default.aspx\?authCode/)==-1) return;
			if (doc.location.pathname.search(/^\/$|\/MyHattrick|\/Community/)!=-1) {
				FoxtrickPrefsDialogHTML.add_pref_links(doc);
			}
			if (doc.location.href.search(/configure_foxtrick=true/i)!=-1) {
				if (Foxtrick.BuildFor=='Chrome')
					Foxtrick.addStyleSheet(document, Foxtrick.ResourcePath+"resources/css/preferences-dialog-html.css");
				FoxtrickPrefsDialogHTML.show_pref(doc);
			}
			else if (Foxtrick.BuildFor=='Chrome')
				Foxtrick.reload_css_permanent(Foxtrick.ResourcePath+"resources/css/preferences-dialog-html.css");
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	add_pref_links : function( doc) {
		if (doc.getElementById('id_configure_foxtrick')) return;
		try{
		var foxtrick_pref_link = doc.createElement('a');
		foxtrick_pref_link.setAttribute('id','id_configure_foxtrick');
		foxtrick_pref_link.setAttribute('href','/MyHattrick/?configure_foxtrick=true&category=main');
		foxtrick_pref_link.textContent = Foxtrickl10n.getString("foxtrick");
		var li = doc.createElement('li');
		li.appendChild(foxtrick_pref_link);
		if (FoxtrickMain.IsNewVersion) {
			var strong = doc.createElement('strong');
			strong.appendChild(doc.createTextNode(' '+Foxtrickl10n.getString('new')));
			strong.setAttribute('style','color:#FFCC00 !important;' );
			li.appendChild(strong);
			foxtrick_pref_link.setAttribute('href','/MyHattrick/?configure_foxtrick=true&category=changes');
			}
		var ul = doc.getElementById('ctl00_pnlSubMenu').getElementsByTagName('ul');
		if (ul && ul[0]) ul[0].appendChild(li);
		} catch(e) {dump('add_pref_links: '+e);}
	},

	show_pref_header: function (doc) {
		if (doc.getElementById('foxtrick_config')) return;

		Foxtrick.addClass(doc.getElementById("sidebar"), "hidden");
		var mainWrapper=doc.getElementById('mainWrapper');
		if (Foxtrick.isStandardLayout(doc)) mainWrapper.getElementsByTagName('div')[0].style.width='765px';
		else mainWrapper.getElementsByTagName('div')[0].style.width='620px';

		var myhttext=doc.getElementById('ctl00_pnlSubMenu').getElementsByTagName('h2')[0].innerHTML;

		var header = mainWrapper.getElementsByTagName('h2')[0];

		header.innerHTML='<a href="/MyHattrick/">'+header.getElementsByTagName('a')[0].innerHTML+'</a>'; //todo change title

		header.appendChild(doc.createTextNode(' » '));
		var sub_pref_header_foxtrick_sub = doc.createElement('a');
		header.appendChild(sub_pref_header_foxtrick_sub);

		sub_pref_header_foxtrick_sub.innerHTML = "FoxTrick";
		sub_pref_header_foxtrick_sub.setAttribute('href','/MyHattrick/?configure_foxtrick=true&category=main');
		sub_pref_header_foxtrick_sub.setAttribute('id','foxtrick_config');
	},

	show_pref : function( doc ) {
		try {
			// clean up
			FoxtrickPrefsDialogHTML.show_pref_header(doc);
			var mainBody = doc.getElementById('mainBody');
			if (mainBody) {
				var i=0,child = mainBody.firstChild;
				while (child) {var nextChild = child.nextSibling; mainBody.removeChild(child); child = nextChild;}
			}

			var prefdiv=doc.createElement('div');
			prefdiv.setAttribute('id','foxtrick_prefs');
			mainBody.appendChild(prefdiv);


			// save+cancel
			var prefsavediv=doc.createElement('div');
			prefsavediv.setAttribute('id','foxtrick_prefs_save');
			prefdiv.appendChild(prefsavediv);

			var prefsave=doc.createElement('input');
			prefsave.setAttribute('id','foxtrick_prefsave');
			prefsave.setAttribute('type','button');
			//prefsave.setAttribute('disabled','true');
			prefsave.setAttribute('value',Foxtrickl10n.getString("foxtrick.prefs.buttonSave"));
			prefsave.addEventListener('click',FoxtrickPrefsDialogHTML.save,false);
			prefsavediv.appendChild(prefsave);

			/*var prefcancel=doc.createElement('input');
			prefcancel.setAttribute('id','foxtrick_prefcancel');
			prefcancel.setAttribute('type','button');
			prefcancel.setAttribute('value',Foxtrickl10n.getString("foxtrick.prefs.buttonCancel"));
			prefcancel.Foxtrick.addEventListenerChangeSave('click',FoxtrickPrefsDialogHTML.cancel,false);
			prefsavediv.appendChild(prefcancel);*/

			var prefdiv_body=doc.createElement('div');
			prefdiv_body.setAttribute('id','foxtrick_prefs_body');
			prefdiv.appendChild(prefdiv_body);

			// tab heads
			var preftabheaddiv=doc.createElement('div');
			preftabheaddiv.setAttribute('id','foxtrick_prefs_head');
			prefdiv_body.appendChild(preftabheaddiv);


			// tabs
			var preftabdiv=doc.createElement('div');
			preftabdiv.setAttribute('id','foxtrick_preftabs');
			prefdiv_body.appendChild(preftabdiv);

			FoxtrickPrefsDialogHTML.add_tab(doc, Foxtrick.moduleCategories.MAIN);
			FoxtrickPrefsDialogHTML.add_tab(doc, Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS);
			FoxtrickPrefsDialogHTML.add_tab(doc, Foxtrick.moduleCategories.PRESENTATION);
			FoxtrickPrefsDialogHTML.add_tab(doc, Foxtrick.moduleCategories.MATCHES);
			FoxtrickPrefsDialogHTML.add_tab(doc, Foxtrick.moduleCategories.FORUM);
			FoxtrickPrefsDialogHTML.add_tab(doc, Foxtrick.moduleCategories.LINKS);
			FoxtrickPrefsDialogHTML.add_tab(doc, Foxtrick.moduleCategories.ALERT);
			FoxtrickPrefsDialogHTML.add_tab(doc, Foxtrick.moduleCategories.CHANGES);
			FoxtrickPrefsDialogHTML.add_tab(doc, Foxtrick.moduleCategories.HELP);
			FoxtrickPrefsDialogHTML.add_tab(doc, Foxtrick.moduleCategories.ABOUT);


			// bottom save+cancel
			var prefsavediv2=doc.createElement('div');
			prefsavediv2.setAttribute('id','foxtrick_prefs_save');
			prefdiv.appendChild(prefsavediv2);

			var prefsave2=doc.createElement('input');
			prefsave2.setAttribute('id','foxtrick_prefsave_bottom');
			prefsave2.setAttribute('type','button');
			//prefsave.setAttribute('disabled','true');
			prefsave2.setAttribute('value',Foxtrickl10n.getString("foxtrick.prefs.buttonSave"));
			prefsave2.addEventListener('click',FoxtrickPrefsDialogHTML.save,false);
			prefsavediv2.appendChild(prefsave2);

			// highlight hashed
			if (doc.location.hash) {
				var highlight=doc.location.hash.substr(1);
				Foxtrick.dump('highlight: '+highlight+'\n');
				var element=doc.getElementById(highlight);
				var parent=element.parentNode.parentNode;
				parent.setAttribute('class', parent.getAttribute('class')+' ft_pref_highlight');
				var tab = 'main';
				if (parent.parentNode.parentNode.getAttribute('id')=='foxtrick_preftabs')
					tab = parent.parentNode.getAttribute('id');
				this.show_tab(null,doc,tab);
				doc.location.hash=doc.location.hash;
			}

			// highlight elements: url ... &highlight=id1+id2+id3
			if (doc.location.href.search(/highlight=/i)!=-1) {
					var highlightlist=doc.location.href.match(/highlight=([\w\.\+]+)/);
					var highlight=highlightlist[1].match(/([\w\.]+)/g);
					for (var i=0;i<highlight.length;++i) {
						var element=doc.getElementById(highlight[i]);
						var parent=element.parentNode.parentNode;
						parent.setAttribute('class', parent.getAttribute('class')+' ft_pref_highlight');
					}
					var tab = 'main';
					if (parent.parentNode.parentNode.getAttribute('id')=='foxtrick_preftabs')
						tab = parent.parentNode.getAttribute('id');
					this.show_tab(null,doc,tab);
					doc.location.hash='#'+highlight[i-1];
			}

		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	show_tab : function( ev, doc, tab ) {
		if (ev) {
			var doc = ev.target.ownerDocument;
			var tab = ev.target.getAttribute('tab');
		}

		var foxtrick_prefs_head = doc.getElementById('foxtrick_prefs_head').childNodes;
		var foxtrick_preftabs = doc.getElementById('foxtrick_preftabs').childNodes;
		if (tab=='changes') FoxtrickMain.IsNewVersion=false;

		for (var i=0;i<foxtrick_preftabs.length;++i) {
			if (tab==foxtrick_preftabs[i].getAttribute('id')) {
				Foxtrick.removeClass(foxtrick_preftabs[i], "hidden");
			}
			else {
				Foxtrick.addClass(foxtrick_preftabs[i], "hidden");
			}
			if (tab==foxtrick_prefs_head[i].getAttribute('tab'))
				foxtrick_prefs_head[i].setAttribute('class','ft_pref_head ft_pref_head_active');
			else foxtrick_prefs_head[i].setAttribute('class','ft_pref_head');
		}
	},


	tabhead_mouseover : function( ev ) {
		var doc = ev.target.ownerDocument;
		doc.defaultView.status = '/MyHattrick/?configure_foxtrick=true&category='+ev.target.getAttribute('tab');
	},


	save : function( ev ) { //dump('pref save\n');
		try {
			var doc = ev.target.ownerDocument;
			if (Foxtrick.BuildFor=='Chrome') FoxtrickPrefs.do_dump = false;

			var full_prefs = (doc.getElementById("htLanguage")!=null); // check if full pref page (not newversionquickset or onpageprefs)

			for ( var i in Foxtrick.modules ) {
				var module = Foxtrick.modules[i];

				if (!module.MODULE_CATEGORY || module.MODULE_CATEGORY==Foxtrick.moduleCategories.MAIN ) {
					// if main, set default and again right below if needed!
					//Foxtrick.dump('save '+module.MODULE_NAME+' : '+module.DEFAULT_ENABLED+'\n');
					if (full_prefs) FoxtrickPrefs.setModuleEnableState(module.MODULE_NAME, module.DEFAULT_ENABLED);
					continue;
				}
				if (doc.getElementById(module.MODULE_NAME)) {
					var checked = doc.getElementById(module.MODULE_NAME).checked;
					FoxtrickPrefs.setModuleEnableState(module.MODULE_NAME, checked);
					//Foxtrick.dump('save '+module.MODULE_NAME+' : '+checked+'\n');
				}
				else continue;

				if (module.RADIO_OPTIONS != null) {
					var radiogroup = doc.getElementById(module.MODULE_NAME + '_radio' ).getElementsByTagName('input');
					for (var j = 0; j < radiogroup.length; j++) {
						if (radiogroup[j].checked) {
							FoxtrickPrefs.setModuleValue( module.MODULE_NAME, j );
							break;
						}
					}
				}
				if (module.OPTIONS != null) {
					for (var i = 0; i < module.OPTIONS.length; i++) {
						var key,title;
						if (module.OPTIONS[i]["key"]==null){
							key = module.OPTIONS[i];
						}
						else {
							key = module.OPTIONS[i]["key"];
						}
						FoxtrickPrefs.setModuleEnableState(module.MODULE_NAME+'.'+key, doc.getElementById(module.MODULE_NAME+'.'+key).checked);

						if (module.OPTION_TEXTS != null && module.OPTION_TEXTS
						&& (!module.OPTION_TEXTS_DISABLED_LIST || !module.OPTION_TEXTS_DISABLED_LIST[i])
						&& doc.getElementById(module.MODULE_NAME+'.'+key+'_text')) {

							FoxtrickPrefs.setModuleOptionsText( module.MODULE_NAME + "." + key+ "_text",
														doc.getElementById(module.MODULE_NAME+'.'+key+'_text').value );
						}
					}
				}
			}

			if (doc.getElementById("OnPagePrefs")) FoxtrickPrefs.setBool("module.OnPagePrefs.enabled", doc.getElementById("OnPagePrefs").checked);

			// check if not whole prefs. in that case stop here
			if (!full_prefs) {
				if (Foxtrick.BuildFor=='Chrome') {
					FoxtrickPrefs.do_dump = true;
					//Foxtrick.reload_module_css(document);
					portsetpref.postMessage({reqtype: "get_css_text", css_filelist: Foxtrick.cssfiles});
					portsetpref.postMessage({reqtype: "save_prefs", prefs: FoxtrickPrefs.pref, reload:true});
				}
				else { FoxtrickMain.init();
					doc.location.reload();
				}
				return;
			}

			// ReadHtPrefs

			var readHtPrefs = doc.getElementById("ReadHtPrefs").checked;
			FoxtrickPrefs.setBool("module.ReadHtPrefs.enabled", readHtPrefs);

			if (!readHtPrefs) {
				FoxtrickPrefs.setString("htLanguage", doc.getElementById("htLanguage").value);
				FoxtrickPrefs.setString("htCountry", document.getElementById("htCountry").value);
				Foxtrick.util.currency.setByCode(document.getElementById("htCurrency").value);
				FoxtrickPrefs.setString("htDateformat", doc.getElementById("htDateformat").value);
			}

			//Currency Converter
			if (doc.getElementById("CurrencyConverter"))
				FoxtrickPrefs.setBool("module.CurrencyConverter.enabled", doc.getElementById("CurrencyConverter").checked);
			FoxtrickPrefs.setString("htCurrencyTo", doc.getElementById("htCurrencyTo").value);

			//Statusbar
			FoxtrickPrefs.setBool("statusbarshow", doc.getElementById("statusbarpref").checked);

			//disable
			FoxtrickPrefs.setBool("disableOnStage", doc.getElementById("stagepref").checked);
			FoxtrickPrefs.setBool("disableTemporary", doc.getElementById("disableTemporary").checked);

			// additional options
			FoxtrickPrefs.setBool("smallcopyicons", doc.getElementById("smallcopyicons").checked);


			FoxtrickPrefs.setBool("SavePrefs_Prefs", doc.getElementById("saveprefsid").checked);
			FoxtrickPrefs.setBool("SavePrefs_Notes", doc.getElementById("savenotesid").checked);


			FoxtrickPrefs.setBool("DisplayHTMLDebugOutput", doc.getElementById("DisplayHTMLDebugOutput").checked);

			if (Foxtrick.BuildFor=='Chrome') {
				FoxtrickPrefs.do_dump = true;
				//Foxtrick.reload_module_css(document);
				portsetpref.postMessage({reqtype: "get_css_text", css_filelist: Foxtrick.cssfiles});
				portsetpref.postMessage({reqtype: "save_prefs", prefs: FoxtrickPrefs.pref, reload:true});
			}
			else {
				FoxtrickMain.init();
				doc.location.reload();
			}
			//dump('end save\n');
		} catch (e) {
			if (Foxtrick.BuildFor=='Chrome') FoxtrickPrefs.do_dump = true;
			Foxtrick.dump ('FoxtrickPrefsDialogHTML->save: '+e+'\n');
		}
	},

	cancel : function( ev ) {
		var doc = ev.target.ownerDocument;
		doc.location.href="/MyHattrick/?configure_foxtrick=true&status=canceled";
	},

	selectfile : function( ev ) {
		var doc = ev.target.ownerDocument;
		var file = Foxtrick.selectFile(doc.defaultView);
		if (file != null) {doc.getElementById(ev.target.getAttribute('inputid')).value='file://' + (file)};
	},

	playsound : function( ev ) {
		var doc = ev.target.ownerDocument;
		Foxtrick.playSound(doc.getElementById('alertsoundurlpref').value);
	},

	add_tab : function( doc, category ) {
		try {
			var preftabheaddiv = doc.getElementById('foxtrick_prefs_head');
			var preftabdiv = doc.getElementById('foxtrick_preftabs');
			var headstr = Foxtrickl10n.getString("foxtrick.prefs."+FoxtrickPrefsDialogHTML.TabNames[category]);

			var preftabhead=doc.createElement('div');
			preftabhead.setAttribute('tab',category);
			preftabhead.setAttribute('class','ft_pref_head');
			Foxtrick.addEventListenerChangeSave(preftabhead, 'click',FoxtrickPrefsDialogHTML.show_tab,false);
			Foxtrick.addEventListenerChangeSave(preftabhead, 'mouseover',FoxtrickPrefsDialogHTML.tabhead_mouseover,false);
			preftabhead.appendChild(doc.createTextNode(headstr));
			preftabheaddiv.appendChild(preftabhead);

			var preftab=doc.createElement('div');
			preftab.setAttribute('id',category);
			Foxtrick.addClass(preftab, "hidden");
			preftabdiv.appendChild(preftab);

			var active_tab='main';
			try {
			if (doc.location.href.search(/category=/i)!=-1) {
				active_tab=doc.location.href.match(/category=(\w+)/i)[1];
				if (active_tab=='changes') FoxtrickMain.IsNewVersion=false;
			}
			} catch (e){}
			if (category==active_tab) {
				preftabhead.setAttribute('class','ft_pref_head ft_pref_head_active');
				Foxtrick.removeClass(preftab, "hidden");
			}

			if (category=='main') {
				FoxtrickPrefsDialogHTML.fill_main_list( doc );
			}
			else if (category=='changes') {
				FoxtrickPrefsDialogHTML.fill_changes_list( doc );
			}
			else if (category=='help') {
				FoxtrickPrefsDialogHTML.fill_help_list( doc );
			}
			else if (category=='about') {
				FoxtrickPrefsDialogHTML.fill_about_list( doc );
			}
			else FoxtrickPrefsDialogHTML.fill_list( doc, category );
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	fill_main_list : function(doc) {
		try {
			var preftab = doc.getElementById('main');

			var header = this._panelHeader(doc, "main");
			preftab.appendChild(header);

			// basic preferences
			var basicPrefs = this._emptyModule(doc, Foxtrickl10n.getString("foxtrick.prefs.basicPreferences"));
			preftab.appendChild(basicPrefs);

			var basicTable = doc.createElement("table");
			basicPrefs.appendChild(basicTable);

			var basicTable1 = doc.createElement("tr");
			var basicTable2 = doc.createElement("tr");
			var basicTable3 = doc.createElement("tr");
			var basicTable4 = doc.createElement("tr");
			var basicTable5 = doc.createElement("tr");

			basicTable.appendChild(basicTable1);
			basicTable.appendChild(basicTable2);
			basicTable.appendChild(basicTable3);
			basicTable.appendChild(basicTable4);
			basicTable.appendChild(basicTable5);

			// ReadHtPrefs
			var basicTable1_1 = doc.createElement("td");
			basicTable1.appendChild(basicTable1_1);
			basicTable1_1.setAttribute("colspan", 2);
			var readHtPrefs = FoxtrickPrefs.getBool("module.ReadHtPrefs.enabled");
			var readHtPrefsCheck = this._getCheckBox(doc, "ReadHtPrefs", Foxtrickl10n.getString("foxtrick.ReadHtPrefs.desc"), "", readHtPrefs);
			basicTable1_1.appendChild(readHtPrefsCheck);

			// language
			var basicTable2_1 = doc.createElement("td");
			basicTable2_1.textContent = Foxtrickl10n.getString("foxtrick.prefs.captionHTLanguage");
			basicTable2.appendChild(basicTable2_1);

			var basicTable2_2 = doc.createElement("td");
			basicTable2.appendChild(basicTable2_2);
			var languageSelect = doc.createElement("select");
			basicTable2_2.appendChild(languageSelect);
			languageSelect.id = "htLanguage";
			var htLocales = [];
			for (var i in Foxtrickl10n.htLanguagesXml) {
				var desc = Foxtrickl10n.htLanguagesXml[i].getElementsByTagName("language")[0].getAttribute("desc");
				htLocales.push({ name: i, desc: desc });
			}
			htLocales.sort(function(a, b) { return a.desc.localeCompare(b.desc); });
			var selectedLang = FoxtrickPrefs.getString("htLanguage");
			for (var i in htLocales) {
				var locale = htLocales[i];
				var item = doc.createElement("option");
				item.id = "htLanguage-" + locale.name;
				item.setAttribute("value", locale.name);
				item.textContent = locale.desc;
				if (selectedLang == locale.name) {
					item.selected = "selected"
				}
				languageSelect.appendChild(item);
			}

			// country
			basicTable3_1 = doc.createElement("td");
			basicTable3.appendChild(basicTable3_1);
			basicTable3_1.textContent = Foxtrickl10n.getString("foxtrick.prefs.captionHTCountry");

			basicTable3_2 = doc.createElement("td");
			basicTable3.appendChild(basicTable3_2);
			var countrySelect = Foxtrick.getSelectBoxFromXML3(doc, Foxtrick.XMLData.League, "EnglishName", FoxtrickPrefs.getString("htCountry"));
			basicTable3_2.appendChild(countrySelect);
			countrySelect.id = "htCountry";

			// currency
			basicTable4_1 = doc.createElement("td");
			basicTable4.appendChild(basicTable4_1);
			basicTable4_1.textContent = Foxtrickl10n.getString("foxtrick.prefs.captionHTCurrency");

			basicTable4_2 = doc.createElement("td");
			basicTable4.appendChild(basicTable4_2);
			var currencySelect = Foxtrick.getSelectBoxFromXML2(doc, Foxtrick.XMLData.htCurrencyXml, "hattrickcurrencies/currency", "name", "code", Foxtrick.util.currency.getCode());
			basicTable4_2.appendChild(currencySelect);
			currencySelect.id = "htCurrency";

			// date format
			basicTable5_1 = doc.createElement("td");
			basicTable5.appendChild(basicTable5_1);
			basicTable5_1.textContent = Foxtrickl10n.getString("foxtrick.prefs.captionHTDateformat");

			basicTable5_2 = doc.createElement("td");
			basicTable5.appendChild(basicTable5_2);
			var dateFormatSelect = Foxtrick.getSelectBoxFromXML2(doc, Foxtrick.XMLData.htdateformat, "hattrickdateformats/dateformat", "name", "code", FoxtrickPrefs.getString("htDateformat"));
			basicTable5_2.appendChild(dateFormatSelect);
			dateFormatSelect.id = "htDateformat";

			// checkbox association
			if (readHtPrefs) {
				languageSelect.disabled = countrySelect.disabled
					= currencySelect.disabled = dateFormatSelect.disabled = "disabled";
			}
			readHtPrefsCheck.addEventListener("click",
				function(ev) {
					if (ev.target.checked)
						languageSelect.disabled = countrySelect.disabled
							= currencySelect.disabled = dateFormatSelect.disabled = "disabled";
					else
						languageSelect.removeAttribute("disabled");
						countrySelect.removeAttribute("disabled");
						currencySelect.removeAttribute("disabled");
						dateFormatSelect.removeAttribute("disabled");

				}, false);


			// currency converter
			var groupbox= doc.createElement("div");
			groupbox.setAttribute('class',"ft_pref_module");
			preftab.appendChild(groupbox);

			var caption1= doc.createElement("div");
			caption1.setAttribute('class',"ft_pref_group_caption");
			caption1.textContent = Foxtrickl10n.getString("foxtrick.prefs.captionCurrencyConverter");
			groupbox.appendChild(caption1);

			var table= doc.createElement("table");
			groupbox.appendChild(table);
			var tr= doc.createElement("tr");
			table.appendChild(tr);

			var td= doc.createElement("td");
			td.setAttribute('style',"width:260px");
			tr.appendChild(td);
			td.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionCurrencySymbolTo")));
			var selectbox = Foxtrick.getSelectBoxFromXML2(doc,Foxtrick.XMLData.htCurrencyXml, "hattrickcurrencies/currency", "name", "code", FoxtrickPrefs.getString("htCurrencyTo"));
			selectbox.setAttribute("id","htCurrencyTo");
			td.appendChild(selectbox);

			var td= doc.createElement("td");
			td.setAttribute('style',"vertical-align:middle;");
			tr.appendChild(td);
			var br= doc.createElement("br");
			td.appendChild(br);
			var checked = FoxtrickPrefs.getBool("module.CurrencyConverter.enabled");
			var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'CurrencyConverter', Foxtrickl10n.getString("foxtrick.prefs.activeCurrencyConverter"),'', checked )
			td.appendChild(checkdiv);

			// LoadSavePrefs
			var groupbox= doc.createElement("div");
			groupbox.setAttribute('class',"ft_pref_module");
			preftab.appendChild(groupbox);

			var caption1= doc.createElement("div");
			caption1.setAttribute('class',"ft_pref_group_caption");
			caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionLoadSavePrefs")));
			groupbox .appendChild(caption1);

			var table= doc.createElement("table");
			groupbox.appendChild(table);
			var tr= doc.createElement("tr");
			table.appendChild(tr);

			var td= doc.createElement("td");
			tr.appendChild(td);

			var button= doc.createElement("input");
			button.setAttribute("value",Foxtrickl10n.getString("foxtrick.prefs.buttonSavePrefs"));
			button.setAttribute( "type", "button" );
			button.setAttribute('id',"buttonSavePrefs");
			button.addEventListener('click',FoxtrickPrefs.SavePrefs,false);
			td.appendChild(button);

			var td= doc.createElement("td");
			tr.appendChild(td);
			var caption1= doc.createElement("div");
			caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.labelSavePrefs")));
			td.appendChild(caption1);

			var checked = FoxtrickPrefs.getBool("SavePrefs_Prefs");
			var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'saveprefsid', Foxtrickl10n.getString("foxtrick.prefs.labelSavePrefs_Prefs"),'', checked )
			td.appendChild(checkdiv);

			var checked = FoxtrickPrefs.getBool("SavePrefs_Notes");
			var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'savenotesid', Foxtrickl10n.getString("foxtrick.prefs.labelSavePrefs_Notes"),'', checked )
			td.appendChild(checkdiv);

			var tr= doc.createElement("tr");
			table.appendChild(tr);

			var td= doc.createElement("td");
			tr.appendChild(td);

			var button= doc.createElement("input");
			button.setAttribute("value",Foxtrickl10n.getString("foxtrick.prefs.buttonLoadPrefs"));
			button.setAttribute( "type", "button" );
			button.setAttribute('id',"buttonLoadPrefs");
			button.addEventListener('click',FoxtrickPrefs.LoadPrefs,false);
			td.appendChild(button);

			var td= doc.createElement("td");
			tr.appendChild(td);
			var caption1= doc.createElement("div");
			caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.labelLoadPrefs")));
			td.appendChild(caption1);

			// changin all prefs
			var groupbox= doc.createElement("div");
			groupbox.setAttribute('class',"ft_pref_module");
			preftab.appendChild(groupbox);

			var caption1= doc.createElement("div");
			caption1.setAttribute('class',"ft_pref_group_caption");
			caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionCleanupBranch")));
			groupbox .appendChild(caption1);

			var table= doc.createElement("table");
			groupbox.appendChild(table);

			// CleanupBranch
			var tr= doc.createElement("tr");
			table.appendChild(tr);
			var td= doc.createElement("td");
			tr.appendChild(td);

			var button= doc.createElement("input");
			button.setAttribute("value",Foxtrickl10n.getString("foxtrick.prefs.buttonCleanupBranch"));
			button.setAttribute( "type", "button" );
			button.setAttribute('id',"buttonCleanupBranch");
			button.addEventListener('click',FoxtrickPrefs.confirmCleanupBranch,false);
			td.appendChild(button);

			var td= doc.createElement("td");
			tr.appendChild(td);
			var caption1= doc.createElement("div");
			caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.labelCleanupBranch")));
			td.appendChild(caption1);

			// disable all
			var tr= doc.createElement("tr");
			table.appendChild(tr);
			var td= doc.createElement("td");
			tr.appendChild(td);

			var button= doc.createElement("input");
			button.setAttribute("value",Foxtrickl10n.getString("foxtrick.prefs.buttonDisableAll"));
			button.setAttribute( "type", "button" );
			button.setAttribute('id',"buttonDisableAll");
			button.addEventListener('click',FoxtrickPrefs.disableAll,false);
			td.appendChild(button);

			var td= doc.createElement("td");
			tr.appendChild(td);
			var caption1= doc.createElement("div");
			caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.labelDisableAll")));
			td.appendChild(caption1);

			// disable options
			var groupbox= doc.createElement("div");
			groupbox.setAttribute('class',"ft_pref_module");
			preftab.appendChild(groupbox);

			var caption1= doc.createElement("div");
			caption1.setAttribute('class',"ft_pref_group_caption");
			caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionDisableSettings")));
			groupbox .appendChild(caption1);
			var div= doc.createElement("div");
			groupbox.appendChild(div);

			// stage
			var checked = FoxtrickPrefs.getBool("disableOnStage");
			var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'stagepref', Foxtrickl10n.getString("foxtrick.prefs.stagepref"),'', checked )
			div.appendChild(checkdiv);

			// temporary
			var checked = FoxtrickPrefs.getBool("disableTemporary");
			var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'disableTemporary', Foxtrickl10n.getString("foxtrick.prefs.disableTemporaryLabel"), '', checked )
			div.appendChild(checkdiv);

			// statusbar
			var groupbox= doc.createElement("div");
			groupbox.setAttribute('class',"ft_pref_module");
			preftab.appendChild(groupbox);

			var caption1= doc.createElement("div");
			caption1.setAttribute('class',"ft_pref_group_caption");
			caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionShowOnStatusBar")));
			groupbox .appendChild(caption1);

			var div= doc.createElement("div");
			groupbox.appendChild(div);

			var checked = FoxtrickPrefs.getBool("statusbarshow");
			var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'statusbarpref', Foxtrickl10n.getString("foxtrick.prefs.statusbarpref"), '', checked )
			div.appendChild(checkdiv);

			// AdditionalOptions
			var groupbox= doc.createElement("div");
			groupbox.setAttribute('class',"ft_pref_module");
			preftab.appendChild(groupbox);

			var caption1= doc.createElement("div");
			caption1.setAttribute('class',"ft_pref_group_caption");
			caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.AdditionalOptions")));
			groupbox .appendChild(caption1);

			var div= doc.createElement("div");
			groupbox.appendChild(div);

			var checked = FoxtrickPrefs.getBool("smallcopyicons");
			var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'smallcopyicons', Foxtrickl10n.getString("foxtrick.prefs.smallcopyicons"),'', checked )
			div.appendChild(checkdiv);
			var checked = FoxtrickPrefs.getBool("module.OnPagePrefs.enabled");
			var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'OnPagePrefs', Foxtrickl10n.getString("foxtrick.OnPagePrefs.desc"),'', checked )
			div.appendChild(checkdiv);
			var checked = FoxtrickPrefs.getBool("DisplayHTMLDebugOutput");
			var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'DisplayHTMLDebugOutput', Foxtrickl10n.getString("foxtrick.prefs.DisplayHTMLDebugOutput"),'', checked )
			div.appendChild(checkdiv);
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	fill_help_list : function( doc ) {
		var preftab = doc.getElementById('help');

		var header = this._panelHeader(doc, "help");
		preftab.appendChild(header);

		// links
		var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_module");
		preftab.appendChild(groupbox2);
		var caption1= doc.createElement("div");
		caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString('foxtrick.prefs.'+Foxtrick.XML_evaluate(Foxtrick.XMLData.aboutXML, "about/links", "value")[0])));
		groupbox2.appendChild(caption1);
		var links = Foxtrick.XML_evaluate(Foxtrick.XMLData.aboutXML, "about/links/link", "title", "value");
		for (var i=0;i<links.length;++i) {
			groupbox2.appendChild(doc.createTextNode(Foxtrickl10n.getString('foxtrick.prefs.'+links[i][0])+': '));
			var a = doc.createElement('a');
			a.href = links[i][1];
			a.setAttribute('target','_blank');
			a.appendChild(doc.createTextNode(links[i][1]));
			groupbox2.appendChild(a);
			groupbox2.appendChild(doc.createElement('br'));
		}

		groupbox2.appendChild(doc.createTextNode(Foxtrickl10n.getString("FoxtrickFirstRunHelpPage")));
		groupbox2.appendChild(doc.createTextNode(" "));
		var a=doc.createElement('a');
		a.href=Foxtrickl10n.getString("FoxtrickFirstRunHelpPageLink");
		a.innerHTML=Foxtrickl10n.getString("FoxtrickFirstRunHelpPageLink");
		a.target="_blank";
		groupbox2.appendChild(a);
		groupbox2.appendChild(doc.createElement('br'));

		// style tutorial
		var style_tutorial = doc.createElement("div");
		style_tutorial.className = "ft_pref_module";
		var style_tutorial_caption = doc.createElement("div");
		style_tutorial_caption.className = "ft_pref_group_caption";
		style_tutorial_caption.textContent = Foxtrickl10n.getString("StyleTutorial.title");
		var style_tutorial_content = doc.createElement("div");
		var style_example_uri = Foxtrick.ResourcePath + "resources/css/user-content-example.css"
		style_tutorial_content.innerHTML = Foxtrickl10n.getString("StyleTutorial.content").replace(/\n/, "<br />").replace(/%s/, "<a id='ft_popup_example_css' href='javascript:void();'>" + style_example_uri + "</a>");
		style_tutorial.appendChild(style_tutorial_caption);
		style_tutorial.appendChild(style_tutorial_content);
		preftab.appendChild(style_tutorial);
		var css_link = doc.getElementById('ft_popup_example_css');
		css_link.addEventListener('click', this.popup_example_css, false);
	},

	popup_example_css: function (ev) {
		var style_example_uri = Foxtrick.ResourcePath + "resources/css/user-content-example.css"
		window.open(style_example_uri,'user-content-example.css');
	},

	fill_about_list : function( doc ) {
		var preftab = doc.getElementById('about');

		var header = this._panelHeader(doc, "about");
		preftab.appendChild(header);

		// head_developer
		var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_module");
		preftab.appendChild(groupbox2);
		var caption1= doc.createElement("div");
		caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrick.XML_evaluate(Foxtrick.XMLData.aboutXML, "about/head_developers", "value")[0]));
		groupbox2.appendChild(caption1);
		var labels = Foxtrick.XML_evaluate(Foxtrick.XMLData.aboutXML, "about/head_developers/head_developer", "value");
		for (var i=0;i<labels.length;++i) {
			groupbox2.appendChild(doc.createTextNode(labels[i]));
			groupbox2.appendChild(doc.createElement('br'));
		}

		// project_owners
		var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_module");
		preftab.appendChild(groupbox2);
		var caption1= doc.createElement("div");
		caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrick.XML_evaluate(Foxtrick.XMLData.aboutXML, "about/project_owners", "value")[0]));
		groupbox2.appendChild(caption1);
		var labels = Foxtrick.XML_evaluate(Foxtrick.XMLData.aboutXML, "about/project_owners/project_owner", "value");
		for (var i=0;i<labels.length;++i) {
			groupbox2.appendChild(doc.createTextNode(labels[i]));
			groupbox2.appendChild(doc.createElement('br'));
		}

		// developers
		var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_module");
		preftab.appendChild(groupbox2);
		var caption1= doc.createElement("div");
		caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrick.XML_evaluate(Foxtrick.XMLData.aboutXML, "about/developers", "value")[0]));
		groupbox2.appendChild(caption1);
		var labels = Foxtrick.XML_evaluate(Foxtrick.XMLData.aboutXML, "about/developers/developer", "value");
		for (var i=0;i<labels.length;++i) {
			groupbox2.appendChild(doc.createTextNode(labels[i]));
			groupbox2.appendChild(doc.createElement('br'));
		}

		// graphic designers
		var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_module");
		preftab.appendChild(groupbox2);
		var caption1= doc.createElement("div");
		caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrick.XML_evaluate(Foxtrick.XMLData.aboutXML, "about/graphics", "value")[0]));
		groupbox2.appendChild(caption1);
		var labels = Foxtrick.XML_evaluate(Foxtrick.XMLData.aboutXML, "about/graphics/designer", "value");
		for (var i=0;i<labels.length;++i) {
			groupbox2.appendChild(doc.createTextNode(labels[i]));
			groupbox2.appendChild(doc.createElement('br'));
		}

		// translations
		var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_module");
		preftab.appendChild(groupbox2);
		var caption1= doc.createElement("div");
		caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrick.XML_evaluate(Foxtrick.XMLData.aboutXML, "about/translations", "value")[0]));
		groupbox2.appendChild(caption1);
		var labels = Foxtrick.XML_evaluate(Foxtrick.XMLData.aboutXML, "about/translations/translation", "value");
		for (var i=0;i<labels.length;++i) {
			groupbox2.appendChild(doc.createTextNode(labels[i]));
			groupbox2.appendChild(doc.createElement('br'));
		}
	},

	fill_changes_list : function( doc ) {
		try{
			var preftab = doc.getElementById('changes');

			var header = this._panelHeader(doc, "changes");
			preftab.appendChild(header);

			var versions = Foxtrick.XML_evaluate(Foxtrick.XMLData.htversionsXML, "hattrickversions/version", "name", "code");
			var oldVersion = versions[versions.length-2][1];

			var curVersion = FoxtrickPrefs.getString("curVersion");
			FoxtrickPrefsDialogHTML.getNewModules(curVersion,oldVersion);

			var commondiv=doc.createElement('div');
			commondiv.setAttribute('id','FoxtrickPrefsDialogHTMLCommon');
			preftab.appendChild(commondiv);
			FoxtrickPrefsDialogHTML.ShowAlertCommon(doc, oldVersion);

		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	fill_list : function( doc, category) {
		var preftab = doc.getElementById(category);

		var header = this._panelHeader(doc, category);
		preftab.appendChild(header);

		var modules_entries = new Array();
		for ( var i in Foxtrick.modules ) {
			var module = Foxtrick.modules[i];
			var module_category = module.MODULE_CATEGORY;
			if (!module_category) {
				// MODULE_CATEGORY isn't set; use default
				module_category = "shortcutsandtweaks";
			}
			if (module_category == category) {
				var entry = FoxtrickPrefsDialogHTML._normalModule(doc, module);
				if (module.OPTIONS != null) {
					entry.appendChild(FoxtrickPrefsDialogHTML._checkboxModule(doc, module, entry));
				}
				if (module.RADIO_OPTIONS != null) {
					entry.appendChild(FoxtrickPrefsDialogHTML._radioModule(doc, module, entry));
				}
				modules_entries.push(entry);
			}
		}

		modules_entries.sort(FoxtrickPrefsDialogHTML.entry_sortfunction);
		for ( var i=0;i<modules_entries.length;++i)	preftab.appendChild( modules_entries[i] );
	},

	entry_sortfunction: function(a,b) {return a.getAttribute('prefname').localeCompare(b.getAttribute('prefname'));},

	_panelHeader : function(doc, label) {
		var caption = doc.createElement("h1");
		caption.className = "ft_pref_list_caption";
		caption.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs." + FoxtrickPrefsDialogHTML.TabNames[label])));

		var screenshot = Foxtrickl10n.getScreenshot(label);
		if (screenshot) {
			caption.appendChild(this._screenshot(doc, screenshot));
		}

		return caption;
	},

	_screenshot : function(doc, link) {
		var a = doc.createElement("a");
		a.className = "ft_actionicon foxtrickScreenshot";
		a.href = link;
		a.title = Foxtrickl10n.getString("foxtrick.prefs.commented_screenshots");
		a.setAttribute('target','_blank');
		return a;
	},

	_emptyModule : function(doc, desc) {
		var module = doc.createElement("div");
		module.className = "ft_pref_module";
		var caption = doc.createElement("div");
		caption.className = "ft_pref_group_caption";
		caption.textContent = desc;
		module.appendChild(caption);
		return module;
	},

	_radioModule : function(doc, module, entry, on_page ) {
		var module_checked = Foxtrick.isModuleEnabled( module );
		var checkdiv = entry.firstChild;
		Foxtrick.addEventListenerChangeSave(checkdiv.firstChild, "click", function( ev ) {
			var check = ev.target;
			var checked = check.checked;
			var optiondiv = ev.target.ownerDocument.getElementById(check.id+'_radio');
			if (checked) {
				Foxtrick.removeClass(optiondiv, "hidden");
			}
			else {
				Foxtrick.addClass(optiondiv, "hidden");
			}
		}, false );

		var optiondiv = doc.createElement( "div" );
		optiondiv.setAttribute( "class", "ft_pref_radio_group" );
		optiondiv.setAttribute( "id", module.MODULE_NAME + '_radio' );

		var selectedValue = Foxtrick.getModuleValue( module );
		for (var i = 0; i < module.RADIO_OPTIONS.length; i++) {
			var selected;
			if (selectedValue == i) {
				selected = true;
			} else {
				selected = false;
			}

			var group = module.MODULE_NAME + '_radio';
			var desc = FoxtrickPrefs.getModuleDescription( module.MODULE_NAME + "." + module.RADIO_OPTIONS[i] );

			optiondiv.appendChild( FoxtrickPrefsDialogHTML._getRadio (doc, group, i, desc, module.RADIO_OPTIONS[i], selected, on_page ) );
		}
		if (module_checked) {
			Foxtrick.removeClass(optiondiv, "hidden");
		}
		else {
			Foxtrick.addClass(optiondiv, "hidden");
		}

		return optiondiv;
	},


	_checkboxModule : function (doc, module, entry, on_page) {
		var module_checked = Foxtrick.isModuleEnabled( module );
		var checkdiv = entry.firstChild;
		Foxtrick.addEventListenerChangeSave(checkdiv.firstChild, "click", function( ev ) {
			var check = ev.target;
			var checked = check.checked;
			var optiondiv = ev.target.ownerDocument.getElementById(check.id+'_options');
			if (checked) {
				Foxtrick.removeClass(optiondiv, "hidden");
			}
			else {
				Foxtrick.addClass(optiondiv, "hidden");
			}
		}, false );

		var optiondiv = doc.createElement( "div" );
		optiondiv.setAttribute( "id", module.MODULE_NAME+"_options" );
		optiondiv.setAttribute( "class", "ft_pref_checkbox_group" );
		for (var i = 0; i < module.OPTIONS.length; i++) {
			var key,title,title_long;
			if (module.OPTIONS[i]["key"]==null){
				key = module.OPTIONS[i];
				title = FoxtrickPrefs.getModuleElementDescription( module.MODULE_NAME, module.OPTIONS[i] );
				title_long = title;
			}
			else {
				key = module.OPTIONS[i]["key"];
				title=module.OPTIONS[i]["title"];
			}

			var OptionText = null;
			var DefaultOptionText = null;
			var has_load_button=false;
			if ( module.OPTION_TEXTS != null && module.OPTION_TEXTS
				&& (!module.OPTION_TEXTS_DISABLED_LIST || !module.OPTION_TEXTS_DISABLED_LIST[i])) {

				var val = FoxtrickPrefs.getString( "module." + module.MODULE_NAME + "." + key + "_text" );
				if (module.OPTION_TEXTS_DEFAULT_VALUES && module.OPTION_TEXTS_DEFAULT_VALUES[i]){
					if (val==null) val = module.OPTION_TEXTS_DEFAULT_VALUES[i];
					DefaultOptionText = module.OPTION_TEXTS_DEFAULT_VALUES[i];
				}
				if (val==null) val='';
				OptionText = val;

				if (module.OPTION_TEXTS_LOAD_BUTTONS && module.OPTION_TEXTS_LOAD_BUTTONS[i]){
					has_load_button = module.OPTION_TEXTS_LOAD_BUTTONS[i];
				}
				//Foxtrick.dump(module.MODULE_NAME+'.'+key+' o:'+OptionText+' d:'+DefaultOptionText+'\n');
			}

			var checked = Foxtrick.isModuleFeatureEnabled( module, key)
			var group = module.MODULE_NAME + '.' + key;
			optiondiv.appendChild(FoxtrickPrefsDialogHTML._getCheckBox(doc, group, title, title_long, checked, OptionText, DefaultOptionText, has_load_button, on_page ));
		}
		if (module_checked) {
			Foxtrick.removeClass(optiondiv, "hidden");
		}
		else {
			Foxtrick.addClass(optiondiv, "hidden");
		}

		return optiondiv;
	},

	_normalModule : function (doc, module, on_page) {
		var entry = doc.createElement( "div" );
		entry.setAttribute( "class", "ft_pref_module" );
		entry.setAttribute( "prefname", module.MODULE_NAME );

		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, module.MODULE_NAME, module.MODULE_NAME, FoxtrickPrefs.getModuleDescription( module.MODULE_NAME ), Foxtrick.isModuleEnabled( module ),null, null, false, on_page) ;
		entry.appendChild(checkdiv);
		entry.appendChild (doc.createTextNode(FoxtrickPrefs.getModuleDescription( module.MODULE_NAME ) ));
		return entry;
	},

	_getCheckBox : function (doc, name, label, label_long, checked, option_text, DefaultOptionText, has_load_button, on_page) {
		var div = doc.createElement( "div" );
		div.className = "ft_prefs_check_div";

		var check = doc.createElement("input");
		check.id = name;
		check.setAttribute("type", "checkbox");
		check.setAttribute("name", name);
		if (checked) check.setAttribute("checked", "checked");
		if (on_page) check.setAttribute("title", label);
		div.appendChild(check);

		var desc = doc.createElement("label");
		desc.setAttribute("for", name);
		if (on_page) desc.setAttribute("title", label);
		desc.appendChild(doc.createTextNode(label));
		div.appendChild(desc);

		var screenshot = Foxtrickl10n.getScreenshot(name);
		if (screenshot) {
			div.appendChild(this._screenshot(doc, screenshot));
		}

		var cleaner = doc.createElement("div");
		cleaner.style.clear = "both";
		div.appendChild(cleaner);

		if (option_text!=null) {
			Foxtrick.addEventListenerChangeSave(check, "click", function(ev) {
				var checked = ev.currentTarget.checked;
				var optiondiv = ev.target.ownerDocument.getElementById(ev.currentTarget.id+'_table');
				if (checked) {
					Foxtrick.removeClass(optiondiv, "hidden");
				}
				else {
					Foxtrick.addClass(optiondiv, "hidden");
				}
			}, false);

			var table = doc.createElement( "table" );
			table.setAttribute( "id", name+'_table' );
			if (checked) {
				Foxtrick.removeClass(table, "hidden");
			}
			else {
				Foxtrick.addClass(table, "hidden");
			}
			div.appendChild( table );
			var tr = doc.createElement( "tr" );
			table.appendChild( tr );

			var td = doc.createElement( "td" );
			td.setAttribute('style','width:100%');
			tr.appendChild( td );
			var input_option_text = doc.createElement( "input" );
			input_option_text.setAttribute( "type", "text" );
			input_option_text.setAttribute( "name", name+'_text' );
			input_option_text.setAttribute( "id", name+'_text' );
			input_option_text.setAttribute( "value", option_text);
			input_option_text.setAttribute( "class", "ft_pref_input_option_text");
			td.appendChild( input_option_text);

			if (!has_load_button) {
				// add example button
				var td = doc.createElement( "td" );
				tr.appendChild( td );
				var option_text_reset_button = doc.createElement( "input" );
				option_text_reset_button.setAttribute('type', 'button');
				option_text_reset_button.setAttribute('value', Foxtrickl10n.getString("foxtrick.prefs.buttonExample"));
				option_text_reset_button.setAttribute( "sender_id", name);
				option_text_reset_button.setAttribute( "default_text", DefaultOptionText);
				Foxtrick.addEventListenerChangeSave(option_text_reset_button, "click", function( ev ) {
					try {
						var default_text = ev.currentTarget.getAttribute('default_text');
						var input_option_text = ev.target.ownerDocument.getElementById(ev.currentTarget.getAttribute('sender_id')+'_text');
						input_option_text.setAttribute( "value", default_text);
					}
					catch (e) {
						Foxtrick.dumpError(e);
					}
				}, false );
				td.appendChild(option_text_reset_button);
			}
			else {
				// add load button
				var td = doc.createElement( "td" );
				tr.appendChild( td );
				var button= doc.createElement("input");
				button.setAttribute("value",Foxtrickl10n.getString("foxtrick.prefs.buttonLoadPrefs"));
				button.setAttribute( "type", "button" );
				button.setAttribute('inputid', name+'_text');
				button.setAttribute('id',"name+'_selectfile");
				button.addEventListener('click',FoxtrickPrefsDialogHTML.selectfile,false);
				td.appendChild(button);
			}
		}
		return div;
	},

	_getRadio : function (doc, name, index, label, label_short, checked, on_page ) {
		var div = doc.createElement( "div" );
		var check = doc.createElement( "input" );
		check.id = name + "_" + index;
		check.setAttribute( "type", "radio" );
		check.setAttribute( "name", name );
		if (checked) check.setAttribute( "checked", "checked" );
		var desc = doc.createElement("label");
		desc.appendChild(doc.createTextNode(label));
		desc.setAttribute("for", check.id);
		div.appendChild( check );
		div.appendChild( desc );
		return div;
	},


	getNewModules : function(curVersion,oldVersion) {
		try{
			FoxtrickPrefsDialogHTML.NewModules = new Array();

			for ( var i in Foxtrick.modules ) {
				var module = Foxtrick.modules[i];
				//Foxtrick.dump (module.MODULE_NAME+' '+oldVersion+' > ' +module.NEW_AFTER_VERSION+' '+(oldVersion <= module.NEW_AFTER_VERSION)+'\n');
				if ( (module.NEW_AFTER_VERSION && oldVersion <= module.NEW_AFTER_VERSION)
					|| (!module.NEW_AFTER_VERSION && oldVersion=="")) {

					//if (!module.MODULE_CATEGORY) continue;
					var category = Foxtrick.moduleCategories.MAIN;
					if (module.MODULE_CATEGORY) category = module.MODULE_CATEGORY;

					var Tab="";
					if (category==Foxtrick.moduleCategories.MAIN) Tab=Foxtrickl10n.getString("foxtrick.prefs.MainTab");
					else if (category==Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS) Tab=Foxtrickl10n.getString("foxtrick.prefs.ShortcutsTab");
					else if (category==Foxtrick.moduleCategories.PRESENTATION) Tab=Foxtrickl10n.getString("foxtrick.prefs.PresentationTab");
					else if (category==Foxtrick.moduleCategories.MATCHES) Tab=Foxtrickl10n.getString("foxtrick.prefs.MatchesTab");
					else if (category==Foxtrick.moduleCategories.FORUM) Tab=Foxtrickl10n.getString("foxtrick.prefs.ForumTab");
					else if (category==Foxtrick.moduleCategories.LINKS) Tab=Foxtrickl10n.getString("foxtrick.prefs.LinksTab");
					else if (category==Foxtrick.moduleCategories.ALERT) Tab=Foxtrickl10n.getString("foxtrick.prefs.AlertTab");

					var new_after=module.NEW_AFTER_VERSION;
					if (!new_after) new_after="0.3.73";
					var change_category = module.LATEST_CHANGE_CATEGORY;
					if (!change_category) change_category = Foxtrick.latestChangeCategories.FIX;

					var screenshot=Foxtrickl10n.getScreenshot(module.MODULE_NAME);
					FoxtrickPrefsDialogHTML.NewModules.push([module.MODULE_NAME,screenshot,Tab,module.category,new_after,module.LATEST_CHANGE,module,Foxtrickl10n.getString(change_category)]);

					// for release notes goto changes and select new version number
					//Foxtrick.dump(change_category+':\t'+module.MODULE_NAME+'\t'+module.LATEST_CHANGE+'\n');
				}
			}

			FoxtrickPrefsDialogHTML.NewModules.sort(FoxtrickPrefsDialogHTML.sortfunction4);
			FoxtrickPrefsDialogHTML.NewModules.sort(FoxtrickPrefsDialogHTML.sortfunction0);
			FoxtrickPrefsDialogHTML.NewModules.sort(FoxtrickPrefsDialogHTML.sortfunction2);
			FoxtrickPrefsDialogHTML.NewModules.sort(FoxtrickPrefsDialogHTML.sortfunction7);
		} catch(e){Foxtrick.dump('getNewModules '+e+'\n');}
	},


	ShowAlertCommon :function(doc, oldVersion) {
		try {
			var alertdiv = doc.getElementById('FoxtrickPrefsDialogHTMLCommon');
			var curVersion=FoxtrickPrefs.getString("curVersion");

			alertdiv.innerHTML = "<h2 style='background-color:#EFEFFF; text-align:center !important; color:#2F31FF !important; font-size:1.1em; '>FoxTrick "+curVersion+"</h2>";

			alertdiv.innerHTML += Foxtrickl10n.getString("NewOrChangedModules")+' ';

			if (Foxtrick.BuildFor=='Chrome')
					var selectbox = Foxtrick.getSelectBoxFromXML2(doc,Foxtrick.XMLData.htversionsXml, "hattrickversions/version", "desc", "name", "code", oldVersion);
			else var selectbox = Foxtrick.getSelectBoxFromXML(doc,Foxtrick.ResourcePath+"htlocales/htversions.xml", "hattrickversions/version", "name", "code", oldVersion);
			selectbox.setAttribute("id","ft_ownselectboxID");
			Foxtrick.addEventListenerChangeSave(selectbox,'change',FoxtrickPrefsDialogHTML.VersionBox_Select,false);
			alertdiv.appendChild(selectbox);

			alertdiv.appendChild(doc.createElement('br'));
			alertdiv.appendChild(doc.createTextNode(Foxtrickl10n.getString("FoxtrickChangeLogHint")));

			var alertdivInner = doc.createElement('div');
			alertdivInner.setAttribute('id','changesalertdivInner');
			alertdiv.appendChild(alertdivInner);
			FoxtrickPrefsDialogHTML.ShowAlertCommonInner(doc);

			/*var p=doc.createElement('p');
			p.appendChild(doc.createTextNode(Foxtrickl10n.getString("FoxtrickFirstRunReleaseNotes")));
			p.appendChild(doc.createTextNode(" "));
			var a=doc.createElement('a');
			a.href=Foxtrickl10n.getString("FoxtrickFirstRunReleaseNotesLink");
			a.innerHTML=Foxtrickl10n.getString("FoxtrickFirstRunReleaseNotesLink");
			a.target="_blank";
			p.appendChild(a);
			alertdiv.appendChild(p);*/

		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	ShowAlertCommonInner :function(doc) {
		try {
			var alertdiv= doc.getElementById('changesalertdivInner');
			alertdiv.innerHTML='';
			var table=doc.createElement('table');
			alertdiv.appendChild(table);
			var tr=doc.createElement('tr');
			table.appendChild(tr);
			var td1=doc.createElement('td');
			var h1=doc.createElement('h3');
			var a1=doc.createElement('a');
			a1.appendChild(doc.createTextNode(Foxtrickl10n.getString("Module")));
			Foxtrick.addEventListenerChangeSave(a1, "click", FoxtrickPrefsDialogHTML.Sort0, false );
			a1.href='javascript:void();'
			a1.title=Foxtrickl10n.getString("SortBy");
			h1.appendChild(a1);
			td1.appendChild(h1);
			tr.appendChild(td1);

			var td2=doc.createElement('td');
			var h2=doc.createElement('h3');
			var a2=doc.createElement('a');
			a2.appendChild(doc.createTextNode(Foxtrickl10n.getString("PreferenceTab")));
			Foxtrick.addEventListenerChangeSave( a2, "click", FoxtrickPrefsDialogHTML.Sort2, false );
			a2.href='javascript:void();'
			a2.title=Foxtrickl10n.getString("SortBy");
			h2.appendChild(a2);
			td2.appendChild(h2);
			tr.appendChild(td2);

			var td3=doc.createElement('td');
			var h3=doc.createElement('h3');
			var a3=doc.createElement('a');
			a3.appendChild(doc.createTextNode(Foxtrickl10n.getString("NewAfter")));
			Foxtrick.addEventListenerChangeSave(a3, "click", FoxtrickPrefsDialogHTML.Sort4, false );
			a3.href='javascript:void();'
			a3.title=Foxtrickl10n.getString("SortBy");
			h3.appendChild(a3);
			td3.appendChild(h3);
			tr.appendChild(td3);

			var td4=doc.createElement('td');
			var h4=doc.createElement('h4');
			var a4=doc.createElement('a');
			a4.appendChild(doc.createTextNode(Foxtrickl10n.getString("ChangeCategory")));
			Foxtrick.addEventListenerChangeSave(a4, "click", FoxtrickPrefsDialogHTML.Sort7, false );
			a4.href='javascript:void();'
			a4.title=Foxtrickl10n.getString("SortBy");
			h4.appendChild(a4);
			td4.appendChild(h4);
			tr.appendChild(td4);


			var notes_dump='[table]';
			for (var i=0;i<this.NewModules.length;++i) {
				var tr=doc.createElement('tr');
				table.appendChild(tr);
				notes_dump+='[tr]';

				// module
				var td1=doc.createElement('td');
				notes_dump+='[td]';
				if (this.NewModules[i][1]) {
					var a=doc.createElement('a');
					a.href=this.NewModules[i][1];
					a.title=Foxtrickl10n.getString("Screenshot");
					a.target="_blank";
					a.innerHTML=this.NewModules[i][0];
					td1.appendChild(a);
					notes_dump+=this.NewModules[i][0];
				}
				else td1.appendChild(doc.createTextNode(this.NewModules[i][0]));

				// module options
				if (this.NewModules[i][6].OPTIONS) {
					for (var k=0; k < this.NewModules[i][6].OPTIONS.length; ++k) {
						var screenshot=Foxtrickl10n.getScreenshot(this.NewModules[i][0]+'.'+this.NewModules[i][6].OPTIONS[k]);
						if (screenshot) {
							td1.appendChild(doc.createElement('br'));
							td1.appendChild(doc.createTextNode('»\u00a0'));
							var a=doc.createElement('a');
							a.href=screenshot;
							a.title=Foxtrickl10n.getString("Screenshot");
							a.target="_blank";
							a.innerHTML=this.NewModules[i][6].OPTIONS[k];
							td1.appendChild(a);
							notes_dump+='[br]'+this.NewModules[i][6].OPTIONS[k];
						}
					}
				}
				if (this.NewModules[i][6].RADIO_OPTIONS) {
					for (var k=0; k < this.NewModules[i][6].RADIO_OPTIONS.length; ++k) {
						var screenshot=Foxtrickl10n.getScreenshot(this.NewModules[i][0]+'.'+this.NewModules[i][6].RADIO_OPTIONS[k]);
						if (screenshot) {
							td1.appendChild(doc.createElement('br'));
							td1.appendChild(doc.createTextNode('»\u00a0'));
							var a=doc.createElement('a');
							a.href=screenshot;
							a.title=Foxtrickl10n.getString("Screenshot");
							a.target="_blank";
							a.innerHTML=this.NewModules[i][6].RADIO_OPTIONS[k];
							td1.appendChild(a);
							notes_dump+='[br]'+this.NewModules[i][6].RADIO_OPTIONS[k];
						}
					}
				}
				tr.appendChild(td1);
				notes_dump+='[/td]';

				// categories
				var td2=doc.createElement('td');
				var prefscreenshot="";
				var prefscreenshot = Foxtrickl10n.getScreenshot(this.NewModules[i][3]);
				if (prefscreenshot) {
					var a=doc.createElement('a');
					a.href=prefscreenshot;
					a.title=Foxtrickl10n.getString("PreferenceScreenshot");
					a.target="_blank";
					a.innerHTML=this.NewModules[i][2];
					td2.appendChild(a);
					notes_dump+='[/td]';
				}
				else td2.appendChild(doc.createTextNode(this.NewModules[i][2]));
				tr.appendChild(td2);

				// new after
				var td3=doc.createElement('td');
				td3.appendChild(doc.createTextNode(this.NewModules[i][4]));
				tr.appendChild(td3);

				// new after
				var td3=doc.createElement('td');
				notes_dump+='[td]';
				td3.appendChild(doc.createTextNode(this.NewModules[i][7]));
				notes_dump+=this.NewModules[i][7];
				tr.appendChild(td3);
				notes_dump+='[/td]';

				// change log
				var td4=doc.createElement('td');
				notes_dump+='[td]';
				if (this.NewModules[i][5]) {
					var imgdiv=doc.createElement('div');
					imgdiv.setAttribute('class','ft_icon foxtrickInfo');
					imgdiv.setAttribute('title',"Last change: "+this.NewModules[i][5]);
					td4.appendChild(imgdiv);
					notes_dump+=this.NewModules[i][5];
				}
				tr.appendChild(td4);
				notes_dump+='[/td][/tr]';
			}
			notes_dump+='[/table]';

			//Foxtrick.dump(notes_dump);	// dump release notes

			alertdiv.appendChild(doc.createElement('br'));
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},


	sortfunction0: function(a,b) {return a[0].localeCompare(b[0]);},
	sortfunction2: function(a,b) {return a[2].localeCompare(b[2]);},
	sortfunction4: function(a,b) {return a[4].localeCompare(b[4]);},
	sortfunction7: function(a,b) {return (a[7]==Foxtrickl10n.getString(Foxtrick.latestChangeCategories.FIX))},

	Sort0 :function(ev){
		var doc = ev.target.ownerDocument;
		FoxtrickPrefsDialogHTML.NewModules.sort(FoxtrickPrefsDialogHTML.sortfunction0);
		FoxtrickPrefsDialogHTML.ShowAlertCommonInner(doc);
	},

	Sort2 :function(ev){
		var doc = ev.target.ownerDocument;
		FoxtrickPrefsDialogHTML.NewModules.sort(FoxtrickPrefsDialogHTML.sortfunction2);
		FoxtrickPrefsDialogHTML.ShowAlertCommonInner(doc);
	},

	Sort4 :function(ev){
		var doc = ev.target.ownerDocument;
		FoxtrickPrefsDialogHTML.NewModules.sort(FoxtrickPrefsDialogHTML.sortfunction4);
		FoxtrickPrefsDialogHTML.ShowAlertCommonInner(doc);
	},

	Sort7 :function(ev){
		var doc = ev.target.ownerDocument;
		FoxtrickPrefsDialogHTML.NewModules.sort(FoxtrickPrefsDialogHTML.sortfunction7);
		FoxtrickPrefsDialogHTML.ShowAlertCommonInner(doc);
	},

	VersionBox_Select :function(ev){
		try {
			var doc = ev.target.ownerDocument;

			var selectbox = doc.getElementById("ft_ownselectboxID");
			var oldVersion = selectbox.getElementsByTagName("option")[selectbox.selectedIndex].value;

			FoxtrickPrefsDialogHTML.getNewModules(FoxtrickPrefs.getString("curVersion"),oldVersion);
			FoxtrickPrefsDialogHTML.ShowAlertCommon(doc, oldVersion);

		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	}
}
