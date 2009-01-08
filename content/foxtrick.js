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

/** Core Foxtrick modules, always used.
 * Don't add here unless you have a good reason to. */
Foxtrick.core_modules = [ FoxtrickPrefs,
                          Foxtrickl10n ];
////////////////////////////////////////////////////////////////////////////////
var FoxtrickMain = {

    init : function() {
        var i;

        // init core modules
        for ( i in Foxtrick.core_modules ) {
            Foxtrick.core_modules[i].init();
        }
		
		// create handler arrays for each recognized page
        for ( i in Foxtrick.ht_pages ) {
            Foxtrick.run_on_page[i] = new Array();
        }

        // init all modules
        for ( i in Foxtrick.modules ) {
            var module = Foxtrick.modules[i];
            // if module has an init() function and is enabled
            if ( module.MODULE_NAME
                    && Foxtrick.isModuleEnabled( module )
                    && module.init )
            {
                try {
                    module.init();
                    dump( "Foxtrick enabled module: " + module.MODULE_NAME + "\n");
                } catch (e) {
                    dump( "Foxtrick module " + module.MODULE_NAME + " init() exception: " + "\n  " + e + "\n");
                    Components.utils.reportError(e);
                }
            }
            else {
                dump( "Foxtrick disabled module: " + module.MODULE_NAME + "\n" );
			}
        }

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
		var toolsMenu = document.getElementById( "foxtrick-config-menu" );
		toolsMenu.setAttribute( "label", Foxtrickl10n.getString( 
			"foxtrick.menu.configurefoxtrick") );
		var popupMenu = document.getElementById( "foxtrick_popup_config_menu");
		popupMenu.setAttribute( "label", Foxtrickl10n.getString( 
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
        dump( "Foxtrick run time: " + time + " ms\n" );
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
		// don't execute if on stage server and user doesn't want Foxtrick to be executed there
		var stage_regexp = /http:\/\/stage\.hattrick\.org/i;
		if(!( FoxtrickPrefs.getBool("disableOnStage") &&
			Foxtrick.getHref( doc).search( stage_regexp ) > -1)) {
	
			// call the modules that want to be run() on every hattrick page
			Foxtrick.run_every_page.forEach(
				function( fn ) {
					try {
						fn.run( doc );
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
								fn.run( i, doc );
							} catch (e) {
								dump ( "Foxtrick module " + fn.MODULE_NAME + " run() exception at page " + i + "\n  " + e + "\n" );
								Components.utils.reportError(e);
							}
						} );
				}
			}
		}
    },
	
	// function run on every ht page change
	change : function( doc ) {
		var stage_regexp = /http:\/\/stage\.hattrick\.org/i;
		if(!( FoxtrickPrefs.getBool("disableOnStage") &&
			Foxtrick.getHref( doc).search( stage_regexp ) > -1)) {
			
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
	}

};

Foxtrick.isPage = function( page, doc ) {
	var htpage_regexp = new RegExp( page, "i" );
	return Foxtrick.getHref( doc ).search( htpage_regexp ) > -1;
}

Foxtrick.getHref = function( doc ) {
    return doc.location.href;
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
  return text.replace(/^\s+/, "").replace(/\s+$/, '');
}

Foxtrick.trimnum = function (text) {
  //return text.replace(/[\D\s]/g, '');  
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

String.prototype.group = function( chr, size )
{
	if ( typeof chr == 'undefined' ) chr = ",";
	if ( typeof size == 'undefined' ) size = 3;
	return this.split( '' ).reverse().join( '' ).replace( new RegExp( "(.{" + size + "})(?!$)", "g" ), "$1" + chr ).split( '' ).reverse().join( '' );
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

Foxtrick.selectFile = function (parentWindow) {
    try {
    	var fp = Components.classes['@mozilla.org/filepicker;1'].createInstance(Components.interfaces.nsIFilePicker);
    	fp.init(parentWindow, "", fp.modeOpen);
    	if (fp.show() == fp.returnOK ) {
    		return fp.file.path;
    	}
    } catch (e) {
        dump(e);
    }
	return null;
}

Foxtrick.playSound = function(url) {
  try {
    var soundService = Components.classes["@mozilla.org/sound;1"].getService(Components.interfaces.nsISound);
    var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    soundService.play(ioService.newURI(url, null, null));
  } catch (e) {
    dump(e);
  }
}


// create stats Hash

var foxtrickStatsHash = {};
for (var key in stats) {
  var stat = stats[key];
  for (var prop in stat) {
    if (prop.match(/link/)) {
      if (typeof(foxtrickStatsHash[prop]) == 'undefined') {
       foxtrickStatsHash[prop] = {};
      }
      foxtrickStatsHash[prop][key] = stat;
    }
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
	// Check if this is the simple or standard layout
	var layout;
	var sidebar = doc.getElementById("sidebar");
	
	var firstDiv = sidebar.getElementsByTagName("div")[0];
	var firstBox;
	if(firstDiv.id) {
		// The sideboxes might be wrapped in another div with an id
		// See for an example the playersdetail page
		sidebar = sidebar.getElementsByTagName("div")[0];
		firstBox = sidebar.getElementsByTagName("div")[0];
	} else {
		firstBox = firstDiv;
	}
	
	while(firstBox.className != "sidebarBox") {
		firstBox = firstBox.nextSibling;
	}
	if(firstBox.getElementsByTagName("div").length) {
		layout = 1; // standard
	} else { 
		layout = 0; // simple
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
	
	if(layout) {
		if(otherBox) {
			var subDivs = otherBox.getElementsByTagName("div");
			for(var i = 0; i < subDivs.length; i++) {
				if(subDivs[i].className=="boxBody") {
					subDivs[i].insertBefore(newBoxContent,
						subDivs[i].firstChild);
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
		if(otherBox) {
			var otherBoxHeader = otherBox.getElementsByTagName("h2")[0];
			otherBox.insertBefore(newBoxContent,otherBoxHeader.nextSibling);
		} else {
			// create the sidebarbox
			var ownSidebarBox = doc.createElement("div");
			ownSidebarBox.className = "sidebarBox";
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

function getSortedLinks(links) {
  function sortfunction(a,b) {
    return a.link.title.localeCompare(b.link.title);
  }
  links.sort(sortfunction);
  return links;
}

function keysortfunction(a,b) {
    return a["title"].localeCompare(b["title"]);
  }

Foxtrick.initOptionsLinks = function(module,linktype) {
		
			module.OPTIONS = new Array();
			for (var key in stats) { 
				if (stats[key][linktype]!=null) {
					module.OPTIONS.push({"key":key,"title":Foxtrick._from_utf8(stats[key]["title"])});
				}
			}	
			module.OPTIONS.sort(keysortfunction); 
}

Foxtrick.initOptionsLinksArray = function(module,linktypes) {

		module.OPTIONS = new Array();
		for (var linktype=0; linktype< linktypes.length; linktype++) { 
			for (var key in stats) { 
				if (stats[key][linktypes[linktype]]!=null) {
					var has_entry=false;
					for (var i = 0; i < module.OPTIONS.length; i++) {
						if (module.OPTIONS[i]["key"]!=null && module.OPTIONS[i]["key"]==key) {
							has_entry=true;
						}
					}
					if (!has_entry) {module.OPTIONS.push({"key":key,"title":Foxtrick._from_utf8(stats[key]["title"])});}
				}
			}			
		}
		module.OPTIONS.sort(keysortfunction);
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

function getElementsByClass(searchClass,node,tag) {
	var classElements = new Array();
	if ( node == null )
		node = document;
	if ( tag == null )
		tag = '*';
	var els = node.getElementsByTagName(tag);
	var elsLen = els.length;
	var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");
	for (i = 0, j = 0; i < elsLen; i++) {
		if ( pattern.test(els[i].className) ) {
			classElements[j] = els[i];
			j++;
		}
	}
	return classElements;
}