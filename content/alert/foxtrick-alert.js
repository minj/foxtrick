/**
 * foxtrick-alert.js
 * give a growl notification on news ticker
 * @author taised, convincedd
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickAlert = {
	MODULE_NAME : "FoxtrickAlert",
	MODULE_CATEGORY : Foxtrick.moduleCategories.ALERT,
	OPTIONS : ["AlertSound"],
	OPTION_TEXTS : true,
	OPTION_TEXTS_DISABLED_LIST : [true, true, false, true, true],
	OPTION_TEXTS_LOAD_BUTTONS : [false, false, true, false, false],

	news : [],
	alertWin:null,
	ALERTS: new Array(),
	last_num_message:0,
	last_num_forum:0,

	init : function() {
		Foxtrick.registerAllPagesHandler( FoxtrickAlert );
		if (Foxtrick.BuildFor=='Gecko') {
			FoxtrickAlert.news[0] = null;
			FoxtrickAlert.news[1] = null;
			FoxtrickAlert.news[2] = null;
		}
	},

	run : function( doc ) {
		if (Foxtrick.BuildFor == "Gecko") {
			if (this.alertWin)
				this.closeAlert(true);

			// get a tab with hattrick
			var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
			   .getService(Components.interfaces.nsIWindowMediator);
			var mainWindow = wm.getMostRecentWindow("navigator:browser");
			FoxtrickAlert.foxtrick_showAlert.tab = mainWindow.getBrowser().selectedTab;

			FoxtrickAlert.checkAll( doc );
		}
	},

	checkAll : function( doc ) {
		// check new, mail and forum after pageload and show alerts if needed
		if (doc.getElementById('hattrick')) FoxtrickAlert.checkNews(doc);

		// add watch to ticker
		var ticker = doc.getElementById('ticker');
		if (ticker) {
			doc.getElementById('ticker').addEventListener("DOMSubtreeModified", FoxtrickAlert.checkNewsEvent, true ) ;
		}
	},

	checkNewsEvent : function(evt) {
		var doc = evt.target.ownerDocument;
		FoxtrickAlert.checkNews(doc);
	},

	checkNews : function(doc) {
		var tickerdiv = doc.getElementById('ticker').getElementsByTagName('div');
		var message="";
		var href="";
		var elemText = new Array();
		//getting text
		var numunreadticker=0;
		for (var i=0; i<tickerdiv.length;i++)
		{
			var tickelem=tickerdiv[i].firstChild.firstChild;
			if (tickelem.nodeType!=tickelem.TEXT_NODE)
			{
				//there is the strong tag
				numunreadticker++;
				elemText[i]=tickelem.firstChild.nodeValue;
				message=tickelem.firstChild.nodeValue;
				href=tickerdiv[i].getElementsByTagName('a')[0].href;
				//Foxtrick.dump(message+'\t'+href+'\n');
				var isequal = false;
				for (var j=0;j<=3;j++)
				{
					if (elemText[i]==FoxtrickAlert.news[j])
						isequal=true;
				}
				if (!isequal) {
					FoxtrickAlert.ALERTS.push({'message':message,'href':href});	Foxtrick.dump('->add ticker alert to list. in list:'+FoxtrickAlert.ALERTS.length+'\n');
				}
			}
			else {
				elemText[i]=tickelem.nodeValue;
			}
		}
		for (var i=0; i<tickerdiv.length;i++) {
			FoxtrickAlert.news[i]=elemText[i];
		}
		FoxtrickAlert.foxtrick_showAlert(false);
	},

	foxtrick_showAlert: function() {
		try {
	 		if (FoxtrickAlert.ALERTS.length == 0)
	 			return;

			var num_alerts = FoxtrickAlert.ALERTS.length;
			var alert = FoxtrickAlert.ALERTS.pop();
			var message = alert.message;
			var href = alert.href;

			// custom turned off?
			if (Foxtrick.isModuleEnabled(FoxtrickAlertCustomOff)) {
				for (var i=0; i<FoxtrickAlertCustomOff.OPTIONS.length; ++i) {
					var url = FoxtrickAlertCustomOff.urls[i];
					if (href.search(url) != -1 && Foxtrick.isModuleFeatureEnabled( FoxtrickAlertCustomOff, FoxtrickAlertCustomOff.OPTIONS[i])) {
						FoxtrickAlert.foxtrick_showAlert(true); // show next
						return;
					}
				}
			}

			Foxtrick.util.notify.create(message, href);

			if (Foxtrick.isModuleFeatureEnabled(this, "AlertSound")) {
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
					if (!play_custom)
						Foxtrick.playSound(FoxtrickPrefs.getString("module." + this.MODULE_NAME + ".AlertSound_text"));
				}
				catch (e) {
					Foxtrick.dumpError(e);
				}
			}
		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	closeAlert: function(page_changed) {
	}
};
