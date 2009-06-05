/**
 * Preference dialog functions.
 * @author Mod-PaV
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickPreferencesDialog = {

    init : function() {
        // var doc = ev.originalTarget;
        
        for ( var i in FoxtrickPreferencesDialog.core_modules ) {
            FoxtrickPreferencesDialog.core_modules[i].init()
        }

		this.initCaptionsAndLabels( document );
        this.initMainPref( document );
        this.initAboutPref( document );

		for each ( cat in Foxtrick.moduleCategories ) {
            this._fillModulesList( document, cat );
        }

        this.pref_show ('main_list');
    },


	initCaptionsAndLabels : function( document ) {

		// Window title
		window.title = Foxtrickl10n.getString( "foxtrick.prefs.preferences" );
		// Captions and labels
		var allLabels = [ "MainTab", "ShortcutsTab", "PresentationTab", "MatchesTab",
						  "ForumTab", "LinksTab", "AboutTab",
						  "buttonSave", "buttonCancel" ];
		for(var i = 0; i < allLabels.length; i++) {
			var thisElement = document.getElementById(allLabels[i]);
			thisElement.setAttribute( "label", Foxtrickl10n.getString(
				"foxtrick.prefs." + allLabels[i]) );
		}
	},

	initMainPref : function( doc ) {
		
		var modules_list = doc.getElementById( "main_list" );
		modules_list.setAttribute( "style", "background-color:ButtonFace !important; color: ButtonText !important;");

        // prefs at deafult warning
		if (!FoxtrickPrefs.getBool( "PrefsSavedOnce" )) {
			var groupbox= doc.createElement("groupbox");
			groupbox.setAttribute("style","background-color:#FCF6DF; color:black;");
			var caption= doc.createElement("caption");
			caption.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.PrefDefaultWarningLabel"));
			caption.setAttribute("style","background-color:#FCF6DF; color:black;");
			var vbox= doc.createElement("vbox");
			var desc_box = this._getWrapableBox ( Foxtrickl10n.getString("foxtrick.prefs.PrefDefaultWarningText"));		
			vbox.appendChild(desc_box);
			groupbox.appendChild(caption);
			groupbox.appendChild(vbox);
			modules_list.appendChild(groupbox);
		}


		// language & currency & dateformat & county
        var groupbox= doc.createElement("groupbox");

        var groupbox2= doc.createElement("groupbox");
		var hbox1= doc.createElement("hbox");
        hbox1.setAttribute('flex',"1");
        
		var caption1= doc.createElement("caption");
        caption1.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.captionHTLanguage"));
        caption1.setAttribute( "style", "background-color:ButtonFace; color: ButtonText;");
		
		var vbox1= doc.createElement("vbox");
        vbox1.setAttribute('flex',"1");
        var menulist1= doc.createElement("menulist");
        menulist1.setAttribute('id',"htLanguage");
        var menupopup1= doc.createElement("menupopup");
        menupopup1.setAttribute('id',"htLanguagePopup");
		menulist1.appendChild(menupopup1);
        var spacer = document.createElement( "spacer" );
        spacer.setAttribute('flex','1');
        vbox1.appendChild( spacer );
		vbox1.appendChild(menulist1);
        var spacer = document.createElement( "spacer" );
        spacer.setAttribute('flex','1');
        vbox1.appendChild( spacer );
		hbox1.appendChild( vbox1 );

		
		groupbox2.appendChild(caption1);
        
        
		var spacer = document.createElement( "spacer" );
        spacer.setAttribute('flex','1');
        //hbox1.appendChild( spacer );

		var vbox1b= doc.createElement("hbox");
        vbox1b.setAttribute('flex',"1");
        var checkbox= doc.createElement("checkbox");
		checkbox.setAttribute('id',"ReadHtPrefs");
		checkbox.setAttribute("checked", FoxtrickPrefs.getBool("module.FoxtrickReadHtPrefs.enabled"));
		var desc_box = this._getWrapableBox ( Foxtrickl10n.getString("foxtrick.ReadHtPrefs.desc") );
		desc_box.setAttribute("flex","1");
		vbox1b.appendChild(checkbox);
		vbox1b.appendChild(desc_box);
		hbox1.appendChild(vbox1b);

		groupbox2.appendChild(hbox1);

        var vbox2= doc.createElement("vbox");
        vbox2.setAttribute('flex',"1");
        var caption2= doc.createElement("caption");
        caption2.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.captionHTCurrency"));
        caption2.setAttribute( "style", "background-color:ButtonFace !important; color: ButtonText !important;");
        var menulist2= doc.createElement("menulist");
        menulist2.setAttribute('id',"htCurrency");
        var menupopup2= doc.createElement("menupopup");
        menupopup2.setAttribute('id',"htCurrencyPopup");

        var vbox3= doc.createElement("vbox");
        vbox3.setAttribute('flex',"1");
        var caption3= doc.createElement("caption");
        caption3.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.captionHTDateformat"));
        caption3.setAttribute( "style", "background-color:ButtonFace; color: ButtonText;");
        var menulist3= doc.createElement("menulist");
        menulist3.setAttribute('id',"htDateformat");
        var menupopup3= doc.createElement("menupopup");
        menupopup3.setAttribute('id',"htDateformatPopup");

        var vbox4= doc.createElement("vbox");
        vbox4.setAttribute('flex',"1");
        var caption4= doc.createElement("caption");
        caption4.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.captionHTCountry"));
        caption4.setAttribute( "style", "background-color:ButtonFace; color: ButtonText;");
		var menulist4= doc.createElement("menulist");
        menulist4.setAttribute('id',"htCountry");
        var menupopup4= doc.createElement("menupopup");
        menupopup4.setAttribute('id',"htCountryPopup");

        menulist2.appendChild(menupopup2);
        vbox2.appendChild(caption2);
        vbox2.appendChild(menulist2);
        menulist3.appendChild(menupopup3);
        vbox3.appendChild(caption3);
        vbox3.appendChild(menulist3);
        menulist4.appendChild(menupopup4);
        vbox4.appendChild(caption4);
        vbox4.appendChild(menulist4);
        var hhbox2b= doc.createElement("hbox");
        var hhhbox= doc.createElement("vbox");

        hhbox2b.appendChild(vbox2);
        hhbox2b.appendChild(vbox3);
		hhbox2b.appendChild(vbox4);
		
        hhhbox.appendChild(groupbox2);
        hhhbox.appendChild(hhbox2b);
        groupbox.appendChild(hhhbox);
        modules_list.appendChild(groupbox);

        var htLanguagesXml = doc.implementation.createDocument("", "", null);
        htLanguagesXml.async = false;
        htLanguagesXml.load("chrome://foxtrick/content/htlocales/htlang.xml", "text/xml");
        var itemToSelect=this.fillListFromXml("htLanguagePopup", "htLanguage-", htLanguagesXml, "language", "desc", "name", FoxtrickPrefs.getString("htLanguage"));
        document.getElementById("htLanguage").selectedIndex=itemToSelect;

        var htCurrencyXml = document.implementation.createDocument("", "", null);
        htCurrencyXml.async = false;
        htCurrencyXml.load("chrome://foxtrick/content/htlocales/htcurrency.xml", "text/xml");
        var itemToSelect2=this.fillListFromXml("htCurrencyPopup", "htCurrency-", htCurrencyXml, "currency", "name", "code", FoxtrickPrefs.getString("htCurrency"));
        document.getElementById("htCurrency").selectedIndex=itemToSelect2;

        var htDateFormatXml = document.implementation.createDocument("", "", null);
        htDateFormatXml.async = false;
        htDateFormatXml.load("chrome://foxtrick/content/htlocales/htdateformat.xml", "text/xml");
        var itemToSelect3=this.fillListFromXml("htDateformatPopup", "htDateformat-", htDateFormatXml, "dateformat", "name", "code", FoxtrickPrefs.getString("htDateformat"));
        document.getElementById("htDateformat").selectedIndex=itemToSelect3;


        var htCountryXml = document.implementation.createDocument("", "", null);
        htCountryXml.async = false;
        htCountryXml.load("chrome://foxtrick/content/htlocales/htcountries.xml", "text/xml");
        var itemToSelect4=this.fillListFromXml("htCountryPopup", "htCountry-", htCountryXml, "country", "name", "name", FoxtrickPrefs.getString("htCountry"));
        document.getElementById("htCountry").selectedIndex=itemToSelect4;


     // currency converter
        var groupbox= doc.createElement("groupbox");
        var hbox= doc.createElement("hbox");
        var caption_head= doc.createElement("caption");
        caption_head.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.captionCurrencyConverter"));
		caption_head.setAttribute( "style", "background-color:ButtonFace !important; color: ButtonText !important;");
        

        /*var caption0= doc.createElement("caption");
        caption0.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.captionCurrencyRateInfo"));
        caption0.setAttribute("style","text-decoration: underline; cursor: pointer; color: blue;");
        caption0.setAttribute("onclick","window.opener.open('http://www.hattrick.org/Help/Rules/AppCurrencies.aspx');");
        caption0.setAttribute("flex","0");
        caption0.setAttribute("tooltiptext","hattrick.org/Help/Rules/AppCurrencies.aspx"); */

    	var vbox4= doc.createElement("vbox");
        vbox4.setAttribute('flex',"1");
        var caption4= doc.createElement("caption");
        caption4.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.captionCurrencySymbolTo"));
        caption4.setAttribute( "style", "background-color:ButtonFace; color: ButtonText;");
		var menulist= doc.createElement("menulist");
        menulist.setAttribute('id',"htCurrencyTo");
        var menupopup= doc.createElement("menupopup");
        menupopup.setAttribute('id',"htCurrencyToPopup");



        menulist.appendChild(menupopup);
		caption4.setAttribute('flex','0');        
        vbox4.appendChild(caption4);
		menulist.setAttribute('flex','0');        
        vbox4.appendChild(menulist);
		vbox4.setAttribute('flex','0');        

        hbox.appendChild(vbox4);
