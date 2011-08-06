/**
 * loader_chrome.js
 * Foxtrick loader
 * @author  convincedd
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.loader)
	Foxtrick.loader = {};
Foxtrick.loader.chrome = {};


// invoked when an allowed HTML document is load started
Foxtrick.loader.chrome.docLoadStart = function() {
	try {
		if ( !Foxtrick.isHtUrl(document.location.href) )  return;
		
		// check if it's in exclude list
		for (var i in Foxtrick.pagesExcluded) {
			var excludeRe = new RegExp(Foxtrick.pagesExcluded[i], "i");
			// page excluded, return
			if (document.location.href.search(excludeRe) > -1) {
				return;
			}
		}

		// request resources from background script
		// calls/adds Foxtrick.loader.chrome.docLoadEnd 
		sandboxed.extension.sendRequest({ req : "init" },
		function (data) {
			try {
				if (data.error) Foxtrick.log(data.error);
				
				var begin = new Date();
				
				Foxtrick.entry.setRetrievedLocalResources(data);
				
				if ( (FoxtrickPrefs.getBool("disableOnStage")
						&& Foxtrick.isStage(document))
					|| FoxtrickPrefs.getBool("disableTemporary")) {
					// not on Hattrick or disabled
					Foxtrick.log(' Foxtrick disabled');
					return;
				}

				var moduleCss = document.getElementById("ft-module-css");
				// remove old CSS if exists
				if (moduleCss)
					moduleCss.parentNode.removeChild(moduleCss);
				// inject CSS
				Foxtrick.util.inject.css(document, data.cssText, "ft-module-css");

				Foxtrick.entry.cssLoaded = true;
				Foxtrick.entry.init();

				var initTime = new Date() - begin.getTime();
				Foxtrick.log("init time: " , initTime , " ms");

				// opera/safari: listen to clipboard paste
				if ( typeof(opera)=='object' || typeof(safari)=='object')  
					window.addEventListener('mouseup', Foxtrick.loader.chrome.clickListener, false);
				// safari: set context menu info
				if ( typeof(safari)=='object' ) {
					document.addEventListener("contextmenu", function(event) {
						safari.self.tab.setContextMenuEventUserInfo(event, {nodeName:event.target.nodeName, href: event.target.href});
					}, false);
					Foxtrick.loader.chrome.initGrowl();
				}

				// if ht doc is already loaded start now, else wait till loaded
				if (Foxtrick.isHt(document)) {
					Foxtrick.log('Ht domument ready. Run now.'); 
					Foxtrick.entry.docLoad();
				}
				else {
					Foxtrick.log('Wait for DOMContentLoaded');
					window.addEventListener("DOMContentLoaded", Foxtrick.entry.docLoad, false);
				}
			} catch(e) {Foxtrick.log('loader init: ', e);}
		});
	} catch(e) {Foxtrick.log(e);}
};

Foxtrick.loader.chrome.clickListener = function(e) {
	if ( typeof(e.target.tagName) != "undefined" && 
		(( e.target.tagName == 'INPUT' && e.target.type=='text') || // text imput
		e.target.tagName=='TEXTAREA') &&	// or text area
		e.button == 0 && 		// left mouse button
		e.shiftKey == true ) { 	// our special key we listen too
		
		Foxtrick.sessionGet('clipboard', function(text) {
			if (text) {
				// insert clipboard at current position
				ta = e.target;
				var s = FoxtrickForumYouthIcons.getSelection(ta);
				// Opera, Mozilla
				if (ta.selectionStart || ta.selectionStart == '0') {
					var st = ta.scrollTop;
					ta.value = s.textBeforeSelection+
								text + 
								s.textAfterSelection;
					ta.scrollTop = st;
				}
				// Others
				else {
					ta.value += text;
				}
			}
		});
	}
};

Foxtrick.loader.chrome.initGrowl = function () {
  try {
	var object = document.createElement('object');	
	object.setAttribute('type', "application/x-growl-safari-bridge");
	object.width = '0';
	object.height = '0';
	object.id = "growl-safari-bridge";
	document.getElementByTagName('body')[0].appendChild(object);
	window.GrowlSafariBridge = object;
  } catch(e) {Foxtrick.log(e);}
};

Foxtrick.loader.chrome.docLoadStart();
