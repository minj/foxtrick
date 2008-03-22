var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
var PrefsBranch = prefObj.getBranch("foxtrick.userprefs.");

var boolPrefs = new Array("useHattrickStars", "useHattrickSkin", "useHattrickMedals", 
               "showFormationBox", "hideLogoFrame", "resizeMainFrame", "resizeMenuFrame",
               "foxtrickInStatusBar", "alertSlider", "alertSliderGrowl", "alertSound",
               "useForumTemplate1", "useForumTemplate2", "useForumTemplate3", "useForumTemplate4", "useForumTemplate5",
               "useForumTemplate6", "useForumTemplate7", "useForumTemplate8", "useForumTemplate9", "useForumTemplate10",
               "useForumLinksMenu");


var charPrefs = new Array("alertSoundUrl");

var intCharPrefs = new Array("forumTemplate1", "forumTemplate2", "forumTemplate3", "forumTemplate4", "forumTemplate5",
                             "forumTemplate6", "forumTemplate7", "forumTemplate8", "forumTemplate9", "forumTemplate10", "forumLinksMenu");

var charPrefsSelects = new Array("ratingsstyle", "showFacesOrDresses", "lineupColoring",
               "lineupColoringStyle", "htLanguage", "htCurrency", "attackDefenseBars", "cssSkin",
               "starsStyle", "medalSet", "htDateFormat");


function configureFoxtrick() {
    window.openDialog("chrome://foxtrick/content/foxtrick-preferences.xul",
                      "", "centerscreen, chrome, modal, resizable=yes");
} 

function clearPlayerCache() {
    
    try {
        var PlayerInfoBranch = prefObj.getBranch("foxtrick.playerinfo.");
        PlayerInfoBranch.deleteBranch("");
    } catch (e) {
        alert(e);
    }
    
} 

function foxtrick_getIntCharPref(key) {
  return PrefsBranch.getComplexValue(key, Components.interfaces.nsISupportsString).data;
}

function foxtrick_getCharPref(key) {
  try {
    var val = PrefsBranch.getCharPref(key);
    return val;
  } catch (e) {
    return null; 
  }
}


function foxtrick_simpleFillMenuList(menupopup, prefix, values){
    
    for (var key in values) {
        
        var label = key;

        var obj = document.createElement("menuitem");
        obj.setAttribute("id", prefix+key);
        obj.setAttribute("label", label);
        obj.setAttribute("value", key);
        
        menupopup.appendChild(obj);
        
    }

}


function foxtrick_fillMenuList(menupopup, prefix, values){
    
    var sortedKeys = foxtrick_getSortedKeysForArray(values, "name");
    
    for (var i in sortedKeys) {
        
        var key = sortedKeys[i];
        
        var label = values[key]["name"];
        if (typeof(values[key]["version"]) != 'undefined') {
            label = label + " " + values[key]["version"];
        }
        
        label = label + " (by " + values[key]["author"]["name"] + ")";
        
        // for starsets:
        if (typeof(values[key]["number-of-stars"]) != 'undefined') {
            
            var temp = values[key]["number-of-stars"];
            if (typeof(values[key]["zero"]) != 'undefined') {
               temp++;
            }
            
            label += ", " + temp + " " + messageBundle.GetStringFromName("foxtrick.prefs.stars") ;
            
            if (typeof(values[key]["merge-recommended"]) != 'undefined') {
                label += ", " + messageBundle.GetStringFromName("foxtrick.prefs.mergemoderec") ;
            }

        }
        

        var obj = document.createElement("menuitem");
        obj.setAttribute("id", prefix+key);
        obj.setAttribute("label", label);
        obj.setAttribute("value", key);
        
        menupopup.appendChild(obj);
        
    }

}

function fillListFromXml(id, prefix, xmlDoc, elem, descAttr, valAttr){
    
    var values = xmlDoc.getElementsByTagName(elem);
    var menupopup = document.getElementById(id);
    var langs = new Array();
    
    for (var i=0; i<values.length; i++) {
        var label = values[i].attributes.getNamedItem(descAttr).textContent;
        var value = values[i].attributes.getNamedItem(valAttr).textContent;
        langs[langs.length] = new Array(label,value);
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
        
    }

}

