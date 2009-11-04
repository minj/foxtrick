/**
 * Formates the match report.
 *  * @author spambot
 */

FoxtrickMatchReportFormat = {
	MODULE_NAME : "MatchReportFormat",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	PAGES : new Array('match'), 
	DEFAULT_ENABLED : false,
	NEW_AFTER_VERSION: "0.4.8.9",
	LATEST_CHANGE:"BugFix after HT Update 16.09.2009",	
	OPTION_TEXTS : true,
	OPTION_TEXTS_DEFAULT_VALUES : new Array( "#5555FF", //Text My team name     0
											 "#9F0202",  //Text Home team name   1
                                             "#16029F",  //Text Away team name   2
                                             "#E3E9FF",  //BG My Team            3
                                             "#FFE8E8",  //BG Home               4
                                             "#E0EFE0",  //BG Away               5
                                             "0",        //borders_normal        6
                                             "0",        //borders_goal          7
                                             "#9DCF9B",  //border_color_non_goal 8
                                             "#AAAAFF",  //border_color_goal my  9
                                             "#9F0202",      //border_color_goal home 10
                                             "#5555FF",     //border_color_goal away 11
                                             "#F5F5F5",  //normal text 12
                                             "#E0E0E0"   //helf time text 13
										),
	OPTIONS : new Array("Text_My_Team", "Text_Home", "Text_Away", "BG_My_Team", "BG_Home", "BG_Away", "border_width_normal", "border_width_goal", "border_color_non_goal", "border_color_goal_my", "border_color_goal_home", "border_color_goal_away", "normaltext", "half_time"),

    UNKNOWN_COLOUR : "#F0F0F0",

	NEW_AFTER_VERSION: "0.4.8.2",
	LATEST_CHANGE:"some format of match report for better reading",
	LATEST_CHANGE_CATEGORY : Foxtrick.latestChangeCategories.NEW,
 	//OPTIONS : new Array("DefaultShow"),

	init : function() {
    },

    run : function( page, doc ) {

		var isarchivedmatch = (doc.getElementById("ctl00_CPMain_lblMatchInfo")==null);
		if (!isarchivedmatch) return;

        var div = doc.getElementById('mainBody');
        var div_check = Foxtrick.getElementsByClass('ft_mR_format', div);
        if  (div_check.length > 0) return;

        //Retrieve teams id
		var myTeamId=FoxtrickHelper.findTeamId(doc.getElementById('teamLinks'));
		var table = doc.getElementById('mainBody').getElementsByTagName('table')[0];
		var HomeTeamId=FoxtrickHelper.findTeamId(table.rows[0].cells[1]);
		var AwayTeamId=FoxtrickHelper.findTeamId(table.rows[0].cells[2]);

		// dump ('ownteam: '+myTeamId+'\n');
		// dump ('HomeTeamId: '+HomeTeamId+'\n');
		// dump ('AwayTeamId: '+AwayTeamId+'\n');

        var headder = doc.getElementsByTagName('h1')[0].innerHTML;
        headder=Foxtrick.trim(headder);
        var start = Foxtrick.strrpos(headder, '<span>(') +7;
        var end = Foxtrick.strrpos(headder, ')</span>');

        var gameid = headder.substr(start, end-start);

		//Retrieve style parameters
       var txt_col_my = this._getPrefs( 0 );
         var txt_col_hm = this._getPrefs( 1 );
         var txt_col_aw = this._getPrefs( 2 );
       var bg_col_my = this._getPrefs( 3 );
         var bg_col_hm = this._getPrefs( 4 );
         var bg_col_aw = this._getPrefs( 5 );
         var borders_normal = this._getPrefs( 6 );
         var borders_goal = this._getPrefs( 7 );
         var border_color = this._getPrefs( 8 );
       var border_color_my = this._getPrefs( 9 );
         var border_color_hm = this._getPrefs( 10 );
         var border_color_aw = this._getPrefs( 11 );
         var text_normal = this._getPrefs( 12 );
         var text_dark = this._getPrefs( 13 );

        //Replace myTeam colour
		if (HomeTeamId == myTeamId) {
            bg_col_hm = bg_col_my;
            border_color_hm = border_color_my;
            txt_col_hm = txt_col_my;
            table.rows[0].cells[1].innerHTML = '<a style="color:' + txt_col_my + ';" href="/Club/Matches/MatchLineup.aspx?MatchID=' + gameid + '&TeamID=' + HomeTeamId + '">' + table.rows[0].cells[1].textContent +'</a>';
            table.rows[0].cells[2].innerHTML = '<a style="color:' + txt_col_aw + ';" href="/Club/Matches/MatchLineup.aspx?MatchID=' + gameid + '&TeamID=' + AwayTeamId + '">' + table.rows[0].cells[2].textContent +'</a>';

        }
		else if (AwayTeamId == myTeamId) {
            bg_col_aw = bg_col_my;
            border_color_aw = border_color_my;
            txt_col_aw = txt_col_my;
            table.rows[0].cells[1].innerHTML = '<a style="color:' + txt_col_hm + ';" href="/Club/Matches/MatchLineup.aspx?MatchID=' + gameid + '&TeamID=' + HomeTeamId + '">' + table.rows[0].cells[1].textContent +'</a>';
            table.rows[0].cells[2].innerHTML = '<a style="color:' + txt_col_my + ';" href="/Club/Matches/MatchLineup.aspx?MatchID=' + gameid + '&TeamID=' + AwayTeamId + '">' + table.rows[0].cells[2].textContent +'</a>';
        }

		// color ratings
		var head = doc.getElementsByTagName("head")[0];
        var style = doc.createElement("style");
        style.setAttribute("type", "text/css");
		var zaw =
			'#aspnetForm[action*="Match.aspx?matchID="] div.mainBox td+td {'
			+'background:'+bg_col_hm+';border-bottom:1px solid '+border_color_hm+';border-collapse:separate;}'
			+'#aspnetForm[action*="Match.aspx?matchID="] div.mainBox td+td+td {'
			+'background:'+bg_col_aw+';border-bottom:1px solid '+border_color_aw+';border-collapse:separate;}'
			+'#aspnetForm[action*="Match.aspx?matchID="] div.mainBox td {padding-left:2px;}';
		style.appendChild(doc.createTextNode(zaw));
		//head.appendChild(style);
        //dump(zaw+'\n');
        
        var links = div.getElementsByTagName('a');
        var supporter = false;
        for (var i=0; i < links.length; i++) {
//            dump('i:' + i + ':' + links[i].href + ': '+ supporter + '\n' );
            if (links[i].href.search('Book') > 0) {
                supporter = true;
                break;
            }
        }

        var div_inner = Foxtrick.getElementsByClass('', div)[3];
        if (!supporter) div_inner = Foxtrick.getElementsByClass('', div)[2];
        // dump(' >'+ div_inner.innerHTML + ' < \n');
        var start = div_inner.innerHTML.indexOf('<br><br>');
        var end = div_inner.innerHTML.indexOf('<div class="separator">');

        var part = new Array('','','');
        part[0] = div_inner.innerHTML.substr(0, start);

        part[1] = div_inner.innerHTML.substr(start, end-start);
        var dummy = part[1].split('<br><br>');
        // Foxtrick.alert(dummy[1]);

        part[0] += '' + dummy[0] + '<br><br>' + dummy[1] + '<br>';
        part[1] = '';
        for (var i = 2; i< dummy.length; i++) {
            part[1] += dummy[i] + '<br><br>';
        }


        part[2] = div_inner.innerHTML.substr(end, div_inner.innerHTML.length-end );
        // dump('start[' + start + '|' + end + ']');
        // dump(part[1]);
        part[1] = this.nl2br(part[1]);

        var search = new Array(
//            /\=(\d+)/g,
            /\-(\d{1,3})/g,
            /\s(\d{1,3})/g,
            /(\s{5,})/g,
            /\<br \/\>br\<br \/\>br/g
            // /\<br\>(.{5,})\<br\>/i
            );
        var replace = new Array(
//            "=$1&formatted",
            "-<span class='ft_mR_format' style='font-weight:bold;color:black'>$1</span>",
            "<span class='ft_mR_format' style='font-weight:bold;color:black'> $1</span>",
            "br",
            "<br>\n"
            // "<div>$1</div>"
            );
        part[0] = part[0].replace(/(.{1,2})\-(.{1,2})\-(.{1,2})\ /g,"<span class='ft_mR_format' style='font-weight:bold;color:black'>$1</span>-<span class='ft_mR_format' style='font-weight:bold;color:black'>$2</span>-<span class='ft_mR_format' style='font-weight:bold;color:black'>$3</span> ");
        part[0] = part[0].replace(/(.{1,2})\-(.{1,2})\-(.{1,2})\-/g,"<span class='ft_mR_format' style='font-weight:bold;color:black'>$1</span>-<span class='ft_mR_format' style='font-weight:bold;color:black'>$2</span>-<span class='ft_mR_format' style='font-weight:bold;color:black'>$3</span>-");
        for (var i = 0; i<search.length; i++) {
            part[1] = part[1].replace(search[i],replace[i]);
        }

        dummy = (part[0] + part[1]).split('\n');

        part[1]= '';
        var stage = 0;
        var fulltext = 0;
        var marg = '';
        var bg = '';
        var padd = '';
        var next = 0;
        var player = false;
        for (var i=0; i<dummy.length;i++) {
            marg='margin-top:10px;'
            padd='padding:2px; border:' + borders_normal+ 'px solid ' + border_color + '; ';
            if (i%2 ==1) {bg = text_normal + '; ';} else {bg = text_normal + '; ';}
            dummy[i] =Foxtrick.trim(dummy[i]);
            if  (dummy[i] == '<br>') dummy[i] = '';
            if ( (!(dummy[i].indexOf('<br><br>')<0) && fulltext > 2) || (i > dummy.length-3)) {
                if (dummy[i].indexOf('/Players/')<0) bg = text_dark + '; ';
                marg = 'margin-top:10px; margin-bottom:30px; ';
                if (dummy[i].indexOf('/Players/')>0) marg = 'margin-top:30px; margin-bottom:10px; ';
            }
            dummy[i] = dummy[i].replace(/\<br\>/g, '');
            if (dummy[i] != '') {
                //dump(i + ' [' + dummy[i] + ']\n');
                if (dummy[i].split(' - ').length == 2 && stage == 0) { //headder
                    // dump('TEAMS FOUND\n');
                    var names = dummy[i].split(' - ');
                    var team1 = names[0].split('  ')[0];
                    var team2 = names[1].split('  ')[1];
                    stage = 1;
                    //dump('TEAMS [' + team1 + '|' + team2 + ']\n');
                }
                if (stage==1 && dummy[i].indexOf('<span>(')!=-1) {
                    // dump('MATCHID\n');
                    dummy[i] = dummy[i].replace(/\<span\>\(/,'<span> (');
                }
                if (dummy[i].indexOf('/Arena/') != -1) stage +=1;

                if (stage>1) { //full report
                    if (dummy[i].indexOf(team1) > -1 && !(dummy[i].indexOf('/Arena/') > -1)) {
                        fulltext++;
                        dummy[i] = dummy[i].replace(team1 + ' ', '<span style="font-weight:bold; color:'+ txt_col_hm +'">' + team1 + ' </span>');
                        dummy[i] = dummy[i].replace(' ' + team1, '<span style="font-weight:bold; color:'+ txt_col_hm +'"> ' + team1 + '</span>');
                        if (fulltext <= 2) bg= text_dark + '; ';
                    }
                    if (dummy[i].indexOf(team2) > -1 && !(dummy[i].indexOf('/Arena/') > -1)) {
                        fulltext++;
                        dummy[i] = dummy[i].replace(team2 + ' ', '<span style="font-weight:bold; color:'+ txt_col_aw +'">' + team2 + ' </span>');
                        dummy[i] = dummy[i].replace(' ' + team2, '<span style="font-weight:bold; color:'+ txt_col_aw +'"> ' + team2 + '</span>');
                        if (fulltext <= 2) {
                            bg= text_dark + '; ';
                            next = i+2;
                            //dump('>>>' + next + '\n');
                        }
                    }
                    if (next == i) marg = 'margin-top:10px; margin-bottom:40px; '

                    part[1] += '<div id="ft_mR_div_' + i + '" style="'+ marg+' background:' + bg + padd +'">' + dummy[i] + '</div>\n\n';
                }
                else part[1] += dummy[i] + '\n\n';
            }
            // else dump(i + ' DROPED ' + dummy[i] + ']\n');
        }
        div_inner.innerHTML = part[1] + part[2];

        var standing = new Array(0,0);
        var reg = /\ (\d{1,2})\-(\d{1,2})(.*?)/i;
        var divs = div.getElementsByTagName('div');
        for (var i=0; i < divs.length; i++) {
            // dump(i + ': ' + divs[i].textContent + '\n\n');
            var text = divs[i].textContent;
            var toreplace = /\ \-\ /g;
            text = text.replace(toreplace, '-');
            // dump(i + ': ' + text + '\n');
            var score = reg.exec(text);
            
            if (divs[i].innerHTML.search(team1) > -1) start_g = 6; else start_g = 7;
            if (score && i > start_g) {
                dump( i + '[' + score + '] [' + standing + ']\n');
                if (score[1] > standing[0]) {
                    standing[0]++;
                    divs[i].style.border = borders_goal+ 'px solid ' + border_color_hm;
                    // dump (borders_goal+ 'px solid ' + border_color_hm  + ';\n');
					divs[i].style.background = bg_col_hm;
                    // dump('A \n');
                }
                if (score[2] > standing[1]) {
                    standing[1]++;
                    divs[i].style.border = borders_goal+ 'px solid ' + border_color_aw;
                    // dump (borders_goal+ 'px solid ' + border_color_aw  + ';\n');
					divs[i].style.background = bg_col_aw;
                    // dump('B \n');
                }
            }

        }
        var headder = doc.getElementsByTagName('h1')[0];
        headder.setAttribute( 'style', 'color:black');
        headder.innerHTML = headder.innerHTML.replace(team1, '<span style="font-weight:bold; font-size:1em; color:'+ txt_col_hm +'">' + team1 + '</span>');
        headder.innerHTML = headder.innerHTML.replace(team2, '<span style="font-weight:bold; font-size:1em; color:'+ txt_col_aw +'">' + team2 + '</span>');
        
        var sidebar = doc.getElementById('sidebar');
        var links = sidebar.getElementsByTagName('a');
        for (var i=0; i < links.length; i++) {
//            dump('i:' + i + ':' + links[i].href + ': '+ supporter + '\n' );
            if (links[i].href.search('TeamID=' + HomeTeamId) > 0) {
                links[i].setAttribute('style', 'color:' + txt_col_hm);
            }
            if (links[i].href.search('TeamID=' + AwayTeamId) > 0) {
                links[i].setAttribute('style', 'color:' + txt_col_aw);
            }            
        }

    },

	change : function( page, doc ) {
        var div_check = Foxtrick.getElementsByClass('ft_mR_format', doc);
        if  (div_check.length > 0) return;
    },
    nl2br : function(text) {
        text = escape(text);
		var re_nlchar='';
        if(text.indexOf('%0D%0A') > -1){
            re_nlchar = /%0D%0A/g ;
        }else if(text.indexOf('%0A') > -1){
            re_nlchar = /%0A/g ;
        }else if(text.indexOf('%0D') > -1){
            re_nlchar = /%0D/g ;
        }
        return unescape( text.replace(re_nlchar,'<br />') );
    },

    _getPrefs : function( value ) {
        var dummy = '';

        if (Foxtrick.isModuleFeatureEnabled( this, this.OPTIONS[value])) {
            dummy = FoxtrickPrefs.getString("module." + this.MODULE_NAME + "." + this.OPTIONS[value] + '_text');
        }
        if (!dummy) dummy = this.OPTION_TEXTS_DEFAULT_VALUES[value];        
        // dump('Pref_[' + value + '] - [' + dummy + '] "' + this.OPTIONS[value] + '" returned\n');
        return dummy;
    },
};