// ================================================================
//  jkl-parsexml.js ---- JavaScript Kantan Library for Parsing XML
//  Copyright 2005-2007 Kawasaki Yusuke <u-suke@kawa.net>
//  http://www.kawa.net/works/js/jkl/parsexml.html
// ================================================================
//  v0.01  2005/05/18  first release
//  v0.02  2005/05/20  Opera 8.0beta may be abailable but somtimes crashed
//  v0.03  2005/05/20  overrideMimeType( "text/xml" );
//  v0.04  2005/05/21  class variables: REQUEST_TYPE, RESPONSE_TYPE
//  v0.05  2005/05/22  use Msxml2.DOMDocument.5.0 for GET method on IE6
//  v0.06  2005/05/22  CDATA_SECTION_NODE
//  v0.07  2005/05/23  use Microsoft.XMLDOM for GET method on IE6
//  v0.10  2005/10/11  new function: JKL.ParseXML.HTTP.responseText()
//  v0.11  2005/10/13  new sub class: JKL.ParseXML.Text, JSON and DOM.
//  v0.12  2005/10/14  new sub class: JKL.ParseXML.CSV and CSVmap.
//  v0.13  2005/10/28  bug fixed: TEXT_NODE regexp for white spaces
//  v0.14  2005/11/06  bug fixed: TEXT_NODE regexp at Safari
//  v0.15  2005/11/08  bug fixed: JKL.ParseXML.CSV.async() method
//  v0.16  2005/11/15  new sub class: LoadVars, and UTF-8 text on Safari
//  v0.18  2005/11/16  improve: UTF-8 text file on Safari
//  v0.19  2006/02/03  use XMLHTTPRequest instead of ActiveX on IE7,iCab
//  v0.20  2006/03/22  (skipped)
//  v0.21  2006/11/30  use ActiveX again on IE7
//  v0.22  2007/01/04  JKL.ParseXML.JSON.parseResponse() updated
// ================================================================

if ( typeof(JKL) == 'undefined' ) JKL = function() {};

// ================================================================
//  class: JKL.ParseXML 

JKL.ParseXML = function ( url, query, method ) {
    // debug.print( "new JKL.ParseXML( '"+url+"', '"+query+"', '"+method+"' );" );
    this.http = new JKL.ParseXML.HTTP( url, query, method, false );
    return this;
};

// ================================================================
//  class variables

JKL.ParseXML.VERSION = "0.22";
JKL.ParseXML.MIME_TYPE_XML  = "text/xml";
JKL.ParseXML.MAP_NODETYPE = [
    "",
    "ELEMENT_NODE",                 // 1
    "ATTRIBUTE_NODE",               // 2
    "TEXT_NODE",                    // 3
    "CDATA_SECTION_NODE",           // 4
    "ENTITY_REFERENCE_NODE",        // 5
    "ENTITY_NODE",                  // 6
    "PROCESSING_INSTRUCTION_NODE",  // 7
    "COMMENT_NODE",                 // 8
    "DOCUMENT_NODE",                // 9
    "DOCUMENT_TYPE_NODE",           // 10
    "DOCUMENT_FRAGMENT_NODE",       // 11
    "NOTATION_NODE"                 // 12
];

// ================================================================
//  define callback function (ajax)

JKL.ParseXML.prototype.async = function ( func, args ) {
    this.callback_func = func;      // callback function
    this.callback_arg  = args;      // first argument
};

JKL.ParseXML.prototype.onerror = function ( func, args ) {
    this.onerror_func = func;       // callback function
};

// ================================================================
//  method: parse()
//  return: parsed object
//  Download a file from remote server and parse it.

JKL.ParseXML.prototype.parse = function () {
    if ( ! this.http ) return;

    // set onerror call back 
    if ( this.onerror_func ) {
        this.http.onerror( this.onerror_func );
    }

    if ( this.callback_func ) {                             // async mode
        var copy = this;
        var proc = function() {
            if ( ! copy.http ) return;
            var data = copy.parseResponse();
            copy.callback_func( data, copy.callback_arg );  // call back
        };
        this.http.async( proc );
    }

    this.http.load();

    if ( ! this.callback_func ) {                           // sync mode
        var data = this.parseResponse();
        return data;
    }
};

