// number formatter
// http://www.sitepoint.com/forums/showthread.php?t=129182

String.prototype.group = function( chr, size )
{
	if ( typeof chr == 'undefined' ) chr = ",";
	if ( typeof size == 'undefined' ) size = 3;
	return this.split( '' ).reverse().join( '' ).replace( new RegExp( "(.{" + size + "})(?!$)", "g" ), "$1" + chr ).split( '' ).reverse().join( '' );
}


function tlconfirm(mesg, tlwarning) {
    
     var f = document.forms[1];
     var price = f.elements['startbid'].value;
     price = price.group( ".");
     mesg = mesg.replace("%s", price);
   	 var positionId=f.elements['transferListID'].value;
	 if(!positionId) {	
	 	alert(tlwarning);
	  	return false;
	}
	
	var positionText=f.elements['transferListID'].options[positionId].text;
	mesg = mesg.replace("%p", positionText);
	
     if (confirm(mesg)) {
        // TL him
        return true;
     } else {
        return false;
     }

}
