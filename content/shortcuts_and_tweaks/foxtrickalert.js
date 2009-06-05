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
	NEW_AFTER_VERSION: "0.4.8",
	LASTEST_CHANGE:"Clicking on alerts link to corresponding ticker event",
    OPTIONS : new Array("NewMail"), 
	
	alertWin:null,
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
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
			var mainWindow = wm.getMostRecentWindow("navigator:browser");
			FoxtrickAlert.foxtrick_showAlert.tab = mainWindow.getBrowser().selectedTab;
			
			FoxtrickAlert.ALERT_RUNNING = false;
			FoxtrickAlert.foxtrick_showAlert(false);
        
	        Foxtrick.addJavaScript(doc, "chrome://foxtrick/content/resources/js/newsticker.js");
            doc.getElementById('ticker').addEventListener("FoxtrickTickerEvent", FoxtrickAlert.showAlert, false, true ) ;
            if (Foxtrick.isModuleFeatureEnabled( this, "NewMail" ) ) {
					//doc.getElementById('menu').addEventListener("FoxtrickMailEvent", FoxtrickAlert.showMailAlert, false, true ) ;       
					FoxtrickAlert.showMailAlert(doc.getElementById('menu'));
					
			}
		} catch (e) {
            dump('FoxtrickAlert.js run: '+e);
        }
    },
	
	change : function( page, doc ) {
	
	},
	
    showMailAlert : function(evt) {
   	try { 		
		var message;
		if (evt.getAttribute('id')=='menu') message = evt.getElementsByTagName('a')[0].getElementsByTagName('span')[0];
		else message = evt.originalTarget.getElementsByTagName('a')[0].getElementsByTagName('span')[0];
		if (message) { 
				var num_message = parseInt(message.innerHTML.replace(/\(|\)/g,''));
				//dump (message.innerHTML+' num_message '+num_message +' last_num_message: '+ FoxtrickAlert.last_num_message+'\n');
				if (num_message > FoxtrickAlert.last_num_message) {
						
						var message = String(parseInt(num_message-FoxtrickAlert.last_num_message))+' '+Foxtrickl10n.getString( "foxtrick.newmailtoyou");
						if (FoxtrickPrefs.getBool("alertSlider")) {
							FoxtrickAlert.ALERTS.push({'message':message,'href':'http://'+FoxtrickAlert.foxtrick_showAlert.window.document.location.hostname + "/MyHattrick/Inbox/Default.aspx"});dump('->add MailAlert to list. in list:'+FoxtrickAlert.ALERTS.length+'\n');
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
            var message="";
			var href="";
            var elemText = new Array();
            //getting text
            for (var i=0; i<tickerdiv.length;i++)
            {
				var tickelem=tickerdiv[i].firstChild.firstChild;
                if (tickelem.nodeType!=tickelem.TEXT_NODE)
                {
                    //there is the strong tag
					elemText[i]=tickelem.firstChild.nodeValue;
                    message=tickelem.firstChild.nodeValue;
					href=tickelem.parentNode.href; 
					var isequal = false;
					for (var j=0;j<=3;j++)
					{
						if (elemText[i]==Foxtrick.news[j])
							isequal=true;
					}	
                    if (!isequal) {
						if (FoxtrickPrefs.getBool("alertSlider")) {		
							FoxtrickAlert.ALERTS.push({'message':message,'href':href});	dump('->add ticker alert to list. in list:'+FoxtrickAlert.ALERTS.length+'\n');			
						}
						if (FoxtrickPrefs.getBool("alertSliderGrowl")) {
							FoxtrickAlert.foxtrick_showAlertGrowl(message);
						}						
					}
                } else {
					elemText[i]=tickelem.nodeValue;
				}
            } 				
            for (var i=0; i<tickerdiv.length;i++)
            {
			    Foxtrick.news[i]=elemText[i];
			}
			FoxtrickAlert.foxtrick_showAlert(false);
        } catch(e) { dump('error showalert '+e); }
    },

    foxtrick_showAlert: function( from_timer) { 
     try{ 
	    var window = FoxtrickAlert.foxtrick_showAlert.window;
	/*	dump (' -- foxtrick_showAlert --\n');
		try {dump('location: '+window.location.href+'\n');}
		catch(e){dump('window propertiy not available\n');}
		dump(' called from timer: '+from_timer+'\n');
		dump (' one alert is showing, dont execute double: '+String(!from_timer && FoxtrickAlert.ALERT_RUNNING) +'\n');
		dump (' messages to show: '+FoxtrickAlert.ALERTS.length+'\n');
		dump (' last_num_mail: '+FoxtrickAlert.last_num_message+'\n\n');
	*/	
 		if (!from_timer && FoxtrickAlert.ALERT_RUNNING) return;
		FoxtrickAlert.ALERT_RUNNING = true;
		if ( FoxtrickAlert.ALERTS.length==0) { FoxtrickAlert.ALERT_RUNNING = false; return;}	
		var alert = FoxtrickAlert.ALERTS.pop(); 
        var text = alert.message;  
        var href = alert.href;		
        var img = "http://hattrick.org/favicon.ico";
        var title = "Hattrick.org";
		var clickable = true;
        var listener = { observe:
                    function(subject, topic, data) {
                        try{
						if (topic=="alertclickcallback") {
							dump('alertclickcallback:' +'link to: '+data+'\n');
							var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
									.getService(Components.interfaces.nsIWindowMediator);
							FoxtrickAlert.openAndReuseOneTabPerURL(href);
					}
						}catch(e){dump('alertclickcallback: '+e+'\n');}
                    }
        };
    		
            try { 
                var alertsService = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
                alertsService.showAlertNotification(img, title, text, clickable, href, listener);
				var timeout = window.setTimeout(FoxtrickAlert.foxtrick_showAlert,8000,true);				
            } catch (e) { 
                // fix for when alerts-service is not available (e.g. SUSE)
                FoxtrickAlert.alertWin = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                    .getService(Components.interfaces.nsIWindowWatcher)
                    .openWindow(null, "chrome://global/content/alerts/alert.xul",
                                "_blank", "chrome,titlebar=no,popup=yes", null);
                FoxtrickAlert.alertWin.arguments = [img, title, text, clickable, href,0,listener];
                var timeout = window.setTimeout(FoxtrickAlert.foxtrick_showAlert,8000,true);	// show next alert		
				var timeout2 = window.setTimeout( FoxtrickAlert.closeAlert, 10000 ); 			// fallback to close after 10 secs 	
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
	
	closeAlert: function() {
		FoxtrickAlert.alertWin.close();    
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
    },
	
// find first occurence of host and open+focus there
 openAndReuseOneTabPerURL : function(url) {
  var host = url.match(/(http:\/\/[a-zA-Z0-9_.]+)/)[1];
  
  var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                     .getService(Components.interfaces.nsIWindowMediator);
  var browserEnumerator = wm.getEnumerator("navigator:browser");

  // Check each browser instance for our URL
  var found = false;
  while (!found && browserEnumerator.hasMoreElements()) {
    var browserWin = browserEnumerator.getNext();
    var tabbrowser = browserWin.getBrowser();

    // Check each tab of this browser instance
    var numTabs = tabbrowser.browsers.length;
    for(var index=0; index<numTabs; index++) {
      var currentBrowser = tabbrowser.getBrowserAtIndex(index); 
      if (currentBrowser.currentURI.spec.search(host)!=-1) 
		{

        // The URL is already opened. Select this tab.
        tabbrowser.selectedTab = tabbrowser.mTabs[index];

        // Focus *this* browser-window
		browserWin.loadURI(url )
        browserWin.focus();

        found = true;
        break;
      }
    }
  }

  // Our URL isn't open. Open it now.
  if (!found) {
    var recentWindow = wm.getMostRecentWindow("navigator:browser");
    if (recentWindow) {
      // Use an existing browser window
      recentWindow.delayedOpenTab(url, null, null, null, null);
    }
    else {
      // No browser windows are open, so open a new one.
      window.open(url);
    }
  }
},

};

