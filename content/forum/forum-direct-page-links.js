"use strict";
/**
 * forum-direct-page-links.js
 * @author CatzHoek
 */

Foxtrick.util.module.register({
	MODULE_NAME : "DirectPageLinks",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	PAGES : new Array("forumViewThread"),
	CSS: Foxtrick.InternalPath+"resources/css/forum-direct-page-links.css",

	run : function(doc) {
	
		var getThreadPageTargetPostingId = function(href){
			try {
				return href.replace(/.+n=/i, "").match(/^\d+/)[0]; 
			}
			catch(e) {
				return 1;
			}
		}
		var current = getThreadPageTargetPostingId(Foxtrick.getHref(doc));
		
		var left = doc.getElementsByClassName("threadPagingLeft");
		var right = doc.getElementsByClassName("threadPagingRight");
		if(left.length == right.length)
		{
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
					if(!next.length && !prev.length){
						return;
					} else {
						
					}
				}
					
					
				var parent = 0;
				var div = doc.createElement("div");
				Foxtrick.toggleClass(div,"pager");
				if(ll){
					parent = ll.parentNode.parentNode;
					div.appendChild(ll);
				}
				if(rr){
					parent = rr.parentNode.parentNode;
					div.appendChild(rr);
				}
				
				//	entries per page
				var step = 0;
				if(next.length && next[0])
					var steptonext = Math.abs(current - getThreadPageTargetPostingId(next[0].parentNode.href));
				if(prev.length && prev[0])
					var steptolast = Math.abs(current - getThreadPageTargetPostingId(prev[0].parentNode.href));
				step = Math.max(steptonext,steptolast);
				if(isNaN(steptonext))
					step = steptolast;
				else if(isNaN(steptolast))
					step = steptonext;

				//currentpage
				var currentPage = Math.ceil((current)/step);
				
				//maxpage
				var maxpage;
				if(last.length)
				{
					maxpage = Math.ceil((getThreadPageTargetPostingId(last[0].parentNode.href))/step);
				}
				else
					maxpage = currentPage;
			
				var end;
				var start;
				
				if(maxpage <= 18){
					end = maxpage;
					start = 1;
				}
				else if( ( maxpage - currentPage ) < 8)
				{
					end = maxpage;
					start = end - 17;
				} 
				else if( currentPage < 7)
				{
					start = 1;
					end = start + 17 > maxpage ? maxpage:start + 17;
				} 
				else
				{
					start = currentPage - 6;
					end = start + 17 > maxpage ? maxpage:start + 17;
					if(end - start < 17)
						start = end - 17;
				}
				
				for(var p = start; p <= end; p++)
				{
					var href = Foxtrick.getHref(doc);
					href =  href.replace(/n=\d+/i, "n=" + (current - (currentPage-p)*step));
			
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
					else if( (p == start + 1) && currentPage != 1 && currentPage > 7 && maxpage > 18)
					{
						a.appendChild(doc.createTextNode('...'));
					}
					else if( (p == end - 1) && currentPage != maxpage && (currentPage != maxpage - 2) && maxpage > 18)
					{
						a.appendChild(doc.createTextNode('...'));
					}
					else if( (p == end) && currentPage != maxpage )
					{
						var href = Foxtrick.getHref(doc);
						href =  href.replace(/n=\d+/i, ("n=" + (((maxpage-1)*step)+1)));
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
	}
});
