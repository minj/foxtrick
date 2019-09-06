/**
 * forum-direct-page-links.js
 * @author CatzHoek, LA-MJ
 * idea by 14932093.387: LA-PuhuvaKoira
 */

'use strict';

Foxtrick.modules['DirectPageLinks'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forumViewThread'],
	CSS: Foxtrick.InternalPath + 'resources/css/forum-direct-page-links.css',

	/* eslint-disable complexity */

	run: function(doc) {

		// Figure out Hattrick Setting for how many posts per page should be displayed
		var getPostPerPage = function(nextNodes, prevNodes, currentPostId) {
			var stepToNext = 0, stepToLast = 0;

			if (nextNodes.length && nextNodes[0]) {
				var nextUrl = nextNodes[0].parentNode.href;
				var nextN = parseInt(Foxtrick.getUrlParam(nextUrl, 'n'), 10);
				stepToNext = Math.abs(currentPostId - nextN);
			}

			if (prevNodes.length && prevNodes[0]) {
				var prevUrl = prevNodes[0].parentNode.href;
				var prevN = parseInt(Foxtrick.getUrlParam(prevUrl, 'n'), 10);
				stepToLast = Math.abs(currentPostId - prevN);
			}

			var step = Math.max(stepToNext, stepToLast) || 20;

			return step;
		};

		// Figure out the maximum amount of pages in this thread
		var getMaxPost = function(lastLinks, lastInPage, postsPerPage) {
			var posts;
			if (lastLinks.length) {
				var lastUrl = lastLinks[0].parentNode.href;
				var lastN = parseInt(Foxtrick.getUrlParam(lastUrl, 'n'), 10);
				posts = lastN + postsPerPage - 1;
			}
			else {
				posts = lastInPage;
			}
			return posts;
		};

		var left = doc.getElementsByClassName('threadPagingLeft');
		var right = doc.getElementsByClassName('threadPagingRight');

		// is a one pager
		if (!left && !right)
			return;

		// shouldn't happen but would horrible fail atm
		if (left.length != right.length)
			return;

		for (var i = 0; i < left.length; i++) {
			var ll = left[i];
			var rr = right[i];

			var last = rr.getElementsByClassName('last');
			var next = rr.getElementsByClassName('next');
			var prev = ll.getElementsByClassName('prev');

			// eslint-disable-next-line no-unused-vars
			var first = ll.getElementsByClassName('first'); // lgtm[js/useless-assignment-to-local]

			// fails on right to left languages
			if (!next.length && !prev.length) {
				last = ll.getElementsByClassName('last');
				next = ll.getElementsByClassName('next');
				prev = rr.getElementsByClassName('prev');
				first = rr.getElementsByClassName('first'); // lgtm[js/useless-assignment-to-local]
				if (!next.length && !prev.length)
					return;

				// we switched to RTL language
			}

			// re-parent existing links to our container
			var div = Foxtrick.createFeaturedElement(doc, this, 'div');
			Foxtrick.toggleClass(div, 'pager');
			var parent;
			if (ll) {
				parent = ll.parentNode.parentNode;
				div.appendChild(ll);
			}
			if (rr) {
				parent = rr.parentNode.parentNode;
				div.appendChild(rr);
			}

			var nparam = Foxtrick.getUrlParam(doc.URL, 'n');
			var currentPostId = parseInt(nparam, 10) || 1;

			var postsPerPage = getPostPerPage(next, prev, currentPostId);
			if (postsPerPage % 10 !== 0) {
				// currently postsPerPage can only be one of 10, 20, 30, 40
				// 20 is default
				postsPerPage = Foxtrick.Prefs.getInt('perpage') || 20;
			}

			var prevPost = currentPostId - 1;
			var lastInPage = prevPost + postsPerPage;
			var currentPage = Math.ceil(prevPost / postsPerPage) + 1;

			var posts = getMaxPost(last, lastInPage, postsPerPage);
			var maxPage = Math.ceil((posts - lastInPage) / postsPerPage) + currentPage;

			// Everything below is basically visual configuration
			// with current styles there is room for 17 links

			// Determine range of displayed links
			var end;
			var start;

			// Android renders larger font due to intelligent scaling
			var supportedButtons = Foxtrick.platform === 'Android' ? 12 : 17;

			// there's room for all pages
			if (maxPage <= supportedButtons) {
				end = maxPage;
				start = 1;
			}
			// current page is close to maximum
			else if (maxPage - currentPage < 7) {
				end = maxPage;
				start = end - (supportedButtons - 1);
			}
			// current page is close to first page
			else if (currentPage < 7) {
				start = 1;
				end = supportedButtons;
			}
			// any other case
			else {
				start = currentPage - 6;
				end = start + supportedButtons - 1;
				if (end > maxPage) {
					end = maxPage;
					start = end - (supportedButtons - 1);
				}
			}

			var href = doc.URL;
			var rtl = Foxtrick.util.layout.isRtl(doc);
			for (var pp = start; pp <= end; pp++) {
				var p = pp;
				if (rtl)
					p = end - (pp - start);

				var num = Math.max(currentPostId - (currentPage - p) * postsPerPage, 1);

				if (Foxtrick.getUrlParam(href, 'n'))
					href = href.replace(/n=\d+/i, 'n=' + num);
				else
					href = href + '&n=' + num;

				var a = doc.createElement('a');
				Foxtrick.addClass(a, 'page');

				// adjust class so all buttons have constant width and the layout doesn't break
				if (p < 10) {
					Foxtrick.addClass(a, 'oneDigit');
				}
				// mark current page
				if (p == currentPage) {
					var strong = doc.createElement('strong');
					strong.textContent = p;
					a.appendChild(strong);
				}
				// always include first page
				else if (p == start) {
					href = href.replace(/n=\d+/i, 'n=1');
					a.textContent = '1';
					a.href = href;
					Foxtrick.addClass(a, 'oneDigit');
					num = 1;
				}
				// always include last page
				else if (p == end) {
					var lastPagePostId = (maxPage - currentPage) * postsPerPage + currentPostId;
					href = href.replace(/n=\d+/i, 'n=' + lastPagePostId);
					a.textContent = maxPage;
					a.href = href;
					num = lastPagePostId;
				}
				// represent gaps using '...'
				else if (p == start + 1 && start != 1 || p == end - 1 && end != maxPage) {
					if (!rtl)
						a.textContent = '...';
					else
						a.textContent = '\u00a0';
				}
				// any other page
				else {
					a.textContent = p;
					a.href = href;
				}

				a.title = num + '-' + (num + postsPerPage - 1);

				div.appendChild(a);
			}
			if (left || right)
				parent.appendChild(div);
		}
	},
};
