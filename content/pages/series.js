'use strict';
/* series.js
 * utilities on series pages
 * @author LA-MJ
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.Pages)
	Foxtrick.Pages = {};

Foxtrick.Pages.Series = {};

/**
 * Get the series table
 * @param  {document} doc
 * @return {HTMLTableElement}
 */
Foxtrick.Pages.Series.getTable = function(doc) {
	var parent = doc.getElementById('ctl00_ctl00_CPContent_CPMain_UpdatePanel1') ||
		doc.getElementById('ctl00_ctl00_CPContent_CPMain_repLeagueTable');
	return parent.querySelector('table');
};

/**
 * Get the live series table container
 * @param  {document} doc
 * @return {element}
 */
Foxtrick.Pages.Series.getLiveTable = function(doc) {
	return doc.getElementById('ctl00_ctl00_CPContent_CPMain_UpdatePanelLiveLeagueTable');
};

/**
 * Get the series news feed container
 * @param  {document} doc
 * @return {element}
 */
Foxtrick.Pages.Series.getNewsFeed = function(doc) {
	return doc.getElementById('ctl00_ctl00_CPContent_CPMain_repLLUFeed');
};
