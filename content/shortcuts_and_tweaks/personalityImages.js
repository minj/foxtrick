/**
 * personalityImages.js
 * Script which add character image
 * @author smates
 */

var FoxtrickPersonalityImages = {
	
    MODULE_NAME : "PersonalityImages",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	DEFAULT_ENABLED : true,
	
    init : function() {
            Foxtrick.registerPageHandler( 'playerdetail',
                                          FoxtrickPersonalityImages);
    },

    run : function( page, doc ) {
        // dump(this.MODULE_NAME + '\n');
		var css = "chrome://foxtrick/content/resources/personality/"+
			"characters.css";
		var path = "head[1]";
		var head = doc.evaluate(path,doc.documentElement,null,
			doc.DOCUMENT_NODE,null).singleNodeValue;

		var link = doc.createElement("link");
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("type", "text/css");
		link.setAttribute("media", "all");
		link.setAttribute("href", css);
		head.appendChild(link);
	},
	
	change : function( page, doc ) {
	
	}
};