/*		var spacer = document.createElement( "spacer" );
        spacer.setAttribute('flex','1');
        hbox.appendChild( spacer );*/

        groupbox.appendChild(caption_head);
        groupbox.appendChild(hbox);
        modules_list.appendChild(groupbox);

        var htCurrencyXml = document.implementation.createDocument("", "", null);
        htCurrencyXml.async = false;
        htCurrencyXml.load("chrome://foxtrick/content/htlocales/htcurrency.xml", "text/xml");
        var itemToSelect2=this.fillListFromXml("htCurrencyToPopup", "htCurrency-", htCurrencyXml, "currency", "name", "code", FoxtrickPrefs.getString("htCurrencyTo"));
        document.getElementById("htCurrencyTo").selectedIndex=itemToSelect2;

		var checkbox= doc.createElement("checkbox");
		checkbox.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.activeCurrencyConverter"));
		checkbox.setAttribute('id',"skinActivedCurrencyConverter");
		checkbox.setAttribute("checked", FoxtrickPrefs.getBool("module.CurrencyConverter.enabled"));
		hbox.appendChild(checkbox);

		// Skin settings
		var groupbox= doc.createElement("groupbox");
		var caption= doc.createElement("caption");
		caption.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.captionSkinSettings"));
		caption.setAttribute( "style", "background-color:ButtonFace !important; color: ButtonText !important;");
		var vbox= doc.createElement("vbox");

		var textbox= doc.createElement("textbox");
		textbox.setAttribute('id',"cssskinpref");
		textbox.setAttribute( "value", FoxtrickPrefs.getString( "cssSkin" ) );
 		vbox.appendChild(textbox);

		var hbox= doc.createElement("hbox");
		hbox.setAttribute('align',"center");
		vbox.appendChild(hbox);

		var button= doc.createElement("button");
		button.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.skinButtonSelectFile"));
		button.setAttribute('id',"skinButtonSelectFile");
		button.setAttribute('oncommand',"var file = Foxtrick.selectFile(window); if (file != null) {document.getElementById('cssskinpref').value='file://' + (file)}");
		hbox.appendChild(button);

		var checkbox= doc.createElement("checkbox");
		checkbox.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.activeSkin"));
		checkbox.setAttribute('id',"skinActivedSkin");
		checkbox.setAttribute("checked", FoxtrickPrefs.getBool("module.SkinPlugin.enabled"));
		vbox.appendChild(checkbox);

		groupbox.appendChild(caption);
		groupbox.appendChild(vbox);
		modules_list.appendChild(groupbox);

		// alert
		var groupbox= doc.createElement("groupbox");
		var caption= doc.createElement("caption");
		caption.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.captionAlertSettings"));
		caption.setAttribute( "style", "background-color:ButtonFace !important; color: ButtonText !important;");
		var vbox= doc.createElement("vbox");
		var checkbox= doc.createElement("checkbox");
		checkbox.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.alertsliderpref"));
		checkbox.setAttribute('id',"alertsliderpref");
		checkbox.setAttribute( "checked", FoxtrickPrefs.getBool( "alertSlider" ) );
		vbox.appendChild(checkbox);
		var checkbox= doc.createElement("checkbox");
		checkbox.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.alertslidermacpref"));
		checkbox.setAttribute('id',"alertslidermacpref");
		checkbox.setAttribute( "checked", FoxtrickPrefs.getBool( "alertSliderGrowl" ) );
		vbox.appendChild(checkbox);
		var checkbox= doc.createElement("checkbox");
		checkbox.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.alertsoundpref"));
		checkbox.setAttribute('id',"alertsoundpref");
		checkbox.setAttribute( "checked", FoxtrickPrefs.getBool( "alertSound" ) );
		vbox.appendChild(checkbox);
		var textbox= doc.createElement("textbox");
		textbox.setAttribute('id',"alertsoundurlpref");
        textbox.setAttribute( "value", FoxtrickPrefs.getString( "alertSoundUrl" ) );
 		vbox.appendChild(textbox);


		var hbox= doc.createElement("hbox");
		hbox.setAttribute('align',"center");
		vbox.appendChild(hbox);
		var button= doc.createElement("button");
		button.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.buttonSelectFile"));
		button.setAttribute('id',"buttonSelectFile");
		button.setAttribute('oncommand',"var file = Foxtrick.selectFile(window); if (file != null) {document.getElementById('alertsoundurlpref').value='file://' + (file)}");
		hbox.appendChild(button);
		var button= doc.createElement("button");
		button.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.buttonTest"));
		button.setAttribute('id',"buttonTest");
		button.setAttribute('oncommand',"Foxtrick.playSound(document.getElementById('alertsoundurlpref').value);");
		hbox.appendChild(button);

  		vbox.appendChild(checkbox);
		groupbox.appendChild(caption);
		groupbox.appendChild(vbox);
		modules_list.appendChild(groupbox);

		
		// LoadSavePrefs
		var groupbox= doc.createElement("groupbox");
		var caption= doc.createElement("caption");
		caption.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.captionLoadSavePrefs"));
		caption.setAttribute( "style", "background-color:ButtonFace !important; color: ButtonText !important;");
		groupbox.appendChild(caption);

		var hbox= doc.createElement("hbox");
		groupbox.appendChild(hbox);
		var hbox2= doc.createElement("hbox");
		groupbox.appendChild(hbox2);

		var vbox= doc.createElement("vbox");
		hbox.appendChild(vbox);
		var button= doc.createElement("button");
		button.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.buttonSavePrefs"));
		button.setAttribute('id',"buttonSavePrefs");
		button.setAttribute('oncommand',"FoxtrickPreferencesDialog.SavePrefs();");
		vbox.appendChild(button);
		var spacer = document.createElement( "spacer" );
        spacer.setAttribute('flex','1');
        vbox.appendChild( spacer );

		var vbox= doc.createElement("vbox");
		vbox.setAttribute('flex','1');
        hbox.appendChild(vbox);
		var desc_box = this._getWrapableBox ( Foxtrickl10n.getString("foxtrick.prefs.labelSavePrefs") );
		desc_box.setAttribute("flex","1");
		vbox.appendChild(desc_box);
		
		var checkbox = doc.createElement( "checkbox" );
		checkbox.setAttribute( "checked",  FoxtrickPrefs.getBool( "SavePrefs_Prefs" ) );
		checkbox.setAttribute( "label", Foxtrickl10n.getString("foxtrick.prefs.labelSavePrefs_Prefs"));
		checkbox.setAttribute( "id", 'saveprefsid');
        checkbox.setAttribute( "class", "checkbox_in_group" );
		vbox.appendChild(checkbox);		
		var checkbox2 = doc.createElement( "checkbox" );
		checkbox2.setAttribute( "checked", FoxtrickPrefs.getBool( "SavePrefs_Notes" ) );
		checkbox2.setAttribute( "label", Foxtrickl10n.getString("foxtrick.prefs.labelSavePrefs_Notes"));
		checkbox2.setAttribute( "id", 'savenotesid');
        checkbox2.setAttribute( "class", "checkbox_in_group" );
		vbox.appendChild(checkbox2);
		
		var button= doc.createElement("button");
		button.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.buttonLoadPrefs"));
		button.setAttribute('id',"buttonLoadPrefs");
		button.setAttribute('oncommand',"FoxtrickPreferencesDialog.LoadPrefs();");
		hbox2.appendChild(button);
		var desc_box = this._getWrapableBox ( Foxtrickl10n.getString("foxtrick.prefs.labelLoadPrefs") );
		desc_box.setAttribute("flex","1");
		hbox2.appendChild(desc_box);

		modules_list.appendChild(groupbox);
		
		// changin all prefs
		var groupbox= doc.createElement("groupbox");
		var caption= doc.createElement("caption");
		caption.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.captionCleanupBranch"));
		caption.setAttribute( "style", "background-color:ButtonFace !important; color: ButtonText !important;");
		groupbox.appendChild(caption);
				
		// CleanupBranch
		var hbox= doc.createElement("hbox");
		groupbox.appendChild(hbox);		
		var button= doc.createElement("button");
		button.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.buttonCleanupBranch"));
		button.setAttribute('id',"buttonCleanupBranch");
		button.setAttribute('oncommand',"FoxtrickPreferencesDialog.confirmCleanupBranch();");
		hbox.appendChild(button);
		var desc_box = this._getWrapableBox ( Foxtrickl10n.getString("foxtrick.prefs.labelCleanupBranch") );
		desc_box.setAttribute("flex","1");
		hbox.appendChild(desc_box);
		
		
		// disable all
		var hbox3= doc.createElement("hbox");
		groupbox.appendChild(hbox3);
		var button3= doc.createElement("button");
		button3.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.buttonDisableAll"));
		button3.setAttribute('id',"buttonDiableAll");
		button3.setAttribute('oncommand',"FoxtrickPreferencesDialog.disableAll();");
		hbox3.appendChild(button3);
		var desc_box3 = this._getWrapableBox ( Foxtrickl10n.getString("foxtrick.prefs.labelDisableAll") );
		desc_box3.setAttribute("flex","1");
		hbox3.appendChild(desc_box3);
		modules_list.appendChild(groupbox);
		
		
		var caption_ov= doc.createElement("caption");
        caption_ov.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.captionFoxtrickMyHT"));
        caption_ov.setAttribute( "style", "background-color:ButtonFace !important; color: ButtonText !important;");
		var menulist_ov= doc.createElement("menulist");
        menulist_ov.setAttribute('id',"htOldVersion");
        var menupopup_ov= doc.createElement("menupopup");
        menupopup_ov.setAttribute('id',"htOldVersionPopup");
		menulist_ov.appendChild(menupopup_ov);
        var hbox_ov= doc.createElement("hbox");
		var desc_box_ov = this._getWrapableBox ( Foxtrickl10n.getString("foxtrick.prefs.labelFoxtrickMyHT") );
		desc_box_ov.setAttribute("flex","1");
		hbox_ov.appendChild(menulist_ov);
        hbox_ov.appendChild(desc_box_ov);
		
        var vbox_ov= doc.createElement("vbox");
        vbox_ov.setAttribute('flex',"1");
        vbox_ov.appendChild(hbox_ov);
        var groupbox= doc.createElement("groupbox");
        groupbox.appendChild(caption_ov);
		groupbox.appendChild(vbox_ov);		
		modules_list.appendChild(groupbox);
				
		var htVersionsXml = document.implementation.createDocument("", "", null);
        htVersionsXml.async = false;
        htVersionsXml.load("chrome://foxtrick/content/htlocales/htversions.xml", "text/xml");
        var itemToSelect3=this.fillListFromXml("htOldVersionPopup", "htVersion-", htVersionsXml, "version", "name", "code", FoxtrickPrefs.getString("oldVersion"));
        document.getElementById("htOldVersion").selectedIndex=itemToSelect3;

		
		// disable options
		var groupbox= doc.createElement("groupbox");
		var caption= doc.createElement("caption");
		caption.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.captionDisableSettings"));
		caption.setAttribute( "style", "background-color:ButtonFace !important; color: ButtonText !important;");
		var vbox= doc.createElement("vbox");
		// stage
		var checkbox= doc.createElement("checkbox");
		checkbox.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.stagepref"));
		checkbox.setAttribute('id',"stagepref");
		checkbox.setAttribute( "checked", FoxtrickPrefs.getBool( "disableOnStage" ) );
		vbox.appendChild(checkbox);
		// temporary
		var checkbox= doc.createElement("checkbox");
		checkbox.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.disableTemporaryLabel"));
		checkbox.setAttribute('id',"disableTemporary");
		checkbox.setAttribute( "checked", FoxtrickPrefs.getBool( "disableTemporary" ) );
		vbox.appendChild(checkbox);
		
		groupbox.appendChild(caption);
		groupbox.appendChild(vbox);
		modules_list.appendChild(groupbox);


		// ShowOnStatusBar
		var groupbox= doc.createElement("groupbox");
		var caption= doc.createElement("caption");
		caption.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.captionShowOnStatusBar"));
		caption.setAttribute( "style", "background-color:ButtonFace !important; color: ButtonText !important;");
		var vbox= doc.createElement("vbox");
		var checkbox= doc.createElement("checkbox");
		checkbox.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.statusbarpref"));
		checkbox.setAttribute('id',"statusbarpref");
		checkbox.setAttribute( "checked", FoxtrickPrefs.getBool( "statusbarshow" ) );

		vbox.appendChild(checkbox);
		groupbox.appendChild(caption);
		groupbox.appendChild(vbox);
		modules_list.appendChild(groupbox);

		// additional options
		var groupbox= doc.createElement("groupbox");
		var caption= doc.createElement("caption");
		caption.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.AdditionalOptions"));
		caption.setAttribute( "style", "background-color:ButtonFace !important; color: ButtonText !important;");
		var vbox= doc.createElement("vbox");
		var checkbox= doc.createElement("checkbox");
		checkbox.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.copyfeedback"));
		checkbox.setAttribute('id',"copyfeedback");
		checkbox.setAttribute( "checked", FoxtrickPrefs.getBool( "copyfeedback" ) );
		vbox.appendChild(checkbox);
		var checkbox= doc.createElement("checkbox");
		checkbox.setAttribute("label",Foxtrickl10n.getString("foxtrick.prefs.onpageprefs"));
		checkbox.setAttribute('id',"onpageprefs");
		checkbox.setAttribute( "checked", FoxtrickPrefs.getBool( "onpageprefs" ) );
		vbox.appendChild(checkbox);		
		groupbox.appendChild(caption);		
		groupbox.appendChild(vbox);
		modules_list.appendChild(groupbox);

		// add space at the end
		var spacer = doc.createElement('spacer');
		spacer.setAttribute('flex',0);
		spacer.setAttribute('height',20);
		modules_list.appendChild( spacer );
	},

	initAboutPref : function( doc ) {

		var modules_list = doc.getElementById( "about_list" );
		modules_list.setAttribute( "style", "background-color:ButtonFace !important; color: ButtonText !important;");

		var xmlresponse = Foxtrick.LoadXML("chrome://foxtrick/content/htlocales/foxtrick_about.xml");				

		var vbox= doc.createElement("vbox");
		var label= doc.createElement("label");
		label.setAttribute("value",Foxtrickl10n.getString('foxtrick.prefs.'+Foxtrick.XML_evaluate(xmlresponse, "about/links", "value")[0]));
		label.setAttribute("style","font-weight: bold;");
		vbox.appendChild(label);
		var links = Foxtrick.XML_evaluate(xmlresponse, "about/links/link", "title", "value");
		for (var i=0;i<links.length;++i) {
			var label= doc.createElement("label");
			label.setAttribute("value",Foxtrickl10n.getString('foxtrick.prefs.'+links[i][0])+': '+links[i][1]);
			label.setAttribute("style","text-decoration: underline; cursor: pointer; color: blue;");
			label.setAttribute("tooltiptext",links[i][1]);
			label.setAttribute("onclick","window.opener.open('"+links[i][1]+"');");
			label.setAttribute("flex","0");
			vbox.appendChild(label);
		}		
		modules_list.appendChild(vbox);        

		var vbox= doc.createElement("vbox");
		vbox.setAttribute("style","display:run-in");

		// head_developer
		var label= doc.createElement("label");
		label.setAttribute("value",Foxtrick.XML_evaluate(xmlresponse, "about/head_developer", "value")[0]);
		label.setAttribute("style","font-weight: bold;");
		vbox.appendChild(label);
		var labels = Foxtrick.XML_evaluate(xmlresponse, "about/head_developer/label", "value");		
		for (var i=0;i<labels.length;++i) {			
			var label= doc.createElement("label");
			label.setAttribute("value",labels[i]);
			vbox.appendChild(label);		
		}
		modules_list.appendChild(vbox);

		// project_owners
		var label= doc.createElement("label");
		label.setAttribute("value",Foxtrick.XML_evaluate(xmlresponse, "about/project_owners", "value")[0]);
		label.setAttribute("style","font-weight: bold;");
		vbox.appendChild(label);
		var labels = Foxtrick.XML_evaluate(xmlresponse, "about/project_owners/label", "value");		
		for (var i=0;i<labels.length;++i) {			
			var label= doc.createElement("label");
			label.setAttribute("value",labels[i]);
			vbox.appendChild(label);		
		}
		modules_list.appendChild(vbox);
		var spacer = doc.createElement('spacer');
		spacer.setAttribute('flex',1);
		spacer.setAttribute('height','10px');
		modules_list.appendChild( spacer );

		// developers
		var label= doc.createElement("label");
		label.setAttribute("value",Foxtrick.XML_evaluate(xmlresponse, "about/developers", "value")[0]);
		label.setAttribute("style","font-weight: bold;");
		vbox.appendChild(label);
		var labels = Foxtrick.XML_evaluate(xmlresponse, "about/developers/label", "value");		
		for (var i=0;i<labels.length;++i) {			
			var label= doc.createElement("label");
			label.setAttribute("value",labels[i]);
			vbox.appendChild(label);		
		}
		modules_list.appendChild(vbox);

		// translations
		var label= doc.createElement("label");
		label.setAttribute("value",Foxtrick.XML_evaluate(xmlresponse, "about/translations", "value")[0]);
		label.setAttribute("style","font-weight: bold;");
		vbox.appendChild(label);
		var labels = Foxtrick.XML_evaluate(xmlresponse, "about/translations/label", "value");		
		for (var i=0;i<labels.length;++i) {			
			var label= doc.createElement("label");
			label.setAttribute("value",labels[i]);
			vbox.appendChild(label);		
		}
		modules_list.appendChild(vbox);
	},

    onDialogAccept : function() {
	try {
		var modules_list;

        for each ( cat in Foxtrick.moduleCategories ) {
                switch(cat) {
                        case Foxtrick.moduleCategories.MAIN:
                                continue;
								break;
                        case Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS:
                                modules_list = document.getElementById( 'shortcuts_list' );
								break;
                        case Foxtrick.moduleCategories.PRESENTATION:
                                modules_list = document.getElementById( 'presentation_list' );
								break;
						case Foxtrick.moduleCategories.MATCHES:
								modules_list = document.getElementById( 'matchfunctions_list' );
								break;
                        case Foxtrick.moduleCategories.FORUM:
                                modules_list = document.getElementById( 'forum_list' );
                                break;
                        case Foxtrick.moduleCategories.LINKS:
                                modules_list = document.getElementById( 'links_list' );
                                break;
						default : continue;
								break;
                }
					
				for ( var i = 0; i < modules_list.childNodes.length; ++i ) {
					if (modules_list.childNodes[i].nodeName =='spacer') continue;
					FoxtrickPreferencesDialog.setModuleEnableState( modules_list.childNodes[i].prefname,
                                                   modules_list.childNodes[i].childNodes[0].childNodes[0].checked );
					if (modules_list.childNodes[i].radio) {
						var radiogroup = modules_list.childNodes[i].childNodes[3].childNodes[0].childNodes;
						for (var j = 0; j < radiogroup.length; j++) {
							if (radiogroup[j].selected) {
								FoxtrickPreferencesDialog.setModuleValue( modules_list.childNodes[i].prefname, j );
								break;
							}
						}
					} else if (modules_list.childNodes[i].checkbox) {
						var checkboxes = modules_list.childNodes[i].childNodes[3].childNodes;
						for (var j = 0; j < checkboxes.length; j++) {
							if (checkboxes[j].id.search(/_text$/) == -1)
								FoxtrickPreferencesDialog.setModuleEnableState( modules_list.childNodes[i].prefname + "." + checkboxes[j].id, checkboxes[j].checked );
							else
								FoxtrickPreferencesDialog.setModuleOptionsText( modules_list.childNodes[i].prefname + "." + checkboxes[j].firstChild.id, checkboxes[j].firstChild.value );
						}
					}
						// modules_list.childNodes[i].checked );
            // dump( modules_list.childNodes[i].prefname + " " + modules_list.childNodes[i].childNodes[0].childNodes[0].checked + "\n" );
                }
        }

		// disable warning
		FoxtrickPrefs.setBool( "PrefsSavedOnce" ,true);
		
        //Lang
        FoxtrickPrefs.setString("htLanguage", document.getElementById("htLanguage").value);
		FoxtrickPrefs.setBool("module.FoxtrickReadHtPrefs.enabled", document.getElementById("ReadHtPrefs").checked);
        
		//Currency
        FoxtrickPrefs.setString("htCurrency", document.getElementById("htCurrency").value);
        
		//Country
        FoxtrickPrefs.setString("htCountry", document.getElementById("htCountry").value);

        var htCountryXml_c = document.implementation.createDocument("", "", null);
        htCountryXml_c.async = false;
        htCountryXml_c.load("chrome://foxtrick/content/htlocales/htcountries.xml", "text/xml");
        FoxtrickPrefs.setInt("htSeasonOffset", Math.floor(this.getOffsetValue(document.getElementById("htCountry").value,htCountryXml_c)));        
            
        //Currency Converter

        var htCurrencyXml_c = document.implementation.createDocument("", "", null);
        htCurrencyXml_c.async = false;
        htCurrencyXml_c.load("chrome://foxtrick/content/htlocales/htcurrency.xml", "text/xml");

        FoxtrickPrefs.setString("htCurrencyTo", document.getElementById("htCurrencyTo").value);
        FoxtrickPrefs.setString("currencySymbol", this.getConverterCurrValue(document.getElementById("htCurrencyTo").value,"new",htCurrencyXml_c));
        FoxtrickPrefs.setString("currencyRateTo", this.getConverterCurrValue(document.getElementById("htCurrencyTo").value,"rate",htCurrencyXml_c));
    
        FoxtrickPrefs.setString("oldCurrencySymbol", this.getConverterCurrValue(document.getElementById("htCurrency").value,"old",htCurrencyXml_c));
        FoxtrickPrefs.setString("currencyRate", this.getConverterCurrValue(document.getElementById("htCurrency").value,"rate",htCurrencyXml_c));
		FoxtrickPrefs.setString("currencyCode", this.getConverterCurrValue(document.getElementById("htCurrency").value,"code",htCurrencyXml_c));
        
        FoxtrickPrefs.setBool("module.CurrencyConverter.enabled", document.getElementById("skinActivedCurrencyConverter").checked); 

		//Dateformat
        FoxtrickPrefs.setString("htDateformat", document.getElementById("htDateformat").value);

        //Statusbar
        FoxtrickPrefs.setBool("statusbarshow", document.getElementById("statusbarpref").checked);

        //Alert
        FoxtrickPrefs.setBool("alertSlider", document.getElementById("alertsliderpref").checked);
        FoxtrickPrefs.setBool("alertSliderGrowl", document.getElementById("alertslidermacpref").checked);
        FoxtrickPrefs.setBool("alertSound", document.getElementById("alertsoundpref").checked);
        FoxtrickPrefs.setString("alertSoundUrl", document.getElementById("alertsoundurlpref").value);

        //Skin settings
        FoxtrickPrefs.setString("cssSkinOld",  FoxtrickPrefs.getString("cssSkin"));
        FoxtrickPrefs.setString("cssSkin", document.getElementById("cssskinpref").value);
        FoxtrickPrefs.setBool("module.SkinPlugin.enabled", document.getElementById("skinActivedSkin").checked); 

        //disable
		FoxtrickPrefs.setBool("disableOnStage", document.getElementById("stagepref").checked);        
		FoxtrickPrefs.setBool("disableTemporary", document.getElementById("disableTemporary").checked);
        
		// other
		FoxtrickPrefs.setString("oldVersion", document.getElementById("htOldVersion").value);

		// additional options
		FoxtrickPrefs.setBool("copyfeedback", document.getElementById("copyfeedback").checked);
		FoxtrickPrefs.setBool("onpageprefs", document.getElementById("onpageprefs").checked);

		
		FoxtrickPrefs.setBool("SavePrefs_Prefs", document.getElementById("saveprefsid").checked);
        FoxtrickPrefs.setBool("SavePrefs_Notes", document.getElementById("savenotesid").checked);
        
		
		// reinitialize
        FoxtrickMain.init();
		
        return true;
		
		} catch(e) {Foxtrick.alert(e);}
    },

