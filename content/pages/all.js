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

Foxtrick.Pages.All = {
	/**
	 * Get the page ID.
	 * E. g. match, arena, series, team, player ID.
	 * Defaults to own team ID where no ID is avalable.
	 * @param  {document} doc
	 * @return {Integer}
	 */
	getId: function(doc) {
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
	},
	/**
	 * Get own team ID
	 * @return {Integer}
	 */
	getOwnTeamId: function() {
		return Foxtrick.util.id.getOwnTeamId();
	},
	/**
	 * Get team ID from bread crumbs.
	 * Usually same as getTeamId,
	 * except returns youth team ID in youth pages.
	 * @param  {document} doc
	 * @return {Integer}
	 */
	getTeamIdFromBC: function(doc) {
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
	},
	/**
	 * Get senior team ID for the page.
	 * Use getTeamIdFromBC for youth team ID.
	 * @param  {document} doc
	 * @return {Integer}
	 */
	getTeamId: function(doc) {
		var id = null;
		var subMenu = doc.getElementsByClassName('subMenu')[0];
		if (subMenu) {
			id = Foxtrick.util.id.findTeamId(subMenu);
		}
		return id;
	},
	/**
	 * Get team name from bread crumbs.
	 * Usually same as getTeamName,
	 * except returns youth team name in youth pages.
	 * @param  {document} doc
	 * @return {Integer}
	 */
	getTeamNameFromBC: function(doc) {
		var name = null;
		var links = this.getBreadCrumbs(doc);
		var link = Foxtrick.nth(function(link) {
			return /TeamID=\d+/i.test(link.href);
		}, links);
		if (link)
			name = link.textContent;
		return name;
	},
	/**
	 * Get senior team name for the page.
	 * Use getTeamNameFromBC for youth team name.
	 * @param  {document} doc
	 * @return {Integer}
	 */
	getTeamName: function(doc) {
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
	},
	/**
	 * Test whether user is logged in
	 * @param  {document}  doc
	 * @return {Boolean}
	 */
	isLoggedIn: function(doc) {
		var teamLinks = doc.getElementById('teamLinks');
		if (teamLinks && teamLinks.getElementsByTagName('a').length)
			return true;
		return false;
	},
	/**
	 * Get the header of mainBody
	 * @param  {document}    doc
	 * @return {HTMLElement}
	 */
	getMainHeader: function(doc) {
		return doc.querySelector('.mainRegular h2');
	},
	/**
	 * Get bread crumb links
	 * @param  {document}                doc
	 * @return {Array<HTMLAnchorElement}
	 */
	getBreadCrumbs: function(doc) {
		var header = this.getMainHeader(doc);
		return Foxtrick.toArray(header.getElementsByTagName('a'));
	},
};
