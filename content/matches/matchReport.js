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
        var div_inner = getElementsByClass('', div)[2];
        // dump('>>>>>>>>>>>>>>>>>>>>' + div_inner.innerHTML + '<<<<<<<<<<<<<<<<<<');
        var start = div_inner.innerHTML.indexOf('<br><br>');
        var end = div_inner.innerHTML.indexOf('<div class="separator">');
        
        var part = new Array('','','');
        part[0] = div_inner.innerHTML.substr(0, start);
        part[1] = div_inner.innerHTML.substr(start, end-start);
        part[2] = div_inner.innerHTML.substr(end, div_inner.innerHTML.length-end );
        dump('start[' + start + '|' + end + ']');
        // dump(part[1]);
        part[1] = this.nl2br(part[1]);
        
        search = new Array(
            /\s(\d+)/g
            );
        replace = new Array(
            "<span style='font-weight:bold;color:red'>&nbsp;$1</span>"
            );
        for (var i = 0; i<search.length; i++) {
            part[1] = part[1].replace(search[i],replace[i]);
        }
        div_inner.innerHTML = part[0] + part[1] + part[2];
        // dump(part[1]);
        //Foxtrick.alert(part[1]);
        
        
        //dump(div.innerHTML);
        
		
		
    },

    change : function(url) {
        if (!doc.getElementById('ft_format')) return;
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