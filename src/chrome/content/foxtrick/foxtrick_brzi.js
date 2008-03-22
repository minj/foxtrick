function foxtrick_makeConfLink ()  {
	var url=gContextMenu.link.href;
	var ConfLink='';
	if (url.search(/playerdetails.asp/i) > -1 && url.search(/playerid/i) > -1) {
		ConfLink='[playerid='+url.replace(/.+playerid=/i,'').match(/^\d+/)+']';
	} else if (url.search(/matchdetails.asp/i) > -1 && url.search(/matchid/i) > -1) {
		ConfLink='[matchid='+url.replace(/.+matchid=/i,'').match(/^\d+/)+']';
	} else if (url.search(/nationalteamdetails.asp/i) > -1 && url.search(/leagueid/i) > -1) {
		ConfLink='[leagueid='+url.replace(/.+league=/i,'').match(/^\d+/)+']';
	} else if (url.search(/teamdetails.asp/i) > -1 && url.search(/teamid/i) > -1) {
		ConfLink='[teamid='+url.replace(/.+teamid=/i,'').match(/^\d+/)+']';	
	} else if (url.search(/leagueDetails.asp\?LeagueLevelUnitID/i) > -1 ) {
		ConfLink='[leagueid='+url.replace(/.+LeagueLevelUnitID=/i,'').match(/^\d+/)+']';
	} else if (url.search(/cn.asp/i) > -1 ) {
		// There are long (on the right) and short links for conference posts on hattrick
		if (url.search(/threadid/i) > -1 ) { //long ones
			ConfLink='[message='+url.replace(/.+threadid=/i,'').match(/^\d+/)+'.'+url.replace(/.+number=/i,'').match(/^\d+/)+']';
		}else { // other ones
			ConfLink='[message='+url.replace(/.+t=/i,'').match(/^\d+/)+'.'+url.replace(/.+n=/i,'').match(/^\d+/)+']';
		}	
	} else if (url.search(/alliances.asp\?actionType=show&AllianceID/i) > -1 ) {
		ConfLink='[allianceid='+url.replace(/.+alliance=/i,'').match(/^\d+/)+']';
	} else { //link anything
		ConfLink='[link='+url.replace(/.+\/common\//i,'/Common/')+']';
	}

	foxtrick_putTextToClipboard(ConfLink);
}