function getSkinsDirectory() {
    return getFoxtrickRepositoryDirectory("skins");
}

function getMedalsDirectory() {
    return getFoxtrickRepositoryDirectory("medals");
}

function getFoxtrickRepositoryDirectory(subdir) {
    
    try {
    
        var dirLocator = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
        var dir = dirLocator.get("ProfD", Components.interfaces.nsILocalFile);
        dir.appendRelativePath("foxtrick");
        
        if (!dir.exists() ) {        
            dir.create(dir.DIRECTORY_TYPE, 0755);
        }
        
        if (subdir != null) {
            dir.appendRelativePath(subdir);
            if (!dir.exists() ) {        
                dir.create(dir.DIRECTORY_TYPE, 0755);
            }
        }

       return dir;   
   } 
   catch(e) {
            return null;
   }    

}

function getCssSkins(cssSkinsDir) {
    
    if (cssSkinsDir == null) return null;
    
    // for creating URLs of the files
    var urlCreator = Components.classes["@mozilla.org/network/protocol;1?name=file"].getService(Components.interfaces.nsIFileProtocolHandler);
    
    var entries = cssSkinsDir.directoryEntries;
    
   var cssSkins = new Array();
    
    while (entries.hasMoreElements()) {
      
      var cssFile = entries.getNext().QueryInterface(Components.interfaces.nsIFile);
      
      if (cssFile.isFile()) {
        
        if (cssFile.leafName.match(/zip/)) {
            
            try {
        
                var jarRootPath = "jar:" + urlCreator.getURLSpecFromFile(cssFile) + "!/";
                
                var skinInfoBundle = srGetStrBundle(jarRootPath + "info.properties");
                
                var author = skinInfoBundle.GetStringFromName("author");
                var skinName = skinInfoBundle.GetStringFromName("name");
        
                cssSkins[cssFile.leafName] = {
                                 "name" : skinName ,
                                 "author" : { "name" : author},
                                 "version" : skinInfoBundle.GetStringFromName("version")
                            };
            
            } catch (e) {
                
            }
         }

      }
        
    }
    
    return cssSkins;

}

function fillListBox(id, suffix, values, checkedFunction) {
	
    var listbox = document.getElementById(id);

    var sortedKeys = foxtrick_getSortedKeysForArray(values, "title");
    
    for (var i in sortedKeys) {
        
        var key = sortedKeys[i];
        
        var label = values[key]["title"];
        
        var obj = document.createElement("listitem");
        obj.setAttribute("label", label);
        obj.setAttribute("value", key);
        obj.setAttribute("type", "checkbox");
        obj.id = key+suffix;

        listbox.appendChild(obj);
        listbox.ensureElementIsVisible(obj);
        
    }
    
    listbox.scrollToIndex(0);
	
}


