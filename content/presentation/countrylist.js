/**
* countrylist.js
* displays country names in dropdown in different way
* @author spambot
*/

var FoxtrickCountyList = {

	MODULE_NAME : "CountryList",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,    
    PAGES : new Array('country', 'transferListSearchForm'),
	DEFAULT_ENABLED : true,
    htCountriesXml : null,
	NEW_AFTER_VERSION: "0.4.8.2",
	LASTEST_CHANGE:"possibility to display country names by their original name",

    init : function() {
        this.initHtCountries();
    },

	run : function( page, doc ) {
		var list = doc.getElementById( 'ft_countrylist' );
		if( list != null ) return;
        
        var id = 'ctl00_CPMain_ddlZone';
        switch (page) {
            case 'transferListSearchForm' : 
                this._changelist(page, doc, 'ctl00_CPMain_ddlZone', 10); 
                this._changelist(page, doc, 'ctl00_CPMain_ddlBornIn', 1); 
            break;
            
            case 'country' : 
                this._changelist(page, doc, 'ctl00_CPMain_ucLeaguesDropdown_ddlLeagues', 0); 
            break;
        }
	},

	change : function( page, doc ) {
		return;
        var list = doc.getElementById( 'ft_countrylist' );
		if( list == null ) {
			this.run( page, doc );
		}
	},

    initHtCountries: function ()
	{
		try {
			this.htCountriesXml = this._loadXmlIntoDOM("chrome://foxtrick/content/htlocales/htcountries.xml");
		} catch (e) {
			dump('countrylist.js initHTCountries: '+e+"\n");
		}
	},

	_loadXmlIntoDOM: function(url) {
		var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance();
		req.open("GET", url, false);
		req.send(null);
		var doc = req.responseXML;
		if (doc.documentElement.nodeName == "parsererror") {
			dump("error parsing " + url+"\n");
			return null;
		}
		return doc;
	},
    
    _changelist: function (page, doc, id, start) {
        var selectbox = doc.getElementById(id);
        if (selectbox == null) return;
        dump('GO ' + '\n');
        var options = selectbox.options;
        var countries = options.length;
        var selected  = selectbox.selectedIndex;
        var id_sel = 0;
        try {
            for (var i = start; i < countries; i++) {
                if (i == selected) id_sel = options[i].value;
                try {
                    var country = options[i].value;
                    var htname = options[i].text;
                    
                    var path = 'hattrickcountries/country[@name="' + htname + '"]';
                    dump("value: " + country + ' || ' + htname + ' - ');
                    var obj = this.htCountriesXml.evaluate(path,this.htCountriesXml,null,this.htCountriesXml.DOCUMENT_NODE,null).singleNodeValue;
                    
                    if (obj)
//                        htname = '#' + obj.attributes.getNamedItem("htname").textContent;
                        htname = obj.attributes.getNamedItem("htname").textContent;
                    dump(country + ' || ' + htname + '\n');                        
//                    else
//                        return -1;
                    
                } catch (exml) {
                    dump('crosstable.js countries: '+exml + "\n");
                }
                options[i].text = htname;
            }
        } catch(e) {dump('countrylist: '+e+'\n');}
        
        
        var opt_array = new Array();
        try{
            for( var i = 0; i < options.length; i++){
                var oldopt = new Array('-1', '-1');
                oldopt[0] = options[i].value;
                oldopt[1] = options[i].text;
                opt_array.push(oldopt);
            }
        } catch (epush) {dump('countrylist: EPUSH '+epush+'\n');}
        
        function sortByOptionText(a, b) {
            var x = a[1];
            var y = b[1];
            if (a[0] <= 0 || b[0] <= 0) return -1;            
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }
        
        opt_array.sort(sortByOptionText);
        for(var i=0; i < opt_array.length; i++){
            if (opt_array[i][0] == id_sel) selectbox.selectedIndex = i;
            options[i].value = opt_array[i][0];
            options[i].text = opt_array[i][1];
        }        
    }
};