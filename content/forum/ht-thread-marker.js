'use strict';
/**
 * ht-thread-marker.js
 * Marks threads created by HTs.
 * @author CatzHoek (original version by Mod-PaV)
 */

Foxtrick.modules['HTThreadMarker'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forum'],
	CSS: Foxtrick.InternalPath + 'resources/css/ht-thread.css',

	run: function(doc) {
		var threadLinks = doc.querySelectorAll('.threadItem > td:nth-child(2) > .url > a' 
			+ ', .folderitem > td:nth-child(2) > .fplLongThreadName > a');

		Foxtrick.map( function(threadLink){
			var title = threadLink.getAttribute('title');
			if(title.match(/ HT-\S+$/))
				Foxtrick.addClass(threadLink.parentNode, 'ft-ht-thread');
		},threadLinks);
	},

	change: function(doc) {
		this.run(doc);
	}
};
