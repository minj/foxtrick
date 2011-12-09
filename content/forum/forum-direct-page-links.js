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
			return href.replace(/.+n=/i, "").match(/^\d+/)[0]; 
			
		}
		var current = getThreadPageTargetPostingId(Foxtrick.getHref(doc));
		
		var left = doc.getElementsByClassName("threadPagingLeft")[0];
		var right = doc.getElementsByClassName("threadPagingRight")[0];
		
		var last = right.getElementsByClassName("last");
		var next = right.getElementsByClassName("next");
		var prev = left.getElementsByClassName("prev");
		var first = left.getElementsByClassName("first");

		if(!next.length && !prev.length)
			return;
			
		var parent = 0;
		var div = doc.createElement("div");
		Foxtrick.toggleClass(div,"pager");
		if(left){
			parent = left.parentNode.parentNode;
			div.appendChild(left);
		}
		if(right){
			parent = right.parentNode.parentNode;
			div.appendChild(right);
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
			maxpage = Math.ceil((getThreadPageTargetPostingId(last[0].parentNode.href))/step) + 1;
		else
			maxpage = currentPage;
			
		Foxtrick.log(maxpage,"maxpage");
		Foxtrick.log(currentPage,"currentPage");
	
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
			start = currentPage - 9;
			end = start + 17 > maxpage ? maxpage:start + 17;
			if(end - start < 17)
				start = end - 17;
		}
		Foxtrick.log("maxpage", maxpage);
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
				strong.innerText = p;
				a.appendChild(strong);
			}
			else if( (p == start) && currentPage != 1)
			{
				var href = Foxtrick.getHref(doc);
				href =  href.replace(/n=\d+/i, "n=1");
				a.innerText = 1;
				a.href = href;
			}
			else if( (p == start + 1) && currentPage != 1 && currentPage > 7)
			{
				a.innerText = '...';
			}
			else if( (p == end - 1) && currentPage != maxpage && (currentPage != maxpage - 2))
			{
				a.innerText = '...';
			}
			else if( (p == end) && currentPage != maxpage )
			{
				var href = Foxtrick.getHref(doc);
				href =  href.replace(/n=\d+/i, ("n=" + (((maxpage-1)*step)+1)));
				a.innerText = maxpage;
				a.href = href;
			}
			else {
				a.innerText = p;
				a.href = href;
			}
			div.appendChild(a);
		}
		if(left || right)
			parent.appendChild(div);
	}
});
