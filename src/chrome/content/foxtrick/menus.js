// reveals context menu-items as needed
function foxtrick_initPopupMenu(event) {
    
    try {

    	if (event.target.id != "contentAreaContextMenu") return;
    
        // foxtrick menu
    	var foxtrickMenu = document.getElementById("foxtrick-menu");
    	foxtrickMenu.hidden = !isHattrickDocument(window._content.document);
    	
    	foxtrick_showhideMenuItems("foxtrick-popup-menu");
        
        // install skin menu
        var installSkinMenuItem = document.getElementById("foxtrick-menu-installskin");
        installSkinMenuItem.hidden = !getIsSkinLink(/hattrick-org-skin-zipped-link/i);
    
        // install medalset menu
        var installMedalSetMenuItem = document.getElementById("foxtrick-menu-installmedalset");
        installMedalSetMenuItem.hidden = !getIsSkinLink(/hattrick-org-medalset-link/i);
    
    } catch (e){
        foxtrickdebug(e);
    }

} 

function foxtrick_showhideMenuItems(prefix) {
         
  var menuCreatePlayerAd = document.getElementById(prefix + "-playerad");
  menuCreatePlayerAd.hidden = !foxtrick_canCreatePlayerAd(window._content.document);
  
  var menuMakeConfLink = document.getElementById(prefix + "-makelink");
  if (menuMakeConfLink != null) {
     menuMakeConfLink.hidden = !gContextMenu.onLink;
  }

}

function getIsSkinLink(regexp) {

   if (gContextMenu.onLink) {
    
        var skinUrl = gContextMenu.link.href;
        var skinClass = gContextMenu.link.className;
        
        if (skinClass.match(regexp)) {
            if (skinUrl.match(/\.zip$/i)) {
                return true;
            }
        }
    }
    
    return false;
    
}

function foxtrick_adjustWindowContextMenu(event) {
    return foxtrick_adjustContextMenu(event, "foxtrick-popup-menu");
}

function foxtrick_adjustStatusBarContextMenu(event) {
    return foxtrick_adjustContextMenu(event, "foxtrick-status-bar-menu");
}

function foxtrick_fillSkinsPopup(event) {
  
  var popup = event.target;
  
  while (popup.childNodes.length > 1) {
    popup.removeChild(popup.lastChild);
  }
  
  var values = getCssSkins(getSkinsDirectory());
  var sortedKeys = foxtrick_getSortedKeysForArray(values, "name");
  var prefix = "foxtrick-skins-popup";
  
  var selectedSkin = PrefsBranch.getCharPref("cssSkin");
  var useHattrickSkin = PrefsBranch.getBoolPref("useHattrickSkin");
  popup.firstChild.setAttribute("checked", useHattrickSkin);
  
  if (sortedKeys.length > 0) {
       var separator = window.document.createElement("separator"); 
       separator.className = "groove";
       popup.appendChild(separator);
  }    
  
  for (var i in sortedKeys) {
      
      var key = sortedKeys[i];
      
      var label = values[key]["name"];
      if (typeof(values[key]["version"]) != 'undefined') {
          label = label + " " + values[key]["version"];
      }
      
      label = label + " (by " + values[key]["author"]["name"] + ")";

      var menuitem = window.document.createElement("menuitem"); 
      menuitem.setAttribute("label", label);
      menuitem.setAttribute("id", prefix+key);
      menuitem.setAttribute("checked", "true");
      if (!useHattrickSkin && (selectedSkin == key)) {
        menuitem.setAttribute("type", "checkbox");        
      }
      menuitem.setAttribute("oncommand", "PrefsBranch.setBoolPref('useHattrickSkin', false);PrefsBranch.setCharPref('cssSkin','" + key + "');");
      
      popup.appendChild(menuitem);
      
  }
  
}

