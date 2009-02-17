/**
 * foxtrick.js
 * Foxtrick XPCOM
 * @author kolmis
 *  
 * https://developer.mozilla.org/en/Working_with_windows_in_chrome_code#Using_an_XPCOM_singleton_component
 * https://developer.mozilla.org/en/How_to_Build_an_XPCOM_Component_in_Javascript
 * the code is basically altered HelloWorld component from the link above   
 */

// reference to the interface defined in nsIFoxtrick.idl
const nsIFoxtrick = Components.interfaces.nsIFoxtrick;

// reference to the required base interface that all components must support
const nsISupports = Components.interfaces.nsISupports;

// UUID uniquely identifying our component
// You can get from: http://kruithof.xs4all.nl/uuid/uuidgen here
const CLASS_ID = Components.ID("{63184f50-ca68-11dd-ad8b-0800200c9a66}");

// description
const CLASS_NAME = "Foxtrick XPCOM Component";

// textual unique identifier
const CONTRACT_ID = "@foxtrick;1";

/***********************************************************
class definition
***********************************************************/

//class constructor
function FoxtrickService() {
    // If you only need to access your component from Javascript, uncomment the following line:
    this.wrappedJSObject = this;
    this.load();
};

// class definition
FoxtrickService.prototype = {

  load: function() {
    var loader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"]
                           .getService(Components.interfaces.mozIJSSubScriptLoader);
    loader.loadSubScript('chrome://foxtrick/content/loader.js');
  },

  getFoxtrick: function() {
      return Foxtrick;
  },

  getFoxtrickMain: function() {
      return FoxtrickMain;
  },
  
  getFoxtrickPrefs: function() {
      return FoxtrickPrefs;
  },
  
  getFoxtrickl10n: function() {
      return Foxtrickl10n;
  },

  QueryInterface: function(aIID)
  {
    if (!aIID.equals(nsIFoxtrick) &&    
        !aIID.equals(nsISupports))
      throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
  }
};

/***********************************************************
class factory

This object is a member of the global-scope Components.classes.
It is keyed off of the contract ID. Eg:

myFoxtrickService = Components.classes["@foxtrick;1"].
                          createInstance(Components.interfaces.nsIFoxtrick);

***********************************************************/
var FoxtrickFactory = {
  createInstance: function (aOuter, aIID)
  {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    return (new FoxtrickService()).QueryInterface(aIID);
  }
};

/***********************************************************
module definition (xpcom registration)
***********************************************************/
var FoxtrickModule = {
  registerSelf: function(aCompMgr, aFileSpec, aLocation, aType)
  {
    aCompMgr = aCompMgr.
        QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.registerFactoryLocation(CLASS_ID, CLASS_NAME, 
        CONTRACT_ID, aFileSpec, aLocation, aType);
  },

  unregisterSelf: function(aCompMgr, aLocation, aType)
  {
    aCompMgr = aCompMgr.
        QueryInterface(Components.interfaces.nsIComponentRegistrar);
    aCompMgr.unregisterFactoryLocation(CLASS_ID, aLocation);        
  },
  
  getClassObject: function(aCompMgr, aCID, aIID)
  {
    if (!aIID.equals(Components.interfaces.nsIFactory))
      throw Components.results.NS_ERROR_NOT_IMPLEMENTED;

    if (aCID.equals(CLASS_ID))
      return FoxtrickFactory;

    throw Components.results.NS_ERROR_NO_INTERFACE;
  },

  canUnload: function(aCompMgr) { return true; }
};

/***********************************************************
module initialization

When the application registers the component, this function
is called.
***********************************************************/
function NSGetModule(aCompMgr, aFileSpec) { return FoxtrickModule; }