// ================================================================
//  every child/children into array
JKL.ParseXML.prototype.setOutputArrayAll = function () {
    this.setOutputArray( true );
}
//  a child into scalar, children into array
JKL.ParseXML.prototype.setOutputArrayAuto = function () {
    this.setOutputArray( null );
}
//  every child/children into scalar (first sibiling only)
JKL.ParseXML.prototype.setOutputArrayNever = function () {
    this.setOutputArray( false );
}
//  specified child/children into array, other child/children into scalar
JKL.ParseXML.prototype.setOutputArrayElements = function ( list ) {
    this.setOutputArray( list );
}
//  specify how to treate child/children into scalar/array
JKL.ParseXML.prototype.setOutputArray = function ( mode ) {
    if ( typeof(mode) == "string" ) {
        mode = [ mode ];                // string into array
    }
    if ( mode && typeof(mode) == "object" ) {
        if ( mode.length < 0 ) {
            mode = false;               // false when array == [] 
        } else {
            var hash = {};
            for( var i=0; i<mode.length; i++ ) {
                hash[mode[i]] = true;
            }
            mode = hash;                // array into hashed array
            if ( mode["*"] ) {
                mode = true;            // true when includes "*"
            }
        } 
    } 
    this.usearray = mode;
}

// ================================================================
//  method: parseResponse()

JKL.ParseXML.prototype.parseResponse = function () {
    var root = this.http.documentElement();
    var data = this.parseDocument( root );
    return data;
}

// ================================================================
//  convert from DOM root node to JavaScript Object 
//  method: parseElement( rootElement )

JKL.ParseXML.prototype.parseDocument = function ( root ) {
    // debug.print( "parseDocument: "+root );
    if ( ! root ) return;

    var ret = this.parseElement( root );            // parse root node
    // debug.print( "parsed: "+ret );

    if ( this.usearray == true ) {                  // always into array
        ret = [ ret ];
    } else if ( this.usearray == false ) {          // always into scalar
        //
    } else if ( this.usearray == null ) {           // automatic
        //
    } else if ( this.usearray[root.nodeName] ) {    // specified tag
        ret = [ ret ];
    }

    var json = {};
    json[root.nodeName] = ret;                      // root nodeName
    return json;
};

// ================================================================
//  convert from DOM Element to JavaScript Object 
//  method: parseElement( element )

JKL.ParseXML.prototype.parseElement = function ( elem ) {
    // debug.print( "nodeType: "+JKL.ParseXML.MAP_NODETYPE[elem.nodeType]+" <"+elem.nodeName+">" );

    //  COMMENT_NODE

    if ( elem.nodeType == 7 ) {
        return;
    }

    //  TEXT_NODE CDATA_SECTION_NODE

    if ( elem.nodeType == 3 || elem.nodeType == 4 ) {
        // var bool = elem.nodeValue.match( /[^\u0000-\u0020]/ );
        var bool = elem.nodeValue.match( /[^\x00-\x20]/ ); // for Safari
        if ( bool == null ) return;     // ignore white spaces
        // debug.print( "TEXT_NODE: "+elem.nodeValue.length+ " "+bool );
        return elem.nodeValue;
    }

    var retval;
    var cnt = {};

    //  parse attributes

    if ( elem.attributes && elem.attributes.length ) {
        retval = {};
        for ( var i=0; i<elem.attributes.length; i++ ) {
            var key = elem.attributes[i].nodeName;
            if ( typeof(key) != "string" ) continue;
            var val = elem.attributes[i].nodeValue;
            if ( ! val ) continue;
            if ( typeof(cnt[key]) == "undefined" ) cnt[key] = 0;
            cnt[key] ++;
            this.addNode( retval, key, cnt[key], val );
        }
    }

    //  parse child nodes (recursive)

    if ( elem.childNodes && elem.childNodes.length ) {
        var textonly = true;
        if ( retval ) textonly = false;        // some attributes exists
        for ( var i=0; i<elem.childNodes.length && textonly; i++ ) {
            var ntype = elem.childNodes[i].nodeType;
            if ( ntype == 3 || ntype == 4 ) continue;
            textonly = false;
        }
        if ( textonly ) {
            if ( ! retval ) retval = "";
            for ( var i=0; i<elem.childNodes.length; i++ ) {
                retval += elem.childNodes[i].nodeValue;
            }
        } else {
            if ( ! retval ) retval = {};
            for ( var i=0; i<elem.childNodes.length; i++ ) {
                var key = elem.childNodes[i].nodeName;
                if ( typeof(key) != "string" ) continue;
                var val = this.parseElement( elem.childNodes[i] );
                if ( ! val ) continue;
                if ( typeof(cnt[key]) == "undefined" ) cnt[key] = 0;
                cnt[key] ++;
                this.addNode( retval, key, cnt[key], val );
            }
        }
    }
    return retval;
};

