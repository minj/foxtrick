/**
 * foxtrickalert.js
 * give a growl notification on news ticker
 * @author taised
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickAlert = {
    
    init : function() {
        Foxtrick.registerPageHandler( 'bookmarks',
                                      FoxtrickAlert );
    },

    run : function( page ) {

        var doc = Foxtrick.current_doc;
        
        //STILL NOT WORKING
        /*try {
          var expreg = new RegExp ( 'href="(.*)" target="main" class="messBold">(.+)</a>', "igm" );
          var scriptsrc = doc.getElementsByTagName("script")[0].text;
          
          var tmp = expreg.exec(scriptsrc);
          
          if (tmp != null) {
            if (tmp[1] != "myHattrick.asp") {
              if (PrefsBranch.getBoolPref("alertSlider")) {
                  FoxtrickAlert.foxtrick_showAlert(tmp[2]);
              }
              if (PrefsBranch.getBoolPref("alertSliderGrowl")) {
                  FoxtrickAlert.foxtrick_showAlertGrowl(tmp[2]);
              }
              if (PrefsBranch.getBoolPref("alertSound")) {
                 try {
                   FoxtrickAlert.foxtrick_playSound(PrefsBranch.getCharPref("alertSoundUrl"));
                 } catch (e) {
                   FoxtrickAlert.foxtrickdebug(e);
                 }
              }
            }
          }
        } catch(e) {}*/
        
    },

    foxtrick_showAlert: function(text, alertError) {
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
            FoxtrickAlert.foxtrickdebug(e);
        }
    },
    
    
    foxtrick_showAlertGrowl: function(text, alertError) {
    	// mac only
    	try {
    		var grn = Components.classes["@growl.info/notifications;1"].getService(Components.interfaces.grINotifications);
    		var img = "http://hattrick.org/favicon.ico";
    		var title = "Hattrick.org";
    		grn.sendNotification("Hattrick.org (Foxtrick)", img, title, text, "", null);
    	} catch (e) {
    		FoxtrickAlert.foxtrickdebug(e);
    	}
    },
    
    foxtrick_playSound: function(url) {
      try {
        var soundService = Components.classes["@mozilla.org/sound;1"].getService(Components.interfaces.nsISound);
        var ioService = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
        soundService.play(ioService.newURI(url, null, null));
      } catch (e) {
        FoxtrickAlert.foxtrickdebug(e);
      }
    },
    
    foxtrickdebug: function(e) {
      Components.utils.reportError(e);
    }
};