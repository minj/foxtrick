'use strict';
/* series.js
 * utilities on series pages
 * @author LA-MJ
 */

if (!Foxtrick)
	var Foxtrick = this.Foxtrick;
if (!Foxtrick.Pages)
	Foxtrick.Pages = {};

Foxtrick.Pages.Series = {};

/**
 * Get the series table
 * @param  {document} doc
 * @return {HTMLTableElement}
 */
Foxtrick.Pages.Series.getTable = function(doc) {
	var parent = Foxtrick.getMBElement(doc, 'UpdatePanel1') ||
		Foxtrick.getMBElement(doc, 'repLeagueTable');
	return parent.querySelector('table');
};

/**
 * Get the live series table container
 * @param  {document} doc
 * @return {element}
 */
Foxtrick.Pages.Series.getLiveTable = function(doc) {
	return Foxtrick.getMBElement(doc, 'UpdatePanelLiveLeagueTable');
};

/**
 * Get the series news feed container
 * @param  {document} doc
 * @return {element}
 */
Foxtrick.Pages.Series.getNewsFeed = function(doc) {
	return Foxtrick.getMBElement(doc, 'repLLUFeed');
};
