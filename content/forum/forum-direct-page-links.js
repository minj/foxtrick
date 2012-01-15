"use strict";
/**
 * forum-direct-page-links.js
 * @author CatzHoek
 */

Foxtrick.modules["DirectPageLinks"]={
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumViewThread"),
	CSS: Foxtrick.InternalPath + "resources/css/forum-direct-page-links.css",

	run : function(doc) {
		
		//current setup is optimized for standart layout, "disable" for simple skin for now
		//if (!Foxtrick.util.layout.isStandard(doc) )
		//	return;
			
		/* Figure out Hattrick Setting about how many posts per page should be displayed */
		var getPostPerPage = function(nextNodes, prevNodes, currentPostId){
			var step = 0;
			
			if(nextNodes.length && nextNodes[0])
				var steptonext = Math.abs(currentPostId - parseInt( Foxtrick.getParameterFromUrl( nextNodes[0].parentNode.href, "n" ) ) );
			
			if(prevNodes.length && prevNodes[0])
				var steptolast = Math.abs(currentPostId - parseInt( Foxtrick.getParameterFromUrl( prevNodes[0].parentNode.href, "n" ) ) );
			
			step = Math.max( steptonext,steptolast );
			
			if(isNaN(steptonext))
				step = steptolast;
			else if(isNaN(steptolast))
				step = steptonext;
			
			return step;
		}
		
		/* Figure out the maximum amount of pages in this thread */
		var getMaxPages = function(prevNodes, lastNodes, postPerPage) {
			var pages = 1;
			if(lastNodes.length){
				var lastpagestart = parseInt(Foxtrick.getParameterFromUrl( lastNodes[0].parentNode.href, "n" ));
				var max =  lastpagestart + postPerPage - 1;
				pages =  Math.ceil( max / postPerPage);
			} else if(!lastNodes.length && prevNodes.length){
				var secondlastpagestart = parseInt(Foxtrick.getParameterFromUrl( prevNodes[0].parentNode.href, "n" ));
				var max = secondlastpagestart + postPerPage;
				pages =  Math.ceil( max / postPerPage);
			}
			return pages;
		}
			
		var left = doc.getElementsByClassName("threadPagingLeft");
		var right = doc.getElementsByClassName("threadPagingRight");
		
		//is a one pager
		if(!left && !right)
			return;
		
		//shouldn't happen but would horrible fail atm
		if(left.length != right.length)
			return;
		
		for(var i=0; i < left.length; i++)
		{
			var ll = left[i];
			var rr  = right[i];
	
			var last = rr.getElementsByClassName("last");
			var next = rr.getElementsByClassName("next");
			var prev = ll.getElementsByClassName("prev");
			var first = ll.getElementsByClassName("first");

			//fails on right to left languages
			if(!next.length && !prev.length){
				last = ll.getElementsByClassName("last");
				next = ll.getElementsByClassName("next");
				prev = rr.getElementsByClassName("prev");
				first = rr.getElementsByClassName("first");
				if(!next.length && !prev.length)
					return;
				else {
					//we switched to RTL language
				}
			}	
				
			//re-parent existing links them to our container
			var parent = 0;
			var div = Foxtrick.createFeaturedElement(doc, this, "div");
			Foxtrick.toggleClass(div,"pager");
			if(ll){
				parent = ll.parentNode.parentNode;
				div.appendChild(ll);
			}
			if(rr){
				parent = rr.parentNode.parentNode;
				div.appendChild(rr);
			}
			
			//get current situation
			//current post id
			var currentPostId = Foxtrick.getParameterFromUrl( Foxtrick.getHref(doc), "n" );
			if(!currentPostId)
				currentPostId = 1;
			//post per page, current page, maximum page count
			var postPerPage = getPostPerPage(next, prev, currentPostId);
			var currentPage = Math.ceil( currentPostId / postPerPage );
			var maxpage = getMaxPages(prev, last, postPerPage);
		
			/* Everthing below is basicly visual configuration, with current styles there is room for 18 links
			 * 
			 * Determine range of displayed links
			 */
			var end;
			var start;
			
			//standart skin
			var supportedButtons = 18;
			if(!Foxtrick.util.layout.isStandard(doc))
				supportedButtons = 14;
			
			if(maxpage <= supportedButtons){
				end = maxpage;
				start = 1;
			}
			else if( ( maxpage - currentPage ) < 8)
			{
				end = maxpage;
				start = end - (supportedButtons - 1);
			} 
			else if( currentPage < 7)
			{
				start = 1;
				end = start + supportedButtons - 1 > maxpage ? maxpage:start +supportedButtons - 1;
			} 
			else
			{
				start = currentPage - 6;
				end = start + (supportedButtons - 1) > maxpage ? maxpage:start + supportedButtons - 1;
				if(end - start < + supportedButtons - 1)
					start = end - (supportedButtons - 1);
			}
			
			for(var p = start; p <= end; p++)
			{
				var href = Foxtrick.getHref(doc);
				href =  href.replace(/n=\d+/i, "n=" + (currentPostId - (currentPage-p)*postPerPage));
		
				var a = doc.createElement("a");
				Foxtrick.toggleClass(a,"page");
				if(p < 10)
					Foxtrick.toggleClass(a,"oneDigit");
				if(p == currentPage)
				{
					var strong = doc.createElement("strong");
					strong.appendChild(doc.createTextNode(p));
					a.appendChild(strong);
				}
				else if( (p == start) && currentPage != 1)
				{
					var href = Foxtrick.getHref(doc);
					href =  href.replace(/n=\d+/i, "n=1");
					a.appendChild(doc.createTextNode('1'));
					a.href = href;
				}
				else if( (p == start + 1) && currentPage != 1 && currentPage > 7 && maxpage > supportedButtons)
				{
					a.appendChild(doc.createTextNode('...'));
				}
				else if( (p == end - 1) && currentPage != maxpage && (currentPage != maxpage - 2) && maxpage > supportedButtons)
				{
					a.appendChild(doc.createTextNode('...'));
				}
				else if( (p == end) && currentPage != maxpage )
				{
					var href = Foxtrick.getHref(doc);
					href =  href.replace(/n=\d+/i, ("n=" + (((maxpage-1)*postPerPage)+1)));
					a.appendChild(doc.createTextNode(maxpage));
					a.href = href;
				}
				else {
					a.appendChild(doc.createTextNode(p));
					a.href = href;
				}
				div.appendChild(a);
			}
			if(left || right)
				parent.appendChild(div);
		}
	}
};
