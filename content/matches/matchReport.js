/**
 * Formates the match report.
 *  * @author spambot
 */

FoxtrickMatchReportFormat = {
	MODULE_NAME : "MatchReportFormat",
	MODULE_CATEGORY : Foxtrick.moduleCategories.MATCHES,
	DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8.2",
	LASTEST_CHANGE:"some format of match report for better reading",
	//OPTIONS : new Array("DefaultShow"), 
	
	init : function() {
        Foxtrick.registerPageHandler( "match", this );
    },
    
    run : function( page, doc ) {
        
		var isarchivedmatch = (doc.getElementById("ctl00_CPMain_lblMatchInfo")==null);
		if (!isarchivedmatch) return;
        
        var div = doc.getElementById('mainBody');
        var div_check = getElementsByClass('ft_mR_format', div);
        if  (div_check.length > 0) return;

        var links = div.getElementsByTagName('a');
        var supporter = false;
        for (i=0; i < links.length; i++) {
//            dump('i:' + i + ':' + links[i].href + ': '+ supporter + '\n' );
            if (links[i].href.search('Book') > 0) {
                supporter = true;
                break;
            }
        }

        var div_inner = getElementsByClass('', div)[2];
        if (!supporter) div_inner = getElementsByClass('', div)[1];
        // dump(' >'+ div_inner.innerHTML + ' < \n');
        var start = div_inner.innerHTML.indexOf('<br><br>');
        var end = div_inner.innerHTML.indexOf('<div class="separator">');
        
        var part = new Array('','','');
        part[0] = div_inner.innerHTML.substr(0, start);
        
        part[1] = div_inner.innerHTML.substr(start, end-start);
        var dummy = part[1].split('<br><br>');
        // Foxtrick.alert(dummy[1]);
        
        part[0] += '' + dummy[0] + '<br><br>' + dummy[1] + '<br>';
        part[1] = dummy[2] + '<br><br>' + dummy[3] + '<br><br>' + dummy[4] ;
        
        part[2] = div_inner.innerHTML.substr(end, div_inner.innerHTML.length-end );
        // dump('start[' + start + '|' + end + ']');
        // dump(part[1]);
        part[1] = this.nl2br(part[1]);
        
        search = new Array(
            /\=(\d+)/g,
            /\-(\d{1,3})/g,
            /\s(\d{1,3})/g,
            /(\s{5,})/g,
            /\<br \/\>br\<br \/\>br/g
            // /\<br\>(.{5,})\<br\>/i
            );
        replace = new Array(
            "=$1&formatted",
            "-<span class='ft_mR_format' style='font-weight:bold;color:black'>$1</span>",
            "<span class='ft_mR_format' style='font-weight:bold;color:black'>&nbsp;$1</span>",
            "br",
            "<br>\n"
            // "<div>$1</div>"
            );
        part[0] = part[0].replace(/(.{1,2})\-(.{1,2})\-(.{1,2})\ /g,"<span class='ft_mR_format' style='font-weight:bold;color:black'>$1</span>-<span class='ft_mR_format' style='font-weight:bold;color:black'>$2</span>-<span class='ft_mR_format' style='font-weight:bold;color:black'>$3</span> ");
        part[0] = part[0].replace(/(.{1,2})\-(.{1,2})\-(.{1,2})\-/g,"<span class='ft_mR_format' style='font-weight:bold;color:black'>$1</span>-<span class='ft_mR_format' style='font-weight:bold;color:black'>$2</span>-<span class='ft_mR_format' style='font-weight:bold;color:black'>$3</span> ");
        for (var i = 0; i<search.length; i++) {
            part[1] = part[1].replace(search[i],replace[i]);
        }
        
        dummy = part[1].split('\n');
        part[1]= '';
        for (i=0; i<dummy.length;i++) {
            if (i%2 ==1) {var bg='#f0f0f0';} else {var bg='#f8f8f8';}
            if (Foxtrick.trim(dummy[i]) == '<br>') dummy[i] = '';
            if (!(dummy[i].indexOf('<br><br>')<0)) var bg='#ddd';
            dummy[i] = dummy[i].replace(/\<br\>/g, '');
            part[1] += '<div style="border:0px solid blue;margin-top:5px; background:' +bg+ ';">' + dummy[i] + '</div>';
        }
        
        
        div_inner.innerHTML = part[0] + part[1] + part[2];
        // dump(part[1]);
        //Foxtrick.alert(part[1]);
        //dump(div.innerHTML);
    },

	change : function( page, doc ) {
        var div_check = getElementsByClass('ft_mR_format', doc);
        if  (div_check.length > 0) return;
    },
    nl2br : function(text) {
        text = escape(text);
        if(text.indexOf('%0D%0A') > -1){
            re_nlchar = /%0D%0A/g ;
        }else if(text.indexOf('%0A') > -1){
            re_nlchar = /%0A/g ;
        }else if(text.indexOf('%0D') > -1){
            re_nlchar = /%0D/g ;
        }
        return unescape( text.replace(re_nlchar,'<br />') );
    },    
    
};