"use strict";
/**
 * match-order.js
 * Foxtrick moatch oder interface tweaks
 * @author convinced
 */

Foxtrick.util.module.register({
	MODULE_NAME : "MatchOrder",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : ['matchOrder'],
	CSS : Foxtrick.InternalPath + "resources/css/match-order.css",

	run : function(doc) {
		var lastNumbers = new Array(7);
		
		var changeHandler = function(ev) {
			Foxtrick.log('changeHandler')
			var doc = ev.target.ownerDocument;
			var fieldOverlay = doc.getElementById('fieldOverlay');
			var overlayRatings = fieldOverlay.getElementsByClassName('overlayRatings');
			for (var i=0,count=0; i< overlayRatings.length;++i) {
				if (Foxtrick.hasClass(overlayRatings[i],'posLabel'))
					continue;
				var text = overlayRatings[i].textContent;
				var fullLevel = Foxtrickl10n.getLevelFromText(text);
				if (fullLevel) { 
					var levelText ='['+fullLevel.toFixed(2)+']';
					var id = 'ft-full-level' + count;
					if (lastNumbers[count] !== undefined) { 
						var div = doc.getElementById(id);
						div.textContent = levelText;
						var diff = fullLevel-lastNumbers[count];
						var span = doc.createElement('span');
						span.textContent = ' ['+diff.toFixed(2)+']';
						if (diff < 0) 
							span.setAttribute('style','color:red;');
						else if (diff > 0) 
							span.setAttribute('style','color:blue;');
						div.appendChild(span);
					}
					else {
						var div = doc.createElement('div');
						div.id = id;
						div.textContent = levelText;
					}
					overlayRatings[i].parentNode.insertBefore(div, overlayRatings[i].nextSibling);
					lastNumbers[count++] = fullLevel;
				}
			}
			
			// open first time
			if (!doc.getElementById('calcRatingsClone')) {
				
				Foxtrick.util.inject.jsLink(doc, Foxtrick.InternalPath+"resources/js/matchOrder.js");
				
				var hideOverlay = function(ev) {
					Foxtrick.removeClass(fieldOverlay,'visible');
				};
				var closeOverlayButton = doc.getElementById('closeOverlay');
				closeOverlayButton.addEventListener('click',hideOverlay,false);
				Foxtrick.addClass(fieldOverlay,'visible');
				
				var calcRatingsButtonClone = doc.getElementById('calcRatings').cloneNode(true);
				calcRatingsButtonClone.id = 'calcRatingsClone';
				calcRatingsButtonClone.setAttribute('style','float: right; position: absolute; bottom: 0px; right: 100px;');
				fieldOverlay.appendChild(calcRatingsButtonClone)
			}
		};

		var changeScheduled = false;
		var waitForChanges = function (ev) {
			var doc = ev.target.ownerDocument;
			if (changeScheduled) 
				return;
			changeScheduled = true;
			window.setTimeout ( function() {
				changeScheduled = false;
				stopListenToChange(doc);
				changeHandler(ev);
				startListenToChange(doc);
			}, 0)
		}
		var stopListenToChange = function (doc) {
			var content = doc.getElementById("fieldOverlay");
			content.removeEventListener("DOMNodeInserted", waitForChanges, true);
		}
		var startListenToChange = function(doc) {
			var content = doc.getElementById("fieldOverlay");
			content.addEventListener("DOMNodeInserted", waitForChanges, true);
		}

		Foxtrick.log('run');
		startListenToChange(doc);
	},
});