function foxtrick_adjustContextMenu(event, prefix) {
  
    foxtrick_initPopupMenu(event);

    try {

       var target = event.target;
       var menu = window.document.getElementById(prefix);
       if (target != menu) return;

       var firstFixedMenuItem = window.document.getElementById(prefix + "-playerad");

       while (firstFixedMenuItem.previousSibling != null) {
          menu.removeChild(firstFixedMenuItem.previousSibling);
       } 

       var form = getTransferSearchFrame(window._content.document);

       if (form == null) { 
          return;
        }

       // separator

       var separator = window.document.createElement("separator"); 
       separator.className = "groove";
       menu.insertBefore(separator, firstFixedMenuItem);
       
       var menuitem = window.document.createElement("menuitem"); 
       menuitem.className = "menuitem-non-iconic";
       menuitem.setAttribute("label", messageBundle.GetStringFromName("foxtrick.menu.savefilter"));
       menuitem.setAttribute("oncommand", "saveTransferSearchFilter();");
       menu.insertBefore(menuitem, separator);
    
       // filters
       
       var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
       var branch = prefObj.getBranch("foxtrick.formfiller.");
       
       var aCount = {value:0}; 
       
       var list = branch.getChildList("", aCount);
       list.sort();
       
       if (aCount.value>0) {
    
           // separator
        
           var separator = window.document.createElement("separator"); 
           separator.className = "groove";
           menu.insertBefore(separator, menuitem);
        
            for (var i=0; i< list.length; i++) {
    
               var menuitem = window.document.createElement("menuitem"); 
               menuitem.setAttribute("label", list[i]);
               menuitem.className = "menuitem-non-iconic";
               menuitem.setAttribute("oncommand", "fillTransferSearchForm1('" + list[i] + "');");
               
               menu.insertBefore(menuitem, separator);
                
            }
    
           // separator
        
           var separator2 = window.document.createElement("separator"); 
           separator2.className = "groove";
           menu.insertBefore(separator2, separator);
    
           var filtermenu = window.document.createElement("menu"); 
           filtermenu.id =  "foxtrick-filter-a-" + i;
           filtermenu.setAttribute("label", messageBundle.GetStringFromName("foxtrick.menu.removefilter"));
    
           var menupopup = window.document.createElement("menupopup"); 
           menupopup.id = "foxtrick-filter-remove";
           menupopup.setAttribute("onpopupshowing", "");
    
            for (var i=0; i< list.length; i++) {
    
               var menuitem = window.document.createElement("menuitem"); 
               menuitem.setAttribute("label", list[i]);
               menuitem.className = "menuitem-non-iconic";
               menuitem.setAttribute("oncommand", "deleteFilter('" + list[i] + "');");
               menupopup.appendChild(menuitem);
    
            }
    
           var separator3 = window.document.createElement("separator"); 
           separator3.className = "groove";
           menupopup.appendChild(separator3);
    
            
           var menuitem = window.document.createElement("menuitem"); 
           menuitem.setAttribute("label", messageBundle.GetStringFromName("foxtrick.menu.removeallfilters"));
           menuitem.className = "menuitem-non-iconic";
           menuitem.setAttribute("oncommand", "deleteAllFilters();");
           menupopup.appendChild(menuitem);
    
           filtermenu.appendChild(menupopup);
               
           menu.insertBefore(filtermenu, separator2.nextSibling);
        
        
       }
    } catch (e) {
        foxtrickdebug(e);
    }

}


function getXmlFormFiller(form) {
    
   var myXmlSerializer = new XMLSerializer();
   var myDomParser = new DOMParser();
   
   var doc = window._content.document;

   var formKeeper = doc.createElement("options");

   var selects = form.getElementsByTagName("select");
   
   for (var i=0; i<selects.length; i++) {
     var formInput = doc.createElement("input");
     
     var inputName = doc.createElement("name");
     inputName.appendChild(doc.createTextNode(selects[i].name));
     formInput.appendChild(inputName);

     var inputValue = doc.createElement("value");
     inputValue.appendChild(doc.createTextNode(selects[i].value));
     formInput.appendChild(inputValue);

     formKeeper.appendChild(formInput);
   }

   var selects = form.getElementsByTagName("input");

   for (var i=0; i<selects.length; i++) {
    
     if (selects[i].name == '') continue;
    
     var formInput = doc.createElement("input");
     
     var inputName = doc.createElement("name");
     inputName.appendChild(doc.createTextNode(selects[i].name));
     formInput.appendChild(inputName);

     var inputValue = doc.createElement("value");
     inputValue.appendChild(doc.createTextNode(selects[i].value));
     formInput.appendChild(inputValue);

     formKeeper.appendChild(formInput);
   }


   var str = myXmlSerializer.serializeToString(formKeeper);
   return str;

}

