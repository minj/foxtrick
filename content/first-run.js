/**
 * first-run.js
 * MyHT message after new foxtrick version
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickFirstRun = {

	MODULE_NAME : "FoxtrickFirstRun",
	PAGES : new Array('myhattrick_late'),
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION : "0.5.2.1",
	LATEST_CHANGE : "Renamed module to FoxtrickFirstRun",

	NewModules: null,

	run : function(page, doc) {
		try {
			if (FoxtrickMain.IsNewVersion) {
				// uncomment to see it always for testing purposes
				var curVersion = FoxtrickPrefs.getString("curVersion");
				FoxtrickPrefs.setString("oldVersion",curVersion);

				// set some special defaults
				this.setDefaults(doc);

				// show foxtrickMyHT
				this.ShowAlert(doc);
			}
		}
		catch (e) {
			FoxTrick.dumpError(e);
		}
	},

	setDefaults :function(doc) {

		// set radio defaults as by appropriate countries
		Foxtrick.dump('No9:'+FoxtrickPrefs.getBool('module.ExtraShortcuts.No9.enabled')+'\n');
		Foxtrick.dump('Latehome:'+FoxtrickPrefs.getBool('module.ExtraShortcuts.Latehome.enabled')+'\n');

		var country = FoxtrickPrefs.getString("htCountry");
		if (FoxtrickPrefs.getBool('module.ExtraShortcuts.HtRadio.enabled')===null) {
			if (country==='Belgium' || country==='Netherlands') {
				FoxtrickPrefs.setBool('module.ExtraShortcuts.HtRadio.enabled',true)
				Foxtrick.dump('HtRadio enabled\n');
			}
			else FoxtrickPrefs.setBool('module.ExtraShortcuts.HtRadio.enabled',false)
		}
		if (FoxtrickPrefs.getBool('module.ExtraShortcuts.No9.enabled')===null) {
			if (country==='Germany') {
				FoxtrickPrefs.setBool('module.ExtraShortcuts.No9.enabled',true)
				Foxtrick.dump('No9 enabled\n');
			}
			else FoxtrickPrefs.setBool('module.ExtraShortcuts.No9.enabled',false)
		}
		if (FoxtrickPrefs.getBool('module.ExtraShortcuts.Latehome.enabled')===null) {
			if (country==='Germany' || country==='Austria') {
				FoxtrickPrefs.setBool('module.ExtraShortcuts.Latehome.enabled',true)
				Foxtrick.dump('Latehome enabled\n');
			}
			else FoxtrickPrefs.setBool('module.ExtraShortcuts.Latehome.enabled',false)
		}
	},

	ShowAlert :function(doc) {
		try {
			var mainBody = doc.getElementById('mainBody');

			var alertdiv=doc.createElement('div');
			alertdiv.setAttribute('id','idFoxtrickPrefsOuter');
			alertdiv.setAttribute('class','alert');
			alertdiv.setAttribute('style','margin-top:20px; margin-bottom:20px; border: solid 1px #2F31FF !important; background-color: #EFEFFF !important;');
			mainBody.insertBefore(alertdiv,mainBody.firstChild);

			var curVersion=FoxtrickPrefs.getString("curVersion");
			alertdiv.innerHTML = "<h2 style='background-color:#EFEFFF; text-align:center !important; color:#2F31FF !important; font-size:1.1em; '>FoxTrick "+curVersion+"</h2>";

			var commondiv=doc.createElement('div');
			commondiv.setAttribute('id','FoxtrickFirstRunCommon');
			alertdiv.appendChild(commondiv);

			// release note.
			var p=doc.createElement('p');
			p.id='ft_releasenotesid';
			/* linked ht-foxtrick version: as we don't make then now-> disabled
			p.appendChild(doc.createTextNode(Foxtrickl10n.getString("FoxtrickFirstRunReleaseNotes")));
			p.appendChild(doc.createTextNode(" "));
			var a=doc.createElement('a');
			a.href=Foxtrickl10n.getString("FoxtrickFirstRunReleaseNotesLink");
			a.innerHTML=Foxtrickl10n.getString("FoxtrickFirstRunReleaseNotesLink");
			a.target="_blank";
			p.appendChild(a);*/

			try {
				var file = Foxtrick.ResourcePath+'releaseNotes.xml';
				var req = new XMLHttpRequest();
				req.open('GET', file, false);
				req.send(null);
				if (req.status == 0) {
					var notesDOM = doc.createElement('dummy');
					notesDOM.innerHTML = req.responseText;
					var version = notesDOM.getElementsByTagName('version')[0].innerHTML;
					try {
						var file = Foxtrick.ResourcePath+'locale/'+FoxtrickPrefs.getString("htLanguage")+'/releaseNotes.xml';
						var req = new XMLHttpRequest();
						req.open('GET', file, false);
						req.send(null);
						if (req.status == 0) {
							var notesDOMlocale = doc.createElement('dummy');
							notesDOMlocale.innerHTML = req.responseText;
							var version_locale = notesDOMlocale.getElementsByTagName('version')[0].innerHTML;
							if (version==version_locale) notesDOM = notesDOMlocale;
							else Foxtrick.dump('locale release notes out of date\n')
						}
					} catch(e) {Foxtrick.dump('locale release notes not available\n');}

					var title = notesDOM.getElementsByTagName('title');
					for (var i=0;i<title.length;++i) {
						p.appendChild(doc.createElement('br'));
						var b = doc.createElement('b');
						b.appendChild(doc.createTextNode(title[i].innerHTML));
						p.appendChild(b);
					}
					var lines = notesDOM.getElementsByTagName('lines');
					for (var i=0;i<lines.length;++i) {
						p.appendChild(doc.createElement('br'));
						p.appendChild(doc.createTextNode(lines[i].innerHTML));
					}
				}
				else Foxtrick.dump(' get '+file+' request failed. req.status='+req.status+'\n');
			} catch(e) {Foxtrick.dump('get '+file+' request failed'+e+'\n');}

			commondiv.appendChild(p);

			/*var p=doc.createElement('p');
			p.appendChild(doc.createTextNode(Foxtrickl10n.getString("FoxtrickFirstRunScreenshotList")));
			p.appendChild(doc.createTextNode(" "));
			var a=doc.createElement('a');
			a.href="http://gliglif.foundationhorizont.org/hattrick/index.html";
			a.innerHTML="http://gliglif.foundationhorizont.org/hattrick/index.html";
			a.target="_blank";
			p.appendChild(a);
			alertdiv.appendChild(p);*/

			/*var p=doc.createElement('p');
			p.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.ChangesTab")+': '));
			p.appendChild(doc.createTextNode(" "));
			var a=doc.createElement('a');
			a.href="/MyHattrick/?configure_foxtrick=true&category=changes";
			a.innerHTML="/MyHattrick/?configure_foxtrick=true&category=changes";
			a.target="_self";
			p.appendChild(a);
			commondiv.appendChild(p);


			alertdiv.appendChild(doc.createElement('br'));
			var p=doc.createElement('p');
			p.appendChild(doc.createTextNode(Foxtrickl10n.getString("FoxtrickFirstRunHint")));
			alertdiv.appendChild(p);
			*/

			// changes quick set repeat
			/*alertdiv.appendChild(doc.createElement('br'));
			var p=doc.createElement('p');
			var a=doc.createElement('a');
			a.href="javascript:void();";
			a.innerHTML='<strong>'+Foxtrickl10n.getString("FoxtrickFirstRunSetChanged")+'</strong>';
			Foxtrick.addEventListenerChangeSave(a, "click", FoxtrickFirstRun.ShowChanged, false );
			p.appendChild(a);

			var a=doc.createElement('a');
			a.href="javascript:void();";
			a.innerHTML=Foxtrickl10n.getString("Close");
			Foxtrick.addEventListenerChangeSave(a, "click", FoxtrickFirstRun.Close, false );
			a.setAttribute('style','float:right');
			p.appendChild(a);

			commondiv.appendChild(p);*/

			FoxtrickFirstRun.ShowChanged(doc);

		}
		catch (e) {
			Foxtrick.dumpError(e);
		}
	},

	Close :function(ev){
		var doc = ev.target.ownerDocument;

		var mainBody = doc.getElementById('mainBody');
		var oldAlert=doc.getElementById('idFoxtrickPrefsOuter');
		if (oldAlert) mainBody.removeChild(oldAlert);

		/*var curVersion=FoxtrickPrefs.getString("curVersion");
		FoxtrickPrefs.setString("oldVersion",curVersion);	*/
		FoxtrickMain.IsNewVersion=false;
		Foxtrick.dump('FoxtrickFirstRun close\n');
	},

	sortfunction0: function(a,b) {return a.MODULE_NAME.localeCompare(b.MODULE_NAME);},
	sortfunction2: function(a,b) {return a.MODULE_CATEGORY.localeCompare(b.MODULE_CATEGORY);},
	sortfunction4: function(a,b) {return a.NEW_AFTER_VERSION.localeCompare(b.NEW_AFTER_VERSION);},

	ShowChanged: function(doc) {
		try{

		//var doc = ev.target.ownerDocument;

		Foxtrick.dump('FoxtrickFirstRun ShowChanged\n');
		FoxtrickMain.IsNewVersion=false;

		doc.addEventListener( "submit", FoxtrickOnPagePrefs.SubmitCapture, true );
		doc.addEventListener( "click", FoxtrickOnPagePrefs.ClickCapture, true );

		var FoxtrickFirstRunCommon = doc.getElementById('FoxtrickFirstRunCommon');
		//FoxtrickFirstRunCommon.style.display='none';

		var alertdivOuter = doc.getElementById('idFoxtrickPrefsOuter');
		var alertdiv=doc.createElement('div');
		alertdiv.setAttribute('id','idFoxtrickPrefs');
		alertdiv.setAttribute('style','border:1px solid #CCCCCC; padding:5px; margin-top:20px;');
		alertdivOuter.appendChild(alertdiv);

		var h2=doc.createElement('h2');
		h2.innerHTML = Foxtrickl10n.getString("preferences");
		h2.setAttribute('style','margin-top: 10px; margin-left:10px; color:#6B6B6B;font-size:1.5em;');
		h2.className='ft_pref_list_caption';
		alertdiv.appendChild(h2);

		var a=doc.createElement('a');
		a.href="javascript:void();";
		a.innerHTML=Foxtrickl10n.getString("Close");
		Foxtrick.addEventListenerChangeSave(a, "click", FoxtrickFirstRun.Close, false );
		a.setAttribute('style','float:right; margin-top:10px;');
		alertdiv.appendChild(a);

		var prefsavediv=doc.createElement('div');
		prefsavediv.setAttribute('id','foxtrick_prefs_save');
		alertdiv.appendChild(prefsavediv);

		var prefsave=doc.createElement('input');
		prefsave.setAttribute('id','foxtrick_prefsave');
		prefsave.setAttribute('type','button');
		prefsave.setAttribute('value',Foxtrickl10n.getString("foxtrick.prefs.buttonSave"));
		prefsave.addEventListener('click',FoxtrickPrefsDialogHTML.save,false);
		prefsavediv.appendChild(prefsave);

		FoxtrickFirstRun.NewModules = new Array();

		var curVersion = FoxtrickPrefs.getString("curVersion");
		var versions = Foxtrick.XML_evaluate(Foxtrick.XMLData.htversionsXML, "hattrickversions/version", "name", "code");
		var oldVersion = versions[versions.length-2][1];

		for ( var i in Foxtrick.modules ) {
			var module = Foxtrick.modules[i];
//			Foxtrick.dump (oldVersion+' <= ' +module.NEW_AFTER_VERSION+' '+(oldVersion <= module.NEW_AFTER_VERSION)+'\t'+module.MODULE_NAME+'\n');
			if ( (module.NEW_AFTER_VERSION && oldVersion <= module.NEW_AFTER_VERSION)
				|| (!module.NEW_AFTER_VERSION && oldVersion=="")) {

				if (!module.MODULE_CATEGORY) continue;
				if (!module.LATEST_CHANGE_CATEGORY || module.LATEST_CHANGE_CATEGORY!=Foxtrick.latestChangeCategories.NEW) continue;

				FoxtrickFirstRun.NewModules.push(module);
				//Foxtrick.dump(module.MODULE_NAME+'\n');
			}
		}

		FoxtrickFirstRun.NewModules.sort(FoxtrickFirstRun.sortfunction4);
		FoxtrickFirstRun.NewModules.sort(FoxtrickFirstRun.sortfunction0);
		FoxtrickFirstRun.NewModules.sort(FoxtrickFirstRun.sortfunction2);

		// modules
		for ( var j=0; j<FoxtrickFirstRun.NewModules.length; ++j ) {
			//dump(FoxtrickFirstRun.NewModules[j].MODULE_NAME+'\n');
			var entry = FoxtrickPrefsDialogHTML._normalModule(doc, FoxtrickFirstRun.NewModules[j], false);
			if (FoxtrickFirstRun.NewModules[j].OPTIONS != null) {
				entry.appendChild(FoxtrickPrefsDialogHTML._checkboxModule(doc, FoxtrickFirstRun.NewModules[j], entry, false));
			}
			if (FoxtrickFirstRun.NewModules[j].RADIO_OPTIONS != null) {
				entry.appendChild(FoxtrickPrefsDialogHTML._radioModule(doc, FoxtrickFirstRun.NewModules[j], entry, false));
			}

			alertdiv.appendChild(doc.createElement('br'));
			alertdiv.appendChild(doc.createTextNode(FoxtrickFirstRun.NewModules[j].LATEST_CHANGE));
			alertdiv.appendChild( entry );
		}

		var a=doc.createElement('a');
		a.href="javascript:void();";
		a.innerHTML=Foxtrickl10n.getString("Close");
		Foxtrick.addEventListenerChangeSave(a, "click", FoxtrickFirstRun.Close, false );
		a.setAttribute('style','float:right;margin-top:10px;');
		alertdiv.appendChild(a);

		var prefsavediv=doc.createElement('div');
		prefsavediv.setAttribute('id','foxtrick_prefs_save');
		alertdiv.appendChild(prefsavediv);

		var prefsave=doc.createElement('input');
		prefsave.setAttribute('id','foxtrick_prefsave');
		prefsave.setAttribute('type','button');
		prefsave.setAttribute('value',Foxtrickl10n.getString("foxtrick.prefs.buttonSave"));
		prefsave.addEventListener('click',FoxtrickPrefsDialogHTML.save,false);
		prefsavediv.appendChild(prefsave);

		} catch(e) {dump('showchanged: '+e+'\n');}
	}
};
