/**
 * preferences.js
 * Foxtrick preferences service
 * @author Mod-PaV
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickPrefs = {

	_pref_branch : null,

	init : function() {
		if (Foxtrick.BuildFor === "Gecko") {
			var prefs = Components
				.classes["@mozilla.org/preferences-service;1"]
				.getService(Components.interfaces.nsIPrefService);
			FoxtrickPrefs._pref_branch = prefs.getBranch("extensions.foxtrick.prefs.");
		}
	},

	getString : function( pref_name ) {
		var str;
		try {
			str = FoxtrickPrefs._pref_branch.getComplexValue( encodeURI(pref_name),
								 Components.interfaces.nsISupportsString ).data;
		} catch( e ) {
 				str = null;
		}
		if (str==null) {
			try {
				str = FoxtrickPrefs._pref_branch.getComplexValue( pref_name,
								Components.interfaces.nsISupportsString ).data;
 			} catch( e ) {
				str = null;
			}
		}
 		return str;
	},

	setString : function( pref_name, value ) {
		var str = Components.classes[ "@mozilla.org/supports-string;1" ].
					 createInstance( Components.interfaces.nsISupportsString );
		str.data = value;
		FoxtrickPrefs._pref_branch.setComplexValue( encodeURI(pref_name),
								Components.interfaces.nsISupportsString, str );
	},

	setInt : function( pref_name, value ) {
		FoxtrickPrefs._pref_branch.setIntPref( encodeURI(pref_name), value );
	},

	getInt : function( pref_name ) {
		var value;
		try {
			value = FoxtrickPrefs._pref_branch.getIntPref( encodeURI(pref_name) );
		} catch( e ) {
			value = null;
		}
		if (value==null) {
			try {
				value = FoxtrickPrefs._pref_branch.getIntPref( pref_name );
			} catch( e ) {
				value = null;
			}
		}
		return value;
	},

	setBool : function( pref_name, value ) {
		FoxtrickPrefs._pref_branch.setBoolPref( encodeURI(pref_name), value );
	},

	getBool : function( pref_name ) {
		// no dump in FoxtrickPrefs function !!!!!!!!
		var value;
		try {
			value = FoxtrickPrefs._pref_branch.getBoolPref( encodeURI(pref_name) );
		} catch( e ) {
			value = null;
		}
		if (value == null) {
			try {
				value = FoxtrickPrefs._pref_branch.getBoolPref( pref_name );
			} catch( e ) {
				value = null;
			}
		}
		return value;
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
			var array = null;
			if( list_name != "" )
				array = FoxtrickPrefs._pref_branch.getChildList( encodeURI(list_name + "."), {} );
			else
				array = FoxtrickPrefs._pref_branch.getChildList( "", {} );
			for (var i=0;i<array.length;++i) {array[i] = decodeURI(array[i]);}
			return array;
		} catch( e ) {
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

		FoxtrickPrefs._populateList( list_name, existing );
	},

	/** Populate list_name with given array deleting if exists */
	_populateList : function( list_name, values )
	{
		FoxtrickPrefs._pref_branch.deleteBranch( encodeURI(list_name) );
		for (var  i in values )
			FoxtrickPrefs.setString( decodeURI(list_name + "." + i), values[i] );
	},

	deleteValue : function( value_name ){
		//FoxtrickPrefs._pref_branch.deleteBranch( encodeURI(value_name) );   // juste delete
		if (FoxtrickPrefs._pref_branch.prefHasUserValue(encodeURI(value_name))) FoxtrickPrefs._pref_branch.clearUserPref( encodeURI(value_name) );   // reset to default
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