function saveTransferSearchFilter() {
    try {
      
       var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
       
       var returnobj = {};
       var b = {};
       
       promptService.prompt(window, '',
                    messageBundle.GetStringFromName("foxtrick.menu.selectfiltername"), returnobj, null, b);

       if (returnobj == null) return;
                    
       var filtername = returnobj.value;

       if (filtername == null) return;
        
       var form = getTransferSearchFrame(window._content.document);
       var formString = getXmlFormFiller(form);
    
       var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
       var branch = prefObj.getBranch("foxtrick.formfiller.");
       branch.setCharPref(filtername, formString);

    } catch (e) {
        foxtrickdebug(e);
    }
    
}

function deleteFilter(filtername) {
    
   var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
   var branch = prefObj.getBranch("foxtrick.formfiller.");
   branch.deleteBranch(filtername);
    
}

function deleteAllFilters() {
    
   var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
   var branch = prefObj.getBranch("foxtrick.");
   branch.deleteBranch("formfiller");
    
}

function fillTransferSearchForm1(filterName) {
    
    try {
        
        var doc = window._content.document;
        var filter = getTransferSearchFormFilter(filterName);
        fillTransferSearchForm2(filter, doc);
            
   } catch (e) {
    alert (e);
   }
    
}


//---------------------------------------------------------------

function findFormElement(name, doc) {
    
    var els = doc.getElementsByName(name);
    if (els.length > 0) return els[0];
    
    var frames = doc.getElementsByTagName("frame");
    
    for (var i=0; i<frames.length; i++) {
        var el = findFormElement(name, frames[i].contentDocument);
        if (el != null) return el;
        
    }
    
    return null;
    
}

//-------------

function installMedalSet(event) {
    installHattrickSkin(getMedalsDirectory());
}

function installSkin(event) {
    installHattrickSkin(getSkinsDirectory());
}

function installHattrickSkin(cssSkinsDir) {
    
    if (cssSkinsDir == null) {
      alert("Error: Could not locate skins directory.");
      return;
     }

	var skinURL = gContextMenu.link.href;
	if ( !skinURL ) return;
	
  try {
    
      var dirLocator = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
      
      var urlCreator = Components.classes["@mozilla.org/network/protocol;1?name=http"].getService(Components.interfaces.nsIHttpProtocolHandler);
      var fileUrlCreator = Components.classes["@mozilla.org/network/protocol;1?name=file"].getService(Components.interfaces.nsIFileProtocolHandler);  
      var sourceURI = urlCreator.newURI(skinURL, null , null);

      var fileName = skinURL.match(/[^\/]*\.zip/)[0];
      cssSkinsDir.appendRelativePath(fileName);
     
      var targetFile = fileUrlCreator.newFileURI(cssSkinsDir); 
      
      var displayName = fileName;
     
      var mimeService = Components.classes["@mozilla.org/mime;1"].getService(Components.interfaces.nsIMIMEService);
      var mimeInfo = mimeService.getFromTypeAndExtension("application/zip" , null);
     
      var startTime = Date.now();
    
      var downloadManager =
        Components.classes["@mozilla.org/download-manager;1"].getService(Components.interfaces.nsIDownloadManager);

      var obj = Components.classes['@mozilla.org/embedding/browser/nsWebBrowserPersist;1']
    	    .createInstance(Components.interfaces.nsIWebBrowserPersist);
    	    
       try {
        var downloadObj = downloadManager.addDownload(downloadManager.DOWNLOAD_TYPE_DOWNLOAD,
             sourceURI, targetFile, null, null,  mimeInfo, startTime, obj);
       } catch (e) {}

//    	var progress = Components.classes['@mozilla.org/progressdialog;1'].createInstance(Components.interfaces.nsIProgressDialog);
    
    	obj.progressListener = downloadObj;
    	obj.saveURI(sourceURI, null, null, null, null, targetFile);
        
       //downloadManager.openProgressDialogFor(downloadObj, window, true);
       //downloadManager.open(window, downloadObj);
       //downloadManager.open(null, null);
      
    }   catch (e) {
        foxtrickdebug(e);
    }   

}


window.document.addEventListener("popupshown", foxtrick_initPopupMenu, true); 
