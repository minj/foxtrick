var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
var PrefsBranch = prefObj.getBranch("foxtrick.userprefs.");


function getBooleanPref(key, defval) {
    
    try {
        var val = PrefsBranch.getBoolPref(key);
        return val;
        
    } catch (e) {
        return defval;
    }
    
}


function getShowLink(link) {
  return getBooleanPref("showLink-" + link, true);
}

function setShowLink(link, value) {
  PrefsBranch.setBoolPref("showLink-" + link, value);
}

function getShowRating(link) {
    
    var key = "showRating-" + link;
    
    try {
       return PrefsBranch.getBoolPref(key);        
    } catch (e) {
        if (link == "hatstatstotal") return true;
        if (link == "loddarstats") return true;
        return false;
    }
    
}

function setShowRating(link, value) {
  PrefsBranch.setBoolPref("showRating-" + link, value);
}

function getShowShortcut(link) {
  return getBooleanPref("showShortcut-" + link, true);
}

function setShowShortcut(link, value) {
  PrefsBranch.setBoolPref("showShortcut-" + link, value);
}

function getShowTweak(link) {
  return getBooleanPref("showTweak-" + link, false);
}

function setShowTweak(link, value) {
  PrefsBranch.setBoolPref("showTweak-" + link, value);
}