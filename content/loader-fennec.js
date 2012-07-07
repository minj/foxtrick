"use strict";
/*
 * loader-fennec.js
 * FoxTrick loader for Fennec platform
 */


if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.loader)
	Foxtrick.loader = {};

// fennec tab load. starts the content instances for fennec (one per tab. persistant)
// this is the content side entry point for fennec
if (Foxtrick.platform == "Android") {

	Foxtrick.loader.fennec_content = {
		DOMContentLoaded : function(ev) {
			// DOM ready. run on DOM page
			Foxtrick.entry.docLoad(ev.originalTarget);
		},
		
		stop : function() {
			Foxtrick.unload_module_css();
			removeEventListener("DOMContentLoaded", Foxtrick.loader.fennec_content.DOMContentLoaded, false);
		},
		
		init : function() {
			// listen to unload request
			sandboxed.extension.onRequest.addListener(function(request, sender, sendResponse){
				if (request == "unload"){
					Foxtrick.loader.fennec_content.stop();
				}
			});
			
			// request needed data from background and start with DOMContentLoaded
			sandboxed.extension.sendRequest({ req : "tabLoad" },
				function (data) {
					Foxtrick.entry.contentScriptInit(data);
					addEventListener("DOMContentLoaded", Foxtrick.loader.fennec_content.DOMContentLoaded, false);
				}
			);
		}
	};
	
	// first content side entry point. gets executed after scripts are loaded
	Foxtrick.loader.fennec_content.init();
}


