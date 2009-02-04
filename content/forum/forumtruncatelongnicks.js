/**
 * forumtruncatelongnicks.js
 * Foxtrick Truncate long nicks in forum posts module
 * @author larsw84/convinced
 */

var FoxtrickTruncateLongNicks = {
	
    MODULE_NAME : "TruncateLongNicks",
	MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
	DEFAULT_ENABLED : false,
	OPTIONS : new Array("SmallHeader", "TruncateLongNick"),

    init : function() {
            Foxtrick.registerPageHandler( 'forumViewThread',
                                          FoxtrickTruncateLongNicks );
    },

    run : function( page, doc ) { 
		var alldivs = doc.getElementById('mainBody').getElementsByTagName('div');
		for (var i = 0; i < alldivs.length; i++) {
			if (alldivs[i].className=="cfWrapper") {
				var linksArray = alldivs[i].getElementsByTagName('a');
				var count=0;
				for (var j=0; j<linksArray.length; j++) {
					var link = linksArray[j];
					if (Foxtrick.isModuleFeatureEnabled( this, "TruncateLongNick") && link.href.search(/userId=/i) > -1 && link.href.search(/ft_popuplink=true/i)==-1 && link.innerHTML.search(/</i)==-1) {
						var userName = link.innerHTML;
						if(userName.length > 12) {
							link.innerHTML = userName.substr(0,9) +
								"...";
						}
					} 
					if (Foxtrick.isModuleFeatureEnabled( this, "SmallHeader")) {
						if (link.href.search(/Forum\/Read/i) > -1 && link.href.search(/ft_popuplink=true/i)==-1) {
							if (count==1) {
								var asAnswerTo = link.previousSibling; 
								var newText = doc.createTextNode("=> ");
								asAnswerTo.parentNode.replaceChild(newText,asAnswerTo);
								var asAnswerTo2 = link.nextSibling; 
								var newText2 = doc.createTextNode(" / ");
								asAnswerTo2.parentNode.replaceChild(newText2,asAnswerTo2);
								}
							if (count==0) {
								var asAnswerTo0 = link.nextSibling; 
								var newText0 = doc.createTextNode(" / ");
								asAnswerTo0.parentNode.replaceChild(newText0,asAnswerTo0);								
								}
							count++;						
						}
					}
				}
			}
			if (Foxtrick.isModuleFeatureEnabled( this, "SmallHeader") 
				&& alldivs[i].className=="cfHeader doubleLine") {
				
				alldivs[i].innerHTML = alldivs[i].innerHTML.replace('<br>',''); // simulate full post id length
				alldivs[i].className="cfHeader singleLine";	
				if (alldivs[i].firstChild.offsetWidth>470) {
					alldivs[i].innerHTML = alldivs[i].innerHTML.replace('xxxxxxxx','<br>');
					alldivs[i].className="cfHeader doubleLine";	
				} 
					
				else {
					alldivs[i].innerHTML = alldivs[i].innerHTML.replace('xxxxxxxx','');
				}
			}
		}

	},
	
	change : function( page, doc ) {
	
	}
}