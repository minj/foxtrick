/**
 * HTML-Preference dialog functions.
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickPrefsDialogHTML = {
	MODULE_NAME : "PrefsDialogHTML",
	CORE_MODULE : true,
	PAGES : [ "all" ],
	CSS : Foxtrick.ResourcePath + "resources/css/preferences-dialog-html.css",

	run : function(page, doc) {
		// make chrome:// links clickable
		if (Foxtrick.BuildFor == "Gecko") {
			doc.addEventListener("click", function(ev) {
				var target = ev.target;
				// nested
				if (target.nodeName.toLowerCase() != "a" && target.parentNode)
					target = target.parentNode;
				if (target.nodeName.toLowerCase() == "a"
					&& target.href.indexOf("chrome://foxtrick/") == 0) {
					Foxtrick.newTab(target.href);
				}
			}, true);
		}
	},

	save : function( ev ) {
		try {
			var doc = ev.target.ownerDocument;
			if (Foxtrick.BuildFor == "Chrome")
				FoxtrickPrefs.do_dump = false;

			for ( var i in Foxtrick.modules ) {
				var module = Foxtrick.modules[i];

				if (!module.MODULE_CATEGORY || module.MODULE_CATEGORY==Foxtrick.moduleCategories.MAIN )
					continue; // no main prefs

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

			if (Foxtrick.BuildFor=='Chrome') {
				FoxtrickPrefs.do_dump = true;
				portsetpref.postMessage({reqtype: "get_css_text", css_filelist: Foxtrick.cssfiles});
				Foxtrick.dumpPrefs();
			}
			else {
				FoxtrickPrefs.setBool("preferences.updated", true);
				doc.location.reload();
			}
		}
		catch (e) {
			if (Foxtrick.BuildFor=='Chrome')
				FoxtrickPrefs.do_dump = true;
			Foxtrick.dumpError(e);
		}
	},

	selectfile : function( ev ) {
		var doc = ev.target.ownerDocument;
		var file = Foxtrick.selectFile(doc.defaultView);
		if (file != null) {doc.getElementById(ev.target.getAttribute('inputid')).value='file://' + (file)};
	},

	entry_sortfunction: function(a,b) {return a.getAttribute('prefname').localeCompare(b.getAttribute('prefname'));},

	_screenshot : function(doc, link) {
		var a = doc.createElement("a");
		a.className = "ft_actionicon foxtrickScreenshot";
		a.href = link;
		a.title = Foxtrickl10n.getString("foxtrick.prefs.commented_screenshots");
		a.setAttribute('target','_blank');
		return a;
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

		var selectedValue = FoxtrickPrefs.getModuleValue(module);
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
			var has_load_button=false;
			if ( module.OPTION_TEXTS != null && module.OPTION_TEXTS
				&& (!module.OPTION_TEXTS_DISABLED_LIST || !module.OPTION_TEXTS_DISABLED_LIST[i])) {

				var val = FoxtrickPrefs.getString( "module." + module.MODULE_NAME + "." + key + "_text" );
				OptionText = val;

				if (module.OPTION_TEXTS_LOAD_BUTTONS && module.OPTION_TEXTS_LOAD_BUTTONS[i]){
					has_load_button = module.OPTION_TEXTS_LOAD_BUTTONS[i];
				}
			}

			var checked = Foxtrick.isModuleFeatureEnabled( module, key)
			var group = module.MODULE_NAME + '.' + key;
			optiondiv.appendChild(FoxtrickPrefsDialogHTML._getCheckBox(doc, group, title, title_long, checked, OptionText, has_load_button, on_page ));
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

	_getCheckBox : function (doc, name, label, label_long, checked, option_text, has_load_button, on_page) {
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
				var td = doc.createElement( "td" );
				tr.appendChild( td );
				var button= doc.createElement("input");
				button.setAttribute("value",Foxtrickl10n.getString("button.import"));
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
	}
}
