/**
 * forumpreview.js
 * Foxtrick forum search
 * @author spambot
 */

var FoxtrickForumSearch = {

    MODULE_NAME : "ForumSearch",
    MODULE_AUTHOR : "spambot",
    MODULE_CATEGORY : Foxtrick.moduleCategories.FORUM,
    DEFAULT_ENABLED : true,
	NEW_AFTER_VERSION: "0.4.8.2",	
	SCREENSHOT:"",
	PREF_SCREENSHOT:"",
	LASTEST_CHANGE:"Collects some search information",
	
    init : function() {
        Foxtrick.registerPageHandler( 'forum', this );
    },

    run : function( page, doc ) {
        try {
            dump('--- ForumSearch --- \n');
            var box = getElementsByClass('subMenuBox', doc)[0];
            var links = box.getElementsByTagName('a');
            
            var threadlist = FoxtrickPrefs.getList("forum_post_list");
            
            for (var i = 0; i < links.length; i++) {
                if (links[i].href.search(/\/Read\.aspx/) > -1) {
                    var title = links[i].textContent;
                    var postid = links[i].href.split('t=')[1].split('&')[0];
                    var thread_act = FoxtrickPrefs.getString("forum_post_list." + postid);
                    if (thread_act == null) {
                        FoxtrickPrefs.setString("forum_post_list." + postid, title);
                        // dump ( i + ' - ' + postid + ' | "' + title+ '" ADDED \n');
                    } else {
                        // dump ( i + ' - ' + postid + ' | "' + title+ '" DUPLICATE \n');
                    }
                }
            }
            if (!doc.getElementById('ft_searchBox')) {
                var boxId = 'ft_searchField';

                var new_div = doc.createElement('div');
                new_div.setAttribute('id', 'ft_searchBox');
                new_div.className = 'searchbox';
                new_div.setAttribute('style', 'width:225px; height:100px;overflow:auto;border:1px dotted gray;');
				
                var inputBox = doc.createElement('input');
				inputBox.setAttribute('type', 'text');
                inputBox.setAttribute('id', 'ft_searchField');
				inputBox.setAttribute('size', '20');
                inputBox.setAttribute('value', threadlist.length + ' Threads');
                inputBox.setAttribute('onfocus', 'setActiveTextBox("' + boxId + '", "viewActive", "xxx")');
                inputBox.setAttribute('onblur', 'setInactiveTextBox("' + boxId + '", "viewInactive", "xxx")');
                inputBox.setAttribute('onsubmit', 'return false;');
                  new_div.appendChild(inputBox);
                
                var button = doc.createElement( "input" );
				button.setAttribute('value', 'OK');
                button.msg = 'search';
				button.setAttribute('type', 'button');
                button.addEventListener( "click", FoxtrickForumSearch._search_type, false );
                new_div.appendChild(button);
                
                box.appendChild(new_div);
            }
        }
        catch(e) {
            dump('n' + 'FoxtrickForumSearch' + e + '\n');
        }
    },

	change : function( page, doc ) {
        var value = doc.getElementById('ft_searchField').value;
        if (value.search('Threads') != -1) {
            dump('Search running '  + '\n');
            this.run(page, doc);
        }
	},
    
	_search_type : function(e){
        var doc = e.target.ownerDocument;
        
        var searchlinks = doc.getElementById('ft_searchLinks');
        if (searchlinks) {
            searchlinks.parentNode.removeChild(searchlinks);
        }
        var div = doc.getElementById('ft_searchBox')
        var table = doc.createElement("table");
        table.setAttribute("id", "ft_searchLinks");
        table.setAttribute("width", "100%");
        table.setAttribute("border", "0");
        table.setAttribute("cell-padding", "3");        
        div.appendChild(table);
            
        var searchfor = doc.getElementById('ft_searchField').value.toLowerCase();
		dump('searchfor: ' + searchfor + '\n');
        var threadlist = FoxtrickPrefs.getList("forum_post_list");
        var IDlist = FoxtrickPrefs._getElemNames("forum_post_list");
        for (var i = 0; i < threadlist.length; i++) {
             
            var results = new Array();
            
            for (var i=0; i< threadlist.length; i++) {
            	if (threadlist[i].toLowerCase().search(searchfor) > -1) {
            		results.push (threadlist[i]);
                    try {
                        var table = doc.getElementById("ft_searchLinks");
                        if (table) {
                            var tr = doc.createElement("tr");
                            tr.setAttribute("id", "result_" + i);
                            var td_fname = doc.createElement("td");
                            td_fname.style.width= "99%";
                            td_fname.setAttribute('style', 'border:1px dotted #dddddd;');
                            
                            
                            table.appendChild(tr);
                            tr.appendChild(td_fname);
                            
                            
                            var link = doc.createElement("a");
                            
                            link.href = "/Forum/Read.aspx?t=" + IDlist[i].replace(/forum\_post\_list\./, '') + "&v=1&n=1";
                            link.innerHTML = threadlist[i];
                            td_fname.appendChild(link);
                        }                    
                    } catch(ee) {
                        dump('SearchError: ' + ee + '\n');
                    }
                                        
                    
                    // dump(threadlist[i] + '\n');
            	}
            }
            // dump('>>> ' + threadlist + ' <<< \n');
            dump( '[' + results.length + ']\n');
            if (results.length == 0 ) {
                var table = doc.getElementById("ft_searchLinks");
                if (table) {
                    var tr = doc.createElement("tr");
                    tr.setAttribute("id", "result_" + 0);
                    var td_fname = doc.createElement("td");
                    td_fname.style.width= "99%";
                    td_fname.setAttribute('style', 'border:1px dotted #ffeeee;');

                    table.appendChild(tr);
                    tr.appendChild(td_fname);
                    var content = doc.createElement("textNode");
                    
                    content.innerHTML = '(n/a)';
                    td_fname.appendChild(content);
                }                    
            
            }
        }
        return false;
	}
};