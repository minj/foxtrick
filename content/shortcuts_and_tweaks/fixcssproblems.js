/**
 * Fixes for css isues
 * @author spambot
 */
 
FoxtrickFixcssProblems = {
	
    MODULE_NAME : "FixcssProblems",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    DEFAULT_ENABLED : true,
    
    OPTIONS : {},
    
    init : function() {
        Foxtrick.registerPageHandler( 'all' , this );
        this.initOptions(); 
    },

    run : function(page, doc) {
                    
        for (var i = 0; i < this.OPTIONS.length; i++) {
            
            
            if (Foxtrick.isModuleFeatureEnabled( this, this.OPTIONS[i]  ) )
                dump ('  FIXES: ' + i + ' - ' + this.OPTIONS[i] + ' enabled.\n')
            else 
                dump ('  FIXES: ' + i + ' - ' + this.OPTIONS[i] + ' disabled.\n')
            
            if (Foxtrick.isModuleFeatureEnabled( this, this.OPTIONS[i]  ) ) {
                
                var css = "chrome://foxtrick/content/resources/css/fixes/" + this.OPTIONS[i] + ".css";

                var path = "head[1]";
                var head = doc.evaluate(path,doc.documentElement,null,
                    doc.DOCUMENT_NODE,null).singleNodeValue;

                var link = doc.createElement("link");
                link.setAttribute("rel", "stylesheet");
                link.setAttribute("type", "text/css");
                link.setAttribute("media", "all");
                link.setAttribute("href", css);
                head.appendChild(link);
            }
            
        }    
                    
    },
	
	change : function( page, doc ) {

	},
        
    initOptions : function() {
		this.OPTIONS = new Array( 
                                    "Forum_Hover_Links"
								);
	}        
};