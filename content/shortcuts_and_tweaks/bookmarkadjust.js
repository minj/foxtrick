/**
 * bookmarkadjust.js
 * Colors bookmark icon extracting code from bookmark comment
 * @author taised
 */
////////////////////////////////////////////////////////////////////////////////
var BookmarkAdjust = {

    MODULE_NAME : "BookmarkAdjust",
    MODULE_CATEGORY : Foxtrick.moduleCategories.SHORTCUTS_AND_TWEAKS,
    DEFAULT_ENABLED : true,
    
    init : function() {
        Foxtrick.registerPageHandler( 'bookmarks',
                                      BookmarkAdjust );
    },

    run : function( page, doc ) {
        
        var tableObj = doc.getElementById('ctl00_CPMain_repB').childNodes[1];
        for (var i=0; i<tableObj.rows.length; i++) {
            //If there aren't 4 cells on the row is a separator row
            if (tableObj.rows[i].cells.length==4) {
            	 //if the first cell has 6 childs the row has comments, last one is comment
                if (tableObj.rows[i].cells[0].childNodes.length>5) {
                     var commentObj=tableObj.rows[i].cells[0].lastChild;
                     if (commentObj.className=='italic')
                     {
                         var imageObj=tableObj.rows[i].cells[2].childNodes[1];
                         BookmarkAdjust._bookmarkColor(imageObj, /\[aqua\]/i,       commentObj, "aqua");
                         BookmarkAdjust._bookmarkColor(imageObj, /\[B\]/i,          commentObj, "B");
                         BookmarkAdjust._bookmarkColor(imageObj, /\[black\]/i,      commentObj, "black");
                         BookmarkAdjust._bookmarkColor(imageObj, /\[blue\]/i,       commentObj, "blue");
                         BookmarkAdjust._bookmarkColor(imageObj, /\[brown\]/i,      commentObj, "brown");
                         BookmarkAdjust._bookmarkColor(imageObj, /\[cyan\]/i,       commentObj, "cyan");
                         BookmarkAdjust._bookmarkColor(imageObj, /\[darkpurple\]/i, commentObj, "darkpurple");
                         BookmarkAdjust._bookmarkColor(imageObj, /\[green\]/i,      commentObj, "green");
                         BookmarkAdjust._bookmarkColor(imageObj, /\[idea\]/i,       commentObj, "idea");
                         BookmarkAdjust._bookmarkColor(imageObj, /\[lightblue\]/i,  commentObj, "lightblue");
                         BookmarkAdjust._bookmarkColor(imageObj, /\[lightgreen\]/i, commentObj, "lightgreen");
                         BookmarkAdjust._bookmarkColor(imageObj, /\[orange\]/i,     commentObj, "orange");
                         BookmarkAdjust._bookmarkColor(imageObj, /\[pink\]/i,       commentObj, "pink");
                         BookmarkAdjust._bookmarkColor(imageObj, /\[purple\]/i,     commentObj, "purple");
                         BookmarkAdjust._bookmarkColor(imageObj, /\[red\]/i,        commentObj, "red");
                         BookmarkAdjust._bookmarkColor(imageObj, /\[white\]/i,      commentObj, "white");
                         BookmarkAdjust._bookmarkColor(imageObj, /\[yellow\]/i,     commentObj, "yellow");
                    }
                }
            }
        }
        
    },

    _bookmarkColor : function( imageObj, regexp, commentObj, color ) {
        if (commentObj.firstChild.nodeValue.search(regexp) > -1) {
           //imageObj.style.backgroundImage = "url(chrome://foxtrick/content/resources/notes/" + color + ".png)";
           imageObj.style.background = "transparent url(chrome://foxtrick/content/resources/notes/" + color + ".png) no-repeat scroll 0 0";
           commentObj.firstChild.nodeValue = commentObj.firstChild.nodeValue.replace(regexp, "");          
        }
    }
};

