function foxtrickdebug(e) {
  Components.utils.reportError(e);
}

function foxtrick_playSound(url) {
  var soundService = Components.classes["@mozilla.org/sound;1"].getService(Components.interfaces.nsISound);
  var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
  soundService.play(ioService.newURI(url, null, null));
}

//--------------------------------------------------------------------------- 

var foxtrick_dateFormats = new Array();
foxtrick_dateFormats["dd.mm.yyyy"] = { "delim" : ".", "d" : 0, "m": 1, "y" : 2 };
foxtrick_dateFormats["dd/mm/yyyy"] = { "delim" : "/", "d" : 0, "m": 1, "y" : 2 };
foxtrick_dateFormats["dd-mm-yyyy"] = { "delim" : "-", "d" : 0, "m": 1, "y" : 2 };
foxtrick_dateFormats["yyyy-mm-dd"] = { "delim" : "-", "d" : 2, "m": 1, "y" : 0 };
foxtrick_dateFormats["mm/dd/yyyy"] = { "delim" : "/", "d" : 1, "m": 0, "y" : 2 };