// ================================================================
//  method: addNode( hash, key, count, value )

JKL.ParseXML.prototype.addNode = function ( hash, key, cnts, val ) {
    if ( this.usearray == true ) {              // into array
        if ( cnts == 1 ) hash[key] = [];
        hash[key][hash[key].length] = val;      // push
    } else if ( this.usearray == false ) {      // into scalar
        if ( cnts == 1 ) hash[key] = val;       // only 1st sibling
    } else if ( this.usearray == null ) {
        if ( cnts == 1 ) {                      // 1st sibling
            hash[key] = val;
        } else if ( cnts == 2 ) {               // 2nd sibling
            hash[key] = [ hash[key], val ];
        } else {                                // 3rd sibling and more
            hash[key][hash[key].length] = val;
        }
    } else if ( this.usearray[key] ) {
        if ( cnts == 1 ) hash[key] = [];
        hash[key][hash[key].length] = val;      // push
    } else {
        if ( cnts == 1 ) hash[key] = val;       // only 1st sibling
    }
};

// ================================================================
//  class: JKL.ParseXML.Text 

JKL.ParseXML.Text = function ( url, query, method ) {
    // debug.print( "new JKL.ParseXML.Text( '"+url+"', '"+query+"', '"+method+"' );" );
    this.http = new JKL.ParseXML.HTTP( url, query, method, true );
    return this;
};

JKL.ParseXML.Text.prototype.parse = JKL.ParseXML.prototype.parse;
JKL.ParseXML.Text.prototype.async = JKL.ParseXML.prototype.async;
JKL.ParseXML.Text.prototype.onerror = JKL.ParseXML.prototype.onerror;

JKL.ParseXML.Text.prototype.parseResponse = function () {
    var data = this.http.responseText();
    return data;
}

// ================================================================
//  class: JKL.ParseXML.JSON

JKL.ParseXML.JSON = function ( url, query, method ) {
    // debug.print( "new JKL.ParseXML.JSON( '"+url+"', '"+query+"', '"+method+"' );" );
    this.http = new JKL.ParseXML.HTTP( url, query, method, true );
    return this;
};

JKL.ParseXML.JSON.prototype.parse = JKL.ParseXML.prototype.parse;
JKL.ParseXML.JSON.prototype.async = JKL.ParseXML.prototype.async;
JKL.ParseXML.JSON.prototype.onerror = JKL.ParseXML.prototype.onerror;

JKL.ParseXML.JSON.prototype.parseResponse = function () {
    var text = this.http.responseText();
    // http://www.antimon2.atnifty.com/2007/01/jklparsexmljson.html
    if ( typeof(text) == 'undefined' ) return;
    if ( ! text.length ) return;
    var data = eval( "("+text+")" );
    return data;
}

// ================================================================
//  class: JKL.ParseXML.DOM

JKL.ParseXML.DOM = function ( url, query, method ) {
    // debug.print( "new JKL.ParseXML.DOM( '"+url+"', '"+query+"', '"+method+"' );" );
    this.http = new JKL.ParseXML.HTTP( url, query, method, false );
    return this;
};

JKL.ParseXML.DOM.prototype.parse = JKL.ParseXML.prototype.parse;
JKL.ParseXML.DOM.prototype.async = JKL.ParseXML.prototype.async;
JKL.ParseXML.DOM.prototype.onerror = JKL.ParseXML.prototype.onerror;

JKL.ParseXML.DOM.prototype.parseResponse = function () {
    var data = this.http.documentElement();
    return data;
}

// ================================================================
//  class: JKL.ParseXML.CSV

JKL.ParseXML.CSV = function ( url, query, method ) {
    // debug.print( "new JKL.ParseXML.CSV( '"+url+"', '"+query+"', '"+method+"' );" );
    this.http = new JKL.ParseXML.HTTP( url, query, method, true );
    return this;
};

JKL.ParseXML.CSV.prototype.parse = JKL.ParseXML.prototype.parse;
JKL.ParseXML.CSV.prototype.async = JKL.ParseXML.prototype.async;
JKL.ParseXML.CSV.prototype.onerror = JKL.ParseXML.prototype.onerror;

