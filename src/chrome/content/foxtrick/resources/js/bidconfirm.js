// number formatter
// http://www.sitepoint.com/forums/showthread.php?t=129182

String.prototype.group = function( chr, size )
{
	if ( typeof chr == 'undefined' ) chr = ",";
	if ( typeof size == 'undefined' ) size = 3;
	return this.split( '' ).reverse().join( '' ).replace( new RegExp( "(.{" + size + "})(?!$)", "g" ), "$1" + chr ).split( '' ).reverse().join( '' );
}


function bidconfirm(mesg) {
    
     var f = document.forms[0];
     var price = f.elements["ctl00$ctl00$CM$CIR$ucBidAndSell$txtBid"].value;
     price = price.group( ".");
     mesg = mesg.replace("%s", price);
            
     if (confirm(mesg)) {
        // OK then :)
        return true;
     } else {
        return false;
     }

}
