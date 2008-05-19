function foxtrickdebug(e) {
  Components.utils.reportError(e);
}

function foxtrick_playSound(url) {
  try {
    var soundService = Components.classes["@mozilla.org/sound;1"].getService(Components.interfaces.nsISound);
    var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
    soundService.play(ioService.newURI(url, null, null));
  } catch (e) {
    foxtrickdebug(e);
  }
}

//--------------------------------------------------------------------------- 

var foxtrick_dateFormats = {};
foxtrick_dateFormats["dd.mm.yyyy"] = { "delim" : ".", "d" : 0, "m": 1, "y" : 2 };
foxtrick_dateFormats["dd/mm/yyyy"] = { "delim" : "/", "d" : 0, "m": 1, "y" : 2 };
foxtrick_dateFormats["dd-mm-yyyy"] = { "delim" : "-", "d" : 0, "m": 1, "y" : 2 };
foxtrick_dateFormats["yyyy-mm-dd"] = { "delim" : "-", "d" : 2, "m": 1, "y" : 0 };
foxtrick_dateFormats["mm/dd/yyyy"] = { "delim" : "/", "d" : 1, "m": 0, "y" : 2 };

// slider alerts
function foxtrick_showEventAlert(doc){
    
  if (!isNewsFlashUrl(doc.location.href)) return;
  
  try {
    var expreg = new RegExp ( 'href="(.*)" target="main" class="messBold">(.+)</a>', "igm" );
    var scriptsrc = doc.getElementsByTagName("script")[0].text;
    
    var tmp = expreg.exec(scriptsrc);
    
    if (tmp != null) {
      if (tmp[1] != "myHattrick.asp") {
        if (PrefsBranch.getBoolPref("alertSlider")) {
            foxtrick_showAlert(tmp[2]);
        }
        if (PrefsBranch.getBoolPref("alertSliderGrowl")) {
            foxtrick_showAlertGrowl(tmp[2]);
        }
        if (PrefsBranch.getBoolPref("alertSound")) {
           try {
             foxtrick_playSound(PrefsBranch.getCharPref("alertSoundUrl"));
           } catch (e) {
             foxtrickdebug(e);
           }
        }
      }
    }
  } catch(e) {}
}    

function foxtrick_showAlert(text, alertError) {
    var img = "http://hattrick.org/favicon.ico";
    var title = "Hattrick.org";
	
    try{
        try {
            var alertsService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
            var clickable = true;
            var listener = { observe:
                function(subject, topic, data) {
                    if (topic=="alertclickcallback") {
                        window.focus();
                    }
                }
            };
            alertsService.showAlertNotification(img, title, text, clickable, "", listener);
        } catch (e) {
            // fix for when alerts-service is not available (e.g. SUSE)
            var alertWin = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                .getService(Components.interfaces.nsIWindowWatcher)
                .openWindow(null, "chrome://global/content/alerts/alert.xul",
                            "_blank", "chrome,titlebar=no,popup=yes", null);
            alertWin.arguments = [img, title, text, false, ""];
            alertWin.setTimeout(function(){alertWin.close()},5000);
        }
    } catch (e) {
        if (alertError) {
            alert(e);
        }
    }
}

// mac only
function foxtrick_showAlertGrowl(text, alertError) {
	try {
		var grn = Components.classes["@growl.info/notifications;1"].getService(Components.interfaces.grINotifications);
		var img = "http://hattrick.org/favicon.ico";
		var title = "Hattrick.org";
		grn.sendNotification("Hattrick.org (Foxtrick)", img, title, text, "", null);
	} catch (e) {
		if (alertError) {
			alert(e);
		}
	}
}

function foxtrick_openDirectory(dir) {
  try {
	dir.QueryInterface(Components.interfaces.nsILocalFile).launch();
  }
  catch (e) {
  	alert(e);
  }
}

function foxtrick_selectFile() {
	var fp = Components.classes['@mozilla.org/filepicker;1'].createInstance(Components.interfaces.nsIFilePicker);
	fp.init(window, "", fp.modeOpen);
	if (fp.show() == fp.returnOK ) {
		return fp.file.path;
	}
	return null; 
}
