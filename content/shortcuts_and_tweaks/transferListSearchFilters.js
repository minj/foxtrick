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
    }
    
};