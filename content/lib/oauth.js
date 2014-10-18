/*
 * Copyright 2008 Netflix, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* Here's some JavaScript software for implementing Foxtrick.OAuth.

   This isn't as useful as you might hope.  Foxtrick.OAuth is based around
   allowing tools and websites to talk to each other.  However,
   JavaScript running in web browsers is hampered by security
   restrictions that prevent code running on one website from
   accessing data stored or served on another.

   Before you start hacking, make sure you understand the limitations
   posed by cross-domain XMLHttpRequest.

   On the bright side, some platforms use JavaScript as their
   language, but enable the programmer to access other web sites.
   Examples include Google Gadgets, and Microsoft Vista Sidebar.
   For those platforms, this library should come in handy.
*/

// The HMAC-SHA1 signature method calls b64_hmac_sha1, defined by
// http://pajhome.org.uk/crypt/md5/sha1.js

/* An OAuth message is represented as an object like this:
   {method: "GET", action: "http://server.com/path", parameters: ...}

   The parameters may be either a map {name: value, name2: value2}
   or an Array of name-value pairs [[name, value], [name2, value2]].
   The latter representation is more powerful: it supports parameters
   in a specific sequence, or several parameters with the same name;
   for example [["a", 1], ["b", 2], ["a", 3]].

   Parameter names and values are NOT percent-encoded in an object.
   They must be encoded before transmission and decoded after reception.
   For example, this message object:
   {method: "GET", action: "http://server/path", parameters: {p: "x y"}}
   ... can be transmitted as an HTTP request that begins:
   GET /path?p=x%20y HTTP/1.0
   (This isn't a valid Foxtrick.OAuth request, since it lacks a signature etc.)
   Note that the object "x y" is transmitted as x%20y.  To encode
   parameters, you can call Foxtrick.OAuth.addToURL, Foxtrick.OAuth.formEncode or
   Foxtrick.OAuth.getAuthorization.

   This message object model harmonizes with the browser object model for
   input elements of an form, whose value property isn't percent encoded.
   The browser encodes each value before transmitting it. For example,
   see consumer.setInputs in example/consumer.js.
 */

/* This script needs to know what time it is. By default, it uses the local
   clock (new Date), which is apt to be inaccurate in browsers. To do
   better, you can load this script from a URL whose query string contains
   an oauth_timestamp parameter, whose value is a current Unix timestamp.
   For example, when generating the enclosing document using PHP:

   <script src="oauth.js?oauth_timestamp=<?=time()?>" ...

   Another option is to call Foxtrick.OAuth.correctTimestamp with a Unix timestamp.
 */

/* Change Log
 *
 * 2011-04-22 Ryan Li <ryan@ryanium.com>
 *   * Add rename OAuth to Foxtrick.OAuth to prevent namespace conflicts
 *     in Firefox.
 */

if (!Foxtrick)
	var Foxtrick = this.Foxtrick;

Foxtrick.OAuth = {};

Foxtrick.OAuth.setProperties = function setProperties(into, from) {
    if (into != null && from != null) {
        for (var key in from) {
            into[key] = from[key];
        }
    }
    return into;
}

