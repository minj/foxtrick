'use strict';
/* all.js
 * Utilities on all pages
 * @author ryanli, LA-MJ
 *
 * Pages under this directory need not to be modules, they only provide utility
 * functions for retrieving page-specific information, and serve like libraries.
 *
 * Hence they only need to be included in content scope
 *
 * Furthermore, since the functions here are page-specific, generally speaking
 * their first arguments need to be `doc'.
 */

if (!Foxtrick)
	var Foxtrick = {};
if (!Foxtrick.Pages)
	Foxtrick.Pages = {};

Foxtrick.Pages.All = {};

/**
 * Test whether this page belongs to our own team
 * @param  {document}  doc
 * @return {Boolean}
 */
Foxtrick.Pages.All.isOwn = function(doc) {
	var ownTeamId = this.getOwnTeamId(doc);
	var teamId = this.getTeamId(doc);
	return ownTeamId === teamId && ownTeamId !== null;
};

/**
 * Test whether this page is a youth page
 * @param  {document}  doc
 * @return {Boolean}
 */
Foxtrick.Pages.All.isYouth = function(doc) {
	return /youth/i.test(doc.location.href);
};

/**
 * Get the page ID.
 * E. g. match, arena, series, team, player ID.
 * Defaults to own team ID where no ID is avalable.
 * @param  {document} doc
 * @return {number}
 */
Foxtrick.Pages.All.getId = function(doc) {
	if (!Foxtrick.Pages.All.getMainHeader(doc)) {
		// no header
		// e. g. https://www.hattrick.org/goto.ashx?path=/Club/?TeamID=9999999
		return null;
	}

	// defaults to own id
	var id = this.getOwnTeamId(doc);

	// parse links backwards, unless it's a youth page
	// since teamID is used before youthTeamID in most places
	var bcs = this.getBreadCrumbs(doc);
	if (!/youth/i.test(doc.location.href) || Foxtrick.isPage(doc, 'youthPlayerDetails')) {
		bcs.reverse();
	}
	else if (Foxtrick.isPage(doc, 'youthTraining')) {
		// because HTs...
		var subMenu = doc.getElementsByClassName('subMenu')[0];
		if (subMenu)
			return Foxtrick.util.id.findYouthTeamId(subMenu);
	}

	Foxtrick.any(function(link) {
		var matched = link.href.match(/id=(\d+)/i);
		if (matched) {
			id = parseInt(matched[1], 10);
			return true;
		}
		return false;
	}, bcs);

	return id;
};

/**
 * Get own team ID
 * @return {number}
 */
Foxtrick.Pages.All.getOwnTeamId = function() {
	return Foxtrick.util.id.getOwnTeamId();
};

/**
 * Get team ID from bread crumbs.
 * Usually same as getTeamId,
 * except returns youth team ID in youth pages.
 * @param  {document} doc
 * @return {number}
 */
Foxtrick.Pages.All.getTeamIdFromBC = function(doc) {
	var id = null;
	var links = this.getBreadCrumbs(doc);
	Foxtrick.any(function(link) {
		var matched = link.href.match(/TeamID=(\d+)/i);
		if (matched) {
			id = parseInt(matched[1], 10);
			return true;
		}
		return false;
	}, links);
	return id;
};

/**
 * Get senior team ID for the page.
 * Use getTeamIdFromBC for youth team ID.
 * @param  {document} doc
 * @return {number}
 */
Foxtrick.Pages.All.getTeamId = function(doc) {
	var id = null;
	var subMenu = doc.getElementsByClassName('subMenu')[0];
	if (subMenu) {
		id = Foxtrick.util.id.findTeamId(subMenu);
	}
	return id;
};

/**
 * Get team name from bread crumbs.
 * Usually same as getTeamName,
 * except returns youth team name in youth pages.
 * @param  {document} doc
 * @return {number}
 */
Foxtrick.Pages.All.getTeamNameFromBC = function(doc) {
	var name = null;
	var links = this.getBreadCrumbs(doc);
	var link = Foxtrick.nth(function(link) {
		return /TeamID=\d+/i.test(link.href);
	}, links);
	if (link)
		name = link.textContent;
	return name;
};

/**
 * Get senior team name for the page.
 * Use getTeamNameFromBC for youth team name.
 * @param  {document} doc
 * @return {number}
 */
Foxtrick.Pages.All.getTeamName = function(doc) {
	var name = null;
	// check if this page has an associated team
	var team = this.getTeamNameFromBC(doc);
	if (team) {
		var header = doc.querySelector('.subMenu h2');
		if (header) {
			name = header.textContent.trim();
		}
	}
	return name;
};

/**
 * Test whether user is logged in
 * @param  {document}  doc
 * @return {Boolean}
 */
Foxtrick.Pages.All.isLoggedIn = function(doc) {
	var teamLinks = doc.getElementById('teamLinks');
	if (teamLinks && teamLinks.getElementsByTagName('a').length)
		return true;
	return false;
};

/**
 * Get the header of mainBody
 * @param  {document}    doc
 * @return {element}
 */
Foxtrick.Pages.All.getMainHeader = function(doc) {
	return doc.querySelector('.mainRegular h2, .mainWide h2');
};

/**
 * Get the default notification area
 * @param  {document}    doc
 * @return {element}
 */
Foxtrick.Pages.All.getNotes = function(doc) {
	return doc.getElementById('ctl00_updNotifications') ||
		doc.getElementById('ctl00_ctl00_CPContent_ucNotifications_updNotifications');
};

/**
 * Get bread crumb links
 * @param  {document} doc
 * @return {array}        ?Array.<HTMLAnchorElement>
 */
Foxtrick.Pages.All.getBreadCrumbs = function(doc) {
	var header = this.getMainHeader(doc);
	if (header)
		return Foxtrick.toArray(header.getElementsByTagName('a'));
	else
		return null;
};