getOffsetValue: function (itemToSearch, xmlDoc) {
    try {
        var returnedOffset = 0;
        var values = xmlDoc.getElementsByTagName("country");

        for ( var i = 0; i < values.length; i++ ) {
            try {
                var test = values[i].attributes.getNamedItem("name").textContent;
                
                if (test == itemToSearch) {
                    // alert( '['+test+']['+itemToSearch+']' );
                    returnedOffset  = ( values[i].attributes.getNamedItem("offset").textContent );
                    // alert( returnedOffset );
                }
            } catch(ee) {
                // alert(ee);
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


        var values = xmlDoc.getElementsByTagName("currency");

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



    fillListFromXml: function(id, prefix, xmlDoc, elem, descAttr, valAttr, itemToSelect){

        var indexToSelect=-1;
        var values = xmlDoc.getElementsByTagName(elem);
        var menupopup = document.getElementById(id);
        var langs = [];

        for (var i=0; i<values.length; i++) {
            var label = values[i].attributes.getNamedItem(descAttr).textContent;
            var value = values[i].attributes.getNamedItem(valAttr).textContent;
            langs.push([label,value]);
        }

        function sortfunction(a,b) {
            return a[0].localeCompare(b[0]);
        }

        langs.sort(sortfunction);

        for (var i=0; i<langs.length; i++) {

            var label = langs[i][0];
            var value = langs[i][1];

            var obj = document.createElement("menuitem");
            obj.setAttribute("id", prefix+value);
            obj.setAttribute("label", label);
            obj.setAttribute("value", value);

            menupopup.appendChild(obj);

            if (itemToSelect==value)
                indexToSelect=i;
        }

        return indexToSelect;
	
    },

    _fillModulesList : function( doc, category ) {
                var modules_list;

                switch(category) {
						case Foxtrick.moduleCategories.MAIN:
                                return;
								break;
						case Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS:
                                modules_list = document.getElementById( 'shortcuts_list' );
								break;
						case Foxtrick.moduleCategories.PRESENTATION:
                                modules_list = document.getElementById( 'presentation_list' );
								break;
						case Foxtrick.moduleCategories.MATCHES:
								modules_list = document.getElementById( 'matchfunctions_list' );
								break;
                        case Foxtrick.moduleCategories.FORUM:
                                modules_list = document.getElementById( 'forum_list' );
                                break;
                        case Foxtrick.moduleCategories.LINKS:
                                modules_list = document.getElementById( 'links_list' );
                                break;
						default: return;
								break;
                }

				for ( var i in Foxtrick.modules ) {
					var module = Foxtrick.modules[i];
                        var module_category;
                        module_category = module.MODULE_CATEGORY;
                        if(!module_category) {
                                // MODULE_CATEGORY isn't set; use default
                                module_category = "shortcutsandtweaks";
                        }
                        if(module_category == category) {
							var entry;
							if (module.RADIO_OPTIONS != null) {
								entry = FoxtrickPreferencesDialog._radioModule(module);
							} else if (module.OPTIONS != null) {
								var bOptionTexts = (module.OPTION_TEXTS != null && module.OPTION_TEXTS);
								entry = FoxtrickPreferencesDialog._checkboxModule(module, bOptionTexts);
							} else {
								entry = FoxtrickPreferencesDialog._normalModule(module);
							}
							modules_list.appendChild( entry );
                        }
				}
				var spacer = doc.createElement('spacer');
				spacer.setAttribute('flex',0);
				spacer.setAttribute('height',100);
				
				modules_list.appendChild( spacer );
    },

	_getWrapableBox : function( desc_text ) {
		var desc_box = document.createElement( "hbox" );
		var desc = document.createElement("textbox");
		desc.setAttribute( "class", "plain");//#ece9d7
		desc.setAttribute( "style", "background-color:ButtonFace !important; color: ButtonText !important;");
		desc.setAttribute( "height", "20 ");
		desc.setAttribute( "flex", "1");
		desc.setAttribute( "multiline", "true");
		desc.setAttribute( "readonly","true");
		desc.setAttribute( "onoverflow", "this.heigh=20; this.height = this.inputField.scrollHeight;");
		desc.setAttribute( "DOMAttrModified","if(event.attrName == 'value') this.value = event.newValue; return true;");
		desc.setAttribute( "value",desc_text);
		desc_box.appendChild( desc );
		return desc_box;
	},

	_radioModule : function( module ) {
		var entry = document.createElement( "vbox" );
		entry.prefname = module.MODULE_NAME;
		entry.radio = true;
        entry.setAttribute( "class", "radio_group_box" );
		var hbox = document.createElement( "hbox" );

		var check = document.createElement( "checkbox" );
		check.addEventListener( "click", function( ev ) { ev.target.checked = !ev.target.checked; }, true );
		check.setAttribute( "checked", Foxtrick.isModuleEnabled( module ) );
        check.setAttribute( "class", "radiobox_group" );
		hbox.appendChild( check );
		hbox.addEventListener( "click", function( ev ) {
			ev.currentTarget.childNodes[0].checked = !(ev.currentTarget.childNodes[0].checked);
			var radios = ev.currentTarget.nextSibling.nextSibling.nextSibling.childNodes[0].childNodes;
			if (!ev.currentTarget.childNodes[0].checked) {
				for (var i = 0; i < radios.length; i++) {
					radios[i].setAttribute( "disabled", true);
                    radios[i].setAttribute( "hidden", true);
				}
			} else {
				for (var i = 0; i < radios.length; i++) {
					radios[i].setAttribute( "disabled", false);
                    radios[i].setAttribute( "hidden", false);
				}
			}
		}, false );

		var name = document.createElement( "label" );
		name.setAttribute( "class", "name" );
		name.setAttribute( "value", module.MODULE_NAME );
		hbox.appendChild( name );
		entry.appendChild( hbox );

		var desc_box = this._getWrapableBox ( FoxtrickPreferencesDialog.getModuleDescription( module.MODULE_NAME ) );
		entry.appendChild (desc_box);

		var spacer = document.createElement( "spacer" );
        spacer.height = "1";
        entry.appendChild( spacer );

		hbox = document.createElement( "hbox" );
		entry.appendChild( hbox );
		var radiogroup = document.createElement( "radiogroup" );
		var selectedValue = Foxtrick.getModuleValue( module );
		for (var i = 0; i < module.RADIO_OPTIONS.length; i++) {
			var radio = document.createElement( "radio" );
            radio.setAttribute( "class", "radio_in_group" );
			radio.addEventListener( "click", function( ev ) {
				if (!ev.target.disabled) {
					ev.target.setAttribute( "selected", true);
				}
			}, true );
			var selected;
			if (selectedValue == i) {
				selected = true;
			} else {
				selected = false;
			}
			radio.setAttribute( "selected", selected);
			radio.setAttribute( "label", FoxtrickPreferencesDialog.getModuleDescription(
				module.MODULE_NAME + "." + module.RADIO_OPTIONS[i] ));
			if (!Foxtrick.isModuleEnabled( module )) {
				radio.setAttribute( "disabled", true);
                radio.setAttribute( "hidden", true);
            } else {
                radio.setAttribute( "hidden", false);
            }
			radiogroup.appendChild( radio );
		}
		hbox.appendChild( radiogroup );
		return entry;
	},

	_checkboxModule : function (module, bOptionTexts) {
		var entry = document.createElement( "vbox" );
		entry.prefname = module.MODULE_NAME;
		entry.checkbox = true;
		entry.setAttribute( "class", "checkbox_group_box" );
		var hbox = document.createElement( "hbox" );

		var check = document.createElement( "checkbox" );
		check.addEventListener( "click", function( ev ) { ev.target.checked = !ev.target.checked;}, true );
		check.setAttribute( "checked", Foxtrick.isModuleEnabled( module ) );
        check.setAttribute( "class", "checkbox_group" );
		hbox.appendChild( check );
		hbox.addEventListener( "click", function( ev ) {
			ev.currentTarget.childNodes[0].checked = !(ev.currentTarget.childNodes[0].checked);
			var checkboxes = ev.currentTarget.nextSibling.nextSibling.nextSibling.childNodes;
			if (!ev.currentTarget.childNodes[0].checked) {
				for (var i = 0; i < checkboxes.length; i++) {
					checkboxes[i].setAttribute( "disabled", true);
                    checkboxes[i].setAttribute( "hidden", true);
				}
			} else {
				for (var i = 0; i < checkboxes.length; i++) {
					checkboxes[i].setAttribute( "disabled", false);
                    checkboxes[i].setAttribute( "hidden", false);
				}
			}
		}, false );

		var name = document.createElement( "label" );
		name.setAttribute( "class", "name" );
		name.setAttribute( "value", module.MODULE_NAME );
		hbox.appendChild( name );
		entry.appendChild( hbox );

		var desc_box = this._getWrapableBox ( FoxtrickPreferencesDialog.getModuleDescription( module.MODULE_NAME ) );
		entry.appendChild (desc_box);

        var spacer = document.createElement( "spacer" );
        spacer.height = "1";
        entry.appendChild( spacer );

		hbox = document.createElement( "vbox" );
		entry.appendChild( hbox );
		for (var i = 0; i < module.OPTIONS.length; i++) {
			var checkbox = document.createElement( "checkbox" );
			var key,title;
			if (module.OPTIONS[i]["key"]==null){
                key=module.OPTIONS[i];
                //title=module.OPTIONS[i];
                title = FoxtrickPreferencesDialog.getModuleElementDescription( module.MODULE_NAME, module.OPTIONS[i] );
            }
			else {key=module.OPTIONS[i]["key"];title=module.OPTIONS[i]["title"];}
			checkbox.setAttribute( "checked", Foxtrick.isModuleFeatureEnabled( module, key) );
			checkbox.setAttribute( "label", title);
			checkbox.setAttribute( "id", key);
            checkbox.setAttribute( "class", "checkbox_in_group" );
			if (!Foxtrick.isModuleEnabled( module )) {
				checkbox.setAttribute( "disabled", true);
                checkbox.setAttribute( "hidden", true);
            } else {
                checkbox.setAttribute( "disabled", false);
                checkbox.setAttribute( "hidden", false);
            }
			hbox.appendChild( checkbox );
			if (bOptionTexts 
				&& (!module.OPTION_TEXTS_DISABLED_LIST || !module.OPTION_TEXTS_DISABLED_LIST[i])) {
				
				checkbox.addEventListener( "click", function( ev ) {
					var checked = ev.currentTarget.checked;
					var optiondiv = document.getElementById(ev.currentTarget.id+'_text');
					if (checked)  {
						optiondiv.setAttribute( "disabled", true);
						optiondiv.setAttribute( "hidden", true);
					} else {
						optiondiv.setAttribute( "disabled", false);
						optiondiv.setAttribute( "hidden", false);
					}
				}, false );
				
				if (module.OPTION_TEXTS_DISABLED_LIST) dump(module.OPTION_TEXTS_DISABLED_LIST[i]+'\n');
				var htextbox = document.createElement("hbox");
				htextbox.setAttribute("id", "hbox_" + key + "_text");
				var textbox = document.createElement("textbox");
				textbox.setAttribute("id", key + "_text");
				textbox.setAttribute("style", "margin-left:20px;");
				textbox.setAttribute("width", "500px");
				var val = FoxtrickPrefs.getString( "module." + module.MODULE_NAME + "." + key + "_text" );
				if (!val && module.OPTION_TEXTS_DEFAULT_VALUES && module.OPTION_TEXTS_DEFAULT_VALUES[i]){
					val = module.OPTION_TEXTS_DEFAULT_VALUES[i];
				}
				textbox.setAttribute("value", val);
				if (!Foxtrick.isModuleFeatureEnabled( module, key) ) {
					textbox.setAttribute( "disabled", true);
					textbox.setAttribute( "hidden", true);
				} else {
					textbox.setAttribute( "disabled", false);
					textbox.setAttribute( "hidden", false);
				}
				htextbox.appendChild(textbox);
				hbox.appendChild(htextbox);
			}
		}

		return entry;
	},

	_normalModule : function (module) {
		var entry = document.createElement( "vbox" );
        entry.prefname = module.MODULE_NAME;
		entry.setAttribute( "class", "normal_entry" );
		var hbox = document.createElement( "hbox" );
		hbox.addEventListener( "click", function( ev ) {
			ev.currentTarget.childNodes[0].checked =
				!(ev.currentTarget.childNodes[0].checked);
		}, false );

		var check = document.createElement( "checkbox" );
		check.addEventListener( "click", function( ev ) { ev.target.checked = !ev.target.checked; }, true );
		check.setAttribute( "checked", Foxtrick.isModuleEnabled( module ) );
        check.setAttribute( "class", "checkbox_normal" );
		hbox.appendChild( check );
		var name = document.createElement( "label" );
		name.setAttribute( "class", "name" );
		name.setAttribute( "value", module.MODULE_NAME );
		hbox.appendChild( name );
		entry.appendChild( hbox );

		var desc_box = this._getWrapableBox ( FoxtrickPreferencesDialog.getModuleDescription( module.MODULE_NAME ) );
		entry.appendChild (desc_box);

		return entry;
	}
};

FoxtrickPreferencesDialog.core_modules = [ FoxtrickPrefs, Foxtrickl10n ];

FoxtrickPreferencesDialog.configureFoxtrick = function( button ) {
	if(!button) {
        window.open("chrome://foxtrick/content/preferences-dialog.xul",
                      "",
                      "centerscreen, chrome, modal, resizable=yes");
	}
}
	

FoxtrickPreferencesDialog.deactivate = function( button ) {
	if(!button) { 
		FoxtrickPrefs.setBool("disableTemporary",!FoxtrickPrefs.getBool("disableTemporary"));
		FoxtrickMain.init();	
	}
}

FoxtrickPreferencesDialog.copy_id = function( button ) {
	if(!button) {
    	var ID=Foxtrick.CopyID;
		Foxtrick.copyStringToClipboard(ID);
		Foxtrick.popupMenu.setAttribute( "hidden", true); 
		
	}
}	


FoxtrickPreferencesDialog.pref_show = function ( vbox ) {
    VBOXES = ["main_list", "shortcuts_list","presentation_list", "matchfunctions_list", "forum_list", "links_list", "about_list"];
    var box;
    for (var i = 0; i < VBOXES.length; i++) {
        try {
            box = document.getElementById( VBOXES[i] );
            if ( VBOXES[i] == vbox) {
                box.style.overflow = "hidden";
				box.setAttribute("style", "color:ButtonText !important; background-color:ButtonFace !important;");				
            }
            else {
                box.style.height = "300px";
                box.style.overflow = "hidden";
				box.setAttribute("style", "color:ButtonText !important; background-color:ButtonFace !important;");
            }
        }
        catch (e) {
            dump(e);
        }
    }
}

FoxtrickPreferencesDialog.prefhelp_show = function ( HelpTitle, HelpDesc, where ) {
    openDialog("chrome://foxtrick/content/preferences-help.xul",
               "FoxTrick Help",
               "titlebar=no, modal, left=" + (where.boxObject.screenX + 20) + ", top=" + (where.boxObject.screenY - 10),
               HelpTitle,
               HelpDesc);
}



// ---------------------- common function --------------------------------------

FoxtrickPreferencesDialog.setModuleEnableState = function( module_name, value ) {
	  FoxtrickPrefs.setBool( "module." + module_name + ".enabled", value );
}

FoxtrickPreferencesDialog.setModuleOptionsText = function( module_name, value ) {
	  FoxtrickPrefs.setString( "module." + module_name, value );
}

FoxtrickPreferencesDialog.setModuleValue = function( module_name, value ) {
    FoxtrickPrefs.setInt( "module." + module_name + ".value", value );
}

FoxtrickPreferencesDialog.getModuleDescription = function( module_name ) {
    var name = "foxtrick." + module_name + ".desc";
    if ( Foxtrickl10n.isStringAvailable( name ) )
        return Foxtrickl10n.getString( name );
    else {
        //dump( "Foxtrick string MODULE " + module_name + " missing!\n");
        return "No description";
    }
}

FoxtrickPreferencesDialog.getModuleElementDescription = function( module_name, option ) {
    var name = "foxtrick." + module_name + "." + option + ".desc";
    if ( Foxtrickl10n.isStringAvailable( name ) )
        return Foxtrickl10n.getString( name );
    else {
        //dump( "Foxtrick string ELEMENT " + name + " missing!\n");
        //return "No description";
        return option;
    }
}


FoxtrickPreferencesDialog.isPrefSetting = function ( setting) {
	return  setting.search( "YouthPlayer" ) == -1
			&& setting.search( "transferfilter" ) == -1
			&& setting.search( "post_templates" ) == -1
			&& setting.search( "mail_templates" ) == -1
			&& (setting.search( "LinksCustom" ) == -1 || setting.search( "LinksCustom.enabled" ) != -1) ;
}
				
FoxtrickPreferencesDialog.confirmCleanupBranch = function ( ev ) {
    if (ev) {window = FoxtrickPrefsDialogHTML._doc.defaultView;document=FoxtrickPrefsDialogHTML._doc;}
	if ( Foxtrick.confirmDialog( Foxtrickl10n.getString( 'delete_foxtrick_branches_ask' ) ) )  {
        try {
			var array = FoxtrickPrefs._getElemNames("");
			for(var i = 0; i < array.length; i++) {
				if (FoxtrickPreferencesDialog.isPrefSetting(array[i])) {
					FoxtrickPrefs.deleteValue(array[i]);
				}
			}
			FoxtrickMain.init();
            if (!ev) close();
			else document.location.href='/MyHattrick/Preferences?configure_foxtrick=true&category=main';
        }
        catch (e) {
			dump(e);
        }
    }
    return true;
}


FoxtrickPreferencesDialog.disableAll = function (ev ) {
    if (ev) {window = FoxtrickPrefsDialogHTML._doc.defaultView;document=FoxtrickPrefsDialogHTML._doc;}
	if ( Foxtrick.confirmDialog(  Foxtrickl10n.getString( 'disable_all_foxtrick_moduls_ask' ) ) )  {
        try {
			var array = FoxtrickPrefs._getElemNames("");
			for(var i = 0; i < array.length; i++) {
				if( array[i].search( /enabled$/ ) != -1) {
						FoxtrickPrefs.setBool( array[i], false );
				}
			}
			FoxtrickMain.init();
            if (!ev) close();
			else document.location.href='/MyHattrick/Preferences?configure_foxtrick=true&category=main';
        }
        catch (e) {
			dump(e);
        }
    } 
	return true;
}

FoxtrickPreferencesDialog.SavePrefs = function (ev) {
        try {
			if (ev) {window = FoxtrickPrefsDialogHTML._doc.defaultView;document=FoxtrickPrefsDialogHTML._doc;}
			var locpath=Foxtrick.selectFileSave(window);
			if (locpath==null) {return;}
			var File = Components.classes["@mozilla.org/file/local;1"].
                     createInstance(Components.interfaces.nsILocalFile);
			File.initWithPath(locpath);

			var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
                         createInstance(Components.interfaces.nsIFileOutputStream);
			foStream.init(File, 0x02 | 0x08 | 0x20, 0666, 0);
			var os = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                   .createInstance(Components.interfaces.nsIConverterOutputStream);
			os.init(foStream, "UTF-8", 0, 0x0000);

			var array = FoxtrickPrefs._getElemNames("");
			for(var i = 0; i < array.length; i++) {					
				if ((FoxtrickPreferencesDialog.isPrefSetting(array[i]) && document.getElementById("saveprefsid").checked)
					|| (!FoxtrickPreferencesDialog.isPrefSetting(array[i]) && document.getElementById("savenotesid").checked)) {
					
					var value=FoxtrickPrefs.getString(array[i]);
					if (value!=null) os.writeString('user_pref("extensions.foxtrick.prefs.'+array[i]+'","'+value.replace(/\n/g,"\\n")+'");\n');
					else { value=FoxtrickPrefs.getInt(array[i]);
						if (value==null) value=FoxtrickPrefs.getBool(array[i]);
						os.writeString('user_pref("extensions.foxtrick.prefs.'+array[i]+'",'+value+');\n');
						}
					}
				}
			os.close();
			foStream.close();

			if(!ev) close();
		}
		catch (e) {
			Foxtrick.alert(e);
        }
    return true;
}

FoxtrickPreferencesDialog.LoadPrefs = function (ev) {
        try {
			// nsifile
			if (ev) {window = FoxtrickPrefsDialogHTML._doc.defaultView;document=FoxtrickPrefsDialogHTML._doc;}
			var locpath=Foxtrick.selectFile(window);
			if (locpath==null) return;
			var File = Components.classes["@mozilla.org/file/local;1"].
                     createInstance(Components.interfaces.nsILocalFile);
			File.initWithPath(locpath);
			// converter
			var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
                          .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
			converter.charset = "UTF-8";
			var fis = Components.classes["@mozilla.org/network/file-input-stream;1"]
                    .createInstance(Components.interfaces.nsIFileInputStream);
			fis.init(File, -1, -1, 0);
			var lis = fis.QueryInterface(Components.interfaces.nsILineInputStream);
			var lineData = {};
			var cont;
			do {
				cont = lis.readLine(lineData);
				var line = converter.ConvertToUnicode(lineData.value);
				var key = line.match(/user_pref\("extensions\.foxtrick\.prefs\.(.+)",/)[1];
				var value=line.match(/\",(.+)\)\;/)[1];
				var strval = value.match(/\"(.+)\"/);
				if (value == "\"\"") FoxtrickPrefs.setString(key,"");
				else if (strval != null) FoxtrickPrefs.setString(key,strval[1]);
				else if (value == "true") FoxtrickPrefs.setBool(key,true);
				else if (value == "false") FoxtrickPrefs.setBool(key,false);
				else FoxtrickPrefs.setInt(key,value);
			} while (cont);

			fis.close();
			FoxtrickMain.init();            
			if (!ev) close();
			else document.location.href='/MyHattrick/Preferences?configure_foxtrick=true&category=main';
		
		}
		catch (e) {
			Foxtrick.alert(e);
        }
    return true;
}


