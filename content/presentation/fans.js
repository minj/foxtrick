'use strict';
/**
 * Add some infos to fans page
 * @author teles
 */

Foxtrick.modules['Fans'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['fans'],

	OPTIONS: [
		'AddLiveLink',
		'ShowSumFans'
	],

    run: function(doc) {

        if (Foxtrick.Prefs.isModuleOptionEnabled('Fans', 'AddLiveLink')) {
            var reM = new RegExp('matchID=([0-9]*)', 'i');
            var reS = new RegExp('SourceSystem=([A-Za-z]*)', 'i');
            var links = doc.querySelectorAll('#upcoming a[href*="matchID"]');
            for(var i=0; i<links.length; i++) {
                var mM = reM.exec(links[i].getAttribute('href'));
                var mS = reS.exec(links[i].getAttribute('href'));
                var node = Foxtrick.createFeaturedElement(doc, Foxtrick.modules.Fans, 'a');
                node.setAttribute('href', '/Club/Matches/Live.aspx?matchID='+mM[1]+'&actionType=addMatch&SourceSystem='+mS[1]);
                Foxtrick.addImage(doc, node, {alt:Foxtrick.L10n.getString('MyMonitor.htLive'), title:Foxtrick.L10n.getString('MyMonitor.htLive'), src:'/Img/icons/transparent.gif', class:'matchHTLive'});
                links[i].parentNode.parentNode.previousElementSibling.appendChild(node);
            }
        }

        if (Foxtrick.Prefs.isModuleOptionEnabled('Fans', 'ShowSumFans')) {
            var nums = doc.querySelectorAll('#sidebar #members .inc, #sidebar #members .dec');
            var total = 0;
            for(var i=0; i<nums.length; i++) {
                var n = nums[i].textContent;
                if(n.match(/%/)) return; // we may have "-10%" as value, then we can't calculate total
                total += parseInt(n);
            }

            var table = doc.querySelector("#sidebar #members .boxBody .thin");
            var row = Foxtrick.insertFeaturedRow(table, Foxtrick.modules.Fans, -1);
            row.setAttribute('class', 'ft-bordertop');
            var td1 = doc.createElement('td');
            td1.setAttribute('class', 'date bold');
            td1.textContent = Foxtrick.L10n.getString('TeamStats.Total');
            var td2 = doc.createElement('td');
            td2.setAttribute('class', (total>0?'inc':'dec'));
            td2.textContent = (total>0?'+'+total:total);
            row.appendChild(td1);
            row.appendChild(td2);
        }

	}

}