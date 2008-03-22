function fillTransferSearchForm2(filter, doc) {
    
    try {
    
        // parse it
     
        var myDomParser = new DOMParser();
        
        var obj = myDomParser.parseFromString(filter, "text/xml");
        
        var root = obj.firstChild;
        
        for (var i=0; i<root.childNodes.length; i++) {
            var name = root.childNodes[i].childNodes[0].textContent;
            
            var value;
            if (root.childNodes[i].childNodes[1].childNodes.length >0) {
               value = root.childNodes[i].childNodes[1].textContent;               
            } else { value=""; }
            
            // set the value in form
            
            var el = findFormElement(name, doc);
            if (el != null) {
                if (el.type != "radio") {
                    el.value=value;
                }
            }
            
        }
   } catch (e) {
    alert (e);
   }
    
}


//---------------------------------------------------------------

function findFormElement(name, doc) {
    
    var els = doc.getElementsByName(name);
    if (els.length > 0) return els[0];
    
    var frames = doc.getElementsByTagName("frame");
    
    for (var i=0; i<frames.length; i++) {
        var el = findFormElement(name, frames[i].contentDocument);
        if (el != null) return el;
        
    }
    
    return null;
    
}

