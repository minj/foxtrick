/**
 * all.js
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

'use strict';

/* eslint-disable */
if (!this.Foxtrick)
	// @ts-ignore
	var Foxtrick = {};
/* eslint-enable */

if (!Foxtrick.Pages)
	Foxtrick.Pages = {};

Foxtrick.Pages.All = {};

/**
 * Test whether this page belongs to our own team
 * @param  {document}  doc
 * @return {boolean}
 */
Foxtrick.Pages.All.isOwn = function(doc) {
	var ownTeamId = this.getOwnTeamId();
	var teamId = this.getTeamId(doc);
	return ownTeamId === teamId && ownTeamId !== null;
};

/**
 * Test whether this page is a youth page
 * @param  {document}  doc
 * @return {boolean}
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
	var id = this.getOwnTeamId();

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
	if (subMenu)
		id = Foxtrick.util.id.findTeamId(subMenu);

	return id;
};

/**
 * Get team name from bread crumbs.
 * Usually same as getTeamName,
 * except returns youth team name in youth pages.
 * @param  {document} doc
 * @return {string}
 */
Foxtrick.Pages.All.getTeamNameFromBC = function(doc) {
	var name = null;

	var links = this.getBreadCrumbs(doc);
	var link = Foxtrick.nth(function(link) {
		return /TeamID=\d+/i.test(link.href);
	}, links);

	if (link)
		name = link.textContent.trim();

	return name;
};

/**
 * Get senior team name for the page.
 * Use getTeamNameFromBC for youth team name.
 * @param  {document} doc
 * @return {string}
 */
Foxtrick.Pages.All.getTeamName = function(doc) {
	var name = this.getTeamNameFromBC(doc);

	if (!name || Foxtrick.Pages.All.isYouth(doc)) {
		// README: this should not run for NT coaches
		// since subMenu = main team, bread crumb = NT
		var header = doc.querySelector('.subMenu h2');
		name = header ? header.textContent.trim() : null;
	}

	return name;
};

/**
 * Test whether user is logged in
 * @param  {document}  doc
 * @return {boolean}
 */
Foxtrick.Pages.All.isLoggedIn = function(doc) {
	let teamLinks = doc.getElementById('teamLinks');
	if (teamLinks && teamLinks.getElementsByTagName('a').length)
		return true;
	return false;
};

/**
 * Get the header of mainBody
 * @param  {document}    doc
 * @return {HTMLElement}
 */
Foxtrick.Pages.All.getMainHeader = function(doc) {
	return doc.querySelector('.mainRegular h2, .mainWide h2, .mainConf h2');
};

/**
 * Get the default notification area
 * @param  {document}    doc
 * @return {HTMLElement}
 */
Foxtrick.Pages.All.getNotes = function(doc) {
	return doc.getElementById('ctl00_updNotifications') ||
		doc.getElementById('ctl00_ctl00_CPContent_ucNotifications_updNotifications') ||
		doc.getElementById('mainBody') || doc.body;
};

/**
 * Get bread crumb links
 * @param  {document} doc
 * @return {HTMLAnchorElement[]}        ?Array.<HTMLAnchorElement>
 */
Foxtrick.Pages.All.getBreadCrumbs = function(doc) {
	let header = this.getMainHeader(doc);
	if (header)
		return Foxtrick.toArray(header.getElementsByTagName('a'));

	return null;
};
