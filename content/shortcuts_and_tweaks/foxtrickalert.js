/**
 * foxtrickalert.js
 * give a growl notification on news ticker
 * @author taised
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickAlert = {

    MODULE_NAME : "FoxtrickAlert",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    DEFAULT_ENABLED : true,
    news : {},
    
    init : function() {
        Foxtrick.registerAllPagesHandler( FoxtrickAlert );
        this.news[0] = null;
        this.news[1] = null;
        this.news[2] = null;
    },

    run : function( doc ) {
    	try {
            Foxtrick.addJavaScript(doc, "chrome://foxtrick/content/resources/js/newsticker.js");
            doc.getElementById('ticker').addEventListener("FoxtrickTickerEvent", FoxtrickAlert.showAlert, false, true ) ;
        } catch (e) {
            Foxtrick.LOG('FoxtrickAlert.js run: '+e);
        }
    },
    
    showAlert : function(evt)
    {
        var tickerdiv=evt.originalTarget;
        tickerdiv=tickerdiv.getElementsByTagName('div');
        try {
              var message=null;
              var elemText=new Array();
              //getting text
              for (i=0;i<tickerdiv.length;i++)
              {
                  var tickelem=tickerdiv[i].firstChild.firstChild;
                  if (tickelem.nodeType!=tickelem.TEXT_NODE)
                  {
                      //there is the strong tag
                      elemText[i]=tickelem.firstChild.nodeValue;
                      message=tickelem.firstChild.nodeValue;
                  }
                  else
                  {
                      elemText[i]=tickelem.nodeValue;
                  }
              }
              
              //Now checking if we haven't already sent the alert
              if (message != null)
              {
              	  var isequal=true;
                  for (i=0;i<tickerdiv.length;i++)
                  {
                      if (elemText[i]!=FoxtrickAlert.news[i])
                          isequal=false;
                      FoxtrickAlert.news[i]=elemText[i];
                  }
                  if (isequal)
                      message=null;
              }
              
              if (message != null) {
                //if (tmp[1] != "myHattrick.asp") {
                  if (FoxtrickPrefs.getBool("alertSlider")) {
                      FoxtrickAlert.foxtrick_showAlert(message);
                  }
                  if (FoxtrickPrefs.getBool("alertSliderGrowl")) {
                      FoxtrickAlert.foxtrick_showAlertGrowl(message);
                  }
                  if (FoxtrickPrefs.getBool("alertSound")) {
                     try {
                       Foxtrick.playSound(FoxtrickPrefs.getString("alertSoundUrl"));
                     } catch (e) {
                       Foxtrick.LOG('playsound: '+e);
                     }
                  }
                //}
              }
            } catch(e) { Foxtrick.LOG('error showalert '+e); }
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
            Foxtrick.LOG(e);
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
    		Foxtrick.LOG(e);
    	}
    }
};