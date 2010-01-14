/**
 * Transfer list filters 
 * @author kolmis, bummerland
 */
 
FoxtrickTransferListSearchFilters = {
	
    MODULE_NAME : "TransferListSearchFilters",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('transferListSearchForm'), 
    DEFAULT_ENABLED : true,
    _MAX_FILTER_DISP_LENGTH : 23,

    backwardCompatibleCodes : {
        "_01" : "ctl00$CPMain$ddlDeadline",
        "_02" : "ctl00$CPMain$ddlAgeMin",
        "_03" : "ctl00$CPMain$ddlAgeMax",
        "_04" : "ctl00$CPMain$ddlSkill1",
        "_05" : "ctl00$CPMain$ddlSkill1Min",
        "_06" : "ctl00$CPMain$ddlSkill1Max",
        "_07" : "ctl00$CPMain$ddlSkill2",
        "_08" : "ctl00$CPMain$ddlSkill2Min",
        "_09" : "ctl00$CPMain$ddlSkill2Max",
        "_10" : "ctl00$CPMain$ddlSkill3",
        "_11" : "ctl00$CPMain$ddlSkill3Min",
        "_12" : "ctl00$CPMain$ddlSkill3Max",
        "_13" : "ctl00$CPMain$ddlSkill4",
        "_14" : "ctl00$CPMain$ddlSkill4Min",
        "_15" : "ctl00$CPMain$ddlSkill4Max",
        "_16" : "ctl00$CPMain$ddlSpecialty",
        "_17" : "ctl00$CPMain$ddlZone",
        "_18" : "ctl00$CPMain$ddlBornIn",
        "_29" : "ctl00_CPMain_txtTSIMin_text",
        "_20" : "ctl00$CPMain$txtTSIMin",
//        "_21" : "ctl00_CPMain_txtTSIMin_ClientState",
        "_22" : "ctl00_CPMain_txtTSIMax_text",
        "_23" : "ctl00$CPMain$txtTSIMax",
//        "_24" : "ctl00_CPMain_txtTSIMax_ClientState",
        "_25" : "ctl00_CPMain_txtBidMin_text",
        "_26" : "ctl00$CPMain$txtBidMin",
//        "_27" : "ctl00_CPMain_txtBidMin_ClientState",
        "_28" : "ctl00_CPMain_txtBidMax_text",
        "_29" : "ctl00$CPMain$txtBidMax",
//        "_30" : "ctl00_CPMain_txtBidMax_ClientState",
        "_31" : "ctl00$CPMain$ddlGlobalSkillMax",
        "_32" : "ctl00$CPMain$chkUseGlobalMax"
    },

    init : function() {
    },

    run : function(page, doc) {
        
        if ( doc.location.href.search(/TransfersSearchResult/i) > 0 ) return;
        
        Foxtrick.addJavaScript(doc, Foxtrick.ResourcePath+"resources/js/transferform.js");
        
        var head = doc.getElementsByTagName("head")[0];
        var style = doc.createElement("style");
        style.setAttribute("type", "text/css");
        
        var newStyle = 'div.ignore{cursor: pointer;width: 10px;height: 18px;background: url("../../Img/Icons/cross_small.png") no-repeat center center;} div.ignore:hover { background: url("../../Img/Icons/crossRed_small.png") no-repeat center center; }';
        style.appendChild(doc.createTextNode(newStyle));
        head.appendChild(style);
        
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
				ownBoxBody.appendChild(doc.createElement("br"));
		        
		    var namelist = FoxtrickPrefs.getList("transferfilterlist");
		    namelist.sort();
		    var table = doc.createElement("table");
		    table.setAttribute("id", "table_transfer_filters");
		    table.setAttribute("width", "100%");
//		    table.setAttribute("border", "1");
		    table.setAttribute("cell-padding", "3");
		    for (var i=0; i< namelist.length; i++) {

					var tr = doc.createElement("tr");
					tr.setAttribute("id", "filter_" + namelist[i]);
					
					table.appendChild(tr);
					
					var td_fname = doc.createElement("td");
					td_fname.style.width= "99%";
					tr.appendChild(td_fname);	        
					var td_remove = doc.createElement("td");
					td_remove.setAttribute("valign", "middle");
					tr.appendChild(td_remove);
					
					var link = doc.createElement("a");
					var filter = FoxtrickPrefs.getString("transferfilter." + namelist[i]);
					link.href = "javascript:FoxtrickTransferListSearchFormFiller.fillForm('" + filter +  "', document);";
					link.innerHTML = namelist[i];
					link.className = "inner";
					td_fname.appendChild(link);
					
					var remover = doc.createElement( "div" );
					remover.setAttribute( "class", "ignore" );
					remover.setAttribute( "height", "100%" );
					remover.msg = namelist[i];
					remover.addEventListener( "click", FoxtrickTransferListSearchFilters.deleteFilter, false );
					td_remove.appendChild( remover );
      }
      ownBoxBody.appendChild(table);
      Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "last", "");
    },
	
	change : function( page, doc ) {
	
	},
    addNewFilter : function(ev) {
  	    
        var doc = ev.target.ownerDocument;
        Foxtrick.addJavaScript(doc, Foxtrick.ResourcePath+"resources/js/transferform.js");
        
        var wind = ev.target.window;
        try {
            /*var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
            
            var returnobj = {};
            var b = {};
            
            promptService.prompt(wind, 'FoxTrick',
                Foxtrickl10n.getString("foxtrick.transferfilter.Enter_filter_name"), returnobj, null, b);
            
            if (returnobj == null) return;
            */
            var filtername = prompt(Foxtrickl10n.getString("foxtrick.transferfilter.Enter_filter_name"));//returnobj.value;
            if (filtername == '') return;
            
            filtername = filtername.substring( 0, FoxtrickTransferListSearchFilters._MAX_FILTER_DISP_LENGTH );
            
            var formString = "<root>";
            for (var i in FoxtrickTransferListSearchFilters.backwardCompatibleCodes) {
                var el = FoxtrickTransferListSearchFilters.findFormElement(i, doc);
                if (el == null) {
                    var subst = FoxtrickTransferListSearchFilters.backwardCompatibleCodes[i];
                    if (typeof(subst) != 'undefined') {
                        el = FoxtrickTransferListSearchFilters.findFormElement(subst, doc);
                    }
                }
                if (el != null && el.type != "radio" && el.type != "checkbox" ) {
					if (el.value.search('{')!=-1) continue;  // don't save hidden imputs
                    formString = formString + "<elem>";
                    formString = formString + "<name>" + i + "</name>";
                    formString = formString + "<value>" + el.value + "</value>";
                    formString = formString + "</elem>";           
					//Foxtrick.dump(i+'\t'+el.value+'\n');               					
                }
                
                if (el != null && el.type != "radio" && el.type == "checkbox" ) {
                    formString = formString + "<elem>";
                    formString = formString + "<name>" + i + "</name>";
                    formString = formString + "<value>" + el.checked + "</value>";
                    formString = formString + "</elem>";   
					//Foxtrick.dump(i+'\t'+el.checked+'\n');               					
                }                
            }
            formString = formString + "</root>";
            
            var namelist = FoxtrickPrefs.getList("transferfilterlist");
            var bExists = false;
            for (var i=0; i< namelist.length; i++) {
            	if (namelist[i] == filtername){
            		bExists = true;
            		break;
            	}
            }
            FoxtrickPrefs.setString("transferfilter." + filtername, formString);
            if (bExists){
            	FoxtrickPrefs.delListPref("transferfilterlist", filtername);
            	var el = doc.getElementById("filter_" + filtername);
		        	if (el)
		                el.parentNode.removeChild(el);
            }
            FoxtrickPrefs.addPrefToList("transferfilterlist", filtername);
            var table = doc.getElementById("table_transfer_filters");
            if (table) {
                var tr = doc.createElement("tr");
                tr.setAttribute("id", "filter_" + filtername);
                var td_fname = doc.createElement("td");
                td_fname.style.width= "99%";
                var td_remove = doc.createElement("td");
                
                table.appendChild(tr);
                tr.appendChild(td_fname);
            		tr.appendChild(td_remove);
                
                var link = doc.createElement("a");
                var filter = FoxtrickPrefs.getString("transferfilter." + filtername);
                link.href = "javascript:FoxtrickTransferListSearchFormFiller.fillForm('" + formString +  "', document);";
                link.innerHTML = filtername;
                td_fname.appendChild(link);
                    
                var remover = doc.createElement( "div" );
                remover.setAttribute( "class", "ignore" );
                remover.msg = filtername;
                remover.addEventListener( "click", FoxtrickTransferListSearchFilters.deleteFilter, false );
                
                td_remove.appendChild( remover );
            }
        } catch (e) {
            Foxtrick.dump('FoxtrickTransferListSearchFilters'+e);
        }
    },
    
    deleteFilter : function( ev ) {
        var doc = ev.target.ownerDocument;
        if ( Foxtrick.confirmDialog( Foxtrickl10n.getString( 'foxtrick.transferfilter.delete_filter_ask' ) ) )
        {
          FoxtrickPrefs.delListPref( "transferfilterlist", ev.target.msg );
          FoxtrickPrefs.deleteValue("transferfilter." + ev.target.msg);
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