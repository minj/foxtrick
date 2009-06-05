

/**
 * Foxtrick - an extension for hattrick.org
 * Contact us: by HT-mail to Mod-PaV on hattrick.org
 */
////////////////////////////////////////////////////////////////////////////////
/** Modules that are to be called every time any hattrick page loads.
 * Should implement a run() method.
 * DON'T EDIT THIS, use registerAllPagesHandler() instead.
 */
Foxtrick.run_every_page = [];

/** Modules that are to be called on specific hattrick page loads.
 * Should implement a run() method.
 * DON'T EDIT THIS, use registerPageHandler() instead.
 */
Foxtrick.run_on_page = [];

/*Modules that may! be called on specific hattrick page loads independent one being enanbled or not.*/
Foxtrick.may_run_on_page = [];

/* temp array  which stored pages that run on currently dispalyed page */
Foxtrick.run_on_cur_page = [];

/** Core Foxtrick modules, always used.
 * Don't add here unless you have a good reason to. */
Foxtrick.core_modules = [ FoxtrickPrefs,
                          Foxtrickl10n ];
						
/** Global news ticker variable
 */
Foxtrick.news = [];

// remove before release
Foxtrick.globals=[];
for (Foxtrick.global in this){Foxtrick.globals.push(Foxtrick.global);} //Foxtrick.globals.sort();

////////////////////////////////////////////////////////////////////////////////
var FoxtrickMain = {
	new_start:true,
	isStandard:true,
	isRTL:false,
	vars:null,
	
    init : function() { 
		// remove before release
		if (!Foxtrick.numglobals) {
			for ( var i=0;i<Foxtrick.globals.length;++i ) dump('global: ' +Foxtrick.globals[i]+'\n');
			Foxtrick.numglobals=Foxtrick.globals.length;
		}
		else {
			for ( var i=Foxtrick.numglobals;i<Foxtrick.globals.length;++i ) 
				if (Foxtrick.globals[i]!='QueryInterface') dump('undeclared local global variable: ' +Foxtrick.globals[i]+'\n');
		}
        

		// init core modules
        for ( var i in Foxtrick.core_modules ) {
            Foxtrick.core_modules[i].init();
        }
						
		// create handler arrays for each recognized page
		for ( var i in Foxtrick.ht_pages ) {
			Foxtrick.run_on_page[i] = new Array();
			Foxtrick.may_run_on_page[i] = new Array();
		}
			
		// init all modules
		for (var  i in Foxtrick.modules ) {
			var module = Foxtrick.modules[i];
			// if module has an init() function and is enabled
			if ( module.MODULE_NAME
                   && Foxtrick.isModuleEnabled( module ) )
			{
				if (module.init)
				{
					try {
						module.init();
						//dump( "Foxtrick enabled module: " + module.MODULE_NAME + "\n");
					} catch (e) {
						dump( "Foxtrick module " + module.MODULE_NAME + " init() exception: " + "\n  " + e + "\n");
						Components.utils.reportError(e);
					}
				}
				else {
					//dump( "Foxtrick disabled module: " + module.MODULE_NAME + "\n" );
				}
			}
			
			if ( module.MODULE_NAME && module.PAGES) {
				Foxtrick.registerModulePages(module);
            }
		}
		if (Foxtrick && Foxtrick.statusbarDeactivate) Foxtrick.statusbarDeactivate.setAttribute("checked", FoxtrickPrefs.getBool("disableTemporary"));						
		
		// reload skins
		FoxtrickSkinPlugin.load( null);
		FoxtrickMain.new_start = true;		
	},
   
    registerOnPageLoad : function(document) {
		// init menu titles
		var statusbarMenu = document.getElementById(
			"foxtrick_statusbar_config_menu" );
		statusbarMenu.setAttribute( "label", Foxtrickl10n.getString( 
			"foxtrick.menu.configurefoxtrick") );
		var statusbarReload = document.getElementById(
			"foxtrick_statusbar_reload" );
		statusbarReload.setAttribute( "label", Foxtrickl10n.getString( 
			"foxtrick.menu.reloadfoxtrick") );
		var statusbarDeactivate = document.getElementById(
			"foxtrick_statusbar_deactivate" );
		statusbarDeactivate.setAttribute( "label", Foxtrickl10n.getString(
			"foxtrick.prefs.disableTemporaryLabel") );
		statusbarDeactivate.setAttribute("checked", FoxtrickPrefs.getBool("disableTemporary"));
		Foxtrick.statusbarDeactivate=statusbarDeactivate;
		
		var popupMenu = document.getElementById( "foxtrick_popup_menu");
		popupMenu.setAttribute( "label", "Foxtrick-"+Foxtrickl10n.getString( "foxtrick.CopyPostID") );
		popupMenu.setAttribute( "hidden", true); 
		Foxtrick.popupMenu = popupMenu;
		
		
		var toolsMenu = document.getElementById( "foxtrick-config-menu" );
		toolsMenu.setAttribute( "label", Foxtrickl10n.getString( 
			"foxtrick.menu.configurefoxtrick") );
		
		var appcontent = document.getElementById( "appcontent" );
        if ( appcontent) {
			// listen to page loads
			//FoxtrickMain.onPageLoad.appcontent = appcontent;
			appcontent.addEventListener( "DOMContentLoaded", this.onPageLoad,
                                         true );
		}								 
    },
	
	onPageChange : function( ev ) {
		var doc = ev.originalTarget.ownerDocument;
		if ( doc.nodeName != "#document" )
            return;
		var content = doc.getElementById("content");
		// remove event listener while Foxtrick executes
		content.removeEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true );
		var begin = new Date();
		FoxtrickMain.change( doc );
		var end = new Date();
        var time = ( end.getSeconds() - begin.getSeconds() ) * 1000
                 + end.getMilliseconds() - begin.getMilliseconds();
        // dump( "Foxtrick run time: " + time + " ms\n" );
		// re-add event listener
		content.addEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true );
    },
	
    onPageLoad : function( ev ) {
		var doc = ev.originalTarget;
		if ( doc.nodeName != "#document" )
            return;

        
        // hattrick URL check and run if on HT
        if ( Foxtrick.getHref( doc ).search( FoxtrickPrefs.getString( "HTURL" ) ) > -1 )
        {
            var begin = new Date();

            FoxtrickMain.run( doc );

            var end = new Date();
            var time = ( end.getSeconds() - begin.getSeconds() ) * 1000
                     + end.getMilliseconds() - begin.getMilliseconds();
            dump( "Foxtrick run time: " + time + " ms\n" );
			// listen to page content changes
			var content = doc.getElementById("content");
			if( content ) {
				content.addEventListener("DOMSubtreeModified", FoxtrickMain.onPageChange, true );
			}
	    }
    },

	
    // main entry run on every ht page load
    run : function( doc ) {
	try {  	
		// don't execute if on stage server and user doesn't want Foxtrick to be executed there
		// or temporary disable
		var stage_regexp = /http:\/\/stage\.hattrick\.org/i;
		if( (!( FoxtrickPrefs.getBool("disableOnStage") &&
			Foxtrick.getHref( doc).search( stage_regexp ) > -1))
			&& ( !FoxtrickPrefs.getBool("disableTemporary")) ) {
		    // check newstart or design change and reload modul css if needed
			if (FoxtrickMain.new_start) { 
				FoxtrickMain.isStandard = Foxtrick.isStandardLayout(doc);
				FoxtrickMain.isRTL = Foxtrick.isRTLLayout(doc); 
				Foxtrick.reload_module_css(doc);
				FoxtrickMain.new_start = false;				
			}
			else {
				var curr_isStandard = Foxtrick.isStandardLayout(doc);
				var curr_isRTL = Foxtrick.isRTLLayout(doc); 
				if (curr_isStandard != FoxtrickMain.isStandard || curr_isRTL != FoxtrickMain.isRTL)
				{				
					FoxtrickMain.isStandard = curr_isStandard;
					FoxtrickMain.isRTL = curr_isRTL; 
					Foxtrick.reload_module_css(doc);  
				}
			}

			// empty
			Foxtrick.run_on_cur_page.splice(0,Foxtrick.run_on_cur_page.length);

			// call the modules that want to be run() on every hattrick page
			Foxtrick.run_every_page.forEach(
				function( fn ) {
					try {
						fn.run( doc );
						//Foxtrick.run_on_cur_page.push({'page':'','module':fn});								
					} catch (e) {
						dump ( "Foxtrick module " + fn.MODULE_NAME + " run() exception: \n  " + e + "\n" );
						Components.utils.reportError(e);
					}
				} );

			// call all modules that registered as page listeners
			// if their page is loaded
        
			// find current page index/name and run all handlers for this page
			for ( var i in Foxtrick.ht_pages ) {
				if ( Foxtrick.isPage( Foxtrick.ht_pages[i], doc ) ) {
					// on a specific page, run all handlers
					Foxtrick.run_on_page[i].forEach(
						function( fn ) {
							try {
								dump ( "Foxtrick module " + fn.MODULE_NAME + " run() at page " + i + "\n  " );								
								fn.run( i, doc );
							} catch (e) {
								dump ( "Foxtrick module " + fn.MODULE_NAME + " run() exception at page " + i + "\n  " + e + "\n" );
								Components.utils.reportError(e);
							}
						} );
					Foxtrick.may_run_on_page[i].forEach(
						function( fn ) {
								//dump ( "Foxtrick module " + fn.MODULE_NAME + " may run() at page " + i + "\n  " );								
								Foxtrick.run_on_cur_page.push({'page':i,'module':fn});
								
						} );							
				}
			}
			for ( var j=0; j<Foxtrick.run_on_cur_page.length; ++j ) {
				dump ( "may run " + Foxtrick.run_on_cur_page[j].module.MODULE_NAME + " : page " + Foxtrick.run_on_cur_page[j].page + "\n  " );																
			}

			FoxtrickOnPagePrefs.run(doc, Foxtrick.run_on_cur_page);
			// context menue
			doc.addEventListener('contextmenu',FoxtrickContextMenueCopyId.onContext,false);   
			
		}
		else { 
			// potenial disable cleanup
			var stage_regexp = /http:\/\/stage\.hattrick\.org/i;
			if( FoxtrickMain.new_start && ((( FoxtrickPrefs.getBool("disableOnStage") &&
				Foxtrick.getHref( doc).search( stage_regexp ) != -1))
				|| ( FoxtrickPrefs.getBool("disableTemporary"))) ) { 			
				
				FoxtrickMain.isStandard = Foxtrick.isStandardLayout(doc);
				FoxtrickMain.isRTL = Foxtrick.isRTLLayout(doc); 
				FoxtrickMain.new_start = false;				
				Foxtrick.unload_module_css();
			}
		}
	} catch(e) { dump('Foxtrick.run: '+e+'\n'); }
    },
	
	// function run on every ht page change
	change : function( doc ) {
		var stage_regexp = /http:\/\/stage\.hattrick\.org/i;
		if( (!( FoxtrickPrefs.getBool("disableOnStage") &&
			Foxtrick.getHref( doc).search( stage_regexp ) > -1))
			&& ( !FoxtrickPrefs.getBool("disableTemporary")) ) {
			
			// call the modules that want to be run() on every hattrick page
			Foxtrick.run_every_page.forEach(
				function( fn ) {
					try {
						fn.change( doc );
					} catch (e) {
						dump ( "Foxtrick module " + fn.MODULE_NAME + " change() exception: \n  " + e + "\n" );
						Components.utils.reportError(e);
					}
				} );

			// call all modules that registered as page listeners
			// if their page is loaded
        
			// find current page index/name and run all handlers for this page
			for ( var i in Foxtrick.ht_pages ) {
				if ( Foxtrick.isPage( Foxtrick.ht_pages[i], doc ) ) {
					// on a specific page, run all handlers
					Foxtrick.run_on_page[i].forEach(
						function( fn ) {
							try {
								fn.change( i, doc );
							} catch (e) {
								dump ( "Foxtrick module " + fn.MODULE_NAME + " change() exception at page " + i + "\n  " + e + "\n" );
								Components.utils.reportError(e);
							}
						} );
				}
			}
        }
		else dump('Foxtrick modules deactivated\n');
	}

};

