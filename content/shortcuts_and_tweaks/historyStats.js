/**
 * historyStats.js
 * Foxtrick team history stats
 * @author spambot
 */
////////////////////////////////////////////////////////////////////////////////
FoxtrickHistoryStats= {
    
    MODULE_NAME : "HistoryStats",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
	PAGES : new Array('history'), 
    DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.9",
	LATEST_CHANGE:"Displays an overview of cup ranking and league ranking on team history",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.New,
    Buffer : new Array(),
    Pages : new Array(),
    
    init : function() {
    },

    run : function( page, doc ) {
        this.Buffer = Array();
        this.Pages = Array();
        this._fetch(doc);
        this._paste(doc);
    },
        
    change : function( page, doc ) {
        this._fetch(doc);
        this._paste(doc);
    },
    
    _fetch : function(doc) {
        try {
            try {
                var pager = doc.getElementById('ctl00_CPMain_ucOtherEvents_ucPagerBottom_divWrapper');
                var page = parseInt(pager.getElementsByTagName('strong')[0].textContent);
            } catch(e) {var page = 1;}
            if (!Foxtrick.in_array(this.Pages,page)) {

                this.Pages.push(page);
                Foxtrick.dump('<br>' + i + ' | '+ Foxtrick.var_dump(this.Pages) + '\n');
                Foxtrick.dump('-----------------------------------------------------------------------------------------------<br>\n');
                var table = Foxtrick.getElementsByClass('otherEventText', doc.getElementById('ctl00_CPMain_ucOtherEvents_ctl00').cloneNode(true));
                for (var i = 0; i < table.length; i++) {
                    dummy = Foxtrick.trim(table[i].innerHTML);
                    
                    //Foxtrick.dump('<br>' + i + ' | '+ Foxtrick.var_dump(dummy) + '\n');
                    
                        var buff = '';
                        var league = -1;
                        var leagueN = -1;
                        var season = -1;
                        var cup = -1;
                        if(table[i].previousSibling.previousSibling) season = table[i].previousSibling.previousSibling.textContent;
                        var reg = /(\d+)(.*?)(\d+)(.*?)(\d+)(.*?)/i;
                        var ar = reg.exec(season);
                        var stime = ar[0] + '.' + ar[2] + '.' + ar[4] + ' 00.00.01';
                        stime = Foxtrick.substr(stime, Foxtrick.strrpos( stime, ";"), stime.length);
                        season = Foxtrick.gregorianToHT(stime).split('/')[1].split(')')[0];
                        //Foxtrick.dump('HT Season: ' + season + '\n');
                        var a = table[i].getElementsByTagName('a');
                        for (var j = 0; j < a.length; j ++) {
                            if (a[j].href.search(/LeagueLevelUnitID/) > -1) {
                                league = Foxtrick.trim(a[j].innerHTML);
                                var leagueN = league;
                                if (league.search(/\./) > -1) {
                                    league = league.split('.')[0];
                                    league = FoxtrickHelper.romantodecimal(league);
                                } else {
                                    league = 1;
                                }
                            }
                            if (a[j].href.search(/viewcup/) > -1) {
                                while (table[i].getElementsByTagName('a')[0]) {
                                    table[i].removeChild(table[i].getElementsByTagName('a')[0]);
                                }
                                cup = table[i].innerHTML.match(/\d{1,2}/);
                                if (!cup) cup = 'chp';
                            }
                        }
                        //league
                        if (league != -1) {
                            try {
                                while (table[i].getElementsByTagName('a')[0]) {
                                    table[i].removeChild(table[i].getElementsByTagName('a')[0]);
                                }
                            }catch(e_rem){}
                            table[i].innerHTML = Foxtrick.trim(table[i].innerHTML.replace(season,''));
                            var pos = table[i].innerHTML.match(/\d{1}/);
                            buff = season + '|' + league + '|' + pos + '|' + leagueN;
                            if (!Foxtrick.in_array(this.Buffer,buff)) {
                                this.Buffer.push(buff);
                            } else {
                            }
                        } else if (cup != -1) {
                            buff = season + '|' + cup;
                            if (!Foxtrick.in_array(this.Buffer,buff)) {
                                this.Buffer.push(buff);
                            } else {
                            }
                        }
                        
                }
                Foxtrick.dump('Buffer:' + Foxtrick.var_dump(this.Buffer) + '\n');            
                Foxtrick.dump('-----------------------------------------------------------------------------------------------<br>\n');          
            }
        } catch(e) {Foxtrick.dump(this.MODULE_NAME + ' paste ' + e + '\n');}
    },
    
    _paste : function(doc){
        if (this.Buffer.length==0) return;
        try {
            var HistoryTable="<tr><th>"+Foxtrickl10n.getString("foxtrick.HistoryStats.season")+"</th><th>"+Foxtrickl10n.getString("foxtrick.HistoryStats.cup")+"</th><th>"+Foxtrickl10n.getString("foxtrick.HistoryStats.league")+"</th><th>"+Foxtrickl10n.getString("foxtrick.HistoryStats.pos")+"</th></tr>";
            
            var last = -1;
            for (var i = 0; i< this.Buffer.length; i++){
                var dummy = this.Buffer[i].split('|');
                var line = '<tr><td>%s'+dummy[0]+'</td><td>%c'+dummy[0]+'</td><td>%l'+dummy[0]+'</td><td>%p'+dummy[0]+'</td></tr>';
                // Foxtrick.dump(Foxtrick.var_dump(dummy));
                
                if (last == -1 || last != dummy[0]) {
                    HistoryTable += line;
                }
                
                
                HistoryTable = HistoryTable.replace("%s"+dummy[0],dummy[0]);                
                
                if (dummy[3]){
                    HistoryTable = HistoryTable.replace("%p"+dummy[0],dummy[2]);
                    HistoryTable = HistoryTable.replace("%l"+dummy[0],dummy[3]);
                } else{
                    HistoryTable = HistoryTable.replace("%c"+dummy[0],dummy[1]);
                }
                
                last = dummy[0];
            }
            var	table = doc.createElement("table");
            table.setAttribute( "class", 'smallText' );
            HistoryTable=HistoryTable.replace(/((\%c)|(\%p)|(\%l))\d{1,2}/gi,'-');
            table.innerHTML = HistoryTable;
            
            try {
                var	ownBoxBody = doc.createElement("div");
                var header = Foxtrickl10n.getString("foxtrick.HistoryStats.label");
                var ownBoxId = "ft_HistoryStats_box";
                var ownBoxBodyId = "ft_HistoryStats";
                ownBoxBody.setAttribute( "id", ownBoxBodyId );
                ownBoxBody.appendChild(table);
                Foxtrick.addBoxToSidebar( doc, header, ownBoxBody, ownBoxId, "last", "");
            }catch(e_box){Foxtrick.dump('ERROR');}
            doc.getElementById('ft_HistoryStats').firstChild.innerHTML = table.innerHTML;
        } catch(e) {Foxtrick.dump(this.MODULE_NAME + ' paste ' + e + '\n');}
        Foxtrick.dump('FLUSHED');
    }
};




