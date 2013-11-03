'use strict';
/**
 * forumhidesignature.js
 * Script which hides signatures on the forums, but shows a 'Show sig' link
 * @author smates, larsw84, CatzHoek
 */

Foxtrick.modules['HideSignatures'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.FORUM,
	PAGES: ['forumViewThread'],
	run: function(doc) {
		var hideSignatures = function(elems) {
			for (var i = 0; i < elems.length; i++) {
				//the signature
				Foxtrick.addClass(elems[i], 'hidden');
				var sigId = elems[i].id;
				if (!sigId) {
					// truncated signatures have ids
					elems[i].setAttribute('id', 'foxtrick-signature-' + i);
					sigId = i;
				}
				//the button
				var showSigLink =
					Foxtrick.createFeaturedElement(doc, Foxtrick.modules['HideSignatures'], 'a');
				Foxtrick.addClass(showSigLink, 'foxtrick-signaturetoggle');
				showSigLink.setAttribute('style', 'cursor: pointer;');
				showSigLink.setAttribute('title',
				                         Foxtrick.L10n.getString('HideSignatures.signaturetoggle'));
				showSigLink.setAttribute('id', 'foxtrick-st-link-' + sigId);
				var text = doc.createTextNode(Foxtrick.L10n
				                              .getString('HideSignatures.signaturetoggle'));
				showSigLink.appendChild(text);

				try {
					// append the show sig link to the right footer
					var cfWrapper = elems[i];
					while (!Foxtrick.hasClass(cfWrapper, 'cfWrapper'))
						cfWrapper = cfWrapper.parentNode;

					var floatRight = cfWrapper.querySelector('.cfFooter .float_right');
					floatRight.appendChild(showSigLink);
				} catch (e) {
					Foxtrick.dump('HideSignatures: Unexpected DOM Structure', e);
				}

				//toogle
				Foxtrick.listen(showSigLink, 'click',
				  function(ev) {
					try {
						var id = ev.target.getAttribute('id').replace('foxtrick-st-link-', '');
						try {
							var sig = doc.getElementById('foxtrick-signature-' + id) ||
								doc.getElementById(id); // truncated
							Foxtrick.toggleClass(sig, 'hidden');
						} catch (e) {
							Foxtrick.toggleClass(sig, 'hidden');
						}
					} catch (e) {
						Foxtrick.dump('HideSignatures click listener error. Id: ' + id + ' ' + sig +
						              ' ' + e + '\n');
					}
				}, false);
			}
		};

		//ht setting full signatures
		var signatures = doc.getElementsByClassName('signature');
		hideSignatures(signatures);

		//ht setting truncated signatures
		var signatures_trunc = doc.getElementsByClassName('signature-trunc');
		hideSignatures(signatures_trunc);
	}
};
