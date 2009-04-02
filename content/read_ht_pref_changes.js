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
	
    MODULE_NAME : "MyHT",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MAIN,	
	DEFAULT_ENABLED : true,
	
    init : function() {
            Foxtrick.registerPageHandler('myhattrick',this);
   },

    run : function(page, doc ) {  
    try{
			var curVersion=FoxtrickPrefs.getString("curVersion"); 
			var oldVersion=FoxtrickPrefs.getString("oldVersion");
			if (oldVersion<curVersion) {
				var mainBody = doc.getElementById('mainBody');	
				var alertdiv=doc.createElement('div');
				alertdiv.setAttribute('class','alert');
				alertdiv.setAttribute('style','margin-top:20px; margin-bottom:20px;');
				alertdiv.innerHTML = "<h2>FoxTrick "+curVersion+"</h2>";
				alertdiv.innerHTML += '<h3>'+Foxtrickl10n.getString("NewOrChangedModules")+' '+oldVersion+'</h3>';
						
				var table=doc.createElement('table');		
				alertdiv.appendChild(table);
				var tr=doc.createElement('tr');
				table.appendChild(tr);
				var td1=doc.createElement('td');
				var h1=doc.createElement('h2');
				h1.appendChild(doc.createTextNode(Foxtrickl10n.getString("Module")));				
				td1.appendChild(h1);
				tr.appendChild(td1);
				var td2=doc.createElement('td');
				var h2=doc.createElement('h2');
				h2.appendChild(doc.createTextNode(Foxtrickl10n.getString("PreferenceTab")));				
				td2.appendChild(h2);
				tr.appendChild(td2);
				var td3=doc.createElement('td');
				var h3=doc.createElement('h2');
				h3.appendChild(doc.createTextNode(Foxtrickl10n.getString("NewAfter")));				
				td3.appendChild(h3);
				tr.appendChild(td3);
				
						
				for ( i in Foxtrick.modules ) {
					var module = Foxtrick.modules[i];
					if ( (module.NEW_AFTER_VERSION && curVersion > module.NEW_AFTER_VERSION) 
						|| (!module.NEW_AFTER_VERSION && oldVersion=="")) {
						
						if (!module.MODULE_CATEGORY) continue;
						
						var Tab="";
						if (module.MODULE_CATEGORY==Foxtrick.moduleCategories.MAIN) Tab=Foxtrickl10n.getString("foxtrick.prefs.MainTab");
						else if (module.MODULE_CATEGORY==Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS) Tab=Foxtrickl10n.getString("foxtrick.prefs.MainTab");
						else if (module.MODULE_CATEGORY==Foxtrick.moduleCategories.PRESENTATION) Tab=Foxtrickl10n.getString("foxtrick.prefs.ShortcutsTab");
						else if (module.MODULE_CATEGORY==Foxtrick.moduleCategories.MATCHES) Tab=Foxtrickl10n.getString("foxtrick.prefs.PresentationTab");
						else if (module.MODULE_CATEGORY==Foxtrick.moduleCategories.FORUM) Tab=Foxtrickl10n.getString("foxtrick.prefs.MatchesTab");
						else if (module.MODULE_CATEGORY==Foxtrick.moduleCategories.LINKS) Tab=Foxtrickl10n.getString("foxtrick.prefs.LinksTab");
				
						var tr=doc.createElement('tr');
						table.appendChild(tr);
						var td1=doc.createElement('td');
						
						if (module.SCREENSHOT) {
							var a=doc.createElement('a');
							a.href=module.SCREENSHOT;
							a.title=Foxtrickl10n.getString("Screenshot");
							a.target="_blank";
							a.innerHTML=module.MODULE_NAME;
							td1.appendChild(a);
						}
						else td1.appendChild(doc.createTextNode(module.MODULE_NAME));
						tr.appendChild(td1);
				
						var td2=doc.createElement('td');						
						if (module.PREF_SCREENSHOT) {
							var a=doc.createElement('a');
							a.href=module.PREF_SCREENSHOT;
							a.title=Foxtrickl10n.getString("PreferenceScreenshot");
							a.target="_blank";
							a.innerHTML=Tab;
							td2.appendChild(a);
						}
						else td2.appendChild(doc.createTextNode(Tab));
						tr.appendChild(td2);
				
						var td3=doc.createElement('td');	
						var new_after=module.NEW_AFTER_VERSION;
						if (!new_after) new_after="0.3.7.4";
						td3.appendChild(doc.createTextNode(new_after));
						tr.appendChild(td3);
						
					}
				}
				mainBody.insertBefore(alertdiv,mainBody.firstChild);
				FoxtrickPrefs.setString("oldVersion",curVersion);			
			}
	} catch(e){dump('FoxtrickMyHT: '+e+'\n');}
	},
	
	change : function(page, doc ) {
	},
		
};