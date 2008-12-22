/**
 * Preference dialog functions.
 * @author Mod-PaV
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickPreferencesDialog = {

    init : function() {
        // var doc = ev.originalTarget;
        var i;
                
        for ( i in FoxtrickPreferencesDialog.core_modules ) {
            FoxtrickPreferencesDialog.core_modules[i].init()
        }

        for each ( cat in Foxtrick.moduleCategories ) {
            FoxtrickPreferencesDialog._fillModulesList( document, cat );
        }
        
        this.initLangPref();
        this.initAlertPref();
		this.initStagePref();
    },
    
    initAlertPref: function() {
    	document.getElementById('alertsliderpref').setAttribute( "checked", FoxtrickPrefs.getBool( "alertSlider" ) );
    	document.getElementById('alertslidermacpref').setAttribute( "checked", FoxtrickPrefs.getBool( "alertSliderGrowl" ) );
    	document.getElementById('alertsoundpref').setAttribute( "checked", FoxtrickPrefs.getBool( "alertSound" ) );
        document.getElementById('alertsoundurlpref').setAttribute( "value", FoxtrickPrefs.getString( "alertSoundUrl" ) );
    },
    
    initLangPref: function() {
        //var popupmenu = document.getElementById('langsettingPopup');
        
        try {
            var htLanguagesXml = document.implementation.createDocument("", "", null);
            htLanguagesXml.async = false;
            htLanguagesXml.load("chrome://foxtrick/content/htlocales/htlang.xml", "text/xml");
            
            var itemToSelect=this.fillListFromXml("htLanguagePopup", "htLanguage-", htLanguagesXml, "language", "desc", "name", FoxtrickPrefs.getString("htLanguage"));

            document.getElementById('htLanguage').selectedIndex=itemToSelect;
            
        } catch (e) {
            Foxtrick.alert(e);
        }
    },
	
	initStagePref : function() {
		document.getElementById('stagepref').setAttribute( "checked", FoxtrickPrefs.getBool( "disableOnStage" ) );
	},

    onDialogAccept : function() {
        var modules_list;
                
        for each ( cat in Foxtrick.moduleCategories ) {
                switch(cat) {
                        case Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS:
                                modules_list = document.getElementById( 'shortcuts_list' );
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
                }
				
				for ( var i = 0; i < modules_list.childNodes.length; ++i ) {
					FoxtrickPreferencesDialog.setModuleEnableState( modules_list.childNodes[i].prefname,
                                                   modules_list.childNodes[i].childNodes[0].childNodes[0].checked );
					if (modules_list.childNodes[i].radio) {
						var radiogroup = modules_list.childNodes[i].childNodes[1].childNodes[0].childNodes;
						for (var j = 0; j < radiogroup.length; j++) {
							if (radiogroup[j].selected) {
								FoxtrickPreferencesDialog.setModuleValue( modules_list.childNodes[i].prefname, j );
								break;
							}
						}
					} else if (modules_list.childNodes[i].checkbox) {
						var checkboxes = modules_list.childNodes[i].childNodes[1].childNodes;
						for (var j = 0; j < checkboxes.length; j++) {
							FoxtrickPreferencesDialog.setModuleEnableState( modules_list.childNodes[i].prefname + "." + checkboxes[j].id, checkboxes[j].checked );
						}
					}
                                                   // modules_list.childNodes[i].checked );
            // dump( modules_list.childNodes[i].prefname + " " + modules_list.childNodes[i].childNodes[0].childNodes[0].checked + "\n" );
                }
        }
        
        //Lang
        FoxtrickPrefs.setString("htLanguage", document.getElementById("htLanguage").value);
        
        //Alert
        FoxtrickPrefs.setBool("alertSlider", document.getElementById("alertsliderpref").checked);
        FoxtrickPrefs.setBool("alertSliderGrowl", document.getElementById("alertslidermacpref").checked);
        FoxtrickPrefs.setBool("alertSound", document.getElementById("alertsoundpref").checked);
        FoxtrickPrefs.setString("alertSoundUrl", document.getElementById("alertsoundurlpref").value);
        
        //Stage
		FoxtrickPrefs.setBool("disableOnStage", document.getElementById("stagepref").checked);
        // reinitialize
        FoxtrickMain.init();
                
        return true;
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
						case Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS:
                                modules_list = document.getElementById( 'shortcuts_list' );
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
                }

				for ( i in Foxtrick.modules ) {
					var module = Foxtrick.modules[i];  
                        var module_category;
                        module_category = module.MODULE_CATEGORY;
                        if(!module_category) {
                                // MODULE_CATEGORY isn't set; use default
                                module_category = "shortcutsandtweaks";
                        }
                        if(module_category == category) {
							if (module.RADIO_OPTIONS != null) {
								var entry = document.createElement( "vbox" );
                                entry.prefname = module.MODULE_NAME;
								entry.radio = true;
                                entry.setAttribute( "class", "entry" );
                                var hbox = document.createElement( "hbox" );
								
								var check = document.createElement( "checkbox" );
                                check.addEventListener( "click", function( ev ) { ev.target.checked = !ev.target.checked; }, true );
                                check.setAttribute( "checked", Foxtrick.isModuleEnabled( module ) ); 
                                hbox.appendChild( check );
								hbox.addEventListener( "click", function( ev ) { 
				                    ev.currentTarget.childNodes[0].checked = !(ev.currentTarget.childNodes[0].checked);
									var radios = ev.currentTarget.nextSibling.childNodes[0].childNodes;
									if (!ev.currentTarget.childNodes[0].checked) {
										for (var i = 0; i < radios.length; i++) {
											radios[i].setAttribute( "disabled", true);
										}
									} else {
										for (var i = 0; i < radios.length; i++) {
											radios[i].setAttribute( "disabled", false);
										}
									}
				                }, false );
								
								var name = document.createElement( "label" );
                                name.setAttribute( "class", "name" );
                                name.setAttribute( "value", module.MODULE_NAME );
                                hbox.appendChild( name );
                                entry.appendChild( hbox );
                                var desc = document.createElement( "label" );
                                desc.setAttribute( "class", "description" );
                                var desc_text = document.createTextNode( FoxtrickPreferencesDialog.getModuleDescription( module.MODULE_NAME ) );
                                desc.appendChild( desc_text );
                                hbox.appendChild( desc );
								
								hbox = document.createElement( "hbox" );
								entry.appendChild( hbox );
								var radiogroup = document.createElement( "radiogroup" );
								var selectedValue = Foxtrick.getModuleValue( module );
								for (var i = 0; i < module.RADIO_OPTIONS.length; i++) {
									var radio = document.createElement( "radio" );
									radio.style.marginLeft = "30px";
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
										radio.setAttribute( "disabled", true);;
									}
	                                radiogroup.appendChild( radio );
								}
								hbox.appendChild( radiogroup );
                                
                                modules_list.appendChild( entry );
							} else if (module.OPTIONS != null) {
								var entry = document.createElement( "vbox" );
                                entry.prefname = module.MODULE_NAME;
								entry.checkbox = true;
                                entry.setAttribute( "class", "entry" );
                                var hbox = document.createElement( "hbox" );
								
								var check = document.createElement( "checkbox" );
                                check.addEventListener( "click", function( ev ) { ev.target.checked = !ev.target.checked; }, true );
                                check.setAttribute( "checked", Foxtrick.isModuleEnabled( module ) ); 
                                hbox.appendChild( check );
								hbox.addEventListener( "click", function( ev ) { 
				                    ev.currentTarget.childNodes[0].checked = !(ev.currentTarget.childNodes[0].checked);
									var checkboxes = ev.currentTarget.nextSibling.childNodes;
									if (!ev.currentTarget.childNodes[0].checked) {
										for (var i = 0; i < checkboxes.length; i++) {
											checkboxes[i].setAttribute( "disabled", true);
										}
									} else {
										for (var i = 0; i < checkboxes.length; i++) {
											checkboxes[i].setAttribute( "disabled", false);
										}
									}
				                }, false );
								
								var name = document.createElement( "label" );
                                name.setAttribute( "class", "name" );
                                name.setAttribute( "value", module.MODULE_NAME );
                                hbox.appendChild( name );
                                entry.appendChild( hbox );
                                var desc = document.createElement( "label" );
                                desc.setAttribute( "class", "description" );
                                var desc_text = document.createTextNode( FoxtrickPreferencesDialog.getModuleDescription( module.MODULE_NAME ) );
                                desc.appendChild( desc_text );
                                hbox.appendChild( desc );
								
								hbox = document.createElement( "vbox" );
								entry.appendChild( hbox );
								for (var i = 0; i < module.OPTIONS.length; i++) {
									var checkbox = document.createElement( "checkbox" );
									checkbox.style.marginLeft = "30px";
									checkbox.setAttribute( "checked", Foxtrick.isModuleFeatureEnabled( module, module.OPTIONS[i]) );
									checkbox.setAttribute( "label", module.OPTIONS[i] );
									checkbox.setAttribute( "id", module.OPTIONS[i]);
									if (!Foxtrick.isModuleEnabled( module )) {
										checkbox.setAttribute( "disabled", true);;
									}
	                                hbox.appendChild( checkbox );
								}
                                
                                modules_list.appendChild( entry );
							} else {
								var entry = document.createElement( "vbox" );
                                entry.prefname = module.MODULE_NAME;
                                entry.setAttribute( "class", "entry" );
                                entry.addEventListener( "click", function( ev ) { 
				                    ev.currentTarget.childNodes[0].childNodes[0].checked =
				                        !(ev.currentTarget.childNodes[0].childNodes[0].checked);
				                }, false );
                                var hbox = document.createElement( "hbox" );
                                var check = document.createElement( "checkbox" );
                                check.addEventListener( "click", function( ev ) { ev.target.checked = !ev.target.checked; }, true );
                                check.setAttribute( "checked", Foxtrick.isModuleEnabled( module ) ); 
                                hbox.appendChild( check );
                                var name = document.createElement( "label" );
                                name.setAttribute( "class", "name" );
                                name.setAttribute( "value", module.MODULE_NAME );
                                hbox.appendChild( name );
                                entry.appendChild( hbox );
                                var desc = document.createElement( "label" );
                                desc.setAttribute( "class", "description" );
                                var desc_text = document.createTextNode( FoxtrickPreferencesDialog.getModuleDescription( module.MODULE_NAME ) );
                                desc.appendChild( desc_text );
                                entry.appendChild( desc );
                                modules_list.appendChild( entry );
							}
                        }
        }
    }

};

FoxtrickPreferencesDialog.core_modules = [ FoxtrickPrefs, Foxtrickl10n ];

FoxtrickPreferencesDialog.setModuleEnableState = function( module_name, value ) {
    FoxtrickPrefs.setBool( "module." + module_name + ".enabled", value );
}

FoxtrickPreferencesDialog.setModuleValue = function( module_name, value ) {
    FoxtrickPrefs.setInt( "module." + module_name + ".value", value );
}

FoxtrickPreferencesDialog.getModuleDescription = function( module_name ) {
    var name = "foxtrick." + module_name + ".desc";
    if ( Foxtrickl10n.isStringAvailable( name ) )
        return Foxtrickl10n.getString( name );
    else
        return "No description";
}

FoxtrickPreferencesDialog.configureFoxtrick = function( ) {
        window.openDialog("chrome://foxtrick/content/preferences-dialog.xul",
                      "", "centerscreen, chrome, modal, resizable=yes");
}
