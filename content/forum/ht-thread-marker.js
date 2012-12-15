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

		var markThreads = function(threads){
			Foxtrick.map( function(threadLink){
				var title = threadLink.getAttribute('title');
				var prefixInThreadName = threadLink.textContent.match(/ HT-\S+/);
				var prefixInTitle = title.match(/ HT-\S+/);

				if(!prefixInThreadName && prefixInTitle)
					Foxtrick.addClass(threadLink.parentNode, 'ft-ht-thread');
			}, threads);	
		}

		//threadList
		var threadLinks = doc.querySelectorAll('.threadItem > td:nth-child(2) > .url > a' 
			+ ', .folderitem > td:nth-child(2) > .fplLongThreadName > a');
		markThreads(threadLinks);

		//hotlinks
		threadLinks = doc.querySelectorAll('#ctl00_ctl00_CPContent_CPMain_updHotThreads a');
		markThreads(threadLinks);
	},

	change: function(doc) {
		this.run(doc);
	}
};
