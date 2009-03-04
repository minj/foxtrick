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
    OPTIONS : new Array("NewMail"), 
	
	ALERTS: new Array(),
	ALERT_RUNNING:false,
	last_num_message:0,
    
    init : function() {
        Foxtrick.registerAllPagesHandler( FoxtrickAlert );
        Foxtrick.news[0] = null;
        Foxtrick.news[1] = null;
        Foxtrick.news[2] = null;
    },

    run : function( doc ) {
    	try { 
			FoxtrickAlert.foxtrick_showAlert.window = doc.defaultView; 
			FoxtrickAlert.ALERT_RUNNING = false;
			FoxtrickAlert.foxtrick_showAlert(doc.defaultView, false);
        
	
            Foxtrick.addJavaScript(doc, "chrome://foxtrick/content/resources/js/newsticker.js");
            doc.getElementById('ticker').addEventListener("FoxtrickTickerEvent", FoxtrickAlert.showAlert, false, true ) ;
            if (Foxtrick.isModuleFeatureEnabled( this, "NewMail" ) ) {
					doc.getElementById('menu').addEventListener("FoxtrickMailEvent", FoxtrickAlert.showMailAlert, false, true ) ;       
			}
		} catch (e) {
            dump('FoxtrickAlert.js run: '+e);
        }
    },
	
	change : function( page, doc ) {
	
	},
	
    showMailAlert : function(evt) {
   	try { 		
		var message = evt.originalTarget.getElementsByTagName('a')[0].getElementsByTagName('span')[0];
		if (message) { 
				var num_message = parseInt(message.innerHTML.replace(/\(|\)/g,''));
				if (num_message > FoxtrickAlert.last_num_message) {
						
						var message = String(parseInt(num_message-FoxtrickAlert.last_num_message))+' '+Foxtrickl10n.getString( "foxtrick.newmailtoyou");
						if (FoxtrickPrefs.getBool("alertSlider")) {
							FoxtrickAlert.ALERTS.push(message);dump('->add MailAlert to list. in list:'+FoxtrickAlert.ALERTS.length+'\n');
						}
						if (FoxtrickPrefs.getBool("alertSliderGrowl")) {
							FoxtrickAlert.foxtrick_showAlertGrowl(message);
						}											
					}	
				FoxtrickAlert.last_num_message = num_message;
			}
		FoxtrickAlert.foxtrick_showAlert(false);
	} catch (e) {dump ('showMailAlert: '+e+'\n');}
	},
	
    showAlert : function(evt)
    {   try {
        var tickerdiv=evt.originalTarget;
        tickerdiv=tickerdiv.getElementsByTagName('div');
            var message=null;
            var elemText = new Array();
            //getting text
            for (i=0; i<tickerdiv.length;i++)
            {
				var tickelem=tickerdiv[i].firstChild.firstChild;
                if (tickelem.nodeType!=tickelem.TEXT_NODE)
                {
                    //there is the strong tag
					elemText[i]=tickelem.firstChild.nodeValue;
                    message=tickelem.firstChild.nodeValue;
					var isequal = true;
					for (j=0;j<=i;j++)
					{
						if (elemText[j]!=Foxtrick.news[j])
							isequal=false;
						Foxtrick.news[j]=elemText[j];
                    }
                    if (!isequal) {
						if (FoxtrickPrefs.getBool("alertSlider")) {		
							FoxtrickAlert.ALERTS.push(message);	dump('->add ticker alert to list. in list:'+FoxtrickAlert.ALERTS.length+'\n');			
						}
						if (FoxtrickPrefs.getBool("alertSliderGrowl")) {
							FoxtrickAlert.foxtrick_showAlertGrowl(message);
						}						
					}
                } else {
					elemText[i]=tickelem.nodeValue;
				}
            } 				
			FoxtrickAlert.foxtrick_showAlert(window, false);
        } catch(e) { dump('error showalert '+e); }
    },

    foxtrick_showAlert: function( from_timer) { 
     try{ 
	    var window = FoxtrickAlert.foxtrick_showAlert.window;
		dump (' -- foxtrick_showAlert --\n');
		try {dump('location: '+window.location.href+'\n');}
		catch(e){dump('window propertiy not available\n');}
		dump(' called from timer: '+from_timer+'\n');
		dump (' one alert is showing, dont execute double: '+String(!from_timer && FoxtrickAlert.ALERT_RUNNING) +'\n');
		dump (' messages to show: '+FoxtrickAlert.ALERTS.length+'\n\n');
		
 		if (!from_timer && FoxtrickAlert.ALERT_RUNNING) return;
		FoxtrickAlert.ALERT_RUNNING = true;
		if ( FoxtrickAlert.ALERTS.length==0) { FoxtrickAlert.ALERT_RUNNING = false; return;}	
		var text = FoxtrickAlert.ALERTS.pop(); 
        var img = "http://hattrick.org/favicon.ico";
        var title = "Hattrick.org";
				
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
				var timeout = window.setTimeout(FoxtrickAlert.foxtrick_showAlert,8000,true);
				
            } catch (e) { 
                // fix for when alerts-service is not available (e.g. SUSE)
                var alertWin = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                    .getService(Components.interfaces.nsIWindowWatcher)
                    .openWindow(null, "chrome://global/content/alerts/alert.xul",
                                "_blank", "chrome,titlebar=no,popup=yes", null);
                alertWin.arguments = [img, title, text, false, ""];
                window.setTimeout( function(){alertWin.close();}, 5000 );
				var timeout = window.setTimeout(FoxtrickAlert.foxtrick_showAlert,8000,true);			
            }
        } catch (e) { 
            dump('foxtrick_showAlert'+e);
        }
		if (FoxtrickPrefs.getBool("alertSound")) {
			try {
				Foxtrick.playSound(FoxtrickPrefs.getString("alertSoundUrl"));
			} catch (e) {
				Foxtrick.LOG('playsound: '+e);
			}
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
		if (FoxtrickPrefs.getBool("alertSound")) {
			try {
				Foxtrick.playSound(FoxtrickPrefs.getString("alertSoundUrl"));
			} catch (e) {
				Foxtrick.LOG('playsound: '+e);
			}
		}
    }
};
