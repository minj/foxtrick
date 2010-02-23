/**
 * preferences.js
 * Foxtrick preferences service
 * @author convincedd
 */
////////////////////////////////////////////////////////////////////////////////

var portsetpref = chrome.extension.connect({name: "ftpref-query"});
portsetpref.onMessage.addListener(function(msg) {   
	if (msg.set == 'lang_changed') {  console.log('lang_changed');
		Foxtrickl10n.properties = msg.properties;
		//	document.location.href='/MyHattrick/Preferences?configure_foxtrick=true&category=main';		
		if (msg.reload) document.location.reload();
	}
	else if (msg.set=='css_text_set') {  console.log('css_text_set');
		var begin = new Date();
		Foxtrick.addStyleSheetSnippet(document, msg.css_text);
		var end = new Date();
		var time = ( end.getSeconds() - begin.getSeconds() ) * 1000
                 + end.getMilliseconds() - begin.getMilliseconds();
		console.log("load css_text time: " + time + " ms\n");
	}
});


var FoxtrickPrefs = {

    pref:'',
    pref_default:'',
	do_dump: true,
	
    init : function() {		
    },

    setString : function( pref_name, value) {
		var string_regexp = new RegExp('"extensions.foxtrick.prefs.'+pref_name+'",.+\\);\\n');
		if (FoxtrickPrefs.pref.search(string_regexp) !=-1) 
				FoxtrickPrefs.pref = FoxtrickPrefs.pref.replace(string_regexp,'"extensions.foxtrick.prefs.'+ pref_name+'","'+value+'");\n')				
		else FoxtrickPrefs.pref += 'user_pref("extensions.foxtrick.prefs.'+pref_name+'","'+value+'");\n';	
		if ( FoxtrickPrefs.do_dump==true ) {
			portsetpref.postMessage({reqtype: "save_prefs", prefs: FoxtrickPrefs.pref, reload:false});
		}
    },

    getString : function( pref_name ) {  
	try {
		var string_regexp = new RegExp( 'user_pref\\("extensions.foxtrick.prefs.'+ pref_name+ '","(.+)"\\);\\n', "i" );
		if (typeof(FoxtrickPrefs.pref.match(string_regexp)) != 'undefined' ) {
			try {return  FoxtrickPrefs.pref.match(string_regexp)[1].replace(/chrome:\/\/foxtrick\/content\//gi,chrome.extension.getURL(''));
			} catch(e) {return '';}
		}
		if (typeof(FoxtrickPrefs.pref_default.match(string_regexp)) != 'undefined' ) {
			try { return  FoxtrickPrefs.pref_default.match(string_regexp)[1].replace(/chrome:\/\/foxtrick\/content\//gi,chrome.extension.getURL(''));
			} catch(e) {return '';}
		}
	} catch(e) {};
	Foxtrick.dump("** preference error ** "+pref_name+'\n');
	return null;
    },

    setInt : function( pref_name, value ) {
		var string_regexp = new RegExp('"extensions.foxtrick.prefs.'+pref_name+'",.+\\);\\n');
		if (FoxtrickPrefs.pref.search(string_regexp) !=-1) 
				FoxtrickPrefs.pref = FoxtrickPrefs.pref.replace(string_regexp,'"extensions.foxtrick.prefs.'+ pref_name+'",'+value+');\n')				
		else FoxtrickPrefs.pref += 'user_pref("extensions.foxtrick.prefs.'+pref_name+'",'+value+');\n';	
		if ( FoxtrickPrefs.do_dump==true ) {
			portsetpref.postMessage({reqtype: "save_prefs", prefs: FoxtrickPrefs.pref, reload:false});
		}
    },

    getInt : function( pref_name ) { 
	try {
		var string_regexp = new RegExp( 'user_pref\\("extensions.foxtrick.prefs.'+ pref_name+ '",\(\\d+\)\\);\\n', "i" );
		if (typeof(FoxtrickPrefs.pref.match(string_regexp)) != 'undefined' ) return  parseInt(FoxtrickPrefs.pref.match(string_regexp)[1]);
		if (typeof(FoxtrickPrefs.pref_default.match(string_regexp)) != 'undefined' ) return  parseInt(FoxtrickPrefs.pref_default.match(string_regexp)[1]);
	} catch(e) {};
	Foxtrick.dump("** preference error ** "+pref_name+'\n');
	return null;
    },

    setBool : function( pref_name, value ) {
		var string_regexp = new RegExp('"extensions.foxtrick.prefs.'+pref_name+'",.+\\);\\n');
		if (FoxtrickPrefs.pref.search(string_regexp) !=-1) 
				FoxtrickPrefs.pref = FoxtrickPrefs.pref.replace(string_regexp,'"extensions.foxtrick.prefs.'+ pref_name+'",'+value+');\n')				
		else FoxtrickPrefs.pref += 'user_pref("extensions.foxtrick.prefs.'+pref_name+'",'+value+');\n';	
		if ( FoxtrickPrefs.do_dump==true ) {
			portsetpref.postMessage({reqtype: "save_prefs", prefs: FoxtrickPrefs.pref, reload:false});
		}
    },

    getBool : function( pref_name ) {  // console.log(FoxtrickPrefs.pref+'\n'+pref_name+'\n');
		// no dump in this function !!!!!!!! (stupid htmldump)
	try {
	var string_regexp = new RegExp( 'user_pref\\("extensions.foxtrick.prefs.'+ pref_name+ '",(.+)\\);\\n', "i" );		
		if (typeof(FoxtrickPrefs.pref.match(string_regexp)) != 'undefined' ) return  (FoxtrickPrefs.pref.match(string_regexp)[1]=='true');
		if (typeof(FoxtrickPrefs.pref_default.match(string_regexp)) != 'undefined' ) return  (FoxtrickPrefs.pref_default.match(string_regexp)[1]=='true');
	} catch(e) {}
	return null;
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
    try {
		var names = FoxtrickPrefs._getElemNames( list_name );
		var list = new Array();
        for ( var i in names ) {
			list.push( FoxtrickPrefs.getString( names[i] ) );
		}
		return list;
	} catch(e){console.log('getList '+e+'\n');}
    },

    _getElemNames : function( list_name ) { 
	try{
		var string_regexp = new RegExp('"extensions.foxtrick.prefs.('+list_name+'.+),"','g');
		var array = FoxtrickPrefs.pref.match(string_regexp);
		if (array) {
			for (var i=0;i<array.length;++i) array[i]=array[i].replace(/"|,|extensions.foxtrick.prefs./g,'');
			return array;
		} 
		else return new Array();	
	} catch(e){console.log('_getElemNames '+list_name+' '+e+'\n');}
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
    _populateList : function( list_name, values ) {
		FoxtrickPrefs.do_dump = false;
		var string_regexp = new RegExp( 'user_pref\\("extensions.foxtrick.prefs.'+list_name+'.+\\);\\n','g');
		FoxtrickPrefs.pref = FoxtrickPrefs.pref.replace(string_regexp,'');
        for (var  i in values ) {
            FoxtrickPrefs.setString( list_name + "." + i, values[i] );
		}
		FoxtrickPrefs.do_dump = true;		
		portsetpref.postMessage({reqtype: "save_prefs", prefs: FoxtrickPrefs.pref, reload:false});
	},
    
    deleteValue : function( value_name ){
		var string_regexp = new RegExp( 'user_pref\\("extensions.foxtrick.prefs.'+value_name+'".+\\n','g');
		FoxtrickPrefs.pref = FoxtrickPrefs.pref.replace(string_regexp,'');
		portsetpref.postMessage({reqtype: "save_prefs", prefs: FoxtrickPrefs.pref, reload:false});
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

	if ( Foxtrick.confirmDialog( Foxtrickl10n.getString( 'delete_foxtrick_branches_ask' ) ) )  {
        try {
			var string_regexp = new RegExp('user_pref\\("extensions.foxtrick.prefs\\..+\\);\\n','g');
			var settingfraq  = FoxtrickPrefs.pref.match(string_regexp);				
			FoxtrickPrefs.pref = FoxtrickPrefs.pref_default;
			for (var i=0;i<settingfraq.length;++i) {
				if (!FoxtrickPrefs.isPrefSetting(settingfraq[i].replace('user_pref("extensions.foxtrick.prefs.',''))) { 
					FoxtrickPrefs.pref += settingfraq[i];
					console.log(settingfraq[i]+'\n');
				}
			}
			portsetpref.postMessage({reqtype: "save_prefs", prefs: FoxtrickPrefs.pref, reload:true});
        }
        catch (e) {
			Foxtrick.dump('confirmCleanupBranch error:'+e+'\n');
        }
    }
    return true;
}


FoxtrickPrefs.disableAll = function (ev ) { 
	if ( Foxtrick.confirmDialog(  Foxtrickl10n.getString( 'disable_all_foxtrick_moduls_ask' ) ) )  
	{
        try {
			var string_regexp = new RegExp('user_pref\\("extensions.foxtrick.prefs.module\\.(.+)\\.enabled",true\\);\\n','g');
			FoxtrickPrefs.pref = FoxtrickPrefs.pref.replace(string_regexp,'user_pref("extensions.foxtrick.prefs.module.$1.enabled",false);\n')				
			FoxtrickPrefs.setBool('module.PrefsDialogHTML.enabled',true );
			portsetpref.postMessage({reqtype: "save_prefs", prefs: FoxtrickPrefs.pref, reload:true});        
        }
        catch (e) {
			dump(e);
        }
    }
	return true;
}

FoxtrickPrefs.SavePrefs = function (ev) {
        try {
			portsetpref.postMessage({reqtype: "export_prefs", prefs: FoxtrickPrefs.pref});
		}
		catch (e) {
			Foxtrick.alert('FoxtrickPrefs.ExportPrefs '+e);
        }
    return true;
}

FoxtrickPrefs.LoadPrefsImport = function (ev) { 

	var prefs_string = document.getElementById('getpreftext').value+'\n';	

	var string_regexp = new RegExp( 'user_pref\\("extensions.foxtrick.prefs.(.+)",(.+)\\);\\n', "g" );
	var prefs_to_add = prefs_string.match(string_regexp);	
	for (var i=0;i<prefs_to_add.length;++i) {
		var pref_name = prefs_to_add[i].replace(string_regexp,'$1');
		var value = prefs_to_add[i].replace(string_regexp,'$2');
		var replace_regexp = new RegExp('user_pref\\("extensions.foxtrick.prefs.'+pref_name+'",.+\\);\\s');
		Foxtrick.dump(pref_name+' '+value+' '+FoxtrickPrefs.pref.search(replace_regexp)+'\n');
		if (FoxtrickPrefs.pref.search(replace_regexp) !=-1) {
			FoxtrickPrefs.pref = FoxtrickPrefs.pref.replace(replace_regexp,'user_pref("extensions.foxtrick.prefs.'+ pref_name+'",'+value+');\n')
		}
		else FoxtrickPrefs.pref += 'user_pref("extensions.foxtrick.prefs.'+pref_name+'",'+value+');\n';	
	}
	
	portsetpref.postMessage({reqtype: "save_prefs", prefs: FoxtrickPrefs.pref, reload:true});
	
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
		
		textarea.value="Open your preference file in a text editor, copy it here and click Import. Existing settings will be replaced, new ones added.";
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
	if (msg.set=='setlang') { console.log('setlang');
		Foxtrickl10n.properties = msg.properties; 
		if ( msg.from == 'readpref') { 
			FoxtrickReadHtPrefs.ShowChanged(document);
	    }
	}
});
