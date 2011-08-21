/**
 * history-stats.js
 * Foxtrick team history stats
 * @author spambot
 */
////////////////////////////////////////////////////////////////////////////////
var FoxtrickHistoryStats= {
	MODULE_NAME : "HistoryStats",
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ["history"],
	NICE : -1,  // before FoxtrickCopyMatchID
	Buffer : [],
	Pages : [],
	Offset : 0,

	run : function(doc) {
		this.Buffer = [];
		this.Pages = [];
		this._fetch(doc);
		this._paste(doc);
	},

	change : function(doc) {
		this._fetch(doc);
		this._paste(doc);
	},

	_fetch : function(doc) {
		try {
			// try to get current page number
			try {
				var pager = doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucOtherEvents_ucPagerBottom_divWrapper');
				var page = parseInt(pager.getElementsByTagName('strong')[0].textContent);
			}
			catch (e) {
				var page = 1;
			}
			if (!Foxtrick.member(this.Pages,page)) {
				this.Pages.push(page);

				// get season offset
				try {
					var a = doc.getElementById('ctl00_ctl00_CPContent_CPMain_ucOtherEvents_ctl00').getElementsByTagName('a');
					for (var i = 0; i < a.length;i++){
						if (a[i].href.search(/viewcup/) > -1) {
							var check_season = a[i].textContent;

							if (a[i].parentNode.parentNode.getElementsByClassName("date").length > 0) {
								var season = a[i].parentNode.parentNode.getElementsByClassName("date")[0].textContent;
								var date = Foxtrick.util.time.getDateFromText(season);
								season = Foxtrick.util.time.gregorianToHT(date).season;
								this.Offset = parseInt(season)-parseInt(check_season);
								break;
							}
						}
					}
				}
				catch (e) {
					Foxtrick.log(e);
				}

				var table = doc.getElementById("ctl00_ctl00_CPContent_CPMain_ucOtherEvents_ctl00").cloneNode(true).getElementsByClassName("otherEventText");
				for (var i = 0; i < table.length; i++) {
					if (table[i].innerHTML.search(/\<span class\=\"shy\"\>/) != -1)
						continue;

					var buff = '';
					var league = -1;
					var leagueN = -1;
					var season = -1;
					var cup = -1;
					if (table[i].parentNode.getElementsByClassName("date").length)
						season = table[i].parentNode.getElementsByClassName("date")[0].textContent;
					var date = Foxtrick.util.time.getDateFromText(season);
					season = Foxtrick.util.time.gregorianToHT(date).season;
					var a = table[i].getElementsByTagName('a');
					var isLgHist = function(a) {
						return (a.href.indexOf("LeagueLevelUnitID") > -1)
							&& (a.href.indexOf("RequestedSeason") > -1);
					};
					var isCupHist = function(a) {
						return (a.href.indexOf("actiontype=viewcup") > -1);
					};
					for (var j = 0; j < a.length; j ++) {
						if (isLgHist(a[j])) {
							league = a[j].textContent;
							var leagueN = league;
							if (league.search(/\./) > -1) {
								league = league.split('.')[0];
								league = Foxtrick.util.id.romantodecimal(league);
							}
							else {
								league = 1;
							}
						}
						if (isCupHist(a[j])) {
							while (table[i].getElementsByTagName('a')[0]) {
								table[i].removeChild(table[i].getElementsByTagName('a')[0]);
							}
							cup = table[i].innerHTML.match(/\d{1,2}/);
							if (!cup)
								cup = '<span class="bold" title="'+Foxtrickl10n.getString("foxtrick.HistoryStats.cupwinner")+'">' + Foxtrickl10n.getString("foxtrick.HistoryStats.cupwinner.short") + '</span>';
						}
					}
					//league
					if (league != -1) {
						try {
							while (table[i].getElementsByTagName('a')[0])
								table[i].removeChild(table[i].getElementsByTagName('a')[0]);
						}
						catch (e_rem) {}
						table[i].innerHTML = Foxtrick.trim(table[i].innerHTML.replace(season-this.Offset,''));
						var pos = table[i].innerHTML.match(/\d{1}/);
						buff = season + '|' + league + '|' + pos + '|' + leagueN;
						if (!Foxtrick.member(this.Buffer,buff))
							this.Buffer.push(buff);
					}
					else if (cup != -1) {
						buff = season + '|' + cup;
						if (!Foxtrick.member(this.Buffer,buff))
							this.Buffer.push(buff);
					}
				}
			}
		}
		catch (e) {
			Foxtrick.log(e);
		}
	},

	_paste : function(doc){
		if (this.Buffer.length==0) return;
		try {
			var HistoryTable="<tr>" +
				"<th title='"+Foxtrickl10n.getString("foxtrick.HistoryStats.season")+"'>"+Foxtrickl10n.getString("foxtrick.HistoryStats.season.short")+"</th>" +
				"<th title='"+Foxtrickl10n.getString("foxtrick.HistoryStats.cup")+"'>"+Foxtrickl10n.getString("foxtrick.HistoryStats.cup.short")+"</th>" +
				"<th title='"+Foxtrickl10n.getString("foxtrick.HistoryStats.league")+"'>"+Foxtrickl10n.getString("foxtrick.HistoryStats.league.short")+"</th>" +
				"<th title='"+Foxtrickl10n.getString("foxtrick.HistoryStats.pos")+"'>"+Foxtrickl10n.getString("foxtrick.HistoryStats.pos.short")+"</th></tr>";

			var last = -1;
			for (var i = 0; i< this.Buffer.length; i++){
				var dummy = this.Buffer[i].split('|');
				dummy[0] = parseInt(dummy[0]) - this.Offset + '|';
				var line = '<tr><td>%s'+dummy[0]+'</td><td>%c'+dummy[0]+'</td><td title="%l_t'+dummy[0]+'">%l'+dummy[0]+'</td><td>%p'+dummy[0]+'</td></tr>';

				if (last == -1 || last != dummy[0]) {
					HistoryTable += line;
				}


				HistoryTable = HistoryTable.replace("%s"+dummy[0],dummy[0]);

				if (dummy[3]){
					HistoryTable = HistoryTable.replace("%p"+dummy[0],dummy[2]);
					if (dummy[3].length > 8)
					{
						HistoryTable = HistoryTable.replace("%l"+dummy[0],dummy[3].substr(0,5) + '…');
					}
					else
					{
						HistoryTable = HistoryTable.replace("%l"+dummy[0],dummy[3]);
					}
					HistoryTable = HistoryTable.replace("%l_t"+dummy[0],dummy[3]);
				} else{
					HistoryTable = HistoryTable.replace("%c"+dummy[0],dummy[1]);
				}

				last = dummy[0];
			}
			var	table = doc.createElement("table");
			table.setAttribute( "class", 'smallText historystats' );
			HistoryTable=HistoryTable.replace(/((\%c)|(\%p)|(\%l))\d{1,2}\|/gi,'-').replace(/\|/g,'');;
			table.innerHTML = HistoryTable;

			try {
				var	ownBoxBody = doc.createElement("div");
				var header = Foxtrickl10n.getString("foxtrick.HistoryStats.label");
				var ownBoxBodyId = "ft_HistoryStats";
				ownBoxBody.setAttribute( "id", ownBoxBodyId );
				ownBoxBody.appendChild(table);
				Foxtrick.addBoxToSidebar(doc, header, ownBoxBody, 1);
			}
			catch (e) {
				Foxtrick.log(e);
			}
			doc.getElementById('ft_HistoryStats').firstChild.innerHTML = table.innerHTML;
		}
		catch (e) {
			Foxtrick.log(e);
		}
	}
};
Foxtrick.util.module.register(FoxtrickHistoryStats);
