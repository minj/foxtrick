function hideGraphs() {
    
    try {
        
        var obj = document.getElementById('foxtrick-graphs');
        obj.style.display='none';
        
        var showLink = document.getElementById('foxtrick-showgraphs');
        showLink.href = "javascript:showGraphs();";
       
    } catch (e) {
        alert(e);
    }
    
}

function showGraphs() {
    
    try {
        
        var obj = document.getElementById('foxtrick-graphs');
        obj.style.display='block';
        
        var showLink = document.getElementById('foxtrick-showgraphs');
        showLink.href = "javascript:hideGraphs();";        
       
    } catch (e) {
        alert(e);
    }
    
}