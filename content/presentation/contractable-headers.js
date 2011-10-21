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
		
		var getH2TextContent = function(h2) {
			// remove some of our content to get original textContent of h2
			var h2Clone = h2.cloneNode(true);
			var highlight = h2Clone.getElementsByClassName('highlight')[0];
			if (highlight)
				highlight.parentNode.removeChild(highlight);
			var ftpopuplist = h2Clone.getElementsByClassName('ft-popup-list')[0];
			if (ftpopuplist)
				ftpopuplist.parentNode.removeChild(ftpopuplist);
			return h2Clone.textContent;
		};
		
		var toggle = function(h2) {
			Foxtrick.toggleClass(h2, 'ft-expander-expanded');
			Foxtrick.toggleClass(h2, 'ft-expander-unexpanded');
			
			var key  = ('ContractableHeaders.'+doc.location.pathname+'.'+getH2TextContent(h2)+'.folded').replace(/\s+/g, '');
			if (Foxtrick.hasClass(h2, 'ft-expander-expanded'))
				FoxtrickPrefs.deleteValue(key);
			else
				FoxtrickPrefs.setBool(key, true);
			// go though all children and toggle 'hidden'. in tables use table rows (eg current matches)
			if (h2.parentNode.nodeName=='TD')
				var parent = h2.parentNode.parentNode.parentNode;
			else {
				var parent = h2.parentNode;
			}
			var el = parent.firstChild, elementBeforeHeader = true;
			var forumThreads = {}, numUnread = 0;
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
					
					// count new forum postings
					if ( Foxtrick.hasClass(el,'hidden') && el.getElementsByClassName('fplThreadInfo')[0] != undefined ) {
						var rows = el.getElementsByClassName('fplThreadInfo');
						Foxtrick.map(function(n) {
							var unread = n.getElementsByClassName('highlight')[0];
							if (unread !== undefined) {
								var tid = unread.getAttribute('onclick').match(/'read\|(\d+)'/)[1];
								if (!forumThreads[tid])
									numUnread += Number(unread.textContent);
								forumThreads[tid] = true;
							}
						}, rows);
					}
				}
				el = el.nextSibling;
			}
			
			// show new forum postings
			if (numUnread && h2.getElementsByClassName('highlight')[0] == undefined) {
				h2.appendChild(doc.createTextNode(' '));
				var span = doc.createElement('span');
				span.className = 'highlight';
				span.textContent = '('+numUnread+')';
				h2.appendChild(span);
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
			var key  = ('ContractableHeaders.'+doc.location.pathname+'.'+getH2TextContent(n)+'.folded').replace(/\s+/g, '');
			if (FoxtrickPrefs.getBool(key))
				toggle(n);
		}, h2s);
	}
});
