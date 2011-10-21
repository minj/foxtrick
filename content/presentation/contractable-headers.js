"use strict";
/**
 * contractable-headers.js
 * Foxtrick team select box
 * @author convinced
 */

Foxtrick.util.module.register({
	MODULE_NAME : "ContractableHeaders",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : ["all"],
	NICE : +20, // after we add own h2s

	run : function(doc) {
		
		var toggle = function(h2) {
			Foxtrick.toggleClass(h2, 'ft-expander-expanded');
			Foxtrick.toggleClass(h2, 'ft-expander-unexpanded');
			FoxtrickPrefs.setBool('ContractableHeaders.'+doc.location.pathname+'.'+h2.textContent+'.folded', Foxtrick.hasClass(h2,'ft-expander-unexpanded'));

			// go though all children and toggle 'hidden'. in tables use table rows (eg current matches)
			if (h2.parentNode.nodeName=='TD')
				var parent = h2.parentNode.parentNode.parentNode;
			else {
				var parent = h2.parentNode;
			}
			var el = parent.firstChild, elementBeforeHeader = true;
			while ( el ) {
				// start after h2
				if (elementBeforeHeader) {
					if (el == h2
						|| (el.nodeType ==  Node.ELEMENT_NODE && el.getElementsByTagName('h2')[0] == h2)) {
						elementBeforeHeader = false;
					}
				}
				else {
					// if text node, wrap in span on first encounter
					if (el.nodeType ==  Node.TEXT_NODE) {
						var target = el.nextSibling;
						var span =  doc.createElement('span');
						span.appendChild(el);
						el = parent.insertBefore(span, target);
						
					}
					// stop with next header or dedicated parentNode mainBox
					if ( el.className == 'mainBox'
						|| el.nodeName == 'H1'
						|| (el.nodeName == 'H2' && !Foxtrick.hasClass(el, 'info'))
						|| (el.getElementsByTagName('h2')[0] !== undefined && !Foxtrick.hasClass(el.getElementsByTagName('h2')[0],'info') )) {
						break
					}
					Foxtrick.toggleClass(el, 'hidden');
				}
				el = el.nextSibling;
			}
		};
		
		// add listener to all h2s in mainBody
		var h2s = doc.getElementById('mainBody').getElementsByTagName('h2');
		Foxtrick.map( function(n) {
			// exclude h2 of type info (eg training coach or if set already by individual module
			if (Foxtrick.hasClass(n, 'info')
				|| Foxtrick.hasClass(n, 'ft-expander-expanded')
				|| Foxtrick.hasClass(n, 'ft-expander-unexpanded')) {
				return;
			}
			Foxtrick.listen(n, "click", function(ev){toggle(ev.target);}, false);
			Foxtrick.addClass(n, 'ft-expander-expanded');
			if (FoxtrickPrefs.getBool('ContractableHeaders.'+doc.location.pathname+'.'+n.textContent+'.folded'))
				toggle(n);
		}, h2s);
	}
});