JKL.ParseXML.CSV.prototype.parseResponse = function () {
    var text = this.http.responseText();
    var data = this.parseCSV( text );
    return data;
}

JKL.ParseXML.CSV.prototype.parseCSV = function ( text ) {
    text = text.replace( /\r\n?/g, "\n" );              // new line character
    var pos = 0;
    var len = text.length;
    var table = [];
    while( pos<len ) {
        var line = [];
        while( pos<len ) {
            if ( text.charAt(pos) == '"' ) {            // "..." quoted column
                var nextquote = text.indexOf( '"', pos+1 );
                while ( nextquote<len && nextquote > -1 ) {
                    if ( text.charAt(nextquote+1) != '"' ) {
                        break;                          // end of column
                    }
                    nextquote = text.indexOf( '"', nextquote+2 );
                }
                if ( nextquote < 0 ) {
                    // unclosed quote
                } else if ( text.charAt(nextquote+1) == "," ) { // end of column
                    var quoted = text.substr( pos+1, nextquote-pos-1 );
                    quoted = quoted.replace(/""/g,'"');
                    line[line.length] = quoted;
                    pos = nextquote+2;
                    continue;
                } else if ( text.charAt(nextquote+1) == "\n" || // end of line
                            len==nextquote+1 ) {                // end of file
                    var quoted = text.substr( pos+1, nextquote-pos-1 );
                    quoted = quoted.replace(/""/g,'"');
                    line[line.length] = quoted;
                    pos = nextquote+2;
                    break;
                } else {
                    // invalid column
                }
            }
            var nextcomma = text.indexOf( ",", pos );
            var nextnline = text.indexOf( "\n", pos );
            if ( nextnline < 0 ) nextnline = len;
            if ( nextcomma > -1 && nextcomma < nextnline ) {
                line[line.length] = text.substr( pos, nextcomma-pos );
                pos = nextcomma+1;
            } else {                                    // end of line
                line[line.length] = text.substr( pos, nextnline-pos );
                pos = nextnline+1;
                break;
            }
        }
        if ( line.length >= 0 ) {
            table[table.length] = line;                 // push line
        }
    }
    if ( table.length < 0 ) return;                     // null data
    return table;
};

// ================================================================
//  class: JKL.ParseXML.CSVmap

JKL.ParseXML.CSVmap = function ( url, query, method ) {
    // debug.print( "new JKL.ParseXML.CSVmap( '"+url+"', '"+query+"', '"+method+"' );" );
    this.http = new JKL.ParseXML.HTTP( url, query, method, true );
    return this;
};

JKL.ParseXML.CSVmap.prototype.parse = JKL.ParseXML.prototype.parse;
JKL.ParseXML.CSVmap.prototype.async = JKL.ParseXML.prototype.async;
JKL.ParseXML.CSVmap.prototype.onerror = JKL.ParseXML.prototype.onerror;
JKL.ParseXML.CSVmap.prototype.parseCSV = JKL.ParseXML.CSV.prototype.parseCSV;

JKL.ParseXML.CSVmap.prototype.parseResponse = function () {
    var text = this.http.responseText();
    var source = this.parseCSV( text );
    if ( ! source ) return;
    if ( source.length < 0 ) return;

    var title = source.shift();                 // first line as title
    var data = [];
    for( var i=0; i<source.length; i++ ) {
        var hash = {};
        for( var j=0; j<title.length && j<source[i].length; j++ ) {
            hash[title[j]] = source[i][j];      // array to map
        }
        data[data.length] = hash;               // push line
    }
    return data;
}

// ================================================================
//  class: JKL.ParseXML.LoadVars

JKL.ParseXML.LoadVars = function ( url, query, method ) {
    // debug.print( "new JKL.ParseXML.LoadVars( '"+url+"', '"+query+"', '"+method+"' );" );
    this.http = new JKL.ParseXML.HTTP( url, query, method, true );
    return this;
};

JKL.ParseXML.LoadVars.prototype.parse = JKL.ParseXML.prototype.parse;
JKL.ParseXML.LoadVars.prototype.async = JKL.ParseXML.prototype.async;
JKL.ParseXML.LoadVars.prototype.onerror = JKL.ParseXML.prototype.onerror;