function initFoxtrickPreferences() {
    
    try {
        
      initAboutTab();        
      
      foxtrick_fillMenuList(document.getElementById("starsStylePopup"), "starsStyle-", starsets);
      foxtrick_fillMenuList(document.getElementById("cssSkinPopup"), "cssSkin-", getCssSkins(getSkinsDirectory()));
      foxtrick_fillMenuList(document.getElementById("medalSetPopup"), "medalSet-", getCssSkins(getMedalsDirectory()));
      foxtrick_simpleFillMenuList(document.getElementById("htDateFormatPopup"), "htDateFormat-", foxtrick_dateFormats);

      fillListBox("listbox-links", "showLink", stats, getShowLink);
      fillListBox("listbox-ratings", "showRating", ratingDefs, getShowRating);
      fillListBox("listbox-shortcuts", "showShortcut", shortcuts, getShowShortcut);
      fillListBox("listbox-tweaks", "showTweak", tweaks, getShowTweak);

    } catch (e) {
        foxtrickdebug(e);
    }
    
    try {
        fillListFromXml("htLanguagePopup", "htLanguage-", htLanguagesXml, "language", "desc", "name");
        fillListFromXml("htCurrencyPopup", "htCurrency-", htCurrenciesXml, "currency", "name", "code");
    } catch (e) {
        foxtrickdebug(e);
    }
    
    for (var i=0; i<boolPrefs.length; i++) {
        try {
            var temp = boolPrefs[i];
            document.getElementById(temp).checked=PrefsBranch.getBoolPref(temp);
        } catch (e) {}
    }

    for (var i=0; i<charPrefs.length; i++) {
        try {
            var temp = charPrefs[i];
            document.getElementById(temp).value=PrefsBranch.getCharPref(temp);
        } catch (e) {}
    }

    for (var i=0; i<intCharPrefs.length; i++) {
      try {
        var temp = intCharPrefs[i];
        document.getElementById(temp).value=PrefsBranch.getComplexValue(temp, Components.interfaces.nsISupportsString).data;
      } catch (e) {}
    }

    
    for (var i=0; i<charPrefsSelects.length; i++) {
        try {
            var temp = charPrefsSelects[i];
            document.getElementById(temp).selectedItem=document.getElementById(temp + "-" + PrefsBranch.getCharPref(temp));
        } catch (e) {}
    }

   
    try {
         document.getElementById("starsStyleGroupBy").value=PrefsBranch.getIntPref("starsStyleGroupBy");
    }
    catch (e) {}
        
        
    try {   

        document.getElementById("starsStyleType").selectedItem=document.getElementById("starsStyleType-" + PrefsBranch.getCharPref("starsStyleType"));
        starsStyleChanged();
        
        document.getElementById("mainFrameWidth").value=PrefsBranch.getIntPref("mainFrameWidth");                
        document.getElementById("menuFrameWidth").value=PrefsBranch.getIntPref("menuFrameWidth");                


    } catch (e) 
    {
    }
    
            
    try {

        // show links

        for (var key in stats) {
            var checkbox = document.getElementById(key+"showLink");
            checkbox.checked = getShowLink(key);
        }

        // show ratings
        
        for (var key in ratingDefs) {
            var checkbox = document.getElementById(key+"showRating");
            checkbox.checked = getShowRating(key);
        }
    
    
        // show shortcuts
    
        for (var key in shortcuts) {
            var checkbox = document.getElementById(key+"showShortcut");
            checkbox.checked = getShowShortcut(key);
        }

        // show tweaks
    
        for (var key in tweaks) {
            var checkbox = document.getElementById(key+"showTweak");
            checkbox.checked = getShowTweak(key);
        }
   
      
    } catch (e) {
        foxtrickdebug(e);
    }
    
    previewStars();

    
}


function savePreferences() {
    
    try {

        PrefsBranch.setCharPref("starsStyleType", document.getElementById("starsStyleType").value);

        for (var i=0; i<boolPrefs.length; i++) {
            var temp = boolPrefs[i];
            PrefsBranch.setBoolPref(temp, document.getElementById(temp).checked);
        }

        for (var i=0; i<charPrefs.length; i++) {
            var temp = charPrefs[i];
            PrefsBranch.setCharPref(temp, document.getElementById(temp).value);
        }

        for (var i=0; i<intCharPrefs.length; i++) {
            var temp = intCharPrefs[i];

            var str = Components.classes["@mozilla.org/supports-string;1"].createInstance(Components.interfaces.nsISupportsString);
            str.data = document.getElementById(temp).value;            
            
            PrefsBranch.setComplexValue(temp, Components.interfaces.nsISupportsString, str );
        }

        for (var i=0; i<charPrefsSelects.length; i++) {
            var temp = charPrefsSelects[i];
            if (document.getElementById(temp).selectedItem != null) {
                PrefsBranch.setCharPref(temp, document.getElementById(temp).selectedItem.value);
            }
        }

        PrefsBranch.setIntPref("starsStyleGroupBy", document.getElementById("starsStyleGroupBy").value);
        PrefsBranch.setIntPref("mainFrameWidth", document.getElementById("mainFrameWidth").value);
        PrefsBranch.setIntPref("menuFrameWidth", document.getElementById("menuFrameWidth").value);

        
        // links

        for (var key in stats) {
            var checkbox = document.getElementById(key+"showLink");
            setShowLink(key, checkbox.checked);
        }
    
        // ratings
    
        for (var key in ratingDefs) {
            var checkbox = document.getElementById(key+"showRating");
            setShowRating(key, checkbox.checked);
        }
    
        // shortcuts
    
        for (var key in shortcuts) {
            var checkbox = document.getElementById(key+"showShortcut");
            setShowShortcut(key, checkbox.checked);
        }
    
        // shortcuts
    
        for (var key in tweaks) {
            var checkbox = document.getElementById(key+"showTweak");
            setShowTweak(key, checkbox.checked);
        }
        
        return true;
        
    } catch (e) {
        alert (e);
        //return false;
        return true;
    }

    
}



