/**
 * preferences.js
 * Foxtrick preferences service
 * @author Mod-PaV
 */
////////////////////////////////////////////////////////////////////////////////

if (Foxtrick.BuildFor === "Chrome") {
	var portsetpref = chrome.extension.connect({name: "ftpref-query"});
	portsetpref.onMessage.addListener(function(msg) {
		if (msg.set == 'lang_changed') {
			console.log('lang_changed');
			Foxtrickl10n.properties = msg.properties;
			if (msg.reload)
				document.location.reload();
		}
		else if (msg.set=='css_text_set') {
			console.log('css_text_set');
			var begin = new Date();
			Foxtrick.addStyleSheetSnippet(document, msg.css_text);
			var end = new Date();
			var time = end.getTime() - begin.getTime();
			console.log("load css_text time: " + time + " ms\n");
		}
	});
}

var FoxtrickPrefs = {
	_pref_branch : null,
	pref_default:'',

	init : function() {
		if (Foxtrick.BuildFor === "Gecko") {
			var prefs = Components
				.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService);
			FoxtrickPrefs._pref_branch = prefs.getBranch("extensions.foxtrick.prefs.");
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			// get prefrences
			// this is used when loading from options page, not valid
			// in content script since access to localStorage is forbidden
			if (Foxtrick.chromeContext() == "background") {
				try {
					// user preferences
					FoxtrickPrefs.pref = {};
					var length = localStorage.length;
					for (var i = 0; i < length; ++i) {
						var key = localStorage.key(i);
						var value = localStorage.getItem(key);
						try {
							FoxtrickPrefs.pref[key] = JSON.parse(value);
						}
						catch (e) {
							Foxtrick.dump("Preference parse error: "
								+ "key: " + key
								+ ", value: " + value + "\n");
						}
					}

					var prefUrl = chrome.extension.getURL("defaults/preferences/foxtrick.js");
					var prefXhr = new XMLHttpRequest();
					prefXhr.open("GET", prefUrl, false);
					prefXhr.send();
					var prefList = prefXhr.responseText.split(/[\n\r]+/);
					const prefRe = /pref\("extensions\.foxtrick\.prefs\.(.+)",\s*(.+)\);/;
					FoxtrickPrefs.prefDefault = {};
					for (var i = 0; i < prefList.length; ++i) {
						var pref = prefList[i];
						var matches = pref.match(prefRe);
						if (matches) {
							var key = matches[1];
							var value = matches[2];
							if (value == "true")
								FoxtrickPrefs.prefDefault[key] = true;
							else if (value == "false")
								FoxtrickPrefs.prefDefault[key] = false;
							else if (!isNaN(Number(value)))
								FoxtrickPrefs.prefDefault[key] = Number(value)
							else if (value.match(/^"(.*)"$/))
								FoxtrickPrefs.prefDefault[key] = String(value.match(/^"(.*)"$/)[1]);
						}
					}
				}
				catch (e) {
					Foxtrick.dumpError(e);
				}
			}
			else if (Foxtrick.chromeContext() == "content") {
				var port = chrome.extension.connect({name : "pref"});
				port.onMessage.addListener(function(msg) {
					FoxtrickPrefs.pref = msg.pref;
					FoxtrickPrefs.prefDefault = msg.prefDefault;
				});
				port.postMessage({req : "get"});
			}
		}
	},

	getString : function(pref_name) {
		if (Foxtrick.BuildFor === "Gecko") {
			var str;
			try {
				str = FoxtrickPrefs._pref_branch.getComplexValue(encodeURI(pref_name),
					Components.interfaces.nsISupportsString).data;
			}
			catch (e) {
	 				str = null;
			}
			if (str == null) {
				try {
					str = FoxtrickPrefs._pref_branch.getComplexValue( pref_name,
									Components.interfaces.nsISupportsString ).data;
	 			}
	 			catch (e) {
					str = null;
				}
			}
	 		return str;
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			var value = this.getValue(pref_name);
			if (typeof(value) == "string")
				return value;
			return null;
		}
	},

	setString : function(pref_name, value) {
		if (Foxtrick.BuildFor === "Gecko") {
			var str = Components
				.classes[ "@mozilla.org/supports-string;1" ]
				.createInstance(Components.interfaces.nsISupportsString);
			str.data = value;
			FoxtrickPrefs._pref_branch.setComplexValue(encodeURI(pref_name),
				Components.interfaces.nsISupportsString, str);
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			this.setValue(pref_name, String(value));
		}
	},

	getInt : function(pref_name) {
		if (Foxtrick.BuildFor === "Gecko") {
			var value;
			try {
				value = FoxtrickPrefs._pref_branch.getIntPref(encodeURI(pref_name));
			}
			catch (e) {
				value = null;
			}
			if (value == null) {
				try {
					value = FoxtrickPrefs._pref_branch.getIntPref(pref_name);
				}
				catch (e) {
					value = null;
				}
			}
			return value;
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			var value = this.getValue(pref_name);
			if (typeof(value) == "number")
				return value;
			return null;
		}
	},

	setInt : function(pref_name, value) {
		if (Foxtrick.BuildFor === "Gecko") {
			FoxtrickPrefs._pref_branch.setIntPref(encodeURI(pref_name), value);
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			this.setValue(pref_name, Number(value));
		}
	},

	getBool : function(pref_name) {
		if (Foxtrick.BuildFor === "Gecko") {
			var value;
			try {
				value = FoxtrickPrefs._pref_branch.getBoolPref(encodeURI(pref_name));
			}
			catch (e) {
				value = null;
			}
			if (value == null) {
				try {
					value = FoxtrickPrefs._pref_branch.getBoolPref(pref_name);
				}
				catch (e) {
					value = null;
				}
			}
			return value;
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			var value = this.getValue(pref_name);
			if (typeof(value) == "boolean")
				return value;
			return null;
		}
	},

	setBool : function(pref_name, value) {
		if (Foxtrick.BuildFor === "Gecko") {
			FoxtrickPrefs._pref_branch.setBoolPref(encodeURI(pref_name), value);
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			this.setValue(pref_name, Boolean(value));
		}
	},

	/** Add a new preference "pref_name" of under "list_name".
	 * Creates the list if not present.
	 * Returns true if added (false if empty or already on the list).
	 */
	addPrefToList : function( list_name, pref_value ) {

		if ( pref_value == "" )
			return false;

		var existing = FoxtrickPrefs.getList( list_name );

		// already exists?
		var exists = Foxtrick.some(existing,
			function(val) { return (val == pref_value); });

		if ( !exists ) {
			existing.push( pref_value );
			FoxtrickPrefs._populateList( list_name, existing );

			return true;
		}

		return false
	},

	getList : function( list_name ) {
		var names = FoxtrickPrefs._getElemNames( list_name );
		var list = new Array();
		for ( var i in names )
			list.push( FoxtrickPrefs.getString( names[i] ) );

		return list;
	},

	_getElemNames : function( list_name ) {
		try {
			var prefix = (list_name == "") ? "" : encodeURI(list_name + ".");
			if (Foxtrick.BuildFor === "Gecko") {
				var array = FoxtrickPrefs._pref_branch.getChildList(prefix, {});
				for (var i = 0; i < array.length; ++i)
					array[i] = decodeURI(array[i]);
				return array;
			}
			else if (Foxtrick.BuildFor === "Chrome") {
				var array = [];
				for (var i in this.pref) {
					if (i.indexOf(prefix) == 0)
						if (!this.prefDefault[i]) // only if not default to eliminate duplicacy
							array.push(i);
				}
				for (var i in this.prefDefault) {
					if (i.indexOf(prefix) == 0)
						array.push(i);
				}
				return array;
			}
		}
		catch (e) {
			return null;
		}
	},

	/** Remove a list element. */
	delListPref : function( list_name, pref_value ) {
		var existing = FoxtrickPrefs.getList( list_name );
		var remaining = Foxtrick.filter(existing,
			function(val) { return (val != pref_value); });

		FoxtrickPrefs._populateList(list_name, remaining);
	},

	/** Populate list_name with given array deleting if exists */
	_populateList : function(list_name, values)
	{
		if (Foxtrick.BuildFor === "Gecko") {
			FoxtrickPrefs._pref_branch.deleteBranch( encodeURI(list_name) );
			for (var i in values )
				FoxtrickPrefs.setString( decodeURI(list_name + "." + i), values[i] );
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			const array = this._getElemNames(list_name);
			for (var i in array) {
				this.deleteValue(i);
			}
			for (var i in values) {
				this.setValue(list_name + "." + i, values[i]);
			}
		}
	},

	deleteValue : function(value_name) {
		if (Foxtrick.BuildFor === "Gecko") {
			if (FoxtrickPrefs._pref_branch.prefHasUserValue(encodeURI(value_name)))
				FoxtrickPrefs._pref_branch.clearUserPref(encodeURI(value_name));   // reset to default
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			delete(this.pref[value_name]);
			if (Foxtrick.chromeContext() == "background") {
				localStorage.removeItem(value_name);
			}
			else if (Foxtrick.chromeContext() == "content") {
				this.dumpPrefs();
			}
		}
	},

	// ---------------------- common function --------------------------------------
	setModuleEnableState : function( module_name, value ) {
		FoxtrickPrefs.setBool( "module." + module_name + ".enabled", value );
	},

	setModuleOptionsText : function( module_name, value ) {
		FoxtrickPrefs.setString( "module." + module_name, value );
	},

	getModuleValue : function(module) {
		const moduleName = (module.MODULE_NAME) ? String(module.MODULE_NAME) : String(module);
		const val = FoxtrickPrefs.getInt("module." + moduleName + ".value");
		return val;
	},

	setModuleValue : function(module, value) {
		const moduleName = (module.MODULE_NAME) ? String(module.MODULE_NAME) : String(module);
		FoxtrickPrefs.setInt("module." + moduleName + ".value", value);
	},

	getModuleDescription : function( module_name ) {
		var name = "foxtrick." + module_name + ".desc";
		if ( Foxtrickl10n.isStringAvailable( name ) )
			return Foxtrickl10n.getString( name );
		else {
			//dump( "Foxtrick string MODULE " + module_name + " missing!\n");
			return "No description";
		}
	},

	getModuleElementDescription : function( module_name, option ) {
		var name = "foxtrick." + module_name + "." + option + ".desc";
		if ( Foxtrickl10n.isStringAvailable( name ) )
			return Foxtrickl10n.getString( name );
		else {
			//dump( "Foxtrick string ELEMENT " + name + " missing!\n");
			//return "No description";
			return option;
		}
	},


	isPrefSetting : function ( setting) {
		return setting.search( "transferfilter" ) == -1
			&& setting.search( "post_templates" ) == -1
			&& setting.search( "mail_templates" ) == -1
			&& (setting.search( "LinksCustom" ) == -1 || setting.search( "LinksCustom.enabled" ) != -1) ;
	},

	cleanupBranch : function () {
		try {
			var array = FoxtrickPrefs._getElemNames("");
			for (var i = 0; i < array.length; i++) {
				if (FoxtrickPrefs.isPrefSetting(array[i])) {
					FoxtrickPrefs.deleteValue(array[i]);
				}
			}
			FoxtrickMain.init();
		}
		catch (e) {
			Foxtrick.dumpError(e);
			return false;
		}
		return true;
	},

	disableAll : function () {
		try {
			var array = FoxtrickPrefs._getElemNames("");
			for (var i = 0; i < array.length; i++) {
				if (array[i].search(/enabled$/) != -1) {
					FoxtrickPrefs.setBool(array[i], false);
				}
			}
			FoxtrickMain.init();
		}
		catch (e) {
			Foxtrick.dumpError(e);
			return false;
		}
		return true;
	},

	SavePrefs : function(savePrefs, saveNotes) {
		try {
			const format = 'user_pref("extensions.foxtrick.prefs.%key",%value);';
			var ret = "";
			var array = FoxtrickPrefs._getElemNames("");
			array.sort();
			for (var i = 0; i < array.length; i++) {
				var key = array[i];
				if ((FoxtrickPrefs.isPrefSetting(key) && savePrefs)
					|| (!FoxtrickPrefs.isPrefSetting(key) && saveNotes)) {
					var item = format.replace(/%key/, key);

					var value = null;
					if ((value = FoxtrickPrefs.getString(key)) !== null)
						item = item.replace(/%value/, "\"" + value.replace(/\n/g, "\\n") + "\"");
					else if ((value = FoxtrickPrefs.getInt(key)) !== null)
						item = item.replace(/%value/, value);
					else if ((value = FoxtrickPrefs.getBool(key)) !== null)
						item = item.replace(/%value/, value);
					if (value !== null)
						ret += item + "\n";
				}
			}
			return ret;
		}
		catch (e) {
			Foxtrick.dumpError(e);
			return null;
		}
	},

	LoadPrefs : function(string) {
		const format = /user_pref\("extensions\.foxtrick\.prefs\.(.+)",(.+)\);/;
		var lines = string.split("\n");
		for (var i = 0; i < lines.length; ++i) {
			try {
				var line = lines[i];
				var matches = line.match(format);
				if (!matches)
					continue;
				var key = matches[1];
				var value = matches[2];
				if (value.match(/^".+"$/))
					FoxtrickPrefs.setString(key, value.match(/^"(.+)"$/)[1]);
				else if (!isNaN(value))
					FoxtrickPrefs.setInt(key, Number(value));
				else if (value == "true" || value == "false")
					FoxtrickPrefs.setBool(key, value == "true");
			}
			catch (e) {
				Foxtrick.dump("Value: " + matches[2]);
				Foxtrick.dumpError(e);
			}
		}
		FoxtrickPrefs.setBool("preferences.updated", true);
	},

	show : function() {
		Foxtrick.newTab(Foxtrick.ResourcePath + "preferences.xhtml");
	},

	disable : function() {
		var statusBarImg = document.getElementById("foxtrick-status-bar-img");
		FoxtrickPrefs.setBool("disableTemporary", !FoxtrickPrefs.getBool("disableTemporary"));
		FoxtrickCore.updateStatus();
		FoxtrickMain.init();
	}
};

if (Foxtrick.BuildFor == "Chrome") {
	FoxtrickPrefs.getValue = function(key) {
		try {
			if (this.pref[key] !== undefined)
				return this.pref[key];
			else if (this.prefDefault[key] !== undefined)
				return this.prefDefault[key];
			else
				return null;
		}
		catch (e) {
			return null;
		}
	}
	FoxtrickPrefs.setValue = function(key, value) {
		try {
			if (this.prefDefault[key] === value)
				this.deleteValue(key);
			else {
				this.pref[key] = value; // not default, set it
				if (Foxtrick.chromeContext() == "background") {
					localStorage.setItem(key, JSON.stringify(value));
				}
				else if (Foxtrick.chromeContext() == "content") {
					this.dumpPrefs();
				}
			}
		}
		catch (e) {}
	}
	FoxtrickPrefs.dumpPrefs = function() {
		var port = chrome.extension.connect({name : "pref"});
		port.postMessage({
			req : "set",
			pref : FoxtrickPrefs.pref
		})
	}
}
