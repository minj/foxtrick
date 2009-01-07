/**
 * Transfer list filters 
 * @author kolmis
 */
 
FoxtrickTransferListSearchFilters = {
	
    MODULE_NAME : "TransferListSearchFilters",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    DEFAULT_ENABLED : true,

    init : function() {
        Foxtrick.registerPageHandler('transferListSearchForm', this);
    },

    run : function(page, doc) {
    
        Foxtrick.addJavaScript(doc, "chrome://foxtrick/content/resources/js/transferform.js");
        
        var sidebar = doc.getElementById('sidebar');
        var div = doc.createElement("div");
        div.className = "sidebarBox";
        div.innerHTML = '<div class="boxHead"><div class="boxLeft"><h2>Foxtrick Filters</h2></div></div>';
        sidebar.appendChild(div);
        
        var temp = doc.createElement('div');
        temp.className = 'boxBody';
        div.appendChild(temp);
        
        // add link
        var link = doc.createElement("a");
				link.href = "javascript:FoxtrickTransferListSearchFilters.addFilter(document);";
				link.innerHTML = "newfilter";
				temp.appendChild(link);
				temp.appendChild(doc.createElement("br"));
        
        // filters
        var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
        var branch = prefObj.getBranch("foxtrick.formfiller.");
        
        var aCount = {value:0}; 
        
        var list = branch.getChildList("", aCount);
        list.sort();
        
        if (aCount.value>0) {
            for (var i=0; i< list.length; i++) {
                var link = doc.createElement("a");
                var filter = this.getTransferSearchFormFilter(list[i]);
                link.href = "javascript:FoxtrickTransferListSearchFormFiller.fillForm('" + filter +  "', document);";
                link.innerHTML = list[i];
                temp.appendChild(link);
                temp.appendChild(doc.createElement("br"));
            }
        }
    },
	
	change : function( page, doc ) {
	
	},
    
  getTransferSearchFormFilter : function(filterName) {
      var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
      var branch = prefObj.getBranch("foxtrick.formfiller.");
      return branch.getCharPref(filterName);
  },
  
  addFilter : function(doc) {
    
       try {
        	dump("adding...\n");
        	dump("1\n");
        	var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].getService(Components.interfaces.nsIPromptService);
       		dump("2\n");
        	
					var returnobj = {};
					var b = {};
					
					promptService.prompt(window, '',
					            messageBundle.GetStringFromName("foxtrick.menu.selectfiltername"), returnobj, null, b);
					
					dump("3\n");
        	if (returnobj == null) return;
					            
					var filtername = returnobj.value;
					filtername = "fdsfsd";
					if (filtername == null) return;
					
					//       var form = getTransferSearchFrame(window._content.document);
					//       var formString = getXmlFormFiller(form);
					var formString = "sdfasfaf";
					
					var prefObj = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
					var branch = prefObj.getBranch("foxtrick.formfiller.");
					branch.setCharPref(filtername, formString);
           
        } catch (e) {
            dump(e);
        }
    }
    
};