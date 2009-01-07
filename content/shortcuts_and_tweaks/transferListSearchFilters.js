/**
 * Transfer list filters 
 * @author kolmis, bummerland
 */
 
FoxtrickTransferListSearchFilters = {
	
    MODULE_NAME : "TransferListSearchFilters",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    DEFAULT_ENABLED : true,
    _MAX_FILTER_DISP_LENGTH : 23,
    backwardCompatibleCodes : {
        "deadlineID" : "ctl00$CPMain$ddlDeadline",
        "LeagueID" : "ctl00$CPMain$ddlZone",
        "CountryID" : "ctl00$CPMain$ddlBornIn",  
        "minAge" : "ctl00$CPMain$ddlAgeMin",
        "maxAge" : "ctl00$CPMain$ddlAgeMax",
        "specialty": "ctl00$CPMain$ddlSpecialty",
        "minValue" : "ctl00_CPMain_txtTSIMin",
        "maxValue" : "ctl00_CPMain_txtTSIMin",
        "SkillType1" : "ctl00$CPMain$ddlSkill1",
        "SkillMin1" : "ctl00$CPMain$ddlSkill1Min",
        "SkillMax1" : "ctl00$CPMain$ddlSkill1Max",
        "SkillType2" : "ctl00$CPMain$ddlSkill2",
        "SkillMin2" : "ctl00$CPMain$ddlSkill2Min",
        "SkillMax2" : "ctl00$CPMain$ddlSkill2Max",
        "SkillType3" : "ctl00$CPMain$ddlSkill3",
        "SkillMin3" : "ctl00$CPMain$ddlSkill3Min",
        "SkillMax3" : "ctl00$CPMain$ddlSkill3Max",
        "SkillType4" : "ctl00$CPMain$ddlSkill4",
        "SkillMin4" : "ctl00$CPMain$ddlSkill4Min",
        "SkillMax4" : "ctl00$CPMain$ddlSkill4Max",
        "minBid" : "ctl00_CPMain_txtBidMin_text",
        "maxBid" : "ctl00_CPMain_txtBidMax_text",
        "SortOrder" : "ctl00$CPMain$rdSort"
    },


    init : function() {
        Foxtrick.registerPageHandler('transferListSearchForm', this);
    },

    run : function(page, doc) {
    
        Foxtrick.addJavaScript(doc, "chrome://foxtrick/content/resources/js/transferform.js");
        var ownBoxBody = doc.createElement("div");
		var header = Foxtrickl10n.getString(
                "foxtrick.transferfilter.Foxtrick_Filters" );
		var ownBoxId = "foxtrick_transferfilter_box";
		var ownBoxBodyId = "foxtrick_transferfilter_content";
		ownBoxBody.setAttribute( "id", ownBoxBodyId );
	      
	    // add link
        var addlink = doc.createElement("a");
		addlink.href = "javascript:void(0);";
		addlink.className = "inner";
		addlink.addEventListener( "click", FoxtrickTransferListSearchFilters.addNewFilter, false );
		addlink.innerHTML = Foxtrickl10n.getString("foxtrick.transferfilter.save_new_filter");
		ownBoxBody.appendChild(addlink);
		ownBoxBody.appendChild(doc.createElement("br"));
        
        var namelist = FoxtrickPrefs.getList("transferfilterlist");
        namelist.sort();
        var namelist = FoxtrickPrefs.getList("transferfilterlist");
        namelist.sort();
        var table = doc.createElement("table");
        table.setAttribute("id", "table_transfer_filters");
        table.setAttribute("width", "100%");
        table.style.padding = "2px";
        for (var i=0; i< namelist.length; i++) {

            var tr = doc.createElement("tr");
	        tr.setAttribute("id", "filter_" + namelist[i]);
	        
            var td_remove = doc.createElement("td");
	        table.appendChild(tr);
	        tr.appendChild(td_remove);
            
            var td_fname = doc.createElement("td");
            td_fname.style.width= "100%";
            tr.appendChild(td_fname);	        
	        
	      	var link = doc.createElement("a");
			var filter = FoxtrickPrefs.getString("transferfilter." + namelist[i]);
			link.href = "javascript:FoxtrickTransferListSearchFormFiller.fillForm('" + filter +  "', document);";
			link.innerHTML = namelist[i];
			link.className = "inner";
			td_fname.appendChild(link);
			
            var remover = doc.createElement( "img" );
            remover.setAttribute( "class", "ignore" );
            remover.msg = namelist[i];
            remover.href="javascript:void(0);";
            remover.addEventListener( "click", FoxtrickTransferListSearchFilters.deleteFilter, false );
            remover.src = "chrome://foxtrick/content/resources/linkicons/cross_bigger.png";
            td_remove.appendChild( remover );
      }
      ownBoxBody.appendChild(table);
      Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "last", "");
    },
	
	change : function( page, doc ) {
	
	},
    addNewFilter : function(ev) {
  	    
        var doc = ev.target.ownerDocument;
        Foxtrick.addJavaScript(doc, "chrome://foxtrick/content/resources/js/transferform.js");
        
        var wind = ev.target.window;
        try {
            var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
            
            var returnobj = {};
            var b = {};
            
            promptService.prompt(wind, 'FoxTrick',
                Foxtrickl10n.getString("foxtrick.transferfilter.Enter_filter_name"), returnobj, null, b);
            
            if (returnobj == null) return;
                        
            var filtername = returnobj.value;
            if (filtername == '') return;
            
            filtername = filtername.substring( 0, FoxtrickTransferListSearchFilters._MAX_FILTER_DISP_LENGTH );
            
            var formString = "<root>";
            for (i in FoxtrickTransferListSearchFilters.backwardCompatibleCodes) {
                var el = FoxtrickTransferListSearchFilters.findFormElement(i, doc);
                if (el == null) {
                    var subst = FoxtrickTransferListSearchFilters.backwardCompatibleCodes[i];
                    if (typeof(subst) != 'undefined') {
                        el = FoxtrickTransferListSearchFilters.findFormElement(subst, doc);
                    }
                }
                if (el != null && el.type != "radio") {
                    formString = formString + "<elem>";
                    formString = formString + "<name>" + i + "</name>";
                    formString = formString + "<value>" + el.value + "</value>";
                    formString = formString + "</elem>";           
                }
            }
            formString = formString + "</root>";
                    
            FoxtrickPrefs.setString("transferfilter." + filtername, formString);
            FoxtrickPrefs.addPrefToList("transferfilterlist", filtername);
            var table = doc.getElementById("table_transfer_filters");
            if (table) {
                var tr = doc.createElement("tr");
                tr.setAttribute("id", "filter_" + filtername);
                var td_fname = doc.createElement("td");
                td_fname.style.width= "100%";
                var td_remove = doc.createElement("td");
                //td_remove.setAttribute( "class", "ignore" );
                //td_remove.setAttribute( "align", "left" );
                //td_remove.setAttribute( "width", "20px" );
                //td_remove.style.width = "20px" ;

                table.appendChild(tr);
                tr.appendChild(td_remove);
                tr.appendChild(td_fname);
            
                var link = doc.createElement("a");
                var filter = FoxtrickPrefs.getString("transferfilter." + filtername);
                link.href = "javascript:FoxtrickTransferListSearchFormFiller.fillForm('" + formString +  "', document);";
                link.innerHTML = filtername;
                td_fname.appendChild(link);
                    
                var remover = doc.createElement( "img" );
                remover.setAttribute( "class", "ignore" );
                remover.msg = filtername;
                remover.href="javascript:void(0);";
                remover.addEventListener( "click", FoxtrickTransferListSearchFilters.deleteFilter, false );
                remover.src = "chrome://foxtrick/content/resources/linkicons/cross_bigger.png";
                
                td_remove.appendChild( remover );
            }
        } catch (e) {
            dump(e);
        }
    },
    
    deleteFilter : function( ev ) {
        var doc = ev.target.ownerDocument;
        if ( Foxtrick.confirmDialog( Foxtrickl10n.getString( 'foxtrick.transferfilter.delete_filter_ask' ) ) )
        {
            FoxtrickPrefs.delListPref( "transferfilterlist", ev.target.msg );
        	var el = doc.getElementById("filter_" + ev.target.msg);
        	if (el)
                el.parentNode.removeChild(el);
        }
    },
    
    
    findFormElement : function(name, doc) {
        var els = doc.getElementsByName(name);
        if (els.length > 0) return els[0];
        return null;
    }
    
};