JKL.ParseXML.LoadVars.prototype.parseResponse = function () {
    var text = this.http.responseText();
    text = text.replace( /\r\n?/g, "\n" );              // new line character
    var hash = {};
    var list = text.split( "&" );
    for( var i=0; i<list.length; i++ ) {
        var eq = list[i].indexOf( "=" );
        if ( eq > -1 ) {
            var key = decodeURIComponent(list[i].substr(0,eq).replace("+","%20"));
            var val = decodeURIComponent(list[i].substr(eq+1).replace("+","%20"));
            hash[key] = val;
        } else {
            hash[list[i]] = "";
        }
    }
    return hash;
};

// ================================================================
//  class: JKL.ParseXML.HTTP
//  constructer: new JKL.ParseXML.HTTP()

JKL.ParseXML.HTTP = function( url, query, method, textmode ) {
    // debug.print( "new JKL.ParseXML.HTTP( '"+url+"', '"+query+"', '"+method+"', '"+textmode+"' );" );
    this.url = url;
    if ( typeof(query) == "string" ) {
        this.query = query;
    } else {
        this.query = "";
    }
    if ( method ) {
        this.method = method;
    } else if ( typeof(query) == "string" ) {
        this.method = "POST";
    } else {
        this.method = "GET";
    }
    this.textmode = textmode ? true : false;
    this.req = null;
    this.xmldom_flag = false;
    this.onerror_func  = null;
    this.callback_func = null;
    this.already_done = null;
    return this;
};

// ================================================================
//  class variables

JKL.ParseXML.HTTP.REQUEST_TYPE  = "application/x-www-form-urlencoded";
JKL.ParseXML.HTTP.ACTIVEX_XMLDOM  = "Microsoft.XMLDOM";  // Msxml2.DOMDocument.5.0
JKL.ParseXML.HTTP.ACTIVEX_XMLHTTP = "Microsoft.XMLHTTP"; // Msxml2.XMLHTTP.3.0
JKL.ParseXML.HTTP.EPOCH_TIMESTAMP = "Thu, 01 Jun 1970 00:00:00 GMT"

// ================================================================

JKL.ParseXML.HTTP.prototype.onerror = JKL.ParseXML.prototype.onerror;
JKL.ParseXML.HTTP.prototype.async = function( func ) {
    this.async_func = func;
}

// ================================================================
//  [IE+IXMLDOMElement]
//      XML     text/xml            OK
//      XML     application/rdf+xml OK
//      TEXT    text/plain          NG
//      TEXT    others              NG
//  [IE+IXMLHttpRequest]
//      XML     text/xml            OK
//      XML     application/rdf+xml NG
//      TEXT    text/plain          OK
//      TEXT    others              OK
//  [Firefox+XMLHttpRequest]
//      XML     text/xml            OK
//      XML     application/rdf+xml OK (overrideMimeType)
//      TEXT    text/plain          OK
//      TEXT    others              OK (overrideMimeType)
//  [Opera+XMLHttpRequest]
//      XML     text/xml            OK
//      XML     application/rdf+xml OK
//      TEXT    text/plain          OK
//      TEXT    others              OK
// ================================================================