Foxtrick.isPage = function( page, doc ) {
	var htpage_regexp = new RegExp( page, "i" );
	return Foxtrick.getHref( doc ).search( htpage_regexp ) > -1;
}

Foxtrick.getHref = function( doc ) {
    return doc.location.href;
}


Foxtrick.registerModulePages = function( module) {
try {
    // if is enabled in preferences and has a run() function
    if ( module.run ) {
		for (var i=0;i<module.PAGES.length;++i) {
			Foxtrick.may_run_on_page[module.PAGES[i]].push( module );
			//dump(module.PAGES[i]+'\n');
			if (Foxtrick.isModuleEnabled( module ) )
				Foxtrick.run_on_page[module.PAGES[i]].push( module );
		}
    }
} catch(e){dump('registerModulePages: '+e+'\n');}
}


/**
 * Register with this method to have your module's run()
 * function called on specific pages (names can be found
 * in Foxtrick.ht_pages in module.js.
 * Your function should accept two arguments:
 * the page name (from ht_pages) and current document.
 */
Foxtrick.registerPageHandler = function( page, who ) {

    // if is enabled in preferences and has a run() function
    if ( who.run ) {
        Foxtrick.run_on_page[page].push( who );
    }
}

/**
 * Register with this method to have your module's run() function
 * called every time any hattrick page is loaded.
 * Please use registerPageHandler() if you need only to run
 * on specific pages.
 * Your run() function will be called with only one argument,
 * the current document.
 */
Foxtrick.registerAllPagesHandler = function( who ) { 
    if ( who.run )
    {
        Foxtrick.run_every_page.push( who );
    }
}

/** Remove any occurences of tags ( "<something>" ) from text */
Foxtrick.stripHTML = function( text ) {
    return text.replace( /(<([^>]+)>)/ig,"");
}

/** Insert text in given textarea at the current position of the cursor */
Foxtrick.insertAtCursor = function( textarea, text ) {
    textarea.value = textarea.value.substring( 0, textarea.selectionStart )
                   + text
                   + textarea.value.substring( textarea.selectionEnd, textarea.value.length );
}

Foxtrick.addStyleSheet = function( doc, css ) {
	var path = "head[1]";
	var head = doc.evaluate(path,doc.documentElement,null,doc.DOCUMENT_NODE,null).singleNodeValue;
	
	var link = doc.createElement("link");
	link.setAttribute("rel", "stylesheet");
	link.setAttribute("type", "text/css");
	link.setAttribute("media", "all");
	link.setAttribute("href", css);
	head.appendChild(link);
}

