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
	do_dump: true,

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
			try {
				if (localStorage["pref"] === undefined
					|| localStorage["pref"] == "") {
					// default prefs
					listUrl = chrome.extension.getURL("defaults/preferences/foxtrick.js");
					var prefxhr = new XMLHttpRequest();
					prefxhr.open("GET", listUrl, false);
					prefxhr.send();
					var preftext = prefxhr.responseText;
					preftext = preftext.replace(/(^|\n|\r)pref/g, "$1" + "user_pref");
				}
				else
					var preftext = localStorage["pref"];  // save prefs in extension settings
				FoxtrickPrefs.pref = preftext;

				listUrl = chrome.extension.getURL("defaults/preferences/foxtrick.js");
				var prefdefaultxhr = new XMLHttpRequest();
				prefdefaultxhr.open("GET", listUrl, false);
				prefdefaultxhr.send();
				FoxtrickPrefs.pref_default = prefdefaultxhr.responseText;
			}
			catch (e) {
				// in content script
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
 			var string_regexp = new RegExp('user_pref\\("extensions.foxtrick.prefs.' + pref_name + '",\\s*"(.+)"\\);');
			if (FoxtrickPrefs.pref.match(string_regexp) !== null) {
				try {
					return FoxtrickPrefs.pref.match(string_regexp)[1].replace(/chrome:\/\/foxtrick\/content\//gi,chrome.extension.getURL(''));
				}
				catch (e) {
					return "";
				}
			}
			if (FoxtrickPrefs.pref_default.match(string_regexp) !== null) {
				try {
					return FoxtrickPrefs.pref_default.match(string_regexp)[1].replace(/chrome:\/\/foxtrick\/content\//gi,chrome.extension.getURL(''));
				}
				catch (e) {
					return "";
				}
			}
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
			var string_regexp = new RegExp('"extensions.foxtrick.prefs.'+pref_name+'",.+\\);');
			if (FoxtrickPrefs.pref.search(string_regexp) !=-1) 
				FoxtrickPrefs.pref = FoxtrickPrefs.pref.replace(string_regexp,'"extensions.foxtrick.prefs.'+ pref_name+'", "'+value+'");');
			else
				FoxtrickPrefs.pref += 'user_pref("extensions.foxtrick.prefs.'+pref_name+'", "'+value+'");\n';
			if (FoxtrickPrefs.do_dump==true) {
				portsetpref.postMessage({reqtype: "save_prefs", prefs: FoxtrickPrefs.pref, reload:false});
			}
		}
	},

	setInt : function(pref_name, value) {
		if (Foxtrick.BuildFor === "Gecko") {
			FoxtrickPrefs._pref_branch.setIntPref(encodeURI(pref_name), value);
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			var string_regexp = new RegExp('"extensions.foxtrick.prefs.'+pref_name+'", .+\\);');
			if (FoxtrickPrefs.pref.search(string_regexp) != -1)
				FoxtrickPrefs.pref = FoxtrickPrefs.pref.replace(string_regexp,'"extensions.foxtrick.prefs.'+ pref_name+'", '+value+');')
			else
				FoxtrickPrefs.pref += 'user_pref("extensions.foxtrick.prefs.'+pref_name+'", '+value+');\n';
			if (FoxtrickPrefs.do_dump == true) {
				portsetpref.postMessage({reqtype: "save_prefs", prefs: FoxtrickPrefs.pref, reload:false});
			}
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
			var string_regexp = new RegExp('user_pref\\("extensions.foxtrick.prefs.'+ pref_name+ '",\\s*(\\d+)\\);');
			if (FoxtrickPrefs.pref.match(string_regexp) !== null)
				return parseInt(FoxtrickPrefs.pref.match(string_regexp)[1]);
			if (FoxtrickPrefs.pref_default.match(string_regexp) !== null) {
				return parseInt(FoxtrickPrefs.pref_default.match(string_regexp)[1]);
			}
		}
	},

	setBool : function(pref_name, value) {
		if (Foxtrick.BuildFor === "Gecko") {
			FoxtrickPrefs._pref_branch.setBoolPref(encodeURI(pref_name), value);
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			var string_regexp = new RegExp('"extensions.foxtrick.prefs.'+pref_name+'",\\s*.+\\);');
			if (FoxtrickPrefs.pref.search(string_regexp) != -1)
				FoxtrickPrefs.pref = FoxtrickPrefs.pref.replace(string_regexp,'"extensions.foxtrick.prefs.'+ pref_name+'", '+value+');')				
			else
				FoxtrickPrefs.pref += 'user_pref("extensions.foxtrick.prefs.'+pref_name+'", '+value+');\n';	
			if (FoxtrickPrefs.do_dump==true) {
				portsetpref.postMessage({reqtype: "save_prefs", prefs: FoxtrickPrefs.pref, reload:false});
			}
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
			var string_regexp = new RegExp('user_pref\\("extensions.foxtrick.prefs.' + pref_name + '",\\s*(.+)\\);');		
			if (FoxtrickPrefs.pref.match(string_regexp) !== null)
				return (FoxtrickPrefs.pref.match(string_regexp)[1] == "true");
			if (FoxtrickPrefs.pref_default.match(string_regexp) !== null)
				return (FoxtrickPrefs.pref_default.match(string_regexp)[1] == "true");
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
		var exists = existing.some(
			function( el ) {
				if ( el == pref_value ) {
					return true;
				}
			}
		);

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
			if (Foxtrick.BuildFor === "Gecko") {
				var array = null;
				if( list_name != "" )
					array = FoxtrickPrefs._pref_branch.getChildList( encodeURI(list_name + "."), {} );
				else
					array = FoxtrickPrefs._pref_branch.getChildList( "", {} );
				for (var i=0;i<array.length;++i) {array[i] = decodeURI(array[i]);}
				return array;
			}
			else if (Foxtrick.BuildFor === "Chrome") {
				var string_regexp = new RegExp('"extensions.foxtrick.prefs.('+list_name+'.+),"','g');
				var array = FoxtrickPrefs.pref.match(string_regexp);
				if (array) {
					for (var i=0;i<array.length;++i)
						array[i]=array[i].replace(/"|,|extensions.foxtrick.prefs./g,'');
					return array;
				} 
				else return [];
			}
		}
		catch (e) {
			return null;
		}
	},

	/** Remove a list element. */
	delListPref : function( list_name, pref_value ) {
		var existing = FoxtrickPrefs.getList( list_name );

		existing = existing.filter(
			function( el ) {
				if ( el != pref_value )
					return el;
			}
		);

		FoxtrickPrefs._populateList(list_name, existing);
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
			FoxtrickPrefs.do_dump = false;
			var string_regexp = new RegExp( 'user_pref\\("extensions.foxtrick.prefs.'+list_name+'.+\\);\\n','g');
			FoxtrickPrefs.pref = FoxtrickPrefs.pref.replace(string_regexp,'');
		    for (var i in values)
		        FoxtrickPrefs.setString( list_name + "." + i, values[i]);
			FoxtrickPrefs.do_dump = true;
			portsetpref.postMessage({reqtype: "save_prefs", prefs: FoxtrickPrefs.pref, reload:false});
		}
	},

	deleteValue : function(value_name){
		if (Foxtrick.BuildFor === "Gecko") {
			if (FoxtrickPrefs._pref_branch.prefHasUserValue(encodeURI(value_name)))
				FoxtrickPrefs._pref_branch.clearUserPref(encodeURI(value_name));   // reset to default
		}
		else if (Foxtrick.BuildFor === "Chrome") {
			var string_regexp = new RegExp( 'user_pref\\("extensions.foxtrick.prefs.'+value_name+'".+\\n','g');
			FoxtrickPrefs.pref = FoxtrickPrefs.pref.replace(string_regexp,'');
			portsetpref.postMessage({reqtype: "save_prefs", prefs: FoxtrickPrefs.pref, reload:false});
		}
	},


	// ---------------------- common function --------------------------------------
	setModuleEnableState : function( module_name, value ) {
		FoxtrickPrefs.setBool( "module." + module_name + ".enabled", value );
	},

	setModuleOptionsText : function( module_name, value ) {
		FoxtrickPrefs.setString( "module." + module_name, value );
	},

	getModuleValue : function( module_name ) {
		return FoxtrickPrefs.getInt( "module." + module_name + ".value" );
	},

	setModuleValue : function( module_name, value ) {
		FoxtrickPrefs.setInt( "module." + module_name + ".value", value );
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
		return  setting.search( /^YouthPlayer\./ ) == -1
			&& setting.search( "transferfilter" ) == -1
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

	SavePrefs : function (file, savePrefs, saveNotes) {
		try {
			var File = Components.classes["@mozilla.org/file/local;1"].
					 createInstance(Components.interfaces.nsILocalFile);
			File.initWithPath(file);

			var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
				.createInstance(Components.interfaces.nsIFileOutputStream);
			foStream.init(File, 0x02 | 0x08 | 0x20, 0666, 0);
			var os = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
				.createInstance(Components.interfaces.nsIConverterOutputStream);
			os.init(foStream, "UTF-8", 0, 0x0000);

			var array = FoxtrickPrefs._getElemNames("");
			array.sort();
			for(var i = 0; i < array.length; i++) { //Foxtrick.dump(array[i]);
				if ((FoxtrickPrefs.isPrefSetting(array[i]) && savePrefs)
					|| (!FoxtrickPrefs.isPrefSetting(array[i]) && saveNotes)) {

					var value=FoxtrickPrefs.getString(array[i]);
					if (value !== null)
						os.writeString('user_pref("extensions.foxtrick.prefs.'+array[i]+'","'+value.replace(/\n/g,"\\n")+'");\n');
					else {
						value = FoxtrickPrefs.getInt(array[i]);
						if (value === null)
							value=FoxtrickPrefs.getBool(array[i]);
						os.writeString('user_pref("extensions.foxtrick.prefs.'+array[i]+'",'+value+');\n');
					}
					}
				}
			os.close();
			foStream.close();
		}
		catch (e) {
			Foxtrick.alert('FoxtrickPrefs.SavePrefs '+e);
			return false;
		}
		return true;
	},

	LoadPrefs : function (file) {
		try {
			// nsifile
			var File = Components.classes["@mozilla.org/file/local;1"].
					 createInstance(Components.interfaces.nsILocalFile);
			File.initWithPath(file);
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
				//Foxtrick.dump(line+'\n');
				var key = line.match(/user_pref\("extensions\.foxtrick\.prefs\.(.+)",/)[1];
				var value=line.match(/\",(.+)\)\;/)[1];
				var strval = value.match(/\"(.+)\"/);
				if (value == "\"\"") FoxtrickPrefs.setString(key,"");
				else if (strval != null) FoxtrickPrefs.setString(key,strval[1].replace(/\\n/g,'\n'));
				else if (value == "true") FoxtrickPrefs.setBool(key,true);
				else if (value == "false") FoxtrickPrefs.setBool(key,false);
				else FoxtrickPrefs.setInt(key,value);
			} while (cont);

			fis.close();
			FoxtrickMain.init();
		}
		catch (e) {
			Foxtrick.alert('FoxtrickPrefs.LoadPrefs '+e);
			return false;
		}
		return true;
	},

	show : function() {
		gBrowser.selectedTab = gBrowser.addTab("chrome://foxtrick/content/preferences.xhtml");
	},

	disable : function() {
		var statusBarImg = document.getElementById("foxtrick-status-bar-img");
		FoxtrickPrefs.setBool("disableTemporary", !FoxtrickPrefs.getBool("disableTemporary"));
		Foxtrick.updateStatus();
		FoxtrickMain.init();
	}
};
