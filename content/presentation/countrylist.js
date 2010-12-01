/**
* countrylist.js
* displays country names in dropdown in different way
* @author spambot
*/

var FoxtrickCountyList = {

	MODULE_NAME : "CountryList",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
    PAGES : new Array ( 'country', 'transferSearchForm', 'ads', 'press',
                        'statsTransfersBuyers', 'statsTeams', 'statsPlayers',
                        'statsRegions', 'statsNationalTeams', 'statsConfs', 'statsBookmarks',
                        'trainingStats', 'teamPage', 'teamPageBrowser', 'managerPage', 'statsArena',
                        'help_contact'
                        ),
    OPTIONS :  new Array("SelectBoxes","TeamPage","ManagerPage", "HideFlagOntop"),
	NEW_AFTER_VERSION: "0.5.0.0",
	LATEST_CHANGE:"Fixed module not working",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.FIX,
	CSS: Foxtrick.ResourcePath+"resources/css/CountyList.css",

	run : function( page, doc ) {
		var list = doc.getElementById( 'ft_countrylist' );
		if( list != null ) return;
        if (Foxtrick.isModuleFeatureEnabled( this, "SelectBoxes")) {
            switch (page) {
                case 'transferSearchForm' :
                    this._changelist(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlZone', 10);
                    this._changelist(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlBornIn', 1);
                break;

                case 'country' :
                    this._changelist(page, doc, 'ctl00_ctl00_CPContent_CPMain_ucLeaguesDropdown_ddlLeagues', 0);
                break;

                case 'ads' :
                    this._changelist(page, doc, 'ctl00_ctl00_CPContent_CPMain_ucLeaguesDropdown_ddlLeagues', 0);
                break;

                case 'press' :
                    this._changelist(page, doc, 'ctl00_CPSidebar_ucLeagues2_ddlLeagues', 1);
                break;

                case 'statsTransfersBuyers' :
                    this._changelist(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues', 1);
                break;

                case 'statsTeams' :
                    this._changelist(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues', 0);
                break;

                case 'statsPlayers' :
                    this._changelist(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues', 0);
                break;

                case 'statsRegions' :
                    this._changelist(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues', 0);
                break;

                case 'statsNationalTeams' :
                    this._changelist(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues', 0);
                break;

                case 'statsConfs' :
                    this._changelist(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues', 0);
                break;

                case 'statsBookmarks' :
                    this._changelist(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues', 0);
                break;

                case 'trainingStats' :
                    this._changelist(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues', 1);
                break;

                case 'statsArena' :
                    this._changelist(page, doc, 'ctl00_ctl00_CPContent_CPMain_ucLeaguesDropdown_ddlLeagues', 0);
                break;

                case 'help_contact' :
                    this._changelist(page, doc, 'ctl00_ctl00_CPContent_CPMain_ucLeaguesDropdown_ddlLeagues', 3);
                break;


            }
        } else {
            switch (page) {
                case 'transferSearchForm' :
                    this._activate(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlZone');
                    this._activate(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlBornIn');
                break;

                case 'country' :
                    this._activate(page, doc, 'ctl00_ctl00_CPContent_CPMain_ucLeaguesDropdown_ddlLeagues');
                break;

                case 'ads' :
                    this._activate(page, doc, 'ctl00_ctl00_CPContent_CPMain_ucLeaguesDropdown_ddlLeagues');
                break;

                case 'press' :
                    this._activate(page, doc, 'ctl00_CPSidebar_ucLeagues2_ddlLeagues');
                break;

                case 'statsTransfersBuyers' :
                    this._activate(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues');
                break;

                case 'statsTeams' :
                    this._activate(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues');
                break;

                case 'statsPlayers' :
                    this._activate(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues');
                break;

                case 'statsRegions' :
                    this._activate(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues');
                break;

                case 'statsNationalTeams' :
                    this._activate(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues');
                break;

                case 'statsConfs' :
                    this._activate(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues');
                break;

                case 'statsBookmarks' :
                    this._activate(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues_ddlLeagues');
                break;

                case 'trainingStats' :
                    this._activate(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues');
                break;

                case 'statsArena' :
                    this._activate(page, doc, 'ctl00_ctl00_CPContent_CPMain_ucLeaguesDropdown_ddlLeagues');
                break;

                case 'help_contact' :
                    this._activate(page, doc, 'ctl00_ctl00_CPContent_CPMain_ucLeaguesDropdown_ddlLeagues');
                break;
            }
        }

        if (Foxtrick.isModuleFeatureEnabled( this, "TeamPage")) {
            switch (page) {
                case 'teamPage' :
                    this._placeCountry(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues', 1);
                break;

                case 'teamPageBrowser' :
                    this._placeCountry(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues', 1);
                break;
            }
        }

        if (Foxtrick.isModuleFeatureEnabled( this, "ManagerPage")) {
            switch (page) {
                case 'managerPage' :
                    this._placeCountry(page, doc, 'ctl00_ctl00_CPContent_CPMain_ddlLeagues', 1);
                break;
            }
        }

	},

	/*change : function( page, doc ) {
		return;
        var list = doc.getElementById( 'ft_countrylist' );
		if( list == null ) {
			this.run( page, doc );
		}
	},*/

    _placeCountry: function (page, doc) {
        var cntr = doc.getElementById( 'ft_cntr_fix' );
		if( cntr == null ) {
            var league = doc.getElementById("mainWrapper").getElementsByClassName("flag")[0];
            if (!league) return;
            if (Foxtrick.isModuleFeatureEnabled( this, "HideFlagOntop")) {
                league.setAttribute('style', 'display:none');
            }
            Foxtrick.dump(league.href+'\n');
			leaguenum = league.href.match(/LeagueID=(\d+)/i)[1];
			Foxtrick.dump('leaguenum: '+leaguenum+'\n');
			var htname = league.firstChild.title;
			htname = FoxtrickHelper.getLeagueDataFromId(leaguenum).LeagueName;
			league.firstChild.title = htname

			var byline = doc.getElementsByClassName("byline")[0];
            byline.innerHTML = '<a id="ft_cntr_fix" href="'+league.href+'">' + htname + '</a>,' + byline.innerHTML;
        }
    },

    _changelist: function (page, doc, id, start) {
		var selectbox = doc.getElementById(id);
        if (selectbox == null) return;
        Foxtrick.dump('id: ' + id +'   start: '+ start+'\n');
        var options = selectbox.options;
        var countries = options.length;
        var selected  = selectbox.selectedIndex;
        var id_sel = 0;
        try {
            for (var i = start; i < countries; i++) {
                if (Foxtrick.BuildFor=='Chrome') { if (options[i].getAttribute('selected')) id_sel = options[i].value;}
				else { if (i == selected) id_sel = options[i].value;}
                try {
                    if (id.search(/leagues/i)!=-1 || id.search(/zone/i)!=-1) {var league = options[i].value;  }
					else {var league = Foxtrick.XMLData.getLeagueIdByCountryId(options[i].value); }
					var htname = options[i].text;
					//Foxtrick.dump((start>=10)+' '+options[i].value+' '+league+' '+htname+'\n');
                    htname = FoxtrickHelper.getLeagueDataFromId(league).LeagueName;
					if (!htname) return -1;
					options[i].text = htname;

                } catch (exml) {
                    Foxtrick.dump('countrylist.js countries: '+exml + "\n");
                }
            }
        } catch(e) {Foxtrick.dump('countrylist: '+e+'\n');}


        var opt_array = new Array();
        try{
            for( var i = start; i < options.length; i++){
                var oldopt = new Array('-1', '-1');
                oldopt[0] = options[i].value;
                oldopt[1] = options[i].text;
		//		Foxtrick.dump(i+'  '+oldopt[0]+' '+oldopt[1]+'\n');
                opt_array.push(oldopt);
			}
        } catch (epush) {Foxtrick.dump('countrylist: EPUSH '+epush+'\n');}

        function sortByOptionText(a, b) {
            var x = a[1]; x=(x.search(/.+sland/)==0)?'Island':((x.search(/.+esk.+republika/)!=-1)?'Ceska republika':x);
            var y = b[1]; y=(y.search(/.+sland/)==0)?'Island':((y.search(/.+esk.+republika/)!=-1)?'Ceska republika':y);
//            if (parseInt(a[0]) <= 0 || parseInt(b[0]) <= 0) return -1;  // not working well in chrome. should be compare values also
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        }

        opt_array.sort(sortByOptionText);
		for(var i=0; i < options.length; i++){
            if (i>=start) {
				if (opt_array[i-start][0] == id_sel) selectbox.selectedIndex = i;
				options[i].value = opt_array[i-start][0];
				options[i].text = opt_array[i-start][1];
		//		Foxtrick.dump(i+'  '+options[i].value+' '+options[i].text+'\n');
			}
        }
		selectbox.style.display='inline';
    },

    _activate: function (page, doc, id) {
        var selectbox = doc.getElementById(id);
        if (selectbox == null) return;
		selectbox.style.display='inline';
        Foxtrick.dump('country select activated.\n');
    }
};
