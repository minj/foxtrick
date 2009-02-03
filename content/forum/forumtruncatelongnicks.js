/**
 * forumtruncatelongnicks.js
 * Foxtrick Truncate long nicks in forum posts module
 * @author larsw84
 */

var FoxtrickTruncateLongNicks = {
	
    MODULE_NAME : "TruncateLongNicks",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : true,

    init : function() {
            Foxtrick.registerPageHandler( 'forumViewThread',
                                          FoxtrickTruncateLongNicks );
    },

    run : function( page, doc ) { 
		var alldivs = doc.getElementById('mainBody').getElementsByTagName('div');
		for (var i = 0; i < alldivs.length; i++) {
			if (alldivs[i].className=="cfHeader" || innerdivs[k].className=="cfHeader doubleLine") {
				var linksArray = alldivs[i].getElementsByTagName('a');
				for (var j=0; j<linksArray.length; j++) {
					var link = linksArray[j];
					if (link.href.search(/userId=/i) > -1 && link.href.search(/ft_popuplink=true/i)==-1 && link.innerHTML.search(/</i)==-1) {
						var userName = link.innerHTML;
						if(userName.length > 12) {
							link.innerHTML = userName.substr(0,9) +
								"...";
						}
					}
				}
			}
		}
	},
	
	change : function( page, doc ) {
	
	}
}