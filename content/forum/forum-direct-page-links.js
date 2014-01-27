'use strict';
/**
 * forum-direct-page-links.js
 * @author CatzHoek, idea by 14932093.387: LA-PuhuvaKoira
 */

Foxtrick.modules['DirectPageLinks'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forumViewThread'],
	CSS: Foxtrick.InternalPath + 'resources/css/forum-direct-page-links.css',

	run: function(doc) {

		//current setup is optimized for standart layout, 'disable' for simple skin for now
		//if (!Foxtrick.util.layout.isStandard(doc))
		//	return;

		// Figure out Hattrick Setting about how many posts per page should be displayed
		var getPostPerPage = function(nextNodes, prevNodes, currentPostId) {
			var step = 0;

			if (nextNodes.length && nextNodes[0])
				var steptonext = Math.abs(currentPostId -
										  parseInt(Foxtrick.getParameterFromUrl(nextNodes[0]
																				.parentNode.href,
																				'n'),
												   10));

			if (prevNodes.length && prevNodes[0])
				var steptolast = Math.abs(currentPostId -
										  parseInt(Foxtrick.getParameterFromUrl(prevNodes[0]
																				.parentNode.href, 'n'),
												   10));

			step = Math.max(steptonext, steptolast);

			if (isNaN(steptonext))
				step = steptolast;
			else if (isNaN(steptolast))
				step = steptonext;

			return step;
		};

		// Figure out the maximum amount of pages in this thread
		var getMaxPages = function(prevNodes, lastNodes, postPerPage) {
			var pages = 1;
			if (lastNodes.length) {
				var lastpagestart = parseInt(Foxtrick.getParameterFromUrl(lastNodes[0].parentNode
				                             .href, 'n'), 10);
				var max = lastpagestart + postPerPage - 1;
				pages = Math.ceil(max / postPerPage);
			} else if (!lastNodes.length && prevNodes.length) {
				var secondlastpagestart = parseInt(Foxtrick.getParameterFromUrl(prevNodes[0]
				                                   .parentNode.href, 'n'), 10);
				var max = secondlastpagestart + postPerPage;
				pages = Math.ceil(max / postPerPage);
			}
			return pages;
		};

		var left = doc.getElementsByClassName('threadPagingLeft');
		var right = doc.getElementsByClassName('threadPagingRight');

		//is a one pager
		if (!left && !right)
			return;

		//shouldn't happen but would horrible fail atm
		if (left.length != right.length)
			return;

		for (var i = 0; i < left.length; i++)
		{
			var ll = left[i];
			var rr = right[i];

			var last = rr.getElementsByClassName('last');
			var next = rr.getElementsByClassName('next');
			var prev = ll.getElementsByClassName('prev');
			var first = ll.getElementsByClassName('first');

			//fails on right to left languages
			if (!next.length && !prev.length) {
				last = ll.getElementsByClassName('last');
				next = ll.getElementsByClassName('next');
				prev = rr.getElementsByClassName('prev');
				first = rr.getElementsByClassName('first');
				if (!next.length && !prev.length)
					return;
				else {
					//we switched to RTL language
				}
			}

			//re-parent existing links them to our container
			var parent = 0;
			var div = Foxtrick.createFeaturedElement(doc, this, 'div');
			Foxtrick.toggleClass(div, 'pager');
			if (ll) {
				parent = ll.parentNode.parentNode;
				div.appendChild(ll);
			}
			if (rr) {
				parent = rr.parentNode.parentNode;
				div.appendChild(rr);
			}

			//get current situation
			//current post id
			var currentPostId = parseInt(Foxtrick.getParameterFromUrl(Foxtrick.getHref(doc),
																	  'n'), 10);
			if (!currentPostId)
				currentPostId = 1;

			var lastLinkId = (last && last[0]) ?
				parseInt(Foxtrick.getParameterFromUrl(last[0].parentNode.href, 'n'), 10) : null;

			//post per page, current page, maximum page count
			var postPerPage = getPostPerPage(next, prev, currentPostId);
			if (postPerPage % 10 != 0)
				postPerPage = 20;
			var currentPage = Math.ceil(currentPostId / postPerPage);
			var maxpage = getMaxPages(prev, last, postPerPage);

			if (currentPostId % 10 != 1 && currentPostId % postPerPage != 1)
				currentPage += 1;

			if (currentPage > maxpage)
				maxpage += 1;

			if (lastLinkId && (lastLinkId - currentPostId) >
				(maxpage - currentPage) * postPerPage)
				maxpage += 1;


			// Everthing below is basicly visual configuration, with current styles there is room
			// for 18 links
			//
			// Determine range of displayed links
			//
			var end;
			var start;

			//standard skin
			var supportedButtons = 18;
			//if (!Foxtrick.util.layout.isStandard(doc))
			//	supportedButtons = 14; //simple skinn

			//there's room for all pages
			if (maxpage <= supportedButtons) {
				end = maxpage;
				start = 1;
			}
			//current page is close to maximum
			else if ((maxpage - currentPage) < 8)
			{
				end = maxpage;
				start = end - (supportedButtons - 1);
			}
			//current page is close to first page
			else if (currentPage < 7)
			{
				start = 1;
				end = start + supportedButtons - 1 > maxpage ? maxpage :
					start + supportedButtons - 1;
			}
			//any other case
			else
			{
				start = currentPage - 6;
				end = start + (supportedButtons - 1) > maxpage ? maxpage :
					start + supportedButtons - 1;
				if (end - start < + supportedButtons - 1)
					start = end - (supportedButtons - 1);
			}

			var rtl = Foxtrick.util.layout.isRtl(doc);
			for (var pp = start; pp <= end; pp++)
			{
				var p = pp;
				if (rtl)
					p = end - (pp - start);

				var href = Foxtrick.getHref(doc);
				if (Foxtrick.getParameterFromUrl(href, 'n'))
					href = href.replace(/n=\d+/i, 'n=' + (currentPostId -
					                    (currentPage - p) * postPerPage));
				else
					href = href + '&n=' + (currentPostId - (currentPage - p) * postPerPage);

				var a = doc.createElement('a');
				Foxtrick.addClass(a, 'page');

				//adjust class so all buttons have constant width and the layout doesn't break
				if (p < 10) {
					Foxtrick.addClass(a, 'oneDigit');
				}
				//mark current page
				if (p == currentPage)
				{
					var strong = doc.createElement('strong');
					strong.appendChild(doc.createTextNode(p));
					a.appendChild(strong);
				}
				//always include first page
				else if ((p == start) && currentPage != 1)
				{
					var href = Foxtrick.getHref(doc);
					href = href.replace(/n=\d+/i, 'n=1');
					a.appendChild(doc.createTextNode('1'));
					a.href = href;
					Foxtrick.addClass(a, 'oneDigit');
				}
				//always include lastpage
				else if ((p == end) && currentPage != maxpage)
				{
					var lastPagePostId = (maxpage - currentPage) * postPerPage + currentPostId;
					var href = Foxtrick.getHref(doc);
					href = href.replace(/n=\d+/i, 'n=' + lastPagePostId);
					a.appendChild(doc.createTextNode(maxpage));
					a.href = href;
				}
				//represent gaps using '...', needs teaking because this also happens then the
				//correct number is replaced, like 1,2,3,4 -> 1,...,3,4
				else if ((p == start + 1) && currentPage != 1 && currentPage > 7 &&
				         maxpage > supportedButtons) {
					if (!rtl)
						a.appendChild(doc.createTextNode('...'));
					else
						a.appendChild(doc.createTextNode('\u00a0'));
				}
				//represent gaps using '...', needs teaking because this also happens then the
				//correct number is replaced, like 1,2,3,4 -> 1,...,3,4
				else if ((p == end - 1) && currentPage != maxpage && (currentPage != maxpage - 2) &&
					(p != maxpage - 1) && maxpage > supportedButtons) {
					if (!rtl)
						a.appendChild(doc.createTextNode('...'));
					else
						a.appendChild(doc.createTextNode('\u00a0'));
				}
				//any other page
				else {
					a.appendChild(doc.createTextNode(p));
					a.href = href;
				}
				div.appendChild(a);
			}
			if (left || right)
				parent.appendChild(div);
		}
	}
};