//---------------------------------------------------------------
 
 function useHattrickStarsChanged(event) {
    
    var disabled = document.getElementById("useHattrickStars").checked;
    
    document.getElementById("starsStyle").disabled = disabled;
    document.getElementById("starsStyleType").disabled = disabled;

    var temp = (document.getElementById("starsStyleType").selectedItem == document.getElementById("starsStyleType-merge"));
    
    document.getElementById("starsStyleGroupBy").disabled = disabled || temp;
    
}

//---------------------------------------------------------------
 
function useHattrickSkinChanged(event) {
  var disabled = document.getElementById("useHattrickSkin").checked;
  document.getElementById("cssSkin").disabled = disabled;
}

//---------------------------------------------------------------
 
function useHattrickMedalsChanged(event) {
  var disabled = document.getElementById("useHattrickMedals").checked;
  document.getElementById("medalSet").disabled = disabled;
}

//---------------------------------------------------------------

function initAboutTab() {

  try {
    var extensionmanager = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);    
    
    var version = extensionmanager.getItemForID('{9d1f059c-cada-4111-9696-41a62d64e3ba}').version;
    document.getElementById("foxtrick-desc").value = "FoxTrick v." + version;
      
  } catch (e) {
    foxtrickdebug(e);
  }
    
    
}

function starsStyleChanged() {

    var temp = (document.getElementById("starsStyleType").selectedItem == document.getElementById("starsStyleType-merge"));
    document.getElementById("starsStyleGroupBy").disabled = temp;
    
}

function previewStars() {
    
    var starsStyle = document.getElementById("starsStyle").selectedItem.value;
    
    var filesuffix = ".png";
    if (typeof(starsets[starsStyle]["suffix"]) != 'undefined') {
        filesuffix = "." + starsets[starsStyle]["suffix"];
    }
    
    for (var i=1; i<= starsets[starsStyle]["number-of-stars"]; i++) {
        
        var img = document.getElementById("starpreview" + i);
        img.src=
         "chrome://foxtrick/content/resources/stars/" + starsStyle + "/star" + i + filesuffix;

        img = document.getElementById("halfstarpreview" + i);
        img.src=
         "chrome://foxtrick/content/resources/stars/" + starsStyle + "/half" + i + filesuffix;

        
    }
    
    // hide the rest
    for (var i=starsets[starsStyle]["number-of-stars"]+1; i<=10; i++) {
        
        var img = document.getElementById("starpreview" + i);
        img.src="";
        
        img = document.getElementById("halfstarpreview" + i);
        img.src= "";

        
    }
    
}

//---------------------------------------------------------------
function initWindow() {

  document.getElementById("useHattrickStars").addEventListener('CheckboxStateChange',useHattrickStarsChanged, true);
  document.getElementById("useHattrickSkin").addEventListener('CheckboxStateChange',useHattrickSkinChanged, true);    
  document.getElementById("useHattrickMedals").addEventListener('CheckboxStateChange',useHattrickMedalsChanged, true);    
  document.getElementById("starsStyleType").addEventListener('RadioStateChange', starsStyleChanged , true);
  initFoxtrickPreferences();
  //window.setTimeout('initFoxtrickPreferences();', 0); 
    
}

function foxtrick_getSortedKeysForArray(values, sortProperty) {
 
  var keys = new Array();
  
  for (var key in values) {
    keys[keys.length] = key;
  }
  
  function sortfunction(a,b) {
    return values[a][sortProperty].localeCompare(values[b][sortProperty]);
  }
  
  keys.sort(sortfunction);
  
  return keys;
    
}
