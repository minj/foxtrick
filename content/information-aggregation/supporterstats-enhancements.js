/* supporterstats-enhancements.js
 * Add extra information to supporterstats
 * @author convincedd
 */

FoxtrickSupporterStatsEnhancements = {
	MODULE_NAME : "SupporterStatsEnhancements",
	MODULE_CATEGORY : Foxtrick.moduleCategories.INFORMATION_AGGREGATION,
	PAGES : ["StatsSquad"],

	run : function(doc) {
		// get selected teamid
		var teamid=0;
		var options = doc.getElementById('ctl00_ctl00_CPContent_CPMain_ddlTeams').getElementsByTagName('option');
		for (var i=0; i<options.length; ++i) {
			if (options[i].getAttribute('selected')=='selected') { teamid=Number(options[i].value); break; }
		}			
		if (teamid==0) return;
		
		var args = [];
		args.push(["teamId", teamid]);
		args.push(["file", "players"]);
		
		Foxtrick.ApiProxy.retrieve(doc, args, function(xml) {	 
			if (!xml)
				return;
			var playerNodes = xml.getElementsByTagName("Player");

			var table = doc.getElementById('mainBody').getElementsByTagName('table')[0];
			var th = doc.createElement('th');
			th.textContent = Foxtrickl10n.getString('CurrentSquad');
			th.addEventListener("click", FoxtrickTableSort.clickListener, true);
			table.getElementsByTagName('tr')[0].appendChild(th);
				
			var as=doc.getElementById('mainBody').getElementsByTagName('a');
			for (var i=0; i<as.length; ++i) {
				if (as[i].href.search(/\/Club\/Players\/Player.aspx\?playerId=\d+/i)!==-1) {
					var id = Number(as[i].href.match(/\/Club\/Players\/Player.aspx\?playerId=(\d+)/i)[1]);
					var inSquad=false;
					for (var j = 0; j < playerNodes.length; ++j) {
						var playerNode = playerNodes[j];
						var pid = Number(playerNode.getElementsByTagName("PlayerID")[0].textContent);
						if (pid === id) {
							inSquad=true;
							break;
						}
					}
					var td = doc.createElement('td');
					td.className='center';
					if (inSquad) td.textContent = 'x';
					as[i].parentNode.parentNode.appendChild(td);
				}	
			}	
		}, { caller_name:this.MODULE_NAME, cache_lifetime:'default'});
	}
};