// attaches a JavaScript file to the page
Foxtrick.addJavaScript = function( doc, js ) {
	var path = "head[1]";
	var head = doc.evaluate(path,doc.documentElement,null,doc.DOCUMENT_NODE,null).singleNodeValue;
	
  var script = doc.createElement("script");
  script.setAttribute("language", "JavaScript");
  script.setAttribute("src", js);
  head.appendChild(script);
}

// attaches a JavaScript snippet to the page
Foxtrick.addJavaScriptSnippet = function( doc, code ) {
  var path = "head[1]";
	var head = doc.evaluate(path,doc.documentElement,null,doc.DOCUMENT_NODE,null).singleNodeValue;
    
  var script = doc.createElement("script");
  script.setAttribute("language", "JavaScript");
  script.innerHTML=code;
  head.appendChild(script);
}

Foxtrick.confirmDialog = function(msg) {
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);
    return promptService.confirm(null, null, msg);
}

Foxtrick.alert = function( msg ) {
    var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);
    return promptService.alert(null, null, msg);
}

Foxtrick.trim = function (text) {
  return text.replace(/^\s+/, "").replace(/\s+$/, '').replace(/&nbsp;/g,"");
}

Foxtrick.trimnum = function (text) {
  //return text.replace(/[\D\s]/g, '');
  text +='';
  if (text == null || text.length == 0) return 0;
  return text.replace(/&nbsp;/g,"").replace(/[\s]/g, '').match(/-\d+|\d+/);
}

Foxtrick.substr_count = function ( haystack, needle, offset, length ) {
    // http://kevin.vanzonneveld.net/techblog/article/javascript_equivalent_for_phps_substr_count/
    // Returns count of needle in a haystack.
    var pos = 0, cnt = 0;
    haystack += '';
    needle += '';
    if(isNaN(offset)) offset = 0;
    if(isNaN(length)) length = 0;
    offset--;
    while( (offset = haystack.indexOf(needle, offset+1)) != -1 ){
        if(length > 0 && (offset+needle.length) > length){
            return false;
        } else{
            cnt++;
        }
    }
    return cnt;
}

Foxtrick.isModuleEnabled = function( module ) {
    try {
        var val = FoxtrickPrefs.getBool( "module." + module.MODULE_NAME + ".enabled" );
        return (val != null) ? val : module.DEFAULT_ENABLED; 
    } catch( e ) {
        return false;
    }
}

Foxtrick.isModuleFeatureEnabled = function( module , feature ) {
    try {
		var val = FoxtrickPrefs.getBool( "module." + module.MODULE_NAME + "." + feature + ".enabled" );
        return (val != null) ? val : module.DEFAULT_ENABLED;
    } catch( e ) {
        return false;
    }
}

Foxtrick.getModuleValue = function( module ) {
    try {
        var val = FoxtrickPrefs.getInt( "module." + module.MODULE_NAME + ".value" );
        return (val != null) ? val : 0; 
    } catch( e ) {
        return false;
    }
}

Foxtrick.LOG = function (msg) {
        var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
        consoleService.logStringMessage(msg);
}



Foxtrick.selectFileSave = function (parentWindow) {
    try {
    	var fp = Components.classes['@mozilla.org/filepicker;1'].createInstance(Components.interfaces.nsIFilePicker);
    	fp.init(parentWindow, "", fp.modeSave);
    	var ret=fp.show();
		if ( ret == fp.returnOK || ret==fp.returnReplace ) { 
    		return fp.file.path;
    	}
    } catch (e) {
        dump('selectFileSave'+e);
    }
	return null;
}

Foxtrick.selectFile = function (parentWindow) {
    try {
    	var fp = Components.classes['@mozilla.org/filepicker;1'].createInstance(Components.interfaces.nsIFilePicker);
    	fp.init(parentWindow, "", fp.modeOpen);
    	if (fp.show() == fp.returnOK ) {
    		return fp.file.path;
    	}
    } catch (e) {
        dump('selectFile'+e);
    }
	return null;
}

Foxtrick.playSound = function(url) {
  try {
    var soundService = Components.classes["@mozilla.org/sound;1"].getService(Components.interfaces.nsISound);
    var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    soundService.play(ioService.newURI(url, null, null));
  } catch (e) {
    dump('playSound'+e);
  }
}


Foxtrick.reload_module_css = function(doc) {  	dump('reload permanents css\n');
			// check permanant css
			var isStandard = Foxtrick.isStandardLayout(doc);
			var isRTL = Foxtrick.isRTLLayout(doc); 
			for ( var i in Foxtrick.modules ) {
				var module = Foxtrick.modules[i];
				// if module has an css) function and is enabled
				if ( module.MODULE_NAME ) {
					if ( module.OLD_CSS && module.OLD_CSS!="") { 
						Foxtrick.unload_css_permanent ( module.OLD_CSS ); 
					}
					if ( module.CSS_SIMPLE && module.CSS_SIMPLE!="") {
						if ( Foxtrick.isModuleEnabled( module ) && !isStandard)  { 
							if (!isRTL || !module.CSS_SIMPLE_RTL) {
								Foxtrick.load_css_permanent ( module.CSS_SIMPLE ); 
								if (module.CSS_SIMPLE_RTL) Foxtrick.unload_css_permanent ( module.CSS_SIMPLE_RTL );
							}	 
							else {
								Foxtrick.load_css_permanent ( module.CSS_SIMPLE_RTL ) ; 
								Foxtrick.unload_css_permanent ( module.CSS_SIMPLE );
								}													
						}
						else { 
							Foxtrick.unload_css_permanent ( module.CSS_SIMPLE ) ;
							if (module.CSS_SIMPLE_RTL) Foxtrick.unload_css_permanent ( module.CSS_SIMPLE_RTL ) ;
						}							
					}
					if ( module.CSS && module.CSS!="") { 
						if ( Foxtrick.isModuleEnabled( module ) && ( !module.CSS_SIMPLE || isStandard ) ) {
							if (!isRTL || !module.CSS_RTL){ 
								Foxtrick.load_css_permanent ( module.CSS) ; 
								if (module.CSS_RTL) Foxtrick.unload_css_permanent ( module.CSS_RTL); 
							}
							else {
								Foxtrick.load_css_permanent ( module.CSS_RTL); 
								Foxtrick.unload_css_permanent ( module.CSS); 
							}							
						}
						else {  
							Foxtrick.unload_css_permanent ( module.CSS) ;  
							if (module.CSS_RTL&& module.CSS!="") Foxtrick.unload_css_permanent ( module.CSS_RTL) ;
						}             
					}
					if (module.OPTIONS_CSS) { 
						for (var k=0; k<module.OPTIONS_CSS.length;++k ) {
							if ( Foxtrick.isModuleEnabled( module ) && Foxtrick.isModuleFeatureEnabled( module, module.OPTIONS[k]))
							{	if (module.OPTIONS_CSS[k] != "" && (!isRTL || !module.OPTIONS_CSS_RTL)) {
							 		if (module.OPTIONS_CSS_RTL && module.OPTIONS_CSS_RTL[k] != "") 
											Foxtrick.unload_css_permanent ( module.OPTIONS_CSS_RTL[k]) ; 	
									Foxtrick.load_css_permanent ( module.OPTIONS_CSS[k] ) ;  
								}
								else {
									if (module.OPTIONS_CSS[k] != "") 
											Foxtrick.unload_css_permanent ( module.OPTIONS_CSS[k] ) ; 	
									if (isRTL) {
										if (module.OPTIONS_CSS_RTL && module.OPTIONS_CSS_RTL[k] != "") 
											Foxtrick.load_css_permanent ( module.OPTIONS_CSS_RTL[k] ) ; 
									}
									else {
										if (module.OPTIONS_CSS_RTL && module.OPTIONS_CSS_RTL[k] != "") 
											Foxtrick.unload_css_permanent ( module.OPTIONS_CSS_RTL[k] ) ; 
									}
								}
							}
							else {
								if (module.OPTIONS_CSS[k] != "") 
										Foxtrick.unload_css_permanent ( module.OPTIONS_CSS[k]) ; 	
								if (module.OPTIONS_CSS_RTL && module.OPTIONS_CSS_RTL[k] != "")  
										Foxtrick.unload_css_permanent ( module.OPTIONS_CSS_RTL[k]) ; 	
							}
						}
					}
				}
			}
}				

