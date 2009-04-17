/**
 * read_ht_prefs_changes.js
 * Foxtrick read some ht prefs if they change
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////

var FoxtrickReadHtPrefs = {
	
    MODULE_NAME : "ReadHtPrefs",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MAIN,	
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.6.2",
	LASTEST_CHANGE:"Locale now independent from Firefox locale. Option to auto-change language if hatricks language gets changed (default on)",
	
	codes:{},
	
    init : function() {
            Foxtrick.registerPageHandler('prefSettings',this);

			this.codes['2']='en';
			this.codes['3']='de';
			this.codes['43']='bg';
			this.codes['66']='ca';
			this.codes['35']='cz';
			this.codes['8']='dk';
			this.codes['36']='ee';
			this.codes['6']='es';
			this.codes['51']='es_ca';
			this.codes['103']='es_SU';
			this.codes['110']='eu_ES';
			this.codes['5']='fr';
			this.codes['74']='gl_ES';
			this.codes['58']='bs';
			this.codes['109']='fy';
			this.codes['39']='hr';
			this.codes['4']='it';
			this.codes['37']='lv';
			this.codes['56']='lt';
			this.codes['10']='nl';
			this.codes['33']='hu';
			this.codes['7']='no';
			this.codes['13']='pl';
			this.codes['11']='pt';
			this.codes['50']='pt_BR';
			this.codes['23']='ro';
			this.codes['45']='sl';
			this.codes['53']='sk';
			this.codes['1']='se';
			this.codes['9']='fi';
			this.codes['19']='tr';
			this.codes['65']='nl_BE';
			this.codes['57']='ua';
			this.codes['32']='sr';
			this.codes['14']='ru';
			this.codes['34']='gr';
			this.codes['40']='he_IL';
			this.codes['111']='lb_LU';
	
			// follwoing don't have an own locale file yet
	/*
	<option value="85">Albanian</option>
	<option value="113">Furlan</option>
	<option value="90">Georgian</option>
	<option value="86">Kyrgyz</option>
	<option value="75">?????</option> Farsi
	<option value="84">??????????</option>  Belarusian
	<option value="15">??(??)</option> Chinese Simplified
	<option value="17">???</option> korean
	<option value="12">???</option> japan
	 */  
			
   },

    run : function(page, doc ) {  

		if (doc.location.href.search(/\/MyHattrick\/Preferences\/ProfileSettings\.aspx\?actionType=save/i)!=-1) {
		
			var langval = doc.getElementById('ctl00_CPMain_ddlLanguages').value		
			FoxtrickPrefs.setString("htLanguage", this.codes[langval]);
			Foxtrickl10n.get_strings_bundle(this.codes[langval]);
			var confirmbox = doc.getElementById('ctl00_pnlPageOK');	
			var alertdiv=doc.createElement('div');
			alertdiv.setAttribute('class','alert');
			alertdiv.appendChild(doc.createTextNode(Foxtrickl10n.getString("HTLanguageChanged")+' '+this.codes[langval]));
			confirmbox.parentNode.insertBefore(alertdiv,confirmbox.nextSibling);
			
	    }
	},
	
	change : function(page, doc ) {
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
	MODULE_CATEGORY : Foxtrick.moduleCategories.MAIN,	
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.6.2",
	LASTEST_CHANGE:"FoxTrick MyHT message after version updates. Option to show old changes again.",
	
	NewModules:null,
	
    init : function() {
            Foxtrick.registerPageHandler('myhattrick',this);
   },

    run : function(page, doc ) {  
    try{
			
			var curVersion = FoxtrickPrefs.getString("curVersion"); 
			var oldVersion = FoxtrickPrefs.getString("oldVersion");
			
			if (oldVersion<curVersion) {
				this.getNewModules(curVersion,oldVersion);			
				this.ShowAlert(doc, oldVersion);
													
			}
		} catch(e){dump('FoxtrickMyHT: '+e+'\n');}
	},

	getNewModules : function(curVersion,oldVersion) {
				
				FoxtrickMyHT.NewModules = new Array();
						
				for ( i in Foxtrick.modules ) {
					var module = Foxtrick.modules[i]; 
					
					if ( (module.NEW_AFTER_VERSION && curVersion > module.NEW_AFTER_VERSION) 
						|| (!module.NEW_AFTER_VERSION && oldVersion=="")) {
						
						if (!module.MODULE_CATEGORY) continue;
						
						var Tab="";
						if (module.MODULE_CATEGORY==Foxtrick.moduleCategories.MAIN) Tab=Foxtrickl10n.getString("foxtrick.prefs.MainTab");
						else if (module.MODULE_CATEGORY==Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS) Tab=Foxtrickl10n.getString("foxtrick.prefs.ShortcutsTab");
						else if (module.MODULE_CATEGORY==Foxtrick.moduleCategories.PRESENTATION) Tab=Foxtrickl10n.getString("foxtrick.prefs.PresentationTab");
						else if (module.MODULE_CATEGORY==Foxtrick.moduleCategories.MATCHES) Tab=Foxtrickl10n.getString("foxtrick.prefs.MatchesTab");
						else if (module.MODULE_CATEGORY==Foxtrick.moduleCategories.FORUM) Tab=Foxtrickl10n.getString("foxtrick.prefs.ForumTab");
						else if (module.MODULE_CATEGORY==Foxtrick.moduleCategories.LINKS) Tab=Foxtrickl10n.getString("foxtrick.prefs.LinksTab");
															
						var new_after=module.NEW_AFTER_VERSION;
						if (!new_after) new_after="0.3.7.4";
						var screenshot=Foxtrickl10n.getScreenshot(module.MODULE_NAME);						
						FoxtrickMyHT.NewModules.push([module.MODULE_NAME,screenshot,Tab,module.MODULE_CATEGORY,new_after,module.LASTEST_CHANGE,module]); 
												
					}
				}
				
				FoxtrickMyHT.NewModules.sort(FoxtrickMyHT.sortfunction4);
				FoxtrickMyHT.NewModules.sort(FoxtrickMyHT.sortfunction0);
				FoxtrickMyHT.NewModules.sort(FoxtrickMyHT.sortfunction2);
	},
	
	ShowAlert :function(doc, oldVersion) {
		try {  
				var mainBody = doc.getElementById('mainBody');	
				var oldAlert=doc.getElementById('idFoxtrickMyHT');
				if (oldAlert) mainBody.removeChild(oldAlert);
				
				var curVersion=FoxtrickPrefs.getString("curVersion"); 
				
				var alertdiv=doc.createElement('div');
				alertdiv.setAttribute('id','idFoxtrickMyHT');
				alertdiv.setAttribute('class','alert');
				alertdiv.setAttribute('style','margin-top:20px; margin-bottom:20px;');
				alertdiv.innerHTML = "<h2 style='background-color:#FCF6DF;'>FoxTrick "+curVersion+"</h2>";
				alertdiv.innerHTML += Foxtrickl10n.getString("NewOrChangedModules")+' ';
				
				var selectbox = doc.createElement("select"); 
				selectbox.setAttribute("id","ft_ownselectboxID");
				FoxtrickMyHT.VersionBox_Select.doc = doc;
				selectbox.addEventListener('change',FoxtrickMyHT.VersionBox_Select,false);
				
				var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
				req.open("GET", "chrome://foxtrick/content/htlocales/htversions.xml", false);
				req.send(null);
				var response = req.responseXML;
				if (response.documentElement.nodeName == "parsererror") {
					dump("error parsing " + url+"\n");
					return null;
				}	
				
				var versions = response.evaluate("hattrickversions/version", response, null, 7 , null);
				for (var i = 0; i < versions.snapshotLength-1; i++) {
					version = versions.snapshotItem(i);
					var value = version.getAttribute('code');
					var label = version.getAttribute('name');
        			
					var option = doc.createElement("option");
					option.setAttribute("value",value);
					option.innerHTML=label;
					selectbox.appendChild(option);	
			
					if (oldVersion==value)
						indexToSelect=i;
				}
				selectbox.selectedIndex=indexToSelect;

				alertdiv.appendChild(selectbox);
				
						
				var table=doc.createElement('table');		
				alertdiv.appendChild(table);
				var tr=doc.createElement('tr');
				table.appendChild(tr);
				var td1=doc.createElement('td');
				var h1=doc.createElement('h3');
				var a1=doc.createElement('a');
				a1.appendChild(doc.createTextNode(Foxtrickl10n.getString("Module")));
				a1.addEventListener( "click", FoxtrickMyHT.Sort0, false );
				FoxtrickMyHT.Sort0.doc=doc;
                a1.href='javascript:void();'
				a1.title=Foxtrickl10n.getString("SortBy");
				h1.appendChild(a1);
				td1.appendChild(h1);
				tr.appendChild(td1);
				
				var td2=doc.createElement('td');
				var h2=doc.createElement('h3');
				var a2=doc.createElement('a');
				a2.appendChild(doc.createTextNode(Foxtrickl10n.getString("PreferenceTab")));				
				a2.addEventListener( "click", FoxtrickMyHT.Sort2, false );
				FoxtrickMyHT.Sort2.doc=doc;
                a2.href='javascript:void();'
				a2.title=Foxtrickl10n.getString("SortBy");
				h2.appendChild(a2);
				td2.appendChild(h2);
				tr.appendChild(td2);
				
				var td3=doc.createElement('td');
				var h3=doc.createElement('h3');
				var a3=doc.createElement('a');
				a3.appendChild(doc.createTextNode(Foxtrickl10n.getString("NewAfter")));				
				a3.addEventListener( "click", FoxtrickMyHT.Sort4, false );
				FoxtrickMyHT.Sort4.doc=doc;
				a3.href='javascript:void();'
				a3.title=Foxtrickl10n.getString("SortBy");
				h3.appendChild(a3);				
				td3.appendChild(h3);
				tr.appendChild(td3);

				for (var i=0;i<this.NewModules.length;++i) {
						var tr=doc.createElement('tr');
						table.appendChild(tr);
						
						var td1=doc.createElement('td'); 
						if (this.NewModules[i][1]) {
							var a=doc.createElement('a');
							a.href=this.NewModules[i][1];
							a.title=Foxtrickl10n.getString("Screenshot");
							a.target="_blank";
							a.innerHTML=this.NewModules[i][0]
							td1.appendChild(a);
						}
						else td1.appendChild(doc.createTextNode(this.NewModules[i][0]));
						
						if (this.NewModules[i][6].OPTIONS) {						
							for (var k=0; k < this.NewModules[i][6].OPTIONS.length; ++k) {
								var screenshot=Foxtrickl10n.getScreenshot(this.NewModules[i][0]+'.'+this.NewModules[i][6].OPTIONS[k]);						
								if (screenshot) {
									td1.appendChild(doc.createElement('br'));
									td1.appendChild(doc.createTextNode('»\u00a0'));
									var a=doc.createElement('a');
									a.href=screenshot;
									a.title=Foxtrickl10n.getString("Screenshot");
									a.target="_blank";
									a.innerHTML=this.NewModules[i][6].OPTIONS[k];
									td1.appendChild(a);
								}	
							}
						}
						if (this.NewModules[i][6].RADIO_OPTIONS) {						
							for (var k=0; k < this.NewModules[i][6].RADIO_OPTIONS.length; ++k) {
								var screenshot=Foxtrickl10n.getScreenshot(this.NewModules[i][0]+'.'+this.NewModules[i][6].RADIO_OPTIONS[k]);						
								if (screenshot) {
									td1.appendChild(doc.createElement('br'));
									td1.appendChild(doc.createTextNode('»\u00a0'));
									var a=doc.createElement('a');
									a.href=screenshot;
									a.title=Foxtrickl10n.getString("Screenshot");
									a.target="_blank";
									a.innerHTML=this.NewModules[i][6].RADIO_OPTIONS[k];
									td1.appendChild(a);
								}	
							}
						}
						tr.appendChild(td1);

						var td2=doc.createElement('td');
						var prefscreenshot="";
						var prefscreenshot = Foxtrickl10n.getScreenshot(this.NewModules[i][3]);	
						if (prefscreenshot) {
							var a=doc.createElement('a');
							a.href=prefscreenshot;
							a.title=Foxtrickl10n.getString("PreferenceScreenshot");
							a.target="_blank";
							a.innerHTML=this.NewModules[i][2];
							td2.appendChild(a);
						}
						else td2.appendChild(doc.createTextNode(this.NewModules[i][2]));
						tr.appendChild(td2);

						var td3=doc.createElement('td');	
						td3.appendChild(doc.createTextNode(this.NewModules[i][4]));
						if (this.NewModules[i][5]) td3.setAttribute('title',this.NewModules[i][5]);
						tr.appendChild(td3);
				}
				
				alertdiv.appendChild(doc.createElement('br'));				
				var p=doc.createElement('p');				
				p.appendChild(doc.createTextNode(Foxtrickl10n.getString("FoxtrickMyHtHint")));				
				alertdiv.appendChild(p);
				
				var p=doc.createElement('p');				
				p.appendChild(doc.createTextNode(Foxtrickl10n.getString("FoxtrickMyHtReleaseNotes")));				
				p.appendChild(doc.createTextNode(" "));				
				var a=doc.createElement('a');
				a.href=Foxtrickl10n.getString("FoxtrickMyHtReleaseNotesLink");
				a.innerHTML=Foxtrickl10n.getString("FoxtrickMyHtReleaseNotesLink");
				a.target="_blank";
				p.appendChild(a);				
				alertdiv.appendChild(p);

				var p=doc.createElement('p');				
				var a=doc.createElement('a');
				a.href="javascript:void();";
				a.innerHTML=Foxtrickl10n.getString("Close");
				a.addEventListener( "click", FoxtrickMyHT.Close, false );
				FoxtrickMyHT.Close.doc=doc;
				p.appendChild(a);				
				alertdiv.appendChild(p);
				
				mainBody.insertBefore(alertdiv,mainBody.firstChild);
		} catch(e){dump('MyHtShowAlert '+e+'\n');}
	},
	
	sortfunction0: function(a,b) {return a[0].localeCompare(b[0]);},
	sortfunction2: function(a,b) {return a[2].localeCompare(b[2]);},
	sortfunction4: function(a,b) {return a[4].localeCompare(b[4]);},

	Sort0 :function(ev){
		var doc=FoxtrickMyHT.Sort0.doc;
		FoxtrickMyHT.NewModules.sort(FoxtrickMyHT.sortfunction0);
		FoxtrickMyHT.ShowAlert(doc);
	},
	
	Sort2 :function(ev){
		var doc=FoxtrickMyHT.Sort2.doc;
		FoxtrickMyHT.NewModules.sort(FoxtrickMyHT.sortfunction2);
		FoxtrickMyHT.ShowAlert(doc);
	},

	Sort4 :function(ev){
		var doc=FoxtrickMyHT.Sort4.doc;
		FoxtrickMyHT.NewModules.sort(FoxtrickMyHT.sortfunction4);
		FoxtrickMyHT.ShowAlert(doc);
	},
	
		
	VersionBox_Select :function(ev){
		try{
			var doc = FoxtrickMyHT.VersionBox_Select.doc;
		
			var selectbox = doc.getElementById("ft_ownselectboxID");
			var oldVersion = selectbox.getElementsByTagName("option")[selectbox.selectedIndex].value; 
						
			FoxtrickMyHT.getNewModules(FoxtrickPrefs.getString("curVersion"),oldVersion);			
			FoxtrickMyHT.ShowAlert(doc, oldVersion);
			
		} catch(e) {dump('FoxtrickMyHT.VersionBox_Select'+e+'\n');}
	},
	
	Close :function(ev){
		var doc=FoxtrickMyHT.Close.doc;
 	 
		var mainBody = doc.getElementById('mainBody');				
		var oldAlert=doc.getElementById('idFoxtrickMyHT');
		if (oldAlert) mainBody.removeChild(oldAlert);
		
		var curVersion=FoxtrickPrefs.getString("curVersion"); 				
		FoxtrickPrefs.setString("oldVersion",curVersion);							
	},
	
	change : function(page, doc ) {
	},
		
};