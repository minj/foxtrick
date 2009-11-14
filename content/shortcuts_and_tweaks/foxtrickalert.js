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
	NEW_AFTER_VERSION: "0.4.9",
	LATEST_CHANGE:"Adding option new forum message alert",
    LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	OPTIONS : new Array("NewMail","NewForum"), 
	
	alertWin:null,
	ALERTS: new Array(),
	ALERT_RUNNING:false,
	last_num_message:0,
	last_num_forum:0,
	
    init : function() {
        Foxtrick.registerAllPagesHandler( FoxtrickAlert );
        Foxtrick.news[0] = null;
        Foxtrick.news[1] = null;
        Foxtrick.news[2] = null;
    },

    run : function( doc ) {  
    	try {  
			if (this.alertWin) this.closeAlert(true);
			FoxtrickAlert.foxtrick_showAlert.window = doc.defaultView; 
			FoxtrickAlert.foxtrick_showAlert.document = doc;
            var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
                   .getService(Components.interfaces.nsIWindowMediator);
			var mainWindow = wm.getMostRecentWindow("navigator:browser");
			FoxtrickAlert.foxtrick_showAlert.tab = mainWindow.getBrowser().selectedTab;
			
			FoxtrickAlert.ALERT_RUNNING = false;
			
			// check new, mail and forum after pageload and show alerts if needed
			if (doc.getElementById('hattrick')) FoxtrickAlert.checkNews(false);
            if (doc.getElementById('hattrickNoSupporter')) FoxtrickAlert.showMailAlert(doc);								

            // add watch to ticker
			var ticker = doc.getElementById('ticker');
			if (ticker) {
				doc.getElementById('ticker').addEventListener("DOMSubtreeModified", FoxtrickAlert.checkNews, true ) ;          
			}

			} catch (e) {
            Foxtrick.dump('FoxtrickAlert.js run: '+e);
        }
    },
	
	change : function( page, doc ) {	
	},
		
    showMailAlert : function(doc) {
   	try { 		
		var message;
		var  menu = doc.getElementById('menu');
		message = menu.getElementsByTagName('a')[0].getElementsByTagName('span')[0];
		if (message && Foxtrick.isModuleFeatureEnabled( this, "NewMail" ) ) { 
				var num_message = parseInt(message.innerHTML.replace(/\(|\)/g,''));
				//Foxtrick.dump(message.innerHTML+' num_message '+num_message +' last_num_message: '+ FoxtrickAlert.last_num_message+'\n');
				if (num_message > FoxtrickAlert.last_num_message) {
						
						var message = String(parseInt(num_message-FoxtrickAlert.last_num_message))+' '+Foxtrickl10n.getString( "foxtrick.newmailtoyou");
						if (FoxtrickPrefs.getBool("alertSlider")) {
							FoxtrickAlert.ALERTS.push({'message':message,'href':'http://'+FoxtrickAlert.foxtrick_showAlert.window.document.location.hostname + "/MyHattrick/Inbox/Default.aspx"});Foxtrick.dump('->add MailAlert to list. in list:'+FoxtrickAlert.ALERTS.length+'\n');
						}
						if (FoxtrickPrefs.getBool("alertSliderGrowl")) {
							FoxtrickAlert.foxtrick_showAlertGrowl(message);
						}											
					}	
				FoxtrickAlert.last_num_message = num_message;
			}
		else FoxtrickAlert.last_num_message=0;
		
		var forum = menu.getElementsByTagName('a')[3];
		var numforum = forum.innerHTML.match(/\d+/);
		if (numforum && Foxtrick.isModuleFeatureEnabled( this, "NewForum" )) { 
			if (numforum > FoxtrickAlert.last_num_forum && doc.location.pathname.search(/\/Forum\/Default.aspx/)==-1) {
				var message = String(parseInt(numforum-FoxtrickAlert.last_num_forum))+' '+Foxtrickl10n.getString( "foxtrick.newforumtoyou");
				if (FoxtrickPrefs.getBool("alertSlider")) {
					FoxtrickAlert.ALERTS.push({'message':message,'href':'http://'+FoxtrickAlert.foxtrick_showAlert.window.document.location.hostname + "/Forum/Default.aspx?actionType=refresh"});Foxtrick.dump('->add MailAlert to list. in list:'+FoxtrickAlert.ALERTS.length+'\n');
				}
				if (FoxtrickPrefs.getBool("alertSliderGrowl")) {
					FoxtrickAlert.foxtrick_showAlertGrowl(message);
				}																					
			}
			FoxtrickAlert.last_num_forum = numforum;						
		}
		else FoxtrickAlert.last_num_forum=0;
		FoxtrickAlert.foxtrick_showAlert(false);
	} catch (e) {Foxtrick.dump('showMailAlert: '+e+'\n');}
	},
	
    checkNews : function(evt) {
       try {   
	    Foxtrick.dump('checkNews\n');
		if (evt) {
			var tickerdiv=evt.originalTarget;
			tickerdiv=tickerdiv.getElementsByTagName('div');
		}
		else {
			var doc = FoxtrickAlert.foxtrick_showAlert.document;
			var tickerdiv=doc.getElementById('ticker').getElementsByTagName('div');
		}
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
					href=tickerdiv[i].getElementsByTagName('a')[0].href; 
					Foxtrick.dump(message+'\t'+href+'\n');
					var isequal = false;
					for (var j=0;j<=3;j++)
					{
						if (elemText[i]==Foxtrick.news[j])
							isequal=true;
					}	
                    if (!isequal) {
						if (FoxtrickPrefs.getBool("alertSlider")) {		
							FoxtrickAlert.ALERTS.push({'message':message,'href':href});	Foxtrick.dump('->add ticker alert to list. in list:'+FoxtrickAlert.ALERTS.length+'\n');			
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
        } catch(e) { Foxtrick.dump('error checkNews '+e); }
    },

    foxtrick_showAlert: function( from_timer) { 
     try{ 
	    var window = FoxtrickAlert.foxtrick_showAlert.window;
		/*Foxtrick.dump('\n -- foxtrick_showAlert --\n');
		try {Foxtrick.dump('location: '+window.location.href+'\n');}
		catch(e){Foxtrick.dump('window propertiy not available\n');}
		Foxtrick.dump(' called from timer: '+from_timer+'\n');
		Foxtrick.dump(' one alert is showing, dont execute double: '+String(!from_timer && FoxtrickAlert.ALERT_RUNNING) +'\n');
		Foxtrick.dump(' messages to show: '+FoxtrickAlert.ALERTS.length+'\n');
		Foxtrick.dump(' last_num_mail: '+FoxtrickAlert.last_num_message+'\n');
		*/
 		if (!from_timer && FoxtrickAlert.ALERT_RUNNING) {/*Foxtrick.dump('alert runing->return \n');*/return;}
		FoxtrickAlert.ALERT_RUNNING = true;
		if ( FoxtrickAlert.ALERTS.length==0) { /*Foxtrick.dump('no more alerts->return\n');*/ FoxtrickAlert.ALERT_RUNNING = false; return;}	
		
		var num_alerts = FoxtrickAlert.ALERTS.length;
		var alert = FoxtrickAlert.ALERTS.pop(); 
        var text = alert.message;  
        var href = alert.href;
		
		// custom turned off?
		if (Foxtrick.isModuleEnabled(FoxtrickAlertCustomOff)) {
			for (var i=0; i<FoxtrickAlertCustomSounds.OPTIONS.length; ++i) {
				var url = FoxtrickAlertCustomSounds.urls[i];
				if (href.search(url) != -1 && Foxtrick.isModuleFeatureEnabled( FoxtrickAlertCustomOff, FoxtrickAlertCustomSounds.OPTIONS[i]))
					FoxtrickAlert.foxtrick_showAlert(true); // show next
					return;
			}
		}
						
        var img = "http://hattrick.org/favicon.ico";
        var title = "Hattrick.org";
		var clickable = true;
        var listener = { observe:
                function(subject, topic, data) {
                    try{ Foxtrick.dump('callback: '+topic+'\n');
						if (topic=="alertclickcallback") {
							Foxtrick.dump('alertclickcallback:' +'link to: '+data+'\n');
							var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
									.getService(Components.interfaces.nsIWindowMediator);
							FoxtrickAlert.openAndReuseOneTabPerURL(href);
						}						
						if (topic=="alertfinished") {
							FoxtrickAlert.foxtrick_showAlert(true);
						}
					} catch(e){Foxtrick.dump('alertcallback: '+e+'\n');}
                }
		};
    		
		try { 
                FoxtrickAlert.alertWin = Components.classes["@mozilla.org/alerts-service;1"].getService(Components.interfaces.nsIAlertsService);
                FoxtrickAlert.alertWin.showAlertNotification(img, title, text, clickable, href, listener);
				//Foxtrick.dump('ticker: using alerts-service\n');			
		} catch (e) { 
                // fix for when alerts-service is not available (e.g. SUSE)
                FoxtrickAlert.alertWin = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
                    .getService(Components.interfaces.nsIWindowWatcher)
                    .openWindow(null, "chrome://global/content/alerts/alert.xul",
                                "_blank", "chrome,titlebar=no,popup=yes", null);
                FoxtrickAlert.alertWin.arguments = [img, "www.hattrick.org", text, clickable, href,0,listener];
				Foxtrick.dump('ticker: using fallback alert.xul\n');			            
            }
    } catch (e) { 
            Foxtrick.dump('foxtrick_showAlert'+e);
    }
		if (FoxtrickPrefs.getBool("alertSound")) {
			try {
				var play_custom = false;
				if (Foxtrick.isModuleEnabled(FoxtrickAlertCustomSounds)) {
					for (var i=0; i<FoxtrickAlertCustomSounds.OPTIONS.length; ++i) {
						if (Foxtrick.isModuleFeatureEnabled( FoxtrickAlertCustomSounds, FoxtrickAlertCustomSounds.OPTIONS[i])) {
							var url = FoxtrickAlertCustomSounds.urls[i];
							if (href.search(url) != -1) {
								var sound = FoxtrickPrefs.getString("module." + FoxtrickAlertCustomSounds.MODULE_NAME + "." + FoxtrickAlertCustomSounds.OPTIONS[i]+"_text"); 
								Foxtrick.playSound(sound);
								play_custom=true;
								break;
							}
						}
					}
				}
				if (!play_custom) Foxtrick.playSound(FoxtrickPrefs.getString("alertSoundUrl"));				
			} catch (e) { Foxtrick.dump('playsound: '+e);}
		}
    },
	
	closeAlert: function(page_changed) { 
		try{
			//FoxtrickAlert.alertWin.close();  
			//Foxtrick.dump('force close ticker. page_changed:'+page_changed+'\n'); 
		} catch(e) {
			//Foxtrick.dump('error force closing  alertWin :'+e+'\n');
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

