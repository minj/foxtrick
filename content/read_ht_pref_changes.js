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