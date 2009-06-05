/**
 * starscounter.js
 * Foxtrick count stars in match lineup page module
 * @author larsw84
 */

////////////////////////////////////////////////////////////////////////////////

var FoxtrickStarsCounter = {

	MODULE_NAME : "StarsCounter",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : new Array('matchLineup'), 
	DEFAULT_ENABLED : true,
	
	init : function() {
    },

    run : function( page, doc ) {
		var notSubstitutedParent = null;
		var totalStars = 0;
		
		var images = doc.images;
		for (var i=0; i<images.length; i++) {
			var img = images[i];
			
			if ( img.src.match(/star/i) || img.src.match(/_half\.gif$/i) ) {
				if (notSubstitutedParent == null) {
					notSubstitutedParent = img.parentNode.parentNode.parentNode.parentNode;
				}
				
				// don't count substituted players
				if (img.parentNode.parentNode.parentNode.getAttribute("class") != "substitute_holder"
					&& (notSubstitutedParent == img.parentNode.parentNode.parentNode.parentNode)) {
					if (img.className.match(/whole/i)) {
						totalStars+=1;
					} else if (img.className.match(/half/i)) {
						totalStars+=0.5;
					} else if (img.className.match(/big/i)) {
						totalStars+=5;
					}
				}
			}
		}
		
		var experienceRuleLink;
		for(var j = 0; j < doc.links.length; j++) {
			if(doc.links[j].className=="skill") {
				experienceRuleLink = doc.links[j];
			}
		}
		var target = experienceRuleLink.parentNode;
		var span = doc.createElement("span");
		span.innerHTML = "<b>" + Foxtrickl10n.getString('total_stars') + "</b> " + totalStars;
		target.appendChild(doc.createElement("br"));
		target.appendChild(span, target);
	},
	
	change : function( page, doc ) {
	
	}
};