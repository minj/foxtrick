/**
 * short-pas.js
 * short press anouncements
 * @author convinced
 */

var FoxtrickShortPAs = {
	MODULE_NAME : "ShortPAs",
	MODULE_CATEGORY : Foxtrick.moduleCategories.PRESENTATION,
	PAGES : new Array('league'),

	run : function( page, doc ) {
		var newsfeed = doc.getElementById('ctl00_ctl00_CPContent_CPMain_repLLUFeed');

		var items = newsfeed.getElementsByTagName('div');
		for (var i=0;i<items.length;++i) {
			var item=items[i];
			if (item.className!='feedItem user') continue;
			var body=item.innerHTML.replace(/.+<\/b>/,'');	//Foxtrick.dump(body+'\n');
			item.innerHTML=item.innerHTML.match(/.+<\/b>/); //Foxtrick.dump(item.innerHTML+'\n');
			var newdiv=doc.createElement('div');
			newdiv.innerHTML=body;
			newdiv.style.display='none';
			item.appendChild(newdiv);
			var morediv=doc.createElement('div');
			var margin=10;
			if (Foxtrick.isStandardLayout(doc)) margin=27;
			var dir='right';
			if (Foxtrick.isRTLLayout(doc)) dir='left';
			morediv.setAttribute('style',"position:absolute; display:inline; background-color:inherit;	padding-left:5px; "+dir+": "+margin+"px;");
			var a=doc.createElement('a');
			a.innerHTML=Foxtrickl10n.getString("foxtrick.ShortPAs.more");
			a.href='javascript:void(0);';
			Foxtrick.addEventListenerChangeSave(a, 'click',this.showfull,true);
			morediv.appendChild(a);
			var b=item.getElementsByTagName('b')[0];
			b.parentNode.insertBefore(morediv,b.nextSibling);
		}
	},

	showfull : function(ev) {
		ev.target.parentNode.nextSibling.style.display='block';
		ev.target.parentNode.style.display='none';
	}
};
