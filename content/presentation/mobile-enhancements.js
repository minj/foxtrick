/**
 * mobile-enhancements.js
 * Collection of enhancements using mobile device/fennec
 * @author convinced
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickMobileEnhancements = {
	MODULE_NAME : "MobileEnhancements",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["all"],

	run : function(doc) {
		Foxtrick.log('MobileEnhancements run');
		// rescale to use all space 
		var meta = doc.createElement('meta');
		meta.setAttribute('name',"viewport" );
		meta.setAttribute('content',"width = device-width" );
		doc.getElementsByTagName('html')[0].insertBefore(meta, doc.getElementsByTagName('html')[0].firstChild);
	}
};
//if (typeof(fennec)==='object')  
Foxtrick.util.module.register(FoxtrickMobileEnhancements);
