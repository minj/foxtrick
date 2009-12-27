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
	CSS:"chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/css/preferences-dialog-html.css",

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
	try{				
		if (doc.location.pathname.search(/^\/$|\/MyHattrick\/|\/Community|Default.aspx\?authCode/)==-1) return;
		if (doc.location.pathname.search(/^\/$|\/MyHattrick|\/Community/)!=-1) { 
			FoxtrickPrefsDialogHTML.add_pref_links(doc);			
		}	
		if (doc.location.href.search(/configure_foxtrick=true/i)!=-1) { 
			if (Foxtrick.BuildFor=='Chrome') Foxtrick.addStyleSheet( document, this.CSS ) ;		
			FoxtrickPrefsDialogHTML.show_pref(doc);			
		}
		else if (Foxtrick.BuildFor=='Chrome') Foxtrick.reload_css_permanent( this.CSS ) ;
	}catch (e){dump('HTMLPrefs '+e+'\n');}
	},

	change : function( doc ) { 
	},
	
	add_pref_links : function( doc) {
		if (doc.getElementById('id_configure_foxtrick')) return;
		try{
		var foxtrick_pref_link = doc.createElement('a');
		foxtrick_pref_link.setAttribute('id','id_configure_foxtrick');
		foxtrick_pref_link.setAttribute('href','/MyHattrick/?configure_foxtrick=true&category=main');
		foxtrick_pref_link.appendChild(doc.createTextNode('FoxTrick'));	
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
		
		doc.getElementById('sidebar').style.display='none';
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
		prefdiv.setAttribute('style','display:none'); 
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
		prefcancel.addEventListener('click',FoxtrickPrefsDialogHTML.cancel,false);
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

		FoxtrickPrefsDialogHTML.add_tab( doc, Foxtrick.moduleCategories.MAIN) ;
		FoxtrickPrefsDialogHTML.add_tab( doc, Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS) ;
		FoxtrickPrefsDialogHTML.add_tab( doc, Foxtrick.moduleCategories.PRESENTATION ) ;
		FoxtrickPrefsDialogHTML.add_tab( doc, Foxtrick.moduleCategories.MATCHES) ;
		FoxtrickPrefsDialogHTML.add_tab( doc, Foxtrick.moduleCategories.FORUM ) ;
		FoxtrickPrefsDialogHTML.add_tab( doc, Foxtrick.moduleCategories.LINKS) ;		
		FoxtrickPrefsDialogHTML.add_tab( doc, Foxtrick.moduleCategories.CHANGES) ;		
		FoxtrickPrefsDialogHTML.add_tab( doc, Foxtrick.moduleCategories.HELP) ;		
		FoxtrickPrefsDialogHTML.add_tab( doc, Foxtrick.moduleCategories.ABOUT) ;		

		
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

		
		prefdiv.setAttribute('style','display:inline'); 
		
		// highlight elements: url ... &highlight=id1+id2+id3
		try {
			if (doc.location.href.search(/highlight=/i)!=-1) { 
				var highlightlist=doc.location.href.match(/highlight=([\w\.\+]+)/);
				var highlight=highlightlist[1].match(/([\w\.]+)/g);				
				for (var i=0;i<highlight.length;++i) {
					var element=doc.getElementById(highlight[i]); 
					var parent=element.parentNode;
					if (element.getAttribute('type') && element.getAttribute('type')=='checkbox') 
						parent=element.parentNode.parentNode.parentNode.parentNode;  // parent div
				 
					parent.setAttribute('class', parent.getAttribute('class')+' ft_pref_highlight');
				}
			}
		} catch (e){}
		
	} catch(e){dump('show_prefs: '+e+'\n');}
	},


	show_tab : function( ev ) {
		var doc = ev.target.ownerDocument;
		var foxtrick_prefs_head = doc.getElementById('foxtrick_prefs_head').childNodes;
		var foxtrick_preftabs = doc.getElementById('foxtrick_preftabs').childNodes;
		var tab = ev.target.getAttribute('tab');
		if (tab=='changes') FoxtrickMain.IsNewVersion=false;
		
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
		var doc = ev.target.ownerDocument;
		doc.defaultView.status = '/MyHattrick/?configure_foxtrick=true&category='+ev.target.getAttribute('tab');		
	},

	
	save : function( ev ) { dump('pref save\n');
	try { 
		var doc = ev.target.ownerDocument;
		if (Foxtrick.BuildFor=='Chrome') FoxtrickPrefs.do_dump = false;
		
		var full_prefs = (doc.getElementById("htLanguage")!=null); // check if full pref page (not newversionquickset or onpageprefs)
		// clean up
		if (full_prefs) {  
			var array = FoxtrickPrefs._getElemNames("");
			for(var i = 0; i < array.length; i++) {
				if (FoxtrickPrefs.isPrefSetting(array[i]))
					//Foxtrick.dump(array[i]+'\n');
					FoxtrickPrefs.deleteValue( array[i] );
			}
			// set version
			var curVersion = FoxtrickPrefs.getString("curVersion");
			var oldVersion = FoxtrickPrefs.getString("oldVersion");
			FoxtrickPrefs.setString("oldVersion",curVersion);
		}
			
		for ( var i in Foxtrick.modules ) {
			var module = Foxtrick.modules[i];
			
			if (!module.MODULE_CATEGORY || module.MODULE_CATEGORY==Foxtrick.moduleCategories.MAIN ) {
				// if main, set default and again right bellow if needed!
				//Foxtrick.dump('save '+module.MODULE_NAME+' : '+module.DEFAULT_ENABLED+'\n');					
				if (full_prefs) FoxtrickPrefs.setModuleEnableState(module.MODULE_NAME, module.DEFAULT_ENABLED);
				continue;
			}
			if (doc.getElementById(module.MODULE_NAME)) {
				var checked =  doc.getElementById(module.MODULE_NAME).checked;	
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
			} else if (module.OPTIONS != null) {
				for (var i = 0; i < module.OPTIONS.length; i++) {
					var key,title;
					if (module.OPTIONS[i]["key"]==null){
						key = module.OPTIONS[i];
					}
					else { 
						key = module.OPTIONS[i]["key"];
					}
					FoxtrickPrefs.setModuleEnableState(module.MODULE_NAME+'.'+key, doc.getElementById(module.MODULE_NAME+'.'+key).checked);
			
					if  (module.OPTION_TEXTS != null && module.OPTION_TEXTS
					&& (!module.OPTION_TEXTS_DISABLED_LIST || !module.OPTION_TEXTS_DISABLED_LIST[i])
					&& doc.getElementById(module.MODULE_NAME+'.'+key+'_text')) {
				   
						FoxtrickPrefs.setModuleOptionsText( module.MODULE_NAME + "." + key+ "_text", 
													doc.getElementById(module.MODULE_NAME+'.'+key+'_text').value );        
					}
				}
			}
		}
		
		if (Foxtrick.BuildFor=='Chrome') {  // fix for double saving mainprefs with module
			//FoxtrickPrefs.pref_save_dump = FoxtrickPrefs.pref_save_dump.replace(/\nuser_pref\("extensions.foxtrick.prefs.module.CurrencyConverter.enabled",.+\);/g,'');
			//FoxtrickPrefs.pref_save_dump = FoxtrickPrefs.pref_save_dump.replace(/\nuser_pref\("extensions.foxtrick.prefs.module.ReadHtPrefs.enabled",.+\);/g,'');
 		}
		
		if (doc.getElementById("OnPagePrefs")) FoxtrickPrefs.setBool("module.OnPagePrefs.enabled", doc.getElementById("OnPagePrefs").checked);
        if (doc.getElementById("CurrencyConverter")) FoxtrickPrefs.setBool("module.CurrencyConverter.enabled", doc.getElementById("CurrencyConverter").checked); 

		
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
		
		// disable warning
		FoxtrickPrefs.setBool( "PrefsSavedOnce" ,true);
		
        //Lang
        FoxtrickPrefs.setString("htLanguage", doc.getElementById("htLanguage").value);		
		FoxtrickPrefs.setBool("module.ReadHtPrefs.enabled", doc.getElementById("ReadHtPrefs").checked);
 
		//Currency
        FoxtrickPrefs.setString("htCurrency", doc.getElementById("htCurrency").value);
        
		//Country
        FoxtrickPrefs.setString("htCountry", doc.getElementById("htCountry").value);

        FoxtrickPrefs.setInt("htSeasonOffset", Math.floor(FoxtrickPrefsDialogHTML.getOffsetValue(doc.getElementById("htCountry").value)));        
            
        //Currency Converter
       
        FoxtrickPrefs.setString("htCurrencyTo", doc.getElementById("htCurrencyTo").value);
        FoxtrickPrefs.setString("currencySymbol", FoxtrickPrefsDialogHTML.getConverterCurrValue(doc.getElementById("htCurrencyTo").value,"new",Foxtrick.XMLData.htCurrencyXml));
        FoxtrickPrefs.setString("currencyRateTo", FoxtrickPrefsDialogHTML.getConverterCurrValue(doc.getElementById("htCurrencyTo").value,"rate",Foxtrick.XMLData.htCurrencyXml));
    
        FoxtrickPrefs.setString("oldCurrencySymbol", FoxtrickPrefsDialogHTML.getConverterCurrValue(doc.getElementById("htCurrency").value,"old",Foxtrick.XMLData.htCurrencyXml));
        FoxtrickPrefs.setString("currencyRate", FoxtrickPrefsDialogHTML.getConverterCurrValue(doc.getElementById("htCurrency").value,"rate",Foxtrick.XMLData.htCurrencyXml));
		FoxtrickPrefs.setString("currencyCode", FoxtrickPrefsDialogHTML.getConverterCurrValue(doc.getElementById("htCurrency").value,"code",Foxtrick.XMLData.htCurrencyXml));
        
		//Dateformat
        FoxtrickPrefs.setString("htDateformat", doc.getElementById("htDateformat").value);

        //Statusbar
        FoxtrickPrefs.setBool("statusbarshow", doc.getElementById("statusbarpref").checked);
        FoxtrickPrefs.setBool("statusbarshowreload", doc.getElementById("statusbarshowreload").checked);

        //Alert
        FoxtrickPrefs.setBool("alertSlider", doc.getElementById("alertsliderpref").checked);
        FoxtrickPrefs.setBool("alertSliderGrowl", doc.getElementById("alertslidermacpref").checked);
        FoxtrickPrefs.setBool("alertSliderDBus", doc.getElementById("alertsliderdbus").checked);
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
		/* obsolete
		FoxtrickPrefs.setString("oldVersion", doc.getElementById("htOldVersion").value);
		*/
		
		// additional options
		FoxtrickPrefs.setBool("copyfeedback", doc.getElementById("copyfeedback").checked);
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
		dump('end save\n');
	} catch (e) { 
		if (Foxtrick.BuildFor=='Chrome') FoxtrickPrefs.do_dump = true;
		dump ('FoxtrickPrefsDialogHTML->save: '+e+'\n');
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
	try{	
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
			if (active_tab=='changes') FoxtrickMain.IsNewVersion=false;
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
	} catch(e) {dump('add_tab '+e+'\n');}
	},
		
	
	fill_main_list : function( doc ) {
	try{	var preftab = doc.getElementById('main');
		
		var table = doc.createElement( "table" );	
		preftab.appendChild( table );
		var tr = doc.createElement( "tr" );	
		table.appendChild( tr );
		var td = doc.createElement( "td" );	
		tr.appendChild( td );

		var headstr = Foxtrickl10n.getString("foxtrick.prefs."+FoxtrickPrefsDialogHTML.TabNames['main']);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_list_caption");
		caption1.appendChild(doc.createTextNode(headstr));
		td.appendChild(caption1);

		var td = doc.createElement( "td" );	
		td.setAttribute('class','ft_prefs_screenshot_td');
		tr.appendChild( td );
		var screenshot = Foxtrickl10n.getScreenshot('main');		
		if (screenshot) {
			var helpdiv = doc.createElement("div");
			helpdiv.setAttribute("class","ft_actionicon foxtrickHelp float_right");
			helpdiv.setAttribute('title',Foxtrickl10n.getString("foxtrick.prefs.commented_screenshots"));
			var a = doc.createElement('a');
			a.href = screenshot;
			a.setAttribute('target','_blank');
			a.innerHTML="<img src='chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/linkicons/transparent16.png'>";
			helpdiv.appendChild(a);
			td.appendChild( helpdiv );
		}
        		
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
		
		var selectbox = Foxtrick.getSelectBoxFromXML2(doc,Foxtrick.XMLData.htLanguagesXml, "hattricklanguages/language", "desc", "name",  FoxtrickPrefs.getString("htLanguage"));
		selectbox.setAttribute("id","htLanguage");
		selectbox.setAttribute("style","display:inline-block;");
		td.appendChild(selectbox);
				
		var td= doc.createElement("td");
        tr.appendChild(td);
		var checked = FoxtrickPrefs.getBool("module.ReadHtPrefs.enabled"); 
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'ReadHtPrefs', Foxtrickl10n.getString("foxtrick.ReadHtPrefs.desc"),'', checked ) 
		checkdiv.setAttribute("style","display:inline-block;");
		td.appendChild(checkdiv);
		
				
        var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_modul");
		groupbox.appendChild(groupbox2);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionHTCurrency")));
		groupbox2.appendChild(caption1);
		var selectbox = Foxtrick.getSelectBoxFromXML2(doc,Foxtrick.XMLData.htCurrencyXml, "hattrickcurrencies/currency", "name", "code", FoxtrickPrefs.getString("htCurrency"));
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
		var selectbox = Foxtrick.getSelectBoxFromXML2(doc, Foxtrick.XMLData.htdateformat, "hattrickdateformats/dateformat", "name", "code", FoxtrickPrefs.getString("htDateformat"));
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
		var selectbox = Foxtrick.getSelectBoxFromXML3(doc,Foxtrick.XMLData.League, "EnglishName", FoxtrickPrefs.getString("htCountry"));
		selectbox.setAttribute("style","display:block;");
		selectbox.setAttribute("id","htCountry");
		groupbox2.appendChild(selectbox);

		// currency converter
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
		td.setAttribute('style',"width:260px");
        tr.appendChild(td);
		td.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionCurrencySymbolTo")));
		var selectbox = Foxtrick.getSelectBoxFromXML2(doc,Foxtrick.XMLData.htCurrencyXml, "hattrickcurrencies/currency", "name", "code", FoxtrickPrefs.getString("htCurrencyTo"));
		selectbox.setAttribute("id","htCurrencyTo");
		selectbox.setAttribute("style","display:inline-block;");
		td.appendChild(selectbox);
				
		var td= doc.createElement("td");
        td.setAttribute('style',"vertical-align:middle;");
        tr.appendChild(td);
		var br= doc.createElement("br");
        td.appendChild(br);
		var checked = FoxtrickPrefs.getBool("module.CurrencyConverter.enabled");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'CurrencyConverter', Foxtrickl10n.getString("foxtrick.prefs.activeCurrencyConverter"),'', checked ) 
		checkdiv.setAttribute("style","display:inline-block;");
		td.appendChild(checkdiv);

		
		// skin plugin
		var groupbox= doc.createElement("div");
		groupbox.setAttribute('class',"ft_pref_modul");
		if (Foxtrick.BuildFor=='Chrome') groupbox.setAttribute('style',"display:none !important");
		preftab.appendChild(groupbox);
		
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionSkinSettings")));
		groupbox.appendChild(caption1);
		var div= doc.createElement("div");
		groupbox.appendChild(div);
        
		
		var input_option_text = doc.createElement( "input" );	
		input_option_text.setAttribute( "type", "text" );
		input_option_text.setAttribute( "id", 'cssskinpref' );
		input_option_text.setAttribute( "value",FoxtrickPrefs.getString( "cssSkin" ));
		input_option_text.setAttribute( "class", "ft_pref_input_option_text");
		div.appendChild( input_option_text);		
		
		var button= doc.createElement("input");
		button.setAttribute("value",Foxtrickl10n.getString("foxtrick.prefs.skinButtonSelectFile"));
		button.setAttribute( "type", "button" );		
		button.setAttribute('inputid',"cssskinpref");
		button.setAttribute('id',"skinButtonSelectFile");
		button.addEventListener('click',FoxtrickPrefsDialogHTML.selectfile,false);
		div.appendChild(button);

		var checked = FoxtrickPrefs.getBool("module.SkinPlugin.enabled"); 
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'SkinPlugin', Foxtrickl10n.getString("foxtrick.prefs.activeSkin"), '', checked ) 
		checkdiv.setAttribute("style","display:inline-block;margin-left:10px; vertical-align:middle;");
		div.appendChild(checkdiv);
		
		
		// alert slider
		var groupbox= doc.createElement("div");
		groupbox.setAttribute('class',"ft_pref_modul");
		preftab.appendChild(groupbox);

		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionAlertSettings")));
		groupbox .appendChild(caption1);

		var div= doc.createElement("div");
		groupbox.appendChild(div);
		
        var checked = FoxtrickPrefs.getBool("alertSlider");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'alertsliderpref', Foxtrickl10n.getString("foxtrick.prefs.alertsliderpref"),'', checked ) 
		div.appendChild(checkdiv);

		var checked = FoxtrickPrefs.getBool("alertSliderGrowl");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'alertslidermacpref', Foxtrickl10n.getString("foxtrick.prefs.alertslidermacpref"),'', checked ) 
		div.appendChild(checkdiv);

		var checked = FoxtrickPrefs.getBool("alertSliderDBus");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'alertsliderdbus', Foxtrickl10n.getString("foxtrick.prefs.alertsliderdbus"),'', checked ) 
		div.appendChild(checkdiv);

		var input_option_text = doc.createElement( "input" );	
		input_option_text.setAttribute( "type", "text" );
		input_option_text.setAttribute( "id", 'alertsoundurlpref' );
		input_option_text.setAttribute( "value",FoxtrickPrefs.getString( "alertSoundUrl" ));
		input_option_text.setAttribute( "class", "ft_pref_input_option_text");
		div.appendChild( input_option_text);		

		var button= doc.createElement("input");
		button.setAttribute("value",Foxtrickl10n.getString("foxtrick.prefs.buttonSelectFile"));
		button.setAttribute( "type", "button" );		
		button.setAttribute('inputid',"alertsoundurlpref");
		button.setAttribute('id',"buttonSelectFile");
		button.addEventListener('click',FoxtrickPrefsDialogHTML.selectfile,false);
		div.appendChild(button);

		var button= doc.createElement("input");
		button.setAttribute("value",Foxtrickl10n.getString("foxtrick.prefs.buttonTest"));
		button.setAttribute( "type", "button" );		
		button.setAttribute('id',"buttonTest");
		button.addEventListener('click',FoxtrickPrefsDialogHTML.playsound,false);
		div.appendChild(button);

		var checked = FoxtrickPrefs.getBool("alertSound");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'alertsoundpref', Foxtrickl10n.getString("foxtrick.prefs.alertsoundpref"),'', checked ) 
		div.appendChild(checkdiv);



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
		
		/* obsolete
		// old versions myht
		var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_modul");
		preftab.appendChild(groupbox2);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.captionFoxtrickMyHT")));
		groupbox2.appendChild(caption1);
		var selectbox = Foxtrick.getSelectBoxFromXML2(doc,Foxtrick.XMLData.htversionsXML, "hattrickversions/version", "name", "code", FoxtrickPrefs.getString("oldVersion"));
		selectbox.setAttribute("style","display:inline;");
		selectbox.setAttribute("id","htOldVersion");
		groupbox2.appendChild(selectbox);
		var td= doc.createElement("td");
        tr.appendChild(td);
		var caption1= doc.createElement("div"); 
		var a = doc.createElement('a');
		a.href = Foxtrickl10n.getScreenshot('FoxtrickPrefsDialogHTML');
		a.setAttribute('target','_blank');
		a.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.labelFoxtrickMyHT")));
        caption1.appendChild(a);
		caption1.setAttribute("style","display:inline;");
		groupbox2.appendChild(caption1);
		*/
		
		// disable options
		var groupbox= doc.createElement("div");
		groupbox.setAttribute('class',"ft_pref_modul");
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
		groupbox.setAttribute('class',"ft_pref_modul");
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
        var checked = FoxtrickPrefs.getBool("statusbarshowreload");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'statusbarshowreload', Foxtrickl10n.getString("foxtrick.prefs.statusbarshowreload"), '', checked ) 
		div.appendChild(checkdiv);
		
		// AdditionalOptions
		var groupbox= doc.createElement("div");
		groupbox.setAttribute('class',"ft_pref_modul");
		preftab.appendChild(groupbox);
		
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_group_caption");
		caption1.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.AdditionalOptions")));
		groupbox .appendChild(caption1);
		
		var div= doc.createElement("div");
		groupbox.appendChild(div);

 		var checked = FoxtrickPrefs.getBool("copyfeedback");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'copyfeedback', Foxtrickl10n.getString("foxtrick.prefs.copyfeedback"),'', checked ) 
		div.appendChild(checkdiv);
 		var checked = FoxtrickPrefs.getBool("smallcopyicons");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'smallcopyicons', Foxtrickl10n.getString("foxtrick.prefs.smallcopyicons"),'', checked ) 
		div.appendChild(checkdiv);
 		var checked = FoxtrickPrefs.getBool("module.OnPagePrefs.enabled");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'OnPagePrefs', Foxtrickl10n.getString("foxtrick.OnPagePrefs.desc"),'', checked ) 
		div.appendChild(checkdiv);
 		var checked = FoxtrickPrefs.getBool("DisplayHTMLDebugOutput");
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, 'DisplayHTMLDebugOutput', Foxtrickl10n.getString("foxtrick.prefs.DisplayHTMLDebugOutput"),'', checked ) 
		div.appendChild(checkdiv);        
		} catch(e){Foxtrick.dump('show mainpref tab '+e);}
	},
	
	fill_help_list : function( doc ) {
		var preftab = doc.getElementById('help');

		var table = doc.createElement( "table" );	
		preftab.appendChild( table );
		var tr = doc.createElement( "tr" );	
		table.appendChild( tr );
		var td = doc.createElement( "td" );	
		tr.appendChild( td );

		var headstr = Foxtrickl10n.getString("foxtrick.prefs."+FoxtrickPrefsDialogHTML.TabNames['help']);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_list_caption");
		caption1.appendChild(doc.createTextNode(headstr));
		td.appendChild(caption1);

		var td = doc.createElement( "td" );	
		td.setAttribute('class','ft_prefs_screenshot_td');
		tr.appendChild( td );
		var screenshot = Foxtrickl10n.getScreenshot('help');		
		if (screenshot) {
			var a = doc.createElement('a');
			a.href = screenshot;
			a.setAttribute('target','_blank');
			var img=doc.createElement('img');
			img.src="chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/img/Aiga_help_green.png";
			img.setAttribute('title',Foxtrickl10n.getString("foxtrick.prefs.commented_screenshots"));
			a.appendChild(img);
			td.appendChild( a );
		}
 		
		
		// links
		var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_modul");
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

		var table = doc.createElement( "table" );	
		preftab.appendChild( table );
		var tr = doc.createElement( "tr" );	
		table.appendChild( tr );
		var td = doc.createElement( "td" );	
		tr.appendChild( td );

		var headstr = Foxtrickl10n.getString("foxtrick.prefs."+FoxtrickPrefsDialogHTML.TabNames['about']);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_list_caption");
		caption1.appendChild(doc.createTextNode(headstr));
		td.appendChild(caption1);

		var td = doc.createElement( "td" );	
		td.setAttribute('class','ft_prefs_screenshot_td');
		tr.appendChild( td );
		var screenshot = Foxtrickl10n.getScreenshot('about');		
		if (screenshot) {
			var a = doc.createElement('a');
			a.href = screenshot;
			a.setAttribute('target','_blank');
			var img=doc.createElement('img');
			img.src="chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/img/Aiga_help_green.png";
			img.setAttribute('title',Foxtrickl10n.getString("foxtrick.prefs.commented_screenshots"));
			a.appendChild(img);
			td.appendChild( a );
		}
 		
		// head_developer
		var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_modul");
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
		groupbox2.setAttribute('class',"ft_pref_modul");
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
		groupbox2.setAttribute('class',"ft_pref_modul");
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

		// translations
		var groupbox2= doc.createElement("div");
		groupbox2.setAttribute('class',"ft_pref_modul");
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

		var table = doc.createElement( "table" );	
		preftab.appendChild( table );
		var tr = doc.createElement( "tr" );	
		table.appendChild( tr );
		var td = doc.createElement( "td" );	
		tr.appendChild( td );

		var headstr = Foxtrickl10n.getString("foxtrick.prefs."+FoxtrickPrefsDialogHTML.TabNames['changes']);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_list_caption");
		caption1.appendChild(doc.createTextNode(headstr));
		td.appendChild(caption1);

		var td = doc.createElement( "td" );	
		td.setAttribute('class','ft_prefs_screenshot_td');
		tr.appendChild( td );
		var screenshot = Foxtrickl10n.getScreenshot('changes');		
		if (screenshot) {
			var a = doc.createElement('a');
			a.href = screenshot;
			a.setAttribute('target','_blank');
			var img=doc.createElement('img');
			img.src="chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/img/Aiga_help_green.png";
			img.setAttribute('title',Foxtrickl10n.getString("foxtrick.prefs.commented_screenshots"));
			a.appendChild(img);
			td.appendChild( a );
		}
		
		var versions = Foxtrick.XML_evaluate(Foxtrick.XMLData.htversionsXML,  "hattrickversions/version", "name", "code");
		var oldVersion = versions[versions.length-2][1];
		
		var curVersion = FoxtrickPrefs.getString("curVersion"); 
		FoxtrickPrefsDialogHTML.getNewModules(curVersion,oldVersion);	
		
		var commondiv=doc.createElement('div');
		commondiv.setAttribute('id','FoxtrickPrefsDialogHTMLCommon');
		preftab.appendChild(commondiv);				
		FoxtrickPrefsDialogHTML.ShowAlertCommon(doc, oldVersion);
		
	}catch(e){dump('changestab '+e+'\n');}
	},
	
	
	fill_list : function( doc, category) {
		var preftab = doc.getElementById(category);
		
		var table = doc.createElement( "table" );	
		preftab.appendChild( table );
		var tr = doc.createElement( "tr" );	
		table.appendChild( tr );
		var td = doc.createElement( "td" );	
		tr.appendChild( td );

		var headstr = Foxtrickl10n.getString("foxtrick.prefs."+FoxtrickPrefsDialogHTML.TabNames[category]);
		var caption1= doc.createElement("div");
        caption1.setAttribute('class',"ft_pref_list_caption");
		caption1.appendChild(doc.createTextNode(headstr));
		td.appendChild(caption1);

		var td = doc.createElement( "td" );	
		td.setAttribute('class','ft_prefs_screenshot_td');
		tr.appendChild( td );
		var screenshot = Foxtrickl10n.getScreenshot(category);		
		if (screenshot) {
			var helpdiv = doc.createElement("div");
			helpdiv.setAttribute("class","ft_actionicon foxtrickHelp float_right");
			helpdiv.setAttribute('title',Foxtrickl10n.getString("foxtrick.prefs.commented_screenshots"));
			var a = doc.createElement('a');
			a.href = screenshot;
			a.setAttribute('target','_blank');
			a.innerHTML="<img src='chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/linkicons/transparent16.png'>";
			helpdiv.appendChild(a);
			td.appendChild( helpdiv );
		}
		
		var modules_entries = new Array();
		for ( var i in Foxtrick.modules ) {
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
				modules_entries.push(entry);
            }
		}
		
		modules_entries.sort(FoxtrickPrefsDialogHTML.entry_sortfunction);
		for ( var i=0;i<modules_entries.length;++i)	preftab.appendChild( modules_entries[i] );
    },

	entry_sortfunction: function(a,b) {return a.getAttribute('prefname').localeCompare(b.getAttribute('prefname'));},

	_radioModule : function(doc, module, on_page ) {
		var entry = doc.createElement( "div" );
		entry.setAttribute( "class", "ft_pref_modul" );
		entry.setAttribute( "prefname", module.MODULE_NAME );
		
		var module_checked = Foxtrick.isModuleEnabled( module );
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, module.MODULE_NAME, module.MODULE_NAME, FoxtrickPrefs.getModuleDescription( module.MODULE_NAME ), module_checked, null, null, on_page )
		entry.appendChild( checkdiv );			
		entry.appendChild (doc.createTextNode(FoxtrickPrefs.getModuleDescription( module.MODULE_NAME ) ));
		
		checkdiv.firstChild.addEventListener( "click", function( ev ) { 
				var check=ev.currentTarget.getElementsByTagName('input')[0];
				var checked = check.checked;  
				var optiondiv = ev.target.ownerDocument.getElementById(check.id+'_radio');		
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
			var desc = FoxtrickPrefs.getModuleDescription( module.MODULE_NAME + "." + module.RADIO_OPTIONS[i] );
			
			optiondiv.appendChild( FoxtrickPrefsDialogHTML._getRadio (doc, group, desc, module.RADIO_OPTIONS[i], selected, on_page ) );					
		}
		if (module_checked) optiondiv.setAttribute( "style", "display:block;" );
		else optiondiv.setAttribute( "style", "display:none;" );

		entry.appendChild( optiondiv );

		return entry;
	},
	

	_checkboxModule : function (doc, module, on_page) {
		var entry = doc.createElement( "div" );
		entry.setAttribute( "class", "ft_pref_modul" );
		entry.setAttribute( "prefname", module.MODULE_NAME );
		
		var module_checked = Foxtrick.isModuleEnabled( module );
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, module.MODULE_NAME, module.MODULE_NAME, FoxtrickPrefs.getModuleDescription( module.MODULE_NAME ), module_checked, null, null, on_page ) 
		entry.appendChild( checkdiv);			
		entry.appendChild (doc.createTextNode(FoxtrickPrefs.getModuleDescription( module.MODULE_NAME ) ));

		checkdiv.firstChild.addEventListener( "click", function( ev ) {
				var check=ev.currentTarget.getElementsByTagName('input')[0];
				var checked = check.checked; 
				var optiondiv = ev.target.ownerDocument.getElementById(check.id+'_options');		
				if (checked) optiondiv.style.display='block';
				else optiondiv.style.display='none'; 			
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
			if ( module.OPTION_TEXTS != null && module.OPTION_TEXTS
				&& (!module.OPTION_TEXTS_DISABLED_LIST || !module.OPTION_TEXTS_DISABLED_LIST[i])) {
				
				var val = FoxtrickPrefs.getString( "module." + module.MODULE_NAME + "." + key + "_text" );
				if (module.OPTION_TEXTS_DEFAULT_VALUES && module.OPTION_TEXTS_DEFAULT_VALUES[i]){
					if (!val) val = module.OPTION_TEXTS_DEFAULT_VALUES[i];
					DefaultOptionText = module.OPTION_TEXTS_DEFAULT_VALUES[i];
				}
				OptionText = val;
			}
																
			var checked = Foxtrick.isModuleFeatureEnabled( module, key)
			var group = module.MODULE_NAME + '.' + key;
			optiondiv.appendChild(FoxtrickPrefsDialogHTML._getCheckBox(doc, group, title, title_long, checked, OptionText, DefaultOptionText, on_page ));
		}
		if (module_checked) optiondiv.setAttribute( "style", "display:block;" );
		else optiondiv.setAttribute( "style", "display:none;" );
		entry.appendChild( optiondiv );

		return entry;
	},
		
	_normalModule : function (doc, module, on_page) {
		var entry = doc.createElement( "div" );
		entry.setAttribute( "class", "ft_pref_modul" );
		entry.setAttribute( "prefname", module.MODULE_NAME );
		
		var checkdiv = FoxtrickPrefsDialogHTML._getCheckBox (doc, module.MODULE_NAME, module.MODULE_NAME, FoxtrickPrefs.getModuleDescription( module.MODULE_NAME ), Foxtrick.isModuleEnabled( module ),null, null,on_page) ;
		entry.appendChild(checkdiv);		
		entry.appendChild (doc.createTextNode(FoxtrickPrefs.getModuleDescription( module.MODULE_NAME ) ));
		return entry;
	},
		
	_getCheckBox : function (doc, name, label, label_long, checked , option_text, DefaultOptionText, on_page) { 
		var div = doc.createElement( "div" );	
		div.setAttribute('class','ft_prefs_check_div');
		var table = doc.createElement( "table" );	
		div.appendChild( table );
		var tr = doc.createElement( "tr" );	
		table.appendChild( tr );

		var td = doc.createElement( "td" );	
		td.setAttribute('class','ft_prefs_check_td');
		tr.appendChild( td );		
		var check = doc.createElement( "input" );	
		check.setAttribute( "type", "checkbox" );
		check.setAttribute( "name", name );
		check.setAttribute( "id", name );
		if (checked) check.setAttribute( "checked", "checked" );
		if (on_page) check.setAttribute('title', label );
		td.appendChild( check );
		
		var td = doc.createElement( "td" );	
		tr.appendChild( td );
		var divlabel = doc.createElement( "div" );	
		divlabel.setAttribute( "class", "checkbox_label" );
		if (on_page) {
			var divlabelinner = doc.createElement( "div" );	
			divlabelinner.appendChild( doc.createTextNode(label) );
			divlabelinner.setAttribute('title', label );
			divlabel.appendChild( divlabelinner );
		}
		else {
			divlabel.appendChild( doc.createTextNode(label) );
		}
		td.appendChild( divlabel );
		
		var td = doc.createElement( "td" );	
		td.setAttribute('class','ft_prefs_screenshot_td');
		tr.appendChild( td );
		var screenshot = Foxtrickl10n.getScreenshot(name);		
		if (screenshot) {
			var scrdiv = doc.createElement("div");
			scrdiv.setAttribute("class","ft_actionicon foxtrickHelp float_right");	
			scrdiv.setAttribute('title',Foxtrickl10n.getString("foxtrick.prefs.commented_screenshots"));
			var a = doc.createElement('a');
			a.href = screenshot;
			a.setAttribute('target','_blank');
			a.innerHTML="<img src='chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/resources/linkicons/transparent16.png'>";
			scrdiv.appendChild(a);
			td.appendChild( scrdiv );
		}
		
		if (option_text) {
			check.addEventListener( "click", function( ev ) {
					var checked = ev.currentTarget.checked;
					var optiondiv = ev.target.ownerDocument.getElementById(ev.currentTarget.id+'_table');
					if (checked) optiondiv.style.display='block';
					else optiondiv.style.display='none'; 			
				}, false );

			
			var table = doc.createElement( "table" );	
			table.setAttribute( "id", name+'_table' );
			if (checked) table.setAttribute( "style", "display:block;" );
			else table.setAttribute( "style", "display:none;" );
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

			if (!on_page) {
				var td = doc.createElement( "td" );	
				//td.setAttribute('class','ft_prefs_check_td');
				tr.appendChild( td );		
				var option_text_reset_button = doc.createElement( "input" );	
				option_text_reset_button.setAttribute('type', 'button');
				option_text_reset_button.setAttribute('value', Foxtrickl10n.getString("foxtrick.prefs.buttonReset"));
				option_text_reset_button.setAttribute( "sender_id", name);
				option_text_reset_button.setAttribute( "default_text",  DefaultOptionText);
				option_text_reset_button.addEventListener( "click", function( ev ) {					
					try{  var default_text = ev.currentTarget.getAttribute('default_text');
						var input_option_text = ev.target.ownerDocument.getElementById(ev.currentTarget.getAttribute('sender_id')+'_text');
						input_option_text.setAttribute( "value",  default_text);						
					} catch(e){dump('resetclick error: '+e+'\n');}
				}, false );
				td.appendChild(option_text_reset_button);                						
			}
		}
		
		return div;
	},
	
	_getRadio : function (doc, name, label, label_short, checked, on_page ) {
		var div = doc.createElement( "div" );	
		var check = doc.createElement( "input" );	
		check.setAttribute( "type", "radio" );
		check.setAttribute( "name", name );
		if (checked) check.setAttribute( "checked", "checked" );
		div.appendChild( check );
		div.appendChild( doc.createTextNode(label) );
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
		try{
				var alertdiv = doc.getElementById('FoxtrickPrefsDialogHTMLCommon');
				var curVersion=FoxtrickPrefs.getString("curVersion"); 

				alertdiv.innerHTML = "<h2 style='background-color:#EFEFFF; text-align:center !important; color:#2F31FF !important; font-size:1.1em; '>FoxTrick "+curVersion+"</h2>";
				
				alertdiv.innerHTML += Foxtrickl10n.getString("NewOrChangedModules")+' ';
				
				if (Foxtrick.BuildFor=='Chrome')
						var selectbox = Foxtrick.getSelectBoxFromXML2(doc,Foxtrick.XMLData.htversionsXML, "hattrickversions/version", "name", "code", oldVersion);
				else var selectbox = Foxtrick.getSelectBoxFromXML(doc,"chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/htlocales/htversions.xml", "hattrickversions/version", "name", "code", oldVersion);
				selectbox.setAttribute("id","ft_ownselectboxID");
				selectbox.addEventListener('change',FoxtrickPrefsDialogHTML.VersionBox_Select,false);
				alertdiv.appendChild(selectbox);

				alertdiv.appendChild(doc.createElement('br'));
				alertdiv.appendChild(doc.createTextNode(Foxtrickl10n.getString("FoxtrickChangeLogHint")));

				var alertdivInner = doc.createElement('div');
				alertdivInner.setAttribute('id','changesalertdivInner');
				alertdiv.appendChild(alertdivInner);
				FoxtrickPrefsDialogHTML.ShowAlertCommonInner(doc);
				
				var p=doc.createElement('p');				
				p.appendChild(doc.createTextNode(Foxtrickl10n.getString("FoxtrickMyHtReleaseNotes")));				
				p.appendChild(doc.createTextNode(" "));				
				var a=doc.createElement('a');
				a.href=Foxtrickl10n.getString("FoxtrickMyHtReleaseNotesLink");
				a.innerHTML=Foxtrickl10n.getString("FoxtrickMyHtReleaseNotesLink");
				a.target="_blank";
				p.appendChild(a);				
				alertdiv.appendChild(p);
				
		} catch(e) {dump('ShowAlertCommon '+e+'\n');}		
	},
	
	
	ShowAlertCommonInner :function(doc) {
		try {	var alertdiv= doc.getElementById('changesalertdivInner');
				alertdiv.innerHTML='';									
				var table=doc.createElement('table');		
				alertdiv.appendChild(table);
				var tr=doc.createElement('tr');
				table.appendChild(tr);
				var td1=doc.createElement('td');
				var h1=doc.createElement('h3');
				var a1=doc.createElement('a');
				a1.appendChild(doc.createTextNode(Foxtrickl10n.getString("Module")));
				a1.addEventListener( "click", FoxtrickPrefsDialogHTML.Sort0, false );
				a1.href='javascript:void();'
				a1.title=Foxtrickl10n.getString("SortBy");
				h1.appendChild(a1);
				td1.appendChild(h1);
				tr.appendChild(td1);
				
				var td2=doc.createElement('td');
				var h2=doc.createElement('h3');
				var a2=doc.createElement('a');
				a2.appendChild(doc.createTextNode(Foxtrickl10n.getString("PreferenceTab")));				
				a2.addEventListener( "click", FoxtrickPrefsDialogHTML.Sort2, false );
				a2.href='javascript:void();'
				a2.title=Foxtrickl10n.getString("SortBy");
				h2.appendChild(a2);
				td2.appendChild(h2);
				tr.appendChild(td2);
				
				var td3=doc.createElement('td');
				var h3=doc.createElement('h3');
				var a3=doc.createElement('a');
				a3.appendChild(doc.createTextNode(Foxtrickl10n.getString("NewAfter")));				
				a3.addEventListener( "click", FoxtrickPrefsDialogHTML.Sort4, false );
				a3.href='javascript:void();'
				a3.title=Foxtrickl10n.getString("SortBy");
				h3.appendChild(a3);				
				td3.appendChild(h3);
				tr.appendChild(td3);

				var td4=doc.createElement('td');
				var h4=doc.createElement('h4');
				var a4=doc.createElement('a');
				a4.appendChild(doc.createTextNode(Foxtrickl10n.getString("ChangeCategory")));				
				a4.addEventListener( "click", FoxtrickPrefsDialogHTML.Sort7, false );
				a4.href='javascript:void();'
				a4.title=Foxtrickl10n.getString("SortBy");
				h4.appendChild(a4);				
				td4.appendChild(h4);
				tr.appendChild(td4);


				for (var i=0;i<this.NewModules.length;++i) {
						var tr=doc.createElement('tr');
						table.appendChild(tr);
						
						// module 
						var td1=doc.createElement('td'); 
						if (this.NewModules[i][1]) {
							var a=doc.createElement('a');
							a.href=this.NewModules[i][1];
							a.title=Foxtrickl10n.getString("Screenshot");
							a.target="_blank";
							a.innerHTML=this.NewModules[i][0]
							td1.appendChild(a);
						}
						else td1.appendChild(doc.createTextNode(this.NewModules[i][0]));
						
						// modul options
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
								}	
							}
						}
						tr.appendChild(td1);

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
						}
						else td2.appendChild(doc.createTextNode(this.NewModules[i][2]));
						tr.appendChild(td2);

						// new after
						var td3=doc.createElement('td');	
						td3.appendChild(doc.createTextNode(this.NewModules[i][4]));
						tr.appendChild(td3);

						// new after
						var td3=doc.createElement('td');	
						td3.appendChild(doc.createTextNode(this.NewModules[i][7]));
						tr.appendChild(td3);
						
						// change log
						var td4=doc.createElement('td');	
						if (this.NewModules[i][5]) {
							var imgdiv=doc.createElement('div');	
							imgdiv.setAttribute('class','ft_icon foxtrickInfo');
							imgdiv.setAttribute('title',"Last change: "+this.NewModules[i][5]);
							td4.appendChild(imgdiv);
						}
						tr.appendChild(td4);						
				}
								
				alertdiv.appendChild(doc.createElement('br'));	
		} catch(e) {dump('ShowAlertCommonInner '+e+'\n');}	
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
		try{  
			var doc = ev.target.ownerDocument;
		
			var selectbox = doc.getElementById("ft_ownselectboxID");
			var oldVersion = selectbox.getElementsByTagName("option")[selectbox.selectedIndex].value; 
						
			FoxtrickPrefsDialogHTML.getNewModules(FoxtrickPrefs.getString("curVersion"),oldVersion);			
			FoxtrickPrefsDialogHTML.ShowAlertCommon(doc, oldVersion);
			
		} catch(e) {dump('FoxtrickPrefsDialogHTML.VersionBox_Select'+e+'\n');}
	},

	getOffsetValue: function (itemToSearch) {
    try {
        var returnedOffset = 0;
            for (var i in Foxtrick.XMLData.League) { 
				if (itemToSearch == Foxtrick.XMLData.League[i].EnglishName) {
				 	returnedOffset = Foxtrick.XMLData.League[1].Season - Foxtrick.XMLData.League[i].Season;  // sweden season - selected
					break;
				}				
			}
			return returnedOffset;
    }
    catch (e) {
        dump('  Offset search for '+ itemToSearch + ' ' + e + '\n');
        return 0;
    }
	},

	
	getConverterCurrValue: function (itemToSearch, options, xmlDoc) {
    try {
         var returnedItemToSearch = "none";


        try {
			var values = xmlDoc.getElementsByTagName("currency");
		} catch (e) { 
			var tmp = document.createElement('tmp');
			tmp.innerHTML = xmlDoc;
			var values = tmp.getElementsByTagName("currency");
		}
		
        var langs = [];

        for (var i=0; i<values.length; i++) {
            var eurorate = values[i].attributes.getNamedItem("eurorate").textContent;
            var code = values[i].attributes.getNamedItem("code").textContent;
            var sname = values[i].attributes.getNamedItem("shortname").textContent;
            langs.push([eurorate,code,sname]);
        }

        function sortfunction(a,b) {
            return a[0].localeCompare(b[0]);
        }

        langs.sort(sortfunction);

        for (var i=0; i<langs.length; i++) {

            var eurorate = langs[i][0];
            var code = langs[i][1];
            var sname = langs[i][2];



            if (options == "old" && itemToSearch==code){returnedItemToSearch = sname;}
            if (options == "new" && itemToSearch==code){returnedItemToSearch = sname;}
            if (options == "rate" && itemToSearch==code){returnedItemToSearch = eurorate;}
            if (options == "code" && itemToSearch==code){returnedItemToSearch = code;}
        }

      return returnedItemToSearch;
         } catch (e) {
                dump('  CurrencyConverter-CurrValue(): ' + e + '\n');
           }
},

}	


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

	run : function(page, doc ) {  
    		try{
			if (doc.getElementById('ctl00_ucSubMenu_txtUserName')) return;
		
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
				div.addEventListener( "click", FoxtrickOnPagePrefs.HeaderClick, false );
				pn.insertBefore(div,pn.firstChild);
				
				var div=doc.getElementById('foxtrick_OnPagePrefs_box').firstChild;	
				div.setAttribute("id","foxtrick_OnPagePrefs_headdiv");
				div.setAttribute("class","boxHead ft_sidebarBoxCollapsed");
				if (Foxtrick.isRTLLayout(doc)) div.setAttribute("class","boxHead ft_sidebarBoxCollapsed_rtl");
			
		} catch (e){dump('FoxtrickOnPagePrefs '+e+'\n');}
	},

	change : function( doc ) { 
	},
	
	HeaderClick : function (ev) { 
	try{
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
				alldivheader.addEventListener( "click", FoxtrickOnPagePrefs.HeaderClickModulesAll, false );
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
				linkdivheader.addEventListener( "click", FoxtrickOnPagePrefs.HeaderClickLinks, false );
				linkdivouter.appendChild(linkdivheader);
				var linkdivinner = doc.createElement('div');
				linkdivinner.setAttribute("style","display:none;");
				linkdivinner.setAttribute("id","onpageprefs_linkdivinner");
				linkdivouter.appendChild(linkdivinner);
				var linkdiv_count = 0;
				
				// modules
				for ( var j=0; j<Foxtrick.run_on_cur_page.length; ++j ) {
					if (!Foxtrick.run_on_cur_page[j].module.MODULE_CATEGORY) continue;
					
					var in_list=false;
					for ( var k=0; k<j; ++k ) {
						if (Foxtrick.run_on_cur_page[k].module==Foxtrick.run_on_cur_page[j].module) {in_list=true; break;}
					}
					if (in_list) continue;
					
					var entry;
					
					if (Foxtrick.run_on_cur_page[j].module.RADIO_OPTIONS != null) {
						entry = FoxtrickPrefsDialogHTML._radioModule(doc, Foxtrick.run_on_cur_page[j].module,true);
					} else if (Foxtrick.run_on_cur_page[j].module.OPTIONS != null) {
						entry = FoxtrickPrefsDialogHTML._checkboxModule(doc, Foxtrick.run_on_cur_page[j].module,true);
					} else {
						entry = FoxtrickPrefsDialogHTML._normalModule(doc, Foxtrick.run_on_cur_page[j].module,true);
					}
					if (Foxtrick.run_on_cur_page[j].page=='all' || Foxtrick.run_on_cur_page[j].page=='all_late') {
						alldivinner.appendChild( entry );					
						++alldiv_count;
					}
					else if(Foxtrick.run_on_cur_page[j].module.MODULE_CATEGORY=='links')	{
						linkdivinner.appendChild( entry );								
						++linkdiv_count;
					}
					else ownBoxBody.appendChild( entry );
				}
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
	}catch(e){dump('OnPagePrefClick: '+e+'\n');}
	},
	
	
	HeaderClickModulesAll : function (ev) {
	try{
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
	}catch(e){dump('OnPagePrefClick: '+e+'\n');}
	},

	
	HeaderClickLinks : function (ev) {
	try{
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
	}catch(e){dump('OnPagePrefClick: '+e+'\n');}
	},

	
	SubmitCapture : function (ev) { 
	try{
		var doc = ev.target.ownerDocument;
		var content = doc.getElementById('idFoxtrickPrefs');
		if (content) {
			content.parentNode.removeChild(content);
			var headdiv = doc.getElementById('foxtrick_OnPagePrefs_headdiv');
			headdiv.setAttribute("class","boxHead ft_sidebarBoxCollapsed");			
			if (Foxtrick.isRTLLayout(doc)) headdiv.setAttribute("class","boxHead ft_sidebarBoxCollapsed_rtl");
			dump ('onclick/submit remove onpagepref\n');
		}
	} catch(e){dump('OnPagePrefClick: '+e+'\n');}
	},
	
	ClickCapture : function (ev) { 
	try{ var hasonclick=ev.originalTarget.getAttribute('onclick')!=null;
		var haspostback=ev.originalTarget.href && ev.originalTarget.href.search('javascript')!=-1;
		dump('ClickCapture - hasonclick: ' +hasonclick+' haspostback: '+haspostback+'- return: '+!(hasonclick || haspostback)+'\n');
		if ( !(hasonclick || haspostback)) return;
		var doc = ev.target.ownerDocument;
		var content = doc.getElementById('idFoxtrickPrefs');
		if (content) {
			content.parentNode.removeChild(content);
			var headdiv = doc.getElementById('foxtrick_OnPagePrefs_headdiv');
			headdiv.setAttribute("class","boxHead ft_sidebarBoxCollapsed");			
			if (Foxtrick.isRTLLayout(doc)) headdiv.setAttribute("class","boxHead ft_sidebarBoxCollapsed_rtl");
			dump ('onclick/submit remove onpagepref\n');
		}
	} catch(e){dump('OnPagePrefClick: '+e+'\n');}
	},
}