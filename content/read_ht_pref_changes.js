/**
 * read_ht_prefs_changes.js
 * Foxtrick read some ht prefs if they change
 * @author convinced 
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickReadHtPrefs = {
	
    MODULE_NAME : "ReadHtPrefs",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MAIN,	
	PAGES : new Array('prefSettings','myhattrickAll'), 
	NEW_AFTER_VERSION: "0.5.0.5",
	LATEST_CHANGE:"Checks language on MyHattrick",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	
	init : function() {
	},

    menu_strings: new Array('MyHattrick','MyClub','World','Forum','Shop','Help'),

    run : function(page, doc) {
	try{
		var langval = null;
		var oldval = FoxtrickPrefs.getString("htLanguage");

		Foxtrick.dump('readlang: '+doc.location.pathname+' '+doc.location.pathname.search(/MyHattrick\/$|^\/$/)+'\n')
		if (doc.location.pathname.search(/MyHattrick\/$|^\/$/) !=-1) {
			var menu = doc.getElementById('menu');
			var as = menu.getElementsByTagName('a');
			var languages = Foxtrick.XMLData.htLanguagesXml;
			//alert(decodeURIComponent(as[5].innerHTML));
			if (as.length < 6) {
				Foxtrick.dump('no prelogin lang check\n');
				return; // prelogin
			}
			var unchanged = true;
			for (var i = 0; i < 6; ++i) {
				var atitle = languages[oldval].getElementsByTagName(this.menu_strings[i])[0];
				if (atitle === null || as[i].textContent.search(atitle.getAttribute('value')) === -1) {
					unchanged = false;
					break;
				}
			}
			if (unchanged) {
				langval = oldval;
				Foxtrick.dump("Language unchanged as " + langval + ".\n");
			}
			else {
				for (var k in languages) {
					var found = true;
					for (var i = 0; i < 6; ++i) {
						var atitle = languages[k].getElementsByTagName(this.menu_strings[i])[0];
						if (atitle === null || as[i].textContent.search(atitle.getAttribute('value')) === -1) {
							found = false;
							break;
						}
					}
					if (found) {
						langval = k;
						Foxtrick.dump("Language detected: " + langval + ", old language: " + oldval + ".\n");
						break;
					}
				}
			}
		}

		if (!langval && doc.location.href.search(/\/MyHattrick\/Preferences\/ProfileSettings\.aspx\?actionType=save/i)!=-1) {		
			var langid = doc.getElementById('ctl00_CPMain_ddlLanguages').value;
			langval = Foxtrickl10n.locale[langid];
		}

		if (langval && langval != oldval) {
			FoxtrickPrefs.setString("htLanguage", langval);		
			
			if (Foxtrick.BuildFor=='Chrome') {
				// change language
				FoxtrickPrefs.portsetlang.postMessage({pref: "extensions.foxtrick.prefs.htLanguage", value:langval, from:'readpref'});			
				// ShowChanged(doc); shown in the listener!	
			}
			else {  
				// change language
				Foxtrickl10n.get_strings_bundle(langval);
				FoxtrickReadHtPrefs.ShowChanged(doc);  	
			}
		}
	  } catch(e) {Foxtrick.dump('FoxtrickLocaleChanged: '+e+'\n');}
	},

    ShowChanged: function(doc) {	
	try {
			var path = "language";
			var langname = Foxtrick.xml_single_evaluate(Foxtrick.XMLData.htLanguagesXml[FoxtrickPrefs.getString("htLanguage")], path, "desc");

			var mainBody = doc.getElementById('mainBody');	
			var alertdiv=doc.createElement('div');
			alertdiv.setAttribute('class','alert');
			alertdiv.setAttribute('id','idFoxtrickLocaleChanged');
			alertdiv.setAttribute('style', 'margin-bottom:20px; border: solid 1px #2F31FF !important; background-color: #EFEFFF !important;');
			alertdiv.appendChild(doc.createTextNode(Foxtrickl10n.getString("HTLanguageChanged")+' '+langname));
			mainBody.insertBefore(alertdiv,mainBody.firstChild);
	  } catch(e) {Foxtrick.dump('FoxtrickLocaleChanged: '+e+'\n');}
	},
	
};


var FoxtrickReadHtPrefsFromHeader = {
	
    MODULE_NAME : "ReadHtPrefsFromHeader",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MAIN,	
	PAGES : new Array('all'),//'myhattrickAll'), 
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION : "0.5.0.5",
	LATEST_CHANGE : "Read country from page header",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	
	ht_dateformat : 'yyyy-mm-dd',
	
    init : function() {
	},
	
	run : function(page, doc, newstart ) {  
	try{  
		var header = doc.getElementById('header');
		var teamLinks = doc.getElementById('teamLinks').getElementsByTagName('a');
		
		if (!teamLinks[0]) return;
		
		if ( Foxtrick.isModuleFeatureEnabled(FoxtrickReadHtPrefsFromHeader, 'CountryCurrencyDateFormat') ) {
			var CountryLink = teamLinks[2];
			var LeagueId = CountryLink.href.replace(/.+leagueid=/i, "").match(/^\d+/)[0];
			var CountryName = FoxtrickHelper.getLeagueDataFromId(LeagueId).EnglishName;
			var OldCountryName = FoxtrickPrefs.getString("htCountry");
		
			if (CountryName != OldCountryName || doc.location.href.search(/\/MyHattrick\/$/i)!=-1 || newstart) {
				Foxtrick.dump('Country check. old:'+OldCountryName+' new:'+ CountryName +'\n');
				var CurrencyName = FoxtrickHelper.getLeagueDataFromId(LeagueId).Country.CurrencyName;
				var CurrencyRate =  FoxtrickHelper.getCurrencyRateFromId(LeagueId);
				if (CurrencyName.search(/000\ /,'')!=-1) {
					CurrencyName=CurrencyName.replace(/000\ /gi,'');
					CurrencyRate=CurrencyRate/1000;					
				}
				
				var scripts = doc.getElementsByTagName('script');
				for (var i=0;i<scripts.length;++i) {
					var timeDiffpos = scripts[i].innerHTML.search('timeDiff');
					if (timeDiffpos != -1) {			
						var timeDiffParams = scripts[i].innerHTML.substr(timeDiffpos+8);
						
						this.ht_dateformat = timeDiffParams.substring(0,timeDiffParams.lastIndexOf('\''));
						this.ht_dateformat = this.ht_dateformat.substr(this.ht_dateformat.lastIndexOf('\'')+1);
						Foxtrick.dump('ht_dateformat: '+this.ht_dateformat+'\n');
						var dateformat='ddmmyyyy';
						if (timeDiffParams.search('y') < timeDiffParams.search('d')) {
							dateformat='yyyymmdd';
						}
						else if (timeDiffParams.search('m') < timeDiffParams.search('d')) {
							dateformat='mmddyyyy';
						}
						FoxtrickPrefs.setString("htDateformat", dateformat);
						break;
					}
				}	

				Foxtrick.dump('CurrencyName:'+CurrencyName+' CurrencyRate:'+ CurrencyRate +'\n');
				Foxtrick.dump('dateformat: ' +dateformat+'\n');
			
				FoxtrickPrefs.setString("htCountry", CountryName);
				FoxtrickPrefs.setString("oldCurrencySymbol", CurrencyName);
				FoxtrickPrefs.setString("currencyRate",CurrencyRate);
				FoxtrickPrefs.setInt("htSeasonOffset", Math.floor(FoxtrickPrefsDialogHTML.getOffsetValue(CountryName)));                										
			}
		}	
	} catch(e) {Foxtrick.dump('ReadHtPrefsFromHeader: '+e+'\n');}
	},
	

};

	
/**
 * FoxtrickMyHT
 * MyHT message after new foxtrick version
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickMyHT = {
	
    MODULE_NAME : "FoxtrickMyHT",
	PAGES : new Array('myhattrick'), 
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8.1",
	LATEST_CHANGE:"FoxTrick MyHT message shorted. Changes moved to html preferences. Shown only once again",
	
	NewModules: null,
	
    init : function() {
    },

    run : function(page, doc ) {  
		try{						
			if ( FoxtrickMain.IsNewVersion )   // uncomment to see it always for testing purposes
			{ 
				var curVersion = FoxtrickPrefs.getString("curVersion");
				FoxtrickPrefs.setString("oldVersion",curVersion);
				
				// set some special defaults
				this.setDefaults(doc);
								
				// show foxtrickMyHT
				this.ShowAlert(doc);
			}
		} catch(e){dump('FoxtrickMyHT: '+e+'\n');}
	},

	setDefaults :function(doc) {
		
		// set radio defaults as by appropriate countries
		var country = FoxtrickPrefs.getString("htCountry");
		if (FoxtrickPrefs.getBool('module.ExtraShortcuts.DTRadioWinamp.enabled')===null) {
			if (country==='Germany' || country==='Austria' || country==='Switzerland' || country==='Luxembourg') {
				FoxtrickPrefs.setBool('module.ExtraShortcuts.DTRadioWinamp.enabled',true)
			}
			else FoxtrickPrefs.setBool('module.ExtraShortcuts.DTRadioWinamp.enabled',false)
		}
		if (FoxtrickPrefs.getBool('module.ExtraShortcuts.HtRadioWinamp.enabled')===null) {
			if (country==='Belgium' || country==='Netherlands') {
				FoxtrickPrefs.setBool('module.ExtraShortcuts.HtRadioWinamp.enabled',false)
			}
			else FoxtrickPrefs.setBool('module.ExtraShortcuts.HtRadioWinamp.enabled',false)
		}
		if (FoxtrickPrefs.getBool('module.ExtraShortcuts.HtRadioMediaPlayer.enabled')===null) {
			if (country==='Belgium' || country==='Netherlands') {
				FoxtrickPrefs.setBool('module.ExtraShortcuts.HtRadioMediaPlayer.enabled',true)
			}
			else FoxtrickPrefs.setBool('module.ExtraShortcuts.HtRadioMediaPlayer.enabled',false)
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
				commondiv.setAttribute('id','FoxtrickMyHTCommon');
				alertdiv.appendChild(commondiv);				
												
				// release note. 
				var p=doc.createElement('p');
				p.id='ft_releasenotesid';
				/* linked ht-foxtrick version: as we don't make then now-> disabled
				p.appendChild(doc.createTextNode(Foxtrickl10n.getString("FoxtrickMyHtReleaseNotes")));				
				p.appendChild(doc.createTextNode(" "));				
				var a=doc.createElement('a');
				a.href=Foxtrickl10n.getString("FoxtrickMyHtReleaseNotesLink");
				a.innerHTML=Foxtrickl10n.getString("FoxtrickMyHtReleaseNotesLink");
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
				p.appendChild(doc.createTextNode(Foxtrickl10n.getString("FoxtrickMyHtScreenshotList")));				
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
				p.appendChild(doc.createTextNode(Foxtrickl10n.getString("FoxtrickMyHtHint")));				
				alertdiv.appendChild(p);
				*/
				
				// changes quick set repeat
				/*alertdiv.appendChild(doc.createElement('br'));				
				var p=doc.createElement('p');				
				var a=doc.createElement('a');
				a.href="javascript:void();";
				a.innerHTML='<strong>'+Foxtrickl10n.getString("FoxtrickMyHtSetChanged")+'</strong>';
				Foxtrick.addEventListenerChangeSave(a, "click", FoxtrickMyHT.ShowChanged, false );
				p.appendChild(a);				
				
				var a=doc.createElement('a');
				a.href="javascript:void();";
				a.innerHTML=Foxtrickl10n.getString("Close");
				Foxtrick.addEventListenerChangeSave(a, "click", FoxtrickMyHT.Close, false );
				a.setAttribute('style','float:right');
				p.appendChild(a);				
				
				commondiv.appendChild(p);*/
				
				FoxtrickMyHT.ShowChanged(doc);
				
		} catch(e){dump('MyHtShowAlert '+e+'\n');}
	},
	
	Close :function(ev){
		var doc = ev.target.ownerDocument;
		
		var mainBody = doc.getElementById('mainBody');				
		var oldAlert=doc.getElementById('idFoxtrickPrefsOuter');
		if (oldAlert) mainBody.removeChild(oldAlert);
		
		/*var curVersion=FoxtrickPrefs.getString("curVersion"); 				
		FoxtrickPrefs.setString("oldVersion",curVersion);	*/
		FoxtrickMain.IsNewVersion=false;
		
		//FoxtrickMyHT.ShowOnce();
	},
	
	ShowOnce : function() {
			// show_once messages
			if (!FoxtrickPrefs.getBool("v0481.show_once")) {
			
				var prefs_changed=false;
				
				// turn off youthskillnotes		
				if (FoxtrickPrefs.getBool("module.YouthSkillNotes.enabled" )
				&& Foxtrick.confirmDialog(Foxtrickl10n.getString('v0481.show_once.DisableYouthSkillNotes')))  {
					FoxtrickPrefs.setBool("module.YouthSkillNotes.enabled", false, true); 
					prefs_changed=true;
				}

				// reinitialize
				if (prefs_changed) FoxtrickMain.init();

				FoxtrickPrefs.setBool("v0481.show_once", true, true); 
				
			}
	},	
	
	sortfunction0: function(a,b) {return a.MODULE_NAME.localeCompare(b.MODULE_NAME);},
	sortfunction2: function(a,b) {return a.MODULE_CATEGORY.localeCompare(b.MODULE_CATEGORY);},
	sortfunction4: function(a,b) {return a.NEW_AFTER_VERSION.localeCompare(b.NEW_AFTER_VERSION);},

	
	ShowChanged: function(doc) {
		try{
		
		//var doc = ev.target.ownerDocument;
		
		//FoxtrickMyHT.ShowOnce();
		FoxtrickMain.IsNewVersion=false;
				
		doc.addEventListener( "submit", FoxtrickOnPagePrefs.SubmitCapture, true );
		doc.addEventListener( "click", FoxtrickOnPagePrefs.ClickCapture, true );
		
		var FoxtrickMyHTCommon = doc.getElementById('FoxtrickMyHTCommon');
		//FoxtrickMyHTCommon.style.display='none';		
		
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
		Foxtrick.addEventListenerChangeSave(a, "click", FoxtrickMyHT.Close, false );
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
				
		FoxtrickMyHT.NewModules = new Array();
						
		var curVersion = FoxtrickPrefs.getString("curVersion"); 
		var versions = Foxtrick.XML_evaluate(Foxtrick.XMLData.htversionsXML ,  "hattrickversions/version", "name", "code");
		var oldVersion = versions[versions.length-2][1];
		
		for ( var i in Foxtrick.modules ) {
			var module = Foxtrick.modules[i]; 
//			Foxtrick.dump (oldVersion+' <= ' +module.NEW_AFTER_VERSION+' '+(oldVersion <= module.NEW_AFTER_VERSION)+'\t'+module.MODULE_NAME+'\n');
			if ( (module.NEW_AFTER_VERSION && oldVersion <= module.NEW_AFTER_VERSION) 
				|| (!module.NEW_AFTER_VERSION && oldVersion=="")) {
				
				if (!module.MODULE_CATEGORY) continue;
				if (!module.LATEST_CHANGE_CATEGORY || module.LATEST_CHANGE_CATEGORY!=Foxtrick.latestChangeCategories.NEW) continue;
													
				FoxtrickMyHT.NewModules.push(module); 
				//Foxtrick.dump(module.MODULE_NAME+'\n');
			}
		}
				
		FoxtrickMyHT.NewModules.sort(FoxtrickMyHT.sortfunction4);
		FoxtrickMyHT.NewModules.sort(FoxtrickMyHT.sortfunction0);
		FoxtrickMyHT.NewModules.sort(FoxtrickMyHT.sortfunction2);							
						
		// modules
		for ( var j=0; j<FoxtrickMyHT.NewModules.length; ++j ) {
			//dump(FoxtrickMyHT.NewModules[j].MODULE_NAME+'\n');
			var entry = FoxtrickPrefsDialogHTML._normalModule(doc, FoxtrickMyHT.NewModules[j], false);
			if (FoxtrickMyHT.NewModules[j].OPTIONS != null) {
				entry.appendChild(FoxtrickPrefsDialogHTML._checkboxModule(doc, FoxtrickMyHT.NewModules[j], entry, false));
			}
			if (FoxtrickMyHT.NewModules[j].RADIO_OPTIONS != null) {
				entry.appendChild(FoxtrickPrefsDialogHTML._radioModule(doc, FoxtrickMyHT.NewModules[j], entry, false));
			}
			
			alertdiv.appendChild(doc.createElement('br'));
			alertdiv.appendChild(doc.createTextNode(FoxtrickMyHT.NewModules[j].LATEST_CHANGE));
			alertdiv.appendChild( entry );
		}

		var a=doc.createElement('a');
		a.href="javascript:void();";
		a.innerHTML=Foxtrickl10n.getString("Close");
		Foxtrick.addEventListenerChangeSave(a, "click", FoxtrickMyHT.Close, false );
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
	},
	
};
