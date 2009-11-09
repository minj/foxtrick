function gotoElmentID(elementID) {
    if (elementID === '') {
        
    } else {
        var element = document.getElementById(elementID);
        scroll(0, 0);
        window.scrollBy(0, element.offsetTop);
    }
}

function gotoEvent(elementID) {
    if (elementID === '') {
        
    } else {
        var element = getElementsByClass('ft_mR_format');
        for (var i = 0; i < element.length; i++){
            if (element[i].textContent.search(' '+elementID) > -1) {
                scroll(0, 0);
                window.scrollBy(0, element[i].parentNode.offsetTop);
                break;
            }
        }
    }
}

function getElementsByClass(searchClass,node,tag) {
	try {
        var classElements = new Array();
        if ( node == null )
            node = document;
        if ( tag == null )
            tag = '*';
        var els = node.getElementsByTagName(tag);
        var elsLen = els.length;
        var pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)");
        for (i = 0, j = 0; i < elsLen; i++) {
            if ( pattern.test(els[i].className) ) {
                classElements[j] = els[i];
                j++;
            }
        }
        return classElements;
    }
    catch(e) {
        alert(e);
    }
}