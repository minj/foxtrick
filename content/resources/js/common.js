 function addEvent(elm, evType, fn, useCapture)
// addEvent and removeEvent
// cross-browser event handling for IE5+,  NS6 and Mozilla
// By Scott Andrew
{
	if (elm.addEventListener){
	    elm.addEventListener(evType, fn, useCapture);
	    return true;
	} else if (elm.attachEvent){
		var r = elm.attachEvent("on"+evType, fn);
	    return r;
	} else {
	    alert("Handler could not be removed");
	}
} 
	
/**
 * Sets the correct value to a counter field
 * @param field The field
 * @param countfield The count field
 * @param maxlimit maximum chars in field
 */
function textCounter(field, countfield, maxlimit) {
    var text = field.value.replace(/[\r]/g, "").length;
    var text2 = field.value.replace(/[\r\n]/g, "").length; // Count without \n\r
    var diff = text - text2;
    
    countfield.value = maxlimit - (text2 + diff*2);
}
	
/**
 * Returns an element from the document
 * @param psID element ID
 */
function getElement(psID) { 
   if(document.all) { 
      return document.all[psID]; 
   } else if(document.getElementById) { 
      return document.getElementById(psID); 
   } else { 
      for (iLayer = 1; iLayer < document.layers.length; iLayer++) { 
         if(document.layers[iLayer].id == psID) 
            return document.layers[iLayer]; 
      }       
   } 
   return null; 
}

/**
* Prevent HTML input in textboxes.
*/
function validateInput(TextBoxID) {
  var TextBox = getElement(TextBoxID).value;
  if(TextBox.indexOf("<") == -1 || TextBox.indexOf(">") == -1) {
    return true;
  } else {
    alert("NO HTML TAGS!!");
    return false;
  }
}

/**
* Prevent HTML input in textboxes (this version with the error message passed as a variable for langification.
*/
function validateInputNew(TextBoxID, ErrorMessage) {
    var TextBox = getElement(TextBoxID).value;
    if (TextBox.indexOf("<") == -1 || TextBox.indexOf(">") == -1) {
        return true;
    } else {
        alert(ErrorMessage);
        return false;
    }
}

/**
 * Toggles show/hide for an object with it objID.
 */
function showHide(objId) {

    // (document.all) ? document.all[objId] : 
   var obj = document.getElementById(objId);
   
   if( obj.style.display == 'block' ){
     obj.style.display = 'none';
   }
   else if( obj.style.display == 'none' ){
     obj.style.display = 'block';
  }
}

/**
 * Toggles show/hide for an object with it objID
 */
function toggleShowHide(objId,show)
{ 
   var obj = (document.all) ? document.all[objId] : document.getElementById(objId);
   
   if( show == 0 ){
     obj.style.display = 'none';
   }
   else if( show == 1 ){
     obj.style.display = 'block';
  }
}

function openPage(openURL){
	top.frames["main"].location.href=openURL;
}

/**
 * Performs a sarissa ajax GET request and returns the response as XML.
 */
function performXMLRequest(url, fn) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", url, true);
   	xmlhttp.onreadystatechange = function() {
    	if (xmlhttp.readyState == 4) {
     		 fn(xmlhttp.responseXML);
   	  	}
   	};
	xmlhttp.send(null);
}
/**
 * Performs a sarissa ajax GET request and returns the response as text.
 */
function performTextRequest(url, fn) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", url, true);
   	xmlhttp.onreadystatechange = function() {
    	if (xmlhttp.readyState == 4) {
     		 fn(xmlhttp.responseText);
   	  	}
   	};
	xmlhttp.send(null);
}
function isXMLHTTPCompatible(){
	return Sarissa.IS_ENABLED_XMLHTTP;
}

function confirmSubmit(message) 
{
    var MyResult;

    //Your code here, before validation

    if (typeof(Page_ClientValidate) == 'function') {
        Page_ClientValidate();
        MyResult = Page_IsValid;
    }
    else {
        MyResult = true;
    }

    //More of your code here, after validation

    if (MyResult != false) {
        MyResult = confirm(message);
    }

    return MyResult;
}

function resizeImage(which, maxWidth) {
    var elem = document.getElementById(which);

    if (elem == undefined || elem == null) return false;
    var orig_width = elem.width;
    var orig_height = elem.height;

    if (maxWidth == undefined) maxWidth = 150;
    if (elem.width > elem.height) {
        if (elem.width > maxWidth) { elem.width = maxWidth; elem.height = orig_height * (maxWidth / orig_width); }
    } else {
        if (elem.height > maxWidth) { elem.height = maxWidth; elem.width = orig_width * (maxWidth / orig_height); };
    }
    return true;
}

function resizeImage(which, whichdiv, maxWidth, maxHeight) {
    var elem = document.getElementById(which);
    var elemdiv = document.getElementById(whichdiv);

    if (elem == undefined || elem == null) return false;
    var newWidth;
    var newHeight;
    var l2;

    if (elem.width < maxWidth && elem.height < maxHeight) {
        newHeight = elem.height;
        newWidth = elem.width;
    }
    else {
        if (maxWidth == undefined) maxWidth = 150;
        if (maxHeight == undefined) maxHeight = 150;

        if ((elem.width / maxWidth) > (elem.width / maxHeight)) {
            l2 = elem.width;
            newWidth = maxWidth;
            newHeight = elem.height * (maxWidth / l2);
            if (newHeight > maxHeight) {
                newWidth = newWidth * (maxHeight / newHeight);
                newHeight = maxHeight;
            }
        }
        else {
            l2 = elem.height;
            newHeight = maxHeight;
            newWidth = elem.width * (maxHeight / l2)

            if (newWidth > maxWidth) {
                newHeight = newHeight * (maxWidth / newWidth);
                newWidth = maxWidth;
            }
        }
    }
    elem.height = newHeight;
    elemdiv.setAttribute('style', 'height:' + newHeight + 'px;');
    elem.width = newWidth;
    return true;
}

function checkBrowserAjaxSupport() {
    var xmlHttp;
    try {
        // Firefox, Opera 8.0+, Safari
        xmlHttp = new XMLHttpRequest();
    }
    catch (e) {
        // Internet Explorer
        try {
            xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e) {
            try {
                xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch (e) {
                return false;
            }
        }
    }
    return true;
}

function isIE6(){
    return false/*@cc_on || @_jscript_version < 5.7@*/;
}