Foxtrick.unload_module_css = function() { dump('unload permanents css\n');
			for ( var i in Foxtrick.modules ) {
				var module = Foxtrick.modules[i];
				if ( module.MODULE_NAME ) {
					if ( module.OLD_CSS && module.OLD_CSS!="") 
						Foxtrick.unload_css_permanent ( module.OLD_CSS ); 
					if ( module.CSS_SIMPLE ) 
						Foxtrick.unload_css_permanent ( module.CSS_SIMPLE );
					if (module.CSS_SIMPLE_RTL) 
						Foxtrick.unload_css_permanent ( module.CSS_SIMPLE_RTL ) ;
					if ( module.CSS )  
						 Foxtrick.unload_css_permanent ( module.CSS); 
					if (module.CSS_RTL) 
						Foxtrick.unload_css_permanent ( module.CSS_RTL);
					if (module.OPTIONS_CSS) 
						for (var k=0; k<module.OPTIONS_CSS.length; ++k ) 
							if (module.OPTIONS_CSS[k] != "") Foxtrick.unload_css_permanent ( module.OPTIONS_CSS[k] ) ; 							
					if (module.OPTIONS_CSS_RTL) 
						for (var k=0; k<module.OPTIONS_CSS_RTL.length; ++k ) 
							if (module.OPTIONS_CSS_RTL[k] != "") Foxtrick.unload_css_permanent ( module.OPTIONS_CSS_RTL[k] ) ; 							
				}
			}
}				


Foxtrick.reload_css_permanent = function( css ) {  	
	Foxtrick.unload_css_permanent ( css ) ; 	
	Foxtrick.load_css_permanent ( css ) ;  	
}

Foxtrick.unload_css_permanent = function( css ) {  	
        try { 
			try {
				var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Components.interfaces.nsIStyleSheetService);
				var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
				var uri = ios.newURI(css, null, null);
            } catch(e) {return;} 
			// try unload
			if (sss.sheetRegistered(uri, sss.USER_SHEET)) {
					sss.unregisterSheet(uri, sss.USER_SHEET);
					dump('unload '+css+'\n');
			}
        } catch(e) {
            dump ('> load_css_permanent ' + e + '\n');
        }
}
            
Foxtrick.load_css_permanent = function( css) {  	
		try { 
			try {
				var sss = Components.classes["@mozilla.org/content/style-sheet-service;1"].getService(Components.interfaces.nsIStyleSheetService);
				var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
				var uri = ios.newURI(css, null, null);
            } catch(e) {return;} 
			// load		
			if (!sss.sheetRegistered(uri, sss.USER_SHEET)) {
						sss.loadAndRegisterSheet(uri, sss.USER_SHEET);	
						dump('load '+css+'\n');
			}
		} 
        catch(e) {
            dump ('> load_css_permanent ' + e + '\n');
        }
 }

Foxtrick.hasElement = function( doc, id ) {
	if( doc.getElementById( id ) ) {
		return true;
	}
	return false;
}

/* Foxtrick.addBoxToSidebar
* Parameters:
* doc - the document the box needs to be added to
* newBoxHeader - the title of the new box
* newBoxContent - the content of the new box (should be a DOM element)
* boxId - the id the new box should get (has to be unique!)
* referenceHeader - the header of the reference-object: the new box will be placed *before* this reference-object;
* --> Should be a string with the header, e.g. "Actions"
* --> or a string "last" if it should be put at the very bottom of the sidebar
* --> or a string "first" if it should be put at the very top
* altReferenceHeader - specify an alternative header if the referenceHeader cannot be found
* --> Can be left empty
*
* Note: if the header is the same as one of the other boxes in the sidebar,
* the content will be added to that sidebarbox instead of creating a new one
*
* Note: if the reference header cannot be found, the box will be placed on top
*/
Foxtrick.addBoxToSidebar = function( doc, newBoxHeader, newBoxContent, boxId,
	referenceHeader, altReferenceHeader ) {
	// If we already added this, return
	// Should ideally be checked by the change() function already
	var boxContentId = newBoxContent.id;
	if(!boxContentId) {
		dump("addBoxToSideBar: error: box content should have an id.\n");
		return;
	}
	if( Foxtrick.hasElement( doc, boxId ) ||
		Foxtrick.hasElement( doc, boxContentId )) {
		return;
	}
	
	var sidebar = doc.getElementById("sidebar");
	
	var firstDiv = sidebar.getElementsByTagName("div")[0];
	if (!firstDiv) return;  // no sidebar. can't add something. someone consider creating sidebar later.
	
	var firstBox;
	if(firstDiv.id && firstDiv.id.search(/foxtrick_.+\_box/)==-1) {
		// The sideboxes might be wrapped in another div with an id
		// See for an example the playersdetail page
		// own already added boxes might have an id though
		sidebar = sidebar.getElementsByTagName("div")[0];
		firstBox = sidebar.getElementsByTagName("div")[0];
	} else {
		firstBox = firstDiv;
	}
	
	while(firstBox.className != "sidebarBox") {
		firstBox = firstBox.nextSibling;
	}
		
	// Check if any of the other sidebarboxes have the same header
	// and find the (alternative/normal) reference-object in the process
	var otherBox = false;
	var referenceObject = false;
	var altReferenceObject = false;
	var currentBox = firstBox;
	do {
		// Check if this child is a sidebarbox
		if(currentBox.className=="sidebarBox") {
			var header = currentBox.getElementsByTagName("h2")[0];
			if(header.innerHTML == newBoxHeader) {
				otherBox = currentBox;
			}
			if(header.innerHTML == referenceHeader) {
				referenceObject = currentBox;
			}
			if(header.innerHTML == altReferenceHeader) {
				altReferenceObject = currentBox;
			}
		}
		currentBox = currentBox.nextSibling;
	} while(currentBox.nextSibling);
	
	if(!referenceObject && referenceHeader != "first" 
		&& referenceHeader != "last") {
		// the reference header could not be found; try the alternative
		if(!altReferenceObject && altReferenceHeader != "first"
			&& altReferenceHeader != "last") {
			// alternative header couldn't be found either
			// place the box on top
			dump( "addBoxToSidebar: Could not find referenceHeader " + 
			referenceHeader + "\n" + "nor alternative referenceHeader " +
			altReferenceHeader + "\n");
			referenceHeader = "first";
		} else {
			referenceObject = altReferenceObject;
			referenceHeader = altReferenceHeader;
		}
	}
	if(referenceHeader == "first") {
		referenceObject = sidebar.firstChild;
	}
	
	if(Foxtrick.isStandardLayout(doc)) {	
		// Standard layout
		if(otherBox) {
			newBoxContent.style.display = "inline";
			var subDivs = otherBox.getElementsByTagName("div");
			for(var i = 0; i < subDivs.length; i++) {
				if(subDivs[i].className=="boxBody") {
					var firstDiv = subDivs[i].getElementsByTagName("div")[0];
					firstDiv.setAttribute("style","display: inline;");
					subDivs[i].insertBefore(newBoxContent,firstDiv);
				}
			}
		} else {
			// create the sidebarbox
			var ownSidebarBox = doc.createElement("div");
			ownSidebarBox.className = "sidebarBox";
			ownSidebarBox.setAttribute("id", boxId );
			// create the boxhead
			var ownBoxHead = doc.createElement("div");
			ownBoxHead.className = "boxHead";
			ownSidebarBox.appendChild(ownBoxHead);
			var ownBoxLeftHeader = doc.createElement("div");
			ownBoxLeftHeader.className = "boxLeft";  
			ownBoxHead.appendChild(ownBoxLeftHeader);
			// create the header
			var ownHeader = doc.createElement("h2");
			ownHeader.innerHTML = newBoxHeader;
			ownBoxLeftHeader.appendChild(ownHeader);
			// create the boxbody
			var ownBoxBody = doc.createElement("div");
			ownBoxBody.className = "boxBody";
			ownSidebarBox.appendChild(ownBoxBody);
			// insert the content
			ownBoxBody.appendChild(newBoxContent);
			// create the footer
			var ownBoxFooter = doc.createElement("div");
			ownBoxFooter.className = "boxFooter";
			ownSidebarBox.appendChild(ownBoxFooter);
			var ownBoxLeftFooter = doc.createElement("div");
			ownBoxLeftFooter.className = "boxLeft";
			ownBoxLeftFooter.innerHTML = "&nbsp;";			
			ownBoxFooter.appendChild(ownBoxLeftFooter);
			if(referenceHeader == "last") {
				sidebar.appendChild(ownSidebarBox);
			} else {
				sidebar.insertBefore(ownSidebarBox,referenceObject);
			}
		}
	} else {
		// Simple layout
		if(otherBox) {
			var otherBoxHeader = otherBox.getElementsByTagName("h2")[0];
			Foxtrick.alert(otherBoxHeader);
			otherBox.insertBefore(newBoxContent,otherBoxHeader.nextSibling);
		} else {
			// create the sidebarbox
			var ownSidebarBox = doc.createElement("div");
			ownSidebarBox.className = "sidebarBox";
			ownSidebarBox.setAttribute("id", boxId );
			// create the header
			var ownHeader = doc.createElement("h2");
			ownHeader.innerHTML = newBoxHeader;
			ownSidebarBox.appendChild(ownHeader);
			// insert the content
			ownSidebarBox.appendChild(newBoxContent);
			if(referenceHeader == "last") {
				sidebar.appendChild(ownSidebarBox);
			} else {
				sidebar.insertBefore(ownSidebarBox,referenceObject);
			}
		}
	}
}