JKL.ParseXML.HTTP.prototype.load = function() {
    // create XMLHttpRequest object
    if ( window.ActiveXObject ) {                           // IE5.5,6,7
        var activex = JKL.ParseXML.HTTP.ACTIVEX_XMLHTTP;    // IXMLHttpRequest
        if ( this.method == "GET" && ! this.textmode ) {
            // use IXMLDOMElement to accept any mime types
            // because overrideMimeType() is not available on IE6
            activex = JKL.ParseXML.HTTP.ACTIVEX_XMLDOM;     // IXMLDOMElement
        }
        // debug.print( "new ActiveXObject( '"+activex+"' )" );
        this.req = new ActiveXObject( activex );
    } else if ( window.XMLHttpRequest ) {                   // Firefox, Opera, iCab
        // debug.print( "new XMLHttpRequest()" );
        this.req = new XMLHttpRequest();
    }

    // async mode when call back function is specified
    var async_flag = this.async_func ? true : false;
    // debug.print( "async: "+ async_flag );

    // open for XMLHTTPRequest (not for IXMLDOMElement)
    if ( typeof(this.req.send) != "undefined" ) {
        // debug.print( "open( '"+this.method+"', '"+this.url+"', "+async_flag+" );" );
        this.req.open( this.method, this.url, async_flag );
    }

//  // If-Modified-Since: Thu, 01 Jun 1970 00:00:00 GMT
//  if ( typeof(this.req.setRequestHeader) != "undefined" ) {
//      // debug.print( "If-Modified-Since"+JKL.ParseXML.HTTP.EPOCH_TIMESTAMP );
//      this.req.setRequestHeader( "If-Modified-Since", JKL.ParseXML.HTTP.EPOCH_TIMESTAMP );
//  }

    // Content-Type: application/x-www-form-urlencoded (request header)
    // Some server does not accept without request content-type.
    if ( typeof(this.req.setRequestHeader) != "undefined" ) {
        // debug.print( "Content-Type: "+JKL.ParseXML.HTTP.REQUEST_TYPE+" (request)" );
        this.req.setRequestHeader( "Content-Type", JKL.ParseXML.HTTP.REQUEST_TYPE );
    }

    // Content-Type: text/xml (response header)
    // FireFox does not accept other mime types like application/rdf+xml etc.
    if ( typeof(this.req.overrideMimeType) != "undefined" && ! this.textmode ) {
        // debug.print( "Content-Type: "+JKL.ParseXML.MIME_TYPE_XML+" (response)" );
        this.req.overrideMimeType( JKL.ParseXML.MIME_TYPE_XML );
    }

    // set call back handler when async mode
    if ( async_flag ) {
        var copy = this;
        copy.already_done = false;                  // not parsed yet
        var check_func = function () {
            if ( copy.req.readyState != 4 ) return;
            // debug.print( "readyState(async): "+copy.req.readyState );
            var succeed = copy.checkResponse();
            // debug.print( "checkResponse(async): "+succeed );
            if ( ! succeed ) return;                // failed
            if ( copy.already_done ) return;        // parse only once
            copy.already_done = true;               // already parsed
            copy.async_func();                      // call back async
        };
        this.req.onreadystatechange = check_func;
        // for document.implementation.createDocument
        // this.req.onload = check_func;
    }

    // send the request and query string
    if ( typeof(this.req.send) != "undefined" ) {
        // debug.print( "XMLHTTPRequest: send( '"+this.query+"' );" );
        this.req.send( this.query );                        // XMLHTTPRequest
    } else if ( typeof(this.req.load) != "undefined" ) {
        // debug.print( "IXMLDOMElement: load( '"+this.url+"' );" );
        this.req.async = async_flag;
        this.req.load( this.url );                          // IXMLDOMElement
    }

    // just return when async mode
    if ( async_flag ) return;

    var succeed = this.checkResponse();
    // debug.print( "checkResponse(sync): "+succeed );
}

// ================================================================
//  method: checkResponse()

JKL.ParseXML.HTTP.prototype.checkResponse = function() {
    // parseError on IXMLDOMElement
    if ( this.req.parseError && this.req.parseError.errorCode != 0 ) {
        // debug.print( "parseError: "+this.req.parseError.reason );
        if ( this.onerror_func ) this.onerror_func( this.req.parseError.reason );
        return false;                       // failed
    }

    // HTTP response code
    if ( this.req.status-0 > 0 &&
         this.req.status != 200 &&          // OK
         this.req.status != 206 &&          // Partial Content
         this.req.status != 304 ) {         // Not Modified
        // debug.print( "status: "+this.req.status );
        if ( this.onerror_func ) this.onerror_func( this.req.status );
        return false;                       // failed
    }

    return true;                            // succeed
}

// ================================================================
//  method: documentElement()
//  return: XML DOM in response body

JKL.ParseXML.HTTP.prototype.documentElement = function() {
    // debug.print( "documentElement: "+this.req );
    if ( ! this.req ) return;
    if ( this.req.responseXML ) {
        return this.req.responseXML.documentElement;    // XMLHTTPRequest
    } else {
        return this.req.documentElement;                // IXMLDOMDocument
    }
}

// ================================================================
//  method: responseText()
//  return: text string in response body

JKL.ParseXML.HTTP.prototype.responseText = function() {
    // debug.print( "responseText: "+this.req );
    if ( ! this.req ) return;

    //  Safari and Konqueror cannot understand the encoding of text files.
    if ( navigator.appVersion.match( "KHTML" ) ) {
        var esc = escape( this.req.responseText );
//        debug.print( "escape: "+esc );
        if ( ! esc.match("%u") && esc.match("%") ) {
            return decodeURIComponent(esc);
        }
    }

    return this.req.responseText;
}

// ================================================================
//  http://msdn.microsoft.com/library/en-us/xmlsdk/html/d051f7c5-e882-42e8-a5b6-d1ce67af275c.asp
// ================================================================
