/**
* youthstatistics.js
* Foxtrick copies youth league fixtures to clipboard and adds a link to youth league statistics at http://www.ht-ys.org
* @author Parminu
*/

var FoxtrickCopyYouthLeagueFixturesSource = {
        MODULE_NAME : "CopyYouthLeagueFixturesSource",
        MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
        PAGES : new Array('youthfixtures'),
        OPTIONS : new Array("OpenHTYSpage"),
        page_html:'',

        run : function( page, doc ) {
                this.page_html = '<html> '+doc.documentElement.innerHTML+' </html>';

                if (FoxtrickPrefs.getBool( "smallcopyicons" )) {
                        if (doc.getElementById('copyyouthfixturessource')) return;
                        var boxHead = doc.getElementById('mainWrapper').getElementsByTagName('div')[1];
                        if (boxHead.className!='boxHead') return;

                        if (Foxtrick.isStandardLayout(doc)) doc.getElementById('mainBody').setAttribute('style','padding-top:10px;');

                        var messageLink = doc.createElement("a");
                        messageLink.className = "inner copyicon copyyouthfixturessource ci_first";
                        messageLink.id='copyyouthfixturessource';
                        messageLink.title = Foxtrickl10n.getString("foxtrick.tweaks.copyyouthfixturessource" );
                        messageLink.addEventListener("click", this.copySource, false)

                        var img = doc.createElement("img");
                        img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyyouthfixturessource" );
                        img.src = "/Img/Icons/transparent.gif";

                        messageLink.appendChild(img);
                        boxHead.insertBefore(messageLink,boxHead.firstChild);
                }
                else {
                        var parentDiv = doc.createElement("div");
                        parentDiv.id = "foxtrick_addyouthstatisticsbox_parentDiv";
                        parentDiv.setAttribute("style","display: inline; margin-right:8px;");

                        var messageLink = doc.createElement("a");
                        messageLink.className = "inner";
                        messageLink.title = Foxtrickl10n.getString(
                                "foxtrick.tweaks.copyyouthfixturessource" );
                        messageLink.setAttribute("style","cursor: pointer;");
                        messageLink.addEventListener("click", this.copySource, false);

                        var img = doc.createElement("img");
                        img.style.padding = "0px 5px 0px 0px;";
                        img.className = "actionIcon";
                        img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.copyyouthfixturessource" );
                        img.src = Foxtrick.ResourcePath+"resources/img/copy/copyNormal.png";
                        messageLink.appendChild(img);

                        parentDiv.appendChild(messageLink);

                        var newBoxId = "foxtrick_actions_box";
                        Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString(
                                "foxtrick.tweaks.youthstatistics" ), parentDiv, newBoxId, "first", "");
                }
        },

        change : function( page, doc ) {
                var id = "foxtrick_addyouthstatisticsbox_parentDiv";
                if(!doc.getElementById(id)) {
                    this.run( page, doc );
                }
        },

        copySource : function( ev ) {
                try {
                    var doc = ev.target.ownerDocument;
                    var html = '<html> '+doc.documentElement.innerHTML+' </html>';

                    var insertBefore = doc.getElementsByTagName('h1')[0];
                    Foxtrick.copyStringToClipboard(FoxtrickCopyYouthLeagueFixturesSource.fixbr(FoxtrickCopyYouthLeagueFixturesSource.page_html ));
                    var note = Foxtrick.util.note.add(doc, insertBefore, "ft-youthfixtures-source-copy-note", Foxtrickl10n.getString("foxtrick.tweaks.youthfixturessourcecopied"), null, true);

                    if (Foxtrick.isModuleFeatureEnabled( FoxtrickCopyYouthLeagueFixturesSource, "OpenHTYSpage")) {
                        Foxtrick.newTab('http://www.ht-ys.org/read_fixtures');
                    }
                }
                catch (e) {
                    Foxtrick.log(e);
                }
        },

        fixbr : function(text) {
                return text.replace(/\<br\>/g,'<br />' );
        }
};

var FoxtrickYouthStatistics = {
        MODULE_NAME : "YouthStatistics",
        MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
        PAGES : new Array('youthleague'),

        run : function( page, doc ) {
                if (FoxtrickPrefs.getBool( "smallcopyicons" )) {
                        if (doc.getElementById('linkyouthstatistics')) return;
                        var boxHead = doc.getElementById('mainWrapper').getElementsByTagName('div')[1];
                        if (boxHead.className!='boxHead') return;

                        if (Foxtrick.isStandardLayout(doc)) doc.getElementById('mainBody').setAttribute('style','padding-top:10px;');

                        var messageLink = doc.createElement("a");

                        messageLink.className = "inner copyicon linkyouthstatistics ci_second";
                        messageLink.id='linkyouthstatistics';
                        messageLink.title = Foxtrickl10n.getString("foxtrick.tweaks.linkyouthstatistics" );
                        messageLink.addEventListener("click", this.openStats, false);

                        var img = doc.createElement("img");
                        img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.linkyouthstatistics" );
                        img.src = "/Img/Icons/transparent.gif";

                        messageLink.appendChild(img);
                        boxHead.insertBefore(messageLink,boxHead.firstChild);
                }
                else {
                        var parentDiv = doc.createElement("div");
                        parentDiv.id = "foxtrick_addyouthstatisticsbox_parentDiv";
                        parentDiv.setAttribute("style","display: inline; margin-right:8px;");

                        var messageLink = doc.createElement("a");
                        messageLink.className = "inner";
                        messageLink.title = Foxtrickl10n.getString(
                                "foxtrick.tweaks.linkyouthstatistics" );
                        messageLink.setAttribute("style","cursor: pointer;");
                        messageLink.addEventListener("click", this.openStats, false)

                        var img = doc.createElement("img");
                        img.style.padding = "0px 5px 0px 0px;";
                        img.className = "actionIcon";
                        img.alt = Foxtrickl10n.getString( "foxtrick.tweaks.linkyouthstatistics" );
                        img.src = Foxtrick.ResourcePath+"resources/img/copy/copyNormal.png";
                        messageLink.appendChild(img);

                        parentDiv.appendChild(messageLink);

                        var newBoxId = "foxtrick_actions_box";
                        Foxtrick.addBoxToSidebar( doc, Foxtrickl10n.getString(
                                "foxtrick.tweaks.youthstatistics" ), parentDiv, newBoxId, "first", "");
                }
        },

        change : function( page, doc ) {
                var id = "foxtrick_addyouthstatisticsbox_parentDiv";
                if(!doc.getElementById(id)) {
                    this.run( page, doc );
                }
        },

        openStats : function( ev ) {
                try {
                    var doc = ev.target.ownerDocument;
                    var mainWrapper = doc.getElementById("mainWrapper");
                    var span = mainWrapper.getElementsByTagName("span")[0];
                    var youthLeagueLink = span.getElementsByTagName("a")[0].href;
                    var youthLeagueIdMatch = youthLeagueLink.match(RegExp("YouthLeagueId=(\\d+)", "i"));
                    var youthLeagueId = youthLeagueIdMatch[1];
                    Foxtrick.newTab('http://www.ht-ys.org/?league_id=' + youthLeagueId);
                }
                catch (e) {
                    Foxtrick.log(e);
                }
        }
};