Foxtrick.getSortedLinks = function(links) {
  function sortfunction(a,b) {
    return a.link.title.localeCompare(b.link.title);
  }
  links.sort(sortfunction);
  return links;
}

Foxtrick.keysortfunction = function(a,b) {
    return a["title"].localeCompare(b["title"]);
  }

Foxtrick.initOptionsLinks = function(module,linktype,extra_options) {
	try {
			module.OPTIONS = new Array();
			var country_options = new Array();
			
			for (var key in Foxtrick.LinkCollection.stats) {
				var stat = Foxtrick.LinkCollection.stats[key];
				if (stat[linktype]!=null) { 
					var title = stat["title"];
					
					var filters = stat[linktype]["filters"]; 
					var countries='';
					
					for (var i=0; i<filters.length; i++) {
						var filtertype = filters[i]; 
						if (filtertype == "countryid" 
							&& stat["countryidranges"] 
							&& stat["countryidranges"].length!=0) {
								
								var k=0,range;
								while (range = stat["countryidranges"][k++]) {
									var r0=String(range[0]); 
									if (k==1) { 
											if (r0.length==2) r0='0'+r0;
											else  if (r0.length==1) r0='00'+r0;
									}
									if (String(range[0])!=String(range[1])) countries += '[' + r0+'-'+ range[1]+ ']';
									else countries += '[' + r0+']';
									if (stat["countryidranges"][k]) 	countries+=',';
								}
						}
					}
					for (var i=0; i<filters.length; i++) {
						var filtertype = filters[i]; 
						if (filtertype == "owncountryid" 
							&& stat["owncountryidranges"] 
							&& stat["owncountryidranges"].length!=0) {
								
								var k=0,range;
								while (range = stat["owncountryidranges"][k++]) {
									var r0=String(range[0]); 
									if (k==1) { 
											if (r0.length==2) r0='0'+r0;
											else  if (r0.length==1) r0='00'+r0;
									}
									if (String(range[0])!=String(range[1])) countries += '[' + r0+'-'+ range[1]+ ']';
									else countries += '[' + r0+']';
									if (stat["owncountryidranges"][k]) 	countries+=',';
								}
						}
					}					
					if (countries!='') country_options.push({"key":key,"title":countries+' : '+title}); 					
					else  module.OPTIONS.push({"key":key,"title":title}); 
				}
			}	
			module.OPTIONS.sort(Foxtrick.keysortfunction); 
			country_options.sort(Foxtrick.keysortfunction); 
			var i=0,country_option;
			while (country_option = country_options[i++]) {module.OPTIONS.push({"key":country_option.key,"title":country_option.title.replace(/^\[0+/,'[')});}
			for (var key in extra_options) {  
						module.OPTIONS.push({"key":key,"title":extra_options[key]});
			}
					
	} catch(e) {dump('initOptionsLinks '+e+'\n');}
}

Foxtrick.initOptionsLinksArray = function(module,linktypes) {
	try{ 
		module.OPTIONS = new Array();
		var country_options = new Array();
		for (var linktype=0; linktype< linktypes.length; linktype++) { 
			for (var key in Foxtrick.LinkCollection.stats) { 
				var stat = Foxtrick.LinkCollection.stats[key];
				if (stat[linktypes[linktype]]!=null) {
					var title = stat["title"];
					var filters = stat[linktypes[linktype]]["filters"];
					var countries='';
					for (var i=0; i<filters.length; i++) {
						var filtertype = filters[i]; 
						if (filtertype == "nationality")
							if (stat["nationalityranges"] && stat["nationalityranges"].length!=0) { 
								var k=0,range;
								while (range = stat["nationalityranges"][k++]) {
									var r0=String(range[0]); 
									if (countries=='') { 
											if (r0.length==2) r0='0'+r0;
											else  if (r0.length==1) r0='00'+r0;
									}
									if (String(range[0])!=String(range[1])) countries += '[' + r0+'-'+ range[1]+ ']';
									else countries += '[' + r0+']';
									if (stat["nationalityranges"][k]) 	countries+=',';
								}
							}
						}
						if (filtertype == "countryid" 
							&& stat["countryidranges"] 
							&& stat["countryidranges"].length!=0) {
								var k=0,range;
								while (range = stat["countryidranges"][k++]) {
									var r0=String(range[0]); 
									if (countries=='') { 
											if (r0.length==2) r0='0'+r0;
											else  if (r0.length==1) r0='00'+r0;
									}
									if (String(range[0])!=String(range[1])) countries += '[' + r0+'-'+ range[1]+ ']';
									else countries += '[' + r0+']';
									if (stat["countryidranges"][k]) 	countries+=',';
								}
						}
					var has_entry=false;
					for (var i = 0; i < module.OPTIONS.length; i++) {
						if (module.OPTIONS[i]["key"]!=null && module.OPTIONS[i]["key"]==key) {
							has_entry=true;
						}
					}
					if (!has_entry)
					if (countries!='') country_options.push({"key":key,"title":countries+' : '+title}); 					
					else  module.OPTIONS.push({"key":key,"title":title}); 
				}
			}			
		}
		module.OPTIONS.sort(Foxtrick.keysortfunction);
		country_options.sort(Foxtrick.keysortfunction); 
		var i=0,country_option;
		while (country_option = country_options[i++]) {module.OPTIONS.push({"key":country_option.key,"title":country_option.title.replace(/^\[0+/,'[')});}
	} catch(e) {dump('Foxtrick.initOptionsLinksArray : '+e+'\n');}
}

Foxtrick.setStatusIconStyle = function(ev) {
	var image = ev.target;
	if (FoxtrickPrefs.getBool( "statusbarshow" )) {
		image.style.display = "display";
	} else {
        image.style.display = "none";
    }
}


/**********************************************************************
 *
 *  Unicode ? UTF-8
 *
 *  Copyright (c) 2005 AOK <soft@aokura.com>
 *
 **********************************************************************/

Foxtrick._to_utf8 = function(s) {
  var c, d = "";
  for (var i = 0; i < s.length; i++) {
    c = s.charCodeAt(i);
    if (c <= 0x7f) {
      d += s.charAt(i);
    } else if (c >= 0x80 && c <= 0x7ff) {
      d += String.fromCharCode(((c >> 6) & 0x1f) | 0xc0);
      d += String.fromCharCode((c & 0x3f) | 0x80);
    } else {
      d += String.fromCharCode((c >> 12) | 0xe0);
      d += String.fromCharCode(((c >> 6) & 0x3f) | 0x80);
      d += String.fromCharCode((c & 0x3f) | 0x80);
    }
  }
  return d;
}

Foxtrick._from_utf8 = function(s) {
  var c, d = "", flag = 0, tmp;
  for (var i = 0; i < s.length; i++) {
    c = s.charCodeAt(i);
    if (flag == 0) {
      if ((c & 0xe0) == 0xe0) {
        flag = 2;
        tmp = (c & 0x0f) << 12;
      } else if ((c & 0xc0) == 0xc0) {
        flag = 1;
        tmp = (c & 0x1f) << 6;
      } else if ((c & 0x80) == 0) {
        d += s.charAt(i);
      } else {
        flag = 0;
      }
    } else if (flag == 1) {
      flag = 0;
      d += String.fromCharCode(tmp | (c & 0x3f));
    } else if (flag == 2) {
      flag = 3;
      tmp |= (c & 0x3f) << 6;
    } else if (flag == 3) {
      flag = 0;
      d += String.fromCharCode(tmp | (c & 0x3f));
    } else {
      flag = 0;
    }
  }
  return d;
}

Foxtrick.getElementsByClass = function(searchClass,node,tag) {
	var classElements = new Array();
	if ( node == null )
		node = document;
	if ( tag == null )
		tag = '*';
	var els = node.getElementsByTagName(tag);
	var elsLen = els.length;
	var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");
	for (var i = 0, j = 0; i < elsLen; i++) {
		if ( pattern.test(els[i].className) ) {
			classElements[j] = els[i];
			j++;
		}
	}
	return classElements;
}


Foxtrick.substr = function( f_string, f_start, f_length ) {
    f_string += '';
 
    if(f_start < 0) {
        f_start += f_string.length;
    }
 
    if(f_length == undefined) {
        f_length = f_string.length;
    } else if(f_length < 0){
        f_length += f_string.length;
    } else {
        f_length += f_start;
    }
 
    if(f_length < f_start) {
        f_length = f_start;
    }
 
    return f_string.substring(f_start, f_length);
}

Foxtrick.strrpos = function( haystack, needle, offset){
    var i = (haystack+'').lastIndexOf( needle, offset ); // returns -1
    return i >= 0 ? i : false;
}

Foxtrick.ReturnFormatedValue = function( number, separator ) {
    number = '' + number;
    if (number.length > 3) {
        var mod = number.length % 3;
        var output = (mod > 0 ? (number.substring(0,mod)) : '');
        for (var i=0 ; i < Math.floor(number.length / 3); i++) {
            if ((mod == 0) && (i == 0))
                output += number.substring(mod+ 3 * i, mod + 3 * i + 3);
            else
                output+= separator + number.substring(mod + 3 * i, mod + 3 * i + 3);
        }
        return (output);
    }
    else 
        return number;
}

Foxtrick.gregorianToHT  = function( date,weekdayoffset ) {
    /*
    Returns HT Week and Season like (15/37)
    date can be like dd.mm.yyyyy or d.m.yy or dd/mm/yy
    separator or leading zero is irrelevant
    */
    if (date == '') return false;
    date +=' ';
    if(!weekdayoffset) weekdayoffset=0;
    var reg = /(\d{1,4})(.*?)(\d{1,2})(.*?)(\d{1,4})(.*?)(\d+)(.*?)(\d+)(.*?)/i;
    var ar = reg.exec(date);
    var months = [];
    var years = [];

    months[1]  = 0;
    months[2]  = months[1]  + 31;
    months[3]  = months[2]  + 28;
    months[4]  = months[3]  + 31;
    months[5]  = months[4]  + 30;
    months[6]  = months[5]  + 31;
    months[7]  = months[6]  + 30;
    months[8]  = months[7]  + 31;
    months[9]  = months[8]  + 31;
    months[10] = months[9]  + 30;
    months[11] = months[10] + 31;
    months[12] = months[11] + 30;


    // Check http://www.hattrick.org/Club/History/Default.aspx?teamId=100
    // The season start/end was not really a fixed date.

    years[0]  = 830;            // From 2000
    years[1]  = years[0] + 366; // leap year
    years[2]  = years[1] + 365;
    years[3]  = years[2] + 365;
    years[4]  = years[3] + 365;
    years[5]  = years[4] + 366; // leap year
    years[6]  = years[5] + 365;
    years[7]  = years[6] + 365;
    years[8]  = years[7] + 365;
    years[9]  = years[8] + 366; // leap year
    years[10] = years[9] + 365;

    for (var i = 0; i < ar.length; i++) {
        ar[i] = ar[i].replace( /^(0+)/g, '' );
    }
    
    var DATEFORMAT = FoxtrickPrefs.getString("htDateformat");
    if  (DATEFORMAT == null ) DATEFORMAT = 'ddmmyyyy';

    var day = parseInt(ar[1]);
    var month = parseInt(ar[3]);
    var year = parseInt(ar[5]);
    
    switch ( DATEFORMAT ) {
        case 'ddmmyyyy':
            var day = parseInt(ar[1]);
            var month = parseInt(ar[3]);
            var year = parseInt(ar[5]);
            break;
        case 'mmddyyyy':
            var day = parseInt(ar[3]);
            var month = parseInt(ar[1]);
            var year = parseInt(ar[5]);
            break;
        case 'yyyymmdd':
            var day = parseInt(ar[5]);
            var month = parseInt(ar[3]);
            var year = parseInt(ar[1]);
            break;
    }
    var dayCount = years[year-2000] + months[month] + (day) -parseInt(weekdayoffset);
    //dump ( ' > DATEFORMAT: ' + DATEFORMAT + ' [ ' + date + '] ' + day + '/' + month + '/' + year + ':dayoff='+weekdayoffset+'\n');
    // leap day
    if (year % 4 == 0 && month > 2)
        ++dayCount;

    var htDate = Foxtrick.htDatePrintFormat(
                    year, 
                    ( Math.floor(dayCount/(16*7)) + 1 ), 
                    ( Math.floor((dayCount%(16*7))/7) +1 ), 
                    dayCount%7 + 1,
                    date );
    return htDate;
}
    
Foxtrick.htDatePrintFormat = function(year, season, week, day, date) {
    var offset = 0;
    try {
        if (Foxtrick.isModuleFeatureEnabled( FoxtrickHTDateFormat, "LocalSaison"))
            offset = FoxtrickPrefs.getInt("htSeasonOffset");
    } catch(e) {
        dump('offset: ' + e + '\n');
        offset = 0;
    }
     //dump ('offset:' +Foxtrick.isModuleFeatureEnabled( FoxtrickHTDateFormat, "LocalSaison")+' '+ offset + '\n');
    if ( year <= 2000 ) 
        // return "<font color='red'>(Y: " + year + " S: " + season + " W: " + week + " D: " + day + ")</font>"; 
        // return "<font color='#808080'>(old)</font>"; 
        return '';
    else {
        return "<span id='ft_HTDateFormat'>(" + week + "/" + (Math.floor(season) - offset) + ")</span>";
    }
}

Foxtrick.getDatefromCellHTML = function( date ) {
    /*
    Returns Date for given input
    date can be like dd.mm.yyyyy or d.m.yy or dd/mm/yy
    separator or leading zero is irrelevant        
    */
    if (date == '') return false;
        date +=' ';
        
        // dump ('  CELL :[' + date + ']\n');

        var reg = /(\d+)(.*?)(\d+)(.*?)(\d+)(.*?)(\d+)(.*?)(\d+)(.*?)/i;
        var ar = reg.exec(date);
        var DATEFORMAT = FoxtrickPrefs.getString("htDateformat");
        if  (DATEFORMAT == null ) DATEFORMAT = 'ddmmyyyy';

        switch ( DATEFORMAT ) {
            case 'ddmmyyyy':
                var SD = ar[1];
                var SM = ar[3];
                var SY = ar[5];
                break;
            case 'mmddyyyy':
                var SD = ar[3];
                var SM = ar[1];
                var SY = ar[5];
                break;
            case 'yyyymmdd':
                var SD = ar[5];
                var SM = ar[3];
                var SY = ar[1];
                break;
        }
        
        var SH = ar[7];
        var SMn = ar[9];
        var SS = '00';
        // dump('  TIME:' + date + ' = ' + SY + '-' + SM + '-' + SD + ' ' + SH + ':' + SMn + ':' + SS + '!\n');
        var CellDate = new Date(SY, SM-1, SD, SH, SMn, SS);
    return CellDate;
}

Foxtrick.getUniqueDayfromCellHTML = function( date ) {
    /*
    Returns Date for given input
    date can be like dd.mm.yyyyy or d.m.yy or dd/mm/yy
    separator or leading zero is irrelevant        
    */
    if (date == '') return false;
        date +=' ';
        
        // dump ('  CELL :[' + date + ']\n');

        var reg = /(\d{1,4})(.*?)(\d{1,2})(.*?)(\d{1,4})/i;
		var ar = reg.exec(date);
        var DATEFORMAT = FoxtrickPrefs.getString("htDateformat");
        if  (DATEFORMAT == null ) DATEFORMAT = 'ddmmyyyy';

        switch ( DATEFORMAT ) {
            case 'ddmmyyyy': 
                var SD = ar[1];
                var SM = ar[3];
                var SY = ar[5];
                break;
            case 'mmddyyyy':
                var SD = ar[3];
                var SM = ar[1];
                var SY = ar[5];
                break;
            case 'yyyymmdd':
                var SD = ar[5];
                var SM = ar[3];
                var SY = ar[1];
                break;
        }
        //dump(date+' '+ar+' SY:'+SY+'\n');
        var CellDays = SY*31*12+SM*31+SD;
    return CellDays;
}

TimeDifferenceToText = function( time_sec, short ) {
    
    var org_time = time_sec;
    // Returns the time differnce as DDD days, HHh MMm
    // if short, only DDD day(s) will be returned
    
    var Text = "";
    var Days = 0; var Minutes = 0; var Hours = 0;

    if ( Math.floor(time_sec) < 0 )
        return 'NaN';

    //days
    if(time_sec >= 86400) {
        Days = Math.floor(time_sec/86400);
        time_sec = time_sec-Days*86400;
        var d1 = Foxtrickl10n.getString("foxtrick.datetimestrings.day");
        var d5 = Foxtrickl10n.getString("foxtrick.datetimestrings.days");
        try {
            //days for slavian numbers (2 3 4)
            var d2 = Foxtrickl10n.getString("foxtrick.datetimestrings.days234");
        } catch(e) {
            d2 = d5;
        }
        
        Text += Days + '&nbsp;';
        if ( Days == 1 ) // 1 single day
            Text += d1
        else {
            // same word for 2-4 and 0,5-9
            if ( d2 == d5 )
                Text += d2;
            else {
                var units = Days % 10;
                if ( Math.floor( ( Days % 100 ) / 10 ) == 1 )
                    Text += d5;
                else
                    Text += ( units==1 ) ? d1 :( ( ( units > 1 ) && ( units < 5) ) ? d2 : d5 );
            }
        }
    }
    // only days returned 
    if ( short ) {
        var display_option = FoxtrickPrefs.getInt("module." + FoxtrickExtendedPlayerDetails.MODULE_NAME + ".value");
        if (display_option == null) var display_option = 0;
        var PJD_D = Math.floor(org_time / 86400);
        var PJD_W = Math.floor(PJD_D / 7);
        var PJD_S = Math.floor(PJD_D / (16*7));
        var print_S = ''; var print_W = ''; var print_D = '';
        dump ( display_option + ': ' + PJD_D + '/' + PJD_W + '/' + PJD_S + '\n');
        try {
            switch ( display_option ) {  //( "SWD", "SW", "SD", "WD", "D" )
                case 0: //SWD
                    print_S = PJD_S;
                    print_W = PJD_W - (print_S * 16);
                    print_D = PJD_D - (print_S * 16 * 7) - (print_W * 7);
                break;
                
                case 1: //SW
                    print_S = PJD_S;
                    print_W = PJD_W - (print_S * 16);
                    break;
                
                case 2: //SD
                    print_S = PJD_S;
                    print_D = PJD_D - (print_S * 16 * 7);
                break;            
                
                case 3: //WD
                    print_W = PJD_W;
                    print_D = PJD_D - (print_W * 7);
                break;
                
                case 4: //D
                    print_D = PJD_D;
                break;            
            } // switch
        } // try
        catch(e_print) {
            dump('TimeDifferenceToText'+e_print);
        }
        if (print_S == 0 ) {print_S = '';} else {print_S = '<b>' + print_S + '</b>'+Foxtrickl10n.getString("foxtrick.datetimestrings.short_seasons");}
        if (print_W != 0 && print_S != '') print_S += '&nbsp;';
        if (print_W == 0 ) {print_W = '';} else {print_W = '<b>' + print_W + '</b>'+Foxtrickl10n.getString("foxtrick.datetimestrings.short_weeks");} 
        if (print_D != 0 ) print_W += '&nbsp;';
        if (print_D == 0 ) {print_D = '';} else {print_D = '<b>' + print_D + '</b>'+Foxtrickl10n.getString("foxtrick.datetimestrings.short_days");} 
        
        dump( '  SWD OPT[' + display_option + ']: ' + print_S + '/' + print_W + '/' + print_D + '\n');                
        return print_S + print_W + print_D;
        
        if ( Days == 0 ) {
            Text += '0&nbsp;' + Foxtrickl10n.getString("foxtrick.datetimestrings.days");
        }
        return Text;
    }

    //insert white space between days and hours
    if (Text != "") Text += "&nbsp;";

    //hours
    if (( time_sec >= 3600 ) || ( Days > 0 ))
    {
        Hours = Math.floor(time_sec/3600);
        time_sec = time_sec-Hours*3600;
        Text += Hours + Foxtrickl10n.getString("foxtrick.datetimestrings.hours") + '&nbsp;';
    }

    //minutes
    Minutes = Math.floor( time_sec/60 );
    time_sec = time_sec - Minutes * 60;
    Text += Minutes + Foxtrickl10n.getString( "foxtrick.datetimestrings.minutes" );

    return Text;
}

Foxtrick.modifyDates = function ( doc, short, elm, before, after ,weekdayoffset) {
    /*
    Returns HT-Week & Season
    short == true => Date is without time.
    */

    var tds = doc.getElementsByTagName( elm );
    for (var i = 0; tds[i] != null; ++i) {
        // if (tds[i].id == 'ft_HTDateFormat') return;
        var dt_inner = Foxtrick.trim(tds[i].innerHTML);
        
        
        if ( !Foxtrick.strrpos( dt_inner, "ft_HTDateFormat") ) { 
            if ( (dt_inner.length <= 10 && short ) || (dt_inner.length <= 16 && !short ) ) {
                var reg = /(\d{1,4})(\W{1})(\d{1,2})(\W{1})(\d{1,4})(.*?)/g;
                var ar = reg.exec(dt_inner);

                if (ar != null) {
                    var td_date = ar[1] + '.' + ar[3] + '.' + ar[5] + ' 00.00.01';

                    if (Foxtrick.trim(td_date).match(reg) != null && ar[1] != '' && ar[3] != '' && ar[5] != '') {
                        tds[i].innerHTML = dt_inner + before + Foxtrick.gregorianToHT(td_date,weekdayoffset) + after;
						//dump (' == > HTDF ['+ FoxtrickPrefs.getString("htDateformat")+ '] - [' + td_date + '] - [' + Foxtrick.gregorianToHT(td_date)+ '] => [' + tds[i].innerHTML + ']\n');
                    }
                }
            }
        }
    }
}

Foxtrick.copyStringToClipboard = function ( string ) {
	var gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"].getService(Components.interfaces.nsIClipboardHelper);
	gClipboardHelper.copyString(string);
}

Foxtrick.isStandardLayout = function ( doc ) {
	// Check if this is the simple or standard layout
	var link = doc.getElementsByTagName("link")[0];
	return link.href.search("Simple") == -1; // true = standard / false = simple
}

Foxtrick.isRTLLayout = function ( doc ) {
	// Check if this is the simple or standard layout
	var links = doc.getElementsByTagName("head")[0].getElementsByTagName("link");
	var rtl=false;
	var i=0,link;
	while (link=links[i++]) {
		if  (link.href.search("_rtl.css") != -1) rtl = true;
	}
	return rtl;
}


Foxtrick.hasMainBodyScroll = function ( doc ) {
	// Check if scrolling is on for MainBody
	var mainBodyChildren = doc.getElementById('mainBody').childNodes;
	var i = 0, child; 
	while (child = mainBodyChildren[i++]) 
		if (child.nodeName == 'SCRIPT' && child.innerHTML && child.innerHTML.search(/adjustHeight\(\'mainBody\'/) != -1) return  true;
	return false;
	}


Foxtrick.setActiveTextBox = function (field, cssClass, text) {
    var fieldObj = document.getElementById(field);
    fieldObj.className = cssClass;
    if (fieldObj.value == text) {
        fieldObj.value = "";
        return true;
    }
}

Foxtrick.setInactiveTextBox = function (field, cssClass, text) {
    var fieldObj = document.getElementById(field);
    if (fieldObj.value.length === 0) {
        fieldObj.className = cssClass;
        fieldObj.value = text;
    }
    return true;
}

	
Foxtrick.GetElementPosition = function (This,ref){
	var el = This;var pT = 0; var pL = 0;
	while(el && el!=ref){pT+=el.offsetTop; pL+=el.offsetLeft; el=el.offsetParent;}
	return {'top':pT,'left':pL};
}
	
Foxtrick.GetDataURIText = function (filetext) {
	return "data:text/plain;charset=utf-8,"+encodeURIComponent(filetext);
}	


Foxtrick.LoadXML = function (xmlfile) {
	var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
	req.open("GET", xmlfile, false);
	req.send(null);
	var response = req.responseXML;
	if (response.documentElement.nodeName == "parsererror") {
		dump("error parsing " + xmlfile + "\n");
		return null;
	}	
	return response;
}
				
Foxtrick.XML_evaluate = function (xmlresponse, basenodestr, labelstr, valuestr, value2str, value3str) {
	var result = new Array();
	if (xmlresponse) {
		var nodes = xmlresponse.evaluate(basenodestr, xmlresponse, null, 7 , null);
		for (var i = 0; i < nodes.snapshotLength; i++) {
			var node = nodes.snapshotItem(i);
			var label = node.getAttribute(labelstr);
			var value = null;
			var value2=null;
			var value3=null;
			
			if (valuestr) value = node.getAttribute(valuestr);
			if (value2str) value2 = node.getAttribute(value2str);
			if (value3str) value3 = node.getAttribute(value3str);
			
			if (valuestr) result.push([label,value,value2,value3]);  
			else result.push(label);
		}
	}
	return result;
}        			

Foxtrick.getSelectBoxFromXML = function (doc,xmlfile, basenodestr, labelstr, valuestr, selected_value_str) {

	var selectbox = doc.createElement("select"); 
				
	var xmlresponse = Foxtrick.LoadXML(xmlfile);				
	var versions = Foxtrick.XML_evaluate(xmlresponse, basenodestr, labelstr, valuestr);
				
	var indexToSelect=0;
	for (var i = 0; i < versions.length; i++) {
		var label = versions[i][0];
		var value = versions[i][1]; 
					
		var option = doc.createElement("option");
		option.setAttribute("value",value);
		option.innerHTML=label;
		selectbox.appendChild(option);	
			
		if (selected_value_str==value) 
			indexToSelect=i; 
	}
	selectbox.selectedIndex=indexToSelect;
	
	return selectbox;
}
