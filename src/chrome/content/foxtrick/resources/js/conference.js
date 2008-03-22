function toggleSignature(sigID) {
    
     try {
        
        var obj = document.getElementById('foxtrick-signature-'+sigID);
        
        if (obj.style.display == 'none') {
            obj.style.display = 'block';
        } else {
            obj.style.display = 'none';
        }
       
    } catch (e) {
        alert(e);
    }

    
}