Foxtrick.OAuth.setProperties(Foxtrick.OAuth, // utility functions
{
    percentEncode: function percentEncode(s) {
        if (s == null) {
            return "";
        }
        if (s instanceof Array) {
            var e = "";
            for (var i = 0; i < s.length; ++s) {
                if (e != "") e += '&';
                e += Foxtrick.OAuth.percentEncode(s[i]);
            }
            return e;
        }
        s = encodeURIComponent(s);
        // Now replace the values which encodeURIComponent doesn't do
        // encodeURIComponent ignores: - _ . ! ~ * ' ( )
        // OAuth dictates the only ones you can ignore are: - _ . ~
        // Source: http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Functions:encodeURIComponent
        s = s.replace(/\!/g, "%21");
        s = s.replace(/\*/g, "%2A");
        s = s.replace(/\'/g, "%27");
        s = s.replace(/\(/g, "%28");
        s = s.replace(/\)/g, "%29");
        return s;
    }
,
    decodePercent: function decodePercent(s) {
        if (s != null) {
            // Handle application/x-www-form-urlencoded, which is defined by
            // http://www.w3.org/TR/html4/interact/forms.html#h-17.13.4.1
            s = s.replace(/\+/g, " ");
        }
        return decodeURIComponent(s);
    }
,
    /** Convert the given parameters to an Array of name-value pairs. */
    getParameterList: function getParameterList(parameters) {
        if (parameters == null) {
            return [];
        }
        if (typeof parameters != "object") {
            return Foxtrick.OAuth.decodeForm(parameters + "");
        }
        if (parameters instanceof Array) {
            return parameters;
        }
        var list = [];
        for (var p in parameters) {
            list.push([p, parameters[p]]);
        }
        return list;
    }
,
    /** Convert the given parameters to a map from name to value. */
    getParameterMap: function getParameterMap(parameters) {
        if (parameters == null) {
            return {};
        }
        if (typeof parameters != "object") {
            return Foxtrick.OAuth.getParameterMap(Foxtrick.OAuth.decodeForm(parameters + ""));
        }
        if (parameters instanceof Array) {
            var map = {};
            for (var p = 0; p < parameters.length; ++p) {
                var key = parameters[p][0];
                if (map[key] === undefined) { // first value wins
                    map[key] = parameters[p][1];
                }
            }
            return map;
        }
        return parameters;
    }
,
    getParameter: function getParameter(parameters, name) {
        if (parameters instanceof Array) {
            for (var p = 0; p < parameters.length; ++p) {
                if (parameters[p][0] == name) {
                    return parameters[p][1]; // first value wins
                }
            }
        } else {
            return Foxtrick.OAuth.getParameterMap(parameters)[name];
        }
        return null;
    }
,
    formEncode: function formEncode(parameters) {
        var form = "";
        var list = Foxtrick.OAuth.getParameterList(parameters);
        for (var p = 0; p < list.length; ++p) {
            var value = list[p][1];
            if (value == null) value = "";
            if (form != "") form += '&';
            form += Foxtrick.OAuth.percentEncode(list[p][0])
              +'='+ Foxtrick.OAuth.percentEncode(value);
        }
        return form;
    }
,
    decodeForm: function decodeForm(form) {
        var list = [];
        var nvps = form.split('&');
        for (var n = 0; n < nvps.length; ++n) {
            var nvp = nvps[n];
            if (nvp == "") {
                continue;
            }
            var equals = nvp.indexOf('=');
            var name;
            var value;
            if (equals < 0) {
                name = Foxtrick.OAuth.decodePercent(nvp);
                value = null;
            } else {
                name = Foxtrick.OAuth.decodePercent(nvp.substring(0, equals));
                value = Foxtrick.OAuth.decodePercent(nvp.substring(equals + 1));
            }
            list.push([name, value]);
        }
        return list;
    }
,
    setParameter: function setParameter(message, name, value) {
        var parameters = message.parameters;
        if (parameters instanceof Array) {
            for (var p = 0; p < parameters.length; ++p) {
                if (parameters[p][0] == name) {
                    if (value === undefined) {
                        parameters.splice(p, 1);
                    } else {
                        parameters[p][1] = value;
                        value = undefined;
                    }
                }
            }
            if (value !== undefined) {
                parameters.push([name, value]);
            }
        } else {
            parameters = Foxtrick.OAuth.getParameterMap(parameters);
            parameters[name] = value;
            message.parameters = parameters;
        }
    }
,
    setParameters: function setParameters(message, parameters) {
        var list = Foxtrick.OAuth.getParameterList(parameters);
        for (var i = 0; i < list.length; ++i) {
            Foxtrick.OAuth.setParameter(message, list[i][0], list[i][1]);
        }
    }
,
    /** Fill in parameters to help construct a request message.
        This function doesn't fill in every parameter.
        The accessor object should be like:
        {consumerKey:'foo', consumerSecret:'bar', accessorSecret:'nurn', token:'krelm', tokenSecret:'blah'}
        The accessorSecret property is optional.
     */
    completeRequest: function completeRequest(message, accessor) {
        if (message.method == null) {
            message.method = "GET";
        }
        var map = Foxtrick.OAuth.getParameterMap(message.parameters);
        if (map.oauth_consumer_key == null) {
            Foxtrick.OAuth.setParameter(message, "oauth_consumer_key", accessor.consumerKey || "");
        }
        if (map.oauth_token == null && accessor.token != null) {
            Foxtrick.OAuth.setParameter(message, "oauth_token", accessor.token);
        }
        if (map.oauth_version == null) {
            Foxtrick.OAuth.setParameter(message, "oauth_version", "1.0");
        }
        if (map.oauth_timestamp == null) {
            Foxtrick.OAuth.setParameter(message, "oauth_timestamp", Foxtrick.OAuth.timestamp());
        }
        if (map.oauth_nonce == null) {
            Foxtrick.OAuth.setParameter(message, "oauth_nonce", Foxtrick.OAuth.nonce(6));
        }
        Foxtrick.OAuth.SignatureMethod.sign(message, accessor);
    }
,
    setTimestampAndNonce: function setTimestampAndNonce(message) {
        Foxtrick.OAuth.setParameter(message, "oauth_timestamp", Foxtrick.OAuth.timestamp());
        Foxtrick.OAuth.setParameter(message, "oauth_nonce", Foxtrick.OAuth.nonce(6));
    }
,
    addToURL: function addToURL(url, parameters) {
        var newURL = url;
        if (parameters != null) {
            var toAdd = Foxtrick.OAuth.formEncode(parameters);
            if (toAdd.length > 0) {
                var q = url.indexOf('?');
                if (q < 0) newURL += '?';
                else       newURL += '&';
                newURL += toAdd;
            }
        }
        return newURL;
    }
,
    /** Construct the value of the Authorization header for an HTTP request. */
    getAuthorizationHeader: function getAuthorizationHeader(realm, parameters) {
        var header = 'Foxtrick.OAuth realm="' + Foxtrick.OAuth.percentEncode(realm) + '"';
        var list = Foxtrick.OAuth.getParameterList(parameters);
        for (var p = 0; p < list.length; ++p) {
            var parameter = list[p];
            var name = parameter[0];
            if (name.indexOf("oauth_") == 0) {
                header += ',' + Foxtrick.OAuth.percentEncode(name) + '="' + Foxtrick.OAuth.percentEncode(parameter[1]) + '"';
            }
        }
        return header;
    }
,
    /** Correct the time using a parameter from the URL from which the last script was loaded. */
    correctTimestampFromSrc: function correctTimestampFromSrc(parameterName) {
        parameterName = parameterName || "oauth_timestamp";
        var scripts = document.getElementsByTagName('script');
        if (scripts == null || !scripts.length) return;
        var src = scripts[scripts.length-1].src;
        if (!src) return;
        var q = src.indexOf("?");
        if (q < 0) return;
        parameters = Foxtrick.OAuth.getParameterMap(Foxtrick.OAuth.decodeForm(src.substring(q+1)));
        var t = parameters[parameterName];
        if (t == null) return;
        Foxtrick.OAuth.correctTimestamp(t);
    }
,
    /** Generate timestamps starting with the given value. */
    correctTimestamp: function correctTimestamp(timestamp) {
        Foxtrick.OAuth.timeCorrectionMsec = (timestamp * 1000) - (new Date()).getTime();
    }
,
    /** The difference between the correct time and my clock. */
    timeCorrectionMsec: 0
,
    timestamp: function timestamp() {
        var t = (new Date()).getTime() + Foxtrick.OAuth.timeCorrectionMsec;
        return Math.floor(t / 1000);
    }
,
    nonce: function nonce(length) {
        var chars = Foxtrick.OAuth.nonce.CHARS;
        var result = "";
        for (var i = 0; i < length; ++i) {
            var rnum = Math.floor(Math.random() * chars.length);
            result += chars.substring(rnum, rnum+1);
        }
        return result;
    }
});

Foxtrick.OAuth.nonce.CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";

/** Define a constructor function,
    without causing trouble to anyone who was using it as a namespace.
    That is, if parent[name] already existed and had properties,
    copy those properties into the new constructor.
 */
Foxtrick.OAuth.declareClass = function declareClass(parent, name, newConstructor) {
    var previous = parent[name];
    parent[name] = newConstructor;
    if (newConstructor != null && previous != null) {
        for (var key in previous) {
            if (key != "prototype") {
                newConstructor[key] = previous[key];
            }
        }
    }
    return newConstructor;
}

/** An abstract algorithm for signing messages. */
Foxtrick.OAuth.declareClass(Foxtrick.OAuth, "SignatureMethod", function OAuthSignatureMethod(){});

Foxtrick.OAuth.setProperties(Foxtrick.OAuth.SignatureMethod.prototype, // instance members
{
    /** Add a signature to the message. */
    sign: function sign(message) {
        var baseString = Foxtrick.OAuth.SignatureMethod.getBaseString(message);
        var signature = this.getSignature(baseString);
        Foxtrick.OAuth.setParameter(message, "oauth_signature", signature);
        return signature; // just in case someone's interested
    }
,
    /** Set the key string for signing. */
    initialize: function initialize(name, accessor) {
        var consumerSecret;
        if (accessor.accessorSecret != null
            && name.length > 9
            && name.substring(name.length-9) == "-Accessor")
        {
            consumerSecret = accessor.accessorSecret;
        } else {
            consumerSecret = accessor.consumerSecret;
        }
        this.key = Foxtrick.OAuth.percentEncode(consumerSecret)
             +"&"+ Foxtrick.OAuth.percentEncode(accessor.tokenSecret);
    }
});

/* SignatureMethod expects an accessor object to be like this:
   {tokenSecret: "lakjsdflkj...", consumerSecret: "QOUEWRI..", accessorSecret: "xcmvzc..."}
   The accessorSecret property is optional.
 */
// Class members:
Foxtrick.OAuth.setProperties(Foxtrick.OAuth.SignatureMethod, // class members
{
    sign: function sign(message, accessor) {
        var name = Foxtrick.OAuth.getParameterMap(message.parameters).oauth_signature_method;
        if (name == null || name == "") {
            name = "HMAC-SHA1";
            Foxtrick.OAuth.setParameter(message, "oauth_signature_method", name);
        }
        Foxtrick.OAuth.SignatureMethod.newMethod(name, accessor).sign(message);
    }
,
    /** Instantiate a SignatureMethod for the given method name. */
    newMethod: function newMethod(name, accessor) {
        var impl = Foxtrick.OAuth.SignatureMethod.REGISTERED[name];
        if (impl != null) {
            var method = new impl();
            method.initialize(name, accessor);
            return method;
        }
        var err = new Error("signature_method_rejected");
        var acceptable = "";
        for (var r in Foxtrick.OAuth.SignatureMethod.REGISTERED) {
            if (acceptable != "") acceptable += '&';
            acceptable += Foxtrick.OAuth.percentEncode(r);
        }
        err.oauth_acceptable_signature_methods = acceptable;
        throw err;
    }
,
    /** A map from signature method name to constructor. */
    REGISTERED : {}
,
    /** Subsequently, the given constructor will be used for the named methods.
        The constructor will be called with no parameters.
        The resulting object should usually implement getSignature(baseString).
        You can easily define such a constructor by calling makeSubclass, below.
     */
    registerMethodClass: function registerMethodClass(names, classConstructor) {
        for (var n = 0; n < names.length; ++n) {
            Foxtrick.OAuth.SignatureMethod.REGISTERED[names[n]] = classConstructor;
        }
    }
,
    /** Create a subclass of Foxtrick.OAuth.SignatureMethod, with the given getSignature function. */
    makeSubclass: function makeSubclass(getSignatureFunction) {
        var superClass = Foxtrick.OAuth.SignatureMethod;
        var subClass = function() {
            superClass.call(this);
        };
        subClass.prototype = new superClass();
        // Delete instance variables from prototype:
        // delete subclass.prototype... There aren't any.
        subClass.prototype.getSignature = getSignatureFunction;
        subClass.prototype.constructor = subClass;
        return subClass;
    }
,
    getBaseString: function getBaseString(message) {
        var URL = message.action;
        var q = URL.indexOf('?');
        var parameters;
        if (q < 0) {
            parameters = message.parameters;
        } else {
            // Combine the URL query string with the other parameters:
            parameters = Foxtrick.OAuth.decodeForm(URL.substring(q + 1));
            var toAdd = Foxtrick.OAuth.getParameterList(message.parameters);
            for (var a = 0; a < toAdd.length; ++a) {
                parameters.push(toAdd[a]);
            }
        }
        return Foxtrick.OAuth.percentEncode(message.method.toUpperCase())
         +'&'+ Foxtrick.OAuth.percentEncode(Foxtrick.OAuth.SignatureMethod.normalizeUrl(URL))
         +'&'+ Foxtrick.OAuth.percentEncode(Foxtrick.OAuth.SignatureMethod.normalizeParameters(parameters));
    }
,
    normalizeUrl: function normalizeUrl(url) {
        var uri = Foxtrick.OAuth.SignatureMethod.parseUri(url);
        var scheme = uri.protocol.toLowerCase();
        var authority = uri.authority.toLowerCase();
        var dropPort = (scheme == "http" && uri.port == 80)
                    || (scheme == "https" && uri.port == 443);
        if (dropPort) {
            // find the last : in the authority
            var index = authority.lastIndexOf(":");
            if (index >= 0) {
                authority = authority.substring(0, index);
            }
        }
        var path = uri.path;
        if (!path) {
            path = "/"; // conforms to RFC 2616 section 3.2.2
        }
        // we know that there is no query and no fragment here.
        return scheme + "://" + authority + path;
    }
,
    parseUri: function parseUri (str) {
        /* This function was adapted from parseUri 1.2.1
           http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
         */
        var o = {key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
                 parser: {strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@\/]*):?([^:@\/]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/ }};
        var m = o.parser.strict.exec(str);
        var uri = {};
        var i = 14;
        while (i--) uri[o.key[i]] = m[i] || "";
        return uri;
    }
,
    normalizeParameters: function normalizeParameters(parameters) {
        if (parameters == null) {
            return "";
        }
        var list = Foxtrick.OAuth.getParameterList(parameters);
        var sortable = [];
        for (var p = 0; p < list.length; ++p) {
            var nvp = list[p];
            if (nvp[0] != "oauth_signature") {
                sortable.push([ Foxtrick.OAuth.percentEncode(nvp[0])
                              + " " // because it comes before any character that can appear in a percentEncoded string.
                              + Foxtrick.OAuth.percentEncode(nvp[1])
                              , nvp]);
            }
        }
        sortable.sort(function(a,b) {
                          if (a[0] < b[0]) return  -1;
                          if (a[0] > b[0]) return 1;
                          return 0;
                      });
        var sorted = [];
        for (var s = 0; s < sortable.length; ++s) {
            sorted.push(sortable[s][1]);
        }
        return Foxtrick.OAuth.formEncode(sorted);
    }
});

Foxtrick.OAuth.SignatureMethod.registerMethodClass(["PLAINTEXT", "PLAINTEXT-Accessor"],
    Foxtrick.OAuth.SignatureMethod.makeSubclass(
        function getSignature(baseString) {
            return this.key;
        }
    ));

Foxtrick.OAuth.SignatureMethod.registerMethodClass(["HMAC-SHA1", "HMAC-SHA1-Accessor"],
    Foxtrick.OAuth.SignatureMethod.makeSubclass(
        function getSignature(baseString) {
            Foxtrick.SHA1.b64pad = '=';
            var signature = Foxtrick.SHA1.b64_hmac_sha1(this.key, baseString);
            return signature;
        }
    ));

try {
    Foxtrick.OAuth.correctTimestampFromSrc();
} catch(e) {
}
