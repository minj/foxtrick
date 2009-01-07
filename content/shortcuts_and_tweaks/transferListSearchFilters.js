/**
 * Transfer list filters 
 * @author kolmis, bummerland
 */
 
FoxtrickTransferListSearchFilters = {
	
    MODULE_NAME : "TransferListSearchFilters",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    DEFAULT_ENABLED : true,
    
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
				addlink.href = "#addnewfilter";
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
        table.setAttribute("width", "100%");
        for (var i=0; i< namelist.length; i++) {
        
	        var tr = doc.createElement("tr");
	        var td1 = doc.createElement("td");
	        var td2 = doc.createElement("td");
	        td2.setAttribute( "class", "ignore" );
	        td2.setAttribute( "align", "right" );
	        table.appendChild(tr);
	        tr.appendChild(td1);
	        tr.appendChild(td2);
	        
	      	var link = doc.createElement("a");
					var filter = FoxtrickPrefs.getString("transferfilter." + namelist[i]);
					link.href = "javascript:FoxtrickTransferListSearchFormFiller.fillForm('" + filter +  "', document);";
					link.innerHTML = namelist[i];
					td1.appendChild(link);
	//				temp.appendChild(doc.createElement("br"));
					
					var remover = doc.createElement( "a" );
	        // remover.style.marginRight = "1em";
	        // remover.setAttribute( "href", "javascript:void(0)" );
	        remover.setAttribute( "class", "ignore" );
	        remover.innerHTML = "X";
	        remover.msg = namelist[i];
	        remover.href="#addnewfilter";
	        remover.addEventListener( "click", FoxtrickTransferListSearchFilters.deleteFilter, false );
	        td2.appendChild( remover );
                
      }
      ownBoxBody.appendChild(table);
			Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "last", "");
			
			
			
			
			
			
//        var sidebar = doc.getElementById('sidebar');
//        var div = doc.createElement("div");
//        div.className = "sidebarBox";
//        div.innerHTML = '<div class="boxHead"><div class="boxLeft"><h2>Foxtrick Filters</h2></div></div>';
//        sidebar.appendChild(div);
//        
//        var temp = doc.createElement('div');
//        temp.className = 'boxBody';
//        div.appendChild(temp);
//        
//        // add link
//
//        var addlink = doc.createElement("a");
//				addlink.href = "#addnewfilter";
//				addlink.name = "addnewfilter";
//				addlink.addEventListener( "click", FoxtrickTransferListSearchFilters.addNewFilter, false );
//				addlink.innerHTML = Foxtrickl10n.getString("foxtrick.transferfilter.save_new_filter");
//				temp.appendChild(addlink);
//				temp.appendChild(doc.createElement("br"));
        
//				var namelist = FoxtrickPrefs.getList("transferfilterlist");
//        namelist.sort();
//        var table = doc.createElement("table");
//        table.setAttribute("width", "100%");
//        for (var i=0; i< namelist.length; i++) {
//        
//	        var tr = doc.createElement("tr");
//	        var td1 = doc.createElement("td");
//	        var td2 = doc.createElement("td");
//	        td2.setAttribute( "class", "ignore" );
//	        td2.setAttribute( "align", "right" );
//	        table.appendChild(tr);
//	        tr.appendChild(td1);
//	        tr.appendChild(td2);
//	        
//	      	var link = doc.createElement("a");
//					var filter = FoxtrickPrefs.getString("transferfilter." + namelist[i]);
//					link.href = "javascript:FoxtrickTransferListSearchFormFiller.fillForm('" + filter +  "', document);";
//					link.innerHTML = namelist[i];
//					td1.appendChild(link);
//	//				temp.appendChild(doc.createElement("br"));
//					
//					var remover = doc.createElement( "a" );
//	        // remover.style.marginRight = "1em";
//	        // remover.setAttribute( "href", "javascript:void(0)" );
//	        remover.setAttribute( "class", "ignore" );
//	        remover.innerHTML = "X";
//	        remover.msg = namelist[i];
//	        remover.href="#addnewfilter";
//	        remover.addEventListener( "click", FoxtrickTransferListSearchFilters.deleteFilter, false );
//	        td2.appendChild( remover );
//                
//      }
//      temp.appendChild(table);

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
					
					promptService.prompt(wind, '',
					            Foxtrickl10n.getString("foxtrick.transferfilter.Enter_filter_name"), returnobj, null, b);
					
					if (returnobj == null) return;
					            
					var filtername = returnobj.value;
					if (filtername == null) return;
					
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
					
//					var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
//					var branch = prefObj.getBranch("foxtrick.formfiller.");
//					branch.setCharPref(filtername, formString);
						FoxtrickPrefs.setString("transferfilter." + filtername, formString);
						FoxtrickPrefs.addPrefToList("transferfilterlist", filtername);
        } catch (e) {
            dump(e);
        }
    },
    
  deleteFilter : function( ev ) {
        if ( Foxtrick.confirmDialog( Foxtrickl10n.getString( 'foxtrick.transferfilter.delete_filter_ask' ) ) )
        {
        	   FoxtrickPrefs.delListPref( "transferfilterlist", ev.target.msg );
            // ev.target.nextSibling.parentNode.removeChild( ev.target.nextSibling );
            // ev.target.parentNode.removeChild( ev.target );
            // remove whole <tr>
//            ev.target.parentNode.parentNode.parentNode.removeChild( ev.target.parentNode.parentNode );
        }
    },
    
    
    findFormElement : function(name, doc) {
        var els = doc.getElementsByName(name);
        if (els.length > 0) return els[0];
        return null;
    }
    
};