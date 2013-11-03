'use strict';
/**
 * supporters-list.js
 * show which supported team support you back and vice versa
 * @author teles
 */

Foxtrick.modules['SupportersList'] = {
	MODULE_CATEGORY: Foxtrick.moduleCategories.PRESENTATION,
	PAGES: ['supporters'],
	OPTIONS: ['SupporterBack', 'SupportedBack'],

	run: function(doc) {
		//var rtl = Foxtrick.util.layout.isRtl(doc);
		var supporterBack = Foxtrick.Prefs.isModuleOptionEnabled('SupportersList', 'SupporterBack');
		var supportedBack = Foxtrick.Prefs.isModuleOptionEnabled('SupportersList', 'SupportedBack');
        if (!supporterBack && !supportedBack)
			return;

        Foxtrick.util.api.retrieve(doc, [
            ['file', 'teamdetails'],
            ['version', '2.9'],
            ['teamId', Foxtrick.util.id.getOwnTeamId()],
            ['includeSupporters', 'true']
          ],
          { cache_lifetime: 'session' },
          function(xml, errorText) {
            if (errorText) {
                Foxtrick.log(errorText);
                return;
            }
            var teams = xml.getElementsByTagName('TeamID');
            var team = null;
            for(var t=0; t<teams.length; t++) {
                if(teams[t].textContent == Foxtrick.util.id.getOwnTeamId()) {
                    team = teams[t].parentNode;
                    break;
                }
            }
            if(team == null)
                return;

            var sup = null, my = false;
            if(Foxtrick.getParameterFromUrl(Foxtrick.getHref(doc), 'actionType')==null && supportedBack)
                sup = team.getElementsByTagName('MySupporters')[0];
            else if(Foxtrick.getParameterFromUrl(Foxtrick.getHref(doc), 'actionType')=='mysupporters' && supporterBack) {
                sup = team.getElementsByTagName('SupportedTeams')[0];
                my = true;
            }
            if(sup == null)
                return;

            var ids = [];
            var all = sup.getElementsByTagName('TeamId');
            for(var i=0; i<all.length; i++)
                ids.push(all[i].textContent);

            var links = doc.querySelectorAll('#mainBody a[href*="TeamID"]');
            var re = new RegExp('TeamID=([0-9]+)', 'i');
            for(var l=0; l<links.length; l++) {
                var href = links[l].getAttribute('href');
                var matches = re.exec(href);
                if(matches[1] && Foxtrick.indexOf(ids, matches[1])!=-1) {
                    var node = my ? links[l].parentNode.parentNode.previousElementSibling : links[l].parentNode;
                    Foxtrick.addImage(doc, node, {
                        'src': '/Img/Icons/transparent.gif',
                        'class': (my ? 'scMySupporters' : 'scFans'),
                        'width' : '22px',
                        'height' : '22px',
                        'title': (my ? Foxtrick.L10n.getString('supporters.youSupportOther') : Foxtrick.L10n.getString('supporters.otherSupportYou')),
                        'alt': (my ? Foxtrick.L10n.getString('supporters.youSupportOther') : Foxtrick.L10n.getString('supporters.otherSupportYou'))
                    }, node.firstChild, function(img){
                        Foxtrick.makeFeaturedElement(img, Foxtrick.modules.SupportersList);
                    });
                }
            }
        });
	}
};
