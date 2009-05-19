/**
 * HTML-Preference dialog functions.
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickPrefsDialogHTML = {

    MODULE_NAME : "PrefsDialogHTML",
    DEFAULT_ENABLED : true,
	CSS:"chrome://foxtrick/content/resources/css/preferences-dialog-html.css",
	_doc:null,

	TabNames: {	'main':'MainTab',
				'shortcuts_and_tweaks':'ShortcutsTab',
				'presentation':'PresentationTab',
				'matches':'MatchesTab',
				'forum':'ForumTab',
				'links':'LinksTab',
				'changes':'ChangesTab',
				'help':'HelpTab',
				'about':'AboutTab'},

    init : function() {
        Foxtrick.registerAllPagesHandler( this );
    },

    run : function( doc ) { 
		if (doc.location.href.search(/\/MyHattrick\/|Default.aspx\?authCode/)==-1) return;
		FoxtrickPrefsDialogHTML._doc=doc;
		if (doc.location.href.search(/\/MyHattrick\/Preferences/)!=-1) { 
			FoxtrickPrefsDialogHTML.add_pref_links_right(doc);			
		}	
		if (doc.location.href.search(/configure_foxtrick=true/i)!=-1) { 
			FoxtrickPrefsDialogHTML.show_pref(doc);			
		}
	},

	change : function( doc ) { 
		FoxtrickPrefsDialogHTML._doc=doc;	   
	},
	
	add_pref_links_right : function( doc) {
		if (doc.getElementById('id_configure_foxtrick')) return;
		var foxtrick_pref_link = doc.createElement('a');
		foxtrick_pref_link.setAttribute('id','id_configure_foxtrick');
		foxtrick_pref_link.setAttribute('href','/MyHattrick/Preferences?configure_foxtrick=true&category=main');
		foxtrick_pref_link.innerHTML = Foxtrickl10n.getString("foxtrick.menu.configurefoxtrick");	
		doc.getElementById('sidebar').getElementsByTagName('a')[0].parentNode.appendChild(foxtrick_pref_link);	
	},
	
	
	show_pref_header: function (doc) {
		if (doc.getElementById('foxtrick_config')) return;
		var mainWrapper=doc.getElementById('mainWrapper');
		var header = mainWrapper.getElementsByTagName('h2')[0];
		var htprefheader_links = header.getElementsByTagName('a');
				
		var sub_pref_header_foxtrick_sub = htprefheader_links[2];
		if (!sub_pref_header_foxtrick_sub) {
			header.appendChild(doc.createTextNode(' » '));
			sub_pref_header_foxtrick_sub = doc.createElement('a');
			header.appendChild(sub_pref_header_foxtrick_sub);
		}	
		sub_pref_header_foxtrick_sub.innerHTML = "FoxTrick";	
		sub_pref_header_foxtrick_sub.setAttribute('href','javascript:void();');
		sub_pref_header_foxtrick_sub.setAttribute('id','foxtrick_config');
		sub_pref_header_foxtrick_sub.addEventListener('click',FoxtrickPrefsDialogHTML.show_pref,false);
		
	},
	
	show_pref : function( doc ) {
	try{ 					
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
		
		// tab heads
		var preftabheaddiv=doc.createElement('div');	
		preftabheaddiv.setAttribute('id','foxtrick_prefs_head');
		prefdiv.appendChild(preftabheaddiv);
				
		// save+cancel		
		var prefsavediv=doc.createElement('div');	
		prefdiv.appendChild(prefsavediv);
		
		var prefsave=doc.createElement('input');	
		prefsave.setAttribute('id','foxtrick_prefsave'); 
		prefsave.setAttribute('type','button'); 
		//prefsave.setAttribute('disabled','true'); 		
		prefsave.setAttribute('value',Foxtrickl10n.getString("foxtrick.prefs.buttonSave")); 
		prefsave.addEventListener('click',FoxtrickPrefsDialogHTML.save,false);
		prefsavediv.appendChild(prefsave);
		
		var prefcancel=doc.createElement('input');	
		prefcancel.setAttribute('id','foxtrick_prefcancel'); 
		prefcancel.setAttribute('type','button'); 
		prefcancel.setAttribute('value',Foxtrickl10n.getString("foxtrick.prefs.buttonCancel")); 
		prefcancel.addEventListener('click',FoxtrickPrefsDialogHTML.cancel,false);
		prefsavediv.appendChild(prefcancel);
		
		
		// tabs
		var preftabdiv=doc.createElement('div');	
		preftabdiv.setAttribute('id','foxtrick_preftabs'); 
		preftabdiv.setAttribute('style','display:none;'); 
		prefdiv.appendChild(preftabdiv);

		FoxtrickPrefsDialogHTML.add_tab( doc, Foxtrick.moduleCategories.MAIN) ;
		FoxtrickPrefsDialogHTML.add_tab( doc, Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS) ;
		FoxtrickPrefsDialogHTML.add_tab( doc, Foxtrick.moduleCategories.PRESENTATION ) ;
		FoxtrickPrefsDialogHTML.add_tab( doc, Foxtrick.moduleCategories.MATCHES) ;
		FoxtrickPrefsDialogHTML.add_tab( doc, Foxtrick.moduleCategories.FORUM ) ;
		FoxtrickPrefsDialogHTML.add_tab( doc, Foxtrick.moduleCategories.LINKS) ;		
		FoxtrickPrefsDialogHTML.add_tab( doc, Foxtrick.moduleCategories.CHANGES) ;		
		FoxtrickPrefsDialogHTML.add_tab( doc, Foxtrick.moduleCategories.HELP) ;		
		FoxtrickPrefsDialogHTML.add_tab( doc, Foxtrick.moduleCategories.ABOUT) ;		

		preftabdiv.setAttribute('style','display:inline'); 
		
		try {
			if (doc.location.href.search(/highlight=/i)!=-1) { 
				var highlight=doc.location.href.match(/highlight=(\w+)/i)[1];
				dump(highlight+'\n')
				var elem=doc.getElementById(highlight);
				elem.parentNode.setAttribute('style','background:red !important;');
			}
		} catch (e){}
		
	} catch(e){dump('show_prefs: '+e+'\n');}
	},


	show_tab : function( ev ) {
		var doc = FoxtrickPrefsDialogHTML._doc;
		var foxtrick_prefs_head = doc.getElementById('foxtrick_prefs_head').childNodes;
		var foxtrick_preftabs = doc.getElementById('foxtrick_preftabs').childNodes;
		var tab = ev.target.getAttribute('tab');
		
		for (var i=0;i<foxtrick_preftabs.length;++i) {			
			if (tab==foxtrick_preftabs[i].getAttribute('id')) 
				foxtrick_preftabs[i].style.display='inline'; 
			else foxtrick_preftabs[i].style.display='none';
			if (tab==foxtrick_prefs_head[i].getAttribute('tab')) 
				foxtrick_prefs_head[i].setAttribute('class','ft_pref_head ft_pref_head_active'); 
			else foxtrick_prefs_head[i].setAttribute('class','ft_pref_head'); 
		}
	},
	
	
	tabhead_mouseover : function( ev ) {
		var doc = FoxtrickPrefsDialogHTML._doc;
		doc.defaultView.status = '/MyHattrick/Preferences?configure_foxtrick=true&category='+ev.target.getAttribute('tab');		
	},

	
	save : function( ev ) {
	try { 
		var doc = FoxtrickPrefsDialogHTML._doc;

		for ( i in Foxtrick.modules ) {
			var module = Foxtrick.modules[i];
			if (!module.MODULE_CATEGORY || module.MODULE_CATEGORY==Foxtrick.moduleCategories.MAIN) continue;
			
			var checked =  doc.getElementById(module.MODULE_NAME).checked;
		
			FoxtrickPreferencesDialog.setModuleEnableState(module.MODULE_NAME, checked);
        
            if (module.RADIO_OPTIONS != null) {

			} else if (module.OPTIONS != null) {
				for (var i = 0; i < module.OPTIONS.length; i++) {
					var key,title;
					if (module.OPTIONS[i]["key"]==null){
						key = module.OPTIONS[i];
					}
					else { 
						key = module.OPTIONS[i]["key"];
					}
					FoxtrickPreferencesDialog.setModuleEnableState(module.MODULE_NAME+'.'+key, doc.getElementById(module.MODULE_NAME+'.'+key).checked);
			
					if ( module.OPTION_TEXTS != null && module.OPTION_TEXTS
					&& (!module.OPTION_TEXTS_DISABLED_LIST || !module.OPTION_TEXTS_DISABLED_LIST[i])) {
				   
						FoxtrickPreferencesDialog.setModuleOptionsText( module.MODULE_NAME + "." + key+ "_text", 
													doc.getElementById(module.MODULE_NAME+'.'+key+'_text').value );        
					}
				}
			}
		}
		
		
			// disable warning
		FoxtrickPrefs.setBool( "PrefsSavedOnce" ,true);
		
        //Lang
        FoxtrickPrefs.setString("htLanguage", doc.getElementById("htLanguage").value);
		FoxtrickPrefs.setBool("module.FoxtrickReadHtPrefs.enabled", doc.getElementById("ReadHtPrefs").checked);
        
		//Currency
        FoxtrickPrefs.setString("htCurrency", doc.getElementById("htCurrency").value);
        
		//Country
        FoxtrickPrefs.setString("htCountry", doc.getElementById("htCountry").value);

        var htCountryXml_c = Foxtrick.LoadXML("chrome://foxtrick/content/htlocales/htcountries.xml");
        FoxtrickPrefs.setInt("htSeasonOffset", Math.floor(FoxtrickPreferencesDialog.getOffsetValue(doc.getElementById("htCountry").value,htCountryXml_c)));        
            
        //Currency Converter

        var htCurrencyXml_c = Foxtrick.LoadXML("chrome://foxtrick/content/htlocales/htcurrency.xml");

        FoxtrickPrefs.setString("htCurrencyTo", doc.getElementById("htCurrencyTo").value);
        FoxtrickPrefs.setString("currencySymbol", FoxtrickPreferencesDialog.getConverterCurrValue(doc.getElementById("htCurrencyTo").value,"new",htCurrencyXml_c));
        FoxtrickPrefs.setString("currencyRateTo", FoxtrickPreferencesDialog.getConverterCurrValue(doc.getElementById("htCurrencyTo").value,"rate",htCurrencyXml_c));
    
        FoxtrickPrefs.setString("oldCurrencySymbol", FoxtrickPreferencesDialog.getConverterCurrValue(doc.getElementById("htCurrency").value,"old",htCurrencyXml_c));
        FoxtrickPrefs.setString("currencyRate", FoxtrickPreferencesDialog.getConverterCurrValue(doc.getElementById("htCurrency").value,"rate",htCurrencyXml_c));
		FoxtrickPrefs.setString("currencyCode", FoxtrickPreferencesDialog.getConverterCurrValue(doc.getElementById("htCurrency").value,"code",htCurrencyXml_c));
        
        FoxtrickPrefs.setBool("module.CurrencyConverter.enabled", doc.getElementById("activeCurrencyConverter").checked); 

		//Dateformat
        FoxtrickPrefs.setString("htDateformat", doc.getElementById("htDateformat").value);

        //Statusbar
        FoxtrickPrefs.setBool("statusbarshow", doc.getElementById("statusbarpref").checked);

        //Alert
        FoxtrickPrefs.setBool("alertSlider", doc.getElementById("alertsliderpref").checked);
        FoxtrickPrefs.setBool("alertSliderGrowl", doc.getElementById("alertslidermacpref").checked);
        FoxtrickPrefs.setBool("alertSound", doc.getElementById("alertsoundpref").checked);
        FoxtrickPrefs.setString("alertSoundUrl", doc.getElementById("alertsoundurlpref").value);

        //Skin settings
        FoxtrickPrefs.setString("cssSkinOld",  FoxtrickPrefs.getString("cssSkin"));
        FoxtrickPrefs.setString("cssSkin", doc.getElementById("cssskinpref").value);
        FoxtrickPrefs.setBool("module.SkinPlugin.enabled", doc.getElementById("SkinPlugin").checked); 

        //disable
		FoxtrickPrefs.setBool("disableOnStage", doc.getElementById("stagepref").checked);        
		FoxtrickPrefs.setBool("disableTemporary", doc.getElementById("disableTemporary").checked);
        
		// other
		FoxtrickPrefs.setString("oldVersion", doc.getElementById("htOldVersion").value);

		// additional options
		FoxtrickPrefs.setBool("copyfeedback", doc.getElementById("copyfeedback").checked);

		
		FoxtrickPrefs.setBool("SavePrefs_Prefs", doc.getElementById("saveprefsid").checked);
        FoxtrickPrefs.setBool("SavePrefs_Notes", doc.getElementById("savenotesid").checked);
    
		
		// reinitialize
        FoxtrickMain.init();
		doc.location.href="/MyHattrick/Preferences?configure_foxtrick=true&status=saved";
		
	} catch (e) { dump ('FoxtrickPrefsDialogHTML->save: '+e+'\n');}
	},

	cancel : function( ev ) {
		var doc = FoxtrickPrefsDialogHTML._doc;
		doc.location.href="/MyHattrick/Preferences?configure_foxtrick=true&status=canceled";		
	},
	
	selectfile : function( ev ) { 
		var doc = FoxtrickPrefsDialogHTML._doc;
		var file = Foxtrick.selectFile(doc.defaultView); 
		if (file != null) {doc.getElementById(ev.target.getAttribute('inputid')).value='file://' + (file)};
	},
	
	playsound : function( ev ) { 
		var doc = FoxtrickPrefsDialogHTML._doc;
		Foxtrick.playSound(doc.getElementById('alertsoundurlpref').value);
	},
		
    add_tab : function( doc, category ) {

		var preftabheaddiv = doc.getElementById('foxtrick_prefs_head');
		var preftabdiv = doc.getElementById('foxtrick_preftabs');
		var headstr = Foxtrickl10n.getString("foxtrick.prefs."+FoxtrickPrefsDialogHTML.TabNames[category]);
		
		var preftabhead=doc.createElement('div');	
		preftabhead.setAttribute('tab',category); 		
		preftabhead.setAttribute('class','ft_pref_head'); 		
		preftabhead.addEventListener('click',FoxtrickPrefsDialogHTML.show_tab,false);
		preftabhead.addEventListener('mouseover',FoxtrickPrefsDialogHTML.tabhead_mouseover,false);
		preftabhead.appendChild(doc.createTextNode(headstr));
		preftabheaddiv.appendChild(preftabhead);

		var preftab=doc.createElement('div');	
		preftab.setAttribute('id',category); 
		preftab.setAttribute('style','display:none;'); 		
		preftabdiv.appendChild(preftab);
		
		var active_tab='main';
		try {
		if (doc.location.href.search(/category=/i)!=-1) { 
			active_tab=doc.location.href.match(/category=(\w+)/i)[1];			
		}
		} catch (e){}
		if (category==active_tab) {
			preftabhead.setAttribute('class','ft_pref_head ft_pref_head_active'); 
			preftab.setAttribute('style','display:inline;'); 
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
	},
		
	
	fill_main_list : function( doc ) {
		var preftab = doc.getElementById('main');
		
		var headstr = Foxtrickl10n.getString("foxtrick.prefs."+FoxtrickPrefsDialogHTML.TabNames['main']);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		var screenshot = Foxtrickl10n.getScreenshot('main');
		if (screenshot) {
			var a = doc.createElement('a');
			a.href = screenshot
			a.setAttribute('target','_blank');
			a.appendChild(doc.createTextNode(headstr));
			caption1.appendChild(a);
		}
		else caption1.appendChild(doc.createTextNode(headstr));
		preftab.appendChild(caption1);
        
		
		// language & currency & dateformat & country
        var groupbox = doc.createElement("div");
        groupbox.setAttribute('class',"ft_pref_modul");
		preftab.appendChild(groupbox);
		
        var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_modul");
		groupbox.appendChild(groupbox2);

		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionHTLanguage")));
		groupbox2.appendChild(caption1);
        
		var table= doc.createElement("table");
        groupbox2.appendChild(table);
        var tr= doc.createElement("tr");
        table.appendChild(tr);
		
		var td= doc.createElement("td");
        tr.appendChild(td);
		var selectbox = Foxtrick.getSelectBoxFromXML(doc,"chrome://foxtrick/content/htlocales/htlang.xml", "hattricklanguages/language", "desc", "name",  FoxtrickPrefs.getString("htLanguage"));
		selectbox.setAttribute("id","htLanguage");
		selectbox.setAttribute("style","display:inline-block;");
		td.appendChild(selectbox);
				
		var td= doc.createElement("td");
        tr.appendChild(td);
		var checked = FoxtrickPrefs.getBool("module.FoxtrickReadHtPrefs.enabled");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'ReadHtPrefs', Foxtrickl10n.getString("foxtrick.prefs.captionHTLanguageAutoSet"), checked ) 
		checkdiv.setAttribute("style","display:inline-block;");
		td.appendChild(checkdiv);
		
				
        var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_modul");
		groupbox.appendChild(groupbox2);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionHTCurrency")));
		groupbox2.appendChild(caption1);
		var selectbox = Foxtrick.getSelectBoxFromXML(doc,"chrome://foxtrick/content/htlocales/htcurrency.xml", "hattrickcurrencies/currency", "name", "code", FoxtrickPrefs.getString("htCurrency"));
		selectbox.setAttribute("style","display:block;");
		selectbox.setAttribute("id","htCurrency");
		groupbox2.appendChild(selectbox);

        var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_modul");
		groupbox.appendChild(groupbox2);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionHTDateformat")));
		groupbox2.appendChild(caption1);
		var selectbox = Foxtrick.getSelectBoxFromXML(doc,"chrome://foxtrick/content/htlocales/htdateformat.xml", "hattrickdateformats/dateformat", "name", "code", FoxtrickPrefs.getString("htDateformat"));
		selectbox.setAttribute("style","display:block;");
		selectbox.setAttribute("id","htDateformat");
		groupbox2.appendChild(selectbox);

        var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_modul");
		groupbox.appendChild(groupbox2);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionHTCountry")));
		groupbox2.appendChild(caption1);
		var selectbox = Foxtrick.getSelectBoxFromXML(doc,"chrome://foxtrick/content/htlocales/htcountries.xml", "hattrickcountries/country", "name", "name", FoxtrickPrefs.getString("htCountry"));
		selectbox.setAttribute("style","display:block;");
		selectbox.setAttribute("id","htCountry");
		groupbox2.appendChild(selectbox);

		
        var groupbox= doc.createElement("div");
		groupbox.setAttribute('class',"ft_pref_modul");
		preftab.appendChild(groupbox);

		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionCurrencyConverter")));
		groupbox.appendChild(caption1);
        
		var table= doc.createElement("table");
        groupbox.appendChild(table);
        var tr= doc.createElement("tr");
        table.appendChild(tr);
		
		var td= doc.createElement("td");
        tr.appendChild(td);
		td.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionCurrencySymbolTo")));
		var selectbox = Foxtrick.getSelectBoxFromXML(doc,"chrome://foxtrick/content/htlocales/htcurrency.xml", "hattrickcurrencies/currency", "name", "code", FoxtrickPrefs.getString("htCurrencyTo"));
		selectbox.setAttribute("id","htCurrencyTo");
		selectbox.setAttribute("style","display:inline-block;");
		td.appendChild(selectbox);
				
		var td= doc.createElement("td");
        tr.appendChild(td);
		var checked = FoxtrickPrefs.getBool("module.CurrencyConverter.enabled");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'activeCurrencyConverter', Foxtrickl10n.getString("foxtrick.prefs.activeCurrencyConverter"), checked ) 
		checkdiv.setAttribute("style","display:inline-block;");
		td.appendChild(checkdiv);

		var groupbox= doc.createElement("div");
		groupbox.setAttribute('class',"ft_pref_modul");
		preftab.appendChild(groupbox);
		
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionSkinSettings")));
		groupbox.appendChild(caption1);
        
		var input_option_text = doc.createElement( "input" );	
		input_option_text.setAttribute( "type", "text" );
		input_option_text.setAttribute( "id", 'cssskinpref' );
		input_option_text.setAttribute( "value",FoxtrickPrefs.getString( "cssSkin" ));
		input_option_text.setAttribute( "class", "ft_pref_input_option_text");
		groupbox.appendChild( input_option_text);		

		var button= doc.createElement("input");
		button.setAttribute("value",Foxtrickl10n.getString("foxtrick.prefs.skinButtonSelectFile"));
		button.setAttribute( "type", "button" );		
		button.setAttribute('inputid',"cssskinpref");
		button.setAttribute('id',"skinButtonSelectFile");
		button.addEventListener('click',FoxtrickPrefsDialogHTML.selectfile,false);
		groupbox.appendChild(button);

		var checked = FoxtrickPrefs.getBool("module.SkinPlugin.enabled");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'SkinPlugin', Foxtrickl10n.getString("foxtrick.prefs.activeSkin"), checked ) 
		checkdiv.setAttribute("style","display:inline-block;");
		groupbox.appendChild(checkdiv);

		
		
		// alert slider
		var groupbox= doc.createElement("div");
		groupbox.setAttribute('class',"ft_pref_modul");
		preftab.appendChild(groupbox);
		
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionAlertSettings")));
		groupbox .appendChild(caption1);
		
        var checked = FoxtrickPrefs.getBool("alertSlider");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'alertsliderpref', Foxtrickl10n.getString("foxtrick.prefs.alertsliderpref"), checked ) 
		groupbox.appendChild(checkdiv);

		var checked = FoxtrickPrefs.getBool("alertSliderGrowl");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'alertslidermacpref', Foxtrickl10n.getString("foxtrick.prefs.alertslidermacpref"), checked ) 
		groupbox.appendChild(checkdiv);

		var input_option_text = doc.createElement( "input" );	
		input_option_text.setAttribute( "type", "text" );
		input_option_text.setAttribute( "id", 'alertsoundurlpref' );
		input_option_text.setAttribute( "value",FoxtrickPrefs.getString( "alertSoundUrl" ));
		input_option_text.setAttribute( "class", "ft_pref_input_option_text");
		groupbox.appendChild( input_option_text);		

		var button= doc.createElement("input");
		button.setAttribute("value",Foxtrickl10n.getString("foxtrick.prefs.buttonSelectFile"));
		button.setAttribute( "type", "button" );		
		button.setAttribute('inputid',"alertsoundurlpref");
		button.setAttribute('id',"buttonSelectFile");
		button.addEventListener('click',FoxtrickPrefsDialogHTML.selectfile,false);
		groupbox.appendChild(button);

		var button= doc.createElement("input");
		button.setAttribute("value",Foxtrickl10n.getString("foxtrick.prefs.buttonTest"));
		button.setAttribute( "type", "button" );		
		button.setAttribute('id',"buttonTest");
		button.addEventListener('click',FoxtrickPrefsDialogHTML.playsound,false);
		groupbox.appendChild(button);

		var checked = FoxtrickPrefs.getBool("alertSound");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'alertsoundpref', Foxtrickl10n.getString("foxtrick.prefs.alertsoundpref"), checked ) 
		groupbox.appendChild(checkdiv);



		// LoadSavePrefs
		var groupbox= doc.createElement("div");
		groupbox.setAttribute('class',"ft_pref_modul");
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
		button.addEventListener('click',FoxtrickPreferencesDialog.SavePrefs,false);
		td.appendChild(button);

		var td= doc.createElement("td");
        tr.appendChild(td);
		var caption1= doc.createElement("div");
        caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.labelSavePrefs")));
		td.appendChild(caption1);

		var checked = FoxtrickPrefs.getBool("SavePrefs_Prefs");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'saveprefsid', Foxtrickl10n.getString("foxtrick.prefs.labelSavePrefs_Prefs"), checked ) 
		td.appendChild(checkdiv);

		var checked = FoxtrickPrefs.getBool("SavePrefs_Notes");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'savenotesid', Foxtrickl10n.getString("foxtrick.prefs.labelSavePrefs_Notes"), checked ) 
		td.appendChild(checkdiv);

		var tr= doc.createElement("tr");
        table.appendChild(tr);
		
		var td= doc.createElement("td");
        tr.appendChild(td);

		var button= doc.createElement("input");
		button.setAttribute("value",Foxtrickl10n.getString("foxtrick.prefs.buttonLoadPrefs"));
		button.setAttribute( "type", "button" );		
		button.setAttribute('id',"buttonLoadPrefs");
		button.addEventListener('click',FoxtrickPreferencesDialog.LoadPrefs,false);
		td.appendChild(button);

		var td= doc.createElement("td");
        tr.appendChild(td);
		var caption1= doc.createElement("div");
        caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.labelLoadPrefs")));
		td.appendChild(caption1);

		// changin all prefs
		var groupbox= doc.createElement("div");
		groupbox.setAttribute('class',"ft_pref_modul");
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
		button.addEventListener('click',FoxtrickPreferencesDialog.confirmCleanupBranch,false);
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
		button.addEventListener('click',FoxtrickPreferencesDialog.disableAll,false);
		td.appendChild(button);

		var td= doc.createElement("td");
        tr.appendChild(td);
		var caption1= doc.createElement("div");
        caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.labelDisableAll")));
		td.appendChild(caption1);
		
		// old versions myht
		var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_modul");
		preftab.appendChild(groupbox2);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionFoxtrickMyHT")));
		groupbox2.appendChild(caption1);
		var selectbox = Foxtrick.getSelectBoxFromXML(doc,"chrome://foxtrick/content/htlocales/htversions.xml", "hattrickversions/version", "name", "code", FoxtrickPrefs.getString("oldVersion"));
		selectbox.setAttribute("style","display:inline;");
		selectbox.setAttribute("id","htOldVersion");
		groupbox2.appendChild(selectbox);
		var td= doc.createElement("td");
        tr.appendChild(td);
		var caption1= doc.createElement("div"); 
		var a = doc.createElement('a');
		a.href = Foxtrickl10n.getScreenshot('FoxtrickMyHT');
		a.setAttribute('target','_blank');
		a.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.labelFoxtrickMyHT")));
        caption1.appendChild(a);
		caption1.setAttribute("style","display:inline;");
		groupbox2.appendChild(caption1);

		
		// disable options
		var groupbox= doc.createElement("div");
		groupbox.setAttribute('class',"ft_pref_modul");
		preftab.appendChild(groupbox);
		
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionDisableSettings")));
		groupbox .appendChild(caption1);
		
        // stage
		var checked = FoxtrickPrefs.getBool("disableOnStage");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'stagepref', Foxtrickl10n.getString("foxtrick.prefs.stagepref"), checked ) 
		groupbox.appendChild(checkdiv);

		// temporary
		var checked = FoxtrickPrefs.getBool("disableTemporary");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'disableTemporary', Foxtrickl10n.getString("foxtrick.prefs.disableTemporaryLabel"), checked ) 
		groupbox.appendChild(checkdiv);

		
		// statusbar
		var groupbox= doc.createElement("div");
		groupbox.setAttribute('class',"ft_pref_modul");
		preftab.appendChild(groupbox);
	
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionShowOnStatusBar")));
		groupbox .appendChild(caption1);
		
        var checked = FoxtrickPrefs.getBool("statusbarshow");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'statusbarpref', Foxtrickl10n.getString("foxtrick.prefs.statusbarpref"), checked ) 
		groupbox.appendChild(checkdiv);
		
		// AdditionalOptions
		var groupbox= doc.createElement("div");
		groupbox.setAttribute('class',"ft_pref_modul");
		preftab.appendChild(groupbox);
		
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.AdditionalOptions")));
		groupbox .appendChild(caption1);
		
 		var checked = FoxtrickPrefs.getBool("copyfeedback");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'copyfeedback', Foxtrickl10n.getString("foxtrick.prefs.copyfeedback"), checked ) 
		groupbox.appendChild(checkdiv);
		
	},
	
	fill_help_list : function( doc ) {
		var preftab = doc.getElementById('help');

		var headstr = Foxtrickl10n.getString("foxtrick.prefs."+FoxtrickPrefsDialogHTML.TabNames['help']);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		var screenshot = Foxtrickl10n.getScreenshot('help');
		if (screenshot) {
			var a = doc.createElement('a');
			a.href = screenshot
			a.setAttribute('target','_blank');
			a.appendChild(doc.createTextNode(headstr));
			caption1.appendChild(a);
		}
		else caption1.appendChild(doc.createTextNode(headstr));
		preftab.appendChild(caption1);
 		
		var xmlresponse = Foxtrick.LoadXML("chrome://foxtrick/content/htlocales/foxtrick_about.xml");	
		
		// links
		var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_modul");
		preftab.appendChild(groupbox2);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString('foxtrick.prefs.'+Foxtrick.XML_evaluate(xmlresponse, "about/links", "value")[0])));
		groupbox2.appendChild(caption1);
		var links = Foxtrick.XML_evaluate(xmlresponse, "about/links/link", "title", "value");		
		for (var i=0;i<links.length;++i) {
			groupbox2.appendChild(doc.createTextNode(Foxtrickl10n.getString('foxtrick.prefs.'+links[i][0])+': '));
			var a = doc.createElement('a');
			a.href = links[i][1];
			a.setAttribute('target','_blank');
			a.appendChild(doc.createTextNode(links[i][1]));
			groupbox2.appendChild(a);
			groupbox2.appendChild(doc.createElement('br'));
		}
		
		groupbox2.appendChild(doc.createTextNode(Foxtrickl10n.getString("FoxtrickMyHtHelpPage")));				
		groupbox2.appendChild(doc.createTextNode(" "));				
		var a=doc.createElement('a');
		a.href=Foxtrickl10n.getString("FoxtrickMyHtHelpPageLink");
		a.innerHTML=Foxtrickl10n.getString("FoxtrickMyHtHelpPageLink");
		a.target="_blank";
		groupbox2.appendChild(a);				
		groupbox2.appendChild(doc.createElement('br'));
	},
	
	
	fill_about_list : function( doc ) {

		var preftab = doc.getElementById('about');

		var headstr = Foxtrickl10n.getString("foxtrick.prefs."+FoxtrickPrefsDialogHTML.TabNames['about']);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		var screenshot = Foxtrickl10n.getScreenshot('about');
		if (screenshot) {
			var a = doc.createElement('a');
			a.href = screenshot
			a.setAttribute('target','_blank');
			a.appendChild(doc.createTextNode(headstr));
			caption1.appendChild(a);
		}
		else caption1.appendChild(doc.createTextNode(headstr));
		preftab.appendChild(caption1);
 		
		var xmlresponse = Foxtrick.LoadXML("chrome://foxtrick/content/htlocales/foxtrick_about.xml");	

		// head_developer
		var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_modul");
		preftab.appendChild(groupbox2);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrick.XML_evaluate(xmlresponse, "about/head_developer", "value")[0]));
		groupbox2.appendChild(caption1);
		var labels = Foxtrick.XML_evaluate(xmlresponse, "about/head_developer/label", "value");		
		for (var i=0;i<labels.length;++i) {			
			groupbox2.appendChild(doc.createTextNode(labels[i]));
			groupbox2.appendChild(doc.createElement('br'));
		}
		
		// project_owners
		var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_modul");
		preftab.appendChild(groupbox2);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrick.XML_evaluate(xmlresponse, "about/project_owners", "value")[0]));
		groupbox2.appendChild(caption1);
		var labels = Foxtrick.XML_evaluate(xmlresponse, "about/project_owners/label", "value");		
		for (var i=0;i<labels.length;++i) {			
			groupbox2.appendChild(doc.createTextNode(labels[i]));
			groupbox2.appendChild(doc.createElement('br'));
		}

		// developers
		var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_modul");
		preftab.appendChild(groupbox2);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrick.XML_evaluate(xmlresponse, "about/developers", "value")[0]));
		groupbox2.appendChild(caption1);
		var labels = Foxtrick.XML_evaluate(xmlresponse, "about/developers/label", "value");		
		for (var i=0;i<labels.length;++i) {			
			groupbox2.appendChild(doc.createTextNode(labels[i]));
			groupbox2.appendChild(doc.createElement('br'));
		}

		// translations
		var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_modul");
		preftab.appendChild(groupbox2);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrick.XML_evaluate(xmlresponse, "about/translations", "value")[0]));
		groupbox2.appendChild(caption1);
		var labels = Foxtrick.XML_evaluate(xmlresponse, "about/translations/label", "value");		
		for (var i=0;i<labels.length;++i) {			
			groupbox2.appendChild(doc.createTextNode(labels[i]));
			groupbox2.appendChild(doc.createElement('br'));
		}
	},
	
	
	fill_changes_list : function( doc ) {
		var preftab = doc.getElementById('changes');

		var headstr = Foxtrickl10n.getString("foxtrick.prefs."+FoxtrickPrefsDialogHTML.TabNames['changes']);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		var screenshot = Foxtrickl10n.getScreenshot('changes');
		if (screenshot) {
			var a = doc.createElement('a');
			a.href = screenshot
			a.setAttribute('target','_blank');
			a.appendChild(doc.createTextNode(headstr));
			caption1.appendChild(a);
		}
		else caption1.appendChild(doc.createTextNode(headstr));
		preftab.appendChild(caption1);
		
		var oldVersion = FoxtrickPrefs.getString("oldVersion");
		var curVersion = FoxtrickPrefs.getString("curVersion"); 
		FoxtrickMyHT.getNewModules(curVersion,oldVersion);	
		
		var commondiv=doc.createElement('div');
		commondiv.setAttribute('id','FoxtrickMyHTCommon');
		preftab.appendChild(commondiv);				
		FoxtrickMyHT.ShowAlertCommon(doc, oldVersion);

	},
	
	
	fill_list : function( doc, category ) {
		var preftab = doc.getElementById(category);
		
		var headstr = Foxtrickl10n.getString("foxtrick.prefs."+FoxtrickPrefsDialogHTML.TabNames[category]);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		var screenshot = Foxtrickl10n.getScreenshot(category);
		if (screenshot) {
			var a = doc.createElement('a');
			a.href = screenshot
			a.setAttribute('target','_blank');
			a.appendChild(doc.createTextNode(headstr));
			caption1.appendChild(a);
		}
		else caption1.appendChild(doc.createTextNode(headstr));
		preftab.appendChild(caption1);
 
		
		for ( i in Foxtrick.modules ) {
			var module = Foxtrick.modules[i];
            var module_category = module.MODULE_CATEGORY;
            if (!module_category) {
                // MODULE_CATEGORY isn't set; use default
                module_category = "shortcutsandtweaks";
            }
            if (module_category == category) {
				var entry;
				if (module.RADIO_OPTIONS != null) {
					entry = FoxtrickPrefsDialogHTML._radioModule(doc, module);
				} else if (module.OPTIONS != null) {
					entry = FoxtrickPrefsDialogHTML._checkboxModule(doc, module);
				} else {
					entry = FoxtrickPrefsDialogHTML._normalModule(doc, module);
				}
				preftab.appendChild( entry );
            }
		}
    },
	
	_radioModule : function(doc, module ) {
		var entry = doc.createElement( "div" );
		entry.setAttribute( "class", "ft_pref_modul" );
		entry.prefname = module.MODULE_NAME;
		var module_checked = Foxtrick.isModuleEnabled( module );
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, module.MODULE_NAME, module.MODULE_NAME, module_checked )
		entry.appendChild( checkdiv );			
		entry.appendChild (doc.createTextNode(FoxtrickPreferencesDialog.getModuleDescription( module.MODULE_NAME ) ));
		
		checkdiv.firstChild.addEventListener( "click", function( ev ) {
				var checked = ev.currentTarget.checked;
				var optiondiv =ev.currentTarget.parentNode.nextSibling.nextSibling;	
				if (checked) optiondiv.style.display='block';
				else optiondiv.style.display='none'; 			
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
			var desc = FoxtrickPreferencesDialog.getModuleDescription( module.MODULE_NAME + "." + module.RADIO_OPTIONS[i] );
			
			optiondiv.appendChild( FoxtrickPrefsDialogHTML._getRadio (doc, group, desc, selected ) );					
		}
		if (module_checked) optiondiv.setAttribute( "style", "display:block;" );
		else optiondiv.setAttribute( "style", "display:none;" );

		entry.appendChild( optiondiv );

		return entry;
	},
	
	_checkboxModule : function (doc, module) {
		var entry = doc.createElement( "div" );
		entry.setAttribute( "class", "ft_pref_modul" );
		entry.prefname = module.MODULE_NAME;
		var module_checked = Foxtrick.isModuleEnabled( module );
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, module.MODULE_NAME, module.MODULE_NAME, module_checked ) 
		entry.appendChild( checkdiv);			
		entry.appendChild (doc.createTextNode(FoxtrickPreferencesDialog.getModuleDescription( module.MODULE_NAME ) ));

		checkdiv.firstChild.addEventListener( "click", function( ev ) {
				var checked = ev.currentTarget.checked;
				var optiondiv =ev.currentTarget.parentNode.nextSibling.nextSibling;	
				if (checked) optiondiv.style.display='block';
				else optiondiv.style.display='none'; 			
			}, false );

		var optiondiv = doc.createElement( "div" );
		optiondiv.setAttribute( "class", "ft_pref_checkbox_group" );
		for (var i = 0; i < module.OPTIONS.length; i++) {
			var key,title;
			if (module.OPTIONS[i]["key"]==null){
                key = module.OPTIONS[i];
                title = FoxtrickPreferencesDialog.getModuleElementDescription( module.MODULE_NAME, module.OPTIONS[i] );
            }
			else { 
				key = module.OPTIONS[i]["key"];
				title=module.OPTIONS[i]["title"];
			}
			
			var OptionText = null;
			if ( module.OPTION_TEXTS != null && module.OPTION_TEXTS
				&& (!module.OPTION_TEXTS_DISABLED_LIST || !module.OPTION_TEXTS_DISABLED_LIST[i])) {
				
				var val = FoxtrickPrefs.getString( "module." + module.MODULE_NAME + "." + key + "_text" );
				if (!val && module.OPTION_TEXTS_DEFAULT_VALUES && module.OPTION_TEXTS_DEFAULT_VALUES[i]){
					val = module.OPTION_TEXTS_DEFAULT_VALUES[i];
				}
				OptionText = val;
			}
																
			var checked = Foxtrick.isModuleFeatureEnabled( module, key)
			var group = module.MODULE_NAME + '.' + key;
			optiondiv.appendChild(FoxtrickPrefsDialogHTML._getCheckBox(doc, group, title,  checked, OptionText ));
		}
		if (module_checked) optiondiv.setAttribute( "style", "display:block;" );
		else optiondiv.setAttribute( "style", "display:none;" );
		entry.appendChild( optiondiv );

		return entry;
	},
		
	_normalModule : function (doc, module) {
		var entry = doc.createElement( "div" );
		entry.setAttribute( "class", "ft_pref_modul" );
		entry.prefname = module.MODULE_NAME;
		entry.appendChild( FoxtrickPrefsDialogHTML._getCheckBox (doc, module.MODULE_NAME, module.MODULE_NAME, Foxtrick.isModuleEnabled( module ) ) );			
		entry.appendChild (doc.createTextNode(FoxtrickPreferencesDialog.getModuleDescription( module.MODULE_NAME ) ));
		return entry;
	},
		
	_getCheckBox : function (doc, name, label,  checked , option_text) {
		var div = doc.createElement( "div" );	
		var check = doc.createElement( "input" );	
		check.setAttribute( "type", "checkbox" );
		check.setAttribute( "name", name );
		check.setAttribute( "id", name );
		if (checked) check.setAttribute( "checked", "checked" );
		div.appendChild( check );
		
		var screenshot = Foxtrickl10n.getScreenshot(name);
		var divlabel = doc.createElement( "div" );	
		divlabel.setAttribute( "class", "checkbox_label" );
		if (screenshot) {
			var a = doc.createElement('a');
			a.href = Foxtrickl10n.getScreenshot(name);
			a.setAttribute('target','_blank');
			a.appendChild(doc.createTextNode(label));
			divlabel.appendChild( a );
		}
		else divlabel.appendChild( doc.createTextNode(label) );
		div.appendChild( divlabel );
								
		if (option_text) {
			check.addEventListener( "click", function( ev ) {
					var checked = ev.currentTarget.checked;
					var optiondiv =ev.currentTarget.nextSibling.nextSibling.nextSibling;
					if (checked) optiondiv.style.display='block';
					else optiondiv.style.display='none'; 			
				}, false );

			div.appendChild( doc.createElement('br') );
		
			var input_option_text = doc.createElement( "input" );	
			input_option_text.setAttribute( "type", "text" );
			input_option_text.setAttribute( "name", name+'_text' );
			input_option_text.setAttribute( "id", name+'_text' );
			input_option_text.setAttribute( "value", option_text);
			input_option_text.setAttribute( "class", "ft_pref_input_option_text");
			if (checked) input_option_text.setAttribute( "style", "display:block;" );
			else input_option_text.setAttribute( "style", "display:none;" );
			div.appendChild( input_option_text);		
		}
		
		return div;
	},
	
	_getRadio : function (doc, name, label,  checked ) {
		var div = doc.createElement( "div" );	
		var check = doc.createElement( "input" );	
		check.setAttribute( "type", "radio" );
		check.setAttribute( "name", name );
		if (checked) check.setAttribute( "checked", "checked" );
		div.appendChild( check );
		div.appendChild( doc.createTextNode(label) );
		return div;
	},
	
	
}	

