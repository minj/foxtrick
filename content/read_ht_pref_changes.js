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
			this.codes['51']='es_SU';
			this.codes['103']='es_ca';
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
			this.codes['85']='sq';
			this.codes['83']='mk';
			
			// follwoing don't have an own locale file yet
	/*
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
			alertdiv.setAttribute('id','idFoxtrickLocaleChanged');
			alertdiv.setAttribute('style', 'margin-bottom:20px; border: solid 1px #2F31FF !important; background-color: #EFEFFF !important;');
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
	NEW_AFTER_VERSION: "0.4.8.2",
	LASTEST_CHANGE:"FoxTrick MyHT message shorted. Changes moved to html preferences. Shown only once again",
	
	NewModules:null,
	
    init : function() {
            Foxtrick.registerPageHandler('myhattrick',this);
   },

    run : function(page, doc ) {  
    try{			
			var curVersion = FoxtrickPrefs.getString("curVersion"); 
			var oldVersion = FoxtrickPrefs.getString("oldVersion");
			dump (curVersion+' > ' +oldVersion+' '+(curVersion > oldVersion)+'\n');
			
			// show foxtrickMyHT
			if (oldVersion<curVersion) {
				this.ShowAlert(doc, oldVersion);													
			}
						
		} catch(e){dump('FoxtrickMyHT: '+e+'\n');}
	},

	ShowAlert :function(doc, oldVersion) {
		try {  
				var mainBody = doc.getElementById('mainBody');	
								
				var alertdiv=doc.createElement('div');
				alertdiv.setAttribute('id','idFoxtrickMyHT');
				alertdiv.setAttribute('class','alert');
				alertdiv.setAttribute('style','margin-top:20px; margin-bottom:20px; border: solid 1px #2F31FF !important; background-color: #EFEFFF !important;');
				mainBody.insertBefore(alertdiv,mainBody.firstChild);
		
				var commondiv=doc.createElement('div');
				commondiv.setAttribute('id','FoxtrickMyHTCommon');
				alertdiv.appendChild(commondiv);				
				
				var curVersion=FoxtrickPrefs.getString("curVersion"); 

				alertdiv.innerHTML = "<h2 style='background-color:#EFEFFF; text-align:center !important; color:#2F31FF !important; font-size:1.1em; '>FoxTrick "+curVersion+"</h2>";
				
				var p=doc.createElement('p');				
				p.appendChild(doc.createTextNode(Foxtrickl10n.getString("FoxtrickMyHtReleaseNotes")));				
				p.appendChild(doc.createTextNode(" "));				
				var a=doc.createElement('a');
				a.href=Foxtrickl10n.getString("FoxtrickMyHtReleaseNotesLink");
				a.innerHTML=Foxtrickl10n.getString("FoxtrickMyHtReleaseNotesLink");
				a.target="_blank";
				p.appendChild(a);				
				alertdiv.appendChild(p);

				/*var p=doc.createElement('p');				
				p.appendChild(doc.createTextNode(Foxtrickl10n.getString("FoxtrickMyHtScreenshotList")));				
				p.appendChild(doc.createTextNode(" "));				
				var a=doc.createElement('a');
				a.href="http://gliglif.foundationhorizont.org/hattrick/index.html";
				a.innerHTML="http://gliglif.foundationhorizont.org/hattrick/index.html";
				a.target="_blank";
				p.appendChild(a);				
				alertdiv.appendChild(p);*/

				var p=doc.createElement('p');				
				p.appendChild(doc.createTextNode(Foxtrickl10n.getString("foxtrick.prefs.ChangesTab")+': '));				
				p.appendChild(doc.createTextNode(" "));				
				var a=doc.createElement('a');
				a.href="/MyHattrick/?configure_foxtrick=true&category=changes";
				a.innerHTML="/MyHattrick/?configure_foxtrick=true&category=changes";
				a.target="_self";
				p.appendChild(a);				
				alertdiv.appendChild(p);


/*				alertdiv.appendChild(doc.createElement('br'));				
				var p=doc.createElement('p');				
				p.appendChild(doc.createTextNode(Foxtrickl10n.getString("FoxtrickMyHtHint")));				
				alertdiv.appendChild(p);
*/
				var a=doc.createElement('a');
				a.href="javascript:void();";
				a.innerHTML=Foxtrickl10n.getString("Close");
				a.addEventListener( "click", FoxtrickMyHT.Close, false );
				FoxtrickMyHT.Close.doc=doc;
				alertdiv.appendChild(a);				
				
				
		} catch(e){dump('MyHtShowAlert '+e+'\n');}
	},
	
	Close :function(ev){
		var doc=FoxtrickMyHT.Close.doc;
 	 
		var mainBody = doc.getElementById('mainBody');				
		var oldAlert=doc.getElementById('idFoxtrickPrefsDialogHTML');
		if (oldAlert) mainBody.removeChild(oldAlert);
		
		var curVersion=FoxtrickPrefs.getString("curVersion"); 				
		FoxtrickPrefs.setString("oldVersion",curVersion);	

		FoxtrickPrefsDialogHTML.ShowOnce();
	},

	
	ShowOnce : function() {
			// show_once messages
			if (!FoxtrickPrefs.getBool("v0481.show_once")) {
			
				var prefs_changed=false;
				
				// turn off youthskillnotes		
				if (FoxtrickPrefs.getBool("module.YouthSkillNotes.enabled" )
				&& Foxtrick.confirmDialog(Foxtrickl10n.getString('v0481.show_once.DisableYouthSkillNotes')))  {
					FoxtrickPrefs.setBool("module.YouthSkillNotes.enabled", false); 
					prefs_changed=true;
				}

				// reinitialize
				if (prefs_changed) FoxtrickMain.init();

				FoxtrickPrefs.setBool("v0481.show_once", true); 
				
			}
	},
	
	
	change : function(page, doc ) {
	},
		
};