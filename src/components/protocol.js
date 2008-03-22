// components defined in this file
const FOXTRICKPROT_HANDLER_CONTRACTID 	= "@mozilla.org/network/protocol;1?name=foxtrick";
const FOXTRICKPROT_HANDLER_CID 			= Components.ID("{ec361ab6-5abc-11da-8bde-f66bad1e3f3a}");

// components used in this file
const NS_IOSERVICE_CID 				= "{9ac9e770-18bc-11d3-9337-00104ba0fd40}";
const URI_CONTRACTID 				= "@mozilla.org/network/simple-uri;1";

// interfaces used in this file
const nsIProtocolHandler    		= Components.interfaces.nsIProtocolHandler;
const nsIURI                		= Components.interfaces.nsIURI;


/***** FoxtrickProtocolHandler *****/

function FoxtrickProtocolHandler(scheme)
{
    this.scheme = scheme;
}

// attribute defaults
FoxtrickProtocolHandler.prototype.defaultPort = -1;
FoxtrickProtocolHandler.prototype.protocolFlags = nsIProtocolHandler.URI_NORELATIVE && nsIProtocolHandler.URI_IS_UI_RESOURCE;

FoxtrickProtocolHandler.prototype.allowPort = function(aPort, aScheme)
{
    return false;
}


FoxtrickProtocolHandler.prototype.newURI = function(aSpec, aCharset, aBaseURI)
{
    var uri = Components.classes[URI_CONTRACTID].createInstance(nsIURI);
    uri.spec = aSpec;
    return uri;
}

FoxtrickProtocolHandler.prototype.newChannel = function(aURI)
{
    var temp = aURI.path.replace(/^\/\//,  "");
    if (temp.search(/\.\./) > -1) temp = "";
    
    var dirLocator = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties);
    var cssSkinsDir = dirLocator.get("ProfD", Components.interfaces.nsILocalFile);
    cssSkinsDir.appendRelativePath("foxtrick");
    
    var urlCreator = Components.classes["@mozilla.org/network/protocol;1?name=file"].getService(Components.interfaces.nsIFileProtocolHandler);
    var url = urlCreator.getURLSpecFromFile(cssSkinsDir) + temp;
       
    var ioServ = Components.classesByID[NS_IOSERVICE_CID].getService();
    ioServ = ioServ.QueryInterface(Components.interfaces.nsIIOService);
    var uri = ioServ.newURI(url, null, null);
    var chan = ioServ.newChannelFromURI(uri);

    return chan;


}

/***** FoxtrickProtocolHandlerFactory *****/

function FoxtrickProtocolHandlerFactory(scheme)
{
    this.scheme = scheme;
}

FoxtrickProtocolHandlerFactory.prototype.createInstance = function(outer, iid)
{
    if(outer != null) throw Components.results.NS_ERROR_NO_AGGREGATION;

    if(!iid.equals(nsIProtocolHandler) && !iid.equals(Components.interfaces.nsISupports))
        throw Components.results.NS_ERROR_INVALID_ARG;

    return new FoxtrickProtocolHandler(this.scheme);
}

var factory_Foxtrick = new FoxtrickProtocolHandlerFactory("foxtrick");

/***** FoxtrickModule *****/

var FoxtrickModule = new Object();

FoxtrickModule.registerSelf = function(compMgr, fileSpec, location, type)
{
    compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
    compMgr.registerFactoryLocation(FOXTRICKPROT_HANDLER_CID,
                                    "Foxtrick protocol handler",
                                    FOXTRICKPROT_HANDLER_CONTRACTID,
                                    fileSpec, location, type);

}

FoxtrickModule.unregisterSelf = function(compMgr, fileSpec, location)
{
    compMgr = compMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);

    // unregister our components
    compMgr.unregisterFactoryLocation(FOXTRICKPROT_HANDLER_CID, fileSpec);
}

FoxtrickModule.getClassObject = function(compMgr, cid, iid)
{
    if(!iid.equals(Components.interfaces.nsIFactory))
        throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

    if(cid.equals(FOXTRICKPROT_HANDLER_CID)) return factory_Foxtrick;

    throw Components.results.NS_ERROR_NO_INTERFACE;
}

FoxtrickModule.canUnload = function(compMgr)
{
    return true;    // our objects can be unloaded
}

/***** Entrypoint *****/

function NSGetModule(compMgr, fileSpec)
{
    return FoxtrickModule;
}
