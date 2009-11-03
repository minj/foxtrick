/**
* countrylist.js
* displays country names in dropdown in different way
* @author spambot
*/

var FoxtrickCountyList = {

	MODULE_NAME : "CountryList",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
    PAGES : new Array ( 'country', 'transferListSearchForm', 'ads', 'press', 
                        'statsTransfersBuyers', 'statsTeams', 'statsPlayers', 
                        'statsRegions', 'statsNationalTeams', 'statsConfs', 'statsBookmarks',
                        'trainingStats', 'teamPage', 'teamPageBrowser', 'managerPage', 'statsArena',
                        'help_contact'
                        ),
	DEFAULT_ENABLED : true,
    htCountriesXml : null,
    OPTIONS :  new Array("SelectBoxes","TeamPage","ManagerPage", "HideFlagOntop"),
	NEW_AFTER_VERSION: "0.4.8.9",
	LATEST_CHANGE:"Added the country link as textlink to the team page",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
	CSS:"chrome://foxtrick/content/resources/css/CountyList.css",

    init : function() {
        this.initHtCountries();
    },

	run : function( page, doc ) {
		var list = doc.getElementById( 'ft_countrylist' );
		if( list != null ) return;
        if (Foxtrick.isModuleFeatureEnabled( this, "SelectBoxes")) {
            switch (page) {
                case 'transferListSearchForm' :
                    this._changelist(page, doc, 'ctl00_CPMain_ddlZone', 10);
                    this._changelist(page, doc, 'ctl00_CPMain_ddlBornIn', 1);
                break;

                case 'country' :
                    this._changelist(page, doc, 'ctl00_CPMain_ucLeaguesDropdown_ddlLeagues', 0);
                break;

                case 'ads' :
                    this._changelist(page, doc, 'ctl00_CPMain_ucLeaguesDropdown_ddlLeagues', 0);
                break;

                case 'press' :
                    this._changelist(page, doc, 'ctl00_CPSidebar_ucLeagues2_ddlLeagues', 1);
                break;

                case 'statsTransfersBuyers' :
                    this._changelist(page, doc, 'ctl00_CPMain_ddlLeagues', 1);
                break;

                case 'statsTeams' :
                    this._changelist(page, doc, 'ctl00_CPMain_ddlLeagues_ddlLeagues', 0);
                break;
     
                case 'statsPlayers' :
                    this._changelist(page, doc, 'ctl00_CPMain_ddlLeagues_ddlLeagues', 0);
                break;
     
                case 'statsRegions' :
                    this._changelist(page, doc, 'ctl00_CPMain_ddlLeagues_ddlLeagues', 0);
                break;
     
                case 'statsNationalTeams' :
                    this._changelist(page, doc, 'ctl00_CPMain_ddlLeagues_ddlLeagues', 0);
                break;
     
                case 'statsConfs' :
                    this._changelist(page, doc, 'ctl00_CPMain_ddlLeagues_ddlLeagues', 0);
                break;
     
                case 'statsBookmarks' :
                    this._changelist(page, doc, 'ctl00_CPMain_ddlLeagues_ddlLeagues', 0);
                break;
     
                case 'trainingStats' :
                    this._changelist(page, doc, 'ctl00_CPMain_ddlLeagues', 1);
                break;

                case 'statsArena' :
                    this._changelist(page, doc, 'ctl00_CPMain_ucLeaguesDropdown_ddlLeagues', 0);
                break;

                case 'help_contact' :
                    this._changelist(page, doc, 'ctl00_CPMain_ucLeaguesDropdown_ddlLeagues', 3);
                break;
                
                
            }
        }
        
        if (Foxtrick.isModuleFeatureEnabled( this, "TeamPage")) {
            switch (page) {
                case 'teamPage' :
                    this._placeCountry(page, doc, 'ctl00_CPMain_ddlLeagues', 1);
                break;

                case 'teamPageBrowser' :
                    this._placeCountry(page, doc, 'ctl00_CPMain_ddlLeagues', 1);
                break;
            }
        }

        if (Foxtrick.isModuleFeatureEnabled( this, "ManagerPage")) {
            switch (page) {
                case 'managerPage' :
                    this._placeCountry(page, doc, 'ctl00_CPMain_ddlLeagues', 1);
                break;
            }
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
    
    _placeCountry: function (page, doc) {
        var cntr = doc.getElementById( 'ft_cntr_fix' );
		if( cntr == null ) {
            var league = Foxtrick.getElementsByClass("flag inner", doc)[0];
            if (!league) return;
            if (Foxtrick.isModuleFeatureEnabled( this, "HideFlagOntop")) {
                league.setAttribute('style', 'display:none');
            }
            var byline = Foxtrick.getElementsByClass("byline", doc)[0];
            byline.innerHTML = '<a id="ft_cntr_fix" href="'+league.href+'">' + league.firstChild.title + '</a>,' + byline.innerHTML;
        }
    },
    
    _changelist: function (page, doc, id, start) {
        var selectbox = doc.getElementById(id);
        if (selectbox == null) return;
        //dump('GO ' + '\n');
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
                    //dump("value: " + country + ' || ' + htname + ' - ');
                    var obj = this.htCountriesXml.evaluate(path,this.htCountriesXml,null,this.htCountriesXml.DOCUMENT_NODE,null).singleNodeValue;

                    if (obj)
//                        htname = '#' + obj.attributes.getNamedItem("htname").textContent;
                        htname = obj.attributes.getNamedItem("htname").textContent;
                    //dump(country + ' || ' + htname + '\n');
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
            var x = a[1]; x=(x.search(/.+sland/)==0)?'Island':((x.search(/.+esk.+republika/)!=-1)?'Ceska republika':x);
            var y = b[1]; y=(y.search(/.+sland/)==0)?'Island':((y.search(/.+esk.+republika/)!=-1)?'Ceska republika':y);
            if (a[0] <= 0 || b[0] <= 0) return -1;
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }

        opt_array.sort(sortByOptionText);
        for(var i=0; i < opt_array.length; i++){
            if (opt_array[i][0] == id_sel) selectbox.selectedIndex = i;
            options[i].value = opt_array[i][0];
            options[i].text = opt_array[i][1];
        }
		selectbox.style.display='inline';
    }
};