/**
 * links-league.js
 * Foxtrick add links to country pages
 * @author convinced
 */

////////////////////////////////////////////////////////////////////////////////
var FoxtrickLinksCountry = {
	MODULE_NAME : "LinksCountry",
	MODULE_CATEGORY : Foxtrick.moduleCategories.LINKS,
	PAGES : new Array('country'),
	OPTION_FUNC : function(doc) {
		return Foxtrick.links.getOptionsHtml(doc, this, false, "countrylink");
	},

	run : function(doc) {
		//addExternalLinksToCountryDetail
		var ownBoxBody=null;
		var countryid;
		var alldivs = doc.getElementsByTagName('div');
		for (var j = 0; j < alldivs.length; j++) {
			if (alldivs[j].className=="main mainRegular") {
					var thisdiv = alldivs[j];
					countryid = Foxtrick.util.id.findCountryId(thisdiv);
					}
			}

		try {
			var englishdiv = doc.getElementById('mainBody').getElementsByTagName('h1')[0].nextSibling;
			if (englishdiv.textContent.search(/Englisch: (\w+)/)==-1) englishdiv = englishdiv.nextSibling;
			var english_name = englishdiv.textContent.match(/Englisch: (\w+)/)[1];
		} catch(e){Foxtrick.log(e)}

		var links = Foxtrick.LinkCollection.getLinks("countrylink", { "countryid": countryid, "english_name":english_name }, doc, this);

		if (links.length > 0) {
			ownBoxBody = doc.createElement("div");
			var header = Foxtrickl10n.getString(
						"foxtrick.links.boxheader" );
			var ownBoxBodyId = "foxtrick_links_content";
			ownBoxBody.setAttribute( "id", ownBoxBodyId );

			for (var k = 0; k < links.length; k++) {
				links[k].link.className ="inner";
				ownBoxBody.appendChild(links[k].link);
			}

			var box = Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, -20);
			box.id = "ft-links-box";
		}
		Foxtrick.util.links.add(doc,ownBoxBody,this.MODULE_NAME,{ "countryid": countryid });
	}
};
Foxtrick.util.module.register(FoxtrickLinksCountry);
