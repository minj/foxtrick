/**
 * preferences.js
 * Foxtrick preferences service
 * @author convincedd
 */
////////////////////////////////////////////////////////////////////////////////

var portsetpref = chrome.extension.connect({name: "ftpref-query"});
portsetpref.onMessage.addListener(function(msg) {   
	if (msg.pref_changed == 'true') {
		FoxtrickPrefs.pref = msg.prefs;
	    Foxtrickl10n.properties = msg.properties;
		FoxtrickPrefs.pref_save_dump = '';
		//document.location.href='/MyHattrick/Preferences?configure_foxtrick=true&category=main';
		document.location.href = document.location.pathname;
	}
});


var FoxtrickPrefs = {

    pref:'',
    pref_default:'',
	pref_save_dump:'',
	
    init : function() {		
    },

    setString : function( pref_name, value ) {
		FoxtrickPrefs.pref_save_dump += 'user_pref("extensions.foxtrick.prefs.'+pref_name+'","'+value+'");\n';			
    },

    getString : function( pref_name ) {  
		var string_regexp = new RegExp( 'user_pref\\("extensions.foxtrick.prefs.'+ pref_name+ '","(.+)"\\);', "i" );
		if (typeof(FoxtrickPrefs.pref.match(string_regexp)) != 'undefined' ) {
			try {return  FoxtrickPrefs.pref.match(string_regexp)[1].replace(/chrome:\/\/foxtrick\/content\//gi,'chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/');
			} catch(e) {return '';}
		}
		if (typeof(FoxtrickPrefs.pref_default.match(string_regexp)) != 'undefined' ) {
			try { return  FoxtrickPrefs.pref_default.match(string_regexp)[1].replace(/chrome:\/\/foxtrick\/content\//gi,'chrome-extension://kfdfmelkohmkpmpgcbbhpbhgjlkhnepg/');
			} catch(e) {return '';}
		}
		Foxtrick.dump("** preference error ** "+pref_name+'\n');
		return ' ';
    },

    setInt : function( pref_name, value ) {
		FoxtrickPrefs.pref_save_dump += 'user_pref("extensions.foxtrick.prefs.'+pref_name+'",'+value+');\n';			
    },

    getInt : function( pref_name ) { 
		var string_regexp = new RegExp( 'user_pref\\("extensions.foxtrick.prefs.'+ pref_name+ '",\(\\d+\)\\);', "i" );
		if (typeof(FoxtrickPrefs.pref.match(string_regexp)) != 'undefined' ) return  parseInt(FoxtrickPrefs.pref.match(string_regexp)[1]);
		if (typeof(FoxtrickPrefs.pref_default.match(string_regexp)) != 'undefined' ) return  parseInt(FoxtrickPrefs.pref_default.match(string_regexp)[1]);
		Foxtrick.dump("** preference error ** "+pref_name+'\n');
		return 0;
    },

    setBool : function( pref_name, value ) {
		FoxtrickPrefs.pref_save_dump += 'user_pref("extensions.foxtrick.prefs.'+pref_name+'",'+value+');\n';			
    },

    getBool : function( pref_name ) {  
		// no dump in this function !!!!!!!! (stupid htmldump)
		var string_regexp = new RegExp( 'user_pref\\("extensions.foxtrick.prefs.'+ pref_name+ '",(.+)\\);', "i" );		
		if (typeof(FoxtrickPrefs.pref.match(string_regexp)) != 'undefined' ) return  (FoxtrickPrefs.pref.match(string_regexp)[1]=='true');
		if (typeof(FoxtrickPrefs.pref_default.match(string_regexp)) != 'undefined' ) return  (FoxtrickPrefs.pref_default.match(string_regexp)[1]=='true');
		return false;
    },
	

    /** Add a new preference "pref_name" of under "list_name".
     * Creates the list if not present.
     * Returns true if added (false if empty or already on the list).
     */
    addPrefToList : function( list_name, pref_value ) {
    },

    getList : function( list_name ) {
    },

    _getElemNames : function( list_name ) {
		return new Array();
    },

    /** Remove a list element. */
    delListPref : function( list_name, pref_value ) {
    },

    /** Populate list_name with given array deleting if exists */
    _populateList : function( list_name, values ) {
    },
    
    deleteValue : function( value_name ){
		// redo!  delete localStorage[value_name];
    },	
};


// ---------------------- common function --------------------------------------

FoxtrickPrefs.setModuleEnableState = function( module_name, value ) {
	  FoxtrickPrefs.setBool( "module." + module_name + ".enabled", value );
}

FoxtrickPrefs.setModuleOptionsText = function( module_name, value ) {
	  FoxtrickPrefs.setString( "module." + module_name, value );
}

FoxtrickPrefs.setModuleValue = function( module_name, value ) {
    FoxtrickPrefs.setInt( "module." + module_name + ".value", value );
}

FoxtrickPrefs.getModuleDescription = function( module_name ) {
    var name = "foxtrick." + module_name + ".desc";
    if ( Foxtrickl10n.isStringAvailable( name ) )
        return Foxtrickl10n.getString( name );
    else {
        //dump( "Foxtrick string MODULE " + module_name + " missing!\n");
        return "No description";
    }
}

FoxtrickPrefs.getModuleElementDescription = function( module_name, option ) {
    var name = "foxtrick." + module_name + "." + option + ".desc";
    if ( Foxtrickl10n.isStringAvailable( name ) )
        return Foxtrickl10n.getString( name );
    else {
        //dump( "Foxtrick string ELEMENT " + name + " missing!\n");
        //return "No description";
        return option;
    }
}


FoxtrickPrefs.isPrefSetting = function ( setting) {
	return  setting.search( /^YouthPlayer\./ ) == -1
			&& setting.search( "transferfilter" ) == -1
			&& setting.search( "post_templates" ) == -1
			&& setting.search( "mail_templates" ) == -1
			&& (setting.search( "LinksCustom" ) == -1 || setting.search( "LinksCustom.enabled" ) != -1) ;
}

FoxtrickPrefs.confirmCleanupBranch = function ( ev ) {  

	//if ( Foxtrick.confirmDialog( Foxtrickl10n.getString( 'delete_foxtrick_branches_ask' ) ) )  {
        try {
			// redo!  for (var i in localStorage) delete localStorage[i];
			document.location.href='/MyHattrick/Preferences?configure_foxtrick=true&category=main';
        }
        catch (e) {
			Foxtrick.dump('confirmCleanupBranch error:'+e+'\n');
        }
    //}
    return true;
}


FoxtrickPrefs.disableAll = function (ev ) { 
	//if ( Foxtrick.confirmDialog(  Foxtrickl10n.getString( 'disable_all_foxtrick_moduls_ask' ) ) )  
	{
        try {
			/* redo! for (var i in localStorage) {
				if(i.search( /enabled$/ ) != -1) { Foxtrick.dump(i.replace(/extensions.foxtrick.prefs./,''))
						FoxtrickPrefs.setBool( i.replace(/extensions.foxtrick.prefs./,''), false );
				}
			} */
			FoxtrickPrefs.setBool('module.PrefsDialogHTML.enabled',true );
			document.location.href='/MyHattrick/Preferences?configure_foxtrick=true&category=main';
        }
        catch (e) {
			dump(e);
        }
    }
	return true;
}

FoxtrickPrefs.SavePrefs = function (ev) {
        try {
			if (ev) {window = ev.target.ownerDocument.defaultView; doc = ev.target.ownerDocument;}
			else doc=document;
			
			var array = new Array();
			/* redo! for(var i in localStorage) {  
				var pref = i.replace('extensions.foxtrick.prefs.','');
				if ((FoxtrickPrefs.isPrefSetting(pref) && doc.getElementById("saveprefsid").checked)
					|| (!FoxtrickPrefs.isPrefSetting(pref) && doc.getElementById("savenotesid").checked)) {
					//console.log(i,localStorage[i]);
					var value=FoxtrickPrefs.getString(pref);
					if (value!=null) array.push('user_pref("extensions.foxtrick.prefs.'+pref+'","'+value.replace(/\n/g,"\\n")+'");\n');
					else { value=FoxtrickPrefs.getInt(pref);
						if (value==null) value=FoxtrickPrefs.getBool(pref);
						array.push('user_pref("extensions.foxtrick.prefs.'+pref+'",'+value+');\n');
						}
					//Foxtrick.dump(' : save\n');
					}
				//else Foxtrick.dump(' : dont save\n');
				}
			array.sort();
			var writeString='';
			for(var i = 0; i < array.length; i++) { writeString += array[i]+'<br>';}			
			
			newwin = window.open("","");
			newwin.document.write('<!DOCTYPE html><html><head><title>Export preferences</title></head><body>// Copy content to a text file and save it<br>'+writeString+'</body></html>');
			if(!ev) close();  */
			
			
			newwin = window.open("","");
			newwin.document.write('<!DOCTYPE html><html><head><title>Export preferences</title></head><body>// Copy content to a text file and save it<br>'+FoxtrickPrefs.pref.replace(/\n/gi,'<br>')+'</body></html>');
			
		}
		catch (e) {
			Foxtrick.alert(e);
        }
    return true;
}

FoxtrickPrefs.LoadPrefsImport = function (ev) { 

	var textarea = document.getElementById('getpreftext');
	FoxtrickPrefs.pref_save_dump += textarea.value;
	portsetpref.postMessage({reqtype: "dump_prefs"});
		
	var tr = document.getElementById('buttonLoadPrefs').parentNode.parentNode;
	tr.style.display='table-row';
	tr.parentNode.removeChild(tr.nextSibling);
}
 
FoxtrickPrefs.LoadPrefs = function (ev) {
        try {						
		
		var tr_edit=document.createElement('tr');		
		var input=document.createElement('input');
		input.type="button";
		input.value="Import";
		input.addEventListener('click',FoxtrickPrefs.LoadPrefsImport,false);
		var td=document.createElement('td');		
		td.appendChild(input);
		tr_edit.appendChild(td);
		var textarea=document.createElement('textarea');
		textarea.id="getpreftext";
		textarea.setAttribute('style',"width:50px width:80%");
		textarea.rows='8';
		textarea.cols='55';
		
		textarea.value="Open your preference file in a text editor, copy all here and click Import. You need to save your preferences afterwards or values will be back to default!";
		var td=document.createElement('td');		
		td.appendChild(textarea);
		tr_edit.appendChild(td);
		var tr = document.getElementById('buttonLoadPrefs').parentNode.parentNode;
		tr.parentNode.insertBefore(tr_edit,tr.nextSibling);
		tr.style.display='none';
		}
		catch (e) {
			Foxtrick.alert(e);
        }
    return true;
}

FoxtrickPrefs.portsetlang = chrome.extension.connect({name: "setpref"});
FoxtrickPrefs.portsetlang.onMessage.addListener(function(msg) { 
      Foxtrickl10n.properties = msg.properties; 
	  //Foxtrick.dump('got '+Foxtrickl10n.properties.substring(0,20));
	  //alert('got: '+Foxtrickl10n.properties.substring(0,20));
	  if ( msg.from == 'readpref') {
		FoxtrickReadHtPrefs.ShowChanged(document);
	  }
});
